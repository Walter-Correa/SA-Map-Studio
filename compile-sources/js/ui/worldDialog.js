// Singleplayer world settings: the spawn point of the player, fixed weather and fixed time of the day.
import { app, $ } from './common.js';
import { makeWorld } from '../editor/project.js';
import { spawnItem, createSpawn, focusSpawn, cameraSpot } from './spawnPoint.js';

function world() {
  return app.project.world || (app.project.world = makeWorld(null));
}

function render() {
  const w = world();
  const s = spawnItem();
  for (const [id, k] of [['#wsX', 'x'], ['#wsY', 'y'], ['#wsZ', 'z'], ['#wsRot', 'rz']]) { $(id).value = s ? s[k] : ''; $(id).disabled = !s; }
  $('#wsSpawnAdd').hidden = !!s;
  for (const id of ['#wsSpawnMove', '#wsHere', '#wsSpawnDel']) $(id).hidden = !s;
  $('#wsSpawnNote').textContent = s
    ? 'Qualquer jogo salvo que for carregado começa aqui, olhando para onde a seta aponta. Remova o local de spawn para o jogador voltar ao ponto do save.'
    : 'Sem local de spawn, o jogador começa onde o jogo salvo estava.';
  $('#wsWeatherOn').checked = w.weather >= 0;
  $('#wsWeather').value = w.weather >= 0 ? w.weather : 10;
  $('#wsWeather').disabled = w.weather < 0;
  $('#wsHourOn').checked = w.hour >= 0;
  $('#wsTime').value = `${String(Math.max(0, w.hour)).padStart(2, '0')}:${String(w.minute || 0).padStart(2, '0')}`;
  $('#wsTime').disabled = w.hour < 0;
}

function save() {
  const w = world();
  const s = spawnItem();
  if (s) {
    const v = (id, d) => (Number.isFinite(parseFloat($(id).value)) ? parseFloat($(id).value) : d);
    const next = { x: v('#wsX', s.x), y: v('#wsY', s.y), z: v('#wsZ', s.z), rz: ((v('#wsRot', s.rz) % 360) + 360) % 360 };
    if (Object.keys(next).some(k => next[k] !== s[k])) { app.project.updateItems('Editar o local de spawn', [s.uid], (o) => Object.assign(o, next)); app.editor.syncAll(); }
  }
  w.weather = $('#wsWeatherOn').checked ? Math.max(0, Math.min(45, parseInt($('#wsWeather').value, 10) || 0)) : -1;
  const [h, m] = ($('#wsTime').value || '10:00').split(':').map(n => parseInt(n, 10) || 0);
  w.hour = $('#wsHourOn').checked ? h : -1;
  w.minute = m;
  app.project.touch('world');
}

export function initWorldDialog() {
  const dlg = $('#dlgWorld');
  $('#btnWorld').onclick = () => { render(); dlg.showModal(); };
  $('#worldClose').onclick = () => dlg.close();
  dlg.addEventListener('change', () => { save(); render(); });
  $('#wsSpawnAdd').onclick = () => { createSpawn(); render(); };
  $('#wsHere').onclick = () => {
    const s = spawnItem();
    if (!s) return;
    app.project.updateItems('Editar o local de spawn', [s.uid], (o) => Object.assign(o, cameraSpot()));
    app.editor.syncAll();
    render();
  };
  $('#wsSpawnDel').onclick = () => {
    const s = spawnItem();
    if (!s) return;
    app.project.deleteItems('Apagar o local de spawn', [s.uid]);
    app.editor.syncAll();
    render();
  };
  $('#wsSpawnMove').onclick = () => focusSpawn();
}
