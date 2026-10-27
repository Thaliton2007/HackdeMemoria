#!/usr/bin/env python3
"""Gerador de testes de aula — padrão do curso de espanhol.

O espanhol tinha 9,4 questões por aula em 5 tipos; inglês e francês tinham 5
em 4 tipos. Este script equipara os dois, com os mesmos tipos de enunciado do
espanhol mais duas adições que o acervo permite:
  · sequência no diálogo ("o que vem logo depois")
  · compreensão auditiva (quando a frase tem MP3)

Uso:  python3 gen_quiz_v2.py <dataset.json> <idioma>
      idioma: "inglês" | "francês"
"""
import json,re,random,sys,unicodedata

CAMINHO=sys.argv[1]
IDIOMA=sys.argv[2]
ALVO=8           # meta de questões por aula (o espanhol tem 9,4 de média)
random.seed(20260925)

d=json.load(open(CAMINHO))

STOP_EN={'the','a','an','of','to','in','on','at','is','are','was','were','be','and','or',
  'i','you','he','she','it','we','they','my','your','his','her','our','their','this',
  'that','for','with','do','does','did','not','no','so','as','by','from','have','has'}
STOP_FR={'le','la','les','un','une','des','de','du','au','aux','et','ou','que','qui','ne','pas',
  'je','tu','il','elle','on','nous','vous','ils','elles','me','te','se','mon','ma','mes',
  'ton','ta','tes','son','sa','ses','notre','votre','leur','ce','cet','cette','ces','est',
  'sont','pour','avec','dans','sur','par','plus','tres','bien','oui','non','a','en','y'}
STOP = STOP_FR if IDIOMA=="francês" else STOP_EN
RX   = r"[A-Za-zÀ-ÿ'’]+" if IDIOMA=="francês" else r"[A-Za-z']+"

NO={'cronograma','plataforma','diario','apoio','dialogo','despedida','ftd','pratica'}

def esc(s): return (s or '').replace('<','&lt;').replace('>','&gt;')
def limpa(s): return re.sub(r'\s+',' ',(s or '')).strip()

def chave(t):
    ws=re.findall(RX,t)
    c=[w for w in ws if w.lower().strip("'’") not in STOP and len(w)>2]
    return max(c,key=len) if c else (ws[0] if ws else None)

def frase_teoria(teoria):
    ps=[limpa(p) for p in re.split(r'(?<=[.!?])\s+',teoria) if 60<len(limpa(p))<240]
    ps=[p for p in ps if not re.search(r'clicando AQUI|material de apoio|download|comunidade|Add deck',p,re.I)]
    return ps[0] if ps else None

def distintos(alvo,pool,campo,n=3):
    vis={alvo[campo]}; out=[]
    for c in pool:
        if c.get(campo) and c[campo] not in vis:
            vis.add(c[campo]); out.append(c)
    random.shuffle(out); return out[:n]

# ---------------- geradores ----------------
def q_como_se_diz(f,pool,**kw):
    ds=distintos(f,pool,"en",3)
    if len(ds)<3: return None
    o=[f]+ds; random.shuffle(o)
    return {"q":f"Como se diz em {IDIOMA}:<br><b>“{esc(f['pt'])}”</b>",
      "o":[esc(x["en"]) for x in o],"c":o.index(f),
      "e":f"<b>{esc(f['en'])}</b> — “{esc(f['pt'])}”."}

def q_significado(f,pool,**kw):
    ds=distintos(f,pool,"pt",3)
    if len(ds)<3: return None
    o=[f]+ds; random.shuffle(o)
    return {"q":f"O que significa:<br><b>“{esc(f['en'])}”</b>",
      "o":[esc(x["pt"]) for x in o],"c":o.index(f),
      "e":f"“{esc(f['pt'])}”."}

def q_lacuna(f,pool,**kw):
    alvo=chave(f["en"])
    if not alvo or len(alvo)<3: return None
    buraco=re.sub(r'(?<!\w)'+re.escape(alvo)+r'(?!\w)','______',f["en"],count=1)
    if '______' not in buraco: return None
    outras=[chave(x["en"]) for x in pool if x["en"]!=f["en"]]
    outras=[w for w in dict.fromkeys(outras) if w and w.lower()!=alvo.lower()]
    if len(outras)<3: return None
    o=[alvo]+random.sample(outras,3); random.shuffle(o)
    return {"q":f"Complete a frase da aula:<br><b>{esc(buraco)}</b>"
              f"<br><span style=\"color:var(--tx3)\">“{esc(f['pt'])}”</span>",
      "o":[esc(x) for x in o],"c":o.index(alvo),
      "e":f"A frase completa é <b>{esc(f['en'])}</b>."}

def q_sequencia(f,pool,seq=None,**kw):
    """O que vem logo depois — só faz sentido em bloco de diálogo/conversa."""
    if not seq: return None
    i=seq.index(f) if f in seq else -1
    if i<0 or i+1>=len(seq): return None
    prox=seq[i+1]
    ds=distintos(prox,pool,"en",3)
    if len(ds)<3: return None
    o=[prox]+ds; random.shuffle(o)
    return {"q":f"No diálogo, o que vem logo depois de:<br><b>“{esc(f['en'])}”</b>",
      "o":[esc(x["en"]) for x in o],"c":o.index(prox),
      "e":f"A resposta é <b>{esc(prox['en'])}</b> — “{esc(prox['pt'])}”."}

def q_audio(f,pool,**kw):
    if not f.get("mp3"): return None
    ds=distintos(f,pool,"en",3)
    if len(ds)<3: return None
    o=[f]+ds; random.shuffle(o)
    return {"q":"Ouça e escolha a frase que você acabou de ouvir:",
      "o":[esc(x["en"]) for x in o],"c":o.index(f),"mp3":f["mp3"],
      "e":f"<b>{esc(f['en'])}</b> — “{esc(f['pt'])}”."}

# ---------------- banco de afirmações (distratores plausíveis) ----------------
BANCO=[]
for u in d["units"]:
    for b in u["blocos"]:
        if b["tipo"] in NO: continue
        s=frase_teoria(b.get("teoria",""))
        if s: BANCO.append(s)

def q_teoria(b):
    s=frase_teoria(b.get("teoria",""))
    if not s: return None
    pool=[t for t in BANCO if t!=s and abs(len(t)-len(s))<160]
    if len(pool)<3: return None
    o=[s]+random.sample(pool,3); random.shuffle(o)
    return {"q":f"Qual destas afirmações é a que a aula <b>{esc(b['nome'])}</b> apresenta?",
      "o":[esc(x) for x in o],"c":o.index(s),
      "e":"É o que a teoria desta aula explica — as outras são de aulas diferentes do curso."}

# ---------------- montagem ----------------
DIALOGO={'conversacao','expressoes','cotidiano'}
tot=0; comq=0; hist={}
for u in d["units"]:
    for b in u["blocos"]:
        if b["tipo"] in NO: continue
        fr=[f for f in b["frases"] if f.get("en") and f.get("pt")]
        if len(fr)<4 and len(b.get("teoria",""))<150: continue
        qs=[]
        qt=q_teoria(b)
        if qt: qs.append(qt)
        if fr:
            seq=fr if b["tipo"] in DIALOGO else None
            gers=[q_como_se_diz,q_significado,q_lacuna]
            if seq: gers.append(q_sequencia)
            if any(f.get("mp3") for f in fr): gers.append(q_audio)
            amostra=fr[:] ; random.shuffle(amostra)
            gi=0; usadas=set()
            for f in amostra:
                if len(qs)>=ALVO: break
                for _ in range(len(gers)):
                    g=gers[gi%len(gers)]; gi+=1
                    q=g(f,fr,seq=seq)
                    if q and q["q"] not in usadas:
                        usadas.add(q["q"]); qs.append(q); break
        if len(qs)>=3:
            b["quiz"]=qs[:ALVO]; tot+=len(b["quiz"]); comq+=1
            hist[len(b["quiz"])]=hist.get(len(b["quiz"]),0)+1
        else:
            b["quiz"]=[]

json.dump(d,open(CAMINHO,"w"),ensure_ascii=False)
bad=sum(1 for u in d["units"] for b in u["blocos"] for q in b["quiz"]
        if len(q["o"])!=4 or len(set(q["o"]))!=4 or not(0<=q["c"]<4))
print(f"aulas com teste: {comq}  questões: {tot}  média: {tot/comq:.1f}/aula  inválidas: {bad}")
tipos={}
for u in d["units"]:
    for b in u["blocos"]:
        for q in b["quiz"]:
            k=re.sub('<[^>]+>','',q["q"])[:26]
            tipos[k]=tipos.get(k,0)+1
print("tipos de enunciado:")
for k,v in sorted(tipos.items(),key=lambda x:-x[1])[:8]: print(f"   {v:5}x  {k}")
