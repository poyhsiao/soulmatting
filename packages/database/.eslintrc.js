module.exports = {
  extends: ['../../.eslintrc.js'],
  ignorePatterns: [
    'src/generated/**/*',
    'dist/**/*',
    'node_modules/**/*',
    '*.d.ts',
  ],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
