import { describe, expect, it } from 'vitest';
import { canFormatCode, codeLanguages, codeThemes, DEFAULT_CODE_LANGUAGE, isWithinCodeInputLimit, MAX_CODE_INPUT_BYTES } from '@/lib/tools/code-languages';
import { CodeFormatError, formatCode } from '@/lib/tools/code-formatter';

const perlAssets = new URL('../../public/', import.meta.url).href;

describe('code formatter options', () => {
  it('lists the requested languages and selectable color themes', () => {
    expect(codeLanguages.map(({ id }) => id)).toEqual(['c', 'csharp', 'cpp', 'css', 'go', 'html', 'java', 'javascript', 'perl', 'php', 'python', 'ruby', 'sql', 'typescript']);
    expect(codeThemes.map(({ id }) => id)).toEqual(['github-light', 'monokai', 'dracula', 'nord', 'solarized-dark']);
    expect(DEFAULT_CODE_LANGUAGE).toBe('java');
  });

  it('enforces the UTF-8 byte limit and enables formatting for every listed language', () => {
    expect(isWithinCodeInputLimit('a'.repeat(MAX_CODE_INPUT_BYTES))).toBe(true);
    expect(isWithinCodeInputLimit('a'.repeat(MAX_CODE_INPUT_BYTES + 1))).toBe(false);
    expect(isWithinCodeInputLimit('가'.repeat(MAX_CODE_INPUT_BYTES / 3))).toBe(true);
    expect(isWithinCodeInputLimit('가'.repeat(MAX_CODE_INPUT_BYTES / 3 + 1))).toBe(false);
    expect(codeLanguages.every(({ id }) => canFormatCode(id))).toBe(true);
  });

  it('formats TypeScript with the selected indentation width', async () => {
    const typescript = await formatCode('type A={x:number};const a:A={x:1}', 'typescript', 2);
    expect(typescript).toContain('const a: A = {');
  });

  it('formats languages using Prettier, Ruff, gofmt, Ruby, and SQL locally', async () => {
    expect(await formatCode('function f(){return 1}', 'javascript', 2)).toContain('return 1;');
    expect(await formatCode('.card{color:red;padding:2px}', 'css', 2)).toContain('padding: 2px;');
    expect(await formatCode('<main><h1>Hello</h1></main>', 'html', 2)).toContain('<h1>');
    expect(await formatCode('<?php echo 1;', 'php', 2)).toContain('<?php');
    expect(await formatCode('def f(x):\n return x+1', 'python', 2)).toContain('return x + 1');
    expect(await formatCode('package main\nfunc main(){fmt.Println(1)}', 'go', 4)).toContain('func main() {');
    expect(await formatCode('class A\n def f\n@x=1\n end\nend', 'ruby', 2)).toContain('  def f');
    expect(await formatCode('select id,name from users where id=1', 'sql', 4)).toContain('    id,');
  });

  it('formats Perl blocks and nested blocks while preserving Unicode, heredocs, strings, and line endings', async () => {
    const perl = await formatCode('my $name="한글";if($ok){print $name;}', 'perl', 2, perlAssets);
    expect(perl).toBe('my $name = "한글";\nif ($ok) {\n  print $name;\n}');

    const nested = await formatCode('if($ok){if($ready){print "yes";}print "done";}', 'perl', 4, perlAssets);
    expect(nested).toContain('\n    if ($ready) {\n        print "yes";\n    }\n    print "done";\n');

    const commented = await formatCode('if($ok){# keep comment\nprint 1;\n}', 'perl', 2, perlAssets);
    expect(commented).toContain('if ($ok) { # keep comment\n  print 1;\n}');

    const heredoc = await formatCode("if ($ok) { print <<'EOF';\n  keep spacing\nEOF\n}", 'perl', 2, perlAssets);
    expect(heredoc).toContain("  print <<'EOF';\n  keep spacing\nEOF\n}");

    const multilineString = await formatCode('if($ok){my $text="first\n    keep interior spacing";print $text;}', 'perl', 2, perlAssets);
    expect(multilineString).toContain('    keep interior spacing";');

    const crlf = await formatCode('if($ok){\r\nprint 1;\r\n}', 'perl', 2, perlAssets);
    expect(crlf).toContain('\r\n  print 1;\r\n');
  });

  it('rejects Perl syntax errors without returning a changed document', async () => {
    await expect(formatCode('if ($ok) { print 1;', 'perl', 2, perlAssets)).rejects.toMatchObject({ code: 'format-failed' });
  });

  it('rejects empty and oversized input with stable error codes', async () => {
    await expect(formatCode('  ', 'java', 2)).rejects.toMatchObject({ code: 'empty-input' });
    await expect(formatCode('x'.repeat(MAX_CODE_INPUT_BYTES + 1), 'java', 2)).rejects.toMatchObject({ code: 'too-large' });
    await expect(formatCode('function (', 'javascript', 2)).rejects.toBeInstanceOf(CodeFormatError);
  });
});
