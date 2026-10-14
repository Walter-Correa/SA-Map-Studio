// Inspetor (painel da direita): posição, rotação, opções e o editor de materiais do SA-MP
// (SetObjectMaterial e SetObjectMaterialText) com todos os índices do objeto.
import * as THREE from 'three';
import { categoryOf } from '../world/gamedata.js';
import { drawMaterialText } from '../world/models.js';
import {
  MAX_MATERIAL_INDEX, MATERIAL_SIZES, SIZE_PIXELS, TEXT_ALIGN, FONTS, TEXT_DEFAULTS,
  isText, keepsTexture, normalizeMaterial, materialCall, cssColor, parseColor,
} from '../editor/materials.js';
import { colorPalette, openVehicleColorPicker } from './palette.js';
import { app, $, $$, esc, fmt, plural, store, toast, copyText, modelLabel, bindScrub, showPrompt } from './common.js';
import { CAR_COLORS, carColorHex, COMPONENT_TYPES, VEHICLE_COMPONENTS, supportsPaintjob } from '../world/vehicleMods.js';
import { POPULAR_ANIMATIONS, ALL_ANIMATIONS, POPULAR_SKINS, ALL_SKINS, getSkinLabel, findSkin } from '../world/actors.js';
import { openAnimPicker } from './animPicker.js';

const round = (v, d = 4) => Math.round((+v || 0) * 10 ** d) / 10 ** d;

let showAllIndices = false;
let matTab = store.get('matTab', 'texture');
let textDraft = { text: 'Texto', ...TEXT_DEFAULTS };
let suppress = false;
let pendingSlots = new Set();

export function setupInspector() {
  const ed = app.editor;
  const rerender = () => { if (!suppress) renderInspector(); };
  ed.addEventListener('selection', rerender);
  ed.addEventListener('slot', rerender);
  ed.addEventListener('mode', rerender);
  ed.addEventListener('change', rerender);
  ed.addEventListener('live', updateValues);
  app.on('project', rerender);
  renderInspector();
}

export function renderInspector() {
  const el = $('#inspector');
  const ed = app.editor;
  const items = ed.selectedItems();
  if (ed.worldSelection?.length > 1) { el.innerHTML = worldMultiInspector(ed.worldSelection); bindWorldMulti(); return; }
  if (ed.worldSel) { el.innerHTML = worldInspector(ed.worldSel); bindWorld(); return; }
  if (!items.length) {
    el.innerHTML = emptyInspector();
    const btnAll = $('#btnSelectAll');
    if (btnAll) btnAll.onclick = () => ed.selectAll(true);
    return;
  }
  const objs = items.filter(i => i.kind === 'objects').map(i => i.item);
  if (items.length > 1) {
    el.innerHTML = multiInspector(items, objs);
    bindMulti(items);
    if (objs.length) bindMaterials(objs);
    return;
  }
  const { item, kind } = items[0];
  if (kind === 'vehicles') {
    el.innerHTML = vehicleInspector(item);
    bindVehicle(item);
  } else if (kind === 'actors') {
    el.innerHTML = actorInspector(item);
    bindActor(item);
  } else {
    el.innerHTML = objectInspector(item);
    bindItem(item);
    bindMaterials([item]);
  }
  titleThumb(kind === 'actors' ? (item.skin ?? 0) : item.model);
}

function titleThumb(model) {
  app.thumbs.request(model, (url) => { const img = $('#inspector .insp-title img'); if (img && url) { img.src = url; img.classList.remove('empty'); } });
}

function emptyInspector() {
  const p = app.project;
  const c = p.cameras || { shots: [], paths: [] };
  const total = p.objects.length + p.vehicles.length + (p.actors?.length || 0);
  return `<div class="insp-empty"><h3>${esc(p.name)}</h3>
    <div class="stat-line"><span>Objetos</span><b>${p.objects.length}</b></div>
    <div class="stat-line"><span>Veículos</span><b>${p.vehicles.length}</b></div>
    <div class="stat-line"><span>Actors</span><b>${p.actors?.length || 0}</b></div>
    <div class="stat-line"><span>Objetos removidos</span><b>${p.removed.length}</b></div>
    <div class="stat-line"><span>Câmeras</span><b>${c.shots.length + c.paths.length}</b></div>
    ${total > 0 ? `<button type="button" class="btn primary block" id="btnSelectAll" style="margin: 12px 0 16px;"><svg><use href="#i-move"/></svg>Mover todo o projeto (${total} itens)</button>` : ''}
    <ul>
      <li>Escolha um objeto na aba Objetos e clique no mapa para posicionar.</li>
      <li>Clique num objeto para selecionar e arraste as setas do gizmo para mover.</li>
      <li>Clique num objeto do jogo para remover, copiar ou tornar editável.</li>
      <li><b>Ctrl+G</b> teleporta para uma coordenada. Aperte <b>?</b> para ver os atalhos.</li>
    </ul></div>`;
}

const vecInputs = (prefix, labels, values, step) => `<div class="vec">${labels.map((a, i) =>
  `<label data-axis="${a}"><span data-scrub="${prefix}${a}" title="Arraste para ajustar (Shift: fino)">${a.toUpperCase()}</span><input type="number" step="${step}" data-field="${prefix}${a}" value="${fmt(values[i])}" aria-label="${prefix === 'r' ? 'Rotação' : 'Posição'} ${a.toUpperCase()}"></label>`).join('')}</div>`;

const titleBlock = (model, sub) => `<div class="insp-title"><img class="thumb empty" alt="" width="64" height="64"><div><div class="insp-name">${esc(modelLabel(model))}</div><div class="insp-sub">${sub}</div></div></div>`;

const actionGrid = () => `<div class="btn-grid">
      <button type="button" class="btn" data-act="resetRot" title="Zerar rotação (X: 0°, Y: 0°, Z: 0°)"><svg><use href="#i-rotate"/></svg>Resetar rotação</button>
      <button type="button" class="btn" data-act="ground" title="Colocar em cima da superfície ou objeto logo abaixo"><svg><use href="#i-ground"/></svg>Na superfície</button>
      <button type="button" class="btn" data-act="dup" title="Cria uma cópia no mesmo lugar, já com o gizmo de mover (Ctrl+D)"><svg><use href="#i-copy"/></svg>Duplicar</button>
      <button type="button" class="btn" data-act="focus"><svg><use href="#i-focus"/></svg>Focar</button>
    </div>`;

function speedSection() {
  const sp = app.editor.transformSpeed || { move: 1.0, rotate: 1.0 };
  return `<div class="insp-section">
    <div class="insp-label">Velocidades de manipulação <span class="tag">0.001x a 10.0x</span></div>
    <div class="pair">
      <label>Movimento<input type="number" step="0.1" min="0.001" max="10.0" data-speed="move" value="${fmt(sp.move ?? 1.0, 3)}"></label>
      <label>Rotação<input type="number" step="0.1" min="0.001" max="10.0" data-speed="rotate" value="${fmt(sp.rotate ?? 1.0, 3)}"></label>
    </div>
  </div>`;
}

function objectInspector(o) {
  const def = app.gd.models.get(o.model);
  const mats = materialSection([o]);
  const first = app.editor.mode === 'texture';
  const total = app.project.objects.length + app.project.vehicles.length + (app.project.actors?.length || 0);
  return `${titleBlock(o.model, `ID ${o.model} <span class="tag">${esc(def ? categoryOf(def) : 'Não existe no jogo')}</span>`)}
    <button type="button" class="btn danger block" data-act="del" style="margin: 8px 0 10px;"><svg><use href="#i-trash"/></svg>Apagar objeto</button>
    <div class="scope-toggle">
      <button type="button" class="btn small active" data-scope="sel">Objeto selecionado</button>
      <button type="button" class="btn small" data-scope="all">Todo o projeto (${total})</button>
    </div>
    ${first ? mats : ''}
    <div class="insp-section"><div class="insp-label">Posição</div>${vecInputs('', ['x', 'y', 'z'], [o.x, o.y, o.z], 0.1)}</div>
    <div class="insp-section"><div class="insp-label">Rotação (graus)</div>${vecInputs('r', ['x', 'y', 'z'], [o.rx, o.ry, o.rz], 1)}</div>
    ${speedSection()}
    ${actionGrid()}

    <!-- MoveObject -->
    <div class="insp-section">
      <div class="insp-label">Movimento (MoveObject)</div>
      <label class="check" style="margin: 4px 0 8px;"><input type="checkbox" id="chkMoveObj" ${o.move ? 'checked' : ''}> Ativar movimento</label>
      ${o.move ? `
        <div class="pair">
          <label>Alvo X<input type="number" step="0.1" data-move="targetX" value="${fmt(o.move.targetX)}"></label>
          <label>Alvo Y<input type="number" step="0.1" data-move="targetY" value="${fmt(o.move.targetY)}"></label>
          <label>Alvo Z<input type="number" step="0.1" data-move="targetZ" value="${fmt(o.move.targetZ)}"></label>
          <label>Velocidade<input type="number" step="0.5" min="0.1" data-move="speed" value="${fmt(o.move.speed)}"></label>
        </div>
        <label class="check" style="margin-top:6px;"><input type="checkbox" id="chkMoveRot" ${o.move.targetRx !== -1000 ? 'checked' : ''}> Rotacionar durante o movimento</label>
        ${o.move.targetRx !== -1000 ? `
          <div class="pair" style="margin-top:4px;">
            <label>Alvo RX<input type="number" step="1" data-move="targetRx" value="${fmt(o.move.targetRx)}"></label>
            <label>Alvo RY<input type="number" step="1" data-move="targetRy" value="${fmt(o.move.targetRy)}"></label>
            <label>Alvo RZ<input type="number" step="1" data-move="targetRz" value="${fmt(o.move.targetRz)}"></label>
          </div>
        ` : ''}
        <div class="mini-actions" style="margin-top:8px;">
          <button type="button" class="btn primary small" data-move-act="test" title="Testar animação em tempo real no mapa"><svg><use href="#i-play"/></svg>Testar</button>
          <button type="button" class="btn small" data-move-act="stop" title="Parar animação"><svg><use href="#i-stop"/></svg>Parar</button>
          <button type="button" class="btn small" data-move-act="reset" title="Resetar posição"><svg><use href="#i-restore"/></svg>Resetar</button>
          <button type="button" class="btn small" data-move-act="settarg" title="Usar coordenadas atuais do objeto como alvo"><svg><use href="#i-pin"/></svg>Copiar posição atual</button>
        </div>
      ` : '<div class="insp-note">Move o objeto suavemente até outra coordenada com MoveObject / MoveDynamicObject.</div>'}
    </div>

    <!-- AttachObjectToObject -->
    <div class="insp-section">
      <div class="insp-label">Anexar (AttachObjectToObject)</div>
      <label class="check" style="margin: 4px 0 8px;"><input type="checkbox" id="chkAttach" ${o.attach ? 'checked' : ''}> Ativar acoplamento</label>
      ${o.attach ? `
        <label style="margin-bottom:6px; display:block;">Objeto Pai (Parent)
          <select id="selAttachParent" style="width:100%;">
            <option value="">Selecione um objeto...</option>
            ${app.project.objects.filter(x => x.uid !== o.uid).map(x => `<option value="${x.uid}" ${o.attach.to === x.uid ? 'selected' : ''}>${esc(modelLabel(x.model))} (ID ${x.model}) - ${x.uid.slice(0, 8)}</option>`).join('')}
          </select>
        </label>
        <div class="pair">
          <label>Offset X<input type="number" step="0.05" data-attach="ox" value="${fmt(o.attach.ox, 4)}"></label>
          <label>Offset Y<input type="number" step="0.05" data-attach="oy" value="${fmt(o.attach.oy, 4)}"></label>
          <label>Offset Z<input type="number" step="0.05" data-attach="oz" value="${fmt(o.attach.oz, 4)}"></label>
        </div>
        <div class="pair" style="margin-top:4px;">
          <label>Rot X<input type="number" step="1" data-attach="rx" value="${fmt(o.attach.rx, 2)}"></label>
          <label>Rot Y<input type="number" step="1" data-attach="ry" value="${fmt(o.attach.ry, 2)}"></label>
          <label>Rot Z<input type="number" step="1" data-attach="rz" value="${fmt(o.attach.rz, 2)}"></label>
        </div>
        <label class="check" style="margin-top:6px;"><input type="checkbox" id="chkSyncRot" ${o.attach.syncRot !== 0 ? 'checked' : ''}> Sincronizar rotação (SyncRotation)</label>
        <div class="mini-actions" style="margin-top:8px;">
          <button type="button" class="btn small" data-attach-act="calc" title="Calcula os offsets relativos da posição atual no mundo 3D"><svg><use href="#i-focus"/></svg>Calcular da posição atual</button>
          <button type="button" class="btn danger small" data-attach-act="detach"><svg><use href="#i-trash"/></svg>Desanexar</button>
        </div>
        <div class="insp-note" style="margin-top:6px;">Dica: você também pode mover e girar o objeto diretamente no mapa com as setas para ajustar o acoplamento em tempo real.</div>
      ` : '<div class="insp-note">Prende este objeto em outro para que ele se mova e gire acompanhando o objeto pai.</div>'}
    </div>

    <div class="insp-section"><div class="insp-label">Onde aparece</div>
      <div class="pair">
        <label>Interior<input type="number" step="1" min="-1" data-field="interior" value="${o.interior}"></label>
        <label>Mundo virtual<input type="number" step="1" min="-1" data-field="world" value="${o.world}"></label>
      </div>
      <div class="insp-note">-1 significa todos.</div>
    </div>
    <div class="insp-section"><div class="insp-label">Distâncias (0 = padrão)</div>
      <div class="pair">
        <label>Stream distance<input type="number" step="10" min="0" data-field="streamDist" value="${o.streamDist}"></label>
        <label>Draw distance<input type="number" step="10" min="0" data-field="drawDist" value="${o.drawDist}"></label>
      </div>
    </div>
    <div class="insp-section"><div class="insp-label">Comentário / Anotação (Pawn)</div>
      <input type="text" data-field-str="comment" placeholder="// Ex: Portão da casa" value="${esc(o.comment || '')}" style="width:100%;">
    </div>
    ${first ? '' : mats}`;
}

function vehicleInspector(v) {
  const def = app.gd.models.get(v.model);
  const total = app.project.objects.length + app.project.vehicles.length + (app.project.actors?.length || 0);
  const c1Hex = carColorHex(v.color1);
  const c2Hex = carColorHex(v.color2);
  const comps = v.components || [];

  return `${titleBlock(v.model, `Veículo ${v.model} <span class="tag">${esc(def?.model || '')}</span>`)}
    <button type="button" class="btn danger block" data-act="del" style="margin: 8px 0 10px;"><svg><use href="#i-trash"/></svg>Apagar veículo</button>
    <div class="scope-toggle">
      <button type="button" class="btn small active" data-scope="sel">Veículo selecionado</button>
      <button type="button" class="btn small" data-scope="all">Todo o projeto (${total})</button>
    </div>
    <div class="insp-section"><div class="insp-label">Posição</div>${vecInputs('', ['x', 'y', 'z'], [v.x, v.y, v.z], 0.1)}</div>
    <div class="insp-section"><div class="insp-label">Ângulo e respawn</div>
      <div class="pair"><label>Ângulo Z<input type="number" step="1" data-field="rz" value="${fmt(v.rz)}"></label><label>Respawn (s)<input type="number" step="10" min="-1" data-field="respawn" value="${v.respawn}"></label></div>
    </div>
    ${speedSection()}
    ${actionGrid()}

    <!-- Cores -->
    <div class="insp-section"><div class="insp-label">Cores do veículo (carcols.dat: 0 a 255)</div>
      <div class="pair">
        <label>Cor 1
          <div style="display:flex; gap:6px; align-items:center;">
            <button type="button" class="slot-swatch" id="btnVehColor1" style="width:26px; height:26px; background:${c1Hex}; border-radius:4px; border:1px solid rgba(255,255,255,0.2); cursor:pointer;" title="Abrir paleta de 256 cores SA-MP"></button>
            <input type="number" step="1" min="-1" max="255" data-field="color1" value="${v.color1}">
          </div>
        </label>
        <label>Cor 2
          <div style="display:flex; gap:6px; align-items:center;">
            <button type="button" class="slot-swatch" id="btnVehColor2" style="width:26px; height:26px; background:${c2Hex}; border-radius:4px; border:1px solid rgba(255,255,255,0.2); cursor:pointer;" title="Abrir paleta de 256 cores SA-MP"></button>
            <input type="number" step="1" min="-1" max="255" data-field="color2" value="${v.color2}">
          </div>
        </label>
      </div>
      <div class="insp-note">-1 significa cor aleatória. Clique no quadrado para abrir a paleta de 256 cores.</div>
    </div>
    <div class="insp-section"><div class="insp-label">Comentário / Anotação (Pawn)</div>
      <input type="text" data-field-str="comment" placeholder="// Ex: Carro da polícia" value="${esc(v.comment || '')}" style="width:100%;">
    </div>

    <!-- Paintjob -->
    <div class="insp-section">
      <div class="insp-label">Paintjob</div>
      <select id="vehPaintjob" style="width:100%;">
        <option value="-1" ${v.paintjob === -1 ? 'selected' : ''}>Nenhum (-1)</option>
        <option value="0" ${v.paintjob === 0 ? 'selected' : ''}>Paintjob 1 (0)</option>
        <option value="1" ${v.paintjob === 1 ? 'selected' : ''}>Paintjob 2 (1)</option>
        <option value="2" ${v.paintjob === 2 ? 'selected' : ''}>Paintjob 3 (2)</option>
      </select>
      ${supportsPaintjob(v.model) ? '<div class="insp-note">Veículo compatível com paintjobs no SA-MP.</div>' : '<div class="insp-note warn">Este modelo não tem textura de paintjob nativa no GTA SA.</div>'}
    </div>

    <!-- Tuning / Componentes -->
    <div class="insp-section">
      <div class="insp-label">Tuning e Componentes <span class="tag">${comps.length} instalados</span></div>
      <div class="slots" id="vehComponentList" style="max-height:160px; overflow-y:auto;">
        ${comps.map(cid => {
          const comp = VEHICLE_COMPONENTS[cid] || { type: -1, name: `Componente ${cid}` };
          const slotName = COMPONENT_TYPES[comp.type] || 'Outro';
          return `<div class="slot changed" style="display:flex; justify-content:space-between; align-items:center; padding: 4px 8px;">
            <div style="font-size:12px;"><b>${esc(comp.name)}</b> <small style="color:var(--text-dim);">[${cid}] · ${esc(slotName)}</small></div>
            <button type="button" class="btn icon small danger" data-del-comp="${cid}" title="Remover"><svg><use href="#i-x"/></svg></button>
          </div>`;
        }).join('') || '<div class="insp-note">Nenhum componente de tuning adicionado.</div>'}
      </div>
      <div style="margin-top:8px;">
        <label>Adicionar componente
          <select id="selAddComp" style="width:100%;">
            <option value="">Escolha um componente...</option>
            ${Object.entries(COMPONENT_TYPES).map(([typeId, typeName]) => {
              const items = Object.entries(VEHICLE_COMPONENTS).filter(([cId, c]) => c.type === +typeId && !comps.includes(+cId));
              if (!items.length) return '';
              return `<optgroup label="${esc(typeName)}">
                ${items.map(([cId, c]) => `<option value="${cId}">${cId} - ${esc(c.name)}</option>`).join('')}
              </optgroup>`;
            }).join('')}
          </select>
        </label>
      </div>
      <details class="pawn-preview" style="margin-top:8px;"><summary>Código Pawn deste veículo</summary><pre class="code small" id="vehCode"></pre>
        <button type="button" class="btn small" data-vehcopy><svg><use href="#i-copy"/></svg>Copiar</button></details>
    </div>`;
}

function actorInspector(a) {
  const total = app.project.objects.length + app.project.vehicles.length + (app.project.actors?.length || 0);
  const skinName = getSkinLabel(a.skin ?? 0);
  let currentAnimTitle = 'Animação selecionada';
  if (a.anim) {
    if (a.anim.label) {
      currentAnimTitle = a.anim.label;
    } else {
      const popMatch = POPULAR_ANIMATIONS.find(p => p.lib.toLowerCase() === (a.anim.lib || '').toLowerCase() && p.name.toLowerCase() === (a.anim.name || '').toLowerCase());
      if (popMatch) {
        currentAnimTitle = popMatch.label;
      } else {
        currentAnimTitle = `${a.anim.lib || 'PED'}: ${a.anim.name || 'IDLE_chat'}`;
      }
    }
  }

  return `${titleBlock(a.skin ?? 0, `Skin ${a.skin ?? 0} <span class="tag">${esc(skinName)}</span>`)}
    <button type="button" class="btn danger block" data-act="del" style="margin: 8px 0 10px;"><svg><use href="#i-trash"/></svg>Apagar actor</button>
    <div class="scope-toggle">
      <button type="button" class="btn small active" data-scope="sel">Actor selecionado</button>
      <button type="button" class="btn small" data-scope="all">Todo o projeto (${total})</button>
    </div>
    <div class="insp-section"><div class="insp-label">Posição</div>${vecInputs('', ['x', 'y', 'z'], [a.x, a.y, a.z], 0.1)}</div>
    <div class="insp-section"><div class="insp-label">Ângulo (FacingAngle)</div>
      <div class="pair"><label>Ângulo Z<input type="number" step="1" data-field="rz" value="${fmt(a.rz)}"></label></div>
    </div>
    ${speedSection()}
    ${actionGrid()}

    <!-- Skin -->
    <div class="insp-section"><div class="insp-label">Skin do personagem (0 a 311)</div>
      <div class="pair">
        <label>ID da Skin<input type="number" step="1" min="0" max="311" data-field="skin" value="${a.skin ?? 0}"></label>
        <label>Selecionar skin
          <select id="selPopularSkin">
            <option value="">Escolha uma skin (${ALL_SKINS.length})...</option>
            ${ALL_SKINS.map(s => `<option value="${s.id}" ${s.id === (a.skin ?? 0) ? 'selected' : ''}>${s.id} - ${esc(s.name)}</option>`).join('')}
          </select>
        </label>
      </div>
      <button type="button" class="btn small block" id="btnBrowseSkin" style="margin-top:6px;" title="Buscar qualquer skin por nome ou ID"><svg><use href="#i-search"/></svg>Buscar skin por nome ou ID...</button>
    </div>

    <!-- Propriedades -->
    <div class="insp-section"><div class="insp-label">Propriedades</div>
      <div class="pair">
        <label>Mundo virtual<input type="number" step="1" min="-1" data-field="world" value="${a.world ?? -1}"></label>
        <label>Vida (Health)<input type="number" step="1" min="0" max="1000" data-field="health" value="${a.health ?? 100}"></label>
      </div>
      <label class="check" style="margin-top:6px;"><input type="checkbox" id="chkInvulnerable" ${a.invulnerable ? 'checked' : ''}> Invulnerável (SetActorInvulnerable)</label>
    </div>

    <!-- Animação -->
    <div class="insp-section">
      <div class="insp-label">Animação (ApplyActorAnimation)</div>
      <label class="check" style="margin: 4px 0 8px;"><input type="checkbox" id="chkActorAnim" ${a.anim ? 'checked' : ''}> Ativar animação</label>
      ${a.anim ? `
        <button type="button" class="btn small block" id="btnOpenAnimPicker" style="margin: 6px 0 8px;"><svg><use href="#i-search"/></svg> Escolher animação...</button>
        <div style="padding: 7px 10px; background: var(--asphalt-800); border: 1px solid var(--line); border-radius: var(--radius-s); margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
          <div style="min-width: 0;">
            <div style="font-weight: 600; font-size: 12px; color: var(--gold-400); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${esc(currentAnimTitle)}</div>
            <div style="font-size: 11px; color: var(--paper-dim); font-family: monospace;">${esc(a.anim.lib || 'PED')} / ${esc(a.anim.name || 'IDLE_chat')}</div>
          </div>
          <button type="button" class="btn icon tiny ghost danger" id="btnClearAnimInline" title="Remover animação"><svg><use href="#i-trash"/></svg></button>
        </div>
        <div class="pair">
          <label>Biblioteca (lib)<input id="animLib" value="${esc(a.anim.lib || 'PED')}" spellcheck="false"></label>
          <label>Nome (name)<input id="animName" value="${esc(a.anim.name || 'IDLE_chat')}" spellcheck="false"></label>
        </div>
        <div class="pair" style="margin-top:4px;">
          <label>Velocidade (delta)<input type="number" step="0.1" id="animDelta" value="${fmt(a.anim.delta || 4.1)}"></label>
          <label>Tempo (time, 0 = loop)<input type="number" step="1" min="0" id="animTime" value="${a.anim.time || 0}"></label>
        </div>
        <div class="pair" style="margin-top:4px;">
          <label class="check"><input type="checkbox" id="animLoop" ${a.anim.loop ? 'checked' : ''}> Loop contínuo</label>
          <label class="check"><input type="checkbox" id="animFreeze" ${a.anim.freeze ? 'checked' : ''}> Congelar no fim</label>
        </div>
        <div class="pair" style="margin-top:4px;">
          <label class="check"><input type="checkbox" id="animLockX" ${a.anim.lockx ? 'checked' : ''}> Travar X</label>
          <label class="check"><input type="checkbox" id="animLockY" ${a.anim.locky ? 'checked' : ''}> Travar Y</label>
        </div>
      ` : '<div class="insp-note">Aplica uma animação contínua ou temporária ao spawnar o personagem.</div>'}
    </div>
    <div class="insp-section"><div class="insp-label">Comentário / Anotação (Pawn)</div>
      <input type="text" data-field-str="comment" placeholder="// Ex: Guarda da entrada" value="${esc(a.comment || '')}" style="width:100%;">
    </div>
    <details class="pawn-preview" style="margin-top:8px;"><summary>Código Pawn deste actor</summary><pre class="code small" id="actorCode"></pre>
      <button type="button" class="btn small" data-actorcopy><svg><use href="#i-copy"/></svg>Copiar</button></details>`;
}

function multiInspector(items, objs) {
  const sameModel = objs.length === items.length && objs.every(o => o.model === objs[0].model);
  const total = app.project.objects.length + app.project.vehicles.length + (app.project.actors?.length || 0);
  const isAll = items.length >= total && total > 0;
  const c = { x: 0, y: 0, z: 0 };
  for (const s of items) { c.x += s.item.x; c.y += s.item.y; c.z += s.item.z; }
  c.x = round(c.x / items.length, 3);
  c.y = round(c.y / items.length, 3);
  c.z = round(c.z / items.length, 3);

  return `<div class="insp-empty">
    <h3>${isAll ? 'Todo o projeto' : `${items.length} itens selecionados`}</h3>
    <button type="button" class="btn danger block" data-act="del" style="margin: 8px 0 10px;"><svg><use href="#i-trash"/></svg>Apagar ${items.length} itens</button>
    <div class="scope-toggle">
      <button type="button" class="btn small ${isAll ? '' : 'active'}" data-scope="sel">Selecionados (${items.length})</button>
      <button type="button" class="btn small ${isAll ? 'active' : ''}" data-scope="all">Todo o projeto (${total})</button>
    </div>
    <p>Ajuste as coordenadas para mover tudo junto em tempo real ou use o gizmo.</p>
  </div>
  <div class="insp-section"><div class="insp-label">Posição do conjunto (centro)</div>${vecInputs('', ['x', 'y', 'z'], [c.x, c.y, c.z], 0.1)}</div>
  <div class="insp-section"><div class="insp-label">Girar conjunto preso ao mesmo eixo</div>
    <div class="vec">
      <label data-axis="x"><span>X</span><input type="number" step="5" data-multi-rot="x" value="0"></label>
      <label data-axis="y"><span>Y</span><input type="number" step="5" data-multi-rot="y" value="0"></label>
      <label data-axis="z"><span>Z</span><input type="number" step="5" data-multi-rot="z" value="0"></label>
    </div>
    <div class="mini-actions" style="margin-top:6px;">
      <button type="button" class="btn small" data-rot-preset="0,0,-90">-90° Z</button>
      <button type="button" class="btn small" data-rot-preset="0,0,90">+90° Z</button>
      <button type="button" class="btn small" data-rot-preset="0,0,180">180° Z</button>
    </div>
  </div>
  ${speedSection()}
  ${actionGrid()}
  ${objs.length === items.length ? materialSection(objs, !sameModel) : ''}`;
}

function worldInspector(inst) {
  const q = new THREE.Quaternion(-inst.qx, -inst.qy, -inst.qz, inst.qw);
  const e = new THREE.Euler().setFromQuaternion(q, 'ZXY');
  const deg = (r) => fmt(((r * 180 / Math.PI) % 360 + 360) % 360, 2);
  const lod = inst.lodRef ? `<div class="stat-line"><span>LOD</span><b>${esc(inst.lodRef.def.model)} (${inst.lodRef.id})</b></div>` : '';
  return `${titleBlock(inst.id, `ID ${inst.id} <span class="tag world">Objeto do mapa</span>`)}
    <button type="button" class="btn danger block" data-act="wremove" style="margin: 8px 0 10px;"><svg><use href="#i-demolish"/></svg>Remover objeto do mapa</button>
    <div class="insp-section">
      <div class="stat-line"><span>Posição</span><b>${fmt(inst.x, 3)}, ${fmt(inst.y, 3)}, ${fmt(inst.z, 3)}</b></div>
      <div class="stat-line"><span>Rotação</span><b>${deg(e.x)}, ${deg(e.y)}, ${deg(e.z)}</b></div>
      <div class="stat-line"><span>Arquivo</span><b>${esc(inst.ipl)}.ipl</b></div>
      ${inst.interior ? `<div class="stat-line"><span>Interior</span><b>${inst.interior}</b></div>` : ''}
      ${lod}
    </div>
    <button type="button" class="btn primary block" data-act="wadd" title="Cria uma cópia em cima do original, já com o gizmo de mover"><svg><use href="#i-plus"/></svg>Posicionar outro igual</button>
    <button type="button" class="btn block" data-act="wconvert"><svg><use href="#i-edit"/></svg>Tornar editável</button>
    <button type="button" class="btn block" data-act="wcopy"><svg><use href="#i-copy"/></svg>Copiar RemoveBuildingForPlayer</button>
    <div class="insp-note">"Tornar editável" remove o original e coloca uma cópia no projeto. "Posicionar outro igual" deixa o original e cria a cópia no mesmo lugar.</div>`;
}

function worldMultiInspector(insts) {
  const models = [...new Set(insts.map(i => i.id))];
  const sub = `${insts.length} objetos selecionados · ${models.length} modelos distintos`;
  return `<div class="insp-title">
      <div class="thumb" style="display:grid; place-items:center; background:rgba(239,68,68,0.15); border:1px solid #ef4444; border-radius:var(--radius-s); color:#ef4444;">
        <svg style="width:28px;height:28px;"><use href="#i-demolish"/></svg>
      </div>
      <div>
        <div class="insp-name">${insts.length} Objetos do mapa</div>
        <div class="insp-sub">${sub}</div>
      </div>
    </div>
    <button type="button" class="btn danger block" data-act="wremove" style="margin: 8px 0 10px;"><svg><use href="#i-demolish"/></svg>Remover ${insts.length} objetos do mapa</button>
    <div class="insp-section">
      <div class="stat-line"><span>Total selecionado</span><b>${insts.length} objetos</b></div>
      <div class="stat-line"><span>Modelos</span><b>${models.slice(0, 8).join(', ')}${models.length > 8 ? '...' : ''}</b></div>
    </div>
    <button type="button" class="btn primary block" data-act="wadd" title="Cria cópias em cima dos originais, já com o gizmo de mover"><svg><use href="#i-plus"/></svg>Posicionar cópias iguais (${insts.length})</button>
    <button type="button" class="btn block" data-act="wconvert"><svg><use href="#i-edit"/></svg>Tornar todos editáveis (${insts.length})</button>
    <button type="button" class="btn block" data-act="wcopy"><svg><use href="#i-copy"/></svg>Copiar RemoveBuildingForPlayer de todos</button>
    <div class="insp-note">Segure Shift ou Ctrl e clique no mapa para selecionar múltiplos objetos. Aperte Delete para remover todos juntos.</div>`;
}

function bindCommon() {
  $$('#inspector [data-act]').forEach(b => b.onclick = () => {
    const a = b.dataset.act, ed = app.editor;
    if (a === 'resetRot') { ed.resetRotationSelection(); toast('Rotação resetada para 0°'); }
    else if (a === 'ground') { if (ed.dropToGround() === false) toast('Não achei uma superfície embaixo', 'warn'); }
    else if (a === 'dup') ed.duplicateSelection();
    else if (a === 'focus') ed.focusSelection();
    else if (a === 'del') ed.deleteSelection();
  });
}

function bindSpeedControls() {
  $$('#inspector [data-speed]').forEach(inp => {
    const apply = () => {
      let v = parseFloat(inp.value);
      if (!Number.isFinite(v)) return;
      v = Math.min(10.0, Math.max(0.001, v));
      app.editor.setTransformSpeed({ [inp.dataset.speed]: v });
      store.set('transformSpeed', app.editor.transformSpeed);
    };
    inp.addEventListener('input', apply);
    inp.addEventListener('change', () => {
      apply();
      inp.value = fmt(app.editor.transformSpeed[inp.dataset.speed], 3);
    });
  });
}


function bindStringFields(uid) {
  $$('#inspector [data-field-str]').forEach(inp => {
    inp.addEventListener('change', () => {
      const field = inp.dataset.fieldStr;
      const val = inp.value.trim();
      (app.editor.findProjectOf(uid) || app.project).updateItems('Editar ' + field, [uid], (o) => { o[field] = val; });
    });
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') inp.blur(); });
  });
}

function bindItem(item) {
  bindCommon();
  bindSpeedControls();
  bindStringFields(item.uid);
  const uid = item.uid, project = app.editor.findProjectOf(uid) || app.project;

  $$('#inspector [data-scope]').forEach(b => b.onclick = () => {
    if (b.dataset.scope === 'all') app.editor.selectAll(false);
  });

  $$('#inspector [data-field]').forEach(inp => {
    inp.addEventListener('change', () => {
      const field = inp.dataset.field;
      let v = parseFloat(inp.value);
      if (!Number.isFinite(v)) { inp.value = fmt(project.find(uid)?.[field]); return; }
      if (['interior', 'world', 'color1', 'color2', 'respawn', 'skin'].includes(field)) v = Math.trunc(v);
      project.updateItems('Editar ' + field, [uid], (o) => { o[field] = v; });
    });
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') inp.blur(); });
  });

  $$('#inspector [data-scrub]').forEach(sp => {
    const field = sp.dataset.scrub;
    let before = null;
    sp.addEventListener('pointerdown', () => { before = [project.snapshot(uid)]; }, { capture: true });
    const isRot = field.startsWith('r');
    const speed = isRot ? (app.editor.transformSpeed?.rotate || 1.0) : (app.editor.transformSpeed?.move || 1.0);
    bindScrub(sp, {
      step: (isRot ? 0.5 : 0.02) * speed,
      get: () => project.find(uid)?.[field] || 0,
      set: (v) => { const o = project.find(uid); if (!o) return; o[field] = v; app.editor.syncAll(); updateValues(); },
      done: () => { if (before) project.record('Editar ' + field, before, [project.snapshot(uid)]); before = null; },
    });
  });

  // MoveObject binding
  const chkMove = $('#chkMoveObj');
  if (chkMove) {
    chkMove.onchange = () => {
      project.updateItems('Alterar MoveObject', [uid], (o) => {
        if (chkMove.checked) {
          o.move = {
            targetX: o.x + 5, targetY: o.y, targetZ: o.z,
            speed: 3.0,
            targetRx: -1000, targetRy: -1000, targetRz: -1000,
          };
        } else {
          app.editor.stopMoveObject(uid);
          o.move = null;
        }
      });
      renderInspector();
    };
  }

  $$('#inspector [data-move]').forEach(inp => {
    inp.addEventListener('change', () => {
      const f = inp.dataset.move;
      const v = parseFloat(inp.value);
      if (!Number.isFinite(v)) return;
      project.updateItems('Editar MoveObject ' + f, [uid], (o) => {
        if (!o.move) return;
        o.move[f] = v;
      });
    });
  });

  const chkMoveRot = $('#chkMoveRot');
  if (chkMoveRot) {
    chkMoveRot.onchange = () => {
      project.updateItems('Alterar Rotação MoveObject', [uid], (o) => {
        if (!o.move) return;
        if (chkMoveRot.checked) {
          o.move.targetRx = o.rx || 0;
          o.move.targetRy = o.ry || 0;
          o.move.targetRz = o.rz || 0;
        } else {
          o.move.targetRx = -1000;
          o.move.targetRy = -1000;
          o.move.targetRz = -1000;
        }
      });
      renderInspector();
    };
  }

  $$('#inspector [data-move-act]').forEach(btn => {
    btn.onclick = () => {
      const act = btn.dataset.moveAct;
      if (act === 'test') {
        app.editor.testMoveObject(uid, false);
        toast('Testando MoveObject (1 vez)');
      } else if (act === 'stop') {
        app.editor.stopMoveObject(uid);
        toast('Movimento parado');
      } else if (act === 'reset') {
        app.editor.resetMoveObject(uid);
        toast('Posição resetada');
      } else if (act === 'settarg') {
        const cur = project.find(uid);
        if (cur && cur.move) {
          project.updateItems('Definir Alvo MoveObject', [uid], (o) => {
            o.move.targetX = o.x;
            o.move.targetY = o.y;
            o.move.targetZ = o.z;
            if (o.move.targetRx !== -1000) {
              o.move.targetRx = o.rx;
              o.move.targetRy = o.ry;
              o.move.targetRz = o.rz;
            }
          });
          toast('Coordenadas atuais copiadas para o alvo');
          renderInspector();
        }
      }
    };
  });

  // AttachObjectToObject binding
  const chkAttach = $('#chkAttach');
  if (chkAttach) {
    chkAttach.onchange = () => {
      project.updateItems('Alterar Attach', [uid], (o) => {
        if (chkAttach.checked) {
          const firstOther = project.objects.find(x => x.uid !== uid);
          o.attach = {
            to: firstOther ? firstOther.uid : '',
            ox: 0, oy: 0, oz: 1.0,
            rx: 0, ry: 0, rz: 0,
            syncRot: 1,
          };
        } else {
          o.attach = null;
        }
      });
      app.editor.updateAttachedChildren();
      renderInspector();
    };
  }

  const selParent = $('#selAttachParent');
  if (selParent) {
    selParent.onchange = () => {
      project.updateItems('Alterar Objeto Pai', [uid], (o) => {
        if (!o.attach) return;
        o.attach.to = selParent.value;
      });
      app.editor.updateAttachedChildren();
    };
  }

  $$('#inspector [data-attach]').forEach(inp => {
    inp.addEventListener('change', () => {
      const f = inp.dataset.attach;
      const v = parseFloat(inp.value);
      if (!Number.isFinite(v)) return;
      project.updateItems('Editar Attach ' + f, [uid], (o) => {
        if (!o.attach) return;
        o.attach[f] = v;
      });
      app.editor.updateAttachedChildren();
    });
  });

  const chkSyncRot = $('#chkSyncRot');
  if (chkSyncRot) {
    chkSyncRot.onchange = () => {
      project.updateItems('Alterar SyncRotation', [uid], (o) => {
        if (!o.attach) return;
        o.attach.syncRot = chkSyncRot.checked ? 1 : 0;
      });
      app.editor.updateAttachedChildren();
    };
  }

  $$('#inspector [data-attach-act]').forEach(btn => {
    btn.onclick = () => {
      const act = btn.dataset.attachAct;
      if (act === 'calc') {
        const cur = project.find(uid);
        if (cur && cur.attach && cur.attach.to) {
          const rel = app.editor.calculateRelativeAttachOffset(uid, cur.attach.to);
          if (rel) {
            project.updateItems('Calcular Offsets Attach', [uid], (o) => {
              Object.assign(o.attach, rel);
            });
            toast('Offsets calculados com sucesso da posição 3D atual');
            renderInspector();
          } else {
            toast('Não foi possível calcular os offsets do objeto pai', 'warn');
          }
        } else {
          toast('Selecione primeiro um objeto pai', 'warn');
        }
      } else if (act === 'detach') {
        project.updateItems('Desanexar Objeto', [uid], (o) => { o.attach = null; });
        app.editor.updateAttachedChildren();
        toast('Objeto desanexado');
        renderInspector();
      }
    };
  });
}

function bindVehicle(v) {
  bindCommon();
  bindSpeedControls();
  bindStringFields(v.uid);
  const uid = v.uid, project = app.editor.findProjectOf(uid) || app.project;

  const btnC1 = $('#btnVehColor1');
  if (btnC1) {
    btnC1.onclick = () => {
      openVehicleColorPicker(btnC1, {
        value: v.color1,
        onSelect: (cid) => {
          project.updateItems('Alterar Cor 1', [uid], (o) => { o.color1 = cid; });
          app.editor.syncAll();
          renderInspector();
        }
      });
    };
  }
  const btnC2 = $('#btnVehColor2');
  if (btnC2) {
    btnC2.onclick = () => {
      openVehicleColorPicker(btnC2, {
        value: v.color2,
        onSelect: (cid) => {
          project.updateItems('Alterar Cor 2', [uid], (o) => { o.color2 = cid; });
          app.editor.syncAll();
          renderInspector();
        }
      });
    };
  }

  $$('#inspector [data-scope]').forEach(b => b.onclick = () => {
    if (b.dataset.scope === 'all') app.editor.selectAll(false);
  });

  $$('#inspector [data-field]').forEach(inp => {
    inp.addEventListener('change', () => {
      const field = inp.dataset.field;
      let val = parseFloat(inp.value);
      if (!Number.isFinite(val)) { inp.value = fmt(project.find(uid)?.[field]); return; }
      if (['color1', 'color2', 'respawn'].includes(field)) val = Math.trunc(val);
      project.updateItems('Editar ' + field, [uid], (o) => { o[field] = val; });
      app.editor.syncAll();
      renderInspector();
    });
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') inp.blur(); });
  });

  $$('#inspector [data-scrub]').forEach(sp => {
    const field = sp.dataset.scrub;
    let before = null;
    sp.addEventListener('pointerdown', () => { before = [project.snapshot(uid)]; }, { capture: true });
    const isRot = field.startsWith('r');
    const speed = isRot ? (app.editor.transformSpeed?.rotate || 1.0) : (app.editor.transformSpeed?.move || 1.0);
    bindScrub(sp, {
      step: (isRot ? 0.5 : 0.02) * speed,
      get: () => project.find(uid)?.[field] || 0,
      set: (val) => { const o = project.find(uid); if (!o) return; o[field] = val; app.editor.syncAll(); updateValues(); },
      done: () => { if (before) project.record('Editar ' + field, before, [project.snapshot(uid)]); before = null; },
    });
  });

  const selPaintjob = $('#vehPaintjob');
  if (selPaintjob) {
    selPaintjob.onchange = () => {
      const pj = parseInt(selPaintjob.value, 10);
      project.updateItems('Mudar Paintjob', [uid], (o) => { o.paintjob = pj; });
      app.editor.syncAll();
      updateVehCode(project.find(uid));
    };
  }

  const selAddComp = $('#selAddComp');
  if (selAddComp) {
    selAddComp.onchange = () => {
      const cid = parseInt(selAddComp.value, 10);
      if (!Number.isFinite(cid) || cid < 1000) return;
      project.updateItems('Adicionar Componente', [uid], (o) => {
        if (!o.components) o.components = [];
        if (!o.components.includes(cid)) o.components.push(cid);
      });
      app.editor.syncAll();
      toast(`Componente ${cid} adicionado`);
      renderInspector();
    };
  }

  $$('#inspector [data-del-comp]').forEach(btn => {
    btn.onclick = () => {
      const cid = parseInt(btn.dataset.delComp, 10);
      project.updateItems('Remover Componente', [uid], (o) => {
        if (!o.components) return;
        o.components = o.components.filter(c => c !== cid);
      });
      app.editor.syncAll();
      toast(`Componente ${cid} removido`);
      renderInspector();
    };
  });

  updateVehCode(v);
}

function updateVehCode(v) {
  const code = $('#vehCode');
  if (!code || !v) return;
  const lines = [
    `new vehicleid = AddStaticVehicleEx(${v.model}, ${v.x.toFixed(4)}, ${v.y.toFixed(4)}, ${v.z.toFixed(4)}, ${v.rz.toFixed(4)}, ${v.color1}, ${v.color2}, ${v.respawn});`
  ];
  if (v.paintjob !== undefined && v.paintjob >= 0) lines.push(`ChangeVehiclePaintjob(vehicleid, ${v.paintjob});`);
  for (const c of (v.components || [])) lines.push(`AddVehicleComponent(vehicleid, ${c});`);
  code.textContent = lines.join('\n');
  const btn = $('#inspector [data-vehcopy]');
  if (btn) btn.onclick = async () => { await copyText(code.textContent); toast('Código Pawn copiado'); };
}

export function changeActorSkin(uid, newSkinId) {
  const skinId = Math.max(0, Math.min(311, parseInt(newSkinId, 10) || 0));
  const project = app.editor.findProjectOf(uid) || app.project;
  const item = project.find(uid);
  if (!item) return;

  project.updateItems('Mudar Skin', [uid], (o) => {
    o.skin = skinId;
    o.model = skinId;
  });

  app.editor.syncAll();
  renderInspector();
}

function bindActor(a) {
  bindCommon();
  bindSpeedControls();
  bindStringFields(a.uid);
  const uid = a.uid, project = app.editor.findProjectOf(uid) || app.project;

  $$('#inspector [data-scope]').forEach(b => b.onclick = () => {
    if (b.dataset.scope === 'all') app.editor.selectAll(false);
  });

  $$('#inspector [data-field]').forEach(inp => {
    inp.addEventListener('change', () => {
      const field = inp.dataset.field;
      let val = parseFloat(inp.value);
      if (!Number.isFinite(val)) { inp.value = fmt(project.find(uid)?.[field]); return; }
      if (field === 'skin') {
        changeActorSkin(uid, Math.trunc(val));
        return;
      }
      if (['world'].includes(field)) val = Math.trunc(val);
      project.updateItems('Editar ' + field, [uid], (o) => { o[field] = val; });
      app.editor.syncAll();
      renderInspector();
    });
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') inp.blur(); });
  });

  $$('#inspector [data-scrub]').forEach(sp => {
    const field = sp.dataset.scrub;
    let before = null;
    sp.addEventListener('pointerdown', () => { before = [project.snapshot(uid)]; }, { capture: true });
    const isRot = field.startsWith('r');
    const speed = isRot ? (app.editor.transformSpeed?.rotate || 1.0) : (app.editor.transformSpeed?.move || 1.0);
    bindScrub(sp, {
      step: (isRot ? 0.5 : 0.02) * speed,
      get: () => project.find(uid)?.[field] || 0,
      set: (val) => { const o = project.find(uid); if (!o) return; o[field] = val; app.editor.syncAll(); updateValues(); },
      done: () => { if (before) project.record('Editar ' + field, before, [project.snapshot(uid)]); before = null; },
    });
  });

  const selSkin = $('#selPopularSkin');
  if (selSkin) {
    selSkin.onchange = () => {
      const skinId = parseInt(selSkin.value, 10);
      if (!Number.isFinite(skinId)) return;
      changeActorSkin(uid, skinId);
    };
  }

  const btnBrowse = $('#btnBrowseSkin');
  if (btnBrowse) {
    btnBrowse.onclick = async () => {
      const val = await showPrompt({
        title: 'Buscar Skin do Actor',
        desc: 'Digite o ID (0 a 311) ou nome da Skin (ex: CJ, Ryder, Cop, Smoke, Ballas...):',
        value: String(a.skin ?? 0),
        placeholder: '0 ou nome'
      });
      if (val !== null && val.trim()) {
        const found = findSkin(val.trim());
        if (found) {
          changeActorSkin(uid, found.id);
          toast(`Skin alterada para ${found.id} - ${found.name}`);
        } else {
          toast('Nenhuma skin encontrada para: ' + val, 'warn');
        }
      }
    };
  }

  const chkInv = $('#chkInvulnerable');
  if (chkInv) {
    chkInv.onchange = () => {
      project.updateItems('Alterar Invulnerabilidade', [uid], (o) => { o.invulnerable = chkInv.checked; });
      updateActorCode(project.find(uid));
    };
  }

  const chkAnim = $('#chkActorAnim');
  if (chkAnim) {
    chkAnim.onchange = () => {
      project.updateItems('Alterar Animação Actor', [uid], (o) => {
        if (chkAnim.checked) {
          o.anim = { lib: 'PED', name: 'IDLE_chat', delta: 4.1, loop: 1, lockx: 0, locky: 0, freeze: 0, time: 0 };
        } else {
          o.anim = null;
        }
      });
      app.editor.syncAll();
      renderInspector();
    };
  }

  const btnAnimPicker = $('#btnOpenAnimPicker');
  if (btnAnimPicker) {
    btnAnimPicker.onclick = () => {
      openAnimPicker((selected) => {
        if (selected) {
          project.updateItems('Alterar Animação Actor', [uid], (o) => {
            o.anim = {
              lib: selected.lib,
              name: selected.name,
              label: selected.label || selected.name,
              delta: selected.delta || 4.1,
              loop: selected.loop ?? 1,
              freeze: selected.freeze ?? 0,
              lockx: selected.lockx ?? 0,
              locky: selected.locky ?? 0,
              time: selected.time ?? 0
            };
          });
          toast(`Animação: ${selected.label || selected.name} (${selected.lib}/${selected.name})`, 'ok', 3000);
        } else {
          project.updateItems('Remover Animação Actor', [uid], (o) => {
            o.anim = null;
          });
        }
        app.editor.syncAll();
        renderInspector();
      }, a.anim);
    };
  }

  const btnClearAnimInline = $('#btnClearAnimInline');
  if (btnClearAnimInline) {
    btnClearAnimInline.onclick = () => {
      project.updateItems('Remover Animação Actor', [uid], (o) => {
        o.anim = null;
      });
      app.editor.syncAll();
      renderInspector();
      toast('Animação removida do actor.', 'info', 2500);
    };
  }

  const bindAnimProp = (id, prop, isCheck = false, isFloat = false) => {
    const el = $(id);
    if (!el) return;
    el.addEventListener('change', () => {
      project.updateItems('Editar ' + prop, [uid], (o) => {
        if (!o.anim) return;
        if (isCheck) o.anim[prop] = el.checked ? 1 : 0;
        else if (isFloat) o.anim[prop] = parseFloat(el.value) || 0;
        else o.anim[prop] = el.value.trim();
      });
      updateActorCode(project.find(uid));
    });
  };
  bindAnimProp('#animLib', 'lib');
  bindAnimProp('#animName', 'name');
  bindAnimProp('#animDelta', 'delta', false, true);
  bindAnimProp('#animTime', 'time', false, true);
  bindAnimProp('#animLoop', 'loop', true);
  bindAnimProp('#animFreeze', 'freeze', true);
  bindAnimProp('#animLockX', 'lockx', true);
  bindAnimProp('#animLockY', 'locky', true);

  updateActorCode(a);
}

function updateActorCode(a) {
  const code = $('#actorCode');
  if (!code || !a) return;
  const lines = [
    `new actorid = CreateActor(${a.skin ?? 0}, ${a.x.toFixed(4)}, ${a.y.toFixed(4)}, ${a.z.toFixed(4)}, ${a.rz.toFixed(4)});`
  ];
  if (a.world !== undefined && a.world !== -1) lines.push(`SetActorVirtualWorld(actorid, ${a.world});`);
  if (a.invulnerable) lines.push('SetActorInvulnerable(actorid, 1);');
  if (a.health !== undefined && a.health !== 100) lines.push(`SetActorHealth(actorid, ${a.health.toFixed(1)});`);
  if (a.anim) {
    lines.push(`ApplyActorAnimation(actorid, "${a.anim.lib}", "${a.anim.name}", ${fmt(a.anim.delta || 4.1, 1)}, ${a.anim.loop ?? 1}, ${a.anim.lockx ?? 0}, ${a.anim.locky ?? 0}, ${a.anim.freeze ?? 0}, ${a.anim.time ?? 0});`);
  }
  code.textContent = lines.join('\n');
  const btn = $('#inspector [data-actorcopy]');
  if (btn) btn.onclick = async () => { await copyText(code.textContent); toast('Código Pawn copiado'); };
}

function bindMulti(items) {
  bindCommon();
  bindSpeedControls();
  const project = app.project;
  const total = project.objects.length + project.vehicles.length + (project.actors?.length || 0);
  const isAll = items.length >= total && total > 0;

  $$('#inspector [data-scope]').forEach(b => b.onclick = () => {
    if (b.dataset.scope === 'all') app.editor.selectAll(false);
    else if (items.length > 1) app.editor.select([items[0].uid]);
  });

  const getCenter = () => {
    const cur = { x: 0, y: 0, z: 0 };
    for (const s of items) { cur.x += s.item.x; cur.y += s.item.y; cur.z += s.item.z; }
    cur.x = round(cur.x / items.length, 3);
    cur.y = round(cur.y / items.length, 3);
    cur.z = round(cur.z / items.length, 3);
    return cur;
  };

  $$('#inspector [data-field]').forEach(inp => {
    inp.addEventListener('change', () => {
      const field = inp.dataset.field;
      const newV = parseFloat(inp.value);
      if (!Number.isFinite(newV)) { inp.value = fmt(getCenter()[field]); return; }
      const oldCenter = getCenter();
      const delta = round(newV - oldCenter[field], 4);
      if (Math.abs(delta) < 1e-6) return;
      const before = items.map(s => project.snapshot(s.uid));
      for (const s of items) {
        s.item[field] = round(s.item[field] + delta);
        const node = app.editor.nodes.get(s.uid);
        if (node) { node.position[field] = s.item[field]; node.updateMatrixWorld(true); }
      }
      app.editor.refreshSelectionBoxes();
      app.editor.attachGizmo();
      const after = items.map(s => project.snapshot(s.uid));
      project.record(isAll ? 'Mover todo o projeto' : `Mover ${items.length} itens`, before, after);
    });
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') inp.blur(); });
  });

  $$('#inspector [data-scrub]').forEach(sp => {
    const field = sp.dataset.scrub;
    let before = null;
    let startCenter = 0;
    let startPositions = new Map();
    sp.addEventListener('pointerdown', () => {
      before = items.map(s => project.snapshot(s.uid));
      startCenter = getCenter()[field];
      startPositions = new Map(items.map(s => [s.uid, s.item[field]]));
    }, { capture: true });

    bindScrub(sp, {
      step: 0.02 * (app.editor.transformSpeed?.move || 1.0),
      get: () => getCenter()[field],
      set: (v) => {
        const delta = v - startCenter;
        for (const s of items) {
          s.item[field] = round(startPositions.get(s.uid) + delta);
          const node = app.editor.nodes.get(s.uid);
          if (node) { node.position[field] = s.item[field]; node.updateMatrixWorld(true); }
        }
        app.editor.refreshSelectionBoxes();
        app.editor.attachGizmo();
        updateValues();
      },
      done: () => {
        if (before) {
          const after = items.map(s => project.snapshot(s.uid));
          project.record(isAll ? 'Mover todo o projeto' : `Mover ${items.length} itens`, before, after);
          before = null;
        }
      },
    });
  });

  // Rotação conjunta de múltiplos objetos presos ao mesmo eixo
  $$('#inspector [data-multi-rot]').forEach(inp => {
    inp.addEventListener('change', () => {
      const axis = inp.dataset.multiRot;
      const deg = parseFloat(inp.value);
      if (!Number.isFinite(deg) || Math.abs(deg) < 1e-4) return;
      const rx = axis === 'x' ? deg : 0;
      const ry = axis === 'y' ? deg : 0;
      const rz = axis === 'z' ? deg : 0;
      app.editor.rotateSelectionTogether(rx, ry, rz);
      inp.value = '0';
      toast(`Conjunto girado ${deg}° em ${axis.toUpperCase()}`);
    });
  });

  $$('#inspector [data-rot-preset]').forEach(btn => {
    btn.onclick = () => {
      const [rx, ry, rz] = btn.dataset.rotPreset.split(',').map(Number);
      app.editor.rotateSelectionTogether(rx, ry, rz);
      toast(`Conjunto girado`);
    };
  });
}

function updateValues() {
  const items = app.editor.selectedItems();
  if (!items.length) return;
  if (items.length === 1) {
    const o = items[0].item;
    $$('#inspector [data-field]').forEach(inp => {
      if (document.activeElement === inp) return;
      const v = o[inp.dataset.field];
      if (v !== undefined) inp.value = fmt(v);
    });
    if (o.attach) {
      $$('#inspector [data-attach]').forEach(inp => {
        if (document.activeElement === inp) return;
        const f = inp.dataset.attach;
        if (o.attach[f] !== undefined) inp.value = fmt(o.attach[f], f.startsWith('r') ? 2 : 4);
      });
    }
  } else {
    const cur = { x: 0, y: 0, z: 0 };
    for (const s of items) { cur.x += s.item.x; cur.y += s.item.y; cur.z += s.item.z; }
    cur.x = round(cur.x / items.length, 3);
    cur.y = round(cur.y / items.length, 3);
    cur.z = round(cur.z / items.length, 3);
    $$('#inspector [data-field]').forEach(inp => {
      if (document.activeElement === inp) return;
      const f = inp.dataset.field;
      if (cur[f] !== undefined) inp.value = fmt(cur[f]);
    });
  }
}

function bindWorld() {
  const inst = app.editor.worldSel;
  titleThumb(inst.id);
  $$('#inspector [data-act]').forEach(b => b.onclick = async () => {
    const a = b.dataset.act, ed = app.editor;
    if (a === 'wremove') { ed.removeWorldSelection(); toast('Prédio removido. Para desfazer, use Ctrl+Z.'); }
    else if (a === 'wconvert') { ed.convertWorldSelection(); toast('Agora o prédio é um objeto do projeto'); }
    else if (a === 'wcopy') {
      await copyText(`RemoveBuildingForPlayer(playerid, ${inst.id}, ${inst.x.toFixed(4)}, ${inst.y.toFixed(4)}, ${inst.z.toFixed(4)}, 0.25);`);
      toast('Linha copiada');
    } else if (a === 'wadd') ed.copyWorldSelection();
  });
}

function bindWorldMulti() {
  const insts = app.editor.worldSelection;
  $$('#inspector [data-act]').forEach(b => b.onclick = async () => {
    const a = b.dataset.act, ed = app.editor;
    if (a === 'wremove') {
      const count = insts.length;
      ed.removeWorldSelection();
      toast(`${count} prédios removidos. Para desfazer, use Ctrl+Z.`);
    } else if (a === 'wconvert') {
      const count = insts.length;
      ed.convertWorldSelection();
      toast(`${count} prédios convertidos em objetos editáveis`);
    } else if (a === 'wcopy') {
      const lines = insts.map(i => `RemoveBuildingForPlayer(playerid, ${i.id}, ${i.x.toFixed(4)}, ${i.y.toFixed(4)}, ${i.z.toFixed(4)}, 0.25);`).join('\n');
      await copyText(lines);
      toast(`${insts.length} linhas copiadas`);
    } else if (a === 'wadd') {
      ed.copyWorldSelection();
    }
  });
}

// =====================================================================  materiais
const matOf = (o, i) => (o.materials || []).find(m => m.index === i);
const texKey = (txd, tex) => String(txd || '').toLowerCase() + '/' + String(tex || '').toLowerCase();

function materialSection(objs, mixedModels = false) {
  const ed = app.editor;
  const o = objs[0];
  const info = ed.slotInfo(o.model);
  if (!info.length && app.gd.models.has(o.model) && !pendingSlots.has(o.model)) {
    pendingSlots.add(o.model);
    app.models.slots(o.model).then(() => { pendingSlots.delete(o.model); renderInspector(); });
  }
  const used = Math.max(0, ...(o.materials || []).map(m => m.index + 1));
  const count = showAllIndices ? MAX_MATERIAL_INDEX + 1 : Math.max(info.length, used, 1);
  const sel = new Set(ed.matSel);
  const rows = [];
  for (let i = 0; i < count; i++) {
    const m = matOf(o, i);
    const orig = info[i];
    const exists = i < info.length;
    const origName = orig?.texture ? orig.texture : (exists ? '(sem textura)' : '(não existe no modelo)');
    let main = origName, sub = orig?.txd ? orig.txd : '', cls = '';
    if (m && isText(m)) { main = 'Texto: ' + m.text.replace(/\n/g, ' ').slice(0, 28); sub = `${m.font} ${m.fontSize} · era ${origName}`; cls = ' changed'; }
    else if (m && !keepsTexture(m)) { main = m.texture; sub = `${m.txd} · era ${origName}`; cls = ' changed'; }
    else if (m) { sub = (sub ? sub + ' · ' : '') + 'cor alterada'; cls = ' changed'; }
    const color = m && !isText(m) && parseColor(m.color) ? `<span class="slot-swatch" style="background:${cssColor(m.color)}" title="${m.color}"></span>` : '<span></span>';
    rows.push(`<div class="slot${sel.has(i) ? ' active' : ''}${cls}${exists ? '' : ' ghost'}" data-slot="${i}" role="button" tabindex="0">
      <input type="checkbox" data-slot-check="${i}" ${sel.has(i) ? 'checked' : ''} aria-label="Escolher índice ${i}">
      <span class="slot-idx">${i}</span><span class="slot-ph" data-slot-thumb="${i}"></span>
      <span class="slot-name">${esc(main)}${sub ? `<small>${esc(sub)}</small>` : ''}</span>${color}</div>`);
  }
  const n = info.length;
  const head = `<div class="insp-label">Materiais <span class="tag">${n ? plural(n, 'índice', 'índices') : 'índices'}</span></div>
    ${mixedModels ? '<div class="insp-note warn">Os objetos selecionados são de modelos diferentes: a lista mostra os índices do primeiro.</div>' : ''}
    <div class="slots">${rows.join('')}</div>
    <div class="mini-actions">
      <button type="button" class="link-btn" data-matsel="all">Marcar todos</button>
      <button type="button" class="link-btn" data-matsel="none">Nenhum</button>
      <button type="button" class="link-btn" data-matsel="extra">${showAllIndices ? 'Só os do modelo' : 'Mostrar 0 a 15'}</button>
    </div>`;
  if (!sel.size) {
    return `<div class="insp-section mat">${head}
      <div class="insp-note">Marque um ou mais índices (ou use a ferramenta <b>Textura (T)</b> e clique na parte do objeto) para trocar a textura, a cor ou escrever um texto.</div>
      ${copyPasteRow(o)}</div>`;
  }
  const idx = [...sel];
  const cur = matOf(o, idx[0]);
  const tabs = `<div class="seg mat-tabs" role="tablist">
      <button type="button" class="btn seg-btn${matTab === 'texture' ? ' active' : ''}" data-mattab="texture"><svg><use href="#i-brush"/></svg>Textura e cor</button>
      <button type="button" class="btn seg-btn${matTab === 'text' ? ' active' : ''}" data-mattab="text"><svg><use href="#i-text"/></svg>Texto</button>
    </div>`;
  const label = idx.length > 1 ? `índices ${idx.join(', ')}` : `índice ${idx[0]}`;
  const body = matTab === 'text' ? textEditor(cur, label) : textureEditor(cur, label, idx, info);
  return `<div class="insp-section mat">${head}${tabs}${body}
    <details class="pawn-preview"><summary>Código Pawn deste objeto</summary><pre class="code small" id="matCode"></pre>
      <button type="button" class="btn small" data-matcopy><svg><use href="#i-copy"/></svg>Copiar</button></details>
    ${copyPasteRow(o)}</div>`;
}

function copyPasteRow(o) {
  return `<div class="mini-actions">
      <button type="button" class="btn" data-mat="copy" title="Copiar todos os materiais deste objeto"><svg><use href="#i-dropper"/></svg>Copiar</button>
      <button type="button" class="btn" data-mat="paste" ${app.editor.materialClipboard ? '' : 'disabled'} title="Colar os materiais copiados na seleção"><svg><use href="#i-brush"/></svg>Colar</button>
      ${(o.materials || []).length ? '<button type="button" class="btn danger" data-mat="clearall"><svg><use href="#i-trash"/></svg>Restaurar tudo</button>' : ''}
    </div>`;
}

function textureEditor(cur, label, idx, info) {
  const t = cur && !isText(cur) && !keepsTexture(cur) ? cur : null;
  const orig = info[idx[0]];
  return `<div class="mat-body">
    <div class="insp-note">SetObjectMaterial no ${esc(label)}. Clique numa textura na aba <a href="#" data-goto-tex>Texturas</a> ou digite abaixo.</div>
    <div class="tex-fields">
      <label>modelid<input type="number" step="1" id="mtModel" value="${t ? t.model : -1}"></label>
      <label>txdname<input id="mtTxd" value="${esc(t ? t.txd : 'none')}" spellcheck="false"></label>
      <label>texturename<input id="mtTex" value="${esc(t ? t.texture : 'none')}" spellcheck="false"></label>
    </div>
    <div class="mini-actions">
      <button type="button" class="btn primary" data-mat="applytex"><svg><use href="#i-check"/></svg>Aplicar textura</button>
      <button type="button" class="btn" data-mat="clear" title="Volta a textura e a cor originais${orig?.texture ? ' (' + esc(orig.texture) + ')' : ''}"><svg><use href="#i-restore"/></svg>Original</button>
    </div>
    <div class="insp-label">Cor (materialcolor) <span class="tag">multiplica a textura; o alfa deixa transparente</span></div>
    <div id="matPalette"></div>
  </div>`;
}

function textEditor(cur, label) {
  const t = cur && isText(cur) ? cur : textDraft;
  const sizes = MATERIAL_SIZES.map(([v, s]) => `<option value="${v}" ${v === t.size ? 'selected' : ''}>${s} (${v})</option>`).join('');
  const fonts = [...new Set([...FONTS, t.font])].map(f => `<option ${f === t.font ? 'selected' : ''}>${esc(f)}</option>`).join('');
  return `<div class="mat-body">
    <div class="insp-note">SetObjectMaterialText no ${esc(label)}. Use <code>{FF0000}</code> para mudar a cor no meio do texto e Enter para outra linha.</div>
    <textarea id="mxText" rows="3" spellcheck="false" aria-label="Texto">${esc(t.text)}</textarea>
    <div class="pair">
      <label>Tamanho do material<select id="mxSize">${sizes}</select></label>
      <label>Fonte<select id="mxFont">${fonts}</select></label>
      <label>Tamanho da letra<input type="number" id="mxFontSize" min="1" max="255" step="1" value="${t.fontSize}"></label>
      <label>Alinhamento<select id="mxAlign">${TEXT_ALIGN.map(([v, , n]) => `<option value="${v}" ${v === t.align ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
    </div>
    <label class="check"><input type="checkbox" id="mxBold" ${t.bold ? 'checked' : ''}> Negrito</label>
    <div class="insp-label">Prévia</div>
    <div class="text-preview"><canvas id="mxPreview"></canvas></div>
    <div class="insp-label">Cor da letra (fontcolor)</div><div id="mxFontColor"></div>
    <div class="insp-label">Cor do fundo (backcolor)</div><div id="mxBackColor"></div>
    <div class="mini-actions">
      <button type="button" class="btn primary" data-mat="applytext"><svg><use href="#i-check"/></svg>${cur && isText(cur) ? 'Atualizar texto' : 'Escrever no objeto'}</button>
      <button type="button" class="btn" data-mat="clear"><svg><use href="#i-restore"/></svg>Original</button>
    </div>
  </div>`;
}

function bindMaterials(objs) {
  const ed = app.editor;
  const o = objs[0];
  const uids = objs.map(x => x.uid);
  const info = ed.slotInfo(o.model);
  const idx = ed.matSel;

  $$('#inspector [data-slot-thumb]').forEach(ph => {
    const i = +ph.dataset.slotThumb;
    const m = matOf(o, i);
    if (m && isText(m)) { ph.classList.add('is-text'); ph.textContent = 'Aa'; return; }
    let txd = info[i]?.txd, name = info[i]?.texture;
    if (m && !keepsTexture(m)) { txd = m.txd; name = m.texture; }
    if (!txd || !name) return;
    app.texlib.thumb(String(txd).toLowerCase(), String(name).toLowerCase(), (url) => {
      if (!url || !ph.isConnected) return;
      const img = document.createElement('img'); img.src = url; img.alt = ''; ph.replaceWith(img);
    });
  });

  $$('#inspector [data-slot]').forEach(row => {
    const i = +row.dataset.slot;
    row.addEventListener('click', (e) => {
      if (e.target.matches('input[type="checkbox"]')) return;
      if (e.ctrlKey || e.metaKey || e.shiftKey) ed.toggleMatIndex(i);
      else ed.setMatSel(idx.length === 1 && idx[0] === i ? [] : [i]);
    });
    row.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ed.toggleMatIndex(i); } });
  });

  $$('#inspector [data-slot-check]').forEach(c => c.addEventListener('change', () => ed.toggleMatIndex(+c.dataset.slotCheck)));

  $$('#inspector [data-matsel]').forEach(b => b.onclick = () => {
    const a = b.dataset.matsel;
    if (a === 'all') ed.setMatSel(Array.from({ length: showAllIndices ? 16 : Math.max(info.length, 1) }, (_, i) => i));
    else if (a === 'none') ed.setMatSel([]);
    else { showAllIndices = !showAllIndices; renderInspector(); }
  });

  $$('#inspector [data-mattab]').forEach(b => b.onclick = () => { matTab = b.dataset.mattab; store.set('matTab', matTab); renderInspector(); });
  $('#inspector [data-goto-tex]')?.addEventListener('click', (e) => { e.preventDefault(); app.emit('show-tab', 'textures'); });

  const code = $('#matCode');
  if (code) {
    const fn = store.get('export', {}).fn === 'CreateObject' ? 'SetObjectMaterial' : 'SetDynamicObjectMaterial';
    const lines = (o.materials || []).map(m => materialCall(m, 'objectid', fn));
    code.textContent = lines.length ? lines.join('\n') : '// Nenhuma troca de material ainda';
    $('#inspector [data-matcopy]').onclick = async () => { await copyText(code.textContent); toast('Código copiado'); };
  }

  const pal = $('#matPalette');
  if (pal) {
    const cur = matOf(o, idx[0]);
    colorPalette(pal, {
      value: cur && !isText(cur) ? cur.color : '0',
      noneLabel: 'Sem cor (0)',
      onChange: (c) => ed.applyColor(uids, idx, c),
    });
  }

  if ($('#mxText')) bindTextEditor(uids, o, idx);

  $$('#inspector [data-mat]').forEach(b => b.onclick = () => {
    const a = b.dataset.mat;
    if (a === 'applytex') {
      const model = parseInt($('#mtModel').value, 10);
      const txd = $('#mtTxd').value.trim(), texture = $('#mtTex').value.trim();
      if (!txd || !texture) { toast('Preencha txdname e texturename', 'warn'); return; }
      const lib = app.texlib.find(txd, texture);
      if (app.texlib.items.length && !lib && !/^none$/i.test(texture)) toast(`Não achei "${texture}" em "${txd}" no seu jogo: no SA-MP essa parte vai ficar sem textura.`, 'warn', 6000);
      ed.applyTexture(uids, idx, { model: Number.isFinite(model) ? model : (lib?.model ?? -1), txd, texture });
    } else if (a === 'clear') ed.clearMaterials(uids, idx);
    else if (a === 'clearall') ed.clearMaterials(uids, null);
    else if (a === 'copy') { const n = ed.copyMaterials(); toast(n ? plural(n, 'material copiado', 'materiais copiados') : 'Esse objeto não tem trocas de material', n ? 'ok' : 'warn'); renderInspector(); }
    else if (a === 'paste') { const n = ed.pasteMaterials(); if (n) toast('Materiais colados em ' + plural(n, 'objeto', 'objetos')); }
    else if (a === 'applytext') applyTextNow(uids, idx);
  });
}

function readText() {
  return {
    text: $('#mxText').value,
    size: +$('#mxSize').value,
    font: $('#mxFont').value,
    fontSize: Math.max(1, Math.min(255, +$('#mxFontSize').value || 24)),
    bold: $('#mxBold').checked ? 1 : 0,
    align: +$('#mxAlign').value,
    fontColor: textDraft.fontColor,
    backColor: textDraft.backColor,
  };
}

function drawPreview() {
  const c = $('#mxPreview');
  if (!c) return;
  const t = normalizeMaterial({ kind: 'text', index: 0, ...readText() });
  const [w, h] = SIZE_PIXELS[t.size] || [256, 128];
  c.width = w; c.height = h;
  drawMaterialText(c.getContext('2d'), t, w, h);
}

function applyTextNow(uids, idx) {
  textDraft = { ...textDraft, ...readText() };
  suppress = true;
  try { app.editor.applyText(uids, idx, textDraft); } finally { suppress = false; }
  const keepFocus = document.activeElement?.id;
  renderInspector();
  if (keepFocus) document.getElementById(keepFocus)?.focus();
}

function bindTextEditor(uids, o, idx) {
  const cur = matOf(o, idx[0]);
  if (cur && isText(cur)) textDraft = { ...textDraft, ...cur };
  const live = idx.every(i => isText(matOf(o, i)));
  let timer = null;
  const changed = () => {
    textDraft = { ...textDraft, ...readText() };
    drawPreview();
    if (live) { clearTimeout(timer); timer = setTimeout(() => applyTextNow(uids, idx), 450); }
  };
  ['#mxText', '#mxFontSize'].forEach(s => $(s).addEventListener('input', changed));
  ['#mxSize', '#mxFont', '#mxAlign', '#mxBold'].forEach(s => $(s).addEventListener('change', changed));
  colorPalette($('#mxFontColor'), { value: textDraft.fontColor, allowNone: true, noneLabel: 'Invisível (0)', onChange: (c) => { textDraft.fontColor = c; changed(); } });
  colorPalette($('#mxBackColor'), { value: textDraft.backColor, allowNone: true, noneLabel: 'Sem fundo (0)', onChange: (c) => { textDraft.backColor = c; changed(); } });
  drawPreview();
}
