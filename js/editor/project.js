// Projeto: objetos criados, veículos e prédios removidos, com desfazer/refazer.
import { isVehicleModel } from './pwn.js';
import { normalizeMaterial } from './materials.js';

let uidCounter = 1;
let _globalOpSeq = 0;
const newUid = () => 'o' + (Date.now().toString(36)) + (uidCounter++).toString(36);

export function makeObject(data) {
  return {
    uid: data.uid || newUid(),
    model: data.model | 0,
    x: +data.x || 0, y: +data.y || 0, z: +data.z || 0,
    rx: +data.rx || 0, ry: +data.ry || 0, rz: +data.rz || 0,
    world: data.world ?? -1, interior: data.interior ?? -1,
    streamDist: +data.streamDist || 0, drawDist: +data.drawDist || 0,
    comment: data.comment ? String(data.comment) : '',
    preComment: data.preComment ? String(data.preComment) : '',
    blankLinesBefore: +data.blankLinesBefore || 0,
    projectId: data.projectId || '',
    materials: (data.materials || []).map(normalizeMaterial).filter(Boolean)
      .filter((m, i, all) => all.findLastIndex(x => x.index === m.index) === i) // um por índice (o último vale)
      .sort((a, b) => a.index - b.index),
    move: data.move ? {
      targetX: +data.move.targetX || 0,
      targetY: +data.move.targetY || 0,
      targetZ: +data.move.targetZ || 0,
      speed: Math.max(0.01, +data.move.speed || 3.0),
      targetRx: data.move.targetRx !== undefined ? +data.move.targetRx : -1000,
      targetRy: data.move.targetRy !== undefined ? +data.move.targetRy : -1000,
      targetRz: data.move.targetRz !== undefined ? +data.move.targetRz : -1000,
    } : null,
    attach: data.attach ? {
      to: data.attach.to || '',
      ox: +data.attach.ox || 0, oy: +data.attach.oy || 0, oz: +data.attach.oz || 0,
      rx: +data.attach.rx || 0, ry: +data.attach.ry || 0, rz: +data.attach.rz || 0,
      syncRot: data.attach.syncRot ?? 1,
    } : null,
  };
}

export function makeVehicle(data) {
  return {
    uid: data.uid || newUid(),
    model: data.model | 0,
    x: +data.x || 0, y: +data.y || 0, z: +data.z || 0, rz: +data.rz || 0,
    color1: data.color1 ?? -1, color2: data.color2 ?? -1, respawn: data.respawn ?? -1,
    paintjob: data.paintjob ?? -1,
    comment: data.comment ? String(data.comment) : '',
    preComment: data.preComment ? String(data.preComment) : '',
    blankLinesBefore: +data.blankLinesBefore || 0,
    projectId: data.projectId || '',
    components: Array.isArray(data.components) ? [...data.components] : [],
  };
}

export function makeActor(data) {
  return {
    uid: data.uid || newUid(),
    skin: data.skin !== undefined ? (data.skin | 0) : (data.model | 0 || 0),
    x: +data.x || 0, y: +data.y || 0, z: +data.z || 0, rz: +data.rz || 0,
    world: data.world ?? -1,
    invulnerable: data.invulnerable ?? true,
    health: data.health !== undefined ? +data.health : 100,
    comment: data.comment ? String(data.comment) : '',
    preComment: data.preComment ? String(data.preComment) : '',
    blankLinesBefore: +data.blankLinesBefore || 0,
    projectId: data.projectId || '',
    anim: data.anim ? {
      lib: String(data.anim.lib || 'PED'),
      name: String(data.anim.name || 'IDLE_chat'),
      delta: +data.anim.delta || 4.1,
      loop: data.anim.loop ?? 1,
      lockx: data.anim.lockx ?? 0,
      locky: data.anim.locky ?? 0,
      freeze: data.anim.freeze ?? 0,
      time: +data.anim.time || 0,
    } : null,
  };
}

export function makeRemoved(data) {
  return {
    uid: data.uid || newUid(),
    model: data.model | 0, x: +data.x || 0, y: +data.y || 0, z: +data.z || 0,
    radius: data.radius ?? 0.25, name: data.name || '',
    comment: data.comment ? String(data.comment) : '',
    preComment: data.preComment ? String(data.preComment) : '',
    blankLinesBefore: +data.blankLinesBefore || 0,
    projectId: data.projectId || '',
  };
}

const KINDS = ['objects', 'vehicles', 'actors', 'removed'];
const MAKERS = { objects: makeObject, vehicles: makeVehicle, actors: makeActor, removed: makeRemoved };

export class Project {
  constructor(name = 'Meu mapa') {
    this.name = name;
    this.objects = [];
    this.vehicles = [];
    this.actors = [];
    this.removed = [];
    this.pwnHeader = '';
    this.rawPawn = '';
    this.camera = null;
    this.cameras = emptyCameras();
    this.undoStack = [];
    this.redoStack = [];
    this.listeners = new Set();
    this.version = 0;
  }

  static fromJSON(data) {
    const p = new Project(data.name || 'Meu mapa');
    for (const k of KINDS) p[k] = (data[k] || []).map(MAKERS[k]);
    p.camera = data.camera || null;
    p.cameras = normalizeCameras(data.cameras);
    p.pwnHeader = data.pwnHeader || '';
    p.rawPawn = data.rawPawn || '';
    return p;
  }

  toJSON() {
    return { app: 'SA Map Studio', format: 1, name: this.name, savedAt: new Date().toISOString(),
      pwnHeader: this.pwnHeader || '', rawPawn: this.rawPawn || '',
      camera: this.camera, cameras: this.cameras, objects: this.objects, vehicles: this.vehicles, actors: this.actors, removed: this.removed };
  }

  // Mudanças fora do histórico (câmeras): só avisa para salvar
  touch(what = 'cameras') { this.emit({ type: what, uids: [] }); }

  on(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  emit(change) { this.version++; for (const fn of this.listeners) fn(change); }

  kindOf(uid) {
    for (const k of KINDS) if (this[k].some(o => o.uid === uid)) return k;
    return null;
  }
  find(uid) {
    for (const k of KINDS) { const o = this[k].find(x => x.uid === uid); if (o) return o; }
    return null;
  }
  snapshot(uid) {
    const k = this.kindOf(uid);
    return k ? { uid, kind: k, data: JSON.parse(JSON.stringify(this.find(uid))) } : { uid, kind: null, data: null };
  }

  // Aplica estados (cria, atualiza ou apaga) sem mexer no histórico
  applyStates(states) {
    const changed = [];
    for (const s of states) {
      for (const k of KINDS) {
        const i = this[k].findIndex(o => o.uid === s.uid);
        if (i >= 0 && (!s.data || s.kind !== k)) { this[k].splice(i, 1); changed.push({ type: 'remove', uid: s.uid, kind: k }); }
      }
      if (s.data) {
        const list = this[s.kind];
        const i = list.findIndex(o => o.uid === s.uid);
        const obj = MAKERS[s.kind]({ ...s.data, uid: s.uid });
        if (i >= 0) { list[i] = obj; changed.push({ type: 'update', uid: s.uid, kind: s.kind }); }
        else { list.push(obj); changed.push({ type: 'add', uid: s.uid, kind: s.kind }); }
      }
    }
    return changed;
  }

  // Executa uma mudança registrando desfazer/refazer.
  // fn() faz as alterações diretamente; uids indica quem pode mudar.
  transact(label, uids, fn) {
    const before = uids.map(u => this.snapshot(u));
    const createdUids = fn() || [];
    const all = [...new Set([...uids, ...createdUids])];
    const beforeAll = [...before, ...createdUids.filter(u => !uids.includes(u)).map(u => ({ uid: u, kind: null, data: null }))];
    const after = all.map(u => this.snapshot(u));
    if (JSON.stringify(beforeAll) === JSON.stringify(after)) return;
    this.undoStack.push({ label, before: beforeAll, after, _seq: ++_globalOpSeq });
    if (this.undoStack.length > 200) this.undoStack.shift();
    this.redoStack.length = 0;
    this.emit({ type: 'transact', label, uids: all });
  }

  // Registra uma mudança já feita (ex.: arrastar com o gizmo)
  record(label, before, after) {
    if (JSON.stringify(before) === JSON.stringify(after)) return;
    this.undoStack.push({ label, before, after, _seq: ++_globalOpSeq });
    this.redoStack.length = 0;
    this.emit({ type: 'transact', label, uids: after.map(s => s.uid) });
  }

  undo() {
    const op = this.undoStack.pop();
    if (!op) return null;
    this.applyStates(op.before);
    op._redoSeq = ++_globalOpSeq;
    this.redoStack.push(op);
    this.emit({ type: 'undo', label: op.label, uids: op.before.map(s => s.uid) });
    return op.label;
  }

  redo() {
    const op = this.redoStack.pop();
    if (!op) return null;
    this.applyStates(op.after);
    op._seq = ++_globalOpSeq;
    this.undoStack.push(op);
    this.emit({ type: 'redo', label: op.label, uids: op.after.map(s => s.uid) });
    return op.label;
  }

  // ---- operações de alto nível ----
  addItems(label, items) {
    const uids = [];
    this.transact(label, [], () => {
      for (const it of items) {
        if (it.kind === 'removed') { const r = makeRemoved(it); this.removed.push(r); uids.push(r.uid); }
        else if (it.kind === 'actors') { const a = makeActor(it); this.actors.push(a); uids.push(a.uid); }
        else if (it.kind === 'vehicles' || (it.kind !== 'objects' && isVehicleModel(it.model))) { const v = makeVehicle(it); this.vehicles.push(v); uids.push(v.uid); }
        else { const o = makeObject(it); this.objects.push(o); uids.push(o.uid); }
      }
      return uids;
    });
    return uids;
  }

  deleteItems(label, uids) {
    this.transact(label, uids, () => {
      for (const k of KINDS) this[k] = this[k].filter(o => !uids.includes(o.uid));
    });
  }

  updateItems(label, uids, mutate) {
    this.transact(label, uids, () => {
      for (const u of uids) { const o = this.find(u); if (o) mutate(o); }
    });
  }

  snapshotAll() {
    const list = [];
    for (const k of KINDS) {
      for (const item of this[k]) {
        list.push({ uid: item.uid, kind: k, data: JSON.parse(JSON.stringify(item)) });
      }
    }
    return list;
  }

  clearAll() {
    for (const k of KINDS) {
      this[k].length = 0;
    }
    this.emit({ type: 'clear', uids: [] });
  }

  mergeProject(otherProject) {
    const itemsToAdd = [];
    for (const k of KINDS) {
      for (const it of (otherProject[k] || [])) {
        const copy = JSON.parse(JSON.stringify(it));
        copy.uid = newUid();
        copy.kind = k;
        copy.projectId = this.name;
        itemsToAdd.push(copy);
      }
    }
    return this.addItems(`Mesclar projeto "${otherProject.name}"`, itemsToAdd);
  }
}

// ---------------------------------------------------------------- câmeras
// shots: pontos fixos (SetPlayerCameraPos + SetPlayerCameraLookAt)
// paths: sequências de InterpolateCameraPos/LookAt. Cada passo vai do ponto anterior até este.
export function emptyCameras() { return { shots: [], paths: [] }; }

const vec = (v) => ({ x: +v?.x || 0, y: +v?.y || 0, z: +v?.z || 0 });

export function normalizeCameras(c) {
  const out = emptyCameras();
  if (!c) return out;
  out.shots = (c.shots || []).map((s, i) => ({ id: s.id || 'c' + Date.now().toString(36) + i, name: String(s.name || 'Câmera ' + (i + 1)), pos: vec(s.pos), look: vec(s.look), cut: s.cut === 'move' ? 'move' : 'cut' }));
  out.paths = (c.paths || []).map((p, i) => ({
    id: p.id || 'p' + Date.now().toString(36) + i,
    name: String(p.name || 'Movimento ' + (i + 1)),
    end: ['behind', 'keep', 'loop'].includes(p.end) ? p.end : 'behind',
    keys: (p.keys || []).map(k => ({ pos: vec(k.pos), look: vec(k.look), time: Math.max(0, Math.round(+k.time || 0)), hold: Math.max(0, Math.round(+k.hold || 0)), cut: k.cut === 'cut' ? 'cut' : 'move' })),
  }));
  return out;
}
