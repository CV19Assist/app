module.exports = {
  require: ['@babel/register', './scripts/testSetup'],
  file: ['./scripts/testTeardown.js'],
  recursive: true
}