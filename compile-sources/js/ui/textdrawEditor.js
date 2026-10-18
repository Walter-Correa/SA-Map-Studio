// Editor visual e interativo de TextDraws (TextDrawCreate / CreatePlayerTextDraw)
// Tela de visualização com resolução clássica 640x480, arrasto interativo,
// fontes 0-5 (incluindo prévias de modelo Font 5), caixas, alinhamento, cores RGBA e exportação Pawn.
import { makeTextDraw } from '../editor/project.js';
import { openSpritePicker } from './spritePicker.js';
import { TEXTDRAW_SPRITES } from '../data/sprites.js';

let dialogEl = null;
let canvasEl = null;
let ctx = null;
let appRef = null;

let selectedIdx = 0;
let isDraggingTd = null; // { idx, startX, startY, origX, origY, isResize }
let dragStartTdSnapshot = null;
let showGrid = true;
let showGameBg = true;
let gameBgImg = null;

let tdUndoStack = [];
let tdRedoStack = [];

function tdPushUndo() {
  const current = JSON.stringify({
    textDraws: appRef?.project?.textDraws || [],
    selectedIdx
  });
  if (tdUndoStack.length > 0 && tdUndoStack[tdUndoStack.length - 1] === current) return;
  tdUndoStack.push(current);
  if (tdUndoStack.length > 50) tdUndoStack.shift();
  tdRedoStack = [];
  updateTdUndoButtons();
}

function tdPushUndoSnapshot(snapshotStr) {
  if (!snapshotStr) return;
  if (tdUndoStack.length > 0 && tdUndoStack[tdUndoStack.length - 1] === snapshotStr) return;
  tdUndoStack.push(snapshotStr);
  if (tdUndoStack.length > 50) tdUndoStack.shift();
  tdRedoStack = [];
  updateTdUndoButtons();
}

function tdUndo() {
  if (tdUndoStack.length === 0) return;
  const current = JSON.stringify({
    textDraws: appRef?.project?.textDraws || [],
    selectedIdx
  });
  tdRedoStack.push(current);
  const prev = JSON.parse(tdUndoStack.pop());
  appRef.project.textDraws = prev.textDraws || [];
  selectedIdx = prev.selectedIdx;
  if (selectedIdx >= appRef.project.textDraws.length) {
    selectedIdx = appRef.project.textDraws.length - 1;
  }
  updateSidebarList();
  updateSidebarFields();
  redrawCanvas();
  updateTdUndoButtons();
}

function tdRedo() {
  if (tdRedoStack.length === 0) return;
  const current = JSON.stringify({
    textDraws: appRef?.project?.textDraws || [],
    selectedIdx
  });
  tdUndoStack.push(current);
  const next = JSON.parse(tdRedoStack.pop());
  appRef.project.textDraws = next.textDraws || [];
  selectedIdx = next.selectedIdx;
  if (selectedIdx >= appRef.project.textDraws.length) {
    selectedIdx = appRef.project.textDraws.length - 1;
  }
  updateSidebarList();
  updateSidebarFields();
  redrawCanvas();
  updateTdUndoButtons();
}

function updateTdUndoButtons() {
  const btnU = dialogEl?.querySelector('#tdBtnUndo');
  const btnR = dialogEl?.querySelector('#tdBtnRedo');
  if (btnU) btnU.disabled = tdUndoStack.length === 0;
  if (btnR) btnR.disabled = tdRedoStack.length === 0;
}

const spriteImageCache = new Map();

function getSpriteImage(lib, name) {
  let libLower = (lib || 'hud').toLowerCase();
  let nameLower = (name || '').toLowerCase();
  if (libLower === 'hud' && (nameLower === 'radar_ring' || nameLower === 'radarringplane')) {
    nameLower = 'radarringplane';
  }
  if (libLower === 'loadscs' || libLower === 'ld_loadscs') {
    libLower = 'loadsuk';
    if (nameLower === 'loadsc0') nameLower = 'loadscuk';
  } else if (libLower === 'loadsuk' && nameLower === 'loadsc0') {
    nameLower = 'loadscuk';
  }
  const key = `${libLower}:${nameLower}`;
  if (spriteImageCache.has(key)) return spriteImageCache.get(key);

  const found = TEXTDRAW_SPRITES.find(s => s.value.toLowerCase() === key);
  const primaryUrl = found?.thumb || `/cache/sprites/${libLower}/${nameLower}.png`;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = primaryUrl;
  img.onload = () => {
    if (dialogEl && dialogEl.classList.contains('open')) redrawCanvas();
  };
  spriteImageCache.set(key, img);
  return img;
}

function loadGameBg() {
  if (!gameBgImg) {
    gameBgImg = new Image();
    gameBgImg.src = 'css/game_bg.png';
    gameBgImg.onload = () => {
      if (dialogEl && dialogEl.classList.contains('open')) redrawCanvas();
    };
  }
}

// Cores padrão
const DEFAULT_TD_COLORS = [
  { name: 'Branco', val: 0xFFFFFFFF },
  { name: 'Preto', val: 0x000000FF },
  { name: 'Amarelo', val: 0xFFFF00FF },
  { name: 'Verde', val: 0x33AA33FF },
  { name: 'Azul', val: 0x33CCFFFF },
  { name: 'Vermelho', val: 0xFF3333FF },
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
  return { hex, alpha: a, a, r, g, b, css: `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})` };
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

  loadGameBg();
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

  const addSpriteBtn = dialogEl.querySelector('#tdBtnAddSprite');
  if (addSpriteBtn) {
    addSpriteBtn.onclick = () => {
      createNewSprite();
    };
  }

  const copyPwnBtn = dialogEl.querySelector('#tdBtnCopyPwn');
  if (copyPwnBtn) {
    copyPwnBtn.onclick = () => {
      copyTextDrawsPawn();
    };
  }

  const btnUndo = dialogEl.querySelector('#tdBtnUndo');
  if (btnUndo) {
    btnUndo.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      tdUndo();
    };
  }

  const btnRedo = dialogEl.querySelector('#tdBtnRedo');
  if (btnRedo) {
    btnRedo.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      tdRedo();
    };
  }

  const btnDel = dialogEl.querySelector('#tdBtnDelete');
  if (btnDel) {
    btnDel.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      deleteSelectedTextDraw();
    };
  }

  const btnDup = dialogEl.querySelector('#tdBtnDuplicate');
  if (btnDup) {
    btnDup.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      duplicateSelectedTextDraw();
    };
  }

  dialogEl.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      tdUndo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && ((e.key === 'y' || e.key === 'Y') || (e.shiftKey && (e.key === 'z' || e.key === 'Z')))) {
      e.preventDefault();
      e.stopPropagation();
      tdRedo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C' || e.key === 'd' || e.key === 'D')) {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;
      e.preventDefault();
      e.stopPropagation();
      duplicateSelectedTextDraw();
      return;
    }
    if (e.key === 'Delete' || e.key === 'Del') {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;
      e.preventDefault();
      e.stopPropagation();
      const tds = appRef.project?.textDraws || [];
      if (selectedIdx >= 0 && tds[selectedIdx]) {
        deleteSelectedTextDraw();
      }
    }
  });

  const chkGameBg = dialogEl.querySelector('#tdChkGameBg');
  if (chkGameBg) {
    chkGameBg.onchange = (e) => {
      showGameBg = e.target.checked;
      redrawCanvas();
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
      if (td.font === 4 || td.font === 5) {
        if (!td.textSizeX || td.textSizeX > 400) td.textSizeX = 80;
        if (!td.textSizeY || td.textSizeY > 400) td.textSizeY = 80;
      }
      updateSidebarFields();
      updateSidebarList();
      redrawCanvas();
    };
  }

  const btnOpenSprite = dialogEl.querySelector('#btnOpenSpritePicker');
  if (btnOpenSprite) {
    btnOpenSprite.onclick = () => {
      const td = getSelectedTd();
      openSpritePicker({
        currentSprite: td?.text || 'hud:radardisc',
        onSelect: (val) => {
          if (td) {
            td.text = val;
            const txt = dialogEl.querySelector('#tdText');
            if (txt) txt.value = val;
            updateSidebarList();
            redrawCanvas();
          }
        }
      });
    };
  }

  const selAlign = dialogEl.querySelector('#tdAlign');
  if (selAlign) {
    selAlign.onchange = () => {
      const td = getSelectedTd();
      if (!td) return;
      td.align = +selAlign.value;
      td.alignment = td.align;
      redrawCanvas();
    };
  }

  const chkBox = dialogEl.querySelector('#tdUseBox');
  if (chkBox) {
    chkBox.onchange = () => {
      const td = getSelectedTd();
      if (!td) return;
      tdPushUndo();
      td.useBox = chkBox.checked ? 1 : 0;
      if (td.useBox && td.font !== 4 && td.font !== 5) {
        if (!td.textSizeX || td.textSizeX >= 550 || !td.textSizeY || td.textSizeY >= 350 || td.textSizeX <= 0) {
          const autoBounds = getTextDrawBounds({ ...td, useBox: 0 });
          const align = getTdAlign(td);
          const autoW = Math.max(30, Math.round(autoBounds.w + 16));
          const autoH = Math.max(16, Math.round(autoBounds.h + 8));
          if (align === 1) {
            td.textSizeX = Math.round(td.x + autoW);
          } else if (align === 2) {
            td.textSizeX = autoW;
          } else if (align === 3) {
            td.textSizeX = Math.round(td.x - autoW);
          }
          td.textSizeY = autoH;
        }
      }
      appRef.project.modified = true;
      updateSidebarFields();
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
  const entry = { img: new Image(), cleanCanvas: null, loaded: false, failed: false };
  entry.img.crossOrigin = 'anonymous';
  entry.img.onload = () => {
    try {
      const w = entry.img.naturalWidth || entry.img.width;
      const h = entry.img.naturalHeight || entry.img.height;
      if (w > 0 && h > 0) {
        const off = document.createElement('canvas');
        off.width = w;
        off.height = h;
        const octx = off.getContext('2d');
        octx.drawImage(entry.img, 0, 0);
        const imgData = octx.getImageData(0, 0, w, h);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          if (Math.abs(d[i] - 43) <= 10 && Math.abs(d[i + 1] - 51) <= 10 && Math.abs(d[i + 2] - 59) <= 10) {
            d[i + 3] = 0;
          }
        }
        octx.putImageData(imgData, 0, 0);
        entry.cleanCanvas = off;
      }
    } catch (_) {}
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
  entry.img.src = `/thumbs/obj/${id}.webp?v=3`;
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

    dragStartTdSnapshot = JSON.stringify({
      textDraws: appRef?.project?.textDraws || [],
      selectedIdx
    });

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

      if (td.font === 4 || td.font === 5) {
        // Sprite (Font 4) e Prévia de modelo 3D (Font 5): textSizeX e textSizeY são largura e altura
        td.textSizeX = newW;
        td.textSizeY = newH;
      } else if (td.useBox) {
        const align = getTdAlign(td);
        if (align === 1) {
          td.textSizeX = Math.round(td.x + newW);
        } else if (align === 2) {
          td.textSizeX = Math.round(newW);
        } else if (align === 3) {
          td.textSizeX = Math.round(td.x - newW);
        }
        td.textSizeY = newH;
      } else {
        // Texto normal: escala letterSizeX e letterSizeY proporcionalmente ao arrasto da caixa
        const ratioX = newW / Math.max(10, isDraggingTd.origW);
        const ratioY = newH / Math.max(10, isDraggingTd.origH);
        td.letterSizeX = Number(Math.max(0.08, (isDraggingTd.origLetterX || 0.35) * ratioX).toFixed(2));
        td.letterSizeY = Number(Math.max(0.2, (isDraggingTd.origLetterY || 1.4) * ratioY).toFixed(2));
      }
    } else {
      const dx = sx - isDraggingTd.startX;
      const dy = sy - isDraggingTd.startY;
      const newX = Math.round(Math.max(0, Math.min(640, isDraggingTd.origX + dx)));
      const newY = Math.round(Math.max(0, Math.min(480, isDraggingTd.origY + dy)));

      if (td.useBox && td.font !== 4 && td.font !== 5) {
        const align = getTdAlign(td);
        if (align === 1 && isDraggingTd.origSizeX > isDraggingTd.origX) {
          const boxW = isDraggingTd.origSizeX - isDraggingTd.origX;
          td.x = newX;
          td.textSizeX = newX + boxW;
          td.y = newY;
        } else if (align === 3 && isDraggingTd.origSizeX < isDraggingTd.origX) {
          const boxW = isDraggingTd.origX - isDraggingTd.origSizeX;
          td.x = newX;
          td.textSizeX = newX - boxW;
          td.y = newY;
        } else {
          td.x = newX;
          td.y = newY;
        }
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
      const current = JSON.stringify({
        textDraws: appRef?.project?.textDraws || [],
        selectedIdx
      });
      if (dragStartTdSnapshot && dragStartTdSnapshot !== current) {
        tdPushUndoSnapshot(dragStartTdSnapshot);
        appRef.project.modified = true;
      }
      redrawCanvas();
    }
  });
}

function getTdAlign(td) {
  return td.align !== undefined ? td.align : (td.alignment !== undefined ? td.alignment : 1);
}

function getTextDrawBounds(td) {
  const letterY = td.letterSizeY || 1.4;
  const letterX = td.letterSizeX || 0.35;
  const fontH = letterY * 20;
  const isBoxPure = td.isBox || td.text === '_' || !td.text || td.text.trim() === '';
  const lines = String(td.text || '').split(/(?:\r?\n|~n~)/);
  const lineCount = Math.max(1, lines.length);

  if (td.font === 4 || td.font === 5) {
    const w = td.textSizeX > 0 ? td.textSizeX : 80;
    const h = td.textSizeY > 0 ? td.textSizeY : 80;
    return { x: td.x, y: td.y, w, h };
  }

  const align = getTdAlign(td);
  let w = 100;
  let h = 100;

  if (td.useBox) {
    if (align === 1) {
      w = td.textSizeX > td.x ? (td.textSizeX - td.x) : Math.max(20, td.textSizeX || 100);
    } else if (align === 2) {
      w = Math.max(20, td.textSizeX || 100);
    } else if (align === 3) {
      if (td.textSizeX < td.x && td.textSizeX > 0) {
        w = td.x - td.textSizeX;
      } else {
        w = Math.max(20, td.textSizeX || 100);
      }
    }

    if (isBoxPure) {
      h = (td.textSizeY > 0) ? td.textSizeY : Math.max(18, Math.round(letterY * 22));
    } else {
      h = (td.textSizeY > 0) ? td.textSizeY : Math.max(18, Math.round(lineCount * fontH));
    }
  } else {
    const fontFam = getFontFamily(td.font);
    const fontSize = Math.max(8, Math.round(letterY * 18));
    const scaleX = Math.max(0.25, (letterX * 4.0) / letterY);
    let maxLineW = 20;
    if (ctx) {
      ctx.save();
      ctx.font = `bold ${fontSize}px ${fontFam}`;
      for (const l of lines) {
        const clean = stripColorTags(l);
        const mw = ctx.measureText(clean).width * scaleX;
        if (mw > maxLineW) maxLineW = mw;
      }
      ctx.restore();
    } else {
      const maxChars = Math.max(...lines.map(l => stripColorTags(l).length), 1);
      maxLineW = maxChars * fontSize * 0.6 * scaleX;
    }
    w = Math.max(20, Math.round(maxLineW));
    h = Math.max(14, Math.round(lineCount * fontH));
  }

  let x = td.x;
  if (align === 2) x -= w / 2; // Centro
  else if (align === 3) x -= w; // Direita

  return { x, y: td.y, w, h };
}

function getSelectedTd() {
  const tds = appRef.project?.textDraws || [];
  return tds[selectedIdx] || null;
}

export function openTextDrawEditor() {
  if (!dialogEl) return;
  loadGameBg();
  if (!dialogEl.open) dialogEl.showModal();
  dialogEl.classList.add('open');

  tdUndoStack = [];
  tdRedoStack = [];
  updateTdUndoButtons();

  if (!appRef.project.textDraws) appRef.project.textDraws = [];

  if (appRef.project.textDraws.length === 0) {
    selectedIdx = -1;
  } else if (selectedIdx < 0 || selectedIdx >= appRef.project.textDraws.length) {
    selectedIdx = 0;
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

  // Fundo do jogo / GTA SA
  if (showGameBg && gameBgImg && gameBgImg.complete && gameBgImg.naturalWidth > 0) {
    ctx.drawImage(gameBgImg, 0, 0, 640, 480);
  } else {
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, 640, 480);
  }

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
  ctx.save();
  ctx.lineWidth = 1;

  for (let x = 0; x <= 640; x += 40) {
    ctx.beginPath();
    ctx.strokeStyle = (x % 80 === 0) ? 'rgba(0, 229, 255, 0.35)' : 'rgba(0, 229, 255, 0.18)';
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 480);
    ctx.stroke();
  }
  for (let y = 0; y <= 480; y += 40) {
    ctx.beginPath();
    ctx.strokeStyle = (y % 80 === 0) ? 'rgba(0, 229, 255, 0.35)' : 'rgba(0, 229, 255, 0.18)';
    ctx.moveTo(0, y);
    ctx.lineTo(640, y);
    ctx.stroke();
  }

  // Margem segura da tela do jogo (Safe Zone)
  // Contorno duplo: sombra preta de 3px para garantir contraste em fundos claros/céu
  // + linha tracejada magenta neon (#FF1493) de alto destaque
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.strokeRect(20, 20, 600, 440);

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#FF1493';
  ctx.setLineDash([6, 4]);
  ctx.strokeRect(20, 20, 600, 440);
  ctx.setLineDash([]);

  // Indicador de canto "SAFE ZONE (600x440)" posicionado acima da borda safe (y < 20)
  ctx.font = 'bold 9px "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
  ctx.lineWidth = 2.5;
  ctx.strokeText('SAFE ZONE (600 × 440)', 20, 18);
  ctx.fillStyle = '#FF1493';
  ctx.fillText('SAFE ZONE (600 × 440)', 20, 18);

  ctx.restore();
}

function renderTextDraw(td, isSelected) {
  const bounds = getTextDrawBounds(td);

  // 1. Renderiza Caixa (Box) se ativada
  if (td.useBox) {
    const boxCol = toHexRgba(td.boxColor ?? 0x00000080);
    ctx.fillStyle = boxCol.css;
    ctx.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
  }

  // 2. Se for modelo de Caixa (ou texto vazio / '_'), não desenha texto
  const isBoxPure = td.isBox || td.text === '_' || !td.text || td.text.trim() === '';
  if (td.font === 5) {
    renderModelPreview(td, bounds, isSelected);
  } else if (td.font === 4) {
    renderSpriteTextDraw(td, bounds);
  } else if (!isBoxPure) {
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
  const letterY = td.letterSizeY || 1.4;
  const letterX = td.letterSizeX || 0.35;
  const fontFam = getFontFamily(td.font);
  const fontSize = Math.max(8, Math.round(letterY * 18));
  const scaleX = Math.max(0.25, (letterX * 4.0) / letterY);
  const align = getTdAlign(td);

  ctx.save();
  ctx.font = `bold ${fontSize}px ${fontFam}`;
  ctx.textBaseline = 'top';

  const lines = String(td.text || '').split(/(?:\r?\n|~n~)/);
  const lineH = letterY * 20;

  lines.forEach((line, lineIdx) => {
    const curY = td.y + lineIdx * lineH;
    const startX = td.x;

    ctx.save();
    ctx.translate(startX, curY);
    ctx.scale(scaleX, 1);

    if (align === 2) ctx.textAlign = 'center';
    else if (align === 3) ctx.textAlign = 'right';
    else ctx.textAlign = 'left';

    // Sombra ou Contorno
    const bgCol = toHexRgba(td.backgroundColor ?? 0x000000FF);
    if (td.outline > 0) {
      ctx.strokeStyle = bgCol.css;
      ctx.lineWidth = td.outline * 2;
      ctx.strokeText(stripColorTags(line), 0, 0);
    } else if (td.shadow > 0) {
      ctx.fillStyle = bgCol.css;
      ctx.fillText(stripColorTags(line), td.shadow, td.shadow);
    }

    // Texto com suporte a tags {RRGGBB} e ~w~, ~y~, etc.
    drawFormattedLine(line, 0, 0, toHexRgba(td.color ?? 0xE1E1E1FF).css, align);
    ctx.restore();
  });
  ctx.restore();
}

function drawFormattedLine(line, x, y, defaultColor, align = 1) {
  const parts = parseColorTags(line, defaultColor);
  if (parts.length <= 1) {
    ctx.fillStyle = parts[0]?.color || defaultColor;
    ctx.fillText(parts[0]?.text || '', x, y);
    return;
  }

  ctx.textAlign = 'left';
  const totalW = parts.reduce((acc, p) => acc + ctx.measureText(p.text).width, 0);
  let curX = x;
  if (align === 2) curX -= totalW / 2;
  else if (align === 3) curX -= totalW;

  for (const part of parts) {
    ctx.fillStyle = part.color;
    ctx.fillText(part.text, curX, y);
    curX += ctx.measureText(part.text).width;
  }
}

const GTA_SA_COLORS = {
  'r': '#E83C3C',
  'g': '#33AA33',
  'b': '#3366FF',
  'w': '#FFFFFF',
  'y': '#FFDD00',
  'p': '#9B59B6',
  'l': '#000000',
};

const GTA_SA_SYMBOLS = {
  '<': '◀',
  '>': '▶',
  'u': '▲',
  'd': '▼',
};

function parseColorTags(str, defColor) {
  const regex = /\{([A-Fa-f0-9]{6})\}|~([a-zA-Z<>ud])~/g;
  const parts = [];
  let lastIdx = 0;
  let curColor = defColor;
  let m;

  while ((m = regex.exec(str)) !== null) {
    if (m.index > lastIdx) {
      parts.push({ text: str.slice(lastIdx, m.index), color: curColor });
    }
    if (m[1]) {
      curColor = `#${m[1]}`;
    } else if (m[2]) {
      const code = m[2].toLowerCase();
      if (GTA_SA_COLORS[code]) {
        curColor = GTA_SA_COLORS[code];
      } else if (code === 's') {
        curColor = defColor;
      } else if (code === 'h') {
        curColor = lightenColor(curColor, 0.3);
      } else if (GTA_SA_SYMBOLS[m[2]]) {
        parts.push({ text: GTA_SA_SYMBOLS[m[2]], color: curColor });
      }
    }
    lastIdx = regex.lastIndex;
  }
  if (lastIdx < str.length) {
    parts.push({ text: str.slice(lastIdx), color: curColor });
  }
  return parts;
}

function stripColorTags(str) {
  let s = String(str || '').replace(/\{[A-Fa-f0-9]{6}\}/g, '');
  s = s.replace(/~([<>ud])~/g, (_, sym) => GTA_SA_SYMBOLS[sym] || sym);
  s = s.replace(/~[a-zA-Z]~/g, '');
  return s;
}

function lightenColor(color, factor = 0.3) {
  if (!color || typeof color !== 'string' || !color.startsWith('#') || color.length < 7) return '#FFFFFF';
  let r = parseInt(color.slice(1, 3), 16) || 0;
  let g = parseInt(color.slice(3, 5), 16) || 0;
  let b = parseInt(color.slice(5, 7), 16) || 0;
  r = Math.min(255, Math.round(r + (255 - r) * factor));
  g = Math.min(255, Math.round(g + (255 - g) * factor));
  b = Math.min(255, Math.round(b + (255 - b) * factor));
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
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

function renderSpriteTextDraw(td, bounds) {
  const sprite = (td.text || 'hud:radardisc').trim();
  const col = toHexRgba(td.color ?? 0xFFFFFFFF);
  const [lib, name] = sprite.includes(':') ? sprite.split(':') : ['hud', sprite];

  ctx.save();
  const img = getSpriteImage(lib, name);

  if (img && img.complete && img.naturalWidth > 0) {
    if (col.a > 0) {
      ctx.globalAlpha = col.a;
      const isPureWhite = col.r === 255 && col.g === 255 && col.b === 255;
      if (!isPureWhite) {
        try {
          const off = document.createElement('canvas');
          off.width = img.naturalWidth;
          off.height = img.naturalHeight;
          const offCtx = off.getContext('2d');
          offCtx.drawImage(img, 0, 0);
          offCtx.globalCompositeOperation = 'source-in';
          offCtx.fillStyle = `rgb(${col.r}, ${col.g}, ${col.b})`;
          offCtx.fillRect(0, 0, off.width, off.height);
          ctx.drawImage(off, bounds.x, bounds.y, bounds.w, bounds.h);
        } catch (_) {
          ctx.drawImage(img, bounds.x, bounds.y, bounds.w, bounds.h);
        }
      } else {
        ctx.drawImage(img, bounds.x, bounds.y, bounds.w, bounds.h);
      }
    }
  } else {
    // Vetor de fallback / placeholder enquanto a imagem carrega
    const spLower = sprite.toLowerCase();
    ctx.fillStyle = col.css;
    ctx.strokeStyle = col.css;
    if (spLower === 'ld_beat:chit') {
      const r = Math.min(bounds.w, bounds.h) * 0.28;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bounds.x, bounds.y, bounds.w, bounds.h, r);
      else ctx.rect(bounds.x, bounds.y, bounds.w, bounds.h);
      ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h);
      ctx.font = 'bold 10px "Segoe UI", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const shortName = (name || sprite).slice(0, 14);
      ctx.fillText(shortName, bounds.x + bounds.w / 2, bounds.y + bounds.h / 2);
    }
  }
  ctx.restore();
}

function renderModelPreview(td, bounds, isSelected = false) {
  // Se não estiver selecionado e não tiver caixa ativa, desenha apenas contorno discreto
  if (!isSelected && !td.useBox) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1;
    ctx.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h);
  }

  const modelId = td.previewModel || 411;
  const thumb = getOrLoadModelThumbnail(modelId);
  const zoom = Math.max(0.2, Math.min(5.0, Number(td.previewZoom) || 1.0));
  const invZoom = 1.0 / zoom; // No GTA SA, zoom menor aproxima o modelo e zoom maior afasta

  if (thumb && thumb.loaded && thumb.img.width > 0) {
    ctx.save();
    // Clipa dentro da caixa do TextDraw
    ctx.beginPath();
    ctx.rect(bounds.x, bounds.y, bounds.w, bounds.h);
    ctx.clip();

    const cx = bounds.x + bounds.w / 2;
    const cy = bounds.y + bounds.h / 2;
    ctx.translate(cx, cy);

    // Calcula dimensão da imagem mantendo proporção
    const imgAspect = thumb.img.width / thumb.img.height;
    let drawW = bounds.w * 0.92 * invZoom;
    let drawH = drawW / imgAspect;
    if (drawH > bounds.h * 0.92 * invZoom) {
      drawH = bounds.h * 0.92 * invZoom;
      drawW = drawH * imgAspect;
    }

    ctx.drawImage(thumb.cleanCanvas || thumb.img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  } else {
    // Se ainda está carregando ou não tem miniatura, exibe texto indicativo
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = '#65B5FF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`MODELO 3D: #${modelId}`, bounds.x + bounds.w / 2, bounds.y + bounds.h / 2);
  }

  // Tag do Modelo no canto superior apenas quando selecionado
  if (isSelected) {
    ctx.font = '9px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`#${modelId}`, bounds.x + 4, bounds.y + 4);
  }
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
  setVal('#tdAlign', getTdAlign(td));
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

  // Painel de Sprite (Font 4)
  const spritePanel = dialogEl.querySelector('#tdSpritePanel');
  if (spritePanel) {
    spritePanel.style.display = td.font === 4 ? 'block' : 'none';
  }

  // Controles específicos de Font 5 (Model Preview)
  const modelPanel = dialogEl.querySelector('#tdModelPreviewPanel');
  if (modelPanel) {
    modelPanel.style.display = td.font === 5 ? 'block' : 'none';
    setVal('#tdPreviewModel', td.previewModel || 411);
    setVal('#tdPreviewRotX', td.previewRotX !== undefined ? td.previewRotX : -16.0);
    setVal('#tdPreviewRotY', td.previewRotY !== undefined ? td.previewRotY : 0.0);
    setVal('#tdPreviewRotZ', td.previewRotZ !== undefined ? td.previewRotZ : -55.0);
    setVal('#tdPreviewZoom', td.previewZoom || 1);
  }
}

function createNewTextDraw(defaultText = 'NOVO TEXTO') {
  tdPushUndo();
  if (!appRef.project.textDraws) appRef.project.textDraws = [];
  const td = makeTextDraw({
    text: defaultText,
    x: 320,
    y: 200,
    font: 1,
    letterSizeX: 0.35,
    letterSizeY: 1.4,
    textSizeX: 0,
    textSizeY: 0,
    color: 0xFFFFFFFF,
    align: 2,
    alignment: 2,
    shadow: 1,
    outline: 0,
    proportional: 1,
  });
  appRef.project.textDraws.push(td);
  appRef.project.modified = true;
  selectedIdx = appRef.project.textDraws.length - 1;
  updateSidebarFields();
  updateSidebarList();
  redrawCanvas();
}

function createNewBox() {
  tdPushUndo();
  if (!appRef.project.textDraws) appRef.project.textDraws = [];
  const td = makeTextDraw({
    text: '_',
    x: 200,
    y: 150,
    useBox: 1,
    textSizeX: 440,
    textSizeY: 100,
    boxColor: 0x00000080,
  });
  appRef.project.textDraws.push(td);
  appRef.project.modified = true;
  selectedIdx = appRef.project.textDraws.length - 1;
  updateSidebarFields();
  updateSidebarList();
  redrawCanvas();
}

function createNewModelPreview() {
  tdPushUndo();
  if (!appRef.project.textDraws) appRef.project.textDraws = [];
  const td = makeTextDraw({
    text: 'Preview',
    x: 270,
    y: 190,
    font: 5,
    previewModel: 411, // Infernus
    previewZoom: 1.0,
    previewRotX: -16.0,
    previewRotY: 0.0,
    previewRotZ: -55.0,
    previewColor1: 1,
    previewColor2: 1,
    textSizeX: 110,
    textSizeY: 100,
    useBox: 0,
    boxColor: 0x00000060,
    backgroundColor: 0x00000000,
  });
  appRef.project.textDraws.push(td);
  appRef.project.modified = true;
  selectedIdx = appRef.project.textDraws.length - 1;
  updateSidebarFields();
  updateSidebarList();
  redrawCanvas();
}

function createNewSprite() {
  tdPushUndo();
  if (!appRef.project.textDraws) appRef.project.textDraws = [];
  const td = makeTextDraw({
    text: 'hud:radardisc',
    x: 290,
    y: 210,
    font: 4,
    textSizeX: 64,
    textSizeY: 64,
    color: 0xFFFFFFFF,
    useBox: 0,
  });
  appRef.project.textDraws.push(td);
  appRef.project.modified = true;
  selectedIdx = appRef.project.textDraws.length - 1;
  updateSidebarFields();
  updateSidebarList();
  redrawCanvas();
}

function deleteSelectedTextDraw() {
  const tds = appRef.project?.textDraws || [];
  if (!tds[selectedIdx]) return;
  tdPushUndo();
  tds.splice(selectedIdx, 1);
  appRef.project.modified = true;
  selectedIdx = Math.max(0, selectedIdx - 1);
  updateSidebarFields();
  updateSidebarList();
  redrawCanvas();
}

function duplicateSelectedTextDraw() {
  const td = getSelectedTd();
  if (!td) return;
  tdPushUndo();
  const copy = makeTextDraw({ ...td, uid: null, x: td.x + 10, y: td.y + 10 });
  appRef.project.textDraws.push(copy);
  appRef.project.modified = true;
  selectedIdx = appRef.project.textDraws.length - 1;
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
    const align = getTdAlign(td);
    const cHex = '0x' + (Number(td.color) >>> 0).toString(16).toUpperCase().padStart(8, '0');
    const bHex = '0x' + (Number(td.boxColor) >>> 0).toString(16).toUpperCase().padStart(8, '0');
    const rawBg = td.font === 5 ? (td.useBox ? td.boxColor : 0x00000000) : td.backgroundColor;
    const bgHex = '0x' + (Number(rawBg) >>> 0).toString(16).toUpperCase().padStart(8, '0');
    const bounds = getTextDrawBounds(td);
    const isBoxPure = (td.font <= 3) && (td.isBox || td.text === '_' || !td.text || td.text.trim() === '');
    let expSizeX = td.textSizeX ?? 640.0;
    let expSizeY = td.textSizeY ?? 480.0;

    if (td.font === 4 || td.font === 5) {
      expSizeX = td.textSizeX > 0 ? td.textSizeX : (td.font === 4 ? 64.0 : 80.0);
      expSizeY = td.textSizeY > 0 ? td.textSizeY : (td.font === 4 ? 64.0 : 80.0);
    } else if (td.useBox) {
      if (align === 1) {
        expSizeX = bounds.x + bounds.w;
        expSizeY = bounds.y + bounds.h;
      } else if (align === 2) {
        expSizeX = bounds.h;
        expSizeY = bounds.w;
      } else if (align === 3) {
        expSizeX = td.x - bounds.w;
        expSizeY = bounds.y + bounds.h;
      }
    } else {
      expSizeX = (align === 3 ? 0.0 : 640.0);
      expSizeY = (align === 2 ? 640.0 : 480.0);
    }

    if (td.font === 4) {
      let rawText = td.text || 'hud:radardisc';
      if (rawText.toLowerCase().startsWith('loadscs:')) {
        const tex = rawText.slice(8).toLowerCase();
        rawText = 'LOADSUK:' + (tex === 'loadsc0' ? 'loadscuk' : tex);
      } else if (rawText.toLowerCase().startsWith('loadsuk:')) {
        const tex = rawText.slice(8).toLowerCase();
        rawText = 'LOADSUK:' + (tex === 'loadsc0' ? 'loadscuk' : tex);
      } else if (rawText.toLowerCase().startsWith('ld_')) {
        const colon = rawText.indexOf(':');
        if (colon !== -1) rawText = rawText.slice(0, colon).toUpperCase() + ':' + rawText.slice(colon + 1).toLowerCase();
      }
      lines.push(`new ${prefix}${varName} = ${td.isPlayer ? 'CreatePlayerTextDraw(playerid, ' : 'TextDrawCreate('}${td.x}.0, ${td.y}.0, "${rawText}");`);
      lines.push(`TextDrawFont(${varName}, 4);`);
      lines.push(`TextDrawLetterSize(${varName}, ${(td.letterSizeX || 0.5).toFixed(2)}, ${(td.letterSizeY || 1.0).toFixed(2)});`);
    } else {
      const pwnText = (td.text && td.text.trim() !== '') ? td.text : '_';
      lines.push(`new ${prefix}${varName} = ${td.isPlayer ? 'CreatePlayerTextDraw(playerid, ' : 'TextDrawCreate('}${td.x}.0, ${td.y}.0, "${pwnText}");`);
      lines.push(`TextDrawFont(${varName}, ${td.font ?? 1});`);
      if (isBoxPure && td.useBox) {
        lines.push(`TextDrawLetterSize(${varName}, 0.00, ${(bounds.h / 22.0).toFixed(2)});`);
      } else {
        lines.push(`TextDrawLetterSize(${varName}, ${(td.letterSizeX ?? 0.35).toFixed(2)}, ${(td.letterSizeY ?? 1.4).toFixed(2)});`);
      }
    }
    lines.push(`TextDrawAlignment(${varName}, ${align});`);
    lines.push(`TextDrawTextSize(${varName}, ${Number(expSizeX).toFixed(1)}, ${Number(expSizeY).toFixed(1)});`);
    lines.push(`TextDrawColor(${varName}, ${cHex});`);
    lines.push(`TextDrawSetOutline(${varName}, ${(td.font === 4 || td.font === 5) ? 0 : (td.outline ?? 0)});`);
    lines.push(`TextDrawSetShadow(${varName}, ${(td.font === 4 || td.font === 5) ? 0 : (td.shadow ?? 1)});`);
    if (td.useBox && td.font !== 5 && td.font !== 4) {
      lines.push(`TextDrawUseBox(${varName}, 1);`);
      lines.push(`TextDrawBoxColor(${varName}, ${bHex});`);
    }
    lines.push(`TextDrawBackgroundColor(${varName}, ${bgHex});`);
    lines.push(`TextDrawSetProportional(${varName}, ${td.proportional ?? 1});`);
    if (td.selectable) lines.push(`TextDrawSetSelectable(${varName}, 1);`);
    if (td.font === 5 && td.previewModel) {
      lines.push(`TextDrawSetPreviewModel(${varName}, ${td.previewModel});`);
      lines.push(`TextDrawSetPreviewRot(${varName}, ${(td.previewRotX ?? -16).toFixed(1)}, ${(td.previewRotY ?? 0).toFixed(1)}, ${(td.previewRotZ ?? -55).toFixed(1)}, ${(td.previewZoom || 1).toFixed(1)});`);
      lines.push(`TextDrawSetPreviewVehCol(${varName}, ${td.previewColor1 ?? 1}, ${td.previewColor2 ?? 1});`);
    }
    lines.push('');
  });

  const fullText = lines.join('\n');
  navigator.clipboard.writeText(fullText).then(() => {
    appRef.toast(`${tds.length} TextDraw(s) copiados em formato Pawn!`, 'ok');
  });
}
