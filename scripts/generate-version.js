#!/usr/bin/env node

const path = require('node:path');
const fs = require('node:fs');

const root = path.resolve(__dirname, '..');

const pak = JSON.parse(
  fs.readFileSync(path.join(root, 'package.json'), 'utf8')
);
const file = path.join(root, 'src', 'version.ts');
console.log(`📝 Generate the ${pak.name}@${pak.version} version file: ${file}`);
const content = `// This file is generated automatically. Please do not edit it manually. If necessary, you can run the 'scripts/bundle-icons.js' script to generate it again.\n
const VERSION = '${pak.version}';
export default VERSION;
`;
fs.writeFileSync(file, content, 'utf-8');
