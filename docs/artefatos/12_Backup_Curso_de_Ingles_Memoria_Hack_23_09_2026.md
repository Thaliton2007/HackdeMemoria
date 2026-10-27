Backup — Curso de Inglês (Memoria Hack) · 23/09/2026
Ponto de restauração antes de integrar as
lives dentro do fluxo de estudo
.
Decisão do usuário:
seguir com a V2
(tema claro + navegação simplificada).
Os três entregáveis congelados aqui
Arquivo
O que é
Tema
Nav
v1_escuro.html
build original, paridade total com o espanhol
escuro (
#0b0e14
, rosa
#ff397d
)
10 abas
v2_claro_etapa1.html
etapa 1 da refatoração: só o tema
claro (
#F4F7F6
, azul
#0B6BCB
)
10 abas
v3_claro_etapa2.html
etapa 2 — VERSÃO ESCOLHIDA
claro
5 abas + menu "Mais"
Atenção ao nome: o arquivo ativo no workspace chama-se
Ingles_Curso_Completo_Claro_v2.html
e corresponde ao
v3_claro_etapa2.html
daqui
("v2" no nome = segunda etapa da refatoração, não a segunda versão).
Conteúdo (idêntico nas três)
25 units · 305 blocos ·
2.057 frases
(1.895 com áudio nativo = 92%)
694 questões
em 140 aulas (14 escritas à mão na Unit 1.1; o resto gerado e ancorado no conteúdo real)
3 provões Cambridge
(A2 Key · B1 Preliminary · B2 First), 25 questões, listening com MP3
111 ligações unit↔live
(SYNC = mesma semana · TEMA = reforço posterior)
Pasta do Drive:
1kHwY2ch-j-w1Rwi2QLhJOtF86CiCs6DN
Estado da V2 no momento do backup
Paleta clara com
todas as cores de texto aprovadas em WCAG AA (≥4,5:1)
— auditoria roda no DOM renderizado
Cartões sem borda, padding 24px, sombra suave; pesos 800/850 reduzidos
Heatmap substituído por
barras verticais de 14 dias
(CSS puro, sem Chart.js)
Nav:
Início · Estudar · Aulas · Cronograma · Progresso
+ menu
Mais
(Unidades, Escutar, Exercícios, Lives, Explorar, Provões)
Métricas (🔥 / Hoje) saíram do header e foram para o painel
Para hoje
Dashboard: saudação por horário, CTA único contextual, cartões de Mission,
Para hoje
,
Seu ritmo
Mobile:
header perde a nav; entram
tab bar inferior
(5 abas) +
bottom sheet
(7 itens)
Suítes: 54/54 (v2) · 30/30 (etapa 1) · 54/54 (conteúdo completo)
Pendência conhecida (o que vem agora)
As lives
só aparecem na aba Lives
, exigindo que o usuário vá até lá e escolha a unit.
Não surgem durante o estudo. Plano aprovado:
Bloco
🎥 Lives desta semana
dentro do detalhe da aula (entre teoria e cartas) — usa os
SYNC
Sugestão ao clicar em
"Enviar cartas para estudo"
— usa os
TEMA
("assista ao concluir")
(opcional)
marca no Journey Schedule
Links abrem o vídeo no Drive em nova aba (lives têm 1–2 h; embutir tiraria o usuário da aula).
Divergência em aberto
O curso de
espanhol
(
/home/user/MemoriaHack_Espanhol_2026-09-18.html
) continua
escuro e com 10 abas
. Se a V2 for aprovada em definitivo, aplicar etapa 1 + 2 nele
para os dois voltarem a ser o mesmo produto.
Como restaurar
Bash
# voltar qualquer build pronto
cp
/home/user/backup/ingles_2026-09-23/v3_claro_etapa2.html
\
/home/user/Ingles_Curso_Completo_Claro_v2.html
# voltar as fontes e reconstruir
cp
-r
/home/user/backup/ingles_2026-09-23/fontes/v2
/home/user/ingles/
cp
/home/user/backup/ingles_2026-09-23/fontes/dataset_full.json
/home/user/ingles/
cd
/home/user/ingles
&&
bash
build_v2.sh
Scripts (em
fontes/
)
Script
Função
crawl.py
varre a pasta do Drive via
embeddedfolderview
build_all.py
monta
dataset_full.json
(25 units, blocos, cartas, mídia)
gen_quiz.py
gera as 694 questões ancoradas no conteúdo
gen_exams.py
monta os 3 provões Cambridge
tema_claro.py
converte o CSS escuro → claro acessível (etapa 1)
build.sh
/
build_claro.sh
/
build_v2.sh
shell + dataset + js → HTML único
fontes/app/
= etapa 1 ·
fontes/v2/
= etapa 2 (ativa) ·
fontes/dark/
= tema escuro original
fontes/lives_md/
= os 25
.md
oficiais de mapeamento unit↔live baixados do Drive
Open