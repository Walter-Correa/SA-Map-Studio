// Auto Criar: the editor builds a map by itself, in front of the camera: interiors and houses (rooms with walls, floors, doorways and furniture), mazes and
// round or square maps. The settings are chosen here; a seed makes the result repeatable, and Create again makes another one.
import * as THREE from 'three';
import { app, $, esc, toast } from './common.js';
import { t } from './i18n.js';
import { generateInterior, ROOM_TYPES, WALL_STYLES } from '../editor/autoInterior.js';
import { generateHouse } from '../editor/autoHouse.js';
import { generateMaze, generateMap, MAX_MAZE, MAX_LEVELS } from '../editor/autoStructures.js';

const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const KINDS = [['interior', 'Interior'], ['maze', 'Labirinto'], ['round', 'Mapa circular'], ['square', 'Mapa quadrado']];
const LABELS = { interior: 'Auto Criar: interior', maze: 'Auto Criar: labirinto', round: 'Auto Criar: mapa', square: 'Auto Criar: mapa' };
const MAX_FLOORS = 10, MAX_MAP = 500, MAX_ROOMS = 10, ROOM_MIN = 3, ROOM_MAX = 10;

let dlg = null;
let last = null;          // { uids, seq } of the last thing that was created
let busy = false;

const randomSeed = () => Math.floor(Math.random() * 1e9);

function build() {
  dlg = document.createElement('dialog');
  dlg.id = 'dlgAutoCreate';
  dlg.className = 'dialog';
  dlg.style.cssText = 'max-width: 560px; width: 94vw; border-radius: 12px; background: #1a1e24; border: 1px solid rgba(255,255,255,0.14); box-shadow: 0 24px 60px rgba(0,0,0,0.65); padding: 0; overflow: hidden; position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%); margin: 0;';
  // the rooms of a floor: one row for each room (its kind and its size in meters, 3 to 10)
  const roomRow = (type) => `<div data-roomrow style="display:grid; grid-template-columns: minmax(0, 1fr) 90px 28px; gap:8px; align-items:center;">
              <select data-roomtype style="width:100%; min-width:0">${Object.entries(ROOM_TYPES).map(([k, v]) => `<option value="${k}"${k === type ? ' selected' : ''}>${esc(t(v.title))}</option>`).join('')}</select>
              <input type="number" data-roomsize min="${ROOM_MIN}" max="${ROOM_MAX}" step="0.5" value="${ROOM_MIN}" title="${esc(t('Tamanho (m)'))}" style="width:100%; min-width:0">
              <button type="button" class="btn icon" data-roomdel title="${esc(t('Remover cômodo'))}" aria-label="${esc(t('Remover cômodo'))}" style="width:28px; height:28px;"><svg><use href="#i-x"/></svg></button></div>`;
  const floorDefaults = (f) => (f === 0 ? ['sala', 'quarto', 'cozinha', 'banheiro'] : (f % 2 ? ['quarto', 'quarto', 'banheiro'] : ['quarto', 'escritorio']));
  const roomList = (f) => `<div style="display:grid; grid-template-columns: minmax(0, 1fr) 90px 28px; gap:8px; font-size:11.5px; color:#aab2c0;"><span>${esc(t('Cômodo'))}</span><span>${esc(t('Tamanho (m)'))}</span><span></span></div>
            <div data-roomlist="${f}" style="display:flex; flex-direction:column; gap:6px;">${floorDefaults(f).map(roomRow).join('')}</div>
            <button type="button" class="btn" data-roomadd="${f}" style="align-self:flex-start;">${esc(t('Adicionar cômodo'))}</button>`;
  const corridorBox = (id, f) => `<label class="check" title="${esc(t('Um corredor de 3,21 m separa os cômodos e leva a todos eles.'))}"><input type="checkbox" ${id ? `id="${id}"` : `data-floorcorridor="${f}"`} checked> ${esc(t('Com corredor'))}</label>`;
  const styleRow = (attrs) => `<div style="display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap:8px;">
              <label class="field" style="margin:0; min-width:0">${esc(t('Paredes'))}<select style="width:100%; min-width:0" ${attrs.wall}>${styleOpts}</select></label>
              <label class="field" style="margin:0; min-width:0">${esc(t('Piso'))}<select style="width:100%; min-width:0" ${attrs.floor}>${styleOpts}</select></label>
              <label class="field" style="margin:0; min-width:0">${esc(t('Estilo do teto'))}<select style="width:100%; min-width:0" ${attrs.ceil}>${styleOpts}</select></label></div>`;
  const styleList = (sel) => WALL_STYLES.map(([, name], i) => `<option value="${i}"${i === sel ? ' selected' : ''}>${esc(t(name))}</option>`).join('');
  const styleOpts = `<option value="-1">${esc(t('Automático (por cômodo)'))}</option>` + WALL_STYLES.map(([, name], i) => `<option value="${i}">${esc(t(name))}</option>`).join('');
  dlg.innerHTML = `
    <form method="dialog" style="display:flex; flex-direction:column; margin:0;">
      <header class="dialog-head" style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.08); background: #15181d; display:flex; align-items:center; justify-content:space-between;">
        <h2 style="margin:0; font-size:14px; font-weight:700; color:#fff;">${esc(t('Auto Criar'))}</h2>
        <button class="btn icon" type="button" id="acClose" aria-label="Fechar" style="width:28px; height:28px;"><svg><use href="#i-x"/></svg></button>
      </header>
      <div style="padding: 14px 18px; display:flex; flex-direction:column; gap:12px; max-height: 72vh; overflow-y:auto; overflow-x:hidden;">
        <p style="margin:0; font-size:12.5px; color:#aab2c0; line-height:1.45;">${esc(t('O editor monta o mapa sozinho, na frente da câmera, no que ela estiver apontando. Escolha o tipo e as opções; a mesma semente dá o mesmo resultado.'))}</p>
        <label class="field">${esc(t('O que criar'))}<select id="acKind">${KINDS.map(([v, n]) => `<option value="${v}">${esc(t(n))}</option>`).join('')}</select></label>

        <div id="acInterior" style="display:none; flex-direction:column; gap:10px;">
          <label class="field">${esc(t('Andares'))}<input type="number" id="acFloors" min="1" max="${MAX_FLOORS}" step="1" value="1"></label>
          <div style="font-size:12px; color:#aab2c0;">${esc(t('Andar {0}: cômodos', 1))}</div>
          ${roomList(0)}
          ${corridorBox('acCorridor')}
          ${styleRow({ wall: 'id="acWall"', floor: 'id="acFloor"', ceil: 'id="acCeilStyle"' })}
          ${Array.from({ length: MAX_FLOORS - 1 }, (_, i) => i + 1).map(f => `<div data-floorbox="${f}" style="display:none; flex-direction:column; gap:8px; border-top:1px solid rgba(255,255,255,0.08); padding-top:8px;">
            <div style="font-size:12px; color:#aab2c0;">${esc(t('Andar {0}: cômodos', f + 1))}</div>
            ${roomList(f)}
            ${corridorBox('', f)}
            ${styleRow({ wall: `data-floorwall="${f}"`, floor: `data-floorfloor="${f}"`, ceil: `data-floorceil="${f}"` })}
          </div>`).join('')}
          <label class="field">${esc(t('Padrão visual'))}<select id="acPattern"><option value="0">${esc(t('Misturado'))}</option><option value="1" selected>${esc(t('Mesmo tema (paredes, piso e teto)'))}</option></select></label>
          <label class="field">${esc(t('Móveis'))}<select id="acFurn"><option value="0">${esc(t('Nenhum'))}</option><option value="1" selected>${esc(t('Poucos'))}</option><option value="2">${esc(t('Bastante'))}</option></select></label>
          <label class="check"><input type="checkbox" id="acCeiling" checked> ${esc(t('Com teto'))}</label>
          <label class="check"><input type="checkbox" id="acEntrance" checked> ${esc(t('Porta de entrada'))}</label>
        </div>

        <div id="acMaze" style="display:none; flex-direction:column; gap:10px;">
          <div class="pair">
            <label class="field">${esc(t('Células de largura'))}<input type="number" id="acMzCols" min="3" max="${MAX_MAZE}" step="1" value="8"></label>
            <label class="field">${esc(t('Células de profundidade'))}<input type="number" id="acMzRows" min="3" max="${MAX_MAZE}" step="1" value="8"></label>
          </div>
          <div style="font-size:11.5px; color:#aab2c0;">${esc(t('Cada célula é um quadrado de 3,21 m (o tamanho de uma parede). 20 x 20 células fazem um labirinto de 64 m x 64 m.'))}</div>
          <label class="field-row slider">${esc(t('Atalhos extras (%)'))} <input type="range" id="acMzShort" min="0" max="100" step="5" value="10"><output id="acMzShortOut">10</output></label>
          <div class="pair">
            <label class="field">${esc(t('Altura das paredes (camadas)'))}<input type="number" id="acMzLevels" min="1" max="${MAX_LEVELS}" step="1" value="1"></label>
            <label class="field">${esc(t('Paredes'))}<select id="acMzWall">${styleList(18)}</select></label>
          </div>
          <label class="field">${esc(t('Piso'))}<select id="acMzFloor"><option value="-1">${esc(t('Sem piso'))}</option>${styleList(17)}</select></label>
          <label class="check"><input type="checkbox" id="acMzCeiling"> ${esc(t('Com teto'))}</label>
        </div>

        <div id="acMap" style="display:none; flex-direction:column; gap:10px;">
          <div class="pair">
            <label class="field"><span id="acMapSizeLbl">${esc(t('Diâmetro (m)'))}</span><input type="number" id="acMapSize" min="10" max="${MAX_MAP}" step="1" value="60"></label>
            <label class="field">${esc(t('Altura das paredes (camadas)'))}<input type="number" id="acMapLevels" min="1" max="${MAX_LEVELS}" step="1" value="2"></label>
          </div>
          <div class="pair">
            <label class="field">${esc(t('Paredes'))}<select id="acMapWall">${styleList(18)}</select></label>
            <label class="field">${esc(t('Piso'))}<select id="acMapFloor">${styleList(17)}</select></label>
          </div>
          <label class="check"><input type="checkbox" id="acMapGround" checked> ${esc(t('Com chão'))}</label>
          <label class="check"><input type="checkbox" id="acMapCeiling"> ${esc(t('Com teto'))}</label>
        </div>

        <div class="pair">
          <label class="field">${esc(t('Mundo virtual'))}<input type="number" id="acWorld" min="-1" max="2147483647" step="1" value="-1"></label>
          <label class="field">${esc(t('Interior'))}<input type="number" id="acInt" min="-1" max="255" step="1" value="-1"></label>
        </div>

        <div class="pair" style="align-items:end;">
          <label class="field">${esc(t('Semente'))}<input type="number" id="acSeed" min="1" max="999999999" step="1" value="${randomSeed()}"></label>
          <button type="button" class="btn" id="acDice" style="height:34px;">${esc(t('Outra semente'))}</button>
        </div>
        <div id="acInfo" style="font-size:12.5px; color:#cdd5e0; min-height:18px;"></div>
      </div>
      <footer style="display:flex; gap:8px; justify-content:flex-end; padding: 12px 18px; border-top: 1px solid rgba(255,255,255,0.08); background:#15181d;">
        <button type="button" class="btn" id="acAgain" title="${esc(t('Desfaz o que foi criado agora e cria outro, com outra semente'))}">${esc(t('Criar de novo'))}</button>
        <button type="button" class="btn primary" id="acCreate">${esc(t('Criar'))}</button>
      </footer>
    </form>`;
  document.body.appendChild(dlg);
  const syncKind = () => {
    const k = $('#acKind', dlg).value;
    for (const [id, on] of [['acInterior', k === 'interior'], ['acMaze', k === 'maze'], ['acMap', k === 'round' || k === 'square']]) $('#' + id, dlg).style.display = on ? 'flex' : 'none';
    $('#acMapSizeLbl', dlg).textContent = k === 'round' ? t('Diâmetro (m)') : t('Lado (m)');
  };
  const syncFloors = () => {
    const n = Math.max(1, Math.min(MAX_FLOORS, +$('#acFloors', dlg).value || 1));
    dlg.querySelectorAll('[data-floorbox]').forEach(b => { b.style.display = +b.dataset.floorbox < n ? 'flex' : 'none'; });
  };
  const syncRooms = (list) => {
    const rows = list.querySelectorAll('[data-roomrow]');
    list.querySelectorAll('[data-roomdel]').forEach(b => { b.disabled = rows.length <= 1; });
    dlg.querySelector(`[data-roomadd="${list.dataset.roomlist}"]`).disabled = rows.length >= MAX_ROOMS;
  };
  dlg.addEventListener('click', (e) => {
    const add = e.target.closest('[data-roomadd]'), del = e.target.closest('[data-roomdel]');
    if (add) {
      const list = dlg.querySelector(`[data-roomlist="${add.dataset.roomadd}"]`);
      if (list.children.length < MAX_ROOMS) { list.insertAdjacentHTML('beforeend', roomRow('quarto')); syncRooms(list); }
    } else if (del) {
      const list = del.closest('[data-roomlist]');
      if (list.children.length > 1) { del.closest('[data-roomrow]').remove(); syncRooms(list); }
    }
  });
  dlg.querySelectorAll('[data-roomlist]').forEach(syncRooms);
  $('#acFloors', dlg).oninput = syncFloors;
  $('#acKind', dlg).onchange = syncKind;
  $('#acMzShort', dlg).oninput = (e) => { $('#acMzShortOut', dlg).textContent = e.target.value; };
  $('#acDice', dlg).onclick = () => { $('#acSeed', dlg).value = randomSeed(); };
  $('#acClose', dlg).onclick = () => dlg.close();
  $('#acCreate', dlg).onclick = () => create(false);
  $('#acAgain', dlg).onclick = () => create(true);
  syncKind();
}

// Where the thing is built: some meters in front of the camera, on its line of sight (not below it, not above it), turned the way the camera looks on the
// ground plane. z is the height of the point on the line of sight.
function frame(distance) {
  const cam = app.vp.camera;
  const dir = new THREE.Vector3();
  cam.getWorldDirection(dir);
  const h = Math.hypot(dir.x, dir.y) || 1;
  const yaw = Math.atan2(dir.y, dir.x) * R2D;
  return { x: cam.position.x + dir.x * distance, y: cam.position.y + dir.y * distance, z: cam.position.z + dir.z * distance, yaw };
}

// The virtual world and the interior that all the objects get (-1: all of them, as the exported objects with dynamic streaming need)
const acNumber = (sel) => { const v = Math.floor(+$(sel, dlg).value); return Number.isFinite(v) && v >= -1 ? v : -1; };

// A number read from a field and held inside its limits; when it had to be held, the notice says so (nothing is cut without telling)
function limited(sel, lo, hi, name, notes) {
  const raw = Math.floor(+$(sel, dlg).value);
  const v = Math.max(lo, Math.min(hi, Number.isFinite(raw) ? raw : lo));
  if (Number.isFinite(raw) && raw !== v) notes.push(t('{0}: o limite é {1}, usei {2}.', name, raw > hi ? hi : lo, v));
  $(sel, dlg).value = v;
  return v;
}

async function create(again) {
  if (busy) return;
  busy = true;
  const info = $('#acInfo', dlg);
  const go = $('#acCreate', dlg), ag = $('#acAgain', dlg);
  go.disabled = ag.disabled = true;
  info.textContent = t('Criando…');
  try {
    const project = app.project;
    // "Create again": what was created before is undone (only when it is still the last thing done)
    if (again && last) {
      const top = project.undoStack[project.undoStack.length - 1];
      if (top && top._seq === last.seq) project.undo();
      last = null;
      $('#acSeed', dlg).value = randomSeed();
    }
    const kind = $('#acKind', dlg).value;
    const seed = Math.max(1, Math.floor(+$('#acSeed', dlg).value) || randomSeed());
    let result;
    const notes = [];
    if (kind === 'interior') {
      const f = frame(12);
      const floorZ = f.z;
      // the rooms of a floor: { type, size (m) }; a size outside the limits is held and the notice says so
      const readRooms = (n) => [...dlg.querySelectorAll(`[data-roomlist="${n}"] [data-roomrow]`)].map((row, i) => {
        const inp = row.querySelector('[data-roomsize]');
        const raw = +inp.value, size = Math.max(ROOM_MIN, Math.min(ROOM_MAX, Number.isFinite(raw) && inp.value !== '' ? raw : ROOM_MIN));
        if (Number.isFinite(raw) && inp.value !== '' && raw !== size) notes.push(t('Tamanho do cômodo {0} do andar {1}: o limite é {2}, usei {3}.', i + 1, n + 1, raw > ROOM_MAX ? ROOM_MAX : ROOM_MIN, size));
        inp.value = size;
        return { type: row.querySelector('[data-roomtype]').value, size };
      });
      const rooms = readRooms(0);
      const nFloors = limited('#acFloors', 1, MAX_FLOORS, t('Andares'), notes);
      $('#acFloors', dlg).dispatchEvent(new Event('input'));
      const common = {
        wallStyle: +$('#acWall', dlg).value, floorStyle: +$('#acFloor', dlg).value, ceilingStyle: +$('#acCeilStyle', dlg).value, ceiling: $('#acCeiling', dlg).checked, corridor: $('#acCorridor', dlg).checked,
        entrance: $('#acEntrance', dlg).checked, furniture: +$('#acFurn', dlg).value, pattern: +$('#acPattern', dlg).value, seed,
      };
      const ienv = { models: app.models, gd: app.gd, origin: { x: f.x, y: f.y, z: floorZ, yaw: f.yaw } };
      if (nFloors > 1) {
        const floors = [{ rooms, wallStyle: common.wallStyle, floorStyle: common.floorStyle, ceilingStyle: common.ceilingStyle, corridor: common.corridor }];
        for (let n = 1; n < nFloors; n++) {
          const list = readRooms(n);
          const pick = (a) => { const e = dlg.querySelector(`[data-${a}="${n}"]`); return e ? +e.value : -1; };
          const cb = dlg.querySelector(`[data-floorcorridor="${n}"]`);
          floors.push({ rooms: list, wallStyle: pick('floorwall'), floorStyle: pick('floorfloor'), ceilingStyle: pick('floorceil'), corridor: cb ? cb.checked : true });
        }
        result = await generateHouse({ ...common, floors }, ienv);
      } else result = await generateInterior({ rooms, ...common }, ienv);
    } else if (kind === 'maze') {
      const f = frame(8);
      const env = { models: app.models, gd: app.gd, origin: { x: f.x, y: f.y, z: f.z, yaw: f.yaw }, ground: (x, y) => app.editor.groundHeight(x, y) };
      result = await generateMaze({ cols: limited('#acMzCols', 3, MAX_MAZE, t('Células de largura'), notes), rows: limited('#acMzRows', 3, MAX_MAZE, t('Células de profundidade'), notes),
        levels: limited('#acMzLevels', 1, MAX_LEVELS, t('Altura das paredes (camadas)'), notes), shortcuts: +$('#acMzShort', dlg).value,
        wallStyle: +$('#acMzWall', dlg).value, floorStyle: +$('#acMzFloor', dlg).value, ceiling: $('#acMzCeiling', dlg).checked, seed }, env);
    } else {
      const f = frame(Math.max(20, (+$('#acMapSize', dlg).value || 60) * 0.8));
      const env = { models: app.models, gd: app.gd, origin: { x: f.x, y: f.y, z: f.z, yaw: f.yaw }, ground: (x, y) => app.editor.groundHeight(x, y) };
      result = await generateMap({ shape: kind, size: limited('#acMapSize', 10, MAX_MAP, kind === 'round' ? t('Diâmetro (m)') : t('Lado (m)'), notes),
        levels: limited('#acMapLevels', 1, MAX_LEVELS, t('Altura das paredes (camadas)'), notes), wallStyle: +$('#acMapWall', dlg).value, floorStyle: +$('#acMapFloor', dlg).value,
        floor: $('#acMapGround', dlg).checked, ceiling: $('#acMapCeiling', dlg).checked, seed }, env);
    }
    if (result.dropped) notes.push(t('{0} cômodo(s) não couberam no contorno e ficaram de fora.', result.dropped));
    if (!result.items.length) {
      const why = result.notes.includes('sem-samp') ? t('Faltam as peças do SA-MP (SAMP.img e SAMP.ide na pasta do GTA): elas são o que monta este mapa.') : t('Não consegui montar nada com essas opções.');
      info.textContent = why;
      return;
    }
    const label = LABELS[kind];
    const data = result.items.map(it => ({ kind: 'objects', ...it, world: acNumber('#acWorld'), interior: acNumber('#acInt') }));
    const uids = project.addItems(label, data);
    last = { uids, seq: project.undoStack[project.undoStack.length - 1]?._seq };
    app.editor.select(uids);
    app.editor.focusGizmo?.();
    info.textContent = (kind === 'interior'
      ? t('Criado: {0} peças, {1} cômodos, {2} móveis.', result.made, result.rooms, result.furniture)
      : (result.made < result.wanted ? t('Criado: {0} peças (não coube mais: o resto ficaria dentro de outra peça).', result.made) : t('Criado: {0} peças.', result.made))) + (notes.length ? ' ' + notes.join(' ') : '');
    if (notes.length) toast(notes.join(' '), 'warn', 6000);
    toast(t('Auto Criar: {0} peças criadas', result.items.length), 'ok', 3500);
    dlg.close();      // done: the window closes (the info line stays for the next time it is opened)
  } catch (err) {
    console.error(err);
    info.textContent = t('Não deu certo: {0}', String(err.message || err));
  } finally {
    go.disabled = ag.disabled = false;
    busy = false;
  }
}

export function openAutoCreate() {
  if (!dlg) build();
  $('#acInfo', dlg).textContent = '';
  if (!dlg.open) dlg.showModal();       // modal like the other editors: the rest of the editor waits
}

export function initAutoCreate() {
  const btn = $('#btnAutoCreate');
  if (btn) btn.onclick = () => openAutoCreate();
}
