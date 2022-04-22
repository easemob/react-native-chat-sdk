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
  { route: GroupManagerRoute, screen: GroupManagerScreen, isNavigation: true },
  { route: ChatManagerRoute, screen: ChatManagerScreen, isNavigation: true },
  { route: ClientRoute, screen: ClientScreen, isNavigation: true },
  {
    route: SendMessageScreen.route,
    screen: SendMessageScreen,
    isNavigation: false,
    parentScreen: ChatManagerRoute,
  },
  {
    route: ClientOthersScreen.route,
    screen: ClientOthersScreen,
    isNavigation: false,
    parentScreen: ClientRoute,
  },
  {
    route: CreateAccountScreen.route,
    screen: CreateAccountScreen,
    isNavigation: false,
    parentScreen: ClientRoute,
  },
  {
    route: GetStateScreen.route,
    screen: GetStateScreen,
    isNavigation: false,
    parentScreen: ClientRoute,
  },
  {
    route: KickScreen.route,
    screen: KickScreen,
    isNavigation: false,
    parentScreen: ClientRoute,
  },
  {
    route: LoginLogoutScreen.route,
    screen: LoginLogoutScreen,
    isNavigation: false,
    parentScreen: ClientRoute,
  },
];
