// node scripts/typedoc.js ${version} ${dir} ${agora | easemob}

const fs = require('fs');
const path = require('path');
// const { exit } = require('process');

// Step 1: Delete the contents of all files in the specified directory "xxx"
function deleteContent(dir, xxx) {
  console.log('test:deleteContent:', dir, xxx);
  fs.readdir(dir, (err, files) => {
    if (err) throw err;
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      fs.stat(filePath, (_err, stat) => {
        if (_err) throw _err;
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
    });
  });
}

// Step 2: Replace all file content "aaa" with "bbb"
function replaceContent(dir, aaa, bbb) {
  console.log('test:replaceContent:', dir, aaa, bbb);
  fs.readdir(dir, (err, files) => {
    if (err) throw err;
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      fs.stat(filePath, (_err, stat) => {
        if (_err) throw _err;
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
    });
  });
}

// Call the function, passing in the specified directory path
const dirPath =
  process.argv.at(3) ??
  '/Users/asterisk/Codes/rn/react-native-chat-sdk/docs/typedoc';
const version = process.argv.at(2) ?? 'v1.1.2';
// console.log('test:version:', version);
// console.log('test:dirPath:', dirPath);
// process.exit();

console.log('test:start:');

// Delete content reference `docs/developer.md`
const del1 =
  /<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" class="icon icon-tabler icon-tabler-link" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"><\/path><path d="M10 14a3\.5 3\.5 0 0 0 5 0l4 -4a3\.5 3\.5 0 0 0 -5 -5l-.5 .5"><\/path><path d="M14 10a3\.5 3\.5 0 0 0 -5 0l-4 4a3\.5 3\.5 0 0 0 5 5l\.5 -\.5"><\/path><\/svg>/g;
const del2 =
  /<li>Defined in <a href="https:\/\/github\.com\/easemob\/react-native-chat-sdk(_|\/|\s|[0-9]|[a-z]|[A-Z]|#|\.|"|>|:)+<\/a><\/li>/g;
const title = `class="title">Chat SDK for React Native ${version}</a>`;

deleteContent(dirPath, del1);
deleteContent(dirPath, del2);
replaceContent(dirPath, `class="title">react-native-chat-sdk</a>`, title);

if (process.argv.at(4) === 'agora') {
  replaceContent(dirPath, /react-native-chat-sdk/g, `react-native-agora-chat`);
}

console.log('test:end:');
