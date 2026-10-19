import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  ...tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  globalIgnores(['.next/**', 'out/**', 'node_modules/**', 'coverage/**', 'next-env.d.ts']),
]);
