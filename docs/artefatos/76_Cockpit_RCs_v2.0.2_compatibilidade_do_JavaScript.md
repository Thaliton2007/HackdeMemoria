Cockpit RCs v2.0.2 — compatibilidade do JavaScript
Evidência recebida
O console mostra
Uncaught SyntaxError: Failed to execute 'write' on 'Document': Invalid or unexpected token
, com referência a uma fonte dinâmica
VM…
e uma linha/coluna. A pilha passa pelo carregador HTML do Google Apps Script.
Isso identifica uma falha de interpretação do JavaScript inserido na página, não uma chamada lenta a URLs de notas fiscais. A pilha ainda não revela o caractere exato: é necessário abrir a fonte VM na linha indicada para vê-lo. O aviso amarelo sobre sandbox é separado do erro de sintaxe.
Mudanças feitas
JavaScript do frontend convertido para sintaxe conservadora: sem template literals, arrow functions, const/let, optional chaining ou nullish coalescing.
Textos Unicode do JavaScript representados por escapes ASCII. O usuário continua vendo os textos em português normalmente.
Sem eval, Function, Blob de código, CDN ou biblioteca de execução adicional.
Mantidos os mesmos estilos, filtros, regras, dados e funcionalidades.
Captura de erros ampliada para apresentar origem, linha e coluna quando o navegador fornecer essas informações.
Versão atualizada para
2.0.2
no HTML e no backend, sem alterar a lógica de leitura da planilha.
É uma alteração de compatibilidade para eliminar possíveis problemas na interpretação/inserção do script.
Não é confirmação de que a causa exata no ambiente publicado já foi reproduzida ou resolvida.
Onde estão os arquivos atuais
A pasta
Inicialização
contém somente
Code.gs
,
index.html
e
appsscript.json
atuais.
Neste pacote há os mesmos arquivos e cópias
.txt
idênticas para copiar o código sem renderizar o HTML. Não crie os TXT como arquivos adicionais no Apps Script.
Como instalar
Extraia o ZIP.
Abra
Code.gs.txt
em um editor de texto, copie o conteúdo inteiro e substitua todo o conteúdo do script principal no Apps Script.
Abra
index.html.txt
em um editor de texto, copie o conteúdo inteiro e substitua todo o conteúdo do arquivo HTML
index
(i minúsculo).
Salve. Não mantenha duas versões das funções/constantes em outros arquivos .gs do mesmo projeto.
O manifesto não mudou; o arquivo do pacote mantém apenas a permissão de leitura.
Vá em
Implantar → Gerenciar implantações → lápis → Nova versão → Implantar
.
Feche a guia antiga e abra a URL /exec da implantação atualizada.
Confirme
v2.0.2
na área de diagnóstico e no rodapé.
Atualizar a página sem publicar uma nova versão pode continuar servindo o código antigo. Uma guia já aberta não recebe automaticamente as alterações do editor.
Validação realizada
Dois blocos JavaScript compilados e com sintaxe validada localmente.
Nenhum caractere Unicode literal nos blocos JavaScript finais; textos escapados mantêm a exibição original.
Regressão backend/DOM: 377 registros, 330 RCs distintas, 248 NF lançada, OS359 preservada, filtros, detalhes de parcelas, CSV e paginação.
Testes de timeout, resposta tardia e erro ao montar a tela.
Inserção do HTML via
document.write
em DOM simulado: carregou 377 registros sem erro de JavaScript.
Esses testes não executam o reescritor privado do HtmlService nem substituem o teste da implantação Google real. Não houve acesso ou publicação na conta do usuário.
Se o erro continuar
Confira que a página realmente mostra v2.0.2.
Na mensagem vermelha do Console, clique no link
VM…:linha
à direita.
Envie a captura da
linha do código que abrir em Sources
, com a linha anterior e posterior. A pilha sozinha não mostra o token inválido.
Alternativamente, anexe o
index.html
que está salvo no projeto Apps Script.
Não é necessário desativar proteções do navegador permanentemente nem trocar a base de dados para investigar esse erro.
Open