# Memoria Hack — contexto completo do projeto

**Documento de retomada.** Escrito em 27/10/2026 depois de ler integralmente:
`Contexto.html` (150 mensagens da conversa com o agente anterior), os anexos HTML, e os
documentos/roteiros/scripts da pasta do Google Drive. É o "backup da mente" para qualquer
agente (ou pessoa) continuar o trabalho sem perguntar o que já foi feito.

---

## 1. O que é o projeto

Uma **plataforma de estudos de idiomas em HTML único, sem servidor, que funciona offline**,
criada para substituir — e superar — o MemHack (memhack.io) e as outras plataformas externas
usadas pelos cursos da **Fluency Academy (Rhavi Carneiro)**.

O usuário comprou três cursos (Espanhol, Inglês, Francês) e quer estudar por um app próprio,
no PC e no celular, inclusive no trabalho. Ele é o **único usuário**; não há alunos externos.

Produto final: **`MemoriaHack_Cursos.html`** — um hub com os três cursos em abas, cada um com
SRS (repetição espaçada), aulas, teoria, cartas, exercícios, testes por aula com nota 0–10,
provões de nivelamento, cronograma, lives (inglês) e estatísticas.

**Regra de entrega decidida em 14/10:** o arquivo principal é sempre `MemoriaHack_Cursos.html`
na pasta raiz do Drive. Toda alteração de HTML = copiar a versão anterior para
`backup/<tema_data>/` (local e no Drive) e substituir o principal.

---

## 2. Linha do tempo (o que já aconteceu)

| Data | Marco |
|---|---|
| 18/09/2026 | Análise completa do Drive de Espanhol (4.845 itens, ~55 GB: 213 vídeos, 2.711 MP3, 268 PDFs, 312 HTMLs). Dossiê do curso. |
| 18–19/09 | `MemoriaHack.html`: 3.540 cartas reais extraídas dos HTMLs/PDFs, SRS SM-2, Fast Thinking Drill, digitação com diff, TTS, progresso. |
| 19–20/09 | Reconstrução das **5 plataformas externas** do curso (memhack.io, Anchor.fm/Walk'n'Talk, YouTube/Aplícalo, Kajabi/Diario de Clases, Typeform) dentro do HTML → 9 abas. |
| 20/09 | **Aulas completas**: teoria integral dos PDFs em 159 aulas; **cartas liberadas por aula** (gating) — "✓ Enviar cartas para estudo". |
| 20–21/09 | Vídeos (162) e Walk'n'Talk (24 MP3) ligados por caminho; PDFs embutidos via `fetch → blob`; página individual de aula com anterior/próxima. |
| 21/09 | **Testes por aula** (1.440 questões ancoradas no conteúdo, nota 0–10, boletim) e **4 provões DELE A1→B2** com pontuação por grupos. |
| 21–22/09 | Refatoração para troca de Drive: `sources.json` (421 IDs com `path` + `md5`), `course.json`, `remap_drive.py`, `rebuild.sh`. Teste 421/421. |
| 22/09 | Longa discussão sobre hospedagem (Drive público × privado, Archive.org, YouTube não listado, Cloudflare R2). **Decisão final: tudo no Drive privado da empresa, somente o usuário logado.** |
| 23/09 | Curso de **Inglês**: 1.293 pastas / 5.133 arquivos; 25 units em 3 Missions; 265 lives; **111 ligações Unit↔Live** (SYNC/TEMA). Protótipo U1.1, depois escalada para 25 units. |
| 23/09 | `Ingles_Curso_Completo.html`: 2.057 cartas (1.895 com áudio nativo), 305 blocos, 694 questões, 3 provões Cambridge. |
| 23/09 | Refatoração UI/UX (PDF de instruções): **tema claro acessível WCAG AA** (etapa 1) e **nav com 5 abas + menu "Mais"**, dashboard novo, tab bar no mobile (etapa 2). |
| 23/09 | **Correção de mídia**: `confirm=t` para downloads grandes e migração para o player oficial `/preview` em iframe, porque o Drive bloqueia hotlink (`Sec-Fetch-Dest: audio/video` → 403 / `ERR_BLOCKED_BY_ORB`). |
| 23/09 | Mesmas três mudanças replicadas no Espanhol (`MemoriaHack_Espanhol_Claro_v2.html`). |
| 23/09 | **Hub**: `MemoriaHack_Cursos.html` — 2 cursos em iframes `srcdoc` com Base64; chaves `localStorage` separadas. Medido: até 12 cursos confortável, ~34 no teto do localStorage, 100 quebra. |
| 24/09 | Curso de **Francês**: 1.615 pastas / 7.742 arquivos, 30 unidades (25 + 5 revisões), 3.766 pares FR→PT, PDF em 100% das aulas com áudio. `Frances_Curso_Completo.html` com 4 provões DELF (regra eliminatória 5/25 por épreuve). |
| 25/09 | Paridade dos testes com o espanhol (mais tipos, "Ouça e escolha", seções nomeadas nos provões). Transcrição dos MP3 do FTD com `faster-whisper` + merge com o nome truncado. |
| 25/09 | **Agenda do SRS visível**: contagem regressiva, atraso, "Vencem em 24h", banner de acúmulo e pop-up (não bloqueante) ao enviar cartas. |
| 25/09 | Auditoria honesta: notas **Espanhol 5,5 · Inglês 6,5 · Francês 6,0**; falta produção (falar/escrever); provões são simulados, não exames reais. |
| 26/09 | **Bloco 1 (fala)** implementado nos 3: gravar voz, comparar nativo×você, `SpeechRecognition` opcional, switch "Praticar a fala" desligado por padrão. |
| 26/09 | **Bandeiras SVG** + **fluxo dinâmico** (pop-up do dia, convite ao provão ao fechar 100% da missão). |
| 26/09 | Correção de viés nas respostas (rodízio por tipo + anti-sequência de 3 iguais; gabarito validado). |
| 26/09 | **Bloco 4** — questões de compreensão: "erro plantado", lacuna com distrator sintático, cota por tipo. Espanhol recebeu `gen_quiz_es.py`. |
| 01/10 | Export do workspace para o Drive (`IDIOMAS/workspace-01a0efed-...`). |
| 14/10 | **Saneamento do espanhol**: 381 cartas (10,8%) com frase ES quebrada; 253 reparadas pela fonte, 122 marcadas `bad` e fora do baralho; testes regenerados (1.046 em 141 aulas); baralho útil 3.418 cartas. Roadmap e `entregas.json` atualizados. Bloco 7: FTD francês 600+/923 transcritos. |
| 27/10 | Usuário cria a pasta `HTML cursos contexo` com o export de 26/09 + `Contexto.html` e pede a retomada. |

---

## 3. Arquitetura

### 3.1 Um arquivo por curso

Cada curso é um HTML autocontido: CSS embutido, `<script id="DATA">` com o dataset JSON,
`<script>` com o app (IIFE), e nenhuma dependência externa. Abre com duplo clique, funciona
offline. Tamanhos: ES 2,63 MB · EN 1,78 MB · FR 2,62 MB.

Chaves de progresso (`localStorage`), separadas por curso:

| Curso | Chave | Estrutura do dataset |
|---|---|---|
| Espanhol | `memoriahack.v1` | `{cards, units, lessons, diario, stats, wnt, diarioPdf, exams}` — 159 `lessons` com `quiz` dentro |
| Inglês | `mh_en_full_v3` | `{curso, units[25], cards, folder, exams}` — `units[].blocos[]` (305) com `quiz` |
| Francês | `mh_fr_full` | `{curso, units[30], cards, folder, exams}` — `units[].blocos[]` (307) com `quiz` |

> **Armadilha:** o espanhol tem estado e funções diferentes (`S.cards[id].due`, `unlocked()`,
> `pageURL`, `diffWords`), enquanto inglês/francês usam `x.next`, `S.done`, `viewURL`,
> `diffHTML`. Todo patch precisa de adaptação manual no espanhol.

### 3.2 O hub

`MemoriaHack_Cursos.html` (~9,37 MB) tem uma barra fina com abas (`data-c="es|en|fr"`),
bandeiras SVG, e três blobs **Base64** (um por curso) injetados como `srcdoc` em iframes,
com **carregamento sob demanda**. Base64 foi escolhido porque escapar `<\/script` dentro de
`srcdoc` falhava. O hub lembra o último curso aberto e aceita `Ctrl+1/2/3`.

- Isolamento real: 139 IDs de elemento e 40 símbolos globais colidiriam se os apps fossem
  colados no mesmo documento.
- **Limitação medida:** iframes `srcdoc` têm origem `null` → **compartilham o mesmo
  `localStorage`** (teto ~4,9 MB). Um curso saturado consome ~148 KB → ~34 cursos no pior
  caso. Acima de 12 cursos, migrar para IndexedDB e abandonar Base64 (ver `docs/artefatos/21_Ate_quantos_cursos_cabem_no_hub_medicoes_de_23_09_2026.md`).

### 3.3 Dados e mídia

- `drive/sources.json` — 421 entradas `slug → {id, n, path, md5}` com os IDs dos arquivos no
  Drive (162 vídeos, 157 PDFs, 24 áudios, 78 cronogramas). O app **hidrata** slug→ID no load;
  o dataset não contém IDs. Trocar de pasta = `4_remapear_ids.py <ID> --apply` + `rebuild.sh`
  (casa por caminho completo, depois MD5, depois nome — testado 421/421).
- `course.json` — config do idioma (TTS, faixas CEFR, morfologia, critérios do provão).
- `migracao/` — scripts prontos (mas **não usados**) para Archive.org, caso a política mude.
- Pipeline por curso: `crawl.py` → `extrai.py` → `build_all.py` → `gen_quiz_v2.py` /
  `gen_exams_v2.py` → `tema_claro.py` → `build.sh` / `build_v2.sh` → HTML.

### 3.4 Mídia do Google Drive — a regra que mais importa

| Uso | URL correta |
|---|---|
| Vídeo / PDF / áudio de aula **dentro da página** | `https://drive.google.com/file/d/<ID>/preview` em **iframe** |
| Download explícito | `https://drive.usercontent.google.com/download?id=<ID>&export=download&confirm=t` |
| Cartas do SRS, listening, ditado | `speechSynthesis` (voz do navegador); gravação nativa a 1 clique (botão 🔊) |
| Abrir arquivo fora | `https://drive.google.com/file/d/<ID>/view` |

**Por quê:** o Drive devolve 403 quando a requisição vem com `Sec-Fetch-Dest: audio|video`
(bloqueio deliberado de hotlink). `uc?export=view`, `lh3.googleusercontent.com` e `fetch+blob`
também falham como mídia. O player oficial usa uma URL `videoplayback` assinada e temporária,
impossível de gerar num HTML estático. Além disso, arquivos grandes exigem `confirm=t`, senão
o Google devolve a página de aviso de antivírus (12 de 14 vídeos falhavam).

**Consequência honesta:** as 1.895 (EN) e 2.729 (FR) gravações de nativos **não tocam
embutidas nas cartas** — ficam a um clique. Para tê-las inline é preciso hospedar os MP3 fora
do Drive (Cloudflare R2, ~US$ 0,41/mês para o acervo todo).

**No iPhone/Safari:** o iframe depende de cookies de terceiros; pode pedir login dentro do
quadro. Solução: `↗ Abrir no Drive`, usar Chrome, ou desativar "Impedir rastreamento entre sites".

### 3.5 Interface

Tema claro (`--bg:#F4F7F6`, `--ac:#0B6BCB`, `--es:#5F4BD8`), contraste auditado no DOM real
(WCAG AA ≥ 4,5:1), cartões sem borda com sombra suave, pesos de fonte reduzidos, heatmap
substituído por barras de 14 dias em CSS puro. Nav: **Início · Estudar · Aulas · Cronograma ·
Progresso** + menu **Mais** (Unidades, Escutar, Exercícios, Lives, Explorar, Provões). No
mobile, tab bar inferior + bottom sheet.

---

## 4. Estado medido dos apps (auditoria de 27/10/2026)

Medido em 27/10/2026 com `ferramentas/auditar_apps.py`, diretamente dos `DATA` embutidos na
**produção 14/10** (que está em `app/`):

| | Espanhol | Inglês | Francês |
|---|---:|---:|---:|
| unidades | 24 | 25 | 30 |
| aulas/blocos | 159 | 305 | 307 |
| cartas no dataset | 3.540 | 2.057 | 3.888 |
| cartas úteis no baralho | **3.418** (122 `bad`) | 2.057 | 3.888 |
| cartas com MP3 | 0 (só 24 diálogos) | 1.895 (92%) | 2.729 (70%) |
| questões de aula | **1.046** em 141 aulas | 1.112 | 1.113 |
| provões | 4 (DELE A1–B2) | 3 (Cambridge A2/B1/B2) | 4 (DELF A1–B2) |
| lives | — | 111 ligações (125 entradas) | — |
| gabarito A/B/C/D | 258/266/253/269 | 277/280/275/280 | 278/275/277/283 |
| MD5 do HTML | `f4ffa484…` | `fef3527d…` | `d8176d37…` |

Sinais de que os patches finais estão presentes nos três: `checarFluxo`, `avisoDia`,
`modalRev`, bandeiras `.bnd`, "Praticar a fala", "Vencem em 24h", e questões
"Só **uma** destas frases está correta" (ES 129 · EN 45 · FR 107).

**O que mudou em 14/10 (saneamento do espanhol):** 381 cartas (10,8%) tinham a frase ES
quebrada pelo extrator original; 253 foram reparadas a partir dos HTMLs/PDFs originais, 122
foram marcadas `bad` e saíram do baralho/testes (90 são da aula 97 — Maestro U15, que só tem
vídeo), e 19 cabeçalhos em CAIXA ALTA ficaram `noquiz` (no SRS, fora dos testes). O baseline
26/09 (anexo, `contexto/MemoriaHack_Cursos1.html`) tinha 1.120 questões e espanhol com MD5
`23fd091c…`; Inglês e Francês são idênticos nas duas versões.

### Provas e provões

- **DELE (ES):** 4 competências, dois grupos de 50 pontos, APTO exige 60/100 **e** ≥30 em cada grupo; desbloqueio em cadeia (A2 só após A1).
- **Cambridge (EN):** A2 Key / B1 Preliminary / B2 First; 24 questões em 4 seções; listening com MP3; destrava com 60% da Mission.
- **DELF (FR):** 4 épreuves × 25 pontos, aprovação 50/100 com **mínimo eliminatório 5/25** em cada épreuve.
- Todos são múltipla escolha — **não são exames reais** (falta redação e prova oral).

---

## 5. Decisões de produto (não reabrir sem motivo)

1. **Um HTML por curso + hub**, não um app server-side. Portabilidade e offline valem mais.
2. **Drive privado da empresa** para toda a mídia. O usuário é o único aluno e está logado em
   todos os aparelhos. Archive.org/R2/YouTube foram avaliados e descartados (risco autoral,
   Content ID, custo desnecessário).
3. **Tema claro e nav simplificada** nos três cursos — paridade visual é requisito.
4. **Bandeiras em SVG**, não emoji (Windows não renderiza emoji de bandeira).
5. **Fala é opcional e desligada por padrão**; nunca pontuar pronúncia comparando envelope de
   energia (ritmo parecido 93% × diferente 85% — 8 pontos não sustentam uma nota).
6. **Pop-ups avisam, nunca bloqueiam** o avanço do usuário.
7. **Nunca inventar tradução**: frase sem par em português é ignorada pelo aplicador de FTD.
8. **Sempre anexar o HTML atualizado na conversa** quando ele mudar (instrução permanente do usuário).
9. **Sempre fazer backup antes de mexer no HTML** e atualizar `entregas.json`.

---

## 6. Limitações e pendências conhecidas

### Do app
- Nenhum curso treina **produção**: falta fala avaliada de verdade, escrita livre corrigida,
  compreensão de texto/áudio longos. Notas: ES 5,5 · EN 6,5 · FR 6,0 (teto ~7 hoje).
- Os provões são simulados de vocabulário/gramática; renomear ou completar (Bloco 5).
- Áudio nativo não toca inline (limitação do Drive) — Bloco 6 (IndexedDB, pacote de áudio ou R2).
- Francês: só 83 blocos com teoria (Inglês tem 204); FTD 600+/923 transcritos mas só ~120
  traduzidos; teoria está nos PDFs e precisa ser extraída — Bloco 7.
- Espanhol: sem áudio nativo por carta. **Pista nova (14/10):** as aulas Maestro da Onda 2 têm
  pastas `Frases/` e `Master_Deck/` com MP3 por frase/verbo (visto em U14 e U15) — medir
  cobertura antes de prometer.
- `localStorage` por origem: progresso não sincroniza entre aparelhos; no hub os iframes
  compartilham a mesma origem `null`.
- Vídeos do espanhol não puderam ser validados ponta a ponta no sandbox porque a pasta é
  privada (302 → login); no navegador logado do usuário funciona.

### Do acervo no Drive
- Francês **Unité 13** veio incompleta na fonte (13 HTMLs, 3 calendários, PDF/áudio da
  Conjugaison, 1x/3x da Conversation Native e ~40 MP3 do FTD #01). Unité 17 foi corrigida
  depois (+13 arquivos). `_FALTANDO.md` documenta.
- Espanhol: Unidades 20 e 21 têm `Gramatica2_Vazio`; Unidade 20 sem `Zips`; faltam os vídeos
  3 e 4 de "Bem vindos"; 4 aulas sem PDF de teoria.
- Inglês: 3 Reviews não têm MP3 de frases; 5 aulas sem vídeo; 28 lives só no registro da plataforma.

### Organizadores locais (Windows, fora do app)
Foram criados scripts para o usuário organizar as pastas baixadas em `D:\CURSOS\`:
- `ORGANIZAR_EN_MESTRE.py` **v2.3** — curso de inglês; dry-run 363 OK · 0 faltaram · rerun 0 movimentos. Usuário já executou.
- `ORGANIZAR_FR_MESTRE.py` **v1.1** — curso de francês; corrigido para caminhos longos do Windows (`\\?\`, limite 260 → ~32 mil). A v1.0 quebrou na Unité 11 com `WinError 3`; a v1.1 foi testada em réplica (1.180 itens, crash→retomada OK) mas **ainda depende de o usuário rodar**.
- Regra "zero duplicata": as lives **não** foram copiadas fisicamente para as units — os guias
  `LIVES_DA_UNIT*.md` apontam para o arquivo único em `#05 Live Classes/<mês>/`.
- Pendências locais: revisar/apagar `_ZZ_RESTOS_REDOWNLOAD` e `_ZZ_REVISAR_NAO_SAO_LIVES`.

Esses scripts foram entregues como **links de download dentro da conversa**, não inline —
por isso os artefatos correspondentes em `docs/artefatos/` são apenas marcadores. Para
recuperá-los, use os IDs do Drive em `docs/INVENTARIO_DRIVE.md` ou peça o reenvio.

---

## 7. Coisas que NÃO são deste projeto (evitar confusão)

A conversa `Contexto.html` mistura três trabalhos:

1. **Memoria Hack** (mensagens 0–109 e 116–129) — este repositório.
2. **Organizadores de pastas no Windows** (mensagens 110–115, 124–129) — scripts para o PC do usuário, descritos acima.
3. **"Cockpit de RCs"** (mensagens 130–149) — projeto **separado**, um painel em Google Apps
   Script + Google Sheets ("Cópia de banco de dados", aba `RCs`, 377 registros, 330 RCs
   distintas) para consulta de Requisições de Compra. Chegou à **v2.1.0** com tema claro,
   tema escuro, filtros compactos, detalhes ao clicar no card, links de RC/NF, paginação e
   CSV. Teve problemas de `Invalid or unexpected token` no `document.write` do Apps Script e
   lentidão de conexão (4,8 s no servidor × 5 min no navegador). Os arquivos `Code.gs`,
   `index.html`, `appsscript.json` viviam na pasta `Inicialização/` do workspace antigo.
   **Não faz parte do Memoria Hack** e não está neste repositório, exceto pelos artefatos
   `69_Code.gs`, `71_test-v2.cjs` e os guias `72`–`77` em `docs/artefatos/`.

---

## 8. Como continuar (resumo)

1. **Sincronização já feita neste save:** `app/` contém a produção 14/10 (MD5 do hub
   `8e547cddce73df56c23093a253e38dcc`, conferido com `entregas.json`). O baseline 26/09
   ficou em `contexto/MemoriaHack_Cursos1.html` para rollback.
2. **Bloco 0 — motor único**: extrair `engine.js` + `cursos.json`, um `build.sh`, testes
   compartilhados. Medir antes de mexer (as suítes estão verdes).
3. **Bloco 7 — completar dados**: terminar FTD francês, extrair teoria dos PDFs, medir MP3
   das aulas Maestro do espanhol.
4. **Blocos 2, 3, 5 — produção escrita, texto/áudio longos, provões completos**, apoiados no
   Bloco 1 (fala) já implementado.
5. **Blocos 6 e 8 — áudio no fluxo e ritmo/hábito**.

Detalhes, impactos e projeção de notas em `docs/ROADMAP.md`.

---

## Apêndice — o que foi lido para produzir este save

- `contexto/Contexto.html` **integral**: 150 mensagens (75 do usuário, 75 do agente),
  ~1,59 milhão de caracteres de texto. A versão limpa (narrativa sem logs de ferramenta)
  está em `docs/TRANSCRICAO.md`; o índice mensagem a mensagem em `docs/INDICE_TRANSCRICAO.txt`.
- **78 blocos de código/documento** anexados inline na conversa — 60 com conteúdo útil foram
  extraídos para `docs/artefatos/` (inclui `app.js` completo do inglês, geradores de quiz e
  provões, conversor de tema, módulos de voz/fluxo, suítes Puppeteer e relatórios).
- **Pasta indicada do Drive** (`1oo_-…`): os 34 itens da raiz e as 10 subpastas mapeadas;
  todos os arquivos de código/documento relevantes (`.md`, `.py`, `.js`, `.json`, `.sh`) em
  três páginas de listagem; leitura integral de `ROADMAP.md` (as duas versões),
  `DOSSIE_CURSO_ESPANHOL.md`, `COMO_FAZER.md`, `DIAGNOSTICO.md`, `LIMITES.md`,
  `entregas.json`, 5 `LEIA-ME.md` de backups, `_FALTANDO.md`, o PDF de UI/UX,
  `rebuild.sh`, `serve.py`, `package.json`, `dinamico_modulo.js`, `aplica_dinamico.py`,
  `fix_ordem_es.py`, `bandeiras.py` e a árvore de backups.
- **Segundo export do Drive** (`IDIOMAS/workspace-01a0efed-…`), descoberto durante a análise:
  32 itens na raiz, 12 pastas de backup, e a versão de produção 14/10 baixada e verificada.
- **Anexos HTML**: `Contexto.html` (idêntico em tamanho ao do Drive) e
  `MemoriaHack_Cursos1.html` (9.369.946 B). Os 3 cursos foram decodificados do hub,
  seus datasets parseados e auditados (cartas, questões, provões, gabarito, marcadores de
  patch), e o hub de produção foi comparado MD5 a MD5 com `entregas.json`.
- **Não lidos individualmente** (e por quê): os milhares de MP3/MP4/PDF/HTML de aula dos
  acervos originais. Eles são a **matéria-prima** já processada nos datasets; o agente
  anterior leu 268 PDFs + 312 HTMLs do espanhol, 251 HTMLs do inglês e 301–312 HTMLs do
  francês, além de transcrever áudios. O resultado disso está dentro dos `#DATA` dos apps.
  Os vídeos/áudios em si não são texto e não cabem num repositório Git (55 GB só no espanhol).
