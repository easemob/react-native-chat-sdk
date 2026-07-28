import type { ChatClient } from '../ChatClient';

/**
 * @description: A simple factory class to create instances of classes.
 */
export class Factory {
  static create<T>(cls: new (...args: any[]) => T, ...args: any[]): T {
    return new cls(...args);
  }
  static client: ChatClient;
  static getChatClient(): ChatClient {
    if (!this.client) {
      throw new Error('ChatClient has not been initialized.');
    }
    return this.client;
  }
  static setChatClient(client: ChatClient) {
    this.client = client;
  }
  static t: Set<any>;
  static get<T>(name: string): T | null {
    return Factory.t.has(name) ? (Factory.t as any)[name] : null;
  }
  static set<T>(name: string, instance: T): void {
    if (!Factory.t) {
      Factory.t = new Set();
    }
    (Factory.t as any)[name] = instance;
  }
}
