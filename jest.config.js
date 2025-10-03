module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!node_modules/**',
    '!coverage/**',
    '!jest.config.js',
    '!**/__tests__/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 10000,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  // Suppress console logs during tests
  silent: true,
  verbose: false
};
