// 2D visual MapIcon editor (similar to the GangZone one) + Visual MapIcon List Window (IDs 0 to 63)
import { MAP_ICONS, MAPICON_STYLES, getMapIconInfo, getMapIconUrl, getNextMapIconName } from '../world/mapicons.js';
import { makeMapIcon } from '../editor/project.js';
import { app, $, $$, esc, toast, copyText, arrowStep, themeVar } from './common.js';

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

let miUndoStack = [];
let miRedoStack = [];
let dragStartMiSnapshot = null;
let dragGroup = null; // { startX, startY, items: [{ m, x, y }] } while dragging a multi-selection

function updateMiUndoButtons() {
  const btnU = dialogEl?.querySelector('#miBtnUndo');
  const btnR = dialogEl?.querySelector('#miBtnRedo');
  if (btnU) btnU.disabled = miUndoStack.length === 0;
  if (btnR) btnR.disabled = miRedoStack.length === 0;
}

// Multi-selection: with more than one icon selected, selectedUid is null and the uids live here.
// Only moving and deleting are allowed in that state.
let multiUids = new Set();

function isMulti() { return multiUids.size > 1; }

// The icons that move/delete act on: the whole multi-selection or the single selected icon
function selectedIcons() {
  const list = app.project?.mapIcons || [];
  if (isMulti()) return list.filter(m => multiUids.has(m.uid));
  const m = getSelectedMapIcon();
  return m ? [m] : [];
}

function setSelection(set) {
  if (set.size > 1) {
    multiUids = new Set(set);
    selectedUid = null;
  } else {
    multiUids = new Set();
    selectedUid = set.size === 1 ? [...set][0] : null;
  }
}

// Shift/Ctrl+click: adds or removes an icon from the selection
function toggleIconSelection(uid) {
  const cur = isMulti() ? new Set(multiUids) : new Set(selectedUid ? [selectedUid] : []);
  if (cur.has(uid)) cur.delete(uid); else cur.add(uid);
  setSelection(cur);
}

function miSnapshot() {
  return JSON.stringify({
    mapIcons: app.project?.mapIcons || [],
    selectedUid,
    multi: [...multiUids]
  });
}

function miRestore(str) {
  const st = JSON.parse(str);
  app.project.mapIcons = st.mapIcons || [];
  const ids = new Set(app.project.mapIcons.map(m => m.uid));
  const multi = (st.multi || []).filter(u => ids.has(u));
  if (multi.length > 1) {
    multiUids = new Set(multi);
    selectedUid = null;
  } else {
    multiUids = new Set();
    selectedUid = st.selectedUid;
  }
}

// Called when the whole project is closed: only then does the history start over
export function resetMapIconHistory() {
  miUndoStack = [];
  miRedoStack = [];
  selectedUid = null;
  multiUids = new Set();
  updateMiUndoButtons();
}

function miPushUndo() {
  const current = miSnapshot();
  if (miUndoStack.length > 0 && miUndoStack[miUndoStack.length - 1] === current) return;
  miUndoStack.push(current);
  if (miUndoStack.length > 50) miUndoStack.shift();
  miRedoStack = [];
  updateMiUndoButtons();
}

function miPushUndoSnapshot(snapshotStr) {
  if (!snapshotStr) return;
  if (miUndoStack.length > 0 && miUndoStack[miUndoStack.length - 1] === snapshotStr) return;
  miUndoStack.push(snapshotStr);
  if (miUndoStack.length > 50) miUndoStack.shift();
  miRedoStack = [];
  updateMiUndoButtons();
}

function miUndo() {
  if (miUndoStack.length === 0) return;
  miRedoStack.push(miSnapshot());
  miRestore(miUndoStack.pop());
  app.editor?.syncAll();
  updateSidebarList();
  updateSidebarFields();
  redrawCanvas();
  updateMiUndoButtons();
}

function miRedo() {
  if (miRedoStack.length === 0) return;
  miUndoStack.push(miSnapshot());
  miRestore(miRedoStack.pop());
  app.editor?.syncAll();
  updateSidebarList();
  updateSidebarFields();
  redrawCanvas();
  updateMiUndoButtons();
}

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
  app.on?.('project-closing', resetMapIconHistory);
}

function getSelectedMapIcon() {
  if (isMulti()) return null;
  if (!app.project?.mapIcons || !app.project.mapIcons.length) return null;
  if (selectedUid) {
    const found = app.project.mapIcons.find(m => m.uid === selectedUid);
    if (found) return found;
  }
  const sel3d = app.editor?.selection || [];
  for (const uid of sel3d) {
    const found = app.project.mapIcons.find(m => m.uid === uid);
    if (found) {
      selectedUid = found.uid;
      return found;
    }
  }
  return app.project.mapIcons[0] || null;
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
      miPushUndo();
      const item = makeMapIcon({
        type: defaultMarkerType,
        x: Math.round(pos.x * 100) / 100,
        y: Math.round(pos.y * 100) / 100,
        z: Math.round(pos.z * 100) / 100,
        color: 0xFF0000FF,
        style: 0,
        comment: getMapIconInfo(defaultMarkerType).label,
      });
      if (!app.project.mapIcons) app.project.mapIcons = [];
      app.project.mapIcons.push(item);
      app.project.modified = true;
      setSelection(new Set([item.uid]));
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
          miPushUndo();
          sel.type = newType;
          app.project.modified = true;
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
        miPushUndo();
        sel.type = newType;
        app.project.modified = true;
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
    undoBtn.onclick = (e) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      miUndo();
    };
  }

  const redoBtn = dialogEl.querySelector('#miBtnRedo');
  if (redoBtn) {
    redoBtn.onclick = (e) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      miRedo();
    };
  }

  dialogEl.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;
    const arrow = !e.ctrlKey && !e.metaKey && arrowStep(e);
    if (arrow) {
      const targets = selectedIcons();
      if (!targets.length || (!arrow.dx && !arrow.dy)) return;
      if (arrow.first) miPushUndo();
      const round = (v) => Math.round(v * 10000) / 10000;
      for (const m of targets) {
        m.x = round(m.x + arrow.dx);
        m.y = round(m.y - arrow.dy);
      }
      app.project.modified = true;
      app.editor?.syncAll();
      updateSidebarFields();
      redrawCanvas();
      return;
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (!selectedIcons().length) return;
      e.preventDefault();
      deleteSelectedMapIcons();
    } else if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
      e.preventDefault();
      if (e.shiftKey) miRedo();
      else miUndo();
    } else if ((e.ctrlKey || e.metaKey) && ((e.key === 'y' || e.key === 'Y') || (e.shiftKey && (e.key === 'z' || e.key === 'Z')))) {
      e.preventDefault();
      miRedo();
    } else if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C' || e.key === 'd' || e.key === 'D')) {
      e.preventDefault();
      duplicateSelectedMapIcon();
    }
  });

  const bindField = (selId, prop, isInt = false) => {
    const el = dialogEl.querySelector(selId);
    if (!el) return;
    el.onchange = () => {
      const m = getSelectedMapIcon();
      if (!m) return;
      miPushUndo();
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
      app.project.modified = true;
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

  const btnDup = dialogEl.querySelector('#miBtnDup');
  if (btnDup) {
    btnDup.onclick = () => {
      duplicateSelectedMapIcon();
    };
  }

  const btnDel = dialogEl.querySelector('#miBtnDelete');
  if (btnDel) {
    btnDel.onclick = () => deleteSelectedMapIcons();
  }
}

function deleteSelectedMapIcons() {
  const targets = selectedIcons();
  if (!targets.length) return;
  miPushUndo();
  const gone = new Set(targets.map(m => m.uid));
  app.project.mapIcons = (app.project.mapIcons || []).filter(x => !gone.has(x.uid));
  app.project.modified = true;
  const first = app.project.mapIcons[0]?.uid;
  setSelection(new Set(first ? [first] : []));
  app.editor?.syncAll();
  updateSidebarList();
  updateSidebarFields();
  redrawCanvas();
  toast(targets.length > 1 ? `${targets.length} MapIcons removidos` : 'MapIcon removido', 'info');
}

function duplicateSelectedMapIcon() {
  const m = getSelectedMapIcon();
  if (!m) return;
  const list = app.project?.mapIcons || [];

  // Finds the nearest free position radially
  let bestPos = { x: m.x + 25, y: m.y };
  let found = false;
  for (const radius of [25, 40, 60, 80]) {
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const testX = Math.round((m.x + Math.cos(angle) * radius) * 100) / 100;
      const testY = Math.round((m.y + Math.sin(angle) * radius) * 100) / 100;
      const collides = list.some(other => Math.hypot(other.x - testX, other.y - testY) < 18);
      if (!collides) {
        bestPos = { x: testX, y: testY };
        found = true;
        break;
      }
    }
    if (found) break;
  }

  let zGuess = m.z ?? 15.0;
  if (app.editor?.getSurfaceZAt) {
    const gz = app.editor.getSurfaceZAt(bestPos.x, bestPos.y);
    if (gz !== null) zGuess = Math.round(gz * 100) / 100;
  }

  miPushUndo();
  const item = makeMapIcon({
    type: m.type ?? 0,
    x: bestPos.x,
    y: bestPos.y,
    z: zGuess,
    color: m.color ?? 0xFF0000FF,
    style: m.style ?? 0,
    streamDist: m.streamDist ?? 200,
    comment: getNextMapIconName(m.comment || getMapIconInfo(m.type ?? 0).label, app.project.mapIcons || []),
  });

  if (!app.project.mapIcons) app.project.mapIcons = [];
  app.project.mapIcons.push(item);
  app.project.modified = true;
  setSelection(new Set([item.uid]));
  app.editor?.syncAll();
  updateSidebarList();
  updateSidebarFields();
  redrawCanvas();
  toast('MapIcon duplicado no espaço livre mais próximo!', 'ok');
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

    if (e.button === 2 || e.button === 1 || e.altKey) {
      isPanning = true;
      panStart = { x: e.clientX - view.panX, y: e.clientY - view.panY };
      canvasEl.style.cursor = 'grabbing';
      return;
    }

    if (e.button === 0) {
      const hit = findIconAtCanvas(cx, cy);
      const additive = e.shiftKey || e.ctrlKey || e.metaKey;
      if (additive) {
        // Shift/Ctrl on empty ground does nothing (no accidental new icon)
        if (!hit) return;
        dragStartMiSnapshot = miSnapshot();
        toggleIconSelection(hit.uid);
        if (isMulti() && multiUids.has(hit.uid)) {
          isDraggingIcon = hit;
          dragGroup = { startX: w.x, startY: w.y, items: selectedIcons().map(m => ({ m, x: m.x, y: m.y })) };
        }
        updateSidebarList();
        updateSidebarFields();
        redrawCanvas();
        return;
      }
      if (hit) {
        dragStartMiSnapshot = miSnapshot();
        // Plain click on an icon of the multi-selection keeps it and drags them all
        if (isMulti() && multiUids.has(hit.uid)) {
          isDraggingIcon = hit;
          dragGroup = { startX: w.x, startY: w.y, items: selectedIcons().map(m => ({ m, x: m.x, y: m.y })) };
          return;
        }
        setSelection(new Set([hit.uid]));
        isDraggingIcon = hit;
        dragGroup = null;
        updateSidebarList();
        updateSidebarFields();
        redrawCanvas();
        return;
      }

      // Creating a new icon by clicking is not allowed with several icons selected
      if (isMulti()) { toast('Indisponível com vários itens selecionados', 'info'); return; }
      let zGuess = 15.0;
      if (app.editor?.getSurfaceZAt) {
        const gz = app.editor.getSurfaceZAt(w.x, w.y);
        if (gz !== null) zGuess = Math.round(gz * 100) / 100;
      }
      miPushUndo();
      const item = makeMapIcon({
        type: defaultMarkerType,
        x: Math.round(w.x * 100) / 100,
        y: Math.round(w.y * 100) / 100,
        z: zGuess,
        color: 0xFF0000FF,
        style: 0,
        comment: getMapIconInfo(defaultMarkerType).label,
      });
      if (!app.project.mapIcons) app.project.mapIcons = [];
      app.project.mapIcons.push(item);
      app.project.modified = true;
      setSelection(new Set([item.uid]));
      isDraggingIcon = item;
      dragStartMiSnapshot = null;
      dragGroup = null;
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
      if (dragGroup) {
        const dx = w.x - dragGroup.startX, dy = w.y - dragGroup.startY;
        for (const g of dragGroup.items) {
          g.m.x = Math.round((g.x + dx) * 100) / 100;
          g.m.y = Math.round((g.y + dy) * 100) / 100;
        }
      } else {
        isDraggingIcon.x = Math.round(w.x * 100) / 100;
        isDraggingIcon.y = Math.round(w.y * 100) / 100;
      }
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
      if (dragStartMiSnapshot) {
        const curSnapshot = miSnapshot();
        if (curSnapshot !== dragStartMiSnapshot) {
          miPushUndoSnapshot(dragStartMiSnapshot);
          app.project.modified = true;
        }
        dragStartMiSnapshot = null;
      }
      isDraggingIcon = null;
      dragGroup = null;
      redrawCanvas();
    }
  });
}

function updateDefaultPickerButton() {
  const btn = dialogEl?.querySelector('#miBtnPickDefault');
  if (!btn) return;
  const info = getMapIconInfo(defaultMarkerType);
  btn.innerHTML = `<img src="${getMapIconUrl(defaultMarkerType)}" width="20" height="20" style="image-rendering:pixelated; vertical-align:middle;"> <span>Ícone Padrão: #${defaultMarkerType}${info.label ? ` (${esc(info.label)})` : ''}</span>`;
}

export function openMapIconDialog() {
  if (!dialogEl) initMapIconDialog();
  if (!dialogEl) return;
  if (!dialogEl.open) dialogEl.showModal();
  dialogEl.classList.add('open');

  updateMiUndoButtons();

  const wrap = dialogEl.querySelector('#miCanvasWrap');
  if (wrap && canvasEl) {
    canvasEl.width = wrap.clientWidth || 800;
    canvasEl.height = wrap.clientHeight || 600;
    view.width = canvasEl.width;
    view.height = canvasEl.height;
  }

  if (!selectedUid && !isMulti() && app.project?.mapIcons?.length) {
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
  ctx.fillStyle = themeVar('--map-bg', '#161922');
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
    const isSel = m.uid === selectedUid || multiUids.has(m.uid);
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
    item.className = 'gz-list-item' + ((m.uid === selectedUid || multiUids.has(m.uid)) ? ' selected' : '');
    const info = getMapIconInfo(m.type ?? 0);
    item.innerHTML = `
      <img src="${getMapIconUrl(m.type ?? 0)}" width="24" height="24" style="image-rendering:pixelated; flex-shrink:0;">
      <div class="gz-info">
        <span class="gz-title">#${m.type ?? 0} · ${esc(m.comment || info.label)}</span>
        <span class="gz-sub">Slot ${idx} · (${m.x.toFixed(1)}, ${m.y.toFixed(1)}, ${m.z.toFixed(1)})</span>
      </div>
    `;
    item.onclick = (e) => {
      if (e.shiftKey || e.ctrlKey || e.metaKey) toggleIconSelection(m.uid);
      else setSelection(new Set([m.uid]));
      updateSidebarList();
      updateSidebarFields();
      redrawCanvas();
    };
    listEl.appendChild(item);
  });
}

// Buttons outside the panel that create or change things: locked (with a tooltip) while several are selected
function lockForMulti(ids, multi) {
  for (const id of ids) {
    const el = dialogEl?.querySelector('#' + id);
    if (!el) continue;
    if (multi) {
      if (el.dataset.origTitle === undefined) el.dataset.origTitle = el.title || '';
      el.title = 'Indisponível com vários itens selecionados';
    } else if (el.dataset.origTitle !== undefined) {
      el.title = el.dataset.origTitle;
      delete el.dataset.origTitle;
    }
    el.disabled = multi;
  }
}

function updateSidebarFields() {
  const panel = dialogEl?.querySelector('#miDetailsPanel');
  const m = getSelectedMapIcon();
  // With several icons selected, everything but Delete is locked
  const multi = isMulti();
  const hint = dialogEl?.querySelector('#miMultiHint');
  if (hint) hint.style.display = multi ? 'block' : 'none';
  if (panel) {
    panel.querySelectorAll('input,button,select').forEach(el => {
      el.disabled = multi && el.id !== 'miBtnDelete';
    });
  }
  lockForMulti(['miBtnAdd', 'miBtnPickDefault', 'miBtnCopyPwn'], multi);
  if (multi) {
    if (panel) panel.style.display = 'block';
    return;
  }
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
// Visual MapIcon Picker Modal (64 official icons 0 to 63)
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
