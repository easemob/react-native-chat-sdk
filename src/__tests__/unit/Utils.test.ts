import {
  generateMessageId,
  getNowTimestamp,
  getRandomInt,
} from '../../__internal__/Utils';

describe('Utils', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getNowTimestamp', () => {
    test('returns the current Date.now() value', () => {
      const fixed = 1_700_000_000_000;
      jest.spyOn(Date, 'now').mockReturnValue(fixed);
      expect(getNowTimestamp()).toBe(fixed);
    });
  });

  describe('getRandomInt', () => {
    test('returns min when Math.random() returns 0', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0);
      expect(getRandomInt(1, 10)).toBe(1);
    });

    test('returns max when Math.random() approaches 1', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.999999999);
      expect(getRandomInt(1, 10)).toBe(10);
    });

    test('applies Math.ceil to min and Math.floor to max for non-integer bounds', () => {
      // min = ceil(1.2) = 2, max = floor(9.8) = 9
      // With Math.random() = 0, result is min after ceil => 2
      jest.spyOn(Math, 'random').mockReturnValue(0);
      expect(getRandomInt(1.2, 9.8)).toBe(2);
    });
  });

  describe('generateMessageId', () => {
    test('concatenates timestamp and random int as a string', () => {
      jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
      // Math.random() = 0 makes getRandomInt(1, 99999) return 1
      jest.spyOn(Math, 'random').mockReturnValue(0);
      expect(generateMessageId()).toBe('17000000000001');
    });
  });
});
