Cockpit RCs v2 — instalação e atualização
O que mudou
Esta versão mantém a direção visual compacta da referência enviada: fundo verde-escuro, indicadores pequenos, filtros por status, busca, cards/tabela e detalhes em janela. O backend e a identidade de cada registro foram revisados.
Cada linha preenchida é preservada, mesmo sem RC.
Parcelas e rateios usam identificadores por linha da leitura, e não apenas o número de RC. O detalhe e a NF correspondem ao registro clicado.
RCs distintas e quantidade de registros são indicadores separados.
NF lançada é identificada pela expressão
NF Lançada
na observação, sem diferenciar acentos/caixa.
Nenhum status vazio é convertido para FINALIZADO.
Não há orçamento, desembolso, vencimento ou confirmação de pagamento.
A aba é escolhida por
gid
explícito. Não existe escolha automática de outra aba.
Há filtros para frente vazia e registros sem RC, além de fornecedor, PEP/CC e período de criação.
Filtros de status são gerados dos valores da base; não há agrupamentos ocultos.
Competências são ordenadas JAN–DEZ, sem inferir o ano.
Paginação em cards/tabela, ordenação e CSV de todo o resultado filtrado.
Textos são escapados antes de exibir HTML e links são validados.
Os dados são obtidos por chamada ao servidor, sem interpolação de JSON da planilha no HTML.
Uma consulta bem-sucedida vazia limpa a leitura anterior. Falha mantém a última leitura com aviso explícito.
Links ricos são lidos em lote somente nas colunas RC/Link NF/Numero NF, sem corte em 2.000 registros.
O horário mostra a última atualização, não uma suposta conexão em tempo real.
Sem dependência de
rcs_data.js
, fontes remotas, CDN ou bibliotecas externas.
Arquivos
Arquivo
Destino / finalidade
Code.gs
Substituir o conteúdo do script principal no Apps Script.
index.html
Substituir o HTML
index
, com i minúsculo.
appsscript.json
Manifesto com permissão somente leitura e fuso de São Paulo.
Code.gs.txt
Cópia textual idêntica do backend, para copiar sem interpretação.
index.html.txt
Cópia textual idêntica do HTML, para copiar sem renderização.
appsscript.json.txt
Cópia textual idêntica do manifesto.
INSTALACAO.md
Este guia.
VALIDACAO.md
Resultados dos testes e roteiro de aceite.
Os arquivos TXT são alternativas para copiar o código, não arquivos adicionais a criar no Apps Script.
A prévia visual
Previa-Cockpit-RCs-v2.html
é fornecida separadamente: contém uma cópia estática dos dados e não deve ser usada como HTML da implantação. O pacote de instalação não embute os registros da planilha.
1. Atualizar o projeto existente
Antes de substituir, faça uma cópia/backup do código atual. Você também pode criar um projeto separado para testar esta versão.
Abra
Extensões → Apps Script
na planilha, ou abra o projeto onde instalou a versão anterior.
No arquivo
Código.gs
ou
Code.gs
, apague o conteúdo antigo e cole
todo o conteúdo do novo Code.gs
. Pode usar
Code.gs.txt
para copiar.
No arquivo HTML
index.html
, apague o conteúdo antigo e cole
todo o conteúdo do novo index.html
. Pode usar
index.html.txt
para copiar.
O nome do HTML no editor deve ser
index
, com i minúsculo. A função
doGet()
usa
createHtmlOutputFromFile('index')
, sem extensão.
Em
Configurações do projeto
, habilite
Mostrar o arquivo de manifesto appsscript.json no editor
.
Abra o manifesto e substitua seu conteúdo pelo arquivo
appsscript.json
do pacote.
Salve.
Não acrescente este código no final do código antigo.
Não mantenha duas versões de
doGet
,
getCockpitData
ou da constante
APP_CONFIG
em arquivos
.gs
diferentes. Todo código
.gs
do mesmo projeto compartilha o mesmo escopo. Não é necessário importar
rcs_data.js
.
Se aparecer “Identifier APP_CONFIG has already been declared”, há duas cópias da configuração no projeto. Remova a cópia antiga do cockpit, sem apagar outros códigos não relacionados.
2. Conferir a origem da base
O pacote usa
a planilha original enviada nesta conversa
, não o ID diferente encontrado na documentação do outro agente:
JavaScript
const
APP_CONFIG
=
Object.
freeze
({
SPREADSHEET_ID:
'1zuP_DisCRgGizS6aTlsFjA9iEcklFKGsveFC4JneqvY'
,
SHEET_ID:
0
,
HEADER_ROW:
1
,
RC_URL_TEMPLATE:
''
,
NF_URL_TEMPLATE:
''
});
Se estiver usando outra cópia, altere
SPREADSHEET_ID
.
SHEET_ID
é o número depois de
gid=
na URL da aba, não a posição dela na lista.
O cabeçalho está na linha 1. Altere
HEADER_ROW
apenas se a sua cópia tiver outra estrutura.
A primeira coluna com nome STATUS é usada; a segunda é ignorada.
A leitura usa cabeçalhos exatos normalizados por acentos/caixa e alguns aliases explícitos, nunca palpites por posição.
Obrigatórios: NUMERO DA RC, OS, MÊS COMPETENCIA, VALORES, STATUS e OBSERVAÇÃO.
Campos opcionais ausentes ficam vazios; não são preenchidos na base.
3. Autorizar e testar
No seletor de funções, escolha
testarConexao
.
Clique em
Executar
.
Autorize a leitura com uma conta que tenha acesso à planilha.
Confira o
Registro de execução
.
Na cópia analisada em 16/10/2026, eram esperados:
Versão:
2.0.0
;
Registros:
377
;
RCs distintas:
330
;
Registros sem RC:
1
;
NF lançada:
248
;
Valores inválidos:
0
.
Se a base foi alterada depois, as contagens podem mudar. Não altere a base para forçar esses resultados.
As políticas do Workspace podem exigir aprovação do administrador. Autorize apenas depois de conferir o projeto/código; não contorne políticas da organização.
4. Publicar a versão
Se já existe uma implantação
Implantar → Gerenciar implantações
.
Clique no lápis da implantação do cockpit.
Em versão, selecione
Nova versão
.
Clique em
Implantar
.
Abra/recarregue a URL terminada em
/exec
.
Se é um projeto novo
Implantar → Nova implantação
.
Tipo:
App da Web
.
Para o teste,
Executar como: Eu
.
Quem pode acessar: Somente eu
.
Implante e abra a URL
/exec
.
Atualizar
dentro da tela atualiza os dados, não o código da implantação. Se ainda aparecer a versão antiga, confira a implantação e o endereço acessado. A versão aparece no rodapé.
5. Segurança de acesso
O código é somente leitura, mas isso não equivale a controle de acesso por área.
Ao executar
como você
, quem puder abrir o aplicativo receberá os dados com as permissões da sua conta.
Filtros e paginação acontecem no navegador: os usuários autorizados recebem o conjunto completo de registros.
Comece com
Somente eu
. Não publique a base corporativa para qualquer pessoa.
Para equipe, defina se cada pessoa executará com a própria conta e acesso à planilha, ou se haverá acesso corporativo restrito e uma camada explícita de autorização. As opções dependem da conta/organização.
Não há RBAC, listas de usuários autorizados por área, edição ou auditoria de usuário nesta versão.
O aplicativo não remove permissões dos documentos nem contorna o login do Drive/Coupa.
O código não usa
XFrameOptionsMode.ALLOWALL
. A incorporação em Sites não faz parte desta entrega e deve ser avaliada separadamente, com a política de acesso.
Indicadores e regras
Todos os indicadores respeitam o resultado filtrado:
Indicador
Regra
RCs distintas
Quantidade de identificadores RC preenchidos e diferentes.
Registros
Quantidade de linhas preenchidas preservadas.
Valor dos registros
Soma dos valores válidos das linhas filtradas.
NF lançada
Quantidade de linhas cuja observação contém
NF Lançada
; abaixo, soma dos valores dessas linhas.
Status finalizado
Linhas cujo STATUS normalizado é FINALIZADO; percentual sobre as linhas filtradas.
Em andamento
Linhas com status preenchido, exceto FINALIZADO e CANCELADO; inclui NF Recebida, aprovações e demais estados. Não representa necessariamente pendência atrasada.
NF lançada não confirma pagamento.
O indicador independe de STATUS/FORSETI.
Os valores são somados por registro, com arredondamento por linha a centavos, em BRL. Se um rateio repetir o valor integral da OS em mais de uma linha, a soma também repetirá o valor. Nenhum total consolidado por OS/RC é inferido.
Valores vazios/inválidos não são convertidos silenciosamente em um valor financeiro: aparecem como inválidos, são avisados e não entram na soma. Números nativos do Sheets e textos no padrão brasileiro são aceitos. A coluna não tem moedas distintas.
A identificação individual usa
gid + número da linha da leitura
. É suficiente para consulta sem edição, mas não é ID persistente: inserir/reordenar linhas muda essa referência. Uma evolução com edição/histórico exigirá ID imutável. Atualizar a base fecha os detalhes de uma leitura anterior.
Filtros e busca
Competência, status da RC, squad, tipo, Forseti e NF lançada.
Em
Mais filtros
: fornecedor, PEP/CC, frente orçamentária, presença de número RC e período de criação.
Campos vazios podem ser selecionados como
Não informada(o)
.
Cada palavra da busca deve aparecer em algum dos campos pesquisáveis (RC, OS, solicitante, aprovadores, fornecedor, squad, PEP/CC, conta, pedido, folha, NF, observação, Forseti, frente, tipo e competência).
Busca ignora acentos/caixa. Usa a mesma regra em cards/tabela e contadores.
Os contadores dos botões de status consideram os demais filtros, ignorando apenas o status selecionado. Isso facilita trocar de status sem perder o contexto.
As opções dos selects mostram os valores da base completa. Não são listas em cascata que apagam escolhas automaticamente.
Período filtra DATA CRIADA, não vencimento. Registros sem data válida não entram em um intervalo ativo.
Competência é o texto da base; o ano não é inferido. Vencimento é completamente desconsiderado.
Exportação CSV
Exporta
todas as linhas filtradas
, na ordenação escolhida, não apenas a página visível. Usa UTF-8 com BOM, separador
;
, escape de aspas e proteção contra fórmulas em campos textuais.
Se o Excel não separar corretamente, use importação UTF-8 com delimitador ponto e vírgula. Para preservar zeros à esquerda de identificadores, importe essas colunas como texto. Identificadores são exportados conforme exibidos pela planilha; formatos numéricos existentes no Sheets continuam relevantes.
Links de RC e NF
O backend aceita URLs HTTP/HTTPS:
Texto da célula com URL;
Hiperlink da célula ou dos trechos de texto rico;
Fórmula HYPERLINK/HIPERLINK com primeiro argumento literal entre aspas;
Template opcional com
{id}
configurado no Code.gs.
RC: coluna NUMERO DA RC.
NF: prioridade para Link NF, depois Numero NF.
Templates permanecem vazios para não inventar domínio nem padrão de endereço. Após confirmar o padrão real do seu sistema, você pode configurá-los.
Fórmulas com URL montada por concatenação não são interpretadas como linguagem; se o link não for disponibilizado pelo texto rico, use URL literal ou template.
O número sem URL continua visível como texto.
Ver NF
pode abrir uma explicação de que o link não está disponível.
O visualizador incorpora somente URLs de arquivo reconhecidas do Google Drive, após clicar em
Carregar prévia do Drive
. Outros portais são abertos em nova guia.
Permissões, cookies e políticas de incorporação podem bloquear a prévia; o botão
Abrir NF
permanece como alternativa. Prévia não garante reprodução de todo tipo de arquivo.
Prévia visual fornecida separadamente
Previa-Cockpit-RCs-v2.html
permite experimentar o layout e filtros com uma cópia estática dos registros analisados. Ela exibe um aviso explícito de prévia. Não consulta nem atualiza a planilha.
Não cole a prévia no Apps Script.
Use
index.html
/
index.html.txt
do pacote. A prévia contém dados da base; não a publique ou compartilhe sem autorização. O visualizador da conversa pode bloquear downloads/nova guia; baixar e abrir a prévia no navegador permite testar esses recursos localmente.
Limites e validação final
Nenhum arquivo foi instalado ou implantado automaticamente na sua conta.
Os testes locais e de navegador passaram; OAuth, Google Sheets real e implantação precisam de validação no seu ambiente.
A base é lida integralmente; a paginação limita a renderização, não a transferência dos dados. Grandes volumes/concorrência exigirão testes e possível paginação no servidor.
Sem promessa de latência zero. O indicador
tempoServidorMs
do teste mede somente a execução da leitura, não o tempo total de carregamento.
Sem cache persistente ou dados locais de fallback na implantação. Em falha de atualização, a última leitura em memória fica visível com aviso.
Sem consulta a sistemas externos, validação fiscal automática, processos BPMN, planos de ação ou módulos futuros implementados.
Open