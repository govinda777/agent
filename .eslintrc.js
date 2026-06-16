module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'next/core-web-vitals'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    // General rules
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-require-imports': 'off', // allow require in seed script
    '@typescript-eslint/no-this-alias': 'off', // generated test code uses this alias
    '@typescript-eslint/no-unused-vars': 'off', // many unused vars in generated assets
    'no-unused-vars': 'off',
  },
  overrides: [
    {
      files: ['prisma/seed.js'],
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
      },
    },
    {
      files: ['src/__tests__/**', 'public/test-results/**', 'src/app/api/**/*.ts'],
      rules: {
        '@typescript-eslint/no-this-alias': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'no-unused-vars': 'off',
      },
    },
  ],
};
