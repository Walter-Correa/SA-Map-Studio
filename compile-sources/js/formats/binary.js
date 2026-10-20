// Little-endian binary reader used by all GTA SA formats.
export class BinaryReader {
  constructor(buffer, offset = 0, length) {
    this.buffer = buffer instanceof ArrayBuffer ? buffer : buffer.buffer;
    const base = buffer instanceof ArrayBuffer ? 0 : buffer.byteOffset;
    const len = length ?? (buffer.byteLength - offset);
    this.view = new DataView(this.buffer, base + offset, len);
    this.bytes = new Uint8Array(this.buffer, base + offset, len);
    this.pos = 0;
  }
  get length() { return this.view.byteLength; }
  get remaining() { return this.view.byteLength - this.pos; }
  seek(p) { this.pos = p; return this; }
  skip(n) { this.pos += n; return this; }
  u8() { return this.view.getUint8(this.pos++); }
  u16() { const v = this.view.getUint16(this.pos, true); this.pos += 2; return v; }
  i16() { const v = this.view.getInt16(this.pos, true); this.pos += 2; return v; }
  u32() { const v = this.view.getUint32(this.pos, true); this.pos += 4; return v; }
  i32() { const v = this.view.getInt32(this.pos, true); this.pos += 4; return v; }
  f32() { const v = this.view.getFloat32(this.pos, true); this.pos += 4; return v; }
  slice(n) { const b = this.bytes.subarray(this.pos, this.pos + n); this.pos += n; return b; }
  // Aligned copy (needed for Float32Array/Uint16Array at odd offsets)
  f32array(count) {
    const out = new Float32Array(count);
    for (let i = 0; i < count; i++) out[i] = this.view.getFloat32(this.pos + i * 4, true);
    this.pos += count * 4;
    return out;
  }
  // Fixed-size zero-terminated string
  str(n) {
    const b = this.slice(n);
    let end = b.indexOf(0); if (end < 0) end = n;
    let s = '';
    for (let i = 0; i < end; i++) s += String.fromCharCode(b[i]);
    return s;
  }
  sub(n) { const r = new BinaryReader(this.buffer, this.view.byteOffset + this.pos, n); this.pos += n; return r; }
}

export function decodeText(buffer) {
  const b = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let s = '';
  const CH = 8192;
  for (let i = 0; i < b.length; i += CH) s += String.fromCharCode.apply(null, b.subarray(i, i + CH));
  return s;
}
