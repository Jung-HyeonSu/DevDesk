import { describe, expect, it } from 'vitest';
import { jsonToYaml, yamlToJson } from '@/lib/tools/yaml-json';

describe('YAML and JSON conversion', () => {
  it('converts mappings, arrays, and Unicode values in both directions', () => {
    const json = yamlToJson('name: DevDesk\nitems:\n  - 東京\n  - 🌏\n');
    expect(JSON.parse(json)).toEqual({ name: 'DevDesk', items: ['東京', '🌏'] });
    expect(JSON.parse(yamlToJson(jsonToYaml(json)))).toEqual(JSON.parse(json));
  });

  it('preserves multiline strings and quoted numeric strings while resolving plain numbers', () => {
    const json = yamlToJson('message: |\n  first line\n  東京\nquoted: "007"\nnumber: 7\n');
    expect(JSON.parse(json)).toEqual({ message: 'first line\n東京\n', quoted: '007', number: 7 });
  });

  it('supports indentation settings for JSON and YAML output', () => {
    const json = yamlToJson('items: [1, 2]\n', 4);
    expect(json).toContain('\n    "items"');
    const yaml = jsonToYaml('{"items":[1,2]}', 4);
    expect(yaml).toContain('    - 1');
  });

  it('rejects malformed YAML and JSON with distinct errors', () => {
    expect(() => yamlToJson('name: "unterminated\n')).toThrowError(
      expect.objectContaining({ code: 'invalid-yaml' }),
    );
    expect(() => yamlToJson('name: first\nname: second')).toThrowError(
      expect.objectContaining({ code: 'invalid-yaml' }),
    );
    expect(() => jsonToYaml('{broken')).toThrowError(expect.objectContaining({ code: 'invalid-json' }));
  });

  it('allows bounded aliases and rejects alias expansion beyond the limit', () => {
    expect(JSON.parse(yamlToJson('base: &base { value: ok }\ncopy: *base\n'))).toEqual({
      base: { value: 'ok' }, copy: { value: 'ok' },
    });
    const bomb = [
      'a: &a [x]',
      'b: &b [*a, *a]',
      'c: &c [*b, *b]',
      'd: &d [*c, *c]',
      'e: &e [*d, *d]',
      'f: [*e, *e]',
    ].join('\n');
    expect(() => yamlToJson(bomb)).toThrowError(expect.objectContaining({ code: 'too-many-aliases' }));
  });

  it('rejects excessive nested collections and oversized inputs', () => {
    const deep = '['.repeat(101) + '1' + ']'.repeat(101);
    expect(() => yamlToJson(deep)).toThrowError(expect.objectContaining({ code: 'too-deep' }));
    expect(() => jsonToYaml(JSON.stringify({ value: 'x'.repeat(1_100_000) }))).toThrowError(
      expect.objectContaining({ code: 'too-large' }),
    );
    expect(() => yamlToJson('  \n')).toThrowError(expect.objectContaining({ code: 'empty-input' }));
  });
});
