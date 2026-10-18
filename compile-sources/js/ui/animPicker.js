// Seletor Modal de Animações com Split View (Painel de Prévia em Vídeo e Cache Offline)
import { $, $$, esc, toast } from './common.js';
import { POPULAR_ANIMATIONS, ALL_ANIMATIONS, ANIM_CATEGORIES, classifyAnim } from '../world/actors.js';

let activeCategory = 'todas';
let currentSearch = '';
let onSelectCallback = null;
let previewedAnim = null;
let initialized = false;
let statusPollInterval = null;

export function setupAnimPicker() {
  const dlg = $('#dlgAnimPicker');
  if (!dlg || initialized) return;
  initialized = true;

  const inputSearch = $('#animPickerSearch');
  const catContainer = $('#animPickerCategories');
  const listContainer = $('#animPickerList');
  const btnClear = $('#btnAnimPickerClear');
  const btnApply = $('#btnApplySelectedAnim');
  const btnDownloadAll = $('#btnDownloadAllAnims');

  // Fechar dialog
  const closeBtns = dlg.querySelectorAll('#btnCloseAnimPicker, #btnCloseAnimPickerX, [value="close"]');
  closeBtns.forEach(b => {
    b.onclick = (e) => {
      e.preventDefault();
      stopVideoPreview();
      clearInterval(statusPollInterval);
      try { dlg.close(); } catch (_) {}
    };
  });

  // Limpar animação do actor
  if (btnClear) {
    btnClear.onclick = () => {
      if (onSelectCallback) onSelectCallback(null);
      stopVideoPreview();
      dlg.close();
      toast('Animação removida do actor.', 'info', 2500);
    };
  }

  // Botão aplicar animação selecionada
  if (btnApply) {
    btnApply.onclick = () => {
      if (previewedAnim && onSelectCallback) {
        applyAnim(previewedAnim);
      }
    };
  }

  // Botão baixar pacote offline
  if (btnDownloadAll) {
    btnDownloadAll.onclick = async () => {
      const status = await getCacheStatus();
      if (status && status.isDownloading) {
        await fetch('/api/anim_cache/cancel', { method: 'POST' });
        toast('Download em lote pausado.', 'info', 3000);
      } else {
        await fetch('/api/anim_cache/download_all', { method: 'POST' });
        toast('Download do pacote offline iniciado em segundo plano', 'ok', 4000);
      }
      refreshCacheStatusUI();
    };
  }

  // Busca em tempo real
  let searchTimer = null;
  if (inputSearch) {
    inputSearch.oninput = () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        currentSearch = (inputSearch.value || '').trim().toLowerCase();
        renderList();
      }, 100);
    };
  }

  // Categorias
  if (catContainer) {
    catContainer.innerHTML = ANIM_CATEGORIES.map(c => `
      <button type="button" class="btn small ${c.id === activeCategory ? 'primary' : 'ghost'}" data-cat="${c.id}" style="padding: 4px 10px; font-size: 12px; white-space: nowrap;">
        ${esc(c.label)}
      </button>
    `).join('');

    catContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-cat]');
      if (!btn) return;
      activeCategory = btn.dataset.cat;
      catContainer.querySelectorAll('button[data-cat]').forEach(b => {
        b.className = `btn small ${b.dataset.cat === activeCategory ? 'primary' : 'ghost'}`;
      });
      renderList();
    });
  }

  // Navegação e seleção na lista (apenas no clique para fixar a seleção)
  if (listContainer) {
    listContainer.addEventListener('click', (e) => {
      const card = e.target.closest('[data-anim-idx]');
      if (!card) return;
      const anim = getAnimFromCard(card);
      if (anim) {
        setPreview(anim, card);
      }
    });

    listContainer.addEventListener('dblclick', (e) => {
      const card = e.target.closest('[data-anim-idx]');
      if (!card) return;
      const anim = getAnimFromCard(card);
      if (anim) {
        applyAnim(anim);
      }
    });
  }
}

function getAnimFromCard(card) {
  const idx = parseInt(card.dataset.animIdx, 10);
  const source = card.dataset.animSource;
  if (source === 'pop') {
    return POPULAR_ANIMATIONS[idx];
  } else {
    return ALL_ANIMATIONS[idx];
  }
}

function setPreview(anim, activeCard = null) {
  previewedAnim = anim;

  // Atualiza destaque visual do card
  const listContainer = $('#animPickerList');
  if (listContainer) {
    listContainer.querySelectorAll('.anim-card').forEach(c => c.classList.remove('active'));
    if (activeCard) {
      activeCard.classList.add('active');
    } else {
      const match = listContainer.querySelector(`[data-anim-lib="${anim.lib}"][data-anim-name="${anim.name}"]`);
      if (match) match.classList.add('active');
    }
  }

  // Detalhes no painel direito
  const titleEl = $('#prevAnimTitle');
  const libEl = $('#prevAnimLib');
  const codeEl = $('#prevAnimCode');
  const descEl = $('#prevAnimDesc');
  const loopEl = $('#prevAnimLoop');
  const btnApply = $('#btnApplySelectedAnim');

  if (titleEl) titleEl.textContent = anim.label || anim.name;
  if (libEl) libEl.textContent = anim.lib;
  if (codeEl) codeEl.textContent = `ApplyActorAnimation(actorid, "${anim.lib}", "${anim.name}", 4.1, ${anim.loop ?? 1}, 0, 0, ${anim.freeze ?? 0}, 0);`;
  if (descEl) descEl.textContent = anim.desc || (anim.label ? `Preset: ${anim.lib}/${anim.name}` : 'Animação padrão do GTA San Andreas / .');
  if (loopEl) loopEl.textContent = (anim.loop ?? 1) ? '🔁 Loop contínuo' : '⏹ Executa 1 vez';
  if (btnApply) {
    btnApply.disabled = false;
    btnApply.innerHTML = `<svg><use href="#i-check"/></svg>Aplicar "${esc(anim.label || anim.name)}"`;
  }

  // Carrega vídeo no player
  playVideo(anim.lib, anim.name);
}

function playVideo(lib, name) {
  const video = $('#animPreviewVideo');
  const overlay = $('#animVideoOverlay');
  if (!video || !overlay) return;

  overlay.style.display = 'flex';
  overlay.innerHTML = '<span style="color:var(--gold-400);">Carregando prévia do vídeo</span>';
  video.style.display = 'none';

  const videoUrl = `/api/anim_video?lib=${encodeURIComponent(lib)}&name=${encodeURIComponent(name)}`;

  video.onloadeddata = () => {
    overlay.style.display = 'none';
    video.style.display = 'block';
    video.play().catch(() => {});
  };

  video.onerror = () => {
    overlay.style.display = 'flex';
    overlay.innerHTML = '<span>Vídeo não disponível<br><small style="color:var(--paper-mute);">Você pode aplicar a animação normalmente.</small></span>';
    video.style.display = 'none';
  };

  video.src = videoUrl;
  video.load();
}

function stopVideoPreview() {
  const video = $('#animPreviewVideo');
  if (video) {
    try {
      video.pause();
      video.removeAttribute('src');
      video.load();
    } catch (_) {}
  }
}

function applyAnim(anim) {
  if (onSelectCallback) {
    onSelectCallback({
      lib: anim.lib,
      name: anim.name,
      label: anim.label || anim.name,
      delta: 4.1,
      loop: anim.loop ?? 1,
      freeze: anim.freeze ?? 0,
      lockx: 0,
      locky: 0,
      time: 0
    });
  }
  stopVideoPreview();
  clearInterval(statusPollInterval);
  const dlg = $('#dlgAnimPicker');
  if (dlg) dlg.close();
}

function getFilteredList() {
  const norm = currentSearch;
  let items = [];

  if (activeCategory === 'populares') {
    items = POPULAR_ANIMATIONS.map((an, i) => ({
      idx: i,
      source: 'pop',
      lib: an.lib,
      name: an.name,
      label: an.label,
      desc: `Preset: ${an.lib}/${an.name}`,
      loop: an.loop,
      freeze: an.freeze
    }));
  } else {
    for (let i = 0; i < ALL_ANIMATIONS.length; i++) {
      const an = ALL_ANIMATIONS[i];
      if (activeCategory !== 'todas') {
        const cat = classifyAnim(an);
        if (cat !== activeCategory) continue;
      }
      items.push({
        idx: i,
        source: 'all',
        lib: an.lib,
        name: an.name,
        label: an.name,
        desc: an.desc || '',
        loop: an.loop,
        freeze: an.freeze
      });
    }
  }

  if (norm) {
    items = items.filter(it => 
      it.name.toLowerCase().includes(norm) ||
      it.lib.toLowerCase().includes(norm) ||
      (it.label && it.label.toLowerCase().includes(norm)) ||
      (it.desc && it.desc.toLowerCase().includes(norm))
    );
  }

  return items;
}

function renderList() {
  const listContainer = $('#animPickerList');
  if (!listContainer) return;

  const items = getFilteredList();

  if (items.length === 0) {
    listContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px 16px; color: var(--paper-dim);">
        <p style="font-size: 15px; margin: 0 0 6px;">Nenhuma animação encontrada.</p>
        <p style="font-size: 12px; margin: 0; color: var(--paper-mute);">Tente buscar por outro termo ou selecione a categoria "Todas".</p>
      </div>`;
    return;
  }

  listContainer.innerHTML = items.map(it => {
    const isActive = previewedAnim && previewedAnim.name === it.name && previewedAnim.lib === it.lib;
    return `
      <div class="anim-card ${isActive ? 'active' : ''}" data-anim-idx="${it.idx}" data-anim-source="${it.source}" data-anim-lib="${esc(it.lib)}" data-anim-name="${esc(it.name)}">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
          <span style="font-weight: 600; font-size: 12.5px; color: var(--paper); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${esc(it.label || it.name)}</span>
          <span style="font-size: 9.5px; font-weight: 700; padding: 2px 5px; border-radius: 4px; background: var(--asphalt-600); color: var(--gold-400); font-family: monospace;">${esc(it.lib)}</span>
        </div>
        <div style="font-size: 11px; color: var(--paper-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${it.label ? `<span style="color:var(--paper-mute);">${esc(it.lib)}:</span> ` : ''}<code style="color: var(--paper);">${esc(it.name)}</code>
        </div>
        ${it.desc ? `<div style="font-size: 10.5px; color: var(--paper-mute); line-height: 1.25; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${esc(it.desc)}</div>` : ''}
      </div>
    `;
  }).join('');

  // Pré-seleciona a primeira animação caso não haja nenhuma ativa
  if (!previewedAnim && items.length > 0) {
    const firstAnim = items[0].source === 'pop' ? POPULAR_ANIMATIONS[items[0].idx] : ALL_ANIMATIONS[items[0].idx];
    setPreview(firstAnim);
  }
}

async function getCacheStatus() {
  try {
    const r = await (await fetch('/api/anim_cache/status')).json();
    return r;
  } catch {
    return null;
  }
}

async function refreshCacheStatusUI() {
  const badge = $('#animCacheBadge');
  const btnText = $('#btnDownloadAllText');
  const status = await getCacheStatus();
  if (!status) return;

  const total = status.total || 1872;
  const cached = status.cached || 0;
  const pct = Math.round((cached / total) * 100);

  if (badge) {
    if (status.isDownloading) {
      badge.textContent = `📥 Baixando offline: ${status.progress}/${total} (${pct}%)`;
      badge.style.background = 'var(--gold-400)';
      badge.style.color = '#000';
    } else if (cached >= total) {
      badge.textContent = `💾 100% Offline (${cached} vídeos salvos)`;
      badge.style.background = '#22c55e';
      badge.style.color = '#fff';
    } else {
      badge.textContent = `💾 ${cached} de ${total} em cache local (${pct}%)`;
      badge.style.background = 'var(--asphalt-600)';
      badge.style.color = 'var(--paper-dim)';
    }
  }

  if (btnText) {
    if (status.isDownloading) {
      btnText.textContent = `Pausar download (${status.progress}/${total} - ${pct}%)`;
    } else if (cached >= total) {
      btnText.textContent = `Pacote offline completo (${cached} vídeos)`;
    } else {
      btnText.textContent = `Baixar pacote offline (${cached}/${total} - ~320 MB)`;
    }
  }
}

export function openAnimPicker(onSelect, initialAnim = null) {
  setupAnimPicker();
  onSelectCallback = onSelect;
  const dlg = $('#dlgAnimPicker');
  if (!dlg) return;

  const inputSearch = $('#animPickerSearch');
  if (inputSearch) inputSearch.value = currentSearch = '';

  activeCategory = 'todas';
  const catContainer = $('#animPickerCategories');
  if (catContainer) {
    catContainer.querySelectorAll('button[data-cat]').forEach(b => {
      b.className = `btn small ${b.dataset.cat === activeCategory ? 'primary' : 'ghost'}`;
    });
  }

  if (initialAnim && initialAnim.lib && initialAnim.name) {
    previewedAnim = initialAnim;
  } else {
    previewedAnim = ALL_ANIMATIONS[0];
  }

  renderList();
  setPreview(previewedAnim);

  refreshCacheStatusUI();
  clearInterval(statusPollInterval);
  statusPollInterval = setInterval(refreshCacheStatusUI, 2000);

  dlg.showModal();
}
