const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const sourceFile = path.join(
  __dirname,
  '..',
  'modules',
  'cpp',
  'CMakeLists.txt.rn'
);
const destinationFile = path.join(
  __dirname,
  '..',
  'modules',
  'cpp',
  'CMakeLists.txt'
);

fs.copyFileSync(sourceFile, destinationFile);

console.log(chalk.green(`${destinationFile} generated successfully`));
