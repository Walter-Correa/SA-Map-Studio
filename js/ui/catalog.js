// Aba Objetos: catálogo com categorias (Móveis, Praia, Prédios...), origem (SA-MP, Los Santos...),
// favoritos, recentes e miniaturas guardadas no disco.
import { OBJECT_CATEGORIES, REGIONS } from '../world/categories.js';
import { getSkinLabel } from '../world/actors.js';
import { app, $, $$, esc, plural, store, showPrompt } from './common.js';

const ROW_H = 80;
let catalog = [];
let filtered = [];
let category = store.get('catCategory', ''), region = store.get('catRegion', ''), shortcut = 'Todos';

export function setupCatalog() {
  catalog = app.gd.catalog();
  // Categorias com contagem (LOD fica no fim)
  const count = (key, v) => catalog.filter(c => c[key] === v).length;
  const cats = [...OBJECT_CATEGORIES];
  for (const c of new Set(catalog.map(c => c.category))) if (!cats.includes(c)) cats.push(c);
  cats.sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const catSel = $('#catalogCategory');
  catSel.innerHTML = `<option value="">Todas as categorias (${catalog.filter(c => !c.isLod).length.toLocaleString('pt-BR')})</option>` +
    cats.map(c => [c, count('category', c)]).filter(([, n]) => n).map(([c, n]) => `<option value="${esc(c)}">${esc(c)} (${n.toLocaleString('pt-BR')})</option>`).join('');
  const regs = [...REGIONS];
  for (const r of new Set(catalog.map(c => c.region))) if (!regs.includes(r)) regs.push(r);
  const regSel = $('#catalogRegion');
  regSel.innerHTML = '<option value="">Qualquer origem</option>' +
    regs.map(r => [r, count('region', r)]).filter(([, n]) => n).map(([r, n]) => `<option value="${esc(r)}">${esc(r)} (${n.toLocaleString('pt-BR')})</option>`).join('');
  if (![...catSel.options].some(o => o.value === category)) category = '';
  if (![...regSel.options].some(o => o.value === region)) region = '';
  catSel.value = category; regSel.value = region;
  catSel.onchange = () => { category = catSel.value; store.set('catCategory', category); filterCatalog(); };
  regSel.onchange = () => { region = regSel.value; store.set('catRegion', region); filterCatalog(); };

  const box = $('#catalogChips');
  box.innerHTML = ['Todos', 'Favoritos', 'Recentes', 'Veículos', 'Actors'].map(c => `<button type="button" class="chip${c === shortcut ? ' active' : ''}" data-cat="${c}">${c}</button>`).join('');
  box.onclick = (e) => {
    const b = e.target.closest('.chip'); if (!b) return;
    shortcut = b.dataset.cat;
    $$('.chip', box).forEach(x => x.classList.toggle('active', x === b));
    filterCatalog();
  };
  let t;
  $('#catalogSearch').addEventListener('input', () => { clearTimeout(t); t = setTimeout(filterCatalog, 120); });
  const list = $('#catalogList');
  list.addEventListener('scroll', renderCatalogRows);
  new ResizeObserver(renderCatalogRows).observe(list);
  list.addEventListener('click', async (e) => {
    const row = e.target.closest('.row');
    if (!row) return;
    const id = +row.dataset.id;
    if (e.target.closest('[data-act="alias"]')) {
      const aliases = store.get('favAliases', {});
      const c = catalog.find(item => item.id === id);
      const cur = aliases[id] || '';
      const val = await showPrompt({
        title: 'Apelido do objeto',
        desc: `Defina um apelido para ${c ? c.name : 'o objeto'} (ID ${id}):`,
        value: cur,
        placeholder: 'Ex: Minha parede preferida'
      });
      if (val !== null) {
        if (val) {
          aliases[id] = val;
          const favs = new Set(store.get('favs', []));
          favs.add(id);
          store.set('favs', [...favs]);
        } else {
          delete aliases[id];
        }
        store.set('favAliases', aliases);
        renderCatalogRows();
      }
      return;
    }
    if (e.target.closest('.fav')) { toggleFav(id); return; }
    if (app.editor.placing?.model === id) app.editor.cancelPlacing(); else app.editor.startPlacing(id);
  });
  app.editor.addEventListener('placing', renderCatalogRows);
  app.editor.addEventListener('placed', (e) => {
    const rec = store.get('recent', []).filter(id => id !== e.detail.model);
    rec.unshift(e.detail.model);
    store.set('recent', rec.slice(0, 60));
  });

  // Miniaturas: prepara todas em segundo plano
  const thumbs = app.thumbs;
  let inUse = null, inUseAt = 0;
  thumbs.releasable = (id) => {
    // Modelos que o mapa ou o projeto estão usando ficam na memória
    if (!inUse || performance.now() - inUseAt > 1000) {
      inUse = new Set(app.project.objects.map(o => o.model));
      for (const idx of app.streamer.shown.keys()) inUse.add(app.gd.instances[idx]?.id);
      for (const id2 of app.streamer.queue) inUse.add(id2);
      inUseAt = performance.now();
    }
    return !inUse.has(id) && app.editor.placing?.model !== id;
  };
  $('#btnThumbs').onclick = () => {
    const ids = catalog.filter(c => !c.isLod).map(c => c.id);
    thumbs.startBackground(ids);
    if (!thumbs.background.total) $('#thumbText').textContent = 'Todas as miniaturas já estão prontas';
  };
  $('#btnThumbsStop').onclick = () => thumbs.stopBackground();
  thumbs.addEventListener('progress', renderThumbProgress);
  filterCatalog();
}

function renderThumbProgress() {
  const b = app.thumbs.background;
  $('#thumbProgress').hidden = !b.running;
  $('#btnThumbs').hidden = b.running;
  if (b.running) {
    $('#thumbBar').style.width = (100 * b.done / Math.max(1, b.total)) + '%';
    $('#thumbText').textContent = `Miniaturas: ${b.done.toLocaleString('pt-BR')} de ${b.total.toLocaleString('pt-BR')}`;
  }
}

function toggleFav(id) {
  const favs = new Set(store.get('favs', []));
  favs.has(id) ? favs.delete(id) : favs.add(id);
  store.set('favs', [...favs]);
  if (shortcut === 'Favoritos') filterCatalog(); else renderCatalogRows();
}

export function filterCatalog() {
  const q = $('#catalogSearch').value.trim().toLowerCase();
  const favs = new Set(store.get('favs', []));
  const aliases = store.get('favAliases', {});
  const recent = store.get('recent', []);
  let list = catalog;
  if (shortcut === 'Favoritos') list = list.filter(c => favs.has(c.id));
  else if (shortcut === 'Recentes') { const order = new Map(recent.map((id, i) => [id, i])); list = list.filter(c => order.has(c.id)).sort((a, b) => order.get(a.id) - order.get(b.id)); }
  else if (shortcut === 'Veículos') list = list.filter(c => c.def?.type === 'cars' || c.category === 'Veículos');
  else if (shortcut === 'Actors') list = list.filter(c => c.def?.type === 'peds' || c.category === 'Actors (Personagens)');
  if (category) list = list.filter(c => c.category === category);
  if (region) list = list.filter(c => c.region === region);
  if (q) {
    const asNum = /^\d+$/.test(q) ? q : null;
    const words = q.split(/\s+/);
    list = list.filter(c => {
      if (asNum && String(c.id).startsWith(asNum)) return true;
      const alias = (aliases[c.id] || '').toLowerCase();
      const gName = (c.def.gameName || '').toLowerCase();
      const cat = c.category.toLowerCase();
      const sLabel = (c.def.type === 'peds' ? getSkinLabel(c.id) : '').toLowerCase();
      return words.every(w => alias.includes(w) || c.name.includes(w) || gName.includes(w) || cat.includes(w) || sLabel.includes(w));
    });
    if (asNum) list = [...list].sort((a, b) => (String(b.id) === asNum) - (String(a.id) === asNum));
  } else if (!category && shortcut === 'Todos') {
    list = list.filter(c => !c.isLod);
  }
  filtered = list;
  $('#catalogMeta').textContent = plural(list.length, 'objeto', 'objetos');
  $('#catalogList .vlist-inner').style.height = list.length * ROW_H + 'px';
  $('#catalogList').scrollTop = 0;
  renderCatalogRows();
}

export function renderCatalogRows() {
  const list = $('#catalogList');
  if (!list || list.offsetParent === null) return;
  const inner = list.firstElementChild;
  const start = Math.max(0, Math.floor(list.scrollTop / ROW_H) - 3);
  const end = Math.min(filtered.length, Math.ceil((list.scrollTop + list.clientHeight) / ROW_H) + 3);
  const favs = new Set(store.get('favs', []));
  const aliases = store.get('favAliases', {});
  const placingId = app.editor.placing?.model;
  const frag = document.createDocumentFragment();
  const visible = [];
  for (let i = start; i < end; i++) {
    const c = filtered[i];
    visible.push(c.id);
    const row = document.createElement('div');
    row.className = 'row' + (placingId === c.id ? ' active' : '');
    row.style.top = i * ROW_H + 'px';
    row.dataset.id = c.id;
    const baseLabel = c.def.type === 'peds' ? getSkinLabel(c.id) : (c.def.type === 'cars' && c.def.gameName ? c.def.gameName : c.name);
    const alias = aliases[c.id];
    const displayTitle = alias || baseLabel;
    const displaySub = alias ? `${esc(baseLabel)} · ${c.id} · ${esc(c.category)}` : `${c.id} · ${esc(c.category)}`;
    const known = app.thumbs.url(c.id);
    row.innerHTML = `<img class="thumb${known ? '' : ' empty'}" alt="" width="72" height="72" ${known ? `src="${known}"` : ''} decoding="async">
      <div class="row-text">
        <div class="row-name" title="${esc(baseLabel)}">${esc(displayTitle)}</div>
        <div class="row-sub">${displaySub}</div>
      </div>
      <div class="row-actions">
        <button type="button" class="btn-alias${alias ? ' has-alias' : ''}" data-act="alias" title="${alias ? 'Apelido: ' + esc(alias) : 'Definir apelido'}" aria-label="Definir apelido"><svg><use href="#i-edit"/></svg></button>
        <button type="button" class="fav${favs.has(c.id) ? ' on' : ''}" title="Favoritar" aria-label="Favoritar ${esc(c.name)}"><svg><use href="#i-star"/></svg></button>
      </div>`;
    if (!known) {
      const img = row.firstElementChild;
      app.thumbs.request(c.id, (url) => { if (url && img.isConnected) { img.src = url; img.classList.remove('empty'); } });
    }
    frag.appendChild(row);
  }
  inner.replaceChildren(frag);
  app.thumbs.cancelExcept(visible);
}

