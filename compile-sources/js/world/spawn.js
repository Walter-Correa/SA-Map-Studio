// The 3D marker of the spawn point (Singleplayer): a green tube on the ground and an arrow for the way the player faces (0 degrees = north).
import * as THREE from 'three';

export function createSpawnNode(o) {
  const hex = 0x7bff6b;
  const g = new THREE.Group();
  g.rotation.order = 'ZXY';
  g.userData = { uid: o.uid, kind: 'spawns', isSpawn: true };
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 2.2, 28, 1, true), new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }));
  tube.rotation.x = Math.PI / 2; tube.position.z = 1.1;
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.75, 0.9, 28), new THREE.MeshBasicMaterial({ color: hex, side: THREE.DoubleSide, depthWrite: false }));
  ring.position.z = 0.05;
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1, 12), new THREE.MeshBasicMaterial({ color: hex }));
  cone.position.y = 1.9;
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8), new THREE.MeshBasicMaterial({ color: hex }));
  stem.position.y = 1.0;
  const c = document.createElement('canvas');
  c.width = 256; c.height = 64;
  const ctx = c.getContext('2d');
  ctx.font = 'bold 34px sans-serif'; ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(0, 8, 256, 48);
  ctx.fillStyle = '#7bff6b'; ctx.fillText('SPAWN', 128, 44);
  const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false, transparent: true }));
  label.scale.set(4, 1, 1); label.position.z = 3.2; label.renderOrder = 10;
  g.add(tube, ring, stem, cone, label);
  return g;
}
