// Seletor Modal de Skins para Actors com Prévia Visual e Categorias
// Suporta todas as 312 skins do jogo (IDs 0 a 311)
import { $, $$, esc, plural, toast } from './common.js';
import { ALL_SKINS, POPULAR_SKINS, getSkinLabel } from '../world/actors.js';

let selectedSkinId = 0;
let onSelectCallback = null;
let currentSearch = '';
let activeCategory = 'todas';
let initialized = false;

const CATEGORIES = [
  { id: 'todas', label: '🌐 Todas' },
  { id: 'populares', label: '⭐ Populares' },
  { id: 'grove', label: '🟢 Grove Street' },
  { id: 'gangues', label: '🟣 Outras Gangues' },
  { id: 'policia', label: '👮 Polícia & Serviços' },
  { id: 'mulheres', label: '👩 Mulheres' },
  { id: 'homens', label: '👨 Civis' },
  { id: 'especiais', label: '👑 Especiais' },
];

function classifySkin(skin) {
  const id = skin.id;
  const name = (skin.name || '').toLowerCase();
  const m = (skin.model || '').toLowerCase();

  const isPop = POPULAR_SKINS.some(p => p.id === id);
  const isGrove = id === 0 || id === 105 || id === 106 || id === 107 || id === 269 || id === 270 || id === 271 || m.includes('fam') || name.includes('grove') || name.includes('sweet') || name.includes('ryder') || name.includes('smoke');
  const isGang = isGrove || (id >= 102 && id <= 118) || (id >= 120 && id <= 127) || name.includes('ballas') || name.includes('vagos') || name.includes('mafia') || name.includes('triad') || name.includes('rifa') || name.includes('da nang');
  const isCop = (id >= 265 && id <= 267) || (id >= 280 && id <= 288) || id === 71 || name.includes('cop') || name.includes('police') || name.includes('fbi') || name.includes('army') || name.includes('medic') || name.includes('fire') || name.includes('guard') || name.includes('swat');
  const isFem = (id >= 9 && id <= 13) || (id >= 38 && id <= 41) || (id >= 53 && id <= 56) || (id >= 63 && id <= 65) || (id >= 69 && id <= 69) || (id >= 85 && id <= 93) || (id >= 129 && id <= 131) || (id >= 138 && id <= 141) || (id >= 148 && id <= 152) || (id >= 157 && id <= 157) || (id >= 169 && id <= 169) || (id >= 178 && id <= 178) || (id >= 190 && id <= 199) || (id >= 201 && id <= 201) || (id >= 205 && id <= 205) || (id >= 207 && id <= 207) || (id >= 211 && id <= 211) || (id >= 214 && id <= 216) || (id >= 218 && id <= 219) || (id >= 224 && id <= 226) || (id >= 231 && id <= 233) || (id >= 237 && id <= 238) || (id >= 243 && id <= 246) || (id >= 251 && id <= 251) || (id >= 256 && id <= 257) || (id >= 263 && id <= 263) || name.includes('female') || name.includes('girl') || name.includes('woman') || name.includes('prostitute');
  const isSpecial = id === 0 || id === 1 || id === 2 || id === 265 || id === 266 || id === 267 || id === 268 || id === 269 || id === 270 || id === 271 || id === 272 || id === 290 || id === 291 || id === 292 || id === 293 || id === 294 || id === 295 || id === 296 || id === 297 || id === 298 || id === 299 || id === 300 || id === 301 || id === 302 || id === 303 || id === 304 || id === 305 || id === 306 || id === 307 || id === 308 || id === 309 || id === 310 || id === 311;

  return { isPop, isGrove, isGang, isCop, isFem, isSpecial };
}

export function setupSkinPicker() {
  const dlg = $('#dlgSkinPicker');
  if (!dlg || initialized) return;
  initialized = true;

  const searchInp = $('#skinPickerSearch');
  const catBox = $('#skinPickerCategories');
  const btnApply = $('#btnApplySelectedSkin');

  // Categorias
  if (catBox) {
    catBox.innerHTML = CATEGORIES.map(c => `
      <button type="button" class="chip${c.id === activeCategory ? ' active' : ''}" data-cat="${c.id}">${c.label}</button>
    `).join('');
    catBox.onclick = (e) => {
      const b = e.target.closest('.chip');
      if (!b) return;
      activeCategory = b.dataset.cat;
      $$('.chip', catBox).forEach(x => x.classList.toggle('active', x === b));
      renderSkinGrid();
    };
  }

  // Busca
  if (searchInp) {
    let t;
    searchInp.oninput = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        currentSearch = searchInp.value.trim().toLowerCase();
        renderSkinGrid();
      }, 100);
    };
  }

  // Botão aplicar
  if (btnApply) {
    btnApply.onclick = () => {
      applySelectedSkin();
    };
  }

  // Fechar
  const closeBtns = dlg.querySelectorAll('#btnCloseSkinPicker, #btnCloseSkinPickerX, [value="close"]');
  closeBtns.forEach(b => {
    b.onclick = (e) => {
      e.preventDefault();
      try { dlg.close(); } catch (_) {}
    };
  });
}

export function openSkinPicker({ currentSkin = 0, onSelect = null } = {}) {
  setupSkinPicker();
  const dlg = $('#dlgSkinPicker');
  if (!dlg) return;

  selectedSkinId = Number.isFinite(currentSkin) ? currentSkin : 0;
  onSelectCallback = onSelect;
  currentSearch = '';
  const searchInp = $('#skinPickerSearch');
  if (searchInp) searchInp.value = '';

  renderSkinGrid();
  updateSkinPreview(selectedSkinId);

  try {
    dlg.showModal();
    searchInp?.focus();
  } catch (_) {}
}

function filterSkins() {
  return ALL_SKINS.filter(skin => {
    const cls = classifySkin(skin);
    if (activeCategory === 'populares' && !cls.isPop) return false;
    if (activeCategory === 'grove' && !cls.isGrove) return false;
    if (activeCategory === 'gangues' && !cls.isGang) return false;
    if (activeCategory === 'policia' && !cls.isCop) return false;
    if (activeCategory === 'mulheres' && !cls.isFem) return false;
    if (activeCategory === 'homens' && cls.isFem) return false;
    if (activeCategory === 'especiais' && !cls.isSpecial) return false;

    if (currentSearch) {
      const asNum = /^\d+$/.test(currentSearch) ? parseInt(currentSearch, 10) : null;
      if (asNum !== null && skin.id === asNum) return true;
      if (asNum !== null && String(skin.id).startsWith(currentSearch)) return true;
      const nm = (skin.name || '').toLowerCase();
      const md = (skin.model || '').toLowerCase();
      return nm.includes(currentSearch) || md.includes(currentSearch);
    }
    return true;
  });
}

function renderSkinGrid() {
  const container = $('#skinPickerGrid');
  if (!container) return;

  const list = filterSkins();
  const countEl = $('#skinPickerCount');
  if (countEl) countEl.textContent = plural(list.length, 'skin', 'skins');

  if (!list.length) {
    container.innerHTML = '<div style="grid-column: 1 / -1; padding: 40px 20px; text-align: center; color: var(--paper-dim);">Nenhuma skin encontrada para os filtros atuais.</div>';
    return;
  }

  container.innerHTML = list.map(s => {
    const isSel = s.id === selectedSkinId;
    const thumbUrl = `/cache/skins/${s.id}.png`;
    return `
      <div class="skin-card${isSel ? ' selected' : ''}" data-skin-id="${s.id}" title="${esc(s.name)} (ID ${s.id})">
        <div class="skin-card-thumb-wrap">
          <img src="${thumbUrl}" alt="Skin ${s.id}" loading="lazy" onerror="this.onerror=null; this.src='/thumbs/obj/${s.id}.webp?v=3';">
        </div>
        <div class="skin-card-badge">ID ${s.id}</div>
        <div class="skin-card-name">${esc(s.name)}</div>
        <div class="skin-card-model">${esc(s.model)}</div>
      </div>
    `;
  }).join('');

  container.onclick = (e) => {
    const card = e.target.closest('.skin-card');
    if (!card) return;
    const id = parseInt(card.dataset.skinId, 10);
    if (!Number.isFinite(id)) return;
    selectedSkinId = id;
    $$('.skin-card', container).forEach(c => c.classList.toggle('selected', c === card));
    updateSkinPreview(id);
  };

  container.ondblclick = (e) => {
    const card = e.target.closest('.skin-card');
    if (!card) return;
    applySelectedSkin();
  };
}

function updateSkinPreview(id) {
  const skin = ALL_SKINS[id] || { id, name: `Skin ${id}`, model: 'unknown' };
  const prevImg = $('#prevSkinImg');
  const prevTitle = $('#prevSkinTitle');
  const prevSub = $('#prevSkinSub');
  const prevBadge = $('#prevSkinBadge');
  const prevCode = $('#prevSkinCode');
  const btnApply = $('#btnApplySelectedSkin');

  if (prevImg) {
    prevImg.src = `/cache/skins/${id}.png`;
    prevImg.onerror = () => {
      prevImg.onerror = null;
      prevImg.src = `/thumbs/obj/${id}.webp?v=3`;
    };
  }
  if (prevTitle) prevTitle.textContent = skin.name;
  if (prevSub) prevSub.textContent = `Modelo DFF: ${skin.model} · TXD: ${skin.txd || skin.model}`;
  if (prevBadge) prevBadge.textContent = `ID ${id}`;
  if (prevCode) prevCode.textContent = `CreateActor(${id}, x, y, z, rz);`;
  if (btnApply) {
    btnApply.disabled = false;
    btnApply.innerHTML = `<svg><use href="#i-check"/></svg> Aplicar Skin ${id}`;
  }
}

function applySelectedSkin() {
  const dlg = $('#dlgSkinPicker');
  if (onSelectCallback) {
    onSelectCallback(selectedSkinId);
  }
  try { dlg?.close(); } catch (_) {}
  toast(`Skin ${selectedSkinId} selecionada!`, 'ok', 2000);
}
