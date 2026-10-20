// IMG file version 2 (GTA SA): "VER2" header, number of entries and
// directory with 32 bytes per entry (offset and size in 2048-byte sectors).
import { BinaryReader } from './binary.js';

export const SECTOR = 2048;

export function parseImgHeader(buffer) {
  const r = new BinaryReader(buffer);
  const magic = r.str(4);
  if (magic !== 'VER2') throw new Error('IMG não é versão 2 (VER2)');
  return r.u32();
}

export function parseImgDirectory(buffer, count) {
  const r = new BinaryReader(buffer);
  r.seek(8);
  const entries = [];
  for (let i = 0; i < count; i++) {
    const offset = r.u32();
    const streaming = r.u16();
    const archived = r.u16();
    const name = r.str(24);
    entries.push({ name, offset: offset * SECTOR, size: (streaming || archived) * SECTOR });
  }
  return entries;
}
