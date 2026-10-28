#!/usr/bin/env python3
# -*- coding: utf-8 -*-
r"""
SCAN DE ESTRUTURA + CONTEÚDO — Curso de Francês v1.0
====================================================
MODO 100% SOMENTE-LEITURA: NÃO move, NÃO renomeia, NÃO apaga NADA.
Ele apenas varre a pasta onde está e gera DOIS arquivos .txt:

  1) RELATORIO_ESTRUTURA_FR.txt
       Mapa real do download: pastas, contagens, tamanhos, amostras
       de nomes de arquivos, maiores arquivos, ZIPs etc.

  2) RELATORIO_CONTEUDO_FR.txt
       Para CADA .html encontrado: caminho + <title> + primeiros
       cabeçalhos (h1/h2/h3). É a "leitura" dos HTMLs sem abrir nada.

COMO USAR (Windows):
  1. Baixe a pasta do curso do Google Drive e EXTRAIA os ZIPs.
  2. Coloque ESTE arquivo na RAIZ da pasta baixada
     (ex.: D:\CURSOS\Frances — a pasta que contém as subpastas do curso).
  3. Dê duplo clique  OU  rode:   py SCAN_ESTRUTURA_FR.py
  4. Anexe AQUI NO CHAT os dois .txt gerados na mesma pasta.

(Opcional: `py SCAN_ESTRUTURA_FR.py D:\CURSOS\Frances` para apontar outra pasta)
"""
import os, re, sys, unicodedata, html as _html
from pathlib import Path
from datetime import datetime

VERSAO    = "v1.0"
ARQ_MAPA  = "RELATORIO_ESTRUTURA_FR.txt"
ARQ_HTML  = "RELATORIO_CONTEUDO_FR.txt"

EXT_MAP = {".mp4": "mp4", ".mp3": "mp3", ".pdf": "pdf", ".html": "html",
           ".zip": "zip", ".rar": "rar", ".7z": "7z", ".m4a": "m4a",
           ".wav": "wav", ".txt": "txt", ".srt": "srt", ".vtt": "vtt"}

MAX_AMOSTRA   = 6        # amostras de nomes por pasta
MAX_D2        = 60       # subpastas nível 2 listadas por pasta nível 1
MAX_D3        = 15       # subpastas nível 3 listadas por pasta nível 2
MAX_SOLTOS    = 40       # arquivos soltos listados por nível
MAX_HTML      = 1500     # teto de HTMLs lidos no relatório de conteúdo
MAX_HTML_BYTE = 400_000  # lê no máx. os primeiros 400KB de cada HTML
TOP_MAIORES   = 25       # quantos dos maiores arquivos listar no resumo

RE_JA_ORGANIZADO = re.compile(r"^(\d{2}[A-Z]?_|HTMLs$|_ZZ_|00 - |Downloads_oficial)")

# ---------------------------------------------------------------- utilidades
def ascii_norm(s):
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", " ", s.lower()).strip()

def fmt_tam(n):
    try:
        n = int(n)
    except Exception:
        return "?"
    if n >= 1 << 30: return f"{n/(1<<30):.1f}GB"
    if n >= 1 << 20: return f"{n/(1<<20):.1f}MB"
    if n >= 1 << 10: return f"{n/(1<<10):.0f}KB"
    return f"{n}B"

_RE_TAG   = re.compile(r"<[^>]+>")
_RE_TITLE = re.compile(r"<title[^>]*>(.*?)</title>", re.I | re.S)
_RE_HEAD  = re.compile(r"<h([1234])[^>]*>(.*?)</h\1>", re.I | re.S)

def limpa_txt(s):
    s = _html.unescape(_RE_TAG.sub(" ", s))
    return re.sub(r"\s+", " ", s).strip()

def extrai_html(caminho):
    """Lê o começo do HTML e devolve (título, [cabeçalhos]). Nunca falha."""
    try:
        raw = Path(caminho).read_bytes()[:MAX_HTML_BYTE]
    except OSError as e:
        return "", [f"(erro lendo: {e})"]
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
        titulo = limpa_txt(m.group(1))[:140]
    heads, vistos = [], set()
    for mh in _RE_HEAD.finditer(txt):
        h = limpa_txt(mh.group(2))[:90]
        if h and h.lower() not in vistos:
            vistos.add(h.lower())
            heads.append(h)
        if len(heads) >= 3:
            break
    return titulo, heads

# ------------------------------------------------------------------ varredura
def varrer(pasta):
    """Conta arquivos/subpastas/extensões/tamanhos recursivamente (só leitura)."""
    info = {"arag": 0, "dirs": 0, "bytes": 0, "ext": {}, "ext_bytes": {},
            "amostras": [], "zips": [], "vazia": True, "tem_ja_organizado": False,
            "soltos_nivel1": 0}
    pasta = Path(pasta)
    try:
        entradas = list(pasta.iterdir())
    except OSError as e:
        info["erro"] = str(e)
        return info
    for e in entradas:
        if e.is_file():
            info["soltos_nivel1"] += 1
    for raiz, dirs, files in os.walk(pasta):
        dirs.sort()
        for d in dirs:
            info["dirs"] += 1
            if RE_JA_ORGANIZADO.match(d):
                info["tem_ja_organizado"] = True
        for f in sorted(files):
            info["arag"] += 1
            info["vazia"] = False
            ext = EXT_MAP.get(Path(f).suffix.lower(), "outros")
            info["ext"][ext] = info["ext"].get(ext, 0) + 1
            try:
                tam = Path(raiz, f).stat().st_size
            except OSError:
                tam = 0
            info["bytes"] += tam
            info["ext_bytes"][ext] = info["ext_bytes"].get(ext, 0) + tam
            if len(info["amostras"]) < MAX_AMOSTRA:
                info["amostras"].append((f, tam))
            if ext in ("zip", "rar", "7z"):
                info["zips"].append(str(Path(raiz, f).relative_to(pasta)))
    return info

def linha_info(info):
    if "erro" in info:
        return f"[ERRO ao ler: {info['erro']}]"
    partes = [f"{info['arag']} arq"]
    if info["dirs"]:
        partes.append(f"{info['dirs']} subpastas")
    partes.append(fmt_tam(info["bytes"]))
    exts = ", ".join(f"{k}:{v}" for k, v in sorted(info["ext"].items()))
    if exts:
        partes.append(exts)
    flags = []
    if info["vazia"]:
        flags.append("VAZIA")
    if info["tem_ja_organizado"]:
        flags.append("contém pastas JÁ-ORGANIZADAS (NN_)")
    if info["zips"]:
        flags.append(f"{len(info['zips'])} ZIP/RAR")
    if flags:
        partes.append("⚠ " + " | ".join(flags))
    return "  [ " + " · ".join(partes) + " ]"

# ------------------------------------------------------------------ relatórios
def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
    if len(sys.argv) > 1:
        base = Path(sys.argv[1]).resolve()
    else:
        base = Path(__file__).resolve().parent
    os.chdir(str(base))
    eu = Path(__file__).name

    L = []
    def add(s=""):
        L.append(s)
        print(s)

    add("=" * 70)
    add(f" RELATÓRIO DE ESTRUTURA — Curso de Francês  ({VERSAO} · SOMENTE LEITURA)")
    add(f" Data/hora: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    add(f" Pasta varrida: {base}")
    add(" ⚠ NADA foi movido, renomeado ou apagado. Só leitura.")
    add("=" * 70)

    try:
        entradas = sorted(base.iterdir(), key=lambda p: (p.is_file(), p.name.lower()))
    except OSError as e:
        add(f"\nERRO ao ler a pasta: {e}")
        sys.exit(1)
    dirs1  = [e for e in entradas if e.is_dir()]
    soltos = [e for e in entradas if e.is_file()
              and e.name not in (eu, ARQ_MAPA, ARQ_HTML)]

    # ------------------------------------------------- arquivos soltos na raiz
    add(f"\n## ARQUIVOS SOLTOS NA RAIZ: {len(soltos)}")
    for f in soltos[:MAX_SOLTOS]:
        try:
            tam = f.stat().st_size
        except OSError:
            tam = 0
        add(f"   - {f.name}  ({fmt_tam(tam)})")
    if len(soltos) > MAX_SOLTOS:
        add(f"   ... e mais {len(soltos)-MAX_SOLTOS}")

    # ------------------------------------------------- árvore nível 1/2/3
    add(f"\n## PASTAS NA RAIZ: {len(dirs1)}")
    for d1 in dirs1:
        info1 = varrer(d1)
        add(f"\n├─ {d1.name}/")
        add(f"│  {linha_info(info1)}")
        try:
            filhos = sorted([x for x in d1.iterdir() if x.is_dir()],
                            key=lambda p: p.name.lower())
        except OSError:
            filhos = []
        add(f"│  → {info1['soltos_nivel1']} soltos no nível 1 · {len(filhos)} subpastas")
        for a, t in info1["amostras"][:3]:
            add(f"│     ex.: {a}  ({fmt_tam(t)})")
        for d2 in filhos[:MAX_D2]:
            i2 = varrer(d2)
            add(f"│  ├─ {d2.name}/  {linha_info(i2)}")
            try:
                netos = sorted([x for x in d2.iterdir() if x.is_dir()],
                               key=lambda p: p.name.lower())
            except OSError:
                netos = []
            add(f"│  │   → {i2['soltos_nivel1']} soltos · {len(netos)} subpastas netas")
            for a, t in i2["amostras"][:4]:
                add(f"│  │     ex.: {a}  ({fmt_tam(t)})")
            for d3 in netos[:MAX_D3]:
                i3 = varrer(d3)
                add(f"│  │  ├─ {d3.name}/  {linha_info(i3)}")
        if len(filhos) > MAX_D2:
            add(f"│  ... e mais {len(filhos)-MAX_D2} subpastas")

    # ------------------------------------------------- varredura global
    add("\n" + "=" * 70)
    add("## RESUMO GLOBAL E AUTO-DIAGNÓSTICO")
    add("=" * 70)

    todos, htmls, zips_all = [], [], []
    tot_ext, tot_ext_bytes, tot_arq, tot_bytes = {}, {}, 0, 0
    for raiz, dirs, files in os.walk(base):
        dirs.sort()
        for f in sorted(files):
            if f in (eu, ARQ_MAPA, ARQ_HTML):
                continue
            p = Path(raiz, f)
            try:
                tam = p.stat().st_size
            except OSError:
                tam = 0
            rel = str(p.relative_to(base))
            tot_arq += 1
            tot_bytes += tam
            ext = EXT_MAP.get(p.suffix.lower(), "outros")
            tot_ext[ext] = tot_ext.get(ext, 0) + 1
            tot_ext_bytes[ext] = tot_ext_bytes.get(ext, 0) + tam
            todos.append((tam, rel))
            if ext == "html":
                htmls.append(rel)
            elif ext in ("zip", "rar", "7z"):
                zips_all.append((rel, tam))

    add(f"\n1) TOTAIS: {tot_arq} arquivos · {fmt_tam(tot_bytes)} no total")
    for ext in sorted(tot_ext, key=lambda k: -tot_ext_bytes[k]):
        add(f"   {ext:6s}: {tot_ext[ext]:5d} arq · {fmt_tam(tot_ext_bytes[ext])}")

    add(f"\n2) TOP {TOP_MAIORES} MAIORES ARQUIVOS:")
    for tam, rel in sorted(todos, reverse=True)[:TOP_MAIORES]:
        add(f"   {fmt_tam(tam):>8s}  {rel}")

    if zips_all:
        add(f"\n3) ZIPs/RARs encontrados ({len(zips_all)}):")
        for z, t in zips_all[:40]:
            add(f"   - {z}  ({fmt_tam(t)})")
    else:
        add("\n3) Nenhum ZIP/RAR solto (bom: download já extraído).")

    # pastas com palavras-chave típicas de curso
    chaves = ("welcome", "miss", "unit", "unite", "review", "revisao",
              "live", "extra", "frase", "audio", "geral", "bonus")
    hits = {}
    for d1 in dirs1:
        n = ascii_norm(d1.name)
        for c in chaves:
            if c in n:
                hits.setdefault(c, []).append(d1.name)
    add("\n4) PASTAS DA RAIZ POR PALAVRA-CHAVE:")
    if hits:
        for c, nomes in sorted(hits.items()):
            add(f"   [{c}] → {nomes}")
    else:
        add("   (nenhuma pasta da raiz bateu as palavras-chave típicas)")
    add(f"   Todas as pastas da raiz: {[d.name for d in dirs1]}")

    add("\n" + "=" * 70)
    add(f" FIM DO MAPA — anexe também o {ARQ_HTML} (conteúdo dos HTMLs).")
    add("=" * 70)

    try:
        Path(ARQ_MAPA).write_text("\n".join(L), encoding="utf-8")
        print(f"\n>>> Mapa salvo em: {ARQ_MAPA}")
    except OSError as e:
        print(f"\n>>> Não consegui salvar {ARQ_MAPA} ({e}) — copie do console.")

    # ------------------------------------------------- relatório de conteúdo
    print(f"\n>>> Lendo {len(htmls)} HTMLs para o relatório de conteúdo...")
    C = []
    def addc(s=""):
        C.append(s)
    addc("=" * 70)
    addc(f" CONTEÚDO DOS HTMLs — Curso de Francês  ({VERSAO} · SOMENTE LEITURA)")
    addc(f" Data/hora: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    addc(f" Pasta varrida: {base}")
    addc(f" HTMLs encontrados: {len(htmls)}"
         + (f" (lidos os {MAX_HTML} primeiros)" if len(htmls) > MAX_HTML else ""))
    addc(" Formato: caminho | TÍTULO: <title> | H: cabeçalho1 ~ cabeçalho2")
    addc("=" * 70)
    pasta_atual = None
    for rel in sorted(htmls, key=str.lower)[:MAX_HTML]:
        topo = rel.split(os.sep)[0] if os.sep in rel else "(raiz)"
        if topo != pasta_atual:
            pasta_atual = topo
            addc(f"\n### {topo}")
        titulo, heads = extrai_html(Path(base, rel))
        partes = [f"- {rel}"]
        partes.append(f"TÍTULO: {titulo}" if titulo else "TÍTULO: (vazio)")
        if heads:
            partes.append("H: " + " ~ ".join(heads))
        addc(" | ".join(partes))
    addc("\n" + "=" * 70)
    addc(" FIM DO CONTEÚDO — anexe este arquivo no chat junto com o mapa.")
    addc("=" * 70)
    try:
        Path(ARQ_HTML).write_text("\n".join(C), encoding="utf-8")
        for ln in C[:12]:
            print(ln)
        print(f"...\n>>> Conteúdo salvo em: {ARQ_HTML}")
    except OSError as e:
        print(f">>> Não consegui salvar {ARQ_HTML} ({e}).")

    print("\nPRONTO. Anexe os DOIS .txt aqui no chat.")

if __name__ == "__main__":
    main()
    if sys.platform == "win32":
        try:
            input("\nPressione ENTER para fechar...")
        except EOFError:
            pass
