// Color picker and converter: pick a color and copy its code in the formats SA-MP and open.mp use.
// Like the sounds dialog it only shows codes to copy right away: nothing is saved, exported or imported.
import { $, esc, toast, copyText } from './common.js';
import { CAR_COLORS } from '../world/vehicleMods.js';
import { TAG_COLORS } from '../editor/tdrender.js';

let dlg = null;
const col = { r: 255, g: 28, b: 28, a: 255 };   // current color, 0 to 255 each

const SWATCHES = ['FFFFFF', 'AFAFAF', '808080', '000000', 'FF0000', 'FF8000', 'FFFF00', '00FF00', '00FFFF', '0000FF', 'FF00FF', 'FF1C1C',
  '2E9E3A', '3A6EE0', 'B56A2E', 'F0A630'];

const clamp = (n) => Math.max(0, Math.min(255, Math.round(Number(n) || 0)));
const h2 = (n) => clamp(n).toString(16).toUpperCase().padStart(2, '0');
const rgbHex = () => h2(col.r) + h2(col.g) + h2(col.b);

// Any code the user may paste -> { r, g, b, a } or null. An 8 digit 0x code is read as RRGGBBAA, the SA-MP standard.
export function parseColorText(text) {
  const t = String(text ?? '').trim();
  if (!t) return null;
  let m = t.match(/^\{([0-9a-f]{6})\}$/i) || t.match(/^(?:#|0x)([0-9a-f]{6}|[0-9a-f]{8})$/i) || t.match(/^#([0-9a-f]{3})$/i);
  if (m) {
    let h = m[1];
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: h.length === 8 ? parseInt(h.slice(6, 8), 16) : 255 };
  }
  if (/^-?\d{7,}$/.test(t)) {
    const n = Number(t) >>> 0;
    return { r: n >>> 24, g: (n >>> 16) & 255, b: (n >>> 8) & 255, a: n & 255 };
  }
  const nums = t.replace(/^rgba?\(|\)$/gi, '').split(/[\s,;]+/).filter(Boolean);
  if ((nums.length === 3 || nums.length === 4) && nums.every(x => /^\d+(\.\d+)?$/.test(x))) {
    const v = nums.map(Number);
    if (v.every(x => x <= 255)) return { r: clamp(v[0]), g: clamp(v[1]), b: clamp(v[2]), a: v.length === 4 ? clamp(v[3]) : 255 };
  }
  return null;
}

function hsl() {
  const r = col.r / 255, g = col.g / 255, b = col.b / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  const l = (mx + mn) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d !== 0) {
    if (mx === r) h = ((g - b) / d) % 6;
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

function nearest(list) {
  let best = 0, bd = Infinity;
  list.forEach(([r, g, b], i) => {
    const d = (r - col.r) ** 2 + (g - col.g) ** 2 + (b - col.b) ** 2;
    if (d < bd) { bd = d; best = i; }
  });
  return best;
}

function formats() {
  const rgba = rgbHex() + h2(col.a);
  const argb = h2(col.a) + rgbHex();
  const dec = ((col.r << 24) | (col.g << 16) | (col.b << 8) | col.a) | 0;
  const tags = Object.keys(TAG_COLORS).filter(k => k !== 's');
  const tag = tags[nearest(tags.map(k => TAG_COLORS[k]))];
  const car = nearest(CAR_COLORS);
  return {
    main: [
      ['RGBA', `0x${rgba}`, 'SetPlayerColor, SendClientMessage, TextDrawColor'],
      ['ARGB', `0x${argb}`, 'SetObjectMaterial, SetObjectMaterialText'],
      ['{RRGGBB}', `{${rgbHex()}}`, 'SendClientMessage, ShowPlayerDialog, Create3DTextLabel'],
      ['Decimal (int)', String(dec), 'RGBA'],
      ['HTML / CSS', col.a === 255 ? `#${rgbHex()}` : `#${rgbHex()}${h2(col.a)}`, '#RRGGBB'],
      ['R, G, B, A', `${col.r}, ${col.g}, ${col.b}, ${col.a}`, '0 - 255'],
      ['HSL', hsl(), ''],
    ],
    code: [
      ['SetPlayerColor', `SetPlayerColor(playerid, 0x${rgba});`],
      ['SendClientMessage', `SendClientMessage(playerid, 0x${rgba}, "");`],
      ['SetObjectMaterial', `SetObjectMaterial(objectid, 0, 0, "none", "none", 0x${argb});`],
    ],
    near: [
      ['Código de texto (TextDraw)', `~${tag}~`, `rgb(${TAG_COLORS[tag].join(', ')})`],
      ['ID de cor de veículo', String(car), `rgb(${CAR_COLORS[car].join(', ')})`],
    ],
  };
}

function row(label, value, note, translateLabel = false) {
  return `<div class="clr-row">
    <span class="clr-lab"${translateLabel ? '' : ' translate="no"'}>${esc(label)}</span>
    <code class="clr-code" translate="no">${esc(value)}</code>
    <span class="clr-note" translate="no">${esc(note || '')}</span>
    <button type="button" class="btn small" data-copy="${esc(value)}">Copiar</button></div>`;
}

function render(skipInput) {
  const f = formats();
  $('#clrPreview').style.setProperty('--c', `rgba(${col.r}, ${col.g}, ${col.b}, ${(col.a / 255).toFixed(3)})`);
  $('#clrPick').value = `#${rgbHex().toLowerCase()}`;
  if (skipInput !== 'text') $('#clrInput').value = `0x${rgbHex()}${h2(col.a)}`;
  $('#clrInput').classList.remove('invalid');
  for (const k of ['r', 'g', 'b', 'a']) if (skipInput !== k) $('#clr' + k.toUpperCase()).value = col[k];
  $('#clrList').innerHTML = `
    <div class="clr-sec">Formatos para copiar</div>${f.main.map(r => row(...r)).join('')}
    <div class="clr-sec">Código pronto</div>${f.code.map(r => row(r[0], r[1], '')).join('')}
    <div class="clr-sec">Mais próximas no jogo</div>${f.near.map(r => row(r[0], r[1], r[2], true)).join('')}`;
}

function setColor(c, skip) {
  col.r = clamp(c.r); col.g = clamp(c.g); col.b = clamp(c.b); col.a = clamp(c.a);
  render(skip);
}

export function initColorDialog() {
  dlg = document.getElementById('dlgColors');
  if (!dlg) return;
  $('#clrClose').onclick = () => dlg.close();
  $('#clrSwatches').innerHTML = SWATCHES.map(h => `<button type="button" class="sw" data-hex="${h}" style="--c:#${h}" title="#${h}"></button>`).join('');
  $('#clrSwatches').onclick = (e) => {
    const b = e.target.closest('[data-hex]');
    if (b) setColor({ ...parseColorText('#' + b.dataset.hex), a: col.a });
  };
  $('#clrPick').addEventListener('input', (e) => setColor({ ...parseColorText(e.target.value), a: col.a }));
  $('#clrInput').addEventListener('input', (e) => {
    const c = parseColorText(e.target.value);
    if (!c) { e.target.classList.add('invalid'); return; }
    setColor(c, 'text');
  });
  for (const k of ['r', 'g', 'b', 'a']) {
    $('#clr' + k.toUpperCase()).addEventListener('input', (e) => {
      if (e.target.value === '') return;
      setColor({ ...col, [k]: e.target.value }, k);
    });
  }
  $('#clrList').onclick = async (e) => {
    const b = e.target.closest('[data-copy]');
    if (!b) return;
    await copyText(b.dataset.copy);
    toast('Código copiado');
  };
  render();
}

export function openColorDialog() {
  if (!dlg) initColorDialog();
  if (dlg && !dlg.open) dlg.showModal();
}
