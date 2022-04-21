import { ChatManagerScreen, ChatManagerRoute } from '../ChatManager';
import { SendMessageScreen } from '../ChatManager/SendMessage';
import { ClientScreen, ClientRoute } from '../Client';
import { ClientOthersScreen } from '../Client/ClientOthers';
import { CreateAccountScreen } from '../Client/CreateAccount';
import { GetStateScreen } from '../Client/GetState';
import { KickScreen } from '../Client/Kick';
import { LoginAndLogoutScreen as LoginLogoutScreen } from '../Client/LoginAndLogout';
import { GroupManagerRoute, GroupManagerScreen } from '../GroupManager';
import type { ScreenComponent } from './Utils';

export const screenComponents: ScreenComponent[] = [
  { route: GroupManagerRoute, screen: GroupManagerScreen, isNaviagtion: true },
  { route: ChatManagerRoute, screen: ChatManagerScreen, isNaviagtion: true },
  { route: ClientRoute, screen: ClientScreen, isNaviagtion: true },
  {
    route: SendMessageScreen.route,
    screen: SendMessageScreen,
    isNaviagtion: false,
    parentScreen: ChatManagerRoute,
  },
  {
    route: ClientOthersScreen.route,
    screen: ClientOthersScreen,
    isNaviagtion: false,
    parentScreen: ClientRoute,
  },
  {
    route: CreateAccountScreen.route,
    screen: CreateAccountScreen,
    isNaviagtion: false,
    parentScreen: ClientRoute,
  },
  {
    route: GetStateScreen.route,
    screen: GetStateScreen,
    isNaviagtion: false,
    parentScreen: ClientRoute,
  },
  {
    route: KickScreen.route,
    screen: KickScreen,
    isNaviagtion: false,
    parentScreen: ClientRoute,
  },
  {
    route: LoginLogoutScreen.route,
    screen: LoginLogoutScreen,
    isNaviagtion: false,
    parentScreen: ClientRoute,
  },
];
