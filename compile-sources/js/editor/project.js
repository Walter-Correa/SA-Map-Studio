// Project: created objects, vehicles and removed buildings, with undo/redo.
import { isVehicleModel } from './pwn.js';
import { normalizeMaterial } from './materials.js';
import { updateRaceCheckpointsChain } from '../world/checkpoints.js';
import { t as tr } from '../ui/i18n.js';
import { makeFx, tdfxPawn } from './tdfx.js';

let uidCounter = 1;
let _globalOpSeq = 0;
const newUid = () => 'o' + (Date.now().toString(36)) + (uidCounter++).toString(36);

// Attachments in old projects that point to a parent that no longer exists (uid changed in an earlier
// import): the parent is found again by position, since the attached object is stored where the offset
// from the parent places it. Only swaps when all attachments of that parent match the same item.
export function repairAttachments(objects, vehicles) {
  const known = new Set([...objects, ...vehicles].map(o => o.uid).filter(Boolean));
  const groups = new Map();
  for (const o of objects) {
    const to = o.attach?.to;
    if (!to || known.has(to)) continue;
    const key = (o.attach.type === 'vehicle' ? 'v:' : 'o:') + to;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(o);
  }
  let fixed = 0;
  for (const [key, kids] of groups) {
    const cands = key.startsWith('v:') ? vehicles : objects.filter(o => !kids.includes(o));
    const fits = (p, c) => {
      const a = (+p.rz || 0) * Math.PI / 180, cos = Math.cos(a), sin = Math.sin(a);
      const ox = +c.attach.ox || 0, oy = +c.attach.oy || 0, oz = +c.attach.oz || 0;
      return Math.abs(p.x + ox * cos - oy * sin - c.x) < 0.05 && Math.abs(p.y + ox * sin + oy * cos - c.y) < 0.05 && Math.abs(p.z + oz - c.z) < 0.05;
    };
    const parent = cands.find(p => !(+p.rx) && !(+p.ry) && kids.every(c => fits(p, c)));
    if (!parent) continue;
    if (!parent.uid) parent.uid = newUid();
    for (const c of kids) c.attach.to = parent.uid;
    fixed += kids.length;
  }
  return fixed;
}

// Items entering the project (import, merge): each gets a new uid and the attachments are
// pointed to the copy of the parent that came along, so merging the same project does not join everything under one parent.
export function prepareImportItems(items) {
  repairAttachments(items.filter(i => i.kind === 'objects'), items.filter(i => i.kind === 'vehicles'));
  const map = new Map();
  for (const it of items) {
    const fresh = newUid();
    if (it.uid) map.set(it.uid, fresh);
    it.uid = fresh;
  }
  for (const it of items) {
    if (it.attach?.to && map.has(it.attach.to)) it.attach = { ...it.attach, to: map.get(it.attach.to) };
  }
  return items;
}

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
    // Singleplayer: the game's own object this one came from (IPL file and position in it, where it was), so the mod can move it there
    origin: data.origin && typeof data.origin.file === 'string' ? { file: data.origin.file, idx: data.origin.idx | 0, x: +data.origin.x || 0, y: +data.origin.y || 0, z: +data.origin.z || 0 } : null,
    materials: (data.materials || []).map(normalizeMaterial).filter(Boolean)
      .filter((m, i, all) => all.findLastIndex(x => x.index === m.index) === i) // one per index (the last one wins)
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
    // Singleplayer (they need the CLEO in the game): cannot be destroyed / only the player can get in
    indestructible: !!data.indestructible, npcLock: !!data.npcLock,
    spRespawn: Math.max(1, Math.min(3600, +data.spRespawn || 30)), // seconds to come back at its place after being destroyed
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
    // Singleplayer: the weapon it carries (0 = none; with one, no animation), what it is (neutral, guard of the player or enemy)
    // and whether it follows the player (a guard) or chases him (an enemy) instead of staying where it appeared
    weapon: data.weapon | 0,
    role: ['guard', 'enemy'].includes(data.role) ? data.role : 'neutral',
    follow: !!data.follow,
    ammoInfinite: data.ammoInfinite !== false, // infinite ammunition (the default) or the amount in `ammo`; when it runs out the weapon is thrown away
    ammo: Math.max(1, Math.min(9999, Math.round(+data.ammo || 100))),
    speedPct: Math.max(100, Math.min(200, Math.round(+data.speedPct || 100))), // speed of movement: 100% (normal) up to 200%
    runFast: data.runFast !== false, // how it runs to the player: fast (sprint) or normal (not for the neutral ones)
    respawn: Math.max(0, Math.min(36000, +data.respawn || 0)), // when it is not invulnerable and dies: seconds to come back (0 = stays dead)
    comment: data.comment ? String(data.comment) : '',
    preComment: data.preComment ? String(data.preComment) : '',
    blankLinesBefore: +data.blankLinesBefore || 0,
    projectId: data.projectId || '',
    raw: data.raw ? { ...data.raw } : null,
    anim: data.anim && !(data.weapon | 0) ? {
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

// Singleplayer door (enex): an outside marker and an inside marker joined by the name. "rot" is the way the player faces after coming through (degrees, 0 = north)
export function newDoorName(doors, wanted = '') {
  const clean = String(wanted).toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 8);
  const used = new Set(doors.map(d => d.name));
  if (clean && !used.has(clean)) return clean;
  for (let i = 1; ; i++) { const n = 'ENT_' + String(i).padStart(2, '0'); if (!used.has(n)) return n; }
}

export function makeDoor(data) {
  const n = (v, d = 0) => (Number.isFinite(+v) ? +v : d);
  return {
    uid: data.uid || newUid(),
    name: String(data.name || 'ENT_01').toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 8) || 'ENT_01',
    out: { x: n(data.out?.x), y: n(data.out?.y), z: n(data.out?.z), rot: n(data.out?.rot) },
    in: { x: n(data.in?.x), y: n(data.in?.y), z: n(data.in?.z), rot: n(data.in?.rot) },
    interior: Math.max(1, n(data.interior, 1) | 0),
    size: Math.max(0.5, n(data.size, 1.5)),
    flagsOut: n(data.flagsOut, 4) | 0, flagsIn: n(data.flagsIn, 0) | 0,
    skyOut: n(data.skyOut, 0) | 0, skyIn: n(data.skyIn, 4) | 0, peds: n(data.peds, 2) | 0,
    timeOn: n(data.timeOn, 0) | 0, timeOff: n(data.timeOff, 24) | 0,
  };
}

// Singleplayer world settings: where the player appears whatever the saved game (null = where the save was), fixed weather and time (-1 = free), fixed weather and time (-1 = free)
export function makeWorld(data) {
  const d = data || {};
  const n = (v, f) => (Number.isFinite(+v) ? +v : f);
  return { spawn: null, weather: Math.max(-1, Math.min(45, n(d.weather, -1) | 0)), hour: Math.max(-1, Math.min(23, n(d.hour, -1) | 0)), minute: Math.max(0, Math.min(59, n(d.minute, 0) | 0)) };
}

// A model imported from files (Singleplayer): its id in the game's range, the folder of its files on the server and their names
export function makeCustomModel(data) {
  return {
    uid: data.uid || newUid(),
    id: data.id | 0, asset: String(data.asset || ''), label: String(data.label || 'Modelo'),
    dff: String(data.dff || ''), txd: String(data.txd || ''), col: String(data.col || ''),
    drawDist: Math.max(20, +data.drawDist || 300),
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

// What happens when the player enters a checkpoint or takes a pickup (Singleplayer): a type and its settings, a price and a message
export const ACTION_TYPES = ['none', 'message', 'health', 'armour', 'money', 'weapon', 'ammo', 'skills', 'wanted', 'teleport', 'vehicle', 'repair', 'nitro', 'jetpack', 'save', 'skin', 'weather', 'time', 'explosion',
  'statFat', 'statMuscle', 'statStamina', 'statLung', 'statMaxHealth', 'statRespect', 'statSex', 'hungerOff'];
// Permanent id of a Singleplayer project (16 hex digits): links the project to its installed mod even after a rename
export const MOD_ID_RE = /^[0-9a-f]{16}$/;
export function newModId() {
  const b = new Uint8Array(8);
  crypto.getRandomValues(b);
  return [...b].map(x => x.toString(16).padStart(2, '0')).join('');
}
// Singleplayer menu of a pickup or checkpoint: options chosen from the actions, shown by the game's own menu panel.
// The game's menu takes up to 12 rows, and its font only draws plain letters and a few signs
export const MENU_MAX = 12;
export const MENU_TEXT_MAX = 30;
export const MENU_BAD_CHARS = /[^A-Za-z0-9 .,!?'()\-+/:$]/g;
export const menuText = (s) => String(s || '').replace(MENU_BAD_CHARS, '').replace(/\s+/g, ' ').slice(0, MENU_TEXT_MAX);
export function makeMenu(d) {
  if (!d || typeof d !== 'object') return null;
  const options = (Array.isArray(d.options) ? d.options : []).slice(0, MENU_MAX).map(o => ({ ...makeAction(o), once: false, label: menuText(o && o.label) }))
    .filter(o => o.type !== 'none');
  return { on: !!d.on, title: menuText(d.title), options };
}
export const STAT_RANGE = { statMaxHealth: [569, 1000] }; // the least and the most of the stats an action changes (0 to 1000 for the others)
export function makeAction(data) {
  const d = data || {};
  const n = (v, f) => (Number.isFinite(+v) ? +v : f);
  // The old actions Maximum/Minimum of a stat are now one action that changes it, with the value chosen (the armour ones are gone)
  const OLD = { strengthMax: ['statMaxHealth', 1000], strengthMin: ['statMaxHealth', 569], healthMax: ['statMaxHealth', 1000], healthMin: ['statMaxHealth', 569] };
  Object.assign(OLD, {
    fatMax: ['statFat', 1000], fatMin: ['statFat', 0], muscleMax: ['statMuscle', 1000], muscleMin: ['statMuscle', 0],
    staminaMax: ['statStamina', 1000], staminaMin: ['statStamina', 0], lungMax: ['statLung', 1000], lungMin: ['statLung', 0],
    respectMax: ['statRespect', 1000], respectMin: ['statRespect', 0], sexMax: ['statSex', 1000], sexMin: ['statSex', 0],
  });
  const old = OLD[d.type];
  const kind = old ? old[0] : d.type;
  const [lo, hi] = STAT_RANGE[kind] || [0, 1000];
  return {
    type: ACTION_TYPES.includes(kind) ? kind : 'none',
    statValue: Math.max(lo, Math.min(hi, n(old ? old[1] : d.statValue, 1000) | 0)), // the value of a stat action (the most by default)
    price: Math.max(0, Math.min(99999999, n(d.price, 0) | 0)),
    once: !!d.once,
    text: String(d.text || '').slice(0, 200),
    msgStyle: d.msgStyle === 'box' ? 'box' : 'text', // on the screen, or in the game's black help box
    amount: Math.max(0, Math.min(99999999, n(d.amount, 100) | 0)),
    weapon: n(d.weapon, 22) | 0, ammo: Math.max(1, Math.min(99999, n(d.ammo, 200) | 0)),
    stars: Math.max(0, Math.min(6, n(d.stars, 0) | 0)),
    x: n(d.x, 0), y: n(d.y, 0), z: n(d.z, 0), rot: n(d.rot, 0),
    model: n(d.model, 411) | 0,
    weather: Math.max(0, Math.min(45, n(d.weather, 0) | 0)),
    hour: Math.max(0, Math.min(23, n(d.hour, 12) | 0)), minute: Math.max(0, Math.min(59, n(d.minute, 0) | 0)),
    explosion: [0, 1, 2, 4].includes(n(d.explosion, 0) | 0) ? n(d.explosion, 0) | 0 : 0,
  };
}

export function makePickup(data) {
  return {
    uid: data.uid || newUid(),
    model: data.model !== undefined ? (data.model | 0) : 1240,
    type: data.type !== undefined ? (data.type | 0) : 1,
    x: +data.x || 0, y: +data.y || 0, z: +data.z || 0,
    world: data.world !== undefined ? (data.world | 0) : 0,
    action: data.action ? makeAction(data.action) : null,
    menu: data.menu ? makeMenu(data.menu) : null,
    comment: data.comment ? String(data.comment) : '',
    preComment: data.preComment ? String(data.preComment) : '',
    blankLinesBefore: +data.blankLinesBefore || 0,
    projectId: data.projectId || '',
    raw: data.raw ? { ...data.raw } : null,
  };
}

// The player's spawn point (Singleplayer): at most one. Wherever the saved game was, the player appears here facing rz
export function makeSpawn(data) {
  return {
    uid: data.uid || newUid(),
    kind: 'spawns',
    x: +data.x || 0, y: +data.y || 0, z: +data.z || 0, rz: +data.rz || 0,
    comment: '', preComment: '', blankLinesBefore: 0, projectId: data.projectId || '', raw: null,
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

// Version 2: the fields store exactly the SA-MP parameters (TextDrawLetterSize, TextDrawTextSize...).
// Old projects stored the editor's width/height and were converted only on export.
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

// Sprite name as the game finds it (library and texture)
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

// Progress bar (Progress Bar Plus, ProgressBar.inc): calls to create, set the value and show to the player
export const PB_INCLUDE = '#include <ProgressBar>//https://github.com/Walter-Correa/Progress-Bar-Plus';
export const PB_DIRECTIONS = ['PB_DIR_RIGHT', 'PB_DIR_LEFT', 'PB_DIR_UP', 'PB_DIR_DOWN'];

// ProgressBar.inc limits (the same PB_BORDER_MIN/MAX and PB_BLINK_MIN/MAX as the include); a border of 0 (PB_BORDER_NONE) has no border
export const PB_LIMITS = { borderMin: 0.5, borderMax: 5, borderDefault: 1, borderYRatio: 1.25, minInner: 1, blinkMin: 50, blinkMax: 60000, blinkDefault: 250 };
const clampNum = (v, min, max, def) => { const n = Number(v); return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : def; };
export const clampPbBorder = (v) => { const n = Number(v); return Number.isFinite(n) && n <= 0 ? 0 : clampNum(v, PB_LIMITS.borderMin, PB_LIMITS.borderMax, PB_LIMITS.borderDefault); };
// Largest border that fits in the bar (like PB_FitBorder in the include): leaves PB_MIN_INNER of interior,
// remembering that the top and bottom border is 1.25 times the sides. Every bar has at least the minimum.
export function maxPbBorder(width, height) {
  const w = Number(width) || 0, h = Number(height) || 0;
  const limit = Math.min(PB_LIMITS.borderMax, (w - PB_LIMITS.minInner) / 2, (h - PB_LIMITS.minInner) / (2 * PB_LIMITS.borderYRatio));
  return Math.max(PB_LIMITS.borderMin, Math.floor(limit * 100) / 100);
}
// Smallest width and height at which the minimum border still leaves interior
export const PB_MIN_WIDTH = PB_LIMITS.borderMin * 2 + PB_LIMITS.minInner;
export const PB_MIN_HEIGHT = PB_LIMITS.borderMin * 2 * PB_LIMITS.borderYRatio + PB_LIMITS.minInner;
export const fitPbBorder = (v, width, height) => Math.min(clampPbBorder(v), maxPbBorder(width, height));
// A horizontal bar (style bar, right or left) up to 4.5 high is made 2.5 times higher by the include, with at least 6
// (CreatePlayerProgressBar and SetPlayerProgressBarSize/Height): the editor keeps the height the game really draws
export const PB_LEGACY_HEIGHT = 4.5;
export function pbRealHeight(height, style, dir) {
  const h = Number(height) || 0;
  if (h <= PB_LEGACY_HEIGHT && (style | 0) === 0 && ((dir | 0) === 0 || (dir | 0) === 1)) return Math.max(6, Math.round(h * 2.5 * 100) / 100);
  return h;
}
export const clampPbBlinkInterval = (v) => Math.round(clampNum(v, PB_LIMITS.blinkMin, PB_LIMITS.blinkMax, PB_LIMITS.blinkDefault));
export const clampPbBlinkDuration = (v) => Math.round(clampNum(v, 0, 86400000, 0));
// Bar styles (the same PB_STYLE_* as the include) and ring segments (PB_RING_MIN to PB_RING_MAX)
export const PB_STYLE_NAMES = ['PB_STYLE_BAR', 'PB_STYLE_RING', 'PB_STYLE_CIRCLE'];
export const clampPbStyle = (v) => { const n = Number(v) | 0; return n >= 0 && n <= 2 ? n : 0; };
export const clampPbSegments = (v) => Math.round(clampNum(v, 4, 60, 24));
// Size of each ring segment, 1 = the default (SetPlayerProgressBarRingScale in the include)
export const clampPbSegmentScale = (v) => Math.round(clampNum(v, 0.1, 3, 1) * 100) / 100;
// Auto fill (AutoFillPlayerProgressBar): how far it fills, from 0 to the bar's maximum value
export const clampPbAutoFillMax = (v, max) => clampNum(v, 0, Math.max(0, Number(max) || 0), Math.max(0, Number(max) || 0));
// Cycle time, same as PB_AUTOFILL_RISE / HOLD_TOP / FALL / HOLD_BASE in the include
export const PB_AUTOFILL_TIMING = { rise: 1000, holdTop: 400, fall: 1000, holdBase: 300 };
export function pbAutoFillValue(td, elapsed) {
  const { rise, holdTop, fall, holdBase } = PB_AUTOFILL_TIMING;
  const max = Number(td.pbMax) || 0;
  const value = Math.max(0, Math.min(max, Number(td.pbValue) || 0));
  const target = clampPbAutoFillMax(td.pbAutoFillMax ?? max, max);
  const t = ((elapsed % (rise + holdTop + fall + holdBase)) + (rise + holdTop + fall + holdBase)) % (rise + holdTop + fall + holdBase);
  let f;
  if (t < rise) f = t / rise;
  else if (t < rise + holdTop) f = 1;
  else if (t < rise + holdTop + fall) f = 1 - (t - rise - holdTop) / fall;
  else f = 0;
  return value + (target - value) * f;
}

// Lower limit of the bar (SetPlayerProgressBarMinValue): the fill goes from the minimum to the maximum
export const pbMinOf = (td) => Math.min(Number(td.pbMin) || 0, Number(td.pbMax) || 0);
export const pbRatio = (td, value) => {
  const min = pbMinOf(td), range = (Number(td.pbMax) || 0) - min;
  return range > 0 ? Math.max(0, Math.min(1, ((Number(value) || 0) - min) / range)) : 0;
};

// Gradient (SetPlayerProgressBarGradient): colour from empty to full, through the middle one when it is not 0
export const PB_GRADIENT_DEFAULT = { empty: 0xE74C3CFF, full: 0x2ECC71FF, mid: 0xF1C40FFF };
function lerpRgba(c1, c2, f) {
  if (f <= 0) return c1 >>> 0;
  if (f >= 1) return c2 >>> 0;
  const ch = (c, s) => (c >>> s) & 0xFF;
  const m = (s) => (ch(c1, s) + Math.round((ch(c2, s) - ch(c1, s)) * f)) & 0xFF;
  return ((m(24) << 24) | (m(16) << 16) | (m(8) << 8) | m(0)) >>> 0;
}
// Colour of the fill with this value (the bar colour without a gradient), like PB_GetCurrentColour
export function pbCurrentColour(td, value) {
  if (!td.pbGradient) return Number(td.color ?? 0xE74C3CFF) >>> 0;
  let part = pbRatio(td, value);
  if (td.pbGradInverted) part = 1 - part;
  const empty = Number(td.pbGradEmpty ?? PB_GRADIENT_DEFAULT.empty) >>> 0, full = Number(td.pbGradFull ?? PB_GRADIENT_DEFAULT.full) >>> 0;
  const mid = Number(td.pbGradMid ?? 0) >>> 0;
  if (mid) return part < 0.5 ? lerpRgba(empty, mid, part * 2) : lerpRgba(mid, full, (part - 0.5) * 2);
  return lerpRgba(empty, full, part);
}

// Smooth change of the value when the bar appears (InterpolatePlayerProgressBarValue): from pbLerpFrom to the value
export const clampPbLerpMs = (v) => Math.round(clampNum(v, 0, 600000, 500));
export function pbLerpValue(td, elapsed) {
  const to = Number(td.pbValue) || 0, from = Math.max(pbMinOf(td), Math.min(Number(td.pbMax) || 0, Number(td.pbLerpFrom) || 0));
  const ms = clampPbLerpMs(td.pbLerpMs);
  if (ms <= 0 || elapsed >= ms) return to;
  const t = Math.max(0, elapsed) / ms;
  return from + (to - from) * t * (2 - t);
}

// Label of the bar (SetPlayerProgressBarLabel): text with {PERCENT}, {VALUE}, {MAX} and {MIN}, drawn as a TextDraw
export const PB_LABEL_DEFAULT = '{PERCENT}%';
export const PB_LABEL_ORIENTS = ['PB_LABEL_ORIENT_AUTO', 'PB_LABEL_ORIENT_HORIZONTAL', 'PB_LABEL_ORIENT_VERTICAL'];
export const clampPbLabelText = (s) => String(s ?? '').replace(/[\r\n]+/g, ' ').slice(0, 31);
const PB_TOKENS = [['{PERCENT}', 'p'], ['{PCT}', 'p'], ['{VALUE}', 'v'], ['{VAL}', 'v'], ['{MAX}', 'x'], ['{MIN}', 'n']];
function pbLabelVisibleLen(tmpl) {
  let n = 0;
  for (let i = 0; i < tmpl.length;) {
    if (tmpl[i] === '{') {
      const tok = PB_TOKENS.find(([k]) => tmpl.startsWith(k, i));
      if (tok) { n += 3; i += tok[0].length; continue; }
      const close = tmpl.indexOf('}', i + 1);
      if (close !== -1 && close - i <= 10) { i = close + 1; continue; }
    }
    n++; i++;
  }
  return Math.max(1, n);
}
function pbLabelVertical(td, tmpl) {
  if ((td.pbStyle | 0) !== 0) return false;
  const o = td.pbLabelOrient | 0;
  if (o === 1) return false;
  if (o === 2) return true;
  const w = +td.pbWidth || 0, h = +td.pbHeight || 0;
  if (h <= w) return false;
  const len = pbLabelVisibleLen(tmpl), border = clampPbBorder(td.pbBorder);
  const needW = Math.max(16, len * 4.2 + border * 2 + 4), needH = (len - 1) * 7.5 + 8 + border * 2;
  return w < needW && h >= needH;
}
function pbVerticalText(src) {
  let out = '', first = true;
  for (let i = 0; i < src.length;) {
    if (src[i] === '{') {
      const close = src.indexOf('}', i + 1);
      if (close !== -1 && close - i <= 10) { out += src.slice(i, close + 1); i = close + 1; continue; }
    }
    if (src[i] === '~' && /^~[nN]~/.test(src.slice(i, i + 3))) { out += '~n~'; i += 3; first = true; continue; }
    if (src[i] !== ' ') { if (!first) out += '~n~'; first = false; }
    out += src[i++];
  }
  return out;
}
// The label TextDraw of the bar for this value and fill colour, or null (same position, size and colour as the include)
export function pbLabelTextDraw(td, value, colour) {
  if (!td.pbLabel) return null;
  const tmpl = clampPbLabelText(td.pbLabelText) || PB_LABEL_DEFAULT;
  const min = pbMinOf(td), max = Number(td.pbMax) || 0;
  const pct = Math.round(pbRatio(td, value) * 100);
  let text = '';
  for (let i = 0; i < tmpl.length;) {
    const tok = tmpl[i] === '{' && PB_TOKENS.find(([k]) => tmpl.startsWith(k, i));
    if (tok) {
      text += String(tok[1] === 'p' ? pct : Math.round(tok[1] === 'v' ? value : tok[1] === 'x' ? max : min));
      i += tok[0].length;
    } else text += tmpl[i++];
  }
  const vert = pbLabelVertical(td, tmpl);
  if (vert) text = pbVerticalText(text);
  const lines = text.split(/~[nN]~/).length;
  const w = +td.pbWidth || 0, h = +td.pbHeight || 0, border = clampPbBorder(td.pbBorder), style = td.pbStyle | 0;
  let sx = +td.pbLabelScaleX || 0, sy = +td.pbLabelScaleY || 0;
  if (sx <= 0 || sy <= 0) {
    // PB_CalculateLabelScale
    if (style !== 0) {
      sy = Math.max(0.2, Math.min(1.2, w * 0.024)); sx = sy * 0.26;
      const aw = text.length * sx * 22, mw = w * 0.65;
      if (text.length && w > 8 && aw > mw) { const r = mw / aw; sx = Math.max(0.08, sx * r); sy = Math.max(0.18, sy * r); }
    } else if (vert) {
      let iw = w - border * 2; if (iw < 2) iw = w * 0.75;
      let ih = h - border * 2; if (ih < 4) ih = h * 0.85;
      const aw = iw * 0.85, ah = ih * 0.9;
      const mxw = Math.max(0.05, aw > 1.8 ? (aw - 1.8) / 26 : aw / 30);
      const lf = Math.max(8.5, (lines - 1) * 16 + 8.5);
      const myh = ah > 1.5 ? (ah - 1.5) / lf : ah / lf;
      sy = Math.max(0.18, Math.min(1.1, Math.min(mxw / 0.27, myh)));
      sx = Math.max(0.05, Math.min(0.28, sy * 0.27));
    } else {
      let ih = h - border * 2; if (ih < 2) ih = h * 0.8;
      let iw = w - border * 2; if (iw < 2) iw = w * 0.85;
      const ah = ih * 0.82, aw = iw * 0.88;
      if (w >= h) sy = Math.max(0.18, Math.min(1.15, ah * 0.1));
      else { sy = 0.75; if (sy * 8.5 > ah) sy = ah / 8.5; sy = Math.max(0.18, sy); }
      sx = sy * 0.27;
      const aw2 = text.length * sx * 22 + text.length * 1.5;
      if (text.length && aw2 > aw) { const r = aw / aw2; sx = Math.max(0.06, sx * r); sy = Math.max(0.16, sy * r); }
    }
  }
  const align = [1, 2, 3].includes(td.pbLabelAlign | 0) ? (td.pbLabelAlign | 0) : 2;
  const ox = +td.pbLabelOffX || 0, oy = +td.pbLabelOffY || 0, bx = +td.x || 0, by = +td.y || 0;
  const pad = vert ? 1.5 : 2.5;
  const y = vert ? by + (h - ((lines - 1) * 16 + 8.5) * sy) / 2 + oy : by + (h - sy * 8.5) / 2 + oy;
  const x = (align === 1 ? bx + pad : align === 3 ? bx + w - pad : bx + w / 2) + ox;
  let col = Number(td.pbLabelColor ?? 0xFFFFFFFF) >>> 0;
  if (td.pbLabelFollow) { col = Number(colour) >>> 0; if ((col & 0xFF) === 0) col = (col | 0xFF) >>> 0; }
  return { x, y, text, font: Math.max(0, Math.min(3, td.pbLabelFont ?? 1)), align, alignment: align, letterSizeX: sx, letterSizeY: sy, color: col,
    outline: 1, shadow: 0, backgroundColor: 0x000000AA, useBox: 0, proportional: 1, textSizeX: 1280, textSizeY: 1280 };
}

// Bar variable in the code: progress_0, progress_1... in the order of the project's bars
export function progressBarVar(td, all = []) {
  const n = all.filter(t => t.type === 'progress').indexOf(td);
  return `progress_${n < 0 ? 0 : n}`;
}

// TextDraw variable in the code: textdraw_0, textdraw_1... in the order of the TextDraws (not counting the bars)
export function textDrawVar(td, all = []) {
  const n = all.filter(t => t.type !== 'progress').indexOf(td);
  return `textdraw_${n < 0 ? 0 : n}`;
}

export function progressBarPawn(td, varName, fmt) {
  const f = fmt || ((v) => { const t = String(+(+v || 0).toFixed(4)); return t.includes('.') ? t : t + '.0'; });
  const hexOf = (v) => '0x' + (Number(v) >>> 0).toString(16).toUpperCase().padStart(8, '0');
  const hex = hexOf(td.color ?? 0xFF1C1CFF);
  const borderCol = Number(td.pbBorderColor || 0) >>> 0;
  const style = clampPbStyle(td.pbStyle);
  // Include order: ..., direction, border, bordercolour, style, segments, segmentscale (everything is written, the border
  // included, because the server may change PB_BORDER_DEFAULT)
  const segs = style === 1 ? clampPbSegments(td.pbSegments) : 'PB_RING_SEGMENTS';
  const segScale = style === 1 ? f(clampPbSegmentScale(td.pbSegmentScale)) : 'PB_RING_SEGMENT_SCALE';
  const lines = [
    `new ${varName} = CreatePlayerProgressBar(playerid, ${f(td.x)}, ${f(td.y)}, ${f(td.pbWidth)}, ${f(td.pbHeight)}, ${hex}, ${f(td.pbMax)}, ${PB_DIRECTIONS[td.pbDir | 0] || PB_DIRECTIONS[0]}, ${fitPbBorder(td.pbBorder, td.pbWidth, td.pbHeight) > 0 ? f(fitPbBorder(td.pbBorder, td.pbWidth, td.pbHeight)) : 'PB_BORDER_NONE'}, ${borderCol ? hexOf(borderCol) : '0'}, ${PB_STYLE_NAMES[style]}, ${segs}, ${segScale});${td.name ? ` // ${String(td.name).replace(/[\r\n]+/g, ' ').trim()}` : ''}`,
  ];
  if (pbMinOf(td) !== 0) lines.push(`SetPlayerProgressBarMinValue(playerid, ${varName}, ${f(pbMinOf(td))});`);
  if (td.pbGradient) {
    const mid = Number(td.pbGradMid ?? 0) >>> 0;
    lines.push(`SetPlayerProgressBarGradient(playerid, ${varName}, true, ${hexOf(td.pbGradEmpty ?? PB_GRADIENT_DEFAULT.empty)}, ${hexOf(td.pbGradFull ?? PB_GRADIENT_DEFAULT.full)}, ${mid ? hexOf(mid) : '0'}, ${td.pbGradInverted ? 'true' : 'false'});`);
  }
  if (td.pbLabel) {
    const auto = !(+td.pbLabelScaleX > 0 && +td.pbLabelScaleY > 0);
    lines.push(`SetPlayerProgressBarLabel(playerid, ${varName}, true, ${JSON.stringify(clampPbLabelText(td.pbLabelText) || PB_LABEL_DEFAULT)}, ${hexOf(td.pbLabelColor ?? 0xFFFFFFFF)}, ${[1, 2, 3].includes(td.pbLabelAlign | 0) ? td.pbLabelAlign | 0 : 2}, ${Math.max(0, Math.min(3, td.pbLabelFont ?? 1))}, ${auto ? '0.0' : f(td.pbLabelScaleX)}, ${auto ? '0.0' : f(td.pbLabelScaleY)}, ${f(td.pbLabelOffX || 0)}, ${f(td.pbLabelOffY || 0)}, ${td.pbLabelFollow ? 'true' : 'false'}, ${PB_LABEL_ORIENTS[td.pbLabelOrient | 0] || PB_LABEL_ORIENTS[0]});`);
  }
  // The smooth change starts from pbLerpFrom; the auto fill would stop it, so it is only written without the auto fill
  const lerp = td.pbLerp && !td.pbAutoFill;
  lines.push(`SetPlayerProgressBarValue(playerid, ${varName}, ${f(lerp ? Math.max(pbMinOf(td), Math.min(td.pbMax, Number(td.pbLerpFrom) || 0)) : td.pbValue)});`);
  lines.push(`ShowPlayerProgressBar(playerid, ${varName});`);
  if (lerp) lines.push(`InterpolatePlayerProgressBarValue(playerid, ${varName}, ${f(td.pbValue)}, ${clampPbLerpMs(td.pbLerpMs)});`);
  if (td.pbAutoFill) lines.push(`AutoFillPlayerProgressBar(playerid, ${varName}, ${f(clampPbAutoFillMax(td.pbAutoFillMax ?? td.pbMax, td.pbMax))});`);
  if (td.pbBlink) {
    const col = Number(td.pbBlinkColor || 0) >>> 0;
    const bcol = Number(td.pbBlinkBorderColor || 0) >>> 0;
    const extra = bcol ? `, ${col ? hexOf(col) : 0}, ${hexOf(bcol)}` : (col ? ', ' + hexOf(col) : '');
    lines.push(`BlinkPlayerProgressBar(playerid, ${varName}, ${clampPbBlinkInterval(td.pbBlinkInterval)}, ${clampPbBlinkDuration(td.pbBlinkDuration)}${extra});`);
  }
  return lines;
}

// Final parameters of the TextDraw* functions, used in the Pawn export and the test server
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

// Effect of a TextDraw (TextDrawFX include, editor/tdfx.js): td.fx = { type, ...parameters of the function }
export { tdfxActive, TDFX_INCLUDE } from './tdfx.js';

// The lines that create and style a TextDraw (PlayerTextDraw* with playerid for the ones of a player, TextDraw* for the global ones),
// and its TextDrawFX effect. refVar(uid) = variable of another TextDraw (the bottom bar of the letterbox).
export function textDrawPawn(td, varName, fmt, createText, comment = '', refVar = () => null) {
  const n = textDrawNative(td);
  const hex = (v) => '0x' + (Number(v) >>> 0).toString(16).toUpperCase().padStart(8, '0');
  const player = Boolean(td.isPlayer);
  const prefix = player ? 'PlayerText:' : 'Text:';
  const call = (name, ...args) => `${player ? 'PlayerTextDraw' : 'TextDraw'}${name[0].toUpperCase()}${name.slice(1)}(${player ? 'playerid, ' : ''}${varName}${args.length ? ', ' + args.join(', ') : ''});`;
  const lines = [`new ${prefix}${varName} = ${player ? 'CreatePlayerTextDraw(playerid, ' : 'TextDrawCreate('}${fmt(td.x)}, ${fmt(td.y)}, ${JSON.stringify(createText ?? n.text)});${comment}`];
  lines.push(call('font', n.font));
  lines.push(call('letterSize', fmt(n.letterSizeX), fmt(n.letterSizeY)));
  lines.push(call('alignment', n.align));
  lines.push(call('color', hex(n.color)));
  lines.push(call('setOutline', n.outline));
  lines.push(call('setShadow', n.shadow));
  lines.push(call('setProportional', n.proportional));
  if (n.useBox) {
    lines.push(call('useBox', 1));
    lines.push(call('boxColor', hex(n.boxColor)));
  }
  lines.push(call('textSize', fmt(n.textSizeX), fmt(n.textSizeY)));
  lines.push(call('backgroundColor', hex(n.backgroundColor)));
  if (td.selectable) lines.push(call('setSelectable', 1));
  if (n.font === 5 && td.previewModel) {
    lines.push(call('setPreviewModel', td.previewModel));
    lines.push(call('setPreviewRot', fmt(td.previewRotX ?? -16), fmt(td.previewRotY ?? 0), fmt(td.previewRotZ ?? -55), fmt(td.previewZoom || 1)));
    lines.push(call('setPreviewVehCol', td.previewColor1 ?? 1, td.previewColor2 ?? 1));
  }
  if (player) lines.push(`PlayerTextDrawShow(playerid, ${varName});`);
  const fx = tdfxPawn(td, varName, n.text, refVar);
  if (fx) lines.push(fx);
  return lines;
}

export function makeTextDraw(data) {
  if (data.tdv === undefined && data.uid) data = migrateLegacyTextDraw(data);
  // Size of a bar as the include draws it (defaults 60 x 8, like CreatePlayerProgressBar)
  const pbW = data.pbWidth !== undefined ? +data.pbWidth : 60;
  const pbH = pbRealHeight(data.pbHeight !== undefined ? +data.pbHeight : 8, data.pbStyle ?? 0, data.pbDir ?? 0);
  const alignVal = data.align !== undefined ? (data.align | 0) : (data.alignment !== undefined ? (data.alignment | 0) : 1);
  return {
    tdv: TD_VERSION,
    uid: data.uid || newUid(),
    name: data.name ? String(data.name) : 'Textdraw0',
    isPlayer: data.isPlayer !== undefined ? Boolean(data.isPlayer) : true, // a new TextDraw is a PlayerTextDraw
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
    // TextDrawFX effect (null = none)
    fx: data.type === 'progress' ? null : makeFx(data.fx, data),
    comment: data.comment ? String(data.comment) : '',
    ...(data.type === 'progress' ? {
      type: 'progress', isPlayer: true,
      name: data.name && data.name !== 'Textdraw0' ? String(data.name) : '',
      pbWidth: pbW,
      pbHeight: pbH,
      pbMax: data.pbMax !== undefined ? +data.pbMax : 100,
      pbValue: data.pbValue !== undefined ? +data.pbValue : 50,
      pbDir: data.pbDir !== undefined ? (data.pbDir | 0) : 0,
      pbBorder: fitPbBorder(data.pbBorder ?? PB_LIMITS.borderDefault, pbW, pbH),
      pbBlink: Boolean(data.pbBlink),
      pbBlinkInterval: clampPbBlinkInterval(data.pbBlinkInterval ?? PB_LIMITS.blinkDefault),
      pbBlinkDuration: clampPbBlinkDuration(data.pbBlinkDuration ?? 0),
      pbBlinkColor: Number(data.pbBlinkColor || 0) >>> 0,
      pbBorderColor: Number(data.pbBorderColor || 0) >>> 0,
      pbStyle: clampPbStyle(data.pbStyle ?? 0),
      pbAutoFill: Boolean(data.pbAutoFill),
      pbAutoFillMax: clampPbAutoFillMax(data.pbAutoFillMax ?? (data.pbMax ?? 100), data.pbMax ?? 100),
      pbSegments: clampPbSegments(data.pbSegments ?? 24),
      pbSegmentScale: clampPbSegmentScale(data.pbSegmentScale ?? 1),
      pbBlinkBorderColor: Number(data.pbBlinkBorderColor || 0) >>> 0,
      pbMin: data.pbMin !== undefined ? +data.pbMin || 0 : 0,
      pbGradient: Boolean(data.pbGradient),
      pbGradEmpty: data.pbGradEmpty !== undefined ? Number(data.pbGradEmpty) >>> 0 : PB_GRADIENT_DEFAULT.empty,
      pbGradMid: data.pbGradMid !== undefined ? Number(data.pbGradMid) >>> 0 : PB_GRADIENT_DEFAULT.mid,
      pbGradFull: data.pbGradFull !== undefined ? Number(data.pbGradFull) >>> 0 : PB_GRADIENT_DEFAULT.full,
      pbGradInverted: Boolean(data.pbGradInverted),
      pbLabel: Boolean(data.pbLabel),
      pbLabelText: data.pbLabelText !== undefined ? clampPbLabelText(data.pbLabelText) : PB_LABEL_DEFAULT,
      pbLabelColor: data.pbLabelColor !== undefined ? Number(data.pbLabelColor) >>> 0 : 0xFFFFFFFF,
      pbLabelFollow: Boolean(data.pbLabelFollow),
      pbLabelAlign: [1, 2, 3].includes(data.pbLabelAlign | 0) ? data.pbLabelAlign | 0 : 2,
      pbLabelFont: data.pbLabelFont !== undefined ? Math.max(0, Math.min(3, data.pbLabelFont | 0)) : 1,
      pbLabelScaleX: Math.max(0, +data.pbLabelScaleX || 0),
      pbLabelScaleY: Math.max(0, +data.pbLabelScaleY || 0),
      pbLabelOffX: +data.pbLabelOffX || 0,
      pbLabelOffY: +data.pbLabelOffY || 0,
      pbLabelOrient: Math.max(0, Math.min(2, data.pbLabelOrient | 0)),
      pbLerp: Boolean(data.pbLerp),
      pbLerpFrom: +data.pbLerpFrom || 0,
      pbLerpMs: clampPbLerpMs(data.pbLerpMs ?? 500),
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
    action: data.action ? makeAction(data.action) : null,
    menu: data.menu ? makeMenu(data.menu) : null,
    radarIcon: Boolean(data.radarIcon),
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

const EXTRAS = ['doors', 'world', 'retex', 'handling', 'weapons', 'drawDist', 'customModels'];
const EXTRA_LABELS = {
  doors: 'Alterar entradas e saídas', world: 'Alterar o mundo', retex: 'Alterar texturas trocadas', handling: 'Alterar o handling',
  weapons: 'Alterar armas', drawDist: 'Alterar distância de visão', customModels: 'Alterar modelos próprios',
};
const KINDS = ['objects', 'vehicles', 'actors', 'removed', 'labels', 'pickups', 'gangZones', 'textDraws', 'checkpoints', 'mapIcons', 'spawns'];
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
  spawns: makeSpawn,
};

export class Project {
  // 'mp' (SA-MP / open.mp) or 'sp' (Singleplayer, exported as a Modloader folder); new projects follow the mode chosen at startup
  static defaultMode = 'mp';
  constructor(name = 'Meu mapa') {
    this.name = name;
    this.mode = Project.defaultMode;
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
    this.spawns = [];
    this.doors = [];
    this.world = makeWorld(null);
    this.customModels = [];
    this.retex = [];     // textures replaced in the whole map (Singleplayer)
    this.handling = {};  // vehicle name -> its changed handling values
    this.drawDist = {};  // model id -> view distance
    this.weapons = {};   // weapon.dat line key -> its changed values
    this.installedAs = ''; // Singleplayer: the name the mod was last installed with (the project may have been renamed since)
    this.modId = newModId(); // Singleplayer: permanent id of the project, written in its installed mod (survives renames)
    this.pwnHeader = '';
    this.rawPawn = '';
    this.camera = null;
    this.lastSelection = [];   // items selected at the last save (to resume where it left off)
    this.cameras = emptyCameras();
    this.undoStack = [];
    this.redoStack = [];
    this.listeners = new Set();
    this.version = 0;
    this._extras = this.snapshotExtras();
  }

  static fromJSON(data) {
    const p = new Project(data.name || 'Meu mapa');
    p.mode = data.mode === 'sp' ? 'sp' : 'mp';
    p.doors = (data.doors || []).map(makeDoor);
    p.world = makeWorld(data.world);
    p.customModels = (data.customModels || []).map(makeCustomModel);
    p.retex = (data.retex || []).filter(r => r && r.txd && r.name && r.srcTxd && r.srcName).map(r => ({ txd: String(r.txd), name: String(r.name), srcTxd: String(r.srcTxd), srcName: String(r.srcName) }));
    p.handling = {};
    for (const [k, v] of Object.entries(data.handling || {})) if (Array.isArray(v) && v.length === 35) p.handling[k] = v.map(String);
    p.installedAs = String(data.installedAs || '');
    p.modId = MOD_ID_RE.test(data.modId || '') ? data.modId : ''; // old projects get one at the next install
    p.weapons = {};
    for (const [k, v] of Object.entries(data.weapons || {})) if (Array.isArray(v) && v.length >= 8) p.weapons[k] = v.map(String);
    p.drawDist = {};
    for (const [k, v] of Object.entries(data.drawDist || {})) if (Number.isFinite(+v) && +v >= 20) p.drawDist[k] = +v;
    for (const k of KINDS) p[k] = (data[k] || []).map(MAKERS[k]);
    repairAttachments(p.objects, p.vehicles);
    // The spawn point used to be a setting of the world
    const old = data.world && (data.world.spawn || data.world.start);
    if (old && Number.isFinite(+old.x) && !p.spawns.length) p.spawns.push(makeSpawn({ x: old.x, y: old.y, z: old.z, rz: old.rot || 0 }));
    p.world.spawn = null;
    p.camera = data.camera || null;
    p.lastSelection = Array.isArray(data.lastSelection) ? data.lastSelection.filter(u => typeof u === 'string') : [];
    p.cameras = normalizeCameras(data.cameras);
    p.pwnHeader = data.pwnHeader || '';
    p.rawPawn = data.rawPawn || '';
    p._extras = p.snapshotExtras();
    return p;
  }

  toJSON() {
    return {
      app: 'SA Map Studio', format: 1, name: this.name, mode: this.mode, savedAt: new Date().toISOString(),
      pwnHeader: this.pwnHeader || '', rawPawn: this.rawPawn || '',
      camera: this.camera, lastSelection: this.lastSelection || [], cameras: this.cameras,
      objects: this.objects, vehicles: this.vehicles, actors: this.actors, removed: this.removed,
      labels: this.labels, pickups: this.pickups, gangZones: this.gangZones, textDraws: this.textDraws,
      checkpoints: this.checkpoints, mapIcons: this.mapIcons, spawns: this.spawns, doors: this.doors, world: this.world, customModels: this.customModels,
      retex: this.retex, handling: this.handling, drawDist: this.drawDist, weapons: this.weapons, installedAs: this.installedAs, modId: this.modId
    };
  }

  // Changes outside the history (cameras): only warns to save. The Singleplayer settings (doors, world, textures, handling...) go into
  // the undo history here: what was kept at the last change is compared with what is there now
  touch(what = 'cameras') {
    if (EXTRAS.includes(what)) this.recordExtras(what);
    this.emit({ type: what, uids: [] });
  }

  snapshotExtras() { return JSON.stringify(Object.fromEntries(EXTRAS.map(k => [k, this[k]]))); }

  recordExtras(key) {
    const now = this.snapshotExtras();
    if (now === this._extras) return;
    const t = performance.now();
    const last = this.undoStack[this.undoStack.length - 1];
    if (last?.extras && last.extras.key === key && !this.redoStack.length && t - last.extras.at < 900) {
      last.extras.after = now; last.extras.at = t; // typing in a field: one step
    } else {
      this.undoStack.push({ label: EXTRA_LABELS[key] || 'Alterar', before: [], after: [], extras: { key, before: this._extras, after: now, at: t }, _seq: ++_globalOpSeq });
      if (this.undoStack.length > 200) this.undoStack.shift();
      this.redoStack.length = 0;
    }
    this._extras = now;
  }

  applyExtras(json) {
    const d = JSON.parse(json);
    this.doors = (d.doors || []).map(makeDoor);
    this.world = makeWorld(d.world);
    this.customModels = (d.customModels || []).map(makeCustomModel);
    this.retex = d.retex || [];
    this.handling = d.handling || {};
    this.drawDist = d.drawDist || {};
    this.weapons = d.weapons || {};
    this._extras = this.snapshotExtras();
    this.emit({ type: 'extras', uids: [] });
  }

  on(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  emit(change) { this.version++; for (const fn of this.listeners) fn(change); }

  // uid -> [kind, item]: the lookups by uid are everywhere (every selected item, every frame...) and scanning the lists made a project with some
  // hundreds of objects freeze; the index is made again when the project changes (its version) or when a list changes its size
  _index() {
    let sig = 0;
    for (const k of KINDS) sig = sig * 31 + this[k].length;
    if (this._idx && this._idxVersion === this.version && this._idxSig === sig) return this._idx;
    const m = new Map();
    for (const k of KINDS) for (const o of this[k]) if (!m.has(o.uid)) m.set(o.uid, [k, o]);
    this._idx = m; this._idxVersion = this.version; this._idxSig = sig;
    return m;
  }
  kindOf(uid) {
    const e = this._index().get(uid);
    return e ? e[0] : null;
  }
  find(uid) {
    const e = this._index().get(uid);
    return e ? e[1] : null;
  }
  snapshot(uid) {
    const k = this.kindOf(uid);
    return k ? { uid, kind: k, data: JSON.parse(JSON.stringify(this.find(uid))) } : { uid, kind: null, data: null };
  }

  // Applies states (creates, updates or deletes) without touching the history
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

  // Runs a change recording undo/redo.
  // fn() makes the changes directly; uids says who may change.
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

  // Records a change already made (e.g. dragging with the gizmo)
  record(label, before, after) {
    if (JSON.stringify(before) === JSON.stringify(after)) return;
    this.undoStack.push({ label, before, after, _seq: ++_globalOpSeq });
    this.redoStack.length = 0;
    this.emit({ type: 'transact', label, uids: after.map(s => s.uid) });
  }

  // Import in a single undo step: removes the items (replace), adds the new ones and swaps the header,
  // original code and project cameras
  importItems(label, removeUids, items, meta = null) {
    const fields = () => JSON.parse(JSON.stringify({ pwnHeader: this.pwnHeader || '', rawPawn: this.rawPawn || '', cameras: this.cameras }));
    const metaBefore = fields();
    const uids = [];
    this.transact(label, removeUids, () => {
      if (removeUids.length) { const rm = new Set(removeUids); for (const k of KINDS) this[k] = this[k].filter(o => !rm.has(o.uid)); }
      for (const it of items) {
        const k = MAKERS[it.kind] ? it.kind : 'objects';
        const obj = MAKERS[k](it);
        this[k].push(obj);
        uids.push(obj.uid);
      }
      meta?.(this);
      return uids;
    });
    const metaAfter = fields();
    const op = this.undoStack[this.undoStack.length - 1];
    if (JSON.stringify(metaBefore) !== JSON.stringify(metaAfter)) {
      if (op?.label === label && op.after.some(s => uids.includes(s.uid))) op.meta = { before: metaBefore, after: metaAfter };
      else {
        this.undoStack.push({ label, before: [], after: [], meta: { before: metaBefore, after: metaAfter }, _seq: ++_globalOpSeq });
        this.redoStack.length = 0;
      }
    }
    if (this.checkpoints?.length) updateRaceCheckpointsChain(this.checkpoints);
    return uids;
  }

  applyMeta(m) {
    if (!m) return;
    this.pwnHeader = m.pwnHeader;
    this.rawPawn = m.rawPawn;
    this.cameras = normalizeCameras(m.cameras);
    this.emit({ type: 'cameras', uids: [] });
  }

  undo() {
    const op = this.undoStack.pop();
    if (!op) return null;
    this.applyStates(op.before);
    this.applyMeta(op.meta?.before);
    if (op.extras) this.applyExtras(op.extras.before);
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
    this.applyMeta(op.meta?.after);
    if (op.extras) this.applyExtras(op.extras.after);
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

  // Adds an item of any supported type with undo/redo recording
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

  // ---- high-level operations ----
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
        copy.kind = k;
        copy.projectId = this.name;
        itemsToAdd.push(copy);
      }
    }
    return this.importItems(`Mesclar projeto "${otherProject.name}"`, [], prepareImportItems(itemsToAdd));
  }
}

// ---------------------------------------------------------------- cameras
// shots: pontos fixos (SetPlayerCameraPos + SetPlayerCameraLookAt)
// paths: sequences of InterpolateCameraPos/LookAt. Each step goes from the previous point to this one.
export function emptyCameras() { return { shots: [], paths: [] }; }

const vec = (v) => ({ x: +v?.x || 0, y: +v?.y || 0, z: +v?.z || 0 });

export function normalizeCameras(c) {
  const out = emptyCameras();
  if (!c) return out;
  out.shots = (c.shots || []).map((s, i) => ({ id: s.id || 'c' + Date.now().toString(36) + i, name: String(s.name || tr('Câmera {0}', i + 1)), pos: vec(s.pos), look: vec(s.look), cut: s.cut === 'move' ? 'move' : 'cut' }));
  out.paths = (c.paths || []).map((p, i) => ({
    id: p.id || 'p' + Date.now().toString(36) + i,
    name: String(p.name || tr('Movimento {0}', i + 1)),
    end: ['behind', 'keep', 'loop'].includes(p.end) ? p.end : 'behind',
    keys: (p.keys || []).map(k => ({ name: k.name ? String(k.name) : '', pos: vec(k.pos), look: vec(k.look), time: Math.max(0, Math.round(+k.time || 0)), hold: Math.max(0, Math.round(+k.hold || 0)), cut: k.cut === 'cut' ? 'cut' : 'move' })),
  }));
  return out;
}
