// The project's spawn point (Singleplayer) is an item like the others (kind "spawns", at most one): it is selected, moved, turned,
// copied into the undo history and deleted with the editor's own tools. This only creates it and takes the camera to it.
import * as THREE from 'three';
import { app } from './common.js';

const r2 = (v) => Math.round(v * 100) / 100;
const heading = (dir) => ((Math.atan2(-dir.x, dir.y) * 180 / Math.PI) % 360 + 360) % 360;

export const spawnItem = () => (app.project?.mode === 'sp' ? app.project.spawns?.[0] || null : null);

// Where the camera is and which way it looks
export function cameraSpot() {
  const cam = app.vp.camera;
  const dir = cam.getWorldDirection(new cam.position.constructor());
  return { x: r2(cam.position.x), y: r2(cam.position.y), z: r2(cam.position.z), rz: r2(heading(dir)) };
}

export function createSpawn() {
  if (spawnItem()) return spawnItem();
  const created = app.project.add('spawns', cameraSpot(), 'Criar o local de spawn');
  app.editor.syncAll();
  return created;
}

// The camera goes behind the spawn point and it is selected (the gizmo appears)
export function focusSpawn() {
  const s = spawnItem();
  if (!s) return;
  for (const d of document.querySelectorAll('dialog[open]')) d.close();
  app.editor.syncAll();
  app.editor.select([s.uid]);
  app.vp.camera.position.set(s.x, s.y - 9, s.z + 5);
  app.vp.fly.lookAt(new THREE.Vector3(s.x, s.y, s.z + 1));
}
