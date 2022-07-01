import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ApiParams } from './DataTypes';

export const Stack = createNativeStackNavigator();

export type NavigationComponentType = (params: {
  navigation: any;
}) => React.ReactElement<{ navigation: any }>;
export type LeafComponentType = React.ComponentClass<{ navigation: any }>;
export type LeafComponentType2 = (params: {
  navigation: any;
}) => React.ComponentClass<{ navigation: any }>;

const screens: NavigationComponentType[] = [];

export function unregisterScreens(): void {
  console.log(`unregisterScreens`);
  screens.length = 0;
}

export function registerScreen(element: NavigationComponentType): void {
  console.log(`registerScreen`, element);
  screens.push(element);
}

export function screensList(): NavigationComponentType[] {
  return screens;
}

const routes: string[] = [];

export function registerRoute(route: string): void {
  console.log(`registerRoute`, route);
  routes.push(route);
}

export function unregisterRoutes(): void {
  console.log(`unregisterRoutes`);
  routes.length = 0;
}

export function getRoutes(): string[] {
  console.log(`getRoutes`);
  return routes;
}

export interface ScreenComponent {
  screen: NavigationComponentType | LeafComponentType;
  route: string;
  /**
   * is navigation screen
   */
  isNavigation: boolean;
  /**
   * parent screen
   */
  parentScreen?: string;
}

const components: ScreenComponent[] = [];

export function getComponentList(): ScreenComponent[] {
  console.log(`getComponentList`);
  return components;
}

export function registerComponent(component: ScreenComponent): void {
  console.log(`registerComponent`, component);
  components.push(component);
}

export function unregisterComponents(): void {
  console.log(`unregisterComponents`);
  components.length = 0;
}

let _seq = 0;
export function seq(): number {
  return ++_seq;
}

export function generateData(kv: Map<string, ApiParams>): any {
  let ret: any = {};
  for (let key of kv.keys()) {
    let eachMethodParams: any = {};
    kv.get(key)?.params.forEach((item) => {
      eachMethodParams[item.paramName] = item.paramDefaultValue;
      if (item.paramValue) {
        eachMethodParams[item.paramName] = item.paramValue();
      }
    });
    ret[key] = eachMethodParams;
  }
  return ret;
}
