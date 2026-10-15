// Editor visual e interativo de TextDraws para SA-MP / open.mp (TextDrawCreate / CreatePlayerTextDraw)
// Tela de visualização com resolução clássica 640x480, arrasto interativo,
// fontes 0-5 (incluindo prévias de modelo Font 5), caixas, alinhamento, cores RGBA e exportação Pawn.
import { makeTextDraw } from '../editor/project.js';

let dialogEl = null;
let canvasEl = null;
let ctx = null;
let appRef = null;

let selectedIdx = 0;
let isDraggingTd = null; // { idx, startX, startY, origX, origY, isResize }
let showGrid = true;

// Cores padrão do SA-MP
const DEFAULT_TD_COLORS = [
  { name: 'Branco', val: 0xFFFFFFFF },
  { name: 'Preto', val: 0x000000FF },
  { name: 'Amarelo SA-MP', val: 0xFFFF00FF },
  { name: 'Verde SA-MP', val: 0x33AA33FF },
  { name: 'Azul SA-MP', val: 0x33CCFFFF },
  { name: 'Vermelho SA-MP', val: 0xFF3333FF },
  { name: 'Laranja', val: 0xFF9900FF },
  { name: 'Cinza Escuro', val: 0x222222FF },
];

function toHexRgba(num) {
  const val = Number(num) >>> 0;
  const r = (val >>> 24) & 0xFF;
  const g = (val >>> 16) & 0xFF;
  const b = (val >>> 8) & 0xFF;
  const a = (val & 0xFF) / 255;
  const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
  return { hex, alpha: a, r, g, b, css: `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})` };
}

function hexAndAlphaToTdColor(hexStr, alpha = 1.0) {
  let clean = String(hexStr || '').replace(/[^0-9a-fA-F]/g, '');
  if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
  if (clean.length < 6) clean = clean.padEnd(6, 'F');
  const r = parseInt(clean.slice(0, 2), 16) || 0;
  const g = parseInt(clean.slice(2, 4), 16) || 0;
  const b = parseInt(clean.slice(4, 6), 16) || 0;
  const a = Math.max(0, Math.min(255, Math.round(Number(alpha) * 255)));
  return (((r << 24) | (g << 16) | (b << 8) | a) >>> 0);
}

export function initTextDrawEditor(app) {
  appRef = app;
  dialogEl = document.getElementById('dlgTextDraw');
  if (!dialogEl) return;

  canvasEl = dialogEl.querySelector('#tdCanvas');
  if (canvasEl) {
    ctx = canvasEl.getContext('2d');
    setupCanvasEvents();
  }

  setupDialogEvents();
}

function setupDialogEvents() {
  const closeBtn = dialogEl.querySelector('.modal-close');
  if (closeBtn) closeBtn.onclick = () => closeTextDrawEditor();

  const doneBtn = dialogEl.querySelector('#tdBtnDone');
  if (doneBtn) doneBtn.onclick = () => closeTextDrawEditor();

  const addBtn = dialogEl.querySelector('#tdBtnAdd');
  if (addBtn) {
    addBtn.onclick = () => {
      createNewTextDraw();
    };
  }

  const addBoxBtn = dialogEl.querySelector('#tdBtnAddBox');
  if (addBoxBtn) {
    addBoxBtn.onclick = () => {
      createNewBox();
    };
  }

  const addModelBtn = dialogEl.querySelector('#tdBtnAddModel');
  if (addModelBtn) {
    addModelBtn.onclick = () => {
      createNewModelPreview();
    };
  }

  const copyPwnBtn = dialogEl.querySelector('#tdBtnCopyPwn');
  if (copyPwnBtn) {
    copyPwnBtn.onclick = () => {
      copyTextDrawsPawn();
    };
  }

  const btnDel = dialogEl.querySelector('#tdBtnDelete');
  if (btnDel) {
    btnDel.onclick = () => {
      deleteSelectedTextDraw();
    };
  }

  const btnDup = dialogEl.querySelector('#tdBtnDuplicate');
  if (btnDup) {
    btnDup.onclick = () => {
      duplicateSelectedTextDraw();
    };
  }

  const chkGrid = dialogEl.querySelector('#tdChkGrid');
  if (chkGrid) {
    chkGrid.onchange = (e) => {
      showGrid = e.target.checked;
      redrawCanvas();
    };
  }

  bindFieldInputs();
}

function bindFieldInputs() {
  const bind = (id, prop, isNum = false) => {
    const el = dialogEl.querySelector(id);
    if (!el) return;
    el.oninput = () => {
      const td = getSelectedTd();
      if (!td) return;
      td[prop] = isNum ? +el.value : el.value;
      redrawCanvas();
      if (prop === 'text' || prop === 'isPlayer' || prop === 'font') updateSidebarList();
    };
  };

  bind('#tdText', 'text');
  bind('#tdPosX', 'x', true);
  bind('#tdPosY', 'y', true);
  bind('#tdLetterX', 'letterSizeX', true);
  bind('#tdLetterY', 'letterSizeY', true);
  bind('#tdSizeX', 'textSizeX', true);
  bind('#tdSizeY', 'textSizeY', true);
  bind('#tdOutline', 'outline', true);
  bind('#tdShadow', 'shadow', true);
  bind('#tdPreviewModel', 'previewModel', true);
  bind('#tdPreviewRotX', 'previewRotX', true);
  bind('#tdPreviewRotY', 'previewRotY', true);
  bind('#tdPreviewRotZ', 'previewRotZ', true);
  bind('#tdPreviewZoom', 'previewZoom', true);

  const selFont = dialogEl.querySelector('#tdFont');
  if (selFont) {
    selFont.onchange = () => {
      const td = getSelectedTd();
      if (!td) return;
      td.font = +selFont.value;
      updateSidebarFields();
      updateSidebarList();
      redrawCanvas();
    };
  }

  const selAlign = dialogEl.querySelector('#tdAlign');
  if (selAlign) {
    selAlign.onchange = () => {
      const td = getSelectedTd();
      if (!td) return;
      td.alignment = +selAlign.value;
      redrawCanvas();
    };
  }

  const chkBox = dialogEl.querySelector('#tdUseBox');
  if (chkBox) {
    chkBox.onchange = () => {
      const td = getSelectedTd();
      if (!td) return;
      td.useBox = chkBox.checked ? 1 : 0;
      redrawCanvas();
    };
  }

  const chkProp = dialogEl.querySelector('#tdProportional');
  if (chkProp) {
    chkProp.onchange = () => {
      const td = getSelectedTd();
      if (!td) return;
      td.proportional = chkProp.checked ? 1 : 0;
      redrawCanvas();
    };
  }

  const chkSel = dialogEl.querySelector('#tdSelectable');
  if (chkSel) {
    chkSel.onchange = () => {
      const td = getSelectedTd();
      if (!td) return;
      td.selectable = chkSel.checked ? 1 : 0;
      redrawCanvas();
    };
  }

  const chkPlayer = dialogEl.querySelector('#tdIsPlayer');
  if (chkPlayer) {
    chkPlayer.onchange = () => {
      const td = getSelectedTd();
      if (!td) return;
      td.isPlayer = chkPlayer.checked;
      updateSidebarList();
    };
  }

  // Cores: Texto
  const colColor = dialogEl.querySelector('#tdColor');
  const alphaColor = dialogEl.querySelector('#tdAlpha');
  const onColorChange = () => {
    const td = getSelectedTd();
    if (!td) return;
    td.color = hexAndAlphaToTdColor(colColor.value, +alphaColor.value / 100);
    redrawCanvas();
  };
  if (colColor) colColor.oninput = onColorChange;
  if (alphaColor) alphaColor.oninput = onColorChange;

  // Cores: Box
  const colBox = dialogEl.querySelector('#tdBoxColor');
  const alphaBox = dialogEl.querySelector('#tdBoxAlpha');
  const onBoxColorChange = () => {
    const td = getSelectedTd();
    if (!td) return;
    td.boxColor = hexAndAlphaToTdColor(colBox.value, +alphaBox.value / 100);
    redrawCanvas();
  };
  if (colBox) colBox.oninput = onBoxColorChange;
  if (alphaBox) alphaBox.oninput = onBoxColorChange;

  // Cores: Background / Sombra
  const colBg = dialogEl.querySelector('#tdBgColor');
  const onBgChange = () => {
    const td = getSelectedTd();
    if (!td) return;
    td.backgroundColor = hexAndAlphaToTdColor(colBg.value, 1.0);
    redrawCanvas();
  };
  if (colBg) colBg.oninput = onBgChange;
}

// Cache de miniaturas de modelos 3D (Font 5)
const modelImgCache = new Map();

function getOrLoadModelThumbnail(modelId) {
  const id = Number(modelId) || 0;
  if (!id) return null;
  if (modelImgCache.has(id)) {
    return modelImgCache.get(id);
  }
  const entry = { img: new Image(), loaded: false, failed: false };
  entry.img.onload = () => {
    entry.loaded = true;
    redrawCanvas();
  };
  entry.img.onerror = () => {
    if (appRef?.thumbs?.request) {
      appRef.thumbs.request(id, (url) => {
        if (url && url !== entry.img.src) {
          entry.img.src = url;
          return;
        }
        entry.failed = true;
        redrawCanvas();
      });
    } else {
      entry.failed = true;
      redrawCanvas();
    }
  };
  entry.img.src = `/thumbs/obj/${id}.webp`;
  modelImgCache.set(id, entry);
  return entry;
}

function setupCanvasEvents() {
  canvasEl.addEventListener('mousedown', (e) => {
    const rect = canvasEl.getBoundingClientRect();
    const scaleX = 640 / rect.width;
    const scaleY = 480 / rect.height;
    const sx = (e.clientX - rect.left) * scaleX;
    const sy = (e.clientY - rect.top) * scaleY;

    const tds = appRef.project?.textDraws || [];

    // 1. Checa se clicou na alça de redimensionamento do TextDraw selecionado
    const curTd = getSelectedTd();
    if (curTd) {
      const curBounds = getTextDrawBounds(curTd);
      const handleX = curBounds.x + curBounds.w;
      const handleY = curBounds.y + curBounds.h;
      if (Math.hypot(sx - handleX, sy - handleY) <= 12) {
        isDraggingTd = {
          idx: selectedIdx,
          isResize: true,
          startX: sx,
          startY: sy,
          origX: curTd.x,
          origY: curTd.y,
          origW: curBounds.w,
          origH: curBounds.h,
          origSizeX: curTd.textSizeX,
          origSizeY: curTd.textSizeY,
          origLetterX: curTd.letterSizeX,
          origLetterY: curTd.letterSizeY,
        };
        return;
      }
    }

    // 2. Busca TextDraw clicado de trás para frente (ordem de exibição)
    for (let i = tds.length - 1; i >= 0; i--) {
      const td = tds[i];
      const bounds = getTextDrawBounds(td);
      if (sx >= bounds.x && sx <= bounds.x + bounds.w && sy >= bounds.y && sy <= bounds.y + bounds.h) {
        selectedIdx = i;
        isDraggingTd = {
          idx: i,
          isResize: false,
          startX: sx,
          startY: sy,
          origX: td.x,
          origY: td.y,
          origSizeX: td.textSizeX,
        };
        updateSidebarFields();
        updateSidebarList();
        redrawCanvas();
        return;
      }
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (!dialogEl || !dialogEl.classList.contains('open')) return;
    const rect = canvasEl.getBoundingClientRect();
    const scaleX = 640 / rect.width;
    const scaleY = 480 / rect.height;
    const sx = (e.clientX - rect.left) * scaleX;
    const sy = (e.clientY - rect.top) * scaleY;

    if (!isDraggingTd) {
      // Atualiza estilo do cursor do mouse ao passar por cima
      const curTd = getSelectedTd();
      if (curTd) {
        const curBounds = getTextDrawBounds(curTd);
        const handleX = curBounds.x + curBounds.w;
        const handleY = curBounds.y + curBounds.h;
        if (Math.hypot(sx - handleX, sy - handleY) <= 12) {
          canvasEl.style.cursor = 'nwse-resize';
          return;
        }
      }
      const tds = appRef.project?.textDraws || [];
      for (let i = tds.length - 1; i >= 0; i--) {
        const b = getTextDrawBounds(tds[i]);
        if (sx >= b.x && sx <= b.x + b.w && sy >= b.y && sy <= b.y + b.h) {
          canvasEl.style.cursor = 'move';
          return;
        }
      }
      canvasEl.style.cursor = 'default';
      return;
    }

    const td = appRef.project?.textDraws?.[isDraggingTd.idx];
    if (!td) return;

    if (isDraggingTd.isResize) {
      const dx = sx - isDraggingTd.startX;
      const dy = sy - isDraggingTd.startY;
      const newW = Math.max(10, Math.round(isDraggingTd.origW + dx));
      const newH = Math.max(10, Math.round(isDraggingTd.origH + dy));

      if (td.font === 5) {
        // Prévia de modelo 3D: textSizeX e textSizeY são largura e altura da caixa
        td.textSizeX = newW;
        td.textSizeY = newH;
      } else if (td.useBox) {
        // Caixa padrão SA-MP: textSizeX é a coordenada X final da caixa (td.x + newW), textSizeY é altura
        td.textSizeX = Math.round(td.x + newW);
        td.textSizeY = newH;
      } else {
        // Texto normal: escala letterSizeX e letterSizeY proporcionalmente
        const lines = String(td.text || '').split(/\r?\n/);
        const lineCount = Math.max(1, lines.length);
        const maxChars = Math.max(...lines.map(l => l.replace(/\{[A-Fa-f0-9]{6}\}/g, '').length), 1);
        td.letterSizeX = Number(Math.max(0.1, (newW / maxChars) / 18).toFixed(2));
        td.letterSizeY = Number(Math.max(0.2, (newH / lineCount) / 20).toFixed(2));
      }
    } else {
      const dx = sx - isDraggingTd.startX;
      const dy = sy - isDraggingTd.startY;
      const newX = Math.round(Math.max(0, Math.min(640, isDraggingTd.origX + dx)));
      const newY = Math.round(Math.max(0, Math.min(480, isDraggingTd.origY + dy)));

      if (td.useBox && td.font !== 5 && isDraggingTd.origSizeX > isDraggingTd.origX) {
        // Mantém a largura da caixa ao arrastá-la de posição
        const boxW = isDraggingTd.origSizeX - isDraggingTd.origX;
        td.x = newX;
        td.textSizeX = newX + boxW;
        td.y = newY;
      } else {
        td.x = newX;
        td.y = newY;
      }
    }

    updateSidebarFields();
    redrawCanvas();
  });

  window.addEventListener('mouseup', () => {
    if (isDraggingTd) {
      isDraggingTd = null;
      canvasEl.style.cursor = 'default';
      appRef.editor?.saveUndoState?.('Editar TextDraw');
      redrawCanvas();
    }
  });
}

function getTextDrawBounds(td) {
  const fontH = (td.letterSizeY || 1.12) * 20;
  const lines = String(td.text || '').split(/\r?\n/);
  const lineCount = Math.max(1, lines.length);

  let w = 100;
  let h = 100;

  if (td.font === 5) {
    w = td.textSizeX > 0 ? td.textSizeX : 100;
    h = td.textSizeY > 0 ? td.textSizeY : 100;
  } else if (td.useBox) {
    w = td.textSizeX > td.x ? (td.textSizeX - td.x) : Math.max(30, td.textSizeX || 100);
    h = (td.textSizeY > 0) ? td.textSizeY : (lineCount * fontH);
  } else {
    // Estimativa de largura do texto baseada na fonte e letterSizeX
    const charW = (td.letterSizeX || 0.48) * 18;
    const maxChars = Math.max(...lines.map(l => l.replace(/\{[A-Fa-f0-9]{6}\}/g, '').length), 1);
    w = Math.max(20, Math.round(maxChars * charW));
    h = Math.max(14, Math.round(lineCount * fontH));
  }

  let x = td.x;
  if (td.alignment === 2) x -= w / 2; // Centro
  else if (td.alignment === 3) x -= w; // Direita

  return { x, y: td.y, w, h };
}

function getSelectedTd() {
  const tds = appRef.project?.textDraws || [];
  return tds[selectedIdx] || null;
}

export function openTextDrawEditor() {
  if (!dialogEl) return;
  if (!dialogEl.open) dialogEl.showModal();
  dialogEl.classList.add('open');
  if (!appRef.project.textDraws) appRef.project.textDraws = [];

  if (appRef.project.textDraws.length === 0) {
    createNewTextDraw('SA MAP STUDIO');
  }

  updateSidebarList();
  updateSidebarFields();
  redrawCanvas();
}

export function closeTextDrawEditor() {
  if (!dialogEl) return;
  if (dialogEl.open) dialogEl.close();
  dialogEl.classList.remove('open');
}

function redrawCanvas() {
  if (!ctx || !canvasEl) return;
  ctx.clearRect(0, 0, 640, 480);

  // Fundo cinza escuro simulando o jogo / GTA SA
  ctx.fillStyle = '#0a0d14';
  ctx.fillRect(0, 0, 640, 480);

  // Grade e linhas guias de limites
  if (showGrid) {
    drawGrid();
  }

  const tds = appRef.project?.textDraws || [];
  for (let i = 0; i < tds.length; i++) {
    renderTextDraw(tds[i], i === selectedIdx);
  }
}

function drawGrid() {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;

  for (let x = 0; x <= 640; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 480);
    ctx.stroke();
  }
  for (let y = 0; y <= 480; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(640, y);
    ctx.stroke();
  }

  // Margem segura da tela do jogo (Safe Zone)
  ctx.strokeStyle = 'rgba(255, 200, 0, 0.2)';
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(20, 20, 600, 440);
  ctx.setLineDash([]);
}

function renderTextDraw(td, isSelected) {
  const bounds = getTextDrawBounds(td);

  // 1. Renderiza Caixa (Box) se ativada
  if (td.useBox) {
    const boxCol = toHexRgba(td.boxColor ?? 0x00000080);
    ctx.fillStyle = boxCol.css;
    ctx.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
  }

  // 2. Se for Font 5 (Prévia de Modelo 3D)
  if (td.font === 5) {
    renderModelPreview(td, bounds);
  } else {
    // 3. Renderiza Texto normal
    renderTextDrawString(td, bounds);
  }

  // 4. Borda de seleção e alça de redimensionamento
  if (isSelected) {
    ctx.strokeStyle = '#00CCFF';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(bounds.x - 2, bounds.y - 2, bounds.w + 4, bounds.h + 4);
    ctx.setLineDash([]);

    // Alça de redimensionamento no canto inferior direito para qualquer TextDraw
    const hx = bounds.x + bounds.w;
    const hy = bounds.y + bounds.h;
    ctx.fillStyle = '#00CCFF';
    ctx.fillRect(hx - 5, hy - 5, 10, 10);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(hx - 5, hy - 5, 10, 10);
  }
}

function renderTextDrawString(td, bounds) {
  const fontFam = getFontFamily(td.font);
  const fontSize = Math.max(8, Math.round((td.letterSizeY || 1.12) * 18));
  ctx.font = `bold ${fontSize}px ${fontFam}`;
  ctx.textBaseline = 'top';

  if (td.alignment === 2) ctx.textAlign = 'center';
  else if (td.alignment === 3) ctx.textAlign = 'right';
  else ctx.textAlign = 'left';

  const lines = String(td.text || '').split(/\r?\n/);
  const lineH = (td.letterSizeY || 1.12) * 20;

  lines.forEach((line, lineIdx) => {
    const curY = td.y + lineIdx * lineH;
    let startX = td.x;

    // Sombra ou Contorno
    const bgCol = toHexRgba(td.backgroundColor ?? 0x000000FF);
    if (td.outline > 0) {
      ctx.strokeStyle = bgCol.css;
      ctx.lineWidth = td.outline * 2;
      ctx.strokeText(stripColorTags(line), startX, curY);
    } else if (td.shadow > 0) {
      ctx.fillStyle = bgCol.css;
      ctx.fillText(stripColorTags(line), startX + td.shadow, curY + td.shadow);
    }

    // Texto com suporte a tags {RRGGBB}
    drawFormattedLine(line, startX, curY, toHexRgba(td.color ?? 0xE1E1E1FF).css);
  });
}

function drawFormattedLine(line, x, y, defaultColor) {
  const parts = parseColorTags(line, defaultColor);
  let curX = x;

  for (const part of parts) {
    ctx.fillStyle = part.color;
    ctx.fillText(part.text, curX, y);
    curX += ctx.measureText(part.text).width;
  }
}

function parseColorTags(str, defColor) {
  const regex = /\{([A-Fa-f0-9]{6})\}/g;
  const parts = [];
  let lastIdx = 0;
  let curColor = defColor;
  let m;

  while ((m = regex.exec(str)) !== null) {
    if (m.index > lastIdx) {
      parts.push({ text: str.slice(lastIdx, m.index), color: curColor });
    }
    curColor = `#${m[1]}`;
    lastIdx = regex.lastIndex;
  }
  if (lastIdx < str.length) {
    parts.push({ text: str.slice(lastIdx), color: curColor });
  }
  return parts;
}

function stripColorTags(str) {
  return String(str || '').replace(/\{[A-Fa-f0-9]{6}\}/g, '');
}

function getFontFamily(fontId) {
  switch (fontId) {
    case 0: return '"Diplomat", serif';
    case 1: return '"Arial Black", "Chalet London 1960", sans-serif';
    case 2: return '"Pricedown", "Impact", fantasy';
    case 3: return '"Bank Gothic", "Trebuchet MS", sans-serif';
    case 4: return 'monospace';
    default: return 'sans-serif';
  }
}

function renderModelPreview(td, bounds) {
  // Fundo com contorno indicando o modelo 3D
  ctx.fillStyle = td.useBox ? toHexRgba(td.boxColor ?? 0x00000080).css : '#151b26';
  ctx.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
  ctx.strokeStyle = '#384860';
  ctx.lineWidth = 1;
  ctx.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h);

  const modelId = td.previewModel || 411;
  const thumb = getOrLoadModelThumbnail(modelId);
  const zoom = Math.max(0.2, Math.min(5.0, Number(td.previewZoom) || 1.0));

  if (thumb && thumb.loaded && thumb.img.width > 0) {
    ctx.save();
    // Clipa dentro da caixa do TextDraw
    ctx.beginPath();
    ctx.rect(bounds.x, bounds.y, bounds.w, bounds.h);
    ctx.clip();

    const cx = bounds.x + bounds.w / 2;
    const cy = bounds.y + bounds.h / 2;
    ctx.translate(cx, cy);

    // Rotação Z do preview
    if (td.previewRotZ) {
      ctx.rotate((td.previewRotZ * Math.PI) / 180);
    }

    // Calcula dimensão da imagem mantendo proporção
    const imgAspect = thumb.img.width / thumb.img.height;
    let drawW = bounds.w * 0.9 * zoom;
    let drawH = drawW / imgAspect;
    if (drawH > bounds.h * 0.9 * zoom) {
      drawH = bounds.h * 0.9 * zoom;
      drawW = drawH * imgAspect;
    }

    ctx.drawImage(thumb.img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  } else {
    // Se ainda está carregando ou não tem miniatura, exibe texto indicativo
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = '#65B5FF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`MODELO 3D: #${modelId}`, bounds.x + bounds.w / 2, bounds.y + bounds.h / 2);
  }

  // Tag do Modelo no canto superior
  ctx.font = '9px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`#${modelId} (${zoom.toFixed(1)}x)`, bounds.x + 4, bounds.y + 4);
}

function updateSidebarList() {
  const listEl = dialogEl.querySelector('#tdList');
  if (!listEl) return;
  listEl.innerHTML = '';

  const tds = appRef.project?.textDraws || [];
  if (!tds.length) {
    listEl.innerHTML = '<div style="color:var(--text-muted); font-size:12px; padding:12px; text-align:center;">Nenhum TextDraw criado.</div>';
    return;
  }

  tds.forEach((td, idx) => {
    const item = document.createElement('div');
    item.className = 'td-list-item' + (idx === selectedIdx ? ' selected' : '');
    const col = toHexRgba(td.color ?? 0xFFFFFFFF);
    const label = stripColorTags(td.text || (td.font === 5 ? `Model #${td.previewModel}` : 'Box'));

    item.innerHTML = `
      <div class="td-badge" style="background:${col.hex};"></div>
      <div class="td-info">
        <span class="td-title">${td.isPlayer ? '[Player] ' : ''}${label}</span>
        <span class="td-sub">Pos: ${td.x}, ${td.y} | Font: ${td.font}</span>
      </div>
    `;

    item.onclick = () => {
      selectedIdx = idx;
      updateSidebarFields();
      updateSidebarList();
      redrawCanvas();
    };

    listEl.appendChild(item);
  });
}

function updateSidebarFields() {
  const panel = dialogEl.querySelector('#tdDetailsPanel');
  const td = getSelectedTd();
  if (!td) {
    if (panel) panel.style.display = 'none';
    return;
  }
  if (panel) panel.style.display = 'block';

  const setVal = (id, val) => {
    const el = dialogEl.querySelector(id);
    if (el) el.value = val ?? '';
  };
  const setChk = (id, bool) => {
    const el = dialogEl.querySelector(id);
    if (el) el.checked = Boolean(bool);
  };

  setVal('#tdText', td.text);
  setVal('#tdPosX', td.x);
  setVal('#tdPosY', td.y);
  setVal('#tdLetterX', td.letterSizeX);
  setVal('#tdLetterY', td.letterSizeY);
  setVal('#tdSizeX', td.textSizeX);
  setVal('#tdSizeY', td.textSizeY);
  setVal('#tdFont', td.font);
  setVal('#tdAlign', td.alignment);
  setVal('#tdOutline', td.outline);
  setVal('#tdShadow', td.shadow);
  setChk('#tdUseBox', td.useBox);
  setChk('#tdProportional', td.proportional);
  setChk('#tdSelectable', td.selectable);
  setChk('#tdIsPlayer', td.isPlayer);

  // Cores
  const textCol = toHexRgba(td.color ?? 0xE1E1E1FF);
  setVal('#tdColor', textCol.hex);
  setVal('#tdAlpha', Math.round(textCol.alpha * 100));

  const boxCol = toHexRgba(td.boxColor ?? 0x00000080);
  setVal('#tdBoxColor', boxCol.hex);
  setVal('#tdBoxAlpha', Math.round(boxCol.alpha * 100));

  const bgCol = toHexRgba(td.backgroundColor ?? 0x000000FF);
  setVal('#tdBgColor', bgCol.hex);

  // Controles específicos de Font 5 (Model Preview)
  const modelPanel = dialogEl.querySelector('#tdModelPreviewPanel');
  if (modelPanel) {
    modelPanel.style.display = td.font === 5 ? 'block' : 'none';
    setVal('#tdPreviewModel', td.previewModel || 411);
    setVal('#tdPreviewRotX', td.previewRotX || 0);
    setVal('#tdPreviewRotY', td.previewRotY || 0);
    setVal('#tdPreviewRotZ', td.previewRotZ || 0);
    setVal('#tdPreviewZoom', td.previewZoom || 1);
  }
}

function createNewTextDraw(defaultText = 'NOVO TEXTO') {
  if (!appRef.project.textDraws) appRef.project.textDraws = [];
  const td = makeTextDraw({
    text: defaultText,
    x: 320,
    y: 200,
    font: 1,
    letterSizeX: 0.48,
    letterSizeY: 1.12,
    color: 0xFFFFFFFF,
    alignment: 2,
    shadow: 1,
    outline: 0,
    proportional: 1,
  });
  appRef.project.textDraws.push(td);
  selectedIdx = appRef.project.textDraws.length - 1;
  appRef.editor?.saveUndoState?.('Criar TextDraw');
  updateSidebarFields();
  updateSidebarList();
  redrawCanvas();
}

function createNewBox() {
  if (!appRef.project.textDraws) appRef.project.textDraws = [];
  const td = makeTextDraw({
    text: '',
    x: 200,
    y: 150,
    useBox: 1,
    textSizeX: 440,
    textSizeY: 100,
    boxColor: 0x00000080,
  });
  appRef.project.textDraws.push(td);
  selectedIdx = appRef.project.textDraws.length - 1;
  appRef.editor?.saveUndoState?.('Criar Caixa TextDraw');
  updateSidebarFields();
  updateSidebarList();
  redrawCanvas();
}

function createNewModelPreview() {
  if (!appRef.project.textDraws) appRef.project.textDraws = [];
  const td = makeTextDraw({
    text: 'Preview',
    x: 270,
    y: 190,
    font: 5,
    previewModel: 411, // Infernus
    previewZoom: 1.0,
    textSizeX: 100,
    textSizeY: 100,
    useBox: 1,
    boxColor: 0x00000040,
  });
  appRef.project.textDraws.push(td);
  selectedIdx = appRef.project.textDraws.length - 1;
  appRef.editor?.saveUndoState?.('Criar Model Preview');
  updateSidebarFields();
  updateSidebarList();
  redrawCanvas();
}

function deleteSelectedTextDraw() {
  const tds = appRef.project?.textDraws || [];
  if (!tds[selectedIdx]) return;
  tds.splice(selectedIdx, 1);
  selectedIdx = Math.max(0, selectedIdx - 1);
  appRef.editor?.saveUndoState?.('Excluir TextDraw');
  updateSidebarFields();
  updateSidebarList();
  redrawCanvas();
}

function duplicateSelectedTextDraw() {
  const td = getSelectedTd();
  if (!td) return;
  const copy = makeTextDraw({ ...td, uid: null, x: td.x + 10, y: td.y + 10 });
  appRef.project.textDraws.push(copy);
  selectedIdx = appRef.project.textDraws.length - 1;
  appRef.editor?.saveUndoState?.('Duplicar TextDraw');
  updateSidebarFields();
  updateSidebarList();
  redrawCanvas();
}

function copyTextDrawsPawn() {
  const tds = appRef.project?.textDraws || [];
  if (!tds.length) {
    appRef.toast('Nenhum TextDraw para exportar', 'info');
    return;
  }

  const lines = ['// TextDraws exportados pelo SA Map Studio'];
  tds.forEach((td, i) => {
    const varName = `td_${i}`;
    const prefix = td.isPlayer ? 'PlayerText:' : 'Text:';
    const cHex = '0x' + (Number(td.color) >>> 0).toString(16).toUpperCase().padStart(8, '0');
    const bHex = '0x' + (Number(td.boxColor) >>> 0).toString(16).toUpperCase().padStart(8, '0');
    const bgHex = '0x' + (Number(td.backgroundColor) >>> 0).toString(16).toUpperCase().padStart(8, '0');

    lines.push(`new ${prefix}${varName} = ${td.isPlayer ? 'CreatePlayerTextDraw(playerid, ' : 'TextDrawCreate('}${td.x}.0, ${td.y}.0, "${td.text || ''}");`);
    lines.push(`TextDrawFont(${varName}, ${td.font ?? 1});`);
    lines.push(`TextDrawLetterSize(${varName}, ${(td.letterSizeX ?? 0.48).toFixed(2)}, ${(td.letterSizeY ?? 1.12).toFixed(2)});`);
    lines.push(`TextDrawTextSize(${varName}, ${(td.textSizeX ?? 1280).toFixed(1)}, ${(td.textSizeY ?? 1280).toFixed(1)});`);
    lines.push(`TextDrawColor(${varName}, ${cHex});`);
    lines.push(`TextDrawSetOutline(${varName}, ${td.outline ?? 0});`);
    lines.push(`TextDrawSetShadow(${varName}, ${td.shadow ?? 1});`);
    lines.push(`TextDrawAlignment(${varName}, ${td.alignment ?? 1});`);
    if (td.useBox) {
      lines.push(`TextDrawUseBox(${varName}, 1);`);
      lines.push(`TextDrawBoxColor(${varName}, ${bHex});`);
    }
    lines.push(`TextDrawBackgroundColor(${varName}, ${bgHex});`);
    lines.push(`TextDrawSetProportional(${varName}, ${td.proportional ?? 1});`);
    if (td.selectable) lines.push(`TextDrawSetSelectable(${varName}, 1);`);
    if (td.font === 5 && td.previewModel) {
      lines.push(`TextDrawSetPreviewModel(${varName}, ${td.previewModel});`);
      lines.push(`TextDrawSetPreviewRot(${varName}, ${(td.previewRotX || 0).toFixed(1)}, ${(td.previewRotY || 0).toFixed(1)}, ${(td.previewRotZ || 0).toFixed(1)}, ${(td.previewZoom || 1).toFixed(1)});`);
    }
    lines.push('');
  });

  const fullText = lines.join('\n');
  navigator.clipboard.writeText(fullText).then(() => {
    appRef.toast(`${tds.length} TextDraw(s) copiados em formato Pawn!`, 'ok');
  });
}
