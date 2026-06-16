import { parseSemVer, bumpPatch, bumpMinor, formatSemVer } from './version';
import type { SemVer } from './version';

describe('version utilities', () => {
  describe('parseSemVer', () => {
    it('parses a simple version string', () => {
      expect(parseSemVer('1.15.0')).toEqual({
        major: 1,
        minor: 15,
        patch: 0,
      });
    });

    it('parses a version with prerelease', () => {
      expect(parseSemVer('1.15.1-beta.0')).toEqual({
        major: 1,
        minor: 15,
        patch: 1,
        prerelease: 'beta.0',
      });
    });

    it('parses a version with complex prerelease', () => {
      expect(parseSemVer('2.0.0-rc.1')).toEqual({
        major: 2,
        minor: 0,
        patch: 0,
        prerelease: 'rc.1',
      });
    });

    it('throws on invalid version string', () => {
      expect(() => parseSemVer('invalid')).toThrow('Invalid semver string');
      expect(() => parseSemVer('1.2')).toThrow('Invalid semver string');
      expect(() => parseSemVer('')).toThrow('Invalid semver string');
    });
  });

  describe('bumpPatch', () => {
    it('increments patch when no prerelease', () => {
      const v: SemVer = { major: 1, minor: 15, patch: 0 };
      expect(bumpPatch(v)).toEqual({ major: 1, minor: 15, patch: 1 });
    });

    it('strips prerelease without incrementing patch', () => {
      const v: SemVer = { major: 1, minor: 15, patch: 1, prerelease: 'beta.0' };
      expect(bumpPatch(v)).toEqual({ major: 1, minor: 15, patch: 1 });
    });

    it('result never has prerelease', () => {
      const v: SemVer = { major: 0, minor: 0, patch: 0, prerelease: 'alpha.1' };
      const result = bumpPatch(v);
      expect(result.prerelease).toBeUndefined();
    });
  });

  describe('bumpMinor', () => {
    it('increments minor and resets patch', () => {
      const v: SemVer = { major: 1, minor: 15, patch: 1 };
      expect(bumpMinor(v)).toEqual({ major: 1, minor: 16, patch: 0 });
    });

    it('strips prerelease, increments minor, resets patch', () => {
      const v: SemVer = { major: 1, minor: 15, patch: 1, prerelease: 'beta.0' };
      expect(bumpMinor(v)).toEqual({ major: 1, minor: 16, patch: 0 });
    });

    it('result never has prerelease', () => {
      const v: SemVer = { major: 2, minor: 3, patch: 4, prerelease: 'rc.2' };
      const result = bumpMinor(v);
      expect(result.prerelease).toBeUndefined();
    });
  });

  describe('formatSemVer', () => {
    it('formats a simple version', () => {
      expect(formatSemVer({ major: 1, minor: 15, patch: 1 })).toBe('1.15.1');
    });

    it('formats a version with prerelease', () => {
      expect(formatSemVer({ major: 1, minor: 15, patch: 1, prerelease: 'beta.0' })).toBe(
        '1.15.1-beta.0'
      );
    });
  });

  describe('end-to-end version bump scenarios from design doc', () => {
    it('bump_patch("1.15.0") → "1.15.1"', () => {
      const v = parseSemVer('1.15.0');
      expect(formatSemVer(bumpPatch(v))).toBe('1.15.1');
    });

    it('bump_patch("1.15.1-beta.0") → "1.15.1"', () => {
      const v = parseSemVer('1.15.1-beta.0');
      expect(formatSemVer(bumpPatch(v))).toBe('1.15.1');
    });

    it('bump_minor("1.15.1") → "1.16.0"', () => {
      const v = parseSemVer('1.15.1');
      expect(formatSemVer(bumpMinor(v))).toBe('1.16.0');
    });

    it('bump_minor("1.15.1-beta.0") → "1.16.0"', () => {
      const v = parseSemVer('1.15.1-beta.0');
      expect(formatSemVer(bumpMinor(v))).toBe('1.16.0');
    });
  });
});
