// Notice of a newer release: asked once per version, then only the alert on the version history button remains
import { $ } from './common.js';
import { t } from './i18n.js';

let info = null;

// The newer release found by the server, or null when there is none (or it could not be checked)
export const getUpdate = () => (info && info.ok && info.newer ? info : null);

export const updateDownloadUrl = (u) => u.download || u.url;

function refreshBadge() {
  const btn = $('#btnAbout');
  if (!btn) return;
  const u = getUpdate();
  const title = u ? `Update History - version ${u.version} available` : 'Update History';
  btn.classList.toggle('has-update', !!u);
  btn.title = title;
  btn.setAttribute('aria-label', title);
}

async function remember(version) {
  if (info) info.acknowledged = version;
  try {
    await fetch('/api/update_ack', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ version }) });
  } catch { /* asked again next time */ }
}

export async function initUpdateCheck() {
  try { info = await (await fetch('/api/update_check', { cache: 'no-store' })).json(); } catch { return; }
  const u = getUpdate();
  refreshBadge();
  if (!u || info.acknowledged === u.version) return;
  const dlg = $('#dlgUpdate');
  if (!dlg) return;
  $('#updMsg').textContent = t('A versão {0} do SA Map Studio já está disponível (você usa a {1}). Deseja baixar agora?', u.version, info.current);
  let answered = false;
  const answer = (download) => {
    if (answered) return;
    answered = true;
    remember(u.version);
    dlg.close();
    if (download) window.open(updateDownloadUrl(u), '_blank', 'noopener');
  };
  $('#updNow').onclick = () => answer(true);
  $('#updLater').onclick = () => answer(false);
  dlg.addEventListener('cancel', () => { answered || remember(u.version); answered = true; }, { once: true });
  dlg.showModal();
}
