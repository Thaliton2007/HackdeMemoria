Cockpit RCs v2.1.0 — alterações e instalação
Alterações solicitadas
Contagens corretas:
os botões de status descrevem o resultado atual completo. Uma combinação sem registros mostra zero, sem voltar ao total geral. Indicadores e CSV seguem o mesmo resultado.
Valores grandes:
o indicador ajusta a fonte ao espaço disponível, mantendo o valor integral; se necessário, permite quebra de linha em vez de cortar/abreviar o número. Recalcula ao redimensionar a janela.
Filtros compactos:
busca, competência e squad são os principais. Tipo, Forseti, NF lançada, fornecedor, PEP/CC, frente, presença de RC e datas ficam em
Mais filtros
. Os status ficam em uma linha com rolagem própria quando necessário.
Listas contextuais:
squads e demais selects mostram opções com registros dentro dos outros filtros. Não exibem toda a base indiscriminadamente. A opção já escolhida, se ficar incompatível, permanece com
(0)
para não apagar a escolha silenciosamente.
Campos retirados:
aprovador RC e conta contábil não são lidos no modelo, não aparecem nos detalhes, na busca nem no CSV. A planilha original não é alterada. Aprovadores Coupa permanecem.
Links:
RC abre o hyperlink da célula em outra guia. NF pode abrir uma prévia no aplicativo, respeitando as permissões do arquivo.
Tema claro:
botão no cabeçalho alterna claro/escuro. Escolha salva somente no navegador, quando o armazenamento estiver permitido. Não exige chamadas extras ao servidor.
Clique direto:
clicar no corpo do card ou na linha da tabela abre os detalhes. Enter/Espaço no item focado também abre. Links RC e botões NF têm ações independentes, sem abrir os detalhes por acidente. Selecionar texto não deve disparar a abertura do item.
Regras das contagens
Botão
Todos
e indicadores: quantidade do resultado atual, incluindo o status selecionado.
Cada botão de status: quantidade daquele status dentro do resultado atual. Ao selecionar FINALIZADO, outros status mostram zero; os botões continuam clicáveis para trocar o status. Clique Todos para retirar esse filtro.
Selects: as contagens de opções consideram todos os outros filtros, ignorando apenas o próprio select para permitir alternativas válidas. A opção selecionada mostra o número de registros do seu contexto.
Todos os números ao lado das opções representam
linhas/registros
, não RCs distintas nem valores monetários.
Caso uma seleção incompatível permaneça com
(0)
, altere-a ou use Limpar. Nenhum filtro é apagado automaticamente para forçar resultado.
RC e NF: funcionamento e limites
São reconhecidos URLs HTTP/HTTPS, hyperlinks de célula ou de trechos de texto e fórmulas HYPERLINK/HIPERLINK com URL literal. RC usa NUMERO DA RC; NF prioriza Link NF e depois Numero NF. Nenhum endereço fictício é montado.
Número da RC com hyperlink: abre em outra guia, preservando a sessão/permissão do sistema de origem.
Número da NF ou Ver NF: abre a janela da nota correspondente àquela linha/parcela.
Link de arquivo do Google Drive reconhecido: convertido para
/preview
e incorporado quando a NF é aberta, sem clique adicional e sem iniciar download pelo aplicativo.
Outros portais: botão Abrir NF para consulta externa. Não há garantia de prévia para portais que bloqueiem iframe ou forcem download.
O botão Abrir NF permanece como alternativa se o Drive pedir autenticação ou bloquear cookies/incorporação. Não foi feito download/cópia de documentos privados.
A base anonimizada da conversa não tem URLs reais. A extração foi validada com hyperlinks simulados, mas é necessário conferir um link verdadeiro no seu ambiente. Não é necessário ampliar permissões do script para ler arquivos no Drive: a leitura é do hyperlink no Sheets e a exibição continua sujeita à conta do usuário.
Instalar a atualização
A pasta
Inicialização
foi atualizada e continua contendo somente:
text
Code.gs
index.html
appsscript.json
No Apps Script, substitua
todo
o conteúdo de Código.gs/Code.gs pelo novo
Code.gs
.
Substitua todo o conteúdo do HTML
index
pelo novo
index.html
. O nome permanece
index
, com i minúsculo.
O manifesto não mudou; o arquivo do pacote mantém apenas permissão de leitura da planilha.
Salve, execute
testarConexao
e confira a versão
2.1.0
.
Implantar → Gerenciar implantações → lápis → Nova versão → Implantar
.
Feche a guia antiga e abra a URL /exec da implantação atualizada.
Confira
v2.1.0
no rodapé.
As cópias
.txt
são apenas alternativas para copiar o código sem renderização. Não crie os arquivos TXT dentro do Apps Script nem misture código antigo com novo. Não use a prévia estática como HTML da implantação.
Testes feitos
Backend/DOM: 377 registros preservados, 330 RCs distintas e 248 linhas com NF lançada na cópia analisada.
Contexto de squads por competência e fornecedor; redução das listas de opções.
Busca sem resultado: indicadores e contadores zeram; a seleção incompatível permanece
(0)
.
Botões de status respeitam o resultado atual.
Campos removidos dos detalhes e CSV.
Clique no corpo do card, na linha, no botão NF e no link RC; acionamento por teclado.
Prévia de NF com URL simulada de arquivo do Drive; iframe removido ao fechar a janela.
Tema claro/escuro, persistência no navegador e interface sem dependências remotas.
Chromium: larguras 320, 360, 390, 700, 768, 1024, 1280, 1440, 1451, 1600 e 1920 px, sem transbordamento horizontal da página ou dos indicadores.
Teste de valor extremo
R$ 9.999.999.999.999,99
no indicador: permanece dentro do cartão.
Painel de filtros fechado mediu 141 px de altura na janela desktop de 1600 px usada no teste.
Mantida a compilação de compatibilidade da v2.0.2: sem template literals, arrow functions, optional chaining ou Unicode literal nos blocos JavaScript finais.
O que não foi feito
Não houve alteração de dados na planilha, instalação remota ou publicação na conta Google.
Não houve teste de permissões/documentos reais na implantação. A prévia do Drive foi validada estruturalmente com URL simulada; permissões e políticas precisam de validação na conta do usuário.
Não há orçamento/desembolso, deduplicação, consulta a Coupa/Forseti ou processamento fiscal automático.
Paginação e filtros continuam no navegador. Todo o conjunto de dados é recebido pelas pessoas autorizadas; filtros não são controle de acesso. Mantenha a implantação restrita ao público autorizado.
A prévia visual separada contém uma cópia estática da base e exibe esse aviso. Não a publique ou compartilhe sem autorização.
Open