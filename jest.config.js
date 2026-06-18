/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  collectCoverageFrom: ['script.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
};
