#!/usr/bin/env node
/**
 * Static consistency check between the CI case registration code under
 * example/src/ci/ and docs/ci/native-case-mapping.json.
 *
 * Usage:
 *   node scripts/ci/check_case_mapping.js
 *
 * Validations (any violation exits non-zero):
 *   1. Every `ciTest('RN-...')` id in the module files exists exactly once
 *      in the mapping, and no id is registered twice in code.
 *   2. Every mapping caseId exists in code.
 *   3. The mapping `entry` matches the entry file that actually wires the
 *      registrar containing the case. The wiring is derived statically:
 *      each case id is attributed to the nearest preceding
 *      `export function register*()` in its module file, and each entry
 *      file's `import { ... } from '../modules/<file>'` declares which
 *      registrars it wires. A registrar imported by zero or more than one
 *      entry is a violation (dead or ambiguous case).
 *   4. The mapping `module` matches the module file that registers the
 *      case (`app_cases.ts` -> `app`).
 *   5. Mapping shape: schemaVersion/nativeBaseline present; each case has
 *      a `RN-*` caseId, a known entry, a module name, a non-empty
 *      `platforms` subset of android/ios and a `nativeRef` string.
 *
 * Simplification (documented per plan): the entry attribution relies on the
 * two lexical conventions above (cases live inside `register*` functions in
 * modules/*_cases.ts; entries wire them through plain named imports). It
 * does not evaluate re-exports or dynamic registration; harness.ts rejects
 * duplicate ids at registration time as the runtime backstop.
 */

const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '../..');
const MODULES_DIR = path.join(REPO_ROOT, 'example/src/ci/modules');
const ENTRIES_DIR = path.join(REPO_ROOT, 'example/src/ci/entries');
const MAPPING_PATH = path.join(REPO_ROOT, 'docs/ci/native-case-mapping.json');

const PLATFORMS = ['android', 'ios'];
const CASE_ID_PATTERN = /^RN-[A-Z]+-[0-9]+$/;
const REGISTER_PATTERN = /export function (register\w+)\s*\(/g;
const CITEST_PATTERN = /ciTest\(\s*'([^']+)'/g;
const IMPORT_PATTERN =
  /import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*'\.\.\/modules\/([^']+)'/g;

/**
 * Scans one module file. Returns { module, cases: [{ caseId, registrar }] }.
 */
function scanModuleFile(filePath) {
  const base = path.basename(filePath, '.ts');
  const module = base.endsWith('_cases') ? base.slice(0, -'_cases'.length) : base;
  const text = fs.readFileSync(filePath, 'utf8');

  const functions = [];
  for (const match of text.matchAll(REGISTER_PATTERN)) {
    functions.push({ name: match[1], index: match.index });
  }
  const cases = [];
  for (const match of text.matchAll(CITEST_PATTERN)) {
    let registrar = null;
    for (const fn of functions) {
      if (fn.index < match.index) {
        registrar = fn.name;
      } else {
        break;
      }
    }
    cases.push({ caseId: match[1], registrar, file: filePath });
  }
  return { module, cases };
}

/**
 * Scans one entry file. Returns { entry, wiring: { registrar: moduleFile } }.
 */
function scanEntryFile(filePath) {
  const entry = path.basename(filePath, '.ts');
  const text = fs.readFileSync(filePath, 'utf8');
  const wiring = {};
  for (const match of text.matchAll(IMPORT_PATTERN)) {
    const moduleFile = match[2];
    for (const name of match[1].split(',')) {
      const trimmed = name.trim();
      if (trimmed.length > 0) {
        wiring[trimmed] = moduleFile;
      }
    }
  }
  return { entry, wiring };
}

function listFiles(dir, suffix) {
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(suffix))
    .sort()
    .map((name) => path.join(dir, name));
}

/**
 * Runs all checks. Returns an array of violation strings (empty = green).
 */
function checkAll(options = {}) {
  const modulesDir = options.modulesDir ?? MODULES_DIR;
  const entriesDir = options.entriesDir ?? ENTRIES_DIR;
  const mappingPath = options.mappingPath ?? MAPPING_PATH;
  const violations = [];

  let mapping;
  try {
    mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
  } catch (error) {
    return [`mapping not readable: ${mappingPath} (${error.message})`];
  }
  if (mapping.schemaVersion == null) {
    violations.push('mapping: schemaVersion is missing');
  }
  if (typeof mapping.nativeBaseline !== 'string' || mapping.nativeBaseline.length === 0) {
    violations.push('mapping: nativeBaseline is missing');
  }
  const mappingCases = Array.isArray(mapping.cases) ? mapping.cases : [];
  if (!Array.isArray(mapping.cases)) {
    violations.push('mapping: cases must be an array');
  }

  // Mapping shape + duplicates.
  const mappingIds = new Map();
  for (const item of mappingCases) {
    const id = item?.caseId;
    if (typeof id !== 'string' || !CASE_ID_PATTERN.test(id)) {
      violations.push(`mapping: invalid caseId ${JSON.stringify(id)}`);
      continue;
    }
    if (mappingIds.has(id)) {
      violations.push(`mapping: duplicate caseId ${id}`);
    }
    mappingIds.set(id, item);
    if (typeof item.entry !== 'string' || item.entry.length === 0) {
      violations.push(`mapping ${id}: entry is missing`);
    }
    if (typeof item.module !== 'string' || item.module.length === 0) {
      violations.push(`mapping ${id}: module is missing`);
    }
    if (
      !Array.isArray(item.platforms) ||
      item.platforms.length === 0 ||
      !item.platforms.every((p) => PLATFORMS.includes(p))
    ) {
      violations.push(
        `mapping ${id}: platforms must be a non-empty subset of ${PLATFORMS.join(', ')}`
      );
    }
    if (typeof item.nativeRef !== 'string' || item.nativeRef.length === 0) {
      violations.push(`mapping ${id}: nativeRef is missing`);
    }
  }

  // Code scan: cases per module file.
  const codeCases = new Map(); // caseId -> { module, registrar, file }
  for (const filePath of listFiles(modulesDir, '_cases.ts')) {
    const scanned = scanModuleFile(filePath);
    for (const item of scanned.cases) {
      if (!CASE_ID_PATTERN.test(item.caseId)) {
        violations.push(
          `code: invalid case id ${JSON.stringify(item.caseId)} in ${path.basename(filePath)}`
        );
        continue;
      }
      if (codeCases.has(item.caseId)) {
        violations.push(
          `code: duplicate case id ${item.caseId} (${path.basename(
            codeCases.get(item.caseId).file
          )} and ${path.basename(filePath)})`
        );
        continue;
      }
      if (item.registrar == null) {
        violations.push(
          `code: case ${item.caseId} in ${path.basename(filePath)} is not inside a register* function`
        );
      }
      codeCases.set(item.caseId, { ...item, module: scanned.module });
    }
  }

  // Entry wiring: registrar -> list of entries importing it.
  const knownEntries = new Set();
  const registrarEntries = new Map(); // registrar -> Set(entry)
  for (const filePath of listFiles(entriesDir, '.ts')) {
    const scanned = scanEntryFile(filePath);
    knownEntries.add(scanned.entry);
    for (const registrar of Object.keys(scanned.wiring)) {
      if (!registrarEntries.has(registrar)) {
        registrarEntries.set(registrar, new Set());
      }
      registrarEntries.get(registrar).add(scanned.entry);
    }
  }

  // Cross checks.
  for (const [caseId, info] of codeCases) {
    const mapped = mappingIds.get(caseId);
    if (mapped == null) {
      violations.push(`code case ${caseId} is missing from the mapping`);
      continue;
    }
    if (mapped.module !== info.module) {
      violations.push(
        `mapping ${caseId}: module '${mapped.module}' does not match the registering file module '${info.module}'`
      );
    }
    const entries = registrarEntries.get(info.registrar);
    if (entries == null || entries.size === 0) {
      violations.push(
        `code case ${caseId}: registrar ${info.registrar} is not imported by any entry`
      );
    } else if (entries.size > 1) {
      violations.push(
        `code case ${caseId}: registrar ${info.registrar} is wired into multiple entries (${Array.from(entries).join(', ')})`
      );
    } else {
      const actualEntry = Array.from(entries)[0];
      if (mapped.entry !== actualEntry) {
        violations.push(
          `mapping ${caseId}: entry '${mapped.entry}' does not match the wiring entry '${actualEntry}'`
        );
      }
    }
  }
  for (const [caseId, item] of mappingIds) {
    if (!codeCases.has(caseId)) {
      violations.push(`mapping case ${caseId} is not registered in code`);
    }
    if (typeof item.entry === 'string' && !knownEntries.has(item.entry)) {
      violations.push(
        `mapping ${caseId}: entry '${item.entry}' is not a known entry file`
      );
    }
  }

  return violations;
}

function main() {
  const violations = checkAll();
  if (violations.length > 0) {
    console.error(
      `check_case_mapping: FAILED (${violations.length} violation(s)):`
    );
    for (const violation of violations) {
      console.error(`  - ${violation}`);
    }
    process.exit(1);
  }
  console.log('check_case_mapping: OK (mapping matches registered CI cases)');
}

if (require.main === module) {
  main();
}

module.exports = { checkAll, main, scanEntryFile, scanModuleFile };
