// Biblioteca de texturas: índice de todas as texturas do jogo (feito em segundo plano
// por um Web Worker e guardado em cache no disco), categorias e miniaturas.
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
    this.have = new Set();        // miniaturas que já estão no disco
    this.urls = new Map();        // chave -> URL gerada agora (ou null)
    this.thumbWaiting = new Map();
    this.thumbQueue = [];
    this.thumbBusy = 0;
    this.thumbId = 0;
    this.thumbWorker = null;
    this.indexWorker = null;
  }

  setHave(keys) { for (const k of keys || []) this.have.add(k); }

  // Para cada TXD, um modelo que o carrega (o SetObjectMaterial precisa do ID de um modelo que use o TXD)
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
      if (!this.txdModel.has(txd)) continue; // nenhum objeto usa: o SA-MP não consegue carregar
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

  // Abre o índice já salvo, sem iniciar a leitura
  async tryCache() {
    const sig = this.signature(this.txdEntries());
    try {
      const res = await fetch('/api/cache/texturas');
      if (!res.ok) return false;
      const data = await res.json();
      if (!data.items || data.signature !== sig) return false;
      this.setIndex(data.items);
      // Não inicia geração em massa em segundo plano para economizar RAM
      return true;
    } catch { return false; }
  }

  // Lista as texturas de todos os TXDs. O servidor lê só os cabeçalhos (leva poucos segundos);
  // se não der, um Web Worker lê os arquivos. Miniaturas são geradas sob demanda para os itens visíveis.
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
      fetch('/api/cache/texturas', { method: 'POST', body: JSON.stringify({ signature: sig, items }) }).catch(() => {});
      return;
    } catch { /* servidor antigo: lê no navegador */ }
    this.indexWorker = new Worker(new URL('../world/textures.worker.js', import.meta.url), { type: 'module' });
    this.indexWorker.onmessage = (ev) => {
      const m = ev.data;
      if (m.type === 'progress') { this.progress = { done: m.done, total: m.total }; this.emit('progress'); }
      else if (m.type === 'done') {
        const items = [];
        for (const t of m.data) for (const [name, w, h, a] of t.tex) items.push([t.txd, name, w, h, a]);
        this.indexWorker.terminate(); this.indexWorker = null;
        this.setIndex(items);
        fetch('/api/cache/texturas', { method: 'POST', body: JSON.stringify({ signature: sig, items }) }).catch(() => {});
      } else if (m.type === 'cancelled') {
        this.state = wasReady ? 'ready' : 'none'; this.emit('state');
        this.indexWorker.terminate(); this.indexWorker = null;
      }
    };
    this.indexWorker.onerror = () => { this.state = 'error'; this.emit('state'); };
    this.indexWorker.postMessage({ type: 'index', entries, thumbs: false, have: [...this.have], base: location.origin + '/gta/' });
  }

  // ---------------------------------------------------------------- miniaturas em segundo plano
  // Um TXD por vez, e só quando o mapa não está carregando (para não disputar a conexão).
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
    // Espera o mapa terminar de carregar e as miniaturas pedidas pela tela
    // (com o mapa carregando, faz no máximo um TXD a cada 1,5 s)
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
