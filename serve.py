#!/usr/bin/env python3
"""SA Map Studio - servidor local.

Serve o editor e lê os arquivos da pasta do GTA San Andreas.
Usa só a biblioteca padrão do Python (3.8 ou mais novo); o pacote opcional pywebview
abre o editor numa janela própria (é o que o .exe usa).

Uso:
    python serve.py                      (detecta a pasta do GTA sozinho)
    python serve.py --gta "D:\\Jogos\\GTA San Andreas"
    python serve.py --port 8777 --no-browser
    python serve.py --navegador          (abre no navegador mesmo com o pywebview instalado)

Pastas (ao lado do .exe, ou desta pasta quando roda pelo Python):
    Projetos/     projetos salvos (.json)
    Exportados/   arquivos .pwn / .ipl gerados
    Dados/        configuração, cache de texturas e miniaturas, dados da janela e registros
    Servidor de Teste/  servidor open.mp/SA-MP usado pelo "Testar no jogo"
"""
import argparse
import base64
import json
import os
import re
import shutil
import socket
import struct
import sqlite3
import subprocess
import sys
import tempfile
import threading
import time
import webbrowser
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import quote, unquote, urlparse, parse_qs

VERSION = "3.0.0"
FROZEN = getattr(sys, "frozen", False)
# Arquivos do editor (html/js/css); no .exe ficam na pasta Sistema
APP_DIR = getattr(sys, "_MEIPASS", None) or os.path.dirname(os.path.abspath(__file__))
# Pasta principal do programa (onde fica o .exe)
BASE_DIR = os.path.dirname(os.path.abspath(sys.executable)) if FROZEN else os.path.dirname(os.path.abspath(__file__))
PROJECTS_DIR = os.path.join(BASE_DIR, "Projetos")
EXPORTS_DIR = os.path.join(BASE_DIR, "Exportados")
DATA_DIR = os.path.join(BASE_DIR, "Dados")
CONFIG_FILE = os.path.join(DATA_DIR, "config.json")
CACHE_DIR = os.path.join(DATA_DIR, "cache")
COMPILE_SOURCES_DIR = os.path.join(BASE_DIR, "compile-sources")
COMPILE_CACHE_DIR = os.path.join(COMPILE_SOURCES_DIR, "cache")
COMPILE_MODELS_DIR = os.path.join(COMPILE_SOURCES_DIR, "models")
if not FROZEN and not os.path.isdir(CACHE_DIR) and os.path.isdir(COMPILE_CACHE_DIR):
    CACHE_DIR = COMPILE_CACHE_DIR
THUMBS_DIR = os.path.join(CACHE_DIR, "miniaturas")
ANIM_CACHE_DIR = os.path.join(CACHE_DIR, "animacoes")
WEBVIEW_DIR = os.path.join(DATA_DIR, "navegador")
LOGS_DIR = os.path.join(DATA_DIR, "registros")
TEST_DIR = os.path.join(BASE_DIR, "Servidor de Teste")  # servidor de teste fica dentro da pasta do programa
IS_WINDOWS = os.name == "nt"


def migrate_old_layout():
    """Move os arquivos das versões anteriores para as pastas organizadas."""
    moves = [
        ("config.json", CONFIG_FILE),
        ("cache", CACHE_DIR),
        ("dados-da-janela", WEBVIEW_DIR),
        ("sa-map-studio.log", os.path.join(LOGS_DIR, "sa-map-studio.log")),
    ]
    for old, new in moves:
        src = os.path.join(BASE_DIR, old)
        if os.path.exists(src) and not os.path.exists(new):
            try:
                os.makedirs(os.path.dirname(new), exist_ok=True)
                shutil.move(src, new)
            except OSError:
                pass
    old_test = os.path.join(DATA_DIR, "teste")
    if os.path.isdir(old_test) and not os.path.exists(TEST_DIR):
        try:
            shutil.move(old_test, TEST_DIR)
        except OSError:
            pass
    # Pastas em minúsculas de versões antigas (no Windows o nome não diferencia maiúsculas)
    for old, new in (("projetos", PROJECTS_DIR), ("exportados", EXPORTS_DIR)):
        src = os.path.join(BASE_DIR, old)
        if os.path.isdir(src) and not os.path.exists(new):
            try:
                os.rename(src, new)
            except OSError:
                pass
        elif os.path.isdir(src) and os.path.isdir(new):
            try:
                if not os.path.samefile(src, new):
                    for n in os.listdir(src):
                        if not os.path.exists(os.path.join(new, n)):
                            shutil.move(os.path.join(src, n), os.path.join(new, n))
                    if not os.listdir(src):
                        os.rmdir(src)
            except OSError:
                pass


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



COMMON_GTA_PATHS = [
    r"C:\Program Files (x86)\Rockstar Games\GTA San Andreas",
    r"C:\Program Files\Rockstar Games\GTA San Andreas",
    r"C:\Program Files (x86)\Steam\steamapps\common\Grand Theft Auto San Andreas",
    r"C:\Program Files\Steam\steamapps\common\Grand Theft Auto San Andreas",
    r"C:\Games\GTA San Andreas",
    r"D:\GTA San Andreas",
    r"D:\Games\GTA San Andreas",
    r"D:\Jogos\GTA San Andreas",
    r"C:\GTA San Andreas",
]

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
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".ttf": "font/ttf",
    ".woff2": "font/woff2",
    ".txt": "text/plain; charset=utf-8",
    ".webm": "video/webm",
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


def is_gta_dir(path):
    if not path or not os.path.isdir(path):
        return False
    return os.path.isfile(resolve_ci(path, "data/gta.dat") or "")


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
        return "Essa pasta não existe."
    if not os.path.isfile(resolve_ci(path, "data/gta.dat") or ""):
        if os.path.isdir(resolve_ci(path, "Gameface") or "") or os.path.isdir(resolve_ci(path, "SanAndreas") or ""):
            return "Essa é a versão Definitive Edition. O editor precisa do GTA San Andreas original (o mesmo que roda o SA-MP)."
        return "Não encontrei data/gta.dat nessa pasta. Escolha a pasta onde fica o gta_sa.exe."
    if not os.path.isfile(resolve_ci(path, "models/gta3.img") or ""):
        return "Encontrei o gta.dat, mas falta o models/gta3.img. A instalação parece incompleta."
    return ""


def registry_candidates():
    """Caminhos que o Windows conhece: launcher do SA-MP e bibliotecas da Steam."""
    out = []
    try:
        import winreg
    except ImportError:
        return out
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\SAMP") as k:
            exe, _ = winreg.QueryValueEx(k, "gta_sa_exe")
            if exe:
                out.append(os.path.dirname(exe))
    except OSError:
        pass
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Valve\Steam") as k:
            steam, _ = winreg.QueryValueEx(k, "SteamPath")
        libs = [steam]
        vdf = os.path.join(steam, "steamapps", "libraryfolders.vdf")
        if os.path.isfile(vdf):
            with open(vdf, "r", encoding="utf-8", errors="ignore") as f:
                libs += re.findall(r'"path"\s+"([^"]+)"', f.read())
        for lib in libs:
            out.append(os.path.join(lib.replace("\\\\", "\\"), "steamapps", "common", "Grand Theft Auto San Andreas"))
    except OSError:
        pass
    return out


def detect_gta():
    for p in registry_candidates() + COMMON_GTA_PATHS:
        if is_gta_dir(p):
            return p
    return ""


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


def safe_name(name):
    name = re.sub(r"[^\w\-. ()]+", "_", name, flags=re.UNICODE).strip(" .")
    return name[:80] or "sem_nome"


def thumb_file(kind, key):
    """Caminho da miniatura em disco. kind = obj | tex; key = id do modelo ou "txd/textura"."""
    key = str(key).lower()
    if kind == "obj":
        if not key.isdigit():
            return None
        p = os.path.join(THUMBS_DIR, "objetos", key + ".webp")
        if not os.path.isfile(p):
            for alt in (
                os.path.join(COMPILE_CACHE_DIR, "miniaturas", "objetos", key + ".webp"),
                os.path.join(APP_DIR, "Dados", "cache", "miniaturas", "objetos", key + ".webp")
            ):
                if os.path.isfile(alt):
                    return alt
        return p
    if kind == "tex":
        parts = key.split("/", 1)
        if len(parts) != 2 or not parts[0] or not parts[1]:
            return None
        p = os.path.join(THUMBS_DIR, "texturas", quote(parts[0], safe=""), quote(parts[1], safe="") + ".webp")
        if not os.path.isfile(p):
            for alt in (
                os.path.join(COMPILE_CACHE_DIR, "miniaturas", "texturas", quote(parts[0], safe=""), quote(parts[1], safe="") + ".webp"),
                os.path.join(APP_DIR, "Dados", "cache", "miniaturas", "texturas", quote(parts[0], safe=""), quote(parts[1], safe="") + ".webp")
            ):
                if os.path.isfile(alt):
                    return alt
        return p
    return None


class State:
    gta_path = ""
    window = None
    lock = threading.Lock()
    last_ping = 0.0   # último sinal de vida da página aberta no navegador
    stopping = False  # True quando o programa está fechando de propósito
    test_proc = None  # servidor de teste em execução


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
    # Rodando pelo código-fonte: usa a data do arquivo mais recente do editor
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
# Índice de texturas: lê só os cabeçalhos dos TXDs (rápido, sem decodificar imagens)
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
                continue  # entrada vazia dentro de um .img: não lê o arquivo inteiro
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
# Importação de bancos SQLite (mapas salvos pelo Texture Studio e parecidos)
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
# Teste do mapa no jogo: servidor SA-MP/open.mp isolado + gamemode do editor
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
        os.path.join(APP_DIR, "compile-sources", "samapstudio.amx"),
        os.path.join(BASE_DIR, "compile-sources", "samapstudio.amx"),
        os.path.join(APP_DIR, "samapstudio.amx"),
        os.path.join(BASE_DIR, "samapstudio.amx"),
        os.path.join(TEST_DIR, "gamemodes", "samapstudio.amx"),
        os.path.join(BASE_DIR, "omp-server-source", "gamemodes", "samapstudio.amx"),
        os.path.join(BASE_DIR, "compiled", "SA Map Studio", "Servidor de Teste", "gamemodes", "samapstudio.amx"),
    ):
        if os.path.isfile(cand):
            return cand
    return ""


def test_info():
    cfg = load_config()
    server = cfg.get("server_path") or ""
    # Servidor que já está dentro da pasta do programa ("Servidor de Teste") tem prioridade
    candidates = [
        TEST_DIR,
        os.path.join(BASE_DIR, "compiled", "SA Map Studio", "Servidor de Teste"),
        os.path.join(BASE_DIR, "compiled", "Servidor de Teste"),
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
        time.sleep(1.0)  # o servidor de teste anterior pode estar terminando de fechar
    if not port_free(TEST_PORT):
        return {"ok": False, "error": "A porta %d está em uso, provavelmente por outro servidor aberto "
                                      "no seu computador. Feche esse servidor e tente de novo." % TEST_PORT}
    src = os.path.dirname(exe)
    is_omp = os.path.basename(exe).lower().startswith("omp")
    os.makedirs(TEST_DIR, exist_ok=True)
    same = os.path.normcase(os.path.abspath(src)) == os.path.normcase(os.path.abspath(TEST_DIR))
    if not same:
        # Copia o servidor para "Servidor de Teste" (o servidor e o gamemode do usuário não são tocados)
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
    dist_root_st = os.path.join(os.path.dirname(BASE_DIR), "Servidor de Teste") if os.path.basename(BASE_DIR) == "SA Map Studio" else os.path.join(BASE_DIR, "compiled", "SA Map Studio", "Servidor de Teste")
    if os.path.isdir(dist_root_st):
        target_dirs.add(dist_root_st)

    use_streamer = bool(body.get("streamer", False))
    streamer_src = None
    for cand in (
        os.path.join(BASE_DIR, "omp-server-source", "plugins", "streamer.dll"),
        os.path.join(TEST_DIR, "plugins", "streamer.dll"),
        os.path.join(APP_DIR, "plugins", "streamer.dll"),
        os.path.join(src, "plugins", "streamer.dll"),
        os.path.join(BASE_DIR, "compiled", "SA Map Studio", "Servidor de Teste", "plugins", "streamer.dll"),
    ):
        if os.path.isfile(cand):
            streamer_src = cand
            break

    rcon = base64.b32encode(os.urandom(10)).decode().lower()
    for td in target_dirs:
        try:
            os.makedirs(os.path.join(td, "gamemodes"), exist_ok=True)
            os.makedirs(os.path.join(td, "plugins"), exist_ok=True)
            os.makedirs(os.path.join(td, "scriptfiles", "samapstudio"), exist_ok=True)
            shutil.copy2(amx, os.path.join(td, "gamemodes", "samapstudio.amx"))
            if streamer_src:
                copy_if_newer(streamer_src, os.path.join(td, "plugins", "streamer.dll"))
            with open(os.path.join(td, "scriptfiles", "samapstudio", "mapa.txt"), "w", encoding="utf-8", errors="replace", newline="\r\n") as f:
                f.write(body.get("map", ""))
            load_streamer = bool(streamer_src or use_streamer)
            plugins_line = "plugins streamer.dll\n" if load_streamer else "plugins\n"
            with open(os.path.join(td, "server.cfg"), "w", encoding="utf-8", newline="\r\n") as f:
                f.write("echo Executing Server Config...\nlanmode 1\nrcon_password %s\nmaxplayers 8\nport %d\n"
                        "hostname SA Map Studio - teste\ngamemode0 samapstudio 1\nfilterscripts\nannounce 0\n"
                        "%s"
                        "query 1\nchatlogging 0\nweburl localhost\nonfoot_rate 40\nincar_rate 40\nweapon_rate 40\n"
                        "stream_distance 300.0\nstream_rate 1000\nmaxnpc 0\nlogtimeformat [%%H:%%M:%%S]\nlanguage Portugues\n" % (rcon, TEST_PORT, plugins_line))
            cfg = {
                "name": "SA Map Studio - teste", "max_players": 8, "announce": False, "enable_query": True,
                "network": {"port": TEST_PORT, "bind": "127.0.0.1"},
                "pawn": {"main_scripts": ["samapstudio 1"], "side_scripts": [], "legacy_plugins": ["streamer"] if load_streamer else []},
                "rcon": {"enable": False, "password": rcon},
                "game": {"use_entry_exit_markers": False, "use_player_ped_anims": True, "use_all_animations": True},
            }
            with open(os.path.join(td, "config.json"), "w", encoding="utf-8") as f:
                json.dump(cfg, f, indent=2)
        except Exception:
            pass
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
    # Espera o servidor subir (o registro avisa) antes de abrir o jogo
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
        try:
            subprocess.Popen([client, "127.0.0.1:%d" % TEST_PORT], cwd=os.path.dirname(client))
            launched = True
        except OSError:
            launched = False
    return {"ok": True, "started": started, "launched": launched, "address": "127.0.0.1:%d" % TEST_PORT, "log": tail_log()}


# ---------------------------------------------------------------------------
# Gerenciamento de Vídeos e Cache de Animações
# ---------------------------------------------------------------------------
class AnimCacheManager:
    is_downloading = False
    stop_requested = False
    downloaded = 0
    total = 1812
    current = ""
    error = ""

    @classmethod
    def get_anim_list(cls):
        candidates = [
            os.path.join(COMPILE_SOURCES_DIR, "anim-list.json"),
            os.path.join(APP_DIR, "compile-sources", "anim-list.json"),
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
        if not os.path.isdir(ANIM_CACHE_DIR):
            return 0
        cnt = 0
        for root, _, files in os.walk(ANIM_CACHE_DIR):
            for file in files:
                if file.lower().endswith(".webm"):
                    cnt += 1
        return cnt

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
# Servidor HTTP
# ---------------------------------------------------------------------------
class Handler(SimpleHTTPRequestHandler):
    server_version = "SAMapStudio/" + VERSION
    protocol_version = "HTTP/1.1"

    def log_message(self, fmt, *args):
        pass  # silencioso: só erros do servidor aparecem

    def log_request(self, code="-", size="-"):
        try:
            if int(code) >= 500:
                sys.stderr.write("[%s] %s -> %s\n" % (time.strftime("%H:%M:%S"), self.path, code))
        except (TypeError, ValueError):
            pass

    # ---------- utilidades ----------
    def send_json(self, obj, status=200):
        data = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def read_body(self):
        n = int(self.headers.get("Content-Length") or 0)
        return self.rfile.read(n) if n > 0 else b""

    def read_json(self):
        try:
            return json.loads(self.read_body().decode("utf-8") or "{}")
        except ValueError:
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
        if path.startswith("/gta/"):
            return self.get_gta(path[5:])
        if path.startswith("/thumbs/"):
            return self.get_thumb(path[len("/thumbs/"):])
        if path.startswith("/cache/"):
            sub = path[len("/cache/"):].lstrip("/")
            rel_sub = sub.replace("/", os.sep)
            for cdir in (CACHE_DIR, os.path.join(APP_DIR, "Dados", "cache"), os.path.join(os.path.dirname(BASE_DIR), "Dados", "cache")):
                full = os.path.join(cdir, rel_sub)
                if os.path.isfile(full):
                    return self.send_file(full, cache="public, max-age=86400")
                low_rel = rel_sub.lower()
                if low_rel.startswith("sprites" + os.sep + "loadscs" + os.sep):
                    alt = os.path.join(cdir, "sprites", "ld_loadscs", os.path.basename(rel_sub))
                    if os.path.isfile(alt):
                        return self.send_file(alt, cache="public, max-age=86400")
                elif low_rel.startswith("sprites" + os.sep + "ld_loadscs" + os.sep):
                    alt = os.path.join(cdir, "sprites", "loadscs", os.path.basename(rel_sub))
                    if os.path.isfile(alt):
                        return self.send_file(alt, cache="public, max-age=86400")
            return self.send_error(404, "Arquivo de cache nao encontrado")
        if path == "/api/ping":
            State.last_ping = time.time()
            return self.send_json({"ok": True})
        if path == "/api/config":
            return self.send_json({"gtaPath": State.gta_path, "ok": is_gta_dir(State.gta_path), "version": VERSION,
                                   "build": build_info(),
                                   "problem": gta_problem(State.gta_path) if State.gta_path else "",
                                   "folders": {"projects": PROJECTS_DIR, "exports": EXPORTS_DIR, "data": DATA_DIR}})
        if path == "/api/projects":
            return self.list_projects()
        if path.startswith("/api/projects/"):
            return self.get_project(path[len("/api/projects/"):])
        if path == "/api/thumbs/index":
            return self.thumbs_index()
        if path == "/api/radarmap":
            png_path = os.path.join(CACHE_DIR, "radarmap.png")
            if not os.path.isfile(png_path):
                ensure_radarmap(State.gta_path, png_path)
            if os.path.isfile(png_path):
                return self.send_file(png_path, cache="public, max-age=86400")
            return self.send_json({"error": "Mapa do radar nao disponivel"}, 404)
        if path.startswith("/api/cache/"):
            full = os.path.join(CACHE_DIR, safe_name(path[len("/api/cache/"):]) + ".json")
            if not os.path.isfile(full):
                return self.send_json({"missing": True})
            return self.send_file(full)
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
                return self.send_json({"error": "Parametros lib e name obrigatorios"}, 400)
            file_path = AnimCacheManager.get_or_download(lib, name)
            if file_path and os.path.isfile(file_path):
                return self.send_file(file_path, cache="public, max-age=86400")
            return self.send_json({"error": "Video nao encontrado"}, 404)
        if path == "/api/anim_cache/status":
            cached_count = AnimCacheManager.count_cached()
            anims = AnimCacheManager.get_anim_list()
            total = len(anims) if anims else 1812
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
        path = unquote(urlparse(self.path).path)
        if path == "/api/anim_cache/download_all":
            started = AnimCacheManager.start_batch_download()
            return self.send_json({"ok": True, "started": started})
        if path == "/api/anim_cache/cancel":
            AnimCacheManager.cancel_batch_download()
            return self.send_json({"ok": True, "cancelled": True})
        if path == "/api/config":
            body = self.read_json() or {}
            p = (body.get("gtaPath") or "").strip().strip('"')
            if not is_gta_dir(p):
                return self.send_json({"ok": False, "error": gta_problem(p)}, 400)
            State.gta_path = p
            update_config(gta_path=p)
            return self.send_json({"ok": True, "gtaPath": p})
        if path.startswith("/api/cache/"):
            body = self.read_body()
            os.makedirs(CACHE_DIR, exist_ok=True)
            full = os.path.join(CACHE_DIR, safe_name(path[len("/api/cache/"):]) + ".json")
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
            full = os.path.join(PROJECTS_DIR, name + ".json")
            if os.path.isfile(full):
                os.remove(full)
            return self.send_json({"ok": True})
        self.send_error(HTTPStatus.NOT_FOUND)

    def get_static(self, path):
        if path in ("", "/"):
            path = "/index.html"
        rel = path.lstrip("/")
        full = os.path.normpath(os.path.join(APP_DIR, rel))
        if not full.startswith(os.path.normpath(APP_DIR)) or not os.path.isfile(full):
            return self.send_error(HTTPStatus.NOT_FOUND)
        low = os.path.basename(full).lower()
        if low in ("config.json", "serve.py") or full.startswith(DATA_DIR) or full.startswith(PROJECTS_DIR):
            return self.send_error(HTTPStatus.FORBIDDEN)
        self.send_file(full, cache="no-cache")

    def get_gta(self, rel):
        low_rel = rel.replace("\\", "/").lower()
        if low_rel in ("models/cj.dff", "models/cj.txd", "cj.dff", "cj.txd", "dados/models/cj.dff", "dados/models/cj.txd"):
            for mdir in (
                os.path.join(BASE_DIR, "compile-sources", "models"),
                os.path.join(APP_DIR, "compile-sources", "models"),
                os.path.join(BASE_DIR, "models"),
                os.path.join(APP_DIR, "models"),
                os.path.join(DATA_DIR, "models"),
                os.path.join(APP_DIR, "Dados", "models"),
                os.path.join(BASE_DIR, "Dados", "models")
            ):
                candidate = os.path.join(mdir, os.path.basename(rel))
                if os.path.isfile(candidate):
                    return self.send_file(candidate, cache="max-age=86400")
        if not State.gta_path:
            return self.send_error(HTTPStatus.SERVICE_UNAVAILABLE, "Pasta do GTA não configurada")
        full = resolve_ci(State.gta_path, rel)
        if not full or not os.path.isfile(full):
            for fdir in (
                os.path.join(BASE_DIR, "compile-sources", "models"),
                os.path.join(APP_DIR, "compile-sources", "models"),
                os.path.join(BASE_DIR, "models"),
                os.path.join(APP_DIR, "models"),
                os.path.join(DATA_DIR, "models")
            ):
                local_fallback = os.path.join(fdir, os.path.basename(rel))
                if os.path.isfile(local_fallback):
                    return self.send_file(local_fallback, cache="max-age=86400")
            return self.send_error(HTTPStatus.NOT_FOUND)
        if full.lower().endswith(".img") and not self.headers.get("Range"):
            # Os .img têm centenas de MB: só pedaços (Range) são enviados
            return self.send_error(HTTPStatus.BAD_REQUEST, "Use Range para ler arquivos .img")
        self.send_file(full, cache="max-age=3600")

    # ---------- miniaturas em disco ----------
    def get_thumb(self, rel):
        kind, _, key = rel.partition("/")
        if key.endswith(".webp"):
            key = key[:-5]
        if kind == "obj" and key == "0":
            for sdir in (
                os.path.join(DATA_DIR, "cache", "skins"),
                os.path.join(COMPILE_CACHE_DIR, "skins"),
                os.path.join(APP_DIR, "Dados", "cache", "skins"),
                os.path.join(APP_DIR, "compile-sources", "cache", "skins")
            ):
                cj_skin = os.path.join(sdir, "0.png")
                if os.path.isfile(cj_skin):
                    return self.send_file(cj_skin, cache="max-age=86400")
        full = thumb_file(kind, key)
        if not full or not os.path.isfile(full):
            return self.send_error(HTTPStatus.NOT_FOUND)
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
            os.path.join(THUMBS_DIR, "objetos"),
            os.path.join(COMPILE_CACHE_DIR, "miniaturas", "objetos"),
            os.path.join(APP_DIR, "Dados", "cache", "miniaturas", "objetos")
        ]
        for d in d_candidates:
            if os.path.isdir(d):
                objs = [int(n[:-5]) for n in os.listdir(d) if n.endswith(".webp") and n[:-5].isdigit()]
                if objs:
                    break
        if 0 not in objs:
            objs.append(0)
        d_candidates_tex = [
            os.path.join(THUMBS_DIR, "texturas"),
            os.path.join(COMPILE_CACHE_DIR, "miniaturas", "texturas"),
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
        self.send_json({"obj": objs, "tex": texs})

    # ---------- projetos ----------
    def list_projects(self):
        items = []
        if os.path.isdir(PROJECTS_DIR):
            for n in os.listdir(PROJECTS_DIR):
                if n.lower().endswith(".json"):
                    full = os.path.join(PROJECTS_DIR, n)
                    items.append({"name": n[:-5], "modified": os.path.getmtime(full), "size": os.path.getsize(full)})
            items.sort(key=lambda i: -i["modified"])
        self.send_json({"projects": items, "folder": PROJECTS_DIR})

    def get_project(self, name):
        full = os.path.join(PROJECTS_DIR, safe_name(name) + ".json")
        if not os.path.isfile(full):
            return self.send_json({"error": "Projeto não encontrado"}, 404)
        self.send_file(full)

    def put_project(self, name):
        body = self.read_body()
        try:
            json.loads(body.decode("utf-8"))
        except ValueError:
            return self.send_json({"ok": False, "error": "JSON inválido"}, 400)
        os.makedirs(PROJECTS_DIR, exist_ok=True)
        full = os.path.join(PROJECTS_DIR, safe_name(name) + ".json")
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
        # Conexões que o navegador cancela (ao mover a câmera) são normais: não enche o registro
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
            # Garante que a leitura de resolução respeite o DPI real do monitor
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

    # Adapta dinamicamente à resolução da tela (proporcional a 88% da largura e 90% da altura da área útil)
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
        # Limita o uso de memoria do WebView2 (coleta de lixo do V8 e teto de cache)
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
        try:
            webview.start(private_mode=False, storage_path=WEBVIEW_DIR)
        except TypeError:  # versões antigas do pywebview
            webview.start()
    except Exception as err:  # sem WebView2 ou outro problema: volta para o navegador
        print("Janela própria indisponível (%s). Abrindo no navegador." % err)
        return False
    State.stopping = True
    httpd.shutdown()
    return True


def main():
    setup_logging()
    migrate_old_layout()
    os.makedirs(DATA_DIR, exist_ok=True)

    ap = argparse.ArgumentParser(description="SA Map Studio - servidor local")
    ap.add_argument("--gta", help="pasta do GTA San Andreas")
    ap.add_argument("--port", type=int, default=None)
    ap.add_argument("--no-browser", action="store_true", help="não abre navegador nem janela")
    ap.add_argument("--navegador", action="store_true", help="abre no navegador em vez da janela própria")
    args = ap.parse_args()

    cfg = load_config()
    gta = args.gta or cfg.get("gta_path") or ""
    if not is_gta_dir(gta):
        gta = detect_gta()
    State.gta_path = gta if is_gta_dir(gta) else ""
    if State.gta_path and State.gta_path != cfg.get("gta_path"):
        update_config(gta_path=State.gta_path)

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
            if FROZEN:  # sem console para apertar Ctrl+C: fecha junto com a aba
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
