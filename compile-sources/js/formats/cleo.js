// A tiny assembler for CLEO scripts (.cs): raw SCM bytecode, no header. It only knows what the Singleplayer mod's script needs.
// Every instruction is: opcode (2 bytes), then its arguments, each with a type byte (1 = int32, 6 = float32, 3 = local variable).
// A jump goes to an absolute offset inside the file, written as a NEGATIVE int32 (that is how CLEO scripts tell it from the main script's).
import { WEAPONS, AMMO_WEAPONS, weaponModel } from '../world/spWeapons.js';

export const int = (v) => ({ t: 1, v });
export const flt = (v) => ({ t: 6, v });
export const lv = (i) => ({ t: 3, v: i });
export const ref = (name) => ({ ref: name });
// A text: up to 7 letters is the game's 8-byte text (type 9); a longer one is CLEO's own text (type 14: length, then the letters)
export const str = (s) => ({ s: String(s) });
// A text for the game's own opcodes (animations): up to 7 letters is type 9 (8 bytes), up to 15 is type 15 (16 bytes). Type 14 is only understood by CLEO's opcodes
export const strn = (s) => ({ s: String(s), native: true });

export class Asm {
  constructor() { this.items = []; }
  op(code, ...args) { this.items.push({ code, args }); return this; }
  label(name) { this.items.push({ label: name }); return this; }
  jump(name) { return this.op(0x0002, ref(name)); }

  build() {
    const size = (a) => (a.ref ? 5 : a.s !== undefined ? (a.s.length <= 7 ? 9 : a.native ? 17 : 2 + a.s.length) : a.t === 3 ? 3 : 5);
    const labels = new Map();
    let pos = 0;
    for (const it of this.items) {
      if (it.label) {
        if (labels.has(it.label)) throw new Error('dup_' + it.label); // a repeated name would send the jumps to the wrong place
        labels.set(it.label, pos);
        continue;
      }
      pos += 2 + it.args.reduce((n, a) => n + size(a), 0);
    }
    const out = new Uint8Array(pos);
    const dv = new DataView(out.buffer);
    let at = 0;
    for (const it of this.items) {
      if (it.label) continue;
      dv.setUint16(at, it.code, true); at += 2;
      for (const a of it.args) {
        if (a.ref) {
          if (!labels.has(a.ref)) throw new Error('label ' + a.ref);
          out[at++] = 1; dv.setInt32(at, -labels.get(a.ref), true); at += 4;
        } else if (a.s !== undefined) {
          if (a.s.length <= 7) { out[at++] = 9; for (let k = 0; k < 8; k++) out[at + k] = a.s.charCodeAt(k) & 0x7f || 0; at += 8; }
          else if (a.native) { if (a.s.length > 15) throw new Error('text'); out[at++] = 15; for (let k = 0; k < 16; k++) out[at + k] = a.s.charCodeAt(k) & 0x7f || 0; at += 16; }
          else { out[at++] = 14; out[at++] = a.s.length; for (let k = 0; k < a.s.length; k++) out[at++] = a.s.charCodeAt(k) & 0x7f; }
        } else if (a.t === 3) {
          out[at++] = 3; dv.setUint16(at, a.v, true); at += 2;
        } else if (a.t === 6) {
          out[at++] = 6; dv.setFloat32(at, a.v, true); at += 4;
        } else {
          out[at++] = 1; dv.setInt32(at, a.v, true); at += 4;
        }
      }
    }
    return out;
  }
}

// ---------------------------------------------------------------------------  things that exist only near the player
// Pickups, characters and moving objects are created when the player comes close (far from the player the map has no ground
// yet, and what is created there falls through the world). Each one keeps a few local variables (the first is its state).
// A script has 32 local variables: the last ones are shared by everything in it, the first ones go to the items.
const PLAYER = 31, T0 = 30, T1 = 29, T2 = 28, T3 = 27, T4 = 26, T5 = 25, T6 = 24;
const T7 = 23, T8 = 22, T9 = 21, T10 = 20; // only the actors scripts use these (their NPCs keep the variables below 20)
export const LOCALS_BUDGET = 24;

// Splits the items into scripts that fit the variables (`varsOf(item)` is how many each one keeps)
export function chunkByVars(items, varsOf, budget = LOCALS_BUDGET) {
  const out = [];
  let cur = [], used = 0;
  for (const e of items) {
    const n = varsOf(e);
    if (cur.length && used + n > budget) { out.push(cur); cur = []; used = 0; }
    cur.push(e); used += n;
  }
  if (cur.length) out.push(cur);
  return out;
}

// Plain letters only: the game's text takes no accents here
export const ascii = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\x20-\x7e]/g, '?');

// Waits until the game has a player to talk about (before that its handle means nothing)
function waitPlayer(a) {
  a.label('wp').op(0x0001, int(250));
  a.op(0x00D6, int(0)).op(0x0256, int(0)).op(0x004D, ref('wp'));
  a.op(0x01F5, int(0), lv(PLAYER));
}

// Waits (one tick at a time) until the model is in memory
function loadModel(a, model, tag) {
  a.op(0x0247, int(model));
  a.label('lm' + tag).op(0x0001, int(0));
  a.op(0x00D6, int(0)).op(0x0248, int(model)).op(0x004D, ref('lm' + tag));
}

// items: each one has x, y, z and `vars` (variables kept). spawn(a, e, i, base) creates it; manage(a, e, i, base) runs while it exists.
function nearScript(items, { radius, wait, spawn, manage, init, pre }) {
  const a = new Asm();
  a.op(0x0000);
  waitPlayer(a);
  let next = 0;
  for (const e of items) { e.base = next; next += e.vars; for (let k = 0; k < e.vars; k++) a.op(0x0006, lv(e.base + k), int(0)); }
  init?.(a);
  a.label('loop');
  a.op(0x0001, int(wait));
  pre?.(a);
  items.forEach((e, i) => {
    const base = e.base;
    a.op(0x00D6, int(0)).op(0x0039, lv(base), int(0)).op(0x004D, ref('m' + i));                // not created yet?
    a.op(0x00D6, int(0)).op(0x00FE, lv(PLAYER), flt(e.x), flt(e.y), flt(e.z), flt(radius), flt(radius), flt(radius), int(0)).op(0x004D, ref('n' + i)); // near?
    spawn(a, e, i, base);
    a.op(0x0006, lv(base), int(1));
    a.jump('n' + i);
    a.label('m' + i);
    if (manage) manage(a, e, i, base);
    a.label('n' + i);
  });
  a.jump('loop');
  return a.build();
}

// ---------------------------------------------------------------------------  what happens when a checkpoint or a pickup is used
// act: the action (see makeAction in project.js); x, y, z: where the item is. `id` makes the labels of this copy unique.
// T6 is left at 1 when the action happened and at 0 when it did not (the player could not pay).
function emitAction(a, act, x, y, z, id) {
  const u = (n) => n + id;
  const price = act.price | 0;
  if (price > 0) {
    a.op(0x010B, int(0), lv(T0));                                                              // the player's money
    a.op(0x00D6, int(0)).op(0x0019, lv(T0), int(price - 1)).op(0x004D, ref(u('poor')));
    a.op(0x0109, int(0), int(-price));
  }
  switch (act.type) {
    case 'health': a.op(0x0223, lv(PLAYER), int(act.amount || 100)); break;
    case 'armour': a.op(0x035F, lv(PLAYER), int(act.amount || 100)); break;
    case 'money': a.op(0x0109, int(0), int(act.amount | 0)); break;
    case 'weapon': {
      const model = weaponModel(act.weapon);
      if (model) loadModel(a, model, 'x' + id);
      a.op(0x01B2, lv(PLAYER), int(act.weapon), int(act.ammo));
      a.op(0x01B9, lv(PLAYER), int(act.weapon));
      if (model) a.op(0x0249, int(model));
      break;
    }
    case 'ammo':
      AMMO_WEAPONS.forEach((w, k) => {
        a.op(0x041A, lv(PLAYER), int(w), lv(T0));                                             // only what the player already has
        a.op(0x00D6, int(0)).op(0x0019, lv(T0), int(0)).op(0x004D, ref(u('am' + k)));
        a.op(0x0114, lv(PLAYER), int(w), int(500));
        a.label(u('am' + k));
      });
      break;
    case 'wanted':
      if (act.stars > 0) a.op(0x010D, int(0), int(act.stars)); else a.op(0x0110, int(0));
      break;
    case 'teleport':
      a.op(0x04E4, flt(act.x), flt(act.y));
      a.op(0x03CB, flt(act.x), flt(act.y), flt(act.z));
      a.op(0x00A1, lv(PLAYER), flt(act.x), flt(act.y), flt(act.z));
      a.op(0x0173, lv(PLAYER), flt(act.rot));
      a.op(0x04BB, int(0));
      a.op(0x0860, lv(PLAYER), int(0));
      break;
    case 'vehicle':
      loadModel(a, act.model, 'x' + id);
      a.op(0x00A5, int(act.model), flt(x), flt(y), flt(z + 1), lv(T1));
      a.op(0x036A, lv(PLAYER), lv(T1));
      a.op(0x01C3, lv(T1));
      a.op(0x0249, int(act.model));
      break;
    case 'repair':
      a.op(0x00D6, int(0)).op(0x00DF, lv(PLAYER)).op(0x004D, ref(u('end')));
      a.op(0x03C0, lv(PLAYER), lv(T1));
      a.op(0x0A30, lv(T1));
      break;
    case 'nitro':
      a.op(0x00D6, int(0)).op(0x00DF, lv(PLAYER)).op(0x004D, ref(u('end')));
      loadModel(a, 1010, 'x' + id);
      a.op(0x03C0, lv(PLAYER), lv(T1));
      a.op(0x06E7, lv(T1), int(1010), lv(T2));
      a.op(0x0249, int(1010));
      break;
    case 'jetpack': a.op(0x07A7, lv(PLAYER)); break;
    case 'save': a.op(0x03D8); break;
    case 'skin':
      loadModel(a, act.model, 'x' + id);
      a.op(0x09C7, int(0), int(act.model));
      a.op(0x0249, int(act.model));
      break;
    case 'weather':
      a.op(0x01B6, int(act.weather));
      a.op(0x01B7);
      break;
    case 'time': a.op(0x00C0, int(act.hour), int(act.minute)); break;
    case 'explosion': a.op(0x020C, flt(x), flt(y), flt(z), int(act.explosion)); break;
    default: break;                                                                              // none, message: only the text
  }
  a.label(u('end'));
  if (act.text) {
    // ~r~ ~g~ ~b~ ~y~ ~p~ ~w~ ~l~ ~s~ in the text change its color, as in SA-MP
    if (act.msgStyle === 'box') a.op(0x0ACA, str(ascii(act.text)));
    else a.op(0x0ACD, str(ascii(act.text)), int(4000));
  }
  a.op(0x0006, lv(T6), int(1));
  if (price > 0) {
    a.jump(u('paid'));
    a.label(u('poor'));
    a.op(0x0ACD, str('Dinheiro insuficiente'), int(3000));
    a.op(0x0006, lv(T6), int(0));
    a.label(u('paid'));
  }
}

// pickups: { model, type, x, y, z, action }. One with an action keeps the pickup, and gives it back some seconds after it was taken
export function pickupsScript(items) {
  const list = items.map(e => ({ ...e, vars: e.action && e.action.type !== 'none' ? 3 : 1 }));
  return nearScript(list, {
    radius: 150, wait: 250,
    spawn: (a, e, i, base) => {
      loadModel(a, e.model, 'p' + i);
      a.op(0x0213, int(e.model), int(e.type), flt(e.x), flt(e.y), flt(e.z), lv(base + 1));
      a.op(0x0249, int(e.model));                                                              // the model is not kept in memory
    },
    manage: (a, e, i, base) => {
      if (e.vars === 1) return;
      // state 1: waiting to be taken; state 3: taken, counting to come back (state 2: taken for good)
      a.op(0x00D6, int(0)).op(0x0039, lv(base), int(1)).op(0x004D, ref('t' + i));
      a.op(0x00D6, int(0)).op(0x0214, lv(base + 1)).op(0x004D, ref('n' + i));
      emitAction(a, e.action, e.x, e.y, e.z, 'p' + i);
      a.op(0x0215, lv(base + 1));
      a.op(0x00D6, int(0)).op(0x0039, lv(T6), int(0)).op(0x004D, ref('pk' + i));               // could not pay: the pickup stays
      loadModel(a, e.model, 'q' + i);
      a.op(0x0213, int(e.model), int(e.type), flt(e.x), flt(e.y), flt(e.z), lv(base + 1));
      a.op(0x0249, int(e.model));
      a.jump('n' + i);
      a.label('pk' + i);
      a.op(0x0006, lv(base), int(e.action.once ? 2 : 3)).op(0x0006, lv(base + 2), int(40));
      a.jump('n' + i);
      a.label('t' + i);
      a.op(0x00D6, int(0)).op(0x0039, lv(base), int(3)).op(0x004D, ref('n' + i));
      a.op(0x000E, lv(base + 2), int(1));
      a.op(0x00D6, int(0)).op(0x0019, lv(base + 2), int(0)).op(0x004D, ref('rb' + i));
      a.jump('n' + i);
      a.label('rb' + i);
      a.op(0x0006, lv(base), int(0));                                                           // near again: it appears again
    },
  });
}

// checkpoints: { x, y, z, radius, action }. The red cylinder of the missions of the game (a script sphere, the one the game draws for the
// places of its missions) with a point on the radar; with an action it happens when the player gets in.
// The game only draws 16 spheres at a time, so each one is made when the player is near (160 m) and removed when he goes away (220 m)
export function checkpointsScript(items) {
  const a = new Asm();
  a.op(0x0000);
  waitPlayer(a);
  let next = 0;
  items.forEach((e) => {
    e.base = next; next += 3;
    a.op(0x0006, lv(e.base), int(0)).op(0x0006, lv(e.base + 2), int(0));
    a.op(0x018A, flt(e.x), flt(e.y), flt(e.z), lv(e.base + 1));                                    // the point on the radar
    a.op(0x018B, lv(e.base + 1), int(2));
  });
  a.label('loop');
  a.op(0x0001, int(200));
  items.forEach((e, i) => {
    const base = e.base;
    // state 0: no sphere; 1: waiting for the player; 2: the player is inside; 3: used up
    a.op(0x00D6, int(0)).op(0x0039, lv(base), int(3)).op(0x004D, ref('t' + i));
    a.jump('n' + i);
    a.label('t' + i);
    a.op(0x00D6, int(0)).op(0x0039, lv(base), int(0)).op(0x004D, ref('m' + i));
    a.op(0x00D6, int(0)).op(0x00FE, lv(PLAYER), flt(e.x), flt(e.y), flt(e.z), flt(160), flt(160), flt(160), int(0)).op(0x004D, ref('n' + i));
    a.op(0x03BC, flt(e.x), flt(e.y), flt(e.z), flt(Math.max(0.5, e.radius)), lv(base + 2));
    a.op(0x0006, lv(base), int(1)).jump('n' + i);
    a.label('m' + i);
    // far away: the sphere goes
    a.op(0x00D6, int(0)).op(0x00FE, lv(PLAYER), flt(e.x), flt(e.y), flt(e.z), flt(220), flt(220), flt(220), int(0)).op(0x004D, ref('r' + i));
    a.jump('k' + i);
    a.label('r' + i);
    a.op(0x03BD, lv(base + 2));
    a.op(0x0006, lv(base), int(0)).jump('n' + i);
    a.label('k' + i);
    if (e.action && e.action.type !== 'none') {
      const r = Math.max(1, e.radius);
      a.op(0x00D6, int(0)).op(0x00FE, lv(PLAYER), flt(e.x), flt(e.y), flt(e.z), flt(r), flt(r), flt(Math.max(r, 3)), int(0)).op(0x004D, ref('o' + i));
      a.op(0x00D6, int(0)).op(0x0039, lv(base), int(1)).op(0x004D, ref('n' + i));              // already inside: nothing new
      emitAction(a, e.action, e.x, e.y, e.z, 'c' + i);
      a.op(0x00D6, int(0)).op(0x0039, lv(T6), int(0)).op(0x004D, ref('u' + i));
      a.jump('n' + i);                                                                           // could not pay: it tries again when the player comes back in
      a.label('u' + i);
      if (e.action.once) {
        a.op(0x0164, lv(base + 1));
        a.op(0x03BD, lv(base + 2));
        a.op(0x0006, lv(base), int(3));
      } else {
        a.op(0x0006, lv(base), int(2));
      }
      a.jump('n' + i);
      a.label('o' + i);
      a.op(0x00D6, int(0)).op(0x0039, lv(base), int(2)).op(0x004D, ref('n' + i));
      a.op(0x0006, lv(base), int(1));                                                           // went out: ready again
    }
    a.label('n' + i);
  });
  a.jump('loop');
  return a.build();
}

// actors: { skin, x, y, z, rz, invulnerable, weapon, role ('neutral', 'guard', 'enemy'), follow, respawn (seconds, 0 = stays dead), anim }
// variables: 0 state (1 there, 2 attacking, 3 going to the door the player used, 4 walking back to its place), 1 the character, 2 a counter,
// 3 who it is fighting (only for those that fight or follow)
const ENEMY_VARS = 100; // the shared variables (100 + enemy) where each enemy NPC of the mod leaves its character, so the protectors always know them
const TARGET_VARS = 400; // the shared variables (400 + guard) where each guard leaves who it is fighting: no more than two guards fight the same one
const PH_HEALTH = 1001, PH_ARMOUR = 1002, CHAOS_VAR = 1005, CHAOS_TIME = 1006; // the health and the armour the player had a moment ago
const GUARD_VARS = 700; // the shared variables of CLEO (0 to 1023) where the guards leave their characters
export const ACTORS_BUDGET = 20;

// A NPC that fights or follows keeps one more variable (who it is fighting). The ones that follow or chase also share variables with the door logic, so fewer fit in a script
export const npcVars = (e) => (e.role === 'guard' ? 5 : e.role !== 'neutral' && e.follow ? 4 : 3);
const TARGET_LIMIT = 15000; // a protector gives up a target it has not killed in this time (ms) and looks for another
// The slot of a weapon in the ped (the weapons of the ped are in an array by slot)
const weaponSlot = (w) => (w >= 22 && w <= 24 ? 2 : w >= 25 && w <= 27 ? 3 : w === 28 || w === 29 || w === 32 ? 4 : w === 30 || w === 31 ? 5 : w === 33 || w === 34 ? 6 : w >= 35 && w <= 38 ? 7 : 8);
export const npcTravels = (e) => e.role !== 'neutral' && !!e.follow;

// Plays the animation of the NPC (asking for it first and waiting until it is there, then letting go of it)
function playAnim(a, e, h, tag) {
  a.op(0x04ED, strn(e.anim.lib));
  a.label('aw' + tag).op(0x0001, int(0));
  a.op(0x00D6, int(0)).op(0x04EE, strn(e.anim.lib)).op(0x004D, ref('aw' + tag));
  a.op(0x0605, lv(h), strn(e.anim.name), strn(e.anim.lib), flt(e.anim.delta), int(e.anim.loop ? 1 : 0), int(e.anim.lockx ? 1 : 0), int(e.anim.locky ? 1 : 0), int(e.anim.freeze ? 1 : 0), int(e.anim.time | 0));
  a.op(0x04EF, strn(e.anim.lib));
}

export function actorsScript(items) {
  const list = items.map(e => ({ ...e, vars: npcVars(e) }));
  const guards = list.filter(e => e.role === 'guard');
  return nearScript(list, {
    radius: 120, wait: 125,
    // the player's coordinates
    pre: (a) => {
      a.op(0x00A0, lv(PLAYER), lv(T1), lv(T2), lv(T3));
    },
    spawn: (a, e, i, base) => {
      const h = base + 1;
      loadModel(a, e.skin, 'a' + i);
      a.op(0x009A, int(4), int(e.skin), flt(e.x), flt(e.y), flt(e.z), lv(h));                   // a civilian of that skin
      a.op(0x0249, int(e.skin));                                                                // the model is not kept in memory (the NPC holds it while it lives)
      a.op(0x0173, lv(h), flt(e.rz));
      if (e.invulnerable) a.op(0x02AB, lv(h), int(1), int(1), int(1), int(1), int(1));
      if (e.weapon) {
        const model = weaponModel(e.weapon);
        if (model) loadModel(a, model, 'w' + i);
        a.op(0x01B2, lv(h), int(e.weapon), int(e.ammoInfinite === false ? Math.max(1, e.ammo | 0 || 100) : 3000));
        a.op(0x01B9, lv(h), int(e.weapon));
        if (model) a.op(0x0249, int(model));
      }
      if (e.role === 'neutral') {
        a.op(0x0350, lv(h), int(1));                                                            // it stays in its place when attacked
        a.op(0x0688, lv(h), int(0), int(0), int(0));                                            // and does not look for threats
      } else {
        a.op(0x02E2, lv(h), int(e.role === 'guard' ? 100 : 80));                                // aim (the protectors never miss on purpose)
        a.op(0x07DD, lv(h), int(e.role === 'guard' ? 100 : 70));                                // how often it shoots
      }
      if (e.role !== 'neutral' && e.follow) a.op(0x0588, lv(h), int(1));                        // the ground stays loaded around it, wherever it walks
      if (e.role === 'guard' && e.gid >= 0) a.op(0x0AB3, int(GUARD_VARS + e.gid), lv(h));        // so the other guards know it is an ally
      if (e.role === 'guard' && e.gid >= 0) a.op(0x0AB3, int(TARGET_VARS + e.gid), int(0));
      if (e.role === 'enemy' && e.eid >= 0) a.op(0x0AB3, int(ENEMY_VARS + e.eid), lv(h));
      if (!e.weapon && e.anim) playAnim(a, e, h, 's' + i);
    },
    manage: (a, e, i, base) => {
      const st = base, h = base + 1, cnt = base + 2, tgt = base + 3, tt = base + 4, done = 'n' + i;
      const travel = e.role === 'guard' && !!e.follow;
      // goes to where the player is, running (6) or sprinting (7): TASK_GOTO_CHAR has no speed, so this one is used (the player's coordinates are in T1..T3)
      // Each protector has its own place around the player (a ring of 5 m or more, by its number), so they never pile up on the same point
      const gnum = Math.max(0, e.gid | 0), ring = 5 + 2 * Math.floor(gnum / 10), ang = gnum * 0.6283;
      const sdx = +(ring * Math.cos(ang)).toFixed(2), sdy = +(ring * Math.sin(ang)).toFixed(2);
      const slot = () => a.op(0x04C4, lv(PLAYER), flt(sdx), flt(sdy), flt(0), lv(T4), lv(T5), lv(T6));
      const speed = int(e.runFast === false ? 6 : 7);
      // A target that other protectors are already on (more than `limit` of them) goes to blocked; the candidate is in T4. The scan counter T5 is kept in cnt meanwhile
      const capCheck = (pre, blocked, limit) => {
        if (limit < 0 || !(e.gid >= 0 && e.guardTotal > 1)) return;
        a.op(0x0085, lv(cnt), lv(T5));
        a.op(0x0006, lv(T0), int(0)).op(0x0006, lv(T6), int(0));
        a.label(L(pre + 'cl'));
        a.op(0x00D6, int(0)).op(0x001B, int(e.guardTotal), lv(T6)).op(0x004D, ref(L(pre + 'cm')));
        a.op(0x00D6, int(0)).op(0x0039, lv(T6), int(e.gid)).op(0x004D, ref(L(pre + 'cj')));
        a.jump(L(pre + 'cx'));
        a.label(L(pre + 'cj'));
        a.op(0x0A8E, int(TARGET_VARS), lv(T6), lv(T5));
        a.op(0x0AB4, lv(T5), lv(T5));
        a.op(0x00D6, int(0)).op(0x0039, lv(T5), lv(T4)).op(0x004D, ref(L(pre + 'cx')));
        a.op(0x000A, lv(T0), int(1));
        a.label(L(pre + 'cx'));
        a.op(0x000A, lv(T6), int(1));
        a.jump(L(pre + 'cl'));
        a.label(L(pre + 'cm'));
        a.op(0x0085, lv(T5), lv(cnt));
        a.op(0x0006, lv(cnt), int(0));
        a.op(0x00D6, int(0)).op(0x0019, lv(T0), int(limit)).op(0x004D, ref(L(pre + 'ck')));
        a.jump(blocked);
        a.label(L(pre + 'ck'));
      };
      // The protector only goes for what it can hit: the line between it and the candidate in T4 (buildings and objects, not cars or peds)
      // must be clear, or it goes to `blocked`. Uses T0, T6 and T7 to T10
      const losCheck = (blocked) => {
        a.op(0x00A0, lv(h), lv(T0), lv(T6), lv(T7));
        a.op(0x00A0, lv(T4), lv(T8), lv(T9), lv(T10));
        a.op(0x00D6, int(0)).op(0x06BD, lv(T0), lv(T6), lv(T7), lv(T8), lv(T9), lv(T10), int(1), int(0), int(0), int(1), int(0)).op(0x004D, ref(blocked));
      };
      // A target inside a vehicle is only attacked with a weapon that shoots and still has ammunition, never when the vehicle is already destroyed
      // (nothing to hit) and never when it is a tank (Rhino) unless the weapon is a rocket launcher; otherwise it is ignored and another one is looked for
      const weaponInfo = WEAPONS.find(w => w.id === e.weapon);
      const ranged = !!e.weapon && !!weaponInfo && !weaponInfo.melee;
      const antiTank = e.weapon === 35 || e.weapon === 36;
      const wreckCheck = (v, pre, blocked) => {
        a.op(0x00D6, int(0)).op(0x00DF, lv(v)).op(0x004D, ref(L(pre)));
        if (!ranged) {
          a.jump(blocked);
          a.label(L(pre));
          return;
        }
        a.op(0x03C0, lv(v), lv(T0));
        a.op(0x00D6, int(0)).op(0x0119, lv(T0)).op(0x004D, ref(L(pre + 'a')));
        a.jump(blocked);
        a.label(L(pre + 'a'));
        a.op(0x041A, lv(h), int(e.weapon), lv(T6));
        a.op(0x00D6, int(0)).op(0x0019, lv(T6), int(0)).op(0x004D, ref(blocked));
        if (!antiTank) {
          a.op(0x00D6, int(0)).op(0x0137, lv(T0), int(432)).op(0x004D, ref(L(pre)));
          a.jump(blocked);
        }
        a.label(L(pre));
      };
      const runTo = (ms = 4000) => {
        if (e.role === 'guard') {
          slot();
          a.op(0x05D3, lv(h), lv(T4), lv(T5), lv(T6), speed, int(ms));
        } else {
          a.op(0x05D3, lv(h), lv(T1), lv(T2), lv(T3), speed, int(ms));
        }
      };
      const L = (n) => n + i;
      // dead: it stays dead, or comes back after the time asked for
      a.op(0x00D6, int(0)).op(0x0118, lv(h)).op(0x004D, ref(L('av')));
      if (e.role === 'guard' && e.gid >= 0) a.op(0x0AB3, int(TARGET_VARS + e.gid), int(0));
      if (e.respawn > 0 && !e.invulnerable) {
        a.op(0x000A, lv(cnt), int(1));
        a.op(0x00D6, int(0)).op(0x0019, lv(cnt), int(Math.round(e.respawn * 8))).op(0x004D, ref(done));
        a.op(0x009B, lv(h));
        a.op(0x0006, lv(st), int(0)).op(0x0006, lv(cnt), int(0));
        if (npcVars(e) >= 4) a.op(0x0006, lv(tgt), int(0));
        if (e.role === 'guard') a.op(0x0006, lv(tt), int(0));
      }
      a.jump(done);
      a.label(L('av'));
      if (e.role === 'guard') {
        // The chaos counter (what the protectors did) goes down 8 every 5 seconds, and goes back to zero when the game has cleared the stars
        a.op(0x01BD, lv(T4));
        a.op(0x0AB4, int(CHAOS_TIME), lv(T5));
        a.op(0x00D6, int(0)).op(0x0019, lv(T5), int(0)).op(0x004D, ref(L('ct')));
        a.op(0x0A8F, lv(T4), lv(T5), lv(T6));
        a.op(0x00D6, int(0)).op(0x0019, lv(T6), int(4999)).op(0x004D, ref(L('cu')));
        a.op(0x0AB4, int(CHAOS_VAR), lv(T6));
        a.op(0x0A8F, lv(T6), int(8), lv(T6));
        a.op(0x00D6, int(0)).op(0x0019, lv(T6), int(-1)).op(0x004D, ref(L('cz')));
        a.jump(L('cy'));
        a.label(L('cz'));
        a.op(0x0006, lv(T6), int(0));
        a.label(L('cy'));
        a.op(0x01C0, int(0), lv(T5));
        a.op(0x00D6, int(0)).op(0x0039, lv(T5), int(0)).op(0x004D, ref(L('cx')));
        a.op(0x00D6, int(0)).op(0x0019, lv(T6), int(49)).op(0x004D, ref(L('cx')));
        a.op(0x0006, lv(T6), int(0));
        a.label(L('cx'));
        a.op(0x0AB3, int(CHAOS_VAR), lv(T6));
        a.label(L('ct'));
        a.op(0x0AB3, int(CHAOS_TIME), lv(T4));
        a.label(L('cu'));
        // The player is never hurt by a protector: what it did to him is undone (health and armour as they were a moment ago)
        a.op(0x0226, lv(PLAYER), lv(T0));
        a.op(0x04DD, lv(PLAYER), lv(T6));
        a.op(0x00D6, int(0)).op(0x051A, lv(PLAYER), lv(h)).op(0x004D, ref(L('ps')));
        a.op(0x0AB4, int(PH_HEALTH), lv(T4));
        a.op(0x0AB4, int(PH_ARMOUR), lv(T5));
        a.op(0x00D6, int(0)).op(0x0019, lv(T4), int(0)).op(0x004D, ref(L('pa')));
        a.op(0x0223, lv(PLAYER), lv(T4));
        a.op(0x0085, lv(T0), lv(T4));
        a.label(L('pa'));
        a.op(0x00D6, int(0)).op(0x001D, lv(T5), lv(T6)).op(0x004D, ref(L('pc')));
        a.op(0x0085, lv(T4), lv(T6));
        a.op(0x0085, lv(T6), lv(T5));
        a.op(0x0A8F, lv(T5), lv(T4), lv(T5));
        a.op(0x035F, lv(PLAYER), lv(T5));
        a.label(L('pc'));
        a.op(0x054E, lv(PLAYER));
        a.label(L('ps'));
        a.op(0x0AB3, int(PH_HEALTH), lv(T0));
        a.op(0x0AB3, int(PH_ARMOUR), lv(T6));
        // The player's car goes through the protectors: while he drives, the car moves and this one is on foot within 8 m of him, it has no collision
        // and is held where it is (so it does not fall through the ground); in any other case it is normal again
        a.op(0x00D6, int(0)).op(0x00DF, lv(PLAYER)).op(0x004D, ref(L('wr')));
        a.op(0x00D6, int(0)).op(0x80DF, lv(h)).op(0x004D, ref(L('wr')));
        a.op(0x03C0, lv(PLAYER), lv(T0));
        a.op(0x02E3, lv(T0), lv(T6));
        a.op(0x00D6, int(0)).op(0x0021, lv(T6), flt(1.5)).op(0x004D, ref(L('wr')));
        a.op(0x00D6, int(0)).op(0x00FE, lv(h), lv(T1), lv(T2), lv(T3), flt(8), flt(8), flt(8), int(0)).op(0x004D, ref(L('wr')));
        a.op(0x0619, lv(h), int(0));
        a.op(0x0575, lv(h), int(1));
        a.jump(L('wd'));
        a.label(L('wr'));
        a.op(0x0575, lv(h), int(0));
        a.op(0x0619, lv(h), int(1));
        a.label(L('wd'));
      }
      if (e.weapon && e.ammoInfinite === false && !WEAPONS.find(w => w.id === e.weapon)?.melee) {
        // finite ammunition: when it runs out the weapon is thrown away and the NPC fights with its hands
        a.op(0x041A, lv(h), int(e.weapon), lv(T0));
        a.op(0x00D6, int(0)).op(0x0019, lv(T0), int(0)).op(0x004D, ref(L('am1')));
        a.jump(L('am2'));
        a.label(L('am1'));
        a.op(0x0555, lv(h), int(e.weapon));
        a.label(L('am2'));
      }
      // an endless supply of ammunition
      if (e.weapon && e.ammoInfinite !== false && !WEAPONS.find(w => w.id === e.weapon)?.melee) {
        a.op(0x041A, lv(h), int(e.weapon), lv(T0));
        a.op(0x00D6, int(0)).op(0x8019, lv(T0), int(300)).op(0x004D, ref(L('ok')));
        a.op(0x0114, lv(h), int(e.weapon), int(3000));
        a.label(L('ok'));
        // and the magazine never runs out: it is filled again in the memory of the ped (no reloading)
        a.op(0x0A96, lv(h), lv(T0));
        a.op(0x0A8E, lv(T0), int(0x5A0 + weaponSlot(e.weapon) * 28 + 8), lv(T0));
        a.op(0x0A8C, lv(T0), int(4), int(99), int(0));
      }
      // an invulnerable NPC makes the car it is in invulnerable too
      if (e.invulnerable) {
        a.op(0x00D6, int(0)).op(0x00DF, lv(h)).op(0x004D, ref(L('ni')));
        a.op(0x03C0, lv(h), lv(T0));
        a.op(0x02AC, lv(T0), int(1), int(1), int(1), int(1), int(1));
        a.op(0x03F5, lv(T0), int(0));
        a.op(0x053F, lv(T0), int(0));
        a.op(0x0224, lv(T0), int(1000));
        a.label(L('ni'));
      }
      if (travel) {
        // Only the protectors: beyond 100 m from the player (3 seconds), more than 20 m (8 seconds: it is stuck behind something) or in another area of
        // the game (he went into an interior, or came out): it appears next to him
        // Not during a cutscene or a scripted scene (the player has no control) nor while the screen fades: nobody is taken anywhere
        a.op(0x00D6, int(0)).op(0x09E7, int(0)).op(0x004D, ref(L('fn')));
        a.op(0x00D6, int(0)).op(0x016B).op(0x004D, ref(L('fz')));
        a.jump(L('fn'));
        a.label(L('fz'));
        a.op(0x09E8, lv(PLAYER), lv(T0));
        a.op(0x09E8, lv(h), lv(T6));
        // Fighting (and in the same area as the player): it keeps fighting wherever the fight goes; it is not taken to the player until it is free
        a.op(0x00D6, int(0)).op(0x0039, lv(T0), lv(T6)).op(0x004D, ref(L('fq')));
        a.op(0x00D6, int(0)).op(0x0039, lv(tgt), int(0)).op(0x004D, ref(L('fn')));
        a.label(L('fq'));
        a.op(0x00D6, int(0)).op(0x0039, lv(T0), lv(T6)).op(0x004D, ref(L('fa')));
        a.op(0x00D6, int(0)).op(0x00FE, lv(h), lv(T1), lv(T2), lv(T3), flt(20), flt(20), flt(20), int(0)).op(0x004D, ref(L('fa')));
        a.op(0x00D6, int(0)).op(0x0039, lv(st), int(3)).op(0x004D, ref(L('fn')));                // near, and was not waiting: nothing to do
        a.op(0x0006, lv(st), int(1)).op(0x0006, lv(cnt), int(0));                                // it got near by itself
        a.jump(L('fn'));
        a.label(L('fa'));
        if (e.gid >= 0) a.op(0x0AB3, int(TARGET_VARS + e.gid), int(0));
        a.op(0x00D6, int(0)).op(0x0039, lv(st), int(3)).op(0x004D, ref(L('fs')));
        a.op(0x000A, lv(cnt), int(1));
        a.op(0x00D6, int(0)).op(0x00FE, lv(h), lv(T1), lv(T2), lv(T3), flt(100), flt(100), flt(100), int(0)).op(0x004D, ref(L('fb')));
        a.op(0x00D6, int(0)).op(0x0019, lv(cnt), int(63)).op(0x004D, ref(done));                 // between 20 and 100 m: eight seconds
        a.jump(L('fc'));
        a.label(L('fb'));
        a.op(0x00D6, int(0)).op(0x0019, lv(cnt), int(23)).op(0x004D, ref(done));                 // beyond 100 m: three seconds
        a.label(L('fc'));
        a.op(0x04C4, lv(PLAYER), flt(0), flt(-2.5), flt(0), lv(T4), lv(T5), lv(T6));                // all of them at the same point, behind the player
        a.op(0x09E8, lv(PLAYER), lv(T0));
        a.op(0x0860, lv(h), lv(T0));
        a.op(0x00A1, lv(h), lv(T4), lv(T5), lv(T6));
        a.op(0x0687, lv(h));
        a.op(0x0006, lv(st), int(1)).op(0x0006, lv(cnt), int(0));
        if (npcVars(e) >= 4) a.op(0x0006, lv(tgt), int(0));
        if (e.role === 'guard') {
          a.op(0x0006, lv(tt), int(0));                                                          // the teleport is a reset: no target, no mark
          if (e.gid >= 0) a.op(0x0AB3, int(TARGET_VARS + e.gid), int(0));
        }
        a.jump(done);
        a.label(L('fs'));
        a.op(0x0006, lv(st), int(3)).op(0x0006, lv(cnt), int(0));                                // starts waiting; meanwhile it goes to the player
        runTo(9000);
        a.jump(done);
        a.label(L('fn'));
      }
      if (e.role === 'guard') {
        // First priority: a police helicopter (Police Maverick) within 60 m of the player while he is wanted. It lets go of any target it had and
        // shoots at the helicopter itself (they have no pilot). Only with a weapon that shoots and has ammunition. The order is given once a second,
        // not at every cycle (it would turn round all the time and never shoot)
        if (ranged) {
          a.op(0x00D6, int(0)).op(0x010F, int(0), int(0)).op(0x004D, ref(L('hk')));
          a.op(0x041A, lv(h), int(e.weapon), lv(T6));
          a.op(0x00D6, int(0)).op(0x0019, lv(T6), int(0)).op(0x004D, ref(L('hk')));
          a.op(0x0006, lv(T5), int(0));
          a.label(L('hs'));
          a.op(0x00D6, int(0)).op(0x001B, int(30), lv(T5)).op(0x004D, ref(L('hk')));
          a.op(0x00D6, int(0)).op(0x0AE2, lv(T1), lv(T2), lv(T3), flt(60), lv(T5), int(1), lv(T4)).op(0x004D, ref(L('hk')));
          a.op(0x00D6, int(0)).op(0x0137, lv(T4), int(497)).op(0x004D, ref(L('hn')));
          a.op(0x0006, lv(tgt), int(0)).op(0x0006, lv(tt), int(0));
          if (e.gid >= 0) a.op(0x0AB3, int(TARGET_VARS + e.gid), int(0));
          a.op(0x000A, lv(cnt), int(1));
          a.op(0x00D6, int(0)).op(0x0019, lv(cnt), int(8)).op(0x004D, ref(done));
          a.op(0x0006, lv(cnt), int(0));
          a.op(0x00AA, lv(T4), lv(T0), lv(T6), lv(T5));
          a.op(0x0668, lv(h), lv(T0), lv(T6), lv(T5), int(1500));
          a.jump(done);
          a.label(L('hn'));
          a.op(0x000A, lv(T5), int(1));
          a.jump(L('hs'));
          a.label(L('hk'));
        }
        // Whoever the game has against the player: someone who hurt him, who is shooting, or who has seen him armed (up to sixteen peds a time, one after the other)
        a.op(0x00D6, int(0)).op(0x0039, lv(tgt), int(0)).op(0x004D, ref(L('gy')));
        a.jump(L('gz'));                                                                         // not fighting
        a.label(L('gy'));
        // the enemy may be gone from the game (a dead ped is removed): an old handle must never reach another opcode
        a.op(0x00D6, int(0)).op(0x056D, lv(tgt)).op(0x004D, ref(L('gq')));
        a.op(0x00D6, int(0)).op(0x0118, lv(tgt)).op(0x004D, ref(L('gy2')));
        // it killed it: one more kill of the player in the statistics
        a.op(0x00D6, int(0)).op(0x051A, lv(tgt), lv(h)).op(0x004D, ref(L('gq')));
        a.op(0x0623, int(121), int(1));
        // and the chaos of the player grows as if he had done it: 150 for a cop, 20 for anyone else. The game's own chaos is not written
        // (that crashed the game): the script keeps a chaos counter (shared variable) and, with the same thresholds the game uses for each star
        // (50, 180, 550, 1200, 2400, 4600), raises the wanted level to what that chaos is worth, never lowering it
        a.op(0x089F, lv(tgt), lv(T6));
        a.op(0x00D6, int(0)).op(0x0039, lv(T6), int(6)).op(0x004D, ref(L('cn')));
        a.op(0x0006, lv(T6), int(150));
        a.jump(L('ck'));
        a.label(L('cn'));
        a.op(0x0006, lv(T6), int(20));
        a.label(L('ck'));
        a.op(0x0AB4, int(CHAOS_VAR), lv(T4));
        a.op(0x0A8E, lv(T4), lv(T6), lv(T4));
        a.op(0x0AB3, int(CHAOS_VAR), lv(T4));
        a.op(0x0006, lv(T5), int(0));
        [[50, 1], [180, 2], [550, 3], [1200, 4], [2400, 5], [4600, 6]].forEach(([th, lvl], k) => {
          a.op(0x00D6, int(0)).op(0x0019, lv(T4), int(th - 1)).op(0x004D, ref(L('cs' + k)));
          a.op(0x0006, lv(T5), int(lvl));
          a.label(L('cs' + k));
        });
        a.op(0x00D6, int(0)).op(0x0019, lv(T5), int(0)).op(0x004D, ref(L('gq')));
        a.op(0x010E, int(0), lv(T5));
        a.label(L('gq'));
        a.op(0x0006, lv(tt), int(0));
        a.op(0x0006, lv(tgt), int(0));                                                           // its enemy died (or went away): free again, and it follows the player again
        a.jump(L('gz'));
        a.label(L('gy2'));
        a.op(0x00D6, int(0)).op(0x00FE, lv(tgt), lv(T1), lv(T2), lv(T3), flt(150), flt(150), flt(150), int(0)).op(0x004D, ref(L('gq')));   // far from the player: free again
        a.label(L('gz'));
        a.op(0x00D6, int(0)).op(0x0039, lv(tgt), int(0)).op(0x004D, ref(L('gv')));               // fighting: only while it can be hit
        a.jump(L('gw'));
        a.label(L('gv'));
        wreckCheck(tgt, 'gvk', L('gr'));
        a.op(0x00A0, lv(h), lv(T0), lv(T6), lv(T7));
        a.op(0x00A0, lv(tgt), lv(T8), lv(T9), lv(T10));
        a.op(0x00D6, int(0)).op(0x06BD, lv(T0), lv(T6), lv(T7), lv(T8), lv(T9), lv(T10), int(1), int(0), int(0), int(1), int(0)).op(0x004D, ref(L('gr')));
        a.jump(L('gd'));                                                                          // visible: it keeps fighting, no new search
        a.label(L('gr'));
        a.op(0x0006, lv(tt), int(0));
        a.op(0x0006, lv(tgt), int(0));                                                           // behind a wall or an object: it lets it go and looks for another
        a.label(L('gw'));
        // Two passes: first the targets that no other protector is on (so they spread over the enemies), then any target (nobody stays still
        // while there is an enemy; they all go to the same one if there is only one)
        const searchPass = (P, limit, endLabel) => {
          if (e.enemyTotal > 0) {
            // The enemy NPCs of the mod are always known (they do not have to be shooting at that moment): the first one near the player that is not
            // already fought by two protectors
            a.op(0x0006, lv(T5), int(0));
            a.label(L(P + 'ys'));
            a.op(0x00D6, int(0)).op(0x001B, int(e.enemyTotal), lv(T5)).op(0x004D, ref(L(P + 'yd')));
            a.op(0x0A8E, int(ENEMY_VARS), lv(T5), lv(T4));
            a.op(0x0AB4, lv(T4), lv(T4));
            a.op(0x00D6, int(0)).op(0x0019, lv(T4), int(0)).op(0x004D, ref(L(P + 'yn')));
            a.op(0x00D6, int(0)).op(0x056D, lv(T4)).op(0x004D, ref(L(P + 'yn')));
            a.op(0x00D6, int(0)).op(0x0118, lv(T4)).op(0x004D, ref(L(P + 'ya')));
            a.jump(L(P + 'yn'));
            a.label(L(P + 'ya'));
            a.op(0x00D6, int(0)).op(0x00FE, lv(T4), lv(T1), lv(T2), lv(T3), flt(80), flt(80), flt(80), int(0)).op(0x004D, ref(L(P + 'yn')));
            wreckCheck(T4, P + 'ywk', L(P + 'yn'));
            losCheck(L(P + 'yn'));
            capCheck(P + 'y', L(P + 'yn'), limit);
            a.op(0x00D6, int(0)).op(0x00DF, lv(T4)).op(0x004D, ref(L(P + 'yp')));
            a.op(0x074D, lv(h), lv(T4), int(1500));
            a.op(0x0085, lv(tgt), lv(T4));
            a.jump(L('gd'));
            a.label(L(P + 'yp'));
            a.op(0x05E2, lv(h), lv(T4));
            a.op(0x0085, lv(tgt), lv(T4));
            a.jump(L('gd'));
            a.label(L(P + 'yn'));
            a.op(0x000A, lv(T5), int(1));
            a.jump(L(P + 'ys'));
            a.label(L(P + 'yd'));
          }
          a.op(0x0006, lv(T5), int(0));
          a.label(L(P + 'gs'));
          a.op(0x00D6, int(0)).op(0x001B, int(48), lv(T5)).op(0x004D, ref(endLabel));               // tried enough
          a.op(0x00D6, int(0)).op(0x0AE1, lv(T1), lv(T2), lv(T3), flt(90), lv(T5), int(1), lv(T4)).op(0x004D, ref(endLabel));   // the next ped (the first time from the start)
          a.op(0x00D6, int(0)).op(0x0039, lv(T4), lv(h)).op(0x004D, ref(L(P + 'g1')));
          a.jump(L(P + 'gn'));
          a.label(L(P + 'g1'));
          // not an ally: every guard of the mod (in any script) wrote its character in the shared variables of CLEO
          if (e.guardTotal > 0) {
            a.op(0x0006, lv(T6), int(0));
            a.label(L(P + 'ga'));
            a.op(0x00D6, int(0)).op(0x001B, int(e.guardTotal), lv(T6)).op(0x004D, ref(L(P + 'gk')));
            a.op(0x0A8E, int(GUARD_VARS), lv(T6), lv(T0));
            a.op(0x0AB4, lv(T0), lv(T0));
            a.op(0x00D6, int(0)).op(0x0039, lv(T4), lv(T0)).op(0x004D, ref(L(P + 'gb')));
            a.jump(L(P + 'gn'));
            a.label(L(P + 'gb'));
            a.op(0x000A, lv(T6), int(1));
            a.jump(L(P + 'ga'));
            a.label(L(P + 'gk'));
          }
          // A character of the story (the ped types the game gives to the characters of its missions, 23 to 31) is never a target, unless it
          // has hurt the player
          a.op(0x089F, lv(T4), lv(T6));
          a.op(0x00D6, int(0)).op(0x0019, lv(T6), int(22)).op(0x004D, ref(L(P + 'gso')));
          a.op(0x00D6, int(0)).op(0x051A, lv(PLAYER), lv(T4)).op(0x004D, ref(L(P + 'gn')));
          a.label(L(P + 'gso'));
          a.op(0x00D6, int(0)).op(0x051A, lv(PLAYER), lv(T4)).op(0x004D, ref(L(P + 'g2')));            // it hurt the player
          a.jump(L(P + 'gf'));
          a.label(L(P + 'g2'));
          a.op(0x00D6, int(0)).op(0x02E0, lv(T4)).op(0x004D, ref(L(P + 'g3')));                         // it is shooting
          a.jump(L(P + 'gf'));
          a.label(L(P + 'g3'));
          a.op(0x089F, lv(T4), lv(T6));                                                              // a cop: against the player only while he is wanted
          a.op(0x00D6, int(0)).op(0x0039, lv(T6), int(6)).op(0x004D, ref(L(P + 'gn')));
          a.op(0x00D6, int(0)).op(0x010F, int(0), int(0)).op(0x004D, ref(L(P + 'gn')));
          a.label(L(P + 'gf'));
          wreckCheck(T4, P + 'gwk', L(P + 'gn'));
          losCheck(L(P + 'gn'));
          capCheck(P + 'g', L(P + 'gn'), limit);
          a.op(0x00D6, int(0)).op(0x00DF, lv(T4)).op(0x004D, ref(L(P + 'gp')));
          a.op(0x074D, lv(h), lv(T4), int(1500));                                                    // he is in a vehicle (or a helicopter): it shoots at him
          a.op(0x0085, lv(tgt), lv(T4));
          a.jump(L('gd'));
          a.label(L(P + 'gp'));
          a.op(0x00D6, int(0)).op(0x0039, lv(tgt), lv(T4)).op(0x004D, ref(L(P + 'gt')));               // already on him
          a.jump(L('gd'));
          a.label(L(P + 'gt'));
          a.op(0x05E2, lv(h), lv(T4));
          a.op(0x0085, lv(tgt), lv(T4));
          a.jump(L('gd'));
          a.label(L(P + 'gn'));
          a.op(0x000A, lv(T5), int(1));
          a.jump(L(P + 'gs'));
        };
        searchPass('a', 0, L('pass2'));
        a.label(L('pass2'));
        searchPass('b', -1, L('gd'));
        a.label(L('gd'));
        if (e.gid >= 0) a.op(0x0AB3, int(TARGET_VARS + e.gid), lv(tgt));
        // How long it has had this target: after TARGET_LIMIT without killing it, it lets it go (and clears its tasks) so it is never stuck on one
        a.op(0x01BD, lv(T4));
        a.op(0x00D6, int(0)).op(0x0039, lv(tgt), int(0)).op(0x004D, ref(L('gtm')));
        a.op(0x0006, lv(tt), int(0));
        a.jump(L('gtn'));
        a.label(L('gtm'));
        a.op(0x00D6, int(0)).op(0x0019, lv(tt), int(0)).op(0x004D, ref(L('gts')));
        a.op(0x0A8F, lv(T4), lv(tt), lv(T5));
        a.op(0x00D6, int(0)).op(0x0019, lv(T5), int(TARGET_LIMIT)).op(0x004D, ref(L('gtn')));
        a.op(0x0006, lv(tgt), int(0)).op(0x0006, lv(tt), int(0));
        if (e.gid >= 0) a.op(0x0AB3, int(TARGET_VARS + e.gid), int(0));
        a.op(0x0687, lv(h));
        a.jump(done);
        a.label(L('gts'));
        a.op(0x0085, lv(tt), lv(T4));
        a.label(L('gtn'));
        a.op(0x00D6, int(0)).op(0x0039, lv(tgt), int(0)).op(0x004D, ref(L('gx')));
        a.jump(L('gu'));
        a.label(L('gx'));
        // fighting: the attack is given again every two seconds (the task ends when the enemy is out of reach, and it would stay still)
        a.op(0x000A, lv(cnt), int(1));
        a.op(0x00D6, int(0)).op(0x0019, lv(cnt), int(8)).op(0x004D, ref(done));
        a.op(0x0006, lv(cnt), int(0));
        a.op(0x0085, lv(T4), lv(tgt));
        a.op(0x00D6, int(0)).op(0x00DF, lv(T4)).op(0x004D, ref(L('gw2')));
        a.op(0x074D, lv(h), lv(T4), int(1500));
        a.jump(done);
        a.label(L('gw2'));
        a.op(0x05E2, lv(h), lv(T4));
        a.jump(done);
        a.label(L('gu'));
        if (e.follow) {
          // close to the player: it comes to him on foot; it gets in his car and out of it with him. Not while it fights
          a.op(0x00D6, int(0)).op(0x0039, lv(tgt), int(0)).op(0x004D, ref(done));
          a.op(0x000A, lv(cnt), int(1));
          a.op(0x00D6, int(0)).op(0x0019, lv(cnt), int(6)).op(0x004D, ref(done));
          a.op(0x0006, lv(cnt), int(0));
          a.op(0x00D6, int(0)).op(0x00DF, lv(PLAYER)).op(0x004D, ref(L('ff')));
          a.op(0x00D6, int(0)).op(0x80DF, lv(h)).op(0x004D, ref(done));                           // the player drives and it is not in: gets in
          a.op(0x03C0, lv(PLAYER), lv(T6));
          a.op(0x05CA, lv(h), lv(T6), int(8000), int(-1));
          a.jump(done);
          a.label(L('ff'));
          a.op(0x00D6, int(0)).op(0x00DF, lv(h)).op(0x004D, ref(L('fw')));                         // the player walks and it is in a car: gets out
          a.op(0x0633, lv(h));
          a.jump(done);
          a.label(L('fw'));
          slot();
          a.op(0x00D6, int(0)).op(0x00FE, lv(h), lv(T4), lv(T5), lv(T6), flt(1.5), flt(1.5), flt(3), int(0)).op(0x004D, ref(L('fg')));   // in its own place
          a.jump(done);                                                                           // near enough: it stands there (no gestures)
          a.label(L('fg'));
          runTo();
        } else {
          goBack(a, e, i, base, true);
        }
      } else if (e.role === 'enemy') {
        if (e.follow) {
          // beyond 100 m or in another area (an interior): it stops and stays where it is, no teleport
          a.op(0x09E8, lv(PLAYER), lv(T0));
          a.op(0x09E8, lv(h), lv(T6));
          a.op(0x00D6, int(0)).op(0x0039, lv(T0), lv(T6)).op(0x004D, ref(L('ez')));
          a.op(0x00D6, int(0)).op(0x00FE, lv(h), lv(T1), lv(T2), lv(T3), flt(100), flt(100), flt(100), int(0)).op(0x004D, ref(L('ez')));
          a.jump(L('ek'));
          a.label(L('ez'));
          a.op(0x00D6, int(0)).op(0x0039, lv(st), int(2)).op(0x004D, ref(done));                  // it was not attacking: nothing to do
          a.op(0x0687, lv(h));
          a.op(0x0006, lv(st), int(1)).op(0x0006, lv(cnt), int(0));
          a.jump(done);
          a.label(L('ek'));
        }
        a.op(0x00D6, int(0)).op(0x0039, lv(st), int(1)).op(0x004D, ref(L('es')));
        if (!e.follow) {
          a.op(0x00A0, lv(h), lv(T4), lv(T5), lv(T6));                                            // waits where it is until the player comes close
          a.op(0x00D6, int(0)).op(0x00FE, lv(PLAYER), lv(T4), lv(T5), lv(T6), flt(35), flt(35), flt(35), int(0)).op(0x004D, ref(done));
        }
        a.op(0x05E2, lv(h), lv(PLAYER));
        a.op(0x0006, lv(st), int(2)).op(0x0006, lv(cnt), int(0));
        a.jump(done);
        a.label(L('es'));
        // attacking: it is told again every few seconds (the player may have got in a car)
        a.op(0x000A, lv(cnt), int(1));
        a.op(0x00D6, int(0)).op(0x0019, lv(cnt), int(24)).op(0x004D, ref(done));
        a.op(0x0006, lv(cnt), int(0));
        if (e.follow) {
          a.op(0x00D6, int(0)).op(0x00DF, lv(PLAYER)).op(0x004D, ref(L('ef')));
          runTo();                                   // follows the car
          a.jump(done);
          a.label(L('ef'));
        }
        a.op(0x05E2, lv(h), lv(PLAYER));
      } else {
        holdPlace(a, e, i, base);
      }
    },
  });
}

// The neutral NPC never moves: if it gets more than 0.5 m from its place it is reset there (tasks cleared, angle, animation again)
function holdPlace(a, e, i, base) {
  const h = base + 1, cnt = base + 2, done = 'n' + i;
  const L = (n) => n + i;
  a.op(0x00D6, int(0)).op(0x00FE, lv(h), flt(e.x), flt(e.y), flt(e.z), flt(0.5), flt(0.5), flt(2), int(0)).op(0x004D, ref(L('hm')));
  a.op(0x000A, lv(cnt), int(1));
  a.op(0x00D6, int(0)).op(0x0019, lv(cnt), int(6)).op(0x004D, ref(done));
  a.op(0x0006, lv(cnt), int(0));
  if (e.anim) {
    a.op(0x00D6, int(0)).op(0x0611, lv(h), strn(e.anim.name)).op(0x004D, ref(L('hq')));
    a.jump(done);
    a.label(L('hq'));
    playAnim(a, e, h, 'q' + i);
  }
  a.jump(done);
  a.label(L('hm'));
  a.op(0x0687, lv(h));
  a.op(0x00A1, lv(h), flt(e.x), flt(e.y), flt(e.z));
  a.op(0x0173, lv(h), flt(e.rz));
  if (e.anim) playAnim(a, e, h, 'x' + i);
}

// Back to the place and the angle where it was put (walking): after a scare, a fight, anything. Not while the player is aiming at it.
// Once there it plays its animation again
function goBack(a, e, i, base, guard) {
  const st = base, h = base + 1, cnt = base + 2, tgt = base + 3, done = 'n' + i;
  if (guard) a.op(0x00D6, int(0)).op(0x0039, lv(tgt), int(0)).op(0x004D, ref(done));          // still fighting
  a.op(0x000A, lv(cnt), int(1));
  a.op(0x00D6, int(0)).op(0x0019, lv(cnt), int(14)).op(0x004D, ref(done));
  a.op(0x0006, lv(cnt), int(0));
  a.op(0x00D6, int(0)).op(0x0457, int(0), lv(h)).op(0x004D, ref('b1' + i));                    // the player is aiming at it: it may react
  a.jump(done);
  a.label('b1' + i);
  a.op(0x00D6, int(0)).op(0x00FE, lv(h), flt(e.x), flt(e.y), flt(e.z), flt(1.2), flt(1.2), flt(3), int(0)).op(0x004D, ref('b2' + i));
  // there: the angle once (when it has just arrived), and the animation again if it is not playing
  a.op(0x00D6, int(0)).op(0x0039, lv(st), int(4)).op(0x004D, ref('b3' + i));
  a.op(0x05D4, lv(h), flt(e.rz));
  a.op(0x0006, lv(st), int(1));
  if (e.anim) playAnim(a, e, h, 'r' + i);
  a.jump(done);
  a.label('b3' + i);
  if (e.anim) {
    a.op(0x00D6, int(0)).op(0x0611, lv(h), strn(e.anim.name)).op(0x004D, ref('b4' + i));
    a.jump(done);
    a.label('b4' + i);
    playAnim(a, e, h, 'p' + i);
  }
  a.jump(done);
  a.label('b2' + i);
  a.op(0x0687, lv(h));                                                                          // the reaction (hands up, flight) stops: it walks back
  a.op(0x05D3, lv(h), flt(e.x), flt(e.y), flt(e.z), int(1), int(8000));
  a.op(0x0006, lv(st), int(4));
}

// movers: objects that go back and forth between their place and a target: { model, x, y, z, rx, ry, rz, tx, ty, tz, speed (m/s) }
// The game moves a sliding object a little at every call and takes the speed per game step (50 a second): so the script
// calls it at every frame, and the speed is the one in meters per second divided by 50.
export function moversScript(items) {
  const list = items.map(e => ({ ...e, vars: 3 }));
  return nearScript(list, {
    radius: 150, wait: 0,
    spawn: (a, e, i, base) => {
      loadModel(a, e.model, 'o' + i);
      a.op(0x0107, int(e.model), flt(e.x), flt(e.y), flt(e.z), lv(base + 2));
      a.op(0x0453, lv(base + 2), flt(e.rx), flt(e.ry), flt(e.rz));
      a.op(0x0249, int(e.model));
    },
    manage: (a, e, i, base) => {
      const s = flt(Math.max(0.001, e.speed / 50));
      a.op(0x00D6, int(0)).op(0x0039, lv(base + 1), int(0)).op(0x004D, ref('b' + i));            // going to the target?
      a.op(0x00D6, int(0)).op(0x034E, lv(base + 2), flt(e.tx), flt(e.ty), flt(e.tz), s, s, s, int(0)).op(0x004D, ref('n' + i));
      a.op(0x0006, lv(base + 1), int(1)).jump('n' + i);
      a.label('b' + i);
      a.op(0x00D6, int(0)).op(0x034E, lv(base + 2), flt(e.x), flt(e.y), flt(e.z), s, s, s, int(0)).op(0x004D, ref('n' + i));
      a.op(0x0006, lv(base + 1), int(0));
    },
  });
}

// The rest of the world: radar icons, where the player appears, fixed weather and time.
// world: { blips: [{ sprite, x, y, z }], spawn: { x, y, z, rot } | null, weather: -1.., hour: -1.., minute }
export function worldScript(world) {
  const a = new Asm();
  a.op(0x0000);
  waitPlayer(a);
  for (const b of world.blips || []) a.op(0x02A8, flt(b.x), flt(b.y), flt(b.z), int(b.sprite), lv(T0));
  if (world.spawn) {
    // Whatever the saved game: the player starts here (once the game has finished putting him where the save was)
    const s = world.spawn;
    a.op(0x0001, int(1500));
    a.op(0x04E4, flt(s.x), flt(s.y));
    a.op(0x03CB, flt(s.x), flt(s.y), flt(s.z));
    a.op(0x04BB, int(0));
    a.op(0x0860, lv(PLAYER), int(0));
    a.op(0x00A1, lv(PLAYER), flt(s.x), flt(s.y), flt(s.z));
    a.op(0x0173, lv(PLAYER), flt(s.rot));
  }
  if (world.weather >= 0 || world.hour >= 0 || world.spawn) {
    a.label('loop').op(0x0001, int(500));
    if (world.spawn) {
      const s = world.spawn;
      // The game chooses where the player comes back when he dies, so the spawn point is set as the next restart all the time,
      a.op(0x016E, flt(s.x), flt(s.y), flt(s.z), flt(s.rot));
      // Backup for when the game still takes him to a hospital: he was not playing (dead or arrested) and is back: he is taken to the spawn point
      a.op(0x00D6, int(0)).op(0x0256, lv(PLAYER)).op(0x004D, ref('pd'));
      a.op(0x00D6, int(0)).op(0x0039, lv(10), int(1)).op(0x004D, ref('alive'));
      a.op(0x0006, lv(10), int(0));
      a.op(0x04E4, flt(s.x), flt(s.y));
      a.op(0x03CB, flt(s.x), flt(s.y), flt(s.z));
      a.op(0x04BB, int(0));
      a.op(0x0860, lv(PLAYER), int(0));
      a.op(0x00A1, lv(PLAYER), flt(s.x), flt(s.y), flt(s.z));
      a.op(0x0173, lv(PLAYER), flt(s.rot));
      a.jump('alive');
      a.label('pd');
      a.op(0x0006, lv(10), int(1));
      a.label('alive');
      // New game: the intro (cutscene, with the player's control off) ends and the game puts the player at its own place. The first time the player gets
      // his control back after having it off, he is taken to the spawn point (once; a saved game that starts with control on is not affected)
      a.op(0x00D6, int(0)).op(0x0039, lv(12), int(0)).op(0x004D, ref('ngd'));
      a.op(0x00D6, int(0)).op(0x09E7, int(0)).op(0x004D, ref('ngo'));
      a.op(0x00D6, int(0)).op(0x0039, lv(11), int(1)).op(0x004D, ref('ngd'));
      a.op(0x0006, lv(12), int(1));
      a.op(0x04E4, flt(world.spawn.x), flt(world.spawn.y));
      a.op(0x03CB, flt(world.spawn.x), flt(world.spawn.y), flt(world.spawn.z));
      a.op(0x04BB, int(0));
      a.op(0x0860, lv(PLAYER), int(0));
      a.op(0x00A1, lv(PLAYER), flt(world.spawn.x), flt(world.spawn.y), flt(world.spawn.z));
      a.op(0x0173, lv(PLAYER), flt(world.spawn.rot));
      a.jump('ngd');
      a.label('ngo');
      a.op(0x0006, lv(11), int(1));
      a.label('ngd');
    }
    if (world.weather >= 0) a.op(0x01B5, int(world.weather));
    if (world.hour >= 0) a.op(0x00C0, int(world.hour), int(world.minute | 0));
    a.jump('loop');
  } else {
    a.op(0x004E);
  }
  return a.build();
}

// The project's vehicles: each one is made by the script when the player comes near, and it is unique: it stays where the player leaves it
// (no other one appears at the place) and, when it is destroyed, it comes back at its place after `respawn` seconds.
// items: { model, x, y, z, rz, color1, color2, comps: [], paintjob, indestructible, npcLock, respawn }
export function vehiclesScript(items) {
  const list = items.map(e => ({ ...e, vars: 3 }));
  return nearScript(list, {
    radius: 200, wait: 500,
    spawn: (a, e, i, base) => {
      const h = base + 1;
      loadModel(a, e.model, 'v' + i);
      a.op(0x00A5, int(e.model), flt(e.x), flt(e.y), flt(e.z), lv(h));
      a.op(0x0175, lv(h), flt(e.rz));
      if (e.color1 >= 0 || e.color2 >= 0) {
        const c1 = e.color1 >= 0 ? e.color1 : 0;
        a.op(0x0229, lv(h), int(c1), int(e.color2 >= 0 ? e.color2 : c1));
      }
      for (const c of e.comps || []) {
        a.op(0x06E9, int(c));                                                       // load the component
        a.label(`w${i}_${c}`).op(0x0001, int(0));
        a.op(0x00D6, int(0)).op(0x06EA, int(c)).op(0x004D, ref(`w${i}_${c}`));      // until it is available
        a.op(0x06E7, lv(h), int(c), lv(T0)).op(0x06EB, int(c));                     // add it, release it
      }
      if ((e.paintjob ?? -1) >= 0) a.op(0x06ED, lv(h), int(e.paintjob));
      if (e.indestructible) {
        a.op(0x02AC, lv(h), int(1), int(1), int(1), int(1), int(1));                // proof against bullets, fire, explosions, collisions, melee
        a.op(0x03F5, lv(h), int(0));                                                // it cannot be damaged (windows included)
        a.op(0x053F, lv(h), int(0));                                                // tires cannot burst
        a.op(0x0852, lv(h), int(0));                                                // no visible damage
        a.op(0x0224, lv(h), int(1000));
      }
      if (e.npcLock) a.op(0x020A, lv(h), int(2));                                   // locked until the player comes
      a.op(0x0587, lv(h), int(1));                                                  // the ground stays loaded under it, wherever it is left
      a.op(0x0249, int(e.model));                                                   // the model is not kept in memory
    },
    manage: (a, e, i, base) => {
      const st = base, h = base + 1, cnt = base + 2, done = 'n' + i;
      a.op(0x00D6, int(0)).op(0x056E, lv(h)).op(0x004D, ref('gn' + i));            // is the car gone...
      a.op(0x00D6, int(0)).op(0x0119, lv(h)).op(0x004D, ref('ok' + i));            // ...or wrecked?
      a.label('gn' + i);
      a.op(0x000A, lv(cnt), int(1));
      a.op(0x00D6, int(0)).op(0x0019, lv(cnt), int(Math.max(2, Math.round((e.respawn || 30) * 2)))).op(0x004D, ref(done));
      a.op(0x00D6, int(0)).op(0x056E, lv(h)).op(0x004D, ref('rs' + i));
      a.op(0x01C3, lv(h));                                                         // the wreck is left to the game to clear
      a.label('rs' + i);
      a.op(0x0006, lv(st), int(0)).op(0x0006, lv(cnt), int(0));                    // made again (when the player is near its place)
      a.jump(done);
      a.label('ok' + i);
      if (e.indestructible) a.op(0x0224, lv(h), int(1000));                        // health back to full
      if (e.npcLock) {
        a.op(0x00D6, int(0)).op(0x0202, lv(PLAYER), lv(h), flt(8), flt(8), int(0)).op(0x004D, ref('l' + i)); // if the player is near it
        a.op(0x020A, lv(h), int(1)).jump(done);
        a.label('l' + i).op(0x020A, lv(h), int(2));
      }
    },
  });
}
