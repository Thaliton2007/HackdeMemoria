#!/usr/bin/env python3
"""Aplica o fluxo dinâmico (aviso do dia + convite ao provão).
Uso: python3 aplica_dinamico.py <app.js>
"""
import sys,re

APP=sys.argv[1]
s=open(APP,encoding="utf-8").read()
mod=open("/home/user/dinamico_modulo.js",encoding="utf-8").read()

if "checarFluxo" in s:
    print(f"  (já aplicado em {APP})"); sys.exit(0)

# injeta o módulo logo após o núcleo do SRS
alvo="/* ============ AGENDA DO SRS (visível) ============ */"
if alvo in s:
    # entra DEPOIS do núcleo, porque usa srsStatus/humanizarAtraso/estimarMin
    i=s.index(alvo)
    fim=s.find("\nfunction ",s.index("function estimarMin")) if "function estimarMin" in s else -1
    ponto=s.index("\n",s.index("function estimarMin"))
    ponto=s.index("\n",s.index("}",ponto))+1
    s=s[:ponto]+"\n"+mod+"\n"+s[ponto:]
else:
    s=s.replace("function renderHome(){", mod+"\nfunction renderHome(){",1)

# estado novo
s=s.replace("plan:{},pace:","avisoDia:null,avisoExame:{},plan:{},pace:",1)
if "avisoDia" not in s:
    s=re.sub(r"(return \{v:\d+,done:\{\})", r"\1,avisoDia:null,avisoExame:{}", s, count=1)

# dispara no boot (depois de tudo montado) e ao concluir aula
s=s.replace("/* ---- boot ---- */\nrenderHome();",
            "/* ---- boot ---- */\nrenderHome();\nsetTimeout(checarFluxo,700);",1)
if "setTimeout(checarFluxo,700)" not in s:
    s=s.rstrip()
    s=s[:s.rindex("})();")]+"setTimeout(checarFluxo,700);\n})();"

# ao enviar cartas, verifica se fechou uma missão (tem prioridade sobre o aviso de fila)
s=s.replace("    if(enviando) avisarRevisao(null);",
            "    if(enviando){ if(!missaoConcluida()) avisarRevisao(null); }",1)

open(APP,"w",encoding="utf-8").write(s)
print(f"  fluxo dinâmico aplicado: {APP}")
