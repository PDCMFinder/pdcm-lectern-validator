import commonConfig from './jest.config';

module.exports = {
  ...commonConfig,
  testRegex: '\\.integration\\.spec\\.ts$',
  coverageDirectory: 'coverage/integration'
};