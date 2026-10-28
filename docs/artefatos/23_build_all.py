#!/usr/bin/env python3
"""Monta o dataset completo do curso de francês: 30 unidades, todos os blocos.
Adaptado de ingles/build_all.py — mesma arquitetura, nomenclatura francesa."""
import json,re,os,unicodedata

a=json.load(open("arvore_raw.json"))
units_idx=json.load(open("units_idx.json"))
cont=json.load(open("conteudo_aulas.json"))

def norm(s):
    s=unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+','',s)

# ---------- classificação de bloco ----------
def tipo_de(nome):
    n=re.sub(r'^\d+[A-Z]?_','',nome).lower()
    if n.startswith('calendrier'):        return 'cronograma'
    if n.startswith('cours_d_ouverture'): return 'aula'
    if n.startswith('memhack'):           return 'plataforma'
    if n.startswith('conversation_native'):return 'conversacao'
    if n.startswith('grammaire'):         return 'gramatica'
    if n.startswith('faq_francais'):      return 'cotidiano'
    if n.startswith('conjugaison'):       return 'conjugacao'
    if n.startswith('dis_moi'):           return 'expressoes'
    if n.startswith('minicours_prononciation'): return 'pronuncia'
    if n.startswith('ftd'):               return 'ftd'
    if n.startswith('on_conclut'):        return 'revisao'
    if n.startswith('journal_de_bord'):   return 'diario'
    if n.startswith('revision'):          return 'revisao'
    if n.startswith('exercices'):         return 'pratica'
    if n.startswith('encerramento'):      return 'despedida'
    return 'aula'

TCARD={'conversacao':'conversation','gramatica':'grammaire','conjugacao':'conjugaison',
       'cotidiano':'quotidien','expressoes':'dismoi','pronuncia':'prononciation'}

def bonito(nome):
    s=re.sub(r'^\d+[A-Z]?_','',nome).replace('_',' ').strip()
    s=re.sub(r'\bGP1\b','en Pratique 1',s)
    s=re.sub(r'\bGP2\b','en Pratique 2',s)
    s=re.sub(r'\bFAQ Francais Au Quotidien\b','Le Français Au Quotidien',s)
    s=re.sub(r'\bCours d ouverture\b',"Cours d'ouverture",s)
    s=re.sub(r'\bDis moi\b','Dis-moi',s)
    s=re.sub(r'\bFTD\b','Fast Thinking Drill',s)
    s=re.sub(r'\bMinicours Prononciation\b','Minicours de Prononciation',s)
    s=re.sub(r'\bJournal de bord\b','Journal de bord',s)
    return s

# ---------- índice do conteúdo extraído ----------
cont_idx={}
for k,v in cont.items():
    cont_idx[k]=v

MORCEAU={'#02 Morceau 01':'Morceau 01','#03 Morceau 02':'Morceau 02'}

out_units=[]; all_cards=[]
for U in units_idx:
    path=U["path"]
    blocos=[]
    nomes=sorted({i["nome"] for i in a[path] if i["folder"] and re.match(r'\d+[A-Z]?_',i["nome"])},
                 key=lambda s:(int(re.match(r'(\d+)',s).group(1)), s))
    for bn in nomes:
        num=re.match(r'(\d+[A-Z]?)_',bn).group(1)
        base=path+"/"+bn
        mid={}
        for cam,its in a.items():
            m=re.match(re.escape(base)+r'/([^/]+)$',cam)
            if not m: continue
            arqs=[{"n":i["nome"],"id":i["id"]} for i in its if not i["folder"]]
            if arqs: mid[m.group(1).lower()]=arqs
        soltos=[{"n":i["nome"],"id":i["id"]} for i in a.get(base,[]) if not i["folder"]]

        c=cont_idx.get(base+"/HTML",{})
        frases=[dict(f) for f in c.get("frases",[])]

        # casa frases <-> mp3 de Frases/
        mp3={}
        for x in mid.get("frases",[]):
            mm=re.match(r'^(\d{1,2})[._\-]',x["n"])
            if mm: mp3[int(mm.group(1))]={"id":x["id"],"nome":x["n"]}
        if frases and mp3:
            for f in frases:
                d=mp3.get(f["n"])
                if d: f["mp3"]=d["id"]

        tp=tipo_de(bn)
        pdfs=[x for x in mid.get("pdf",[])]+[x for x in soltos if x["n"].lower().endswith(".pdf")]
        blocos.append({
            "num":num,"nome":bonito(bn),"tipo":tp,
            "teoria":c.get("teoria",""),
            "frases":frases,
            "video":(mid.get("video") or [{}])[0].get("id"),
            "audio_aula":(mid.get("audio") or [{}])[0].get("id"),
            "dialogo":mid.get("audio_dialogo") or [],
            "deck":mid.get("master_deck") or [],
            "pdf":pdfs,
            "quiz":[],
        })
    uid=re.sub(r'[^a-z0-9]+','_',U["nome"].lower()).strip('_')
    for b in blocos:
        for f in b["frases"]:
            all_cards.append({"id":f"{uid}_{b['num']}_{f['n']:02d}",
                "fr":f["en"],"pt":f["pt"],"mp3":f.get("mp3"),
                "u":uid,"blk":b["num"],"src":b["nome"],
                "t":TCARD.get(b["tipo"],"outro")})
    out_units.append({
        "id":uid,"nome":U["nome"],"mission":MORCEAU.get(U["morceau"],U["morceau"]),
        "ord":U["ord"],"blocos":blocos,
    })

ds={"curso":"frances","units":out_units,"cards":all_cards,
    "folder":"1KA4mMyEpO_ZTPk5J0lulnO9-IVYrNs7S"}
json.dump(ds,open("dataset_full.json","w"),ensure_ascii=False)
nb=sum(len(u["blocos"]) for u in out_units)
print(f"units: {len(out_units)}  blocos: {nb}  cartas: {len(all_cards)}  com mp3: {sum(1 for c in all_cards if c['mp3'])}")
print(f"com teoria: {sum(1 for u in out_units for b in u['blocos'] if b['teoria'])}")
print(f"com video: {sum(1 for u in out_units for b in u['blocos'] if b['video'])}")
print(f"com pdf: {sum(1 for u in out_units for b in u['blocos'] if b['pdf'])}")
print(f"com audio: {sum(1 for u in out_units for b in u['blocos'] if b['audio_aula'])}")
print(f"bytes: {os.path.getsize('dataset_full.json'):,}")
