Backup — Curso de Espanhol (Memoria Hack) · 23/09/2026
Replicação no espanhol das três mudanças já aprovadas no inglês:
correção de mídia + tema claro (etapa 1) + nav/dashboard (etapa 2).
Arquivos
Arquivo
O que é
v1_escuro_original.html
build anterior: tema escuro, 9 abas, mídia com o bug do Drive
v2_claro_nav_midia.html
ATUAL — PRODUÇÃO
fontes_originais/
app/shell.html
+
app/app.js
antes das mudanças
fontes_v2/
fontes atuais
rebuild.sh
shell + sources + dataset + js → HTML único
Arquivo ativo no workspace:
MemoriaHack_Espanhol_Claro_v2.html
(
MemoriaHack.html
é o mesmo build, nome usado pelo
rebuild.sh
).
Conteúdo (inalterado)
3.540 cartas · 24 unidades · 159 aulas · 4 provões DELE (A1–B2) · 421 IDs do Drive.
1. Correção de mídia
confirm=t
em todos os downloads (sem ele o Drive devolve a página de aviso em arquivos grandes)
Vídeo passou de
<video src>
para
iframe
/preview
(player oficial).
O Drive responde
403
quando o navegador pede o arquivo como mídia
(
Sec-Fetch-Dest: video|audio
→ Chrome reporta
ERR_BLOCKED_BY_ORB
).
Origem externa (Archive.org) continua com
<video>
, que lá funciona.
2. Tema claro (etapa 1)
Mesma paleta do inglês, com as cores de ação escurecidas para WCAG AA.
Reutilizado
ingles/tema_claro.py
. Ajustes que o espanhol exigiu a mais:
Item
Antes
Depois
Motivo
--tx3
#67737F
#616D79
4,29:1 nas tags
.pill.dialogo
/
.gr3
#93c5fd
#094E96
1,59:1
.pill.habla
#c4b5fd
#4A3AB0
1,62:1
.diff s
/
.gr0
/
.ic
#fca5a5
var(--bad)
/
#A32B1F
1,55:1
.pill.gramatica
var(--ac2)
#094E96
fundo tingido derruba o contraste
.pill.conjugacion
var(--ok)
#00604B
4,35:1
.pill.pronuncia
var(--warn)
#735406
4,22:1
.kbd
herdava
#fff
do
.btn.p
fundo branco +
var(--tx)
1,08:1 — invisível
Eram 324 ocorrências de baixo contraste; todas corrigidas.
3. Nav e dashboard (etapa 2)
Nav de 9 →
5 itens
(
Início · Estudar · Aulas · Cronograma · Progresso
)
menu
Mais
(Unidades, Escutar, Exercícios, Explorar, Provões)
🔥/Hoje saíram do header → painel
Para hoje
; entrou o avatar
Dashboard: saudação em espanhol por horário, CTA único contextual,
3 cartões de Onda
(unidades 1–8 / 9–16 / 17–24),
Para hoje
,
Seu ritmo
Heatmap →
barras verticais de 14 dias
(azul/lilás, CSS puro)
Mobile:
tab bar inferior
(5 abas) +
bottom sheet
(6 itens)
Nota importante — vídeo no ambiente de teste
A pasta do espanhol no Drive é
privada
: fora do navegador logado,
/preview
responde
302
(login) e o iframe fica em branco.
A do inglês é pública, por isso lá o teste consegue ler o título do arquivo.
Não é defeito do app
— no seu navegador logado o vídeo abre normalmente.
Os testes validam o contrato (iframe +
/preview
+ ID correto), não o conteúdo.
Verificação
Suíte:
62/62
Contraste AA:
12 telas
(
ingles/audit.js
)
Zero ORB, zero erro de JS, dataset íntegro (3.540 / 24 / 159 / 4)
A auditoria ganhou uma melhoria durante este trabalho: agora respeita
fundo próprio opaco
do elemento, eliminando falsos positivos.
Restaurar
Bash
# voltar ao tema escuro original
cp
backup/espanhol_2026-09-23/v1_escuro_original.html
MemoriaHack_Espanhol_2026-09-18.html
cp
-r
backup/espanhol_2026-09-23/fontes_originais/
*
app/
bash
rebuild.sh
Open