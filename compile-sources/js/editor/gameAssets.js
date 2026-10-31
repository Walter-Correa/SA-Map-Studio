// Images made from the game files, on the first run.
// The sprites of the TextDraw editor and the radar icons are not shipped with the editor: when the GTA folder is set and
// they are missing, they are drawn from the game's own TXDs in a Worker (world/textures.worker.js) and saved to the
// data folder, from where /cache serves them. It runs once: next time the status already lists them all.
import { TEXTDRAW_SPRITES } from '../data/sprites.js';

// Resolves when everything is drawn (right away when nothing is missing). onProgress(text, fraction) feeds the loading screen.
export async function prepareGameAssets(onProgress = () => {}) {
  let status;
  try { status = await (await fetch('/api/assets/status')).json(); } catch { return; }
  if (status.done) return;
  const haveSprite = new Set(status.sprites);
  const haveIcon = new Set(status.mapicons);
  const sprites = TEXTDRAW_SPRITES
    .map(sp => ({ lib: sp.lib, name: sp.name, path: String(sp.thumb || '').replace(/^\/cache\//, '') }))
    .filter(sp => /^sprites\/[^/]+\/[^/]+\.png$/.test(sp.path) && !haveSprite.has(sp.path.slice('sprites/'.length, -4).toLowerCase()));
  const mapicons = Array.from({ length: 64 }, (_, i) => i).filter(i => !haveIcon.has(i));
  if (!sprites.length && !mapicons.length) { fetch('/api/assets/done', { method: 'POST' }).catch(() => {}); return; }
  const text = 'Preparando as imagens do jogo (só na primeira vez)...';
  onProgress(text, 0);
  const worker = new Worker(new URL('../world/textures.worker.js', import.meta.url), { type: 'module' });
  await new Promise((resolve) => {
  worker.onmessage = (ev) => {
    if (ev.data.type === 'assets-progress') { onProgress(text, ev.data.done / Math.max(1, ev.data.total)); return; }
    if (ev.data.type !== 'assets-done') return;
    worker.terminate();
    // Pictures of the page that were asked for before they were drawn load again
    document.querySelectorAll('img').forEach(img => {
      if (/\/cache\/(sprites|mapicons)\//.test(img.currentSrc || img.src) && img.complete && !img.naturalWidth) img.src = (img.getAttribute('src') || '').split('?')[0] + '?r=' + Date.now();
    });
    window.dispatchEvent(new CustomEvent('game-assets-ready'));
    // Marks the drawing as made for this GTA folder: what the game does not have is not tried again at every start
    fetch('/api/assets/done', { method: 'POST' }).catch(() => {}).finally(resolve);
  };
  // A worker that fails (or hangs) must never keep the editor from opening
  worker.onerror = () => resolve();
  setTimeout(resolve, 180000);
  worker.postMessage({ base: location.origin + '/gta/' });
  worker.postMessage({ type: 'assets', sprites, mapicons });
  });
}
