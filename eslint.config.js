import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import globals from 'globals';

// Initialize FlatCompat with required parameters
const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [
  js.configs.recommended,
  // Convert legacy @vue/typescript/recommended config
  ...compat.config({
    extends: [
      'plugin:vue/vue3-essential',
      'eslint:recommended',
      '@vue/typescript/recommended'
    ]
  }),
  // Global settings
  {
    files: ['**/*.{js,ts,vue}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node
      },
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off'
    }
  },
  // Store code must be kept pure - these rules enforce it.
  {
    files: ['src/store/**/*'],
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'window',
          message: 'Do not use `window` in store files. Inject it instead.',
        },
        {
          name: 'localStorage',
          message: 'Do not use `localStorage` directly. Inject it instead.',
        },
        {
          name: 'document',
          message: 'DOM access is forbidden in stores.',
        },
        {
          name: 'navigator',
          message: 'Do not use browser globals in store files.',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            '**/globals', // ⛔ avoid importing from global declarations
            '**/*.d.ts',  // ⛔ prevent accidental import of declaration files
          ],
        },
      ],
    }
  },
  // Ignore patterns
  {
    ignores: ['dist/**', 'node_modules/**', 'playwright-report/**', 'test-results/**', 'research/**']
  }
];