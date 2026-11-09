import { describe, expect, it } from 'vitest';
import { decodeHtmlEntities, encodeHtmlEntities } from '@/lib/tools/html-entities';

describe('HTML entity conversion', () => {
  it('escapes ampersands before the other HTML text characters', () => {
    expect(encodeHtmlEntities(`& < > " '`)).toBe('&amp; &lt; &gt; &quot; &#39;');
    expect(encodeHtmlEntities('&lt;')).toBe('&amp;lt;');
  });

  it('decodes supported names and decimal or hexadecimal numeric references', () => {
    expect(decodeHtmlEntities('&amp;&apos;&lt;&gt;&nbsp;&quot; &#65; &#x1F600; &#128;')).toBe('&\'<>\u00a0" A 😀 €');
  });

  it('replaces invalid Unicode scalar values and preserves unknown references', () => {
    expect(decodeHtmlEntities('&#0; &#xD800; &#x110000; &eacute;')).toBe('\uFFFD \uFFFD \uFFFD &eacute;');
  });

  it('decodes only one pass', () => {
    expect(decodeHtmlEntities('&amp;lt;')).toBe('&lt;');
  });
});
