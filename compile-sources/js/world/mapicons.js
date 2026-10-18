// Catálogo completo dos 64 MapIcons oficiais (SetPlayerMapIcon / CreateDynamicMapIcon)
// e renderização de marcadores no mapa 3D.
import * as THREE from 'three';

export const MAPICON_STYLES = [
  { id: 0, define: 'MAPICON_LOCAL', name: '0 - Local (Próximo ao jogador)' },
  { id: 1, define: 'MAPICON_GLOBAL', name: '1 - Global (Sempre visível no radar)' },
  { id: 2, define: 'MAPICON_LOCAL_CHECKPOINT', name: '2 - Local + Marcador no chão' },
  { id: 3, define: 'MAPICON_GLOBAL_CHECKPOINT', name: '3 - Global + Marcador no chão' },
];

export const MAP_ICONS = [
  { id: 0, name: 'Marcador Colorido (Dinâmico)', en: 'Colored Square/Triangle', desc: 'Aceita qualquer cor hexadecimal. Exibe quadrado no mesmo nível ou triângulo quando acima/abaixo.' },
  { id: 1, name: 'Quadrado Branco', en: 'White Square', desc: '2x maior que o ID 0 e sem borda.', warn: true },
  { id: 2, name: 'Posição do Jogador', en: 'Player position', desc: 'Seta padrão do jogador no minimapa.', warn: true },
  { id: 3, name: 'Jogador (Mapa do Menu)', en: 'Player (Menu Map)', desc: 'Ícone da posição do jogador no mapa do menu de pausa.' },
  { id: 4, name: 'Norte (N)', en: 'North', desc: 'Indicador do Norte no radar.', warn: true },
  { id: 5, name: 'Aeroporto / Pista de Pouso', en: 'Air Yard', desc: 'Ícone de avião / pista aérea.' },
  { id: 6, name: 'Ammu-Nation', en: 'Ammu-Nation', desc: 'Loja de armas Ammu-Nation.' },
  { id: 7, name: 'Barbearia', en: 'Barbers', desc: 'Salão de barbeiro / cabeleireiro.' },
  { id: 8, name: 'Big Smoke', en: 'Big Smoke', desc: 'Missões do Big Smoke (BS).' },
  { id: 9, name: 'Marina / Barcos', en: 'Boat Yard', desc: 'Ancoradouro / escola náutica.' },
  { id: 10, name: 'Burger Shot', en: 'Burger Shot', desc: 'Lanchonete Burger Shot.' },
  { id: 11, name: 'Pedreira (Quarry)', en: 'Quarry', desc: 'Hunter Quarry / escavadeira.' },
  { id: 12, name: 'Catalina', en: 'Catalina', desc: 'Missões da Catalina (C).' },
  { id: 13, name: 'Cesar Vialpando', en: 'Cesar', desc: 'Missões do Cesar (CV).' },
  { id: 14, name: "Cluckin' Bell", en: "Cluckin' Bell", desc: "Restaurante Cluckin' Bell." },
  { id: 15, name: 'Carl Johnson (CJ)', en: 'Carl Johnson', desc: 'Missões principais / CJ.' },
  { id: 16, name: 'C.R.A.S.H.', en: 'C.R.A.S.H', desc: 'Policiais corruptos Tenpenny & Pulaski (C).' },
  { id: 17, name: 'Restaurante / Diner', en: 'Diner', desc: 'Lanchonete / copo de refrigerante.' },
  { id: 18, name: 'Emmet', en: 'Emmet', desc: 'Armas do Emmet.' },
  { id: 19, name: 'Ataque Inimigo', en: 'Enemy Attack', desc: 'Guerra de gangues / ataque inimigo.' },
  { id: 20, name: 'Fogo / Bombeiros', en: 'Fire', desc: 'Incêndio / missão de bombeiro.' },
  { id: 21, name: 'Namorada', en: 'Girlfriend', desc: 'Coração / casa de namorada.' },
  { id: 22, name: 'Hospital', en: 'Hospital', desc: 'Cruz vermelha de hospital.' },
  { id: 23, name: 'Loco Syndicate', en: 'Loco', desc: 'Missões do Loco Syndicate.' },
  { id: 24, name: 'Madd Dogg', en: 'Madd Dogg', desc: 'Missões do Madd Dogg.' },
  { id: 25, name: "Caligula's Casino", en: "Caligula's", desc: "Cassino Caligula's Palace." },
  { id: 26, name: 'OG Loc (MC Strap)', en: 'MC Strap', desc: 'Ícone de microfone / OG Loc.' },
  { id: 27, name: 'Oficina de Tuning', en: 'Mod Garage', desc: 'TransFender / Loco Low Co / Wheel Arch Angels.' },
  { id: 28, name: 'OG Loc', en: 'OG Loc', desc: 'Missões do OG Loc (OG).' },
  { id: 29, name: 'Well Stacked Pizza Co.', en: 'Well Stacked Pizza Co', desc: 'Pizzaria Well Stacked Pizza.' },
  { id: 30, name: 'Polícia / Delegacia', en: 'Police', desc: 'Distintivo policial / delegacia.' },
  { id: 31, name: 'Propriedade à Venda (Verde)', en: 'Property for sale', desc: 'Casa/imóvel disponível para compra.' },
  { id: 32, name: 'Propriedade Indisponível (Vermelha)', en: 'Property not for sale', desc: 'Casa/imóvel não disponível.' },
  { id: 33, name: 'Corrida', en: 'Race', desc: 'Bandeira quadriculada de corrida.' },
  { id: 34, name: 'Ryder', en: 'Ryder', desc: 'Missões do Ryder (R).' },
  { id: 35, name: 'Salvar Jogo (Disquete)', en: 'Save House', desc: 'Esconderijo / ponto de salvamento.' },
  { id: 36, name: 'Auto-Escola / Escola', en: 'School', desc: 'Escola de direção / pilotagem (S).' },
  { id: 37, name: 'Mistério (?)', en: 'Mystery', desc: 'Ponto de interrogação.' },
  { id: 38, name: 'Sweet', en: 'Sweet', desc: 'Missões do Sweet (S).' },
  { id: 39, name: 'Estúdio de Tatuagem', en: 'Tattoo', desc: 'Loja de tatuagens.' },
  { id: 40, name: 'The Truth', en: 'The Truth', desc: 'Missões do The Truth (TT).' },
  { id: 41, name: 'Ponto de Referência (Waypoint)', en: 'Waypoint', desc: 'Alvo marcado pelo jogador no mapa.' },
  { id: 42, name: 'Rancho do Toreno', en: "Toreno's Ranch", desc: 'Missões do Mike Toreno (T).' },
  { id: 43, name: 'Tríades', en: 'Triads', desc: 'Missões das Tríades de San Fierro.' },
  { id: 44, name: 'Cassino Four Dragons', en: 'Triads Casino', desc: 'Cassino The Four Dragons.' },
  { id: 45, name: 'Loja de Roupas', en: 'Clothes Shop', desc: 'Camiseta (Binco, Sub Urban, ProLaps, Victim, Didier Sachs).' },
  { id: 46, name: 'Woozie (Wu Zi Mu)', en: 'Woozie', desc: 'Missões do Woozie (W).' },
  { id: 47, name: 'Zero', en: 'Zero', desc: 'Loja RC e missões do Zero (Z).' },
  { id: 48, name: 'Balada / Discoteca', en: 'Disco Date', desc: 'Clube de dança / boate.' },
  { id: 49, name: 'Bar / Bebida', en: 'Drinking Date', desc: 'Taça de bebida / bar.' },
  { id: 50, name: 'Restaurante', en: 'Restaurant', desc: 'Garfo e faca / restaurante.' },
  { id: 51, name: 'Caminhão / Frete', en: 'Trucking', desc: 'Missões de caminhoneiro (RS Haul).' },
  { id: 52, name: 'Dinheiro / Banco ($)', en: 'Robbery', desc: 'Símbolo de cifrão ($) usado para bancos, caixas e lojas.' },
  { id: 53, name: 'Troféu de Corrida', en: 'Race Tournament', desc: 'Taça / campeonato.' },
  { id: 54, name: 'Academia (Gym)', en: 'Gym', desc: 'Halteres de musculação / academia.' },
  { id: 55, name: 'Pátio / Exportação de Carros', en: 'Car Impound', desc: 'Ícone de carro.' },
  { id: 56, name: 'Luz / Ponto Amarelo', en: 'Light', desc: 'Marcador luminoso.', warn: true },
  { id: 57, name: 'Pista Aérea Próxima', en: 'Closest Airstrip', desc: 'Radar de pista de pouso.' },
  { id: 58, name: 'Varrios Los Aztecas', en: 'Varrios Los Aztecas', desc: 'Gangue Varrios Los Aztecas.' },
  { id: 59, name: 'Ballas', en: 'Ballas', desc: 'Gangue Ballas.' },
  { id: 60, name: 'Los Santos Vagos', en: 'Los Santos Vagos', desc: 'Gangue Los Santos Vagos.' },
  { id: 61, name: 'San Fierro Rifa', en: 'San Fierro Rifa', desc: 'Gangue San Fierro Rifa.' },
  { id: 62, name: 'Grove Street Families', en: 'Grove Street Families', desc: 'Gangue Grove Street Families.' },
  { id: 63, name: "Pay 'n' Spray", en: "Pay 'n' Spray", desc: "Oficina de pintura Pay 'n' Spray." },
];

export function getMapIconInfo(id) {
  return MAP_ICONS[id] || MAP_ICONS[0];
}

export function getMapIconUrl(id) {
  const safeId = Math.max(0, Math.min(63, id | 0));
  return `/cache/mapicons/icon${safeId}.gif`;
}

const iconTexCache = new Map();

export function createMapIconNode(mi) {
  const mType = Math.max(0, Math.min(63, (mi.type ?? mi.markertype ?? 0) | 0));
  const group = new THREE.Group();
  group.name = `mapicon_${mType}`;

  // Cria um sprite flutuante + haste vertical para visualização clara no mundo 3D
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;

  const drawBadge = (img) => {
    ctx.clearRect(0, 0, 64, 64);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.arc(32, 32, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3;
    if (mType === 0 && mi.color !== undefined) {
      const u = Number(mi.color) >>> 0;
      const r = (u >>> 24) & 0xFF, g = (u >>> 16) & 0xFF, b = (u >>> 8) & 0xFF;
      ctx.strokeStyle = `rgb(${r},${g},${b})`;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.stroke();
      ctx.fillRect(18, 18, 28, 28);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeRect(18, 18, 28, 28);
    } else {
      ctx.strokeStyle = '#f0a630';
      ctx.stroke();
      if (img) {
        ctx.drawImage(img, 12, 12, 40, 40);
      } else {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(mType), 32, 32);
      }
    }
    tex.needsUpdate = true;
  };

  drawBadge(null);
  if (mType > 0) {
    if (iconTexCache.has(mType)) {
      drawBadge(iconTexCache.get(mType));
    } else {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        iconTexCache.set(mType, img);
        drawBadge(img);
      };
      img.src = getMapIconUrl(mType);
    }
  }

  const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(2.8, 2.8, 1);
  sprite.position.set(0, 0, 2.4);
  sprite.renderOrder = 10;
  group.add(sprite);

  // Haste e base no chão
  const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8);
  poleGeo.rotateX(Math.PI / 2);
  poleGeo.translate(0, 0, 1.1);
  const poleMat = new THREE.MeshBasicMaterial({ color: 0xf0a630, transparent: true, opacity: 0.75 });
  group.add(new THREE.Mesh(poleGeo, poleMat));

  // Se o estilo for 2 ou 3 (MAPICON_*_CHECKPOINT), desenha também o marcador vermelho no chão
  if (mi.style === 2 || mi.style === 3) {
    const cpGeo = new THREE.CylinderGeometry(1.2, 1.2, 1.6, 24, 1, true);
    cpGeo.rotateX(Math.PI / 2);
    cpGeo.translate(0, 0, 0.8);
    const cpMat = new THREE.MeshBasicMaterial({ color: 0xff2222, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false });
    group.add(new THREE.Mesh(cpGeo, cpMat));
  }

  // Esfera invisível para seleção por clique no mundo 3D
  const pickGeo = new THREE.CylinderGeometry(1.1, 1.1, 3.2, 12);
  pickGeo.rotateX(Math.PI / 2);
  pickGeo.translate(0, 0, 1.6);
  const pickMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0, depthWrite: false });
  group.add(new THREE.Mesh(pickGeo, pickMat));

  group.userData.isMapIcon = true;
  group.userData.kind = 'mapIcons';
  return group;
}

// Gera o nome sequencial na duplicação: MapIcon 1 > MapIcon 1_2 > MapIcon 1_3
export function getNextMapIconName(origName, existingIcons = []) {
  const baseRaw = (origName || 'MapIcon 1').trim();
  const m = baseRaw.match(/^(.*?)_(\d+)$/);
  let prefix = baseRaw;
  let nextNum = 2;
  if (m) {
    prefix = m[1];
    nextNum = parseInt(m[2], 10) + 1;
  }
  let candidate = `${prefix}_${nextNum}`;
  const existingNames = new Set(existingIcons.map(mi => (mi.comment || mi.name || '').trim()));
  while (existingNames.has(candidate)) {
    nextNum++;
    candidate = `${prefix}_${nextNum}`;
  }
  return candidate;
}
