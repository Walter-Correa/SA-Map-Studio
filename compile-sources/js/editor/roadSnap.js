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

// Reads the ends of the models that are not known yet (the model must be loaded: it is done while it is shown)
export function warmRoad(models, ids) {
  for (const id of ids) {
    if (isTubeModel(id) || TUBE_EXTRAS.includes(id) || sockets.has(id) || !isRoadModel(id)) continue;
    sockets.set(id, null);
    const kind = roadKind(id);
    const read = kind === 'tube' ? computeTubeSockets : (root) => computeEnds(root, kind, null, TUNNELS.includes(id));
    Promise.resolve(models.getModel(id)).then((obj) => sockets.set(id, obj ? read(obj) : false)).catch(() => sockets.set(id, false));
  }
}
export const roadSockets = (id) => (isTubeModel(id) ? tubeSockets(id) : sockets.get(id)) || null;

const FLIP = new THREE.Matrix4().makeRotationZ(Math.PI);
function socketCandidates(p, q, out) {
  const sp = roadSockets(p.model), sq = roadSockets(q.model);
  if (!sp || !sq) return;
  const wq = realMatrix(q);
  for (const b of sq) {
    for (const a of sp) {
      // Any end joins any other end, whatever the model (a loop to a road, a ramp to a box): the more alike they are, the better the match
      const wa = Math.max(a.width, b.width, 0.1);
      let pen = Math.abs(a.width - b.width) / wa * 3 + (a.kind === b.kind ? 0 : 2.5);
      if (a.kind === 'rim' && b.kind === 'rim') pen += Math.abs(a.height - b.height) / Math.max(a.height, b.height, 0.1) * 3;
      // Flat: the ends meet at the same point and the piece keeps the attitude of the one it joins (a ramp does not tilt the box after it)
      const flat = poseOf(wq.clone().multiply(b.m).multiply(FLIP).multiply(a.m.clone().invert()), p.model, false);
      flat.pen = pen;
      out.push(flat);
      // Continuing the slope: the surface goes on as it was (a ramp made longer): the piece is tilted as much as the slope of the ends says
      if (a.m3 || b.m3) {
        const tilted = poseOf(wq.clone().multiply(b.m3 || b.m).multiply(FLIP).multiply((a.m3 || a.m).clone().invert()), p.model, false);
        tilted.pen = pen + 0.3;
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
    if (!(pt && qt) && !pe) socketCandidates(p, q, list);                                     // every other pair: by the ends of the models
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
export function roadCandidates(p, q) {
  const list = [];
  const pt = isTubeModel(p.model), qt = isTubeModel(q.model), pe = TUBE_EXTRAS.includes(p.model);
  if (qt && (pt || pe)) tubeCandidates(p, q, list);
  if (!(pt && qt) && !pe) socketCandidates(p, q, list);
  return list;
}
