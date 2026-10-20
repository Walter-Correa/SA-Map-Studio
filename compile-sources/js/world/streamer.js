// Map streaming: decides which instances appear according to the camera,
// loads models on demand (closest first) and toggles LOD <-> detailed.
import * as THREE from 'three';
import { iplQuaternion } from './models.js';

const CELL = 200;

export class WorldStreamer {
  constructor(gamedata, models, scene) {
    this.gd = gamedata;
    this.models = models;
    this.root = new THREE.Group();
    this.root.name = 'mundo';
    this.root.matrixAutoUpdate = false;
    scene.add(this.root);
    this.grid = new Map();
    this.shown = new Map();     // instance index -> Object3D
    this.queue = new Set();     // model ids waiting to load
    this.loading = 0;
    this.maxConcurrent = 12;
    this._frustum = new THREE.Frustum();
    this._m = new THREE.Matrix4();
    this._sphere = new THREE.Sphere();
    this.hidden = new Set();    // hidden instances (the project's RemoveBuilding)
    this.settings = { drawScale: 1.0, maxDistance: 600, showLod: true, interiors: false, enabled: true };
    this.lastPos = new THREE.Vector3(1e9, 0, 0);
    this.dirty = true;
    this.stats = { shown: 0, pending: 0 };
    this._q = new THREE.Quaternion();
    for (const inst of gamedata.instances) {
      const k = this.key(inst.x, inst.y);
      let c = this.grid.get(k);
      if (!c) this.grid.set(k, (c = []));
      c.push(inst);
    }
  }

  key(x, y) { return Math.floor(x / CELL) + ',' + Math.floor(y / CELL); }

  setHidden(set) { this.hidden = set; this.dirty = true; }
  invalidate() { this.dirty = true; }

  instanceVisibleByFilter(inst) {
    if (this.hidden.has(inst.index)) return false;
    // 0 = open world; 13 = appears anywhere
    const isInt = inst.interior !== 0 && inst.interior !== 13;
    return this.settings.interiors ? isInt : !isInt;
  }

  drawDistance(inst) {
    const d = inst.def.drawDist * this.settings.drawScale;
    return inst.isLod ? d : Math.min(d, this.settings.maxDistance);
  }

  // camera: the viewport camera (position and direction decide the loading order)
  update(camera, force = false) {
    if (!this.settings.enabled) return;
    const camPos = camera.position;
    this.models.pumpUploads?.(3);
    if (!force && !this.dirty && camPos.distanceToSquared(this.lastPos) < 25) return;
    const now = performance.now();
    if (!force && now - (this.lastUpdate || 0) < 120) return;
    this.lastUpdate = now;
    this.lastPos.copy(camPos);
    this.dirty = false;
    const wanted = new Map();
    const range = Math.max(this.settings.maxDistance, this.settings.showLod ? Math.max(3000, this.settings.maxDistance * 1.3) * this.settings.drawScale : 0);
    const cx = Math.floor(camPos.x / CELL), cy = Math.floor(camPos.y / CELL);
    const r = Math.ceil(range / CELL);
    const needModel = new Map(); // id -> priority (lower = sooner)
    const lodCandidates = [];
    // What is in front of the camera loads first
    camera.updateMatrixWorld();
    this._frustum.setFromProjectionMatrix(this._m.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
    const prio = (inst, dist) => {
      this._sphere.center.set(inst.x, inst.y, inst.z);
      this._sphere.radius = 40;
      return this._frustum.intersectsSphere(this._sphere) ? dist : dist * 3 + 150;
    };
    // Preloads a bit beyond the view distance, so the object is ready by the time it appears
    const prefetch = 1.25;
    for (let gx = cx - r; gx <= cx + r; gx++) {
      for (let gy = cy - r; gy <= cy + r; gy++) {
        const cell = this.grid.get(gx + ',' + gy);
        if (!cell) continue;
        for (const inst of cell) {
          if (!this.instanceVisibleByFilter(inst)) continue;
          const dx = inst.x - camPos.x, dy = inst.y - camPos.y, dz = inst.z - camPos.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          const dd = this.drawDistance(inst);
          if (dist > dd * (inst.isLod ? 1 : prefetch)) continue;
          if (inst.isLod) { if (this.settings.showLod) lodCandidates.push([inst, dist]); continue; }
          // Modelo detalhado
          const inRange = dist <= dd;
          if (this.models.ready.has(inst.id)) { if (inRange && this.models.ready.get(inst.id)) wanted.set(inst.index, inst); }
          else needModel.set(inst.id, Math.min(needModel.get(inst.id) ?? 1e9, prio(inst, dist) + (inRange ? 0 : 400)));
        }
      }
    }
    // LOD: appears while some nearby child is not ready yet or is out of range
    for (const [lod, dist] of lodCandidates) {
      let covered = false;
      if (lod.children && lod.children.length) {
        covered = true;
        for (const ch of lod.children) {
          if (!this.instanceVisibleByFilter(ch)) continue;
          if (!wanted.has(ch.index)) { covered = false; break; }
        }
      }
      if (covered) continue;
      if (this.models.ready.has(lod.id)) { if (this.models.ready.get(lod.id)) wanted.set(lod.index, lod); }
      else needModel.set(lod.id, Math.min(needModel.get(lod.id) ?? 1e9, prio(lod, dist) * 0.6));
    }
    // Removes what left
    for (const [idx, obj] of this.shown) {
      if (!wanted.has(idx)) { this.root.remove(obj); this.shown.delete(idx); }
    }
    // Adds what entered
    for (const [idx, inst] of wanted) {
      if (this.shown.has(idx)) continue;
      const obj = this.models.instantiate(inst.id);
      if (!obj) continue;
      obj.position.set(inst.x, inst.y, inst.z);
      obj.quaternion.copy(iplQuaternion(inst, this._q));
      obj.updateMatrix();
      obj.matrixAutoUpdate = false;
      obj.updateMatrixWorld(true);
      obj.userData.instance = inst;
      obj.traverse(o => { o.userData.instance = inst; });
      this.root.add(obj);
      this.shown.set(idx, obj);
    }
    // Loading queue, closest first
    const order = [...needModel.entries()].sort((a, b) => a[1] - b[1]).map(e => e[0]);
    this.pendingOrder = order;
    this.pump();
    this.stats.shown = this.shown.size;
    this.stats.pending = order.length;
    // From time to time releases models that were left behind
    if (now - (this.lastEvict || 0) > 5000) {
      this.lastEvict = now;
      const keep = new Set(this.keepModels ? this.keepModels() : []);
      for (const inst of wanted.values()) keep.add(inst.id);
      for (const id of this.queue) keep.add(id);
      this.models.evict(keep, this.modelBudget || 300);
    }
  }

  pump() {
    const order = this.pendingOrder || [];
    while (this.loading < this.maxConcurrent && order.length) {
      const id = order.shift();
      if (this.queue.has(id) || this.models.ready.has(id)) continue;
      this.queue.add(id);
      this.loading++;
      this.models.getModel(id).finally(() => {
        this.loading--;
        this.queue.delete(id);
        this.dirty = true;
        this.pump();
      });
    }
  }

  // List of world objects visible for clicking (raycast)
  pickables() { return this.root.children; }

  // Instances near a point (to remove buildings)
  instancesNear(x, y, z, radius, id = -1) {
    const out = [];
    const r = Math.ceil(radius / CELL) + 1;
    const cx = Math.floor(x / CELL), cy = Math.floor(y / CELL);
    for (let gx = cx - r; gx <= cx + r; gx++) for (let gy = cy - r; gy <= cy + r; gy++) {
      const cell = this.grid.get(gx + ',' + gy);
      if (!cell) continue;
      for (const inst of cell) {
        if (id !== -1 && inst.id !== id) continue;
        const dx = inst.x - x, dy = inst.y - y, dz = inst.z - z;
        if (dx * dx + dy * dy + dz * dz <= radius * radius) out.push(inst);
      }
    }
    return out;
  }
}
