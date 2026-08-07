#!/usr/bin/env node
/*
 * API 文档一键生成脚本（en/cn）
 *
 * 用法：
 *   node scripts/docs/build_api_docs.js <en|cn> [version]
 *     en|cn    文档语言
 *     version  可选，文档标题中的版本号，默认取 package.json 的 version
 *
 * 步骤：
 *   1. 生成 API overview（刷新 docs/rn_api_overview[.zh].md 的 API 表格，
 *      该文件同时是 typedoc 的 --readme 入口，所以必须先跑）
 *   2. typedoc 生成 html 文档到 docs/build/<lang>
 *   3. 后处理：移除源码位置信息和 permalink 图标、标题添加版本号
 *
 * 退出码：0 成功；1 参数错误；子命令失败时以其退出码终止。
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '../..');

const lang = process.argv[2];
if (lang !== 'en' && lang !== 'cn') {
  console.error(
    'usage: node scripts/docs/build_api_docs.js <en|cn> [version]'
  );
  process.exit(1);
}
const version =
  process.argv[3] ?? require(path.join(root, 'package.json')).version;

const overview =
  lang === 'cn' ? 'docs/rn_api_overview.zh.md' : 'docs/rn_api_overview.md';
const outDir = path.join('docs', 'build', lang);

function run(cmd, args) {
  console.log(`\n>>> ${cmd} ${args.join(' ')}`);
  execFileSync(cmd, args, { cwd: root, stdio: 'inherit' });
}

console.log(`build api docs: lang=${lang} version=${version}`);

// Step 1: refresh the API overview (used as typedoc --readme)
run(process.execPath, [
  path.join('scripts', 'docs', 'generate-api-overview.js'),
  '--lang',
  lang,
]);

// Step 2: generate html docs with typedoc
fs.mkdirSync(path.join(root, outDir), { recursive: true });
run(path.join(root, 'node_modules', '.bin', 'typedoc'), [
  '--out',
  outDir,
  '--json',
  path.join('docs', 'build', 'typedoc.json'),
  '--tsconfig',
  './tsconfig.json',
  '--readme',
  overview,
  './src/index.ts',
]);

// Step 3: post-process (strip source locations, add version to title)
run(process.execPath, [
  path.join('scripts', 'update_api_docs.js'),
  version,
  'undefined',
  'easemob',
  lang,
]);

console.log('\ndone.');
