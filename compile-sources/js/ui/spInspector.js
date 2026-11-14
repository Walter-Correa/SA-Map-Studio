// Singleplayer inspector parts: what a NPC carries and does, and what happens when a checkpoint or a pickup is used.
import { app, $, esc, toast } from './common.js';
import { t } from './i18n.js';
import { makeAction, makeMenu, menuText, MENU_BAD_CHARS, MENU_MAX, MENU_TEXT_MAX, STAT_RANGE } from '../editor/project.js';
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
  ['money', 'Dar dinheiro'], ['weapon', 'Dar uma arma'], ['ammo', 'Máximo de munição para armas equipadas'], ['skills', 'Máximo de skills para todas as armas'], ['wanted', 'Mudar o nível de procurado'],
  ['teleport', 'Teleportar o jogador'], ['vehicle', 'Dar um veículo'], ['repair', 'Consertar o veículo do jogador'], ['nitro', 'Instalar nitro no veículo'],
  ['jetpack', 'Dar um jetpack'], ['save', 'Salvar o jogo'], ['skin', 'Trocar a skin do jogador'], ['weather', 'Mudar o clima'], ['time', 'Mudar a hora'],
  ['explosion', 'Explosão (armadilha)'],
  ['statFat', 'Alterar gordura'], ['statMuscle', 'Alterar músculos'], ['statStamina', 'Alterar stamina'], ['statLung', 'Alterar fôlego'],
  ['statMaxHealth', 'Alterar saúde máxima'], ['statRespect', 'Alterar respeito'], ['statSex', 'Alterar sex appeal'],
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

export const actionName = (type) => (TYPES.find(([v]) => v === type) || TYPES[0])[1];

// A text for the game (menus): its font only draws plain letters. Cyrillic is written in Latin letters, accents go away;
// `codes` keeps the game's ~k~ codes (for the help text)
const LATIN = { ł: 'l', Ł: 'L', ı: 'i', İ: 'I', đ: 'd', Đ: 'D', ß: 'ss', ø: 'o', Ø: 'O', æ: 'ae', Æ: 'AE', œ: 'oe', Œ: 'OE' };
const CYR = 'а:a б:b в:v г:g д:d е:e ё:e ж:zh з:z и:i й:y к:k л:l м:m н:n о:o п:p р:r с:s т:t у:u ф:f х:h ц:ts ч:ch ш:sh щ:sht ъ:a ь: ю:yu я:ya і:i ї:yi є:ye ґ:g ы:y э:e';
const CYR_MAP = Object.fromEntries(CYR.split(' ').map(p => p.split(':')));
function plainLetters(text) {
  let out = '';
  for (const ch of String(text || '')) {
    const low = ch.toLowerCase();
    if (CYR_MAP[low] !== undefined) {
      const l = CYR_MAP[low];
      out += ch !== low && l ? l[0].toUpperCase() + l.slice(1) : l;
    } else out += LATIN[ch] ?? ch;
  }
  return out.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
export function gameText(text, codes = false) {
  const out = plainLetters(text);
  return codes ? out.replace(/[^\x20-\x7e]/g, '').trim() : out.replace(MENU_BAD_CHARS, '').replace(/\s+/g, ' ').trim();
}

function paramsHtml(act, P) {
  const t = act.type;
  let params = '';
  if (t === 'health' || t === 'armour') params = field(P + 'Amount', 'Quantidade', act.amount, { min: 1, max: 250, step: 1 });
  else if (STAT_RANGE[t] || t.startsWith('stat')) params = field(P + 'Stat', STAT_RANGE[t] ? 'Valor (569 a 1000)' : 'Valor (0 a 1000)', act.statValue, { min: (STAT_RANGE[t] || [0])[0], max: 1000, step: 1 });
  else if (t === 'money') params = field(P + 'Amount', 'Valor (US$)', act.amount, { min: 1, step: 100 });
  else if (t === 'weapon') params = `<label class="field">Arma<select id="${P}Weapon">${WEAPONS.map(w => `<option value="${w.id}" ${w.id === act.weapon ? 'selected' : ''}>${w.name}</option>`).join('')}</select></label>`
    + field(P + 'Ammo', 'Munição', act.ammo, { min: 1, max: 99999, step: 10 });
  else if (t === 'wanted') params = field(P + 'Stars', 'Estrelas (0 limpa)', act.stars, { min: 0, max: 6, step: 1 });
  else if (t === 'teleport') params = `<div class="door-row">${field(P + 'X', 'X', act.x, { step: 0.1 })}${field(P + 'Y', 'Y', act.y, { step: 0.1 })}${field(P + 'Z', 'Z', act.z, { step: 0.1 })}${field(P + 'Rot', 'Direção (°)', act.rot, { step: 1 })}</div>
    <button type="button" class="btn small" id="${P}Here">Usar a câmera</button>`;
  else if (t === 'vehicle') params = field(P + 'Model', 'Modelo do veículo (400 a 611)', act.model, { min: 400, max: 611, step: 1 });
  else if (t === 'skin') params = field(P + 'Model', 'Skin (0 a 311)', act.model, { min: 0, max: 311, step: 1 });
  else if (t === 'weather') params = field(P + 'Weather', 'Clima (0 a 45)', act.weather, { min: 0, max: 45, step: 1 });
  else if (t === 'time') params = `<div class="door-row">${field(P + 'Hour', 'Hora', act.hour, { min: 0, max: 23, step: 1 })}${field(P + 'Minute', 'Minuto', act.minute, { min: 0, max: 59, step: 1 })}</div>`;
  else if (t === 'explosion') params = `<label class="field">Tipo<select id="${P}Explosion">${[[0, 'Granada'], [1, 'Molotov'], [2, 'Foguete'], [4, 'Carro']].map(([v, n]) => `<option value="${v}" ${v === act.explosion ? 'selected' : ''}>${n}</option>`).join('')}</select></label>`;
  return params;
}

function extrasHtml(act, P, once = true) {
  return `
    <div class="door-row">
      ${field(P + 'Price', 'Preço (US$, 0 = de graça)', act.price, { min: 0, step: 10 })}
      ${once ? `<label class="check"><input type="checkbox" id="${P}Once" ${act.once ? 'checked' : ''}> Só uma vez</label>` : ''}
    </div>
    <label class="field">Mensagem (opcional)<input type="text" id="${P}Text" maxlength="200" value="${esc(act.text)}" spellcheck="false"></label>
    <div class="color-codes" id="${P}Colors">${COLORS.map(([c, name, css]) => `<button type="button" class="btn small" data-code="${c}" title="${name}" style="color:${css}">~${c}~</button>`).join('')}</div>
    <label class="field">Estilo da mensagem<select id="${P}Style"><option value="text" ${act.msgStyle !== 'box' ? 'selected' : ''}>Texto na tela</option><option value="box" ${act.msgStyle === 'box' ? 'selected' : ''}>Caixa de ajuda (fundo preto)</option></select></label>
    <div class="msg-preview ${act.msgStyle === 'box' ? 'box' : ''}" id="${P}Preview" ${act.text ? '' : 'hidden'}>${previewHtml(act.text)}</div>`;
}

export function actionSection(item) {
  if (!isSp()) return '';
  const act = item.action || makeAction(null);
  const t = act.type;
  const params = paramsHtml(act, 'act');
  const more = t === 'none' ? '' : params + extrasHtml(act, 'act');
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
  const type = $('#actType');
  if (type) type.onchange = () => {
    const v = type.value;
    save(() => ({ type: v, statValue: 1000 }), true);                                          // a stat starts at the most
  };
  bindFields('act', save);
}

// The fields of an action under the id prefix P; save(fn, redraw) stores what fn returns
function bindFields(P, save) {
  const num = (id) => { const el = $('#' + P + id); return el ? parseFloat(el.value) : NaN; };
  const bindNum = (id, key, int = true) => {
    const el = $('#' + P + id);
    if (el) el.onchange = () => { const v = num(id); if (Number.isFinite(v)) save(() => ({ [key]: int ? Math.round(v) : v })); };
  };
  bindNum('Amount', 'amount'); bindNum('Stat', 'statValue'); bindNum('Ammo', 'ammo'); bindNum('Stars', 'stars'); bindNum('Model', 'model');
  bindNum('Weather', 'weather'); bindNum('Hour', 'hour'); bindNum('Minute', 'minute'); bindNum('Price', 'price');
  bindNum('X', 'x', false); bindNum('Y', 'y', false); bindNum('Z', 'z', false); bindNum('Rot', 'rot', false);
  for (const [id, key] of [['Weapon', 'weapon'], ['Explosion', 'explosion']]) {
    const el = $('#' + P + id);
    if (el) el.onchange = () => save(() => ({ [key]: parseInt(el.value, 10) || 0 }));
  }
  const once = $('#' + P + 'Once');
  if (once) once.onchange = () => save(() => ({ once: once.checked }));
  const text = $('#' + P + 'Text');
  const preview = () => { const p = $('#' + P + 'Preview'); if (p && text) { p.hidden = !text.value; p.innerHTML = previewHtml(text.value); } };
  if (text) {
    text.onchange = () => save(() => ({ text: text.value }));
    text.addEventListener('input', preview);
  }
  const colors = $('#' + P + 'Colors');
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
  const style = $('#' + P + 'Style');
  if (style) style.onchange = () => save(() => ({ msgStyle: style.value }), true);
  const here = $('#' + P + 'Here');
  if (here) here.onclick = () => {
    const cam = app.vp.camera;
    const dir = cam.getWorldDirection(new cam.position.constructor());
    const rot = ((Math.atan2(-dir.x, dir.y) * 180 / Math.PI) + 360) % 360;
    const r1 = (v) => Math.round(v * 10) / 10;
    save(() => ({ x: r1(cam.position.x), y: r1(cam.position.y), z: r1(cam.position.z), rot: Math.round(rot) }), true);
    toast('Destino colocado onde está a câmera');
  };
}

// ---------------------------------------------------------------------------  the menu of checkpoints and pickups
// The options are actions too; the one being edited is remembered per item
const menuSel = new Map();
const BAD_NOTE = "O jogo só mostra letras sem acento, números, espaço e . , ! ? ' ( ) - + / : $";
const defaultLabel = (type) => gameText(t(actionName(type)));

export function menuSection(item) {
  if (!isSp()) return '';
  const m = item.menu || makeMenu({});
  let html = `<div class="insp-section"><div class="insp-label">Menu no jogo</div>
    <label class="check"><input type="checkbox" id="mnuOn" ${m.on ? 'checked' : ''}> Abrir um menu ao entrar ou pegar</label>`;
  if (m.on) {
    const k = Math.min(menuSel.get(item.uid) ?? 0, m.options.length - 1);
    html += `<label class="field">Título do menu<input type="text" id="mnuTitle" maxlength="${MENU_TEXT_MAX}" value="${esc(m.title)}" placeholder="${esc(gameText(t('Escolha uma opção')))}" spellcheck="false"></label>
    <p class="insp-note warn" id="mnuBad" hidden>${BAD_NOTE}</p>
    <ul class="menu-opts" id="mnuList">${m.options.map((o, i) => `<li class="menu-opt ${i === k ? 'sel' : ''}" data-k="${i}"><span>${esc(o.label || defaultLabel(o.type))}</span><button type="button" class="btn small icon" data-del="${i}" title="Remover opção"><svg><use href="#i-trash"/></svg></button></li>`).join('')}</ul>
    <button type="button" class="btn small" id="mnuAdd" ${m.options.length >= MENU_MAX ? 'disabled' : ''}><svg><use href="#i-plus"/></svg>Adicionar opção</button>
    <p class="insp-note">No jogo: setas para escolher, correr para confirmar, entrar no veículo para sair. Até ${MENU_MAX} opções.</p>`;
    const o = m.options[k];
    if (o) {
      html += `<div class="menu-edit">
        <label class="field">Opção ${k + 1}<select id="moType">${TYPES.filter(([v]) => v !== 'none').map(([v, n]) => `<option value="${v}" ${v === o.type ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
        <label class="field">Nome no menu<input type="text" id="moLabel" maxlength="${MENU_TEXT_MAX}" value="${esc(o.label)}" placeholder="${esc(defaultLabel(o.type))}" spellcheck="false"></label>
        <p class="insp-note warn" id="moBad" hidden>${BAD_NOTE}</p>
        ${paramsHtml(o, 'mo')}${extrasHtml(o, 'mo', false)}
      </div>`;
    }
  }
  return html + '</div>';
}

export function bindMenu(item, project, rerender) {
  const uid = item.uid;
  const saveMenu = (fn, redraw = true) => {
    project.updateItems('Alterar menu', [uid], (o) => { const m = makeMenu(o.menu || {}); fn(m); o.menu = makeMenu(m); });
    if (redraw) rerender();
  };
  const on = $('#mnuOn');
  if (on) on.onchange = () => saveMenu((m) => {
    m.on = on.checked;
    if (m.on && !m.options.length) m.options.push(makeAction({ type: 'health' }));
  });
  // the game cannot draw some letters: they are taken out as they are typed
  const clean = (el, warn) => {
    if (!el) return;
    el.addEventListener('input', () => {
      const fixed = plainLetters(el.value).replace(MENU_BAD_CHARS, '').slice(0, MENU_TEXT_MAX); // accents become plain letters, the rest goes
      if (warn && fixed !== el.value) warn.hidden = false;
      if (fixed !== el.value) { const at = el.selectionStart; const p = Math.max(0, at - (el.value.length - fixed.length)); el.value = fixed; el.setSelectionRange(p, p); }
    });
  };
  const title = $('#mnuTitle');
  clean(title, $('#mnuBad'));
  if (title) title.onchange = () => saveMenu((m) => { m.title = menuText(title.value).trim(); }, false);
  const list = $('#mnuList');
  if (list) list.onclick = (e) => {
    const del = e.target.closest('[data-del]');
    if (del) {
      const k = +del.dataset.del;
      saveMenu((m) => { m.options.splice(k, 1); if (!m.options.length) m.on = false; });
      menuSel.set(uid, Math.max(0, k - 1));
      return;
    }
    const li = e.target.closest('[data-k]');
    if (li) { menuSel.set(uid, +li.dataset.k); rerender(); }
  };
  const add = $('#mnuAdd');
  if (add) add.onclick = () => {
    let n = 0;
    saveMenu((m) => { if (m.options.length < MENU_MAX) m.options.push(makeAction({ type: 'health' })); n = m.options.length; }, false);
    menuSel.set(uid, n - 1);
    rerender();
  };
  const k = menuSel.get(uid) ?? 0;
  const saveOpt = (fn, redraw = false) => saveMenu((m) => { const o = m.options[Math.min(k, m.options.length - 1)]; if (o) Object.assign(o, fn(o)); }, redraw);
  const type = $('#moType');
  if (type) type.onchange = () => saveOpt(() => ({ type: type.value, statValue: 1000 }), true);
  const label = $('#moLabel');
  clean(label, $('#moBad'));
  if (label) label.onchange = () => saveOpt(() => ({ label: menuText(label.value).trim() }), true);
  bindFields('mo', saveOpt);
}
