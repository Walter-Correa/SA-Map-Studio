// Hover preview: a big picture in the middle of the screen while the mouse is over an item of a list.
// It closes when the mouse leaves the item, on click, on scroll and when the list is rebuilt.
// describe(el) -> { src, title, sub, large } where large() may return a Promise of a bigger picture (an object URL).
let pop = null, current = null, timer = 0, token = 0, ownUrl = '';

export function hideHoverPreview() {
  clearTimeout(timer);
  current = null;
  token++;
  if (pop) pop.hidden = true;
  if (ownUrl) { URL.revokeObjectURL(ownUrl); ownUrl = ''; }
}

function show(el, describe) {
  if (!pop) {
    pop = document.createElement('div');
    pop.className = 'thumb-pop';
    pop.hidden = true;
    pop.innerHTML = '<img alt=""><div class="thumb-pop-title"></div><div class="thumb-pop-sub"></div>';
    document.body.appendChild(pop);
  }
  const info = describe(el);
  if (!info) return;
  const mine = ++token;
  const img = pop.querySelector('img');
  img.src = info.src || '';
  pop.querySelector('.thumb-pop-title').textContent = info.title || '';
  pop.querySelector('.thumb-pop-sub').textContent = info.sub || '';
  pop.hidden = false;
  if (!info.large) return;
  // The saved picture is small: the bigger one replaces it when it is ready
  Promise.resolve(info.large()).then((url) => {
    if (!url) return;
    if (mine !== token) { URL.revokeObjectURL(url); return; }
    if (ownUrl) URL.revokeObjectURL(ownUrl);
    ownUrl = url;
    img.src = url;
  }).catch(() => {});
}

export function attachHoverPreview(container, selector, describe) {
  container.addEventListener('mouseover', (e) => {
    const el = e.target.closest(selector);
    if (el === current) return;
    hideHoverPreview();
    if (!el) return;
    current = el;
    timer = setTimeout(() => { if (current === el && el.isConnected) show(el, describe); }, 180);
  });
  container.addEventListener('mouseleave', hideHoverPreview);
  container.addEventListener('mousedown', hideHoverPreview);
  container.addEventListener('click', hideHoverPreview);
  container.addEventListener('wheel', hideHoverPreview, { passive: true });
  container.addEventListener('scroll', hideHoverPreview, { passive: true });
}
