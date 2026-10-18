// Projetos: salvar automático, abrir (salvando e fechando o atual), criar, renomear e apagar.
import * as THREE from 'three';
import { Project } from '../editor/project.js';
import { app, $, esc, store, toast, showConfirm } from './common.js';

let currentName = null;
let unsub = null;
const saveTimers = new WeakMap();

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

export function saveNow() {
  const list = [app.project, ...(app.editor?.extraProjects ? [...app.editor.extraProjects.values()].map(e => e.project) : [])];
  return Promise.all(list.map(p => saveProject(p)));
}

async function doSave(project) {
  if (!project) return;
  if (app.project === project) setSaveState('Salvando', 'dirty');
  if (app.project === project) {
    const p = app.vp.camera.position;
    project.camera = { x: p.x, y: p.y, z: p.z, yaw: app.vp.fly.yaw, pitch: app.vp.fly.pitch };
  }
  try {
    const res = await fetch('/api/projects/' + encodeURIComponent(project.name), { method: 'POST', body: JSON.stringify(project.toJSON()) });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    if (app.project === project) { currentName = project.name; store.set('lastProject', project.name); setSaveState('Salvo'); }
  } catch {
    if (app.project === project) setSaveState('Erro ao salvar', 'error');
    store.set('backup', project.toJSON());
  }
}

export async function listProjects() {
  try { return await (await fetch('/api/projects')).json(); } catch { return { projects: [], folder: '' }; }
}

export async function uniqueName(base) {
  const { projects } = await listProjects();
  const names = new Set(projects.map(p => p.name.toLowerCase()));
  let n = base, i = 2;
  while (names.has(n.toLowerCase())) n = `${base} ${i++}`;
  return n;
}

async function fetchProject(name) {
  const res = await fetch('/api/projects/' + encodeURIComponent(name));
  if (!res.ok) throw new Error('Projeto não encontrado');
  return Project.fromJSON(await res.json());
}

export function positionCameraOverProject(p) {
  if (!p) return;
  const all = [...(p.objects || []), ...(p.vehicles || []), ...(p.actors || [])];
  if (!all.length) {
    if (p.camera) {
      const c = p.camera;
      app.vp.fly.setPose(new THREE.Vector3(c.x, c.y, c.z), c.yaw, c.pitch);
    }
    return;
  }
  // Foca no objeto do projeto mais próximo do centro do mapa (0, 0, 0)
  let nearest = null;
  let minDist = Infinity;
  for (const o of all) {
    if (typeof o.x === 'number' && typeof o.y === 'number' && typeof o.z === 'number') {
      const d = Math.hypot(o.x, o.y, o.z);
      if (d < minDist) {
        minDist = d;
        nearest = o;
      }
    }
  }

  if (nearest) {
    const target = new THREE.Vector3(nearest.x, nearest.y, nearest.z);
    const camPos = new THREE.Vector3(nearest.x, nearest.y - 14, nearest.z + 8);
    app.vp.camera.position.copy(camPos);
    app.vp.fly.lookAt(target);
  } else {
    const o = all[0];
    const target = new THREE.Vector3(o.x || 0, o.y || 0, o.z || 0);
    const camPos = new THREE.Vector3((o.x || 0), (o.y || 0) - 14, (o.z || 0) + 8);
    app.vp.camera.position.copy(camPos);
    app.vp.fly.lookAt(target);
  }
  app.streamer.invalidate();
}

// Coloca o projeto no editor (o anterior já deve ter sido salvo)
export function useProject(p) {
  unsub?.();
  app.emit('project-closing');
  app.editor.cancelPlacing();
  app.project = p;
  unsub = p.on((ch) => { scheduleSave(); app.emit('project-change', ch); });
  app.editor.setProject(p);
  $('#projectName').value = p.name;
  positionCameraOverProject(p);
  app.streamer.invalidate();
  currentName = p.name;
  store.set('lastProject', p.name);
  setSaveState('Salvo');
  app.emit('project', p);
}

// Abre outro projeto: salva e fecha o que estava aberto
export async function switchTo(nameOrProject) {
  const old = app.project;
  await saveNow();
  const next = typeof nameOrProject === 'string' ? await fetchProject(nameOrProject) : nameOrProject;
  useProject(next);
  if (typeof nameOrProject !== 'string') await saveNow();
  if (old && old.name !== next.name) toast(`"${old.name}" foi salvo e fechado. "${next.name}" está aberto.`, 'ok', 4000);
  return next;
}

export async function openInitialProject() {
  const last = store.get('lastProject', null);
  if (last) { try { useProject(await fetchProject(last)); app.initialProjectLoaded = true; return; } catch { /* abre outro */ } }
  const list = await listProjects();
  for (const p of list.projects) { try { useProject(await fetchProject(p.name)); return; } catch { /* próximo */ } }
  useProject(new Project('Meu mapa'));
  saveNow();
  app.initialProjectLoaded = true;
}

async function renameProject(newName) {
  const project = app.project;
  newName = newName.trim().replace(/[\\/:*?"<>|]+/g, '-').slice(0, 80);
  if (!newName || newName === project.name) { $('#projectName').value = project.name; return; }
  const old = currentName;
  newName = await uniqueName(newName);
  project.name = newName;
  $('#projectName').value = newName;
  await saveNow();
  if (old && old !== newName) await fetch('/api/projects/' + encodeURIComponent(old), { method: 'DELETE' });
  toast('Projeto renomeado para "' + newName + '"');
}

async function openProjectsDialog() {
  const dlg = $('#dlgProjects');
  const { projects, folder } = await listProjects();
  const ul = $('#projectList');
  ul.innerHTML = projects.length ? '' : '<li class="ol-empty">Nenhum projeto salvo ainda.</li>';
  for (const p of projects) {
    const li = document.createElement('li');
    const isCurrent = p.name === app.project.name;
    const extraEntry = app.editor.extraProjects?.get(p.name);
    const isCoexisting = !!extraEntry;
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
    const statsLine = `Objetos: ${counts.objects} | Veículos: ${counts.vehicles} | Actors: ${counts.actors} | Pickups: ${counts.pickups} | 3D Texts: ${counts.labels} | GangZones: ${counts.gangZones} | Map Icons: ${counts.mapIcons} | Checkpoints: ${counts.checkpoints} | TextDraws: ${counts.textDraws} | Removidos: ${counts.removed}`;

    if (isCurrent) li.className = 'current';
    li.innerHTML = `
      <div style="flex:1; display:flex; flex-direction:column; gap:2px; min-width: 140px;">
        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
          <span class="pl-name">${esc(p.name)}</span>
          ${isCurrent ? '<span class="tag" style="background:var(--accent); color:#fff; font-size:10px;">Ativo</span>' : ''}
          ${isCoexisting ? `<span class="tag" style="background:${isReadonly ? '#64748b' : '#3b82f6'}; color:#fff; font-size:10px;">${isReadonly ? 'Coexistindo (Não editável)' : 'Coexistindo (Editável)'}</span>` : ''}
        </div>
        <span class="pl-date">${new Date(p.modified * 1000).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
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
        catch (err) { toast('Não consegui abrir: ' + err.message, 'error'); }
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
          toast('Não consegui carregar para coexistir: ' + err.message, 'error');
        }
      };
    });

    const btnToggleCoexist = li.querySelector('[data-toggle-coexist]');
    if (btnToggleCoexist) {
      btnToggleCoexist.onclick = () => {
        const entry = app.editor.extraProjects?.get(p.name);
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
        app.editor.removeExtraProject(p.name);
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
          toast('Erro ao mesclar projeto: ' + err.message, 'error');
        }
      };
    }

    li.querySelector('[data-del]').onclick = async () => {
      if (!await showConfirm(`Apagar o projeto "${p.name}"? Essa ação não pode ser desfeita.`, { danger: true, confirmText: 'Apagar' })) return;
      if (app.editor.extraProjects?.has(p.name)) app.editor.removeExtraProject(p.name);
      await fetch('/api/projects/' + encodeURIComponent(p.name), { method: 'DELETE' });
      if (p.name === app.project.name) { useProject(new Project(await uniqueName('Meu mapa'))); saveNow(); }
      openProjectsDialog();
    };

    ul.appendChild(li);
  }
  $('#projectsFolder').textContent = folder ? 'Os projetos ficam em ' + folder : '';
  $('#newProjectName').value = '';
  if (!dlg.open) dlg.showModal();
}

export function setupProjects() {
  const nameInput = $('#projectName');
  nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') nameInput.blur(); if (e.key === 'Escape') { nameInput.value = app.project.name; nameInput.blur(); } });
  nameInput.addEventListener('change', () => renameProject(nameInput.value));
  $('#btnProjects').onclick = openProjectsDialog;
  $('#newProjectBtn').onclick = async () => {
    const name = await uniqueName(($('#newProjectName').value || 'Novo mapa').trim());
    await switchTo(new Project(name));
    $('#dlgProjects').close();
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
        await switchTo(project);
        $('#dlgProjects').close();
        toast(`Projeto "${project.name}" carregado com sucesso!`, 'ok');
      } catch (err) {
        toast('Erro ao abrir arquivo .json: ' + err.message, 'error', 5000);
      }
    };
  }
  window.addEventListener('beforeunload', (e) => {
    if (isDirty()) { saveNow(); e.preventDefault(); e.returnValue = ''; }
  });
}
