module.exports = {
  require: ['@babel/register', './scripts/testSetup'],
  file: ['./scripts/testTeardown.js'],
  timeout: 6000,
  recursive: true
}