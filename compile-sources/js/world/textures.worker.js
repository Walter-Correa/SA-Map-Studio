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

onmessage = async (ev) => {
  const msg = ev.data;
  if (msg.base) base = msg.base;
  if (msg.have) have = new Set(msg.have);
  if (msg.type === 'index') runIndex(msg.entries, msg.thumbs !== false);
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
