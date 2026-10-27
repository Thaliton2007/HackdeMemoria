#!/usr/bin/env python3
"""Provões de nivelamento no modelo DELF, montados com o conteúdo real do curso.

Estrutura oficial do DELF (France Éducation International):
  4 épreuves × 25 pontos = 100
  Seuil de réussite: 50/100
  Note minimale par épreuve: 5/25 — abaixo disso é ELIMINATÓRIO mesmo com 50 no total

Implementação: 20 questões, 5 por competência, cada uma valendo 5 pontos.
  A1 -> Unités 01–06      A2 -> Unités 07–12
  B1 -> Unités 13–18      B2 -> Unités 19–24
"""
import json,re,random

random.seed(1789)
d=json.load(open("dataset_full.json"))

STOP={'le','la','les','un','une','des','de','du','au','aux','et','ou','que','qui','ne','pas',
      'je','tu','il','elle','on','nous','vous','ils','elles','me','te','se','mon','ma','mes',
      'ton','ta','tes','son','sa','ses','notre','votre','leur','ce','cet','cette','ces','est',
      'sont','pour','avec','dans','sur','par','plus','tres','bien','oui','non','a','en','y'}

def esc(s): return (s or '').replace('<','&lt;').replace('>','&gt;')
def chave(fr):
    ws=re.findall(r"[A-Za-zÀ-ÿ'’]+",fr)
    c=[w for w in ws if w.lower().strip("'’") not in STOP and len(w)>2]
    return max(c,key=len) if c else (ws[0] if ws else None)

def num_unidade(nome):
    m=re.search(r'Unité\s+(\d+)',nome)
    return int(m.group(1)) if m else None

NIVEIS=[
 {"lv":"A1","nome":"DELF A1","de":1,"ate":6,
  "desc":"Modelo <b>DELF A1 — Découverte</b>. Cobre as Unités 01 a 06: apresentar-se, "
         "verbos pronominais, presente dos verbos regulares e o cotidiano básico."},
 {"lv":"A2","nome":"DELF A2","de":7,"ate":12,
  "desc":"Modelo <b>DELF A2 — Survie</b>. Cobre as Unités 07 a 12: passado composto, "
         "futuro próximo, expressões do dia a dia e conjugações irregulares."},
 {"lv":"B1","nome":"DELF B1","de":13,"ate":18,
  "desc":"Modelo <b>DELF B1 — Seuil</b>. Cobre as Unités 13 a 18: imperfeito, subjuntivo, "
         "pronomes complementos e argumentação simples."},
 {"lv":"B2","nome":"DELF B2","de":19,"ate":24,
  "desc":"Modelo <b>DELF B2 — Avancé</b>. Cobre as Unités 19 a 24: condicional, concordância, "
         "registros de língua e expressão de ponto de vista."},
]

# agrupa as frases por faixa de unidade
POR_NIVEL={n["lv"]:[] for n in NIVEIS}
for u in d["units"]:
    nu=num_unidade(u["nome"])
    if nu is None:            # Partie I/II da Unité 01 e classes de révision
        nu=1 if "Partie" in u["nome"] else None
    if nu is None: continue
    for b in u["blocos"]:
        for f in b["frases"]:
            if not (f.get("en") and f.get("pt")): continue
            for n in NIVEIS:
                if n["de"]<=nu<=n["ate"]:
                    POR_NIVEL[n["lv"]].append({**f,"src":b["nome"],"unit":u["nome"],"tipo":b["tipo"]})

def distintos(alvo,pool,campo,n=3):
    vis={alvo[campo]}; out=[]
    for c in pool:
        if c[campo] in vis: continue
        vis.add(c[campo]); out.append(c)
    random.shuffle(out)
    return out[:n]

def montar(nivel):
    pool=POR_NIVEL[nivel["lv"]]
    comAudio=[f for f in pool if f.get("mp3")]
    qs=[]; usados=set()
    def livres():
        c=[f for f in pool if f["en"] not in usados]
        random.shuffle(c); return c

    # --- Compréhension de l'oral: 5 questões com MP3 real ---
    for f in [x for x in comAudio if x["en"] not in usados]:
        if len([q for q in qs if q["s"]=="Compréhension de l'oral"])>=5: break
        ds=distintos(f,comAudio,"en",3)
        if len(ds)<3: continue
        o=[f]+ds; random.shuffle(o); usados.add(f["en"])
        qs.append({"s":"Compréhension de l'oral","q":"Écoutez et choisissez la phrase entendue :",
          "o":[esc(x["en"]) for x in o],"c":o.index(f),"mp3":f["mp3"],
          "why":f"<b>{esc(f['en'])}</b> — “{esc(f['pt'])}”."})

    # --- Compréhension des écrits: 5 questões FR -> PT ---
    for f in livres():
        if len([q for q in qs if q["s"]=="Compréhension des écrits"])>=5: break
        ds=distintos(f,pool,"pt",3)
        if len(ds)<3: continue
        o=[f]+ds; random.shuffle(o); usados.add(f["en"])
        qs.append({"s":"Compréhension des écrits","q":f"Que signifie <b>“{esc(f['en'])}”</b> ?",
          "o":[esc(x["pt"]) for x in o],"c":o.index(f),
          "why":f"“{esc(f['pt'])}” — aula {esc(f['src'])}, {esc(f['unit'])}."})

    # --- Grammaire et conjugaison: 5 lacunas ---
    for f in livres():
        if len([q for q in qs if q["s"]=="Grammaire et conjugaison"])>=5: break
        alvo=chave(f["en"])
        if not alvo or len(alvo)<3: continue
        buraco=re.sub(r'\b'+re.escape(alvo)+r'\b','______',f["en"],count=1)
        if '______' not in buraco: continue
        outras=[chave(x["en"]) for x in pool if x["en"]!=f["en"]]
        outras=[w for w in dict.fromkeys(outras) if w and w.lower()!=alvo.lower()]
        if len(outras)<3: continue
        ds=random.sample(outras,3)
        o=[alvo]+ds; random.shuffle(o); usados.add(f["en"])
        qs.append({"s":"Grammaire et conjugaison",
          "q":f"Complétez : <b>{esc(buraco)}</b><br><span style=\"color:var(--tx3)\">“{esc(f['pt'])}”</span>",
          "o":[esc(x) for x in o],"c":o.index(alvo),
          "why":f"A frase completa é <b>{esc(f['en'])}</b>."})

    # --- Vocabulaire et expressions: 5 questões PT -> FR ---
    for f in livres():
        if len([q for q in qs if q["s"]=="Vocabulaire et expressions"])>=5: break
        ds=distintos(f,pool,"en",3)
        if len(ds)<3: continue
        o=[f]+ds; random.shuffle(o); usados.add(f["en"])
        qs.append({"s":"Vocabulaire et expressions",
          "q":f"Comment dit-on <b>“{esc(f['pt'])}”</b> en français ?",
          "o":[esc(x["en"]) for x in o],"c":o.index(f),
          "why":f"<b>{esc(f['en'])}</b> — aula {esc(f['src'])}."})

    ordem={"Compréhension de l'oral":0,"Compréhension des écrits":1,
           "Grammaire et conjugaison":2,"Vocabulaire et expressions":3}
    qs.sort(key=lambda q:ordem[q["s"]])
    return {**nivel,"qs":qs,"pontos_por_questao":5,"seuil":50,"min_epreuve":5}

exams=[montar(n) for n in NIVEIS]
d["exams"]=exams
json.dump(d,open("dataset_full.json","w"),ensure_ascii=False)

import collections
for e in exams:
    c=collections.Counter(q["s"] for q in e["qs"])
    au=sum(1 for q in e["qs"] if q.get("mp3"))
    print(f"{e['lv']:3} {e['nome']:9} {len(e['qs']):2} questões  áudio={au}  {dict(c)}")
bad=sum(1 for e in exams for q in e["qs"]
        if len(q["o"])!=4 or len(set(q["o"]))!=4 or not(0<=q["c"]<4))
print("inválidas:",bad)
