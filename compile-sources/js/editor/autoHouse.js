// Auto Criar: houses with more than one floor. Every floor has the same outline (a rectangle of rooms, each floor with its own rooms, walls and furniture) and,
// along one side, a stair hall with two lanes of stairs side by side (3.5 m each, the width of a step). Each floor has its own flight of stairs, which goes from
// that floor to the next one: the flights of the even floors are in the first lane, the ones of the odd floors in the second lane, and they go in opposite
// directions, so the stairs turn back at every landing like in a real house (a straight stair through all the floors would be one long ramp).
// The slab between two floors is a ceiling tile and a floor tile one over the other, with a hole where the flight goes through. The holes follow the grid of the
// tiles, so no tile is cut or put over another one.
import { makeRng } from './autoTrack.js';
import { UNIT, HEIGHT, ceilingZ, ROOM_TYPES, TILE, wallModel, smallModel, layoutSized, inside, touching, furnish, applyTheme, placeWallRuns, tileLevel, doorCutter, carveCorridor, connectDoors, CEILING_STYLES } from './autoInterior.js';

const D2R = Math.PI / 180;
const PITCH = HEIGHT + 0.3;             // from a floor to the next one (the slab is two tiles of 0.18, the ceiling goes 4 cm into the walls and the floor over it 2 cm into the ceiling)
const ROWS = 3;                         // rows of tiles (3.21 m) of a flight: 9.63 m
const LAND = 2;                         // rows of landing at each end of the flights
const STEPS = 20;                       // steps in a flight (19 cm high, 48 cm deep)
const HALL = 7;                         // width of the stair hall, in units of the grid: two lanes of 3.5 m and what is left over beside them
const THICK = 0.18;                     // thickness of the walls

// params: { floors: [{ rooms: [types], wallStyle, floorStyle, ceilingStyle (-1: by room), corridor (a corridor between the rooms of that floor) }, ...] (2 to 10), sizeMin, sizeMax, ceiling (a roof on the top floor),
// entrance, furniture (0, 1, 2), pattern, seed }; env as for generateInterior
export async function generateHouse(params, env) {
  const rng = makeRng(params.seed);
  ({ params, env } = applyTheme(params, env, rng));
  const have = (id) => env.gd.models.has(id);
  if (!have(wallModel(0)) || !have(smallModel(0))) return { items: [], notes: ['sem-samp'], made: 0 };
  const floors = params.floors.slice(0, 10);
  const F = floors.length;
  const specsOf = (f) => (f.rooms.length ? f.rooms : [{ type: 'quarto', size: 3 }]).slice(0, 10).map(r => (typeof r === 'string' ? { type: r, size: 3 } : r));
  let dropped = 0;
  const hallDoors = [];
  // the outline: the one that the fullest floor needs (every floor has the same one, so every room of every floor fits), with 2 more units on the depth for the
  // corridor of a floor that has one; tall enough for a flight (3 rows) with a landing of 2 rows on each side, and an even number of units (rows of two)
  const needs = floors.map(f => ({ lay: layoutSized(specsOf(f), rng), corridor: f.corridor !== false && f.rooms.length > 1 }));
  let W = 2, D = 2 * (ROWS + 2 * LAND);
  for (const n of needs) { W = Math.max(W, n.lay.w); D = Math.max(D, n.lay.d); }
  // the first cut of a floor with a corridor is across the longer side of the outline (a cut at x when it is wider than deep) and takes 2 units of it, so a floor
  // with a corridor needs those units more than the rooms alone
  const corridorAlongX = W >= D;
  {
    let w2 = W, d2 = D;
    for (const n of needs) { w2 = Math.max(w2, n.lay.w + (n.corridor && corridorAlongX ? 2 : 0)); d2 = Math.max(d2, n.lay.d + (n.corridor && !corridorAlongX ? 2 : 0)); }
    W = w2; D = d2;
  }
  if (D % 2) D++;
  const R = D / 2;                                            // rows of tiles
  const fixed = { w: W, d: D };
  const TY = 2 * UNIT;                                        // a row
  const items = [];

  // the frame of the house: its y goes forward (the entrance, at y = 0, is the end that is near the camera) and its x to the right; the house is centered
  // in front of the camera
  {
    const yaw = env.origin.yaw - 90;
    const c0 = Math.cos(yaw * D2R), s0 = Math.sin(yaw * D2R), half = (W + HALL) * UNIT / 2;
    env = { ...env, origin: { ...env.origin, yaw, x: env.origin.x - half * c0, y: env.origin.y - half * s0 } };
  }
  const c = Math.cos(env.origin.yaw * D2R), s = Math.sin(env.origin.yaw * D2R);
  const placeAt = (level) => (model, lx, ly, lz, rx, ry, rzLocal) => {
    items.push({ model, x: env.origin.x + lx * c - ly * s, y: env.origin.y + lx * s + ly * c, z: env.origin.z + level * PITCH + lz, rx, ry, rz: rzLocal + env.origin.yaw });
    return items[items.length - 1];
  };
  // the hall: its walls are put on its outer side like the ones of the rooms (see placeWallRuns); the wall that it shares with the rooms is owned by the rooms,
  // so the inside of the hall starts a wall thickness after the line W
  const xa = W * UNIT + THICK;                                 // where the lanes start (the first column of tiles of the hall)
  const GAP = 1.5;                                             // free space between the wall and each side of the stairs, to walk behind them
  const xg = xa + GAP - 3.5;                                   // the grid of the tiles of the whole outline: its column 1 and 2 are the lanes
  const laneX = (lane) => xa + GAP + 1.75 + 3.5 * lane;              // the middle of a lane
  // the flight of the floor k: lane k % 2; the even ones go toward the entrance (-y) from the back landing, the odd ones toward the back (+y)
  const flight = (k) => {
    const up = k % 2 === 0 ? -1 : 1;
    const y0 = (R - LAND - ROWS) * TY, y1 = (R - LAND) * TY;
    return { lane: k % 2, up, yFoot: up < 0 ? y1 : y0, y0, y1 };
  };
  let totalRooms = 0, totalDoors = 0, totalFurniture = 0;

  for (let k = 0; k < F; k++) {
    const place = placeAt(k);
    const specs = specsOf(floors[k]);
    // a corridor on this floor: the first split of the layout is opened to a strip of 2 units, so the layout is 2 units shorter on the side that the strip crosses
    // and the whole is as big as the outline; the strip goes along the longer side
    let fixedK = fixed;
    if (floors[k].corridor !== false && specs.length > 1) fixedK = corridorAlongX ? { w: W - 2, d: D, firstAlongX: true } : { w: W, d: D - 2, firstAlongX: false };
    const lay = layoutSized(specs, rng, fixedK);
    const rooms = lay.rooms, splits = lay.splits;
    dropped += lay.dropped;
    const corridor = fixedK !== fixed ? carveCorridor(rooms, splits) : null;
    // every floor has its own walls, floor and ceiling (-1: by room)
    const ws = floors[k].wallStyle, fs = floors[k].floorStyle, cs = floors[k].ceilingStyle;
    const hallStyle = ws >= 0 ? ws : rng.pick([4, 17, 18]), hallFloor = fs >= 0 ? fs : 17, hallCeil = cs >= 0 ? cs : 16;
    // the door of this floor leads to the first kind that exists on it, in this order: living room, office, kitchen, bedroom, bathroom (the corridor is not in
    // the list). The doorway only goes where the hall has a landing (before the first step or after the last one), never in front of the stairs, and as near as it
    // can to where the flight that arrives at this floor ends (the front landing for the even flights, the back one for the odd ones, the front one on the ground
    // floor). When the room of that kind is not by the hall (or its wall by the hall is all in front of the stairs) it trades kinds with the room that is by the
    // hall and has the closest area, so the first room that one enters is the one that comes first in the list
    const u0 = (k === 0 ? 2 : ((k - 1) % 2 === 0 ? 2 * (R - LAND - ROWS) - 1 : 2 * R - 1)) - 1;
    const fr = 2 * (R - LAND - ROWS), bk = 2 * (R - LAND);
    const slot = (r) => {                   // the doorway (two units) nearest to u0 that is on a landing and inside the wall of the room, or null
      let best = null;
      for (const [lo, hi] of [[r.y0, Math.min(r.y1, fr)], [Math.max(r.y0, bk), r.y1]]) {
        if (hi - lo < 2) continue;
        const at = Math.max(lo, Math.min(hi - 2, u0));
        if (best === null || Math.abs(at - u0) < Math.abs(best - u0)) best = at;
      }
      return best;
    };
    rooms.forEach(r => { r.type = r.spec.type; });
    // the doorway stays where it always was (u0, in the wall of the room that has the landing); the kind of that room is what changes: it trades kinds with the
    // room of the first kind of the list, the one with the closest area
    let doorRoom = null, doorAt = null;
    {
      const PRIORITY = ['sala', 'escritorio', 'cozinha', 'quarto', 'banheiro'];
      const area = (r) => (r.x1 - r.x0) * (r.y1 - r.y0);
      const owner = rooms.find(r => r.x1 === W && r.y0 <= u0 && u0 + 2 <= r.y1) || rooms.find(r => r.x1 === W && r.y0 <= u0 + 1 && u0 + 3 <= r.y1);
      if (owner) { doorRoom = owner; doorAt = owner.y0 <= u0 && u0 + 2 <= owner.y1 ? u0 : u0 + 1; }
      else {
        // no room has the landing in its wall: the doorway goes in the wall of the nearest room that has a landing
        doorRoom = rooms.filter(r => r.x1 === W && slot(r) !== null).sort((p, q) => Math.abs(slot(p) - u0) - Math.abs(slot(q) - u0))[0] || null;
        if (doorRoom) doorAt = slot(doorRoom);
      }
      const kind = PRIORITY.find(t => rooms.some(r => r.type === t));
      if (doorRoom && kind && doorRoom.type !== kind) {
        const other = rooms.filter(r => r.type === kind).sort((p, q) => Math.abs(area(p) - area(doorRoom)) - Math.abs(area(q) - area(doorRoom)))[0];
        [other.type, doorRoom.type] = [doorRoom.type, other.type];
      }
    }
    rooms.forEach((r, i) => {
      r.id = i;
      const t = ROOM_TYPES[r.type];
      r.wallStyle = ws >= 0 ? ws : rng.pick(t.wall);
      r.floorStyle = fs >= 0 ? fs : rng.pick(t.floor);
      r.ceilStyle = cs >= 0 ? cs : rng.pick(CEILING_STYLES);
    });
    if (corridor) {
      Object.assign(corridor, { type: 'hall', id: rooms.length, wallStyle: ws >= 0 ? ws : 2, floorStyle: fs >= 0 ? fs : 9, ceilStyle: hallCeil });
      rooms.push(corridor);
    }
    const hall = { x0: W, x1: W + HALL, y0: 0, y1: D, type: 'hall', wallStyle: hallStyle, floorStyle: hallFloor, ceilStyle: hallCeil };

    // ---- the walls on the grid
    const edges = new Map();
    const hk = (y, x) => 'h|' + y + '|' + x, vk = (x, y) => 'v|' + x + '|' + y;
    for (const r of [...rooms, hall]) {
      for (let x = r.x0; x < r.x1; x++) for (const y of [r.y0, r.y1]) if (!edges.has(hk(y, x))) edges.set(hk(y, x), r);
      for (let y = r.y0; y < r.y1; y++) for (const x of [r.x0, r.x1]) if (!edges.has(vk(x, y))) edges.set(vk(x, y), r);
    }
    const { cut, start: doorStart, skip: doorSkip, list: doors } = doorCutter((alongX, line, from) => (alongX ? hk(line, from) : vk(line, from)));
    connectDoors(rooms, splits, corridor, cut, rng);
    // the door of this floor, in the wall between the stair hall and the rooms (the room was chosen with the kinds, above)
    if (doorRoom) { cut(false, W, doorAt); hallDoors.push({ floor: k, to: doorRoom.type, at: doorAt, fr, bk }); }
    else {
      // no room has a landing in its wall: the doorway goes in the wall of the closest room
      const near = rooms.filter(r => r.x1 === W && r.y1 - r.y0 >= 2).sort((p, q) => Math.abs((p.y0 + p.y1) / 2 - u0) - Math.abs((q.y0 + q.y1) / 2 - u0))[0];
      if (near) cut(false, W, Math.max(near.y0, Math.min(near.y1 - 2, u0)));
    }
    // the entrance: on the ground floor, in the wall of the hall that faces the front (in the lane of the first flight, where there are no stairs)
    if (k === 0 && params.entrance !== false) cut(true, 0, W + 2);

    placeWallRuns(edges, place, { have, doorStart, doorSkip });

    // ---- floors and ceilings: one grid for the whole outline; the hall has its own columns (lane 0, lane 1 and what is beside them), the rooms go to the left of
    // them, and the holes are the lanes of the flights that leave this floor (ceiling) and arrive at it (floor)
    const rect = (lane, y0, y1) => ({ x0: xa + GAP + 3.5 * lane, x1: xa + GAP + 3.5 * (lane + 1), y0, y1 });
    const inRect = (r, cx, cy) => cx > r.x0 && cx < r.x1 && cy > r.y0 && cy < r.y1;
    const rowsOf = (f) => rect(f.lane, f.y0, f.y1);
    const styleAt = (kind) => (cx, cy) => {
      if (cx > W * UNIT + THICK / 2) return kind === 'floor' ? hallFloor : (kind === 'ceiling' ? hallCeil : hallStyle);
      let best = null, bd = Infinity;
      for (const r of rooms) {
        const dx = Math.max(r.x0 * UNIT - cx, 0, cx - r.x1 * UNIT), dy = Math.max(r.y0 * UNIT - cy, 0, cy - r.y1 * UNIT), d = dx * dx + dy * dy;
        if (d < bd) { bd = d; best = r; }
      }
      return kind === 'floor' ? best.floorStyle : (kind === 'ceiling' ? best.ceilStyle : best.wallStyle);
    };
    const total = (W + HALL) * UNIT + THICK;
    const floorHoles = k > 0 ? [rowsOf(flight(k - 1))] : [];
    const ceilingHoles = k < F - 1 ? [rowsOf(flight(k))] : [];
    tileLevel(place, { xa: xg, xmin: 0, xmax: total, units: D, z: -0.09, ry: 90, styleAt: styleAt('floor'), have, skip: (cx, cy) => floorHoles.some(h => inRect(h, cx, cy)) });
    if (k < F - 1 || params.ceiling) tileLevel(place, { xa: xg, xmin: 0, xmax: total, units: D, z: ceilingZ(1), ry: 90, styleAt: styleAt('ceiling'), have, skip: (cx, cy) => ceilingHoles.some(h => inRect(h, cx, cy)) });

    // ---- the stairs of this floor: steps made of small panels lying flat (3.5 m across, 1.61 m deep), each one a little higher and a little ahead of the one before,
    // so every step lies over the back of the one below it; under them, three panels on the slope close the gap between the steps
    if (k < F - 1) {
      const f = flight(k);
      const run = ROWS * TY, slope = Math.atan2(PITCH, run), th = slope / D2R, cx = laneX(f.lane);
      const rise = PITCH / STEPS, depth = run / STEPS;
      for (let n = 0; n < STEPS; n++) {
        // the top of the step n is (n + 1) risers over the floor, 3 cm lower so that the last ones do not flicker with the floor above
        place(smallModel(hallFloor), cx, f.yFoot + f.up * (n * depth + 0.805), (n + 1) * rise - 0.03 - 0.09, 0, 90, 0);
      }
      const dy = Math.cos(slope), dz = Math.sin(slope), sn = Math.sin(slope), cs = Math.cos(slope);
      for (let n = 0; n < 3; n++) {
        const along = (n + 0.5) * TILE.x;
        place(wallModel(hallFloor), cx, f.yFoot + f.up * (dy * along + 0.09 * sn), -0.057 + dz * along - 0.09 * cs, 0, 90 - th, f.up > 0 ? 90 : -90);
      }
    }

    // ---- furniture
    let furnished = 0;
    if (params.furniture > 0) {
      const fp = { ...params, hasCeiling: k < F - 1 || !!params.ceiling };
      furnished = await furnish(rooms, doors, fp, env, rng, place, edges);
      // the stair hall: the two landings (the flights are between them) are decorated too, leaving a unit free next to the stairs
      const fr = 2 * (R - LAND - ROWS), bk = 2 * (R - LAND);
      const landings = [{ x0: W, x1: W + HALL, y0: 0, y1: fr - 1, type: 'landing', virtualSides: [2] }, { x0: W, x1: W + HALL, y0: bk + 1, y1: D, type: 'landing', virtualSides: [0] }].filter(l => l.y1 - l.y0 >= 3);
      furnished += await furnish(landings, doors, fp, env, rng, place, edges);
    }
    totalRooms += rooms.length; totalDoors += doors.length; totalFurniture += furnished;
  }
  return { items, notes: [], dropped, hallDoors, made: items.length, rooms: totalRooms, doors: totalDoors, furniture: totalFurniture, floors: F, size: { w: (W + HALL) * UNIT, d: D * UNIT } };
}
