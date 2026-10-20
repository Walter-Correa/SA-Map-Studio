// Sprite Picker Modal for TextDraws with Complete Visual Gallery
import { $, $$, esc, plural, toast } from './common.js';
import { TEXTDRAW_SPRITES } from '../data/sprites.js';

let selectedSprite = 'hud:arrow';
let onSelectCallback = null;
let currentSearch = '';
let activeLib = 'todas';
let initialized = false;

const POPULAR_LIBS = [
  { id: 'todas', label: '🌐 Todas' },
  { id: 'hud', label: '🎯 HUD & Radar' },
  { id: 'fonts', label: '🔤 Fontes' },
  { id: 'samaps', label: '🗺️ Mapas' },
  { id: 'LD_BEAT', label: '🔘 Formas (LD_BEAT)' },
  { id: 'LD_CARD', label: '🃏 Baralho (LD_CARD)' },
  { id: 'LD_POKE', label: '♠️ Pôquer (LD_POKE)' },
  { id: 'LD_ROUL', label: '🎲 Roleta (LD_ROUL)' },
  { id: 'LD_SLOT', label: '🎰 Caça-Níquel (LD_SLOT)' },
  { id: 'LD_TATT', label: '🐉 Tatuagens (LD_TATT)' },
  { id: 'LD_CHAT', label: '💬 Chat (LD_CHAT)' },
  { id: 'LD_OTB', label: '🐎 Corrida (LD_OTB)' },
  { id: 'LD_SPAC', label: '🚀 Espaço (LD_SPAC)' },
  { id: 'splash', label: '🖼️ Telas & Intros' },
];

export function setupSpritePicker() {
  const dlg = $('#dlgSpritePicker');
  if (!dlg || initialized) return;
  initialized = true;

  const searchInp = $('#spritePickerSearch');
  const catBox = $('#spritePickerCategories');
  const btnApply = $('#btnApplySelectedSprite');

  // Categorias / Bibliotecas
  if (catBox) {
    catBox.innerHTML = POPULAR_LIBS.map(c => `
      <button type="button" class="chip${c.id === activeLib ? ' active' : ''}" data-lib="${c.id}">${c.label}</button>
    `).join('');
    catBox.onclick = (e) => {
      const b = e.target.closest('.chip');
      if (!b) return;
      activeLib = b.dataset.lib;
      $$('.chip', catBox).forEach(x => x.classList.toggle('active', x === b));
      renderSpriteGrid();
    };
  }

  // Busca
  if (searchInp) {
    let t;
    searchInp.oninput = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        currentSearch = searchInp.value.trim().toLowerCase();
        renderSpriteGrid();
      }, 100);
    };
  }

  // Apply button
  if (btnApply) {
    btnApply.onclick = () => {
      applySelectedSprite();
    };
  }

  // Fechar
  const closeBtns = dlg.querySelectorAll('#btnCloseSpritePicker, #btnCloseSpritePickerX, [value="close"]');
  closeBtns.forEach(b => {
    b.onclick = (e) => {
      e.preventDefault();
      try { dlg.close(); } catch (_) {}
    };
  });
}

export function openSpritePicker({ currentSprite = 'hud:arrow', onSelect = null } = {}) {
  setupSpritePicker();
  const dlg = $('#dlgSpritePicker');
  if (!dlg) return;

  let normCurrent = currentSprite || 'hud:arrow';
  if (normCurrent.toLowerCase().startsWith('loadscs:')) {
    const tex = normCurrent.slice(8).toLowerCase();
    normCurrent = tex === 'loadsc0' ? 'LOADSUK:loadscuk' : `LOADSUK:${tex}`;
  }
  selectedSprite = normCurrent;
  onSelectCallback = onSelect;
  currentSearch = '';
  const searchInp = $('#spritePickerSearch');
  if (searchInp) searchInp.value = '';

  renderSpriteGrid();
  updateSpritePreview(selectedSprite);

  try {
    dlg.showModal();
    searchInp?.focus();
  } catch (_) {}
}

function filterSprites() {
  return TEXTDRAW_SPRITES.filter(sp => {
    if (activeLib !== 'todas') {
      const l = sp.lib.toLowerCase();
      if (activeLib === 'splash') {
        if (!l.startsWith('splash') && !l.startsWith('intro') && !l.startsWith('loadsc') && !l.startsWith('loadsuk') && !l.startsWith('load0uk')) return false;
      } else if (activeLib === 'LD_OTB') {
        if (l !== 'ld_otb' && l !== 'ld_otb2' && l !== 'ld_race' && !l.startsWith('ld_rce')) return false;
      } else if (l !== activeLib.toLowerCase()) {
        return false;
      }
    }

    if (currentSearch) {
      const v = sp.value.toLowerCase();
      const n = sp.name.toLowerCase();
      const l = sp.lib.toLowerCase();
      return v.includes(currentSearch) || n.includes(currentSearch) || l.includes(currentSearch);
    }
    return true;
  });
}

function renderSpriteGrid() {
  const container = $('#spritePickerGrid');
  if (!container) return;

  const list = filterSprites();
  const countEl = $('#spritePickerCount');
  if (countEl) countEl.textContent = plural(list.length, 'sprite', 'sprites');

  if (!list.length) {
    container.innerHTML = '<div style="grid-column: 1 / -1; padding: 40px 20px; text-align: center; color: var(--paper-dim);">Nenhuma sprite encontrada com os filtros atuais.</div>';
    return;
  }

  container.innerHTML = list.map(sp => {
    const isSel = sp.value.toLowerCase() === selectedSprite.toLowerCase();
    return `
      <div class="sprite-card${isSel ? ' selected' : ''}" data-sprite="${esc(sp.value)}" title="${esc(sp.value)}">
        <div class="sprite-card-thumb-wrap">
          <img src="${sp.thumb}" alt="${esc(sp.name)}" loading="lazy">
        </div>
        <div class="sprite-card-lib">${esc(sp.lib)}</div>
        <div class="sprite-card-name">${esc(sp.name)}</div>
      </div>
    `;
  }).join('');

  container.onclick = (e) => {
    const card = e.target.closest('.sprite-card');
    if (!card) return;
    const val = card.dataset.sprite;
    if (!val) return;
    selectedSprite = val;
    $$('.sprite-card', container).forEach(c => c.classList.toggle('selected', c === card));
    updateSpritePreview(val);
  };

  container.ondblclick = (e) => {
    const card = e.target.closest('.sprite-card');
    if (!card) return;
    applySelectedSprite();
  };
}

function updateSpritePreview(spriteVal) {
  let thumbUrl = '';
  const found = TEXTDRAW_SPRITES.find(s => s.value.toLowerCase() === (spriteVal || '').toLowerCase());
  if (found && found.thumb) {
    thumbUrl = found.thumb;
  } else {
    const [lib, name] = spriteVal.includes(':') ? spriteVal.split(':') : ['hud', spriteVal];
    const normLib = (lib.toLowerCase() === 'ld_loadscs' || lib.toLowerCase() === 'loadscs') ? 'loadsuk' : lib.toLowerCase();
    const normName = (normLib === 'loadsuk' && (name || '').toLowerCase() === 'loadsc0') ? 'loadscuk' : (name || '').toLowerCase();
    thumbUrl = `/cache/sprites/${normLib}/${normName}.png`;
  }

  const prevImg = $('#prevSpriteImg');
  const prevTitle = $('#prevSpriteTitle');
  const prevSub = $('#prevSpriteSub');
  const prevCode = $('#prevSpriteCode');
  const btnApply = $('#btnApplySelectedSprite');

  if (prevImg) {
    prevImg.onerror = null;
    prevImg.src = thumbUrl;
  }
  const [libName, texName] = spriteVal.includes(':') ? spriteVal.split(':') : ['hud', spriteVal];
  if (prevTitle) prevTitle.textContent = texName || spriteVal;
  if (prevSub) prevSub.textContent = `Biblioteca TXD: ${libName}.txd · Textura: ${texName || spriteVal}`;
  if (prevCode) prevCode.textContent = `TextDrawCreate(x, y, "${spriteVal}");`;
  if (btnApply) {
    btnApply.disabled = false;
    btnApply.innerHTML = `<svg><use href="#i-check"/></svg> Usar Sprite "${esc(spriteVal)}"`;
  }
}

function applySelectedSprite() {
  const dlg = $('#dlgSpritePicker');
  if (onSelectCallback) {
    onSelectCallback(selectedSprite);
  }
  try { dlg?.close(); } catch (_) {}
  toast(`Sprite "${selectedSprite}" selecionada!`, 'ok', 2000);
}
