#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fase 2 — lista TODOS os nomes de arquivo e lê o conteúdo dos HTMLs do Drive FR.
Entrada: arvore_drive_fr.json · Saída: LISTAGEM_NOMES_FR.txt + CONTEUDO_HTML_FR.txt"""
import urllib.request, re, time, json, sys
from html import unescape
from pathlib import Path
from datetime import datetime

BASE = Path("/home/user/_analysis_fr")
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"}
MAX_BYTES = 600_000

def get(id_arq, tries=4):
    url = f"https://drive.google.com/uc?export=download&id={id_arq}"
    err = None
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=45) as r:
                dados = r.read(MAX_BYTES)
                # página de confirmação (raríssimo p/ arq pequeno)
                if b"uc-download-link" in dados[:60000]:
                    m = re.search(rb'href="(/uc\?export=download[^"]+)"', dados)
                    if m:
                        url2 = "https://drive.google.com" + m.group(1).decode("utf-8", "replace").replace("&amp;", "&")
                        req2 = urllib.request.Request(url2, headers=UA)
                        with urllib.request.urlopen(req2, timeout=45) as r2:
                            return r2.read(MAX_BYTES)
                return dados
        except Exception as e:
            err = e
            time.sleep(2 + i)
    raise err

_RE_TAG = re.compile(r"<[^>]+>")
_RE_TITLE = re.compile(r"<title[^>]*>(.*?)</title>", re.I | re.S)
_RE_HEAD = re.compile(r"<h([1-4])[^>]*>(.*?)</h\1>", re.I | re.S)
_RE_SCRIPT = re.compile(r"<(script|style)[^>]*>.*?</\1>", re.I | re.S)

def limpa(s):
    return re.sub(r"\s+", " ", unescape(_RE_TAG.sub(" ", s))).strip()

def extrai(raw):
    for enc in ("utf-8", "cp1252", "latin-1"):
        try:
            txt = raw.decode(enc)
            break
        except UnicodeDecodeError:
            continue
    else:
        txt = raw.decode("utf-8", errors="replace")
    titulo = ""
    m = _RE_TITLE.search(txt)
    if m:
        titulo = limpa(m.group(1))[:160]
    heads, vistos = [], set()
    for mh in _RE_HEAD.finditer(txt):
        h = limpa(mh.group(2))[:110]
        if h and h.lower() not in vistos:
            vistos.add(h.lower())
            heads.append(h)
        if len(heads) >= 4:
            break
    corpo = limpa(_RE_SCRIPT.sub(" ", txt))[:700]
    return titulo, heads, corpo

def main():
    dados = json.loads((BASE / "arvore_drive_fr.json").read_text(encoding="utf-8"))
    arvore = dados["arvore"]

    # ---- 1) listagem completa de nomes
    L = []
    tot = 0
    for caminho in sorted(arvore, key=str.lower):
        ent = arvore[caminho]
        arqs = [e for e in ent if not e["dir"]]
        if not arqs:
            continue
        L.append(f"\n### {caminho}/")
        for a in arqs:
            tot += 1
            L.append(f"{a['name']}  <{a['id']}>")
    (BASE / "LISTAGEM_NOMES_FR.txt").write_text(
        f"LISTAGEM COMPLETA DE ARQUIVOS — Drive FR ({tot} arquivos)\n" + "\n".join(L),
        encoding="utf-8")
    print(f"Listagem: {tot} arquivos")

    # ---- 2) conteúdo dos HTMLs
    htmls = []
    for caminho, ent in arvore.items():
        for e in ent:
            if not e["dir"] and e["name"].lower().endswith(".html"):
                htmls.append((caminho, e["name"], e["id"]))
    htmls.sort(key=lambda t: (t[0].lower(), t[1].lower()))
    print(f"HTMLs a ler: {len(htmls)}")

    C = ["=" * 72,
         " CONTEÚDO DOS HTMLs — Curso de Francês (Drive, lido via web)",
         f" Data: {datetime.now().strftime('%d/%m/%Y %H:%M')} · HTMLs: {len(htmls)}",
         "=" * 72]
    falhas = []
    for i, (caminho, nome, fid) in enumerate(htmls, 1):
        try:
            raw = get(fid)
            titulo, heads, corpo = extrai(raw)
        except Exception as e:
            falhas.append((caminho, nome, str(e)))
            titulo, heads, corpo = "", [f"(ERRO: {e})"], ""
        C.append(f"\n### {caminho}/{nome} <{fid}>")
        C.append(f"TÍTULO: {titulo or '(vazio)'}")
        if heads:
            C.append("H: " + " ~ ".join(heads))
        if corpo:
            C.append("TEXTO: " + corpo)
        if i % 40 == 0:
            print(f"  {i}/{len(htmls)} lidos...")
        time.sleep(0.25)
    if falhas:
        C.append("\n\n## FALHAS DE LEITURA:")
        for c, n, e in falhas:
            C.append(f"  ! {c}/{n}: {e}")
    (BASE / "CONTEUDO_HTML_FR.txt").write_text("\n".join(C), encoding="utf-8")
    print(f"Pronto. Falhas: {len(falhas)} · Arquivos: LISTAGEM_NOMES_FR.txt / CONTEUDO_HTML_FR.txt")

if __name__ == "__main__":
    main()
