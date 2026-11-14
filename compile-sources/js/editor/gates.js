// Gates and doors: any object can open (to a second position and rotation) when the player presses a key or the
// vehicle horn near it, and close again on its own after a while. The closed position is the object's own one.
// Shared by the editor (inspector and test), the Pawn export and import, the test server and the singleplayer mod.

// The keys SA-MP lets a script read (OnPlayerKeyStateChange): constant, value, default key on the PC
export const GATE_MP_KEYS = [
  ['KEY_YES', 65536, 'Y'], ['KEY_NO', 131072, 'N'], ['KEY_CTRL_BACK', 262144, 'H'],
  ['KEY_ACTION', 1, 'Tab'], ['KEY_CROUCH', 2, 'C'], ['KEY_FIRE', 4, 'LMB'], ['KEY_SPRINT', 8, 'Space'],
  ['KEY_SECONDARY_ATTACK', 16, 'Enter / F'], ['KEY_JUMP', 32, 'Shift'], ['KEY_LOOK_RIGHT', 64, 'E'],
  ['KEY_HANDBRAKE', 128, 'RMB'], ['KEY_LOOK_LEFT', 256, 'Q'], ['KEY_SUBMISSION', 512, 'Num +'], ['KEY_WALK', 1024, 'Alt'],
  ['KEY_ANALOG_UP', 2048, 'Num 8'], ['KEY_ANALOG_DOWN', 4096, 'Num 2'], ['KEY_ANALOG_LEFT', 8192, 'Num 4'], ['KEY_ANALOG_RIGHT', 16384, 'Num 6'],
];
const KEY_ALIASES = { KEY_AIM: 'KEY_HANDBRAKE', KEY_LOOK_BEHIND: 'KEY_SUBMISSION', KEY_HORN: 'KEY_CROUCH' };
const MP_KEY = new Map(GATE_MP_KEYS.map(k => [k[0], k[1]]));
export const HORN_VALUE = 2; // KEY_HORN is KEY_CROUCH: the horn in a vehicle

// Singleplayer: the keyboard keys CLEO reads (0AB0, Windows virtual-key codes): letters and digits
export const GATE_SP_KEYS = [
  ...Array.from({ length: 26 }, (_, i) => [65 + i, String.fromCharCode(65 + i)]),
  ...Array.from({ length: 10 }, (_, i) => [48 + i, String(i)]),
];
const SP_KEY = new Set(GATE_SP_KEYS.map(k => k[0]));

const fin = (v, d) => (v !== undefined && v !== null && v !== '' && Number.isFinite(+v) ? +v : d);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export const GATE_DEFAULTS = { time: 2000, closeDelay: 5000, range: 10, key: 'KEY_YES', spKey: 89, trigger: 'key', sound: true };

// obj: the object the gate belongs to (its position is the closed one)
export function normalizeGate(g, obj = {}) {
  const key = KEY_ALIASES[g.key] || g.key;
  return {
    ox: fin(g.ox, +obj.x || 0), oy: fin(g.oy, +obj.y || 0), oz: fin(g.oz, +obj.z || 0),
    orx: fin(g.orx, +obj.rx || 0), ory: fin(g.ory, +obj.ry || 0), orz: fin(g.orz, +obj.rz || 0),
    time: clamp(Math.round(fin(g.time, GATE_DEFAULTS.time)), 100, 60000),
    closeDelay: clamp(Math.round(fin(g.closeDelay, GATE_DEFAULTS.closeDelay)), 0, 600000),
    range: clamp(fin(g.range, GATE_DEFAULTS.range), 1, 100),
    trigger: g.trigger === 'horn' ? 'horn' : 'key',
    key: MP_KEY.has(key) ? key : GATE_DEFAULTS.key,
    spKey: SP_KEY.has(+g.spKey) ? +g.spKey : GATE_DEFAULTS.spKey,
    sound: g.sound !== false && g.sound !== 0,
  };
}

// A new gate: opens sliding 5 m to the object's side
export function newGate(o) {
  const a = (o.rz || 0) * Math.PI / 180;
  return normalizeGate({ ox: o.x + Math.cos(a) * 5, oy: o.y + Math.sin(a) * 5, oz: o.z, orx: o.rx, ory: o.ry, orz: o.rz }, o);
}

// The open rotation written so a straight interpolation turns the short way (350 -> 10 becomes 350 -> 370)
const shortTo = (from, to) => from + ((((to - from) % 360) + 540) % 360 - 180);
export function gateOpenRot(o) {
  const g = o.gate;
  return { rx: shortTo(o.rx || 0, g.orx), ry: shortTo(o.ry || 0, g.ory), rz: shortTo(o.rz || 0, g.orz) };
}

// Where the gate is at t (0 = closed, 1 = open): position and rotation interpolated like MoveObject does
export function gatePose(o, t) {
  const g = o.gate, r = gateOpenRot(o);
  const l = (a, b) => a + (b - a) * t;
  return { x: l(o.x, g.ox), y: l(o.y, g.oy), z: l(o.z, g.oz), rx: l(o.rx || 0, r.rx), ry: l(o.ry || 0, r.ry), rz: l(o.rz || 0, r.rz) };
}

export const gateDistance = (o) => Math.hypot(o.gate.ox - o.x, o.gate.oy - o.y, o.gate.oz - o.z);
export const mpKeyValue = (o) => (o.gate.trigger === 'horn' ? HORN_VALUE : MP_KEY.get(o.gate.key) || 65536);
export const isGate = (o) => !!o.gate && !o.attach;

// ---------------------------------------------------------------------------  Pawn
export const gateIdent = (id) => `Gate_${id}`;
export const gateVar = (id, k) => `${gateIdent(id)}_Obj[${k}]`;

// The gate system for the export: settings, state and the functions that open and close.
// gates: the gate objects in export order; id: the map name for the identifiers; dynamic: streamer objects;
// center: subtracted from positions (relative export); fmt: number formatting.
export function gatePawn(gates, { id, dynamic, center, fmt, tr }) {
  if (!gates.length) return { decl: '', code: '', usage: [] };
  const G = gateIdent(id), n = gates.length;
  const move = dynamic ? 'MoveDynamicObject' : 'MoveObject';
  const getPos = dynamic ? 'GetDynamicObjectPos' : 'GetObjectPos';
  const L = [];
  L.push('// ================================================================');
  L.push(`// ${tr('Portões e portas: abrem com uma tecla ou com a buzina perto deles e fecham sozinhos.')}`);
  L.push(`// ${tr('Fica fora das funções, antes da que cria os objetos. Em OnPlayerKeyStateChange chame:')}`);
  L.push(`//   ${G}_Key(playerid, newkeys, oldkeys);`);
  L.push('// ================================================================');
  L.push('#if !defined KEY_HORN');
  L.push('    #define KEY_HORN KEY_CROUCH');
  L.push('#endif');
  L.push('');
  L.push('// Closed X, Y, Z, RX, RY, RZ, open X, Y, Z, RX, RY, RZ, speed, range');
  L.push(`stock const Float:${G}_Pos[${n}][14] = {`);
  gates.forEach((o, k) => {
    const g = o.gate, r = gateOpenRot(o);
    const dist = gateDistance(o);
    // MoveObject turns while it moves: a gate that only turns moves a millimetre so the turn takes its time
    const oz = dist < 0.001 ? g.oz + 0.001 : g.oz;
    const speed = Math.max(dist, 0.001) / (g.time / 1000);
    const v = [o.x - center.x, o.y - center.y, o.z - center.z, o.rx || 0, o.ry || 0, o.rz || 0,
      g.ox - center.x, g.oy - center.y, oz - center.z, r.rx, r.ry, r.rz].map(x => fmt(x));
    v.push(fmt(+speed.toFixed(4)), fmt(g.range));
    L.push(`    {${v.join(', ')}}${k < n - 1 ? ',' : ''}${o.comment ? ` // ${o.comment}` : ''}`);
  });
  L.push('};');
  L.push('// Key, horn (1 = only the driver, with the horn), move time (ms), close delay (ms), sound (1 = on)');
  L.push(`stock const ${G}_Cfg[${n}][5] = {`);
  gates.forEach((o, k) => {
    const g = o.gate;
    L.push(`    {_:${g.trigger === 'horn' ? 'KEY_HORN' : g.key}, ${g.trigger === 'horn' ? 1 : 0}, ${g.time}, ${g.closeDelay}, ${g.sound ? 1 : 0}}${k < n - 1 ? ',' : ''}`);
  });
  L.push('};');
  L.push(`stock ${dynamic ? 'STREAMER_TAG_OBJECT:' : ''}${G}_Obj[${n}];`);
  L.push(`stock ${G}_State[${n}]; // 0 closed, 1 opening, 2 open, 3 closing`);
  const decl = L.splice(0).join('\n');
  L.push(`stock ${G}_Key(playerid, {KEY, _}:newkeys, {KEY, _}:oldkeys)`);
  L.push('{');
  L.push(`    for (new i = 0; i < sizeof(${G}_Obj); i++)`);
  L.push('    {');
  L.push(`        if (${G}_State[i] != 0) continue; // only a closed gate opens`);
  L.push(`        new key = ${G}_Cfg[i][0];`);
  L.push('        if (!(_:newkeys & key) || (_:oldkeys & key)) continue;');
  L.push(`        if (${G}_Cfg[i][1] && GetPlayerState(playerid) != PLAYER_STATE_DRIVER) continue;`);
  L.push(`        if (!IsPlayerInRangeOfPoint(playerid, ${G}_Pos[i][13], ${G}_Pos[i][0], ${G}_Pos[i][1], ${G}_Pos[i][2])) continue;`);
  L.push(`        ${G}_Move(i, true);`);
  L.push('    }');
  L.push('    return 1;');
  L.push('}');
  L.push('');
  L.push(`stock ${G}_Move(gate, bool:open)`);
  L.push('{');
  L.push('    new p = open ? 6 : 0;');
  L.push(`    if (${G}_Cfg[gate][4]) ${G}_Sound(gate, 1153);`);
  L.push(`    ${G}_State[gate] = open ? 1 : 3;`);
  L.push(`    ${move}(${G}_Obj[gate], ${G}_Pos[gate][p], ${G}_Pos[gate][p + 1], ${G}_Pos[gate][p + 2], ${G}_Pos[gate][12], ${G}_Pos[gate][p + 3], ${G}_Pos[gate][p + 4], ${G}_Pos[gate][p + 5]);`);
  L.push(`    SetTimerEx("${G}_Arrive", ${G}_Cfg[gate][2], false, "i", gate);`);
  L.push('    return 1;');
  L.push('}');
  L.push('');
  L.push('// The sound plays where the gate is when it starts and when it stops');
  L.push(`stock ${G}_Sound(gate, soundid)`);
  L.push('{');
  L.push('    new Float:x, Float:y, Float:z;');
  L.push(`    ${getPos}(${G}_Obj[gate], x, y, z);`);
  L.push('    for (new p = 0; p < MAX_PLAYERS; p++)');
  L.push('    {');
  L.push('        if (IsPlayerConnected(p)) PlayerPlaySound(p, soundid, x, y, z);');
  L.push('    }');
  L.push('    return 1;');
  L.push('}');
  L.push('');
  L.push(`forward ${G}_Arrive(gate);`);
  L.push(`public ${G}_Arrive(gate)`);
  L.push('{');
  L.push(`    if (${G}_Cfg[gate][4]) ${G}_Sound(gate, 1154);`);
  L.push(`    if (${G}_State[gate] == 1)`);
  L.push('    {');
  L.push(`        ${G}_State[gate] = 2;`);
  L.push(`        SetTimerEx("${G}_Close", ${G}_Cfg[gate][3], false, "i", gate);`);
  L.push('    }');
  L.push(`    else ${G}_State[gate] = 0;`);
  L.push('    return 1;');
  L.push('}');
  L.push('');
  L.push(`forward ${G}_Close(gate);`);
  L.push(`public ${G}_Close(gate)`);
  L.push('{');
  L.push(`    if (${G}_State[gate] == 2) ${G}_Move(gate, false);`);
  L.push('    return 1;');
  L.push('}');
  return { decl, code: L.join('\n'), usage: [`OnPlayerKeyStateChange(): ${G}_Key(playerid, newkeys, oldkeys);`] };
}

// Import: reads the settings arrays of exported gates and gives the gate to the objects created into Gate_<id>_Obj[k].
// masked: the source with the comments blanked; vars: variable name -> imported object.
export function importGates(masked, vars) {
  const rows = (body) => [...body.matchAll(/\{([^{}]*)\}/g)].map(m => m[1].split(',').map(s => s.trim()));
  const cfgs = new Map();
  for (const m of masked.matchAll(/\b(Gate_\w+)_Cfg\s*\[[^\]]*\]\s*\[\s*5\s*\]\s*=\s*\{([\s\S]*?)\}\s*;/g)) cfgs.set(m[1], rows(m[2]));
  let count = 0;
  for (const m of masked.matchAll(/\b(Gate_\w+)_Pos\s*\[[^\]]*\]\s*\[\s*14\s*\]\s*=\s*\{([\s\S]*?)\}\s*;/g)) {
    const cfg = cfgs.get(m[1]) || [];
    rows(m[2]).forEach((p, k) => {
      const o = vars.get(`${m[1]}_Obj[${k}]`);
      if (!o || p.length < 14) return;
      const v = p.map(Number);
      const c = cfg[k] || [];
      const keyTok = String(c[0] || '').replace(/^_\s*:\s*/, '');
      const horn = +c[1] === 1 || keyTok === 'KEY_HORN';
      const byValue = GATE_MP_KEYS.find(x => x[1] === +keyTok);
      const dist = Math.hypot(v[6] - v[0], v[7] - v[1], v[8] - v[2]);
      o.gate = normalizeGate({
        ox: v[6] - v[0] + o.x, oy: v[7] - v[1] + o.y, oz: (dist <= 0.0011 ? v[2] : v[8]) - v[2] + o.z,
        orx: v[9], ory: v[10], orz: v[11], range: v[13],
        time: c[2] !== undefined ? +c[2] : (v[12] > 0 ? Math.max(dist, 0.001) / v[12] * 1000 : undefined),
        closeDelay: c[3], sound: c[4] === undefined ? true : +c[4] !== 0,
        trigger: horn ? 'horn' : 'key', key: horn ? undefined : byValue ? byValue[0] : keyTok,
      }, o);
      o.move = null;
      count++;
    });
  }
  return count;
}

// ---------------------------------------------------------------------------  test server (mapa.txt)
// K|object index|closed x|y|z|rx|ry|rz|open x|y|z|rx|ry|rz|move time|close delay|key value|horn|range|sound
export function gateTestLine(o, objIdx) {
  const g = o.gate, r = gateOpenRot(o);
  const p = [o.x, o.y, o.z].map(v => v.toFixed(5)).concat([o.rx || 0, o.ry || 0, o.rz || 0].map(v => v.toFixed(4)),
    [g.ox, g.oy, g.oz].map(v => v.toFixed(5)), [r.rx, r.ry, r.rz].map(v => v.toFixed(4)));
  return `K|${objIdx}|${p.join('|')}|${g.time}|${g.closeDelay}|${mpKeyValue(o)}|${g.trigger === 'horn' ? 1 : 0}|${g.range.toFixed(2)}|${g.sound ? 1 : 0}`;
}
