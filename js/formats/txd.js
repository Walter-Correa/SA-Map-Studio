// Leitor de TXD (RenderWare Texture Dictionary) do GTA SA (PC, D3D8/D3D9).
// Mantém DXT comprimido quando possível; converte os demais formatos para RGBA.
import { BinaryReader } from './binary.js';

const FMT_MASK = 0x0f00;
const FMT_1555 = 0x0100, FMT_565 = 0x0200, FMT_4444 = 0x0300, FMT_LUM8 = 0x0400,
  FMT_8888 = 0x0500, FMT_888 = 0x0600, FMT_555 = 0x0a00;
const FMT_PAL8 = 0x2000, FMT_PAL4 = 0x4000;

function fourcc(n) {
  return String.fromCharCode(n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >> 24) & 255);
}

function header(r) { return { type: r.u32(), size: r.u32(), version: r.u32() }; }

function parseNative(r, end) {
  // Struct do TextureNative
  const h = header(r);
  if (h.type !== 1) return null;
  const sEnd = r.pos + h.size;
  const platform = r.u32();
  r.u32(); // filtro / endereçamento
  const name = r.str(32).toLowerCase();
  const mask = r.str(32).toLowerCase();
  const rasterFormat = r.u32();
  let compression = null;
  let alpha = false;
  if (platform === 9) {
    const d3d = r.u32();
    const cc = fourcc(d3d);
    if (cc.startsWith('DXT')) compression = cc;
    var d3dFormat = d3d;
  } else if (platform === 8) {
    alpha = r.u32() !== 0;
  } else {
    r.pos = sEnd; return null;
  }
  const width = r.u16(), height = r.u16();
  const depth = r.u8(), levels = r.u8();
  r.u8(); // raster type
  const flags = r.u8();
  if (platform === 9) {
    alpha = (flags & 1) !== 0;
  } else if (flags) {
    compression = 'DXT' + flags;
  }
  let palette = null;
  if (rasterFormat & FMT_PAL8) palette = r.slice(256 * 4).slice();
  else if (rasterFormat & FMT_PAL4) palette = r.slice(16 * 4).slice();
  const mips = [];
  let w = width, hgt = height;
  for (let i = 0; i < levels; i++) {
    if (r.pos + 4 > sEnd) break;
    const size = r.u32();
    if (r.pos + size > sEnd) break;
    mips.push({ width: w, height: hgt, data: r.slice(size).slice() });
    w = Math.max(1, w >> 1); hgt = Math.max(1, hgt >> 1);
  }
  r.pos = Math.min(sEnd, end);
  return { name, mask, rasterFormat, compression, alpha, width, height, depth, palette, mips, d3dFormat };
}

export function parseTxd(buffer) {
  const r = new BinaryReader(buffer);
  const textures = [];
  const h = header(r);
  if (h.type !== 0x16) return textures;
  const end = Math.min(r.pos + h.size, r.length);
  while (r.pos + 12 <= end) {
    const ch = header(r);
    const cEnd = Math.min(r.pos + ch.size, end);
    if (ch.type === 0x15) {
      try {
        const t = parseNative(r, cEnd);
        if (t && t.mips.length) textures.push(t);
      } catch (e) { /* textura corrompida: ignorada */ }
    }
    r.pos = cEnd;
  }
  return textures;
}

// ---------- Decodificação para RGBA (formatos sem compressão e fallback DXT) ----------

function c565(v, out, o) {
  out[o] = ((v >> 11) & 31) * 255 / 31 | 0;
  out[o + 1] = ((v >> 5) & 63) * 255 / 63 | 0;
  out[o + 2] = (v & 31) * 255 / 31 | 0;
}

function decodeDXT(data, width, height, type) {
  const out = new Uint8Array(width * height * 4);
  const bw = Math.max(1, (width + 3) >> 2), bh = Math.max(1, (height + 3) >> 2);
  const blockSize = type === 'DXT1' ? 8 : 16;
  const col = new Uint8Array(16);
  const alphas = new Uint8Array(16);
  let p = 0;
  for (let by = 0; by < bh; by++) {
    for (let bx = 0; bx < bw; bx++) {
      if (p + blockSize > data.length) return out;
      let cp = p;
      if (type === 'DXT3') {
        for (let i = 0; i < 8; i++) {
          const b = data[p + i];
          alphas[i * 2] = (b & 15) * 17; alphas[i * 2 + 1] = (b >> 4) * 17;
        }
        cp = p + 8;
      } else if (type === 'DXT5') {
        const a0 = data[p], a1 = data[p + 1];
        const pal = [a0, a1];
        if (a0 > a1) for (let i = 1; i < 7; i++) pal.push(((7 - i) * a0 + i * a1) / 7 | 0);
        else { for (let i = 1; i < 5; i++) pal.push(((5 - i) * a0 + i * a1) / 5 | 0); pal.push(0, 255); }
        let bits = 0, nb = 0, bi = p + 2;
        for (let i = 0; i < 16; i++) {
          if (nb < 3) { bits |= data[bi++] << nb; nb += 8; }
          alphas[i] = pal[bits & 7]; bits >>= 3; nb -= 3;
        }
        cp = p + 8;
      }
      const v0 = data[cp] | (data[cp + 1] << 8), v1 = data[cp + 2] | (data[cp + 3] << 8);
      c565(v0, col, 0); c565(v1, col, 4);
      col[3] = 255; col[7] = 255;
      if (v0 > v1 || type !== 'DXT1') {
        for (let k = 0; k < 3; k++) { col[8 + k] = (2 * col[k] + col[4 + k]) / 3 | 0; col[12 + k] = (col[k] + 2 * col[4 + k]) / 3 | 0; }
        col[11] = 255; col[15] = 255;
      } else {
        for (let k = 0; k < 3; k++) { col[8 + k] = (col[k] + col[4 + k]) >> 1; col[12 + k] = 0; }
        col[11] = 255; col[15] = 0;
      }
      const idx = data[cp + 4] | (data[cp + 5] << 8) | (data[cp + 6] << 16) | (data[cp + 7] << 24);
      for (let py = 0; py < 4; py++) {
        for (let px = 0; px < 4; px++) {
          const x = bx * 4 + px, y = by * 4 + py;
          if (x >= width || y >= height) continue;
          const i = py * 4 + px;
          const ci = (idx >>> (i * 2)) & 3;
          const o = (y * width + x) * 4;
          out[o] = col[ci * 4]; out[o + 1] = col[ci * 4 + 1]; out[o + 2] = col[ci * 4 + 2];
          out[o + 3] = type === 'DXT1' ? col[ci * 4 + 3] : alphas[i];
        }
      }
      p += blockSize;
    }
  }
  return out;
}

export function decodeToRGBA(tex, level = 0) {
  const mip = tex.mips[level];
  const { width, height, data } = mip;
  if (tex.compression) return decodeDXT(data, width, height, tex.compression);
  const n = width * height;
  const out = new Uint8Array(n * 4);
  const fmt = tex.rasterFormat & FMT_MASK;
  if (tex.palette) {
    const pal = tex.palette;
    const four = (tex.rasterFormat & FMT_PAL4) !== 0;
    for (let i = 0; i < n; i++) {
      const ix = four ? ((data[i >> 1] >> ((i & 1) * 4)) & 15) : data[i];
      out[i * 4] = pal[ix * 4]; out[i * 4 + 1] = pal[ix * 4 + 1]; out[i * 4 + 2] = pal[ix * 4 + 2];
      out[i * 4 + 3] = fmt === FMT_888 ? 255 : pal[ix * 4 + 3];
    }
    return out;
  }
  if (fmt === FMT_8888 || fmt === FMT_888) {
    for (let i = 0; i < n; i++) {
      out[i * 4] = data[i * 4 + 2]; out[i * 4 + 1] = data[i * 4 + 1]; out[i * 4 + 2] = data[i * 4];
      out[i * 4 + 3] = fmt === FMT_888 ? 255 : data[i * 4 + 3];
    }
  } else if (fmt === FMT_1555 || fmt === FMT_555) {
    for (let i = 0; i < n; i++) {
      const v = data[i * 2] | (data[i * 2 + 1] << 8);
      out[i * 4] = ((v >> 10) & 31) * 255 / 31 | 0; out[i * 4 + 1] = ((v >> 5) & 31) * 255 / 31 | 0;
      out[i * 4 + 2] = (v & 31) * 255 / 31 | 0; out[i * 4 + 3] = fmt === FMT_555 || (v & 0x8000) ? 255 : 0;
    }
  } else if (fmt === FMT_565) {
    for (let i = 0; i < n; i++) { c565(data[i * 2] | (data[i * 2 + 1] << 8), out, i * 4); out[i * 4 + 3] = 255; }
  } else if (fmt === FMT_4444) {
    for (let i = 0; i < n; i++) {
      const v = data[i * 2] | (data[i * 2 + 1] << 8);
      out[i * 4] = ((v >> 8) & 15) * 17; out[i * 4 + 1] = ((v >> 4) & 15) * 17; out[i * 4 + 2] = (v & 15) * 17; out[i * 4 + 3] = (v >> 12) * 17;
    }
  } else if (fmt === FMT_LUM8) {
    for (let i = 0; i < n; i++) { out[i * 4] = out[i * 4 + 1] = out[i * 4 + 2] = data[i]; out[i * 4 + 3] = 255; }
  } else {
    out.fill(200);
  }
  return out;
}

// Indica se a textura tem transparência relevante (para alpha test / blending)
export function textureHasAlpha(tex) {
  if (tex.compression === 'DXT3' || tex.compression === 'DXT5') return true;
  if (tex.compression === 'DXT1') return tex.alpha;
  const fmt = tex.rasterFormat & FMT_MASK;
  return fmt === FMT_8888 || fmt === FMT_1555 || fmt === FMT_4444 || (tex.palette && fmt !== FMT_888 && tex.alpha);
}
