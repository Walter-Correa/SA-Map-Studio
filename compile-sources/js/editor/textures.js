// Texture library: index of all the game textures (built in the background
// by a Web Worker and cached on disk), categories and thumbnails.
import { textureCategory } from '../world/categories.js';

const OBJECT_TYPES = new Set(['objs', 'tobj', 'anim']);

export class TextureLibrary extends EventTarget {
  constructor(gamedata) {
    super();
    this.gd = gamedata;
    this.state = 'none';          // none | loading | ready | error
    this.progress = { done: 0, total: 0 };
    this.items = [];              // {key, txd, name, w, h, alpha, model, samp, category}
    this.byKey = new Map();
    this.txdModel = this.buildTxdModelMap();
    this.have = new Set();        // thumbnails already on disk
    this.urls = new Map();        // key -> URL generated now (or null)
    this.thumbWaiting = new Map();
    this.thumbQueue = [];
    this.thumbBusy = 0;
    this.thumbId = 0;
    this.thumbWorker = null;
    this.indexWorker = null;
  }

  setHave(keys) { for (const k of keys || []) this.have.add(k); }

  // For each TXD, a model that loads it (SetObjectMaterial needs the ID of a model that uses the TXD)
  buildTxdModelMap() {
    const map = new Map();
    const defs = [...this.gd.models.values()].filter(d => OBJECT_TYPES.has(d.type)).sort((a, b) => a.id - b.id);
    for (const d of defs) {
      let cur = d.txd, guard = 0;
      while (cur && guard++ < 8) {
        if (!map.has(cur)) map.set(cur, d.id);
        cur = this.gd.txdParents.get(cur);
      }
    }
    return map;
  }

  txdEntries() {
    const out = [];
    for (const [name, e] of this.gd.entries) {
      if (!name.endsWith('.txd')) continue;
      const txd = name.slice(0, -4);
      if (!this.txdModel.has(txd)) continue; // no object uses it: SA-MP cannot load it
      out.push({ name: txd, img: e.img, offset: e.offset, size: e.size });
    }
    return out;
  }

  signature(entries) {
    let bytes = 0;
    for (const e of entries) bytes += e.size;
    return `v2-${this.gd.entries.size}-${entries.length}-${bytes}`;
  }

  emit(type, detail) { this.dispatchEvent(new CustomEvent(type, { detail })); }

  // Opens the already saved index, without starting the read
  async tryCache() {
    const sig = this.signature(this.txdEntries());
    try {
      const res = await fetch('/api/cache/textures');
      if (!res.ok) return false;
      const data = await res.json();
      if (!data.items || data.signature !== sig) return false;
      this.setIndex(data.items);
      // Does not start mass background generation to save RAM
      return true;
    } catch { return false; }
  }

  // Lists the textures of all TXDs. The server reads only the headers (takes a few seconds);
  // if that fails, a Web Worker reads the files. Thumbnails are generated on demand for the visible items.
  async startIndex() {
    if (this.state === 'loading') return;
    const entries = this.txdEntries();
    const sig = this.signature(entries);
    const wasReady = this.state === 'ready';
    this.state = 'loading';
    this.progress = { done: 0, total: entries.length };
    this.emit('state');
    try {
      const res = await fetch('/api/textures/index', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: entries.map(e => ({ name: e.name, img: e.img, offset: e.offset, size: e.size })) }) });
      const data = await res.json();
      if (!data.ok) throw new Error('índice');
      const items = [];
      for (const t of data.data) for (const [name, w, h, a] of t.tex) items.push([t.txd, name, w, h, a]);
      this.progress = { done: entries.length, total: entries.length };
      this.setIndex(items);
      fetch('/api/cache/textures', { method: 'POST', body: JSON.stringify({ signature: sig, items }) }).catch(() => {});
      return;
    } catch { /* old server: reads in the browser */ }
    this.indexWorker = new Worker(new URL('../world/textures.worker.js', import.meta.url), { type: 'module' });
    this.indexWorker.onmessage = (ev) => {
      const m = ev.data;
      if (m.type === 'progress') { this.progress = { done: m.done, total: m.total }; this.emit('progress'); }
      else if (m.type === 'done') {
        const items = [];
        for (const t of m.data) for (const [name, w, h, a] of t.tex) items.push([t.txd, name, w, h, a]);
        this.indexWorker.terminate(); this.indexWorker = null;
        this.setIndex(items);
        fetch('/api/cache/textures', { method: 'POST', body: JSON.stringify({ signature: sig, items }) }).catch(() => {});
      } else if (m.type === 'cancelled') {
        this.state = wasReady ? 'ready' : 'none'; this.emit('state');
        this.indexWorker.terminate(); this.indexWorker = null;
      }
    };
    this.indexWorker.onerror = () => { this.state = 'error'; this.emit('state'); };
    this.indexWorker.postMessage({ type: 'index', entries, thumbs: false, have: [...this.have], base: location.origin + '/gta/' });
  }

  // ---------------------------------------------------------------- background thumbnails
  // One TXD at a time, and only when the map is not loading (to avoid competing for the connection).
  startThumbs() {
    const byTxd = new Map();
    for (const it of this.items) if (!this.have.has(it.key)) { if (!byTxd.has(it.txd)) byTxd.set(it.txd, []); byTxd.get(it.txd).push(it.name); }
    this.bg = { queue: [...byTxd.keys()], done: 0, total: byTxd.size, running: byTxd.size > 0 };
    this.emit('thumbs');
    this.pumpBg();
  }

  stopThumbs() { if (this.bg) { this.bg.queue = []; this.bg.running = false; this.emit('thumbs'); } }

  pumpBg() {
    const bg = this.bg;
    if (!bg || !bg.running || bg.busy) return;
    if (!bg.queue.length) { bg.running = false; this.missingThumbs = this.items.filter(i => !this.have.has(i.key)).length; this.emit('thumbs'); return; }
    // Waits for the map to finish loading and for the thumbnails requested by the screen
    // (while the map is loading, does at most one TXD every 1.5 s)
    const busy = this.isBusy?.() || this.thumbQueue.length || this.thumbBusy;
    if (busy && performance.now() - (bg.last || 0) < 1500) { clearTimeout(this.bgTimer); this.bgTimer = setTimeout(() => this.pumpBg(), 500); return; }
    bg.last = performance.now();
    const txd = bg.queue.shift();
    const entry = this.gd.entry(txd + '.txd');
    if (!entry) { bg.done++; this.pumpBg(); return; }
    bg.busy = true;
    this.ensureThumbWorker();
    const id = ++this.thumbId;
    this.bgPending = id;
    const skip = this.items.filter(i => i.txd === txd && this.have.has(i.key)).map(i => i.name);
    this.thumbWorker.postMessage({ type: 'txdthumbs', id, entry: { img: entry.img, offset: entry.offset, size: entry.size }, txd, skip });
  }

  onBgDone(m) {
    const bg = this.bg;
    for (const name of m.names || []) this.have.add(m.txd + '/' + name);
    if (!bg) return;
    bg.busy = false;
    bg.done++;
    this.emit('thumbs');
    clearTimeout(this.bgTimer);
    this.bgTimer = setTimeout(() => this.pumpBg(), 15);
  }

  cancelIndex() { this.indexWorker?.postMessage({ type: 'cancel' }); }

  setIndex(rows) {
    this.items = [];
    this.byKey.clear();
    for (const [txd, name, w, h, a] of rows) {
      const key = txd + '/' + name;
      if (this.byKey.has(key)) continue;
      const model = this.txdModel.get(txd);
      if (model === undefined) continue;
      const def = this.gd.models.get(model);
      const src = (def?.source || '').toLowerCase();
      const item = { key, txd, name, w, h, alpha: !!a, model, samp: src.includes('samp'), category: textureCategory(name, txd, w, h) };
      this.items.push(item);
      this.byKey.set(key, item);
    }
    this.items.sort((a, b) => a.name.localeCompare(b.name) || a.txd.localeCompare(b.txd));
    this.missingThumbs = this.items.filter(i => !this.have.has(i.key)).length;
    this.state = 'ready';
    this.emit('state');
  }

  find(txd, name) { return this.byKey.get((txd || '').toLowerCase() + '/' + (name || '').toLowerCase()) || null; }

  // ---------------------------------------------------------------- miniaturas
  thumbUrl(txd, name) {
    const key = (txd + '/' + name).toLowerCase();
    if (this.have.has(key)) return '/thumbs/tex/' + encodeURIComponent(txd.toLowerCase()) + '/' + encodeURIComponent(name.toLowerCase()) + '.webp';
    return this.urls.get(key) || null;
  }

  thumb(txd, name, cb) {
    txd = String(txd || '').toLowerCase(); name = String(name || '').toLowerCase();
    const key = txd + '/' + name;
    const known = this.thumbUrl(txd, name);
    if (known) { cb(known); return; }
    if (this.urls.has(key)) { cb(null); return; }
    if (this.thumbWaiting.has(key)) { this.thumbWaiting.get(key).push(cb); return; }
    const entry = this.gd.entry(txd + '.txd');
    if (!entry) { this.urls.set(key, null); cb(null); return; }
    this.thumbWaiting.set(key, [cb]);
    this.thumbQueue.push({ key, entry, txd, name });
    this.pumpThumbs();
  }

  // A texture at its best resolution, for the hover preview: Promise of an object URL (revoked by the caller) or null
  large(txd, name) {
    txd = String(txd || '').toLowerCase(); name = String(name || '').toLowerCase();
    const entry = this.gd.entry(txd + '.txd');
    if (!entry) return Promise.resolve(null);
    this.ensureThumbWorker();
    this.largePending = this.largePending || new Map();
    const id = ++this.thumbId;
    return new Promise((resolve) => {
      this.largePending.set(id, resolve);
      this.thumbWorker.postMessage({ type: 'large', id, entry: { img: entry.img, offset: entry.offset, size: entry.size }, txd, tex: name });
    });
  }

  keepThumbs(keys) {
    const keep = new Set(keys);
    this.thumbQueue = this.thumbQueue.filter(q => {
      if (keep.has(q.key)) return true;
      this.thumbWaiting.delete(q.key);
      return false;
    });
  }

  ensureThumbWorker() {
    if (!this.thumbWorker) {
      this.thumbWorker = new Worker(new URL('../world/textures.worker.js', import.meta.url), { type: 'module' });
      this.thumbPending = new Map();
      this.thumbWorker.onmessage = (ev) => {
        const m = ev.data;
        if (m.type === 'txdthumbs') { this.onBgDone(m); return; }
        if (m.type === 'large') {
          const done = this.largePending?.get(m.id);
          this.largePending?.delete(m.id);
          if (done) done(m.blob ? URL.createObjectURL(m.blob) : null);
          return;
        }
        if (m.type !== 'thumb') return;
        const key = this.thumbPending.get(m.id);
        this.thumbPending.delete(m.id);
        this.thumbBusy--;
        const url = m.blob ? URL.createObjectURL(m.blob) : null;
        if (this.urls.size > 250) {
          const oldest = this.urls.keys().next().value;
          const oldUrl = this.urls.get(oldest);
          if (oldUrl && oldUrl.startsWith('blob:')) URL.revokeObjectURL(oldUrl);
          this.urls.delete(oldest);
        }
        this.urls.set(key, url);
        if (m.blob) this.have.add(key);
        const cbs = this.thumbWaiting.get(key) || [];
        this.thumbWaiting.delete(key);
        for (const cb of cbs) cb(url);
        this.pumpThumbs();
      };
      this.thumbWorker.postMessage({ base: location.origin + '/gta/', have: [...this.have] });
    }
  }

  pumpThumbs() {
    this.ensureThumbWorker();
    while (this.thumbBusy < 6 && this.thumbQueue.length) {
      const q = this.thumbQueue.shift();
      if (!this.thumbWaiting.has(q.key)) continue;
      const id = ++this.thumbId;
      this.thumbPending.set(id, q.key);
      this.thumbBusy++;
      this.thumbWorker.postMessage({ type: 'thumb', id, entry: { img: q.entry.img, offset: q.entry.offset, size: q.entry.size }, txd: q.txd, tex: q.name });
    }
  }
}
