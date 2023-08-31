import commonConfig from './jest.config';

module.exports = {
  ...commonConfig,
  testRegex: '\\.unit\\.spec\\.ts$',
  coverageDirectory: 'coverage/unit'
};