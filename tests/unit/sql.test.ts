import { describe, expect, it } from 'vitest';
import { formatSql, SqlToolError, type SqlDialect } from '@/lib/tools/sql';

describe('SQL formatter', () => {
  it('formats CTEs, joins, CASE expressions, and ordering', () => {
    const input = "with active_users as (select id,name from users where active=1) select u.id,case when p.total is null then 0 else p.total end as total from active_users u left join payments p on p.user_id=u.id where u.name='DevDesk' order by total desc;";
    const result = formatSql(input, 'postgresql');
    expect(result).toContain('WITH\n');
    expect(result).toContain('active_users AS');
    expect(result).toContain('LEFT JOIN payments');
    expect(result).toContain('CASE');
    expect(result).toContain("u.name = 'DevDesk'");
    expect(result).toContain('ORDER BY\n  total DESC');
  });

  it('preserves quoted strings and comments and formats write statements', () => {
    const result = formatSql("-- keep this note\ninsert into messages(id,body) values(1,'select, from -- literal'); update messages set body='changed' where id=1;", 'mysql');
    expect(result).toContain('-- keep this note');
    expect(result).toContain("'select, from -- literal'");
    expect(result).toContain('INSERT INTO');
    expect(result).toContain('messages (id, body)');
    expect(result).toContain('UPDATE messages');
  });

  it.each<SqlDialect>(['generic', 'mysql', 'mariadb', 'postgresql', 'oracle'])('uses the supported %s dialect', (dialect) => {
    expect(formatSql('select id from users where id=1', dialect)).toContain('SELECT');
  });

  it('reports parser errors safely and enforces the shared input limit', () => {
    expect(() => formatSql("select 'unfinished", 'generic')).toThrowError(expect.objectContaining({ code: 'format-failed' }));
    expect(() => formatSql('a'.repeat(1024 * 1024 + 1), 'generic')).toThrowError(SqlToolError);
  });
});
