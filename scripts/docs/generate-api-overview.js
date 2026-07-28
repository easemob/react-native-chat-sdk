#!/usr/bin/env node
/*
 * API overview 生成脚本
 *
 * 中文 TypeDoc 生成流程的一环，见
 * docs/superpowers/specs/2026-07-14-cn-typedoc-worktree-design.md
 *
 * 职责：扫描 src/ 下文件名含 Chat 的 TypeScript 文件，抽取 export class /
 * export interface 及其 public 方法 / 事件的首行注释，生成 overview 文档中的
 * API 表格正文。不负责翻译；在英文 worktree 运行得到英文表格，在 cn
 * worktree 运行得到中文表格。
 *
 * 用法：
 *   node scripts/docs/generate-api-overview.js --lang cn|en
 *     [--src <目录>] [--cache-dir <目录>] [--overview <文件>]
 *
 * 默认路径（相对于运行时的当前目录，即仓库根目录）：
 *   --src        src
 *   --cache-dir  docs/api-overview-cache
 *   --overview   --lang cn -> docs/rn_api_overview.zh.md
 *                --lang en -> docs/rn_api_overview.md
 *
 * 行为：
 *   1. 同步遍历并排序，输出缓存 output.md（原始扫描结果）。
 *   2. 按固定 class/interface 顺序整理为 output2.md；Listener 小节不保留
 *      自己的 ## 标题，表格并入前一个 Manager/类小节之后。
 *   3. 用 output2.md 替换 overview 文档中第一个 "## " 标题之后的全部内容，
 *      固定头部保持不变。
 *
 * 退出码：0 成功；1 参数错误；2 读写失败。
 */

const fs = require('fs');
const path = require('path');

// 固定输出顺序。新增 Manager/Listener/公共类时需要显式维护此列表。
const FIXED_ORDER = [
  'ChatClient',
  'ChatConnectEventListener',
  'ChatMultiDeviceEventListener',
  'ChatCustomEventListener',
  'ChatManager',
  'ChatMessageEventListener',
  'ChatContactManager',
  'ChatContactEventListener',
  'ChatGroupManager',
  'ChatGroupEventListener',
  'ChatRoomManager',
  'ChatRoomEventListener',
  'ChatPresenceManager',
  'ChatPresenceEventListener',
  'ChatPushManager',
  'ChatUserInfoManager',
  'ChatMessage',
  'ChatConversation',
];

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const key = argv[i];
    if (!key.startsWith('--')) {
      console.error(`无法识别的参数: ${key}`);
      process.exit(1);
    }
    const value = argv[i + 1];
    if (value === undefined || value.startsWith('--')) {
      console.error(`参数缺少值: ${key}`);
      process.exit(1);
    }
    args[key.slice(2)] = value;
    i++;
  }
  if (args.lang !== 'cn' && args.lang !== 'en') {
    console.error('必须指定 --lang cn 或 --lang en');
    process.exit(1);
  }
  return {
    lang: args.lang,
    src: args.src ?? 'src',
    cacheDir: args['cache-dir'] ?? 'docs/api-overview-cache',
    overview:
      args.overview ??
      (args.lang === 'cn'
        ? 'docs/rn_api_overview.zh.md'
        : 'docs/rn_api_overview.md'),
  };
}

// 同步收集文件名含 Chat 的 .ts/.tsx 文件；跳过名称含 _ 的目录（如 __tests__）。
function collectChatFiles(dir) {
  const result = [];
  const entries = fs
    .readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!entry.name.includes('_')) {
        result.push(...collectChatFiles(full));
      }
    } else if (
      entry.isFile() &&
      entry.name.includes('Chat') &&
      (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))
    ) {
      result.push(full);
    }
  }
  return result;
}

// 逐文件解析，返回有序小节列表：
// { name, type: 'class'|'interface', rows: [{key, value}] }
function parseFile(file) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const sections = [];
  let current = null;
  let commentLineNumber = 0;
  let comment = '';

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    if (line.includes('/**')) {
      commentLineNumber = lineNumber + 1;
    }
    if (lineNumber === commentLineNumber) {
      comment = line;
    }
    if (/(\s\*|@link|@url|@param|@throws)/.test(line)) {
      return;
    }

    let m = /^export class [a-zA-Z0-9]+ /.exec(line);
    if (m) {
      const name = m[0].replace('export class', '').trim();
      current = { name, type: 'class', rows: [] };
      sections.push(current);
      return;
    }
    m = /^export interface [a-zA-Z0-9]+ /.exec(line);
    if (m) {
      const name = m[0].replace('export interface', '').trim();
      current = { name, type: 'interface', rows: [] };
      sections.push(current);
      return;
    }
    if (!current) {
      return;
    }

    const value = comment.trim().substring(1).trim();
    if (current.type === 'class') {
      m = /public ((get|set|async|static) )?[a-zA-Z0-9]+\(/.exec(line);
      if (m) {
        const key = m[0]
          .replace(/(get|set|async|static) /g, '')
          .replace(/public /g, '')
          .replace(/\(/g, '')
          .trim();
        current.rows.push({
          key: `{@link ${current.name}.${key} ${key}}`,
          value,
        });
      }
    } else {
      m = /[a-zA-Z0-9]+\??\(/.exec(line);
      if (m) {
        const key = m[0].replace(/\??\(/g, '').trim();
        current.rows.push({
          key: `{@link ${current.name}.${key} ${key}}`,
          value,
        });
      }
    }
  });

  return sections;
}

function renderTable(section) {
  let out = section.type === 'class'
    ? '| Method | Description |\n'
    : '| Event | Description |\n';
  out += '| :----- | :---------- |\n';
  for (const row of section.rows) {
    out += `| ${row.key} | ${row.value} |\n`;
  }
  return out;
}

function renderSection(section, { withTitle }) {
  let out = '';
  if (withTitle) {
    out += `## ${section.name}\n`;
  }
  out += renderTable(section);
  out += '\n';
  return out;
}

function main() {
  const opts = parseArgs(process.argv);

  let files;
  try {
    files = collectChatFiles(opts.src);
  } catch (e) {
    console.error(`扫描源码目录失败: ${opts.src}: ${e.message}`);
    process.exit(2);
  }

  // 1. 按扫描顺序生成 output.md（每个小节都带 ## 标题）
  const scanned = [];
  for (const file of files) {
    try {
      scanned.push(...parseFile(file));
    } catch (e) {
      console.error(`解析文件失败: ${file}: ${e.message}`);
      process.exit(2);
    }
  }
  const byName = new Map(scanned.map((s) => [s.name, s]));
  const rawOutput = scanned
    .map((s) => renderSection(s, { withTitle: true }))
    .join('');

  // 2. 按固定顺序整理为 output2.md；Listener 小节去掉 ## 标题。
  // 空行规则与历史输出保持一致：组内表格之间空一行，
  // 上一个组的最后一行表格与下一个组的 ## 标题之间不空行。
  let orderedOutput = '';
  let rowCount = 0;
  const missing = [];
  for (const name of FIXED_ORDER) {
    const section = byName.get(name);
    if (!section) {
      missing.push(name);
      continue;
    }
    const isListener = name.endsWith('EventListener');
    if (isListener) {
      orderedOutput += '\n' + renderTable(section);
    } else {
      orderedOutput += `## ${section.name}\n` + renderTable(section);
      groupStarted = true;
    }
    rowCount += section.rows.length;
  }
  const extra = scanned
    .map((s) => s.name)
    .filter((name) => !FIXED_ORDER.includes(name));
  if (missing.length > 0) {
    console.warn(
      `警告: 固定顺序列表中的以下条目未在源码中找到: ${missing.join(', ')}`
    );
  }
  if (extra.length > 0) {
    console.warn(
      `警告: 以下小节不在固定顺序列表中，已被丢弃: ${[...new Set(extra)].join(', ')}`
    );
  }

  // 3. 写缓存
  try {
    fs.mkdirSync(opts.cacheDir, { recursive: true });
    fs.writeFileSync(path.join(opts.cacheDir, 'output.md'), rawOutput);
    fs.writeFileSync(path.join(opts.cacheDir, 'output2.md'), orderedOutput);
  } catch (e) {
    console.error(`写入缓存目录失败: ${opts.cacheDir}: ${e.message}`);
    process.exit(2);
  }

  // 4. 回填 overview：保留第一个 "## " 之前的固定头部，替换其余内容
  let head;
  try {
    const content = fs.readFileSync(opts.overview, 'utf8');
    const idx = content.search(/^## /m);
    head = idx >= 0 ? content.slice(0, idx) : content;
  } catch (e) {
    console.error(`读取 overview 文档失败: ${opts.overview}: ${e.message}`);
    process.exit(2);
  }
  try {
    fs.writeFileSync(opts.overview, head + orderedOutput);
  } catch (e) {
    console.error(`写入 overview 文档失败: ${opts.overview}: ${e.message}`);
    process.exit(2);
  }

  console.log(`扫描文件数: ${files.length}`);
  console.log(`抽取小节数: ${scanned.length}`);
  console.log(`输出表格行数: ${rowCount}`);
  console.log(`已更新: ${opts.overview}`);
}

main();
