// Núcleo do editor: liga o projeto à cena, cuida da seleção, do gizmo,
// do modo de posicionar objetos e da remoção de prédios do mapa original.
import * as THREE from 'three';
import { TransformControls } from 'three/addons/TransformControls.js';
import { isTyping } from './viewport.js';
import { normalizeMaterial, isText, keepsTexture, parseColor, MAX_MATERIAL_INDEX } from './materials.js';
import { CAR_COLORS } from '../world/vehicleMods.js';

const D2R = Math.PI / 180, R2D = 180 / Math.PI;

export function eulerFromItem(o, kind) {
  return (kind === 'vehicles' || kind === 'actors')
    ? new THREE.Euler(0, 0, (o.rz || 0) * D2R, 'ZXY')
    : new THREE.Euler((o.rx || 0) * D2R, (o.ry || 0) * D2R, (o.rz || 0) * D2R, 'ZXY');
}

export function quatOfItem(o, kind = 'objects') {
  return new THREE.Quaternion().setFromEuler(eulerFromItem(o, kind));
}

const round = (v, d = 4) => Math.round(v * 10 ** d) / 10 ** d;
const normDeg = (a) => { let v = ((a % 360) + 360) % 360; if (v > 359.99995) v = 0; return round(v, 4); };

export class Editor extends EventTarget {
  constructor({ viewport, streamer, models, gamedata, project }) {
    super();
    this.vp = viewport;
    this.streamer = streamer;
    this.models = models;
    this.gd = gamedata;
    this.project = null;
    this.root = new THREE.Group();
    this.root.name = 'projeto';
    viewport.scene.add(this.root);
    this.nodes = new Map();          // uid -> Object3D
    this.selection = [];             // uids do projeto
    this.worldSelection = [];        // instâncias do mapa selecionadas
    this.mode = 'translate';
    this.space = 'world';
    this.snap = { enabled: false, move: 0.5, rotate: 15, magnetic: true, magDist: 0.8 };
    this.transformSpeed = { move: 1.0, rotate: 1.0 };
    this.placing = null;             // {model, ghost}
    this.matSel = [];                // índices de material escolhidos (0 a 15)
    this.slotHiddenMat = new THREE.MeshBasicMaterial({ visible: false });
    this.slotMat = new THREE.MeshBasicMaterial({ color: 0xf0a630, transparent: true, opacity: 0.38, depthWrite: false,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    this.removeLodToo = true;

    // Gizmo
    const tc = new TransformControls(viewport.camera, viewport.renderer.domElement);
    tc.setSize(0.9);
    this.tc = tc;
    this.gizmo = tc.getHelper();
    this.gizmo.traverse(o => { o.userData.noPick = true; });
    viewport.scene.add(this.gizmo);
    this.pivot = new THREE.Object3D();
    this.pivot.rotation.order = 'ZXY';
    viewport.scene.add(this.pivot);
    tc.addEventListener('dragging-changed', (e) => {
      viewport.fly.enabled = !e.value;
      if (e.value) this.beginDrag(); else this.endDrag();
    });
    tc.addEventListener('objectChange', () => this.onGizmoChange());

    // Destaques
    this.selBoxes = new THREE.Group();
    viewport.scene.add(this.selBoxes);
    this.hoverBox = new THREE.Box3Helper(new THREE.Box3(), 0xf0a630);
    this.hoverBox.visible = false;
    viewport.scene.add(this.hoverBox);

    this.bindPointer();
    viewport.onFrame(() => this.frame());
    this.setProject(project);
  }

  get worldSel() { return this.worldSelection.length ? this.worldSelection[0] : null; }
  set worldSel(val) { this.worldSelection = val ? (Array.isArray(val) ? [...val] : [val]) : []; }

  // ------------------------------------------------------------------ projeto
  setProject(project) {
    this.unsub?.();
    if (this.extraProjects) {
      for (const entry of this.extraProjects.values()) entry.unsub?.();
      this.extraProjects.clear();
    } else {
      this.extraProjects = new Map();
    }
    this.project = project;
    for (const n of this.nodes.values()) this.root.remove(n);
    this.nodes.clear();
    this.selection = [];
    this.worldSelection = [];
    this.unsub = project.on((ch) => this.onProjectChange(ch));
    this.syncAll();
    this.emit('selection');
  }

  addExtraProject(proj, options = { readonly: false }) {
    if (!this.extraProjects) this.extraProjects = new Map();
    const readonly = !!options?.readonly;
    if (this.extraProjects.has(proj.name)) {
      const entry = this.extraProjects.get(proj.name);
      entry.readonly = readonly;
      this.syncAll();
      this.clearSelection();
      return;
    }
    if (proj === this.project) return;
    const unsub = proj.on((ch) => {
      this.emit('extra-project-change', { project: proj, change: ch });
      import('../ui/common.js').then(m => m.app?.emit('project-change', ch)).catch(() => {});
      if (!this.isProjectReadonly(proj)) {
        import('../ui/projects.js').then(m => m.scheduleSave?.(proj)).catch(() => {});
      }
      this.onProjectChange(ch);
    });
    this.extraProjects.set(proj.name, { project: proj, unsub, readonly });
    this.syncAll();
  }

  removeExtraProject(name) {
    if (!this.extraProjects) return;
    const entry = this.extraProjects.get(name);
    if (!entry) return;
    entry.unsub?.();
    this.extraProjects.delete(name);
    this.syncAll();
  }

  isProjectReadonly(proj) {
    if (!proj) return false;
    const name = typeof proj === 'string' ? proj : proj.name;
    if (name === this.project?.name) return false;
    const entry = this.extraProjects?.get(name);
    return !!entry?.readonly;
  }

  findProjectOf(uid) {
    if (!uid) return this.project;
    if (this.project && this.project.find(uid)) return this.project;
    if (this.extraProjects) {
      for (const { project } of this.extraProjects.values()) {
        if (project.find(uid)) return project;
      }
    }
    return this.project;
  }

  onProjectChange(ch) {
    this.syncAll();
    this.selection = this.selection.filter(u => this.findProjectOf(u)?.find(u));
    this.attachGizmo();
    this.fixMatSel();
    this.emit('change', ch);
  }

  syncAll() {
    const projects = [this.project, ...(this.extraProjects ? [...this.extraProjects.values()].map(e => e.project) : [])];
    const alive = new Set();
    for (const p of projects) {
      for (const kind of ['objects', 'vehicles', 'actors']) {
        for (const o of (p[kind] || [])) {
          alive.add(o.uid);
          let node = this.nodes.get(o.uid);
          const modelId = kind === 'actors' ? (o.skin ?? 0) : o.model;
          let sig = '';
          if (kind === 'objects') sig = JSON.stringify(o.materials || []);
          else if (kind === 'vehicles') sig = JSON.stringify([o.color1, o.color2, o.paintjob, o.components]);
          else if (kind === 'actors') sig = JSON.stringify([o.skin, o.anim]);

          if (!node || node.userData.model !== modelId || node.userData.matSig !== sig) {
            if (node) this.root.remove(node);
            node = this.createNode(o, kind);
            node.userData.matSig = sig;
            node.userData.projectId = p.name;
            this.nodes.set(o.uid, node);
            this.root.add(node);
          }
          node.position.set(o.x, o.y, o.z);
          node.rotation.copy(eulerFromItem(o, kind));
          node.updateMatrixWorld(true);
        }
      }
    }
    for (const [uid, node] of this.nodes) {
      if (!alive.has(uid)) { this.root.remove(node); this.nodes.delete(uid); }
    }
    this.updateAttachedChildren();
    this.updateHiddenWorld();
    this.refreshSelectionBoxes();
  }

  createNode(o, kind) {
    const node = new THREE.Group();
    node.rotation.order = 'ZXY';
    const modelId = kind === 'actors' ? (o.skin ?? 0) : o.model;
    node.userData = { uid: o.uid, model: modelId, kind };
    const fill = () => {
      const m = this.models.instantiate(modelId);
      node.clear();
      if (m) {
        node.add(m);
        if (kind === 'vehicles') {
          this.applyVehicleVisuals(m, o);
        } else if (kind === 'actors') {
          // Visual do actor: adiciona indicador/pose
        } else if (o.materials && o.materials.length) {
          this.models.applyMaterials(m, o.materials).then(() => this.updateSlotHighlight());
        }
      } else {
        node.add(this.models.missingMarker());
      }
      node.traverse(c => { c.userData.uid = o.uid; });
      this.refreshSelectionBoxes();
      if (this.selection.includes(o.uid)) this.attachGizmo();
      if (this.matSel.length && this.selection.includes(o.uid)) this.updateSlotHighlight();
    };
    if (this.models.ready.has(modelId)) fill();
    else this.models.getModel(modelId).then(fill);
    return node;
  }

  applyVehicleVisuals(m, o) {
    if (!m || !o) return;
    const def = this.models.gd.models.get(o.model);
    const modelName = (def?.model || m.name || '').toLowerCase();

    // 1. Cores 1 e 2
    if (o.color1 !== undefined || o.color2 !== undefined) {
      const rgb1 = o.color1 >= 0 ? CAR_COLORS[o.color1 % CAR_COLORS.length] : [235, 235, 235];
      const rgb2 = o.color2 >= 0 ? CAR_COLORS[o.color2 % CAR_COLORS.length] : [110, 110, 120];
      m.traverse(child => {
        if (!child.isMesh) return;
        const mats = Array.isArray(child.material) ? [...child.material] : [child.material];
        let changed = false;
        for (let i = 0; i < mats.length; i++) {
          const mat = mats[i];
          if (!mat || !mat.color) continue;
          const isPrimary = (mat.userData && mat.userData.carColor === 1) || (!mat.map && Math.round(mat.color.r * 255) >= 200 && Math.round(mat.color.g * 255) >= 200 && Math.round(mat.color.b * 255) >= 200);
          const isSecondary = (mat.userData && mat.userData.carColor === 2) || (!mat.map && Math.round(mat.color.r * 255) >= 100 && Math.round(mat.color.r * 255) <= 125 && Math.round(mat.color.g * 255) >= 100 && Math.round(mat.color.g * 255) <= 125);
          if (isPrimary && rgb1) {
            const cln = mat.clone();
            cln.userData = { ...mat.userData, carColor: 1 };
            cln.color.setRGB(rgb1[0] / 255, rgb1[1] / 255, rgb1[2] / 255);
            mats[i] = cln;
            changed = true;
          } else if (isSecondary && rgb2) {
            const cln = mat.clone();
            cln.userData = { ...mat.userData, carColor: 2 };
            cln.color.setRGB(rgb2[0] / 255, rgb2[1] / 255, rgb2[2] / 255);
            mats[i] = cln;
            changed = true;
          }
        }
        if (changed) child.material = Array.isArray(child.material) ? mats : mats[0];
      });
    }

    // 2. Paintjob
    if (def && o.paintjob !== undefined && o.paintjob !== null && o.paintjob >= 0) {
      const pjNum = o.paintjob + 1;
      const candidates = [
        `${modelName}${pjNum}body256`,
        `${modelName}${pjNum}remap`,
        `${modelName}remap${pjNum}`,
        `paintjob${pjNum}`
      ];
      this.models.txdChain(def.txd).then(chain => {
        let foundTex = null;
        for (const c of candidates) {
          for (const map of chain) {
            if (map.has(c)) { foundTex = map.get(c); break; }
          }
          if (foundTex) break;
        }
        if (foundTex) {
          m.traverse(child => {
            if (!child.isMesh) return;
            const mats = Array.isArray(child.material) ? [...child.material] : [child.material];
            let changed = false;
            for (let i = 0; i < mats.length; i++) {
              if (mats[i]?.userData?.carColor === 1) {
                const cln = mats[i].clone();
                cln.map = foundTex.texture;
                cln.color.setRGB(1, 1, 1);
                cln.needsUpdate = true;
                mats[i] = cln;
                changed = true;
              }
            }
            if (changed) child.material = Array.isArray(child.material) ? mats : mats[0];
          });
        }
      }).catch(() => {});
    }

    // 3. Componentes de Tuning
    const toRemove = [];
    m.children.forEach(c => { if (c.userData?.isVehicleComp) toRemove.push(c); });
    toRemove.forEach(c => m.remove(c));

    if (o.components && o.components.length) {
      const attachComp = (compObj) => {
        if (!compObj) return;
        compObj.userData.isVehicleComp = true;
        compObj.traverse(c => {
          c.userData.noPick = true;
          c.userData.uid = o.uid;
          c.userData.isVehicleComp = true;
        });
        m.add(compObj);
      };

      for (const compId of o.components) {
        if (this.models.ready.has(compId)) {
          attachComp(this.models.instantiate(compId));
        } else {
          this.models.getModel(compId).then(() => {
            attachComp(this.models.instantiate(compId));
          }).catch(() => {});
        }
      }
    }
  }

  updateVehicleVisuals(uid) {
    const node = this.nodes.get(uid);
    const item = this.project?.find(uid);
    if (!node || !item) return;
    const m = node.children.find(c => c.name && !c.userData.missing && !c.userData.isVehicleComp) || node.children[0];
    if (m) this.applyVehicleVisuals(m, item);
  }

  // Esconde do mapa os prédios removidos no projeto
  updateHiddenWorld() {
    const hidden = new Set();
    for (const r of this.project.removed) {
      for (const inst of this.streamer.instancesNear(r.x, r.y, r.z, Math.max(r.radius, 0.01), r.model)) hidden.add(inst.index);
    }
    this.streamer.setHidden(hidden);
  }

  // ------------------------------------------------------------------ seleção
  emit(type, detail) { this.dispatchEvent(new CustomEvent(type, { detail })); }
  on(type, fn) { const h = (e) => fn(e.detail, e); this.addEventListener(type, h); return () => this.removeEventListener(type, h); }

  select(uids, additive = false) {
    this.worldSelection = [];
    uids = uids.filter(u => {
      const p = this.findProjectOf(u);
      return p && p.find(u) && !this.isProjectReadonly(p);
    });
    if (additive) {
      const set = new Set(this.selection);
      for (const u of uids) set.has(u) ? set.delete(u) : set.add(u);
      this.selection = [...set];
    } else this.selection = uids;
    this.fixMatSel();
    this.attachGizmo();
    this.refreshSelectionBoxes();
    this.emit('selection');
  }

  selectWorld(insts, additive = false) {
    this.selection = [];
    insts = Array.isArray(insts) ? insts : [insts];
    if (additive) {
      const cur = [...this.worldSelection];
      for (const inst of insts) {
        const idx = cur.findIndex(i => i.index === inst.index);
        if (idx >= 0) cur.splice(idx, 1);
        else cur.push(inst);
      }
      this.worldSelection = cur;
    } else {
      this.worldSelection = [...insts];
    }
    this.attachGizmo();
    this.refreshSelectionBoxes();
    this.emit('selection');
  }

  clearSelection() {
    this.selection = [];
    this.worldSelection = [];
    this.fixMatSel();
    this.attachGizmo();
    this.refreshSelectionBoxes();
    this.emit('selection');
  }

  selectedItems() { return this.selection.map(u => { const p = this.findProjectOf(u); return { uid: u, kind: p.kindOf(u), item: p.find(u), project: p }; }).filter(s => s.item); }

  attachGizmo() {
    if (!this.selection.length || this.placing || this.mode === 'texture') { this.tc.detach(); this.updateSlotHighlight(); return; }
    if (this.dragging) return;
    const items = this.selectedItems();
    if (!items.length) { this.tc.detach(); return; }

    const totalProjectItems = this.project.objects.length + this.project.vehicles.length + (this.project.actors?.length || 0);
    const isAll = items.length >= totalProjectItems && totalProjectItems > 0;

    if (items.length === 1) {
      this.pivot.position.set(items[0].item.x, items[0].item.y, items[0].item.z);
      this.pivot.rotation.copy(eulerFromItem(items[0].item, items[0].kind));
    } else if (isAll && this.selection.length) {
      // Quando seleciona todo o projeto, mantém o gizmo no item principal / primeiro selecionado para não sumir da tela
      const primary = this.project.find(this.selection[0]);
      if (primary) {
        this.pivot.position.set(primary.x, primary.y, primary.z);
      } else {
        const c = new THREE.Vector3();
        for (const s of items) c.add(new THREE.Vector3(s.item.x, s.item.y, s.item.z));
        c.divideScalar(items.length);
        this.pivot.position.copy(c);
      }
      this.pivot.rotation.set(0, 0, 0, 'ZXY');
    } else {
      const c = new THREE.Vector3();
      for (const s of items) c.add(new THREE.Vector3(s.item.x, s.item.y, s.item.z));
      c.divideScalar(items.length);
      this.pivot.position.copy(c);
      this.pivot.rotation.set(0, 0, 0, 'ZXY');
    }

    this.pivot.updateMatrixWorld(true);
    this.tc.attach(this.pivot);
    this.tc.setMode(this.mode);
    this.tc.setSpace(this.mode === 'rotate' && items.length === 1 ? this.space : this.space);
    const onlyYaw = items.every(s => s.kind === 'vehicles' || s.kind === 'actors');
    this.tc.showX = !(this.mode === 'rotate' && onlyYaw);
    this.tc.showY = !(this.mode === 'rotate' && onlyYaw);
    this.tc.showZ = true;
    this.tc.enabled = true;
    this.gizmo.visible = true;
    this.applySnap();
  }

  setMode(mode) {
    this.mode = mode;
    this.fixMatSel();
    this.attachGizmo();
    this.updateSlotHighlight();
    this.emit('mode');
    this.emit('slot');
  }
  setSpace(space) { this.space = space; this.attachGizmo(); this.emit('mode'); }
  setSnap(s) { Object.assign(this.snap, s); this.applySnap(); this.emit('mode'); }
  setTransformSpeed(speeds) {
    if (speeds.move !== undefined) {
      this.transformSpeed.move = Math.min(10.0, Math.max(0.001, +speeds.move || 1.0));
      if (this.tc) this.tc.translationSpeed = this.transformSpeed.move;
    }
    if (speeds.rotate !== undefined) {
      this.transformSpeed.rotate = Math.min(10.0, Math.max(0.001, +speeds.rotate || 1.0));
      if (this.tc) this.tc.rotationSpeed = this.transformSpeed.rotate;
    }
  }
  selectAll(focus = false) {
    this.syncAll();
    const all = [...this.project.objects, ...this.project.vehicles, ...(this.project.actors || [])].map(o => o.uid);
    if (all.length) {
      const prevActiveUid = this.selection.length ? this.selection[0] : null;
      this.mode = 'translate';
      this.select(all);
      if (prevActiveUid && this.selection.includes(prevActiveUid)) {
        const primary = this.project.find(prevActiveUid);
        if (primary) {
          this.pivot.position.set(primary.x, primary.y, primary.z);
          this.pivot.updateMatrixWorld(true);
        }
      } else if (focus) {
        this.focusSelection();
      }
      this.setMode('translate');
      this.attachGizmo();
      this.emit('mode');
    }
  }
  resetRotationSelection() {
    const items = this.selectedItems();
    if (!items.length) return;
    const byProject = new Map();
    for (const s of items) {
      const p = this.findProjectOf(s.uid);
      if (!byProject.has(p)) byProject.set(p, []);
      byProject.get(p).push(s);
    }
    for (const [p, pItems] of byProject.entries()) {
      p.updateItems('Resetar rotação', pItems.map(s => s.uid), (o) => {
        if ('rx' in o) { o.rx = 0; o.ry = 0; o.rz = 0; }
        else if ('rz' in o) { o.rz = 0; }
      });
    }
    this.attachGizmo();
    this.refreshSelectionBoxes();
  }
  applySnap() {
    this.tc.setTranslationSnap(this.snap.enabled ? this.snap.move : null);
    this.tc.setRotationSnap(this.snap.enabled ? this.snap.rotate * D2R : null);
  }

  beginDrag() {
    this.dragging = true;
    const items = this.selectedItems();
    this.dragStart = {
      pivotPos: this.pivot.position.clone(),
      pivotQuat: this.pivot.quaternion.clone(),
      states: this.selection.map(u => this.findProjectOf(u).snapshot(u)),
      nodes: items.map(s => {
        const node = this.nodes.get(s.uid);
        return {
          uid: s.uid,
          kind: s.kind,
          pos: node ? node.position.clone() : new THREE.Vector3(s.item.x, s.item.y, s.item.z),
          quat: node ? node.quaternion.clone() : new THREE.Quaternion().setFromEuler(eulerFromItem(s.item, s.kind)),
        };
      }),
    };
  }

  onGizmoChange() {
    if (!this.dragStart) return;
    this.pivot.updateMatrixWorld(true);
    const C = this.dragStart.pivotPos;

    if (this.mode === 'rotate') {
      // Rotação conjunta e rígida em torno do centro comum C
      const Q = this.pivot.quaternion.clone().multiply(this.dragStart.pivotQuat.clone().invert());

      for (const { uid, kind, pos, quat } of this.dragStart.nodes) {
        const node = this.nodes.get(uid);
        if (!node) continue;
        const offset = pos.clone().sub(C).applyQuaternion(Q);
        node.position.copy(C).add(offset);
        node.quaternion.copy(Q).multiply(quat);
        node.scale.set(1, 1, 1);
        node.updateMatrixWorld(true);

        const item = this.findProjectOf(uid).find(uid);
        if (item) {
          item.x = round(node.position.x); item.y = round(node.position.y); item.z = round(node.position.z);
          const e = new THREE.Euler().setFromQuaternion(node.quaternion, 'ZXY');
          if (kind === 'vehicles' || kind === 'actors') item.rz = normDeg(e.z * R2D);
          else { item.rx = normDeg(e.x * R2D); item.ry = normDeg(e.y * R2D); item.rz = normDeg(e.z * R2D); }
        }
      }
    } else {
      // Movimento conjunto preservando distâncias relativas
      const dPos = this.pivot.position.clone().sub(C);

      for (const { uid, kind, pos, quat } of this.dragStart.nodes) {
        const node = this.nodes.get(uid);
        if (!node) continue;
        node.position.copy(pos).add(dPos);
        node.quaternion.copy(quat);
        node.scale.set(1, 1, 1);
        node.updateMatrixWorld(true);

        // Encaixe magnético em bordas de objetos próximos
        if (this.mode === 'translate' && this.snap.magnetic && this.selection.length === 1) {
          const candidates = [...this.nodes.values()].filter(n => n !== node);
          const snapDelta = findMagneticSnap(node, candidates, this.snap.magDist || 0.8);
          if (snapDelta) {
            node.position.add(snapDelta);
            node.updateMatrixWorld(true);
          }
        }

        const item = this.findProjectOf(uid).find(uid);
        if (item) {
          item.x = round(node.position.x); item.y = round(node.position.y); item.z = round(node.position.z);
        }
      }
    }

    // Se o objeto manipulado estiver anexado (attach), calcula os novos offsets relativos em tempo real
    for (const u of this.selection) {
      const p = this.findProjectOf(u);
      const it = p?.find(u);
      if (it && it.attach && it.attach.to) {
        const rel = this.calculateRelativeAttachOffset(it.uid, it.attach.to);
        if (rel) {
          it.attach.ox = rel.ox;
          it.attach.oy = rel.oy;
          it.attach.oz = rel.oz;
          if (it.attach.syncRot !== 0) {
            it.attach.rx = rel.rx;
            it.attach.ry = rel.ry;
            it.attach.rz = rel.rz;
          }
        }
      }
    }

    this.updateAttachedChildren();
    this.refreshSelectionBoxes();
    this.emit('live');
  }

  endDrag() {
    this.dragging = false;
    if (!this.dragStart) return;
    const byProject = new Map();
    for (const u of this.selection) {
      const p = this.findProjectOf(u);
      if (!byProject.has(p)) byProject.set(p, []);
      byProject.get(p).push(u);
    }
    const beforeMap = new Map();
    for (const s of this.dragStart.states) beforeMap.set(s.uid, s);
    for (const [p, uids] of byProject.entries()) {
      const before = uids.map(u => beforeMap.get(u)).filter(Boolean);
      const after = uids.map(u => p.snapshot(u));
      p.record(this.mode === 'rotate' ? 'Girar' : 'Mover', before, after);
    }
    this.dragStart = null;
    this.attachGizmo();
  }

  // Rotação conjunta pelo painel Inspetor em torno do centro comum
  rotateSelectionTogether(rxDeg, ryDeg, rzDeg) {
    const items = this.selectedItems();
    if (!items.length) return;
    const c = new THREE.Vector3();
    for (const s of items) c.add(new THREE.Vector3(s.item.x, s.item.y, s.item.z));
    c.divideScalar(items.length);

    const deltaEuler = new THREE.Euler(rxDeg * D2R, ryDeg * D2R, rzDeg * D2R, 'ZXY');
    const Q = new THREE.Quaternion().setFromEuler(deltaEuler);

    const before = items.map(s => this.project.snapshot(s.uid));
    for (const s of items) {
      const node = this.nodes.get(s.uid);
      if (!node) continue;
      const offset = node.position.clone().sub(c).applyQuaternion(Q);
      node.position.copy(c).add(offset);
      node.quaternion.multiply(Q);
      node.updateMatrixWorld(true);

      s.item.x = round(node.position.x); s.item.y = round(node.position.y); s.item.z = round(node.position.z);
      const e = new THREE.Euler().setFromQuaternion(node.quaternion, 'ZXY');
      if (s.kind === 'vehicles' || s.kind === 'actors') s.item.rz = normDeg(e.z * R2D);
      else { s.item.rx = normDeg(e.x * R2D); s.item.ry = normDeg(e.y * R2D); s.item.rz = normDeg(e.z * R2D); }
    }
    this.attachGizmo();
    this.refreshSelectionBoxes();
    const after = items.map(s => this.project.snapshot(s.uid));
    this.project.record(`Girar ${items.length} itens`, before, after);
    this.emit('change');
  }

  // Anexação de objetos (AttachObjectToObject)
  updateAttachedChildren() {
    if (!this.project) return;
    for (const obj of this.project.objects) {
      if (!obj.attach || !obj.attach.to) continue;
      // Se o filho estiver sendo manipulado diretamente pelo gizmo, preserva sua posição no mundo
      if (this.dragging && this.selection.includes(obj.uid)) continue;
      const parentNode = this.nodes.get(obj.attach.to);
      const childNode = this.nodes.get(obj.uid);
      if (!parentNode || !childNode) continue;
      const offsetPos = new THREE.Vector3(obj.attach.ox || 0, obj.attach.oy || 0, obj.attach.oz || 0);
      const offsetRot = new THREE.Euler((obj.attach.rx || 0) * D2R, (obj.attach.ry || 0) * D2R, (obj.attach.rz || 0) * D2R, 'ZXY');
      const offsetQuat = new THREE.Quaternion().setFromEuler(offsetRot);
      
      const childWorldPos = offsetPos.clone().applyQuaternion(parentNode.quaternion).add(parentNode.position);
      childNode.position.copy(childWorldPos);
      if (obj.attach.syncRot !== 0) {
        childNode.quaternion.copy(parentNode.quaternion).multiply(offsetQuat);
      } else {
        childNode.quaternion.copy(offsetQuat);
      }
      childNode.updateMatrixWorld(true);
      obj.x = round(childNode.position.x);
      obj.y = round(childNode.position.y);
      obj.z = round(childNode.position.z);
      const e = new THREE.Euler().setFromQuaternion(childNode.quaternion, 'ZXY');
      obj.rx = normDeg(e.x * R2D); obj.ry = normDeg(e.y * R2D); obj.rz = normDeg(e.z * R2D);
    }
  }

  calculateRelativeAttachOffset(childUid, parentUid) {
    const parentNode = this.nodes.get(parentUid);
    const childNode = this.nodes.get(childUid);
    if (!parentNode || !childNode) return null;
    const invParentQuat = parentNode.quaternion.clone().invert();
    const relPos = childNode.position.clone().sub(parentNode.position).applyQuaternion(invParentQuat);
    const relQuat = invParentQuat.clone().multiply(childNode.quaternion);
    const relEuler = new THREE.Euler().setFromQuaternion(relQuat, 'ZXY');
    return {
      ox: round(relPos.x),
      oy: round(relPos.y),
      oz: round(relPos.z),
      rx: normDeg(relEuler.x * R2D),
      ry: normDeg(relEuler.y * R2D),
      rz: normDeg(relEuler.z * R2D),
    };
  }

  // Teste em tempo real de MoveObject / MoveDynamicObject (executa exatamente 1 vez)
  testMoveObject(uid) {
    this.stopMoveObject(uid);
    const obj = this.project.find(uid);
    const node = this.nodes.get(uid);
    if (!obj || !obj.move || !node) return;

    // Reseta para o ponto de partida do objeto
    node.position.set(obj.x, obj.y, obj.z);
    const startRot = new THREE.Euler((obj.rx || 0) * D2R, (obj.ry || 0) * D2R, (obj.rz || 0) * D2R, 'ZXY');
    node.quaternion.setFromEuler(startRot);
    node.updateMatrixWorld(true);

    const startPos = new THREE.Vector3(obj.x, obj.y, obj.z);
    const targetPos = new THREE.Vector3(obj.move.targetX, obj.move.targetY, obj.move.targetZ);
    const dist = startPos.distanceTo(targetPos);
    const speed = Math.max(0.1, obj.move.speed || 3.0);
    const duration = Math.max(50, (dist / speed) * 1000);

    const startQuat = new THREE.Quaternion().setFromEuler(startRot);
    const hasRot = (obj.move.targetRx !== -1000 || obj.move.targetRy !== -1000 || obj.move.targetRz !== -1000);
    const targetRot = new THREE.Euler(
      (obj.move.targetRx !== -1000 ? obj.move.targetRx : obj.rx) * D2R,
      (obj.move.targetRy !== -1000 ? obj.move.targetRy : obj.ry) * D2R,
      (obj.move.targetRz !== -1000 ? obj.move.targetRz : obj.rz) * D2R,
      'ZXY'
    );
    const targetQuat = new THREE.Quaternion().setFromEuler(targetRot);

    let startTime = performance.now();
    if (!this.activeMoveAnims) this.activeMoveAnims = new Map();

    const loop = (now) => {
      let elapsed = now - startTime;
      let t = Math.min(1, elapsed / duration);

      node.position.lerpVectors(startPos, targetPos, t);
      if (hasRot) node.quaternion.slerpQuaternions(startQuat, targetQuat, t);
      node.updateMatrixWorld(true);
      this.refreshSelectionBoxes();
      this.updateAttachedChildren();

      if (t >= 1) {
        this.activeMoveAnims.delete(uid);
        this.emit('move-ended', { uid });
      } else {
        this.activeMoveAnims.set(uid, requestAnimationFrame(loop));
      }
    };

    this.activeMoveAnims.set(uid, requestAnimationFrame(loop));
    this.emit('move-started', { uid });
  }

  stopMoveObject(uid) {
    if (this.activeMoveAnims && this.activeMoveAnims.has(uid)) {
      cancelAnimationFrame(this.activeMoveAnims.get(uid));
      this.activeMoveAnims.delete(uid);
    }
  }

  resetMoveObject(uid) {
    this.stopMoveObject(uid);
    const obj = this.project.find(uid);
    const node = this.nodes.get(uid);
    if (!obj || !node) return;
    node.position.set(obj.x, obj.y, obj.z);
    node.rotation.copy(eulerFromItem(obj, this.project.kindOf(uid)));
    node.updateMatrixWorld(true);
    this.refreshSelectionBoxes();
    this.updateAttachedChildren();
    this.emit('move-ended', { uid });
  }

  refreshSelectionBoxes() {
    this.selBoxes.clear();
    const add = (obj, color) => {
      const box = new THREE.Box3().setFromObject(obj);
      if (box.isEmpty()) return;
      const h = new THREE.Box3Helper(box, color);
      h.userData.noPick = true;
      this.selBoxes.add(h);
    };
    for (const u of this.selection) { const n = this.nodes.get(u); if (n) add(n, 0xf0a630); }
    for (const inst of this.worldSelection) {
      const obj = this.streamer.shown.get(inst.index);
      if (obj) add(obj, 0xff3b30);
    }
  }

  // ------------------------------------------------------------------ mouse
  bindPointer() {
    const dom = this.vp.renderer.domElement;
    let down = null;
    dom.addEventListener('pointerdown', (e) => {
      if (e.button === 2 && this.placing) {
        e.preventDefault();
        e.stopPropagation();
        this.cancelPlacing();
        down = null;
        return;
      }
      if (e.button === 0) down = { x: e.clientX, y: e.clientY, t: performance.now() };
    }, true);
    dom.addEventListener('contextmenu', (e) => {
      if (this.placing) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
    dom.addEventListener('pointermove', (e) => {
      this.lastPointer = e;
      if (this.placing) this.updateGhost(e);
    });
    dom.addEventListener('pointerup', (e) => {
      if (e.button !== 0 || !down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y) > 4;
      down = null;
      if (moved || this.tc.dragging || this.tc.axis) return;
      const clickPt = this.surfacePoint(e);
      if (clickPt && clickPt.point) {
        this.emit('map-click-coords', clickPt.point);
      }
      if (this.placing) { this.confirmPlace(e.shiftKey); return; }
      this.pick(e);
    });
    dom.addEventListener('dblclick', (e) => {
      if (this.placing) return;
      if (this.selection.length) this.focusSelection();
    });
  }

  pickTargets() { return [this.root, ...this.streamer.pickables()]; }

  pick(e) {
    const hit = this.vp.raycast(this.vp.ndc(e), this.pickTargets());
    if (this.mode === 'texture') { this.pickSlot(hit, e); return; }
    if (!hit) { if (!e.shiftKey && !e.ctrlKey) this.clearSelection(); return; }
    const uid = hit.object.userData.uid;
    if (uid) {
      const p = this.findProjectOf(uid);
      if (this.isProjectReadonly(p)) {
        this.emit('notice', { text: `Projeto "${p.name}" está em modo Não editável (somente leitura).` });
        return;
      }
      this.select([uid], e.shiftKey || e.ctrlKey);
      return;
    }
    const inst = hit.object.userData.instance;
    if (inst) this.selectWorld([inst], e.shiftKey || e.ctrlKey);
  }

  // Ponto do mundo sob o mouse (para posicionar objetos)
  surfacePoint(e, exclude) {
    const rc = new THREE.Raycaster();
    rc.setFromCamera(this.vp.ndc(e), this.vp.camera);
    rc.far = Math.max(3500, this.vp.camera.far);
    const hits = rc.intersectObjects(this.pickTargets(), true)
      .filter(h => !h.object.userData.noPick && (!exclude || !isDescendant(h.object, exclude)));
    if (hits.length) return { point: hits[0].point, normal: hits[0].face?.normal, object: hits[0].object };
    // Sem superfície: plano horizontal na altura da câmera - 10, ou 30 m à frente
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -Math.max(0, this.vp.camera.position.z - 20));
    const p = new THREE.Vector3();
    if (rc.ray.intersectPlane(plane, p) && p.distanceTo(this.vp.camera.position) < Math.max(1200, this.vp.camera.far * 0.5)) return { point: p };
    return { point: rc.ray.at(30, new THREE.Vector3()) };
  }

  // ------------------------------------------------------------------ posicionar
  startPlacing(model) {
    this.cancelPlacing();
    const def = this.gd.models.get(model);
    if (!def) return;
    const ghost = new THREE.Group();
    ghost.rotation.order = 'ZXY';
    ghost.userData.noPick = true;
    this.vp.scene.add(ghost);
    this.placing = { model, ghost, rz: 0, ready: false, offsetZ: 0 };
    this.tc.detach();
    this.models.getModel(model).then(() => {
      if (!this.placing || this.placing.ghost !== ghost) return;
      const m = this.models.instantiate(model);
      if (m) {
        ghost.add(m);
        const box = m.userData.box || this.models.ready.get(model)?.userData.box;
        if (def?.type === 'peds') {
          this.placing.offsetZ = (box && box.min.z < -0.3) ? -box.min.z : 0.98;
        } else {
          this.placing.offsetZ = box ? -box.min.z : 0;
        }
      }
      ghost.traverse(o => { o.userData.noPick = true; });
      this.placing.ready = true;
      if (this.lastPointer) this.updateGhost(this.lastPointer);
    });
    this.vp.renderer.domElement.style.cursor = 'copy';
    this.emit('placing');
  }

  updateGhost(e) {
    const pl = this.placing;
    if (!pl) return;
    const { point, object } = this.surfacePoint(e, pl.ghost);
    // Herda o interior da superfície (prédio do jogo ou objeto do projeto)
    const inst = object?.userData.instance;
    const under = object?.userData.uid ? this.project.find(object.userData.uid) : null;
    pl.interior = inst ? (inst.interior > 0 && inst.interior !== 13 ? inst.interior : -1) : (under?.interior ?? pl.interior ?? -1);
    let p = point.clone();
    if (this.snap.enabled) { p.x = Math.round(p.x / this.snap.move) * this.snap.move; p.y = Math.round(p.y / this.snap.move) * this.snap.move; }
    p.z += pl.offsetZ;
    pl.ghost.position.copy(p);
    pl.ghost.rotation.set(0, 0, pl.rz * D2R, 'ZXY');
    pl.ghost.updateMatrixWorld(true);

    if (this.snap.magnetic) {
      const candidates = [...this.nodes.values()];
      const snapDelta = findMagneticSnap(pl.ghost, candidates, this.snap.magDist || 0.8);
      if (snapDelta) {
        pl.ghost.position.add(snapDelta);
        pl.ghost.updateMatrixWorld(true);
      }
    }
  }

  rotateGhost(step) { if (this.placing) { this.placing.rz = normDeg(this.placing.rz + step); if (this.lastPointer) this.updateGhost(this.lastPointer); } }

  confirmPlace(keep) {
    const pl = this.placing;
    if (!pl || !pl.ready) return;
    const p = pl.ghost.position;
    const def = this.gd.models.get(pl.model);
    const kind = def?.type === 'peds' ? 'actors' : (def?.type === 'cars' ? 'vehicles' : 'objects');
    const data = {
      kind,
      model: pl.model,
      skin: pl.model,
      x: round(p.x), y: round(p.y), z: round(p.z),
      rx: 0, ry: 0, rz: pl.rz,
      interior: pl.interior ?? -1,
    };
    const label = kind === 'actors' ? 'Adicionar actor' : (kind === 'vehicles' ? 'Adicionar veículo' : 'Adicionar objeto');
    const uids = this.project.addItems(label, [data]);
    this.emit('placed', { model: pl.model });
    if (!keep) { this.cancelPlacing(); this.select(uids); }
  }

  cancelPlacing() {
    if (!this.placing) return;
    this.vp.scene.remove(this.placing.ghost);
    this.placing = null;
    this.vp.renderer.domElement.style.cursor = '';
    this.attachGizmo();
    this.emit('placing');
  }

  // ------------------------------------------------------------------ ações
  duplicateSelection() {
    const items = this.selectedItems();
    if (!items.length) return;
    const byProject = new Map();
    for (const s of items) {
      const p = this.findProjectOf(s.uid);
      if (!byProject.has(p)) byProject.set(p, []);
      byProject.get(p).push(s);
    }
    const createdUids = [];
    for (const [p, pItems] of byProject.entries()) {
      const data = pItems.map(s => ({ ...JSON.parse(JSON.stringify(s.item)), uid: undefined, kind: s.kind }));
      const uids = p.addItems(pItems.length > 1 ? `Duplicar ${pItems.length} itens` : 'Duplicar', data);
      createdUids.push(...uids);
    }
    this.cancelPlacing();
    this.mode = 'translate';
    this.select(createdUids);
    this.emit('mode');
    this.emit('notice', { text: createdUids.length > 1 ? `${createdUids.length} cópias criadas no mesmo lugar. Arraste as setas para mover.` : 'Cópia criada no mesmo lugar. Arraste as setas para mover.' });
    return createdUids;
  }

  // Cópia de prédios do mapa no mesmo lugar (os originais continuam lá)
  copyWorldSelection() {
    const list = this.worldSelection;
    if (!list.length) return;
    const items = list.map(inst => {
      const q = new THREE.Quaternion(-inst.qx, -inst.qy, -inst.qz, inst.qw);
      const e = new THREE.Euler().setFromQuaternion(q, 'ZXY');
      return {
        kind: 'objects', model: inst.id, x: round(inst.x), y: round(inst.y), z: round(inst.z),
        rx: normDeg(e.x * R2D), ry: normDeg(e.y * R2D), rz: normDeg(e.z * R2D),
        interior: inst.interior > 0 && inst.interior !== 13 ? inst.interior : -1
      };
    });
    const label = items.length > 1 ? `Posicionar ${items.length} objetos iguais` : 'Posicionar outro igual';
    const uids = this.project.addItems(label, items);
    this.mode = 'translate';
    this.select(uids);
    this.emit('mode');
    this.emit('notice', { text: items.length > 1 ? `${items.length} cópias criadas em cima dos originais. Arraste as setas para mover.` : 'Cópia criada em cima do original. Arraste as setas para mover.' });
    return uids;
  }

  deleteSelection() {
    if (this.worldSelection.length) {
      this.removeWorldSelection();
      return;
    }
    if (!this.selection.length) return;
    const byProject = new Map();
    for (const u of this.selection) {
      const p = this.findProjectOf(u);
      if (!byProject.has(p)) byProject.set(p, []);
      byProject.get(p).push(u);
    }
    for (const [p, uids] of byProject.entries()) {
      p.deleteItems(uids.length > 1 ? `Apagar ${uids.length} itens` : 'Apagar', uids);
    }
    this.clearSelection();
  }

  nudge(dx, dy, dz) {
    if (!this.selection.length) return;
    const byProject = new Map();
    for (const u of this.selection) {
      const p = this.findProjectOf(u);
      if (!byProject.has(p)) byProject.set(p, []);
      byProject.get(p).push(u);
    }
    for (const [p, uids] of byProject.entries()) {
      p.updateItems('Mover', uids, (o) => { o.x = round(o.x + dx); o.y = round(o.y + dy); o.z = round(o.z + dz); });
    }
  }

  rotateSelection(axis, deg) {
    const items = this.selectedItems();
    if (!items.length) return;
    const byProject = new Map();
    for (const s of items) {
      const p = this.findProjectOf(s.uid);
      if (!byProject.has(p)) byProject.set(p, []);
      byProject.get(p).push(s);
    }
    for (const [p, pItems] of byProject.entries()) {
      p.updateItems('Girar', pItems.map(s => s.uid), (o) => {
        if ('rx' in o) o['r' + axis] = normDeg((o['r' + axis] || 0) + deg);
        else if (axis === 'z') o.rz = normDeg(o.rz + deg);
      });
    }
  }

  // Coloca o objeto em cima da superfície logo abaixo dele (terreno ou outro objeto)
  dropToGround() {
    const items = this.selectedItems();
    if (!items.length) return false;
    const selectedUids = new Set(this.selection);
    const updates = new Map();
    for (const s of items) {
      const node = this.nodes.get(s.uid);
      if (!node) continue;
      const box = new THREE.Box3().setFromObject(node);
      const bottomOffset = s.item.z - box.min.z;
      const finalOffset = s.kind === 'actors' ? (bottomOffset > 0.3 ? bottomOffset : 0.98) : bottomOffset;
      const origin = new THREE.Vector3(s.item.x, s.item.y, box.max.z + 0.1);
      const rc = new THREE.Raycaster(origin, new THREE.Vector3(0, 0, -1), 0, 1000);
      const hits = rc.intersectObjects(this.pickTargets(), true).filter(h => {
        if (h.object.userData.noPick) return false;
        if (isDescendant(h.object, node)) return false;
        const hitUid = h.object.userData.uid;
        if (hitUid && selectedUids.has(hitUid)) return false;
        return true;
      });
      if (hits.length) updates.set(s.uid, round(hits[0].point.z + finalOffset));
    }
    if (!updates.size) return false;
    const byProject = new Map();
    for (const [uid, newZ] of updates.entries()) {
      const p = this.findProjectOf(uid);
      if (!byProject.has(p)) byProject.set(p, []);
      byProject.get(p).push(uid);
    }
    for (const [p, uids] of byProject.entries()) {
      p.updateItems('Colocar na superfície', uids, (o) => { o.z = updates.get(o.uid); });
    }
    this.attachGizmo();
    this.refreshSelectionBoxes();
    return true;
  }

  focusSelection() {
    let box = new THREE.Box3();
    if (this.selection.length) for (const u of this.selection) box.expandByObject(this.nodes.get(u));
    else if (this.worldSelection.length) {
      for (const inst of this.worldSelection) {
        const o = this.streamer.shown.get(inst.index);
        if (o) box.expandByObject(o);
        else box.expandByPoint(new THREE.Vector3(inst.x, inst.y, inst.z));
      }
    }
    if (box.isEmpty()) return;
    this.focusBox(box);
  }

  focusBox(box) {
    const center = box.getCenter(new THREE.Vector3());
    const size = Math.max(4, box.getSize(new THREE.Vector3()).length());
    const dir = this.vp.fly.direction();
    const pos = center.clone().addScaledVector(dir, -size * 1.4);
    pos.z = Math.max(pos.z, center.z + size * 0.25);
    this.vp.camera.position.copy(pos);
    this.vp.fly.lookAt(center);
    this.streamer.invalidate();
  }

  goTo(x, y, z, yaw) {
    this.vp.fly.setPose(new THREE.Vector3(x, y, z), yaw ?? this.vp.fly.yaw, -0.25);
    this.streamer.invalidate();
  }

  // Remove os prédios do mapa selecionados (e opcionalmente o LOD deles)
  removeWorldSelection() {
    const list = this.worldSelection;
    if (!list.length) return;
    const items = [];
    const isNearby = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) < 0.3;
    for (const inst of list) {
      items.push({ kind: 'removed', model: inst.id, x: inst.x, y: inst.y, z: inst.z, radius: 0.25, name: inst.def.model });
      if (this.removeLodToo && inst.lodRef) {
        const l = inst.lodRef;
        const inProj = this.project.removed.some(r => r.model === l.id && isNearby(r, l));
        const inBatch = items.some(r => r.model === l.id && isNearby(r, l));
        if (!inProj && !inBatch) items.push({ kind: 'removed', model: l.id, x: l.x, y: l.y, z: l.z, radius: 0.25, name: l.def.model });
      }
    }
    const label = items.length > 1 ? `Remover ${items.length} prédios` : 'Remover prédio';
    this.project.addItems(label, items);
    this.worldSelection = [];
    this.refreshSelectionBoxes();
    this.emit('selection');
  }

  // Transforma os prédios do mapa em objetos editáveis (remove os originais e cria cópias)
  convertWorldSelection() {
    const list = this.worldSelection;
    if (!list.length) return;
    const items = [];
    const isNearby = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) < 0.3;
    for (const inst of list) {
      const q = new THREE.Quaternion(-inst.qx, -inst.qy, -inst.qz, inst.qw);
      const e = new THREE.Euler().setFromQuaternion(q, 'ZXY');
      items.push({ kind: 'removed', model: inst.id, x: inst.x, y: inst.y, z: inst.z, radius: 0.25, name: inst.def.model });
      items.push({
        kind: 'objects', model: inst.id, x: round(inst.x), y: round(inst.y), z: round(inst.z),
        rx: normDeg(e.x * R2D), ry: normDeg(e.y * R2D), rz: normDeg(e.z * R2D),
        interior: inst.interior > 0 ? inst.interior : -1
      });
      if (this.removeLodToo && inst.lodRef) {
        const l = inst.lodRef;
        const inProj = this.project.removed.some(r => r.model === l.id && isNearby(r, l));
        const inBatch = items.some(r => r.model === l.id && isNearby(r, l));
        if (!inProj && !inBatch) items.push({ kind: 'removed', model: l.id, x: l.x, y: l.y, z: l.z, radius: 0.25, name: l.def.model });
      }
    }
    const label = list.length > 1 ? `Tornar ${list.length} prédios editáveis` : 'Tornar editável';
    const uids = this.project.addItems(label, items);
    this.worldSelection = [];
    const created = uids.filter(u => this.project.kindOf(u) === 'objects');
    if (created.length) this.select(created);
  }

  restoreRemoved(uids) { this.project.deleteItems('Restaurar prédio', uids); }

  // ------------------------------------------------------------------ materiais (SetObjectMaterial)
  // Índices de material do modelo e a textura original de cada um
  slotInfo(model) { return this.models.ready.get(model)?.userData.slotInfo || []; }

  selectedObjects() { return this.selectedItems().filter(s => s.kind === 'objects'); }

  // Os índices escolhidos só valem enquanto há objetos selecionados
  fixMatSel() {
    if (!this.selectedObjects().length) this.matSel = [];
    this.updateSlotHighlight();
  }

  setMatSel(indices) {
    this.matSel = [...new Set(indices.map(i => i | 0).filter(i => i >= 0 && i <= MAX_MATERIAL_INDEX))].sort((a, b) => a - b);
    this.updateSlotHighlight();
    this.emit('slot');
  }

  toggleMatIndex(i) {
    this.setMatSel(this.matSel.includes(i) ? this.matSel.filter(x => x !== i) : [...this.matSel, i]);
  }

  pickSlot(hit, e) {
    if (!hit) { if (!e.shiftKey && !e.ctrlKey) this.setMatSel([]); return; }
    const uid = hit.object.userData.uid;
    if (!uid || this.project.kindOf(uid) !== 'objects') {
      this.emit('notice', { text: 'A troca de textura vale para objetos do projeto. Para um prédio do jogo, use "Tornar editável" ou "Posicionar outro igual" antes.', kind: 'warn' });
      return;
    }
    const k = hit.face ? hit.face.materialIndex : 0;
    const slots = hit.object.userData.slots || [0];
    const index = slots[k] ?? slots[0] ?? 0;
    this.worldSel = null;
    if (e.ctrlKey || e.metaKey) {
      // Ctrl + clique: soma ou tira o índice (no mesmo objeto)
      if (!this.selection.includes(uid)) this.selection = [uid];
      this.matSel = this.matSel.includes(index) ? this.matSel.filter(x => x !== index) : [...this.matSel, index].sort((a, b) => a - b);
    } else if (e.shiftKey) {
      // Shift + clique: soma o objeto à seleção, mantendo os índices
      if (!this.selection.includes(uid)) this.selection = [...this.selection, uid];
      if (!this.matSel.includes(index)) this.matSel = [...this.matSel, index].sort((a, b) => a - b);
    } else {
      this.selection = [uid];
      this.matSel = [index];
    }
    this.refreshSelectionBoxes();
    this.updateSlotHighlight();
    this.emit('selection');
    this.emit('slot');
  }

  // Destaca em âmbar os índices escolhidos, em todos os objetos selecionados
  updateSlotHighlight() {
    for (const o of this.slotOverlays || []) o.parent?.remove(o);
    this.slotOverlays = [];
    if (!this.matSel.length || this.highlightOff) return;
    const wanted = new Set(this.matSel);
    for (const uid of this.selection) {
      const node = this.nodes.get(uid);
      if (!node) continue;
      node.traverse(mesh => {
        if (!mesh.isMesh || !mesh.userData.slots || mesh.userData.slotOverlay) return;
        if (!mesh.userData.slots.some(s => wanted.has(s))) return;
        const count = Array.isArray(mesh.material) ? mesh.material.length : 1;
        const mats = Array.from({ length: count }, (_, i) => (wanted.has(mesh.userData.slots[i]) ? this.slotMat : this.slotHiddenMat));
        const ov = new THREE.Mesh(mesh.geometry, count === 1 ? mats[0] : mats);
        ov.userData.noPick = true; ov.userData.slotOverlay = true;
        ov.raycast = () => {};
        mesh.add(ov);
        this.slotOverlays.push(ov);
      });
    }
  }

  // Troca os materiais dos índices escolhidos em vários objetos de uma vez.
  // fn(materialAtual | undefined, índice) devolve o novo material, ou null para restaurar o original.
  updateMaterials(label, uids, indices, fn) {
    if (!uids.length || !indices.length) return 0;
    const byProject = new Map();
    for (const u of uids) {
      const p = this.findProjectOf(u);
      if (p && p.kindOf(u) === 'objects') {
        if (!byProject.has(p)) byProject.set(p, []);
        byProject.get(p).push(u);
      }
    }
    let count = 0;
    for (const [p, ids] of byProject.entries()) {
      p.updateItems(ids.length > 1 ? `${label} (${ids.length} objetos)` : label, ids, (o) => {
        const byIndex = new Map((o.materials || []).map(m => [m.index, m]));
        for (const i of indices) {
          const next = fn(byIndex.get(i), i);
          if (next) byIndex.set(i, normalizeMaterial({ ...next, index: i }));
          else byIndex.delete(i);
        }
        o.materials = [...byIndex.values()].sort((a, b) => a.index - b.index);
      });
      count += ids.length;
    }
    return count;
  }

  // SetObjectMaterial: troca a textura e mantém a cor que o índice já tinha
  applyTexture(uids, indices, tex) {
    return this.updateMaterials('Trocar textura', uids, indices, (prev) => ({
      model: tex.model, txd: tex.txd, texture: tex.texture,
      color: tex.color !== undefined ? tex.color : (prev && !isText(prev) ? prev.color : '0'),
    }));
  }

  // Muda só a cor (materialcolor); sem textura nova, usa modelid -1 / "none"
  applyColor(uids, indices, color) {
    return this.updateMaterials('Mudar cor', uids, indices, (prev) => {
      const base = prev && !isText(prev) ? prev : { model: -1, txd: 'none', texture: 'none' };
      const m = { ...base, color };
      return keepsTexture(m) && parseColor(color) === 0 ? null : m;
    });
  }

  // SetObjectMaterialText
  applyText(uids, indices, text) {
    return this.updateMaterials('Escrever texto', uids, indices, () => ({ ...text, kind: 'text' }));
  }

  clearMaterials(uids, indices) {
    if (indices === null) {
      const byProject = new Map();
      for (const u of uids) {
        const p = this.findProjectOf(u);
        if (p && p.kindOf(u) === 'objects') {
          if (!byProject.has(p)) byProject.set(p, []);
          byProject.get(p).push(u);
        }
      }
      let count = 0;
      for (const [p, ids] of byProject.entries()) {
        p.updateItems('Restaurar texturas', ids, (o) => { o.materials = []; });
        count += ids.length;
      }
      return count;
    }
    return this.updateMaterials('Restaurar índice', uids, indices, () => null);
  }

  copyMaterials() {
    const u = this.selection[0];
    const p = this.findProjectOf(u);
    const o = p?.find(u);
    if (!o || !o.materials || !o.materials.length) return 0;
    this.materialClipboard = JSON.parse(JSON.stringify(o.materials));
    return this.materialClipboard.length;
  }

  pasteMaterials() {
    if (!this.materialClipboard) return 0;
    const byProject = new Map();
    for (const u of this.selection) {
      const p = this.findProjectOf(u);
      if (p && p.kindOf(u) === 'objects') {
        if (!byProject.has(p)) byProject.set(p, []);
        byProject.get(p).push(u);
      }
    }
    let count = 0;
    for (const [p, ids] of byProject.entries()) {
      p.updateItems('Colar texturas', ids, (o) => { o.materials = JSON.parse(JSON.stringify(this.materialClipboard)); });
      count += ids.length;
    }
    return count;
  }

  // ------------------------------------------------------------------ teclado e quadro
  handleKey(e) {
    if (isTyping(e)) return false;
    const k = e.key.toLowerCase();
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && k === 'a') { this.selectAll(); return true; }
    if (k === 'escape') { if (this.placing) this.cancelPlacing(); else this.clearSelection(); return true; }
    if (this.placing && (k === 'r' || k === 'x')) { this.rotateGhost(e.shiftKey ? -15 : (k === 'x' ? 90 : 15)); return true; }
    if (ctrl && k === 'd') { this.duplicateSelection(); return true; }
    if (k === 'delete' || (k === 'backspace' && !ctrl)) { this.deleteSelection(); return true; }
    if (!ctrl && (k === 'g' || k === '1')) { this.setMode('translate'); return true; }
    if (!ctrl && (k === 'r' || k === '2')) { this.setMode('rotate'); return true; }
    if (!ctrl && (k === 't' || k === '3')) { this.setMode('texture'); return true; }
    if (!ctrl && k === 'l') { this.setSpace(this.space === 'world' ? 'local' : 'world'); return true; }
    if (!ctrl && k === 'f') { this.focusSelection(); return true; }
    if (!ctrl && k === 'end') { this.dropToGround(); return true; }
    if (!ctrl && k === 'x' && this.selection.length) { this.rotateSelection('z', 90); return true; }
    if (this.selection.length && !this.vp.fly.looking && ['pageup', 'pagedown'].includes(k)) {
      const s = e.shiftKey ? 0.05 : (this.snap.enabled ? this.snap.move : 0.25);
      this.nudge(0, 0, k === 'pageup' ? s : -s); return true;
    }
    return false;
  }

  frame() {
    this.streamer.update(this.vp.camera);
    if (this.worldSelection.length && !this._lastWorldBoxOk) { this.refreshSelectionBoxes(); }
    this._lastWorldBoxOk = !this.worldSelection.length || this.worldSelection.every(w => this.streamer.shown.has(w.index));
  }
}

function isDescendant(obj, ancestor) {
  for (let o = obj; o; o = o.parent) if (o === ancestor) return true;
  return false;
}

function getLocalBox(obj) {
  let b = obj.userData?.box || obj.children?.[0]?.userData?.box;
  if (!b) {
    const box = new THREE.Box3();
    obj.traverse(c => {
      if (c.isMesh && c.geometry) {
        if (!c.geometry.boundingBox) c.geometry.computeBoundingBox();
        box.union(c.geometry.boundingBox);
      }
    });
    b = box.isEmpty() ? new THREE.Box3(new THREE.Vector3(-0.5, -0.5, -0.5), new THREE.Vector3(0.5, 0.5, 0.5)) : box;
    obj.userData.box = b;
  }
  return b;
}

function getAlignmentPoints(obj) {
  const b = getLocalBox(obj);
  const min = b.min, max = b.max;
  const midX = (min.x + max.x) * 0.5, midY = (min.y + max.y) * 0.5, midZ = (min.z + max.z) * 0.5;
  const pts = [
    // 8 vértices / cantos do modelo
    new THREE.Vector3(min.x, min.y, min.z),
    new THREE.Vector3(max.x, min.y, min.z),
    new THREE.Vector3(min.x, max.y, min.z),
    new THREE.Vector3(max.x, max.y, min.z),
    new THREE.Vector3(min.x, min.y, max.z),
    new THREE.Vector3(max.x, min.y, max.z),
    new THREE.Vector3(min.x, max.y, max.z),
    new THREE.Vector3(max.x, max.y, max.z),
    // 6 centros de faces para encaixe nivelado
    new THREE.Vector3(min.x, midY, midZ),
    new THREE.Vector3(max.x, midY, midZ),
    new THREE.Vector3(midX, min.y, midZ),
    new THREE.Vector3(midX, max.y, midZ),
    new THREE.Vector3(midX, midY, min.z),
    new THREE.Vector3(midX, midY, max.z),
    // Centro do objeto
    new THREE.Vector3(midX, midY, midZ),
  ];
  obj.updateMatrixWorld(true);
  const mw = obj.matrixWorld;
  return pts.map(p => p.applyMatrix4(mw));
}

function findMagneticSnap(sourceObj, candidateNodes, maxDist = 0.8) {
  if (!candidateNodes || !candidateNodes.length) return null;
  const srcPts = getAlignmentPoints(sourceObj);
  let bestDelta = null;
  let minDistSq = maxDist * maxDist;
  const srcPos = new THREE.Vector3();
  sourceObj.getWorldPosition(srcPos);

  for (const target of candidateNodes) {
    if (!target || target === sourceObj) continue;
    const tgtPos = new THREE.Vector3();
    target.getWorldPosition(tgtPos);
    if (srcPos.distanceTo(tgtPos) > 40) continue;

    const tgtPts = getAlignmentPoints(target);
    for (const sp of srcPts) {
      for (const tp of tgtPts) {
        const dSq = sp.distanceToSquared(tp);
        if (dSq < minDistSq) {
          minDistSq = dSq;
          bestDelta = tp.clone().sub(sp);
        }
      }
    }
  }
  return bestDelta;
}
