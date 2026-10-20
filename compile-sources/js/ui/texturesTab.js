import { t, uiLocale } from './i18n.js';
// Aba Texturas: todas as texturas do jogo por categoria, com miniaturas no disco.
// Clicar numa textura aplica (SetObjectMaterial) nos índices escolhidos dos objetos selecionados.
import { TEXTURE_CATEGORIES } from '../world/categories.js';
import { isText } from '../editor/materials.js';
import { app, $, $$, esc, plural, store, toast, modelLabel, showPrompt } from './common.js';

let filtered = [];
let filter = 'Todas';
let category = store.get('texCategory', '');

export function setupTexturesTab() {
  const texlib = app.texlib;
  $('#btnLoadTextures').onclick = () => { texlib.startIndex(); renderStatus(); };
  $('#btnCancelTextures').onclick = () => texlib.cancelIndex();
  $('#btnTexReindex').onclick = () => { texlib.startIndex(); renderStatus(); };
  texlib.addEventListener('progress', renderStatus);
  let lastRows = 0;
  texlib.addEventListener('thumbs', () => {
    const bg = texlib.bg;
    const el = $('#texThumbs');
    el.hidden = !bg?.running;
    if (bg?.running) el.textContent = `miniaturas ${Math.round(100 * bg.done / Math.max(1, bg.total))}%`;
    if (performance.now() - lastRows > 2500) { lastRows = performance.now(); renderTexRows(); }
  });
  texlib.addEventListener('state', () => {
    renderStatus();
    if (texlib.state === 'ready') {
      fillCategories();
      filterTextures();
      if (texlib.progress.total) toast(`${plural(texlib.items.length, 'textura pronta', 'texturas prontas')} para usar`);
    }
  });
  const chips = ['Todas', 'Favoritas', 'Recentes', 'No projeto', 'SA-MP'];
  const box = $('#texChips');
  box.innerHTML = chips.map(c => `<button type="button" class="chip${c === filter ? ' active' : ''}" data-f="${esc(c)}">${esc(c)}</button>`).join('');
  box.onclick = (e) => {
    const b = e.target.closest('.chip'); if (!b) return;
    filter = b.dataset.f;
    $$('.chip', box).forEach(x => x.classList.toggle('active', x === b));
    filterTextures();
  };
  $('#texCategory').onchange = () => { category = $('#texCategory').value; store.set('texCategory', category); filterTextures(); };
  let t;
  $('#texSearch').addEventListener('input', () => { clearTimeout(t); t = setTimeout(filterTextures, 150); });
  const list = $('#texList');
  // Rolagem e redimensionamento: no máximo uma vez por quadro e só quando as linhas visíveis mudam
  let rowsRaf = 0;
  const scheduleRows = () => {
    if (rowsRaf) return;
    rowsRaf = requestAnimationFrame(() => { rowsRaf = 0; renderTexRows(false); });
  };
  list.addEventListener('scroll', scheduleRows);
  new ResizeObserver(scheduleRows).observe(list);
  list.addEventListener('click', async (e) => {
    const tile = e.target.closest('.tile'); if (!tile) return;
    const item = texlib.byKey.get(tile.dataset.key); if (!item) return;
    if (e.target.closest('[data-act="alias"]')) {
      const aliases = store.get('texFavAliases', {});
      const cur = aliases[item.key] || '';
      const val = await showPrompt({
        title: 'Apelido da textura',
        desc: `Defina um apelido para a textura ${item.name} (${item.txd}):`,
        value: cur,
        placeholder: 'Ex: Concreto escuro calçada'
      });
      if (val !== null) {
        if (val) {
          aliases[item.key] = val;
          const favs = new Set(store.get('texFavs', []));
          favs.add(item.key);
          store.set('texFavs', [...favs]);
        } else {
          delete aliases[item.key];
        }
        store.set('texFavAliases', aliases);
        renderTexRows();
      }
      return;
    }
    if (e.target.closest('.fav')) { toggleFav(item.key); return; }
    applyLibraryTexture(item);
  });
  app.editor.addEventListener('selection', updateTarget);
  app.editor.addEventListener('slot', updateTarget);
  app.on('project-change', () => { if (filter === 'No projeto') filterTextures(); else renderTexRows(); });
  // Abre o índice salvo, se existir (sem precisar clicar). Na primeira vez, já começa sozinho.
  texlib.tryCache().then(ok => {
    renderStatus();
    if (ok) { fillCategories(); filterTextures(); }
    else if (store.get('autoIndexTextures', true)) setTimeout(() => { if (texlib.state === 'none') texlib.startIndex(); }, 1500);
  });
  renderStatus();
}

function fillCategories() {
  const items = app.texlib.items;
  const sel = $('#texCategory');
  const cats = [...TEXTURE_CATEGORIES];
  for (const c of new Set(items.map(i => i.category))) if (!cats.includes(c)) cats.push(c);
  sel.innerHTML = `<option value="">Todas as categorias (${items.length.toLocaleString(uiLocale())})</option>` +
    cats.map(c => [c, items.filter(i => i.category === c).length]).filter(([, n]) => n)
      .map(([c, n]) => `<option value="${esc(c)}">${esc(c)} (${n.toLocaleString(uiLocale())})</option>`).join('');
  if (![...sel.options].some(o => o.value === category)) category = '';
  sel.value = category;
}

function renderStatus() {
  const texlib = app.texlib;
  const st = texlib.state;
  const loading = st === 'loading';
  // Durante uma atualização a lista antiga continua usável
  const usable = texlib.items.length > 0;
  $('#texBrowser').hidden = !usable;
  $('#texStatus').hidden = st === 'ready' || (usable && !loading);
  $('#texStatus').classList.toggle('compact', usable);
  $('#texBar').hidden = !loading;
  $('#btnLoadTextures').hidden = loading;
  $('#btnCancelTextures').hidden = !loading;
  const { done, total } = texlib.progress;
  const text = $('#texStatusText');
  if (loading) {
    $('#texBarFill').style.width = (100 * done / Math.max(1, total)) + '%';
    text.textContent = `Lendo as texturas do jogo e preparando as miniaturas: ${done.toLocaleString(uiLocale())} de ${total.toLocaleString(uiLocale())} arquivos. Pode continuar editando. Só acontece uma vez.`;
  } else if (st === 'error') text.textContent = 'Não consegui ler as texturas. Tente de novo.';
  else text.textContent = 'Para trocar texturas, o editor lista as texturas do jogo e guarda miniaturas no disco. Roda em segundo plano e só é preciso fazer uma vez.';
}

function toggleFav(key) {
  const favs = new Set(store.get('texFavs', []));
  favs.has(key) ? favs.delete(key) : favs.add(key);
  store.set('texFavs', [...favs]);
  if (filter === 'Favoritas') filterTextures(); else renderTexRows();
}

export function filterTextures() {
  const texlib = app.texlib;
  if (!texlib.items.length) return;
  const q = $('#texSearch').value.trim().toLowerCase();
  const aliases = store.get('texFavAliases', {});
  let list = texlib.items;
  if (filter === 'Favoritas') { const f = new Set(store.get('texFavs', [])); list = list.filter(i => f.has(i.key)); }
  else if (filter === 'Recentes') { const r = store.get('texRecent', []); const order = new Map(r.map((k, i) => [k, i])); list = list.filter(i => order.has(i.key)).sort((a, b) => order.get(a.key) - order.get(b.key)); }
  else if (filter === 'No projeto') {
    const used = new Set();
    for (const o of app.project.objects) for (const m of o.materials || []) if (!isText(m) && m.texture) used.add(String(m.txd).toLowerCase() + '/' + String(m.texture).toLowerCase());
    list = list.filter(i => used.has(i.key));
  } else if (filter === 'SA-MP') list = list.filter(i => i.samp);
  if (category) list = list.filter(i => i.category === category);
  if (q) {
    const words = q.split(/\s+/);
    list = list.filter(i => {
      const alias = (aliases[i.key] || '').toLowerCase();
      const name = i.name.toLowerCase();
      const txd = i.txd.toLowerCase();
      return words.every(w => alias.includes(w) || name.includes(w) || txd.includes(w));
    });
  }
  filtered = list;
  $('#texMeta').textContent = plural(list.length, 'textura', 'texturas');
  $('#texList').scrollTop = 0;
  renderTexRows();
}

function layout() {
  const list = $('#texList');
  const tileW = Math.max(60, (list.clientWidth - 20 - 12) / 3);
  return { rowH: Math.round(tileW + 44), cols: 3 };
}

// Textura atual do primeiro índice escolhido (para marcar na lista)
function activeKey() {
  const o = app.editor.selectedObjects()[0]?.item;
  const i = app.editor.matSel[0];
  if (!o || i === undefined) return null;
  const m = (o.materials || []).find(x => x.index === i);
  return m && !isText(m) && m.texture && m.texture !== 'none' ? String(m.txd).toLowerCase() + '/' + String(m.texture).toLowerCase() : null;
}

let texRowsKey = '';

// force = false: não recria os blocos se o trecho visível e o número de colunas continuam iguais
export function renderTexRows(force = true) {
  const texlib = app.texlib;
  const list = $('#texList');
  if (!list || list.offsetParent === null || !texlib.items.length) return;
  const { rowH, cols } = layout();
  const inner = list.firstElementChild;
  const rows = Math.ceil(filtered.length / cols);
  inner.style.height = rows * rowH + 'px';
  const start = Math.max(0, Math.floor(list.scrollTop / rowH) - 2);
  const end = Math.min(rows, Math.ceil((list.scrollTop + list.clientHeight) / rowH) + 2);
  const key = `${start}:${end}:${cols}:${rowH}:${filtered.length}`;
  if (force === false && key === texRowsKey) return;
  texRowsKey = key;
  const favs = new Set(store.get('texFavs', []));
  const aliases = store.get('texFavAliases', {});
  const active = activeKey();
  const frag = document.createDocumentFragment();
  const keys = [];
  for (let r = start; r < end; r++) {
    const row = document.createElement('div');
    row.className = 'tile-row';
    row.style.top = r * rowH + 'px';
    for (let c = 0; c < cols; c++) {
      const item = filtered[r * cols + c];
      if (!item) break;
      keys.push(item.key);
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'tile' + (item.key === active ? ' active' : '');
      tile.dataset.key = item.key;
      const alias = aliases[item.key];
      const isFav = favs.has(item.key);
      // Várias linhas: cada uma traduzida aqui (o título inteiro não é uma chave)
      tile.title = [alias ? `[${alias}]` : '', item.name, t('TXD: {0} (modelo {1})', item.txd, item.model),
        item.alpha ? t('{0}×{1}, com transparência', item.w, item.h) : `${item.w}×${item.h}`, t(item.category)].filter(Boolean).join('\n');
      const url = texlib.thumbUrl(item.txd, item.name);
      const displayName = alias || item.name;
      const displaySub = alias ? `${item.name} (${item.txd})` : item.txd;
      tile.innerHTML = `${url ? `<img src="${url}" alt="" decoding="async">` : '<span class="tile-ph"></span>'}
        <div class="tile-name" title="${esc(item.name)}">${esc(displayName)}</div>
        <div class="tile-sub">${esc(displaySub)}</div>
        <span class="tile-actions${isFav || alias ? ' show' : ''}">
          <span class="btn-alias${alias ? ' has-alias' : ''}" role="button" data-act="alias" title="${alias ? 'Apelido: ' + esc(alias) : 'Definir apelido'}"><svg><use href="#i-edit"/></svg></span>
          <span class="fav${isFav ? ' on' : ''}" role="button" aria-label="Favoritar textura"><svg><use href="#i-star"/></svg></span>
        </span>`;
      if (!url) {
        const ph = tile.firstElementChild;
        texlib.thumb(item.txd, item.name, (u) => {
          if (!u || !ph.isConnected) return;
          const img = document.createElement('img'); img.src = u; img.alt = ''; ph.replaceWith(img);
        });
      }
      row.appendChild(tile);
    }
    frag.appendChild(row);
  }
  inner.replaceChildren(frag);
  texlib.keepThumbs(keys);
}

export function updateTarget() {
  const el = $('#texTarget');
  if (!el) return;
  const objs = app.editor.selectedObjects();
  const idx = app.editor.matSel;
  if (objs.length && idx.length) {
    el.className = 'tex-target ready';
    el.innerHTML = `${idx.length > 1 ? 'Aplicar nos índices' : 'Aplicar no índice'} <b>${idx.join(', ')}</b> de ${objs.length > 1 ? plural(objs.length, 'objeto', 'objetos') : esc(modelLabel(objs[0].item.model))}.`;
  } else if (objs.length) {
    el.className = 'tex-target';
    el.innerHTML = 'Escolha os índices no inspetor (à direita) ou use a ferramenta Textura (T) e clique na parte do objeto.';
  } else {
    el.className = 'tex-target';
    el.innerHTML = 'Selecione um objeto do projeto para trocar a textura dele.';
  }
  renderTexRows();
}

export function applyLibraryTexture(item) {
  const ed = app.editor;
  const objs = ed.selectedObjects();
  if (!objs.length) { toast('Selecione um objeto do projeto primeiro', 'warn'); return; }
  let indices = ed.matSel;
  if (!indices.length) {
    const n = ed.slotInfo(objs[0].item.model).length;
    if (n <= 1) { indices = [0]; ed.setMatSel([0]); }
    else { toast(`Esse objeto tem ${n} índices de material. Marque quais vão receber a textura no inspetor, ou use a ferramenta Textura (T) e clique na parte.`, 'warn', 6000); return; }
  }
  const n = ed.applyTexture(objs.map(s => s.uid), indices, { model: item.model, txd: item.txd, texture: item.name });
  const rec = store.get('texRecent', []).filter(k => k !== item.key);
  rec.unshift(item.key);
  store.set('texRecent', rec.slice(0, 80));
  const where = indices.join(', ');
  if (indices.length > 1) toast(n > 1 ? `${item.name} aplicada nos índices ${where} de ${plural(n, 'objeto', 'objetos')}` : `${item.name} aplicada nos índices ${where}`);
  else toast(n > 1 ? `${item.name} aplicada no índice ${where} de ${plural(n, 'objeto', 'objetos')}` : `${item.name} aplicada no índice ${where}`);
}
