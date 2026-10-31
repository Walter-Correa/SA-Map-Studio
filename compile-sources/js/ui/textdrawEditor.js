// Visual, interactive TextDraw editor (TextDrawCreate / CreatePlayerTextDraw)
// SA-MP 640x448 screen shown at 16:9; texts drawn with the game's own fonts (tdrender.js),
// interactive dragging, fonts 0-5 (including Font 5 model previews), boxes, alignment, RGBA colors and Pawn export.
import { makeTextDraw, textDrawNative, progressBarPawn, progressBarVar, textDrawVar, PB_LIMITS, PB_MIN_WIDTH, PB_MIN_HEIGHT, fitPbBorder, maxPbBorder, clampPbBlinkInterval, clampPbBlinkDuration, clampPbStyle, clampPbSegments, clampPbSegmentScale, clampPbAutoFillMax, pbAutoFillValue, textDrawPawn, tdBlinkActive, tdBlinkPerChar, tdBlinkColour, clampTdBlinkInterval, TD_BLINK_DEFAULT } from '../editor/project.js';
import { TD_SCREEN, TD_WIDTH, TD_HEIGHT, loadGtaFonts, drawTextDraw, textDrawRect, textDrawTextWidth, drawProgressBar } from '../editor/tdrender.js';
import { toast, arrowStep, themeVar } from './common.js';
import { modelPreviewImage } from '../editor/modelPreview.js';
import { t, onLanguageChange } from './i18n.js';

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
  // On the very first run the sprites are still being drawn from the game files: tries again when they are ready
  img.onerror = () => window.addEventListener('game-assets-ready', () => { img.src = primaryUrl + '?r=1'; }, { once: true });
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

// Default colors
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
  // Texts drawn on the canvas do not go through the page translation: redraws when the language changes
  onLanguageChange(() => { if (dialogEl.open) redrawCanvas(); });

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

// Mouse coordinates in 640x448 units
// The canvas uses object-fit: contain, so the image may have empty bands around it inside the element
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

// Drawing in 640x448 units (background, grid, sprites, models and selection)
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
      // Left box: TextSize X is the absolute right edge and follows the text
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
  // Progress bar
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
        if (ev?.type !== 'change') return; // typing: waits until finished before applying the minimum
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

  // Bar border and blink: out-of-range values go back to the limit (the include also checks)
  const pbLimited = [
    ['#tdPbBorder', 'pbBorder', (v) => { const td = getSelectedTd(); return fitPbBorder(v, td?.pbWidth, td?.pbHeight); }],
    ['#tdPbBlinkInterval', 'pbBlinkInterval', clampPbBlinkInterval],
    ['#tdPbBlinkDuration', 'pbBlinkDuration', clampPbBlinkDuration],
  ];
  for (const [id, prop, clamp] of pbLimited) {
    const el = dialogEl.querySelector(id);
    if (!el) continue;
    el.onfocus = () => tdPushUndo();
    // Typing: only uses the value if it is already within the limit, without touching the field.
    // On leaving the field (or Enter): applies the limit and shows the final value.
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
  // Border color (0 = black with the bar's alpha) and border color during the blink (0 = no blink)
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
      if (!fix && (autoMax.value === '' || !Number.isFinite(typed) || v !== typed)) return; // typing: valid values only
      td.pbAutoFillMax = v;
      if (fix) autoMax.value = v;
      appRef.project.modified = true;
      redrawCanvas();
    };
    autoMax.oninput = () => applyAutoMax(false);
    autoMax.onchange = () => applyAutoMax(true);
  }

  // Bar style: when switching a bar to a round shape, the box becomes 40 x 50 (round on screen)
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
      if (!fix && (segInp.value === '' || Number(segInp.value) !== v)) return; // typing: only already valid values
      td.pbSegments = v;
      if (fix) segInp.value = v;
      syncPbStyleRows(td);
      appRef.project.modified = true;
      redrawCanvas();
    };
    segInp.oninput = () => applySeg(false);
    segInp.onchange = () => applySeg(true);
  }
  // Size of each ring segment (1 = the default)
  const scaleInp = dialogEl.querySelector('#tdPbSegScale');
  if (scaleInp) {
    scaleInp.onfocus = () => tdPushUndo();
    const applyScale = (fix) => {
      const td = getSelectedTd();
      if (!td || td.type !== 'progress') return;
      const v = clampPbSegmentScale(scaleInp.value);
      if (!fix && (scaleInp.value === '' || Number(scaleInp.value) !== v)) return; // typing: only already valid values
      td.pbSegmentScale = v;
      if (fix) scaleInp.value = v;
      appRef.project.modified = true;
      redrawCanvas();
    };
    scaleInp.oninput = () => applyScale(false);
    scaleInp.onchange = () => applyScale(true);
  }

  // Outline and shadow: only on (1) or off (0)
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
        // The right box does not use TextSize in the game; in the other alignments it wraps the text again
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

  // Creation order (layers): buttons below the list
  for (const [id, where] of [['#tdOrderBack', 'back'], ['#tdOrderDown', -1], ['#tdOrderUp', 1], ['#tdOrderFront', 'front']]) {
    const b = dialogEl.querySelector(id);
    if (b) b.onclick = () => moveSelectedTd(where);
  }

  // Blink of a PlayerTextDraw (BlinkPlayerTextDraw)
  const tdBlinkBox = dialogEl.querySelector('#tdBlink');
  const tdBlinkOwn = dialogEl.querySelector('#tdBlinkOwn');
  const tdBlinkColor = dialogEl.querySelector('#tdBlinkColor');
  const tdBlinkColorValue = () => ((parseInt((tdBlinkColor?.value || '#ffffff').slice(1), 16) << 8) | 0xFF) >>> 0;
  syncTdBlinkFields = (td) => {
    const player = Boolean(td?.isPlayer);
    if (tdBlinkBox) tdBlinkBox.disabled = !player;
    const fields = dialogEl.querySelector('#tdBlinkFields');
    if (fields) fields.style.display = player && td?.blink ? 'flex' : 'none';
    const row = dialogEl.querySelector('#tdBlinkColorRow');
    if (row) row.style.display = td?.blinkColor && !tdBlinkPerChar(td) ? 'flex' : 'none';
    const pc = dialogEl.querySelector('#tdBlinkPerChar');
    if (pc) pc.disabled = [4, 5].includes(td?.font ?? 1);
  };
  if (tdBlinkBox) tdBlinkBox.onchange = () => {
    const td = getSelectedTd();
    if (!td || td.type === 'progress') return;
    tdPushUndo();
    td.blink = tdBlinkBox.checked && Boolean(td.isPlayer);
    syncTdBlinkFields(td);
    appRef.project.modified = true;
    restartBlinkPreview();
  };
  for (const [id, prop, clamp] of [['#tdBlinkInterval', 'blinkInterval', clampTdBlinkInterval], ['#tdBlinkDuration', 'blinkDuration', clampPbBlinkDuration]]) {
    const el = dialogEl.querySelector(id);
    if (!el) continue;
    el.onfocus = () => tdPushUndo();
    // Typing: only already valid values are used; the limit is applied when leaving the field
    const apply = (fix) => {
      const td = getSelectedTd();
      if (!td || td.type === 'progress') return;
      const typed = Number(String(el.value).replace(',', '.'));
      const v = clamp(el.value);
      if (!fix && (el.value === '' || !Number.isFinite(typed) || v !== typed)) return;
      td[prop] = v;
      if (fix) el.value = v;
      appRef.project.modified = true;
      restartBlinkPreview();
    };
    el.oninput = () => apply(false);
    el.onchange = () => apply(true);
  }
  const tdBlinkPerCharBox = dialogEl.querySelector('#tdBlinkPerChar');
  if (tdBlinkPerCharBox) tdBlinkPerCharBox.onchange = () => {
    const td = getSelectedTd();
    if (!td || td.type === 'progress') return;
    tdPushUndo();
    // Character by character and vanishing exclude each other (checking one unchecks the other); with neither, the TextDraw is painted in a colour
    td.blinkPerChar = tdBlinkPerCharBox.checked;
    if (td.blinkPerChar) {
      td.blinkColor = 0;
      if (tdBlinkOwn) tdBlinkOwn.checked = false;
    } else if (tdBlinkOwn && !tdBlinkOwn.checked) {
      td.blinkColor = tdBlinkColorValue();
    }
    syncTdBlinkFields(td);
    appRef.project.modified = true;
    restartBlinkPreview();
  };
  if (tdBlinkOwn) tdBlinkOwn.onchange = () => {
    const td = getSelectedTd();
    if (!td || td.type === 'progress') return;
    tdPushUndo();
    if (tdBlinkOwn.checked) {
      td.blinkPerChar = false;
      if (tdBlinkPerCharBox) tdBlinkPerCharBox.checked = false;
    }
    td.blinkColor = tdBlinkOwn.checked || td.blinkPerChar ? 0 : tdBlinkColorValue();
    syncTdBlinkFields(td);
    appRef.project.modified = true;
    restartBlinkPreview();
  };
  if (tdBlinkColor) {
    tdBlinkColor.onfocus = () => tdPushUndo();
    tdBlinkColor.oninput = () => {
      const td = getSelectedTd();
      if (!td || td.type === 'progress' || tdBlinkOwn?.checked || tdBlinkPerCharBox?.checked) return;
      td.blinkColor = tdBlinkColorValue();
      appRef.project.modified = true;
      redrawCanvas();
    };
  }

  const chkPlayer = dialogEl.querySelector('#tdIsPlayer');
  if (chkPlayer) {
    chkPlayer.onchange = () => {
      const td = getSelectedTd();
      if (!td) return;
      td.isPlayer = chkPlayer.checked;
      if (!td.isPlayer) td.blink = false; // only a PlayerTextDraw can blink
      syncTdBlinkFields?.(td);
      if (tdBlinkBox) tdBlinkBox.checked = Boolean(td.blink);
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

// 3D model thumbnail cache (Font 5)
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

    // 1. Checks whether the selected TextDraw's resize handle was clicked
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

    // 2. Looks up the clicked TextDraw from back to front (display order)
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
      // Updates the mouse cursor style on hover
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
        // Bar: dragging changes width and height in the same proportion as the rectangle
        const rx = newW / Math.max(4, isDraggingTd.origW), ry = newH / Math.max(4, isDraggingTd.origH);
        td.pbWidth = Number(Math.max(PB_MIN_WIDTH, (isDraggingTd.origPbW || td.pbWidth) * rx).toFixed(1));
        td.pbHeight = Number(Math.max(PB_MIN_HEIGHT, (isDraggingTd.origPbH || td.pbHeight) * ry).toFixed(2));
        syncPbBorderLimit(td);
      } else if (td.font === 4 || td.font === 5) {
        // Sprite (Font 4) and 3D model preview (Font 5): textSizeX and textSizeY are width and height
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
        // Normal text: scales letterSizeX and letterSizeY proportionally to the drag
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

      // The box follows the text (TextSize X is an absolute coordinate on the left and right)
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

const BOX_PAD_X = 4 * TD_WIDTH / TD_SCREEN.w;   // 4 px margin of the CFont box

function isBoxOnly(td) {
  return td.isBox || td.text === '_' || !td.text || String(td.text).trim() === '';
}

// Occupied rectangle in 640x448 units
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

// ---------- TextDraw order (layers) ----------
// SA-MP draws in ID order: what is created first sits underneath. Player TextDraws
// (and the bars, which are player ones) come after all the global ones, so they are always on top of them.
// The list keeps this order: globals first, then player ones, each group in creation order.
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

// Moves the TextDraw from position "from" to before position "to" (within the same group)
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

// ---------- Blink preview (BlinkPlayerProgressBar) ----------
// Same as the include: starts lit and toggles every interval; with a duration, stops at the end and the preview
// restarts after 1 s so it can be seen again.
let syncPbBlinkFields = null;
let syncTdBlinkFields = null;

// ---------- Auto preencher (AutoFillPlayerProgressBar) ----------
// When on, it is saved in the bar and goes into the code; the preview animates with the same timing as the include:
// fills from the current value up to "Preencher até", holds, goes back and holds. The saved value does not change.
const autoFillStart = new Map(); // bar -> animation start in the preview
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

// Value with at least one decimal place (1.0, 2.5, 0.75)
function decimalText(v) {
  const t = String(Math.round(Number(v) * 100) / 100);
  return t.includes('.') ? t : t + '.0';
}

// Fields that depend on the style: segments only on the ring, direction does not apply to the circle, and a notice
// with the PlayerTextDraws the bar uses in the game
function syncPbStyleRows(td) {
  if (!dialogEl || !td) return;
  const style = td.pbStyle | 0;
  const show = (id, on, disp = 'flex') => { const el = dialogEl.querySelector(id); if (el) el.style.display = on ? disp : 'none'; };
  show('#tdPbSegmentsRow', style === 1);
  show('#tdPbSegScaleRow', style === 1);
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

// Shows the color picker only when the custom color is on
function syncPbColorRows(td) {
  if (!dialogEl || !td) return;
  const show = (id, on) => { const el = dialogEl.querySelector(id); if (el) el.style.display = on ? 'flex' : 'none'; };
  show('#tdPbBorderColorRow', Boolean(td.pbBorderColor));
  show('#tdPbBlinkBorderColorRow', Boolean(td.pbBlinkBorderColor));
}

// Border field limit according to the bar size; a border that no longer fits is reduced
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
// ---------- Blink of the TextDraws (BlinkPlayerTextDraw): the same as the include, to see it in the editor ----------
// Index after the ~x~ tag that starts at i (~k~ also takes the ~KEY~ that follows it)
function tagEnd(text, i) {
  let j = i + 1;
  while (j < text.length && text[j] !== '~') j++;
  if (text[j] !== '~') return j;
  const key = j === i + 2 && /k/i.test(text[i + 1]);
  j++;
  if (key && text[j] === '~') {
    j++;
    while (j < text.length && text[j] !== '~') j++;
    if (text[j] === '~') j++;
  }
  return j;
}
function visibleCount(text) {
  let i = 0, seen = 0;
  while (i < text.length) { if (text[i] === '~') { i = tagEnd(text, i); continue; } if (text[i] === ' ' || text[i] === '_') { i++; continue; } i++; seen++; }
  return seen;
}
function cutVisible(text, chars) {
  if (chars <= 0) return '';
  let i = 0, seen = 0;
  while (i < text.length) {
    if (text[i] === '~') { i = tagEnd(text, i); continue; }
    if (text[i] === ' ' || text[i] === '_') { i++; continue; } // a space goes with the character after it (a text ending in a space is not drawn in game)
    i++; seen++;
    if (seen === chars) return text.slice(0, i);
  }
  return text;
}
// What the TextDraw looks like now: null when it is off, or a copy with the blink colour / the text typed so far
function tdBlinkView(td) {
  const n = textDrawNative(td);
  const duration = clampPbBlinkDuration(td.blinkDuration);
  const colour = tdBlinkColour(td);
  let interval = clampTdBlinkInterval(td.blinkInterval);
  let perChar = tdBlinkPerChar(td);
  const count = perChar ? visibleCount(n.text) : 0;
  if (perChar && count === 0) perChar = false;
  if (perChar && duration > 0 && count * interval > duration) interval = Math.max(50, Math.floor(duration / count));
  let t = performance.now() - blinkStart;
  if (duration > 0) {
    t %= duration + 1000;
    if (t >= duration) return td; // it ended: the TextDraw stays as it is (the preview restarts after 1 s)
  }
  const v = { ...td };
  let lit = true;
  if (perChar) {
    const step = Math.floor(t / interval) % (count + 1);
    v.text = step === 0 ? ' ' : cutVisible(n.text, step);
  } else {
    lit = Math.floor(t / interval) % 2 === 0;
    if (!colour && !lit) return null;
  }
  if (colour && lit) {
    if (n.font === 5) { v.useBox = 1; v.boxColor = colour; } // a preview model: the colour goes to its background
    else {
      v.color = colour;
      if (n.useBox) v.boxColor = colour;
    }
  }
  return v;
}

function restartBlinkPreview() {
  blinkStart = performance.now();
  blinkLastKey = '';
  if (!blinkTimer) {
    blinkTimer = setInterval(() => {
      if (!dialogEl?.open) { clearInterval(blinkTimer); blinkTimer = null; return; }
      if ((appRef.project?.textDraws || []).some(t => t.type === 'progress' && t.pbAutoFill)) { redrawCanvas(); return; }
      const bars = (appRef.project?.textDraws || []).filter(t => t.type === 'progress' && t.pbBlink);
      const blinking = (appRef.project?.textDraws || []).filter(tdBlinkActive);
      if (!bars.length && !blinking.length) return;
      const key = bars.map(b => blinkPhaseOf(b) ? 1 : 0).join('') + '|' + blinking.map(b => { const v = tdBlinkView(b); return v ? `${v.text}~${v.color}~${v.boxColor}` : 'off'; }).join('|');
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

  // Game background / GTA SA (stretched to 16:9, as the game itself does with the HUD)
  if (showGameBg && gameBgImg && gameBgImg.complete && gameBgImg.naturalWidth > 0) {
    ctx.drawImage(gameBgImg, 0, 0, TD_WIDTH, TD_HEIGHT);
  } else {
    ctx.fillStyle = themeVar('--td-bg', '#0a0d14');
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

  // Game screen safe margin (Safe Zone): black shadow for contrast + magenta dashes
  const sz = { x: 20, y: 20, w: TD_WIDTH - 40, h: TD_HEIGHT - 40 };
  ctx.lineWidth = 3 * px;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.strokeRect(sz.x, sz.y, sz.w, sz.h);

  ctx.lineWidth = 1.5 * px;
  ctx.strokeStyle = '#FF1493';
  ctx.setLineDash([18 * px, 12 * px]);
  ctx.strokeRect(sz.x, sz.y, sz.w, sz.h);
  ctx.setLineDash([]);

  // Label drawn in pixels so it does not distort with the vertical scale
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

function renderTextDraw(real, isSelected) {
  const bounds = getTextDrawBounds(real);
  // A blinking TextDraw is drawn as it is at this moment of the blink (null: off)
  const td = tdBlinkActive(real) ? tdBlinkView(real) : real;

  if (real.type === 'progress') {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    drawProgressBar(ctx, td.pbAutoFill ? { ...td, pbValue: autoFillPreviewValue(td) } : td, blinkPhaseOf(td));
    ctx.restore();
    useLogicalUnits();
  } else if (!td) {
    // off in this phase of the blink: only the selection is drawn
  } else if (td.font === 5) {
    if (td.useBox) {
      ctx.fillStyle = toHexRgba(td.boxColor ?? 0x00000080).css;
      ctx.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
    }
    renderModelPreview(td, bounds, isSelected);
  } else if (td.font === 4) {
    renderSpriteTextDraw(td, bounds);
  } else {
    // Text and box with GTA SA's calculations and fonts, in reference screen pixels
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    drawTextDraw(ctx, td);
    ctx.restore();
    useLogicalUnits();
  }

  // Selection border and resize handle
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
    // Fallback vector / placeholder while the image loads
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
  // If not selected and no active box, draws only a discreet outline
  if (!isSelected && !td.useBox) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1;
    ctx.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h);
  }

  const modelId = td.previewModel ?? 411;
  // Background: SA-MP clears the preview image with the TextDraw's background color (BackgroundColor)
  const bg = toHexRgba(td.backgroundColor ?? 0x00000000);
  if (bg.a > 0) { ctx.fillStyle = bg.css; ctx.fillRect(bounds.x, bounds.y, bounds.w, bounds.h); }
  // Real 3D model, drawn as in the game (256 x 256 stretched to the box)
  const img = modelPreviewImage(appRef, td, () => { if (dialogEl?.open) redrawCanvas(); });

  if (img) {
    ctx.drawImage(img, bounds.x, bounds.y, bounds.w, bounds.h);
  } else if (img === null) {
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = 'rgba(101,181,255,0.8)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(t('Carregando modelo'), bounds.x + bounds.w / 2, bounds.y + bounds.h / 2);
  } else {
    // If it is still loading or has no thumbnail, shows an indicator text
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = '#65B5FF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(t('MODELO 3D: #{0}', modelId), bounds.x + bounds.w / 2, bounds.y + bounds.h / 2);
  }

  // Model tag in the top corner only when selected
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
    const pbName = td.name || 'sem nome';
    const label = td.type === 'progress' ? ([`Barra: ${pbName}`, `Anel: ${pbName}`, `Círculo: ${pbName}`][td.pbStyle | 0] || `Barra: ${pbName}`) : stripColorTags(td.text || (td.font === 5 ? `Model #${td.previewModel}` : 'Box'));

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
  setChk('#tdBlink', td.type !== 'progress' && td.isPlayer && td.blink);
  setVal('#tdBlinkInterval', clampTdBlinkInterval(td.blinkInterval ?? TD_BLINK_DEFAULT));
  setVal('#tdBlinkDuration', clampPbBlinkDuration(td.blinkDuration));
  setChk('#tdBlinkPerChar', td.type !== 'progress' && tdBlinkPerChar(td));
  setChk('#tdBlinkOwn', !td.blinkColor && !tdBlinkPerChar(td));
  if (td.blinkColor) setVal('#tdBlinkColor', '#' + ((Number(td.blinkColor) >>> 8) & 0xFFFFFF).toString(16).padStart(6, '0'));
  syncTdBlinkFields?.(td);

  // Cores
  const textCol = toHexRgba(td.color ?? 0xE1E1E1FF);
  setVal('#tdColor', textCol.hex);
  setVal('#tdAlpha', Math.round(textCol.alpha * 100));

  const boxCol = toHexRgba(td.boxColor ?? 0x00000080);
  setVal('#tdBoxColor', boxCol.hex);
  setVal('#tdBoxAlpha', Math.round(boxCol.alpha * 100));

  const bgCol = toHexRgba(td.backgroundColor ?? 0x000000FF);
  setVal('#tdBgColor', bgCol.hex);

  // Progress bar: only position, color and the bar's fields
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
    setVal('#tdPbSegScale', clampPbSegmentScale(td.pbSegmentScale));
    syncPbStyleRows(td);
    syncAutoFillControls(td);
  }

  // Sprite panel (Font 4)
  const spritePanel = dialogEl.querySelector('#tdSpritePanel');
  if (spritePanel) {
    spritePanel.style.display = td.font === 4 ? 'block' : 'none';
  }

  // Font 5-specific controls (Model Preview)
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
  // The copy sits outside the original, against the bottom edge (or the top, if it does not fit on screen)
  // and in the same column (same X), as in the game the TextDraw occupies the textDrawRect rectangle
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
  const usesBlink = tds.some(tdBlinkActive);
  if (tds.some(td => td.type === 'progress')) lines.push(`// ${t('Requer a include SA Progress Bar Pro ({0}) por causa das barras de progresso.', '#include <progressbarpro>')}`);
  if (usesBlink) lines.push(`// ${t('Requer a include de piscar TextDraws ({0}) por causa do piscar dos TextDraws.', '#include <textdrawblink>')}`);
  const hex = (v) => '0x' + (Number(v) >>> 0).toString(16).toUpperCase().padStart(8, '0');
  const num = (v) => { const t = String(+(+v || 0).toFixed(4)); return t.includes('.') ? t : t + '.0'; };
  tds.forEach((td, i) => {
    if (td.type === 'progress') {
      lines.push(...progressBarPawn(td, progressBarVar(td, tds), num));
      lines.push('');
      return;
    }
    lines.push(...textDrawPawn(td, textDrawVar(td, tds), num));
    lines.push('');
  });

  const fullText = lines.join('\n');
  navigator.clipboard.writeText(fullText).then(() => {
    toast(`${tds.length} TextDraw(s) copiados em formato Pawn`, 'ok');
    if (usesBlink) toast('O código usa o piscar de TextDraws: inclua textdrawblink.inc no servidor.', 'warn');
  });
}
