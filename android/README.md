# Projeto Android (APK autossuficiente)

Aplicativo de estudo **Memoria Hack** com os 3 cursos (Espanhol, Ingles e
Frances) **dentro do proprio APK**. Nao precisa de site, conta ou internet
para estudar: cartas, SRS, testes e provoes funcionam offline.

## Como o build funciona

1. `ferramentas/gerar_assets_android.py` le `app/MemoriaHack_Cursos.html`
   (producao 14/10, MD5 `8e547cdd...`), decodifica os 3 cursos em Base64 e
   injeta `android/bridge/mh_android.js` no `<head>` de cada um — **o HTML
   original nunca e alterado**. O resultado vai para
   `app/src/main/assets/MemoriaHack_Cursos.html` (nao versionado).
2. `MainActivity` serve esse HTML por `WebViewAssetLoader` em
   `https://appassets.androidplatform.net/assets/...`, uma origem HTTPS
   sintetica. Isso da `localStorage` estavel e habilita `getUserMedia`.
3. O GitHub Actions (`.github/workflows/build-apk.yml`) instala JDK 17 +
   Android SDK 35 + Gradle 8.9 e roda `gradle :app:assembleDebug`.

## Compilar no seu PC (opcional)

Requisitos: Android Studio (JDK 17), SDK 35 e Gradle 8.9.

```bash
python3 ferramentas/gerar_assets_android.py
cd android
gradle :app:assembleDebug
# APK em app/build/outputs/apk/debug/app-debug.apk
```

Ou abra a pasta `android/` no Android Studio e use **Run**.

## Assinatura estavel (v1.2)

O `debug.keystore` padrao e criado por maquina. Como cada execucao do GitHub
Actions usa um runner novo, cada APK sairia com um certificado diferente e o
Android recusaria instalar a atualizacao ("App nao instalado"). O workflow
resolve assim: na primeira execucao gera `memoriahack.jks` com `keytool` e
publica o arquivo numa Release tecnica separada (`build-key`); nas seguintes
baixa essa mesma chave e a injeta no Gradle via
`-Pandroid.injected.signing.*`. A Release que o usuario ve (`apk-v1`) continua
com um unico arquivo: `MemoriaHack.apk`.

Para confirmar que duas versoes usam o mesmo certificado (sem precisar de
Java / Android SDK na maquina):

```bash
python3 ferramentas/verificar_assinatura_apk.py A.apk B.apk
```

Ou, com o SDK instalado: `apksigner verify --print-certs MemoriaHack.apk`.

## Margens de seguranca (v1.1)

O HTML de producao usa `viewport-fit=cover`. Com `targetSdk 35`, o Android 15+
desenha a janela de borda a borda e o conteudo subia por tras da barra de
status / furo da camera e descia sob a barra de gestos. `MainActivity
.aplicarMargensSeguras()` aplica os insets de `systemBars()` + `displayCutout()`
como padding do FrameLayout raiz — isso desloca o WebView inteiro (inclusive
elementos `position:fixed`) sem alterar o HTML. O background do root preenche
a faixa da barra de status e `windowLightStatusBar=true` mantem os icones do
sistema legiveis. O bridge tambem neutraliza `.vidbox`/`.pdfbox` (caixas
pretas 16:9) ao trocar o iframe do Drive pelo botao "Abrir no Chrome".

## Pontes nativas (por que existem)

| O que o app usa | No WebView do Android | Solucao |
|---|---|---|
| `speechSynthesis` (ouvir) | Nao implementado | `TextToSpeech` nativo + shim JS |
| `SpeechRecognition` (falar) | Nao implementado | `SpeechRecognizer` + shim JS |
| `getUserMedia` (gravar voz) | Precisa de permissao explicita | `onPermissionRequest` + `RECORD_AUDIO` |
| Player do Drive em iframe | Google bloqueia login em WebView | Botao que abre no Chrome via `ACTION_VIEW` |
| Botao Voltar | Navegacao do app nao cria historico | Pilha de paginas por frame + `__mhBackPressed` |
| Exportar progresso (`Blob` + `download`) | WebView nao salva blob | `saveFile()` via MediaStore -> Downloads |
| Importar progresso (`<input type=file>`) | Precisa de chooser nativo | `onShowFileChooser` + `onActivityResult` |

## Limites conhecidos

- Os **videos, PDFs e MP3** continuam no Google Drive. Eles abrem no Chrome
  (onde a conta da empresa ja esta logada) e por isso precisam de internet.
  O texto/teoria das aulas esta embutido e funciona offline.
- O reconhecimento de voz usa o servico de voz do aparelho; em alguns
  celulares ele precisa de internet na primeira configuracao do idioma.
- O APK e **debug**, assinado com a chave de debug do Gradle. Serve para
  uso pessoal (instalacao lateral). Para Play Store seria preciso gerar uma
  keystore de release e revisar o licenciamento do conteudo do curso.
