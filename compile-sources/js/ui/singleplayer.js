// Singleplayer mode: the project becomes a Modloader mod (a folder of loose files), so the original game files are never changed.
//  - new objects and vehicles -> <project>.ipl (inst + cars sections)
//  - removed buildings        -> a copy of the IPL that holds each one, with that instance buried (Z = BURIED_Z)
// Burying keeps every index of the IPL files intact (LOD links between text and streamed IPLs point to positions),
// which is what makes it safe to patch the files in place.
import { app, $, esc, store, toast, postJSON, showConfirm, showAlert, plural } from './common.js';
import { t } from './i18n.js';
import { quatOfItem } from '../editor/editor.js';
import { Project } from '../editor/project.js';
import { isText, isNoneTexture, keepsTexture, parseColor } from '../editor/materials.js';
import { splitTxd, renameNative, recolorNative, buildTxd, listColBlocks, cloneColBlock } from '../formats/rwwrite.js';
import { saveNow, listProjects } from './projects.js';
import { initDoorDialog, refreshDoorMarkers } from './doorDialog.js';
import { initWorldDialog } from './worldDialog.js';
import { initCustomModels, customName } from './customModels.js';
import { initDataDialog } from './dataDialog.js';
import { startSpWords } from './spWords.js';
import { vehiclesScript, pickupsScript, actorsScript, moversScript, checkpointsScript, worldScript, chunkByVars, ACTORS_BUDGET, npcVars, npcTravels } from '../formats/cleo.js';

const BURIED_Z = -5000;
const NOT_OBJECTS = new Set(['cars', 'peds', 'weap', 'hier']);

// ---------------------------------------------------------------------------  mode choice at startup
export function chooseMode() {
  const box = $('#modeSelect');
  const last = store.get('lastMode', 'mp');
  box.hidden = false;
  return new Promise((resolve) => {
    const done = (mode) => {
      box.hidden = true;
      for (const b of box.querySelectorAll('[data-mode]')) b.onclick = null;
      $('#modeChangeFolder').onclick = null;
      resolve(mode);
    };
    for (const b of box.querySelectorAll('[data-mode]')) {
      b.onclick = () => { store.set('lastMode', b.dataset.mode); done(b.dataset.mode); };
    }
    $('#modeChangeFolder').onclick = () => done(null);
    (box.querySelector(`[data-mode="${last}"]`) || box.querySelector('[data-mode]')).focus();
  });
}

export function setupMode() {
  const sp = Project.defaultMode === 'sp';
  $('#app').classList.toggle('mode-sp', sp);
  $('#modeChipLabel').textContent = sp ? 'Singleplayer' : 'Multiplayer';
  $('#btnMode use').setAttribute('href', sp ? '#i-gamepad' : '#i-globe');
  $('#btnMode').onclick = async () => {
    await saveNow();
    location.reload();
  };
  if (sp) { setupSingleplayer(); startSpWords(document.body); }
}

// ---------------------------------------------------------------------------  import
// What an imported map brings that a Singleplayer mod can use: objects, texture swaps and removed buildings
export function toSingleplayerImport(p) {
  const ignored = [];
  const add = (list, one, many) => { if (list?.length) ignored.push(plural(list.length, one, many)); };
  const cars = (p.vehicles || []).filter(v => app.gd.models.get(v.model)?.type === 'cars');
  add((p.vehicles || []).filter(v => !cars.includes(v)), 'veículo', 'veículos'); add(p.labels, 'texto 3D', 'textos 3D');
  add(p.gangZones, 'gangzone', 'gangzones'); add(p.textDraws, 'textdraw', 'textdraws');
  const cams = [...(p.cameras?.shots || []), ...(p.cameras?.paths || [])];
  add(cams, 'câmera', 'câmeras');
  const objects = [];
  let unknown = 0, texts = 0;
  for (const o of p.objects || []) {
    if (!isMapObject(o)) { unknown++; continue; }
    texts += (o.materials || []).filter(isText).length;
    objects.push({ ...o, attach: null, materials: (o.materials || []).filter(m => !isText(m)) });
  }
  if (texts) ignored.push(plural(texts, 'texto em objeto', 'textos em objetos'));
  return {
    ...p, objects, vehicles: cars.map(v => ({ ...v, attach: null })), labels: [], gangZones: [], textDraws: [],
    cameras: null, pwnHeader: '', rawPawn: '', preservedHeader: '', ignored, unknownModels: unknown,
  };
}

// ---------------------------------------------------------------------------  IPL building
const num = (v, d = 6) => (+v || 0).toFixed(d);

function modelName(id) { return app.gd.models.get(id)?.model || 'unknown'; }

function isMapObject(o) {
  const def = app.gd.models.get(o.model);
  return !!def && !NOT_OBJECTS.has(def.type);
}

// The game has car colors 0 to 126 (-1 is a random one)
const carColor = (c) => (Number.isInteger(c) && c >= 0 && c <= 126 ? c : -1);

// Doors: two enex lines with the same name. Each one has its marker and the exit point (where the player appears when leaving
// through the other one), a little in front of the marker, in the way it faces. The angle of the marker itself is in radians, the exit one in degrees.
function enexLines(project) {
  const out = [];
  const used = new Set();
  (project.doors || []).forEach((d, i) => {
    let name = String(d.name || '').toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 8) || 'ENT_' + String(i + 1).padStart(2, '0');
    for (let n = 1; used.has(name); n++) name = ('ENT_' + String(i + 1).padStart(2, '0') + n).slice(0, 8);
    used.add(name);
    const side = (x, y, z, rot, interior, flags, sky) => {
      const a = rot * Math.PI / 180;
      return [num(x, 4), num(y, 4), num(z, 4), 0, num(d.size, 2), num(d.size, 2), 8, num(x - Math.sin(a) * 1.1, 4), num(y + Math.cos(a) * 1.1, 4), num(z, 4),
        num(rot, 2), interior, flags, '"' + name + '"', sky, d.peds, d.timeOn, d.timeOff].join(', ');
    };
    out.push(side(d.out.x, d.out.y, d.out.z, d.out.rot, 0, d.flagsOut, d.skyOut), side(d.in.x, d.in.y, d.in.z, d.in.rot, d.interior, d.flagsIn, d.skyIn));
  });
  return out;
}

// A car needs the CLEO script (and so the CLEO in the game) only when something was asked for it: tuning, paintjob,
// indestructible or doors only for the player. A plain car is just a car generator of the game, which has its colors already.
export const needsScript = (v) => (v.components?.length > 0) || (v.paintjob ?? -1) >= 0 || !!v.indestructible || !!v.npcLock;
// Objects that move are created by the script too (an IPL object cannot move)
export const isMover = (o) => !!o.move && !o.attach;
export const worldSettings = (project) => { const w = project.world || {}; return !!(project.spawns?.length || w.weather >= 0 || w.hour >= 0); };
export const usesCleo = (project) => project.vehicles.some(v => app.gd.models.get(v.model)?.type === 'cars')
  || project.pickups?.length > 0 || project.actors?.length > 0 || project.mapIcons?.length > 0 || project.checkpoints?.length > 0
  || project.objects.some(isMover) || worldSettings(project);

// A short fingerprint of what goes into the mod: the installed mod remembers it, to tell whether it is up to date
export function projectHash(project) {
  const text = JSON.stringify([project.objects, project.vehicles, project.removed, project.doors || [], project.actors, project.pickups, project.mapIcons, project.checkpoints, project.world, project.customModels, project.retex, project.handling, project.drawDist, project.weapons, project.spawns]);
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0') + '-' + text.length.toString(16);
}
// The folder name the server gives to a mod (same rule as its safe_name)
const modFolder = (name) => (String(name).replace(/[^\p{L}\p{N}_\-. ()]+/gu, '_').replace(/^[ .]+|[ .]+$/g, '').slice(0, 80) || 'sem_nome');

// clones: object uid -> { id, name } of the textured copy of its model
export function buildNewIpl(project, clones = new Map(), skip = new Set(), carsDone = new Set()) {
  const lines = ['# Generated by SA Map Studio'];
  const inst = [];
  let objects = 0, skipped = 0;
  for (const o of project.objects) {
    if (skip.has(o)) continue;
    if (!isMapObject(o)) { skipped++; continue; }
    const q = quatOfItem(o);
    const interior = o.interior > 0 ? o.interior : 0;
    const c = clones.get(o.uid);
    inst.push([c ? c.id : o.model, c ? c.name : modelName(o.model), interior, num(o.x), num(o.y), num(o.z), num(-q.x, 8), num(-q.y, 8), num(-q.z, 8), num(q.w, 8), -1].join(', '));
    objects++;
  }
  if (inst.length) lines.push('inst', ...inst, 'end');
  let vehicles = 0;
  const cars = [];
  for (const v of project.vehicles) {
    if (carsDone.has(v)) continue;
    if (app.gd.models.get(v.model)?.type !== 'cars') { skipped++; continue; }
    cars.push([num(v.x), num(v.y), num(v.z), num(v.rz, 4), v.model, carColor(v.color1), carColor(v.color2), 1, 0, 0, -1, -1].join(', ')); // force spawn on, no alarm, unlocked, default delays (-1, as the game's own)
    vehicles++;
  }
  if (cars.length) lines.push('cars', ...cars, 'end');
  const enex = enexLines(project);
  if (enex.length) lines.push('enex', ...enex, 'end');
  return { text: lines.join('\r\n') + '\r\n', objects, vehicles, skipped, doors: enex.length / 2 };
}

// Text IPL: puts the Z of the chosen "inst" lines (by position among the inst lines) at BURIED_Z, and moves the others
// (moves: position in the file -> { x, y, z, q: [qx, qy, qz, qw] }; the LOD link is cut, the LOD of a moved model would stay behind)
export function buryInTextIpl(text, wanted, moves = new Map()) {
  const lines = text.split('\n');
  let section = null, n = 0;
  for (let i = 0; i < lines.length; i++) {
    const cr = lines[i].endsWith('\r');
    const body = cr ? lines[i].slice(0, -1) : lines[i];
    const c = body.indexOf('#');
    const clean = (c >= 0 ? body.slice(0, c) : body).trim();
    if (!clean) continue;
    const low = clean.toLowerCase();
    if (low === 'end') { section = null; continue; }
    if (!section && /^[a-z]+$/.test(low)) { section = low; continue; }
    if (section !== 'inst') continue;
    const f = clean.split(',').map(s => s.trim());
    if (f.length < 10) continue;
    const o = f.length >= 11 ? 1 : 0;
    if (wanted.has(n)) {
      f[4 + o] = String(BURIED_Z);
      lines[i] = f.join(', ') + (cr ? '\r' : '');
    } else if (moves.has(n)) {
      const m = moves.get(n);
      [m.x, m.y, m.z].forEach((v, k) => { f[2 + o + k] = num(v); });
      m.q.forEach((v, k) => { f[5 + o + k] = num(v, 8); });
      if (o) f[10] = '-1';
      lines[i] = f.join(', ') + (cr ? '\r' : '');
    }
    n++;
  }
  return lines.join('\n');
}

// Parked cars (car generators). The game's own are only in the binary IPLs of the streaming (none in a text IPL), so the new ones
// are appended to the one that holds the area. Each record has 48 bytes: x, y, z, angle (radians), model, color 1, color 2,
// force spawn, alarm chance, door lock chance, min delay, max delay (-1 is the default); they come after the objects.
export function addCarGens(buffer, cars) {
  const len = buffer.byteLength;
  const dv = new DataView(buffer);
  if (len < 76 || dv.getUint32(0, true) !== 0x79726e62) return null;
  const numInst = dv.getInt32(4, true), instOffset = dv.getInt32(0x1c, true);
  const numCars = dv.getInt32(0x14, true), carsOffset = dv.getInt32(0x3c, true);
  // The file is padded with zeros to a multiple of 2048 bytes; the data ends where the cars (or, with none, the objects) end
  const dataEnd = numCars > 0 ? carsOffset + numCars * 48 : instOffset + numInst * 40;
  if (dataEnd > len || (numCars > 0 && carsOffset < instOffset + numInst * 40)) return null;
  const bytes = new Uint8Array(buffer);
  for (let i = dataEnd; i < len; i++) if (bytes[i] !== 0) return null; // something comes after: not touched
  const total = Math.ceil((dataEnd + cars.length * 48) / 2048) * 2048;
  const out = new Uint8Array(Math.max(total, len));
  out.set(bytes.subarray(0, dataEnd));
  const o = new DataView(out.buffer);
  cars.forEach((v, i) => {
    const a = dataEnd + i * 48;
    let rad = (+v.rz || 0) * Math.PI / 180;
    rad = Math.atan2(Math.sin(rad), Math.cos(rad));
    [v.x, v.y, v.z, rad].forEach((f, k) => o.setFloat32(a + k * 4, f, true));
    [v.model, carColor(v.color1), carColor(v.color2), 1, 0, 0, -1, -1].forEach((n, k) => o.setInt32(a + 16 + k * 4, n, true));
  });
  o.setInt32(0x14, numCars + cars.length, true);
  if (numCars === 0) o.setInt32(0x3c, dataEnd, true);
  return out;
}

// For each new car, the streaming IPL that holds its area (the one whose objects surround it, or the nearest)
function planCars(project) {
  const boxes = new Map();
  for (const inst of app.gd.instances) {
    if (!inst.src?.bin || inst.interior > 0) continue;
    let b = boxes.get(inst.src.file);
    if (!b) boxes.set(inst.src.file, b = { minX: 1e9, maxX: -1e9, minY: 1e9, maxY: -1e9 });
    b.minX = Math.min(b.minX, inst.x); b.maxX = Math.max(b.maxX, inst.x);
    b.minY = Math.min(b.minY, inst.y); b.maxY = Math.max(b.maxY, inst.y);
  }
  const plan = new Map();
  for (const v of project.vehicles) {
    if (app.gd.models.get(v.model)?.type !== 'cars') continue;
    let best = null, bestScore = Infinity;
    for (const [file, b] of boxes) {
      const dx = Math.max(b.minX - v.x, 0, v.x - b.maxX), dy = Math.max(b.minY - v.y, 0, v.y - b.maxY);
      // inside: the smallest box wins; outside: the closest
      const score = dx || dy ? Math.hypot(dx, dy) + 1e7 : (b.maxX - b.minX) * (b.maxY - b.minY) / 1e6;
      if (score < bestScore) { bestScore = score; best = file; }
    }
    if (!best) continue;
    if (!plan.has(best)) plan.set(best, []);
    plan.get(best).push(v);
  }
  return plan;
}

// Binary IPL ("bnry"): each instance has 40 bytes, Z is the third float
export function buryInBinaryIpl(buffer, wanted, moves = new Map()) {
  const out = buffer.slice(0);
  const dv = new DataView(out);
  if (dv.getUint32(0, true) !== 0x79726e62) throw new Error('bnry'); // "bnry"
  const count = dv.getInt32(4, true), offset = dv.getInt32(0x1c, true);
  let done = 0;
  for (const idx of wanted) {
    const at = offset + idx * 40 + 8;
    if (idx < 0 || idx >= count || at + 4 > out.byteLength) continue;
    dv.setFloat32(at, BURIED_Z, true);
    done++;
  }
  for (const [idx, m] of moves) {
    const at = offset + idx * 40;
    if (idx < 0 || idx >= count || at + 40 > out.byteLength) continue;
    [m.x, m.y, m.z, ...m.q].forEach((v, k) => dv.setFloat32(at + k * 4, v, true));
    dv.setInt32(at + 36, -1, true); // no LOD
    done++;
  }
  return { buffer: out, done };
}

const latin1 = (buf) => new TextDecoder('windows-1252').decode(buf);
function fromLatin1(text) {
  const out = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) out[i] = text.charCodeAt(i) & 0xff;
  return out;
}

// Which instance of which file each removed building is
// Objects made editable from the game's own that were only moved or turned (no other texture): the mod changes them in
// place in the IPL, so they keep their place in the game's files. Returns Map(game instance -> project object).
function movedOriginals(project) {
  const byKey = new Map();
  for (const inst of app.gd.instances) if (inst.src) byKey.set(inst.src.file + '|' + inst.src.idx, inst);
  const moved = new Map();
  for (const o of project.objects) {
    const g = o.origin;
    if (!g || swapsOf(o).length || isMover(o)) continue;
    const inst = byKey.get(g.file + '|' + g.idx);
    if (!inst || inst.id !== o.model || moved.has(inst)) continue;
    if (Math.hypot(inst.x - g.x, inst.y - g.y, inst.z - g.z) > 0.5) continue; // the game's files are not the ones it was made from
    moved.set(inst, o);
  }
  return moved;
}

function removedTargets(project) {
  const byFile = new Map();
  const gone = new Set();
  let total = 0;
  const entry = (inst) => {
    let e = byFile.get(inst.src.file);
    if (!e) byFile.set(inst.src.file, e = { bin: inst.src.bin, idx: new Set(), moves: new Map() });
    return e;
  };
  const bury = (inst) => {
    if (!inst.src || gone.has(inst)) return;
    gone.add(inst);
    entry(inst).idx.add(inst.src.idx);
    total++;
  };
  const moved = movedOriginals(project);
  for (const [inst, o] of moved) {
    const q = quatOfItem(o);
    entry(inst).moves.set(inst.src.idx, { x: o.x, y: o.y, z: o.z, q: [-q.x, -q.y, -q.z, q.w] });
  }
  for (const r of project.removed) {
    for (const inst of app.streamer.instancesNear(r.x, r.y, r.z, Math.max(r.radius, 0.01), r.model)) if (!moved.has(inst)) bury(inst);
  }
  for (const inst of moved.keys()) gone.add(inst); // for the LOD below: a moved model does not stand in the old place any more
  // A LOD whose detailed models are all gone would stay visible in the distance, like a ghost of the building
  const lods = new Set();
  for (const inst of gone) if (inst.lodRef) lods.add(inst.lodRef);
  for (const lod of lods) if (lod.children?.every(c => gone.has(c))) bury(lod);
  return { byFile, total, moved: moved.size, movedObjects: new Set(moved.values()) };
}

// ---------------------------------------------------------------------------  textured copies of models
// A texture swap only exists per object in SA-MP. In the game it belongs to the model, so each distinct texturing becomes
// a copy of the model with its own id, DFF, TXD (only the swapped textures; the original TXD is its parent) and collision.
const FIRST_FREE_ID = 19999;
let colIndex = null; // lowercase model name -> { buffer, block }

async function findCollision(name, say) {
  if (!colIndex) {
    colIndex = new Map();
    say('Procurando as colisões…');
    for (const [entry] of app.gd.entries) {
      if (!entry.endsWith('.col')) continue;
      const buf = await app.gd.readEntry(entry);
      if (!buf) continue;
      for (const block of listColBlocks(buf)) if (!colIndex.has(block.name)) colIndex.set(block.name, { buffer: buf, block });
    }
  }
  return colIndex.get(name.toLowerCase()) || null;
}

// What each material of an object does to the model's texture: another texture (txd + texture) and/or a tint (color).
// A color alone (txd null) tints the texture the model already has. The "none" swap (invisible part) has no equivalent.
function swapsOf(o) {
  const out = [];
  for (const m of o.materials || []) {
    if (isText(m) || !(m.index >= 0)) continue;
    // An invisible texture: the texture of that slot made fully transparent
    if (isNoneTexture(m)) { out.push({ index: m.index | 0, txd: null, texture: null, color: 0x00ffffff }); continue; }
    const color = parseColor(m.color);
    if (keepsTexture(m)) { if (color) out.push({ index: m.index | 0, txd: null, texture: null, color }); continue; }
    if (m.texture && m.txd) out.push({ index: m.index | 0, txd: String(m.txd).toLowerCase(), texture: String(m.texture).toLowerCase(), color });
  }
  return out;
}

// Objects of the same model with the same swaps share one textured copy
function texturedGroups(project) {
  const groups = new Map();
  for (const o of project.objects) {
    const def = app.gd.models.get(o.model);
    const swaps = swapsOf(o);
    if (!def || !swaps.length || !['objs', 'tobj'].includes(def.type)) continue;
    const key = o.model + '|' + swaps.map(w => `${w.index}:${w.txd}:${w.texture}:${w.color}`).sort().join(',');
    if (!groups.has(key)) groups.set(key, { model: o.model, def, swaps, objects: [] });
    groups.get(key).objects.push(o);
  }
  return groups;
}

async function buildClones(project, files, info, say, customCols = new Map()) {
  const clones = new Map(); // object uid -> { id, name }
  const groups = texturedGroups(project);
  if (!groups.size) return clones;
  const txdCache = new Map();
  const sourceTxd = async (name) => {
    if (!txdCache.has(name)) {
      const buf = await app.gd.readEntry(name + '.txd');
      txdCache.set(name, buf ? splitTxd(buf) : null);
    }
    return txdCache.get(name);
  };
  let nextId = FIRST_FREE_ID;
  const ideObjs = info.ideObjs, ideParents = info.ideParents;
  for (const g of groups.values()) {
    const slots = await app.models.slots(g.model);
    const chunks = new Map(); // texture name of the model -> new texture chunk
    let version = 0;
    for (const w of g.swaps) {
      const slot = slots[w.index];
      const target = slot?.texture;
      // The texture to use: the chosen one, or (color only) the one the model already has in that slot
      const src = await sourceTxd(w.txd || String(slot?.txd || '').toLowerCase());
      const chunk = src?.natives.get(w.txd ? w.texture : String(target || '').toLowerCase());
      if (!target || !chunk) { info.texMissing++; continue; }
      version = version || src.version;
      const made = w.color ? recolorNative(chunk, w.color, target) : null;
      if (w.color && !made) info.texMissing++; // a texture format that cannot be tinted: it goes without the color
      chunks.set(target.toLowerCase(), made || renameNative(chunk, target));
    }
    if (!chunks.size) continue;
    while (nextId > 0 && app.gd.models.has(nextId)) nextId--;
    if (nextId < 18631) { info.texMissing += g.objects.length; continue; }
    const id = nextId--;
    const name = 'samsp_' + id;
    const dff = await app.gd.readEntry(g.def.model.toLowerCase() + '.dff');
    if (!dff) { info.texMissing += g.objects.length; continue; }
    files.set(name + '.dff', new Uint8Array(dff));
    files.set(name + '.txd', buildTxd([...chunks.values()], version));
    const col = customCols.get(g.def.model) || await findCollision(g.def.model, say);
    if (col) files.set(name + '.col', cloneColBlock(col.buffer, col.block, name, id)); else info.noCol++;
    ideObjs.push([id, name, name, g.def.drawDist, g.def.flags | 0].join(', '));
    ideParents.push([name, g.def.txd].join(', '));
    for (const o of g.objects) clones.set(o.uid, { id, name });
    info.cloned++;
  }
  return clones;
}

// The models imported from files that an object of the project uses: their files go into the mod, and a model line for each
async function addCustomModels(project, files, info) {
  const cols = new Map();
  const used = new Set(project.objects.map(o => o.model));
  for (const m of project.customModels || []) {
    if (!used.has(m.id)) continue;
    const name = customName(m.id);
    const get = async (file) => {
      const r = await fetch(`/gta/__sp/${m.asset}/${encodeURIComponent(file)}`);
      if (!r.ok) throw new Error(file);
      return new Uint8Array(await r.arrayBuffer());
    };
    try {
      files.set(name + '.dff', await get(m.dff));
      if (m.txd) files.set(name + '.txd', await get(m.txd));
      let hasCol = false;
      if (m.col) {
        const raw = await get(m.col);
        const buf = raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength);
        const blocks = listColBlocks(buf);
        if (blocks.length) {
          const out = cloneColBlock(buf, blocks[0], name, m.id);
          files.set(name + '.col', out);
          cols.set(name, { buffer: out.buffer.slice(0), block: { pos: 0, size: out.length } });
          hasCol = true;
        }
      }
      if (!hasCol) info.noCol++;
      info.ideObjs.push([m.id, name, m.txd ? name : 'generic', m.drawDist, 0].join(', '));
      info.custom++;
    } catch (err) {
      info.failed++;
      console.warn(m.label, err);
    }
  }
  return cols;
}

// Game data of the mod: textures replaced in the whole map (the TXD of the model, rebuilt), handling lines and view distances
async function addGameData(project, files, info) {
  const byTxd = new Map();
  for (const r of project.retex || []) {
    if (!byTxd.has(r.txd)) byTxd.set(r.txd, []);
    byTxd.get(r.txd).push(r);
  }
  const cache = new Map();
  const load = async (name) => {
    if (!cache.has(name)) {
      const buf = await app.gd.readEntry(name + '.txd');
      cache.set(name, buf ? splitTxd(buf) : null);
    }
    return cache.get(name);
  };
  for (const [txd, list] of byTxd) {
    const base = await load(txd);
    if (!base) { info.texMissing += list.length; continue; }
    const natives = new Map(base.natives);
    for (const r of list) {
      const src = await load(r.srcTxd);
      const chunk = src?.natives.get(r.srcName);
      if (!chunk || !natives.has(r.name)) { info.texMissing++; continue; }
      natives.set(r.name, renameNative(chunk, r.name));
      info.retexed++;
    }
    files.set(txd + '.txd', buildTxd([...natives.values()], base.version));
  }
  // The game's own file with the changed lines in it (a file in the mod replaces the game's: a lone line would leave every other vehicle without handling)
  const changed = Object.entries(project.handling || {});
  if (changed.length) {
    const r = await fetch('/gta/data/handling.cfg');
    if (!r.ok) throw new Error('handling.cfg');
    const wanted = new Map(changed.map(([name, v]) => [name.toUpperCase(), [name.toUpperCase(), ...v].join(' ')]));
    const out = (await r.text()).split(/\r?\n/).map((line) => {
      const parts = line.trim().split(/\s+/);
      return parts.length === 36 && wanted.has(parts[0].toUpperCase()) ? wanted.get(parts[0].toUpperCase()) : line;
    });
    files.set('handling.cfg', fromLatin1(out.join('\r\n')));
    info.handling = changed.length;
  }
  // weapon.dat: the game's own file (a file in the mod replaces the game's) with the changed lines in it; read and written byte by byte
  const wchanged = Object.entries(project.weapons || {});
  if (wchanged.length) {
    const r = await fetch('/gta/data/weapon.dat');
    if (!r.ok) throw new Error('weapon.dat');
    const bytes = new Uint8Array(await r.arrayBuffer());
    let text = '';
    for (let i = 0; i < bytes.length; i += 8192) text += String.fromCharCode(...bytes.subarray(i, i + 8192));
    const wanted = new Map(wchanged);
    const seen = new Map();
    const out = text.split(/\r?\n/).map((line) => {
      const t = line.trim();
      if (!t || t[0] === '#') return line;
      const parts = t.slice(1).trim().split(/\s+/);
      const skill = t[0] === '$' ? parts[13] : '0';
      const key = `${t[0]}|${parts[0]}|${skill}`;
      return wanted.has(key) ? t[0] + ' ' + wanted.get(key).join('\t') : line;
    });
    files.set('weapon.dat', fromLatin1(out.join('\r\n')));
    info.weapons = wchanged.length;
  }
  // A model that the game already has, defined again with another distance (the last definition wins)
  for (const [id, dist] of Object.entries(project.drawDist || {})) {
    const def = app.gd.models.get(+id);
    if (!def || def.type !== 'objs') continue;
    info.ideObjs.push([id, def.model, def.txd, dist, def.flags | 0].join(', '));
  }
}

// One IDE with the model lines of the textured copies and of the imported models
function writeIde(project, files, info) {
  if (!info.ideObjs.length) return;
  const ide = ['# Generated by SA Map Studio', 'objs', ...info.ideObjs, 'end'];
  if (info.ideParents.length) ide.push('txdp', ...info.ideParents, 'end');
  const ideName = 'samsp_' + sanitize(project.name) + '.ide';
  files.set('data/maps/' + ideName, fromLatin1(ide.join('\r\n') + '\r\n'));
  info.dataLines.unshift(dataLine('IDE', ideName));
}

// A line for the game's data files, as the Modloader merges them into gta.dat
const dataLine = (kind, file) => [kind, 'DATA\\MAPS\\' + file.toUpperCase()].join(' ');
const fileBase = (f) => f.split('/').pop();

// The mod's folder is kept by what each file does: modloader/SA Map Studio/<project>/<category>/. The Modloader finds the files by name in any folder
// (and the readme with the IDE and IPL lines stays at the top, with the editor's marker)
function categoryOf(path) {
  const name = path.split('/').pop().toLowerCase();
  if (name === 'readme.txt') return '';
  if (name.endsWith('.cs')) {
    if (/_(npcs|followers)\d+\.cs$/.test(name)) return 'npcs';
    if (/_pickups\d+\.cs$/.test(name)) return 'pickups';
    if (/_checkpoints\d+\.cs$/.test(name)) return 'checkpoints';
    if (/_world\.cs$/.test(name)) return 'world';
    if (/_movers\d+\.cs$/.test(name)) return 'objects';
    return 'vehicles'; // the parked cars (tuning, paintjob, doors)
  }
  if (name === 'handling.cfg') return 'vehicles';
  if (name === 'weapon.dat') return 'weapons';
  if (name.endsWith('.txd') && !name.startsWith('samsp_')) return 'textures'; // a game texture file with textures replaced
  return 'objects'; // models, collisions, IDE, IPL (new and the game's own that were changed)
}

function organize(files) {
  const out = new Map();
  for (const [path, bytes] of files) {
    const dir = categoryOf(path);
    out.set(dir ? `${dir}/${path.split('/').pop()}` : path, bytes);
  }
  return out;
}

async function buildFiles(project, say = () => {}) {
  const files = new Map(); // path inside the mod -> Uint8Array
  const info = { objects: 0, vehicles: 0, skipped: 0, buried: 0, patched: 0, failed: 0, moved: 0, dataLines: [], ideObjs: [], ideParents: [], custom: 0, cloned: 0, retexed: 0, handling: 0, weapons: 0, noCol: 0, texMissing: 0 };
  const customCols = await addCustomModels(project, files, info);
  const clones = await buildClones(project, files, info, say, customCols);
  await addGameData(project, files, info);
  writeIde(project, files, info);
  const { byFile, moved, movedObjects } = removedTargets(project);
  info.moved = moved;
  const carPlan = new Map(); // no car generators: the cars are made by a script (unique, and back at their place when destroyed)
  const carsDone = new Set(project.vehicles.filter(v => app.gd.models.get(v.model)?.type === 'cars')); // so the IPL does not list them
  for (const [file, e] of byFile) {
    try {
      if (e.bin) {
        const buf = await app.gd.readEntry(file);
        if (!buf) throw new Error('missing');
        const r = buryInBinaryIpl(buf, e.idx, e.moves);
        let out = new Uint8Array(r.buffer);
        const gens = carPlan.get(file);
        if (gens) {
          carPlan.delete(file);
          const withCars = addCarGens(r.buffer, gens);
          if (withCars) { out = withCars; gens.forEach(v => carsDone.add(v)); }
        }
        files.set(fileBase(file), out);
        info.buried += r.done;
      } else {
        const text = latin1(await app.gd.fs.read(file));
        files.set(file.replace(/^\/+/, ''), fromLatin1(buryInTextIpl(text, e.idx, e.moves)));
        info.buried += e.idx.size;
      }
      info.patched++;
    } catch (err) {
      info.failed++;
      console.warn(file, err);
    }
  }
  // The cars in areas where no other change was made
  for (const [file, gens] of carPlan) {
    try {
      const buf = await app.gd.readEntry(file);
      const out = buf && addCarGens(buf, gens);
      if (!out) continue;
      files.set(fileBase(file), out);
      gens.forEach(v => carsDone.add(v));
      info.patched++;
    } catch (err) { console.warn(file, err); }
  }
  // Objects that move, pickups, characters, radar icons, checkpoints and the world settings: scripts of the same mod
  const base = sanitize(project.name);
  const movers = project.objects.filter(o => isMover(o) && isMapObject(o));
  const putScripts = (name, list, varsOf, make, budget) => {
    chunkByVars(list, varsOf, budget).forEach((part, k) => files.set(`samsp_${base}_${name}${k + 1}.cs`, make(part)));
  };
  // The vehicles of the project: a script makes each one (unique; it comes back at its place when destroyed)
  putScripts('vehicles', project.vehicles.filter(v => app.gd.models.get(v.model)?.type === 'cars').map(v => ({
    model: v.model, x: v.x, y: v.y, z: v.z, rz: v.rz, color1: v.color1 ?? -1, color2: v.color2 ?? -1, comps: v.components || [], paintjob: v.paintjob ?? -1,
    indestructible: !!v.indestructible, npcLock: !!v.npcLock, respawn: Math.max(1, +v.spRespawn || 30),
  })), () => 3, vehiclesScript);
  putScripts('movers', movers.map(o => {
    const c = clones.get(o.uid);
    return { model: c ? c.id : o.model, x: o.x, y: o.y, z: o.z, rx: o.rx, ry: o.ry, rz: o.rz, tx: o.move.targetX, ty: o.move.targetY, tz: o.move.targetZ, speed: o.move.speed };
  }), () => 3, moversScript);
  putScripts('pickups', (project.pickups || []).map(p => ({
    model: p.model, type: p.type === 3 || p.model === 1212 ? 3 : 2, x: p.x, y: p.y, z: p.z, action: p.action,
  })), (p) => (p.action && p.action.type !== 'none' ? 3 : 1), pickupsScript);
  // As many scripts as needed: the NPCs that follow or chase (they share the door logic) go apart from the others, which fit more per script
  const npcs = (project.actors || []).map(a => ({
    skin: a.skin, x: a.x, y: a.y, z: a.z, rz: a.rz, invulnerable: !!a.invulnerable, anim: a.weapon ? null : a.anim,
    weapon: a.weapon | 0, role: a.role || 'neutral', follow: !!a.follow, ammoInfinite: a.ammoInfinite !== false, ammo: Math.max(1, Math.round(+a.ammo || 100)), runFast: a.runFast !== false, respawn: a.invulnerable ? 0 : Math.max(0, +a.respawn || 0),
  }));
  let guardCount = 0;
  for (const n of npcs) n.gid = n.role === 'guard' && guardCount < 300 ? guardCount++ : -1;
  for (const n of npcs) n.guardTotal = guardCount;
  // the enemies are numbered too: the protectors find them through shared variables
  let enemyCount = 0;
  for (const n of npcs) n.eid = n.role === 'enemy' && enemyCount < 300 ? enemyCount++ : -1;
  for (const n of npcs) n.enemyTotal = enemyCount;
  putScripts('npcs', npcs.filter(n => !npcTravels(n)), npcVars, actorsScript);
  putScripts('followers', npcs.filter(npcTravels), npcVars, actorsScript, ACTORS_BUDGET);
  putScripts('checkpoints', (project.checkpoints || []).map(c => ({ x: c.x, y: c.y, z: c.z, radius: c.size, action: c.action })), () => 3, checkpointsScript);
  const w = project.world || {};
  if ((project.mapIcons || []).length || worldSettings(project)) {
    files.set(`samsp_${base}_world.cs`, worldScript({
      blips: (project.mapIcons || []).map(m => ({ sprite: m.markertype, x: m.x, y: m.y, z: m.z })),
      spawn: project.spawns?.[0] ? { x: project.spawns[0].x, y: project.spawns[0].y, z: project.spawns[0].z, rot: project.spawns[0].rz } : null, weather: w.weather ?? -1, hour: w.hour ?? -1, minute: w.minute ?? 0,
    }));
  }
  const created = buildNewIpl(project, clones, new Set([...movedObjects, ...movers]), carsDone);
  Object.assign(info, { objects: created.objects, vehicles: created.vehicles + carsDone.size, skipped: created.skipped });
  if (created.objects || created.vehicles || created.doors) {
    // The Modloader only loads an IPL that has a matching gta.dat line. A gta.dat file in the mod would REPLACE the game's own
    // (the game then loads no models), so the line goes into the mod's readme, which the Modloader reads and merges
    files.set('data/maps/' + newIplName(project), fromLatin1(created.text));
    info.dataLines.push(dataLine('IPL', newIplName(project)));
  }
  return { files: organize(files), info };
}

// The prefix keeps it from ever having the name of one of the game's own IPL files
export const newIplName = (project) => 'samsp_' + sanitize(project.name) + '.ipl';
const sanitize = (name) => String(name || 'map').replace(/[^\w\-]+/g, '_').replace(/^_+|_+$/g, '') || 'map';

function toBase64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

// ---------------------------------------------------------------------------  dialog
// What the game folder lacks to install and run a mod (the server says it with codes). Warns the user and returns true when something is missing.
export async function warnMissing(st, needCleo = false) {
  // name, what it is for, and where to get it (a link opens in the browser)
  const tools = {
    game: { name: 'GTA San Andreas (gta_sa.exe)', use: t('O executável do jogo') },
    cleo: { name: 'CLEO Library', use: t('Carregar NPCs, veículos, checkpoints, pickups'), url: 'https://github.com/cleolibrary/CLEO5/releases' },
    asi: { name: 'ASI Loader', use: t('Permitir carregamento de arquivos .asi'), url: 'https://github.com/ThirteenAG/Ultimate-ASI-Loader/releases' },
    modloader: { name: 'ModLoader', use: t('Carregar modificações sem alterar o jogo'), url: 'https://www.mixmods.com.br/2026/05/modloader/' },
  };
  const lacking = new Set([...(st?.missing || []), ...(needCleo && st && !st.hasCleo ? ['cleo'] : [])]);
  const missing = Object.keys(tools).filter(k => lacking.has(k)); // in the order of the list above
  if (!missing.length) return false;
  const rows = missing.map((k) => {
    const x = tools[k];
    const name = x.url ? `<a href="${x.url}" data-open-url="${x.url}" style="color:#f5a623; font-weight:700;">${x.name}</a>` : `<b>${x.name}</b>`;
    return `<li style="margin: 6px 0;">${name} - (${esc(x.use)})</li>`;
  }).join('');
  const promise = showAlert(`<p style="margin:0 0 8px;">${esc(t('Ferramentas que faltam ser instaladas na pasta do jogo:'))}</p><ul style="margin:0; padding-left:18px;">${rows}</ul>`,
    { title: t('Falta algo no jogo'), html: true });
  // The links open in the browser of the computer (the window of the program has none)
  $('#confirmMsg')?.querySelectorAll('[data-open-url]').forEach((a) => {
    a.onclick = (e) => { e.preventDefault(); postJSON('/api/open_url', { url: a.dataset.openUrl }).catch(() => window.open(a.href, '_blank', 'noopener')); };
  });
  await promise;
  return true;
}

function setupSingleplayer() {
  const dlg = $('#dlgSp');
  const status = $('#spStatus');
  const say = (msg, kind = '') => { status.textContent = msg; status.className = 'sp-status ' + kind; };
  const name = () => app.project.name;
  let busy = false;

  // The mods this editor installed in the game, against the projects it has: up to date, out of date or without a project
  const renderMods = async () => {
    const ul = $('#spMods');
    let mods = [];
    try { mods = (await postJSON('/api/sp/list', {})).mods || []; } catch { /* the server did not answer */ }
    const projects = (await listProjects()).projects || [];
    const rows = [];
    for (const m of mods) {
      const proj = projects.find(p => modFolder(p.name) === m.folder);
      let state = 'none';
      if (proj) {
        let hash = '';
        if (app.project.name === proj.name) hash = projectHash(app.project);
        else {
          try { hash = projectHash(Project.fromJSON(await (await fetch('/api/projects/' + encodeURIComponent(proj.name) + '?mode=sp')).json())); } catch { /* unreadable project */ }
        }
        state = m.hash && m.hash === hash ? 'ok' : 'old';
      }
      const li = document.createElement('li');
      const nameEl = document.createElement('span');
      nameEl.className = 'sp-mod-name';
      nameEl.textContent = m.name;
      const stateEl = document.createElement('span');
      stateEl.classList.add('sp-mod-state', state);
      stateEl.textContent = { ok: 'Atualizado', old: 'Desatualizado', none: 'Sem projeto' }[state];
      const del = document.createElement('button');
      del.type = 'button';
      del.classList.add('btn', 'small', 'danger');
      del.dataset.spUn = m.folder;
      del.innerHTML = '<svg><use href="#i-trash"/></svg>';
      del.append('Desinstalar');
      li.append(nameEl, stateEl, del);
      rows.push(li);
    }
    ul.replaceChildren(...rows);
    if (!rows.length) ul.innerHTML = '<li class="ol-empty">Nenhum mod instalado por este editor.</li>';
  };

  const refresh = async (showStatus = true) => {
    const p = app.project;
    const { byFile, total, moved } = removedTargets(p);
    const stat = (label, n) => `<span><span>${label}</span> <b>${n}</b></span>`;
    $('#spStats').innerHTML = stat('Objetos novos', p.objects.length - moved)
      + stat('Veículos parados', p.vehicles.filter(v => app.gd.models.get(v.model)?.type === 'cars').length) + stat('Entradas e saídas', (p.doors || []).length)
      + (p.actors?.length ? stat('NPCs fixos', p.actors.length) : '') + (p.pickups?.length ? stat('Pickups', p.pickups.length) : '')
      + (p.mapIcons?.length ? stat('Ícones no radar', p.mapIcons.length) : '') + (p.checkpoints?.length ? stat('Checkpoints', p.checkpoints.length) : '')
      + (p.retex?.length ? stat('Texturas trocadas no mapa', p.retex.length) : '') + (Object.keys(p.handling || {}).length ? stat('Handlings alterados', Object.keys(p.handling).length) : '') + (Object.keys(p.drawDist || {}).length ? stat('Distâncias de visão', Object.keys(p.drawDist).length) : '') + (Object.keys(p.weapons || {}).length ? stat('Armas alteradas', Object.keys(p.weapons).length) : '')
      + (p.objects.filter(isMover).length ? stat('Objetos em movimento', p.objects.filter(isMover).length) : '') + stat('Modelos com textura nova', texturedGroups(p).size) + stat('Objetos originais movidos', moved) + stat('Objetos originais removidos', total) + stat('Arquivos IPL alterados', byFile.size);
    let st;
    try { st = await postJSON('/api/sp/status', { name: name(), was: app.project.installedAs || '' }); } catch { st = null; }
    $('#spOpen').disabled = !st?.built;
    $('#spInstall').disabled = busy;
    renderMods();
    if (!showStatus) return;
    if (!st?.ok) return say('Não consegui falar com o servidor.', 'bad');
    if (st.gameRunning) say('O jogo já está em execução. Feche-o antes de testar.', 'warn');
    else if (st.installed && st.renamed) say('Mod instalado com o nome antigo do projeto. Instale de novo para atualizar (a pasta antiga será removida).', 'warn');
    else if (st.installed) say(st.installedHash && st.installedHash === projectHash(app.project) ? 'Mod instalado e atualizado.' : 'Mod instalado, mas desatualizado. Instale de novo para atualizar.', st.installedHash === projectHash(app.project) ? '' : 'warn');
    else say(st.built ? 'Mod gerado. Falta instalar no jogo.' : '');
  };

  const build = async () => {
    await saveNow();
    say('Gerando os arquivos…');
    const { files, info } = await buildFiles(app.project, say);
    const payload = {};
    for (const [path, bytes] of files) payload[path] = toBase64(bytes);
    const r = await postJSON('/api/sp/build', { name: name(), files: payload, info, meta: { hash: projectHash(app.project) } });
    if (!r.ok) throw new Error(r.error || 'erro');
    $('#spFiles').innerHTML = [...files].map(([p, b]) => `<li>${p.replace(/[<>&]/g, '')} · ${(b.length / 1024).toFixed(1)} KB</li>`).join('');
    if (info.noCol) say(`${info.noCol} modelo(s) com textura nova ficaram sem colisão.`, 'warn');
    else if (info.texMissing) say(`${info.texMissing} troca(s) de textura não puderam ser aplicadas.`, 'warn');
    else if (info.failed) say(`${info.failed} arquivo(s) do jogo não puderam ser lidos; as remoções deles ficaram de fora.`, 'warn');
    else if (info.skipped) say(`Mod gerado. Itens sem equivalente no jogo original ficaram de fora: ${info.skipped}.`, 'warn');
    else say('Mod gerado.');
    return info;
  };

  const run = async (fn) => {
    if (busy) return;
    busy = true; $('#spInstall').disabled = true; $('#spBuild').disabled = true;
    try { await fn(); } catch (err) { say(String(err.message || err), 'bad'); }
    busy = false; $('#spBuild').disabled = false;
    await refresh(false);
  };

  initDoorDialog();
  initWorldDialog();
  initCustomModels();
  initDataDialog();
  // Undo and redo of the doors and other settings: the markers on the map follow
  const hook = () => app.project.on((c) => { if (c.type === 'extras') refreshDoorMarkers(); });
  hook();
  app.on('project', hook);
  $('#btnExport').onclick = () => { $('#spFiles').innerHTML = ''; dlg.showModal(); refresh(); };
  $('#spClose').onclick = () => dlg.close();
  $('#spBuild').onclick = () => run(build);
  $('#spOpen').onclick = () => postJSON('/api/sp/open', { name: name() });
  // One .zip with the whole mod (every script and file in it), to share: its folder goes inside the game's modloader folder
  $('#spZip').onclick = () => run(async () => {
    await build();
    const r = await postJSON('/api/sp/zip', { name: name() });
    if (!r.ok) throw new Error(r.error || 'erro');
    say(`ZIP gerado: ${r.path}`);
    toast('ZIP gerado', 'ok', 4000);
  });
  // Builds and copies the mod into modloader/ (asks first when it was not there yet); false when the user said no
  const installedAt = new Map(); // project name -> project.version of the last install (to know when it is out of date)
  const install = async (installed, ask = true) => {
    if (!installed && ask) {
      const ok = await showConfirm(`Vai criar a pasta "modloader/SA Map Studio/${name()}" dentro da pasta do GTA. Nada do jogo original é alterado e dá para remover depois.`, { confirmText: 'Instalar' });
      if (!ok) return false;
    }
    await build();
    const r = await postJSON('/api/sp/install', { name: name(), was: app.project.installedAs || '' });
    if (!r.ok) throw new Error(r.error || 'erro');
    app.project.installedAs = name();
    app.project.touch('installed');
    installedAt.set(name(), app.project.version);
    return true;
  };
  $('#spInstall').onclick = () => run(async () => {
    const st = await postJSON('/api/sp/status', { name: name(), was: app.project.installedAs || '' });
    if (await warnMissing(st, usesCleo(app.project))) return;
    if (!await install(st.installed)) return;
    toast('Mod instalado no jogo', 'ok', 4000);
    say('Mod instalado no jogo.');
  });
  // Test in the game (top bar): installs the mod when it is not there or is out of date, then opens the game
  $('#btnSpTest').onclick = async () => {
    if (busy) return;
    busy = true;
    try {
      const st = await postJSON('/api/sp/status', { name: name(), was: app.project.installedAs || '' });
      if (await warnMissing(st, usesCleo(app.project))) return;
      if (st.gameRunning) { toast('O jogo já está em execução. Feche-o antes de testar.', 'warn', 6000); return; }
      toast('Instalando o mod…', 'ok', 2500);
      await install(st.installed, false);
      const r = await postJSON('/api/sp/launch', { name: name() });
      if (!r.ok) throw new Error(r.error || 'erro');
      toast('Jogo iniciado.', 'ok', 3000);
    } catch (err) {
      toast(String(err.message || err), 'error', 7000);
    } finally { busy = false; }
  };
  $('#spMods').addEventListener('click', (e) => {
    const b = e.target.closest('[data-sp-un]');
    if (!b) return;
    run(async () => {
      const folder = b.dataset.spUn;
      if (!await showConfirm(`Desinstalar o mod "${folder}" do jogo?`, { confirmText: 'Desinstalar', danger: true })) return;
      const r = await postJSON('/api/sp/uninstall', { name: folder });
      if (!r.ok) throw new Error(r.error || 'erro');
      if (app.project.installedAs === folder) { app.project.installedAs = ''; app.project.touch('installed'); }
      toast('Mod removido do jogo', 'ok', 4000);
    });
  });
}
