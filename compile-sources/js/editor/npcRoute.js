// Routes through the streets for the open.mp NPCs: the open.mp NPC component only wanders through the street nodes (NPC_PlayNode), it
// does not find the way from one place to another. The editor finds it here, over the same official files (NODES0.DAT to NODES63.DAT,
// served by /api/npc/nodes/<area>), and the route becomes the points of a NPC path (NPC_CreatePath / NPC_MoveByPath).
// Also reads the NPC recordings (.rec) to show their path in the 3D view.

const areas = new Map(); // area -> Promise<{ nodes, veh } | null>

// NODES<n>.DAT: header (nodes, vehicle nodes, ped nodes, navi nodes, links), nodes of 28 bytes (position in 1/8 m, first link, area,
// id, width, flood, flags: the low 4 bits are the number of links), navi nodes of 14 bytes (position, area, node, direction x and y,
// flags: bits 8-10 lanes on the left of the direction, 11-13 lanes on the right), links of 4 bytes (area, node), 768 bytes, then
// one navi link per link (2 bytes: navi node in the low 10 bits, its area in the high 6). The navi node of a road link says which way
// its traffic goes: the lanes counted on its left go along its direction and the ones on its right against it (checked on the divided
// roads of Los Santos: with this, the way back runs on the left of the way there, as in right-hand traffic).
function parseArea(buf) {
  const v = new DataView(buf);
  if (buf.byteLength < 20) return null;
  const count = v.getUint32(0, true), veh = v.getUint32(4, true), navi = v.getUint32(12, true), nLinks = v.getUint32(16, true);
  const linkBase = 20 + count * 28 + navi * 14;
  if (linkBase + nLinks * 4 > buf.byteLength) return null;
  const naviBase = 20 + count * 28, naviLinkBase = linkBase + nLinks * 4 + 768;
  const navis = [];
  for (let i = 0; i < navi; i++) {
    const o = naviBase + i * 14, fl = v.getUint32(o + 10, true);
    navis.push({ dx: v.getInt8(o + 8), dy: v.getInt8(o + 9), left: (fl >> 8) & 7, right: (fl >> 11) & 7 });
  }
  const hasNaviLinks = naviLinkBase + nLinks * 2 <= buf.byteLength;
  const nodes = [];
  for (let i = 0; i < count; i++) {
    const o = 20 + i * 28;
    const first = v.getUint16(o + 16, true), flags = v.getUint32(o + 24, true), n = flags & 15;
    const links = [];
    for (let k = 0; k < n; k++) {
      const lo = linkBase + (first + k) * 4;
      if (lo + 4 > buf.byteLength) continue;
      const nl = hasNaviLinks ? v.getUint16(naviLinkBase + (first + k) * 2, true) : 0xFFFF;
      links.push([v.getUint16(lo, true), v.getUint16(lo + 2, true), nl >> 10, nl & 1023]);
    }
    nodes.push({ x: v.getInt16(o + 8, true) / 8, y: v.getInt16(o + 10, true) / 8, z: v.getInt16(o + 12, true) / 8, links });
  }
  return { nodes, veh, navis };
}

function loadArea(a) {
  if (a < 0 || a > 63) return Promise.resolve(null);
  if (!areas.has(a)) {
    areas.set(a, fetch(`/api/npc/nodes/${a}`).then(r => (r.ok ? r.arrayBuffer() : null)).then(b => (b ? parseArea(b) : null)).catch(() => null));
  }
  return areas.get(a);
}

export const areaOf = (x, y) => Math.min(7, Math.max(0, Math.floor((y + 3000) / 750))) * 8 + Math.min(7, Math.max(0, Math.floor((x + 3000) / 750)));

// The route from a to b ({x, y, z}) through the streets: car = vehicle nodes (roads), else ped nodes (sidewalks, paths).
// Returns the points (z at the height of a character) or null when there is no way.
export async function streetRoute(a, b, car, lane = 0) {
  const ax = Math.floor((a.x + 3000) / 750), ay = Math.floor((a.y + 3000) / 750), bx = Math.floor((b.x + 3000) / 750), by = Math.floor((b.y + 3000) / 750);
  const want = [];
  for (let gy = Math.max(0, Math.min(ay, by) - 1); gy <= Math.min(7, Math.max(ay, by) + 1); gy++) {
    for (let gx = Math.max(0, Math.min(ax, bx) - 1); gx <= Math.min(7, Math.max(ax, bx) + 1); gx++) want.push(gy * 8 + gx);
  }
  const loaded = new Map();
  await Promise.all(want.map(async (id) => { const d = await loadArea(id); if (d) loaded.set(id, d); }));
  if (!loaded.size) return null;
  const isType = (area, i) => { const d = loaded.get(area); return d && (car ? i < d.veh : i >= d.veh); };
  const nearest = (p) => {
    let best = null, bd = Infinity;
    for (const [area, d] of loaded) {
      const from = car ? 0 : d.veh, to = car ? d.veh : d.nodes.length;
      for (let i = from; i < to; i++) {
        const n = d.nodes[i], dd = (n.x - p.x) ** 2 + (n.y - p.y) ** 2 + ((n.z - p.z) * 2) ** 2;
        if (dd < bd) { bd = dd; best = [area, i]; }
      }
    }
    return best;
  };
  const s = nearest(a), g = nearest(b);
  if (!s || !g) return null;
  const key = (area, i) => area * 65536 + i;
  const node = (k) => loaded.get(Math.floor(k / 65536))?.nodes[k % 65536];
  const goal = node(key(...g)), sk = key(...s), gk = key(...g);
  const h = (n) => Math.hypot(n.x - goal.x, n.y - goal.y, n.z - goal.z);
  // A* with a binary heap
  const open = [[h(node(sk)), sk]], gScore = new Map([[sk, 0]]), came = new Map(), closed = new Set(), twoWayTo = new Map();
  const push = (e) => { open.push(e); let i = open.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (open[p][0] <= open[i][0]) break; [open[p], open[i]] = [open[i], open[p]]; i = p; } };
  const pop = () => { const top = open[0], last = open.pop(); if (open.length) { open[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < open.length && open[l][0] < open[m][0]) m = l; if (r < open.length && open[r][0] < open[m][0]) m = r; if (m === i) break; [open[m], open[i]] = [open[i], open[m]]; i = m; } } return top; };
  let found = false, steps = 0;
  while (open.length && steps++ < 400000) {
    const [, k] = pop();
    if (k === gk) { found = true; break; }
    if (closed.has(k)) continue;
    closed.add(k);
    const n = node(k);
    for (const [la, li, na, ni] of n.links) {
      if (!loaded.has(la) || !isType(la, li)) continue;
      const nk = key(la, li), m = node(nk);
      if (!m || closed.has(nk)) continue;
      let twoWay = true, against = false;
      const nv = car ? loaded.get(na)?.navis[ni] : null;
      if (nv && (nv.left || nv.right)) {
        const along = (m.x - n.x) * nv.dx + (m.y - n.y) * nv.dy >= 0;
        // Against the traffic of a one-way road: allowed only when there is no other way (it costs much more)
        if ((along ? nv.left : nv.right) === 0) against = true; // measured on the divided roads of Los Santos
        twoWay = nv.left > 0 && nv.right > 0;
      }
      const gs = gScore.get(k) + Math.hypot(m.x - n.x, m.y - n.y, m.z - n.z) * (against ? 8 : 1);
      if (gs < (gScore.get(nk) ?? Infinity)) { gScore.set(nk, gs); came.set(nk, k); twoWayTo.set(nk, twoWay); push([gs + h(m), nk]); }
    }
  }
  if (!found) return null;
  const path = [];
  for (let k = gk; k !== undefined; k = came.get(k)) path.push({ ...node(k), twoWay: twoWayTo.get(k) ?? twoWayTo.get(came.get(k) === undefined ? k : k) ?? true });
  path.reverse();
  if (path.length > 1) path[0].twoWay = path[1].twoWay;
  return simplify(keepRight(path, car ? lane : 0)).map(p => ({ x: +p.x.toFixed(3), y: +p.y.toFixed(3), z: +(p.z + 1).toFixed(3) }));
}

// ---------------------------------------------------------------------------  streets of an area
// "Walk the streets" inside a radius or an area: the native wander (NPC_PlayNode) follows the middle of the road, places the NPC on
// the street point (a teleport) and cannot be kept inside an area. Inside a limit the editor gives the NPC the street graph of that
// place: points, and from each one the ways it can go (to which point and the side offset of the lane: a driver keeps to the right
// on a road with traffic both ways and never goes against a one-way road). The NPC wanders over it point by point (NPC paths).
// Only the part where it can always go on and come back is kept (strongly connected), so it never gets stuck at a one-way exit.
export const MAX_STREET_NODES = 1500;

// The place a NPC wanders around: its vehicle when it drives one
export function npcHome(a, project) {
  const v = a.npc?.vehicle && (project?.vehicles || []).find(x => x.uid === a.npc.vehicle.uid);
  return v ? { x: v.x, y: v.y, z: v.z } : { x: a.x, y: a.y, z: a.z };
}
export const npcDrives = (a) => !!a.npc?.vehicle && a.npc.vehicle.seat === 0;

// What the graph of a NPC depends on (null = the NPC needs none)
export function streetsKey(a, project) {
  const n = a.npc;
  if (!n || n.mode !== 'wander' || n.wanderLimit === 'free') return null;
  if (n.wanderLimit === 'radius' && !(n.wanderRadius > 0)) return null;
  if (n.wanderLimit === 'area' && !n.area) return null;
  const h = npcHome(a, project), car = npcDrives(a), r = (v) => Math.round(v * 2) / 2;
  return JSON.stringify(n.wanderLimit === 'area' ? ['a', n.area.x1, n.area.y1, n.area.x2, n.area.y2, car, car ? n.lane : 0, r(h.x), r(h.y)]
    : ['r', n.wanderRadius, r(h.x), r(h.y), car, car ? n.lane : 0]);
}

export async function streetGraph(a, project) {
  const n = a.npc, h = npcHome(a, project), car = npcDrives(a), lane = car ? n.lane : 0;
  const rect = n.wanderLimit === 'area'
    ? { x1: Math.min(n.area.x1, n.area.x2), y1: Math.min(n.area.y1, n.area.y2), x2: Math.max(n.area.x1, n.area.x2), y2: Math.max(n.area.y1, n.area.y2) }
    : { x1: h.x - n.wanderRadius, y1: h.y - n.wanderRadius, x2: h.x + n.wanderRadius, y2: h.y + n.wanderRadius };
  const inside = n.wanderLimit === 'area' ? (p) => p.x >= rect.x1 && p.x <= rect.x2 && p.y >= rect.y1 && p.y <= rect.y2
    : (p) => Math.hypot(p.x - h.x, p.y - h.y) <= n.wanderRadius;
  const ids = [];
  for (let gy = areaOf(0, rect.y1) >> 3; gy <= areaOf(0, rect.y2) >> 3; gy++) {
    for (let gx = areaOf(rect.x1, 0) & 7; gx <= (areaOf(rect.x2, 0) & 7); gx++) ids.push(gy * 8 + gx);
  }
  const loaded = new Map();
  await Promise.all(ids.map(async (id) => { const d = await loadArea(id); if (d) loaded.set(id, d); }));
  // The street points inside the limit
  const index = new Map(), nodes = [];
  for (const [area, d] of loaded) {
    const from = car ? 0 : d.veh, to = car ? d.veh : d.nodes.length;
    for (let i = from; i < to; i++) if (inside(d.nodes[i])) { index.set(area * 65536 + i, nodes.length); nodes.push({ ...d.nodes[i], area, i }); }
  }
  // The ways out of each one (not against a one-way road), with the lane offset
  const adj = nodes.map((nd) => {
    const out = [];
    for (const [la, li, na, ni] of nd.links) {
      const j = index.get(la * 65536 + li);
      if (j === undefined) continue;
      const m = nodes[j];
      let twoWay = true;
      const nv = car ? loaded.get(na)?.navis[ni] : null;
      if (nv && (nv.left || nv.right)) {
        const along = (m.x - nd.x) * nv.dx + (m.y - nd.y) * nv.dy >= 0;
        if ((along ? nv.left : nv.right) === 0) continue;
        twoWay = nv.left > 0 && nv.right > 0;
      }
      let ox = 0, oy = 0;
      if (lane > 0 && twoWay) {
        const dx = m.x - nd.x, dy = m.y - nd.y, len = Math.hypot(dx, dy) || 1;
        ox = dy / len * lane; oy = -dx / len * lane;
      }
      out.push([j, ox, oy]);
    }
    return out;
  });
  // Strongly connected parts (Kosaraju): keeps the one nearest to the NPC (or the biggest, when that one is tiny)
  const N = nodes.length, order = [], seen = new Uint8Array(N);
  for (let s = 0; s < N; s++) {
    if (seen[s]) continue;
    const stack = [[s, 0]]; seen[s] = 1;
    while (stack.length) {
      const top = stack[stack.length - 1], e = adj[top[0]][top[1]++];
      if (e) { if (!seen[e[0]]) { seen[e[0]] = 1; stack.push([e[0], 0]); } } else { order.push(top[0]); stack.pop(); }
    }
  }
  const radj = nodes.map(() => []);
  adj.forEach((list, u) => list.forEach(([v]) => radj[v].push(u)));
  const comp = new Int32Array(N).fill(-1), sizes = [];
  for (let i = order.length - 1; i >= 0; i--) {
    const s = order[i];
    if (comp[s] >= 0) continue;
    const c = sizes.length, stack = [s];
    comp[s] = c; let size = 0;
    while (stack.length) { const u = stack.pop(); size++; for (const v of radj[u]) if (comp[v] < 0) { comp[v] = c; stack.push(v); } }
    sizes.push(size);
  }
  if (!N) return { nodes: [], adj: [] };
  let near = 0, nd = Infinity;
  nodes.forEach((p, i) => { const d = Math.hypot(p.x - h.x, p.y - h.y, (p.z - h.z) * 2); if (d < nd) { nd = d; near = i; } });
  let keep = comp[near];
  if (sizes[keep] < 8) keep = sizes.indexOf(Math.max(...sizes));
  const remap = new Map();
  nodes.forEach((_, i) => { if (comp[i] === keep && remap.size < MAX_STREET_NODES) remap.set(i, remap.size); });
  const r2 = (v) => Math.round(v * 100) / 100;
  const outNodes = [], outAdj = [];
  for (const [i] of remap) {
    outNodes.push([r2(nodes[i].x), r2(nodes[i].y), r2(nodes[i].z + 1)]);
    outAdj.push(adj[i].filter(([j]) => remap.has(j)).map(([j, ox, oy]) => [remap.get(j), r2(ox), r2(oy)]));
  }
  return { nodes: outNodes, adj: outAdj, cut: comp.filter(c => c === keep).length > MAX_STREET_NODES };
}

// Brings the street graphs of the NPCs of these projects up to date (before a test or an export)
export async function refreshNpcStreets(projects) {
  let changed = false;
  for (const p of projects) {
    if (!p || p.mode === 'sp' || p.server === 'samp') continue;
    for (const a of p.actors || []) {
      const key = streetsKey(a, p);
      if (!key) { if (a.npc?.streets) { a.npc.streets = null; changed = true; } continue; }
      if (a.npc.streets?.key === key) continue;
      try { a.npc.streets = { key, ...(await streetGraph(a, p)) }; changed = true; } catch { a.npc.streets = null; }
    }
  }
  return changed;
}

// The vehicle nodes run along the middle of the road: on a road with traffic both ways a driver keeps to its lane, `lane` metres to the
// right of the way it goes; a one-way road keeps the middle (at a bend, the offset follows the mean of the two directions)
function keepRight(pts, lane) {
  if (!lane || pts.length < 2) return pts;
  return pts.map((p, i) => {
    if (p.twoWay === false) return p;
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let dx = b.x - a.x, dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len; dy /= len;
    return { x: p.x + dy * lane, y: p.y - dx * lane, z: p.z };
  });
}

// Keeps the points where the way turns (straight runs become one segment, at most 60 m long)
function simplify(pts) {
  if (pts.length < 3) return pts;
  const out = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const a = out[out.length - 1], b = pts[i], c = pts[i + 1];
    const ux = b.x - a.x, uy = b.y - a.y, vx = c.x - b.x, vy = c.y - b.y;
    const lu = Math.hypot(ux, uy), lv = Math.hypot(vx, vy);
    const turn = lu > 0 && lv > 0 ? Math.abs(ux * vy - uy * vx) / (lu * lv) : 0;
    if (turn > 0.08 || Math.abs(c.z - a.z) > 2.5 || Math.hypot(c.x - a.x, c.y - a.y) > 60) out.push(b);
  }
  out.push(pts[pts.length - 1]);
  return out;
}

// ---------------------------------------------------------------------------  recordings
// .rec (SA-MP / open.mp NPC recording): version (1000), type (1 driver, 2 on foot), then frames of time + sync data:
// on foot 4 + 68 bytes (position after the keys, at +10), driver 4 + 63 bytes (position after the vehicle, keys and rotation, at +28)
export function parseRec(base64) {
  try {
    const bin = atob(base64), u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    const v = new DataView(u.buffer);
    if (u.length < 8) return null;
    const type = v.getInt32(4, true), size = type === 1 ? 67 : 72, at = type === 1 ? 28 : 10;
    const pts = [];
    for (let o = 8; o + size <= u.length; o += size) {
      pts.push({ t: v.getUint32(o, true), x: v.getFloat32(o + at, true), y: v.getFloat32(o + at + 4, true), z: v.getFloat32(o + at + 8, true) });
    }
    const ok = pts.length && pts.every(p => Number.isFinite(p.x) && Math.abs(p.x) < 20000 && Math.abs(p.y) < 20000);
    return ok ? { type: type === 1 ? 'driver' : 'onfoot', points: pts, duration: pts[pts.length - 1].t - pts[0].t } : null;
  } catch { return null; }
}
