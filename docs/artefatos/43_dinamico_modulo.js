/* ============ FLUXO DINÂMICO ============
   1. Ao abrir o app num novo dia com cartas vencidas -> convite para revisar
   2. Ao completar 100% de uma Mission/Morceau -> convite para o provão
   Ambos aparecem no máximo UMA vez por ocasião e sempre têm saída. */

function _hoje(){ return new Date().toISOString().slice(0,10); }

/* modal genérico reaproveitando o markup do #modalRev */
function modalMostrar({icone,num,rotulo,alerta,texto,ok,okTxt,cancelTxt}){
  const m=document.getElementById('modalRev');
  if(!m){ if(ok)ok(); return false; }
  m.querySelector('.mr-ic').textContent=icone||'🔄';
  m.querySelector('.mr-corpo').innerHTML=
    (num!==undefined?'<div class="mr-num">'+num+'</div>':'')+
    (rotulo?'<div class="mr-lbl">'+rotulo+'</div>':'')+
    (alerta?'<div class="mr-alerta">'+alerta+'</div>':'')+
    '<p class="mr-txt">'+texto+'</p>';
  const bOk=m.querySelector('[data-mr="rev"]'), bNo=m.querySelector('[data-mr="depois"]');
  bOk.textContent=okTxt||'Revisar agora';
  bNo.textContent=cancelTxt||'Continuar estudando';
  bOk.onclick=()=>{ m.classList.remove('open'); if(ok)ok(); };
  bNo.onclick=()=>{ m.classList.remove('open'); };
  m.querySelector('.mr-bd').onclick=()=>{ m.classList.remove('open'); };
  m.classList.add('open');
  return true;
}

/* ---- 1. boas-vindas do dia ---- */
function avisoDoDia(){
  const hoje=_hoje();
  if(S.avisoDia===hoje) return false;           // já avisou hoje
  const st=srsStatus();
  if(st.due<1){ S.avisoDia=hoje; save(); return false; }
  S.avisoDia=hoje; save();
  const atraso = st.atrasoMs>=864e5
    ? 'A mais antiga venceu '+humanizarAtraso(st.atrasoMs)+'.' : '';
  modalMostrar({
    icone:'👋', num:st.due, rotulo:'cartas prontas para revisar',
    alerta:atraso,
    texto:'Bom te ver de volta. A revisão espaçada só funciona se acontecer no dia '+
          'certo — leva cerca de <b>'+estimarMin(st.due)+' min</b>.',
    okTxt:'Revisar agora', cancelTxt:'Depois',
    ok:()=>{ go('study'); startSession(); }
  });
  return true;
}

/* ---- 2. missão concluída -> provão ---- */
function missaoConcluida(){
  if(typeof EXAMS==='undefined' || !EXAMS.length) return false;
  S.avisoExame=S.avisoExame||{};
  for(const e of EXAMS){
    if(S.avisoExame[e.lv]) continue;            // já convidou
    if(S.exams && S.exams[e.lv] && S.exams[e.lv].apto) continue;
    const prog = (typeof faixaDone==='function')
      ? faixaDone(e)
      : (typeof missionDone==='function' ? missionDone(e.mission) : 0);
    if(prog < 1) continue;                      // ainda não fechou 100%
    S.avisoExame[e.lv]=_hoje(); save();
    const alvo = e.nome || e.lv;
    modalMostrar({
      icone:'🎓', num:'100%', rotulo:'concluído',
      texto:'Você terminou tudo que o <b>'+esc(alvo)+'</b> cobre. '+
            'Este é o momento de medir: são '+(e.total||e.qs.length)+' questões e '+
            'a aprovação exige <b>'+(e.seuil||60)+'</b> pontos.',
      okTxt:'Fazer o provão', cancelTxt:'Mais tarde',
      ok:()=>{ go('exams'); setTimeout(()=>{
        const b=document.querySelector('#xList [data-act="exam"][data-lv="'+e.lv+'"]');
        if(b) b.click(); },400); }
    });
    return true;
  }
  return false;
}

/* chamado no boot e sempre que o progresso muda */
function checarFluxo(){
  if(missaoConcluida()) return;   // a conquista tem prioridade sobre a cobrança
  avisoDoDia();
}
