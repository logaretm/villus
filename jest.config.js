module.exports = {
  setupFilesAfterEnv: ['<rootDir>/packages/villus/test/setup.ts'],
  testMatch: ['**/test/**/*.ts'],
  testPathIgnorePatterns: ['/mocks/', '/dist/', '/helpers/'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest',
    '.*\\.(vue)$': '<rootDir>/node_modules/vue-jest',
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'vue'],
  collectCoverageFrom: ['packages/*/src/**/*.ts'],
  moduleNameMapper: {
    '^@/(.+)$': '<rootDir>/packages/$1/src',
    '^~/(.+)$': '<rootDir>/packages/$1/test',
  },
};
