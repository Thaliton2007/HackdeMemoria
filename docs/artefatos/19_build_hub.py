#!/usr/bin/env python3
"""Monta o Memoria Hack — arquivo único com os dois cursos.

Arquitetura: cada curso vira um documento completo guardado como texto e
carregado num <iframe srcdoc>. Isso resolve as colisões medidas entre eles:
  - 139 IDs de elemento iguais (#DATA, #bList, #goQuick…)
  - 40 símbolos globais iguais (LESSONS, KEY, closeMore…)
  - chaves de localStorage distintas (memoriahack.v1 / mh_en_full_v3), que
    continuam separadas — o progresso de um curso não afeta o outro.
O iframe dá isolamento real sem reescrever uma linha dos dois apps.
"""
import re, os, json, html

RAIZ = "/home/user"
CURSOS = [
    {"id":"es","nome":"Español","arquivo":"MemoriaHack_Espanhol_Claro_v2.html",
     "bandeira":"🇪🇸","cor":"#0B6BCB",
     "desc":"3.540 cartas · 24 unidades · 159 aulas · provões DELE"},
    {"id":"en","nome":"English","arquivo":"Ingles_Curso_Completo_Claro_v2.html",
     "bandeira":"🇺🇸","cor":"#5F4BD8",
     "desc":"2.057 cartas · 25 units · 305 blocos · provões Cambridge"},
]

def carregar(c):
    p = os.path.join(RAIZ, c["arquivo"])
    s = open(p, encoding="utf-8").read()
    return s

# o documento vai dentro de srcdoc: só o " precisa virar &quot;
def para_srcdoc(doc):
    return doc.replace("&", "&amp;").replace('"', "&quot;")

docs = {}
for c in CURSOS:
    docs[c["id"]] = carregar(c)
    print(f"  {c['nome']}: {len(docs[c['id']])/1048576:.2f} MB")

SHELL = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Memoria Hack</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
:root{
--bg:#F4F7F6;--bg2:#FFFFFF;--bg3:#EDF2F5;--line:#E3E9ED;--line2:#CFD8DE;
--tx:#22303C;--tx2:#5A6A78;--tx3:#616D79;
--ac:#0B6BCB;--ac2:#0A5AAE;--es:#5F4BD8;
--r:16px;--sh:0 4px 20px rgba(0,0,0,.05);--sh2:0 8px 24px rgba(0,0,0,.08);
--sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,Helvetica,Arial,sans-serif}
html,body{height:100%}
body{background:var(--bg);color:var(--tx);font-family:var(--sans);font-size:16px;
display:flex;flex-direction:column;overflow:hidden;-webkit-font-smoothing:antialiased}
button{font:inherit;color:inherit;background:none;border:none;cursor:pointer}

/* ---------- barra de troca ---------- */
#bar{display:flex;align-items:center;gap:14px;padding:9px 16px;background:var(--bg2);
border-bottom:1px solid var(--line);box-shadow:0 1px 3px rgba(0,0,0,.04);flex-shrink:0;z-index:10}
#bar .marca{display:flex;align-items:center;gap:8px;font-weight:700;font-size:14.5px;
letter-spacing:-.2px;white-space:nowrap}
#bar .dot{width:10px;height:10px;border-radius:50%;background:var(--ac);
box-shadow:0 0 12px rgba(11,107,203,.5);transition:.25s}
.abas{display:flex;gap:4px;background:var(--bg3);padding:3px;border-radius:11px}
.abas button{display:flex;align-items:center;gap:7px;padding:7px 15px;border-radius:9px;
font-size:13.5px;font-weight:650;color:var(--tx2);transition:.16s;white-space:nowrap}
.abas button:hover{color:var(--tx)}
.abas button.on{background:var(--bg2);color:var(--tx);box-shadow:0 1px 4px rgba(0,0,0,.09)}
.abas button i{font-style:normal;font-size:15px;line-height:1}
#bar .sp{flex:1}
#bar .dica{font-size:12px;color:var(--tx3);white-space:nowrap}
@media(max-width:700px){
  #bar{padding:8px 11px;gap:9px}
  #bar .marca span{display:none}
  #bar .dica{display:none}
  .abas button{padding:7px 12px;font-size:13px}
}

/* ---------- área dos cursos ---------- */
#palco{flex:1;position:relative;min-height:0}
#palco iframe{position:absolute;inset:0;width:100%;height:100%;border:0;display:none;background:var(--bg)}
#palco iframe.on{display:block}
#carregando{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;
justify-content:center;gap:13px;background:var(--bg);color:var(--tx3);font-size:13.5px}
.spin{width:30px;height:30px;border:3px solid var(--line);border-top-color:var(--ac);
border-radius:50%;animation:gira .8s linear infinite}
@keyframes gira{to{transform:rotate(360deg)}}
</style>
</head>
<body>

<div id="bar">
  <div class="marca"><span class="dot" id="dot"></span>Memoria Hack</div>
  <div class="abas" id="abas">__ABAS__</div>
  <div class="sp"></div>
  <div class="dica">Cada curso guarda seu próprio progresso</div>
</div>

<div id="palco">
  <div id="carregando"><div class="spin"></div><div id="carregandoTxt">Carregando…</div></div>
</div>

__DOCS__

<script>
(function(){
'use strict';
var CURSOS = __META__;
var CHAVE  = 'memoriahack.hub.curso';
var montado = {};

var abas   = document.getElementById('abas');
var palco  = document.getElementById('palco');
var carreg = document.getElementById('carregando');
var cTxt   = document.getElementById('carregandoTxt');
var dot    = document.getElementById('dot');

function abrir(id){
  var c = null;
  for (var i=0;i<CURSOS.length;i++) if (CURSOS[i].id===id) c=CURSOS[i];
  if(!c) return;

  [].forEach.call(abas.querySelectorAll('button'), function(b){
    b.classList.toggle('on', b.dataset.c===id);
  });
  dot.style.background = c.cor;
  dot.style.boxShadow  = '0 0 12px ' + c.cor + '80';
  document.title = 'Memoria Hack · ' + c.nome;

  [].forEach.call(palco.querySelectorAll('iframe'), function(f){ f.classList.remove('on'); });

  if (montado[id]) {
    document.getElementById('f-'+id).classList.add('on');
  } else {
    cTxt.textContent = 'Carregando ' + c.nome + '…';
    carreg.style.display = 'flex';
    var f = document.createElement('iframe');
    f.id = 'f-' + id;
    f.title = c.nome;
    f.setAttribute('allow','autoplay; fullscreen; encrypted-media');
    f.srcdoc = document.getElementById('doc-'+id).textContent;
    f.onload = function(){ carreg.style.display='none'; f.classList.add('on'); };
    palco.appendChild(f);
    montado[id] = true;
  }

  try { localStorage.setItem(CHAVE, id); } catch(e){}
}

abas.addEventListener('click', function(e){
  var b = e.target.closest('button[data-c]');
  if (b) abrir(b.dataset.c);
});

/* atalho: Ctrl/Cmd + 1 e 2 */
document.addEventListener('keydown', function(e){
  if (!(e.ctrlKey || e.metaKey)) return;
  if (e.key === '1') { e.preventDefault(); abrir(CURSOS[0].id); }
  if (e.key === '2') { e.preventDefault(); abrir(CURSOS[1].id); }
});

var inicial = CURSOS[0].id;
try { var salvo = localStorage.getItem(CHAVE); if (salvo) inicial = salvo; } catch(e){}
abrir(inicial);
})();
</script>
</body>
</html>
"""

abas = "".join(
    f'<button data-c="{c["id"]}"><i>{c["bandeira"]}</i>{c["nome"]}</button>'
    for c in CURSOS
)

# cada curso num <script type="text/plain"> — não executa, só guarda o texto
partes = []
for c in CURSOS:
    doc = docs[c["id"]]
    # dentro de <script> só precisamos neutralizar a sequência que fecharia a tag
    seguro = doc.replace("</script", "<\\/script")
    partes.append(
        f'<script id="doc-{c["id"]}" type="text/plain">{seguro}</script>'
    )

meta = json.dumps([{k: c[k] for k in ("id","nome","cor")} for c in CURSOS], ensure_ascii=False)

saida = (SHELL
         .replace("__ABAS__", abas)
         .replace("__DOCS__", "\n".join(partes))
         .replace("__META__", meta))

destino = os.path.join(RAIZ, "MemoriaHack_Cursos.html")
open(destino, "w", encoding="utf-8").write(saida)
print(f"\n  MemoriaHack_Cursos.html: {len(saida.encode())/1048576:.2f} MB")
