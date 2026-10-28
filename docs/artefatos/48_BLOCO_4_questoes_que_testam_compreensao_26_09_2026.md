BLOCO 4 — questões que testam compreensão · 26/09/2026
Antes: os testes eram flashcards em formato de múltipla escolha. Reconhecer
vocabulário, não entender gramática.
1. Erro plantado (tipo novo)
Só uma destas frases está correta. Qual?
"Não é certeza de que o seu pai tenha razão."
Il n'est certain que ton père ait raison.
Il n'est pas que certain ton père ait raison.
Il n'est pas certain que que ton père ait raison.
✓
Il n'est pas certain que ton père ait raison.
Quatro versões da
mesma
frase: uma correta, três com erros que aprendiz
comete de verdade. Não dá para acertar por vocabulário — só sabendo a regra.
Regras por idioma (só entram quando o padrão é detectado sem ambiguidade):
idioma
erros gerados
francês
auxiliar
avoir
/
être
, concordância sujeito-verbo, negação
ne…pas
incompleta, gênero do artigo
inglês
-s
da 3ª pessoa,
he are
,
a
/
an
, verbo após
does
espanhol
ser
/
estar
,
tener
sem ditongo,
muy
/
mucho
, gênero do artigo
Mais regras de reserva que valem em qualquer frase (ordem das palavras, palavra
repetida, palavra omitida, acentuação) para completar as 3 alternativas.
A explicação nomeia o erro de cada alternativa
— a questão ensina, não só avalia.
2. Lacuna com distrator sintático
Antes os distratores vinham de palavras aleatórias do corpus, e dava para
eliminar pela classe gramatical. Agora vêm de palavras que aparecem
no mesmo
contexto
(depois da mesma palavra anterior) no acervo do curso. Se a lacuna vem
depois de
je
, os distratores também são coisas que aparecem depois de
je
.
3. Cota por tipo
"Como se diz" e "O que significa" ocupavam metade da prova porque sempre
conseguem gerar. Agora há teto de 2 de cada por aula.
Resultado
habilidade
francês
inglês
lacuna contextual
25,6%
20,2%
produção (PT→alvo)
25,2%
25,2%
compreensão (alvo→PT)
24,6%
24,3%
gramática (erro plantado)
13,2%
4,5%
compreensão oral
6,7%
11,8%
teoria da aula
2,7%
12,2%
sequência de diálogo
2,0%
1,8%
7 habilidades distintas
nos dois cursos (antes eram 4, com 2 dominando).
O inglês gera menos erro plantado (4,5%) porque as regras do inglês disparam em
menos frases — a gramática é menos marcada morfologicamente que a do francês.
Dois problemas encontrados e corrigidos durante a implementação
1. A maiúscula entregava a resposta.
He is very tired.
virava
he are very tired
— minúsculo. Quem notasse acertava sem saber gramática.
Corrigido com
_cap()
, que preserva a capitalização original.
2. Erro plantado em coisas que não são frases.
O francês gerou alternativas
para
Je - Deux (língua de ê, lábios de ô)
, uma nota de pronúncia. Adicionei
_e_frase()
, que descarta entradas com explicação entre parênteses, glossário
com hífen, tudo em maiúscula,
/
,
…
ou
=
. Caiu de 160 para 147 questões,
todas legítimas.
Integridade
francês
inglês
questões válidas
1113/1113
1112/1112
gabarito conferido (erro plantado)
147/147
50/50
sequências de 3 respostas iguais
0
0
equilíbrio A/B/C/D
24,0–26,2%
24,6–25,4%
Regressão nos três cursos:
15/15
(dataset, bandeira, modal, contraste AA, JS).
Bug corrigido de tabela (fora do Bloco 4)
A transcrição do FTD estava gravando
falha como sucesso
: uma incompatibilidade
entre
faster-whisper
e o PyAV 14 fazia
transcribe()
lançar exceção, e o
except
salvava o nome truncado como se fosse a frase completa. 492 registros
foram assim. Corrigido em três frentes:
pip install "av<14"
(PyAV 13.1 é compatível)
os 492 registros ruins foram descartados
o script agora
não registra
item que falhou, para poder tentar de novo
Arquivos
bloco4.py
— geradores de erro por idioma,
_cap
,
_e_frase
,
indice_contexto
gen_quiz_v2.py
— integração, cota por tipo, distrator sintático
Open