Paridade com o espanhol + cartas do FTD · 25/09/2026
1. Testes e provões equiparados ao espanhol
Diagnóstico antes: o espanhol tinha
9,4 questões por aula
; inglês e francês,
5,0
.
E os provões do espanhol traziam seções nomeadas com instrução, enquanto os outros
dois eram uma lista plana.
Questões de aula
antes
depois
inglês
694 (5,0/aula)
1.112 (7,9/aula)
francês
699 (5,0/aula)
1.113 (7,9/aula)
6 tipos de enunciado (o espanhol tem 5):
Como se diz em X
·
O que significa
·
Complete a frase
No diálogo, o que vem logo depois
(novo — espelha o espanhol)
Ouça e escolha
(novo — aproveita o áudio nativo, que o espanhol não tinha)
Qual destas afirmações a aula apresenta
Script:
gen_quiz_v2.py <dataset> <idioma>
Provões
Agora no formato rico do espanhol:
secs[]
com nome e instrução por competência,
mais
nome
,
desc
,
foco
,
prox
,
total
,
seuil
.
antes
depois
inglês
3 × 25, lista plana
3 × 24 em 4 competências
(A2 Key, B1 Preliminary, B2 First)
francês
4 × 20, lista plana
4 × 24 em 4 épreuves
(A1 Découverte → B2 Avancé)
O francês aplica a
regra eliminatória do DELF
: cada épreuve vale 25 pontos,
aprovação com 50/100
e mínimo 5/25 por épreuve
. A tela de resultado mostra a
nota de cada uma em /25 e marca a que eliminou.
Script:
gen_exams_v2.py <dataset> <curso>
2. Cartas do FTD (francês) — transcrição de áudio
O usuário informou que
encurtou os nomes dos arquivos
para conseguir subir no
Drive. Confirmado: 87% dos 923 MP3 do FTD estavam cortados em 26 caracteres.
Solução em três etapas:
Transcrição
com
faster-whisper
(modelo
small
, int8, CPU) —
transcreve.py
Merge
entre o nome do arquivo e a transcrição:
o nome é a autoridade do autor (número, pessoa verbal, grafia)
o áudio fornece o final que faltava e os diacríticos
onde divergem, o nome ganha no trecho que ele cobre
Tradução manual
—
ftd_traducao.json
, no formato
{fr_transcrito: {"pt": ..., "fr": (opcional) francês corrigido}}
O merge corrigiu erros reais do whisper:
"On ne comprenez" →
"On ne comprenait"
"Il souriait" →
"Ils souriaient"
Prefixo preservado em
98%
das transcrições.
Estado
MP3 do FTD
923
transcritos
em andamento (
transcreve.py
roda ~3,8 s por áudio)
traduzidos
120
cartas adicionadas
122
total de cartas do francês
3.888
(era 3.766) ·
2.729 com áudio
Frases sem tradução são ignoradas
— o aplicador nunca inventa conteúdo.
Para continuar: transcrever o restante, acrescentar pares a
ftd_traducao.json
e rodar
bash rebuild_all.sh
.
3. Bugs de contraste corrigidos (nos três cursos)
Regra
Problema
Correção
.lesson.done .num
,
.qzo .right
,
.pday.done
#06281c
sobre
--ok
=
2,94:1
#fff
= 5,38:1
.xcard.pass .lv
#04241a
#fff
.qzo .wrong .l
#3b0a0a
#fff
.lvbar .vv
usava
--okf
/
--warnf
(cor de preenchimento) como texto =
2,21:1
cor de texto separada (
--ok
/
--warn
)
pill "eliminatória"
--bad
sobre
--bads
= 4,75:1
#A32B1F
= 6,28:1
Todos herdados do tema escuro, onde essas combinações faziam sentido.
Verificação
Francês:
30/30
· Inglês:
28/28
Contraste AA limpo nas telas testadas
Hub com 3 cursos reconstruído (8,84 MB)
Ordem do pipeline (francês)
Bash
cd
/home/user/frances
&&
bash
rebuild_all.sh
# build_all → aplica_ftd → gen_quiz_v2 → gen_exams_v2 → add_plano → build
aplica_ftd
vem logo após
build_all
porque
build_all
reescreve os blocos.
Open