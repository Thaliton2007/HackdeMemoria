# Artefatos recuperados da conversa

`docs/artefatos/` contém os blocos de código e documentos que o agente anterior anexou
**inline** na conversa `contexto/Contexto.html`. Foram extraídos automaticamente (78 blocos
encontrados; ~60 com conteúdo útil) e preservam números, decisões e suítes de teste que não
cabem numa transcrição narrativa. O índice completo está em `docs/artefatos/_INDICE.md`.

## O que tem de mais útil

| Prefixo | Arquivo | Para que serve |
|---|---|---|
| `00` | Dossiê do Curso de Espanhol | grade curricular, método, lacunas do acervo |
| `07` | `app.js` do inglês (54 KB) | base do motor a extrair no Bloco 0 |
| `09` | `tema_claro.py` | conversor CSS escuro → claro com contraste AA |
| `19` | `build_hub.py` | monta o hub com os cursos em Base64 |
| `21` | Limites do hub | medições 2→100 cursos, teto do `localStorage` |
| `22`, `26` | Diagnóstico e build do francês | números do acervo e da extração |
| `27`, `28` | `gen_quiz_v2.py`, `gen_exams_v2.py` | geradores no padrão rico do espanhol |
| `31` | `ftd_traducao.json` | pares FR→PT das cartas do FTD |
| `33` | `patch_srs.py` | agenda do SRS visível |
| `36` | Roadmap (versão 25/09) | primeira versão dos Blocos 0–8 |
| `37`, `38` | `aplica_voz.py`, `voz_modulo.js` | Bloco 1 — fala |
| `41`, `42`, `43` | `bandeiras.py`, `aplica_dinamico.py`, `dinamico_modulo.js` | bandeiras SVG + pop-ups |
| `47`, `49` | `bloco4.py`, `gen_quiz_es.py` | Bloco 4 — erro plantado e paridade do espanhol |
| `50`, `56`, `57`, `58`, `62`, `65` | scanners/fixtures EN/FR | réplicas fiéis para testar organizadores |
| `59`, `60`, `68` | mapeamentos do francês | temas das unidades, vínculo FTD↔Unité, espelho no Drive |
| `03`–`20`, `25`, `29`, `34`, `39`, `44` | `t*.js` | suítes Puppeteer (navegação, mídia, contraste, voz, SRS) |
| `69`–`77` | Cockpit RCs (Apps Script) | **projeto separado**, ver §7 do `CONTEXTO_PROJETO.md` |

## Ressalvas

1. **Versões:** estes são os artefatos da conversa (até 26/09). Os arquivos **finais** na raiz
   do Drive são um pouco diferentes (ex.: `bloco4.py` 10.617 B vs 6.397 B aqui,
   `gen_quiz_v2.py` 11.223 B vs 7.030 B). Use `docs/INVENTARIO_DRIVE.md` para buscar os IDs
   finais quando for executar algo.
2. **Stubs:** alguns artefatos eram apenas links de download (`ORGANIZAR_EN_MESTRE.py`,
   `ORGANIZAR_FR_MESTRE.py`, `MAPEAMENTO_CURSO_*.md`, `index.html` do Cockpit). Foram
   descartados na extração porque o código não estava inline. O `contexto/Contexto.html`
   original guarda esses links.
3. **Cabeçalho:** nos `.md` extraídos, as duas primeiras linhas repetidas (título + tipo)
   foram removidas; o restante do texto está como aparecia na conversa.
4. **Não são executáveis direto:** os scripts assumem o layout antigo do workspace
   (`/home/user/...`, `drive/dataset_full.json`, `app/shell.html`). Servem como referência e
   ponto de partida para o `engine.js` do Bloco 0.
