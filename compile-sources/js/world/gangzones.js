// Suporte completo a GangZones (GangZoneCreate)
// Conforme especificação : 
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

// Gera o nome sequencial na duplicação: Zona 1 > Zona 1_2 > Zona 1_3
// ---------------------------------------------------------------------------
// Espaço livre para uma GangZone nova (duplicar ou adicionar).
// O mapa vira uma grade com as bordas de todas as zonas; partindo da célula livre mais próxima
// da original (ou do ponto pedido), cresce o maior retângulo livre que a contém. A zona nova fica
// nesse espaço, com o tamanho da original reduzido ao do espaço quando ele é menor, e o mais perto
// possível da original (encostada nela quando o espaço é vizinho). Espaços com menos de 1/4 da
// largura ou da altura da original (frestas) são ignorados.
// Zonas podem se encostar, mas não se sobrepor. Retorna { minx, miny, maxx, maxy, scaled } ou null.
// ---------------------------------------------------------------------------
const GZ_WORLD_MIN = -3000, GZ_WORLD_MAX = 3000, GZ_MIN_SIZE = 10;

export function findFreeGangZoneSpot(zones, { width, height, near, origin = null, excludeUid = null }) {
  const others = (zones || []).filter(z => z && z.uid !== excludeUid).map(z => ({
    minx: Math.max(GZ_WORLD_MIN, Math.min(z.minx, z.maxx)), maxx: Math.min(GZ_WORLD_MAX, Math.max(z.minx, z.maxx)),
    miny: Math.max(GZ_WORLD_MIN, Math.min(z.miny, z.maxy)), maxy: Math.min(GZ_WORLD_MAX, Math.max(z.miny, z.maxy)),
  })).filter(z => z.maxx > z.minx && z.maxy > z.miny);
  const w = Math.max(GZ_MIN_SIZE, width), h = Math.max(GZ_MIN_SIZE, height);
  const cx = near?.x ?? 0, cy = near?.y ?? 0;
  const ref = origin || { minx: cx - w / 2, maxx: cx + w / 2, miny: cy - h / 2, maxy: cy + h / 2 };
  // Espaço mínimo aceito: evita jogar a cópia numa fresta entre duas zonas
  const minW = Math.max(GZ_MIN_SIZE, w * 0.25), minH = Math.max(GZ_MIN_SIZE, h * 0.25);

  // Grade com as bordas de todas as zonas e do mapa
  const xs = [...new Set([GZ_WORLD_MIN, GZ_WORLD_MAX, ...others.flatMap(o => [o.minx, o.maxx])])].sort((a, b) => a - b);
  const ys = [...new Set([GZ_WORLD_MIN, GZ_WORLD_MAX, ...others.flatMap(o => [o.miny, o.maxy])])].sort((a, b) => a - b);
  const nx = xs.length - 1, ny = ys.length - 1;
  const free = new Uint8Array(nx * ny);
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
    const mx = (xs[i] + xs[i + 1]) / 2, my = (ys[j] + ys[j + 1]) / 2;
    free[i * ny + j] = others.some(o => mx > o.minx && mx < o.maxx && my > o.miny && my < o.maxy) ? 0 : 1;
  }
  const colFree = (i, j0, j1) => { for (let j = j0; j <= j1; j++) if (!free[i * ny + j]) return false; return true; };
  const rowFree = (j, i0, i1) => { for (let i = i0; i <= i1; i++) if (!free[i * ny + j]) return false; return true; };
  const gap = (a0, a1, b0, b1) => Math.max(0, a0 - b1, b0 - a1);

  // Células livres da mais próxima para a mais distante da original
  const cells = [];
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
    if (!free[i * ny + j]) continue;
    const dx = gap(xs[i], xs[i + 1], ref.minx, ref.maxx), dy = gap(ys[j], ys[j + 1], ref.miny, ref.maxy);
    cells.push({ i, j, d: Math.hypot(dx, dy), c: Math.hypot((xs[i] + xs[i + 1]) / 2 - (ref.minx + ref.maxx) / 2, (ys[j] + ys[j + 1]) / 2 - (ref.miny + ref.maxy) / 2) });
  }
  cells.sort((a, b) => a.d - b.d || a.c - b.c);

  const tried = new Set();
  for (const cell of cells) {
    // Maior retângulo livre que contém a célula: primeiro na horizontal, depois na vertical
    let i0 = cell.i, i1 = cell.i, j0 = cell.j, j1 = cell.j;
    while (i0 > 0 && free[(i0 - 1) * ny + cell.j] && xs[i1 + 1] - xs[i0 - 1] <= w * 4) i0--;
    while (i1 < nx - 1 && free[(i1 + 1) * ny + cell.j] && xs[i1 + 2] - xs[i0] <= w * 4) i1++;
    while (j0 > 0 && rowFree(j0 - 1, i0, i1) && ys[j1 + 1] - ys[j0 - 1] <= h * 4) j0--;
    while (j1 < ny - 1 && rowFree(j1 + 1, i0, i1) && ys[j1 + 2] - ys[j0] <= h * 4) j1++;
    const key = `${i0},${i1},${j0},${j1}`;
    if (tried.has(key)) continue;
    tried.add(key);
    const space = { minx: xs[i0], maxx: xs[i1 + 1], miny: ys[j0], maxy: ys[j1 + 1] };
    const sw = space.maxx - space.minx, sh = space.maxy - space.miny;
    if (sw < minW || sh < minH) continue;
    // Tamanho da original, reduzido ao do espaço; posição o mais perto possível da original
    const fw = Math.min(w, sw), fh = Math.min(h, sh);
    const clampTo = (v, a, b) => Math.max(a, Math.min(b, v));
    const x = clampTo((ref.minx + ref.maxx) / 2 - fw / 2, space.minx, space.maxx - fw);
    const y = clampTo((ref.miny + ref.maxy) / 2 - fh / 2, space.miny, space.maxy - fh);
    return { minx: x, miny: y, maxx: x + fw, maxy: y + fh, scaled: fw < w || fh < h };
  }
  return null;
}

export function getNextGangZoneName(origName, existingZones = []) {
  const baseRaw = (origName || 'Zona 1').trim();
  const m = baseRaw.match(/^(.*?)_(\d+)$/);
  let prefix = baseRaw;
  let nextNum = 2;
  if (m) {
    prefix = m[1];
    nextNum = parseInt(m[2], 10) + 1;
  }
  let candidate = `${prefix}_${nextNum}`;
  const existingNames = new Set(existingZones.map(z => (z.name || z.comment || '').trim()));
  while (existingNames.has(candidate)) {
    nextNum++;
    candidate = `${prefix}_${nextNum}`;
  }
  return candidate;
}

// Auto-alinhamento magnético: encaixa as bordas de uma gangzone nas de outras zonas vizinhas
export function snapGangZoneEdges(candidate, existingZones, threshold = 25.0, isMove = false) {
  let { minx, miny, maxx, maxy } = candidate;

  let bestDiffX = threshold + 0.001;
  let snapXDelta = 0;
  let snapXVal = null;

  let bestDiffY = threshold + 0.001;
  let snapYDelta = 0;
  let snapYVal = null;

  for (const gz of existingZones) {
    if (!gz || gz.uid === candidate.uid) continue;

    // Todas as bordas X da zona vizinha
    for (const otherX of [gz.minx, gz.maxx]) {
      const diffMin = Math.abs(minx - otherX);
      if (diffMin < bestDiffX) {
        bestDiffX = diffMin;
        snapXDelta = otherX - minx;
        snapXVal = otherX;
      }
      const diffMax = Math.abs(maxx - otherX);
      if (diffMax < bestDiffX) {
        bestDiffX = diffMax;
        snapXDelta = otherX - maxx;
        snapXVal = otherX;
      }
    }

    // Todas as bordas Y da zona vizinha
    for (const otherY of [gz.miny, gz.maxy]) {
      const diffMin = Math.abs(miny - otherY);
      if (diffMin < bestDiffY) {
        bestDiffY = diffMin;
        snapYDelta = otherY - miny;
        snapYVal = otherY;
      }
      const diffMax = Math.abs(maxy - otherY);
      if (diffMax < bestDiffY) {
        bestDiffY = diffMax;
        snapYDelta = otherY - maxy;
        snapYVal = otherY;
      }
    }
  }

  const snapLines = [];

  if (bestDiffX <= threshold) {
    if (isMove) {
      minx += snapXDelta;
      maxx += snapXDelta;
    } else {
      if (Math.abs(minx + snapXDelta - snapXVal) < 0.01) minx += snapXDelta;
      else maxx += snapXDelta;
    }
    if (snapXVal !== null) snapLines.push({ type: 'x', val: snapXVal });
  }

  if (bestDiffY <= threshold) {
    if (isMove) {
      miny += snapYDelta;
      maxy += snapYDelta;
    } else {
      if (Math.abs(miny + snapYDelta - snapYVal) < 0.01) miny += snapYDelta;
      else maxy += snapYDelta;
    }
    if (snapYVal !== null) snapLines.push({ type: 'y', val: snapYVal });
  }

  return {
    minx: Math.min(minx, maxx),
    maxx: Math.max(minx, maxx),
    miny: Math.min(miny, maxy),
    maxy: Math.max(miny, maxy),
    snapped: (bestDiffX <= threshold) || (bestDiffY <= threshold),
    snapLines,
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
