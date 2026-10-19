// Projeto: objetos criados, veículos e prédios removidos, com desfazer/refazer.
import { isVehicleModel } from './pwn.js';
import { normalizeMaterial } from './materials.js';
import { updateRaceCheckpointsChain } from '../world/checkpoints.js';

let uidCounter = 1;
let _globalOpSeq = 0;
const newUid = () => 'o' + (Date.now().toString(36)) + (uidCounter++).toString(36);

export function makeObject(data) {
  return {
    uid: data.uid || newUid(),
    model: data.model | 0,
    x: +data.x || 0, y: +data.y || 0, z: +data.z || 0,
    rx: +data.rx || 0, ry: +data.ry || 0, rz: +data.rz || 0,
    world: data.world ?? -1, interior: data.interior ?? -1,
    streamDist: +data.streamDist || 0, drawDist: +data.drawDist || 0,
    comment: data.comment ? String(data.comment) : '',
    preComment: data.preComment ? String(data.preComment) : '',
    blankLinesBefore: +data.blankLinesBefore || 0,
    projectId: data.projectId || '',
    raw: data.raw ? { ...data.raw } : null,
    materials: (data.materials || []).map(normalizeMaterial).filter(Boolean)
      .filter((m, i, all) => all.findLastIndex(x => x.index === m.index) === i) // um por índice (o último vale)
      .sort((a, b) => a.index - b.index),
    move: data.move ? {
      targetX: +data.move.targetX || 0,
      targetY: +data.move.targetY || 0,
      targetZ: +data.move.targetZ || 0,
      speed: Math.max(0.01, +data.move.speed || 3.0),
      targetRx: data.move.targetRx !== undefined ? +data.move.targetRx : -1000,
      targetRy: data.move.targetRy !== undefined ? +data.move.targetRy : -1000,
      targetRz: data.move.targetRz !== undefined ? +data.move.targetRz : -1000,
    } : null,
    attach: data.attach ? {
      to: data.attach.to || '',
      type: data.attach.type || 'object',
      ox: +data.attach.ox || 0, oy: +data.attach.oy || 0, oz: +data.attach.oz || 0,
      rx: +data.attach.rx || 0, ry: +data.attach.ry || 0, rz: +data.attach.rz || 0,
      syncRot: data.attach.syncRot ?? 1,
      comment: data.attach.comment ? String(data.attach.comment) : '',
    } : null,
  };
}

export function makeVehicle(data) {
  return {
    uid: data.uid || newUid(),
    model: data.model | 0,
    x: +data.x || 0, y: +data.y || 0, z: +data.z || 0, rz: +data.rz || 0,
    color1: data.color1 ?? -1, color2: data.color2 ?? -1, respawn: data.respawn ?? -1,
    paintjob: data.paintjob ?? -1,
    comment: data.comment ? String(data.comment) : '',
    preComment: data.preComment ? String(data.preComment) : '',
    blankLinesBefore: +data.blankLinesBefore || 0,
    projectId: data.projectId || '',
    raw: data.raw ? { ...data.raw } : null,
    components: Array.isArray(data.components) ? [...data.components] : [],
  };
}

export function makeActor(data) {
  return {
    uid: data.uid || newUid(),
    skin: data.skin !== undefined ? (data.skin | 0) : (data.model | 0 || 0),
    x: +data.x || 0, y: +data.y || 0, z: +data.z || 0, rz: +data.rz || 0,
    world: data.world ?? -1,
    invulnerable: data.invulnerable ?? true,
    health: data.health !== undefined ? +data.health : 100,
    comment: data.comment ? String(data.comment) : '',
    preComment: data.preComment ? String(data.preComment) : '',
    blankLinesBefore: +data.blankLinesBefore || 0,
    projectId: data.projectId || '',
    raw: data.raw ? { ...data.raw } : null,
    anim: data.anim ? {
      lib: String(data.anim.lib || 'PED'),
      name: String(data.anim.name || 'IDLE_chat'),
      delta: +data.anim.delta || 4.1,
      loop: data.anim.loop ?? 1,
      lockx: data.anim.lockx ?? 0,
      locky: data.anim.locky ?? 0,
      freeze: data.anim.freeze ?? 0,
      time: +data.anim.time || 0,
    } : null,
  };
}

export function makeRemoved(data) {
  return {
    uid: data.uid || newUid(),
    model: data.model | 0, x: +data.x || 0, y: +data.y || 0, z: +data.z || 0,
    radius: data.radius ?? 0.25, name: data.name || '',
    comment: data.comment ? String(data.comment) : '',
    preComment: data.preComment ? String(data.preComment) : '',
    blankLinesBefore: +data.blankLinesBefore || 0,
    projectId: data.projectId || '',
    raw: data.raw ? { ...data.raw } : null,
  };
}

export function makeLabel(data) {
  return {
    uid: data.uid || newUid(),
    text: data.text !== undefined ? String(data.text) : 'Texto 3D',
    color: data.color !== undefined ? (data.color | 0) : 0xFFFFFFFF,
    x: +data.x || 0, y: +data.y || 0, z: +data.z || 0,
    drawDist: data.drawDist !== undefined ? +data.drawDist : 40.0,
    scale: data.scale !== undefined ? +data.scale : 1.0,
    world: data.world !== undefined ? (data.world | 0) : 0,
    testLOS: data.testLOS ? 1 : 0,
    comment: data.comment ? String(data.comment) : '',
    preComment: data.preComment ? String(data.preComment) : '',
    blankLinesBefore: +data.blankLinesBefore || 0,
    projectId: data.projectId || '',
    raw: data.raw ? { ...data.raw } : null,
  };
}

export function makePickup(data) {
  return {
    uid: data.uid || newUid(),
    model: data.model !== undefined ? (data.model | 0) : 1240,
    type: data.type !== undefined ? (data.type | 0) : 1,
    x: +data.x || 0, y: +data.y || 0, z: +data.z || 0,
    world: data.world !== undefined ? (data.world | 0) : 0,
    comment: data.comment ? String(data.comment) : '',
    preComment: data.preComment ? String(data.preComment) : '',
    blankLinesBefore: +data.blankLinesBefore || 0,
    projectId: data.projectId || '',
    raw: data.raw ? { ...data.raw } : null,
  };
}

export function makeGangZone(data) {
  const rawName = data.name ? String(data.name).trim() : (data.comment ? String(data.comment).replace(/^\/\/\s*/, '').trim() : '');
  const gzName = rawName || 'GangZone';
  return {
    uid: data.uid || newUid(),
    name: gzName,
    minx: Number(data.minx !== undefined ? data.minx : data.minX) || 0,
    miny: Number(data.miny !== undefined ? data.miny : data.minY) || 0,
    maxx: Number(data.maxx !== undefined ? data.maxx : data.maxX) || 0,
    maxy: Number(data.maxy !== undefined ? data.maxy : data.maxY) || 0,
    color: data.color !== undefined ? (data.color | 0) : 0xFF000080,
    comment: gzName,
    preComment: data.preComment ? String(data.preComment) : '',
    blankLinesBefore: +data.blankLinesBefore || 0,
    projectId: data.projectId || '',
  };
}

// Versão 2: os campos guardam exatamente os parâmetros do SA-MP (TextDrawLetterSize, TextDrawTextSize...).
// Projetos antigos guardavam largura/altura do editor e eram convertidos só na exportação.
const TD_VERSION = 2;

function migrateLegacyTextDraw(data) {
  const d = { ...data };
  const font = d.font !== undefined ? (d.font | 0) : 1;
  if (font === 4 || font === 5) return d;
  const align = d.align ?? d.alignment ?? 1;
  const x = +d.x || 0;
  const sizeX = +d.textSizeX || 0, sizeY = +d.textSizeY || 0;
  const isBoxPure = d.isBox || d.text === '_' || !d.text || String(d.text).trim() === '';
  if (d.useBox) {
    let w;
    if (align === 1) w = sizeX > x ? sizeX - x : Math.max(20, sizeX || 100);
    else if (align === 3) w = sizeX < x && sizeX > 0 ? x - sizeX : Math.max(20, sizeX || 100);
    else w = Math.max(20, sizeX || 100);
    const h = sizeY > 0 ? sizeY : (isBoxPure ? 20 : 23);
    if (align === 2) { d.textSizeX = h; d.textSizeY = w; }
    else { d.textSizeX = align === 3 ? x - w : x + w; d.textSizeY = h; }
    if (isBoxPure) { d.letterSizeX = 0; d.letterSizeY = +(h / 22).toFixed(4); }
  } else {
    d.textSizeX = align === 3 ? 0 : 640;
    d.textSizeY = align === 2 ? 640 : 480;
  }
  return d;
}

// Nome do sprite como o jogo encontra (biblioteca e textura)
function normalizeSpriteName(text) {
  const colon = text.indexOf(':');
  if (colon === -1) return text;
  const lib = text.slice(0, colon).toLowerCase();
  const tex = text.slice(colon + 1);
  const tLow = tex.toLowerCase();
  if (lib === 'loadscs' || lib === 'loadsuk') return 'LOADSUK:' + (tLow === 'loadsc0' ? 'loadscuk' : tLow);
  if (lib.startsWith('loadsc')) return lib + ':' + tLow;
  if (lib === 'hud') return 'hud:' + (tLow === 'radar_ring' || tLow === 'radarringplane' ? 'radarRingPlane' : tex);
  if (lib.startsWith('ld_')) return lib.toUpperCase() + ':' + tLow;
  return text;
}

// Barra de progresso (progress3.inc): chamadas para criar, definir o valor e mostrar para o jogador
export const PB_DIRECTIONS = ['BAR_DIRECTION_RIGHT', 'BAR_DIRECTION_LEFT', 'BAR_DIRECTION_UP', 'BAR_DIRECTION_DOWN'];

// Variável da barra no código: progress_0, progress_1... na ordem das barras do projeto
export function progressBarVar(td, all = []) {
  const n = all.filter(t => t.type === 'progress').indexOf(td);
  return `progress_${n < 0 ? 0 : n}`;
}

// Variável da TextDraw no código: textdraw_0, textdraw_1... na ordem das TextDraws (sem contar as barras)
export function textDrawVar(td, all = []) {
  const n = all.filter(t => t.type !== 'progress').indexOf(td);
  return `textdraw_${n < 0 ? 0 : n}`;
}

export function progressBarPawn(td, varName, fmt) {
  const f = fmt || ((v) => { const t = String(+(+v || 0).toFixed(4)); return t.includes('.') ? t : t + '.0'; });
  const hex = '0x' + (Number(td.color ?? 0xFF1C1CFF) >>> 0).toString(16).toUpperCase().padStart(8, '0');
  return [
    `new ${varName} = CreatePlayerProgressBar(playerid, ${f(td.x)}, ${f(td.y)}, ${f(td.pbWidth)}, ${f(td.pbHeight)}, ${hex}, ${f(td.pbMax)}, ${PB_DIRECTIONS[td.pbDir | 0] || PB_DIRECTIONS[0]});${td.name ? ` // ${String(td.name).replace(/[\r\n]+/g, ' ').trim()}` : ''}`,
    `SetPlayerProgressBarValue(playerid, ${varName}, ${f(td.pbValue)});`,
    `ShowPlayerProgressBar(playerid, ${varName});`,
  ];
}

// Parâmetros finais das funções TextDraw*, usados na exportação Pawn e no servidor de teste
export function textDrawNative(td) {
  const font = td.font ?? 1;
  const special = font === 4 || font === 5;
  let text = String(td.text ?? '').replace(/\r?\n/g, '~n~').trim().replace(/^"|"$/g, '');
  if (!text) text = font === 4 ? 'hud:radardisc' : '_';
  if (font === 4) text = normalizeSpriteName(text);
  let color = td.color ?? 0xFFFFFFFF;
  if (font === 4 && (color === 0 || color === 0xFF || (color & 0xFF) === 0)) color = 0xFFFFFFFF;
  const defSize = font === 4 ? 64 : 80;
  return {
    text, font,
    align: special ? 1 : (td.align ?? td.alignment ?? 1),
    letterSizeX: font === 4 ? (td.letterSizeX || 0.5) : (td.letterSizeX ?? 0.35),
    letterSizeY: font === 4 ? (td.letterSizeY || 1.0) : (td.letterSizeY ?? 1.4),
    textSizeX: special ? (td.textSizeX > 0 ? td.textSizeX : defSize) : (td.textSizeX ?? 640),
    textSizeY: special ? (td.textSizeY > 0 ? td.textSizeY : defSize) : (td.textSizeY ?? 480),
    color,
    useBox: special ? 0 : (td.useBox ? 1 : 0),
    boxColor: td.boxColor ?? 0x00000080,
    backgroundColor: font === 5 ? (td.useBox ? (td.boxColor ?? 0x00000060) : 0) : (td.backgroundColor ?? 0x000000FF),
    outline: special ? 0 : (td.outline > 0 ? 1 : 0),
    shadow: special ? 0 : (td.shadow > 0 ? 1 : 0),
    proportional: td.proportional ?? 1,
  };
}

export function makeTextDraw(data) {
  if (data.tdv === undefined && data.uid) data = migrateLegacyTextDraw(data);
  const alignVal = data.align !== undefined ? (data.align | 0) : (data.alignment !== undefined ? (data.alignment | 0) : 1);
  return {
    tdv: TD_VERSION,
    uid: data.uid || newUid(),
    name: data.name ? String(data.name) : 'Textdraw0',
    isPlayer: Boolean(data.isPlayer),
    text: data.text !== undefined ? String(data.text) : 'SA Map Studio',
    x: data.x !== undefined ? +data.x : 320.0,
    y: data.y !== undefined ? +data.y : 240.0,
    font: data.font !== undefined ? (data.font | 0) : 1,
    letterSizeX: data.letterSizeX !== undefined ? +data.letterSizeX : 0.35,
    letterSizeY: data.letterSizeY !== undefined ? +data.letterSizeY : 1.4,
    textSizeX: data.textSizeX !== undefined ? +data.textSizeX : 640.0,
    textSizeY: data.textSizeY !== undefined ? +data.textSizeY : 100.0,
    color: data.color !== undefined ? (data.color | 0) : 0xFFFFFFFF,
    useBox: data.useBox ? 1 : 0,
    boxColor: data.boxColor !== undefined ? (data.boxColor | 0) : 0x00000080,
    shadow: (data.shadow | 0) > 0 ? 1 : 0,
    outline: (data.outline | 0) > 0 ? 1 : 0,
    align: alignVal,
    alignment: alignVal,
    backgroundColor: data.backgroundColor !== undefined ? (data.backgroundColor | 0) : 0x000000FF,
    proportional: data.proportional !== undefined ? (data.proportional ? 1 : 0) : 1,
    selectable: data.selectable ? 1 : 0,
    previewModel: data.previewModel !== undefined ? (data.previewModel | 0) : 411,
    previewRotX: data.previewRotX !== undefined ? +data.previewRotX : -16.0,
    previewRotY: data.previewRotY !== undefined ? +data.previewRotY : 0.0,
    previewRotZ: data.previewRotZ !== undefined ? +data.previewRotZ : -55.0,
    previewZoom: data.previewZoom !== undefined ? +data.previewZoom : 1.0,
    previewColor1: data.previewColor1 !== undefined ? (data.previewColor1 | 0) : 1,
    previewColor2: data.previewColor2 !== undefined ? (data.previewColor2 | 0) : 1,
    comment: data.comment ? String(data.comment) : '',
    ...(data.type === 'progress' ? {
      type: 'progress', isPlayer: true,
      name: data.name && data.name !== 'Textdraw0' ? String(data.name) : '',
      pbWidth: data.pbWidth !== undefined ? +data.pbWidth : 55.5,
      pbHeight: data.pbHeight !== undefined ? +data.pbHeight : 3.2,
      pbMax: data.pbMax !== undefined ? +data.pbMax : 100,
      pbValue: data.pbValue !== undefined ? +data.pbValue : 50,
      pbDir: data.pbDir !== undefined ? (data.pbDir | 0) : 0,
    } : {}),
  };
}

export function makeCheckpoint(data) {
  const isRace = Boolean(data.isRace || data.cpKind === 'race');
  const x = +data.x || 0, y = +data.y || 0, z = +data.z || 0;
  return {
    uid: data.uid || newUid(),
    kind: 'checkpoints',
    cpKind: isRace ? 'race' : 'normal',
    isRace,
    type: Math.max(0, Math.min(4, data.type !== undefined ? (data.type | 0) : 0)),
    x, y, z,
    nextx: data.nextx !== undefined ? +data.nextx : (x + 15.0),
    nexty: data.nexty !== undefined ? +data.nexty : y,
    nextz: data.nextz !== undefined ? +data.nextz : z,
    size: Math.max(0.5, +data.size || (isRace ? 6.0 : 4.0)),
    world: data.world ?? -1,
    interior: data.interior ?? -1,
    streamDist: +data.streamDist || 200.0,
    comment: data.comment ? String(data.comment) : '',
    preComment: data.preComment ? String(data.preComment) : '',
    blankLinesBefore: +data.blankLinesBefore || 0,
    projectId: data.projectId || '',
    raw: data.raw ? { ...data.raw } : null,
  };
}

export function makeMapIcon(data) {
  const mtype = data.markertype !== undefined ? (data.markertype | 0) : (data.type !== undefined ? (data.type | 0) : 0);
  return {
    uid: data.uid || newUid(),
    kind: 'mapIcons',
    name: data.name ? String(data.name) : '',
    iconid: Math.max(0, Math.min(99, data.iconid !== undefined ? (data.iconid | 0) : 0)),
    markertype: Math.max(0, Math.min(63, mtype)),
    type: Math.max(0, Math.min(63, mtype)),
    x: +data.x || 0, y: +data.y || 0, z: +data.z || 0,
    color: data.color !== undefined ? (data.color | 0) : 0xFF0000FF,
    style: Math.max(0, Math.min(3, data.style !== undefined ? (data.style | 0) : 0)),
    world: data.world ?? -1,
    interior: data.interior ?? -1,
    streamDist: +data.streamDist || 200.0,
    comment: data.comment ? String(data.comment) : '',
    preComment: data.preComment ? String(data.preComment) : '',
    blankLinesBefore: +data.blankLinesBefore || 0,
    projectId: data.projectId || '',
    raw: data.raw ? { ...data.raw } : null,
  };
}

export function makeSound(data) {
  return {
    uid: data.uid || newUid(),
    kind: 'sounds',
    soundid: data.soundid !== undefined ? (data.soundid | 0) : 1058,
    x: +data.x || 0, y: +data.y || 0, z: +data.z || 0,
    comment: data.comment ? String(data.comment) : '',
    preComment: data.preComment ? String(data.preComment) : '',
    blankLinesBefore: +data.blankLinesBefore || 0,
    projectId: data.projectId || '',
    raw: data.raw ? { ...data.raw } : null,
  };
}

const KINDS = ['objects', 'vehicles', 'actors', 'removed', 'labels', 'pickups', 'gangZones', 'textDraws', 'checkpoints', 'mapIcons', 'sounds'];
const MAKERS = {
  objects: makeObject,
  vehicles: makeVehicle,
  actors: makeActor,
  removed: makeRemoved,
  labels: makeLabel,
  pickups: makePickup,
  gangZones: makeGangZone,
  textDraws: makeTextDraw,
  checkpoints: makeCheckpoint,
  mapIcons: makeMapIcon,
  sounds: makeSound,
};

export class Project {
  constructor(name = 'Meu mapa') {
    this.name = name;
    this.objects = [];
    this.vehicles = [];
    this.actors = [];
    this.removed = [];
    this.labels = [];
    this.pickups = [];
    this.gangZones = [];
    this.textDraws = [];
    this.checkpoints = [];
    this.mapIcons = [];
    this.sounds = [];
    this.pwnHeader = '';
    this.rawPawn = '';
    this.camera = null;
    this.lastSelection = [];   // itens selecionados no último salvamento (para retomar de onde parou)
    this.cameras = emptyCameras();
    this.undoStack = [];
    this.redoStack = [];
    this.listeners = new Set();
    this.version = 0;
  }

  static fromJSON(data) {
    const p = new Project(data.name || 'Meu mapa');
    for (const k of KINDS) p[k] = (data[k] || []).map(MAKERS[k]);
    p.camera = data.camera || null;
    p.lastSelection = Array.isArray(data.lastSelection) ? data.lastSelection.filter(u => typeof u === 'string') : [];
    p.cameras = normalizeCameras(data.cameras);
    p.pwnHeader = data.pwnHeader || '';
    p.rawPawn = data.rawPawn || '';
    return p;
  }

  toJSON() {
    return {
      app: 'SA Map Studio', format: 1, name: this.name, savedAt: new Date().toISOString(),
      pwnHeader: this.pwnHeader || '', rawPawn: this.rawPawn || '',
      camera: this.camera, lastSelection: this.lastSelection || [], cameras: this.cameras,
      objects: this.objects, vehicles: this.vehicles, actors: this.actors, removed: this.removed,
      labels: this.labels, pickups: this.pickups, gangZones: this.gangZones, textDraws: this.textDraws,
      checkpoints: this.checkpoints, mapIcons: this.mapIcons, sounds: this.sounds
    };
  }

  // Mudanças fora do histórico (câmeras): só avisa para salvar
  touch(what = 'cameras') { this.emit({ type: what, uids: [] }); }

  on(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  emit(change) { this.version++; for (const fn of this.listeners) fn(change); }

  kindOf(uid) {
    for (const k of KINDS) if (this[k].some(o => o.uid === uid)) return k;
    return null;
  }
  find(uid) {
    for (const k of KINDS) { const o = this[k].find(x => x.uid === uid); if (o) return o; }
    return null;
  }
  snapshot(uid) {
    const k = this.kindOf(uid);
    return k ? { uid, kind: k, data: JSON.parse(JSON.stringify(this.find(uid))) } : { uid, kind: null, data: null };
  }

  // Aplica estados (cria, atualiza ou apaga) sem mexer no histórico
  applyStates(states) {
    const changed = [];
    for (const s of states) {
      for (const k of KINDS) {
        const i = this[k].findIndex(o => o.uid === s.uid);
        if (i >= 0 && (!s.data || s.kind !== k)) { this[k].splice(i, 1); changed.push({ type: 'remove', uid: s.uid, kind: k }); }
      }
      if (s.data) {
        const list = this[s.kind];
        const i = list.findIndex(o => o.uid === s.uid);
        const obj = MAKERS[s.kind]({ ...s.data, uid: s.uid });
        if (i >= 0) { list[i] = obj; changed.push({ type: 'update', uid: s.uid, kind: s.kind }); }
        else { list.push(obj); changed.push({ type: 'add', uid: s.uid, kind: s.kind }); }
      }
    }
    return changed;
  }

  // Executa uma mudança registrando desfazer/refazer.
  // fn() faz as alterações diretamente; uids indica quem pode mudar.
  transact(label, uids, fn) {
    const before = uids.map(u => this.snapshot(u));
    const createdUids = fn() || [];
    const all = [...new Set([...uids, ...createdUids])];
    const beforeAll = [...before, ...createdUids.filter(u => !uids.includes(u)).map(u => ({ uid: u, kind: null, data: null }))];
    const after = all.map(u => this.snapshot(u));
    if (JSON.stringify(beforeAll) === JSON.stringify(after)) return;
    this.undoStack.push({ label, before: beforeAll, after, _seq: ++_globalOpSeq });
    if (this.undoStack.length > 200) this.undoStack.shift();
    this.redoStack.length = 0;
    this.emit({ type: 'transact', label, uids: all });
  }

  // Registra uma mudança já feita (ex.: arrastar com o gizmo)
  record(label, before, after) {
    if (JSON.stringify(before) === JSON.stringify(after)) return;
    this.undoStack.push({ label, before, after, _seq: ++_globalOpSeq });
    this.redoStack.length = 0;
    this.emit({ type: 'transact', label, uids: after.map(s => s.uid) });
  }

  undo() {
    const op = this.undoStack.pop();
    if (!op) return null;
    this.applyStates(op.before);
    if (this.checkpoints && this.checkpoints.length) {
      updateRaceCheckpointsChain(this.checkpoints);
    }
    op._redoSeq = ++_globalOpSeq;
    this.redoStack.push(op);
    this.emit({ type: 'undo', label: op.label, uids: op.before.map(s => s.uid) });
    return op.label;
  }

  redo() {
    const op = this.redoStack.pop();
    if (!op) return null;
    this.applyStates(op.after);
    if (this.checkpoints && this.checkpoints.length) {
      updateRaceCheckpointsChain(this.checkpoints);
    }
    op._seq = ++_globalOpSeq;
    this.undoStack.push(op);
    this.emit({ type: 'redo', label: op.label, uids: op.after.map(s => s.uid) });
    return op.label;
  }

  clearHistory() {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
    this.emit({ type: 'clearHistory', uids: [] });
  }

  // Adiciona um item de qualquer tipo suportado com registro de undo/redo
  add(kind, data, label = 'Adicionar') {
    let created = null;
    this.transact(label, [], () => {
      const maker = MAKERS[kind] || makeObject;
      created = maker(data || {});
      if (!this[kind]) this[kind] = [];
      this[kind].push(created);
      return [created.uid];
    });
    return created;
  }

  // ---- operações de alto nível ----
  addItems(label, a, b) {
    let kind = null;
    let items = null;
    if (typeof a === 'string' && Array.isArray(b)) {
      kind = a;
      items = b;
    } else if (Array.isArray(a)) {
      items = a;
      kind = typeof b === 'string' ? b : null;
    } else if (Array.isArray(b)) {
      items = b;
    } else {
      items = [];
    }

    const uids = [];
    this.transact(label, [], () => {
      for (const it of items) {
        if (!it) continue;
        const k = it.kind || kind;
        if (k && MAKERS[k]) {
          const obj = MAKERS[k](it);
          if (!this[k]) this[k] = [];
          this[k].push(obj);
          uids.push(obj.uid);
        } else if (k === 'removed' || it.kind === 'removed') {
          const r = makeRemoved(it); this.removed.push(r); uids.push(r.uid);
        } else if (k === 'actors' || it.kind === 'actors') {
          const a = makeActor(it); this.actors.push(a); uids.push(a.uid);
        } else if (k === 'vehicles' || it.kind === 'vehicles' || (it.model && isVehicleModel(it.model))) {
          const v = makeVehicle(it); this.vehicles.push(v); uids.push(v.uid);
        } else {
          const o = makeObject(it); this.objects.push(o); uids.push(o.uid);
        }
      }
      return uids;
    });
    return uids;
  }

  deleteItems(label, uids) {
    this.transact(label, uids, () => {
      for (const k of KINDS) this[k] = this[k].filter(o => !uids.includes(o.uid));
    });
  }

  removeItems(label, uids) {
    return this.deleteItems(label, uids);
  }

  updateItems(label, uids, mutate) {
    this.transact(label, uids, () => {
      for (const u of uids) { const o = this.find(u); if (o) mutate(o); }
    });
  }

  snapshotAll() {
    const list = [];
    for (const k of KINDS) {
      for (const item of this[k]) {
        list.push({ uid: item.uid, kind: k, data: JSON.parse(JSON.stringify(item)) });
      }
    }
    return list;
  }

  clearAll() {
    for (const k of KINDS) {
      this[k].length = 0;
    }
    this.emit({ type: 'clear', uids: [] });
  }

  mergeProject(otherProject) {
    const itemsToAdd = [];
    for (const k of KINDS) {
      for (const it of (otherProject[k] || [])) {
        const copy = JSON.parse(JSON.stringify(it));
        copy.uid = newUid();
        copy.kind = k;
        copy.projectId = this.name;
        itemsToAdd.push(copy);
      }
    }
    return this.addItems(`Mesclar projeto "${otherProject.name}"`, itemsToAdd);
  }
}

// ---------------------------------------------------------------- câmeras
// shots: pontos fixos (SetPlayerCameraPos + SetPlayerCameraLookAt)
// paths: sequências de InterpolateCameraPos/LookAt. Cada passo vai do ponto anterior até este.
export function emptyCameras() { return { shots: [], paths: [] }; }

const vec = (v) => ({ x: +v?.x || 0, y: +v?.y || 0, z: +v?.z || 0 });

export function normalizeCameras(c) {
  const out = emptyCameras();
  if (!c) return out;
  out.shots = (c.shots || []).map((s, i) => ({ id: s.id || 'c' + Date.now().toString(36) + i, name: String(s.name || 'Câmera ' + (i + 1)), pos: vec(s.pos), look: vec(s.look), cut: s.cut === 'move' ? 'move' : 'cut' }));
  out.paths = (c.paths || []).map((p, i) => ({
    id: p.id || 'p' + Date.now().toString(36) + i,
    name: String(p.name || 'Movimento ' + (i + 1)),
    end: ['behind', 'keep', 'loop'].includes(p.end) ? p.end : 'behind',
    keys: (p.keys || []).map(k => ({ name: k.name ? String(k.name) : '', pos: vec(k.pos), look: vec(k.look), time: Math.max(0, Math.round(+k.time || 0)), hold: Math.max(0, Math.round(+k.hold || 0)), cut: k.cut === 'cut' ? 'cut' : 'move' })),
  }));
  return out;
}
