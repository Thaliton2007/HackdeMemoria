#!/usr/bin/env python3
"""Injeta o módulo de voz (Bloco 1) num curso.

Regra de ouro: nada vira obrigatório. O botão 🎤 só é renderizado se o navegador
suportar gravação, e só faz algo quando clicado. O fluxo de estudo continua
idêntico para quem nunca tocar nele.

Uso: python3 aplica_voz.py <app.js> <shell.html> <lang-asr>
"""
import sys,re

APP,SHELL,LANG=sys.argv[1],sys.argv[2],sys.argv[3]
s=open(APP,encoding="utf-8").read()
h=open(SHELL,encoding="utf-8").read()
mod=open("/home/user/voz_modulo.js",encoding="utf-8").read()

if "VOZ_OK" in s:
    print(f"  (já aplicado em {APP})"); sys.exit(0)

# ---------------- 1) módulo + idioma do reconhecimento ----------------
mod=mod.replace("LANG_ASR", f"'{LANG}'")
s=s.replace("/* ============ SESSÃO SRS ============ */",
            mod+"\n/* ============ SESSÃO SRS ============ */",1)

# ---------------- 2) botão nas frases da aula ----------------
# fica ao lado do ▶; quem não quiser, ignora
s=s.replace("""          ${f.mp3?`<a class="natbtn" href="${viewURL(f.mp3)}" target="_blank" rel="noopener"
            title="Áudio gravado por nativo (abre no Drive)">🔊</a>`:''}""",
"""          ${f.mp3?`<a class="natbtn" href="${viewURL(f.mp3)}" target="_blank" rel="noopener"
            title="Áudio gravado por nativo (abre no Drive)">🔊</a>`:''}
          ${btnVoz(f.en,f.mp3)}""",1)

# ---------------- 3) ação do botão ----------------
s=s.replace("""  if(a==='say'){e.preventDefault();playPhrase(t.dataset.m,t,null,t.dataset.en);return;}""",
"""  if(a==='say'){e.preventDefault();playPhrase(t.dataset.m,t,null,t.dataset.en);return;}
  if(a==='voz'){e.preventDefault();
    let cx=t.parentElement.querySelector('.vzbox');
    if(!cx){ cx=document.createElement('div'); cx.className='vzbox';
             t.parentElement.appendChild(cx); }
    vozGravar(t,t.dataset.en,t.dataset.m,cx); return;}""",1)

# ---------------- 4) botão na carta do SRS (opcional, ao lado de Ouvir) ----------------
s=s.replace("""$('#fSpeak').onclick=()=>{const c=curCard();if(c)playPhrase(null,null,null,c.fr);};""",
"""$('#fSpeak').onclick=()=>{const c=curCard();if(c)playPhrase(null,null,null,c.fr);};
/* 🎤 na carta: aparece só se houver suporte e o usuário tiver ligado nas opções */
const _fv=document.getElementById('fVoz');
if(_fv){
  if(!VOZ_OK) _fv.style.display='none';
  else _fv.onclick=()=>{
    const c=curCard(); if(!c) return;
    let cx=document.getElementById('fVozBox');
    if(!cx){ cx=document.createElement('div'); cx.id='fVozBox'; cx.className='vzbox';
             _fv.parentElement.parentElement.appendChild(cx); }
    vozGravar(_fv,c.fr,c.mp3,cx);
  };
}""",1)

# mostra/esconde o 🎤 da carta conforme a preferência
s=s.replace("""  $('#fSpeak').style.display=SS.dir==='fr-pt'?'':'none';""",
"""  $('#fSpeak').style.display=SS.dir==='fr-pt'?'':'none';
  const fv=document.getElementById('fVoz');
  if(fv) fv.style.display=(VOZ_OK && S.cfg.voz)?'':'none';
  const fvb=document.getElementById('fVozBox'); if(fvb) fvb.remove();""",1)
s=s.replace("""  $('#fSpeak').style.display=SS.dir==='en-pt'?'':'none';""",
"""  $('#fSpeak').style.display=SS.dir==='en-pt'?'':'none';
  const fv=document.getElementById('fVoz');
  if(fv) fv.style.display=(VOZ_OK && S.cfg.voz)?'':'none';
  const fvb=document.getElementById('fVozBox'); if(fvb) fvb.remove();""",1)

# ---------------- 5) preferência (desligada por padrão) ----------------
s=s.replace("typing:false,audio:true","typing:false,audio:true,voz:false",1)
s=s.replace("""  $('#swAudio').classList.toggle('on',S.cfg.audio);""",
"""  $('#swAudio').classList.toggle('on',S.cfg.audio);
  const sv=$('#swVoz');
  if(sv){ sv.classList.toggle('on',!!S.cfg.voz);
          const lin=sv.closest('.row'); if(lin && !VOZ_OK) lin.style.display='none'; }""",1)
s=s.replace("""  $('#swAudio').onclick=()=>{S.cfg.audio=!S.cfg.audio;save();renderSetup();};""",
"""  $('#swAudio').onclick=()=>{S.cfg.audio=!S.cfg.audio;save();renderSetup();};
  const sv2=$('#swVoz');
  if(sv2) sv2.onclick=()=>{S.cfg.voz=!S.cfg.voz;save();renderSetup();};""",1)

# limpa a gravação ao trocar de carta ou sair
s=s.replace("function grade(g){","function grade(g){\n  if(typeof vozLimpar==='function') vozLimpar();",1)

open(APP,"w",encoding="utf-8").write(s)

# ---------------- HTML: botão na carta + switch + CSS ----------------
if 'id="fVoz"' not in h:
    h=h.replace('<button class="speak" id="fSpeak">🔊 Ouvir</button>',
      '<button class="speak" id="fSpeak">🔊 Ouvir</button>\n'
      '          <button class="speak" id="fVoz" style="display:none">🎤 Gravar minha voz</button>',1)

if 'id="swVoz"' not in h:
    h=h.replace("""        <div class="row">
          <div><div class="lbl">Tamanho da sessão</div>""",
"""        <div class="row">
          <div><div class="lbl">Praticar a fala</div>
            <div class="desc">Adiciona um botão 🎤 na carta para gravar sua voz e comparar
              com o modelo. Opcional — o estudo funciona igual sem ele.</div></div>
          <button class="sw" id="swVoz"><i></i></button>
        </div>
        <div class="row">
          <div><div class="lbl">Tamanho da sessão</div>""",1)

if '.vzbtn{' not in h:
    h=h.replace('</style>','''
/* --- voz (Bloco 1) --- */
.vzbtn{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;
border-radius:50%;background:var(--ess);color:var(--es);border:none;font-size:13px;
flex-shrink:0;cursor:pointer;transition:.15s}
.vzbtn:hover{background:var(--es);color:#fff}
.vzbtn.grav{background:var(--bad);color:#fff;animation:pulseV 1s infinite}
@keyframes pulseV{0%,100%{opacity:1}50%{opacity:.55}}
.vzbox{width:100%;margin-top:10px}
.vz{background:var(--bg3);border-radius:12px;padding:14px}
.vz-lin{display:flex;align-items:center;gap:10px;margin-bottom:9px}
.vz-lin b{font-size:12px;color:var(--tx3);min-width:48px;font-weight:700}
.vz-lin audio{flex:1;height:34px}
.vz-lin .btn{padding:7px 13px;font-size:12.5px}
.vz-alvo{font-size:14.5px;font-weight:600;color:var(--tx);text-align:center;
padding:10px;background:var(--bg2);border-radius:9px;margin:4px 0 10px}
.vz-check{width:100%}
.vz-msg{font-size:12.5px;color:var(--tx2);line-height:1.5;text-align:center}
.vz-res{margin-top:10px}
.vz-diff{font-size:14px;background:var(--bg2);border-radius:9px;padding:10px}
.vz-score{text-align:center;font-weight:700;font-size:15px;margin-top:8px}
#fVoz{margin-left:8px}
</style>''',1)

open(SHELL,"w",encoding="utf-8").write(h)
print(f"  voz aplicada: {APP}  (ASR: {LANG})")
