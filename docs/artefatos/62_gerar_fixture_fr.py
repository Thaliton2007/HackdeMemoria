#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Gera réplica FIEL do Drive FR (4.311 arquivos, nomes reais) em FIXFR/."""
import json, shutil
from pathlib import Path

SRC = Path("/home/user/_analysis_fr/arvore_drive_fr.json")
DST = Path("/home/user/_teste_fr_master/FIXFR")

def main():
    dados = json.loads(SRC.read_text(encoding="utf-8"))["arvore"]
    if DST.exists(): shutil.rmtree(DST)
    n = 0
    for caminho, entradas in dados.items():
        pasta = DST if caminho in ("/", "") else DST / caminho.lstrip("/")
        pasta.mkdir(parents=True, exist_ok=True)
        for e in entradas:
            p = pasta / e["name"]
            if e["dir"]:
                p.mkdir(exist_ok=True)
            else:
                p.write_bytes(b"x")
                n += 1
    print(f"Fixture: {n} arquivos gerados em {DST}")

if __name__ == "__main__":
    main()
