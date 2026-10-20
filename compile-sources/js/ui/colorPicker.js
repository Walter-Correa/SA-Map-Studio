// Custom color picker for all <input type="color"> in the editor.
// WebView2 (the editor window) does not open the browser's native picker, so the click on the field is
// intercepted and opens this panel: saturation/brightness square, hue bar, hexadecimal code and
// ready-made colors. On choosing, the field value changes and the "input" and "change" events are fired,
// as with the native picker, so anything already listening to the field keeps working.

const SWATCHES = [
  '#ffffff', '#e0e0e0', '#9e9e9e', '#545454', '#000000', '#f44336', '#e91e63', '#9c27b0',
  '#3f51b5', '#2196f3', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#ffeb3b', '#ffc107',
  '#ff9800', '#ff5722', '#795548', '#f0a630', '#12603a', '#b71c1c', '#0d47a1', '#607d8b',
];

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const toHex = (n) => Math.round(n).toString(16).padStart(2, '0');

function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  const n = m ? parseInt(m[1], 16) : 0xffffff;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const rgbToHex = (r, g, b) => '#' + toHex(r) + toHex(g) + toHex(b);

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6; if (h < 0) h += 1;
  }
  return [h, max ? d / max : 0, max];
}

function hsvToRgb(h, s, v) {
  const i = Math.floor(h * 6), f = h * 6 - i;
  const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
  const [r, g, b] = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][((i % 6) + 6) % 6];
  return [r * 255, g * 255, b * 255];
}

let panel = null, current = null;

function close(commit) {
  if (!panel) return;
  const { input, start } = current;
  panel.remove();
  panel = null;
  current = null;
  document.removeEventListener('pointerdown', outside, true);
  document.removeEventListener('keydown', onKey, true);
  if (!commit && input.value !== start) {
    input.value = start;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
  if (input.value !== start || commit) input.dispatchEvent(new Event('change', { bubbles: true }));
}

function outside(e) { if (panel && !panel.contains(e.target) && e.target !== current?.input) close(true); }
function onKey(e) {
  if (!panel) return;
  if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(false); }
  else if (e.key === 'Enter' && e.target?.classList?.contains('cp-hex')) { e.preventDefault(); close(true); }
}

function open(input) {
  if (panel) close(true);
  const host = input.closest('dialog[open]') || document.body;
  panel = document.createElement('div');
  panel.className = 'cp-panel';
  panel.innerHTML = `
    <div class="cp-sv"><canvas width="200" height="130"></canvas><span class="cp-dot"></span></div>
    <div class="cp-hue"><span class="cp-knob"></span></div>
    <div class="cp-row"><span class="cp-prev"></span><input class="cp-hex" spellcheck="false" maxlength="7" aria-label="Cor em hexadecimal">
      <button type="button" class="btn small primary cp-ok">OK</button></div>
    <div class="cp-sw">${SWATCHES.map(c => `<button type="button" style="background:${c}" data-c="${c}" aria-label="Cor ${c}"></button>`).join('')}</div>`;
  host.appendChild(panel);
  current = { input, start: input.value, hsv: rgbToHsv(...hexToRgb(input.value)) };

  const sv = panel.querySelector('.cp-sv'), canvas = sv.querySelector('canvas'), dot = sv.querySelector('.cp-dot');
  const hue = panel.querySelector('.cp-hue'), knob = hue.querySelector('.cp-knob');
  const hex = panel.querySelector('.cp-hex'), prev = panel.querySelector('.cp-prev');
  const ctx = canvas.getContext('2d');

  const paint = (fromHex = false) => {
    const [h, s, v] = current.hsv;
    const [hr, hg, hb] = hsvToRgb(h, 1, 1);
    ctx.fillStyle = `rgb(${hr},${hg},${hb})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const white = ctx.createLinearGradient(0, 0, canvas.width, 0);
    white.addColorStop(0, '#fff'); white.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = white; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const black = ctx.createLinearGradient(0, 0, 0, canvas.height);
    black.addColorStop(0, 'rgba(0,0,0,0)'); black.addColorStop(1, '#000');
    ctx.fillStyle = black; ctx.fillRect(0, 0, canvas.width, canvas.height);
    dot.style.left = (s * 100) + '%';
    dot.style.top = ((1 - v) * 100) + '%';
    knob.style.left = (h * 100) + '%';
    const value = rgbToHex(...hsvToRgb(h, s, v));
    prev.style.background = value;
    if (!fromHex) hex.value = value;
    if (input.value !== value) {
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  const drag = (el, move) => (e) => {
    e.preventDefault();
    const r = el.getBoundingClientRect();
    const at = (ev) => move(clamp01((ev.clientX - r.left) / r.width), clamp01((ev.clientY - r.top) / r.height));
    at(e);
    const mm = (ev) => at(ev);
    const up = () => { window.removeEventListener('pointermove', mm); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', mm);
    window.addEventListener('pointerup', up);
  };
  sv.addEventListener('pointerdown', drag(sv, (x, y) => { current.hsv[1] = x; current.hsv[2] = 1 - y; paint(); }));
  hue.addEventListener('pointerdown', drag(hue, (x) => { current.hsv[0] = Math.min(x, 0.9999); paint(); }));
  hex.addEventListener('input', () => {
    const v = hex.value.trim().replace(/^([0-9a-f]{6})$/i, '#$1');
    if (/^#[0-9a-f]{6}$/i.test(v)) { current.hsv = rgbToHsv(...hexToRgb(v)); paint(true); }
  });
  panel.querySelectorAll('.cp-sw button').forEach(b => b.onclick = () => { current.hsv = rgbToHsv(...hexToRgb(b.dataset.c)); paint(); });
  panel.querySelector('.cp-ok').onclick = () => close(true);

  // Position: right below the field (or above, if it does not fit), always inside the window
  paint();
  const r = input.getBoundingClientRect(), w = panel.offsetWidth, h = panel.offsetHeight;
  const left = Math.min(Math.max(8, r.left), window.innerWidth - w - 8);
  let top = r.bottom + 6;
  if (top + h > window.innerHeight - 8) top = r.top - h - 6;
  top = Math.max(8, Math.min(top, window.innerHeight - h - 8));
  panel.style.left = left + 'px';
  panel.style.top = top + 'px';
  document.addEventListener('pointerdown', outside, true);
  document.addEventListener('keydown', onKey, true);
}

// Intercepts the click on any <input type="color"> (including ones created later)
export function installColorPicker() {
  document.addEventListener('click', (e) => {
    const input = e.target?.closest?.('input[type="color"]');
    if (!input || input.disabled) return;
    e.preventDefault();
    if (panel && current?.input === input) { close(true); return; }
    open(input);
  }, true);
}
