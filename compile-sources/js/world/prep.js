// Preparation of model and texture data (used by the worker and, without a worker, on the main thread).
import { parseDff, geometryGroups } from '../formats/dff.js';
import { parseTxd, decodeToRGBA, textureHasAlpha } from '../formats/txd.js';

export function concatIndices(lists, numVerts) {
  const total = lists.reduce((s, l) => s + l.length, 0);
  const all = numVerts > 65535 ? new Uint32Array(total) : new Uint16Array(total);
  const groups = [];
  let off = 0;
  for (let m = 0; m < lists.length; m++) {
    const l = lists[m];
    if (!l.length) continue;
    all.set(l, off);
    groups.push({ material: m, start: off, count: l.length });
    off += l.length;
  }
  return { index: all, groups };
}

export function prepDff(buf, ambient) {
  const d = parseDff(buf);
  const transfer = [];
  const geometries = d.geometries.map(g => {
    const { index, groups } = concatIndices(geometryGroups(g), g.numVerts);
    let colors = null;
    if (g.colors) {
      // Precomputed light + daytime ambient light (the game adds the timecyc ambient)
      const src = g.colors;
      colors = new Uint8Array(src.length);
      for (let i = 0; i < src.length; i += 4) {
        colors[i] = Math.min(255, src[i] * 1.05 + ambient);
        colors[i + 1] = Math.min(255, src[i + 1] * 1.05 + ambient);
        colors[i + 2] = Math.min(255, src[i + 2] * 1.05 + ambient);
        colors[i + 3] = src[i + 3];
      }
    }
    const out = {
      flags: g.flags, numVerts: g.numVerts,
      positions: g.positions, normals: g.normals, uvs: g.uvs, colors,
      materials: g.materials, index, groups, skin: g.skin || null,
    };
    if (out.skin) transfer.push(out.skin.indices.buffer, out.skin.weights.buffer, out.skin.inverse.buffer);
    for (const a of [out.positions, out.normals, out.uvs, out.colors, out.index]) if (a) transfer.push(a.buffer);
    return out;
  });
  return { data: { frames: d.frames, atomics: d.atomics, geometries }, transfer };
}

export function prepTxd(buf, s3tc = true) {
  const transfer = [];
  const textures = [];
  for (const t of parseTxd(buf)) {
    try {
      const alpha = !!textureHasAlpha(t);
      const dxtOk = s3tc && t.compression && t.width % 4 === 0 && t.height % 4 === 0;
      if (dxtOk) {
        const mips = t.mips.filter(m => m.data.length > 0).map(m => ({ data: m.data, width: m.width, height: m.height }));
        for (const m of mips) transfer.push(m.data.buffer);
        textures.push({ name: t.name, width: t.width, height: t.height, alpha, compression: t.compression, mips });
      } else {
        const rgba = decodeToRGBA(t, 0);
        transfer.push(rgba.buffer);
        textures.push({ name: t.name, width: t.width, height: t.height, alpha, rgba });
      }
    } catch { /* textura corrompida: ignorada */ }
  }
  return { data: textures, transfer };
}

