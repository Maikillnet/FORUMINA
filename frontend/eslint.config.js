import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.es2021, ...globals.node },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // Deliberately NOT spreading reactHooks.configs.recommended: v7's
      // "recommended" set bundles the new React Compiler diagnostics
      // (set-state-in-effect, preserve-manual-memoization, ...), which flag
      // this codebase's existing (pre-Compiler) data-fetching patterns
      // wholesale. Those patterns get fixed as part of the Phase 2 refactor,
      // not as a lint-driven rewrite here. Keep just the classic, always-
      // correct hooks rules that catch real mistakes during that refactor.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // This codebase deliberately uses `catch {}` for best-effort/non-critical
      // operations (e.g. "load cached theme from localStorage if valid").
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  {
    files: ['tests/**/*.{js,jsx}', 'vitest.config.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
];
