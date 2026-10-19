// Prévia de modelo 3D das TextDraws (TEXT_DRAW_FONT_MODEL_PREVIEW) desenhada como o cliente do SA-MP:
// - o modelo é desenhado numa imagem quadrada de 256 x 256, depois esticada para a caixa (TextSize);
// - câmera em (0, 0, 50) olhando para -Y (Z para cima), campo de visão de 53,13° (janela 0,5),
//   recorte de 0,01 a 300;
// - o modelo usa a esfera de colisão (arquivo COL): fica em (-centro.x, distância, 50 - centro.z),
//   com distância = (-0,1 - 2,25 x raio) x zoom;
// - rotação no espaço do modelo, em volta da origem dele: Z, depois Y, depois X, depois o deslocamento;
// - os modelos 1373, 3118, 3552 e 3553 são trocados pelo 18631 girado 180° em Z;
// - pedestres ficam na pose parada do jogo (IDLE_stance do anim/ped.ifp), com o skin aplicado nos ossos.
import * as THREE from 'three';

const SIZE = 256;
const SWAP_MODELS = new Set([1373, 3118, 3552, 3553]);
const PED_SPHERE = [0, 0, 0, 1.0]; // colisão fixa de pedestre do GTA (gta_sa.exe 0x5baf16: raio 1,0, centro 0)

// Sem o ped.ifp ou sem ossos no modelo: a malha sem animação fica um pouco abaixo da pose do jogo
const PED_LIFT = 0.06;

let renderer = null, target = null, scene = null, camera = null, pixels = null;
const spheres = new Map();  // modelo -> Promise<[cx, cy, cz, r] | null>
const images = new Map();   // chave -> { canvas, ready }
const posedPeds = new Map(); // modelo -> Promise<THREE.Group | null>
let idlePose = null;         // Promise<Map(osso -> { q, t }) | null>

// Primeiro quadro da animação IDLE_stance (arquivo ANP3): rotação de cada osso e posição do osso raiz
function parseIdlePose(buf) {
  if (!buf || buf.byteLength < 36) return null;
  const v = new DataView(buf), u8 = new Uint8Array(buf);
  const name = (p) => { let s = ''; for (let i = 0; i < 24 && u8[p + i]; i++) s += String.fromCharCode(u8[p + i]); return s.toLowerCase(); };
  if (String.fromCharCode(u8[0], u8[1], u8[2], u8[3]) !== 'ANP3') return null;
  const count = v.getUint32(32, true);
  let p = 36;
  for (let a = 0; a < count && p + 36 <= buf.byteLength; a++) {
    const anim = name(p), objects = v.getUint32(p + 24, true);
    p += 36;
    const bones = new Map();
    for (let o = 0; o < objects && p + 36 <= buf.byteLength; o++) {
      const type = v.getUint32(p + 24, true), frames = v.getUint32(p + 28, true), id = v.getInt32(p + 32, true);
      p += 36;
      if (anim === 'idle_stance' && frames && p + 16 <= buf.byteLength) {
        const q = [0, 1, 2, 3].map(i => v.getInt16(p + i * 2, true) / 4096);
        const t = type === 4 ? [0, 1, 2].map(i => v.getInt16(p + 10 + i * 2, true) / 1024) : null;
        bones.set(id, { q, t });
      }
      p += frames * (type === 4 ? 16 : 10);
    }
    if (anim === 'idle_stance') return bones;
  }
  return null;
}

function loadIdlePose() {
  if (!idlePose) idlePose = fetch('/gta/anim/ped.ifp').then(r => (r.ok ? r.arrayBuffer() : null)).then(parseIdlePose).catch(() => null);
  return idlePose;
}

// Pedestre na pose parada: cada vértice vai com os ossos que o movem (até 4, com peso)
function posePed(template, pose) {
  const frames = template?.userData?.frames;
  const root = frames?.find(f => f.hanim);
  if (!root || !pose) return null;
  const local = frames.map(f => {
    const m = new THREE.Matrix4().set(
      f.rot[0], f.rot[3], f.rot[6], f.pos[0],
      f.rot[1], f.rot[4], f.rot[7], f.pos[1],
      f.rot[2], f.rot[5], f.rot[8], f.pos[2],
      0, 0, 0, 1);
    const key = f.boneId !== undefined ? pose.get(f.boneId) : null;
    if (key) {
      const pos = key.t ? new THREE.Vector3(...key.t) : new THREE.Vector3(f.pos[0], f.pos[1], f.pos[2]);
      m.compose(pos, new THREE.Quaternion(...key.q).normalize(), new THREE.Vector3(1, 1, 1));
    }
    return m;
  });
  const world = [];
  const worldOf = (i, depth = 0) => {
    if (world[i]) return world[i];
    const parent = frames[i].parent;
    world[i] = (parent >= 0 && parent !== i && parent < frames.length && depth < 64) ? worldOf(parent, depth + 1).clone().multiply(local[i]) : local[i];
    return world[i];
  };
  const frameOfBone = new Map();
  frames.forEach((f, i) => { if (f.boneId !== undefined && !frameOfBone.has(f.boneId)) frameOfBone.set(f.boneId, i); });
  const group = new THREE.Group();
  template.traverse(mesh => {
    const skin = mesh.userData?.skin;
    if (!mesh.isMesh || !skin) return;
    const boneMats = [];
    for (let b = 0; b < skin.numBones; b++) {
      const fi = frameOfBone.get(root.hanim[b]);
      const inv = new THREE.Matrix4().fromArray(skin.inverse, b * 16);
      const e = inv.elements; e[3] = 0; e[7] = 0; e[11] = 0; e[15] = 1;
      boneMats.push(fi === undefined ? new THREE.Matrix4() : worldOf(fi).clone().multiply(inv));
    }
    const geo = mesh.geometry.clone();
    const pos = geo.getAttribute('position'), nrm = geo.getAttribute('normal');
    const outP = new Float32Array(pos.count * 3), outN = nrm ? new Float32Array(pos.count * 3) : null;
    const v = new THREE.Vector3(), n = new THREE.Vector3(), t = new THREE.Vector3(), acc = new THREE.Vector3(), accN = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      acc.set(0, 0, 0); accN.set(0, 0, 0);
      v.fromBufferAttribute(pos, i);
      if (nrm) n.fromBufferAttribute(nrm, i);
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        const w = skin.weights[i * 4 + k], bm = boneMats[skin.indices[i * 4 + k]];
        if (!(w > 0) || !bm) continue;
        sum += w;
        acc.addScaledVector(t.copy(v).applyMatrix4(bm), w);
        if (nrm) accN.addScaledVector(t.copy(n).transformDirection(bm), w);
      }
      if (sum <= 0) acc.copy(v);
      outP.set([acc.x, acc.y, acc.z], i * 3);
      if (outN) { if (accN.lengthSq() > 0) accN.normalize(); else accN.copy(n); outN.set([accN.x, accN.y, accN.z], i * 3); }
    }
    geo.setAttribute('position', new THREE.BufferAttribute(outP, 3));
    if (outN) geo.setAttribute('normal', new THREE.BufferAttribute(outN, 3));
    geo.computeBoundingSphere();
    geo.computeBoundingBox();
    const posed = new THREE.Mesh(geo, mesh.material);
    posed.renderOrder = mesh.renderOrder;
    group.add(posed);
  });
  return group.children.length ? group : null;
}

function posedPed(app, id, template) {
  if (!posedPeds.has(id)) posedPeds.set(id, loadIdlePose().then(pose => posePed(template, pose)).catch(() => null));
  return posedPeds.get(id);
}

function setup(app) {
  if (scene) return true;
  renderer = app?.vp?.renderer;
  if (!renderer) return false;
  target = new THREE.WebGLRenderTarget(SIZE, SIZE, { depthBuffer: true });
  scene = new THREE.Scene();
  // Luz forte e quase uniforme, como a prévia do jogo (medida num print do SA-MP)
  scene.add(new THREE.AmbientLight(0xffffff, 2.7));
  const sun = new THREE.DirectionalLight(0xffffff, 0.5);
  sun.position.set(-1, 2, 53);
  sun.target.position.set(0, -5, 50);
  scene.add(sun, sun.target);
  camera = new THREE.PerspectiveCamera(2 * Math.atan(0.5) * 180 / Math.PI, 1, 0.01, 300);
  camera.position.set(0, 0, 50);
  camera.up.set(0, 0, 1);
  camera.lookAt(0, -1, 50);
  camera.updateProjectionMatrix();
  pixels = new Uint8Array(SIZE * SIZE * 4);
  return true;
}

function colSphere(app, id) {
  if (!spheres.has(id)) {
    const def = app.gd?.models?.get(id);
    const isPed = def?.type === 'peds' || (id >= 0 && id <= 311 && !def?.type) || def?.type === 'skins';
    spheres.set(id, fetch('/api/colsphere?model=' + encodeURIComponent(def?.model || ''))
      .then(r => r.json()).then(d => (d && d.sphere) || (isPed ? PED_SPHERE : null)).catch(() => (isPed ? PED_SPHERE : null)));
  }
  return spheres.get(id);
}

async function render(app, td, entry) {
  let id = Number(td.previewModel ?? 0) | 0;
  let rx = Number(td.previewRotX) || 0, ry = Number(td.previewRotY) || 0, rz = Number(td.previewRotZ) || 0;
  if (SWAP_MODELS.has(id)) { id = 18631; rx = 0; ry = 0; rz = 180; }
  const zoom = Number(td.previewZoom) || 1;
  const template = await app.models.getModel(id).catch(() => null);
  if (!template || !setup(app)) { entry.failed = true; return; }
  const def = app.gd.models.get(id);
  const isPed = def?.type === 'peds' || def?.type === 'skins' || (id >= 0 && id <= 311 && !def?.type);
  const posed = isPed ? await posedPed(app, id, template) : null;
  const obj = posed ? posed.clone() : app.models.instantiate(id);
  if (!obj) { entry.failed = true; return; }
  if (def?.type === 'cars') {
    try { app.editor?.applyVehicleVisuals?.(obj, { model: id, color1: td.previewColor1, color2: td.previewColor2 }); } catch { /* sem cores */ }
  }
  if (isPed && !posed) obj.position.z += PED_LIFT;
  let sph = await colSphere(app, id);
  if (!sph) {
    // Sem colisão: usa a esfera da malha
    const s = new THREE.Box3().setFromObject(obj).getBoundingSphere(new THREE.Sphere());
    sph = [s.center.x, s.center.y, s.center.z, s.radius || 1];
  }
  const [cx, , cz, radius] = sph;
  const dist = (-0.1 - 2.25 * radius) * zoom;
  const holder = new THREE.Group();
  holder.matrixAutoUpdate = false;
  const d2r = Math.PI / 180;
  holder.matrix.makeTranslation(-cx, dist, 50 - cz)
    .multiply(new THREE.Matrix4().makeRotationX(rx * d2r))
    .multiply(new THREE.Matrix4().makeRotationY(ry * d2r))
    .multiply(new THREE.Matrix4().makeRotationZ(rz * d2r));
  holder.add(obj);
  scene.add(holder);
  const prevTarget = renderer.getRenderTarget();
  const prevClear = renderer.getClearColor(new THREE.Color()), prevAlpha = renderer.getClearAlpha();
  renderer.setRenderTarget(target);
  renderer.setClearColor(0x000000, 0);
  renderer.clear();
  renderer.render(scene, camera);
  renderer.readRenderTargetPixels(target, 0, 0, SIZE, SIZE, pixels);
  renderer.setRenderTarget(prevTarget);
  renderer.setClearColor(prevClear, prevAlpha);
  scene.remove(holder);
  // A leitura vem de baixo para cima
  const ctx = entry.canvas.getContext('2d');
  const img = ctx.createImageData(SIZE, SIZE);
  for (let y = 0; y < SIZE; y++) img.data.set(pixels.subarray((SIZE - 1 - y) * SIZE * 4, (SIZE - y) * SIZE * 4), y * SIZE * 4);
  ctx.putImageData(img, 0, 0);
  entry.ready = true;
}

// Imagem 256 x 256 da prévia (ou null enquanto renderiza); onReady é chamada quando ficar pronta
export function clearModelPreviews() { images.clear(); }

export function modelPreviewImage(app, td, onReady) {
  const key = [td.previewModel ?? 0, td.previewRotX, td.previewRotY, td.previewRotZ, td.previewZoom, td.previewColor1, td.previewColor2].join('|');
  let entry = images.get(key);
  if (!entry) {
    const canvas = document.createElement('canvas');
    canvas.width = SIZE; canvas.height = SIZE;
    entry = { canvas, ready: false, failed: false, waiting: new Set() };
    images.set(key, entry);
    if (images.size > 96) images.delete(images.keys().next().value);
    render(app, td, entry).catch(() => { entry.failed = true; }).finally(() => {
      for (const cb of entry.waiting) { try { cb(); } catch { /* prévia fechada */ } }
      entry.waiting.clear();
    });
  }
  if (!entry.ready && !entry.failed && onReady) entry.waiting.add(onReady);
  return entry.ready ? entry.canvas : (entry.failed ? false : null);
}
