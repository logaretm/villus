module.exports = {
  preset: 'ts-jest',
  setupFilesAfterEnv: ['<rootDir>/packages/villus/test/setup.ts'],
  testMatch: ['**/test/**/*.spec.ts'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/mocks/', '/dist/', '/helpers/'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'vue'],
  collectCoverageFrom: ['packages/*/src/**/*.ts'],
  moduleNameMapper: {
    '^@/(.+)$': '<rootDir>/packages/$1/src',
    '^~/(.+)$': '<rootDir>/packages/$1/test',
  },
};
