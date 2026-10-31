// Auto Criar: structures made of the panels of the kit of SA-MP: mazes and maps (a round one and a square one, with walls, a floor and a ceiling). Like the other
// generators they work in a frame (a point and a direction) and a seed makes the result repeatable. The walls and the floors use the same functions as the interiors
// (autoInterior.js): the biggest panel that fits, panels that meet in clean corners, and no panel over another one (what is left over goes outside).
import { makeRng } from './autoTrack.js';
import { UNIT, HEIGHT, levelZ, ceilingZ, wallModel, smallModel, bigModel, hugeModel, placeWallRuns, tileLevel } from './autoInterior.js';

const D2R = Math.PI / 180;
export const MAX_MAZE = 50;             // cells of the maze, each way
export const MAX_LEVELS = 10;           // layers of walls (3.5 m each)

// Puts things in the frame: local x goes where the camera looks, local y to its left
function framer(env) {
  const c = Math.cos(env.origin.yaw * D2R), s = Math.sin(env.origin.yaw * D2R);
  const items = [];
  const place = (model, lx, ly, lz, rx, ry, rzLocal) => {
    items.push({ model, x: env.origin.x + lx * c - ly * s, y: env.origin.y + lx * s + ly * c, z: env.origin.z + lz, rx, ry, rz: rzLocal + env.origin.yaw });
    return items[items.length - 1];
  };
  return { items, place };
}

const noSamp = () => ({ items: [], notes: ['sem-samp'], made: 0 });

// ---------------------------------------------------------------- the maze
// params: { cols, rows (3 to 50 cells of 3.21 m), wallStyle, floorStyle (-1: no floor), levels (1 to 10 panels one over the other), ceiling, shortcuts (0 to 100),
// seed }. The maze is a perfect one (one way between two cells) with the entrance on the side that is near the camera and the exit on the far side, at the end of the
// longest way; the shortcuts open some more walls.
export async function generateMaze(params, env) {
  const have = (id) => env.gd.models.has(id);
  if (!have(wallModel(0))) return noSamp();
  const rng = makeRng(params.seed);
  const K = Math.max(3, Math.min(MAX_MAZE, params.cols | 0 || 8)), R = Math.max(3, Math.min(MAX_MAZE, params.rows | 0 || 8));
  const levels = Math.max(1, Math.min(MAX_LEVELS, params.levels | 0 || 1));
  const style = Math.max(0, params.wallStyle | 0);
  // wallX[i][j]: the wall across the way forward (at x = i cells, between the columns j and j+1... along y); wallY[i][j]: the wall along the way forward
  const wallX = Array.from({ length: R + 1 }, () => new Array(K).fill(true));
  const wallY = Array.from({ length: R }, () => new Array(K + 1).fill(true));
  const seen = Array.from({ length: R }, () => new Array(K).fill(false));
  const start = rng.int(K);
  const stack = [[0, start]];
  seen[0][start] = true;
  const dist = Array.from({ length: R }, () => new Array(K).fill(0));
  while (stack.length) {
    const [i, j] = stack[stack.length - 1];
    const options = [];
    if (i + 1 < R && !seen[i + 1][j]) options.push([i + 1, j, () => { wallX[i + 1][j] = false; }]);
    if (i - 1 >= 0 && !seen[i - 1][j]) options.push([i - 1, j, () => { wallX[i][j] = false; }]);
    if (j + 1 < K && !seen[i][j + 1]) options.push([i, j + 1, () => { wallY[i][j + 1] = false; }]);
    if (j - 1 >= 0 && !seen[i][j - 1]) options.push([i, j - 1, () => { wallY[i][j] = false; }]);
    if (!options.length) { stack.pop(); continue; }
    const [ni, nj, open] = rng.pick(options);
    open();
    seen[ni][nj] = true;
    dist[ni][nj] = dist[i][j] + 1;
    stack.push([ni, nj]);
  }
  // the entrance and the exit
  wallX[0][start] = false;
  let exit = 0;
  for (let j = 0; j < K; j++) if (dist[R - 1][j] > dist[R - 1][exit]) exit = j;
  wallX[R][exit] = false;
  // shortcuts
  const extra = Math.round((params.shortcuts || 0) / 100 * R * K * 0.35);
  for (let n = 0; n < extra; n++) {
    if (rng() < 0.5) { const i = 1 + rng.int(R - 1), j = rng.int(K); wallX[i][j] = false; }
    else { const i = rng.int(R), j = 1 + rng.int(K - 1); wallY[i][j] = false; }
  }

  // The walls in the grid of the interiors: a cell is two units (3.21 m) each way, x goes forward from the camera and y to its left. The cells own their walls so that
  // each wall goes to the outside of the cell that owns it (see placeWallRuns): the walls of the outline go outside, the ones inside go to the side of the next cell
  const { items, place } = framer(env);
  const cellOf = (i, j) => ({ x0: 2 * i, x1: 2 * i + 2, y0: 2 * j, y1: 2 * j + 2, wallStyle: style });
  const cells = new Map();
  const cell = (i, j) => { const k = i + '|' + j; if (!cells.has(k)) cells.set(k, cellOf(i, j)); return cells.get(k); };
  const edges = new Map();
  // wallX[i][j]: wall at x = i cells along y, of the column j; its owner is the cell before it (the first cell for the entrance side)
  for (let i = 0; i <= R; i++) for (let j = 0; j < K; j++) if (wallX[i][j]) {
    const owner = cell(i === 0 ? 0 : i - 1, j);
    edges.set('v|' + (2 * i) + '|' + (2 * j), owner); edges.set('v|' + (2 * i) + '|' + (2 * j + 1), owner);
  }
  for (let i = 0; i < R; i++) for (let j = 0; j <= K; j++) if (wallY[i][j]) {
    const owner = cell(i, j === 0 ? 0 : j - 1);
    edges.set('h|' + (2 * j) + '|' + (2 * i), owner); edges.set('h|' + (2 * j) + '|' + (2 * i + 1), owner);
  }
  // (the maze goes forward: its x is the depth (R cells) and its y the width (K cells), centered on the camera: y is shifted by half of the width)
  const shiftY = -K * UNIT;                                      // half of K cells of 2 units
  const mazePlace = (model, lx, ly, lz, rx, ry, rz) => place(model, lx, ly + shiftY, lz, rx, ry, rz);
  placeWallRuns(edges, mazePlace, { levels, have });
  if (params.floorStyle >= 0) tileLevel(mazePlace, { xa: 0, xmin: 0, xmax: R * 2 * UNIT, units: 2 * K, z: -0.09, ry: 90, styleAt: () => params.floorStyle, have });
  if (params.ceiling) tileLevel(mazePlace, { xa: 0, xmin: 0, xmax: R * 2 * UNIT, units: 2 * K, z: ceilingZ(levels), ry: 90, styleAt: () => style, have });
  return { items, notes: [], made: items.length, size: { w: K * 2 * UNIT, d: R * 2 * UNIT } };
}

// ---------------------------------------------------------------- the maps (round and square)
// params: { shape: 'round' | 'square', size (m: the diameter, or the side), levels (1 to 10 layers of walls of 3.5 m: the height), wallStyle, floorStyle, floor, ceiling, seed }
// The map goes in front of the camera. The round one is a regular polygon of panels of 9.63 m: its walls are put on the outside of the polygon so that the inside is
// exact; the floor and the ceiling are tiles of the kit in a grid, the ones that touch the circle (the ones that are left over are outside, under or over the wall).
export async function generateMap(params, env) {
  const have = (id) => env.gd.models.has(id);
  if (!have(wallModel(0)) || !have(bigModel(0))) return noSamp();
  const levels = Math.max(1, Math.min(MAX_LEVELS, params.levels | 0 || 1));
  const style = Math.max(0, params.wallStyle | 0), floorStyle = Math.max(0, params.floorStyle | 0);
  const { items, place } = framer(env);
  const round = params.shape !== 'square';
  const wantSize = Math.max(10, Math.min(500, +params.size || 40));
  const THICK = 0.18, BIG = 9.63;
  let extent;                                                    // the outline: the half side, or the radius of the inside
  const put = (model, lx, ly, rz, z) => place(model, lx, ly, z, 0, 0, rz);
  // the wall panels of one run, at the level lv0 and over (the huge one for three levels at once where it fits)
  const stack = (lx, ly, rz, style_, width) => {
    const model = width === 3 ? bigModel(style_) : (width === 2 ? wallModel(style_) : smallModel(style_));
    let lv = 0;
    if (width === 3 && hugeModel(style_) && have(hugeModel(style_))) while (levels - lv >= 3) { put(hugeModel(style_), lx, ly, rz, 5.25 + levelZ(lv)); lv += 3; }
    for (; lv < levels; lv++) put(model, lx, ly, rz, HEIGHT / 2 + levelZ(lv));
  };
  if (round) {
    const N = Math.max(5, Math.round(Math.PI * wantSize / BIG));
    const R = BIG / (2 * Math.sin(Math.PI / N));                // radius of the corners of the polygon (the inside of the panels)
    const ap = R * Math.cos(Math.PI / N);                       // radius of the middle of each side
    extent = ap;
    const cx = ap + 2;                                          // the center, a little in front of the camera
    for (let k = 0; k < N; k++) {
      const a = (k + 0.5) * 2 * Math.PI / N;
      const r = ap + THICK / 2;                                  // the panel is outside of the polygon
      stack(cx + Math.cos(a) * r, Math.sin(a) * r, a / D2R, style, 3);
    }
    const touches = (x, y) => {
      const dx = Math.max(Math.abs(x - cx) - 1.75, 0), dy = Math.max(Math.abs(y) - 1.605, 0);
      return Math.hypot(dx, dy) < R - 0.2;
    };
    const solid = (x, y) => Math.hypot(Math.abs(x - cx) + 5.25, Math.abs(y) + 4.82) <= ap;      // the corner of a big tile (the huge one is 10.5 x 9.63) is inside
    const halfRows = Math.ceil(R / (2 * UNIT)) + 1;
    const rowsU = 2 * halfRows * 2;                              // rows from -(halfRows * 2 units) to +, two units each
    const yOff = -halfRows * 2 * UNIT;                           // the first row starts here
    const tp = (m, x, y, z, rx, ry, rz) => place(m, x, y + yOff, z, rx, ry, rz);
    const styleFn = (st) => () => st;
    const skipFn = (x, y) => !touches(x, y + yOff);
    const solidFn = (x, y) => solid(x, y + yOff);
    if (params.floor !== false) tileLevel(tp, { xa: cx - 1.75 - 3.5 * Math.ceil(R / 3.5), xmin: cx - R, xmax: cx + R, units: rowsU, z: -0.09, ry: 90, styleAt: styleFn(floorStyle), skip: skipFn, solid: solidFn, have });
    if (params.ceiling) tileLevel(tp, { xa: cx - 1.75 - 3.5 * Math.ceil(R / 3.5), xmin: cx - R, xmax: cx + R, units: rowsU, z: ceilingZ(levels), ry: 90, styleAt: styleFn(style), skip: skipFn, solid: solidFn, have });
  } else {
    // a square: the side in units of the grid (the walls are made of panels of 6, 2 and 1 units); the walls go outside the line, the inside is exact
    const n = Math.max(6, Math.round(wantSize / UNIT));
    const edges = new Map();
    const owner = { x0: 0, x1: n, y0: 0, y1: n, wallStyle: style };
    for (let u = 0; u < n; u++) { edges.set('h|0|' + u, owner); edges.set('h|' + n + '|' + u, owner); edges.set('v|0|' + u, owner); edges.set('v|' + n + '|' + u, owner); }
    const shiftY = -n * UNIT / 2;
    const sp = (m, x, y, z, rx, ry, rz) => place(m, x + 2, y + shiftY, z, rx, ry, rz);
    placeWallRuns(edges, sp, { levels, have });
    extent = n * UNIT / 2;
    if (params.floor !== false) tileLevel(sp, { xa: 0, xmin: 0, xmax: n * UNIT, units: n, z: -0.09, ry: 90, styleAt: () => floorStyle, have });
    if (params.ceiling) tileLevel(sp, { xa: 0, xmin: 0, xmax: n * UNIT, units: n, z: ceilingZ(levels), ry: 90, styleAt: () => style, have });
  }
  return { items, notes: [], made: items.length, size: { w: extent * 2, d: extent * 2 } };
}
