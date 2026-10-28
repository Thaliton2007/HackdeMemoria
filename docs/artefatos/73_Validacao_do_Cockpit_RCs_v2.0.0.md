Validação do Cockpit RCs v2.0.0
Data: 16/10/2026.
Resultado geral
Backend validado localmente com API de planilha simulada; frontend testado com DOM simulado e navegador Chromium headless.
Não houve implantação nem autorização na conta Google do usuário.
Os testes usam a cópia da base consultada anteriormente nesta conversa. Não foi feita nova leitura do Google Sheets nesta etapa.
Conferência da base
Item
Resultado
Registros preservados
377
IDs individuais da leitura
377 diferentes
RCs distintas preenchidas
330
Registros sem RC
1
Linhas com NF Lançada na observação
248
Linhas FINALIZADO
252
Linhas com status, exceto FINALIZADO/CANCELADO
120
Valores inválidos na cópia
0
Soma simples dos registros
R$ 189.085.780,00
Essas somas não são orçamento, pagamento ou consolidação por OS/RC.
Regressões corrigidas e verificadas
OS 359 preservada:
sem RC, competência SET, valor R$ 813.002,00. O filtro “Somente sem RC” a localiza.
RC TDG0003869:
sete linhas continuam separadas. Abertura de detalhe usa o ID da linha; valores e referências correspondem a cada parcela clicada. O visualizador de NF usa a mesma identificação individual.
RC alfanumérica contendo RC:
fixture
RC-TESTE
não é descartada como suposto cabeçalho.
Status vazio:
fixture permanece vazia/“Sem status”; não é marcada como FINALIZADO.
Resposta vazia:
uma consulta bem-sucedida com zero registros limpa os dados e indicadores anteriores.
Falha de atualização:
a última leitura é preservada com aviso explícito de falha, sem indicação de dados ao vivo.
Testes do backend
Leitura por ID/gid explícitos, sem fallback para outra planilha/aba.
Exceção compreensível para aba inexistente.
Validação de campo obrigatório ausente, sem fallback por posição.
Seleção apenas do primeiro cabeçalho STATUS.
Somente colunas de link recebem leitura matricial de texto rico/fórmulas.
RC/Link NF/Numero NF sem URLs retornam endereços vazios, não links inventados.
Extração de URL literal HYPERLINK e URL de um trecho de texto rico.
Fixture com 2.001 registros confirma que hyperlinks continuam sendo lidos após a linha 2.000.
Conversão de números nativos e texto monetário brasileiro, inclusive valor negativo.
Valor inválido fica sinalizado e fora da soma.
Data textual válida convertida para ISO; data impossível rejeitada.
URL com protocolo javascript rejeitada.
Aba só com cabeçalho retorna lista vazia com metadados de sucesso.
Testes do frontend
Indicadores: 330 RCs, 377 registros e 248 NF lançada.
Cards e tabela renderizam apenas a página selecionada.
Filtros de status, NF lançada, frente vazia, ausência de RC e início do período.
Limpeza de filtros restaura a base completa.
Ordenação por valor.
Detalhes e referência de NF corretos para as sete linhas da RC repetida.
Paginação avança de 1–12 para 13–24.
CSV completo contém cabeçalho + 377 linhas, apesar da página com 12 registros.
CSV com texto começando por
=
recebe proteção contra fórmula.
Fixture com HTML/script em fornecedor/observação é tratada como texto e não executa.
Link javascript não vira link navegável.
Resposta vazia e falha não causam retenção silenciosa incorreta dos dados.
Testes no Chromium
Navegação real usando a prévia estática da mesma interface:
Carregamento sem erros JavaScript.
Busca por RC repetida retorna sete cards.
Clicar no segundo card abre o registro de R$ 743.098,00, e não o primeiro registro da RC.
Tecla Escape fecha o diálogo.
Alternância cards/tabela e paginação.
Download de CSV iniciado pelo navegador.
Verificações de largura em 320, 360, 390, 700, 701, 768, 1024, 1280, 1440, 1451, 1500, 1600 e 1920 px: sem rolagem horizontal da página, sem transbordamento dos valores dos indicadores e sem transbordamento do rodapé dos cards na base atual.
A tabela possui rolagem horizontal própria por projeto, para preservar colunas em telas pequenas.
Ainda é necessário testar no ambiente Google
Colar Code.gs, index.html e manifesto seguindo INSTALACAO.md.
Executar
testarConexao
com a conta correta e autorizar leitura.
Confirmar ID/gid da base que será usada de fato.
Publicar nova versão para “Somente eu” e abrir a URL /exec.
Confirmar contagens com a planilha atual — ela pode ter mudado desde a cópia analisada.
Abrir uma RC com várias parcelas e conferir o detalhe de cada linha.
Testar hyperlinks reais do Sheets, incluindo a coluna Link NF.
Confirmar permissões/visualização de um documento real no Drive. Nenhum documento privado foi utilizado nos testes de incorporação.
Confirmar que o perfil de implantação não expõe a base para pessoas não autorizadas.
Medir latência/cotas/concorrência com os usuários e volume reais. Não há garantia de latência zero nem teste de carga do Google Apps Script nesta entrega.
Revisão de escopo
Sem escrita no Google Sheets.
Sem deduplicação por RC, OS ou valor.
Sem pagamentos, orçamento, vencimentos ou lógica fiscal presumidos.
Sem módulos futuros funcionando como se já estivessem prontos.
Sem escopo de acesso ao Drive: a aplicação apenas abre URLs de documentos, que continuam sujeitos às permissões originais.
Open