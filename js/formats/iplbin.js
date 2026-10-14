// IPL binário ("bnry") usado nos *_streamN.ipl dentro do gta3.img.
// Cada instância tem 40 bytes: posição (3 floats), quaternion (4 floats), id, interior, lod.
import { BinaryReader } from './binary.js';

export function isBinaryIpl(buffer) {
  const b = new Uint8Array(buffer, 0, Math.min(4, buffer.byteLength));
  return b[0] === 0x62 && b[1] === 0x6e && b[2] === 0x72 && b[3] === 0x79; // "bnry"
}

export function parseIplBinary(buffer) {
  const r = new BinaryReader(buffer);
  r.skip(4);
  const numInst = r.i32();
  r.skip(12);
  const numCars = r.i32();
  r.skip(4);
  const instOffset = r.i32();
  r.skip(4 * 7);
  const carsOffset = r.i32();
  const inst = [];
  if (instOffset > 0 && instOffset + numInst * 40 <= r.length) {
    r.seek(instOffset);
    for (let i = 0; i < numInst; i++) {
      const x = r.f32(), y = r.f32(), z = r.f32();
      const qx = r.f32(), qy = r.f32(), qz = r.f32(), qw = r.f32();
      const id = r.i32();
      const interior = r.i32();
      const lod = r.i32();
      inst.push({ id, name: '', interior, x, y, z, qx, qy, qz, qw, lod });
    }
  }
  const cars = [];
  if (numCars > 0 && carsOffset > 0 && carsOffset + numCars * 48 <= r.length) {
    r.seek(carsOffset);
    for (let i = 0; i < numCars; i++) {
      const x = r.f32(), y = r.f32(), z = r.f32(), angle = r.f32();
      const id = r.i32();
      r.skip(28);
      cars.push({ x, y, z, angle, id });
    }
  }
  return { inst, cars };
}
