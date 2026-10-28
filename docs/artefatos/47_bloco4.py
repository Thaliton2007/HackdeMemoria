#!/usr/bin/env python3
"""BLOCO 4 — questões que testam compreensão, não reconhecimento.

Acrescenta dois tipos ao gerador:

  1. ERRO PLANTADO — quatro versões da mesma frase, três com um erro que
     aprendiz de verdade comete. Testa gramática, não memória de vocabulário.
     Os erros são gerados por regras seguras: só entram quando o padrão é
     detectado sem ambiguidade (nunca "inventa" um erro duvidoso).

  2. LACUNA COM DISTRATOR SINTÁTICO — em vez de palavras aleatórias, usa
     palavras que aparecem no MESMO contexto no corpus (mesma palavra
     anterior). Assim não dá para eliminar pela gramática e é preciso saber
     de fato qual cabe ali.
"""
import re, random, collections

# ---------------------------------------------------------------- erros por idioma
def erros_fr(f):
    """Erros clássicos de quem aprende francês. Cada regra devolve (errada, motivo)."""
    out=[]
    # auxiliar errado no passé composé com verbos de movimento
    m=re.search(r'\b(je suis|il est|elle est|nous sommes|vous êtes|ils sont|elles sont)\s+(\w+é|\w+ée|\w+és|\w+ées)\b',f,re.I)
    if m: out.append((f.replace(m.group(0), {'je suis':"j'ai",'il est':'il a','elle est':'elle a',
            'nous sommes':'nous avons','vous êtes':'vous avez','ils sont':'ils ont',
            'elles sont':'elles ont'}[m.group(1).lower()]+' '+m.group(2),1),
            "verbos de movimento e pronominais usam <b>être</b>, não <b>avoir</b>"))
    # conjugação: sujeito plural com verbo no singular
    for a,b in [('nous avons','nous a'),('nous sommes','nous est'),('vous avez','vous a'),
                ('ils sont','ils est'),('elles sont','elle est'),('ils ont','il ont'),
                ('nous allons','nous va'),('vous êtes','vous est')]:
        if a in f.lower():
            i=f.lower().index(a); out.append((f[:i]+b+f[i+len(a):], "concordância entre sujeito e verbo"))
            break
    # negação incompleta
    m=re.search(r"\bne\s+(\w+)\s+pas\b",f,re.I)
    if m: out.append((f.replace(m.group(0),"ne "+m.group(1),1),
                      "a negação francesa precisa dos <b>dois</b> elementos: <i>ne… pas</i>"))
    # elisão
    m=re.search(r"\b(je|le|la|ne|de|que)\s+([aeiouéèêàhAEIOU])",f)
    if m: out.append((f.replace(m.group(0),m.group(1)+"'"+m.group(2),1) if not m.group(0)[:2].endswith("'")
                      else None,"elisão"))
    # artigo de gênero trocado
    m=re.search(r'\b(le|la)\s+(\w+)',f)
    if m: out.append((f.replace(m.group(0),('la' if m.group(1)=='le' else 'le')+' '+m.group(2),1),
                      "gênero do artigo"))
    return [(e,r) for e,r in out if e and e!=f]

def erros_en(f):
    out=[]
    # 3ª pessoa do singular sem -s
    m=re.search(r'\b(he|she|it)\s+(\w+s)\b',f,re.I)
    if m and not m.group(2).lower() in ('is','was','has','does','goes','says'):
        out.append((f.replace(m.group(0),m.group(1)+' '+m.group(2)[:-1],1),
                    "no Simple Present, <b>he/she/it</b> leva <b>-s</b> no verbo"))
    for a,b,r in [('he is','he are',"concordância do verbo <b>to be</b>"),
                  ('she is','she are',"concordância do verbo <b>to be</b>"),
                  ('they are','they is',"concordância do verbo <b>to be</b>"),
                  ('we are','we is',"concordância do verbo <b>to be</b>"),
                  ("doesn't","don't","com he/she/it a negação é <b>doesn't</b>"),
                  ('does he','do he',"com he/she/it o auxiliar é <b>does</b>")]:
        if a in f.lower():
            i=f.lower().index(a); out.append((f[:i]+b+f[i+len(a):],r)); break
    # artigo a/an
    m=re.search(r'\ban\s+([aeiou])',f,re.I)
    if m: out.append((f.replace(m.group(0),'a '+m.group(1),1),
                      "<b>an</b> antes de som de vogal, <b>a</b> antes de consoante"))
    m=re.search(r'\ba\s+([aeiou])',f,re.I)
    if m: out.append((f.replace(m.group(0),'an '+m.group(1),1),
                      "<b>an</b> antes de som de vogal, <b>a</b> antes de consoante"))
    # does + verbo com -s
    m=re.search(r'\b(does|did)\s+(\w+)\s+(\w+s)\b',f,re.I)
    if m: out.append((f.replace(m.group(0),f"{m.group(1)} {m.group(2)} {m.group(3)}s",1),
                      "depois de <b>does/did</b> o verbo fica no infinitivo"))
    return [(e,r) for e,r in out if e and e!=f]

def erros_es(f):
    out=[]
    for a,b,r in [('estoy','soy',"<b>estar</b> para estado, <b>ser</b> para característica"),
                  ('está','es',"<b>estar</b> para estado, <b>ser</b> para característica"),
                  ('tengo','tiengo',"o verbo <b>tener</b> não diptonga na 1ª pessoa"),
                  ('hay','hai',"a forma impessoal é <b>hay</b>"),
                  ('muy','mucho',"<b>muy</b> antes de adjetivo, <b>mucho</b> com substantivo")]:
        if re.search(r'\b'+a+r'\b',f,re.I):
            out.append((re.sub(r'\b'+a+r'\b',b,f,count=1,flags=re.I),r)); break
    m=re.search(r'\b(el|la)\s+(\w+)',f,re.I)
    if m: out.append((f.replace(m.group(0),('la' if m.group(1).lower()=='el' else 'el')+' '+m.group(2),1),
                      "gênero do artigo"))
    return [(e,r) for e,r in out if e and e!=f]

GERADOR={'francês':erros_fr,'inglês':erros_en,'espanhol':erros_es}

def q_erro(f,idioma,esc):
    """Quatro versões da frase: uma correta, três com erro plantado."""
    ger=GERADOR.get(idioma)
    if not ger: return None
    erros=ger(f["en"])
    if len(erros)<3: return None
    vistos={f["en"]}; sel=[]
    for e,r in erros:
        if e in vistos: continue
        vistos.add(e); sel.append((e,r))
        if len(sel)==3: break
    if len(sel)<3: return None
    op=[f["en"]]+[e for e,_ in sel]
    random.shuffle(op)
    return {"q":f"Só <b>uma</b> destas frases está correta. Qual?"
              f"<br><span style=\"color:var(--tx3)\">“{esc(f['pt'])}”</span>",
            "o":[esc(x) for x in op], "c":op.index(f["en"]),
            "e":f"A correta é <b>{esc(f['en'])}</b>. As outras trazem erros de "
                + ", ".join(r for _,r in sel) + "."}

# ---------------------------------------------------------------- contexto sintático
def indice_contexto(pool, rx):
    """Mapa: palavra anterior -> palavras que a seguem no corpus.
       Serve para escolher distratores que cabem sintaticamente na lacuna."""
    idx=collections.defaultdict(set)
    for c in pool:
        ws=re.findall(rx, c["en"])
        for i in range(1,len(ws)):
            idx[ws[i-1].lower()].add(ws[i])
    return idx
