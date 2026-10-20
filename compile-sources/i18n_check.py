#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Idiomas do editor: acha os textos da interface no código (index.html e js/) e confere os arquivos
de idioma em js/lang/.

Os textos são escritos em português no código; cada texto (sem os espaços das pontas) é a chave usada
nos arquivos de idioma. Partes variáveis viram {0}, {1}, ... na ordem em que aparecem.

Uso:
  python i18n_check.py              confere os idiomas (o build chama assim e só avisa, não para)
  python i18n_check.py --dump F     grava em F a lista de chaves achadas no código (JSON)
  python i18n_check.py --missing L  mostra as chaves que faltam no idioma L (ex.: en)
"""

import os
import re
import sys
import json
import html

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
JS_DIR = os.path.join(HERE, "js")
LANG_DIR = os.path.join(JS_DIR, "lang")
SOURCE_LANG = "pt"
SAME_FILE = os.path.join(HERE, "i18n_same.txt")


def same_keys():
    """Textos iguais em todos os idiomas (i18n_same.txt): não precisam de tradução."""
    try:
        with open(SAME_FILE, "r", encoding="utf-8") as f:
            return {line.rstrip("\n") for line in f if line.strip() and not line.startswith("#")}
    except OSError:
        return set()

# Arquivos que não têm texto de interface (bibliotecas, nomes próprios do jogo, dados binários)
SKIP_FILES = {"vendor", "lang", "sprites.js", "loader.worker.js", "textures.worker.js",
              "prep.js", "streamer.js", "binary.js", "dff.js", "img.js", "iplbin.js", "txd.js", "text.js"}
TEXT_ATTRS = ("title", "placeholder", "aria-label", "alt", "data-tip", "data-title")
# Catálogos com nomes e falas originais do jogo (em inglês): só os textos em português são da interface
CATALOG_FILES = {"sounds.js", "actors.js", "places.js"}
PT_SIGNS = re.compile(r"[ãõçáéíóúâêôàÃÕÇÁÉÍÓÚÂÊÔÀ]|\b\w+(ando|endo|indo|ado|ido|ada|ida|ais|eis)\b|\b(de|do|da|dos|das|não|com|para|em|um|uma|ao|aos|ou|sem|pelo|pela|"
                      r"nos|nas|que|se|seu|sua|e|o|os|as|ônibus|porta|carro|som|música|rádio|local|efeito|missões|"
                      r"loja|casa|arma|tiro|motor|chuva|vento|água|fogo|explosão|grito|basquete)\b", re.I)
EN_SIGNS = re.compile(r"\b(the|you|your|i|i'm|it's|is|are|what|this|that|and|of|to|my|me|we|on|in|with|for|"
                      r"get|got|man|shit|fuck|yeah|hey|oh|no|do|don't|ain't|can|let's|male|female|position|"
                      r"degrees|bent|being|caning|caned|spank\w*|orgasms?|'em|em|huh|fellas|gander|cargo|canyon|"
                      r"drowned|razors|shining|children|cover|look|keep|diversion|five|minutes)\b", re.I)


# Palavras portuguesas comuns nos catálogos (lugares, skins, sons) que não têm acento
PT_WORDS = set("""prefeitura delegacia aeroporto torre centro ponte financeiro clube cassino navio pirata cachoeiras
castelo bairro represa fazenda modelo oficina barbearia academia restaurante mar aberto esportes conversas gestos combate
armas lazer adulto trabalho cotidiano movimento posturas policial xerife especial agente federal bombeiro esteira rolante
fliperama iniciar parar apostar ficha roleta marcar desmarcar retirar soco golpe pisotear verde vermelho vermelha agudo
buzina curta longa disparo morte voz escola pequena urbana autoescolas academias bordel apostas abatedouro""".split())


def is_portuguese(key):
    """Nos catálogos: o texto está em português (não é fala ou nome original em inglês)?"""
    head = re.sub(r"(['\"]).*", " ", key)  # fora das falas originais entre aspas
    if re.search(r"[ãõçâêôáéíóúà]", head, re.I) or set(re.findall(r"[a-zà-ÿ]+", head.lower())) & PT_WORDS:
        return True
    text = re.sub(r"\{\d+\}", " ", key)
    pt = len(PT_SIGNS.findall(text))
    en = len(EN_SIGNS.findall(text))
    return pt > 0 and pt >= en


# ---------------------------------------------------------------------------- leitura do JS

def js_literals(src):
    """Strings do código JS: cada uma vem como lista de partes (texto ou None para ${...})."""
    out = []
    i, n = 0, len(src)

    def read_template(i):
        parts, buf = [], []
        while i < n:
            c = src[i]
            if c == "\\" and i + 1 < n:
                buf.append(_unescape(src[i:i + 2])); i += 2; continue
            if c == "`":
                parts.append("".join(buf))
                return parts, i + 1
            if c == "$" and i + 1 < n and src[i + 1] == "{":
                parts.append("".join(buf)); buf = []
                start = i + 2
                i = skip_expr(start)
                parts.append(Expr(src[start:i - 1]))
                continue
            buf.append(c); i += 1
        parts.append("".join(buf))
        return parts, i

    def skip_expr(i):
        depth = 1
        while i < n and depth:
            c = src[i]
            if c in "'\"":
                lit, i = read_quoted(i)
                out.append([lit])
                continue
            if c == "`":
                parts, i = read_template(i + 1)
                out.append(parts)
                continue
            if c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
            i += 1
        return i

    def read_quoted(i):
        q = src[i]; i += 1; buf = []
        while i < n and src[i] != q and src[i] != "\n":
            if src[i] == "\\" and i + 1 < n:
                buf.append(_unescape(src[i:i + 2])); i += 2; continue
            buf.append(src[i]); i += 1
        return "".join(buf), i + 1

    prev = ""
    while i < n:
        c = src[i]
        if c == "/" and i + 1 < n and src[i + 1] == "/":
            j = src.find("\n", i); i = n if j < 0 else j; continue
        if c == "/" and i + 1 < n and src[i + 1] == "*":
            j = src.find("*/", i + 2); i = n if j < 0 else j + 2; continue
        if c == "/" and prev in "(,=:[!&|?{};+-*%<>~^" + "\n":
            # expressão regular: pula até a barra de fechamento
            j = i + 1; in_cls = False
            while j < n and src[j] != "\n":
                if src[j] == "\\":
                    j += 2; continue
                if src[j] == "[":
                    in_cls = True
                elif src[j] == "]":
                    in_cls = False
                elif src[j] == "/" and not in_cls:
                    break
                j += 1
            i = j + 1; prev = "/"; continue
        if c in "'\"":
            lit, i = read_quoted(i)
            out.append([lit]); prev = "a"; continue
        if c == "`":
            parts, i = read_template(i + 1)
            out.append(parts); prev = "a"; continue
        if not c.isspace():
            prev = c
        i += 1
    return out


def _unescape(esc):
    return {"\\n": "\n", "\\t": "\t", "\\r": "", "\\'": "'", '\\"': '"', "\\`": "`", "\\\\": "\\", "\\$": "$"}.get(esc, esc[1:])


# ---------------------------------------------------------------------------- textos

PH = "\u0000"  # marca de parte variável


class Expr(str):
    """Texto de uma expressão ${...} de um template."""


PLURAL = re.compile(r"""^\s*plural\(\s*[^,]+?,\s*(['"])(.*?)\1\s*,\s*(['"])(.*?)\3\s*\)\s*$""", re.S)


def parts_to_text(parts):
    return "".join(PH if isinstance(p, Expr) else p for p in parts)


def parts_variants(parts):
    """Textos possíveis do template: plural(n, 'objeto', 'objetos') vira "{n} objeto" e "{n} objetos"."""
    out = [""]
    for p in parts:
        m = PLURAL.match(p) if isinstance(p, Expr) else None
        if m:
            out = [o + PH + " " + w for o in out for w in (m.group(2), m.group(4))]
        elif isinstance(p, Expr):
            out = [o + PH for o in out]
        else:
            out = [o + p for o in out]
    return out


def segments(text):
    """Divide um texto com HTML nos pedaços que viram nós de texto e nos atributos de texto."""
    if not re.search(r"<[a-zA-Z/!]", text):
        return [text]
    segs = []
    for m in re.finditer(r"""(%s)\s*=\s*("([^"]*)"|'([^']*)')""" % "|".join(TEXT_ATTRS), text):
        segs.append(m.group(3) if m.group(3) is not None else m.group(4))
    body = re.sub(r"<!--.*?-->", " ", text, flags=re.S)
    body = re.sub(r"<(script|style)\b.*?</\1>", " ", body, flags=re.S | re.I)
    body = re.sub(r"<svg\b.*?</svg>", "<x>", body, flags=re.S | re.I)
    for piece in re.split(r"<[^<>]*>", body):
        segs.append(piece)
    return segs


def normalize(seg):
    """Chave: espaços juntados, pontas limpas, partes variáveis numeradas {0}, {1}."""
    s = html.unescape(seg.replace(PH, "\u0001"))
    s = re.sub(r"\s+", " ", s).strip()
    k = [0]

    def num(_m):
        r = "{%d}" % k[0]; k[0] += 1; return r
    return re.sub("\u0001", num, s)


CODEISH = re.compile(r"=>|===|!==|\(\)\s*[;{]|\bfunction\b|\breturn\b|\bconst\b|\blet\b|\bvar\b|^\s*[.#][\w-]+\s*[{,>]|"
                     r"[a-z-]+\s*:\s*[^;]+;|^\S+\.(js|css|png|webp|json|txd|dff|img|col|ipl|ide|amx|pwn|exe|dll)$|^https?:|"
                     r"^[\w.]+\(.*\)\s*;?$")


# Código Pawn gerado e assinaturas de arquivo (não são textos de interface)
PAWN_LIKE = re.compile(r"^(//(?! Ex)|# |#[A-Za-z]|new |stock |forward |public |case |for \(|[a-z]\w*\s*=\s*[A-Z]\w+\()|playerid|\);\s*($|//)|^\{\d+\}\(")


CSS_LIKE = re.compile(r"^[.#\[][\w-]|[\w\]]\[[\w-]+(=|\])|\b\d*px\b.*\b(sans-serif|monospace|serif|Arial)\b|^bold\b")


def is_ui_text(key):
    if len(key) < 2 or len(key) > 3000:
        return False
    # Frase em português (novidades, ajuda): vale mesmo com ";", ":" ou nomes do Pawn no meio
    if len(re.findall(r"[A-Za-zÀ-ÿ]+", key)) >= 6 and len(PT_SIGNS.findall(key)) >= 3 and not key.lstrip().startswith(("//", "#")):
        return True
    if CSS_LIKE.search(key):
        return False
    if PAWN_LIKE.search(key):
        return False
    letters = re.sub(r"\{\d+\}", "", key)
    if not re.search(r"[A-Za-zÀ-ÿ]{2}", letters):
        return False
    if CODEISH.search(key):
        return False
    words = re.findall(r"[A-Za-zÀ-ÿ]+", letters)
    accented = re.search(r"[À-ÿ]", letters)
    if " " not in letters.strip():
        w = letters.strip(" .:!?()[]{}-–—,;\"'")
        if accented:
            return bool(re.fullmatch(r"[A-Za-zÀ-ÿ]+", w))
        # Uma palavra só: precisa ser palavra comum com inicial maiúscula (não identificador)
        return bool(re.fullmatch(r"[A-ZÀ-Þ][a-zß-ÿ]{1,}", w))
    # Várias palavras: não pode ser lista de classes, seletores ou nomes de código
    # Lista de classes CSS ou nomes de código: minúsculas com hífen ou sublinhado
    if re.fullmatch(r"[a-z0-9 _\-]+", letters.strip()) and re.search(r"[_\-]|[a-z]+\d", letters):
        return False
    if all(re.fullmatch(r"[A-Z0-9_]+", w) for w in words) and ("_" in letters or not any(len(w) >= 4 for w in words)):
        return False
    return True


def generalize(key):
    """Catálogos: nomes entre aspas e números viram partes variáveis (uma tradução serve para todos)."""
    k = re.sub(r'"[^"]+"', '"\u0001"', key)
    # Fala original entre aspas simples depois de "Rótulo: " (ex.: Cassino: 'You win!')
    k = re.sub(r"^([^:']+: )'.+'$", "\\1'\u0001'", k)
    k = re.sub(r"(?<![A-Za-z])\d+(?![A-Za-z])", "\u0001", k)
    n = [0]

    def num(_m):
        r = "{%d}" % n[0]; n[0] += 1; return r
    k = re.sub(r"\{\d+\}", "\u0001", k)
    return re.sub("\u0001", num, k)


def py_literals(src):
    """Strings de um arquivo Python (as f-strings viram partes variáveis). Docstrings e linhas de
    print/log (console) ficam de fora."""
    out = []
    src = re.sub(r'(?s)("""|\'\'\').*?\1', " ", src)
    src = "\n".join(line for line in src.split("\n") if not re.search(r"\b(print|log|_log|logger\.\w+|log_line)\(", line))
    for m in re.finditer(r'(?<![A-Za-z_])([fFrRbB]{0,2})("([^"\\\n]|\\.)*"|\'([^\'\\\n]|\\.)*\')', src):
        prefix, body = m.group(1).lower(), m.group(2)[1:-1]
        if "b" in prefix:
            continue
        body = re.sub(r"\\(.)", lambda e: _unescape("\\" + e.group(1)), body)
        if "f" in prefix:
            body = re.sub(r"\{[^{}]*\}", PH, body)
        body = re.sub(r"%[-0-9.]*[sdfr]", PH, body)
        out.append(body)
    return out


def keys_from_source():
    found = {}

    def add(raw, where, catalog=False, force=False):
        for seg in segments(raw):
            key = normalize(seg)
            if not (force and re.search(r"[A-Za-zÀ-ÿ]{2}", key)) and not is_ui_text(key):
                continue
            if catalog:
                if not is_portuguese(key):
                    continue
                key = generalize(key)
            found.setdefault(key, where)

    with open(os.path.join(ROOT, "index.html"), "r", encoding="utf-8") as f:
        add(f.read(), "index.html")
    for dirpath, dirs, files in os.walk(JS_DIR):
        dirs[:] = [d for d in dirs if d not in SKIP_FILES]
        for name in files:
            if not name.endswith(".js") or name in SKIP_FILES:
                continue
            path = os.path.join(dirpath, name)
            rel = os.path.relpath(path, HERE).replace(os.sep, "/")
            with open(path, "r", encoding="utf-8") as f:
                src = f.read()
            if name == "about.js":
                # O histórico de versões fica só em inglês e nunca é traduzido
                src = re.sub(r"const CHANGELOG = \[.*?\n\];", "", src, flags=re.S)
            for parts in js_literals(src):
                for text in parts_variants(parts):
                    add(text, rel, catalog=name in CATALOG_FILES)
            # plural(n, 'item', 'itens') sozinho também aparece na tela como "5 itens"
            for m in re.finditer(r"""plural\(\s*[^,]+?,\s*(['"])(.*?)\1\s*,\s*(['"])(.*?)\3\s*\)""", src):
                for w in (m.group(2), m.group(4)):
                    add(PH + " " + w, rel, force=True)
    # Mensagens do servidor do editor que aparecem na interface (erros, avisos)
    with open(os.path.join(ROOT, "serve.py"), "r", encoding="utf-8") as f:
        for lit in py_literals(f.read()):
            key = normalize(lit)
            if is_ui_text(key) and is_portuguese(key) and not key.startswith(("[", "#")):
                found.setdefault(key, "serve.py")
    return found


def covered(key, data, patterns):
    if key in data:
        return True
    return any(p.match(key) for p in patterns)


def lang_patterns(data):
    pats = []
    for k in data:
        if k.startswith("_") or not re.search(r"\{\d+\}", k):
            continue
        src = "".join("(.+?)" if re.fullmatch(r"\{\d+\}", piece) else re.escape(piece)
                      for piece in re.split(r"(\{\d+\})", k))
        pats.append(re.compile("^" + src + "$"))
    return pats


# ---------------------------------------------------------------------------- idiomas

def languages():
    with open(os.path.join(LANG_DIR, "languages.json"), "r", encoding="utf-8") as f:
        return json.load(f)


def load_lang(code):
    path = os.path.join(LANG_DIR, code + ".json")
    if not os.path.isfile(path):
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def check():
    same = same_keys()
    keys = {k: v for k, v in keys_from_source().items() if k not in same}
    langs = languages()
    print("Idiomas: %d textos de interface no código" % len(keys))
    problems = 0
    for lang in langs:
        code = lang["code"]
        data = load_lang(code)
        if data is None:
            print("  %-3s %-10s ARQUIVO FALTANDO (js/lang/%s.json)" % (code, lang["name"], code))
            problems += 1
            continue
        if code == SOURCE_LANG:
            print("  %-3s %-10s idioma do código" % (code, lang["name"]))
            continue
        pats = lang_patterns(data)
        missing = [k for k in keys if not covered(k, data, pats)]
        bad = [k for k, v in data.items() if not k.startswith("_") and isinstance(v, str) and
               sorted(re.findall(r"\{\d+\}", k)) != sorted(re.findall(r"\{\d+\}", v))]
        print("  %-3s %-10s %d faltando, %d com partes variáveis diferentes" % (code, lang["name"], len(missing), len(bad)))
        problems += bool(missing or bad)
    return problems


def main():
    if "--dump" in sys.argv:
        out = sys.argv[sys.argv.index("--dump") + 1]
        keys = keys_from_source()
        with open(out, "w", encoding="utf-8") as f:
            json.dump(keys, f, ensure_ascii=False, indent=1)
        print("%d chaves gravadas em %s" % (len(keys), out))
        return
    if "--missing" in sys.argv:
        code = sys.argv[sys.argv.index("--missing") + 1]
        data = load_lang(code) or {}
        pats = lang_patterns(data)
        same = same_keys()
        for k, where in keys_from_source().items():
            if k not in same and not covered(k, data, pats):
                print("%s\t%s" % (where, k))
        return
    check()


if __name__ == "__main__":
    main()
