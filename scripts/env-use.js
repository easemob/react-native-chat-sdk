#!/usr/bin/env node

/**
 * 用法: yarn env:use <cluster>
 *
 * 把 example/src/env.ts.<cluster> 复制为 example/src/env.ts（激活该集群），
 * 并在头部追加来源注释。env.ts.<cluster> 由 yarn env:gettoken 生成。
 */

const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const envDir = path.join(projectRoot, 'example', 'src');
const target = path.join(envDir, 'env.ts');

const cluster = process.argv[2];
if (cluster == null || cluster === '') {
  const candidates = fs
    .readdirSync(envDir)
    .filter((f) => f.startsWith('env.ts.'))
    .map((f) => f.slice('env.ts.'.length));
  console.error('用法: yarn env:use <cluster>');
  console.error(
    candidates.length > 0
      ? `可用集群: ${candidates.join(', ')}`
      : '未找到 env.ts.<cluster> 文件，请先运行 yarn env:gettoken'
  );
  process.exit(1);
}

const source = path.join(envDir, `env.ts.${cluster}`);
if (fs.existsSync(source) === false) {
  console.error(`${source} 不存在，请先运行 yarn env:gettoken`);
  process.exit(1);
}

const header = `// Active cluster: ${cluster} (copied from env.ts.${cluster} at ${new Date().toISOString()})\n`;
fs.writeFileSync(target, header + fs.readFileSync(source, 'utf-8'), 'utf-8');
console.log(`${target} activated (cluster: ${cluster})`);
