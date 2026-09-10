import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    plugins: {
      prettier: (await import('eslint-plugin-prettier')).default,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'object-shorthand': ['error', 'always'],
      'prettier/prettier': 'error',
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off',
      'prefer-template': 'error',
      'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'react/no-array-index-key': 'error',
      'prefer-regex-literals': 'error',
      'no-return-assign': 'error',
      'no-dupe-keys': 'error',
      'no-nested-ternary': 'error',
      'react/self-closing-comp': [
        'error',
        {
          component: true,
          html: true,
        },
      ],
      'react/jsx-curly-brace-presence': [
        'error',
        {
          children: 'ignore',
          propElementValues: 'always',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'node_modules/**',
    'pnpm-lock.yaml',
    'src/generated/**',
  ]),
]);

export default eslintConfig;
