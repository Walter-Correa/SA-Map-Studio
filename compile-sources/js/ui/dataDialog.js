// Singleplayer game data of the mod: vehicle handling (merged into handling.cfg by the modloader), the view distance of single models
// and the textures replaced in the whole map. The mod only carries what was changed.
import { app, $, esc, toast } from './common.js';

const FIELDS = [
  ['Massa (kg)', 'number'], ['Massa de giro', 'number'], ['Arrasto', 'number'],
  ['Centro de massa X', 'number'], ['Centro de massa Y', 'number'], ['Centro de massa Z', 'number'],
  ['Submersão (%)', 'number'], ['Tração', 'number'], ['Perda de tração', 'number'], ['Balanço da tração', 'number'],
  ['Marchas', 'number'], ['Velocidade máxima', 'number'], ['Aceleração do motor', 'number'], ['Inércia do motor', 'number'],
  ['Tração (F, R ou 4)', 'text'], ['Combustível (P, D ou E)', 'text'],
  ['Freio', 'number'], ['Balanço do freio', 'number'], ['ABS (0 ou 1)', 'number'], ['Ângulo do volante', 'number'],
  ['Suspensão: força', 'number'], ['Suspensão: amortecimento', 'number'], ['Suspensão: amortecimento em alta', 'number'],
  ['Suspensão: limite superior', 'number'], ['Suspensão: limite inferior', 'number'], ['Suspensão: frente e trás', 'number'], ['Suspensão: anti-mergulho', 'number'],
  ['Distância do banco', 'number'], ['Dano de colisão', 'number'], ['Valor (US$)', 'number'],
  ['Flags do modelo (hex)', 'text'], ['Flags do handling (hex)', 'text'],
  ['Luz da frente', 'number'], ['Luz de trás', 'number'], ['Grupo de animação', 'number'],
];

const INTEGERS = new Set([6, 10, 18, 29, 34]); // submersion, gears, ABS, value, animation group
// weapon.dat: key ("$|PISTOL|1": prefix, name, skill level) -> the values of the line (without the prefix), as the game has them
let weaponLines = null;
const WEAPON_FIELDS = { gun: [[2, 'Alcance do alvo', 'f'], [3, 'Alcance da arma', 'f'], [8, 'Balas por pente', 'i'], [9, 'Dano', 'i'], [14, 'Nível de stat exigido', 'i'], [15, 'Precisão', 'f'], [16, 'Velocidade de movimento', 'f']],
  melee: [[2, 'Alcance do alvo', 'f'], [3, 'Alcance da arma', 'f']] };
let wpCurrent = '';

async function loadWeapons() {
  if (weaponLines) return weaponLines;
  weaponLines = new Map();
  try {
    const r = await fetch('/gta/data/weapon.dat');
    if (!r.ok) throw new Error('weapon');
    const bytes = new Uint8Array(await r.arrayBuffer());
    let text = '';
    for (let i = 0; i < bytes.length; i += 8192) text += String.fromCharCode(...bytes.subarray(i, i + 8192));
    for (const raw of text.split(/\r?\n/)) {
      const t = raw.trim();
      if (!t || t[0] === '#') continue;
      const parts = t.slice(1).trim().split(/\s+/);
      const gun = t[0] === '$';
      if (parts.length < 10 || (gun && parts.length < 25)) continue;
      weaponLines.set(`${t[0]}|${parts[0]}|${gun ? parts[13] : '0'}`, parts);
    }
  } catch (_) { weaponLines = null; }
  return weaponLines;
}

const SKILLS = ['Iniciante', 'Padrão', 'Profissional', 'Policial'];
const wstore = () => app.project.weapons || (app.project.weapons = {});
// The lines the edit applies to: the weapon at the selected level, or at every level when "all levels" is on
const wpKeys = () => ($('#wpAll').checked ? [...weaponLines.keys()].filter(k => k.split('|').slice(0, 2).join('|') === wpCurrent.split('|').slice(0, 2).join('|')) : [wpCurrent]);

function weaponNames() {
  const names = new Map();
  for (const k of weaponLines.keys()) { const [p, n] = k.split('|'); names.set(`${p}|${n}`, n); }
  return names;
}

function renderWeapons() {
  const sel = $('#wpName');
  if (!weaponLines) return;
  if (!sel.children.length) sel.innerHTML = [...weaponNames()].map(([k, n]) => `<option value="${esc(k)}">${esc(n)}</option>`).join('');
  const base = sel.value;
  const rows = [...weaponLines.keys()].filter(k => k.startsWith(base + '|'));
  const rowSel = $('#wpRow');
  const keep = rowSel.value;
  rowSel.innerHTML = rows.map(k => { const s = k.split('|')[2]; return `<option value="${esc(k)}">${base.startsWith('$') ? SKILLS[+s] || s : 'Único'}</option>`; }).join('');
  if (rows.includes(keep)) rowSel.value = keep;
  wpCurrent = rowSel.value;
  const parts = wstore()[wpCurrent] || weaponLines.get(wpCurrent);
  const box = $('#wpFields');
  box.replaceChildren();
  if (!parts) return;
  const defs = WEAPON_FIELDS[wpCurrent.startsWith('$') ? 'gun' : 'melee'];
  for (const [i, label] of defs) {
    const l = document.createElement('label');
    l.classList.add('door-num');
    const s = document.createElement('span');
    s.textContent = label;
    const input = document.createElement('input');
    input.type = 'number'; input.step = 'any'; input.value = parts[i]; input.dataset.wpIndex = i;
    l.append(s, input);
    box.append(l);
  }
  $('#wpReset').disabled = !wpKeys().some(k => wstore()[k]);
  const ul = $('#wpChanged');
  ul.replaceChildren();
  for (const k of Object.keys(wstore())) {
    const [p, n, sk] = k.split('|');
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button'; b.classList.add('link-btn'); b.dataset.wpPick = k;
    b.textContent = p === '$' ? `${n} · ${SKILLS[+sk] || sk}` : n;
    li.append(b);
    ul.append(li);
  }
}

let original = null; // handling name -> its 35 values, as the game has them
let current = '';

async function loadOriginal() {
  if (original) return original;
  original = new Map();
  try {
    const r = await fetch('/gta/data/handling.cfg');
    if (!r.ok) throw new Error('handling');
    for (const raw of (await r.text()).split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || '*;%$!^#'.includes(line[0])) continue;
      const parts = line.split(/\s+/);
      if (parts.length === 36) original.set(parts[0].toUpperCase(), parts.slice(1));
    }
  } catch (_) { original = null; }
  return original;
}

const store = () => app.project.handling || (app.project.handling = {});
const dists = () => app.project.drawDist || (app.project.drawDist = {});
const retex = () => app.project.retex || (app.project.retex = []);

function renderHandling() {
  const box = $('#hdFields');
  box.replaceChildren();
  if (!current || !original?.has(current)) return;
  const values = store()[current] || original.get(current);
  FIELDS.forEach(([label, kind], i) => {
    const l = document.createElement('label');
    l.classList.add('door-num');
    const s = document.createElement('span');
    s.textContent = label;
    const input = document.createElement('input');
    input.type = kind === 'number' ? 'number' : 'text';
    if (kind === 'number') input.step = 'any';
    input.value = values[i];
    input.dataset.hdIndex = i;
    l.append(s, input);
    box.append(l);
  });
  const changed = !!store()[current];
  $('#hdReset').disabled = !changed;
}

function renderChanged() {
  const ul = $('#hdChanged');
  ul.replaceChildren();
  for (const name of Object.keys(store())) {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button'; b.classList.add('link-btn'); b.dataset.hdPick = name; b.textContent = name;
    li.append(b);
    ul.append(li);
  }
}

function renderDist() {
  const ul = $('#ddList');
  ul.replaceChildren();
  for (const [id, dist] of Object.entries(dists())) {
    const def = app.gd.models.get(+id);
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.classList.add('sp-mod-name');
    span.textContent = `${def?.name || def?.model || id} · ${id} → ${dist} m`;
    const del = document.createElement('button');
    del.type = 'button'; del.classList.add('btn', 'small', 'danger'); del.dataset.ddDel = id;
    del.innerHTML = '<svg><use href="#i-trash"/></svg>';
    del.append('Remover');
    li.append(span, del);
    ul.append(li);
  }
  if (!ul.children.length) ul.innerHTML = '<li class="ol-empty">Nenhuma distância alterada.</li>';
}

export function renderRetex() {
  const ul = $('#rtList');
  if (!ul) return;
  ul.replaceChildren();
  retex().forEach((r, i) => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.classList.add('sp-mod-name');
    span.textContent = `${r.txd}/${r.name} → ${r.srcTxd}/${r.srcName}`;
    const del = document.createElement('button');
    del.type = 'button'; del.classList.add('btn', 'small', 'danger'); del.dataset.rtDel = i;
    del.innerHTML = '<svg><use href="#i-trash"/></svg>';
    del.append('Remover');
    li.append(span, del);
    ul.append(li);
  });
  if (!ul.children.length) ul.innerHTML = '<li class="ol-empty">Nenhuma textura trocada no mapa todo.</li>';
}

// A texture replaced for every object that uses it: the texture of the model slot -> the chosen library texture
export function addRetex(txd, name, srcTxd, srcName) {
  const list = retex();
  const same = list.find(r => r.txd === txd && r.name === name);
  if (same) { same.srcTxd = srcTxd; same.srcName = srcName; } else list.push({ txd, name, srcTxd, srcName });
  app.project.touch('retex');
  renderRetex();
}

export function initDataDialog() {
  const dlg = $('#dlgData');
  $('#btnData').onclick = async () => {
    renderChanged(); renderDist(); renderRetex();
    dlg.showModal();
    loadWeapons().then(renderWeapons);
    const map = await loadOriginal();
    const names = $('#hdNames');
    if (map && !names.children.length) names.innerHTML = [...map.keys()].map(n => `<option value="${esc(n)}">`).join('');
    if (!map) toast('Não consegui ler o handling.cfg do jogo', 'warn', 5000);
  };
  $('#dataClose').onclick = () => dlg.close();

  $('#wpName').addEventListener('change', renderWeapons);
  $('#wpRow').addEventListener('change', renderWeapons);
  $('#wpFields').addEventListener('change', (e) => {
    const i = e.target.dataset.wpIndex;
    if (i === undefined || !wpCurrent) return;
    const def = WEAPON_FIELDS[wpCurrent.startsWith('$') ? 'gun' : 'melee'].find(d => d[0] === +i);
    const num = parseFloat(e.target.value);
    const parts = (wstore()[wpCurrent] || weaponLines.get(wpCurrent)).slice();
    if (!Number.isFinite(num)) { toast('Valor inválido para este campo', 'warn'); e.target.value = parts[i]; return; }
    parts[i] = def[2] === 'i' ? String(Math.round(num)) : (Number.isInteger(num) ? num.toFixed(1) : String(num));
    e.target.value = parts[i];
    // The player's skill level changes with the game (and an NPC has its own): by default the value goes to every level of the weapon
    for (const key of wpKeys()) {
      const row = (wstore()[key] || weaponLines.get(key)).slice();
      row[i] = parts[i];
      if (row.every((v, k) => v === weaponLines.get(key)[k])) delete wstore()[key]; else wstore()[key] = row;
    }
    app.project.touch('weapons');
    renderWeapons();
  });
  // Reset to the default values: every level of the weapon too, when the option for all levels is on
  $('#wpReset').onclick = () => { for (const k of wpKeys()) delete wstore()[k]; app.project.touch('weapons'); renderWeapons(); };
  $('#wpAll').onchange = () => { $('#wpReset').disabled = !wpKeys().some(k => wstore()[k]); };
  $('#wpChanged').addEventListener('click', (e) => {
    const b = e.target.closest('[data-wp-pick]');
    if (!b) return;
    const k = b.dataset.wpPick;
    $('#wpName').value = k.split('|').slice(0, 2).join('|');
    renderWeapons();
    $('#wpRow').value = k;
    renderWeapons();
  });

  $('#hdName').addEventListener('input', () => {
    const name = $('#hdName').value.trim().toUpperCase();
    if (original?.has(name)) { current = name; renderHandling(); }
  });
  $('#hdFields').addEventListener('change', (e) => {
    const i = e.target.dataset.hdIndex;
    if (i === undefined || !current) return;
    const values = (store()[current] || original.get(current)).slice();
    // The game reads some fields as whole numbers, letters or hexadecimal: anything else would shift the line and crash the game
    const raw = e.target.value.trim();
    let v = raw;
    if (INTEGERS.has(+i)) v = Number.isFinite(parseFloat(raw)) ? String(Math.round(parseFloat(raw))) : '';
    else if (+i === 14) v = /^[FR4]$/i.test(raw) ? raw.toUpperCase() : '';
    else if (+i === 15) v = /^[PDE]$/i.test(raw) ? raw.toUpperCase() : '';
    else if (+i === 30 || +i === 31) v = /^[0-9a-f]{1,8}$/i.test(raw) ? raw.toUpperCase() : '';
    else v = Number.isFinite(Number(raw)) && raw !== '' ? raw : '';
    if (!v) toast('Valor inválido para este campo', 'warn');
    values[i] = v || (store()[current] || original.get(current))[i];
    e.target.value = values[i];
    // Back to the game's values: nothing to put in the mod
    if (values.every((v, k) => v === original.get(current)[k])) delete store()[current]; else store()[current] = values;
    app.project.touch('handling');
    renderChanged();
    $('#hdReset').disabled = !store()[current];
  });
  $('#hdReset').onclick = () => {
    delete store()[current];
    app.project.touch('handling');
    renderHandling(); renderChanged();
  };
  $('#hdChanged').addEventListener('click', (e) => {
    const b = e.target.closest('[data-hd-pick]');
    if (!b) return;
    current = b.dataset.hdPick;
    $('#hdName').value = current;
    renderHandling();
  });

  // Draw distance of a model: the selected object's model
  $('#ddAdd').onclick = () => {
    const sel = app.editor.selectedObjects();
    const id = sel[0]?.item.model;
    const dist = parseFloat($('#ddDist').value);
    const def = app.gd.models.get(id);
    if (!sel.length || !def) { toast('Selecione um objeto do projeto primeiro', 'warn'); return; }
    if (def.type !== 'objs') { toast('Só modelos de objeto comuns têm a distância alterada', 'warn'); return; }
    if (!(dist >= 20)) { toast('A distância mínima é 20 m', 'warn'); return; }
    dists()[id] = Math.min(3000, Math.round(dist));
    app.project.touch('drawDist');
    renderDist();
  };
  $('#ddList').addEventListener('click', (e) => {
    const b = e.target.closest('[data-dd-del]');
    if (!b) return;
    delete dists()[b.dataset.ddDel];
    app.project.touch('drawDist');
    renderDist();
  });
  $('#rtList').addEventListener('click', (e) => {
    const b = e.target.closest('[data-rt-del]');
    if (!b) return;
    retex().splice(+b.dataset.rtDel, 1);
    app.project.touch('retex');
    renderRetex();
  });
  app.on('project', () => { current = ''; $('#hdName').value = ''; $('#hdFields').replaceChildren(); });
}
