// SPDX-License-Identifier: MPL-2.0
// Inspector part of the open.mp NPCs: an actor of a Multiplayer project for open.mp can become a NPC controlled by the server
// (see editor/ompNpc.js). SA-MP projects show the option locked: the NPC component only exists in open.mp.
import { app, $, $$, esc, fmt, toast, modelLabel } from './common.js';
import {
  normalizeNpc, newNpc, normalizeAction, NPC_ACTIONS, actionInfo, FIGHT_STYLES, SPECIAL_ACTIONS, WEAPON_SKILLS, WEAPON_STATES,
  isMeleeWeapon, cleanNpcName, uniqueNpcName, projectNpcs,
} from '../editor/ompNpc.js';
import { WEAPONS } from '../world/spWeapons.js';
import { ALL_WEAPONS } from '../world/weapons.js';
import { streetRoute, streetsKey, refreshNpcStreets, streetsFailed } from '../editor/npcRoute.js';
import { refreshNpcOverlay, previewNpc, stopNpcPreview, npcPreviewing, setNpcPointSelectHandler } from '../editor/npcOverlay.js';

let pick = null; // { uid, kind: 'add' | 'route' | 'act', act }
const opt = (list, cur) => list.map(([v, l]) => `<option value="${esc(v)}" ${String(v) === String(cur) ? 'selected' : ''}>${esc(l)}</option>`).join('');
const MODES = [['idle', 'Parado (animação, olhar)'], ['path', 'Caminho desenhado (patrulha, motorista)'], ['wander', 'Passear pelas ruas'], ['guard', 'Guarda (ataca quem chegar perto)'], ['follow', 'Seguir o jogador'], ['playback', 'Gravação (.rec)']];
const MOVES = [['auto', 'Automático'], ['walk', 'Andando'], ['jog', 'Correndo'], ['sprint', 'Disparada'], ['drive', 'Dirigindo']];
const LOOPS = [['loop', 'Em laço (volta ao 1º ponto)'], ['pingpong', 'Ida e volta'], ['once', 'Uma vez']];
const DAMAGE = [['none', 'Nada'], ['fight', 'Revidar (ataca quem atirou)'], ['flee', 'Fugir']];
const GEARS = [[0, 'Baixado'], [1, 'Recolhido']];
const LIMITS = [['free', 'Livre, pelo mapa todo'], ['radius', 'Dentro de um raio'], ['area', 'Dentro de uma área (tipo gangzone)']];
const STARTS = [['seen', 'Quando um jogador o vê'], ['create', 'Assim que é criado']];
const MELEE_KINDS = [['mix', 'Comum e especial, alternados'], ['normal', 'Só o comum'], ['special', 'Só o especial do estilo']];
const AIM_MOVES = [['stop', 'Para e atira'], ['walk', 'Atira andando']];
const AIM_AT = [['body', 'Corpo'], ['head', 'Cabeça'], ['legs', 'Pernas']];
const NO_AMMO = [['melee', 'Guarda a arma e luta corpo a corpo'], ['flee', 'Foge'], ['stay', 'Fica mirando']];
let lastRerender = null;
// The NPC weapons: the game's list plus the dildos, vibrators, flowers and cane (ids 10 to 15), which the NPCs also use
const NPC_WEAPON_LIST = [...WEAPONS.filter(w => ![43, 46].includes(w.id)), ...ALL_WEAPONS.filter(w => w.weaponId >= 10 && w.weaponId <= 15).map(w => ({ id: w.weaponId, name: w.name }))]
  .sort((a, b) => a.id - b.id);
const weaponOpts = (cur) => `<option value="0">Nenhuma (soco)</option>` + NPC_WEAPON_LIST.map(w =>`<option value="${w.id}" ${w.id === cur ? 'selected' : ''}>${esc(w.name)}</option>`).join('');
const vehOpts = (cur, none = 'Nenhum') => `<option value="">${none}</option>` + (app.project.vehicles || []).map((v, i) => `<option value="${v.uid}" ${v.uid === cur ? 'selected' : ''}>${i + 1}. ${esc(modelLabel(v.model))}${v.comment ? ' — ' + esc(v.comment) : ''}</option>`).join('');
const objOpts = (cur) => `<option value="">Nenhum</option>` + (app.project.objects || []).filter(o => !o.attach).map((o, i) => `<option value="${o.uid}" ${o.uid === cur ? 'selected' : ''}>${i + 1}. ${esc(modelLabel(o.model))}${o.comment ? ' — ' + esc(o.comment) : ''}</option>`).join('');
const recOpts = (cur) => `<option value="">Nenhuma</option>` + Object.keys(app.project.recordings || {}).sort().map(r => `<option value="${esc(r)}" ${r === cur ? 'selected' : ''}>${esc(r)}</option>`).join('');

export function ompNpcSection(a) {
  const p = app.project;
  if (!p || p.mode === 'sp') return '';
  if (p.server === 'samp') {
    return `<div class="insp-section"><div class="insp-label">NPC controlável (open.mp)</div>
      <label class="check"><input type="checkbox" disabled> Transformar em NPC controlável</label>
      <div class="insp-note">Exige open.mp. Este projeto é para SA-MP: mude o servidor do projeto para open.mp no painel do projeto (clique no mapa sem nada selecionado).</div></div>`;
  }
  const n = a.npc;
  const head = `<div class="insp-label">NPC controlável (open.mp)</div>
    <label class="check"><input type="checkbox" id="chkOmpNpc" ${n ? 'checked' : ''}> Transformar em NPC controlável</label>`;
  if (!n) return `<div class="insp-section">${head}<div class="insp-note">Um NPC do open.mp é um jogador controlado pelo servidor: anda por caminhos e pelas ruas, dirige, atira, segue o jogador, reage a tiros e toca gravações.</div></div>`;
  const ranged = n.weapon && !isMeleeWeapon(n.weapon);
  const drives = !!n.vehicle && n.vehicle.seat === 0;
  // Groups that open and close (remembered while the editor is open)
  const sec = (id, title, body) => `<details class="insp-section npc-sec" data-npc-sec="${id}" ${closedSecs.has(id) ? '' : 'open'}><summary class="insp-label">${title}</summary>${body}</details>`;
  const num = (label, key, min, max, step, title = '') => `<label${title ? ` title="${esc(title)}"` : ''}>${label}<input type="number" min="${min}" max="${max}" step="${step}" data-npc="${key}" value="${Number.isInteger(n[key]) ? n[key] : fmt(n[key])}"></label>`;
  const sel = (label, key, list, rerender = false) => `<label>${label}<select data-npc="${key}" ${rerender ? 'data-rerender' : ''}>${opt(list, n[key])}</select></label>`;
  const chk = (label, key, rerender = false) => `<label class="check"><input type="checkbox" data-npc="${key}" ${rerender ? 'data-rerender' : ''} ${n[key] ? 'checked' : ''}> ${label}</label>`;
  const pair = (...f) => `<div class="pair" style="margin-top:4px;">${f.join('')}</div>`;
  const note = (t, warn = false) => `<div class="insp-note${warn ? ' warn' : ''}">${t}</div>`;
  const MOVES3 = [['walk', 'Andando'], ['jog', 'Correndo'], ['sprint', 'Disparada']];

  let html = `<div class="insp-section">${head}
    <div class="pair" style="margin-top:6px;"><label>Nome do NPC (nome de jogador)<input data-npc="name" maxlength="24" value="${esc(n.name)}" spellcheck="false"></label></div>
    ${nameWarning(a)}${countWarning()}</div>`;

  // 1. Behaviour
  let b = pair(sel('O que ele faz', 'mode', MODES, true));
  const moveRow = pair(sel('Como se move', 'moveType', MOVES), num('Velocidade (m/s, 0 = do tipo)', 'speed', 0, 100, 0.5))
    + (drives ? note('Como motorista ele sempre dirige: com outro tipo de movimento o open.mp tiraria o NPC do veículo.') : '');
  if (n.mode === 'idle') {
    b += `<div style="margin-top:6px;">${chk('Olhar para o jogador que chegar perto', 'look', true)}</div>${n.look ? pair(num('Distância (m)', 'range', 1, 300, 1)) : ''}`;
  } else if (n.mode === 'path') {
    b += pair(sel('Repetição', 'loop', LOOPS)) + moveRow
      + pair(num('Arredondar as curvas (m, 0 = não)', 'smooth', 0, 20, 0.5, 'Troca cada canto do caminho por uma curva que começa e termina a essa distância dele: o veículo vira suave em vez de girar no ponto'))
      + pathEditor(a);
  } else if (n.mode === 'wander') {
    b += moveRow + pair(sel('Onde passeia', 'wanderLimit', LIMITS, true));
    if (n.wanderLimit === 'radius') b += pair(num(drives ? 'Raio a partir do veículo (m)' : 'Raio a partir do lugar dele (m)', 'wanderRadius', 10, 3000, 10));
    if (n.wanderLimit === 'area') {
      const ar = n.area || {};
      const picking = pick && pick.uid === a.uid && pick.kind === 'area';
      b += `<div class="mini-actions" style="margin-top:4px;"><button type="button" class="btn small ${picking ? 'active' : ''}" data-npc-act="area"><svg><use href="#i-map"/></svg>${picking ? 'Clique nos dois cantos' : 'Desenhar a área no mapa'}</button></div>
        ${n.area ? `<div class="pair" style="margin-top:4px;"><label>X mín.<input type="number" step="1" data-npc-area="x1" value="${fmt(ar.x1, 1)}"></label><label>Y mín.<input type="number" step="1" data-npc-area="y1" value="${fmt(ar.y1, 1)}"></label></div>
        <div class="pair" style="margin-top:4px;"><label>X máx.<input type="number" step="1" data-npc-area="x2" value="${fmt(ar.x2, 1)}"></label><label>Y máx.<input type="number" step="1" data-npc-area="y2" value="${fmt(ar.y2, 1)}"></label></div>` : note('Clique em dois cantos opostos no mapa, como uma gangzone.')}`;
    }
    if (n.wanderLimit !== 'free') {
      if (drives) b += pair(num('Faixa: metros à direita do meio da rua', 'lane', 0, 10, 0.5, '0 = no meio da rua; nas ruas de mão única ele fica no meio'));
      b += pair(num('Arredondar as curvas (m, 0 = não)', 'smooth', 0, 20, 0.5, 'Troca cada esquina por uma curva que começa e termina a essa distância dela'));
      b += streetsNote(a);
    } else {
      b += note('Livre: anda pelas calçadas, ou dirige pelas ruas como motorista, passando de uma área do mapa para outra pelo meio da rua (NPC_PlayNode, do open.mp). Antes, anda ou dirige até o ponto de rua mais perto. Para ficar numa faixa e dentro de um lugar, use um raio ou uma área.');
    }
  } else if (n.mode === 'guard') {
    b += pair(num('Alcance (m)', 'range', 1, 300, 1)) + `<div style="margin-top:6px;">${chk('Persegue o alvo', 'chase')}</div>`
      + note('Ataca o jogador que entrar no alcance (com a arma ou na mão) e volta ao lugar quando ele sai ou morre.');
  } else if (n.mode === 'follow') {
    b += moveRow + pair(num('Distância do jogador (m)', 'followDist', 0.5, 50, 0.5), num('Procura o jogador até (m)', 'followRange', 5, 1000, 5))
      + pair(num('Atualiza o destino a cada (ms)', 'chaseUpdate', 100, 5000, 50, 'NPC_MoveToPlayer: de quanto em quanto tempo ele confere onde o jogador está'))
      + note('Segue o jogador mais perto. Com "Revidar" em "Ao levar dano", defende-se de quem atirar nele.');
  } else if (n.mode === 'playback') {
    b += recEditor(a);
  }
  if (['path', 'wander', 'playback'].includes(n.mode)) b += pair(sel('Começa', 'startWhen', STARTS));
  if (['path', 'playback'].includes(n.mode)) {
    b += `<div class="mini-actions" style="margin-top:8px;">
      <button type="button" class="btn small primary" data-npc-act="preview"><svg><use href="#i-${npcPreviewing(a.uid) ? 'stop' : 'play'}"/></svg>${npcPreviewing(a.uid) ? 'Parar a prévia' : 'Prévia no editor'}</button></div>`;
  }
  html += sec('beh', 'Comportamento', b);

  // 2. Health and damage
  html += sec('life', 'Vida e dano', pair(num('Colete', 'armour', 0, 100, 1), num('Renascer após (s, 0 = não)', 'respawn', 0, 3600, 1))
    + pair(num('Dano recebido (×, 1 = o do jogo)', 'dmgMult', 0.05, 100, 0.05, 'Um soco do jogo tira pouca vida: com 2, o NPC leva o dobro de dano; com 0,5, a metade'))
    + note('A vida e "Invulnerável" ficam nas propriedades do actor, acima.'));

  // 3. Fights
  const fights = n.mode === 'guard' || n.onDamage === 'fight';
  // A guard always fights back: "Ao levar dano" would have no effect on it
  let f = n.mode === 'guard' ? pair(sel('Estilo de luta', 'fightStyle', FIGHT_STYLES)) + note('A guarda sempre revida quem a ataca.')
    : pair(sel('Ao levar dano', 'onDamage', DAMAGE, true), sel('Estilo de luta', 'fightStyle', FIGHT_STYLES));
  if (fights) {
    f += pair(sel('Como persegue', 'chaseMove', MOVES3), num('Desiste a (m, 0 = automático)', 'giveUp', 0, 1000, 5, 'Automático: a guarda desiste a 1,5 vez o alcance dela; os outros, a 60 m'))
      + pair(num('Atualiza o destino a cada (ms)', 'chaseUpdate', 100, 5000, 50, 'NPC_MoveToPlayer: de quanto em quanto tempo ele confere onde o alvo está'));
    f += `<div class="insp-label" style="margin-top:8px;">Corpo a corpo</div>`
      + pair(sel('Golpes', 'meleeKind', MELEE_KINDS), num('Entre golpes (ms, -1 = da arma)', 'meleeTime', -1, 10000, 50))
      + pair(num('Alcance do golpe (m)', 'meleeReach', 0.8, 3, 0.1, 'A que distância do alvo ele para e golpeia'))
      + note('O golpe especial é o do estilo de luta (mirar + golpe secundário, NPC_MeleeAttack). O golpe comum é igual em todos os estilos.');
    if (ranged) {
      f += `<div class="insp-label" style="margin-top:8px;">Com a arma de fogo</div>`
        + pair(num('Atira de até (m)', 'shootDist', 1, 100, 1), sel('Ao atirar', 'aimMove', AIM_MOVES))
        + pair(sel('Mira em', 'aimAt', AIM_AT), num('Entre tiros (ms, -1 = da arma)', 'shootDelay', -1, 10000, 50))
        + pair(sel('Sem munição', 'noAmmo', NO_AMMO))
        + note('Fora do alcance ele guarda a mira e corre atrás; ao chegar, para e atira (ou atira andando).');
    }
  }
  const flees = n.onDamage === 'flee' && n.mode !== 'guard';
  if (flees || (ranged && n.noAmmo === 'flee' && fights)) f += pair(num('Foge até (m)', 'fleeDist', 3, 300, 1), sel('Como foge', 'fleeMove', MOVES3));
  if (fights && ['idle', 'guard'].includes(n.mode)) f += pair(sel('Volta ao lugar', 'returnMove', MOVES3));
  // In a vehicle: to fight it gets out (and gets back in after); to flee, a driver drives away
  if (n.vehicle && n.onDamage === 'fight') f += note('No veículo, ele desce para lutar e depois volta para o veículo e segue dali.');
  else if (drives && flees) f += note('Como motorista, ele foge dirigindo e depois segue dali.');
  html += sec('fight', 'Reação e luta', f);

  // 4. Weapon
  const acc = n.accuracy;
  html += sec('weapon', 'Arma', `<div class="pair"><label>Arma<select data-npc="weapon" data-rerender>${weaponOpts(n.weapon)}</select></label>
      ${ranged ? `<label>Munição<input type="number" min="0" step="1" data-npc="ammo" value="${n.ammo}"></label>` : ''}</div>
    ${ranged ? `<div class="pair" style="margin-top:4px;">${chk('Munição infinita', 'infiniteAmmo')}${chk('Recarrega', 'reload')}</div>
      <div class="insp-label" style="margin-top:8px;">Ajustes da arma (NPC_SetWeapon…)</div>
      <label class="check"><input type="checkbox" data-npc-def="accuracy" ${acc < 0 ? 'checked' : ''}> Precisão do jogo</label>
      ${acc >= 0 ? `<label class="npc-range">Precisão: <b data-npc-out>${Math.round(acc * 100)}%</b><input type="range" min="0" max="1" step="0.01" data-npc="accuracy" value="${acc}"></label>` : ''}
      ${pair(num('Balas no pente ao nascer (-1 = cheio)', 'clip', -1, 9999, 1), num('Tamanho do pente (-1 = do jogo)', 'clipSize', -1, 9999, 1))}
      ${pair(num('Tempo entre tiros (ms, -1 = do jogo)', 'shootTime', -1, 60000, 10), num('Tempo de recarga (ms, -1 = do jogo)', 'reloadTime', -1, 60000, 50))}` : ''}
    <details style="margin-top:6px;"><summary>Habilidade com as armas (0 a 999, -1 = padrão)</summary>
      <div class="npc-grid">${WEAPON_SKILLS.map((w, i) => `<label>${esc(w)}<input type="number" min="-1" max="999" step="1" data-npc-skill="${i}" value="${n.skills[i]}"></label>`).join('')}</div>
    </details>`);

  // 5. Vehicle and surf
  const v = n.vehicle || {}, onFoot = ['idle', 'guard'].includes(n.mode); // these kinds of NPC stay on foot
  html += sec('veh', 'Veículo', `<div class="pair"><label>No veículo<select data-npc-veh="uid" data-rerender ${onFoot ? 'disabled' : ''}>${vehOpts(onFoot ? '' : v.uid)}</select></label>
      ${n.vehicle ? `<label>Assento (0 = motorista)<input type="number" min="0" max="10" step="1" data-npc-veh="seat" value="${v.seat}"></label>` : ''}</div>
    ${drives ? `<div class="pair" style="margin-top:4px;"><label class="check"><input type="checkbox" data-npc-veh="siren" ${v.siren ? 'checked' : ''}> Sirene ligada</label>
      <label>Vida do veículo<input type="number" min="0" step="50" data-npc-veh="health" value="${fmt(v.health)}"></label></div>` : ''}
    ${onFoot ? note('Parado e guarda ficam a pé: escolha outro tipo de NPC para usar um veículo.') : (app.project.vehicles || []).length ? '' : note('Coloque um veículo no mapa para o NPC dirigir ou ir de passageiro.')}`);
  const s = n.surf || {};
  html += sec('surf', 'Em cima de (surf)', `<div class="pair"><label>Tipo<select data-npc-surf="type" data-rerender>${opt([['', 'Nada'], ['vehicle', 'Veículo'], ['object', 'Objeto']], n.surf ? s.type : '')}</select></label>
      ${n.surf ? `<label>${s.type === 'object' ? 'Objeto' : 'Veículo'}<select data-npc-surf="uid" data-rerender>${s.type === 'object' ? objOpts(s.uid) : vehOpts(s.uid)}</select></label>` : ''}</div>
    ${n.surf ? `<div class="pair" style="margin-top:4px;"><label>X<input type="number" step="0.1" data-npc-surf="ox" value="${fmt(s.ox)}"></label><label>Y<input type="number" step="0.1" data-npc-surf="oy" value="${fmt(s.oy)}"></label><label>Z<input type="number" step="0.1" data-npc-surf="oz" value="${fmt(s.oz)}"></label></div>
      ${s.type === 'object' ? note('O objeto é criado com CreateObject (o surf precisa de um objeto do servidor), também quando o mapa usa o Streamer.') : ''}` : ''}`);

  // 6. Seen by the players
  const hex = (c) => '#' + ((c >>> 8) & 0xFFFFFF).toString(16).padStart(6, '0');
  html += sec('look', 'Para os jogadores', `<div class="pair"><label>Cor no radar<input type="color" data-npc-color="color" value="${hex(n.color)}"></label>
      ${chk('Ícone no radar', 'marker')}</div>
    ${pair(sel('Ação especial', 'special', SPECIAL_ACTIONS), num('Interior', 'interior', 0, 255, 1))}
    ${pair(`<label>Balão de fala (vazio = nenhum)<input data-npc="bubble" data-rerender maxlength="120" value="${esc(n.bubble)}"></label>`)}
    ${n.bubble ? pair(`<label>Cor do balão<input type="color" data-npc-color="bubbleColor" value="${hex(n.bubbleColor)}"></label>`, num('Visto de até (m)', 'bubbleDist', 1, 200, 1)) : ''}
    ${note('O ícone no radar aparece quando o gamemode mostra os marcadores (ShowPlayerMarkers). O jogo não mostra nome, vida nem colete sobre um NPC.')}`);
  html += note('Teste de verdade: botão Testar no mapa. O servidor de teste do open.mp roda exatamente o código exportado.');
  return html;
}
const closedSecs = new Set(); // every group starts open; the ones the user closes stay closed

// The street graph of a NPC that wanders inside a radius or an area: made here when its settings change
const making = new Set();
function streetsNote(a) {
  const key = streetsKey(a, app.project), st = a.npc.streets;
  if (!key) return '';
  if (!st || st.key !== key) {
    // The street files could not be read (the editor's server stopped?): says so; the button, a test or an export try again
    if (streetsFailed(key) && !making.has(a.uid)) {
      return `<div class="insp-note warn">Não consegui ler as ruas do lugar.</div>
        <div class="mini-actions" style="margin-top:4px;"><button type="button" class="btn small" data-npc-act="streets">Tentar de novo</button></div>`;
    }
    if (!making.has(a.uid)) {
      making.add(a.uid);
      refreshNpcStreets([app.project]).then(() => { making.delete(a.uid); refreshNpcOverlay(); if (app.editor.selection.includes(a.uid)) lastRerender?.(); });
    }
    return '<div class="insp-note">Lendo as ruas do lugar…</div>';
  }
  if (!st.nodes.length) return '<div class="insp-note warn">Não há ruas aqui para ele (com veículo, ruas de carro; a pé, calçadas). Aumente o raio ou a área.</div>';
  return `<div class="insp-note">${st.nodes.length} pontos de rua no lugar (em verde-azulado no mapa, com a faixa).</div>${st.cut ? '<div class="insp-note warn">A área é grande: só parte das ruas entrou.</div>' : ''}`;
}

function nameWarning(a) {
  const same = projectNpcs(app.project).filter(x => x !== a && x.npc.name.toLowerCase() === a.npc.name.toLowerCase());
  return same.length ? '<div class="insp-note warn">Outro NPC tem esse nome: na exportação ele ganha um número no fim.</div>' : '';
}

// Each NPC takes a player slot: the test server creates at most 900 of them (npc_count of serve.py) and open.mp has 1000 slots in all
function countWarning() {
  const count = projectNpcs(app.project).length;
  if (count <= 900) return '';
  return `<div class="insp-note warn">O projeto tem ${count} NPCs: o servidor de teste cria no máximo 900. No seu servidor, cada NPC ocupa uma vaga de jogador (o open.mp tem 1000 ao todo, jogadores incluídos).</div>`;
}

function pathEditor(a) {
  const n = a.npc, sel = app.npcPoint ?? -1, car = !!n.vehicle && n.vehicle.seat === 0;
  const picking = pick && pick.uid === a.uid ? pick.kind : '';
  let h = `<div class="insp-label" style="margin-top:8px;">Pontos do caminho (${n.points.length})</div>
    <div class="mini-actions">
      <button type="button" class="btn small ${picking === 'add' ? 'active' : ''}" data-npc-act="add" title="Clique no mapa para pôr pontos (Esc para parar)"><svg><use href="#i-plus"/></svg>${picking === 'add' ? 'Clicando no mapa' : 'Pôr pontos no mapa'}</button>
      ${car ? `<label style="flex:1 1 100%;">Faixa: metros à direita do meio da rua (0 = no meio)<input type="number" min="0" max="10" step="0.5" data-npc="lane" value="${fmt(n.lane)}"></label>` : ''}
      <button type="button" class="btn small ${picking === 'route' ? 'active' : ''}" data-npc-act="route" title="${car ? 'Clique no destino: o caminho segue as ruas do jogo' : 'Clique no destino: o caminho segue as calçadas do jogo'}"><svg><use href="#i-map"/></svg>${picking === 'route' ? 'Clique no destino' : (car ? 'Pelas ruas até…' : 'Pelas calçadas até…')}</button>
    </div>`;
  if (n.points.length) {
    h += `<div class="npc-points">${n.points.map((p, i) => `<div class="npc-point ${i === sel ? 'sel' : ''}" data-npc-pt="${i}">
        <span class="n">${i + 1}</span><span class="c">${fmt(p.x, 1)}, ${fmt(p.y, 1)}, ${fmt(p.z, 1)}</span>${p.acts.length ? `<span class="tag">${p.acts.length}</span>` : ''}
        <button type="button" class="btn icon tiny ghost" data-npc-ptact="up" title="Subir">▲</button>
        <button type="button" class="btn icon tiny ghost" data-npc-ptact="down" title="Descer">▼</button>
        <button type="button" class="btn icon tiny ghost danger" data-npc-ptact="del" title="Apagar ponto"><svg><use href="#i-trash"/></svg></button></div>`).join('')}</div>
      <div class="mini-actions" style="margin-top:4px;">
        <button type="button" class="btn small" data-npc-act="reverse">Inverter</button>
        <button type="button" class="btn small danger" data-npc-act="clear">Apagar todos</button></div>
      <div class="insp-note">No mapa, clique num ponto para editá-lo e arraste para mudar o lugar dele.</div>`;
  } else h += '<div class="insp-note">Clique em "Pôr pontos no mapa" e clique no chão para desenhar o caminho. Num veículo, o NPC dirige por ele.</div>';
  const p = n.points[sel];
  if (p) {
    h += `<div class="npc-pt-edit"><div class="insp-label">Ponto ${sel + 1}</div>
      <div class="pair"><label>X<input type="number" step="0.1" data-npc-ptf="x" value="${fmt(p.x)}"></label><label>Y<input type="number" step="0.1" data-npc-ptf="y" value="${fmt(p.y)}"></label><label>Z<input type="number" step="0.1" data-npc-ptf="z" value="${fmt(p.z)}"></label></div>
      <div class="pair" style="margin-top:4px;"><label>Raio de chegada (m)<input type="number" min="0.05" step="0.1" data-npc-ptf="stop" value="${fmt(p.stop)}"></label></div>
      <div class="insp-label" style="margin-top:8px;">Ações ao chegar (${p.acts.length})</div>
      ${p.acts.map((ac, ai) => actionEditor(ac, ai)).join('')}
      <div class="pair" style="margin-top:4px;"><label>Adicionar ação<select data-npc-addact><option value="">Escolha…</option>${NPC_ACTIONS.map(([t, l]) => `<option value="${t}">${esc(l)}</option>`).join('')}</select></label></div>
    </div>`;
  }
  return h;
}

function actionEditor(ac, ai) {
  const info = actionInfo(ac.t);
  const field = ([k, kind, , label]) => {
    const v = ac[k], at = `data-npc-ac="${ai}" data-npc-acf="${k}"`;
    if (kind === 'b') return `<label class="check"><input type="checkbox" ${at} ${v ? 'checked' : ''}> ${esc(label)}</label>`;
    if (kind === 'veh') return `<label>${esc(label)}<select ${at}>${vehOpts(v)}</select></label>`;
    if (kind === 'rec') return `<label>${esc(label)}<select ${at}>${recOpts(v)}</select></label>`;
    if (kind === 'weapon') return `<label>${esc(label)}<select ${at}>${weaponOpts(v)}</select></label>`;
    if (kind === 'special') return `<label>${esc(label)}<select ${at}>${opt(SPECIAL_ACTIONS, v)}</select></label>`;
    if (kind === 'move') return `<label>${esc(label)}<select ${at}>${opt(MOVES, v)}</select></label>`;
    if (kind === 'wstate') return `<label>${esc(label)}<select ${at}>${opt(WEAPON_STATES, v)}</select></label>`;
    if (kind === 'gear') return `<label>${esc(label)}<select ${at}>${opt(GEARS, v)}</select></label>`;
    if (kind === 's') return `<label>${esc(label)}<input ${at} value="${esc(v)}" spellcheck="false"></label>`;
    return `<label>${esc(label)}<input type="number" step="${kind === 'f' ? 0.1 : 1}" ${at} value="${kind === 'f' ? fmt(v) : v}"></label>`;
  };
  const hasXYZ = info.fields.some(f => f[0] === 'x');
  return `<div class="npc-action"><div class="npc-action-head"><b>${ai + 1}. ${esc(info.label)}</b>
      ${hasXYZ ? `<button type="button" class="btn icon tiny ghost ${pick?.kind === 'act' && pick.act === ai ? 'active' : ''}" data-npc-acpick="${ai}" title="Escolher o ponto no mapa"><svg><use href="#i-pin"/></svg></button>` : ''}
      <button type="button" class="btn icon tiny ghost" data-npc-acmove="${ai}" data-dir="-1" title="Subir">▲</button>
      <button type="button" class="btn icon tiny ghost" data-npc-acmove="${ai}" data-dir="1" title="Descer">▼</button>
      <button type="button" class="btn icon tiny ghost danger" data-npc-acdel="${ai}" title="Apagar ação"><svg><use href="#i-trash"/></svg></button></div>
    ${info.fields.length ? `<div class="npc-grid">${info.fields.map(field).join('')}</div>` : ''}</div>`;
}

function recEditor(a) {
  const n = a.npc, has = !!app.project.recordings?.[n.rec];
  return `<div class="pair" style="margin-top:4px;"><label>Gravação<select data-npc="rec" data-rerender>${recOpts(n.rec)}</select></label></div>
    <div class="mini-actions" style="margin-top:4px;">
      <button type="button" class="btn small" data-npc-act="recServer" title="As gravações feitas no servidor de teste com /gravar nome"><svg><use href="#i-download"/></svg>Do servidor de teste</button>
      <button type="button" class="btn small" data-npc-act="recFile"><svg><use href="#i-folder"/></svg>Arquivo .rec</button>
      ${has ? `<button type="button" class="btn small" data-npc-act="recSave"><svg><use href="#i-download"/></svg>Baixar</button>
      <button type="button" class="btn small danger" data-npc-act="recDel"><svg><use href="#i-trash"/></svg></button>` : ''}
    </div>
    <label class="check" style="margin-top:6px;"><input type="checkbox" data-npc="recFromNpc" data-rerender ${n.recFromNpc ? 'checked' : ''}> Começar onde o NPC está (senão, onde foi gravada)</label>
    <label class="check"><input type="checkbox" data-npc="recLoop" ${n.recLoop ? 'checked' : ''}> Repetir</label>
    <label class="check"><input type="checkbox" data-npc="recPreload" ${n.recPreload ? 'checked' : ''}> Pré-carregar ao abrir o mapa (NPC_LoadRecord)</label>
    <div class="insp-note">No servidor de teste, digite /gravar nome, ande ou dirija, e /gravar de novo para parar. A gravação vai para a pasta npcmodes/recordings do servidor junto com o mapa.</div>`;
}

// ---------------------------------------------------------------------------  binding
function edit(uid, label, fn, rerender) {
  app.project.updateItems(label, [uid], (o) => { if (o.npc) { fn(o.npc, o); o.npc = normalizeNpc(o.npc); } });
  refreshNpcOverlay();
  if (rerender) rerender();
}
const valOf = (el) => (el.type === 'checkbox' ? el.checked : el.type === 'number' || el.type === 'range' ? parseFloat(el.value) : el.value);

let pickWatch = false;
function setPick(next, rerender) {
  pick = next;
  const ed = app.editor;
  // Selecting something else leaves the mode
  if (!pickWatch && ed) { pickWatch = true; ed.on('selection', () => { if (pick && !ed.selection.includes(pick.uid)) setPick(null); }); }
  ed.clickHook = pick ? (pt) => onMapClick(pt, rerender) : null;
  document.body.classList.toggle('npc-picking', !!pick);
  // A bar over the map while the clicks go to the NPC: says so and leaves the mode
  let bar = document.getElementById('npcPickBar');
  if (!pick) { bar?.remove(); return; }
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'npcPickBar';
    bar.className = 'npc-pick-bar';
    document.body.appendChild(bar);
  }
  const what = pick.kind === 'add' ? 'Pondo pontos do caminho do NPC: clique no chão.' : pick.kind === 'route' ? 'Rota do NPC: clique no destino.'
    : pick.kind === 'area' ? (pick.first ? 'Área do NPC: clique no outro canto.' : 'Área do NPC: clique no primeiro canto.') : 'Clique no mapa para escolher o ponto.';
  bar.innerHTML = `<span>${esc(what)}</span><button type="button" class="btn small primary">Sair (Esc)</button>`;
  bar.querySelector('button').onclick = () => { setPick(null); rerender?.(); };
}
async function onMapClick(pt, rerender) {
  const a = pick && app.project.find(pick.uid);
  if (!a?.npc || !app.editor.selection.includes(a.uid)) { setPick(null); return false; }
  const p = { x: +pt.x.toFixed(3), y: +pt.y.toFixed(3), z: +(pt.z + 1).toFixed(3) };
  if (pick.kind === 'add') {
    edit(a.uid, 'Adicionar ponto do NPC', (n) => { n.points.push({ ...p, stop: 0.2, acts: [] }); });
    app.npcPoint = a.npc.points.length - 1;
    rerender();
  } else if (pick.kind === 'route') {
    const from = a.npc.points[a.npc.points.length - 1] || a;
    const car = !!a.npc.vehicle && a.npc.vehicle.seat === 0;
    toast('Calculando a rota pelas ruas');
    const route = await streetRoute(from, p, car, a.npc.lane);
    if (!route) { toast('Não achei um caminho pelas ruas até aí.', 'error', 4000); return true; }
    edit(a.uid, 'Rota do NPC pelas ruas', (n) => { for (const q of route) n.points.push({ ...q, stop: car ? 2 : 0.4, acts: [] }); });
    toast(`Rota com ${route.length} pontos`);
    rerender();
  } else if (pick.kind === 'area') {
    if (!pick.first) { pick.first = p; setPick(pick, rerender); return true; }
    const f = pick.first;
    edit(a.uid, 'Área do NPC', (n) => { n.area = { x1: Math.min(f.x, p.x), y1: Math.min(f.y, p.y), x2: Math.max(f.x, p.x), y2: Math.max(f.y, p.y) }; });
    setPick(null);
    rerender();
  } else if (pick.kind === 'act') {
    const i = app.npcPoint, ai = pick.act;
    edit(a.uid, 'Ponto da ação do NPC', (n) => { const ac = n.points[i]?.acts[ai]; if (ac) { ac.x = p.x; ac.y = p.y; ac.z = pt.z + 0.5; } });
    setPick(null);
    rerender();
  }
  return true;
}
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && pick) { setPick(null); app.emit('npc-pick-end'); } });

export function bindOmpNpc(a, rerender) {
  const uid = a.uid;
  if (pick && pick.uid !== uid) setPick(null);
  if (!app.editor.selection.includes(uid)) stopNpcPreview();
  const chk = $('#chkOmpNpc');
  if (chk) chk.onchange = () => {
    const used = new Set(projectNpcs(app.project).map(x => x.npc.name.toLowerCase()));
    app.project.updateItems(chk.checked ? 'Transformar em NPC' : 'Voltar a ser actor', [uid], (o) => { o.npc = chk.checked ? newNpc(o, used) : null; });
    app.npcPoint = -1;
    setPick(null); stopNpcPreview(); refreshNpcOverlay(); rerender();
  };
  if (!a.npc) return;
  lastRerender = rerender;
  $$('#inspector [data-npc-sec]').forEach(d => d.addEventListener('toggle', () => { if (d.open) closedSecs.delete(d.dataset.npcSec); else closedSecs.add(d.dataset.npcSec); }));
  // Accuracy: the slider shows the percentage while it moves; the box gives back the game's own
  $$('#inspector input[type=range][data-npc]').forEach(el => el.addEventListener('input', () => { const o = el.parentElement.querySelector('[data-npc-out]'); if (o) o.textContent = Math.round(el.value * 100) + '%'; }));
  $$('#inspector [data-npc-def]').forEach(el => el.addEventListener('change', () => edit(uid, 'Editar NPC', (n) => { n[el.dataset.npcDef] = el.checked ? -1 : 0.5; }, rerender)));
  $$('#inspector [data-npc-area]').forEach(el => el.addEventListener('change', () => {
    const v = parseFloat(el.value); if (!Number.isFinite(v)) return;
    edit(uid, 'Área do NPC', (n) => { if (n.area) n.area[el.dataset.npcArea] = v; }, rerender);
  }));
  // A point clicked or dragged in the 3D view: its fields and actions open here
  setNpcPointSelectHandler((u) => { if (u === uid) rerender(); });
  $$('#inspector [data-npc]').forEach(el => el.addEventListener('change', () => {
    const f = el.dataset.npc;
    let v = valOf(el);
    if (el.type === 'number' && !Number.isFinite(v)) return;
    if (f === 'name') { v = cleanNpcName(v); if (v.length < 3) { toast('O nome precisa de 3 a 24 letras.', 'error'); return; } }
    edit(uid, 'Editar NPC', (n) => { n[f] = v; if (f === 'mode') { setPick(null); stopNpcPreview(); if (['idle', 'guard'].includes(v)) n.vehicle = null; } if (f === 'wanderLimit' && v === 'radius' && !(n.wanderRadius > 0)) n.wanderRadius = 100; }, el.hasAttribute('data-rerender') || f === 'name' ? rerender : null);
  }));
  $$('#inspector [data-npc-color]').forEach(el => el.addEventListener('change', () => {
    const rgb = parseInt(el.value.slice(1), 16);
    if (!Number.isFinite(rgb)) return;
    edit(uid, 'Editar NPC', (n) => { n[el.dataset.npcColor] = ((rgb << 8) | 0xFF) >>> 0; });
  }));
  $$('#inspector [data-npc-skill]').forEach(el => el.addEventListener('change', () => {
    const v = parseFloat(el.value); if (!Number.isFinite(v)) return;
    edit(uid, 'Editar NPC', (n) => { n.skills[+el.dataset.npcSkill] = v; });
  }));
  $$('#inspector [data-npc-veh]').forEach(el => el.addEventListener('change', () => {
    const f = el.dataset.npcVeh, v = valOf(el);
    edit(uid, 'Veículo do NPC', (n) => {
      if (f === 'uid') n.vehicle = v ? { ...(n.vehicle || { seat: 0, siren: false, health: 1000 }), uid: v } : null;
      else if (n.vehicle) n.vehicle[f] = v;
    }, el.hasAttribute('data-rerender') || f === 'seat' ? rerender : null);
  }));
  $$('#inspector [data-npc-surf]').forEach(el => el.addEventListener('change', () => {
    const f = el.dataset.npcSurf, v = valOf(el);
    edit(uid, 'Surf do NPC', (n) => {
      if (f === 'type') {
        const list = v === 'object' ? (app.project.objects || []).filter(o => !o.attach) : app.project.vehicles || [];
        n.surf = v && list.length ? { type: v, uid: list[0].uid, ox: 0, oy: 0, oz: 1 } : null;
        if (v && !list.length) toast(v === 'object' ? 'O projeto não tem objetos.' : 'O projeto não tem veículos.', 'error');
      } else if (n.surf) n.surf[f] = v;
    }, el.hasAttribute('data-rerender') ? rerender : null);
  }));
  // Path
  $$('#inspector [data-npc-pt]').forEach(row => row.addEventListener('click', (e) => {
    const i = +row.dataset.npcPt, act = e.target.closest('[data-npc-ptact]')?.dataset.npcPtact;
    if (!act) { app.npcPoint = app.npcPoint === i ? -1 : i; refreshNpcOverlay(); rerender(); return; }
    edit(uid, 'Editar caminho do NPC', (n) => {
      const pts = n.points;
      if (act === 'del') { pts.splice(i, 1); app.npcPoint = Math.min(app.npcPoint, pts.length - 1); }
      else { const j = i + (act === 'up' ? -1 : 1); if (j >= 0 && j < pts.length) { [pts[i], pts[j]] = [pts[j], pts[i]]; app.npcPoint = j; } }
    }, rerender);
  }));
  $$('#inspector [data-npc-ptf]').forEach(el => el.addEventListener('change', () => {
    const v = parseFloat(el.value); if (!Number.isFinite(v)) return;
    edit(uid, 'Editar ponto do NPC', (n) => { const p = n.points[app.npcPoint]; if (p) p[el.dataset.npcPtf] = v; }, rerender);
  }));
  const addAct = $('#inspector [data-npc-addact]');
  if (addAct) addAct.onchange = () => {
    const t = addAct.value; if (!t) return;
    const p0 = a.npc.points[app.npcPoint] || a;
    edit(uid, 'Adicionar ação do NPC', (n) => {
      const p = n.points[app.npcPoint];
      if (p) p.acts.push(normalizeAction({ t, x: p0.x, y: p0.y + 5, z: p0.z, angle: a.rz, veh: a.npc.vehicle?.uid || app.project.vehicles?.[0]?.uid || '', rec: a.npc.rec || Object.keys(app.project.recordings || {})[0] || '' }));
    }, rerender);
  };
  $$('#inspector [data-npc-ac]').forEach(el => el.addEventListener('change', () => {
    let v = valOf(el); if (el.type === 'number' && !Number.isFinite(v)) return;
    if (el.type === 'checkbox') v = v ? 1 : 0;
    edit(uid, 'Editar ação do NPC', (n) => { const ac = n.points[app.npcPoint]?.acts[+el.dataset.npcAc]; if (ac) ac[el.dataset.npcAcf] = v; });
  }));
  $$('#inspector [data-npc-acdel]').forEach(b => b.onclick = () => edit(uid, 'Apagar ação do NPC', (n) => { n.points[app.npcPoint]?.acts.splice(+b.dataset.npcAcdel, 1); }, rerender));
  $$('#inspector [data-npc-acmove]').forEach(b => b.onclick = () => edit(uid, 'Mover ação do NPC', (n) => {
    const acts = n.points[app.npcPoint]?.acts, i = +b.dataset.npcAcmove, j = i + +b.dataset.dir;
    if (acts && j >= 0 && j < acts.length) [acts[i], acts[j]] = [acts[j], acts[i]];
  }, rerender));
  $$('#inspector [data-npc-acpick]').forEach(b => b.onclick = () => { setPick({ uid, kind: 'act', act: +b.dataset.npcAcpick }, rerender); toast('Clique no mapa para escolher o ponto'); rerender(); });
  $$('#inspector [data-npc-act]').forEach(b => b.onclick = () => onAction(a, b.dataset.npcAct, rerender));
}

async function onAction(a, act, rerender) {
  const uid = a.uid, n = a.npc;
  if (act === 'area') {
    setPick(pick?.kind === 'area' && pick.uid === uid ? null : { uid, kind: 'area' }, rerender);
    rerender();
  } else if (act === 'streets') {
    if (making.has(uid)) return;
    making.add(uid);
    rerender();
    await refreshNpcStreets(app.project);
    making.delete(uid);
    refreshNpcOverlay();
    if (app.editor.selection.includes(uid)) rerender();
  } else if (act === 'add' || act === 'route') {
    setPick(pick?.kind === act && pick.uid === uid ? null : { uid, kind: act }, rerender);
    if (pick) toast(act === 'add' ? 'Clique no chão para pôr pontos. Esc para parar.' : 'Clique no destino. Esc para parar.');
    rerender();
  } else if (act === 'clear') {
    edit(uid, 'Apagar caminho do NPC', (x) => { x.points = []; }, rerender); app.npcPoint = -1;
  } else if (act === 'reverse') {
    edit(uid, 'Inverter caminho do NPC', (x) => { x.points.reverse(); }, rerender);
  } else if (act === 'preview') {
    if (npcPreviewing(uid)) stopNpcPreview();
    else if (!previewNpc(uid, rerender)) toast(n.mode === 'playback' ? 'Escolha uma gravação para ver a prévia.' : 'Ponha pontos no caminho para ver a prévia.', 'error');
    rerender();
  } else if (act === 'recServer') {
    let list = [];
    try { list = (await (await fetch('/api/npc/recordings')).json()).recordings || []; } catch { /* servidor fora */ }
    if (!list.length) { toast('Nenhuma gravação no servidor de teste. Grave com /gravar nome dentro do jogo.', 'error', 5000); return; }
    for (const r of list) app.project.recordings[r.name] = r.data;
    const last = list.sort((x, y) => y.time - x.time)[0].name;
    app.project.touch('recordings');
    edit(uid, 'Gravação do NPC', (x) => { x.rec = last; }, rerender);
    toast(`${list.length} gravação(ões) do servidor de teste no projeto`);
  } else if (act === 'recFile') {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.rec';
    inp.onchange = async () => {
      const f = inp.files?.[0]; if (!f) return;
      const buf = new Uint8Array(await f.arrayBuffer());
      let bin = ''; for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
      const name = f.name.replace(/\.rec$/i, '').replace(/[^0-9A-Za-z_\-.]/g, '_').slice(0, 31) || 'gravacao';
      app.project.recordings[name] = btoa(bin);
      app.project.touch('recordings');
      edit(uid, 'Gravação do NPC', (x) => { x.rec = name; }, rerender);
    };
    inp.click();
  } else if (act === 'recSave') {
    const data = app.project.recordings[n.rec]; if (!data) return;
    const bin = atob(data), u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([u], { type: 'application/octet-stream' }));
    link.download = n.rec + '.rec'; link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 5000);
  } else if (act === 'recDel') {
    delete app.project.recordings[n.rec];
    app.project.touch('recordings');
    edit(uid, 'Gravação do NPC', (x) => { x.rec = ''; }, rerender);
  }
}
