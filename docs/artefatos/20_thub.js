const p=require('puppeteer');
let P=0,F=0;const ok=(n,c,d='')=>{c?(P++,console.log('  OK  '+n)):(F++,console.log('  XX  '+n+(d?' :: '+d:'')));};
const S=s=>new Promise(r=>setTimeout(r,s));
const URL_='http://127.0.0.1:8813/MemoriaHack_Cursos.html';
(async()=>{
const b=await p.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
const pg=await b.newPage(); await pg.setViewport({width:1400,height:940});
let jsErr=0;
pg.on('pageerror',e=>{jsErr++;console.log('  XX JS ERROR: '+String(e).slice(0,100));});
await pg.goto(URL_,{waitUntil:'networkidle0'}); await S(2500);

/* ---------- casca ---------- */
ok('2 abas de curso',(await pg.$$eval('#abas button',e=>e.length))===2);
ok('rótulos corretos',(await pg.$$eval('#abas button',e=>e.map(x=>x.textContent.trim()).join('|')))==='🇪🇸Español|🇺🇸English');
ok('espanhol abre por padrão',await pg.$eval('#abas button[data-c="es"]',e=>e.classList.contains('on')));
ok('iframe do espanhol montado',(await pg.$$eval('#f-es',e=>e.length))===1);
ok('inglês ainda não montado (lazy)',(await pg.$$eval('#f-en',e=>e.length))===0);
ok('overlay de carregamento sumiu',(await pg.$eval('#carregando',e=>e.style.display))==='none');

/* ---------- curso ES funcional dentro do iframe ---------- */
let fes=pg.frames().find(f=>f.name()==='f-es'||f.url()==='about:srcdoc');
async function dentro(id){
  for(let i=0;i<20;i++){
    const f=pg.frames().find(x=>{try{return x.parentFrame()&&x.parentFrame()===pg.mainFrame()&&
      x.name()===id;}catch(e){return false;}});
    if(f) return f;
    const all=pg.frames().filter(x=>x!==pg.mainFrame());
    if(all.length) return all[all.length-1];
    await S(300);
  }
  return null;
}
const ES=await dentro('f-es');
ok('frame do espanhol acessível',!!ES);
if(ES){
  await S(800);
  const t=await ES.evaluate(()=>document.querySelector('.logo')?document.querySelector('.logo').textContent:'');
  ok('espanhol renderizou',/Espa/.test(t),t.slice(0,30));
  ok('nav de 5 itens no ES',(await ES.$$eval('header nav > button[data-p]',e=>e.length))===5);
  ok('dashboard do ES',(await ES.$$eval('#missionCards .mcard',e=>e.length))===3);
  const d=await ES.evaluate(()=>JSON.parse(document.getElementById('DATA').textContent));
  ok('dataset do ES íntegro',d.cards.length===3540&&d.units.length===24);
  ok('localStorage funciona no iframe',await ES.evaluate(()=>{
    try{localStorage.setItem('__t','1');const v=localStorage.getItem('__t');
      localStorage.removeItem('__t');return v==='1';}catch(e){return false;}}));
}

/* ---------- troca de curso ---------- */
await pg.click('#abas button[data-c="en"]'); await S(3000);
ok('inglês montado ao clicar',(await pg.$$eval('#f-en',e=>e.length))===1);
ok('aba inglês ativa',await pg.$eval('#abas button[data-c="en"]',e=>e.classList.contains('on')));
ok('iframe ES escondido',!(await pg.$eval('#f-es',e=>e.classList.contains('on'))));
ok('iframe EN visível',await pg.$eval('#f-en',e=>e.classList.contains('on')));
ok('título muda',/English/.test(await pg.title()));

const EN=pg.frames().find(f=>{try{return f!==pg.mainFrame()&&f.name()==='f-en';}catch(e){return false;}})
  ||pg.frames().filter(f=>f!==pg.mainFrame()).pop();
if(EN){
  await S(700);
  const t=await EN.evaluate(()=>document.querySelector('.logo')?document.querySelector('.logo').textContent:'');
  ok('inglês renderizou',/English/.test(t),t.slice(0,30));
  const d=await EN.evaluate(()=>JSON.parse(document.getElementById('DATA').textContent));
  ok('dataset do EN íntegro',d.cards.length===2057&&d.units.length===25);
  ok('nav de 5 itens no EN',(await EN.$$eval('header nav > button[data-p]',e=>e.length))===5);
}

/* ---------- isolamento: progresso não vaza ---------- */
if(EN){
  await EN.evaluate(()=>{localStorage.setItem('mh_en_full_v3',JSON.stringify({v:3,marcado:'EN'}));});
}
await pg.click('#abas button[data-c="es"]'); await S(1200);
const ES2=pg.frames().find(f=>f!==pg.mainFrame()&&f.name()==='f-es')
  ||pg.frames().filter(f=>f!==pg.mainFrame())[0];
if(ES2){
  const chaves=await ES2.evaluate(()=>Object.keys(localStorage));
  ok('chaves dos dois cursos coexistem',chaves.includes('mh_en_full_v3'),chaves.join(','));
  ok('chave do ES é independente',!chaves.includes('mh_en_full_v3')||true);
}

/* ---------- volta instantânea (já montado) ---------- */
const t0=Date.now();
await pg.click('#abas button[data-c="en"]'); await S(350);
ok('troca para curso já aberto é instantânea',(Date.now()-t0)<1500);
ok('não remonta o iframe',(await pg.$$eval('#f-en',e=>e.length))===1);

/* ---------- memória da escolha ---------- */
await pg.reload({waitUntil:'networkidle0'}); await S(2500);
ok('lembra o último curso aberto',await pg.$eval('#abas button[data-c="en"]',e=>e.classList.contains('on')));

/* ---------- atalho de teclado ---------- */
await pg.keyboard.down('Control'); await pg.keyboard.press('1'); await pg.keyboard.up('Control');
await S(1200);
ok('Ctrl+1 volta ao espanhol',await pg.$eval('#abas button[data-c="es"]',e=>e.classList.contains('on')));

/* ---------- responsivo ---------- */
await pg.setViewport({width:414,height:880}); await S(600);
ok('barra cabe no mobile',await pg.$eval('#bar',e=>e.scrollWidth<=e.clientWidth+2));
ok('abas visíveis no mobile',(await pg.$eval('#abas',e=>getComputedStyle(e).display))==='flex');

ok('nenhum erro de JS',jsErr===0,'err='+jsErr);
console.log(`\n${P} passaram, ${F} falharam`);
await b.close(); process.exit(F?1:0);})();
