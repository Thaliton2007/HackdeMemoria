Agenda do SRS visível + faxina do workspace · 25/09/2026
O problema
O SRS
já calculava
a data da próxima revisão de cada carta (
x.next
/
c.due
),
mas o usuário nunca via isso. A interface só dizia
"N cartas para revisar hoje"
:
não dizia
quando
é a próxima
não dizia
há quanto tempo
algo estava vencido
não avisava nada se você avançasse nas unidades sem revisar — a fila crescia em silêncio
Ou seja: a informação existia no estado, faltava chegar à tela.
O que foi adicionado
1.
srsStatus()
— o núcleo
Devolve
{due, novas, proxima, amanha, atrasoMs, total}
lendo a agenda real das cartas.
Mais
humanizarMs()
,
humanizarAtraso()
e
estimarMin()
(≈8 s por carta).
2. Painel "Para hoje" com tempo
antes
depois
"prontas para hoje"
"a mais antiga venceu
há 3 dias
"
"nada vencido agora"
"
próxima em 3h20
"
Nova linha
"Vencem em 24h"
— permite planejar o dia.
3. Frase do topo corrigida
Antes somava cartas novas com vencidas ("908 para revisar" quando só 52 estavam vencidas).
Agora separa:
"52 carta(s) vencida(s) · cerca de 7 min para zerar"
.
Com a fila zerada, vira
"Nada vencido — próxima revisão em 5h"
e o botão passa a
oferecer a próxima aula.
4. Banner de acúmulo (limiar: 40 vencidas)
Faixa âmbar no topo:
"⚠️ 52 cartas vencidas. A mais antiga venceu há 3 dias.
Avançar sem revisar faz a fila crescer — são cerca de 7 min para zerar. Revisar agora →"
5. Pop-up ao concluir aula (o que você pediu)
Dispara ao clicar em
"Enviar cartas para estudo"
quando há ≥10 vencidas.
Mostra o número, o atraso da mais antiga e o tempo estimado.
Dois caminhos:
Revisar agora
ou
Continuar estudando
— nunca bloqueia.
6. Badge por unidade
Cada unidade na aba Unidades mostra
"N a revisar"
em vermelho.
Aplicado nos três cursos
curso
testes
francês
22/22
inglês
9/9
espanhol
5/5
O espanhol exigiu adaptação: usa
S.cards[id].due
e
unlocked(id)
,
enquanto inglês e francês usam
S.srs[id].next
e
S.done[unit/bloco]
.
Faxina do workspace
135 MB → 66 MB
no que de fato persiste.
Removido (tudo regenerável ou descartável):
shots/
— 34 screenshots de teste (7,9 MB)
builds antigos dentro de
backup/
— os scripts refazem
drive/text_corpus.json
,
clean_corpus.json
,
cards_raw.json
,
tree.json
(6 MB de intermediários)
HTMLs superados no raiz (versão escura e etapa 1 do inglês, espanhol antigo)
frances/arquivos.json
e listas temporárias do FTD
Nota importante:
du -sh
mostrava 1,4 GB, mas 1,2 GB são
.cache
(Chromium do Puppeteer 635 MB + modelos Whisper 464 MB) e
node_modules
56 MB —
todos
excluídos do snapshot
do workspace. O que persiste são os 66 MB.
Maior item restante:
frances/ftd_audio
(16 MB e caindo). O
transcreve.py
agora
apaga cada MP3 depois de transcrever
— o áudio continua no Drive, que é de onde
o app toca. Ao terminar, a pasta vai a zero.
Transcrição do FTD
400 de 923 no momento deste registro. Retomável: basta rodar
python3 transcreve.py
(ele lê
ftd_transcricao.json
e continua de onde parou).
Open