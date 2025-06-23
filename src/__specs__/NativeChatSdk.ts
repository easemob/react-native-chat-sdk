import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  multiply(a: number, b: number): Promise<number>;
  callMethod(method: string, args?: Object): Promise<Object>;

  // Keep: Required for RN built in Event Emitter Calls.
  addListener(eventName: string): void;

  // Keep: Required for RN built in Event Emitter Calls.
  removeListeners(count: number): void;

  // Keep: Required for RN built in Event Emitter Calls.
  removeAllListeners(): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('ChatSdk');
