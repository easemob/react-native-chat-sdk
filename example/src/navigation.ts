import { createNavigationContainerRef } from '@react-navigation/native';

export type RootStackParamList = {
  Init: undefined;
  Login: undefined;
  Search: undefined;
  ApiCall: { apiName: string };
};

/**
 * 全局导航引用，供自动化脚本模式（auto/auto_mode.ts）在页面外驱动跳转。
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigateReplace(name: keyof RootStackParamList): void {
  if (navigationRef.isReady()) {
    navigationRef.reset({ index: 0, routes: [{ name }] } as never);
  }
}
