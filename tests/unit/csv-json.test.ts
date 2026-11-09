import { describe, expect, it } from 'vitest';
import { convertCsvJson, csvToJson, CsvJsonToolError, jsonToCsv, parseCsv } from '@/lib/tools/csv-json';

describe('CSV and JSON conversion', () => {
  it('parses quoted delimiters, escaped quotes, line breaks, CRLF, and a BOM', () => {
    expect(parseCsv('\uFEFFname,note\r\n"Ada, Lovelace","said ""hello""\r\nagain"\r\n')).toEqual([
      ['name', 'note'], ['Ada, Lovelace', 'said "hello"\nagain'],
    ]);
  });

  it('converts CSV cells to strings and handles selectable delimiters', () => {
    expect(csvToJson('id;name\n7;Ada', ';')).toBe('[\n  {\n    "id": "7",\n    "name": "Ada"\n  }\n]');
    expect(convertCsvJson('id\tname\n1\tAda', 'csv-to-json', '\t')).toContain('"name": "Ada"');
  });

  it('exports object arrays with first-seen columns and escaped CSV fields', () => {
    expect(jsonToCsv('[{"id":1,"name":"Ada"},{"id":2,"name":"Grace, Hopper","active":true}]')).toBe(
      'id,name,active\r\n1,Ada,\r\n2,"Grace, Hopper",true',
    );
  });

  it('rejects malformed quoting, uneven rows, and invalid headers', () => {
    expect(() => parseCsv('id,name\n1,"Ada')).toThrowError('invalid-csv');
    expect(() => csvToJson('id,name\n1')).toThrowError('invalid-csv');
    expect(() => csvToJson('id,id\n1,2')).toThrowError('invalid-headers');
    expect(() => csvToJson(',name\n1,Ada')).toThrowError('invalid-headers');
  });

  it('rejects unsupported JSON shapes and malformed JSON', () => {
    expect(() => jsonToCsv('{"id":1}')).toThrowError('invalid-shape');
    expect(() => jsonToCsv('[1,2]')).toThrowError(CsvJsonToolError);
    expect(() => jsonToCsv('{bad}')).toThrowError('invalid-json');
  });
});
