const p=require('puppeteer');
let P=0,F=0;const ok=(n,c,d='')=>{c?(P++,console.log('  OK  '+n)):(F++,console.log('  XX  '+n+(d?' :: '+d:'')));};
const S=s=>new Promise(r=>setTimeout(r,s));
(async()=>{
const b=await p.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
const pg=await b.newPage(); await pg.setViewport({width:1360,height:900});
pg.on('pageerror',e=>{F++;console.log('  XX JS ERROR: '+e.message)});
await pg.goto('file:///home/user/Ingles_Curso_Completo_Claro.html',{waitUntil:'networkidle0'});

// ---------- paleta ----------
const V=await pg.evaluate(()=>{const s=getComputedStyle(document.documentElement);
  const g=k=>s.getPropertyValue(k).trim();
  return {bg:g('--bg'),bg2:g('--bg2'),tx:g('--tx'),tx2:g('--tx2'),tx3:g('--tx3'),
    ac:g('--ac'),ok:g('--ok'),warn:g('--warn'),bad:g('--bad'),es:g('--es'),
    acf:g('--acf'),r:g('--r')};});
ok('tema claro aplicado',V.bg.toUpperCase()==='#F4F7F6',V.bg);
ok('cartões brancos',V.bg2.toUpperCase()==='#FFFFFF');
ok('raio 16px',V.r==='16px',V.r);
ok('azul de ação escurecido',V.ac.toUpperCase()==='#0B6BCB',V.ac);
ok('azul claro preservado p/ preenchimento',V.acf.toUpperCase()==='#74B9FF');

// ---------- contraste medido no DOM ----------
const audit=await pg.evaluate(()=>{
  function L(c){const m=c.match(/\d+/g);const [r,g,b]=m.slice(0,3).map(Number);
    const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};
    return .2126*f(r)+.7152*f(g)+.0722*f(b);}
  function CR(a,b){const la=L(a),lb=L(b);const hi=Math.max(la,lb),lo=Math.min(la,lb);
    return (hi+.05)/(lo+.05);}
  function bgOf(el){let e=el;while(e&&e!==document.documentElement){
    const c=getComputedStyle(e).backgroundColor;
    if(c&&!/rgba\(0, 0, 0, 0\)|transparent/.test(c))return c;e=e.parentElement;}
    return 'rgb(244,247,246)';}
  const out=[];
  document.querySelectorAll('h1,h2,h3,p,b,span,a,button,div').forEach(el=>{
    if(!el.offsetParent) return;
    const t=(el.textContent||'').trim();
    if(!t||t.length>90) return;
    if(el.children.length>0 && el.tagName!=='BUTTON') return;
    const st=getComputedStyle(el);
    const fs=parseFloat(st.fontSize), fw=parseInt(st.fontWeight)||400;
    const grande = fs>=24 || (fs>=18.66 && fw>=700);
    const min = grande?3:4.5;
    const r=CR(st.color,bgOf(el));
    if(r<min) out.push({t:t.slice(0,42),c:st.color,bg:bgOf(el),r:+r.toFixed(2),fs,min});
  });
  return out;});
ok('sem texto abaixo do mínimo AA na home',audit.length===0,
   audit.slice(0,4).map(x=>`"${x.t}" ${x.r}:1`).join(' | '));

// ---------- barras semanais no lugar do heatmap ----------
ok('heatmap substituído por barras',(await pg.$$eval('.wbars .wb',e=>e.length))===14);
ok('legenda do heatmap removida',(await pg.$$eval('.legend',e=>e.length))===0);
ok('barras têm rótulo de dia',(await pg.$eval('.wb .wl',e=>e.textContent)).length>0);

// ---------- cartões sem borda, com sombra ----------
const cs=await pg.evaluate(()=>{const c=document.querySelector('.card');const s=getComputedStyle(c);
  return {bw:s.borderTopWidth,sh:s.boxShadow,pad:s.paddingTop};});
ok('cartão sem borda',cs.bw==='0px',cs.bw);
ok('cartão com sombra',cs.sh!=='none');
ok('padding 24px',cs.pad==='24px',cs.pad);

// ---------- tipografia ----------
const pesos=await pg.evaluate(()=>[...document.querySelectorAll('h1,h2,h3,.stat .v,.logo')]
  .map(e=>parseInt(getComputedStyle(e).fontWeight)).filter(Boolean));
ok('nenhum peso >= 800',Math.max(...pesos)<800,'max='+Math.max(...pesos));

// ---------- funcionalidade intacta ----------
const D=await pg.evaluate(()=>JSON.parse(document.getElementById('DATA').textContent));
ok('25 units',D.units.length===25);
ok('2057 cartas',D.cards.length===2057);
ok('694 questoes',D.units.reduce((a,u)=>a+u.blocos.reduce((x,b)=>x+(b.quiz?b.quiz.length:0),0),0)===694);
ok('10 abas',(await pg.$$eval('header nav button',e=>e.length))===10);

await pg.click('[data-p="units"]'); await S(450);
ok('25 units listadas',(await pg.$$eval('#unitList [data-u]',e=>e.length))===25);
await pg.evaluate(()=>document.querySelectorAll('#unitList [data-u]')[0].click()); await S(450);
await pg.evaluate(()=>document.querySelectorAll('#lList .lhead')[4].click()); await S(450);
ok('detalhe abre',(await pg.$$eval('#lDetail .dsec',e=>e.length))>=4);
ok('vidbtn presente',(await pg.$$eval('.vidbtn',e=>e.length))===1);

// contraste dentro do detalhe da aula
const a2=await pg.evaluate(()=>{
  function L(c){const m=c.match(/\d+/g);const [r,g,b]=m.slice(0,3).map(Number);
    const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};
    return .2126*f(r)+.7152*f(g)+.0722*f(b);}
  function CR(a,b){const la=L(a),lb=L(b);const hi=Math.max(la,lb),lo=Math.min(la,lb);return (hi+.05)/(lo+.05);}
  function bgOf(el){let e=el;while(e&&e!==document.documentElement){
    const c=getComputedStyle(e).backgroundColor;
    if(c&&!/rgba\(0, 0, 0, 0\)|transparent/.test(c))return c;e=e.parentElement;}return 'rgb(255,255,255)';}
  const out=[];
  document.querySelectorAll('#lDetail *').forEach(el=>{
    if(!el.offsetParent||el.children.length)return;
    const t=(el.textContent||'').trim(); if(!t||t.length>90)return;
    const st=getComputedStyle(el); const fs=parseFloat(st.fontSize),fw=parseInt(st.fontWeight)||400;
    const min=(fs>=24||(fs>=18.66&&fw>=700))?3:4.5;
    const r=CR(st.color,bgOf(el));
    if(r<min)out.push({t:t.slice(0,40),r:+r.toFixed(2)});});
  return out;});
ok('sem texto abaixo de AA no detalhe da aula',a2.length===0,a2.slice(0,3).map(x=>`"${x.t}" ${x.r}`).join(' | '));

// botão primário com texto branco
const btn=await pg.evaluate(()=>{const b=document.querySelector('.btn.p');if(!b)return null;
  const s=getComputedStyle(b);return{c:s.color,bg:s.backgroundColor};});
if(btn){
  const cr=await pg.evaluate(o=>{
    function L(c){const m=c.match(/\d+/g);const [r,g,b]=m.slice(0,3).map(Number);
      const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};
      return .2126*f(r)+.7152*f(g)+.0722*f(b);}
    const la=L(o.c),lb=L(o.bg);return (Math.max(la,lb)+.05)/(Math.min(la,lb)+.05);},btn);
  ok('botão primário >= 4.5:1',cr>=4.5,cr.toFixed(2)+':1');
}

// fluxo: quiz + cartas + sessão
await pg.click('[data-act="send"]'); await S(400);
ok('cartas enviadas',/Cartas enviadas/.test(await pg.$eval('#lDetail',e=>e.innerText)));
await pg.click('[data-p="study"]'); await S(400);
await pg.click('#btnStart'); await S(500);
ok('sessão inicia',(await pg.$eval('#study',e=>e.style.display))!=='none');
await pg.click('#btnShow'); await S(250);
await pg.click('#fGradeBtns [data-g="2"]'); await S(350);
ok('avança carta',(await pg.$eval('#qcDone',e=>e.textContent))==='1');
await pg.click('[data-p="home"]'); await S(450);
ok('barras registram atividade',(await pg.$eval('.wbars',e=>e.innerText)).trim().length>0);
await pg.click('[data-p="stats"]'); await S(500);
ok('progresso renderiza',(await pg.$$eval('#unitProg .prog',e=>e.length))===25);
ok('gráfico de nível',(await pg.$$eval('#lvChart .lvbar .c',e=>e.length))===3);

// rosa não pode sobrar
const html=await pg.content();
ok('nenhum rosa #ff397d remanescente',!/ff397d/i.test(html));
ok('nenhum rgba rosa remanescente',!/rgba\(255,\s*57,\s*125/.test(html));

console.log(`\n${P} passaram, ${F} falharam`);
await b.close(); process.exit(F?1:0);})();
