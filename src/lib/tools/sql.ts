import { format } from 'sql-formatter';
import { isWithinInputLimit } from './limits';

export type SqlDialect = 'generic' | 'mysql' | 'mariadb' | 'postgresql' | 'oracle';
export type SqlToolErrorCode = 'too-large' | 'format-failed';

export class SqlToolError extends Error {
  constructor(readonly code: SqlToolErrorCode) {
    super(code);
    this.name = 'SqlToolError';
  }
}

const dialectLanguages: Record<SqlDialect, 'sql' | 'mysql' | 'mariadb' | 'postgresql' | 'plsql'> = {
  generic: 'sql', mysql: 'mysql', mariadb: 'mariadb', postgresql: 'postgresql', oracle: 'plsql',
};

export function formatSql(input: string, dialect: SqlDialect): string {
  if (!isWithinInputLimit(input)) throw new SqlToolError('too-large');
  try {
    return format(input, { language: dialectLanguages[dialect], tabWidth: 2, keywordCase: 'upper' });
  } catch {
    throw new SqlToolError('format-failed');
  }
}
