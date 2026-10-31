// Auto Criar: interiors. The rooms are drawn on a grid (the panels of the kit of SA-MP, walls of 3.21 and 1.61 m, tiles of 3.21 x 3.5 m, 3.5 m high), they
// are joined by doorways, and each one gets the furniture of its kind (bedroom, living room, kitchen, bathroom, office) against the walls, with the back
// of each piece to the wall. Everything is placed in a frame (a corner and a direction), so the interior goes wherever the camera looks.
import { furnish } from './autoFurnish.js';
export { furnish, infoOf, frontOf, POOLS } from './autoFurnish.js';
import { makeRng } from './autoTrack.js';

const D2R = Math.PI / 180;
export const UNIT = 1.605;            // the grid: half of the wall panel of 3.21 m
export const HEIGHT = 3.5;            // height of the panels
// Where two pieces meet they go a little into each other (no edge that is exactly on another: the sky shows through the crack between them): the layer
// of walls over another goes down OVERLAP, and a ceiling goes DIP into the top of the walls. ceilingZ is the center of a ceiling slab over `levels` layers
export const OVERLAP = 0.03, DIP = 0.04;
export const levelZ = (lv) => lv * (HEIGHT - OVERLAP);
export const ceilingZ = (levels) => levelZ(levels - 1) + HEIGHT - DIP + 0.09;
const TILE_X = 3.5, TILE_Y = 3.21;    // a panel lying down as a floor tile (its height goes along X)

// The textures of the panels of the kit. The style s is in the panels of 3.21 m (19353 + s), of 1.61 m (19426 + s) and of 9.63 m (19445 + s)
export const WALL_STYLES = [
  ['711_walltemp', 'Loja (711)'], ['ab_clubloungewall', 'Lounge'], ['ab_corwallupr', 'Corredor'], ['cj_lightwood', 'Madeira clara'],
  ['cj_white_wall2', 'Branca'], ['cl_of_wltemp', 'Escritório'], ['copbtm_brown', 'Marrom'], ['gym_floor5', 'Madeira de ginásio'],
  ['kb_kit_wal1', 'Cozinha'], ['la_carp3', 'Carpete'], ['motel_wall3', 'Motel'], ['mp_carter_bwall', 'Carter (escura)'],
  ['mp_carter_wall', 'Carter'], ['mp_diner_woodwall', 'Madeira escura'], ['mp_motel_bluew', 'Azul'], ['mp_motel_pinkw', 'Rosa'],
  ['mp_motel_whitewall', 'Branca (motel)'], ['mp_shop_floor2', 'Azulejo de loja'], ['stormdrain3_nt', 'Concreto'],
];
export const wallModel = (s) => 19353 + s, smallModel = (s) => 19426 + s;
export const TILE = { x: TILE_X, y: TILE_Y };

// The themes of a "same pattern" interior: walls and floor of the kit that go together (the indices are of WALL_STYLES)
// (wall, floor, ceiling): the ceiling is never the style of the walls, it is a light one that goes with them
const THEMES = [[3, 7, 4], [13, 13, 4], [4, 17, 16], [12, 9, 16], [18, 18, 4], [10, 9, 16], [0, 17, 4], [8, 17, 16]];
export const CEILING_STYLES = [4, 16];
// params.pattern: 0 mixed (each room has its own style), 1 the same theme (walls, floor and ceiling) in every room; the furniture is never textured.
// Returns the params with the walls and the floor chosen (what was chosen by hand is kept)
// A house has the walls, floor and ceiling of each floor (params.floors[k]); an interior has them in params itself
export function applyTheme(params, env, rng) {
  if (!(params.pattern > 0)) return { params, env };
  const theme = (c) => {
    let wall = c.wallStyle, floor = c.floorStyle, ceil = c.ceilingStyle;
    if (!(wall >= 0)) { const t = rng.pick(THEMES); wall = t[0]; if (!(floor >= 0)) floor = t[1]; if (!(ceil >= 0)) ceil = t[2]; }
    else { const t = THEMES.find(t => t[0] === wall) || [wall, 9, 4]; if (!(floor >= 0)) floor = t[1]; if (!(ceil >= 0)) ceil = t[2]; }
    return { ...c, wallStyle: wall, floorStyle: floor, ceilingStyle: ceil };
  };
  const out = params.floors ? { ...params, floors: params.floors.map(theme) } : theme(params);
  return { params: out, env };
}

// Rooms: the style of the walls and of the floor that usually go with each one
export const ROOM_TYPES = {
  sala: { title: 'Sala', wall: [4, 16, 3], floor: [7, 9], priority: 0 },
  quarto: { title: 'Quarto', wall: [14, 15, 4, 16], floor: [9], priority: 3 },
  cozinha: { title: 'Cozinha', wall: [8, 4, 16], floor: [17], priority: 1 },
  escritorio: { title: 'Escritório', wall: [5, 4, 6], floor: [9, 7], priority: 2 },
  banheiro: { title: 'Banheiro', wall: [17, 4, 14], floor: [17], priority: 4 },
};

// ---------------------------------------------------------------- the layout (rooms on the grid)
// Splits a rectangle in rooms (BSP); returns { rooms: [{ x0, y0, x1, y1 }], splits: [{ axis, at, a: [rooms], b: [rooms] }] } in grid units
// fixed: { w, d } to split a rectangle of that size (the floors of a house all have the same one) instead of choosing one
export function layoutRooms(count, minU, maxU, rng, fixed) {
  // the whole area: about the size of the rooms together, a little longer than wide; when the rooms do not fit the area grows and it is tried again
  const avg = (minU + maxU) / 2;
  const aspect = 1 + rng() * 0.8, spread = 0.9 + rng() * 0.3;
  for (let grow = spread; grow < 4; grow += 0.25) {
    const area = count * avg * avg * grow;
    const w = fixed ? fixed.w : Math.max(minU, Math.round(Math.sqrt(area * aspect))), d = fixed ? fixed.d : Math.max(minU, Math.round(area / w));
    const rooms = [{ x0: 0, y0: 0, x1: w, y1: d }];
    const splits = [];
    for (let guard = 0; rooms.length < count && guard < 200; guard++) {
      // the biggest room that can still be split, along its longer side
      const cand = rooms.filter(r => Math.max(r.x1 - r.x0, r.y1 - r.y0) >= minU * 2).sort((a, b) => (b.x1 - b.x0) * (b.y1 - b.y0) - (a.x1 - a.x0) * (a.y1 - a.y0));
      if (!cand.length) break;
      const r = cand[0];
      const rw = r.x1 - r.x0, rd = r.y1 - r.y0;
      const alongX = fixed && fixed.firstAlongX !== undefined && rooms.length === 1 ? fixed.firstAlongX : rw >= rd;
      const len = alongX ? rw : rd;
      const at = Math.max(minU, Math.min(len - minU, Math.round(len * (0.4 + rng() * 0.2))));
      const a = alongX ? { x0: r.x0, y0: r.y0, x1: r.x0 + at, y1: r.y1 } : { x0: r.x0, y0: r.y0, x1: r.x1, y1: r.y0 + at };
      const b = alongX ? { x0: r.x0 + at, y0: r.y0, x1: r.x1, y1: r.y1 } : { x0: r.x0, y0: r.y0 + at, x1: r.x1, y1: r.y1 };
      rooms.splice(rooms.indexOf(r), 1, a, b);
      splits.push({ alongX, at: alongX ? r.x0 + at : r.y0 + at, parent: r, a, b });
    }
    if (rooms.length >= count || fixed) return { rooms, splits, w, d };
  }
  return { rooms: [{ x0: 0, y0: 0, x1: minU * 2, y1: minU * 2 }], splits: [], w: minU * 2, d: minU * 2 };
}

// The rooms with the size each one asked for. specs: [{ type, size }] (size: the side of the room in meters). The outline has the area of all the rooms together (it
// grows by a unit at a time until every room fits) or is `fixed`: { w, d, firstAlongX }, as in the floors of a house, and then the rooms are scaled to fill it. It is
// split like a treemap: the rooms go in two groups of about the same area, the rectangle is cut along its longer side in the proportion of the two areas, and every
// group is split again until a room is left. A room is two units (3.21 m) wide at least, so a rectangle of w x h holds at most (w / 2) x (h / 2) rooms, and a cut is
// only made where both sides can still hold their groups. Returns { rooms (with .spec), splits (the first one is the cut of the whole), w, d, dropped }; `dropped`
// counts the rooms that did not fit (only with a `fixed` outline that is too small for them)
const roomsHeld = (w, h) => Math.floor(w / 2) * Math.floor(h / 2);
function layoutOnce(order, w, d, fixed) {
  const area = (sp) => (sp.size / UNIT) * (sp.size / UNIT);
  const rooms = [], splits = [];
  let dropped = 0;
  const queue = [{ rect: { x0: 0, y0: 0, x1: w, y1: d }, group: order }];
  for (let qi = 0; qi < queue.length; qi++) {
    const { rect, group } = queue[qi];
    if (group.length === 1) { rect.spec = group[0]; rooms.push(rect); continue; }
    const rw = rect.x1 - rect.x0, rd = rect.y1 - rect.y0;
    const first = qi === 0 && fixed && fixed.firstAlongX !== undefined ? fixed.firstAlongX : rw >= rd;
    // the ways to divide the group: balanced by area first, then by the first k of the list (the biggest ones)
    const splitsOf = [];
    const ga = [], gb = [];
    let sa = 0, sb = 0;
    for (const sp of group) { if (sa <= sb) { ga.push(sp); sa += area(sp); } else { gb.push(sp); sb += area(sp); } }
    splitsOf.push([ga, gb]);
    for (let k = 1; k < group.length; k++) splitsOf.push([group.slice(0, k), group.slice(k)]);
    let done = null;
    for (const [A, B] of splitsOf) {
      const ta = A.reduce((x, sp) => x + area(sp), 0), tb = B.reduce((x, sp) => x + area(sp), 0);
      for (const alongX of (qi === 0 && fixed && fixed.firstAlongX !== undefined ? [first] : [first, !first])) {
        const len = alongX ? rw : rd, other = alongX ? rd : rw;
        let best = -1;
        for (let at = 2; at <= len - 2; at++) {
          if (roomsHeld(at, other) < A.length || roomsHeld(len - at, other) < B.length) continue;
          if (best < 0 || Math.abs(at - len * ta / (ta + tb)) < Math.abs(best - len * ta / (ta + tb))) best = at;
        }
        if (best >= 0) { done = { A, B, alongX, at: best }; break; }
      }
      if (done) break;
    }
    if (!done) { rect.spec = group[0]; rooms.push(rect); dropped += group.length - 1; continue; }
    const { A, B, alongX, at } = done;
    const a = alongX ? { x0: rect.x0, y0: rect.y0, x1: rect.x0 + at, y1: rect.y1 } : { x0: rect.x0, y0: rect.y0, x1: rect.x1, y1: rect.y0 + at };
    const b = alongX ? { x0: rect.x0 + at, y0: rect.y0, x1: rect.x1, y1: rect.y1 } : { x0: rect.x0, y0: rect.y0 + at, x1: rect.x1, y1: rect.y1 };
    splits.push({ alongX, at: alongX ? rect.x0 + at : rect.y0 + at, parent: rect, a, b });
    queue.push({ rect: a, group: A }, { rect: b, group: B });
  }
  return { rooms, splits, w, d, dropped };
}
export function layoutSized(specs, rng, fixed) {
  const area = (sp) => (sp.size / UNIT) * (sp.size / UNIT);
  // same sizes in a random order, then the biggest first
  const order = specs.map(sp => ({ sp, k: rng() })).sort((a, b) => b.sp.size - a.sp.size || a.k - b.k).map(o => o.sp);
  if (fixed) return layoutOnce(order, fixed.w, fixed.d, fixed);
  if (specs.length === 1) { const u = Math.max(2, Math.round(specs[0].size / UNIT)); return layoutOnce(order, u, u); }
  const total = specs.reduce((a, sp) => a + area(sp), 0) * 1.1, aspect = 1 + rng() * 0.8;
  let w = Math.max(2, Math.round(Math.sqrt(total * aspect))), d = Math.max(2, Math.round(total / w));
  for (let guard = 0; guard < 200; guard++) {
    const lay = roomsHeld(w, d) >= specs.length ? layoutOnce(order, w, d) : null;
    if (lay && !lay.dropped) return lay;
    if (w <= d) w++; else d++;           // a unit more on the shorter side, until all the rooms fit
  }
  return layoutOnce(order, w, d);
}

export const inside = (r, x0, y0, x1, y1) => x0 >= r.x0 && x1 <= r.x1 && y0 >= r.y0 && y1 <= r.y1;
// Rooms of a group (the pieces a split made) that touch the line of the split
export function touching(group, alongX, at) {
  return group.filter(r => (alongX ? (r.x0 === at || r.x1 === at) : (r.y0 === at || r.y1 === at)));
}

// ---------------------------------------------------------------- types of the rooms and the panels of the walls (also used by the houses)
// The room of the entrance gets the first kind in the order sala, cozinha, escritório, quarto, banheiro (what is not asked for is skipped); the bathrooms go
// to the rooms in the corners of the outline (not to the ones in the middle or along a corridor); the rest to the other rooms, the biggest first
export function assignTypes(rooms, types, entry, W, D, rightIsOutside = true) {
  const order = [...types].sort((a, b) => ROOM_TYPES[a].priority - ROOM_TYPES[b].priority);
  const area = (r) => (r.x1 - r.x0) * (r.y1 - r.y0);
  const isCorner = (r) => (r.x0 === 0 || (rightIsOutside && r.x1 === W)) && (r.y0 === 0 || r.y1 === D);
  const left = new Set(rooms);
  if (entry && order.length) { entry.type = order.shift(); left.delete(entry); }
  const baths = order.filter(t => t === 'banheiro');
  const rest = order.filter(t => t !== 'banheiro');
  for (const t of baths) {
    const pool = [...left].sort((a, b) => area(a) - area(b));
    const r = pool.find(isCorner) || pool[0];
    if (!r) break;
    r.type = t; left.delete(r);
  }
  const bySize = [...left].sort((a, b) => area(b) - area(a));
  bySize.forEach((r, i) => { r.type = rest[i] || types[i % types.length]; });
}

// The panels of the kit by size: the walls and the floors are made of the biggest panel that fits (fewer objects). Every style has panels of 1.61 m, 3.21 m and
// 9.63 m of width and 3.5 m of height (ids 19426 + s, 19353 + s and 19445 + s) and some have a huge one of 9.63 x 10.5 m (HUGE)
export const bigModel = (s) => 19445 + s;
export const HUGE = { 3: 19375, 7: 19376, 9: 19377, 13: 19378, 17: 19379 };
export const hugeModel = (s) => HUGE[s];
const THICK = 0.18;

// The panels of the kit with a doorway (the size of the door of the game): 3.21 m of width like the wall of two units, one for each style that has it (ids 19383 to
// 19398); the three styles that do not have one use the one of a look-alike
const DOOR_IDS = { 0: 19383, 1: 19384, 2: 19385, 3: 19386, 4: 19387, 5: 19388, 6: 19389, 8: 19390, 9: 19391, 10: 19392, 11: 19393, 12: 19394, 14: 19395, 15: 19396, 16: 19397, 18: 19398 };
const DOOR_LIKE = { 7: 3, 13: 6, 17: 8 };
export const doorModel = (s) => DOOR_IDS[s] || DOOR_IDS[DOOR_LIKE[s]] || DOOR_IDS[4];
// The style that the panel with a doorway of the style s really has (the three styles without one use a look-alike): the structure of the doorway of those gets the
// texture of the wall by a material swap (with the gray 127 that the panels of the kit have, so it is as bright as them), so it matches the walls around it
const doorLook = (s) => (DOOR_IDS[s] ? s : (DOOR_LIKE[s] ?? 4));
export const DOOR_UNITS = 2;           // a doorway takes two units of the grid (3.21 m)
// The cuts of the doorways of a layout: the two units of the wall stay in `edges`, and the first one is where the panel with the doorway goes (and the second is skipped)
export function doorCutter(keyOf) {
  const start = new Set(), skip = new Set(), list = [];
  const cut = (alongX, line, from, len = DOOR_UNITS) => {
    start.add(keyOf(alongX, line, from));
    for (let k = 1; k < len; k++) skip.add(keyOf(alongX, line, from + k));
    list.push({ alongX, line, from, len });
  };
  return { cut, start, skip, list };
}
// where a doorway of two units goes in a stretch of wall from lo to hi (not at the corners when there is room)
export function doorSlot(lo, hi, rng) {
  const span = hi - lo, margin = span >= 4 ? 1 : 0;
  return lo + margin + rng.int(Math.max(1, span - DOOR_UNITS - 2 * margin + 1));
}

// The panels of the walls of a layout, joined in runs (the doorways are already out of `edges`). The walls are 18 cm thick; each one is put on the outer side of
// the line of the room that owns it, so that the inside of that room is exactly on its line and its corners are clean (two walls meet in a square corner, with no
// extra piece and no piece over another one); what is left over goes to the outside (or to the thickness of the next room), where nobody looks.
// opts: { levels: panels one over the other (3.5 m each), have(id): the model exists }; a run is covered with panels of 6, 2 and 1 units (9.63, 3.21 and 1.61 m),
// and with the huge panel (9.63 x 10.5 m) for three levels at once where there is one
export function placeWallRuns(edges, place, opts = {}) {
  const levels = Math.max(1, opts.levels || 1), have = opts.have || (() => true);
  for (const alongX of [true, false]) {
    const lines = new Map();
    for (const [key, room] of edges) {
      const [t, a, b] = key.split('|'); if ((t === 'h') !== alongX) continue;
      if (opts.doorSkip?.has(key)) continue;
      const line = +a, unit = +b;
      // which side of the line is the owner's outside: -1 (lower) or +1 (higher)
      const side = alongX ? (room.y0 === line ? -1 : 1) : (room.x0 === line ? -1 : 1);
      const k = line + '|' + side;
      if (!lines.has(k)) lines.set(k, { line, side, segs: [] });
      lines.get(k).segs.push({ unit, room, door: opts.doorStart?.has(key) });
    }
    for (const { line, side, segs } of lines.values()) {
      segs.sort((p, q) => p.unit - q.unit);
      let i = 0;
      while (i < segs.length) {
        let j = i;
        if (segs[i].door) {
          // the panel with the doorway, in the middle of its two units, and the plain wall over it when there are more layers
          const style = segs[i].room.wallStyle, across = line * UNIT + side * THICK / 2, along = (segs[i].unit + DOOR_UNITS / 2) * UNIT;
          const put = (model, z) => (alongX ? place(model, along, across, z, 0, 0, 90) : place(model, across, along, z, 0, 0, 0));
          const door = put(have(doorModel(style)) ? doorModel(style) : wallModel(style), HEIGHT / 2);
          if (door && have(doorModel(style)) && doorLook(style) !== style) door.materials = [{ index: 0, model: wallModel(style), txd: 'all_walls', texture: WALL_STYLES[style][0], color: '0xFF7F7F7F' }];
          for (let lv = 1; lv < levels; lv++) put(wallModel(style), HEIGHT / 2 + levelZ(lv));
          i++;
          continue;
        }
        // a run: the units follow one another and the wall has the same style (a doorway ends it)
        while (j + 1 < segs.length && segs[j + 1].unit === segs[j].unit + 1 && !segs[j + 1].door && segs[j + 1].room.wallStyle === segs[i].room.wallStyle) j++;
        const style = segs[i].room.wallStyle;
        const u0 = segs[i].unit, n = j - i + 1;
        let u = u0, left = n;
        const across = line * UNIT + side * THICK / 2;
        while (left > 0) {
          const span = left >= 6 && have(bigModel(style)) ? 6 : (left >= 2 ? 2 : 1);
          const along = (u + span / 2) * UNIT;
          const put = (model, z) => { if (alongX) place(model, along, across, z, 0, 0, 90); else place(model, across, along, z, 0, 0, 0); };
          let lv = 0;
          if (span === 6 && hugeModel(style) && have(hugeModel(style))) while (levels - lv >= 3) { put(hugeModel(style), 5.25 + levelZ(lv)); lv += 3; }
          const model = span === 6 ? bigModel(style) : (span === 2 ? wallModel(style) : smallModel(style));
          for (; lv < levels; lv++) put(model, HEIGHT / 2 + levelZ(lv));
          u += span; left -= span;
        }
        i = j + 1;
      }
    }
  }
}

// A floor or a ceiling of the whole outline: tiles (the panels of the kit lying down) in one grid, none over another one. The grid is of 3.5 x 3.21 m cells: the rows
// go along y (a row is two units of the grid, the last one can be a half row of the small panel, so they end exactly on the line); the columns of 3.5 m start at xa
// (columns also to the left of xa if the outline goes there) and the last one is left over outside the outline. The tiles are the biggest that fit in cells that
// are all there with the same style: the huge panel (3 x 3 cells), the big one (3 rows, 9.63 m) or the one of one cell (or of half a row). Where a tile is is not
// decided by the room: its style is the one of the room that has the middle of the cell; skip(cx, cy) leaves holes (for stairs); solid(cx, cy) tells if a
// cell is well inside the outline (a big tile is only used over cells that are)
export function tileLevel(place, o) {
  const { xa, xmin, xmax, units, z, ry, styleAt, skip, solid, have = () => true } = o;
  const jmin = Math.floor((xmin - xa) / TILE_X + 1e-6), jmax = Math.ceil((xmax - xa) / TILE_X - 1e-6) - 1;
  const rows = [];
  for (let r = 0; r + 2 <= units; r += 2) rows.push({ y: (r + 1) * UNIT, small: false });
  if (units % 2) rows.push({ y: (units - 0.5) * UNIT, small: true });
  const cols = [];
  for (let j = jmin; j <= jmax; j++) cols.push(j);
  const cell = new Map();                                   // 'j|r' -> { cx, cy, style, ok, used }
  const key = (j, r) => j + '|' + r;
  for (const j of cols) {
    const cx = xa + TILE_X * j + TILE_X / 2;
    rows.forEach((row, r) => {
      if (skip && skip(cx, row.y)) return;
      const style = styleAt(Math.max(xmin, Math.min(xmax, cx)), row.y);
      if (style === null || style === undefined) return;
      cell.set(key(j, r), { cx, cy: row.y, style, ok: !solid || solid(cx, row.y), used: false });
    });
  }
  const group = (j, r, nj, nr, style) => {
    for (let a = 0; a < nj; a++) for (let b = 0; b < nr; b++) {
      const c = cell.get(key(j + a, r + b));
      if (!c || c.used || !c.ok || c.style !== style || rows[r + b].small) return false;
    }
    return true;
  };
  const take = (j, r, nj, nr) => { for (let a = 0; a < nj; a++) for (let b = 0; b < nr; b++) cell.get(key(j + a, r + b)).used = true; };
  for (const j of cols) for (let r = 0; r < rows.length; r++) {                 // the huge panel: 3 columns x 3 rows
    const c = cell.get(key(j, r));
    if (!c || c.used || !hugeModel(c.style) || !have(hugeModel(c.style)) || !group(j, r, 3, 3, c.style)) continue;
    place(hugeModel(c.style), xa + TILE_X * j + 1.5 * TILE_X, rows[r + 1].y, z, 0, ry, 0);
    take(j, r, 3, 3);
  }
  for (const j of cols) for (let r = 0; r < rows.length; r++) {                 // the big panel: one column x 3 rows
    const c = cell.get(key(j, r));
    if (!c || c.used || !have(bigModel(c.style)) || !group(j, r, 1, 3, c.style)) continue;
    place(bigModel(c.style), c.cx, rows[r + 1].y, z, 0, ry, 0);
    take(j, r, 1, 3);
  }
  for (const j of cols) rows.forEach((row, r) => {
    const c = cell.get(key(j, r));
    if (!c || c.used) return;
    place(row.small ? smallModel(c.style) : wallModel(c.style), c.cx, row.y, z, 0, ry, 0);
  });
}
export const TILE_ROW = TILE_Y;

// A corridor: the first split of the layout (the one that cuts the whole plan in two) is opened to a strip of two units (3.21 m) between its two sides: the pieces on
// one side and all of their rooms are moved over. Returns the corridor (not in `rooms` yet) or null when there is nothing to split
export function carveCorridor(rooms, splits) {
  if (!splits.length) return null;
  const s0 = splits[0], sh = 2;
  const moved = new Set([s0.b]);
  for (const r of rooms) if (inside(s0.b, r.x0, r.y0, r.x1, r.y1)) moved.add(r);
  for (const sp of splits.slice(1)) if (inside(s0.b, sp.parent.x0, sp.parent.y0, sp.parent.x1, sp.parent.y1)) { moved.add(sp.parent); moved.add(sp.a); moved.add(sp.b); sp.at += sh; }
  for (const r of moved) { if (s0.alongX) { r.x0 += sh; r.x1 += sh; } else { r.y0 += sh; r.y1 += sh; } }
  const corridor = s0.alongX ? { x0: s0.at, x1: s0.at + sh, y0: s0.a.y0, y1: s0.a.y1 } : { x0: s0.a.x0, x1: s0.a.x1, y0: s0.at, y1: s0.at + sh };
  splits.splice(0, 1, { alongX: s0.alongX, at: s0.at, a: s0.a, b: corridor, corridor: true }, { alongX: s0.alongX, at: s0.at + sh, a: corridor, b: s0.b, corridor: true });
  return corridor;
}

// A doorway between the two sides of every split: where the rooms of both sides touch for at least 2 units. With a corridor, every room that touches it has a
// doorway to it; the other splits only get one when it joins two pieces that are not joined yet (so a room is not left without a way in). `rooms` has the corridor
export function connectDoors(rooms, splits, corridor, cut, rng) {
  const group = new Map(rooms.map(r => [r, r]));
  const root = (r) => { while (group.get(r) !== r) r = group.get(r); return r; };
  const join = (a, b) => { group.set(root(a), root(b)); };
  const overlap = (s, a, b) => [s.alongX ? Math.max(a.y0, b.y0) : Math.max(a.x0, b.x0), s.alongX ? Math.min(a.y1, b.y1) : Math.min(a.x1, b.x1)];
  for (const s of [...splits].sort((p, q) => (q.corridor ? 1 : 0) - (p.corridor ? 1 : 0))) {
    const A = touching([...rooms].filter(r => r !== corridor && inside(s.a, r.x0, r.y0, r.x1, r.y1)), s.alongX, s.at);
    const B = touching([...rooms].filter(r => r !== corridor && inside(s.b, r.x0, r.y0, r.x1, r.y1)), s.alongX, s.at);
    if (s.corridor) {
      for (const r of (s.b === corridor ? A : B)) {
        const [lo, hi] = overlap(s, r, corridor);
        if (hi - lo < 2) continue;
        cut(!s.alongX, s.at, doorSlot(lo, hi, rng));
        join(r, corridor);
      }
      continue;
    }
    const opts = [];
    for (const a of A) for (const b of B) {
      const [lo, hi] = overlap(s, a, b);
      if (hi - lo >= 2 && root(a) !== root(b)) opts.push({ a, b, lo, hi });
    }
    if (!opts.length) continue;
    const o = rng.pick(opts);
    cut(!s.alongX, s.at, doorSlot(o.lo, o.hi, rng));
    join(o.a, o.b);
    o.a.door = true; o.b.door = true;
  }
}

// ---------------------------------------------------------------- the generator
// params: { rooms: ['sala', 'quarto', ...], sizeMin, sizeMax (m), wallStyle (-1: by room), floorStyle (-1: by room), ceiling, entrance, furniture (0 none,
// 1 some, 2 many), seed }
// env: { models, gd, origin: { x, y, z (the floor), yaw (degrees) } }
export async function generateInterior(params, env) {
  const rng = makeRng(params.seed);
  ({ params, env } = applyTheme(params, env, rng));
  const have = (id) => env.gd.models.has(id);
  if (!have(wallModel(0)) || !have(smallModel(0))) return { items: [], notes: ['sem-samp'], made: 0 };
  const specs = params.rooms.slice(0, 12).map(r => (typeof r === 'string' ? { type: r, size: 3 } : r));
  if (!specs.length) return { items: [], notes: ['sem-comodos'], made: 0 };
  const { rooms, splits, dropped } = layoutSized(specs, rng);

  const corridor = params.corridor ? carveCorridor(rooms, splits) : null;

  const W = Math.max(...rooms.concat(corridor || []).map(r => r.x1)), D = Math.max(...rooms.concat(corridor || []).map(r => r.y1));
  // the room of the entrance: the first kind that exists, in this order: living room, office, kitchen, bedroom, bathroom (the corridor is not in the list). When
  // the room of that kind has no piece of outside wall for a doorway it trades kinds with the room that has one and the closest area, so the first room that one
  // enters is the one that comes first in the list; of the same kind the one on the side that faces the camera (x = 0), then the widest one
  rooms.forEach(r => { r.type = r.spec.type; });
  const PRIORITY = ['sala', 'escritorio', 'cozinha', 'quarto', 'banheiro'];
  const outside = (r) => (r.x0 === 0 && r.y1 - r.y0 >= 2) * 4 + (r.y0 === 0 && r.x1 - r.x0 >= 2) + (r.y1 === D && r.x1 - r.x0 >= 2) + (r.x1 === W && r.y1 - r.y0 >= 2);
  const roomArea = (r) => (r.x1 - r.x0) * (r.y1 - r.y0);
  const withWall = rooms.filter(outside);
  const kind = PRIORITY.find(t => rooms.some(r => r.type === t));
  const byFace = (a, b) => outside(b) - outside(a) || (b.x0 === 0) - (a.x0 === 0) || (b.y1 - b.y0) - (a.y1 - a.y0);
  let entry = withWall.filter(r => r.type === kind).sort(byFace)[0];
  if (!entry && withWall.length && kind) {
    let best = null;
    for (const a of rooms.filter(r => r.type === kind)) for (const b of withWall) {
      const diff = Math.abs(roomArea(a) - roomArea(b));
      if (best === null || diff < best.diff) best = { a, b, diff };
    }
    [best.a.type, best.b.type] = [best.b.type, best.a.type];
    entry = best.b;
  }
  entry = entry || rooms[0];
  rooms.forEach((r, i) => {
    r.id = i;
    const t = ROOM_TYPES[r.type];
    r.wallStyle = params.wallStyle >= 0 ? params.wallStyle : rng.pick(t.wall);
    r.floorStyle = params.floorStyle >= 0 ? params.floorStyle : rng.pick(t.floor);
    r.ceilStyle = params.ceilingStyle >= 0 ? params.ceilingStyle : rng.pick(CEILING_STYLES);
  });
  if (corridor) {
    // the corridor looks like the rooms when the walls and the floor were chosen (or the same theme), else it has the walls of a corridor and a carpet
    Object.assign(corridor, { type: 'hall', id: rooms.length, wallStyle: params.wallStyle >= 0 ? params.wallStyle : 2, floorStyle: params.floorStyle >= 0 ? params.floorStyle : 9, ceilStyle: params.ceilingStyle >= 0 ? params.ceilingStyle : 16 });
    rooms.push(corridor);
  }
  // ---- the walls on the grid: every edge of every room; the doorways cut them
  const edges = new Map();           // 'h|y|x' or 'v|x|y' -> room that owns the wall
  const hk = (y, x) => 'h|' + y + '|' + x, vk = (x, y) => 'v|' + x + '|' + y;
  for (const r of rooms) {
    for (let x = r.x0; x < r.x1; x++) { for (const y of [r.y0, r.y1]) if (!edges.has(hk(y, x))) edges.set(hk(y, x), r); }
    for (let y = r.y0; y < r.y1; y++) { for (const x of [r.x0, r.x1]) if (!edges.has(vk(x, y))) edges.set(vk(x, y), r); }
  }
  const { cut, start: doorStart, skip: doorSkip, list: doors } = doorCutter((alongX, line, from) => (alongX ? hk(line, from) : vk(line, from)));    // { alongX (the wall goes along X), line, from, len }
  // a doorway between the two sides of every split: where the rooms of both sides touch for at least 2 units. With a corridor, every room that touches it has a
  // doorway to it; the other splits only get one when it joins two pieces that are not joined yet (so a room is not left without a way in)
  connectDoors(rooms, splits, corridor, cut, rng);
  // the entrance: on an outside wall of the room that has the first kind, on the wall that faces the camera when it has one
  if (params.entrance !== false) {
    const sides = [];
    if (entry.x0 === 0 && entry.y1 - entry.y0 >= 2) sides.push({ alongX: false, line: 0, from: entry.y0, to: entry.y1 });
    else {
      if (entry.y0 === 0 && entry.x1 - entry.x0 >= 2) sides.push({ alongX: true, line: 0, from: entry.x0, to: entry.x1 });
      if (entry.y1 === D && entry.x1 - entry.x0 >= 2) sides.push({ alongX: true, line: D, from: entry.x0, to: entry.x1 });
      if (entry.x1 === W && entry.y1 - entry.y0 >= 2) sides.push({ alongX: false, line: W, from: entry.y0, to: entry.y1 });
    }
    if (sides.length) {
      const sd = rng.pick(sides);
      cut(sd.alongX, sd.line, doorSlot(sd.from, sd.to, rng));
      entry.entrance = true;
    }
  }

  // the interior is centered in front of the camera: the frame goes back half of the width of the layout
  const totalD = Math.max(...rooms.map(r => r.y1)) * UNIT;
  {
    const c0 = Math.cos(env.origin.yaw * D2R), s0 = Math.sin(env.origin.yaw * D2R);
    env = { ...env, origin: { ...env.origin, x: env.origin.x + (0 * c0 - (-totalD / 2) * s0), y: env.origin.y + (0 * s0 + (-totalD / 2) * c0) } };
  }

  // ---- the panels of the walls, joined in runs
  const items = [];
  const place = (model, lx, ly, lz, rx, ry, rzLocal) => {
    const c = Math.cos(env.origin.yaw * D2R), s = Math.sin(env.origin.yaw * D2R);
    items.push({ model, x: env.origin.x + lx * c - ly * s, y: env.origin.y + lx * s + ly * c, z: env.origin.z + lz, rx, ry, rz: rzLocal + env.origin.yaw });
    return items[items.length - 1];
  };
  placeWallRuns(edges, place, { have, doorStart, doorSkip });

  // ---- floors and ceilings: one grid of tiles for the whole outline (see tileLevel)
  const Wm = Math.max(...rooms.map(r => r.x1)) * UNIT;
  const styleAt = (kind) => (cx, cy) => {
    let best = null, bd = Infinity;
    for (const r of rooms) {
      const dx = Math.max(r.x0 * UNIT - cx, 0, cx - r.x1 * UNIT), dy = Math.max(r.y0 * UNIT - cy, 0, cy - r.y1 * UNIT), d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = r; }
    }
    return kind === 'floor' ? best.floorStyle : (kind === 'ceiling' ? best.ceilStyle : best.wallStyle);
  };
  tileLevel(place, { xa: 0, xmin: 0, xmax: Wm, units: D, z: -0.09, ry: 90, styleAt: styleAt('floor'), have });
  if (params.ceiling) tileLevel(place, { xa: 0, xmin: 0, xmax: Wm, units: D, z: ceilingZ(1), ry: 90, styleAt: styleAt('ceiling'), have });

  // ---- furniture
  let furnished = 0;
  if (params.furniture > 0) furnished = await furnish(rooms, doors, { ...params, hasCeiling: !!params.ceiling }, env, rng, place, edges);
  return { items, notes: [], dropped, entranceTo: entry.entrance ? entry.type : null, made: items.length, rooms: rooms.length, doors: doors.length, furniture: furnished, size: { w: Math.max(...rooms.map(r => r.x1)) * UNIT, d: Math.max(...rooms.map(r => r.y1)) * UNIT } };
}
