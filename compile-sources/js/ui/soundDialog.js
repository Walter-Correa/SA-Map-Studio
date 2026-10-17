// Catálogo completo de sons do SA-MP / open.mp (PlayerPlaySound) com prévia de áudio real do GTA SA
import { SOUND_CATALOG, SOUND_CATEGORIES, getSoundInfo } from '../world/sounds.js';
import { makeSound } from '../editor/project.js';
import { app, $, $$, esc, toast, copyText } from './common.js';

let dialogEl = null;
let currentAudio = null;
let playingSoundId = null;
let selectedSoundId = 1052;
let activeCategory = 'Todas';
let onSelectCallback = null;

export function playSoundPreview(soundid) {
  stopSoundPreview();
  const id = Number(soundid) || 0;
  if (id <= 0) {
    toast('Este Sound ID é um comando de parada (Stop) e não possui som audível.', 'info');
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
      toast(`Prévia de áudio não disponível nos bancos locais para o Sound ID ${id}.`, 'warn');
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

  const closeFooterBtn = dialogEl.querySelector('#sndBtnClose');
  if (closeFooterBtn) {
    closeFooterBtn.onclick = () => {
      stopSoundPreview();
      dialogEl.close();
    };
  }

  dialogEl.addEventListener('close', () => stopSoundPreview());

  const searchInp = dialogEl.querySelector('#sndSearch');
  if (searchInp) {
    searchInp.oninput = () => renderSoundList();
  }

  const catWrap = dialogEl.querySelector('#sndCategories');
  if (catWrap) {
    catWrap.innerHTML = SOUND_CATEGORIES.map(c =>
      `<button type="button" class="btn small ${c === activeCategory ? 'active' : ''}" data-snd-cat="${esc(c)}">${esc(c)}</button>`
    ).join('');
    catWrap.querySelectorAll('[data-snd-cat]').forEach(btn => {
      btn.onclick = () => {
        activeCategory = btn.dataset.sndCat;
        catWrap.querySelectorAll('[data-snd-cat]').forEach(b => b.classList.toggle('active', b === btn));
        renderSoundList();
      };
    });
  }

  const btnStop = dialogEl.querySelector('#sndBtnStop');
  if (btnStop) {
    btnStop.onclick = () => stopSoundPreview();
  }

  const btnCopy = dialogEl.querySelector('#sndBtnCopyCode');
  if (btnCopy) {
    btnCopy.onclick = () => {
      const code = `PlayerPlaySound(playerid, ${selectedSoundId}, 0.0, 0.0, 0.0);`;
      copyText(code);
      toast(`Copiado: ${code}`, 'ok');
    };
  }

  const btnPlaceCam = dialogEl.querySelector('#sndBtnPlaceCam');
  if (btnPlaceCam) {
    btnPlaceCam.onclick = () => {
      if (onSelectCallback) {
        onSelectCallback(selectedSoundId);
        stopSoundPreview();
        dialogEl.close();
        return;
      }
      const pos = app.editor ? app.editor.pointInFront(10) : { x: 0, y: 0, z: 5 };
      const info = getSoundInfo(selectedSoundId);
      const item = makeSound({
        soundid: selectedSoundId,
        x: pos.x,
        y: pos.y,
        z: pos.z,
        comment: info.desc || info.name,
      });
      app.project.addItems('Adicionar Som (PlayerPlaySound)', 'sounds', [item]);
      app.editor?.syncAll();
      app.editor?.select([item.uid]);
      stopSoundPreview();
      dialogEl.close();
      toast(`Som #${selectedSoundId} adicionado ao projeto!`, 'ok');
    };
  }

  const btnPlaceClick = dialogEl.querySelector('#sndBtnPlaceMap');
  if (btnPlaceClick) {
    btnPlaceClick.onclick = () => {
      const targetId = selectedSoundId;
      stopSoundPreview();
      dialogEl.close();
      toast(`Clique no mapa 3D para posicionar o Som #${targetId} (Esc cancela)`, 'info', 4000);
      const canvas = app.editor.renderer.domElement;
      const onPointerDown = (e) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        cleanup();
        const pt = app.editor.groundPointFromEvent(e) || app.editor.pointInFront(12);
        const info = getSoundInfo(targetId);
        const item = makeSound({
          soundid: targetId,
          x: pt.x,
          y: pt.y,
          z: pt.z,
          comment: info.desc || info.name,
        });
        app.project.addItems('Adicionar Som no Mapa', 'sounds', [item]);
        app.editor.syncAll();
        app.editor.select([item.uid]);
        toast(`Som #${targetId} posicionado no mapa!`, 'ok');
      };
      const onKeyDown = (e) => { if (e.key === 'Escape') cleanup(); };
      const cleanup = () => {
        canvas.removeEventListener('pointerdown', onPointerDown, true);
        window.removeEventListener('keydown', onKeyDown, true);
      };
      canvas.addEventListener('pointerdown', onPointerDown, true);
      window.addEventListener('keydown', onKeyDown, true);
    };
  }
}

function updateSelectedSoundBar() {
  if (!dialogEl) return;
  const info = getSoundInfo(selectedSoundId);
  const lbl = dialogEl.querySelector('#sndSelectedLabel');
  if (lbl) {
    lbl.innerHTML = `<b>ID ${info.id}</b> — ${esc(info.desc || info.name)} <small style="color:var(--text-dim);">(${esc(info.name)})</small>`;
  }
  const btnPlaceCam = dialogEl.querySelector('#sndBtnPlaceCam');
  if (btnPlaceCam) {
    btnPlaceCam.innerHTML = onSelectCallback
      ? `<svg><use href="#i-check"/></svg> Selecionar Som #${selectedSoundId}`
      : `<svg><use href="#i-plus"/></svg> Criar na Câmera (#${selectedSoundId})`;
  }
}

function renderSoundList() {
  if (!dialogEl) return;
  const listEl = dialogEl.querySelector('#sndList');
  if (!listEl) return;
  const q = (dialogEl.querySelector('#sndSearch')?.value || '').trim().toLowerCase();

  const filtered = SOUND_CATALOG.filter(s => {
    if (activeCategory !== 'Todas' && s.category !== activeCategory) return false;
    if (!q) return true;
    return String(s.id).includes(q) || s.name.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
  });

  const countEl = dialogEl.querySelector('#sndCountLabel');
  if (countEl) {
    countEl.textContent = `${filtered.length} de ${SOUND_CATALOG.length} sons`;
  }

  listEl.innerHTML = filtered.map(s => {
    const isSel = s.id === selectedSoundId;
    const isPlaying = s.id === playingSoundId;
    return `
      <div class="snd-row ${isSel ? 'selected' : ''}" data-snd-row="${s.id}">
        <div class="snd-id-badge">#${s.id}</div>
        <div class="snd-main">
          <div class="snd-title">${esc(s.desc || s.name)} <span class="tag">${esc(s.category)}</span></div>
          <div class="snd-sub">${esc(s.name)}</div>
        </div>
        <div class="snd-actions">
          <button type="button" class="btn small ${isPlaying ? 'primary' : ''}" data-snd-play="${s.id}" title="Ouvir prévia do som #${s.id}">
            <svg><use href="#i-${isPlaying ? 'stop' : 'play'}"/></svg> ${isPlaying ? 'Tocando' : 'Ouvir'}
          </button>
          <button type="button" class="btn icon small" data-snd-copy="${s.id}" title="Copiar PlayerPlaySound(${s.id})">
            <svg><use href="#i-copy"/></svg>
          </button>
        </div>
      </div>
    `;
  }).join('');

  listEl.querySelectorAll('[data-snd-row]').forEach(row => {
    row.onclick = (e) => {
      if (e.target.closest('button')) return;
      selectedSoundId = parseInt(row.dataset.sndRow, 10);
      listEl.querySelectorAll('.snd-row').forEach(r => r.classList.toggle('selected', r === row));
      updateSelectedSoundBar();
    };
    row.ondblclick = () => {
      selectedSoundId = parseInt(row.dataset.sndRow, 10);
      updateSelectedSoundBar();
      playSoundPreview(selectedSoundId);
    };
  });

  listEl.querySelectorAll('[data-snd-play]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.sndPlay, 10);
      selectedSoundId = id;
      listEl.querySelectorAll('.snd-row').forEach(r => r.classList.toggle('selected', parseInt(r.dataset.sndRow, 10) === id));
      updateSelectedSoundBar();
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
  if (options.currentSoundId !== undefined) {
    selectedSoundId = Number(options.currentSoundId) || 1052;
  }
  updateSelectedSoundBar();
  renderSoundList();
  if (!dialogEl.open) dialogEl.showModal();
  setTimeout(() => {
    const selRow = dialogEl.querySelector(`.snd-row[data-snd-row="${selectedSoundId}"]`);
    if (selRow) selRow.scrollIntoView({ block: 'nearest' });
  }, 50);
}
