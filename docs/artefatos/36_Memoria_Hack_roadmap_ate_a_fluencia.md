Memoria Hack — roadmap até a fluência
Notas atuais:
Espanhol 5,5 · Inglês 6,5 · Francês 6,0
Teto de hoje: ~7. Nenhum curso treina
produção
(falar e escrever), e é isso que
separa "entender muito" de "ser fluente".
Respondendo primeiro: um curso novo herda as melhorias?
Hoje, não.
Medido:
similaridade inglês × francês
97%
similaridade espanhol × inglês
89%
funções com o mesmo nome nos três
106
Mas são
três cópias separadas
do mesmo app. Quando fiz a agenda do SRS, tive de
aplicar o patch 3 vezes — e adaptar à mão no espanhol, que tem outra estrutura de estado.
Um 4º curso = 4ª cópia.
Cada melhoria nova passaria a custar 4 aplicações, com 4
chances de divergir. É por isso que o
Bloco 0 vem antes de tudo
.
BLOCO 0 — Motor único
Por que primeiro:
sem isso, cada bloco abaixo custa 3–4× mais e os cursos vão divergindo.
Extrair o núcleo comum (SRS, quiz, provões, player, navegação, dashboard) para
um
engine.js
Cada curso vira
dados + configuração
: idioma, rótulos, níveis de exame, tipos de bloco
Um
build.sh
único; curso novo = criar o dataset e registrar no
cursos.json
Resultado:
melhoria aplicada uma vez vale para todos, inclusive para o curso que você criar depois.
Risco:
médio — mexe em tudo. Por isso é o primeiro, enquanto as suítes de teste estão verdes.
Ganho de nota:
0 (é infraestrutura) — mas viabiliza todo o resto.
BLOCO 1 — Fala: o buraco que mais pesa
Impacto: +1,5 na nota.
É o que falta para "entendo tudo mas travo ao falar".
Testei as APIs no navegador —
todas disponíveis
:
SpeechRecognition ✓  MediaRecorder ✓  getUserMedia ✓  AudioContext ✓
1.1 Repita a frase (reconhecimento)
O app mostra a frase, você fala, ele compara com o texto esperado e devolve
score palavra a palavra (o mesmo diff que já existe no modo digitação).
1.2 Shadowing com gravação
Toca o nativo → você repete → grava → toca os dois em sequência para comparar.
Sem nota automática; o ouvido do aluno é o juiz.
1.3 Carta de produção oral
Novo tipo no SRS: vê o português,
fala
em voz alta, o app valida.
Fecha o ciclo: reconhecer → escrever →
falar
.
Atenção honesta:
no Chrome o
SpeechRecognition
envia áudio aos servidores do
Google (precisa de internet). No Safari/iOS funciona a partir do 14.5, com limites.
Vou detectar e desativar o recurso onde não houver suporte, sem quebrar o resto.
BLOCO 2 — Produção escrita avaliada
Impacto: +0,5
Hoje o modo digitação compara texto exato; passa a aceitar
variações válidas
(sinônimos, ordem, contração) em vez de exigir a frase idêntica
Ditado de frase ouvida
já existe; falta
escrita livre
com apoio:
responder a uma pergunta usando a estrutura da aula, com correção por critérios
(usou o tempo verbal certo? a concordância? o vocabulário da unidade?)
BLOCO 3 — Compreensão de texto e áudio longos
Impacto: +0,5
Hoje só existem frases soltas. Falta o degrau intermediário:
Diálogos completos
como texto, com perguntas de interpretação
(o francês tem Conversation Native; o inglês tem Small Talk; o espanhol tem Walk'n'Talk)
Áudio longo
com perguntas de compreensão global — não "qual frase você ouviu",
mas "por que a Claire ligou?"
BLOCO 4 — Questões que testam compreensão
Impacto: +0,5
Medição atual da repetitividade:
curso
molde dominante
espanhol
76%
é "Como se diz em espanhol: X"
inglês
25% + 25% = metade em dois moldes
francês
32% + 28% = 60% em dois moldes
Isso testa reconhecimento, não entendimento. Falta:
Gramática de verdade
: "por que aqui é
imparfait
e não
passé composé
?"
Erro plantado
: mostrar frase errada e pedir a correção
Contexto
: "qual resposta cabe nesta situação?"
Distratores da mesma família
(hoje já corrigi o tamanho; falta a categoria gramatical)
BLOCO 5 — Provões que merecem o nome
Impacto: +0,5
Chamo de "DELF A1" e "Cambridge B1" algo que é só múltipla escolha. Os exames reais
têm 4 provas, incluindo
produção escrita e oral
. Com os Blocos 1 e 2 prontos:
acrescentar
Production écrite
(redação curta com critérios)
acrescentar
Production orale
(falar sobre um tema, via Bloco 1)
manter a regra eliminatória que já implementei no DELF
enquanto não houver produção,
renomear
para "Simulado de vocabulário e gramática" —
é mais honesto que prometer DELF
BLOCO 6 — Áudio nativo dentro do fluxo
Impacto: +0,5 no inglês e no francês
O Drive bloqueia hotlink de mídia (403 com
Sec-Fetch-Dest: audio
). Hoje as 1.895
gravações do inglês e 2.729 do francês abrem em nova aba, fora do estudo.
Caminhos, do mais simples ao mais definitivo:
Cache local (IndexedDB)
— baixa sob demanda via iframe e guarda; cota ~1 GB
Pacote de áudio
— um
.zip
/
.bin
por unidade, hospedado junto do HTML
Cloudflare R2
(~US$ 0,41/mês) — resolve de vez, mas sai do Drive da empresa
BLOCO 7 — Completar o que está pela metade
Impacto: +0,5 no francês
pendência
estado
FTD francês — transcrição
425 de 923
FTD francês — tradução
120
feitas
Teoria do francês
só
83
blocos (o inglês tem 204) — está nos PDFs, dá para extrair
Áudio nativo do espanhol
não existe
no acervo: só 24 MP3 de diálogo completo
Sobre o espanhol: para ter áudio por frase seria preciso
alinhamento forçado
(Whisper com timestamps) dos 24 diálogos, recortando frase a frase. Cobriria os
diálogos, não as 3.540 cartas. É o limite do material, não do app.
BLOCO 8 — Ritmo e hábito
Impacto: +0,5
O SRS já avisa. Falta fechar o ciclo:
Meta diária
configurável, com o dia marcado como cumprido
Sessão mista automática
: revisão + aula nova na proporção certa, sem escolher nada
Previsão de carga
: "no ritmo atual você termina a Unidade 12 em 3 semanas"
Notificação
(Notification API) para o horário que você escolher
Ordem que eu recomendo
text
0 ─ Motor único          infra, habilita o resto
│
1 ─ Fala                 ← maior salto de nota
│
4 ─ Questões melhores    barato e melhora o uso diário
│
7 ─ Completar dados      tira as pendências conhecidas
│
2 ─ Produção escrita
3 ─ Texto e áudio longos
5 ─ Provões completos    depende de 1 e 2
6 ─ Áudio no fluxo
8 ─ Ritmo e hábito
Projeção honesta
etapa
espanhol
inglês
francês
hoje
5,5
6,5
6,0
+ Bloco 1 (fala)
7,0
8,0
7,5
+ Blocos 2, 3, 4
8,0
9,0
8,5
+ Blocos 5, 6, 7, 8
8,5
9,5
9,0
Por que nem com tudo chega a 10:
fluência também precisa de conversa com gente de
verdade e de exposição a material não controlado. Um app leva você a um B2 sólido e
autônomo — o último passo é humano. Prometer 10 seria mentira.
O
espanhol fica atrás
por falta de áudio nativo no acervo, e isso nenhum bloco resolve.
Open