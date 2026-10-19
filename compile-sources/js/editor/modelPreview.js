// Prévia de modelo 3D das TextDraws (TEXT_DRAW_FONT_MODEL_PREVIEW) desenhada como o cliente do SA-MP:
// - o modelo é desenhado numa imagem quadrada de 256 x 256, depois esticada para a caixa (TextSize);
// - câmera em (0, 0, 50) olhando para -Y (Z para cima), campo de visão de 53,13° (janela 0,5),
//   recorte de 0,01 a 300;
// - o modelo usa a esfera de colisão (arquivo COL): fica em (-centro.x, distância, 50 - centro.z),
//   com distância = (-0,1 - 2,25 x raio) x zoom;
// - rotação no espaço do modelo, em volta da origem dele: Z, depois Y, depois X, depois o deslocamento;
// - os modelos 1373, 3118, 3552 e 3553 são trocados pelo 18631 girado 180° em Z.
import * as THREE from 'three';

const SIZE = 256;
const SWAP_MODELS = new Set([1373, 3118, 3552, 3553]);
const PED_SPHERE = [0, 0, 0, 1.0]; // colisão fixa de pedestre do GTA (gta_sa.exe 0x5baf16: raio 1,0, centro 0)

// No jogo o pedestre fica na pose parada (animação), mais alto que a malha sem animação
const PED_LIFT = 0.19;

let renderer = null, target = null, scene = null, camera = null, pixels = null;
const spheres = new Map();  // modelo -> Promise<[cx, cy, cz, r] | null>
const images = new Map();   // chave -> { canvas, ready }

function setup(app) {
  if (scene) return true;
  renderer = app?.vp?.renderer;
  if (!renderer) return false;
  target = new THREE.WebGLRenderTarget(SIZE, SIZE, { depthBuffer: true });
  scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff, 0.75));
  const sun = new THREE.DirectionalLight(0xffffff, 0.9);
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
  const obj = app.models.instantiate(id);
  if (!obj) { entry.failed = true; return; }
  if (app.gd.models.get(id)?.type === 'cars') {
    try { app.editor?.applyVehicleVisuals?.(obj, { model: id, color1: td.previewColor1, color2: td.previewColor2 }); } catch { /* sem cores */ }
  }
  const def = app.gd.models.get(id);
  if (def?.type === 'peds' || def?.type === 'skins' || (id >= 0 && id <= 311 && !def?.type)) obj.position.z += PED_LIFT;
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
