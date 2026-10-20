// Sound catalog (PlayerPlaySound) with real GTA SA audio preview
import { SOUND_CATALOG, SOUND_CATEGORIES, getSoundInfo } from '../world/sounds.js';
import { app, $, $$, esc, toast, copyText } from './common.js';

let dialogEl = null;
let currentAudio = null;
let playingSoundId = null;
let userSelectedSoundId = null;
let selectedSoundId = 0;
let activeCategory = 'Todos';
let onSelectCallback = null;

export function playSoundPreview(soundid) {
  stopSoundPreview();
  const id = Number(soundid) || 0;
  if (id <= 0) {
    toast('Sound ID 0 é o comando de parada (Stop) no SA-MP.', 'info');
    return;
  }
  playingSoundId = id;
  updatePlayingStateUI();

  const audio = new Audio(`/api/sound/${id}`);
  currentAudio = audio;
  audio.volume = 0.85;
  audio.onended = () => {
    if (currentAudio === audio) {
      playingSoundId = null;
      currentAudio = null;
      updatePlayingStateUI();
    }
  };
  audio.onerror = () => {
    if (currentAudio === audio) {
      playingSoundId = null;
      currentAudio = null;
      updatePlayingStateUI();
      toast(`Prévia de áudio não disponível para o Sound ID ${id}.`, 'warn');
    }
  };
  audio.play().catch(() => {
    if (currentAudio === audio) {
      playingSoundId = null;
      currentAudio = null;
      updatePlayingStateUI();
    }
  });
}

export function stopSoundPreview() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.src = '';
    } catch {}
    currentAudio = null;
  }
  playingSoundId = null;
  updatePlayingStateUI();
}

function updatePlayingStateUI() {
  if (!dialogEl) return;
  dialogEl.querySelectorAll('[data-snd-play]').forEach(btn => {
    const id = parseInt(btn.dataset.sndPlay, 10);
    if (id === playingSoundId) {
      btn.classList.add('primary');
      btn.innerHTML = `<svg><use href="#i-stop"/></svg> Tocando`;
    } else {
      btn.classList.remove('primary');
      btn.innerHTML = `<svg><use href="#i-play"/></svg> Ouvir`;
    }
  });
}

export function initSoundDialog() {
  dialogEl = document.getElementById('dlgSounds');
  if (!dialogEl) return;

  const closeBtn = dialogEl.querySelector('.modal-close');
  if (closeBtn) {
    closeBtn.onclick = () => {
      stopSoundPreview();
      dialogEl.close();
    };
  }

  dialogEl.addEventListener('close', () => stopSoundPreview());

  const searchInp = dialogEl.querySelector('#sndSearch');
  if (searchInp) {
    searchInp.oninput = () => renderSoundList();
  }

  updateCategoryButtons();

  const btnStop = dialogEl.querySelector('#sndBtnStop');
  if (btnStop) {
    btnStop.onclick = () => stopSoundPreview();
  }
}

function updateCategoryButtons() {
  if (!dialogEl) return;
  const catWrap = dialogEl.querySelector('#sndCategories');
  if (!catWrap) return;

  catWrap.innerHTML = SOUND_CATEGORIES.map(c =>
    `<button type="button" class="btn small snd-cat-btn ${c === activeCategory ? 'active' : ''}" data-snd-cat="${esc(c)}">${esc(c)}</button>`
  ).join('');

  catWrap.querySelectorAll('[data-snd-cat]').forEach(btn => {
    btn.onclick = () => {
      activeCategory = btn.dataset.sndCat;
      catWrap.querySelectorAll('[data-snd-cat]').forEach(b => b.classList.toggle('active', b === btn));
      renderSoundList();
    };
  });
}

function renderSoundList() {
  if (!dialogEl) return;
  const listEl = dialogEl.querySelector('#sndList');
  if (!listEl) return;
  const q = (dialogEl.querySelector('#sndSearch')?.value || '').trim().toLowerCase();

  const filtered = SOUND_CATALOG.filter(s => {
    const cat = s.category || s.cat || '';
    if (activeCategory !== 'Todos' && activeCategory !== 'Todas' && cat !== activeCategory) return false;
    if (!q) return true;
    return String(s.id).includes(q) || (s.name && s.name.toLowerCase().includes(q)) || (s.desc && s.desc.toLowerCase().includes(q)) || cat.toLowerCase().includes(q);
  });

  const countEl = dialogEl.querySelector('#sndCountLabel');
  if (countEl) {
    countEl.textContent = `${filtered.length} de ${SOUND_CATALOG.length} sons`;
  }

  // If the selected sound is not in the filtered list, keeps the ID without forcing an arbitrary selection
  listEl.innerHTML = filtered.map(s => {
    const isSel = s.id === selectedSoundId;
    const isPlaying = s.id === playingSoundId;
    const cat = s.category || s.cat || '';
    return `
      <div class="snd-row ${isSel ? 'selected' : ''}" data-snd-row="${s.id}">
        <div class="snd-id-badge">#${s.id}</div>
        <div class="snd-main">
          <div class="snd-title">${esc(s.desc || s.name)} <span class="tag">${esc(cat)}</span></div>
          <div class="snd-sub">${esc(s.name)}</div>
        </div>
        <div class="snd-actions">
          <button type="button" class="btn small ${isPlaying ? 'primary' : ''}" data-snd-play="${s.id}" title="Ouvir prévia do som #${s.id}">
            <svg><use href="#i-${isPlaying ? 'stop' : 'play'}"/></svg> ${isPlaying ? 'Tocando' : 'Ouvir'}
          </button>
          <button type="button" class="btn icon small" data-snd-copy="${s.id}" title="Copiar PlayerPlaySound(playerid, ${s.id}, 0.0, 0.0, 0.0)">
            <svg><use href="#i-copy"/></svg>
          </button>
        </div>
      </div>
    `;
  }).join('');

  listEl.querySelectorAll('[data-snd-row]').forEach(row => {
    row.onclick = (e) => {
      if (e.target.closest('button')) return;
      const id = parseInt(row.dataset.sndRow, 10);
      userSelectedSoundId = id;
      selectedSoundId = id;
      listEl.querySelectorAll('.snd-row').forEach(r => r.classList.toggle('selected', r === row));
      // Plays automatically when the row is selected
      playSoundPreview(id);
    };
  });

  listEl.querySelectorAll('[data-snd-play]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.sndPlay, 10);
      userSelectedSoundId = id;
      selectedSoundId = id;
      listEl.querySelectorAll('.snd-row').forEach(r => r.classList.toggle('selected', parseInt(r.dataset.sndRow, 10) === id));
      if (playingSoundId === id) {
        stopSoundPreview();
      } else {
        playSoundPreview(id);
      }
    };
  });

  listEl.querySelectorAll('[data-snd-copy]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.sndCopy, 10);
      userSelectedSoundId = id;
      selectedSoundId = id;
      listEl.querySelectorAll('.snd-row').forEach(r => r.classList.toggle('selected', parseInt(r.dataset.sndRow, 10) === id));
      const code = `PlayerPlaySound(playerid, ${id}, 0.0, 0.0, 0.0);`;
      copyText(code);
      toast(`Copiado: ${code}`, 'ok');
    };
  });
}

export function openSoundDialog(options = {}) {
  if (!dialogEl) initSoundDialog();
  if (!dialogEl) return;
  onSelectCallback = options.onSelect || null;

  // On opening it must always be in the All category
  activeCategory = 'Todos';

  // First sound in the list or the one the user selected most recently
  if (userSelectedSoundId !== null) {
    selectedSoundId = userSelectedSoundId;
  } else if (options.currentSoundId !== undefined) {
    selectedSoundId = Number(options.currentSoundId) || SOUND_CATALOG[0]?.id || 0;
  } else {
    selectedSoundId = SOUND_CATALOG[0]?.id || 0;
  }

  // Updates category buttons and renders the list
  updateCategoryButtons();
  renderSoundList();

  if (!dialogEl.open) dialogEl.showModal();

  // Scrolls to the selected item without playing automatically on open
  setTimeout(() => {
    const selRow = dialogEl.querySelector(`.snd-row[data-snd-row="${selectedSoundId}"]`);
    if (selRow) selRow.scrollIntoView({ block: 'nearest' });
  }, 50);
}
