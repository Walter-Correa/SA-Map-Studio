// Trocas de material do SA-MP / open.mp, no mesmo formato das funções do jogo:
//
//   SetObjectMaterial(objectid, materialindex, modelid, txdname[], texturename[], materialcolor = 0)
//   SetObjectMaterialText(objectid, text[], materialindex = 0, materialsize = OBJECT_MATERIAL_SIZE_256x128,
//                         fontface[] = "Arial", fontsize = 24, bold = 1, fontcolor = 0xFFFFFFFF,
//                         backcolor = 0, textalignment = OBJECT_MATERIAL_TEXT_ALIGN_LEFT)
//
// No projeto cada troca é guardada assim:
//   textura: { index, model, txd, texture, color }          color = "0" ou "0xAARRGGBB"
//   texto:   { index, kind: 'text', text, size, font, fontSize, bold, fontColor, backColor, align }

export const MAX_MATERIAL_INDEX = 15; // o SA-MP aceita os índices 0 a 15

export const MATERIAL_SIZES = [
  [10, '32x32'], [20, '64x32'], [30, '64x64'], [40, '128x32'], [50, '128x64'], [60, '128x128'],
  [70, '256x32'], [80, '256x64'], [90, '256x128'], [100, '256x256'], [110, '512x64'], [120, '512x128'],
  [130, '512x256'], [140, '512x512'],
];
export const SIZE_PIXELS = Object.fromEntries(MATERIAL_SIZES.map(([v, s]) => [v, s.split('x').map(Number)]));
export const SIZE_BY_NAME = Object.fromEntries(MATERIAL_SIZES.map(([v, s]) => [`OBJECT_MATERIAL_SIZE_${s.toUpperCase()}`, v]));

export const TEXT_ALIGN = [[0, 'OBJECT_MATERIAL_TEXT_ALIGN_LEFT', 'Esquerda'], [1, 'OBJECT_MATERIAL_TEXT_ALIGN_CENTER', 'Centro'], [2, 'OBJECT_MATERIAL_TEXT_ALIGN_RIGHT', 'Direita']];
export const ALIGN_BY_NAME = Object.fromEntries(TEXT_ALIGN.map(([v, n]) => [n, v]));

export const FONTS = ['Arial', 'Arial Black', 'Calibri', 'Comic Sans MS', 'Courier New', 'Georgia', 'Impact',
  'Lucida Console', 'Segoe UI', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Webdings', 'Wingdings',
  'GTAWEAPON3'];

export const TEXT_DEFAULTS = { size: 90, font: 'Arial', fontSize: 24, bold: 1, fontColor: '0xFFFFFFFF', backColor: '0', align: 0 };

// ---------------------------------------------------------------- cores ARGB
export function parseColor(v) {
  if (v === undefined || v === null || v === '') return 0;
  if (typeof v === 'number') return v >>> 0;
  const s = String(v).trim();
  const n = /^-?0x/i.test(s) ? parseInt(s.replace(/^-/, ''), 16) * (s.startsWith('-') ? -1 : 1) : parseInt(s, 10);
  return Number.isFinite(n) ? n >>> 0 : 0;
}
export function formatColor(u) {
  u = u >>> 0;
  return u === 0 ? '0' : '0x' + u.toString(16).toUpperCase().padStart(8, '0');
}
export function argbParts(v) {
  const u = parseColor(v);
  return { a: (u >>> 24) & 255, r: (u >>> 16) & 255, g: (u >>> 8) & 255, b: u & 255 };
}
export function makeArgb(a, r, g, b) {
  return formatColor((((a & 255) << 24) | ((r & 255) << 16) | ((g & 255) << 8) | (b & 255)) >>> 0);
}
export const cssColor = (v) => { const p = argbParts(v); return `rgba(${p.r},${p.g},${p.b},${(p.a / 255).toFixed(3)})`; };
export const hexRgb = (v) => { const p = argbParts(v); return '#' + [p.r, p.g, p.b].map(x => x.toString(16).padStart(2, '0')).join(''); };

// ---------------------------------------------------------------- strings do Pawn
export function decodePawnString(lit) {
  let s = String(lit ?? '').trim();
  if (s.startsWith('"')) s = s.slice(1, s.endsWith('"') && s.length > 1 ? -1 : undefined);
  return s.replace(/\\(n|t|"|\\|r|'|x[0-9a-fA-F]+;?)/g, (_, c) => {
    if (c[0] === 'x') return String.fromCharCode(parseInt(c.slice(1).replace(';', ''), 16));
    return { n: '\n', t: '\t', '"': '"', '\\': '\\', r: '', "'": "'" }[c];
  });
}
export function encodePawnString(text) {
  return '"' + String(text ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r?\n/g, '\\n') + '"';
}

function splitTop(s) {
  const out = []; let cur = '', str = false, depth = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (str) { cur += ch; if (ch === '\\') cur += s[++i] ?? ''; else if (ch === '"') str = false; continue; }
    if (ch === '"') { str = true; cur += ch; continue; }
    if (ch === '(' || ch === '{') depth++;
    if (ch === ')' || ch === '}') depth--;
    if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

export const toInt = (v, def) => {
  if (v === undefined || v === '') return def;
  const s = String(v).trim();
  if (SIZE_BY_NAME[s.toUpperCase()] !== undefined) return SIZE_BY_NAME[s.toUpperCase()];
  if (ALIGN_BY_NAME[s.toUpperCase()] !== undefined) return ALIGN_BY_NAME[s.toUpperCase()];
  if (/^(true)$/i.test(s)) return 1;
  if (/^(false)$/i.test(s)) return 0;
  const n = /^-?0x/i.test(s) ? parseInt(s, 16) : parseInt(s, 10);
  return Number.isFinite(n) ? n : def;
};

export const isText = (m) => !!m && (m.kind === 'text' || m.text !== undefined);

// Aceita os formatos antigos (com "rest" cru) e devolve sempre o formato atual
export function normalizeMaterial(m) {
  if (!m) return null;
  if (isText(m)) {
    const out = { index: m.index | 0, kind: 'text', ...TEXT_DEFAULTS };
    if (m.rest !== undefined) {
      out.text = decodePawnString(m.text);
      const a = splitTop(m.rest);
      out.size = toInt(a[0], 90);
      if (a[1] !== undefined) out.font = decodePawnString(a[1]) || 'Arial';
      out.fontSize = toInt(a[2], 24);
      out.bold = toInt(a[3], 1) ? 1 : 0;
      if (a[4] !== undefined) out.fontColor = formatColor(parseColor(a[4]));
      if (a[5] !== undefined) out.backColor = formatColor(parseColor(a[5]));
      out.align = Math.max(0, Math.min(2, toInt(a[6], 0)));
    } else {
      out.text = String(m.text ?? '');
      out.size = toInt(m.size, 90);
      out.font = m.font || 'Arial';
      out.fontSize = toInt(m.fontSize, 24);
      out.bold = toInt(m.bold, 1) ? 1 : 0;
      out.fontColor = formatColor(parseColor(m.fontColor ?? '0xFFFFFFFF'));
      out.backColor = formatColor(parseColor(m.backColor ?? 0));
      out.align = Math.max(0, Math.min(2, toInt(m.align, 0)));
    }
    if (!SIZE_PIXELS[out.size]) out.size = 90;
    out.index = Math.max(0, Math.min(MAX_MATERIAL_INDEX, out.index));
    return out;
  }
  return {
    index: Math.max(0, Math.min(MAX_MATERIAL_INDEX, m.index | 0)),
    model: m.model === undefined || m.model === null || m.model === '' ? -1 : (parseInt(m.model, 10) || 0),
    txd: String(m.txd ?? 'none'),
    texture: String(m.texture ?? 'none'),
    color: formatColor(parseColor(m.color)),
  };
}

// Verifica se a troca é a remoção da textura (deixando o índice invisível)
// Formato padrão do SA-MP / open.mp: SetObjectMaterial(obj, slot, 0, "none", "none", 0);
export const isNoneTexture = (m) => !isText(m) && (m?.model === 0 || m?.model === -1) &&
  String(m?.txd || '').toLowerCase() === 'none' && String(m?.texture || '').toLowerCase() === 'none' &&
  parseColor(m?.color) === 0;

// Troca que só muda a cor (o SA-MP aceita modelid -1 com txd/texture "none" para manter a textura original e alterar a cor)
export const keepsTexture = (m) => !isText(m) && !isNoneTexture(m) && (m?.model === -1 || /^none$/i.test(m?.texture || 'none') || /^none$/i.test(m?.txd || 'none'));

// Um material por índice: o último definido vale (igual ao jogo)
export function setMaterial(list, mat) {
  const out = (list || []).filter(m => m.index !== mat.index);
  out.push(mat);
  out.sort((a, b) => a.index - b.index);
  return out;
}

// ---------------------------------------------------------------- código Pawn
export function materialCall(m, varName = 'objectid', fn = 'SetDynamicObjectMaterial') {
  const t = normalizeMaterial(m);
  const dynamic = fn.includes('Dynamic');
  if (isText(t)) {
    const fnText = fn + 'Text';
    const rest = `${t.size}, ${encodePawnString(t.font)}, ${t.fontSize}, ${t.bold ? 1 : 0}, ${t.fontColor === '0' ? 0 : t.fontColor}, ${t.backColor === '0' ? 0 : t.backColor}, ${t.align}`;
    return dynamic
      ? `${fnText}(${varName}, ${t.index}, ${encodePawnString(t.text)}, ${rest});`
      : `${fnText}(${varName}, ${encodePawnString(t.text)}, ${t.index}, ${rest});`;
  }
  if (isNoneTexture(t)) {
    return `${fn}(${varName}, ${t.index}, 0, "none", "none", 0);`;
  }
  return `${fn}(${varName}, ${t.index}, ${t.model}, ${encodePawnString(t.txd)}, ${encodePawnString(t.texture)}, ${t.color === '0' ? 0 : t.color});`;
}

// Texto com códigos de cor {RRGGBB} -> partes [{text, color}]
export function colorSegments(text, baseColor) {
  const out = [];
  let color = baseColor;
  const re = /\{([0-9a-fA-F]{6})\}/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ text: text.slice(last, m.index), color });
    color = '#' + m[1];
    last = re.lastIndex;
  }
  if (last < text.length) out.push({ text: text.slice(last), color });
  return out;
}
