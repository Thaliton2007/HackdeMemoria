package br.com.memoriahack.cursos;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Insets;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.util.Base64;
import android.view.DisplayCutout;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.webkit.WebViewAssetLoader;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Memoria Hack — APK autossuficiente.
 *
 * O curso (um unico HTML de ~9,3 MB com os 3 idiomas embutidos) fica em
 * assets/ e e servido por WebViewAssetLoader numa origem HTTPS sintetica.
 * Isso e importante: com file:// o localStorage e getUserMedia nao
 * funcionam direito; com https://appassets.androidplatform.net temos
 * origem estavel, armazenamento e permissao de microfone.
 */
public class MainActivity extends Activity {

    private static final String ASSET_HOST = "appassets.androidplatform.net";
    private static final String START_URL =
            "https://" + ASSET_HOST + "/assets/MemoriaHack_Cursos.html";
    private static final int REQ_FILE = 1001;
    private static final int REQ_AUDIO = 1002;

    private WebView web;
    private ProgressBar progress;
    private WebViewAssetLoader assetLoader;

    private ValueCallback<Uri[]> filePathCallback;
    private PermissionRequest pendingPermission;

    private TextToSpeech tts;
    private SpeechRecognizer asr;
    private int ttsSeq = 0;

    // ------------------------------------------------------------------
    // Ciclo de vida
    // ------------------------------------------------------------------
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setTitle("Memoria Hack");

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.parseColor("#F4F7F6"));

        web = new WebView(this);
        web.setBackgroundColor(Color.WHITE);
        root.addView(web, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        progress = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progress.setMax(100);
        root.addView(progress, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, 6));
        setContentView(root);

        aplicarMargensSeguras(root);

        assetLoader = new WebViewAssetLoader.Builder()
                .setDomain(ASSET_HOST)
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        configurarWebView();
        web.addJavascriptInterface(new Bridge(), "MHAndroid");
        iniciarTts();

        if (savedInstanceState != null) {
            web.restoreState(savedInstanceState);
        } else {
            web.loadUrl(START_URL);
        }

        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO)
                != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, REQ_AUDIO);
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    protected void onDestroy() {
        if (asr != null) { asr.destroy(); asr = null; }
        if (tts != null) { tts.stop(); tts.shutdown(); tts = null; }
        web.destroy();
        super.onDestroy();
    }

    // ------------------------------------------------------------------
    // Margens de seguranca (barra de status, camera/furo na tela, gestos)
    // ------------------------------------------------------------------
    /**
     * O HTML usa viewport-fit=cover e o app tem targetSdk 35: no Android 15+
     * o sistema desenha a janela de borda a borda. Sem este ajuste o conteudo
     * sobe por tras da barra de status / camera e desce sob a barra de gestos.
     * Aplicamos os insets como padding do FrameLayout raiz, o que desloca o
     * WebView inteiro (inclusive elementos position:fixed) para a area segura.
     * O background do root continua preenchendo a faixa da barra de status.
     */
    private void aplicarMargensSeguras(final View root) {
        if (Build.VERSION.SDK_INT >= 28) {
            WindowManager.LayoutParams lp = getWindow().getAttributes();
            lp.layoutInDisplayCutoutMode =
                    WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(lp);
        }

        root.setOnApplyWindowInsetsListener((v, insets) -> {
            int l, t, r, b;
            if (Build.VERSION.SDK_INT >= 30) {
                Insets barras = insets.getInsets(WindowInsets.Type.systemBars());
                Insets corte = insets.getInsets(WindowInsets.Type.displayCutout());
                l = Math.max(barras.left, corte.left);
                t = Math.max(barras.top, corte.top);
                r = Math.max(barras.right, corte.right);
                b = Math.max(barras.bottom, corte.bottom);
            } else {
                l = insets.getSystemWindowInsetLeft();
                t = insets.getSystemWindowInsetTop();
                r = insets.getSystemWindowInsetRight();
                b = insets.getSystemWindowInsetBottom();
                if (Build.VERSION.SDK_INT >= 28) {
                    DisplayCutout corte = insets.getDisplayCutout();
                    if (corte != null) {
                        l = Math.max(l, corte.getSafeInsetLeft());
                        t = Math.max(t, corte.getSafeInsetTop());
                        r = Math.max(r, corte.getSafeInsetRight());
                        b = Math.max(b, corte.getSafeInsetBottom());
                    }
                }
            }
            int folga = dp(4); // respiro extra nas bordas (telas curvas)
            v.setPadding(l + folga, t + folga, r + folga, b + folga);
            return insets; // nao consome: preserva os insets do teclado (IME)
        });
        root.requestApplyInsets();
    }

    private int dp(int valor) {
        return Math.round(valor * getResources().getDisplayMetrics().density);
    }

    // ------------------------------------------------------------------
    // WebView
    // ------------------------------------------------------------------
    private void configurarWebView() {
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowContentAccess(true);
        s.setAllowFileAccess(false);
        s.setAllowFileAccessFromFileURLs(false);
        s.setAllowUniversalAccessFromFileURLs(false);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setJavaScriptCanOpenWindowsAutomatically(true);
        s.setSupportMultipleWindows(false);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(false);
        s.setSupportZoom(true);
        s.setBuiltInZoomControls(true);
        s.setDisplayZoomControls(false);
        s.setTextZoom(100);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setUserAgentString(s.getUserAgentString() + " MemoriaHackAndroid/1.0");

        CookieManager cm = CookieManager.getInstance();
        cm.setAcceptCookie(true);
        cm.setAcceptThirdPartyCookies(web, true);

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                WebResourceResponse r = assetLoader.shouldInterceptRequest(req.getUrl());
                if (r != null) return r;
                return super.shouldInterceptRequest(view, req);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if (ASSET_HOST.equals(u.getHost())) return false;
                String sc = u.getScheme();
                if ("http".equals(sc) || "https".equals(sc)) {
                    if (req.isForMainFrame()) {
                        abrirFora(u.toString());
                        return true;
                    }
                    return false; // subframe: o bridge esconde o iframe do Drive
                }
                if ("tel".equals(sc) || "mailto".equals(sc)) {
                    abrirFora(u.toString());
                    return true;
                }
                return true;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                progress.setVisibility(View.GONE);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest req, WebResourceError err) {
                if (req != null && req.isForMainFrame()) {
                    toast("Erro ao abrir o curso. Feche o app e abra de novo.");
                }
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int p) {
                progress.setProgress(p);
                progress.setVisibility(p < 100 ? View.VISIBLE : View.GONE);
            }

            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> cb,
                                            FileChooserParams params) {
                if (filePathCallback != null) filePathCallback.onReceiveValue(null);
                filePathCallback = cb;
                try {
                    Intent i = params.createIntent();
                    startActivityForResult(Intent.createChooser(i, "Escolher arquivo"), REQ_FILE);
                    return true;
                } catch (Exception e) {
                    filePathCallback = null;
                    return false;
                }
            }

            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        List<String> grant = new ArrayList<>();
                        for (String r : request.getResources()) {
                            if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(r)
                                    || PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(r)) {
                                grant.add(r);
                            }
                        }
                        if (grant.isEmpty()) { request.deny(); return; }
                        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO)
                                == PackageManager.PERMISSION_GRANTED) {
                            request.grant(grant.toArray(new String[0]));
                        } else {
                            pendingPermission = request;
                            requestPermissions(
                                    new String[]{Manifest.permission.RECORD_AUDIO}, REQ_AUDIO);
                        }
                    }
                });
            }
        });

        web.setDownloadListener((url, ua, cd, mime, len) -> abrirFora(url));
    }

    @Override
    public void onRequestPermissionsResult(int req, String[] perms, int[] results) {
        super.onRequestPermissionsResult(req, perms, results);
        if (req == REQ_AUDIO && pendingPermission != null) {
            PermissionRequest p = pendingPermission;
            pendingPermission = null;
            if (results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED) {
                List<String> grant = new ArrayList<>();
                for (String r : p.getResources()) {
                    if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(r)) grant.add(r);
                }
                if (grant.isEmpty()) p.deny();
                else p.grant(grant.toArray(new String[0]));
            } else {
                p.deny();
            }
        }
    }

    @Override
    protected void onActivityResult(int req, int result, Intent data) {
        super.onActivityResult(req, result, data);
        if (req != REQ_FILE || filePathCallback == null) return;
        Uri[] uris = null;
        if (result == RESULT_OK && data != null) {
            if (data.getDataString() != null) {
                uris = new Uri[]{Uri.parse(data.getDataString())};
            } else if (data.getClipData() != null && data.getClipData().getItemCount() > 0) {
                uris = new Uri[]{data.getClipData().getItemAt(0).getUri()};
            }
        }
        filePathCallback.onReceiveValue(uris);
        filePathCallback = null;
    }

    @Override
    public void onBackPressed() {
        web.evaluateJavascript(
                "(function(){try{return !!(window.__mhBackPressed&&window.__mhBackPressed());}"
                        + "catch(e){return false;}})()",
                value -> {
                    if ("true".equals(value)) return;
                    if (web.canGoBack()) { web.goBack(); return; }
                    new AlertDialog.Builder(MainActivity.this)
                            .setTitle("Memoria Hack")
                            .setMessage("Deseja sair do curso?")
                            .setPositiveButton("Sair", (d, w) -> finish())
                            .setNegativeButton("Continuar estudando", null)
                            .show();
                });
    }

    // ------------------------------------------------------------------
    // Voz nativa
    // ------------------------------------------------------------------
    private void iniciarTts() {
        tts = new TextToSpeech(getApplicationContext(), status -> { });
        tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
            @Override public void onStart(String id) { }
            @Override public void onDone(String id) { if (ttsAtual(id)) disparar("tts", "end", ""); }
            @Override public void onError(String id) { if (ttsAtual(id)) disparar("tts", "end", ""); }
        });
    }

    private boolean ttsAtual(String id) {
        return id != null && id.equals(String.valueOf(ttsSeq));
    }

    private void iniciarAsr(String lang) {
        if (!SpeechRecognizer.isRecognitionAvailable(this)) {
            disparar("asr", "error", "network");
            return;
        }
        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO)
                != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, REQ_AUDIO);
            disparar("asr", "error", "not-allowed");
            return;
        }
        if (asr != null) asr.destroy();
        asr = SpeechRecognizer.createSpeechRecognizer(this);
        asr.setRecognitionListener(new RecognitionListener() {
            @Override public void onReadyForSpeech(Bundle p) { }
            @Override public void onBeginningOfSpeech() { }
            @Override public void onRmsChanged(float v) { }
            @Override public void onBufferReceived(byte[] b) { }
            @Override public void onEndOfSpeech() { }
            @Override public void onPartialResults(Bundle p) { }
            @Override public void onEvent(int t, Bundle p) { }
            @Override public void onResults(Bundle r) {
                ArrayList<String> lista = r.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                String texto = (lista != null && !lista.isEmpty()) ? lista.get(0) : "";
                disparar("asr", "result", texto);
            }
            @Override public void onError(int codigo) {
                String nome;
                switch (codigo) {
                    case SpeechRecognizer.ERROR_NO_MATCH:
                    case SpeechRecognizer.ERROR_SPEECH_TIMEOUT: nome = "no-speech"; break;
                    case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS:
                    case SpeechRecognizer.ERROR_CLIENT: nome = "not-allowed"; break;
                    case SpeechRecognizer.ERROR_NETWORK:
                    case SpeechRecognizer.ERROR_NETWORK_TIMEOUT: nome = "network"; break;
                    case SpeechRecognizer.ERROR_AUDIO: nome = "audio-capture"; break;
                    default: nome = "no-speech";
                }
                disparar("asr", "error", nome);
            }
        });

        Intent i = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL,
                RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang.replace('_', '-'));
        i.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
        i.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, false);
        i.putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, getPackageName());
        asr.startListening(i);
    }

    // ------------------------------------------------------------------
    // Utilidades
    // ------------------------------------------------------------------
    /** Dispara __mhEvent no frame principal e em todos os iframes srcdoc. */
    private void disparar(String kind, String a, String b) {
        runOnUiThread(() -> {
            String js = "(function(){try{"
                    + "var L=(window.__mhFrames||[]).slice();"
                    + "var F=document.querySelectorAll('iframe');"
                    + "for(var i=0;i<F.length;i++){try{if(F[i].contentWindow)L.push(F[i].contentWindow);}catch(e){}}"
                    + "var V=[];L.forEach(function(f){if(f&&V.indexOf(f)<0)V.push(f);});"
                    + "V.forEach(function(f){try{f.__mhEvent&&f.__mhEvent("
                    + jsStr(kind) + "," + jsStr(a) + "," + jsStr(b) + ");}catch(e){}});"
                    + "}catch(e){}})()";
            web.evaluateJavascript(js, null);
        });
    }

    private static String jsStr(String s) {
        if (s == null) s = "";
        StringBuilder b = new StringBuilder("'");
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '\\': b.append("\\\\"); break;
                case '\'': b.append("\\'"); break;
                case '"': b.append("\\\""); break;
                case '\n': b.append("\\n"); break;
                case '\r': b.append("\\r"); break;
                case '\t': b.append("\\t"); break;
                default:
                    if (c < 0x20) b.append(String.format("\\u%04x", (int) c));
                    else b.append(c);
            }
        }
        return b.append("'").toString();
    }

    private void abrirFora(String url) {
        runOnUiThread(() -> {
            try {
                Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(i);
            } catch (Exception e) {
                toast("Abra no Chrome: " + url);
            }
        });
    }

    private void toast(String msg) {
        runOnUiThread(() -> Toast.makeText(MainActivity.this, msg, Toast.LENGTH_LONG).show());
    }

    private void salvarArquivo(String base64, String nome) {
        runOnUiThread(() -> {
            try {
                byte[] dados = Base64.decode(base64, Base64.DEFAULT);
                String seguro = nome.replaceAll("[^a-zA-Z0-9._-]", "_");
                if (Build.VERSION.SDK_INT >= 29) {
                    ContentValues cv = new ContentValues();
                    cv.put(MediaStore.Downloads.DISPLAY_NAME, seguro);
                    cv.put(MediaStore.Downloads.MIME_TYPE,
                            seguro.toLowerCase().endsWith(".pdf")
                                    ? "application/pdf" : "application/json");
                    cv.put(MediaStore.Downloads.IS_PENDING, 1);
                    Uri uri = getContentResolver().insert(
                            MediaStore.Downloads.EXTERNAL_CONTENT_URI, cv);
                    if (uri == null) throw new IllegalStateException("sem URI de download");
                    OutputStream out = getContentResolver().openOutputStream(uri);
                    if (out == null) throw new IllegalStateException("sem stream");
                    out.write(dados);
                    out.close();
                    cv.clear();
                    cv.put(MediaStore.Downloads.IS_PENDING, 0);
                    getContentResolver().update(uri, cv, null, null);
                    toast("Arquivo salvo em Downloads/" + seguro);
                } else {
                    File dir = getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                    File f = new File(dir, seguro);
                    FileOutputStream fos = new FileOutputStream(f);
                    fos.write(dados);
                    fos.close();
                    toast("Arquivo salvo em " + f.getAbsolutePath());
                }
            } catch (Exception e) {
                toast("Nao foi possivel salvar: " + e.getMessage());
            }
        });
    }

    // ------------------------------------------------------------------
    // Ponte exposta ao JavaScript como window.MHAndroid
    // ------------------------------------------------------------------
    private final class Bridge {

        @JavascriptInterface
        public void ttsSpeak(String texto, String lang, float rate) {
            runOnUiThread(() -> {
                if (tts == null || texto == null) return;
                String id = String.valueOf(++ttsSeq);
                try {
                    Locale loc = Locale.forLanguageTag(lang.replace('_', '-'));
                    int r = tts.setLanguage(loc);
                    if (r == TextToSpeech.LANG_MISSING_DATA
                            || r == TextToSpeech.LANG_NOT_SUPPORTED) {
                        tts.setLanguage(Locale.getDefault());
                    }
                } catch (Exception ignored) { }
                tts.setSpeechRate(Math.max(0.5f, Math.min(rate, 2.0f)));
                Bundle b = new Bundle();
                b.putInt(TextToSpeech.Engine.KEY_PARAM_STREAM, AudioManager.STREAM_MUSIC);
                tts.speak(texto, TextToSpeech.QUEUE_FLUSH, b, id);
            });
        }

        @JavascriptInterface
        public void ttsCancel() {
            runOnUiThread(() -> {
                ++ttsSeq; // invalida o onDone da fala anterior
                if (tts != null) tts.stop();
            });
        }

        @JavascriptInterface
        public void asrStart(String lang) {
            runOnUiThread(() -> iniciarAsr(lang == null ? "pt-BR" : lang));
        }

        @JavascriptInterface
        public void asrStop() {
            runOnUiThread(() -> { if (asr != null) asr.stopListening(); });
        }

        @JavascriptInterface
        public void openExternal(String url) { abrirFora(url); }

        @JavascriptInterface
        public void saveFile(String base64, String nome) { salvarArquivo(base64, nome); }

        @JavascriptInterface
        public void toast(String msg) { MainActivity.this.toast(msg); }
    }
}
