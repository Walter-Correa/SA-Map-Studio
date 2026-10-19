// SA Map Studio: abertura do programa e a parte da interface que liga tudo
// (barra de ferramentas, visão, teleporte, abas, lista do projeto, atalhos).
import * as THREE from 'three';
import { GameData, GameFS } from './world/gamedata.js';
import { ModelCache } from './world/models.js';
import { WorldStreamer } from './world/streamer.js';
import { Viewport, buildWater, isTyping } from './editor/viewport.js';
import { Editor } from './editor/editor.js';
import { Project } from './editor/project.js';
import { Thumbnails } from './editor/thumbs.js';
import { TextureLibrary } from './editor/textures.js';
import { WORLD_PLACES, INTERIOR_PLACES, PLACES, regionOf } from './editor/places.js';
import { isText } from './editor/materials.js';
import { app, $, $$, esc, fmt, store, toast, copyText, modelLabel, parseCoords, postJSON, showConfirm } from './ui/common.js';
import { setupProjects, openInitialProject, saveNow, autosaveOnClose } from './ui/projects.js';
import { setupCatalog, renderCatalogRows } from './ui/catalog.js';
import { setupTexturesTab, renderTexRows, updateTarget } from './ui/texturesTab.js';
import { setupInspector, openCreate3DTextPanel, openCreateCheckpointPanel } from './ui/inspector.js';
import { setupCameras, stopPreview } from './ui/cameras.js';
import { setupExport, setupImport, setupTest } from './ui/dialogs.js';
import { setupAbout } from './ui/about.js';
import { setupLogsDialog } from './ui/logger.js';
import { setupAnimPicker } from './ui/animPicker.js';
import { setupSkinPicker } from './ui/skinPicker.js';
import { setupSpritePicker } from './ui/spritePicker.js';
import { initGangZoneDialog, openGangZoneDialog } from './ui/gangzoneDialog.js';
import { initTextDrawEditor, openTextDrawEditor } from './ui/textdrawEditor.js';
import { initMapIconDialog, openMapIconDialog } from './ui/mapiconDialog.js';
import { initSoundDialog, openSoundDialog } from './ui/soundDialog.js';
import { installColorPicker } from './ui/colorPicker.js';

let water = null;
let hintDismissed = false;

// Barra superior: mostra todos os rótulos que couberem; quando falta espaço, primeiro aperta os
// espaçamentos e depois esconde os rótulos menos importantes, um por vez (os ícones continuam)
const TOPBAR_HIDE_ORDER = [
  '#saveState', '.brand', '.seg-btn[data-mode="texture"]', '.seg-btn[data-mode="rotate"]', '.seg-btn[data-mode="translate"]',
  '#btnSpace', '#btnSnap', '#btnProjects', '#btnSounds', '#btn3DText', '#btnGangZones', '#btnTextDraws',
  '#btnMapIcons', '#btnCheckpoints', '#btnImport', '#btnView', '#btnGoto', '#btnExport', '#btnTest',
];

export function fitTopbar() {
  const bar = $('.topbar');
  if (!bar || !bar.clientWidth) return;
  const els = TOPBAR_HIDE_ORDER.map(s => bar.querySelector(s)).filter(Boolean);
  bar.classList.remove('tight');
  els.forEach(el => el.classList.remove('no-lbl'));
  const fits = () => bar.scrollWidth <= bar.clientWidth + 1;
  if (fits()) return;
  bar.classList.add('tight');
  for (const el of els) {
    if (fits()) return;
    el.classList.add('no-lbl');
  }
}

function setupTopbarFit() {
  // Reajusta só quando a janela para de mudar de tamanho (medir a barra recalcula o layout da página)
  let timer = 0;
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(fitTopbar, 120);
  };
  window.addEventListener('resize', schedule);
  document.fonts?.ready?.then(schedule);
  // O botão Mundo/Objeto troca de texto: reajusta quando o rótulo muda
  const space = $('#btnSpace');
  if (space) new MutationObserver(schedule).observe(space, { childList: true, subtree: true, characterData: true });
  schedule();
}

// =====================================================================  abertura
async function boot() {
  const status = $('#bootStatus');
  let cfg;
  try { cfg = await (await fetch('/api/config')).json(); }
  catch { status.textContent = 'Não consegui falar com o servidor. Abra o programa pelo SA Map Studio.exe (ou serve.py).'; status.classList.add('error'); return; }
  if (cfg.needsSetup || !cfg.ok) {
    showSetup(cfg.detectedPath || cfg.gtaPath || '', cfg.problem, cfg.needsSetup);
    return;
  }
  await start(cfg);
  if (cfg.problem) toast(cfg.problem, 'warn', 8000);
}

async function browseGta(initial) {
  try { return await postJSON('/api/browse', { initial }); } catch { return { path: '' }; }
}

function setBootProgress(p) {
  const wrap = $('#bootIconWrap');
  if (!wrap) return;
  if (p === null || p === undefined) {
    wrap.classList.remove('is-syncing');
    wrap.style.removeProperty('--sync-time');
    const anims = wrap.getAnimations ? wrap.getAnimations({ subtree: true }) : [];
    for (const a of anims) {
      try { a.play(); } catch (_) {}
    }
  } else {
    wrap.classList.add('is-syncing');
    const clamped = Math.max(0, Math.min(1.0, +p || 0));
    wrap.style.setProperty('--sync-time', (clamped * 3.0).toFixed(3) + 's');
    const anims = wrap.getAnimations ? wrap.getAnimations({ subtree: true }) : [];
    for (const a of anims) {
      try {
        a.pause();
        a.currentTime = clamped * 3000;
      } catch (_) {}
    }
  }
}

function showSetup(path, problem, needsSetup) {
  setBootProgress(null);
  $('#bootBody').hidden = true;
  const form = $('#setupForm');
  form.hidden = false;
  $('#setupPath').value = path || '';
  const er = $('#setupError');
  if (problem && !needsSetup) {
    er.textContent = problem;
    er.hidden = false;
  } else {
    er.hidden = true;
    er.textContent = '';
  }
  $('#setupBrowse').onclick = async () => {
    const r = await browseGta($('#setupPath').value);
    if (!r.path) return;
    $('#setupPath').value = r.path;
    er.hidden = r.ok;
    er.textContent = r.problem || '';
  };
  form.onsubmit = async (e) => {
    e.preventDefault();
    const chosen = $('#setupPath').value.trim();
    if (!chosen) {
      er.textContent = 'Por favor, selecione a pasta onde o GTA San Andreas está instalado.';
      er.hidden = false;
      return;
    }
    const data = await postJSON('/api/config', { gtaPath: chosen });
    if (!data || !data.ok) {
      er.textContent = (data && data.error) || 'O caminho selecionado não é uma instalação válida do jogo.';
      er.hidden = false;
      return;
    }
    er.hidden = true;
    form.hidden = true;
    $('#bootBody').hidden = false;
    await start({ gtaPath: data.gtaPath, ok: true });
  };
}

async function start(cfg) {
  const status = $('#bootStatus'), bar = $('#bootBar');
  const gd = new GameData(new GameFS('/gta/'));
  try {
    await gd.load((msg, p) => {
      status.textContent = msg;
      bar.style.width = Math.round(p * 100) + '%';
      setBootProgress(p);
    });
  } catch (err) {
    // Volta para a escolha da pasta, mostrando o erro, em vez de travar na abertura
    setBootProgress(null);
    bar.style.width = '0%';
    showSetup(cfg.gtaPath || '', 'Erro ao ler os arquivos do jogo: ' + err.message, false);
    return;
  }
  setBootProgress(null);
  status.textContent = 'Abrindo o editor';
  $('#app').hidden = false;
  const vp = new Viewport($('#viewport'));
  const models = new ModelCache(gd, vp.renderer);
  const streamer = new WorldStreamer(gd, models, vp.scene);
  const thumbs = new Thumbnails(vp.renderer, models);
  Object.assign(app, { gd, vp, models, streamer, thumbs, cfg });
  try {
    water = buildWater(await gd.fs.text('data/water.dat'));
    vp.scene.add(water);
  } catch { /* sem água */ }
  app.project = new Project('Meu mapa');
  const editor = new Editor({ viewport: vp, streamer, models, gamedata: gd, project: app.project });
  app.editor = editor;
  // TXDs das trocas de textura e modelos do projeto não saem da memória
  models.pinnedTxds = () => app.project.objects.flatMap(o => (o.materials || []).filter(m => !isText(m)).map(m => String(m.txd || '').toLowerCase())).filter(t => t && t !== 'none');
  streamer.keepModels = () => [...app.project.objects, ...app.project.vehicles, ...(app.project.actors || [])].map(o => o.model || o.skin).concat(editor.placing ? [editor.placing.model] : []);
  app.texlib = new TextureLibrary(gd);
  app.texlib.isBusy = () => streamer.stats.pending > 0 || streamer.loading > 0 || thumbs.queue.length > 0;
  // Miniaturas que já estão no disco aparecem na hora
  const have = await thumbs.loadIndex();
  app.texlib.setHave(have.tex);

  window.app = app;
  installColorPicker();

  setupProjects();
  setupToolbar(cfg);
  setupTabs();
  setupCatalog();
  setupTexturesTab();
  setupInspector();
  setupCameras();
  setupOutline();
  setupExport();
  setupImport();
  setupTest();
  setupKeys();
  setupAbout();
  setupLogsDialog();
  setupAnimPicker();
  setupSkinPicker();
  setupSpritePicker();
  initGangZoneDialog(app);
  initTextDrawEditor(app);
  initMapIconDialog();
  initSoundDialog();
  autosaveOnClose($('#dlgTextDraw'), 'textDraws');
  autosaveOnClose($('#dlgMapIcons'), 'mapIcons');
  autosaveOnClose($('#dlgGangZones'), 'gangZones');
  await openInitialProject();
  $('#overlay').hidden = true;
  for (const w of gd.warnings) toast(w, 'warn', 6000);
  setInterval(updateHud, 250);

  // Sinal de vida para o servidor feito num Worker: continua mesmo se a tela ficar ocupada
  try {
    const src = `const p=()=>fetch(${JSON.stringify(location.origin + '/api/ping')},{cache:'no-store'}).catch(()=>{});p();setInterval(p,10000);`;
    new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
  } catch {
    const ping = () => fetch('/api/ping', { cache: 'no-store' }).catch(() => {});
    ping(); setInterval(ping, 10000);
  }
  window.samap = app;
}

// =====================================================================  barra de ferramentas e visão
function setupToolbar(cfg) {
  const ed = app.editor, vp = app.vp, streamer = app.streamer;
  $$('[data-mode]').forEach(b => b.onclick = () => ed.setMode(b.dataset.mode));
  $('#btnSpace').onclick = () => ed.setSpace(ed.space === 'world' ? 'local' : 'world');
  ed.addEventListener('mode', updateToolButtons);
  updateToolButtons();
  setupPopover('#btnSnap', '#popSnap');
  setupPopover('#btnGoto', '#popGoto', () => setTimeout(() => $('#gotoInput')?.focus({ preventScroll: true }), 0));
  setupPopover('#btnView', '#popView');
  const snap = store.get('snap', { enabled: true, move: 0.1, rotate: 0.1, magnetic: true, magDist: 0.1 });
  $('#snapOn').checked = snap.enabled ?? true; $('#snapMove').value = snap.move; $('#snapRot').value = snap.rotate;
  $('#snapMagnetic').checked = snap.magnetic ?? true; $('#snapMagDist').value = snap.magDist ?? 0.1;
  const applySnap = () => {
    const s = {
      enabled: $('#snapOn').checked,
      move: Math.max(0.01, +$('#snapMove').value || 0.1),
      rotate: Math.max(0.01, +$('#snapRot').value || 0.1),
      magnetic: $('#snapMagnetic').checked,
      magDist: Math.max(0.01, +$('#snapMagDist').value || 0.1),
    };
    ed.setSnap(s);
    store.set('snap', s);
  };
  ['#snapOn', '#snapMove', '#snapRot', '#snapMagnetic', '#snapMagDist'].forEach(s => {
    $(s).addEventListener('change', applySnap);
    $(s).addEventListener('input', applySnap);
  });
  const rawSpeed = store.get('transformSpeed', { move: 1.0, rotate: 1.0 });
  ed.setTransformSpeed({ move: rawSpeed?.move ?? 1.0, rotate: rawSpeed?.rotate ?? 1.0 });
  $('#btnUndo').onclick = doUndo;
  $('#btnRedo').onclick = doRedo;
  if ($('#btnCheckpoints')) $('#btnCheckpoints').onclick = () => openCreateCheckpointPanel();
  if ($('#btnMapIcons')) $('#btnMapIcons').onclick = () => openMapIconDialog();
  if ($('#btnSounds')) $('#btnSounds').onclick = () => openSoundDialog();
  if ($('#btnGangZones')) $('#btnGangZones').onclick = () => openGangZoneDialog();
  if ($('#btnTextDraws')) $('#btnTextDraws').onclick = () => openTextDrawEditor();
  app.on('project-change', updateUndoButtons);
  app.on('project', updateUndoButtons);
  ed.on('extra-project-change', updateUndoButtons);
  ed.on('selection', updateUndoButtons);

  // Visão
  const view = store.get('view', { dist: 600, speed: 25, lod: true, water: true, interiors: false, showSelectionBox: false, removeLod: true, autoCollapseSidebars: false, weather: 10, time: '10:00' });
  const applyView = () => {
    const v = {
      dist: +$('#viewDist').value,
      speed: +$('#camSpeed').value,
      lod: $('#showLod').checked,
      water: $('#showWater').checked,
      interiors: $('#showInteriors').checked,
      showSelectionBox: $('#showSelectionBox')?.checked ?? false,
      removeLod: $('#removeLod').checked,
      autoCollapseSidebars: $('#autoCollapseSidebars')?.checked ?? false,
      weather: Math.max(0, Math.min(45, +($('#viewWeather')?.value ?? 10) || 10)),
      time: $('#viewTime')?.value || '10:00',
    };
    $('#viewDistOut').textContent = v.dist + ' m';
    $('#camSpeedOut').textContent = v.speed;
    streamer.settings.maxDistance = v.dist;
    streamer.settings.showLod = v.lod;
    streamer.settings.interiors = v.interiors;
    streamer.invalidate();
    vp.setFogDistance(v.lod ? Math.max(v.dist * 2.5, 2500) : v.dist);
    vp.fly.speed = v.speed;
    if (water) water.visible = v.water && !v.interiors;
    ed.removeLodToo = v.removeLod;
    if (ed.showSelectionBox !== v.showSelectionBox) {
      ed.showSelectionBox = v.showSelectionBox;
      ed.refreshSelectionBoxes();
    }

    const timeParts = v.time.split(':').map(Number);
    const hour = isNaN(timeParts[0]) ? 10 : Math.max(0, Math.min(23, timeParts[0]));
    const minute = isNaN(timeParts[1]) ? 0 : Math.max(0, Math.min(59, timeParts[1]));
    vp.setEnvironment(v.weather, hour, minute, v.interiors);

    // Sincroniza com as opções do teste de mapa
    const testSaved = store.get('test', {});
    testSaved.weather = v.weather;
    testSaved.time = v.time;
    store.set('test', testSaved);
    if ($('#testWeather') && document.activeElement !== $('#testWeather')) $('#testWeather').value = v.weather;
    if ($('#testTime') && document.activeElement !== $('#testTime')) $('#testTime').value = v.time;

    store.set('view', v);
  };
  $('#viewDist').value = view.dist; $('#camSpeed').value = view.speed; $('#showLod').checked = view.lod;
  $('#showWater').checked = view.water; $('#showInteriors').checked = view.interiors; $('#removeLod').checked = view.removeLod;
  if ($('#showSelectionBox')) $('#showSelectionBox').checked = view.showSelectionBox === true;
  if ($('#autoCollapseSidebars')) $('#autoCollapseSidebars').checked = view.autoCollapseSidebars ?? false;
  if ($('#viewWeather')) $('#viewWeather').value = view.weather !== undefined ? view.weather : 10;
  if ($('#viewTime')) $('#viewTime').value = view.time || '10:00';
  ['#viewDist', '#camSpeed', '#showLod', '#showWater', '#showInteriors', '#showSelectionBox', '#removeLod', '#autoCollapseSidebars', '#viewWeather', '#viewTime'].forEach(s => {
    const el = $(s);
    if (el) el.addEventListener('input', applyView);
    if (el) el.addEventListener('change', applyView);
  });
  $('#testWeather')?.addEventListener('input', () => {
    if ($('#viewWeather') && $('#viewWeather').value !== $('#testWeather').value) {
      $('#viewWeather').value = $('#testWeather').value;
      applyView();
    }
  });
  $('#testTime')?.addEventListener('input', () => {
    if ($('#viewTime') && $('#viewTime').value !== $('#testTime').value) {
      $('#viewTime').value = $('#testTime').value;
      applyView();
    }
  });
  applyView();
  app.on('view-interiors', (on) => { if ($('#showInteriors').checked !== on) { $('#showInteriors').checked = on; applyView(); } });
  vp.fly.onSpeed = (s) => { $('#camSpeed').value = Math.round(Math.min(300, s)); $('#camSpeedOut').textContent = Math.round(s); };
  if ($('#testGtaPath')) $('#testGtaPath').value = cfg.gtaPath || '';
  if ($('#gtaInfo')) $('#gtaInfo').textContent = 'Pasta do GTA: ' + cfg.gtaPath + ' · ' + app.gd.instances.length.toLocaleString('pt-BR') + ' objetos no mapa';
  const btnChange = $('#btnChangeGta');
  if (btnChange) btnChange.onclick = () => { closePopovers(); changeGtaFolder(); };

  // Recolhimento independente dos menus laterais pelas bordas internas
  let leftCollapsed = false;
  let rightCollapsed = false;
  let autoCollapsedPrevLeft = false;
  let autoCollapsedPrevRight = false;

  const setLeftCollapsed = (collapsed, isAuto = false) => {
    if (leftCollapsed === collapsed) return;
    leftCollapsed = collapsed;
    const appEl = $('#app');
    if (appEl) appEl.classList.toggle('sidebar-left-collapsed', collapsed);
    const btn = $('#btnToggleLeftSidebar');
    if (btn) {
      btn.classList.toggle('collapsed', collapsed);
      btn.title = collapsed ? 'Expandir menu esquerdo' : 'Recolher menu esquerdo';
      btn.setAttribute('aria-label', btn.title);
    }
    vp.resize();
  };

  const setRightCollapsed = (collapsed, isAuto = false) => {
    if (rightCollapsed === collapsed) return;
    rightCollapsed = collapsed;
    const appEl = $('#app');
    if (appEl) appEl.classList.toggle('sidebar-right-collapsed', collapsed);
    const btn = $('#btnToggleRightSidebar');
    if (btn) {
      btn.classList.toggle('collapsed', collapsed);
      btn.title = collapsed ? 'Expandir menu direito' : 'Recolher menu direito';
      btn.setAttribute('aria-label', btn.title);
    }
    vp.resize();
  };

  setupTopbarFit();

  $('#btnToggleLeftSidebar')?.addEventListener('click', () => setLeftCollapsed(!leftCollapsed));
  $('#btnToggleRightSidebar')?.addEventListener('click', () => setRightCollapsed(!rightCollapsed));

  window.addEventListener('keydown', (e) => {
    if (e.code === 'F10' && !isTyping(e)) {
      e.preventDefault();
      const shouldCollapse = !(leftCollapsed && rightCollapsed);
      setLeftCollapsed(shouldCollapse);
      setRightCollapsed(shouldCollapse);
    }
  });

  // Recolhimento automático durante movimento da câmera
  vp.fly.onActivity = (isMoving) => {
    const shouldAuto = $('#autoCollapseSidebars')?.checked ?? false;
    if (!shouldAuto) return;
    if (isMoving) {
      if (!leftCollapsed || !rightCollapsed) {
        autoCollapsedPrevLeft = !leftCollapsed;
        autoCollapsedPrevRight = !rightCollapsed;
        setLeftCollapsed(true, true);
        setRightCollapsed(true, true);
      }
    } else {
      if (autoCollapsedPrevLeft) { setLeftCollapsed(false, true); autoCollapsedPrevLeft = false; }
      if (autoCollapsedPrevRight) { setRightCollapsed(false, true); autoCollapsedPrevRight = false; }
    }
  };

  // Coordenadas do clique do mouse no topo do menu lateral direito
  const updateClickCoords = (eventOrPt) => {
    const pt = eventOrPt?.detail || eventOrPt;
    if (!pt) return;
    const x = Number(pt.x).toFixed(4);
    const y = Number(pt.y).toFixed(4);
    const z = Number(pt.z).toFixed(4);
    const elX = $('#ccX'), elY = $('#ccY'), elZ = $('#ccZ');
    if (elX) elX.textContent = x;
    if (elY) elY.textContent = y;
    if (elZ) elZ.textContent = z;
    const raw = `${x}, ${y}, ${z}`;
    const valEl = $('#clickCoordsValue');
    if (valEl) valEl.dataset.coords = raw;
  };
  ed.addEventListener('map-click-coords', updateClickCoords);

  const copyCurrentCoords = async () => {
    const valEl = $('#clickCoordsValue');
    const raw = valEl?.dataset?.coords || `${$('#ccX')?.textContent || '0.0000'}, ${$('#ccY')?.textContent || '0.0000'}, ${$('#ccZ')?.textContent || '0.0000'}`;
    await copyText(raw);
    toast(`Coordenadas copiadas: ${raw}`);
  };
  $('#btnGotoClickCoords')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const x = parseFloat($('#ccX')?.textContent || '0');
    const y = parseFloat($('#ccY')?.textContent || '0');
    const z = parseFloat($('#ccZ')?.textContent || '0');
    if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)) {
      const target = new THREE.Vector3(x, y, z);
      app.vp.camera.position.set(x, y - 10, z + 6);
      app.vp.fly.lookAt(target);
      app.streamer.invalidate();
      toast(`Câmera teleportada para (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`);
    }
  });
  $('#btnCopyClickCoords')?.addEventListener('click', (e) => {
    e.stopPropagation();
    copyCurrentCoords();
  });
  $('#clickCoordsValue')?.addEventListener('click', () => {
    copyCurrentCoords();
  });

  // Lugares e teleporte (Locais no mundo e Interiores)
  let activeGotoTab = store.get('gotoTab', 'world');
  let activeGotoCat = 'Todos';
  const placesEl = $('#placesList');
  const catEl = $('#gotoCategories');
  const searchEl = $('#gotoSearch');
  const tabWorld = $('#gotoTabWorld');
  const tabInteriors = $('#gotoTabInteriors');

  const getSourceList = () => activeGotoTab === 'interiors' ? INTERIOR_PLACES : WORLD_PLACES;

  const renderGotoCategories = () => {
    if (!catEl) return;
    const list = getSourceList();
    const cats = ['Todos', ...new Set(list.map(p => p.category || p.area).filter(Boolean))];
    if (!cats.includes(activeGotoCat)) activeGotoCat = 'Todos';
    catEl.innerHTML = cats.map(c => `<button type="button" class="goto-cat-btn ${c === activeGotoCat ? 'active' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('');
  };

  const renderGotoList = () => {
    if (!placesEl) return;
    const list = getSourceList();
    const q = (searchEl?.value || '').trim().toLowerCase();
    const filtered = [];
    for (let i = 0; i < list.length; i++) {
      const p = list[i];
      const pCat = p.category || p.area || '';
      if (activeGotoCat !== 'Todos' && pCat !== activeGotoCat) continue;
      if (q) {
        const text = `${p.name} ${p.area} ${pCat} ${p.interior !== undefined ? 'interior ' + p.interior : ''}`.toLowerCase();
        if (!text.includes(q)) continue;
      }
      filtered.push({ p, i });
    }

    if (!filtered.length) {
      placesEl.innerHTML = `<div style="grid-column: 1 / -1; padding: 16px; text-align: center; color: var(--paper-mute); font-size: 12px;">Nenhum destino encontrado</div>`;
      return;
    }

    placesEl.innerHTML = filtered.map(({ p, i }) => {
      const isInt = p.interior !== undefined;
      return `<button type="button" class="place" data-tab="${activeGotoTab}" data-i="${i}" title="${esc(p.name)}">
        <span class="place-name">${esc(p.name)}</span>
        <div class="place-meta">
          <small>${esc(p.area)}</small>
          ${isInt ? `<span class="badge-int">Int ${p.interior}</span>` : ''}
        </div>
      </button>`;
    }).join('');
  };

  const updateGotoUI = () => {
    tabWorld?.classList.toggle('active', activeGotoTab === 'world');
    tabInteriors?.classList.toggle('active', activeGotoTab === 'interiors');
    renderGotoCategories();
    renderGotoList();
  };

  tabWorld?.addEventListener('click', () => {
    activeGotoTab = 'world';
    activeGotoCat = 'Todos';
    store.set('gotoTab', 'world');
    updateGotoUI();
  });
  tabInteriors?.addEventListener('click', () => {
    activeGotoTab = 'interiors';
    activeGotoCat = 'Todos';
    store.set('gotoTab', 'interiors');
    updateGotoUI();
  });
  catEl?.addEventListener('click', (e) => {
    const btn = e.target.closest('.goto-cat-btn');
    if (!btn) return;
    activeGotoCat = btn.dataset.cat;
    catEl.querySelectorAll('.goto-cat-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === activeGotoCat));
    renderGotoList();
  });
  searchEl?.addEventListener('input', () => {
    renderGotoList();
  });

  placesEl?.addEventListener('click', (e) => {
    const b = e.target.closest('.place');
    if (!b) return;
    const tab = b.dataset.tab;
    const idx = +b.dataset.i;
    const list = tab === 'interiors' ? INTERIOR_PLACES : WORLD_PLACES;
    const p = list[idx];
    if (!p) return;
    if (tab === 'interiors') {
      app.emit('view-interiors', true);
      ed.goTo(p.x, p.y, p.z, p.yaw || 0);
      toast(`Teleportado para: ${p.name} (Interior ${p.interior})`, 'ok');
    } else {
      app.emit('view-interiors', false);
      ed.goTo(p.x, p.y, p.z, p.yaw || 0);
      toast(`Teleportado para: ${p.name}`, 'ok');
    }
    closePopovers();
  });

  updateGotoUI();
  $('#gotoBehind').checked = store.get('gotoBehind', true);
  $('#gotoBehind').onchange = () => store.set('gotoBehind', $('#gotoBehind').checked);
  $('#gotoForm').onsubmit = (e) => {
    e.preventDefault();
    const c = parseCoords($('#gotoInput').value);
    if (!c) { toast('Digite pelo menos x e y, por exemplo 2495.3, -1687.4, 13.5', 'warn'); return; }
    teleport(c);
    store.set('lastGoto', $('#gotoInput').value);
    closePopovers();
  };
  $('#gotoInput').value = store.get('lastGoto', '');
  // Placa: clique abre o teleporte, botão direito copia a posição
  const sign = $('#sign');
  sign.style.pointerEvents = 'auto';
  sign.addEventListener('click', (e) => { e.stopPropagation(); openGoto(); });
  sign.addEventListener('contextmenu', async (e) => {
    e.preventDefault();
    const p = app.vp.camera.position;
    await copyText(`${p.x.toFixed(4)}, ${p.y.toFixed(4)}, ${p.z.toFixed(4)}`);
    toast('Posição da câmera copiada');
  });
}

async function changeGtaFolder() {
  const r = await browseGta('');
  if (!r.path) return;
  if (!r.ok) { toast(r.problem || 'Essa pasta não serve.', 'error', 7000); return; }
  const data = await postJSON('/api/config', { gtaPath: r.path });
  if (!data.ok) { toast(data.error, 'error', 7000); return; }
  await saveNow();
  location.reload();
}

function openGoto() {
  const pop = $('#popGoto');
  if (pop.hidden) $('#btnGoto').click();
  setTimeout(() => {
    const input = $('#gotoInput');
    if (input) {
      input.focus({ preventScroll: true });
      input.select();
    }
  }, 0);
}

// Marcador do ponto de teleporte (some sozinho)
let marker = null, markerTimer = null;
function showMarker(p) {
  if (!marker) {
    marker = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color: 0xf0a630, transparent: true, opacity: 0.85, depthTest: false });
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.2, 16), mat);
    cone.rotation.x = -Math.PI / 2; cone.position.z = 1.4;
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.6, 0.85, 32), mat);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 40, 6), new THREE.MeshBasicMaterial({ color: 0xf0a630, transparent: true, opacity: 0.35, depthTest: false }));
    pole.rotation.x = Math.PI / 2; pole.position.z = 20;
    marker.add(cone, ring, pole);
    marker.traverse(o => { o.userData.noPick = true; o.renderOrder = 20; o.raycast = () => {}; });
    app.vp.scene.add(marker);
  }
  marker.position.set(p.x, p.y, p.z);
  marker.visible = true;
  clearTimeout(markerTimer);
  markerTimer = setTimeout(() => { marker.visible = false; }, 15000);
}

function groundAt(x, y, fromZ = 1200) {
  const rc = new THREE.Raycaster(new THREE.Vector3(x, y, fromZ), new THREE.Vector3(0, 0, -1), 0, fromZ + 200);
  if (app?.vp?.camera) rc.camera = app.vp.camera;
  const hit = rc.intersectObjects([app.editor.root, ...app.streamer.pickables()], true)
    .find(h => !h.object.userData.noPick && !h.object.isSprite && !h.object.userData?.isLabel && !h.object.userData?.isPickup && h.object.visible);
  return hit ? hit.point.z : null;
}

function teleport({ x, y, z, interior }) {
  stopPreview();
  if (interior !== null && interior !== undefined) app.emit('view-interiors', interior > 0);
  const fly = app.vp.fly;
  const finish = (zz) => {
    const p = new THREE.Vector3(x, y, zz);
    showMarker(p);
    if ($('#gotoBehind').checked) {
      const dir = new THREE.Vector3(Math.cos(fly.yaw), Math.sin(fly.yaw), 0);
      const eye = p.clone().addScaledVector(dir, -14); eye.z += 7;
      app.vp.camera.position.copy(eye);
      fly.lookAt(p);
    } else {
      fly.setPose(new THREE.Vector3(x, y, zz + 1.7), fly.yaw, -0.1);
    }
    app.streamer.invalidate();
    toast(`Teleportado para ${fmt(x, 2)}, ${fmt(y, 2)}, ${fmt(zz, 2)}`);
  };
  if (z !== null && z !== undefined) { finish(z); return; }
  // Sem z: vai para cima do ponto, espera o mapa carregar e desce até o chão
  fly.setPose(new THREE.Vector3(x, y, 150), fly.yaw, -0.6);
  app.streamer.update(app.vp.camera, true);
  let tries = 0;
  const wait = () => {
    const g = groundAt(x, y);
    if (g !== null || tries++ > 20) finish(g ?? 20);
    else setTimeout(wait, 250);
  };
  setTimeout(wait, 300);
}

function updateToolButtons() {
  const ed = app.editor;
  $$('[data-mode]').forEach(b => b.classList.toggle('active', b.dataset.mode === ed.mode));
  const isWorld = ed.space === 'world';
  $('#btnSpace span').textContent = isWorld ? 'Mundo' : 'Objeto';
  $('#btnSpace use').setAttribute('href', isWorld ? '#i-globe' : '#i-cube');
  $('#btnSpace').title = isWorld
    ? 'Eixos do Manipulador: Mundo (Global) — As setas seguem os eixos globais do mapa (Norte/Sul/Leste/Oeste) [Tecla L]'
    : 'Eixos do Manipulador: Objeto (Local) — As setas acompanham a rotação e inclinação própria do objeto [Tecla L]';
  $('#btnSnap').setAttribute('aria-pressed', ed.snap.enabled);
  updatePlacingHint();
}

function getEditableProjects() {
  const list = [app.project];
  if (app.editor?.extraProjects) {
    for (const entry of app.editor.extraProjects.values()) {
      if (!entry.readonly && entry.project) list.push(entry.project);
    }
  }
  return list;
}

function getTopUndo() {
  const projects = getEditableProjects();
  let bestProj = null, bestOp = null;
  for (const p of projects) {
    const op = p.undoStack[p.undoStack.length - 1];
    if (op) {
      if (!bestOp || (op._seq || 0) > (bestOp._seq || 0)) {
        bestOp = op;
        bestProj = p;
      }
    }
  }
  return { project: bestProj, op: bestOp };
}

function getTopRedo() {
  const projects = getEditableProjects();
  let bestProj = null, bestOp = null;
  for (const p of projects) {
    const op = p.redoStack[p.redoStack.length - 1];
    if (op) {
      if (!bestOp || (op._redoSeq || op._seq || 0) > (bestOp._redoSeq || bestOp._seq || 0)) {
        bestOp = op;
        bestProj = p;
      }
    }
  }
  return { project: bestProj, op: bestOp };
}

function updateUndoButtons() {
  const { project: uProj, op: u } = getTopUndo();
  const { project: rProj, op: r } = getTopRedo();
  $('#btnUndo').disabled = !u;
  $('#btnRedo').disabled = !r;
  const uSuffix = (uProj && uProj !== app.project) ? ` [${uProj.name}]` : '';
  const rSuffix = (rProj && rProj !== app.project) ? ` [${rProj.name}]` : '';
  $('#btnUndo').title = u ? `Desfazer: ${u.label}${uSuffix} (Ctrl+Z)` : 'Nada para desfazer';
  $('#btnRedo').title = r ? `Refazer: ${r.label}${rSuffix} (Ctrl+Y)` : 'Nada para refazer';
}

function doUndo() {
  const { project: uProj } = getTopUndo();
  if (uProj) {
    const l = uProj.undo();
    if (l) {
      const suffix = uProj !== app.project ? ` [${uProj.name}]` : '';
      toast('Desfeito: ' + l + suffix);
      updateUndoButtons();
    }
  }
}

function doRedo() {
  const { project: rProj } = getTopRedo();
  if (rProj) {
    const l = rProj.redo();
    if (l) {
      const suffix = rProj !== app.project ? ` [${rProj.name}]` : '';
      toast('Refeito: ' + l + suffix);
      updateUndoButtons();
    }
  }
}

let openPop = null;
function setupPopover(btnSel, popSel, onOpen) {
  const btn = $(btnSel), pop = $(popSel);
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const willOpen = pop.hidden;
    closePopovers();
    if (willOpen) { pop.hidden = false; openPop = pop; btn.setAttribute('aria-expanded', 'true'); onOpen?.(); }
  });
  pop.addEventListener('click', e => e.stopPropagation());
}
function closePopovers() {
  if (openPop) openPop.hidden = true;
  openPop = null;
  $$('[aria-expanded="true"]').forEach(b => { if (!b.closest('.cam-panel')) b.setAttribute('aria-expanded', 'false'); });
}
document.addEventListener('click', closePopovers);

function updatePlacingHint() {
  const ed = app.editor, h = $('#placingHint');
  if (!ed.placing && ed.mode === 'texture') {
    h.innerHTML = ed.matSel.length
      ? `Índice${ed.matSel.length > 1 ? 's' : ''} <b>${ed.matSel.join(', ')}</b> escolhido${ed.matSel.length > 1 ? 's' : ''}. Clique numa textura na aba Texturas ou edite no inspetor. Ctrl + clique soma índices, Shift + clique soma objetos.`
      : 'Ferramenta <b>Textura</b>: clique numa parte de um objeto do projeto para escolher o índice de material.';
    h.hidden = false;
    return;
  }
  if (!ed.placing) { h.hidden = true; return; }
  h.innerHTML = `Posicionando <b>${esc(modelLabel(ed.placing.model))}</b>. Clique para soltar, Shift + clique para soltar vários, R ou X para girar, Esc para cancelar.`;
  h.hidden = false;
}

function updateHud() {
  const vp = app.vp, streamer = app.streamer, texlib = app.texlib, p = vp.camera.position;
  $('#signArea').textContent = streamer.settings.interiors ? 'Interiores' : regionOf(p.x, p.y, p.z);
  $('#signCoords').textContent = `${p.x.toFixed(1)}   ${p.y.toFixed(1)}   ${p.z.toFixed(1)}`;
  const pend = streamer.stats.pending;
  const texPend = texlib.state === 'loading' ? `<span>texturas <b>${Math.round(100 * texlib.progress.done / Math.max(1, texlib.progress.total))}%</b></span>` : '';
  $('#hud').innerHTML = `<span><b>${vp.fps}</b> fps</span><span><b>${streamer.stats.shown.toLocaleString('pt-BR')}</b> no mapa</span>${pend ? `<span>carregando <b>${pend}</b></span>` : ''}${texPend}`;
  const pr = app.project;
  $('#emptyHint').hidden = hintDismissed || !(pr.objects.length + pr.vehicles.length + pr.removed.length === 0 && !app.editor.placing && !app.editor.worldSel);
}

// =====================================================================  abas
function setupTabs() {
  const show = (name) => {
    $$('.tab').forEach(o => { const on = o.dataset.tab === name; o.classList.toggle('active', on); o.setAttribute('aria-selected', on); });
    for (const n of ['catalog', 'textures', 'cameras', 'outline']) $('#tab-' + n).hidden = n !== name;
    if (name === 'catalog') renderCatalogRows();
    if (name === 'textures') { renderTexRows(); updateTarget(); }
    store.set('tab', name);
  };
  $$('.tab').forEach(t => t.onclick = () => show(t.dataset.tab));
  app.on('show-tab', show);
  const ed = app.editor;
  ed.addEventListener('slot', updatePlacingHint);
  ed.addEventListener('placing', updatePlacingHint);
  ed.addEventListener('notice', (e) => toast(e.detail.text, e.detail.kind || 'ok', 5000));
  app.vp.renderer.domElement.addEventListener('pointerdown', () => { hintDismissed = true; }, { once: true });
}

// =====================================================================  lista do projeto
function setupOutline() {
  app.outlineInverted = store.get('outlineInverted', false);

  const render = () => {
    const project = app.project, ed = app.editor;
    const q = $('#outlineSearch').value.trim().toLowerCase();
    const sel = new Set(ed.selection);
    const match = (o) => {
      const idStr = String(o.model ?? o.skin ?? '');
      const lbl = o.kind === 'actors' || o.skin !== undefined
        ? `Skin ${o.skin}`
        : (o.text || o.name || modelLabel(o.model));
      const cmt = o.comment || '';
      return !q || idStr.startsWith(q) || lbl.toLowerCase().includes(q) || cmt.toLowerCase().includes(q);
    };

    // Aplica inversão de ordem se configurada
    const order = (arr) => app.outlineInverted ? [...(arr || [])].reverse() : (arr || []);

    const allObjs = order(project.objects);
    const textObjs = allObjs.filter(o => o.materials?.some(isText));
    const texObjs = allObjs.filter(o => o.materials?.some(m => !isText(m)) && !o.materials?.some(isText));
    const regularObjs = allObjs.filter(o => !o.materials?.length);

    const group = (title, kind, items, icon, emptyMsg) => {
      const filtered = items.filter(match);
      const rows = filtered.map(o => {
        const extra = kind === 'removed'
          ? `<button type="button" class="btn icon" data-restore="${o.uid}" title="Restaurar objeto" aria-label="Restaurar"><svg><use href="#i-restore"/></svg></button>`
          : `<button type="button" class="btn icon" data-del="${o.uid}" data-del-kind="${kind}" title="Apagar" aria-label="Apagar"><svg><use href="#i-trash"/></svg></button>`;
        const mats = (kind === 'objects') && o.materials?.length ? `<span class="ol-tag" title="${o.materials.length} trocas de material">${o.materials.some(isText) ? 'Aa' : '◧'} ${o.materials.length}</span>` : '';
        let nameStr = modelLabel(o.model);
        let idVal = o.model;
        if (kind === 'actors') { nameStr = `Skin ${o.skin}`; idVal = o.skin; }
        else if (kind === 'labels') { nameStr = o.text || 'Texto 3D'; idVal = (o.drawDist || 50) + 'm'; }
        else if (kind === 'pickups') { nameStr = `Pickup #${o.model}`; idVal = `Tipo ${o.type || 1}`; }
        else if (kind === 'checkpoints') { nameStr = o.cpKind === 'race' ? `Race CP (Tipo ${o.type ?? 0})` : 'Checkpoint'; idVal = `R ${o.size ?? 4}`; }
        else if (kind === 'mapIcons') { nameStr = `MapIcon #${o.type ?? 0}`; idVal = `Estilo ${o.style ?? 0}`; }
        else if (kind === 'sounds') { nameStr = `Som #${o.soundid}`; idVal = `${o.x.toFixed(0)},${o.y.toFixed(0)}`; }
        else if (kind === 'gangZones') { nameStr = o.name || 'GangZone'; idVal = `${o.minx},${o.miny}`; }
        else if (kind === 'textDraws') { nameStr = o.text || 'TextDraw'; idVal = `Font ${o.font ?? 1}`; }
        const cmtStr = o.comment ? `<span class="ol-comment" style="color:var(--text-dim); font-size:11px; margin-left:4px; max-width:130px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${esc(o.comment)}">// ${esc(o.comment)}</span>` : '';
        return `<div class="ol-item${sel.has(o.uid) ? ' active' : ''}" data-uid="${o.uid}" data-kind="${kind}"><span class="ol-name">${esc(nameStr)}</span>${cmtStr}${mats}<span class="ol-id">${idVal}</span>${extra}</div>`;
      }).join('');
      const empty = filtered.length ? '' : `<div class="ol-empty">${emptyMsg || 'Nenhum item.'}</div>`;
      return `<div class="ol-group"><div class="ol-head"><svg><use href="#${icon}"/></svg>${title} <span class="count">${items.length}</span></div>${rows}${empty}</div>`;
    };

    $('#outline').innerHTML =
      group('Veículos', 'vehicles', order(project.vehicles), 'i-car', 'Nenhum veículo.') +
      group('Actors', 'actors', order(project.actors || []), 'i-actor', 'Nenhum actor criado.') +
      group('Textos 3D', 'labels', order(project.labels || []), 'i-text3d', 'Nenhum texto 3D criado.') +
      group('Pickups', 'pickups', order(project.pickups || []), 'i-diamond', 'Nenhum pickup criado.') +
      group('Checkpoints', 'checkpoints', order(project.checkpoints || []), 'i-flag', 'Nenhum checkpoint criado.') +
      group('MapIcons', 'mapIcons', order(project.mapIcons || []), 'i-pin', 'Nenhum mapicon criado.') +
      group('GangZones', 'gangZones', order(project.gangZones || []), 'i-map', 'Nenhuma gangzone criada.') +
      group('TextDraws', 'textDraws', order(project.textDraws || []), 'i-text', 'Nenhum textdraw criado.') +
      group('Objetos', 'objects', regularObjs, 'i-cube', 'Nenhum objeto padrão.') +
      group('Texturizações', 'objects', texObjs, 'i-image', 'Nenhum objeto texturizado.') +
      group('Texto em objetos', 'objects', textObjs, 'i-text', 'Nenhum objeto com texto.') +
      group('Objetos removidos', 'removed', order(project.removed), 'i-demolish', 'Clique num objeto do mapa e use "Remover objeto".');

    $('#outlineCount').textContent =
      project.objects.length +
      project.vehicles.length +
      (project.actors?.length || 0) +
      (project.labels?.length || 0) +
      (project.pickups?.length || 0) +
      (project.checkpoints?.length || 0) +
      (project.mapIcons?.length || 0) +
      (project.gangZones?.length || 0) +
      (project.textDraws?.length || 0) +
      project.removed.length;
  };

  const getSpawnTargetPoint = (offsetZ = 0.5) => {
    const vp = app.vp;
    if (!vp || !vp.camera) return { x: 0, y: 0, z: 10 };
    const cam = vp.camera;
    const dir = new THREE.Vector3();
    cam.getWorldDirection(dir);
    const target = cam.position.clone().add(dir.multiplyScalar(4.0));
    const groundZ = groundAt(target.x, target.y, Math.max(target.z + 5.0, cam.position.z + 5.0));
    const finalZ = groundZ !== null ? (groundZ + offsetZ) : target.z;
    return {
      x: Math.round(target.x * 100) / 100,
      y: Math.round(target.y * 100) / 100,
      z: Math.round(finalZ * 100) / 100,
    };
  };

  const btnAdd3DText = $('#btnAdd3DText');
  const create3DTextAction = () => {
    openCreate3DTextPanel();
  };

  if (btnAdd3DText) {
    btnAdd3DText.onclick = create3DTextAction;
  }
  const btn3DTextTop = $('#btn3DText');
  if (btn3DTextTop) {
    btn3DTextTop.onclick = create3DTextAction;
  }

  const btnAddPickup = $('#btnAddPickup');
  if (btnAddPickup) {
    btnAddPickup.onclick = () => {
      const ed = app.editor;
      const pt = getSpawnTargetPoint(0.98);
      const pk = {
        uid: null,
        model: 1240, // Saúde (Health / Coração)
        type: 1,
        x: pt.x, y: pt.y, z: pt.z,
        world: -1,
      };
      if (!app.project.pickups) app.project.pickups = [];
      const item = app.project.add('pickups', pk, 'Criar Pickup');
      ed.syncAll();
      ed.select([item.uid]);
      toast('Pickup criado no mapa!', 'ok');
    };
  }

  const btnInvert = $('#btnInvertOutline');
  if (btnInvert) {
    btnInvert.onclick = () => {
      app.outlineInverted = !app.outlineInverted;
      store.set('outlineInverted', app.outlineInverted);
      btnInvert.classList.toggle('active', app.outlineInverted);
      toast(app.outlineInverted ? 'Ordem invertida (mais recentes primeiro)' : 'Ordem normal (mais antigos primeiro)');
      render();
    };
    if (app.outlineInverted) btnInvert.classList.add('active');
  }

  const btnClear = $('#btnClearProject');
  if (btnClear) {
    btnClear.onclick = async () => {
      const total = (app.project.objects?.length || 0) + (app.project.vehicles?.length || 0) + (app.project.actors?.length || 0) +
        (app.project.labels?.length || 0) + (app.project.pickups?.length || 0) + (app.project.gangZones?.length || 0) +
        (app.project.textDraws?.length || 0) + (app.project.checkpoints?.length || 0) + (app.project.mapIcons?.length || 0) +
        (app.project.sounds?.length || 0) + (app.project.removed?.length || 0);
      if (!total) { toast('O projeto já está vazio', 'warn'); return; }
      if (!await showConfirm(`Tem certeza que deseja apagar todos os ${total} elementos do projeto "${app.project.name}"?\nEsta ação limpará todos os objetos, veículos, actors, textos 3D, checkpoints, mapicons, sons e remoções.`, { danger: true, confirmText: 'Apagar tudo' })) return;
      const before = app.project.snapshotAll();
      app.editor.clearSelection();
      app.project.clearAll();
      app.editor.syncAll();
      app.editor.updateHiddenWorld();
      app.project.record('Apagar tudo', before, []);
      toast('Todos os elementos do projeto foram apagados');
      render();
    };
  }

  let t = null;
  const later = () => { clearTimeout(t); t = setTimeout(render, 60); };
  $('#outlineSearch').addEventListener('input', render);
  app.editor.addEventListener('selection', later);
  app.on('project-change', later);
  app.on('project', render);
  $('#outline').addEventListener('click', (e) => {
    const project = app.project, ed = app.editor;
    const del = e.target.closest('[data-del]'), res = e.target.closest('[data-restore]');
    if (del) {
      const kind = del.dataset.delKind;
      if (kind && kind !== 'objects' && kind !== 'vehicles' && kind !== 'actors') {
        const arr = project[kind];
        if (arr) {
          const idx = arr.findIndex(item => item.uid === del.dataset.del);
          if (idx >= 0) {
            arr.splice(idx, 1);
            ed.syncAll();
            project.saveUndoState?.('Excluir ' + kind);
            render();
            return;
          }
        }
      }
      project.deleteItems('Apagar', [del.dataset.del]);
      return;
    }
    if (res) { ed.restoreRemoved([res.dataset.restore]); toast('Objeto restaurado'); return; }
    const it = e.target.closest('.ol-item'); if (!it) return;
    if (it.dataset.kind === 'gangZones') {
      openGangZoneDialog();
      return;
    }
    if (it.dataset.kind === 'textDraws') {
      openTextDrawEditor();
      return;
    }
    if (it.dataset.kind === 'removed') {
      const r = project.find(it.dataset.uid);
      ed.goTo(r.x - 30, r.y - 30, r.z + 25, Math.PI / 4);
      return;
    }
    ed.select([it.dataset.uid], e.shiftKey || e.ctrlKey);
  });
  $('#outline').addEventListener('dblclick', (e) => { if (e.target.closest('.ol-item')) app.editor.focusSelection(); });
}

// =====================================================================  teclado
function setupKeys() {
  $('#btnHelp').onclick = () => $('#dlgHelp').showModal();
  window.addEventListener('keydown', (e) => {
    const ctrl = e.ctrlKey || e.metaKey;
    const k = e.key.toLowerCase();
    if (ctrl && k === 's') { e.preventDefault(); saveNow(); toast('Projeto salvo'); return; }
    if (ctrl && k === 'g') { e.preventDefault(); openGoto(); return; }
    if (e.key === 'Escape') closePopovers();
    if (isTyping(e) || document.querySelector('dialog[open]')) return;
    if (ctrl && k === 'z' && !e.shiftKey) { e.preventDefault(); doUndo(); return; }
    if (ctrl && (k === 'y' || (k === 'z' && e.shiftKey))) { e.preventDefault(); doRedo(); return; }
    if (e.key === '?' || (e.key === '/' && e.shiftKey)) { $('#dlgHelp').showModal(); return; }
    if (app.editor.handleKey(e)) e.preventDefault();
  });
}

boot();
