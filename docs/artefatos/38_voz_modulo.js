/* ============ VOZ: gravar e comparar (Bloco 1) ============
   Opcional por natureza: nada aqui interrompe o estudo. O botão 🎤 só aparece
   se o navegador suportar, e só age quando o usuário clica.

   Camada A (garantida, offline): MediaRecorder grava e toca nativo → você.
   Camada B (quando houver): SpeechRecognition transcreve e compara palavra a palavra.
   Testado em file:// — getUserMedia e MediaRecorder funcionam com o arquivo baixado. */

const VOZ_OK = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia
                  && typeof MediaRecorder !== 'undefined');
const ASR_OK = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

let VZ={rec:null,stream:null,chunks:[],alvo:null,btn:null,blobURL:null};

function vozLimpar(){
  if(VZ.rec && VZ.rec.state!=='inactive'){ try{VZ.rec.stop();}catch(e){} }
  if(VZ.stream){ VZ.stream.getTracks().forEach(t=>t.stop()); VZ.stream=null; }
  VZ.rec=null; VZ.chunks=[];
  if(VZ.btn){ VZ.btn.classList.remove('grav'); VZ.btn.textContent='🎤'; VZ.btn=null; }
}

/* grava até o usuário clicar de novo (ou 10s) */
async function vozGravar(btn,texto,mp3,destino){
  if(!VOZ_OK) return;
  if(VZ.rec && VZ.rec.state==='recording'){ VZ.rec.stop(); return; }
  vozLimpar();
  VZ.btn=btn; VZ.alvo=texto;
  try{
    VZ.stream=await navigator.mediaDevices.getUserMedia({audio:true});
  }catch(e){
    if(destino) destino.innerHTML='<div class="vz-msg">Não consegui acessar o microfone. '+
      'Autorize o acesso no navegador e tente de novo.</div>';
    vozLimpar(); return;
  }
  VZ.chunks=[];
  try{ VZ.rec=new MediaRecorder(VZ.stream); }
  catch(e){ vozLimpar(); return; }
  VZ.rec.ondataavailable=e=>{ if(e.data&&e.data.size) VZ.chunks.push(e.data); };
  VZ.rec.onstop=()=>{
    const blob=new Blob(VZ.chunks,{type:VZ.rec.mimeType||'audio/webm'});
    if(VZ.blobURL) URL.revokeObjectURL(VZ.blobURL);
    VZ.blobURL=URL.createObjectURL(blob);
    if(destino) vozPainel(destino,VZ.blobURL,texto,mp3);
    if(VZ.stream){ VZ.stream.getTracks().forEach(t=>t.stop()); VZ.stream=null; }
    if(VZ.btn){ VZ.btn.classList.remove('grav'); VZ.btn.textContent='🎤'; }
  };
  btn.classList.add('grav'); btn.textContent='⏺';
  VZ.rec.start();
  setTimeout(()=>{ if(VZ.rec && VZ.rec.state==='recording') VZ.rec.stop(); },10000);
}

/* painel comparativo: nativo × você, com transcrição quando houver */
function vozPainel(el,url,texto,mp3){
  el.innerHTML=
    '<div class="vz">'+
      '<div class="vz-lin"><b>Você</b><audio src="'+url+'" controls></audio></div>'+
      (mp3?'<div class="vz-lin"><b>Nativo</b>'+
           '<button class="btn vz-nat" data-vz-nat="'+mp3+'">▶ ouvir no '+hostName()+'</button></div>'
          :'<div class="vz-lin"><b>Modelo</b>'+
           '<button class="btn" data-vz-tts="1">🔊 ouvir a frase</button></div>')+
      '<div class="vz-alvo">'+esc(texto)+'</div>'+
      (ASR_OK?'<button class="btn vz-check" data-vz-asr="1">Comparar com o que eu falei</button>'
             :'<div class="vz-msg">Ouça os dois e avalie você mesmo — é assim que o ouvido calibra.</div>')+
      '<div class="vz-res"></div>'+
    '</div>';
  const nat=el.querySelector('[data-vz-nat]');
  if(nat) nat.onclick=()=>window.open(viewURL(nat.dataset.vzNat),'_blank','noopener');
  const tts=el.querySelector('[data-vz-tts]');
  if(tts) tts.onclick=()=>playPhrase(null,null,null,texto);
  const chk=el.querySelector('[data-vz-asr]');
  if(chk) chk.onclick=()=>vozReconhecer(el.querySelector('.vz-res'),texto,chk);
}

/* Camada B: transcreve a fala e compara palavra a palavra */
function vozReconhecer(res,esperado,btn){
  if(!ASR_OK) return;
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  let sr;
  try{ sr=new SR(); }catch(e){ res.innerHTML='<div class="vz-msg">Reconhecimento indisponível aqui.</div>'; return; }
  sr.lang=LANG_ASR; sr.interimResults=false; sr.maxAlternatives=1;
  btn.disabled=true; btn.textContent='Fale a frase agora…';
  const encerra=()=>{ btn.disabled=false; btn.textContent='Comparar com o que eu falei'; };
  sr.onresult=e=>{
    const dito=e.results[0][0].transcript;
    const acc=similar(dito,esperado);
    const cor=acc>=.9?'var(--ok)':acc>=.6?'var(--warn)':'var(--bad)';
    res.innerHTML='<div class="vz-diff">'+diffHTML(dito,esperado)+'</div>'+
      '<div class="vz-score" style="color:'+cor+'">'+Math.round(acc*100)+'% de correspondência</div>';
    encerra();
  };
  sr.onerror=e=>{
    const m={'no-speech':'Não ouvi nada. Fale mais perto do microfone.',
             'audio-capture':'Microfone indisponível.',
             'not-allowed':'Permissão de microfone negada.',
             'network':'O reconhecimento precisa de internet.'}[e.error]
            ||('Não deu para reconhecer ('+e.error+').');
    res.innerHTML='<div class="vz-msg">'+m+' Você ainda pode comparar de ouvido.</div>';
    encerra();
  };
  sr.onend=encerra;
  try{ sr.start(); }catch(e){ encerra(); }
}

/* botão 🎤 — só sai do lugar se o navegador suportar */
function btnVoz(texto,mp3){
  if(!VOZ_OK) return '';
  return '<button class="vzbtn" data-act="voz" data-en="'+esc(texto)+'" '+
         'data-m="'+(mp3||'')+'" title="Gravar sua voz e comparar">🎤</button>';
}
