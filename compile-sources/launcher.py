#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""SA Map Studio - Launcher / Bootstrapper Auto-Extrator.

Executável principal de distribuição única.
Quando executado pela primeira vez (ou se a pasta 'sa-map-studio' não existir ao lado dele),
descompacta o pacote interno do programa com barra de progresso visual.
Nas execuções seguintes, inicia o editor imediatamente sem re-extrair.
"""

import os
import sys
import time
import zipfile
import threading
import subprocess

IS_WINDOWS = os.name == "nt"

def get_base_paths():
    if getattr(sys, "frozen", False):
        exe_dir = os.path.dirname(os.path.abspath(sys.argv[0]))
        res_dir = getattr(sys, "_MEIPASS", exe_dir)
    else:
        exe_dir = os.path.dirname(os.path.abspath(__file__))
        res_dir = exe_dir

    target_dir = os.path.join(exe_dir, "sa-map-studio")
    target_exe = os.path.join(target_dir, "system", "sa-map-studio.exe")
    return exe_dir, res_dir, target_dir, target_exe

def extract_with_ui(bundle_zip, target_parent_dir, target_exe, exe_dir):
    try:
        import tkinter as tk
        from tkinter import ttk, messagebox
        has_tk = True
    except ImportError:
        has_tk = False

    if not has_tk:
        # Fallback sem interface gráfica
        with zipfile.ZipFile(bundle_zip, "r") as z:
            z.extractall(target_parent_dir)
        return True

    root = tk.Tk()
    root.title("SA Map Studio")
    root.configure(bg="#1c2228")
    root.resizable(False, False)

    # Carrega frames do ícone de carregamento animado
    frames_dir = None
    for cand in (
        os.path.join(getattr(sys, "_MEIPASS", ""), "launcher_frames"),
        os.path.join(exe_dir, "launcher_frames"),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "launcher_frames"),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "compile-sources", "launcher_frames"),
    ):
        if os.path.isdir(cand):
            frames_dir = cand
            break

    frames = []
    if frames_dir:
        for i in range(50):
            fp = os.path.join(frames_dir, f"frame_{i:02d}.png")
            if os.path.isfile(fp):
                try:
                    frames.append(tk.PhotoImage(file=fp))
                except Exception:
                    pass

    # Dimensões e centralização
    w, h = 440, (295 if frames else 210)
    sw = root.winfo_screenwidth()
    sh = root.winfo_screenheight()
    x = max(0, (sw - w) // 2)
    y = max(0, (sh - h) // 2)
    root.geometry(f"{w}x{h}+{x}+{y}")

    # Tenta carregar o ícone
    for icocand in (
        os.path.join(getattr(sys, "_MEIPASS", ""), "icon.ico"),
        os.path.join(exe_dir, "icon.ico"),
        os.path.join(exe_dir, "sa-map-studio", "system", "icon.ico"),
    ):
        if os.path.isfile(icocand):
            try:
                root.iconbitmap(icocand)
                break
            except Exception:
                pass

    # Estilos TTK
    style = ttk.Style()
    try:
        style.theme_use("clam")
    except Exception:
        pass
    style.configure(
        "Dark.Horizontal.TProgressbar",
        troughcolor="#2b333b",
        background="#f0a630",
        bordercolor="#1c2228",
        lightcolor="#f0a630",
        darkcolor="#f0a630",
    )

    # Componentes Visuais
    if frames:
        icon_label = tk.Label(root, image=frames[0], bg="#1c2228")
        icon_label.pack(pady=(16, 6))
        title_pady = (0, 2)
    else:
        icon_label = None
        title_pady = (22, 4)

    title_label = tk.Label(
        root,
        text="SA Map Studio",
        font=("Segoe UI", 15, "bold"),
        fg="#e6e2d8",
        bg="#1c2228",
    )
    title_label.pack(pady=title_pady)

    sub_label = tk.Label(
        root,
        text="Preparando o editor pela primeira vez...",
        font=("Segoe UI", 10),
        fg="#a8b1b8",
        bg="#1c2228",
    )
    sub_label.pack(pady=(0, 12))

    prog_var = tk.DoubleVar(value=0.0)
    pbar = ttk.Progressbar(
        root,
        variable=prog_var,
        maximum=100.0,
        style="Dark.Horizontal.TProgressbar",
        length=350,
    )
    pbar.pack(pady=(0, 8))

    status_var = tk.StringVar(value="Iniciando descompactação...")
    status_label = tk.Label(
        root,
        textvariable=status_var,
        font=("Segoe UI", 9),
        fg="#7d8892",
        bg="#1c2228",
    )
    status_label.pack()

    success = [False]
    err_msg = [None]

    def worker():
        try:
            with zipfile.ZipFile(bundle_zip, "r") as z:
                infolist = z.infolist()
                total = len(infolist)
                step = max(1, total // 100)
                for idx, item in enumerate(infolist, 1):
                    z.extract(item, target_parent_dir)
                    if idx % step == 0 or idx == total:
                        pct = (idx / total) * 100.0
                        prog_var.set(pct)
                        if frames and icon_label:
                            frame_idx = min(len(frames) - 1, int((pct / 100.0) * (len(frames) - 1)))
                            icon_label.configure(image=frames[frame_idx])
                        name = os.path.basename(item.filename) or item.filename
                        if len(name) > 35:
                            name = name[:32] + "..."
                        status_var.set(f"Extraindo: {name} ({int(pct)}%)")
                        root.update_idletasks()

            # Garante a existência das pastas do usuário
            for folder in ("projects", "exported", "data"):
                os.makedirs(os.path.join(target_parent_dir, "sa-map-studio", folder), exist_ok=True)

            status_var.set("Concluído! Abrindo o editor...")
            prog_var.set(100.0)
            if frames and icon_label:
                icon_label.configure(image=frames[-1])
            root.update_idletasks()
            time.sleep(0.4)
            success[0] = True
        except Exception as e:
            err_msg[0] = str(e)
        finally:
            root.destroy()

    threading.Thread(target=worker, daemon=True).start()
    root.mainloop()

    if err_msg[0]:
        try:
            messagebox.showerror("Erro na Extração", f"Não foi possível preparar o SA Map Studio:\n{err_msg[0]}")
        except Exception:
            pass
        return False

    return success[0]

def main():
    if IS_WINDOWS:
        try:
            import ctypes
            ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID("samapstudio.pro")
        except Exception:
            pass

    exe_dir, res_dir, target_dir, target_exe = get_base_paths()

    # 1. Se o sistema já estiver descompactado e pronto, inicia imediatamente
    if os.path.isfile(target_exe):
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

    # 2. Primeira execução: localiza o pacote compactado embutido
    bundle_zip = None
    for cand in (
        os.path.join(res_dir, "sa-map-studio.zip"),
        os.path.join(exe_dir, "sa-map-studio.zip"),
        os.path.join(exe_dir, "build", "sa-map-studio.zip"),
    ):
        if os.path.isfile(cand):
            bundle_zip = cand
            break

    if not bundle_zip:
        # Se não encontrar o zip embutido e já estiver no modo dev
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
        else:
            try:
                import tkinter.messagebox as mb
                mb.showerror("Erro", "O pacote de recursos do SA Map Studio não foi encontrado no executável.")
            except Exception:
                pass
            sys.exit(1)

    # 3. Descompacta exibindo barra de progresso
    ok = extract_with_ui(bundle_zip, exe_dir, target_exe, exe_dir)
    if not ok or not os.path.isfile(target_exe):
        sys.exit(1)

    # 4. Inicia o programa descompactado
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

if __name__ == "__main__":
    main()
