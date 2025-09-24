module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/tests/**',
    '!src/types/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  roots: ['<rootDir>/src']
};