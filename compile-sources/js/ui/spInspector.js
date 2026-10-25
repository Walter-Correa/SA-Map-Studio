// Singleplayer inspector parts: what a NPC carries and does, and what happens when a checkpoint or a pickup is used.
import { app, $, esc, toast } from './common.js';
import { makeAction } from '../editor/project.js';
import { NPC_WEAPONS, WEAPONS, optionsHtml } from '../world/spWeapons.js';

const isSp = () => app.project?.mode === 'sp';

// ---------------------------------------------------------------------------  NPCs
export function npcSection(a) {
  if (!isSp()) return '';
  const role = a.role || 'neutral';
  const follow = role === 'guard' ? 'Seguir o jogador (corre até ele num raio de 100 m; se ele se afastar, aparece ao lado dele)'
    : 'Perseguir o jogador num raio de 100 m (não entra em interiores e não é teleportado)';
  return `<div class="insp-section"><div class="insp-label">Arma e comportamento</div>
    <label class="field">Arma<select id="npcWeapon">${optionsHtml(NPC_WEAPONS, a.weapon | 0)}</select></label>
    ${a.weapon && !WEAPONS.find(w => w.id === (a.weapon | 0))?.melee ? `<label class="check"><input type="checkbox" id="npcAmmoInf" ${a.ammoInfinite === false ? '' : 'checked'}> Munição infinita</label>
    ${a.ammoInfinite === false ? `<label class="field" title="Quando a munição acaba, a arma é descartada e o NPC luta com as mãos">Munição (a arma é descartada quando acaba)<input type="number" id="npcAmmo" min="1" max="9999" step="1" value="${a.ammo | 0 || 100}"></label>` : ''}` : ''}
    <label class="field">Comportamento
      <select id="npcRole">
        <option value="neutral" ${role === 'neutral' ? 'selected' : ''}>Neutro (fica onde está)</option>
        <option value="guard" ${role === 'guard' ? 'selected' : ''}>Protetor do jogador</option>
        <option value="enemy" ${role === 'enemy' ? 'selected' : ''}>Inimigo do jogador</option>
      </select></label>
    ${a.invulnerable ? '' : `<label class="field">Reaparecer depois de morrer (segundos, 0 = fica morto)<input type="number" id="npcRespawn" min="0" max="36000" step="1" value="${a.respawn | 0}"></label>`}
    ${role === 'neutral' ? '' : `<label class="check"><input type="checkbox" id="npcFollow" ${a.follow ? 'checked' : ''}> ${follow}</label>
    <label class="field">Velocidade ao correr até o jogador<select id="npcRun">
      <option value="fast" ${a.runFast === false ? '' : 'selected'}>Correr rápido</option>
      <option value="normal" ${a.runFast === false ? 'selected' : ''}>Correr normal</option>
    </select></label>
    <label class="field">Velocidade de movimento (100% a 200%)<input type="number" id="npcSpeed" min="100" max="200" step="5" value="${a.speedPct ?? 100}"></label>`}
    <p class="insp-note">${role === 'guard' ? 'Atira em quem ataca o jogador ou está atirando perto dele. Sem a opção de seguir, protege o lugar onde está.'
      : role === 'enemy' ? 'Com arma de fogo atira no jogador; sem arma ou com arma branca, bate nele.' : 'Fica parado onde foi colocado.'}</p>
  </div>`;
}

export function bindNpc(a, project, rerender) {
  const set = (label, fn) => { project.updateItems(label, [a.uid], fn); rerender(); };
  const w = $('#npcWeapon');
  if (w) w.onchange = () => set('Alterar arma do NPC', (o) => { o.weapon = parseInt(w.value, 10) || 0; if (o.weapon) o.anim = null; });
  const r = $('#npcRole');
  if (r) r.onchange = () => set('Alterar comportamento do NPC', (o) => { o.role = r.value; if (r.value === 'neutral') o.follow = false; });
  const rs = $('#npcRespawn');
  if (rs) rs.onchange = () => set('Alterar o reaparecimento do NPC', (o) => { o.respawn = Math.max(0, Math.min(36000, Math.round(parseFloat(rs.value) || 0))); });
  const ai = $('#npcAmmoInf');
  if (ai) ai.onchange = () => set('Alterar a munição do NPC', (o) => { o.ammoInfinite = ai.checked; });
  const am = $('#npcAmmo');
  if (am) am.onchange = () => set('Alterar a munição do NPC', (o) => { o.ammo = Math.max(1, Math.min(9999, Math.round(parseFloat(am.value) || 100))); });
  const rn = $('#npcRun');
  if (rn) rn.onchange = () => set('Alterar a velocidade do NPC', (o) => { o.runFast = rn.value !== 'normal'; });
  const sp = $('#npcSpeed');
  if (sp) sp.onchange = () => set('Alterar a velocidade de movimento do NPC', (o) => { o.speedPct = Math.max(100, Math.min(200, Math.round(parseFloat(sp.value) || 100))); });
  const f = $('#npcFollow');
  if (f) f.onchange = () => set('Alterar o NPC seguir o jogador', (o) => { o.follow = f.checked; });
}

// ---------------------------------------------------------------------------  actions of checkpoints and pickups
const TYPES = [
  ['none', 'Nenhuma (só o marcador)'], ['message', 'Mostrar uma mensagem'], ['health', 'Curar o jogador'], ['armour', 'Dar colete'],
  ['money', 'Dar dinheiro'], ['weapon', 'Dar uma arma'], ['ammo', 'Munição máxima das armas que o jogador tem'], ['wanted', 'Mudar o nível de procurado'],
  ['teleport', 'Teleportar o jogador'], ['vehicle', 'Dar um veículo'], ['repair', 'Consertar o veículo do jogador'], ['nitro', 'Instalar nitro no veículo'],
  ['jetpack', 'Dar um jetpack'], ['save', 'Salvar o jogo'], ['skin', 'Trocar a skin do jogador'], ['weather', 'Mudar o clima'], ['time', 'Mudar a hora'],
  ['explosion', 'Explosão (armadilha)'],
  ['fatMax', 'Máximo de gordura'], ['fatMin', 'Mínimo de gordura'], ['muscleMax', 'Máximo de músculos'], ['muscleMin', 'Mínimo de músculos'],
  ['staminaMax', 'Máximo de stamina'], ['staminaMin', 'Mínimo de stamina'], ['lungMax', 'Máximo de fôlego'], ['lungMin', 'Mínimo de fôlego'],
  ['healthMax', 'Máximo de saúde'], ['healthMin', 'Mínimo de saúde'], ['respectMax', 'Máximo de respeito'], ['respectMin', 'Mínimo de respeito'],
  ['armourMax', 'Máximo de colete'], ['armourMin', 'Mínimo de colete'], ['sexMax', 'Máximo de sex appeal'], ['sexMin', 'Mínimo de sex appeal'],
  ['hungerOff', 'Remover a fome'],
];

// The game's color codes inside a text (as ~y~ in SA-MP): the code, its name and the color it shows
const COLORS = [['r', 'Vermelho', '#e0383e'], ['g', 'Verde', '#3fb950'], ['b', 'Azul', '#4d8cf5'], ['y', 'Amarelo', '#f2cf3b'], ['p', 'Roxo', '#b57edc'],
  ['w', 'Branco', '#ffffff'], ['l', 'Preto', '#111111'], ['s', 'Voltar à cor padrão', '#d8d8d8']];
const colorOf = new Map(COLORS.map(([c, , css]) => [c, css]));
function previewHtml(text) {
  let color = '#e8e8e8', out = '';
  for (const part of String(text || '').split(/(~[a-z]~)/)) {
    const m = /^~([a-z])~$/.exec(part);
    if (m) { color = colorOf.get(m[1]) || color; continue; }
    if (part) out += `<span style="color:${color}">${esc(part)}</span>`;
  }
  return out;
}

const field = (id, label, value, attrs = {}) => `<label class="field">${label}<input type="number" id="${id}" value="${value}" ${Object.entries(attrs).map(([k, v]) => k + '=' + v).join(' ')}></label>`;

export function actionSection(item) {
  if (!isSp()) return '';
  const act = item.action || makeAction(null);
  const t = act.type;
  let params = '';
  if (t === 'health' || t === 'armour') params = field('actAmount', 'Quantidade', act.amount, { min: 1, max: 250, step: 1 });
  else if (t === 'money') params = field('actAmount', 'Valor (US$)', act.amount, { min: 1, step: 100 });
  else if (t === 'weapon') params = `<label class="field">Arma<select id="actWeapon">${WEAPONS.map(w => `<option value="${w.id}" ${w.id === act.weapon ? 'selected' : ''}>${w.name}</option>`).join('')}</select></label>`
    + field('actAmmo', 'Munição', act.ammo, { min: 1, max: 99999, step: 10 });
  else if (t === 'wanted') params = field('actStars', 'Estrelas (0 limpa)', act.stars, { min: 0, max: 6, step: 1 });
  else if (t === 'teleport') params = `<div class="door-row">${field('actX', 'X', act.x, { step: 0.1 })}${field('actY', 'Y', act.y, { step: 0.1 })}${field('actZ', 'Z', act.z, { step: 0.1 })}${field('actRot', 'Direção (°)', act.rot, { step: 1 })}</div>
    <button type="button" class="btn small" id="actHere">Usar a câmera</button>`;
  else if (t === 'vehicle') params = field('actModel', 'Modelo do veículo (400 a 611)', act.model, { min: 400, max: 611, step: 1 });
  else if (t === 'skin') params = field('actModel', 'Skin (0 a 311)', act.model, { min: 0, max: 311, step: 1 });
  else if (t === 'weather') params = field('actWeather', 'Clima (0 a 45)', act.weather, { min: 0, max: 45, step: 1 });
  else if (t === 'time') params = `<div class="door-row">${field('actHour', 'Hora', act.hour, { min: 0, max: 23, step: 1 })}${field('actMinute', 'Minuto', act.minute, { min: 0, max: 59, step: 1 })}</div>`;
  else if (t === 'explosion') params = `<label class="field">Tipo<select id="actExplosion">${[[0, 'Granada'], [1, 'Molotov'], [2, 'Foguete'], [4, 'Carro']].map(([v, n]) => `<option value="${v}" ${v === act.explosion ? 'selected' : ''}>${n}</option>`).join('')}</select></label>`;
  const more = t === 'none' ? '' : `${params}
    <div class="door-row">
      ${field('actPrice', 'Preço (US$, 0 = de graça)', act.price, { min: 0, step: 10 })}
      <label class="check"><input type="checkbox" id="actOnce" ${act.once ? 'checked' : ''}> Só uma vez</label>
    </div>
    <label class="field">Mensagem (opcional)<input type="text" id="actText" maxlength="200" value="${esc(act.text)}" spellcheck="false"></label>
    <div class="color-codes" id="actColors">${COLORS.map(([c, name, css]) => `<button type="button" class="btn small" data-code="${c}" title="${name}" style="color:${css}">~${c}~</button>`).join('')}</div>
    <label class="field">Estilo da mensagem<select id="actStyle"><option value="text" ${act.msgStyle !== 'box' ? 'selected' : ''}>Texto na tela</option><option value="box" ${act.msgStyle === 'box' ? 'selected' : ''}>Caixa de ajuda (fundo preto)</option></select></label>
    <div class="msg-preview ${act.msgStyle === 'box' ? 'box' : ''}" id="actPreview" ${act.text ? '' : 'hidden'}>${previewHtml(act.text)}</div>`;
  return `<div class="insp-section"><div class="insp-label">Ao entrar ou pegar</div>
    <label class="field">O que acontece<select id="actType">${TYPES.map(([v, n]) => `<option value="${v}" ${v === t ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
    ${more}
  </div>`;
}

export function bindAction(item, project, rerender) {
  const uid = item.uid;
  const save = (fn, redraw = false) => {
    project.updateItems('Alterar ação', [uid], (o) => { o.action = makeAction({ ...(o.action || {}), ...fn(o.action || makeAction(null)) }); });
    if (redraw) rerender();
  };
  const num = (id) => { const el = $('#' + id); return el ? parseFloat(el.value) : NaN; };
  const type = $('#actType');
  if (type) type.onchange = () => {
    const v = type.value;
    save(() => ({ type: v }), true);
  };
  const bindNum = (id, key, int = true) => {
    const el = $('#' + id);
    if (el) el.onchange = () => { const v = num(id); if (Number.isFinite(v)) save(() => ({ [key]: int ? Math.round(v) : v })); };
  };
  bindNum('actAmount', 'amount'); bindNum('actAmmo', 'ammo'); bindNum('actStars', 'stars'); bindNum('actModel', 'model');
  bindNum('actWeather', 'weather'); bindNum('actHour', 'hour'); bindNum('actMinute', 'minute'); bindNum('actPrice', 'price');
  bindNum('actX', 'x', false); bindNum('actY', 'y', false); bindNum('actZ', 'z', false); bindNum('actRot', 'rot', false);
  for (const [id, key] of [['actWeapon', 'weapon'], ['actExplosion', 'explosion']]) {
    const el = $('#' + id);
    if (el) el.onchange = () => save(() => ({ [key]: parseInt(el.value, 10) || 0 }));
  }
  const once = $('#actOnce');
  if (once) once.onchange = () => save(() => ({ once: once.checked }));
  const text = $('#actText');
  const preview = () => { const p = $('#actPreview'); if (p && text) { p.hidden = !text.value; p.innerHTML = previewHtml(text.value); } };
  if (text) {
    text.onchange = () => save(() => ({ text: text.value }));
    text.addEventListener('input', preview);
  }
  const colors = $('#actColors');
  if (colors) colors.onclick = (e) => {
    const b = e.target.closest('[data-code]');
    if (!b || !text) return;
    const at = text.selectionStart ?? text.value.length;
    text.value = (text.value.slice(0, at) + `~${b.dataset.code}~` + text.value.slice(text.selectionEnd ?? at)).slice(0, 200);
    text.focus();
    text.setSelectionRange(at + 3, at + 3);
    preview();
    save(() => ({ text: text.value }));
  };
  const style = $('#actStyle');
  if (style) style.onchange = () => save(() => ({ msgStyle: style.value }), true);
  const here = $('#actHere');
  if (here) here.onclick = () => {
    const cam = app.vp.camera;
    const dir = cam.getWorldDirection(new cam.position.constructor());
    const rot = ((Math.atan2(-dir.x, dir.y) * 180 / Math.PI) + 360) % 360;
    const r1 = (v) => Math.round(v * 10) / 10;
    save(() => ({ x: r1(cam.position.x), y: r1(cam.position.y), z: r1(cam.position.z), rot: Math.round(rot) }), true);
    toast('Destino colocado onde está a câmera');
  };
}
