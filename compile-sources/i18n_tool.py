#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Manutenção dos arquivos de idioma (js/lang/*.json): tradução em lote, formas de plural e renomear chaves.

A chave é o texto em português do código (veja i18n_check.py). Esta ferramenta não mexe no código: ao
mudar um texto no código, use "rename" para levar a chave antiga para a nova em todos os idiomas.

Uso:
  python i18n_tool.py export [PASTA] [--lang L ...] [--size N]
      Grava em PASTA (padrão testing/i18n/, fora do git) o que falta traduzir em cada idioma: keys.json (id -> chave em
      português) e lotes L-01.txt, L-02.txt... com uma linha "id<TAB>texto em inglês" por chave (N linhas
      por lote, padrão 200). Troque o texto em inglês pela tradução e importe.

  python i18n_tool.py import ARQUIVO... [--lang L] [--keys keys.json]
      Mescla as linhas "id<TAB>tradução" no idioma L (padrão: o começo do nome do arquivo, "ru-01.txt" -> ru).
      O id pode ser o número do keys.json (padrão: o keys.json da pasta do arquivo) ou a própria chave em
      português. A tradução substitui a que já existe. Formas de plural numa linha só:
        {0} objetos<TAB>one: {0} объект | few: {0} объекта | many: {0} объектов | other: {0} объекта
      Formas: zero, one, two, few, many, other (as do Intl.PluralRules do idioma; "other" é obrigatória)
      e "count: N" quando o número não é o {0}. "\\n" vira quebra de linha.
      Linhas com {0}/%d diferentes da chave ou com espaço nas pontas são recusadas e listadas.

  python i18n_tool.py rename "texto antigo" "texto novo"
      Troca a chave em todos os arquivos de idioma (e no i18n_same.txt), mantendo a posição e a tradução.
"""

import os
import re
import sys
import json

import i18n_check as chk

PLURAL_PART = re.compile(r"^\s*(zero|one|two|few|many|other|count)\s*:\s?(.*?)\s*$", re.S)


def arg_value(args, name, default=None, many=False):
    if name not in args:
        return default
    i = args.index(name)
    vals = []
    for v in args[i + 1:]:
        if v.startswith("--"):
            break
        vals.append(v)
        if not many:
            break
    del args[i:i + 1 + len(vals)]
    return vals if many else (vals[0] if vals else default)


def to_line(value):
    """Valor de um arquivo de idioma como texto de uma linha (formas de plural com " | ")."""
    if chk.is_forms(value):
        parts = ["%s: %s" % (f, value[f]) for f in chk.PLURAL_FORMS if f in value]
        if "count" in value:
            parts.insert(0, "count: %d" % value["count"])
        return " | ".join(parts).replace("\n", "\\n")
    return str(value).replace("\n", "\\n")


def from_line(text):
    """Contrário de to_line: texto ou formas de plural."""
    text = text.replace("\\n", "\n")
    pieces = text.split(" | ")
    parsed = [PLURAL_PART.match(p) for p in pieces]
    if len(pieces) < 2 or not all(parsed):
        return text
    forms = {}
    for m in parsed:
        forms[m.group(1)] = int(m.group(2)) if m.group(1) == "count" and m.group(2).isdigit() else m.group(2)
    return forms


# ---------------------------------------------------------------------------- export

def export(args):
    size = int(arg_value(args, "--size", "200"))
    only = arg_value(args, "--lang", None, many=True)
    out = args[0] if args else os.path.join(chk.ROOT, "testing", "i18n")
    os.makedirs(out, exist_ok=True)
    same = chk.same_keys()
    keys = [k for k in chk.keys_from_source() if k not in same]
    english = chk.load_lang("en") or {}
    todo = {}
    for lang in chk.languages():
        code = lang["code"]
        if code == chk.SOURCE_LANG or (only and code not in only):
            continue
        data = chk.load_lang(code) or {}
        pats = chk.lang_patterns(data)
        todo[code] = [k for k in keys if not chk.covered(k, data, pats)]
    ids = {k: i + 1 for i, k in enumerate(sorted({k for ks in todo.values() for k in ks}))}
    with open(os.path.join(out, "keys.json"), "w", encoding="utf-8", newline="\n") as f:
        json.dump({str(i): k for k, i in ids.items()}, f, ensure_ascii=False, indent=1)
    for code, missing in todo.items():
        for n in range(0, len(missing), size):
            name = os.path.join(out, "%s-%02d.txt" % (code, n // size + 1))
            with open(name, "w", encoding="utf-8", newline="\n") as f:
                for k in missing[n:n + size]:
                    f.write("%d\t%s\n" % (ids[k], to_line(english.get(k, k))))
        print("  %-3s %d faltando" % (code, len(missing)))
    print("%d chaves em %s" % (len(ids), os.path.join(out, "keys.json")))


# ---------------------------------------------------------------------------- import

def import_files(args):
    lang = arg_value(args, "--lang")
    keys_path = arg_value(args, "--keys")
    codes = {l["code"] for l in chk.languages()}
    errors = 0
    for path in args:
        code = lang or re.split(r"[-_.]", os.path.basename(path))[0]
        if code not in codes or code == chk.SOURCE_LANG:
            print("%s: idioma \"%s\" inválido (use --lang)" % (path, code))
            errors += 1
            continue
        kp = keys_path or os.path.join(os.path.dirname(os.path.abspath(path)), "keys.json")
        ids = {}
        if os.path.isfile(kp):
            with open(kp, "r", encoding="utf-8") as f:
                ids = json.load(f)
        data = chk.load_lang(code) or {"_meta": ""}
        added = changed = 0
        with open(path, "r", encoding="utf-8-sig") as f:
            lines = f.read().split("\n")
        for no, line in enumerate(lines, 1):
            line = line.rstrip("\r")
            if not line.strip() or line.startswith("#"):
                continue
            if "\t" not in line:
                print("%s:%d: falta o TAB entre id e tradução" % (path, no))
                errors += 1
                continue
            ident, text = line.split("\t", 1)
            key = ids.get(ident.strip()) if ident.strip().isdigit() else ident.replace("\\n", "\n")
            if key is None:
                print("%s:%d: id %s não está no %s" % (path, no, ident, kp))
                errors += 1
                continue
            value = from_line(text)
            problem = chk.forms_problem(key, value)
            if problem:
                print("%s:%d: %s" % (path, no, problem))
                errors += 1
                continue
            if key not in data:
                added += 1
            elif data[key] != value:
                changed += 1
            data[key] = value
        chk.save_lang(code, data)
        print("%s -> %s.json: %d novas, %d alteradas" % (path, code, added, changed))
    return errors


# ---------------------------------------------------------------------------- rename

def rename(args):
    if len(args) != 2:
        print('uso: python i18n_tool.py rename "texto antigo" "texto novo"')
        return 1
    old, new = args
    if sorted(chk.VARS.findall(old)) != sorted(chk.VARS.findall(new)):
        print("Aviso: as partes variáveis mudaram; confira as traduções de \"%s\"." % new)
    total = 0
    for lang in chk.languages():
        data = chk.load_lang(lang["code"])
        if not data or old not in data:
            continue
        if new in data:
            print("  %-3s já tem \"%s\": mantida, a antiga foi apagada" % (lang["code"], new))
            data.pop(old)
        else:
            data = {(new if k == old else k): v for k, v in data.items()}
        chk.save_lang(lang["code"], data)
        total += 1
    with open(chk.SAME_FILE, "r", encoding="utf-8", newline="") as f:
        same = f.read()
    eol = "\r\n" if "\r\n" in same else "\n"
    lines = same.split(eol)
    if old in lines:
        with open(chk.SAME_FILE, "w", encoding="utf-8", newline="") as f:
            f.write(eol.join(new if l == old else l for l in lines))
        print("  i18n_same.txt atualizado")
    print("\"%s\" -> \"%s\" em %d arquivos de idioma" % (old, new, total))
    return 0


def main():
    args = sys.argv[1:]
    cmd = args.pop(0) if args else ""
    if cmd == "export":
        export(args)
    elif cmd == "import" and args:
        sys.exit(1 if import_files(args) else 0)
    elif cmd == "rename":
        sys.exit(rename(args))
    else:
        print(__doc__)


if __name__ == "__main__":
    main()
