#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Packer of the sa-map-studio.zip bundle for the single-executable distribution."""

import os
import re
import sys
import json
import time
import hashlib
import zipfile

# Manifest stored inside the package: the launcher compares the installed folder's with the new .exe's
# to know whether it needs to update and which program files no longer exist in this version
MANIFEST = "system/bundle.json"


def app_version():
    """Editor version (VERSION of serve.py)."""
    try:
        here = os.path.dirname(os.path.abspath(__file__))
        with open(os.path.join(here, "..", "serve.py"), "r", encoding="utf-8") as f:
            m = re.search(r'^VERSION\s*=\s*"([^"]+)"', f.read(), re.M)
        return m.group(1) if m else "0"
    except OSError:
        return "0"

def package_bundle(staging_dir, output_zip):
    print(f"Packing folder '{staging_dir}' into '{output_zip}'...")
    t0 = time.time()
    staging_dir = os.path.abspath(staging_dir)
    os.makedirs(os.path.dirname(os.path.abspath(output_zip)), exist_ok=True)
    
    total_files = 0
    total_uncompressed = 0
    
    # Files or folders to ignore
    ignore_names = {"__pycache__", ".git", ".gitkeep", "LEIA-ME.txt", "leia-me.txt"}
    ignore_exts = {".pyc", ".pyo", ".pdb", ".dmp", ".ilk", ".exp"}
    
    digest = hashlib.sha256()
    files = []
    root_name = os.path.basename(staging_dir)
    with zipfile.ZipFile(output_zip, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        for root, dirs, names in os.walk(staging_dir):
            dirs[:] = sorted(d for d in dirs if d not in ignore_names)
            for f in sorted(names):
                if f in ignore_names:
                    continue
                _, ext = os.path.splitext(f)
                if ext.lower() in ignore_exts:
                    continue
                
                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, os.path.dirname(staging_dir))
                
                inner = os.path.relpath(full_path, staging_dir).replace(os.sep, "/")
                if inner == MANIFEST:
                    continue
                with open(full_path, "rb") as fh:
                    data = fh.read()
                digest.update(inner.encode("utf-8") + b"\0" + data)
                z.writestr(zipfile.ZipInfo.from_file(full_path, rel_path), data, zipfile.ZIP_DEFLATED, 6)
                files.append(inner)
                total_files += 1
                total_uncompressed += os.path.getsize(full_path)
                
                if total_files % 250 == 0:
                    print(f"  Added {total_files} files...", end="\r")
                    
        manifest = {"app": "SA Map Studio", "version": app_version(), "build": digest.hexdigest(),
                    "size": total_uncompressed, "files": files}
        z.writestr(root_name + "/" + MANIFEST, json.dumps(manifest, ensure_ascii=False, indent=1))
        print(f"\n  Version {manifest['version']}, build {manifest['build'][:12]}")

    compressed_size = os.path.getsize(output_zip)
    dur = time.time() - t0
    print(f"\nPacking finished successfully!")
    print(f"  Files included: {total_files}")
    print(f"  Uncompressed size: {total_uncompressed / (1024 * 1024):.2f} MB")
    print(f"  Compressed size (ZIP): {compressed_size / (1024 * 1024):.2f} MB")
    print(f"  Time: {dur:.2f}s")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python package_bundle.py <staging_dir> <output_zip>")
        sys.exit(1)
    package_bundle(sys.argv[1], sys.argv[2])
