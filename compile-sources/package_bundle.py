#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Empacotador do bundle sa-map-studio.zip para distribuição de executável único."""

import os
import sys
import time
import zipfile

def package_bundle(staging_dir, output_zip):
    print(f"Empacotando pasta '{staging_dir}' em '{output_zip}'...")
    t0 = time.time()
    staging_dir = os.path.abspath(staging_dir)
    os.makedirs(os.path.dirname(os.path.abspath(output_zip)), exist_ok=True)
    
    total_files = 0
    total_uncompressed = 0
    
    # Arquivos ou pastas a ignorar
    ignore_names = {"__pycache__", ".git", ".gitkeep", "LEIA-ME.txt", "leia-me.txt"}
    ignore_exts = {".pyc", ".pyo", ".pdb", ".dmp", ".ilk", ".exp"}
    
    with zipfile.ZipFile(output_zip, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        for root, dirs, files in os.walk(staging_dir):
            dirs[:] = [d for d in dirs if d not in ignore_names]
            for f in files:
                if f in ignore_names:
                    continue
                _, ext = os.path.splitext(f)
                if ext.lower() in ignore_exts:
                    continue
                
                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, os.path.dirname(staging_dir))
                
                z.write(full_path, rel_path)
                total_files += 1
                total_uncompressed += os.path.getsize(full_path)
                
                if total_files % 250 == 0:
                    print(f"  Adicionados {total_files} arquivos...", end="\r")
                    
    compressed_size = os.path.getsize(output_zip)
    dur = time.time() - t0
    print(f"\nEmpacotamento concluido com sucesso!")
    print(f"  Arquivos incluidos: {total_files}")
    print(f"  Tamanho descompactado: {total_uncompressed / (1024 * 1024):.2f} MB")
    print(f"  Tamanho compactado (ZIP): {compressed_size / (1024 * 1024):.2f} MB")
    print(f"  Tempo: {dur:.2f}s")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: python package_bundle.py <staging_dir> <output_zip>")
        sys.exit(1)
    package_bundle(sys.argv[1], sys.argv[2])
