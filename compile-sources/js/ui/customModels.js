// Models of the project's own: a .dff (and, if it has them, a .txd and a .col) imported from files. Each one gets an id of the game's
// model range that nothing uses and becomes an ordinary object that can be placed, moved and textured. The files live on the server
// (one folder per asset) and go into the mod when an object uses the model.
import { app, $, esc, toast, showConfirm } from './common.js';
import { makeCustomModel } from '../editor/project.js';
import { setupCatalog } from './catalog.js';

export const customName = (id) => 'samsp_c' + id;
const newAsset = () => Array.from(crypto.getRandomValues(new Uint8Array(8))).map(b => b.toString(16).padStart(2, '0')).join('');
const models = () => app.project.customModels || (app.project.customModels = []);

// An id of the game's range that no model uses and that has no thumbnail saved for another model (the SA-MP ones above 18630 do)
function freeId() {
  const taken = new Set(models().map(m => m.id));
  for (let id = 18630; id >= 12000; id--) {
    if (app.gd.models.has(id) || taken.has(id) || app.thumbs?.have.has(id) || app.thumbs?.stale.has(id)) continue;
    return id;
  }
  return 0;
}

// Puts the project's models in the game's tables, so the editor draws them like any other
export function registerCustomModels() {
  const gd = app.gd;
  for (const [id, def] of [...gd.models]) {
    if (def.source !== 'samsp-custom') continue;
    gd.models.delete(id); gd.modelByName.delete(def.model);
    gd.entries.delete(def.model + '.dff'); gd.entries.delete(def.model + '.txd');
    app.models?.evict?.(new Set(), 0);
  }
  for (const m of app.project.customModels || []) {
    const name = customName(m.id);
    const def = { id: m.id, model: name, txd: m.txd ? name : 'generic', name: m.label, type: 'objs', drawDist: m.drawDist, flags: 0, source: 'samsp-custom' };
    gd.models.set(m.id, def);
    gd.modelByName.set(name, def);
    gd.entries.set(name + '.dff', { img: `__sp/${m.asset}/${m.dff}`, offset: 0, size: 0 });
    if (m.txd) gd.entries.set(name + '.txd', { img: `__sp/${m.asset}/${m.txd}`, offset: 0, size: 0 });
  }
  if (app.thumbs) app.thumbs.isCustom = (id) => app.gd.models.get(id)?.source === 'samsp-custom';
}

async function upload(asset, file) {
  const r = await fetch(`/api/sp/asset?asset=${asset}&name=${encodeURIComponent(file.name)}`, { method: 'POST', body: await file.arrayBuffer() });
  const j = await r.json();
  if (!j.ok) throw new Error(j.error || 'erro');
  return file.name.replace(/[^\w\-. ()]+/g, '_');
}

function renderList() {
  const ul = $('#cmList');
  ul.replaceChildren();
  for (const m of models()) {
    const li = document.createElement('li');
    const name = document.createElement('span');
    name.className = 'sp-mod-name';
    name.textContent = `${m.label} · ${m.id}`;
    const tags = document.createElement('span');
    tags.className = 'cm-tags';
    tags.textContent = ['DFF', m.txd ? 'TXD' : '', m.col ? 'COL' : ''].filter(Boolean).join(' ');
    const place = document.createElement('button');
    place.type = 'button'; place.classList.add('btn', 'small'); place.dataset.cmPlace = m.id;
    place.append('Colocar no mapa');
    const del = document.createElement('button');
    del.type = 'button'; del.classList.add('btn', 'small', 'danger'); del.dataset.cmDel = m.id;
    del.innerHTML = '<svg><use href="#i-trash"/></svg>';
    del.append('Remover');
    li.append(name, tags, place, del);
    ul.append(li);
  }
  if (!models().length) ul.innerHTML = '<li class="ol-empty">Nenhum modelo importado ainda.</li>';
}

export function initCustomModels() {
  const dlg = $('#dlgModels');
  $('#btnModels').onclick = () => { renderList(); dlg.showModal(); };
  $('#cmClose').onclick = () => dlg.close();
  const form = $('#cmForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const dff = $('#cmDff').files[0], txd = $('#cmTxd').files[0], col = $('#cmCol').files[0];
    if (!dff) { toast('Escolha o arquivo .dff do modelo', 'warn'); return; }
    const id = freeId();
    if (!id) { toast('Não há mais ids livres para modelos', 'error'); return; }
    $('#cmAdd').disabled = true;
    try {
      const asset = newAsset();
      const model = makeCustomModel({
        id, asset, label: ($('#cmName').value || dff.name.replace(/\.dff$/i, '')).trim().slice(0, 40),
        dff: await upload(asset, dff), txd: txd ? await upload(asset, txd) : '', col: col ? await upload(asset, col) : '',
        drawDist: parseFloat($('#cmDist').value) || 300,
      });
      models().push(model);
      app.project.touch('customModels');
      registerCustomModels();
      app.thumbs?.custom?.delete(id); app.thumbs?.failed.delete(id);
      setupCatalog();
      form.reset(); $('#cmDist').value = 300;
      renderList();
      toast('Modelo importado');
    } catch (err) {
      toast(String(err.message || err), 'error', 6000);
    } finally { $('#cmAdd').disabled = false; }
  });
  $('#cmList').addEventListener('click', async (e) => {
    const place = e.target.closest('[data-cm-place]'), del = e.target.closest('[data-cm-del]');
    if (place) { dlg.close(); app.editor.startPlacing(+place.dataset.cmPlace); return; }
    if (!del) return;
    const id = +del.dataset.cmDel, m = models().find(x => x.id === id);
    if (!m) return;
    const using = app.project.objects.filter(o => o.model === id).length;
    if (!await showConfirm(using ? `Remover o modelo "${m.label}"? ${using} objeto(s) do projeto que o usam também serão apagados.` : `Remover o modelo "${m.label}"?`, { confirmText: 'Remover', danger: true })) return;
    if (using) app.project.deleteItems('Apagar', app.project.objects.filter(o => o.model === id).map(o => o.uid));
    fetch(`/api/sp/asset?delete=${m.asset}`, { method: 'POST' }).catch(() => {});
    app.project.customModels = models().filter(x => x.id !== id);
    app.project.touch('customModels');
    registerCustomModels();
    setupCatalog();
    renderList();
  });
  app.on('project', () => { registerCustomModels(); setupCatalog(); });
  registerCustomModels();
}
