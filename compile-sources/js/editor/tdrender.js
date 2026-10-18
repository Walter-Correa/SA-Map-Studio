// Desenho de TextDraws igual ao GTA SA / SA-MP: lê data/fonts.dat e models/fonts.txd da pasta do jogo
// e reproduz as contas do CFont (largura das letras, quebra de linha, alinhamento e caixa).
// Tudo é calculado em pixels de uma tela de referência e devolvido também em unidades 640x448 do SA-MP.
import { parseTxd, decodeToRGBA } from '../formats/txd.js';

export const TD_SCREEN = { w: 1920, h: 1080 };   // resolução de referência da prévia (16:9)
export const TD_WIDTH = 640, TD_HEIGHT = 448;   // espaço de coordenadas das TextDraws no SA-MP
const UX = TD_SCREEN.w / TD_WIDTH, UY = TD_SCREEN.h / TD_HEIGHT;

// Cores das tags ~x~ (HudColours do jogo)
const TAG_COLORS = {
  r: [180, 25, 29], g: [54, 104, 44], b: [50, 60, 127], w: [225, 225, 225], s: [225, 225, 225],
  y: [226, 192, 99], p: [168, 110, 252], l: [0, 0, 0],
};

const fonts = { ready: false, data: [null, null], atlas: [null, null] };
let loading = null;

export function gtaFontsReady() { return fonts.ready; }

// Carrega fontes do jogo uma vez; onReady é chamado quando ficam prontas (para redesenhar)
export function loadGtaFonts(onReady) {
  if (!loading) {
    loading = (async () => {
      const [datTxt, txdBuf] = await Promise.all([
        fetch('/gta/data/fonts.dat').then(r => (r.ok ? r.text() : Promise.reject(new Error('fonts.dat')))),
        fetch('/gta/models/fonts.txd').then(r => (r.ok ? r.arrayBuffer() : Promise.reject(new Error('fonts.txd')))),
      ]);
      parseFontsDat(datTxt);
      for (const tex of parseTxd(txdBuf)) {
        const id = { font2: 0, font1: 1 }[tex.name.toLowerCase()];
        if (id === undefined) continue;
        const rgba = decodeToRGBA(tex);
        const c = document.createElement('canvas');
        c.width = tex.mips[0].width; c.height = tex.mips[0].height;
        c.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(rgba.buffer, rgba.byteOffset, rgba.byteLength), c.width, c.height), 0, 0);
        fonts.atlas[id] = { canvas: c, tinted: new Map() };
      }
      fonts.ready = Boolean(fonts.data[0] && fonts.data[1] && fonts.atlas[0] && fonts.atlas[1]);
      return fonts.ready;
    })().catch(() => false);
  }
  if (onReady) loading.then(ok => { if (ok) onReady(); });
  return loading;
}

function parseFontsDat(text) {
  const lines = text.split(/\r?\n/).map(l => l.replace(/#.*/, '').trim());
  let id = 0;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!l) continue;
    if (l.startsWith('[FONT_ID]')) {
      id = parseInt(nextValue(), 10) || 0;
      fonts.data[id] = fonts.data[id] || { prop: new Uint8Array(208), unprop: 20, space: 10 };
    } else if (l.startsWith('[PROP]')) {
      const d = fonts.data[id] || (fonts.data[id] = { prop: new Uint8Array(208), unprop: 20, space: 10 });
      let n = 0;
      while (n < 208 && i + 1 < lines.length) {
        const row = lines[++i];
        if (!row) continue;
        for (const v of row.split(/\s+/)) if (n < 208 && v !== '') d.prop[n++] = parseInt(v, 10) || 0;
      }
    } else if (l.startsWith('[UNPROP]')) {
      if (fonts.data[id]) fonts.data[id].unprop = parseInt(nextValue(), 10) || 20;
    } else if (l.startsWith('[REPLACEMENT_SPACE_CHAR]')) {
      if (fonts.data[id]) fonts.data[id].space = parseInt(nextValue(), 10) || 10;
    }
    function nextValue() { while (i + 1 < lines.length && !lines[i + 1]) i++; return lines[++i] || ''; }
  }
}

// Fonte do SA-MP (0 a 3) -> textura (0 = font2, 1 = font1) e sub-fonte do CFont::SetFontStyle
function fontStyle(font) {
  switch (font) {
    case 0: return { tex: 0, sub: 0 };   // FONT_GOTHIC
    case 2: return { tex: 0, sub: 2 };   // FONT_MENU
    case 3: return { tex: 1, sub: 1 };   // FONT_PRICEDOWN
    default: return { tex: 1, sub: 0 };  // FONT_SUBTITLES
  }
}

// CFont::FindSubFontCharacter
function subFontChar(id, sub) {
  if (sub === 1) {
    switch (id) {
      case 1: return 208; case 4: return 93; case 7: return 206;
      case 8: case 9: return id + 86; case 14: return 207; case 26: return 154;
    }
  }
  if (id === 6) return 10;
  if (id >= 16 && id <= 25) return (id - 128) & 0xFF;
  if (id === 31) return 91;
  if (id >= 33 && id <= 58) return id + 122;
  if (id === 62) return 32;
  if (id >= 65 && id <= 90) return id + 90;
  if (id >= 96 && id <= 118) return id + 85;
  if (id >= 119 && id <= 140) return id + 62;
  if (id >= 141 && id <= 142) return 204;
  if (id === 143) return 205;
  return id;
}

const CP1252 = { '€': 0x80, '‚': 0x82, 'ƒ': 0x83, '„': 0x84, '…': 0x85, '†': 0x86, '‡': 0x87, 'ˆ': 0x88, '‰': 0x89, 'Š': 0x8A, '‹': 0x8B, 'Œ': 0x8C, 'Ž': 0x8E, '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95, '–': 0x96, '—': 0x97, '˜': 0x98, '™': 0x99, 'š': 0x9A, '›': 0x9B, 'œ': 0x9C, 'ž': 0x9E, 'Ÿ': 0x9F };

// Índice da letra no CFont (caractere - 0x20); '_' vira espaço como no jogo
function letterId(ch, sub) {
  let code = ch.charCodeAt(0);
  if (code > 255) code = CP1252[ch] ?? 0x3F;
  let id = (code - 0x20) & 0xFF;
  if (id === 63) return 0;
  if (sub) return subFontChar(id, sub);
  if (id === 145) return 64;
  if (id > 155) return 0;
  return id;
}

function rgba(num) {
  const v = Number(num) >>> 0;
  return [(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255];
}

// Os mesmos valores que vão para TextDrawCreate / LetterSize / TextSize, em pixels da tela de referência
function screenParams(td) {
  const letterX = Number(td.letterSizeX) || 0, letterY = Number(td.letterSizeY) || 0;
  return {
    x: (Number(td.x) || 0) * UX, y: (Number(td.y) || 0) * UY,
    sx: letterX * UX, sy: letterY * UY * 0.5,
    sizeX: (Number(td.textSizeX) || 0) * UX, sizeY: (Number(td.textSizeY) || 0) * UX,
  };
}

// Quebra o texto em linhas (tags ~n~, cores e largura máxima do alinhamento), como o CFont
export function layoutTextDraw(td) {
  const p = screenParams(td);
  const align = td.align ?? td.alignment ?? 1;
  const { tex, sub } = fontStyle(td.font | 0);
  const data = fonts.data[tex];
  const outline = td.outline | 0;
  const prop = td.proportional !== 0 && td.proportional !== false;
  const charW = (id) => ((data ? (prop ? data.prop[id] : data.unprop) : (tex ? 20 : 27)) + outline) * p.sx;

  const base = rgba(td.color ?? 0xFFFFFFFF);
  let color = base.slice();
  const lines = [];
  let cur = { glyphs: [], width: 0 };
  let word = [], wordW = 0, pendingSpace = 0;
  const maxW = align === 2 ? p.sizeY : (align === 3 ? p.x - p.sizeX : p.sizeX - p.x);

  const flushWord = () => {
    if (!word.length) return;
    if (cur.glyphs.length && cur.width + pendingSpace + wordW > maxW) {
      lines.push(cur);
      cur = { glyphs: [], width: 0 };
      pendingSpace = 0;
    }
    cur.width += pendingSpace;
    for (const g of word) { g.x += cur.width; cur.glyphs.push(g); }
    cur.width += wordW;
    word = []; wordW = 0; pendingSpace = 0;
  };

  const text = String(td.text ?? '').replace(/\r?\n/g, '~n~');
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '~') {
      const end = text.indexOf('~', i + 1);
      if (end === -1) break;
      const tag = text.slice(i + 1, end);
      const t = tag[0] || '';
      if (t === 'n' || t === 'N') { flushWord(); lines.push(cur); cur = { glyphs: [], width: 0 }; pendingSpace = 0; }
      else if (t === 'h' || t === 'H') color = [Math.min(255, color[0] * 1.5 | 0), Math.min(255, color[1] * 1.5 | 0), Math.min(255, color[2] * 1.5 | 0), color[3]];
      else if (TAG_COLORS[t.toLowerCase()] && !(t === 'L')) color = [...TAG_COLORS[t.toLowerCase()], base[3]];
      i = end;
      continue;
    }
    const id = letterId(ch, sub);
    const w = charW(id);
    if (ch === ' ' || id === 0) {
      flushWord();
      pendingSpace += w;
      continue;
    }
    word.push({ id, x: wordW, color: color.slice() });
    wordW += w;
  }
  flushWord();
  lines.push(cur);

  const lineH = 18 * p.sy;                 // CFont::GetHeight
  const out = lines.map((l, idx) => {
    let lx = p.x;
    if (align === 2) lx = p.x - l.width / 2;
    else if (align === 3) lx = p.x - l.width;
    return { x: lx, y: p.y + idx * lineH, width: l.width, glyphs: l.glyphs };
  });

  // CFont::GetTextRect (caixa com 4 px de margem). No cliente SA-MP 0.3.7 a caixa alinhada à direita
  // ignora o TextSize e vai sempre da borda esquerda da tela até 4 px depois do x (medido no jogo).
  let box = null;
  if (td.useBox) {
    let left, right;
    if (align === 2) { left = p.x - (p.sizeY / 2 + 4); right = p.x + p.sizeY / 2 + 4; }
    else if (align === 3) { left = -4; right = p.x + 4; }
    else { left = p.x - 4; right = p.sizeX + 4; }
    box = { left, top: p.y - 4, right, bottom: p.y + 4 + lineH * out.length };
  }

  const textLeft = Math.min(...out.map(l => l.x));
  const textRight = Math.max(...out.map(l => l.x + l.width));
  const textRect = { left: textLeft, top: p.y, right: Math.max(textRight, textLeft), bottom: p.y + lineH * (out.length - 1) + 20 * p.sy };
  return { lines: out, box, textRect, sx: p.sx, sy: p.sy, tex, outline, shadow: td.shadow | 0, align };
}

// Retângulo ocupado (unidades 640x448) para seleção e arrasto
export function textDrawRect(td) {
  const lay = layoutTextDraw(td);
  const r = lay.box || lay.textRect;
  const x = r.left / UX, y = r.top / UY;
  return { x, y, w: Math.max(4, (r.right - r.left) / UX), h: Math.max(4, (r.bottom - r.top) / UY) };
}

// Largura do texto em unidades 640 (para criar a caixa automaticamente)
export function textDrawTextWidth(td) {
  const lay = layoutTextDraw({ ...td, useBox: 0, textSizeX: 100000, textSizeY: 100000, align: 1, x: 0 });
  return Math.max(...lay.lines.map(l => l.width)) / UX;
}

function tinted(tex, r, g, b) {
  const at = fonts.atlas[tex];
  const key = `${r},${g},${b}`;
  let c = at.tinted.get(key);
  if (!c) {
    c = document.createElement('canvas');
    c.width = at.canvas.width; c.height = at.canvas.height;
    const x = c.getContext('2d');
    x.drawImage(at.canvas, 0, 0);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = `rgb(${r},${g},${b})`;
    x.fillRect(0, 0, c.width, c.height);
    if (at.tinted.size > 48) at.tinted.clear();
    at.tinted.set(key, c);
  }
  return c;
}

function drawGlyphs(ctx, lay, dx, dy, forceColor) {
  const cellW = fonts.atlas[lay.tex].canvas.width / 16;
  const cellH = cellW * 1.25;              // 16 colunas de 32x40 px (12,8 linhas)
  for (const line of lay.lines) {
    for (const g of line.glyphs) {
      const col = forceColor || g.color;
      if (col[3] === 0) continue;
      const big = g.id >= 0xC0;
      const srcH = big ? cellW : cellH;
      const dstH = (big ? 16 : 20) * lay.sy;
      ctx.globalAlpha = col[3] / 255;
      ctx.drawImage(tinted(lay.tex, col[0], col[1], col[2]),
        (g.id & 15) * cellW, (g.id >> 4) * cellH, cellW, srcH,
        line.x + g.x + dx, line.y + dy, 32 * lay.sx, dstH);
    }
  }
  ctx.globalAlpha = 1;
}

// Desenha a TextDraw de texto (fontes 0 a 3) em pixels da tela de referência
export function drawTextDraw(ctx, td) {
  const lay = layoutTextDraw(td);
  if (lay.box) {
    const c = rgba(td.boxColor ?? 0x00000080);
    ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${c[3] / 255})`;
    ctx.fillRect(lay.box.left, lay.box.top, lay.box.right - lay.box.left, lay.box.bottom - lay.box.top);
  }
  if (!fonts.ready) { drawFallback(ctx, td, lay); return lay; }
  const bg = rgba(td.backgroundColor ?? 0x000000FF);
  if (lay.outline > 0) {
    const o = lay.outline * lay.sx;
    for (const [ox, oy] of [[-o, -o], [0, -o], [o, -o], [-o, 0], [o, 0], [-o, o], [0, o], [o, o]]) drawGlyphs(ctx, lay, ox, oy, bg);
  } else if (lay.shadow > 0) {
    drawGlyphs(ctx, lay, lay.shadow * UX, lay.shadow * UY, bg);
  }
  drawGlyphs(ctx, lay, 0, 0, null);
  return lay;
}

// Sem os arquivos de fonte do jogo: mesma posição e tamanho, com uma fonte do sistema
function drawFallback(ctx, td, lay) {
  ctx.save();
  ctx.textBaseline = 'top';
  ctx.font = `bold ${Math.max(6, 16 * lay.sy)}px sans-serif`;
  for (const line of lay.lines) {
    for (const g of line.glyphs) {
      const ch = String.fromCharCode(Math.min(255, (g.id + 0x20) & 0xFF));
      ctx.fillStyle = `rgba(${g.color[0]},${g.color[1]},${g.color[2]},${g.color[3] / 255})`;
      ctx.fillText(ch, line.x + g.x, line.y + 2 * lay.sy);
    }
  }
  ctx.restore();
}
