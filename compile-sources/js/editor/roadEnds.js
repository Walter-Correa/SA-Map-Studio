// The ends of a piece (roads, ramps, pipes...) read from its model: where another piece can join it. An end is a flat face at the extreme of the model (a
// plane that has all the model behind it); the place of the end, the way out of it and its size come from the points of the model on that plane.
// Two kinds:
// - 'surface' (roads, ramps, jumps): the end is a vertical cut of the piece; the socket is the middle of the surface at the end, with the slope going
//   out (pitch) and the slope sideways (bank) read from the points of the surface near the end, so the surfaces continue one the other
// - 'rim' (pipes): the end is the rim of a pipe; the socket is the middle of the rim, looking along the pipe
// A socket is { m: Matrix4 (frame: +X right, +Y goes out of the piece, +Z up), width, height, kind, fz (the slope going out) }
import * as THREE from 'three';

const Z = new THREE.Vector3(0, 0, 1);

function readTriangles(root) {
  root.updateMatrixWorld(true);
  const out = [];
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  root.traverse((o) => {
    const pos = o.isMesh && o.geometry?.attributes?.position;
    if (!pos) return;
    const idx = o.geometry.index;
    const n = idx ? idx.count : pos.count;
    for (let i = 0; i + 2 < n; i += 3) {
      a.fromBufferAttribute(pos, idx ? idx.getX(i) : i).applyMatrix4(o.matrixWorld);
      b.fromBufferAttribute(pos, idx ? idx.getX(i + 1) : i + 1).applyMatrix4(o.matrixWorld);
      c.fromBufferAttribute(pos, idx ? idx.getX(i + 2) : i + 2).applyMatrix4(o.matrixWorld);
      out.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
    }
  });
  return new Float32Array(out);
}

// Whether points (in the plane of an end, from its middle) go all round a circle of that radius: the rim of a pipe, not a strip of its wall
function roundRim(pts, radius) {
  if (pts.length < 8) return false;
  const sectors = new Array(12).fill(0);
  let near = 0;
  for (const [l, u] of pts) {
    const r = Math.hypot(l, u);
    if (r > radius * 0.55) near++;
    sectors[Math.min(11, Math.floor(((Math.atan2(u, l) + Math.PI) / (2 * Math.PI)) * 12))]++;
  }
  return sectors.filter(c => c > 0).length >= 10 && near >= pts.length * 0.5;
}

// The normal of the plane that fits points best: the direction in which they spread the least (smallest axis of their covariance)
function planeNormal(pts, ctr) {
  let xx = 0, xy = 0, xz = 0, yy = 0, yz = 0, zz = 0;
  for (const p of pts) { const x = p.x - ctr.x, y = p.y - ctr.y, z = p.z - ctr.z; xx += x * x; xy += x * y; xz += x * z; yy += y * y; yz += y * z; zz += z * z; }
  // Jacobi rotations on the symmetric 3 x 3 matrix
  const A = [[xx, xy, xz], [xy, yy, yz], [xz, yz, zz]], V = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  for (let sweep = 0; sweep < 30; sweep++) {
    let off = 0;
    for (let p = 0; p < 2; p++) for (let q = p + 1; q < 3; q++) {
      if (Math.abs(A[p][q]) < 1e-12) continue;
      off += Math.abs(A[p][q]);
      const th = (A[q][q] - A[p][p]) / (2 * A[p][q]);
      const t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1));
      const c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < 3; k++) { const akp = A[k][p], akq = A[k][q]; A[k][p] = c * akp - s * akq; A[k][q] = s * akp + c * akq; }
      for (let k = 0; k < 3; k++) { const apk = A[p][k], aqk = A[q][k]; A[p][k] = c * apk - s * aqk; A[q][k] = s * apk + c * aqk; }
      for (let k = 0; k < 3; k++) { const vkp = V[k][p], vkq = V[k][q]; V[k][p] = c * vkp - s * vkq; V[k][q] = s * vkp + c * vkq; }
    }
    if (off < 1e-9) break;
  }
  let best = 0;
  for (let i = 1; i < 3; i++) if (A[i][i] < A[best][best]) best = i;
  const n = new THREE.Vector3(V[0][best], V[1][best], V[2][best]);
  return n.lengthSq() > 1e-9 ? n.normalize() : null;
}

// Straight line through points (x, y): y = a + b x
function fitLine(xs, ys) {
  const n = xs.length;
  if (n < 2) return null;
  let sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (let i = 0; i < n; i++) { sx += xs[i]; sy += ys[i]; sxx += xs[i] * xs[i]; sxy += xs[i] * ys[i]; }
  const den = n * sxx - sx * sx;
  if (Math.abs(den) < 1e-9) return null;
  const b = (n * sxy - sx * sy) / den;
  return { a: (sy - b * sx) / n, b };
}

export function computeEnds(root, kind, dbg = null, floorMode = false) {
  const tri = readTriangles(root);
  const nt = tri.length / 9, nv = nt * 3;
  if (nt < 2) return false;
  const dot = (n, k) => tri[k * 3] * n.x + tri[k * 3 + 1] * n.y + tri[k * 3 + 2] * n.z;
  const maxProj = (n) => { let m = -Infinity; for (let k = 0; k < nv; k++) { const d = dot(n, k); if (d > m) m = d; } return m; };
  const minProj = (n) => { let m = Infinity; for (let k = 0; k < nv; k++) { const d = dot(n, k); if (d < m) m = d; } return m; };

  // The flat faces of the model: triangles grouped by the direction they face
  const groups = new Map();
  let total = 0;
  const e1 = new THREE.Vector3(), e2 = new THREE.Vector3(), nn = new THREE.Vector3();
  for (let t = 0; t < nt; t++) {
    const o = t * 9;
    e1.set(tri[o + 3] - tri[o], tri[o + 4] - tri[o + 1], tri[o + 5] - tri[o + 2]);
    e2.set(tri[o + 6] - tri[o], tri[o + 7] - tri[o + 1], tri[o + 8] - tri[o + 2]);
    nn.crossVectors(e1, e2);
    const area = nn.length() / 2;
    if (area < 1e-7) continue;
    nn.normalize();
    total += area;
    const key = Math.round(nn.x * 10) + ',' + Math.round(nn.y * 10) + ',' + Math.round(nn.z * 10);
    let g = groups.get(key);
    if (!g) { g = { sum: new THREE.Vector3(), area: 0, tris: [] }; groups.set(key, g); }
    g.sum.addScaledVector(nn, area); g.area += area; g.tris.push(t);
  }
  // How high the surface of the piece is at (x, y): the highest (the lowest for a tunnel) of the triangles over that point
  const topZ = (x, y) => {
    let best = null;
    for (let t = 0; t < nt; t++) {
      const o = t * 9;
      const x0 = tri[o], y0 = tri[o + 1], x1 = tri[o + 3], y1 = tri[o + 4], x2 = tri[o + 6], y2 = tri[o + 7];
      if (x < Math.min(x0, x1, x2) || x > Math.max(x0, x1, x2) || y < Math.min(y0, y1, y2) || y > Math.max(y0, y1, y2)) continue;
      const den = (y1 - y2) * (x0 - x2) + (x2 - x1) * (y0 - y2);
      if (Math.abs(den) < 1e-9) continue;
      const a = ((y1 - y2) * (x - x2) + (x2 - x1) * (y - y2)) / den, b = ((y2 - y0) * (x - x2) + (x0 - x2) * (y - y2)) / den, c = 1 - a - b;
      if (a < -1e-4 || b < -1e-4 || c < -1e-4) continue;
      const z = a * tri[o + 2] + b * tri[o + 5] + c * tri[o + 8];
      if (best === null || (floorMode ? z < best : z > best)) best = z;
    }
    return best;
  };
  // (the rim of a long pipe is small next to its walls, the end of a long road next to its length: the faces that count are small)
  const minArea = kind === 'rim' ? Math.max(0.3, total * 0.0012) : Math.max(1, total * 0.002);
  const cands = [];
  for (const g of groups.values()) {
    if (g.area < minArea) continue;
    const n0 = g.sum.clone().normalize();
    if (kind === 'surface' && Math.abs(n0.z) > 0.5) continue;
    // the parallel planes of the group (the end of a road and the sides of its pillars face the same way): each one that has enough faces
    const bins = new Map();
    for (const t of g.tris) {
      const o = t * 9;
      const ax = tri[o + 3] - tri[o], ay = tri[o + 4] - tri[o + 1], az = tri[o + 5] - tri[o + 2], bx = tri[o + 6] - tri[o], by = tri[o + 7] - tri[o + 1], bz = tri[o + 8] - tri[o + 2];
      const area = Math.hypot(ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx) / 2;
      const d = ((tri[o] + tri[o + 3] + tri[o + 6]) * n0.x + (tri[o + 1] + tri[o + 4] + tri[o + 7]) * n0.y + (tri[o + 2] + tri[o + 5] + tri[o + 8]) * n0.z) / 3;
      const k = Math.round(d / 0.3);
      const e = bins.get(k) || { area: 0, dsum: 0 };
      e.area += area; e.dsum += d * area; bins.set(k, e);
    }
    const hi = maxProj(n0), lo = minProj(n0);
    for (const e of bins.values()) {
      if (e.area < minArea) continue;
      const d0 = e.dsum / e.area;
      // it has to be the extreme of the model on one of its two sides (the faces of the model can be wound either way): that side is the way out
      if (hi - d0 <= 0.45) cands.push({ n: n0, d: hi, area: e.area });
      else if (d0 - lo <= 0.45) cands.push({ n: n0.clone().negate(), d: -lo, area: e.area });
    }
  }
  if (kind === 'surface') {
    // the cut that a wedge leaves at its low end can be too small to count as a face: the four sides of the box of the model also count
    for (const n of [new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0)]) {
      if (cands.some(c => c.n.angleTo(n) < 0.09 && Math.abs(c.d - maxProj(n)) < 0.6)) continue;
      cands.push({ n, d: maxProj(n), area: 0 });
    }
  }
  if (dbg) dbg.push('groups ' + groups.size + ' area ' + total.toFixed(0) + ' min ' + minArea.toFixed(1) + ' cands ' + cands.map(c => '[' + c.n.toArray().map(v => v.toFixed(2)) + ' d' + c.d.toFixed(1) + ' a' + c.area.toFixed(0) + ']').join(''));
  const sockets = [];
  if (kind === 'surface') {
    // The ends of a road or a ramp from the outline of its surface: the sharp corners of the outline are the corners of the ends
    const caps = outlineCaps();
    if (dbg) dbg.push('outline caps ' + caps.length);
    for (const c of caps) { const so = surfaceSocket(c); if (so) sockets.push(so); }
    if (sockets.length >= 2) return dedupe(sockets);
    sockets.length = 0;
  }
  if (kind === 'rim') { sockets.push(...rimLoops()); for (const c of cands) sockets.push(...rimSocket(c)); }
  else for (const c of cands) { const s = surfaceSocket(c); if (s) sockets.push(s); }
  let uniq = dedupe(sockets);
  if (kind === 'rim' && uniq.length > 4) { const wm = Math.max(...uniq.map(u => u.width)); uniq = uniq.filter(u => u.width >= wm * 0.8); }   // the facets of a tight bend are not ends
  if (dbg) dbg.push('sockets ' + sockets.length + ' uniq ' + uniq.map(u => 'w' + u.width.toFixed(1)).join(','));
  if (!uniq.length) return false;
  if (kind === 'surface') {
    // Sides are not ends: the ends of a road or a ramp are the cuts across it, the narrowest ones (a side of the piece is as wide as the piece is long)
    // (the edge of a rail or of a pillar is not an end of a road)
    const roomy = uniq.some(s => s.width >= 4);
    const big = roomy ? uniq.filter(s => s.width >= 2) : uniq;
    if (!big.length) return false;
    const wmin = Math.min(...big.map(s => s.width));
    const keep = big.filter(s => s.width <= wmin * 1.45 + 0.5);
    // a round pad, a spiral: more ends than a piece has are the facets of a curved shape, not ends
    return keep.length && keep.length <= 6 ? keep : false;
  }
  return uniq;

  // the same end twice (the face and the side of the box)
  function dedupe(list) {
    const out = [];
    for (const s of list) {
      const e = s.m.elements;
      if (out.some(u => { const f = u.m.elements; return Math.hypot(e[12] - f[12], e[13] - f[13], e[14] - f[14]) < 0.6 && Math.abs(e[4] * f[4] + e[5] * f[5] + e[6] * f[6] - 1) < 0.03; })) continue;
      out.push(s);
    }
    return out;
  }

  // ---- the ends of a road or a ramp from its footprint: the piece seen from above (every triangle drawn on a grid, small gaps closed) has an outline;
  // the outline is simplified to straight edges, and the edges between two sharp corners are the ends (a curved side has no sharp corners; a straight
  // piece has four such edges and the ends are the ones across the slope, or the short ones when it is flat)
  function outlineCaps() {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (let k = 0; k < nv; k++) {
      const x = tri[k * 3], y = tri[k * 3 + 1];
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    const cell = Math.max(0.25, Math.min(0.7, Math.max(x1 - x0, y1 - y0) / 600));
    const pad = 3;
    const W = Math.ceil((x1 - x0) / cell) + 2 * pad, H = Math.ceil((y1 - y0) / cell) + 2 * pad;
    if (W * H > 2500000) return [];
    let mask = new Uint8Array(W * H);
    const cx = (i) => x0 + (i - pad + 0.5) * cell, cy = (j) => y0 + (j - pad + 0.5) * cell;
    for (let t = 0; t < nt; t++) {
      const o = t * 9;
      const ax = tri[o], ay = tri[o + 1], bx = tri[o + 3], by = tri[o + 4], qx = tri[o + 6], qy = tri[o + 7];
      const den = (by - qy) * (ax - qx) + (qx - bx) * (ay - qy);
      if (Math.abs(den) < 1e-9) continue;
      const i0 = Math.max(0, Math.floor((Math.min(ax, bx, qx) - x0) / cell) + pad), i1 = Math.min(W - 1, Math.floor((Math.max(ax, bx, qx) - x0) / cell) + pad);
      const j0 = Math.max(0, Math.floor((Math.min(ay, by, qy) - y0) / cell) + pad), j1 = Math.min(H - 1, Math.floor((Math.max(ay, by, qy) - y0) / cell) + pad);
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const px = cx(i), py = cy(j);
        const u = ((by - qy) * (px - qx) + (qx - bx) * (py - qy)) / den, v = ((qy - ay) * (px - qx) + (ax - qx) * (py - qy)) / den, w = 1 - u - v;
        if (u >= -0.02 && v >= -0.02 && w >= -0.02) mask[j * W + i] = 1;
      }
    }
    // close the small gaps (a few cells), then keep the biggest piece
    const grow = (m, on) => {
      const out = new Uint8Array(W * H), r = 2;
      for (let j = r; j < H - r; j++) for (let i = r; i < W - r; i++) {
        let all = on ? 0 : 1;
        for (let dj = -r; dj <= r && (on ? !all : all); dj++) for (let di = -r; di <= r; di++) {
          const v = m[(j + dj) * W + i + di];
          if (on ? v : !v) { all = on ? 1 : 0; break; }
        }
        out[j * W + i] = all;
      }
      return out;
    };
    mask = grow(grow(mask, true), false);
    const label = new Int32Array(W * H);
    let bestLabel = 0, bestSize = 0, nextLabel = 1;
    for (let s = 0; s < W * H; s++) {
      if (!mask[s] || label[s]) continue;
      let size = 0; const stack = [s]; label[s] = nextLabel;
      while (stack.length) {
        const c = stack.pop(); size++;
        const ci = c % W, cj = (c - ci) / W;
        for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const ni = ci + di, nj = cj + dj;
          if (ni < 0 || nj < 0 || ni >= W || nj >= H) continue;
          const nn2 = nj * W + ni;
          if (mask[nn2] && !label[nn2]) { label[nn2] = nextLabel; stack.push(nn2); }
        }
      }
      if (size > bestSize) { bestSize = size; bestLabel = nextLabel; }
      nextLabel++;
    }
    if (bestSize * cell * cell < 6) return [];
    const inReg = (i, j) => i >= 0 && j >= 0 && i < W && j < H && label[j * W + i] === bestLabel;
    // the edges between a cell of the piece and an empty one, with the piece on the left (counter clockwise)
    const next = new Map();
    const key = (i, j) => i * 100000 + j;
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      if (!inReg(i, j)) continue;
      if (!inReg(i, j - 1)) next.set(key(i, j), [i + 1, j]);            // bottom edge, going right
      if (!inReg(i + 1, j)) next.set(key(i + 1, j), [i + 1, j + 1]);    // right edge, going up
      if (!inReg(i, j + 1)) next.set(key(i + 1, j + 1), [i, j + 1]);    // top edge, going left
      if (!inReg(i - 1, j)) next.set(key(i, j + 1), [i, j]);            // left edge, going down
    }
    // (where the piece touches itself at a corner two edges start from the same point: the first one is followed, the rest is closed by the other loop)
    const loops = [];
    const used = new Set();
    for (const [k0] of next) {
      if (used.has(k0)) continue;
      const loop = [];
      let k = k0;
      for (let guard = 0; guard < 400000; guard++) {
        if (used.has(k)) break;
        used.add(k);
        const i = Math.floor(k / 100000), j = k % 100000;
        loop.push([x0 + (i - pad) * cell, y0 + (j - pad) * cell]);
        const nx2 = next.get(k);
        if (!nx2) break;
        k = key(nx2[0], nx2[1]);
        if (k === k0) break;
      }
      if (loop.length > 8) loops.push(loop);
    }
    let outer = null, outerArea = 0;
    for (const loop of loops) {
      let a = 0;
      for (let i = 0; i < loop.length; i++) { const p = loop[i], q = loop[(i + 1) % loop.length]; a += p[0] * q[1] - q[0] * p[1]; }
      if (a / 2 > outerArea) { outerArea = a / 2; outer = loop; }                      // counter clockwise: positive
    }
    if (!outer) return [];
    // straight edges: Douglas-Peucker on the closed loop
    const eps = cell * 1.6 + 0.15;
    const dp = (pts, lo, hi, keep) => {
      let dmax = 0, idx = -1;
      const A = pts[lo], B = pts[hi], dx = B[0] - A[0], dy = B[1] - A[1], len = Math.hypot(dx, dy) || 1e-9;
      for (let i = lo + 1; i < hi; i++) { const d = Math.abs((pts[i][0] - A[0]) * dy - (pts[i][1] - A[1]) * dx) / len; if (d > dmax) { dmax = d; idx = i; } }
      if (dmax > eps && idx > 0) { keep[idx] = 1; dp(pts, lo, idx, keep); dp(pts, idx, hi, keep); }
    };
    // split the loop at the two points that are the farthest apart
    let ia = 0, ib = 0, far = 0;
    const step = Math.max(1, Math.floor(outer.length / 300));
    for (let i = 0; i < outer.length; i += step) for (let j = i + 1; j < outer.length; j += step) {
      const d = Math.hypot(outer[i][0] - outer[j][0], outer[i][1] - outer[j][1]);
      if (d > far) { far = d; ia = i; ib = j; }
    }
    const rot = outer.slice(ia).concat(outer.slice(0, ia));
    const ibr = (ib - ia + outer.length) % outer.length;
    const keep = new Uint8Array(rot.length); keep[0] = 1; keep[ibr] = 1;
    dp(rot, 0, ibr, keep);
    const half2 = rot.slice(ibr).concat([rot[0]]);
    const keep2 = new Uint8Array(half2.length); keep2[0] = 1; keep2[half2.length - 1] = 1;
    dp(half2, 0, half2.length - 1, keep2);
    const poly = [];
    for (let i = 0; i <= ibr; i++) if (keep[i]) poly.push(rot[i]);
    for (let i = 1; i < half2.length - 1; i++) if (keep2[i]) poly.push(half2[i]);
    const n = poly.length;
    if (n < 4) return [];
    const turnAt = (i) => {
      const p = poly[(i + n - 1) % n], q = poly[i], r = poly[(i + 1) % n];
      const a1 = Math.atan2(q[1] - p[1], q[0] - p[0]), a2 = Math.atan2(r[1] - q[1], r[0] - q[0]);
      let d = Math.abs(a2 - a1); if (d > Math.PI) d = 2 * Math.PI - d;
      return d;
    };
    const corner = poly.map((_, i) => turnAt(i) > 0.87);                             // turns more than 50 degrees
    if (dbg) dbg.push('footprint ' + W + 'x' + H + ' poly ' + n + ' corners ' + corner.filter(Boolean).length);
    if (dbg) dbg.push('poly ' + poly.map((q, i) => q[0].toFixed(0) + ',' + q[1].toFixed(0) + (corner[i] ? '*' : '') + ':' + (turnAt(i) * 57.3).toFixed(0)).join(' '));
    const list = [];
    // chains from corner to corner: straight when they are one edge (or nearly)
    for (let s = 0; s < n; s++) {
      if (!corner[s]) continue;
      let e = (s + 1) % n, len = 0, pts = [s];
      while (!corner[e] && pts.length < n) { pts.push(e); e = (e + 1) % n; }
      pts.push(e);
      const A = poly[s], B = poly[e];
      const dx = B[0] - A[0], dy = B[1] - A[1], chord = Math.hypot(dx, dy);
      if (chord < 1.5) continue;
      let dev = 0;
      for (let i = 1; i < pts.length - 1; i++) { const P = poly[pts[i]]; dev = Math.max(dev, Math.abs((P[0] - A[0]) * dy - (P[1] - A[1]) * dx) / chord); }
      if (dev > Math.max(eps * 1.5, chord * 0.12)) continue;
      if (chord < Math.max(1.5, 0.05 * Math.max(x1 - x0, y1 - y0))) continue;          // not the little edge of a notch
      const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
      list.push({ mid: [mx, my], n: [dy / chord, -dx / chord], len: chord });          // counter clockwise: the way out is on the right
    }
    if (dbg) dbg.push('straight ' + list.map(e => e.len.toFixed(0)).join(','));
    if (list.length < 2) return [];
    let chosen = list;
    let gx = 0, gy = 0, garea = 0;
    {
      const t1 = new THREE.Vector3(), t2 = new THREE.Vector3(), t3 = new THREE.Vector3();
      for (let t = 0; t < nt; t++) {
        const o = t * 9;
        t1.set(tri[o + 3] - tri[o], tri[o + 4] - tri[o + 1], tri[o + 5] - tri[o + 2]);
        t2.set(tri[o + 6] - tri[o], tri[o + 7] - tri[o + 1], tri[o + 8] - tri[o + 2]);
        t3.crossVectors(t1, t2);
        const area = t3.length() / 2;
        if (area < 1e-6) continue;
        t3.divideScalar(area * 2);
        if (Math.abs(t3.z) < 0.9) continue;
        gx += (-t3.x / t3.z) * area; gy += (-t3.y / t3.z) * area; garea += area;
      }
    }
    const gm = garea > 0 ? Math.hypot(gx, gy) / garea : 0;
    if (list.length > 2) {
      chosen = null;
      if (gm > 0.06) {
        // a slope: the ends are the edges across it
        const gd = [gx / garea / gm, gy / garea / gm];
        const across = list.filter(e => Math.abs(e.n[0] * gd[0] + e.n[1] * gd[1]) > 0.9);
        if (across.length >= 2 && across.length < list.length) chosen = across;
      }
      if (!chosen) {
        // the shortest ones (two or more of about the same length)
        const sorted = [...list].sort((a, b) => a.len - b.len);
        for (const e of sorted) {
          const same = list.filter(o => Math.abs(o.len - e.len) <= e.len * 0.25 + 0.6);
          if (same.length >= 2) { chosen = same; break; }
        }
      }
      if (!chosen) chosen = list;
    }
    return chosen.map(e => {
      let nh = new THREE.Vector3(e.n[0], e.n[1], 0), left = new THREE.Vector3().crossVectors(Z, nh);
      let plane = e.mid[0] * e.n[0] + e.mid[1] * e.n[1], width = e.len, cl = e.mid[0] * left.x + e.mid[1] * left.y;
      // the grid is only a guide: the place of the end is taken from the points of the model on it
      const near = [];
      let smax = -Infinity;
      for (let k = 0; k < nv; k++) {
        if (Math.abs(dot(nh, k) - plane) > 0.7 || Math.abs(dot(left, k) - cl) > width / 2 + 0.7) continue;
        near.push(k);
        const d = dot(nh, k); if (d > smax) smax = d;
      }
      const slab = near.filter(k => dot(nh, k) >= smax - 0.25);
      if (slab.length >= 3) {
        let mx = 0, my = 0;
        for (const k of slab) { mx += tri[k * 3]; my += tri[k * 3 + 1]; }
        mx /= slab.length; my /= slab.length;
        let sxx = 0, syy = 0, sxy = 0;
        for (const k of slab) { const dx = tri[k * 3] - mx, dy = tri[k * 3 + 1] - my; sxx += dx * dx; syy += dy * dy; sxy += dx * dy; }
        const ang = 0.5 * Math.atan2(2 * sxy, sxx - syy);
        let n2 = new THREE.Vector3(Math.sin(ang), -Math.cos(ang), 0);                 // perpendicular to the line of the end
        if (n2.dot(nh) < 0) n2.negate();
        if (n2.angleTo(nh) < 0.35) {
          const l2 = new THREE.Vector3().crossVectors(Z, n2);
          let dmax = -Infinity;
          for (const k of slab) dmax = Math.max(dmax, dot(n2, k));
          let lo = Infinity, hi = -Infinity, ds = 0, dn = 0;
          for (const k of slab) { if (dot(n2, k) < dmax - 0.15) continue; const l = dot(l2, k); lo = Math.min(lo, l); hi = Math.max(hi, l); ds += dot(n2, k); dn++; }
          if (dn >= 2 && hi - lo > width * 0.6) { nh = n2; left = l2; plane = ds / dn; width = hi - lo; cl = (lo + hi) / 2; }
        }
      }
      return { n: nh, plane, width, cl, area: 0 };
    });
  }

  // ---- a vertical cut of a road or a ramp
  function surfaceSocket(c) {
    const nh = new THREE.Vector3(c.n.x, c.n.y, 0);
    if (nh.lengthSq() < 1e-6) return null;
    nh.normalize();
    const left = new THREE.Vector3().crossVectors(Z, nh).normalize();
    const dh = c.plane !== undefined ? c.plane : maxProj(nh), dhMin = minProj(nh);
    const depth = dh - dhMin;
    if (depth < 1.5) return null;
    // the cut: its width and middle come from the outline of the surface when that is known; else the points on the end plane (within 0.3 m of the extreme)
    let width, cl;
    if (c.width !== undefined) { width = c.width; cl = c.cl; }
    else {
      const cut = [];
      for (let k = 0; k < nv; k++) if (dh - dot(nh, k) <= 0.3) cut.push(k);
      if (cut.length < 2) return null;
      let lmin = Infinity, lmax = -Infinity;
      for (const k of cut) { const l = dot(left, k); if (l < lmin) lmin = l; if (l > lmax) lmax = l; }
      width = lmax - lmin;
      if (width < 0.5) return null;
      cl = (lmin + lmax) / 2;
    }
    // the surface along the middle of the piece, going in from the end: how high it is at some points (a vertical ray down on the triangles: a flat
    // face has no points of its own in the middle), and the slope going out from them
    const at = (s, l) => { const p = nh.clone().multiplyScalar(dh - s).addScaledVector(left, l); return topZ(p.x, p.y); };
    const ss = [], zs = [];
    for (const s of [0.3, 1, 2, 3.5]) {
      if (s > depth * 0.45) break;
      const z = at(s, cl);
      if (z !== null) { ss.push(s); zs.push(z); }
    }
    if (!ss.length) return null;
    const line = ss.length >= 2 ? fitLine(ss, zs) : null;
    const zEnd = line ? line.a : zs[0];
    const sf = line ? Math.max(-1.5, Math.min(1.5, -line.b)) : 0;               // slope going out
    // the slope across (a bank): the surface in several points across the piece just in from the end
    const ls = [], lz = [];
    for (let i = -3; i <= 3; i++) {
      const l = cl + i * width * 0.1;
      const z = at(0.5, l);
      if (z !== null) { ls.push(l - cl); lz.push(z); }
    }
    const lline = ls.length >= 4 ? fitLine(ls, lz) : null;
    const sl = lline ? Math.max(-0.8, Math.min(0.8, lline.b)) : 0;
    // The frame of a socket is flat (only the direction going out, on the ground plane): two pieces join with the same attitude, the ramp does not tilt
    // the piece that comes after it; what matters is that the middle of the end is the same point (the height at the end is read from the surface).
    // The slope is kept as a note (sf: going out, sl: across)
    const f = nh.clone();
    const right = new THREE.Vector3().crossVectors(f, Z).normalize();
    const m = new THREE.Matrix4().makeBasis(right, f, Z);
    const pos = nh.clone().multiplyScalar(dh).addScaledVector(left, cl).addScaledVector(Z, zEnd);
    m.setPosition(pos);
    return { m, width, height: 0, kind: 'surface', fz: 0, slope: sf, bank: sl };
  }

  // ---- the rims of a pipe: the open edges of the model (an edge that belongs to one triangle only) joined in loops; each loop is a round end
  function rimLoops() {
    const idOf = new Map(), verts = [];
    const vid = (k) => {
      const key = Math.round(tri[k * 3] * 50) + ',' + Math.round(tri[k * 3 + 1] * 50) + ',' + Math.round(tri[k * 3 + 2] * 50);
      let id = idOf.get(key);
      if (id === undefined) { id = verts.length; idOf.set(key, id); verts.push(k); }
      return id;
    };
    const edges = new Map();
    for (let t = 0; t < nt; t++) {
      const ids = [vid(t * 3), vid(t * 3 + 1), vid(t * 3 + 2)];
      for (let e = 0; e < 3; e++) {
        const a = ids[e], b = ids[(e + 1) % 3];
        if (a === b) continue;
        const key = a < b ? a * 1000003 + b : b * 1000003 + a;
        const rec = edges.get(key);
        if (rec) rec.n++; else edges.set(key, { a, b, n: 1 });
      }
    }
    // the loops: groups of open edges that touch each other
    const parent = verts.map((_, i) => i);
    const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
    const open = [...edges.values()].filter(e => e.n === 1);
    for (const e of open) parent[find(e.a)] = find(e.b);
    const loops = new Map();
    for (const e of open) {
      const r = find(e.a);
      if (!loops.has(r)) loops.set(r, new Set());
      loops.get(r).add(e.a); loops.get(r).add(e.b);
    }
    // the middle of the model: the way out of an end is away from it
    const mid = new THREE.Vector3();
    for (let k = 0; k < nv; k++) mid.x += tri[k * 3], mid.y += tri[k * 3 + 1], mid.z += tri[k * 3 + 2];
    mid.divideScalar(nv);
    const out = [];
    for (const set of loops.values()) {
      if (set.size < 6) continue;
      const pts = [...set].map(i => new THREE.Vector3(tri[verts[i] * 3], tri[verts[i] * 3 + 1], tri[verts[i] * 3 + 2]));
      const ctr = new THREE.Vector3(); pts.forEach(p => ctr.add(p)); ctr.divideScalar(pts.length);
      const n = planeNormal(pts, ctr);
      if (!n) continue;
      if (n.dot(ctr.clone().sub(mid)) < 0) n.negate();
      const ref = Math.abs(n.z) > 0.95 ? new THREE.Vector3(1, 0, 0) : Z;
      const left = new THREE.Vector3().crossVectors(ref, n).normalize();
      const up = new THREE.Vector3().crossVectors(n, left).normalize();
      let lmin = Infinity, lmax = -Infinity, umin = Infinity, umax = -Infinity, flat = 0;
      for (const p of pts) {
        const d = p.clone().sub(ctr), l = d.dot(left), u = d.dot(up);
        if (l < lmin) lmin = l; if (l > lmax) lmax = l; if (u < umin) umin = u; if (u > umax) umax = u;
        flat = Math.max(flat, Math.abs(d.dot(n)));
      }
      const width = lmax - lmin, height = umax - umin;
      // a rim is round and flat
      if (width < 0.5 || height < 0.5 || Math.min(width, height) < 0.6 * Math.max(width, height) || flat > 0.1 * Math.max(width, height)) continue;
      if (!roundRim(pts.map(p => { const d = p.clone().sub(ctr); return [d.dot(left) - (lmin + lmax) / 2, d.dot(up) - (umin + umax) / 2]; }), (width + height) / 4)) continue;
      const right = new THREE.Vector3().crossVectors(n, up).normalize();
      const m = new THREE.Matrix4().makeBasis(right, n, up);
      m.setPosition(ctr.clone().addScaledVector(left, (lmin + lmax) / 2).addScaledVector(up, (umin + umax) / 2));
      out.push({ m, width, height, kind: 'rim', fz: n.z });
    }
    // a pipe with a wall has two loops at each end (outside and inside): the bigger one
    out.sort((a, b) => b.width - a.width);
    return out;
  }

  function rimSocket(c) {
    const n = c.n.clone();
    const ref = Math.abs(n.z) > 0.95 ? new THREE.Vector3(1, 0, 0) : Z;
    const left = new THREE.Vector3().crossVectors(ref, n).normalize();
    const up = new THREE.Vector3().crossVectors(n, left).normalize();
    const rim = [];
    for (let k = 0; k < nv; k++) if (c.d - dot(n, k) <= 0.3) rim.push([dot(left, k), dot(up, k), k]);
    if (rim.length < 4) return null;
    // two rims can lie on the same plane (a U bend has both ends on one side): the points are split in groups that touch each other
    // (two seeds, the farthest apart; each point goes to the nearest one; two rims when the centers are farther apart than the rims are wide)
    const group = new Array(rim.length).fill(0);
    let ng = 1;
    {
      const cx0 = rim.reduce((a, p) => a + p[0], 0) / rim.length, cy0 = rim.reduce((a, p) => a + p[1], 0) / rim.length;
      let s1 = rim[0], best = -1;
      for (const p of rim) { const d = Math.hypot(p[0] - cx0, p[1] - cy0); if (d > best) { best = d; s1 = p; } }
      let s2 = s1; best = -1;
      for (const p of rim) { const d = Math.hypot(p[0] - s1[0], p[1] - s1[1]); if (d > best) { best = d; s2 = p; } }
      let c1 = [s1[0], s1[1]], c2 = [s2[0], s2[1]];
      for (let it = 0; it < 6; it++) {
        let a1 = [0, 0, 0], a2 = [0, 0, 0];
        for (let i = 0; i < rim.length; i++) {
          const p = rim[i], to1 = Math.hypot(p[0] - c1[0], p[1] - c1[1]) <= Math.hypot(p[0] - c2[0], p[1] - c2[1]);
          group[i] = to1 ? 0 : 1;
          const a = to1 ? a1 : a2; a[0] += p[0]; a[1] += p[1]; a[2]++;
        }
        if (a1[2]) c1 = [a1[0] / a1[2], a1[1] / a1[2]];
        if (a2[2]) c2 = [a2[0] / a2[2], a2[1] / a2[2]];
      }
      let r1 = 0, r2 = 0;
      for (let i = 0; i < rim.length; i++) { const p = rim[i], c = group[i] ? c2 : c1, d = Math.hypot(p[0] - c[0], p[1] - c[1]); if (group[i]) r2 = Math.max(r2, d); else r1 = Math.max(r1, d); }
      const sep = Math.hypot(c1[0] - c2[0], c1[1] - c2[1]);
      if (sep > 1.9 * Math.max(r1, r2)) ng = 2; else group.fill(0);
    }
    const out = [];
    for (let g = 0; g < ng; g++) {
      const pts = rim.filter((_, i) => group[i] === g);
      if (pts.length < 8) continue;
      let lmin = Infinity, lmax = -Infinity, umin = Infinity, umax = -Infinity;
      for (const [l, u] of pts) { if (l < lmin) lmin = l; if (l > lmax) lmax = l; if (u < umin) umin = u; if (u > umax) umax = u; }
      const width = lmax - lmin, height = umax - umin;
      // a rim is round: a strip along a pipe is not an end
      if (width < 0.5 || height < 0.5 || Math.min(width, height) < 0.45 * Math.max(width, height)) continue;
      if (!roundRim(pts.map(p => [p[0] - (lmin + lmax) / 2, p[1] - (umin + umax) / 2]), (width + height) / 4)) continue;
      const right = new THREE.Vector3().crossVectors(n, up).normalize();
      const m = new THREE.Matrix4().makeBasis(right, n, up);
      m.setPosition(n.clone().multiplyScalar(c.d).addScaledVector(left, (lmin + lmax) / 2).addScaledVector(up, (umin + umax) / 2));
      out.push({ m, width, height, kind: 'rim', fz: n.z });
    }
    return out;
  }
}
