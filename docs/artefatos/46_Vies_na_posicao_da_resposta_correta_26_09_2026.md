Viés na posição da resposta correta · 26/09/2026
Reportado pelo usuário:
"todas as respostas anteriormente davam na opção B"
.
O que a medição mostrou
No total, não havia viés
— os três cursos já ficavam perto de 25% por letra.
Mas ao separar
por tipo de questão
, o padrão apareceu:
curso · tipo
n
A
B
C
D
francês · teoria
30
13%
50%
27%
10%
inglês · sequência
20
15%
10%
25%
50%
Metade das questões de teoria do francês tinha a resposta em
B
. Era exatamente
o que o usuário estava vendo — o tipo "Qual destas afirmações a aula apresenta"
abre quase toda aula, então é a primeira coisa que ele encontrava.
Causa
random.shuffle
sorteia a posição. Em amostras pequenas (30 questões espalhadas
em 30 aulas, uma por aula), o sorteio não distribui — ele se concentra.
E o olho humano percebe concentração bem antes da estatística chamar de anomalia.
Correção — três camadas
1. Rodízio em vez de sorteio.
A posição da resposta é
atribuída
em rodízio
embaralhado (
[0,1,2,3]
embaralhado, repetido), não sorteada. Garante ~25% em
qualquer subconjunto.
2. Equilíbrio por TIPO, não por bloco.
Primeira tentativa foi equilibrar por
bloco — não resolveu, porque tipos raros (1 questão por aula) sempre caíam na
mesma posição do rodízio daquele bloco. O passe final agrupa
por tipo de
enunciado
e aplica o rodízio dentro de cada grupo.
3. Anti-sequência.
Mesmo com 25% em cada letra, sobravam
59 sequências de
3 respostas iguais seguidas
no francês e 63 no espanhol. Três "C" seguidos viram
muleta. Um passe final quebra toda sequência de 3+.
Resultado
antes
depois
pior concentração num tipo
50,0%
28,0%
sequências de 3+ iguais (FR)
59
0
sequências de 3+ iguais (EN)
37
0
sequências de 3+ iguais (ES)
63
0
Distribuição final:
curso
A
B
C
D
espanhol
25,1%
24,9%
25,2%
24,8%
inglês
24,8%
25,5%
24,7%
24,9%
francês
24,4%
26,0%
25,0%
24,6%
Integridade do gabarito
Mover a resposta de posição é arriscado: se o índice não acompanhar, o gabarito
inteiro quebra. Validei cruzando cada alternativa correta com o texto da
explicação (que cita a resposta):
francês:
1113/1113
conferem
inglês:
1112/1112
conferem
espanhol: gabarito dentro do intervalo em
1440/1440
As 9 questões do espanhol com 3 alternativas (Minicurso de Pronúncia) são
pré-existentes
e foram preservadas como estavam — o script só reposiciona
questões de 4 alternativas.
Arquivos
gen_quiz_v2.py
—
equilibrar()
, passe por tipo e
antiRun()
gen_exams_v2.py
— mesmo tratamento, por seção do provão
fix_ordem_es.py
— aplica direto no dataset do espanhol, que não tem gerador
Open