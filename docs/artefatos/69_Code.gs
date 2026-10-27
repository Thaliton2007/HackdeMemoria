/**
 * COCKPIT PROCESSOS • RCs • v2.0.0
 * Somente leitura. Preserva cada parcela/rateio, inclusive linhas sem RC.
 * Frontend: arquivo HTML chamado index (i minúsculo).
 */
const APP_CONFIG = Object.freeze({
  SPREADSHEET_ID: '1zuP_DisCRgGizS6aTlsFjA9iEcklFKGsveFC4JneqvY',
  SHEET_ID: 0,
  HEADER_ROW: 1,
  // Preencha somente se confirmar o padrão real. {id} recebe o identificador.
  RC_URL_TEMPLATE: '',
  NF_URL_TEMPLATE: ''
});

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Cockpit Processos • RCs')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** Endpoint público chamado pelo frontend; não modifica a base. */
function getCockpitData() {
  const startedAt = Date.now();
  try {
    const book = SpreadsheetApp.openById(APP_CONFIG.SPREADSHEET_ID);
    const sheet = book.getSheets().find(s => s.getSheetId() === APP_CONFIG.SHEET_ID);
    if (!sheet) throw new Error('A aba gid=' + APP_CONFIG.SHEET_ID + ' não existe nesta planilha. Confira SHEET_ID.');
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow < APP_CONFIG.HEADER_ROW || !lastCol) throw new Error('O cabeçalho não foi encontrado: a aba está vazia.');
    const range = sheet.getRange(APP_CONFIG.HEADER_ROW, 1, lastRow - APP_CONFIG.HEADER_ROW + 1, lastCol);
    const values = range.getValues();
    const display = range.getDisplayValues();
    const headers = display[0].map(normalizeText_);
    const aliases = {
      rc: ['NUMERO DA RC', 'NÚMERO DA RC', 'RC', 'Nº RC'],
      created: ['DATA CRIADA', 'DATA CRIAÇÃO', 'DATA DE CRIAÇÃO'],
      creationMonth: ['MÊS CRIAÇÃO ID', 'MÊS CRIAÇÃO'],
      competence: ['MÊS COMPETENCIA', 'MÊS DE COMPETÊNCIA', 'COMPETÊNCIA'],
      os: ['OS', 'ORDEM DE SERVIÇO'], supplier: ['FORNECEDOR'], squad: ['SQUAD'],
      amount: ['VALORES', 'VALOR'], costCenter: ['PEP/CC', 'PEP / CC'],
      account: ['CONTA CONTABIL'], requestedBy: ['EM NOME DE...', 'SOLICITANTE'],
      approver: ['APROVADOR RC'], coupaApprovers: ['APROVADORES COUPA'],
      status: ['STATUS'], type: ['TIPO'], order: ['PEDIDO'], sheet: ['FOLHA'],
      nfLink: ['Link NF'], nf: ['Numero NF', 'NÚMERO DA NF'],
      budget: ['FRENTE ORÇAMENTARIA'], notes: ['OBSERVAÇÃO'], forseti: ['FORSETI']
    };
    const columns = {};
    Object.keys(aliases).forEach(key => {
      columns[key] = -1;
      aliases[key].some(name => {
        const found = headers.indexOf(normalizeText_(name));
        if (found < 0) return false;
        columns[key] = found;
        return true;
      });
    });
    const required = ['rc', 'os', 'competence', 'amount', 'status', 'notes'];
    const missing = required.filter(key => columns[key] < 0);
    if (missing.length) throw new Error('Cabeçalhos obrigatórios ausentes: ' + missing.map(k => aliases[k][0]).join(', ') + '. Nenhuma coluna foi presumida por posição.');

    // Inspeção matricial somente das colunas que podem conter hyperlinks.
    // Não há corte em 2.000 linhas; não há leitura célula a célula.
    const rowCount = display.length - 1;
    const linkData = {};
    const linkColumns = [...new Set([columns.rc, columns.nfLink, columns.nf].filter(c => c >= 0))];
    if (rowCount > 0) linkColumns.forEach(c => {
      const linkRange = sheet.getRange(APP_CONFIG.HEADER_ROW + 1, c + 1, rowCount, 1);
      linkData[c] = { rich: linkRange.getRichTextValues(), formulas: linkRange.getFormulas() };
    });
    const timezone = book.getSpreadsheetTimeZone();
    const rows = [];
    let invalidAmountCount = 0;
    let missingRCCount = 0;
    for (let r = 1; r < display.length; r++) {
      if (display[r].every(v => !String(v).trim())) continue;
      const row = { id: String(sheet.getSheetId()) + ':' + (APP_CONFIG.HEADER_ROW + r), sourceRow: APP_CONFIG.HEADER_ROW + r };
      Object.keys(columns).forEach(key => {
        row[key] = columns[key] < 0 ? '' : String(display[r][columns[key]]).trim();
      });
      const parsed = parseAmount_(values[r][columns.amount]);
      row.amountValid = parsed !== null;
      row.amount = parsed === null ? 0 : parsed;
      row.amountCents = Math.round(row.amount * 100);
      if (!row.amountValid) invalidAmountCount++;
      if (!row.rc) missingRCCount++;
      const rawDate = columns.created >= 0 ? values[r][columns.created] : null;
      row.createdISO = rawDate instanceof Date && !isNaN(rawDate.getTime())
        ? Utilities.formatDate(rawDate, timezone, 'yyyy-MM-dd') : parseDate_(row.created);
      row.nfPosted = /\bnf lancada\b/.test(normalizeText_(row.notes));
      const url = col => col < 0 ? '' : extractUrl_(linkData[col], r - 1, display[r][col]);
      row.rcUrl = url(columns.rc) || templateUrl_(APP_CONFIG.RC_URL_TEMPLATE, row.rc);
      row.nfUrl = url(columns.nfLink) || url(columns.nf) || templateUrl_(APP_CONFIG.NF_URL_TEMPLATE, row.nf);
      delete row.nfLink;
      rows.push(row);
    }
    return { rows: rows, meta: {
      spreadsheetName: book.getName(), sheetName: sheet.getName(), sheetId: sheet.getSheetId(),
      sourceUrl: book.getUrl().split('#')[0] + '#gid=' + sheet.getSheetId(),
      loadedAt: new Date().toISOString(), timezone: timezone, version: '2.0.0',
      invalidAmountCount: invalidAmountCount, missingRCCount: missingRCCount,
      serverMs: Date.now() - startedAt
    } };
  } catch (error) {
    console.error(error);
    throw new Error('Não foi possível ler a base. Confira a conta executora, as permissões e a configuração da planilha/aba. Detalhe: ' + error.message);
  }
}

function normalizeText_(value) {
  return String(value == null ? '' : value).normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
}
function parseAmount_(value) {
  if (typeof value === 'number') return Number.isFinite(value) && Number.isSafeInteger(Math.round(value * 100)) ? value : null;
  let text = String(value == null ? '' : value).replace(/R\$/gi, '').replace(/\s/g, '');
  if (!text) return null;
  if (text.includes(',')) text = text.replace(/\./g, '').replace(',', '.');
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(text)) text = text.replace(/\./g, '');
  if (!/^-?\d+(\.\d+)?$/.test(text)) return null;
  const amount = Number(text);
  return Number.isFinite(amount) && Number.isSafeInteger(Math.round(amount * 100)) ? amount : null;
}
function parseDate_(value) {
  const match = String(value || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return '';
  const date = new Date(Date.UTC(+match[3], +match[2] - 1, +match[1]));
  return date.getUTCFullYear() === +match[3] && date.getUTCMonth() === +match[2] - 1 && date.getUTCDate() === +match[1]
    ? match[3] + '-' + match[2] + '-' + match[1] : '';
}
function safeUrl_(url) {
  const text = String(url || '').trim();
  return /^https?:\/\/[^\s<>"']+$/i.test(text) ? text : '';
}
function extractUrl_(columnData, offset, display) {
  if (columnData) {
    const rich = columnData.rich[offset][0];
    if (rich) {
      const whole = safeUrl_(rich.getLinkUrl());
      if (whole) return whole;
      const runs = rich.getRuns();
      for (let i = 0; i < runs.length; i++) {
        const url = safeUrl_(runs[i].getLinkUrl());
        if (url) return url;
      }
    }
    const match = String(columnData.formulas[offset][0] || '').match(/^=\s*(?:HYPERLINK|HIPERLINK)\s*\(\s*"((?:[^"]|"")+)"/i);
    if (match) {
      const url = safeUrl_(match[1].replace(/""/g, '"'));
      if (url) return url;
    }
  }
  return safeUrl_(display);
}
function templateUrl_(template, id) {
  return template && id ? safeUrl_(template.replace(/\{id\}/g, encodeURIComponent(id))) : '';
}

/** Execute no editor antes de implantar. Registra só metadados e contagens. */
function testarConexao() {
  const result = getCockpitData();
  const rows = result.rows;
  console.log(JSON.stringify({
    versao: result.meta.version, planilha: result.meta.spreadsheetName,
    aba: result.meta.sheetName, gid: result.meta.sheetId, registros: rows.length,
    rcsDistintas: new Set(rows.map(r => r.rc).filter(Boolean)).size,
    semRC: result.meta.missingRCCount,
    nfLancada: rows.filter(r => r.nfPosted).length,
    valoresInvalidos: result.meta.invalidAmountCount,
    tempoServidorMs: result.meta.serverMs
  }, null, 2));
}
