// Small writers for the Singleplayer mod: they cut pieces out of the game's own TXD and COL files (copied byte by byte,
// so the textures stay in their original DXT format) and put them together again under another name.

const u32 = (v, at) => v.getUint32(at, true);
const asciiAt = (bytes, at, len) => {
  let s = '';
  for (let i = 0; i < len && bytes[at + i]; i++) s += String.fromCharCode(bytes[at + i]);
  return s;
};
const putAscii = (bytes, at, len, text) => {
  bytes.fill(0, at, at + len);
  for (let i = 0; i < Math.min(len - 1, text.length); i++) bytes[at + i] = text.charCodeAt(i) & 0x7f;
};

const TXD_ROOT = 0x16, TXD_NATIVE = 0x15, RW_STRUCT = 1, RW_EXTENSION = 3;
const NATIVE_NAME_AT = 12 + 12 + 8; // chunk header + struct header + platform/filter

// The textures of a TXD file: lowercase name -> the whole texture chunk (header included)
export function splitTxd(buffer) {
  const v = new DataView(buffer);
  if (buffer.byteLength < 12 || u32(v, 0) !== TXD_ROOT) throw new Error('txd');
  const version = u32(v, 8);
  const end = Math.min(buffer.byteLength, 12 + u32(v, 4));
  const natives = new Map();
  let pos = 12;
  while (pos + 12 <= end) {
    const size = u32(v, pos + 4);
    if (u32(v, pos) === TXD_NATIVE && pos + 12 + size <= buffer.byteLength) {
      const chunk = new Uint8Array(buffer, pos, 12 + size);
      natives.set(asciiAt(chunk, NATIVE_NAME_AT, 32).toLowerCase(), chunk);
    }
    pos += 12 + size;
  }
  return { version, natives };
}

// Copy of a texture chunk with another texture name
export function renameNative(chunk, name) {
  const out = chunk.slice();
  putAscii(out, NATIVE_NAME_AT, 32, name);
  return out;
}

// A TXD file made of the given texture chunks
export function buildTxd(chunks, version) {
  const body = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(12 + 16 + body + 12);
  const v = new DataView(out.buffer);
  const head = (at, type, size) => { v.setUint32(at, type, true); v.setUint32(at + 4, size, true); v.setUint32(at + 8, version, true); };
  head(0, TXD_ROOT, 16 + body + 12);
  head(12, RW_STRUCT, 4);
  v.setUint16(24, chunks.length, true);
  v.setUint16(26, 0, true);
  let at = 28;
  for (const c of chunks) { out.set(c, at); at += c.length; }
  head(at, RW_EXTENSION, 0);
  return out;
}

// COL archives hold many models, each one as: "COLx", size, name (22 bytes), model id (2 bytes), data
export function listColBlocks(buffer) {
  const v = new DataView(buffer);
  const blocks = [];
  let pos = 0;
  while (pos + 32 <= buffer.byteLength) {
    const magic = String.fromCharCode(...new Uint8Array(buffer, pos, 3));
    if (magic !== 'COL') break;
    const size = u32(v, pos + 4);
    if (size < 24 || pos + 8 + size > buffer.byteLength) break;
    blocks.push({ name: asciiAt(new Uint8Array(buffer, pos + 8, 22), 0, 22).toLowerCase(), pos, size: 8 + size });
    pos += 8 + size;
  }
  return blocks;
}

// One collision block with another name and model id
export function cloneColBlock(buffer, block, name, id) {
  const out = new Uint8Array(buffer, block.pos, block.size).slice();
  putAscii(out, 8, 22, name);
  new DataView(out.buffer).setUint16(30, id, true);
  return out;
}

// ---------------------------------------------------------------------------  tinting a texture
// Reads the first (biggest) level of a D3D9 texture chunk as RGBA. Handles DXT1/3/5, 32-bit and 8-bit palette; null for the rest.
function decodeNative(chunk) {
  const v = new DataView(chunk.buffer, chunk.byteOffset, chunk.byteLength);
  if (u32(v, 24) !== 9) return null;
  const rasterFormat = u32(v, 96), d3d = u32(v, 100);
  const width = v.getUint16(104, true), height = v.getUint16(106, true);
  const depth = chunk[108], levels = chunk[109];
  if (!width || !height || !levels) return null;
  let at = 112;
  let palette = null;
  if (rasterFormat & 0x2000) { palette = chunk.subarray(at, at + 1024); at += 1024; } else if (rasterFormat & 0x4000) return null;
  const size = u32(v, at);
  const data = chunk.subarray(at + 4, at + 4 + size);
  const out = new Uint8Array(width * height * 4);
  const cc = String.fromCharCode(d3d & 255, (d3d >> 8) & 255, (d3d >> 16) & 255, (d3d >> 24) & 255);
  if (cc === 'DXT1' || cc === 'DXT3' || cc === 'DXT5') {
    const bs = cc === 'DXT1' ? 8 : 16;
    const c565 = (c) => [((c >> 11) & 31) * 255 / 31, ((c >> 5) & 63) * 255 / 63, (c & 31) * 255 / 31];
    for (let by = 0; by < Math.ceil(height / 4); by++) {
      for (let bx = 0; bx < Math.ceil(width / 4); bx++) {
        const b = (by * Math.ceil(width / 4) + bx) * bs;
        if (b + bs > data.length) break;
        const co = b + (bs === 16 ? 8 : 0);
        const c0 = data[co] | (data[co + 1] << 8), c1 = data[co + 2] | (data[co + 3] << 8);
        const p0 = c565(c0), p1 = c565(c1);
        const pal = [[...p0, 255], [...p1, 255]];
        if (cc === 'DXT1' && c0 <= c1) {
          pal.push([(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, (p0[2] + p1[2]) / 2, 255], [0, 0, 0, 0]);
        } else {
          pal.push([(2 * p0[0] + p1[0]) / 3, (2 * p0[1] + p1[1]) / 3, (2 * p0[2] + p1[2]) / 3, 255],
            [(p0[0] + 2 * p1[0]) / 3, (p0[1] + 2 * p1[1]) / 3, (p0[2] + 2 * p1[2]) / 3, 255]);
        }
        const bits = data[co + 4] | (data[co + 5] << 8) | (data[co + 6] << 16) | (data[co + 7] << 24);
        const alpha = new Uint8Array(16);
        if (cc === 'DXT3') {
          for (let i = 0; i < 16; i++) alpha[i] = ((data[b + (i >> 1)] >> ((i & 1) * 4)) & 15) * 17;
        } else if (cc === 'DXT5') {
          const a0 = data[b], a1 = data[b + 1];
          const ap = [a0, a1];
          if (a0 > a1) for (let i = 1; i <= 6; i++) ap.push(((7 - i) * a0 + i * a1) / 7);
          else { for (let i = 1; i <= 4; i++) ap.push(((5 - i) * a0 + i * a1) / 5); ap.push(0, 255); }
          let lo = 0n;
          for (let i = 0; i < 6; i++) lo |= BigInt(data[b + 2 + i]) << BigInt(8 * i);
          for (let i = 0; i < 16; i++) alpha[i] = ap[Number((lo >> BigInt(3 * i)) & 7n)];
        }
        for (let py = 0; py < 4; py++) for (let px = 0; px < 4; px++) {
          const x = bx * 4 + px, y = by * 4 + py;
          if (x >= width || y >= height) continue;
          const i = py * 4 + px, c = pal[(bits >>> (2 * i)) & 3];
          const o = (y * width + x) * 4;
          out[o] = c[0]; out[o + 1] = c[1]; out[o + 2] = c[2];
          out[o + 3] = cc === 'DXT1' ? c[3] : alpha[i];
        }
      }
    }
    return { width, height, rgba: out, version: u32(v, 8), filter: u32(v, 28) };
  }
  if (palette && depth === 8) {
    if (data.length < width * height) return null;
    for (let i = 0; i < width * height; i++) {
      const p = data[i] * 4;
      out[i * 4] = palette[p]; out[i * 4 + 1] = palette[p + 1]; out[i * 4 + 2] = palette[p + 2]; out[i * 4 + 3] = palette[p + 3];
    }
    return { width, height, rgba: out, version: u32(v, 8), filter: u32(v, 28) };
  }
  if (depth === 32 && data.length >= width * height * 4) {
    const hasAlpha = (chunk[111] & 1) !== 0 || (rasterFormat & 0x0f00) === 0x0500 && (chunk[111] & 1) !== 0;
    for (let i = 0; i < width * height; i++) {
      out[i * 4] = data[i * 4 + 2]; out[i * 4 + 1] = data[i * 4 + 1]; out[i * 4 + 2] = data[i * 4];
      out[i * 4 + 3] = hasAlpha ? data[i * 4 + 3] : 255;
    }
    return { width, height, rgba: out, version: u32(v, 8), filter: u32(v, 28) };
  }
  return null;
}

// A new uncompressed (A8R8G8B8) texture chunk with the pixels multiplied by color (0xAARRGGBB) and a full mip chain
export function recolorNative(chunk, argb, name) {
  const img = decodeNative(chunk);
  if (!img) return null;
  const { width, height, version, filter } = img;
  const tint = [(argb >>> 16) & 255, (argb >>> 8) & 255, argb & 255, (argb >>> 24) & 255];
  let level = img.rgba;
  let hasAlpha = false;
  for (let i = 0; i < width * height; i++) {
    for (let k = 0; k < 4; k++) level[i * 4 + k] = Math.round(level[i * 4 + k] * tint[k] / 255);
    if (level[i * 4 + 3] < 255) hasAlpha = true;
  }
  const pow2 = (n) => (n & (n - 1)) === 0;
  const levels = [{ w: width, h: height, px: level }];
  if (pow2(width) && pow2(height)) {
    let w = width, h = height;
    while (w > 1 || h > 1) {
      const nw = Math.max(1, w >> 1), nh = Math.max(1, h >> 1), next = new Uint8Array(nw * nh * 4);
      for (let y = 0; y < nh; y++) for (let x = 0; x < nw; x++) for (let k = 0; k < 4; k++) {
        let sum = 0;
        for (let dy = 0; dy < (h > 1 ? 2 : 1); dy++) for (let dx = 0; dx < (w > 1 ? 2 : 1); dx++) sum += level[(((y * 2 + dy) * w) + x * 2 + dx) * 4 + k];
        next[(y * nw + x) * 4 + k] = Math.round(sum / ((h > 1 ? 2 : 1) * (w > 1 ? 2 : 1)));
      }
      levels.push({ w: nw, h: nh, px: next });
      level = next; w = nw; h = nh;
    }
  }
  const dataSize = 4 + 4 + 32 + 32 + 4 + 4 + 4 + 4 + levels.reduce((n, l) => n + 4 + l.w * l.h * 4, 0);
  const out = new Uint8Array(12 + 12 + dataSize + 12);
  const dv = new DataView(out.buffer);
  const head = (a, type, size) => { dv.setUint32(a, type, true); dv.setUint32(a + 4, size, true); dv.setUint32(a + 8, version, true); };
  head(0, TXD_NATIVE, 12 + dataSize + 12);
  head(12, RW_STRUCT, dataSize);
  let a = 24;
  dv.setUint32(a, 9, true); dv.setUint32(a + 4, filter, true); a += 8;
  putAscii(out, a, 32, name); a += 64; // name, then an empty mask name
  dv.setUint32(a, 0x0500 | (levels.length > 1 ? 0x8000 : 0), true);
  dv.setUint32(a + 4, 21, true); // D3DFMT_A8R8G8B8
  dv.setUint16(a + 8, width, true); dv.setUint16(a + 10, height, true);
  out[a + 12] = 32; out[a + 13] = levels.length; out[a + 14] = 4; out[a + 15] = hasAlpha ? 1 : 0;
  a += 16;
  for (const l of levels) {
    dv.setUint32(a, l.w * l.h * 4, true); a += 4;
    for (let i = 0; i < l.w * l.h; i++) {
      out[a + i * 4] = l.px[i * 4 + 2]; out[a + i * 4 + 1] = l.px[i * 4 + 1]; out[a + i * 4 + 2] = l.px[i * 4]; out[a + i * 4 + 3] = l.px[i * 4 + 3];
    }
    a += l.w * l.h * 4;
  }
  head(a, RW_EXTENSION, 0);
  return out;
}
