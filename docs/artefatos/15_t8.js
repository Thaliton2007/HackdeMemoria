const p=require('puppeteer');
let P=0,F=0;const ok=(n,c,d='')=>{c?(P++,console.log('  OK  '+n)):(F++,console.log('  XX  '+n+(d?' :: '+d:'')));};
const S=s=>new Promise(r=>setTimeout(r,s));
const BASE='http://127.0.0.1:8811/Ingles_Curso_Completo_Claro_v2.html';
(async()=>{
const b=await p.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
const pg=await b.newPage(); await pg.setViewport({width:1360,height:940});
let orb=0, jsErr=0;
pg.on('pageerror',e=>{jsErr++;console.log('  XX JS ERROR: '+String(e).slice(0,90));});
pg.on('requestfailed',r=>{if(String(r.failure().errorText).includes('ORB'))orb++;});
await pg.goto(BASE,{waitUntil:'networkidle0'});

// ---- 1. player de vídeo em 4 units diferentes ----
const alvos=[['unit_01_part_i',1],['unit_08',1],['unit_15',1],['unit_21',1]];
for(const [uid] of alvos){
  await pg.click('nav > button[data-p="lessons"]'); await S(350);
  await pg.select('#lUnit',uid); await S(400);
  const idx=await pg.evaluate(u=>{
    const heads=[...document.querySelectorAll('#lList .lhead')];
    const D=JSON.parse(document.getElementById('DATA').textContent);
    const un=D.units.find(x=>x.id===u); const alvo=un.blocos.find(x=>x.video);
    return alvo?heads.findIndex(h=>h.dataset.open===u+'/'+alvo.num):-1;},uid);
  if(idx<0){ ok(uid+': sem vídeo (pulado)',true); continue; }
  await pg.evaluate(i=>document.querySelectorAll('#lList .lhead')[i].click(),idx); await S(450);
  await pg.evaluate(()=>document.querySelector('.vidbtn').click()); await S(3500);
  const r=await pg.evaluate(()=>{const f=document.querySelector('.vidbox iframe');
    return {tem:!!f,src:f?f.src:'',v:document.querySelectorAll('video').length};});
  ok(uid+': player abre via iframe',r.tem&&/\/preview$/.test(r.src),r.src.slice(-40));
  ok(uid+': não usa <video> bloqueado',r.v===0);
  const fr=pg.frames().find(f=>f.url().includes(uid==='x'?'':'drive.google.com/file'));
  const titulo=fr?await fr.evaluate(()=>document.title).catch(()=>''):'';
  ok(uid+': Drive respondeu com o arquivo',/\.mp4/i.test(titulo),titulo.slice(0,44));
}
ok('nenhum bloqueio ORB em todo o fluxo',orb===0,'orb='+orb);

// ---- 2. áudio das frases (continua por download direto) ----
await pg.click('nav > button[data-p="lessons"]'); await S(350);
await pg.select('#lUnit','unit_01_part_i'); await S(400);
const idxFr=await pg.evaluate(()=>{
  const heads=[...document.querySelectorAll('#lList .lhead')];
  const D=JSON.parse(document.getElementById('DATA').textContent);
  const u=D.units[0]; const alvo=u.blocos.find(b=>b.frases.some(f=>f.mp3));
  return heads.findIndex(h=>h.dataset.open===u.id+'/'+alvo.num);});
await pg.evaluate(i=>document.querySelectorAll('#lList .lhead')[i].click(),idxFr); await S(500);
const som=await pg.evaluate(async()=>{
  const btn=document.querySelector('#frList .fplay[data-m]:not([data-m=""])');
  if(!btn) return {err:'sem botão'};
  const D=JSON.parse(document.getElementById('DATA').textContent);
  const id=btn.dataset.m;
  const u='https://drive.usercontent.google.com/download?id='+id+'&export=download&confirm=t';
  try{const r=await fetch(u,{method:'HEAD'});
    return {ct:r.headers.get('content-type'),len:+r.headers.get('content-length')};}
  catch(e){return {err:String(e).slice(0,50)};}});
ok('MP3 de frase serve audio/*',(som.ct||'').startsWith('audio/'),JSON.stringify(som));
const tocou=await pg.evaluate(async()=>{
  const btn=document.querySelector('#frList .fplay[data-m]:not([data-m=""])');
  btn.click(); await new Promise(r=>setTimeout(r,2500));
  const a=[...document.querySelectorAll('audio')].pop();
  return {readyState:window.__lastAudioRS||null};});
ok('clique no ▶ não gera erro de JS',jsErr===0);

// ---- 3. áudio da aula (arquivo maior, ~17 MB) ----
const audAula=await pg.evaluate(async()=>{
  const D=JSON.parse(document.getElementById('DATA').textContent);
  const b=D.units.flatMap(u=>u.blocos).find(x=>x.audio_aula);
  const u='https://drive.usercontent.google.com/download?id='+b.audio_aula+'&export=download&confirm=t';
  const r=await fetch(u,{method:'HEAD'});
  return {ct:r.headers.get('content-type'),mb:+(r.headers.get('content-length')/1e6).toFixed(1)};});
ok('MP3 de aula serve audio/* com confirm=t',(audAula.ct||'').startsWith('audio/'),JSON.stringify(audAula));

// ---- 4. PDF embutido ----
const idxPdf=await pg.evaluate(()=>{
  const heads=[...document.querySelectorAll('#lList .lhead')];
  const D=JSON.parse(document.getElementById('DATA').textContent);
  const u=D.units[0]; const alvo=u.blocos.find(b=>b.pdf&&b.pdf.length);
  return alvo?heads.findIndex(h=>h.dataset.open===u.id+'/'+alvo.num):-1;});
if(idxPdf>=0){
  await pg.click('nav > button[data-p="lessons"]'); await S(350);
  await pg.select('#lUnit','unit_01_part_i'); await S(400);
  await pg.evaluate(i=>document.querySelectorAll('#lList .lhead')[i].click(),idxPdf); await S(450);
  await pg.evaluate(()=>{const a=document.querySelector('[data-act="pdf"]'); if(a)a.click();}); await S(2500);
  const pdf=await pg.evaluate(()=>{const f=document.querySelector('#pdfBox iframe');
    return {tem:!!f,src:f?f.src:''};});
  ok('PDF embute via /preview',pdf.tem&&/\/preview$/.test(pdf.src));
}

// ---- 5. link de live (deve apontar para /view, não download) ----
await pg.click('nav > button[data-p="lessons"]'); await S(350);
await pg.select('#lUnit','unit_08'); await S(400);
await pg.evaluate(()=>document.querySelectorAll('#lList .lhead')[1].click()); await S(500);
const liveA=await pg.$$eval('#lDetail a[href*="/file/d/"]',e=>e.map(x=>x.href));
ok('links de live usam /view',liveA.length>0&&liveA.every(h=>h.endsWith('/view')),liveA[0]||'');

// ---- 6. regressão: o resto do app segue de pé ----
ok('sem erros de JS em todo o teste',jsErr===0);
await pg.click('nav > button[data-p="home"]'); await S(450);
ok('dashboard ok',(await pg.$$eval('#missionCards .mcard',e=>e.length))===3);
await pg.click('nav > button[data-p="stats"]'); await S(450);
ok('progresso ok',(await pg.$$eval('#unitProg .prog',e=>e.length))===25);

console.log(`\n${P} passaram, ${F} falharam`);
await b.close(); process.exit(F?1:0);})();
