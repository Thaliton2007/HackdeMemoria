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
    if(r<min)bad.push({t:t.slice(0,44),r:+r.toFixed(2),min});});
  return bad;})()`;

(async()=>{
const b=await p.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
const pg=await b.newPage(); await pg.setViewport({width:1360,height:940});
pg.on('pageerror',e=>{F++;console.log('  XX JS ERROR: '+e.message)});
await pg.goto('file:///home/user/Ingles_Curso_Completo_Claro_v2.html',{waitUntil:'networkidle0'});

// ---------- nav simplificada ----------
ok('5 itens principais na nav',(await pg.$$eval('header nav > button[data-p]',e=>e.length))===5,
   (await pg.$$eval('header nav > button[data-p]',e=>e.map(x=>x.textContent).join(','))));
ok('botão Mais existe',!!(await pg.$('#moreBtn')));
ok('menu começa fechado',!(await pg.$eval('#moreMenu',e=>e.classList.contains('open'))));
ok('6 itens no menu Mais',(await pg.$$eval('#moreMenu button[data-p]',e=>e.length))===6);
ok('métricas removidas do header',(await pg.$$eval('header .hstat',e=>e.length))===0);
ok('avatar no header',!!(await pg.$('#avatarBtn')));

// dropdown abre/fecha
await pg.click('#moreBtn'); await S(300);
ok('menu abre ao clicar',await pg.$eval('#moreMenu',e=>e.classList.contains('open')));
ok('aria-expanded true',(await pg.$eval('#moreBtn',e=>e.getAttribute('aria-expanded')))==='true');
await pg.keyboard.press('Escape'); await S(250);
ok('Escape fecha o menu',!(await pg.$eval('#moreMenu',e=>e.classList.contains('open'))));
await pg.click('#moreBtn'); await S(250);
await pg.click('body'); await S(250);
ok('clique fora fecha',!(await pg.$eval('#moreMenu',e=>e.classList.contains('open'))));

// navegar por item do menu
await pg.click('#moreBtn'); await S(250);
await pg.click('#moreMenu [data-p="lives"]'); await S(400);
ok('menu navega para Lives',await pg.$eval('#p-lives',e=>e.classList.contains('on')));
ok('Mais fica destacado em página secundária',await pg.$eval('#moreBtn',e=>e.classList.contains('on')));
await pg.click('[data-p="home"]'); await S(400);
ok('Mais perde destaque no Início',!(await pg.$eval('#moreBtn',e=>e.classList.contains('on'))));

// ---------- dashboard ----------
ok('saudação por horário',/Bom dia|Boa tarde|Boa noite/.test(await pg.$eval('#greet',e=>e.textContent)));
ok('CTA único e grande',(await pg.$$eval('.hero-cta',e=>e.length))===1);
ok('3 cartões de Mission',(await pg.$$eval('#missionCards .mcard',e=>e.length))===3);
ok('Missions com barra de progresso',(await pg.$$eval('#missionCards .prog',e=>e.length))===3);
ok('painel Para hoje com 4 linhas',(await pg.$$eval('#todayCard .today',e=>e.length))===4);
ok('painel de ritmo',/Plano de \d+ meses/.test(await pg.$eval('#paceCard',e=>e.innerText)));
ok('barra semanal de 7 dias',(await pg.$$eval('#paceCard .pacebar i',e=>e.length))===7);
ok('2 cartões de atalho',(await pg.$$eval('#quickCards .qcard',e=>e.length))===2);
ok('gráfico de 14 dias preservado',(await pg.$$eval('.wbars .wb',e=>e.length))===14);
ok('4 números soltos removidos',(await pg.$$eval('#p-home .stat',e=>e.length))===0);

// CTA leva para a próxima aula
await pg.click('.hero-cta'); await S(500);
ok('CTA abre a próxima aula',await pg.$eval('#p-lesson',e=>e.classList.contains('on')));
await pg.click('[data-p="home"]'); await S(400);

// clicar na Mission
await pg.evaluate(()=>document.querySelectorAll('#missionCards .mcard')[1].click()); await S(450);
ok('Mission leva para Aulas filtradas',await pg.$eval('#p-lessons',e=>e.classList.contains('on')));
ok('filtro aplicado na unit certa',(await pg.$eval('#lUnit',e=>e.value)).startsWith('unit_'));

// ---------- acessibilidade ----------
await pg.click('[data-p="home"]'); await S(450);
let bad=await pg.evaluate(AUDIT);
ok('home sem texto abaixo de AA',bad.length===0,bad.slice(0,4).map(x=>`"${x.t}" ${x.r}`).join(' | '));
await pg.click('#moreBtn'); await S(300);
bad=await pg.evaluate(AUDIT);
ok('menu Mais sem texto abaixo de AA',bad.length===0,bad.slice(0,4).map(x=>`"${x.t}" ${x.r}`).join(' | '));
await pg.keyboard.press('Escape'); await S(200);

// ---------- funcionalidade intacta ----------
const D=await pg.evaluate(()=>JSON.parse(document.getElementById('DATA').textContent));
ok('25 units',D.units.length===25);
ok('2057 cartas',D.cards.length===2057);
ok('694 questoes',D.units.reduce((a,u)=>a+u.blocos.reduce((x,b)=>x+(b.quiz?b.quiz.length:0),0),0)===694);

for(const [p_,sel] of [['units','#unitList [data-u]'],['listen','#wLines'],['drills','#dMode .opt'],
                       ['browse','#bList'],['plan','#planList'],['stats','#unitProg']]){
  await pg.click('#moreBtn').catch(()=>{}); await S(150);
  const inMenu=await pg.$(`#moreMenu [data-p="${p_}"]`);
  if(inMenu){ await inMenu.click(); } else { await pg.keyboard.press('Escape'); await S(120); await pg.click(`nav > button[data-p="${p_}"]`); }
  await S(500);
  ok('aba '+p_+' renderiza',(await pg.$$eval(sel,e=>e.length))>0);
}

// fluxo de estudo
await pg.click('nav > button[data-p="lessons"]'); await S(400);
await pg.evaluate(()=>document.querySelectorAll('#lList .lhead')[4].click()); await S(450);
await pg.click('[data-act="send"]'); await S(400);
ok('enviar cartas funciona',/Cartas enviadas/.test(await pg.$eval('#lDetail',e=>e.innerText)));
await pg.click('nav > button[data-p="study"]'); await S(400);
await pg.click('#btnStart'); await S(500);
ok('sessão SRS inicia',(await pg.$eval('#study',e=>e.style.display))!=='none');
await pg.click('#btnShow'); await S(250);
await pg.click('#fGradeBtns [data-g="2"]'); await S(350);
ok('avalia carta',(await pg.$eval('#qcDone',e=>e.textContent))==='1');
await pg.click('nav > button[data-p="home"]'); await S(450);
ok('dashboard reflete revisão',/1 revisão|revisão\(ões\)/.test(await pg.$eval('#paceCard',e=>e.innerText)));

// provões pelo menu
await pg.click('#moreBtn'); await S(250);
await pg.click('#moreMenu [data-p="exams"]'); await S(450);
ok('provões acessíveis pelo menu',(await pg.$$eval('#xList .card',e=>e.length))===3);

// responsivo
await pg.setViewport({width:430,height:900}); await S(450);
ok('nav cabe no mobile',(await pg.$eval('header',e=>e.scrollWidth<=e.clientWidth+80)));
await pg.click('nav > button[data-p="home"]'); await S(450);
ok('dashboard empilha no mobile',(await pg.$eval('.dash',e=>getComputedStyle(e).gridTemplateColumns.split(' ').length))===1);
await pg.setViewport({width:1360,height:940}); await S(300);

// persistência
await pg.reload({waitUntil:'networkidle0'}); await S(500);
ok('progresso persiste',/1 revisão|revisão\(ões\)/.test(await pg.$eval('#paceCard',e=>e.innerText)));

console.log(`\n${P} passaram, ${F} falharam`);
await b.close(); process.exit(F?1:0);})();
