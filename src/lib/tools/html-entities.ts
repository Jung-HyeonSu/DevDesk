const MAX_INPUT_BYTES = 1024 * 1024;
const namedEntities: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  nbsp: '\u00a0',
  quot: '"',
};
const encodedCharacters: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};
const c1CodePointReplacements: Record<number, number> = {
  0x80: 0x20ac, 0x82: 0x201a, 0x83: 0x0192, 0x84: 0x201e, 0x85: 0x2026, 0x86: 0x2020,
  0x87: 0x2021, 0x88: 0x02c6, 0x89: 0x2030, 0x8a: 0x0160, 0x8b: 0x2039, 0x8c: 0x0152,
  0x8e: 0x017d, 0x91: 0x2018, 0x92: 0x2019, 0x93: 0x201c, 0x94: 0x201d, 0x95: 0x2022,
  0x96: 0x2013, 0x97: 0x2014, 0x98: 0x02dc, 0x99: 0x2122, 0x9a: 0x0161, 0x9b: 0x203a,
  0x9c: 0x0153, 0x9e: 0x017e, 0x9f: 0x0178,
};

export class HtmlEntitiesToolError extends Error {
  constructor(readonly code: 'too-large') {
    super(code);
    this.name = 'HtmlEntitiesToolError';
  }
}

function assertSize(value: string) {
  if (new TextEncoder().encode(value).byteLength > MAX_INPUT_BYTES) throw new HtmlEntitiesToolError('too-large');
}

export function encodeHtmlEntities(input: string) {
  assertSize(input);
  return input.replace(/[&<>"']/g, (character) => encodedCharacters[character]);
}

function decodeNumericEntity(token: string) {
  const hex = token.startsWith('#x') || token.startsWith('#X');
  const numericText = token.slice(hex ? 2 : 1);
  const codePoint = Number.parseInt(numericText, hex ? 16 : 10);
  if (!Number.isFinite(codePoint) || codePoint === 0 || codePoint > 0x10ffff || (codePoint >= 0xd800 && codePoint <= 0xdfff)) {
    return '\uFFFD';
  }
  return String.fromCodePoint(c1CodePointReplacements[codePoint] ?? codePoint);
}

export function decodeHtmlEntities(input: string) {
  assertSize(input);
  return input.replace(/&(#(?:[0-9]+|[xX][\da-fA-F]+)|amp|apos|gt|lt|nbsp|quot);/g, (match, token: string) => {
    if (token.startsWith('#')) return decodeNumericEntity(token);
    return namedEntities[token] ?? match;
  });
}

export function convertHtmlEntities(input: string, direction: 'encode' | 'decode') {
  return direction === 'encode' ? encodeHtmlEntities(input) : decodeHtmlEntities(input);
}
