// Inspector part of gates and doors: any object can become one (see editor/gates.js)
import { app, $, $$, esc, fmt, toast } from './common.js';
import { GATE_MP_KEYS, GATE_SP_KEYS, newGate } from '../editor/gates.js';

let sounds = []; // the editor's audio elements of the gate test

function playSound(id, loop) {
  const audio = new Audio();
  audio.loop = loop;
  audio.volume = 0.85;
  sounds.push(audio);
  fetch(`/api/sound/${id}?v=2`).then(r => (r.ok && !r.headers.get('X-Sound-Silent') ? r.blob() : null)).then(blob => {
    if (!blob || !sounds.includes(audio)) return;
    audio.src = URL.createObjectURL(blob);
    audio.play().catch(() => {});
  }).catch(() => {});
}

function stopSounds() {
  for (const a of sounds) { try { a.pause(); a.src = ''; } catch {} }
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
