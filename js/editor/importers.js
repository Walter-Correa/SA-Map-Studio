// Importação universal: descobre sozinho o formato do arquivo (qualquer extensão)
// e devolve os objetos, trocas de textura/texto, veículos, prédios removidos e câmeras.
//
// Formatos reconhecidos:
//   - Código Pawn (CreateObject, CreateDynamicObject, SetObjectMaterial[Text], RemoveBuildingForPlayer,
//     veículos, câmeras): Map Construction, Texture Studio, Fusez, exportações em geral
//   - Banco SQLite (mapas salvos do Texture Studio e editores parecidos)
//   - Projeto do SA Map Studio (.json) e listas JSON de objetos
//   - Mapa do MTA (.map, XML)
//   - IPL de texto e IPL binário ("bnry") do GTA
//   - Linhas soltas "modelo x y z rx ry rz"
import { parsePwn, isVehicleModel } from './pwn.js';
import { normalizeMaterial, formatColor, parseColor, MAX_MATERIAL_INDEX } from './materials.js';
import { parseIplText } from '../formats/text.js';
import { isBinaryIpl, parseIplBinary } from '../formats/iplbin.js';

const empty = () => ({ format: '', name: '', objects: [], vehicles: [], actors: [], removed: [], labels: [], pickups: [], gangZones: [], textDraws: [], cameras: { shots: [], paths: [] }, camera: null, pwnHeader: '', rawPawn: '', spawn: null, notes: [] });

// Texto: UTF-8 quando válido, senão Windows-1252 (o padrão do Pawn no Windows)
export function decodeBytes(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let start = 0;
  if (u8[0] === 0xef && u8[1] === 0xbb && u8[2] === 0xbf) start = 3;
  if (u8[0] === 0xff && u8[1] === 0xfe) return new TextDecoder('utf-16le').decode(u8.subarray(2));
  if (u8[0] === 0xfe && u8[1] === 0xff) return new TextDecoder('utf-16be').decode(u8.subarray(2));
  try { return new TextDecoder('utf-8', { fatal: true }).decode(u8.subarray(start)); }
  catch { return new TextDecoder('windows-1252').decode(u8.subarray(start)); }
}

const startsWith = (u8, ascii) => [...ascii].every((c, i) => u8[i] === c.charCodeAt(0));

// Quaternion do IPL (conjugado no GTA) -> rotação em graus na ordem ZXY do SA-MP
export function iplQuatToEuler(qx, qy, qz, qw) {
  const x = -qx, y = -qy, z = -qz, w = qw;
  const m12 = 2 * (x * y - z * w), m22 = 1 - 2 * (x * x + z * z);
  const m31 = 2 * (x * z - y * w), m32 = 2 * (y * z + x * w), m33 = 1 - 2 * (x * x + y * y);
  const m11 = 1 - 2 * (y * y + z * z), m21 = 2 * (x * y + z * w);
  const ex = Math.asin(Math.max(-1, Math.min(1, m32)));
  let ey, ez;
  if (Math.abs(m32) < 0.9999999) { ey = Math.atan2(-m31, m33); ez = Math.atan2(-m12, m22); }
  else { ey = 0; ez = Math.atan2(m21, m11); }
  const deg = (r) => { let v = ((r * 180 / Math.PI) % 360 + 360) % 360; if (v > 359.9999) v = 0; return Math.round(v * 10000) / 10000; };
  return { rx: deg(ex), ry: deg(ey), rz: deg(ez) };
}

function fromIplInst(list, out) {
  for (const it of list) {
    const r = iplQuatToEuler(it.qx, it.qy, it.qz, it.qw);
    const interior = (it.interior | 0) & 0xff;
    out.objects.push({ model: it.id | 0, x: it.x, y: it.y, z: it.z, ...r, interior: interior > 0 && interior !== 13 ? interior : -1, world: -1, materials: [] });
  }
}

// ---------------------------------------------------------------- SQLite
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const COLS = {
  model: ['model', 'modelid', 'objectmodel', 'objmodel', 'carmodel', 'vehiclemodel', 'vmodel', 'skin'],
  x: ['x', 'xpos', 'posx', 'positionx', 'spawnx', 'carspawnx', 'px', 'ox'],
  y: ['y', 'ypos', 'posy', 'positiony', 'spawny', 'carspawny', 'py', 'oy'],
  z: ['z', 'zpos', 'posz', 'positionz', 'spawnz', 'carspawnz', 'pz', 'oz'],
  rx: ['rx', 'rxrot', 'rotx', 'rotationx', 'xrot', 'orx'],
  ry: ['ry', 'ryrot', 'roty', 'rotationy', 'yrot', 'ory'],
  rz: ['rz', 'rzrot', 'rotz', 'rotationz', 'zrot', 'orz', 'angle', 'a', 'rot', 'facing', 'carspawna', 'spawna'],
  radius: ['radius', 'range', 'raio'],
  interior: ['interior', 'interiorid', 'int'],
  world: ['world', 'worldid', 'vw', 'virtualworld', 'dimension'],
  stream: ['streamdistance', 'streamdist', 'sd'],
  draw: ['drawdistance', 'drawdist', 'dd'],
  c1: ['color1', 'col1', 'carcolor1', 'c1'],
  c2: ['color2', 'col2', 'carcolor2', 'c2'],
};
function findCol(columns, key) {
  const n = columns.map(norm);
  for (const want of COLS[key]) { const i = n.indexOf(want); if (i >= 0) return i; }
  return -1;
}
const numList = (v) => String(v ?? '').split(/[\s,;|]+/).filter(Boolean).map(t => parseColor(t));

function fromSqlite(tables, out) {
  let skippedTextures = 0;
  for (const [name, t] of Object.entries(tables)) {
    const c = t.columns;
    const ci = Object.fromEntries(Object.keys(COLS).map(k => [k, findCol(c, k)]));
    if (ci.model < 0 || ci.x < 0 || ci.y < 0 || ci.z < 0) continue;
    const lname = name.toLowerCase();
    const isRemoved = /remov|delet|building/.test(lname) && ci.rx < 0;
    const isVehicle = /veh|car/.test(lname);
    const n = c.map(norm);
    const col = (re) => n.findIndex(x => re.test(x));
    const texCol = col(/^textureindex$|^textures?$|^tex$/), colorCol = col(/^colorindex$|^colors?$/);
    const useText = col(/^usetext$/), textCol = col(/^objecttext$|^text$/), faceCol = col(/^fontface$|^font$/);
    const msizeCol = col(/^fontsize$|^materialsize$/), tsizeCol = col(/^textfontsize$/), boldCol = col(/^fontbold$|^bold$/);
    const fcolCol = col(/^fontcolor$/), bcolCol = col(/^backcolor$/), alignCol = col(/^alignment$|^align$/);
    for (const row of t.rows) {
      const g = (i, d = 0) => (i >= 0 && row[i] !== null && row[i] !== undefined && row[i] !== '' ? +row[i] : d);
      const base = { model: g(ci.model) | 0, x: g(ci.x), y: g(ci.y), z: g(ci.z) };
      if (!base.model) continue;
      if (isRemoved) { out.removed.push({ ...base, radius: g(ci.radius, 0.25) || 0.25 }); continue; }
      if (isVehicle || (isVehicleModel(base.model) && ci.rx < 0)) {
        out.vehicles.push({ ...base, rz: g(ci.rz), color1: g(ci.c1, -1) | 0, color2: g(ci.c2, -1) | 0, respawn: -1 });
        continue;
      }
      const obj = { ...base, rx: g(ci.rx), ry: g(ci.ry), rz: g(ci.rz), interior: g(ci.interior, -1) | 0, world: g(ci.world, -1) | 0,
        streamDist: Math.max(0, g(ci.stream)), drawDist: Math.max(0, g(ci.draw)), materials: [] };
      // Cores por índice (lista de 16 valores ARGB)
      if (colorCol >= 0) numList(row[colorCol]).slice(0, MAX_MATERIAL_INDEX + 1).forEach((v, i) => {
        if (v) obj.materials.push(normalizeMaterial({ index: i, model: -1, txd: 'none', texture: 'none', color: formatColor(v) }));
      });
      if (texCol >= 0 && numList(row[texCol]).some(v => v)) skippedTextures++;
      // Texto do Texture Studio (vai no índice 0)
      if (textCol >= 0 && row[textCol] && (useText < 0 || +row[useText])) {
        obj.materials = obj.materials.filter(m => m.index !== 0);
        obj.materials.push(normalizeMaterial({ kind: 'text', index: 0, text: String(row[textCol]),
          size: msizeCol >= 0 ? g(msizeCol, 90) : 90, font: faceCol >= 0 && isNaN(+row[faceCol]) ? row[faceCol] : 'Arial',
          fontSize: tsizeCol >= 0 ? g(tsizeCol, 24) : 24, bold: g(boldCol, 1), fontColor: fcolCol >= 0 ? formatColor(parseColor(row[fcolCol])) : '0xFFFFFFFF',
          backColor: bcolCol >= 0 ? formatColor(parseColor(row[bcolCol])) : '0', align: g(alignCol, 0) }));
      }
      out.objects.push(obj);
    }
  }
  if (skippedTextures) out.notes.push(`${skippedTextures} objetos usam texturas pela lista interna do Texture Studio, que não vem no banco. Para trazer as texturas, exporte o mapa como .pwn no Texture Studio (/export) e importe esse arquivo.`);
}

// ---------------------------------------------------------------- MTA (.map)
function fromMta(text, out) {
  const attrs = (s) => { const o = {}; for (const m of s.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)) o[m[1].toLowerCase()] = m[2]; return o; };
  for (const m of text.matchAll(/<\s*(object|removeworldobject|vehicle)\b([^>]*)>/gi)) {
    const kind = m[1].toLowerCase(), a = attrs(m[2]);
    const p = { x: +a.posx || 0, y: +a.posy || 0, z: +a.posz || 0 };
    if (kind === 'object') out.objects.push({ model: +a.model | 0, ...p, rx: +a.rotx || 0, ry: +a.roty || 0, rz: +a.rotz || 0, interior: a.interior ? (+a.interior || -1) : -1, world: a.dimension ? +a.dimension : -1, materials: [] });
    else if (kind === 'vehicle') out.vehicles.push({ model: +a.model | 0, ...p, rz: +a.rotz || 0, color1: -1, color2: -1, respawn: -1 });
    else {
      out.removed.push({ model: +a.model | 0, ...p, radius: +a.radius || 0.25 });
      if (+a.lodmodel) out.removed.push({ model: +a.lodmodel | 0, ...p, radius: +a.radius || 0.25 });
    }
  }
}

// ---------------------------------------------------------------- JSON
function fromJson(data, out) {
  const list = (v) => (Array.isArray(v) ? v : []);
  if (Array.isArray(data)) data = { objects: data };
  if (data.name) out.name = String(data.name);
  if (data.pwnHeader) out.pwnHeader = String(data.pwnHeader);
  if (data.rawPawn) out.rawPawn = String(data.rawPawn);
  if (data.camera) out.camera = data.camera;
  if (data.cameras) out.cameras = data.cameras;
  out.objects = list(data.objects || data.Objects).filter(o => o && (o.model ?? o.modelid ?? o.ModelID) !== undefined)
    .map(o => ({ ...o, model: +(o.model ?? o.modelid ?? o.ModelID) | 0, x: +(o.x ?? o.posX ?? o.xPos) || 0, y: +(o.y ?? o.posY ?? o.yPos) || 0, z: +(o.z ?? o.posZ ?? o.zPos) || 0,
      rx: +(o.rx ?? o.rotX ?? o.rxRot) || 0, ry: +(o.ry ?? o.rotY ?? o.ryRot) || 0, rz: +(o.rz ?? o.rotZ ?? o.rzRot) || 0, materials: o.materials || [] }));
  out.vehicles = list(data.vehicles || data.Vehicles);
  out.actors = list(data.actors || data.Actors);
  out.removed = list(data.removed || data.Removed);
  out.labels = list(data.labels || data.Labels);
  out.pickups = list(data.pickups || data.Pickups);
  out.gangZones = list(data.gangZones || data.GangZones);
  out.textDraws = list(data.textDraws || data.TextDraws);
}

// ---------------------------------------------------------------- linhas soltas
function fromLooseLines(text, out, gd) {
  for (const line of text.split(/\r?\n/)) {
    let comment = '';
    const idxLineCmt = line.indexOf('//');
    const idxBlockCmt = line.indexOf('/*');
    if (idxLineCmt >= 0) {
      comment = line.slice(idxLineCmt + 2).replace(/\r$/, '').trim();
    } else if (idxBlockCmt >= 0) {
      const endBlock = line.indexOf('*/', idxBlockCmt + 2);
      comment = (endBlock >= 0 ? line.slice(idxBlockCmt + 2, endBlock) : line.slice(idxBlockCmt + 2)).replace(/\r$/, '').trim();
    }
    const cleanLine = idxLineCmt >= 0 ? line.slice(0, idxLineCmt) : (idxBlockCmt >= 0 ? line.slice(0, idxBlockCmt) : line);
    const rawMatches = cleanLine.match(/-?\d+(?:\.\d+)?/g) || [];
    const n = rawMatches.map(Number);
    if (n.length < 7 || !Number.isInteger(n[0])) continue;
    if (gd && !gd.models.has(n[0])) continue;
    const raw = {
      x: rawMatches[1], y: rawMatches[2], z: rawMatches[3],
      rx: rawMatches[4], ry: rawMatches[5], rz: rawMatches[6],
      drawDist: rawMatches[7] || undefined,
    };
    out.objects.push({ model: n[0], x: n[1], y: n[2], z: n[3], rx: n[4], ry: n[5], rz: n[6], comment, raw, materials: [] });
  }
}

// ---------------------------------------------------------------- entrada
// bytes: ArrayBuffer/Uint8Array. readSqlite(bytes) -> {tables} (feito pelo servidor)
export async function importAny(bytes, { filename = '', gd = null, readSqlite = null } = {}) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const out = empty();
  if (startsWith(u8, 'SQLite format 3')) {
    out.format = 'Banco SQLite';
    if (!readSqlite) { out.notes.push('Não consegui abrir o banco SQLite.'); return out; }
    const res = await readSqlite(u8);
    if (!res.ok) { out.notes.push(res.error || 'Não consegui abrir o banco SQLite.'); return out; }
    fromSqlite(res.tables, out);
    return finish(out);
  }
  if (startsWith(u8, 'bnry')) {
    out.format = 'IPL binário';
    const buf = u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
    if (isBinaryIpl(buf)) { const r = parseIplBinary(buf); fromIplInst(r.inst, out); for (const c of r.cars) out.vehicles.push({ model: c.id, x: c.x, y: c.y, z: c.z, rz: c.angle * 180 / Math.PI, color1: -1, color2: -1, respawn: -1 }); }
    return finish(out);
  }
  if (startsWith(u8, 'PK\x03\x04') || startsWith(u8, '7z') || startsWith(u8, 'Rar!')) {
    out.format = 'Arquivo compactado';
    out.notes.push('Esse arquivo está compactado (zip, 7z ou rar). Extraia e importe o arquivo de dentro.');
    return out;
  }
  const text = decodeBytes(u8);
  const trimmed = text.trim();
  if (/^[[{]/.test(trimmed)) {
    try {
      fromJson(JSON.parse(trimmed), out);
      out.format = 'JSON';
      const count = out.objects.length + out.vehicles.length + out.actors.length + out.removed.length +
                    out.labels.length + out.pickups.length + out.gangZones.length + out.textDraws.length +
                    (out.cameras?.shots?.length || 0) + (out.cameras?.paths?.length || 0);
      if (count > 0) return finish(out);
    } catch { /* não é JSON */ }
  }
  if (/<\s*(object|removeWorldObject)\b[^>]*\bmodel\s*=/i.test(text)) {
    out.format = 'Mapa do MTA';
    fromMta(text, out);
    return finish(out);
  }
  const pwn = parsePwn(text);
  if (pwn.objects.length + pwn.vehicles.length + (pwn.actors?.length || 0) + pwn.removed.length + pwn.cameras.shots.length + pwn.cameras.paths.length) {
    Object.assign(out, pwn, { format: 'Código Pawn', notes: [] });
    return finish(out);
  }
  if (/^\s*inst\s*$/im.test(text)) {
    out.format = 'IPL';
    const r = parseIplText(text);
    fromIplInst(r.inst, out);
    if (out.objects.length) return finish(out);
  }
  out.format = 'Lista de objetos';
  fromLooseLines(text, out, gd);
  if (!out.objects.length) out.format = '';
  return finish(out, filename);
}

function finish(out) {
  // Objetos com ID de veículo viram veículos
  const objs = [];
  for (const o of out.objects) {
    if (isVehicleModel(o.model)) out.vehicles.push({ model: o.model, x: o.x, y: o.y, z: o.z, rz: o.rz || 0, color1: -1, color2: -1, respawn: -1 });
    else objs.push(o);
  }
  out.objects = objs;
  return out;
}
