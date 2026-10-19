// Editor visual e interativo de TextDraws (TextDrawCreate / CreatePlayerTextDraw)
// Tela 640x448 do SA-MP mostrada em 16:9; textos desenhados com as fontes do próprio jogo (tdrender.js),
// arrasto interativo, fontes 0-5 (incluindo prévias de modelo Font 5), caixas, alinhamento, cores RGBA e exportação Pawn.
import { makeTextDraw, textDrawNative, progressBarPawn, progressBarVar, textDrawVar, PB_LIMITS, PB_MIN_WIDTH, PB_MIN_HEIGHT, fitPbBorder, maxPbBorder, clampPbBlinkInterval, clampPbBlinkDuration, clampPbStyle, clampPbSegments, clampPbAutoFillMax, pbAutoFillValue } from '../editor/project.js';
import { TD_SCREEN, TD_WIDTH, TD_HEIGHT, loadGtaFonts, drawTextDraw, textDrawRect, textDrawTextWidth, drawProgressBar } from '../editor/tdrender.js';
import { toast, arrowStep } from './common.js';
import { modelPreviewImage } from '../editor/modelPreview.js';

const RIGHT_BOX_HINT = 'No jogo, a caixa alinhada à direita vai da borda esquerda da tela até o texto';
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
    canvasEl.width = TD_SCREEN.w;
    canvasEl.height = TD_SCREEN.h;
    ctx = canvasEl.getContext('2d');
    setupCanvasEvents();
  }

  loadGameBg();
  setupDialogEvents();
}

// Coordenadas do mouse em unidades 640x448
// O canvas usa object-fit: contain, então a imagem pode ter faixas vazias em volta dentro do elemento
function canvasPoint(e) {
  const rect = canvasEl.getBoundingClientRect();
  const scale = Math.min(rect.width / canvasEl.width, rect.height / canvasEl.height);
  const w = canvasEl.width * scale, h = canvasEl.height * scale;
  const left = rect.left + (rect.width - w) / 2, top = rect.top + (rect.height - h) / 2;
  return {
    sx: (e.clientX - left) * TD_WIDTH / w,
    sy: (e.clientY - top) * TD_HEIGHT / h,
  };
}

// Desenho em unidades 640x448 (fundo, grade, sprites, modelos e seleção)
function useLogicalUnits() {
  ctx.setTransform(TD_SCREEN.w / TD_WIDTH, 0, 0, TD_SCREEN.h / TD_HEIGHT, 0, 0);
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

  const addProgressBtn = dialogEl.querySelector('#tdBtnAddProgress');
  if (addProgressBtn) addProgressBtn.onclick = () => createNewProgressBar();

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
    const arrow = !e.ctrlKey && !e.metaKey && arrowStep(e);
    if (arrow) {
      const td = getSelectedTd();
      if (!td || (!arrow.dx && !arrow.dy)) return;
      if (arrow.first) tdPushUndo();
      const round = (v) => Math.round(v * 10) / 10;
      td.x = round(td.x + arrow.dx);
      td.y = round(td.y + arrow.dy);
      // Caixa à esquerda: TextSize X é a borda direita absoluta e acompanha o texto
      if (td.useBox && td.font !== 4 && td.font !== 5 && getTdAlign(td) === 1) td.textSizeX = round(td.textSizeX + arrow.dx);
      appRef.project.modified = true;
      updateSidebarFields();
      updateSidebarList();
      redrawCanvas();
      return;
    }
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
  // Barra de progresso
  const pbName = dialogEl.querySelector('#tdPbName');
  if (pbName) {
    pbName.onfocus = () => tdPushUndo();
    pbName.oninput = () => {
      const td = getSelectedTd();
      if (!td || td.type !== 'progress') return;
      td.name = pbName.value;
      appRef.project.modified = true;
      updateSidebarList();
    };
  }
  for (const [id, prop, isInt] of [['#tdPbWidth', 'pbWidth'], ['#tdPbHeight', 'pbHeight'], ['#tdPbMax', 'pbMax'], ['#tdPbValue', 'pbValue'], ['#tdPbDir', 'pbDir', true]]) {
    const el = dialogEl.querySelector(id);
    if (!el) continue;
    el.onfocus = () => tdPushUndo();
    el.oninput = el.onchange = (ev) => {
      const td = getSelectedTd();
      if (!td || td.type !== 'progress') return;
      let v = Number(el.value);
      if (!Number.isFinite(v)) return;
      const min = prop === 'pbWidth' ? PB_MIN_WIDTH : prop === 'pbHeight' ? PB_MIN_HEIGHT : null;
      if (min !== null && v < min) {
        if (ev?.type !== 'change') return; // digitando: espera terminar antes de aplicar o mínimo
        v = min;
        el.value = v;
      }
      const oldMax = Number(td.pbMax) || 0;
      td[prop] = isInt ? (v | 0) : v;
      if (prop === 'pbWidth' || prop === 'pbHeight') syncPbBorderLimit(td);
      if (prop === 'pbMax') {
        const cur = Number(td.pbAutoFillMax ?? oldMax);
        td.pbAutoFillMax = (cur === oldMax || cur > td.pbMax) ? Math.max(0, Number(td.pbMax) || 0) : cur;
        syncAutoFillControls(td);
      }
      appRef.project.modified = true;
      redrawCanvas();
    };
  }

  // Borda e piscada da barra: valores fora dos limites voltam para o limite (a include também confere)
  const pbLimited = [
    ['#tdPbBorder', 'pbBorder', (v) => { const td = getSelectedTd(); return fitPbBorder(v, td?.pbWidth, td?.pbHeight); }],
    ['#tdPbBlinkInterval', 'pbBlinkInterval', clampPbBlinkInterval],
    ['#tdPbBlinkDuration', 'pbBlinkDuration', clampPbBlinkDuration],
  ];
  for (const [id, prop, clamp] of pbLimited) {
    const el = dialogEl.querySelector(id);
    if (!el) continue;
    el.onfocus = () => tdPushUndo();
    // Digitando: só usa o valor se ele já estiver dentro do limite, sem mexer no campo.
    // Ao sair do campo (ou Enter): aplica o limite e mostra o valor final.
    const apply = (fix) => {
      const td = getSelectedTd();
      if (!td || td.type !== 'progress') return;
      const typed = Number(String(el.value).replace(',', '.'));
      const v = clamp(el.value);
      if (!fix && (el.value === '' || !Number.isFinite(typed) || v !== typed)) return;
      td[prop] = v;
      if (fix) el.value = prop === 'pbBorder' ? decimalText(v) : v;
      appRef.project.modified = true;
      redrawCanvas();
    };
    el.oninput = () => apply(false);
    el.onchange = () => apply(true);
  }
  const blinkBox = dialogEl.querySelector('#tdPbBlink');
  const blinkOwn = dialogEl.querySelector('#tdPbBlinkOwn');
  const blinkColor = dialogEl.querySelector('#tdPbBlinkColor');
  const syncBlinkFields = (td) => {
    const box = dialogEl.querySelector('#tdPbBlinkFields');
    if (box) box.style.display = td?.pbBlink ? 'flex' : 'none';
    const row = dialogEl.querySelector('#tdPbBlinkColorRow');
    if (row) row.style.display = td?.pbBlinkColor ? 'flex' : 'none';
  };
  const blinkColorValue = () => ((parseInt((blinkColor?.value || '#ffffff').slice(1), 16) << 8) | 0xFF) >>> 0;
  if (blinkBox) blinkBox.onchange = () => {
    const td = getSelectedTd();
    if (!td || td.type !== 'progress') return;
    tdPushUndo();
    td.pbBlink = blinkBox.checked;
    if (td.pbBlinkInterval === undefined) td.pbBlinkInterval = PB_LIMITS.blinkDefault;
    syncBlinkFields(td);
    appRef.project.modified = true;
    restartBlinkPreview();
  };
  if (blinkOwn) blinkOwn.onchange = () => {
    const td = getSelectedTd();
    if (!td || td.type !== 'progress') return;
    tdPushUndo();
    td.pbBlinkColor = blinkOwn.checked ? 0 : blinkColorValue();
    syncBlinkFields(td);
    appRef.project.modified = true;
    redrawCanvas();
  };
  if (blinkColor) {
    blinkColor.onfocus = () => tdPushUndo();
    blinkColor.oninput = () => {
      const td = getSelectedTd();
      if (!td || td.type !== 'progress' || blinkOwn?.checked) return;
      td.pbBlinkColor = blinkColorValue();
      appRef.project.modified = true;
      redrawCanvas();
    };
  }
  // Cor da borda (0 = preto com o alfa da barra) e cor da borda durante a piscada (0 = não pisca)
  const colorPair = (checkId, rowId, inputId, prop, checkMeansDefault) => {
    const check = dialogEl.querySelector(checkId), input = dialogEl.querySelector(inputId);
    const value = () => ((parseInt((input?.value || '#000000').slice(1), 16) << 8) | 0xFF) >>> 0;
    if (check) check.onchange = () => {
      const td = getSelectedTd();
      if (!td || td.type !== 'progress') return;
      tdPushUndo();
      const useDefault = checkMeansDefault ? check.checked : !check.checked;
      td[prop] = useDefault ? 0 : value();
      syncPbColorRows(td);
      appRef.project.modified = true;
      redrawCanvas();
    };
    if (input) {
      input.onfocus = () => tdPushUndo();
      input.oninput = () => {
        const td = getSelectedTd();
        if (!td || td.type !== 'progress' || !td[prop]) return;
        td[prop] = value();
        appRef.project.modified = true;
        redrawCanvas();
      };
    }
  };
  colorPair('#tdPbBorderDefault', '#tdPbBorderColorRow', '#tdPbBorderColor', 'pbBorderColor', true);
  colorPair('#tdPbBlinkBorder', '#tdPbBlinkBorderColorRow', '#tdPbBlinkBorderColor', 'pbBlinkBorderColor', false);
  syncPbBlinkFields = syncBlinkFields;

  const autoBtn = dialogEl.querySelector('#tdPbAutoFill');
  if (autoBtn) autoBtn.onclick = () => {
    const td = getSelectedTd();
    if (!td || td.type !== 'progress') return;
    tdPushUndo();
    td.pbAutoFill = !td.pbAutoFill; // desligar volta a mostrar o valor atual
    td.pbAutoFillMax = clampPbAutoFillMax(td.pbAutoFillMax ?? td.pbMax, td.pbMax);
    autoFillStart.set(td, performance.now());
    appRef.project.modified = true;
    syncAutoFillControls(td);
    restartBlinkPreview();
  };
  const autoMax = dialogEl.querySelector('#tdPbAutoFillMax');
  if (autoMax) {
    autoMax.onfocus = () => tdPushUndo();
    const applyAutoMax = (fix) => {
      const td = getSelectedTd();
      if (!td || td.type !== 'progress') return;
      const typed = Number(String(autoMax.value).replace(',', '.'));
      const v = clampPbAutoFillMax(autoMax.value, td.pbMax);
      if (!fix && (autoMax.value === '' || !Number.isFinite(typed) || v !== typed)) return; // digitando: só valores válidos
      td.pbAutoFillMax = v;
      if (fix) autoMax.value = v;
      appRef.project.modified = true;
      redrawCanvas();
    };
    autoMax.oninput = () => applyAutoMax(false);
    autoMax.onchange = () => applyAutoMax(true);
  }

  // Modelo da barra: ao trocar de barra para um formato redondo, a caixa vira 40 x 50 (redonda na tela)
  const styleSel = dialogEl.querySelector('#tdPbStyle');
  if (styleSel) styleSel.onchange = () => {
    const td = getSelectedTd();
    if (!td || td.type !== 'progress') return;
    tdPushUndo();
    const before = td.pbStyle | 0;
    td.pbStyle = clampPbStyle(styleSel.value);
    if (before === 0 && td.pbStyle !== 0 && td.pbHeight < td.pbWidth * 0.6) { td.pbWidth = 40; td.pbHeight = 50; }
    if (td.pbStyle === 0 && before !== 0 && td.pbHeight > td.pbWidth * 0.6) { td.pbWidth = 120; td.pbHeight = 12; }
    if (!td.pbSegments) td.pbSegments = 24;
    appRef.project.modified = true;
    updateSidebarFields();
    updateSidebarList();
    redrawCanvas();
  };
  const segInp = dialogEl.querySelector('#tdPbSegments');
  if (segInp) {
    segInp.onfocus = () => tdPushUndo();
    const applySeg = (fix) => {
      const td = getSelectedTd();
      if (!td || td.type !== 'progress') return;
      const v = clampPbSegments(segInp.value);
      if (!fix && (segInp.value === '' || Number(segInp.value) !== v)) return; // digitando: só valores já válidos
      td.pbSegments = v;
      if (fix) segInp.value = v;
      syncPbStyleRows(td);
      appRef.project.modified = true;
      redrawCanvas();
    };
    segInp.oninput = () => applySeg(false);
    segInp.onchange = () => applySeg(true);
  }

  // Contorno e sombra: só ligado (1) ou desligado (0)
  for (const [id, prop] of [['#tdOutline', 'outline'], ['#tdShadow', 'shadow']]) {
    const el = dialogEl.querySelector(id);
    if (!el) continue;
    el.onchange = () => {
      const td = getSelectedTd();
      if (!td) return;
      tdPushUndo();
      td[prop] = el.checked ? 1 : 0;
      appRef.project.modified = true;
      redrawCanvas();
    };
  }
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
      tdPushUndo();
      const prevAlign = getTdAlign(td);
      const newAlign = +selAlign.value;
      if (prevAlign !== newAlign && td.useBox && td.font !== 4 && td.font !== 5) {
        // A caixa à direita não usa TextSize no jogo; nos outros alinhamentos ela volta a envolver o texto
        const textW = Math.ceil(textDrawTextWidth(td));
        if (newAlign === 2) td.textSizeY = textW;
        else if (newAlign === 1) td.textSizeX = Math.round(td.x + textW);
        else toast(RIGHT_BOX_HINT, 'warn', 6000);
      }
      td.align = newAlign;
      td.alignment = newAlign;
      appRef.project.modified = true;
      updateSidebarFields();
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
        const align = getTdAlign(td);
        const textW = Math.ceil(textDrawTextWidth(td));
        if (align === 2) td.textSizeY = textW;
        else if (align === 3) toast(RIGHT_BOX_HINT, 'warn', 6000);
        else td.textSizeX = Math.round(td.x + textW);
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

  // Ordem de criação (camadas): botões abaixo da lista
  for (const [id, where] of [['#tdOrderBack', 'back'], ['#tdOrderDown', -1], ['#tdOrderUp', 1], ['#tdOrderFront', 'front']]) {
    const b = dialogEl.querySelector(id);
    if (b) b.onclick = () => moveSelectedTd(where);
  }

  const chkPlayer = dialogEl.querySelector('#tdIsPlayer');
  if (chkPlayer) {
    chkPlayer.onchange = () => {
      const td = getSelectedTd();
      if (!td) return;
      td.isPlayer = chkPlayer.checked;
      normalizeTdOrder();
      updateSidebarList();
      redrawCanvas();
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
    const { sx, sy } = canvasPoint(e);

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
          origPbW: curTd.pbWidth,
          origPbH: curTd.pbHeight,
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
    const { sx, sy } = canvasPoint(e);

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

      if (td.type === 'progress') {
        // Barra: o arrasto muda largura e altura na mesma proporção do retângulo
        const rx = newW / Math.max(4, isDraggingTd.origW), ry = newH / Math.max(4, isDraggingTd.origH);
        td.pbWidth = Number(Math.max(PB_MIN_WIDTH, (isDraggingTd.origPbW || td.pbWidth) * rx).toFixed(1));
        td.pbHeight = Number(Math.max(PB_MIN_HEIGHT, (isDraggingTd.origPbH || td.pbHeight) * ry).toFixed(2));
        syncPbBorderLimit(td);
      } else if (td.font === 4 || td.font === 5) {
        // Sprite (Font 4) e Prévia de modelo 3D (Font 5): textSizeX e textSizeY são largura e altura
        td.textSizeX = newW;
        td.textSizeY = newH;
      } else if (td.useBox && getTdAlign(td) !== 3) {
        // Caixa: TextSize segue o alinhamento (esquerda = borda direita, centro = largura)
        const align = getTdAlign(td);
        const boxW = Math.max(4, newW - BOX_PAD_X * 2);
        if (align === 2) td.textSizeY = Math.round(boxW);
        else td.textSizeX = Math.round(td.x + boxW);
        if (isBoxOnly(td)) {
          const ratioY = newH / Math.max(4, isDraggingTd.origH);
          td.letterSizeY = Number(Math.max(0.05, (isDraggingTd.origLetterY || 1) * ratioY).toFixed(3));
        }
      } else {
        // Texto normal: escala letterSizeX e letterSizeY proporcionalmente ao arrasto
        const ratioX = newW / Math.max(4, isDraggingTd.origW);
        const ratioY = newH / Math.max(4, isDraggingTd.origH);
        td.letterSizeX = Number(Math.max(0.05, (isDraggingTd.origLetterX || 0.35) * ratioX).toFixed(3));
        td.letterSizeY = Number(Math.max(0.1, (isDraggingTd.origLetterY || 1.4) * ratioY).toFixed(3));
      }
    } else {
      const dx = sx - isDraggingTd.startX;
      const dy = sy - isDraggingTd.startY;
      const newX = Math.round(Math.max(0, Math.min(640, isDraggingTd.origX + dx)));
      const newY = Math.round(Math.max(0, Math.min(TD_HEIGHT, isDraggingTd.origY + dy)));

      // A caixa acompanha o texto (TextSize X é coordenada absoluta à esquerda e à direita)
      if (td.useBox && td.font !== 4 && td.font !== 5 && getTdAlign(td) !== 2) {
        td.textSizeX = Math.round(isDraggingTd.origSizeX + (newX - isDraggingTd.origX));
      }
      td.x = newX;
      td.y = newY;
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

const BOX_PAD_X = 4 * TD_WIDTH / TD_SCREEN.w;   // margem de 4 px da caixa do CFont

function isBoxOnly(td) {
  return td.isBox || td.text === '_' || !td.text || String(td.text).trim() === '';
}

// Retângulo ocupado em unidades 640x448
function getTextDrawBounds(td) {
  if (td.type === 'progress') return textDrawRect(td);
  if (td.font === 4 || td.font === 5) {
    const w = td.textSizeX > 0 ? td.textSizeX : 80;
    const h = td.textSizeY > 0 ? td.textSizeY : 80;
    return { x: td.x, y: td.y, w, h };
  }
  return textDrawRect(td);
}

function getSelectedTd() {
  const tds = appRef.project?.textDraws || [];
  return tds[selectedIdx] || null;
}

// ---------- Ordem das TextDraws (camadas) ----------
// O SA-MP desenha na ordem dos IDs: o que é criado primeiro fica por baixo. As TextDraws de jogador
// (e as barras, que são de jogador) vêm depois de todas as globais, então ficam sempre por cima delas.
// A lista guarda essa ordem: globais primeiro, depois as de jogador, cada grupo na ordem de criação.
let dragTdIdx = -1;
const isPlayerLayer = (td) => Boolean(td?.isPlayer) || td?.type === 'progress';

function normalizeTdOrder() {
  const tds = appRef?.project?.textDraws;
  if (!tds || tds.length < 2) return;
  const ordered = [...tds.filter(t => !isPlayerLayer(t)), ...tds.filter(t => isPlayerLayer(t))];
  if (ordered.every((t, i) => t === tds[i])) return;
  const sel = tds[selectedIdx];
  tds.splice(0, tds.length, ...ordered);
  selectedIdx = sel ? tds.indexOf(sel) : selectedIdx;
  appRef.project.modified = true;
}

// Move a TextDraw da posição "from" para antes da posição "to" (dentro do mesmo grupo)
function moveTdTo(from, to) {
  const tds = appRef?.project?.textDraws;
  if (!tds || from < 0 || from >= tds.length) return;
  const td = tds[from];
  const groupIdx = tds.map((t, i) => (isPlayerLayer(t) === isPlayerLayer(td) ? i : -1)).filter(i => i >= 0);
  const first = groupIdx[0], last = groupIdx[groupIdx.length - 1];
  let target = Math.max(first, Math.min(last + 1, to));
  if (target === from || target === from + 1) return;
  tdPushUndo();
  tds.splice(from, 1);
  if (target > from) target--;
  tds.splice(target, 0, td);
  selectedIdx = target;
  appRef.project.modified = true;
  updateSidebarList();
  updateSidebarFields();
  redrawCanvas();
}

function moveSelectedTd(where) {
  const tds = appRef?.project?.textDraws;
  const td = tds?.[selectedIdx];
  if (!td) return;
  const groupIdx = tds.map((t, i) => (isPlayerLayer(t) === isPlayerLayer(td) ? i : -1)).filter(i => i >= 0);
  const first = groupIdx[0], last = groupIdx[groupIdx.length - 1];
  if (where === 'back') moveTdTo(selectedIdx, first);
  else if (where === 'front') moveTdTo(selectedIdx, last + 1);
  else if (where < 0) moveTdTo(selectedIdx, Math.max(first, selectedIdx - 1));
  else moveTdTo(selectedIdx, Math.min(last + 1, selectedIdx + 2));
}

// ---------- Prévia da piscada (BlinkPlayerProgressBar) ----------
// Igual à include: começa aceso e troca a cada intervalo; com duração, para no fim e a prévia
// recomeça depois de 1 s para dar para ver de novo.
let syncPbBlinkFields = null;

// ---------- Auto preencher (AutoFillPlayerProgressBar) ----------
// Ligado, fica salvo na barra e vai para o código; a prévia anima com o mesmo tempo da include:
// enche do valor atual até "Preencher até", segura, volta e segura. O valor salvo não muda.
const autoFillStart = new Map(); // barra -> início da animação na prévia
function autoFillPreviewValue(td) {
  if (!autoFillStart.has(td)) autoFillStart.set(td, performance.now());
  return pbAutoFillValue(td, performance.now() - autoFillStart.get(td));
}
function syncAutoFillControls(td) {
  const btn = dialogEl?.querySelector('#tdPbAutoFill');
  if (btn) {
    const on = Boolean(td?.pbAutoFill);
    btn.classList.toggle('on', on);
    btn.querySelector('span').textContent = on ? 'Auto preencher ligado' : 'Auto preencher';
    btn.querySelector('use')?.setAttribute('href', on ? '#i-pause' : '#i-play');
  }
  const inp = dialogEl?.querySelector('#tdPbAutoFillMax');
  if (inp && td && document.activeElement !== inp) {
    inp.max = String(Number(td.pbMax) || 0);
    inp.value = clampPbAutoFillMax(td.pbAutoFillMax ?? td.pbMax, td.pbMax);
  }
}

// Valor com ao menos uma casa decimal (1.0, 2.5, 0.75)
function decimalText(v) {
  const t = String(Math.round(Number(v) * 100) / 100);
  return t.includes('.') ? t : t + '.0';
}

// Campos que dependem do modelo: segmentos só no anel, direção não vale para o círculo, e um aviso
// com as PlayerTextDraws que a barra usa no jogo
function syncPbStyleRows(td) {
  if (!dialogEl || !td) return;
  const style = td.pbStyle | 0;
  const show = (id, on, disp = 'flex') => { const el = dialogEl.querySelector(id); if (el) el.style.display = on ? disp : 'none'; };
  show('#tdPbSegmentsRow', style === 1);
  show('#tdPbDirRow', style !== 2);
  const note = dialogEl.querySelector('#tdPbStyleNote');
  if (note) {
    const seg = clampPbSegments(td.pbSegments);
    note.style.display = style ? 'block' : 'none';
    note.textContent = style === 1
      ? `O anel usa ${seg * 2} PlayerTextDraws (2 por segmento) de 256 por jogador. Para ficar redondo, a altura deve ser 1,25 vez a largura.`
      : 'O círculo usa 3 PlayerTextDraws e cresce do centro. Para ficar redondo, a altura deve ser 1,25 vez a largura.';
  }
}

// Mostra o seletor de cor só quando a cor própria está ligada
function syncPbColorRows(td) {
  if (!dialogEl || !td) return;
  const show = (id, on) => { const el = dialogEl.querySelector(id); if (el) el.style.display = on ? 'flex' : 'none'; };
  show('#tdPbBorderColorRow', Boolean(td.pbBorderColor));
  show('#tdPbBlinkBorderColorRow', Boolean(td.pbBlinkBorderColor));
}

// Limite do campo Borda conforme o tamanho da barra; uma borda que não cabe mais é reduzida
function syncPbBorderLimit(td) {
  if (!dialogEl || !td || td.type !== 'progress') return;
  const max = maxPbBorder(td.pbWidth, td.pbHeight);
  const fitted = fitPbBorder(td.pbBorder, td.pbWidth, td.pbHeight);
  if (fitted !== td.pbBorder) td.pbBorder = fitted;
  const el = dialogEl.querySelector('#tdPbBorder');
  if (el) { el.max = String(max); if (document.activeElement !== el) el.value = decimalText(fitted); }
  const lbl = dialogEl.querySelector('#tdPbBorderLabel');
  if (lbl) lbl.textContent = `Borda (${decimalText(PB_LIMITS.borderMin).replace('.', ',')} a ${decimalText(max).replace('.', ',')})`;
}
let blinkStart = 0, blinkTimer = null, blinkLastKey = '';
function blinkPhaseOf(td) {
  if (!td?.pbBlink || !dialogEl?.open) return false;
  const interval = clampPbBlinkInterval(td.pbBlinkInterval);
  const duration = clampPbBlinkDuration(td.pbBlinkDuration);
  let t = performance.now() - blinkStart;
  if (duration > 0) {
    t %= duration + 1000;
    if (t >= duration) return false;
  }
  return Math.floor(t / interval) % 2 === 0;
}
function restartBlinkPreview() {
  blinkStart = performance.now();
  blinkLastKey = '';
  if (!blinkTimer) {
    blinkTimer = setInterval(() => {
      if (!dialogEl?.open) { clearInterval(blinkTimer); blinkTimer = null; return; }
      if ((appRef.project?.textDraws || []).some(t => t.type === 'progress' && t.pbAutoFill)) { redrawCanvas(); return; }
      const bars = (appRef.project?.textDraws || []).filter(t => t.type === 'progress' && t.pbBlink);
      if (!bars.length) return;
      const key = bars.map(b => blinkPhaseOf(b) ? 1 : 0).join('');
      if (key !== blinkLastKey) { blinkLastKey = key; redrawCanvas(); }
    }, 25);
  }
  redrawCanvas();
}

export function openTextDrawEditor() {
  if (!dialogEl) return;
  loadGameBg();
  loadGtaFonts(() => { if (dialogEl.classList.contains('open')) redrawCanvas(); });
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
  restartBlinkPreview();
}

export function closeTextDrawEditor() {
  if (!dialogEl) return;
  if (dialogEl.open) dialogEl.close();
  dialogEl.classList.remove('open');
}

function redrawCanvas() {
  if (!ctx || !canvasEl) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  useLogicalUnits();

  // Fundo do jogo / GTA SA (esticado em 16:9, como o próprio jogo faz com o HUD)
  if (showGameBg && gameBgImg && gameBgImg.complete && gameBgImg.naturalWidth > 0) {
    ctx.drawImage(gameBgImg, 0, 0, TD_WIDTH, TD_HEIGHT);
  } else {
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, TD_WIDTH, TD_HEIGHT);
  }

  if (showGrid) drawGrid();

  const tds = appRef.project?.textDraws || [];
  for (let i = 0; i < tds.length; i++) {
    renderTextDraw(tds[i], i === selectedIdx);
  }
}

function drawGrid() {
  ctx.save();
  const px = TD_WIDTH / TD_SCREEN.w;
  ctx.lineWidth = px;

  for (let x = 0; x <= TD_WIDTH; x += 40) {
    ctx.beginPath();
    ctx.strokeStyle = (x % 80 === 0) ? 'rgba(0, 229, 255, 0.35)' : 'rgba(0, 229, 255, 0.18)';
    ctx.moveTo(x, 0);
    ctx.lineTo(x, TD_HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y <= TD_HEIGHT; y += 40) {
    ctx.beginPath();
    ctx.strokeStyle = (y % 80 === 0) ? 'rgba(0, 229, 255, 0.35)' : 'rgba(0, 229, 255, 0.18)';
    ctx.moveTo(0, y);
    ctx.lineTo(TD_WIDTH, y);
    ctx.stroke();
  }

  // Margem segura da tela do jogo (Safe Zone): sombra preta para contraste + tracejado magenta
  const sz = { x: 20, y: 20, w: TD_WIDTH - 40, h: TD_HEIGHT - 40 };
  ctx.lineWidth = 3 * px;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.strokeRect(sz.x, sz.y, sz.w, sz.h);

  ctx.lineWidth = 1.5 * px;
  ctx.strokeStyle = '#FF1493';
  ctx.setLineDash([18 * px, 12 * px]);
  ctx.strokeRect(sz.x, sz.y, sz.w, sz.h);
  ctx.setLineDash([]);

  // Rótulo desenhado em pixels para não deformar com a escala vertical
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const label = `SAFE ZONE (${sz.w} × ${sz.h})`;
  const lx = sz.x * TD_SCREEN.w / TD_WIDTH, ly = sz.y * TD_SCREEN.h / TD_HEIGHT - 6;
  ctx.font = 'bold 26px "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
  ctx.lineWidth = 6;
  ctx.strokeText(label, lx, ly);
  ctx.fillStyle = '#FF1493';
  ctx.fillText(label, lx, ly);

  ctx.restore();
  useLogicalUnits();
}

function renderTextDraw(td, isSelected) {
  const bounds = getTextDrawBounds(td);

  if (td.type === 'progress') {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    drawProgressBar(ctx, td.pbAutoFill ? { ...td, pbValue: autoFillPreviewValue(td) } : td, blinkPhaseOf(td));
    ctx.restore();
    useLogicalUnits();
  } else if (td.font === 5) {
    if (td.useBox) {
      ctx.fillStyle = toHexRgba(td.boxColor ?? 0x00000080).css;
      ctx.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
    }
    renderModelPreview(td, bounds, isSelected);
  } else if (td.font === 4) {
    renderSpriteTextDraw(td, bounds);
  } else {
    // Texto e caixa com as contas e as fontes do GTA SA, em pixels da tela de referência
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    drawTextDraw(ctx, td);
    ctx.restore();
    useLogicalUnits();
  }

  // Borda de seleção e alça de redimensionamento
  if (isSelected) {
    const px = TD_WIDTH / TD_SCREEN.w, py = TD_HEIGHT / TD_SCREEN.h;
    ctx.strokeStyle = '#00CCFF';
    ctx.lineWidth = 3 * px;
    ctx.setLineDash([9 * px, 9 * px]);
    ctx.strokeRect(bounds.x - 6 * px, bounds.y - 6 * py, bounds.w + 12 * px, bounds.h + 12 * py);
    ctx.setLineDash([]);

    const hx = bounds.x + bounds.w;
    const hy = bounds.y + bounds.h;
    const hw = 15 * px, hh = 15 * py;
    ctx.fillStyle = '#00CCFF';
    ctx.fillRect(hx - hw, hy - hh, hw * 2, hh * 2);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3 * px;
    ctx.strokeRect(hx - hw, hy - hh, hw * 2, hh * 2);
  }
}

const GTA_SA_SYMBOLS = {
  '<': '◀',
  '>': '▶',
  'u': '▲',
  'd': '▼',
};

function stripColorTags(str) {
  let s = String(str || '').replace(/\{[A-Fa-f0-9]{6}\}/g, '');
  s = s.replace(/~([<>ud])~/g, (_, sym) => GTA_SA_SYMBOLS[sym] || sym);
  s = s.replace(/~[a-zA-Z]~/g, '');
  return s;
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

  const modelId = td.previewModel ?? 411;
  // Fundo: o SA-MP limpa a imagem da prévia com a cor de fundo (BackgroundColor) da TextDraw
  const bg = toHexRgba(td.backgroundColor ?? 0x00000000);
  if (bg.a > 0) { ctx.fillStyle = bg.css; ctx.fillRect(bounds.x, bounds.y, bounds.w, bounds.h); }
  // Modelo 3D de verdade, desenhado como no jogo (256 x 256 esticado para a caixa)
  const img = modelPreviewImage(appRef, td, () => { if (dialogEl?.open) redrawCanvas(); });

  if (img) {
    ctx.drawImage(img, bounds.x, bounds.y, bounds.w, bounds.h);
  } else if (img === null) {
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = 'rgba(101,181,255,0.8)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Carregando modelo', bounds.x + bounds.w / 2, bounds.y + bounds.h / 2);
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

  normalizeTdOrder();
  let lastGroup = null;
  tds.forEach((td, idx) => {
    const group = isPlayerLayer(td);
    if (group !== lastGroup) {
      const head = document.createElement('div');
      head.className = 'td-list-group';
      head.textContent = group ? 'De jogador e barras (sempre por cima das globais)' : 'Globais';
      listEl.appendChild(head);
      lastGroup = group;
    }
    const item = document.createElement('div');
    item.className = 'td-list-item' + (idx === selectedIdx ? ' selected' : '');
    item.draggable = true;
    item.ondragstart = (e) => { dragTdIdx = idx; e.dataTransfer.effectAllowed = 'move'; };
    item.ondragend = () => { dragTdIdx = -1; listEl.querySelectorAll('.drop-before, .drop-after').forEach(el => el.classList.remove('drop-before', 'drop-after')); };
    item.ondragover = (e) => {
      if (dragTdIdx < 0 || isPlayerLayer(tds[dragTdIdx]) !== group) return;
      e.preventDefault();
      const after = e.offsetY > item.offsetHeight / 2;
      item.classList.toggle('drop-after', after);
      item.classList.toggle('drop-before', !after);
    };
    item.ondragleave = () => item.classList.remove('drop-before', 'drop-after');
    item.ondrop = (e) => {
      e.preventDefault();
      if (dragTdIdx < 0 || isPlayerLayer(tds[dragTdIdx]) !== group) return;
      const after = e.offsetY > item.offsetHeight / 2;
      moveTdTo(dragTdIdx, idx + (after ? 1 : 0));
      dragTdIdx = -1;
    };
    const col = toHexRgba(td.color ?? 0xFFFFFFFF);
    const label = td.type === 'progress' ? `${['Barra', 'Anel', 'Círculo'][td.pbStyle | 0] || 'Barra'}: ${td.name || 'sem nome'}` : stripColorTags(td.text || (td.font === 5 ? `Model #${td.previewModel}` : 'Box'));

    item.innerHTML = `
      <div class="td-badge" style="background:${col.hex};"></div>
      <div class="td-info">
        <span class="td-title">${td.isPlayer && td.type !== 'progress' ? '[Player] ' : ''}${label}</span>
        <span class="td-sub">Camada ${idx + 1} · Pos: ${td.x}, ${td.y}${td.type === 'progress' ? '' : ` | Font: ${td.font}`}</span>
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
  const lblX = dialogEl.querySelector('#tdSizeXLbl'), lblY = dialogEl.querySelector('#tdSizeYLbl');
  const special = td.font === 4 || td.font === 5;
  const alignNow = getTdAlign(td);
  if (lblX) lblX.textContent = special ? 'Largura' : (alignNow === 2 ? 'Text Size X' : (alignNow === 3 ? 'Text Size X' : 'Fim da caixa (X)'));
  if (lblY) lblY.textContent = special ? 'Altura' : (alignNow === 2 ? 'Largura da caixa' : 'Text Size Y');
  setVal('#tdFont', td.font);
  setVal('#tdAlign', getTdAlign(td));
  setChk('#tdOutline', td.outline > 0);
  setChk('#tdShadow', td.shadow > 0);
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

  // Barra de progresso: só posição, cor e os campos da barra
  const isBar = td.type === 'progress';
  dialogEl.querySelectorAll('#tdDetailsPanel .td-std').forEach(el => { el.style.display = isBar ? 'none' : ''; });
  const pbPanel = dialogEl.querySelector('#tdProgressPanel');
  if (pbPanel) pbPanel.style.display = isBar ? 'flex' : 'none';
  if (isBar) {
    setVal('#tdPbName', td.name);
    setVal('#tdPbWidth', td.pbWidth);
    setVal('#tdPbHeight', td.pbHeight);
    setVal('#tdPbMax', td.pbMax);
    setVal('#tdPbValue', td.pbValue);
    setVal('#tdPbDir', td.pbDir);
    syncPbBorderLimit(td);
    setVal('#tdPbBlinkInterval', clampPbBlinkInterval(td.pbBlinkInterval));
    setVal('#tdPbBlinkDuration', clampPbBlinkDuration(td.pbBlinkDuration));
    const blinkBox = dialogEl.querySelector('#tdPbBlink');
    if (blinkBox) blinkBox.checked = Boolean(td.pbBlink);
    const own = dialogEl.querySelector('#tdPbBlinkOwn');
    if (own) own.checked = !td.pbBlinkColor;
    if (td.pbBlinkColor) setVal('#tdPbBlinkColor', '#' + ((Number(td.pbBlinkColor) >>> 8) & 0xFFFFFF).toString(16).padStart(6, '0'));
    syncPbBlinkFields?.(td);
    const hexColor = (v) => '#' + ((Number(v) >>> 8) & 0xFFFFFF).toString(16).padStart(6, '0');
    const bd = dialogEl.querySelector('#tdPbBorderDefault');
    if (bd) bd.checked = !td.pbBorderColor;
    if (td.pbBorderColor) setVal('#tdPbBorderColor', hexColor(td.pbBorderColor));
    const bb = dialogEl.querySelector('#tdPbBlinkBorder');
    if (bb) bb.checked = Boolean(td.pbBlinkBorderColor);
    if (td.pbBlinkBorderColor) setVal('#tdPbBlinkBorderColor', hexColor(td.pbBlinkBorderColor));
    syncPbColorRows(td);
    setVal('#tdPbStyle', td.pbStyle | 0);
    setVal('#tdPbSegments', clampPbSegments(td.pbSegments));
    syncPbStyleRows(td);
    syncAutoFillControls(td);
  }

  // Painel de Sprite (Font 4)
  const spritePanel = dialogEl.querySelector('#tdSpritePanel');
  if (spritePanel) {
    spritePanel.style.display = td.font === 4 ? 'block' : 'none';
  }

  // Controles específicos de Font 5 (Model Preview)
  const modelPanel = dialogEl.querySelector('#tdModelPreviewPanel');
  if (modelPanel) {
    modelPanel.style.display = td.font === 5 ? 'block' : 'none';
    setVal('#tdPreviewModel', td.previewModel ?? 411);
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
    tdv: 2,
    text: defaultText,
    x: 320,
    y: 200,
    font: 1,
    letterSizeX: 0.35,
    letterSizeY: 1.4,
    textSizeX: 0,
    textSizeY: 640,
    color: 0xFFFFFFFF,
    align: 2,
    alignment: 2,
    shadow: 0,
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
    tdv: 2,
    text: '_',
    x: 200,
    y: 150,
    letterSizeX: 0,
    letterSizeY: 5,
    useBox: 1,
    textSizeX: 440,
    textSizeY: 0,
    boxColor: 0x00000080,
  });
  appRef.project.textDraws.push(td);
  appRef.project.modified = true;
  selectedIdx = appRef.project.textDraws.length - 1;
  updateSidebarFields();
  updateSidebarList();
  redrawCanvas();
}

function createNewProgressBar() {
  tdPushUndo();
  if (!appRef.project.textDraws) appRef.project.textDraws = [];
  const used = new Set(appRef.project.textDraws.filter(t => t.type === 'progress').map(t => t.name));
  let n = 1;
  n = 0;
  while (used.has(`progress_${n}`)) n++;
  const td = makeTextDraw({
    tdv: 2,
    type: 'progress',
    name: `progress_${n}`,
    text: 'Barra de progresso',
    x: 260,
    y: 300,
    pbWidth: 120,
    pbHeight: 12,
    pbMax: 100,
    pbValue: 60,
    pbDir: 0,
    color: 0xFF1C1CFF | 0,
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
    tdv: 2,
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
    tdv: 2,
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
  // A cópia fica fora da original, encostada na borda de baixo (ou de cima, se não couber na tela)
  // e na mesma coluna (mesmo X), como no jogo a TextDraw ocupa o retângulo de textDrawRect
  const r = textDrawRect(td), gap = 2;
  let dy = r.h + gap;
  if (r.y + r.h + gap + r.h > TD_HEIGHT && r.y - gap - r.h >= 0) dy = -(r.h + gap);
  const round = (v) => Math.round(v * 100) / 100;
  const copy = makeTextDraw({ ...td, uid: null, x: td.x, y: round(td.y + dy) });
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
    toast('Nenhum TextDraw para exportar', 'warn');
    return;
  }

  const lines = ['// TextDraws exportados pelo SA Map Studio'];
  const hex = (v) => '0x' + (Number(v) >>> 0).toString(16).toUpperCase().padStart(8, '0');
  const num = (v) => { const t = String(+(+v || 0).toFixed(4)); return t.includes('.') ? t : t + '.0'; };
  tds.forEach((td, i) => {
    if (td.type === 'progress') {
      lines.push(...progressBarPawn(td, progressBarVar(td, tds), num));
      lines.push('');
      return;
    }
    const n = textDrawNative(td);
    const v = textDrawVar(td, tds);
    const prefix = td.isPlayer ? 'PlayerText:' : 'Text:';
    lines.push(`new ${prefix}${v} = ${td.isPlayer ? 'CreatePlayerTextDraw(playerid, ' : 'TextDrawCreate('}${num(td.x)}, ${num(td.y)}, ${JSON.stringify(n.text)});`);
    lines.push(`TextDrawFont(${v}, ${n.font});`);
    lines.push(`TextDrawLetterSize(${v}, ${num(n.letterSizeX)}, ${num(n.letterSizeY)});`);
    lines.push(`TextDrawAlignment(${v}, ${n.align});`);
    lines.push(`TextDrawColor(${v}, ${hex(n.color)});`);
    lines.push(`TextDrawSetOutline(${v}, ${n.outline});`);
    lines.push(`TextDrawSetShadow(${v}, ${n.shadow});`);
    lines.push(`TextDrawSetProportional(${v}, ${n.proportional});`);
    if (n.useBox) {
      lines.push(`TextDrawUseBox(${v}, 1);`);
      lines.push(`TextDrawBoxColor(${v}, ${hex(n.boxColor)});`);
    }
    lines.push(`TextDrawTextSize(${v}, ${num(n.textSizeX)}, ${num(n.textSizeY)});`);
    lines.push(`TextDrawBackgroundColor(${v}, ${hex(n.backgroundColor)});`);
    if (td.selectable) lines.push(`TextDrawSetSelectable(${v}, 1);`);
    if (n.font === 5 && td.previewModel) {
      lines.push(`TextDrawSetPreviewModel(${v}, ${td.previewModel});`);
      lines.push(`TextDrawSetPreviewRot(${v}, ${num(td.previewRotX ?? -16)}, ${num(td.previewRotY ?? 0)}, ${num(td.previewRotZ ?? -55)}, ${num(td.previewZoom || 1)});`);
      lines.push(`TextDrawSetPreviewVehCol(${v}, ${td.previewColor1 ?? 1}, ${td.previewColor2 ?? 1});`);
    }
    lines.push('');
  });

  const fullText = lines.join('\n');
  navigator.clipboard.writeText(fullText).then(() => {
    toast(`${tds.length} TextDraw(s) copiados em formato Pawn`, 'ok');
  });
}
