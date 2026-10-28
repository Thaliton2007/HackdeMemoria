#!/usr/bin/env python3
"""Injeta as frases do FTD (transcritas + traduzidas) no dataset como blocos com cartas.

Fontes:
  ftd_transcricao.json  -> {arquivo: {unidade, slug, id, bruto, fr}}
  ftd_traducao.json     -> {fr: pt}   (traduções feitas à mão)

Frases sem tradução são ignoradas — nunca se inventa conteúdo didático.
"""
import json,re,unicodedata,os

def norm(s):
    s=unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+','',s)

d=json.load(open("dataset_full.json"))
tr=json.load(open("ftd_transcricao.json"))
pt=json.load(open("ftd_traducao.json")) if os.path.exists("ftd_traducao.json") else {}
pt_n={norm(k):v for k,v in pt.items()}

# reaproveita traduções que já existem no acervo
for u in d["units"]:
    for b in u["blocos"]:
        for f in b["frases"]:
            if f.get("en") and f.get("pt"): pt_n.setdefault(norm(f["en"]),f["pt"])

# agrupa as transcrições por unidade
porU={}
for arq,v in tr.items():
    porU.setdefault(v["unidade"],[]).append(v)

uid_de={}
for u in d["units"]: uid_de[u["nome"]]=u

novas=0; sem=0; blocos=0
for unidade,itens in porU.items():
    u=uid_de.get(unidade)
    if not u: continue
    b=next((x for x in u["blocos"] if x["tipo"]=="ftd"),None)
    if not b: continue
    itens.sort(key=lambda x:int(re.match(r'(\d+)',x["slug"]).group(1)) if re.match(r'(\d+)',x["slug"]) else 0)
    frases=[]; n=0
    for it in itens:
        t=pt_n.get(norm(it["fr"]))
        if not t: sem+=1; continue
        n+=1
        frases.append({"n":n,"en":it["fr"],"pt":t,"mp3":it["id"]})
    if frases:
        b["frases"]=frases; blocos+=1; novas+=len(frases)

# regenera as cartas do dataset inteiro
TCARD={'conversacao':'conversation','gramatica':'grammaire','conjugacao':'conjugaison',
       'cotidiano':'quotidien','expressoes':'dismoi','pronuncia':'prononciation','ftd':'ftd'}
cards=[]
for u in d["units"]:
    uid=u["id"]
    for b in u["blocos"]:
        for f in b["frases"]:
            if not (f.get("en") and f.get("pt")): continue
            cards.append({"id":f"{uid}_{b['num']}_{f['n']:02d}",
              "fr":f["en"],"pt":f["pt"],"mp3":f.get("mp3"),
              "u":uid,"blk":b["num"],"src":b["nome"],
              "t":TCARD.get(b["tipo"],"outro")})
d["cards"]=cards
json.dump(d,open("dataset_full.json","w"),ensure_ascii=False)
print(f"blocos FTD preenchidos: {blocos}")
print(f"frases FTD adicionadas: {novas}  (sem tradução, ignoradas: {sem})")
print(f"TOTAL de cartas: {len(cards)}  com áudio: {sum(1 for c in cards if c['mp3'])}")
