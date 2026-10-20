#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""SA Map Studio - Launcher (executável único de distribuição).

Primeira execução: descompacta o pacote interno na pasta 'sa-map-studio' ao lado do .exe.
Execuções seguintes: compara o manifesto do pacote (system/bundle.json) com o da pasta instalada.
Se for outro build, a pasta é atualizada para ficar exatamente igual ao pacote novo, sem perder os
dados do usuário, e o editor abre. Só um editor fica aberto por vez.

Como a atualização funciona:
- system e test-server são só do programa: são trocados inteiros, então o que não existe mais na
  versão nova some e o que é novo aparece;
- no resto da pasta (data, projects, exported) só os arquivos do pacote são mexidos: os do pacote novo
  são gravados e os que vieram no pacote anterior e não vêm neste são apagados. O que o usuário criou
  (projetos, exportados, config.json, logs, perfil da janela, miniaturas geradas) fica como está;
- o pacote novo é descompactado primeiro numa pasta à parte e conferido. A troca é feita com um
  diário (.sa-map-studio-update.json) e uma cópia de segurança do que sai: se der erro, faltar
  energia ou o Windows travar no meio, a próxima abertura desfaz o que ficou pela metade e a pasta
  volta a ser exatamente a anterior;
- antes de mexer em qualquer coisa, o editor e o servidor de testes precisam estar fechados.
"""

import os
import sys
import json
import time
import shutil
import zipfile
import threading
import subprocess

IS_WINDOWS = os.name == "nt"

ROOT_NAME = "sa-map-studio"
MANIFEST_REL = "system/bundle.json"
PROGRAM_DIRS = ("system", "test-server")      # trocadas inteiras na atualização
USER_DIRS = ("projects", "exported", "data")  # nunca apagadas
STAGING_NAME = ".sa-map-studio-update"
BACKUP_NAME = ".sa-map-studio-backup"
JOURNAL_NAME = ".sa-map-studio-update.json"
EDITOR_MUTEX = "Local\\SAMapStudio.Editor"      # criado pelo editor (serve.py)
LAUNCHER_MUTEX = "Local\\SAMapStudio.Launcher"  # um launcher por vez
WINDOW_TITLE = "SA Map Studio"
ENGINE_EXE = "sa-map-studio.exe"


def dir_writable(path):
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


def relaunch_as_admin():
    """Abre o próprio executável de novo pedindo administrador (UAC). True se o Windows aceitou."""
    if not IS_WINDOWS:
        return False
    try:
        import ctypes
        if ctypes.windll.shell32.IsUserAnAdmin():
            return False
        params = subprocess.list2cmdline(sys.argv[1:])
        r = ctypes.windll.shell32.ShellExecuteW(None, "runas", sys.executable, params, os.path.dirname(sys.executable), 1)
        return int(r) > 32
    except Exception:
        return False


def get_base_paths():
    if getattr(sys, "frozen", False):
        exe_dir = os.path.dirname(os.path.abspath(sys.argv[0]))
        res_dir = getattr(sys, "_MEIPASS", exe_dir)
    else:
        exe_dir = os.path.dirname(os.path.abspath(__file__))
        res_dir = exe_dir

    target_dir = os.path.join(exe_dir, ROOT_NAME)
    target_exe = os.path.join(target_dir, "system", ENGINE_EXE)
    return exe_dir, res_dir, target_dir, target_exe


# Textos do launcher nos idiomas do editor (en, es, pt, it, fr). Ele roda antes de a pasta existir, então
# os textos ficam aqui e não nos js/lang/*.json. Idioma novo: acrescente a sigla em LANGS e um texto em cada linha.
LANGS = ("en", "es", "pt", "it", "fr")
TEXTS = {
    "open": ("SA Map Studio is already open.",
             "SA Map Studio ya está abierto.",
             "O SA Map Studio já está aberto.",
             "SA Map Studio è già aperto.",
             "SA Map Studio est déjà ouvert."),
    "cant_delete": ("Could not delete {0}",
                    "No se pudo eliminar {0}",
                    "Não foi possível apagar {0}",
                    "Impossibile eliminare {0}",
                    "Impossible de supprimer {0}"),
    "incomplete": ("The package is incomplete ({0}).",
                   "El paquete está incompleto ({0}).",
                   "O pacote está incompleto ({0}).",
                   "Il pacchetto è incompleto ({0}).",
                   "Le paquet est incomplet ({0})."),
    "extracting": ("Extracting: {0}", "Extrayendo: {0}", "Extraindo: {0}", "Estrazione: {0}", "Extraction : {0}"),
    "installing": ("Installing files", "Instalando archivos", "Instalando arquivos", "Installazione dei file",
                   "Installation des fichiers"),
    "done": ("Done! Opening the editor", "¡Listo! Abriendo el editor", "Concluído! Abrindo o editor",
             "Fatto! Apertura dell'editor", "Terminé ! Ouverture de l'éditeur"),
    "t_install": ("Installation", "Instalación", "Instalação", "Installazione", "Installation"),
    "t_update": ("Update", "Actualización", "Atualização", "Aggiornamento", "Mise à jour"),
    "t_incompatible": ("Incompatible version", "Versión incompatible", "Versão incompatível",
                       "Versione incompatibile", "Version incompatible"),
    "t_error": ("Error", "Error", "Erro", "Errore", "Erreur"),
    "t_install_error": ("Installation error", "Error de instalación", "Erro na instalação",
                        "Errore di installazione", "Erreur d'installation"),
    "close_editor": (
        "To update SA Map Studio to version {0}, close the open editor and the test server, if it is "
        "running. Save your project before closing.\n\nOpen now: {1}\n\nAfter closing, click Retry.",
        "Para actualizar SA Map Studio a la versión {0}, cierra el editor abierto y el servidor de "
        "pruebas, si está en ejecución. Guarda tu proyecto antes de cerrar.\n\nAbiertos ahora: {1}\n\n"
        "Después de cerrar, haz clic en Reintentar.",
        "Para atualizar o SA Map Studio para a versão {0}, feche o editor que está aberto e o servidor "
        "de testes, se estiver rodando. Salve o seu projeto antes de fechar.\n\nAbertos agora: {1}\n\n"
        "Depois de fechar, clique em Tentar novamente.",
        "Per aggiornare SA Map Studio alla versione {0}, chiudi l'editor aperto e il server di prova, "
        "se è in esecuzione. Salva il progetto prima di chiudere.\n\nAperti ora: {1}\n\n"
        "Dopo averli chiusi, fai clic su Riprova.",
        "Pour mettre à jour SA Map Studio vers la version {0}, fermez l'éditeur ouvert et le serveur de "
        "test s'il est lancé. Enregistrez votre projet avant de fermer.\n\nOuverts : {1}\n\n"
        "Après la fermeture, cliquez sur Réessayer."),
    "no_bundle": ("The SA Map Studio resource package was not found in the executable.",
                  "No se encontró el paquete de recursos de SA Map Studio en el ejecutable.",
                  "O pacote de recursos do SA Map Studio não foi encontrado no executável.",
                  "Il pacchetto di risorse di SA Map Studio non è stato trovato nell'eseguibile.",
                  "Le paquet de ressources de SA Map Studio est introuvable dans l'exécutable."),
    "recover_fail": (
        "Could not finish the previous update:\n{0}\n\nClose the editor and the test server and open it again.",
        "No se pudo terminar la actualización anterior:\n{0}\n\nCierra el editor y el servidor de pruebas y "
        "vuelve a abrirlo.",
        "Não foi possível terminar a atualização anterior:\n{0}\n\nFeche o editor e o servidor de testes e "
        "abra de novo.",
        "Impossibile completare l'aggiornamento precedente:\n{0}\n\nChiudi l'editor e il server di prova e "
        "riaprilo.",
        "Impossible de terminer la mise à jour précédente :\n{0}\n\nFermez l'éditeur et le serveur de test "
        "puis rouvrez-le."),
    "older_exe": (
        "This executable is SA Map Studio version {0}, but this folder already has version {1}, which is "
        "newer.\n\nAn old version does not open in a folder of a newer version, so your projects and settings "
        "are not damaged. Use the executable of version {1} or newer.",
        "Este ejecutable es la versión {0} de SA Map Studio, pero esta carpeta ya tiene la versión {1}, "
        "que es más nueva.\n\nUna versión antigua no se abre en una carpeta de una versión más nueva, para no "
        "dañar tus proyectos y ajustes. Usa el ejecutable de la versión {1} o más nueva.",
        "Este executável é a versão {0} do SA Map Studio, mas esta pasta já está com a versão {1}, que é "
        "mais nova.\n\nUma versão antiga não abre numa pasta de versão mais nova, para não estragar os seus "
        "projetos e configurações. Use o executável da versão {1} ou mais nova.",
        "Questo eseguibile è la versione {0} di SA Map Studio, ma questa cartella ha già la versione {1}, "
        "più recente.\n\nUna versione vecchia non si apre in una cartella di una versione più recente, per non "
        "danneggiare progetti e impostazioni. Usa l'eseguibile della versione {1} o più recente.",
        "Cet exécutable est la version {0} de SA Map Studio, mais ce dossier contient déjà la version {1}, "
        "plus récente.\n\nUne ancienne version ne s'ouvre pas dans le dossier d'une version plus récente, pour "
        "ne pas abîmer vos projets et réglages. Utilisez l'exécutable de la version {1} ou plus récente."),
    "disk_update": ("Not enough disk space to update SA Map Studio: {0} MB free are needed.",
                    "No hay espacio en disco para actualizar SA Map Studio: se necesitan {0} MB libres.",
                    "Falta espaço em disco para atualizar o SA Map Studio: são necessários {0} MB livres.",
                    "Spazio su disco insufficiente per aggiornare SA Map Studio: servono {0} MB liberi.",
                    "Espace disque insuffisant pour mettre à jour SA Map Studio : {0} Mo libres requis."),
    "disk_install": ("Not enough disk space to install SA Map Studio: {0} MB free are needed.",
                     "No hay espacio en disco para instalar SA Map Studio: se necesitan {0} MB libres.",
                     "Falta espaço em disco para instalar o SA Map Studio: são necessários {0} MB livres.",
                     "Spazio su disco insufficiente per installare SA Map Studio: servono {0} MB liberi.",
                     "Espace disque insuffisant pour installer SA Map Studio : {0} Mo libres requis."),
    "updating_to": ("Updating to version {0}", "Actualizando a la versión {0}", "Atualizando para a versão {0}",
                    "Aggiornamento alla versione {0}", "Mise à jour vers la version {0}"),
    "first_run": ("Preparing the editor for the first time", "Preparando el editor por primera vez",
                  "Preparando o editor pela primeira vez", "Preparazione dell'editor per la prima volta",
                  "Préparation de l'éditeur pour la première fois"),
    "update_fail": (
        "Could not update SA Map Studio:\n{0}\n\nNothing was changed: the editor will open in the version "
        "that was already installed.",
        "No se pudo actualizar SA Map Studio:\n{0}\n\nNo se cambió nada: el editor se abrirá en la versión "
        "que ya estaba instalada.",
        "Não foi possível atualizar o SA Map Studio:\n{0}\n\nNada foi alterado: o editor vai abrir na "
        "versão que já estava instalada.",
        "Impossibile aggiornare SA Map Studio:\n{0}\n\nNon è stato modificato nulla: l'editor si aprirà "
        "nella versione già installata.",
        "Impossible de mettre à jour SA Map Studio :\n{0}\n\nRien n'a été modifié : l'éditeur s'ouvrira "
        "dans la version déjà installée."),
    "install_fail": ("Could not prepare SA Map Studio:\n{0}",
                     "No se pudo preparar SA Map Studio:\n{0}",
                     "Não foi possível preparar o SA Map Studio:\n{0}",
                     "Impossibile preparare SA Map Studio:\n{0}",
                     "Impossible de préparer SA Map Studio :\n{0}"),
}
# Idioma principal do Windows (GetUserDefaultUILanguage & 0x3FF) para a sigla do editor
WINDOWS_LANGS = {0x09: "en", 0x0A: "es", 0x16: "pt", 0x10: "it", 0x0C: "fr"}
_lang_cache = []


def ui_lang():
    """Idioma escolhido no editor (data/config.json); sem escolha, o do Windows; senão inglês."""
    if not _lang_cache:
        code = ""
        try:
            with open(os.path.join(get_base_paths()[2], "data", "config.json"), encoding="utf-8") as f:
                code = str(json.load(f).get("language") or "")
        except Exception:
            pass
        if code not in LANGS and os.name == "nt":
            try:
                import ctypes
                code = WINDOWS_LANGS.get(ctypes.windll.kernel32.GetUserDefaultUILanguage() & 0x3FF, "")
            except Exception:
                code = ""
        _lang_cache.append(code if code in LANGS else "en")
    return _lang_cache[0]


def tr(key, *args):
    return TEXTS[key][LANGS.index(ui_lang())].format(*args)


# ---------------------------------------------------------------------------- Windows: instâncias

_held_mutexes = []


def acquire_mutex(name):
    """Cria o mutex com nome e o mantém até o processo acabar. False se outro processo já tem."""
    if not IS_WINDOWS:
        return True
    try:
        import ctypes
        k = ctypes.windll.kernel32
        k.CreateMutexW.restype = ctypes.c_void_p
        h = k.CreateMutexW(None, False, name)
        already = k.GetLastError() == 183  # ERROR_ALREADY_EXISTS
        if h and already:
            k.CloseHandle(ctypes.c_void_p(h))
        elif h:
            _held_mutexes.append(h)
        return not already
    except Exception:
        return True


def mutex_exists(name):
    if not IS_WINDOWS:
        return False
    try:
        import ctypes
        k = ctypes.windll.kernel32
        k.OpenMutexW.restype = ctypes.c_void_p
        h = k.OpenMutexW(0x00100000, False, name)  # SYNCHRONIZE
        if h:
            k.CloseHandle(ctypes.c_void_p(h))
            return True
    except Exception:
        pass
    return False


def processes_in(folder):
    """Processos cujo executável está dentro da pasta (editor antigo, servidor de testes)."""
    if not IS_WINDOWS or not os.path.isdir(folder):
        return []
    out = []
    try:
        import ctypes
        from ctypes import wintypes
        k = ctypes.windll.kernel32
        psapi = ctypes.windll.psapi
        k.OpenProcess.restype = wintypes.HANDLE
        pids = (wintypes.DWORD * 8192)()
        needed = wintypes.DWORD()
        if not psapi.EnumProcesses(ctypes.byref(pids), ctypes.sizeof(pids), ctypes.byref(needed)):
            return []
        base = os.path.normcase(os.path.abspath(folder)).rstrip("\\/") + os.sep
        me = os.getpid()
        for pid in pids[:needed.value // ctypes.sizeof(wintypes.DWORD)]:
            if not pid or pid == me:
                continue
            h = k.OpenProcess(0x1000, False, pid)  # PROCESS_QUERY_LIMITED_INFORMATION
            if not h:
                continue
            try:
                buf = ctypes.create_unicode_buffer(32768)
                size = wintypes.DWORD(32768)
                if k.QueryFullProcessImageNameW(h, 0, buf, ctypes.byref(size)):
                    if os.path.normcase(buf.value).startswith(base):
                        out.append(os.path.basename(buf.value))
            finally:
                k.CloseHandle(h)
    except Exception:
        pass
    return out


def editor_running(target_dir):
    """Editor aberto: o da versão atual tem o mutex; o de versões antigas é achado pelo processo."""
    return mutex_exists(EDITOR_MUTEX) or any(p.lower() == ENGINE_EXE for p in processes_in(target_dir))


def focus_editor():
    """Traz a janela do editor aberto para a frente. True se achou."""
    if not IS_WINDOWS:
        return False
    try:
        import ctypes
        u = ctypes.windll.user32
        hwnd = u.FindWindowW(None, WINDOW_TITLE)
        if not hwnd:
            return False
        if u.IsIconic(hwnd):
            u.ShowWindow(hwnd, 9)  # SW_RESTORE
        u.SetForegroundWindow(hwnd)
        return True
    except Exception:
        return False


# ---------------------------------------------------------------------------- mensagens

def _dialog(kind, title, text):
    try:
        import tkinter as tk
        from tkinter import messagebox
        root = tk.Tk()
        root.withdraw()
        root.attributes("-topmost", True)
        try:
            fn = {"info": messagebox.showinfo, "error": messagebox.showerror,
                  "retry": messagebox.askretrycancel, "yesno": messagebox.askyesno}[kind]
            return fn(title, text, parent=root)
        finally:
            root.destroy()
    except Exception:
        return kind == "info"


def show_already_open():
    if not focus_editor():
        _dialog("info", WINDOW_TITLE, tr("open"))


# ---------------------------------------------------------------------------- manifesto e versões

def manifest_from_zip(bundle_zip):
    try:
        with zipfile.ZipFile(bundle_zip, "r") as z:
            return json.loads(z.read(ROOT_NAME + "/" + MANIFEST_REL).decode("utf-8"))
    except (KeyError, OSError, ValueError, zipfile.BadZipFile):
        return None


def manifest_installed(target_dir):
    try:
        with open(os.path.join(target_dir, *MANIFEST_REL.split("/")), "r", encoding="utf-8") as f:
            m = json.load(f)
        return m if isinstance(m.get("files"), list) else None
    except (OSError, ValueError, AttributeError):
        return None


def version_tuple(v):
    out = []
    for part in str(v or "0").split("."):
        digits = "".join(ch for ch in part if ch.isdigit())
        out.append(int(digits) if digits else 0)
    return tuple(out)


# ---------------------------------------------------------------------------- arquivos

def _native(base, rel):
    return os.path.join(base, *rel.split("/"))


def _retry(fn, *args):
    # Antivírus e indexação seguram arquivos por instantes: tenta de novo antes de desistir
    for attempt in range(40):
        try:
            return fn(*args)
        except PermissionError:
            if attempt == 39:
                raise
            time.sleep(0.25)


def _move(src, dst):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    _retry(os.replace, src, dst)


def _remove(path):
    if os.path.isdir(path) and not os.path.islink(path):
        _rmtree(path)
    elif os.path.lexists(path):
        _retry(os.remove, path)


def _rmtree(path):
    if not os.path.lexists(path):
        return

    def onerror(func, p, _exc):
        try:
            os.chmod(p, 0o666)
            func(p)
        except OSError:
            pass
    for attempt in range(20):
        shutil.rmtree(path, onerror=onerror)
        if not os.path.lexists(path):
            return
        time.sleep(0.25)
    raise OSError(tr("cant_delete", path))


def _write_journal(exe_dir, data):
    path = os.path.join(exe_dir, JOURNAL_NAME)
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f)
        f.flush()
        os.fsync(f.fileno())
    _retry(os.replace, tmp, path)


def _read_journal(exe_dir):
    try:
        with open(os.path.join(exe_dir, JOURNAL_NAME), "r", encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return None


# Operações do plano (cada uma pode ser desfeita mesmo se parou no meio):
#   swapdir  pasta do programa trocada: a antiga vai para a cópia de segurança e a nova entra
#   adddir   pasta do programa que não existia
#   deldir   pasta do programa que não existe mais
#   replace  arquivo do pacote que já existia
#   add      arquivo novo do pacote
#   delete   arquivo do pacote anterior que não vem neste
def _do(op, rel, target, staging, backup):
    t, s, b = _native(target, rel), _native(staging, rel), _native(backup, rel)
    if op in ("swapdir", "replace", "deldir", "delete") and os.path.lexists(t):
        _move(t, b)
    if op in ("swapdir", "adddir", "replace", "add"):
        _move(s, t)


def _undo(op, rel, target, backup):
    t, b = _native(target, rel), _native(backup, rel)
    if op in ("adddir", "add"):
        _remove(t)
    elif os.path.lexists(b):
        _remove(t)
        _move(b, t)


def _prune_empty(target, rels):
    # Pastas que ficaram vazias porque o pacote não traz mais nada nelas (nunca as pastas do usuário)
    keep = {os.path.normcase(os.path.join(target, d)) for d in USER_DIRS} | {os.path.normcase(target)}
    for rel in rels:
        d = os.path.dirname(_native(target, rel))
        while os.path.normcase(d) not in keep and os.path.normcase(d).startswith(os.path.normcase(target)):
            try:
                os.rmdir(d)
            except OSError:
                break
            d = os.path.dirname(d)


def _cleanup(exe_dir, ops=None):
    target = os.path.join(exe_dir, ROOT_NAME)
    if ops:
        _prune_empty(target, [rel for op, rel in ops if op == "delete"])
    _rmtree(os.path.join(exe_dir, BACKUP_NAME))
    _rmtree(os.path.join(exe_dir, STAGING_NAME))
    if os.path.isdir(target):
        for d in USER_DIRS:
            os.makedirs(os.path.join(target, d), exist_ok=True)
    j = os.path.join(exe_dir, JOURNAL_NAME)
    if os.path.lexists(j):
        _retry(os.remove, j)


def recover(exe_dir):
    """Termina ou desfaz uma atualização que parou no meio (erro, queda de energia)."""
    j = _read_journal(exe_dir)
    if j and j.get("state") == "applying":
        target = os.path.join(exe_dir, ROOT_NAME)
        backup = os.path.join(exe_dir, BACKUP_NAME)
        for op, rel in reversed(j.get("ops", [])):
            _undo(op, rel, target, backup)
        _cleanup(exe_dir)
    elif j and j.get("state") == "done":
        _cleanup(exe_dir, j.get("ops"))
    else:
        # Descompactação interrompida antes de mexer na pasta: só sobra a pasta temporária
        _rmtree(os.path.join(exe_dir, STAGING_NAME))
        _rmtree(os.path.join(exe_dir, BACKUP_NAME))


def install(bundle_zip, exe_dir, new_manifest, old_manifest, progress):
    """Deixa a pasta igual ao pacote, mantendo os dados do usuário. Em erro, volta tudo e repassa o erro."""
    target = os.path.join(exe_dir, ROOT_NAME)
    staging = os.path.join(exe_dir, STAGING_NAME)
    backup = os.path.join(exe_dir, BACKUP_NAME)
    _rmtree(staging)
    _rmtree(backup)

    # 1. Descompacta à parte (a pasta instalada ainda não foi tocada)
    with zipfile.ZipFile(bundle_zip, "r") as z:
        infos = [i for i in z.infolist() if not i.is_dir()]
        total = max(1, len(infos))
        for idx, info in enumerate(infos, 1):
            z.extract(info, staging)
            if idx % 25 == 0 or idx == total:
                name = os.path.basename(info.filename)
                progress(idx / total * 80.0, tr("extracting", name if len(name) <= 35 else name[:32]))
    new_root = os.path.join(staging, ROOT_NAME)
    files = list(new_manifest.get("files") or [])
    missing = [f for f in files + [MANIFEST_REL] if not os.path.isfile(_native(new_root, f))]
    if missing:
        raise RuntimeError(tr("incomplete", missing[0]))

    # 2. Plano
    top = lambda rel: rel.split("/", 1)[0]
    ops = []
    for d in PROGRAM_DIRS:
        if os.path.isdir(os.path.join(new_root, d)):
            ops.append(["swapdir" if os.path.lexists(os.path.join(target, d)) else "adddir", d])
        elif os.path.lexists(os.path.join(target, d)):
            ops.append(["deldir", d])
    new_set = set(files)
    for f in files:
        if top(f) not in PROGRAM_DIRS:
            ops.append(["replace" if os.path.lexists(_native(target, f)) else "add", f])
    for f in (old_manifest or {}).get("files", []):
        if top(f) not in PROGRAM_DIRS and f not in new_set and os.path.isfile(_native(target, f)):
            ops.append(["delete", f])

    # 3. Aplica com diário; qualquer erro desfaz tudo
    _write_journal(exe_dir, {"state": "applying", "ops": ops})
    try:
        for n, (op, rel) in enumerate(ops, 1):
            _do(op, rel, target, new_root, backup)
            if n % 25 == 0 or n == len(ops):
                progress(80.0 + 20.0 * n / len(ops), tr("installing"))
        _write_journal(exe_dir, {"state": "done", "ops": ops})
    except BaseException:
        for op, rel in reversed(ops):
            try:
                _undo(op, rel, target, backup)
            except Exception:
                pass
        _cleanup(exe_dir)
        raise
    _cleanup(exe_dir, ops)


# ---------------------------------------------------------------------------- janela de progresso

def run_with_progress(subtitle, exe_dir, work):
    """Mostra a janela de progresso enquanto work(progress) roda. Repassa o erro de work."""
    result = {"error": None}
    try:
        import tkinter as tk
        from tkinter import ttk
    except ImportError:
        work(lambda pct, text: None)
        return

    root = tk.Tk()
    root.title(WINDOW_TITLE + " - " + tr("t_install"))
    root.configure(bg="#1c2228")
    root.resizable(False, False)
    root.protocol("WM_DELETE_WINDOW", lambda: None)  # não fecha no meio

    frames = []
    for cand in (
        os.path.join(getattr(sys, "_MEIPASS", ""), "launcher_frames"),
        os.path.join(exe_dir, "launcher_frames"),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "launcher_frames"),
    ):
        if os.path.isdir(cand):
            for i in range(50):
                fp = os.path.join(cand, f"frame_{i:02d}.png")
                if os.path.isfile(fp):
                    try:
                        frames.append(tk.PhotoImage(file=fp))
                    except Exception:
                        pass
            break

    w, h = 440, (295 if frames else 210)
    x = max(0, (root.winfo_screenwidth() - w) // 2)
    y = max(0, (root.winfo_screenheight() - h) // 2)
    root.geometry(f"{w}x{h}+{x}+{y}")
    for icocand in (
        os.path.join(getattr(sys, "_MEIPASS", ""), "icon.ico"),
        os.path.join(exe_dir, "icon.ico"),
        os.path.join(exe_dir, ROOT_NAME, "system", "icon.ico"),
    ):
        if os.path.isfile(icocand):
            try:
                root.iconbitmap(icocand)
                break
            except Exception:
                pass

    style = ttk.Style()
    try:
        style.theme_use("clam")
    except Exception:
        pass
    style.configure("Dark.Horizontal.TProgressbar", troughcolor="#2b333b", background="#f0a630",
                    bordercolor="#1c2228", lightcolor="#f0a630", darkcolor="#f0a630")

    icon_label = None
    if frames:
        icon_label = tk.Label(root, image=frames[0], bg="#1c2228")
        icon_label.pack(pady=(16, 6))
    tk.Label(root, text=WINDOW_TITLE, font=("Segoe UI", 15, "bold"), fg="#e6e2d8", bg="#1c2228").pack(
        pady=(0, 2) if frames else (22, 4))
    tk.Label(root, text=subtitle, font=("Segoe UI", 10), fg="#a8b1b8", bg="#1c2228").pack(pady=(0, 12))
    prog_var = tk.DoubleVar(value=0.0)
    ttk.Progressbar(root, variable=prog_var, maximum=100.0, style="Dark.Horizontal.TProgressbar", length=350).pack(pady=(0, 8))
    status_var = tk.StringVar(value="Iniciando")
    tk.Label(root, textvariable=status_var, font=("Segoe UI", 9), fg="#7d8892", bg="#1c2228").pack()

    def progress(pct, text):
        def apply():
            prog_var.set(pct)
            status_var.set(f"{text} ({int(pct)}%)")
            if icon_label is not None:
                icon_label.configure(image=frames[min(len(frames) - 1, int(pct / 100.0 * (len(frames) - 1)))])
        root.after(0, apply)

    def worker():
        try:
            work(progress)
            progress(100.0, tr("done"))
            time.sleep(0.4)
        except BaseException as e:  # noqa: B036 - repassado para a thread principal
            result["error"] = e
        finally:
            root.after(0, root.destroy)

    threading.Thread(target=worker, daemon=True).start()
    root.mainloop()
    if result["error"] is not None:
        raise result["error"]


# ---------------------------------------------------------------------------- execução

def launch(target_exe, exe_dir):
    try:
        proc = subprocess.Popen([target_exe] + sys.argv[1:], cwd=exe_dir)
        try:
            proc.wait()
        except KeyboardInterrupt:
            proc.terminate()
            proc.wait()
        sys.exit(proc.returncode)
    except Exception:
        sys.exit(1)


def wait_until_closed(target_dir, version):
    """Pede para fechar o editor e o servidor de testes. False se o usuário cancelar."""
    while True:
        open_now = sorted(set(processes_in(target_dir)))
        if mutex_exists(EDITOR_MUTEX) and ENGINE_EXE not in [p.lower() for p in open_now]:
            open_now.insert(0, ENGINE_EXE)
        if not open_now:
            return True
        focus_editor()
        text = tr("close_editor", version, ", ".join(open_now))
        if not _dialog("retry", WINDOW_TITLE + " - " + tr("t_update"), text):
            return False


def main():
    if IS_WINDOWS:
        try:
            import ctypes
            ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID("samapstudio.pro")
        except Exception:
            pass

    exe_dir, res_dir, target_dir, target_exe = get_base_paths()

    # O editor grava tudo na própria pasta. Numa pasta protegida (como a do GTA em Arquivos de
    # Programas) ele se abre de novo pedindo administrador; em qualquer outra pasta, não pede nada.
    if getattr(sys, "frozen", False) and not dir_writable(target_dir if os.path.isdir(target_dir) else exe_dir):
        if relaunch_as_admin():
            sys.exit(0)

    # Pacote embutido
    bundle_zip = None
    for cand in (
        os.path.join(res_dir, ROOT_NAME + ".zip"),
        os.path.join(exe_dir, ROOT_NAME + ".zip"),
        os.path.join(exe_dir, "build", ROOT_NAME + ".zip"),
    ):
        if os.path.isfile(cand):
            bundle_zip = cand
            break

    if not bundle_zip:
        if not getattr(sys, "frozen", False):
            print("Launcher em modo de desenvolvimento. Executando serve.py...")
            serve_script = os.path.join(exe_dir, "serve.py")
            proc = subprocess.Popen([sys.executable, serve_script] + sys.argv[1:], cwd=exe_dir)
            try:
                proc.wait()
            except KeyboardInterrupt:
                proc.terminate()
                proc.wait()
            sys.exit(proc.returncode)
        _dialog("error", tr("t_error"), tr("no_bundle"))
        sys.exit(1)

    # Um launcher por vez: outro aberto significa editor aberto (ou instalando)
    if not acquire_mutex(LAUNCHER_MUTEX):
        show_already_open()
        sys.exit(0)

    try:
        recover(exe_dir)
    except Exception as e:
        _dialog("error", WINDOW_TITLE, tr("recover_fail", e))
        sys.exit(1)

    new_manifest = manifest_from_zip(bundle_zip) or {"version": "0", "build": "", "files": None}
    old_manifest = manifest_installed(target_dir)
    installed = os.path.isfile(target_exe)
    need = (not installed or not old_manifest or not new_manifest.get("build")
            or old_manifest.get("build") != new_manifest.get("build"))

    # Versão antiga numa pasta de versão mais nova: não abre nem instala (projetos e configurações
    # gravados pela versão nova podem não funcionar na antiga)
    if installed and old_manifest and version_tuple(new_manifest.get("version")) < version_tuple(old_manifest.get("version")):
        _dialog("error", WINDOW_TITLE + " - " + tr("t_incompatible"),
                tr("older_exe", new_manifest.get("version"), old_manifest.get("version")))
        sys.exit(1)

    if not need:
        if editor_running(target_dir):
            show_already_open()
            sys.exit(0)
        launch(target_exe, exe_dir)

    version = new_manifest.get("version") or ""
    if not wait_until_closed(target_dir, version):
        sys.exit(0)

    # Espaço: o pacote é descompactado inteiro antes da troca
    need_bytes = int((new_manifest.get("size") or 0) * 1.1) + 64 * 1024 * 1024
    try:
        free = shutil.disk_usage(exe_dir).free
    except OSError:
        free = need_bytes
    if free < need_bytes:
        _dialog("error", WINDOW_TITLE, tr("disk_update" if installed else "disk_install", need_bytes // (1024 * 1024)))
        if installed:
            launch(target_exe, exe_dir)
        sys.exit(1)

    files = new_manifest.get("files")
    subtitle = tr("updating_to", version) if installed else tr("first_run")
    try:
        if files is None:
            # Pacote sem manifesto (não deveria acontecer): instala do jeito antigo, sem apagar nada
            run_with_progress(subtitle, exe_dir, lambda progress: zipfile.ZipFile(bundle_zip).extractall(exe_dir))
        else:
            run_with_progress(subtitle, exe_dir, lambda progress: install(bundle_zip, exe_dir, new_manifest, old_manifest, progress))
    except Exception as e:
        if installed:
            _dialog("error", WINDOW_TITLE, tr("update_fail", e))
            launch(target_exe, exe_dir)
        _dialog("error", tr("t_install_error"), tr("install_fail", e))
        sys.exit(1)

    if not os.path.isfile(target_exe):
        sys.exit(1)
    launch(target_exe, exe_dir)


if __name__ == "__main__":
    main()
