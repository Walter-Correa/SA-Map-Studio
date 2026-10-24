// Singleplayer doors (enex): each one has an outside marker and an inside marker, joined by the same name.
// Entering one puts the player at the other's "exit point", which is a little in front of that marker.
import * as THREE from 'three';
import { app, $, esc, toast, showConfirm } from './common.js';
import { makeDoor, newDoorName } from '../editor/project.js';
import { INTERIOR_PLACES } from '../editor/places.js';
import { showDoorMarkers } from '../world/doors.js';

let current = null; // uid of the door being edited in the dialog
let adjust = null;  // { uid, side, fromDialog }: the marker that is being moved with the gizmo
let gizmoMode = 'translate';

const doors = () => app.project.doors || (app.project.doors = []);
const find = (uid) => doors().find(d => d.uid === uid);
const heading = (dir) => ((Math.atan2(-dir.x, dir.y) * 180 / Math.PI) % 360 + 360) % 360;
const r1 = (v) => Math.round(v * 100) / 100;

export function refreshDoorMarkers() {
  if (app.vp) showDoorMarkers(app.vp.scene, app.project?.mode === 'sp' ? doors() : []);
}

function changed() {
  app.project.touch('doors');
  refreshDoorMarkers();
}

// The point on the surface in the middle of the screen (or 8 m ahead) and which way the camera looks
function cameraSpot() {
  const cam = app.vp.camera;
  const dir = new THREE.Vector3(); cam.getWorldDirection(dir);
  const rc = new THREE.Raycaster();
  rc.setFromCamera(new THREE.Vector2(0, 0), cam);
  rc.far = 400;
  const hit = rc.intersectObjects(app.editor.pickTargets(), true).find(h => !h.object.userData.noPick);
  const p = hit ? hit.point : cam.position.clone().addScaledVector(dir, 8);
  return { x: r1(p.x), y: r1(p.y), z: r1(p.z), rot: r1(heading(dir)) };
}

// The camera usually looks at the door from outside, but the player comes out of it facing the camera (the other way)
const awayFrom = (rot) => r1((rot + 180) % 360);

function lookAtPoint(x, y, z) {
  app.vp.camera.position.set(x, y - 9, z + 5);
  app.vp.fly.lookAt(new THREE.Vector3(x, y, z + 1));
  app.emit('view-interiors', z > 500);
}

// Fields are named like "name" or "out.x" (a side and its coordinate)
const getField = (d, f) => f.split('.').reduce((o, k) => o[k], d);
function setField(d, f, v) {
  const path = f.split('.');
  const last = path.pop();
  path.reduce((o, k) => o[k], d)[last] = v;
}

function numInput(f, label, d, step = 0.1) {
  return `<label class="door-num"><span>${label}</span><input type="number" step="${step}" data-f="${f}" value="${getField(d, f)}"></label>`;
}

function renderList() {
  const ul = $('#doorList');
  ul.innerHTML = doors().length ? doors().map(d => `<li><button type="button" class="door-item${d.uid === current ? ' active' : ''}" data-uid="${d.uid}">
      <b>${esc(d.name)}</b><small>${r1(d.out.x)}, ${r1(d.out.y)} → ${d.interior}</small></button></li>`).join('')
    : '<li class="ol-empty">Nenhuma entrada criada ainda.</li>';
}

function renderForm() {
  const form = $('#doorForm');
  const d = find(current);
  if (!d) { form.innerHTML = '<p class="insp-note">Crie uma entrada ou escolha uma da lista.</p>'; return; }
  const sideButtons = (side) => `<button type="button" class="btn small" data-adjust="${side}">Ajustar no mapa</button><button type="button" class="btn small" data-cam="${side}">Usar a câmera</button><button type="button" class="btn small" data-go="${side}">Ir para lá</button>`;
  form.innerHTML = `
    <label class="field">Nome (até 8 letras ou números)<input type="text" data-f="name" maxlength="8" spellcheck="false" value="${esc(d.name)}"></label>
    <fieldset class="door-side"><legend>Lado de fora (marcador amarelo)</legend>
      <div class="door-row">${numInput('out.x', 'X', d)}${numInput('out.y', 'Y', d)}${numInput('out.z', 'Z', d)}${numInput('out.rot', 'Ângulo', d, 1)}</div>
      <div class="door-row">${sideButtons('out')}</div>
    </fieldset>
    <fieldset class="door-side"><legend>Lado de dentro (marcador azul)</legend>
      <div class="door-row">${numInput('in.x', 'X', d)}${numInput('in.y', 'Y', d)}${numInput('in.z', 'Z', d)}${numInput('in.rot', 'Ângulo', d, 1)}${numInput('interior', 'Interior', d, 1)}</div>
      <div class="door-row">${sideButtons('in')}
        <select data-pick aria-label="Interior do jogo"><option value="">Copiar de um interior do jogo…</option>${INTERIOR_PLACES.map((p, i) => `<option value="${i}">${esc(p.name)} (${p.interior})</option>`).join('')}</select></div>
    </fieldset>
    <p class="insp-note">A seta mostra onde o jogador aparece e para onde olha ao passar por esta porta. Ela deve apontar para longe da porta, nunca para dentro da parede.</p>
    <details class="door-adv"><summary>Avançado</summary>
      <p class="insp-note">Estes valores já vêm com o que o jogo original mais usa. Só mude se souber o que quer.</p>
      <div class="door-row">${numInput('size', 'Tamanho do marcador', d, 0.1)}${numInput('peds', 'Pedestres', d, 1)}${numInput('timeOn', 'Abre às', d, 1)}${numInput('timeOff', 'Fecha às', d, 1)}</div>
      <div class="door-row">${numInput('flagsOut', 'Flags de fora', d, 1)}${numInput('flagsIn', 'Flags de dentro', d, 1)}${numInput('skyOut', 'Céu de fora', d, 1)}${numInput('skyIn', 'Céu de dentro', d, 1)}</div>
      <ul class="door-help">
        <li><b>Tamanho do marcador:</b> o raio da área, em metros, em que o jogador aciona a porta.</li>
        <li><b>Pedestres:</b> quantos pedestres o jogo tenta criar quando se passa por esta porta. O jogo original usa 0, 2, 4, 8 ou 12 e pode criar menos do que o pedido.</li>
        <li><b>Abre às / Fecha às:</b> as horas do jogo em que a porta funciona. De 0 a 24 ela funciona o dia todo.</li>
        <li><b>Flags:</b> um número que liga e desliga comportamentos da porta, somando valores. Fora vem com 4 e dentro com 0, o mais comum no jogo.</li>
        <li><b>Céu:</b> um número que o jogo usa para o ambiente do lugar. Fora vem com 0 e dentro com 4, como as portas de interiores do jogo.</li>
      </ul>
    </details>
    <button type="button" class="btn danger" data-del><svg><use href="#i-trash"/></svg>Apagar entrada</button>
    <p class="insp-note">O ângulo é para onde o jogador olha ao sair pela porta (0 = norte). Os dois lados são ligados pelo nome. Se o interior já existe no jogo, a saída original dele continua levando à porta original: para uma porta sua nos dois sentidos, monte o interior com objetos numa área própria.</p>`;
}

function render() { renderList(); renderForm(); }

// ---------------------------------------------------------------------------  gizmo on the markers
// The editor's own manipulator is borrowed while a marker is being adjusted; clicking on the map does not select anything meanwhile.
const markerGroup = () => app.vp.scene.getObjectByName('doors')?.children.find(g => g.userData.doorUid === adjust?.uid && g.userData.side === adjust?.side);

function attachGizmo() {
  const g = markerGroup();
  const tc = app.editor.tc;
  if (!g || !adjust) return;
  tc.attach(g);
  tc.setMode(gizmoMode);
  tc.setSpace(app.editor.space || 'world'); // the World / Object button of the top bar
  tc.showX = tc.showY = gizmoMode === 'translate';
  if (app.editor.externalGizmo) app.editor.externalGizmo.object = g;
  tc.showZ = true;
  tc.enabled = true;
  app.editor.gizmo.visible = true;
  app.editor.applySnap?.();
}

function startAdjust(uid, side, fromDialog = false, focus = false) {
  const d = find(uid);
  if (!d) return;
  adjust = { uid, side, fromDialog: fromDialog || !!adjust?.fromDialog };
  current = uid;
  gizmoMode = app.editor.mode === 'rotate' ? 'rotate' : 'translate'; // starts in the mode chosen in the top bar
  app.editor.mode = gizmoMode;
  app.editor.clearSelection();
  if ($('#dlgDoors').open) $('#dlgDoors').close();
  // The editor's floating Move/Rotate button (in the middle of the gizmo) works for this marker too
  app.editor.externalGizmo = { object: null, mode: () => gizmoMode, toggle: () => setGizmoMode(gizmoMode === 'translate' ? 'rotate' : 'translate') };
  $('#doorBar').hidden = false;
  gizmoBar();
  if (fromDialog || focus) lookAtPoint(d[side].x, d[side].y, d[side].z);
  attachGizmo();
}

function endAdjust() {
  if (!adjust) return;
  const reopen = adjust.fromDialog;
  adjust = null;
  app.editor.externalGizmo = null;
  app.editor.tc.detach();
  $('#doorBar').hidden = true;
  app.editor.attachGizmo?.();
  if (reopen) $('#btnDoors').click();
}

function setGizmoMode(m) {
  gizmoMode = m;
  app.editor.mode = m; // the top bar's Move / Rotate buttons show it
  app.editor.emit('mode');
  gizmoBar();
  attachGizmo();
}

function gizmoBar() {
  const d = find(adjust?.uid);
  if (!d) return;
  $('#doorBarLabel').textContent = adjust.side === 'out' ? `Ajustando ${d.name}: lado de fora` : `Ajustando ${d.name}: lado de dentro`;
  for (const b of document.querySelectorAll('#doorBar [data-door-mode]')) b.classList.toggle('active', b.dataset.doorMode === gizmoMode);
}

function onGizmoChange() {
  const g = app.editor.tc.object;
  const d = find(adjust?.uid);
  if (!adjust || !d || g?.userData?.doorUid !== adjust.uid) return;
  d[adjust.side] = { x: r1(g.position.x), y: r1(g.position.y), z: r1(g.position.z), rot: r1(((g.rotation.z * 180 / Math.PI) % 360 + 360) % 360) };
}

// Which marker (door and side) is under the mouse, if any
function markerAt(e) {
  const group = app.vp.scene.getObjectByName('doors');
  if (!group) return null;
  const rc = new THREE.Raycaster();
  rc.setFromCamera(app.vp.ndc(e), app.vp.camera);
  rc.far = 1500;
  for (const h of rc.intersectObjects(group.children, true)) {
    let o = h.object;
    while (o && !o.userData.doorUid) o = o.parent;
    if (o) return { uid: o.userData.doorUid, side: o.userData.side };
  }
  return null;
}

// Clicking a marker on the map selects it and shows the gizmo (the editor's own click keeps working for everything else,
// and does nothing while a marker is being adjusted)
function setupMapClicks() {
  const ed = app.editor;
  const pick = ed.pick.bind(ed), selectWorld = ed.selectWorld.bind(ed);
  ed.pick = (e) => {
    const m = markerAt(e);
    if (m) { startAdjust(m.uid, m.side); return; }
    if (!adjust) pick(e);
  };
  ed.selectWorld = (...a) => { if (!adjust) selectWorld(...a); };
  // The top bar buttons (Move / Rotate and World / Object) steer this gizmo while a marker is being adjusted
  const setMode = ed.setMode.bind(ed), setSpace = ed.setSpace.bind(ed);
  ed.setMode = (m) => {
    if (!adjust) return setMode(m);
    if (m === 'translate' || m === 'rotate') setGizmoMode(m);
  };
  ed.setSpace = (space) => {
    if (!adjust) return setSpace(space);
    ed.space = space;
    attachGizmo();
    ed.emit('mode');
  };
}

function setupGizmo() {
  setupMapClicks();
  const tc = app.editor.tc;
  tc.addEventListener('objectChange', onGizmoChange);
  tc.addEventListener('dragging-changed', (e) => {
    if (e.value || !adjust) return;
    changed();
    setTimeout(attachGizmo, 0); // the markers were rebuilt, and the editor drops the manipulator when a drag ends
  });
  $('#doorBar').addEventListener('click', (e) => {
    const m = e.target.closest('[data-door-mode]');
    if (m) setGizmoMode(m.dataset.doorMode);
    else if (e.target.closest('#doorBarDone')) endAdjust();
  });
  window.addEventListener('keydown', (e) => {
    if (!adjust || e.ctrlKey || e.metaKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '')) return;
    const k = e.key.toLowerCase();
    if (k === 'escape') { e.stopPropagation(); endAdjust(); }
    else if (k === 'g' || k === '1') { e.stopPropagation(); setGizmoMode('translate'); }
    else if (k === 'r' || k === '2') { e.stopPropagation(); setGizmoMode('rotate'); }
    else if (k === 'l') { e.stopPropagation(); app.editor.setSpace(app.editor.space === 'world' ? 'local' : 'world'); }
  }, true);
}

export function initDoorDialog() {
  const dlg = $('#dlgDoors');
  $('#btnDoors').onclick = () => {
    if (!find(current)) current = doors()[0]?.uid || null;
    render();
    dlg.showModal();
  };
  $('#doorClose').onclick = () => dlg.close();
  $('#doorAdd').onclick = () => {
    const spot = cameraSpot();
    const place = INTERIOR_PLACES[0];
    const d = makeDoor({
      name: newDoorName(doors()),
      out: { x: spot.x, y: spot.y, z: spot.z, rot: awayFrom(spot.rot) },
      in: { x: place.x, y: place.y, z: place.z, rot: 0 }, interior: place.interior,
    });
    doors().push(d);
    current = d.uid;
    changed();
    render();
  };
  $('#doorList').addEventListener('click', (e) => {
    const b = e.target.closest('[data-uid]');
    if (!b) return;
    current = b.dataset.uid;
    render();
  });
  const form = $('#doorForm');
  form.addEventListener('change', (e) => {
    const d = find(current);
    const f = e.target.dataset?.f;
    if (!d) return;
    if (e.target.dataset.pick !== undefined) {
      const p = INTERIOR_PLACES[+e.target.value];
      if (p) Object.assign(d, { in: { x: p.x, y: p.y, z: p.z, rot: d.in.rot }, interior: p.interior });
      changed(); render();
      return;
    }
    if (!f) return;
    if (f === 'name') d.name = newDoorName(doors().filter(x => x !== d), e.target.value);
    else setField(d, f, f === 'interior' || /^(flags|sky|peds|time)/.test(f) ? (parseInt(e.target.value, 10) || 0) : (parseFloat(e.target.value) || 0));
    if (f === 'size') d.size = Math.max(0.5, d.size);
    changed(); renderList();
    if (f === 'name') e.target.value = d.name;
  });
  form.addEventListener('click', async (e) => {
    const d = find(current);
    if (!d) return;
    const cam = e.target.closest('[data-cam]'), go = e.target.closest('[data-go]'), adj = e.target.closest('[data-adjust]');
    if (adj) {
      startAdjust(d.uid, adj.dataset.adjust, true);
    } else if (cam) {
      const side = cam.dataset.cam, spot = cameraSpot();
      d[side] = { x: spot.x, y: spot.y, z: spot.z, rot: side === 'out' ? awayFrom(spot.rot) : spot.rot };
      changed(); render();
    } else if (go) {
      const side = go.dataset.go;
      lookAtPoint(d[side].x, d[side].y, d[side].z);
      dlg.close();
    } else if (e.target.closest('[data-del]')) {
      if (!await showConfirm('Apagar esta entrada e os dois marcadores dela?', { confirmText: 'Apagar', danger: true })) return;
      app.project.doors = doors().filter(x => x !== d);
      current = app.project.doors[0]?.uid || null;
      changed(); render();
      toast('Entrada apagada');
    }
  });
  setupGizmo();
  // From the project list (left side menu): go to a door with the gizmo on its outside marker, or delete it
  app.on('door-select', (uid) => startAdjust(uid, 'out', false, true));
  app.on('door-delete', async (uid) => {
    if (!await showConfirm('Apagar esta entrada e os dois marcadores dela?', { confirmText: 'Apagar', danger: true })) return;
    if (adjust?.uid === uid) endAdjust();
    app.project.doors = doors().filter(x => x.uid !== uid);
    if (current === uid) current = app.project.doors[0]?.uid || null;
    changed();
    toast('Entrada apagada');
  });
  app.on('project', refreshDoorMarkers);
  refreshDoorMarkers();
}
