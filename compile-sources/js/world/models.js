// Converte DFF + TXD em objetos Three.js, com cache de modelos, texturas e materiais.
// A leitura dos arquivos roda num grupo de workers (loader.worker.js); aqui ficam só
// a montagem das malhas e o envio das texturas para a placa de vídeo.
import * as THREE from 'three';
import { prepDff, prepTxd } from './prep.js';
import { normalizeMaterial, isText, keepsTexture, isNoneTexture, parseColor, argbParts, SIZE_PIXELS, colorSegments, cssColor } from '../editor/materials.js';

const FLAG_ALPHA1 = 4, FLAG_ALPHA2 = 8, FLAG_NO_ZWRITE = 64, FLAG_NO_CULL = 2097152;
const GENERIC_TXD = { img: 'models/generic/vehicle.txd', offset: 0, size: 0 };

// Cores especiais de pintura de veículos -> cores neutras de exibição
const PAINT_COLORS = {
  '60,255,0': [235, 235, 235], '255,0,175': [110, 110, 120], '0,255,255': [235, 235, 235],
  '255,0,255': [110, 110, 120], '255,175,0': [255, 140, 0], '0,255,200': [255, 140, 0],
  '185,255,0': [200, 0, 0], '255,60,0': [200, 0, 0],
};

// ---------------------------------------------------------------- grupo de workers
class LoaderPool {
  constructor(gd, s3tc) {
    this.gd = gd;
    this.s3tc = s3tc;
    this.jobs = new Map();
    this.nextId = 1;
    this.workers = [];
    if (typeof Worker === 'undefined' || typeof location === 'undefined') return;
    const n = Math.max(2, Math.min(4, (navigator.hardwareConcurrency || 4) - 1));
    for (let i = 0; i < n; i++) {
      try {
        const w = new Worker(new URL('./loader.worker.js', import.meta.url), { type: 'module' });
        w.busy = 0;
        w.onmessage = (ev) => {
          const job = this.jobs.get(ev.data.id);
          if (!job) return;
          this.jobs.delete(ev.data.id);
          w.busy--;
          ev.data.ok ? job.resolve(ev.data.data) : job.reject(new Error(ev.data.error));
        };
        w.postMessage({ type: 'config', base: location.origin + gd.fs.base, s3tc });
        this.workers.push(w);
      } catch { /* sem workers: tudo roda na thread principal */ }
    }
  }

  async run(type, entry, extra = {}) {
    if (!this.workers.length) {
      // Sem worker (testes no Node): mesmo trabalho, na thread principal
      const buf = await this.gd.fs.read(entry.img, entry.size ? entry.offset : undefined, entry.size || undefined);
      return type === 'dff' ? prepDff(buf, extra.ambient ?? 56).data : prepTxd(buf, this.s3tc).data;
    }
    let w = this.workers[0];
    for (const x of this.workers) if (x.busy < w.busy) w = x;
    w.busy++;
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.jobs.set(id, { resolve, reject });
      w.postMessage({ id, type, entry, ...extra });
    });
  }
}

export class ModelCache {
  constructor(gamedata, renderer) {
    this.gd = gamedata;
    this.renderer = renderer;
    this.s3tc = !!renderer?.extensions?.get('WEBGL_compressed_texture_s3tc');
    this.pool = new LoaderPool(gamedata, this.s3tc);
    this.txds = new Map();      // nome do txd -> Promise<Map(nomeTextura -> info)>
    this.models = new Map();    // id -> Promise<template|null>
    this.ready = new Map();     // id -> template (já carregado)
    this.materials = new Map();
    this.overrides = new Map();
    this.genericTxd = null;
    this.ambient = 56;
    this.uploads = [];          // texturas esperando envio para a placa de vídeo
    this.placeholderGeo = new THREE.BoxGeometry(1, 1, 1);
    this.missingEdges = new THREE.EdgesGeometry(this.placeholderGeo);
    this.missingMat = new THREE.LineDashedMaterial({ color: 0xd9534f, dashSize: 0.12, gapSize: 0.08 });
    this.anisotropy = Math.min(4, renderer?.capabilities?.getMaxAnisotropy?.() || 1);
  }

  // ---------- Texturas ----------
  makeTexture(t) {
    let tex;
    if (t.mips) {
      const fmt = t.compression === 'DXT1'
        ? (t.alpha ? THREE.RGBA_S3TC_DXT1_Format : THREE.RGB_S3TC_DXT1_Format)
        : t.compression === 'DXT3' ? THREE.RGBA_S3TC_DXT3_Format : THREE.RGBA_S3TC_DXT5_Format;
      tex = new THREE.CompressedTexture(t.mips, t.width, t.height, fmt);
      tex.minFilter = t.mips.length > 1 ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
      tex.generateMipmaps = false;
    } else {
      tex = new THREE.DataTexture(t.rgba, t.width, t.height, THREE.RGBAFormat);
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
    }
    tex.magFilter = THREE.LinearFilter;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = this.anisotropy;
    tex.flipY = false;
    tex.needsUpdate = true;
    this.uploads.push(tex);
    return { texture: tex, alpha: t.alpha };
  }

  loadTxdEntry(key, entry) {
    let p = this.txds.get(key);
    if (!p) {
      p = (entry ? this.pool.run('txd', entry) : Promise.resolve([])).then(list => {
        const map = new Map();
        for (const t of list) {
          try { const info = this.makeTexture(t); info.txd = key; info.name = t.name; map.set(t.name, info); } catch { /* ignora */ }
        }
        return map;
      }).catch(() => new Map());
      this.txds.set(key, p);
    }
    return p;
  }

  loadTxd(name) {
    name = (name || '').toLowerCase();
    if (!name) return Promise.resolve(new Map());
    return this.loadTxdEntry(name, this.gd.entry(name + '.txd'));
  }

  loadGenericTxd() { return this.loadTxdEntry('*vehicle', GENERIC_TXD); }

  chainNames(txd) {
    const out = [];
    let cur = (txd || '').toLowerCase();
    while (cur && !out.includes(cur) && out.length < 8) { out.push(cur); cur = this.gd.txdParents.get(cur); }
    return out;
  }

  // TXD do modelo, os pais dele (seção txdp do IDE) e, por último, o vehicle.txd genérico do jogo
  async txdChain(txd) {
    const names = this.chainNames(txd);
    const maps = await Promise.all([...names.map(n => this.loadTxd(n)), this.loadGenericTxd()]);
    return maps;
  }

  // Envia algumas texturas por quadro para a placa de vídeo (evita engasgos)
  pumpUploads(budgetMs = 4) {
    if (!this.uploads.length || !this.renderer?.initTexture) return;
    const t0 = performance.now();
    while (this.uploads.length && performance.now() - t0 < budgetMs) {
      const tex = this.uploads.shift();
      try { this.renderer.initTexture(tex); } catch { /* textura já liberada */ }
    }
  }

  // ---------- Materiais ----------
  material(texInfo, color, flags, prelit, isVehicle) {
    let c = color;
    let carColor = 0;
    if (isVehicle) {
      if (c[0] === 60 && c[1] === 255 && c[2] === 0) carColor = 1;
      else if (c[0] === 255 && c[1] === 0 && c[2] === 175) carColor = 2;
      const pc = PAINT_COLORS[c[0] + ',' + c[1] + ',' + c[2]];
      if (pc) c = [...pc, c[3]];
    }
    const key = (texInfo ? texInfo.texture.uuid : '-') + '|' + c.join(',') + '|' + flags + '|' + (prelit ? 1 : 0) + '|' + carColor;
    let m = this.materials.get(key);
    if (m) return m;
    const params = {
      color: new THREE.Color(c[0] / 255, c[1] / 255, c[2] / 255),
      map: texInfo ? texInfo.texture : null,
      side: (flags & FLAG_NO_CULL) ? THREE.DoubleSide : THREE.FrontSide,
    };
    const transparentMat = c[3] < 255 || (flags & (FLAG_ALPHA1 | FLAG_ALPHA2));
    if (texInfo?.alpha || transparentMat) {
      params.alphaTest = (flags & (FLAG_ALPHA1 | FLAG_ALPHA2)) ? 0.02 : 0.5;
      if (transparentMat) { params.transparent = true; params.opacity = c[3] / 255; params.depthWrite = !(flags & FLAG_NO_ZWRITE); }
      if (flags & FLAG_ALPHA2) params.blending = THREE.AdditiveBlending;
    }
    if (prelit) {
      params.vertexColors = true;
      m = new THREE.MeshBasicMaterial(params);
    } else {
      m = new THREE.MeshLambertMaterial(params);
    }
    m.userData.shared = true;
    m.userData.carColor = carColor;
    this.materials.set(key, m);
    return m;
  }

  // ---------- Modelos ----------
  getModel(id) {
    let p = this.models.get(id);
    if (!p) {
      p = this.buildModel(id).then(t => { this.ready.set(id, t); return t; })
        .catch(err => { console.warn('Modelo', id, err); this.ready.set(id, null); return null; });
      this.models.set(id, p);
    }
    return p;
  }

  async buildModel(id) {
    const def = this.gd.models.get(id);
    if (!def) return null;
    const entry = this.gd.entry(def.model + '.dff');
    if (!entry) return null;
    const isVehicle = def.type === 'cars';
    const isCarMod = id >= 1000 && id <= 1193;
    const [dff, chain] = await Promise.all([this.pool.run('dff', entry, { ambient: this.ambient }), this.txdChain(def.txd)]);
    const findTex = (name) => {
      if (!name) return null;
      for (const m of chain) { const t = m.get(name); if (t) return t; }
      return null;
    };
    const group = new THREE.Group();
    group.name = def.model;
    const world = dff.frames.map(() => null);
    const frameMatrix = (i) => {
      if (world[i]) return world[i];
      const f = dff.frames[i];
      const m = new THREE.Matrix4().set(
        f.rot[0], f.rot[3], f.rot[6], f.pos[0],
        f.rot[1], f.rot[4], f.rot[7], f.pos[1],
        f.rot[2], f.rot[5], f.rot[8], f.pos[2],
        0, 0, 0, 1);
      world[i] = (f.parent >= 0 && f.parent !== i && f.parent < dff.frames.length) ? frameMatrix(f.parent).clone().multiply(m) : m;
      return world[i];
    };
    const hasWheelDummies = isVehicle && dff.frames.some(f => /^wheel_[lr][fbm]_dummy$/i.test(f.name || ''));
    // Atomics desenhados (sem versões danificadas ou de baixa qualidade)
    let atomics = dff.atomics.filter(a => !/_dam$|_vlo$|_lo$|^col_|_l[1-3]$/.test(dff.frames[a.frame]?.name || ''));
    if (!atomics.length) atomics = dff.atomics.slice(0, 1);
    const used = new Set();
    const slotInfo = [];
    for (const a of atomics) {
      const g = dff.geometries[a.geometry];
      if (!g || !g.positions || used.has(a.geometry + ':' + a.frame)) continue;
      const fName = (dff.frames[a.frame]?.name || '').toLowerCase();
      // Se o veículo usa dummies de roda, o atomic template 'wheel' será instanciado apenas em addWheels
      if (hasWheelDummies && /^wheel$/.test(fName)) continue;
      used.add(a.geometry + ':' + a.frame);
      // Índices de material (o "materialindex" do SetObjectMaterial) e a textura original de cada um
      g.materials.forEach((mt, i) => {
        if (i > 15 || slotInfo[i]) return;
        const t = mt.texture ? findTex(mt.texture) : null;
        slotInfo[i] = { texture: mt.texture || '', txd: t ? t.txd : '', color: mt.color };
      });
      const mesh = this.buildMesh(g, def, findTex, isVehicle || isCarMod);
      if (!mesh) continue;
      mesh.name = fName;
      mesh.userData.frameName = fName;
      if (isVehicle && /wheel/.test(fName)) mesh.userData.isStockWheel = true;
      if (dff.frames[a.frame]) {
        const fm = frameMatrix(a.frame);
        mesh.userData.frameMatrix = fm.clone();
        mesh.applyMatrix4(fm);
      }
      group.add(mesh);
    }
    if (isVehicle) {
      this.addWheels(dff, group, def, findTex, frameMatrix);
      const dummies = {};
      dff.frames.forEach((f, i) => {
        if (f.name) dummies[f.name.toLowerCase()] = frameMatrix(i).clone();
      });
      group.userData.dummies = dummies;
    }
    // Detecção estritamente por estrutura e textura:
    // Identifica objetos que não carregam malha visível, possuem geometria microscópica/degenerada (< 8cm)
    // ou materiais 100% invisíveis/transparentes. Nunca filtra por nome.
    let box = new THREE.Box3().setFromObject(group);
    const boxSize = box.isEmpty() ? new THREE.Vector3(0, 0, 0) : box.getSize(new THREE.Vector3());
    const isDegenerate = box.isEmpty() || boxSize.length() < 0.08;

    let hasVisibleMesh = false;
    group.traverse(child => {
      if (child.isMesh && child.geometry) {
        const posCount = child.geometry.attributes?.position?.count || 0;
        const idxCount = child.geometry.index?.count || 0;
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        const hasVisibleMat = mats.some(m => m && m.visible !== false && (!m.transparent || m.opacity > 0.02));
        if (posCount > 0 && (idxCount > 3 || !isDegenerate) && hasVisibleMat) {
          hasVisibleMesh = true;
        }
      }
    });

    const isInvisible = !hasVisibleMesh || isDegenerate;
    if (isInvisible) {
      group.add(createInvisibleMarkerMesh(id, def));
      box = new THREE.Box3().setFromObject(group);
      if (!slotInfo.length) slotInfo[0] = { texture: '', txd: '', color: [255, 100, 0, 255] };
    }
    group.userData.box = box;
    group.userData.radius = box.getBoundingSphere(new THREE.Sphere()).radius || 1;
    group.userData.def = def;
    group.userData.txds = this.chainNames(def.txd);
    group.userData.slotInfo = Array.from({ length: slotInfo.length }, (_, i) => slotInfo[i] || { texture: '', txd: '' });
    group.userData.lastUsed = performance.now();
    return group;
  }

  buildMesh(g, def, findTex, isVehicle) {
    if (!g.groups.length) return null;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(g.positions, 3));
    if (g.normals) geo.setAttribute('normal', new THREE.BufferAttribute(g.normals, 3));
    if (g.uvs) geo.setAttribute('uv', new THREE.BufferAttribute(g.uvs, 2));
    const prelit = !!g.colors;
    if (prelit) geo.setAttribute('color', new THREE.BufferAttribute(g.colors, 4, true));
    geo.setIndex(new THREE.BufferAttribute(g.index, 1));
    const modulate = (g.flags & 0x40) !== 0 || isVehicle || !prelit;
    const mats = [];
    const slots = [];
    for (const gr of g.groups) {
      const mat = g.materials[gr.material] || { color: [255, 255, 255, 255], texture: null };
      const tex = mat.texture ? findTex(mat.texture) : null;
      geo.addGroup(gr.start, gr.count, mats.length);
      slots.push(gr.material);
      const color = modulate ? mat.color : [255, 255, 255, mat.color[3]];
      mats.push(this.material(tex, color, def.flags, prelit, isVehicle));
    }
    // Sem luz pré-calculada o material usa iluminação, que precisa de normais
    if (!g.normals && !prelit) geo.computeVertexNormals();
    geo.computeBoundingSphere();
    geo.computeBoundingBox();
    const mesh = new THREE.Mesh(geo, mats);
    mesh.userData.slots = slots;
    if (mats.some(m => m.transparent)) mesh.renderOrder = 1;
    return mesh;
  }

  addWheels(dff, group, def, findTex, frameMatrix) {
    const wheelAtomic = dff.atomics.find(a => /^wheel$/.test(dff.frames[a.frame]?.name || ''))
      || dff.atomics.find(a => /wheel/.test(dff.frames[a.frame]?.name || '') && !/dummy/.test(dff.frames[a.frame]?.name || ''));
    const dummies = dff.frames.map((f, i) => ({ f, i })).filter(x => /^wheel_[lr][fbm]_dummy$/.test(x.f.name));
    if (!dummies.length || !wheelAtomic) return;
    const wheelMesh = this.buildMesh(dff.geometries[wheelAtomic.geometry], def, findTex, true);
    if (!wheelMesh) return;
    for (const d of dummies) {
      if (dff.atomics.some(a => a.frame === d.i)) continue;
      const w = wheelMesh.clone();
      w.name = d.f.name.toLowerCase();
      w.userData = { ...wheelMesh.userData, frameName: d.f.name.toLowerCase(), isStockWheel: true };
      w.applyMatrix4(frameMatrix(d.i));
      if (/_l/.test(d.f.name)) { w.scale.x *= -1; w.updateMatrix(); }
      group.add(w);
    }
  }

  // Libera os modelos usados há mais tempo quando passa do limite (otimizado para baixo uso de RAM).
  evict(keep, budget = 250) {
    const loaded = [...this.ready.entries()].filter(([, t]) => t);
    let removed = 0;
    if (loaded.length > budget) {
      loaded.sort((a, b) => a[1].userData.lastUsed - b[1].userData.lastUsed);
      for (const [id, t] of loaded) {
        if (loaded.length - removed <= budget * 0.85) break;
        if (keep.has(id)) continue;
        t.traverse(o => { if (o.isMesh && o.geometry) o.geometry.dispose(); });
        this.ready.delete(id);
        this.models.delete(id);
        removed++;
      }
    }
    this.releaseTxds();
    return removed;
  }

  // Tira da memória (e da placa de vídeo) os TXDs que nenhum modelo carregado usa mais
  releaseTxds() {
    const usedTxd = new Set(this.pinnedTxds ? this.pinnedTxds() : []);
    usedTxd.add('*vehicle');
    for (const t of this.ready.values()) if (t) for (const n of t.userData.txds || []) usedTxd.add(n);
    let freed = 0;
    for (const [name, p] of this.txds) {
      if (usedTxd.has(name)) continue;
      this.txds.delete(name);
      freed++;
      p.then(map => {
        const dead = new Set();
        for (const info of map.values()) { info.texture.dispose(); dead.add(info.texture.uuid); }
        for (const [key, m] of this.materials) {
          if (m.map && dead.has(m.map.uuid)) {
            m.dispose();
            this.materials.delete(key);
          }
        }
        for (const [key, m] of this.overrides) {
          if (m.map && dead.has(m.map.uuid)) {
            m.dispose();
            this.overrides.delete(key);
          }
        }
      }).catch(() => {});
    }
    return freed;
  }

  // Marcador para modelo que não existe no jogo: contorno tracejado + caixa invisível clicável
  missingMarker() {
    const g = new THREE.Group();
    const lines = new THREE.LineSegments(this.missingEdges, this.missingMat);
    lines.computeLineDistances();
    g.add(lines);
    if (!this.pickMat) this.pickMat = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false });
    g.add(new THREE.Mesh(this.placeholderGeo, this.pickMat));
    g.userData.missing = true;
    return g;
  }

  // Cópia leve do modelo (compartilha geometria e materiais)
  instantiate(id) {
    const t = this.ready.get(id);
    if (!t) return null;
    t.userData.lastUsed = performance.now();
    const o = t.clone(true);
    o.userData = { ...t.userData };
    const def = this.gd.models.get(id);
    if (def?.type === 'peds') {
      const rawBox = t.userData.box;
      const sx = rawBox ? (rawBox.max.x - rawBox.min.x) : 0;
      const sy = rawBox ? (rawBox.max.y - rawBox.min.y) : 0;
      const sz = rawBox ? (rawBox.max.z - rawBox.min.z) : 0;

      if (sx > sy && sx > sz) {
        // Modelos cuja altura original está no eixo X (ex: skins 163-166, 300-311)
        o.rotation.set(0, -Math.PI / 2, 0);
      } else if (sy > sx && sy > sz) {
        // Modelos padrão cuja altura original está no eixo Y
        o.rotation.set(Math.PI / 2, Math.PI, 0);
      }
      o.updateMatrixWorld(true);
      const b = new THREE.Box3().setFromObject(o);
      o.userData.box = b;
      o.userData.radius = b.getBoundingSphere(new THREE.Sphere()).radius || 1;
    }
    return o;
  }

  // Índices de material e texturas originais de um modelo (carrega se precisar)
  async slots(id) {
    const t = this.ready.get(id) || await this.getModel(id);
    return t?.userData.slotInfo || [];
  }

  // ---------- Trocas de material do SA-MP ----------
  async overrideMaterial(orig, raw) {
    const ov = normalizeMaterial(raw);
    const key = orig.uuid + '|' + JSON.stringify(ov);
    if (this.overrides.has(key)) return this.overrides.get(key);
    const m = orig.clone();
    m.userData = { override: true };
    if (isText(ov)) {
      m.map = materialTextTexture(ov);
      m.vertexColors = false;
      const bc = parseColor(ov.backColor);
      const isOpaque = ((bc >>> 24) & 255) === 255;
      m.transparent = !isOpaque;
      m.depthWrite = isOpaque;
      m.alphaTest = isOpaque ? 0 : 0.01;
      m.side = THREE.DoubleSide;
      m.color.setRGB(1, 1, 1);
    } else if (isNoneTexture(ov)) {
      m.visible = false;
      m.transparent = true;
      m.opacity = 0;
      m.depthWrite = false;
      m.color.setRGB(0, 0, 0);
    } else {
      if (!keepsTexture(ov)) {
        const name = String(ov.texture).toLowerCase();
        let info = (await this.loadTxd(ov.txd)).get(name);
        if (!info) {
          const def = this.gd.models.get(ov.model);
          if (def) for (const map of await this.txdChain(def.txd)) { info = map.get(name); if (info) break; }
        }
        if (info) {
          m.map = info.texture;
          m.color.setRGB(1, 1, 1);
          m.alphaTest = info.alpha ? 0.5 : 0;
        } else {
          m.map = null; // textura que não existe: o jogo mostra a face sem textura
        }
        // A textura nova cobre a peça inteira por igual: sem as sombras/cores pintadas no
        // modelo original (luz pré-calculada), que escureciam partes do objeto
        if (m.vertexColors) { m.vertexColors = false; m.color.setRGB(0.92, 0.92, 0.92); }
      }
      const c = parseColor(ov.color);
      if (c !== 0) {
        // No SA-MP a cor multiplica a textura e o alfa controla a transparência
        const p = argbParts(c);
        m.color.setRGB(p.r / 255, p.g / 255, p.b / 255);
        if (p.a < 255) { m.transparent = true; m.opacity = p.a / 255; m.depthWrite = p.a > 200; }
      }
    }
    m.needsUpdate = true;
    this.overrides.set(key, m);
    if (this.overrides.size > 4000) this.overrides.delete(this.overrides.keys().next().value);
    return m;
  }

  // Aplica as trocas num objeto já instanciado
  async applyMaterials(obj, materials) {
    if (!materials || !materials.length) return;
    const byIndex = new Map();
    for (const ov of materials) byIndex.set(ov.index, ov);
    const meshes = [];
    obj.traverse(o => { if (o.isMesh && o.userData.slots) meshes.push(o); });
    for (const mesh of meshes) {
      const list = Array.isArray(mesh.material) ? [...mesh.material] : [mesh.material];
      let changed = false;
      for (let k = 0; k < list.length; k++) {
        const ov = byIndex.get(mesh.userData.slots[k]);
        if (!ov) continue;
        list[k] = await this.overrideMaterial(list[k], ov);
        changed = true;
      }
      if (changed) mesh.material = list;
    }
  }
}

// ---------------------------------------------------------------------------
// SetObjectMaterialText: desenha o texto numa textura do tamanho escolhido
// (OBJECT_MATERIAL_SIZE_*), com fundo, negrito, alinhamento e cores {RRGGBB}.
// ---------------------------------------------------------------------------
export function drawMaterialText(ctx, t, w, h) {
  ctx.clearRect(0, 0, w, h);
  if (parseColor(t.backColor)) { ctx.fillStyle = cssColor(t.backColor); ctx.fillRect(0, 0, w, h); }
  const fontColor = parseColor(t.fontColor) ? cssColor(t.fontColor) : 'rgba(0,0,0,0)';
  ctx.font = `${t.bold ? 'bold ' : ''}${t.fontSize}px "${t.font}", Arial, sans-serif`;
  ctx.textBaseline = 'middle';
  const lines = String(t.text).split('\n');
  const lh = t.fontSize * 1.15;
  lines.forEach((line, li) => {
    const segs = colorSegments(line, fontColor);
    const width = segs.reduce((s, sg) => s + ctx.measureText(sg.text).width, 0);
    let x = t.align === 1 ? (w - width) / 2 : t.align === 2 ? w - width : 0;
    const y = h / 2 + (li - (lines.length - 1) / 2) * lh;
    for (const sg of segs) {
      ctx.fillStyle = sg.color;
      ctx.fillText(sg.text, x, y);
      x += ctx.measureText(sg.text).width;
    }
  });
}

export function materialTextTexture(ov) {
  const t = normalizeMaterial(ov);
  const [w, h] = SIZE_PIXELS[t.size] || [256, 128];
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  drawMaterialText(canvas.getContext('2d'), t, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.flipY = false;
  tex.anisotropy = 4;
  tex.colorSpace = THREE.NoColorSpace;
  tex.needsUpdate = true;
  return tex;
}

// ---------------------------------------------------------------------------
// Objetos invisíveis, dummies e emissores de partículas:
// Cria um marcador geométrico 3D visível para permitir visualização, clique,
// gizmo e destaque vermelho padrão quando selecionado.
// ---------------------------------------------------------------------------
export function createInvisibleMarkerMesh(id, def) {
  const g = new THREE.Group();
  g.userData.isInvisibleMarker = true;

  // Marcador octaédrico estilizado
  const geo = new THREE.OctahedronGeometry(0.55, 0);
  geo.computeVertexNormals();

  const mat = new THREE.MeshLambertMaterial({
    color: 0xff7700,
    transparent: true,
    opacity: 0.70,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'invisible_marker';
  mesh.userData.slots = [0]; // Permite destacar e selecionar em vermelho normalmente
  g.add(mesh);

  // Contorno aramado
  const wireGeo = new THREE.WireframeGeometry(geo);
  const wireMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 });
  const wire = new THREE.LineSegments(wireGeo, wireMat);
  wire.userData.noPick = true;
  g.add(wire);

  // Núcleo central
  const coreGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.userData.noPick = true;
  g.add(core);

  return g;
}

// Quaternion do IPL (SA guarda o conjugado) -> THREE.Quaternion
export function iplQuaternion(inst, out = new THREE.Quaternion()) {
  return out.set(-inst.qx, -inst.qy, -inst.qz, inst.qw);
}
