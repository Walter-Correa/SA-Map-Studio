// Editor visual 2D de MapIcons (semelhante ao de GangZones) + Janela de Lista Visual de MapIcons (IDs 0 a 63)
import { MAP_ICONS, MAPICON_STYLES, getMapIconInfo, getMapIconUrl } from '../world/mapicons.js';
import { makeMapIcon } from '../editor/project.js';
import { app, $, $$, esc, toast, copyText } from './common.js';

let dialogEl = null;
let canvasEl = null;
let ctx = null;
let radarImg = null;
let imgLoaded = false;
let selectedUid = null;
let isDraggingIcon = null;
let isPanning = false;
let panStart = { x: 0, y: 0 };
let defaultMarkerType = 0;

const iconImages = new Map();
function getLoadedIconImage(type) {
  const id = Math.max(0, Math.min(63, Number(type) || 0));
  if (iconImages.has(id)) return iconImages.get(id);
  const img = new Image();
  img.onload = () => redrawCanvas();
  img.src = getMapIconUrl(id);
  iconImages.set(id, img);
  return img;
}

const view = {
  zoom: 1.0,
  panX: 0,
  panY: 0,
  width: 800,
  height: 600,
};

const WORLD_MIN = -3000;
const WORLD_MAX = 3000;
const WORLD_SIZE = 6000;

function worldToCanvas(wx, wy) {
  const normX = (wx - WORLD_MIN) / WORLD_SIZE;
  const normY = (WORLD_MAX - wy) / WORLD_SIZE;
  return {
    x: normX * (radarImg?.width || 1536) * view.zoom + view.panX,
    y: normY * (radarImg?.height || 1536) * view.zoom + view.panY,
  };
}

function canvasToWorld(cx, cy) {
  const imgW = (radarImg?.width || 1536) * view.zoom;
  const imgH = (radarImg?.height || 1536) * view.zoom;
  const normX = (cx - view.panX) / imgW;
  const normY = (cy - view.panY) / imgH;
  return {
    x: Math.max(WORLD_MIN, Math.min(WORLD_MAX, WORLD_MIN + normX * WORLD_SIZE)),
    y: Math.max(WORLD_MIN, Math.min(WORLD_MAX, WORLD_MAX - normY * WORLD_SIZE)),
  };
}

export function initMapIconDialog() {
  dialogEl = document.getElementById('dlgMapIcons');
  if (!dialogEl) return;

  canvasEl = dialogEl.querySelector('#miCanvas');
  if (canvasEl) {
    ctx = canvasEl.getContext('2d');
    setupCanvasEvents();
  }

  setupDialogEvents();
  setupPickerModalEvents();
}

function getSelectedMapIcon() {
  if (!selectedUid || !app.project?.mapIcons) return null;
  return app.project.mapIcons.find(m => m.uid === selectedUid) || null;
}

function findIconAtCanvas(cx, cy) {
  const list = app.project?.mapIcons || [];
  for (let i = list.length - 1; i >= 0; i--) {
    const m = list[i];
    const pt = worldToCanvas(m.x, m.y);
    if (Math.hypot(cx - pt.x, cy - pt.y) <= 14) {
      return m;
    }
  }
  return null;
}

function setupDialogEvents() {
  const closeBtn = dialogEl.querySelector('.modal-close');
  if (closeBtn) closeBtn.onclick = () => closeMapIconDialog();

  const doneBtn = dialogEl.querySelector('#miBtnDone');
  if (doneBtn) doneBtn.onclick = () => closeMapIconDialog();

  const addBtn = dialogEl.querySelector('#miBtnAdd');
  if (addBtn) {
    addBtn.onclick = () => {
      const pos = app.editor ? app.editor.pointInFront(12) : { x: 0, y: 0, z: 15 };
      if (app.editor?.getSurfaceZAt) {
        const gz = app.editor.getSurfaceZAt(pos.x, pos.y, Math.max(pos.z + 50, 100));
        if (gz !== null) pos.z = gz;
      }
      const item = makeMapIcon({
        type: defaultMarkerType,
        x: Math.round(pos.x * 100) / 100,
        y: Math.round(pos.y * 100) / 100,
        z: Math.round(pos.z * 100) / 100,
        color: 0xFF0000FF,
        style: 0,
        comment: getMapIconInfo(defaultMarkerType).label,
      });
      app.project.addItems('Criar MapIcon', 'mapIcons', [item]);
      selectedUid = item.uid;
      app.editor?.syncAll();
      updateSidebarList();
      updateSidebarFields();
      redrawCanvas();
      toast('MapIcon adicionado!', 'ok');
    };
  }

  const pickDefaultBtn = dialogEl.querySelector('#miBtnPickDefault');
  if (pickDefaultBtn) {
    pickDefaultBtn.onclick = () => {
      openMapIconPickerModal(defaultMarkerType, (newType) => {
        defaultMarkerType = newType;
        updateDefaultPickerButton();
        const sel = getSelectedMapIcon();
        if (sel) {
          app.project.updateItems('Alterar Ícone MapIcon', [sel.uid], (o) => {
            o.type = newType;
          });
          app.editor?.syncAll();
          updateSidebarList();
          updateSidebarFields();
          redrawCanvas();
        }
      });
    };
  }

  const pickSelBtn = dialogEl.querySelector('#miBtnPickSelected');
  if (pickSelBtn) {
    pickSelBtn.onclick = () => {
      const sel = getSelectedMapIcon();
      if (!sel) return;
      openMapIconPickerModal(sel.type ?? 0, (newType) => {
        defaultMarkerType = newType;
        updateDefaultPickerButton();
        app.project.updateItems('Alterar Ícone MapIcon', [sel.uid], (o) => {
          o.type = newType;
        });
        app.editor?.syncAll();
        updateSidebarList();
        updateSidebarFields();
        redrawCanvas();
      });
    };
  }

  const copyPwnBtn = dialogEl.querySelector('#miBtnCopyPwn');
  if (copyPwnBtn) {
    copyPwnBtn.onclick = () => copyAllMapIconsPawn();
  }

  const zoomInBtn = dialogEl.querySelector('#miZoomIn');
  if (zoomInBtn) {
    zoomInBtn.onclick = () => {
      view.zoom = Math.min(8.0, view.zoom * 1.3);
      redrawCanvas();
    };
  }

  const zoomOutBtn = dialogEl.querySelector('#miZoomOut');
  if (zoomOutBtn) {
    zoomOutBtn.onclick = () => {
      view.zoom = Math.max(0.3, view.zoom / 1.3);
      redrawCanvas();
    };
  }

  const resetViewBtn = dialogEl.querySelector('#miResetView');
  if (resetViewBtn) {
    resetViewBtn.onclick = () => {
      fitMapToView();
      redrawCanvas();
    };
  }

  const undoBtn = dialogEl.querySelector('#miBtnUndo');
  if (undoBtn) {
    undoBtn.onclick = () => {
      app.project?.undo();
      app.editor?.syncAll();
      updateSidebarList();
      updateSidebarFields();
      redrawCanvas();
    };
  }

  const redoBtn = dialogEl.querySelector('#miBtnRedo');
  if (redoBtn) {
    redoBtn.onclick = () => {
      app.project?.redo();
      app.editor?.syncAll();
      updateSidebarList();
      updateSidebarFields();
      redrawCanvas();
    };
  }

  dialogEl.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      const m = getSelectedMapIcon();
      if (!m) return;
      e.preventDefault();
      app.project.deleteItems('Apagar MapIcon', [m.uid]);
      selectedUid = app.project.mapIcons?.[0]?.uid || null;
      app.editor?.syncAll();
      updateSidebarList();
      updateSidebarFields();
      redrawCanvas();
      toast('MapIcon removido', 'info');
    } else if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
      e.preventDefault();
      if (e.shiftKey) app.project?.redo();
      else app.project?.undo();
      app.editor?.syncAll();
      updateSidebarList();
      updateSidebarFields();
      redrawCanvas();
    } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
      e.preventDefault();
      app.project?.redo();
      app.editor?.syncAll();
      updateSidebarList();
      updateSidebarFields();
      redrawCanvas();
    }
  });

  const bindField = (selId, prop, isInt = false) => {
    const el = dialogEl.querySelector(selId);
    if (!el) return;
    el.onchange = () => {
      const m = getSelectedMapIcon();
      if (!m) return;
      if (prop === 'comment') {
        m.comment = el.value.trim();
      } else if (prop === 'color') {
        let s = el.value.trim().replace(/^#/, '0x');
        if (!s.startsWith('0x') && !s.startsWith('0X')) s = '0x' + s;
        const num = parseInt(s, 16);
        if (Number.isFinite(num)) m.color = num >>> 0;
      } else {
        const v = parseFloat(el.value);
        if (Number.isFinite(v)) {
          m[prop] = isInt ? Math.trunc(v) : v;
        }
      }
      app.editor?.syncAll();
      updateSidebarList();
      updateSidebarFields();
      redrawCanvas();
    };
  };

  bindField('#miFieldComment', 'comment');
  bindField('#miFieldX', 'x');
  bindField('#miFieldY', 'y');
  bindField('#miFieldZ', 'z');
  bindField('#miFieldType', 'type', true);
  bindField('#miFieldStyle', 'style', true);
  bindField('#miFieldColor', 'color');

  const btnFocus3D = dialogEl.querySelector('#miBtnFocus3D');
  if (btnFocus3D) {
    btnFocus3D.onclick = () => {
      const m = getSelectedMapIcon();
      if (!m) return;
      closeMapIconDialog();
      app.editor.select([m.uid]);
      app.editor.focusSelection();
      setTimeout(() => {
        app.editor?.dropToGround();
      }, 100);
      setTimeout(() => {
        app.editor?.dropToGround();
      }, 350);
    };
  }

  const btnDel = dialogEl.querySelector('#miBtnDelete');
  if (btnDel) {
    btnDel.onclick = () => {
      const m = getSelectedMapIcon();
      if (!m) return;
      app.project.deleteItems('Apagar MapIcon', [m.uid]);
      selectedUid = app.project.mapIcons?.[0]?.uid || null;
      app.editor?.syncAll();
      updateSidebarList();
      updateSidebarFields();
      redrawCanvas();
      toast('MapIcon removido', 'info');
    };
  }
}

function setupCanvasEvents() {
  canvasEl.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect = canvasEl.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const newZoom = Math.max(0.2, Math.min(10.0, view.zoom * zoomFactor));
    view.panX = mx - (mx - view.panX) * (newZoom / view.zoom);
    view.panY = my - (my - view.panY) * (newZoom / view.zoom);
    view.zoom = newZoom;
    redrawCanvas();
  });

  canvasEl.addEventListener('contextmenu', (e) => e.preventDefault());

  canvasEl.addEventListener('mousedown', (e) => {
    const rect = canvasEl.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const w = canvasToWorld(cx, cy);

    if (e.button === 2 || e.button === 1 || e.shiftKey || e.altKey) {
      isPanning = true;
      panStart = { x: e.clientX - view.panX, y: e.clientY - view.panY };
      canvasEl.style.cursor = 'grabbing';
      return;
    }

    if (e.button === 0) {
      const hit = findIconAtCanvas(cx, cy);
      if (hit) {
        selectedUid = hit.uid;
        isDraggingIcon = hit;
        updateSidebarList();
        updateSidebarFields();
        redrawCanvas();
        return;
      }

      let zGuess = 15.0;
      if (app.editor?.getSurfaceZAt) {
        const gz = app.editor.getSurfaceZAt(w.x, w.y);
        if (gz !== null) zGuess = Math.round(gz * 100) / 100;
      }
      const item = makeMapIcon({
        type: defaultMarkerType,
        x: Math.round(w.x * 100) / 100,
        y: Math.round(w.y * 100) / 100,
        z: zGuess,
        color: 0xFF0000FF,
        style: 0,
        comment: getMapIconInfo(defaultMarkerType).label,
      });
      app.project.addItems('Criar MapIcon no Mapa 2D', 'mapIcons', [item]);
      selectedUid = item.uid;
      isDraggingIcon = item;
      app.editor?.syncAll();
      updateSidebarList();
      updateSidebarFields();
      redrawCanvas();
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (!dialogEl || !dialogEl.classList.contains('open')) return;
    const rect = canvasEl.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const w = canvasToWorld(cx, cy);

    const hudCoords = dialogEl.querySelector('#miHudCoords');
    if (hudCoords) {
      hudCoords.textContent = `X: ${w.x.toFixed(1)} | Y: ${w.y.toFixed(1)}`;
    }

    if (isPanning) {
      view.panX = e.clientX - panStart.x;
      view.panY = e.clientY - panStart.y;
      redrawCanvas();
      return;
    }

    if (isDraggingIcon) {
      isDraggingIcon.x = Math.round(w.x * 100) / 100;
      isDraggingIcon.y = Math.round(w.y * 100) / 100;
      app.editor?.syncAll();
      updateSidebarFields();
      updateSidebarList();
      redrawCanvas();
      return;
    }

    const hit = findIconAtCanvas(cx, cy);
    canvasEl.style.cursor = hit ? 'move' : 'crosshair';
  });

  window.addEventListener('mouseup', () => {
    if (isPanning) {
      isPanning = false;
      if (canvasEl) canvasEl.style.cursor = 'crosshair';
    }
    if (isDraggingIcon) {
      isDraggingIcon = null;
      redrawCanvas();
    }
  });
}

function updateDefaultPickerButton() {
  const btn = dialogEl?.querySelector('#miBtnPickDefault');
  if (!btn) return;
  const info = getMapIconInfo(defaultMarkerType);
  btn.innerHTML = `<img src="${getMapIconUrl(defaultMarkerType)}" width="20" height="20" style="image-rendering:pixelated; vertical-align:middle;"> <span>Ícone Padrão: #${defaultMarkerType} (${esc(info.label)})</span>`;
}

export function openMapIconDialog() {
  if (!dialogEl) initMapIconDialog();
  if (!dialogEl) return;
  if (!dialogEl.open) dialogEl.showModal();
  dialogEl.classList.add('open');

  const wrap = dialogEl.querySelector('#miCanvasWrap');
  if (wrap && canvasEl) {
    canvasEl.width = wrap.clientWidth || 800;
    canvasEl.height = wrap.clientHeight || 600;
    view.width = canvasEl.width;
    view.height = canvasEl.height;
  }

  if (!selectedUid && app.project?.mapIcons?.length) {
    selectedUid = app.project.mapIcons[0].uid;
  }

  updateDefaultPickerButton();

  if (!radarImg) {
    loadRadarMap();
  } else {
    fitMapToView();
    redrawCanvas();
  }

  updateSidebarList();
  updateSidebarFields();
}

export function closeMapIconDialog() {
  if (!dialogEl) return;
  if (dialogEl.open) dialogEl.close();
  dialogEl.classList.remove('open');
}

function fitMapToView() {
  if (!radarImg) return;
  const scaleX = view.width / radarImg.width;
  const scaleY = view.height / radarImg.height;
  view.zoom = Math.min(scaleX, scaleY) * 0.95;
  view.panX = (view.width - radarImg.width * view.zoom) / 2;
  view.panY = (view.height - radarImg.height * view.zoom) / 2;
}

function loadRadarMap() {
  radarImg = new Image();
  radarImg.onload = () => {
    imgLoaded = true;
    fitMapToView();
    redrawCanvas();
  };
  radarImg.src = '/api/radarmap?v=' + Date.now();
}

function redrawCanvas() {
  if (!ctx || !canvasEl) return;
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  ctx.fillStyle = '#161922';
  ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

  if (imgLoaded && radarImg) {
    ctx.drawImage(radarImg, view.panX, view.panY, radarImg.width * view.zoom, radarImg.height * view.zoom);
  }

  const tl = worldToCanvas(WORLD_MIN, WORLD_MAX);
  const br = worldToCanvas(WORLD_MAX, WORLD_MIN);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);

  const list = app.project?.mapIcons || [];
  for (const m of list) {
    const pt = worldToCanvas(m.x, m.y);
    const isSel = m.uid === selectedUid;
    const size = isSel ? 28 : 22;

    if (isSel) {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 18, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(245, 180, 0, 0.32)';
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    const img = getLoadedIconImage(m.type ?? 0);
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, pt.x - size / 2, pt.y - size / 2, size, size);
    } else {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(pt.x - 6, pt.y - 6, 12, 12);
    }
  }
}

function updateSidebarList() {
  const listEl = dialogEl?.querySelector('#miList');
  if (!listEl) return;
  listEl.innerHTML = '';

  const list = app.project?.mapIcons || [];
  if (!list.length) {
    listEl.innerHTML = '<div style="color:var(--text-muted); font-size:12px; padding:12px; text-align:center;">Nenhum MapIcon criado.<br>Clique em qualquer ponto do mapa ao lado para posicionar.</div>';
    return;
  }

  list.forEach((m, idx) => {
    const item = document.createElement('div');
    item.className = 'gz-list-item' + (m.uid === selectedUid ? ' selected' : '');
    const info = getMapIconInfo(m.type ?? 0);
    item.innerHTML = `
      <img src="${getMapIconUrl(m.type ?? 0)}" width="24" height="24" style="image-rendering:pixelated; flex-shrink:0;">
      <div class="gz-info">
        <span class="gz-title">#${m.type ?? 0} · ${esc(m.comment || info.label)}</span>
        <span class="gz-sub">Slot ${idx} · (${m.x.toFixed(1)}, ${m.y.toFixed(1)}, ${m.z.toFixed(1)})</span>
      </div>
    `;
    item.onclick = () => {
      selectedUid = m.uid;
      updateSidebarList();
      updateSidebarFields();
      redrawCanvas();
    };
    listEl.appendChild(item);
  });
}

function updateSidebarFields() {
  const panel = dialogEl?.querySelector('#miDetailsPanel');
  const m = getSelectedMapIcon();
  if (!m) {
    if (panel) panel.style.display = 'none';
    return;
  }
  if (panel) panel.style.display = 'block';

  const info = getMapIconInfo(m.type ?? 0);
  const btnPickSel = dialogEl.querySelector('#miBtnPickSelected');
  if (btnPickSel) {
    btnPickSel.innerHTML = `<img src="${getMapIconUrl(m.type ?? 0)}" width="22" height="22" style="image-rendering:pixelated;"> <span>#${m.type ?? 0} - ${esc(info.label)} (Trocar)</span>`;
  }

  const setVal = (sel, v) => {
    const el = dialogEl.querySelector(sel);
    if (el) el.value = v;
  };
  setVal('#miFieldComment', m.comment || '');
  setVal('#miFieldX', m.x);
  setVal('#miFieldY', m.y);
  setVal('#miFieldZ', m.z);
  setVal('#miFieldType', m.type ?? 0);
  setVal('#miFieldStyle', m.style ?? 0);
  setVal('#miFieldColor', '0x' + ((m.color ?? 0xFF0000FF) >>> 0).toString(16).toUpperCase().padStart(8, '0'));
}

function copyAllMapIconsPawn() {
  const list = app.project?.mapIcons || [];
  if (!list.length) {
    toast('Nenhum MapIcon para copiar', 'info');
    return;
  }
  const lines = ['// MapIcons (SetPlayerMapIcon) gerados pelo SA Map Studio'];
  list.forEach((m, i) => {
    const cHex = '0x' + ((m.color ?? 0) >>> 0).toString(16).toUpperCase().padStart(8, '0');
    const comm = m.comment ? ` // ${m.comment}` : '';
    lines.push(`SetPlayerMapIcon(playerid, ${i % 100}, ${m.x.toFixed(4)}, ${m.y.toFixed(4)}, ${m.z.toFixed(4)}, ${m.type ?? 0}, ${cHex}, ${m.style ?? 0});${comm}`);
  });
  copyText(lines.join('\n'));
  toast(`${list.length} MapIcon(s) copiado(s) em formato Pawn!`, 'ok');
}

// ============================================================================
// Modal Seletor Visual de MapIcons (64 ícones oficiais 0 a 63)
// ============================================================================
let pickerModalEl = null;
let pickerCallback = null;
let currentPickerType = 0;

function setupPickerModalEvents() {
  pickerModalEl = document.getElementById('dlgMapIconPicker');
  if (!pickerModalEl) return;

  const closeBtn = pickerModalEl.querySelector('.modal-close');
  if (closeBtn) closeBtn.onclick = () => pickerModalEl.close();

  const searchInp = pickerModalEl.querySelector('#miPickerSearch');
  if (searchInp) {
    searchInp.oninput = () => renderPickerGrid(searchInp.value.trim());
  }
}

function renderPickerGrid(query = '') {
  if (!pickerModalEl) return;
  const grid = pickerModalEl.querySelector('#miPickerGrid');
  if (!grid) return;
  const q = query.toLowerCase();

  const filtered = MAP_ICONS.filter(ic => {
    if (!q) return true;
    return String(ic.id).includes(q) || ic.name.toLowerCase().includes(q) || ic.label.toLowerCase().includes(q);
  });

  grid.innerHTML = filtered.map(ic => `
    <button type="button" class="mi-picker-card ${ic.id === currentPickerType ? 'active' : ''}" data-mi-id="${ic.id}" title="ID ${ic.id}: ${esc(ic.label)} (${esc(ic.name)})">
      <div class="mi-picker-img-wrap">
        <img src="${getMapIconUrl(ic.id)}" width="32" height="32" alt="Icon ${ic.id}" style="image-rendering:pixelated;">
        <span class="mi-picker-id">#${ic.id}</span>
      </div>
      <div class="mi-picker-title">${esc(ic.label)}</div>
      <div class="mi-picker-sub">${esc(ic.name)}</div>
    </button>
  `).join('');

  grid.querySelectorAll('[data-mi-id]').forEach(btn => {
    btn.onclick = () => {
      const id = parseInt(btn.dataset.miId, 10) || 0;
      if (pickerCallback) pickerCallback(id);
      pickerModalEl.close();
    };
  });
}

export function openMapIconPickerModal(currentType = 0, onSelect = null) {
  if (!pickerModalEl) setupPickerModalEvents();
  if (!pickerModalEl) return;
  currentPickerType = Number(currentType) || 0;
  pickerCallback = onSelect;
  const searchInp = pickerModalEl.querySelector('#miPickerSearch');
  if (searchInp) searchInp.value = '';
  renderPickerGrid('');
  if (!pickerModalEl.open) pickerModalEl.showModal();
  setTimeout(() => searchInp?.focus(), 50);
}
