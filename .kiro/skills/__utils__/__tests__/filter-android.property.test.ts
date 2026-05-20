/**
 * Property-Based Test: Android File Path Filter Correctness
 *
 * **Validates: Requirements 1.4, 1.7**
 *
 * Verifies that for ANY generated path string, filterAndroidPath returns true
 * if and only if all inclusion criteria are met and no exclusion criteria are triggered.
 *
 * Feature: sdk-upgrade-skills, Property 2: Android file path filter correctness
 */
import * as fc from 'fast-check';
import { filterAndroidPath, INTERNAL_CLASSES } from '../filter';

// --- Reference implementation ---
// Mirrors the rules from the design doc to independently verify correctness.
function referenceFilterAndroid(path: string): boolean {
  // Must start with the required prefix
  if (!path.startsWith('hyphenatechatsdk/src/com/hyphenate/chat/')) {
    return false;
  }

  // Extract filename (basename)
  const lastSlash = path.lastIndexOf('/');
  const filename = lastSlash === -1 ? path : path.slice(lastSlash + 1);

  // Must match EM[^A]*.java — starts with "EM", third char is NOT "A", ends with ".java"
  const emPattern = /^EM[^A].*\.java$/;
  if (!emPattern.test(filename)) {
    return false;
  }

  // Must NOT contain /adapter/ or /core/ subdirectories
  if (path.includes('/adapter/') || path.includes('/core/')) {
    return false;
  }

  // Must NOT be in the internal classes list
  if (INTERNAL_CLASSES.includes(filename)) {
    return false;
  }

  return true;
}

// --- Generators ---

const ANDROID_PREFIX = 'hyphenatechatsdk/src/com/hyphenate/chat/';

/** Generate a letter character (a-z, A-Z) */
const letterChar = fc.integer({ min: 0, max: 51 }).map((n) => {
  if (n < 26) return String.fromCharCode(97 + n); // a-z
  return String.fromCharCode(65 + n - 26); // A-Z
});

/** Generate a letter that is NOT 'A' */
const nonALetter = letterChar.filter((c) => c !== 'A');

/** Generate a Java identifier suffix (letters, digits, underscore) */
const javaIdentChar = fc.oneof(
  letterChar,
  fc.integer({ min: 0, max: 9 }).map(String),
  fc.constant('_')
);

const javaSuffix = fc
  .array(javaIdentChar, { minLength: 0, maxLength: 20 })
  .map((chars) => chars.join(''));

/** Generate valid EM[^A]*.java filenames */
const validEmFilename = fc
  .tuple(nonALetter, javaSuffix)
  .map(([thirdChar, suffix]) => `EM${thirdChar}${suffix}.java`);

/** Generate EMA*.java adapter filenames (should be excluded) */
const adapterFilename = javaSuffix.map((suffix) => `EMA${suffix}.java`);

/** Generate a valid path (correct prefix + valid filename + no exclusions) */
const validPath = validEmFilename
  .filter((filename) => !INTERNAL_CLASSES.includes(filename))
  .map((filename) => `${ANDROID_PREFIX}${filename}`);

/** Generate a path with /adapter/ subdirectory */
const pathWithAdapter = validEmFilename.map(
  (filename) => `${ANDROID_PREFIX}adapter/${filename}`
);

/** Generate a path with /core/ subdirectory */
const pathWithCore = validEmFilename.map(
  (filename) => `${ANDROID_PREFIX}core/${filename}`
);

/** Generate a path with an internal class filename */
const internalClassPath = fc
  .constantFrom(...INTERNAL_CLASSES)
  .map((filename) => `${ANDROID_PREFIX}${filename}`);

/** Generate a path with optional subdirectories between prefix and filename */
const subdirName = fc
  .array(fc.integer({ min: 97, max: 122 }).map((n) => String.fromCharCode(n)), {
    minLength: 1,
    maxLength: 8,
  })
  .map((chars) => chars.join(''));

const pathWithSubdirs = fc
  .tuple(
    fc.array(subdirName, { minLength: 0, maxLength: 2 }),
    validEmFilename
  )
  .filter(([, filename]) => !INTERNAL_CLASSES.includes(filename))
  .map(([dirs, filename]) => {
    const subPath = dirs.length > 0 ? dirs.join('/') + '/' : '';
    return `${ANDROID_PREFIX}${subPath}${filename}`;
  });

/** Generate completely random strings */
const randomString = fc.string({ minLength: 0, maxLength: 100 });

// --- Property Tests ---

describe('Property 2: Android File Path Filter Correctness', () => {
  /**
   * **Validates: Requirements 1.4, 1.7**
   *
   * The core property: filterAndroidPath(path) === referenceFilterAndroid(path)
   * for ALL possible path strings.
   */
  it('filterAndroidPath agrees with reference implementation for valid paths', () => {
    fc.assert(
      fc.property(validPath, (path) => {
        expect(filterAndroidPath(path)).toBe(referenceFilterAndroid(path));
      }),
      { numRuns: 1000 }
    );
  });

  it('filterAndroidPath agrees with reference for EMA* adapter paths', () => {
    fc.assert(
      fc.property(
        adapterFilename.map((f) => `${ANDROID_PREFIX}${f}`),
        (path) => {
          expect(filterAndroidPath(path)).toBe(referenceFilterAndroid(path));
          // EMA* paths should always be rejected
          expect(filterAndroidPath(path)).toBe(false);
        }
      ),
      { numRuns: 1000 }
    );
  });

  it('filterAndroidPath agrees with reference for paths with /adapter/ subdirectory', () => {
    fc.assert(
      fc.property(pathWithAdapter, (path) => {
        expect(filterAndroidPath(path)).toBe(referenceFilterAndroid(path));
        // Paths with /adapter/ should always be rejected
        expect(filterAndroidPath(path)).toBe(false);
      }),
      { numRuns: 1000 }
    );
  });

  it('filterAndroidPath agrees with reference for paths with /core/ subdirectory', () => {
    fc.assert(
      fc.property(pathWithCore, (path) => {
        expect(filterAndroidPath(path)).toBe(referenceFilterAndroid(path));
        // Paths with /core/ should always be rejected
        expect(filterAndroidPath(path)).toBe(false);
      }),
      { numRuns: 1000 }
    );
  });

  it('filterAndroidPath agrees with reference for internal class paths', () => {
    fc.assert(
      fc.property(internalClassPath, (path) => {
        expect(filterAndroidPath(path)).toBe(referenceFilterAndroid(path));
        // Internal classes should always be rejected
        expect(filterAndroidPath(path)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('filterAndroidPath agrees with reference for paths with subdirectories', () => {
    fc.assert(
      fc.property(pathWithSubdirs, (path) => {
        expect(filterAndroidPath(path)).toBe(referenceFilterAndroid(path));
      }),
      { numRuns: 1000 }
    );
  });

  it('filterAndroidPath agrees with reference for completely random strings', () => {
    fc.assert(
      fc.property(randomString, (path) => {
        expect(filterAndroidPath(path)).toBe(referenceFilterAndroid(path));
      }),
      { numRuns: 1000 }
    );
  });

  it('filterAndroidPath returns true only when ALL inclusion criteria are met', () => {
    fc.assert(
      fc.property(validPath, (path) => {
        // Valid paths should pass
        expect(filterAndroidPath(path)).toBe(true);
        // Verify all criteria hold
        expect(path.startsWith(ANDROID_PREFIX)).toBe(true);
        const filename = path.slice(path.lastIndexOf('/') + 1);
        expect(/^EM[^A].*\.java$/.test(filename)).toBe(true);
        expect(path.includes('/adapter/')).toBe(false);
        expect(path.includes('/core/')).toBe(false);
        expect(INTERNAL_CLASSES.includes(filename)).toBe(false);
      }),
      { numRuns: 1000 }
    );
  });

  it('filterAndroidPath returns false when prefix is missing', () => {
    fc.assert(
      fc.property(
        validEmFilename
          .filter((f) => !INTERNAL_CLASSES.includes(f))
          .map((f) => `wrong/prefix/${f}`),
        (path) => {
          expect(filterAndroidPath(path)).toBe(false);
        }
      ),
      { numRuns: 1000 }
    );
  });
});
