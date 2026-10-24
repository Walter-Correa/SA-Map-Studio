// Singleplayer wording: what the multiplayer editor calls an "actor" is a "NPC" here. The words are replaced in the page as it changes
// (only when the language is Portuguese; the other languages have their own translations).
import { getLanguage } from './i18n.js';

const swap = (s) => s.replace(/\bActors\b/g, 'NPCs').replace(/\bActor\b/g, 'NPC').replace(/\bactors\b/g, 'NPCs').replace(/\bactor\b/g, 'NPC');
const fix = (node) => {
  if (node.nodeType === 3) {
    const v = node.nodeValue;
    if (/[Aa]ctor/.test(v)) { const n = swap(v); if (n !== v) node.nodeValue = n; } // setting the same text again would fire the observer again
  } else if (node.nodeType === 1) {
    for (const a of ['title', 'placeholder', 'aria-label']) {
      const v = node.getAttribute(a);
      if (v && /[Aa]ctor/.test(v)) { const n = swap(v); if (n !== v) node.setAttribute(a, n); }
    }
    for (const c of node.childNodes) fix(c);
  }
};

export function startSpWords(root) {
  if (getLanguage() !== 'pt') return;
  fix(root);
  new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === 'characterData') fix(r.target);
      else if (r.type === 'attributes') fix(r.target);
      else r.addedNodes.forEach(fix);
    }
  }).observe(root, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['title', 'placeholder', 'aria-label'] });
}
