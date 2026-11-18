// SPDX-License-Identifier: MPL-2.0
import { uiLocale, t } from './i18n.js';
// Projects: autosave, open (saving and closing the current one), create, rename and delete.
import * as THREE from 'three';
import { Project, newModId } from '../editor/project.js';
import { sampMissing } from '../editor/importers.js';
import { app, $, esc, store, toast, showConfirm } from './common.js';

let currentName = null;
let unsub = null;
const saveTimers = new Map();   // the projects with a save waiting (each one leaves the list when it is saved)

function setSaveState(text, cls = '') {
  const el = $('#saveState');
  if (!el) return;
  el.textContent = text;
  el.className = 'save-state ' + cls;
}
export const isDirty = () => $('#saveState')?.classList.contains('dirty');

export function scheduleSave(project = app.project) {
  if (project === app.project) setSaveState('Não salvo', 'dirty');
  if (saveTimers.has(project)) clearTimeout(saveTimers.get(project));
  const t = setTimeout(() => saveProject(project), 1200);
  saveTimers.set(project, t);
}

let chain = Promise.resolve();

export function saveProject(project) {
  if (!project) return Promise.resolve();
  if (saveTimers.has(project)) {
    clearTimeout(saveTimers.get(project));
    saveTimers.delete(project);
  }
  chain = chain.then(() => doSave(project));
  return chain;
}

// Edit windows (TextDraws, MapIcons, GangZones) work directly on the project:
// on closing (X, Done or Esc), saves right away if anything changed since the window opened
export function autosaveOnClose(dialogEl, kind) {
  if (!dialogEl) return;
  let before = null;
  const snap = () => JSON.stringify(app.project?.[kind] || []);
  // While the window is open, an edit marks the project as not saved (closing the browser then saves it first)
  // (checked after the window's own handlers ran: in the capture phase a change, like a picked <select> option, is not applied yet)
  const markDirty = () => setTimeout(() => {
    if (dialogEl.open && before !== null && app.project && !isDirty() && snap() !== before) setSaveState('Não salvo', 'dirty');
  });
  for (const ev of ['input', 'change', 'pointerup', 'keyup']) dialogEl.addEventListener(ev, markDirty, true);
  // The "open" attribute changes with any way of opening or closing the <dialog>
  new MutationObserver(() => {
    if (dialogEl.open) {
      if (before === null) before = snap();
      return;
    }
    const changed = before !== null && app.project && snap() !== before;
    before = null;
    if (!changed) return;
    app.project.modified = true;
    saveProject(app.project);
    app.emit('project-change', { type: 'edit', kind });
  }).observe(dialogEl, { attributes: true, attributeFilter: ['open'] });
}

export function saveNow() {
  const list = [app.project, ...(app.editor?.extraProjects ? [...app.editor.extraProjects.values()].map(e => e.project) : [])];
  return Promise.all(list.map(p => saveProject(p)));
}

// Selection that counts for resuming the project: only the project's own items. A world object, an item of a
// coexisting project or nothing selected (for example after deleting) leave the project with no selection.
function resumableSelection(project) {
  const ed = app.editor;
  if (!ed || ed.worldSelection?.length) return [];
  const sel = ed.selection || [];
  if (!sel.length || sel.some(u => !project.kindOf(u))) return [];
  return [...sel];
}

async function doSave(project) {
  if (!project) return;
  if (app.project === project) setSaveState('Salvando', 'dirty');
  if (app.project === project) {
    const p = app.vp.camera.position;
    project.camera = { x: p.x, y: p.y, z: p.z, yaw: app.vp.fly.yaw, pitch: app.vp.fly.pitch };
    project.lastSelection = resumableSelection(project);
  }
  try {
    const res = await fetch(projUrl(project.name), { method: 'POST', body: JSON.stringify(project.toJSON()) });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    if (app.project === project) { currentName = project.name; store.set(lastKey(), project.name); setSaveState('Salvo'); }
    setBackup(project.name, null);
    return true;
  } catch {
    if (app.project === project) setSaveState('Erro ao salvar', 'error');
    // Kept in the browser: restored on the next start if the file is still older than it (see restoreBackup)
    setBackup(project.name, { v: 2, at: Date.now(), name: project.name, mode: Project.defaultMode, project: project.toJSON() });
    return false;
  }
}

// Copies of the saves that failed, kept in the browser: one per project (name and mode), so a failed save of one project never
// takes the place of another's. The old single copy ("backup") moves into the list the first time it is read
const backupKey = (name, mode = Project.defaultMode) => (mode || 'mp') + ':' + safeName(name).toLowerCase();
function getBackups() {
  const all = store.get('backups', null);
  const list = all && typeof all === 'object' && !Array.isArray(all) ? all : {};
  const old = store.get('backup', null);
  if (old) {
    if (old.v === 2 && old.project && old.name != null) {
      const k = backupKey(old.name, old.mode);
      if (!list[k] || !(list[k].at >= old.at)) list[k] = old;
    }
    store.set('backups', list);
    try { localStorage.removeItem('samap.backup'); } catch { /* no storage */ }
  }
  return list;
}
function setBackup(name, value, mode = Project.defaultMode) {
  const list = getBackups(), k = backupKey(name, mode);
  if (value) list[k] = value;
  else if (k in list) delete list[k];
  else return;
  store.set('backups', list);
}

// The name of the project file: the same cleaning as the server's safe_name (letters and digits of any language, _ - . space and
// parentheses; anything else becomes _; no spaces or dots at the ends; at most 80 characters). The project's name is always this one,
// so the open project is the one in the list, and two names that make the same file are the same name
const WINDOWS_RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
export function safeName(name) {
  let s = String(name ?? '').normalize('NFC').replace(/[^\p{L}\p{N}_\-. ()]+/gu, '_').replace(/^[ .]+|[ .]+$/g, '');
  s = Array.from(s).slice(0, 80).join('') || 'sem_nome';
  // CON, NUL, COM1... are devices on Windows, not files: the server puts a _ before them (and so does the name here)
  if (WINDOWS_RESERVED.test(s.split('.')[0].trim())) s = '_' + s;
  return s;
}
// Windows does not tell "Casa" from "casa": the same file
export const sameName = (a, b) => a != null && b != null && safeName(a).toLowerCase() === safeName(b).toLowerCase();

// Each mode keeps its projects in its own folder (projects/multiplayer, projects/singleplayer)
const projUrl = (name) => '/api/projects/' + encodeURIComponent(name) + '?mode=' + Project.defaultMode;
const lastKey = () => (Project.defaultMode === 'sp' ? 'lastProjectSp' : 'lastProject');

export async function listProjects() {
  try {
    const data = await (await fetch('/api/projects?mode=' + Project.defaultMode)).json();
    // Each mode only sees its own projects
    data.projects = (data.projects || []).filter(p => (p.mode || 'mp') === Project.defaultMode);
    return data;
  } catch { return { projects: [], folder: '' }; }
}

export async function uniqueName(base) {
  const { projects } = await listProjects();
  const names = new Set(projects.map(p => safeName(p.name).toLowerCase()));
  base = safeName(base);
  let n = base, i = 2;
  while (names.has(n.toLowerCase())) {
    const suffix = ` ${i++}`;
    n = safeName(Array.from(base).slice(0, 80 - suffix.length).join('') + suffix);
  }
  return n;
}

async function fetchProject(name) {
  const res = await fetch(projUrl(name));
  if (!res.ok) throw new Error('Projeto não encontrado');
  const p = Project.fromJSON(await res.json());
  // The name inside the file can be one the file name does not match (made before the cleaning, or a file renamed by hand): the file wins
  p.name = sameName(p.name, name) ? safeName(p.name) : safeName(name);
  return p;
}

// A save that failed left a copy in the browser: when it is still newer than the file (or the file is gone), it is saved back
async function restoreBackup() {
  const mine = Object.values(getBackups()).filter(b => (b?.mode || 'mp') === Project.defaultMode);
  if (!mine.length) return;
  const { projects } = await listProjects();
  for (const b of mine) {
    const file = projects.find(p => sameName(p.name, b.name));
    if (file && file.modified * 1000 >= b.at) { setBackup(b.name, null); continue; }
    try {
      const res = await fetch(projUrl(b.name), { method: 'POST', body: JSON.stringify(b.project) });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      setBackup(b.name, null);
      toast(t('As alterações de "{0}" que não tinham sido salvas foram recuperadas.', b.name), 'ok', 8000);
    } catch { /* stays for the next start */ }
  }
}

// Camera on open or import: computes the center of all the project's items and focuses on the item closest to it
const SPATIAL_KINDS = ['objects', 'vehicles', 'actors', 'labels', 'pickups', 'checkpoints', 'mapIcons', 'spawns'];

export function projectFocusItem(p) {
  const items = SPATIAL_KINDS.flatMap(k => p?.[k] || [])
    .filter(o => Number.isFinite(o?.x) && Number.isFinite(o?.y) && Number.isFinite(o?.z));
  if (!items.length) return null;
  const c = items.reduce((a, o) => ({ x: a.x + o.x, y: a.y + o.y, z: a.z + o.z }), { x: 0, y: 0, z: 0 });
  c.x /= items.length; c.y /= items.length; c.z /= items.length;
  let nearest = items[0], best = Infinity;
  for (const o of items) {
    const d = (o.x - c.x) ** 2 + (o.y - c.y) ** 2 + (o.z - c.z) ** 2;
    if (d < best) { best = d; nearest = o; }
  }
  return nearest;
}

export function positionCameraOverProject(p) {
  if (!p) return;
  const focus = projectFocusItem(p);
  if (!focus) {
    if (p.camera) {
      const c = p.camera;
      app.vp.fly.setPose(new THREE.Vector3(c.x, c.y, c.z), c.yaw, c.pitch);
    }
    return;
  }
  const target = new THREE.Vector3(focus.x, focus.y, focus.z);
  app.vp.camera.position.set(focus.x, focus.y - 14, focus.z + 8);
  app.vp.fly.lookAt(target);
  app.streamer.invalidate();
}

// Puts the project in the editor (the previous one must already have been saved)
// keepCamera: uses the camera saved in the project instead of focusing on the items' center
export function useProject(p, { keepCamera = false } = {}) {
  unsub?.();
  app.emit('project-closing');
  app.editor.cancelPlacing();
  app.project = p;
  unsub = p.on((ch) => { scheduleSave(); app.emit('project-change', ch); });
  app.editor.setProject(p);
  $('#projectName').value = p.name;
  const resume = (p.lastSelection || []).filter(u => p.kindOf(u));
  if (keepCamera && p.camera) app.vp.fly.setPose(new THREE.Vector3(p.camera.x, p.camera.y, p.camera.z), p.camera.yaw, p.camera.pitch);
  else if (resume.length && resume.length === p.lastSelection.length && resume.length <= 60) {
    // Resumes where it left off: selects the last items, turns on the gizmo and takes the camera to it (a big selection, like the one that Auto Criar
    // leaves, is not restored: it made the project take too long to open)
    app.editor.select(resume);
    app.editor.focusGizmo();
  } else positionCameraOverProject(p);
  app.streamer.invalidate();
  currentName = p.name;
  store.set(lastKey(), p.name);
  setSaveState('Salvo');
  app.emit('project', p);
  // Objects of SA-MP in a project, and SA-MP is not installed: they are not loaded
  const lost = sampMissing(p.objects, app.gd);
  if (lost) toast(t('Objetos do SA-MP não carregados porque o SA-MP não está instalado: {0}.', lost), 'warn', 12000);
}

// Opens another project: saves and closes the one that was open
export async function switchTo(nameOrProject) {
  const old = app.project;
  const saved = await saveNow();
  if (old && saved[0] === false) throw new Error(t('Não consegui salvar "{0}". Ele continua aberto.', old.name));
  const next = typeof nameOrProject === 'string' ? await fetchProject(nameOrProject) : nameOrProject;
  useProject(next);
  if (typeof nameOrProject !== 'string') await saveNow();
  if (old && !sameName(old.name, next.name)) toast(`"${old.name}" foi salvo e fechado. "${next.name}" está aberto.`, 'ok', 4000);
  return next;
}

export async function openInitialProject() {
  try { await restoreBackup(); } catch { /* the server is not answering: nothing to restore now */ }
  const last = store.get(lastKey(), null);
  if (last) { try { useProject(await fetchProject(last)); app.initialProjectLoaded = true; return; } catch { /* abre outro */ } }
  const list = await listProjects();
  for (const p of list.projects) { try { useProject(await fetchProject(p.name)); return; } catch { /* next */ } }
  // First editor launch: starts with the example map, at the camera saved in it
  if (Project.defaultMode !== 'sp') try {
    const ex = await (await fetch('/api/example_project')).json();
    if (ex.ok && ex.project) {
      useProject(Project.fromJSON(ex.project), { keepCamera: true });
      saveNow();
      app.initialProjectLoaded = true;
      return;
    }
  } catch { /* no example: empty project */ }
  useProject(new Project('Meu mapa'));
  saveNow();
  app.initialProjectLoaded = true;
}

async function renameProject(newName) {
  const project = app.project;
  newName = newName.trim().replace(/[\\/:*?"<>|]+/g, '-').slice(0, 80);
  if (!newName || safeName(newName) === project.name) { $('#projectName').value = project.name; return; }
  const oldName = project.name, old = currentName;
  // Only the case changes ("casa" -> "Casa"): the same file, which must not be deleted afterwards
  const sameFile = sameName(newName, oldName);
  newName = sameFile ? safeName(newName) : await uniqueName(newName);
  project.name = newName;
  $('#projectName').value = newName;
  // The old file is only deleted once the new one was saved (it was deleted even when the save failed)
  if (!await saveProject(project)) {
    project.name = oldName;
    $('#projectName').value = oldName;
    // (the copy kept in the browser goes back to the name of its file too)
    const backup = sameFile ? null : getBackups()[backupKey(newName)];
    if (backup?.project) {
      setBackup(newName, null);
      setBackup(oldName, { ...backup, name: oldName, project: { ...backup.project, name: oldName } });
    }
    toast(t('Não consegui salvar "{0}". O nome continua "{1}".', newName, oldName), 'error', 6000);
    app.emit('project-renamed', project);
    return;
  }
  // A copy of the old name, kept from an earlier failed save, would bring the old project back on the next start
  if (!sameFile) setBackup(oldName, null);
  if (old && !sameName(old, newName)) await fetch(projUrl(old), { method: 'DELETE' });
  toast(`Projeto renomeado para "${newName}"`);
  app.emit('project-renamed', project);
}

async function openProjectsDialog() {
  const dlg = $('#dlgProjects');
  const { projects, folder } = await listProjects();
  const ul = $('#projectList');
  ul.innerHTML = projects.length ? '' : '<li class="ol-empty">Nenhum projeto salvo ainda.</li>';
  for (const p of projects) {
    const li = document.createElement('li');
    const isCurrent = sameName(p.name, app.project.name);
    const extraEntry = app.editor.extraProjects?.get(p.name) || [...(app.editor.extraProjects?.values() || [])].find(e => sameName(e.project.name, p.name));
    const isCoexisting = !!extraEntry;
    const extraKey = extraEntry ? extraEntry.project.name : p.name;
    const isReadonly = !!extraEntry?.readonly;

    const counts = isCurrent ? {
      objects: app.project.objects?.length || 0,
      vehicles: app.project.vehicles?.length || 0,
      actors: app.project.actors?.length || 0,
      pickups: app.project.pickups?.length || 0,
      labels: app.project.labels?.length || 0,
      gangZones: app.project.gangZones?.length || 0,
      mapIcons: app.project.mapIcons?.length || 0,
      checkpoints: app.project.checkpoints?.length || 0,
      textDraws: app.project.textDraws?.length || 0,
      removed: app.project.removed?.length || 0,
    } : {
      objects: p.counts?.objects || 0,
      vehicles: p.counts?.vehicles || 0,
      actors: p.counts?.actors || 0,
      pickups: p.counts?.pickups || 0,
      labels: p.counts?.labels || 0,
      gangZones: p.counts?.gangZones || 0,
      mapIcons: p.counts?.mapIcons || 0,
      checkpoints: p.counts?.checkpoints || 0,
      textDraws: p.counts?.textDraws || 0,
      removed: p.counts?.removed || 0,
    };
    const statsLine = Project.defaultMode === 'sp' ? `Objetos: ${counts.objects} | Veículos: ${counts.vehicles} | Actors: ${counts.actors} | Pickups: ${counts.pickups} | Removidos: ${counts.removed}` : `Objetos: ${counts.objects} | Veículos: ${counts.vehicles} | Actors: ${counts.actors} | Pickups: ${counts.pickups} | 3D Texts: ${counts.labels} | GangZones: ${counts.gangZones} | Map Icons: ${counts.mapIcons} | Checkpoints: ${counts.checkpoints} | TextDraws: ${counts.textDraws} | Removidos: ${counts.removed}`;

    if (isCurrent) li.className = 'current';
    li.innerHTML = `
      <div style="flex:1; display:flex; flex-direction:column; gap:2px; min-width: 140px;">
        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
          <span class="pl-name">${esc(p.name)}</span>
          ${isCurrent ? '<span class="tag" style="background:var(--accent); color:#fff; font-size:10px;">Ativo</span>' : ''}
          ${isCoexisting ? `<span class="tag" style="background:${isReadonly ? '#64748b' : '#3b82f6'}; color:#fff; font-size:10px;">${isReadonly ? 'Coexistindo (Não editável)' : 'Coexistindo (Editável)'}</span>` : ''}
        </div>
        <span class="pl-date">${new Date(p.modified * 1000).toLocaleString(uiLocale(), { dateStyle: 'short', timeStyle: 'short' })}</span>
        <span class="pl-stats" style="font-size:11px; color:var(--paper-dim); margin-top:2px; line-height:1.3;">${statsLine}</span>
      </div>
      <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
        ${isCurrent ? '<button type="button" class="btn small" disabled>Aberto</button>' : '<button type="button" class="btn small" data-open title="Salvar atual e abrir este projeto">Abrir</button>'}
        ${!isCurrent ? (isCoexisting ? `
          <button type="button" class="btn small ghost" data-toggle-coexist title="Alternar entre modo Editável e Não editável">${isReadonly ? 'Tornar editável' : 'Tornar não editável'}</button>
          <button type="button" class="btn small ghost danger" data-uncoexist title="Remover visualização deste projeto do mundo">Fechar</button>
        ` : `
          <button type="button" class="btn small ghost" data-coexist="editable" title="Coexistir permitindo selecionar e editar seus objetos (salva no próprio projeto)">Coexistir (Editável)</button>
          <button type="button" class="btn small ghost" data-coexist="readonly" title="Coexistir no mundo somente para visualização (bloqueia seleção)">Coexistir (Não editável)</button>
        `) : ''}
        ${!isCurrent ? '<button type="button" class="btn small ghost" data-merge title="Mesclar todos os elementos deste projeto no projeto ativo">Mesclar</button>' : ''}
        <button type="button" class="btn icon danger" data-del title="Apagar projeto"><svg><use href="#i-trash"/></svg></button>
      </div>`;

    const btnOpen = li.querySelector('[data-open]');
    if (btnOpen) {
      btnOpen.onclick = async () => {
        try { await switchTo(p.name); dlg.close(); }
        catch (err) { toast(`Não consegui abrir: ${err.message}`, 'error'); }
      };
    }

    li.querySelectorAll('[data-coexist]').forEach(btn => {
      btn.onclick = async () => {
        const mode = btn.dataset.coexist;
        try {
          const other = await fetchProject(p.name);
          app.editor.addExtraProject(other, { readonly: mode === 'readonly' });
          toast(`Projeto "${p.name}" carregado e coexistindo no mundo (${mode === 'readonly' ? 'Não editável' : 'Editável'})!`, 'ok', 4000);
          openProjectsDialog();
        } catch (err) {
          toast(`Não consegui carregar para coexistir: ${err.message}`, 'error');
        }
      };
    });

    const btnToggleCoexist = li.querySelector('[data-toggle-coexist]');
    if (btnToggleCoexist) {
      btnToggleCoexist.onclick = () => {
        const entry = app.editor.extraProjects?.get(extraKey);
        if (entry) {
          entry.readonly = !entry.readonly;
          app.editor.syncAll();
          app.editor.clearSelection();
          toast(`Projeto "${p.name}" agora é ${entry.readonly ? 'Não editável (somente leitura)' : 'Editável'}.`, 'ok');
          openProjectsDialog();
        }
      };
    }

    const btnUncoexist = li.querySelector('[data-uncoexist]');
    if (btnUncoexist) {
      btnUncoexist.onclick = () => {
        app.editor.removeExtraProject(extraKey);
        toast(`Projeto "${p.name}" removido da visualização do mundo.`);
        openProjectsDialog();
      };
    }

    const btnMerge = li.querySelector('[data-merge]');
    if (btnMerge) {
      btnMerge.onclick = async () => {
        if (!await showConfirm(`Deseja mesclar todos os objetos, veículos e elementos do projeto "${p.name}" no projeto ativo "${app.project.name}"?`, { confirmText: 'Mesclar' })) return;
        try {
          const other = await fetchProject(p.name);
          const uids = app.project.mergeProject(other);
          toast(`${uids.length} itens mesclados de "${p.name}" para "${app.project.name}"!`, 'ok', 5000);
          dlg.close();
        } catch (err) {
          toast(`Erro ao mesclar projeto: ${err.message}`, 'error');
        }
      };
    }

    li.querySelector('[data-del]').onclick = async () => {
      if (!await showConfirm(`Apagar o projeto "${p.name}"? Essa ação não pode ser desfeita.`, { danger: true, confirmText: 'Apagar' })) return;
      if (extraEntry) app.editor.removeExtraProject(extraKey);
      await fetch(projUrl(p.name), { method: 'DELETE' });
      if (isCurrent) { useProject(new Project(await uniqueName('Meu mapa'))); saveNow(); }
      openProjectsDialog();
    };

    ul.appendChild(li);
  }
  $('#projectsFolder').textContent = folder ? `Os projetos ficam em ${folder}` : '';
  $('#newProjectName').value = '';
  if (!dlg.open) dlg.showModal();
}

// The program was closed and opened again while this page stayed open: the page still has the old session, so the server
// refuses every call to the API (403). Once, the changes not saved yet are kept in the browser (the save fails and leaves its
// copy, restored on the next start) and a notice asks to reload the page. Reloading is the user's choice: it never repeats by itself
let sessionLost = false, leaving = false;
function watchSession() {
  const fetch0 = window.fetch.bind(window);
  const isApi = (input) => {
    try {
      const u = new URL(typeof input === 'string' || input instanceof URL ? input : input.url, location.href);
      return u.origin === location.origin && u.pathname.startsWith('/api/');
    } catch { return false; }
  };
  window.fetch = async (input, init) => {
    const res = await fetch0(input, init);
    if (res.status === 403 && !sessionLost && isApi(input)) onSessionLost();
    return res;
  };
}
async function keepUnsaved() {
  const list = new Set(saveTimers.keys());
  if (isDirty() && app.project) list.add(app.project);
  await Promise.all([...list].map(p => saveProject(p).catch(() => false)));
}
async function onSessionLost() {
  sessionLost = true;
  await keepUnsaved();
  const reload = await showConfirm(t('O SA Map Studio foi reiniciado e esta página perdeu a conexão com ele. Recarregue a página para continuar: as alterações que não foram salvas ficaram guardadas no navegador e serão recuperadas.'),
    { confirmText: t('Recarregar a página'), cancelText: t('Agora não') });
  if (!reload) return;
  await keepUnsaved();
  leaving = true;
  location.reload();
}

export function setupProjects() {
  const nameInput = $('#projectName');
  nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') nameInput.blur(); if (e.key === 'Escape') { nameInput.value = app.project.name; nameInput.blur(); } });
  nameInput.addEventListener('change', () => renameProject(nameInput.value));
  $('#btnProjects').onclick = openProjectsDialog;
  // Enter in the name of the new project creates it (it closed the window before)
  $('#newProjectName').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); $('#newProjectBtn').click(); }
  });
  let creating = false;   // (a second Enter or click while it is being created does not make another project)
  $('#newProjectBtn').onclick = async () => {
    if (creating) return;
    creating = true;
    try {
      const name = await uniqueName(($('#newProjectName').value || 'Novo mapa').trim());
      try { await switchTo(new Project(name)); }
      catch (err) { toast(err.message, 'error', 6000); return; }
      $('#dlgProjects').close();
    } finally { creating = false; }
  };
  const btnOpenExt = $('#openExternalProjectBtn');
  const fileExt = $('#externalProjectFileInput');
  if (btnOpenExt && fileExt) {
    btnOpenExt.onclick = () => fileExt.click();
    fileExt.onchange = async () => {
      const file = fileExt.files?.[0];
      fileExt.value = '';
      if (!file) return;
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        const nameFromFile = file.name.replace(/\.[^/.]+$/, '').trim();
        if (!json.name && nameFromFile) json.name = nameFromFile;
        const project = Project.fromJSON(json);
        const before = project.name;
        project.name = await uniqueName(project.name);
        // a copy of a project that is already here gets its own permanent id (the installed mod stays with the original)
        if (project.modId && ((await listProjects()).projects || []).some(p => p.modId === project.modId)) project.modId = newModId();
        if (!sameName(before, project.name)) toast(t('Já existe um projeto "{0}": o arquivo foi aberto como "{1}".', safeName(before), project.name), 'warn', 7000);
        await switchTo(project);
        $('#dlgProjects').close();
        toast(`Projeto "${project.name}" carregado com sucesso!`, 'ok');
      } catch (err) {
        toast(`Erro ao abrir arquivo .json: ${err.message}`, 'error', 5000);
      }
    };
  }
  // Called by the program window (serve.py) before closing: saves everything and only then the window closes
  window.__samapSaveAll = () => saveNow().then(() => true, () => false);
  watchSession();
  window.addEventListener('beforeunload', (e) => {
    if (leaving) return;
    if (isDirty()) { saveNow(); e.preventDefault(); e.returnValue = ''; }
  });
}
