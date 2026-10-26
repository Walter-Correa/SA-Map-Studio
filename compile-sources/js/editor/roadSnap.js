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
import { isRoadModel, isTubeModel, TUBE_EXTRAS } from '../world/roadPieces.js';

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

function computeSockets(root) {
  root.updateMatrixWorld(true);
  const verts = [];
  const v = new THREE.Vector3();
  root.traverse((o) => {
    const pos = o.isMesh && o.geometry?.attributes?.position;
    if (!pos) return;
    for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld); verts.push(v.x, v.y, v.z); }
  });
  const n = verts.length / 3;
  if (n < 8) return false;
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) { const c = verts[i * 3 + k]; if (c < min[k]) min[k] = c; if (c > max[k]) max[k] = c; }
  const size = [max[0] - min[0], max[1] - min[1]];
  // The long side of the piece (the way the traffic goes); Y when it is square
  const axis = size[0] > size[1] * 1.25 ? 0 : 1, lat = 1 - axis;
  const L = size[axis];
  if (L < 3) return false;
  const bins = 10, binW = L * 0.5 / bins;
  const out = [];
  for (const sign of [-1, 1]) {
    const end = sign > 0 ? max[axis] : min[axis];
    // the width of the end: the sideways extent of all the points of the first strips
    let latMin = Infinity, latMax = -Infinity;
    for (let i = 0; i < n; i++) {
      const d = (end - verts[i * 3 + axis]) * sign;
      if (d < 0 || d > binW * 2) continue;
      const c = verts[i * 3 + lat];
      if (c < latMin) latMin = c; if (c > latMax) latMax = c;
    }
    if (!(latMax - latMin > 0.5)) continue;
    const centre = (latMin + latMax) / 2;
    // the surface along the middle of the piece (the rails of the sides do not count): its highest point in each strip from the end inwards; when the
    // middle has no points (a hollow model) all the width counts
    let top, z0 = -1;
    for (const half of [Math.max(0.3, (latMax - latMin) * 0.2), Infinity]) {
      top = new Array(bins).fill(-Infinity);
      for (let i = 0; i < n; i++) {
        const d = (end - verts[i * 3 + axis]) * sign;
        if (d < 0 || d >= binW * bins || Math.abs(verts[i * 3 + lat] - centre) > half) continue;
        const b = Math.min(bins - 1, Math.floor(d / binW));
        if (verts[i * 3 + 2] > top[b]) top[b] = verts[i * 3 + 2];
      }
      z0 = top.findIndex(z => z > -Infinity);
      if (z0 === 0 || (z0 > 0 && half === Infinity)) break;
    }
    if (z0 < 0) continue;
    // the height at the end and the slope going out: from the first strips
    const z1 = top[z0], b1 = z0;
    let b2 = b1 + 1; while (b2 < bins && !(top[b2] > -Infinity)) b2++;
    const slope = b2 < bins ? -(top[b2] - z1) / ((b2 - b1) * binW) : 0;       // up when going out of the piece: positive
    const pitch = Math.atan(Math.max(-1.5, Math.min(1.5, slope)));
    const f = new THREE.Vector3();
    f.setComponent(axis, sign * Math.cos(pitch)); f.setComponent(2, Math.sin(pitch));
    const up = new THREE.Vector3(0, 0, 1).addScaledVector(f, -f.z).normalize();
    const right = new THREE.Vector3().crossVectors(f, up).normalize();
    const m = new THREE.Matrix4().makeBasis(right, f, up);
    const p = new THREE.Vector3(); p.setComponent(axis, end); p.setComponent(lat, centre); p.setComponent(2, z1);
    m.setPosition(p);
    out.push({ m, width: latMax - latMin });
  }
  return out.length ? out : false;
}

// Reads the ends of the models that are not known yet (the model must be loaded: it is done while it is shown)
export function warmRoad(models, ids) {
  for (const id of ids) {
    if (isTubeModel(id) || TUBE_EXTRAS.includes(id) || sockets.has(id) || !isRoadModel(id)) continue;
    sockets.set(id, null);
    Promise.resolve(models.getModel(id)).then((obj) => sockets.set(id, obj ? computeSockets(obj) : false)).catch(() => sockets.set(id, false));
  }
}
export const roadSockets = (id) => sockets.get(id) || null;

const FLIP = new THREE.Matrix4().makeRotationZ(Math.PI);
function socketCandidates(p, q, out) {
  const sp = sockets.get(p.model), sq = sockets.get(q.model);
  if (!sp || !sq) return;
  const wq = realMatrix(q);
  for (const b of sq) {
    const target = wq.clone().multiply(b.m).multiply(FLIP);                    // the end of p must be here, looking at the end of q
    for (const a of sp) {
      if (Math.abs(a.width - b.width) > 0.25 * Math.max(a.width, b.width)) continue;
      // The surfaces have to continue one the other: the slope of the two ends is the same (one going up where the other goes down)
      if (Math.abs(Math.asin(a.m.elements[6]) + Math.asin(b.m.elements[6])) > 0.21) continue;
      out.push(poseOf(target.clone().multiply(a.m.clone().invert()), p.model, false));
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
    if (isTubeModel(q.model)) { if (isTubeModel(p.model) || TUBE_EXTRAS.includes(p.model)) tubeCandidates(p, q, list); }
    else if (!isTubeModel(p.model) && !TUBE_EXTRAS.includes(p.model)) socketCandidates(p, q, list);
    for (const c of list) {
      const d = c.pos.distanceTo(here);
      if (d > maxDist) continue;
      const score = d + cur.angleTo(c.quat) * R2D * 0.04;                       // 90 degrees count as 3.6 m
      if (score >= bestScore) continue;
      // A place that already has a piece of the same model: not again
      if (near.some(o => o.model === p.model && Math.hypot(o.x - c.pos.x, o.y - c.pos.y, o.z - c.pos.z) < 0.35 && quatOf(o.rx || 0, o.ry || 0, o.rz || 0).angleTo(c.quat) < 0.05)) continue;
      best = c; bestScore = score;
    }
  }
  return best;
}
