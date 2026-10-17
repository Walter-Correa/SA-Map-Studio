// Suporte completo a 3D Text Labels (Create3DTextLabel e CreateDynamic3DTextLabel)
// Conforme especificação : 
import * as THREE from 'three';

export const STANDARD_LABEL_COLORS = [
  { name: 'Branco', hex: '#FFFFFF', val: 0xFFFFFFFF, tag: '{FFFFFF}' },
  { name: 'Dourado / Amarelo SA-MP', hex: '#EEDD82', val: 0xEEDD82FF, tag: '{EEDD82}' },
  { name: 'Amarelo Vagos', hex: '#FFCC00', val: 0xFFCC00FF, tag: '{FFCC00}' },
  { name: 'Amarelo Claro', hex: '#FFFF00', val: 0xFFFF00FF, tag: '{FFFF00}' },
  { name: 'Verde Grove', hex: '#33AA33', val: 0x33AA33FF, tag: '{33AA33}' },
  { name: 'Verde Claro', hex: '#00FF00', val: 0x00FF00FF, tag: '{00FF00}' },
  { name: 'Vermelho', hex: '#FF0000', val: 0xFF0000FF, tag: '{FF0000}' },
  { name: 'Azul', hex: '#0000FF', val: 0x0000FFFF, tag: '{0000FF}' },
  { name: 'Azul Claro / Ciano', hex: '#00FFFF', val: 0x00FFFFFF, tag: '{00FFFF}' },
  { name: 'Laranja', hex: '#FFA500', val: 0xFFA500FF, tag: '{FFA500}' },
  { name: 'Roxo Ballas', hex: '#AA33AA', val: 0xAA33AAFF, tag: '{AA33AA}' },
  { name: 'Rosa', hex: '#FF69B4', val: 0xFF69B4FF, tag: '{FF69B4}' },
  { name: 'Cinza', hex: '#AFAFAF', val: 0xAFAFAFFF, tag: '{AFAFAF}' },
  { name: 'Preto', hex: '#000000', val: 0x000000FF, tag: '{000000}' },
];

export function labelColorToHex(num) {
  if (num === undefined || num === null) return '#FFFFFF';
  const val = Number(num) >>> 0;
  // No SA-MP / Pawn: 0xRRGGBBAA
  const r = (val >>> 24) & 0xFF;
  const g = (val >>> 16) & 0xFF;
  const b = (val >>> 8) & 0xFF;
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function labelColorToPawnHex(num) {
  if (num === undefined || num === null) return '0xFFFFFFFF';
  const val = Number(num) >>> 0;
  return '0x' + val.toString(16).toUpperCase().padStart(8, '0');
}

export function hexToLabelColor(hexStr, alpha = 0xFF) {
  let clean = String(hexStr || '').replace(/^0x/i, '').replace(/[^0-9a-fA-F]/g, '');
  if (clean.length === 3) clean = clean.split('').map(c => c + c).join('') + 'FF';
  else if (clean.length === 6) clean = clean + 'FF';
  else if (clean.length < 8) clean = clean.padEnd(8, 'F');
  const r = parseInt(clean.slice(0, 2), 16) || 0;
  const g = parseInt(clean.slice(2, 4), 16) || 0;
  const b = parseInt(clean.slice(4, 6), 16) || 0;
  const a = clean.length >= 8 ? (parseInt(clean.slice(6, 8), 16) || alpha) : alpha;
  return (((r << 24) | (g << 16) | (b << 8) | a) >>> 0);
}

// Renderiza o texto com suporte a quebras de linha (\n ou reais) e códigos de cor ({FFFFFF} ou [FFFFFF])
export function renderLabelCanvas(text, defaultHex = '#FFFFFF') {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const fontSize = 36;
  const lineHeight = 46;
  ctx.font = `bold ${fontSize}px "Segoe UI", Arial, sans-serif`;

  const normalizedText = String(text ?? '').replace(/\r/g, '').replace(/\\n/g, '\n');
  const rawLines = normalizedText.split('\n');
  const parsedLines = [];
  let curColor = defaultHex || '#FFFFFF';

  for (const line of rawLines) {
    const segments = [];
    let lastIdx = 0;
    const re = /[\{\[]([0-9a-fA-F]{6})[\}\]]/g;
    let match;
    while ((match = re.exec(line)) !== null) {
      if (match.index > lastIdx) {
        segments.push({ color: curColor, text: line.substring(lastIdx, match.index) });
      }
      curColor = '#' + match[1].toUpperCase();
      lastIdx = re.lastIndex;
    }
    if (lastIdx < line.length) {
      segments.push({ color: curColor, text: line.substring(lastIdx) });
    }
    if (segments.length === 0) segments.push({ color: curColor, text: ' ' });
    parsedLines.push(segments);
  }

  let maxWidth = 0;
  for (const segs of parsedLines) {
    let lineWidth = 0;
    for (const s of segs) {
      lineWidth += ctx.measureText(s.text).width;
    }
    if (lineWidth > maxWidth) maxWidth = lineWidth;
  }

  const padX = 22, padY = 14;
  const w = Math.max(96, Math.ceil(maxWidth + padX * 2));
  const h = Math.max(48, Math.ceil(parsedLines.length * lineHeight + padY * 2));

  canvas.width = w;
  canvas.height = h;

  // Fundo escuro semi-transparente arredondado (transparência aumentada em 50%)
  ctx.font = `bold ${fontSize}px "Segoe UI", Arial, sans-serif`;
  ctx.fillStyle = 'rgba(10, 12, 16, 0.36)';
  const r = 10;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(w - r, 0);
  ctx.quadraticCurveTo(w, 0, w, r);
  ctx.lineTo(w, h - r);
  ctx.quadraticCurveTo(w, h, w - r, h);
  ctx.lineTo(r, h);
  ctx.quadraticCurveTo(0, h, 0, h - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Desenha cada linha e segmento
  let y = padY + fontSize - 4;
  for (const segs of parsedLines) {
    let lineWidth = 0;
    for (const s of segs) lineWidth += ctx.measureText(s.text).width;
    let x = (w - lineWidth) / 2;

    for (const s of segs) {
      // Sombra para legibilidade perfeita
      ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
      ctx.fillText(s.text, x + 2, y + 2);

      ctx.fillStyle = s.color;
      ctx.fillText(s.text, x, y);
      x += ctx.measureText(s.text).width;
    }
    y += lineHeight;
  }

  return { canvas, width: w, height: h };
}

// Cria o nó 3D (Sprite) para visualização e interação no Three.js
export function createLabelNode(label) {
  const group = new THREE.Group();
  group.userData = { uid: label.uid, kind: 'labels', isLabel: true };

  const hex = labelColorToHex(label.color);
  const { canvas, width, height } = renderLabelCanvas(label.text, hex);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: !label.testLOS,
    depthWrite: false,
  });

  const sprite = new THREE.Sprite(mat);
  const userScale = (label.scale !== undefined && !isNaN(label.scale)) ? Math.max(0.2, Math.min(5.0, +label.scale)) : 1.0;
  const scaleMul = 0.0075 * userScale;
  sprite.scale.set(width * scaleMul, height * scaleMul, 1);
  sprite.position.set(0, 0, 0);
  sprite.userData = { uid: label.uid, kind: 'labels', isLabel: true, noPick: true };
  group.add(sprite);

  // Caixa invisível para clique e gizmo
  const hitGeo = new THREE.BoxGeometry(
    Math.max(0.6, width * scaleMul * 0.8),
    Math.max(0.6, height * scaleMul * 0.8),
    0.6
  );
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });
  const hitMesh = new THREE.Mesh(hitGeo, hitMat);
  hitMesh.userData = { uid: label.uid, kind: 'labels', isLabel: true };
  group.add(hitMesh);

  group.userData.sprite = sprite;
  group.userData.texture = texture;
  return group;
}
