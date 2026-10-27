# Memoria Hack — roadmap até a fluência

> Base: `ROADMAP.md` do Drive (ID `1BRNyXq4lvjykJhhlaeoq1wAEkCTiw1J3`, estado 14/10/2026),
> acrescido do plano de execução montado na retomada de 27/10/2026.

**Notas atuais: Espanhol 5,5 · Inglês 6,5 · Francês 6,0.** Teto de hoje: ~7.
Nenhum curso treina **produção** (falar e escrever), e é isso que separa "entender muito" de
"ser fluente".

---

## 0. Estado em 14/10/2026 (sessão de retomada anterior)

- **Regra de entrega:** arquivo principal é `MemoriaHack_Cursos.html`. Toda alteração de HTML =
  cópia da versão anterior em `backup/<tema_data>/` (local e no Drive) + substituição do
  principal na raiz. Atualizar `entregas.json`.
- **Bloco 4 confirmado nos três cursos** (erro plantado ES 12,3% · EN 4,0% · FR 9,6%;
  gabarito A–D 24–26%).
- **Saneamento do espanhol:** 381 cartas (10,8%) com frase ES partida; 253 reparadas pela
  fonte, 122 marcadas `bad` (90 delas na aula 97 — Maestro U15, sem texto em nenhum lugar do
  Drive). Baralho útil 3.418 cartas; 1.046 questões em 141 aulas.
- **Bloco 7:** FTD francês passou de 550 para 600+/923 transcritos (retomável).
- **Pista nova p/ Blocos 6/7:** aulas Maestro da Onda 2 do espanhol têm `Frases/` e
  `Master_Deck/` com MP3 por frase/verbo (U14 e U15: 10 + 10 cada). Medir cobertura antes de
  prometer áudio por carta.
- Teste de fumaça: `node testes/regressao.js` (4 HTMLs, Chrome headless) — verde.
- Guarda do workspace: `python3 ferramentas/ws_guard.py` (comprime, nunca apaga, >100 MB).

---

## 1. Um curso novo herdaria as melhorias? Hoje, não

Medido no código:

| Comparação | Similaridade |
|---|---:|
| inglês × francês | **97%** |
| espanhol × inglês | **89%** |
| funções com o mesmo nome nos três | **106** |

São **três cópias separadas** do mesmo app. A agenda do SRS precisou de 3 aplicações (e
adaptação manual no espanhol). Um 4º curso = 4ª cópia; cada melhoria custaria 4 aplicações com
4 chances de divergir. **Por isso o Bloco 0 vem antes de tudo.**

---

## 2. Os blocos

### BLOCO 0 — Motor único *(infra, habilita o resto)*
- Extrair o núcleo comum (SRS, quiz, provões, player, navegação, dashboard) para **um** `engine.js`.
- Cada curso = **dados + configuração**: idioma, rótulos, níveis de exame, tipos de bloco.
- Um `build.sh` único; curso novo = criar dataset e registrar em `cursos.json`.
- **Resultado:** melhoria aplicada uma vez vale para todos. **Risco:** médio (mexe em tudo) —
  fazer enquanto as suítes estão verdes. **Ganho de nota:** 0, mas viabiliza todo o resto.

### BLOCO 1 — Fala *(impacto +1,5; parcialmente feito)*
- **Feito em 26/09:** gravação (`MediaRecorder`), reprodução nativo→você, comparação
  palavra a palavra quando `SpeechRecognition` existe, switch "Praticar a fala" opcional.
- Testado: `file://` é contexto seguro; microfone, gravação e `AudioContext` funcionam no PC.
  `SpeechRecognition` não pôde ser validado sem microfone real; exige internet e pode falhar em
  origem `null`.
- **Camada A (garantida, offline):** shadowing — você se avalia com os botões do SRS.
- **Camada B (quando houver suporte):** transcrição + diff colorido.
- **Não fazer:** nota de pronúncia por envelope de energia (93% × 85% — discrimina mal).
- Dica: rodar por `http://localhost` memoriza a permissão de microfone.

### BLOCO 2 — Produção escrita avaliada *(+0,5)*
- Aceitar variações válidas no modo digitação (sinônimos, ordem, contração).
- Escrita livre com correção por critérios: tempo verbal, concordância, vocabulário da unidade.

### BLOCO 3 — Compreensão de texto e áudio longos *(+0,5)*
- Diálogos completos com perguntas de interpretação (Conversation Native / Small Talk /
  Walk'n'Talk).
- Áudio longo com pergunta global ("por que a Claire ligou?"), não "qual frase você ouviu?".

### BLOCO 4 — Questões que testam compreensão *(+0,5; FEITO)*
- **"Erro plantado"**: quatro versões da mesma frase, só uma correta; a explicação nomeia o
  erro de cada alternativa.
- Lacuna com distratores do **mesmo contexto sintático**; cota por tipo (máx. 2 "Como se diz"
  e 2 "O que significa" por aula).
- Auditoria de viés: rodízio por tipo + zero sequências de 3 respostas iguais; gabarito
  validado contra a explicação (1113/1113 FR · 1112/1112 EN · 1440/1440 ES na época).

### BLOCO 5 — Provões que merecem o nome *(+0,5)*
- DELF e Cambridge reais têm produção escrita e oral. Com os Blocos 1 e 2 prontos: acrescentar
  *Production écrite* e *Production orale*, manter a regra eliminatória do DELF.
- Enquanto não houver produção, **renomear** para "Simulado de vocabulário e gramática" — mais
  honesto.

### BLOCO 6 — Áudio nativo dentro do fluxo *(+0,5 EN/FR)*
- O Drive bloqueia hotlink (403 com `Sec-Fetch-Dest: audio`). As 1.895 (EN) e 2.729 (FR)
  gravações abrem fora do estudo.
- Caminhos: 1) cache local em **IndexedDB** (~1 GB); 2) pacote `.zip`/`.bin` por unidade;
  3) **Cloudflare R2** (~US$ 0,41/mês) — resolve de vez, mas sai do Drive da empresa.

### BLOCO 7 — Completar o que está pela metade *(+0,5 FR)*
| Pendência | Estado |
|---|---|
| FTD francês — transcrição | 600+ de 923 |
| FTD francês — tradução | ~120 feitas |
| Teoria do francês | 83 blocos (EN tem 204) — extrair dos PDFs |
| Áudio nativo do espanhol | medir `Frases/`/`Master_Deck/` das aulas Maestro da Onda 2 |
| Unité 13 (FR) | lacuna na fonte, documentada em `_FALTANDO.md` |

### BLOCO 8 — Ritmo e hábito *(+0,5)*
- Meta diária configurável, sessão mista automática (revisão + aula nova), previsão de carga
  ("você termina a Unidade 12 em 3 semanas"), notificação opcional.

---

## 3. Ordem recomendada (original)

```
0  Motor único          infra, habilita o resto
1  Fala                 ← maior salto de nota
4  Questões melhores    barato e melhora o uso diário   ✅ feito
7  Completar dados      tira as pendências conhecidas
2  Produção escrita
3  Texto e áudio longos
5  Provões completos    depende de 1 e 2
6  Áudio no fluxo
8  Ritmo e hábito
```

## 4. Projeção honesta

| etapa | espanhol | inglês | francês |
|---|---:|---:|---:|
| hoje | 5,5 | 6,5 | 6,0 |
| + Bloco 1 (fala) | 7,0 | 8,0 | 7,5 |
| + Blocos 2, 3, 4 | 8,0 | 9,0 | 8,5 |
| + Blocos 5, 6, 7, 8 | 8,5 | 9,5 | 9,0 |

**Nem com tudo chega a 10:** fluência também exige conversa com gente real e exposição a
material não controlado. Um app leva a um B2 sólido e autônomo — o último passo é humano.
O espanhol fica atrás por falta de áudio nativo no acervo (a menos que a pista das aulas
Maestro se confirme).

---

## 5. Plano de execução para a retomada (27/10/2026)

### Etapa A — Sincronizar a base (parcialmente concluída em 27/10)
1. ✅ **Feito:** `app/` contém o hub de **14/10** (ID `12DQ4xsyfmMDop7ap5jSUQB4Zf30fMo8W`,
   MD5 `8e547cddce73df56c23093a253e38dcc`) e os 3 cursos extraídos dele, incluindo o
   espanhol saneado (`f4ffa484…`). O baseline 26/09 está em `contexto/`.
2. ✅ **Feito:** `python3 ferramentas/extrair_hub.py --verificar` (3/3 MD5 OK) e
   `python3 ferramentas/auditar_apps.py` (contagens em `docs/CONTEXTO_PROJETO.md` §4).
3. ⬜ **Falta:** rodar o teste de fumaça em navegador real nos 4 HTMLs antes de mexer
   (Puppeteer/Chrome headless: navegação, sessão SRS, quiz, provão, persistência após reload,
   zero erro de console, contraste AA). As suítes `t*.js` antigas estão em `docs/artefatos/`.

### Etapa B — Bloco 0 (motor único), em passos pequenos
1. **Medir** as divergências reais entre os três `app.js` (o espanhol é o outlier).
2. Criar `engine.js` com: agendador SM-2, renderizador de cartas, quiz, provão, resolvedor de
   mídia (`mediaURL`, `pageURL`, `pdfURLof`), navegação e dashboard.
3. `cursos.json` com labels, TTS, faixas CEFR, tipos de bloco, chave de `localStorage` e regra
   de desbloqueio de cada exame.
4. Normalizar os datasets: um adaptador por curso converte `lessons` (ES) e `units[].blocos`
   (EN/FR) para um formato único — **sem perder** os campos específicos (`wnt`, `diarioPdf`,
   `lives`, `deck`).
5. `build.sh` único gerando os 4 HTMLs + `node testes/regressao.js`.
6. Critério de aceite: os 3 cursos continuam com as mesmas contagens de cartas/questões/
   provões e passam nos testes; o progresso antigo (`memoriahack.v1`, `mh_en_full_v3`,
   `mh_fr_full`) continua legível (migrar com cuidado — o hub tem origem `null`).

### Etapa C — Bloco 7 + Bloco 2 (maior valor percebido)
- Terminar FTD francês (transcrição retomável + tradução em lotes, sem inventar tradução).
- Extrair teoria dos PDFs franceses para elevar 83 → ~200 blocos.
- Medir os MP3 das aulas Maestro do espanhol e, se houver cobertura, ligar áudio por carta.
- Implementar escrita livre com correção por critérios e o modo "Ouvir e responder".

### Etapa D — Blocos 3, 5, 6, 8
- Diálogos longos com interpretação;Production écrite/orale nos provões; IndexedDB para áudio;
  meta diária + sessão mista + notificações.

### Riscos a respeitar
- **Não quebrar o offline**: sem CDN, sem Chart.js, sem chamadas obrigatórias à rede.
- **Não perder progresso**: qualquer mudança de chave de `localStorage` exige migração.
- **Não duplicar mídia no Drive**: manter a regra "zero duplicata" das lives.
- **Contraste AA**: toda cor nova passa pela auditoria no DOM renderizado.
- **Backup antes de cada HTML novo** e atualização do `entregas.json`.
