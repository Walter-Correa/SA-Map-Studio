// SPDX-License-Identifier: MPL-2.0
// Inspector part of gates and doors: any object can become one (see editor/gates.js)
import { app, $, $$, esc, fmt, toast } from './common.js';
import { GATE_MP_KEYS, GATE_SP_KEYS, newGate } from '../editor/gates.js';

// Gate test sounds go through Web Audio: an <audio> loop leaves a gap and replays the attack at the start
// of the sample on every turn, which sounds like the sound stopping and starting again. Here the start plays
// once and only the steady part after it repeats, with no gap, like the looped sound of the game.
let ctx = null;
let sounds = []; // the playing sources of the gate test
const buffers = new Map(); // sound id -> Promise<AudioBuffer|null>

function loadBuffer(id) {
  if (!buffers.has(id)) {
    buffers.set(id, fetch(`/api/sound/${id}?v=2`)
      .then(r => (r.ok && !r.headers.get('X-Sound-Silent') ? r.arrayBuffer() : null))
      .then(data => (data ? ctx.decodeAudioData(data) : null))
      .catch(() => null));
  }
  return buffers.get(id);
}

// Loop points: from the end of the attack (the envelope settles to its steady level) to the last sound before
// the trailing silence, both moved to a rising zero crossing so the seam does not click
function loopPoints(buf) {
  const s = buf.getChannelData(0), sr = buf.sampleRate, step = Math.max(1, Math.round(sr * 0.05));
  const env = [];
  for (let i = 0; i < s.length; i += step) { let m = 0; for (let j = i; j < Math.min(i + step, s.length); j++) m = Math.max(m, Math.abs(s[j])); env.push(m); }
  const loud = env.filter(v => v > 0.01);
  if (loud.length < 6) return null;
  const steady = [...loud].sort((a, b) => a - b)[Math.floor(loud.length / 2)];
  let end = env.length - 1;
  while (end > 0 && env[end] < steady * 0.25) end--;
  let start = env.findIndex(v => v > steady * 0.25);
  while (start < end && env[start] > steady * 1.3) start++;
  start = Math.min(start + 1, Math.floor(end * 0.5));
  if (end - start < 4) return null;
  const zero = (i) => { for (let k = i; k < s.length - 1 && k < i + step; k++) if (s[k] <= 0 && s[k + 1] > 0) return k + 1; return i; };
  return [zero(start * step) / sr, zero(end * step) / sr];
}

function playSound(id, loop) {
  try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); } catch { return; }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  const entry = { src: null, stopped: false };
  sounds.push(entry);
  loadBuffer(id).then(buf => {
    if (!buf || entry.stopped) return;
    const src = ctx.createBufferSource(), gain = ctx.createGain();
    src.buffer = buf;
    gain.gain.value = 0.85;
    const pts = loop ? loopPoints(buf) : null;
    if (loop) {
      src.loop = true;
      if (pts) [src.loopStart, src.loopEnd] = pts;
    }
    src.connect(gain).connect(ctx.destination);
    src.start();
    entry.src = src;
  });
}

function stopSounds() {
  for (const e of sounds) { e.stopped = true; try { e.src?.stop(); } catch {} }
  sounds = [];
}

export function gateSection(o) {
  const g = o.gate;
  const sp = app.project?.mode === 'sp';
  const blocked = o.attach ? '<div class="insp-note" style="color: var(--gold-400);">Objetos acoplados não podem virar portão. Somente o objeto pai pode.</div>' : '';
  const keyOptions = sp
    ? GATE_SP_KEYS.map(([v, label]) => `<option value="${v}" ${g && g.spKey === v ? 'selected' : ''}>${esc(label)}</option>`).join('')
    : GATE_MP_KEYS.map(([name, , pc]) => `<option value="${name}" ${g && g.key === name ? 'selected' : ''}>${name} (${esc(pc)})</option>`).join('');
  return `
    <div class="insp-section">
      <div class="insp-label">Portão ou porta</div>
      <label class="check" style="margin: 4px 0 8px;"><input type="checkbox" id="chkGate" ${g ? 'checked' : ''} ${o.attach ? 'disabled' : ''}> Transformar em portão ou porta</label>
      ${blocked || (g ? `
        <div class="insp-note">A posição atual do objeto é a fechada. Para ajustar a aberta com o gizmo, use Trocar, mova o objeto e troque de novo.</div>
        <button type="button" class="btn small block" data-gate-act="setopen" title="Copia a posição e a rotação atuais do objeto para a posição aberta" style="margin-top:6px;"><svg><use href="#i-pin"/></svg>Usar posição atual como aberto</button>
        <div class="pair" style="margin-top:6px;">
          <label>Aberto X<input type="number" step="0.1" data-gate="ox" value="${fmt(g.ox)}"></label>
          <label>Aberto Y<input type="number" step="0.1" data-gate="oy" value="${fmt(g.oy)}"></label>
          <label>Aberto Z<input type="number" step="0.1" data-gate="oz" value="${fmt(g.oz)}"></label>
        </div>
        <div class="pair" style="margin-top:4px;">
          <label>Aberto RX<input type="number" step="1" data-gate="orx" value="${fmt(g.orx)}"></label>
          <label>Aberto RY<input type="number" step="1" data-gate="ory" value="${fmt(g.ory)}"></label>
          <label>Aberto RZ<input type="number" step="1" data-gate="orz" value="${fmt(g.orz)}"></label>
        </div>
        <div class="pair" style="margin-top:6px;">
          <label>Acionamento<select data-gate-sel="trigger">
            <option value="key" ${g.trigger === 'key' ? 'selected' : ''}>Tecla</option>
            <option value="horn" ${g.trigger === 'horn' ? 'selected' : ''}>Buzina do veículo</option>
          </select></label>
          ${g.trigger === 'key' ? `<label>Tecla<select data-gate-sel="${sp ? 'spKey' : 'key'}">${keyOptions}</select></label>` : ''}
        </div>
        <div class="pair" style="margin-top:4px;">
          <label>Movimento (ms)<input type="number" step="100" min="100" data-gate="time" value="${g.time}"></label>
          <label>Fecha após (ms)<input type="number" step="500" min="0" data-gate="closeDelay" value="${g.closeDelay}"></label>
          <label>Alcance (m)<input type="number" step="1" min="1" max="100" data-gate="range" value="${fmt(g.range)}"></label>
        </div>
        <label class="check" style="margin-top:6px;"><input type="checkbox" id="chkGateSound" ${g.sound ? 'checked' : ''}> Som ao abrir e fechar</label>
        <div class="mini-actions" style="margin-top:8px;">
          <button type="button" class="btn primary small" data-gate-act="test" title="Abre, espera o tempo de fechar e fecha"><svg><use href="#i-play"/></svg>Testar</button>
          <button type="button" class="btn small" data-gate-act="stop" title="Parar o teste e voltar à posição fechada"><svg><use href="#i-stop"/></svg>Parar</button>
          <button type="button" class="btn small" data-gate-act="swap" title="Troca a posição fechada pela aberta"><svg><use href="#i-restore"/></svg>Trocar</button>
        </div>
      ` : '<div class="insp-note">Abre com uma tecla ou com a buzina, só quando está fechado, e fecha sozinho depois do tempo escolhido.</div>')}
    </div>`;
}

export function bindGate(uid, rerender) {
  const project = app.project;
  const chk = $('#chkGate');
  if (!chk) return;
  chk.onchange = () => {
    project.updateItems('Alterar portão', [uid], (o) => {
      if (chk.checked && !o.attach) { o.gate = newGate(o); o.move = null; } else o.gate = null;
    });
    app.editor.stopMoveObject(uid);
    rerender();
  };
  $$('#inspector [data-gate]').forEach(inp => inp.addEventListener('change', () => {
    const v = parseFloat(inp.value);
    if (!Number.isFinite(v)) return;
    project.updateItems('Editar portão', [uid], (o) => { if (o.gate) o.gate[inp.dataset.gate] = v; });
  }));
  $$('#inspector [data-gate-sel]').forEach(sel => sel.addEventListener('change', () => {
    const f = sel.dataset.gateSel;
    project.updateItems('Editar portão', [uid], (o) => { if (o.gate) o.gate[f] = f === 'spKey' ? +sel.value : sel.value; });
    if (f === 'trigger') rerender();
  }));
  const snd = $('#chkGateSound');
  if (snd) snd.onchange = () => project.updateItems('Editar portão', [uid], (o) => { if (o.gate) o.gate.sound = snd.checked; });
  $$('#inspector [data-gate-act]').forEach(btn => btn.onclick = () => {
    const act = btn.dataset.gateAct;
    if (act === 'test') {
      stopSounds();
      const withSound = !!project.find(uid)?.gate?.sound;
      app.editor.testGate(uid, withSound ? {
        moveStart: () => { stopSounds(); playSound(1153, true); },
        moveEnd: () => { stopSounds(); playSound(1154, false); },
      } : {});
      toast('Testando o portão');
    } else if (act === 'stop') {
      stopSounds();
      app.editor.resetMoveObject(uid);
    } else if (act === 'setopen') {
      project.updateItems('Definir posição aberta do portão', [uid], (o) => {
        const g = o.gate;
        if (!g) return;
        Object.assign(g, { ox: o.x, oy: o.y, oz: o.z, orx: o.rx || 0, ory: o.ry || 0, orz: o.rz || 0 });
      });
      toast('Coordenadas atuais copiadas para a posição aberta');
      rerender();
    } else if (act === 'swap') {
      stopSounds();
      app.editor.stopMoveObject(uid);
      project.updateItems('Trocar posição do portão', [uid], (o) => {
        const g = o.gate;
        if (!g) return;
        [o.x, g.ox] = [g.ox, o.x]; [o.y, g.oy] = [g.oy, o.y]; [o.z, g.oz] = [g.oz, o.z];
        [o.rx, g.orx] = [g.orx, o.rx]; [o.ry, g.ory] = [g.ory, o.ry]; [o.rz, g.orz] = [g.orz, o.rz];
      });
      rerender();
    }
  });
}
