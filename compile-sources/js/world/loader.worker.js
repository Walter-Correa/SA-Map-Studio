// Loading worker: reads DFF and TXD from the IMG files and does all the heavy work
// (binary reading, triangles per material, precomputed light, texture decoding)
// off the main thread, so the camera does not stutter while the map loads.
import { prepDff, prepTxd } from './prep.js';

let base = '/gta/';

let s3tc = true;

async function read(e) {
  if (!e.size && /\.img$/i.test(e.img)) throw new Error('entrada vazia');
  const url = base + e.img.split('/').map(encodeURIComponent).join('/');
  const headers = e.size ? { Range: `bytes=${e.offset}-${e.offset + e.size - 1}` } : {};
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.arrayBuffer();
}

onmessage = async (ev) => {
  const msg = ev.data;
  if (msg.type === 'config') { base = msg.base || base; s3tc = msg.s3tc !== false; return; }
  try {
    const buf = msg.buffer || await read(msg.entry);
    const r = msg.type === 'dff' ? prepDff(buf, msg.ambient ?? 56) : prepTxd(buf, s3tc);
    postMessage({ id: msg.id, ok: true, data: r.data }, r.transfer);
  } catch (err) {
    postMessage({ id: msg.id, ok: false, error: String(err && err.message || err) });
  }
};
