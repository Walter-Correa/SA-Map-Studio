"""Writes to version_info.txt (the .exe metadata) the same editor version (VERSION of serve.py).
Runs on every build, before PyInstaller, so the file version is never out of date."""
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)


def main():
    with open(os.path.join(ROOT, "serve.py"), "r", encoding="utf-8") as f:
        m = re.search(r'^VERSION\s*=\s*"(\d+)\.(\d+)\.(\d+)"', f.read(), re.M)
    if not m:
        print("ERROR: VERSION not found in serve.py")
        return 1
    parts = [int(x) for x in m.groups()] + [0]
    dotted = ".".join(str(p) for p in parts)
    tupled = "(%d, %d, %d, %d)" % tuple(parts)
    path = os.path.join(HERE, "version_info.txt")
    with open(path, "rb") as f:
        raw = f.read()
    crlf = b"\r\n" in raw
    text = raw.decode("utf-8").replace("\r\n", "\n")
    text = re.sub(r"(filevers|prodvers)=\(\d+, \d+, \d+, \d+\)", lambda g: "%s=%s" % (g.group(1), tupled), text)
    text = re.sub(r"StringStruct\('(FileVersion|ProductVersion)', '[^']*'\)", lambda g: "StringStruct('%s', '%s')" % (g.group(1), dotted), text)
    out = (text.replace("\n", "\r\n") if crlf else text).encode("utf-8")
    if out != raw:
        with open(path, "wb") as f:
            f.write(out)
    print("Executable version: " + dotted)
    return 0


if __name__ == "__main__":
    sys.exit(main())
