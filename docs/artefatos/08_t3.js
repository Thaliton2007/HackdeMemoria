const p=require('puppeteer');
let P=0,F=0;const ok=(n,c,d='')=>{c?(P++,console.log('  OK  '+n)):(F++,console.log('  XX  '+n+(d?' :: '+d:'')));};
const S=s=>new Promise(r=>setTimeout(r,s));
(async()=>{
const b=await p.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
const pg=await b.newPage(); await pg.setViewport({width:1360,height:900});
pg.on('pageerror',e=>{F++;console.log('  XX JS ERROR: '+e.message)});
await pg.goto('file:///home/user/Ingles_Curso_Completo.html',{waitUntil:'networkidle0'});

// ---- dataset ----
const D=await pg.evaluate(()=>JSON.parse(document.getElementById('DATA').textContent));
ok('25 units no dataset',D.units.length===25,''+D.units.length);
ok('2057 cartas',D.cards.length===2057,''+D.cards.length);
ok('1895 cartas com audio',D.cards.filter(c=>c.mp3).length===1895);
ok('305 blocos',D.units.reduce((a,u)=>a+u.blocos.length,0)===305);
ok('3 provoes',D.exams.length===3);
ok('provoes com 25 questoes',D.exams.every(e=>e.qs.length===25));
ok('listening com mp3 nos provoes',D.exams.every(e=>e.qs.filter(q=>q.mp3).length===6));
const nq=D.units.reduce((a,u)=>a+u.blocos.reduce((x,b)=>x+(b.quiz?b.quiz.length:0),0),0);
ok('694 questoes de aula',nq===694,''+nq);
ok('todas as questoes com 4 opcoes unicas',D.units.every(u=>u.blocos.every(b=>(b.quiz||[]).every(q=>q.o.length===4&&new Set(q.o).size===4&&q.c>=0&&q.c<4))));
ok('todas as units com lives',D.units.every(u=>u.lives));
ok('todas as units com plano',D.units.every(u=>u.plano&&u.plano.length>0));

// ---- nav: 10 abas ----
ok('10 abas',(await pg.$$eval('header nav button',e=>e.length))===10);
// ---- home ----
ok('total de frases na home',(await pg.$eval('#hTotal',e=>e.textContent))==='2057');
ok('6 ferramentas',(await pg.$$eval('#toolGrid .tool',e=>e.length))===6);
ok('heatmap',(await pg.$$eval('#heat b',e=>e.length))===30);
// ---- unidades ----
await pg.click('[data-p="units"]'); await S(450);
ok('3 missions',(await pg.$$eval('#unitList .card',e=>e.length))===3);
ok('25 units listadas',(await pg.$$eval('#unitList [data-u]',e=>e.length))===25);
await (await pg.$$('#unitList [data-u]'))[9].click(); await S(450);
ok('clicar na unit abre Aulas filtrada',(await pg.$eval('#lUnit',e=>e.value))==='unit_08');
// ---- aulas ----
const nl=await pg.$$eval('#lList .lesson',e=>e.length);
ok('blocos da Unit 08',nl===13,''+nl);
await pg.select('#lUnit',''); await S(400);
ok('todas as units na lista',(await pg.$$eval('#lList .lesson',e=>e.length))>200);
await pg.type('#lSearch','Present Perfect'); await S(450);
ok('busca funciona',(await pg.$$eval('#lList .lesson',e=>e.length))>0);
await pg.evaluate(()=>{document.querySelector('#lSearch').value='';document.querySelector('#lSearch').dispatchEvent(new Event('input'))}); await S(400);
// abrir uma aula com quiz
await pg.select('#lUnit','unit_08'); await S(400);
const heads=await pg.$$('#lList .lhead');
let abriu=false;
for(const h of heads){ await h.click(); await S(350);
  if(await pg.$('.qzbtn')){abriu=true;break;}
  await pg.click('#lBack'); await S(250); }
ok('achou aula com teste',abriu);
ok('detalhe usa .dsec',(await pg.$$eval('#lDetail .dsec',e=>e.length))>=4);
ok('pill da unit no detalhe',/Unit 08/.test(await pg.$eval('#lDetail .dpills',e=>e.innerText)));
// quiz
await pg.click('.qzbtn'); await S(400);
ok('quiz abre',(await pg.$eval('#p-quiz',e=>e.className)).includes('on'));
const total=await pg.evaluate(()=>document.querySelector('#qzHead').innerText.match(/de (\d+)/)[1]);
for(let i=0;i<+total;i++){
  await pg.click('.qzo button[data-i="0"]'); await S(90);
  await pg.click('#qzNext'); await S(200);
  await pg.click('#qzNext'); await S(220);
}
ok('quiz termina com nota',(await pg.$$eval('.qzres .big',e=>e.length))===1);
await pg.click('#qzNext'); await S(400);
// enviar cartas
await pg.click('[data-act="send"]'); await S(400);
ok('cartas enviadas',/Cartas enviadas/.test(await pg.$eval('#lDetail',e=>e.innerText)));
// estudar
await pg.click('[data-p="study"]'); await S(450);
ok('25 units nos filtros',(await pg.$$eval('#optUnit .opt',e=>e.length))===25);
await pg.click('#btnStart'); await S(500);
ok('sessao inicia',(await pg.$eval('#study',e=>e.style.display))!=='none');
ok('pill da unit no card',(await pg.$eval('#fUnit',e=>e.textContent)).length>2);
await pg.click('#btnShow'); await S(250);
await pg.click('#fGradeBtns [data-g="2"]'); await S(350);
ok('avancou',(await pg.$eval('#qcDone',e=>e.textContent))==='1');
// escutar
await pg.click('[data-p="listen"]'); await S(500);
ok('listening agrupado por unit',(await pg.$$eval('#wUnit optgroup',e=>e.length))>20);
ok('linhas de audio',(await pg.$$eval('#wLines .wline',e=>e.length))>0);
// exercicios
await pg.click('[data-p="drills"]'); await S(400);
ok('select com 25 units',(await pg.$$eval('#dUnit option',e=>e.length))===26);
await pg.click('#dStart'); await S(500);
ok('exercicio roda',(await pg.$$eval('#dBody .qzo button',e=>e.length))===4);
// lives
await pg.click('[data-p="lives"]'); await S(450);
ok('seletor de unit nas lives',(await pg.$$eval('#lvUnit option',e=>e.length))===25);
ok('lives renderizam',/SYNC|TEMA|não tem lives/.test(await pg.$eval('#lvBody',e=>e.innerText)));
await pg.select('#lvUnit','unit_17'); await S(350);
ok('troca de unit nas lives',/Unit 17/.test(await pg.$eval('#lvBody',e=>e.innerText)));
// explorar
await pg.click('[data-p="browse"]'); await S(450);
ok('explorar com 2057',/2057 frase/.test(await pg.$eval('#bCount',e=>e.innerText)));
await pg.type('#bSearch','coffee'); await S(400);
ok('busca no acervo',(await pg.$$eval('#bList .li',e=>e.length))>0);
// plano
await pg.click('[data-p="plan"]'); await S(450);
ok('seletor de unit no plano',(await pg.$$eval('#pUnit option',e=>e.length))===25);
ok('dias do plano',(await pg.$$eval('#planList [data-day]',e=>e.length))>=5);
// progresso + provoes
await pg.click('[data-p="stats"]'); await S(500);
ok('grafico de nivel 3 barras',(await pg.$$eval('#lvChart .lvbar .c',e=>e.length))===3);
ok('progresso por unit = 25',(await pg.$$eval('#unitProg .prog',e=>e.length))===25);
ok('boletim com nota',/média|testes feitos/.test(await pg.$eval('#qzStats',e=>e.innerText)));
await pg.click('#goExams'); await S(450);
ok('pagina de provoes',(await pg.$eval('#p-exams',e=>e.className)).includes('on'));
ok('3 cards de provao',(await pg.$$eval('#xList .card',e=>e.length))===3);
ok('provao bloqueado sem progresso',/Conclua pelo menos/.test(await pg.$eval('#xList',e=>e.innerText)));
// destravar A2 forcando progresso
await pg.evaluate(()=>{
  const D=JSON.parse(document.getElementById('DATA').textContent);
  const S=JSON.parse(localStorage.getItem('mh_en_full_v3'));
  D.units.filter(u=>u.mission==='Mission 1').forEach(u=>u.blocos.forEach(b=>S.done[u.id+'/'+b.num]=true));
  localStorage.setItem('mh_en_full_v3',JSON.stringify(S));
});
await pg.reload({waitUntil:'networkidle0'}); await S(500);
await pg.click('[data-p="stats"]'); await S(450);
await pg.click('#goExams'); await S(450);
ok('A2 liberado apos Mission 1',(await pg.$$eval('#xList [data-act="exam"]',e=>e.length))>=1);
await pg.click('#xList [data-act="exam"]'); await S(500);
ok('provao abre',(await pg.$eval('#p-exam',e=>e.className)).includes('on'));
ok('secao na pill',/Reading|Grammar|Vocabulary|Listening/.test(await pg.$eval('#xHead',e=>e.innerText)));
for(let i=0;i<25;i++){
  await pg.click('#xBody .qzo button[data-i="0"]'); await S(60);
  await pg.click('#xNext'); await S(130);
  await pg.click('#xNext'); await S(150);
}
ok('provao termina com score',(await pg.$$eval('.qzres .big',e=>e.length))===1);
ok('desempenho por competencia',(await pg.$$eval('.qzres .prog',e=>e.length))===4);
// persistencia
await pg.reload({waitUntil:'networkidle0'}); await S(500);
ok('progresso persiste',(await pg.$eval('#hDue',e=>e.textContent))!=='0');
console.log(`\n${P} passaram, ${F} falharam`);
await b.close(); process.exit(F?1:0);})();
