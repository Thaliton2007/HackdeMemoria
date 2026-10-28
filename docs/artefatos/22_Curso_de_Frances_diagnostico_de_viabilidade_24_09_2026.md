Curso de Francês — diagnóstico de viabilidade · 24/09/2026
Pasta:
1KA4mMyEpO_ZTPk5J0lulnO9-IVYrNs7S
("Frances") —
pública
, crawl completo OK.
Veredito: SIM, dá para fazer igual — é o acervo mais rico dos três
Estrutura (1.615 pastas · 7.742 arquivos)
text
#01 Bienvenue
#02 Morceau 01   → Unité 01 Partie I/II, Unités 02–12 + Classes de révision #01 e #02
#03 Morceau 02   → Unités 13–24 + Classes de révision #03, #04 e #05
#04 Extras       → FTD #13 a #24
25 unidades + 5 classes de revisão = 30
, em 2 Morceaux (equivalente às Missions).
Inventário
MP3
6.392 (+30 .wav)
HTML
553
PDF
417
MP4
348
Blocos por unidade (padrão fixo, ~12 por unidade)
Calendrier_du_parcours
·
Cours_d_ouverture
·
Conversation_Native
·
Grammaire_GP1
·
Grammaire_GP2
·
FAQ_Francais_Au_Quotidien
·
Conjugaison_Rapide 1A/1B
·
Dis_moi
·
FTD
·
On_Conclut
·
Journal_de_bord
(+
Minicours_Prononciation
na Unité 01)
Subpastas de mídia:
Audio
,
Audio_Dialogo
,
Frases
,
Master_Deck
,
HTML
,
PDF
,
Video
.
Extração testada (não é estimativa)
301 HTMLs de aula baixados
3.766 pares FR→PT
extraídos de 154 arquivos
2.354 com MP3 casado (63%)
O extrator do inglês (
ingles/extrai.py
) funcionou
sem nenhuma alteração
Os 147 HTMLs sem pares são os blocos que não têm frases mesmo
(Cours d'ouverture, On Conclut, Calendrier, Journal de bord) — mesmo padrão do inglês.
O HTML do FTD é vazio: as frases dele vivem só nos nomes dos 40 MP3 por unidade
(fonte extra ainda não explorada, ~960 frases).
Mídia — testada e acessível
/preview
do vídeo
HTTP 200 ·
video/mp4
PDF
HTTP 200
MP3
HTTP 200 ·
audio/mpeg
Pasta
pública
, como a do inglês (a do espanhol é privada).
Vale a mesma regra já descoberta: mídia só toca via iframe
/preview
;
download precisa de
confirm=t
.
Comparativo dos três cursos
Espanhol
Inglês
Francês
unidades
24
25
25 + 5 rev
frases
3.540
2.057
3.766
frases com áudio nativo
0
1.895
2.354
vídeos
154
349
348
PDFs
150
138
417
lives
não
111
não
Sobre a pergunta do áudio + PDF
No francês a intuição
se confirma
: dos 165 blocos com
Audio/
,
165 têm
PDF/
também — 100%
. Cada aula tem seu PDF de leitura próprio,
igual ao espanhol e ao contrário do inglês (onde os PDFs são só cronograma e apostila).
O que falta para montar o app
build_all.py
adaptado (trocar Mission→Morceau, mapear os tipos de bloco)
gen_quiz.py
— roda igual, gerando questões ancoradas nas frases reais
gen_exams.py
— provões
DELF
(A1/A2/B1/B2) no lugar de Cambridge/DELE
Sem aba de Lives (o curso não tem)
Explorar os 960 MP3 do FTD como fonte extra de frases
Estimativa: o grosso do pipeline já existe e é reaproveitável.
Arquivos gerados
arvore_raw.json
— árvore completa (1.615 pastas)
arquivos.json
— 7.742 arquivos achatados com path + id
htmls_aula.json
— 301 HTMLs de aula
html_aulas/
— os 301 baixados (1,6 MB)
crawl.py
,
extrai.py
— reaproveitados do inglês
Open