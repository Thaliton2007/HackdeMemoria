const fs=require('fs'),vm=require('vm'),assert=require('assert');
const {JSDOM}=require('jsdom');
const raw=JSON.parse(fs.readFileSync('/home/user/cockpit-test-data.json','utf8'));
const code=fs.readFileSync('/home/user/cockpit-rcs-v2/Code.gs','utf8');
let richCalls=[];
function contextFor(data,options={}){
 const sheet={getSheetId:()=>0,getName:()=> 'RCs',getLastRow:()=>data.length,getLastColumn:()=>data[0].length,
 getRange(row,col,height,width){const cells=data.slice(row-1,row-1+height).map(r=>r.slice(col-1,col-1+width));return{
 getValues:()=>cells,getDisplayValues:()=>cells.map(r=>r.map(v=>String(v??''))),
 getRichTextValues:()=>{richCalls.push({col,height,width});return cells.map((r,i)=>r.map((_,j)=>options.rich?.[`${row+i}:${col+j}`]||null));},
 getFormulas:()=>cells.map((r,i)=>r.map((_,j)=>options.formulas?.[`${row+i}:${col+j}`]||''))
 };}};
 const book={getSheets:()=>options.missingSheet?[]:[sheet],getName:()=> 'Cópia de banco de dados',getUrl:()=> 'https://docs.google.com/spreadsheets/d/1zuP_DisCRgGizS6aTlsFjA9iEcklFKGsveFC4JneqvY/edit',getSpreadsheetTimeZone:()=> 'America/Sao_Paulo'};
 const ctx=vm.createContext({console,SpreadsheetApp:{openById:()=>book},Utilities:{formatDate:()=>''}});vm.runInContext(code,ctx);return ctx;
}
const ctx=contextFor(raw);
const payload=JSON.parse(JSON.stringify(ctx.getCockpitData()));
assert.equal(payload.rows.length,377);assert.equal(new Set(payload.rows.map(r=>r.id)).size,377);
assert.equal(new Set(payload.rows.map(r=>r.rc).filter(Boolean)).size,330);
assert.equal(payload.rows.filter(r=>r.nfPosted).length,248);
assert.equal(payload.rows.filter(r=>r.status==='FINALIZADO').length,252);
assert.equal(payload.meta.missingRCCount,1);assert.equal(payload.meta.invalidAmountCount,0);
assert.equal(payload.rows.reduce((a,r)=>a+r.amountCents,0),18908578000);
const missingRC=payload.rows.find(r=>r.os==='359');assert(missingRC);assert.equal(missingRC.rc,'');assert.equal(missingRC.amount,813002);
assert.equal(payload.rows[0].createdISO,'2026-07-08');assert.equal(payload.rows[0].rcUrl,'');assert.equal(payload.rows[0].nfUrl,'');
assert(richCalls.every(c=>c.width===1));assert.equal(richCalls.length,3);
assert.equal(ctx.parseAmount_('R$ 1.234,56'),1234.56);assert.equal(ctx.parseAmount_(1234.56),1234.56);assert.equal(ctx.parseAmount_('invalid'),null);assert.equal(ctx.parseAmount_(''),null);assert.equal(ctx.parseAmount_('-1.234,56'),-1234.56);
assert.equal(ctx.parseDate_('31/02/2026'),'');assert.equal(ctx.safeUrl_('javascript:alert(1)'),'');
const modified=raw.map(r=>[...r]);modified[1][13]='';modified[1][7]='inválido';modified[1][0]='RC-TESTE';
const altered=contextFor(modified).getCockpitData();assert.equal(altered.rows[0].status,'');assert.equal(altered.rows[0].rc,'RC-TESTE');assert.equal(altered.meta.invalidAmountCount,1);
const noObs=raw.map(r=>r.filter((_,i)=>i!==21));assert.throws(()=>contextFor(noObs).getCockpitData(),/OBSERVAÇÃO/);
assert.throws(()=>contextFor(raw,{missingSheet:true}).getCockpitData(),/gid=0/);
const empty=contextFor([raw[0]]).getCockpitData();assert.equal(empty.rows.length,0);
const richFixture={getLinkUrl:()=>null,getRuns:()=>[{getLinkUrl:()=> 'https://drive.google.com/file/d/REAL_LINK/view'}]};
const links=contextFor(raw,{rich:{'2:18':richFixture},formulas:{'2:1':'=HYPERLINK("https://example.org/rc/1144";"1144")'}}).getCockpitData();
assert.equal(links.rows[0].rcUrl,'https://example.org/rc/1144');assert.equal(links.rows[0].nfUrl,'https://drive.google.com/file/d/REAL_LINK/view');
const many=[raw[0],...Array.from({length:2001},()=>raw[1])];
const long=contextFor(many,{rich:{'2002:18':richFixture}}).getCockpitData();assert.equal(long.rows.length,2001);assert(long.rows[2000].nfUrl);
fs.writeFileSync('/home/user/cockpit-validation/payload-v2.json',JSON.stringify(payload));
const html=fs.readFileSync('/home/user/cockpit-rcs-v2/index.html','utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://script.google.com',beforeParse(w){
 w.google={script:{run:{withSuccessHandler(fn){this.ok=fn;return this},withFailureHandler(fn){this.fail=fn;return this},getCockpitData(){this.ok(payload)}}}};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};
 w.URL.createObjectURL=()=> 'blob:test';w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){};
}});
const w=dom.window,d=w.document;const evaluate=code=>w.eval(code);
assert.equal(d.getElementById('kpi-rcs').textContent,'330');assert.equal(d.getElementById('kpi-records').textContent,'377');assert.equal(d.getElementById('kpi-posted').textContent,'248');
assert.equal(d.querySelectorAll('.rc-card').length,12);
function update(id,value){d.getElementById(id).value=value;d.getElementById(id).dispatchEvent(new w.Event('change'));}
update('posted','yes');assert.equal(evaluate('state.filtered.length'),248);d.getElementById('clear').click();
update('rcPresence','missing');assert.equal(evaluate('state.filtered.length'),1);assert(d.getElementById('cards').textContent.includes('813.002,00'));d.getElementById('clear').click();
update('budget','__EMPTY__');assert.equal(evaluate('state.filtered.length'),377);d.getElementById('clear').click();
d.querySelector('[data-status="finalizado"]').click();assert.equal(evaluate('state.filtered.length'),252);d.getElementById('clear').click();
update('from','2026-10-01');assert(evaluate('state.filtered.every(r=>r.createdISO>="2026-10-01")'));d.getElementById('clear').click();
const repeated=payload.rows.filter(r=>r.rc==='TDG0003869');assert.equal(repeated.length,7);
for(const row of repeated){evaluate(`details(${JSON.stringify(row.id)})`);assert(d.getElementById('details-ref').textContent.includes('Linha '+row.sourceRow));assert(d.getElementById('details-grid').textContent.includes(new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(row.amount)));evaluate(`nfPreview(${JSON.stringify(row.id)})`);assert(d.getElementById('nf-ref').textContent.includes('Linha '+row.sourceRow));}
d.getElementById('details-dialog').close();d.getElementById('nf-dialog').close();
d.getElementById('next').click();assert(d.getElementById('page-label').textContent.startsWith('13–24'));d.getElementById('view-table').click();assert.equal(d.querySelectorAll('#table-body tr').length,12);assert(!d.getElementById('table-wrap').classList.contains('hidden'));
update('sort','amountDesc');assert(evaluate('state.filtered[0].amount>=state.filtered[1].amount'));
assert.equal(evaluate('csvText().split("\\r\\n").length'),378);assert.equal(evaluate('csvCell("=1+2")'),'"\'=1+2"');assert.equal(evaluate('safeUrl("javascript:alert(1)")'),'');
w.testPayload={rows:[{...payload.rows[0],id:'fixture',supplier:'<img src=x onerror="window.XSS=1">',notes:'</script><img onerror="window.XSS=1">',rcUrl:'javascript:alert(1)'}],meta:payload.meta};
evaluate('success(window.testPayload,state.request)');d.getElementById('view-cards').click();assert.equal(d.querySelectorAll('#cards img').length,0);assert.equal(w.XSS,undefined);
evaluate('failure(new Error("Simulated network failure"),state.request)');assert.equal(evaluate('state.rows.length'),1);assert(d.getElementById('message').textContent.includes('última leitura'));
w.emptyPayload={rows:[],meta:payload.meta};evaluate('success(window.emptyPayload,state.request)');assert.equal(evaluate('state.rows.length'),0);assert.equal(d.getElementById('kpi-records').textContent,'0');assert.equal(d.getElementById('kpi-rcs').textContent,'0');assert.equal(evaluate('state.byId.size'),0);
console.log('PASS: backend + DOM v2: 377 registros, 330 RCs, 248 NF lançada, OS359 preservada, parcelas, links, >2000 linhas, filtros, segurança, CSV, refresh vazio/falha.');
