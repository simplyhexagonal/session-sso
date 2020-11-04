module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
      "semi": "error",
      "indent": ["error", 2],
      "comma-dangle": ["error", "always"],
      "eol-last": ["error", "always"],
  }
};
