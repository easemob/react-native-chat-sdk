/**
 * Property-based tests for tag format validation.
 *
 * **Validates: Requirements 6.5, 6.6**
 *
 * Property 7: Tag Format Validation
 * - For any input string, validateIosTag(s) === /^\d+\.\d+\.\d+$/.test(s)
 * - For any input string, validateAndroidTag(s) === /^SDK_\d+\.\d+\.\d+(\.\d+)*$/.test(s)
 */

import * as fc from 'fast-check';
import { validateIosTag, validateAndroidTag } from '../tag-validator';

const IOS_REGEX = /^\d+\.\d+\.\d+$/;
const ANDROID_REGEX = /^SDK_\d+\.\d+\.\d+(\.\d+)*$/;

describe('Property 7: Tag Format Validation', () => {
  describe('iOS tag validation', () => {
    it('validateIosTag(s) === /^\\d+\\.\\d+\\.\\d+$/.test(s) for all strings', () => {
      fc.assert(
        fc.property(fc.string(), (s) => {
          return validateIosTag(s) === IOS_REGEX.test(s);
        }),
        { numRuns: 1000 }
      );
    });

    it('accepts valid iOS tags (three dot-separated digit groups)', () => {
      const validIosTag = fc
        .tuple(fc.nat({ max: 999 }), fc.nat({ max: 999 }), fc.nat({ max: 999 }))
        .map(([major, minor, patch]) => `${major}.${minor}.${patch}`);

      fc.assert(
        fc.property(validIosTag, (tag) => {
          return validateIosTag(tag) === true;
        }),
        { numRuns: 1000 }
      );
    });

    it('rejects iOS tags with extra segments', () => {
      const extraSegmentTag = fc
        .tuple(
          fc.nat({ max: 999 }),
          fc.nat({ max: 999 }),
          fc.nat({ max: 999 }),
          fc.nat({ max: 999 })
        )
        .map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`);

      fc.assert(
        fc.property(extraSegmentTag, (tag) => {
          return validateIosTag(tag) === false;
        }),
        { numRuns: 1000 }
      );
    });

    it('rejects iOS tags with missing segments', () => {
      const missingSegmentTag = fc
        .tuple(fc.nat({ max: 999 }), fc.nat({ max: 999 }))
        .map(([a, b]) => `${a}.${b}`);

      fc.assert(
        fc.property(missingSegmentTag, (tag) => {
          return validateIosTag(tag) === false;
        }),
        { numRuns: 1000 }
      );
    });

    it('rejects iOS tags with non-numeric segments', () => {
      const nonNumericTag = fc
        .tuple(
          fc.stringMatching(/^[a-z]{1,3}$/),
          fc.nat({ max: 999 }),
          fc.nat({ max: 999 })
        )
        .map(([a, b, c]) => `${a}.${b}.${c}`);

      fc.assert(
        fc.property(nonNumericTag, (tag) => {
          return validateIosTag(tag) === false;
        }),
        { numRuns: 1000 }
      );
    });

    it('rejects iOS tags with SDK_ prefix', () => {
      const prefixedTag = fc
        .tuple(fc.nat({ max: 999 }), fc.nat({ max: 999 }), fc.nat({ max: 999 }))
        .map(([a, b, c]) => `SDK_${a}.${b}.${c}`);

      fc.assert(
        fc.property(prefixedTag, (tag) => {
          return validateIosTag(tag) === false;
        }),
        { numRuns: 1000 }
      );
    });
  });

  describe('Android tag validation', () => {
    it('validateAndroidTag(s) === /^SDK_\\d+\\.\\d+\\.\\d+(\\.\\d+)*$/.test(s) for all strings', () => {
      fc.assert(
        fc.property(fc.string(), (s) => {
          return validateAndroidTag(s) === ANDROID_REGEX.test(s);
        }),
        { numRuns: 1000 }
      );
    });

    it('accepts valid Android tags (SDK_ prefix + three dot-separated digit groups)', () => {
      const validAndroidTag = fc
        .tuple(fc.nat({ max: 999 }), fc.nat({ max: 999 }), fc.nat({ max: 999 }))
        .map(([a, b, c]) => `SDK_${a}.${b}.${c}`);

      fc.assert(
        fc.property(validAndroidTag, (tag) => {
          return validateAndroidTag(tag) === true;
        }),
        { numRuns: 1000 }
      );
    });

    it('accepts valid Android tags with four or more segments', () => {
      const multiSegmentTag = fc
        .tuple(
          fc.nat({ max: 999 }),
          fc.nat({ max: 999 }),
          fc.nat({ max: 999 }),
          fc.array(fc.nat({ max: 999 }), { minLength: 1, maxLength: 3 })
        )
        .map(([a, b, c, extra]) => `SDK_${a}.${b}.${c}.${extra.join('.')}`);

      fc.assert(
        fc.property(multiSegmentTag, (tag) => {
          return validateAndroidTag(tag) === true;
        }),
        { numRuns: 1000 }
      );
    });

    it('rejects Android tags without SDK_ prefix', () => {
      const noPrefixTag = fc
        .tuple(fc.nat({ max: 999 }), fc.nat({ max: 999 }), fc.nat({ max: 999 }))
        .map(([a, b, c]) => `${a}.${b}.${c}`);

      fc.assert(
        fc.property(noPrefixTag, (tag) => {
          return validateAndroidTag(tag) === false;
        }),
        { numRuns: 1000 }
      );
    });

    it('rejects Android tags with wrong prefix', () => {
      const wrongPrefixTag = fc
        .tuple(
          fc.constantFrom('sdk_', 'Sdk_', 'SDK-', 'SDK', 'SDKK_'),
          fc.nat({ max: 999 }),
          fc.nat({ max: 999 }),
          fc.nat({ max: 999 })
        )
        .map(([prefix, a, b, c]) => `${prefix}${a}.${b}.${c}`);

      fc.assert(
        fc.property(wrongPrefixTag, (tag) => {
          return validateAndroidTag(tag) === false;
        }),
        { numRuns: 1000 }
      );
    });

    it('rejects Android tags with non-numeric segments', () => {
      const nonNumericTag = fc
        .tuple(
          fc.stringMatching(/^[a-z]{1,3}$/),
          fc.nat({ max: 999 }),
          fc.nat({ max: 999 })
        )
        .map(([a, b, c]) => `SDK_${a}.${b}.${c}`);

      fc.assert(
        fc.property(nonNumericTag, (tag) => {
          return validateAndroidTag(tag) === false;
        }),
        { numRuns: 1000 }
      );
    });

    it('validates equivalence with regex for completely random strings', () => {
      fc.assert(
        fc.property(fc.string(), (s) => {
          return validateAndroidTag(s) === ANDROID_REGEX.test(s);
        }),
        { numRuns: 1000 }
      );
    });
  });
});
