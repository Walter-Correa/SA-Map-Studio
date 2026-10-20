// ARGB color panel (0xAARRGGBB), in the format SA-MP uses in
// SetObjectMaterial (materialcolor) e SetObjectMaterialText (fontcolor / backcolor).
import { argbParts, makeArgb, parseColor, formatColor, cssColor, hexRgb } from '../editor/materials.js';
import { CAR_COLORS, carColorHex } from '../world/vehicleMods.js';
import { esc, store } from './common.js';

// Common colors: construction shades, vivid colors and the gray scale
const SWATCHES = [
  '0xFFFFFFFF', '0xFFE0E0E0', '0xFFBDBDBD', '0xFF9E9E9E', '0xFF757575', '0xFF545454', '0xFF333333', '0xFF000000',
  '0xFFF44336', '0xFFE91E63', '0xFF9C27B0', '0xFF673AB7', '0xFF3F51B5', '0xFF2196F3', '0xFF03A9F4', '0xFF00BCD4',
  '0xFF009688', '0xFF4CAF50', '0xFF8BC34A', '0xFFCDDC39', '0xFFFFEB3B', '0xFFFFC107', '0xFFFF9800', '0xFFFF5722',
  '0xFF795548', '0xFFA1887F', '0xFFD7CCC8', '0xFFF5E6C8', '0xFFC8A165', '0xFF8D6E63', '0xFF5D4037', '0xFF3E2723',
  '0xFF12603A', '0xFF1B5E20', '0xFF0D47A1', '0xFF1A237E', '0xFFB71C1C', '0xFF880E4F', '0xFFF0A630', '0xFF607D8B',
];

export function recentColors() { return store.get('recentColors', []); }
function pushRecent(v) {
  if (!parseColor(v)) return;
  const list = recentColors().filter(c => c !== v);
  list.unshift(v);
  store.set('recentColors', list.slice(0, 16));
}

// Creates the panel inside "el". onChange(color) is called on choosing (color = "0" or "0xAARRGGBB").
//   allowNone: shows the "Sem cor (0)" button, which in SA-MP keeps the original color
export function colorPalette(el, { value = '0', allowNone = true, noneLabel = 'Sem cor (0)', onChange }) {
  let cur = formatColor(parseColor(value));
  el.classList.add('palette');
  const render = () => {
    const p = argbParts(cur);
    const none = parseColor(cur) === 0;
    const recent = recentColors();
    el.innerHTML = `
      <div class="pal-top">
        <span class="pal-current${none ? ' none' : ''}" style="--c:${none ? 'transparent' : cssColor(cur)}" title="${esc(cur)}"></span>
        <input class="pal-hex" value="${esc(none ? '0' : cur)}" spellcheck="false" aria-label="Cor em 0xAARRGGBB">
        <label class="pal-custom" title="Escolher qualquer cor"><input type="color" value="${hexRgb(none ? '0xFFFFFFFF' : cur)}" aria-label="Cor personalizada"><svg><use href="#i-dropper"/></svg></label>
        ${allowNone ? `<button type="button" class="btn small${none ? ' on' : ''}" data-none>${esc(noneLabel)}</button>` : ''}
      </div>
      <div class="pal-grid">${SWATCHES.map(c => `<button type="button" class="sw${c === cur.replace(/^0x../, '0xFF') && !none ? ' on' : ''}" data-c="${c}" style="--c:${cssColor(c)}" title="${c}" aria-label="Cor ${c}"></button>`).join('')}</div>
      ${recent.length ? `<div class="pal-sub">Usadas por último</div><div class="pal-grid recent">${recent.map(c => `<button type="button" class="sw" data-c="${c}" data-keep-alpha style="--c:${cssColor(c)}" title="${c}" aria-label="Cor ${c}"></button>`).join('')}</div>` : ''}
      <label class="pal-alpha">Opacidade (alfa) <input type="range" min="0" max="255" value="${none ? 255 : p.a}" ${none ? 'disabled' : ''}><output>${Math.round((none ? 255 : p.a) / 2.55)}%</output></label>`;
    el.querySelectorAll('.sw').forEach(b => b.onclick = () => {
      const c = argbParts(b.dataset.c);
      const a = b.hasAttribute('data-keep-alpha') ? c.a : (none ? 255 : p.a);
      set(makeArgb(a, c.r, c.g, c.b), true);
    });
    el.querySelector('[data-none]')?.addEventListener('click', () => set('0', true));
    const hex = el.querySelector('.pal-hex');
    hex.addEventListener('change', () => set(formatColor(parseColor(hex.value.trim())), true));
    hex.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); hex.blur(); } });
    el.querySelector('input[type="color"]').addEventListener('change', (e) => {
      const v = e.target.value;
      set(makeArgb(none ? 255 : p.a, parseInt(v.slice(1, 3), 16), parseInt(v.slice(3, 5), 16), parseInt(v.slice(5, 7), 16)), true);
    });
    const range = el.querySelector('input[type="range"]'), out = el.querySelector('.pal-alpha output');
    range.addEventListener('input', () => { out.textContent = Math.round(range.value / 2.55) + '%'; });
    range.addEventListener('change', () => { const c = argbParts(cur); set(makeArgb(+range.value, c.r, c.g, c.b), true); });
  };
  const set = (v, fire) => {
    cur = formatColor(parseColor(v));
    if (fire) pushRecent(cur);
    render();
    if (fire) onChange?.(cur);
  };
  render();
  return { get value() { return cur; }, set: (v) => set(v, false) };
}

export function recentCarColors() { return store.get('recentCarColors', []); }
function pushRecentCarColor(id) {
  if (id === undefined || id === null || id < 0) return;
  const list = recentCarColors().filter(c => c !== id);
  list.unshift(id);
  store.set('recentCarColors', list.slice(0, 16));
}

// Dedicated palette for the 256 vehicle colors (0 to 255)
export function vehicleColorPalette(el, { value = -1, onChange }) {
  let cur = parseInt(value, 10);
  if (!Number.isFinite(cur)) cur = -1;
  el.classList.add('palette', 'veh-palette');
  let filter = '';

  const render = () => {
    const isNone = cur === -1;
    const hex = isNone ? 'Aleatória (-1)' : carColorHex(cur);
    const recent = recentCarColors();
    const swatches = [];
    for (let id = 0; id < CAR_COLORS.length; id++) {
      if (filter) {
        const idStr = String(id);
        const h = carColorHex(id).toLowerCase();
        if (!idStr.includes(filter) && !h.includes(filter.toLowerCase())) continue;
      }
      swatches.push(id);
    }

    el.innerHTML = `
      <div class="pal-top" style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
        <span class="pal-current${isNone ? ' none' : ''}" style="width:28px; height:28px; border-radius:4px; border:1px solid rgba(255,255,255,0.25); background:${isNone ? 'transparent' : hex}; flex-shrink:0;" title="${isNone ? 'Aleatória' : `ID ${cur} (${hex})`}"></span>
        <input class="pal-hex" type="number" min="-1" max="255" value="${cur}" style="width:70px; padding:3px 6px; font-size:13px;" aria-label="ID da cor do veículo (0-255)">
        <span style="font-size:12px; color:var(--text-dim); flex:1;">${isNone ? 'Cor aleatória' : hex}</span>
        <button type="button" class="btn small${isNone ? ' on' : ''}" data-none style="font-size:11px; padding:3px 6px;">Aleatória (-1)</button>
      </div>
      <div style="margin: 0 0 6px;">
        <input class="pal-search" type="search" placeholder="Filtrar por ID (0-255)" value="${esc(filter)}" style="width:100%; font-size:12px; padding:4px 8px; border-radius:4px; background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.15); color:#fff;">
      </div>
      <div class="pal-sub" style="font-size:11px; color:var(--text-dim); margin-bottom:4px;">Cores de veículos (${swatches.length} de 256)</div>
      <div class="pal-grid" style="max-height:160px; overflow-y:auto; display:grid; grid-template-columns:repeat(8, 1fr); gap:3px; padding-right:4px;">
        ${swatches.map(id => `<button type="button" class="sw${id === cur ? ' on' : ''}" data-car-id="${id}" style="--c:${carColorHex(id)}; width:100%; aspect-ratio:1; border-radius:3px; border:1px solid rgba(255,255,255,0.12); cursor:pointer;" title="ID ${id} (${carColorHex(id)})" aria-label="ID ${id}"></button>`).join('')}
      </div>
      ${recent.length ? `<div class="pal-sub" style="margin-top:6px; font-size:11px; color:var(--text-dim);">Usadas por último</div><div class="pal-grid recent" style="display:grid; grid-template-columns:repeat(8, 1fr); gap:3px; margin-top:3px;">${recent.map(id => `<button type="button" class="sw${id === cur ? ' on' : ''}" data-car-id="${id}" style="--c:${carColorHex(id)}; width:100%; aspect-ratio:1; border-radius:3px; border:1px solid rgba(255,255,255,0.12); cursor:pointer;" title="ID ${id} (${carColorHex(id)})" aria-label="ID ${id}"></button>`).join('')}</div>` : ''}
    `;

    el.querySelectorAll('[data-car-id]').forEach(b => b.onclick = () => {
      set(parseInt(b.dataset.carId, 10), true);
    });
    el.querySelector('[data-none]')?.addEventListener('click', () => set(-1, true));
    const hexInput = el.querySelector('.pal-hex');
    hexInput.addEventListener('change', () => {
      let v = parseInt(hexInput.value, 10);
      if (!Number.isFinite(v) || v < -1) v = -1;
      if (v > 255) v = 255;
      set(v, true);
    });
    hexInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); hexInput.blur(); } });
    const searchInput = el.querySelector('.pal-search');
    searchInput.addEventListener('input', (e) => {
      filter = e.target.value.trim();
      render();
      const newSearch = el.querySelector('.pal-search');
      if (newSearch) {
        newSearch.focus();
        newSearch.setSelectionRange(newSearch.value.length, newSearch.value.length);
      }
    });
  };

  const set = (v, fire) => {
    cur = v;
    if (fire && cur >= 0) pushRecentCarColor(cur);
    render();
    if (fire) onChange?.(cur);
  };
  render();
  return { get value() { return cur; }, set: (v) => set(v, false) };
}

// Floating popover for choosing a vehicle color
export function openVehicleColorPicker(targetEl, { value = -1, onSelect }) {
  document.querySelectorAll('.veh-color-popover').forEach(p => p.remove());
  const pop = document.createElement('div');
  pop.className = 'veh-color-popover';
  pop.style.cssText = 'position:fixed; z-index:9999; background:#22262c; border:1px solid #444c56; border-radius:8px; padding:10px; box-shadow:0 8px 24px rgba(0,0,0,0.6); width:280px;';
  
  const rect = targetEl.getBoundingClientRect();
  const left = Math.min(window.innerWidth - 300, Math.max(10, rect.left - 120));
  const top = Math.min(window.innerHeight - 320, rect.bottom + 6);
  pop.style.left = left + 'px';
  pop.style.top = top + 'px';

  document.body.appendChild(pop);

  vehicleColorPalette(pop, {
    value,
    onChange: (id) => {
      onSelect(id);
    }
  });

  const closeHandler = (e) => {
    if (!pop.contains(e.target) && !targetEl.contains(e.target)) {
      pop.remove();
      document.removeEventListener('pointerdown', closeHandler);
    }
  };
  setTimeout(() => document.addEventListener('pointerdown', closeHandler), 10);
}

