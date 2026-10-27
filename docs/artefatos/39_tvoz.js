const p=require('puppeteer');const fs=require('fs');
let P=0,F=0;const ok=(n,c,d='')=>{c?(P++,console.log('  OK  '+n)):(F++,console.log('  XX  '+n+(d?' :: '+d:'')));};
const S=s=>new Promise(r=>setTimeout(r,s));
const AUD=fs.readFileSync('/home/user/ingles/audit.js','utf8');
const URL_='http://127.0.0.1:8821/Frances_Curso_Completo.html';
(async()=>{
const b=await p.launch({args:['--no-sandbox','--disable-setuid-sandbox',
  '--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
const pg=await b.newPage(); await pg.setViewport({width:1360,height:960});
let jsErr=0; pg.on('pageerror',e=>{jsErr++;console.log('  XX JS: '+String(e).slice(0,95));});
await pg.goto(URL_,{waitUntil:'networkidle0'}); await S(900);

/* ---------- 1. NADA muda para quem não usa ---------- */
ok('suporte detectado',await pg.evaluate(()=>typeof VOZ_OK!=='undefined'&&VOZ_OK===true));
ok('preferência começa DESLIGADA',await pg.evaluate(()=>{
  const k='mh_fr_full_v1'; const s=JSON.parse(localStorage.getItem(k)||'{}');
  return !(s.cfg&&s.cfg.voz);}));
await pg.click('nav > button[data-p="study"]'); await S(600);
ok('switch "Praticar a fala" existe',(await pg.$$eval('#swVoz',e=>e.length))===1);
ok('switch começa desligado',!(await pg.$eval('#swVoz',e=>e.classList.contains('on'))));

/* ---------- 2. fluxo normal intacto ---------- */
await pg.click('nav > button[data-p="lessons"]'); await S(600);
await pg.select('#lUnit','unit_02'); await S(500);
const idx=await pg.evaluate(()=>{
  const h=[...document.querySelectorAll('#lList .lhead')];
  const D=JSON.parse(document.getElementById('DATA').textContent);
  const u=D.units.find(x=>x.id==='unit_02');
  const a=u.blocos.find(b=>b.frases.some(f=>f.mp3));
  return h.findIndex(x=>x.dataset.open==='unit_02/'+a.num);});
await pg.evaluate(i=>document.querySelectorAll('#lList .lhead')[i].click(),idx); await S(700);
ok('aula abre normalmente',(await pg.$$eval('#lDetail .dsec',e=>e.length))>=4);
ok('▶ de sempre continua lá',(await pg.$$eval('#frList .fplay',e=>e.length))>0);
ok('🔊 nativo continua lá',(await pg.$$eval('#frList .natbtn',e=>e.length))>0);
ok('🎤 aparece nas frases',(await pg.$$eval('#frList .vzbtn',e=>e.length))>0);
const antes=await pg.$$eval('#frList .vzbox',e=>e.length);
ok('nenhum painel de voz aberto de início',antes===0);

/* ---------- 3. gravação sob demanda ---------- */
await pg.evaluate(()=>document.querySelector('#frList .vzbtn').click()); await S(1200);
ok('botão entra em modo gravação',await pg.$eval('#frList .vzbtn',e=>e.classList.contains('grav')));
await pg.evaluate(()=>document.querySelector('#frList .vzbtn').click()); await S(1600);
ok('painel comparativo aparece',(await pg.$$eval('#frList .vz',e=>e.length))===1);
const vz=await pg.$eval('#frList .vz',e=>e.innerText);
ok('mostra "Você"',/Você/.test(vz));
ok('mostra o modelo nativo',/Nativo|Modelo/.test(vz));
ok('mostra a frase alvo',vz.length>20);
ok('tem áudio da gravação',(await pg.$$eval('#frList .vz audio',e=>e.length))===1);
const dur=await pg.$eval('#frList .vz audio',e=>e.src.startsWith('blob:'));
ok('áudio é um blob local gravado',dur);
ok('botão volta ao normal',!(await pg.$eval('#frList .vzbtn',e=>e.classList.contains('grav'))));

/* ---------- 4. carta do SRS: só com a opção ligada ---------- */
await pg.evaluate(()=>{
  const D=JSON.parse(document.getElementById('DATA').textContent);
  const k='mh_fr_full_v1'; const s=JSON.parse(localStorage.getItem(k)||'{}');
  s.done=s.done||{}; const u=D.units[2];
  u.blocos.forEach(b=>s.done[u.id+'/'+b.num]=true);
  localStorage.setItem(k,JSON.stringify(s));});
await pg.reload({waitUntil:'networkidle0'}); await S(800);
await pg.click('nav > button[data-p="study"]'); await S(600);
await pg.click('#btnStart'); await S(800);
ok('sessão inicia normalmente',(await pg.$eval('#study',e=>e.style.display))!=='none');
ok('🎤 escondido com a opção desligada',(await pg.$eval('#fVoz',e=>e.style.display))==='none');
await pg.click('#btnShow'); await S(250);
await pg.click('#fGradeBtns [data-g="2"]'); await S(400);
ok('avaliar carta funciona igual',(await pg.$eval('#qcDone',e=>e.textContent))==='1');
// liga a opção
await pg.click('#btnQuit'); await S(500);
await pg.click('#swVoz'); await S(400);
ok('switch liga',await pg.$eval('#swVoz',e=>e.classList.contains('on')));
await pg.click('#btnStart'); await S(800);
ok('🎤 aparece na carta com a opção ligada',(await pg.$eval('#fVoz',e=>e.style.display))!=='none');

/* ---------- 5. integridade ---------- */
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
