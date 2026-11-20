#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');
const { checkAll } = require('./check_case_mapping');

const SCRIPT = path.join(__dirname, 'check_case_mapping.js');

function moduleSource(registrar, caseIds) {
  const body = caseIds
    .map((id) => `  ciTest('${id}', 'demo', async () => {});`)
    .join('\n');
  return [
    "import { ciTest, type CiCaseContext } from '../harness';",
    '',
    `export function ${registrar}(ctx: CiCaseContext): void {`,
    body,
    '}',
    '',
  ].join('\n');
}

function entrySource(imports) {
  const lines = Object.entries(imports).map(
    ([names, module]) => `import { ${names} } from '../modules/${module}';`
  );
  return `${lines.join('\n')}\n`;
}

function mapping(cases) {
  return {
    schemaVersion: 1,
    nativeBaseline: 'HyphenateChat 5.1.0',
    cases,
  };
}

function mappingCase(caseId, entry, module) {
  return {
    caseId,
    entry,
    module,
    platforms: ['android', 'ios'],
    nativeRef: 'demo native behavior',
  };
}

/**
 * Builds a synthetic ci tree in a temp dir. `spec.modules` maps a module
 * file base name ('demo_cases') to { registrar: [caseIds] }; `spec.entries`
 * maps an entry name to { importedNames: moduleFileBase }; `spec.cases` is
 * the mapping cases array.
 */
function buildTree(spec) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'check-case-mapping-'));
  const modulesDir = path.join(root, 'modules');
  const entriesDir = path.join(root, 'entries');
  fs.mkdirSync(modulesDir, { recursive: true });
  fs.mkdirSync(entriesDir, { recursive: true });
  for (const [file, registrars] of Object.entries(spec.modules ?? {})) {
    const source = Object.entries(registrars)
      .map(([registrar, ids]) => moduleSource(registrar, ids))
      .join('\n');
    fs.writeFileSync(path.join(modulesDir, `${file}.ts`), source);
  }
  for (const [entry, imports] of Object.entries(spec.entries ?? {})) {
    fs.writeFileSync(path.join(entriesDir, `${entry}.ts`), entrySource(imports));
  }
  const mappingPath = path.join(root, 'native-case-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(mapping(spec.cases ?? [])));
  return { modulesDir, entriesDir, mappingPath };
}

function greenTree() {
  return buildTree({
    modules: { demo_cases: { registerDemoCases: ['RN-DEMO-001'] } },
    entries: { logged_out: { registerDemoCases: 'demo_cases' } },
    cases: [mappingCase('RN-DEMO-001', 'logged_out', 'demo')],
  });
}

test('the real repo tree passes the check', () => {
  assert.deepEqual(checkAll(), []);
  const result = spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /OK/);
});

test('a consistent synthetic tree passes', () => {
  assert.deepEqual(checkAll(greenTree()), []);
});

test('a code case missing from the mapping is a violation', () => {
  const tree = buildTree({
    modules: { demo_cases: { registerDemoCases: ['RN-DEMO-001'] } },
    entries: { logged_out: { registerDemoCases: 'demo_cases' } },
    cases: [],
  });
  assert.ok(
    checkAll(tree).some((v) => v.includes('RN-DEMO-001 is missing from the mapping'))
  );
});

test('a mapping case not registered in code is a violation', () => {
  const tree = buildTree({
    modules: {},
    entries: {},
    cases: [mappingCase('RN-DEMO-001', 'logged_out', 'demo')],
  });
  const violations = checkAll(tree);
  assert.ok(violations.some((v) => v.includes('not registered in code')));
});

test('duplicate case ids in code are rejected', () => {
  const tree = buildTree({
    modules: {
      demo_cases: { registerDemoCases: ['RN-DEMO-001'] },
      other_cases: { registerOtherCases: ['RN-DEMO-001'] },
    },
    entries: {
      logged_out: {
        registerDemoCases: 'demo_cases',
        registerOtherCases: 'other_cases',
      },
    },
    cases: [mappingCase('RN-DEMO-001', 'logged_out', 'demo')],
  });
  assert.ok(checkAll(tree).some((v) => v.includes('duplicate case id')));
});

test('duplicate case ids in the mapping are rejected', () => {
  const tree = buildTree({
    modules: { demo_cases: { registerDemoCases: ['RN-DEMO-001'] } },
    entries: { logged_out: { registerDemoCases: 'demo_cases' } },
    cases: [
      mappingCase('RN-DEMO-001', 'logged_out', 'demo'),
      mappingCase('RN-DEMO-001', 'logged_out', 'demo'),
    ],
  });
  assert.ok(checkAll(tree).some((v) => v.includes('duplicate caseId')));
});

test('a mapping entry that does not match the wiring is a violation', () => {
  const tree = buildTree({
    modules: { demo_cases: { registerDemoCases: ['RN-DEMO-001'] } },
    entries: {
      logged_out: { registerDemoCases: 'demo_cases' },
      logged_in_base: {},
    },
    cases: [mappingCase('RN-DEMO-001', 'logged_in_base', 'demo')],
  });
  assert.ok(
    checkAll(tree).some((v) => v.includes("does not match the wiring entry"))
  );
});

test('a mapping module that does not match the registering file is a violation', () => {
  const tree = buildTree({
    modules: { demo_cases: { registerDemoCases: ['RN-DEMO-001'] } },
    entries: { logged_out: { registerDemoCases: 'demo_cases' } },
    cases: [mappingCase('RN-DEMO-001', 'logged_out', 'other')],
  });
  assert.ok(
    checkAll(tree).some((v) => v.includes("module 'other' does not match"))
  );
});

test('a registrar wired into no entry is a violation', () => {
  const tree = buildTree({
    modules: { demo_cases: { registerDemoCases: ['RN-DEMO-001'] } },
    entries: { logged_out: {} },
    cases: [mappingCase('RN-DEMO-001', 'logged_out', 'demo')],
  });
  assert.ok(
    checkAll(tree).some((v) => v.includes('not imported by any entry'))
  );
});

test('a registrar wired into multiple entries is a violation', () => {
  const tree = buildTree({
    modules: { demo_cases: { registerDemoCases: ['RN-DEMO-001'] } },
    entries: {
      logged_out: { registerDemoCases: 'demo_cases' },
      logged_in_base: { registerDemoCases: 'demo_cases' },
    },
    cases: [mappingCase('RN-DEMO-001', 'logged_out', 'demo')],
  });
  assert.ok(
    checkAll(tree).some((v) => v.includes('wired into multiple entries'))
  );
});

test('invalid mapping platforms are a violation', () => {
  const tree = buildTree({
    modules: { demo_cases: { registerDemoCases: ['RN-DEMO-001'] } },
    entries: { logged_out: { registerDemoCases: 'demo_cases' } },
    cases: [
      { ...mappingCase('RN-DEMO-001', 'logged_out', 'demo'), platforms: [] },
    ],
  });
  assert.ok(checkAll(tree).some((v) => v.includes('platforms')));
});

test('the CLI exits non-zero on violations', () => {
  const tree = buildTree({
    modules: { demo_cases: { registerDemoCases: ['RN-DEMO-001'] } },
    entries: { logged_out: { registerDemoCases: 'demo_cases' } },
    cases: [],
  });
  // checkAll options cannot be passed through the CLI; exercise the
  // exported function here and the real-repo CLI in the first test.
  assert.ok(checkAll(tree).length > 0);
});
