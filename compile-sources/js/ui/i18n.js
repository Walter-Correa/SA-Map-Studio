// Idiomas da interface.
// O código é escrito em português. Cada arquivo js/lang/<código>.json traz a tradução de cada texto: a
// chave é o texto em português (sem os espaços das pontas) e as partes variáveis são {0}, {1}, ...
// A tradução acontece direto na página: todo texto e atributo de texto (title, placeholder, aria-label,
// alt) que aparece é trocado pela versão do idioma escolhido, inclusive o que é criado depois (janelas,
// avisos, listas). Ao trocar de idioma tudo volta ao original e é traduzido de novo, sem reiniciar.
// Não é traduzido o que fica em campos de texto, em <code>/<pre> e dentro de translate="no" ou .no-i18n
// (código Pawn, nomes digitados pelo usuário). Texto desenhado em canvas usa t().
import { postJSON } from './common.js';

export const SOURCE_LANG = 'pt';
const FALLBACK_LANG = 'en';
const TEXT_ATTRS = ['title', 'placeholder', 'aria-label', 'alt'];
// translate="no" / .no-i18n: nada é traduzido. Nos demais, o conteúdo fica como está, mas atributos
// (placeholder, title, aria-label) são traduzidos, como o placeholder de um textarea.
const NO_TRANSLATE = '[translate="no"], .no-i18n';
const NO_CONTENT = 'script, style, textarea, code, pre, svg';
const SKIP_SELECTOR = `${NO_TRANSLATE}, ${NO_CONTENT}`;

let languages = [];          // [{ code, name }] na ordem do menu
let current = SOURCE_LANG;
let tables = [];             // [{ exact: Map, patterns: [] }] do idioma atual e do de reserva
const cache = new Map();     // código -> Promise<objeto do arquivo>
const textState = new WeakMap(); // nó de texto -> { orig, shown }
const attrState = new WeakMap(); // elemento -> { [atributo]: { orig, shown } }
let observer = null;
const listeners = new Set();
export const missing = new Set(); // textos sem tradução vistos na tela (para completar os arquivos)

// ---------------------------------------------------------------------------- tradução

function compile(data) {
  const exact = new Map(), patterns = [];
  for (const [key, value] of Object.entries(data || {})) {
    if (key.startsWith('_') || typeof value !== 'string' || !value) continue;
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
    if (!/[A-Za-zÀ-ÿ]/.test(longest)) continue; // só partes variáveis: casaria com qualquer coisa
    patterns.push({ re: new RegExp('^' + src + '$'), order, value, hint: longest, weight: key.replace(/\{\d+\}/g, '').length });
  }
  patterns.sort((a, b) => b.weight - a.weight);
  return { exact, patterns };
}

function fill(value, args) {
  return value.replace(/\{(\d+)\}/g, (all, i) => (args[+i] !== undefined ? args[+i] : all));
}

// depth: quantos níveis de partes variáveis ainda podem ser traduzidos (0 = só o texto exato)
function lookup(core, depth = 2) {
  for (const table of tables) {
    const hit = table.exact.get(core);
    if (hit !== undefined) return hit;
  }
  if (depth <= 0) return null;
  for (const table of tables) {
    for (const p of table.patterns) {
      if (p.hint && !core.includes(p.hint)) continue;
      const m = core.match(p.re);
      if (!m) continue;
      const args = [];
      p.order.forEach((n, i) => { args[n] = translatePart(m[i + 1], depth - 1); });
      return fill(p.value, args);
    }
  }
  return null;
}

// Parte variável que também é texto da interface: "Desfeito: Mover", "Encontrei 3 objetos, 1 veículo"
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

// Textos montados com separador ("nome — descrição", "a · b", "a | b" e, por último, "123 - nome"):
// traduz cada pedaço. null se nenhum pedaço tiver tradução.
const JOINER_LEVELS = [/( (?:—|·|\|) )/, /( - )/];
// Rótulo com contagem no fim: "Móveis (985)"
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

// Traduz um texto inteiro (mantém os espaços das pontas)
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

// Para o código: t('Carregando modelo'), t('Som #{0}', id)
export function t(key, ...args) {
  if (current === SOURCE_LANG) return args.length ? fill(key, args) : key;
  const out = lookup(key, 0);
  return fill(out ?? key, args);
}

// Só a tabela de reserva (inglês): para onde o alfabeto do idioma não aparece (chat do SA-MP)
export function tFallback(key) {
  if (current === SOURCE_LANG) return key;
  return tables[tables.length - 1]?.exact.get(key) ?? key;
}

// ---------------------------------------------------------------------------- página

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

// Lista do menu sempre em ordem alfabética pelo nome (no próprio idioma); idiomas novos entram no lugar certo
const byName = new Intl.Collator('en', { sensitivity: 'base' });
export function getLanguages() { return languages.slice().sort((a, b) => byName.compare(a.name, b.name)); }
export function getLanguage() { return current; }
// Formato de números e datas do idioma (toLocaleString)
export function uiLocale() { return current === 'pt' ? 'pt-BR' : current; }
export function onLanguageChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

// Idioma do sistema: só o idioma, sem o país (pt-BR e pt-PT usam o mesmo Português)
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
  if (code !== SOURCE_LANG) list.push(compile(await loadFile(code)));
  if (code !== SOURCE_LANG && code !== FALLBACK_LANG) list.push(compile(await loadFile(FALLBACK_LANG)));
  current = code;
  tables = list;
  missing.clear();
  document.documentElement.lang = code;
  walk(document.body);
  translateTitle();
  if (save) { try { await postJSON('/api/language', { language: code }); } catch { /* fica só nesta sessão */ } }
  for (const fn of listeners) { try { fn(code); } catch (e) { console.error(e); } }
}

// Carrega a lista de idiomas e aplica o salvo (ou o do sistema) antes de a interface aparecer
export async function initI18n(savedLanguage) {
  try { languages = await (await fetch('js/lang/languages.json', { cache: 'no-cache' })).json(); }
  catch { languages = [{ code: SOURCE_LANG, name: 'Português' }]; }
  startObserver();
  await setLanguage(savedLanguage || systemLanguage());
}
