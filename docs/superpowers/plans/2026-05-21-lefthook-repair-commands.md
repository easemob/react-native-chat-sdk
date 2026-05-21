# Lefthook Repair Commands Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add explicit commands to install Lefthook hooks and repair macOS provenance-locked hooks after `yarn install`.

**Architecture:** Keep dependency installation separate from hook maintenance. Add one script for a normal Lefthook reinstall and one small Node helper that clears `com.apple.provenance` from `.git/hooks` on macOS before reinstalling hooks.

**Tech Stack:** Yarn scripts, Node.js child_process, Lefthook

---

### Task 1: Add hook maintenance commands

**Files:**
- Modify: `package.json`
- Create: `scripts/repair-lefthook-hooks.js`
- Modify: `CONTRIBUTING.md`

- [ ] **Step 1: Add the scripts**

```json
{
  "scripts": {
    "hooks:install": "lefthook install -f",
    "hooks:repair": "node ./scripts/repair-lefthook-hooks.js"
  }
}
```

- [ ] **Step 2: Implement the repair helper**

```js
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
```

- [ ] **Step 3: Document the new commands**

```md
- `yarn hooks:install`: reinstall Lefthook hooks.
- `yarn hooks:repair`: clear macOS provenance from `.git/hooks` and reinstall Lefthook hooks.
```

- [ ] **Step 4: Verify the commands**

Run:

```sh
yarn hooks:install
yarn hooks:repair
```

Expected: both commands complete without errors on a writable `.git/hooks` directory.
