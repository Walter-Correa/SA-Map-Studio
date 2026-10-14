// Arquivo IMG versão 2 (GTA SA): cabeçalho "VER2", número de entradas e
// diretório com 32 bytes por entrada (offset e tamanho em setores de 2048 bytes).
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
