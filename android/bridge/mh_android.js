/* =====================================================================
   Memoria Hack — ponte JS para o APK Android (WebView)
   ---------------------------------------------------------------------
   Este arquivo e injetado no <head> do hub e dos 3 cursos pelo script
   ferramentas/gerar_assets_android.py. Ele NAO altera o HTML original:
   so a copia que vai dentro do APK (assets/) e instrumentada.

   O WebView do Android nao implementa a Web Speech API (nem
   speechSynthesis nem SpeechRecognition), bloqueia login do Google em
   iframe e nao tem historico nas paginas do app (a navegacao e feita
   trocando classes CSS). Aqui nos substituimos essas pecas por pontes
   nativas expostas por MainActivity.java como "window.MHAndroid".
   ===================================================================== */
(function () {
  'use strict';

  if (!window.MHAndroid) return;                 // fora do APK: nao faz nada

  var IS_TOP = false;
  try { IS_TOP = (window === window.top); } catch (e) { IS_TOP = true; }

  /* ------------------------------------------------------------------
     1. Registro de frames: o Java so consegue evaluateJavascript() no
        frame principal, entao todos os frames se registram em window.top
        e o Java dispara __mhEvent em todos (cada um ignora o que nao e seu).
     ------------------------------------------------------------------ */
  try {
    if (!window.top.__mhFrames) window.top.__mhFrames = [];
    window.top.__mhFrames.push(window);
  } catch (e) {}

  var ttsAtual = null;
  var asrAtual = null;

  window.__mhEvent = function (kind, a, b) {
    try {
      if (kind === 'tts') {
        var u = ttsAtual;
        ttsAtual = null;
        if (!u) return;
        if (a === 'end' && typeof u.onend === 'function') u.onend({});
        else if (a === 'error' && typeof u.onerror === 'function') u.onerror({ error: 'synthesis-failed' });
      } else if (kind === 'asr') {
        var r = asrAtual;
        if (!r) return;
        if (a === 'result') {
          if (typeof r.onresult === 'function') {
            r.onresult({ results: [[{ transcript: String(b || ''), confidence: 1 }]], resultIndex: 0 });
          }
        } else if (a === 'error') {
          if (typeof r.onerror === 'function') r.onerror({ error: b || 'no-speech' });
        }
        if (a !== 'start') {
          asrAtual = null;
          if (typeof r.onend === 'function') r.onend({});
        }
      }
    } catch (e) {}
  };

  /* ------------------------------------------------------------------
     2. Voz: sintese (TextToSpeech nativo)
     ------------------------------------------------------------------ */
  function MHUtterance(text) {
    this.text = String(text == null ? '' : text);
    this.lang = ''; this.rate = 1; this.pitch = 1; this.volume = 1;
    this.voice = null;
    this.onstart = null; this.onend = null; this.onerror = null;
    this.onboundary = null; this.onmark = null;
    this.onpause = null; this.onresume = null;
  }

  var VOZES = [
    { name: 'Android ES', lang: 'es-ES', localService: true, 'default': true, voiceURI: 'android:es-ES' },
    { name: 'Android EN', lang: 'en-US', localService: true, 'default': false, voiceURI: 'android:en-US' },
    { name: 'Android FR', lang: 'fr-FR', localService: true, 'default': false, voiceURI: 'android:fr-FR' },
    { name: 'Android PT', lang: 'pt-BR', localService: true, 'default': false, voiceURI: 'android:pt-BR' }
  ];

  var synth = {
    speaking: false, pending: false, paused: false, onvoiceschanged: null,
    getVoices: function () { return VOZES.slice(); },
    speak: function (u) {
      var texto = (typeof u === 'string') ? u : ((u && u.text) || '');
      if (!texto) return;
      var lang = (u && u.lang) || (u && u.voice && u.voice.lang) ||
                 document.documentElement.lang || 'pt-BR';
      var rate = (u && Number(u.rate)) || 1;
      ttsAtual = u;
      this.speaking = true;
      try { MHAndroid.ttsSpeak(texto, lang, rate); }
      catch (e) { this.speaking = false; }
      if (u && typeof u.onstart === 'function') u.onstart({});
    },
    cancel: function () {
      /* Nao dispara 'end': o Java usa um contador (ttsSeq) para ignorar
         o onDone da fala anterior quando ha uma nova logo em seguida. */
      this.speaking = false; this.pending = false; this.paused = false;
      ttsAtual = null;
      try { MHAndroid.ttsCancel(); } catch (e) {}
    },
    pause: function () { this.paused = true; },
    resume: function () { this.paused = false; },
    addEventListener: function (t, fn) { if (t === 'voiceschanged') this.onvoiceschanged = fn; },
    removeEventListener: function () {},
    dispatchEvent: function () { return true; }
  };

  try {
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true, writable: true, value: synth
    });
  } catch (e) { try { window.speechSynthesis = synth; } catch (e2) {} }
  try { window.SpeechSynthesisUtterance = MHUtterance; } catch (e) {}

  /* ------------------------------------------------------------------
     3. Voz: reconhecimento (SpeechRecognizer nativo)
     ------------------------------------------------------------------ */
  function MHSpeechRecognition() {
    this.lang = ''; this.interimResults = false; this.maxAlternatives = 1;
    this.continuous = false;
    this.onresult = null; this.onerror = null; this.onend = null;
    this.onstart = null; this.onspeechend = null;
  }
  MHSpeechRecognition.prototype.start = function () {
    asrAtual = this;
    if (typeof this.onstart === 'function') this.onstart({});
    try { MHAndroid.asrStart(this.lang || document.documentElement.lang || 'pt-BR'); }
    catch (e) { window.__mhEvent('asr', 'error', 'audio-capture'); }
  };
  MHSpeechRecognition.prototype.stop = function () {
    try { MHAndroid.asrStop(); } catch (e) {}
  };
  MHSpeechRecognition.prototype.abort = MHSpeechRecognition.prototype.stop;

  try {
    window.SpeechRecognition = MHSpeechRecognition;
    window.webkitSpeechRecognition = MHSpeechRecognition;
  } catch (e) {}

  /* ------------------------------------------------------------------
     4. Arquivos: o app exporta progresso com Blob + a.click().
        Guardamos o Blob no createObjectURL porque o app chama
        revokeObjectURL() logo depois do clique.
     ------------------------------------------------------------------ */
  var BLOBS = {};
  try {
    var _create = URL.createObjectURL;
    URL.createObjectURL = function (obj) {
      var u = _create.call(URL, obj);
      try { BLOBS[u] = obj; } catch (e) {}
      return u;
    };
  } catch (e) {}

  function exportarBlob(href, nome) {
    var b = BLOBS[href];
    if (!b) {
      try {
        fetch(href).then(function (r) { return r.blob(); }).then(function (x) { ler(x, nome); });
      } catch (e) { MHAndroid.toast('Nao foi possivel exportar o progresso.'); }
      return;
    }
    ler(b, nome);
  }
  function ler(blob, nome) {
    try {
      var fr = new FileReader();
      fr.onload = function () {
        var s = String(fr.result);
        MHAndroid.saveFile(s.substring(s.indexOf(',') + 1), nome);
      };
      fr.onerror = function () { MHAndroid.toast('Nao foi possivel exportar.'); };
      fr.readAsDataURL(blob);
    } catch (e) { MHAndroid.toast('Nao foi possivel exportar.'); }
  }

  try {
    var _click = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {
      try {
        var href = this.getAttribute('href') || '';
        var dl = this.getAttribute('download');
        if (dl && href.indexOf('blob:') === 0) { exportarBlob(href, dl); return; }
        if (/^https?:/i.test(href) && (this.target === '_blank' || dl)) {
          MHAndroid.openExternal(href); return;
        }
      } catch (e) {}
      return _click.apply(this, arguments);
    };
  } catch (e) {}

  document.addEventListener('click', function (e) {
    var a = (e.target && e.target.closest) ? e.target.closest('a') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var dl = a.getAttribute('download');
    if (dl && href.indexOf('blob:') === 0) {
      e.preventDefault(); e.stopPropagation(); exportarBlob(href, dl); return;
    }
    if (/^https?:/i.test(href) && (a.target === '_blank' || dl)) {
      e.preventDefault(); e.stopPropagation(); MHAndroid.openExternal(href);
    }
  }, true);

  /* ------------------------------------------------------------------
     5. Links externos / midia do Drive: o Google bloqueia login dentro
        de WebView, entao abrimos no Chrome (onde o usuario ja esta logado).
        Os iframes /preview viram um botao claro em vez de tela de login.
     ------------------------------------------------------------------ */
  try {
    var _open = window.open;
    window.open = function (url) {
      try {
        if (url && /^https?:/i.test(String(url))) {
          MHAndroid.openExternal(String(url)); return null;
        }
      } catch (e) {}
      return _open ? _open.apply(window, arguments) : null;
    };
  } catch (e) {}

  try {
    var css = document.createElement('style');
    css.textContent =
      '.mh-android-box{box-sizing:border-box;margin:8px 0;padding:14px;border:1px solid #CFD8DE;' +
      'border-radius:12px;background:#EDF2F5;display:flex;flex-direction:column;gap:8px;align-items:flex-start}' +
      '.mh-android-box button{background:#0B6BCB;color:#fff;border:0;border-radius:9px;' +
      'padding:11px 16px;font-size:14px;font-weight:700;cursor:pointer}' +
      '.mh-android-box small{color:#5A6A78;font-size:12px;line-height:1.4}';
    (document.head || document.documentElement).appendChild(css);
  } catch (e) {}

  var patchPendente = false;
  function patchDrive() {
    if (patchPendente) return;
    patchPendente = true;
    setTimeout(function () {
      patchPendente = false;
      try {
        var lista = document.querySelectorAll('iframe[src*="drive.google.com"]');
        for (var i = 0; i < lista.length; i++) {
          var f = lista[i];
          if (f.__mhDrive) continue;
          f.__mhDrive = 1;
          var url = f.getAttribute('src');
          var box = document.createElement('div');
          box.className = 'mh-android-box';
          var btn = document.createElement('button');
          btn.textContent = '▶ Abrir video/PDF no Chrome';
          btn.onclick = (function (u) {
            return function () { MHAndroid.openExternal(u); };
          })(url);
          var dica = document.createElement('small');
          dica.textContent = 'O player do Drive precisa do navegador (login do Google). ' +
                             'O texto da aula continua disponivel aqui embaixo.';
          box.appendChild(btn); box.appendChild(dica);
          if (f.parentNode) f.parentNode.insertBefore(box, f);
          f.style.display = 'none';
        }
      } catch (e) {}
    }, 150);
  }

  document.addEventListener('click', function () {
    setTimeout(patchDrive, 250);
    setTimeout(patchDrive, 900);
  }, true);

  /* ------------------------------------------------------------------
     6. Botao Voltar: a navegacao do app troca classes CSS e nao cria
        historico. Empilhamos as paginas visitadas em cada frame.
     ------------------------------------------------------------------ */
  var pilha = [];
  var atual = null;
  function patchGo() {
    try {
      if (typeof window.go !== 'function' || window.go.__mhPatched) return;
      var original = window.go;
      function envolvida(p) {
        if (atual !== null && atual !== p) {
          pilha.push(atual);
          if (pilha.length > 40) pilha.shift();
        }
        atual = p;
        return original.apply(this, arguments);
      }
      envolvida.__mhPatched = true;
      window.go = envolvida;
      window.__mhFrameBack = function () {
        if (!pilha.length) return false;
        var p = pilha.pop();
        atual = p;
        try { original(p); } catch (e) {}
        return true;
      };
    } catch (e) {}
  }

  if (IS_TOP) {
    window.__mhBackPressed = function () {
      try {
        var lista = document.querySelectorAll('#palco iframe');
        for (var i = 0; i < lista.length; i++) {
          if (lista[i].classList && lista[i].classList.contains('on')) {
            var w = lista[i].contentWindow;
            if (w && w.__mhFrameBack) return w.__mhFrameBack();
          }
        }
        var frames = window.__mhFrames || [];
        for (var j = frames.length - 1; j >= 0; j--) {
          if (frames[j] !== window && frames[j].__mhFrameBack) {
            if (frames[j].__mhFrameBack()) return true;
          }
        }
      } catch (e) {}
      return false;
    };
  }

  function boot() { patchGo(); patchDrive(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
  setTimeout(boot, 900);
  setInterval(patchDrive, 3000);
})();
