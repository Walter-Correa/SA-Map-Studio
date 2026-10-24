// Markers of the Singleplayer doors (enex): yellow outside, blue inside, with an arrow where the player stands after going through.
import * as THREE from 'three';

const D2R = Math.PI / 180;
let group = null;

function nameSprite(text, color) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 64;
  const g = c.getContext('2d');
  g.font = 'bold 34px sans-serif';
  g.textAlign = 'center';
  g.fillStyle = 'rgba(0,0,0,.6)';
  g.fillRect(0, 8, 256, 48);
  g.fillStyle = color;
  g.fillText(text, 128, 44);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false, transparent: true }));
  sprite.scale.set(4, 1, 1);
  sprite.renderOrder = 10;
  sprite.userData.noPick = true;
  return sprite;
}

function marker(door, side) {
  const out = side === 'out';
  const css = out ? '#ffc83d' : '#4cc9f0';
  const hex = out ? 0xffc83d : 0x4cc9f0;
  const r = Math.max(0.5, +door.size || 1.5);
  const g = new THREE.Group();
  const at = door[side];
  g.position.set(at.x, at.y, at.z);
  g.rotation.z = (+at.rot || 0) * D2R; // 0 degrees = north; the arrow points where the player faces
  g.userData.doorUid = door.uid;
  g.userData.side = side;
  const tube = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r, 2.2, 28, 1, true),
    new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }));
  tube.rotation.x = Math.PI / 2; // the scene's up is Z
  tube.position.z = 1.1;
  tube.userData.noPick = true;
  g.add(tube);
  const ring = new THREE.Mesh(new THREE.RingGeometry(r * 0.85, r, 28), new THREE.MeshBasicMaterial({ color: hex, side: THREE.DoubleSide, depthWrite: false }));
  ring.position.z = 0.05;
  ring.userData.noPick = true;
  g.add(ring);
  // Arrow: where the player appears and which way they face (0 degrees = north)
  const arrow = new THREE.Group();
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1, 12), new THREE.MeshBasicMaterial({ color: hex }));
  cone.position.y = 1.9;
  cone.userData.noPick = true;
  arrow.add(cone);
  g.add(arrow);
  // The name is shared by the two sides (the game joins them by it): the inside one is shown as the exit
  const label = nameSprite(out ? (door.name || '?') : (door.name || '?').replace(/^ENT_/, 'EXT_'), css);
  label.position.z = 3.2;
  g.add(label);
  g.userData.noPick = true;
  return g;
}

// Rebuilds all the markers of the project's doors
export function showDoorMarkers(scene, doors) {
  if (group) {
    scene.remove(group);
    group.traverse((o) => { o.geometry?.dispose(); o.material?.map?.dispose(); o.material?.dispose(); });
    group = null;
  }
  if (!doors?.length) return;
  group = new THREE.Group();
  group.name = 'doors';
  group.userData.noPick = true;
  for (const d of doors) { group.add(marker(d, 'out')); group.add(marker(d, 'in')); }
  scene.add(group);
}
