const MAX_INPUT_BYTES = 1024 * 1024;

export type CsvDelimiter = ',' | '\t' | ';';
export type CsvJsonDirection = 'csv-to-json' | 'json-to-csv';

export class CsvJsonToolError extends Error {
  constructor(readonly code: 'empty' | 'too-large' | 'invalid-delimiter' | 'invalid-csv' | 'invalid-json' | 'invalid-shape' | 'invalid-headers') {
    super(code);
    this.name = 'CsvJsonToolError';
  }
}

function assertSize(value: string) {
  if (new TextEncoder().encode(value).byteLength > MAX_INPUT_BYTES) throw new CsvJsonToolError('too-large');
}

function assertDelimiter(delimiter: string): asserts delimiter is CsvDelimiter {
  if (delimiter !== ',' && delimiter !== '\t' && delimiter !== ';') throw new CsvJsonToolError('invalid-delimiter');
}

export function parseCsv(input: string, delimiter: CsvDelimiter = ','): string[][] {
  assertDelimiter(delimiter);
  assertSize(input);
  const text = input.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let afterQuote = false;
  let endedWithNewline = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (inQuotes) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
          afterQuote = true;
        }
      } else if (character === '\r' || character === '\n') {
        if (character === '\r' && text[index + 1] === '\n') index += 1;
        field += '\n';
      } else {
        field += character;
      }
      endedWithNewline = false;
      continue;
    }

    if (afterQuote && character !== delimiter && character !== '\r' && character !== '\n') {
      throw new CsvJsonToolError('invalid-csv');
    }
    if (character === delimiter) {
      row.push(field);
      field = '';
      afterQuote = false;
      endedWithNewline = false;
    } else if (character === '\r' || character === '\n') {
      if (character === '\r' && text[index + 1] === '\n') index += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      afterQuote = false;
      endedWithNewline = true;
    } else if (character === '"') {
      if (field.length > 0 || afterQuote) throw new CsvJsonToolError('invalid-csv');
      inQuotes = true;
      endedWithNewline = false;
    } else {
      field += character;
      endedWithNewline = false;
    }
  }

  if (inQuotes) throw new CsvJsonToolError('invalid-csv');
  if (!endedWithNewline && (row.length > 0 || field.length > 0 || afterQuote)) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

export function csvToJson(input: string, delimiter: CsvDelimiter = ',') {
  if (!input.trim()) throw new CsvJsonToolError('empty');
  const rows = parseCsv(input, delimiter).filter((row) => !(row.length === 1 && row[0] === ''));
  if (!rows.length || !rows[0].length) throw new CsvJsonToolError('invalid-headers');
  const headers = rows[0];
  if (headers.some((header) => !header.trim()) || new Set(headers).size !== headers.length) {
    throw new CsvJsonToolError('invalid-headers');
  }

  const objects = rows.slice(1).map((values) => {
    if (values.length !== headers.length) throw new CsvJsonToolError('invalid-csv');
    return Object.fromEntries(headers.map((header, index) => [header, values[index]]));
  });
  return JSON.stringify(objects, null, 2);
}

function csvCell(value: string, delimiter: CsvDelimiter) {
  return value.includes(delimiter) || /["\r\n]/.test(value) || /^\s|\s$/.test(value)
    ? `"${value.replaceAll('"', '""')}"`
    : value;
}

function csvValue(value: unknown) {
  if (value !== null && typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function jsonToCsv(input: string, delimiter: CsvDelimiter = ',') {
  assertDelimiter(delimiter);
  if (!input.trim()) throw new CsvJsonToolError('empty');
  assertSize(input);

  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    throw new CsvJsonToolError('invalid-json');
  }
  if (!Array.isArray(parsed) || parsed.some((item) => item === null || typeof item !== 'object' || Array.isArray(item))) {
    throw new CsvJsonToolError('invalid-shape');
  }
  const records = parsed as Record<string, unknown>[];
  const headers = [...new Set(records.flatMap((record) => Object.keys(record)))];
  if (!headers.length) throw new CsvJsonToolError('invalid-shape');
  const lines = [headers, ...records.map((record) => headers.map((header) => (
    Object.prototype.hasOwnProperty.call(record, header) ? csvValue(record[header]) : ''
  )))];
  return lines.map((values) => values.map((value) => csvCell(value, delimiter)).join(delimiter)).join('\r\n');
}

export function convertCsvJson(input: string, direction: CsvJsonDirection, delimiter: CsvDelimiter = ',') {
  return direction === 'csv-to-json' ? csvToJson(input, delimiter) : jsonToCsv(input, delimiter);
}
