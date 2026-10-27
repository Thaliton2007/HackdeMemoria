#!/usr/bin/env python3
"""Provões de nivelamento no modelo Cambridge, montados com o conteúdo real do curso.
 A2 Key      -> libera ao concluir a Mission 1 (Units 1.1–7)
 B1 Preliminary -> Mission 2 (Units 8–14)
 B2 First    -> Mission 3 (Units 15–21)
Estrutura por provão: 25 questões em 4 competências (como o DELE do espanhol):
 Reading & Use of English · Grammar · Vocabulary · Listening (com MP3 nativo)."""
import json,re,random

random.seed(4242)
d=json.load(open("dataset_full.json"))

STOP={'the','a','an','of','to','in','on','at','is','are','was','were','be','and','or',
      'i','you','he','she','it','we','they','my','your','his','her','our','their','this',
      'that','for','with','do','does','did','not','no','so','as','by','from','have','has'}

def esc(s): return (s or '').replace('<','&lt;').replace('>','&gt;')
def chave(en):
    ws=re.findall(r"[A-Za-z']+",en)
    c=[w for w in ws if w.lower() not in STOP and len(w)>2]
    return max(c,key=len) if c else (ws[0] if ws else None)

MISSAO={'Mission 1':[],'Mission 2':[],'Mission 3':[]}
for u in d["units"]:
    for b in u["blocos"]:
        for f in b["frases"]:
            if f.get("en") and f.get("pt"):
                MISSAO[u["mission"]].append({**f,"src":b["nome"],"unit":u["nome"],"tipo":b["tipo"]})

NIVEIS=[
 {"lv":"A2","nome":"A2 Key","mission":"Mission 1",
  "desc":"Modelo <b>Cambridge A2 Key (KET)</b>. Cobre as Units 01 a 07 — Simple Present, verb to be, pronomes, possessivos e o passado de “be”."},
 {"lv":"B1","nome":"B1 Preliminary","mission":"Mission 2",
  "desc":"Modelo <b>Cambridge B1 Preliminary (PET)</b>. Cobre as Units 08 a 14 — Simple Past, going to/will, preposições, comparativos e Present Perfect."},
 {"lv":"B2","nome":"B2 First","mission":"Mission 3",
  "desc":"Modelo <b>Cambridge B2 First (FCE)</b>. Cobre as Units 15 a 21 — Past Continuous, condicionais, voz passiva e os tempos perfeitos."},
]

def distr(alvo,pool,campo,n=3):
    vis={alvo[campo]}; out=[]
    for c in pool:
        if c[campo] in vis: continue
        vis.add(c[campo]); out.append(c)
    random.shuffle(out)
    return out[:n]

def montar(nivel):
    pool=MISSAO[nivel["mission"]]
    comAudio=[f for f in pool if f.get("mp3")]
    qs=[]
    usados=set()
    def livre(n):
        c=[f for f in pool if f["en"] not in usados]
        random.shuffle(c); return c[:n]

    # --- Reading & Use of English: 7 questões (lacuna em contexto) ---
    for f in livre(40):
        if len(qs)>=7: break
        alvo=chave(f["en"])
        if not alvo or len(alvo)<3: continue
        buraco=re.sub(r'\b'+re.escape(alvo)+r'\b','______',f["en"],count=1)
        if '______' not in buraco: continue
        outras=[chave(x["en"]) for x in pool if x["en"]!=f["en"]]
        outras=[w for w in dict.fromkeys(outras) if w and w.lower()!=alvo.lower()][:60]
        if len(outras)<3: continue
        ds=random.sample(outras,3)
        o=[alvo]+ds; random.shuffle(o)
        usados.add(f["en"])
        qs.append({"s":"Reading & Use of English","q":f"Choose the correct word: <b>{esc(buraco)}</b>",
          "o":[esc(x) for x in o],"c":o.index(alvo),
          "why":f"<b>{esc(f['en'])}</b> — “{esc(f['pt'])}” (aula: {esc(f['src'])})."})

    # --- Grammar: 6 questões (qual frase está correta) ---
    gram=[f for f in pool if f["tipo"]=="gramatica" and f["en"] not in usados]
    random.shuffle(gram)
    for f in gram:
        if len([q for q in qs if q["s"]=="Grammar"])>=6: break
        ds=distr(f,[x for x in pool if x["tipo"]=="gramatica"],"en",3)
        if len(ds)<3: continue
        o=[f]+ds; random.shuffle(o)
        usados.add(f["en"])
        qs.append({"s":"Grammar","q":f"Qual frase traduz <b>“{esc(f['pt'])}”</b>?",
          "o":[esc(x["en"]) for x in o],"c":o.index(f),
          "why":f"<b>{esc(f['en'])}</b> — aula {esc(f['src'])}, {esc(f['unit'])}."})

    # --- Vocabulary: 6 questões (EN -> PT) ---
    for f in livre(60):
        if len([q for q in qs if q["s"]=="Vocabulary"])>=6: break
        ds=distr(f,pool,"pt",3)
        if len(ds)<3: continue
        o=[f]+ds; random.shuffle(o)
        usados.add(f["en"])
        qs.append({"s":"Vocabulary","q":f"O que significa <b>“{esc(f['en'])}”</b>?",
          "o":[esc(x["pt"]) for x in o],"c":o.index(f),
          "why":f"“{esc(f['pt'])}” — aula {esc(f['src'])}."})

    # --- Listening: 6 questões com áudio real ---
    cand=[f for f in comAudio if f["en"] not in usados]
    random.shuffle(cand)
    for f in cand:
        if len([q for q in qs if q["s"]=="Listening"])>=6: break
        ds=distr(f,comAudio,"en",3)
        if len(ds)<3: continue
        o=[f]+ds; random.shuffle(o)
        usados.add(f["en"])
        qs.append({"s":"Listening","q":"Ouça e escolha a frase que você acabou de ouvir:",
          "o":[esc(x["en"]) for x in o],"c":o.index(f),"mp3":f["mp3"],
          "why":f"<b>{esc(f['en'])}</b> — “{esc(f['pt'])}”."})

    random.shuffle(qs)
    ordem={"Reading & Use of English":0,"Grammar":1,"Vocabulary":2,"Listening":3}
    qs.sort(key=lambda q:ordem[q["s"]])
    return {**nivel,"qs":qs}

exams=[montar(n) for n in NIVEIS]
d["exams"]=exams
json.dump(d,open("dataset_full.json","w"),ensure_ascii=False)
for e in exams:
    import collections
    c=collections.Counter(q["s"] for q in e["qs"])
    au=sum(1 for q in e["qs"] if q.get("mp3"))
    print(f"{e['lv']:3} {e['nome']:16} {len(e['qs'])} questões  {dict(c)}  áudio={au}")
bad=sum(1 for e in exams for q in e["qs"] if len(q["o"])!=4 or len(set(q["o"]))!=4 or not(0<=q["c"]<4))
print("inválidas:",bad)
