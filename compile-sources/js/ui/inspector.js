// Inspetor (painel da direita): posição, rotação, opções e o editor de materiais do SA-MP
// (SetObjectMaterial e SetObjectMaterialText) com todos os índices do objeto.
import * as THREE from 'three';
import { categoryOf } from '../world/gamedata.js';
import { drawMaterialText } from '../world/models.js';
import {
  MAX_MATERIAL_INDEX, MATERIAL_SIZES, SIZE_PIXELS, TEXT_ALIGN, FONTS, TEXT_DEFAULTS,
  isText, keepsTexture, isNoneTexture, normalizeMaterial, materialCall, cssColor, parseColor,
} from '../editor/materials.js';
import { colorPalette, openVehicleColorPicker } from './palette.js';
import { app, $, $$, esc, fmt, plural, store, toast, copyText, modelLabel, bindScrub, showPrompt } from './common.js';
import { CAR_COLORS, carColorHex, COMPONENT_TYPES, VEHICLE_COMPONENTS, supportsPaintjob, isVehicleValidForColor, isVehicleValidForModding, isPaintjobValidForVehicle, isModValidForVehicle, getCompatiblePaintjobs } from '../world/vehicleMods.js';
import { POPULAR_ANIMATIONS, ALL_ANIMATIONS, POPULAR_SKINS, ALL_SKINS, getSkinLabel, findSkin } from '../world/actors.js';
import { openAnimPicker } from './animPicker.js';
import { openSkinPicker } from './skinPicker.js';
import { STANDARD_LABEL_COLORS, labelColorToHex, hexToLabelColor, labelColorToPawnHex } from '../world/labels.js';
import { PREDEFINED_PICKUPS, PICKUP_TYPES, getPickupLabel } from '../world/pickups.js';
import { DEFAULT_GANGZONE_COLORS, gzColorToRgba, gzColorToHexAndAlpha, hexAndAlphaToGzColor } from '../world/gangzones.js';

const round = (v, d = 4) => Math.round((+v || 0) * 10 ** d) / 10 ** d;

export function getTotalProjectItems() {
  const p = app.project;
  return (p.objects?.length || 0) + (p.vehicles?.length || 0) + (p.actors?.length || 0) + (p.labels?.length || 0) + (p.pickups?.length || 0);
}

export function get3DTextCleanLength(text) {
  if (!text) return 0;
  let s = String(text).replace(/\{[0-9a-fA-F]{6}\}/g, '');
  s = s.replace(/\\n/gi, '').replace(/~n~/gi, '').replace(/[\r\n]/g, '');
  return s.length;
}

export function truncate3DTextToLimit(text, limit = 1024) {
  if (!text) return '';
  if (get3DTextCleanLength(text) <= limit) return text;
  let cleanCount = 0;
  let result = '';
  let i = 0;
  const s = String(text);
  while (i < s.length) {
    if (s[i] === '{' && i + 7 < s.length && s[i + 7] === '}' && /^[0-9a-fA-F]{6}$/.test(s.slice(i + 1, i + 7))) {
      result += s.slice(i, i + 8);
      i += 8;
      continue;
    }
    if (s[i] === '\r' || s[i] === '\n') {
      result += s[i];
      i++;
      continue;
    }
    if (s.slice(i, i + 2) === '\\n') {
      result += '\\n';
      i += 2;
      continue;
    }
    if (s.slice(i, i + 3).toLowerCase() === '~n~') {
      result += s.slice(i, i + 3);
      i += 3;
      continue;
    }
    if (cleanCount < limit) {
      result += s[i];
      cleanCount++;
      i++;
    } else {
      break;
    }
  }
  return result;
}

let showAllIndices = false;
let matTab = store.get('matTab', 'texture');
let textDraft = { text: 'Texto', ...TEXT_DEFAULTS };
let suppress = false;
let pendingSlots = new Set();
let creatingLabelDraft = null;

export function openCreate3DTextPanel() {
  app.editor.select([]);
  creatingLabelDraft = {
    text: 'Novo Texto 3D',
    color: 0x33CCFFFF,
    scale: 1.0,
    drawDist: 50.0,
    world: 0,
    testLOS: 0,
    comment: ''
  };
  const rightSb = $('#rightSidebar') || document.querySelector('.right-sidebar');
  if (rightSb && rightSb.classList.contains('collapsed')) {
    $('#btnToggleRightSidebar')?.click();
  }
  renderInspector();
  setTimeout(() => {
    const txt = $('#lblDraftText');
    if (txt) {
      txt.focus();
      txt.select();
    }
  }, 50);
}

export function setupInspector() {
  const ed = app.editor;
  const rerender = () => { if (!suppress) renderInspector(); };
  ed.addEventListener('selection', () => {
    creatingLabelDraft = null;
    rerender();
  });
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
    if (creatingLabelDraft) {
      el.innerHTML = labelCreateInspector(creatingLabelDraft);
      bindLabelCreate(creatingLabelDraft);
      return;
    }
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
    titleThumb(item.model);
  } else if (kind === 'actors') {
    el.innerHTML = actorInspector(item);
    bindActor(item);
    titleThumb(item.skin ?? 0, true);
  } else if (kind === 'labels') {
    el.innerHTML = labelInspector(item);
    bindLabel(item);
  } else if (kind === 'pickups') {
    el.innerHTML = pickupInspector(item);
    bindPickup(item);
    titleThumb(item.model);
  } else if (kind === 'gangZones') {
    el.innerHTML = gangZoneInspector(item);
    bindGangZone(item);
  } else {
    el.innerHTML = objectInspector(item);
    bindItem(item);
    bindMaterials([item]);
    titleThumb(item.model);
  }
}

function titleThumb(model, isActor = false) {
  if (isActor && (model === 0 || model === '0')) {
    const img = $('#inspector .insp-title img');
    if (img) { img.src = '/thumbs/obj/0.webp?v=4'; img.classList.remove('empty'); }
    return;
  }
  app.thumbs.request(model, (url) => { const img = $('#inspector .insp-title img'); if (img && url) { img.src = url; img.classList.remove('empty'); } });
}

function emptyInspector() {
  const p = app.project;
  const c = p.cameras || { shots: [], paths: [] };
  const total = (p.objects?.length || 0) + (p.vehicles?.length || 0) + (p.actors?.length || 0) + (p.labels?.length || 0) + (p.pickups?.length || 0) + (p.gangZones?.length || 0);
  return `<div class="insp-empty"><h3>${esc(p.name)}</h3>
    <div class="stat-line"><span>Objetos</span><b>${p.objects?.length || 0}</b></div>
    <div class="stat-line"><span>Veículos</span><b>${p.vehicles?.length || 0}</b></div>
    <div class="stat-line"><span>Actors</span><b>${p.actors?.length || 0}</b></div>
    <div class="stat-line"><span>Textos 3D</span><b>${p.labels?.length || 0}</b></div>
    <div class="stat-line"><span>Pickups</span><b>${p.pickups?.length || 0}</b></div>
    <div class="stat-line"><span>GangZones</span><b>${p.gangZones?.length || 0}</b></div>
    <div class="stat-line"><span>TextDraws</span><b>${p.textDraws?.length || 0}</b></div>
    <div class="stat-line"><span>Objetos removidos</span><b>${p.removed?.length || 0}</b></div>
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
  `<label data-axis="${a}">
     <span data-scrub="${prefix}${a}" title="Arraste para ajustar (Shift: fino)">${a.toUpperCase()}</span>
     <input type="number" step="${step}" data-field="${prefix}${a}" value="${fmt(values[i])}" aria-label="${prefix === 'r' ? 'Rotação' : 'Posição'} ${a.toUpperCase()}">
     <div class="vec-arrows">
       <button type="button" class="vec-arrow-btn up" data-step-field="${prefix}${a}" data-step-dir="1" data-step-base="${step}" title="Aumentar (Shift: fino, Ctrl: rápido)" aria-label="Aumentar ${a.toUpperCase()}">▲</button>
       <button type="button" class="vec-arrow-btn down" data-step-field="${prefix}${a}" data-step-dir="-1" data-step-base="${step}" title="Diminuir (Shift: fino, Ctrl: rápido)" aria-label="Diminuir ${a.toUpperCase()}">▼</button>
     </div>
   </label>`).join('')}</div>`;

const titleBlock = (model, sub, initialSrc = null) => {
  const isSkin0 = (model === 0 || model === '0');
  const src = initialSrc || (isSkin0 ? '/thumbs/obj/0.webp?v=4' : '');
  return `<div class="insp-title"><img class="thumb${src ? '' : ' empty'}" ${src ? `src="${src}"` : ''} alt="" width="64" height="64"><div><div class="insp-name">${esc(modelLabel(model))}</div><div class="insp-sub">${sub}</div></div></div>`;
};

const actionGrid = () => `<div class="btn-grid">
      <button type="button" class="btn" data-act="resetRot" title="Zerar rotação (X: 0°, Y: 0°, Z: 0°)"><svg><use href="#i-rotate"/></svg>Zerar giro</button>
      <button type="button" class="btn" data-act="ground" title="Colocar em cima da superfície ou objeto logo abaixo"><svg><use href="#i-ground"/></svg>Superfície</button>
      <button type="button" class="btn" data-act="dup" title="Cria uma cópia no mesmo lugar, já com o gizmo de mover (Ctrl+D)"><svg><use href="#i-copy"/></svg>Duplicar</button>
      <button type="button" class="btn" data-act="focus"><svg><use href="#i-focus"/></svg>Focar</button>
    </div>`;

function speedSection() {
  const sp = app.editor.transformSpeed || { move: 1.0, rotate: 10.0 };
  const currentMove = Math.min(10.0, Math.max(1.0, +sp.move || 1.0));
  const currentRotate = Math.min(10.0, Math.max(1.0, +sp.rotate || 10.0));

  const options = [];
  for (let i = 1; i <= 10; i++) {
    const val = (i).toFixed(1);
    const label = `${i},0`;
    options.push({ val, label, num: i });
  }

  const renderSelect = (type, current) => {
    return `<select data-speed="${type}" style="width:100%; box-sizing:border-box; height:30px; font-weight:600;">
      ${options.map(o => {
        const selected = Math.abs(current - o.num) < 0.05 ? 'selected' : '';
        return `<option value="${o.val}" ${selected}>${o.label}</option>`;
      }).join('')}
    </select>`;
  };

  return `<div class="insp-section">
    <div class="insp-label">Velocidade <span class="tag">1,0 a 10,0</span></div>
    <div class="pair">
      <label>Movimento${renderSelect('move', currentMove)}</label>
      <label>Rotação${renderSelect('rotate', currentRotate)}</label>
    </div>
  </div>`;
}

function scopeSection() {
  const total = getTotalProjectItems();
  return `
    <div class="insp-section" style="margin-bottom: 8px;">
      <div class="insp-label">Mover ou rotacionar vários itens</div>
      <div class="scope-toggle" style="margin: 0;">
        <button type="button" class="btn small active" data-scope="sel">Selecionados</button>
        <button type="button" class="btn small" data-scope="all">Projeto (${total})</button>
      </div>
    </div>`;
}

function objectInspector(o) {
  const def = app.gd.models.get(o.model);
  const mats = materialSection([o]);
  const first = app.editor.mode === 'texture';
  const total = getTotalProjectItems();
  return `${titleBlock(o.model, `ID ${o.model} <span class="tag">${esc(def ? categoryOf(def) : 'Não existe no jogo')}</span>`)}
    <button type="button" class="btn danger block" data-act="del" style="margin: 8px 0 10px;"><svg><use href="#i-trash"/></svg>Apagar objeto</button>
    ${scopeSection()}
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
          <button type="button" class="btn small" data-move-act="settarg" title="Usar coordenadas atuais do objeto como alvo"><svg><use href="#i-pin"/></svg>Posição atual</button>
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
            <option value="">Selecione um objeto</option>
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
          <button type="button" class="btn small" data-attach-act="calc" title="Calcula os offsets relativos da posição atual no mundo 3D"><svg><use href="#i-focus"/></svg>Calcular posição</button>
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
  const total = getTotalProjectItems();
  const c1Hex = carColorHex(v.color1);
  const c2Hex = carColorHex(v.color2);
  const comps = v.components || [];

  return `${titleBlock(v.model, `Veículo ${v.model} <span class="tag">${esc(def?.model || '')}</span>`)}
    <button type="button" class="btn danger block" data-act="del" style="margin: 8px 0 10px;"><svg><use href="#i-trash"/></svg>Apagar veículo</button>
    ${scopeSection()}
    <div class="insp-section"><div class="insp-label">Posição</div>${vecInputs('', ['x', 'y', 'z'], [v.x, v.y, v.z], 0.1)}</div>
    <div class="insp-section"><div class="insp-label">Ângulo e respawn</div>
      <div class="pair"><label>Ângulo Z<input type="number" step="1" data-field="rz" value="${fmt(v.rz)}"></label><label>Respawn (s)<input type="number" step="10" min="-1" data-field="respawn" value="${v.respawn}"></label></div>
    </div>
    ${speedSection()}
    ${actionGrid()}

    <!-- Cores -->
    <div class="insp-section">
      <div class="insp-label">Cores do veículo (0 a 255)</div>
      ${isVehicleValidForColor(v.model) ? `
      <div class="pair">
        <label>Cor 1
          <div style="display:flex; gap:6px; align-items:center;">
            <button type="button" class="slot-swatch" id="btnVehColor1" style="width:26px; height:26px; background:${c1Hex}; border-radius:4px; border:1px solid rgba(255,255,255,0.2); cursor:pointer;" title="Abrir paleta de 256 cores"></button>
            <input type="number" step="1" min="-1" max="255" data-field="color1" value="${v.color1}">
          </div>
        </label>
        <label>Cor 2
          <div style="display:flex; gap:6px; align-items:center;">
            <button type="button" class="slot-swatch" id="btnVehColor2" style="width:26px; height:26px; background:${c2Hex}; border-radius:4px; border:1px solid rgba(255,255,255,0.2); cursor:pointer;" title="Abrir paleta de 256 cores"></button>
            <input type="number" step="1" min="-1" max="255" data-field="color2" value="${v.color2}">
          </div>
        </label>
      </div>
      <div class="insp-note">-1 significa cor aleatória. Clique no quadrado para abrir a paleta de 256 cores.</div>
      ` : `
      <div class="insp-note warn">Este modelo de veículo não suporta alteração de cores.</div>
      `}
    </div>
    <div class="insp-section"><div class="insp-label">Comentário / Anotação (Pawn)</div>
      <input type="text" data-field-str="comment" placeholder="// Ex: Carro da polícia" value="${esc(v.comment || '')}" style="width:100%;">
    </div>

    <!-- Paintjob -->
    <div class="insp-section">
      <div class="insp-label">Paintjob</div>
      ${supportsPaintjob(v.model) ? `
      <select id="vehPaintjob" style="width:100%;">
        <option value="-1" ${v.paintjob === -1 ? 'selected' : ''}>Nenhum (-1)</option>
        ${isPaintjobValidForVehicle(0, v.model) ? `<option value="0" ${v.paintjob === 0 ? 'selected' : ''}>Paintjob 1 (0)</option>` : ''}
        ${isPaintjobValidForVehicle(1, v.model) ? `<option value="1" ${v.paintjob === 1 ? 'selected' : ''}>Paintjob 2 (1)</option>` : ''}
        ${isPaintjobValidForVehicle(2, v.model) ? `<option value="2" ${v.paintjob === 2 ? 'selected' : ''}>Paintjob 3 (2)</option>` : ''}
      </select>
      <div class="insp-note">Veículo compatível com ${getCompatiblePaintjobs(v.model).length} paintjob(s).</div>
      ` : `
      <div class="insp-note">Este modelo não suporta paintjobs.</div>
      `}
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
      ${isVehicleValidForModding(v.model) ? `
      <div style="margin-top:8px;">
        <label>Adicionar componente
          <select id="selAddComp" style="width:100%;">
            <option value="">Escolha um componente</option>
            ${Object.entries(COMPONENT_TYPES).map(([typeId, typeName]) => {
              const items = Object.entries(VEHICLE_COMPONENTS).filter(([cId, c]) => c.type === +typeId && !comps.includes(+cId) && isModValidForVehicle(+cId, v.model));
              if (!items.length) return '';
              return `<optgroup label="${esc(typeName)}">
                ${items.map(([cId, c]) => `<option value="${cId}">${cId} - ${esc(c.name)}</option>`).join('')}
              </optgroup>`;
            }).join('')}
          </select>
        </label>
      </div>
      ` : `
      <div class="insp-note warn" style="margin-top:8px;">Este modelo não suporta modificações de tuning.</div>
      `}
      <details class="pawn-preview" style="margin-top:8px;"><summary>Código Pawn deste veículo</summary><pre class="code small" id="vehCode"></pre>
        <button type="button" class="btn small" data-vehcopy><svg><use href="#i-copy"/></svg>Copiar</button></details>
    </div>`;
}

function actorInspector(a) {
  const total = getTotalProjectItems();
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
    ${scopeSection()}
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
            <option value="">Escolha uma skin (${ALL_SKINS.length})</option>
            ${ALL_SKINS.map(s => `<option value="${s.id}" ${s.id === (a.skin ?? 0) ? 'selected' : ''}>${s.id} - ${esc(s.name)}</option>`).join('')}
          </select>
        </label>
      </div>
      <button type="button" class="btn small primary block" id="btnOpenSkinPicker" style="margin-top:6px; font-weight:600;" title="Abrir galeria com prévia visual de todas as skins"><svg><use href="#i-user"/></svg> Abrir Galeria de Skins</button>
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
        <button type="button" class="btn small block" id="btnOpenAnimPicker" style="margin: 6px 0 8px;"><svg><use href="#i-search"/></svg> Abrir Galeria de Animações</button>
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
  const total = getTotalProjectItems();
  const isAll = items.length >= total && total > 0;
  const c = { x: 0, y: 0, z: 0 };
  for (const s of items) { c.x += s.item.x; c.y += s.item.y; c.z += s.item.z; }
  c.x = round(c.x / items.length, 3);
  c.y = round(c.y / items.length, 3);
  c.z = round(c.z / items.length, 3);

  return `<div class="insp-empty">
    <h3>${isAll ? 'Todo o projeto' : `${items.length} itens selecionados`}</h3>
    <button type="button" class="btn danger block" data-act="del" style="margin: 8px 0 10px;"><svg><use href="#i-trash"/></svg>Apagar ${items.length} itens</button>
    <div class="insp-section" style="margin-bottom: 8px;">
      <div class="insp-label">Mover ou rotacionar vários itens</div>
      <div class="scope-toggle" style="margin: 0;">
        <button type="button" class="btn small ${isAll ? '' : 'active'}" data-scope="sel">Selecionados (${items.length})</button>
        <button type="button" class="btn small ${isAll ? 'active' : ''}" data-scope="all">Projeto (${total})</button>
      </div>
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
    <button type="button" class="btn danger block" data-act="wremove" style="margin: 8px 0 10px;"><svg><use href="#i-demolish"/></svg>Remover do mapa</button>
    <div class="insp-section">
      <div class="stat-line"><span>Posição</span><b>${fmt(inst.x, 3)}, ${fmt(inst.y, 3)}, ${fmt(inst.z, 3)}</b></div>
      <div class="stat-line"><span>Rotação</span><b>${deg(e.x)}, ${deg(e.y)}, ${deg(e.z)}</b></div>
      <div class="stat-line"><span>Arquivo</span><b>${esc(inst.ipl)}.ipl</b></div>
      ${inst.interior ? `<div class="stat-line"><span>Interior</span><b>${inst.interior}</b></div>` : ''}
      ${lod}
    </div>
    <button type="button" class="btn primary block" data-act="wadd" title="Cria uma cópia em cima do original, já com o gizmo de mover"><svg><use href="#i-plus"/></svg>Posicionar cópia</button>
    <button type="button" class="btn block" data-act="wconvert"><svg><use href="#i-edit"/></svg>Tornar editável</button>
    <button type="button" class="btn block" data-act="wcopy"><svg><use href="#i-copy"/></svg>Copiar código</button>
    <div class="insp-note">"Tornar editável" remove o original e coloca uma cópia no projeto. "Posicionar cópia" deixa o original e cria a cópia no mesmo lugar.</div>`;
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
    <button type="button" class="btn danger block" data-act="wremove" style="margin: 8px 0 10px;"><svg><use href="#i-demolish"/></svg>Remover ${insts.length} objetos</button>
    <div class="insp-section">
      <div class="stat-line"><span>Total selecionado</span><b>${insts.length} objetos</b></div>
      <div class="stat-line"><span>Modelos</span><b>${models.slice(0, 8).join(', ')}${models.length > 8 ? '...' : ''}</b></div>
    </div>
    <button type="button" class="btn primary block" data-act="wadd" title="Cria cópias em cima dos originais, já com o gizmo de mover"><svg><use href="#i-plus"/></svg>Duplicar (${insts.length})</button>
    <button type="button" class="btn block" data-act="wconvert"><svg><use href="#i-edit"/></svg>Tornar editáveis (${insts.length})</button>
    <button type="button" class="btn block" data-act="wcopy"><svg><use href="#i-copy"/></svg>Copiar código de todos</button>
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
  $$('#inspector [data-scope]').forEach(b => b.onclick = () => {
    if (b.dataset.scope === 'all') app.editor.selectAll(false);
  });
}

function bindSpeedControls() {
  $$('#inspector [data-speed]').forEach(sel => {
    sel.addEventListener('change', () => {
      let v = parseFloat(sel.value);
      if (!Number.isFinite(v)) return;
      v = Math.min(10.0, Math.max(1.0, v));
      app.editor.setTransformSpeed({ [sel.dataset.speed]: v });
      store.set('transformSpeed', app.editor.transformSpeed);
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

function bindVecArrows(targetUids, project, isMulti = false) {
  const uids = Array.isArray(targetUids) ? targetUids : [targetUids];
  $$('#inspector [data-step-field]').forEach(btn => {
    const field = btn.dataset.stepField;
    const dir = parseInt(btn.dataset.stepDir, 10) || 1;
    const baseStep = parseFloat(btn.dataset.stepBase) || 0.1;
    const isRot = field.startsWith('r');

    let timer = null;
    let initialTimer = null;
    let before = null;

    const doStep = (e) => {
      const spObj = app.editor.transformSpeed || { move: 1.0, rotate: 1.0 };
      const speed = isRot ? (spObj.rotate ?? 1.0) : (spObj.move ?? 1.0);
      let mult = 1.0;
      if (e?.shiftKey) mult = 0.1;
      else if (e?.ctrlKey || e?.metaKey) mult = 5.0;
      const delta = dir * baseStep * speed * mult;

      for (const uid of uids) {
        const o = (app.editor.findProjectOf(uid) || project).find(uid);
        if (!o) continue;
        let cur = o[field] ?? 0;
        let next = cur + delta;
        if (isRot) {
          next = Math.round(next * 10) / 10;
          next = ((next % 360) + 360) % 360;
        } else {
          next = Math.round(next * 10000) / 10000;
        }
        o[field] = next;
      }
      app.editor.syncAll();
      updateValues();
    };

    const stop = () => {
      if (initialTimer) { clearTimeout(initialTimer); initialTimer = null; }
      if (timer) { clearInterval(timer); timer = null; }
      if (before) {
        const after = uids.map(u => (app.editor.findProjectOf(u) || project).snapshot(u)).filter(Boolean);
        project.record('Editar ' + field, before, after);
        before = null;
      }
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };

    btn.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      before = uids.map(u => (app.editor.findProjectOf(u) || project).snapshot(u)).filter(Boolean);
      doStep(e);
      window.addEventListener('pointerup', stop);
      window.addEventListener('pointercancel', stop);
      initialTimer = setTimeout(() => {
        timer = setInterval(() => doStep(e), 80);
      }, 300);
    });
  });
}

function bindItem(item) {
  bindCommon();
  bindSpeedControls();
  bindStringFields(item.uid);
  const uid = item.uid, project = app.editor.findProjectOf(uid) || app.project;
  bindVecArrows(uid, project);

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
  bindVecArrows(uid, project);

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
  bindVecArrows(uid, project);

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

  const btnOpenSkin = $('#btnOpenSkinPicker') || $('#btnBrowseSkin');
  if (btnOpenSkin) {
    btnOpenSkin.onclick = () => {
      openSkinPicker({
        currentSkin: a.skin ?? 0,
        onSelect: (newSkinId) => {
          changeActorSkin(uid, newSkinId);
          toast(`Skin alterada para ID ${newSkinId}!`, 'ok');
        }
      });
    };
  }

  const thumbImg = $('#inspector .insp-title img');
  if (thumbImg) {
    thumbImg.style.cursor = 'pointer';
    thumbImg.title = 'Clique para escolher a skin deste actor';
    thumbImg.onclick = () => btnOpenSkin?.click();
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
  bindVecArrows(items.map(x => x.item.uid), project, true);
  const total = getTotalProjectItems();
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
    else if (m && isNoneTexture(m)) { main = 'Invisível (textura removida)'; sub = `none · none · era ${origName}`; cls = ' changed'; }
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
      <button type="button" class="btn" data-mat="makeInvisible" title="Remover textura tornando este índice invisível: SetObjectMaterial(..., 0, &quot;none&quot;, &quot;none&quot;, 0)"><svg><use href="#i-trash"/></svg>Tornar invisível</button>
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
      ed.applyTexture(uids, idx, { model: Number.isFinite(model) ? model : (lib?.model ?? -1), txd, texture });
    } else if (a === 'makeInvisible') {
      ed.applyTexture(uids, idx, { model: 0, txd: 'none', texture: 'none', color: '0' });
      toast('Textura removida (índice invisível)');
      renderInspector();
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

// ===========================================================================
// 3D Text Labels
// ===========================================================================
function labelInspector(l) {
  const hex = labelColorToHex(l.color);
  const pawnHex = labelColorToPawnHex(l.color);
  return `
    <div class="insp-title">
      <div style="width:48px; height:48px; background:rgba(238,221,130,0.18); border:1px solid rgba(238,221,130,0.4); border-radius:8px; display:flex; align-items:center; justify-content:center; color:#EEDD82; font-size:18px; font-weight:bold;">3D</div>
      <div>
        <div style="font-weight:bold; font-size:14px;">Texto 3D</div>
        <span class="tag">Create3DTextLabel</span>
      </div>
    </div>
    <button type="button" class="btn danger block" data-act="del" style="margin: 8px 0 10px;"><svg><use href="#i-trash"/></svg>Apagar Texto 3D</button>
    ${scopeSection()}

    <div class="insp-section">
      <div class="insp-label" style="display:flex; justify-content:space-between; align-items:center;">
        <span>Texto (\n quebra, {RRGGBB} cor)</span>
        <span id="lblCharCount" style="font-family:monospace; font-size:11px; color:var(--paper-dim);">${get3DTextCleanLength(l.text || '')} / 1024</span>
      </div>
      <textarea id="lblText" rows="3" style="width:100%; box-sizing:border-box; font-family:monospace; font-size:13px; resize:vertical; padding:6px 8px; border-radius:4px; border:1px solid rgba(255,255,255,0.15); background:rgba(0,0,0,0.25); color:#fff;">${esc(l.text || '')}</textarea>
      <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:6px;">
        ${STANDARD_LABEL_COLORS.map(c => `
          <button type="button" class="btn small" data-lbl-tag="${c.tag}" style="font-size:10px; padding:2px 6px; border-left:3px solid ${c.hex};" title="Inserir cor ${c.name}">${c.tag}</button>
        `).join('')}
        <button type="button" class="btn small" id="btnLblBreak" style="font-size:10px; padding:2px 6px;" title="Inserir quebra de linha">\n Quebra</button>
      </div>
    </div>

    <div class="insp-section">
      <div class="insp-label" style="display:flex; justify-content:space-between; align-items:center;">
        <span>Tamanho / Zoom do Texto 3D</span>
        <span id="lblScaleVal" style="font-family:monospace; font-weight:bold; color:var(--accent, #f0a630);">${Math.round((l.scale ?? 1.0) * 100)}%</span>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:11px; color:#888;">20%</span>
        <input type="range" id="lblScaleRange" min="0.2" max="3.0" step="0.1" value="${l.scale ?? 1.0}" style="flex:1;">
        <span style="font-size:11px; color:#888;">300%</span>
        <button type="button" class="btn small" id="btnLblScaleReset" title="Restaurar tamanho padrão (100%)">100%</button>
      </div>
    </div>

    <!-- Cor Base -->
    <div class="insp-section">
      <div class="insp-label">Cor Padrão / Base (Formato 0xRRGGBBFF com alfa FF)</div>
      <div style="display:flex; gap:8px; align-items:center;">
        <input type="color" id="lblColorPicker" value="${hex.slice(0, 7)}" style="width:36px; height:32px; border:none; border-radius:4px; cursor:pointer;" title="Escolher cor visual">
        <input type="text" id="lblHexInput" value="${pawnHex}" placeholder="0xFFFFFFFF" style="width:115px; font-family:monospace; font-weight:bold; font-size:12px;">
        <span id="lblColorPreview" style="display:inline-block; width:22px; height:22px; border-radius:4px; background:${hex}; border:1px solid rgba(255,255,255,0.2);"></span>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:6px;">
        ${STANDARD_LABEL_COLORS.slice(0, 8).map(c => `
          <button type="button" class="slot-swatch" data-lbl-color="${labelColorToPawnHex(c.val)}" style="width:20px; height:20px; background:${c.hex}; border-radius:3px; border:1px solid rgba(255,255,255,0.2); cursor:pointer;" title="${c.name} (${labelColorToPawnHex(c.val)})"></button>
        `).join('')}
      </div>
    </div>

    <div class="insp-section"><div class="insp-label">Posição</div>${vecInputs('', ['x', 'y', 'z'], [l.x, l.y, l.z], 0.1)}</div>
    ${speedSection()}
    ${actionGrid()}

    <div class="insp-section">
      <div class="insp-label">Propriedades do Texto 3D</div>
      <div class="pair">
        <label>Distância de Visão<input type="number" step="5" min="1" max="500" data-field="drawDist" value="${l.drawDist ?? 40.0}"></label>
        <label>Mundo Virtual<input type="number" step="1" data-field="world" value="${l.world ?? 0}"></label>
      </div>
      <label class="check" style="margin-top:6px;">
        <input type="checkbox" id="lblTestLOS" ${l.testLOS ? 'checked' : ''}> Testar linha de visão (testLOS: oculta atrás de paredes)
      </label>
    </div>

    <div class="insp-section"><div class="insp-label">Comentário / Anotação (Pawn)</div>
      <input type="text" data-field-str="comment" placeholder="// Ex: Texto da porta de entrada" value="${esc(l.comment || '')}" style="width:100%;">
    </div>

    <div class="insp-section">
      <details class="pawn-preview"><summary>Código Pawn deste Texto 3D</summary>
        <pre class="code small" id="lblCode"></pre>
        <button type="button" class="btn small" id="btnLblCopy"><svg><use href="#i-copy"/></svg>Copiar Pawn</button>
      </details>
    </div>
  `;
}

function bindLabel(l) {
  bindCommon();
  bindSpeedControls();
  bindStringFields(l.uid);
  const uid = l.uid, project = app.editor.findProjectOf(uid) || app.project;
  bindVecArrows(uid, project);

  const txt = $('#lblText');
  const countEl = $('#lblCharCount');
  const updateCount = (val) => {
    const len = get3DTextCleanLength(val);
    if (countEl) {
      countEl.textContent = `${len} / 1024`;
      countEl.style.color = len >= 1024 ? '#ef4444' : 'var(--paper-dim)';
    }
  };
  if (txt) {
    txt.addEventListener('keydown', (e) => e.stopPropagation());
    txt.addEventListener('keyup', (e) => e.stopPropagation());
    txt.oninput = () => {
      let val = txt.value;
      if (get3DTextCleanLength(val) > 1024) {
        val = truncate3DTextToLimit(val, 1024);
        txt.value = val;
      }
      updateCount(val);
      suppress = true;
      try {
        project.updateItems('Editar Texto 3D', [uid], (o) => { o.text = val; });
        app.editor.syncAll();
        updateLabelCode(project.find(uid));
      } finally {
        suppress = false;
      }
    };
  }

  const scaleRange = $('#lblScaleRange');
  const scaleVal = $('#lblScaleVal');
  const btnScaleReset = $('#btnLblScaleReset');
  if (scaleRange) {
    scaleRange.oninput = () => {
      const val = parseFloat(scaleRange.value) || 1.0;
      if (scaleVal) scaleVal.textContent = Math.round(val * 100) + '%';
      suppress = true;
      try {
        project.updateItems('Alterar escala do Texto 3D', [uid], (o) => { o.scale = val; });
        app.editor.syncAll();
      } finally {
        suppress = false;
      }
    };
  }
  if (btnScaleReset && scaleRange) {
    btnScaleReset.onclick = () => {
      scaleRange.value = '1.0';
      scaleRange.dispatchEvent(new Event('input'));
    };
  }

  $$('#inspector [data-lbl-tag]').forEach(b => {
    b.onclick = () => {
      if (!txt) return;
      const tag = b.dataset.lblTag;
      const start = txt.selectionStart || txt.value.length;
      const end = txt.selectionEnd || txt.value.length;
      txt.value = txt.value.substring(0, start) + tag + txt.value.substring(end);
      txt.focus();
      txt.selectionStart = txt.selectionEnd = start + tag.length;
      txt.dispatchEvent(new Event('input'));
    };
  });

  const btnBreak = $('#btnLblBreak');
  if (btnBreak && txt) {
    btnBreak.onclick = () => {
      const start = txt.selectionStart || txt.value.length;
      const end = txt.selectionEnd || txt.value.length;
      txt.value = txt.value.substring(0, start) + '\\n' + txt.value.substring(end);
      txt.focus();
      txt.selectionStart = txt.selectionEnd = start + 2;
      txt.dispatchEvent(new Event('input'));
    };
  }

  const cp = $('#lblColorPicker');
  const hexInp = $('#lblHexInput');
  const preview = $('#lblColorPreview');

  const applyColor = (hex) => {
    const num = hexToLabelColor(hex);
    const colorHex = labelColorToHex(num);
    const pwh = labelColorToPawnHex(num);
    if (cp) cp.value = colorHex.slice(0, 7);
    if (hexInp) hexInp.value = pwh;
    if (preview) preview.style.background = colorHex;
    suppress = true;
    try {
      project.updateItems('Alterar Cor do Texto 3D', [uid], (o) => { o.color = num; });
      app.editor.syncAll();
      updateLabelCode(project.find(uid));
    } finally {
      suppress = false;
    }
  };

  if (cp) cp.oninput = () => applyColor(cp.value.toUpperCase());
  if (hexInp) {
    hexInp.onchange = () => {
      applyColor(hexInp.value.trim());
    };
  }
  $$('#inspector [data-lbl-color]').forEach(b => {
    b.onclick = () => applyColor(b.dataset.lblColor);
  });

  const los = $('#lblTestLOS');
  if (los) {
    los.onchange = () => {
      suppress = true;
      try {
        project.updateItems('Alterar testLOS', [uid], (o) => { o.testLOS = los.checked ? 1 : 0; });
        app.editor.syncAll();
        updateLabelCode(project.find(uid));
      } finally {
        suppress = false;
      }
    };
  }

  $$('#inspector [data-field]').forEach(inp => {
    inp.addEventListener('change', () => {
      const field = inp.dataset.field;
      let val = parseFloat(inp.value);
      if (!Number.isFinite(val)) { inp.value = fmt(project.find(uid)?.[field]); return; }
      if (['world'].includes(field)) val = Math.trunc(val);
      suppress = true;
      try {
        project.updateItems('Editar ' + field, [uid], (o) => { o[field] = val; });
        app.editor.syncAll();
        updateLabelCode(project.find(uid));
      } finally {
        suppress = false;
      }
    });
  });

  updateLabelCode(l);
  const copyBtn = $('#btnLblCopy');
  if (copyBtn) {
    copyBtn.onclick = () => {
      const code = $('#lblCode')?.textContent;
      if (code) { copyText(code); toast('Código Pawn do Texto 3D copiado!'); }
    };
  }
}

function updateLabelCode(l) {
  const codeEl = $('#lblCode');
  if (!codeEl || !l) return;
  const hex = '0x' + (Number(l.color) >>> 0).toString(16).toUpperCase().padStart(8, '0');
  const clean = String(l.text || '').replace(/\r/g, '').replace(/\n/g, '\\n');
  codeEl.textContent = `Create3DTextLabel("${clean}", ${hex}, ${l.x.toFixed(4)}, ${l.y.toFixed(4)}, ${l.z.toFixed(4)}, ${(l.drawDist ?? 40.0).toFixed(1)}, ${l.world ?? 0}, ${l.testLOS ? 1 : 0});`;
}

export function getCameraLookSurfacePoint(offsetZ = 0.5) {
  const vp = app.vp;
  if (!vp || !vp.camera) return { x: 0, y: 0, z: 10 };
  const cam = vp.camera;
  const rc = new THREE.Raycaster();
  rc.setFromCamera(new THREE.Vector2(0, 0), cam);
  rc.far = Math.max(3500, cam.far);
  const targets = app.editor.pickTargets ? app.editor.pickTargets() : [];
  const hits = rc.intersectObjects(targets, true)
    .filter(h => !h.object.userData.noPick && !h.object.isSprite && !h.object.userData?.isLabel && !h.object.userData?.isPickup && h.object.visible);

  if (hits.length > 0 && hits[0].distance < 300) {
    const p = hits[0].point;
    return {
      x: Math.round(p.x * 100) / 100,
      y: Math.round(p.y * 100) / 100,
      z: Math.round((p.z + offsetZ) * 100) / 100,
    };
  }

  const dir = new THREE.Vector3();
  cam.getWorldDirection(dir);
  const target = cam.position.clone().add(dir.multiplyScalar(8.0));
  const downRc = new THREE.Raycaster(
    new THREE.Vector3(target.x, target.y, Math.max(target.z + 50, cam.position.z + 50)),
    new THREE.Vector3(0, 0, -1),
    0,
    1500
  );
  const downHits = downRc.intersectObjects(targets, true)
    .filter(h => !h.object.userData.noPick && !h.object.isSprite && !h.object.userData?.isLabel && !h.object.userData?.isPickup && h.object.visible);
  const surfaceZ = downHits.length > 0 ? downHits[0].point.z : null;
  const finalZ = surfaceZ !== null ? (surfaceZ + offsetZ) : (target.z + offsetZ);
  return {
    x: Math.round(target.x * 100) / 100,
    y: Math.round(target.y * 100) / 100,
    z: Math.round(finalZ * 100) / 100,
  };
}

function labelCreateInspector(draft) {
  const hex = labelColorToHex(draft.color);
  const pawnHex = labelColorToPawnHex(draft.color);
  return `
    <div class="insp-title">
      <div style="width:48px; height:48px; background:rgba(238,221,130,0.18); border:1px solid rgba(238,221,130,0.4); border-radius:8px; display:flex; align-items:center; justify-content:center; color:#EEDD82; font-size:18px; font-weight:bold;">3D</div>
      <div>
        <div style="font-weight:bold; font-size:14px;">Criar Texto 3D</div>
        <span class="tag">Create3DTextLabel</span>
      </div>
    </div>

    <div class="insp-section">
      <div class="insp-label" style="display:flex; justify-content:space-between; align-items:center;">
        <span>Texto (\n quebra, {RRGGBB} cor)</span>
        <span id="lblDraftCharCount" style="font-family:monospace; font-size:11px; color:var(--paper-dim);">${get3DTextCleanLength(draft.text || '')} / 1024</span>
      </div>
      <textarea id="lblDraftText" rows="3" style="width:100%; box-sizing:border-box; font-family:monospace; font-size:13px; resize:vertical; padding:6px 8px; border-radius:4px; border:1px solid rgba(255,255,255,0.15); background:rgba(0,0,0,0.25); color:#fff;" placeholder="Digite o texto 3D...">${esc(draft.text || '')}</textarea>
      <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:6px;">
        ${STANDARD_LABEL_COLORS.map(c => `
          <button type="button" class="btn small" data-lbl-draft-tag="${c.tag}" style="font-size:10px; padding:2px 6px; border-left:3px solid ${c.hex};" title="Inserir cor ${c.name}">${c.tag}</button>
        `).join('')}
        <button type="button" class="btn small" id="btnLblDraftBreak" style="font-size:10px; padding:2px 6px;" title="Inserir quebra de linha">\n Quebra</button>
      </div>

      <button type="button" class="btn primary block" id="btnConfirmCreate3DText" style="margin: 10px 0 6px; font-weight: bold; font-size: 13px; padding: 10px;">
        <svg><use href="#i-text3d"/></svg> Criar Texto 3D no Mapa
      </button>
      <button type="button" class="btn ghost small block" id="btnCancelCreate3DText">Cancelar</button>
    </div>

    <div class="insp-section">
      <div class="insp-label" style="display:flex; justify-content:space-between; align-items:center;">
        <span>Tamanho / Zoom do Texto 3D</span>
        <span id="lblDraftScaleVal" style="font-family:monospace; font-weight:bold; color:var(--accent, #f0a630);">${Math.round((draft.scale ?? 1.0) * 100)}%</span>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:11px; color:#888;">20%</span>
        <input type="range" id="lblDraftScaleRange" min="0.2" max="3.0" step="0.1" value="${draft.scale ?? 1.0}" style="flex:1;">
        <span style="font-size:11px; color:#888;">300%</span>
        <button type="button" class="btn small" id="btnLblDraftScaleReset" title="Restaurar 100%">100%</button>
      </div>
    </div>

    <!-- Cor Base -->
    <div class="insp-section">
      <div class="insp-label">Cor Padrão / Base (Formato 0xRRGGBBFF com alfa FF)</div>
      <div style="display:flex; gap:8px; align-items:center;">
        <input type="color" id="lblDraftColorPicker" value="${hex.slice(0, 7)}" style="width:36px; height:32px; border:none; border-radius:4px; cursor:pointer;" title="Escolher cor visual">
        <input type="text" id="lblDraftHexInput" value="${pawnHex}" placeholder="0xFFFFFFFF" style="width:115px; font-family:monospace; font-weight:bold; font-size:12px;">
        <span id="lblDraftColorPreview" style="display:inline-block; width:22px; height:22px; border-radius:4px; background:${hex}; border:1px solid rgba(255,255,255,0.2);"></span>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:6px;">
        ${STANDARD_LABEL_COLORS.slice(0, 8).map(c => `
          <button type="button" class="slot-swatch" data-lbl-draft-color="${labelColorToPawnHex(c.val)}" style="width:20px; height:20px; background:${c.hex}; border-radius:3px; border:1px solid rgba(255,255,255,0.2); cursor:pointer;" title="${c.name} (${labelColorToPawnHex(c.val)})"></button>
        `).join('')}
      </div>
    </div>

    <div class="insp-section">
      <div class="insp-label">Propriedades do Texto 3D</div>
      <div class="pair">
        <label>Distância de Visão<input type="number" step="5" min="1" max="500" id="lblDraftDrawDist" value="${draft.drawDist ?? 50.0}"></label>
        <label>Mundo Virtual<input type="number" step="1" id="lblDraftWorld" value="${draft.world ?? 0}"></label>
      </div>
      <label class="check" style="margin-top:6px;">
        <input type="checkbox" id="lblDraftTestLOS" ${draft.testLOS ? 'checked' : ''}> Testar linha de visão (testLOS: oculta atrás de paredes)
      </label>
    </div>

    <div class="insp-section"><div class="insp-label">Comentário / Anotação (Pawn)</div>
      <input type="text" id="lblDraftComment" placeholder="// Ex: Texto da porta de entrada" value="${esc(draft.comment || '')}" style="width:100%;">
    </div>
  `;
}

function bindLabelCreate(draft) {
  const txt = $('#lblDraftText');
  const countEl = $('#lblDraftCharCount');
  const updateDraftCount = (val) => {
    const len = get3DTextCleanLength(val);
    if (countEl) {
      countEl.textContent = `${len} / 1024`;
      countEl.style.color = len >= 1024 ? '#ef4444' : 'var(--paper-dim)';
    }
  };
  if (txt) {
    txt.addEventListener('keydown', (e) => e.stopPropagation());
    txt.addEventListener('keyup', (e) => e.stopPropagation());
    txt.oninput = () => {
      let val = txt.value;
      if (get3DTextCleanLength(val) > 1024) {
        val = truncate3DTextToLimit(val, 1024);
        txt.value = val;
      }
      updateDraftCount(val);
      draft.text = val;
    };
  }

  const btnBreak = $('#btnLblDraftBreak');
  if (btnBreak && txt) {
    btnBreak.onclick = () => {
      const start = txt.selectionStart || txt.value.length;
      const end = txt.selectionEnd || txt.value.length;
      txt.value = txt.value.substring(0, start) + '\\n' + txt.value.substring(end);
      txt.focus();
      txt.selectionStart = txt.selectionEnd = start + 2;
      txt.dispatchEvent(new Event('input'));
    };
  }

  $$('#inspector [data-lbl-draft-tag]').forEach(b => {
    b.onclick = () => {
      if (!txt) return;
      const tag = b.dataset.lblDraftTag;
      const start = txt.selectionStart || txt.value.length;
      const end = txt.selectionEnd || txt.value.length;
      txt.value = txt.value.substring(0, start) + tag + txt.value.substring(end);
      txt.focus();
      txt.selectionStart = txt.selectionEnd = start + tag.length;
      txt.dispatchEvent(new Event('input'));
    };
  });

  const scaleRange = $('#lblDraftScaleRange');
  const scaleVal = $('#lblDraftScaleVal');
  const btnScaleReset = $('#btnLblDraftScaleReset');
  if (scaleRange) {
    scaleRange.oninput = () => {
      const val = parseFloat(scaleRange.value) || 1.0;
      if (scaleVal) scaleVal.textContent = Math.round(val * 100) + '%';
      draft.scale = val;
    };
  }
  if (btnScaleReset && scaleRange) {
    btnScaleReset.onclick = () => {
      scaleRange.value = '1.0';
      scaleRange.dispatchEvent(new Event('input'));
    };
  }

  const cp = $('#lblDraftColorPicker');
  const hexInp = $('#lblDraftHexInput');
  const preview = $('#lblDraftColorPreview');
  const applyDraftColor = (hex) => {
    const num = hexToLabelColor(hex);
    draft.color = num;
    const colorHex = labelColorToHex(num);
    const pwh = labelColorToPawnHex(num);
    if (cp) cp.value = colorHex.slice(0, 7);
    if (hexInp) hexInp.value = pwh;
    if (preview) preview.style.background = colorHex;
  };

  if (cp) cp.oninput = () => applyDraftColor(cp.value.toUpperCase());
  if (hexInp) hexInp.onchange = () => applyDraftColor(hexInp.value.trim());
  $$('#inspector [data-lbl-draft-color]').forEach(b => {
    b.onclick = () => applyDraftColor(b.dataset.lblDraftColor);
  });

  $('#lblDraftDrawDist')?.addEventListener('change', (e) => { draft.drawDist = parseFloat(e.target.value) || 50.0; });
  $('#lblDraftWorld')?.addEventListener('change', (e) => { draft.world = parseInt(e.target.value, 10) || 0; });
  $('#lblDraftTestLOS')?.addEventListener('change', (e) => { draft.testLOS = e.target.checked ? 1 : 0; });
  $('#lblDraftComment')?.addEventListener('change', (e) => { draft.comment = e.target.value; });

  $('#btnCancelCreate3DText')?.addEventListener('click', () => {
    creatingLabelDraft = null;
    renderInspector();
  });

  $('#btnConfirmCreate3DText')?.addEventListener('click', () => {
    const pt = getCameraLookSurfacePoint(0.5);
    const newLbl = {
      uid: null,
      text: truncate3DTextToLimit(draft.text || 'Novo Texto 3D', 1024),
      color: draft.color || 0x33CCFFFF,
      scale: draft.scale ?? 1.0,
      x: pt.x,
      y: pt.y,
      z: pt.z,
      drawDist: draft.drawDist ?? 50.0,
      world: draft.world ?? 0,
      interior: 0,
      testLOS: draft.testLOS ? 1 : 0,
      comment: draft.comment || '',
    };
    creatingLabelDraft = null;
    if (!app.project.labels) app.project.labels = [];
    const item = app.project.add('labels', newLbl, 'Criar Texto 3D');
    app.editor.syncAll();
    app.editor.select([item.uid]);
    toast('Texto 3D criado no mapa!', 'ok');
  });
}

// ===========================================================================
// Pickups
// ===========================================================================
function pickupInspector(p) {
  const label = getPickupLabel(p.model);
  const categories = [...new Set(PREDEFINED_PICKUPS.map(x => x.category))];
  return `
    ${titleBlock(p.model, `Pickup <span class="tag">ID ${p.model}</span>`)}
    <button type="button" class="btn danger block" data-act="del" style="margin: 8px 0 10px;"><svg><use href="#i-trash"/></svg>Apagar Pickup</button>
    ${scopeSection()}

    <div class="insp-section">
      <div class="insp-label">Modelo do Pickup (${esc(label)})</div>
      <select id="pkModelSelect" style="width:100%; margin-bottom:6px;">
        <option value="">-- Escolha um pickup pré-definido --</option>
        ${categories.map(cat => `
          <optgroup label="${esc(cat)}">
            ${PREDEFINED_PICKUPS.filter(x => x.category === cat).map(x => `
              <option value="${x.model}" ${x.model === p.model ? 'selected' : ''}>${x.model} - ${esc(x.name)}</option>
            `).join('')}
          </optgroup>
        `).join('')}
      </select>
      <label>Ou digite o ID do modelo:<input type="number" step="1" min="1" id="pkModelInput" value="${p.model}"></label>
    </div>

    <div class="insp-section">
      <div class="insp-label">Tipo de Pickup (Comportamento ao pegar)</div>
      <select id="pkTypeSelect" style="width:100%;">
        ${PICKUP_TYPES.map(t => `<option value="${t.type}" ${t.type === p.type ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}
      </select>
    </div>

    <div class="insp-section"><div class="insp-label">Posição</div>${vecInputs('', ['x', 'y', 'z'], [p.x, p.y, p.z], 0.1)}</div>
    ${speedSection()}
    ${actionGrid()}

    <div class="insp-section">
      <div class="pair">
        <label>Mundo Virtual<input type="number" step="1" data-field="world" value="${p.world ?? 0}"></label>
      </div>
    </div>

    <div class="insp-section"><div class="insp-label">Comentário / Anotação (Pawn)</div>
      <input type="text" data-field-str="comment" placeholder="// Ex: Colete do spawn" value="${esc(p.comment || '')}" style="width:100%;">
    </div>

    <div class="insp-section">
      <details class="pawn-preview"><summary>Código Pawn deste Pickup</summary>
        <pre class="code small" id="pkCode"></pre>
        <button type="button" class="btn small" id="btnPkCopy"><svg><use href="#i-copy"/></svg>Copiar Pawn</button>
      </details>
    </div>
  `;
}

function bindPickup(p) {
  bindCommon();
  bindSpeedControls();
  bindStringFields(p.uid);
  const uid = p.uid, project = app.editor.findProjectOf(uid) || app.project;
  bindVecArrows(uid, project);

  const sel = $('#pkModelSelect');
  const inp = $('#pkModelInput');
  const updateModel = (mId) => {
    project.updateItems('Alterar Modelo Pickup', [uid], (o) => { o.model = mId; });
    app.editor.syncAll();
    renderInspector();
  };
  if (sel) {
    sel.onchange = () => {
      const val = parseInt(sel.value, 10);
      if (val > 0) updateModel(val);
    };
  }
  if (inp) {
    inp.onchange = () => {
      const val = parseInt(inp.value, 10);
      if (val > 0) updateModel(val);
    };
  }

  const typeSel = $('#pkTypeSelect');
  if (typeSel) {
    typeSel.onchange = () => {
      const val = parseInt(typeSel.value, 10);
      project.updateItems('Alterar Tipo Pickup', [uid], (o) => { o.type = val; });
      updatePickupCode(project.find(uid));
    };
  }

  $$('#inspector [data-field]').forEach(inEl => {
    inEl.addEventListener('change', () => {
      const field = inEl.dataset.field;
      let val = parseFloat(inEl.value);
      if (!Number.isFinite(val)) { inEl.value = fmt(project.find(uid)?.[field]); return; }
      if (['world'].includes(field)) val = Math.trunc(val);
      project.updateItems('Editar ' + field, [uid], (o) => { o[field] = val; });
      app.editor.syncAll();
      updatePickupCode(project.find(uid));
    });
  });

  updatePickupCode(p);
  const copyBtn = $('#btnPkCopy');
  if (copyBtn) {
    copyBtn.onclick = () => {
      const code = $('#pkCode')?.textContent;
      if (code) { copyText(code); toast('Código Pawn do Pickup copiado!'); }
    };
  }
}

function updatePickupCode(p) {
  const codeEl = $('#pkCode');
  if (!codeEl || !p) return;
  codeEl.textContent = `CreatePickup(${p.model}, ${p.type}, ${p.x.toFixed(4)}, ${p.y.toFixed(4)}, ${p.z.toFixed(4)}, ${p.world ?? 0});`;
}

// ===========================================================================
// GangZones
// ===========================================================================
function gangZoneInspector(gz) {
  const { hex, alpha } = gzColorToHexAndAlpha(gz.color);
  return `
    <div class="insp-title">
      <div style="width:48px; height:48px; background:rgba(51,170,51,0.2); border:2px solid ${hex}; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:18px; font-weight:bold;">GZ</div>
      <div>
        <div style="font-weight:bold; font-size:14px;">${esc(gz.name || 'GangZone')}</div>
        <span class="tag">GangZoneCreate</span>
      </div>
    </div>
    <button type="button" class="btn danger block" data-act="del" style="margin: 8px 0 10px;"><svg><use href="#i-trash"/></svg>Apagar GangZone</button>

    <div class="insp-section">
      <div class="insp-label">Identificador / Nome (Pawn)</div>
      <input type="text" id="gzName" value="${esc(gz.name || 'GangZone')}" placeholder="gGroveStreetZone" style="width:100%;">
    </div>

    <div class="insp-section">
      <div class="insp-label">Coordenadas da Área Retangular</div>
      <div class="pair">
        <label>Min X<input type="number" step="1" id="gzMinX" value="${fmt(gz.minx, 2)}"></label>
        <label>Min Y<input type="number" step="1" id="gzMinY" value="${fmt(gz.miny, 2)}"></label>
      </div>
      <div class="pair" style="margin-top:4px;">
        <label>Max X<input type="number" step="1" id="gzMaxX" value="${fmt(gz.maxx, 2)}"></label>
        <label>Max Y<input type="number" step="1" id="gzMaxY" value="${fmt(gz.maxy, 2)}"></label>
      </div>
      <button type="button" class="btn primary small block" id="btnOpenGzMap" style="margin-top:8px;"><svg><use href="#i-pin"/></svg>Editar no Mapa</button>
    </div>

    <div class="insp-section">
      <div class="insp-label">Cor da GangZone e Transparência</div>
      <div style="display:flex; gap:8px; align-items:center;">
        <input type="color" id="gzColorPicker" value="${hex}" style="width:36px; height:32px; border:none; border-radius:4px; cursor:pointer;">
        <input type="text" id="gzHexInput" value="${hex}" style="width:85px; font-family:monospace; font-weight:bold;">
        <div style="flex:1;">
          <label style="font-size:11px;">Opacidade: <span id="gzAlphaLbl">${Math.round(alpha * 100)}%</span>
            <input type="range" id="gzAlphaSlider" min="0.05" max="1.0" step="0.05" value="${alpha}">
          </label>
        </div>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:8px;">
        ${DEFAULT_GANGZONE_COLORS.map(c => `
          <button type="button" class="btn small" data-gz-color="${c.val}" style="font-size:10px; padding:2px 6px; border-left:3px solid ${c.hex};" title="${c.name}">${c.name.split(' ')[0]}</button>
        `).join('')}
      </div>
    </div>

    <div class="insp-section">
      <details class="pawn-preview"><summary>Código Pawn desta GangZone</summary>
        <pre class="code small" id="gzCode"></pre>
        <button type="button" class="btn small" id="btnGzCopy"><svg><use href="#i-copy"/></svg>Copiar Pawn</button>
      </details>
    </div>
  `;
}

function bindGangZone(gz) {
  bindCommon();
  const uid = gz.uid, project = app.editor.findProjectOf(uid) || app.project;

  const nameInp = $('#gzName');
  if (nameInp) {
    nameInp.onchange = () => {
      project.updateItems('Renomear GangZone', [uid], (o) => { o.name = nameInp.value; });
      updateGangZoneCode(project.find(uid));
    };
  }

  const cp = $('#gzColorPicker');
  const hexInp = $('#gzHexInput');
  const alphaSlider = $('#gzAlphaSlider');
  const alphaLbl = $('#gzAlphaLbl');

  const applyGzColor = (hex, a) => {
    if (cp) cp.value = hex.slice(0, 7);
    if (hexInp) hexInp.value = hex;
    if (alphaSlider) alphaSlider.value = a;
    if (alphaLbl) alphaLbl.textContent = `${Math.round(a * 100)}%`;
    const num = hexAndAlphaToGzColor(hex, a);
    project.updateItems('Alterar Cor GangZone', [uid], (o) => { o.color = num; });
    app.editor.syncAll();
    updateGangZoneCode(project.find(uid));
  };

  if (cp) cp.oninput = () => applyGzColor(cp.value.toUpperCase(), parseFloat(alphaSlider?.value || 0.5));
  if (hexInp) {
    hexInp.onchange = () => {
      let h = hexInp.value.trim();
      if (!h.startsWith('#')) h = '#' + h;
      applyGzColor(h.toUpperCase(), parseFloat(alphaSlider?.value || 0.5));
    };
  }
  if (alphaSlider) {
    alphaSlider.oninput = () => {
      applyGzColor(hexInp?.value || '#FF0000', parseFloat(alphaSlider.value));
    };
  }
  $$('#inspector [data-gz-color]').forEach(b => {
    b.onclick = () => {
      const val = parseInt(b.dataset.gzColor, 10);
      const { hex, alpha } = gzColorToHexAndAlpha(val);
      applyGzColor(hex, alpha);
    };
  });

  const coordIds = ['gzMinX', 'gzMinY', 'gzMaxX', 'gzMaxY'];
  const coordFields = ['minx', 'miny', 'maxx', 'maxy'];
  coordIds.forEach((id, i) => {
    const el = $('#' + id);
    if (el) {
      el.onchange = () => {
        const val = parseFloat(el.value);
        if (Number.isFinite(val)) {
          project.updateItems('Alterar Coordenada GangZone', [uid], (o) => { o[coordFields[i]] = val; });
          app.editor.syncAll();
          updateGangZoneCode(project.find(uid));
        }
      };
    }
  });

  const btnMap = $('#btnOpenGzMap');
  if (btnMap) {
    btnMap.onclick = () => {
      $('#btnGangZones')?.click();
    };
  }

  updateGangZoneCode(gz);
  const copyBtn = $('#btnGzCopy');
  if (copyBtn) {
    copyBtn.onclick = () => {
      const code = $('#gzCode')?.textContent;
      if (code) { copyText(code); toast('Código Pawn da GangZone copiado!'); }
    };
  }
}

function updateGangZoneCode(gz) {
  const codeEl = $('#gzCode');
  if (!codeEl || !gz) return;
  const hex = '0x' + (Number(gz.color) >>> 0).toString(16).toUpperCase().padStart(8, '0');
  const varName = (gz.name || 'gGangZone').replace(/[^a-zA-Z0-9_]/g, '');
  codeEl.textContent = `new ${varName} = GangZoneCreate(${gz.minx.toFixed(2)}, ${gz.miny.toFixed(2)}, ${gz.maxx.toFixed(2)}, ${gz.maxy.toFixed(2)});\nGangZoneShowForAll(${varName}, ${hex});`;
}
