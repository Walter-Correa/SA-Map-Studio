// Importação e exportação de mapas em Pawn (.pwn) e IPL.
// Compatível com o que o Map Construction, o Texture Studio e editores parecidos exportam.
import { normalizeMaterial, materialCall, parseColor, toInt } from './materials.js';

const VEHICLE_MIN = 400, VEHICLE_MAX = 611;
export const isVehicleModel = (id) => id >= VEHICLE_MIN && id <= VEHICLE_MAX;

function maskComments(source) {
  const len = source.length;
  let masked = '';
  let inLineCmt = false, inBlockCmt = false, inStr = false;
  for (let i = 0; i < len; i++) {
    const ch = source[i];
    const next = source[i + 1];

    if (inLineCmt) {
      if (ch === '\n') {
        inLineCmt = false;
        masked += '\n';
      } else {
        masked += ' ';
      }
      continue;
    }

    if (inBlockCmt) {
      if (ch === '*' && next === '/') {
        inBlockCmt = false;
        masked += '  ';
        i++;
      } else {
        masked += (ch === '\n' ? '\n' : ' ');
      }
      continue;
    }

    if (inStr) {
      masked += ch;
      if (ch === '\\') {
        i++;
        masked += (source[i] ?? '');
      } else if (ch === '"') {
        inStr = false;
      }
      continue;
    }

    if (ch === '/' && next === '/') {
      inLineCmt = true;
      masked += '  ';
      i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      inBlockCmt = true;
      masked += '  ';
      i++;
      continue;
    }
    if (ch === '"') {
      inStr = true;
      masked += '"';
      continue;
    }
    masked += ch;
  }
  return masked;
}

// Divide os argumentos de uma chamada respeitando strings e parênteses
function splitArgs(s) {
  const out = [];
  let depth = 0, cur = '', str = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (str) { cur += ch; if (ch === '\\') { cur += s[++i] ?? ''; } else if (ch === '"') str = false; continue; }
    if (ch === '"') { str = true; cur += ch; continue; }
    if (ch === '(' || ch === '{' || ch === '[') depth++;
    if (ch === ')' || ch === '}' || ch === ']') depth--;
    if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

const num = (v, def = 0) => {
  if (v === undefined) return def;
  const n = parseFloat(String(v).replace(/^Float:/i, '').replace(/[^\d.eE+\-]/g, ''));
  return Number.isFinite(n) ? n : def;
};
const int = (v, def = 0) => { const n = Math.trunc(num(v, NaN)); return Number.isFinite(n) ? n : def; };
const unquote = (s) => (s || '').trim().replace(/^"|"$/g, '');

const FN_RE = /(?:([A-Za-z_@][\w@]*(?:\s*\[[^\]=;]*\])*)\s*=\s*)?\b(CreateDynamicObjectEx|CreateDynamicObject|CreateObject|CreatePlayerObject|RemoveBuildingForPlayer|RemoveBuilding|AddStaticVehicleEx|AddStaticVehicle|CreateVehicle|ChangeVehicleColor|ChangeVehiclePaintjob|AddVehicleComponent|CreateActor|ApplyActorAnimation|SetActorVirtualWorld|SetActorInvulnerable|SetActorHealth|SetActorFacingAngle|SetActorPos|Create3DTextLabel|CreateDynamic3DTextLabel|CreatePickup|CreateDynamicPickup|GangZoneCreate|GangZoneShowForPlayer|GangZoneShowForAll|TextDrawCreate|CreatePlayerTextDraw|TextDrawFont|TextDrawColor|TextDrawBoxColor|TextDrawBackgroundColor|TextDrawLetterSize|TextDrawTextSize|TextDrawSetOutline|TextDrawSetShadow|TextDrawAlignment|TextDrawSetSelectable|TextDrawSetProportional|TextDrawSetPreviewModel|TextDrawSetPreviewRot|TextDrawSetPreviewVehCol|TextDrawUseBox|MoveDynamicObject|MoveObject|AttachDynamicObjectToObject|AttachObjectToObject|SetDynamicObjectMaterialText|SetDynamicObjectMaterial|SetPlayerObjectMaterialText|SetPlayerObjectMaterial|SetObjectMaterialText|SetObjectMaterial|SetPlayerCameraPos|SetPlayerCameraLookAt|InterpolateCameraPos|InterpolateCameraLookAt|SetPlayerPos|SetPlayerInterior)\s*\(/g;

const varKey = (s) => String(s || '').replace(/\s+/g, '');

// Argumentos nomeados do Pawn (.worldid = 0) viram um mapa à parte
function splitNamed(args) {
  const pos = [], named = {};
  for (const a of args) {
    const m = /^\.(\w+)\s*=\s*([\s\S]*)$/.exec(a);
    if (m) named[m[1].toLowerCase()] = m[2]; else pos.push(a);
  }
  return { pos, named };
}

function extractPreceding(between) {
  const lines = between.split('\n');
  const commentLines = [];
  let blankLines = 0;
  for (const rawLine of lines) {
    const t = rawLine.trim();
    if (!t) {
      blankLines++;
    } else if (t.startsWith('//') || t.startsWith('/*') || t.startsWith('*') || t.endsWith('*/')) {
      commentLines.push(t);
    }
  }
  return {
    preComment: commentLines.join('\n'),
    blankLinesBefore: blankLines,
  };
}

function splitHeaderAndFirstItem(between) {
  const lines = between.split('\n');
  const headerLines = [];
  const itemComments = [];
  let blankCount = 0;
  let hasCodeHeader = false;

  for (let idx = 0; idx < lines.length; idx++) {
    const l = lines[idx];
    const t = l.trim();
    if (t.startsWith('#') || t.startsWith('stock ') || t.startsWith('public ') || t.startsWith('forward ') || t === '{') {
      hasCodeHeader = true;
      headerLines.push(l);
    } else if (hasCodeHeader) {
      if (t.startsWith('//') || t.startsWith('/*') || t.startsWith('*') || t.endsWith('*/')) {
        itemComments.push(t);
      } else if (!t) {
        blankCount++;
      }
    } else {
      headerLines.push(l);
    }
  }

  if (hasCodeHeader) {
    return {
      header: headerLines.join('\n').trim(),
      preComment: itemComments.join('\n'),
      blankLines: blankCount,
    };
  }

  const allComments = [];
  let blanks = 0;
  for (const l of lines) {
    const t = l.trim();
    if (!t) blanks++;
    else if (t.startsWith('//') || t.startsWith('/*') || t.startsWith('*') || t.endsWith('*/')) {
      allComments.push(t);
    }
  }
  return {
    header: '',
    preComment: allComments.join('\n'),
    blankLines: blanks,
  };
}

// Lê o texto e devolve {objects, vehicles, actors, removed, labels, pickups, gangZones, textDraws, cameras, spawn, preservedHeader, rawPawn}
export function parsePwn(source) {
  const masked = maskComments(source);
  const objects = [], vehicles = [], actors = [], removed = [];
  const labels = [], pickups = [], gangZones = [], textDraws = [];
  const shots = [], paths = [];
  let spawn = null, interior = null;
  const vars = new Map();
  let last = null, lastVeh = null, lastActor = null, pendingShot = null, pendingMove = null;
  let lastTopStmtEnd = 0;
  let firstItemSeen = false;
  let preservedHeader = '';

  const childFns = new Set([
    'SetObjectMaterial', 'SetDynamicObjectMaterial', 'SetPlayerObjectMaterial',
    'SetObjectMaterialText', 'SetDynamicObjectMaterialText', 'SetPlayerObjectMaterialText',
    'MoveObject', 'MoveDynamicObject',
    'AttachObjectToObject', 'AttachDynamicObjectToObject',
    'ChangeVehicleColor', 'ChangeVehiclePaintjob', 'AddVehicleComponent',
    'ApplyActorAnimation', 'SetActorVirtualWorld', 'SetActorInvulnerable',
    'SetActorHealth', 'SetActorFacingAngle', 'SetActorPos',
    'GangZoneShowForPlayer', 'GangZoneShowForAll',
    'TextDrawFont', 'TextDrawColor', 'TextDrawBoxColor', 'TextDrawBackgroundColor',
    'TextDrawLetterSize', 'TextDrawTextSize', 'TextDrawSetOutline', 'TextDrawSetShadow',
    'TextDrawAlignment', 'TextDrawSetSelectable', 'TextDrawSetProportional',
    'TextDrawSetPreviewModel', 'TextDrawSetPreviewRot', 'TextDrawSetPreviewVehCol', 'TextDrawUseBox'
  ]);

  const re = new RegExp(FN_RE.source, 'g');
  let m;
  while ((m = re.exec(masked))) {
    const stmtStart = m.index;
    let i = re.lastIndex, depth = 1, str = false;
    for (; i < masked.length && depth > 0; i++) {
      const ch = masked[i];
      if (str) { if (ch === '\\') i++; else if (ch === '"') str = false; continue; }
      if (ch === '"') str = true; else if (ch === '(') depth++; else if (ch === ')') depth--;
    }
    const inner = masked.slice(re.lastIndex, i - 1);
    re.lastIndex = i;
    const stmtEnd = i;
    const { pos: a, named } = splitNamed(splitArgs(inner));
    const fn = m[2], variable = m[1] ? varKey(m[1]) : null;

    let nextNl = source.indexOf('\n', stmtEnd);
    if (nextNl < 0) nextNl = source.length;
    const lineRest = source.slice(stmtEnd, nextNl);
    let inlineComment = '';
    const idxLineCmt = lineRest.indexOf('//');
    const idxBlockCmt = lineRest.indexOf('/*');
    if (idxLineCmt >= 0) {
      inlineComment = lineRest.slice(idxLineCmt + 2).replace(/\r$/, '').trim();
    } else if (idxBlockCmt >= 0) {
      const endBlock = lineRest.indexOf('*/', idxBlockCmt + 2);
      inlineComment = (endBlock >= 0 ? lineRest.slice(idxBlockCmt + 2, endBlock) : lineRest.slice(idxBlockCmt + 2)).replace(/\r$/, '').trim();
    }

    const isChild = childFns.has(fn);
    let preComment = '', blankLinesBefore = 0;
    if (!isChild) {
      const between = source.slice(lastTopStmtEnd, stmtStart);
      if (!firstItemSeen) {
        firstItemSeen = true;
        const res = splitHeaderAndFirstItem(between);
        preservedHeader = res.header;
        preComment = res.preComment;
        blankLinesBefore = res.blankLines;
      } else {
        const res = extractPreceding(between);
        preComment = res.preComment;
        blankLinesBefore = res.blankLinesBefore;
      }
    }
    lastTopStmtEnd = (nextNl < source.length ? nextNl + 1 : source.length);

    if (fn === 'CreateObject' || fn === 'CreateDynamicObject' || fn === 'CreateDynamicObjectEx' || fn === 'CreatePlayerObject') {
      const o = fn === 'CreatePlayerObject' ? 1 : 0;
      if (a.length < 7 + o) continue;
      const raw = {
        x: a[o + 1], y: a[o + 2], z: a[o + 3],
        rx: a[o + 4], ry: a[o + 5], rz: a[o + 6],
        drawDist: fn === 'CreateDynamicObject' ? a[11] : (fn === 'CreateDynamicObjectEx' ? a[7] : a[7 + o]),
        streamDist: fn === 'CreateDynamicObject' ? a[10] : (fn === 'CreateDynamicObjectEx' ? a[8] : undefined),
      };
      const obj = {
        model: int(a[o]), x: num(a[o + 1]), y: num(a[o + 2]), z: num(a[o + 3]),
        rx: num(a[o + 4]), ry: num(a[o + 5]), rz: num(a[o + 6]),
        world: -1, interior: -1, streamDist: 0, drawDist: 0, materials: [],
        comment: inlineComment, preComment, blankLinesBefore,
        raw,
      };
      if (fn === 'CreateDynamicObject') {
        if (a[7] !== undefined) obj.world = int(a[7], -1);
        if (a[8] !== undefined) obj.interior = int(a[8], -1);
        if (a[10] !== undefined) obj.streamDist = num(a[10], 0);
        if (a[11] !== undefined) obj.drawDist = num(a[11], 0);
        if (named.worldid !== undefined || named.world !== undefined) obj.world = int(named.worldid ?? named.world, -1);
        if (named.interiorid !== undefined || named.interior !== undefined) obj.interior = int(named.interiorid ?? named.interior, -1);
        if (named.streamdistance !== undefined || named.streamdist !== undefined) obj.streamDist = num(named.streamdistance ?? named.streamdist, 0);
        if (named.drawdistance !== undefined || named.drawdist !== undefined) obj.drawDist = num(named.drawdistance ?? named.drawdist, 0);
      } else if (fn === 'CreateDynamicObjectEx') {
        if (a[7] !== undefined) obj.drawDist = num(a[7], 0);
        if (a[8] !== undefined) obj.streamDist = num(a[8], 0);
        if (a[9] !== undefined) {
          const w = int(String(a[9]).replace(/[{}]/g, '').trim(), -1);
          if (w !== -1) obj.world = w;
        }
        if (a[10] !== undefined) {
          const it = int(String(a[10]).replace(/[{}]/g, '').trim(), -1);
          if (it !== -1) obj.interior = it;
        }
      } else if (a[7 + o] !== undefined) obj.drawDist = num(a[7 + o], 0);
      if (obj.streamDist < 0) obj.streamDist = 0;
      if (obj.drawDist < 0) obj.drawDist = 0;
      if (interior !== null && obj.interior === -1 && interior > 0) obj.interior = interior;
      objects.push(obj);
      last = obj;
      if (variable) vars.set(variable, obj);
    } else if (fn === 'RemoveBuildingForPlayer' || fn === 'RemoveBuilding') {
      const o = fn === 'RemoveBuildingForPlayer' || a.length >= 6 ? 1 : 0;
      if (a.length < 5 + o) continue;
      const raw = {
        x: a[o + 1], y: a[o + 2], z: a[o + 3],
        radius: a[o + 4],
      };
      const rem = {
        model: int(a[o]), x: num(a[o + 1]), y: num(a[o + 2]), z: num(a[o + 3]),
        radius: num(a[o + 4], 0.25),
        comment: inlineComment, preComment, blankLinesBefore,
        raw,
      };
      removed.push(rem);
    } else if (fn === 'CreateVehicle' || fn === 'AddStaticVehicle' || fn === 'AddStaticVehicleEx') {
      if (a.length < 5) continue;
      const raw = {
        x: a[1], y: a[2], z: a[3], rz: a[4],
      };
      const veh = {
        model: int(a[0]), x: num(a[1]), y: num(a[2]), z: num(a[3]), rz: num(a[4]),
        color1: int(a[5], -1), color2: int(a[6], -1),
        respawn: fn === 'AddStaticVehicle' ? -1 : int(a[7], -1),
        paintjob: -1, components: [],
        comment: inlineComment, preComment, blankLinesBefore,
        raw,
      };
      vehicles.push(veh);
      lastVeh = veh;
      if (variable) vars.set(variable, veh);
    } else if (fn === 'ChangeVehicleColor') {
      const target = (a[0] ? vars.get(varKey(a[0])) : null) || lastVeh;
      if (target && a.length >= 3) { target.color1 = int(a[1], -1); target.color2 = int(a[2], -1); }
    } else if (fn === 'ChangeVehiclePaintjob') {
      const target = (a[0] ? vars.get(varKey(a[0])) : null) || lastVeh;
      if (target && a.length >= 2) target.paintjob = int(a[1], -1);
    } else if (fn === 'AddVehicleComponent') {
      const target = (a[0] ? vars.get(varKey(a[0])) : null) || lastVeh;
      if (target && a.length >= 2) {
        if (!target.components) target.components = [];
        const cid = int(a[1]);
        if (!target.components.includes(cid)) target.components.push(cid);
      }
    } else if (fn === 'MoveDynamicObject' || fn === 'MoveObject') {
      const target = (a[0] ? vars.get(varKey(a[0])) : null) || last;
      if (target && a.length >= 5) {
        target.move = {
          targetX: num(a[1]),
          targetY: num(a[2]),
          targetZ: num(a[3]),
          speed: Math.max(0.01, num(a[4], 3.0)),
          targetRx: a[5] !== undefined ? num(a[5]) : -1000,
          targetRy: a[6] !== undefined ? num(a[6]) : -1000,
          targetRz: a[7] !== undefined ? num(a[7]) : -1000,
          comment: inlineComment,
        };
      }
    } else if (fn === 'AttachDynamicObjectToObject' || fn === 'AttachObjectToObject') {
      const target = (a[0] ? vars.get(varKey(a[0])) : null) || last;
      if (target && a.length >= 5) {
        target.attach = {
          to: a[1] ? String(a[1]).trim() : '',
          ox: num(a[2]),
          oy: num(a[3]),
          oz: num(a[4]),
          rx: a[5] !== undefined ? num(a[5]) : 0,
          ry: a[6] !== undefined ? num(a[6]) : 0,
          rz: a[7] !== undefined ? num(a[7]) : 0,
          syncRot: a[8] !== undefined ? int(a[8]) : 1,
          comment: inlineComment,
        };
      }
    } else if (fn === 'CreateActor') {
      if (a.length >= 5) {
        const actor = {
          skin: int(a[0]),
          x: num(a[1]),
          y: num(a[2]),
          z: num(a[3]),
          rz: num(a[4]),
          world: -1,
          invulnerable: true,
          health: 100,
          comment: inlineComment,
          preComment,
          blankLinesBefore,
          raw: { x: a[1], y: a[2], z: a[3], rz: a[4] },
        };
        actors.push(actor);
        lastActor = actor;
        if (variable) vars.set(variable, actor);
      }
    } else if (fn === 'ApplyActorAnimation') {
      const target = (a[0] ? vars.get(varKey(a[0])) : null) || lastActor;
      if (target && a.length >= 3) {
        target.anim = {
          lib: unquote(a[1]),
          name: unquote(a[2]),
          delta: a[3] !== undefined ? num(a[3], 4.1) : 4.1,
          loop: a[4] !== undefined ? int(a[4], 1) : 1,
          lockx: a[5] !== undefined ? int(a[5], 0) : 0,
          locky: a[6] !== undefined ? int(a[6], 0) : 0,
          freeze: a[7] !== undefined ? int(a[7], 0) : 0,
          time: a[8] !== undefined ? int(a[8], 0) : 0,
        };
      }
    } else if (fn === 'SetActorVirtualWorld') {
      const target = (a[0] ? vars.get(varKey(a[0])) : null) || lastActor;
      if (target && a[1] !== undefined) target.world = int(a[1]);
    } else if (fn === 'SetActorInvulnerable') {
      const target = (a[0] ? vars.get(varKey(a[0])) : null) || lastActor;
      if (target && a[1] !== undefined) target.invulnerable = int(a[1]) !== 0;
    } else if (fn === 'SetActorHealth') {
      const target = (a[0] ? vars.get(varKey(a[0])) : null) || lastActor;
      if (target && a[1] !== undefined) target.health = num(a[1], 100);
    } else if (fn === 'SetActorFacingAngle') {
      const target = (a[0] ? vars.get(varKey(a[0])) : null) || lastActor;
      if (target && a[1] !== undefined) target.rz = num(a[1]);
    } else if (fn === 'SetActorPos') {
      const target = (a[0] ? vars.get(varKey(a[0])) : null) || lastActor;
      if (target && a.length >= 4) { target.x = num(a[1]); target.y = num(a[2]); target.z = num(a[3]); }
    } else if (fn === 'SetObjectMaterial' || fn === 'SetDynamicObjectMaterial' || fn === 'SetPlayerObjectMaterial') {
      const target = (a[0] ? vars.get(varKey(a[0])) : null) || last;
      if (target && a.length >= 5) {
        const mat = normalizeMaterial({
          index: int(a[1]), model: int(a[2]), txd: unquote(a[3]), texture: unquote(a[4]),
          color: a[5] !== undefined ? parseColor(a[5]) : 0,
        });
        if (mat) {
          if (inlineComment) mat.comment = inlineComment;
          target.materials.push(mat);
        }
      }
    } else if (fn === 'SetObjectMaterialText' || fn === 'SetDynamicObjectMaterialText' || fn === 'SetPlayerObjectMaterialText') {
      const target = (a[0] ? vars.get(varKey(a[0])) : null) || last;
      if (target && a.length >= 3) {
        let textArg, indexArg;
        if (String(a[1]).trim().startsWith('"') || (isNaN(Number(a[1])) && !isNaN(Number(a[2])))) {
          textArg = a[1]; indexArg = a[2];
        } else {
          indexArg = a[1]; textArg = a[2];
        }
        const mat = normalizeMaterial({
          index: int(indexArg), text: unquote(textArg).replace(/\\n/g, '\n'),
          size: a[3] !== undefined ? toInt(a[3], 90) : 90,
          font: a[4] ? unquote(a[4]) : 'Arial',
          fontSize: a[5] !== undefined ? toInt(a[5], 24) : 24,
          bold: a[6] !== undefined ? (toInt(a[6], 1) ? 1 : 0) : 1,
          fontColor: a[7] !== undefined ? parseColor(a[7]) : 0xFFFFFFFF,
          backColor: a[8] !== undefined ? parseColor(a[8]) : 0,
          align: a[9] !== undefined ? toInt(a[9], 0) : 0,
        });
        if (mat) {
          if (inlineComment) mat.comment = inlineComment;
          target.materials.push(mat);
        }
      }
    } else if (fn === 'SetPlayerCameraPos') {
      if (a.length >= 3) pendingShot = { pos: { x: num(a[0]), y: num(a[1]), z: num(a[2]) }, look: { x: 0, y: 0, z: 0 }, cut: 'cut' };
    } else if (fn === 'SetPlayerCameraLookAt') {
      if (pendingShot && a.length >= 3) {
        pendingShot.look = { x: num(a[0]), y: num(a[1]), z: num(a[2]) };
        pendingShot.cut = a[3] === 'CAMERA_MOVE' || int(a[3]) === 1 ? 'move' : 'cut';
        shots.push(pendingShot);
        pendingShot = null;
      }
    } else if (fn === 'InterpolateCameraPos') {
      if (a.length >= 7) {
        pendingMove = {
          fromPos: { x: num(a[0]), y: num(a[1]), z: num(a[2]) },
          toPos: { x: num(a[3]), y: num(a[4]), z: num(a[5]) },
          time: Math.max(0, int(a[6])),
          cut: a[7] === 'CAMERA_MOVE' || int(a[7]) === 1 ? 'move' : 'cut',
        };
      }
    } else if (fn === 'InterpolateCameraLookAt') {
      if (pendingMove && a.length >= 6) {
        paths.push({
          fromPos: pendingMove.fromPos, toPos: pendingMove.toPos,
          fromLook: { x: num(a[0]), y: num(a[1]), z: num(a[2]) },
          toLook: { x: num(a[3]), y: num(a[4]), z: num(a[5]) },
          time: pendingMove.time, cut: pendingMove.cut,
        });
        pendingMove = null;
      }
    } else if (fn === 'Create3DTextLabel' || fn === 'CreateDynamic3DTextLabel') {
      if (a.length >= 6) {
        const text = unquote(a[0]).replace(/\\n/g, '\n');
        const color = parseColor(a[1]);
        const x = num(a[2]), y = num(a[3]), z = num(a[4]);
        const drawDist = num(a[5], 50);
        const world = fn === 'CreateDynamic3DTextLabel' ? int(a[9], -1) : int(a[6], 0);
        const interior = fn === 'CreateDynamic3DTextLabel' ? int(a[10], -1) : -1;
        const testLOS = fn === 'CreateDynamic3DTextLabel' ? (int(a[8], 0) ? 1 : 0) : (int(a[7], 0) ? 1 : 0);
        const lbl = {
          text, color, x, y, z, drawDist, world, interior, testLOS,
          comment: inlineComment, preComment, blankLinesBefore,
        };
        labels.push(lbl);
        if (variable) vars.set(variable, lbl);
      }
    } else if (fn === 'CreatePickup' || fn === 'CreateDynamicPickup') {
      if (a.length >= 5) {
        const model = int(a[0]), type = int(a[1], 1);
        const x = num(a[2]), y = num(a[3]), z = num(a[4]);
        const world = a[5] !== undefined ? int(a[5], -1) : -1;
        const pk = {
          model, type, x, y, z, world,
          comment: inlineComment, preComment, blankLinesBefore,
        };
        pickups.push(pk);
        if (variable) vars.set(variable, pk);
      }
    } else if (fn === 'GangZoneCreate') {
      if (a.length >= 4) {
        const gz = {
          minx: num(a[0]), miny: num(a[1]), maxx: num(a[2]), maxy: num(a[3]),
          color: 0xFF000080,
          comment: inlineComment, preComment, blankLinesBefore,
        };
        gangZones.push(gz);
        if (variable) vars.set(variable, gz);
      }
    } else if (fn === 'GangZoneShowForPlayer' || fn === 'GangZoneShowForAll') {
      const zoneArg = fn === 'GangZoneShowForPlayer' ? a[1] : a[0];
      const colorArg = fn === 'GangZoneShowForPlayer' ? a[2] : a[1];
      const target = (zoneArg ? vars.get(varKey(zoneArg)) : null) || gangZones[gangZones.length - 1];
      if (target && colorArg !== undefined) {
        target.color = parseColor(colorArg);
      }
    } else if (fn === 'TextDrawCreate' || fn === 'CreatePlayerTextDraw') {
      const o = fn === 'CreatePlayerTextDraw' ? 1 : 0;
      if (a.length >= 3 + o) {
        const td = {
          isPlayer: Boolean(o),
          x: num(a[o]), y: num(a[o + 1]),
          text: unquote(a[o + 2]).replace(/\\n/g, '\n'),
          font: 1,
          letterSizeX: 0.48, letterSizeY: 1.12,
          textSizeX: 1280, textSizeY: 1280,
          color: 0xE1E1E1FF,
          boxColor: 0x00000080,
          backgroundColor: 0x000000FF,
          shadow: 1,
          outline: 0,
          alignment: 1,
          useBox: 0,
          proportional: 1,
          selectable: 0,
          previewModel: 0,
          previewRotX: 0, previewRotY: 0, previewRotZ: 0, previewZoom: 1,
          previewColor1: -1, previewColor2: -1,
          comment: inlineComment, preComment, blankLinesBefore,
        };
        textDraws.push(td);
        if (variable) vars.set(variable, td);
      }
    } else if (fn === 'TextDrawFont') {
      const target = vars.get(varKey(a[0])) || textDraws[textDraws.length - 1];
      if (target && a[1] !== undefined) target.font = int(a[1], 1);
    } else if (fn === 'TextDrawColor') {
      const target = vars.get(varKey(a[0])) || textDraws[textDraws.length - 1];
      if (target && a[1] !== undefined) target.color = parseColor(a[1]);
    } else if (fn === 'TextDrawBoxColor') {
      const target = vars.get(varKey(a[0])) || textDraws[textDraws.length - 1];
      if (target && a[1] !== undefined) target.boxColor = parseColor(a[1]);
    } else if (fn === 'TextDrawBackgroundColor') {
      const target = vars.get(varKey(a[0])) || textDraws[textDraws.length - 1];
      if (target && a[1] !== undefined) target.backgroundColor = parseColor(a[1]);
    } else if (fn === 'TextDrawLetterSize') {
      const target = vars.get(varKey(a[0])) || textDraws[textDraws.length - 1];
      if (target && a.length >= 3) { target.letterSizeX = num(a[1], 0.48); target.letterSizeY = num(a[2], 1.12); }
    } else if (fn === 'TextDrawTextSize') {
      const target = vars.get(varKey(a[0])) || textDraws[textDraws.length - 1];
      if (target && a.length >= 3) { target.textSizeX = num(a[1], 1280); target.textSizeY = num(a[2], 1280); }
    } else if (fn === 'TextDrawSetOutline') {
      const target = vars.get(varKey(a[0])) || textDraws[textDraws.length - 1];
      if (target && a[1] !== undefined) target.outline = int(a[1], 0);
    } else if (fn === 'TextDrawSetShadow') {
      const target = vars.get(varKey(a[0])) || textDraws[textDraws.length - 1];
      if (target && a[1] !== undefined) target.shadow = int(a[1], 0);
    } else if (fn === 'TextDrawAlignment') {
      const target = vars.get(varKey(a[0])) || textDraws[textDraws.length - 1];
      if (target && a[1] !== undefined) target.alignment = int(a[1], 1);
    } else if (fn === 'TextDrawUseBox') {
      const target = vars.get(varKey(a[0])) || textDraws[textDraws.length - 1];
      if (target && a[1] !== undefined) target.useBox = int(a[1], 0);
    } else if (fn === 'TextDrawSetSelectable') {
      const target = vars.get(varKey(a[0])) || textDraws[textDraws.length - 1];
      if (target && a[1] !== undefined) target.selectable = int(a[1], 0);
    } else if (fn === 'TextDrawSetProportional') {
      const target = vars.get(varKey(a[0])) || textDraws[textDraws.length - 1];
      if (target && a[1] !== undefined) target.proportional = int(a[1], 1);
    } else if (fn === 'TextDrawSetPreviewModel') {
      const target = vars.get(varKey(a[0])) || textDraws[textDraws.length - 1];
      if (target && a[1] !== undefined) target.previewModel = int(a[1], 0);
    } else if (fn === 'TextDrawSetPreviewRot') {
      const target = vars.get(varKey(a[0])) || textDraws[textDraws.length - 1];
      if (target && a.length >= 5) {
        target.previewRotX = num(a[1]); target.previewRotY = num(a[2]); target.previewRotZ = num(a[3]); target.previewZoom = num(a[4], 1);
      }
    } else if (fn === 'TextDrawSetPreviewVehCol') {
      const target = vars.get(varKey(a[0])) || textDraws[textDraws.length - 1];
      if (target && a.length >= 3) {
        target.previewColor1 = int(a[1], -1); target.previewColor2 = int(a[2], -1);
      }
    } else if (fn === 'SetPlayerPos') {
      if (a.length >= 3) spawn = { x: num(a[0]), y: num(a[1]), z: num(a[2]) };
    } else if (fn === 'SetPlayerInterior') {
      if (a.length >= 1) interior = int(a[0]);
    }
  }
  return { objects, vehicles, actors, removed, labels, pickups, gangZones, textDraws, cameras: { shots, paths }, spawn, preservedHeader, rawPawn: source };
}

// =====================================================================  exportar Pawn
export function formatCoord(val, rawStr) {
  if (val === undefined || val === null || isNaN(val)) return '0.0';
  const num = +val || 0;
  // Regra 9: Coordenadas ou valores float que estiverem com valor zero depois do ponto (180.00000, 0.00000), devem ficar assim: 180.0, 0.0
  if (Math.abs(num - Math.round(num)) < 1e-6) {
    const rounded = Math.round(num);
    return (rounded === 0 ? 0 : rounded) + '.0';
  }
  // Preserva exatamente a representação do arquivo importado se o valor não foi modificado
  if (rawStr !== undefined && rawStr !== null) {
    const s = String(rawStr).trim().replace(/^Float:/i, '');
    const parsed = parseFloat(s);
    if (!isNaN(parsed) && Math.abs(parsed - num) < 1e-6) {
      return s;
    }
  }
  // Se for alterado ou novo e tiver casas decimais, formata com até 6 casas sem zeros extras
  let s = num.toFixed(6);
  s = s.replace(/(\.\d*?[1-9])0+$/, '$1');
  return s;
}

const f = (n, d = 4) => formatCoord(n);
const normAngle = (a) => ((+a || 0) % 360 + 360) % 360;


export function sanitizeIdent(name) {
  const base = (name || 'Mapa').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return (/^\d/.test(base) ? 'M' + base : base) || 'Mapa';
}

export const EXPORT_DEFAULTS = {
  objectFn: 'CreateDynamicObject', // ou 'CreateObject'
  layout: 'module',                // 'module' (funções prontas) ou 'lines' (só as linhas)
  includeRemoved: true,
  includeVehicles: true,
  includeActors: true,
  vehicleFn: 'CreateVehicle',      // ou 'AddStaticVehicleEx'
  relative: false,
  includeCameras: true,
  exportArray: false,
  decimals: 5,
};

function commentSuffix(item) {
  if (!item || !item.comment) return '';
  const clean = String(item.comment).replace(/^\/\/\s*/, '').trim();
  return clean ? ` // ${clean}` : '';
}

function objectLine(o, opt, center) {
  const isRel = Boolean(opt.relative && (center.x || center.y || center.z));
  const x = o.x - center.x, y = o.y - center.y, z = o.z - center.z;
  const raw = o.raw || {};
  const fx = formatCoord(x, isRel ? null : raw.x);
  const fy = formatCoord(y, isRel ? null : raw.y);
  const fz = formatCoord(z, isRel ? null : raw.z);
  const frx = formatCoord(o.rx, isRel ? null : raw.rx);
  const fry = formatCoord(o.ry, isRel ? null : raw.ry);
  const frz = formatCoord(o.rz, isRel ? null : raw.rz);
  const base = `${o.model}, ${fx}, ${fy}, ${fz}, ${frx}, ${fry}, ${frz}`;

  if (opt.objectFn === 'CreateObject') {
    return `CreateObject(${base}${o.drawDist > 0 ? ', ' + formatCoord(o.drawDist, raw.drawDist) : ''})`;
  }

  const extra = [];
  const hasStreamOrDraw = o.streamDist > 0 || o.drawDist > 0;
  const hasWorldOrInt = (o.world ?? -1) !== -1 || (o.interior ?? -1) !== -1;
  if (hasStreamOrDraw || hasWorldOrInt) {
    extra.push(o.world ?? -1, o.interior ?? -1);
    if (hasStreamOrDraw) {
      const dd = o.drawDist > 0 ? o.drawDist : 0;
      const sd = o.streamDist > 0 ? o.streamDist : dd;
      const rawSd = raw.streamDist || (raw.drawDist && !o.streamDist ? raw.drawDist : null);
      const rawDd = raw.drawDist || null;
      extra.push(-1, formatCoord(sd, rawSd), formatCoord(dd, rawDd));
    }
  }
  return `CreateDynamicObject(${base}${extra.length ? ', ' + extra.join(', ') : ''})`;
}

function materialLines(o, opt, varName) {
  const fn = opt.objectFn === 'CreateObject' ? 'SetObjectMaterial' : 'SetDynamicObjectMaterial';
  return o.materials.map(m => {
    const call = materialCall(m, varName, fn);
    return m.comment ? `${call} // ${m.comment}` : call;
  });
}

function vehicleLine(v, opt, center) {
  const isRel = Boolean(opt.relative && (center.x || center.y || center.z));
  const x = v.x - center.x, y = v.y - center.y, z = v.z - center.z;
  const raw = v.raw || {};
  const respawn = v.respawn > 0 ? v.respawn : (opt.vehicleFn === 'CreateVehicle' ? -1 : 300);
  return `${opt.vehicleFn}(${v.model}, ${formatCoord(x, isRel ? null : raw.x)}, ${formatCoord(y, isRel ? null : raw.y)}, ${formatCoord(z, isRel ? null : raw.z)}, ${formatCoord(v.rz, isRel ? null : raw.rz)}, ${v.color1 ?? -1}, ${v.color2 ?? -1}, ${respawn});`;
}

export function projectCenter(project) {
  const all = [...project.objects, ...project.vehicles, ...(project.actors || [])];
  if (!all.length) return { x: 0, y: 0, z: 0 };
  let minX = Infinity, minY = Infinity, minZ = Infinity, maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (const o of all) {
    minX = Math.min(minX, o.x); maxX = Math.max(maxX, o.x);
    minY = Math.min(minY, o.y); maxY = Math.max(maxY, o.y);
    minZ = Math.min(minZ, o.z); maxZ = Math.max(maxZ, o.z);
  }
  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2, z: (minZ + maxZ) / 2 };
}

export function exportPawn(project, options = {}) {
  const opt = { ...EXPORT_DEFAULTS, ...options };
  const d = opt.decimals;
  const center = opt.relative ? projectCenter(project) : { x: 0, y: 0, z: 0 };
  const objs = project.objects;
  const vehs = opt.includeVehicles ? project.vehicles : [];
  const actors = (opt.includeActors ? project.actors : []) || [];
  const rems = opt.includeRemoved ? project.removed : [];
  const lines = [];

  const objLines = [];
  const moveFn = opt.objectFn === 'CreateObject' ? 'MoveObject' : 'MoveDynamicObject';
  const attFn = opt.objectFn === 'CreateObject' ? 'AttachObjectToObject' : 'AttachDynamicObjectToObject';
  for (let idx = 0; idx < objs.length; idx++) {
    const o = objs[idx];
    if (o.blankLinesBefore > 0 && idx > 0) objLines.push('');
    if (o.preComment) {
      for (const pl of o.preComment.split('\n')) {
        const t = pl.trim();
        if (t) objLines.push(t.startsWith('//') || t.startsWith('/*') ? t : `// ${t}`);
      }
    }
    const hasExtras = (o.materials && o.materials.length) || o.move || o.attach;
    const cmt = commentSuffix(o);
    if (hasExtras) {
      objLines.push(`objectid = ${objectLine(o, opt, center)};${cmt}`);
      if (o.materials?.length) objLines.push(...materialLines(o, opt, 'objectid'));
      if (o.move) {
        const mx = o.move.targetX - center.x, my = o.move.targetY - center.y, mz = o.move.targetZ - center.z;
        const moveCmt = o.move.comment ? ` // ${o.move.comment}` : '';
        objLines.push(`${moveFn}(objectid, ${f(mx, d)}, ${f(my, d)}, ${f(mz, d)}, ${f(o.move.speed, 2)}, ${f(o.move.targetRx, 2)}, ${f(o.move.targetRy, 2)}, ${f(o.move.targetRz, 2)});${moveCmt}`);
      }
      if (o.attach) {
        const attCmt = o.attach.comment ? ` // ${o.attach.comment}` : '';
        objLines.push(`${attFn}(objectid, ${o.attach.to || 'attachtoid'}, ${f(o.attach.ox, 4)}, ${f(o.attach.oy, 4)}, ${f(o.attach.oz, 4)}, ${f(o.attach.rx, 2)}, ${f(o.attach.ry, 2)}, ${f(o.attach.rz, 2)}, ${o.attach.syncRot ?? 1});${attCmt}`);
      }
    } else objLines.push(objectLine(o, opt, center) + ';' + cmt);
  }

  const vehLines = [];
  for (let idx = 0; idx < vehs.length; idx++) {
    const v = vehs[idx];
    if (v.blankLinesBefore > 0 && idx > 0) vehLines.push('');
    if (v.preComment) {
      for (const pl of v.preComment.split('\n')) {
        const t = pl.trim();
        if (t) vehLines.push(t.startsWith('//') || t.startsWith('/*') ? t : `// ${t}`);
      }
    }
    const hasMods = (v.paintjob !== undefined && v.paintjob >= 0) || (v.components && v.components.length > 0);
    const cmt = commentSuffix(v);
    if (hasMods) {
      vehLines.push(`vehicleid = ${vehicleLine(v, opt, center)}${cmt}`);
      if (v.paintjob !== undefined && v.paintjob >= 0) vehLines.push(`ChangeVehiclePaintjob(vehicleid, ${v.paintjob});`);
      for (const comp of (v.components || [])) vehLines.push(`AddVehicleComponent(vehicleid, ${comp});`);
    } else {
      vehLines.push(vehicleLine(v, opt, center) + cmt);
    }
  }

  const actorLines = [];
  for (let idx = 0; idx < actors.length; idx++) {
    const a = actors[idx];
    if (a.blankLinesBefore > 0 && idx > 0) actorLines.push('');
    if (a.preComment) {
      for (const pl of a.preComment.split('\n')) {
        const t = pl.trim();
        if (t) actorLines.push(t.startsWith('//') || t.startsWith('/*') ? t : `// ${t}`);
      }
    }
    const isRel = Boolean(opt.relative && (center.x || center.y || center.z));
    const ax = a.x - center.x, ay = a.y - center.y, az = a.z - center.z;
    const cmt = commentSuffix(a);
    actorLines.push(`actorid = CreateActor(${a.skin}, ${formatCoord(ax, isRel ? null : a.raw?.x)}, ${formatCoord(ay, isRel ? null : a.raw?.y)}, ${formatCoord(az, isRel ? null : a.raw?.z)}, ${formatCoord(a.rz, isRel ? null : a.raw?.rz)});${cmt}`);
    if ((a.world ?? -1) !== -1) actorLines.push(`SetActorVirtualWorld(actorid, ${a.world});`);
    if (a.invulnerable) actorLines.push('SetActorInvulnerable(actorid, 1);');
    if (a.health !== undefined && a.health !== 100) actorLines.push(`SetActorHealth(actorid, ${formatCoord(a.health)});`);
    if (a.anim) {
      actorLines.push(`ApplyActorAnimation(actorid, "${a.anim.lib}", "${a.anim.name}", ${formatCoord(a.anim.delta)}, ${a.anim.loop ?? 1}, ${a.anim.lockx ?? 0}, ${a.anim.locky ?? 0}, ${a.anim.freeze ?? 0}, ${a.anim.time ?? 0});`);
    }
  }

  const remLines = [];
  for (let idx = 0; idx < rems.length; idx++) {
    const r = rems[idx];
    if (r.blankLinesBefore > 0 && idx > 0) remLines.push('');
    if (r.preComment) {
      for (const pl of r.preComment.split('\n')) {
        const t = pl.trim();
        if (t) remLines.push(t.startsWith('//') || t.startsWith('/*') ? t : `// ${t}`);
      }
    }
    remLines.push(`RemoveBuildingForPlayer(playerid, ${r.model}, ${formatCoord(r.x, r.raw?.x)}, ${formatCoord(r.y, r.raw?.y)}, ${formatCoord(r.z, r.raw?.z)}, ${formatCoord(r.radius ?? 0.25, r.raw?.radius)});${commentSuffix(r)}`);
  }

  const labelLines = [];
  const labels = project.labels || [];
  for (let idx = 0; idx < labels.length; idx++) {
    const l = labels[idx];
    if (l.blankLinesBefore > 0 && idx > 0) labelLines.push('');
    if (l.preComment) {
      for (const pl of l.preComment.split('\n')) {
        const t = pl.trim();
        if (t) labelLines.push(t.startsWith('//') || t.startsWith('/*') ? t : `// ${t}`);
      }
    }
    const isRel = Boolean(opt.relative && (center.x || center.y || center.z));
    const lx = l.x - center.x, ly = l.y - center.y, lz = l.z - center.z;
    const cmt = commentSuffix(l);
    const colorHex = '0x' + (Number(l.color) >>> 0).toString(16).toUpperCase().padStart(8, '0');
    const escText = JSON.stringify(l.text || '');
    if (opt.objectFn === 'CreateObject') {
      labelLines.push(`Create3DTextLabel(${escText}, ${colorHex}, ${formatCoord(lx)}, ${formatCoord(ly)}, ${formatCoord(lz)}, ${formatCoord(l.drawDist || 50)}, ${l.world ?? 0}, ${l.testLOS ? 1 : 0});${cmt}`);
    } else {
      labelLines.push(`CreateDynamic3DTextLabel(${escText}, ${colorHex}, ${formatCoord(lx)}, ${formatCoord(ly)}, ${formatCoord(lz)}, ${formatCoord(l.drawDist || 50)}, INVALID_PLAYER_ID, INVALID_VEHICLE_ID, ${l.testLOS ? 1 : 0}, ${l.world ?? -1}, ${l.interior ?? -1});${cmt}`);
    }
  }

  const pickupLines = [];
  const pickups = project.pickups || [];
  for (let idx = 0; idx < pickups.length; idx++) {
    const pk = pickups[idx];
    if (pk.blankLinesBefore > 0 && idx > 0) pickupLines.push('');
    if (pk.preComment) {
      for (const pl of pk.preComment.split('\n')) {
        const t = pl.trim();
        if (t) pickupLines.push(t.startsWith('//') || t.startsWith('/*') ? t : `// ${t}`);
      }
    }
    const isRel = Boolean(opt.relative && (center.x || center.y || center.z));
    const px = pk.x - center.x, py = pk.y - center.y, pz = pk.z - center.z;
    const cmt = commentSuffix(pk);
    if (opt.objectFn === 'CreateObject') {
      pickupLines.push(`CreatePickup(${pk.model}, ${pk.type ?? 1}, ${formatCoord(px)}, ${formatCoord(py)}, ${formatCoord(pz)}, ${pk.world ?? -1});${cmt}`);
    } else {
      pickupLines.push(`CreateDynamicPickup(${pk.model}, ${pk.type ?? 1}, ${formatCoord(px)}, ${formatCoord(py)}, ${formatCoord(pz)}, ${pk.world ?? -1});${cmt}`);
    }
  }

  const gangZoneLines = [];
  const gangZones = project.gangZones || [];
  for (let idx = 0; idx < gangZones.length; idx++) {
    const gz = gangZones[idx];
    if (gz.blankLinesBefore > 0 && idx > 0) gangZoneLines.push('');
    if (gz.preComment) {
      for (const pl of gz.preComment.split('\n')) {
        const t = pl.trim();
        if (t) gangZoneLines.push(t.startsWith('//') || t.startsWith('/*') ? t : `// ${t}`);
      }
    }
    const colorHex = '0x' + (Number(gz.color) >>> 0).toString(16).toUpperCase().padStart(8, '0');
    const minx = gz.minx ?? gz.minX ?? 0;
    const miny = gz.miny ?? gz.minY ?? 0;
    const maxx = gz.maxx ?? gz.maxX ?? 0;
    const maxy = gz.maxy ?? gz.maxY ?? 0;
    const cmt = commentSuffix(gz);
    gangZoneLines.push(`gangzoneid = GangZoneCreate(${formatCoord(minx)}, ${formatCoord(miny)}, ${formatCoord(maxx)}, ${formatCoord(maxy)});${cmt}`);
    gangZoneLines.push(`GangZoneShowForAll(gangzoneid, ${colorHex});`);
  }

  const textDrawLines = [];
  const textDraws = project.textDraws || [];
  for (let idx = 0; idx < textDraws.length; idx++) {
    const td = textDraws[idx];
    const align = (td.font === 4 || td.font === 5) ? 1 : (td.align ?? td.alignment ?? 1);
    const isTextNoBox = (td.font <= 3) && !td.useBox;
    const expSizeX = isTextNoBox ? (align === 3 ? 0.0 : 640.0) : (td.textSizeX ?? (td.font === 4 ? 64.0 : 640.0));
    const expSizeY = isTextNoBox ? (align === 2 ? 640.0 : 480.0) : (td.textSizeY ?? (td.font === 4 ? 64.0 : 100.0));
    const prefix = td.isPlayer ? 'PlayerText:' : 'Text:';
    const createFn = td.isPlayer ? 'CreatePlayerTextDraw' : 'TextDrawCreate';
    const cmt = commentSuffix(td);
    let rawText = String(td.text || (td.font === 4 ? 'hud:radardisc' : '_')).trim().replace(/^"|"$/g, '');
    if (td.font === 4) {
      const colon = rawText.indexOf(':');
      if (colon !== -1) {
        const libPart = rawText.slice(0, colon).toLowerCase();
        const texPart = rawText.slice(colon + 1);
        if (libPart === 'loadscs' || libPart === 'loadsc') {
          const lowTex = texPart.toLowerCase();
          if (lowTex.startsWith('loadsc')) {
            rawText = `${lowTex}:${lowTex}`;
          } else {
            rawText = 'LOADSCS:' + lowTex;
          }
        } else if (libPart === 'loadsuk') {
          rawText = 'LOADSUK:' + texPart.toLowerCase();
        } else if (libPart === 'hud') {
          if (texPart.toLowerCase() === 'radar_ring' || texPart.toLowerCase() === 'radarringplane') {
            rawText = 'hud:radarRingPlane';
          } else {
            rawText = 'hud:' + texPart;
          }
        } else if (libPart.startsWith('ld_')) {
          rawText = libPart.toUpperCase() + ':' + texPart.toLowerCase();
        }
      }
    }
    const escText = JSON.stringify(rawText);
    let colVal = td.color ?? 0xFFFFFFFF;
    if (td.font === 4 && (colVal === 0 || colVal === 0xFF || (colVal & 0xFF) === 0)) colVal = 0xFFFFFFFF;
    const cHex = '0x' + (Number(colVal) >>> 0).toString(16).toUpperCase().padStart(8, '0');
    const bHex = '0x' + (Number(td.boxColor) >>> 0).toString(16).toUpperCase().padStart(8, '0');
    const rawBg = td.font === 5 ? (td.useBox ? td.boxColor : 0x00000000) : td.backgroundColor;
    const bgHex = '0x' + (Number(rawBg) >>> 0).toString(16).toUpperCase().padStart(8, '0');
    const tdVar = `td_${idx}`;
    textDrawLines.push(`new ${prefix}${tdVar} = ${createFn}(${td.isPlayer ? 'playerid, ' : ''}${formatCoord(td.x, null)}, ${formatCoord(td.y, null)}, ${escText});${cmt}`);
    textDrawLines.push(`TextDrawFont(${tdVar}, ${td.font ?? 1});`);
    if (td.font === 4) {
      textDrawLines.push(`TextDrawSetString(${tdVar}, ${escText});`);
    }
    const letX = td.font === 4 ? (td.letterSizeX || 0.5) : (td.letterSizeX ?? 0.35);
    const letY = td.font === 4 ? (td.letterSizeY || 1.0) : (td.letterSizeY ?? 1.4);
    textDrawLines.push(`TextDrawLetterSize(${tdVar}, ${formatCoord(letX, null)}, ${formatCoord(letY, null)});`);
    textDrawLines.push(`TextDrawTextSize(${tdVar}, ${formatCoord(expSizeX, null)}, ${formatCoord(expSizeY, null)});`);
    textDrawLines.push(`TextDrawColor(${tdVar}, ${cHex});`);
    textDrawLines.push(`TextDrawSetOutline(${tdVar}, ${(td.font === 4 || td.font === 5) ? 0 : (td.outline ?? 0)});`);
    textDrawLines.push(`TextDrawSetShadow(${tdVar}, ${(td.font === 4 || td.font === 5) ? 0 : (td.shadow ?? 1)});`);
    textDrawLines.push(`TextDrawAlignment(${tdVar}, ${align});`);
    if (td.useBox && td.font !== 5 && td.font !== 4) {
      textDrawLines.push(`TextDrawUseBox(${tdVar}, 1);`);
      textDrawLines.push(`TextDrawBoxColor(${tdVar}, ${bHex});`);
    }
    textDrawLines.push(`TextDrawBackgroundColor(${tdVar}, ${bgHex});`);
    textDrawLines.push(`TextDrawSetProportional(${tdVar}, ${td.proportional ?? 1});`);
    if (td.selectable) textDrawLines.push(`TextDrawSetSelectable(${tdVar}, 1);`);
    if (td.font === 5 && td.previewModel) {
      textDrawLines.push(`TextDrawSetPreviewModel(${tdVar}, ${td.previewModel});`);
      textDrawLines.push(`TextDrawSetPreviewRot(${tdVar}, ${formatCoord(td.previewRotX ?? -16)}, ${formatCoord(td.previewRotY ?? 0)}, ${formatCoord(td.previewRotZ ?? -55)}, ${formatCoord(td.previewZoom || 1)});`);
      textDrawLines.push(`TextDrawSetPreviewVehCol(${tdVar}, ${td.previewColor1 ?? 1}, ${td.previewColor2 ?? 1});`);
    }
  }

  const cams = opt.includeCameras ? cameraFunctions(project.cameras) : { code: '', usage: [] };
  const needObjId = objs.some(o => (o.materials && o.materials.length) || o.move || o.attach);
  const needVehId = vehs.some(v => (v.paintjob !== undefined && v.paintjob >= 0) || (v.components && v.components.length > 0));
  const needActorId = actorLines.length > 0;
  const needGzId = gangZoneLines.length > 0;

  // Array format lines
  const arrayLines = [];
  if (opt.exportArray && objs.length) {
    arrayLines.push('// Array de coordenadas dos objetos: Model, X, Y, Z, RX, RY, RZ');
    arrayLines.push('new Float:MapObjects[][7] = {');
    for (let idx = 0; idx < objs.length; idx++) {
      const o = objs[idx];
      if (o.preComment) {
        for (const pl of o.preComment.split('\n')) {
          const t = pl.trim();
          if (t) arrayLines.push('    ' + (t.startsWith('//') || t.startsWith('/*') ? t : `// ${t}`));
        }
      }
      const isRel = Boolean(opt.relative && (center.x || center.y || center.z));
      const x = o.x - center.x, y = o.y - center.y, z = o.z - center.z;
      const raw = o.raw || {};
      const fx = formatCoord(x, isRel ? null : raw.x);
      const fy = formatCoord(y, isRel ? null : raw.y);
      const fz = formatCoord(z, isRel ? null : raw.z);
      const frx = formatCoord(o.rx, isRel ? null : raw.rx);
      const fry = formatCoord(o.ry, isRel ? null : raw.ry);
      const frz = formatCoord(o.rz, isRel ? null : raw.rz);
      const comma = (idx === objs.length - 1) ? '' : ',';
      arrayLines.push(`    { ${o.model}, ${fx}, ${fy}, ${fz}, ${frx}, ${fry}, ${frz} }${comma}${commentSuffix(o)}`);
    }
    arrayLines.push('};');
  }

  if (opt.layout === 'lines') {
    if (project.pwnHeader) lines.push(project.pwnHeader, '');
    if (opt.relative) lines.push(`// Posições relativas ao centro (${f(center.x, 4)}, ${f(center.y, 4)}, ${f(center.z, 4)})`);
    if (opt.exportArray && objs.length) {
      lines.push(...arrayLines);
      lines.push('');
      lines.push('for (new i = 0; i < sizeof(MapObjects); i++) {');
      lines.push(`    ${opt.objectFn === 'CreateObject' ? 'CreateObject' : 'CreateDynamicObject'}(floatround(MapObjects[i][0]), MapObjects[i][1], MapObjects[i][2], MapObjects[i][3], MapObjects[i][4], MapObjects[i][5], MapObjects[i][6]);`);
      lines.push('}');
      const extraObjs = objs.filter(o => (o.materials && o.materials.length) || o.move || o.attach);
      if (extraObjs.length) {
        lines.push('', '// Extras dos objetos (texturas, movimentação e anexação):');
        if (needObjId) lines.push('new objectid;');
        for (const o of extraObjs) {
          lines.push(`objectid = ${objectLine(o, opt, center)};${commentSuffix(o)}`);
          if (o.materials?.length) lines.push(...materialLines(o, opt, 'objectid'));
          if (o.move) {
            const mx = o.move.targetX - center.x, my = o.move.targetY - center.y, mz = o.move.targetZ - center.z;
            const moveCmt = o.move.comment ? ` // ${o.move.comment}` : '';
            lines.push(`${moveFn}(objectid, ${f(mx, d)}, ${f(my, d)}, ${f(mz, d)}, ${f(o.move.speed, 2)}, ${f(o.move.targetRx, 2)}, ${f(o.move.targetRy, 2)}, ${f(o.move.targetRz, 2)});${moveCmt}`);
          }
          if (o.attach) {
            const attCmt = o.attach.comment ? ` // ${o.attach.comment}` : '';
            lines.push(`${attFn}(objectid, ${o.attach.to || 'attachtoid'}, ${f(o.attach.ox, 4)}, ${f(o.attach.oy, 4)}, ${f(o.attach.oz, 4)}, ${f(o.attach.rx, 2)}, ${f(o.attach.ry, 2)}, ${f(o.attach.rz, 2)}, ${o.attach.syncRot ?? 1});${attCmt}`);
          }
        }
      }
    } else {
      if (needObjId) lines.push('new objectid;');
      lines.push(...objLines);
    }
    if (needVehId) lines.push('new vehicleid;');
    if (needActorId) lines.push('new actorid;');
    if (needGzId) lines.push('new gangzoneid;');
    if (vehLines.length) lines.push('', ...vehLines);
    if (actorLines.length) lines.push('', '// Actors:', ...actorLines);
    if (labelLines.length) lines.push('', '// Textos 3D:', ...labelLines);
    if (pickupLines.length) lines.push('', '// Pickups:', ...pickupLines);
    if (gangZoneLines.length) lines.push('', '// GangZones:', ...gangZoneLines);
    if (textDrawLines.length) lines.push('', '// TextDraws:', ...textDrawLines);
    if (remLines.length) lines.push('', '// Coloque em OnPlayerConnect (Objetos removidos):', ...remLines);
    if (cams.code) lines.push('', cams.code);
    return lines.join('\n') + '\n';
  }

  const id = sanitizeIdent(project.name).slice(0, 17).replace(/_+$/, ''); // nomes do Pawn: até 31 letras
  const date = new Date().toLocaleDateString('pt-BR');
  if (project.pwnHeader) lines.push(project.pwnHeader, '');
  lines.push('// ================================================================');
  lines.push(`// Mapa: ${project.name}`);
  lines.push(`// Gerado pelo SA Map Studio em ${date}`);
  lines.push(`// Objetos: ${objs.length}   Veículos: ${vehs.length}   Actors: ${actors.length}   Objetos removidos: ${rems.length}`);
  if (labels.length || pickups.length || gangZones.length || textDraws.length) {
    lines.push(`// Textos 3D: ${labels.length}   Pickups: ${pickups.length}   GangZones: ${gangZones.length}   TextDraws: ${textDraws.length}`);
  }
  lines.push('// ----------------------------------------------------------------');
  lines.push('// Como usar:');
  lines.push(`//   OnGameModeInit():   Mapa_${id}_Carregar();`);
  if (remLines.length) lines.push(`//   OnPlayerConnect():  Mapa_${id}_Remover(playerid);`);
  if (opt.objectFn === 'CreateDynamicObject') lines.push('//   Requer o plugin streamer (#include <streamer>).');
  if (cams.usage.length) { lines.push('//   Câmeras (chame quando quiser, com o jogador já spawnado):'); for (const u of cams.usage) lines.push('//     ' + u); }
  if (opt.relative) lines.push(`//   Posições relativas: some (${f(center.x, 4)}, ${f(center.y, 4)}, ${f(center.z, 4)}) ou passe a origem.`);
  lines.push('// ================================================================');
  lines.push('');

  if (opt.exportArray && objs.length) {
    lines.push(...arrayLines);
    lines.push('');
  }

  lines.push(`stock Mapa_${id}_Carregar()`);
  lines.push('{');
  if (needObjId) lines.push('    new objectid;');
  if (needVehId) lines.push('    new vehicleid;');
  if (needActorId) lines.push('    new actorid;');
  if (needGzId) lines.push('    new gangzoneid;');

  const indent = (l) => (l === '' ? '' : '    ' + l);
  if (opt.exportArray && objs.length) {
    lines.push('    for (new i = 0; i < sizeof(MapObjects); i++)');
    lines.push('    {');
    lines.push(`        ${opt.objectFn === 'CreateObject' ? 'CreateObject' : 'CreateDynamicObject'}(floatround(MapObjects[i][0]), MapObjects[i][1], MapObjects[i][2], MapObjects[i][3], MapObjects[i][4], MapObjects[i][5], MapObjects[i][6]);`);
    lines.push('    }');
    const extraObjs = objs.filter(o => (o.materials && o.materials.length) || o.move || o.attach);
    if (extraObjs.length) {
      lines.push('    // Extras dos objetos (texturas, movimentação e anexação):');
      for (const o of extraObjs) {
        lines.push(`    objectid = ${objectLine(o, opt, center)};${commentSuffix(o)}`);
        if (o.materials?.length) for (const ml of materialLines(o, opt, 'objectid')) lines.push('    ' + ml);
        if (o.move) {
          const mx = o.move.targetX - center.x, my = o.move.targetY - center.y, mz = o.move.targetZ - center.z;
          const moveCmt = o.move.comment ? ` // ${o.move.comment}` : '';
          lines.push(`    ${moveFn}(objectid, ${f(mx, d)}, ${f(my, d)}, ${f(mz, d)}, ${f(o.move.speed, 2)}, ${f(o.move.targetRx, 2)}, ${f(o.move.targetRy, 2)}, ${f(o.move.targetRz, 2)});${moveCmt}`);
        }
        if (o.attach) {
          const attCmt = o.attach.comment ? ` // ${o.attach.comment}` : '';
          lines.push(`    ${attFn}(objectid, ${o.attach.to || 'attachtoid'}, ${f(o.attach.ox, 4)}, ${f(o.attach.oy, 4)}, ${f(o.attach.oz, 4)}, ${f(o.attach.rx, 2)}, ${f(o.attach.ry, 2)}, ${f(o.attach.rz, 2)}, ${o.attach.syncRot ?? 1});${attCmt}`);
        }
      }
    }
  } else {
    for (const l of objLines) lines.push(indent(l));
  }

  if (vehLines.length) { if (objLines.length || opt.exportArray) lines.push(''); for (const l of vehLines) lines.push(indent(l)); }
  if (actorLines.length) { lines.push(''); for (const l of actorLines) lines.push(indent(l)); }
  if (labelLines.length) { lines.push('', '    // Textos 3D:'); for (const l of labelLines) lines.push(indent(l)); }
  if (pickupLines.length) { lines.push('', '    // Pickups:'); for (const l of pickupLines) lines.push(indent(l)); }
  if (gangZoneLines.length) { lines.push('', '    // GangZones:'); for (const l of gangZoneLines) lines.push(indent(l)); }
  if (textDrawLines.length) { lines.push('', '    // TextDraws:'); for (const l of textDrawLines) lines.push(indent(l)); }
  lines.push('    return 1;');
  lines.push('}');
  if (remLines.length) {
    lines.push('');
    lines.push(`stock Mapa_${id}_Remover(playerid)`);
    lines.push('{');
    for (const l of remLines) lines.push(indent(l));
    lines.push('    return 1;');
    lines.push('}');
  }
  if (cams.code) { lines.push(''); lines.push(cams.code); }
  return lines.join('\n') + '\n';
}
export const exportPwn = exportPawn;

export function exportIpl(project, quatOf, modelName) {
  const lines = ['# Gerado pelo SA Map Studio', '# Prédios removidos não existem em IPL: apague-os no IPL original do jogo.', 'inst'];
  for (const o of project.objects) {
    const q = quatOf(o);
    const interior = o.interior > 0 ? o.interior : 0;
    lines.push(`${o.model}, ${modelName(o.model)}, ${interior}, ${f(o.x, 6)}, ${f(o.y, 6)}, ${f(o.z, 6)}, ${f(-q.x, 8)}, ${f(-q.y, 8)}, ${f(-q.z, 8)}, ${f(q.w, 8)}, -1`);
  }
  lines.push('end');
  return lines.join('\n') + '\n';
}

// ---------------------------------------------------------------------------
// Câmeras: pontos fixos (SetPlayerCameraPos/LookAt) e movimentos (InterpolateCamera*)
// ---------------------------------------------------------------------------
const camIdent = (prefix, name, used) => {
  let base = (prefix + sanitizeIdent(name)).slice(0, 28);
  let id = base, i = 2;
  while (used.has(id.toLowerCase())) id = base.slice(0, 26) + '_' + i++;
  used.add(id.toLowerCase());
  return id;
};
const p3 = (v) => `${f(v.x, 4)}, ${f(v.y, 4)}, ${f(v.z, 4)}`;
const cutName = (c) => (c === 'move' ? 'CAMERA_MOVE' : 'CAMERA_CUT');

export function cameraFunctions(cameras) {
  const shots = cameras?.shots || [], paths = (cameras?.paths || []).filter(p => p.keys.length);
  if (!shots.length && !paths.length) return { code: '', usage: [] };
  const used = new Set();
  const out = [], usage = [];
  for (const s of shots) {
    const fn = camIdent('CamFixa_', s.name, used);
    usage.push(`${fn}(playerid);  // ${s.name}`);
    out.push(`// Câmera fixa: ${s.name}`, `stock ${fn}(playerid)`, '{',
      `    SetPlayerCameraPos(playerid, ${p3(s.pos)});`,
      `    SetPlayerCameraLookAt(playerid, ${p3(s.look)}, ${cutName(s.cut)});`,
      '    return 1;', '}', '');
  }
  for (const p of paths) {
    const fn = camIdent('CamMov_', p.name, used);
    usage.push(`${fn}(playerid, 0);  // ${p.name}`);
    const k = p.keys;
    const total = k.slice(1).reduce((s, x) => s + x.time + x.hold, 0);
    out.push(`// Movimento de câmera: ${p.name} (${k.length - 1} ${k.length - 1 === 1 ? 'passo' : 'passos'}, ${(total / 1000).toFixed(1)} s)`,
      `forward ${fn}(playerid, step);`, `public ${fn}(playerid, step)`, '{');
    if (k.length === 1) {
      out.push(`    #pragma unused step`, `    SetPlayerCameraPos(playerid, ${p3(k[0].pos)});`, `    SetPlayerCameraLookAt(playerid, ${p3(k[0].look)}, CAMERA_CUT);`, '    return 1;', '}', '');
      continue;
    }
    out.push('    switch (step)', '    {');
    for (let s = 0; s < k.length - 1; s++) {
      const a = k[s], b = k[s + 1];
      const time = Math.max(1, b.time | 0);
      out.push(`        case ${s}:`, '        {',
        `            InterpolateCameraPos(playerid, ${p3(a.pos)}, ${p3(b.pos)}, ${time}, ${cutName(b.cut)});`,
        `            InterpolateCameraLookAt(playerid, ${p3(a.look)}, ${p3(b.look)}, ${time}, ${cutName(b.cut)});`,
        `            SetTimerEx("${fn}", ${time + (b.hold | 0)}, false, "ii", playerid, ${s + 1});`,
        '        }');
    }
    if (p.end === 'behind') out.push('        default:', '        {', '            SetCameraBehindPlayer(playerid);', '        }');
    else if (p.end === 'loop') out.push('        default:', '        {', `            ${fn}(playerid, 0);`, '        }');
    out.push('    }', '    return 1;', '}', '');
  }
  return { code: out.join('\n'), usage };
}
if (typeof window !== 'undefined') window.exportPawn = exportPawn;

