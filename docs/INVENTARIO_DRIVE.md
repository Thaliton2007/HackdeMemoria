# Inventário do Google Drive — Memoria Hack

Levantado em 27/10/2026 via conector do Google Drive. Todos os IDs abaixo vieram de listagens
reais da API (nenhum foi inventado). Use-os para baixar/ler qualquer arquivo no próximo passo.

---

## 1. As pastas que importam

```
<raiz do Drive do usuário>                         (pai 1jeXe4tqZPNS7K59-ReGENNG8EBtKkK5X)
├── HTML cursos contexo ....................... 1oo_-EZkt5WtWRXd4-wE8DTPFzSZ8kIjj   ← pasta indicada
├── MemoriaHack_Cursos1.html .................. 1hUAxwAgnPVCW6yEV89NXBj8O0WcfUatv  (9.369.946 B, anexo)
└── IDIOMAS ................................... 1UnJP5RDUXH44BlNQFBCyC212v0PvHFQF
    ├── Espanhol .............................. 1qiWmaRdvLoKVl2o0Ff0N4XQdRDzkgzK9  (acervo original)
    ├── Ingles ................................ 1kHwY2ch-j-w1Rwi2QLhJOtF86CiCs6DN  (acervo original)
    ├── Frances ............................... 1KA4mMyEpO_ZTPk5J0lulnO9-IVYrNs7S  (acervo original)
    └── workspace-01a0efed-8375-736d-a8f1-c3a906d308b7
                      .......................... 1o2WUKeoaTuCqM1xHfIlPaFCFFNqPHjZp  ← PRODUÇÃO 14/10
```

A pasta de acervo do espanhol citada no dossiê é `1cB_2oLsAkhI8thbcNQYOxtVpEF40lEuy`
(privada da empresa). A listagem também mostra um `Espanhol` com ID
`1qiWmaRdvLoKVl2o0Ff0N4XQdRDzkgzK9` dentro de `IDIOMAS` — conferir qual é a cópia ativa.

> **Atenção:** a busca `trashed = false` varre **todo o Drive visível**, não só a pasta
> indicada. Há milhares de arquivos de aula (MP3/MP4/PDF/HTML dos três cursos), um perfil
> `.config/google-chrome-for-testing`, e até cadernos Jupyter de um curso de Python —
> irrelevantes para este projeto. Filtre sempre por `parents`.

---

## 2. Pasta indicada: `HTML cursos contexo` (`1oo_-EZkt5WtWRXd4-wE8DTPFzSZ8kIjj`)

**34 filhos imediatos** (10 pastas + 24 arquivos). É o export do workspace de **26/09/2026**,
reupado pelo usuário em 27/10 para servir de contexto.

### Subpastas

| Pasta | ID | Conteúdo |
|---|---|---|
| `Contexto_files` | `1wy4R8b1-YVILubeNpcmhlJrD9MzmjqVY` | CSS/JS/imagens salvos com `Contexto.html` |
| `hub` | `1e-AZp9kPPkNcw3KStsaCBV_0jCbupv7X` | `build_hub.py` (9.161 B), versões do hub |
| `migracao` | `159QW6GD8Y5-AbvsmCfNb92fkWWWTaVt5` | `COMO_FAZER.md`, `plano_upload.json` (176.889 B), scripts 1–4 do Archive.org |
| `ingles` | `11oyFtJjXsiHFGXGt4DfgEBCQmlNietpP` | pipeline completo: `crawl.py`, `extrai.py`, `build_all.py`, `gen_quiz.py`, `gen_exams.py`, `dataset_full.json` (1.633.623 B), `arvore_raw.json`, `app/`, `v2/`, `dark/`, `txt/`, `lives_md/`, `html_aulas/` |
| `uploads` | `1_LXm742Yl7uKu8wPGmMG2bdo0J8BzP_W` | PDF "Instruções de Refatoração de UI_UX" (103.515 B), 2 capturas PNG |
| `frances` | `1wXPKfcCgd9avb47Zd0coqQUC94tgM9a9` | pipeline + `ftd_transcricao.json`, `ftd_traducao.json`, `ftd_todos.json`, `DIAGNOSTICO.md`, `app/`, `html_aulas/`, `ftd_audio/` |
| `drive` | `1YGww2H5atfAusxsKvAKqe_UwDlqVZl2o` | `sources.json` (123.585 B), `course.json`, `dataset_full.json` (2.337.122 B), `unit_map.json`, `transcripts.json`, geradores ES |
| `.config` | `1wMPcKgUQ3ShBI-30V_5PRGYtFwvYE2kH` | perfil do Chrome for Testing (ignorar) |
| `app` | `1gaOjzrPNMMXNzbKdF14F_KxhvOIMxB43` | `shell.html` (64.228 B) + `app.js` (100.715 B) do espanhol |
| `backup` | `1qqLJSF8dA4LH-jhPnGHIse_Z5-xXTh9c` | 10 backups datados (ver §4) |

### Arquivos na raiz (IDs)

| Arquivo | ID | Bytes |
|---|---|---:|
| `Contexto.html` | `1adI5DdedZQkeNkcHiewi0XG4kb7HffGB` | 7.516.159 |
| `MemoriaHack_Cursos.html` | `17Nu8U1HnQ_Got3Ib0gZjZ6p7CN9tGGf4` | 9.369.946 |
| `MemoriaHack.html` | `1B2XDThcQ-iTU_V3kWY0TvVLOfwadKe7r` | 2.625.625 |
| `MemoriaHack_Espanhol_Claro_v2.html` | `1sQ7TEWnH9ONH9Q0Hk9zdvSD86537HCH1` | 2.625.625 |
| `Ingles_Curso_Completo_Claro_v2.html` | `1TXpKwc-bbEUFCt2M7fMfoW95oN4Je3QO` | 1.780.862 |
| `Frances_Curso_Completo.html` | `1Iyjp76nfuyqAHKVT5L8fvb3gI_dj7orq` | 2.615.651 |
| `Ingles_Units_x_Lives.html` | `1UIU2CaIj3X6TkSa15cy71HxFJLY_5LQU` | 41.819 |
| `ROADMAP.md` | `1jh0j0gPsZdgfFEpMwlr0JmWROWtWPxgr` | 9.064 (versão antiga) |
| `DOSSIE_CURSO_ESPANHOL.md` | `1OMVyPWIHn8j6L7zjhsKFw5TX_jQwwdlX` | 21.968 |
| `voz_modulo.js` | `1XUz-8XnsTYchRos79MrLMl7KWQP5edIj` | 5.235 |
| `dinamico_modulo.js` | `1CwJfUIeeUdWlMCI-OAbGYWU4qF0oW5bO` | 3.392 |
| `aplica_voz.py` | `1GFgvK3liqE03D_FoPGjH_7E1DjoifKT5` | 6.523 |
| `aplica_dinamico.py` | `1aSs6DrnWLWtp3Pe2VsKwGGx_2cFrsCiy` | 1.602 |
| `bandeiras.py` | `1e8WuwxrtkNfJPdI7DnDtvEi0893xwXE3` | 3.506 |
| `bloco4.py` | `14mZt-8KftXzQutrVxWoRdPT-1XZsFBIP` | 10.617 |
| `gen_quiz_v2.py` | `1SrGAhTDNK_G8t4rSbJsW9v4JfGY44xEY` | 11.223 |
| `gen_quiz_es.py` | `1pN5WHDjghHJIy4No8YIUoxprPaHQZ5QW` | 8.091 |
| `gen_exams_v2.py` | `11p71H_5wUUwuhrIM7aQRBy52v-wa4Jrs` | 10.265 |
| `fix_ordem_es.py` | `1mBqyaY70P4_nlWNfP43gyglvrmrrN9VC` | 2.336 |
| `serve.py` | `1q-WsvUlGbluQBvgh_C9wZzCnptBwC6aH` | 682 |
| `rebuild.sh` | `1WhIYqC_e70_OOhvX5mzhHUoOtGQS2WYR` | 733 |
| `package.json` / `package-lock.json` | `1JmpZCc86nrSIL_6yr-Wixr2leTD_XhtC` / `1heIlQHoxGjNDOEGRZ7w7OieRqtWLhVxi` | 56 / 40.868 |
| `.sudo_as_admin_successful` | `16lN_Ju7jI2BZ-kPsGVYmvFmTBbk3nivw` | 0 |

---

## 3. Produção: `IDIOMAS/workspace-01a0efed-...` (`1o2WUKeoaTuCqM1xHfIlPaFCFFNqPHjZp`)

Export de 01/10/2026, **atualizado em 14/10/2026**. 32 filhos na raiz. É a versão mais
recente do produto — use-a como base, não a pasta indicada.

| Arquivo | ID | Bytes | Modificado |
|---|---|---:|---|
| **`MemoriaHack_Cursos.html`** | `12DQ4xsyfmMDop7ap5jSUQB4Zf30fMo8W` | 9.339.266 | 14/10 |
| `MemoriaHack_Espanhol_Claro_v2.html` | `1pOkayfcNKyEcFT6H_t-ccVTmawFxI2OG` | 2.602.617 | 14/10 |
| `MemoriaHack.html` | `1vyvW7d-2r8G5f94LsyhPSF7FudjC2zo-` | 2.602.617 | 14/10 |
| `Ingles_Curso_Completo_Claro_v2.html` | `1_zDvgjK-_-q7GpisYPZMlPwKcrio2MJo` | 1.780.862 | 30/09 |
| `Frances_Curso_Completo.html` | `1Sw7xxjcTtO_Eq6GZmxjcMSlb9BiTR82T` | 2.615.651 | 30/09 |
| `Ingles_Units_x_Lives.html` | `1UTJShMz8cpx5tKNYKS28P327aneu3VWn` | 41.819 | — |
| `ROADMAP.md` | `1BRNyXq4lvjykJhhlaeoq1wAEkCTiw1J3` | 10.891 | 14/10 |
| `DOSSIE_CURSO_ESPANHOL.md` | `1Z48M4jcO02khx6xAmRE4e5VQ_8_99v6P` | 21.968 | — |
| `app/`, `drive/`, `ingles/`, `frances/`, `hub/`, `migracao/`, `backup/`, `uploads/`, `.config/` | — | — | — |

Subpastas úteis dessa árvore: `drive` = `1AVmhqGKsadnvZdxNUdAa84BEFyrbyoeQ`
(contém `entregas.json`), `ingles` = `1jbmph7oFsGt3NM7xvg6E3BbKLtJDlGKc`,
`frances` = `1wlWAqlME78g6t5uMb9KfcEeyWjkezCXF`, `app` = `1iFTmyrcc8uZfJNaDz5HBTpbcHq9uNbHU`,
`backup` = `1rOZEDwb4NDEcCLo7EoS9Yw0pewFSVwcS`.

### `entregas.json` (ID `1tDazk1cBjKJu5mua9KTVHnue9lUlUKYw`)

Registro oficial dos entregáveis, atualizado em 14/10/2026:

```json
{
  "principal": {
    "nome": "MemoriaHack_Cursos.html",
    "id": "12DQ4xsyfmMDop7ap5jSUQB4Zf30fMo8W",
    "md5": "8e547cddce73df56c23093a253e38dcc",
    "bytes": 9339266,
    "contem": {
      "espanhol": "f4ffa48483401cd91d1acf4624fda7ad",
      "ingles":   "fef3527de7832f24b47c994a38960192",
      "frances":  "d8176d37b9cd09eb7681126656b81875"
    }
  },
  "cursos_avulsos": {
    "espanhol": { "id": "1pOkayfcNKyEcFT6H_t-ccVTmawFxI2OG", "md5": "f4ffa48483401cd91d1acf4624fda7ad" },
    "ingles":   { "id": "1_zDvgjK-_-q7GpisYPZMlPwKcrio2MJo", "md5": "fef3527de7832f24b47c994a38960192" },
    "frances":  { "id": "1Sw7xxjcTtO_Eq6GZmxjcMSlb9BiTR82T", "md5": "d8176d37b9cd09eb7681126656b81875" }
  }
}
```

**Limitação registrada no próprio arquivo:** o conector não reescreve o conteúdo de arquivos
grandes no mesmo ID; por isso o ID do principal muda a cada entrega. Para link fixo: no Drive,
*Gerenciar versões → Enviar nova versão* (manual).

### Comparação com o hub deste repositório

| Curso | Hub anexado (26/09) | Produção (14/10) |
|---|---|---|
| Espanhol | `23fd091c93b4f41075d752e95e11892a` (2.625.625 B) | `f4ffa48483401cd91d1acf4624fda7ad` (2.602.617 B) — saneado |
| Inglês | `fef3527de7832f24b47c994a38960192` (1.780.862 B) | **idêntico** |
| Francês | `d8176d37b9cd09eb7681126656b81875` (2.615.651 B) | **idêntico** |

Ou seja: **só o espanhol mudou**. Este repositório já foi atualizado: o hub 14/10 foi baixado
pelo conector (com uma pequena injeção do Cloudflare no download, removida — o MD5 final
`8e547cddce73df56c23093a253e38dcc` confere com `entregas.json`), e os 3 HTMLs avulsos foram
reextraídos dele. O baseline 26/09 ficou preservado em `contexto/MemoriaHack_Cursos1.html`.

---

## 4. Backups e documentos de apoio

Pasta `backup/` (10 pastas datadas): `espanhol_v1_2026-09-18`, `espanhol_2026-09-23`,
`ingles_2026-09-23`, `frances_2026-09-24`, `hub_2026-09-23`, `srs_agenda_2026-09-25`,
`quiz_v2_2026-09-25`, `voz_2026-09-26`, `ordem_2026-09-26`, `bloco4_2026-09-26`,
`dinamico_2026-09-26`. Em 14/10 foi criado `espanhol_saneamento_2026-10-14`
(ID `1Q2yIeAWNcda2buRFctMUD91OK35oJgZN`) com `LEIA-ME.md`, `cartas_reparadas.json`
(62.186 B), `cartas_saneadas.json` (31.743 B), `dataset_full_ANTES.json` e os três HTMLs
anteriores ao saneamento.

Documentos lidos na íntegra para este save:

| Documento | ID | O que contém |
|---|---|---|
| `ROADMAP.md` (14/10) | `1BRNyXq4lvjykJhhlaeoq1wAEkCTiw1J3` | Blocos 0–8, notas, projeção |
| `DOSSIE_CURSO_ESPANHOL.md` | `1OMVyPWIHn8j6L7zjhsKFw5TX_jQwwdlX` | acervo, método, grade curricular 24 unidades |
| `COMO_FAZER.md` | `1eTj1rvW9MOTC_LiL9cN6D2qJ6pS__hec` | remapeamento de IDs, OAuth, comportamento com pasta privada |
| `DIAGNOSTICO.md` (francês) | `114i4uBV6yv9qAcUa4hyqCo9dYIhZQ2Sy` | 1.615 pastas / 7.742 arquivos, extração testada |
| `LIMITES.md` | `1Wy1u-wNZWmXyeyeQl1Y-SIaAUYd96fCC` | teste de escala do hub (2→100 cursos) |
| `LEIA-ME.md` (inglês) | `1IgxeocY-idojADmwyQVqfmV3BMQF3a9B` | histórico v1→v5, correção de mídia |
| `LEIA-ME.md` (saneamento) | `1GL_p_ok4WF50tOQ91Vb1EFDLqyxIX2k1` | 381 cartas defeituosas, 253 reparadas, rollback |
| `LEIA-ME.md` (Bloco 4) | `1VO_okV0S3ImvyFbjQnmPiwNRJZC1mtok` | erro plantado, distrator sintático, integridade |
| `LEIA-ME.md` (dinâmico) | `14Cq2myxFzPYp9qDE7a2Lf1WDmf3kwL6y` | bandeiras SVG, pop-up do dia, convite ao provão |
| `_FALTANDO.md` | `1VoHPDgHaGjGjxgK29055F45WBRjqUY99` | peças ausentes da Unité 13 |
| PDF UI/UX | `1pfXHsZA3ohHMwQgrQbVpr-V-LXpMDjts` | paleta clara, cartões, nav, dashboard |

---

## 5. Acervos originais (fontes dos datasets)

| Curso | Pasta | Volume mapeado |
|---|---|---|
| Espanhol | `1cB_2oLsAkhI8thbcNQYOxtVpEF40lEuy` (privada) | 4.845 itens · ~55,4 GB · 213 MP4 · 2.711 MP3 · 268 PDF · 312 HTML · 175 ZIP |
| Inglês | `1kHwY2ch-j-w1Rwi2QLhJOtF86CiCs6DN` | 1.293 pastas · 5.133 arquivos · 3.793 MP3 · 785 HTML · 349 MP4 · 138 PDF · 58 MD |
| Francês | `1KA4mMyEpO_ZTPk5J0lulnO9-IVYrNs7S` | 1.615 pastas · 7.742 arquivos (crawl 24/09) · 4.311 arquivos no snapshot 2º check · 6.392 MP3 · 553 HTML · 417 PDF · 348 MP4 |

Estruturas: ES = 2 Ondas → 24 unidades + 5 repasos; EN = 3 Missions → 25 units + 3 Reviews;
FR = 2 Morceaux → Unités 01–24 + 5 révisions (30 blocos de unidade no app).

**Vínculo FTD ↔ Unité (francês):** os HTMLs de FTD guardam `unitName=Unité NN` na URL do botão
"Add deck" — verificado 24/24. Os FTDs #02–#12 estão fisicamente dentro das pastas U14–U24;
os #13–#24 em `#04 Extras`. Isso motivou o organizador `ORGANIZAR_FR_MESTRE.py`.
