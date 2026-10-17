import expoConfig from 'eslint-config-expo/flat.js';

export default [
  {
    ignores: ['dist/**', '.expo/**', 'web-build/**', 'node_modules/**', '.vercel/**'],
  },
  ...expoConfig,
];
