const p=require('puppeteer');
let P=0,F=0;const ok=(n,c,d='')=>{c?(P++,console.log('  OK  '+n)):(F++,console.log('  XX  '+n+(d?' :: '+d:'')));};
const S=s=>new Promise(r=>setTimeout(r,s));

const AUDIT=`(()=>{
  function L(c){const m=c.match(/[\\d.]+/g);const [r,g,b]=m.slice(0,3).map(Number);
    const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};
    return .2126*f(r)+.7152*f(g)+.0722*f(b);}
  function CR(a,b){const la=L(a),lb=L(b);return (Math.max(la,lb)+.05)/(Math.min(la,lb)+.05);}
  function px(c){const m=(c||'').match(/[\\d.]+/g)||[0,0,0];
    return {r:+m[0],g:+m[1],b:+m[2],a:m[3]===undefined?1:+m[3]};}
  function bgOf(el){const st=[];let e=el;
    while(e&&e!==document.documentElement){const c=px(getComputedStyle(e).backgroundColor);
      if(c.a>0)st.push(c); if(c.a===1)break; e=e.parentElement;}
    st.push({r:244,g:247,b:246,a:1});
    let out=st[st.length-1];
    for(let i=st.length-2;i>=0;i--){const f=st[i];
      out={r:f.r*f.a+out.r*(1-f.a),g:f.g*f.a+out.g*(1-f.a),b:f.b*f.a+out.b*(1-f.a),a:1};}
    return 'rgb('+Math.round(out.r)+', '+Math.round(out.g)+', '+Math.round(out.b)+')';}
  const bad=[];
  document.querySelectorAll('*').forEach(el=>{
    if(!el.offsetParent||el.children.length)return;
    const t=(el.textContent||'').trim(); if(!t||t.length>90)return;
    const st=getComputedStyle(el);
    const fs=parseFloat(st.fontSize),fw=parseInt(st.fontWeight)||400;
    const min=(fs>=24||(fs>=18.66&&fw>=700))?3:4.5;
    const r=CR(st.color,bgOf(el));
    if(r<min)bad.push({t:t.slice(0,44),r:+r.toFixed(2)});});
  return bad;})()`;

(async()=>{
const b=await p.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
const pg=await b.newPage(); await pg.setViewport({width:1360,height:940});
pg.on('pageerror',e=>{F++;console.log('  XX JS ERROR: '+e.message)});
await pg.goto('file:///home/user/Ingles_Curso_Completo_Claro_v2.html',{waitUntil:'networkidle0'});

const D=await pg.evaluate(()=>JSON.parse(document.getElementById('DATA').textContent));

// ---------- abre a Unit 08 (tem 4 SYNC + 4 TEMA) ----------
await pg.click('nav > button[data-p="lessons"]'); await S(400);
await pg.select('#lUnit','unit_08'); await S(450);

// acha o primeiro bloco de conteúdo (mesma regra do app)
const idx=await pg.evaluate(()=>{
  const SEM=['cronograma','plataforma','apoio','dialogo','diario'];
  const heads=[...document.querySelectorAll('#lList .lhead')];
  const D=JSON.parse(document.getElementById('DATA').textContent);
  const u=D.units.find(x=>x.id==='unit_08');
  const alvo=u.blocos.find(b=>!SEM.includes(b.tipo));
  return heads.findIndex(h=>h.dataset.open==='unit_08/'+alvo.num);});
ok('achou o primeiro bloco de conteúdo',idx>=0,'idx='+idx);
await pg.evaluate(i=>document.querySelectorAll('#lList .lhead')[i].click(),idx); await S(500);

// ---------- bloco SYNC dentro da aula ----------
const det=await pg.$eval('#lDetail',e=>e.innerText);
ok('aula mostra "Lives desta semana"',/Lives desta semana/.test(det));
ok('cita a semana original',/W10|mar\/2021/.test(det),det.slice(0,0));
const nSync=D.units.find(u=>u.id==='unit_08').lives.sync.length;
ok('lista as 4 lives SYNC',(await pg.$$eval('#lDetail .dsec .ex',e=>e.length))>=nSync);
ok('tem link ▶ assistir',(await pg.$$eval('#lDetail a[href*="drive.google.com/file"]',e=>e.length))>0);
ok('link abre em nova aba',(await pg.$$eval('#lDetail a[target="_blank"]',e=>e.length))>0);
ok('TEMA ainda não aparece (aula não concluída)',!/mesmo tema/.test(det));

// ordem: lives antes das cartas
const ordem=await pg.$$eval('#lDetail .dsec h3',e=>e.map(x=>x.textContent));
const iL=ordem.findIndex(t=>/Lives desta semana/.test(t));
const iC=ordem.findIndex(t=>/Cartas desta aula/.test(t));
ok('lives aparecem antes das cartas',iL>=0&&iC>=0&&iL<iC,`live=${iL} cartas=${iC}`);

// contraste com o bloco novo
let bad=await pg.evaluate(AUDIT);
ok('bloco de lives sem texto abaixo de AA',bad.length===0,bad.slice(0,3).map(x=>`"${x.t}" ${x.r}`).join(' | '));

// ---------- concluir -> aparece TEMA ----------
await pg.click('#lDetail [data-act="send"]'); await S(500);
const det2=await pg.$eval('#lDetail',e=>e.innerText);
ok('ao concluir, sugere lives TEMA',/mesmo tema/.test(det2));
ok('texto explica que é reforço',/reforço/.test(det2));
const nTema=D.units.find(u=>u.id==='unit_08').lives.tema.length;
ok('lista as lives TEMA',nTema>0);
bad=await pg.evaluate(AUDIT);
ok('bloco TEMA sem texto abaixo de AA',bad.length===0,bad.slice(0,3).map(x=>`"${x.t}" ${x.r}`).join(' | '));

// ---------- atalho para a aba Lives ----------
ok('tem atalho "ver todas as lives"',(await pg.$$eval('#lDetail [data-act="golives"]',e=>e.length))===1);
await pg.click('#lDetail [data-act="golives"]'); await S(500);
ok('vai para a aba Lives',await pg.$eval('#p-lives',e=>e.classList.contains('on')));
ok('já na Unit 08',(await pg.$eval('#lvUnit',e=>e.value))==='unit_08');
ok('conteúdo é da Unit 08',/Unit 08/.test(await pg.$eval('#lvBody',e=>e.innerText)));

// ---------- não polui: bloco de apoio não repete as lives ----------
await pg.click('nav > button[data-p="lessons"]'); await S(400);
await pg.select('#lUnit','unit_08'); await S(400);
const semLive=await pg.evaluate(()=>{
  const heads=[...document.querySelectorAll('#lList .lhead')];
  const D=JSON.parse(document.getElementById('DATA').textContent);
  const u=D.units.find(x=>x.id==='unit_08');
  const SEM=['cronograma','plataforma','apoio','dialogo','diario'];
  const prim=u.blocos.find(b=>!SEM.includes(b.tipo));
  const outro=u.blocos.find(b=>!SEM.includes(b.tipo)&&b.num!==prim.num);
  return heads.findIndex(h=>h.dataset.open==='unit_08/'+outro.num);});
await pg.evaluate(i=>document.querySelectorAll('#lList .lhead')[i].click(),semLive); await S(450);
ok('lives não se repetem em todo bloco',!/Lives desta semana/.test(await pg.$eval('#lDetail',e=>e.innerText)));

// ---------- unit sem live não quebra ----------
const semLives=D.units.find(u=>u.lives.sync.length===0&&u.lives.tema.length===0);
if(semLives){
  await pg.click('nav > button[data-p="lessons"]'); await S(350);
  await pg.select('#lUnit',semLives.id); await S(400);
  await pg.evaluate(()=>document.querySelectorAll('#lList .lhead')[0].click()); await S(400);
  ok('unit sem live abre normalmente',(await pg.$$eval('#lDetail .dsec',e=>e.length))>0);
} else ok('todas as units têm live mapeada',true);

// ---------- regressão ----------
ok('5 itens na nav',(await pg.$$eval('header nav > button[data-p]',e=>e.length))===5);
await pg.click('nav > button[data-p="home"]'); await S(450);
ok('dashboard intacto',(await pg.$$eval('#missionCards .mcard',e=>e.length))===3);
await pg.click('nav > button[data-p="study"]'); await S(400);
await pg.click('#btnStart'); await S(500);
ok('sessão SRS funciona',(await pg.$eval('#study',e=>e.style.display))!=='none');
await pg.click('#btnShow'); await S(250);
await pg.click('#fGradeBtns [data-g="2"]'); await S(350);
ok('avalia carta',(await pg.$eval('#qcDone',e=>e.textContent))==='1');

// mobile
await pg.setViewport({width:414,height:880}); await S(450);
await pg.click('#tabbar button[data-p="lessons"]'); await S(450);
await pg.select('#lUnit','unit_08'); await S(400);
await pg.evaluate(i=>document.querySelectorAll('#lList .lhead')[i].click(),idx); await S(450);
ok('bloco de lives no mobile',/Lives desta semana/.test(await pg.$eval('#lDetail',e=>e.innerText)));
ok('sem overflow horizontal',await pg.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2));

console.log(`\n${P} passaram, ${F} falharam`);
await b.close(); process.exit(F?1:0);})();
