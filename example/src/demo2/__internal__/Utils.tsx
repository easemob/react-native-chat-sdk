import { createNativeStackNavigator } from '@react-navigation/native-stack';

export const Stack = createNativeStackNavigator();

export type NavigationComponentType = (params: {
  navigation: any;
}) => JSX.Element;
export type LeafComponentType = React.ComponentClass<{ navigation: any }>;

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
   * is naviagtion screen
   */
  isNaviagtion: boolean;
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
