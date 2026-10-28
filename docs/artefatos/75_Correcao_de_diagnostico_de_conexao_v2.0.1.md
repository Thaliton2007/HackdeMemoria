Correção de diagnóstico de conexão — v2.0.1
O que o resultado já demonstra
O teste no editor leu os 377 registros em 4.808 ms. Ele confirma que a conta usada no editor consegue ler aquela planilha. Não mede a chamada da implantação web, que pode executar com outra configuração/versão/conta, nem a comunicação de volta ao navegador.
O código lê os dados e hyperlinks das células. Ele
não visita Coupa, Drive ou cada URL da base durante a conexão inicial
. A inspeção dos hyperlinks pode contribuir para os 4,8 segundos daquela execução, mas não permite explicar, sozinha, a página permanecer cinco minutos em Conectando.
Sem ver as execuções web e os erros do navegador, não há causa confirmada. Possibilidades incluem uma chamada web que não conclui, bloqueio de comunicação/autorização, versão implantada diferente e erro de JavaScript no navegador. A captura de tela não distingue essas situações.
Arquivos atuais no workspace
A pasta
Inicialização
foi atualizada e contém somente:
Code.gs
index.html
appsscript.json
O pacote desta atualização inclui cópias desses três arquivos e cópias TXT para facilitar a instalação. As versões TXT não são arquivos extras a criar no Apps Script.
O que mudou nesta atualização
Esta é uma atualização de
diagnóstico e tratamento de erro
, não uma alegação de que o problema já foi identificado ou resolvido.
Registro do início/fim de cada leitura no servidor, com etiqueta da requisição.
Tempos separados para abertura, faixa, valores, exibição, links/mapeamento e montagem dos registros.
Medição da espera da chamada no navegador e da montagem da tela após a resposta.
Aviso visível e liberação de nova tentativa após 45 segundos sem conclusão.
Tratamento de erro dentro do callback de sucesso: erros ao montar a tela não ficam mais silenciosos.
Captura separada de erros JavaScript e promessas rejeitadas. Um erro de cópia/sintaxe no script principal pode ser apresentado pela captura instalada antes dele.
Teste de comunicação
getBackendStatus
que responde sem abrir a planilha.
Identificação de versão do HTML e do backend, com aviso quando diferentes.
Limite de espera não cancela a execução no Google.
Uma resposta tardia é ignorada depois do timeout; evite repetir tentativas várias vezes seguidas, pois a chamada anterior pode continuar no servidor. O teste de comunicação também pode esperar em fila e não demonstra, sozinho, qual componente falhou.
Não foi adicionado cache nem removida a leitura dos links: primeiro é necessário localizar o gargalo real, sem esconder falhas com dados antigos.
Instalar
No projeto Apps Script, substitua o conteúdo do script principal pelo novo
Code.gs
.
Substitua todo o HTML pelo novo
index.html
; o nome no editor continua
index
, com i minúsculo.
O manifesto não mudou. Se usar o do pacote, ele mantém permissão apenas de leitura.
Salve e execute
testarConexao
no editor. O resultado agora deve mostrar versão
2.0.1
e o objeto
etapas
.
Vá a
Implantar → Gerenciar implantações → lápis → Nova versão → Implantar
.
Feche a guia antiga e abra a URL
/exec
da implantação atualizada.
Confira
v2.0.1
no rodapé e em
Diagnóstico de conexão
. Uma guia antiga não recebe o código novo automaticamente.
Não mantenha duas cópias das constantes/funções em arquivos .gs diferentes. Não cole os arquivos TXT como arquivos adicionais: são apenas cópias do código para copiar e colar.
Coletar o diagnóstico
Abra
Diagnóstico de conexão · v2.0.1
, acima dos indicadores.
Aguarde a resposta ou o aviso de 45 segundos.
Copie o texto do diagnóstico.
Clique uma vez em
Testar comunicação (sem ler a planilha)
e copie o resultado também.
No editor do Apps Script, abra
Execuções
e procure a execução web de
getCockpitData
no mesmo horário. Confira função, status, duração e os logs
COCKPIT_START
/
COCKPIT_DONE
. O teste
testarConexao
do editor é uma execução diferente.
Como interpretar
Observação
O que investigar
Servidor conclui rápido, mas não há resposta registrada no navegador
Transporte da RPC, navegador, autorização e configuração da implantação.
Resposta recebida, seguida de erro de montagem
Erro JavaScript/dados/versão: copiar a mensagem exibida.
Execução web fica em andamento por muito tempo
Investigar os tempos/logs dessa execução, filas e acesso ao Sheets.
Não aparece execução web correspondente
Conferir se o JavaScript iniciou a chamada, os filtros da lista de Execuções, bloqueios do navegador e a URL/versão implantada. Não é prova isolada de uma causa.
Teste sem planilha funciona, mas leitura não conclui
Investigar o endpoint de dados e sua execução, não cada URL de documento.
Teste sem planilha também não responde
Investigar transporte, fila, autorização, versão e navegador; não atribuir a causa ao tamanho da base.
Para comparação, experimente a URL em outro navegador atualizado, com a mesma conta Google e sem extensões de terceiros. A captura parece ser do Brave; proteções de privacidade podem interferir, mas isso
não foi confirmado
e não exige desativar proteções permanentemente.
Testes locais desta atualização
Regressão da leitura e interface: 377 registros, 330 RCs distintas, 248 NF lançada e OS359 preservada.
Resposta válida registra tempos e libera controles.
Teste de comunicação não usa leitura da planilha.
Timeout de 45s simulado libera tentativa e informa que não cancela o servidor.
Resposta tardia não substitui uma leitura após o timeout.
Erro de montagem simulado é capturado e exibido.
Validações feitas com backend/DOM simulados. Não houve acesso à implantação do usuário nem medição real do navegador/conta Google. Esta atualização precisa ser instalada e publicada para coletar evidências do problema observado.
Open