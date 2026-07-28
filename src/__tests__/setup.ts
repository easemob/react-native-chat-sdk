/**
 * Jest global setup for the chat SDK.
 *
 * Mocks the native bridge module at `src/__specs__` so unit / contract tests
 * never touch the real React Native native module proxy. The mock surface
 * mirrors the real module's exports: `ExtSdkApiRN`, `eventEmitter`,
 * `isTurboModuleEnabled`.
 */

jest.mock('../__specs__', () => {
  return {
    ExtSdkApiRN: {
      callMethod: jest.fn().mockResolvedValue({}),
    },
    eventEmitter: {
      addListener: jest.fn(() => ({ remove: jest.fn() })),
      removeAllListeners: jest.fn(),
      removeSubscription: jest.fn(),
      emit: jest.fn(),
      listenerCount: jest.fn().mockReturnValue(0),
    },
    isTurboModuleEnabled: false,
  };
});

afterEach(() => {
  jest.clearAllMocks();
});
