import * as fc from 'fast-check';
import { filterIosPath } from '../filter';

/**
 * Property-based test for iOS file path filter correctness.
 *
 * **Validates: Requirements 1.3**
 *
 * Feature: sdk-upgrade-skills, Property 1: iOS file path filter correctness
 */

const VALID_PREFIX = 'newSDK/HyphenateSDK/';

/**
 * Reference implementation of the iOS path filter rules:
 * - Must start with `newSDK/HyphenateSDK/`
 * - Must end with `.h`
 * - Must NOT end with `+Private.h`
 * - Must NOT end with `+Category.h`
 */
function referenceFilterIosPath(path: string): boolean {
  return (
    path.startsWith(VALID_PREFIX) &&
    path.endsWith('.h') &&
    !path.endsWith('+Private.h') &&
    !path.endsWith('+Category.h')
  );
}

// --- Generators ---

/** Generates a valid identifier-like string for filenames */
const identifierArb = fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]{0,29}$/);

/** Generates optional subdirectory segments */
const subdirArb = fc
  .array(fc.stringMatching(/^[a-z]{1,10}$/), { minLength: 0, maxLength: 3 })
  .map((parts) => (parts.length > 0 ? parts.join('/') + '/' : ''));

/** Category 1: Valid paths (correct prefix + .h extension + no exclusions) */
const validPathArb = fc
  .tuple(subdirArb, identifierArb)
  .filter(([, name]) => !name.endsWith('+Private') && !name.endsWith('+Category'))
  .map(([subdir, filename]) => `${VALID_PREFIX}${subdir}${filename}.h`);

/** Category 2: Paths missing the prefix */
const missingPrefixArb = fc.oneof(
  // Completely different prefix
  fc
    .tuple(fc.stringMatching(/^[a-z]{1,10}(\/[a-z]{1,10}){0,2}\/$/), identifierArb)
    .map(([prefix, filename]) => `${prefix}${filename}.h`)
    .filter((p) => !p.startsWith(VALID_PREFIX)),
  // Partial prefix
  identifierArb.map((filename) => `newSDK/${filename}.h`),
  identifierArb.map((filename) => `other/HyphenateSDK/${filename}.h`)
);

/** Category 3: Paths with wrong extension */
const wrongExtensionArb = fc
  .tuple(subdirArb, identifierArb, fc.constantFrom('.m', '.mm', '.c', '.cpp', '.swift', '.java', '.txt', ''))
  .map(([subdir, name, ext]) => `${VALID_PREFIX}${subdir}${name}${ext}`);

/** Category 4: Paths ending with +Private.h */
const privatePathArb = fc
  .tuple(subdirArb, identifierArb)
  .map(([subdir, name]) => `${VALID_PREFIX}${subdir}${name}+Private.h`);

/** Category 5: Paths ending with +Category.h */
const categoryPathArb = fc
  .tuple(subdirArb, identifierArb)
  .map(([subdir, name]) => `${VALID_PREFIX}${subdir}${name}+Category.h`);

/** Category 6: Completely random strings */
const randomStringArb = fc.string({ minLength: 0, maxLength: 100 });

/** Combined generator covering all categories */
const anyPathArb = fc.oneof(
  { weight: 3, arbitrary: validPathArb },
  { weight: 2, arbitrary: missingPrefixArb },
  { weight: 2, arbitrary: wrongExtensionArb },
  { weight: 2, arbitrary: privatePathArb },
  { weight: 2, arbitrary: categoryPathArb },
  { weight: 3, arbitrary: randomStringArb }
);

describe('Property 1: iOS File Path Filter Correctness', () => {
  it('filterIosPath(path) === referenceFilterIosPath(path) for any generated path', () => {
    fc.assert(
      fc.property(anyPathArb, (path) => {
        expect(filterIosPath(path)).toBe(referenceFilterIosPath(path));
      }),
      { numRuns: 1000 }
    );
  });

  it('always returns true for valid paths (correct prefix + .h + no exclusions)', () => {
    fc.assert(
      fc.property(validPathArb, (path) => {
        expect(filterIosPath(path)).toBe(true);
      }),
      { numRuns: 200 }
    );
  });

  it('always returns false for paths missing the prefix', () => {
    fc.assert(
      fc.property(missingPrefixArb, (path) => {
        expect(filterIosPath(path)).toBe(false);
      }),
      { numRuns: 200 }
    );
  });

  it('always returns false for paths with wrong extension', () => {
    fc.assert(
      fc.property(wrongExtensionArb, (path) => {
        expect(filterIosPath(path)).toBe(false);
      }),
      { numRuns: 200 }
    );
  });

  it('always returns false for paths ending with +Private.h', () => {
    fc.assert(
      fc.property(privatePathArb, (path) => {
        expect(filterIosPath(path)).toBe(false);
      }),
      { numRuns: 200 }
    );
  });

  it('always returns false for paths ending with +Category.h', () => {
    fc.assert(
      fc.property(categoryPathArb, (path) => {
        expect(filterIosPath(path)).toBe(false);
      }),
      { numRuns: 200 }
    );
  });
});
