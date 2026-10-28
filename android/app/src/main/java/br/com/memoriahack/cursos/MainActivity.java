package br.com.memoriahack.cursos;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Insets;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.media.PlaybackParams;
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
import android.text.TextUtils;
import android.util.Base64;
import android.view.DisplayCutout;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
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
import android.widget.LinearLayout;
import android.widget.MediaController;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import android.widget.VideoView;

import androidx.browser.customtabs.CustomTabsIntent;
import androidx.webkit.WebViewAssetLoader;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

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
    private static final Pattern DRIVE_FILE_ID = Pattern.compile("[A-Za-z0-9_-]{10,100}");

    private WebView web;
    private ProgressBar progress;
    private WebViewAssetLoader assetLoader;

    private ValueCallback<Uri[]> filePathCallback;
    private PermissionRequest pendingPermission;

    private TextToSpeech tts;
    private SpeechRecognizer asr;
    private int ttsSeq = 0;

    private MediaPlayer driveAudioPlayer;
    private String driveAudioId;
    private boolean driveAudioPreparado;
    private int driveAudioSeq;

    private Dialog videoDialog;
    private VideoView videoView;
    private MediaPlayer videoMediaPlayer;
    private TextView videoSpeedButton;
    private String videoIdAtual;
    private float videoSpeed = 1.0f;
    private int orientacaoAntesDoVideo = ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED;
    private boolean orientacaoDoVideoAtiva;

    private FrameLayout telaCheia;
    private WebChromeClient.CustomViewCallback callbackTelaCheia;
    private int visibilidadeOriginal;

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
    protected void onPause() {
        if (videoView != null) {
            try { if (videoView.isPlaying()) videoView.pause(); } catch (Exception ignored) { }
        }
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        fecharVideoDrive();
        liberarAudioDrive(false);
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
        /* Alguns players incorporados (inclusive o do Drive) respondem 403
           quando o User-Agent contem o marcador "; wv" de Android WebView.
           Removemos so esse marcador — NAO e uma tentativa de burlar o login
           do Google: contas/servicos de autenticacao continuam bloqueados e
           sao tratados por avisarLoginDrive() + Chrome Custom Tab. */
        s.setUserAgentString(s.getUserAgentString().replace("; wv", ""));

        CookieManager cm = CookieManager.getInstance();
        cm.setAcceptCookie(true);
        cm.setAcceptThirdPartyCookies(web, true);

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                // Nao classificamos midia por URLs de sub-recursos: o player
                // pode carregar endpoints de conta mesmo para um arquivo publico.
                WebResourceResponse r = assetLoader.shouldInterceptRequest(req.getUrl());
                if (r != null) return r;
                return super.shouldInterceptRequest(view, req);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if (ASSET_HOST.equals(u.getHost())) return false;
                if (ehLoginGoogle(u)) {
                    // Nunca tentamos autenticar dentro do WebView (o Google
                    // bloqueia). Avisamos o JS para trocar o player pelo botao.
                    avisarLoginDrive();
                    if (!req.isForMainFrame()) return true;
                    abrirFora(u.toString());
                    return true;
                }
                String sc = u.getScheme();
                if ("http".equals(sc) || "https".equals(sc)) {
                    if (req.isForMainFrame()) {
                        abrirFora(u.toString());
                        return true;
                    }
                    // Subframe: deixa o player /preview do Drive tocar AQUI.
                    return false;
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

            /* Botao de tela cheia do player do Drive / YouTube. */
            @Override
            public void onShowCustomView(View view, CustomViewCallback cb) {
                if (telaCheia != null) {
                    try { cb.onCustomViewHidden(); } catch (Exception ignored) { }
                    return;
                }
                callbackTelaCheia = cb;
                telaCheia = new FrameLayout(MainActivity.this);
                telaCheia.setBackgroundColor(Color.BLACK);
                telaCheia.addView(view, new FrameLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT, Gravity.CENTER));
                FrameLayout decor = (FrameLayout) getWindow().getDecorView();
                decor.addView(telaCheia, new FrameLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT));
                visibilidadeOriginal = decor.getSystemUiVisibility();
                decor.setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                        | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
            }

            @Override
            public void onHideCustomView() {
                esconderTelaCheia();
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

    private void esconderTelaCheia() {
        if (telaCheia == null) return;
        try {
            FrameLayout decor = (FrameLayout) getWindow().getDecorView();
            decor.removeView(telaCheia);
            decor.setSystemUiVisibility(visibilidadeOriginal);
        } catch (Exception ignored) { }
        telaCheia = null;
        if (callbackTelaCheia != null) {
            try { callbackTelaCheia.onCustomViewHidden(); } catch (Exception ignored) { }
            callbackTelaCheia = null;
        }
    }

    @Override
    public void onBackPressed() {
        if (videoDialog != null && videoDialog.isShowing()) { fecharVideoDrive(); return; }
        if (telaCheia != null) { esconderTelaCheia(); return; }
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
    // Video: player nativo em tela cheia, com busca e velocidade.
    // Links privados continuam no player do Drive via Chrome Custom Tab.
    // ------------------------------------------------------------------
    private void abrirVideoDrive(String id, String titulo) {
        if (id == null || !DRIVE_FILE_ID.matcher(id).matches()) {
            toast("Este vídeo não está disponível.");
            return;
        }

        fecharVideoDrive();
        liberarAudioDrive(true);
        videoIdAtual = id;
        videoSpeed = 1.0f;
        orientacaoAntesDoVideo = getRequestedOrientation();
        orientacaoDoVideoAtiva = true;
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);

        final Dialog dialog = new Dialog(this, android.R.style.Theme_Black_NoTitleBar_Fullscreen);
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE);

        FrameLayout tela = new FrameLayout(this);
        tela.setBackgroundColor(Color.BLACK);

        final VideoView video = new VideoView(this);
        video.setBackgroundColor(Color.BLACK);
        videoView = video;
        tela.addView(video, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT,
                Gravity.CENTER));

        ProgressBar carregando = new ProgressBar(this);
        FrameLayout.LayoutParams carregandoLp = new FrameLayout.LayoutParams(dp(52), dp(52), Gravity.CENTER);
        tela.addView(carregando, carregandoLp);

        LinearLayout barra = new LinearLayout(this);
        barra.setOrientation(LinearLayout.HORIZONTAL);
        barra.setGravity(Gravity.CENTER_VERTICAL);
        barra.setPadding(dp(8), dp(4), dp(8), dp(4));
        barra.setBackgroundColor(Color.argb(185, 0, 0, 0));

        TextView fechar = botaoVideo("×", 24);
        fechar.setContentDescription("Fechar vídeo");
        barra.addView(fechar, new LinearLayout.LayoutParams(dp(48), ViewGroup.LayoutParams.MATCH_PARENT));
        fechar.setOnClickListener(v -> fecharVideoDrive());

        TextView nome = new TextView(this);
        String nomeSeguro = titulo == null ? "" : titulo.replaceAll("[\\r\\n]", " ").trim();
        nome.setText(nomeSeguro.isEmpty() ? "Vídeo da aula" : nomeSeguro);
        nome.setTextColor(Color.WHITE);
        nome.setTextSize(15);
        nome.setSingleLine(true);
        nome.setEllipsize(TextUtils.TruncateAt.END);
        nome.setGravity(Gravity.CENTER_VERTICAL);
        barra.addView(nome, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1));

        TextView voltar10 = botaoVideo("−10s", 14);
        voltar10.setContentDescription("Voltar 10 segundos");
        barra.addView(voltar10, new LinearLayout.LayoutParams(dp(58), ViewGroup.LayoutParams.MATCH_PARENT));
        voltar10.setOnClickListener(v -> {
            if (videoView == video) {
                video.seekTo(Math.max(0, video.getCurrentPosition() - 10000));
            }
        });

        videoSpeedButton = botaoVideo("1×", 15);
        videoSpeedButton.setContentDescription("Velocidade de reprodução");
        barra.addView(videoSpeedButton, new LinearLayout.LayoutParams(dp(52), ViewGroup.LayoutParams.MATCH_PARENT));
        videoSpeedButton.setOnClickListener(v -> mostrarVelocidadesVideo());

        TextView avancar10 = botaoVideo("+10s", 14);
        avancar10.setContentDescription("Avançar 10 segundos");
        barra.addView(avancar10, new LinearLayout.LayoutParams(dp(58), ViewGroup.LayoutParams.MATCH_PARENT));
        avancar10.setOnClickListener(v -> {
            if (videoView == video) {
                int atual = video.getCurrentPosition();
                int duracao = video.getDuration();
                video.seekTo(duracao > 0 ? Math.min(duracao, atual + 10000) : atual + 10000);
            }
        });

        FrameLayout.LayoutParams barraLp = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, dp(56), Gravity.TOP);
        tela.addView(barra, barraLp);

        videoDialog = dialog;
        dialog.setContentView(tela);
        dialog.setOnDismissListener(ignorado -> finalizarVideoDrive(dialog, video));

        MediaController controles = new MediaController(this);
        controles.setAnchorView(video);
        video.setMediaController(controles);
        video.setOnPreparedListener(mp -> {
            if (videoView != video || !id.equals(videoIdAtual)) return;
            videoMediaPlayer = mp;
            carregando.setVisibility(View.GONE);
            aplicarVelocidadeVideo(videoSpeed, rotuloVelocidade(videoSpeed));
            video.start();
            controles.show(6000);
        });
        video.setOnErrorListener((mp, what, extra) -> {
            erroVideoDrive(id);
            return true;
        });

        dialog.show();
        Window janela = dialog.getWindow();
        if (janela != null) configurarJanelaVideo(janela);

        try {
            String url = "https://drive.usercontent.google.com/download?id="
                    + Uri.encode(id) + "&export=download&confirm=t";
            Map<String, String> headers = new HashMap<>();
            headers.put("Referer", "https://drive.google.com/");
            if (web != null) headers.put("User-Agent", web.getSettings().getUserAgentString());
            video.setVideoURI(Uri.parse(url), headers);
        } catch (Exception e) {
            erroVideoDrive(id);
        }
    }

    private TextView botaoVideo(String texto, float tamanho) {
        TextView botao = new TextView(this);
        botao.setText(texto);
        botao.setTextColor(Color.WHITE);
        botao.setTextSize(tamanho);
        botao.setGravity(Gravity.CENTER);
        botao.setPadding(dp(6), dp(4), dp(6), dp(4));
        botao.setBackgroundColor(Color.TRANSPARENT);
        botao.setClickable(true);
        botao.setFocusable(true);
        return botao;
    }

    private void mostrarVelocidadesVideo() {
        if (videoMediaPlayer == null) return;
        final float[] velocidades = {0.5f, 0.75f, 1.0f, 1.25f, 1.5f, 2.0f};
        final String[] rotulos = {"0,5×", "0,75×", "1×", "1,25×", "1,5×", "2×"};
        int selecionado = 2;
        for (int i = 0; i < velocidades.length; i++) {
            if (Math.abs(velocidades[i] - videoSpeed) < 0.01f) { selecionado = i; break; }
        }
        new AlertDialog.Builder(this)
                .setTitle("Velocidade do vídeo")
                .setSingleChoiceItems(rotulos, selecionado, (dialog, qual) -> {
                    aplicarVelocidadeVideo(velocidades[qual], rotulos[qual]);
                    dialog.dismiss();
                })
                .setNegativeButton("Cancelar", null)
                .show();
    }

    private String rotuloVelocidade(float velocidade) {
        if (Math.abs(velocidade - 0.5f) < 0.01f) return "0,5×";
        if (Math.abs(velocidade - 0.75f) < 0.01f) return "0,75×";
        if (Math.abs(velocidade - 1.25f) < 0.01f) return "1,25×";
        if (Math.abs(velocidade - 1.5f) < 0.01f) return "1,5×";
        if (Math.abs(velocidade - 2.0f) < 0.01f) return "2×";
        return "1×";
    }

    private void aplicarVelocidadeVideo(float velocidade, String rotulo) {
        videoSpeed = velocidade;
        if (videoSpeedButton != null) videoSpeedButton.setText(rotulo);
        if (videoMediaPlayer != null) {
            try {
                videoMediaPlayer.setPlaybackParams(new PlaybackParams().setSpeed(velocidade));
            } catch (Exception e) {
                toast("Não foi possível alterar a velocidade neste vídeo.");
            }
        }
    }

    private void configurarJanelaVideo(Window janela) {
        janela.setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);
        janela.addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
        if (Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController barras = janela.getInsetsController();
            if (barras != null) {
                barras.hide(WindowInsets.Type.systemBars());
                barras.setSystemBarsBehavior(
                        WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            janela.getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
        }
    }

    private void erroVideoDrive(String id) {
        if (id == null || !id.equals(videoIdAtual)) return;
        fecharVideoDrive();
        new AlertDialog.Builder(this)
                .setTitle("Não consegui abrir o vídeo")
                .setMessage("Quer tentar pelo player do Google Drive? Se pedir, entre na conta autorizada.")
                .setPositiveButton("Abrir no Drive", (dialog, qual) -> abrirFora(urlPreviewDrive(id)))
                .setNegativeButton("Voltar", null)
                .show();
    }

    private String urlPreviewDrive(String id) {
        return "https://drive.google.com/file/d/" + Uri.encode(id) + "/preview";
    }

    private void fecharVideoDrive() {
        Dialog dialog = videoDialog;
        if (dialog != null && dialog.isShowing()) dialog.dismiss();
        if (dialog == null || videoDialog == dialog) {
            finalizarVideoDrive(dialog, videoView);
        }
    }

    private void finalizarVideoDrive(Dialog dialog, VideoView video) {
        boolean atual = dialog == null || dialog == videoDialog || video == videoView;
        if (!atual) {
            if (video != null) {
                try { video.stopPlayback(); } catch (Exception ignored) { }
            }
            return;
        }
        if (videoDialog == dialog || dialog == null) videoDialog = null;
        if (videoView == video || dialog == null) videoView = null;
        videoMediaPlayer = null;
        videoSpeedButton = null;
        videoIdAtual = null;
        if (video != null) {
            try { video.stopPlayback(); } catch (Exception ignored) { }
        }
        if (orientacaoDoVideoAtiva) {
            orientacaoDoVideoAtiva = false;
            if (!isFinishing() && !isDestroyed()) {
                setRequestedOrientation(orientacaoAntesDoVideo);
            }
        }
    }

    // ------------------------------------------------------------------
    // Audio de aula: toca diretamente no Android sem deixar o iframe do Drive
    // ocupando a pagina. O fallback para arquivos privados continua sendo a
    // Chrome Custom Tab, sem tentar autenticar dentro do WebView.
    // ------------------------------------------------------------------
    private void alternarAudioDrive(String id) {
        if (id == null || !DRIVE_FILE_ID.matcher(id).matches()) {
            if (id != null) disparar("audio", "error", id);
            return;
        }

        if (id.equals(driveAudioId) && driveAudioPlayer != null) {
            if (!driveAudioPreparado) return;
            try {
                if (driveAudioPlayer.isPlaying()) {
                    driveAudioPlayer.pause();
                    disparar("audio", "paused", id);
                } else {
                    driveAudioPlayer.start();
                    disparar("audio", "playing", id);
                }
            } catch (IllegalStateException e) {
                falharAudioDrive(driveAudioSeq, id);
            }
            return;
        }

        liberarAudioDrive(true);
        final int seq = ++driveAudioSeq;
        final String audioId = id;
        MediaPlayer player = new MediaPlayer();
        driveAudioPlayer = player;
        driveAudioId = audioId;
        driveAudioPreparado = false;

        player.setAudioAttributes(new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_MEDIA)
                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                .build());
        player.setOnPreparedListener(mp -> {
            if (seq != driveAudioSeq || mp != driveAudioPlayer) {
                mp.release();
                return;
            }
            driveAudioPreparado = true;
            try {
                mp.start();
                disparar("audio", "playing", audioId);
            } catch (IllegalStateException e) {
                falharAudioDrive(seq, audioId);
            }
        });
        player.setOnCompletionListener(mp -> {
            if (seq != driveAudioSeq || mp != driveAudioPlayer) return;
            disparar("audio", "ended", audioId);
            liberarAudioDrive(false);
        });
        player.setOnErrorListener((mp, what, extra) -> {
            if (seq == driveAudioSeq && mp == driveAudioPlayer) {
                falharAudioDrive(seq, audioId);
            }
            return true;
        });
        player.setOnInfoListener((mp, what, extra) -> {
            if (seq != driveAudioSeq || mp != driveAudioPlayer) return false;
            if (what == MediaPlayer.MEDIA_INFO_BUFFERING_START) {
                disparar("audio", "loading", audioId);
            } else if (what == MediaPlayer.MEDIA_INFO_BUFFERING_END && driveAudioPreparado) {
                disparar("audio", mp.isPlaying() ? "playing" : "paused", audioId);
            }
            return false;
        });

        try {
            String url = "https://drive.usercontent.google.com/download?id="
                    + Uri.encode(audioId) + "&export=download&confirm=t";
            Map<String, String> headers = new HashMap<>();
            headers.put("Referer", "https://drive.google.com/");
            if (web != null) headers.put("User-Agent", web.getSettings().getUserAgentString());
            player.setDataSource(this, Uri.parse(url), headers);
            disparar("audio", "loading", audioId);
            player.prepareAsync();
        } catch (Exception e) {
            falharAudioDrive(seq, audioId);
        }
    }

    private void falharAudioDrive(int seq, String id) {
        if (seq != driveAudioSeq || driveAudioPlayer == null
                || !id.equals(driveAudioId)) return;
        MediaPlayer player = driveAudioPlayer;
        driveAudioPlayer = null;
        driveAudioId = null;
        driveAudioPreparado = false;
        driveAudioSeq++;
        try { player.release(); } catch (Exception ignored) { }
        disparar("audio", "error", id);
    }

    private void liberarAudioDrive(boolean avisar) {
        String id = driveAudioId;
        MediaPlayer player = driveAudioPlayer;
        driveAudioSeq++;
        driveAudioPlayer = null;
        driveAudioId = null;
        driveAudioPreparado = false;
        if (player != null) {
            try { player.setOnPreparedListener(null); } catch (Exception ignored) { }
            try { player.setOnCompletionListener(null); } catch (Exception ignored) { }
            try { player.setOnErrorListener(null); } catch (Exception ignored) { }
            try { player.setOnInfoListener(null); } catch (Exception ignored) { }
            try { player.stop(); } catch (Exception ignored) { }
            try { player.release(); } catch (Exception ignored) { }
        }
        if (avisar && id != null) disparar("audio", "stopped", id);
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

    /** Verdadeiro quando o Drive manda o usuario para a tela de login. */
    private boolean ehLoginGoogle(Uri u) {
        if (u == null) return false;
        String host = u.getHost();
        if (host == null) return false;
        host = host.toLowerCase(Locale.ROOT);
        return host.startsWith("accounts.google.")
                || host.startsWith("consent.google.")
                || host.equals("accounts.google.com")
                || (host.startsWith("drive.google.") &&
                    (u.getPath() != null && u.getPath().contains("ServiceLogin")));
    }

    /**
     * Avisa SOMENTE o curso atualmente visivel que o player acabou redirecionado
     * para login. Assim, um arquivo privado do Espanhol nao afeta os players
     * publicos do Ingles/Frances que ficam montados em iframes escondidos.
     */
    private void avisarLoginDrive() {
        runOnUiThread(() -> web.evaluateJavascript(
                "(function(){try{"
                        + "var f=document.querySelector('#palco iframe.on');"
                        + "var w=f&&f.contentWindow;"
                        + "if(w&&w.__mhEvent)w.__mhEvent('drive','login','');"
                        + "}catch(e){}})()", null));
    }

    /**
     * Abre links externos numa Chrome Custom Tab: e uma aba do navegador que
     * aparece "colada" no app (mesma tarefa, cor da nossa barra, botao de
     * fechar que volta direto para a aula). Nao e uma nova aba solta no Chrome.
     */
    private void abrirFora(String url) {
        runOnUiThread(() -> {
            try {
                CustomTabsIntent.Builder b = new CustomTabsIntent.Builder();
                b.setShowTitle(true);
                b.setToolbarColor(Color.parseColor("#0B6BCB"));
                CustomTabsIntent ct = b.build();
                ct.launchUrl(MainActivity.this, Uri.parse(url));
            } catch (Exception e) {
                try {
                    Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(i);
                } catch (Exception e2) {
                    toast("Abra no Chrome: " + url);
                }
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
        public void toggleDriveAudio(String id) {
            runOnUiThread(() -> alternarAudioDrive(id));
        }

        @JavascriptInterface
        public void playDriveVideo(String id, String title) {
            runOnUiThread(() -> abrirVideoDrive(id, title));
        }

        @JavascriptInterface
        public void openExternal(String url) { abrirFora(url); }

        @JavascriptInterface
        public void saveFile(String base64, String nome) { salvarArquivo(base64, nome); }

        @JavascriptInterface
        public void toast(String msg) { MainActivity.this.toast(msg); }
    }
}
