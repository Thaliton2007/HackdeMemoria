Curso de Francês — build completo · 24/09/2026
Entregável:
/home/user/Frances_Curso_Completo.html
(2,23 MB)
Também incluído no hub:
MemoriaHack_Cursos.html
(3 cursos, 8,32 MB)
Conteúdo
unidades
30
(Unité 01 I/II, 02–24 + 5 Classes de révision)
Morceaux
2
blocos
307
frases FR→PT
3.766
com áudio nativo
2.607 (69%)
vídeos
191
PDFs
193
questões de aula
699
em 140 blocos
provões DELF
4
(A1, A2, B1, B2)
Provões no modelo DELF (fiel ao exame oficial)
4 épreuves × 25 pontos = 100 ·
seuil 50/100
Nota mínima 5/25 por épreuve — abaixo disso é eliminatório
, como no DELF real.
20 questões por provão, 5 por competência (cada uma vale 5 pontos):
Compréhension de l'oral — com MP3 real
Compréhension des écrits — FR→PT
Grammaire et conjugaison — lacuna
Vocabulaire et expressions — PT→FR
Faixas: A1 = Unités 01–06 · A2 = 07–12 · B1 = 13–18 · B2 = 19–24
Diferenças em relação ao inglês
Sem aba Lives
— o curso não tem lives. Seção removida do shell e do app.
Ritmos 7/9/12 meses
(o inglês usa 6/9/12)
Morceau
no lugar de Mission;
unidade
no lugar de unit
TTS em
fr-FR
Tipos de bloco próprios: Conversation Native, Grammaire en Pratique 1/2,
Conjugaison Rapide, Le Français Au Quotidien, Dis-moi, Minicours de Prononciation
Áudio: Conversation Native
Descoberta durante o build: a Conversation Native guarda o áudio numerado em
Audio_Dialogo/
, não em
Frases/
. O builder passou a aceitar as duas fontes
— isso levou a cobertura de áudio de 2.354 para
2.607
(+253 cartas).
Bug corrigido nos TRÊS cursos
.lesson.done .lhead .num
usava
color:#06281c
sobre
var(--ok)
— herança do
tema escuro. No tema claro isso dá
2,94:1
(reprova AA). Trocado por branco
(
5,38:1
). O mesmo valia para
#04241a
e
#3b0a0a
.
Corrigido em francês, inglês e espanhol; os três foram reconstruídos.
Verificação
Suíte do francês:
61/61
(rodada duas vezes)
Contraste AA:
10 telas
limpas
Hub com 3 cursos:
7/7
, datasets íntegros (3540 / 2057 / 3766)
Zero ORB, zero erro de JS
Pipeline (reaproveitável)
Bash
cd
/home/user/frances
bash
rebuild_all.sh
# build_all → gen_quiz → gen_exams → add_plano → build
Script
Função
crawl.py
varre a pasta do Drive (1.615 pastas)
extrai.py
teoria + pares FR/PT dos HTMLs (reaproveitado do inglês, sem alteração)
build_all.py
monta
dataset_full.json
gen_quiz.py
699 questões ancoradas no conteúdo real
gen_exams.py
4 provões DELF
add_plano.py
cronograma por unidade + PDFs de ritmo
build.sh
shell + dataset + js → HTML único
Pendência conhecida
Os
24 blocos de FTD
têm HTML vazio: as frases vivem só nos nomes dos MP3
(~960 arquivos), sem tradução PT. Ficam acessíveis como áudio no bloco, mas não
viram cartas. Explorar isso exigiria traduzir ou casar com frases de outras aulas.
Open