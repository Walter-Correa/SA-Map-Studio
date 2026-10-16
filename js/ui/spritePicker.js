// Seletor Modal de Sprites para TextDraws com Galeria Visual Completa
import { $, $$, esc, toast } from './common.js';
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

  // Botão aplicar
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

  selectedSprite = currentSprite || 'hud:arrow';
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
      if (activeLib === 'splash') {
        const l = sp.lib.toLowerCase();
        if (!l.startsWith('splash') && !l.startsWith('intro') && !l.startsWith('outro') && !l.startsWith('loadscs') && !l.startsWith('ld_loadscs')) return false;
      } else if (sp.lib.toLowerCase() !== activeLib.toLowerCase()) {
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
  if (countEl) countEl.textContent = `${list.length} ${list.length === 1 ? 'sprite' : 'sprites'}`;

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
  const [lib, name] = spriteVal.includes(':') ? spriteVal.split(':') : ['hud', spriteVal];
  const normLib = lib.toLowerCase() === 'ld_loadscs' ? 'loadscs' : lib.toLowerCase();
  const thumbUrl = `/cache/sprites/${normLib}/${name.toLowerCase()}.png`;

  const prevImg = $('#prevSpriteImg');
  const prevTitle = $('#prevSpriteTitle');
  const prevSub = $('#prevSpriteSub');
  const prevCode = $('#prevSpriteCode');
  const btnApply = $('#btnApplySelectedSprite');

  if (prevImg) {
    prevImg.onerror = null;
    prevImg.src = thumbUrl;
  }
  if (prevTitle) prevTitle.textContent = name;
  if (prevSub) prevSub.textContent = `Biblioteca TXD: ${lib}.txd · Textura: ${name}`;
  if (prevCode) prevCode.textContent = `TextDrawSetString(textdraw, "${spriteVal}");`;
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
