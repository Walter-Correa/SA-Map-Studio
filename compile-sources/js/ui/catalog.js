// Objects tab: catalog with categories (Furniture, Beach, Buildings...), origin (SA-MP, Los Santos...),
// favorites, recents and thumbnails stored on disk.
import { OBJECT_CATEGORIES, REGIONS } from '../world/categories.js';
import { getSkinLabel } from '../world/actors.js';
import { PREDEFINED_PICKUPS } from '../world/pickups.js';
import { app, $, $$, esc, plural, store, showPrompt } from './common.js';

import { uiLocale } from './i18n.js';
const ROW_H = 80;
let catalog = [];
let filtered = [];
let category = store.get('catCategory', ''), region = store.get('catRegion', ''), shortcut = 'Todos';

export function setupCatalog() {
  catalog = app.gd.catalog();
  // Categories with counts (LOD goes last)
  const count = (key, v) => catalog.filter(c => c[key] === v).length;
  const cats = [...OBJECT_CATEGORIES];
  for (const c of new Set(catalog.map(c => c.category))) if (!cats.includes(c)) cats.push(c);
  cats.sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const catSel = $('#catalogCategory');
  catSel.innerHTML = `<option value="">Categorias</option>` +
    cats.map(c => [c, count('category', c)]).filter(([, n]) => n).map(([c, n]) => `<option value="${esc(c)}">${esc(c)} (${n.toLocaleString(uiLocale())})</option>`).join('');
  const regs = [...REGIONS];
  for (const r of new Set(catalog.map(c => c.region))) if (!regs.includes(r)) regs.push(r);
  const regSel = $('#catalogRegion');
  regSel.innerHTML = '<option value="">Origens</option>' +
    regs.map(r => [r, count('region', r)]).filter(([, n]) => n).map(([r, n]) => `<option value="${esc(r)}">${esc(r)} (${n.toLocaleString(uiLocale())})</option>`).join('');
  if (![...catSel.options].some(o => o.value === category)) category = '';
  if (![...regSel.options].some(o => o.value === region)) region = '';
  catSel.value = category; regSel.value = region;
  catSel.onchange = () => { category = catSel.value; store.set('catCategory', category); filterCatalog(); };
  regSel.onchange = () => { region = regSel.value; store.set('catRegion', region); filterCatalog(); };

  const box = $('#catalogChips');
  box.innerHTML = ['Todos', 'Favoritos', 'Recentes', 'Veículos', 'Actors', 'Pickups'].map(c => `<button type="button" class="chip${c === shortcut ? ' active' : ''}" data-cat="${c}">${c}</button>`).join('');
  box.onclick = (e) => {
    const b = e.target.closest('.chip'); if (!b) return;
    shortcut = b.dataset.cat;
    $$('.chip', box).forEach(x => x.classList.toggle('active', x === b));
    filterCatalog();
  };
  let t;
  $('#catalogSearch').addEventListener('input', () => { clearTimeout(t); t = setTimeout(filterCatalog, 120); });
  const list = $('#catalogList');
  // Scrolling and resizing: at most once per frame and only when the visible rows change
  let rowsRaf = 0;
  const scheduleRows = () => {
    if (rowsRaf) return;
    rowsRaf = requestAnimationFrame(() => { rowsRaf = 0; renderCatalogRows(false); });
  };
  list.addEventListener('scroll', scheduleRows);
  new ResizeObserver(scheduleRows).observe(list);
  setupHoverPreview(list);
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
    if (app.editor.placing?.model === id) {
      app.editor.cancelPlacing();
    } else {
      const isPickup = shortcut === 'Pickups' || PREDEFINED_PICKUPS.some(p => p.model === id && (category === 'Pickups' || category === 'Placas e sinalização'));
      app.editor.startPlacing(id, isPickup ? { kind: 'pickups' } : {});
    }
  });
  app.editor.addEventListener('placing', renderCatalogRows);
  app.editor.addEventListener('placed', (e) => {
    const rec = store.get('recent', []).filter(id => id !== e.detail.model);
    rec.unshift(e.detail.model);
    store.set('recent', rec.slice(0, 60));
  });

  // Thumbnails: prepares all in the background
  const thumbs = app.thumbs;
  let inUse = null, inUseAt = 0;
  thumbs.releasable = (id) => {
    // Models the map or the project are using stay in memory
    if (!inUse || performance.now() - inUseAt > 1000) {
      inUse = new Set(app.project.objects.map(o => o.model));
      for (const idx of app.streamer.shown.keys()) inUse.add(app.gd.instances[idx]?.id);
      for (const id2 of app.streamer.queue) inUse.add(id2);
      inUseAt = performance.now();
    }
    return !inUse.has(id) && app.editor.placing?.model !== id;
  };
  filterCatalog();
}

// Hover preview: a big thumbnail in the middle of the screen while the mouse is over an item of the list.
// It closes when the mouse leaves the item, on click, on scroll and when the list is rebuilt.
let hoverPop = null, hoverRow = null, hoverTimer = 0, hoverToken = 0, hoverUrl = '';

function hidePreview() {
  clearTimeout(hoverTimer);
  hoverRow = null;
  hoverToken++;
  if (hoverPop) hoverPop.hidden = true;
  if (hoverUrl) { URL.revokeObjectURL(hoverUrl); hoverUrl = ''; }
}

function showPreview(row) {
  if (!hoverPop) {
    hoverPop = document.createElement('div');
    hoverPop.className = 'thumb-pop';
    hoverPop.hidden = true;
    hoverPop.innerHTML = '<img alt=""><div class="thumb-pop-title"></div><div class="thumb-pop-sub"></div>';
    document.body.appendChild(hoverPop);
  }
  const id = +row.dataset.id;
  const token = ++hoverToken;
  const img = hoverPop.querySelector('img');
  const small = row.querySelector('img.thumb');
  img.src = small && small.getAttribute('src') ? small.getAttribute('src') : '';
  hoverPop.querySelector('.thumb-pop-title').textContent = row.querySelector('.row-name')?.textContent || '';
  hoverPop.querySelector('.thumb-pop-sub').textContent = row.querySelector('.row-sub')?.textContent || '';
  hoverPop.hidden = false;
  // The saved thumbnail is small: draw the model again, bigger, and swap it in when ready
  app.thumbs.renderLarge(id).then((url) => {
    if (!url) return;
    if (token !== hoverToken) { URL.revokeObjectURL(url); return; }
    if (hoverUrl) URL.revokeObjectURL(hoverUrl);
    hoverUrl = url;
    img.src = url;
  });
}

function setupHoverPreview(list) {
  list.addEventListener('mouseover', (e) => {
    const row = e.target.closest('.row');
    if (row === hoverRow) return;
    hidePreview();
    if (!row) return;
    hoverRow = row;
    hoverTimer = setTimeout(() => { if (hoverRow === row && row.isConnected) showPreview(row); }, 180);
  });
  list.addEventListener('mouseleave', hidePreview);
  list.addEventListener('mousedown', hidePreview);
  list.addEventListener('click', hidePreview);
  list.addEventListener('wheel', hidePreview, { passive: true });
  list.addEventListener('scroll', hidePreview, { passive: true });
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
  else if (shortcut === 'Pickups') {
    const pSet = new Set(PREDEFINED_PICKUPS.map(p => p.model));
    list = list.filter(c => pSet.has(c.id));
  }
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
      const pk = PREDEFINED_PICKUPS.find(p => p.model === c.id);
      const pkName = pk ? pk.name.toLowerCase() : '';
      return words.every(w => alias.includes(w) || c.name.includes(w) || gName.includes(w) || cat.includes(w) || sLabel.includes(w) || pkName.includes(w));
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

let catalogRowsKey = '';

// force = false: does not recreate the rows if the visible slice of the list is still the same
export function renderCatalogRows(force = true) {
  const list = $('#catalogList');
  if (!list || list.offsetParent === null) return;
  const inner = list.firstElementChild;
  const start = Math.max(0, Math.floor(list.scrollTop / ROW_H) - 3);
  const end = Math.min(filtered.length, Math.ceil((list.scrollTop + list.clientHeight) / ROW_H) + 3);
  const key = `${start}:${end}:${filtered.length}`;
  if (force === false && key === catalogRowsKey) return;
  catalogRowsKey = key;
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
    const pkDef = PREDEFINED_PICKUPS.find(p => p.model === c.id);
    const baseLabel = c.def.type === 'peds' ? getSkinLabel(c.id) : (c.def.type === 'cars' && c.def.gameName ? c.def.gameName : (pkDef ? pkDef.name : c.name));
    const alias = aliases[c.id];
    const displayTitle = alias || baseLabel;
    const catLabel = pkDef ? 'Pickups' : c.category;
    const displaySub = alias ? `${esc(baseLabel)} · ${c.id} · ${esc(catLabel)}` : `${c.id} · ${esc(catLabel)}`;
    const known = (c.def?.type === 'peds' && (c.id === 0 || c.id === '0')) ? '/thumbs/obj/0.webp?v=4' : app.thumbs.url(c.id);
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

