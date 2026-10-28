Até quantos cursos cabem no hub? — medições de 23/09/2026
Tudo abaixo foi
medido
em Chromium, gerando hubs de teste com cópias reais
dos dois cursos. Não é estimativa.
Teste de escala
Cursos
Arquivo
Abrir
Montar curso
Heap
Erros
2 (atual)
5,4 MB
0,2 s
~2 s
~10 MB
0
4
10,7 MB
0,2 s
4,4 s (todos)
14 MB
0
8
21,4 MB
0,2 s
6,1 s (todos)
26 MB
0
12
32,1 MB
0,3 s
8,0 s (todos)
39 MB
0
24
64,2 MB
0,8 s
3,7 s (3 ativos)
11 MB
0
40
106,9 MB
1,0 s
3,7 s (3 ativos)
11 MB
0
60
~160 MB
1,6 s
2,4 s (1 ativo)
9 MB
0
100
267 MB
32,3 s
travou
—
timeout
O heap
não cresce
com o número de cursos, só com quantos estão
abertos
.
É o carregamento sob demanda funcionando: curso fechado é texto Base64 inerte.
O gargalo real não é o tamanho do arquivo
É o
localStorage
— essa foi a descoberta importante do teste:
Iframes
srcdoc
têm origem
null
→
todos compartilham o mesmo localStorage
Teto medido:
4,9 MB
para o conjunto inteiro
Progresso de um curso saturado (2 anos de uso, todas as cartas revisadas,
todos os quizzes feitos, 730 dias de log):
148 KB
→
~34 cursos com progresso máximo simultâneo.
Na prática é mais folgado: ninguém satura 34 cursos ao mesmo tempo.
Um curso em uso normal fica na casa de 20–40 KB.
Veredito
Faixa
Situação
até 12 cursos
(~32 MB)
confortável, sem ressalvas
12–40
(~107 MB)
funciona bem; abertura ainda ~1 s
~34
teto do localStorage se todos estiverem saturados
60
(~160 MB)
abre em 1,6 s, mas já é desconfortável de baixar
100
(267 MB)
quebra
— 32 s para abrir, trava na interação
Recomendação: até ~12 cursos
sem mudar nada.
Se um dia passar de 12
IndexedDB no lugar do localStorage
→ teto de 5 MB para ~1 GB
(a estimativa do navegador nesta origem foi de 1024 MB)
Dropar o Base64
→ −33% no arquivo. Exige outro esquema de escape:
o
<\/script
textual
não funciona
dentro de
srcdoc
— testado, falhou
CSS compartilhado
→ hoje ~35 KB duplicados por curso
Como reproduzir
O gerador de hubs de teste está em
build_hub.py
; basta variar a lista
CURSOS
com cópias dos HTMLs e medir com Puppeteer (
page.metrics()
para o heap).
Open