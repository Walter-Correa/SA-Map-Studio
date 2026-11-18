// SPDX-License-Identifier: MPL-2.0
// 3D view of the open.mp NPCs: the path of each NPC (the selected one bright, with its points; the points with actions in gold), the
// range of the guards, the path of the recording, and the preview that walks the NPC along its path at its speed.
import * as THREE from 'three';
import { app } from '../ui/common.js';
import { projectNpcs, npcSpeed, npcLegs } from './ompNpc.js';
import { parseRec, npcHome } from './npcRoute.js';

const COL = { path: 0x4fc3f7, dim: 0x4fc3f7, point: 0xffffff, act: 0xf0a630, guard: 0xe53935, rec: 0xab47bc, sel: 0xffeb3b, area: 0x66bb6a, street: 0x26a69a };
let group = null, timer = 0, preview = null;
const recCache = new Map(); // base64 -> parsed

const lineMat = (color, opacity) => new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthTest: false });
const dotGeo = new THREE.SphereGeometry(1, 10, 8);

function line(pts, color, opacity) {
  const g = new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(p.x, p.y, p.z)));
  const l = new THREE.Line(g, lineMat(color, opacity));
  l.renderOrder = 999;
  return l;
}
function dot(p, color, r) {
  const m = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95, depthTest: false }));
  m.position.set(p.x, p.y, p.z); m.scale.setScalar(r); m.renderOrder = 1000;
  return m;
}

// The points the NPC goes through, from where it stands (the closing point of a loop included)
export function npcRoutePoints(a) {
  const n = a.npc;
  if (!n.points.length) return [];
  const pts = [{ x: a.x, y: a.y, z: a.z }, ...n.points];
  if (n.loop === 'loop' && n.points.length > 1) pts.push(n.points[0]);
  return pts;
}

export function recPoints(a) {
  const data = app.project?.recordings?.[a.npc.rec];
  if (!data) return null;
  if (!recCache.has(data)) recCache.set(data, parseRec(data));
  const r = recCache.get(data);
  if (!r) return null;
  if (!a.npc.recFromNpc) return r.points;
  const f = r.points[0];
  return r.points.map(p => ({ t: p.t, x: p.x - f.x + a.x, y: p.y - f.y + a.y, z: p.z - f.z + a.z }));
}

// Points of the selected NPC that can be clicked and dragged: { uid, i, mesh }
let dots = [], drag = null, onPointSelect = null;
export function setNpcPointSelectHandler(fn) { onPointSelect = fn; }

function rebuild() {
  timer = 0;
  if (!group) return;
  for (const c of [...group.children]) { group.remove(c); c.geometry?.dispose?.(); c.material?.dispose?.(); }
  dots = [];
  const p = app.project;
  if (!p || p.mode === 'sp') return;
  const sel = new Set(app.editor.selection || []);
  for (const a of projectNpcs(p)) {
    const n = a.npc, on = sel.has(a.uid);
    if (n.mode === 'path' && n.points.length) {
      // While a point is dragged, the path follows it
      const view = drag && drag.uid === a.uid ? { ...a, npc: { ...n, points: n.points.map((q, i) => (i === drag.i && drag.pos ? { ...q, ...drag.pos } : q)) } } : a;
      group.add(line(npcRoutePoints(view), on ? COL.sel : COL.dim, on ? 1 : 0.45));
      if (on) view.npc.points.forEach((pt, i) => {
        const m = dot(pt, pt.acts.length ? COL.act : (i === app.npcPoint ? COL.sel : COL.point), i === app.npcPoint ? 0.45 : 0.3);
        group.add(m);
        dots.push({ uid: a.uid, i, mesh: m });
      });
    }
    if (n.mode === 'guard' || (n.look && n.mode === 'idle')) {
      const ring = [];
      for (let i = 0; i <= 48; i++) { const t = i / 48 * Math.PI * 2; ring.push({ x: a.x + Math.cos(t) * n.range, y: a.y + Math.sin(t) * n.range, z: a.z - 0.9 }); }
      group.add(line(ring, n.mode === 'guard' ? COL.guard : COL.path, on ? 0.9 : 0.35));
    }
    if (n.mode === 'wander' && n.wanderLimit !== 'free') {
      // The limit of the streets (radius or area) and, selected, the streets it can take inside it (with the lane of a driver)
      const h = npcHome(a, p), z = h.z - 0.9;
      if (n.wanderLimit === 'radius' && n.wanderRadius > 0) {
        const ring = [];
        for (let i = 0; i <= 64; i++) { const t = i / 64 * Math.PI * 2; ring.push({ x: h.x + Math.cos(t) * n.wanderRadius, y: h.y + Math.sin(t) * n.wanderRadius, z }); }
        group.add(line(ring, COL.area, on ? 0.95 : 0.4));
      } else if (n.wanderLimit === 'area' && n.area) {
        const { x1, y1, x2, y2 } = n.area;
        group.add(line([{ x: x1, y: y1, z }, { x: x2, y: y1, z }, { x: x2, y: y2, z }, { x: x1, y: y2, z }, { x: x1, y: y1, z }], COL.area, on ? 0.95 : 0.4));
      }
      const st = n.streets;
      if (on && st?.nodes?.length) {
        const seg = [];
        st.adj.forEach((list, i) => list.forEach(([j, ox, oy]) => {
          const u = st.nodes[i], v = st.nodes[j];
          seg.push(u[0] + ox, u[1] + oy, u[2] - 0.6, v[0] + ox, v[1] + oy, v[2] - 0.6);
        }));
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3));
        const ls = new THREE.LineSegments(g, lineMat(COL.street, 0.8));
        ls.renderOrder = 998;
        ls.userData.noPick = true;
        group.add(ls);
      }
    }
    if (n.mode === 'playback' && n.rec && on) {
      const rp = recPoints(a);
      if (rp) group.add(line(rp, COL.rec, 0.95));
    }
    if (on && n.surf) {
      const t = p.find(n.surf.uid);
      if (t) group.add(line([{ x: a.x, y: a.y, z: a.z }, { x: t.x, y: t.y, z: t.z }], COL.act, 0.8));
    }
  }
}
export function refreshNpcOverlay() { if (!timer) timer = setTimeout(rebuild, 30); }

// Preview: walks the 3D model of the NPC along its path (or its recording), at its speed, and stops at the actions that wait
export function previewNpc(uid, onEnd) {
  stopNpcPreview();
  const a = app.project.find(uid), node = app.editor.nodes.get(uid);
  if (!a?.npc || !node) return false;
  const n = a.npc, inVeh = !!n.vehicle && n.vehicle.seat === 0;
  let segs = [];
  if (n.mode === 'playback') {
    const rp = recPoints(a);
    if (!rp || rp.length < 2) return false;
    for (let i = 1; i < rp.length; i++) segs.push({ from: rp[i - 1], to: rp[i], ms: Math.max(1, rp[i].t - rp[i - 1].t), wait: 0 });
  } else if (n.mode === 'path' && n.points.length) {
    const pts = npcRoutePoints(a), mps = npcSpeed(n, inVeh);
    const { seq } = npcLegs(n);
    for (let i = 1; i < pts.length; i++) {
      const pi = seq[i - 1] ?? 0, pt = n.points[pi];
      const wait = (pt?.acts || []).filter(x => x.t === 'wait').reduce((s, x) => s + x.ms, 0);
      segs.push({ from: pts[i - 1], to: pts[i], ms: Math.max(1, Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y, pts[i].z - pts[i - 1].z) / mps * 1000), wait });
    }
    if (n.loop === 'pingpong') segs = segs.concat(segs.slice(1).reverse().map(s => ({ from: s.to, to: s.from, ms: s.ms, wait: 0 })));
  } else return false;
  const home = { x: node.position.x, y: node.position.y, z: node.position.z, rz: node.rotation.z };
  let k = 0, start = performance.now();
  const loop = (now) => {
    if (!preview) return;
    let s = segs[k], t = (now - start) / s.ms;
    while (t >= 1 && (now - start) >= s.ms + s.wait) {
      start += s.ms + s.wait; k++;
      // A path of one point is walked once, as in the game (there it stays at the point)
      const once = n.loop === 'once' || (n.mode === 'path' && n.points.length === 1) || (n.mode === 'playback' && !n.recLoop);
      if (k >= segs.length) { if (once) { stopNpcPreview(); onEnd?.(); return; } k = 0; }
      s = segs[k]; t = (now - start) / s.ms;
    }
    t = Math.min(1, t);
    node.position.set(s.from.x + (s.to.x - s.from.x) * t, s.from.y + (s.to.y - s.from.y) * t, s.from.z + (s.to.z - s.from.z) * t);
    const dx = s.to.x - s.from.x, dy = s.to.y - s.from.y;
    if (Math.hypot(dx, dy) > 0.01) node.rotation.z = Math.atan2(dy, dx) - Math.PI / 2;
    node.updateMatrixWorld(true);
    preview.raf = requestAnimationFrame(loop);
  };
  preview = { uid, node, home, raf: requestAnimationFrame(loop) };
  return true;
}
export function stopNpcPreview() {
  if (!preview) return;
  cancelAnimationFrame(preview.raf);
  const { node, home } = preview;
  node.position.set(home.x, home.y, home.z); node.rotation.z = home.rz; node.updateMatrixWorld(true);
  preview = null;
}
export const npcPreviewing = (uid) => preview?.uid === uid;

export function initNpcOverlay() {
  group = new THREE.Group();
  group.userData.noPick = true;
  app.vp.scene.add(group);
  app.on('project-change', refreshNpcOverlay);
  app.on('project', () => { stopNpcPreview(); refreshNpcOverlay(); });
  app.editor.on('selection', refreshNpcOverlay);
  refreshNpcOverlay();
  bindPointDrag();
}

// The points of the path of the selected NPC: a click selects the point (its fields and actions open in the inspector) and dragging
// moves it over the ground. The listeners come before the editor's (capture), so the click does not select something else.
function bindPointDrag() {
  const dom = app.vp.renderer.domElement;
  const v = new THREE.Vector3();
  const pickDot = (e) => {
    const r = dom.getBoundingClientRect();
    let best = null, bd = 14 * 14;
    for (const d of dots) {
      v.copy(d.mesh.position).project(app.vp.camera);
      if (v.z > 1) continue;
      const sx = (v.x + 1) / 2 * r.width + r.left, sy = (1 - v.y) / 2 * r.height + r.top;
      const dd = (sx - e.clientX) ** 2 + (sy - e.clientY) ** 2;
      if (dd < bd) { bd = dd; best = d; }
    }
    return best;
  };
  const stop = (e) => { e.stopImmediatePropagation(); e.preventDefault(); };
  dom.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || app.editor.placing) return;
    const d = pickDot(e);
    if (!d) return;
    stop(e);
    drag = { uid: d.uid, i: d.i, pos: null, x: e.clientX, y: e.clientY };
    app.npcPoint = d.i;
    dom.setPointerCapture?.(e.pointerId);
    rebuild();
  }, true);
  dom.addEventListener('pointermove', (e) => {
    if (!drag) {
      dom.style.cursor = dots.length && pickDot(e) ? 'grab' : '';
      return;
    }
    stop(e);
    if (!drag.pos && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 4) return;
    const hit = app.editor.surfacePoint(e, group);
    if (!hit?.point) return;
    drag.pos = { x: +hit.point.x.toFixed(3), y: +hit.point.y.toFixed(3), z: +(hit.point.z + 1).toFixed(3) };
    dom.style.cursor = 'grabbing';
    rebuild();
  }, true);
  const end = (e) => {
    if (!drag) return;
    stop(e);
    const { uid, i, pos } = drag;
    drag = null;
    dom.style.cursor = '';
    if (pos) {
      app.project.updateItems('Mover ponto do NPC', [uid], (o) => { const q = o.npc?.points[i]; if (q) Object.assign(q, pos); });
    }
    rebuild();
    onPointSelect?.(uid, i);
  };
  dom.addEventListener('pointerup', end, true);
  dom.addEventListener('pointercancel', end, true);
}
