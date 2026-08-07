// node scripts/typedoc.js ${version} ${dir} ${agora | easemob | shengwang} ${cn|en}

const fs = require('fs');
const path = require('path');
// const { exit } = require('process');

// Step 1: Delete the contents of all files in the specified directory "xxx"
function deleteContent(dir, xxx) {
  console.log('test:deleteContent:', dir, xxx);
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(xxx, '');
      fs.writeFileSync(filePath, content);
    } else if (stat.isDirectory()) {
      if (filePath.includes('assets') === false) {
        deleteContent(filePath, xxx);
      }
    }
  });
}

// Step 2: Replace all file content "aaa" with "bbb"
function replaceContent(dir, aaa, bbb) {
  console.log('test:replaceContent:', dir, aaa, bbb);
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(aaa, bbb);
      fs.writeFileSync(filePath, content);
    } else if (stat.isDirectory()) {
      if (filePath.includes('assets') === false) {
        replaceContent(filePath, aaa, bbb);
      }
    }
  });
}

// Call the function, passing in the specified directory path
const version = process.argv.at(2) ?? 'v1.1.2';
const language = process.argv.at(5) === 'cn' ? 'cn' : 'en';
const type =
  process.argv.at(4) === 'agora'
    ? 'agora'
    : process.argv.at(4) === 'shengwang'
    ? 'shengwang'
    : 'easemob';
const dirPath =
  process.argv.at(3) === 'undefined'
    ? path.join(__dirname, '../docs/build/', language)
    : process.argv.at(3);

console.log('test:version:', version);
console.log('test:dirPath:', dirPath);
console.log('test:type:', type);
console.log('test:language:', language);
// process.exit();

if (!fs.existsSync(dirPath)) {
  console.error(`error: directory not found: ${dirPath}`);
  console.error('hint: run `yarn doc:en` (or `yarn doc:cn`) first.');
  process.exit(1);
}

console.log('test:start:');

// Delete content reference `docs/developer.md`
// typedoc >= 0.28: permalink icons are rendered as
// <a href="#..." aria-label="Permalink" class="tsd-anchor-icon">...</a>
const del1 =
  /<a href="#[^"]*" aria-label="Permalink" class="tsd-anchor-icon">[\s\S]*?<\/a>/g;
// "Defined in <file>:<line>" source locations (with or without a github link)
const del2 = /<ul>\s*<li>Defined in[\s\S]*?<\/li>\s*<\/ul>/g;
// empty <aside class="tsd-sources"> left after removing the "Defined in" list
// (kept when it still contains "Overrides ..." paragraphs)
const del3 = /<aside class="tsd-sources">\s*<\/aside>/g;
const title = `class="title">Chat SDK for React Native ${version}</a>`;

deleteContent(dirPath, del1);
deleteContent(dirPath, del2);
deleteContent(dirPath, del3);
replaceContent(dirPath, `class="title">react-native-chat-sdk</a>`, title);

if (type === 'agora') {
  replaceContent(dirPath, /react-native-chat-sdk/g, `react-native-agora-chat`);
} else if (type === 'shengwang') {
  replaceContent(
    dirPath,
    /react-native-chat-sdk/g,
    `react-native-shengwang-chat`
  );
}

console.log('test:end:');
