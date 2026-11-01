import { uiLocale, t } from './i18n.js';
// Utilities shared by the interface and the "app" object with the main pieces.
export const $ = (s, r = document) => r.querySelector(s);
// Value of a CSS variable of the current theme (canvases cannot use var()), with a fallback
export const themeVar = (name, fallback) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const fmt = (v, d = 4) => { const s = (Number(v) || 0).toFixed(d); return s.includes('.') ? s.replace(/\.?0+$/, '') || '0' : s; };
export const plural = (n, um, varios) => `${n.toLocaleString(uiLocale())} ${n === 1 ? um : varios}`;

export const store = {
  get(k, def) { try { const v = localStorage.getItem('samap.' + k); return v === null ? def : JSON.parse(v); } catch { return def; } },
  set(k, v) { try { localStorage.setItem('samap.' + k, JSON.stringify(v)); } catch { /* no storage */ } },
};

// Program pieces (filled in at initialization)
export const app = {
  gd: null, vp: null, models: null, streamer: null, editor: null, thumbs: null, texlib: null,
  project: null,
  bus: new EventTarget(),
  emit(type, detail) { this.bus.dispatchEvent(new CustomEvent(type, { detail })); },
  on(type, fn) { this.bus.addEventListener(type, (e) => fn(e.detail)); },
};
if (typeof window !== 'undefined') window.app = app;

// Keyboard arrows in the edit windows: 1 unit per press (0.1 with Shift), limited repeat
// so fine adjustment does not run away. Returns { dx, dy, first } or null when the key is not an arrow.
let lastArrowAt = 0;
export function arrowStep(e) {
  const dirs = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  const d = dirs[e.key];
  if (!d) return null;
  const tag = document.activeElement?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return null;
  e.preventDefault();
  e.stopPropagation();
  const now = performance.now();
  if (e.repeat && now - lastArrowAt < 80) return { dx: 0, dy: 0, first: false };
  lastArrowAt = now;
  const step = e.shiftKey ? 0.1 : 1;
  return { dx: d[0] * step, dy: d[1] * step, first: !e.repeat };
}

export function toast(msg, kind = 'ok', ms = 2800) {
  const el = document.createElement('div');
  el.className = 'toast ' + kind;
  el.textContent = msg;
  // A modal dialog sits in the top layer above #toasts, so while one is open the notice goes inside it.
  const dlg = document.querySelector('dialog[open]');
  let box = $('#toasts');
  if (dlg) {
    box = [...dlg.children].find(c => c.classList.contains('toasts'));
    if (!box) { box = document.createElement('div'); box.className = 'toasts'; dlg.appendChild(box); }
  }
  box.appendChild(el);
  setTimeout(() => el.remove(), ms);
}

export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); }
  catch {
    const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); ta.remove();
  }
}

export function modelLabel(id) {
  const d = app.gd?.models.get(id);
  if (!d) return `modelo ${id}`;
  return d.type === 'cars' && d.gameName ? d.gameName : d.model;
}

export async function postJSON(url, body) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body ?? {}) });
  return res.json();
}

// Reads coordinates from free text: "x, y, z", "x y z", SetPlayerPos(playerid, x, y, z), etc.
export function parseCoords(text) {
  const s = String(text || '');
  const call = /\(\s*(?:playerid\s*,\s*)?([^)]*)\)/i.exec(s);
  const src = call ? call[1] : s;
  const n = (src.match(/-?\d+(?:\.\d+)?(?:e-?\d+)?/gi) || []).map(Number).filter(Number.isFinite);
  if (n.length < 2) return null;
  const interior = /interior\s*[(:=]?\s*(?:playerid\s*,\s*)?(\d+)/i.exec(s);
  return { x: n[0], y: n[1], z: n.length >= 3 ? n[2] : null, interior: interior ? +interior[1] : null };
}

// Drag the axis letter to adjust a number
export function bindScrub(el, { get, set, step = 0.02, done }) {
  el.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    try { el.setPointerCapture(e.pointerId); } catch (_) {}
    const startX = e.clientX, start = get();
    const move = (ev) => set(Math.round((start + (ev.clientX - startX) * step * (ev.shiftKey ? 0.1 : 1)) * 10000) / 10000);
    const up = () => {
      try { el.releasePointerCapture(e.pointerId); } catch (_) {}
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      done?.();
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
  });
}

// Modal dialog for text / nickname input
export function showPrompt({ title = 'Definir apelido', desc = '', value = '', placeholder = '' } = {}) {
  return new Promise((resolve) => {
    let dlg = $('#dlgPrompt');
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.id = 'dlgPrompt';
      dlg.className = 'dialog narrow';
      dlg.innerHTML = `
        <form method="dialog" class="dialog-body" id="promptForm">
          <header class="dialog-head"><h2 id="promptTitle"></h2><button class="btn icon" type="button" id="promptCloseBtn" aria-label="Fechar"><svg><use href="#i-x"/></svg></button></header>
          <div style="padding: 16px; display: grid; gap: 12px;">
            <p id="promptDesc" style="margin: 0; font-size: 13px; color: var(--paper-dim); line-height: 1.4;"></p>
            <input id="promptInput" class="input" type="text" style="width: 100%; box-sizing: border-box; padding: 8px 10px; border-radius: var(--radius-s); background: var(--asphalt-700); border: 1px solid var(--line); color: var(--paper);" autocomplete="off">
            <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px;">
              <button type="button" class="btn ghost" id="promptCancel">Cancelar</button>
              <button type="submit" class="btn primary" id="promptOk">Salvar</button>
            </div>
          </div>
        </form>
      `;
      document.body.appendChild(dlg);
    }
    const t = $('#promptTitle', dlg);
    const d = $('#promptDesc', dlg);
    const inp = $('#promptInput', dlg);
    const form = $('#promptForm', dlg);
    const closeBtn = $('#promptCloseBtn', dlg);
    const cancelBtn = $('#promptCancel', dlg);

    if (t) t.textContent = title;
    if (d) d.textContent = desc;
    if (inp) {
      inp.value = value;
      inp.placeholder = placeholder;
    }

    let closed = false;
    const finish = (val) => {
      if (closed) return;
      closed = true;
      try { dlg.close(); } catch {}
      resolve(val);
    };

    if (closeBtn) closeBtn.onclick = () => finish(null);
    if (cancelBtn) cancelBtn.onclick = () => finish(null);
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        finish(inp.value.trim());
      };
    }
    dlg.oncancel = () => finish(null);

    dlg.showModal();
    setTimeout(() => { if (inp) { inp.focus(); inp.select(); } }, 60);
  });
}

// Confirmation dialog with the editor's standard design (centered, title "SA Map Studio")
export function showConfirm(message, {
  title = 'SA Map Studio',
  confirmText = 'OK',
  cancelText = 'Cancelar',
  danger = false,
  html = false,
} = {}) {
  return new Promise((resolve) => {
    let dlg = $('#dlgConfirm');
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.id = 'dlgConfirm';
      dlg.className = 'dialog narrow';
      dlg.style.cssText = 'max-width: 440px; border-radius: 12px; background: #1a1e24; border: 1px solid rgba(255,255,255,0.14); box-shadow: 0 24px 60px rgba(0,0,0,0.65); padding: 0; overflow: hidden;';
      dlg.innerHTML = `
        <form method="dialog" class="dialog-body" id="confirmForm" style="display: flex; flex-direction: column; margin: 0;">
          <header class="dialog-head" style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.08); background: #15181d; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <svg class="brand-mark" viewBox="0 0 120 120" style="width: 26px; height: 26px;" aria-hidden="true"><use href="#i-brand-logo"/></svg>
              <h2 id="confirmTitle" style="margin: 0; font-size: 14px; font-weight: 700; color: #fff; letter-spacing: 0.3px;">SA Map Studio</h2>
            </div>
            <button class="btn icon" type="button" id="confirmCloseBtn" aria-label="Fechar" style="width: 28px; height: 28px;"><svg><use href="#i-x"/></svg></button>
          </header>
          <div style="padding: 20px 22px; display: flex; flex-direction: column; gap: 16px;">
            <p id="confirmMsg" style="margin: 0; font-size: 13.5px; color: #e2e8f0; line-height: 1.5; white-space: pre-wrap; word-break: break-word;"></p>
            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 4px;">
              <button type="button" class="btn ghost" id="confirmCancelBtn" style="padding: 7px 16px; font-weight: 600;">Cancelar</button>
              <button type="submit" class="btn primary" id="confirmOkBtn" style="padding: 7px 20px; font-weight: 600;">OK</button>
            </div>
          </div>
        </form>
      `;
      document.body.appendChild(dlg);
    }

    const t = $('#confirmTitle', dlg);
    const m = $('#confirmMsg', dlg);
    const form = $('#confirmForm', dlg);
    const closeBtn = $('#confirmCloseBtn', dlg);
    const cancelBtn = $('#confirmCancelBtn', dlg);
    const okBtn = $('#confirmOkBtn', dlg);

    if (t) t.textContent = title;
    if (m) { if (html) m.innerHTML = message; else m.textContent = message; }
    if (cancelBtn) {
      cancelBtn.style.display = '';
      cancelBtn.textContent = cancelText;
    }
    if (okBtn) {
      okBtn.textContent = confirmText;
      okBtn.className = danger ? 'btn danger' : 'btn primary';
    }

    let closed = false;
    const finish = (val) => {
      if (closed) return;
      closed = true;
      try { dlg.close(); } catch {}
      resolve(val);
    };

    if (closeBtn) closeBtn.onclick = () => finish(false);
    if (cancelBtn) cancelBtn.onclick = () => finish(false);
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        finish(true);
      };
    }
    dlg.oncancel = () => finish(false);

    dlg.showModal();
    setTimeout(() => { if (okBtn) okBtn.focus(); }, 60);
  });
}

// Simple alert dialog (OK button only)
export function showAlert(message, { title = 'SA Map Studio', okText = 'OK', html = false } = {}) {
  return new Promise((resolve) => {
    let dlg = $('#dlgConfirm');
    if (!dlg) {
      showConfirm(message, { title, confirmText: okText }).then(resolve);
      return;
    }
    const t = $('#confirmTitle', dlg);
    const m = $('#confirmMsg', dlg);
    const form = $('#confirmForm', dlg);
    const closeBtn = $('#confirmCloseBtn', dlg);
    const cancelBtn = $('#confirmCancelBtn', dlg);
    const okBtn = $('#confirmOkBtn', dlg);

    if (t) t.textContent = title;
    if (m) { if (html) m.innerHTML = message; else m.textContent = message; m.style.whiteSpace = html ? 'normal' : ''; }
    if (cancelBtn) cancelBtn.style.display = 'none';
    if (okBtn) {
      okBtn.textContent = okText;
      okBtn.className = 'btn primary';
    }

    let closed = false;
    const finish = () => {
      if (closed) return;
      closed = true;
      try { dlg.close(); } catch {}
      if (cancelBtn) cancelBtn.style.display = '';
      resolve();
    };

    if (closeBtn) closeBtn.onclick = finish;
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        finish();
      };
    }
    dlg.oncancel = finish;

    dlg.showModal();
    setTimeout(() => { if (okBtn) okBtn.focus(); }, 60);
  });
}

if (typeof window !== 'undefined') {
  window.showConfirm = showConfirm;
  window.showAlert = showAlert;
}


// A number typed in a field that has limits (min and max) is held inside them as soon as the field is left, and the screen says so: nothing is cut silently
// (over the most goes to the most, under the least goes to the least). The fields without a number are left as they are.
export function installLimitClamp() {
  document.addEventListener('change', (e) => {
    const el = e.target;
    if (!(el instanceof HTMLInputElement) || el.type !== 'number' || el.value === '') return;
    const lo = el.min !== '' ? +el.min : -Infinity, hi = el.max !== '' ? +el.max : Infinity;
    const v = +el.value;
    if (!Number.isFinite(v) || (v >= lo && v <= hi)) return;
    const to = v > hi ? hi : lo;
    el.value = to;
    toast(t('Valor fora do limite: ajustado para {0}.', to), 'warn', 3500);
  }, true);
}
