/**
 * Property-based tests for version increment utilities.
 *
 * Feature: sdk-upgrade-skills, Property 6: Version increment correctness
 *
 * **Validates: Requirements 4.1, 4.2**
 */
import * as fc from 'fast-check';
import { bumpPatch, bumpMinor } from '../version';
import type { SemVer } from '../version';

/**
 * Arbitrary generator for SemVer objects.
 * - major: 0-99
 * - minor: 0-99
 * - patch: 0-99
 * - prerelease: optional (undefined, or patterns like "beta.0", "rc.1", "alpha.3")
 */
const semverArb: fc.Arbitrary<SemVer> = fc.record({
  major: fc.nat({ max: 99 }),
  minor: fc.nat({ max: 99 }),
  patch: fc.nat({ max: 99 }),
  prerelease: fc.oneof(
    fc.constant(undefined),
    fc.tuple(
      fc.constantFrom('alpha', 'beta', 'rc', 'dev', 'pre'),
      fc.nat({ max: 20 })
    ).map(([label, num]) => `${label}.${num}`)
  ),
});

/** Helper to build a SemVer without prerelease (always has no prerelease) */
const semverWithoutPrereleaseArb: fc.Arbitrary<SemVer> = fc.record({
  major: fc.nat({ max: 99 }),
  minor: fc.nat({ max: 99 }),
  patch: fc.nat({ max: 99 }),
});

/** Helper to build a SemVer that always has a prerelease */
const semverWithPrereleaseArb: fc.Arbitrary<SemVer> = fc.record({
  major: fc.nat({ max: 99 }),
  minor: fc.nat({ max: 99 }),
  patch: fc.nat({ max: 99 }),
  prerelease: fc.tuple(
    fc.constantFrom('alpha', 'beta', 'rc', 'dev', 'pre'),
    fc.nat({ max: 20 })
  ).map(([label, num]) => `${label}.${num}`),
});

describe('Property 6: Version Increment Correctness', () => {
  describe('bumpPatch', () => {
    it('result never has prerelease (for any input)', () => {
      fc.assert(
        fc.property(semverArb, (v) => {
          const result = bumpPatch(v);
          return result.prerelease === undefined;
        }),
        { numRuns: 1000 }
      );
    });

    it('with no prerelease: result.patch === input.patch + 1, major/minor unchanged', () => {
      fc.assert(
        fc.property(semverWithoutPrereleaseArb, (v) => {
          const result = bumpPatch(v);
          return (
            result.patch === v.patch + 1 &&
            result.major === v.major &&
            result.minor === v.minor
          );
        }),
        { numRuns: 1000 }
      );
    });

    it('with prerelease: result.patch === input.patch (unchanged), major/minor unchanged', () => {
      fc.assert(
        fc.property(semverWithPrereleaseArb, (v) => {
          const result = bumpPatch(v);
          return (
            result.patch === v.patch &&
            result.major === v.major &&
            result.minor === v.minor
          );
        }),
        { numRuns: 1000 }
      );
    });
  });

  describe('bumpMinor', () => {
    it('result never has prerelease (for any input)', () => {
      fc.assert(
        fc.property(semverArb, (v) => {
          const result = bumpMinor(v);
          return result.prerelease === undefined;
        }),
        { numRuns: 1000 }
      );
    });

    it('result.minor === input.minor + 1, result.patch === 0, major unchanged', () => {
      fc.assert(
        fc.property(semverArb, (v) => {
          const result = bumpMinor(v);
          return (
            result.minor === v.minor + 1 &&
            result.patch === 0 &&
            result.major === v.major
          );
        }),
        { numRuns: 1000 }
      );
    });
  });
});
