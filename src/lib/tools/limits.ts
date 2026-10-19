export const MAX_TEXT_INPUT_BYTES = 1024 * 1024;

export function isWithinInputLimit(input: string) {
  return new TextEncoder().encode(input).byteLength <= MAX_TEXT_INPUT_BYTES;
}
