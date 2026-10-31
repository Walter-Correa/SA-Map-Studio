// Auto Criar: the furniture and the decoration of the rooms of an interior. The pools are the models of the game by kind of piece; every kind of room has a plan of
// what goes in it and how (against a wall, in a corner, in the middle, hung on a wall, in the middle of the ceiling, as a rug, or over another piece).
import * as THREE from 'three';
import { UNIT, HEIGHT, DIP } from './autoInterior.js';

const D2R = Math.PI / 180;
const THICK = 0.18;                    // the walls that belong to the neighbor of a room take this much of the room
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

// The pools: the models by kind of piece. The front of all of them is the -y of the model (looked at one by one in the thumbnails), unless FRONT says otherwise
export const POOLS = {
  bed: [1795, 1797, 1798, 1700, 1701, 1725, 1745, 1793, 1794],
  wardrobe: [1743, 1730, 2167, 2025, 2204, 2084],
  dresser: [1741, 2020, 2021, 1743, 1730],
  nightstand: [1740],
  couch: [1753, 1756, 1760, 1702, 1707, 1703, 1706, 1761, 1763, 1764, 1766, 1768],
  armchair: [1704, 1708, 1711, 1705, 1758, 1759, 1769, 1735, 1755, 1757],
  tvStand: [2313, 1743, 1730, 2084, 2020, 2021, 1741],
  tv: [1747, 1748, 1749, 1750, 1751, 1752, 1786, 1781, 2312, 2316, 1518, 1429, 1791, 1792, 2317],
  tvUnit: [2296],
  tvFlat: [19787, 19786],
  stereo: [2101, 2102, 2103],
  stereoBig: [2099, 2100],
  speaker: [2229, 2230, 2231, 2232, 2233],
  coffee: [2370, 2024, 2126, 2110, 2109, 2111],
  dining: [1825],
  plant: [2194, 2203, 2241, 2811],
  lampFloor: [2239, 2108, 2023],
  lampTable: [2077, 2726, 2238],
  deskLamp: [2196],
  lampCeil: [2073, 2074, 2076],
  picture: range(2255, 2289),
  trophy: [1736],
  clock: [19825],
  rug: [2815, 2817, 2818],
  small: [2812, 2813, 2816, 2820, 2822, 2826, 2827, 2829, 2830, 2825, 2814],
  kitchenSmall: [2812, 2820, 2822, 2830, 2821, 2823],
  fridge: [2127, 2147, 2131],
  stove: [2017, 2135, 2129],
  sink: [2130, 2136, 2013, 2022],
  counter: [2132, 2133, 2134, 2339, 2340, 2336, 2128],
  washer: [2018],
  desk: [2165, 2166, 2169, 2173, 2185],
  pc: [2190],
  chair: [1806, 1722, 1739],
  filing: [2197],
  bookshelf: [2204, 2161, 2162, 2164, 1742],
  copier: [2186],
  toilet: [2514, 2521, 2528, 2738, 2525],
  basin: [2518, 2523, 2524, 2739],
  bath: [2516, 2519, 2526, 2522],
  shower: [2517, 2527],
  radiator: [1738],
};
// models whose front is not the -y
const FRONT = {};
export function frontOf(info, cls, id) { return FRONT[id] || [0, -1]; }
// pieces that carry things on top that are already part of the model (nothing else goes over them), and pieces that are too tall to have things on top
const BUILT_IN = new Set([2165, 2166, 2013, 2022, 2129, 2135]);
// small things that look the same way as the piece they are on; the rest of the small things go turned at random
const ALIGNED = new Set(['tv', 'stereo', 'pc']);
// kinds that only one is put in a room, even with the level "Bastante"
const ONLY_ONE = new Set(['bed', 'fridge', 'stove', 'washer', 'toilet', 'bath', 'shower', 'tvStand', 'tvUnit', 'coffee', 'dining', 'desk', 'rug', 'lampCeil', 'stereoBig', 'copier', 'trophy', 'clock']);

// What each kind of room gets: [pool, how many (min, max), mode, options]. Modes: 'wall' (against a wall), 'corner', 'center', 'deskchair', 'hang' (on a wall, at the
// height opt.z), 'ceiling' (in the middle of the ceiling), 'rug' (flat on the floor, in the middle). opt.on: what goes over the piece, [pool, chance, most, 'center']
const LAMPS = [['lampTable', 0.85, 1], ['small', 0.35, 1]];
const FURNITURE = {
  sala: [['rug', 0, 1, 'rug'], ['couch', 1, 2, 'wall'], ['tvStand', 1, 1, 'wall', { flat: 0.35, on: [['tv', 1, 1, 'center'], ['stereo', 0.4, 1], ['small', 0.3, 1]] }], ['coffee', 1, 1, 'center', { on: [['small', 0.9, 2]] }],
    ['armchair', 0, 2, 'wall'], ['plant', 0, 2, 'corner'], ['picture', 1, 3, 'hang', { z: 1.6 }], ['lampCeil', 1, 1, 'ceiling'], ['lampFloor', 0, 1, 'corner']],
  quarto: [['rug', 0, 1, 'rug'], ['bed', 1, 1, 'wall'], ['nightstand', 1, 2, 'wall', { on: LAMPS }], ['wardrobe', 1, 1, 'wall'],
    ['dresser', 0, 1, 'wall', { on: [['tv', 0.5, 1, 'center'], ['lampTable', 0.4, 1], ['stereo', 0.4, 1]] }], ['plant', 0, 1, 'corner'], ['picture', 1, 3, 'hang', { z: 1.6 }],
    ['lampCeil', 1, 1, 'ceiling'], ['tvFlat', 0, 1, 'hang', { z: 1.45 }]],
  cozinha: [['fridge', 1, 1, 'wall'], ['stove', 1, 1, 'wall', { on: [['kitchenSmall', 0.3, 1]] }], ['sink', 1, 2, 'wall', { on: [['kitchenSmall', 0.5, 1]] }], ['counter', 0, 2, 'wall', { on: [['kitchenSmall', 0.6, 2]] }],
    ['washer', 0, 1, 'wall'], ['dining', 0, 1, 'center'], ['picture', 0, 1, 'hang', { z: 1.9 }], ['clock', 0, 1, 'hang', { z: 2.3 }], ['lampCeil', 1, 1, 'ceiling'], ['plant', 0, 1, 'corner']],
  banheiro: [['toilet', 1, 1, 'wall'], ['basin', 1, 1, 'wall'], ['bath', 0, 1, 'wall'], ['shower', 0, 1, 'corner'], ['radiator', 0, 1, 'hang', { z: 0.8 }],
    ['picture', 0, 1, 'hang', { z: 1.7 }], ['lampCeil', 1, 1, 'ceiling'], ['plant', 0, 1, 'corner']],
  escritorio: [['rug', 0, 1, 'rug'], ['desk', 1, 1, 'wall', { on: [['pc', 0.7, 1, 'center'], ['deskLamp', 0.5, 1], ['small', 0.3, 1]] }], ['chair', 1, 1, 'deskchair'], ['filing', 1, 2, 'wall'], ['bookshelf', 0, 1, 'wall'],
    ['copier', 0, 1, 'wall'], ['plant', 0, 1, 'corner'], ['picture', 1, 2, 'hang', { z: 1.6 }], ['clock', 0, 1, 'hang', { z: 2.3 }], ['lampCeil', 1, 1, 'ceiling']],
  landing: [['rug', 0, 1, 'rug'], ['picture', 2, 4, 'hang', { z: 1.6 }], ['plant', 1, 2, 'corner'], ['lampFloor', 0, 1, 'corner'], ['dresser', 0, 1, 'wall', { on: LAMPS }], ['clock', 0, 1, 'hang', { z: 2.3 }], ['lampCeil', 1, 1, 'ceiling']],
  hall: [['rug', 0, 1, 'rug'], ['picture', 2, 4, 'hang', { z: 1.6 }], ['plant', 0, 2, 'corner'], ['lampFloor', 0, 1, 'corner'], ['dresser', 0, 1, 'wall', { on: LAMPS }], ['lampCeil', 1, 1, 'ceiling'], ['clock', 0, 1, 'hang', { z: 2.3 }]],
};
// What the level "Bastante" (a lot) adds to each kind of room, besides what the level "Poucos" (a few) has
const EXTRA = {
  sala: [['bookshelf', 1, 2, 'wall'], ['chair', 0, 2, 'wall'], ['plant', 1, 2, 'corner'], ['dresser', 0, 1, 'wall', { on: [['lampTable', 0.7, 1], ['small', 0.6, 2], ['stereo', 0.5, 1]] }], ['picture', 1, 3, 'hang', { z: 1.6 }],
    ['trophy', 0, 1, 'hang', { z: 2.1 }], ['clock', 0, 1, 'hang', { z: 2.3 }], ['speaker', 0, 2, 'wall'], ['stereoBig', 0, 1, 'wall'], ['tvUnit', 0, 1, 'wall'], ['lampFloor', 1, 1, 'corner'], ['couch', 0, 1, 'wall'], ['tvFlat', 0, 1, 'hang', { z: 1.5 }]],
  quarto: [['wardrobe', 0, 1, 'wall'], ['bookshelf', 0, 1, 'wall'], ['chair', 0, 1, 'wall'], ['plant', 1, 2, 'corner'], ['nightstand', 0, 1, 'wall', { on: LAMPS }], ['picture', 1, 2, 'hang', { z: 1.6 }],
    ['lampFloor', 0, 1, 'corner'], ['speaker', 0, 2, 'wall'], ['clock', 0, 1, 'hang', { z: 2.3 }], ['stereoBig', 0, 1, 'wall']],
  cozinha: [['counter', 1, 2, 'wall', { on: [['kitchenSmall', 0.6, 2]] }], ['chair', 1, 2, 'wall'], ['plant', 1, 2, 'corner'], ['bookshelf', 0, 1, 'wall'], ['picture', 1, 1, 'hang', { z: 1.9 }]],
  banheiro: [['basin', 0, 1, 'wall'], ['shower', 0, 1, 'corner'], ['plant', 1, 1, 'corner'], ['picture', 1, 1, 'hang', { z: 1.7 }], ['clock', 0, 1, 'hang', { z: 2.2 }]],
  escritorio: [['bookshelf', 1, 2, 'wall'], ['filing', 1, 2, 'wall'], ['plant', 1, 2, 'corner'], ['chair', 0, 2, 'wall'], ['armchair', 0, 1, 'wall'], ['picture', 1, 2, 'hang', { z: 1.6 }],
    ['lampFloor', 0, 1, 'corner'], ['tvFlat', 0, 1, 'hang', { z: 1.5 }]],
  hall: [['picture', 1, 3, 'hang', { z: 1.6 }], ['plant', 1, 2, 'corner'], ['dresser', 0, 1, 'wall', { on: LAMPS }], ['lampFloor', 0, 1, 'corner']],
  landing: [['picture', 1, 3, 'hang', { z: 1.6 }], ['plant', 1, 2, 'corner'], ['bookshelf', 0, 1, 'wall'], ['armchair', 0, 1, 'wall'], ['lampFloor', 0, 1, 'corner'], ['trophy', 0, 1, 'hang', { z: 2.1 }]],
};

// ---------------------------------------------------------------- the size of a model
const bboxCache = new Map();
export async function infoOf(env, id) {
  if (bboxCache.has(id)) return bboxCache.get(id);
  const g = await env.models.getModel(id);
  const b = new THREE.Box3().setFromObject(g);
  const info = { min: b.min.clone(), max: b.max.clone() };
  bboxCache.set(id, info);
  return info;
}

// the box (in x, y of the room) of a model turned rz degrees around its origin
function rotRect(info, rz) {
  const c = Math.cos(rz * D2R), s = Math.sin(rz * D2R);
  const cs = [[info.min.x, info.min.y], [info.max.x, info.min.y], [info.min.x, info.max.y], [info.max.x, info.max.y]].map(([x, y]) => [x * c - y * s, x * s + y * c]);
  return [Math.min(...cs.map(p => p[0])), Math.min(...cs.map(p => p[1])), Math.max(...cs.map(p => p[0])), Math.max(...cs.map(p => p[1]))];
}
const hit = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
const grow = (a, m) => [a[0] - m, a[1] - m, a[2] + m, a[3] + m];

// edges: the walls of the layout ('h|y|x' / 'v|x|y' -> the room that owns it); the walls of a room belong to its outside, so the ones that belong to a neighbor take
// THICK of the room. params.hasCeiling: the lamps of the ceiling go only when there is one
export async function furnish(rooms, doors, params, env, rng, place, edges) {
  let count = 0;
  const lots = params.furniture >= 2;
  const hasId = (id) => env.gd.models.has(id);
  const idsOf = (pool) => (POOLS[pool] || []).filter(hasId);
  for (const r of rooms) {
    const plan = (FURNITURE[r.type] || []).concat(lots ? (EXTRA[r.type] || []) : []);
    // the free area of the room: its line minus what the walls of the neighbors take
    const own = (key) => { const o = edges && edges.get(key); return !!o && o !== r; };
    let iw = 0, ie = 0, is = 0, inn = 0;
    for (let y = r.y0; y < r.y1; y++) { if (own('v|' + r.x0 + '|' + y)) iw = THICK; if (own('v|' + r.x1 + '|' + y)) ie = THICK; }
    for (let x = r.x0; x < r.x1; x++) { if (own('h|' + r.y0 + '|' + x)) is = THICK; if (own('h|' + r.y1 + '|' + x)) inn = THICK; }
    const ax0 = r.x0 * UNIT + iw, ax1 = r.x1 * UNIT - ie, ay0 = r.y0 * UNIT + is, ay1 = r.y1 * UNIT - inn;
    const virt = new Set(r.virtualSides || []);          // sides that are not a wall (the edge of a landing where the stairs start): nothing goes against them
    const doorB = [];
    for (const dr of doors) {
      const a = dr.alongX ? [dr.from * UNIT - 0.5, dr.line * UNIT - 1.2, (dr.from + dr.len) * UNIT + 0.5, dr.line * UNIT + 1.2] : [dr.line * UNIT - 1.2, dr.from * UNIT - 0.5, dr.line * UNIT + 1.2, (dr.from + dr.len) * UNIT + 0.5];
      if (a[2] > ax0 - 0.1 && a[0] < ax1 + 0.1 && a[3] > ay0 - 0.1 && a[1] < ay1 + 0.1) doorB.push(a);
    }
    const blocked = doorB.slice();          // what cannot be used: the doorways (with a margin) and what is already placed
    const tall = [];                         // the pieces on the floor: { rect, h }
    const hung = [];                         // what is hung on the walls
    const inner = (a, m = 0.01) => a[0] >= ax0 + m && a[2] <= ax1 - m && a[1] >= ay0 + m && a[3] <= ay1 - m;
    const free = (a) => !blocked.some(b => hit(a, b)) && inner(a);
    const last = {};
    // a spot against the wall `side` (0 south, 1 east, 2 north, 3 west) with the middle of the piece at `along`; bb: the box of the piece
    const wallPos = (side, bb, gap, along) => {
      if (side === 0) return [along - (bb[0] + bb[2]) / 2, ay0 + gap - bb[1]];
      if (side === 2) return [along - (bb[0] + bb[2]) / 2, ay1 - gap - bb[3]];
      if (side === 3) return [ax0 + gap - bb[0], along - (bb[1] + bb[3]) / 2];
      return [ax1 - gap - bb[2], along - (bb[1] + bb[3]) / 2];
    };
    const sideRz = (side, front) => {
      const inward = [[0, 1], [-1, 0], [0, -1], [1, 0]][side];
      return (Math.atan2(inward[1], inward[0]) - Math.atan2(front[1], front[0])) / D2R;
    };
    const hangOne = async (id, side, along, zc, extra) => {
      const info = await infoOf(env, id), front = frontOf(info, 'depth', id);
      const rz = sideRz(side, front), bb = rotRect(info, rz);
      const [cx, cy] = wallPos(side, bb, 0.02, along);
      const rect = [cx + bb[0], cy + bb[1], cx + bb[2], cy + bb[3]];
      const zb = zc - (info.max.z - info.min.z) / 2;
      // the footprint in the room goes 30 cm out of the wall, so that nothing tall stands in front of it
      const f = rect.slice();
      if (side === 0) f[3] += 0.3; else if (side === 2) f[1] -= 0.3; else if (side === 3) f[2] += 0.3; else f[0] -= 0.3;
      if (!inner(rect, -0.05) || doorB.some(b => hit(f, b)) || tall.some(t => t.h > zb - 0.05 && hit(f, t.rect)) || hung.some(h => hit(grow(rect, 0.12), h))) return false;
      await place(id, cx, cy, zc - (info.min.z + info.max.z) / 2, 0, 0, rz);
      hung.push(rect);
      count++;
      return true;
    };
    // over a piece: the top of the surface is its highest point
    const putOn = async (surf, pool, most, align) => {
      const ids = idsOf(pool);
      if (!ids.length || surf.top > 1.25 || surf.skip) return;
      for (let k = 0; k < most; k++) {
        const id = rng.pick(ids), info = await infoOf(env, id);
        const rz = ALIGNED.has(pool) ? surf.rz : rng() * 360, bb = rotRect(info, rz);
        const sw = surf.rect[2] - surf.rect[0], sd = surf.rect[3] - surf.rect[1], w = bb[2] - bb[0], d = bb[3] - bb[1];
        if (w > sw - 0.02 || d > sd - 0.02) continue;
        for (let attempt = 0; attempt < 10; attempt++) {
          const mx = align === 'center' && !surf.tops.length ? (surf.rect[0] + surf.rect[2]) / 2 : surf.rect[0] + w / 2 + rng() * (sw - w);
          const my = align === 'center' && !surf.tops.length ? (surf.rect[1] + surf.rect[3]) / 2 : surf.rect[1] + d / 2 + rng() * (sd - d);
          const cx = mx - (bb[0] + bb[2]) / 2, cy = my - (bb[1] + bb[3]) / 2;
          const rect = [cx + bb[0], cy + bb[1], cx + bb[2], cy + bb[3]];
          if (surf.tops.some(t => hit(grow(rect, 0.03), t))) continue;
          await place(id, cx, cy, surf.top - info.min.z, 0, 0, rz);
          surf.tops.push(rect);
          count++;
          break;
        }
      }
    };
    for (const [pool, lo, hi, mode, opt = {}] of plan) {
      const ids = idsOf(pool);
      if (!ids.length) continue;
      let n = lo + (hi > lo ? rng.int(hi - lo + 1) : 0);
      if (lots && !ONLY_ONE.has(pool) && hi >= 1) n = Math.max(n, hi);          // a lot: every kind that can be repeated goes up to its most
      if (mode === 'ceiling') {
        if (!params.hasCeiling) continue;
        // in the middle of the ceiling; a long room (a corridor) gets one every 6 m or so along its long side
        const along = (ax1 - ax0) >= (ay1 - ay0), L = along ? ax1 - ax0 : ay1 - ay0, k = Math.max(1, Math.round(L / 6.4));
        for (let i = 0; i < k; i++) {
          const id = rng.pick(ids), info = await infoOf(env, id), t = (i + 0.5) / k;
          const mx = along ? ax0 + L * t : (ax0 + ax1) / 2, my = along ? (ay0 + ay1) / 2 : ay0 + L * t;
          await place(id, mx - (info.min.x + info.max.x) / 2, my - (info.min.y + info.max.y) / 2, HEIGHT - DIP - info.max.z, 0, 0, rng.int(4) * 90);
          count++;
        }
        continue;
      }
      for (let k = 0; k < n; k++) {
        const id = rng.pick(ids), info = await infoOf(env, id);
        const front = frontOf(info, 'depth', id);
        if (mode === 'rug') {
          const rz = rng.pick([0, 90]), bb = rotRect(info, rz);
          const w = bb[2] - bb[0], d = bb[3] - bb[1];
          if (w + 0.6 > ax1 - ax0 || d + 0.6 > ay1 - ay0) continue;
          const mx = (ax0 + ax1) / 2 + (rng() - 0.5) * Math.max(0, ax1 - ax0 - w - 0.6) * 0.5, my = (ay0 + ay1) / 2 + (rng() - 0.5) * Math.max(0, ay1 - ay0 - d - 0.6) * 0.5;
          await place(id, mx - (bb[0] + bb[2]) / 2, my - (bb[1] + bb[3]) / 2, 0.012 - info.min.z, 0, 0, rz);
          count++;
          continue;
        }
        if (mode === 'hang') {
          for (let attempt = 0; attempt < 24; attempt++) {
            const side = rng.int(4), bb = rotRect(info, sideRz(side, front));
            if (virt.has(side)) continue;
            const lo2 = side % 2 === 0 ? ax0 + 0.3 : ay0 + 0.3, hi2 = side % 2 === 0 ? ax1 - 0.3 : ay1 - 0.3;
            const half = (side % 2 === 0 ? bb[2] - bb[0] : bb[3] - bb[1]) / 2;
            if (hi2 - lo2 < 2 * half) continue;
            if (await hangOne(id, side, lo2 + half + rng() * (hi2 - lo2 - 2 * half), opt.z || 1.6)) break;
          }
          continue;
        }
        let putDone = false;
        for (let attempt = 0; attempt < 24 && !putDone; attempt++) {
          let rzF, cx, cy, rect, side = -1;
          if (mode === 'wall' || mode === 'corner' || mode === 'deskchair') {
            side = rng.int(4);
            if (virt.has(side)) continue;
            rzF = sideRz(side, front);
            const bb = rotRect(info, rzF);
            const gap = 0.04, m = 0.15;
            const [lo2, hi2] = side % 2 === 0 ? [ax0 + m - bb[0], ax1 - m - bb[2]] : [ay0 + m - bb[1], ay1 - m - bb[3]];
            if (hi2 < lo2) continue;
            const s = mode === 'corner' ? (side === 2 || side === 1 ? hi2 : lo2) : lo2 + rng() * (hi2 - lo2);
            // s: the low end of the piece along the wall -> its middle
            const along = side % 2 === 0 ? s + bb[0] + (bb[2] - bb[0]) / 2 : s + bb[1] + (bb[3] - bb[1]) / 2;
            [cx, cy] = wallPos(side, bb, gap, along);
            if (mode === 'deskchair' && last.desk) { cx = last.desk.cx; cy = last.desk.cy; }
            rect = [cx + bb[0], cy + bb[1], cx + bb[2], cy + bb[3]];
            if (mode === 'deskchair' && last.desk) {
              // the chair in front of the desk: on the side the desk looks at, a little way off
              const dk = last.desk, f = [Math.cos(dk.rz * D2R), Math.sin(dk.rz * D2R)];
              const fr = [dk.front[0] * f[0] - dk.front[1] * f[1], dk.front[0] * f[1] + dk.front[1] * f[0]];
              const cf = frontOf(info, 'free', id);
              rzF = (Math.atan2(-fr[1], -fr[0]) - Math.atan2(cf[1], cf[0])) / D2R;
              const bb2 = rotRect(info, rzF);
              const mx = (dk.rect[0] + dk.rect[2]) / 2 + fr[0] * (Math.abs(fr[0]) * (dk.rect[2] - dk.rect[0]) / 2 + 0.5), my = (dk.rect[1] + dk.rect[3]) / 2 + fr[1] * (Math.abs(fr[1]) * (dk.rect[3] - dk.rect[1]) / 2 + 0.5);
              cx = mx - (bb2[0] + bb2[2]) / 2; cy = my - (bb2[1] + bb2[3]) / 2;
              rect = [cx + bb2[0], cy + bb2[1], cx + bb2[2], cy + bb2[3]];
            }
          } else {                                            // the middle of the room
            rzF = rng.pick([0, 90]);
            const bb = rotRect(info, rzF);
            const mx = (ax0 + ax1) / 2 + (rng() - 0.5) * Math.max(0, ax1 - ax0 - (bb[2] - bb[0]) - 3) * 0.5, my = (ay0 + ay1) / 2 + (rng() - 0.5) * Math.max(0, ay1 - ay0 - (bb[3] - bb[1]) - 3) * 0.5;
            cx = mx - (bb[0] + bb[2]) / 2; cy = my - (bb[1] + bb[3]) / 2;
            rect = [cx + bb[0], cy + bb[1], cx + bb[2], cy + bb[3]];
          }
          const margin = mode === 'center' ? 0.9 : 0.05;
          const grownR = grow(rect, margin);
          if (!free(rect) || blocked.some(b => hit(grownR, b))) continue;
          // placed: the lowest point of the model on the floor
          await place(id, cx, cy, -info.min.z, 0, 0, rzF);
          blocked.push(grownR);
          tall.push({ rect, h: info.max.z - info.min.z });
          count++;
          if (pool === 'desk') last.desk = { cx, cy, rz: rzF, front, rect };
          const surf = { rect, top: info.max.z - info.min.z, rz: rzF, tops: [], skip: BUILT_IN.has(id) };
          // the TV of the stand is a flat one on the wall above it some of the times
          if (opt.flat && side >= 0 && rng() < opt.flat) {
            const fids = idsOf('tvFlat');
            const fid = fids.length ? rng.pick(fids) : 0;
            const along = side % 2 === 0 ? (rect[0] + rect[2]) / 2 : (rect[1] + rect[3]) / 2;
            if (fid && await hangOne(fid, side, along, 1.5)) { await putAttachments(surf, opt.on, ['tv']); putDone = true; continue; }
          }
          await putAttachments(surf, opt.on);
          putDone = true;
        }
      }
    }
    async function putAttachments(surf, on, skipPools = []) {
      for (const [p, chance, most, align] of on || []) {
        if (skipPools.includes(p) || rng() > chance) continue;
        if (p === 'pc' && surf.skip) continue;
        await putOn(surf, p, most, align);
      }
    }
  }
  return count;
}
