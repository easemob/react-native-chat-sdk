#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { getExePath } = require('@evilmartians/lefthook/get-exe');

const root = path.resolve(__dirname, '..');
const hooksDir = path.join(root, '.git', 'hooks');

if (process.platform === 'darwin' && fs.existsSync(hooksDir)) {
  const xattrResult = spawnSync(
    'xattr',
    ['-dr', 'com.apple.provenance', hooksDir],
    { stdio: 'inherit' }
  );

  if (xattrResult.status !== 0) {
    process.exit(xattrResult.status ?? 1);
  }
}

const installResult = spawnSync(getExePath(), ['install', '-f'], {
  cwd: root,
  stdio: 'inherit',
});

process.exit(installResult.status ?? 1);
