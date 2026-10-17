// Suporte completo para Checkpoints (SetPlayerCheckpoint / CreateDynamicCP)
// e Race Checkpoints tipos 0 a 4 (SetPlayerRaceCheckpoint / CreateDynamicRaceCP).
import * as THREE from 'three';

export const RACE_CHECKPOINT_TYPES = [
  { id: 0, name: '0 - Normal (Cilindro com Seta)', desc: 'Cilindro vermelho no solo com seta apontando para o próximo ponto (nextx, nexty, nextz).' },
  { id: 1, name: '1 - Chegada / Finish (Cilindro Final)', desc: 'Cilindro vermelho de chegada no solo com ícone de bandeira quadriculada.' },
  { id: 2, name: '2 - Sem Seta (Apenas Cilindro)', desc: 'Cilindro vermelho no solo parado, sem seta direcional no interior.' },
  { id: 3, name: '3 - Aéreo Normal (Anel com Seta)', desc: 'Anel circular vermelho suspenso no ar (para aeronaves) com seta direcional.' },
  { id: 4, name: '4 - Aéreo Chegada (Anel Final)', desc: 'Anel circular vermelho de chegada suspenso no ar.' },
];

export function createCheckpointNode(cp) {
  const group = new THREE.Group();
  group.name = cp.isRace ? `racecp_${cp.type}` : 'checkpoint';
  const radius = Math.max(0.5, (+cp.size || 4.0) * 0.5);
  const isRace = Boolean(cp.isRace);
  const rType = Math.max(0, Math.min(4, cp.type | 0));
  const isAirRing = isRace && (rType === 3 || rType === 4);

  // Direção para nextx, nexty, nextz (para tipos com seta ou anel aéreo)
  const dx = (cp.nextx ?? (cp.x + 15)) - (cp.x || 0);
  const dy = (cp.nexty ?? (cp.y || 0)) - (cp.y || 0);
  const dz = (cp.nextz ?? (cp.z || 0)) - (cp.z || 0);
  const dir = new THREE.Vector3(dx, dy, dz);
  if (dir.lengthSq() < 0.001) dir.set(1, 0, 0);
  dir.normalize();

  if (isAirRing) {
    // Anel aéreo (Torus) orientado na direção do próximo ponto
    const ringHolder = new THREE.Group();
    const tube = Math.max(0.18, radius * 0.09);
    const torusGeo = new THREE.TorusGeometry(radius, tube, 14, 36);
    const torusMat = new THREE.MeshBasicMaterial({
      color: rType === 4 ? 0xff2244 : 0xff1111,
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide,
    });
    const torusMesh = new THREE.Mesh(torusGeo, torusMat);
    ringHolder.add(torusMesh);

    // Esfera invisível central para facilitar seleção por clique no ar
    const pickGeo = new THREE.SphereGeometry(Math.max(1.2, radius * 0.85), 12, 12);
    const pickMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0, depthWrite: false });
    const pickMesh = new THREE.Mesh(pickGeo, pickMat);
    ringHolder.add(pickMesh);

    if (rType === 3) {
      const arrow = buildDirectionArrow(radius * 0.55, 0xffaa00);
      // Aponta no eixo +Z do ringHolder (que olha para dir)
      arrow.rotation.x = Math.PI / 2;
      ringHolder.add(arrow);
    } else {
      // Centro de chegada
      const coreGeo = new THREE.OctahedronGeometry(Math.max(0.5, radius * 0.28), 0);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: false, transparent: true, opacity: 0.85 });
      ringHolder.add(new THREE.Mesh(coreGeo, coreMat));
    }

    const lookMat = new THREE.Matrix4().lookAt(dir, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 1));
    ringHolder.quaternion.setFromRotationMatrix(lookMat);
    group.add(ringHolder);
  } else {
    // Cilindro vertical no solo (Checkpoint comum ou Race Checkpoint 0, 1, 2)
    const height = isRace ? Math.max(3.5, radius * 1.4) : Math.max(2.6, radius * 1.1);
    const cylGeo = new THREE.CylinderGeometry(radius, radius, height, 32, 1, true);
    // CylinderGeometry no Three.js é alinhado ao eixo Y; giramos X em 90 graus para alinhar ao eixo Z do GTA
    cylGeo.rotateX(Math.PI / 2);
    cylGeo.translate(0, 0, height * 0.5);

    const cylMat = new THREE.MeshBasicMaterial({
      color: isRace ? 0xff1818 : 0xe61919,
      transparent: true,
      opacity: 0.42,
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

    // Cilindro fechado invisível para facilitar o clique (raycast)
    const pickGeo = new THREE.CylinderGeometry(radius, radius, height, 16, 1, false);
    pickGeo.rotateX(Math.PI / 2);
    pickGeo.translate(0, 0, height * 0.5);
    const pickMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0, depthWrite: false });
    group.add(new THREE.Mesh(pickGeo, pickMat));

    if (isRace && rType === 0) {
      const arrow = buildDirectionArrow(Math.min(2.8, Math.max(1.2, radius * 0.65)), 0xffcc00);
      arrow.position.set(0, 0, Math.min(2.2, height * 0.45));
      const yaw = Math.atan2(dir.y, dir.x) - Math.PI / 2;
      arrow.rotation.z = yaw;
      group.add(arrow);
    } else if (isRace && rType === 1) {
      const finish = new THREE.Mesh(
        new THREE.OctahedronGeometry(Math.min(1.4, Math.max(0.5, radius * 0.32)), 0),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.88 })
      );
      finish.position.set(0, 0, Math.min(2.2, height * 0.45));
      group.add(finish);
    }
  }

  group.userData.isCheckpoint = true;
  group.userData.kind = 'checkpoints';
  return group;
}

function buildDirectionArrow(len = 1.8, colorHex = 0xffcc00) {
  const arrowGroup = new THREE.Group();
  const shaftLen = len * 0.58;
  const headLen = len * 0.42;
  const shaftRadius = Math.max(0.08, len * 0.09);
  const headRadius = Math.max(0.22, len * 0.24);
  const mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.9 });

  // Aponta para +Y por padrão
  const shaftGeo = new THREE.CylinderGeometry(shaftRadius, shaftRadius, shaftLen, 12);
  shaftGeo.translate(0, -headLen * 0.5, 0);
  const headGeo = new THREE.ConeGeometry(headRadius, headLen, 14);
  headGeo.translate(0, shaftLen * 0.5, 0);

  arrowGroup.add(new THREE.Mesh(shaftGeo, mat));
  arrowGroup.add(new THREE.Mesh(headGeo, mat));
  return arrowGroup;
}
