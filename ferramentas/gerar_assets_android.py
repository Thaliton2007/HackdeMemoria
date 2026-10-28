#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Gera a copia do hub que vai dentro do APK (android/app/src/main/assets/).

O HTML de producao em app/MemoriaHack_Cursos.html NAO e alterado. Este
script decodifica os 3 cursos (Base64 nos <script id="doc-*">), injeta a
ponte android/bridge/mh_android.js no <head> de cada um e do proprio hub,
e salva tudo em assets/. Roda automaticamente no GitHub Actions antes do
gradle, e pode ser rodado a mao antes de abrir no Android Studio:

    python3 ferramentas/gerar_assets_android.py
    python3 ferramentas/gerar_assets_android.py --verificar
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ORIGEM = ROOT / "app" / "MemoriaHack_Cursos.html"
PONTE = ROOT / "android" / "bridge" / "mh_android.js"
DESTINO = ROOT / "android" / "app" / "src" / "main" / "assets" / "MemoriaHack_Cursos.html"

DOC = re.compile(
    r'(<script id="doc-(?:es|en|fr)" type="text/plain">)(.*?)(</script>)',
    re.S | re.I,
)
HEAD = re.compile(r"<head[^>]*>", re.I)
HTML = re.compile(r"<html[^>]*>", re.I)


def injetar(html: str, js: str, topo: bool = False) -> str:
    tag = (
        '<script data-mh-android="%s">\n%s\n</script>\n'
        % ("topo" if topo else "curso", js)
    )
    m = HEAD.search(html)
    if m:
        return html[: m.end()] + "\n" + tag + html[m.end() :]
    m = HTML.search(html)
    if m:
        return html[: m.end()] + "\n<head>" + tag + "</head>" + html[m.end() :]
    return tag + html


def gerar() -> tuple[Path, int, str]:
    if not ORIGEM.is_file():
        raise SystemExit("Faltando: %s" % ORIGEM)
    if not PONTE.is_file():
        raise SystemExit("Faltando: %s" % PONTE)

    hub = ORIGEM.read_text(encoding="utf-8")
    js = PONTE.read_text(encoding="utf-8")
    if "MHAndroid" not in js:
        raise SystemExit("Ponte JS invalida (sem MHAndroid)")

    def trocar(m):
        b64 = re.sub(r"\s+", "", m.group(2))
        try:
            interno = base64.b64decode(b64).decode("utf-8")
        except Exception as e:
            raise SystemExit("Base64 invalido em %s: %s" % (m.group(1), e))
        if "data-mh-android" not in interno:
            interno = injetar(interno, js)
        return m.group(1) + base64.b64encode(interno.encode("utf-8")).decode("ascii") + m.group(3)

    hub_novo, n = DOC.subn(trocar, hub)
    if n != 3:
        raise SystemExit("Esperava 3 cursos no hub, encontrei %d" % n)
    if "data-mh-android" not in hub_novo[:6000]:
        hub_novo = injetar(hub_novo, js, topo=True)

    DESTINO.parent.mkdir(parents=True, exist_ok=True)
    DESTINO.write_text(hub_novo, encoding="utf-8")
    md5 = hashlib.md5(hub_novo.encode("utf-8")).hexdigest()
    return DESTINO, n, md5


def verificar() -> int:
    if not DESTINO.is_file():
        print("NAO GERADO:", DESTINO)
        return 1
    s = DESTINO.read_text(encoding="utf-8")
    n = len(DOC.findall(s))
    ok_topo = 'data-mh-android="topo"' in s[:8000]
    md5_origem = hashlib.md5(ORIGEM.read_bytes()).hexdigest()
    print("origem  :", md5_origem, ORIGEM.stat().st_size, "bytes (inalterado)")
    print("asset   :", hashlib.md5(s.encode("utf-8")).hexdigest(), len(s.encode("utf-8")), "bytes")
    print("cursos  :", n, "| ponte no hub:", ok_topo)
    return 0 if (n == 3 and ok_topo and md5_origem == "8e547cddce73df56c23093a253e38dcc") else 1


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--verificar", action="store_true", help="checa o asset sem reescrever")
    a = ap.parse_args()
    if a.verificar:
        return verificar()
    caminho, n, md5 = gerar()
    print("OK: %d cursos instrumentados" % n)
    print("    %s" % caminho)
    print("    %d bytes | md5 %s" % (caminho.stat().st_size, md5))
    print("    HTML de producao em app/ permanece intacto.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
