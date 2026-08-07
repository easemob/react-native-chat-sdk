const path = require('path');
const { getConfig } = require('react-native-builder-bob/babel-config');
const pkg = require('../package.json');

const root = path.resolve(__dirname, '..');

module.exports = getConfig(
  {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      // 打包期内联 process.env.API_SCRIPT / API_CONFIG（自动化脚本模式用）
      require.resolve('./babel-plugin-inline-api-env.js'),
    ],
  },
  { root, pkg }
);
