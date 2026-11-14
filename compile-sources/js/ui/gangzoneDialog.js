// Visual GangZone editor and manager (GangZoneCreate)
// Modal with the GTA SA radar map (-3000 to +3000), zoom, pan,
import { gzColorToRgba, gzColorToHexAndAlpha, hexAndAlphaToGzColor, DEFAULT_GANGZONE_COLORS, snapGangZoneEdges, getNextGangZoneName, findFreeGangZoneSpot } from '../world/gangzones.js';
import { makeGangZone } from '../editor/project.js';
import { toast, arrowStep, showAlert, themeVar } from './common.js';

export function parseAndNormalizeHexColor(input, currentAlpha = 0.56) {
  if (!input) return null;
  let str = String(input).trim().replace(/^0x/i, '').replace(/^#/i, '');
  str = str.replace(/[^0-9A-Fa-f]/g, '');
  if (str.length === 3) {
    str = str[0] + str[0] + str[1] + str[1] + str[2] + str[2];
  } else if (str.length === 4) {
    str = str[0] + str[0] + str[1] + str[1] + str[2] + str[2] + str[3] + str[3];
  }
  if (str.length === 6) {
    const aByte = Math.round(currentAlpha * 255).toString(16).padStart(2, '0');
    str += aByte;
  }
  if (str.length >= 8) {
    str = str.slice(0, 8);
    const num = parseInt(str, 16);
    if (!isNaN(num)) {
      return {
        num: num >>> 0,
        hexPrefixed: '0x' + str.toUpperCase(),
        rgbHex: '#' + str.slice(0, 6).toUpperCase(),
        alpha: parseInt(str.slice(6, 8), 16) / 255,
      };
    }
  }
  return null;
}

let dialogEl = null;
let canvasEl = null;
let ctx = null;
let appRef = null;

let radarImg = null;
let imgLoaded = false;
let selectedUid = null;
let isDrawing = null; // { startX, startY, curX, curY }
let isDraggingHandle = null; // { zone, handle: 'nw'|'ne'|'sw'|'se'|'move', startX, startY, origMinX, ... }
let dragStartSnapshot = null;
let isPanning = false;
let panStart = { x: 0, y: 0 };
let activeSnapLines = []; // Snap guide lines

let gzUndoStack = [];
let gzRedoStack = [];

// Multi-selection: with more than one zone selected, selectedUid is null and the uids live here.
// Only moving and deleting are allowed in that state.
let multiUids = new Set();

function isMulti() { return multiUids.size > 1; }

// The zones that move/delete act on: the whole multi-selection or the single selected zone
function selectedZones() {
  const zones = appRef?.project?.gangZones || [];
  if (isMulti()) return zones.filter(z => multiUids.has(z.uid));
  const z = getSelectedZone();
  return z ? [z] : [];
}

// Shift/Ctrl+click: adds or removes a zone from the selection
function toggleZoneSelection(uid) {
  const cur = isMulti() ? new Set(multiUids) : new Set(selectedUid ? [selectedUid] : []);
  if (cur.has(uid)) cur.delete(uid); else cur.add(uid);
  setSelection(cur);
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

function gzSnapshot() {
  return JSON.stringify({
    zones: appRef?.project?.gangZones || [],
    selectedUid,
    multi: [...multiUids]
  });
}

function gzRestore(str) {
  const st = JSON.parse(str);
  appRef.project.gangZones = st.zones || [];
  const ids = new Set(appRef.project.gangZones.map(z => z.uid));
  const multi = (st.multi || []).filter(u => ids.has(u));
  if (multi.length > 1) {
    multiUids = new Set(multi);
    selectedUid = null;
  } else {
    multiUids = new Set();
    selectedUid = st.selectedUid;
    if (!getSelectedZone() && appRef.project.gangZones.length > 0) {
      selectedUid = appRef.project.gangZones[0].uid;
    }
  }
}

// Called when the whole project is closed: only then does the history start over
export function resetGangZoneHistory() {
  gzUndoStack = [];
  gzRedoStack = [];
  selectedUid = null;
  multiUids = new Set();
  updateGzUndoButtons();
}

function gzPushUndo() {
  const current = gzSnapshot();
  if (gzUndoStack.length > 0 && gzUndoStack[gzUndoStack.length - 1] === current) return;
  gzUndoStack.push(current);
  if (gzUndoStack.length > 50) gzUndoStack.shift();
  gzRedoStack = [];
  updateGzUndoButtons();
}

function gzPushUndoSnapshot(snapshotStr) {
  if (!snapshotStr) return;
  if (gzUndoStack.length > 0 && gzUndoStack[gzUndoStack.length - 1] === snapshotStr) return;
  gzUndoStack.push(snapshotStr);
  if (gzUndoStack.length > 50) gzUndoStack.shift();
  gzRedoStack = [];
  updateGzUndoButtons();
}

function gzUndo() {
  if (gzUndoStack.length === 0) return;
  gzRedoStack.push(gzSnapshot());
  gzRestore(gzUndoStack.pop());
  appRef.editor?.syncAll();
  updateSidebarFields();
  updateSidebarList();
  redrawCanvas();
  updateGzUndoButtons();
}

function gzRedo() {
  if (gzRedoStack.length === 0) return;
  gzUndoStack.push(gzSnapshot());
  gzRestore(gzRedoStack.pop());
  appRef.editor?.syncAll();
  updateSidebarFields();
  updateSidebarList();
  redrawCanvas();
  updateGzUndoButtons();
}

function updateGzUndoButtons() {
  const btnU = dialogEl?.querySelector('#gzBtnUndo');
  const btnR = dialogEl?.querySelector('#gzBtnRedo');
  if (btnU) btnU.disabled = gzUndoStack.length === 0;
  if (btnR) btnR.disabled = gzRedoStack.length === 0;
}

// Canvas view state
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

export function initGangZoneDialog(app) {
  appRef = app;
  dialogEl = document.getElementById('dlgGangZones');
  if (!dialogEl) return;

  canvasEl = dialogEl.querySelector('#gzCanvas');
  if (canvasEl) {
    ctx = canvasEl.getContext('2d');
    setupCanvasEvents();
  }

  setupDialogEvents();
  app.on?.('project-closing', resetGangZoneHistory);
}

function setupDialogEvents() {
  const closeBtn = dialogEl.querySelector('.modal-close');
  if (closeBtn) closeBtn.onclick = () => closeGangZoneDialog();

  const doneBtn = dialogEl.querySelector('#gzBtnDone');
  if (doneBtn) doneBtn.onclick = () => closeGangZoneDialog();

  const addBtn = dialogEl.querySelector('#gzBtnAdd');
  if (addBtn) {
    addBtn.onclick = () => {
      createNewZoneAtCenter();
    };
  }

  const copyPwnBtn = dialogEl.querySelector('#gzBtnCopyPwn');
  if (copyPwnBtn) {
    copyPwnBtn.onclick = () => {
      copyAllGangZonesPawn();
    };
  }

  const zoomInBtn = dialogEl.querySelector('#gzZoomIn');
  if (zoomInBtn) {
    zoomInBtn.onclick = () => {
      view.zoom = Math.min(8.0, view.zoom * 1.3);
      redrawCanvas();
    };
  }

  const zoomOutBtn = dialogEl.querySelector('#gzZoomOut');
  if (zoomOutBtn) {
    zoomOutBtn.onclick = () => {
      view.zoom = Math.max(0.3, view.zoom / 1.3);
      redrawCanvas();
    };
  }

  const resetViewBtn = dialogEl.querySelector('#gzResetView');
  if (resetViewBtn) {
    resetViewBtn.onclick = () => {
      fitMapToView();
      redrawCanvas();
    };
  }

  // Selected zone inputs
  const nameInput = dialogEl.querySelector('#gzName');
  if (nameInput) {
    nameInput.oninput = (e) => {
      const z = getSelectedZone();
      if (!z) return;
      z.name = e.target.value;
      z.comment = e.target.value;
      appRef.project.modified = true;
      updateSidebarList();
      redrawCanvas();
      appRef.editor?.syncAll();
    };
    nameInput.onchange = (e) => {
      const z = getSelectedZone();
      if (!z) return;
      gzPushUndo();
      z.name = e.target.value.trim();
      z.comment = e.target.value.trim();
      appRef.project.modified = true;
      updateSidebarList();
    };
    nameInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        nameInput.blur();
      }
    };
  }

  const minXInput = dialogEl.querySelector('#gzMinX');
  const minYInput = dialogEl.querySelector('#gzMinY');
  const maxXInput = dialogEl.querySelector('#gzMaxX');
  const maxYInput = dialogEl.querySelector('#gzMaxY');

  [minXInput, minYInput, maxXInput, maxYInput].forEach(inp => {
    if (!inp) return;
    inp.onchange = () => {
      const z = getSelectedZone();
      if (!z) return;
      gzPushUndo();
      z.minx = Math.min(+minXInput.value, +maxXInput.value);
      z.maxx = Math.max(+minXInput.value, +maxXInput.value);
      z.miny = Math.min(+minYInput.value, +maxYInput.value);
      z.maxy = Math.max(+minYInput.value, +maxYInput.value);
      appRef.project.modified = true;
      appRef.editor?.syncAll();
      redrawCanvas();
    };
  });

  const colorInput = dialogEl.querySelector('#gzColor');
  const alphaSlider = dialogEl.querySelector('#gzAlpha');
  const alphaVal = dialogEl.querySelector('#gzAlphaVal');
  const hexInput = dialogEl.querySelector('#gzHexInput');

  const onColorChange = () => {
    const z = getSelectedZone();
    if (!z) return;
    const hex = colorInput.value;
    const a = +alphaSlider.value / 100;
    if (alphaVal) alphaVal.textContent = `${Math.round(a * 100)}%`;
    z.color = hexAndAlphaToGzColor(hex, a);
    if (hexInput) {
      hexInput.value = '0x' + (Number(z.color) >>> 0).toString(16).toUpperCase().padStart(8, '0');
    }
    appRef.editor?.syncAll();
    redrawCanvas();
    updateSidebarList();
  };

  if (colorInput) colorInput.oninput = onColorChange;
  if (alphaSlider) alphaSlider.oninput = onColorChange;

  const onHexChange = () => {
    const z = getSelectedZone();
    if (!z || !hexInput) return;
    const curA = (+alphaSlider?.value || 56) / 100;
    const res = parseAndNormalizeHexColor(hexInput.value, curA);
    if (!res) return;
    z.color = res.num;
    if (colorInput) colorInput.value = res.rgbHex;
    if (alphaSlider) alphaSlider.value = Math.round(res.alpha * 100);
    if (alphaVal) alphaVal.textContent = `${Math.round(res.alpha * 100)}%`;
    hexInput.value = res.hexPrefixed;
    appRef.editor?.syncAll();
    redrawCanvas();
    updateSidebarList();
  };

  if (hexInput) {
    hexInput.onchange = onHexChange;
    hexInput.oninput = () => {
      const str = hexInput.value.trim().replace(/^0x/i, '').replace(/^#/i, '');
      if (str.length === 6 || str.length === 8) onHexChange();
    };
  }

  const btnUndo = dialogEl.querySelector('#gzBtnUndo');
  if (btnUndo) {
    btnUndo.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      gzUndo();
    };
  }

  const btnRedo = dialogEl.querySelector('#gzBtnRedo');
  if (btnRedo) {
    btnRedo.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      gzRedo();
    };
  }

  const btnDup = dialogEl.querySelector('#gzBtnDup');
  if (btnDup) {
    btnDup.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      duplicateSelectedZone();
    };
  }

  const btnDel = dialogEl.querySelector('#gzBtnDelete');
  if (btnDel) {
    btnDel.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      deleteSelectedZone();
    };
  }

  const btnFocus3D = dialogEl.querySelector('#gzBtnFocus3D');
  if (btnFocus3D) {
    btnFocus3D.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      focusSelectedZone();
    };
  }

  dialogEl.addEventListener('keydown', (e) => {
    const arrow = !e.ctrlKey && !e.metaKey && arrowStep(e);
    if (arrow) {
      const targets = selectedZones();
      if (!targets.length || (!arrow.dx && !arrow.dy)) return;
      if (arrow.first) gzPushUndo();
      const round = (v) => Math.round(v * 10) / 10;
      for (const z of targets) {
        z.minx = round(z.minx + arrow.dx); z.maxx = round(z.maxx + arrow.dx);
        z.miny = round(z.miny - arrow.dy); z.maxy = round(z.maxy - arrow.dy);
      }
      appRef.project.modified = true;
      appRef.editor?.syncAll();
      updateSidebarFields();
      redrawCanvas();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      gzUndo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && ((e.key === 'y' || e.key === 'Y') || (e.shiftKey && (e.key === 'z' || e.key === 'Z')))) {
      e.preventDefault();
      e.stopPropagation();
      gzRedo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C' || e.key === 'd' || e.key === 'D')) {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;
      e.preventDefault();
      e.stopPropagation();
      duplicateSelectedZone();
      return;
    }
    if (e.key === 'Delete' || e.key === 'Del') {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;
      e.preventDefault();
      e.stopPropagation();
      deleteSelectedZone();
    }
  });
}

function setupCanvasEvents() {
  canvasEl.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect = canvasEl.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const newZoom = Math.max(0.2, Math.min(10.0, view.zoom * zoomFactor));

    // Zoom centered on the mouse position
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

    // Right button (2), middle button (1) or Alt = Pan / Move map (Shift/Ctrl+click selects several zones)
    if (e.button === 2 || e.button === 1 || e.altKey) {
      isPanning = true;
      panStart = { x: e.clientX - view.panX, y: e.clientY - view.panY };
      canvasEl.style.cursor = 'grabbing';
      return;
    }

    if (e.button === 0) {
      dragStartSnapshot = gzSnapshot();
      const additive = e.shiftKey || e.ctrlKey || e.metaKey;

      // Checks for a click on the selected zone's resize handles
      const selZone = getSelectedZone();
      if (selZone) {
        const handle = getHandleAtPos(selZone, cx, cy);
        if (handle) {
          isDraggingHandle = {
            zone: selZone,
            handle,
            startX: w.x,
            startY: w.y,
            origMinX: selZone.minx,
            origMinY: selZone.miny,
            origMaxX: selZone.maxx,
            origMaxY: selZone.maxy,
          };
          return;
        }
      }

      // Checks whether the click was inside any existing zone to select it
      const clickedZone = findZoneAtWorld(w.x, w.y);
      const groupDrag = (zone) => ({
        zone, handle: 'move', startX: w.x, startY: w.y,
        group: selectedZones().map(z => ({ z, minx: z.minx, miny: z.miny, maxx: z.maxx, maxy: z.maxy })),
      });
      if (additive) {
        // Shift/Ctrl on empty ground does nothing (no accidental new zone)
        if (!clickedZone) return;
        toggleZoneSelection(clickedZone.uid);
        if (isMulti() && multiUids.has(clickedZone.uid)) isDraggingHandle = groupDrag(clickedZone);
        updateSidebarFields();
        updateSidebarList();
        redrawCanvas();
        return;
      }
      if (clickedZone) {
        // Plain click on a zone that is part of the multi-selection keeps it and drags them all
        if (isMulti() && multiUids.has(clickedZone.uid)) {
          isDraggingHandle = groupDrag(clickedZone);
          return;
        }
        setSelection(new Set([clickedZone.uid]));
        isDraggingHandle = {
          zone: clickedZone,
          handle: 'move',
          startX: w.x,
          startY: w.y,
          origMinX: clickedZone.minx,
          origMinY: clickedZone.miny,
          origMaxX: clickedZone.maxx,
          origMaxY: clickedZone.maxy,
        };
        updateSidebarFields();
        updateSidebarList();
        redrawCanvas();
        return;
      }

      // Starts creating a new zone by dragging (not with several zones selected)
      if (isMulti()) { toast('Indisponível com vários itens selecionados', 'info'); return; }
      const snapEnabled = isSnapActive();
      let startPt = { x: w.x, y: w.y };
      if (snapEnabled) {
        startPt = snapPoint(startPt.x, startPt.y, appRef.project.gangZones || []);
      }

      isDrawing = {
        startX: startPt.x,
        startY: startPt.y,
        curX: startPt.x,
        curY: startPt.y,
      };
      redrawCanvas();
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (!dialogEl || !dialogEl.classList.contains('open')) return;
    const rect = canvasEl.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const w = canvasToWorld(cx, cy);

    // Updates the coordinates HUD
    const hudCoords = dialogEl.querySelector('#gzHudCoords');
    if (hudCoords) {
      hudCoords.textContent = `X: ${w.x.toFixed(1)} | Y: ${w.y.toFixed(1)}`;
    }

    if (isPanning) {
      view.panX = e.clientX - panStart.x;
      view.panY = e.clientY - panStart.y;
      redrawCanvas();
      return;
    }

    if (isDraggingHandle) {
      const dx = w.x - isDraggingHandle.startX;
      const dy = w.y - isDraggingHandle.startY;
      const z = isDraggingHandle.zone;
      const snap = isSnapActive();
      activeSnapLines = [];

      if (isDraggingHandle.group) {
        const mx = Math.round(dx), my = Math.round(dy);
        for (const g of isDraggingHandle.group) {
          g.z.minx = g.minx + mx; g.z.maxx = g.maxx + mx;
          g.z.miny = g.miny + my; g.z.maxy = g.maxy + my;
        }
      } else if (isDraggingHandle.handle === 'move') {
        const wLen = isDraggingHandle.origMaxX - isDraggingHandle.origMinX;
        const hLen = isDraggingHandle.origMaxY - isDraggingHandle.origMinY;
        let newMinX = isDraggingHandle.origMinX + dx;
        let newMinY = isDraggingHandle.origMinY + dy;
        let newMaxX = newMinX + wLen;
        let newMaxY = newMinY + hLen;

        if (snap) {
          const snapped = snapGangZoneEdges({ uid: z.uid, minx: newMinX, miny: newMinY, maxx: newMaxX, maxy: newMaxY }, appRef.project.gangZones, 25.0, true);
          newMinX = snapped.minx;
          newMinY = snapped.miny;
          newMaxX = snapped.maxx;
          newMaxY = snapped.maxy;
          activeSnapLines = snapped.snapLines || [];
        } else {
          activeSnapLines = [];
        }

        z.minx = Math.round(newMinX);
        z.miny = Math.round(newMinY);
        z.maxx = Math.round(newMaxX);
        z.maxy = Math.round(newMaxY);
      } else {
        // Resizing by handle
        let minx = isDraggingHandle.origMinX;
        let miny = isDraggingHandle.origMinY;
        let maxx = isDraggingHandle.origMaxX;
        let maxy = isDraggingHandle.origMaxY;

        if (isDraggingHandle.handle.includes('w')) minx += dx;
        if (isDraggingHandle.handle.includes('e')) maxx += dx;
        if (isDraggingHandle.handle.includes('s')) miny += dy;
        if (isDraggingHandle.handle.includes('n')) maxy += dy;

        if (snap) {
          const snapped = snapGangZoneEdges({ uid: z.uid, minx, miny, maxx, maxy }, appRef.project.gangZones, 25.0, false);
          minx = snapped.minx;
          miny = snapped.miny;
          maxx = snapped.maxx;
          maxy = snapped.maxy;
          activeSnapLines = snapped.snapLines || [];
        } else {
          activeSnapLines = [];
        }

        z.minx = Math.round(Math.min(minx, maxx));
        z.maxx = Math.round(Math.max(minx, maxx));
        z.miny = Math.round(Math.min(miny, maxy));
        z.maxy = Math.round(Math.max(miny, maxy));
      }

      updateSidebarFields();
      appRef.editor?.syncAll();
      redrawCanvas();
      return;
    }

    if (isDrawing) {
      let curX = w.x;
      let curY = w.y;
      activeSnapLines = [];

      if (isSnapActive()) {
        const snapped = snapPoint(curX, curY, appRef.project.gangZones || []);
        curX = snapped.x;
        curY = snapped.y;
      }

      isDrawing.curX = curX;
      isDrawing.curY = curY;
      redrawCanvas();
      return;
    }

    // Updates the cursor dynamically according to hover over handles, edges or the zone center
    if (!isPanning && !isDraggingHandle && !isDrawing) {
      const selZone = getSelectedZone();
      let cursorSet = false;
      if (selZone) {
        const h = getHandleAtPos(selZone, cx, cy);
        if (h) {
          canvasEl.style.cursor = cursorForHandle(h);
          cursorSet = true;
        }
      }
      if (!cursorSet) {
        const hoverZ = findZoneAtWorld(w.x, w.y);
        if (hoverZ) {
          const h = getHandleAtPos(hoverZ, cx, cy);
          canvasEl.style.cursor = h ? cursorForHandle(h) : 'move';
        } else {
          canvasEl.style.cursor = 'crosshair';
        }
      }
    }
  });

  window.addEventListener('mouseup', () => {
    if (isPanning) {
      isPanning = false;
      canvasEl.style.cursor = 'crosshair';
    }

    if (isDraggingHandle) {
      isDraggingHandle = null;
      activeSnapLines = [];
      const current = gzSnapshot();
      if (dragStartSnapshot && dragStartSnapshot !== current) {
        gzPushUndoSnapshot(dragStartSnapshot);
        appRef.project.modified = true;
      }
      redrawCanvas();
    }

    if (isDrawing) {
      const minx = Math.round(Math.min(isDrawing.startX, isDrawing.curX));
      const maxx = Math.round(Math.max(isDrawing.startX, isDrawing.curX));
      const miny = Math.round(Math.min(isDrawing.startY, isDrawing.curY));
      const maxy = Math.round(Math.max(isDrawing.startY, isDrawing.curY));
      isDrawing = null;
      activeSnapLines = [];

      // Only creates it if it has a relevant minimum size (e.g. >= 15 units)
      if ((maxx - minx) >= 15 && (maxy - miny) >= 15) {
        if (!appRef.project.gangZones) appRef.project.gangZones = [];
        if (dragStartSnapshot) gzPushUndoSnapshot(dragStartSnapshot);
        const count = appRef.project.gangZones.length + 1;
        const newZ = makeGangZone({
          name: `Zona ${count}`,
          comment: `Zona ${count}`,
          minx, miny, maxx, maxy,
          color: 0x33AA3390, // Translucent Grove Street green by default
        });
        appRef.project.gangZones.push(newZ);
        appRef.project.modified = true;
        setSelection(new Set([newZ.uid]));
        appRef.editor?.syncAll();
        updateSidebarFields();
        updateSidebarList();
      }
      redrawCanvas();
    }
  });
}

function isSnapActive() {
  const chk = dialogEl.querySelector('#gzChkSnap');
  return chk ? chk.checked : true;
}

function snapPoint(x, y, zones, threshold = 30.0) {
  let bestX = x, bestY = y;
  let minDiffX = threshold, minDiffY = threshold;

  for (const z of zones) {
    if ((selectedUid && z.uid === selectedUid) || multiUids.has(z.uid)) continue;
    // Testa minx e maxx
    for (const testX of [z.minx, z.maxx]) {
      const diffX = Math.abs(x - testX);
      if (diffX < minDiffX) {
        minDiffX = diffX;
        bestX = testX;
        activeSnapLines.push({ type: 'x', val: testX });
      }
    }
    // Testa miny e maxy
    for (const testY of [z.miny, z.maxy]) {
      const diffY = Math.abs(y - testY);
      if (diffY < minDiffY) {
        minDiffY = diffY;
        bestY = testY;
        activeSnapLines.push({ type: 'y', val: testY });
      }
    }
  }

  return { x: bestX, y: bestY };
}

function getSelectedZone() {
  if (!selectedUid || !appRef.project?.gangZones) return null;
  return appRef.project.gangZones.find(z => z.uid === selectedUid);
}

function findZoneAtWorld(wx, wy) {
  const zones = appRef.project?.gangZones || [];
  for (let i = zones.length - 1; i >= 0; i--) {
    const z = zones[i];
    if (wx >= z.minx && wx <= z.maxx && wy >= z.miny && wy <= z.maxy) {
      return z;
    }
  }
  return null;
}

function getZoneCanvasBounds(z) {
  const pTL = worldToCanvas(z.minx, z.maxy);
  const pBR = worldToCanvas(z.maxx, z.miny);
  const left = Math.min(pTL.x, pBR.x);
  const right = Math.max(pTL.x, pBR.x);
  const top = Math.min(pTL.y, pBR.y);
  const bottom = Math.max(pTL.y, pBR.y);
  return { left, right, top, bottom };
}

function getHandleAtPos(z, cx, cy) {
  const { left, right, top, bottom } = getZoneCanvasBounds(z);
  const tol = 8;

  // 1. Zone corners
  if (Math.hypot(cx - left, cy - top) <= tol) return 'nw';
  if (Math.hypot(cx - right, cy - top) <= tol) return 'ne';
  if (Math.hypot(cx - left, cy - bottom) <= tol) return 'sw';
  if (Math.hypot(cx - right, cy - bottom) <= tol) return 'se';

  // 2. Zone edges (top=n, bottom=s, left=w, right=e)
  if (cx >= left - tol && cx <= right + tol) {
    if (Math.abs(cy - top) <= tol) return 'n';
    if (Math.abs(cy - bottom) <= tol) return 's';
  }
  if (cy >= top - tol && cy <= bottom + tol) {
    if (Math.abs(cx - left) <= tol) return 'w';
    if (Math.abs(cx - right) <= tol) return 'e';
  }

  // 3. Inner area
  if (cx >= left && cx <= right && cy >= top && cy <= bottom) {
    return 'move';
  }
  return null;
}

function cursorForHandle(handle) {
  switch (handle) {
    case 'nw':
    case 'se': return 'nwse-resize';
    case 'ne':
    case 'sw': return 'nesw-resize';
    case 'n':
    case 's': return 'ns-resize';
    case 'e':
    case 'w': return 'ew-resize';
    case 'move': return 'move';
    default: return 'crosshair';
  }
}

export function openGangZoneDialog() {
  if (!dialogEl) return;
  if (!dialogEl.open) dialogEl.showModal();
  dialogEl.classList.add('open');

  updateGzUndoButtons();

  resizeCanvas();

  if (!radarImg) {
    loadRadarMap();
  } else {
    fitMapToView();
    redrawCanvas();
  }

  updateSidebarList();
  updateSidebarFields();
}

export function closeGangZoneDialog() {
  if (!dialogEl) return;
  if (dialogEl.open) dialogEl.close();
  dialogEl.classList.remove('open');
}

function resizeCanvas() {
  const wrap = dialogEl.querySelector('#gzCanvasWrap');
  if (!wrap || !canvasEl) return;
  const w = wrap.clientWidth || 800;
  const h = wrap.clientHeight || 600;
  canvasEl.width = w;
  canvasEl.height = h;
  view.width = w;
  view.height = h;
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
  let retried = false;
  radarImg.onload = () => {
    imgLoaded = true;
    if (canvasEl) canvasEl.dataset.imgLoaded = 'true';
    fitMapToView();
    redrawCanvas();
  };
  radarImg.onerror = () => {
    if (!retried) {
      retried = true;
      setTimeout(() => {
        if (!imgLoaded && radarImg) {
          radarImg.src = '/api/radarmap';
        }
      }, 300);
      return;
    }
    console.warn('[GangZones] Não foi possível carregar /api/radarmap');
    imgLoaded = false;
    redrawCanvas();
  };
  radarImg.src = '/api/radarmap?v=' + Date.now();
}

function redrawCanvas() {
  if (!ctx || !canvasEl) return;
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

  // Fundo escuro
  ctx.fillStyle = themeVar('--map-bg', '#161922');
  ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

  // Draws the radar map image
  if (imgLoaded && radarImg) {
    const imgW = radarImg.width * view.zoom;
    const imgH = radarImg.height * view.zoom;
    ctx.drawImage(radarImg, view.panX, view.panY, imgW, imgH);
  } else {
    // Reference grid if the image does not load
    drawFallbackGrid();
  }

  // Draws the outer limits of GTA SA (-3000 to +3000)
  const tl = worldToCanvas(WORLD_MIN, WORLD_MAX);
  const br = worldToCanvas(WORLD_MAX, WORLD_MIN);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);

  // Draws all the project's GangZones
  const zones = appRef.project?.gangZones || [];
  for (const z of zones) {
    drawZone(z, z.uid === selectedUid, multiUids.has(z.uid));
  }

  // Draws the rectangle being created
  if (isDrawing) {
    const minx = Math.min(isDrawing.startX, isDrawing.curX);
    const maxx = Math.max(isDrawing.startX, isDrawing.curX);
    const miny = Math.min(isDrawing.startY, isDrawing.curY);
    const maxy = Math.max(isDrawing.startY, isDrawing.curY);

    const c1 = worldToCanvas(minx, maxy);
    const c2 = worldToCanvas(maxx, miny);
    const w = c2.x - c1.x;
    const h = c2.y - c1.y;

    ctx.fillStyle = 'rgba(51, 170, 51, 0.4)';
    ctx.fillRect(c1.x, c1.y, w, h);
    ctx.strokeStyle = '#33FF33';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(c1.x, c1.y, w, h);
    ctx.setLineDash([]);
  }

  // Draws the magnetic guide lines (snap)
  if (activeSnapLines.length > 0) {
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    for (const snap of activeSnapLines) {
      ctx.beginPath();
      if (snap.type === 'x') {
        const pt = worldToCanvas(snap.val, 0);
        ctx.moveTo(pt.x, 0);
        ctx.lineTo(pt.x, canvasEl.height);
      } else {
        const pt = worldToCanvas(0, snap.val);
        ctx.moveTo(0, pt.y);
        ctx.lineTo(canvasEl.width, pt.y);
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }
}

function drawZone(z, isSelected, inMulti = false) {
  const cTopLeft = worldToCanvas(z.minx, z.maxy);
  const cBottomRight = worldToCanvas(z.maxx, z.miny);
  const w = cBottomRight.x - cTopLeft.x;
  const h = cBottomRight.y - cTopLeft.y;

  // Translucent fill with the GangZone color
  ctx.fillStyle = gzColorToRgba(z.color);
  ctx.fillRect(cTopLeft.x, cTopLeft.y, w, h);

  // Borda
  ctx.strokeStyle = (isSelected || inMulti) ? '#FFFFFF' : 'rgba(0, 0, 0, 0.6)';
  ctx.lineWidth = (isSelected || inMulti) ? 2.5 : 1;
  ctx.strokeRect(cTopLeft.x, cTopLeft.y, w, h);

  // Zone name at the center
  if (w > 30 && h > 18) {
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(z.name || 'GangZone', cTopLeft.x + w / 2, cTopLeft.y + h / 2);
    ctx.shadowBlur = 0;
  }

  // Resize handles at the corners for the selected zone
  if (isSelected) {
    const handleSize = 7;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#0066FF';
    ctx.lineWidth = 1.5;

    const corners = [
      { x: cTopLeft.x, y: cTopLeft.y },
      { x: cBottomRight.x, y: cTopLeft.y },
      { x: cTopLeft.x, y: cBottomRight.y },
      { x: cBottomRight.x, y: cBottomRight.y },
    ];
    for (const c of corners) {
      ctx.fillRect(c.x - handleSize / 2, c.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(c.x - handleSize / 2, c.y - handleSize / 2, handleSize, handleSize);
    }
  }
}

function drawFallbackGrid() {
  const step = 500;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;

  for (let wx = WORLD_MIN; wx <= WORLD_MAX; wx += step) {
    const p1 = worldToCanvas(wx, WORLD_MIN);
    const p2 = worldToCanvas(wx, WORLD_MAX);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }
  for (let wy = WORLD_MIN; wy <= WORLD_MAX; wy += step) {
    const p1 = worldToCanvas(WORLD_MIN, wy);
    const p2 = worldToCanvas(WORLD_MAX, wy);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }
}

function updateSidebarList() {
  const listEl = dialogEl.querySelector('#gzList');
  if (!listEl) return;
  listEl.innerHTML = '';

  const zones = appRef.project?.gangZones || [];
  if (!zones.length) {
    listEl.innerHTML = '<div style="color:var(--text-muted); font-size:12px; padding:12px; text-align:center;">Nenhuma GangZone criada.<br>Arraste no mapa para criar.</div>';
    return;
  }

  for (const z of zones) {
    const item = document.createElement('div');
    item.className = 'gz-list-item' + ((z.uid === selectedUid || multiUids.has(z.uid)) ? ' selected' : '');
    const { hex, alpha } = gzColorToHexAndAlpha(z.color);

    item.innerHTML = `
      <div class="gz-badge" style="background:${hex}; opacity:${alpha};"></div>
      <div class="gz-info">
        <span class="gz-title">${z.name || 'GangZone'}</span>
        <span class="gz-sub">${z.minx}, ${z.miny} a ${z.maxx}, ${z.maxy}</span>
      </div>
    `;

    item.onclick = (e) => {
      if (e.shiftKey || e.ctrlKey || e.metaKey) toggleZoneSelection(z.uid);
      else setSelection(new Set([z.uid]));
      updateSidebarFields();
      updateSidebarList();
      redrawCanvas();
    };

    listEl.appendChild(item);
  }
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
  const panel = dialogEl.querySelector('#gzDetailsPanel');
  const z = getSelectedZone();
  // With several zones selected, everything but Delete is locked
  const multi = isMulti();
  const hint = dialogEl.querySelector('#gzMultiHint');
  if (hint) hint.style.display = multi ? 'block' : 'none';
  if (panel) {
    panel.querySelectorAll('input,button,select').forEach(el => {
      el.disabled = multi && el.id !== 'gzBtnDelete';
    });
  }
  lockForMulti(['gzBtnAdd', 'gzBtnCopyPwn'], multi);
  if (panel) {
    const presets = panel.querySelector('#gzPresets');
    if (presets) presets.style.pointerEvents = multi ? 'none' : '';
  }
  if (multi) {
    if (panel) panel.style.display = 'block';
    return;
  }
  if (!z) {
    if (panel) panel.style.display = 'none';
    return;
  }
  if (panel) panel.style.display = 'block';

  const nameInput = dialogEl.querySelector('#gzName');
  if (nameInput) nameInput.value = z.name || '';

  const minXInput = dialogEl.querySelector('#gzMinX');
  const minYInput = dialogEl.querySelector('#gzMinY');
  const maxXInput = dialogEl.querySelector('#gzMaxX');
  const maxYInput = dialogEl.querySelector('#gzMaxY');

  if (minXInput) minXInput.value = z.minx;
  if (minYInput) minYInput.value = z.miny;
  if (maxXInput) maxXInput.value = z.maxx;
  if (maxYInput) maxYInput.value = z.maxy;

  const colorInput = dialogEl.querySelector('#gzColor');
  const alphaSlider = dialogEl.querySelector('#gzAlpha');
  const alphaVal = dialogEl.querySelector('#gzAlphaVal');

  const { hex, alpha } = gzColorToHexAndAlpha(z.color);
  if (colorInput) colorInput.value = hex;
  if (alphaSlider) alphaSlider.value = Math.round(alpha * 100);
  if (alphaVal) alphaVal.textContent = `${Math.round(alpha * 100)}%`;
  const hexInput = dialogEl.querySelector('#gzHexInput');
  if (hexInput) {
    hexInput.value = '0x' + (Number(z.color) >>> 0).toString(16).toUpperCase().padStart(8, '0');
  }

  // Renders the quick color palette
  const presetsEl = dialogEl.querySelector('#gzPresets');
  if (presetsEl && !presetsEl.hasChildNodes()) {
    presetsEl.innerHTML = '';
    for (const p of DEFAULT_GANGZONE_COLORS) {
      const dot = document.createElement('div');
      dot.className = 'gz-preset-dot';
      dot.style.background = p.hex;
      dot.title = p.name;
      dot.onclick = () => {
        const curZ = getSelectedZone();
        if (!curZ) return;
        gzPushUndo();
        curZ.color = p.val;
        updateSidebarFields();
        updateSidebarList();
        appRef.editor?.syncAll();
        redrawCanvas();
      };
      presetsEl.appendChild(dot);
    }
  }
}

const NO_SPACE_MSG = 'Não há mais espaço livre no mapa para novas GangZones. Reduza ou apague alguma zona para abrir espaço.';

// Center of the current radar view, in world coordinates
function viewCenterWorld() {
  const imgW = (radarImg?.width || 1536) * view.zoom;
  const imgH = (radarImg?.height || 1536) * view.zoom;
  if (!imgW || !imgH) return { x: 0, y: 0 };
  const normX = ((canvasEl?.width || 800) / 2 - view.panX) / imgW;
  const normY = ((canvasEl?.height || 600) / 2 - view.panY) / imgH;
  return { x: WORLD_MIN + normX * WORLD_SIZE, y: WORLD_MAX - normY * WORLD_SIZE };
}

function createNewZoneAtCenter() {
  if (!appRef.project.gangZones) appRef.project.gangZones = [];
  // New zone (300 x 300) in the free space nearest to the view center; shrunk if needed
  const spot = findFreeGangZoneSpot(appRef.project.gangZones, { width: 300, height: 300, near: viewCenterWorld() });
  if (!spot) { showAlert(NO_SPACE_MSG, { title: 'Sem espaço para GangZones' }); return; }
  gzPushUndo();
  const count = appRef.project.gangZones.length + 1;
  const newZ = makeGangZone({
    name: `Zona ${count}`,
    comment: `Zona ${count}`,
    minx: Math.round(spot.minx), miny: Math.round(spot.miny), maxx: Math.round(spot.maxx), maxy: Math.round(spot.maxy),
    color: 0x33AA3390,
  });
  if (spot.scaled) toast('A zona foi reduzida para caber no espaço livre mais próximo', 'info');
  appRef.project.gangZones.push(newZ);
  appRef.project.modified = true;
  setSelection(new Set([newZ.uid]));
  appRef.editor?.syncAll();
  updateSidebarFields();
  updateSidebarList();
  redrawCanvas();
}

function deleteSelectedZone() {
  const targets = selectedZones();
  if (!targets.length) return;
  gzPushUndo();
  const gone = new Set(targets.map(z => z.uid));
  appRef.project.gangZones = appRef.project.gangZones.filter(z => !gone.has(z.uid));
  appRef.project.modified = true;
  setSelection(new Set());
  appRef.editor?.syncAll();
  toast(targets.length > 1 ? `${targets.length} GangZones excluídas` : 'GangZone excluída', 'info');
  updateSidebarFields();
  updateSidebarList();
  redrawCanvas();
}

function focusSelectedZone() {
  const z = getSelectedZone();
  if (!z) return;
  const cx = (z.minx + z.maxx) / 2;
  const cy = (z.miny + z.maxy) / 2;

  // Centers the gangzone in the radar's 2D view
  const normX = (cx - WORLD_MIN) / WORLD_SIZE;
  const normY = (WORLD_MAX - cy) / WORLD_SIZE;
  const imgW = (radarImg?.width || 1536) * view.zoom;
  const imgH = (radarImg?.height || 1536) * view.zoom;
  view.panX = (canvasEl?.width || 800) / 2 - normX * imgW;
  view.panY = (canvasEl?.height || 600) / 2 - normY * imgH;
  redrawCanvas();

  toast(`Visão centralizada na GangZone "${z.name || 'Zona'}"`, 'ok');
}

function duplicateSelectedZone() {
  const z = getSelectedZone();
  if (!z) return;
  const allZones = appRef.project?.gangZones || [];
  const origin = { minx: Math.min(z.minx, z.maxx), maxx: Math.max(z.minx, z.maxx), miny: Math.min(z.miny, z.maxy), maxy: Math.max(z.miny, z.maxy) };
  const w = (origin.maxx - origin.minx) || 100;
  const h = (origin.maxy - origin.miny) || 100;
  // Placed against a free side of the original; with no free side, the nearest free space (shrunk if needed)
  const spot = findFreeGangZoneSpot(allZones, { width: w, height: h, origin, near: { x: (origin.minx + origin.maxx) / 2, y: (origin.miny + origin.maxy) / 2 } });
  if (!spot) { showAlert(NO_SPACE_MSG, { title: 'Sem espaço para GangZones' }); return; }
  gzPushUndo();
  const dupName = getNextGangZoneName(z.name || z.comment, allZones);
  const newZ = makeGangZone({
    name: dupName,
    comment: dupName,
    minx: Math.round(spot.minx),
    miny: Math.round(spot.miny),
    maxx: Math.round(spot.maxx),
    maxy: Math.round(spot.maxy),
    color: z.color ?? 0x33AA3390,
  });

  if (!appRef.project.gangZones) appRef.project.gangZones = [];
  appRef.project.gangZones.push(newZ);
  appRef.project.modified = true;
  setSelection(new Set([newZ.uid]));
  appRef.editor?.syncAll();
  toast(spot.scaled ? 'GangZone duplicada e reduzida para caber no espaço livre mais próximo' : 'GangZone duplicada encostada no espaço livre mais próximo', 'ok');
  updateSidebarFields();
  updateSidebarList();
  redrawCanvas();
}

function copyAllGangZonesPawn() {
  const zones = appRef.project?.gangZones || [];
  if (!zones.length) {
    toast('Nenhuma GangZone para copiar', 'info');
    return;
  }
  const lines = ['// GangZones geradas pelo SA Map Studio', 'new gangzoneid;'];
  for (const z of zones) {
    const cHex = '0x' + (Number(z.color) >>> 0).toString(16).toUpperCase().padStart(8, '0');
    lines.push(`gangzoneid = GangZoneCreate(${z.minx}.0, ${z.miny}.0, ${z.maxx}.0, ${z.maxy}.0); // ${z.name || 'GangZone'}`);
    lines.push(`GangZoneShowForAll(gangzoneid, ${cHex});`);
  }
  const text = lines.join('\n');
  navigator.clipboard.writeText(text).then(() => {
    toast(`${zones.length} GangZone(s) copiada(s) em formato Pawn!`, 'ok');
  });
}
