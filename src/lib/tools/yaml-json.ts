import { parseDocument, stringify } from 'yaml';
import { isWithinInputLimit } from './limits';

export const MAX_YAML_DEPTH = 100;
export const MAX_YAML_ALIASES = 20;

export type YamlJsonErrorCode = 'empty-input' | 'too-large' | 'too-deep' | 'too-many-aliases' | 'invalid-yaml' | 'invalid-json' | 'not-json-compatible';

export class YamlJsonToolError extends Error {
  constructor(readonly code: YamlJsonErrorCode, readonly line?: number, readonly column?: number) {
    super(code);
    this.name = 'YamlJsonToolError';
  }
}

function flowDepth(input: string): number {
  let quote: 'single' | 'double' | null = null;
  let escaped = false;
  let comment = false;
  let depth = 0;
  let maximum = 0;
  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (character === '\n') {
      comment = false;
      if (quote === 'double' && escaped) escaped = false;
      continue;
    }
    if (comment) continue;
    if (quote === 'double') {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') quote = null;
      continue;
    }
    if (quote === 'single') {
      if (character === "'" && input[index + 1] === "'") index += 1;
      else if (character === "'") quote = null;
      continue;
    }
    if (character === '"') { quote = 'double'; continue; }
    if (character === "'") { quote = 'single'; continue; }
    if (character === '#' && (index === 0 || /\s/.test(input[index - 1]))) { comment = true; continue; }
    if (character === '[' || character === '{') {
      depth += 1;
      maximum = Math.max(maximum, depth);
    } else if ((character === ']' || character === '}') && depth > 0) {
      depth -= 1;
    }
  }
  return maximum;
}

function blockDepth(input: string): number {
  const indentLevels: number[] = [];
  let maximum = 0;
  for (const line of input.split(/\r\n?|\n/)) {
    const content = line.trimStart();
    if (!content || content.startsWith('#') || content === '---' || content === '...') continue;
    const indent = line.length - content.length;
    while (indentLevels.length && indentLevels.at(-1)! >= indent) indentLevels.pop();
    indentLevels.push(indent);
    const compactSequence = content.match(/^(?:-\s+)+/)?.[0].match(/-/g)?.length ?? 0;
    maximum = Math.max(maximum, indentLevels.length + compactSequence - (compactSequence ? 1 : 0));
  }
  return maximum;
}

function validateInput(input: string, yaml: boolean): void {
  if (!input.trim()) throw new YamlJsonToolError('empty-input');
  if (!isWithinInputLimit(input)) throw new YamlJsonToolError('too-large');
  const depth = Math.max(flowDepth(input), yaml ? blockDepth(input) : 0);
  if (depth > MAX_YAML_DEPTH) throw new YamlJsonToolError('too-deep');
}

function parseYaml(input: string): unknown {
  let document;
  try {
    document = parseDocument(input, {
      version: '1.2',
      schema: 'core',
      uniqueKeys: true,
      strict: true,
      prettyErrors: true,
      logLevel: 'error',
    });
  } catch (error) {
    if (error instanceof RangeError) throw new YamlJsonToolError('too-deep');
    throw new YamlJsonToolError('invalid-yaml');
  }
  const firstError = document.errors[0];
  if (firstError) {
    const position = (firstError as Error & { linePos?: Array<{ line: number; col: number }> }).linePos?.[0];
    throw new YamlJsonToolError('invalid-yaml', position?.line, position?.col);
  }
  try {
    return document.toJS({ maxAliasCount: MAX_YAML_ALIASES });
  } catch (error) {
    if (error instanceof ReferenceError && /alias/i.test(error.message)) throw new YamlJsonToolError('too-many-aliases');
    if (error instanceof RangeError) throw new YamlJsonToolError('too-deep');
    throw new YamlJsonToolError('not-json-compatible');
  }
}

export function yamlToJson(input: string, indent: 2 | 4 = 2): string {
  validateInput(input, true);
  const value = parseYaml(input);
  let output: string;
  try {
    const serialized = JSON.stringify(value, null, indent);
    if (typeof serialized !== 'string') throw new Error('unsupported root value');
    output = serialized;
  } catch {
    throw new YamlJsonToolError('not-json-compatible');
  }
  if (!isWithinInputLimit(output)) throw new YamlJsonToolError('too-large');
  return output;
}

export function jsonToYaml(input: string, indent: 2 | 4 = 2): string {
  validateInput(input, false);
  let value: unknown;
  try {
    value = JSON.parse(input) as unknown;
  } catch {
    throw new YamlJsonToolError('invalid-json');
  }
  let output: string;
  try {
    output = stringify(value, { indent, aliasDuplicateObjects: false });
  } catch {
    throw new YamlJsonToolError('not-json-compatible');
  }
  if (!isWithinInputLimit(output)) throw new YamlJsonToolError('too-large');
  return output;
}
