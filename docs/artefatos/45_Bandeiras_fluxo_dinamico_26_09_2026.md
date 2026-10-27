Bandeiras + fluxo dinâmico · 26/09/2026
1. Bandeiras — SVG, não emoji
Aplicadas no
logo
e no
avatar
dos três cursos, e nas
abas do hub
.
Por que SVG e não 🇫🇷:
o Windows não tem fonte de emoji de bandeira — 🇫🇷
aparece como as letras "FR". SVG inline renderiza igual em Windows, macOS,
Linux, Android e iOS, escala sem perder nitidez e não depende de fonte.
França: três faixas verticais
#002395 · #fff · #ED2939
Espanha: três faixas horizontais
#AA151B · #F1BF00 · #AA151B
(1:2:1)
EUA: sete listras
#B22234
+ cantão
#3C3B6E
Todas recortadas em círculo com uma borda sutil. Arquivo:
bandeiras.py
.
2. Pop-up do dia
Ao abrir o app
num novo dia
com cartas vencidas:
👋
18
· cartas prontas para revisar
A mais antiga venceu há 3 dias.
Bom te ver de volta. A revisão espaçada só funciona se acontecer no dia certo —
leva cerca de
3 min
.
[Revisar agora]
· [Depois]
Regras:
aparece
uma vez por dia
(
S.avisoDia
guarda a data)
não aparece
se não houver nada vencido
"Depois" fecha e não insiste; no dia seguinte volta
3. Convite ao provão
Ao completar
100%
das unidades que um exame cobre:
🎓
100%
concluído
Você terminou tudo que o
A1 · Découverte
cobre. Este é o momento de medir:
são 24 questões e a aprovação exige
50
pontos.
[Fazer o provão]
· [Mais tarde]
Regras:
uma vez por nível
(
S.avisoExame[lv]
)
não aparece se já foi aprovado naquele nível
tem prioridade
sobre o aviso de fila — a conquista vem antes da cobrança
"Fazer o provão" abre a prova direto, sem passar pela lista
dispara no boot e logo após concluir uma aula
Como cada curso calcula "100%"
curso
critério
inglês
missionDone(mission)
— a Mission do exame
francês
faixaDone(de..ate)
— Unités 01–06, 07–12, 13–18, 19–24
espanhol
adaptado
: não tinha faixa nem mission; divide as 24 unidades em 4 blocos, um por nível
O espanhol libera os provões
em cadeia
(A2 só depois de passar no A1), o que é
diferente dos outros dois. Mantive essa regra — o convite respeita o desbloqueio.
Testes
francês
26/26
inglês
26/26
espanhol
6/6
(código diverge, teste adaptado)
regressão nos três
12/12
Cobrem: bandeira é SVG com as cores certas e visível, pop-up não aparece sem
cartas, aparece com fila vencida,
não repete no mesmo dia
, volta no dia
seguinte, convite ao provão com 100%, leva direto à prova, não repete, contraste
AA e ausência de erro de JS.
Um erro cometido e corrigido
O aplicador inseriu o módulo
no meio de uma função
, quebrando a sintaxe.
Restaurei do backup e troquei o cálculo de posição por uma lista de marcas
seguras (
/* ==== SESSÃO SRS ==== */
etc.), inserindo sempre
antes
de um
comentário de seção — nunca no meio de código.
Arquivos
bandeiras.py
— SVGs + CSS; uso:
python3 bandeiras.py <fr|en|es> <shell.html>
dinamico_modulo.js
—
modalMostrar
,
avisoDoDia
,
missaoConcluida
,
checarFluxo
aplica_dinamico.py
— injeta o módulo; uso:
python3 aplica_dinamico.py <app.js>
Open