/**
 * 打包期内联 process.env.API_SCRIPT / process.env.API_CONFIG。
 *
 * 背景：@react-native/babel-preset 0.83 不再内置
 * babel-plugin-transform-inline-environment-variables（已实测：打包后
 * process.env.API_SCRIPT 仍是运行时代码，在 RN 里恒为 undefined），
 * 而项目约定不新增 npm 依赖，因此用这个极简自定义插件只内联这两个变量。
 *
 * 用法：API_SCRIPT=/path/script.json npx react-native start
 */
const ENV_NAMES = new Set(['API_SCRIPT', 'API_CONFIG']);

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
