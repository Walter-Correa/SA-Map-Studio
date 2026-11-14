// Export, import (any format) and in-game map test dialogs.
import * as THREE from 'three';
import { exportPwn, exportIpl, sanitizeIdent, projectCenter } from '../editor/pwn.js';
import { quatOfItem } from '../editor/editor.js';
import { importAny, sampMissing, sampInstalled } from '../editor/importers.js';
import { t, tFallback, getLanguage } from './i18n.js';
import { Project, clampPbSegmentScale, makeDoor, makeCustomModel, makeWorld, newDoorName, normalizeCameras, prepareImportItems, textDrawNative, fitPbBorder, clampPbBlinkInterval, clampPbBlinkDuration, pbMinOf, clampPbLerpMs, clampPbLabelText, PB_LABEL_DEFAULT } from '../editor/project.js';
import { tdfxMapLine } from '../editor/tdfx.js';
import { isText, keepsTexture, parseColor } from '../editor/materials.js';
import { positionCameraOverProject, switchTo, uniqueName } from './projects.js';
import { toSingleplayerImport, isSampModel } from './singleplayer.js';
import { app, $, esc, plural, store, toast, copyText, postJSON } from './common.js';

// =====================================================================  exportar
export function setupExport() {
  const dlg = $('#dlgExport');
  const saved = store.get('export', {});
  if (saved.fn) $(`input[name="exFn"][value="${saved.fn}"]`).checked = true;
  if (saved.layout) $(`input[name="exLayout"][value="${saved.layout}"]`).checked = true;
  for (const [k, id] of [['removed', '#exRemoved'], ['vehicles', '#exVehicles'], ['cameras', '#exCameras'], ['ansi', '#exAnsi'], ['array', '#exArray']]) if (saved[k] !== undefined && $(id)) $(id).checked = saved[k];
  const gen = () => {
    const project = app.project;
    const format = $('input[name="exFormat"]:checked').value;
    const opt = {
      objectFn: $('input[name="exFn"]:checked').value,
      layout: $('input[name="exLayout"]:checked').value,
      includeRemoved: $('#exRemoved').checked,
      includeVehicles: $('#exVehicles').checked,
      includeCameras: $('#exCameras').checked,
      relative: $('#exRelative').checked,
      exportArray: $('#exArray')?.checked || false,
    };
    store.set('export', { fn: opt.objectFn, layout: opt.layout, removed: opt.includeRemoved, vehicles: opt.includeVehicles, cameras: opt.includeCameras, ansi: $('#exAnsi').checked, array: opt.exportArray });
    $('#pwnOptions').hidden = format !== 'pwn';
    const text = format === 'pwn' ? exportPwn(project, opt) : exportIpl(project, (o) => quatOfItem(o), (id) => app.gd.models.get(id)?.model || 'desconhecido');
    $('#exportText').value = text;
    const mats = project.objects.reduce((s, o) => s + (o.materials || []).length, 0);
    const c = project.cameras;
    $('#exportStats').innerHTML = [plural(project.objects.length, 'objeto', 'objetos'), plural(mats, 'troca de material', 'trocas de material'),
      plural(project.vehicles.length, 'veículo', 'veículos'), plural(project.removed.length, 'objeto removido', 'objetos removidos'),
      plural(c.shots.length + c.paths.length, 'câmera', 'câmeras'), plural(text.split('\n').length - 1, 'linha', 'linhas')].map(s => `<span>${s}</span>`).join('');
    dlg.dataset.ext = format;
    $('#exportNote').textContent = format === 'ipl' ? 'O IPL não guarda veículos, remoções, trocas de textura nem câmeras.' : '';
  };
  dlg.addEventListener('change', (e) => {
    if (e.target.id === 'exportText') return;
    gen();
  });
  $('#btnExport').onclick = () => { gen(); dlg.showModal(); };
  const fileName = () => sanitizeIdent(app.project.name).toLowerCase() + '.' + (dlg.dataset.ext === 'ipl' ? 'ipl' : 'pwn');
  $('#exCopy').onclick = async () => { await copyText($('#exportText').value); toast('Código copiado'); };
  $('#exDownload').onclick = () => {
    const blob = new Blob([$('#exportText').value.replace(/\n/g, '\r\n')], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = fileName(); a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  $('#exSave').onclick = async () => {
    const data = await postJSON('/api/export', { filename: fileName(), content: $('#exportText').value, ansi: $('#exAnsi').checked });
    if (data.ok) toast(`Salvo em ${data.path}`, 'ok', 6000); else toast(data.error || 'Erro ao salvar', 'error');
  };
}

// =====================================================================  importar
// The Singleplayer settings of an imported project: doors, models of its own, textures replaced in the whole map, world and game data.
// Into a new or replaced project they all come; merged into another one they are added, and what is already there stays
function importSpExtras(p, parsed, merge, clone) {
  if (!merge) {
    p.doors = (parsed.doors || []).map(d => makeDoor(clone(d)));
    p.customModels = (parsed.customModels || []).map(m => makeCustomModel(clone(m)));
    p.retex = clone(parsed.retex || []);
    p.handling = clone(parsed.handling || {});
    p.weapons = clone(parsed.weapons || {});
    p.drawDist = clone(parsed.drawDist || {});
    p.world = makeWorld(clone(parsed.world || {}));
    return;
  }
  for (const d of parsed.doors || []) {
    const door = makeDoor({ ...clone(d), uid: undefined });
    door.name = newDoorName(p.doors, door.name);
    p.doors.push(door);
  }
  const taken = new Set(p.customModels.map(m => m.id));
  for (const m of parsed.customModels || []) if (!taken.has(m.id)) p.customModels.push(makeCustomModel(clone(m)));
  for (const r of parsed.retex || []) if (!p.retex.some(x => x.txd === r.txd && x.name === r.name)) p.retex.push(clone(r));
  for (const k of ['handling', 'weapons', 'drawDist']) for (const [key, v] of Object.entries(parsed[k] || {})) if (!(key in p[k])) p[k][key] = clone(v);
  const w = makeWorld(clone(parsed.world || {})), cur = p.world;
  if (cur.weather < 0) cur.weather = w.weather;
  if (cur.hour < 0) { cur.hour = w.hour; cur.minute = w.minute; }
}

export function setupImport() {
  const dlg = $('#dlgImport');
  let parsed = null, fileBytes = null, fileName = '';
  const summary = $('#importSummary');
  const readSqlite = async (bytes) => {
    const res = await fetch('/api/import/sqlite', { method: 'POST', body: bytes });
    return res.json();
  };
  const show = () => {
    if (!parsed) { summary.innerHTML = ''; $('#importGo').disabled = true; return; }
    const objs = parsed.objects || [];
    const mats = objs.reduce((s, o) => s + (o.materials || []).length, 0);
    const texts = objs.reduce((s, o) => s + (o.materials || []).filter(isText).length, 0);
    const unknown = objs.filter(o => !app.gd.models.has(o.model)).length;
    const cams = (parsed.cameras?.shots?.length || 0) + (parsed.cameras?.paths?.length || 0);
    const actors = parsed.actors || [];
    const labels = parsed.labels || [];
    const pickups = parsed.pickups || [];
    const gangZones = parsed.gangZones || [];
    const checkpoints = parsed.checkpoints || [];
    const mapIcons = parsed.mapIcons || [];
    const textDraws = parsed.textDraws || [];
    const sp = app.project.mode === 'sp';
    const spExtra = sp ? (parsed.spawns?.length || 0) + (parsed.doors?.length || 0) + (parsed.customModels?.length || 0) + (parsed.retex?.length || 0) + Object.keys(parsed.handling || {}).length + Object.keys(parsed.weapons || {}).length + Object.keys(parsed.drawDist || {}).length : 0;
    const total = spExtra + objs.length + (parsed.vehicles || []).length + actors.length + (parsed.removed || []).length + cams + labels.length + pickups.length + gangZones.length + checkpoints.length + mapIcons.length + textDraws.length;
    const parts = sp ? [plural(objs.length, 'objeto', 'objetos'), plural(mats - texts, 'textura trocada', 'texturas trocadas'), plural((parsed.vehicles || []).length, 'veículo', 'veículos'), plural(actors.length, 'actor', 'actors'), plural(pickups.length, 'pickup', 'pickups'), plural((parsed.removed || []).length, 'objeto removido', 'objetos removidos')]
      : [plural(objs.length, 'objeto', 'objetos'), plural(mats - texts, 'textura trocada', 'texturas trocadas'), plural(texts, 'texto', 'textos'),
      plural((parsed.vehicles || []).length, 'veículo', 'veículos')];
    if (!sp && actors.length) parts.push(plural(actors.length, 'actor', 'actors'));
    if (sp) {
      if (parsed.spawns?.length) parts.push('1 local de spawn');
      if (parsed.doors?.length) parts.push(plural(parsed.doors.length, 'entrada e saída', 'entradas e saídas'));
      if (parsed.customModels?.length) parts.push(plural(parsed.customModels.length, 'modelo próprio', 'modelos próprios'));
      if (parsed.retex?.length) parts.push(plural(parsed.retex.length, 'textura trocada no mapa todo', 'texturas trocadas no mapa todo'));
      const gd = Object.keys(parsed.handling || {}).length + Object.keys(parsed.weapons || {}).length + Object.keys(parsed.drawDist || {}).length;
      if (gd) parts.push(plural(gd, 'ajuste de dados do jogo', 'ajustes de dados do jogo'));
    }
    if (labels.length) parts.push(plural(labels.length, 'texto 3D', 'textos 3D'));
    if (pickups.length) parts.push(plural(pickups.length, 'pickup', 'pickups'));
    if (gangZones.length) parts.push(plural(gangZones.length, 'gangzone', 'gangzones'));
    if (checkpoints.length) parts.push(plural(checkpoints.length, 'checkpoint', 'checkpoints'));
    if (mapIcons.length) parts.push(plural(mapIcons.length, 'mapicon', 'mapicons'));
    if (textDraws.length) parts.push(plural(textDraws.length, 'textdraw', 'textdraws'));
    if (!sp) parts.push(plural((parsed.removed || []).length, 'objeto removido', 'objetos removidos'), plural(cams, 'câmera', 'câmeras'));
    summary.innerHTML = total
      ? `<div><span class="tag">${esc(parsed.format)}</span> Encontrei ${parts.map(p => `<b>${p}</b>`).join(', ')}.</div>
         ${unknown ? `<div class="warn">${plural(unknown, 'objeto usa', 'objetos usam')} modelos que não existem no seu jogo (aparecem só como contorno tracejado).</div>` : ''}
         ${sp && parsed.unknownModels ? `<div class="warn">${plural(parsed.unknownModels, 'objeto usa', 'objetos usam')} modelos que não existem no jogo original e foram ignorados.</div>` : ''}
         ${sp && parsed.ignored?.length ? `<div class="warn">Sem suporte no Singleplayer, ignorado: ${parsed.ignored.join(', ')}.</div>` : ''}
         ${parsed.notes.map(n => `<div class="warn">${esc(n)}</div>`).join('')}`
      : (parsed.notes.length ? parsed.notes.map(n => `<div class="warn">${esc(n)}</div>`).join('') : ($('#importText').value.trim() || fileBytes ? 'Não encontrei nenhum mapa nesse conteúdo.' : ''));
    $('#importGo').disabled = !total;
  };
  const analyzeBytes = async (bytes, name) => {
    summary.textContent = 'Analisando';
    try {
      parsed = await importAny(bytes, { filename: name, gd: app.gd, readSqlite });
      // The objects of SA-MP: without SA-MP in the game folder they are not loaded; with it, a Singleplayer project takes them as mod objects
      const sampLost = sampMissing(parsed.objects, app.gd, parsed.sampSkipped || 0);
      const sampMod = app.project.mode === 'sp' && sampInstalled(app.gd) ? parsed.objects.filter(o => isSampModel(app.gd.models.get(o.model))).length : 0;
      if (app.project.mode === 'sp') parsed = toSingleplayerImport(parsed);
      if (sampLost) parsed.notes = [...(parsed.notes || []), t('Objetos do SA-MP não carregados porque o SA-MP não está instalado: {0}.', sampLost)];
      if (sampMod) parsed.notes = [...(parsed.notes || []), t('Objetos do SA-MP carregados como objetos do mod: {0}.', sampMod)];
    }
    catch (err) { parsed = null; summary.textContent = `Não consegui ler esse arquivo: ${err.message}`; return; }
    show();
  };
  let t;
  $('#importText').addEventListener('input', () => {
    fileBytes = null; fileName = ''; $('#importFileName').textContent = '';
    clearTimeout(t);
    t = setTimeout(() => analyzeBytes(new TextEncoder().encode($('#importText').value), ''), 250);
  });
  const takeFile = async (f) => {
    if (!f) return;
    fileBytes = new Uint8Array(await f.arrayBuffer());
    fileName = f.name;
    $('#importFileName').textContent = `${f.name} (${(f.size / 1024).toFixed(1)} KB)`;
    $('#importText').value = '';
    await analyzeBytes(fileBytes, fileName);
  };
  $('#importFile').addEventListener('change', async (e) => { await takeFile(e.target.files[0]); e.target.value = ''; });
  const drop = $('#importDrop');
  drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('over'));
  drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('over'); takeFile(e.dataTransfer.files[0]); });
  // Dropping a file anywhere in the window also opens the import
  window.addEventListener('dragover', (e) => { if (e.dataTransfer?.types?.includes('Files')) e.preventDefault(); });
  window.addEventListener('drop', (e) => {
    if (dlg.open || !e.dataTransfer?.files?.length) return;
    e.preventDefault();
    open(); takeFile(e.dataTransfer.files[0]);
  });
  const open = () => {
    parsed = null; fileBytes = null; $('#importText').value = ''; $('#importFileName').textContent = '';
    // Replace and merge always start unchecked: the choice applies only to that import
    for (const id of ['#importReplace', '#importMerge']) { const c = $(id); if (c) c.checked = false; }
    show(); if (!dlg.open) dlg.showModal();
  };
  $('#btnImport').onclick = () => { open(); $('#importText').focus(); };
  // Replace and merge do not work together: checking one unchecks the other
  const optReplace = $('#importReplace'), optMerge = $('#importMerge');
  if (optReplace && optMerge) {
    optReplace.addEventListener('change', () => { if (optReplace.checked) optMerge.checked = false; });
    optMerge.addEventListener('change', () => { if (optMerge.checked) optReplace.checked = false; });
  }
  $('#importGo').onclick = async () => {
    if (!parsed) return;
    const replace = $('#importReplace').checked;
    const merge = !replace && $('#importMerge')?.checked;
    const projName = parsed.name || (fileName ? fileName.replace(/\.[^/.]+$/, '').trim() : '');
    // Neither replace nor merge: the current project is saved and closed and the import becomes a new project.
    // Merge: the items go into the open project, which keeps the name and header it already had.
    if (!replace && !merge) {
      $('#importGo').disabled = true;
      try { await switchTo(new Project(await uniqueName(projName || 'Mapa importado'))); }
      finally { $('#importGo').disabled = false; }
    }
    const project = app.project, ed = app.editor;
    // Deep copy: what was read stays intact (it can be imported again) and nothing is shared
    const clone = (o) => JSON.parse(JSON.stringify(o));
    const sp = project.mode === 'sp';
    const KIND_LISTS = ['objects', 'vehicles', 'actors', 'removed', 'labels', 'pickups', 'gangZones', 'checkpoints', 'mapIcons', 'textDraws', ...(sp ? ['spawns'] : [])];
    // A project has at most one spawn point: when merging into one that has it, the one that was there stays
    const kept = (k) => (k === 'spawns' && merge && project.spawns?.length ? [] : (parsed[k] || []));
    const items = prepareImportItems(KIND_LISTS.flatMap(k => kept(k).map(o => ({ ...clone(o), kind: k }))));
    const removeUids = replace ? KIND_LISTS.flatMap(k => (project[k] || []).map(o => o.uid)) : [];
    const header = parsed.pwnHeader || parsed.preservedHeader || '';
    const cams = parsed.cameras ? normalizeCameras(parsed.cameras) : null;
    // A single undo/redo step: items, header, original code and cameras
    project.importItems(`Importar ${items.length} itens`, removeUids, items, (p) => {
      if (merge) {
        if (header && !p.pwnHeader) p.pwnHeader = header;
        if (parsed.rawPawn && !p.rawPawn) p.rawPawn = parsed.rawPawn;
      } else {
        if (header) p.pwnHeader = header;
        if (parsed.rawPawn) p.rawPawn = parsed.rawPawn;
      }
      if (replace) p.cameras = normalizeCameras(null);
      if (cams) { p.cameras.shots.push(...cams.shots); p.cameras.paths.push(...cams.paths); }
      if (sp) importSpExtras(p, parsed, merge, clone);
    });
    if (sp) for (const k of ['doors', 'world']) project.touch(k); // one undo step for the doors and settings that came
    if (replace) {
      if (projName) {
        project.name = projName;
        const nameInp = document.getElementById('projectName');
        if (nameInp) nameInp.value = projName;
      }
      if (parsed.camera) {
        const c = parsed.camera;
        if (typeof c.x === 'number' && typeof c.y === 'number' && typeof c.z === 'number') {
          app.vp?.fly?.setPose(new THREE.Vector3(c.x, c.y, c.z), c.yaw || 0, c.pitch || 0);
        }
      }
    }
    if (cams || replace) { project.touch('cameras'); app.emit('project', project); }
    dlg.close();
    toast(plural(items.length, 'item importado', 'itens importados') + ` (${parsed.format})`);
    const placed = [
      ...(parsed.objects || []),
      ...(parsed.vehicles || []),
      ...(parsed.actors || []),
      ...(parsed.labels || []),
      ...(parsed.pickups || []),
      ...(parsed.checkpoints || []),
      ...(parsed.mapIcons || []),
    ];
    // After importing nothing is selected: only the camera goes to the items
    ed.select([]);
    if (placed.length) {
      positionCameraOverProject(project);
      const first = placed[0];
      if (first.interior > 0 && Math.abs(first.z) > 500) app.emit('view-interiors', true);
    }
    window.__updateUndoButtons?.();
  };
}

// =====================================================================  test in game
// Lines of the file read by the test gamemode (servidor-teste/samapstudio.pwn)
// Test server messages in game, in the same order as gMsg in samapstudio.pwn. They go translated
// to the editor's language (MSG|id|text lines); in Portuguese the gamemode already has the text.
const TEST_MESSAGES = [
  'SA Map Studio: teste do mapa.',
  'Comandos: /fly /map /w [clima] /t [hora] /anim /jetpack /v [modelo] /spawn /pos /god',
  'Modo de voo livre ativado! W/S/A/D para mover, mouse para olhar. Digite /fly para sair.',
  'Modo de voo desativado. Você retornou à posição onde o voo foi ativado.',
  'Animações dos actors sincronizadas e reaplicadas.',
  'Câmera teleportada para o centro do mapa.',
  'Teleportado para o centro do mapa em teste.',
  'Posição: %.4f, %.4f, %.4f Ângulo: %.1f Interior: %d',
  'Use /v [modelo], de 400 a 611.',
  'Uso: /w [0 a 45] (ou /weather, /clima) - Clima atual: %d',
  'ID de clima inválido! Escolha um valor entre 0 e 45.',
  'Clima alterado para %d.',
  'Uso: /t [0-23] [minutos] ou /t HH:MM (ex: /t 12 ou /t 22:30) - Horário atual: %02d:%02d',
  'Horário inválido! Use hora de 0 a 23 e minutos de 0 a 59 (ex: /t 14 ou /t 14:30).',
  'Horário alterado para %02d:%02d.',
  'Reproduzindo Sound ID %d.',
  'Use /som [soundid] para testar um som (ex: /som 1052).',
  'Nenhum checkpoint no mapa atual.',
  'Teleportado para o checkpoint atual.',
  'Comandos do servidor de teste:',
  '  /fly - Alternar voo livre da câmera',
  '  /map - Teleportar ao centro do mapa em teste',
  '  /w [0-45] - Alterar clima (ex: /w 10)',
  '  /t [0-23] [min] - Alterar horário (ex: /t 12 ou /t 22:30)',
  '  /v [modelo] - Criar veículo (ex: /v 411)',
  '  /anim - Ressincronizar animações dos actors',
  '  /jetpack, /spawn, /pos - Utilidades gerais',
  'God mode ativado: vida infinita e veículo sempre consertado. Digite /god para sair.',
  'God mode desativado.',
  '  /god - Vida infinita (de novo: desativa)',
];

// The SA-MP chat only shows Windows-1252: letters outside it lose their accent (ł → l, ș → s, ơ → o);
// if any are still left (Cyrillic alphabet), the message goes in English.
const CP1252_EXTRA = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ';
const GAME_LETTERS = { 'ł': 'l', 'Ł': 'L', 'đ': 'd', 'Đ': 'D', 'ı': 'i' };
const inCp1252 = (ch) => ch.codePointAt(0) < 0x100 || CP1252_EXTRA.includes(ch);
function gameText(s) {
  let out = '';
  for (const ch of s) {
    if (inCp1252(ch)) { out += ch; continue; }
    const base = GAME_LETTERS[ch] ?? ch.normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (![...base].every(inCp1252)) return null;
    out += base;
  }
  return out;
}

function signed(v) { return parseColor(v) | 0; }
export function mapLines(project, spawn, env, center, useStreamer = false) {
  const clean = (s) => String(s ?? '').replace(/[|\r\n]/g, ' ');
  const lines = [
    `X|${useStreamer ? 1 : 0}`,
    `S|${spawn.x.toFixed(4)}|${spawn.y.toFixed(4)}|${spawn.z.toFixed(4)}|${spawn.a.toFixed(2)}|${spawn.interior}|${spawn.world}|${spawn.jetpack ? 1 : 0}|${spawn.god ? 1 : 0}`
  ];
  if (env) lines.push(`E|${env.weather}|${env.hour}|${env.minute}`);
  if (center) lines.push(`C|${center.x.toFixed(4)}|${center.y.toFixed(4)}|${center.z.toFixed(4)}`);
  if (getLanguage() !== 'pt') {
    TEST_MESSAGES.forEach((m, i) => {
      const lead = m.match(/^\s*/)[0];
      const text = gameText(t(m.trim())) ?? tFallback(m.trim());
      lines.push(`MSG|${i}|${clean(lead + text)}`);
    });
  }
  const allProjects = [project, ...(app.editor?.extraProjects ? [...app.editor.extraProjects.values()].map(e => e.project) : [])];
  const objUidToIdx = new Map();
  const vehUidToIdx = new Map();
  let objIdx = 0;
  let vehIdx = 0;
  for (const p of allProjects) {
    for (const o of p.objects || []) {
      objUidToIdx.set(o.uid, objIdx);
      lines.push(`O|${o.model}|${o.x.toFixed(5)}|${o.y.toFixed(5)}|${o.z.toFixed(5)}|${o.rx.toFixed(4)}|${o.ry.toFixed(4)}|${o.rz.toFixed(4)}|${(o.drawDist > 0 ? o.drawDist : 300).toFixed(1)}`);
      for (const m of o.materials || []) {
        if (isText(m)) lines.push(`T|${objIdx}|${m.index}|${m.size}|${m.fontSize}|${m.bold ? 1 : 0}|${signed(m.fontColor)}|${signed(m.backColor)}|${m.align}|${clean(m.font)}|${String(m.text).replace(/\r?\n/g, '\\n').replace(/\r/g, '')}`);
        else lines.push(`M|${objIdx}|${m.index}|${keepsTexture(m) ? -1 : m.model}|${clean(keepsTexture(m) ? 'none' : m.txd)}|${clean(keepsTexture(m) ? 'none' : m.texture)}|${signed(m.color)}`);
      }
      objIdx++;
    }
    for (const r of p.removed || []) lines.push(`R|${r.model}|${r.x.toFixed(4)}|${r.y.toFixed(4)}|${r.z.toFixed(4)}|${(r.radius ?? 0.25).toFixed(2)}`);
    for (const v of p.vehicles || []) {
      vehUidToIdx.set(v.uid, vehIdx);
      lines.push(`V|${v.model}|${v.x.toFixed(4)}|${v.y.toFixed(4)}|${v.z.toFixed(4)}|${v.rz.toFixed(2)}|${v.color1}|${v.color2}`);
      if (v.paintjob !== undefined && v.paintjob !== null && v.paintjob >= 0) {
        lines.push(`VP|${vehIdx}|${v.paintjob}`);
      }
      for (const c of (v.components || [])) {
        lines.push(`VC|${vehIdx}|${c}`);
      }
      vehIdx++;
    }
    // Objects attached to vehicles (AttachObjectToVehicle) and to objects (AttachObjectToObject)
    for (const o of p.objects || []) {
      if (!o.attach || !o.attach.to) continue;
      const cIdx = objUidToIdx.get(o.uid);
      if (cIdx === undefined) continue;
      if (vehUidToIdx.has(o.attach.to)) {
        const vIdx = vehUidToIdx.get(o.attach.to);
        lines.push(`AV|${cIdx}|${vIdx}|${(o.attach.ox || 0).toFixed(4)}|${(o.attach.oy || 0).toFixed(4)}|${(o.attach.oz || 0).toFixed(4)}|${(o.attach.rx || 0).toFixed(2)}|${(o.attach.ry || 0).toFixed(2)}|${(o.attach.rz || 0).toFixed(2)}`);
      } else if (objUidToIdx.has(o.attach.to)) {
        const pIdx = objUidToIdx.get(o.attach.to);
        lines.push(`AO|${cIdx}|${pIdx}|${(o.attach.ox || 0).toFixed(4)}|${(o.attach.oy || 0).toFixed(4)}|${(o.attach.oz || 0).toFixed(4)}|${(o.attach.rx || 0).toFixed(2)}|${(o.attach.ry || 0).toFixed(2)}|${(o.attach.rz || 0).toFixed(2)}|${o.attach.syncRot ?? 1}`);
      }
    }
    for (const a of p.actors || []) {
      const animStr = a.anim && a.anim.lib && a.anim.name
        ? `${clean(a.anim.lib)}|${clean(a.anim.name)}|${(a.anim.delta ?? 4.1).toFixed(1)}|${(a.anim.loop ?? 1) ? 1 : 0}|${a.anim.lockx ? 1 : 0}|${a.anim.locky ? 1 : 0}|${a.anim.freeze ? 1 : 0}|${a.anim.time ?? 0}`
        : '|||||||';
      lines.push(`A|${a.skin ?? 0}|${a.x.toFixed(4)}|${a.y.toFixed(4)}|${a.z.toFixed(4)}|${((a.rz % 360 + 360) % 360).toFixed(2)}|${a.world ?? 0}|${a.invulnerable ? 1 : 0}|${animStr}`);
    }
    for (const l of p.labels || []) {
      const colorInt = signed(l.color);
      const textEsc = String(l.text || '').replace(/\r?\n/g, '\\n').replace(/\r/g, '');
      lines.push(`L|${l.x.toFixed(4)}|${l.y.toFixed(4)}|${l.z.toFixed(4)}|${(l.drawDist || 50).toFixed(1)}|${colorInt}|${l.world ?? 0}|${l.testLOS ? 1 : 0}|${textEsc}`);
    }
    for (const pk of p.pickups || []) {
      lines.push(`P|${pk.model}|${pk.type ?? 1}|${pk.x.toFixed(4)}|${pk.y.toFixed(4)}|${pk.z.toFixed(4)}|${pk.world ?? -1}`);
    }
    for (const gz of p.gangZones || []) {
      const colorInt = signed(gz.color);
      const minx = gz.minx ?? gz.minX ?? 0;
      const miny = gz.miny ?? gz.minY ?? 0;
      const maxx = gz.maxx ?? gz.maxX ?? 0;
      const maxy = gz.maxy ?? gz.maxY ?? 0;
      lines.push(`G|${minx.toFixed(4)}|${miny.toFixed(4)}|${maxx.toFixed(4)}|${maxy.toFixed(4)}|${colorInt}`);
    }
    for (const cp of p.checkpoints || []) {
      const isRace = cp.cpKind === 'race' ? 1 : 0;
      const type = cp.type ?? 0;
      const size = cp.size || (isRace ? 4.0 : 3.0);
      const nx = cp.nextx ?? cp.x;
      const ny = cp.nexty ?? (cp.y + 10);
      const nz = cp.nextz ?? cp.z;
      lines.push(`CP|${isRace}|${type}|${cp.x.toFixed(4)}|${cp.y.toFixed(4)}|${cp.z.toFixed(4)}|${nx.toFixed(4)}|${ny.toFixed(4)}|${nz.toFixed(4)}|${size.toFixed(2)}`);
    }
    let miIdx = 0;
    for (const mi of p.mapIcons || []) {
      const colorInt = signed(mi.color ?? 0xFF0000FF);
      lines.push(`MI|${mi.iconid !== undefined ? mi.iconid : miIdx}|${mi.x.toFixed(4)}|${mi.y.toFixed(4)}|${mi.z.toFixed(4)}|${mi.type ?? 0}|${colorInt}|${mi.style ?? 0}`);
      miIdx++;
    }
    // Order of the D lines: the DF lines (TextDrawFX effect) say which TextDraw has the effect, after every D line
    const plainTds = (p.textDraws || []).filter(t => t.type !== 'progress');
    const fxLines = [];
    let tdIdx = 0;
    for (const td of p.textDraws || []) {
      if (td.type === 'progress') {
        const f = (v) => (+v || 0).toFixed(4);
        lines.push(`B|${f(td.x)}|${f(td.y)}|${f(td.pbWidth)}|${f(td.pbHeight)}|${signed(td.color ?? 0xFF1C1CFF)}|${f(td.pbMax)}|${f(td.pbValue)}|${td.pbDir | 0}|${f(fitPbBorder(td.pbBorder, td.pbWidth, td.pbHeight))}|${td.pbBlink ? 1 : 0}|${clampPbBlinkInterval(td.pbBlinkInterval)}|${clampPbBlinkDuration(td.pbBlinkDuration)}|${signed(td.pbBlinkColor || 0)}|${signed(td.pbBorderColor || 0)}|${signed(td.pbBlinkBorderColor || 0)}|${td.pbStyle | 0}|${td.pbSegments || 24}|${td.pbAutoFill ? 1 : 0}|${f(td.pbAutoFillMax ?? td.pbMax)}|${f(clampPbSegmentScale(td.pbSegmentScale))}`
          // Progress Bar Plus: minimum, gradient, smooth change and label (the label text goes last, it may have a |)
          + `|${f(pbMinOf(td))}|${td.pbGradient ? 1 : 0}|${signed(td.pbGradEmpty ?? 0)}|${signed(td.pbGradMid ?? 0)}|${signed(td.pbGradFull ?? 0)}|${td.pbGradInverted ? 1 : 0}`
          + `|${td.pbLerp && !td.pbAutoFill ? 1 : 0}|${f(td.pbLerpFrom)}|${clampPbLerpMs(td.pbLerpMs)}`
          + `|${td.pbLabel ? 1 : 0}|${signed(td.pbLabelColor ?? 0xFFFFFFFF)}|${td.pbLabelAlign || 2}|${td.pbLabelFont ?? 1}|${f(td.pbLabelScaleX)}|${f(td.pbLabelScaleY)}|${f(td.pbLabelOffX)}|${f(td.pbLabelOffY)}|${td.pbLabelFollow ? 1 : 0}|${td.pbLabelOrient | 0}|${clampPbLabelText(td.pbLabelText) || PB_LABEL_DEFAULT}`);
        continue;
      }
      const n = textDrawNative(td);
      const hasRot = Boolean(td.previewRotX || td.previewRotY || td.previewRotZ);
      const rotX = (n.font === 5 && !hasRot) ? -16.0 : (td.previewRotX || 0);
      const rotY = (n.font === 5 && !hasRot) ? 0.0 : (td.previewRotY || 0);
      const rotZ = (n.font === 5 && !hasRot) ? -55.0 : (td.previewRotZ || 0);
      const f = (v) => (+v || 0).toFixed(4);
      lines.push(`D|${f(td.x)}|${f(td.y)}|${n.font}|${f(n.letterSizeX)}|${f(n.letterSizeY)}|${f(n.textSizeX)}|${f(n.textSizeY)}|${signed(n.color)}|${signed(n.boxColor)}|${signed(n.backgroundColor)}|${n.outline}|${n.shadow}|${n.align}|${n.useBox}|${n.proportional}|${td.selectable ? 1 : 0}|${td.previewModel ?? 0}|${rotX.toFixed(2)}|${rotY.toFixed(2)}|${rotZ.toFixed(2)}|${(td.previewZoom || 1.0).toFixed(2)}|${n.text}`);
      const fx = tdfxMapLine(td, tdIdx, n.text, (uid) => plainTds.findIndex(t => t.uid === uid));
      if (fx) fxLines.push(fx);
      tdIdx++;
    }
    lines.push(...fxLines);
  }
  return lines.join('\n') + '\n';
}

function spawnPoint(kind) {
  const ed = app.editor, cam = app.vp.camera;
  const yaw = app.vp.fly.yaw;
  // SA-MP angle: 0 = north (+Y), increases counterclockwise
  const a = (((yaw * 180 / Math.PI) - 90) % 360 + 360) % 360;
  const down = (x, y, zTop) => {
    const rc = new THREE.Raycaster(new THREE.Vector3(x, y, zTop), new THREE.Vector3(0, 0, -1), 0, 1500);
    rc.camera = cam;
    const hit = rc.intersectObjects([ed.root, ...app.streamer.pickables()], true).find(h => !h.object.userData.noPick && !h.object.isSprite && !h.object.userData.isLabel && !h.object.userData.isPickup && h.object.visible);
    return hit ? hit.point.z + 1.0 : null;
  };
  if (kind === 'selection') {
    const s = ed.selectedItems()[0];
    if (s) { const z = down(s.item.x, s.item.y, s.item.z + 50); return { x: s.item.x, y: s.item.y, z: z ?? s.item.z + 2, a }; }
    if (ed.worldSel) { const w = ed.worldSel; const z = down(w.x, w.y, w.z + 50); return { x: w.x, y: w.y, z: z ?? w.z + 2, a }; }
  }
  const totalSpatial = (app.project.objects?.length || 0) + (app.project.vehicles?.length || 0) +
    (app.project.actors?.length || 0) + (app.project.labels?.length || 0) + (app.project.pickups?.length || 0);
  if (kind === 'center' && totalSpatial > 0) {
    const c = projectCenter(app.project);
    const z = down(c.x, c.y, c.z + 200);
    return { x: c.x, y: c.y, z: z ?? c.z + 2, a };
  }
  // Ground point at the center of the screen
  const hit = app.vp.raycast(new THREE.Vector2(0, 0), [ed.root, ...app.streamer.pickables()], 600);
  if (hit) return { x: hit.point.x, y: hit.point.y, z: (down(hit.point.x, hit.point.y, hit.point.z + 3) ?? hit.point.z + 1), a };
  const z = down(cam.position.x, cam.position.y, cam.position.z);
  return { x: cam.position.x, y: cam.position.y, z: z ?? cam.position.z, a };
}

export function setupTest() {
  const dlg = $('#dlgTest');
  const saved = store.get('test', {});
  // The Streamer plugin became the default: turned on once for those who had the old default (off) saved
  if (!store.get('testStreamerOn', false)) { saved.streamer = true; store.set('testStreamerOn', true); }
  if (saved.spawn) {
 const r = $(`input[name="testSpawn"][value="${saved.spawn}"]`); if (r) r.checked = true; }
  $('#testJetpack').checked = saved.jetpack ?? false;
  if ($('#testStreamer')) $('#testStreamer').checked = saved.streamer ?? true;
  if ($('#testGod')) $('#testGod').checked = saved.god ?? true;
  if (saved.launch !== undefined) $('#testLaunch').checked = saved.launch;
  if (saved.weather !== undefined && $('#testWeather')) $('#testWeather').value = Math.max(0, Math.min(45, saved.weather));
  else if ($('#testWeather')) $('#testWeather').value = 10;
  if (saved.time && $('#testTime')) $('#testTime').value = saved.time;
  else if ($('#testTime')) $('#testTime').value = '10:00';
  let info = null, poll = null;
  const showInfo = (i) => {
    info = i;
    $('#testServer').value = i.serverPath || '';
    $('#testPort').textContent = i.port;
    const notes = [];
    if (i.serverExe && i.builtin) notes.push(`Usando o servidor da pasta <b>test-server</b> do programa (<b>${esc(i.serverExe)}</b>).`);
    else if (i.serverExe) notes.push(`Servidor encontrado: <b>${esc(i.serverExe)}</b>. Ao testar, ele é copiado para a pasta <b>test-server</b> do programa (seu servidor não é alterado).`);
    else notes.push('<span class="warn">Não achei um servidor. Coloque os arquivos do servidor na pasta "test-server" do programa, ou escolha aqui a pasta de um servidor.</span>');
    if (!i.client) notes.push(`<span class="warn">Não achei o samp.exe na pasta do GTA. Instale o cliente multiplayer e conecte em 127.0.0.1:${i.port}.</span>`);
    if (i.error) notes.push(`<span class="warn">${esc(i.error)}</span>`);
    $('#testServerInfo').innerHTML = notes.join('<br>');
    $('#testStop').hidden = !i.running;
    $('#testStatus').textContent = i.running ? `Servidor de teste rodando em 127.0.0.1:${i.port}` : '';
    if (i.log) { $('#testLog').hidden = false; $('#testLog').textContent = i.log; $('#testLog').scrollTop = 1e9; }
  };
  const refresh = async () => { try { showInfo(await (await fetch('/api/test/info')).json()); } catch { /* servidor fora */ } };
  const warn = () => {
    const n = app.project.objects?.length || 0;
    const isStreamer = Boolean($('#testStreamer')?.checked);
    const notes = [];
    if (n > 2000 && !isStreamer) notes.push(`O teste sem Streamer usa CreateObject, que aceita até 2000 objetos: ${n - 2000} vão ficar de fora. Ative a opção "Usar plugin Streamer (itens dinâmicos)" para carregar todos.`);
    const totalAny = n + (app.project.vehicles?.length || 0) + (app.project.actors?.length || 0) +
      (app.project.labels?.length || 0) + (app.project.pickups?.length || 0) +
      (app.project.gangZones?.length || 0) + (app.project.textDraws?.length || 0) + (app.project.removed?.length || 0);
    if (!totalAny) notes.push('O projeto ainda está vazio: você vai nascer no ponto escolhido, só com o mapa original.');
    $('#testWarn').innerHTML = notes.map(x => `<span class="warn">${esc(x)}</span>`).join('<br>');
  };
  $('#testStreamer')?.addEventListener('change', warn);
  $('#btnTest').onclick = async () => { warn(); dlg.showModal(); await refresh(); };
  $('#testBrowse').onclick = async () => showInfo(await postJSON('/api/test/server', { browse: true }));
  $('#testServer').addEventListener('change', async () => showInfo(await postJSON('/api/test/server', { path: $('#testServer').value })));
  $('#testStop').onclick = async () => { showInfo(await postJSON('/api/test/stop', {})); toast('Servidor de teste parado'); };
  dlg.addEventListener('close', () => { clearInterval(poll); poll = null; });
  $('#testGo').onclick = async () => {
    const kind = document.querySelector('input[name="testSpawn"]:checked').value;
    const weather = Math.max(0, Math.min(45, +($('#testWeather')?.value ?? 10) || 10));
    const timeVal = $('#testTime')?.value || '10:00';
    const timeParts = timeVal.split(':').map(Number);
    const hour = isNaN(timeParts[0]) ? 10 : Math.max(0, Math.min(23, timeParts[0]));
    const minute = isNaN(timeParts[1]) ? 0 : Math.max(0, Math.min(59, timeParts[1]));
    const streamer = Boolean($('#testStreamer')?.checked);

    store.set('test', {
      spawn: kind,
      jetpack: $('#testJetpack').checked,
      god: Boolean($('#testGod')?.checked),
      streamer,
      launch: $('#testLaunch').checked,
      weather,
      time: timeVal
    });
    const sp = spawnPoint(kind);
    const spawn = { ...sp, interior: Math.max(0, +$('#testInterior').value | 0), world: Math.max(0, +$('#testWorld').value | 0), jetpack: $('#testJetpack').checked, god: Boolean($('#testGod')?.checked) };
    const env = { weather, hour, minute };
    const center = projectCenter(app.project);

    $('#testGo').disabled = true;
    $('#testStatus').textContent = 'Preparando o servidor de teste';
    try {
      const res = await postJSON('/api/test/start', { map: mapLines(app.project, spawn, env, center, streamer), launch: $('#testLaunch').checked, streamer });
      if (!res.ok) { $('#testStatus').textContent = ''; toast(res.error || 'Não consegui iniciar o teste', 'error', 7000); if (res.log) showInfo({ ...info, log: res.log }); return; }
      $('#testStatus').textContent = res.launched ? `Abrindo o jogo em ${res.address}` : `Servidor pronto. Conecte o SA-MP em ${res.address}.`;
      toast(res.launched ? 'Abrindo o GTA SA no seu mapa' : `Servidor de teste pronto em ${res.address}`, 'ok', 6000);
      await refresh();
      clearInterval(poll);
      poll = setInterval(refresh, 3000);
    } finally { $('#testGo').disabled = false; }
  };
}
