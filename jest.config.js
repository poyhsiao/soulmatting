/** @type {import('jest').Config} */
module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Root directories for tests
  roots: ['<rootDir>/services', '<rootDir>/packages'],

  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)',
  ],

  // Transform files with ts-jest
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },

  // Preset for ts-jest
  preset: 'ts-jest',

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  collectCoverageFrom: [
    'services/**/*.{ts,js}',
    'packages/**/*.{ts,js}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
    '!**/*.config.{js,ts}',
    '!**/*.test.{js,ts}',
    '!**/*.spec.{js,ts}',
  ],

  // Coverage thresholds (disabled in CI for now)
  ...(process.env.CI ? {} : {
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  }),

  // Module name mapping for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/packages/shared/$1',
    '^@types/(.*)$': '<rootDir>/packages/types/$1',
  },

  // Test timeout
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Global variables
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },

  // Ignore patterns
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/coverage/'],

  // Watch plugins (disabled due to version compatibility)
  // watchPlugins: [
  //   'jest-watch-typeahead/filename',
  //   'jest-watch-typeahead/testname',
  // ],

  // Projects for monorepo
  projects: [
    {
      displayName: 'auth-service',
      testMatch: ['<rootDir>/services/auth/**/*.(test|spec).{js,ts}'],
      setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
    },
    {
      displayName: 'user-service',
      testMatch: ['<rootDir>/services/user/**/*.(test|spec).{js,ts}'],
      setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
    },
    {
      displayName: 'match-service',
      testMatch: ['<rootDir>/services/match/**/*.(test|spec).{js,ts}'],
      setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
    },
    {
      displayName: 'communication-service',
      testMatch: ['<rootDir>/services/communication/**/*.(test|spec).{js,ts}'],
      setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
    },
    {
      displayName: 'notification-service',
      testMatch: ['<rootDir>/services/notification/**/*.(test|spec).{js,ts}'],
      setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
    },
    {
      displayName: 'media-service',
      testMatch: ['<rootDir>/services/media/**/*.(test|spec).{js,ts}'],
      setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
    },
    {
      displayName: 'search-service',
      testMatch: ['<rootDir>/services/search/**/*.(test|spec).{js,ts}'],
      setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
    },
    {
      displayName: 'shared-packages',
      testMatch: ['<rootDir>/packages/**/*.(test|spec).{js,ts}'],
      setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
    },
  ],
};
