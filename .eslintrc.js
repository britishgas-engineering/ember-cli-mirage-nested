module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: 'eslint:recommended',
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  },
  globals: Object.assign({
    console: true,
    server: true
  }),
  rules: {
    'no-console': 0
  }
};
