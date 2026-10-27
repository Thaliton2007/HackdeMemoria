const p=require('puppeteer');const fs=require('fs');
let P=0,F=0;const ok=(n,c,d='')=>{c?(P++,console.log('  OK  '+n)):(F++,console.log('  XX  '+n+(d?' :: '+d:'')));};
const S=s=>new Promise(r=>setTimeout(r,s));
const AUD=fs.readFileSync('/home/user/ingles/audit.js','utf8');
const URL_='http://127.0.0.1:8822/Frances_Curso_Completo.html';
const KEY='mh_fr_full_v1';
(async()=>{
const b=await p.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
const pg=await b.newPage(); await pg.setViewport({width:1360,height:960});
let jsErr=0; pg.on('pageerror',e=>{jsErr++;console.log('  XX JS: '+String(e).slice(0,95));});

/* ---------- BANDEIRA ---------- */
await pg.goto(URL_,{waitUntil:'networkidle0'}); await S(900);
ok('bandeira no logo',(await pg.$$eval('.logo .bnd',e=>e.length))===1);
ok('bandeira no avatar',(await pg.$$eval('.avatar .bnd',e=>e.length))===1);
ok('bandeira é SVG (não emoji)',(await pg.$eval('.logo .bnd',e=>e.tagName.toLowerCase()))==='svg');
ok('bandeira tem as 3 cores da França',(await pg.$eval('.logo .bnd',e=>{
  const c=[...e.querySelectorAll('rect')].map(r=>r.getAttribute('fill'));
  return c.includes('#002395')&&c.includes('#fff')&&c.includes('#ED2939');})));
ok('bandeira visível',(await pg.$eval('.logo .bnd',e=>{const r=e.getBoundingClientRect();
  return r.width>10&&r.height>10;})));

/* ---------- 1. POP-UP DO DIA ---------- */
// sem cartas vencidas -> não incomoda
await S(1200);
ok('nao aparece pop-up sem cartas',!(await pg.$eval('#modalRev',e=>e.classList.contains('open'))));

// injeta fila vencida e recarrega -> deve avisar
await pg.evaluate(k=>{
  const D=JSON.parse(document.getElementById('DATA').textContent);
  const s={v:1,done:{},quiz:{},srs:{},log:{},streak:0,best:0,last:null,rev:0,hit:0,
    avisoDia:null,avisoExame:{},plan:{},pace:'7',gate:true,exams:{},curU:D.units[0].id,
    cfg:{dir:'fr-pt',type:'all',units:[],typing:false,audio:true,voz:false,size:20,nw:10}};
  const u=D.units[0]; u.blocos.forEach(b=>s.done[u.id+'/'+b.num]=true);
  const cs=D.cards.filter(c=>c.u===u.id);
  cs.slice(0,18).forEach(c=>{s.srs[c.id]={n:2,iv:1,next:Date.now()-3*864e5,last:2};});
  localStorage.setItem(k,JSON.stringify(s));},KEY);
await pg.reload({waitUntil:'networkidle0'}); await S(1500);
ok('pop-up do dia aparece',await pg.$eval('#modalRev',e=>e.classList.contains('open')));
const t1=await pg.$eval('#modalRev .mr-corpo',e=>e.innerText);
ok('mostra quantas cartas',/18/.test(t1),t1.replace(/\n/g,' ').slice(0,60));
ok('mostra o atraso',/venceu há 3 dias/.test(t1));
ok('estima o tempo',/min/.test(t1));
ok('botao diz "Revisar agora"',(await pg.$eval('[data-mr="rev"]',e=>e.textContent)).includes('Revisar'));
ok('botao de saida diz "Depois"',(await pg.$eval('[data-mr="depois"]',e=>e.textContent)).includes('Depois'));

// fecha e recarrega no MESMO dia -> não repete
await pg.click('[data-mr="depois"]'); await S(400);
await pg.reload({waitUntil:'networkidle0'}); await S(1500);
ok('nao repete no mesmo dia',!(await pg.$eval('#modalRev',e=>e.classList.contains('open'))));

// simula o dia seguinte -> avisa de novo
await pg.evaluate(k=>{const s=JSON.parse(localStorage.getItem(k));
  s.avisoDia='2020-01-01'; localStorage.setItem(k,JSON.stringify(s));},KEY);
await pg.reload({waitUntil:'networkidle0'}); await S(1500);
ok('volta a avisar no dia seguinte',await pg.$eval('#modalRev',e=>e.classList.contains('open')));
await pg.click('[data-mr="rev"]'); await S(900);
ok('"Revisar agora" abre a sessao',(await pg.$eval('#study',e=>e.style.display))!=='none');

/* ---------- 2. MISSÃO CONCLUÍDA -> PROVÃO ---------- */
await pg.evaluate(k=>{
  const D=JSON.parse(document.getElementById('DATA').textContent);
  const s=JSON.parse(localStorage.getItem(k));
  s.avisoDia=new Date().toISOString().slice(0,10);   // já avisou hoje
  s.avisoExame={}; s.exams={};
  // conclui 100% das unidades da faixa do A1 (Unités 01-06)
  const num=n=>{const m=/Unité\s+(\d+)/.exec(n);return m?+m[1]:(/Partie/.test(n)?1:null);};
  D.units.forEach(u=>{const n=num(u.nome);
    if(n!==null&&n>=1&&n<=6) u.blocos.forEach(b=>s.done[u.id+'/'+b.num]=true);});
  localStorage.setItem(k,JSON.stringify(s));},KEY);
await pg.reload({waitUntil:'networkidle0'}); await S(1600);
ok('pop-up de missao concluida aparece',await pg.$eval('#modalRev',e=>e.classList.contains('open')));
const t2=await pg.$eval('#modalRev .mr-corpo',e=>e.innerText);
ok('mostra 100%',/100%/.test(t2),t2.replace(/\n/g,' ').slice(0,70));
ok('cita o exame',/DELF|A1/.test(t2));
ok('cita a nota de aprovacao',/50/.test(t2));
ok('botao diz "Fazer o provao"',/Fazer o prov/.test(await pg.$eval('[data-mr="rev"]',e=>e.textContent)));
ok('icone de formatura',(await pg.$eval('.mr-ic',e=>e.textContent))==='🎓');
await pg.click('[data-mr="rev"]'); await S(1600);
ok('leva direto para o provao',await pg.$eval('#p-exam',e=>e.classList.contains('on')),
   await pg.evaluate(()=>[...document.querySelectorAll('.page')].filter(x=>x.classList.contains('on')).map(x=>x.id).join()));

// não repete o convite
await pg.reload({waitUntil:'networkidle0'}); await S(1600);
ok('nao repete o convite do provao',!(await pg.$eval('#modalRev',e=>e.classList.contains('open'))));

/* ---------- integridade ---------- */
let bad=0;
for(const t of ['home','lessons','stats']){
  await pg.click('nav > button[data-p="'+t+'"]').catch(()=>{}); await S(500);
  await pg.evaluate(AUD); bad+=(await pg.evaluate(()=>window.__audit())).length;}
ok('contraste AA',bad===0,''+bad);
const D=await pg.evaluate(()=>JSON.parse(document.getElementById('DATA').textContent));
ok('dataset intacto',D.cards.length===3888&&D.units.length===30);
ok('sem erro de JS',jsErr===0,''+jsErr);
console.log(`\n${P} passaram, ${F} falharam`);
await b.close(); process.exit(F?1:0);})();
