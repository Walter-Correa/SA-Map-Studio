// Singleplayer gates and doors (see editor/gates.js): a CLEO script made with the editor's assembler.
// A closed gate opens when the player near it presses its key (CLEO 0AB0) or the horn of the car the player is in;
// it waits its delay and closes. Position and rotation are interpolated every frame, so it can slide and turn at once.
import { int, flt, lv, ref, nearScript, loadModel } from './cleo.js';

const PLAYER = 31, T0 = 30, T1 = 29, T2 = 28, T3 = 27, T6 = 24; // the shared variables of nearScript's scripts
export const GATE_VARS = 4; // created, object, phase (0 closed, 1 opening, 2 open, 3 closing), time the phase began

const SOUND_MOVE = 1153, SOUND_STOP = 1154;

// items: { model, x, y, z, rx, ry, rz, ox, oy, oz, orx, ory, orz, time, closeDelay, horn, vk, range, sound }
export function gatesScript(items) {
  const list = items.map(e => ({ ...e, vars: GATE_VARS }));
  // The sound goes with the object (097B: the game's audio event at an object)
  const sound = (a, e, base, id) => { if (e.sound) a.op(0x097B, lv(base + 1), int(id)); };
  // Puts the object at the fraction T1 of the way (0 closed, 1 open)
  const place = (a, e, base) => {
    const axes = (from, to, op) => {
      [T2, T3, T6].forEach((v, k) => {
        a.op(0x0087, lv(v), lv(T1));
        a.op(0x0013, lv(v), flt(to[k] - from[k]));
        a.op(0x000B, lv(v), flt(from[k]));
      });
      a.op(op, lv(base + 1), lv(T2), lv(T3), lv(T6));
    };
    axes([e.x, e.y, e.z], [e.ox, e.oy, e.oz], 0x01BC);
    axes([e.rx, e.ry, e.rz], [e.orx, e.ory, e.orz], 0x0453);
  };
  return nearScript(list, {
    radius: 150, wait: 0,
    save: (a, e, i, base) => {
      a.op(0x00D6, int(0)).op(0x0039, lv(base), int(1)).op(0x004D, ref('sk' + i));
      a.op(0x00D6, int(0)).op(0x03CA, lv(base + 1)).op(0x004D, ref('sj' + i));
      a.op(0x0108, lv(base + 1));
      a.label('sj' + i);
      a.op(0x0006, lv(base), int(0)).op(0x0006, lv(base + 2), int(0));                          // made again (closed) after the save
      a.label('sk' + i);
    },
    spawn: (a, e, i, base) => {
      loadModel(a, e.model, 'g' + i);
      a.op(0x0107, int(e.model), flt(e.x), flt(e.y), flt(e.z), lv(base + 1));
      a.op(0x0453, lv(base + 1), flt(e.rx), flt(e.ry), flt(e.rz));
      a.op(0x0249, int(e.model));
      a.op(0x0006, lv(base + 2), int(0));
    },
    manage: (a, e, i, base) => {
      const n = 'n' + i, ph = lv(base + 2), start = lv(base + 3);
      a.op(0x00D6, int(0)).op(0x03CA, lv(base + 1)).op(0x004D, ref('gz' + i));
      a.jump('go' + i);
      a.label('gz' + i);
      a.op(0x0006, lv(base), int(0));                                                              // gone: made again when the player is near
      a.jump(n);
      a.label('go' + i);
      // Closed: only now the key or the horn opens it
      a.op(0x00D6, int(0)).op(0x0039, ph, int(0)).op(0x004D, ref('p1' + i));
      a.op(0x00D6, int(0)).op(0x00FE, lv(PLAYER), flt(e.x), flt(e.y), flt(e.z), flt(e.range), flt(e.range), flt(e.range), int(0)).op(0x004D, ref(n));
      if (e.horn) a.op(0x00D6, int(1)).op(0x00DF, lv(PLAYER)).op(0x00E1, int(0), int(18)).op(0x004D, ref(n)); // in a car and the horn (L3)
      else a.op(0x00D6, int(0)).op(0x0AB0, int(e.vk)).op(0x004D, ref(n));
      a.op(0x0006, ph, int(1)).op(0x01BD, start);
      sound(a, e, base, SOUND_MOVE);
      a.jump(n);
      // Open: waits the delay, then closes
      a.label('p1' + i);
      a.op(0x00D6, int(0)).op(0x0039, ph, int(2)).op(0x004D, ref('mv' + i));
      a.op(0x01BD, lv(T0)).op(0x0062, lv(T0), start);
      a.op(0x00D6, int(0)).op(0x0019, lv(T0), int(e.closeDelay - 1)).op(0x004D, ref(n));
      a.op(0x0006, ph, int(3)).op(0x01BD, start);
      sound(a, e, base, SOUND_MOVE);
      a.jump(n);
      // Opening or closing: the fraction of the move time that went by
      a.label('mv' + i);
      a.op(0x01BD, lv(T1)).op(0x0062, lv(T1), start).op(0x0093, lv(T1), lv(T1)).op(0x0017, lv(T1), flt(e.time));
      a.op(0x0006, lv(T0), int(0));
      a.op(0x00D6, int(0)).op(0x0021, lv(T1), flt(1)).op(0x004D, ref('cl' + i));
      a.op(0x0007, lv(T1), flt(1)).op(0x0006, lv(T0), int(1));                                     // arrived
      a.label('cl' + i);
      a.op(0x00D6, int(0)).op(0x0039, ph, int(3)).op(0x004D, ref('fw' + i));
      a.op(0x0007, lv(T2), flt(1)).op(0x0063, lv(T2), lv(T1)).op(0x0087, lv(T1), lv(T2));          // closing: the other way
      a.label('fw' + i);
      place(a, e, base);
      a.op(0x00D6, int(0)).op(0x0039, lv(T0), int(1)).op(0x004D, ref(n));
      sound(a, e, base, SOUND_STOP);
      a.op(0x00D6, int(0)).op(0x0039, ph, int(1)).op(0x004D, ref('ce' + i));
      a.op(0x0006, ph, int(2)).op(0x01BD, start);
      a.jump(n);
      a.label('ce' + i);
      a.op(0x0006, ph, int(0));
    },
  });
}
