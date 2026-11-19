/**
 * 打包期内联 process.env.API_SCRIPT / process.env.API_CONFIG。
 *
 * 背景：@react-native/babel-preset 0.83 不再内置
 * babel-plugin-transform-inline-environment-variables（已实测：打包后
 * process.env.API_SCRIPT 仍是运行时代码，在 RN 里恒为 undefined），
 * 而项目约定不新增 npm 依赖，因此用这个极简自定义插件只内联这几个变量。
 * `CI_RUN` 是 CI 设备回归测试模式（example/src/ci/）的运行文件设备路径，
 * 与 `API_SCRIPT` 互斥（同时内联属于构建配置错误，见 ci_mode.ts）。
 * `EASEMOB_AGENT` 是多设备测试 agent（example/src/agent/）的控制文件设备路径
 * （非空即开启，reverse 通道；见 example/src/agent/CONTRACT.md）。
 *
 * 用法：API_SCRIPT=/path/script.json npx react-native start
 */
const ENV_NAMES = new Set([
  'API_SCRIPT',
  'API_CONFIG',
  'CI_RUN',
  'EASEMOB_AGENT',
]);

module.exports = function inlineApiEnvPlugin({ types: t }) {
  return {
    name: 'inline-api-env',
    visitor: {
      MemberExpression(path) {
        const node = path.node;
        if (
          node.computed ||
          node.property.type !== 'Identifier' ||
          !ENV_NAMES.has(node.property.name)
        ) {
          return;
        }
        const obj = node.object;
        if (
          obj.type !== 'MemberExpression' ||
          obj.computed ||
          obj.property.type !== 'Identifier' ||
          obj.property.name !== 'env' ||
          obj.object.type !== 'Identifier' ||
          obj.object.name !== 'process'
        ) {
          return;
        }
        const value = process.env[node.property.name];
        path.replaceWith(
          value === undefined
            ? t.identifier('undefined')
            : t.stringLiteral(value)
        );
      },
    },
  };
};
