const p=require('puppeteer');const fs=require('fs');
let P=0,F=0;const ok=(n,c,d='')=>{c?(P++,console.log('  OK  '+n)):(F++,console.log('  XX  '+n+(d?' :: '+d:'')));};
const S=s=>new Promise(r=>setTimeout(r,s));
const AUD=fs.readFileSync('/home/user/ingles/audit.js','utf8');
const BASE='http://127.0.0.1:8812/MemoriaHack_Espanhol_Claro_v2.html';
(async()=>{
const b=await p.launch({args:['--no-sandbox','--disable-setuid-sandbox','--autoplay-policy=no-user-gesture-required']});
const pg=await b.newPage(); await pg.setViewport({width:1360,height:940});
let orb=0,jsErr=0;
pg.on('pageerror',e=>{jsErr++;console.log('  XX JS ERROR: '+String(e).slice(0,90));});
pg.on('requestfailed',r=>{if(String(r.failure().errorText).includes('ORB'))orb++;});
await pg.goto(BASE,{waitUntil:'networkidle0'}); await S(600);

/* ---------- ETAPA 1: tema claro ---------- */
const V=await pg.evaluate(()=>{const s=getComputedStyle(document.documentElement);
  const g=k=>s.getPropertyValue(k).trim();
  return {bg:g('--bg'),bg2:g('--bg2'),ac:g('--ac'),acf:g('--acf'),r:g('--r')};});
ok('tema claro',V.bg.toUpperCase()==='#F4F7F6');
ok('azul de ação acessível',V.ac.toUpperCase()==='#0B6BCB');
ok('azul claro preservado',V.acf.toUpperCase()==='#74B9FF');
ok('raio 16px',V.r==='16px');
const cs=await pg.evaluate(()=>{const c=document.querySelector('.card');const s=getComputedStyle(c);
  return {bw:s.borderTopWidth,sh:s.boxShadow,pad:s.paddingTop};});
ok('cartão sem borda',cs.bw==='0px');
ok('cartão com sombra',cs.sh!=='none');
ok('padding 24px',cs.pad==='24px');
const pesos=await pg.evaluate(()=>[...document.querySelectorAll('h1,h2,h3,.logo')]
  .map(e=>parseInt(getComputedStyle(e).fontWeight)).filter(Boolean));
ok('nenhum peso >= 800',Math.max(...pesos)<800,'max='+Math.max(...pesos));
const html0=await pg.content();
ok('sem rosa #ff397d',!/ff397d/i.test(html0));
ok('sem rgba rosa',!/rgba\(255,\s*57,\s*125/.test(html0));

/* ---------- ETAPA 2: nav ---------- */
ok('5 itens na nav',(await pg.$$eval('header nav > button[data-p]',e=>e.length))===5);
ok('menu Mais com 5 itens',(await pg.$$eval('#moreMenu button[data-p]',e=>e.length))===5);
ok('métricas fora do header',(await pg.$$eval('header .hstat',e=>e.length))===0);
ok('avatar presente',!!(await pg.$('#avatarBtn')));
await pg.click('#moreBtn'); await S(300);
ok('menu abre',await pg.$eval('#moreMenu',e=>e.classList.contains('open')));
await pg.keyboard.press('Escape'); await S(250);
ok('Escape fecha',!(await pg.$eval('#moreMenu',e=>e.classList.contains('open'))));
await pg.click('#moreBtn'); await S(250);
await pg.click('#moreMenu [data-p="units"]'); await S(500);
ok('menu navega',await pg.$eval('#p-units',e=>e.classList.contains('on')));
ok('Mais destacado em página secundária',await pg.$eval('#moreBtn',e=>e.classList.contains('on')));

/* ---------- dashboard ---------- */
await pg.click('nav > button[data-p="home"]'); await S(500);
ok('saudação em espanhol',/Buenos días|Buenas tardes|Buenas noches/.test(await pg.$eval('#greet',e=>e.textContent)));
ok('CTA único',(await pg.$$eval('.hero-cta',e=>e.length))===1);
ok('3 cartões de onda',(await pg.$$eval('#missionCards .mcard',e=>e.length))===3);
ok('ondas com barra',(await pg.$$eval('#missionCards .prog',e=>e.length))===3);
ok('Para hoje com 4 linhas',(await pg.$$eval('#todayCard .today',e=>e.length))===4);
ok('painel de ritmo',/Plano de \d+ meses/.test(await pg.$eval('#paceCard',e=>e.innerText)));
ok('barra semanal 7 dias',(await pg.$$eval('#paceCard .pacebar i',e=>e.length))===7);
ok('2 atalhos',(await pg.$$eval('#quickCards .qcard',e=>e.length))===2);
ok('heatmap virou barras',(await pg.$$eval('.wbars .wb',e=>e.length))===14);
ok('4 stats soltos removidos',(await pg.$$eval('#p-home .stat',e=>e.length))===0);
await pg.click('.hero-cta'); await S(600);
ok('CTA abre a próxima aula',await pg.$eval('#p-lesson',e=>e.classList.contains('on')));

/* ---------- MÍDIA (a correção) ---------- */
const vid=await pg.evaluate(()=>{
  const b=document.querySelector('[data-act="play"],.vidbtn'); if(b){b.click();return true;} return false;});
await S(3500);
if(vid){
  const r=await pg.evaluate(()=>{const f=document.querySelector('.vidbox iframe');
    return {tem:!!f,ok:f?/\/preview$/.test(f.src):false,v:document.querySelectorAll('.vidbox video').length};});
  ok('vídeo usa player oficial',r.tem&&r.ok,JSON.stringify(r));
  ok('sem <video> bloqueado',r.v===0);
  const fr=pg.frames().find(f=>f.url().includes('drive.google.com/file'));
  const t=fr?await fr.evaluate(()=>document.title).catch(()=>''):'';
  ok('Drive entregou o arquivo',/\.(mp4|mov|m4v)/i.test(t),t.slice(0,44));
} else ok('aula sem vídeo (pulado)',true);
const html=await pg.content();
ok('downloads usam confirm=t',/export=download&confirm=t/.test(html));
ok('nenhum download sem confirm',!/export=download(?!&confirm=t)/.test(html));

/* ---------- regressão das abas ---------- */
for(const [p_,sel] of [['study','#setup'],['lessons','#lList'],['plan','#planList'],['stats','#lvChart']]){
  await pg.click('nav > button[data-p="'+p_+'"]'); await S(500);
  ok('aba '+p_+' renderiza',(await pg.$$eval(sel,e=>e.length))>0);
}
for(const [p_,sel] of [['units','#unitList'],['listen','#wLines'],['drills','#dMode'],['browse','#bList'],['exams','#xList']]){
  await pg.click('#moreBtn'); await S(180);
  await pg.click('#moreMenu [data-p="'+p_+'"]'); await S(550);
  ok('aba '+p_+' renderiza',(await pg.$$eval(sel,e=>e.length))>0);
}

/* ---------- fluxo de estudo ---------- */
await pg.click('nav > button[data-p="lessons"]'); await S(500);
await pg.evaluate(()=>{const h=document.querySelector('#lList .lhead'); if(h)h.click();}); await S(600);
const enviou=await pg.evaluate(()=>{const b=document.querySelector('[data-act="send"]'); if(b){b.click();return true;} return false;});
await S(500);
ok('enviar cartas funciona',enviou);
await pg.click('nav > button[data-p="study"]'); await S(500);
const iniciou=await pg.evaluate(()=>{const b=document.querySelector('#btnStart'); if(b){b.click();return true;} return false;});
await S(700);
ok('sessão SRS inicia',iniciou&&(await pg.$eval('#study',e=>e.style.display))!=='none');

/* ---------- acessibilidade em todas as telas ---------- */
let tot=0;
async function aud(n){await pg.evaluate(AUD);
  const bad=await pg.evaluate(()=>window.__audit());
  if(bad.length){tot+=bad.length;console.log('     contraste '+n+': '+bad.slice(0,2).join(' | '));}}
for(const t of ['home','study','lessons','plan','stats']){
  await pg.click('nav > button[data-p="'+t+'"]'); await S(500); await aud(t);}
for(const t of ['units','listen','drills','browse','exams']){
  await pg.click('#moreBtn'); await S(180);
  await pg.click('#moreMenu [data-p="'+t+'"]'); await S(550); await aud(t);}
ok('contraste AA em 10 telas',tot===0,tot+' problemas');

/* ---------- mobile ---------- */
await pg.setViewport({width:414,height:880}); await S(500);
ok('header cabe no mobile',await pg.$eval('header',e=>e.scrollWidth<=e.clientWidth+2));
ok('tab bar aparece',(await pg.$eval('#tabbar',e=>getComputedStyle(e).display))==='flex');
ok('5 abas na tab bar',(await pg.$$eval('#tabbar button',e=>e.length))===5);
await pg.click('#sheetBtn'); await S(400);
ok('bottom sheet abre',await pg.$eval('#sheet',e=>e.classList.contains('open')));
ok('6 itens no sheet',(await pg.$$eval('#sheet button[data-p]',e=>e.length))===6);
await pg.click('#sheet [data-p="browse"]'); await S(550);
ok('sheet navega e fecha',await pg.$eval('#p-browse',e=>e.classList.contains('on'))
  && !(await pg.$eval('#sheet',e=>e.classList.contains('open'))));
await pg.click('#tabbar button[data-p="home"]'); await S(500);
ok('dashboard empilha',(await pg.$eval('.dash',e=>getComputedStyle(e).gridTemplateColumns.split(' ').length))===1);
await pg.setViewport({width:1360,height:940}); await S(400);
ok('tab bar some no desktop',(await pg.$eval('#tabbar',e=>getComputedStyle(e).display))==='none');
ok('sheet oculto no desktop',(await pg.$eval('#sheet',e=>getComputedStyle(e).display))==='none');

/* ---------- integridade ---------- */
ok('nenhum ORB',orb===0,'orb='+orb);
ok('nenhum erro de JS',jsErr===0,'err='+jsErr);
const D=await pg.evaluate(()=>JSON.parse(document.getElementById('DATA').textContent));
ok('3540 cartas preservadas',D.cards.length===3540);
ok('24 unidades',D.units.length===24);
ok('159 aulas',D.lessons.length===159);
ok('4 provões DELE',D.exams.length===4);
await pg.reload({waitUntil:'networkidle0'}); await S(600);
ok('app recarrega sem erro',jsErr===0);

console.log(`\n${P} passaram, ${F} falharam`);
await b.close(); process.exit(F?1:0);})();
