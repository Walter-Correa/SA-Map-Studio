// Suporte completo a GangZones (GangZoneCreate)
// Conforme especificação do open.mp: https://open.mp/pt-BR/docs/scripting/functions/GangZoneCreate
import * as THREE from 'three';

export const DEFAULT_GANGZONE_COLORS = [
  { name: 'Grove Street (Verde)', hex: '#33AA33', val: 0x33AA3390 },
  { name: 'Ballas (Roxo)', hex: '#AA33AA', val: 0xAA33AA90 },
  { name: 'Vagos (Amarelo)', hex: '#FFCC00', val: 0xFFCC0090 },
  { name: 'Varrios Los Aztecas (Ciano)', hex: '#00CCFF', val: 0x00CCFF90 },
  { name: 'San Fierro Rifa (Azul Turquesa)', hex: '#3388AA', val: 0x3388AA90 },
  { name: 'Da Nang Boys (Laranja Escuro)', hex: '#FF6600', val: 0xFF660090 },
  { name: 'Máfia / Preto', hex: '#222222', val: 0x22222290 },
  { name: 'Vermelho Neutro', hex: '#FF0000', val: 0xFF000090 },
  { name: 'Azul Neutro', hex: '#0044FF', val: 0x0044FF90 },
  { name: 'Branco / Neutro', hex: '#FFFFFF', val: 0xFFFFFF90 },
];

export function gzColorToRgba(num) {
  const val = Number(num) >>> 0;
  const r = (val >>> 24) & 0xFF;
  const g = (val >>> 16) & 0xFF;
  const b = (val >>> 8) & 0xFF;
  const a = ((val & 0xFF) / 255).toFixed(2);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function gzColorToHexAndAlpha(num) {
  const val = Number(num) >>> 0;
  const r = (val >>> 24) & 0xFF;
  const g = (val >>> 16) & 0xFF;
  const b = (val >>> 8) & 0xFF;
  const a = (val & 0xFF) / 255;
  const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
  return { hex, alpha: a };
}

export function hexAndAlphaToGzColor(hexStr, alpha = 0.5) {
  let clean = String(hexStr || '').replace(/[^0-9a-fA-F]/g, '');
  if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
  if (clean.length < 6) clean = clean.padEnd(6, 'F');
  const r = parseInt(clean.slice(0, 2), 16) || 0;
  const g = parseInt(clean.slice(2, 4), 16) || 0;
  const b = parseInt(clean.slice(4, 6), 16) || 0;
  const a = Math.max(0, Math.min(255, Math.round(Number(alpha) * 255))) || 128;
  return (((r << 24) | (g << 16) | (b << 8) | a) >>> 0);
}

// Auto-alinhamento magnético: encaixa as bordas de uma gangzone nas de outras zonas vizinhas
export function snapGangZoneEdges(candidate, existingZones, threshold = 25.0) {
  let { minx, miny, maxx, maxy } = candidate;
  let snappedX = false, snappedY = false;

  for (const gz of existingZones) {
    if (gz.uid === candidate.uid) continue;

    // Encaixe horizontal X (minx e maxx podem colar em minx ou maxx de outro)
    if (!snappedX) {
      if (Math.abs(minx - gz.maxx) <= threshold) { minx = gz.maxx; snappedX = true; }
      else if (Math.abs(minx - gz.minx) <= threshold) { minx = gz.minx; snappedX = true; }
      else if (Math.abs(maxx - gz.minx) <= threshold) { maxx = gz.minx; snappedX = true; }
      else if (Math.abs(maxx - gz.maxx) <= threshold) { maxx = gz.maxx; snappedX = true; }
    }

    // Encaixe vertical Y (miny e maxy podem colar em miny ou maxy de outro)
    if (!snappedY) {
      if (Math.abs(miny - gz.maxy) <= threshold) { miny = gz.maxy; snappedY = true; }
      else if (Math.abs(miny - gz.miny) <= threshold) { miny = gz.miny; snappedY = true; }
      else if (Math.abs(maxy - gz.miny) <= threshold) { maxy = gz.miny; snappedY = true; }
      else if (Math.abs(maxy - gz.maxy) <= threshold) { maxy = gz.maxy; snappedY = true; }
    }
  }

  return {
    minx: Math.min(minx, maxx),
    maxx: Math.max(minx, maxx),
    miny: Math.min(miny, maxy),
    maxy: Math.max(miny, maxy),
    snapped: snappedX || snappedY,
  };
}

// Cria nó 3D para projetar a GangZone no chão da cena Three.js
export function createGangZoneNode(gz) {
  const group = new THREE.Group();
  group.userData = { uid: gz.uid, kind: 'gangZones' };

  const w = Math.max(1, gz.maxx - gz.minx);
  const h = Math.max(1, gz.maxy - gz.miny);
  const cx = (gz.minx + gz.maxx) / 2;
  const cy = (gz.miny + gz.maxy) / 2;
  const cz = 5.0; // Altura no mundo

  const { hex, alpha } = gzColorToHexAndAlpha(gz.color);
  const colorInt = parseInt(hex.replace('#', ''), 16) || 0xFF0000;

  // Plano semi-transparente
  const planeGeo = new THREE.PlaneGeometry(w, h);
  const planeMat = new THREE.MeshBasicMaterial({
    color: colorInt,
    transparent: true,
    opacity: Math.max(0.15, alpha * 0.75),
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const plane = new THREE.Mesh(planeGeo, planeMat);
  group.add(plane);

  // Linhas das bordas (contorno vibrante)
  const edgesGeo = new THREE.EdgesGeometry(planeGeo);
  const edgesMat = new THREE.LineBasicMaterial({
    color: colorInt,
    linewidth: 2,
    transparent: true,
    opacity: 0.9,
  });
  const edges = new THREE.LineSegments(edgesGeo, edgesMat);
  group.add(edges);

  group.position.set(cx, cy, cz);
  return group;
}
