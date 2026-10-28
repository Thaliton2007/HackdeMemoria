#!/usr/bin/env python3
"""Aplica o Bloco 4 ao espanhol.

O espanhol não tinha gerador: as 1.440 questões vieram prontas no dataset, com
77,6% num único molde ("Como se diz em espanhol") e apenas 4 habilidades.
Aqui elas são regeradas a partir das cartas da própria aula, com os mesmos
7 tipos dos outros dois cursos.

Formato do espanhol: carta {es, pt} · questão {q, opts, a, why}
"""
import json, re, random, sys, collections
sys.path.insert(0, '/home/user')
from bloco4 import q_erro, indice_contexto

CAMINHO = "drive/dataset_full.json"
ALVO = 8
random.seed(20260926)
d = json.load(open(CAMINHO, encoding="utf-8"))

CARD = {c["id"]: c for c in d["cards"]}
RX = r"[A-Za-zÀ-ÿ'’]+"
STOP = {'el','la','los','las','un','una','unos','unas','de','del','al','y','o','que','no',
        'yo','tú','él','ella','usted','nosotros','vosotros','ellos','ellas','me','te','se',
        'mi','tu','su','nuestro','vuestro','este','esta','estos','estas','es','son','está',
        'están','para','con','en','por','más','muy','bien','sí','a','lo','le','les','hay'}

def esc(s): return (s or '').replace('<','&lt;').replace('>','&gt;')
def limpa(s): return re.sub(r'\s+',' ',(s or '')).strip()

def chave(t):
    ws = re.findall(RX, t)
    c = [w for w in ws if w.lower().strip("'’") not in STOP and len(w) > 2]
    return max(c, key=len) if c else (ws[0] if ws else None)

def distintos(alvo, pool, campo, n=3):
    """Distratores de tamanho parecido — não entrega a resposta pelo formato."""
    vis = {alvo[campo]}; cand = []
    for c in pool:
        if c.get(campo) and c[campo] not in vis:
            vis.add(c[campo]); cand.append(c)
    if not cand: return []
    alvo_len = len(alvo[campo])
    cand.sort(key=lambda c: abs(len(c[campo]) - alvo_len))
    perto = cand[:max(n*4, 12)]
    random.shuffle(perto)
    return perto[:n]

# ---- geradores (mesma família dos outros cursos, adaptados ao formato es/opts/a)
def q_como_se_diz(f, pool, **kw):
    ds = distintos(f, pool, "en", 3)
    if len(ds) < 3: return None
    o = [f] + ds; random.shuffle(o)
    return {"q": f"Como se diz em espanhol:<br><b>“{esc(f['pt'])}”</b>",
            "opts": [esc(x["en"]) for x in o], "a": o.index(f),
            "why": f"<b>{esc(f['en'])}</b> — “{esc(f['pt'])}”."}

def q_significado(f, pool, **kw):
    ds = distintos(f, pool, "pt", 3)
    if len(ds) < 3: return None
    o = [f] + ds; random.shuffle(o)
    return {"q": f"O que significa:<br><b>“{esc(f['en'])}”</b>",
            "opts": [esc(x["pt"]) for x in o], "a": o.index(f),
            "why": f"“{esc(f['pt'])}”."}

def q_lacuna(f, pool, ctx=None, **kw):
    alvo = chave(f["en"])
    if not alvo or len(alvo) < 3: return None
    buraco = re.sub(r'(?<!\w)' + re.escape(alvo) + r'(?!\w)', '______', f["en"], count=1)
    if '______' not in buraco: return None
    outras = []
    if ctx:
        m = re.search(r'(\S+)\s+______', buraco)
        if m:
            ant = m.group(1).lower().strip(".,!?;:¿¡")
            outras = [w for w in ctx.get(ant, ()) if w.lower() != alvo.lower() and len(w) > 2]
            random.shuffle(outras)
    if len(outras) < 3:
        extra = [chave(x["en"]) for x in pool if x["en"] != f["en"]]
        outras += [w for w in dict.fromkeys(extra)
                   if w and w.lower() != alvo.lower() and w not in outras]
    outras = [w for w in dict.fromkeys(outras) if w]
    if len(outras) < 3: return None
    o = [alvo] + outras[:3]; random.shuffle(o)
    return {"q": f"Complete a frase da aula:<br><b>{esc(buraco)}</b>"
                 f"<br><span style=\"color:var(--tx3)\">“{esc(f['pt'])}”</span>",
            "opts": [esc(x) for x in o], "a": o.index(alvo),
            "why": f"A frase completa é <b>{esc(f['en'])}</b>."}

def q_sequencia(f, pool, seq=None, **kw):
    if not seq: return None
    i = seq.index(f) if f in seq else -1
    if i < 0 or i + 1 >= len(seq): return None
    prox = seq[i+1]
    if prox["en"] == f["en"]: return None
    cand = [x for x in pool if x["en"] != prox["en"] and x["en"] != f["en"]]
    ds = distintos(prox, cand, "en", 3)
    if len(ds) < 3: return None
    o = [prox] + ds; random.shuffle(o)
    return {"q": f"No diálogo, o que vem logo depois de:<br><b>“{esc(f['en'])}”</b>",
            "opts": [esc(x["en"]) for x in o], "a": o.index(prox),
            "why": f"A resposta é <b>{esc(prox['en'])}</b> — “{esc(prox['pt'])}”."}

def q_erro_es(f, pool, tipo=None, **kw):
    q = q_erro(f, "espanhol", esc, tipo)
    if not q: return None
    return {"q": q["q"], "opts": q["o"], "a": q["c"], "why": q["e"]}

# ---- equilíbrio (mesmas regras dos outros cursos)
def equilibrar(qs, semente=0):
    if not qs: return qs
    rnd = random.Random(semente); alvos = []
    while len(alvos) < len(qs):
        bl = [0,1,2,3]; rnd.shuffle(bl); alvos += bl
    for q, pos in zip(qs, alvos[:len(qs)]):
        if len(q.get("opts", [])) != 4: continue
        certa = q["opts"][q["a"]]
        resto = [o for i, o in enumerate(q["opts"]) if i != q["a"]]
        q["opts"] = resto[:pos] + [certa] + resto[pos:]; q["a"] = pos
    return qs

def antiRun(qs):
    for i in range(2, len(qs)):
        if len(qs[i].get("opts", [])) != 4: continue
        if qs[i]["a"] == qs[i-1]["a"] == qs[i-2]["a"]:
            livres = [p for p in range(4) if p != qs[i]["a"]]
            pos = livres[i % len(livres)]
            certa = qs[i]["opts"][qs[i]["a"]]
            resto = [o for k, o in enumerate(qs[i]["opts"]) if k != qs[i]["a"]]
            qs[i]["opts"] = resto[:pos] + [certa] + resto[pos:]; qs[i]["a"] = pos

# ---- montagem
DIALOGO = {'dialogo'}
tot = comq = 0
for l in d["lessons"]:
    fr = []
    for cid in l.get("cards", []):
        c = CARD.get(cid)
        if c and c.get("es") and c.get("pt"):
            fr.append({"en": c["es"], "pt": c["pt"], "n": len(fr)+1})
    if len(fr) < 4:
        continue                      # aula sem cartas suficientes mantém o quiz atual
    ctx = indice_contexto(fr, RX)
    seq = fr if l.get("t") in DIALOGO or l.get("mod") == "dialogo" else None
    gers = [q_como_se_diz, q_significado, q_lacuna,
            lambda f, p, **k: q_erro_es(f, p, l.get("mod"))]
    if seq: gers.append(q_sequencia)
    amostra = fr[:]; random.shuffle(amostra)
    qs = []; usadas = set(); gi = 0
    COTA = {'q_como_se_diz': 2, 'q_significado': 2}
    feitos = collections.Counter()
    for f in amostra:
        if len(qs) >= ALVO: break
        for _ in range(len(gers)):
            g = gers[gi % len(gers)]; gi += 1
            nome = getattr(g, '__name__', 'erro')
            if nome in COTA and feitos[nome] >= COTA[nome]: continue
            q = g(f, fr, seq=seq, ctx=ctx)
            if q and q["q"] not in usadas:
                usadas.add(q["q"]); qs.append(q); feitos[nome] += 1; break
    if len(qs) >= 3:
        l["quiz"] = qs[:ALVO]; tot += len(l["quiz"]); comq += 1

# equilíbrio por TIPO, globalmente
def tipo(q):
    t = re.sub('<[^>]+>', '', q["q"])
    if 'destas frases está correta' in t: return 'erro'
    if 'Como se diz' in t: return 'traducao'
    if 'O que significa' in t: return 'significado'
    if 'Complete a frase' in t: return 'lacuna'
    if 'vem logo depois' in t: return 'sequencia'
    return 'outro'
grupos = {}
for l in d["lessons"]:
    for q in l.get("quiz", []):
        grupos.setdefault(tipo(q), []).append(q)
for k in sorted(grupos): equilibrar(grupos[k], 4242)
for l in d["lessons"]:
    if l.get("quiz"): antiRun(l["quiz"])

json.dump(d, open(CAMINHO, "w", encoding="utf-8"), ensure_ascii=False)

qs = [q for l in d["lessons"] for q in l.get("quiz", [])]
c = collections.Counter(tipo(q) for q in qs)
g = collections.Counter(q["a"] for q in qs); n = len(qs)
print(f"aulas com teste: {comq}  questões: {len(qs)}  média: {len(qs)/comq:.1f}/aula")
for k, v in c.most_common(): print(f"   {v:5} ({v/n*100:4.1f}%)  {k}")
print("   ABCD: " + "  ".join(f"{'ABCD'[i]}:{g[i]/n*100:.1f}%" for i in range(4)))
bad = sum(1 for q in qs if len(q["opts"]) != 4 or len(set(q["opts"])) != 4 or not (0 <= q["a"] < 4))
print(f"   inválidas: {bad}")
