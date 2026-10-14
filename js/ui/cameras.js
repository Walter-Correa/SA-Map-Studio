// Aba Câmeras: pontos fixos (SetPlayerCameraPos + SetPlayerCameraLookAt) e movimentos
// (InterpolateCameraPos + InterpolateCameraLookAt) com prévia no editor e código Pawn pronto.
import * as THREE from 'three';
import { cameraFunctions } from '../editor/pwn.js';
import { app, $, $$, esc, fmt, toast, copyText } from './common.js';

let openPath = null;      // id do movimento aberto
let helper = null;        // desenho do caminho na cena
let preview = null;       // prévia tocando

const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const cams = () => app.project.cameras;
const changed = () => { app.project.touch('cameras'); render(); drawHelper(); };
const v3 = (v) => new THREE.Vector3(v.x, v.y, v.z);
const round = (v) => ({ x: Math.round(v.x * 1e4) / 1e4, y: Math.round(v.y * 1e4) / 1e4, z: Math.round(v.z * 1e4) / 1e4 });

// Vista atual do editor: posição da câmera e o ponto para onde ela olha
function currentView() {
  const cam = app.vp.camera;
  const pos = cam.position.clone();
  const hit = app.vp.raycast(new THREE.Vector2(0, 0), [app.editor.root, ...app.streamer.pickables()], 400);
  const look = hit ? hit.point.clone() : pos.clone().addScaledVector(app.vp.fly.direction(), 30);
  return { pos: round(pos), look: round(look) };
}

function viewFrom(pos, look) {
  stopPreview();
  app.vp.camera.position.copy(v3(pos));
  app.vp.fly.lookAt(v3(look));
  app.streamer.invalidate();
}

export function setupCameras() {
  const panel = $('#camPanel');
  panel.addEventListener('click', onClick);
  panel.addEventListener('change', onChange);
  app.on('project', () => { openPath = null; render(); drawHelper(); });
  app.on('project-closing', stopPreview);
  app.vp.onFrame((dt) => tickPreview(dt));
  window.addEventListener('keydown', (e) => { if (preview && e.key === 'Escape') { e.stopImmediatePropagation(); stopPreview(); } }, true);
  $('#camPreviewStop').onclick = stopPreview;
  render();
}

export function render() {
  const panel = $('#camPanel');
  const c = cams();
  const shots = c.shots.map((s, i) => `<div class="cam-item" data-shot="${s.id}">
      <div class="cam-row"><input class="cam-name" data-field="name" value="${esc(s.name)}" aria-label="Nome da câmera">
        <button type="button" class="btn icon" data-act="shot-view" title="Ver no editor"><svg><use href="#i-eye"/></svg></button>
        <button type="button" class="btn icon" data-act="shot-set" title="Usar a vista atual"><svg><use href="#i-camera"/></svg></button>
        <button type="button" class="btn icon" data-act="shot-code" title="Copiar o código"><svg><use href="#i-copy"/></svg></button>
        <button type="button" class="btn icon danger" data-act="shot-del" title="Apagar"><svg><use href="#i-trash"/></svg></button></div>
      <div class="cam-coords">Pos ${fmt(s.pos.x, 2)}, ${fmt(s.pos.y, 2)}, ${fmt(s.pos.z, 2)} · olha ${fmt(s.look.x, 2)}, ${fmt(s.look.y, 2)}, ${fmt(s.look.z, 2)}</div>
      <label class="cam-opt">LookAt <select data-field="cut"><option value="cut" ${s.cut === 'cut' ? 'selected' : ''}>CAMERA_CUT (direto)</option><option value="move" ${s.cut === 'move' ? 'selected' : ''}>CAMERA_MOVE (suave)</option></select></label>
    </div>`).join('');
  const paths = c.paths.map(p => {
    const open = p.id === openPath;
    const total = p.keys.slice(1).reduce((s, k) => s + k.time + k.hold, 0);
    const keys = open ? p.keys.map((k, i) => `<div class="cam-key" data-key="${i}">
        <div class="cam-row"><b class="key-n">${i === 0 ? 'Início' : 'Ponto ' + i}</b>
          <button type="button" class="btn icon" data-act="key-view" title="Ver no editor"><svg><use href="#i-eye"/></svg></button>
          <button type="button" class="btn icon" data-act="key-set" title="Usar a vista atual"><svg><use href="#i-camera"/></svg></button>
          <button type="button" class="btn icon" data-act="key-up" title="Subir" ${i === 0 ? 'disabled' : ''}><svg><use href="#i-up"/></svg></button>
          <button type="button" class="btn icon" data-act="key-down" title="Descer" ${i === p.keys.length - 1 ? 'disabled' : ''}><svg><use href="#i-down"/></svg></button>
          <button type="button" class="btn icon danger" data-act="key-del" title="Apagar"><svg><use href="#i-trash"/></svg></button></div>
        <div class="cam-coords">Pos ${fmt(k.pos.x, 2)}, ${fmt(k.pos.y, 2)}, ${fmt(k.pos.z, 2)} · olha ${fmt(k.look.x, 2)}, ${fmt(k.look.y, 2)}, ${fmt(k.look.z, 2)}</div>
        ${i === 0 ? '<div class="insp-note">A câmera começa aqui.</div>' : `<div class="cam-key-opts">
          <label>Tempo até aqui (ms)<input type="number" min="1" step="100" data-kfield="time" value="${k.time}"></label>
          <label>Esperar aqui (ms)<input type="number" min="0" step="100" data-kfield="hold" value="${k.hold}"></label>
          <label>Tipo<select data-kfield="cut"><option value="move" ${k.cut === 'move' ? 'selected' : ''}>CAMERA_MOVE (suave)</option><option value="cut" ${k.cut === 'cut' ? 'selected' : ''}>CAMERA_CUT (corte)</option></select></label></div>`}
      </div>`).join('') : '';
    return `<div class="cam-item path${open ? ' open' : ''}" data-path="${p.id}">
      <div class="cam-row"><button type="button" class="btn icon" data-act="path-toggle" title="${open ? 'Fechar' : 'Abrir'}" aria-expanded="${open}"><svg><use href="#i-path"/></svg></button>
        <input class="cam-name" data-field="name" value="${esc(p.name)}" aria-label="Nome do movimento">
        <button type="button" class="btn icon" data-act="path-play" title="Prévia no editor" ${p.keys.length < 2 ? 'disabled' : ''}><svg><use href="#i-play"/></svg></button>
        <button type="button" class="btn icon" data-act="path-code" title="Copiar o código"><svg><use href="#i-copy"/></svg></button>
        <button type="button" class="btn icon danger" data-act="path-del" title="Apagar"><svg><use href="#i-trash"/></svg></button></div>
      <div class="cam-coords">${p.keys.length} ${p.keys.length === 1 ? 'ponto' : 'pontos'} · ${(total / 1000).toFixed(1)} s</div>
      ${open ? `${keys}
        <button type="button" class="btn block" data-act="key-add"><svg><use href="#i-plus"/></svg>Adicionar ponto com a vista atual</button>
        <label class="cam-opt">No fim <select data-field="end">
          <option value="behind" ${p.end === 'behind' ? 'selected' : ''}>Voltar para trás do jogador</option>
          <option value="keep" ${p.end === 'keep' ? 'selected' : ''}>Ficar parada no último ponto</option>
          <option value="loop" ${p.end === 'loop' ? 'selected' : ''}>Repetir do começo</option></select></label>` : ''}
    </div>`;
  }).join('');
  panel.innerHTML = `
    <div class="cam-section">
      <div class="insp-label">Câmeras fixas <span class="tag">SetPlayerCameraPos + LookAt</span></div>
      <p class="insp-note">Posicione a vista do editor como quer que o jogador veja e clique em adicionar. A câmera olha para o ponto no centro da tela.</p>
      <button type="button" class="btn block" data-act="shot-add"><svg><use href="#i-camera"/></svg>Adicionar câmera com a vista atual</button>
      ${shots || '<div class="ol-empty">Nenhuma câmera fixa.</div>'}
    </div>
    <div class="cam-section">
      <div class="insp-label">Movimentos <span class="tag">InterpolateCameraPos + LookAt</span></div>
      <p class="insp-note">Cada ponto é uma vista. A câmera vai de um ponto ao próximo no tempo escolhido. Use ▶ para ver a prévia (aproximada) aqui no editor.</p>
      <button type="button" class="btn block" data-act="path-add"><svg><use href="#i-plus"/></svg>Novo movimento começando na vista atual</button>
      ${paths || '<div class="ol-empty">Nenhum movimento.</div>'}
    </div>
    <div class="insp-note">O código das câmeras vai junto na exportação (.pwn).</div>`;
}

function findPath(el) { const id = el.closest('[data-path]')?.dataset.path; return cams().paths.find(p => p.id === id); }
function findShot(el) { const id = el.closest('[data-shot]')?.dataset.shot; return cams().shots.find(s => s.id === id); }

async function onClick(e) {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const a = b.dataset.act, c = cams();
  const shot = findShot(b), path = findPath(b);
  const ki = +(b.closest('[data-key]')?.dataset.key ?? -1);
  if (a === 'shot-add') { c.shots.push({ id: uid('c'), name: 'Câmera ' + (c.shots.length + 1), ...currentView(), cut: 'cut' }); changed(); toast('Câmera adicionada'); }
  else if (a === 'shot-view') viewFrom(shot.pos, shot.look);
  else if (a === 'shot-set') { Object.assign(shot, currentView()); changed(); toast('Câmera atualizada com a vista atual'); }
  else if (a === 'shot-del') { if (confirm(`Apagar a câmera "${shot.name}"?`)) { c.shots.splice(c.shots.indexOf(shot), 1); changed(); } }
  else if (a === 'shot-code') { await copyText(cameraFunctions({ shots: [shot], paths: [] }).code); toast('Código da câmera copiado'); }
  else if (a === 'path-add') {
    const p = { id: uid('p'), name: 'Movimento ' + (c.paths.length + 1), end: 'behind', keys: [{ ...currentView(), time: 0, hold: 0, cut: 'cut' }] };
    c.paths.push(p); openPath = p.id; changed();
    toast('Agora mova a vista e clique em "Adicionar ponto"', 'ok', 4000);
  }
  else if (a === 'path-toggle') { openPath = openPath === path.id ? null : path.id; render(); drawHelper(); }
  else if (a === 'path-del') { if (confirm(`Apagar o movimento "${path.name}"?`)) { c.paths.splice(c.paths.indexOf(path), 1); if (openPath === path.id) openPath = null; changed(); } }
  else if (a === 'path-play') startPreview(path);
  else if (a === 'path-code') { await copyText(cameraFunctions({ shots: [], paths: [path] }).code); toast('Código do movimento copiado'); }
  else if (a === 'key-add') { path.keys.push({ ...currentView(), time: 3000, hold: 0, cut: 'move' }); changed(); }
  else if (a === 'key-view') viewFrom(path.keys[ki].pos, path.keys[ki].look);
  else if (a === 'key-set') { Object.assign(path.keys[ki], currentView()); changed(); }
  else if (a === 'key-del') { path.keys.splice(ki, 1); if (path.keys[0]) { path.keys[0].time = 0; } changed(); }
  else if (a === 'key-up' || a === 'key-down') {
    const j = a === 'key-up' ? ki - 1 : ki + 1;
    if (j < 0 || j >= path.keys.length) return;
    const k = path.keys;
    // Troca só os pontos de vista; tempos ficam nos lugares
    [k[ki].pos, k[j].pos] = [k[j].pos, k[ki].pos];
    [k[ki].look, k[j].look] = [k[j].look, k[ki].look];
    changed();
  }
}

function onChange(e) {
  const t = e.target;
  const shot = findShot(t), path = findPath(t);
  if (t.dataset.field) {
    const target = shot || path;
    if (!target) return;
    target[t.dataset.field] = t.dataset.field === 'name' ? (t.value.trim() || target.name) : t.value;
    app.project.touch('cameras');
    if (t.dataset.field !== 'name') render();
  } else if (t.dataset.kfield && path) {
    const k = path.keys[+t.closest('[data-key]').dataset.key];
    const f = t.dataset.kfield;
    k[f] = f === 'cut' ? t.value : Math.max(f === 'time' ? 1 : 0, Math.round(+t.value || 0));
    changed();
  }
}

// ---------------------------------------------------------------- desenho do caminho
function drawHelper() {
  if (helper) { app.vp.scene.remove(helper); helper.traverse(o => o.geometry?.dispose()); helper = null; }
  const p = cams().paths.find(x => x.id === openPath);
  const shots = cams().shots;
  const g = new THREE.Group();
  g.userData.noPick = true;
  const lineMat = new THREE.LineBasicMaterial({ color: 0xf0a630, depthTest: false, transparent: true });
  const lookMat = new THREE.LineDashedMaterial({ color: 0x5fb3ff, dashSize: 0.8, gapSize: 0.5, depthTest: false, transparent: true });
  const dot = new THREE.SphereGeometry(0.35, 10, 8);
  const dotMat = new THREE.MeshBasicMaterial({ color: 0xf0a630, depthTest: false, transparent: true });
  if (p && p.keys.length) {
    // Curva suave entre os pontos (só desenho: o jogo faz o movimento sozinho)
    const pts = p.keys.map(k => v3(k.pos));
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts.length > 1 ? sampleMove(p, 24) : pts), lineMat);
    g.add(line);
    p.keys.forEach(k => {
      const d = new THREE.Mesh(dot, dotMat); d.position.copy(v3(k.pos)); g.add(d);
      const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([v3(k.pos), v3(k.look)]), lookMat);
      l.computeLineDistances(); g.add(l);
    });
  }
  for (const s of shots) {
    const d = new THREE.Mesh(dot, new THREE.MeshBasicMaterial({ color: 0x5fb3ff, depthTest: false, transparent: true }));
    d.position.copy(v3(s.pos)); g.add(d);
    const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([v3(s.pos), v3(s.look)]), lookMat);
    l.computeLineDistances(); g.add(l);
  }
  g.traverse(o => { o.userData.noPick = true; o.renderOrder = 10; if (o.isMesh || o.isLine) o.raycast = () => {}; });
  g.visible = !preview;
  helper = g;
  app.vp.scene.add(g);
}

function sampleMove(p, perSeg) {
  const out = [];
  for (let i = 1; i < p.keys.length; i++) {
    for (let s = 0; s <= perSeg; s++) out.push(v3(p.keys[i - 1].pos).lerp(v3(p.keys[i].pos), s / perSeg));
  }
  return out;
}

// ---------------------------------------------------------------- prévia
const ease = (t) => 0.5 - Math.cos(Math.PI * t) / 2;  // aproximação do CAMERA_MOVE

function startPreview(path) {
  if (path.keys.length < 2) return;
  stopPreview();
  const cam = app.vp.camera;
  preview = { path, t: 0, saved: { pos: cam.position.clone(), yaw: app.vp.fly.yaw, pitch: app.vp.fly.pitch } };
  app.vp.fly.enabled = false;
  app.editor.gizmo.visible = false;
  app.editor.selBoxes.visible = false;
  if (helper) helper.visible = false;
  $('#camPreviewBar').hidden = false;
}

export function stopPreview() {
  if (!preview) return;
  const s = preview.saved;
  preview = null;
  app.vp.fly.enabled = true;
  app.vp.fly.setPose(s.pos, s.yaw, s.pitch);
  app.editor.gizmo.visible = true;
  app.editor.selBoxes.visible = true;
  if (helper) helper.visible = true;
  $('#camPreviewBar').hidden = true;
  app.streamer.invalidate();
}

function tickPreview(dt) {
  if (!preview) return;
  const p = preview.path, k = p.keys;
  preview.t += dt * 1000;
  let t = preview.t, i = 1;
  // Acha o passo atual (movimento + espera)
  for (; i < k.length; i++) {
    const span = Math.max(1, k[i].time) + k[i].hold;
    if (t < span) break;
    t -= span;
  }
  if (i >= k.length) {
    if (p.end === 'loop') { preview.t = 0; return; }
    if (p.end === 'keep') { if (preview.t > 1e9) stopPreview(); i = k.length - 1; t = k[i].time + k[i].hold; }
    else { stopPreview(); return; }
  }
  const a = k[i - 1], b = k[i];
  const u = Math.min(1, t / Math.max(1, b.time));
  const f = b.cut === 'cut' ? u : ease(u);
  const pos = v3(a.pos).lerp(v3(b.pos), f), look = v3(a.look).lerp(v3(b.look), f);
  const cam = app.vp.camera;
  cam.position.copy(pos);
  cam.up.set(0, 0, 1);
  cam.lookAt(look);
  cam.updateMatrixWorld();
  $('#camPreviewText').textContent = `Prévia: ${p.name} · ${i === 0 ? 'Início' : 'ponto ' + i} de ${k.length - 1} · ${(preview.t / 1000).toFixed(1)} s${p.end === 'keep' && preview.t > k.slice(1).reduce((s, x) => s + x.time + x.hold, 0) ? ' (parada no fim)' : ''}`;
}
