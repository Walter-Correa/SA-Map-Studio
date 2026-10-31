// Texture worker (background, without freezing the editor).
//  - "index": reads all the TXDs, lists each one's textures and already generates and saves to disk
//    the thumbnail of those that do not have one yet (so the Textures tab opens fast afterwards)
//  - "thumb": generates a texture's thumbnail (and, while at it, the others in the same TXD)
import { parseTxd, decodeToRGBA, textureHasAlpha } from '../formats/txd.js';

let base = '/gta/';
let cancelled = false;
let have = new Set();          // "txd/name" with a thumbnail on disk
const txdCache = new Map();    // last TXDs read (for thumbnails)
const SIZE = 64;

async function readEntry(e) {
  if (!e.size && /\.img$/i.test(e.img)) throw new Error('entrada vazia');
  if (!e.size) return (await fetch(base + e.img.split('/').map(encodeURIComponent).join('/'))).arrayBuffer();
  const url = base + e.img.split('/').map(encodeURIComponent).join('/');
  const res = await fetch(url, { headers: { Range: `bytes=${e.offset}-${e.offset + e.size - 1}` } });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.arrayBuffer();
}

const canvas = new OffscreenCanvas(SIZE, SIZE);
const ctx = canvas.getContext('2d');

async function makeThumb(t) {
  // Lowest mip level that is still at least the thumbnail size
  let level = 0;
  while (level + 1 < t.mips.length && t.mips[level + 1].width >= SIZE && t.mips[level + 1].height >= SIZE) level++;
  const mip = t.mips[level];
  const rgba = decodeToRGBA(t, level);
  const img = new ImageData(new Uint8ClampedArray(rgba.buffer, rgba.byteOffset, mip.width * mip.height * 4), mip.width, mip.height);
  const bmp = await createImageBitmap(img);
  for (let y = 0; y < SIZE; y += 8) for (let x = 0; x < SIZE; x += 8) {
    ctx.fillStyle = ((x + y) / 8) % 2 ? '#3a444e' : '#2b333b';
    ctx.fillRect(x, y, 8, 8);
  }
  ctx.drawImage(bmp, 0, 0, SIZE, SIZE);
  bmp.close();
  return canvas.convertToBlob({ type: 'image/webp', quality: 0.85 });
}

function saveThumb(txd, name, blob) {
  const key = txd + '/' + name;
  have.add(key);
  return fetch('/api/thumbs/tex/' + encodeURIComponent(txd) + '/' + encodeURIComponent(name), { method: 'POST', body: blob }).catch(() => {});
}

async function runIndex(entries, withThumbs) {
  cancelled = false;
  const out = [];
  let done = 0, i = 0;
  const total = entries.length;
  const worker = async () => {
    while (i < entries.length && !cancelled) {
      const e = entries[i++];
      try {
        const texs = parseTxd(await readEntry(e));
        out.push({ txd: e.name, tex: texs.map(t => [t.name, t.width, t.height, textureHasAlpha(t) ? 1 : 0]) });
        if (withThumbs) {
          for (const t of texs) {
            if (cancelled) break;
            if (have.has(e.name + '/' + t.name)) continue;
            try { await saveThumb(e.name, t.name, await makeThumb(t)); } catch { /* unreadable texture */ }
          }
        }
      } catch { /* unreadable TXD: skips */ }
      done++;
      if (done % 10 === 0 || done === total) postMessage({ type: 'progress', done, total });
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  if (cancelled) { postMessage({ type: 'cancelled' }); return; }
  postMessage({ type: 'done', data: out });
}

async function thumbFor(msg) {
  const key = msg.entry.img + ':' + msg.entry.offset;
  let texs = txdCache.get(key);
  if (!texs) {
    texs = parseTxd(await readEntry(msg.entry));
    txdCache.set(key, texs);
    if (txdCache.size > 24) txdCache.delete(txdCache.keys().next().value);
  }
  const t = texs.find(x => x.name === msg.tex);
  if (!t) return null;
  const blob = await makeThumb(t);
  saveThumb(msg.txd, msg.tex, blob);
  return blob;
}

// The texture at its best resolution (up to 512 px) as PNG, for the hover preview of the Textures tab
async function largeFor(msg) {
  const key = msg.entry.img + ':' + msg.entry.offset;
  let texs = txdCache.get(key);
  if (!texs) {
    texs = parseTxd(await readEntry(msg.entry));
    txdCache.set(key, texs);
    if (txdCache.size > 24) txdCache.delete(txdCache.keys().next().value);
  }
  const t = texs.find(x => x.name === msg.tex);
  if (!t) return null;
  let level = 0;
  while (level + 1 < t.mips.length && t.mips[level].width > 512) level++;
  const mip = t.mips[level];
  const rgba = decodeToRGBA(t, level);
  const c = new OffscreenCanvas(mip.width, mip.height);
  c.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(rgba.buffer, rgba.byteOffset, mip.width * mip.height * 4), mip.width, mip.height), 0, 0);
  return c.convertToBlob({ type: 'image/png' });
}

// ---------------------------------------------------------------- images made from the game files
// The sprites of the TextDraw editor and the radar icons are not shipped with the editor: the first time it opens with a GTA
// folder they are drawn from the game's TXDs and saved (POST /api/assets/...), then they are served from /cache like any other.
const SPRITE_MAX = 256;
// Radar icon (SetPlayerMapIcon type) -> texture of hud.txd. 0 and 1 are plain squares, drawn here.
const MAPICON_TEXTURE = {
  2: 'radar_centre', 3: 'arrow', 4: 'radar_north', 5: 'radar_airyard', 6: 'radar_ammugun', 7: 'radar_barbers', 8: 'radar_bigsmoke',
  9: 'radar_boatyard', 10: 'radar_burgershot', 11: 'radar_bulldozer', 12: 'radar_catalinapink', 13: 'radar_cesarviapando',
  14: 'radar_chicken', 15: 'radar_cj', 16: 'radar_crash1', 17: 'radar_diner', 18: 'radar_emmetgun', 19: 'radar_enemyattack',
  20: 'radar_fire', 21: 'radar_girlfriend', 22: 'radar_hostpital', 23: 'radar_locosyndicate', 24: 'radar_maddog',
  25: 'radar_mafiacasino', 26: 'radar_mcstrap', 27: 'radar_modgarage', 28: 'radar_ogloc', 29: 'radar_pizza', 30: 'radar_police',
  31: 'radar_propertyg', 32: 'radar_propertyr', 33: 'radar_race', 34: 'radar_ryder', 35: 'radar_savegame', 36: 'radar_school',
  37: 'radar_qmark', 38: 'radar_sweet', 39: 'radar_tattoo', 40: 'radar_thetruth', 41: 'radar_waypoint', 42: 'radar_toreno',
  43: 'radar_triads', 44: 'radar_triadscasino', 45: 'radar_tshirt', 46: 'radar_woozie', 47: 'radar_zero', 48: 'radar_datedisco',
  49: 'radar_datedrink', 50: 'radar_datefood', 51: 'radar_truck', 52: 'radar_cash', 53: 'radar_flag', 54: 'radar_gym',
  55: 'radar_impound', 56: 'radar_light', 57: 'radar_runway', 58: 'radar_gangb', 59: 'radar_gangp', 60: 'radar_gangy',
  61: 'radar_gangn', 62: 'radar_gangg', 63: 'radar_spray',
};

const txdFiles = new Map();    // lib -> textures (null: the game has no such file)

async function libTextures(lib) {
  const key = lib.toLowerCase();
  if (txdFiles.has(key)) return txdFiles.get(key);
  let texs = null;
  // Where each TXD is: the loading screens, intro and menu ones in models/txd, the HUD and fonts in models, SA-MP's own in SAMP
  // (the likeliest place first, so the server does not log a "not found" for every attempt)
  const where = ['models/', 'models/txd/', 'SAMP/'];
  if (/^(fonts|hud)$/i.test(lib)) where.splice(0, 3, 'models/', 'models/txd/', 'SAMP/');
  else if (/^samaps$/i.test(lib)) where.splice(0, 3, 'SAMP/', 'models/txd/', 'models/');
  else where.splice(0, 3, 'models/txd/', 'models/', 'SAMP/');
  for (const rel of where.map(dir => dir + lib + '.txd')) {
    try {
      const res = await fetch(base + rel.split('/').map(encodeURIComponent).join('/'));
      if (res.ok) { texs = parseTxd(await res.arrayBuffer()); break; }
    } catch { /* tries the next place */ }
  }
  txdFiles.set(key, texs);
  return texs;
}

function postAsset(rel, blob) {
  return fetch('/api/assets/' + rel.split('/').map(encodeURIComponent).join('/'), { method: 'POST', body: blob }).then(r => r.ok).catch(() => false);
}

// The texture drawn at the largest size that fits in `max` pixels, as an OffscreenCanvas
function textureCanvas(t, max) {
  let level = 0;
  while (level + 1 < t.mips.length && Math.max(t.mips[level].width, t.mips[level].height) > max) level++;
  const mip = t.mips[level];
  const rgba = decodeToRGBA(t, level);
  const full = new OffscreenCanvas(mip.width, mip.height);
  full.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(rgba.buffer, rgba.byteOffset, mip.width * mip.height * 4), mip.width, mip.height), 0, 0);
  const k = Math.min(1, max / Math.max(mip.width, mip.height));
  if (k === 1) return full;
  const out = new OffscreenCanvas(Math.max(1, Math.round(mip.width * k)), Math.max(1, Math.round(mip.height * k)));
  const c = out.getContext('2d');
  c.imageSmoothingQuality = 'high';
  c.drawImage(full, 0, 0, out.width, out.height);
  return out;
}

// Halves the size step by step until `size`, so the reduction averages the pixels instead of skipping them
function shrinkTo(source, size) {
  let cur = source;
  while (cur.width > size) {
    const w = Math.max(size, cur.width >> 1);
    const next = new OffscreenCanvas(w, w);
    const c = next.getContext('2d');
    c.imageSmoothingQuality = 'high';
    c.drawImage(cur, 0, 0, w, w);
    cur = next;
  }
  return cur;
}

function squareIcon(fill) {
  const c = new OffscreenCanvas(16, 16);
  const g = c.getContext('2d');
  if (fill) { g.fillStyle = '#000'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#ff0'; g.fillRect(1, 1, 14, 14); }
  else { g.fillStyle = '#fff'; g.fillRect(0, 0, 16, 16); }
  return c;
}

async function runAssets(msg) {
  cancelled = false;
  const sprites = msg.sprites || [], icons = msg.mapicons || [];
  const total = sprites.length + icons.length;
  let done = 0, saved = 0;
  const tick = () => { if (++done % 8 === 0 || done === total) postMessage({ type: 'assets-progress', done, total }); };
  // The sprites of each TXD together: the file is read and decoded once
  const byLib = new Map();
  for (const sp of sprites) {
    if (!byLib.has(sp.lib)) byLib.set(sp.lib, []);
    byLib.get(sp.lib).push(sp);
  }
  for (const [lib, list] of byLib) {
    if (cancelled) break;
    const texs = await libTextures(lib);
    for (const sp of list) {
      try {
        const t = texs && texs.find(x => x.name.toLowerCase() === sp.name.toLowerCase());
        let canvas = t && textureCanvas(t, SPRITE_MAX);
        // The splash screens are wide, but their sprites have always been square (the picture stretched)
        if (canvas && /^splash/i.test(lib) && canvas.width !== canvas.height) {
          const sq = new OffscreenCanvas(SPRITE_MAX, SPRITE_MAX);
          const c = sq.getContext('2d');
          c.imageSmoothingQuality = 'high';
          c.drawImage(canvas, 0, 0, SPRITE_MAX, SPRITE_MAX);
          canvas = sq;
        }
        if (canvas && await postAsset(sp.path, await canvas.convertToBlob({ type: 'image/png' }))) saved++;
      } catch { /* unreadable texture */ }
      tick();
    }
  }
  const hud = icons.some(i => MAPICON_TEXTURE[i]) ? await libTextures('hud') : null;
  for (const id of icons) {
    if (cancelled) break;
    try {
      let canvas = null;
      if (id === 0 || id === 1) canvas = squareIcon(id === 0);
      else {
        const t = hud && hud.find(x => x.name.toLowerCase() === MAPICON_TEXTURE[id]);
        if (t) canvas = shrinkTo(textureCanvas(t, 64), 16);
      }
      if (canvas && await postAsset('mapicons/icon' + id + '.png', await canvas.convertToBlob({ type: 'image/png' }))) saved++;
    } catch { /* unreadable texture */ }
    tick();
  }
  postMessage({ type: 'assets-done', saved, total, cancelled });
}

onmessage = async (ev) => {
  const msg = ev.data;
  if (msg.base) base = msg.base;
  if (msg.have) have = new Set(msg.have);
  if (msg.type === 'index') runIndex(msg.entries, msg.thumbs !== false);
  else if (msg.type === 'assets') runAssets(msg);
  else if (msg.type === 'cancel') cancelled = true;
  else if (msg.type === 'txdthumbs') {
    // Generates and saves the missing thumbnails of a whole TXD
    const names = [];
    try {
      const skip = new Set(msg.skip || []);
      const texs = parseTxd(await readEntry(msg.entry));
      for (const t of texs) {
        if (skip.has(t.name) || have.has(msg.txd + '/' + t.name)) continue;
        try { await saveThumb(msg.txd, t.name, await makeThumb(t)); names.push(t.name); } catch { /* unreadable texture */ }
      }
    } catch { /* unreadable TXD */ }
    postMessage({ type: 'txdthumbs', id: msg.id, txd: msg.txd, names });
  }
  else if (msg.type === 'large') {
    let blob = null;
    try { blob = await largeFor(msg); } catch { blob = null; }
    postMessage({ type: 'large', id: msg.id, blob });
  }
  else if (msg.type === 'thumb') {
    let blob = null;
    try { blob = await thumbFor(msg); } catch { blob = null; }
    postMessage({ type: 'thumb', id: msg.id, blob });
  }
};
