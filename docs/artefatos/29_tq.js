const p=require('puppeteer');const fs=require('fs');
let P=0,F=0;const ok=(n,c,d='')=>{c?(P++,console.log('  OK  '+n)):(F++,console.log('  XX  '+n+(d?' :: '+d:'')));};
const S=s=>new Promise(r=>setTimeout(r,s));
const AUD=fs.readFileSync('/home/user/ingles/audit.js','utf8');
const ALVO=process.argv[2];              // 'fr' | 'en'
const CFG={
  fr:{url:'http://127.0.0.1:8817/Frances_Curso_Completo.html',cartas:3766,units:30,
      exames:4,seuil:50,minEp:5,unitId:'unit_02',lang:'fr-FR'},
  en:{url:'http://127.0.0.1:8817/Ingles_Curso_Completo_Claro_v2.html',cartas:2057,units:25,
      exames:3,seuil:60,minEp:0,unitId:'unit_08',lang:'en-US'}
}[ALVO];
(async()=>{
const b=await p.launch({args:['--no-sandbox','--disable-setuid-sandbox','--autoplay-policy=no-user-gesture-required']});
const pg=await b.newPage(); await pg.setViewport({width:1360,height:940});
let jsErr=0;
pg.on('pageerror',e=>{jsErr++;console.log('  XX JS: '+String(e).slice(0,90));});
await pg.evaluateOnNewDocument(()=>{window.__spoken=[];
  const i=setInterval(()=>{if(window.speechSynthesis){clearInterval(i);
    const o=speechSynthesis.speak.bind(speechSynthesis);
    speechSynthesis.speak=u=>{window.__spoken.push({t:u.text,l:u.lang});try{o(u);}catch(e){}};}},40);});
await pg.goto(CFG.url,{waitUntil:'networkidle0'}); await S(900);

const D=await pg.evaluate(()=>JSON.parse(document.getElementById('DATA').textContent));
ok('dataset íntegro',D.cards.length===CFG.cartas&&D.units.length===CFG.units);

/* ---- quiz de aula no padrão do espanhol ---- */
const blocos=D.units.flatMap(u=>u.blocos);
const cq=blocos.filter(b=>b.quiz&&b.quiz.length);
const tot=cq.reduce((a,b)=>a+b.quiz.length,0);
ok('média >= 7 questões/aula',tot/cq.length>=7,(tot/cq.length).toFixed(1));
ok('mais de 1000 questões',tot>1000,''+tot);
const tipos=new Set();
cq.forEach(b=>b.quiz.forEach(q=>{
  const t=q.q.replace(/<[^>]+>/g,'');
  if(/Como se diz/.test(t))tipos.add('traducao');
  if(/O que significa/.test(t))tipos.add('significado');
  if(/Complete a frase/.test(t))tipos.add('lacuna');
  if(/vem logo depois/.test(t))tipos.add('sequencia');
  if(/Ouça e escolha/.test(t))tipos.add('audio');
  if(/Qual destas afirmações/.test(t))tipos.add('teoria');
}));
ok('>= 5 tipos de enunciado',tipos.size>=5,[...tipos].join(','));
ok('questões de áudio existem',tipos.has('audio'));
ok('todas válidas',cq.every(b=>b.quiz.every(q=>q.o.length===4&&new Set(q.o).size===4&&q.c>=0&&q.c<4)));

/* ---- provões no formato rico ---- */
ok('nº de provões',D.exams.length===CFG.exames);
ok('provões com secs',D.exams.every(e=>Array.isArray(e.secs)&&e.secs.length===4));
ok('seções com instrução',D.exams.every(e=>e.secs.every(s=>s.i&&s.n&&s.qs.length)));
ok('metadados ricos',D.exams.every(e=>e.nome&&e.desc&&e.foco&&e.total));
ok('seuil correto',D.exams.every(e=>e.seuil===CFG.seuil));
ok('24 questões por provão',D.exams.every(e=>e.total===24));
ok('áudio no listening',D.exams.every(e=>e.qs.filter(q=>q.mp3).length===6));

/* ---- quiz roda com áudio ---- */
await pg.click('nav > button[data-p="lessons"]'); await S(500);
await pg.select('#lUnit',CFG.unitId); await S(500);
const idx=await pg.evaluate(u=>{
  const h=[...document.querySelectorAll('#lList .lhead')];
  const D=JSON.parse(document.getElementById('DATA').textContent);
  const un=D.units.find(x=>x.id===u);
  const a=un.blocos.find(b=>b.quiz&&b.quiz.some(q=>q.mp3));
  return a?h.findIndex(x=>x.dataset.open===u+'/'+a.num):-1;},CFG.unitId);
ok('achou aula com quiz de áudio',idx>=0);
if(idx>=0){
  await pg.evaluate(i=>document.querySelectorAll('#lList .lhead')[i].click(),idx); await S(600);
  await pg.evaluate(()=>{window.__spoken=[];const q=document.querySelector('.qzbtn');if(q)q.click();});
  await S(900);
  ok('quiz abre',await pg.$eval('#p-quiz',e=>e.classList.contains('on')));
  const nq=await pg.evaluate(()=>{const m=document.querySelector('#qzHead').innerText.match(/(\d+)\s*$/);return m?+m[1]:0;});
  ok('quiz com 7+ questões',nq>=7,''+nq);
  // percorre até achar uma de áudio
  let achouAudio=false;
  for(let i=0;i<nq;i++){
    if(await pg.$('#qzPlay')) achouAudio=true;
    await pg.click('.qzo button[data-i="0"]'); await S(80);
    await pg.click('#qzNext'); await S(170);
    await pg.click('#qzNext'); await S(180);
  }
  ok('quiz teve questão com player de áudio',achouAudio);
  ok('quiz fecha com nota',(await pg.$$eval('.qzres .big',e=>e.length))===1);
  const sp=await pg.evaluate(()=>window.__spoken);
  ok('áudio do quiz usa o idioma certo',sp.length===0||sp.every(x=>x.l===CFG.lang),JSON.stringify(sp[0]||{}));
  await pg.click('#qzNext'); await S(500);
}

/* ---- provão roda ---- */
await pg.evaluate(()=>{
  const D=JSON.parse(document.getElementById('DATA').textContent);
  const k=Object.keys(localStorage).find(x=>x.startsWith('mh_'))||
          (D.curso==='frances'?'mh_fr_full_v1':'mh_en_full_v3');
  const S0=JSON.parse(localStorage.getItem(k)||'{}');
  S0.done=S0.done||{};
  D.units.forEach(u=>u.blocos.forEach(b=>S0.done[u.id+'/'+b.num]=true));
  localStorage.setItem(k,JSON.stringify(S0));});
await pg.reload({waitUntil:'networkidle0'}); await S(900);
await pg.click('#moreBtn'); await S(220);
await pg.click('#moreMenu [data-p="exams"]'); await S(700);
ok('cards de provão',(await pg.$$eval('#xList .card',e=>e.length))===CFG.exames);
ok('card mostra Foco',/Foco:/.test(await pg.$eval('#xList',e=>e.innerText)));
ok('todos liberados',(await pg.$$eval('#xList [data-act="exam"]',e=>e.length))===CFG.exames);
await pg.click('#xList [data-act="exam"]'); await S(700);
ok('provão abre',await pg.$eval('#p-exam',e=>e.classList.contains('on')));
ok('mostra instrução da seção',(await pg.$eval('#xHead',e=>e.innerText)).split('\n').length>=2);
const corr=await pg.evaluate(()=>JSON.parse(document.getElementById('DATA').textContent).exams[0].qs.map(q=>q.c));
for(let i=0;i<24;i++){
  await pg.click(`#xBody .qzo button[data-i="${corr[i]}"]`); await S(55);
  await pg.click('#xNext'); await S(120);
  await pg.click('#xNext'); await S(130);
}
const res=await pg.$eval('.qzres',e=>e.innerText);
ok('provão fecha com resultado',/\d+/.test(res));
ok('4 barras de competência',(await pg.$$eval('.qzres .prog',e=>e.length))===4);
if(ALVO==='fr'){
  ok('notas em /25',/\/25/.test(res),res.slice(0,60).replace(/\n/g,' '));
  ok('aprovado com gabarito',/APROVADO/.test(res));
}

/* ---- contraste ---- */
await pg.click('#xNext').catch(()=>{}); await S(500);
let bad=0;
for(const t of ['home','lessons','stats']){
  await pg.click('nav > button[data-p="'+t+'"]'); await S(450);
  await pg.evaluate(AUD); bad+=(await pg.evaluate(()=>window.__audit())).length;}
ok('contraste AA',bad===0,''+bad);
ok('sem erro de JS',jsErr===0,''+jsErr);
console.log(`\n${P} passaram, ${F} falharam`);
await b.close(); process.exit(F?1:0);})();
