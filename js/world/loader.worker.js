// Worker de carregamento: lê DFF e TXD dos arquivos IMG e faz todo o trabalho pesado
// (leitura binária, triângulos por material, luz pré-calculada, decodificação de
// texturas) fora da thread principal, para a câmera não engasgar enquanto o mapa carrega.
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
