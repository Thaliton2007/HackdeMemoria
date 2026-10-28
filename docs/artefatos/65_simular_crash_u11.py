#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Simula o crash real do PC (WinError 3, MAX_PATH 260) na U11:
deixa o executar morrer exatamente no 4º arquivo movido p/ o
Audio_Dialogo da Unité 11 — igual ao que aconteceu no Windows.
Depois rodamos o script normal por cima (cenário do usuário)."""
import importlib.util, sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
SCRIPT = AQUI / "FIXFR" / "ORGANIZAR_FR_MESTRE.py"

spec = importlib.util.spec_from_file_location("org", SCRIPT)
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

orig = m.fs_move
alvo = {"n": 0}

def fs_move_com_trap(a, b):
    a = str(a); b = str(b)
    if "Audio_Dialogo" in b and "Unité 11" in b:
        alvo["n"] += 1
        if alvo["n"] == 4:
            print("\n[TRAP] FileNotFoundError simulado no 4º item do Audio_Dialogo da U11 "
                  "(= WinError 3 do caminho >260 no Windows)")
            raise FileNotFoundError("[WinError 3 simulado] caminho > 260 (MAX_PATH)")
    return orig(a, b)

m.fs_move = fs_move_com_trap
sys.argv = ["x"]          # exec normal
try:
    m.main()
except FileNotFoundError as e:
    print(f"[TRAP] exec morreu como no PC: {e}")

# onde o script parou
u11 = AQUI / "FIXFR" / "#02 Morceau 01" / "14 - Unité 11"
restantes = sorted(p.name for p in u11.iterdir())
jogados = sorted(p.name for p in (u11 / "03_Conversation_Native" / "Audio_Dialogo").iterdir())
print(f"[TRAP] U11 raiz ainda tem {len(restantes)} itens soltos")
print(f"[TRAP] Audio_Dialogo parcial: {len(jogados)} arquivos -> {jogados}")
