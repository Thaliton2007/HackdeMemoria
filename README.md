# Memoria Hack — contexto e código para os próximos passos

Este repositório é o **ponto de retomada** do projeto Memoria Hack: uma plataforma de estudos
de idiomas em **HTML único, offline**, construída a partir de três cursos da Fluency Academy
(Espanhol, Inglês, Francês).

> Ramo: `arena/6424d026-hackdememoria`. Estado do save: **27/10/2026**.
> O material foi consolidado a partir da conversa com o agente anterior (`Contexto.html`),
> dos anexos HTML e de toda a pasta do Google Drive indicada pelo usuário.

## Onde está cada coisa

| Caminho | O que é |
|---|---|
| `app/MemoriaHack_Cursos.html` | **Entregável principal** — hub com os 3 cursos em abas (abrir com duplo clique) |
| `app/MemoriaHack_Espanhol_Claro_v2.html` | Espanhol avulso (extraído do hub) |
| `app/Ingles_Curso_Completo_Claro_v2.html` | Inglês avulso (extraído do hub) |
| `app/Frances_Curso_Completo.html` | Francês avulso (extraído do hub) |
| `index.html` | Redireciona para o hub (para publicar com GitHub Pages) |
| `contexto/Contexto.html` | Conversa original completa com o agente anterior (150 mensagens, 7,5 MB) |
| `contexto/MemoriaHack_Cursos1.html` | Anexo do usuário — hub **baseline 26/09/2026** (para comparação/rollback) |
| `docs/CONTEXTO_PROJETO.md` | **Leia primeiro** — síntese de tudo: história, arquitetura, decisões, limitações |
| `docs/ROADMAP.md` | Roadmap oficial (estado 14/10/2026) + plano de execução recomendado |
| `docs/INVENTARIO_DRIVE.md` | Mapa de pastas, IDs, versões e MD5 dos entregáveis no Drive |
| `docs/TRANSCRICAO.md` | Transcrição limpa da conversa (narrativa sem logs de ferramenta) |
| `docs/INDICE_TRANSCRICAO.txt` | Índice das 150 mensagens |
| `docs/artefatos/` | ~60 scripts/documentos extraídos da conversa (geradores, testes, backups, relatórios) |
| `ferramentas/extrair_hub.py` | Extrai os 3 cursos do hub, ou reconstrói o hub a partir deles |
| `ferramentas/auditar_apps.py` | Mede o estado real dos datasets (cartas, questões, provões, gabarito) |

## APK para Android (projeto iniciado em 27/10/2026)

O curso também vira um **APK que você baixa e instala no celular**, com os 3 cursos
**dentro do arquivo** (estuda sem internet). Instruções em linguagem simples:
**[`COMO_INSTALAR_APK.md`](COMO_INSTALAR_APK.md)**. Download direto:
`https://github.com/Thaliton2007/HackdeMemoria/releases/download/apk-v1/MemoriaHack.apk`.

| Caminho | O que é |
|---|---|
| `android/` | Projeto Android (Java + WebView), origem do APK |
| `android/bridge/mh_android.js` | Ponte JS: voz nativa, botão Voltar, arquivos e links do Drive |
| `ferramentas/gerar_assets_android.py` | Injeta a ponte no HTML e gera o `assets/` do APK (não mexe em `app/`) |
| `.github/workflows/build-apk.yml` | Compila e publica o APK automaticamente no GitHub |

```bash
python3 ferramentas/gerar_assets_android.py          # gera o HTML instrumentado
python3 ferramentas/gerar_assets_android.py --verificar
```

O HTML de produção em `app/` continua intacto (MD5 `8e547cdd…`). Na versão APK 1.3,
vídeos/PDFs com link de visualização abrem no player **dentro do app**; os privados podem
usar uma Chrome Custom Tab integrada, sem expor as permissões do Drive.

## Como usar o app

1. Abra `app/MemoriaHack_Cursos.html` no navegador (funciona offline, sem servidor).
2. Troque de curso pelas abas no topo ou com `Ctrl+1` / `Ctrl+2` / `Ctrl+3`.
3. Vídeos, PDFs e áudios das aulas vêm do **Google Drive** (é preciso estar logado na conta
   com acesso). Cartas, teoria, testes e progresso funcionam sem internet.
4. O progresso fica no `localStorage` do navegador — exporte/importe para trocar de aparelho.

## Como auditar / reconstruir

```bash
python3 ferramentas/auditar_apps.py            # estado atual dos 3 datasets
python3 ferramentas/extrair_hub.py --verificar # confere os 3 MD5 dentro do hub
python3 ferramentas/extrair_hub.py --extrair   # reescreve os 3 HTMLs avulsos
python3 ferramentas/extrair_hub.py --reconstruir  # remonta o hub com os 3 HTMLs avulsos
```

## Qual versão está aqui

Existem **dois exports do workspace no Drive**. Este repositório contém os dois, mas
**`app/` é a produção de 14/10/2026**:

- `HTML cursos contexo` (`1oo_-EZkt5WtWRXd4-wE8DTPFzSZ8kIjj`) — pasta indicada pelo usuário,
  export de **26/09/2026**. É a origem dos anexos → `contexto/`.
- `IDIOMAS/workspace-01a0efed-...` (`1o2WUKeoaTuCqM1xHfIlPaFCFFNqPHjZp`) — export de
  01/10/2026 atualizado em **14/10/2026**. De lá veio o hub de produção
  (`12DQ4xsyfmMDop7ap5jSUQB4Zf30fMo8W`, 9.339.266 bytes, MD5
  `8e547cddce73df56c23093a253e38dcc`), com o espanhol saneado.

`python3 ferramentas/extrair_hub.py --verificar` confirma os três MD5 dos cursos embutidos
contra o `entregas.json` do Drive. Inglês e Francês são idênticos nas duas versões; só o
espanhol mudou (3.418 cartas úteis, 1.046 questões). Detalhes em `docs/INVENTARIO_DRIVE.md`.

## Próximo passo recomendado

**Bloco 0 — motor único.** Hoje os três cursos são três cópias do mesmo app (97% de código
idêntico entre inglês e francês). Extrair `engine.js` + `cursos.json` é o que permite que a
próxima melhoria (fala, produção escrita, provões completos) seja aplicada uma vez e valha
para todos. Detalhes em `docs/ROADMAP.md`.
