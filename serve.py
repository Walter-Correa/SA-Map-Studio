#!/usr/bin/env python3
import sys
import os

sys.dont_write_bytecode = True
os.environ["PYTHONDONTWRITEBYTECODE"] = "1"

"""SA Map Studio - servidor local.

Serve o editor e lê os arquivos da pasta do GTA San Andreas.
Usa só a biblioteca padrão do Python (3.8 ou mais novo); o pacote opcional pywebview
abre o editor numa janela própria (é o que o .exe usa).

Uso:
    python serve.py                      (detecta a pasta do GTA sozinho)
    python serve.py --gta "D:\\Jogos\\GTA San Andreas"
    python serve.py --port 8777 --no-browser
    python serve.py --navegador          (abre no navegador mesmo com o pywebview instalado)

Pastas (dentro de sa-map-studio):
    projects/     projetos salvos (.json)
    exported/     arquivos .pwn / .ipl gerados
    data/         configuração, cache de texturas e miniaturas, dados da janela e registros
    test-server/  servidor open.mp/SA-MP usado pelo "Testar no jogo"
    system/       arquivos internos, runtime, bibliotecas e modelos 3D
"""
import argparse
import atexit
import base64
import json
import re
import shutil
import socket
import struct
import sqlite3
import subprocess
import tempfile
import threading
import time
import webbrowser
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import quote, unquote, urlparse, parse_qs

VERSION = "4.1.4"
FROZEN = getattr(sys, "frozen", False)
# Root folder where the .exe lives (or the repository root in development)
if FROZEN:
    exe_dir = os.path.dirname(os.path.abspath(sys.executable))
    # If the system executable is inside sa-map-studio\system\
    if os.path.basename(exe_dir).lower() == "system" and os.path.basename(os.path.dirname(exe_dir)).lower() == "sa-map-studio":
        BASE_DIR = os.path.dirname(exe_dir)
        ROOT_DIR = os.path.dirname(BASE_DIR)
    else:
        ROOT_DIR = exe_dir
        BASE_DIR = os.path.join(ROOT_DIR, "sa-map-studio")
    APP_DIR = getattr(sys, "_MEIPASS", None) or exe_dir
else:
    ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
    BASE_DIR = os.path.join(ROOT_DIR, "compiled", "SA Map Studio", "sa-map-studio")
    APP_DIR = getattr(sys, "_MEIPASS", None) or ROOT_DIR


def _dir_writable(path):
    """Testa se dá para gravar na pasta (em Arquivos de Programas, sem administrador, não dá)."""
    try:
        os.makedirs(path, exist_ok=True)
        probe = os.path.join(path, ".write-test-%d" % os.getpid())
        with open(probe, "w") as f:
            f.write("ok")
        os.remove(probe)
        return True
    except OSError:
        return False



def _in_protected_folder(path):
    """Pasta que só o administrador grava (Arquivos de Programas ou Windows). Não grava nada para testar,
    para nunca mexer na pasta do GTA."""
    full = os.path.normcase(os.path.abspath(path))
    for var in ("ProgramFiles", "ProgramFiles(x86)", "ProgramW6432", "SystemRoot"):
        base = os.environ.get(var)
        if base and full.startswith(os.path.normcase(os.path.abspath(base)) + os.sep):
            return True
    return False

# The editor writes everything to sa-map-studio. In a protected folder (like GTA's in Program
# Files) it reopens asking for administrator; in any other folder, it asks for nothing.
if getattr(sys, "frozen", False) and os.name == "nt" and not _dir_writable(BASE_DIR):
    try:
        import ctypes
        import subprocess as _sp
        if not ctypes.windll.shell32.IsUserAnAdmin():
            _r = ctypes.windll.shell32.ShellExecuteW(None, "runas", sys.executable, _sp.list2cmdline(sys.argv[1:]),
                                                     os.path.dirname(sys.executable), 1)
            if int(_r) > 32:
                sys.exit(0)
    except SystemExit:
        raise
    except Exception:
        pass

os.makedirs(BASE_DIR, exist_ok=True)
PROJECTS_DIR = os.path.join(BASE_DIR, "projects")
PROJECT_FOLDERS = {"mp": "multiplayer", "sp": "singleplayer"}
EXPORTS_DIR = os.path.join(BASE_DIR, "exported")
SP_DIR = os.path.join(BASE_DIR, "singleplayer")
DATA_DIR = os.path.join(BASE_DIR, "data")
CONFIG_FILE = os.path.join(DATA_DIR, "config.json")
CACHE_DIR = os.path.join(DATA_DIR, "cache")
COMPILE_SOURCES_DIR = os.path.join(ROOT_DIR, "compile-sources")
COMPILE_CACHE_DIR = os.path.join(COMPILE_SOURCES_DIR, "cache")
COMPILE_MODELS_DIR = os.path.join(COMPILE_SOURCES_DIR, "models")
# CACHE_DIR is always the data folder (writing). In the source code, the files that ship ready in
# compile-sources/cache are read from there as a fallback, but nothing generated at runtime is written to the repository.
THUMBS_DIR = os.path.join(CACHE_DIR, "thumbnails") if os.path.isdir(os.path.join(CACHE_DIR, "thumbnails")) or not os.path.isdir(os.path.join(CACHE_DIR, "miniaturas")) else os.path.join(CACHE_DIR, "miniaturas")
ANIM_CACHE_DIR = os.path.join(CACHE_DIR, "animations") if os.path.isdir(os.path.join(CACHE_DIR, "animations")) or not os.path.isdir(os.path.join(CACHE_DIR, "animacoes")) else os.path.join(CACHE_DIR, "animacoes")
def resolve_webview_dir():
    """Resolve a pasta de dados do navegador (WebView2).
    
    O Microsoft Edge WebView2 proíbe expressamente criar o User Data Folder
    dentro de 'Program Files', 'Program Files (x86)', 'Windows' ou pastas protegidas,
    pois os processos filhos de sandbox rodam com tokens restritos. Se o editor estiver
    em Program Files ou a escrita falhar, utiliza fallback seguro em %LOCALAPPDATA%.
    """
    cand = os.path.join(DATA_DIR, "browser")
    abs_cand = os.path.abspath(cand).lower()
    restricted_keywords = ["program files", "program files (x86)", "windows", "system32"]
    for env_var in ("ProgramFiles", "ProgramFiles(x86)", "ProgramW6432", "SystemRoot", "windir"):
        val = os.environ.get(env_var)
        if val:
            restricted_keywords.append(os.path.abspath(val).lower())
    is_restricted = any(kw in abs_cand for kw in restricted_keywords if kw)
    if not is_restricted:
        try:
            os.makedirs(cand, exist_ok=True)
            test_file = os.path.join(cand, ".perm_test")
            with open(test_file, "w") as f:
                f.write("1")
            os.remove(test_file)
            return cand
        except Exception:
            pass
    local_app = os.environ.get("LOCALAPPDATA") or os.environ.get("APPDATA")
    if local_app:
        fallback = os.path.join(local_app, "SA Map Studio", "browser")
    else:
        fallback = os.path.join(tempfile.gettempdir(), "SA Map Studio", "browser")
    try:
        os.makedirs(fallback, exist_ok=True)
        return fallback
    except Exception:
        fallback_tmp = os.path.join(tempfile.gettempdir(), "samapstudio_browser")
        os.makedirs(fallback_tmp, exist_ok=True)
        return fallback_tmp

WEBVIEW_DIR = resolve_webview_dir()
LOGS_DIR = os.path.join(DATA_DIR, "logs")
TEST_DIR = os.path.join(BASE_DIR, "test-server")
if FROZEN:
    MODELS_DIR = os.path.join(APP_DIR, "models")
    if not os.path.isdir(MODELS_DIR):
        alt_m = os.path.join(os.path.dirname(os.path.abspath(sys.executable)), "models")
        if os.path.isdir(alt_m):
            MODELS_DIR = alt_m
else:
    MODELS_DIR = os.path.join(COMPILE_SOURCES_DIR, "models")
IS_WINDOWS = os.name == "nt"


def migrate_old_layout():
    """Move pastas e arquivos da raiz para dentro de sa-map-studio e remove pastas legadas e __pycache__."""
    # The .exe can be in any folder (GTA's, Downloads, Desktop...).
    # Only touches the root when it clearly belongs to the program: never inside GTA and, in the .exe,
    # only in the old layout (which had the system folder next to the executable).
    if editor_gta_folder() or looks_like_gta_dir(ROOT_DIR):
        return
    if FROZEN and not os.path.isdir(os.path.join(ROOT_DIR, "system")):
        return

    # Removes the __pycache__ folders from the source code (development mode only)
    if not FROZEN:
        for root, dirs, _ in os.walk(ROOT_DIR):
            if "__pycache__" in dirs:
                try:
                    shutil.rmtree(os.path.join(root, "__pycache__"), ignore_errors=True)
                except OSError:
                    pass

    def merge_and_remove(src_dir, dst_dir):
        if not os.path.isdir(src_dir) or os.path.abspath(src_dir) == os.path.abspath(dst_dir):
            return
        os.makedirs(dst_dir, exist_ok=True)
        for item in os.listdir(src_dir):
            s = os.path.join(src_dir, item)
            d = os.path.join(dst_dir, item)
            if os.path.isdir(s):
                merge_and_remove(s, d)
            else:
                if not os.path.exists(d):
                    try:
                        shutil.move(s, d)
                    except OSError:
                        pass
                else:
                    try:
                        os.remove(s)
                    except OSError:
                        pass
        try:
            shutil.rmtree(src_dir, ignore_errors=True)
        except OSError:
            pass

    # Migrates folders that may be loose in the root into BASE_DIR
    for old_name, target_dir in (
        ("sa-map-studio", BASE_DIR),
        ("projects", PROJECTS_DIR),
        ("projetos", PROJECTS_DIR),
        ("Projetos", PROJECTS_DIR),
        ("exported", EXPORTS_DIR),
        ("exportados", EXPORTS_DIR),
        ("Exportados", EXPORTS_DIR),
        ("data", DATA_DIR),
        ("dados", DATA_DIR),
        ("Dados", DATA_DIR),
        ("test-server", TEST_DIR),
        ("servidor-teste", TEST_DIR),
        ("Servidor de Teste", TEST_DIR),
        ("teste", TEST_DIR),
    ):
        src = os.path.join(ROOT_DIR, old_name)
        if old_name in ("data", "dados", "Dados"):
            # Only moves the program's own data folder (never a GTA's data)
            if resolve_ci(src, "gta.dat") or not any(
                os.path.exists(os.path.join(src, marker)) for marker in ("config.json", "cache", "logs", "registros")
            ):
                continue
        merge_and_remove(src, target_dir)

    # Removes leftover/duplicate folders that must not exist inside sa-map-studio
    for obsolete_dir in (
        os.path.join(BASE_DIR, "models"),
        os.path.join(BASE_DIR, "compile-sources"),
        os.path.join(BASE_DIR, "system", "compile-sources"),
    ):
        if os.path.isdir(obsolete_dir):
            try:
                shutil.rmtree(obsolete_dir, ignore_errors=True)
            except OSError:
                pass

    # Migrates loose files if they still exist loose
    moves = [
        ("config.json", CONFIG_FILE),
        ("cache", CACHE_DIR),
        ("dados-da-janela", WEBVIEW_DIR),
        ("navegador", WEBVIEW_DIR),
        ("registros", LOGS_DIR),
        ("sa-map-studio.log", os.path.join(LOGS_DIR, "sa-map-studio.log")),
        ("sa-map-studio.log", os.path.join(LOGS_DIR, "sa-map-studio.log")),
    ]
    for old_file, new_path in moves:
        src = os.path.join(ROOT_DIR, old_file)
        if os.path.exists(src) and not os.path.exists(new_path):
            try:
                os.makedirs(os.path.dirname(new_path), exist_ok=True)
                shutil.move(src, new_path)
            except OSError:
                pass
        sub_src = os.path.join(DATA_DIR, old_file)
        if os.path.exists(sub_src) and not os.path.exists(new_path):
            try:
                os.makedirs(os.path.dirname(new_path), exist_ok=True)
                shutil.move(sub_src, new_path)
            except OSError:
                pass

    old_log = os.path.join(LOGS_DIR, "sa-map-studio.log")
    new_log = os.path.join(LOGS_DIR, "sa-map-studio.log")
    if os.path.exists(old_log):
        if not os.path.exists(new_log):
            try:
                shutil.move(old_log, new_log)
            except OSError:
                pass
        else:
            try:
                os.remove(old_log)
            except OSError:
                pass


atexit.register(migrate_old_layout)


LOG_FILE_PATH = os.path.join(LOGS_DIR, "sa-map-studio.log")

def append_to_log(message, prefix="LOG"):
    """Escreve uma linha com timestamp no arquivo sa-map-studio.log."""
    now_str = time.strftime("[%Y-%m-%d %H:%M:%S]")
    line = f"{now_str} [{prefix}] {message}\n"
    try:
        os.makedirs(LOGS_DIR, exist_ok=True)
        with open(LOG_FILE_PATH, "a", encoding="utf-8") as f:
            f.write(line)
    except Exception:
        pass

class TeeLogger:
    def __init__(self, filename, stream=None):
        self.filename = filename
        self.stream = stream

    def write(self, msg):
        if self.stream:
            try:
                self.stream.write(msg)
                self.stream.flush()
            except Exception:
                pass
        if msg and msg.strip():
            append_to_log(msg.strip(), "SYS")

    def flush(self):
        if self.stream:
            try:
                self.stream.flush()
            except Exception:
                pass


def setup_logging():
    """Configura o redirecionamento de logs para o arquivo de registros."""
    global LOG_FILE_PATH
    if sys.stdout is None or sys.stderr is None:
        try:
            os.makedirs(LOGS_DIR, exist_ok=True)
            _log = open(LOG_FILE_PATH, "a", encoding="utf-8", buffering=1)
        except OSError:
            _log = open(os.devnull, "w")
        sys.stdout = sys.stdout or _log
        sys.stderr = sys.stderr or _log
    elif not isinstance(sys.stdout, TeeLogger):
        sys.stdout = TeeLogger(LOG_FILE_PATH, sys.stdout)
        sys.stderr = TeeLogger(LOG_FILE_PATH, sys.stderr)



MIME = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".bmp": "image/bmp",
    ".gif": "image/gif",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".ttf": "font/ttf",
    ".woff2": "font/woff2",
    ".txt": "text/plain; charset=utf-8",
    ".webm": "video/webm",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg",
}


# ---------------------------------------------------------------------------
# Utilidades
# ---------------------------------------------------------------------------
def resolve_ci(root, rel):
    """Resolve um caminho relativo sem diferenciar maiúsculas (o gta.dat usa caixa mista)."""
    parts = [p for p in re.split(r"[\\/]+", rel) if p and p != "."]
    cur = root
    for part in parts:
        if part == "..":
            return None
        cand = os.path.join(cur, part)
        if os.path.exists(cand):
            cur = cand
            continue
        try:
            low = part.lower()
            match = next((n for n in os.listdir(cur) if n.lower() == low), None)
        except OSError:
            return None
        if match is None:
            return None
        cur = os.path.join(cur, match)
    return cur


GTA_EXES = ("gta_sa.exe", "gta-sa.exe", "gta.exe", "samp.exe")


def get_canonical_default_gta():
    """Pasta de instalação padrão do GTA San Andreas nesta máquina (Program Files (x86) do Windows)."""
    pf86 = os.environ.get("ProgramFiles(x86)")
    if pf86:
        return os.path.join(pf86, "Rockstar Games", "GTA San Andreas")
    pf = os.environ.get("ProgramFiles") or r"C:\Program Files"
    return os.path.join(pf, "Rockstar Games", "GTA San Andreas")


def get_default_gta_candidates():
    """Pastas padrão de instalação, na ordem de prioridade (x86 primeiro, depois Program Files)."""
    cands = [get_canonical_default_gta()]
    for env in ("ProgramFiles", "ProgramW6432"):
        base = os.environ.get(env)
        if base:
            cands.append(os.path.join(base, "Rockstar Games", "GTA San Andreas"))
    out = []
    for c in cands:
        if os.path.normcase(os.path.abspath(c)) not in [os.path.normcase(os.path.abspath(o)) for o in out]:
            out.append(c)
    return out


def has_gta_exe(path):
    return bool(path) and any(resolve_ci(path, exe) for exe in GTA_EXES)


def looks_like_gta_dir(path):
    """Pasta que é uma instalação do GTA (tem o executável do jogo), mesmo que esteja incompleta."""
    if not path or not os.path.isdir(path) or not has_gta_exe(path):
        return False
    return bool(resolve_ci(path, "models") or resolve_ci(path, "data") or resolve_ci(path, "anim"))


def is_gta_dir(path):
    """Verifica (só lendo, sem alterar nada) se a pasta é uma instalação completa do GTA San Andreas."""
    if not path or not os.path.isdir(path):
        return False
    if not os.path.isfile(resolve_ci(path, "data/gta.dat") or ""):
        return False
    if not has_gta_exe(path):
        return False
    return bool(resolve_ci(path, "models/gta3.img") or resolve_ci(path, "models/gta_int.img"))


def load_config():
    try:
        with open(CONFIG_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return {}


def save_config(cfg):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(cfg, f, indent=2, ensure_ascii=False)


def update_config(**values):
    cfg = load_config()
    cfg.update(values)
    save_config(cfg)


def gta_problem(path):
    """Explica por que a pasta não serve (ou devolve "" se está tudo certo)."""
    if not path or not os.path.isdir(path):
        return "Não encontrei os arquivos do GTA San Andreas nessa pasta. Escolha a pasta onde fica o gta_sa.exe."
    if is_gta_dir(path):
        return ""
    if os.path.isdir(resolve_ci(path, "Gameface") or "") or os.path.isdir(resolve_ci(path, "SanAndreas") or ""):
        return "Essa é a versão Definitive Edition. O editor precisa do GTA San Andreas original (o mesmo que roda o SA-MP)."
    if not has_gta_exe(path):
        return "Não encontrei os arquivos do GTA San Andreas nessa pasta. Escolha a pasta onde fica o gta_sa.exe."
    if not os.path.isfile(resolve_ci(path, "data/gta.dat") or ""):
        return "A instalação do GTA San Andreas nessa pasta está incompleta: falta o arquivo data/gta.dat."
    return "A instalação do GTA San Andreas nessa pasta está incompleta: falta o arquivo models/gta3.img."


def registry_candidates():
    """Caminhos conhecidos do GTA no registro do Windows (SAMP, Rockstar Games, Steam e MTA)."""
    out = []
    if not IS_WINDOWS:
        return out
    try:
        import winreg
    except ImportError:
        return out

    reg_locations = [
        # SAMP
        (winreg.HKEY_CURRENT_USER, r"Software\SAMP", "gta_sa_exe", True),
        (winreg.HKEY_LOCAL_MACHINE, r"Software\SAMP", "gta_sa_exe", True),
        (winreg.HKEY_LOCAL_MACHINE, r"Software\WOW6432Node\SAMP", "gta_sa_exe", True),
        # Rockstar Games
        (winreg.HKEY_LOCAL_MACHINE, r"Software\Rockstar Games\GTA San Andreas\Installation", "ExePath", True),
        (winreg.HKEY_LOCAL_MACHINE, r"Software\WOW6432Node\Rockstar Games\GTA San Andreas\Installation", "ExePath", True),
        (winreg.HKEY_CURRENT_USER, r"Software\Rockstar Games\GTA San Andreas\Installation", "ExePath", True),
        (winreg.HKEY_LOCAL_MACHINE, r"Software\Rockstar Games\Grand Theft Auto San Andreas", "InstallFolder", False),
        (winreg.HKEY_LOCAL_MACHINE, r"Software\WOW6432Node\Rockstar Games\Grand Theft Auto San Andreas", "InstallFolder", False),
        # MTA San Andreas
        (winreg.HKEY_LOCAL_MACHINE, r"Software\Multi Theft Auto: San Andreas All\Common", "GTA:SA Path", False),
        (winreg.HKEY_LOCAL_MACHINE, r"Software\WOW6432Node\Multi Theft Auto: San Andreas All\Common", "GTA:SA Path", False),
        (winreg.HKEY_CURRENT_USER, r"Software\Multi Theft Auto: San Andreas All\Common", "GTA:SA Path", False),
    ]

    for root, key_path, val_name, is_exe in reg_locations:
        try:
            with winreg.OpenKey(root, key_path) as k:
                val, _ = winreg.QueryValueEx(k, val_name)
                if val:
                    val = str(val).strip().strip('"')
                    p = os.path.dirname(val) if is_exe else val
                    if p and p not in out and os.path.isdir(p):
                        out.append(p)
        except OSError:
            pass

    # Steam
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Valve\Steam") as k:
            steam, _ = winreg.QueryValueEx(k, "SteamPath")
            if steam:
                libs = [steam]
                vdf = os.path.join(steam, "steamapps", "libraryfolders.vdf")
                if os.path.isfile(vdf):
                    with open(vdf, "r", encoding="utf-8", errors="ignore") as f:
                        libs += re.findall(r'"path"\s+"([^"]+)"', f.read())
                for lib in libs:
                    for gta_name in ("Grand Theft Auto San Andreas", "GTA San Andreas"):
                        sp = os.path.join(lib.replace("\\\\", "\\"), "steamapps", "common", gta_name)
                        if sp not in out and os.path.isdir(sp):
                            out.append(sp)
    except OSError:
        pass

    return out


def get_other_gta_candidates():
    """Outros locais possíveis do GTA San Andreas (fora da pasta padrão), em qualquer máquina Windows."""
    out = []
    seen = {os.path.normcase(os.path.abspath(c)) for c in get_default_gta_candidates()}

    def add(p):
        if not p:
            return
        key = os.path.normcase(os.path.abspath(p))
        if key not in seen and os.path.isdir(p):
            seen.add(key)
            out.append(p)

    # 1. Windows registry (SA-MP, Rockstar Games, Steam and MTA)
    for p in registry_candidates():
        add(p)

    # 2. Common folders on all drives
    drives = []
    if IS_WINDOWS:
        import string
        drives = [f"{d}:\\" for d in string.ascii_uppercase if os.path.exists(f"{d}:\\")]
    common_bases = (
        r"Program Files (x86)\Rockstar Games\GTA San Andreas",
        r"Program Files\Rockstar Games\GTA San Andreas",
        r"Rockstar Games\GTA San Andreas",
        r"Games\GTA San Andreas",
        r"Jogos\GTA San Andreas",
        r"GTA San Andreas",
        r"SteamLibrary\steamapps\common\Grand Theft Auto San Andreas",
        r"Steam\steamapps\common\Grand Theft Auto San Andreas",
    )
    for drv in drives:
        for cb in common_bases:
            add(os.path.join(drv, cb))

    # 3. One level inside each drive's game folders (names with "gta" or "san andreas")
    scan_roots = ("Games", "Jogos", "Rockstar Games", r"SteamLibrary\steamapps\common", r"Steam\steamapps\common")
    for drv in drives:
        for sroot in scan_roots:
            pdir = os.path.join(drv, sroot)
            if not os.path.isdir(pdir):
                continue
            try:
                entries = sorted(os.listdir(pdir), key=str.lower)
            except OSError:
                continue
            for entry in entries:
                el = entry.lower()
                if "gta" in el or "san andreas" in el:
                    add(os.path.join(pdir, entry))
    return out


def detect_gta(saved_path=""):
    """Detecta a pasta do GTA San Andreas (só lendo, nunca altera as pastas do jogo):
    1. Caminho já salvo, se continuar válido.
    2. Pasta padrão de instalação, sempre em primeiro lugar quando tem os arquivos do jogo.
    3. Se a padrão não existir ou estiver incompleta: registro do Windows e outros discos.
    4. Se nada for encontrado: devolve a pasta padrão como sugestão (o erro só aparece ao avançar).
    """
    if saved_path and is_gta_dir(saved_path):
        return saved_path
    for cand in get_default_gta_candidates():
        if is_gta_dir(cand):
            return cand
    for cand in get_other_gta_candidates():
        if is_gta_dir(cand):
            return cand
    return get_canonical_default_gta()


def browse_folder(initial="", title="Escolha uma pasta"):
    """Abre a janela do Windows para escolher uma pasta."""
    if State.window is not None:
        try:
            import webview
            kind = getattr(getattr(webview, "FileDialog", None), "FOLDER", None) or webview.FOLDER_DIALOG
            res = State.window.create_file_dialog(kind, directory=initial or "")
            return (res[0] if isinstance(res, (list, tuple)) else res) or ""
        except Exception:
            pass
    result = {"path": ""}

    def run():
        try:
            import tkinter
            from tkinter import filedialog
            root = tkinter.Tk()
            root.withdraw()
            root.attributes("-topmost", True)
            result["path"] = filedialog.askdirectory(title=title, initialdir=initial or None, mustexist=True) or ""
            root.destroy()
        except Exception:
            result["path"] = ""
    t = threading.Thread(target=run)
    t.start()
    t.join()
    return os.path.normpath(result["path"]) if result["path"] else ""


def projects_dir(mode):
    return os.path.join(PROJECTS_DIR, PROJECT_FOLDERS.get(mode, PROJECT_FOLDERS["mp"]))


def migrate_projects():
    """Projects saved loose in projects/ (older versions) go to projects/multiplayer or projects/singleplayer."""
    if not os.path.isdir(PROJECTS_DIR):
        return
    for n in os.listdir(PROJECTS_DIR):
        src = os.path.join(PROJECTS_DIR, n)
        if not (os.path.isfile(src) and n.lower().endswith(".json")):
            continue
        mode = "mp"
        try:
            with open(src, "r", encoding="utf-8", errors="replace") as f:
                data = json.load(f)
            if isinstance(data, dict) and data.get("mode") == "sp":
                mode = "sp"
        except Exception:
            pass
        dst_dir = projects_dir(mode)
        os.makedirs(dst_dir, exist_ok=True)
        dst = os.path.join(dst_dir, n)
        if os.path.exists(dst):
            dst = os.path.join(dst_dir, "old-" + n)
        try:
            shutil.move(src, dst)
        except OSError:
            pass


def safe_name(name):
    name = re.sub(r"[^\w\-. ()]+", "_", name, flags=re.UNICODE).strip(" .")
    return name[:80] or "sem_nome"


# ---------------------------------------------------------------------------
# Singleplayer: mods for the Modloader (a folder of loose files, the game's own files are never changed)
# ---------------------------------------------------------------------------
SP_ASSETS = os.path.join(SP_DIR, "assets")  # files a project imported (its own models): one folder per asset
SP_MAX_ASSET = 64 * 1024 * 1024
SP_MARK = ".samapstudio-mod"
SP_MAX_BYTES = 300 * 1024 * 1024


def sp_build_dir(name):
    return os.path.join(SP_DIR, safe_name(name), "modloader", safe_name(name))


OPEN_URLS = {
    "https://github.com/cleolibrary/CLEO5/releases",
    "https://github.com/ThirteenAG/Ultimate-ASI-Loader/releases",
    "https://www.mixmods.com.br/2026/05/modloader/",
}
SP_GROUP = "SA Map Studio"  # the folder of the editor's mods inside modloader: modloader/SA Map Studio/<project>/


def sp_group_dir():
    return os.path.join(State.gta_path, "modloader", SP_GROUP) if State.gta_path else ""


def sp_install_dir(name):
    return os.path.join(sp_group_dir(), safe_name(name)) if State.gta_path else ""


def sp_legacy_dir(name):
    """Where the first versions installed a mod: straight inside modloader."""
    return os.path.join(State.gta_path, "modloader", safe_name(name)) if State.gta_path else ""


def sp_installed_dir(name):
    """The folder where this project's mod is installed now ('' if it is not)."""
    for d in (sp_install_dir(name), sp_legacy_dir(name)):
        if d and os.path.isfile(os.path.join(d, SP_MARK)):
            return d
    return ""


def sp_tidy_group():
    """The editor's folder inside modloader exists only while it holds a mod of the editor."""
    g = sp_group_dir()
    if not g or not os.path.isdir(g):
        return
    if any(os.path.isfile(os.path.join(g, n, SP_MARK)) for n in os.listdir(g)):
        return
    try:
        os.rmdir(g)  # only when nothing else is inside
    except OSError:
        pass


def sp_game_exe():
    for n in ("gta_sa.exe", "gta-sa.exe", "gta.exe"):
        p = resolve_ci(State.gta_path, n) if State.gta_path else None
        if p and os.path.isfile(p):
            return p
    return ""


def sp_game_running(exe):
    name = os.path.basename(exe).lower()
    try:
        out = subprocess.run(["tasklist", "/FI", "IMAGENAME eq " + name, "/NH"], capture_output=True, text=True,
                             creationflags=0x08000000 if IS_WINDOWS else 0, timeout=10).stdout.lower()
        return name in out
    except Exception:
        return False


ASI_LOADERS = ("dinput8.dll", "vorbisfile.dll", "vorbishooked.dll", "d3d9.dll", "ddraw.dll")


def sp_has_modloader():
    gta = State.gta_path or ""
    return bool(gta and resolve_ci(gta, "modloader.asi") and resolve_ci(gta, "modloader/.data"))


def sp_has_asi_loader():
    gta = State.gta_path or ""
    return bool(gta) and any(resolve_ci(gta, n) for n in ASI_LOADERS)


def sp_has_cleo_plus():
    """The CLEO+ plugin, which the scripts need to keep the mod out of the saved games."""
    gta = State.gta_path or ""
    return bool(gta) and any(resolve_ci(gta, p) for p in ("cleo/CLEO+.cleo", "cleo/CLEOPlus.cleo", "cleo/cleo_plugins/CLEO+.cleo", "cleo/cleo_plugins/CLEOPlus.cleo"))


def sp_missing():
    """What the game folder lacks to install and run a mod: the game itself, an ASI Loader and the Modloader."""
    out = []
    if not sp_game_exe():
        out.append("game")
    if not sp_has_asi_loader():
        out.append("asi")
    if not sp_has_modloader():
        out.append("modloader")
    return out


def sp_status(name, was=""):
    gta = State.gta_path or ""
    exe = sp_game_exe()
    built = sp_build_dir(name)
    inst = sp_installed_dir(name)
    renamed = False
    if not inst and was and was != name:
        # The project was renamed after the mod was installed: the mod is still there with the old name
        inst = sp_installed_dir(was)
        renamed = bool(inst)
    inst = inst or sp_install_dir(name)
    return {
        "ok": True,
        "hasModloader": sp_has_modloader(), "asiLoader": sp_has_asi_loader(), "missing": sp_missing(), "hasCleo": bool(gta and resolve_ci(gta, "CLEO.asi")), "hasCleoPlus": sp_has_cleo_plus(),
        "built": os.path.isdir(built), "builtPath": built,
        "installed": bool(inst) and os.path.isfile(os.path.join(inst, SP_MARK)),
        "installPath": inst, "renamed": renamed,
        "builtHash": sp_marker(built).get("hash", ""), "installedHash": sp_marker(inst).get("hash", "") if inst else "",
        "gameFound": bool(exe), "gameRunning": bool(exe) and sp_game_running(exe),
    }


def sp_readme(name, info):
    info = info if isinstance(info, dict) else {}
    return "\r\n".join([
        "%s - mod made with SA Map Studio (Singleplayer)" % name,
        "",
        "Install: put this folder inside 'modloader' in the GTA San Andreas folder (the editor can do it for you).",
        "Remove: delete this folder. The original game files are never changed.",
        "",
        "New objects: %s, new parked vehicles: %s" % (info.get("objects", 0), info.get("vehicles", 0)),
        "Original objects removed (buried below the map): %s, IPL files patched: %s" % (info.get("buried", 0), info.get("patched", 0)),
        "",
        "Lines for the game's data files (the Modloader reads them from here and merges them into gta.dat):",
    ] + [str(x) for x in (info.get("dataLines") or []) if re.match(r"^(IPL|IDE) [A-Za-z0-9_ ./\\-]+$", str(x))] + [""])


def sp_marker(folder):
    """What the editor wrote in a mod folder when it built it ({} for an old or foreign folder)."""
    try:
        with open(os.path.join(folder, SP_MARK), "r", encoding="utf-8") as f:
            data = json.load(f)
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def sp_list_installed():
    """The mods of this editor inside the game's modloader folder (the ones with its marker)."""
    out = []
    # the editor's folder, and (mods installed by the first versions) the folder of modloader itself
    for base in (sp_group_dir(), os.path.join(State.gta_path, "modloader") if State.gta_path else ""):
        if base and os.path.isdir(base):
            for n in sorted(os.listdir(base), key=str.lower):
                mark = os.path.join(base, n, SP_MARK)
                if os.path.isfile(mark) and not any(o["folder"] == n for o in out):
                    m = sp_marker(os.path.join(base, n))
                    out.append({"folder": n, "name": m.get("name") or n, "hash": m.get("hash") or "", "time": os.path.getmtime(mark)})
    return out


def sp_write_files(root, files, meta=None):
    """Writes {relative path: base64} under root (previous content of the mod folder is replaced)."""
    total = 0
    clean = {}
    for rel, b64 in (files or {}).items():
        parts = [x for x in str(rel).replace("\\", "/").split("/") if x]
        if not parts or any(x in (".", "..") or ":" in x for x in parts):
            raise ValueError("Caminho inválido: " + str(rel))
        data = base64.b64decode(b64 or "")
        total += len(data)
        if total > SP_MAX_BYTES:
            raise ValueError("Arquivos grandes demais")
        clean[os.path.join(root, *parts)] = data
    if os.path.isdir(root):
        shutil.rmtree(root)
    os.makedirs(root, exist_ok=True)
    for full, data in clean.items():
        os.makedirs(os.path.dirname(full), exist_ok=True)
        with open(full, "wb") as f:
            f.write(data)
    mark = {"app": "SA Map Studio", "note": "Created by SA Map Studio. Delete this folder to remove the mod.",
            "name": str((meta or {}).get("name") or ""), "hash": str((meta or {}).get("hash") or "")}
    with open(os.path.join(root, SP_MARK), "w", encoding="utf-8") as f:
        json.dump(mark, f)
    return len(clean)


def sp_asset_dir(asset):
    asset = str(asset or "")
    if not re.fullmatch(r"[0-9a-f]{8,32}", asset):
        raise ValueError("Arquivo inválido")
    return os.path.join(SP_ASSETS, asset)


def sp_asset_save(asset, filename, data):
    if len(data) > SP_MAX_ASSET:
        raise ValueError("Arquivos grandes demais")
    folder = sp_asset_dir(asset)
    os.makedirs(folder, exist_ok=True)
    full = os.path.join(folder, safe_name(filename))
    with open(full, "wb") as f:
        f.write(data)
    return full


def sp_asset_delete(asset):
    folder = sp_asset_dir(asset)
    if os.path.isdir(folder):
        shutil.rmtree(folder)


def sp_zip(name):
    """The built mod as a .zip: one folder with the mod's name inside, ready to be dropped into the game's modloader folder."""
    src = sp_build_dir(name)
    if not os.path.isfile(os.path.join(src, SP_MARK)):
        raise ValueError("Gere o mod antes de instalar")
    top = safe_name(name)
    out = os.path.join(SP_DIR, top, top + ".zip")
    import zipfile
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for root, _dirs, files in os.walk(src):
            for f in files:
                full = os.path.join(root, f)
                z.write(full, os.path.join(top, os.path.relpath(full, src)))
    return out


def sp_install(name, was=""):
    src = sp_build_dir(name)
    dst = sp_install_dir(name)
    if not dst:
        raise ValueError("Pasta do GTA não definida")
    if not os.path.isfile(os.path.join(src, SP_MARK)):
        raise ValueError("Gere o mod antes de instalar")
    if os.path.exists(dst) and not os.path.isfile(os.path.join(dst, SP_MARK)):
        raise ValueError("Já existe uma pasta do Modloader com esse nome que não foi criada por este programa")
    if os.path.isdir(dst):
        shutil.rmtree(dst)
    old = sp_legacy_dir(name)
    if os.path.isfile(os.path.join(old, SP_MARK)):
        shutil.rmtree(old)  # installed by an older version straight inside modloader: it moves to the editor's folder
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copytree(src, dst)
    if was and was != name:
        # The project was renamed: the mod installed with the old name goes away
        old = sp_installed_dir(was)
        if old and os.path.normcase(old) != os.path.normcase(dst):
            shutil.rmtree(old)
        sp_tidy_group()
    return dst


def sp_uninstall(name):
    dst = sp_installed_dir(name)
    if not dst:
        raise ValueError("Esse mod não está instalado")
    shutil.rmtree(dst)
    sp_tidy_group()
    return dst


_GDI_FONTS = {}
_GDI_LOCK = threading.Lock()


def gdi_font_metrics(face, size, bold):
    """Métricas da fonte do jeito que o cliente do SA-MP cria a do SetObjectMaterialText
    (D3DXCreateFont com altura = fontsize, peso 400/700, DEFAULT_CHARSET): altura da linha,
    ascendente, tamanho da letra e a largura de cada caractere (cp1252), já com o hinting do Windows."""
    face = str(face or "Arial")[:64]
    size = max(1, min(255, int(size)))
    key = (face.lower(), size, bool(bold))
    with _GDI_LOCK:
        if key in _GDI_FONTS:
            return _GDI_FONTS[key]
        out = {"ok": False}
        if os.name == "nt":
            try:
                import ctypes
                from ctypes import wintypes
                gdi = ctypes.windll.gdi32

                class TEXTMETRICW(ctypes.Structure):
                    _fields_ = [(n, ctypes.c_long) for n in ("height", "ascent", "descent", "intl", "extl", "avew", "maxw", "weight", "overhang", "dax", "day")] + [("rest", ctypes.c_byte * 8)]

                gdi.CreateCompatibleDC.restype = wintypes.HDC
                gdi.CreateCompatibleDC.argtypes = [wintypes.HDC]
                gdi.CreateFontW.restype = wintypes.HFONT
                gdi.CreateFontW.argtypes = [ctypes.c_int] * 5 + [wintypes.DWORD] * 8 + [wintypes.LPCWSTR]
                gdi.SelectObject.restype = wintypes.HGDIOBJ
                gdi.SelectObject.argtypes = [wintypes.HDC, wintypes.HGDIOBJ]
                gdi.DeleteObject.argtypes = [wintypes.HGDIOBJ]
                gdi.DeleteDC.argtypes = [wintypes.HDC]
                gdi.GetTextMetricsW.argtypes = [wintypes.HDC, ctypes.c_void_p]
                gdi.GetTextFaceW.argtypes = [wintypes.HDC, ctypes.c_int, ctypes.c_wchar_p]
                gdi.GetCharWidth32W.argtypes = [wintypes.HDC, wintypes.UINT, wintypes.UINT, ctypes.c_void_p]
                hdc = gdi.CreateCompatibleDC(None)
                font = gdi.CreateFontW(size, 0, 0, 0, 700 if bold else 400, 0, 0, 0, 1, 0, 0, 0, 0, face)
                old = gdi.SelectObject(hdc, font)
                try:
                    tm = TEXTMETRICW()
                    gdi.GetTextMetricsW(hdc, ctypes.byref(tm))
                    name = ctypes.create_unicode_buffer(64)
                    gdi.GetTextFaceW(hdc, 64, name)
                    widths = {}
                    w = ctypes.c_int()
                    for code in range(0x20, 0x100):
                        try:
                            ch = bytes([code]).decode("cp1252")
                        except UnicodeDecodeError:
                            continue
                        if gdi.GetCharWidth32W(hdc, ord(ch), ord(ch), ctypes.byref(w)):
                            widths[ch] = w.value
                    out = {"ok": True, "face": name.value or face, "height": tm.height, "ascent": tm.ascent,
                           "ppem": tm.height - tm.intl, "widths": widths}
                finally:
                    gdi.SelectObject(hdc, old)
                    gdi.DeleteObject(font)
                    gdi.DeleteDC(hdc)
            except Exception:
                out = {"ok": False}
        _GDI_FONTS[key] = out
        return out


_COL_INDEX = {"key": None, "spheres": {}}
_COL_LOCK = threading.Lock()


def _col_spheres_from(buf, out):
    """Lê as esferas de colisão (centro e raio) de um arquivo .col (COLL, COL2, COL3, COL4)."""
    pos = 0
    while pos + 48 <= len(buf):
        tag = buf[pos:pos + 4]
        if tag not in (b"COLL", b"COL2", b"COL3", b"COL4"):
            nxt = min([i for i in (buf.find(t, pos + 1) for t in (b"COLL", b"COL2", b"COL3", b"COL4")) if i > 0] or [-1])
            if nxt < 0:
                break
            pos = nxt
            continue
        size = struct.unpack_from("<I", buf, pos + 4)[0]
        name = buf[pos + 8:pos + 30].split(b"\0")[0].decode("latin-1").lower()
        if tag == b"COLL":
            r, cx, cy, cz = struct.unpack_from("<4f", buf, pos + 32)
        else:
            cx, cy, cz, r = struct.unpack_from("<4f", buf, pos + 56)
        if name and name not in out:
            out[name] = [round(cx, 4), round(cy, 4), round(cz, 4), round(r, 4)]
        pos += 8 + max(size, 24)


def _img_entries(path):
    entries = {}
    with open(path, "rb") as f:
        if f.read(4) != b"VER2":
            return entries
        count = struct.unpack("<I", f.read(4))[0]
        for _ in range(count):
            off, s1, s2, name = struct.unpack("<IHH24s", f.read(32))
            entries[name.split(b"\0")[0].decode("latin-1").lower()] = (off * 2048, (s1 or s2) * 2048)
    return entries


def col_sphere(model_name):
    """Esfera de colisão de um modelo (o que o SA-MP usa para enquadrar a prévia de modelo 3D):
    procura nos .col dos IMG do GTA e do SA-MP e em models/coll; veículos têm a colisão dentro do DFF."""
    gta = State.gta_path
    if not gta:
        return None
    name = str(model_name or "").lower()
    imgs = ["models/gta3.img", "models/gta_int.img", "SAMP/SAMPCOL.img", "SAMP/SAMP.img"]
    with _COL_LOCK:
        key = gta
        if _COL_INDEX["key"] != key:
            spheres = {}
            for img in imgs[:3]:
                full = resolve_ci(gta, img)
                if not full or not os.path.isfile(full):
                    continue
                try:
                    with open(full, "rb") as f:
                        for ename, (off, size) in _img_entries(full).items():
                            if ename.endswith(".col") and size:
                                f.seek(off)
                                _col_spheres_from(f.read(size), spheres)
                except OSError:
                    pass
            for loose in ("models/coll/peds.col", "models/coll/vehicles.col", "models/coll/weapons.col"):
                full = resolve_ci(gta, loose)
                if full and os.path.isfile(full):
                    try:
                        with open(full, "rb") as f:
                            _col_spheres_from(f.read(), spheres)
                    except OSError:
                        pass
            _COL_INDEX["key"] = key
            _COL_INDEX["spheres"] = spheres
        found = _COL_INDEX["spheres"].get(name)
        if found:
            return found
    # Vehicles: the collision lives inside the DFF itself
    for img in imgs[:2] + imgs[3:]:
        full = resolve_ci(gta, img)
        if not full or not os.path.isfile(full):
            continue
        try:
            entry = _img_entries(full).get(name + ".dff")
            if not entry:
                continue
            with open(full, "rb") as f:
                f.seek(entry[0])
                buf = f.read(entry[1])
            out = {}
            for tag in (b"COL3", b"COL2", b"COL4", b"COLL"):
                i = buf.find(tag)
                if i >= 0:
                    _col_spheres_from(buf[i:], out)
                    if out:
                        return next(iter(out.values()))
        except OSError:
            pass
    return None


THUMB_CURRENT_WIDTH = 160   # object thumbnails narrower than this are the old low resolution ones and get drawn again


def webp_width(path):
    """Largura em pixels de um arquivo WebP lendo só o cabeçalho (0 se não der)."""
    try:
        with open(path, "rb") as f:
            b = f.read(32)
    except OSError:
        return 0
    if len(b) < 30 or b[:4] != b"RIFF" or b[8:12] != b"WEBP":
        return 0
    kind = b[12:16]
    if kind == b"VP8X":
        return 1 + int.from_bytes(b[24:27], "little")
    if kind == b"VP8 ":
        return int.from_bytes(b[26:28], "little") & 0x3FFF
    if kind == b"VP8L":
        return 1 + (int.from_bytes(b[21:25], "little") & 0x3FFF)
    return 0


def thumb_widths(files):
    """files: {id: (caminho, tamanho, mtime_ns)} -> {id: largura}. Um arquivo de cache guarda a largura de cada
    miniatura pelo tamanho e pela data, então só os arquivos novos ou alterados têm o cabeçalho lido."""
    cache_file = os.path.join(DATA_DIR, "cache", "thumb-widths.json")
    try:
        with open(cache_file, "r", encoding="utf-8") as f:
            cache = json.load(f)
    except (OSError, ValueError):
        cache = {}
    out, fresh, changed = {}, {}, False
    for oid, (path, size, mtime) in files.items():
        hit = cache.get(path)
        if hit and hit[0] == size and hit[1] == mtime:
            width = hit[2]
        else:
            width = webp_width(path)
            changed = True
        fresh[path] = [size, mtime, width]
        out[oid] = width
    if changed or len(fresh) != len(cache):
        try:
            os.makedirs(os.path.dirname(cache_file), exist_ok=True)
            with open(cache_file + ".tmp", "w", encoding="utf-8") as f:
                json.dump(fresh, f)
            os.replace(cache_file + ".tmp", cache_file)
        except OSError:
            pass
    return out


def thumb_file(kind, key):
    """Caminho da miniatura em disco. kind = obj | tex; key = id do modelo ou "txd/textura"."""
    key = str(key).lower()
    if kind in ("obj", "objects"):
        if not key.isdigit():
            return None
        p = os.path.join(THUMBS_DIR, "objects", key + ".webp")
        if not os.path.isfile(p):
            for alt in (
                os.path.join(COMPILE_CACHE_DIR, "thumbnails", "objects", key + ".webp"),
                os.path.join(DATA_DIR, "cache", "thumbnails", "objects", key + ".webp"),
                os.path.join(APP_DIR, "data", "cache", "thumbnails", "objects", key + ".webp"),
                os.path.join(THUMBS_DIR, "objetos", key + ".webp"),
                os.path.join(COMPILE_CACHE_DIR, "miniaturas", "objetos", key + ".webp"),
                os.path.join(DATA_DIR, "cache", "miniaturas", "objetos", key + ".webp"),
                os.path.join(APP_DIR, "data", "cache", "miniaturas", "objetos", key + ".webp"),
                os.path.join(APP_DIR, "Dados", "cache", "miniaturas", "objetos", key + ".webp")
            ):
                if os.path.isfile(alt):
                    return alt
        return p
    if kind in ("tex", "textures"):
        parts = key.split("/", 1)
        if len(parts) != 2 or not parts[0] or not parts[1]:
            return None
        p = os.path.join(THUMBS_DIR, "textures", quote(parts[0], safe=""), quote(parts[1], safe="") + ".webp")
        if not os.path.isfile(p):
            for alt in (
                os.path.join(COMPILE_CACHE_DIR, "thumbnails", "textures", quote(parts[0], safe=""), quote(parts[1], safe="") + ".webp"),
                os.path.join(DATA_DIR, "cache", "thumbnails", "textures", quote(parts[0], safe=""), quote(parts[1], safe="") + ".webp"),
                os.path.join(APP_DIR, "data", "cache", "thumbnails", "textures", quote(parts[0], safe=""), quote(parts[1], safe="") + ".webp"),
                os.path.join(THUMBS_DIR, "texturas", quote(parts[0], safe=""), quote(parts[1], safe="") + ".webp"),
                os.path.join(COMPILE_CACHE_DIR, "miniaturas", "texturas", quote(parts[0], safe=""), quote(parts[1], safe="") + ".webp"),
                os.path.join(DATA_DIR, "cache", "miniaturas", "texturas", quote(parts[0], safe=""), quote(parts[1], safe="") + ".webp"),
                os.path.join(APP_DIR, "data", "cache", "miniaturas", "texturas", quote(parts[0], safe=""), quote(parts[1], safe="") + ".webp"),
                os.path.join(APP_DIR, "Dados", "cache", "miniaturas", "texturas", quote(parts[0], safe=""), quote(parts[1], safe="") + ".webp")
            ):
                if os.path.isfile(alt):
                    return alt
        return p
    return None


class State:
    gta_path = ""
    detected_gta = ""
    window = None
    lock = threading.Lock()
    last_ping = 0.0   # last heartbeat from the page open in the browser
    stopping = False  # True when the program is closing on purpose
    test_proc = None  # test server running
    close_ready = False     # projects already saved: the window may close
    closing_started = False  # save before closing in progress


def editor_gta_folder():
    """Pasta do GTA onde o SA Map Studio.exe foi colocado (ou numa subpasta dela), ou "".
    Devolve a pasta mesmo que a instalação esteja incompleta; quem chama confere com is_gta_dir."""
    cur = os.path.abspath(ROOT_DIR)
    for _ in range(3):
        if looks_like_gta_dir(cur):
            return cur
        parent = os.path.dirname(cur)
        if not parent or parent == cur:
            break
        cur = parent
    return ""


def is_editor_inside_gta():
    """Caminho do GTA quando o editor está numa instalação completa do jogo (configuração automática)."""
    folder = editor_gta_folder()
    return folder if is_gta_dir(folder) else ""



def watch_browser(httpd, grace=300, timeout=180):
    """No .exe sem console, encerra o servidor quando a aba do navegador é fechada."""
    started = time.time()
    while True:
        time.sleep(5)
        now = time.time()
        if State.last_ping:
            if now - State.last_ping > timeout:
                break
        elif now - started > grace:
            break
    print("Página fechada: encerrando o servidor.")
    State.stopping = True
    httpd.shutdown()


def build_info():
    """Data e hora da compilação (gravadas pelo Compilar EXE.bat em build-info.json)."""
    try:
        with open(os.path.join(APP_DIR, "build-info.json"), "r", encoding="utf-8-sig") as f:
            data = json.load(f)
        return {"builtAt": str(data.get("builtAt") or ""), "compiled": True}
    except (OSError, ValueError):
        pass
    # Running from source: uses the date of the editor's most recent file
    newest = 0
    for root, _dirs, files in os.walk(os.path.join(APP_DIR, "js")):
        for n in files:
            try:
                newest = max(newest, os.path.getmtime(os.path.join(root, n)))
            except OSError:
                pass
    stamp = time.strftime("%d/%m/%Y %H:%M:%S", time.localtime(newest)) if newest else ""
    return {"builtAt": stamp, "compiled": False}


# ---------------------------------------------------------------------------
# Texture index: reads only the TXD headers (fast, without decoding images)
# ---------------------------------------------------------------------------
FMT_MASK, FMT_1555, FMT_4444, FMT_8888, FMT_888 = 0x0F00, 0x0100, 0x0300, 0x0500, 0x0600
FMT_PAL8, FMT_PAL4 = 0x2000, 0x4000


def txd_textures(data):
    out = []
    n = len(data)
    if n < 12 or struct.unpack_from("<I", data, 0)[0] != 0x16:
        return out
    end = min(12 + struct.unpack_from("<I", data, 4)[0], n)
    pos = 12
    while pos + 12 <= end:
        ctype, csize = struct.unpack_from("<II", data, pos)
        cstart = pos + 12
        cend = min(cstart + csize, end)
        if ctype == 0x15 and cstart + 12 + 88 <= n:
            stype = struct.unpack_from("<I", data, cstart)[0]
            p = cstart + 12
            if stype == 1:
                try:
                    platform = struct.unpack_from("<I", data, p)[0]
                    name = data[p + 8:p + 40].split(b"\0", 1)[0].decode("latin-1").lower()
                    raster = struct.unpack_from("<I", data, p + 72)[0]
                    fourcc = data[p + 76:p + 80]
                    w, h = struct.unpack_from("<HH", data, p + 80)
                    flags = data[p + 87]
                    comp = None
                    if platform == 9:
                        if fourcc.startswith(b"DXT"):
                            comp = fourcc.decode("latin-1")
                        alpha = bool(flags & 1)
                    elif platform == 8:
                        alpha = struct.unpack_from("<I", data, p + 76)[0] != 0
                        if flags:
                            comp = "DXT%d" % flags
                    else:
                        name = ""
                    if name:
                        fmt = raster & FMT_MASK
                        pal = raster & (FMT_PAL8 | FMT_PAL4)
                        if comp in ("DXT3", "DXT5"):
                            has_alpha = True
                        elif comp == "DXT1":
                            has_alpha = alpha
                        else:
                            has_alpha = fmt in (FMT_8888, FMT_1555, FMT_4444) or (bool(pal) and fmt != FMT_888 and alpha)
                        out.append([name, w, h, 1 if has_alpha else 0])
                except (struct.error, IndexError):
                    pass
        pos = cend
    return out


def texture_index(entries):
    result = []
    handles = {}
    try:
        for e in entries:
            img = e.get("img") or ""
            if img not in handles:
                full = resolve_ci(State.gta_path, img)
                handles[img] = open(full, "rb") if full and os.path.isfile(full) else None
            f = handles[img]
            if f is None:
                continue
            f.seek(int(e.get("offset") or 0))
            size = int(e.get("size") or 0)
            if size <= 0 and img.lower().endswith(".img"):
                continue  # empty entry inside a .img: does not read the whole file
            data = f.read(size) if size > 0 else f.read(64 << 20)
            tex = txd_textures(data)
            if tex:
                result.append({"txd": e.get("name"), "tex": tex})
    finally:
        for f in handles.values():
            if f:
                f.close()
    return result


# ---------------------------------------------------------------------------
# SQLite database import (maps saved by Texture Studio and similar)
# ---------------------------------------------------------------------------
def read_sqlite(data):
    fd, tmp = tempfile.mkstemp(suffix=".db")
    try:
        with os.fdopen(fd, "wb") as f:
            f.write(data)
        con = sqlite3.connect(tmp)
        try:
            tables = {}
            for (name,) in con.execute("SELECT name FROM sqlite_master WHERE type='table'"):
                try:
                    cur = con.execute('SELECT * FROM "%s" LIMIT 20000' % name.replace('"', '""'))
                    cols = [c[0] for c in cur.description]
                    rows = []
                    for r in cur.fetchall():
                        rows.append([v.decode("cp1252", "replace") if isinstance(v, bytes) else v for v in r])
                    tables[name] = {"columns": cols, "rows": rows}
                except sqlite3.Error:
                    continue
            return tables
        finally:
            con.close()
    finally:
        try:
            os.remove(tmp)
        except OSError:
            pass


# ---------------------------------------------------------------------------
# In-game map test: isolated SA-MP/open.mp server + the editor's gamemode
# ---------------------------------------------------------------------------
TEST_PORT = 7777
SERVER_EXES = ("omp-server.exe", "samp-server.exe", "omp-server", "samp03svr")


def server_exe_in(folder):
    if not folder or not os.path.isdir(folder):
        return None
    for n in SERVER_EXES:
        full = os.path.join(folder, n)
        if os.path.isfile(full):
            return full
    return None


def detect_servers():
    """Procura pastas de servidor (omp-server.exe / samp-server.exe) nas pastas do usuário."""
    home = os.path.expanduser("~")
    roots = [os.path.join(home, d) for d in ("Documents", "Documentos", "Desktop", "Área de Trabalho", "Downloads")]
    roots += [r"C:\\", r"D:\\"] if IS_WINDOWS else []
    found = []
    seen = set()

    def walk(folder, depth):
        if depth < 0 or len(found) >= 12:
            return
        try:
            names = os.listdir(folder)
        except OSError:
            return
        if any(n.lower() in SERVER_EXES for n in names):
            exe = server_exe_in(folder)
            if exe and folder not in seen:
                seen.add(folder)
                found.append(folder)
            return
        for n in names:
            if n.startswith(".") or n.lower() in ("windows", "program files", "program files (x86)", "programdata", "appdata", "$recycle.bin", "node_modules"):
                continue
            full = os.path.join(folder, n)
            if os.path.isdir(full):
                walk(full, depth - 1)

    for r in roots:
        walk(r, 1 if r.endswith(":\\\\") or r.endswith(":\\") else 3)
    return found


def samp_client():
    exe = resolve_ci(State.gta_path, "samp.exe") if State.gta_path else None
    return exe if exe and os.path.isfile(exe) else None


def find_samapstudio_amx():
    """Localiza o arquivo samapstudio.amx nas fontes de compilacao ou instalacao."""
    for cand in (
        os.path.join(COMPILE_SOURCES_DIR, "samapstudio.amx"),
        os.path.join(TEST_DIR, "gamemodes", "samapstudio.amx"),
        os.path.join(APP_DIR, "samapstudio.amx"),
        os.path.join(BASE_DIR, "samapstudio.amx"),
        os.path.join(BASE_DIR, "omp-server-source", "gamemodes", "samapstudio.amx"),
        os.path.join(BASE_DIR, "compiled", "SA Map Studio", "sa-map-studio", "test-server", "gamemodes", "samapstudio.amx"),
    ):
        if os.path.isfile(cand):
            return cand
    return ""


def test_info():
    cfg = load_config()
    server = cfg.get("server_path") or ""
    # A server already inside the program folder ("test-server") takes priority
    candidates = [
        TEST_DIR,
        os.path.join(ROOT_DIR, "compiled", "SA Map Studio", "sa-map-studio", "test-server"),
        os.path.join(BASE_DIR, "compiled", "SA Map Studio", "sa-map-studio", "test-server"),
        os.path.join(ROOT_DIR, "omp-server-source"),
        os.path.join(BASE_DIR, "omp-server-source"),
    ]
    for c in candidates:
        if server_exe_in(c):
            server = c
            break
    if not server_exe_in(server):
        found = detect_servers()
        server = found[0] if found else ""
        if server:
            update_config(server_path=server)
    exe = server_exe_in(server)
    amx = find_samapstudio_amx()
    running = State.test_proc is not None and State.test_proc.poll() is None
    return {
        "serverPath": server, "serverExe": os.path.basename(exe) if exe else "",
        "client": samp_client() or "", "running": running, "port": TEST_PORT,
        "gamemode": bool(amx), "log": tail_log(),
        "builtin": os.path.normcase(os.path.abspath(server)) == os.path.normcase(os.path.abspath(TEST_DIR)) if server else False,
        "testDir": TEST_DIR,
    }


def tail_log(lines=30):
    for name in ("log.txt", "server_log.txt"):
        full = os.path.join(TEST_DIR, name)
        if os.path.isfile(full):
            try:
                with open(full, "r", encoding="utf-8", errors="replace") as f:
                    return "".join(f.readlines()[-lines:])
            except OSError:
                pass
    return ""


def stop_test():
    p = State.test_proc
    State.test_proc = None
    if p is not None and p.poll() is None:
        try:
            p.terminate()
            p.wait(timeout=5)
        except Exception:
            try:
                p.kill()
            except Exception:
                pass


def copy_if_newer(src, dst):
    try:
        if os.path.normcase(os.path.abspath(src)) == os.path.normcase(os.path.abspath(dst)):
            return
        if os.path.exists(dst):
            a, b = os.stat(src), os.stat(dst)
            if a.st_size == b.st_size and int(a.st_mtime) <= int(b.st_mtime):
                return
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy2(src, dst)
    except OSError:
        pass


def port_free(port):
    """True se ninguém está usando a porta UDP neste computador."""
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        sock.bind(("0.0.0.0", port))
        return True
    except OSError:
        return False
    finally:
        sock.close()


def start_test(body):
    info = test_info()
    exe = server_exe_in(info["serverPath"])
    if not exe:
        return {"ok": False, "error": "Escolha a pasta de um servidor (onde fica o executável do servidor)."}
    amx = find_samapstudio_amx()
    if not amx or not os.path.isfile(amx):
        return {"ok": False, "error": "O gamemode de teste não foi encontrado na instalação do editor."}
    stop_test()
    if not port_free(TEST_PORT):
        time.sleep(1.0)  # the previous test server may still be finishing closing
    if not port_free(TEST_PORT):
        return {"ok": False, "error": "A porta %d está em uso, provavelmente por outro servidor aberto "
                                      "no seu computador. Feche esse servidor e tente de novo." % TEST_PORT}
    src = os.path.dirname(exe)
    is_omp = os.path.basename(exe).lower().startswith("omp")
    os.makedirs(TEST_DIR, exist_ok=True)
    same = os.path.normcase(os.path.abspath(src)) == os.path.normcase(os.path.abspath(TEST_DIR))
    if not same:
        # Copies the server to "Servidor de Teste" (the user's server and gamemode are not touched)
        copy_if_newer(exe, os.path.join(TEST_DIR, os.path.basename(exe)))
        for n in os.listdir(src):
            full = os.path.join(src, n)
            if os.path.isfile(full) and n.lower().endswith(".dll"):
                copy_if_newer(full, os.path.join(TEST_DIR, n))
        comps = os.path.join(src, "components")
        if is_omp and os.path.isdir(comps):
            for n in os.listdir(comps):
                full = os.path.join(comps, n)
                if os.path.isfile(full):
                    copy_if_newer(full, os.path.join(TEST_DIR, "components", n))
        plugs = os.path.join(src, "plugins")
        if os.path.isdir(plugs):
            for n in os.listdir(plugs):
                full = os.path.join(plugs, n)
                if os.path.isfile(full):
                    copy_if_newer(full, os.path.join(TEST_DIR, "plugins", n))
    for d in ("gamemodes", "filterscripts", "scriptfiles/samapstudio", "plugins"):
        os.makedirs(os.path.join(TEST_DIR, d), exist_ok=True)
    target_dirs = {TEST_DIR}
    if info.get("serverPath"):
        target_dirs.add(info["serverPath"])
    dist_root_st = os.path.join(ROOT_DIR, "compiled", "SA Map Studio", "sa-map-studio", "test-server") if not FROZEN else TEST_DIR
    if os.path.isdir(dist_root_st):
        target_dirs.add(dist_root_st)

    use_streamer = bool(body.get("streamer", False))
    streamer_src = None
    for cand in (
        os.path.join(BASE_DIR, "omp-server-source", "plugins", "streamer.dll"),
        os.path.join(TEST_DIR, "plugins", "streamer.dll"),
        os.path.join(APP_DIR, "plugins", "streamer.dll"),
        os.path.join(src, "plugins", "streamer.dll"),
        os.path.join(ROOT_DIR, "compiled", "SA Map Studio", "sa-map-studio", "test-server", "plugins", "streamer.dll"),
        os.path.join(BASE_DIR, "compiled", "SA Map Studio", "sa-map-studio", "test-server", "plugins", "streamer.dll"),
    ):
        if os.path.isfile(cand):
            streamer_src = cand
            break

    rcon = base64.b32encode(os.urandom(10)).decode().lower()
    map_data = body.get("map", "")
    for td in target_dirs:
        try:
            os.makedirs(os.path.join(td, "gamemodes"), exist_ok=True)
            os.makedirs(os.path.join(td, "plugins"), exist_ok=True)
            os.makedirs(os.path.join(td, "scriptfiles", "samapstudio"), exist_ok=True)
            with open(os.path.join(td, "scriptfiles", "samapstudio", "mapa.txt"), "w", encoding="cp1252", errors="replace", newline="\r\n") as f:
                f.write(map_data)
            dst_amx = os.path.join(td, "gamemodes", "samapstudio.amx")
            if amx and os.path.isfile(amx) and os.path.normcase(os.path.abspath(amx)) != os.path.normcase(os.path.abspath(dst_amx)):
                copy_if_newer(amx, dst_amx)
            if streamer_src:
                dst_streamer = os.path.join(td, "plugins", "streamer.dll")
                if os.path.normcase(os.path.abspath(streamer_src)) != os.path.normcase(os.path.abspath(dst_streamer)):
                    copy_if_newer(streamer_src, dst_streamer)
            load_streamer = bool(streamer_src or use_streamer)
            plugins_line = "plugins streamer.dll\n" if load_streamer else "plugins\n"
            with open(os.path.join(td, "server.cfg"), "w", encoding="utf-8", newline="\r\n") as f:
                f.write("echo Executing Server Config...\nlanmode 1\nrcon_password %s\nmaxplayers 8\nport %d\n"
                        "hostname SA Map Studio - Testing server\ngamemode0 samapstudio 1\nfilterscripts\nannounce 0\n"
                        "%s"
                        "query 1\nchatlogging 0\nweburl localhost\nonfoot_rate 40\nincar_rate 40\nweapon_rate 40\n"
                        "stream_distance 300.0\nstream_rate 1000\nmaxnpc 0\nlogtimeformat [%%H:%%M:%%S]\nlanguage Portugues\n" % (rcon, TEST_PORT, plugins_line))
            cfg = {
                "name": "SA Map Studio - Testing server", "max_players": 8, "announce": False, "enable_query": True,
                "network": {"port": TEST_PORT, "bind": "127.0.0.1"},
                "pawn": {"main_scripts": ["samapstudio"], "side_scripts": [], "legacy_plugins": ["streamer"] if load_streamer else []},
                "rcon": {"enable": False, "password": rcon},
                "game": {"use_entry_exit_markers": False, "use_player_ped_anims": True, "use_all_animations": True},
            }
            with open(os.path.join(td, "config.json"), "w", encoding="utf-8") as f:
                json.dump(cfg, f, indent=2)
        except Exception as err:
            print(f"[SA Map Studio] Erro ao preparar servidor de teste em {td}: {err}")
    for name in ("log.txt", "server_log.txt"):
        try:
            os.remove(os.path.join(TEST_DIR, name))
        except OSError:
            pass
    flags = 0x08000000 if IS_WINDOWS else 0  # CREATE_NO_WINDOW
    try:
        State.test_proc = subprocess.Popen([os.path.join(TEST_DIR, os.path.basename(exe))], cwd=TEST_DIR,
                                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, creationflags=flags)
    except OSError as err:
        return {"ok": False, "error": "Não consegui iniciar o servidor: %s" % err}
    # Waits for the server to come up (the log says so) before opening the game
    started = False
    for _ in range(40):
        time.sleep(0.25)
        if State.test_proc.poll() is not None:
            return {"ok": False, "error": "O servidor fechou logo depois de abrir. Veja o registro abaixo.", "log": tail_log()}
        log = tail_log(80)
        if "samapstudio" in log.lower() or "started server" in log.lower() or "objetos" in log.lower():
            started = True
            break
    client = samp_client()
    launched = False
    if body.get("launch", True) and client:
        # The SA-MP client writes to the GTA folder: in a protected folder (Program Files) it
        # needs administrator. If the editor is not administrator, Windows opens the client
        # with its own prompt (UAC), as happened when the whole editor opened as administrator.
        needs_admin = False
        if IS_WINDOWS:
            try:
                import ctypes
                needs_admin = not ctypes.windll.shell32.IsUserAnAdmin() and _in_protected_folder(client)
            except Exception:
                needs_admin = False
        if needs_admin:
            try:
                import ctypes
                r = ctypes.windll.shell32.ShellExecuteW(None, "runas", client, "127.0.0.1:%d" % TEST_PORT,
                                                        os.path.dirname(client), 1)
                launched = int(r) > 32
            except Exception:
                launched = False
            return {"ok": True, "started": started, "launched": launched, "address": "127.0.0.1:%d" % TEST_PORT, "log": tail_log()}
        try:
            subprocess.Popen([client, "127.0.0.1:%d" % TEST_PORT], cwd=os.path.dirname(client))
            launched = True
        except OSError as err:
            # samp.exe that requires administrator (error 740): Windows opens it with its own prompt (UAC)
            launched = False
            if IS_WINDOWS and getattr(err, "winerror", None) == 740:
                try:
                    import ctypes
                    r = ctypes.windll.shell32.ShellExecuteW(None, "open", client, "127.0.0.1:%d" % TEST_PORT,
                                                            os.path.dirname(client), 1)
                    launched = int(r) > 32
                except Exception:
                    launched = False
    return {"ok": True, "started": started, "launched": launched, "address": "127.0.0.1:%d" % TEST_PORT, "log": tail_log()}


# ---------------------------------------------------------------------------
# Video and Animation Cache Management
# ---------------------------------------------------------------------------
class AnimCacheManager:
    is_downloading = False
    stop_requested = False
    downloaded = 0
    total = 1872
    current = ""
    error = ""

    @classmethod
    def get_anim_list(cls):
        candidates = [
            os.path.join(COMPILE_SOURCES_DIR, "anim-list.json"),
            os.path.join(APP_DIR, "anim-list.json"),
            os.path.join(BASE_DIR, "anim-list.json"),
            os.path.join(APP_DIR, "anim_list.json"),
            os.path.join(BASE_DIR, "anim_list.json"),
            os.path.join(BASE_DIR, "scratch", "parsed_anims.json"),
        ]
        for c in candidates:
            if os.path.isfile(c):
                try:
                    with open(c, "r", encoding="utf-8") as f:
                        return json.load(f)
                except Exception:
                    pass
        return []

    @classmethod
    def count_cached(cls):
        names = set()
        for base in (ANIM_CACHE_DIR, os.path.join(COMPILE_CACHE_DIR, "animations")):
            for root, _, files in os.walk(base):
                for file in files:
                    if file.lower().endswith(".webm"):
                        names.add((os.path.basename(root).lower(), file.lower()))
        return len(names)

    @classmethod
    def fetch_video_bytes(cls, lib, name):
        import urllib.request
        candidates = [
            (lib, name),
            (lib.lower(), name),
            (lib.upper(), name),
            (lib, name.lower()),
            (lib.lower(), name.lower()),
            (lib.capitalize(), name)
        ]
        seen = set()
        for l, n in candidates:
            pair = (l, n)
            if pair in seen:
                continue
            seen.add(pair)
            url = f"https://assets.open.mp/assets/anims/{quote(l)}/{quote(n)}.webm"
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
                with urllib.request.urlopen(req, timeout=8) as resp:
                    if resp.status == 200:
                        return resp.read()
            except Exception:
                continue
        return None

    @classmethod
    def get_or_download(cls, lib, name):
        safe_l = re.sub(r'[^a-zA-Z0-9_\-]', '', lib)
        safe_n = re.sub(r'[^a-zA-Z0-9_\-]', '', name)
        if not safe_l or not safe_n:
            return None
        packaged = os.path.join(COMPILE_CACHE_DIR, "animations", safe_l, f"{safe_n}.webm")
        if os.path.isfile(packaged) and os.path.getsize(packaged) > 1000:
            return packaged
        folder = os.path.join(ANIM_CACHE_DIR, safe_l)
        os.makedirs(folder, exist_ok=True)
        file_path = os.path.join(folder, f"{safe_n}.webm")
        if os.path.isfile(file_path) and os.path.getsize(file_path) > 1000:
            return file_path
        data = cls.fetch_video_bytes(lib, name)
        if data:
            try:
                with open(file_path, "wb") as f:
                    f.write(data)
                return file_path
            except Exception:
                pass
        return None

    @classmethod
    def start_batch_download(cls):
        if cls.is_downloading:
            return False
        cls.is_downloading = True
        cls.stop_requested = False
        cls.error = ""

        def worker():
            try:
                anims = cls.get_anim_list()
                cls.total = len(anims)
                for i, item in enumerate(anims):
                    if cls.stop_requested:
                        break
                    lib = item.get("lib", "")
                    name = item.get("name", "")
                    cls.current = f"{lib}/{name}"
                    cls.get_or_download(lib, name)
                    cls.downloaded = i + 1
                    time.sleep(0.03)
            except Exception as e:
                cls.error = str(e)
            finally:
                cls.is_downloading = False
                cls.current = ""

        t = threading.Thread(target=worker, daemon=True)
        t.start()
        return True

    @classmethod
    def cancel_batch_download(cls):
        cls.stop_requested = True


def decode_dxt1(data, width, height):
    out = bytearray(width * height * 3)
    bw, bh = width // 4, height // 4
    p = 0
    for by in range(bh):
        for bx in range(bw):
            if p + 8 > len(data): break
            c0, c1, lookup = struct.unpack_from('<HHI', data, p)
            p += 8
            r0 = ((c0 >> 11) & 0x1F) * 255 // 31
            g0 = ((c0 >> 5) & 0x3F) * 255 // 63
            b0 = (c0 & 0x1F) * 255 // 31
            r1 = ((c1 >> 11) & 0x1F) * 255 // 31
            g1 = ((c1 >> 5) & 0x3F) * 255 // 63
            b1 = (c1 & 0x1F) * 255 // 31
            if c0 > c1:
                colors = [
                    (r0, g0, b0),
                    (r1, g1, b1),
                    ((2*r0 + r1)//3, (2*g0 + g1)//3, (2*b0 + b1)//3),
                    ((r0 + 2*r1)//3, (g0 + 2*g1)//3, (b0 + 2*b1)//3)
                ]
            else:
                colors = [
                    (r0, g0, b0),
                    (r1, g1, b1),
                    ((r0 + r1)//2, (g0 + g1)//2, (b0 + b1)//2),
                    (0, 0, 0)
                ]
            for py in range(4):
                y = by * 4 + py
                for px in range(4):
                    x = bx * 4 + px
                    code = (lookup >> (2 * (py * 4 + px))) & 3
                    c = colors[code]
                    idx = (y * width + x) * 3
                    out[idx] = c[0]
                    out[idx+1] = c[1]
                    out[idx+2] = c[2]
    return out


def write_png(filename, width, height, rgb_data):
    import zlib
    def chunk(chunk_type, data):
        c = chunk_type + data
        crc = struct.pack('>I', zlib.crc32(c) & 0xffffffff)
        return struct.pack('>I', len(data)) + c + crc

    ihdr = chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0))
    raw_lines = bytearray()
    row_len = width * 3
    for y in range(height):
        raw_lines.append(0)
        raw_lines.extend(rgb_data[y * row_len : (y + 1) * row_len])

    idat = chunk(b'IDAT', zlib.compress(bytes(raw_lines), 6))
    iend = chunk(b'IEND', b'')

    with open(filename, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n')
        f.write(ihdr)
        f.write(idat)
        f.write(iend)


def ensure_radarmap(gta_path, out_png):
    if not gta_path: return False
    gta3_img = os.path.join(gta_path, "models", "gta3.img")
    if not os.path.isfile(gta3_img): return False
    try:
        entries = {}
        with open(gta3_img, 'rb') as f:
            header = f.read(8)
            if header[:4] != b'VER2': return False
            num_entries = struct.unpack('<I', header[4:8])[0]
            for _ in range(num_entries):
                b = f.read(32)
                off, size, name = struct.unpack('<II24s', b)
                nm = name.split(b'\x00')[0].decode('ascii', 'ignore').lower()
                if nm.startswith('radar') and nm.endswith('.txd'):
                    entries[nm] = (off * 2048, size * 2048)

            tiles = {}
            for i in range(144):
                nm = f'radar{i:02d}.txd'
                if nm not in entries: continue
                off, sz = entries[nm]
                f.seek(off)
                data = f.read(sz)
                idx = data.find(b'DXT1')
                if idx != -1:
                    tiles[i] = data[idx+16 : idx+16+8192]

        grid_w, grid_h = 12, 12
        tile_size = 128
        total_w, total_h = grid_w * tile_size, grid_h * tile_size
        full_map = bytearray(total_w * total_h * 3)

        for i in range(144):
            if i not in tiles: continue
            tile_rgb = decode_dxt1(tiles[i], tile_size, tile_size)
            gx = i % grid_w
            gy = i // grid_w
            for ty in range(tile_size):
                dest_y = gy * tile_size + ty
                dest_x = gx * tile_size
                dest_idx = (dest_y * total_w + dest_x) * 3
                src_idx = ty * tile_size * 3
                full_map[dest_idx : dest_idx + tile_size * 3] = tile_rgb[src_idx : src_idx + tile_size * 3]

        os.makedirs(os.path.dirname(out_png), exist_ok=True)
        write_png(out_png, total_w, total_h, full_map)
        return True
    except Exception as e:
        print(f"Erro em ensure_radarmap: {e}")
        return False


# ---------------------------------------------------------------------------
# Real GTA SA Audio Extraction for PlayerPlaySound (/api/sound/<id>)
# ---------------------------------------------------------------------------
_GTA_STREAM_XOR = bytes([
    0xEA, 0x3A, 0xC4, 0xA1, 0x9A, 0xA8, 0x14, 0xF3,
    0x48, 0xB0, 0xD7, 0x23, 0x9D, 0xE8, 0xFF, 0xF1,
])

_FRONTEND_STREAM_MAP = {
    1062: 153,  # SOUND_GOGO_TRACK_START
    1068: 150,  # SOUND_DUAL_TRACK_START
    1076: 141,  # SOUND_BEE_TRACK_START
    1097: 145,  # SOUND_AWARD_TRACK_START
    1142: 159,  # SOUND_OTB_TRACK_START
    1183: 149,  # SOUND_DRIVING_AWARD_TRACK_START
    1185: 142,  # SOUND_BIKE_AWARD_TRACK_START
    1187: 161,  # SOUND_PILOT_AWARD_TRACK_START
}

_FRONTEND_GENRL_MAP = {
    1020: (39, 0),
    1021: (138, 18),
    1022: (60, 0),
    1036: (60, 2),
    1052: (60, 1),
    1053: (60, 2),
    1054: (60, 3),
    1055: (60, 4),
    1056: (60, 0),
    1057: (60, 1),
    1058: (60, 0),
    1063: (60, 0),
    1069: (60, 0),
    1083: (60, 5),
    1084: (60, 6),
    1085: (60, 7),
    1095: (138, 16),
    1098: (60, 0),
    1130: (74, 0),
    1131: (39, 0),
    1132: (60, 8),
    1133: (138, 12),
    1134: (138, 18),
    1135: (74, 2),
    1136: (74, 1),
    1137: (60, 0),
    1138: (60, 1),
    1139: (60, 2),
    1140: (138, 0),
    1141: (138, 4),
    1143: (60, 0),
    1147: (60, 3),
    1148: (138, 6),
    1149: (60, 1),
    1150: (60, 0),
    1153: (138, 19),
    1163: (74, 5),
    1165: (138, 19),
    1166: (138, 16),
    1169: (145, 12),
    1184: (60, 0),
    1186: (60, 0),
    1188: (60, 0),
    1190: (74, 3),
}


def _extract_sfx_bank_slot(gta_path, global_bank_id, slot_id):
    bank_lkup = resolve_ci(gta_path, "audio/CONFIG/BankLkup.dat")
    pak_files = resolve_ci(gta_path, "audio/CONFIG/PakFiles.dat")
    if not bank_lkup or not pak_files:
        return None
    try:
        with open(bank_lkup, "rb") as f:
            f.seek(global_bank_id * 12)
            rec = f.read(12)
            if len(rec) < 12:
                return None
            pak_idx, offset, size = struct.unpack("<B3xII", rec)
        with open(pak_files, "rb") as f:
            f.seek(pak_idx * 52)
            pak_raw = f.read(52)
            if not pak_raw:
                return None
            pak_name = pak_raw.split(b"\x00", 1)[0].decode("latin-1").strip()
        sfx_path = resolve_ci(gta_path, f"audio/SFX/{pak_name}")
        if not sfx_path or not os.path.isfile(sfx_path):
            return None
        with open(sfx_path, "rb") as f:
            f.seek(offset)
            num_sounds = struct.unpack("<I", f.read(4))[0]
            if slot_id < 0 or slot_id >= num_sounds or num_sounds > 400:
                return None
            hdr = f.read(400 * 12)
            if len(hdr) < 4800:
                return None
            slots = [struct.unpack_from("<IiHH", hdr, s * 12) for s in range(num_sounds)]
            buf_off, _loop_off, sample_rate, _flags = slots[slot_id]
            next_off = slots[slot_id + 1][0] if (slot_id + 1) < num_sounds else size
            pcm_len = max(0, min(next_off - buf_off, 8 * 1024 * 1024))
            if pcm_len <= 0:
                return None
            f.seek(offset + 4 + 4800 + buf_off)
            pcm = f.read(pcm_len)
        if not pcm:
            return None
        sr = sample_rate if 4000 <= sample_rate <= 96000 else 22050
        byte_rate = sr * 2
        wav_hdr = struct.pack(
            "<4sI4s4sIHHIIHH4sI",
            b"RIFF", 36 + len(pcm), b"WAVE",
            b"fmt ", 16, 1, 1, sr, byte_rate, 2, 16,
            b"data", len(pcm),
        )
        return wav_hdr + pcm, "audio/wav"
    except Exception:
        return None


def _extract_stream_track(gta_path, track_id):
    trak_lkup = resolve_ci(gta_path, "audio/CONFIG/TrakLkup.dat")
    strm_paks = resolve_ci(gta_path, "audio/CONFIG/StrmPaks.dat")
    if not trak_lkup or not strm_paks:
        return None
    try:
        with open(trak_lkup, "rb") as f:
            f.seek(track_id * 12)
            rec = f.read(12)
            if len(rec) < 12:
                return None
            pak_idx, offset, size = struct.unpack("<B3xII", rec)
        if size <= 8068:
            return None
        with open(strm_paks, "rb") as f:
            f.seek(pak_idx * 16)
            pak_raw = f.read(16)
            if not pak_raw:
                return None
            pak_name = pak_raw.split(b"\x00", 1)[0].decode("latin-1").strip()
        strm_path = resolve_ci(gta_path, f"audio/streams/{pak_name}")
        if not strm_path or not os.path.isfile(strm_path):
            return None
        ogg_start = offset + 8068
        ogg_len = min(size - 8068, 6 * 1024 * 1024)
        with open(strm_path, "rb") as f:
            f.seek(ogg_start)
            enc = f.read(ogg_len)
        if not enc:
            return None
        key = _GTA_STREAM_XOR
        dec = bytes(b ^ key[(ogg_start + i) & 15] for i, b in enumerate(enc))
        if not dec.startswith(b"OggS"):
            idx = dec.find(b"OggS")
            if idx < 0:
                return None
            dec = dec[idx:]
        return dec, "audio/ogg"
    except Exception:
        return None


def extract_gta_sound(gta_path, soundid):
    if soundid <= 0:
        return None

    # Checks the local/embedded WAV sound cache
    for base_dir in [
        os.path.join(COMPILE_CACHE_DIR, "sounds"),
        os.path.join(DATA_DIR, "cache", "sounds"),
        os.path.join(BASE_DIR, "data", "cache", "sounds"),
        os.path.join(ROOT_DIR, "compile-sources", "cache", "sounds"),
        os.path.join(APP_DIR, "data", "cache", "sounds"),
        os.path.join(os.path.dirname(__file__), "compile-sources", "cache", "sounds"),
        os.path.join(os.path.dirname(__file__), "cache", "sounds"),
        os.path.join(os.path.dirname(__file__), "system", "cache", "sounds"),
    ]:
        fpath = os.path.join(base_dir, f"{soundid}.wav")
        if os.path.isfile(fpath):
            try:
                with open(fpath, "rb") as f:
                    return f.read(), "audio/wav"
            except Exception:
                pass

    if not gta_path:
        return None
    if soundid >= 2000:
        bank_id = 147 + (soundid - 2000) // 200
        slot_id = (soundid - 2000) % 200
        return _extract_sfx_bank_slot(gta_path, bank_id, slot_id)
    if 1 <= soundid <= 999:
        return _extract_stream_track(gta_path, soundid)
    if 1000 <= soundid <= 1199:
        if soundid in _FRONTEND_STREAM_MAP:
            return _extract_stream_track(gta_path, _FRONTEND_STREAM_MAP[soundid])
        if soundid in _FRONTEND_GENRL_MAP:
            bs = _FRONTEND_GENRL_MAP[soundid]
            res = _extract_sfx_bank_slot(gta_path, bs[0], bs[1])
            if res:
                return res
        return _extract_sfx_bank_slot(gta_path, 60, soundid % 9)
    return None


# ---------------------------------------------------------------------------
# Servidor HTTP
# ---------------------------------------------------------------------------
class Handler(SimpleHTTPRequestHandler):
    server_version = "SAMapStudio/" + VERSION
    protocol_version = "HTTP/1.1"

    def log_message(self, fmt, *args):
        pass  # quiet: only server errors appear

    def log_request(self, code="-", size="-"):
        try:
            if int(code) >= 500:
                sys.stderr.write("[%s] %s -> %s\n" % (time.strftime("%H:%M:%S"), self.path, code))
        except (TypeError, ValueError):
            pass

    def parse_request(self):
        res = super().parse_request()
        if res and hasattr(self, "command") and self.command:
            self.command = self.command.upper()
        return res

    def do_HEAD(self):
        return self.do_GET()

    def send_error(self, code, message=None, explain=None):
        self.close_connection = True
        cmd = getattr(self, "command", "UNKNOWN")
        path = getattr(self, "path", "UNKNOWN")
        try:
            sys.stderr.write(f"[{time.strftime('%H:%M:%S')}] {path} -> {code} ({message}) [{cmd}]\n")
        except Exception:
            pass
        super().send_error(code, message=message, explain=explain)

    def do_OPTIONS(self):
        self.close_connection = True
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Range")
        self.send_header("Content-Length", "0")
        self.send_header("Connection", "close")
        self.end_headers()

    def send_json(self, obj, status=200):
        self.close_connection = True
        data = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Connection", "close")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        try:
            self.wfile.write(data)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def read_body(self):
        try:
            n = int(self.headers.get("Content-Length") or 0)
            return self.rfile.read(n) if n > 0 else b""
        except Exception:
            return b""

    def read_json(self):
        try:
            b = self.read_body()
            return json.loads(b.decode("utf-8") or "{}") if b else {}
        except Exception:
            return None

    def send_file(self, path, cache="no-cache"):
        try:
            size = os.path.getsize(path)
            f = open(path, "rb")
        except OSError:
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        with f:
            ext = os.path.splitext(path)[1].lower()
            ctype = MIME.get(ext, "application/octet-stream")
            rng = self.headers.get("Range")
            start, end = 0, size - 1
            status = 200
            if rng:
                m = re.match(r"bytes=(\d*)-(\d*)", rng)
                if m:
                    if m.group(1):
                        start = int(m.group(1))
                        if m.group(2):
                            end = min(int(m.group(2)), size - 1)
                    elif m.group(2):
                        start = max(0, size - int(m.group(2)))
                    if start > end or start >= size:
                        self.send_response(HTTPStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
                        self.send_header("Content-Range", "bytes */%d" % size)
                        self.send_header("Content-Length", "0")
                        self.end_headers()
                        return
                    status = 206
            length = end - start + 1
            self.send_response(status)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(length))
            self.send_header("Accept-Ranges", "bytes")
            self.send_header("Cache-Control", cache)
            if status == 206:
                self.send_header("Content-Range", "bytes %d-%d/%d" % (start, end, size))
            self.end_headers()
            f.seek(start)
            remaining = length
            while remaining > 0:
                chunk = f.read(min(1 << 20, remaining))
                if not chunk:
                    break
                try:
                    self.wfile.write(chunk)
                except (BrokenPipeError, ConnectionResetError):
                    return
                remaining -= len(chunk)

    # ---------- rotas ----------
    def do_GET(self):
        url = urlparse(self.path)
        path = unquote(url.path)
        if path.startswith("/api/sound/"):
            sid_str = path[len("/api/sound/"):].strip()
            try:
                sid = int(sid_str)
            except ValueError:
                return self.send_error(400, "Sound ID invalido")
            res = extract_gta_sound(State.gta_path, sid)
            if not res:
                return self.send_error(404, "Áudio não encontrado")
            audio_bytes, ctype = res
            self.send_response(200)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(audio_bytes)))
            self.send_header("Cache-Control", "public, max-age=86400")
            self.end_headers()
            try:
                self.wfile.write(audio_bytes)
            except (BrokenPipeError, ConnectionResetError):
                pass
            return
        if path.startswith("/gta/"):
            return self.get_gta(path[5:])
        if path.startswith("/thumbs/"):
            return self.get_thumb(path[len("/thumbs/"):])
        if path.startswith("/cache/"):
            sub = path[len("/cache/"):].lstrip("/")
            rel_sub = sub.replace("/", os.sep)
            all_cdirs = (
                CACHE_DIR,
                COMPILE_CACHE_DIR,
                os.path.join(APP_DIR, "data", "cache"),
                os.path.join(APP_DIR, "Dados", "cache"),
                os.path.join(DATA_DIR, "cache"),
                os.path.join(BASE_DIR, "data", "cache"),
                os.path.join(ROOT_DIR, "data", "cache"),
                os.path.join(ROOT_DIR, "compile-sources", "cache"),
                os.path.join(os.path.dirname(BASE_DIR), "data", "cache"),
                os.path.join(os.path.dirname(BASE_DIR), "Dados", "cache")
            )
            for cdir in all_cdirs:
                full = os.path.join(cdir, rel_sub)
                if os.path.isfile(full):
                    return self.send_file(full, cache="public, max-age=86400")
            low_rel = rel_sub.lower()
            if "sprites" in low_rel:
                base_name = os.path.basename(low_rel)
                parts = low_rel.split(os.sep)
                sub_folder = parts[1] if len(parts) > 2 else ""
                cand_folders = [sub_folder]
                if sub_folder in ("loadscs", "ld_loadscs"):
                    cand_folders.extend(["loadsuk", "loadscs"])
                for cdir in all_cdirs:
                    for cf in cand_folders:
                        if not cf:
                            continue
                        alt_cand = os.path.join(cdir, "sprites", cf, base_name)
                        if os.path.isfile(alt_cand):
                            return self.send_file(alt_cand, cache="public, max-age=86400")
            return self.send_error(404, "Arquivo de cache não encontrado")
        if path == "/api/ping":
            State.last_ping = time.time()
            return self.send_json({"ok": True})
        if path == "/api/colsphere":
            qs = parse_qs(url.query)
            return self.send_json({"ok": True, "sphere": col_sphere(qs.get("model", [""])[0])})
        if path == "/api/gdifont":
            qs = parse_qs(url.query)
            try:
                size = int(qs.get("size", ["24"])[0])
            except ValueError:
                size = 24
            res = gdi_font_metrics(qs.get("face", ["Arial"])[0], size, qs.get("bold", ["1"])[0] not in ("0", ""))
            return self.send_json(res)
        if path == "/api/example_project":
            # Example project: delivered only on the editor's first launch
            cfg = load_config()
            if cfg.get("example_shown"):
                return self.send_json({"ok": False})
            for cand in (os.path.join(APP_DIR, "example-map.json"), os.path.join(COMPILE_SOURCES_DIR, "example-map.json")):
                if os.path.isfile(cand):
                    try:
                        with open(cand, "r", encoding="utf-8") as f:
                            project = json.load(f)
                    except (OSError, ValueError):
                        break
                    update_config(example_shown=True)
                    return self.send_json({"ok": True, "project": project})
            return self.send_json({"ok": False})
        if path == "/api/config":
            cfg = load_config()
            inside_path = is_editor_inside_gta()
            inside_gta = bool(inside_path)
            if inside_gta:
                if State.gta_path != inside_path or not cfg.get("gta_confirmed"):
                    State.gta_path = inside_path
                    State.detected_gta = inside_path
                    update_config(gta_path=inside_path, gta_confirmed=True)
                needs_setup = False
                is_valid = True
                detected_path = inside_path
                gta_path_resp = inside_path
            else:
                gta_confirmed = cfg.get("gta_confirmed", False)
                is_valid = is_gta_dir(State.gta_path)
                needs_setup = (not gta_confirmed or not is_valid)
                detected_path = State.detected_gta or detect_gta(cfg.get("gta_path") or "")
                if not detected_path:
                    detected_path = get_canonical_default_gta()
                if detected_path and not State.detected_gta:
                    State.detected_gta = detected_path
                if not State.gta_path and is_gta_dir(detected_path):
                    State.gta_path = detected_path
                gta_path_resp = State.gta_path if (gta_confirmed and is_valid) else ""

            return self.send_json({
                "gtaPath": gta_path_resp,
                "detectedPath": detected_path or get_canonical_default_gta(),
                "needsSetup": needs_setup,
                "ok": is_valid and not needs_setup,
                "insideGta": inside_gta,
                "version": VERSION,
                "language": cfg.get("language") or "",
                "build": build_info(),
                "problem": gta_problem(State.gta_path) if (State.gta_path and not needs_setup) else "",
                "folders": {"projects": PROJECTS_DIR, "exports": EXPORTS_DIR, "data": DATA_DIR}
            })
        if path == "/api/projects":
            return self.list_projects()
        if path.startswith("/api/projects/"):
            return self.get_project(path[len("/api/projects/"):])
        if path == "/api/thumbs/index":
            return self.thumbs_index()
        if path == "/api/radarmap":
            png_path = ""
            for cdir in (
                CACHE_DIR,
                COMPILE_CACHE_DIR,
                os.path.join(DATA_DIR, "cache"),
                os.path.join(BASE_DIR, "data", "cache"),
                os.path.join(ROOT_DIR, "data", "cache"),
                os.path.join(APP_DIR, "data", "cache"),
                os.path.join(ROOT_DIR, "compile-sources", "cache"),
            ):
                cand = os.path.join(cdir, "radarmap.png")
                if os.path.isfile(cand):
                    png_path = cand
                    break
            if not png_path:
                target_path = os.path.join(CACHE_DIR, "radarmap.png")
                if ensure_radarmap(State.gta_path, target_path):
                    png_path = target_path
            if png_path and os.path.isfile(png_path):
                return self.send_file(png_path, cache="public, max-age=86400")
            return self.send_json({"error": "Mapa do radar não disponível"}, 404)
        if path.startswith("/api/cache/"):
            name = safe_name(path[len("/api/cache/"):])
            alt_name = "textures" if name == "texturas" else ("texturas" if name == "textures" else name)
            for cdir in (CACHE_DIR, COMPILE_CACHE_DIR, os.path.join(APP_DIR, "data", "cache"), os.path.join(APP_DIR, "Dados", "cache")):
                for n in (name, alt_name):
                    full = os.path.join(cdir, n + ".json")
                    if os.path.isfile(full):
                        return self.send_file(full)
            return self.send_json({"missing": True})
        if path == "/api/test/info":
            return self.send_json(test_info())
        if path == "/api/logs":
            lines = []
            if os.path.isfile(LOG_FILE_PATH):
                try:
                    with open(LOG_FILE_PATH, "r", encoding="utf-8", errors="replace") as f:
                        lines = [line.rstrip() for line in f][-300:]
                except Exception as e:
                    lines = [f"[ERRO AO LER LOG] {e}"]
            return self.send_json({
                "ok": True,
                "lines": lines,
                "file": LOG_FILE_PATH,
                "dir": LOGS_DIR,
                "serverTime": time.strftime("%Y-%m-%d %H:%M:%S")
            })
        if path == "/api/anim_video":
            qs = parse_qs(url.query)
            lib = qs.get("lib", [""])[0]
            name = qs.get("name", [""])[0]
            if not lib or not name:
                return self.send_json({"error": "Parâmetros lib e name obrigatórios"}, 400)
            file_path = AnimCacheManager.get_or_download(lib, name)
            if file_path and os.path.isfile(file_path):
                return self.send_file(file_path, cache="public, max-age=86400")
            return self.send_json({"error": "Vídeo não encontrado"}, 404)
        if path == "/api/anim_cache/status":
            cached_count = AnimCacheManager.count_cached()
            anims = AnimCacheManager.get_anim_list()
            total = len(anims) if anims else 1872
            return self.send_json({
                "ok": True,
                "cached": cached_count,
                "total": total,
                "isDownloading": AnimCacheManager.is_downloading,
                "progress": AnimCacheManager.downloaded,
                "current": AnimCacheManager.current,
                "error": AnimCacheManager.error
            })
        return self.get_static(path)

    def do_POST(self):
        self.close_connection = True
        path = unquote(urlparse(self.path).path)
        if path == "/api/anim_cache/download_all":
            started = AnimCacheManager.start_batch_download()
            return self.send_json({"ok": True, "started": started})
        if path == "/api/anim_cache/cancel":
            AnimCacheManager.cancel_batch_download()
            return self.send_json({"ok": True, "cancelled": True})
        if path == "/api/language":
            body = self.read_json() or {}
            code = str(body.get("language") or "").strip().lower()
            if not re.fullmatch(r"[a-z]{2,3}", code):
                return self.send_json({"ok": False}, 400)
            update_config(language=code)
            return self.send_json({"ok": True, "language": code})
        if path == "/api/config":
            body = self.read_json() or {}
            p = (body.get("gtaPath") or body.get("gta_path") or "").strip().strip('"')
            if not p or not is_gta_dir(p):
                prob = gta_problem(p) or "O caminho informado não é uma instalação válida do GTA San Andreas."
                return self.send_json({"ok": False, "error": prob}, 400)
            State.gta_path = p
            State.detected_gta = p
            update_config(gta_path=p, gta_confirmed=True)
            return self.send_json({"ok": True, "gtaPath": p})
        if path.startswith("/api/cache/"):
            name = safe_name(path[len("/api/cache/"):])
            if name == "texturas":
                name = "textures"
            body = self.read_body()
            os.makedirs(CACHE_DIR, exist_ok=True)
            full = os.path.join(CACHE_DIR, name + ".json")
            with open(full + ".tmp", "wb") as f:
                f.write(body)
            os.replace(full + ".tmp", full)
            return self.send_json({"ok": True})
        if path.startswith("/api/thumbs/"):
            return self.put_thumb(path[len("/api/thumbs/"):])
        if path == "/api/browse":
            body = self.read_json() or {}
            chosen = browse_folder(body.get("initial") or State.gta_path, "Escolha a pasta do GTA San Andreas")
            return self.send_json({"path": chosen, "ok": bool(chosen) and is_gta_dir(chosen),
                                   "problem": gta_problem(chosen) if chosen else ""})
        if path.startswith("/api/projects/"):
            return self.put_project(path[len("/api/projects/"):])
        if path == "/api/export":
            body = self.read_json()
            if not body or "content" not in body:
                return self.send_json({"ok": False, "error": "Conteúdo vazio"}, 400)
            os.makedirs(EXPORTS_DIR, exist_ok=True)
            name = safe_name(body.get("filename") or "mapa.pwn")
            full = os.path.join(EXPORTS_DIR, name)
            with open(full, "w", encoding="cp1252" if body.get("ansi") else "utf-8", errors="replace", newline="\r\n") as f:
                f.write(body["content"])
            return self.send_json({"ok": True, "path": full})
        if path == "/api/textures/index":
            body = self.read_json() or {}
            return self.send_json({"ok": True, "data": texture_index(body.get("entries") or [])})
        if path == "/api/import/sqlite":
            try:
                return self.send_json({"ok": True, "tables": read_sqlite(self.read_body())})
            except Exception as err:
                return self.send_json({"ok": False, "error": str(err)}, 400)
        if path == "/api/test/server":
            body = self.read_json() or {}
            folder = (body.get("path") or "").strip().strip('"')
            if body.get("browse"):
                folder = browse_folder(load_config().get("server_path") or os.path.expanduser("~"),
                                       "Escolha a pasta do servidor")
                if not folder:
                    return self.send_json(test_info())
            if not server_exe_in(folder):
                info = test_info()
                info["error"] = "Não achei o executável do servidor nessa pasta."
                return self.send_json(info)
            update_config(server_path=folder)
            return self.send_json(test_info())
        if path == "/api/test/start":
            return self.send_json(start_test(self.read_json() or {}))
        if path == "/api/test/stop":
            stop_test()
            return self.send_json(test_info())
        if path == "/api/center_mouse":
            data = self.read_json()
            if IS_WINDOWS:
                try:
                    import ctypes
                    win = getattr(State, "window", None)
                    if win is not None and getattr(win, "x", None) is not None and getattr(win, "width", None) is not None:
                        try:
                            cx = int(win.x + win.width / 2)
                            cy = int(win.y + win.height / 2)
                            ctypes.windll.user32.SetCursorPos(cx, cy)
                        except Exception:
                            if data and "x" in data and "y" in data:
                                ctypes.windll.user32.SetCursorPos(int(data["x"]), int(data["y"]))
                    elif data and "x" in data and "y" in data:
                        ctypes.windll.user32.SetCursorPos(int(data["x"]), int(data["y"]))
                except Exception:
                    pass
            return self.send_json({"ok": True})
        if path == "/api/log_error":
            body = self.read_json() or {}
            msg = body.get("message") or "Erro desconhecido"
            src = body.get("source") or ""
            stack = body.get("stack") or ""
            url = body.get("url") or ""
            level = body.get("level") or "ERRO JS"
            full_msg = f"{msg}"
            if src or url:
                full_msg += f" (em {src or url})"
            if stack:
                full_msg += f"\n  Stack trace: {stack}"
            append_to_log(full_msg, level)
            return self.send_json({"ok": True})
        if path == "/api/logs/clear":
            try:
                with open(LOG_FILE_PATH, "w", encoding="utf-8") as f:
                    f.write(f"{time.strftime('[%Y-%m-%d %H:%M:%S]')} [INFO] Registros reiniciados pelo usuário.\n")
                return self.send_json({"ok": True})
            except Exception as e:
                return self.send_json({"ok": False, "error": str(e)}, 500)
        if path == "/api/sp/asset":
            qs = parse_qs(urlparse(self.path).query)
            try:
                if qs.get("delete"):
                    sp_asset_delete(qs["delete"][0])
                    return self.send_json({"ok": True})
                sp_asset_save(qs.get("asset", [""])[0], qs.get("name", [""])[0], self.read_body())
                return self.send_json({"ok": True})
            except Exception as e:
                return self.send_json({"ok": False, "error": str(e)}, 400)
        if path.startswith("/api/sp/"):
            body = self.read_json()
            if body is None:
                return self.send_json({"ok": False, "error": "JSON inválido"}, 400)
            action = path[len("/api/sp/"):]
            if action == "list":
                return self.send_json({"ok": True, "mods": sp_list_installed()})
            name = str(body.get("name") or "").strip()
            if not name:
                return self.send_json({"ok": False, "error": "Projeto sem nome"}, 400)
            try:
                if action == "status":
                    return self.send_json(sp_status(name, str(body.get("was") or "")))
                if action == "build":
                    files = dict(body.get("files") or {})
                    files["README.txt"] = base64.b64encode(sp_readme(name, body.get("info")).encode("utf-8")).decode("ascii")
                    n = sp_write_files(sp_build_dir(name), files, {"name": name, "hash": (body.get("meta") or {}).get("hash")})
                    return self.send_json({**sp_status(name), "files": n})
                if action == "install":
                    missing = sp_missing()
                    if missing:
                        return self.send_json({**sp_status(name), "ok": False, "error": "Falta algo no jogo"}, 400)
                    sp_install(name, str(body.get("was") or ""))
                    return self.send_json(sp_status(name))
                if action == "uninstall":
                    sp_uninstall(name)
                    return self.send_json(sp_status(name))
                if action == "launch":
                    exe = sp_game_exe()
                    if not exe:
                        return self.send_json({"ok": False, "error": "Executável do jogo não encontrado"}, 400)
                    if sp_game_running(exe):
                        return self.send_json({"ok": False, "running": True, "error": "O jogo já está em execução. Feche-o antes de testar."}, 400)
                    subprocess.Popen([exe], cwd=os.path.dirname(exe))
                    return self.send_json({"ok": True})
                if action == "zip":
                    out = sp_zip(name)
                    if IS_WINDOWS:
                        os.startfile(os.path.dirname(out))
                    return self.send_json({"ok": True, "path": out})
                if action == "open":
                    target = sp_build_dir(name)
                    if IS_WINDOWS and os.path.isdir(target):
                        os.startfile(target)
                        return self.send_json({"ok": True})
                    return self.send_json({"ok": False, "error": "Gere o mod primeiro"}, 400)
            except Exception as e:
                return self.send_json({"ok": False, "error": str(e)}, 400)
            return self.send_error(HTTPStatus.NOT_FOUND)
        if path == "/api/open_url":
            # Only the download pages of the tools the mod needs (the window of the program has no browser bar)
            body = self.read_json() or {}
            url = str(body.get("url") or "")
            if url not in OPEN_URLS:
                return self.send_json({"ok": False, "error": "Endereço não permitido"}, 400)
            try:
                webbrowser.open(url)
                return self.send_json({"ok": True})
            except Exception as e:
                return self.send_json({"ok": False, "error": str(e)}, 500)
        if path == "/api/open_folder":
            body = self.read_json() or {}
            which = body.get("folder", "logs")
            folder_map = {
                "logs": LOGS_DIR,
                "projects": PROJECTS_DIR,
                "exports": EXPORTS_DIR,
                "data": DATA_DIR,
                "gta": State.gta_path
            }
            target = folder_map.get(which, LOGS_DIR)
            if IS_WINDOWS and target:
                try:
                    os.makedirs(target, exist_ok=True)
                    os.startfile(target)
                    return self.send_json({"ok": True, "path": target})
                except Exception as e:
                    return self.send_json({"ok": False, "error": str(e)}, 500)
            return self.send_json({"ok": False, "error": "Pasta não encontrada ou sistema não suportado"}, 400)
        self.send_error(HTTPStatus.NOT_FOUND)

    def do_DELETE(self):
        path = unquote(urlparse(self.path).path)
        if path.startswith("/api/projects/"):
            name = safe_name(path[len("/api/projects/"):])
            full = os.path.join(projects_dir(self.project_mode()), name + ".json")
            if os.path.isfile(full):
                os.remove(full)
            return self.send_json({"ok": True})
        self.send_error(HTTPStatus.NOT_FOUND)

    def get_static(self, path):
        if path in ("", "/"):
            path = "/index.html"
        rel = path.lstrip("/")
        full = os.path.normpath(os.path.join(APP_DIR, rel))
        if not os.path.isfile(full) and FROZEN:
            exe_folder = os.path.dirname(os.path.abspath(sys.executable))
            for alt_dir in (exe_folder, os.path.join(exe_folder, "_internal")):
                alt = os.path.normpath(os.path.join(alt_dir, rel))
                if os.path.isfile(alt):
                    full = alt
                    break
        if not os.path.isfile(full) and not FROZEN:
            cand = os.path.normpath(os.path.join(COMPILE_SOURCES_DIR, rel))
            if os.path.isfile(cand):
                full = cand
        if not os.path.isfile(full):
            return self.send_error(HTTPStatus.NOT_FOUND)
        low = os.path.basename(full).lower()
        if low in ("config.json", "serve.py") or full.startswith(DATA_DIR) or full.startswith(PROJECTS_DIR):
            return self.send_error(HTTPStatus.FORBIDDEN)
        self.send_file(full, cache="no-cache")

    def get_gta(self, rel):
        low_rel = rel.replace("\\", "/").lower()
        if low_rel in ("models/cj.dff", "models/cj.txd", "cj.dff", "cj.txd", "data/models/cj.dff", "data/models/cj.txd", "dados/models/cj.dff", "dados/models/cj.txd"):
            for mdir in (
                MODELS_DIR,
                os.path.join(APP_DIR, "models"),
                COMPILE_MODELS_DIR,
                os.path.join(ROOT_DIR, "models"),
                os.path.join(DATA_DIR, "models")
            ):
                candidate = os.path.join(mdir, os.path.basename(rel))
                if os.path.isfile(candidate):
                    return self.send_file(candidate, cache="max-age=86400")
        if low_rel.startswith("__sp/"):
            parts = [x for x in rel.replace("\\", "/").split("/") if x]
            try:
                full = os.path.join(sp_asset_dir(parts[1]), safe_name(parts[2]))
            except Exception:
                return self.send_error(HTTPStatus.NOT_FOUND)
            if not os.path.isfile(full):
                return self.send_error(HTTPStatus.NOT_FOUND)
            return self.send_file(full, cache="no-cache")
        if not State.gta_path:
            return self.send_error(HTTPStatus.SERVICE_UNAVAILABLE, "Pasta do GTA não configurada")
        full = resolve_ci(State.gta_path, rel)
        if not full or not os.path.isfile(full):
            for fdir in (
                MODELS_DIR,
                os.path.join(APP_DIR, "models"),
                COMPILE_MODELS_DIR,
                os.path.join(ROOT_DIR, "models"),
                os.path.join(DATA_DIR, "models")
            ):
                local_fallback = os.path.join(fdir, os.path.basename(rel))
                if os.path.isfile(local_fallback):
                    return self.send_file(local_fallback, cache="max-age=86400")
            return self.send_error(HTTPStatus.NOT_FOUND)
        if full.lower().endswith(".img") and not self.headers.get("Range"):
            # The .img files are hundreds of MB: only pieces (Range) are sent
            return self.send_error(HTTPStatus.BAD_REQUEST, "Use Range para ler arquivos .img")
        self.send_file(full, cache="max-age=3600")

    # ---------- thumbnails on disk ----------
    def get_thumb(self, rel):
        kind, _, key = rel.partition("/")
        if key.endswith(".webp"):
            key = key[:-5]
        full = thumb_file(kind, key)
        if full and os.path.isfile(full):
            return self.send_file(full, cache="max-age=86400")
        if kind == "obj":
            for sdir in (
                os.path.join(DATA_DIR, "cache", "skins"),
                os.path.join(COMPILE_CACHE_DIR, "skins"),
                os.path.join(APP_DIR, "data", "cache", "skins"),
                os.path.join(APP_DIR, "Dados", "cache", "skins"),
            ):
                for ext in (".png", ".webp"):
                    skin_f = os.path.join(sdir, f"{key}{ext}")
                    if os.path.isfile(skin_f):
                        return self.send_file(skin_f, cache="max-age=86400")
        if not full or not os.path.isfile(full):
            # A thumbnail that does not exist yet is normal (the editor draws it): a quiet 404, not an error in the log
            self.close_connection = True
            self.send_response(404)
            self.send_header("Content-Length", "0")
            self.end_headers()
            return
        self.send_file(full, cache="max-age=86400")

    def put_thumb(self, rel):
        kind, _, key = rel.partition("/")
        full = thumb_file(kind, key)
        body = self.read_body()
        if not full or not body or len(body) > 512 * 1024:
            return self.send_json({"ok": False}, 400)
        os.makedirs(os.path.dirname(full), exist_ok=True)
        tmp = full + ".tmp"
        with open(tmp, "wb") as f:
            f.write(body)
        os.replace(tmp, full)
        self.send_json({"ok": True})

    def thumbs_index(self):
        objs, texs = [], []
        d_candidates = [
            os.path.join(THUMBS_DIR, "objects"),
            os.path.join(COMPILE_CACHE_DIR, "thumbnails", "objects"),
            os.path.join(DATA_DIR, "cache", "thumbnails", "objects"),
            os.path.join(APP_DIR, "data", "cache", "thumbnails", "objects"),
            os.path.join(THUMBS_DIR, "objetos"),
            os.path.join(COMPILE_CACHE_DIR, "miniaturas", "objetos"),
            os.path.join(DATA_DIR, "cache", "miniaturas", "objetos"),
            os.path.join(APP_DIR, "data", "cache", "miniaturas", "objetos"),
            os.path.join(APP_DIR, "Dados", "cache", "miniaturas", "objetos")
        ]
        # Every folder counts (the first one that has the file wins); the old low resolution ones go to "stale"
        by_id = {}
        for d in d_candidates:
            if os.path.isdir(d):
                with os.scandir(d) as it:
                    for e in it:
                        n = e.name
                        if n.endswith(".webp") and n[:-5].isdigit() and int(n[:-5]) not in by_id:
                            st = e.stat()
                            by_id[int(n[:-5])] = (e.path, st.st_size, st.st_mtime_ns)
        stale = []
        for oid, width in thumb_widths(by_id).items():
            (objs if width >= THUMB_CURRENT_WIDTH else stale).append(oid)
        skin_candidates = [
            os.path.join(DATA_DIR, "cache", "skins"),
            os.path.join(COMPILE_CACHE_DIR, "skins"),
            os.path.join(APP_DIR, "data", "cache", "skins"),
            os.path.join(APP_DIR, "Dados", "cache", "skins"),
        ]
        skin_ids = set()
        for sd in skin_candidates:
            if os.path.isdir(sd):
                for f in os.listdir(sd):
                    base, ext = os.path.splitext(f)
                    if ext.lower() in (".png", ".webp") and base.isdigit():
                        skin_ids.add(int(base))
        for sid in skin_ids:
            if sid not in objs:
                objs.append(sid)
        stale = [i for i in stale if i not in skin_ids]
        if 0 not in objs:
            objs.append(0)
        d_candidates_tex = [
            os.path.join(THUMBS_DIR, "textures"),
            os.path.join(COMPILE_CACHE_DIR, "thumbnails", "textures"),
            os.path.join(DATA_DIR, "cache", "thumbnails", "textures"),
            os.path.join(APP_DIR, "data", "cache", "thumbnails", "textures"),
            os.path.join(THUMBS_DIR, "texturas"),
            os.path.join(COMPILE_CACHE_DIR, "miniaturas", "texturas"),
            os.path.join(DATA_DIR, "cache", "miniaturas", "texturas"),
            os.path.join(APP_DIR, "data", "cache", "miniaturas", "texturas"),
            os.path.join(APP_DIR, "Dados", "cache", "miniaturas", "texturas")
        ]
        for d in d_candidates_tex:
            if os.path.isdir(d):
                for txd in os.listdir(d):
                    sub = os.path.join(d, txd)
                    if os.path.isdir(sub):
                        t = unquote(txd)
                        texs += [t + "/" + unquote(n[:-5]) for n in os.listdir(sub) if n.endswith(".webp")]
                if texs:
                    break
        self.send_json({"obj": objs, "stale": stale, "tex": texs})

    # ---------- projetos ----------
    def project_mode(self):
        """"sp" or "mp": which projects folder the request is about (?mode=sp)."""
        return "sp" if parse_qs(urlparse(self.path).query).get("mode", [""])[0] == "sp" else "mp"

    def list_projects(self):
        items = []
        migrate_projects()
        pdir = projects_dir(self.project_mode())
        if os.path.isdir(pdir):
            for n in os.listdir(pdir):
                if n.lower().endswith(".json"):
                    full = os.path.join(pdir, n)
                    counts = {
                        "objects": 0, "vehicles": 0, "actors": 0, "pickups": 0,
                        "labels": 0, "gangZones": 0, "mapIcons": 0, "checkpoints": 0,
                        "textDraws": 0, "removed": 0
                    }
                    mode = "mp"
                    try:
                        with open(full, "r", encoding="utf-8", errors="replace") as pf:
                            pdata = json.load(pf)
                            if isinstance(pdata, dict):
                                mode = "sp" if pdata.get("mode") == "sp" else "mp"
                                counts["objects"] = len(pdata.get("objects") or [])
                                counts["vehicles"] = len(pdata.get("vehicles") or [])
                                counts["actors"] = len(pdata.get("actors") or [])
                                counts["pickups"] = len(pdata.get("pickups") or [])
                                counts["labels"] = len(pdata.get("labels") or [])
                                counts["gangZones"] = len(pdata.get("gangZones") or [])
                                counts["mapIcons"] = len(pdata.get("mapIcons") or [])
                                counts["checkpoints"] = len(pdata.get("checkpoints") or [])
                                counts["textDraws"] = len(pdata.get("textDraws") or [])
                                counts["removed"] = len(pdata.get("removed") or [])
                    except Exception:
                        pass
                    items.append({
                        "name": n[:-5],
                        "modified": os.path.getmtime(full),
                        "size": os.path.getsize(full),
                        "mode": mode,
                        "counts": counts
                    })
            items.sort(key=lambda i: -i["modified"])
        self.send_json({"projects": items, "folder": pdir})

    def get_project(self, name):
        migrate_projects()
        full = os.path.join(projects_dir(self.project_mode()), safe_name(name) + ".json")
        if not os.path.isfile(full):
            return self.send_json({"error": "Projeto não encontrado"}, 404)
        self.send_file(full)

    def put_project(self, name):
        body = self.read_body()
        try:
            json.loads(body.decode("utf-8"))
        except ValueError:
            return self.send_json({"ok": False, "error": "JSON inválido"}, 400)
        pdir = projects_dir(self.project_mode())
        os.makedirs(pdir, exist_ok=True)
        full = os.path.join(pdir, safe_name(name) + ".json")
        tmp = full + ".tmp"
        with State.lock:
            with open(tmp, "wb") as f:
                f.write(body)
            os.replace(tmp, full)
        self.send_json({"ok": True, "path": full})


class StudioServer(ThreadingHTTPServer):
    """Servidor que não cai por causa de um pedido: se faltar memória para abrir uma
    thread, atende aquele pedido direto (ou descarta) e continua funcionando."""
    daemon_threads = True
    block_on_close = False
    request_queue_size = 64

    def process_request(self, request, client_address):
        try:
            super().process_request(request, client_address)
        except (MemoryError, RuntimeError, OSError) as err:
            print("Aviso: pedido atendido sem thread (%s)" % err.__class__.__name__)
            try:
                self.finish_request(request, client_address)
            except Exception:
                pass
            self.shutdown_request(request)

    def handle_error(self, request, client_address):
        # Connections the browser cancels (when moving the camera) are normal: does not fill the log
        err = sys.exc_info()[1]
        if isinstance(err, (ConnectionAbortedError, ConnectionResetError, BrokenPipeError, TimeoutError)):
            return
        super().handle_error(request, client_address)


def serve_forever_safely(httpd):
    """Mantém o servidor de pé: se o laço principal cair por um erro, volta a atender."""
    while not State.stopping:
        try:
            httpd.serve_forever(poll_interval=0.5)
            break
        except Exception as err:
            print("Servidor se recuperou de um erro: %r" % err)
            time.sleep(0.5)


def make_server(port):
    """Abre o servidor na porta pedida; se estiver ocupada, usa outra livre."""
    for p in (port, 0):
        try:
            httpd = StudioServer(("127.0.0.1", p), Handler)
            return httpd
        except OSError:
            continue
    raise SystemExit("Não consegui abrir o servidor local.")


def get_initial_window_geometry():
    """Calcula tamanho e posição inicial centralizada dentro dos limites visíveis da tela (work area)."""
    min_w, min_h = 1050, 650
    work_left, work_top = 0, 0
    work_w, work_h = 1920, 1080

    if IS_WINDOWS:
        try:
            import ctypes
            # Ensures the resolution reading respects the monitor's real DPI
            try:
                ctypes.windll.shcore.SetProcessDpiAwareness(2)
            except Exception:
                try:
                    ctypes.windll.user32.SetProcessDPIAware()
                except Exception:
                    pass

            from ctypes import wintypes
            class RECT(ctypes.Structure):
                _fields_ = [
                    ("left", wintypes.LONG),
                    ("top", wintypes.LONG),
                    ("right", wintypes.LONG),
                    ("bottom", wintypes.LONG),
                ]
            rect = RECT()
            if ctypes.windll.user32.SystemParametersInfoW(0x0030, 0, ctypes.byref(rect), 0):
                work_left = int(rect.left)
                work_top = int(rect.top)
                work_w = max(400, int(rect.right - rect.left))
                work_h = max(300, int(rect.bottom - rect.top))
        except Exception:
            pass
    else:
        try:
            import webview
            if getattr(webview, "screens", None):
                s = webview.screens[0]
                work_w, work_h = s.width, s.height
        except Exception:
            pass

    # Dynamically adapts to the screen resolution (proportional to 88% of the width and 90% of the height of the work area)
    target_w = max(min_w, min(int(work_w * 0.90), 2200))
    target_h = max(min_h, min(int(work_h * 0.90), 1350))

    max_w = max(min_w, int(work_w * 0.96))
    max_h = max(min_h, int(work_h * 0.96))

    win_w = min(target_w, max_w)
    win_h = min(target_h, max_h)

    if win_w > work_w: win_w = max(800, int(work_w * 0.98))
    if win_h > work_h: win_h = max(600, int(work_h * 0.98))

    x = max(work_left, work_left + (work_w - win_w) // 2)
    y = max(work_top, work_top + (work_h - win_h) // 2)

    return win_w, win_h, x, y, (min(min_w, win_w), min(min_h, win_h))


def on_window_closing():
    """Fechar a janela: cancela o primeiro pedido, salva os projetos abertos e fecha em seguida."""
    if State.close_ready or State.window is None:
        return True
    if not State.closing_started:
        State.closing_started = True
        threading.Thread(target=save_projects_then_close, daemon=True).start()
    return False


def save_projects_then_close():
    win = State.window
    done = threading.Event()
    try:
        if win.evaluate_js("typeof window.__samapSaveAll === 'function'"):
            win.evaluate_js("window.__samapSaveAll()", lambda _result: done.set())
            if not done.wait(10):
                print("Salvamento antes de fechar demorou demais; fechando assim mesmo.")
    except Exception as err:
        print("Não foi possível salvar antes de fechar: %s" % err)
    State.close_ready = True
    try:
        win.destroy()
    except Exception:
        pass


APP_USER_MODEL_ID = "samapstudio.pro"


def fix_taskbar_icon():
    """Ícone da barra de tarefas. O editor usa um AppUserModelID próprio e, sem um atalho com esse
    ID, a barra pode mostrar um ícone genérico guardado em cache. Grava o ícone do editor em todos os
    lugares que a barra consulta: ícone da janela, ícone da classe e as propriedades de relançamento
    da janela (System.AppUserModel.RelaunchIconResource, com o ID, o comando e o nome)."""
    if not IS_WINDOWS:
        return
    try:
        import ctypes
        import uuid
        from ctypes import wintypes
        user32, shell32 = ctypes.windll.user32, ctypes.windll.shell32
        user32.SendMessageW.argtypes = [wintypes.HWND, wintypes.UINT, wintypes.WPARAM, wintypes.LPARAM]
        user32.SetClassLongPtrW.argtypes = [wintypes.HWND, ctypes.c_int, ctypes.c_ssize_t]
        user32.SetClassLongPtrW.restype = ctypes.c_size_t
        user32.LoadImageW.argtypes = [wintypes.HINSTANCE, wintypes.LPCWSTR, wintypes.UINT, ctypes.c_int, ctypes.c_int, wintypes.UINT]
        user32.LoadImageW.restype = wintypes.HANDLE
        shell32.ExtractIconExW.argtypes = [wintypes.LPCWSTR, ctypes.c_int, ctypes.POINTER(wintypes.HICON), ctypes.POINTER(wintypes.HICON), wintypes.UINT]
        shell32.SHGetPropertyStoreForWindow.argtypes = [wintypes.HWND, ctypes.c_void_p, ctypes.POINTER(ctypes.c_void_p)]

        # Where the icon comes from: the executable itself (compiled version) or icon.ico (development)
        frozen = getattr(sys, "frozen", False)
        engine = os.path.abspath(sys.executable)
        icon_file = engine if frozen else os.path.join(APP_DIR, "icon.ico")
        if not os.path.isfile(icon_file):
            return
        launcher = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(engine))), "SA Map Studio.exe")
        relaunch = launcher if frozen and os.path.isfile(launcher) else engine
        if frozen:
            big, small = wintypes.HICON(), wintypes.HICON()
            shell32.ExtractIconExW(icon_file, 0, ctypes.byref(big), ctypes.byref(small), 1)
            big, small = big.value, small.value
        else:
            big = user32.LoadImageW(None, icon_file, 1, 256, 256, 0x10)
            small = user32.LoadImageW(None, icon_file, 1, 16, 16, 0x10)
        icon_res = icon_file + ",0"

        pid = os.getpid()
        hwnds = []
        enum_proc = ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)

        def collect(hwnd, _):
            owner = wintypes.DWORD()
            user32.GetWindowThreadProcessId(hwnd, ctypes.byref(owner))
            if owner.value == pid and user32.IsWindowVisible(hwnd):
                title = ctypes.create_unicode_buffer(256)
                user32.GetWindowTextW(hwnd, title, 256)
                if title.value.startswith("SA Map Studio"):
                    hwnds.append(hwnd)
            return True

        user32.EnumWindows(enum_proc(collect), 0)

        class GUID(ctypes.Structure):
            _fields_ = [("data", ctypes.c_ubyte * 16)]

        class PROPERTYKEY(ctypes.Structure):
            _fields_ = [("fmtid", GUID), ("pid", wintypes.DWORD)]

        class PROPVARIANT(ctypes.Structure):
            _fields_ = [("vt", ctypes.c_ushort), ("r1", ctypes.c_ushort), ("r2", ctypes.c_ushort), ("r3", ctypes.c_ushort),
                        ("pwsz", ctypes.c_wchar_p), ("pad", ctypes.c_void_p)]

        def guid(text):
            g = GUID()
            ctypes.memmove(g.data, uuid.UUID(text).bytes_le, 16)
            return g

        iid_store = guid("886D8EEB-8CF2-4446-8D02-CDBA1DBDCF99")
        fmt = guid("9F4C2855-9F79-4B39-A8D0-E1D42DE1D5F3")  # System.AppUserModel.*
        values = [(5, APP_USER_MODEL_ID), (2, '"%s"' % relaunch), (4, "SA Map Studio"), (3, icon_res)]

        for hwnd in hwnds:
            if big:
                user32.SendMessageW(hwnd, 0x80, 1, big)        # WM_SETICON, ICON_BIG
                user32.SetClassLongPtrW(hwnd, -14, big)         # GCLP_HICON
            if small:
                user32.SendMessageW(hwnd, 0x80, 0, small)      # WM_SETICON, ICON_SMALL
                user32.SetClassLongPtrW(hwnd, -34, small)       # GCLP_HICONSM
            store = ctypes.c_void_p()
            if shell32.SHGetPropertyStoreForWindow(hwnd, ctypes.byref(iid_store), ctypes.byref(store)) != 0 or not store.value:
                continue
            vtbl = ctypes.cast(ctypes.cast(store, ctypes.POINTER(ctypes.c_void_p))[0], ctypes.POINTER(ctypes.c_void_p))
            set_value = ctypes.WINFUNCTYPE(ctypes.c_long, ctypes.c_void_p, ctypes.POINTER(PROPERTYKEY), ctypes.POINTER(PROPVARIANT))(vtbl[6])
            commit = ctypes.WINFUNCTYPE(ctypes.c_long, ctypes.c_void_p)(vtbl[7])
            release = ctypes.WINFUNCTYPE(ctypes.c_ulong, ctypes.c_void_p)(vtbl[2])
            try:
                for key_pid, text in values:
                    key = PROPERTYKEY(fmt, key_pid)
                    var = PROPVARIANT(31, 0, 0, 0, text, None)  # VT_LPWSTR
                    set_value(store, ctypes.byref(key), ctypes.byref(var))
                commit(store)
            finally:
                release(store)
    except Exception as err:
        print("Não foi possível ajustar o ícone da barra de tarefas: %s" % err)


def open_window(url, httpd):
    """Abre o editor numa janela própria (pywebview/WebView2) já maximizada. Retorna False se não der."""
    try:
        import webview  # pywebview
    except ImportError:
        return False
    try:
        try:
            webview.settings["ALLOW_DOWNLOADS"] = True
        except (AttributeError, TypeError):
            pass
        # Limits WebView2 memory use (V8 garbage collection and cache ceiling)
        if "WEBVIEW2_USER_DATA_FOLDER" not in os.environ and WEBVIEW_DIR:
            os.environ["WEBVIEW2_USER_DATA_FOLDER"] = WEBVIEW_DIR
        if "WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS" not in os.environ:
            os.environ["WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS"] = (
                "--js-flags=--max-old-space-size=512 "
                "--disable-features=Translate,MediaRouter,OptimizationHints "
                "--enable-features=PointerLockOptions "
                "--disk-cache-size=104857600"
            )
        win_w, win_h, win_x, win_y, min_size = get_initial_window_geometry()
        State.window = webview.create_window("SA Map Studio", url,
                                             width=win_w, height=win_h,
                                             x=win_x, y=win_y,
                                             min_size=min_size,
                                             maximized=True,
                                             background_color="#1c2228", text_select=True)
        State.window.events.closing += on_window_closing
        State.window.events.shown += fix_taskbar_icon
        try:
            webview.start(private_mode=False, storage_path=WEBVIEW_DIR)
        except TypeError:  # old pywebview versions
            webview.start()
    except Exception as err:  # no WebView2 or another problem: falls back to the browser
        print("Janela própria indisponível (%s). Abrindo no navegador." % err)
        return False
    State.stopping = True
    httpd.shutdown()
    return True


def _version_tuple(v):
    return tuple(int("".join(c for c in p if c.isdigit()) or 0) for p in str(v or "0").split("."))


_ui_tables = {}


def _lang_file(name):
    """js/lang/<name>.json da interface (as mensagens do servidor usam as mesmas traduções)."""
    if name not in _ui_tables:
        _ui_tables[name] = {}
        dirs = [APP_DIR, COMPILE_SOURCES_DIR]
        if FROZEN:
            exe_folder = os.path.dirname(os.path.abspath(sys.executable))
            dirs += [exe_folder, os.path.join(exe_folder, "_internal")]
        for d in dirs:
            try:
                with open(os.path.join(d, "js", "lang", name + ".json"), encoding="utf-8") as f:
                    _ui_tables[name] = json.load(f)
                break
            except Exception:
                continue
    return _ui_tables[name]


def _ui_table(code):
    return _lang_file(code)


def windows_langs():
    """Idioma principal do Windows (GetUserDefaultUILanguage & 0x3FF) para a sigla do editor, lido do
    campo "windows" de js/lang/languages.json (a lista única dos idiomas)."""
    out = {}
    for lang in _lang_file("languages") or []:
        try:
            out[int(str(lang.get("windows")), 16)] = lang["code"]
        except (TypeError, ValueError, KeyError):
            continue
    return out


def ui_text(text, *args):
    """Texto de janela do Windows no idioma do editor: o escolhido (config.json), senão o do Windows,
    senão inglês. Sem tradução, fica o inglês e depois o português."""
    code = str(load_config().get("language") or "")
    if not code and IS_WINDOWS:
        try:
            import ctypes
            code = windows_langs().get(ctypes.windll.kernel32.GetUserDefaultUILanguage() & 0x3FF, "")
        except Exception:
            code = ""
    code = code if re.fullmatch(r"[a-z]{2,3}", code or "") else "en"
    if code != "pt":
        text = _ui_table(code).get(text) or _ui_table("en").get(text) or text
        if isinstance(text, dict):  # plural forms: the window uses the general form
            text = text.get("other") or ""
    return text.format(*args)


def version_compatible():
    """A pasta guarda a versão mais nova que já a usou (config.json). Uma versão mais antiga não abre
    nela, para não estragar projetos e configurações gravados pela nova. Senão, grava esta versão."""
    stored = load_config().get("app_version") or ""
    if stored and _version_tuple(stored) > _version_tuple(VERSION):
        text = "\n\n".join((
            ui_text("Esta pasta já foi usada pela versão {0} do SA Map Studio, que é mais nova que esta ({1}).", stored, VERSION),
            ui_text("Uma versão antiga não abre numa pasta de versão mais nova, para não estragar os seus projetos e configurações."),
            ui_text("Use a versão {0} ou mais nova.", stored)))
        print(text)
        if IS_WINDOWS and "--no-browser" not in sys.argv:
            try:
                import ctypes
                ctypes.windll.user32.MessageBoxW(None, text, "SA Map Studio - " + ui_text("Versão incompatível"), 0x10 | 0x40000)
            except Exception:
                pass
        return False
    if stored != VERSION:
        update_config(app_version=VERSION)
    return True


EDITOR_MUTEX = "Local\\SAMapStudio.Editor"
_EDITOR_MUTEX_HANDLE = None


def single_instance():
    """Um editor por vez: o mutex fica com este processo até ele fechar (o launcher também o consulta
    antes de atualizar). Se já houver um aberto, a janela dele vem para a frente. False nesse caso."""
    global _EDITOR_MUTEX_HANDLE
    if not IS_WINDOWS:
        return True
    try:
        import ctypes
        k = ctypes.windll.kernel32
        k.CreateMutexW.restype = ctypes.c_void_p
        h = k.CreateMutexW(None, False, EDITOR_MUTEX)
        if h and k.GetLastError() == 183:  # ERROR_ALREADY_EXISTS
            k.CloseHandle(ctypes.c_void_p(h))
            u = ctypes.windll.user32
            hwnd = u.FindWindowW(None, "SA Map Studio")
            if hwnd:
                if u.IsIconic(hwnd):
                    u.ShowWindow(hwnd, 9)
                u.SetForegroundWindow(hwnd)
            else:
                u.MessageBoxW(None, ui_text("O SA Map Studio já está aberto."), "SA Map Studio", 0x40 | 0x40000)
            return False
        _EDITOR_MUTEX_HANDLE = h
    except Exception:
        pass
    return True


def main():
    if IS_WINDOWS:
        try:
            import ctypes
            ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID(APP_USER_MODEL_ID)
        except Exception:
            pass
    # Only the editor window counts as an instance (the --no-browser mode is the server alone, for tests)
    if "--no-browser" not in sys.argv and not single_instance():
        return
    setup_logging()
    migrate_old_layout()
    os.makedirs(DATA_DIR, exist_ok=True)
    if not version_compatible():
        return

    ap = argparse.ArgumentParser(description="SA Map Studio - servidor local")
    ap.add_argument("--gta", help="pasta do GTA San Andreas")
    ap.add_argument("--port", type=int, default=None)
    ap.add_argument("--no-browser", action="store_true", help="não abre navegador nem janela")
    ap.add_argument("--navegador", action="store_true", help="abre no navegador em vez da janela própria")
    args = ap.parse_args()

    cfg = load_config()
    inside_path = is_editor_inside_gta()
    if inside_path:
        State.gta_path = inside_path
        State.detected_gta = inside_path
        update_config(gta_path=inside_path, gta_confirmed=True)
    else:
        saved_gta = args.gta or cfg.get("gta_path") or ""
        gta_confirmed = cfg.get("gta_confirmed", False)
        if saved_gta and is_gta_dir(saved_gta) and gta_confirmed:
            State.gta_path = saved_gta
            State.detected_gta = saved_gta
        else:
            detected = detect_gta(saved_gta)
            State.detected_gta = detected or get_canonical_default_gta()
            State.gta_path = detected if is_gta_dir(detected) else ""

    port = args.port or cfg.get("port") or 8777
    httpd = make_server(port)
    url = "http://127.0.0.1:%d/" % httpd.server_address[1]
    print("=" * 60)
    print(" SA Map Studio %s" % VERSION)
    print(" Endereço: %s" % url)
    print(" Pasta do GTA: %s" % (State.gta_path or "(não encontrada - escolha no app)"))
    print(" Pasta do programa: %s" % BASE_DIR)
    print("=" * 60)

    t = threading.Thread(target=serve_forever_safely, args=(httpd,), daemon=True)
    t.start()
    try:
        if not args.no_browser and not args.navegador and open_window(url, httpd):
            return
        if not args.no_browser:
            threading.Timer(0.8, lambda: webbrowser.open(url)).start()
            if FROZEN:  # no console to press Ctrl+C: closes along with the tab
                threading.Thread(target=watch_browser, args=(httpd,), daemon=True).start()
        print(" Para fechar: Ctrl+C")
        while t.is_alive():
            t.join(0.5)
    except KeyboardInterrupt:
        print("\nServidor encerrado.")
        State.stopping = True
        httpd.shutdown()
    finally:
        stop_test()
        httpd.server_close()


if __name__ == "__main__":
    main()
