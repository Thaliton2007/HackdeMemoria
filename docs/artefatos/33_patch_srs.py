#!/usr/bin/env python3
"""Torna o agendamento do SRS visível e ativo.

Problema: o app calcula x.next para cada carta, mas o usuário nunca vê essa data.
Ele só lê "N cartas para revisar hoje" — sem saber quando é a próxima, há quanto
tempo algo está vencido, nem que está acumulando ao avançar nas unidades.

Adiciona:
  1. srsStatus()  — próxima revisão, atraso da mais antiga, previsão de amanhã
  2. Painel "Para hoje" com contagem regressiva ("próxima em 3h20")
  3. Banner de acúmulo quando passa do limiar
  4. Pop-up ao concluir aula com cartas vencidas (revisar agora × seguir)
  5. Badge de vencidas em cada unidade

Uso: python3 patch_srs.py <app.js> <shell.html>
"""
import sys,re

APP,SHELL=sys.argv[1],sys.argv[2]
s=open(APP,encoding="utf-8").read()
h=open(SHELL,encoding="utf-8").read()

# ---------------------------------------------------------------- 1) núcleo
NUCLEO = r'''
/* ============ AGENDA DO SRS (visível) ============ */
/* O SM-2 já grava x.next em cada carta; estas funções expõem isso ao usuário. */
const LIMIAR_ACUMULO=40;           // a partir daqui o app avisa que está acumulando

function srsStatus(){
  const p=pool(), agora=Date.now();
  let due=0, novas=0, proxima=null, maisAntiga=null, amanha=0;
  const fim=agora+864e5;
  p.forEach(c=>{
    const x=S.srs[c.id];
    if(!x){ novas++; return; }
    if(x.next<=agora){
      due++;
      if(maisAntiga===null||x.next<maisAntiga) maisAntiga=x.next;
    } else {
      if(proxima===null||x.next<proxima) proxima=x.next;
      if(x.next<=fim) amanha++;
    }
  });
  return {due,novas,proxima,amanha,
          atrasoMs: maisAntiga?agora-maisAntiga:0,
          total:p.length};
}

function humanizarMs(ms){
  if(ms<0) ms=0;
  const min=Math.round(ms/6e4);
  if(min<1)  return 'agora';
  if(min<60) return min+' min';
  const h=Math.floor(min/60), m=min%60;
  if(h<24)   return m?`${h}h${String(m).padStart(2,'0')}`:`${h}h`;
  const d=Math.round(h/24);
  return d===1?'1 dia':`${d} dias`;
}
function humanizarAtraso(ms){
  const d=Math.floor(ms/864e5);
  if(d>=1) return d===1?'há 1 dia':`há ${d} dias`;
  const hh=Math.floor(ms/36e5);
  if(hh>=1) return hh===1?'há 1 hora':`há ${hh} horas`;
  return 'há poucos minutos';
}
/* estimativa honesta: ~8s por carta, medida nas sessões */
function estimarMin(n){ return Math.max(1,Math.round(n*8/60)); }
'''
s=s.replace("/* ============ HOME ============ */", NUCLEO+"\n/* ============ HOME ============ */",1)
if NUCLEO not in s:   # o marcador pode variar entre os apps
    s=s.replace("function renderHome(){", NUCLEO+"\nfunction renderHome(){",1)

# ------------------------------------------------- 2) painel "Para hoje"
velho_painel = """  const tc=$('#todayCard');
  if(tc){
    const linhas=["""
novo_painel = """  const tc=$('#todayCard');
  if(tc){
    const st=srsStatus();
    const descDue = st.due
      ? (st.atrasoMs>=864e5 ? 'a mais antiga venceu '+humanizarAtraso(st.atrasoMs)
                            : 'prontas para agora')
      : (st.proxima ? 'próxima em '+humanizarMs(st.proxima-Date.now())
                    : 'nada agendado ainda');
    const linhas=["""
if velho_painel in s:
    s=s.replace(velho_painel,novo_painel,1)
    s=s.replace("""t:'Revisões vencidas',d:due?'prontas para hoje':'nada vencido agora',v:due,""",
                """t:'Revisões vencidas',d:descDue,v:st.due,""",1)
    s=s.replace("""{i:'✨',bg:'var(--ess)',c:'var(--es)',t:'Cartas novas',d:'liberadas e nunca vistas',v:k.nw,go:()=>go('study')},""",
                """{i:'✨',bg:'var(--ess)',c:'var(--es)',t:'Cartas novas',d:'liberadas e nunca vistas',v:k.nw,go:()=>go('study')},""",1)

# a versão do inglês/francês usa "novas" e "due" como variáveis locais
s=s.replace("""t:'Revisões vencidas',d:due?'prontas para agora':'nada vencido agora',v:due,""",
            """t:'Revisões vencidas',d:descDue,v:st.due,""",1)

# linha extra: o que vence nas próximas 24h
s=s.replace("""      {i:'🔥',bg:'var(--warns)',c:'var(--warn)',t:'Sequência',d:(S.streak||0)===1?'dia seguido':'dias seguidos',v:S.streak||0,go:()=>go('stats')}
    ];""",
"""      {i:'⏳',bg:'var(--acs)',c:'var(--ac)',t:'Vencem em 24h',
       d:st.amanha?'planeje seu tempo':'nenhuma por enquanto',v:st.amanha,go:()=>go('stats')},
      {i:'🔥',bg:'var(--warns)',c:'var(--warn)',t:'Sequência',d:(S.streak||0)===1?'dia seguido':'dias seguidos',v:S.streak||0,go:()=>go('stats')}
    ];""",1)

# ------------------------------------------------- 3) banner de acúmulo
BANNER = r'''
/* aviso de acúmulo: aparece quando a fila passa do limiar */
function bannerAcumulo(){
  const el=document.getElementById('acumulo');
  if(!el) return;
  const st=srsStatus();
  if(st.due<LIMIAR_ACUMULO){ el.style.display='none'; return; }
  const atraso = st.atrasoMs>=864e5 ? ' A mais antiga venceu '+humanizarAtraso(st.atrasoMs)+'.' : '';
  el.style.display='';
  el.innerHTML='⚠️ <b>'+st.due+' cartas vencidas.</b>'+atraso+
    ' Avançar sem revisar faz a fila crescer — são cerca de <b>'+estimarMin(st.due)+
    ' min</b> para zerar. <a href="#" id="acumuloGo">Revisar agora →</a>';
  const a=document.getElementById('acumuloGo');
  if(a) a.onclick=e=>{e.preventDefault();go('study');startSession();};
}
'''
s=s.replace("/* ============ AGENDA DO SRS (visível) ============ */",
            BANNER+"\n/* ============ AGENDA DO SRS (visível) ============ */",1)
# chama o banner ao trocar de página
s=s.replace("  const m=$('main'); if(m) m.scrollTop=0;\n  head();\n}",
            "  const m=$('main'); if(m) m.scrollTop=0;\n  head(); bannerAcumulo();\n}",1)

# ------------------------------------------------- 4) pop-up ao concluir aula
MODAL = r'''
/* pop-up ao concluir uma aula com fila vencida:
   o usuário escolhe entre revisar agora ou seguir — nunca é bloqueado. */
function avisarRevisao(depois){
  const st=srsStatus();
  if(st.due<10){ if(depois)depois(); return; }
  const m=document.getElementById('modalRev');
  if(!m){ if(depois)depois(); return; }
  const atraso = st.atrasoMs>=864e5
    ? '<div class="mr-alerta">A mais antiga venceu '+humanizarAtraso(st.atrasoMs)+'.</div>' : '';
  m.querySelector('.mr-corpo').innerHTML=
    '<div class="mr-num">'+st.due+'</div>'+
    '<div class="mr-lbl">cartas esperando revisão</div>'+atraso+
    '<p class="mr-txt">Você liberou cartas novas agora. Revisar antes de avançar é o que '+
    'faz a memória fixar — a fila leva cerca de <b>'+estimarMin(st.due)+' min</b>.</p>';
  m.classList.add('open');
  m.querySelector('[data-mr="rev"]').onclick=()=>{
    m.classList.remove('open'); go('study'); startSession(); };
  m.querySelector('[data-mr="depois"]').onclick=()=>{
    m.classList.remove('open'); if(depois)depois(); };
  m.querySelector('.mr-bd').onclick=()=>{
    m.classList.remove('open'); if(depois)depois(); };
}
'''
s=s.replace("/* ============ AGENDA DO SRS (visível) ============ */",
            MODAL+"\n/* ============ AGENDA DO SRS (visível) ============ */",1)

# dispara no "Enviar cartas para estudo"
s=s.replace("""  if(a==='send'||a==='undo'){e.preventDefault();S.done[t.dataset.l]=(a==='send');save();openLesson(t.dataset.l);head();return;}""",
"""  if(a==='send'||a==='undo'){e.preventDefault();
    const enviando=(a==='send');
    S.done[t.dataset.l]=enviando; save(); openLesson(t.dataset.l); head();
    if(enviando) avisarRevisao(null);
    return;}""",1)

# ------------------------------------------------- 5) badge de vencidas por unidade
s=s.replace("""            <div class="sm">${d}/${t} blocos · ${cs.length} frases · ${vis} vistas</div>""",
"""            <div class="sm">${d}/${t} blocos · ${cs.length} frases · ${vis} vistas${
              (()=>{const ag=Date.now();
                const v=cs.filter(c=>{const x=S.srs[c.id];return x&&x.next<=ag;}).length;
                return v?` · <b style="color:var(--bad)">${v} a revisar</b>`:'';})()}</div>""",1)

open(APP,"w",encoding="utf-8").write(s)

# ---------------------------------------------------------------- HTML + CSS
if 'id="acumulo"' not in h:
    h=h.replace('<div class="dash">',
      '<div class="lockmsg" id="acumulo" style="display:none;margin-bottom:18px;'
      'background:var(--warns);border-color:rgba(141,103,8,.28)"></div>\n    <div class="dash">',1)

if 'id="modalRev"' not in h:
    MODAL_HTML = '''
<div class="mr" id="modalRev">
  <div class="mr-bd"></div>
  <div class="mr-cx">
    <div class="mr-ic">🔄</div>
    <div class="mr-corpo"></div>
    <div class="mr-btns">
      <button class="btn p" data-mr="rev">Revisar agora</button>
      <button class="btn" data-mr="depois">Continuar estudando</button>
    </div>
  </div>
</div>
'''
    h=h.replace('</main>','</main>\n'+MODAL_HTML,1)

if '.mr{' not in h:
    CSS = '''
/* pop-up de revisão pendente */
.mr{display:none;position:fixed;inset:0;z-index:400}
.mr.open{display:block}
.mr-bd{position:absolute;inset:0;background:rgba(0,0,0,.4)}
.mr-cx{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
background:var(--bg2);border-radius:20px;padding:28px 26px;width:min(400px,92vw);
box-shadow:0 20px 60px rgba(0,0,0,.25);text-align:center;animation:mrIn .2s ease}
@keyframes mrIn{from{opacity:0;transform:translate(-50%,-46%)}to{opacity:1;transform:translate(-50%,-50%)}}
.mr-ic{font-size:34px;margin-bottom:8px}
.mr-num{font-size:44px;font-weight:700;color:var(--ac);line-height:1;letter-spacing:-1.5px}
.mr-lbl{font-size:13px;color:var(--tx3);font-weight:600;margin-top:4px}
.mr-alerta{margin-top:10px;font-size:12.5px;font-weight:700;color:#A32B1F;
background:var(--bads);border-radius:8px;padding:6px 10px;display:inline-block}
.mr-txt{font-size:13.5px;color:var(--tx2);line-height:1.55;margin:14px 0 18px}
.mr-btns{display:flex;flex-direction:column;gap:9px}
.mr-btns .btn{width:100%}
'''
    h=h.replace('</style>',CSS+'</style>',1)

open(SHELL,"w",encoding="utf-8").write(h)
print(f"  patch aplicado: {APP}")
