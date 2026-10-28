const p=require('puppeteer');const fs=require('fs');
let P=0,F=0;const ok=(n,c,d='')=>{c?(P++,console.log('  OK  '+n)):(F++,console.log('  XX  '+n+(d?' :: '+d:'')));};
const S=s=>new Promise(r=>setTimeout(r,s));
const AUD=fs.readFileSync('/home/user/ingles/audit.js','utf8');
const BASE='http://127.0.0.1:8816/Frances_Curso_Completo.html';
(async()=>{
const b=await p.launch({args:['--no-sandbox','--disable-setuid-sandbox','--autoplay-policy=no-user-gesture-required']});
const pg=await b.newPage(); await pg.setViewport({width:1360,height:940});
let orb=0,jsErr=0;
pg.on('pageerror',e=>{jsErr++;console.log('  XX JS ERROR: '+String(e).slice(0,100));});
pg.on('requestfailed',r=>{if(String(r.failure().errorText).includes('ORB'))orb++;});
await pg.goto(BASE,{waitUntil:'networkidle0'}); await S(900);
await pg.evaluateOnNewDocument(()=>{window.__spoken=[];
  const i=setInterval(()=>{if(window.speechSynthesis){clearInterval(i);
    const o=speechSynthesis.speak.bind(speechSynthesis);
    speechSynthesis.speak=u=>{window.__spoken.push({t:u.text,l:u.lang});try{o(u);}catch(e){}};}},50);});
await pg.reload({waitUntil:'networkidle0'}); await S(900);

/* ---------- dataset ---------- */
const D=await pg.evaluate(()=>JSON.parse(document.getElementById('DATA').textContent));
ok('30 unidades',D.units.length===30,''+D.units.length);
ok('3766 cartas',D.cards.length===3766,''+D.cards.length);
ok('2354 com áudio',D.cards.filter(c=>c.mp3).length===2354);
ok('307 blocos',D.units.reduce((a,u)=>a+u.blocos.length,0)===307);
ok('4 provões DELF',D.exams.length===4);
ok('provões com 20 questões',D.exams.every(e=>e.qs.length===20));
ok('5 questões de áudio por provão',D.exams.every(e=>e.qs.filter(q=>q.mp3).length===5));
ok('4 épreuves por provão',D.exams.every(e=>new Set(e.qs.map(q=>q.s)).size===4));
ok('seuil DELF 50/100',D.exams.every(e=>e.seuil===50));
ok('nota mínima 5/25 registrada',D.exams.every(e=>e.min_epreuve===5));
const nq=D.units.reduce((a,u)=>a+u.blocos.reduce((x,b)=>x+(b.quiz?b.quiz.length:0),0),0);
ok('699 questões de aula',nq===699,''+nq);
ok('questões válidas',D.units.every(u=>u.blocos.every(b=>(b.quiz||[]).every(
  q=>q.o.length===4&&new Set(q.o).size===4&&q.c>=0&&q.c<4))));
ok('todas as unidades com plano',D.units.every(u=>u.plano&&u.plano.length));
ok('cartas usam campo fr',D.cards.every(c=>typeof c.fr==='string'&&c.fr.length>0));

/* ---------- identidade e nav ---------- */
ok('badge Français',(await pg.$eval('.logo small',e=>e.textContent))==='Français');
ok('5 itens na nav',(await pg.$$eval('header nav > button[data-p]',e=>e.length))===5);
ok('menu Mais sem Lives',!(await pg.$eval('#moreMenu',e=>e.innerHTML)).includes('Lives'));
ok('5 itens no menu',(await pg.$$eval('#moreMenu button[data-p]',e=>e.length))===5);
ok('nenhuma seção de lives',(await pg.$$eval('#p-lives',e=>e.length))===0);
ok('saudação em francês',/Bonjour|Bon après-midi|Bonsoir/.test(await pg.$eval('#greet',e=>e.textContent)));
ok('2 cartões de Morceau',(await pg.$$eval('#missionCards .mcard',e=>e.length))===2);
ok('barras de 14 dias',(await pg.$$eval('.wbars .wb',e=>e.length))===14);
ok('total de frases na home',(await pg.$eval('#hTotal',e=>e.textContent))==='3766');

/* ---------- aula ---------- */
await pg.click('nav > button[data-p="lessons"]'); await S(500);
await pg.select('#lUnit','unit_02'); await S(500);
ok('blocos da Unité 02',(await pg.$$eval('#lList .lesson',e=>e.length))>=10);
const idx=await pg.evaluate(()=>{
  const h=[...document.querySelectorAll('#lList .lhead')];
  const D=JSON.parse(document.getElementById('DATA').textContent);
  const u=D.units.find(x=>x.id==='unit_02');
  const a=u.blocos.find(b=>b.frases.length&&b.video&&b.pdf.length);
  return a?h.findIndex(x=>x.dataset.open==='unit_02/'+a.num):-1;});
ok('achou bloco com vídeo+PDF+frases',idx>=0);
await pg.evaluate(i=>document.querySelectorAll('#lList .lhead')[i].click(),idx); await S(600);
const det=await pg.$eval('#lDetail',e=>e.innerText);
ok('detalhe tem vídeo',/Vídeo da aula/.test(det));
ok('detalhe tem PDF',/PDF/.test(det));
ok('detalhe tem frases',/Frases da aula/.test(det));
ok('pill da unidade',/unité 02/i.test(await pg.$eval('#lDetail .dpills',e=>e.innerText)));
ok('sem bloco de lives',!/Lives desta semana/.test(det));

/* mídia */
await pg.evaluate(()=>{const v=document.querySelector('.vidbtn'); if(v)v.click();}); await S(3200);
const vid=await pg.evaluate(()=>{const f=document.querySelector('.vidbox iframe');
  return {tem:!!f,ok:f?/\/preview$/.test(f.src):false,v:document.querySelectorAll('.vidbox video').length};});
ok('vídeo no player oficial',vid.tem&&vid.ok);
ok('sem <video> bloqueado',vid.v===0);
const fr=pg.frames().find(f=>f.url().includes('drive.google.com/file'));
ok('Drive entregou o arquivo',fr?/\.mp4/i.test(await fr.evaluate(()=>document.title).catch(()=>'')):false);
await pg.evaluate(()=>{const a=document.querySelector('[data-act="pdf"]'); if(a)a.click();}); await S(2200);
ok('PDF embute via /preview',await pg.$eval('#pdfBox iframe',e=>/\/preview$/.test(e.src)).catch(()=>false));

/* fala em francês */
await pg.evaluate(()=>{window.__spoken=[];const b=document.querySelector('#frList .fplay');if(b)b.click();});
await S(700);
const sp=await pg.evaluate(()=>window.__spoken);
ok('▶ envia frase ao TTS',sp.length===1);
ok('TTS em fr-FR',sp[0]&&sp[0].l==='fr-FR',sp[0]&&sp[0].l);
ok('frases com atalho nativo',(await pg.$$eval('#frList .natbtn',e=>e.length))>0);

/* quiz */
await pg.evaluate(()=>{const q=document.querySelector('.qzbtn'); if(q)q.click();}); await S(600);
if(await pg.$('#p-quiz.on')){
  const total=await pg.evaluate(()=>{const m=document.querySelector('#qzHead').innerText.match(/(\d+)\s*$/);return m?+m[1]:5;});
  for(let i=0;i<total;i++){
    await pg.click('.qzo button[data-i="0"]'); await S(90);
    await pg.click('#qzNext'); await S(190);
    await pg.click('#qzNext'); await S(200);
  }
  ok('quiz fecha com nota',(await pg.$$eval('.qzres .big',e=>e.length))===1);
  await pg.click('#qzNext'); await S(500);
}

/* cartas + SRS */
await pg.evaluate(()=>{const s=document.querySelector('[data-act="send"]'); if(s)s.click();}); await S(500);
ok('cartas enviadas',/Cartas enviadas/.test(await pg.$eval('#lDetail',e=>e.innerText)));
await pg.click('nav > button[data-p="study"]'); await S(500);
ok('30 unidades no filtro',(await pg.$$eval('#optUnit .opt',e=>e.length))===30);
await pg.click('#btnStart'); await S(700);
ok('sessão inicia',(await pg.$eval('#study',e=>e.style.display))!=='none');
ok('direção FR → PT',/FR → PT|PT → FR/.test(await pg.$eval('#fDir',e=>e.textContent)));
await pg.click('#btnShow'); await S(250);
await pg.click('#fGradeBtns [data-g="2"]'); await S(350);
ok('avalia carta',(await pg.$eval('#qcDone',e=>e.textContent))==='1');

/* abas do menu */
for(const [t,sel] of [['units','#unitList [data-u]'],['listen','#wLines'],['drills','#dMode .opt'],
                      ['browse','#bList'],['exams','#xList .card']]){
  await pg.click('#moreBtn'); await S(200);
  await pg.click('#moreMenu [data-p="'+t+'"]'); await S(600);
  ok('aba '+t+' renderiza',(await pg.$$eval(sel,e=>e.length))>0);
}
ok('30 unidades listadas',(await pg.evaluate(()=>{
  document.querySelector('#moreBtn').click();
  document.querySelector('#moreMenu [data-p="units"]').click();
  return new Promise(r=>setTimeout(()=>r(document.querySelectorAll('#unitList [data-u]').length),600));})) ===30);
ok('4 cards de provão',(await pg.evaluate(()=>{
  document.querySelector('#moreBtn').click();
  document.querySelector('#moreMenu [data-p="exams"]').click();
  return new Promise(r=>setTimeout(()=>r(document.querySelectorAll('#xList .card').length),600));}))===4);
ok('provões citam DELF',/DELF/.test(await pg.$eval('#xList',e=>e.innerText)));

/* plano */
await pg.click('nav > button[data-p="plan"]'); await S(600);
ok('3 ritmos 7/9/12',(await pg.$eval('#pPace',e=>e.innerText)).includes('7 meses'));
ok('dias no plano',(await pg.$$eval('#planList [data-day]',e=>e.length))>=5);

/* progresso */
await pg.click('nav > button[data-p="stats"]'); await S(700);
ok('gráfico de nível com 4 barras',(await pg.$$eval('#lvChart .lvbar .c',e=>e.length))===4);
ok('progresso por unidade = 30',(await pg.$$eval('#unitProg .prog',e=>e.length))===30);

/* acessibilidade */
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

/* mobile */
await pg.setViewport({width:414,height:880}); await S(500);
ok('header cabe no mobile',await pg.$eval('header',e=>e.scrollWidth<=e.clientWidth+2));
ok('tab bar aparece',(await pg.$eval('#tabbar',e=>getComputedStyle(e).display))==='flex');
await pg.evaluate(()=>document.querySelector('#sheetBtn').click()); await S(400);
ok('bottom sheet abre',await pg.$eval('#sheet',e=>e.classList.contains('open')));

ok('nenhum ORB',orb===0,'orb='+orb);
ok('nenhum erro de JS',jsErr===0,'err='+jsErr);
console.log(`\n${P} passaram, ${F} falharam`);
await b.close(); process.exit(F?1:0);})();
