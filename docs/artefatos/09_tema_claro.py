#!/usr/bin/env python3
"""Etapa 1 da refatoração de UI/UX: tema claro acessível.
Converte o CSS do tema escuro para a paleta clara do documento,
com as cores de ação escurecidas para passar em WCAG AA (4.5:1).
Mantém a versão escura intacta."""
import re,sys

src=open("app/shell.html",encoding="utf-8").read()

# ---------------- 1) nova paleta ----------------
ROOT_NOVO = """:root{
/* Fundos — tema claro */
--bg:#F4F7F6;--bg2:#FFFFFF;--bg3:#EDF2F5;--line:#E3E9ED;--line2:#CFD8DE;
/* Textos — todos >= 4.5:1 sobre branco */
--tx:#22303C;--tx2:#5A6A78;--tx3:#67737F;
/* Ações — tons do documento, escurecidos para AA quando viram texto */
--ac:#0B6BCB;--ac2:#0A5AAE;--es:#5F4BD8;--pt:#00796B;
--ok:#00795F;--warn:#8D6708;--bad:#C0392B;--info:#0B6BCB;
/* Versões claras (só preenchimento: barras, fundos, ícones — nunca texto) */
--acf:#74B9FF;--esf:#A29BFE;--ptf:#55EFC4;--warnf:#FDCB6E;--badf:#FF7675;--okf:#2BC4A0;
/* Superfícies suaves (substituem os rgba cravados) */
--acs:rgba(11,107,203,.09);--ess:rgba(95,75,216,.09);--oks:rgba(0,121,95,.10);
--warns:rgba(141,103,8,.10);--bads:rgba(192,57,43,.09);
/* Forma */
--r:16px;--sh:0 4px 20px rgba(0,0,0,.05);--sh2:0 8px 24px rgba(0,0,0,.08);
--sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,Helvetica,Arial,sans-serif;
}"""
src=re.sub(r':root\{.*?\n\}',ROOT_NOVO,src,count=1,flags=re.S)

# ---------------- 2) rgba cravados -> variáveis ----------------
# rosa (antigo --ac) -> azul
SUB=[
  # sombras/realces do rosa
  (r'rgba\(255,\s*57,\s*125,\s*\.0?9\)','var(--acs)'),
  (r'rgba\(255,\s*57,\s*125,\s*\.1\)','var(--acs)'),
  (r'rgba\(255,\s*57,\s*125,\s*\.12\)','var(--acs)'),
  (r'rgba\(255,\s*57,\s*125,\s*\.13\)','var(--acs)'),
  (r'rgba\(255,\s*57,\s*125,\s*\.14\)','var(--acs)'),
  (r'rgba\(255,\s*57,\s*125,\s*\.3\)','rgba(11,107,203,.16)'),
  (r'rgba\(255,\s*57,\s*125,\s*\.35\)','rgba(11,107,203,.18)'),
  (r'rgba\(255,\s*57,\s*125,\s*\.4\)','rgba(11,107,203,.20)'),
  (r'rgba\(255,\s*57,\s*125,\s*\.55\)','rgba(116,185,255,.55)'),
  (r'rgba\(255,\s*57,\s*125,\s*\.78\)','rgba(116,185,255,.85)'),
  # verde sucesso
  (r'rgba\(52,\s*211,\s*153,\s*\.1[234]\)','var(--oks)'),
  (r'rgba\(52,\s*211,\s*153,\s*\.18\)','var(--oks)'),
  (r'rgba\(52,\s*211,\s*153,\s*\.3[5]?\)','rgba(0,121,95,.22)'),
  (r'rgba\(52,\s*211,\s*153,\s*\.4\)','rgba(0,121,95,.25)'),
  # vermelho
  (r'rgba\(248,\s*113,\s*113,\s*\.1[35]\)','var(--bads)'),
  (r'rgba\(248,\s*113,\s*113,\s*\.2\)','rgba(192,57,43,.14)'),
  (r'rgba\(248,\s*113,\s*113,\s*\.4\)','rgba(192,57,43,.22)'),
  # âmbar (antigo --es)
  (r'rgba\(255,\s*176,\s*58,\s*\.0[789]\)','var(--warns)'),
  (r'rgba\(255,\s*176,\s*58,\s*\.28\)','rgba(141,103,8,.22)'),
  (r'rgba\(251,\s*191,\s*36,\s*\.1[24]\)','var(--warns)'),
  (r'rgba\(251,\s*191,\s*36,\s*\.4\)','rgba(141,103,8,.22)'),
  # azuis info
  (r'rgba\(96,\s*165,\s*250,\s*\.0?8\)','var(--acs)'),
  (r'rgba\(96,\s*165,\s*250,\s*\.1[24]\)','var(--acs)'),
  (r'rgba\(96,\s*165,\s*250,\s*\.25\)','rgba(11,107,203,.16)'),
  (r'rgba\(96,\s*165,\s*250,\s*\.4\)','rgba(11,107,203,.20)'),
  (r'rgba\(94,\s*158,\s*255,\s*\.16\)','var(--acs)'),
  (r'rgba\(94,\s*158,\s*255,\s*\.45\)','rgba(11,107,203,.22)'),
  # lilás
  (r'rgba\(167,\s*139,\s*250,\s*\.16\)','var(--ess)'),
  # sombra preta forte -> suave
  (r'rgba\(0,\s*0,\s*0,\s*\.45\)','rgba(0,0,0,.05)'),
  (r'rgba\(0,\s*0,\s*0,\s*\.4\)','rgba(0,0,0,.06)'),
  (r'rgba\(0,\s*0,\s*0,\s*\.3\)','rgba(0,0,0,.05)'),
]
for pat,rep in SUB: src=re.sub(pat,rep,src)

# ---------------- 3) cartões: sem borda, sombra suave, mais respiro ----------------
src=src.replace(
 ".card{background:var(--bg2);border:1px solid var(--line);border-radius:var(--r);padding:18px 20px}",
 ".card{background:var(--bg2);border:none;border-radius:var(--r);padding:24px;box-shadow:var(--sh);"
 "transition:transform .2s ease,box-shadow .2s ease}\n"
 ".card:hover{transform:translateY(-3px);box-shadow:var(--sh2)}")
src=src.replace(
 ".stat{background:var(--bg2);border:1px solid var(--line);border-radius:var(--r);padding:17px 18px;",
 ".stat{background:var(--bg2);border:none;border-radius:var(--r);padding:22px 20px;box-shadow:var(--sh);")
src=src.replace(
 ".dsec{background:var(--bg2);border:1px solid var(--line);border-radius:var(--r);\npadding:20px 22px;margin-bottom:14px}",
 ".dsec{background:var(--bg2);border:none;border-radius:var(--r);\npadding:24px;margin-bottom:14px;box-shadow:var(--sh)}")
src=src.replace(
 ".lesson{background:var(--bg2);border:1px solid var(--line);border-radius:var(--r);margin-bottom:10px;overflow:hidden}",
 ".lesson{background:var(--bg2);border:none;border-radius:var(--r);margin-bottom:10px;overflow:hidden;box-shadow:var(--sh)}")
src=src.replace("header{display:flex;align-items:center;gap:14px;padding:12px 18px;background:var(--bg2);\nborder-bottom:1px solid var(--line);",
 "header{display:flex;align-items:center;gap:14px;padding:12px 18px;background:var(--bg2);\nborder-bottom:1px solid var(--line);box-shadow:0 1px 3px rgba(0,0,0,.04);")

# ---------------- 4) tipografia: pesos menores ----------------
src=re.sub(r'font-weight:850','font-weight:700',src)
src=re.sub(r'font-weight:800','font-weight:700',src)
src=re.sub(r'font-weight:750','font-weight:650',src)

# ---------------- 5) gradientes frios ----------------
src=src.replace("background:linear-gradient(90deg,var(--ac),var(--es));","background:linear-gradient(90deg,var(--acf),var(--esf));")
src=src.replace("linear-gradient(135deg,var(--ac),var(--warn))","linear-gradient(135deg,var(--ac),var(--es))")
src=src.replace("linear-gradient(90deg,var(--ac),var(--es))","linear-gradient(90deg,var(--acf),var(--esf))")

# ---------------- 6) barras de progresso com preenchimento claro ----------------
src=src.replace(".prog i{display:block;height:100%;background:linear-gradient(90deg,var(--ac),var(--es));",
                ".prog i{display:block;height:100%;background:linear-gradient(90deg,var(--acf),var(--esf));")

# ---------------- 7) scrollbar clara ----------------
src=src.replace("::-webkit-scrollbar-thumb{background:var(--line2);border-radius:6px}",
                "::-webkit-scrollbar-thumb{background:var(--line2);border-radius:6px}\n"
                "::-webkit-scrollbar-thumb:hover{background:var(--tx3)}")

open("app/shell.html","w",encoding="utf-8").write(src)
rest=re.findall(r'rgba\(255,\s*57,\s*125[^)]*\)',src)
print("shell convertido:",len(src),"bytes | rosa remanescente:",len(rest))
