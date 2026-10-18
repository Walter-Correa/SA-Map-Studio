// Suporte completo para Checkpoints (SetPlayerCheckpoint / CreateDynamicCP)
// e Race Checkpoints tipos 0 a 4 (SetPlayerRaceCheckpoint / CreateDynamicRaceCP).
import * as THREE from 'three';

export const RACE_CHECKPOINT_TYPES = [
  { id: 0, name: '0 - Normal (Cilindro com Seta)', desc: 'Cilindro vermelho no solo com seta apontando para o próximo ponto.' },
  { id: 1, name: '1 - Chegada / Finish (Cilindro Final)', desc: 'Cilindro vermelho de chegada no solo com interior de bandeira quadriculada.' },
  { id: 2, name: '2 - Sem Seta (Apenas Cilindro)', desc: 'Cilindro vermelho no solo parado, sem seta direcional no interior.' },
  { id: 3, name: '3 - Aéreo Normal (Argola com Seta)', desc: 'Argola/anel circular vermelho suspenso no ar com seta direcional para o próximo ponto.' },
  { id: 4, name: '4 - Aéreo Chegada (Argola Final)', desc: 'Argola/anel circular vermelho de chegada suspenso no ar com interior quadriculado.' },
];

let checkeredTexture = null;
function getCheckeredTexture() {
  if (checkeredTexture) return checkeredTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const size = 16;
  for (let y = 0; y < 128; y += size) {
    for (let x = 0; x < 128; x += size) {
      ctx.fillStyle = ((x / size + y / size) % 2 === 0) ? '#ffffff' : '#181818';
      ctx.fillRect(x, y, size, size);
    }
  }
  checkeredTexture = new THREE.CanvasTexture(canvas);
  checkeredTexture.wrapS = THREE.RepeatWrapping;
  checkeredTexture.wrapT = THREE.RepeatWrapping;
  checkeredTexture.repeat.set(4, 2);
  return checkeredTexture;
}

export function updateRaceCheckpointsChain(checkpoints = []) {
  if (!Array.isArray(checkpoints)) return;
  const raceCps = checkpoints.filter(c => c && (c.isRace || c.cpKind === 'race'));
  for (let i = 0; i < raceCps.length; i++) {
    const cp = raceCps[i];
    cp.isRace = true;
    if (i < raceCps.length - 1) {
      const nextCp = raceCps[i + 1];
      cp.hasNext = true;
      cp.nextx = nextCp.x;
      cp.nexty = nextCp.y;
      cp.nextz = nextCp.z;
    } else {
      // Último checkpoint da lista
      if (i > 0) {
        // Aponta para a frente, no mesmo sentido que aponta o checkpoint anterior a ele
        const prevCp = raceCps[i - 1];
        const fdx = cp.x - prevCp.x;
        const fdy = cp.y - prevCp.y;
        const fdz = cp.z - prevCp.z;
        const len = Math.hypot(fdx, fdy, fdz);
        if (len > 0.001) {
          const normDist = Math.max(15, Math.min(30, len));
          cp.nextx = cp.x + (fdx / len) * normDist;
          cp.nexty = cp.y + (fdy / len) * normDist;
          cp.nextz = cp.z + (fdz / len) * normDist;
        } else {
          cp.nextx = cp.x + 15;
          cp.nexty = cp.y;
          cp.nextz = cp.z;
        }
        cp.hasNext = true;
      } else {
        // Primeiro ou único checkpoint criado: aponta para a frente na horizontal, nunca fica sem seta ou direção
        if (cp.nextx === undefined || (cp.nextx === cp.x && cp.nexty === cp.y)) {
          cp.nextx = cp.x + 15;
          cp.nexty = cp.y;
          cp.nextz = cp.z;
        }
        cp.hasNext = true;
      }
    }
  }
}

export function createCheckpointNode(cp) {
  const group = new THREE.Group();
  const isRace = Boolean(cp.isRace || cp.cpKind === 'race');
  group.name = isRace ? `racecp_${cp.type}` : 'checkpoint';
  const radius = Math.max(0.5, (+cp.size || 4.0) * 0.5);
  const rType = Math.max(0, Math.min(4, cp.type | 0));
  const isAirRing = isRace && (rType === 3 || rType === 4);
  const hasNext = Boolean(cp.hasNext);

  // Direção para o próximo ponto (nextx, nexty, nextz)
  const dx = (cp.nextx ?? (cp.x + 15)) - (cp.x || 0);
  const dy = (cp.nexty ?? (cp.y || 0)) - (cp.y || 0);
  const dz = (cp.nextz ?? (cp.z || 0)) - (cp.z || 0);
  const dir = new THREE.Vector3(dx, dy, dz);
  if (dir.lengthSq() < 0.001) dir.set(1, 0, 0);
  dir.normalize();

  if (isAirRing) {
    // Argola aérea (Torus) suspensa no ar
    const ringHolder = new THREE.Group();
    const tube = Math.max(0.2, radius * 0.095);
    const torusGeo = new THREE.TorusGeometry(radius, tube, 16, 40);
    const torusMat = new THREE.MeshBasicMaterial({
      color: rType === 4 ? 0xff2233 : 0xff1111,
      transparent: true,
      opacity: 0.78,
      side: THREE.DoubleSide,
    });
    const torusMesh = new THREE.Mesh(torusGeo, torusMat);
    ringHolder.add(torusMesh);

    // Esfera central para clique e seleção
    const pickGeo = new THREE.SphereGeometry(Math.max(1.2, radius * 0.9), 12, 12);
    const pickMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0, depthWrite: false });
    const pickMesh = new THREE.Mesh(pickGeo, pickMat);
    ringHolder.add(pickMesh);

    if (rType === 3) {
      // Tipo 3: Argola normal com seta 3D apontando na direção do trajeto
      const arrow = buildDirectionArrow(radius * 0.65, 0xffbb00);
      arrow.rotation.x = Math.PI / 2;
      ringHolder.add(arrow);
    } else if (rType === 4) {
      // Tipo 4: Argola de chegada aérea preenchida com bandeira quadriculada
      const discGeo = new THREE.CircleGeometry(radius * 0.98, 36);
      const discMat = new THREE.MeshBasicMaterial({
        map: getCheckeredTexture(),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,
      });
      ringHolder.add(new THREE.Mesh(discGeo, discMat));
    }

    const lookMat = new THREE.Matrix4().lookAt(dir, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 1));
    ringHolder.quaternion.setFromRotationMatrix(lookMat);
    group.userData.ringHolder = ringHolder;
    group.add(ringHolder);
  } else {
    // Cilindro vertical no solo (Checkpoint comum ou Race Checkpoint 0, 1, 2)
    // Altura proporcional ao diâmetro do checkpoint
    const height = isRace ? Math.max(3.5, radius * 1.5) : Math.max(2.4, Math.min(18.0, radius * 1.6));
    const cylGeo = new THREE.CylinderGeometry(radius, radius, height, 32, 1, true);
    cylGeo.rotateX(Math.PI / 2);
    cylGeo.translate(0, 0, height * 0.5);

    const cylMat = new THREE.MeshBasicMaterial({
      color: isRace ? 0xff1a1a : 0xe62222,
      transparent: true,
      opacity: 0.44,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const cylMesh = new THREE.Mesh(cylGeo, cylMat);
    group.add(cylMesh);

    // Anel brilhante na base
    const ringGeo = new THREE.RingGeometry(Math.max(0.1, radius - 0.22), radius + 0.05, 36);
    ringGeo.translate(0, 0, 0.05);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff4444,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    group.add(new THREE.Mesh(ringGeo, ringMat));

    // Cilindro invisível para raycast
    const pickGeo = new THREE.CylinderGeometry(radius, radius, height, 16, 1, false);
    pickGeo.rotateX(Math.PI / 2);
    pickGeo.translate(0, 0, height * 0.5);
    const pickMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0, depthWrite: false });
    group.add(new THREE.Mesh(pickGeo, pickMat));

    if (isRace && rType === 0) {
      // Tipo 0: Seta direcional amarela no interior apontando para a direção do trajeto
      const arrow = buildDirectionArrow(Math.min(3.2, Math.max(1.3, radius * 0.68)), 0xffcc00);
      arrow.position.set(0, 0, Math.min(2.4, height * 0.45));
      const yaw = Math.atan2(dir.y, dir.x) - Math.PI / 2;
      arrow.rotation.z = yaw;
      group.userData.arrow = arrow;
      group.add(arrow);
    } else if (isRace && rType === 1) {
      // Tipo 1: Cilindro de chegada / Finish com textura de bandeira quadriculada no interior
      const flagCylGeo = new THREE.CylinderGeometry(radius * 0.72, radius * 0.72, height * 0.55, 24, 1, true);
      flagCylGeo.rotateX(Math.PI / 2);
      flagCylGeo.translate(0, 0, height * 0.45);
      const flagMat = new THREE.MeshBasicMaterial({
        map: getCheckeredTexture(),
        side: THREE.DoubleSide,
      });
      group.add(new THREE.Mesh(flagCylGeo, flagMat));

      // Disco horizontal com quadriculado no topo do núcleo
      const discGeo = new THREE.CircleGeometry(radius * 0.72, 24);
      discGeo.translate(0, 0, height * 0.72);
      group.add(new THREE.Mesh(discGeo, flagMat));
    }
  }

  group.userData.isCheckpoint = true;
  group.userData.kind = 'checkpoints';
  return group;
}

export function refreshCheckpointVisual(node, cp) {
  if (!node || !cp) return;
  const isRace = Boolean(cp.isRace || cp.cpKind === 'race');
  if (!isRace) return;
  const dx = (cp.nextx ?? (cp.x + 15)) - (cp.x || 0);
  const dy = (cp.nexty ?? (cp.y || 0)) - (cp.y || 0);
  const dz = (cp.nextz ?? (cp.z || 0)) - (cp.z || 0);
  const dir = new THREE.Vector3(dx, dy, dz);
  if (dir.lengthSq() < 0.001) dir.set(1, 0, 0);
  dir.normalize();

  if (node.userData.arrow) {
    const yaw = Math.atan2(dir.y, dir.x) - Math.PI / 2;
    node.userData.arrow.rotation.z = yaw;
  }
  if (node.userData.ringHolder) {
    const lookMat = new THREE.Matrix4().lookAt(dir, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 1));
    node.userData.ringHolder.quaternion.setFromRotationMatrix(lookMat);
  }
}

function buildDirectionArrow(len = 1.8, colorHex = 0xffcc00) {
  const arrowGroup = new THREE.Group();
  const shaftLen = len * 0.56;
  const headLen = len * 0.44;
  const shaftRadius = Math.max(0.09, len * 0.095);
  const headRadius = Math.max(0.24, len * 0.26);
  const mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.95 });

  // Aponta para +Y por padrão
  const shaftGeo = new THREE.CylinderGeometry(shaftRadius, shaftRadius, shaftLen, 12);
  shaftGeo.translate(0, -headLen * 0.5, 0);
  const headGeo = new THREE.ConeGeometry(headRadius, headLen, 14);
  headGeo.translate(0, shaftLen * 0.5, 0);

  arrowGroup.add(new THREE.Mesh(shaftGeo, mat));
  arrowGroup.add(new THREE.Mesh(headGeo, mat));
  return arrowGroup;
}
