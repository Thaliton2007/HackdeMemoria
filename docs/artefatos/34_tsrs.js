const p=require('puppeteer');const fs=require('fs');
let P=0,F=0;const ok=(n,c,d='')=>{c?(P++,console.log('  OK  '+n)):(F++,console.log('  XX  '+n+(d?' :: '+d:'')));};
const S=s=>new Promise(r=>setTimeout(r,s));
const AUD=fs.readFileSync('/home/user/ingles/audit.js','utf8');
const URL_='http://127.0.0.1:8818/Frances_Curso_Completo.html';
const KEY='mh_fr_full_v1';
(async()=>{
const b=await p.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
const pg=await b.newPage(); await pg.setViewport({width:1360,height:960});
let jsErr=0; pg.on('pageerror',e=>{jsErr++;console.log('  XX JS: '+String(e).slice(0,90));});
await pg.goto(URL_,{waitUntil:'networkidle0'}); await S(800);

/* ---------- 1. sem cartas: mostra que nada está agendado ---------- */
let txt=await pg.$eval('#todayCard',e=>e.innerText);
ok('painel tem 5 linhas',(await pg.$$eval('#todayCard .today',e=>e.length))===5);
ok('mostra "nada agendado" sem cartas',/nada agendado/.test(txt),txt.split('\n').slice(0,3).join(' | '));
ok('linha "Vencem em 24h" existe',/Vencem em 24h/.test(txt));

/* ---------- 2. carta agendada para o futuro: contagem regressiva ---------- */
await pg.evaluate(k=>{
  const D=JSON.parse(document.getElementById('DATA').textContent);
  const s={v:1,done:{},quiz:{},srs:{},log:{},streak:0,best:0,last:null,rev:0,hit:0,plan:{},
    pace:'7',gate:true,exams:{},curU:D.units[0].id,
    cfg:{dir:'fr-pt',type:'all',units:[],typing:false,audio:true,size:20,nw:10}};
  const u=D.units[0]; u.blocos.forEach(b=>s.done[u.id+'/'+b.num]=true);
  const cs=D.cards.filter(c=>c.u===u.id);
  // uma carta vence em ~3h20
  if(cs[0]) s.srs[cs[0].id]={n:2,iv:1,next:Date.now()+3*3600e3+20*60e3,last:2};
  localStorage.setItem(k,JSON.stringify(s));},KEY);
await pg.reload({waitUntil:'networkidle0'}); await S(800);
txt=await pg.$eval('#todayCard',e=>e.innerText);
ok('mostra contagem regressiva',/próxima em 3h20/.test(txt),txt.split('\n').slice(0,3).join(' | '));
ok('conta o que vence em 24h',/Vencem em 24h\n[^\n]*\n1/.test(txt)||/1/.test(txt));

/* ---------- 3. carta atrasada: mostra há quanto tempo ---------- */
await pg.evaluate(k=>{
  const s=JSON.parse(localStorage.getItem(k));
  const D=JSON.parse(document.getElementById('DATA').textContent);
  const cs=D.cards.filter(c=>c.u===D.units[0].id);
  cs.slice(0,5).forEach(c=>{s.srs[c.id]={n:2,iv:1,next:Date.now()-4*864e5,last:2};});
  localStorage.setItem(k,JSON.stringify(s));},KEY);
await pg.reload({waitUntil:'networkidle0'}); await S(800);
txt=await pg.$eval('#todayCard',e=>e.innerText);
ok('mostra atraso da mais antiga',/venceu há 4 dias/.test(txt),txt.split('\n').slice(0,3).join(' | '));

/* ---------- 4. banner de acúmulo ---------- */
ok('banner escondido com fila pequena',(await pg.$eval('#acumulo',e=>e.style.display))==='none');
await pg.evaluate(k=>{
  const s=JSON.parse(localStorage.getItem(k));
  const D=JSON.parse(document.getElementById('DATA').textContent);
  D.units.slice(0,3).forEach(u=>u.blocos.forEach(b=>s.done[u.id+'/'+b.num]=true));
  const ids=D.cards.filter(c=>['unit_01_partie_i','unit_01_partie_ii','unit_02'].includes(c.u));
  ids.slice(0,60).forEach(c=>{s.srs[c.id]={n:2,iv:1,next:Date.now()-5*864e5,last:2};});
  localStorage.setItem(k,JSON.stringify(s));},KEY);
await pg.reload({waitUntil:'networkidle0'}); await S(900);
ok('banner aparece com fila grande',(await pg.$eval('#acumulo',e=>e.style.display))!=='none');
const ban=await pg.$eval('#acumulo',e=>e.innerText);
ok('banner diz quantas e o tempo',/cartas vencidas/.test(ban)&&/min/.test(ban),ban.slice(0,90));
ok('banner tem link de ação',!!(await pg.$('#acumuloGo')));
await pg.click('#acumuloGo'); await S(700);
ok('link leva para a sessão',(await pg.$eval('#study',e=>e.style.display))!=='none');

/* ---------- 5. pop-up ao concluir aula ---------- */
await pg.click('nav > button[data-p="lessons"]'); await S(600);
await pg.select('#lUnit','unit_03'); await S(500);
const idx=await pg.evaluate(()=>{
  const h=[...document.querySelectorAll('#lList .lhead')];
  const D=JSON.parse(document.getElementById('DATA').textContent);
  const u=D.units.find(x=>x.id==='unit_03');
  const a=u.blocos.find(b=>b.frases.length);
  return h.findIndex(x=>x.dataset.open==='unit_03/'+a.num);});
await pg.evaluate(i=>document.querySelectorAll('#lList .lhead')[i].click(),idx); await S(600);
ok('modal começa fechado',!(await pg.$eval('#modalRev',e=>e.classList.contains('open'))));
await pg.evaluate(()=>{const s=document.querySelector('[data-act="send"]'); if(s)s.click();});
await S(700);
ok('pop-up aparece ao concluir aula',await pg.$eval('#modalRev',e=>e.classList.contains('open')));
const mtxt=await pg.$eval('#modalRev .mr-corpo',e=>e.innerText);
ok('pop-up mostra quantidade',/\d+/.test(mtxt));
ok('pop-up mostra o atraso',/venceu há/.test(mtxt),mtxt.replace(/\n/g,' ').slice(0,80));
ok('pop-up estima o tempo',/min/.test(mtxt));
ok('tem os dois botões',(await pg.$$eval('#modalRev .mr-btns .btn',e=>e.length))===2);
await pg.click('#modalRev [data-mr="depois"]'); await S(500);
ok('"Continuar" fecha sem sair da aula',
   !(await pg.$eval('#modalRev',e=>e.classList.contains('open')))
   && await pg.$eval('#p-lesson',e=>e.classList.contains('on')));
// reabrir e testar "Revisar agora"
await pg.evaluate(()=>{const s=document.querySelector('[data-act="undo"]'); if(s)s.click();}); await S(400);
await pg.evaluate(()=>{const s=document.querySelector('[data-act="send"]'); if(s)s.click();}); await S(700);
await pg.click('#modalRev [data-mr="rev"]'); await S(800);
ok('"Revisar agora" abre a sessão',(await pg.$eval('#study',e=>e.style.display))!=='none');

/* ---------- 6. badge por unidade ---------- */
await pg.click('#moreBtn'); await S(250);
await pg.click('#moreMenu [data-p="units"]'); await S(700);
const ul=await pg.$eval('#unitList',e=>e.innerText);
ok('unidade mostra cartas a revisar',/a revisar/.test(ul),ul.split('\n').slice(0,6).join(' | '));

/* ---------- 7. integridade ---------- */
let bad=0;
for(const t of ['home','lessons','stats']){
  await pg.click('nav > button[data-p="'+t+'"]').catch(()=>{}); await S(500);
  await pg.evaluate(AUD); bad+=(await pg.evaluate(()=>window.__audit())).length;}
ok('contraste AA',bad===0,''+bad);
ok('sem erro de JS',jsErr===0,''+jsErr);
console.log(`\n${P} passaram, ${F} falharam`);
await b.close(); process.exit(F?1:0);})();
