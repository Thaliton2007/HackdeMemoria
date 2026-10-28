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
gera `memoriahack.jks` uma vez e guarda o arquivo numa **Release tecnica em
rascunho e nao publicada** (`build-key`), acessivel ao GitHub Actions; nas
seguintes execucoes baixa essa mesma chave e a injeta no Gradle via
`-Pandroid.injected.signing.*`. O workflow falha em vez de substituir a chave
se o download der erro. A Release publica que o usuario ve (`apk-v1`) continua
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
sistema legiveis. Para midia privada, o bridge tambem neutraliza `.vidbox`/
`.pdfbox` (caixas pretas 16:9) ao trocar o iframe pelo botao "Abrir no Chrome".

## Midia do Drive dentro do app (v1.6)

O HTML original continua intacto; a ponte do APK intercepta os botoes de
midia, e a ponte e injetada apenas na copia que vai para o APK. Para audios
acessiveis por link, o app usa o `MediaPlayer` nativo e o link direto de
download/stream do Drive: o toque inicia o audio, e o mesmo botao permite
pausar e continuar sem inserir o mini-player na pagina. Se a reproducao direta
falhar, o botao oferece abrir o `/preview` numa **Chrome Custom Tab**.

Para videos publicos, o botao **Assistir** abre um `VideoView` Android em tela
cheia e na horizontal. Os controles nativos incluem pausar/continuar e a barra
para buscar qualquer ponto; a barra superior acrescenta voltar/avancar 10
segundos e ajuste de velocidade (0,5× a 2× via `PlaybackParams`). O video e
transmitido direto do Drive e nao fica embutido na pagina. Se o stream direto
falhar, uma mensagem oferece abrir `/preview` na Chrome Custom Tab. Conteudo
privado, incluindo o acervo privado de Espanhol, vai direto para essa aba
integrada, sem tentar autenticar dentro do WebView.

Os arquivos de audio, video e PDF continuam hospedados no Drive. **Nenhuma
permissao foi alterada.** O video `Opening_Class.mp4` tem permissao
`anyoneWithLink: reader`; o audio real da aula Small Talk (`Small_Talk_Audio_aula.mp3`)
tambem foi conferido como `anyoneWithLink: reader`. Arquivos privados podem
redirecionar para `accounts.google.com`; o Google bloqueia autenticacao em
WebView. A Chrome Custom Tab e uma aba integrada, com barra azul e retorno
direto para a aula, nao uma aba solta no navegador.

## Pontes nativas (por que existem)

| O que o app usa | No WebView do Android | Solucao |
|---|---|---|
| `speechSynthesis` (ouvir) | Nao implementado | `TextToSpeech` nativo + shim JS |
| `SpeechRecognition` (falar) | Nao implementado | `SpeechRecognizer` + shim JS |
| `getUserMedia` (gravar voz) | Precisa de permissao explicita | `onPermissionRequest` + `RECORD_AUDIO` |
| Audio no Drive | Iframe deixava mini-player visivel e nao iniciava sozinho | `MediaPlayer` nativo para arquivos acessiveis; Custom Tab para privado ou em falha |
| Video no Drive | Iframe estreito e controles cortados no celular | `VideoView` nativo em tela cheia; pausa, busca, ±10s e velocidade; Custom Tab no privado ou se o stream falhar |
| Botao Voltar | Navegacao do app nao cria historico | Pilha de paginas por frame + `__mhBackPressed` |
| Exportar progresso (`Blob` + `download`) | WebView nao salva blob | `saveFile()` via MediaStore -> Downloads |
| Importar progresso (`<input type=file>`) | Precisa de chooser nativo | `onShowFileChooser` + `onActivityResult` |

## Limites conhecidos

- Videos, PDFs e MP3 continuam hospedados no Google Drive, entao precisam de
  internet. Arquivos publicos por link tentam tocar dentro do app; arquivos
  privados precisam de login e abrem na Chrome Custom Tab.
- O reconhecimento de voz usa o servico de voz do aparelho; em alguns
  celulares ele precisa de internet na primeira configuracao do idioma.
- O APK e **debug**, assinado com uma chave estavel guardada no GitHub para
  uso pessoal (instalacao lateral). Para Play Store seria preciso gerar uma
  keystore de release e revisar o licenciamento do conteudo do curso.
