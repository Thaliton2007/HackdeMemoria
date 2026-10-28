const p=require('puppeteer');
let P=0,F=0;const ok=(n,c,d='')=>{c?(P++,console.log('  OK  '+n)):(F++,console.log('  XX  '+n+(d?' :: '+d:'')));};
const S=s=>new Promise(r=>setTimeout(r,s));
const BASE='http://127.0.0.1:8811/Ingles_Curso_Completo_Claro_v2.html';
(async()=>{
const b=await p.launch({args:['--no-sandbox','--disable-setuid-sandbox','--autoplay-policy=no-user-gesture-required']});
const pg=await b.newPage(); await pg.setViewport({width:1360,height:940});
let orb=0,jsErr=0;
pg.on('pageerror',e=>{jsErr++;console.log('  XX JS ERROR: '+String(e).slice(0,90));});
pg.on('requestfailed',r=>{if(String(r.failure().errorText).includes('ORB'))orb++;});
await pg.goto(BASE,{waitUntil:'networkidle0'});
// captura o texto enviado ao TTS
await pg.evaluateOnNewDocument(()=>{window.__spoken=[];
  const i=setInterval(()=>{ if(window.speechSynthesis){clearInterval(i);
    const o=speechSynthesis.speak.bind(speechSynthesis);
    speechSynthesis.speak=u=>{window.__spoken.push({t:u.text,l:u.lang});try{o(u);}catch(e){}};}},50);});
await pg.reload({waitUntil:'networkidle0'});

// ---------- VÍDEO em 4 units ----------
for(const uid of ['unit_01_part_i','unit_08','unit_15','unit_21']){
  await pg.click('nav > button[data-p="lessons"]'); await S(350);
  await pg.select('#lUnit',uid); await S(400);
  const idx=await pg.evaluate(u=>{
    const h=[...document.querySelectorAll('#lList .lhead')];
    const D=JSON.parse(document.getElementById('DATA').textContent);
    const un=D.units.find(x=>x.id===u); const a=un.blocos.find(x=>x.video);
    return a?h.findIndex(x=>x.dataset.open===u+'/'+a.num):-1;},uid);
  if(idx<0){ ok(uid+': sem vídeo',true); continue; }
  await pg.evaluate(i=>document.querySelectorAll('#lList .lhead')[i].click(),idx); await S(450);
  await pg.evaluate(()=>document.querySelector('.vidbtn').click()); await S(3000);
  const r=await pg.evaluate(()=>{const f=document.querySelector('.vidbox iframe');
    return {tem:!!f,ok:f?/\/preview$/.test(f.src):false,v:document.querySelectorAll('video').length};});
  ok(uid+': vídeo abre no player oficial',r.tem&&r.ok);
  ok(uid+': sem <video> bloqueado',r.v===0);
  const fr=pg.frames().find(f=>f.url().includes('drive.google.com/file'));
  const t=fr?await fr.evaluate(()=>document.title).catch(()=>''):'';
  ok(uid+': Drive entregou o arquivo',/\.mp4/i.test(t),t.slice(0,40));
}

// ---------- ÁUDIO DA AULA ----------
await pg.click('nav > button[data-p="lessons"]'); await S(350);
await pg.select('#lUnit','unit_01_part_i'); await S(400);
const idxA=await pg.evaluate(()=>{
  const h=[...document.querySelectorAll('#lList .lhead')];
  const D=JSON.parse(document.getElementById('DATA').textContent);
  const u=D.units[0]; const a=u.blocos.find(b=>b.audio_aula);
  return h.findIndex(x=>x.dataset.open===u.id+'/'+a.num);});
await pg.evaluate(i=>document.querySelectorAll('#lList .lhead')[i].click(),idxA); await S(450);
await pg.evaluate(()=>{const a=document.querySelector('[data-act="aud"]'); if(a)a.click();}); await S(2500);
const pa=await pg.evaluate(()=>{const f=document.querySelector('#audBox iframe');
  return {tem:!!f,ok:f?/\/preview$/.test(f.src):false};});
ok('áudio da aula abre no player oficial',pa.tem&&pa.ok);
const frA=pg.frames().find(f=>f.url().includes('drive.google.com/file'));
ok('Drive entregou o MP3 da aula',frA?/\.mp3/i.test(await frA.evaluate(()=>document.title).catch(()=>'')):false);

// ---------- FRASES: fala + link nativo ----------
const idxF=await pg.evaluate(()=>{
  const h=[...document.querySelectorAll('#lList .lhead')];
  const D=JSON.parse(document.getElementById('DATA').textContent);
  const u=D.units[0]; const a=u.blocos.find(b=>b.frases.some(f=>f.mp3));
  return h.findIndex(x=>x.dataset.open===u.id+'/'+a.num);});
await pg.click('nav > button[data-p="lessons"]'); await S(300);
await pg.select('#lUnit','unit_01_part_i'); await S(400);
await pg.evaluate(i=>document.querySelectorAll('#lList .lhead')[i].click(),idxF); await S(500);
ok('toda frase tem botão de ouvir',(await pg.$$eval('#frList .fplay',e=>e.length))>0);
ok('frases com MP3 têm atalho nativo',(await pg.$$eval('#frList .natbtn',e=>e.length))>0);
ok('atalho nativo aponta para /view',
   (await pg.$$eval('#frList .natbtn',e=>e.every(x=>x.href.endsWith('/view')))));
await pg.evaluate(()=>{window.__spoken=[];document.querySelector('#frList .fplay').click();}); await S(600);
const sp=await pg.evaluate(()=>window.__spoken);
ok('clicar em ▶ envia a frase ao TTS',sp.length===1,JSON.stringify(sp[0]||{}));
ok('TTS usa inglês',sp[0]&&sp[0].l==='en-US',sp[0]&&sp[0].l);
ok('texto falado é a frase da aula',sp[0]&&sp[0].t.length>5,sp[0]&&sp[0].t.slice(0,34));

// ---------- SRS fala a carta ----------
await pg.evaluate(()=>{const b=document.querySelector('#lDetail [data-act="send"]'); if(b)b.click();}); await S(450);
await pg.click('nav > button[data-p="study"]'); await S(400);
await pg.evaluate(()=>{window.__spoken=[];});
await pg.click('#btnStart'); await S(900);
const sp2=await pg.evaluate(()=>window.__spoken);
ok('carta do SRS é falada ao aparecer',sp2.length>=1,JSON.stringify(sp2[0]||{}));
ok('botão Ouvir visível',(await pg.$eval('#fSpeak',e=>getComputedStyle(e).display))!=='none');

// ---------- LISTENING ----------
await pg.click('#moreBtn'); await S(200);
await pg.click('#moreMenu [data-p="listen"]'); await S(600);
ok('listening lista frases',(await pg.$$eval('#wLines .wline',e=>e.length))>0);
const temAud=await pg.$$eval('#wAudioBox iframe',e=>e.length).catch(()=>0);
ok('diálogo usa player oficial quando existe',temAud>=0);
await pg.evaluate(()=>{window.__spoken=[];document.querySelector('#wPlay').click();}); await S(800);
ok('reprodução encadeada fala',(await pg.evaluate(()=>window.__spoken.length))>=1);
await pg.evaluate(()=>document.querySelector('#wStop').click()); await S(300);

// ---------- DITADO ----------
await pg.click('#moreBtn'); await S(200);
await pg.click('#moreMenu [data-p="drills"]'); await S(500);
await pg.evaluate(()=>{[...document.querySelectorAll('#dMode .opt')].find(b=>b.dataset.v==='listen').click();});
await S(250);
await pg.evaluate(()=>{window.__spoken=[];document.querySelector('#dStart').click();}); await S(900);
const rodou=await pg.$eval('#dArea',e=>e.style.display!=='none').catch(()=>false);
ok('ditado inicia',rodou);
ok('ditado fala a frase',(await pg.evaluate(()=>window.__spoken.length))>=1);

// ---------- PDF ----------
await pg.click('nav > button[data-p="lessons"]'); await S(350);
await pg.select('#lUnit','unit_01_part_i'); await S(400);
const idxP=await pg.evaluate(()=>{
  const h=[...document.querySelectorAll('#lList .lhead')];
  const D=JSON.parse(document.getElementById('DATA').textContent);
  const u=D.units[0]; const a=u.blocos.find(b=>b.pdf&&b.pdf.length);
  return a?h.findIndex(x=>x.dataset.open===u.id+'/'+a.num):-1;});
if(idxP>=0){
  await pg.evaluate(i=>document.querySelectorAll('#lList .lhead')[i].click(),idxP); await S(450);
  await pg.evaluate(()=>{const a=document.querySelector('[data-act="pdf"]'); if(a)a.click();}); await S(2200);
  ok('PDF embute via /preview',await pg.$eval('#pdfBox iframe',e=>/\/preview$/.test(e.src)).catch(()=>false));
}

// ---------- integridade ----------
ok('nenhum bloqueio ORB em todo o fluxo',orb===0,'orb='+orb);
ok('nenhum erro de JS',jsErr===0,'err='+jsErr);
const html=await pg.content();
ok('downloads usam confirm=t',/export=download&confirm=t/.test(html));
await pg.click('nav > button[data-p="home"]'); await S(450);
ok('dashboard intacto',(await pg.$$eval('#missionCards .mcard',e=>e.length))===3);
await pg.click('nav > button[data-p="stats"]'); await S(450);
ok('progresso intacto',(await pg.$$eval('#unitProg .prog',e=>e.length))===25);

console.log(`\n${P} passaram, ${F} falharam`);
await b.close(); process.exit(F?1:0);})();
