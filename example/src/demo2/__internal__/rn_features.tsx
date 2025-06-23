import { TurboModuleRegistry } from 'react-native';

export function isTurboModuleEnabled() {
  return (global as any).__turboModuleProxy !== undefined
    ? (global as any).__turboModuleProxy
    : TurboModuleRegistry
    ? TurboModuleRegistry?.get('ChatSdk') !== undefined
    : false;
}
export function isHermesEnabled() {
  return !!(global as any).HermesInternal;
}
