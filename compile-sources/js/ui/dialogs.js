// Diálogos de exportar, importar (qualquer formato) e testar o mapa no jogo.
import * as THREE from 'three';
import { exportPwn, exportIpl, sanitizeIdent, projectCenter } from '../editor/pwn.js';
import { quatOfItem } from '../editor/editor.js';
import { importAny } from '../editor/importers.js';
import { normalizeCameras } from '../editor/project.js';
import { isText, keepsTexture, parseColor } from '../editor/materials.js';
import { positionCameraOverProject } from './projects.js';
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
    if (data.ok) toast('Salvo em ' + data.path, 'ok', 6000); else toast(data.error || 'Erro ao salvar', 'error');
  };
}

// =====================================================================  importar
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
    const textDraws = parsed.textDraws || [];
    const total = objs.length + (parsed.vehicles || []).length + actors.length + (parsed.removed || []).length + cams + labels.length + pickups.length + gangZones.length + textDraws.length;
    const parts = [plural(objs.length, 'objeto', 'objetos'), plural(mats - texts, 'textura trocada', 'texturas trocadas'), plural(texts, 'texto', 'textos'),
      plural((parsed.vehicles || []).length, 'veículo', 'veículos')];
    if (actors.length) parts.push(plural(actors.length, 'actor', 'actors'));
    if (labels.length) parts.push(plural(labels.length, 'texto 3D', 'textos 3D'));
    if (pickups.length) parts.push(plural(pickups.length, 'pickup', 'pickups'));
    if (gangZones.length) parts.push(plural(gangZones.length, 'gangzone', 'gangzones'));
    if (textDraws.length) parts.push(plural(textDraws.length, 'textdraw', 'textdraws'));
    parts.push(plural((parsed.removed || []).length, 'objeto removido', 'objetos removidos'), plural(cams, 'câmera', 'câmeras'));
    summary.innerHTML = total
      ? `<div><span class="tag">${esc(parsed.format)}</span> Encontrei ${parts.map(p => `<b>${p}</b>`).join(', ')}.</div>
         ${unknown ? `<div class="warn">${plural(unknown, 'objeto usa', 'objetos usam')} modelos que não existem no seu jogo (aparecem só como contorno tracejado).</div>` : ''}
         ${parsed.notes.map(n => `<div class="warn">${esc(n)}</div>`).join('')}`
      : (parsed.notes.length ? parsed.notes.map(n => `<div class="warn">${esc(n)}</div>`).join('') : ($('#importText').value.trim() || fileBytes ? 'Não encontrei nenhum mapa nesse conteúdo.' : ''));
    $('#importGo').disabled = !total;
  };
  const analyzeBytes = async (bytes, name) => {
    summary.textContent = 'Analisando...';
    try { parsed = await importAny(bytes, { filename: name, gd: app.gd, readSqlite }); }
    catch (err) { parsed = null; summary.textContent = 'Não consegui ler esse arquivo: ' + err.message; return; }
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
  // Soltar um arquivo em qualquer lugar da janela também abre o importar
  window.addEventListener('dragover', (e) => { if (e.dataTransfer?.types?.includes('Files')) e.preventDefault(); });
  window.addEventListener('drop', (e) => {
    if (dlg.open || !e.dataTransfer?.files?.length) return;
    e.preventDefault();
    open(); takeFile(e.dataTransfer.files[0]);
  });
  const open = () => { parsed = null; fileBytes = null; $('#importText').value = ''; $('#importFileName').textContent = ''; show(); if (!dlg.open) dlg.showModal(); };
  $('#btnImport').onclick = () => { open(); $('#importText').focus(); };
  $('#importGo').onclick = () => {
    if (!parsed) return;
    const project = app.project, ed = app.editor;
    const items = [
      ...(parsed.objects || []).map(o => ({ ...o, kind: 'objects', uid: undefined })),
      ...(parsed.vehicles || []).map(v => ({ ...v, kind: 'vehicles', uid: undefined })),
      ...(parsed.actors || []).map(a => ({ ...a, kind: 'actors', uid: undefined })),
      ...(parsed.removed || []).map(r => ({ ...r, kind: 'removed', uid: undefined })),
      ...(parsed.labels || []).map(l => ({ ...l, kind: 'labels', uid: undefined })),
      ...(parsed.pickups || []).map(pk => ({ ...pk, kind: 'pickups', uid: undefined })),
      ...(parsed.gangZones || []).map(g => ({ ...g, kind: 'gangZones', uid: undefined })),
      ...(parsed.textDraws || []).map(t => ({ ...t, kind: 'textDraws', uid: undefined })),
    ];
    if ($('#importReplace').checked) {
      const all = [
        ...project.objects,
        ...project.vehicles,
        ...(project.actors || []),
        ...project.removed,
        ...(project.labels || []),
        ...(project.pickups || []),
        ...(project.gangZones || []),
        ...(project.textDraws || []),
      ].map(o => o.uid);
      if (all.length) project.deleteItems('Limpar projeto', all);
      if (parsed.pwnHeader || parsed.preservedHeader) project.pwnHeader = parsed.pwnHeader || parsed.preservedHeader;
      if (parsed.rawPawn) project.rawPawn = parsed.rawPawn;
      const projName = parsed.name || (fileName ? fileName.replace(/\.[^/.]+$/, '').trim() : '');
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
    } else {
      if ((parsed.pwnHeader || parsed.preservedHeader) && !project.pwnHeader) project.pwnHeader = parsed.pwnHeader || parsed.preservedHeader;
      if (parsed.rawPawn && !project.rawPawn) project.rawPawn = parsed.rawPawn;
    }
    const uids = items.length ? project.addItems(`Importar ${items.length} itens`, items) : [];
    if (parsed.cameras) {
      const c = normalizeCameras(parsed.cameras);
      if ($('#importReplace').checked) project.cameras = normalizeCameras(null);
      project.cameras.shots.push(...c.shots);
      project.cameras.paths.push(...c.paths);
      if (c.shots.length + c.paths.length) project.touch('cameras');
      app.emit('project', project);
    }
    dlg.close();
    toast(plural(items.length, 'item importado', 'itens importados') + ` (${parsed.format})`);
    const placed = [...(parsed.objects || []), ...(parsed.vehicles || []), ...(parsed.actors || []), ...(parsed.labels || []), ...(parsed.pickups || [])];
    if (placed.length) {
      ed.select(uids.filter(u => project.kindOf(u) !== 'removed' && project.kindOf(u) !== 'textDraws' && project.kindOf(u) !== 'gangZones'));
      positionCameraOverProject({ objects: placed });
      const first = placed[0];
      if (first.interior > 0 && Math.abs(first.z) > 500) app.emit('view-interiors', true);
    }
  };
}

// =====================================================================  testar no jogo
// Linhas do arquivo lido pelo gamemode de teste (servidor-teste/samapstudio.pwn)
function signed(v) { return parseColor(v) | 0; }
export function mapLines(project, spawn, env, center, useStreamer = false) {
  const clean = (s) => String(s ?? '').replace(/[|\r\n]/g, ' ');
  const lines = [
    `X|${useStreamer ? 1 : 0}`,
    `S|${spawn.x.toFixed(4)}|${spawn.y.toFixed(4)}|${spawn.z.toFixed(4)}|${spawn.a.toFixed(2)}|${spawn.interior}|${spawn.world}|${spawn.jetpack ? 1 : 0}`
  ];
  if (env) lines.push(`E|${env.weather}|${env.hour}|${env.minute}`);
  if (center) lines.push(`C|${center.x.toFixed(4)}|${center.y.toFixed(4)}|${center.z.toFixed(4)}`);
  const allProjects = [project, ...(app.editor?.extraProjects ? [...app.editor.extraProjects.values()].map(e => e.project) : [])];
  let objIdx = 0;
  for (const p of allProjects) {
    for (const o of p.objects || []) {
      lines.push(`O|${o.model}|${o.x.toFixed(5)}|${o.y.toFixed(5)}|${o.z.toFixed(5)}|${o.rx.toFixed(4)}|${o.ry.toFixed(4)}|${o.rz.toFixed(4)}|${(o.drawDist > 0 ? o.drawDist : 300).toFixed(1)}`);
      for (const m of o.materials || []) {
        if (isText(m)) lines.push(`T|${objIdx}|${m.index}|${m.size}|${m.fontSize}|${m.bold ? 1 : 0}|${signed(m.fontColor)}|${signed(m.backColor)}|${m.align}|${clean(m.font)}|${String(m.text).replace(/\r?\n/g, '\\n').replace(/\r/g, '')}`);
        else lines.push(`M|${objIdx}|${m.index}|${keepsTexture(m) ? -1 : m.model}|${clean(keepsTexture(m) ? 'none' : m.txd)}|${clean(keepsTexture(m) ? 'none' : m.texture)}|${signed(m.color)}`);
      }
      objIdx++;
    }
    for (const r of p.removed || []) lines.push(`R|${r.model}|${r.x.toFixed(4)}|${r.y.toFixed(4)}|${r.z.toFixed(4)}|${(r.radius ?? 0.25).toFixed(2)}`);
    let vehIdx = 0;
    for (const v of p.vehicles || []) {
      lines.push(`V|${v.model}|${v.x.toFixed(4)}|${v.y.toFixed(4)}|${v.z.toFixed(4)}|${v.rz.toFixed(2)}|${v.color1}|${v.color2}`);
      if (v.paintjob !== undefined && v.paintjob !== null && v.paintjob >= 0) {
        lines.push(`VP|${vehIdx}|${v.paintjob}`);
      }
      for (const c of (v.components || [])) {
        lines.push(`VC|${vehIdx}|${c}`);
      }
      vehIdx++;
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
    for (const td of p.textDraws || []) {
      const align = (td.font === 4 || td.font === 5) ? 1 : (td.align ?? td.alignment ?? 1);
      const isTextNoBox = (td.font <= 3) && !td.useBox;
      const letX = td.font === 4 ? (td.letterSizeX || 0.5) : (td.letterSizeX ?? 0.35);
      const letY = td.font === 4 ? (td.letterSizeY || 1.0) : (td.letterSizeY ?? 1.4);
      const sizeX = isTextNoBox ? (align === 3 ? 0.0 : 640.0) : (td.textSizeX ?? (td.font === 4 ? 64.0 : 640.0));
      const sizeY = isTextNoBox ? (align === 2 ? 640.0 : 480.0) : (td.textSizeY ?? (td.font === 4 ? 64.0 : 100.0));
      let colVal = td.color ?? 0xFFFFFFFF;
      if (td.font === 4 && (colVal === 0 || colVal === 0xFF || (colVal & 0xFF) === 0)) colVal = 0xFFFFFFFF;
      const cInt = signed(colVal);
      const bInt = signed(td.boxColor ?? 0x00000080);
      const bgRaw = td.font === 5 ? (td.useBox ? (td.boxColor ?? 0x00000060) : 0x00000000) : (td.backgroundColor ?? 0x000000FF);
      const bgInt = signed(bgRaw);
      const useBoxVal = (td.font === 4 || td.font === 5) ? 0 : (td.useBox ? 1 : 0);
      const hasRot = Boolean(td.previewRotX || td.previewRotY || td.previewRotZ);
      const rotX = (td.font === 5 && !hasRot) ? -16.0 : (td.previewRotX || 0);
      const rotY = (td.font === 5 && !hasRot) ? 0.0 : (td.previewRotY || 0);
      const rotZ = (td.font === 5 && !hasRot) ? -55.0 : (td.previewRotZ || 0);
      let rawText = String(td.text || (td.font === 4 ? 'hud:radardisc' : '_')).trim().replace(/^"|"$/g, '');
      if (td.font === 4) {
        const colon = rawText.indexOf(':');
        if (colon !== -1) {
          const libPart = rawText.slice(0, colon).toLowerCase();
          const texPart = rawText.slice(colon + 1);
          if (libPart === 'loadscs' || libPart === 'loadsc') {
            const lowTex = texPart.toLowerCase();
            if (lowTex.startsWith('loadsc')) {
              rawText = `${lowTex}:${lowTex}`;
            } else {
              rawText = 'LOADSCS:' + lowTex;
            }
          } else if (libPart === 'loadsuk') {
            rawText = 'LOADSUK:' + texPart.toLowerCase();
          } else if (libPart === 'hud') {
            if (texPart.toLowerCase() === 'radar_ring' || texPart.toLowerCase() === 'radarringplane') {
              rawText = 'hud:radarRingPlane';
            } else {
              rawText = 'hud:' + texPart;
            }
          } else if (libPart.startsWith('ld_')) {
            rawText = libPart.toUpperCase() + ':' + texPart.toLowerCase();
          }
        }
      }
      const textEsc = rawText.replace(/\\n/g, '\n').replace(/\r?\n/g, '~n~').replace(/\r/g, '');
      lines.push(`D|${td.x.toFixed(2)}|${td.y.toFixed(2)}|${td.font ?? 1}|${letX.toFixed(2)}|${letY.toFixed(2)}|${sizeX.toFixed(2)}|${sizeY.toFixed(2)}|${cInt}|${bInt}|${bgInt}|${td.outline ?? 0}|${td.shadow ?? 1}|${align}|${useBoxVal}|${td.proportional ?? 1}|${td.selectable ? 1 : 0}|${td.previewModel ?? 0}|${rotX.toFixed(2)}|${rotY.toFixed(2)}|${rotZ.toFixed(2)}|${(td.previewZoom || 1.0).toFixed(2)}|${textEsc}`);
    }
  }
  return lines.join('\n') + '\n';
}

function spawnPoint(kind) {
  const ed = app.editor, cam = app.vp.camera;
  const yaw = app.vp.fly.yaw;
  // Ângulo do SA-MP: 0 = norte (+Y), cresce no sentido anti-horário
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
  if (kind === 'center' && (app.project.objects.length + app.project.vehicles.length + (app.project.actors?.length || 0))) {
    const c = projectCenter(app.project);
    const z = down(c.x, c.y, c.z + 200);
    return { x: c.x, y: c.y, z: z ?? c.z + 2, a };
  }
  // Ponto do chão no centro da tela
  const hit = app.vp.raycast(new THREE.Vector2(0, 0), [ed.root, ...app.streamer.pickables()], 600);
  if (hit) return { x: hit.point.x, y: hit.point.y, z: (down(hit.point.x, hit.point.y, hit.point.z + 3) ?? hit.point.z + 1), a };
  const z = down(cam.position.x, cam.position.y, cam.position.z);
  return { x: cam.position.x, y: cam.position.y, z: z ?? cam.position.z, a };
}

export function setupTest() {
  const dlg = $('#dlgTest');
  const saved = store.get('test', {});
  if (saved.spawn) { const r = $(`input[name="testSpawn"][value="${saved.spawn}"]`); if (r) r.checked = true; }
  $('#testJetpack').checked = saved.jetpack ?? false;
  if ($('#testStreamer')) $('#testStreamer').checked = saved.streamer ?? false;
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
    if (i.serverExe && i.builtin) notes.push(`Usando o servidor da pasta <b>Servidor de Teste</b> do programa (<b>${esc(i.serverExe)}</b>).`);
    else if (i.serverExe) notes.push(`Servidor encontrado: <b>${esc(i.serverExe)}</b>. Ao testar, ele é copiado para a pasta <b>Servidor de Teste</b> do programa (seu servidor não é alterado).`);
    else notes.push('<span class="warn">Não achei um servidor. Coloque os arquivos do servidor na pasta "Servidor de Teste" do programa, ou escolha aqui a pasta de um servidor.</span>');
    if (!i.client) notes.push('<span class="warn">Não achei o samp.exe na pasta do GTA. Instale o cliente multiplayer e conecte em 127.0.0.1:' + i.port + '.</span>');
    if (i.error) notes.push(`<span class="warn">${esc(i.error)}</span>`);
    $('#testServerInfo').innerHTML = notes.join('<br>');
    $('#testStop').hidden = !i.running;
    $('#testStatus').textContent = i.running ? `Servidor de teste rodando em 127.0.0.1:${i.port}` : '';
    if (i.log) { $('#testLog').hidden = false; $('#testLog').textContent = i.log; $('#testLog').scrollTop = 1e9; }
  };
  const refresh = async () => { try { showInfo(await (await fetch('/api/test/info')).json()); } catch { /* servidor fora */ } };
  const warn = () => {
    const n = app.project.objects.length;
    const isStreamer = Boolean($('#testStreamer')?.checked);
    const notes = [];
    if (n > 2000 && !isStreamer) notes.push(`O teste sem Streamer usa CreateObject, que aceita até 2000 objetos: ${n - 2000} vão ficar de fora. Ative a opção "Usar plugin Streamer (itens dinâmicos)" para carregar todos.`);
    if (!n && !app.project.vehicles.length) notes.push('O projeto ainda está vazio: você vai nascer no ponto escolhido, só com o mapa original.');
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
      streamer,
      launch: $('#testLaunch').checked,
      weather,
      time: timeVal
    });
    const sp = spawnPoint(kind);
    const spawn = { ...sp, interior: Math.max(0, +$('#testInterior').value | 0), world: Math.max(0, +$('#testWorld').value | 0), jetpack: $('#testJetpack').checked };
    const env = { weather, hour, minute };
    const center = projectCenter(app.project);

    $('#testGo').disabled = true;
    $('#testStatus').textContent = 'Preparando o servidor de teste...';
    try {
      const res = await postJSON('/api/test/start', { map: mapLines(app.project, spawn, env, center, streamer), launch: $('#testLaunch').checked, streamer });
      if (!res.ok) { $('#testStatus').textContent = ''; toast(res.error || 'Não consegui iniciar o teste', 'error', 7000); if (res.log) showInfo({ ...info, log: res.log }); return; }
      $('#testStatus').textContent = res.launched ? `Abrindo o jogo em ${res.address}...` : `Servidor pronto. Conecte o SA-MP em ${res.address}.`;
      toast(res.launched ? 'Abrindo o GTA SA no seu mapa' : `Servidor de teste pronto em ${res.address}`, 'ok', 6000);
      await refresh();
      clearInterval(poll);
      poll = setInterval(refresh, 3000);
    } finally { $('#testGo').disabled = false; }
  };
}
