#!/usr/bin/env python3
"""Audita o estado real dos três datasets embutidos nos HTMLs.

Mede cartas, unidades, aulas/blocos, questões, provões, cobertura de áudio,
distribuição do gabarito e presença dos patches finais (voz, fluxo dinâmico,
bandeiras, Bloco 4). Serve como teste de fumaça antes de qualquer refatoração.

Uso: python3 ferramentas/auditar_apps.py [--json saida.json]
"""
import collections
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / "app"

ARQUIVOS = [
    ("espanhol", "MemoriaHack_Espanhol_Claro_v2.html", "memoriahack.v1"),
    ("ingles", "Ingles_Curso_Completo_Claro_v2.html", "mh_en_full_v3"),
    ("frances", "Frances_Curso_Completo.html", "mh_fr_full"),
]

MARCADORES = [
    "checarFluxo", "avisoDia", "modalRev", 'class="bnd"',
    "Praticar a fala", "Vencem em 24h", "Só <b>uma</b>", "/preview",
]


def dataset(html):
    m = re.search(r'<script[^>]*id="DATA"[^>]*>(.*?)</script>', html, re.S)
    if not m:
        raise SystemExit("script #DATA não encontrado")
    return json.loads(m.group(1))


def questoes(d):
    if "lessons" in d:                       # espanhol
        return [q for l in d["lessons"] for q in l.get("quiz", [])], len(d["lessons"])
    blocos = [b for u in d["units"] for b in u.get("blocos", [])]
    return [q for b in blocos for q in b.get("quiz", [])], len(blocos)


def audio(cards):
    return sum(1 for c in cards if c.get("mp3") or c.get("aud") or c.get("audio"))


def auditar(nome, arquivo):
    p = APP / arquivo
    html = p.read_text(encoding="utf-8", errors="replace")
    d = dataset(html)
    cards = d.get("cards", [])
    qs, n_blocos = questoes(d)
    chave_gabarito = "a" if qs and "a" in qs[0] else "c"
    gab = collections.Counter(q.get(chave_gabarito) for q in qs)
    tipos = collections.Counter(
        re.sub("<[^>]+>", "", q.get("q", ""))[:24] for q in qs
    )
    exames = [
        {
            "nivel": e.get("lv"),
            "questoes": len(e.get("qs", [])) or sum(len(s.get("qs", [])) for s in e.get("secs", [])),
            "secoes": [s.get("k") for s in e.get("secs", [])],
        }
        for e in d.get("exams", [])
    ]
    return {
        "arquivo": arquivo,
        "bytes": p.stat().st_size,
        "md5": hashlib.md5(p.read_bytes()).hexdigest(),
        "titulo": (re.findall(r"<title>(.*?)</title>", html) or [""])[0],
        "unidades": len(d.get("units", [])),
        "aulas_ou_blocos": n_blocos,
        "cartas": len(cards),
        "cartas_com_audio": audio(cards),
        "cartas_bad": sum(1 for c in cards if c.get("bad") or c.get("noquiz")),
        "questoes": len(qs),
        "gabarito": dict(sorted((str(k), v) for k, v in gab.items())),
        "tipos_de_questao": dict(tipos.most_common(8)),
        "exames": exames,
        "lives": sum(len(u.get("lives", {}) or {}) for u in d.get("units", [])),
        "marcadores": {m: html.count(m) for m in MARCADORES},
    }


def main():
    resultado = {}
    for nome, arquivo, _chave in ARQUIVOS:
        r = auditar(nome, arquivo)
        resultado[nome] = r
        print(f"\n=== {nome} — {r['titulo']} ({r['bytes']:,} B) ===")
        print(f"  unidades={r['unidades']}  aulas/blocos={r['aulas_ou_blocos']}  "
              f"cartas={r['cartas']} (áudio {r['cartas_com_audio']}, bad/noquiz {r['cartas_bad']})")
        print(f"  questões={r['questoes']}  gabarito={r['gabarito']}  lives={r['lives']}")
        print(f"  exames={[(e['nivel'], e['questoes']) for e in r['exames']]}")
        print(f"  md5={r['md5']}")
        print("  marcadores: " + ", ".join(f"{k}={v}" for k, v in r["marcadores"].items()))
        print("  tipos: " + "; ".join(f"{k}: {v}" for k, v in list(r["tipos_de_questao"].items())[:5]))

    if "--json" in sys.argv:
        i = sys.argv.index("--json")
        out = Path(sys.argv[i + 1])
        out.write_text(json.dumps(resultado, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"\nJSON salvo em {out}")


if __name__ == "__main__":
    main()
