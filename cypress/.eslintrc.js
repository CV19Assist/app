module.exports = {
  'extends': '../.eslintrc.js',
  env: {
    mocha: true,
    'cypress/globals': true
  },
  plugins: [
    'cypress',
    'chai-friendly'
  ],
  rules: {
    'no-console': 0,
    'no-unused-expressions': 0,
    'import/prefer-default-export': 0,
    'import/no-extraneous-dependencies': 0,
    'chai-friendly/no-unused-expressions': 2
  }
}