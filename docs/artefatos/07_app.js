/* Memoria Hack · English — curso completo (25 units)
   Mesma arquitetura e mesmo padrão visual do curso de espanhol. */
(function(){
'use strict';
const DATA=JSON.parse(document.getElementById('DATA').textContent);
const UNITS=DATA.units, CARDS=DATA.cards, EXAMS=DATA.exams||[];
const LESSONS=[];
UNITS.forEach(u=>u.blocos.forEach(b=>LESSONS.push(Object.assign({},b,{
  u:u.id,uNome:u.nome,mission:u.mission,key:u.id+'/'+b.num}))));
const BY_U=new Map(UNITS.map(u=>[u.id,u]));
const KEY='mh_en_full_v3';

let S=load();
function load(){
  try{const r=JSON.parse(localStorage.getItem(KEY)); if(r&&r.v===3) return r;}catch(e){}
  return {v:3,done:{},quiz:{},srs:{},log:{},streak:0,best:0,last:null,rev:0,hit:0,
    plan:{},pace:'6',gate:true,exams:{},curU:UNITS[0].id,
    cfg:{dir:'en-pt',type:'all',units:[],typing:false,audio:true,size:20,nw:10}};
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
const $=(s,r)=>(r||document).querySelector(s);
const $$=(s,r)=>[...(r||document).querySelectorAll(s)];
const esc=s=>(s==null?'':String(s)).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const today=()=>new Date().toISOString().slice(0,10);

const dlURL=id=>`https://drive.usercontent.google.com/download?id=${id}&export=download`;
const prevURL=id=>`https://drive.google.com/file/d/${id}/preview`;
const viewURL=id=>`https://drive.google.com/file/d/${id}/view`;
const hostName=()=>'Drive';

const ICON={cronograma:'🗓️',aula:'🎬',plataforma:'⚙️',conversacao:'💬',gramatica:'🧩',
  pronuncia:'🎙️',cultura:'🗽',phrasal:'🧗',estudo:'🚀',revisao:'✅',diario:'📓',
  apoio:'📎',dialogo:'🎧',despedida:'👋',ftd:'⚡',pratica:'✍️'};
const TIPONOME={cronograma:'Journey Schedule',aula:'Opening Class',plataforma:'Plataforma',
  conversacao:'Small Talk',gramatica:'G-Force',pronuncia:'Mic Up',cultura:'Born in the USA',
  phrasal:'Phrasal Paradise',estudo:'How to Fly',revisao:'Wrap up',diario:'Journey Logbook',
  apoio:'Material de apoio',dialogo:'Áudios do diálogo',despedida:'Despedida',
  ftd:'Fast Thinking Drill',pratica:'Hands on Activity'};
const TCARD={smalltalk:'Small Talk',gforce:'G-Force',micup:'Mic Up',born:'Born in the USA',
  phrasal:'Phrasal',howtofly:'How to Fly',outro:'Review'};

const byKey=k=>LESSONS.find(b=>b.key===k);
const lessonDone=k=>!!S.done[k];
const cardKey=c=>c.u+'/'+c.blk;
const pool=()=>S.gate?CARDS.filter(c=>S.done[cardKey(c)]):CARDS;
const isNew=id=>!S.srs[id];
const isMast=id=>{const x=S.srs[id];return x&&x.iv>=21;};
const dueList=()=>{const t=Date.now();return pool().filter(c=>{const x=S.srs[c.id];return !x||x.next<=t;});};
const unitCards=uid=>CARDS.filter(c=>c.u===uid);
const unitDone=u=>u.blocos.filter(b=>lessonDone(u.id+'/'+b.num)).length;

/* ============ NAV ============ */
function go(p){
  $$('.page').forEach(x=>x.classList.remove('on'));
  $$('nav button').forEach(x=>x.classList.toggle('on',x.dataset.p===p));
  const el=$('#p-'+p); if(el) el.classList.add('on');
  ({home:renderHome,study:renderSetup,lessons:renderLessons,units:renderUnits,
    listen:renderListen,drills:renderDrillSetup,lives:renderLives,browse:renderBrowse,
    plan:renderPlan,stats:renderStats,exams:renderExams}[p]||(()=>{}))();
  const m=$('main'); if(m) m.scrollTop=0;
}
$$('nav button').forEach(b=>b.onclick=()=>go(b.dataset.p));
function head(){ $('#hDue').textContent=dueList().length; $('#hStreak').textContent=S.streak||0; }

/* ============ HOME ============ */
const TOOLS=[
 {i:'📖',n:'Aulas',d:'Os blocos de todas as units. Leia e envie as cartas para a fila.',x:LESSONS.length+' blocos',p:'lessons'},
 {i:'🗂️',n:'Memorization Hack',d:'Flashcards SM-2 com as frases que você já liberou.',x:CARDS.length+' cartas',p:'study'},
 {i:'🎧',n:'Listening',d:'Frases e diálogos em áudio nativo, com texto sincronizado.',x:'shadowing',p:'listen'},
 {i:'🎯',n:'Exercícios',d:'Escolha, lacuna, ordenar e ditado com áudio real.',x:'4 modos',p:'drills'},
 {i:'🎥',n:'Live Classes',d:'As lives ligadas a cada unit: da semana e por tema.',x:DATA.units.reduce((a,u)=>a+u.lives.sync.length+u.lives.tema.length,0)+' lives',p:'lives'},
 {i:'📅',n:'Journey Schedule',d:'O cronograma dia a dia, em 6, 9 ou 12 meses, com checklist.',x:'3 ritmos',p:'plan'}
];
function renderHome(){
  $('#hTotal').textContent=CARDS.length;
  const p=pool();
  $('#sDue').textContent=dueList().length;
  $('#sNew').textContent=p.filter(c=>isNew(c.id)).length;
  $('#sMast').textContent=p.filter(c=>isMast(c.id)).length;
  $('#sStreak').textContent=S.streak||0;
  const w=$('#homeWarn');
  if(S.gate&&!p.length){ w.style.display='';
    w.innerHTML='Nenhuma carta liberada ainda. Abra uma aula em <b>Aulas</b> e clique em '+
      '<b>✓ Enviar cartas para estudo</b> — você só revisa o que já viu. '+
      '<a href="#" id="wGo" style="color:var(--ac)">Ir para as aulas →</a>';
    const g=$('#wGo'); if(g) g.onclick=e=>{e.preventDefault();go('lessons');};
  } else w.style.display='none';
  const g=$('#toolGrid');
  g.innerHTML=TOOLS.map(t=>`<div class="tool" data-p="${t.p}"><div class="ti">${t.i}</div>
    <div class="tn">${t.n}</div><div class="td">${t.d}</div><div class="tx">${t.x}</div></div>`).join('');
  $$('.tool',g).forEach(e=>e.onclick=()=>go(e.dataset.p));
  renderHeat(); head();
}
function renderHeat(){
  const el=$('#heat'); if(!el) return;
  let h='',d=new Date();
  for(let i=29;i>=0;i--){
    const dt=new Date(d); dt.setDate(d.getDate()-i);
    const k=dt.toISOString().slice(0,10), n=S.log[k]||0;
    const bg=n===0?'var(--bg3)':n<10?'rgba(255,57,125,.3)':n<30?'rgba(255,57,125,.55)':n<60?'rgba(255,57,125,.78)':'var(--ac)';
    h+=`<b style="background:${bg}" title="${k}: ${n} revisões"></b>`;
  }
  el.innerHTML=h;
}
$('#goQuick').onclick=()=>{ go('study'); startSession(); };
$('#goFTD').onclick=()=>{ S.cfg.dir='pt-en'; save(); go('study'); startSession(); };

/* ============ UNIDADES ============ */
function renderUnits(){
  const miss={};
  UNITS.forEach(u=>{ (miss[u.mission]=miss[u.mission]||[]).push(u); });
  $('#unitList').innerHTML=Object.keys(miss).map(m=>{
    const us=miss[m];
    const tot=us.reduce((a,u)=>a+u.blocos.length,0);
    const dn=us.reduce((a,u)=>a+unitDone(u),0);
    return `<div class="card" style="margin-bottom:16px">
      <h3>${esc(m)} <span class="tag">${dn}/${tot} blocos</span></h3>
      <div class="prog" style="margin-bottom:14px"><i style="width:${tot?dn/tot*100:0}%"></i></div>
      ${us.map(u=>{
        const d=unitDone(u), t=u.blocos.length;
        const cs=unitCards(u.id), vis=cs.filter(c=>!isNew(c.id)).length;
        const full=d===t;
        return `<div class="li" data-u="${u.id}" style="cursor:pointer;display:flex;gap:12px;align-items:center">
          <div class="num" style="width:30px;height:30px;border-radius:9px;flex-shrink:0;display:flex;
            align-items:center;justify-content:center;font-size:12.5px;font-weight:700;
            background:${full?'var(--ok)':'var(--bg3)'};color:${full?'#06281c':'var(--tx3)'};
            border:1px solid ${full?'var(--ok)':'var(--line2)'}">${full?'✓':u.ord}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:14.5px;font-weight:650">${esc(u.nome)}</div>
            <div class="sm">${d}/${t} blocos · ${cs.length} frases · ${vis} vistas</div>
            <div class="prog" style="margin-top:5px;height:5px"><i style="width:${t?d/t*100:0}%"></i></div>
          </div>
          <svg class="ar" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.5" style="flex-shrink:0;color:var(--tx3)"><path d="m9 6 6 6-6 6"/></svg>
        </div>`;}).join('')}</div>`;}).join('');
  $$('#unitList [data-u]').forEach(e=>e.onclick=()=>{ S.curU=e.dataset.u; save(); go('lessons'); });
}

/* ============ AULAS ============ */
function fillUnitSelect(sel,all){
  if(!sel) return;
  const cur=sel.value;
  sel.innerHTML=(all?`<option value="">Todas as units</option>`:'')+
    UNITS.map(u=>`<option value="${u.id}">${esc(u.nome)}</option>`).join('');
  if(cur) sel.value=cur;
}
function renderLessons(){
  const sel=$('#lUnit');
  if(sel&&sel.options.length<=1){ fillUnitSelect(sel,true); sel.value=S.curU||''; }
  const dn=LESSONS.filter(b=>lessonDone(b.key)).length;
  $('#lDone').textContent=dn; $('#lDoneOf').textContent='de '+LESSONS.length;
  $('#lUnl').textContent=pool().length;
  const nx=LESSONS.find(b=>!lessonDone(b.key));
  $('#lNextU').textContent=nx?('#'+nx.num):'—';
  $('#lNextT').textContent=nx?(nx.uNome+' · '+nx.nome).slice(0,34):'tudo concluído';
  paintLessons();
}
function paintLessons(){
  const q=($('#lSearch').value||'').toLowerCase();
  const uu=$('#lUnit')?$('#lUnit').value:'';
  const tp=$('#lType').value, stt=$('#lState').value;
  const list=LESSONS.filter(b=>{
    if(uu&&b.u!==uu) return false;
    if(tp&&b.tipo!==tp) return false;
    if(stt==='done'&&!lessonDone(b.key)) return false;
    if(stt==='todo'&&lessonDone(b.key)) return false;
    if(q){const blob=(b.nome+' '+b.uNome+' '+b.teoria+' '+b.frases.map(f=>f.en+' '+f.pt).join(' ')).toLowerCase();
      if(!blob.includes(q)) return false;}
    return true;
  });
  let h='',ultU=null;
  list.slice(0,400).forEach(b=>{
    if(b.u!==ultU){ ultU=b.u;
      h+=`<h3 style="margin:18px 0 10px">${esc(b.uNome)} <span class="tag">${esc(b.mission)}</span></h3>`; }
    const d=lessonDone(b.key), bits=[];
    if(b.video)bits.push('vídeo');
    if(b.audio_aula)bits.push('áudio');
    if(b.frases.length)bits.push(b.frases.length+' frases');
    if(b.pdf&&b.pdf.length)bits.push(b.pdf.length+' PDF');
    if(b.quiz&&b.quiz.length)bits.push('teste');
    const n=S.quiz[b.key];
    h+=`<div class="lesson${d?' done':''}" data-l="${b.key}">
      <div class="lhead" data-open="${b.key}">
        <div class="num">${d?'✓':b.num}</div>
        <div class="lt">${esc(b.nome)}
          <div style="font-size:12px;color:var(--tx3);font-weight:600;margin-top:2px">
            ${esc(TIPONOME[b.tipo]||'')}${bits.length?' · '+bits.join(' · '):''}${
            n!=null?` · <b style="color:${n>=7?'var(--ok)':n>=5?'var(--warn)':'var(--bad)'}">nota ${n.toFixed(1)}</b>`:''}</div>
        </div>
        <svg class="ar" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5"><path d="m9 6 6 6-6 6"/></svg>
      </div></div>`;
  });
  $('#lList').innerHTML=h||'<div class="note">Nada encontrado com esses filtros.</div>';
  $$('#lList .lhead').forEach(e=>e.onclick=()=>openLesson(e.dataset.open));
}
['lSearch','lUnit','lType','lState'].forEach(id=>{
  const e=$('#'+id); if(e) e.oninput=e.onchange=()=>{ if(id==='lUnit'){S.curU=e.value;save();} paintLessons(); };
});

let curL=null;
function openLesson(key){
  curL=key; const b=byKey(key); if(!b) return;
  const d=lessonDone(key);
  const sameU=LESSONS.filter(x=>x.u===b.u);
  const idx=sameU.findIndex(x=>x.key===key);
  let h=`<div class="dhead">
      <div class="dpills">
        <span class="pill">${ICON[b.tipo]||'📄'} ${esc(TIPONOME[b.tipo]||'Aula')}</span>
        <span class="pill">${esc(b.uNome)}</span>
        <span class="pill">Bloco ${esc(b.num)} de ${sameU.length}</span>
        ${d?'<span class="pill ok">✓ concluída</span>':''}
      </div>
      <h1 style="font-size:26px;font-weight:800;letter-spacing:-.7px;margin:8px 0 4px">${esc(b.nome)}</h1>
      <p class="sub" style="margin-bottom:0">${esc(b.mission)} · ${esc(b.uNome)}</p></div>`;
  if(b.video){
    h+=`<div class="dsec"><h3>🎬 Vídeo da aula</h3><div class="vidwrap"><div data-vid="${b.video}">
      <button class="vidbtn" data-act="play" data-v="${b.video}">
        <div class="pl">▶</div><div class="vt"><div class="vn">Assistir a aula em vídeo</div>
        <div class="vs">${esc(b.nome)} · streaming do ${hostName()}</div></div></button></div></div></div>`;
  }
  if(b.audio_aula){
    h+=`<div class="dsec"><h3>🎧 Áudio da aula</h3>
      <p class="sub" style="margin:-4px 0 12px">A mesma aula só em áudio — dá para ouvir no trajeto.</p>
      <button class="btn" data-act="aud" data-a="${b.audio_aula}">▶ Tocar o áudio</button>
      <div id="audBox" style="margin-top:12px"></div></div>`;
  }
  if(b.dialogo&&b.dialogo.length){
    h+=`<div class="dsec"><h3>💬 Áudios do diálogo <span class="tag">${b.dialogo.length}</span></h3>
      <div class="vlinks">${b.dialogo.map(x=>
        `<a href="#" data-act="aud2" data-a="${x.id}">🔊 ${esc(x.n.replace(/\.mp3$/i,'').replace(/_/g,' '))}</a>`).join('')}</div>
      <div id="dlgBox" style="margin-top:10px"></div></div>`;
  }
  if(b.pdf&&b.pdf.length){
    h+=`<div class="dsec"><h3>📄 PDF ${b.pdf.length>1?'<span class="tag">'+b.pdf.length+'</span>':''}</h3>
      <div class="vlinks" style="margin-bottom:12px">${b.pdf.map(p=>
        `<a href="#" data-act="pdf" data-f="${p.id}">📄 ${esc(p.n.replace(/\.pdf$/i,'').replace(/_/g,' '))}</a>`).join('')}</div>
      <div class="pdfwrap" id="pdfBox"></div></div>`;
  }
  h+=`<div class="dsec"><h3>📖 Teoria</h3>${b.teoria?`<div class="theory"><p>${esc(b.teoria)}</p></div>`
      :'<div class="lockmsg">Este bloco não traz teoria escrita no material original — o conteúdo está no vídeo e nas frases.</div>'}</div>`;
  if(b.frases.length){
    h+=`<div class="dsec"><h3>🔊 Frases da aula <span class="tag">${b.frases.length}</span></h3>
      <p class="sub" style="margin:-4px 0 12px">Toque no ▶ para ouvir a gravação do nativo.</p>
      <div id="frList">${b.frases.map(f=>
        `<div class="ex" style="display:flex;gap:12px;align-items:flex-start">
          <button class="fplay" data-act="say" data-m="${f.mp3||''}"
            style="width:32px;height:32px;border-radius:50%;background:var(--bg3);
            border:1px solid var(--line2);flex-shrink:0;font-size:12px">${f.mp3?'▶':'—'}</button>
          <div style="flex:1;min-width:0"><div class="e">${esc(f.en)}</div><div class="p">${esc(f.pt)}</div></div>
        </div>`).join('')}</div></div>`;
  }
  h+=`<div class="dsec"><h3>🗂️ Cartas desta aula <span class="tag">${b.frases.length}</span></h3>
      <div class="lcta" style="margin:0;padding:0;border:0">
        <div class="info">${b.frases.length===0?'Este bloco não gera cartas — é material de apoio.'
          :(d?'✓ <b style="color:var(--ok)">Cartas enviadas.</b> As '+b.frases.length+' frases já estão na sua fila.'
             :'Terminou de estudar? Envie as <b>'+b.frases.length+' cartas</b> desta aula para a sua fila.')}</div>
        <button class="btn ${d?'':'p'}" data-act="${d?'undo':'send'}" data-l="${b.key}">
          ${d?'Remover da fila':(b.frases.length?'✓ Enviar cartas para estudo':'✓ Marcar como concluída')}</button>
        ${b.frases.length&&d?`<button class="btn" data-act="only" data-l="${b.key}">Estudar só esta aula</button>`:''}
      </div></div>`;
  if(b.quiz&&b.quiz.length){
    const n=S.quiz[b.key];
    h+=`<div class="dsec"><h3>✅ Teste da aula</h3>
      <p class="sub" style="margin:-4px 0 12px">Perguntas sobre o que <b>esta aula</b> ensina —
        a estrutura apresentada e as frases usadas nela.</p>
      ${n!=null?`<div class="lockmsg" style="background:rgba(52,211,153,.08);border-color:rgba(52,211,153,.3)">
          Teste concluído · nota <b style="color:var(--ok);font-size:17px">${n.toFixed(1)}</b>
          &nbsp;<a href="#" data-act="quiz" data-l="${b.key}" style="color:var(--ac)">refazer</a></div>`
       :`<button class="qzbtn" data-act="quiz" data-l="${b.key}"><div class="ic">?</div>
          <div><div class="qn">Fazer o teste desta aula</div>
          <div class="qs">${b.quiz.length} questões · nota de 0 a 10</div></div></button>`}</div>`;
  }
  $('#lDetail').innerHTML=h;
  const pv=sameU[idx-1], nx=sameU[idx+1];
  $('#lNav').innerHTML=(pv?`<button class="btn" data-go="${pv.key}"><span class="k">← ANTERIOR</span><span class="t">${esc(pv.nome.slice(0,38))}</span></button>`:'<div style="flex:1"></div>')
    +(nx?`<button class="btn" data-go="${nx.key}"><span class="k">PRÓXIMA →</span><span class="t">${esc(nx.nome.slice(0,38))}</span></button>`:'<div style="flex:1"></div>');
  $$('#lNav button[data-go]').forEach(x=>x.onclick=()=>openLesson(x.dataset.go));
  go('lesson'); $('main').scrollTop=0;
}
$('#lBack').onclick=()=>go('lessons');
$('#lDetail').addEventListener('click',e=>{
  const t=e.target.closest('[data-act]'); if(!t) return;
  const a=t.dataset.act;
  if(a==='play'){e.preventDefault();playVideo(t);return;}
  if(a==='aud'){e.preventDefault();$('#audBox').innerHTML=`<audio src="${dlURL(t.dataset.a)}" controls autoplay style="width:100%"></audio>`;return;}
  if(a==='aud2'){e.preventDefault();$('#dlgBox').innerHTML=`<audio src="${dlURL(t.dataset.a)}" controls autoplay style="width:100%"></audio>`;return;}
  if(a==='pdf'){e.preventDefault();
    $('#pdfBox').innerHTML=`<div class="vidbox" style="aspect-ratio:3/4"><iframe src="${prevURL(t.dataset.f)}"></iframe></div>
      <div class="vlinks" style="margin-top:10px">
        <a href="${dlURL(t.dataset.f)}" target="_blank" rel="noopener">⤓ Baixar o PDF</a>
        <a href="${viewURL(t.dataset.f)}" target="_blank" rel="noopener">↗ Abrir no ${hostName()}</a></div>`;return;}
  if(a==='say'){e.preventDefault();playPhrase(t.dataset.m,t);return;}
  if(a==='send'||a==='undo'){e.preventDefault();S.done[t.dataset.l]=(a==='send');save();openLesson(t.dataset.l);head();return;}
  if(a==='only'){e.preventDefault();const b=byKey(t.dataset.l);S.cfg.units=[b.u];save();go('study');startSession();return;}
  if(a==='quiz'){e.preventDefault();startQuiz(t.dataset.l);return;}
});
function playVideo(btn){
  const id=btn.dataset.v, wrap=btn.closest('[data-vid]');
  wrap.innerHTML=`<div class="vidbox" data-v="${id}">
      <video id="vp-${id}" src="${dlURL(id)}" controls autoplay playsinline preload="metadata"
        style="position:absolute;inset:0;width:100%;height:100%;background:#000"></video></div>
    <div class="vlinks" style="margin-top:10px">
      <a href="${viewURL(id)}" target="_blank" rel="noopener">↗ Abrir no ${hostName()}</a>
      <a href="${dlURL(id)}" target="_blank" rel="noopener">⤓ Baixar o vídeo</a>
      <a href="#" data-fb="${id}">↻ Não abriu? Usar o player do Google</a></div><div id="vf-${id}"></div>`;
  $$('[data-fb]',wrap).forEach(a=>a.onclick=ev=>{ev.preventDefault();useIframe(id);});
}
function useIframe(id){
  const box=document.querySelector(`.vidbox[data-v="${id}"]`); if(!box||box.dataset.fb)return;
  box.dataset.fb='1';
  box.innerHTML=`<iframe src="${prevURL(id)}" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
  const n=document.getElementById('vf-'+id);
  if(n) n.innerHTML='<div class="lockmsg" style="margin:10px 0 0">Usando o player do Google. '+
    'Se pedir <b>login</b>, confirme que este navegador está logado na conta com acesso à pasta. '+
    'Se já estiver, o navegador está <b>bloqueando cookies de terceiros</b> (padrão no Safari) — use <b>↗ Abrir no Drive</b>.</div>';
}
document.addEventListener('error',e=>{
  const t=e.target; if(t&&t.tagName==='VIDEO'&&t.id.startsWith('vp-')) useIframe(t.id.slice(3));
},true);

/* ============ ÁUDIO ============ */
let AU=null;
function playPhrase(id,btn,cb){
  if(AU){AU.pause();AU=null;}
  $$('.fplay').forEach(x=>{ if(x.textContent!=='—'){x.textContent='▶';x.style.background='var(--bg3)';x.style.color='';} });
  if(!id){ if(cb)cb(); return; }
  AU=new Audio(dlURL(id));
  const isB=btn&&btn.classList.contains('fplay');
  if(isB){btn.textContent='⏸';btn.style.background='var(--ac)';btn.style.color='#fff';}
  const reset=()=>{ if(isB){btn.textContent='▶';btn.style.background='var(--bg3)';btn.style.color='';} };
  AU.onended=()=>{reset(); if(cb)cb();};
  AU.onerror=()=>{reset(); if(cb)cb();};
  AU.play().catch(()=>{reset(); if(cb)cb();});
}

/* ============ SESSÃO SRS ============ */
let SS=null;
function renderSetup(){
  $('#setup').style.display=''; $('#study').style.display='none'; $('#done').style.display='none';
  $$('#optDir .opt').forEach(b=>b.classList.toggle('on',b.dataset.v===S.cfg.dir));
  $$('#optType .opt').forEach(b=>b.classList.toggle('on',b.dataset.v===S.cfg.type));
  $('#optUnit').innerHTML=UNITS.map(u=>
    `<button class="opt${S.cfg.units.includes(u.id)?' on':''}" data-v="${u.id}">${esc(u.nome.replace('Unit ','U'))}</button>`).join('');
  $('#swType').classList.toggle('on',S.cfg.typing);
  $('#swAudio').classList.toggle('on',S.cfg.audio);
  $('#selSize').value=S.cfg.size; $('#selNew').value=S.cfg.nw;
  bindSetup(); updatePool();
}
function bindSetup(){
  $$('#optDir .opt').forEach(b=>b.onclick=()=>{S.cfg.dir=b.dataset.v;save();renderSetup();});
  $$('#optType .opt').forEach(b=>b.onclick=()=>{S.cfg.type=b.dataset.v;save();renderSetup();});
  $$('#optUnit .opt').forEach(b=>b.onclick=()=>{
    const v=b.dataset.v,i=S.cfg.units.indexOf(v);
    if(i<0)S.cfg.units.push(v); else S.cfg.units.splice(i,1);
    save();renderSetup();});
  $('#swType').onclick=()=>{S.cfg.typing=!S.cfg.typing;save();renderSetup();};
  $('#swAudio').onclick=()=>{S.cfg.audio=!S.cfg.audio;save();renderSetup();};
  $('#selSize').onchange=e=>{S.cfg.size=+e.target.value;save();updatePool();};
  $('#selNew').onchange=e=>{S.cfg.nw=+e.target.value;save();updatePool();};
  $('#btnStart').onclick=startSession;
}
function sessionPool(){
  let p=pool();
  if(S.cfg.type!=='all') p=p.filter(c=>c.t===S.cfg.type);
  if(S.cfg.units.length) p=p.filter(c=>S.cfg.units.includes(c.u));
  return p;
}
function updatePool(){
  const p=sessionPool(),t=Date.now();
  const d=p.filter(c=>{const x=S.srs[c.id];return x&&x.next<=t;}).length;
  const n=p.filter(c=>isNew(c.id)).length;
  $('#poolInfo').innerHTML=p.length
    ?`<b>${p.length}</b> cartas no filtro · <b>${d}</b> vencidas · <b>${n}</b> novas.`
    :(S.gate?'Nenhuma carta liberada. Conclua uma aula em <b>Aulas</b> primeiro.':'Nenhuma carta neste filtro.');
}
function startSession(){
  const p=sessionPool(),t=Date.now();
  const due=p.filter(c=>{const x=S.srs[c.id];return x&&x.next<=t;});
  const nw=p.filter(c=>isNew(c.id)).slice(0,S.cfg.nw);
  let q=[...due,...nw]; q.sort(()=>Math.random()-.5); q=q.slice(0,S.cfg.size);
  if(!q.length){ renderSetup();
    $('#poolInfo').innerHTML='<b>Nada para revisar agora.</b> '+
      (pool().length?'Volte mais tarde ou aumente o limite de cartas novas.':'Conclua uma aula para liberar cartas.');
    return; }
  SS={q,i:0,ok:0,tot:q.length,t0:Date.now(),shown:false};
  $('#setup').style.display='none'; $('#study').style.display=''; $('#done').style.display='none';
  paintCard();
}
const curCard=()=>SS?SS.q[SS.i]:null;
const dirOf=()=>S.cfg.dir==='mix'?(Math.random()<.5?'en-pt':'pt-en'):S.cfg.dir;
function paintCard(){
  const c=curCard(); if(!c){endSession();return;}
  SS.dir=dirOf(); SS.shown=false;
  $('#fType').textContent=TCARD[c.t]||'Frase';
  $('#fUnit').textContent=(BY_U.get(c.u)||{}).nome||'—';
  $('#fDir').textContent=SS.dir==='en-pt'?'EN → PT':'PT → EN';
  $('#progBar').style.width=(SS.i/SS.tot*100)+'%';
  $('#qcNew').textContent=SS.q.filter(x=>isNew(x.id)).length;
  $('#qcLearn').textContent=SS.tot-SS.i;
  $('#qcDone').textContent=SS.i;
  $('#fQ').textContent=SS.dir==='en-pt'?c.en:c.pt;
  $('#fSpeak').style.display=(SS.dir==='en-pt'&&c.mp3)?'':'none';
  $('#fAns').style.display='none'; $('#fDiff').style.display='none'; $('#fAcc').style.display='none';
  $('#fShowBtns').style.display=''; $('#fGradeBtns').style.display='none';
  const tb=$('#fType_box');
  if(S.cfg.typing&&SS.dir==='pt-en'){tb.style.display='';$('#fInput').value='';setTimeout(()=>$('#fInput').focus(),60);}
  else tb.style.display='none';
  $$('.iv').forEach(e=>{e.textContent=ivLabel(c.id,+e.dataset.g);});
  if(S.cfg.audio&&SS.dir==='en-pt'&&c.mp3) playPhrase(c.mp3,null);
}
function ivLabel(id,g){
  const x=S.srs[id]||{n:0};
  const base=[0,1,3,7],mult=[0,1,2.2,3.4];
  if(g===0) return '1min';
  const n=Math.min((x.n||0)+1,3);
  const d=Math.round(base[n]*(mult[g]||1));
  return d<1?'10min':d+'d';
}
function showAns(){
  const c=curCard(); if(!c||SS.shown) return;
  SS.shown=true;
  $('#fAns').style.display=''; $('#fA').textContent=SS.dir==='en-pt'?c.pt:c.en;
  if(S.cfg.typing&&SS.dir==='pt-en'){
    const got=($('#fInput').value||'').trim();
    const acc=similar(got,c.en);
    $('#fDiff').style.display=''; $('#fDiff').innerHTML=diffHTML(got,c.en);
    $('#fAcc').style.display='';
    $('#fAcc').innerHTML=`<b style="color:${acc>=.9?'var(--ok)':acc>=.6?'var(--warn)':'var(--bad)'}">${Math.round(acc*100)}% de acerto</b>`;
  }
  $('#fShowBtns').style.display='none'; $('#fGradeBtns').style.display='';
  if(SS.dir==='pt-en'&&c.mp3) playPhrase(c.mp3,null);
}
function norm(s){return (s||'').toLowerCase().replace(/[^a-z0-9\s']/g,'').replace(/\s+/g,' ').trim();}
function similar(a,b){
  a=norm(a);b=norm(b); if(!a||!b)return 0; if(a===b)return 1;
  const A=a.split(' '),B=b.split(' ');let hit=0;const used=new Set();
  A.forEach(w=>{const i=B.findIndex((x,j)=>x===w&&!used.has(j));if(i>=0){hit++;used.add(i);}});
  return hit/Math.max(A.length,B.length);
}
function diffHTML(got,exp){
  const G=norm(got).split(' ').filter(Boolean),E=norm(exp).split(' ');const used=new Set();
  const gh=G.map(w=>{const i=E.findIndex((x,j)=>x===w&&!used.has(j));
    if(i>=0){used.add(i);return `<span style="color:var(--ok)">${esc(w)}</span>`;}
    return `<span style="color:var(--bad);text-decoration:line-through">${esc(w)}</span>`;}).join(' ');
  const miss=E.filter((w,j)=>!used.has(j));
  return `<div style="font-size:14px">${gh||'<i style="color:var(--tx3)">(vazio)</i>'}</div>`+
    (miss.length?`<div style="font-size:12.5px;color:var(--tx3);margin-top:5px">faltou: <b>${esc(miss.join(' '))}</b></div>`:'');
}
function grade(g){
  const c=curCard(); if(!c||!SS.shown) return;
  const x=S.srs[c.id]||{n:0,iv:0};
  const base=[0,1,3,7],mult=[0,1,2.2,3.4];
  if(g===0)x.n=0; else x.n=Math.min((x.n||0)+1,6);
  const d=x.n===0?0:Math.round(base[Math.min(x.n,3)]*(mult[g]||1));
  x.iv=d; x.next=Date.now()+Math.max(d*864e5,g===0?6e4:6e5); x.last=g;
  S.srs[c.id]=x; S.rev++; if(g>0){S.hit++;SS.ok++;}
  const k=today(); S.log[k]=(S.log[k]||0)+1;
  if(S.last!==k){ S.streak=(S.last&&daysBetween(S.last,k)===1)?(S.streak||0)+1:1; S.last=k;
    S.best=Math.max(S.best||0,S.streak); }
  save(); SS.i++; paintCard(); head();
}
const daysBetween=(a,b)=>Math.round((new Date(b)-new Date(a))/864e5);
function endSession(){
  $('#study').style.display='none'; $('#done').style.display='';
  const mins=Math.max(1,Math.round((Date.now()-SS.t0)/6e4));
  $('#dCardsN').textContent=SS.tot;
  $('#dAcc').textContent=Math.round(SS.ok/SS.tot*100)+'%';
  $('#dTime').textContent=mins+'m';
  head();
}
$('#btnShow').onclick=showAns;
$('#btnQuit').onclick=()=>{SS=null;renderSetup();};
$('#btnAgain').onclick=()=>{renderSetup();startSession();};
$('#btnHome').onclick=()=>go('home');
$('#fSpeak').onclick=()=>{const c=curCard();if(c&&c.mp3)playPhrase(c.mp3,null);};
$$('#fGradeBtns .btn').forEach(b=>b.onclick=()=>grade(+b.dataset.g));
document.addEventListener('keydown',e=>{
  if(!$('#p-study').classList.contains('on')||!SS) return;
  if(document.activeElement===$('#fInput')&&e.key!=='Enter') return;
  if(e.key===' '||e.key==='Enter'){e.preventDefault(); if(!SS.shown)showAns(); return;}
  if(SS.shown&&'1234'.includes(e.key)) grade(+e.key-1);
});

/* ============ QUIZ DA AULA ============ */
let Q=null;
function startQuiz(key){
  const b=byKey(key);
  Q={key,qs:b.quiz,i:0,ac:0,ans:[],nome:b.nome};
  delete S.quiz[key]; go('quiz'); paintQuiz();
}
function paintQuiz(){
  const q=Q.qs[Q.i];
  $('#qzHead').innerHTML=`<div class="dpills"><span class="pill">${esc(Q.nome)}</span>
    <span class="pill">Questão ${Q.i+1} de ${Q.qs.length}</span></div>`;
  $('#qzProg').style.width=(Q.i/Q.qs.length*100)+'%';
  $('#qzBody').innerHTML=`<div class="qzq">${q.q}</div>
    <div class="qzo">${q.o.map((o,i)=>`<button data-i="${i}"><span class="l">${'ABCD'[i]}</span><span>${o}</span></button>`).join('')}</div>
    <div id="qzWhy"></div>`;
  $('#qzNext').textContent='Confirmar'; $('#qzNext').disabled=true;
  let sel=null; Q.locked=false;
  $$('#qzBody .qzo button').forEach(b=>b.onclick=()=>{
    if(Q.locked)return; sel=+b.dataset.i;
    $$('#qzBody .qzo button').forEach(x=>x.classList.toggle('sel',x===b));
    $('#qzNext').disabled=false;});
  $('#qzNext').onclick=()=>{
    if(!Q.locked){
      if(sel==null)return; Q.locked=true;
      const good=sel===q.c; if(good)Q.ac++;
      Q.ans.push({q,sel,good});
      $$('#qzBody .qzo button').forEach((b,i)=>{b.disabled=true;
        if(i===q.c)b.classList.add('right'); else if(i===sel)b.classList.add('wrong');});
      $('#qzWhy').innerHTML=`<div class="qzwhy">${good?'✓ <b style="color:var(--ok)">Correto.</b> ':'✕ '}${q.e}</div>`;
      $('#qzNext').textContent=Q.i+1<Q.qs.length?'Próxima questão':'Ver resultado';
    } else { Q.i++; if(Q.i<Q.qs.length)paintQuiz(); else endQuiz(); }
  };
}
function endQuiz(){
  const nota=Q.ac/Q.qs.length*10; S.quiz[Q.key]=nota; save();
  $('#qzProg').style.width='100%'; $('#qzHead').innerHTML='';
  const cor=nota>=7?'var(--ok)':nota>=5?'var(--warn)':'var(--bad)';
  const wr=Q.ans.filter(a=>!a.good);
  $('#qzBody').innerHTML=`<div class="qzres"><div class="big" style="color:${cor}">${nota.toFixed(1)}</div>
    <div class="lbl2">${Q.ac} de ${Q.qs.length} corretas · ${esc(Q.nome)}</div>
    ${wr.length?`<div class="qzrev"><div class="bul">Vale revisar (${wr.length})</div>
      ${wr.map(a=>`<div class="ex"><div class="e">${a.q.q}</div><div class="p">${a.q.e}</div></div>`).join('')}</div>`
      :'<div class="lockmsg" style="background:rgba(52,211,153,.08);border-color:rgba(52,211,153,.3)">Gabarito completo. 👏</div>'}</div>`;
  $('#qzNext').textContent='Voltar para a aula'; $('#qzNext').disabled=false;
  $('#qzNext').onclick=()=>openLesson(Q.key);
}
$('#qzQuit').onclick=()=>{ if(Q)openLesson(Q.key); else go('lessons'); };

/* ============ PROVÕES (modelo Cambridge) ============ */
const LVORDER=EXAMS.map(e=>e.lv);
function missionDone(m){
  const us=UNITS.filter(u=>u.mission===m);
  const tot=us.reduce((a,u)=>a+u.blocos.length,0);
  const dn=us.reduce((a,u)=>a+unitDone(u),0);
  return tot?dn/tot:0;
}
function examUnlocked(lv){
  const e=EXAMS.find(x=>x.lv===lv); if(!e) return false;
  return missionDone(e.mission)>=.6;
}
function curLevel(){
  let cur='—';
  LVORDER.forEach(lv=>{ const r=S.exams[lv]; if(r&&r.apto) cur=lv; });
  return cur;
}
function renderExams(){
  $('#xList').innerHTML=EXAMS.map(e=>{
    const r=S.exams[e.lv], un=examUnlocked(e.lv);
    const prog=Math.round(missionDone(e.mission)*100);
    return `<div class="card" style="margin-bottom:14px">
      <h3>${esc(e.nome)} <span class="tag">${esc(e.mission)}</span>
        ${r?(r.apto?'<span class="pill ok">✓ aprovado · '+Math.round(r.score)+'</span>'
                   :'<span class="pill">última nota '+Math.round(r.score)+'</span>'):''}</h3>
      <p class="sub" style="margin-bottom:12px">${e.desc}</p>
      <div class="prog" style="margin-bottom:10px"><i style="width:${prog}%"></i></div>
      <div class="sm" style="margin-bottom:12px">${prog}% da ${esc(e.mission)} concluída ·
        ${e.qs.length} questões · aprovação com <b>60</b> pontos</div>
      ${un?`<button class="btn p" data-act="exam" data-lv="${e.lv}">${r?'Refazer o provão':'Começar o provão'}</button>`
          :`<div class="lockmsg">🔒 Conclua pelo menos <b>60%</b> da ${esc(e.mission)} para liberar este provão.</div>`}
    </div>`;}).join('');
  $$('#xList [data-act="exam"]').forEach(b=>b.onclick=()=>startExam(b.dataset.lv));
}
let X=null;
function startExam(lv){
  const e=EXAMS.find(x=>x.lv===lv); if(!e) return;
  X={e,i:0,ac:0,ans:[],locked:false};
  go('exam'); paintExam();
}
function paintExam(){
  const q=X.e.qs[X.i];
  $('#xHead').innerHTML=`<div class="dpills">
    <span class="pill">${esc(X.e.nome)}</span>
    <span class="pill">${esc(q.s)}</span>
    <span class="pill">${X.i+1} / ${X.e.qs.length}</span></div>`;
  $('#xProg').style.width=(X.i/X.e.qs.length*100)+'%';
  $('#xBody').innerHTML=`<div class="qzq">${q.q}</div>
    ${q.mp3?`<button class="btn" id="xPlay" style="margin-bottom:14px">🔊 Ouvir de novo</button>`:''}
    <div class="qzo">${q.o.map((o,i)=>`<button data-i="${i}"><span class="l">${'ABCD'[i]}</span><span>${o}</span></button>`).join('')}</div>
    <div id="xWhy"></div>`;
  $('#xNext').textContent='Confirmar'; $('#xNext').disabled=true;
  X.locked=false; let sel=null;
  if(q.mp3){ const pl=$('#xPlay'); if(pl) pl.onclick=()=>playPhrase(q.mp3,null); playPhrase(q.mp3,null); }
  $$('#xBody .qzo button').forEach(b=>b.onclick=()=>{
    if(X.locked)return; sel=+b.dataset.i;
    $$('#xBody .qzo button').forEach(x=>x.classList.toggle('sel',x===b));
    $('#xNext').disabled=false;});
  $('#xNext').onclick=()=>{
    if(!X.locked){
      if(sel==null)return; X.locked=true;
      const good=sel===q.c; if(good)X.ac++;
      X.ans.push({q,sel,good});
      $$('#xBody .qzo button').forEach((b,i)=>{b.disabled=true;
        if(i===q.c)b.classList.add('right'); else if(i===sel)b.classList.add('wrong');});
      $('#xWhy').innerHTML=`<div class="qzwhy">${good?'✓ <b style="color:var(--ok)">Correto.</b> ':'✕ '}${q.why||''}</div>`;
      $('#xNext').textContent=X.i+1<X.e.qs.length?'Próxima':'Ver resultado';
    } else { X.i++; if(X.i<X.e.qs.length)paintExam(); else endExam(); }
  };
}
function endExam(){
  const score=X.ac/X.e.qs.length*100, apto=score>=60;
  const prev=S.exams[X.e.lv];
  if(!prev||score>prev.score) S.exams[X.e.lv]={score,apto,date:today()};
  save();
  $('#xProg').style.width='100%'; $('#xHead').innerHTML='';
  const cor=apto?'var(--ok)':score>=40?'var(--warn)':'var(--bad)';
  // desempenho por competência
  const secs={};
  X.ans.forEach(a=>{ const s=a.q.s; secs[s]=secs[s]||{t:0,o:0}; secs[s].t++; if(a.good)secs[s].o++; });
  const wr=X.ans.filter(a=>!a.good);
  $('#xBody').innerHTML=`<div class="qzres">
      <div class="big" style="color:${cor}">${Math.round(score)}</div>
      <div class="lbl2">${X.ac} de ${X.e.qs.length} corretas · ${apto?'<b style="color:var(--ok)">APROVADO em '+X.e.lv+'</b>':'aprovação em 60 pontos'}</div>
      <div style="text-align:left;margin-top:18px">
        ${Object.keys(secs).map(s=>{const v=secs[s],p=v.o/v.t*100;
          return `<div style="margin-bottom:11px">
            <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600">
              <span>${esc(s)}</span><b>${v.o}/${v.t}</b></div>
            <div class="prog" style="margin-top:4px"><i style="width:${p}%;background:${p>=60?'var(--ok)':'var(--warn)'}"></i></div>
          </div>`;}).join('')}
      </div>
      ${wr.length?`<div class="qzrev"><div class="bul">Revisar (${wr.length})</div>
        ${wr.slice(0,10).map(a=>`<div class="ex"><div class="e">${a.q.q}</div><div class="p">${a.q.why||''}</div></div>`).join('')}</div>`:''}
    </div>`;
  $('#xNext').textContent='Voltar aos provões'; $('#xNext').disabled=false;
  $('#xNext').onclick=()=>{X=null;go('exams');};
}
$('#xQuit').onclick=()=>{X=null;go('exams');};
$('#xBack').onclick=()=>go('stats');

/* ============ LISTENING ============ */
let W={list:[],playing:false};
function renderListen(){
  const sel=$('#wUnit');
  const blocos=LESSONS.filter(b=>b.frases.some(f=>f.mp3));
  if(!sel.options.length||sel.options.length<2){
    sel.innerHTML=UNITS.map(u=>{
      const bs=blocos.filter(b=>b.u===u.id);
      return bs.length?`<optgroup label="${esc(u.nome)}">`+
        bs.map(b=>`<option value="${b.key}">${esc(b.nome)}</option>`).join('')+'</optgroup>':'';
    }).join('');
  }
  sel.onchange=paintLines;
  $('#wTrans').onclick=()=>{$('#wTrans').classList.toggle('on');paintLines();};
  $('#wLoop').onclick=()=>$('#wLoop').classList.toggle('on');
  $('#wPlay').onclick=playAll; $('#wStop').onclick=stopAll;
  paintLines();
}
function paintLines(){
  const b=byKey($('#wUnit').value); if(!b) return;
  const tr=$('#wTrans').classList.contains('on');
  W.list=b.frases.filter(f=>f.mp3);
  const dlg=b.dialogo&&b.dialogo.length;
  $('#wReal').style.display=dlg?'':'none';
  if(dlg) $('#wAudioBox').innerHTML=b.dialogo.map(x=>
    `<div style="margin-bottom:10px"><div class="sm" style="margin-bottom:4px">${esc(x.n.replace(/\.mp3$/i,'').replace(/_/g,' '))}</div>
     <audio src="${dlURL(x.id)}" controls style="width:100%"></audio></div>`).join('');
  $('#wLines').innerHTML=W.list.map((f,i)=>
    `<div class="li wline" data-i="${i}" style="cursor:pointer">
      <div style="flex:1"><div style="font-size:15px;font-weight:600">${esc(f.en)}</div>
      ${tr?`<div class="sm" style="margin-top:2px">${esc(f.pt)}</div>`:''}</div>
      <span class="pill">${i+1}</span></div>`).join('')
    ||'<div class="note">Este bloco não tem frases com áudio.</div>';
  $$('#wLines .wline').forEach(e=>e.onclick=()=>{stopAll();playIdx(+e.dataset.i,false);});
}
function hl(i){ $$('#wLines .wline').forEach(e=>{
  const on=+e.dataset.i===i; e.style.background=on?'var(--bg3)':''; e.style.borderRadius='10px';}); }
function playIdx(i,chain){
  const f=W.list[i];
  if(!f){ if(chain&&$('#wLoop').classList.contains('on')){playIdx(0,true);return;} W.playing=false; hl(-1); return; }
  hl(i); playPhrase(f.mp3,null,()=>{ if(W.playing&&chain) playIdx(i+1,true); });
}
function playAll(){W.playing=true;playIdx(0,true);}
function stopAll(){W.playing=false;if(AU){AU.pause();AU=null;}hl(-1);}

/* ============ EXERCÍCIOS ============ */
let DR=null;
function renderDrillSetup(){
  $('#dSetup').style.display=''; $('#dArea').style.display='none'; $('#dDone').style.display='none';
  const sel=$('#dUnit');
  if(sel.options.length<=1)
    sel.innerHTML='<option value="">Todas as units</option>'+
      UNITS.map(u=>`<option value="${u.id}">${esc(u.nome)}</option>`).join('');
  $$('#dMode .opt').forEach(b=>b.onclick=()=>{$$('#dMode .opt').forEach(x=>x.classList.remove('on'));b.classList.add('on');});
  $('#dStart').onclick=startDrill;
}
function startDrill(){
  const mode=$('#dMode .opt.on').dataset.v, uu=$('#dUnit').value;
  let p=pool(); if(uu) p=p.filter(c=>c.u===uu);
  if(mode==='listen') p=p.filter(c=>c.mp3);
  if(p.length<4){
    $('#dSetup').insertAdjacentHTML('beforeend',
      '<div class="note" id="dWarn" style="margin-top:10px">Precisa de pelo menos 4 cartas liberadas neste filtro. Conclua mais aulas.</div>');
    setTimeout(()=>{const w=$('#dWarn');if(w)w.remove();},3000); return;
  }
  const q=[...p].sort(()=>Math.random()-.5).slice(0,10);
  DR={mode,q,i:0,ok:0,locked:false,pool:p};
  $('#dSetup').style.display='none'; $('#dArea').style.display=''; $('#dDone').style.display='none';
  paintDrill();
}
function paintDrill(){
  const c=DR.q[DR.i]; if(!c){endDrill();return;}
  DR.locked=false;
  $('#dKind').textContent={choice:'Múltipla escolha',gap:'Complete a lacuna',order:'Ordene a frase',listen:'Ditado'}[DR.mode];
  $('#dU').textContent=(BY_U.get(c.u)||{}).nome||'—';
  $('#dProg').style.width=(DR.i/DR.q.length*100)+'%';
  $('#dScore').textContent=DR.ok; $('#dOf').textContent='/'+DR.q.length;
  $('#dFb').style.display='none'; $('#dNext').textContent='Confirmar';
  const B=$('#dBody');
  if(DR.mode==='choice'){
    $('#dPrompt').textContent='Qual é a tradução?';
    $('#dQ').textContent=c.pt;
    const vis=new Set([c.en]); const outros=[];
    for(const x of [...DR.pool].sort(()=>Math.random()-.5)){
      if(vis.has(x.en))continue; vis.add(x.en); outros.push(x); if(outros.length===3)break; }
    DR.opts=[c,...outros].sort(()=>Math.random()-.5);
    B.innerHTML=`<div class="qzo">${DR.opts.map((o,i)=>`<button data-i="${i}"><span class="l">${'ABCD'[i]}</span><span>${esc(o.en)}</span></button>`).join('')}</div>`;
    DR.sel=null;
    $$('button',B).forEach(b2=>b2.onclick=()=>{if(DR.locked)return;DR.sel=+b2.dataset.i;
      $$('button',B).forEach(x=>x.classList.toggle('sel',x===b2));});
  }
  if(DR.mode==='gap'){
    const ws=c.en.split(' '); const gi=Math.floor(Math.random()*ws.length);
    DR.gap=ws[gi].replace(/[^\w']/g,'');
    $('#dPrompt').textContent='Complete a palavra que falta';
    $('#dQ').innerHTML=ws.map((w,i)=>i===gi?'<b style="color:var(--ac)">_____</b>':esc(w)).join(' ');
    B.innerHTML=`<div class="typebox"><input id="dIn" placeholder="a palavra…" autocomplete="off" spellcheck="false"></div>
      <div class="sm" style="margin-top:8px;text-align:center">${esc(c.pt)}</div>`;
    setTimeout(()=>{const e=$('#dIn');if(e)e.focus();},60);
  }
  if(DR.mode==='order'){
    $('#dPrompt').textContent='Toque nas palavras na ordem certa';
    $('#dQ').textContent=c.pt;
    DR.words=c.en.split(' '); DR.pick=[];
    B.innerHTML=`<div id="dPick" style="min-height:44px;border:1px dashed var(--line2);border-radius:10px;
      padding:9px;margin-bottom:10px;display:flex;gap:6px;flex-wrap:wrap"></div>
      <div id="dBank" style="display:flex;gap:6px;flex-wrap:wrap"></div>`;
    paintOrder();
  }
  if(DR.mode==='listen'){
    $('#dPrompt').textContent='Ouça e escreva em inglês';
    $('#dQ').textContent='🔊';
    B.innerHTML=`<button class="btn" id="dPlay" style="width:100%;margin-bottom:10px">▶ Ouvir de novo</button>
      <div class="typebox"><input id="dIn" placeholder="escreva o que ouviu…" autocomplete="off" spellcheck="false"></div>`;
    const pl=$('#dPlay'); if(pl) pl.onclick=()=>playPhrase(c.mp3,null);
    if(c.mp3) playPhrase(c.mp3,null);
    setTimeout(()=>{const e=$('#dIn');if(e)e.focus();},60);
  }
}
function paintOrder(){
  const bank=DR.words.map((w,i)=>({w,i})).filter(x=>!DR.pick.includes(x.i)).sort((a,b)=>a.w.localeCompare(b.w));
  $('#dPick').innerHTML=DR.pick.map(i=>`<button class="opt on" data-p="${i}">${esc(DR.words[i])}</button>`).join('');
  $('#dBank').innerHTML=bank.map(x=>`<button class="opt" data-b="${x.i}">${esc(x.w)}</button>`).join('');
  $$('#dBank button').forEach(b=>b.onclick=()=>{if(DR.locked)return;DR.pick.push(+b.dataset.b);paintOrder();});
  $$('#dPick button').forEach(b=>b.onclick=()=>{if(DR.locked)return;
    DR.pick=DR.pick.filter(x=>x!==+b.dataset.p);paintOrder();});
}
$('#dNext').onclick=()=>{
  if(!DR)return;
  const c=DR.q[DR.i];
  if(!DR.locked){
    let good=false,msg='';
    if(DR.mode==='choice'){ if(DR.sel==null)return; good=DR.opts[DR.sel].id===c.id;
      $$('#dBody button').forEach((b,i)=>{b.disabled=true;
        if(DR.opts[i].id===c.id)b.classList.add('right'); else if(i===DR.sel)b.classList.add('wrong');}); }
    if(DR.mode==='gap'){ const v=($('#dIn').value||'').trim().toLowerCase();
      good=v===DR.gap.toLowerCase(); msg=good?'':`Era <b>${esc(DR.gap)}</b>`; }
    if(DR.mode==='order'){ good=DR.pick.map(i=>DR.words[i]).join(' ')===c.en;
      msg=good?'':`Era: <b>${esc(c.en)}</b>`; }
    if(DR.mode==='listen'){ const v=($('#dIn').value||'').trim();
      good=similar(v,c.en)>=.85; msg=good?'':`Era: <b>${esc(c.en)}</b>`; }
    if(good)DR.ok++;
    DR.locked=true;
    $('#dFb').style.display='';
    $('#dFb').innerHTML=good?'<span style="color:var(--ok)">✓ Correto!</span>':'<span style="color:var(--bad)">✕ </span>'+msg;
    $('#dScore').textContent=DR.ok;
    $('#dNext').textContent=DR.i+1<DR.q.length?'Próxima':'Ver resultado';
  } else { DR.i++; if(DR.i<DR.q.length)paintDrill(); else endDrill(); }
};
function endDrill(){
  $('#dArea').style.display='none'; $('#dDone').style.display='';
  $('#dFinal').textContent=DR.ok+'/'+DR.q.length;
  $('#dPct').textContent=Math.round(DR.ok/DR.q.length*100)+'%';
}
$('#dQuit').onclick=()=>{DR=null;renderDrillSetup();};
$('#dAgain').onclick=()=>renderDrillSetup();

/* ============ LIVES ============ */
function renderLives(){
  const sel=$('#lvUnit');
  if(sel&&!sel.options.length){
    sel.innerHTML=UNITS.map(u=>`<option value="${u.id}">${esc(u.nome)}</option>`).join('');
    sel.value=S.curU||UNITS[0].id;
    sel.onchange=paintLives;
  }
  paintLives();
}
function paintLives(){
  const uid=$('#lvUnit')?$('#lvUnit').value:UNITS[0].id;
  const u=BY_U.get(uid)||UNITS[0]; const L=u.lives||{sync:[],tema:[]};
  const grp=(arr,tit,desc)=>!arr.length?'':`<div class="dsec"><h3>${tit} <span class="tag">${arr.length}</span></h3>
    <p class="sub" style="margin:-4px 0 14px">${desc}</p>
    ${arr.map(x=>{
      const br=x.data?`${x.data.slice(8)}/${x.data.slice(5,7)}/${x.data.slice(0,4)}`:'—';
      const link=x.mp4_id?`<a href="${viewURL(x.mp4_id)}" target="_blank" rel="noopener">▶ assistir</a>`
        :(x.html_id?`<a href="${viewURL(x.html_id)}" target="_blank" rel="noopener">↗ ficha</a>`
        :'<span style="color:var(--tx3);font-size:12.5px">sem arquivo na pasta</span>');
      return `<div class="ex" style="display:flex;gap:12px;align-items:baseline;flex-wrap:wrap">
        <b style="color:var(--tx3);font-size:12.5px;min-width:76px">${br}</b>
        <span class="pill">${x.mp4_id?'MP4':(x.html_id?'ficha':'—')}</span>
        <span style="flex:1;min-width:190px;font-size:13.5px">${esc(x.desc)}</span>
        <span class="vlinks" style="margin:0">${link}</span></div>`;}).join('')}</div>`;
  const total=L.sync.length+L.tema.length;
  $('#lvBody').innerHTML=
    `<div class="lockmsg" style="margin-bottom:16px">${esc(u.nome)} · grade original: <b>${esc(L.semana||'—')}</b>
      · ${total} live(s) ligada(s)</div>`+
    (grp(L.sync,'▶️ SYNC','Lives da mesma semana em que a turma original fez esta unit — assista junto com a aula.')+
     grp(L.tema,'🔗 TEMA','Lives posteriores que retomam o mesmo assunto — reforço ao concluir a unit.')
     ||'<div class="note">Esta unit não tem lives mapeadas.</div>')+
    `<div class="dsec"><div class="lockmsg">Lives marcadas como <i>sem arquivo</i> aconteceram,
      mas não têm vídeo na pasta: ficaram só no registro da plataforma.</div></div>`;
}

/* ============ EXPLORAR ============ */
let bLim=60;
function renderBrowse(){
  const sel=$('#bUnit');
  if(sel.options.length<=1)
    sel.innerHTML='<option value="">Todas as units</option>'+
      UNITS.map(u=>`<option value="${u.id}">${esc(u.nome)}</option>`).join('');
  ['bSearch','bUnit','bType','bStat'].forEach(id=>{
    const e=$('#'+id); if(e) e.oninput=e.onchange=()=>{bLim=60;paintBrowse();};});
  $('#bMore').onclick=()=>{bLim+=60;paintBrowse();};
  paintBrowse();
}
function paintBrowse(){
  const q=($('#bSearch').value||'').toLowerCase(),u=$('#bUnit').value,t=$('#bType').value,s=$('#bStat').value;
  const L=CARDS.filter(c=>{
    if(u&&c.u!==u)return false;
    if(t&&c.t!==t)return false;
    if(s==='new'&&!isNew(c.id))return false;
    if(s==='mast'&&!isMast(c.id))return false;
    if(s==='learn'&&(isNew(c.id)||isMast(c.id)))return false;
    if(q&&!(c.en+' '+c.pt).toLowerCase().includes(q))return false;
    return true;});
  $('#bCount').textContent=`${L.length} frase(s)`;
  $('#bList').innerHTML=L.slice(0,bLim).map(c=>{
    const tag=isNew(c.id)?'<span class="pill">nova</span>':isMast(c.id)?'<span class="pill ok">dominada</span>':'<span class="pill">aprendendo</span>';
    return `<div class="li" style="display:flex;gap:11px;align-items:flex-start">
      <button class="fplay" data-m="${c.mp3||''}"
        style="width:30px;height:30px;border-radius:50%;background:var(--bg3);border:1px solid var(--line2);flex-shrink:0;font-size:11px">${c.mp3?'▶':'—'}</button>
      <div style="flex:1;min-width:0"><div style="font-size:14.5px;font-weight:600">${esc(c.en)}</div>
      <div class="sm">${esc(c.pt)}</div>
      <div class="sm" style="opacity:.7;margin-top:2px">${esc((BY_U.get(c.u)||{}).nome||'')} · ${esc(c.src)}</div></div>
      <div style="display:flex;gap:6px;align-items:center;flex-shrink:0">${tag}</div></div>`;}).join('');
  $('#bMore').style.display=L.length>bLim?'':'none';
  $$('#bList .fplay').forEach(b=>b.onclick=()=>playPhrase(b.dataset.m,b));
}

/* ============ PLANO ============ */
function renderPlan(){
  const sel=$('#pUnit');
  if(sel&&!sel.options.length){
    sel.innerHTML=UNITS.map(u=>`<option value="${u.id}">${esc(u.nome)}</option>`).join('');
    sel.value=S.curU||UNITS[0].id;
    sel.onchange=()=>{S.curU=sel.value;save();renderPlan();};
  }
  $$('#pPace .opt').forEach(b=>{b.classList.toggle('on',b.dataset.v===S.pace);
    b.onclick=()=>{S.pace=b.dataset.v;save();renderPlan();};});
  const u=BY_U.get(sel?sel.value:UNITS[0].id)||UNITS[0];
  const pdf=(u.ritmos||{})[S.pace];
  $('#pNote').innerHTML=`Ritmo de <b>${S.pace} meses</b> — no intensivo, 1 unit por semana. `+
    (pdf?`<a href="#" id="pPdf" style="color:var(--ac)">Ver o cronograma oficial desta unit em PDF →</a>`
        :'<span class="sm">(esta unit não tem PDF de cronograma)</span>');
  const plano=u.plano||[];
  const done=plano.filter(d=>S.plan[u.id+'/'+d.d]).length;
  $('#planList').innerHTML=`<div class="card" style="margin-bottom:14px">
      <h3>${esc(u.nome)} <span class="tag">${done}/${plano.length} dias</span></h3>
      <div class="prog" style="margin-bottom:14px"><i style="width:${plano.length?done/plano.length*100:0}%"></i></div>
      ${plano.map(d=>{
        const ck=!!S.plan[u.id+'/'+d.d];
        return `<div class="row" style="align-items:flex-start">
          <div style="flex:1"><div class="lbl">Dia ${d.d} — ${esc(d.t)}</div>
            <div class="desc">${esc(d.desc)}</div>
            ${d.b.length?`<div class="vlinks" style="margin-top:7px">${d.b.map(n=>{
              const b=byKey(u.id+'/'+n); return b?`<a href="#" data-goles="${b.key}">→ ${esc(b.nome)}</a>`:'';}).join('')}</div>`:''}
          </div>
          <button class="sw${ck?' on':''}" data-day="${u.id}/${d.d}"><i></i></button></div>`;}).join('')}
    </div>`;
  const pp=$('#pPdf');
  if(pp) pp.onclick=e=>{e.preventDefault();
    $('#planList').insertAdjacentHTML('afterbegin',
      `<div class="card" style="margin-bottom:14px" id="pdfCard"><h3>Journey Schedule · ${S.pace} meses</h3>
        <div class="vidbox" style="aspect-ratio:3/4"><iframe src="${prevURL(pdf)}"></iframe></div>
        <div class="vlinks" style="margin-top:10px">
          <a href="${dlURL(pdf)}" target="_blank" rel="noopener">⤓ Baixar</a>
          <a href="#" id="pdfX">✕ Fechar</a></div></div>`);
    const x=$('#pdfX'); if(x) x.onclick=ev=>{ev.preventDefault();$('#pdfCard').remove();};};
  $$('#planList [data-day]').forEach(b=>b.onclick=()=>{
    const k=b.dataset.day; S.plan[k]=!S.plan[k]; save(); renderPlan();});
  $$('#planList [data-goles]').forEach(a=>a.onclick=e=>{e.preventDefault();openLesson(a.dataset.goles);});
}

/* ============ PROGRESSO ============ */
function renderStats(){
  const p=pool();
  $('#tRev').textContent=S.rev||0;
  $('#tAcc').textContent=S.rev?Math.round((S.hit||0)/S.rev*100)+'%':'—';
  $('#tBest').textContent=S.best||0;
  const seen=Object.keys(S.srs).length;
  $('#tCov').textContent=Math.round(seen/CARDS.length*100)+'%';
  $('#tCovD').textContent=`${seen} de ${CARDS.length} frases`;
  renderLevel();
  const nw=p.filter(c=>isNew(c.id)).length;
  const lr=p.filter(c=>{const x=S.srs[c.id];return x&&x.iv<21;}).length;
  const ms=p.filter(c=>isMast(c.id)).length;
  const tt=Math.max(1,nw+lr+ms);
  $('#matBars').innerHTML=[['Novas',nw,'var(--ac)'],['Aprendendo',lr,'var(--warn)'],['Dominadas',ms,'var(--ok)']]
    .map(([k,v,c])=>`<div style="margin-bottom:11px">
      <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600"><span>${k}</span><b>${v}</b></div>
      <div class="prog" style="margin-top:4px"><i style="width:${v/tt*100}%;background:${c}"></i></div></div>`).join('');
  const fc=new Array(14).fill(0),now=Date.now();
  Object.values(S.srs).forEach(x=>{const d=Math.floor((x.next-now)/864e5);if(d>=0&&d<14)fc[d]++;});
  const mx=Math.max(1,...fc);
  $('#fcBars').innerHTML=fc.map((v,i)=>`<b style="height:${Math.max(v/mx*100,3)}%" title="dia +${i}: ${v}"></b>`).join('');
  // por unit
  $('#unitProg').innerHTML=UNITS.map(u=>{
    const cs=unitCards(u.id); const vis=cs.filter(c=>!isNew(c.id)).length;
    const d=unitDone(u), t=u.blocos.length;
    return `<div style="margin-bottom:11px">
      <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600">
        <span>${d===t?'✓ ':''}${esc(u.nome)}</span><b>${vis}/${cs.length}</b></div>
      <div class="prog" style="margin-top:4px"><i style="width:${cs.length?vis/cs.length*100:0}%"></i></div></div>`;}).join('');
  // boletim
  const comQ=LESSONS.filter(b=>b.quiz&&b.quiz.length);
  const feitos=comQ.filter(b=>S.quiz[b.key]!=null);
  const med=feitos.length?feitos.reduce((a,b)=>a+S.quiz[b.key],0)/feitos.length:null;
  $('#qzStats').innerHTML=
    `<div class="sm" style="margin-bottom:12px">${feitos.length} de ${comQ.length} testes feitos${
      med!=null?` · média <b style="color:${med>=7?'var(--ok)':'var(--warn)'};font-size:15px">${med.toFixed(1)}</b>`:''}</div>`+
    (feitos.length?feitos.slice(-14).reverse().map(b=>{const n=S.quiz[b.key];
      const c=n>=7?'var(--ok)':n>=5?'var(--warn)':'var(--bad)';
      return `<div style="margin-bottom:11px">
        <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600">
          <span>${esc(b.uNome)} · ${esc(b.nome)}</span><b style="color:${c}">${n.toFixed(1)}</b></div>
        <div class="prog" style="margin-top:4px"><i style="width:${n*10}%;background:${c}"></i></div></div>`;}).join('')
      :'<div class="note">Nenhum teste feito ainda.</div>');
  $('#swGate').classList.toggle('on',S.gate);
  $('#swGate').onclick=()=>{S.gate=!S.gate;save();renderStats();head();};
  $('#stReset').onclick=()=>{ if(confirm('Zerar todo o progresso do curso?')){
    localStorage.removeItem(KEY); S=load(); renderStats(); head(); go('home'); }};
}
function renderLevel(){
  const el=$('#lvChart'); if(!el) return;
  const cur=curLevel();
  const bars=EXAMS.map(e=>{
    const r=S.exams[e.lv],sc=r?r.score:0,un=examUnlocked(e.lv);
    const col=r&&r.apto?'var(--ok)':sc>0?'var(--warn)':un?'var(--line2)':'var(--bg3)';
    return `<div class="c"><div class="vv" style="color:${sc?col:'var(--tx3)'}">${sc?Math.round(sc):'–'}</div>
      <div class="bb"><i style="height:${Math.max(sc,2)}%;background:${col}"></i></div>
      <div class="nn" style="${r&&r.apto?'color:var(--ok)':''}">${e.lv}${r&&r.apto?' ✓':''}</div></div>`;}).join('');
  const nextLv=EXAMS.find(e=>!(S.exams[e.lv]&&S.exams[e.lv].apto));
  el.innerHTML=`<div class="lvnow">
      <div class="bg2">${cur}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:14.5px;font-weight:750">${cur==='—'?'Nível ainda não certificado':'Nível '+cur+' alcançado'}</div>
        <div class="sm">${nextLv?`Próximo desafio: provão ${nextLv.nome}`:'Todos os níveis concluídos 🎉'}</div>
      </div>
      <button class="btn p" id="goExams" style="padding:9px 15px;font-size:13px;flex-shrink:0">${cur==='—'?'Começar':'Continuar'}</button>
    </div>
    <div class="lvbar">${bars}</div>
    <p class="sm" style="text-align:center;font-size:11px;margin-top:2px">pontuação por provão · aprovação em 60</p>`;
  const g=$('#goExams'); if(g) g.onclick=()=>go('exams');
}

/* ---- boot ---- */
renderHome();
})();
