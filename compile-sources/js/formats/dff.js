// GTA SA DFF (RenderWare Clump) reader.
// Extracts frames (hierarchy + names), geometries (vertices, normals, UVs,
// pre-lit colors, triangles per material) and atomics; for pedestrians, the bones (HAnim) and the skin.
import { BinaryReader } from './binary.js';

const RW = {
  STRUCT: 0x01, STRING: 0x02, EXTENSION: 0x03, TEXTURE: 0x06, MATERIAL: 0x07,
  MATLIST: 0x08, FRAMELIST: 0x0e, GEOMETRY: 0x0f, CLUMP: 0x10, ATOMIC: 0x14,
  GEOMLIST: 0x1a, SKIN: 0x116, HANIM: 0x11e, BINMESH: 0x50e, FRAME_NAME: 0x253f2fe, NIGHT_COLORS: 0x253f2f9,
};

const GEO_TRISTRIP = 0x01, GEO_PRELIT = 0x08, GEO_NORMALS = 0x10,
  GEO_TEXTURED = 0x04, GEO_TEXTURED2 = 0x80, GEO_NATIVE = 0x01000000;

function header(r) {
  return { type: r.u32(), size: r.u32(), version: r.u32() };
}

function readString(r, size) {
  return r.str(size).toLowerCase();
}

// Walks a chunk's children calling fn(header, childReader)
function eachChild(r, end, fn) {
  while (r.pos + 12 <= end) {
    const h = header(r);
    const start = r.pos;
    const stop = Math.min(start + h.size, end);
    fn(h, r, stop);
    r.pos = stop;
  }
}

function parseFrameList(r, end) {
  const frames = [];
  let idx = 0;
  eachChild(r, end, (h, r2, stop) => {
    if (h.type === RW.STRUCT) {
      const n = r2.u32();
      for (let i = 0; i < n; i++) {
        const rot = r2.f32array(9);
        const pos = r2.f32array(3);
        const parent = r2.i32();
        r2.u32();
        frames.push({ rot, pos, parent, name: '' });
      }
    } else if (h.type === RW.EXTENSION) {
      const frame = frames[idx++];
      eachChild(r2, stop, (eh, r3, estop) => {
        if (eh.type === RW.FRAME_NAME && frame) frame.name = readString(r3, estop - r3.pos);
        else if (eh.type === RW.HANIM && frame) {
          r3.u32();
          frame.boneId = r3.i32();
          const n = r3.u32();
          if (n > 0 && n < 256) {
            r3.u32(); r3.u32();
            frame.hanim = [];
            for (let i = 0; i < n; i++) { const id = r3.i32(); r3.i32(); r3.u32(); frame.hanim.push(id); }
          }
        }
      });
    }
  });
  return frames;
}

function parseMaterial(r, end) {
  const mat = { color: [255, 255, 255, 255], texture: null, mask: null };
  eachChild(r, end, (h, r2, stop) => {
    if (h.type === RW.STRUCT) {
      r2.u32();
      mat.color = [r2.u8(), r2.u8(), r2.u8(), r2.u8()];
    } else if (h.type === RW.TEXTURE) {
      const names = [];
      eachChild(r2, stop, (th, r3, tstop) => {
        if (th.type === RW.STRING) names.push(readString(r3, tstop - r3.pos));
      });
      mat.texture = names[0] || null;
      mat.mask = names[1] || null;
    }
  });
  return mat;
}

function parseMaterialList(r, end) {
  const mats = [];
  let indices = [];
  eachChild(r, end, (h, r2, stop) => {
    if (h.type === RW.STRUCT) {
      const n = r2.u32();
      for (let i = 0; i < n; i++) indices.push(r2.i32());
    } else if (h.type === RW.MATERIAL) {
      mats.push(parseMaterial(r2, stop));
    }
  });
  // Indices >= 0 reuse a previous material
  const out = [];
  let k = 0;
  for (const ix of indices) out.push(ix < 0 ? mats[k++] : out[ix]);
  return out.length ? out : mats;
}

function parseGeometry(r, end) {
  const g = { flags: 0, positions: null, normals: null, uvs: null, colors: null, nightColors: null,
    triangles: null, materials: [], binMesh: null, numVerts: 0 };
  eachChild(r, end, (h, r2, stop) => {
    if (h.type === RW.STRUCT) {
      const format = r2.u32();
      const numTris = r2.u32();
      const numVerts = r2.u32();
      r2.u32(); // morph targets
      g.flags = format & 0xffff;
      g.numVerts = numVerts;
      const native = (format & GEO_NATIVE) !== 0;
      let numUV = (format >> 16) & 0xff;
      if (!numUV) numUV = (format & GEO_TEXTURED2) ? 2 : (format & GEO_TEXTURED) ? 1 : 0;
      if (h.version < 0x34000) r2.skip(12);
      if (!native) {
        if (format & GEO_PRELIT) g.colors = r2.slice(numVerts * 4).slice();
        for (let t = 0; t < numUV; t++) {
          const uv = r2.f32array(numVerts * 2);
          if (t === 0) g.uvs = uv;
        }
        const tris = new Uint16Array(numTris * 4);
        for (let i = 0; i < numTris; i++) {
          const b = r2.u16(), a = r2.u16(), m = r2.u16(), c = r2.u16();
          tris[i * 4] = a; tris[i * 4 + 1] = b; tris[i * 4 + 2] = c; tris[i * 4 + 3] = m;
        }
        g.triangles = tris;
      }
      // Morph target 0
      r2.skip(16); // bounding sphere
      const hasVerts = r2.u32();
      const hasNormals = r2.u32();
      if (hasVerts) g.positions = r2.f32array(numVerts * 3);
      if (hasNormals) g.normals = r2.f32array(numVerts * 3);
    } else if (h.type === RW.MATLIST) {
      g.materials = parseMaterialList(r2, stop);
    } else if (h.type === RW.EXTENSION) {
      eachChild(r2, stop, (eh, r3, estop) => {
        if (eh.type === RW.BINMESH) {
          const bflags = r3.u32();
          const nMesh = r3.u32();
          r3.u32();
          const meshes = [];
          for (let i = 0; i < nMesh; i++) {
            const n = r3.u32();
            const mat = r3.u32();
            if (r3.pos + n * 4 > estop) break;
            const idx = new Uint32Array(n);
            for (let j = 0; j < n; j++) idx[j] = r3.u32();
            meshes.push({ material: mat, indices: idx });
          }
          g.binMesh = { strip: bflags === 1, meshes };
        } else if (eh.type === RW.SKIN && g.numVerts) {
          // Bones that move each vertex (up to 4, weighted) and the inverse matrix of each bone's pose
          const numBones = r3.u8(), numUsed = r3.u8();
          r3.u8(); r3.u8();
          r3.skip(numUsed);
          const indices = r3.slice(g.numVerts * 4).slice();
          const weights = r3.f32array(g.numVerts * 4);
          const inverse = new Float32Array(numBones * 16);
          for (let i = 0; i < numBones; i++) {
            if (eh.version < 0x34003) r3.skip(4);
            inverse.set(r3.f32array(16), i * 16);
          }
          if (r3.pos <= estop) g.skin = { numBones, indices, weights, inverse };
        } else if (eh.type === RW.NIGHT_COLORS) {
          const has = r3.u32();
          if (has && g.numVerts && r3.pos + g.numVerts * 4 <= estop) g.nightColors = r3.slice(g.numVerts * 4).slice();
        }
      });
    }
  });
  return g;
}

export function parseDff(buffer) {
  const r = new BinaryReader(buffer);
  const result = { frames: [], geometries: [], atomics: [] };
  // Some files have extra chunks before the clump: we look for the first CLUMP
  while (r.pos + 12 <= r.length) {
    const h = header(r);
    const end = Math.min(r.pos + h.size, r.length);
    if (h.type !== RW.CLUMP) { r.pos = end; continue; }
    eachChild(r, end, (ch, r2, stop) => {
      if (ch.type === RW.FRAMELIST) result.frames = parseFrameList(r2, stop);
      else if (ch.type === RW.GEOMLIST) {
        eachChild(r2, stop, (gh, r3, gstop) => {
          if (gh.type === RW.GEOMETRY) result.geometries.push(parseGeometry(r3, gstop));
        });
      } else if (ch.type === RW.ATOMIC) {
        eachChild(r2, stop, (ah, r3) => {
          if (ah.type === RW.STRUCT && result.atomics.length < 4096) {
            const frame = r3.u32(), geometry = r3.u32(), flags = r3.u32();
            result.atomics.push({ frame, geometry, flags });
          }
        });
      }
    });
    break;
  }
  return result;
}

// Converts a geometry into index lists per material.
// The game draws from the BinMesh; many SA-MP models have the material of all triangles
// zeroed and only the BinMesh carries the right split, so it takes priority over the triangle list.
export function geometryGroups(g) {
  const nMat = Math.max(1, g.materials.length);
  const lists = Array.from({ length: nMat }, () => []);
  const nv = g.numVerts || (g.positions ? g.positions.length / 3 : 0);
  const binOk = g.binMesh && g.binMesh.meshes.some(m => m.indices.length)
    && g.binMesh.meshes.every(m => m.indices.every(i => i < nv));
  if (binOk) {
    for (const mesh of g.binMesh.meshes) {
      const m = mesh.material < nMat ? mesh.material : 0;
      const idx = mesh.indices;
      if (!g.binMesh.strip) { for (let i = 0; i + 2 < idx.length; i += 3) lists[m].push(idx[i], idx[i + 1], idx[i + 2]); continue; }
      for (let i = 2; i < idx.length; i++) {
        const a = idx[i - 2], b = idx[i - 1], c = idx[i];
        if (a === b || b === c || a === c) continue;
        if (i % 2 === 0) lists[m].push(a, b, c); else lists[m].push(b, a, c);
      }
    }
  } else if (g.triangles && g.triangles.length) {
    const t = g.triangles;
    for (let i = 0; i < t.length; i += 4) {
      const m = t[i + 3] < nMat ? t[i + 3] : 0;
      lists[m].push(t[i], t[i + 1], t[i + 2]);
    }
  }
  return lists;
}
