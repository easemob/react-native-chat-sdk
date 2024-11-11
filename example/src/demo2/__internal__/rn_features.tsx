export function isTurboModuleEnabled() {
  return !!(global as any).__turboModuleProxy;
}
export function isHermesEnabled() {
  return !!(global as any).HermesInternal;
}
