// Interface languages.
// The code is written in Portuguese. Each js/lang/<code>.json file holds the translation of each text: the
// key is the Portuguese text (without the edge spaces) and the variable parts are {0}, {1}, ...
// Translation happens right on the page: every text and text attribute (title, placeholder, aria-label,
// alt) that appears is swapped for the chosen language's version, including what is created later (windows,
// notices, lists). When switching language everything goes back to the original and is translated again, without restarting.
// What sits in text fields, in <code>/<pre> and inside translate="no" or .no-i18n is not translated
// (Pawn code, names typed by the user). Text drawn on canvas uses t().
import { postJSON } from './common.js';

export const SOURCE_LANG = 'pt';
const FALLBACK_LANG = 'en';
const TEXT_ATTRS = ['title', 'placeholder', 'aria-label', 'alt'];
// translate="no" / .no-i18n: nothing is translated. In the rest, the content stays as is, but attributes
// (placeholder, title, aria-label) are translated, like a textarea's placeholder.
const NO_TRANSLATE = '[translate="no"], .no-i18n';
const NO_CONTENT = 'script, style, textarea, code, pre, svg';
const SKIP_SELECTOR = `${NO_TRANSLATE}, ${NO_CONTENT}`;

let languages = [];          // [{ code, name, windows, script }] from languages.json
let current = SOURCE_LANG;
let tables = [];             // [{ exact: Map, patterns: [] }] of the current language and the fallback
const cache = new Map();     // code -> Promise<file object>
const textState = new WeakMap(); // text node -> { orig, shown }
const attrState = new WeakMap(); // elemento -> { [atributo]: { orig, shown } }
let observer = null;
const listeners = new Set();
export const missing = new Set(); // untranslated texts seen on screen (to complete the files)

// ---------------------------------------------------------------------------- translation

// Plural forms: the translation can be an object { one, few, many, other } (the categories of the language's
// Intl.PluralRules) instead of text. The form is chosen by the number of the variable part
// "count" (default {0}). E.g. in ru.json: "{0} objetos": { "one": "{0} объект", "few": "{0} объекта",
// "many": "{0} объектов", "other": "{0} объекта" }. Portuguese only has singular and plural (plural()).
const PLURAL_FORMS = ['zero', 'one', 'two', 'few', 'many', 'other'];
const isForms = (v) => v && typeof v === 'object' && typeof v.other === 'string';
function pickForm(value, args, rules) {
  if (!isForms(value)) return value;
  const raw = String(args[value.count ?? 0] ?? '').replace(/[^\d.,-]/g, '');
  const n = Number(raw.replace(/[.,](?=\d{3}(\D|$))/g, '').replace(',', '.'));
  const form = Number.isFinite(n) && raw !== '' ? rules.select(n) : 'other';
  return value[form] || value.other;
}

function compile(data, code) {
  const exact = new Map(), patterns = [];
  let rules;
  try { rules = new Intl.PluralRules(code === SOURCE_LANG ? 'pt-BR' : code); } catch { rules = new Intl.PluralRules('en'); }
  for (const [key, value] of Object.entries(data || {})) {
    if (key.startsWith('_') || !(typeof value === 'string' ? value : isForms(value))) continue;
    exact.set(key, value);
    if (!/\{\d+\}/.test(key)) continue;
    const pieces = key.split(/(\{\d+\})/);
    const order = [];
    let longest = '';
    const src = pieces.map(p => {
      const m = p.match(/^\{(\d+)\}$/);
      if (m) { order.push(+m[1]); return '([\\s\\S]+?)'; }
      if (p.length > longest.length) longest = p;
      return p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }).join('');
    if (!/[A-Za-zÀ-ÿ]/.test(longest)) continue; // only variable parts: would match anything
    patterns.push({ re: new RegExp('^' + src + '$'), order, value, hint: longest, weight: key.replace(/\{\d+\}/g, '').length });
  }
  patterns.sort((a, b) => b.weight - a.weight);
  return { exact, patterns, rules };
}

function fill(value, args, rules) {
  if (rules) value = pickForm(value, args, rules);
  else if (isForms(value)) value = value.other;
  return value.replace(/\{(\d+)\}/g, (all, i) => (args[+i] !== undefined ? args[+i] : all));
}

// depth: how many levels of variable parts can still be translated (0 = exact text only)
function lookup(core, depth = 2) {
  for (const table of tables) {
    const hit = table.exact.get(core);
    if (hit !== undefined) return isForms(hit) ? hit.other : hit;
  }
  if (depth <= 0) return null;
  for (const table of tables) {
    for (const p of table.patterns) {
      if (p.hint && !core.includes(p.hint)) continue;
      const m = core.match(p.re);
      if (!m) continue;
      const args = [];
      p.order.forEach((n, i) => { args[n] = translatePart(m[i + 1], depth - 1); });
      return fill(p.value, args, table.rules);
    }
  }
  return null;
}

// Variable part that is also interface text: "Desfeito: Mover", "Encontrei 3 objetos, 1 veículo"
function translatePart(part, depth) {
  const s = part.trim();
  if (!s || !/[A-Za-zÀ-ÿ]/.test(s)) return part;
  const hit = lookup(s, depth);
  if (hit !== null) return part.replace(s, hit);
  if (s.includes(', ')) {
    const pieces = s.split(', ');
    const out = pieces.map(x => lookup(x, depth) ?? x);
    if (out.some((x, i) => x !== pieces[i])) return part.replace(s, out.join(', '));
  }
  return part;
}

// Texts built with a separator ("name — description", "a · b", "a | b" and, lastly, "123 - name"):
// translates each piece. null if no piece has a translation.
const JOINER_LEVELS = [/( (?:—|·|\|) )/, /( - )/];
// Label with a count at the end: "Móveis (985)"
function translateCounted(core) {
  const m = /^(.*\S) (\([\d.,\s  ]+\))$/.exec(core);
  if (!m) return null;
  const hit = lookup(m[1], 2);
  return hit === null ? null : `${hit} ${m[2]}`;
}
function translateJoined(core, level = 0) {
  const sep = JOINER_LEVELS[level];
  if (!sep) return translateCounted(core);
  if (!sep.test(core)) return translateJoined(core, level + 1);
  const pieces = core.split(sep);
  let changed = false;
  const out = pieces.map((p, i) => {
    if (i % 2) return p;
    const hit = lookup(p, 2) ?? translateJoined(p, level + 1);
    if (hit === null) return p;
    changed = true;
    return hit;
  });
  return changed ? out.join('') : null;
}

// Translates a whole text (keeps the edge spaces)
export function translateText(text) {
  if (current === SOURCE_LANG || !text) return text;
  const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(text);
  const core = m[2].replace(/\s+/g, ' ');
  if (!core || !/[A-Za-zÀ-ÿ]/.test(core)) return text;
  let out = lookup(core);
  if (out === null) out = translateJoined(core);
  if (out === null) {
    if (missing.size < 5000) missing.add(core);
    return text;
  }
  return m[1] + out + m[3];
}

// For code: t('Carregando modelo'), t('Som #{0}', id)
export function t(key, ...args) {
  if (current === SOURCE_LANG) return args.length ? fill(key, args) : key;
  for (const table of tables) {
    const hit = table.exact.get(key);
    if (hit !== undefined) return fill(hit, args, table.rules);
  }
  return fill(key, args);
}

// Only the fallback table (English): for where the language's alphabet does not appear (SA-MP chat)
export function tFallback(key) {
  if (current === SOURCE_LANG) return key;
  const hit = tables[tables.length - 1]?.exact.get(key);
  return hit === undefined ? key : fill(hit, []);
}

// ---------------------------------------------------------------------------- page

function skipped(el) {
  return !el || !!el.closest?.(SKIP_SELECTOR);
}

function doText(node) {
  const parent = node.parentElement;
  if (!parent || skipped(parent)) return;
  let st = textState.get(node);
  if (!st || node.data !== st.shown) { st = { orig: node.data, shown: node.data }; textState.set(node, st); }
  const out = translateText(st.orig);
  if (out !== node.data) node.data = out;
  st.shown = out;
}

function doAttrs(el) {
  if (!el || el.closest?.(NO_TRANSLATE)) return;
  let st = attrState.get(el);
  for (const attr of TEXT_ATTRS) {
    if (!el.hasAttribute(attr)) continue;
    const now = el.getAttribute(attr);
    if (!st) { st = {}; attrState.set(el, st); }
    let a = st[attr];
    if (!a || now !== a.shown) { a = { orig: now, shown: now }; st[attr] = a; }
    const out = translateText(a.orig);
    if (out !== now) el.setAttribute(attr, out);
    a.shown = out;
  }
}

function walk(root) {
  if (!root) return;
  if (root.nodeType === Node.TEXT_NODE) { doText(root); return; }
  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
  if (root.nodeType === Node.ELEMENT_NODE) {
    doAttrs(root);
    if (skipped(root)) return;
  }
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => {
      if (n.nodeType !== Node.ELEMENT_NODE || !n.matches(SKIP_SELECTOR)) return NodeFilter.FILTER_ACCEPT;
      doAttrs(n);
      return NodeFilter.FILTER_REJECT;
    },
  });
  let n = tw.nextNode();
  while (n) {
    if (n.nodeType === Node.TEXT_NODE) doText(n); else doAttrs(n);
    n = tw.nextNode();
  }
}

function startObserver() {
  if (observer) return;
  observer = new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === 'childList') r.addedNodes.forEach(walk);
      else if (r.type === 'characterData') doText(r.target);
      else if (r.type === 'attributes') doAttrs(r.target);
    }
  });
  observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: TEXT_ATTRS });
}

let titleOrig = null;
function translateTitle() {
  if (titleOrig === null) titleOrig = document.title;
  document.title = translateText(titleOrig);
}

// ---------------------------------------------------------------------------- idiomas

async function loadFile(code) {
  if (!cache.has(code)) {
    cache.set(code, fetch(`js/lang/${code}.json`, { cache: 'no-cache' })
      .then(r => (r.ok ? r.json() : {})).catch(() => ({})));
  }
  return cache.get(code);
}

// Menu list always in alphabetical order by name (in its own language); new languages land in the right place
const byName = new Intl.Collator('en', { sensitivity: 'base' });
export function getLanguages() { return languages.slice().sort((a, b) => byName.compare(a.name, b.name)); }
export function getLanguage() { return current; }
// Language number and date format (toLocaleString)
export function uiLocale() { return current === 'pt' ? 'pt-BR' : current; }
export function onLanguageChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

// System language: just the language, without the country (pt-BR and pt-PT use the same Portuguese)
export function systemLanguage() {
  const codes = languages.map(l => l.code);
  for (const tag of [...(navigator.languages || []), navigator.language]) {
    const base = String(tag || '').toLowerCase().split('-')[0];
    if (codes.includes(base)) return base;
  }
  return codes.includes(FALLBACK_LANG) ? FALLBACK_LANG : (codes[0] || SOURCE_LANG);
}

export async function setLanguage(code, { save = false } = {}) {
  if (!languages.some(l => l.code === code)) code = systemLanguage();
  const list = [];
  if (code !== SOURCE_LANG) list.push(compile(await loadFile(code), code));
  if (code !== SOURCE_LANG && code !== FALLBACK_LANG) list.push(compile(await loadFile(FALLBACK_LANG), FALLBACK_LANG));
  current = code;
  tables = list;
  missing.clear();
  document.documentElement.lang = code;
  // Language script (languages.json "script"): the CSS swaps the font when Barlow lacks the letters
  document.documentElement.dataset.script = languages.find(l => l.code === code)?.script || 'latin';
  walk(document.body);
  translateTitle();
  if (save) { try { await postJSON('/api/language', { language: code }); } catch { /* stays only in this session */ } }
  for (const fn of listeners) { try { fn(code); } catch (e) { console.error(e); } }
}

// Loads the language list and applies the saved one (or the system's) before the interface appears
export async function initI18n(savedLanguage) {
  try { languages = await (await fetch('js/lang/languages.json', { cache: 'no-cache' })).json(); }
  catch { languages = [{ code: SOURCE_LANG, name: 'Português' }]; }
  startObserver();
  await setLanguage(savedLanguage || systemLanguage());
}
