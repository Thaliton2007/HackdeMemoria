#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Rastreia a árvore pública do Drive (curso Francês) via embeddedfolderview.
Saída: /home/user/_analysis_fr/arvore_drive_fr.json + RELATORIO_DRIVE_FR_ESTRUTURA.txt"""
import urllib.request, re, time, json, sys
from html import unescape
from pathlib import Path
from datetime import datetime

ROOT = "1KA4mMyEpO_ZTPk5J0lulnO9-IVYrNs7S"
OUT_DIR = Path("/home/user/_analysis_fr")
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"}

def get(url, tries=4):
    err = None
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=45) as r:
                return r.read()
        except Exception as e:
            err = e
            time.sleep(2 + i)
    raise err

def folder_entries(fid):
    raw = get(f"https://drive.google.com/embeddedfolderview?id={fid}#list").decode("utf-8", "replace")
    out = []
    for chunk in raw.split('flip-entry" id="entry-')[1:]:
        eid = chunk.split('"', 1)[0]
        m = re.search(r'flip-entry-title">(.*?)</div>', chunk, re.S)
        name = unescape(re.sub(r"<[^>]+>", "", m.group(1))).strip() if m else "?"
        out.append({"id": eid, "name": name, "dir": "/drive/folders/" in chunk})
    return out

def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    arvore = {}
    fila = [(ROOT, "")]
    n_pastas = 0
    falhas = []
    while fila:
        fid, caminho = fila.pop(0)
        try:
            entradas = folder_entries(fid)
        except Exception as e:
            falhas.append((caminho or "(raiz)", str(e)))
            print(f"  !! FALHA em {caminho or '(raiz)'}: {e}")
            continue
        arvore[caminho or "/"] = entradas
        n_pastas += 1
        subs = [e for e in entradas if e["dir"]]
        print(f"[{n_pastas:3d}] {caminho or '(raiz)'}  → {len(entradas)} itens ({len(subs)} pastas)")
        for e in subs:
            fila.append((e["id"], f"{caminho}/{e['name']}" if caminho else e["name"]))
        time.sleep(0.35)

    (OUT_DIR / "arvore_drive_fr.json").write_text(
        json.dumps({"raiz_id": ROOT, "arvore": arvore, "falhas": falhas},
                   ensure_ascii=False, indent=1), encoding="utf-8")

    # ---- relatório legível
    EXT = lambda n: Path(n).suffix.lower() or "(sem ext)"
    L = []
    add = L.append
    add("=" * 72)
    add(" MAPA DO DRIVE — Curso de Francês (rastreado via web, somente leitura)")
    add(f" Raiz: https://drive.google.com/drive/folders/{ROOT}")
    add(f" Data: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    add(f" Pastas rastreadas: {len(arvore)} · Falhas: {len(falhas)}")
    add("=" * 72)
    tot_arq, ext_tot = 0, {}
    for caminho in sorted(arvore, key=str.lower):
        ent = arvore[caminho]
        arqs = [e for e in ent if not e["dir"]]
        subs = [e for e in ent if e["dir"]]
        ext = {}
        for a in arqs:
            ext[EXT(a["name"])] = ext.get(EXT(a["name"]), 0) + 1
            tot_arq += 1
            ext_tot[EXT(a["name"])] = ext_tot.get(EXT(a["name"]), 0) + 1
        add(f"\n{caminho}/")
        add(f"   [ {len(arqs)} arq · {len(subs)} subpastas"
            + (f" · {', '.join(f'{k}:{v}' for k,v in sorted(ext.items()))}" if ext else "") + " ]")
        for s in subs:
            add(f"   + {s['name']}/")
    add("\n" + "=" * 72)
    add(f" TOTAL GERAL: {tot_arq} arquivos")
    for k, v in sorted(ext_tot.items(), key=lambda kv: -kv[1]):
        add(f"   {k:8s}: {v}")
    if falhas:
        add("\n FALHAS:")
        for c, e in falhas:
            add(f"   ! {c}: {e}")
    add("=" * 72)
    txt = "\n".join(L)
    (OUT_DIR / "RELATORIO_DRIVE_FR_ESTRUTURA.txt").write_text(txt, encoding="utf-8")
    print("\n" + txt)

if __name__ == "__main__":
    main()
