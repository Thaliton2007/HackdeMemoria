VERIFICAÇÃO DO ESPELHO NO DRIVE — FR (24/09/2026, varredura v3)
Link verificado:
drive/folders/1KA4mMyEpO_ZTPk5J0lulnO9-IVYrNs7S
Método: crawler público (embeddedfolderview), 1.615 pastas, 0 falhas.
Comparado com: snapshot v2 (raw 4.308) + árvore canônica organizada v1.1 (réplica FIXFR).
1. O que o espelho contém
Métrica
Valor
Arquivos no espelho (v3)
7.739
Esperado organizado (canônico v1.1)
4.308
Canônicos presentes, caminho+nome EXATOS
4.297 (99,7%)
Raw do curso que sobrevive intacto (caminho+nome)
3.432
Divergências
11
(10 nomes mutilados + 1 vídeo fora do lugar)
Ou seja: o espelho é uma
mistura
— a cópia organizada (v1.1) + boa parte do
curso raw antigo. Algumas units guardam as duas fontes (ex.: Unité 08 tem os
35 arquivos soltos raw + as 7 pastas-frase raw + as pastas
NN_
organizadas);
outras ficaram só com o organizado (ex.: Unité 11).
#04 Extras
segue com os
12 FTDs raw inteiros (o organizador removeu a pasta no PC, mas a raw do Drive
não some sozinha).
2. Pontos a corrigir no espelho
a) 10 nomes mutilados —
Unité 11/03_Conversation_Native/Audio_Dialogo/
(Conteúdo idêntico; só o NOME foi cortado/elidido — padrão: aquela pasta
tinha os caminhos mais longos do curso, >260 no PC.)
#
Nome atual (espelho)
Nome correto
01
01-UNITE 11_Du coup,.mp3
01-UNITE 11_Du coup, Stéphanie, qu'est-ce que la dame voulait.mp3
02
02-UNITE 11_Je n'ai pas très bien compris ce qu.mp3
02-UNITE 11_Je n'ai pas très bien compris ce qu'elle voulait. Je n'ai rien dit pendant toute la conversation.mp3
03
03-UNITE 11_Mais c'est bizarre, non_ i.mp3
03-UNITE 11_Mais c'est bizarre, non_ Peut-être elle avait besoin d'attention, c'est tout... Et elle parlait de quoi.mp3
04
04-UNITE 11_Elle m'asonnalité excentrique.mp3
04-UNITE 11_Elle m'a parlé sans arrêt d'un peintre du XXe (vingtième) siècle qui était célèbre grâce à ses peintures et à sa personnalité excentrique.mp3
06
06-UNITE 11_Ah, oui elle m'a dmarque.mp3
06-UNITE 11_Ah, oui elle m'a dit qu'il portait une moustache assez drôle, très longue. Apparemment c'est devenu sa marque.mp3
07
07-UNITE 11_Alors peut-t de Picasso.mp3
07-UNITE 11_Alors peut-être qu'elle parlait de Picasso.mp3
10
10-UNITE 11_Si, si. J'ai déjà vu…Mais elle l'a vendu.mp3
…Mais elle l'a vendue parce qu'elle voulait une voiture plus petite.mp3
(183 chars)
11
11-UNITE 11_Mais tu rigoles _  plaît.mp3
11-UNITE 11_Mais tu rigoles _ Dis-moi que tu plaisantes, s'il te plaît.mp3
12
12-UNITE 11_Pourquoi _ ais vue.mp3
12-UNITE 11_Pourquoi _ C'est à cause de cette voiture _ Tu ne l'as jamais vue.mp3
13
13-UNITE 11_Arrête ! Arrête s.mp3
13-UNITE 11_Arrête ! Arrête ! J'en peux plus.mp3
CSV com os pares:
/tmp
não persiste — a tabela acima é a referência.
(também vale conferir se esses mesmos 10 arquivos estão certos NO PC LOCAL —
o script v1.1 não cria nomes assim; não veio do script nem da fonte v2.)
b) Vídeo de abertura da Unité 13 fora do lugar
Espelho: solto em
#03 Morceau 02/1 - Unité 13/2 - #13 Cours d'ouverture.mp4
(posição raw).
Correto:
…/Unité 13/02_Cours_d_ouverture/Video/Cours_d_ouverture.mp4
(a pasta
02_Cours_d_ouverture
nem existe na U13 do espelho — no PC local ela existe, criada pela v1.1.)
3. O que NÃO é problema
05-UNI~1.MP3
(formato DOS 8.3) já vem assim da fonte raw — não é dano.
Os 119 nomes v2 "sem cobertura" são os arquivos que o organizador renomeia
por padrão (ex.:
…Cours d'ouverture.mp4
→
Cours_d_ouverture.mp4
) nas
units onde o raw não sobreviveu solto. Nenhum conteúdo perdido.
_FALTANDO.md
da U13 presente no espelho (documenta a lacuna oficial da U13).
4. Decisões pendentes (usuário)
Como o upload foi feito
(web/app Drive p/ computadores/robocopy) — para
explicar os nomes mutilados e evitar repetição.
Destino do espelho
: limpar o raw remanescente (ficar 1:1 com o local,
~3.400 arquivos a remover com cuidado) × manter as duas fontes.
Se os 10 nomes mutilados também existem NO PC LOCAL ou só no espelho
(olhar a pasta
D:\CURSOS\Frances\#02 Morceau 01\14 - Unité 11\03_Conversation_Native\Audio_Dialogo
).
Snapshots:
_analysis_fr/arvore_drive_fr_v1.json
(1ª varredura) ·
_v2.json
(fonte corrigida U17) ·
arvore_drive_fr.json
(v3 = espelho de hoje).
Open