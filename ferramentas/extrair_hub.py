#!/usr/bin/env python3
"""Extrai / verifica / reconstrói o hub do Memoria Hack.

O hub guarda os três cursos como Base64 dentro de tags:
    <script id="doc-es" type="text/plain">BASE64</script>
    <script id="doc-en" type="text/plain">BASE64</script>
    <script id="doc-fr" type="text/plain">BASE64</script>

Uso:
    python3 ferramentas/extrair_hub.py --verificar
    python3 ferramentas/extrair_hub.py --extrair
    python3 ferramentas/extrair_hub.py --reconstruir
    python3 ferramentas/extrair_hub.py --md5
"""
import base64
import hashlib
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / "app"
HUB = APP / "MemoriaHack_Cursos.html"

CURSOS = [
    ("es", "MemoriaHack_Espanhol_Claro_v2.html"),
    ("en", "Ingles_Curso_Completo_Claro_v2.html"),
    ("fr", "Frances_Curso_Completo.html"),
]

# MD5 da PRODUÇÃO 14/10/2026, conferidos com `entregas.json` do Drive.
# O baseline 26/09 (anexo) tinha espanhol 23fd091c93b4f41075d752e95e11892a.
MD5_ESPERADO = {
    "es": "f4ffa48483401cd91d1acf4624fda7ad",
    "en": "fef3527de7832f24b47c994a38960192",
    "fr": "d8176d37b9cd09eb7681126656b81875",
}

PAT = re.compile(
    r'(<script id="doc-(es|en|fr)" type="text/plain">)([A-Za-z0-9+/=]+)(</script>)'
)


def ler_hub():
    if not HUB.exists():
        sys.exit(f"hub não encontrado: {HUB}")
    return HUB.read_text(encoding="utf-8")


def blocos(html):
    achados = {}
    for m in PAT.finditer(html):
        achados[m.group(2)] = m
    if set(achados) != {"es", "en", "fr"}:
        sys.exit(f"esperava 3 blocos (es/en/fr), achei {sorted(achados)}")
    return achados


def verificar(html=None):
    html = html or ler_hub()
    ok = True
    for cid, arq in CURSOS:
        m = blocos(html)[cid]
        raw = base64.b64decode(m.group(3))
        md5 = hashlib.md5(raw).hexdigest()
        esperado = MD5_ESPERADO[cid]
        match = md5 == esperado
        no_disco = (APP / arq).exists() and (APP / arq).read_bytes() == raw
        print(
            f"  {cid}: {len(raw):>9,} B  md5={md5}  "
            f"{'OK (produção 14/10)' if match else 'DIFERE da produção 14/10'}  "
            f"avulso={'idêntico' if no_disco else 'DIFERENTE'}"
        )
        if not match:
            print(f"        esperado={esperado}")
        ok &= no_disco and match
    return ok


def extrair(html=None):
    html = html or ler_hub()
    bs = blocos(html)
    for cid, arq in CURSOS:
        raw = base64.b64decode(bs[cid].group(3))
        (APP / arq).write_bytes(raw)
        print(f"  {arq}: {len(raw):,} bytes  md5={hashlib.md5(raw).hexdigest()}")


def reconstruir():
    """Remonta o hub usando os 3 HTMLs avulsos de app/ (preserva o resto do hub)."""
    html = ler_hub()
    bs = blocos(html)
    pedacos = []
    ultimo = 0
    for m in sorted(bs.values(), key=lambda x: x.start()):
        cid = m.group(2)
        arq = dict(CURSOS)[cid]
        caminho = APP / arq
        if not caminho.exists():
            sys.exit(f"falta {caminho}")
        raw = caminho.read_bytes()
        if not raw.lstrip().startswith(b"<!DOCTYPE html"):
            sys.exit(f"{caminho} não parece um HTML completo")
        novo = base64.b64encode(raw).decode("ascii")
        pedacos.append(html[ultimo:m.start(3)])
        pedacos.append(novo)
        ultimo = m.end(3)
        print(f"  {cid}: {len(raw):,} B -> {len(novo):,} B base64")
    pedacos.append(html[ultimo:])
    saida = "".join(pedacos)
    HUB.write_text(saida, encoding="utf-8")
    print(f"  hub reescrito: {HUB} ({len(saida.encode()):,} bytes)")


def md5_arquivos():
    for cid, arq in CURSOS:
        p = APP / arq
        raw = p.read_bytes() if p.exists() else b""
        print(f"  {cid}: {hashlib.md5(raw).hexdigest() if raw else '-'}  {arq}")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "--verificar"
    print(f"hub: {HUB}")
    if cmd == "--extrair":
        extrair()
    elif cmd == "--reconstruir":
        reconstruir()
    elif cmd == "--md5":
        md5_arquivos()
    elif cmd == "--verificar":
        sys.exit(0 if verificar() else 1)
    else:
        sys.exit(__doc__)
