// Miniaturas dos objetos do catálogo.
// - Primeiro procura no cache em disco (Dados/cache/miniaturas): aparecem na hora.
// - O que falta é desenhado em lotes (vários objetos por leitura da placa de vídeo)
//   e salvo no disco, então só é gerado uma vez.
// - "Preparar todas" gera em segundo plano as que faltam, aos poucos.
import * as THREE from 'three';

const SIZE = 96;
const COLS = 4, ROWS = 4;            // lote de até 16 miniaturas por leitura
const BATCH = COLS * ROWS;

export class Thumbnails extends EventTarget {
  constructor(renderer, models) {
    super();
    this.renderer = renderer;
    this.models = models;
    this.have = new Set();      // ids com miniatura no disco
    this.urls = new Map();      // id -> url (disco ou gerada agora) | null
    this.waiting = new Map();   // id -> [callbacks]
    this.queue = [];
    this.busy = false;
    this.target = new THREE.WebGLRenderTarget(SIZE * COLS, SIZE * ROWS, { samples: 4 });
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x2b333b);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x777777, 2.5));
    this.camera = new THREE.PerspectiveCamera(35, 1, 0.05, 5000);
    this.pixels = new Uint8Array(SIZE * COLS * SIZE * ROWS * 4);
    this.canvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(SIZE, SIZE) : Object.assign(document.createElement('canvas'), { width: SIZE, height: SIZE });
    this.ctx = this.canvas.getContext('2d');
    this.background = { running: false, done: 0, total: 0 };
    this.batches = 0;
  }

  async loadIndex() {
    try {
      const data = await (await fetch('/api/thumbs/index')).json();
      for (const id of data.obj || []) this.have.add(id);
      return data;
    } catch { return { obj: [], tex: [] }; }
  }

  url(id) { return this.have.has(id) ? `/thumbs/obj/${id}.webp` : (this.urls.get(id) || null); }

  request(id, cb) {
    if (this.have.has(id)) { cb(`/thumbs/obj/${id}.webp`); return; }
    if (this.urls.has(id)) { cb(this.urls.get(id)); return; }
    if (this.waiting.has(id)) { this.waiting.get(id).push(cb); return; }
    this.waiting.set(id, [cb]);
    this.queue.push(id);
    this.pump();
  }

  // Descarta pedidos que saíram da tela (os do fundo continuam)
  cancelExcept(ids) {
    const keep = new Set(ids);
    this.queue = this.queue.filter(id => keep.has(id) || this.background.ids?.has(id) || (this.waiting.delete(id), false));
  }

  async pump() {
    if (this.busy) return;
    this.busy = true;
    try {
      while (this.queue.length) {
        const batch = [];
        while (batch.length < BATCH && this.queue.length) {
          const id = this.queue.shift();
          if (this.have.has(id) || this.urls.has(id)) { this.finish(id, this.url(id)); continue; }
          if (!this.waiting.has(id) && !this.background.ids?.has(id)) continue;
          batch.push(id);
        }
        if (!batch.length) continue;
        // Carrega os modelos do lote em paralelo (no grupo de workers)
        const loaded = new Set(batch.filter(id => this.models.ready.has(id)));
        // (um modelo que demore demais não segura a fila: fica sem miniatura por enquanto)
        const timeout = () => new Promise(r => setTimeout(() => r(null), 20000));
        const templates = await Promise.all(batch.map(id => Promise.race([this.models.getModel(id).catch(() => null), timeout()])));
        const results = await this.renderBatch(batch, templates);
        for (let i = 0; i < batch.length; i++) {
          const id = batch[i];
          const blob = results[i] ? await results[i] : null;
          let url = null;
          if (blob) {
            url = URL.createObjectURL(blob);
            fetch(`/api/thumbs/obj/${id}`, { method: 'POST', body: blob }).then(r => { if (r.ok) this.have.add(id); }).catch(() => {});
          }
          if (this.urls.size > 250) {
            const oldest = this.urls.keys().next().value;
            const oldUrl = this.urls.get(oldest);
            if (oldUrl && oldUrl.startsWith('blob:')) URL.revokeObjectURL(oldUrl);
            this.urls.delete(oldest);
          }
          this.urls.set(id, url);
          if (this.background.ids?.delete(id)) { this.background.done++; this.dispatchEvent(new Event('progress')); }
          this.finish(id, url);
          // Modelos carregados só para a miniatura saem da memória logo
          if (!loaded.has(id) && this.releasable?.(id)) this.releaseModel(id);
        }
        // Na geração em segundo plano: libera as texturas e dá folga para o editor continuar leve
        if (this.background.running && ++this.batches % 4 === 0) this.models.releaseTxds?.();
        await new Promise(r => setTimeout(r, this.background.running && !this.waiting.size ? 150 : 0));
        await new Promise(r => requestAnimationFrame(r));
      }
    } finally {
      this.busy = false;
    }
    if (this.background.running && !this.background.ids.size) this.stopBackground(true);
  }

  finish(id, url) {
    const cbs = this.waiting.get(id) || [];
    this.waiting.delete(id);
    for (const cb of cbs) cb(url);
  }

  releaseModel(id) {
    const t = this.models.ready.get(id);
    if (!t) return;
    t.traverse(o => { if (o.isMesh) o.geometry.dispose(); });
    this.models.ready.delete(id);
    this.models.models.delete(id);
  }

  // Desenha até 16 modelos numa só textura e lê os pixels uma vez (sem travar a tela)
  async renderBatch(ids, templates) {
    const r = this.renderer;
    const prev = r.getRenderTarget();
    const tg = this.target;
    tg.scissorTest = true;
    const drawn = [];
    ids.forEach((id, i) => {
      const t = templates[i];
      const col = i % COLS, row = Math.floor(i / COLS);
      // Num render target o three.js usa o viewport/scissor do próprio alvo
      tg.viewport.set(col * SIZE, row * SIZE, SIZE, SIZE);
      tg.scissor.set(col * SIZE, row * SIZE, SIZE, SIZE);
      r.setRenderTarget(tg);
      if (!t) { r.setClearColor(0x2b333b, 1); r.clear(); drawn.push(false); return; }
      const obj = this.models.instantiate(id);
      this.scene.add(obj);
      const box = obj.userData.box || new THREE.Box3().setFromObject(obj);
      const center = box.getCenter(new THREE.Vector3());
      const radius = Math.max(0.3, box.getBoundingSphere(new THREE.Sphere()).radius);
      const dist = radius / Math.sin((this.camera.fov / 2) * Math.PI / 180) * 1.05;
      const dir = new THREE.Vector3(-0.75, -1, 0.65).normalize();
      this.camera.position.copy(center).addScaledVector(dir, dist);
      this.camera.near = dist / 100; this.camera.far = dist * 4;
      this.camera.up.set(0, 0, 1);
      this.camera.lookAt(center);
      this.camera.updateProjectionMatrix();
      r.render(this.scene, this.camera);
      this.scene.remove(obj);
      drawn.push(true);
    });
    r.setRenderTarget(prev);
    try { await r.readRenderTargetPixelsAsync(tg, 0, 0, SIZE * COLS, SIZE * ROWS, this.pixels); }
    catch { r.readRenderTargetPixels(tg, 0, 0, SIZE * COLS, SIZE * ROWS, this.pixels); }
    const W = SIZE * COLS;
    return ids.map((id, i) => {
      if (!drawn[i]) return null;
      const col = i % COLS, row = Math.floor(i / COLS);
      const img = this.ctx.createImageData(SIZE, SIZE);
      for (let y = 0; y < SIZE; y++) {
        // A leitura vem de baixo para cima
        const srcRow = row * SIZE + (SIZE - 1 - y);
        const src = (srcRow * W + col * SIZE) * 4;
        img.data.set(this.pixels.subarray(src, src + SIZE * 4), y * SIZE * 4);
      }
      this.ctx.putImageData(img, 0, 0);
      return this.canvas.convertToBlob
        ? this.canvas.convertToBlob({ type: 'image/webp', quality: 0.85 })
        : new Promise(res => this.canvas.toBlob(res, 'image/webp', 0.85));
    });
  }

  // ---------- geração em segundo plano ----------
  startBackground(ids) {
    const missing = ids.filter(id => !this.have.has(id) && !this.urls.has(id));
    this.background = { running: true, done: 0, total: missing.length, ids: new Set(missing) };
    this.queue.push(...missing);
    this.dispatchEvent(new Event('progress'));
    this.pump();
  }

  stopBackground(finished = false) {
    if (!this.background.running) return;
    this.models.releaseTxds?.();
    const ids = this.background.ids || new Set();
    this.queue = this.queue.filter(id => !ids.has(id) || this.waiting.has(id));
    this.background.running = false;
    this.background.finished = finished;
    this.background.ids = new Set();
    this.dispatchEvent(new Event('progress'));
  }
}
