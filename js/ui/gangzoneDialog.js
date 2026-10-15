// Editor e gerenciador visual de GangZones (GangZoneCreate)
// Modal com mapa do radar do GTA SA (-3000 a +3000), zoom, pan,
// desenho interativo de retângulos, alinhamento magnético (snap) e cores RGBA.
import { gzColorToRgba, gzColorToHexAndAlpha, hexAndAlphaToGzColor, DEFAULT_GANGZONE_COLORS, snapGangZoneEdges } from '../world/gangzones.js';
import { makeGangZone } from '../editor/project.js';

let dialogEl = null;
let canvasEl = null;
let ctx = null;
let appRef = null;

let radarImg = null;
let imgLoaded = false;
let selectedUid = null;
let isDrawing = null; // { startX, startY, curX, curY }
let isDraggingHandle = null; // { zone, handle: 'nw'|'ne'|'sw'|'se'|'move', startX, startY, origMinX, ... }
let isPanning = false;
let panStart = { x: 0, y: 0 };
let activeSnapLines = []; // Linhas de guia do snap

// Estado da visualização do canvas
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

  // Inputs da zona selecionada
  const nameInput = dialogEl.querySelector('#gzName');
  if (nameInput) {
    nameInput.oninput = (e) => {
      const z = getSelectedZone();
      if (!z) return;
      z.name = e.target.value;
      updateSidebarList();
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
      z.minx = Math.min(+minXInput.value, +maxXInput.value);
      z.maxx = Math.max(+minXInput.value, +maxXInput.value);
      z.miny = Math.min(+minYInput.value, +maxYInput.value);
      z.maxy = Math.max(+minYInput.value, +maxYInput.value);
      appRef.editor?.syncAll();
      redrawCanvas();
    };
  });

  const colorInput = dialogEl.querySelector('#gzColor');
  const alphaSlider = dialogEl.querySelector('#gzAlpha');
  const alphaVal = dialogEl.querySelector('#gzAlphaVal');

  const onColorChange = () => {
    const z = getSelectedZone();
    if (!z) return;
    const hex = colorInput.value;
    const a = +alphaSlider.value / 100;
    if (alphaVal) alphaVal.textContent = `${Math.round(a * 100)}%`;
    z.color = hexAndAlphaToGzColor(hex, a);
    appRef.editor?.syncAll();
    redrawCanvas();
    updateSidebarList();
  };

  if (colorInput) colorInput.oninput = onColorChange;
  if (alphaSlider) alphaSlider.oninput = onColorChange;

  const btnDel = dialogEl.querySelector('#gzBtnDelete');
  if (btnDel) {
    btnDel.onclick = () => {
      deleteSelectedZone();
    };
  }

  const btnFocus3D = dialogEl.querySelector('#gzBtnFocus3D');
  if (btnFocus3D) {
    btnFocus3D.onclick = () => {
      focusSelectedZoneIn3D();
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

    // Zoom centrado na posição do mouse
    view.panX = mx - (mx - view.panX) * (newZoom / view.zoom);
    view.panY = my - (my - view.panY) * (newZoom / view.zoom);
    view.zoom = newZoom;

    redrawCanvas();
  });

  canvasEl.addEventListener('mousedown', (e) => {
    const rect = canvasEl.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const w = canvasToWorld(cx, cy);

    // Botão do meio ou barra de espaço = Pan
    if (e.button === 1 || e.shiftKey || e.altKey) {
      isPanning = true;
      panStart = { x: e.clientX - view.panX, y: e.clientY - view.panY };
      canvasEl.style.cursor = 'grabbing';
      return;
    }

    if (e.button === 0) {
      // Verifica clique nas alças de redimensionamento da zona selecionada
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

      // Verifica se clicou dentro de alguma zona existente para selecioná-la
      const clickedZone = findZoneAtWorld(w.x, w.y);
      if (clickedZone) {
        selectedUid = clickedZone.uid;
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

      // Inicia criação de nova zona por arrasto
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

    // Atualiza HUD de coordenadas
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

      if (isDraggingHandle.handle === 'move') {
        const wLen = isDraggingHandle.origMaxX - isDraggingHandle.origMinX;
        const hLen = isDraggingHandle.origMaxY - isDraggingHandle.origMinY;
        let newMinX = isDraggingHandle.origMinX + dx;
        let newMinY = isDraggingHandle.origMinY + dy;
        let newMaxX = newMinX + wLen;
        let newMaxY = newMinY + hLen;

        if (snap) {
          const snapped = snapGangZoneEdges({ uid: z.uid, minx: newMinX, miny: newMinY, maxx: newMaxX, maxy: newMaxY }, appRef.project.gangZones);
          newMinX = snapped.minx;
          newMinY = snapped.miny;
          newMaxX = snapped.maxx;
          newMaxY = snapped.maxy;
        }

        z.minx = Math.round(newMinX);
        z.miny = Math.round(newMinY);
        z.maxx = Math.round(newMaxX);
        z.maxy = Math.round(newMaxY);
      } else {
        // Redimensionamento por alça
        let minx = isDraggingHandle.origMinX;
        let miny = isDraggingHandle.origMinY;
        let maxx = isDraggingHandle.origMaxX;
        let maxy = isDraggingHandle.origMaxY;

        if (isDraggingHandle.handle.includes('w')) minx += dx;
        if (isDraggingHandle.handle.includes('e')) maxx += dx;
        if (isDraggingHandle.handle.includes('s')) miny += dy;
        if (isDraggingHandle.handle.includes('n')) maxy += dy;

        if (snap) {
          const snapped = snapGangZoneEdges({ uid: z.uid, minx, miny, maxx, maxy }, appRef.project.gangZones);
          minx = snapped.minx;
          miny = snapped.miny;
          maxx = snapped.maxx;
          maxy = snapped.maxy;
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
      appRef.editor?.saveUndoState?.('Alterar GangZone');
      redrawCanvas();
    }

    if (isDrawing) {
      const minx = Math.round(Math.min(isDrawing.startX, isDrawing.curX));
      const maxx = Math.round(Math.max(isDrawing.startX, isDrawing.curX));
      const miny = Math.round(Math.min(isDrawing.startY, isDrawing.curY));
      const maxy = Math.round(Math.max(isDrawing.startY, isDrawing.curY));
      isDrawing = null;
      activeSnapLines = [];

      // Só cria se tiver tamanho mínimo relevante (ex: >= 15 unidades)
      if ((maxx - minx) >= 15 && (maxy - miny) >= 15) {
        if (!appRef.project.gangZones) appRef.project.gangZones = [];
        const count = appRef.project.gangZones.length + 1;
        const newZ = makeGangZone({
          name: `Zona ${count}`,
          minx, miny, maxx, maxy,
          color: 0x33AA3390, // Grove Street verde translúcido por padrão
        });
        appRef.project.gangZones.push(newZ);
        selectedUid = newZ.uid;
        appRef.editor?.syncAll();
        appRef.editor?.saveUndoState?.('Criar GangZone');
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
    if (selectedUid && z.uid === selectedUid) continue;
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

function getHandleAtPos(z, cx, cy) {
  const handles = [
    { id: 'nw', ...worldToCanvas(z.minx, z.maxy) },
    { id: 'ne', ...worldToCanvas(z.maxx, z.maxy) },
    { id: 'sw', ...worldToCanvas(z.minx, z.miny) },
    { id: 'se', ...worldToCanvas(z.maxx, z.miny) },
  ];
  for (const h of handles) {
    const dist = Math.hypot(cx - h.x, cy - h.y);
    if (dist <= 8) return h.id;
  }
  return null;
}

export function openGangZoneDialog() {
  if (!dialogEl) return;
  if (!dialogEl.open) dialogEl.showModal();
  dialogEl.classList.add('open');
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
  radarImg.src = (window.location.origin || '') + '/api/radarmap?v=' + Date.now();
  radarImg.onload = () => {
    imgLoaded = true;
    if (canvasEl) canvasEl.dataset.imgLoaded = 'true';
    fitMapToView();
    redrawCanvas();
  };
  radarImg.onerror = () => {
    console.warn('[GangZones] Não foi possível carregar /api/radarmap');
    imgLoaded = false;
    redrawCanvas();
  };
}

function redrawCanvas() {
  if (!ctx || !canvasEl) return;
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

  // Fundo escuro
  ctx.fillStyle = '#161922';
  ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

  // Desenha a imagem do mapa do radar
  if (imgLoaded && radarImg) {
    const imgW = radarImg.width * view.zoom;
    const imgH = radarImg.height * view.zoom;
    ctx.drawImage(radarImg, view.panX, view.panY, imgW, imgH);
  } else {
    // Grade de referência se a imagem não carregar
    drawFallbackGrid();
  }

  // Desenha os limites externos do GTA SA (-3000 a +3000)
  const tl = worldToCanvas(WORLD_MIN, WORLD_MAX);
  const br = worldToCanvas(WORLD_MAX, WORLD_MIN);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);

  // Desenha todas as GangZones do projeto
  const zones = appRef.project?.gangZones || [];
  for (const z of zones) {
    drawZone(z, z.uid === selectedUid);
  }

  // Desenha retângulo em criação
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

  // Desenha linhas-guia magnéticas (snap)
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

function drawZone(z, isSelected) {
  const cTopLeft = worldToCanvas(z.minx, z.maxy);
  const cBottomRight = worldToCanvas(z.maxx, z.miny);
  const w = cBottomRight.x - cTopLeft.x;
  const h = cBottomRight.y - cTopLeft.y;

  // Preenchimento translúcido com cor da GangZone
  ctx.fillStyle = gzColorToRgba(z.color);
  ctx.fillRect(cTopLeft.x, cTopLeft.y, w, h);

  // Borda
  ctx.strokeStyle = isSelected ? '#FFFFFF' : 'rgba(0, 0, 0, 0.6)';
  ctx.lineWidth = isSelected ? 2.5 : 1;
  ctx.strokeRect(cTopLeft.x, cTopLeft.y, w, h);

  // Nome da zona no centro
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

  // Alças de redimensionamento nos cantos para zona selecionada
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
    item.className = 'gz-list-item' + (z.uid === selectedUid ? ' selected' : '');
    const { hex, alpha } = gzColorToHexAndAlpha(z.color);

    item.innerHTML = `
      <div class="gz-badge" style="background:${hex}; opacity:${alpha};"></div>
      <div class="gz-info">
        <span class="gz-title">${z.name || 'GangZone'}</span>
        <span class="gz-sub">${z.minx}, ${z.miny} a ${z.maxx}, ${z.maxy}</span>
      </div>
    `;

    item.onclick = () => {
      selectedUid = z.uid;
      updateSidebarFields();
      updateSidebarList();
      redrawCanvas();
    };

    listEl.appendChild(item);
  }
}

function updateSidebarFields() {
  const panel = dialogEl.querySelector('#gzDetailsPanel');
  const z = getSelectedZone();
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

  // Renderiza paleta rápida de cores
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

function createNewZoneAtCenter() {
  if (!appRef.project.gangZones) appRef.project.gangZones = [];
  const count = appRef.project.gangZones.length + 1;
  const newZ = makeGangZone({
    name: `Zona ${count}`,
    minx: -150, miny: -150, maxx: 150, maxy: 150,
    color: 0x33AA3390,
  });
  appRef.project.gangZones.push(newZ);
  selectedUid = newZ.uid;
  appRef.editor?.syncAll();
  appRef.editor?.saveUndoState?.('Criar GangZone');
  updateSidebarFields();
  updateSidebarList();
  redrawCanvas();
}

function deleteSelectedZone() {
  const z = getSelectedZone();
  if (!z) return;
  const idx = appRef.project.gangZones.indexOf(z);
  if (idx >= 0) {
    appRef.project.gangZones.splice(idx, 1);
    selectedUid = null;
    appRef.editor?.syncAll();
    appRef.editor?.saveUndoState?.('Excluir GangZone');
    updateSidebarFields();
    updateSidebarList();
    redrawCanvas();
  }
}

function focusSelectedZoneIn3D() {
  const z = getSelectedZone();
  if (!z || !appRef.vp) return;
  const cx = (z.minx + z.maxx) / 2;
  const cy = (z.miny + z.maxy) / 2;
  const cz = 50.0;
  appRef.vp.teleport(cx, cy - 80, cz + 60, cx, cy, cz);
  appRef.toast(`Câmera 3D focada em ${z.name || 'GangZone'}`, 'ok');
}

function copyAllGangZonesPawn() {
  const zones = appRef.project?.gangZones || [];
  if (!zones.length) {
    appRef.toast('Nenhuma GangZone para copiar', 'info');
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
    appRef.toast(`${zones.length} GangZone(s) copiada(s) em formato Pawn!`, 'ok');
  });
}
