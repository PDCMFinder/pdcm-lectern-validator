export default {
    preset: 'ts-jest',
    collectCoverage: true,
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    moduleFileExtensions: ['ts', 'js'],
    transform: {
      '^.+\\.ts$': 'ts-jest',
    },
    testRegex: '\\.spec\\.ts$',
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
    },
    modulePaths: [
      "<rootDir>"
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/"
  ]
  };