// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';
import a11y from 'eslint-plugin-jsx-a11y';
import { nextJsConfig } from '@ustatop/eslint-config/next-js';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextJsConfig,
  {
    plugins: { 'jsx-a11y': a11y },
    rules: {
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/aria-props': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // TypeScript handles prop validation — react/prop-types is redundant
      'react/prop-types': 'off',
    },
  },
  ...storybook.configs['flat/recommended'],
];
