// TextDraw rendering identical to GTA SA / SA-MP: reads data/fonts.dat and models/fonts.txd from the game folder
// and reproduces CFont's calculations (letter width, line wrapping, alignment and box).
// Everything is computed in pixels of a reference screen and also returned in SA-MP 640x448 units.
import { parseTxd, decodeToRGBA } from '../formats/txd.js';

export const TD_SCREEN = { w: 1920, h: 1080 };   // preview reference resolution (16:9)
export const TD_WIDTH = 640, TD_HEIGHT = 448;   // TextDraw coordinate space in SA-MP
const UX = TD_SCREEN.w / TD_WIDTH, UY = TD_SCREEN.h / TD_HEIGHT;

// Colors of the ~x~ tags (the game's HudColours)
const TAG_COLORS = {
  r: [180, 25, 29], g: [54, 104, 44], b: [50, 60, 127], w: [225, 225, 225], s: [225, 225, 225],
  y: [226, 192, 99], p: [168, 110, 252], l: [0, 0, 0],
};

const fonts = { ready: false, data: [null, null], atlas: [null, null] };
let loading = null;

export function gtaFontsReady() { return fonts.ready; }

// Loads the game fonts once; onReady is called when they are ready (to redraw)
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

// SA-MP font (0 to 3) -> texture (0 = font2, 1 = font1) and CFont::SetFontStyle sub-font
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

// Letter index in CFont (character - 0x20); '_' becomes a space as in the game
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

// The same values that go to TextDrawCreate / LetterSize / TextSize, in reference screen pixels
function screenParams(td) {
  const letterX = Number(td.letterSizeX) || 0, letterY = Number(td.letterSizeY) || 0;
  return {
    x: (Number(td.x) || 0) * UX, y: (Number(td.y) || 0) * UY,
    sx: letterX * UX, sy: letterY * UY * 0.5,
    sizeX: (Number(td.textSizeX) || 0) * UX, sizeY: (Number(td.textSizeY) || 0) * UX,
  };
}

// Breaks the text into lines (~n~ tags, colors and maximum alignment width), like CFont
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

  // CFont::GetTextRect (box with a 4 px margin). In the SA-MP 0.3.7 client the right-aligned box
  // ignores TextSize and always goes from the left edge of the screen to 4 px after x (measured in game).
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

// Occupied rectangle (640x448 units) for selection and dragging
export function textDrawRect(td) {
  if (td.type === 'progress') {
    return { x: +td.x || 0, y: +td.y || 0, w: Math.max(4, +td.pbWidth || 0), h: Math.max(4, +td.pbHeight || 0) };
  }
  const lay = layoutTextDraw(td);
  const r = lay.box || lay.textRect;
  // Inverted boxes (TextSize before x or negative height) also count, as in the game
  const left = Math.min(r.left, r.right), right = Math.max(r.left, r.right);
  const top = Math.min(r.top, r.bottom), bottom = Math.max(r.top, r.bottom);
  return { x: left / UX, y: top / UY, w: Math.max(4, (right - left) / UX), h: Math.max(4, (bottom - top) / UY) };
}

// Progress bar (SA Progress Bar Pro, progressbarpro.inc): the same 3 LD_SPAC:white sprites the include creates,
// in 640x448 units: background, track inside the border and the filled part according to value and direction.
// Border: pbBorder horizontally and 1.25 times that vertically (1 unit is 3.00 px x 2.41 px at 1920x1080),
// limited as in the include (0.5 to 5). blinkOn: lit phase of the blink (blink color or interior off;
// the border switches to pbBlinkBorderColor if there is one).
export const PB_BORDER_Y_RATIO = 1.25;
// Include styles: 0 bar, 1 segment ring, 2 circle that grows from the center
export const PB_STYLES = ['PB_STYLE_BAR', 'PB_STYLE_RING', 'PB_STYLE_CIRCLE'];

// Ring (PB_STYLE_RING), same as PB_RenderRing in the include: border points and segments around the
// box center, starting at the top; the segment size comes from the ring size and the count
function ringParts(bar, blinkOn) {
  const x = +bar.x || 0, y = +bar.y || 0;
  const w = Math.max(0, +bar.pbWidth || 0), h = Math.max(0, +bar.pbHeight || 0);
  const n = Math.max(4, Math.min(60, (bar.pbSegments | 0) || 24));
  const max = +bar.pbMax || 0;
  const v = Math.max(0, Math.min(max, +bar.pbValue || 0));
  const base = Number(bar.color ?? 0xFF1C1CFF) >>> 0;
  const blinking = Boolean(bar.pbBlink) && blinkOn;
  const blinkColor = Number(bar.pbBlinkColor || 0) >>> 0;
  const c = blinking && blinkColor ? blinkColor : base;
  const dim = ((c & 0xFFFFFF00) | (0x66 & Math.floor((c & 0xFF) / 2))) >>> 0;
  const blinkBorder = Number(bar.pbBlinkBorderColor || 0) >>> 0;
  const borderColor = blinking && blinkBorder ? blinkBorder : ((Number(bar.pbBorderColor || 0) >>> 0) || (base & 0xFF));
  const nb = Number(bar.pbBorder ?? 1);
  const bx = Number.isFinite(nb) ? Math.max(0.5, Math.min(5, nb)) : 1, by = bx * PB_BORDER_Y_RATIO;
  const rx = w / 2, ry = h / 2, cx = x + rx, cy = y + ry;
  const r = Math.min(rx, ry / PB_BORDER_Y_RATIO);
  const dx = Math.max(0.5, 1.4 * Math.PI * (r - bx) / (n + 0.7 * Math.PI)), dy = dx * PB_BORDER_Y_RATIO;
  const px = Math.max(0, rx - dx / 2 - bx), py = Math.max(0, ry - dy / 2 - by);
  const dir = bar.pbDir | 0;
  const step = (dir === 1 || dir === 2 ? -1 : 1) * 360 / n;
  const part = max > 0 ? Math.min(1, v / max) : 0;
  const lit = part > 0 ? Math.floor(part * n + 0.0001) : 0;
  const hidden = blinking && !blinkColor;
  const centers = Array.from({ length: n }, (_, i) => {
    const a = (-90 + step * i) * Math.PI / 180;
    return [cx + px * Math.cos(a), cy + py * Math.sin(a)];
  });
  const parts = centers.map(([ex, ey]) => ({ shape: 'circle', x: ex - dx / 2 - bx, y: ey - dy / 2 - by, w: dx + bx * 2, h: dy + by * 2, color: borderColor }));
  if (!hidden) centers.forEach(([ex, ey], i) => parts.push({ shape: 'circle', x: ex - dx / 2, y: ey - dy / 2, w: dx, h: dy, color: i < lit ? c : dim }));
  return parts;
}

export function progressBarParts(bar, blinkOn = false) {
  if ((bar.pbStyle | 0) === 1) return ringParts(bar, blinkOn);
  const shape = (bar.pbStyle | 0) === 2 ? 'circle' : 'rect';
  const x = +bar.x || 0, y = +bar.y || 0;
  const w = Math.max(0, +bar.pbWidth || 0), h = Math.max(0, +bar.pbHeight || 0);
  const max = +bar.pbMax || 0;
  const v = Math.max(0, Math.min(max, +bar.pbValue || 0));
  const base = Number(bar.color ?? 0xFF1C1CFF) >>> 0;
  const alpha = base & 0xFF;
  const blinking = Boolean(bar.pbBlink) && blinkOn;
  const blinkColor = Number(bar.pbBlinkColor || 0) >>> 0;
  const c = blinking && blinkColor ? blinkColor : base;
  const fillColor = ((c & 0xFFFFFF00) | (0x66 & Math.floor((c & 0xFF) / 2))) >>> 0;
  // Border limited as in the include: from 0.5 to 5, never larger than what fits (1 unit of interior left over)
  // and never smaller than the minimum
  const n = Number(bar.pbBorder ?? 1);
  const fit = Math.max(0.5, Math.min((w - 1) / 2, (h - 1) / (2 * PB_BORDER_Y_RATIO)));
  const bx = Math.min(Number.isFinite(n) ? Math.max(0.5, Math.min(5, n)) : 1, fit), by = bx * PB_BORDER_Y_RATIO;
  const ix = x + bx, iy = y + by;
  const iw = Math.max(0, w - bx * 2), ih = Math.max(0, h - by * 2);
  const blinkBorder = Number(bar.pbBlinkBorderColor || 0) >>> 0;
  const borderColor = blinking && blinkBorder ? blinkBorder : ((Number(bar.pbBorderColor || 0) >>> 0) || alpha);
  const parts = [{ shape, x, y, w, h, color: borderColor }];
  if (blinking && !blinkColor) return parts; // no color: the interior goes off
  parts.push({ shape, x: ix, y: iy, w: iw, h: ih, color: fillColor });
  const part = max > 0 ? Math.min(1, v / max) : 0;
  if (part > 0 && iw > 0 && ih > 0 && shape === 'circle') {
    // Circle: grows from the center
    parts.push({ shape, x: ix + iw * (1 - part) / 2, y: iy + ih * (1 - part) / 2, w: iw * part, h: ih * part, color: c });
  } else if (part > 0 && iw > 0 && ih > 0) {
    const m = { shape, x: ix, y: iy, w: iw, h: ih, color: c };
    switch (bar.pbDir | 0) {
      case 1: m.x += iw * (1 - part); m.w = iw * part; break; // esquerda
      case 2: m.y += ih * (1 - part); m.h = ih * part; break; // upward
      case 3: m.h = ih * part; break;                         // downward
      default: m.w = iw * part;                               // direita
    }
    parts.push(m);
  }
  return parts;
}

// Draws the bar in the preview (canvas at the TD_SCREEN reference resolution) with the Direct3D 9
// pixel rule used by the game: a pixel is painted if its center (integer coordinate) falls inside the
// rectangle, that is, from ceil(start) to ceil(end) - 1. This way the borders have the same pixels as the game.
export function drawProgressBar(ctx, bar, blinkOn = false) {
  for (const r of progressBarParts(bar, blinkOn)) {
    const c = rgba(r.color);
    if (r.shape === 'circle') {
      // Round shapes (LD_BEAT:chit sprite): ellipse with the same size as the sprite's circle
      if (r.w <= 0 || r.h <= 0) continue;
      ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${c[3] / 255})`;
      ctx.beginPath();
      ctx.ellipse((r.x + r.w / 2) * UX, (r.y + r.h / 2) * UY, r.w / 2 * UX, r.h / 2 * UY, 0, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }
    const x0 = Math.ceil(r.x * UX), x1 = Math.ceil((r.x + r.w) * UX);
    const y0 = Math.ceil(r.y * UY), y1 = Math.ceil((r.y + r.h) * UY);
    if (x1 <= x0 || y1 <= y0) continue;
    ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${c[3] / 255})`;
    ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  }
}

// Text width in 640 units (to create the box automatically)
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
  const cellH = cellW * 1.25;              // 16 columns of 32x40 px (12.8 rows)
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

// Draws the text TextDraw (fonts 0 to 3) in reference screen pixels
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

// Without the game font files: same position and size, with a system font
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
