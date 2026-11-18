// SPDX-License-Identifier: MPL-2.0
// open.mp NPCs: an actor of a Multiplayer project for open.mp can become a NPC controlled by the server (the NPC component of
// open.mp, natives NPC_*). Shared by the inspector, the 3D preview, the Pawn export and import and the test server (which compiles
// exactly the exported code as a side script).
//
// The exported code has tables with the settings (read back by the import) and a ready routine; the OnNPC* callbacks it needs are
// hooked by itself (ALS), so the code goes above the callbacks of the script.

const fin = (v, d) => (v !== undefined && v !== null && v !== '' && Number.isFinite(+v) ? +v : d);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const int = (v, d, a, b) => clamp(Math.round(fin(v, d)), a, b);
const bool = (v, d) => (v === undefined || v === null ? d : v === true || v === 1 || v === '1');

export const NPC_MODES = ['idle', 'path', 'wander', 'guard', 'follow', 'playback'];
export const NPC_MOVE_TYPES = ['auto', 'walk', 'jog', 'sprint', 'drive'];
const MOVE_CONST = { auto: 5, walk: 1, jog: 2, sprint: 3, drive: 4 };
// Speed of each move type in metres per second (measured in the server: NPC_MOVE_SPEED_* x 10), for the preview and the "auto" speed
export const MOVE_MPS = { walk: 1.55, jog: 5.64, sprint: 9.27, drive: 10 };
export const NPC_LOOPS = ['loop', 'pingpong', 'once'];
export const NPC_DAMAGE = ['none', 'fight', 'flee'];

export const FIGHT_STYLES = [[4, 'Normal'], [5, 'Boxe'], [6, 'Kung fu'], [7, 'Joelhada'], [15, 'Agarrar e chutar'], [16, 'Cotovelada']];
export const SPECIAL_ACTIONS = [
  [0, 'Nenhuma'], [1, 'Agachado'], [2, 'Jetpack'], [5, 'Dança 1'], [6, 'Dança 2'], [7, 'Dança 3'], [8, 'Dança 4'], [10, 'Mãos para cima'],
  [11, 'Usando o celular'], [12, 'Sentado'], [13, 'Guardar o celular'], [20, 'Bebendo cerveja'], [21, 'Fumando'], [22, 'Bebendo vinho'],
  [23, 'Bebendo Sprunk'], [24, 'Algemado'], [25, 'Carregando caixa'], [68, 'Urinando'],
];
// WEAPONSKILL_*: the weapon classes whose skill can be set (0 to 999)
export const WEAPON_SKILLS = ['Pistola 9mm', 'Pistola silenciada', 'Desert Eagle', 'Escopeta', 'Escopeta de cano serrado', 'Escopeta de combate', 'Micro SMG', 'MP5', 'AK-47', 'M4', 'Sniper'];
export const WEAPON_STATES = [[0, 'Sem balas'], [1, 'Última bala'], [2, 'Com balas'], [3, 'Recarregando']];
const MELEE = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
export const isMeleeWeapon = (w) => MELEE.has(w | 0);

// Actions at a point of the path: [type, label, fields]. Field: [key, kind, default, label]. The order is the number in the Pawn table.
// Kinds: i (integer), f (decimal), b (yes/no), s (text), veh (vehicle of the project), weapon, skin, special, move, wstate, gear, rec
export const NPC_ACTIONS = [
  ['wait', 'Esperar', [['ms', 'i', 2000, 'Tempo (ms)']]],
  ['anim', 'Animação', [['lib', 's', 'PED', 'Biblioteca'], ['name', 's', 'IDLE_chat', 'Nome'], ['delta', 'f', 4.1, 'Velocidade'], ['loop', 'b', 1, 'Repetir'], ['lockx', 'b', 0, 'Travar X'], ['locky', 'b', 0, 'Travar Y'], ['freeze', 'b', 0, 'Congelar'], ['time', 'i', 0, 'Tempo (ms)']]],
  ['animId', 'Animação por id', [['id', 'i', 0, 'Id da animação'], ['delta', 'f', 4.1, 'Velocidade'], ['loop', 'b', 1, 'Repetir'], ['lockx', 'b', 0, 'Travar X'], ['locky', 'b', 0, 'Travar Y'], ['freeze', 'b', 0, 'Congelar'], ['time', 'i', 0, 'Tempo (ms)']]],
  ['clearAnim', 'Limpar animação', [['reset', 'b', 0, 'Voltar à pose padrão']]],
  ['special', 'Ação especial', [['id', 'special', 0, 'Ação']]],
  ['face', 'Virar para o ângulo', [['angle', 'f', 0, 'Ângulo']]],
  ['lookAt', 'Olhar para o ponto', [['x', 'f', 0, 'X'], ['y', 'f', 0, 'Y'], ['z', 'f', 0, 'Z']]],
  ['rotate', 'Girar', [['rx', 'f', 0, 'X'], ['ry', 'f', 0, 'Y'], ['rz', 'f', 0, 'Z']]],
  ['aim', 'Mirar no ponto', [['x', 'f', 0, 'X'], ['y', 'f', 0, 'Y'], ['z', 'f', 0, 'Z'], ['shoot', 'b', 1, 'Atirar'], ['delay', 'i', -1, 'Intervalo dos tiros (ms, -1 = da arma)']]],
  ['stopAim', 'Parar de mirar', []],
  ['shoot', 'Atirar no ponto', [['x', 'f', 0, 'X'], ['y', 'f', 0, 'Y'], ['z', 'f', 0, 'Z'], ['hit', 'b', 1, 'Acerta o que houver no caminho']]],
  ['melee', 'Golpear', [['time', 'i', -1, 'Tempo (ms, -1 = um golpe)'], ['secondary', 'b', 0, 'Golpe secundário']]],
  ['stopMelee', 'Parar de golpear', []],
  ['enterVeh', 'Entrar no veículo', [['veh', 'veh', '', 'Veículo'], ['seat', 'i', 0, 'Assento'], ['move', 'move', 'auto', 'Como vai até ele']]],
  ['exitVeh', 'Sair do veículo', []],
  ['putInVeh', 'Pôr no veículo', [['veh', 'veh', '', 'Veículo'], ['seat', 'i', 0, 'Assento']]],
  ['removeVeh', 'Tirar do veículo', []],
  ['siren', 'Sirene', [['on', 'b', 1, 'Ligada']]],
  ['gear', 'Trem de pouso', [['state', 'gear', 0, 'Estado']]],
  ['thrust', 'Turbinas do Hydra', [['dir', 'i', 0, 'Direção (0 a 5000)']]],
  ['train', 'Velocidade do trem', [['speed', 'f', 0.5, 'Velocidade']]],
  ['vehHealth', 'Vida do veículo', [['health', 'f', 1000, 'Vida']]],
  ['weapon', 'Trocar arma', [['id', 'weapon', 24, 'Arma'], ['ammo', 'i', 100, 'Munição']]],
  ['weaponState', 'Estado da arma', [['state', 'wstate', 2, 'Estado']]],
  ['keys', 'Teclas', [['ud', 'i', 0, 'Cima/baixo'], ['lr', 'i', 0, 'Esquerda/direita'], ['keys', 'i', 0, 'Teclas (valor KEY_*)']]],
  ['velocity', 'Impulso', [['vx', 'f', 0, 'X'], ['vy', 'f', 0, 'Y'], ['vz', 'f', 0.3, 'Z']]],
  ['teleport', 'Teleportar', [['x', 'f', 0, 'X'], ['y', 'f', 0, 'Y'], ['z', 'f', 0, 'Z']]],
  ['interior', 'Interior', [['id', 'i', 0, 'Interior']]],
  ['world', 'Mundo virtual', [['id', 'i', 0, 'Mundo']]],
  ['health', 'Vida', [['value', 'f', 100, 'Vida']]],
  ['armour', 'Colete', [['value', 'f', 100, 'Colete']]],
  ['skin', 'Trocar skin', [['id', 'skin', 0, 'Skin']]],
  ['playback', 'Tocar gravação', [['rec', 'rec', '', 'Gravação'], ['fromNpc', 'b', 1, 'Começar onde o NPC está']]],
  ['wander', 'Passear pelas ruas', []],
  ['surf', 'Subir no veículo (surf)', [['veh', 'veh', '', 'Veículo'], ['ox', 'f', 0, 'X'], ['oy', 'f', 0, 'Y'], ['oz', 'f', 1, 'Z']]],
  ['stopSurf', 'Parar de surfar', []],
  ['kill', 'Morrer', []],
  ['say', 'Falar (balão)', [['text', 's', 'Olá!', 'Texto'], ['dist', 'f', 20, 'Distância'], ['ms', 'i', 4000, 'Tempo (ms)']]],
  ['stop', 'Fim do caminho', []],
];
const ACTION = new Map(NPC_ACTIONS.map((a, i) => [a[0], { code: i + 1, label: a[1], fields: a[2] }]));
export const actionInfo = (t) => ACTION.get(t);

export function normalizeAction(a) {
  const info = ACTION.get(a?.t);
  if (!info) return null;
  const out = { t: a.t };
  for (const [k, kind, def] of info.fields) {
    const v = a[k];
    if (kind === 's' || kind === 'veh' || kind === 'rec') out[k] = String(v ?? def).replace(/["\\\r\n]/g, '').slice(0, kind === 's' ? 120 : 31);
    else if (kind === 'move') out[k] = NPC_MOVE_TYPES.includes(v) ? v : def;
    else if (kind === 'b') out[k] = bool(v, !!def) ? 1 : 0;
    else if (kind === 'f') out[k] = fin(v, def);
    else out[k] = Math.round(fin(v, def));
  }
  return out;
}

// Name of a NPC: it is its player name (3 to 24 letters, digits and []()$@._=)
export const cleanNpcName = (s) => String(s || '').replace(/[^0-9A-Za-z[\]()$@._=]/g, '_').slice(0, 24);
export function uniqueNpcName(wanted, used) {
  let base = cleanNpcName(wanted);
  if (base.length < 3) base = 'NPC';
  if (!used.has(base.toLowerCase())) return base;
  for (let i = 2; ; i++) {
    const n = base.slice(0, 24 - String(i).length - 1) + '_' + i;
    if (!used.has(n.toLowerCase())) return n;
  }
}

export const NPC_DEFAULTS = {
  armour: 0, interior: 0, weapon: 0, ammo: 500, clip: -1, infiniteAmmo: true, reload: true,
  accuracy: -1, reloadTime: -1, shootTime: -1, clipSize: -1, fightStyle: 4, special: 0,
  mode: 'idle', moveType: 'auto', speed: 0, loop: 'loop', look: false, range: 20, chase: true, followDist: 2,
  onDamage: 'none', respawn: 10,
  giveUp: 0, fleeDist: 25, fleeAlert: 0, shootDist: 8, followRange: 150, chaseMove: 'jog', returnMove: 'walk', dmgMult: 1,
  fleeMove: 'sprint', wanderRadius: 0, lane: 2.5, color: 0xFFFFFFFF, marker: false, bubble: '', bubbleColor: 0xFFFFFFFF, bubbleDist: 20,
  wanderLimit: 'free', startWhen: 'seen', aimMove: 'stop', noAmmo: 'melee', meleeKind: 'mix', meleeTime: -1, meleeReach: 1.3,
  chaseUpdate: 500, shootDelay: -1, aimAt: 'body', smooth: 0,
};
export const NPC_LIMITS = ['free', 'radius', 'area'];
// Where it aims at the player: offset Z from the middle of the body (NPC_AimAtPlayer)
const AIM_Z = { body: 0, head: 0.6, legs: -0.6 };

// n: the npc settings of the actor (its skin, position, angle, health, invulnerability, world and animation stay in the actor)
export function normalizeNpc(n) {
  if (!n) return null;
  const d = NPC_DEFAULTS;
  const pts = Array.isArray(n.points) ? n.points : [];
  // A NPC that stands or guards stays on foot
  const veh = n.vehicle && n.vehicle.uid && !['idle', 'guard'].includes(n.mode) ? {
    uid: String(n.vehicle.uid), seat: int(n.vehicle.seat, 0, 0, 10), siren: bool(n.vehicle.siren, false),
    health: clamp(fin(n.vehicle.health, 1000), 0, 100000),
  } : null;
  const surf = n.surf && n.surf.uid ? {
    type: n.surf.type === 'object' ? 'object' : 'vehicle', uid: String(n.surf.uid),
    ox: fin(n.surf.ox, 0), oy: fin(n.surf.oy, 0), oz: fin(n.surf.oz, 1),
  } : null;
  return {
    name: cleanNpcName(n.name) || 'NPC',
    armour: clamp(fin(n.armour, d.armour), 0, 100),
    interior: int(n.interior, d.interior, 0, 255),
    weapon: int(n.weapon, d.weapon, 0, 46),
    ammo: int(n.ammo, d.ammo, 0, 99999),
    clip: int(n.clip, d.clip, -1, 9999),
    infiniteAmmo: bool(n.infiniteAmmo, d.infiniteAmmo),
    reload: bool(n.reload, d.reload),
    // -1 = the game's own (also when the box is empty or not a number: never 0, which would make it miss every shot)
    accuracy: fin(n.accuracy, -1) < 0 ? -1 : clamp(fin(n.accuracy, -1), 0, 1),
    reloadTime: int(n.reloadTime, d.reloadTime, -1, 60000),
    shootTime: int(n.shootTime, d.shootTime, -1, 60000),
    clipSize: int(n.clipSize, d.clipSize, -1, 9999),
    skills: Array.from({ length: 11 }, (_, i) => int(n.skills?.[i], -1, -1, 999)),
    fightStyle: FIGHT_STYLES.some(f => f[0] === +n.fightStyle) ? +n.fightStyle : d.fightStyle,
    special: SPECIAL_ACTIONS.some(s => s[0] === +n.special) ? +n.special : 0,
    mode: NPC_MODES.includes(n.mode) ? n.mode : d.mode,
    moveType: NPC_MOVE_TYPES.includes(n.moveType) ? n.moveType : d.moveType,
    speed: clamp(fin(n.speed, 0), 0, 100), // metres per second, 0 = automatic
    loop: NPC_LOOPS.includes(n.loop) ? n.loop : d.loop,
    points: pts.filter(p => p && Number.isFinite(+p.x) && Number.isFinite(+p.y)).slice(0, 2000).map(p => ({
      x: +p.x, y: +p.y, z: fin(p.z, 0), stop: clamp(fin(p.stop, 0.2), 0.05, 50),
      acts: (Array.isArray(p.acts) ? p.acts : []).map(normalizeAction).filter(Boolean).slice(0, 32),
    })),
    look: bool(n.look, d.look),
    range: clamp(fin(n.range, d.range), 1, 300),
    chase: bool(n.chase, d.chase),
    followDist: clamp(fin(n.followDist, d.followDist), 0.5, 50),
    // Fights: when it gives up the chase (m, 0 = automatic: 1.5 x the range of a guard, 60 m for the others), how far it flees,
    // from how far it shoots, how far it looks for the player to follow, and how it moves when it chases and when it goes back
    giveUp: clamp(fin(n.giveUp, d.giveUp), 0, 1000),
    fleeDist: clamp(fin(n.fleeDist, d.fleeDist), 3, 300),
    // After fleeing: on the alert for this long (s; the attacker coming closer makes it flee again), then it waits this long (s)
    // before going back to what it did (a follower waits 10 s by default, the others go back at once)
    fleeAlert: clamp(fin(n.fleeAlert, d.fleeAlert), 0, 600),
    fleeWait: clamp(fin(n.fleeWait, n.mode === 'follow' ? 10 : 0), 0, 600),
    shootDist: clamp(fin(n.shootDist, d.shootDist), 1, 100),
    followRange: clamp(fin(n.followRange, d.followRange), 5, 1000),
    chaseMove: ['walk', 'jog', 'sprint'].includes(n.chaseMove) ? n.chaseMove : d.chaseMove,
    dmgMult: clamp(fin(n.dmgMult, d.dmgMult), 0.05, 100), // damage it takes x this (1 = as the game gives)
    returnMove: ['walk', 'jog', 'sprint'].includes(n.returnMove) ? n.returnMove : d.returnMove,
    fleeMove: ['walk', 'jog', 'sprint'].includes(n.fleeMove) ? n.fleeMove : d.fleeMove,
    wanderRadius: clamp(fin(n.wanderRadius, d.wanderRadius), 0, 6000), // streets: goes back when farther than this from its place (0 = free)
    lane: clamp(fin(n.lane, d.lane), 0, 10), // street routes of a driver: metres to the right of the middle of the road
    // Seen by the players: colour (radar), radar marker, chat bubble over the head (the game shows no name tag over a NPC)
    color: (fin(n.color, d.color) >>> 0), marker: bool(n.marker, d.marker),
    bubble: String(n.bubble || '').replace(/["\\\r\n]/g, ' ').slice(0, 120), bubbleColor: (fin(n.bubbleColor, d.bubbleColor) >>> 0),
    bubbleDist: clamp(fin(n.bubbleDist, d.bubbleDist), 1, 200),
    // Streets: free (native wander), inside a radius or inside an area (gang zone like rectangle) with the street graph of the place
    wanderLimit: NPC_LIMITS.includes(n.wanderLimit) ? n.wanderLimit : (fin(n.wanderRadius, 0) > 0 ? 'radius' : 'free'),
    area: n.area && [n.area.x1, n.area.y1, n.area.x2, n.area.y2].every(v => Number.isFinite(+v))
      ? { x1: +(+n.area.x1).toFixed(2), y1: +(+n.area.y1).toFixed(2), x2: +(+n.area.x2).toFixed(2), y2: +(+n.area.y2).toFixed(2) } : null,
    streets: n.streets && Array.isArray(n.streets.nodes) && Array.isArray(n.streets.adj) ? n.streets : null,
    smooth: clamp(fin(n.smooth, d.smooth), 0, 20), // rounds the corners of the way (m)
    startWhen: ['seen', 'create'].includes(n.startWhen) ? n.startWhen : d.startWhen,
    // Fights: with a gun, stops to shoot or shoots walking; out of bullets: fists, flee or stay; strikes: normal, special of the
    // fighting style (aim + secondary attack), or both in turns; time between strikes, reach, chase update, shoot delay, aim point
    aimMove: ['stop', 'walk'].includes(n.aimMove) ? n.aimMove : d.aimMove,
    noAmmo: ['melee', 'flee', 'stay'].includes(n.noAmmo) ? n.noAmmo : d.noAmmo,
    meleeKind: ['normal', 'special', 'mix'].includes(n.meleeKind) ? n.meleeKind : d.meleeKind,
    meleeTime: int(n.meleeTime, d.meleeTime, -1, 10000),
    meleeReach: clamp(fin(n.meleeReach, d.meleeReach), 0.8, 3),
    chaseUpdate: int(n.chaseUpdate, d.chaseUpdate, 100, 5000),
    shootDelay: int(n.shootDelay, d.shootDelay, -1, 10000),
    aimAt: n.aimAt in AIM_Z ? n.aimAt : d.aimAt,
    rec: String(n.rec || '').replace(/[^0-9A-Za-z_\-.]/g, '').slice(0, 31),
    recFromNpc: bool(n.recFromNpc, true), recLoop: bool(n.recLoop, true), recPreload: bool(n.recPreload, false),
    vehicle: veh, surf,
    onDamage: NPC_DAMAGE.includes(n.onDamage) ? n.onDamage : d.onDamage,
    respawn: int(n.respawn, d.respawn, 0, 3600), // seconds after death (0 = stays dead)
  };
}

export function newNpc(actor, used) {
  return normalizeNpc({ name: uniqueNpcName(actor.comment || 'NPC', used), points: [] });
}

export const isOmpNpc = (a, project) => !!a?.npc && project?.mode !== 'sp' && project?.server !== 'samp';
export const projectNpcs = (project) => (project?.mode === 'sp' || project?.server === 'samp' ? [] : (project?.actors || []).filter(a => a.npc));

// Speed in m/s for the preview (0 = the type's own)
export function npcSpeed(n, inVehicle) {
  const type = n.moveType === 'auto' ? (inVehicle ? 'drive' : 'walk') : n.moveType;
  return n.speed > 0 ? n.speed : MOVE_MPS[type] || MOVE_MPS.walk;
}

// ---------------------------------------------------------------------------  legs
// The path is cut at the points that have actions: each piece is a NPC path (NPC_CreatePath) and the actions of its last point run
// when the NPC gets there. "loop" closes on the first point; when the first point has actions it is a leg of its own, run only once
// at the start (the loop starts again at the leg after it).
export function npcLegs(n) {
  const pts = n.points;
  if (!pts.length) return { seq: [], legs: [], loopStart: 0 };
  const seq = pts.map((_, i) => i);
  if (n.loop === 'loop' && pts.length > 1) seq.push(0);
  const legs = [];
  let start = 0;
  if (pts[0].acts.length) { legs.push([0, 0]); }
  for (let i = 1; i < seq.length; i++) {
    if (pts[seq[i]].acts.length || i === seq.length - 1) { legs.push([start, i]); start = i; }
  }
  if (seq.length === 1 && !legs.length) legs.push([0, 0]);
  const loopStart = pts[0].acts.length && legs.length > 1 ? 1 : 0;
  return { seq, legs, loopStart };
}

// ---------------------------------------------------------------------------  Pawn
export const npcIdent = (id) => `Npc_${id}`;
const MODE_CODE = { idle: 0, path: 1, wander: 2, guard: 3, follow: 4, playback: 5 };
const LOOP_CODE = { once: 0, loop: 1, pingpong: 2 };
const DMG_CODE = { none: 0, fight: 1, flee: 2 };
const DQ = '"';
const qs = (s) => DQ + String(s).replace(/["\\]/g, '') + DQ;

// npcs: the actors with npc settings, in export order; vehIdx / objIdx: uid -> index in Npc_<id>_Veh / Npc_<id>_Obj;
// fmt: number formatting; center: subtracted from the positions; tr: translation of the comments
export function npcPawn(npcs, { id, fmt, center = { x: 0, y: 0, z: 0 }, vehIdx = new Map(), objIdx = new Map(), tr = (s) => s }) {
  if (!npcs.length) return { decl: '', code: '', usage: [], load: '' };
  const P = npcIdent(id), N = npcs.length;
  // Player names must differ (copies of a NPC keep its name): the repeated ones get a number
  const used = new Set();
  const names = npcs.map(a => { const nm = uniqueNpcName(a.npc.name, used); used.add(nm.toLowerCase()); return nm; });
  const F = (v) => fmt(+v || 0);
  const X = (v) => F(v - center.x), Y = (v) => F(v - center.y), Z = (v) => F(v - center.z);
  const strs = [], strIdx = (s) => { let i = strs.indexOf(s); if (i < 0) { strs.push(s); i = strs.length - 1; } return i; };
  const pts = [], ptAct = [], legs = [], acts = [], ai = [], aiF = [], look = [];
  const gn = [], gnE = [], ge = []; // street graphs: points, (first way, ways), ways (to, lane offset x, y)
  const bubbleIdx = (n) => (n.bubble ? strIdx(n.bubble) : -1);
  const usedActs = new Set();
  let anyRadius = false, anyBubble = false, anyMult = false, anyWander = false, anyThink = false, anyPreload = false, anyPlayback = false, anyPath = false, anyCar = false, anyFlee = false;
  let anyGraph = false;
  const vref = (uid) => (vehIdx.has(uid) ? vehIdx.get(uid) : -1);
  const actRow = (a, n) => {
    const info = ACTION.get(a.t);
    usedActs.add(a.t);
    const v = info.fields.map(([k, kind]) => {
      if (kind === 'veh') return vref(a[k]);
      if (kind === 'move') return MOVE_CONST[a[k]];
      if (kind === 's') return strIdx(a[k]);
      if (kind === 'rec') { anyPlayback = true; return strIdx(a[k]); }
      if (['x', 'y', 'z'].includes(k) && ['lookAt', 'aim', 'shoot', 'teleport'].includes(a.t)) return a[k] - center[k];
      return a[k];
    });
    if (a.t === 'wander') anyWander = true;
    while (v.length < 8) v.push(0);
    return [info.code, ...v.slice(0, 8)];
  };
  npcs.forEach((a, k) => {
    const n = a.npc;
    const { seq, legs: lg, loopStart } = n.mode === 'path' ? npcLegs(n) : { seq: [], legs: [], loopStart: 0 };
    const first = legs.length;
    if (lg.length) anyPath = true;
    const base = pts.length;
    seq.forEach((pi) => {
      const p = n.points[pi];
      pts.push([X(p.x), Y(p.y), Z(p.z), F(p.stop), `// ${names[k]} ${pi + 1}`]);
      const a0 = acts.length;
      for (const act of p.acts) acts.push(actRow(act, n));
      ptAct.push([a0, p.acts.length]);
    });
    for (const [s, e] of lg) legs.push([base + s, base + e, k]);
    // Streets inside a radius or an area: the street graph of the place (made by the editor); free: the native wander
    const st = n.mode === 'wander' && n.wanderLimit !== 'free' && n.streets?.nodes?.length ? n.streets : null;
    let g0 = -1, gc = 0;
    if (st) {
      g0 = gn.length; gc = st.nodes.length; anyGraph = true;
      st.nodes.forEach((q, i) => {
        gnE.push([ge.length, st.adj[i].length]);
        gn.push([X(q[0]), Y(q[1]), Z(q[2])]);
        for (const [j, ox, oy] of st.adj[i]) ge.push([F(g0 + j), F(ox), F(oy)]);
      });
    }
    if (n.mode === 'wander' && !st) anyWander = true;
    // Looking at the players is for a NPC that stands (one that walks would turn to the player while it goes)
    const looks = n.look && n.mode === 'idle';
    if (['guard', 'follow'].includes(n.mode) || looks || n.onDamage !== 'none') anyThink = true;
    if ((n.onDamage === 'flee' && n.mode !== 'guard') || (n.weapon > 15 && n.noAmmo === 'flee' && (n.onDamage === 'fight' || n.mode === 'guard'))) anyFlee = true; // flees by the streets
    if (n.vehicle?.uid && vehIdx.has(n.vehicle.uid) && (n.onDamage === 'fight' || n.mode === 'guard')) anyCar = true; // gets out to fight
    if (n.dmgMult !== 1) anyMult = true;
    if (n.mode === 'playback' && n.rec) { anyPlayback = true; if (n.recPreload) anyPreload = true; }
    const recS = n.mode === 'playback' && n.rec ? strIdx(n.rec) : -1;
    // A path of one point repeated would start again at once, over and over (it is already there): it goes there once, unless its
    // actions wait (then they repeat)
    const onePoint = seq.length === 1 && !n.points[0].acts.some(x => x.t === 'wait' && x.ms > 0);
    ai.push([MODE_CODE[n.mode], MOVE_CONST[n.moveType], onePoint ? LOOP_CODE.once : LOOP_CODE[n.loop], lg.length ? first : -1, lg.length, DMG_CODE[n.onDamage],
      n.respawn * 1000, recS, (n.recFromNpc ? 1 : 0) | (n.recLoop ? 2 : 0) | (n.recPreload ? 4 : 0), looks ? 1 : 0, n.chase ? 1 : 0, loopStart, MOVE_CONST[n.chaseMove], MOVE_CONST[n.returnMove], MOVE_CONST[n.fleeMove], bubbleIdx(n),
      n.startWhen === 'seen' ? 1 : 0, n.aimMove === 'walk' ? 1 : 0, { stay: 0, melee: 1, flee: 2 }[n.noAmmo], { normal: 0, special: 1, mix: 2 }[n.meleeKind], n.meleeTime,
      g0, gc, n.chaseUpdate, n.shootDelay]);
    aiF.push([n.speed > 0 ? F(n.speed / 10) : '-1.0', F(n.mode === 'follow' ? n.followDist : n.range), F(n.giveUp), F(n.fleeDist), F(n.shootDist), F(n.followRange), F(n.dmgMult), F(n.wanderLimit === 'radius' ? n.wanderRadius : 0), F(n.bubbleDist),
      F(n.smooth), F(AIM_Z[n.aimAt]), F(n.meleeReach), F(n.lane), F(n.fleeAlert), F(n.fleeWait)]);
    look.push([(n.color & 0xFFFFFF00) | (n.marker ? 0xFF : 0) >>> 0, n.bubbleColor >>> 0]);
    if (n.mode === 'wander' && n.wanderLimit === 'radius' && n.wanderRadius > 0 && !st) anyRadius = true;
    if (n.bubble) anyBubble = true;
  });
  const anyCorner = anyGraph || npcs.some(a => a.npc.mode === 'path' && a.npc.smooth > 0);
  const nV = Math.max(1, vehIdx.size), nO = Math.max(1, objIdx.size);
  const rows = (list, width, fill) => (list.length ? list : [Array(width).fill(fill)]);
  // A table of rows, a few per line (a Pawn line has a length limit)
  const table = (head, list, per) => {
    const cells = list.map(r => `{${r.join(', ')}}`);
    if (cells.length <= per) return [`${head} = {${cells.join(', ')}};`];
    const out = [`${head} =`, '{'];
    for (let i = 0; i < cells.length; i += per) out.push(`    ${cells.slice(i, i + per).join(', ')}${i + per < cells.length ? ',' : ''}`);
    out.push('};');
    return out;
  };
  // A list of values: on one line while it is short, else a few values per line (with many NPCs one line would be too long to compile)
  const flat = (head, values, tail = '') => {
    const one = `${head} = {${values.join(', ')}};${tail}`;
    if (one.length <= 200) return [one];
    const out = [`${head} =${tail}`, '{'];
    let cur = '';
    values.forEach((v, i) => {
      const cell = v + (i < values.length - 1 ? ',' : '');
      if (cur && cur.length + 1 + cell.length > 160) { out.push('    ' + cur); cur = ''; }
      cur += (cur ? ' ' : '') + cell;
    });
    if (cur) out.push('    ' + cur);
    out.push('};');
    return out;
  };
  const L = [];
  L.push('// ================================================================');
  L.push(`// ${tr('NPCs do open.mp ({0}): controlados pelo servidor.', N)}`);
  L.push(`// ${tr('Exige o open.mp com o componente de NPCs e "max_bots" no config.json (pelo menos {0}).', N)}`);
  L.push(`// ${tr('Fica acima dos callbacks do script: os callbacks OnNPC* que ele usa são ligados sozinhos.')}`);
  if (anyPlayback) L.push(`// ${tr('Gravações (.rec): ficam na pasta npcmodes/recordings do servidor.')}`);
  if (anyWander) L.push(`// ${tr('Ruas: o servidor baixa sozinho os arquivos scriptfiles/NPCs/nodes na primeira vez.')}`);
  L.push('// ================================================================');
  L.push('#if !defined _INC_omp_npc');
  L.push('    #error "NPCs need the open.mp includes (omp_npc.inc)."');
  L.push('#endif');
  L.push('');
  L.push(...flat(`stock const ${P}_Name[${N}][MAX_PLAYER_NAME + 1]`, names.map(qs)));
  L.push('// Mode (0 idle, 1 path, 2 streets, 3 guard, 4 follow, 5 recording), move type, loop (0 once, 1 loop, 2 there and back), first leg, legs,');
  L.push('// on damage (0 nothing, 1 fight back, 2 flee), respawn (ms, 0 = no), recording (text), recording flags (1 from the NPC, 2 repeat, 4 preload),');
  L.push('// look at players, chase, first leg of the loop, move type when it chases, when it goes back to its place and when it flees,');
  L.push('// chat bubble (text, -1 = none), starts when a player sees it (1) or at once (0), with a gun: shoots walking (1) or stops (0),');
  L.push('// out of bullets (0 stays, 1 fists, 2 flees), strikes (0 normal, 1 special of the fighting style, 2 both), time between strikes');
  L.push('// (ms, -1 = of the weapon), streets: first point and points (-1, 0 = native),');
  L.push('// chase update (ms), time between shots (ms, -1 = of the weapon)');
  L.push(`stock const ${P}_Ai[${N}][25] = {`);
  ai.forEach((r, k) => L.push(`    {${r.join(', ')}}${k < N - 1 ? ',' : ''} // ${names[k]}`));
  L.push('};');
  L.push('// Speed (-1.0 = of the move type), range (guard, look) or distance (follow), gives up the chase at (0.0 = automatic),');
  L.push('// flees how far, shoots from, looks for the player to follow up to, damage taken x, streets radius (0.0 = free), bubble distance,');
  L.push('// rounded corners (m), aim height (Z offset), reach of the strikes (m), lane of a driver on the streets (m, read back by the editor),');
  L.push('// after fleeing: on the alert for (s), waits before going back (s)');
  L.push(...table(`stock const Float:${P}_AiF[${N}][15]`, aiF, 1));
  L.push('// Seen by the players: colour (0xRRGGBBAA, alpha FF = marker on the radar), chat bubble colour');
  const hx = (v) => '0x' + (v >>> 0).toString(16).toUpperCase().padStart(8, '0');
  L.push(...table(`stock const ${P}_Look[${N}][2]`, look.map(r => [hx(r[0]), hx(r[1])]), 6));
  L.push('// Path points: X, Y, Z, stop range');
  L.push(`stock const Float:${P}_Pt[${Math.max(1, pts.length)}][4] = {`);
  rows(pts, 5, '0.0').forEach((r, i, all) => L.push(`    {${r.slice(0, 4).join(', ')}}${i < all.length - 1 ? ',' : ''}${r[4] && r[4] !== '0.0' ? ' ' + r[4] : ''}`));
  L.push('};');
  L.push('// Actions of each point: first action, actions');
  L.push(...table(`stock const ${P}_PtA[${Math.max(1, ptAct.length)}][2]`, rows(ptAct, 2, 0), 16));
  L.push('// Legs (one NPC path each): first point, last point, NPC');
  L.push(...table(`stock const ${P}_Leg[${Math.max(1, legs.length)}][3]`, rows(legs, 3, 0), 16));
  L.push('// Actions: type, values');
  L.push(`stock const Float:${P}_Act[${Math.max(1, acts.length)}][9] = {`);
  rows(acts, 9, 0).forEach((r, i, all) => L.push(`    {${r.map(v => F(v)).join(', ')}}${i < all.length - 1 ? ',' : ''}${acts.length ? ` // ${ACTION.get(NPC_ACTIONS[r[0] - 1][0]).label}` : ''}`));
  L.push('};');
  L.push(...flat(`stock const ${P}_Str[${Math.max(1, strs.length)}][128]`, (strs.length ? strs : ['']).map(qs)));
  if (anyGraph) {
    L.push('// Streets of the radius or area of each NPC: points (X, Y, Z), their ways (first, count) and the ways (to point, lane offset X, Y)');
    L.push(...table(`stock const Float:${P}_Gn[${gn.length}][3]`, gn, 6));
    L.push(...table(`stock const ${P}_GnE[${gnE.length}][2]`, gnE, 12));
    L.push(...table(`stock const Float:${P}_Ge[${Math.max(1, ge.length)}][3]`, rows(ge, 3, '0.0'), 6));
  }
  L.push('');
  L.push(...flat(`stock ${P}_Id[${N}]`, Array(N).fill('INVALID_NPC_ID')));
  L.push(...flat(`stock ${P}_Veh[${nV}]`, Array(nV).fill('INVALID_VEHICLE_ID'), ' // vehicles of the map the NPCs use'));
  if (anyCar) L.push(...flat(`stock ${P}_Car[${N}][2]`, Array(N).fill('{INVALID_VEHICLE_ID, 0}'), ' // its vehicle and seat: it gets out to fight and back in after'));
  L.push(...flat(`stock ${P}_Obj[${nO}]`, Array(nO).fill('INVALID_OBJECT_ID'), ' // objects the NPCs surf on'));
  L.push(...flat(`stock ${P}_Path[${Math.max(1, legs.length)}]`, Array(Math.max(1, legs.length)).fill('INVALID_PATH_ID')));
  L.push(...flat(`stock ${P}_Rec[${N}]`, Array(N).fill('INVALID_RECORD_ID')));
  if (anyGraph) L.push(...flat(`stock ${P}_WPath[${N}]`, Array(N).fill('INVALID_PATH_ID'), ' // path of the next streets of each NPC'));
  L.push(`stock Float:${P}_HomeP[${N}][3]; // where each NPC was placed (its vehicle, for a driver)`);
  L.push(`// leg, direction, action, target, timer, busy (1 fighting, 2 fleeing, 3 going back, 4 going to the street, 5 waiting to be seen, 6 back to its vehicle,`);
  L.push(`// 7 on the alert after fleeing, 8 waiting before going back),`);
  L.push(`// street point (or area of the map), previous street point (or point of the area), chase step (0 none, 1 walking and aiming, 2 running, 3 hand to hand, 4 getting out of its vehicle), strike kind, strike count,`);
  L.push(`// stunned by blows (steps of 200 ms without shooting)`);
  L.push(`stock ${P}_St[${N}][12];`);
  L.push(`stock bool:${P}_Node[NPC_MAX_NODES], ${P}_Timer, ${P}_BubbleTimer;`);
  if (anyFlee) L.push(...flat(`stock ${P}_FPath[${N}]`, Array(N).fill('INVALID_PATH_ID'), ' // path of each NPC when it flees by the streets'));
  if (anyThink) L.push(`stock ${P}_Pl[MAX_PLAYERS], ${P}_PlN; // the players (not the NPCs) at each step of the Think`);
  const decl = L.splice(0).join('\n');

  // ------------------------------------------------ routine
  const C = [];
  C.push(`stock ${P}_Load()`, '{');
  if (legs.length) {
    C.push(`    for (new l = 0; l < ${legs.length}; l++)`, '    {');
    C.push(`        new s = ${P}_Leg[l][0], e = ${P}_Leg[l][1];`);
    C.push(`        ${P}_Path[l] = NPC_CreatePath();`);
    C.push('        for (new p = s; p <= e; p++)', '        {');
    if (anyCorner) {
      C.push(`            new k = ${P}_Leg[l][2];`);
      C.push(`            if (${P}_AiF[k][9] > 0.0 && p > s && p < e) ${P}_Corner(${P}_Path[l], ${P}_Pt[p - 1][0], ${P}_Pt[p - 1][1], ${P}_Pt[p][0], ${P}_Pt[p][1], ${P}_Pt[p][2], ${P}_Pt[p + 1][0], ${P}_Pt[p + 1][1], ${P}_AiF[k][9], ${P}_Pt[p][3]);`);
      C.push(`            else NPC_AddPointToPath(${P}_Path[l], ${P}_Pt[p][0], ${P}_Pt[p][1], ${P}_Pt[p][2], ${P}_Pt[p][3]);`);
    } else C.push(`            NPC_AddPointToPath(${P}_Path[l], ${P}_Pt[p][0], ${P}_Pt[p][1], ${P}_Pt[p][2], ${P}_Pt[p][3]);`);
    C.push('        }', '    }');
  }
  if (anyWander) C.push(`    for (new a = 0; a < NPC_MAX_NODES; a++) ${P}_Hold(a);`);
  if (anyPreload) {
    C.push(`    new path[64];`);
    C.push(`    for (new k = 0; k < ${N}; k++)`, '    {');
    C.push(`        if (${P}_Ai[k][7] < 0 || !(${P}_Ai[k][8] & 4)) continue;`);
    C.push(`        format(path, sizeof(path), "npcmodes/recordings/%s.rec", ${P}_Str[${P}_Ai[k][7]]);`);
    C.push(`        ${P}_Rec[k] = NPC_LoadRecord(path);`);
    C.push('    }');
  }
  C.push(`    for (new k = 0; k < ${N}; k++)`, '    {');
  C.push(`        ${P}_St[k][3] = INVALID_PLAYER_ID;`);
  if (anyGraph) C.push(`        if (${P}_Ai[k][22] > 0) ${P}_WPath[k] = NPC_CreatePath();`);
  C.push(`        ${P}_Id[k] = ${P}_Create(k);`);
  C.push(`        if (${P}_Id[k] != INVALID_NPC_ID) NPC_Spawn(${P}_Id[k]);`);
  C.push('    }');
  if (anyThink) C.push(`    ${P}_Timer = SetTimer("${P}_Think", 200, true);`);
  if (anyBubble) C.push(`    ${P}_BubbleTimer = SetTimer("${P}_Bubbles", 5000, true);`, `    ${P}_Bubbles();`);
  C.push('    return 1;', '}', '');

  C.push('// Is the name used by a player or a NPC (of any script)?');
  C.push(`stock bool:${P}_Taken(const name[])`, '{');
  C.push('    new players[MAX_PLAYERS], count = GetPlayers(players), other[MAX_PLAYER_NAME + 1];');
  C.push('    for (new i = 0; i < count; i++)', '    {');
  C.push('        GetPlayerName(players[i], other);');
  C.push('        if (!strcmp(other, name, true)) return true;');
  C.push('    }');
  C.push('    return false;', '}', '');
  C.push('// Creates a NPC (NPC_Create gives an invalid id, not always INVALID_NPC_ID, when it fails). When its name is taken (a NPC of');
  C.push('// another script, or a player) it gets a number at the end');
  C.push(`stock ${P}_Create(k)`, '{');
  C.push(`    new npcid = NPC_Create(${P}_Name[k]);`);
  C.push('    if (NPC_IsValid(npcid)) return npcid;');
  C.push(`    if (${P}_Taken(${P}_Name[k]))`, '    {');
  C.push('        new base[22], name[MAX_PLAYER_NAME + 1];');
  C.push(`        strcat(base, ${P}_Name[k]);`);
  C.push('        for (new i = 2; i <= 99; i++)', '        {');
  C.push('            format(name, sizeof(name), "%s_%d", base, i);');
  C.push(`            if (${P}_Taken(name)) continue;`);
  C.push('            npcid = NPC_Create(name);');
  C.push('            if (NPC_IsValid(npcid)) return npcid;');
  C.push('            break;');
  C.push('        }');
  C.push('    }');
  C.push(`    printf("NPC %s was not created: the server is full (max_bots of config.json) or the name is taken.", ${P}_Name[k]);`);
  C.push('    return INVALID_NPC_ID;', '}', '');
  if (anyWander || anyFlee) {
    C.push('// Streets of an area of the map: an area serves the NPCs of every script; the server counts the scripts that use it and the last');
    C.push('// one to leave closes it (only when one of them opened it)');
    C.push(`stock ${P}_Hold(a)`, '{');
    C.push(`    if (a < 0 || a >= NPC_MAX_NODES || ${P}_Node[a]) return 1;`);
    C.push('    new key[16];');
    C.push('    if (!NPC_IsNodeOpen(a))', '    {');
    C.push('        if (!NPC_OpenNode(a)) return 0;');
    C.push('        format(key, sizeof(key), "samsp_ndo%d", a);');
    C.push('        SetSVarInt(key, 1);');
    C.push('    }');
    C.push(`    ${P}_Node[a] = true;`);
    C.push('    format(key, sizeof(key), "samsp_nd%d", a);');
    C.push('    SetSVarInt(key, GetSVarInt(key) + 1);');
    C.push('    return 1;', '}', '');
  }

  C.push(`stock ${P}_Unload()`, '{');
  if (anyThink) C.push(`    KillTimer(${P}_Timer);`);
  if (anyBubble) C.push(`    KillTimer(${P}_BubbleTimer);`);
  C.push(`    for (new k = 0; k < ${N}; k++)`, '    {');
  C.push(`        if (${P}_St[k][4]) KillTimer(${P}_St[k][4]);`);
  C.push(`        ${P}_St[k][4] = 0;`);
  C.push(`        if (NPC_IsValid(${P}_Id[k]))`, '        {');
  C.push(`            if (NPC_IsPlayingNode(${P}_Id[k])) NPC_StopPlayingNode(${P}_Id[k]);`);
  C.push(`            if (NPC_IsPlayingPlayback(${P}_Id[k])) NPC_StopPlayback(${P}_Id[k]);`);
  C.push(`            NPC_Destroy(${P}_Id[k]);`);
  C.push('        }');
  C.push(`        ${P}_Id[k] = INVALID_NPC_ID;`);
  C.push(`        if (NPC_IsValidRecord(${P}_Rec[k])) NPC_UnloadRecord(${P}_Rec[k]);`);
  C.push(`        ${P}_Rec[k] = INVALID_RECORD_ID;`);
  if (anyGraph) C.push(`        if (${P}_WPath[k] != INVALID_PATH_ID && NPC_IsValidPath(${P}_WPath[k])) NPC_DestroyPath(${P}_WPath[k]);`, `        ${P}_WPath[k] = INVALID_PATH_ID;`);
  if (anyFlee) C.push(`        if (${P}_FPath[k] != INVALID_PATH_ID && NPC_IsValidPath(${P}_FPath[k])) NPC_DestroyPath(${P}_FPath[k]);`, `        ${P}_FPath[k] = INVALID_PATH_ID;`);
  C.push('    }');
  C.push(`    for (new l = 0; l < sizeof(${P}_Path); l++)`, '    {');
  C.push(`        if (${P}_Path[l] != INVALID_PATH_ID && NPC_IsValidPath(${P}_Path[l])) NPC_DestroyPath(${P}_Path[l]);`);
  C.push(`        ${P}_Path[l] = INVALID_PATH_ID;`);
  C.push('    }');
  if (anyWander || anyFlee) {
    C.push('    // The areas of streets: closed by the last script that uses them');
    C.push('    new key[16];');
    C.push('    for (new a = 0; a < NPC_MAX_NODES; a++)', '    {');
    C.push(`        if (!${P}_Node[a]) continue;`);
    C.push(`        ${P}_Node[a] = false;`);
    C.push('        format(key, sizeof(key), "samsp_nd%d", a);');
    C.push('        new users = GetSVarInt(key) - 1;');
    C.push('        if (users > 0) { SetSVarInt(key, users); continue; }');
    C.push('        DeleteSVar(key);');
    C.push('        format(key, sizeof(key), "samsp_ndo%d", a);');
    C.push('        if (GetSVarInt(key)) { DeleteSVar(key); if (NPC_IsNodeOpen(a)) NPC_CloseNode(a); }');
    C.push('    }');
  }
  C.push('    return 1;', '}', '');

  C.push(`stock ${P}_Index(npcid)`, '{');
  C.push(`    if (npcid == INVALID_NPC_ID) return -1;`);
  C.push(`    for (new k = 0; k < ${N}; k++) if (${P}_Id[k] == npcid) return k;`);
  C.push('    return -1;', '}', '');

  // Settings of each NPC (applied when it spawns), written out so they are easy to change
  const setup = [], pose = [];
  npcs.forEach((a, k) => {
    const n = a.npc, s = [], ps = [];
    const vk = n.vehicle ? vref(n.vehicle.uid) : -1;
    s.push(`NPC_SetSkin(npcid, ${a.skin | 0});`);
    // Always set: the alpha of the colour says if the radar shows the NPC (00 = hidden), else open.mp gives it a random visible colour
    s.push(`SetPlayerColor(npcid, 0x${(((n.color & 0xFFFFFF00) | (n.marker ? 0xFF : 0)) >>> 0).toString(16).toUpperCase().padStart(8, '0')});`);
    if (vk < 0) s.push(`NPC_SetPos(npcid, ${X(a.x)}, ${Y(a.y)}, ${Z(a.z)});`);
    if (n.interior) s.push(`NPC_SetInterior(npcid, ${n.interior});`);
    if ((a.world ?? -1) > 0) s.push(`NPC_SetVirtualWorld(npcid, ${a.world});`);
    s.push(`NPC_SetHealth(npcid, ${F(a.health ?? 100)});`);
    if (n.armour) s.push(`NPC_SetArmour(npcid, ${F(n.armour)});`);
    s.push(`NPC_SetInvulnerable(npcid, ${a.invulnerable ? 'true' : 'false'});`);
    if (n.fightStyle !== 4) s.push(`NPC_SetFightingStyle(npcid, FIGHT_STYLE:${n.fightStyle});`);
    if (n.weapon) {
      s.push(`NPC_SetWeapon(npcid, WEAPON:${n.weapon});`);
      if (!isMeleeWeapon(n.weapon)) {
        s.push(`NPC_SetAmmo(npcid, ${n.ammo});`);
        if (n.clip >= 0) s.push(`NPC_SetAmmoInClip(npcid, ${n.clip});`);
        s.push(`NPC_EnableInfiniteAmmo(npcid, ${n.infiniteAmmo ? 'true' : 'false'});`);
        s.push(`NPC_EnableReloading(npcid, ${n.reload ? 'true' : 'false'});`);
        if (n.accuracy >= 0) s.push(`NPC_SetWeaponAccuracy(npcid, WEAPON:${n.weapon}, ${F(n.accuracy)});`);
        if (n.reloadTime >= 0) s.push(`NPC_SetWeaponReloadTime(npcid, WEAPON:${n.weapon}, ${n.reloadTime});`);
        if (n.shootTime >= 0) s.push(`NPC_SetWeaponShootTime(npcid, WEAPON:${n.weapon}, ${n.shootTime});`);
        if (n.clipSize >= 0) s.push(`NPC_SetWeaponClipSize(npcid, WEAPON:${n.weapon}, ${n.clipSize});`);
      }
    }
    n.skills.forEach((lv, i) => { if (lv >= 0) s.push(`NPC_SetWeaponSkillLevel(npcid, WEAPONSKILL:${i}, ${lv});`); });
    if (vk >= 0) {
      s.push(`NPC_PutInVehicle(npcid, ${P}_Veh[${vk}], ${n.vehicle.seat});`);
      if (anyCar) s.push(`${P}_Car[k][0] = ${P}_Veh[${vk}]; ${P}_Car[k][1] = ${n.vehicle.seat};`);
      if (n.vehicle.seat === 0 && n.vehicle.siren) s.push('NPC_UseVehicleSiren(npcid, true);');
      if (n.vehicle.seat === 0 && n.vehicle.health !== 1000) s.push(`NPC_SetVehicleHealth(npcid, ${F(n.vehicle.health)});`);
    }
    if (n.surf) {
      const sk = n.surf.type === 'object' ? objIdx.get(n.surf.uid) : vref(n.surf.uid);
      if (sk !== undefined && sk >= 0) {
        s.push(n.surf.type === 'object' ? `NPC_SetSurfingObject(npcid, ${P}_Obj[${sk}]);` : `NPC_SetSurfingVehicle(npcid, ${P}_Veh[${sk}]);`);
        s.push(`NPC_SetSurfingOffsets(npcid, ${F(n.surf.ox)}, ${F(n.surf.oy)}, ${F(n.surf.oz)});`);
      }
    }
    if (vk < 0) ps.push(`NPC_SetFacingAngle(npcid, ${F(((a.rz % 360) + 360) % 360)});`);
    if (n.special) ps.push(`NPC_SetSpecialAction(npcid, SPECIAL_ACTION:${n.special});`);
    // The animation is for a NPC that stands (one that walks, drives or plays a recording would carry it along while it moves)
    if (a.anim && a.anim.lib && a.anim.name && vk < 0 && ['idle', 'guard'].includes(n.mode) && !n.surf) {
      const an = a.anim, b = (v) => (v ? 'true' : 'false');
      ps.push(`NPC_ApplyAnimation(npcid, ${qs(an.lib)}, ${qs(an.name)}, ${F(an.delta ?? 4.1)}, ${b(an.loop ?? 1)}, ${b(an.lockx)}, ${b(an.locky)}, ${b(an.freeze)}, ${an.time | 0});`);
    }
    setup.push({ k, name: names[k], lines: [...s, ...ps] });
    pose.push({ k, name: names[k], lines: ps });
  });
  const switchFn = (name, list) => {
    C.push(`stock ${P}_${name}(k)`, '{');
    if (!list.some(e => e.lines.length)) { C.push('    #pragma unused k'); return; }
    C.push(`    new npcid = ${P}_Id[k];`);
    C.push('    switch (k)', '    {');
    for (const e of list) {
      if (!e.lines.length) continue;
      C.push(`        case ${e.k}: // ${e.name}`, '        {');
      for (const l of e.lines) C.push('            ' + l);
      C.push('        }');
    }
    C.push('    }');
  };
  switchFn('Setup', setup);
  C.push('    // Its place (in its vehicle, the place of the vehicle): it goes back there');
  C.push(`    NPC_GetPos(npcid, ${P}_HomeP[k][0], ${P}_HomeP[k][1], ${P}_HomeP[k][2]);`);
  C.push('    // It starts when a player sees it (so it is seen leaving its place), or at once');
  C.push(`    if (${P}_Ai[k][16] && !NPC_IsAnyStreamedIn(npcid)) { ${P}_St[k][5] = 5; return 1; }`);
  C.push(`    ${P}_Start(k);`, '    return 1;', '}', '');
  switchFn('Pose', pose);
  C.push('    return 1;', '}', '');
  C.push('// Back at its place: its pose a moment after it stops (given at once, the game mixes it with the legs still walking)');
  C.push(`forward ${P}_PoseLater(k);`);
  C.push(`public ${P}_PoseLater(k)`, '{');
  C.push(`    if (NPC_IsValid(${P}_Id[k]) && ${P}_St[k][5] == 0 && !NPC_IsMoving(${P}_Id[k])) ${P}_Pose(k);`);
  C.push('    return 1;', '}', '');

  C.push(`stock ${P}_Start(k)`, '{');
  C.push(`    if (${P}_St[k][4]) KillTimer(${P}_St[k][4]);`);
  C.push(`    new npcid = ${P}_Id[k];`);
  C.push('    // Stops what it was doing (it may be starting again after respawning or going back to its place)');
  C.push('    if (NPC_IsPlayingNode(npcid)) NPC_StopPlayingNode(npcid);');
  C.push('    if (NPC_IsPlayingPlayback(npcid)) NPC_StopPlayback(npcid);');
  C.push('    if (NPC_IsMoving(npcid)) NPC_StopMove(npcid);');
  C.push('    if (NPC_IsMeleeAttacking(npcid)) NPC_StopMeleeAttack(npcid);');
  C.push('    if (NPC_IsAiming(npcid)) NPC_StopAim(npcid);');
  C.push(`    if (${P}_Ai[k][0] != 0 && ${P}_Ai[k][0] != 3) NPC_ClearAnimations(npcid); // it is going to move`);
  C.push(`    ${P}_St[k][0] = 0; ${P}_St[k][1] = 1; ${P}_St[k][2] = 0; ${P}_St[k][3] = INVALID_PLAYER_ID; ${P}_St[k][4] = 0; ${P}_St[k][5] = 0;`);
  C.push(`    ${P}_St[k][6] = -1; ${P}_St[k][7] = -1; ${P}_St[k][8] = 0; ${P}_St[k][9] = 0; ${P}_St[k][10] = 0; ${P}_St[k][11] = 0;`);
  if (anyPath || anyWander || anyPlayback || anyGraph) C.push(`    switch (${P}_Ai[k][0])`, '    {');
  if (anyPath) C.push(`        case 1: ${P}_RunLeg(k);`);
  if (anyWander && anyGraph) C.push(`        case 2: { if (${P}_Ai[k][22] > 0) ${P}_GWalk(k); else ${P}_Wander(k); }`);
  else if (anyWander) C.push(`        case 2: ${P}_Wander(k);`);
  else if (anyGraph) C.push(`        case 2: ${P}_GWalk(k);`);
  if (anyPlayback) C.push(`        case 5: ${P}_Play(k, ${P}_Ai[k][7], bool:(${P}_Ai[k][8] & 1));`);
  if (anyPath || anyWander || anyPlayback || anyGraph) C.push('    }');
  C.push('    return 1;', '}', '');

  // Move type: a driver always drives (with any other type open.mp takes the NPC out of the vehicle); on foot, never "drive"
  C.push(`stock NPC_MOVE_TYPE:${P}_Mt(npcid, NPC_MOVE_TYPE:want)`, '{');
  C.push('    if (NPC_GetVehicle(npcid) != INVALID_VEHICLE_ID && NPC_GetVehicleSeat(npcid) == 0) return NPC_MOVE_TYPE_DRIVE;');
  C.push('    return want == NPC_MOVE_TYPE_DRIVE ? NPC_MOVE_TYPE_AUTO : want;', '}', '');
  C.push(`stock Float:${P}_Home(k, axis)`, '{');
  C.push(`    return ${P}_HomeP[k][axis];`, '}', '');
  if (anyCorner) {
    C.push('// A corner of the way, rounded: a curve from r metres before the point to r metres after it (a straight way keeps the point)');
    C.push(`stock ${P}_Corner(path, Float:ax, Float:ay, Float:px, Float:py, Float:pz, Float:bx, Float:by, Float:r, Float:stop)`, '{');
    C.push('    new Float:ux = px - ax, Float:uy = py - ay, Float:vx = bx - px, Float:vy = by - py;');
    C.push('    new Float:lu = VectorSize(ux, uy, 0.0), Float:lv = VectorSize(vx, vy, 0.0);');
    C.push('    if (lu < 0.1 || lv < 0.1) return NPC_AddPointToPath(path, px, py, pz, stop);');
    C.push('    ux /= lu; uy /= lu; vx /= lv; vy /= lv;');
    C.push('    if (ux * vx + uy * vy > 0.97) return NPC_AddPointToPath(path, px, py, pz, stop);');
    C.push('    if (r > lu / 2.0) r = lu / 2.0;');
    C.push('    if (r > lv / 2.0) r = lv / 2.0;');
    C.push('    new Float:sx = px - ux * r, Float:sy = py - uy * r, Float:ex = px + vx * r, Float:ey = py + vy * r;');
    C.push('    for (new i = 0; i <= 4; i++)', '    {');
    C.push('        new Float:t = float(i) / 4.0, Float:m = 1.0 - t;');
    C.push('        NPC_AddPointToPath(path, m * m * sx + 2.0 * m * t * px + t * t * ex, m * m * sy + 2.0 * m * t * py + t * t * ey, pz, stop);');
    C.push('    }');
    C.push('    return 1;', '}', '');
  }
  if (anyPath) {
    C.push(`stock ${P}_RunLeg(k)`, '{');
    C.push(`    if (${P}_Ai[k][4] <= 0) return 0;`);
    C.push(`    NPC_MoveByPath(${P}_Id[k], ${P}_Path[${P}_Ai[k][3] + ${P}_St[k][0]], ${P}_Mt(${P}_Id[k], NPC_MOVE_TYPE:${P}_Ai[k][1]), ${P}_AiF[k][0], ${P}_St[k][1] < 0);`);
    C.push('    return 1;', '}', '');
    C.push('// After the actions of a point: the next leg, by the kind of loop');
    C.push(`stock ${P}_Next(k)`, '{');
    C.push(`    new last = ${P}_Ai[k][4] - 1, first = ${P}_Ai[k][11];`);
    C.push(`    if (${P}_St[k][1] > 0)`, '    {');
    C.push(`        if (${P}_St[k][0] < last) ${P}_St[k][0]++;`);
    C.push(`        else if (${P}_Ai[k][2] == 1) ${P}_St[k][0] = first;`);
    C.push(`        else if (${P}_Ai[k][2] == 2) ${P}_St[k][1] = -1;`);
    C.push('        else return 0;');
    C.push('    }');
    C.push('    else', '    {');
    C.push(`        if (${P}_St[k][0] > first) ${P}_St[k][0]--;`);
    C.push(`        else ${P}_St[k][1] = 1;`);
    C.push('    }');
    C.push(`    return ${P}_RunLeg(k);`, '}', '');
  }
  if (anyGraph) {
    C.push('// Streets of its radius or area: from where it is to the nearest street point (no teleport), then 8 street points at random');
    C.push('// (never back the way it came, unless it is a dead end), on its lane, as one NPC path; at the end of it, the next ones');
    C.push(`stock ${P}_GWalk(k)`, '{');
    C.push(`    new npcid = ${P}_Id[k], path = ${P}_WPath[k], g0 = ${P}_Ai[k][21], gc = ${P}_Ai[k][22];`);
    C.push('    if (gc <= 0 || path == INVALID_PATH_ID) return 0;');
    C.push('    new Float:x, Float:y, Float:z, cur = ' + `${P}_St[k][6], prev = ${P}_St[k][7], c = 0;`);
    C.push('    new Float:qx[9], Float:qy[9], Float:qz[9];');
    C.push('    NPC_GetPos(npcid, x, y, z);');
    C.push('    if (cur < 0)', '    {');
    C.push('        new Float:bd = 1.0e12;');
    C.push('        for (new i = g0; i < g0 + gc; i++)', '        {');
    C.push(`            new Float:d = (${P}_Gn[i][0] - x) * (${P}_Gn[i][0] - x) + (${P}_Gn[i][1] - y) * (${P}_Gn[i][1] - y) + (${P}_Gn[i][2] - z) * (${P}_Gn[i][2] - z) * 4.0;`);
    C.push('            if (d < bd) { bd = d; cur = i; }');
    C.push('        }');
    C.push('        prev = -1;');
    C.push(`        qx[0] = ${P}_Gn[cur][0]; qy[0] = ${P}_Gn[cur][1]; qz[0] = ${P}_Gn[cur][2];`);
    C.push('        c = 1;');
    C.push('    }');
    C.push('    while (c < 9)', '    {');
    C.push(`        new f = ${P}_GnE[cur][0], cnt = ${P}_GnE[cur][1], pick = -1, seen = 0;`);
    C.push('        for (new e = f; e < f + cnt; e++)', '        {');
    C.push(`            if (cnt > 1 && floatround(${P}_Ge[e][0]) == prev) continue;`);
    C.push('            seen++;');
    C.push('            if (random(seen) == 0) pick = e;');
    C.push('        }');
    C.push('        if (pick < 0) break;');
    C.push(`        new to = floatround(${P}_Ge[pick][0]);`);
    C.push(`        qx[c] = ${P}_Gn[to][0] + ${P}_Ge[pick][1]; qy[c] = ${P}_Gn[to][1] + ${P}_Ge[pick][2]; qz[c] = ${P}_Gn[to][2];`);
    C.push('        c++;');
    C.push('        prev = cur; cur = to;');
    C.push('    }');
    C.push(`    ${P}_St[k][6] = cur; ${P}_St[k][7] = prev;`);
    C.push('    if (c == 0) return 0;');
    C.push('    NPC_ClearPath(path);');
    C.push('    new Float:stop = NPC_GetVehicle(npcid) != INVALID_VEHICLE_ID ? 2.0 : 0.5, Float:ax = x, Float:ay = y;');
    C.push('    for (new i = 0; i < c; i++)', '    {');
    C.push(`        if (${P}_AiF[k][9] > 0.0 && i < c - 1) ${P}_Corner(path, ax, ay, qx[i], qy[i], qz[i], qx[i + 1], qy[i + 1], ${P}_AiF[k][9], stop);`);
    C.push('        else NPC_AddPointToPath(path, qx[i], qy[i], qz[i], stop);');
    C.push('        ax = qx[i]; ay = qy[i];');
    C.push('    }');
    C.push(`    NPC_MoveByPath(npcid, path, ${P}_Mt(npcid, NPC_MOVE_TYPE:${P}_Ai[k][1]), ${P}_AiF[k][0], false);`);
    C.push('    return 1;', '}', '');
  }

  // Actions
  if (acts.length) {
    C.push(`forward ${P}_Step(k, a, end);`);
    C.push(`public ${P}_Step(k, a, end)`, '{');
    C.push(`    ${P}_St[k][4] = 0;`);
    C.push(`    if (${P}_St[k][5] != 0 || !NPC_IsValid(${P}_Id[k])) return 0;`);
    C.push('    while (a < end)', '    {');
    C.push(`        new wait = ${P}_Do(k, a++);`);
    C.push('        if (wait < 0) return 1;');
    C.push(`        if (wait > 0) { ${P}_St[k][4] = SetTimerEx("${P}_Step", wait, false, "iii", k, a, end); return 1; }`);
    C.push('    }');
    C.push(anyPath ? `    ${P}_Next(k);` : '');
    C.push('    return 1;', '}', '');
    C.push('// Runs one action; returns how long to wait before the next one (ms), or -1 when the path stops here');
    C.push(`stock ${P}_Do(k, a)`, '{');
    C.push(`    new npcid = ${P}_Id[k];`);
    C.push(`    #pragma unused npcid`);
    C.push(`    #define V(%0) ${P}_Act[a][%0]`);
    C.push(`    #define I(%0) floatround(${P}_Act[a][%0])`);
    C.push(`    #define B(%0) (${P}_Act[a][%0] != 0.0)`);
    C.push(`    #define S(%0) ${P}_Str[I(%0)]`);
    C.push(`    #define VEH(%0) (I(%0) >= 0 ? ${P}_Veh[I(%0)] : INVALID_VEHICLE_ID)`);
    C.push('    switch (I(0))', '    {');
    const caseOf = {
      wait: 'return I(1);',
      anim: 'NPC_ApplyAnimation(npcid, S(1), S(2), V(3), B(4), B(5), B(6), B(7), I(8));',
      animId: 'NPC_SetAnimation(npcid, I(1), V(2), B(3), B(4), B(5), B(6), I(7));',
      clearAnim: 'if (B(1)) NPC_ResetAnimation(npcid); else NPC_ClearAnimations(npcid);',
      special: 'NPC_SetSpecialAction(npcid, SPECIAL_ACTION:I(1));',
      face: 'NPC_SetFacingAngle(npcid, V(1));',
      lookAt: 'NPC_SetAngleToPos(npcid, V(1), V(2), V(3));',
      rotate: 'if (NPC_GetVehicle(npcid) != INVALID_VEHICLE_ID) NPC_SetVehicleRot(npcid, V(1), V(2), V(3)); else NPC_SetRot(npcid, V(1), V(2), V(3));',
      aim: 'NPC_AimAt(npcid, V(1), V(2), V(3), B(4), I(5), true, 0.0, 0.0, 0.0, NPC_ENTITY_CHECK_ALL);',
      stopAim: 'NPC_StopAim(npcid);',
      shoot: 'NPC_Shoot(npcid, NPC_GetWeapon(npcid), INVALID_PLAYER_ID, _:BULLET_HIT_TYPE_NONE, V(1), V(2), V(3), 0.0, 0.0, 0.0, B(4), B(4) ? NPC_ENTITY_CHECK_ALL : NPC_ENTITY_CHECK_NONE);',
      melee: 'NPC_MeleeAttack(npcid, I(1), B(2));',
      stopMelee: 'NPC_StopMeleeAttack(npcid);',
      enterVeh: `NPC_EnterVehicle(npcid, VEH(1), I(2), NPC_MOVE_TYPE:I(3));`,
      exitVeh: 'NPC_ExitVehicle(npcid);',
      putInVeh: 'NPC_PutInVehicle(npcid, VEH(1), I(2));',
      removeVeh: 'NPC_RemoveFromVehicle(npcid);',
      siren: 'NPC_UseVehicleSiren(npcid, B(1));',
      gear: 'NPC_SetVehicleGearState(npcid, LANDING_GEAR_STATE:I(1));',
      thrust: 'NPC_SetVehicleHydraThrusters(npcid, I(1));',
      train: 'NPC_SetVehicleTrainSpeed(npcid, V(1));',
      vehHealth: 'NPC_SetVehicleHealth(npcid, V(1));',
      weapon: 'NPC_SetWeapon(npcid, WEAPON:I(1)); NPC_SetAmmo(npcid, I(2));',
      weaponState: 'NPC_SetWeaponState(npcid, WEAPONSTATE:I(1));',
      keys: 'NPC_SetKeys(npcid, I(1), I(2), I(3));',
      velocity: 'NPC_SetVelocity(npcid, V(1), V(2), V(3));',
      teleport: 'if (NPC_GetVehicle(npcid) != INVALID_VEHICLE_ID) NPC_SetVehiclePos(npcid, V(1), V(2), V(3)); else NPC_SetPos(npcid, V(1), V(2), V(3));',
      interior: 'NPC_SetInterior(npcid, I(1));',
      world: 'NPC_SetVirtualWorld(npcid, I(1));',
      health: 'NPC_SetHealth(npcid, V(1));',
      armour: 'NPC_SetArmour(npcid, V(1));',
      skin: 'NPC_SetSkin(npcid, I(1));',
      playback: `${P}_Play(k, I(1), B(2), true); return -1;`,
      wander: `${P}_Wander(k); return -1;`,
      surf: 'NPC_SetSurfingVehicle(npcid, VEH(1)); NPC_SetSurfingOffsets(npcid, V(2), V(3), V(4));',
      stopSurf: 'NPC_ResetSurfingData(npcid);',
      kill: 'NPC_Kill(npcid); return -1;',
      say: `SetPlayerChatBubble(npcid, S(1), ${P}_Look[k][1], V(2), I(3));`,
      stop: 'return -1;',
    };
    for (const [t] of NPC_ACTIONS) {
      if (!usedActs.has(t)) continue;
      C.push(`        case ${ACTION.get(t).code}: { ${caseOf[t]} } // ${ACTION.get(t).label}`);
    }
    C.push('    }');
    C.push('    #undef V', '    #undef I', '    #undef B', '    #undef S', '    #undef VEH');
    C.push('    return 0;', '}', '');
  }

  if (anyWander) {
    C.push('// Free streets: the nearest street point of the area of the map where the NPC is. It walks or drives there first (NPC_PlayNode');
    C.push('// puts the NPC on the street point at once), then wanders from one area of the map to the next');
    C.push(`stock ${P}_Wander(k)`, '{');
    C.push(`    new npcid = ${P}_Id[k], Float:x, Float:y, Float:z, Float:px, Float:py, Float:pz;`);
    C.push('    NPC_GetPos(npcid, x, y, z);');
    C.push('    // The area of the map: 8 x 8 squares of 750 m (each side kept inside the map, so a NPC past an edge takes the square at that edge)');
    C.push('    new col = floatround((x + 3000.0) / 750.0, floatround_floor), row = floatround((y + 3000.0) / 750.0, floatround_floor);');
    C.push('    if (col < 0) col = 0; else if (col > 7) col = 7;');
    C.push('    if (row < 0) row = 0; else if (row > 7) row = 7;');
    C.push('    new node = row * 8 + col;');
    C.push(`    ${P}_Hold(node);`);
    C.push('    new veh, ped, navi, from, to, best = -1, Float:bd = 1.0e12;');
    C.push('    NPC_GetNodeInfo(node, veh, ped, navi);');
    C.push('    #pragma unused navi');
    C.push('    if (NPC_GetVehicle(npcid) != INVALID_VEHICLE_ID) { from = 0; to = veh; } else { from = veh; to = veh + ped; }');
    C.push('    if (to > NPC_GetNodePointCount(node)) to = NPC_GetNodePointCount(node);');
    C.push('    for (new p = from; p < to; p++)', '    {');
    C.push('        NPC_SetNodePoint(node, p);');
    C.push('        NPC_GetNodePointPosition(node, px, py, pz);');
    C.push('        new Float:d = (px - x) * (px - x) + (py - y) * (py - y) + (pz - z) * (pz - z);');
    C.push('        if (d < bd) { bd = d; best = p; }');
    C.push('    }');
    C.push('    if (best < 0) return 0;');
    C.push(`    ${P}_St[k][6] = node; ${P}_St[k][7] = best;`);
    C.push('    NPC_SetNodePoint(node, best);');
    C.push('    NPC_GetNodePointPosition(node, px, py, pz);');
    C.push('    if (VectorSize(px - x, py - y, 0.0) > 3.0)', '    {');
    C.push(`        ${P}_St[k][5] = 4;`);
    C.push(`        NPC_Move(npcid, px, py, pz, ${P}_Mt(npcid, NPC_MOVE_TYPE:${P}_Ai[k][1]), ${P}_AiF[k][0], 1.0);`);
    C.push('        return 1;');
    C.push('    }');
    C.push(`    return ${P}_PlayNode(k);`, '}', '');
    C.push(`stock ${P}_PlayNode(k)`, '{');
    C.push(`    new npcid = ${P}_Id[k], node = ${P}_St[k][6], best = ${P}_St[k][7];`);
    C.push('    if (node < 0 || best < 0) return 0;');
    C.push('    NPC_SetNodePoint(node, best);');
    C.push(`    NPC_PlayNode(npcid, node, ${P}_Mt(npcid, NPC_MOVE_TYPE:${P}_Ai[k][1]), ${P}_AiF[k][0], 0.0, true);`);
    C.push('    NPC_UpdateNodePoint(npcid, best);');
    C.push('    return 1;', '}', '');
  }
  if (anyPlayback) {
    C.push('// fromNpc: the recording starts at the NPC, at its place (here = false) or where it is now (here = true, an action of its path)');
    C.push(`stock ${P}_Play(k, rec, bool:fromNpc, bool:here = false)`, '{');
    C.push(`    new npcid = ${P}_Id[k], Float:x = 0.0, Float:y = 0.0, Float:z = 0.0;`);
    C.push('    if (rec < 0) return 0;');
    C.push(`    if (fromNpc && here) NPC_GetPos(npcid, x, y, z);`);
    C.push(`    else if (fromNpc) { x = ${P}_Home(k, 0); y = ${P}_Home(k, 1); z = ${P}_Home(k, 2); }`);
    C.push(`    if (NPC_IsValidRecord(${P}_Rec[k]) && rec == ${P}_Ai[k][7]) return NPC_StartPlaybackEx(npcid, ${P}_Rec[k], false, x, y, z, 0.0, 0.0, 0.0);`);
    C.push(`    return NPC_StartPlayback(npcid, ${P}_Str[rec], false, x, y, z, 0.0, 0.0, 0.0);`);
    C.push('}', '');
  }

  // Fights: guard, fight back, flee, follow
  if (anyThink || anyMult) {
    C.push('// Damage taken (x its multiplier), the armour first; open.mp gives a NPC no damage when a vehicle hits it');
    C.push(`stock ${P}_Damage(k, issuerid, Float:amount, WEAPON:weaponid)`, '{');
    C.push(`    new npcid = ${P}_Id[k];`);
    C.push('    if (NPC_IsInvulnerable(npcid) || NPC_IsDead(npcid)) return 0;');
    C.push(`    new Float:dmg = amount * ${P}_AiF[k][6], Float:armour = NPC_GetArmour(npcid), Float:health = NPC_GetHealth(npcid);`);
    C.push('    if (armour > 0.0)', '    {');
    C.push('        if (dmg <= armour) { NPC_SetArmour(npcid, armour - dmg); dmg = 0.0; }');
    C.push('        else { NPC_SetArmour(npcid, 0.0); dmg -= armour; }');
    C.push('    }');
    C.push('    health -= dmg;');
    C.push('    if (health <= 0.0) { NPC_SetHealth(npcid, 0.0); NPC_Kill(npcid, issuerid, weaponid); return 1; }');
    C.push('    NPC_SetHealth(npcid, health);');
    C.push('    return 1;', '}', '');
  }
  if (anyThink) {
    C.push('// The nearest player it sees (only the players of this step of the Think, not every slot of the server)');
    C.push(`stock ${P}_Closest(npcid, Float:range)`, '{');
    C.push('    new Float:x, Float:y, Float:z, best = INVALID_PLAYER_ID, Float:bd = range * range;');
    C.push('    NPC_GetPos(npcid, x, y, z);');
    C.push(`    for (new i = 0; i < ${P}_PlN; i++)`, '    {');
    C.push(`        new p = ${P}_Pl[i];`);
    C.push('        if (!IsPlayerConnected(p) || !NPC_IsStreamedIn(npcid, p)) continue;');
    C.push('        if (GetPlayerState(p) == PLAYER_STATE_WASTED || GetPlayerState(p) == PLAYER_STATE_SPECTATING) continue;');
    C.push('        if (GetPlayerVirtualWorld(p) != NPC_GetVirtualWorld(npcid) || GetPlayerInterior(p) != NPC_GetInterior(npcid)) continue;');
    C.push('        new Float:px, Float:py, Float:pz;');
    C.push('        GetPlayerPos(p, px, py, pz);');
    C.push('        new Float:d = (px - x) * (px - x) + (py - y) * (py - y) + (pz - z) * (pz - z);');
    C.push('        if (d < bd) { bd = d; best = p; }');
    C.push('    }');
    C.push('    return best;', '}', '');
    C.push(`stock bool:${P}_Near(npcid, playerid, Float:range)`, '{');
    C.push('    if (!IsPlayerConnected(playerid) || GetPlayerState(playerid) == PLAYER_STATE_WASTED) return false;');
    C.push('    new Float:x, Float:y, Float:z;');
    C.push('    NPC_GetPos(npcid, x, y, z);');
    C.push('    return GetPlayerDistanceFromPoint(playerid, x, y, z) <= range;', '}', '');
    C.push('// Stops what it was doing (path, streets, recording, actions) to fight or flee');
    C.push(`stock ${P}_Pause(k)`, '{');
    C.push(`    new npcid = ${P}_Id[k];`);
    C.push(`    if (${P}_St[k][4]) { KillTimer(${P}_St[k][4]); ${P}_St[k][4] = 0; }`);
    C.push('    if (NPC_IsPlayingNode(npcid)) NPC_PausePlayingNode(npcid);');
    C.push('    if (NPC_IsPlayingPlayback(npcid)) NPC_PausePlayback(npcid, true);');
    C.push('    // Always: a NPC that follows a player and stands next to it is not moving, but open.mp still keeps it following and');
    C.push('    // would turn the next move (fleeing, fighting) back towards that player');
    C.push('    NPC_StopMove(npcid);');
    C.push('    return 1;', '}', '');
    C.push('// One step of the fight (every 200 ms). A move order is given only when it changes: giving it again and again would start');
    C.push('// and stop the walk (jerks).');
    C.push(`stock ${P}_Chase(k)`, '{');
    C.push(`    new npcid = ${P}_Id[k], t = ${P}_St[k][3], WEAPON:w = NPC_GetWeapon(npcid);`);
    C.push('    // In a vehicle it gets out to fight: told once (told again, open.mp starts the 1.5 s of getting out over), then it waits');
    C.push('    if (NPC_GetVehicle(npcid) != INVALID_VEHICLE_ID)', '    {');
    C.push(`        if (${P}_St[k][8] != 4) { ${P}_St[k][8] = 4; if (NPC_IsMoving(npcid)) NPC_StopMove(npcid); NPC_ExitVehicle(npcid); }`);
    C.push('        return 1;');
    C.push('    }');
    C.push('    // Out of bullets: puts the gun away and fights with the fists, flees, or stays');
    C.push('    if (_:w > 15 && !NPC_IsInfiniteAmmoEnabled(npcid) && NPC_GetAmmo(npcid) <= 0 && !NPC_IsReloading(npcid))', '    {');
    C.push(`        if (${P}_Ai[k][18] == 1) { NPC_StopAim(npcid); NPC_SetWeapon(npcid, WEAPON_FIST); w = WEAPON_FIST; ${P}_St[k][8] = 0; }`);
    C.push(`        else if (${P}_Ai[k][18] == 2) { NPC_StopAim(npcid); ${P}_Flee(k, t); return 1; }`);
    C.push('    }');
    C.push('    if (_:w <= 15)', '    {');
    C.push('        // Hand to hand: it always keeps going after the target until it is right next to it (the move order stops 0.6 m from');
    C.push('        // the target and starts again when the target steps away), and strikes only within reach, so it never strikes the air');
    C.push('        if (NPC_IsAiming(npcid)) NPC_StopAim(npcid);');
    C.push('        new bool:hit = NPC_IsMeleeAttacking(npcid);');
    C.push(`        if (${P}_Ai[k][10] && (${P}_St[k][8] != 3 || NPC_GetPlayerMovingTo(npcid) != t)) { ${P}_St[k][8] = 3; NPC_MoveToPlayer(npcid, t, ${P}_Mt(npcid, NPC_MOVE_TYPE:${P}_Ai[k][12]), NPC_MOVE_SPEED_AUTO, 0.6, ${P}_Ai[k][23], true); }`);
    C.push(`        if (${P}_Near(npcid, t, hit ? ${P}_AiF[k][11] + 0.3 : ${P}_AiF[k][11]))`, '        {');
    C.push('            NPC_SetAngleToPlayer(npcid, t);');
    C.push('            // Both kinds of strikes: the other one every 1.2 s (the special one is the move of its fighting style: aim + secondary attack)');
    C.push(`            if (${P}_Ai[k][19] == 2 && hit && ++${P}_St[k][10] >= 6) { ${P}_St[k][10] = 0; ${P}_St[k][9] = !${P}_St[k][9]; NPC_StopMeleeAttack(npcid); hit = false; }`);
    C.push(`            if (!hit) NPC_MeleeAttack(npcid, ${P}_Ai[k][20], ${P}_Ai[k][19] == 1 || (${P}_Ai[k][19] == 2 && ${P}_St[k][9] != 0));`);
    C.push('        }');
    C.push('        else if (hit) NPC_StopMeleeAttack(npcid);');
    C.push('        return 1;');
    C.push('    }');
    C.push('    // Hit by blows (punched, knocked down): no shooting for a moment');
    C.push(`    if (${P}_St[k][11] > 0) { ${P}_St[k][11]--; if (NPC_IsAiming(npcid)) NPC_StopAim(npcid); return 1; }`);
    C.push('    // A gun: in range it shoots (stopped, or walking towards the target); out of range it stops aiming and runs after it');
    C.push('    new bool:aiming = NPC_IsAimingAtPlayer(npcid, t);');
    C.push(`    if (${P}_Near(npcid, t, aiming ? ${P}_AiF[k][4] + 2.0 : ${P}_AiF[k][4]))`, '    {');
    C.push(`        if (${P}_Ai[k][17] && ${P}_Ai[k][10]) { if (${P}_St[k][8] != 1) { ${P}_St[k][8] = 1; NPC_MoveToPlayer(npcid, t, NPC_MOVE_TYPE_WALK, NPC_MOVE_SPEED_AUTO, 3.0, ${P}_Ai[k][23], true); } }`);
    C.push(`        else if (${P}_St[k][8] != 0 || NPC_IsMoving(npcid)) { ${P}_St[k][8] = 0; NPC_StopMove(npcid); }`);
    C.push(`        if (!aiming) NPC_AimAtPlayer(npcid, t, true, ${P}_Ai[k][24], true, 0.0, 0.0, ${P}_AiF[k][10], 0.0, 0.0, 0.0, NPC_ENTITY_CHECK_ALL);`);
    C.push('    }');
    C.push('    else', '    {');
    C.push('        if (aiming) NPC_StopAim(npcid);');
    C.push(`        if (${P}_Ai[k][10] && ${P}_St[k][8] != 2) { ${P}_St[k][8] = 2; NPC_MoveToPlayer(npcid, t, ${P}_Mt(npcid, NPC_MOVE_TYPE:${P}_Ai[k][12]), NPC_MOVE_SPEED_AUTO, ${P}_AiF[k][4] * 0.7, ${P}_Ai[k][23], true); }`);
    C.push('    }');
    C.push('    return 1;', '}', '');
    C.push(`stock ${P}_Fight(k, playerid)`, '{');
    C.push(`    new npcid = ${P}_Id[k];`);
    C.push(`    if (${P}_St[k][5] != 1 && ${P}_St[k][5] != 2) ${P}_Pause(k);`);
    C.push('    if (NPC_IsMeleeAttacking(npcid)) NPC_StopMeleeAttack(npcid);');
    C.push('    NPC_ClearAnimations(npcid);');
    C.push(`    ${P}_St[k][5] = 1; ${P}_St[k][3] = playerid; ${P}_St[k][8] = 0; ${P}_St[k][9] = 0; ${P}_St[k][10] = 0;`);
    C.push(`    return ${P}_Chase(k);`, '}', '');
    C.push(`stock ${P}_Flee(k, playerid)`, '{');
    C.push(`    new npcid = ${P}_Id[k], Float:x, Float:y, Float:z, Float:px, Float:py, Float:pz;`);
    C.push(`    if (${P}_St[k][5] != 1 && ${P}_St[k][5] != 2) ${P}_Pause(k);`);
    C.push('    if (NPC_IsMeleeAttacking(npcid)) NPC_StopMeleeAttack(npcid);');
    C.push('    if (NPC_IsAiming(npcid)) NPC_StopAim(npcid);');
    C.push('    NPC_ClearAnimations(npcid);');
    C.push(`    ${P}_St[k][5] = 2; ${P}_St[k][3] = playerid; ${P}_St[k][8] = 0;`);
    C.push('    NPC_GetPos(npcid, x, y, z);');
    C.push('    GetPlayerPos(playerid, px, py, pz);');
    if (anyFlee) C.push(`    if (${P}_FleeRoute(k, x, y, z, px, py)) return 1;`, '    // No sidewalk (on foot) or road (driving) near: straight away from the attacker');
    C.push('    new Float:d = floatsqroot((x - px) * (x - px) + (y - py) * (y - py));');
    C.push('    if (d < 0.1) d = 0.1;');
    C.push(`    NPC_Move(npcid, x + (x - px) / d * ${P}_AiF[k][3], y + (y - py) / d * ${P}_AiF[k][3], z, ${P}_Mt(npcid, NPC_MOVE_TYPE:${P}_Ai[k][14]), NPC_MOVE_SPEED_AUTO, 1.0);`);
    C.push('    return 1;', '}', '');
    if (anyFlee) {
      C.push('// The way it flees: from street point to street point of its area of the map (sidewalks on foot, roads driving), each one');
      C.push('// farther from the attacker and ahead of the way it goes, until it is the flee distance away from where it started.');
      C.push('// open.mp gives the points but not the links between them: the next point is a near one (15 m on foot, 40 m driving), so it');
      C.push('// keeps to the sidewalk or road instead of cutting through the blocks');
      C.push(`#define ${P}_FLEE_PTS 512`);
      C.push(`stock ${P}_FleeRoute(k, Float:x, Float:y, Float:z, Float:ax, Float:ay)`, '{');
      C.push(`    static Float:qx[${P}_FLEE_PTS], Float:qy[${P}_FLEE_PTS], Float:qz[${P}_FLEE_PTS], bool:used[${P}_FLEE_PTS];`);
      C.push(`    new npcid = ${P}_Id[k], bool:car = NPC_GetVehicle(npcid) != INVALID_VEHICLE_ID, Float:step = car ? 40.0 : 15.0;`);
      C.push('    new col = floatround((x + 3000.0) / 750.0, floatround_floor), row = floatround((y + 3000.0) / 750.0, floatround_floor);');
      C.push('    if (col < 0) col = 0; else if (col > 7) col = 7;');
      C.push('    if (row < 0) row = 0; else if (row > 7) row = 7;');
      C.push('    new node = row * 8 + col;');
      C.push(`    if (!${P}_Hold(node)) return 0;`);
      C.push('    new veh, ped, navi, from, to, n = 0, Float:px, Float:py, Float:pz;');
      C.push('    NPC_GetNodeInfo(node, veh, ped, navi);');
      C.push('    #pragma unused navi');
      C.push('    if (car) { from = 0; to = veh; } else { from = veh; to = veh + ped; }');
      C.push('    if (to > NPC_GetNodePointCount(node)) to = NPC_GetNodePointCount(node);');
      C.push('    // The points it may pass: up to the flee distance and a step more from it');
      C.push(`    new Float:reach = ${P}_AiF[k][3] + step + 20.0;`);
      C.push(`    for (new p = from; p < to && n < ${P}_FLEE_PTS; p++)`, '    {');
      C.push('        NPC_SetNodePoint(node, p);');
      C.push('        NPC_GetNodePointPosition(node, px, py, pz);');
      C.push('        if (VectorSize(px - x, py - y, 0.0) > reach || floatabs(pz - z) > 10.0) continue;');
      C.push('        qx[n] = px; qy[n] = py; qz[n] = pz; used[n] = false; n++;');
      C.push('    }');
      C.push('    if (n == 0) return 0;');
      C.push('    // Away from the attacker');
      C.push('    new Float:ux = x - ax, Float:uy = y - ay, Float:l = VectorSize(ux, uy, 0.0);');
      C.push('    if (l < 0.1) { ux = 1.0; uy = 0.0; } else { ux /= l; uy /= l; }');
      C.push(`    if (${P}_FPath[k] == INVALID_PATH_ID || !NPC_IsValidPath(${P}_FPath[k])) ${P}_FPath[k] = NPC_CreatePath();`);
      C.push(`    else NPC_ClearPath(${P}_FPath[k]);`);
      C.push(`    new path = ${P}_FPath[k], count = 0, Float:sx = x, Float:sy = y;`);
      C.push('    for (new s = 0; s < 60; s++)', '    {');
      C.push('        // The next point: near, farther from the attacker than where it is, ahead (the first one, to reach the sidewalk or road,');
      C.push('        // may also be to a side); straight on and near beats far');
      C.push('        new best = -1, Float:bs = -1.0e9, Float:far = VectorSize(sx - ax, sy - ay, 0.0), Float:lim = count == 0 ? 20.0 : step;');
      C.push('        for (new i = 0; i < n; i++)', '        {');
      C.push('            if (used[i]) continue;');
      C.push('            new Float:dx = qx[i] - sx, Float:dy = qy[i] - sy, Float:dd = VectorSize(dx, dy, 0.0);');
      C.push('            if (dd < 1.5 || dd > lim || VectorSize(qx[i] - ax, qy[i] - ay, 0.0) < far + 0.5) continue;');
      C.push('            new Float:c = (dx * ux + dy * uy) / dd;');
      C.push('            if (c < (count == 0 ? -0.3 : 0.4)) continue;');
      C.push('            new Float:sc = c - dd / lim;');
      C.push('            if (sc > bs) { bs = sc; best = i; }');
      C.push('        }');
      C.push('        if (best < 0) break;');
      C.push('        used[best] = true;');
      C.push('        NPC_AddPointToPath(path, qx[best], qy[best], qz[best], car ? 2.0 : 0.5);');
      C.push('        count++;');
      C.push('        // The way it goes now: along the street, bent away from the attacker');
      C.push('        new Float:vx = qx[best] - sx, Float:vy = qy[best] - sy, Float:vl = VectorSize(vx, vy, 0.0);');
      C.push('        new Float:wx = qx[best] - ax, Float:wy = qy[best] - ay, Float:wl = VectorSize(wx, wy, 0.0);');
      C.push('        if (vl > 0.1 && wl > 0.1)', '        {');
      C.push('            ux = vx / vl * 0.6 + wx / wl * 0.4; uy = vy / vl * 0.6 + wy / wl * 0.4;');
      C.push('            l = VectorSize(ux, uy, 0.0);');
      C.push('            if (l > 0.1) { ux /= l; uy /= l; }');
      C.push('        }');
      C.push('        sx = qx[best]; sy = qy[best];');
      C.push(`        if (VectorSize(sx - x, sy - y, 0.0) >= ${P}_AiF[k][3]) break;`);
      C.push('    }');
      C.push('    if (count == 0) return 0;');
      C.push(`    return NPC_MoveByPath(npcid, path, ${P}_Mt(npcid, NPC_MOVE_TYPE:${P}_Ai[k][14]), NPC_MOVE_SPEED_AUTO) ? 1 : 0;`, '}', '');
    }
    C.push('// It reached the flee distance: on the alert for a while (the attacker coming closer makes it flee again), then it waits,');
    C.push('// then back to what it did');
    C.push(`stock ${P}_FleeEnd(k)`, '{');
    C.push(`    if (${P}_AiF[k][13] > 0.0) { ${P}_St[k][5] = 7; ${P}_St[k][10] = floatround(${P}_AiF[k][13] * 5.0); return 1; }`);
    C.push(`    return ${P}_FleeWait(k);`, '}', '');
    C.push(`stock ${P}_FleeWait(k)`, '{');
    C.push(`    if (${P}_AiF[k][14] > 0.0) { ${P}_St[k][5] = 8; ${P}_St[k][10] = floatround(${P}_AiF[k][14] * 5.0); return 1; }`);
    C.push(`    return ${P}_Resume(k);`, '}', '');

    C.push('// The fight is over: back to what it was doing, from where it is (the guard and the NPC that stands walk back to their place)');
    C.push(`stock ${P}_Resume(k)`, '{');
    C.push(`    new npcid = ${P}_Id[k];`);
    C.push('    NPC_StopAim(npcid);');
    C.push('    if (NPC_IsMeleeAttacking(npcid)) NPC_StopMeleeAttack(npcid);');
    C.push('    if (NPC_IsMoving(npcid)) NPC_StopMove(npcid);');
    if (anyCar) {
      C.push('    // It got out of its vehicle to fight (or is still getting out): it goes back to it, gets in and goes on from there');
      C.push(`    new bool:out = ${P}_St[k][8] == 4 || NPC_GetVehicle(npcid) == INVALID_VEHICLE_ID;`);
    }
    C.push(`    ${P}_St[k][3] = INVALID_PLAYER_ID; ${P}_St[k][8] = 0;`);
    if (anyCar) {
      C.push(`    if (out && ${P}_Car[k][0] != INVALID_VEHICLE_ID && GetVehicleModel(${P}_Car[k][0]) != 0)`, '    {');
      C.push(`        ${P}_St[k][5] = 6;`);
      C.push(`        ${P}_St[k][9] = NPC_GetVehicle(npcid) == INVALID_VEHICLE_ID; // 0 still getting out, 1 on foot`);
      C.push(`        ${P}_St[k][10] = 0;`);
      C.push(`        if (${P}_St[k][9]) ${P}_ToCar(k);`);
      C.push('        return 1;');
      C.push('    }');
    }
    C.push(`    switch (${P}_Ai[k][0])`, '    {');
    if (anyPath) C.push(`        case 1: { ${P}_St[k][5] = 0; ${P}_RunLeg(k); }`);
    const wanderResume = `if (NPC_IsPlayingNode(npcid)) NPC_StopPlayingNode(npcid); ${P}_Wander(k);`;
    if (anyWander && anyGraph) C.push(`        case 2: { ${P}_St[k][5] = 0; if (${P}_Ai[k][22] > 0) { ${P}_St[k][6] = -1; ${P}_GWalk(k); } else { ${wanderResume} } }`);
    else if (anyWander) C.push(`        case 2: { ${P}_St[k][5] = 0; ${wanderResume} }`);
    else if (anyGraph) C.push(`        case 2: { ${P}_St[k][5] = 0; ${P}_St[k][6] = -1; ${P}_GWalk(k); }`);
    C.push(`        case 4: { ${P}_St[k][10] = 0; ${P}_St[k][5] = 0; }`);
    if (anyPlayback) C.push(`        case 5: { ${P}_St[k][5] = 0; if (NPC_IsPlaybackPaused(npcid)) NPC_PausePlayback(npcid, false); else ${P}_Start(k); }`);
    C.push('        default:', '        {');
    C.push(`            ${P}_St[k][5] = 3;`);
    C.push(`            NPC_Move(npcid, ${P}_Home(k, 0), ${P}_Home(k, 1), ${P}_Home(k, 2), ${P}_Mt(npcid, NPC_MOVE_TYPE:${P}_Ai[k][13]), NPC_MOVE_SPEED_AUTO, 0.3);`);
    C.push('        }');
    C.push('    }');
    C.push('    return 1;', '}', '');
    if (anyCar) {
      C.push('// Back to its vehicle: open.mp walks it to the door and puts it in when it is up to 30 m away; farther, it runs there first');
      C.push(`stock ${P}_ToCar(k)`, '{');
      C.push(`    new npcid = ${P}_Id[k], v = ${P}_Car[k][0], Float:x, Float:y, Float:z, Float:nx, Float:ny, Float:nz;`);
      C.push(`    ${P}_St[k][10] = 1;`);
      C.push('    GetVehiclePos(v, x, y, z);');
      C.push('    NPC_GetPos(npcid, nx, ny, nz);');
      C.push(`    if (VectorSize(x - nx, y - ny, z - nz) < 25.0) NPC_EnterVehicle(npcid, v, ${P}_Car[k][1], NPC_MOVE_TYPE:${P}_Ai[k][13]);`);
      C.push(`    else NPC_Move(npcid, x, y, z, NPC_MOVE_TYPE:${P}_Ai[k][13], NPC_MOVE_SPEED_AUTO, 4.0);`);
      C.push('    return 1;', '}', '');
    }
    C.push('// Hit by a blow (fists or a melee weapon): it stops aiming and does not shoot for 1.6 s (renewed by every blow)');
    C.push(`stock ${P}_Stun(k, WEAPON:weaponid)`, '{');
    C.push(`    if (k < 0 || _:weaponid > 15) return 0;`);
    C.push(`    new npcid = ${P}_Id[k];`);
    C.push(`    ${P}_St[k][11] = 8;`);
    C.push('    if (NPC_IsAiming(npcid)) NPC_StopAim(npcid);');
    C.push(`    if (${P}_St[k][8] == 1) { ${P}_St[k][8] = 0; if (NPC_IsMoving(npcid)) NPC_StopMove(npcid); }`);
    C.push('    return 1;', '}', '');
    C.push('// A player hurt the NPC: it fights back or flees (a guard always fights back). Not for the damage of another NPC (a stray');
    C.push('// bullet would make two NPCs fight to the death)');
    C.push(`stock ${P}_Hurt(k, issuerid)`, '{');
    C.push(`    if (k < 0 || issuerid == INVALID_PLAYER_ID || issuerid == ${P}_Id[k] || (${P}_St[k][3] == issuerid && (${P}_St[k][5] == 1 || ${P}_St[k][5] == 2)) || IsPlayerNPC(issuerid)) return 0;`);
    C.push(`    if (${P}_Ai[k][5] == 1 || ${P}_Ai[k][0] == 3) ${P}_Fight(k, issuerid);`);
    C.push(`    else if (${P}_Ai[k][5] == 2) ${P}_Flee(k, issuerid);`);
    C.push('    return 1;', '}', '');
    C.push(`forward ${P}_Think();`);
    C.push(`public ${P}_Think()`, '{');
    C.push(`    new all = GetPlayers(${P}_Pl);`);
    C.push(`    ${P}_PlN = 0;`);
    C.push(`    for (new i = 0; i < all; i++) if (!IsPlayerNPC(${P}_Pl[i])) ${P}_Pl[${P}_PlN++] = ${P}_Pl[i];`);
    C.push(`    for (new k = 0; k < ${N}; k++)`, '    {');
    C.push(`        new npcid = ${P}_Id[k];`);
    C.push('        if (npcid == INVALID_NPC_ID || !NPC_IsSpawned(npcid) || NPC_IsDead(npcid)) continue;');
    C.push('        // After fleeing (also with no one near): on the alert, it flees again from the attacker coming closer than half the flee');
    C.push('        // distance; then it waits; then back to what it did');
    C.push(`        if (${P}_St[k][5] == 7)`, '        {');
    C.push(`            if (${P}_Near(npcid, ${P}_St[k][3], ${P}_AiF[k][3] * 0.5)) ${P}_Flee(k, ${P}_St[k][3]);`);
    C.push(`            else if (--${P}_St[k][10] <= 0) ${P}_FleeWait(k);`);
    C.push('            continue;');
    C.push('        }');
    C.push(`        if (${P}_St[k][5] == 8) { if (--${P}_St[k][10] <= 0) ${P}_Resume(k); continue; }`);
    C.push('        if (!NPC_IsAnyStreamedIn(npcid)) continue;');
    C.push(`        new busy = ${P}_St[k][5], t = ${P}_St[k][3];`);
    C.push('        if (busy == 1)', '        {');
    C.push(`            if (!${P}_Near(npcid, t, ${P}_AiF[k][2] > 0.0 ? ${P}_AiF[k][2] : (${P}_Ai[k][0] == 3 ? ${P}_AiF[k][1] * 1.5 : 60.0))) { ${P}_Resume(k); continue; }`);
    C.push(`            ${P}_Chase(k);`);
    C.push('            continue;');
    C.push('        }');
    if (anyCar) {
      C.push('        if (busy == 6)', '        {');
      C.push('            // Going back to its vehicle: in it, it goes on; if the vehicle is gone, it goes on on foot; stuck, it tries again');
      C.push(`            if (GetVehicleModel(${P}_Car[k][0]) == 0) { ${P}_St[k][5] = 0; ${P}_Car[k][0] = INVALID_VEHICLE_ID; ${P}_Resume(k); }`);
      C.push(`            else if (NPC_GetVehicle(npcid) != INVALID_VEHICLE_ID) { if (${P}_St[k][9]) { ${P}_St[k][5] = 0; ${P}_Resume(k); } } // back in it (or still getting out)`);
      C.push('            // Told once: told again, open.mp starts the 2.5 s of getting in over. Again only after a run to the vehicle or 7 s in vain');
      C.push(`            else { ${P}_St[k][9] = 1; if (NPC_IsMoving(npcid)) ${P}_St[k][10] = 0; else if (${P}_St[k][10] == 0 || ++${P}_St[k][10] > 35) ${P}_ToCar(k); }`);
      C.push('            continue;');
      C.push('        }');
    }
    C.push(`        if (busy == 3 && ${P}_Ai[k][0] == 3)`, '        {');
    C.push('            // A guard going back to its place still attacks whoever comes into its range');
    C.push(`            new p = ${P}_Closest(npcid, ${P}_AiF[k][1]);`);
    C.push(`            if (p != INVALID_PLAYER_ID) ${P}_Fight(k, p);`);
    C.push('            continue;');
    C.push('        }');
    C.push('        if (busy) continue;');
    C.push(`        switch (${P}_Ai[k][0])`, '        {');
    C.push('            case 3:', '            {');
    C.push(`                new p = ${P}_Closest(npcid, ${P}_AiF[k][1]);`);
    C.push(`                if (p != INVALID_PLAYER_ID) ${P}_Fight(k, p);`);
    C.push('            }');
    C.push('            case 4:', '            {');
    C.push('                // Follows without the restart of open.mp (it starts again as soon as the player is a few centimetres past the');
    C.push('                // distance, so it stops and goes all the time): it catches up once the player is 1.5 m past it, then stops');
    C.push(`                new p = ${P}_Closest(npcid, ${P}_AiF[k][5]);`);
    C.push(`                if (p != INVALID_PLAYER_ID && NPC_GetPlayerMovingTo(npcid) != p && !${P}_Near(npcid, p, ${P}_AiF[k][1] + 1.5)) NPC_MoveToPlayer(npcid, p, ${P}_Mt(npcid, NPC_MOVE_TYPE:${P}_Ai[k][1]), ${P}_AiF[k][0], ${P}_AiF[k][1], ${P}_Ai[k][23], false);`);
    C.push('            }');
    C.push('            default:', '            {');
    C.push(`                if (!${P}_Ai[k][9]) continue;`);
    C.push(`                new p = ${P}_Closest(npcid, ${P}_AiF[k][1]);`);
    C.push('                if (p != INVALID_PLAYER_ID) NPC_SetAngleToPlayer(npcid, p);');
    C.push('            }');
    C.push('        }');
    C.push('        #pragma unused t');
    C.push('    }');
    C.push('    return 1;', '}', '');
  }

  // Callbacks
  const hooks = [];
  const hook = (cb, args, body, argNames) => hooks.push({ cb, args, body, argNames });
  hook('OnNPCSpawn', 'npcid', [`new k = ${P}_Index(npcid);`, `if (k >= 0) ${P}_Setup(k);`], 'npcid');
  hook('OnNPCRespawn', 'npcid', [`new k = ${P}_Index(npcid);`, `if (k >= 0) ${P}_Setup(k);`], 'npcid');
  hook('OnNPCDestroy', 'npcid', [`new k = ${P}_Index(npcid);`, `if (k >= 0) { if (${P}_St[k][4]) KillTimer(${P}_St[k][4]); ${P}_St[k][4] = 0; ${P}_Id[k] = INVALID_NPC_ID; }`], 'npcid');
  hook('OnNPCDeath', 'npcid, killerid, WEAPON:reason', [
    `new k = ${P}_Index(npcid);`,
    'if (k >= 0)', '{',
    `    if (${P}_St[k][4]) KillTimer(${P}_St[k][4]);`,
    `    ${P}_St[k][4] = 0; ${P}_St[k][5] = 0; ${P}_St[k][3] = INVALID_PLAYER_ID;`,
    '    if (NPC_IsMeleeAttacking(npcid)) NPC_StopMeleeAttack(npcid);',
    '    NPC_StopAim(npcid);',
    `    if (${P}_Ai[k][6] > 0) ${P}_St[k][4] = SetTimerEx("${P}_Revive", ${P}_Ai[k][6], false, "i", k);`,
    '}'], 'npcid, killerid, reason');
  if (anyPath || anyGraph) hook('OnNPCFinishMovePath', 'npcid, pathid', [
    `new k = ${P}_Index(npcid);`,
    anyGraph ? `if (k >= 0 && ${P}_St[k][5] == 0 && ${P}_Ai[k][22] > 0 && ${P}_WPath[k] == pathid) ${P}_GWalk(k);` : '',
    anyPath ? `${anyGraph ? 'else ' : ''}if (k >= 0 && ${P}_St[k][5] == 0 && ${P}_Ai[k][4] > 0 && ${P}_Path[${P}_Ai[k][3] + ${P}_St[k][0]] == pathid)` : '',
    ...(anyPath ? ['{',
      `    new l = ${P}_Ai[k][3] + ${P}_St[k][0], p = ${P}_St[k][1] > 0 ? ${P}_Leg[l][1] : ${P}_Leg[l][0];`,
      acts.length ? `    if (${P}_PtA[p][1]) ${P}_Step(k, ${P}_PtA[p][0], ${P}_PtA[p][0] + ${P}_PtA[p][1]);` : '    #pragma unused p',
      acts.length ? `    else ${P}_Next(k);` : `    ${P}_Next(k);`,
      '}'] : [])], 'npcid, pathid');
  if (anyThink || anyRadius || anyWander) {
    hook('OnNPCFinishMove', 'npcid', [
      `new k = ${P}_Index(npcid);`,
      anyThink ? `if (k >= 0 && ${P}_St[k][5] == 2) ${P}_FleeEnd(k);` : '',
      `${anyThink ? 'else ' : ''}if (k >= 0 && ${P}_St[k][5] == 3) { ${P}_St[k][5] = 0; ${P}_Start(k); NPC_ClearAnimations(npcid); SetTimerEx("${P}_PoseLater", 400, false, "i", k); }`,
      anyWander ? `else if (k >= 0 && ${P}_St[k][5] == 4) { ${P}_St[k][5] = 0; ${P}_PlayNode(k); } // reached the street` : ''], 'npcid');
  }
  if (anyThink) {
    // An invulnerable NPC never gets OnNPCTakeDamage (open.mp drops the damage first): the attack comes from the player's side
    hook('OnPlayerGiveDamage', 'playerid, damagedid, Float:amount, WEAPON:weaponid, bodypart', [
      `new k = ${P}_Index(damagedid);`,
      `if (k >= 0 && NPC_IsInvulnerable(damagedid)) { ${P}_Stun(k, weaponid); ${P}_Hurt(k, playerid); }`], 'playerid, damagedid, amount, weaponid, bodypart');
    // Without it the NPC would keep fighting (or following) a player who left until someone else came near (its id may even go to
    // the next player who connects)
    hook('OnPlayerDisconnect', 'playerid, reason', [
      '// The player it fought, fled from or followed left: it goes back to what it was doing',
      `for (new k = 0; k < ${N}; k++)`, '{',
      `    new npcid = ${P}_Id[k];`,
      '    if (npcid == INVALID_NPC_ID || npcid == playerid || !NPC_IsValid(npcid) || NPC_IsDead(npcid)) continue;',
      `    if (${P}_St[k][3] == playerid && (${P}_St[k][5] == 1 || ${P}_St[k][5] == 2 || ${P}_St[k][5] == 7)) ${P}_Resume(k);`,
      '    else if (NPC_GetPlayerMovingTo(npcid) == playerid) NPC_StopMove(npcid);',
      '}'], 'playerid, reason');
  }
  hook('OnPlayerStreamIn', 'playerid, forplayerid', [
    '// A player sees the NPC: its radar marker and its fighting style; a NPC that waits to be',
    '// seen starts now',
    `new k = ${P}_Index(playerid);`,
    'if (k >= 0)', '{',
    `    SetPlayerMarkerForPlayer(forplayerid, playerid, ${P}_Look[k][0]);`,
    '    NPC_SetFightingStyle(playerid, NPC_GetFightingStyle(playerid));',
    `    if (${P}_St[k][5] == 5) ${P}_Start(k);`,
    '}'], 'playerid, forplayerid');
  if (anyRadius) hook('OnNPCFinishNodePoint', 'npcid, nodeid, pointid', [
    '// Walking the streets farther than its radius: goes back towards its place and starts again from there',
    `new k = ${P}_Index(npcid);`,
    `if (k >= 0 && ${P}_St[k][5] == 0 && ${P}_AiF[k][7] > 0.0)`, '{',
    '    new Float:x, Float:y, Float:z;',
    '    NPC_GetPos(npcid, x, y, z);',
    `    if (VectorSize(x - ${P}_Home(k, 0), y - ${P}_Home(k, 1), 0.0) > ${P}_AiF[k][7])`, '    {',
    '        // Right after this callback (inside it open.mp still goes on to the next street point)',
    `        ${P}_St[k][5] = 3;`,
    `        SetTimerEx("${P}_Back", 1, false, "i", k);`,
    '    }',
    '}'], 'npcid, nodeid, pointid');
  if (anyThink || anyMult) hook('OnNPCTakeDamage', 'npcid, issuerid, Float:amount, WEAPON:weaponid, bodypart', [
    `new k = ${P}_Index(npcid);`,
    anyThink ? `${P}_Stun(k, weaponid);` : '',
    anyThink ? `${P}_Hurt(k, issuerid);` : '#pragma unused issuerid',
    '// The damage it takes, times its multiplier: applied here instead of the default one',
    `if (k >= 0 && ${P}_AiF[k][6] != 1.0) { ${P}_Damage(k, issuerid, amount, weaponid); return 0; }`], 'npcid, issuerid, amount, weaponid, bodypart');
  if (anyPlayback) hook('OnNPCPlaybackEnd', 'npcid, recordid', [
    `new k = ${P}_Index(npcid);`,
    `if (k >= 0 && ${P}_St[k][5] == 0 && ${P}_Ai[k][0] == 5 && (${P}_Ai[k][8] & 2)) ${P}_Play(k, ${P}_Ai[k][7], bool:(${P}_Ai[k][8] & 1));`], 'npcid, recordid');
  if (anyWander) {
    hook('OnNPCFinishNode', 'npcid, nodeid', [
      '// End of the streets of this area (a dead end or the next area is closed): starts again from where it is',
      `new k = ${P}_Index(npcid);`,
      `if (k >= 0 && ${P}_St[k][5] == 0) ${P}_Wander(k);`], 'npcid, nodeid');
    hook('OnNPCChangeNode', 'npcid, newnodeid, oldnodeid', [
      '// Goes on to the next area of the map (opens it when it is closed)',
      `if (${P}_Index(npcid) >= 0) ${P}_Hold(newnodeid);`], 'npcid, newnodeid, oldnodeid');
  }

  if (anyBubble) {
    C.push('// Chat bubbles over the head: set again before they expire');
    C.push(`forward ${P}_Bubbles();`);
    C.push(`public ${P}_Bubbles()`, '{');
    C.push(`    for (new k = 0; k < ${N}; k++)`, '    {');
    C.push(`        if (${P}_Ai[k][15] >= 0 && NPC_IsValid(${P}_Id[k]) && !NPC_IsDead(${P}_Id[k])) SetPlayerChatBubble(${P}_Id[k], ${P}_Str[${P}_Ai[k][15]], ${P}_Look[k][1], ${P}_AiF[k][8], 6000);`);
    C.push('    }');
    C.push('    return 1;', '}', '');
  }
  if (anyRadius) {
    C.push(`forward ${P}_Back(k);`);
    C.push(`public ${P}_Back(k)`, '{');
    C.push(`    new npcid = ${P}_Id[k];`);
    C.push(`    if (!NPC_IsValid(npcid) || ${P}_St[k][5] != 3) return 0;`);
    C.push('    if (NPC_IsPlayingNode(npcid)) NPC_StopPlayingNode(npcid);');
    C.push(`    NPC_Move(npcid, ${P}_Home(k, 0), ${P}_Home(k, 1), ${P}_Home(k, 2), ${P}_Mt(npcid, NPC_MOVE_TYPE:${P}_Ai[k][1]), ${P}_AiF[k][0], 1.0);`);
    C.push('    return 1;', '}', '');
  }
  C.push(`forward ${P}_Revive(k);`);
  C.push(`public ${P}_Revive(k)`, '{');
  C.push(`    ${P}_St[k][4] = 0;`);
  C.push(`    if (NPC_IsValid(${P}_Id[k])) NPC_Respawn(${P}_Id[k]);`);
  C.push('    return 1;', '}', '');

  for (const h of hooks) {
    const H = `${P}_${h.cb}`;
    C.push(`public ${h.cb}(${h.args})`, '{');
    for (const l of h.body) C.push(l ? '    ' + l : '');
    C.push(`    #if defined ${H}`, `        return ${H}(${h.argNames});`, '    #else', '        return 1;', '    #endif', '}');
    C.push(`#if defined _ALS_${h.cb}`, `    #undef ${h.cb}`, '#else', `    #define _ALS_${h.cb}`, '#endif');
    C.push(`#define ${h.cb} ${H}`);
    C.push(`#if defined ${H}`, `    forward ${H}(${h.args});`, '#endif', '');
  }
  return {
    decl, code: C.join('\n').replace(/\n{3,}/g, '\n\n'), load: `${P}_Load();`,
    usage: [`${tr('NPCs')}: ${P}_Load(); / ${P}_Unload();`],
  };
}

// ---------------------------------------------------------------------------  import
// Reads back the NPCs of exported code: the tables give the behaviour, the Setup function the settings (any NPC_* call in each case,
// which also reads NPCs written by hand: new id = NPC_Create("Name"); NPC_SetSkin(id, 10); ...).
// masked: the source with the comments blanked; vehicles: the imported vehicles in source order; vars: variable -> imported item.
const MODE_BY = Object.fromEntries(Object.entries(MODE_CODE).map(([k, v]) => [v, k]));
const LOOP_BY = Object.fromEntries(Object.entries(LOOP_CODE).map(([k, v]) => [v, k]));
const DMG_BY = Object.fromEntries(Object.entries(DMG_CODE).map(([k, v]) => [v, k]));
const MOVE_BY = Object.fromEntries(Object.entries(MOVE_CONST).map(([k, v]) => [v, k]));
const rowsOf = (body) => [...body.matchAll(/\{([^{}]*)\}/g)].map(m => m[1].split(',').map(s => s.trim()));
const strList = (body) => [...body.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map(m => m[1]);
const tagNum = (s) => { const m = String(s || '').replace(/^[A-Z_]+\s*:\s*/, '').trim(); return Number.isFinite(+m) ? +m : NaN; };
const splitArgs = (s) => { const out = []; let depth = 0, cur = '', q = false; for (const ch of s) { if (ch === '"') q = !q; if (!q && ch === '(') depth++; if (!q && ch === ')') depth--; if (!q && depth === 0 && ch === ',') { out.push(cur.trim()); cur = ''; } else cur += ch; } if (cur.trim()) out.push(cur.trim()); return out; };
const WEAPON_NAMES = { WEAPON_FIST: 0, WEAPON_BRASSKNUCKLE: 1, WEAPON_GOLFCLUB: 2, WEAPON_NITESTICK: 3, WEAPON_KNIFE: 4, WEAPON_BAT: 5, WEAPON_SHOVEL: 6, WEAPON_POOLSTICK: 7, WEAPON_KATANA: 8, WEAPON_CHAINSAW: 9, WEAPON_GRENADE: 16, WEAPON_TEARGAS: 17, WEAPON_MOLTOV: 18, WEAPON_COLT45: 22, WEAPON_SILENCED: 23, WEAPON_DEAGLE: 24, WEAPON_SHOTGUN: 25, WEAPON_SAWEDOFF: 26, WEAPON_SHOTGSPA: 27, WEAPON_UZI: 28, WEAPON_MP5: 29, WEAPON_AK47: 30, WEAPON_M4: 31, WEAPON_TEC9: 32, WEAPON_RIFLE: 33, WEAPON_SNIPER: 34, WEAPON_ROCKETLAUNCHER: 35, WEAPON_HEATSEEKER: 36, WEAPON_FLAMETHROWER: 37, WEAPON_MINIGUN: 38 };
const constNum = (s) => { const t = String(s || '').trim(); if (t in WEAPON_NAMES) return WEAPON_NAMES[t]; return tagNum(t); };
const truthy = (s) => /^(true|1)$/i.test(String(s || '').trim());
const unq = (s) => String(s || '').trim().replace(/^"|"$/g, '');

// Applies one NPC_* call to the imported NPC t ({ actor fields, npc })
function applyCall(t, fn, a, vehVars, objVars, P) {
  const n = t.npc, numA = (i) => +String(a[i] || '').replace(/^Float\s*:/, '');
  const refOf = (s, vars) => vars.get(String(s || '').replace(/\s+/g, ''));
  switch (fn) {
    case 'NPC_SetSkin': t.skin = constNum(a[1]) | 0; break;
    case 'NPC_SetPos': t.x = numA(1); t.y = numA(2); t.z = numA(3); break;
    case 'NPC_SetFacingAngle': t.rz = numA(1); break;
    case 'NPC_SetInterior': n.interior = constNum(a[1]) | 0; break;
    case 'NPC_SetVirtualWorld': t.world = constNum(a[1]) | 0; break;
    case 'NPC_SetHealth': t.health = numA(1); break;
    case 'NPC_SetArmour': n.armour = numA(1); break;
    case 'NPC_SetInvulnerable': t.invulnerable = a[1] === undefined ? true : truthy(a[1]); break;
    case 'NPC_SetFightingStyle': n.fightStyle = constNum(a[1]); break;
    case 'NPC_SetWeapon': n.weapon = constNum(a[1]); break;
    case 'NPC_SetAmmo': n.ammo = constNum(a[1]); break;
    case 'NPC_SetAmmoInClip': n.clip = constNum(a[1]); break;
    case 'NPC_EnableInfiniteAmmo': n.infiniteAmmo = a[1] === undefined ? true : truthy(a[1]); break;
    case 'NPC_EnableReloading': n.reload = a[1] === undefined ? true : truthy(a[1]); break;
    case 'NPC_SetWeaponAccuracy': n.accuracy = numA(2); break;
    case 'NPC_SetWeaponReloadTime': n.reloadTime = constNum(a[2]); break;
    case 'NPC_SetWeaponShootTime': n.shootTime = constNum(a[2]); break;
    case 'NPC_SetWeaponClipSize': n.clipSize = constNum(a[2]); break;
    case 'NPC_SetWeaponSkillLevel': { const i = constNum(a[1]); if (i >= 0 && i < 11) { n.skills = n.skills || []; n.skills[i] = constNum(a[2]); } break; }
    case 'NPC_SetSpecialAction': n.special = constNum(a[1]); break;
    case 'NPC_ApplyAnimation': t.anim = { lib: unq(a[1]), name: unq(a[2]), delta: numA(3) || 4.1, loop: truthy(a[4]) ? 1 : 0, lockx: truthy(a[5]) ? 1 : 0, locky: truthy(a[6]) ? 1 : 0, freeze: truthy(a[7]) ? 1 : 0, time: constNum(a[8]) | 0 }; break;
    case 'NPC_PutInVehicle': { const v = refOf(a[1], vehVars); if (v && !t.x && !t.y) { t.x = v.x; t.y = v.y; t.z = v.z; t.rz = v.rz || 0; } if (v) { n.vehicle = { ...(n.vehicle || {}), uid: v.uid || (v.uid = 'v' + Math.random().toString(36).slice(2, 10)), seat: constNum(a[2]) | 0 }; } break; }
    case 'NPC_UseVehicleSiren': if (n.vehicle) n.vehicle.siren = a[1] === undefined ? true : truthy(a[1]); break;
    case 'NPC_SetVehicleHealth': if (n.vehicle) n.vehicle.health = numA(1); break;
    case 'NPC_SetSurfingVehicle': { const v = refOf(a[1], vehVars); if (v) n.surf = { ...(n.surf || {}), type: 'vehicle', uid: v.uid || (v.uid = 'v' + Math.random().toString(36).slice(2, 10)) }; break; }
    case 'NPC_SetSurfingObject': { const o = refOf(a[1], objVars); if (o) n.surf = { ...(n.surf || {}), type: 'object', uid: o.uid || (o.uid = 'o' + Math.random().toString(36).slice(2, 10)) }; break; }
    case 'NPC_SetSurfingOffsets': if (n.surf) { n.surf.ox = numA(1); n.surf.oy = numA(2); n.surf.oz = numA(3); } break;
    case 'NPC_PlayNode': n.mode = 'wander'; break;
    case 'NPC_StartPlayback': n.mode = 'playback'; n.rec = unq(a[1]); break;
    case 'NPC_MoveToPlayer': n.mode = 'follow'; break;
    default: break;
  }
}

// Returns the imported NPCs as actor data ({ skin, x, y, z, rz, health, invulnerable, world, anim, npc })
export function importNpcs(masked, vehicles = [], vars = new Map()) {
  const out = [];
  // Npc_<id>_Veh[n] = vehicleid; goes with the vehicle created last before it
  const vehVars = new Map(vars), objVars = vars;
  const calls = [...masked.matchAll(/\b(?:CreateVehicle|AddStaticVehicleEx|AddStaticVehicle)\s*\(/g)].map(m => m.index);
  if (calls.length === vehicles.length) {
    for (const m of masked.matchAll(/\b(Npc_\w+_Veh\s*\[\s*\d+\s*\])\s*=\s*\w+\s*;/g)) {
      let i = -1;
      while (i + 1 < calls.length && calls[i + 1] < m.index) i++;
      if (i >= 0) vehVars.set(m[1].replace(/\s+/g, ''), vehicles[i]);
    }
  }
  // Exported tables
  for (const m of masked.matchAll(/\b(Npc_\w+?)_Name\s*\[[^\]]*\]\s*\[[^\]]*\]\s*=\s*\{([\s\S]*?)\}\s*;/g)) {
    const P = m[1], names = strList(m[2]);
    const grab = (suffix) => { const r = new RegExp(`\\b${P}_${suffix}\\s*(?:\\[[^\\]]*\\])+\\s*=\\s*\\{([\\s\\S]*?)\\}\\s*;`); const x = masked.match(r); return x ? x[1] : ''; };
    const ai = rowsOf(grab('Ai')).map(r => r.map(Number)), aiF = rowsOf(grab('AiF')).map(r => r.map(Number));
    const pt = rowsOf(grab('Pt')).map(r => r.map(Number)), ptA = rowsOf(grab('PtA')).map(r => r.map(Number));
    const leg = rowsOf(grab('Leg')).map(r => r.map(Number)), act = rowsOf(grab('Act')).map(r => r.map(Number));
    const strs = strList(grab('Str'));
    const lookRows = rowsOf(grab('Look')).map(r => r.map(Number));
    // The area of a NPC that wanders inside one: the box of its street points
    const gnRows = rowsOf(grab('Gn')).map(r => r.map(Number));
    const gnBox = (g0, gc) => {
      const q = gnRows.slice(g0, g0 + gc);
      if (!q.length) return null;
      const xs = q.map(v => v[0]), ys = q.map(v => v[1]);
      return { x1: Math.min(...xs) - 5, y1: Math.min(...ys) - 5, x2: Math.max(...xs) + 5, y2: Math.max(...ys) + 5 };
    };
    // Map vehicles: Npc_X_Veh[n] = vehicleid (or = CreateVehicle(...))
    const vehAt = new Map();
    for (const [k, v] of vehVars) { const mm = k.match(new RegExp(`^${P}_Veh\\[(\\d+)\\]$`)); if (mm) vehAt.set(+mm[1], v); }
    const objAt = new Map();
    for (const [k, v] of objVars) { const mm = k.match(new RegExp(`^${P}_Obj\\[(\\d+)\\]$`)); if (mm) objAt.set(+mm[1], v); }
    const uidOf = (v, pre) => (v ? (v.uid || (v.uid = pre + Math.random().toString(36).slice(2, 10))) : '');
    const npcs = names.map((name, k) => {
      const r = ai[k] || [], f = aiF[k] || [], lk = lookRows[k] || [];
      const mode = MODE_BY[r[0]] || 'idle';
      const n = {
        name, mode, moveType: MOVE_BY[r[1]] || 'auto', loop: LOOP_BY[r[2]] || 'loop', onDamage: DMG_BY[r[5]] || 'none',
        respawn: (r[6] || 0) / 1000, rec: r[7] >= 0 ? strs[r[7]] || '' : '', recFromNpc: !!(r[8] & 1), recLoop: !!(r[8] & 2), recPreload: !!(r[8] & 4),
        // The same column is the distance of a NPC that follows and the range of the others
        look: !!r[9], chase: !!r[10], speed: f[0] > 0 ? f[0] * 10 : 0, range: mode === 'follow' ? undefined : f[1] || 20, followDist: mode === 'follow' ? f[1] || 2 : undefined, points: [],
        // Seen by the players: colour (its alpha FF = marker on the radar), chat bubble colour; lane of a driver (newer exports)
        color: Number.isFinite(lk[0]) ? ((lk[0] & 0xFFFFFF00) | 0xFF) >>> 0 : undefined, marker: Number.isFinite(lk[0]) ? (lk[0] & 0xFF) !== 0 : undefined,
        bubbleColor: Number.isFinite(lk[1]) ? lk[1] >>> 0 : undefined, lane: f[12],
        chaseMove: MOVE_BY[r[12]], returnMove: MOVE_BY[r[13]], giveUp: f[2], fleeDist: f[3], shootDist: f[4], followRange: f[5], dmgMult: f[6], wanderRadius: f[7], bubbleDist: f[8], fleeMove: MOVE_BY[r[14]], bubble: r[15] >= 0 ? strs[r[15]] || '' : '',
        startWhen: r[16] === 0 ? 'create' : 'seen', aimMove: r[17] === 1 ? 'walk' : 'stop', noAmmo: ['stay', 'melee', 'flee'][r[18]], meleeKind: ['normal', 'special', 'mix'][r[19]],
        meleeTime: r[20], chaseUpdate: r[23], shootDelay: r[24], fleeAlert: f[13], fleeWait: f[14],
        wanderLimit: f[7] > 0 ? 'radius' : r[22] > 0 ? 'area' : 'free', area: r[22] > 0 ? gnBox(r[21], r[22]) : null, smooth: f[9], meleeReach: f[11],
        aimAt: f[10] === undefined ? undefined : (f[10] > 0.3 ? 'head' : f[10] < -0.3 ? 'legs' : 'body'),
      };
      // Points: the legs in order, without the point that closes the loop
      if (r[3] >= 0 && r[4] > 0) {
        const idx = [];
        for (let l = r[3]; l < r[3] + r[4]; l++) { const [s, e] = leg[l] || []; for (let p = s; p <= e; p++) if (idx[idx.length - 1] !== p) idx.push(p); }
        const uniq = n.loop === 'loop' && idx.length > 2 ? idx.slice(0, -1) : idx;
        n.points = uniq.map(p => {
          const q = pt[p] || [0, 0, 0, 0.2], [a0, cnt] = ptA[p] || [0, 0];
          const acts = [];
          for (let i = a0; i < a0 + cnt; i++) {
            const row = act[i]; if (!row) continue;
            const def = NPC_ACTIONS[row[0] - 1]; if (!def) continue;
            const o = { t: def[0] };
            def[2].forEach(([key, kind], j) => {
              const v = row[j + 1];
              if (kind === 'veh') o[key] = uidOf(vehAt.get(v), 'v');
              else if (kind === 's' || kind === 'rec') o[key] = strs[v] || '';
              else if (kind === 'move') o[key] = MOVE_BY[v] || 'auto';
              else o[key] = v;
            });
            acts.push(o);
          }
          return { x: q[0], y: q[1], z: q[2], stop: q[3], acts };
        });
      }
      return { skin: 0, x: 0, y: 0, z: 0, rz: 0, health: 100, invulnerable: false, world: -1, anim: null, npc: n };
    });
    // Settings: the cases of the Setup function
    const sm = masked.match(new RegExp(`\\bstock\\s+${P}_Setup\\s*\\(\\s*k\\s*\\)\\s*\\{([\\s\\S]*?)\\n\\}`));
    if (sm) {
      const parts = sm[1].split(/\bcase\s+(\d+)\s*:/);
      for (let i = 1; i < parts.length; i += 2) {
        const t = npcs[+parts[i]]; if (!t) continue;
        for (const c of parts[i + 1].matchAll(/\b(NPC_\w+)\s*\(([^;]*)\)\s*;/g)) {
          const a = splitArgs(c[2]);
          if (a[1] && new RegExp(`^${P}_Veh\\[(\\d+)\\]$`).test(a[1].replace(/\s+/g, ''))) {
            const vi = +a[1].match(/\[(\d+)\]/)[1]; const v = vehAt.get(vi);
            if (v) { vehVars.set(`${P}_Veh[${vi}]`, v); }
          }
          applyCall(t, c[1], a, vehVars, objVars, P);
        }
      }
    }
    out.push(...npcs);
  }
  if (out.length) return out;
  // NPCs written by hand: id = NPC_Create("Name") and NPC_* calls on that variable
  const byVar = new Map();
  for (const m of masked.matchAll(/(?:new\s+)?([A-Za-z_@][\w@]*(?:\s*\[[^\]]*\])?)\s*=\s*NPC_Create\s*\(\s*"([^"]*)"\s*\)/g)) {
    const t = { skin: 0, x: 0, y: 0, z: 0, rz: 0, health: 100, invulnerable: false, world: -1, anim: null, npc: { name: m[2], mode: 'idle', points: [] } };
    byVar.set(m[1].replace(/\s+/g, ''), t);
    out.push(t);
  }
  if (!byVar.size) return out;
  for (const c of masked.matchAll(/\b(NPC_\w+)\s*\(([^;]*)\)\s*;/g)) {
    const a = splitArgs(c[2]);
    const t = byVar.get(String(a[0] || '').replace(/\s+/g, ''));
    if (t) applyCall(t, c[1], a, vehVars, objVars, '');
  }
  return out;
}

// ---------------------------------------------------------------------------  test server
// The side script of the test server: the exported NPC code of all the projects together, with the vehicles and objects the
// gamemode created (their ids come in server variables samsp_v<index> / samsp_o<index>)
export function npcTestScript(npcs, { vehIdx, objIdx, testVeh, testObj }) {
  const g = npcPawn(npcs, { id: 'Test', fmt: (v) => { const s = (+v).toFixed(5).replace(/0+$/, ''); return s.endsWith('.') ? s + '0' : s; }, vehIdx, objIdx });
  const L = ['#define FILTERSCRIPT', '#include <open.mp>', '', g.decl, '', g.code, ''];
  L.push('stock SAMSP_NpcIds()', '{');
  for (const [uid, k] of vehIdx) if (testVeh.has(uid)) L.push(`    Npc_Test_Veh[${k}] = GetSVarInt("samsp_v${testVeh.get(uid)}");`);
  for (const [uid, k] of objIdx) if (testObj.has(uid)) L.push(`    Npc_Test_Obj[${k}] = GetSVarInt("samsp_o${testObj.get(uid)}");`);
  L.push('    return 1;', '}', '');
  L.push('new bool:SAMSP_NpcStarted;');
  L.push('forward SAMSP_NpcStart();', 'public SAMSP_NpcStart()', '{', '    if (SAMSP_NpcStarted) return 1;', '    SAMSP_NpcStarted = true;', '    SAMSP_NpcIds();', '    Npc_Test_Load();', '    print("[SA Map Studio] NPCs: ' + npcs.length + '");', '    return 1;', '}', '');
  L.push('public OnFilterScriptInit()', '{', '    if (GetSVarInt("samsp_ready")) SAMSP_NpcStart();', '    return 1;', '}', '');
  L.push('public OnFilterScriptExit()', '{', '    Npc_Test_Unload();', '    return 1;', '}');
  return L.join('\n') + '\n';
}
