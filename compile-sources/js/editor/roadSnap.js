// Automatic snap of tracks, ramps and roads: a piece of the category "Pistas, rampas e estradas" that is moved near the edge of another one goes to
// the place where the two join, exactly (position and rotation).
//
// Two ways, by the kind of piece:
// - Tubes of SA-MP (ids 19646 to 19689): the table of the tool TBR (Adr1 Tube Connector) says where a tube of one kind goes when it is put after a
//   tube of another kind (see world/roadTubes.js). The candidates are the places of the moved piece after each nearby piece, and before each one
//   (the same table the other way round), with every kind each model can be joined by. Supports, lights and covers go on the tube (their own table).
// - Ramps, jumps and stunt pieces of the original game: the two ends of the long side of the model are read from the model itself (the point of the
//   surface in the middle of the end and the slope there), and two pieces join with their ends face to face, the surfaces continuing one the other.
import * as THREE from 'three';
import {
  TUBE_TYPES, TUBE_REL, TUBE_COUNTER, TUBE_COVERS, TUBE_LIGHTS, TUBE_SUPPORT_1, TUBE_SUPPORT_2, TUBE_SUPPORT_3,
} from '../world/roadTubes.js';
import { isRoadModel, isTubeModel, isShapeTube, roadKind, TUBE_EXTRAS, ROAD_TUNNEL_IDS as TUNNELS } from '../world/roadPieces.js';
import { computeEnds } from './roadEnds.js';

const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const ONE = new THREE.Vector3(1, 1, 1);
const quatOf = (rx, ry, rz) => new THREE.Quaternion().setFromEuler(new THREE.Euler(rx * D2R, ry * D2R, rz * D2R, 'ZXY'));

// The tool turns the angles of the model 19689 (TubeHalf45Bend4) before using them and after setting them (NewTubeObject): the same here
const BENT = 19689;
const turn = ([x, y, z]) => [-x, -(45 + y), z - 180];

const realMatrix = (o) => new THREE.Matrix4().compose(new THREE.Vector3(o.x, o.y, o.z), quatOf(o.rx || 0, o.ry || 0, o.rz || 0), ONE);
function chainMatrix(o) {
  let r = [o.rx || 0, o.ry || 0, o.rz || 0];
  if (o.model === BENT) r = turn(r);
  return new THREE.Matrix4().compose(new THREE.Vector3(o.x, o.y, o.z), quatOf(r[0], r[1], r[2]), ONE);
}
// The pose of a piece (position, euler angles in degrees, quaternion) from its matrix; chain: the matrix is in the frame of the tool
function poseOf(m, model, chain) {
  const pos = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
  m.decompose(pos, q, s);
  const e = new THREE.Euler().setFromQuaternion(q, 'ZXY');
  let rot = [e.x * R2D, e.y * R2D, e.z * R2D];
  if (chain && model === BENT) rot = turn(rot);
  return { pos, rot, quat: quatOf(rot[0], rot[1], rot[2]) };
}

// Place of a tube of type y put after one of type x, relative to it
const relCache = new Map();
function rel(x, y) {
  const key = x * 64 + y;
  let m = relCache.get(key);
  if (!m) {
    const r = TUBE_REL[x][y];
    m = new THREE.Matrix4().compose(new THREE.Vector3(r[0], r[1], r[2]), quatOf(r[3], r[4], r[5]), ONE);
    relCache.set(key, m);
  }
  return m;
}
const relInv = new Map();
function relInverse(x, y) {
  const key = x * 64 + y;
  let m = relInv.get(key);
  if (!m) { m = rel(x, y).clone().invert(); relInv.set(key, m); }
  return m;
}

// Where a support, a light or a cover goes on a tube: offset and rotation (the rotation turns the child inside the parent)
function attachMatrix(row) {
  return new THREE.Matrix4().compose(new THREE.Vector3(row[0], row[1], row[2]), quatOf(row[3] || 0, row[4] || 0, row[5] || 0), ONE);
}
const COVER_MODEL = { 19663: 19664, 19664: 19663 };

// ---------------------------------------------------------------- tubes
function tubeCandidates(p, q, out) {
  const tp = TUBE_TYPES[p.model], tq = TUBE_TYPES[q.model];
  if (tp && tq) {
    const wq = chainMatrix(q);
    for (const x of tq) for (const y of tp) out.push(poseOf(wq.clone().multiply(rel(x, y)), p.model, true));        // p after q
    for (const y of tq) for (const x of tp) out.push(poseOf(wq.clone().multiply(relInverse(x, y)), p.model, true)); // p before q
  }
  // Supports, light and covers on a tube
  const c = TUBE_COUNTER[q.model];
  if (tq && c !== undefined) {
    const parent = realMatrix(q);
    const put = (row) => { if (row) out.push(poseOf(parent.clone().multiply(attachMatrix(row)), p.model, false)); };
    if (p.model === 19672) put(TUBE_LIGHTS[c]);
    else if (p.model === 19670) put(TUBE_SUPPORT_1[c]);
    else if (p.model === 19671) { put(TUBE_SUPPORT_2[c]); put(TUBE_SUPPORT_3[c]); }
    else if (p.model === (COVER_MODEL[q.model] || q.model)) put(TUBE_COVERS[c]);
  }
}

// The places a tube of `model` can go after the tube q (one for each way it can be joined)
export function tubeAfter(q, model) {
  const out = [], wq = chainMatrix(q);
  for (const x of TUBE_TYPES[q.model] || []) for (const y of TUBE_TYPES[model] || []) out.push(poseOf(wq.clone().multiply(rel(x, y)), model, true));
  return out;
}

// ---------------------------------------------------------------- ramps, jumps and stunt pieces (the ends of the model)
// sockets: model id -> [{ m: Matrix4 (frame of the end: +Y goes out of the piece, +Z up), width }] | null (being read) | false (none)
const sockets = new Map();

function collectVerts(root) {
  root.updateMatrixWorld(true);
  const verts = [];
  const v = new THREE.Vector3();
  root.traverse((o) => {
    const pos = o.isMesh && o.geometry?.attributes?.position;
    if (!pos) return;
    for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld); verts.push(v.x, v.y, v.z); }
  });
  return verts;
}

// The ends of a piece with the profile of a tube (the 5 degree bends), along X: the plane of each end is fitted to the points of the rim, so a tilted end
// gives a tilted socket. The frame of a socket here: +X goes out of the piece, +Z up
export function computeTubeSockets(root, slab = 2) {
  const verts = collectVerts(root);
  const n = verts.length / 3;
  if (n < 8) return false;
  let xmin = Infinity, xmax = -Infinity;
  for (let i = 0; i < n; i++) { const x = verts[i * 3]; if (x < xmin) xmin = x; if (x > xmax) xmax = x; }
  const out = [];
  for (const sign of [-1, 1]) {
    const xe = sign > 0 ? xmax : xmin;
    const pts = [];
    for (let i = 0; i < n; i++) if ((xe - verts[i * 3]) * sign <= slab) pts.push(verts[i * 3], verts[i * 3 + 1], verts[i * 3 + 2]);
    const m = pts.length / 3;
    if (m < 6) continue;
    // least squares of x = a + b z + c y
    let sy = 0, sz = 0, sx = 0, syy = 0, szz = 0, syz = 0, sxy = 0, sxz = 0, ymin = Infinity, ymax = -Infinity, zmin = Infinity, zmax = -Infinity;
    for (let i = 0; i < m; i++) {
      const x = pts[i * 3], y = pts[i * 3 + 1], z = pts[i * 3 + 2];
      sx += x; sy += y; sz += z; syy += y * y; szz += z * z; syz += y * z; sxy += x * y; sxz += x * z;
      if (y < ymin) ymin = y; if (y > ymax) ymax = y; if (z < zmin) zmin = z; if (z > zmax) zmax = z;
    }
    const A = new THREE.Matrix3().set(m, sy, sz, sy, syy, syz, sz, syz, szz);
    if (Math.abs(A.determinant()) < 1e-9) continue;
    const sol = new THREE.Vector3(sx, sxy, sxz).applyMatrix3(A.clone().invert());       // (a, c, b)
    const a = sol.x, c = sol.y, b = sol.z;
    const ym = (ymin + ymax) / 2, zm = (zmin + zmax) / 2;
    const f = new THREE.Vector3(sign, -sign * c, -sign * b).normalize();
    const up = new THREE.Vector3(0, 0, 1).addScaledVector(f, -f.z).normalize();
    const left = new THREE.Vector3().crossVectors(up, f).normalize();
    const mat = new THREE.Matrix4().makeBasis(f, left, up).multiply(X_TO_Y);
    mat.setPosition(a + b * zm + c * ym, ym, zm);
    out.push({ m: mat, width: ymax - ymin, kind: 'tube', fz: f.z });
  }
  return out.length ? out : false;
}

// The ends of the straight tube of 10 m are at x = -5 and x = 5: every tube of the table is placed from there. The start and the end of the tube of
// each type (the places where it joins what comes before and after it), as frames with +X going out of the piece
// (the tube sockets are worked out with +X going out of the piece; every other kind of socket has +Y going out: this turns one into the other)
const X_TO_Y = new THREE.Matrix4().makeRotationZ(-Math.PI / 2);
const S0 = new THREE.Matrix4().makeTranslation(-5, 0, 0), E0 = new THREE.Matrix4().makeTranslation(5, 0, 0);
const tubeSocketCache = new Map();
function tubeSockets(model) {
  if (tubeSocketCache.has(model)) return tubeSocketCache.get(model);
  let out = false;
  const types = TUBE_TYPES[model];
  if (types && model !== BENT) {
    out = [];
    const keep = (m0) => { const m = m0.clone().multiply(X_TO_Y); if (!out.some(k => k.m.equals(m))) out.push({ m, width: 10.84, kind: 'tube', fz: m.elements[6] }); };
    for (const t of types) {
      keep(rel(t, 0).clone().multiply(S0));                                         // the end: where the next one goes
      keep(rel(0, t).clone().invert().multiply(E0).multiply(FLIP));                // the start, looking out of the piece
    }
  }
  tubeSocketCache.set(model, out);
  return out;
}

// ---------------------------------------------------------------- ramps with a sloped surface (the waterjump, the landjump, the funbox ramps...)
// The sloped face of the model (the faces that look up and to one side, the biggest group of them, whatever their slope: the ramps of the game are
// curved) gives the way up, and its lowest and highest edge. Two ramps join with the highest edge of one on the lowest edge of the other and the same
// rotation, so a ramp can be made as long as wanted (or one ramp be put before another), like putting the same ramp again along its own slope.
// ramps: model id -> { lo, hi: Vector3 (the middle of the lowest and of the highest edge of the surface), width, slope } | null (being read) | false
const ramps = new Map();

function computeRamp(root) {
  root.updateMatrixWorld(true);
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), ab = new THREE.Vector3(), ac = new THREE.Vector3();
  const tris = [];
  let upArea = 0;
  root.traverse((o) => {
    const g = o.isMesh && o.geometry;
    if (!g || !g.attributes.position) return;
    const pos = g.attributes.position, idx = g.index, n = (idx ? idx.count : pos.count) / 3;
    for (let t = 0; t < n; t++) {
      const i0 = idx ? idx.getX(t * 3) : t * 3, i1 = idx ? idx.getX(t * 3 + 1) : t * 3 + 1, i2 = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;
      a.fromBufferAttribute(pos, i0).applyMatrix4(o.matrixWorld); b.fromBufferAttribute(pos, i1).applyMatrix4(o.matrixWorld); c.fromBufferAttribute(pos, i2).applyMatrix4(o.matrixWorld);
      const nrm = new THREE.Vector3().crossVectors(ab.subVectors(b, a), ac.subVectors(c, a));
      const area = nrm.length() / 2;
      if (area < 1e-5) continue;
      nrm.normalize();
      if (nrm.z < 0) nrm.negate();                              // (the winding of the faces is not trusted: a sloped face looks up either way)
      if (nrm.z < 0.05) continue;
      upArea += area;
      tris.push({ n: nrm, area, v: [a.clone(), b.clone(), c.clone()] });
    }
  });
  // the faces that slope (6 to 70 degrees), grouped by the direction they look to (10 degrees across)
  const groups = new Map();
  for (const t of tris) {
    const slope = Math.acos(Math.min(1, t.n.z)) * R2D;
    if (slope < 6 || slope > 70) continue;
    const key = Math.round(Math.atan2(t.n.y, t.n.x) * R2D / 10);
    if (!groups.has(key)) groups.set(key, { area: 0, list: [] });
    const g = groups.get(key); g.area += t.area; g.list.push(t);
  }
  let best = null, bestKey = 0;
  for (const [k, g] of groups) if (!best || g.area > best.area) { best = g; bestKey = k; }
  if (!best || best.area < upArea * 0.2) return false;
  const list = [...best.list];
  for (const k of [bestKey - 1, bestKey + 1]) if (groups.has(k)) list.push(...groups.get(k).list);
  const nm = new THREE.Vector3();
  for (const t of list) nm.addScaledVector(t.n, t.area);
  const h = Math.hypot(nm.x, nm.y);
  if (h < 1e-3) return false;
  const g = new THREE.Vector3(-nm.x / h, -nm.y / h, 0);                         // up the slope, on the ground plane
  const lat = new THREE.Vector3(-g.y, g.x, 0);
  let tmin = Infinity, tmax = -Infinity, lmin = Infinity, lmax = -Infinity;
  for (const t of list) for (const v of t.v) { const tt = v.dot(g), ll = v.dot(lat); if (tt < tmin) tmin = tt; if (tt > tmax) tmax = tt; if (ll < lmin) lmin = ll; if (ll > lmax) lmax = ll; }
  if (tmax - tmin < 2) return false;
  const lm = (lmin + lmax) / 2, eps = Math.max(0.3, (tmax - tmin) * 0.04);
  // the lowest edge: the end of the face that is lowest; the highest edge: where the face reaches its highest (a wedge can have a cliff or a drop after it)
  let zmax = -Infinity;
  for (const t of list) for (const v of t.v) if (v.z > zmax) zmax = v.z;
  const mean = (test) => {
    let zs = 0, ts = 0, n = 0;
    for (const t of list) for (const v of t.v) if (test(v)) { zs += v.z; ts += v.dot(g); n++; }
    return n ? { z: zs / n, t: ts / n } : null;
  };
  const l0 = mean((v) => v.dot(g) <= tmin + eps), h0 = mean((v) => v.z >= zmax - 0.2);
  if (!l0 || !h0 || h0.t - l0.t < 2) return false;
  const lo = g.clone().multiplyScalar(l0.t).addScaledVector(lat, lm).setZ(l0.z);
  const hi = g.clone().multiplyScalar(h0.t).addScaledVector(lat, lm).setZ(h0.z);
  if (hi.z - lo.z < 0.4) return false;
  return { lo, hi, width: lmax - lmin, slope: Math.atan2(hi.z - lo.z, h0.t - l0.t) * R2D };
}
const rampOf = (id) => ramps.get(id) || null;

// The places of a ramp p that goes on the highest edge of the ramp q (continuing the slope up) or on its lowest edge (continuing it down): the rotation of q
function rampCandidates(p, q, out) {
  const rp = rampOf(p.model), rq = rampOf(q.model);
  if (!rp || !rq) return false;
  const qq = quatOf(q.rx || 0, q.ry || 0, q.rz || 0);
  const pen = Math.abs(rp.width - rq.width) / Math.max(rp.width, rq.width, 0.1) * 2;
  const origin = new THREE.Vector3(q.x, q.y, q.z);
  for (const [qEdge, pEdge, up] of [[rq.hi, rp.lo, true], [rq.lo, rp.hi, false]]) {
    const w = qEdge.clone().applyQuaternion(qq).add(origin);
    const pos = w.sub(pEdge.clone().applyQuaternion(qq));
    const pose = poseOf(new THREE.Matrix4().compose(pos, qq, ONE), p.model, false);
    pose.pen = pen - 1;                                                        // before the old way of joining the ends of two ramps
    pose.ramp = up ? 'up' : 'down';
    out.push(pose);
  }
  return true;
}
const bothRamps = (a, b) => !!(rampOf(a) && rampOf(b));

// The ends that are read from some models are not all real: the loop (18801) has its road ends at the bottom of the circle, and the two extra ones that are
// read at the sides of the circle (halfway up) are not places where a road joins, so only the two lowest are kept
function fixSockets(id, list) {
  if (id === 18801 && Array.isArray(list) && list.length > 2) return [...list].sort((a, b) => a.m.elements[14] - b.m.elements[14]).slice(0, 2);
  return list;
}

// Reads the ends of the models that are not known yet (the model must be loaded: it is done while it is shown)
export function warmRoad(models, ids) {
  for (const id of ids) {
    if (!ramps.has(id) && !isTubeModel(id) && !TUBE_EXTRAS.includes(id) && isRoadModel(id) && roadKind(id) === 'surface') {
      ramps.set(id, null);
      Promise.resolve(models.getModel(id)).then((obj) => ramps.set(id, obj ? computeRamp(obj) : false)).catch(() => ramps.set(id, false));
    }
  }
  for (const id of ids) {
    if (isTubeModel(id) || TUBE_EXTRAS.includes(id) || sockets.has(id) || !isRoadModel(id)) continue;
    sockets.set(id, null);
    const kind = roadKind(id);
    const read = kind === 'tube' ? computeTubeSockets : (root) => computeEnds(root, kind, null, TUNNELS.includes(id));
    Promise.resolve(models.getModel(id)).then((obj) => sockets.set(id, obj ? fixSockets(id, read(obj)) : false)).catch(() => sockets.set(id, false));
  }
}
export const roadSockets = (id) => (isTubeModel(id) ? tubeSockets(id) : sockets.get(id)) || null;

const FLIP = new THREE.Matrix4().makeRotationZ(Math.PI);
function socketCandidates(p, q, out) {
  const sp = roadSockets(p.model), sq = roadSockets(q.model);
  if (!sp || !sq) return;
  const wq = realMatrix(q);
  for (let bi = 0; bi < sq.length; bi++) {
    const b = sq[bi];
    for (let ai = 0; ai < sp.length; ai++) {
      const a = sp[ai];
      // Any end joins any other end, whatever the model (a loop to a road, a ramp to a box): the more alike they are, the better the match
      const wa = Math.max(a.width, b.width, 0.1);
      let pen = Math.abs(a.width - b.width) / wa * 3 + (a.kind === b.kind ? 0 : 2.5);
      if (a.kind === 'rim' && b.kind === 'rim') pen += Math.abs(a.height - b.height) / Math.max(a.height, b.height, 0.1) * 3;
      // Flat: the ends meet at the same point and the piece keeps the attitude of the one it joins (a ramp does not tilt the box after it)
      const flat = poseOf(wq.clone().multiply(b.m).multiply(FLIP).multiply(a.m.clone().invert()), p.model, false);
      flat.pen = pen; flat.qi = bi; flat.pi = ai;
      out.push(flat);
      // Continuing the slope: the surface goes on as it was (a ramp made longer): the piece is tilted as much as the slope of the ends says
      if (a.m3 || b.m3) {
        const tilted = poseOf(wq.clone().multiply(b.m3 || b.m).multiply(FLIP).multiply((a.m3 || a.m).clone().invert()), p.model, false);
        tilted.pen = pen + 0.3; tilted.qi = bi; tilted.pi = ai; tilted.tilted = true;
        out.push(tilted);
      }
    }
  }
}

// ---------------------------------------------------------------- the snap
// p: the moved piece { model, x, y, z, rx, ry, rz }; others: the objects of the project (the ones that are not road pieces are ignored)
// maxDist: how far (m) the piece has to be from the place where it joins to be taken there. Returns { pos, rot: [rx, ry, rz], quat } or null
export function roadSnap(p, others, maxDist = 8, want = null) {
  if (!isRoadModel(p.model)) return null;
  const here = new THREE.Vector3(p.x, p.y, p.z);
  const cur = quatOf(p.rx || 0, p.ry || 0, p.rz || 0);
  const near = [];
  for (const o of others) {
    if (o === p || o.uid === p.uid || !isRoadModel(o.model)) continue;
    if (Math.hypot(o.x - p.x, o.y - p.y, o.z - p.z) > 160) continue;
    near.push(o);
  }
  if (!near.length) return null;
  if (want) { want(p.model); for (const o of near) want(o.model); }        // the ends of the models that are not read yet
  let best = null, bestScore = Infinity;
  const list = [];
  for (const q of near) {
    list.length = 0;
    const pt = isTubeModel(p.model), qt = isTubeModel(q.model), pe = TUBE_EXTRAS.includes(p.model);
    if (qt && (pt || pe)) tubeCandidates(p, q, list);                                         // the table of the tool
    if (!(pt && qt) && !pe) { if (!(bothRamps(p.model, q.model) && rampCandidates(p, q, list))) socketCandidates(p, q, list); }     // two ramps: slope on slope; every other pair: by the ends of the models
    for (const c of list) {
      const d = c.pos.distanceTo(here);
      if (d > maxDist) continue;
      const score = d + cur.angleTo(c.quat) * R2D * 0.03 + (c.pen || 0);        // 90 degrees count as 2.7 m
      if (score >= bestScore) continue;
      // A place that already has a piece of the same model: not again
      if (near.some(o => o.model === p.model && Math.hypot(o.x - c.pos.x, o.y - c.pos.y, o.z - c.pos.z) < 0.35 && quatOf(o.rx || 0, o.ry || 0, o.rz || 0).angleTo(c.quat) < 0.05)) continue;
      best = c; bestScore = score;
    }
  }
  return best;
}

// Every place the piece p can go next to the piece q (to look at them, and for the tests)
export function roadCandidates(p, q, socketsOnly = false) {
  const list = [];
  const pt = isTubeModel(p.model), qt = isTubeModel(q.model), pe = TUBE_EXTRAS.includes(p.model);
  if (qt && (pt || pe)) tubeCandidates(p, q, list);
  if (!(pt && qt) && !pe) { if (socketsOnly || !(bothRamps(p.model, q.model) && rampCandidates(p, q, list))) socketCandidates(p, q, list); }
  return list;
}

// ---------------------------------------------------------------- for the automatic creation (Auto Criar)
// The tubes of the table: the places a tube of `model` can take after the tube q, whose own kind (type) is x: one for each way it can be joined
export function tubeSuccessors(q, x, model) {
  const out = [], wq = chainMatrix(q);
  for (const y of TUBE_TYPES[model] || []) {
    const pose = poseOf(wq.clone().multiply(rel(x, y)), model, true);
    pose.type = y;
    out.push(pose);
  }
  return out;
}
export const tubeTypesOf = (model) => TUBE_TYPES[model] || [];

// The supports of a tube q (the pole 19670 under it and the two brackets 19671), where the table of the tool puts them: [{ model, x, y, z, rx, ry, rz }]
export function tubeSupports(q) {
  const c = TUBE_COUNTER[q.model];
  if (c === undefined || !TUBE_TYPES[q.model]) return [];
  const parent = realMatrix(q), out = [];
  const put = (model, row) => {
    if (!row) return;
    const pose = poseOf(parent.clone().multiply(attachMatrix(row)), model, false);
    out.push({ model, x: pose.pos.x, y: pose.pos.y, z: pose.pos.z, rx: pose.rot[0], ry: pose.rot[1], rz: pose.rot[2] });
  };
  put(19670, TUBE_SUPPORT_1[c]); put(19671, TUBE_SUPPORT_2[c]); put(19671, TUBE_SUPPORT_3[c]);
  return out;
}

// The places a piece of `model` can take at the ends of the piece q that are still free (usedEnds: the ends of q that already have a piece), without
// tilting it: for each one the end of q (qi) and the end of the new piece that touches it (pi)
export function endSuccessors(q, usedEnds, model) {
  const out = [];
  const sq = roadSockets(q.model);
  if (!sq || isTubeModel(q.model)) return out;
  for (const c of roadCandidates({ model, x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 }, q, true)) {
    if (c.tilted || c.qi === undefined || usedEnds.has(c.qi)) continue;
    out.push(c);
  }
  return out;
}
export const rampsOf = rampOf;
export const endsOf = (model) => (isTubeModel(model) ? null : roadSockets(model));
export { poseOf as _poseOf };
