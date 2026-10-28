#!/usr/bin/env python3
"""Provões no formato rico do curso de espanhol.

O espanhol traz, por nível: lv, nome ("A1 · Acceso"), prox, desc, foco, band
e 4 seções nomeadas com instrução própria (secs[].k/n/i/qs) — 25 questões.
Inglês e francês tinham uma lista plana. Este script equipara os dois,
preservando o modelo de exame de cada idioma.

Uso: python3 gen_exams_v2.py <dataset.json> <curso>
     curso: "ingles" | "frances"
"""
import json,re,random,sys,collections

CAMINHO=sys.argv[1]; CURSO=sys.argv[2]
random.seed(1789 if CURSO=="frances" else 4242)
d=json.load(open(CAMINHO))

STOP_EN={'the','a','an','of','to','in','on','at','is','are','was','were','be','and','or',
  'i','you','he','she','it','we','they','my','your','his','her','our','their','this',
  'that','for','with','do','does','did','not','no','so','as','by','from','have','has'}
STOP_FR={'le','la','les','un','une','des','de','du','au','aux','et','ou','que','qui','ne','pas',
  'je','tu','il','elle','on','nous','vous','ils','elles','me','te','se','mon','ma','mes',
  'ton','ta','tes','son','sa','ses','notre','votre','leur','ce','cet','cette','ces','est',
  'sont','pour','avec','dans','sur','par','plus','tres','bien','oui','non','a','en','y'}

if CURSO=="frances":
    STOP=STOP_FR; RX=r"[A-Za-zÀ-ÿ'’]+"; IDIOMA="francês"
    MODELO="DELF"; SEUIL=50; MIN_EP=5; TOTAL_Q=24
    NIVEIS=[
     {"lv":"A1","nome":"A1 · Découverte","prox":"A2","de":1,"ate":6,
      "desc":"Você entende e usa expressões cotidianas e frases simples: apresentar-se, "
             "falar da rotina e pedir informações básicas.",
      "foco":"Présent, verbes pronominaux, articles, être/avoir, questions simples"},
     {"lv":"A2","nome":"A2 · Survie","prox":"B1","de":7,"ate":12,
      "desc":"Você se comunica em tarefas simples e habituais, descreve seu passado "
             "e fala de planos próximos.",
      "foco":"Passé composé, imparfait, futur proche, impératif, verbes irréguliers"},
     {"lv":"B1","nome":"B1 · Seuil","prox":"B2","de":13,"ate":18,
      "desc":"Você se vira na maioria das situações de viagem, conta experiências "
             "e justifica opiniões brevemente.",
      "foco":"Subjonctif, futur simple, conditionnel, pronoms compléments"},
     {"lv":"B2","nome":"B2 · Avancé","prox":None,"de":19,"ate":24,
      "desc":"Você compreende textos complexos, argumenta com clareza e se expressa "
             "com espontaneidade sobre temas abstratos.",
      "foco":"Conditionnel passé, concordance des temps, registres, nuances"},
    ]
    SECS=[
      {"k":"lecture","n":"Compréhension des écrits","i":"Leia e escolha a opção correta."},
      {"k":"grammaire","n":"Grammaire et conjugaison","i":"Complete com a forma correta."},
      {"k":"oral","n":"Compréhension de l'oral","i":"Ouça o áudio e escolha o que você entendeu."},
      {"k":"vocabulaire","n":"Vocabulaire et expressions","i":"Escolha como se diz em francês."},
    ]
else:
    STOP=STOP_EN; RX=r"[A-Za-z']+"; IDIOMA="inglês"
    MODELO="Cambridge"; SEUIL=60; MIN_EP=0; TOTAL_Q=24
    NIVEIS=[
     {"lv":"A2","nome":"A2 · Key (KET)","prox":"B1","mission":"Mission 1",
      "desc":"Você entende frases e expressões de uso frequente e se comunica em "
             "tarefas simples e rotineiras.",
      "foco":"Simple Present, verb to be, pronouns, possessives, past of be"},
     {"lv":"B1","nome":"B1 · Preliminary (PET)","prox":"B2","mission":"Mission 2",
      "desc":"Você lida com a maioria das situações de viagem, descreve experiências "
             "e justifica opiniões.",
      "foco":"Simple Past, going to/will, prepositions, comparatives, Present Perfect"},
     {"lv":"B2","nome":"B2 · First (FCE)","prox":None,"mission":"Mission 3",
      "desc":"Você compreende textos complexos, interage com fluência e argumenta "
             "sobre temas variados.",
      "foco":"Past Continuous, conditionals, passive voice, perfect tenses"},
    ]
    SECS=[
      {"k":"reading","n":"Reading & Use of English","i":"Leia e escolha a opção correta."},
      {"k":"grammar","n":"Grammar","i":"Complete com a forma correta."},
      {"k":"listening","n":"Listening","i":"Ouça o áudio e escolha o que você entendeu."},
      {"k":"vocabulary","n":"Vocabulary","i":"Escolha como se diz em inglês."},
    ]

def esc(s): return (s or '').replace('<','&lt;').replace('>','&gt;')
def chave(t):
    ws=re.findall(RX,t)
    c=[w for w in ws if w.lower().strip("'’") not in STOP and len(w)>2]
    return max(c,key=len) if c else (ws[0] if ws else None)
def num_unidade(nome):
    m=re.search(r'(?:Unité|Unit)\s+(\d+)',nome)
    return int(m.group(1)) if m else (1 if re.search(r'Part(ie)?\s',nome) else None)

# ---- monta o pool de cada nível ----
POOL={n["lv"]:[] for n in NIVEIS}
for u in d["units"]:
    for b in u["blocos"]:
        for f in b["frases"]:
            if not (f.get("en") and f.get("pt")): continue
            it={**f,"src":b["nome"],"unit":u["nome"],"tipo":b["tipo"]}
            if CURSO=="frances":
                nu=num_unidade(u["nome"])
                if nu is None: continue
                for n in NIVEIS:
                    if n["de"]<=nu<=n["ate"]: POOL[n["lv"]].append(it)
            else:
                for n in NIVEIS:
                    if u.get("mission")==n["mission"]: POOL[n["lv"]].append(it)

def distintos(alvo,pool,campo,n=3):
    vis={alvo[campo]}; out=[]
    for c in pool:
        if c.get(campo) and c[campo] not in vis:
            vis.add(c[campo]); out.append(c)
    random.shuffle(out); return out[:n]

def montar(nv):
    pool=POOL[nv["lv"]]
    porSec=TOTAL_Q//4
    usados=set()
    def livres():
        c=[f for f in pool if f["en"] not in usados]; random.shuffle(c); return c
    secs=[]
    for sec in SECS:
        qs=[]
        if sec["k"] in ("oral","listening"):
            cand=[f for f in pool if f.get("mp3") and f["en"] not in usados]
            random.shuffle(cand)
            for f in cand:
                if len(qs)>=porSec: break
                ds=distintos(f,[x for x in pool if x.get("mp3")],"en",3)
                if len(ds)<3: continue
                o=[f]+ds; random.shuffle(o); usados.add(f["en"])
                qs.append({"q":"Ouça o áudio e escolha a frase correta:","opts":[esc(x["en"]) for x in o],
                  "a":o.index(f),"mp3":f["mp3"],"sk":sec["k"],
                  "why":f"<b>{esc(f['en'])}</b> — “{esc(f['pt'])}”."})
        elif sec["k"] in ("grammaire","grammar"):
            for f in livres():
                if len(qs)>=porSec: break
                alvo=chave(f["en"])
                if not alvo or len(alvo)<3: continue
                buraco=re.sub(r'(?<!\w)'+re.escape(alvo)+r'(?!\w)','______',f["en"],count=1)
                if '______' not in buraco: continue
                outras=[chave(x["en"]) for x in pool if x["en"]!=f["en"]]
                outras=[w for w in dict.fromkeys(outras) if w and w.lower()!=alvo.lower()]
                if len(outras)<3: continue
                o=[alvo]+random.sample(outras,3); random.shuffle(o); usados.add(f["en"])
                qs.append({"q":f"Complete:<br><b>{esc(buraco)}</b>"
                             f"<br><span style='color:var(--tx3)'>“{esc(f['pt'])}”</span>",
                  "opts":[esc(x) for x in o],"a":o.index(alvo),"sk":sec["k"],
                  "why":f"A frase completa é <b>{esc(f['en'])}</b>."})
        elif sec["k"] in ("lecture","reading"):
            for f in livres():
                if len(qs)>=porSec: break
                ds=distintos(f,pool,"pt",3)
                if len(ds)<3: continue
                o=[f]+ds; random.shuffle(o); usados.add(f["en"])
                qs.append({"q":f"Leia e escolha o significado correto:<br>"
                             f"<span style='color:var(--es);font-size:18px'>“{esc(f['en'])}”</span>",
                  "opts":[esc(x["pt"]) for x in o],"a":o.index(f),"sk":sec["k"],
                  "why":f"“{esc(f['pt'])}” — aula {esc(f['src'])}, {esc(f['unit'])}."})
        else:  # vocabulário: PT -> alvo
            for f in livres():
                if len(qs)>=porSec: break
                ds=distintos(f,pool,"en",3)
                if len(ds)<3: continue
                o=[f]+ds; random.shuffle(o); usados.add(f["en"])
                qs.append({"q":f"Como se diz em {IDIOMA}:<br><b>“{esc(f['pt'])}”</b>",
                  "opts":[esc(x["en"]) for x in o],"a":o.index(f),"sk":sec["k"],
                  "why":f"<b>{esc(f['en'])}</b> — aula {esc(f['src'])}."})
        secs.append({**sec,"qs":qs})
    total=sum(len(s["qs"]) for s in secs)
    return {**{k:v for k,v in nv.items() if k not in ("de","ate","mission")},
            "secs":secs,"total":total,"modelo":MODELO,"seuil":SEUIL,"min_epreuve":MIN_EP,
            "qs":[{"s":s["n"],"q":q["q"],"o":q["opts"],"c":q["a"],
                   **({"mp3":q["mp3"]} if q.get("mp3") else {}),"why":q["why"]}
                  for s in secs for q in s["qs"]]}

exams=[montar(n) for n in NIVEIS]
d["exams"]=exams
json.dump(d,open(CAMINHO,"w"),ensure_ascii=False)
for e in exams:
    det=" · ".join(f"{s['n'][:22]}:{len(s['qs'])}" for s in e["secs"])
    au=sum(1 for q in e["qs"] if q.get("mp3"))
    print(f"  {e['lv']:3} {e['nome']:24} {e['total']:2}q  áudio={au}  {det}")
bad=sum(1 for e in exams for q in e["qs"] if len(q["o"])!=4 or len(set(q["o"]))!=4 or not(0<=q["c"]<4))
print("  inválidas:",bad)
