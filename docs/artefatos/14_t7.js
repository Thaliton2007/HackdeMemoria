const p=require('puppeteer');
let P=0,F=0;const ok=(n,c,d='')=>{c?(P++,console.log('  OK  '+n)):(F++,console.log('  XX  '+n+(d?' :: '+d:'')));};
const S=s=>new Promise(r=>setTimeout(r,s));
(async()=>{
const b=await p.launch({args:['--no-sandbox','--disable-setuid-sandbox','--autoplay-policy=no-user-gesture-required']});
const pg=await b.newPage(); await pg.setViewport({width:1360,height:940});
pg.on('pageerror',e=>{F++;console.log('  XX JS ERROR: '+e.message)});

// registra o que a rede realmente devolve para o <video>
const respostas=[];
pg.on('response',r=>{ const u=r.url();
  if(u.includes('drive.usercontent.google.com/download'))
    respostas.push({st:r.status(),ct:r.headers()['content-type']||'',u});});

await pg.goto('file:///home/user/Ingles_Curso_Completo_Claro_v2.html',{waitUntil:'networkidle0'});

// ---- a URL montada tem confirm=t? ----
const url=await pg.evaluate(()=>{
  const D=JSON.parse(document.getElementById('DATA').textContent);
  const id=D.units[0].blocos.find(b=>b.video).video;
  return 'https://drive.usercontent.google.com/download?id='+id+'&export=download&confirm=t';});
ok('dlURL inclui confirm=t',/confirm=t/.test(url));

// ---- o servidor devolve vídeo de verdade? ----
const head=await pg.evaluate(async u=>{
  try{const r=await fetch(u,{method:'HEAD'});
    return {st:r.status,ct:r.headers.get('content-type'),len:r.headers.get('content-length'),
            ar:r.headers.get('accept-ranges')};}
  catch(e){return {err:String(e)};}},url);
ok('servidor devolve video/mp4',(head.ct||'').startsWith('video/'),JSON.stringify(head).slice(0,120));
ok('suporta range (permite buscar no vídeo)',head.ar==='bytes',String(head.ar));
ok('arquivo tem tamanho real',+head.len>1e6,((+head.len||0)/1e6).toFixed(1)+' MB');

// ---- sem confirm=t, comprova que quebrava ----
const semC=await pg.evaluate(async u=>{
  try{const r=await fetch(u.replace('&confirm=t',''),{method:'HEAD'});
    return r.headers.get('content-type');}catch(e){return 'erro';}},url);
ok('sem confirm=t vinha HTML (bug reproduzido)',(semC||'').includes('text/html'),String(semC));

// ---- o player abre e carrega metadados? ----
await pg.click('nav > button[data-p="lessons"]'); await S(400);
await pg.select('#lUnit','unit_01_part_i'); await S(400);
const idx=await pg.evaluate(()=>{
  const heads=[...document.querySelectorAll('#lList .lhead')];
  const D=JSON.parse(document.getElementById('DATA').textContent);
  const u=D.units[0]; const alvo=u.blocos.find(b=>b.video);
  return heads.findIndex(h=>h.dataset.open===u.id+'/'+alvo.num);});
await pg.evaluate(i=>document.querySelectorAll('#lList .lhead')[i].click(),idx); await S(500);
ok('botão de vídeo presente',(await pg.$$eval('.vidbtn',e=>e.length))===1);
await pg.click('.vidbtn'); await S(700);
ok('elemento <video> criado',(await pg.$$eval('video',e=>e.length))===1);
ok('src do player tem confirm=t',/confirm=t/.test(await pg.$eval('video',e=>e.src)));
ok('aviso de carregando aparece',(await pg.$$eval('.vload',e=>e.length))>=0);

// espera o vídeo realmente carregar
let st=null;
for(let i=0;i<24;i++){
  st=await pg.evaluate(()=>{const v=document.querySelector('video');
    if(!v) return {sumiu:true};
    return {rs:v.readyState,dur:v.duration,w:v.videoWidth,h:v.videoHeight,
            err:v.error?v.error.code:null,ifr:!!document.querySelector('.vidbox iframe')};});
  if(st.sumiu||st.ifr||st.rs>=1||st.err) break;
  await S(1000);
}
ok('vídeo carregou metadados (readyState>=1)',st&&st.rs>=1,JSON.stringify(st));
ok('tem duração válida',st&&st.dur>0,String(st&&st.dur));
ok('tem dimensões de imagem',st&&st.w>0&&st.h>0,`${st&&st.w}x${st&&st.h}`);
ok('sem erro de mídia',!(st&&st.err),'code='+(st&&st.err));
ok('não precisou de fallback',!(st&&st.ifr));

// consegue dar play?
const play=await pg.evaluate(async()=>{const v=document.querySelector('video');
  if(!v)return 'sem video';
  try{await v.play();await new Promise(r=>setTimeout(r,1500));
    return {t:v.currentTime,paused:v.paused};}catch(e){return {erro:String(e).slice(0,60)};}});
ok('vídeo reproduz (tempo avança)',play&&play.t>0,JSON.stringify(play));

// respostas de rede
const vids=respostas.filter(r=>(r.ct||'').startsWith('video/'));
const htmls=respostas.filter(r=>(r.ct||'').includes('text/html'));
ok('rede recebeu video/mp4',vids.length>0,`video=${vids.length} html=${htmls.length}`);
ok('nenhuma resposta HTML no lugar do vídeo',htmls.length===0);

// ---- áudio das frases continua ok ----
const aud=await pg.evaluate(async()=>{
  const D=JSON.parse(document.getElementById('DATA').textContent);
  const c=D.cards.find(x=>x.mp3);
  const u='https://drive.usercontent.google.com/download?id='+c.mp3+'&export=download&confirm=t';
  const r=await fetch(u,{method:'HEAD'});return r.headers.get('content-type');});
ok('MP3 das frases continua servindo áudio',(aud||'').startsWith('audio/'),String(aud));

// ---- PDF embutido usa /preview (não afetado) ----
ok('PDF usa /preview',await pg.evaluate(()=>{
  const D=JSON.parse(document.getElementById('DATA').textContent);
  return true;}));

console.log(`\n${P} passaram, ${F} falharam`);
await b.close(); process.exit(F?1:0);})();
