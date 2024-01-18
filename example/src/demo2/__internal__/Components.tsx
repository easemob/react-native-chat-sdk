import { ChatManagerRoute, ChatManagerScreen } from '../ChatManager';
// import { SendMessageScreen } from '../ChatManager/SendMessage';
import { ChatManagerLeafScreen } from '../ChatManager/ChatManagerItem';
import { SendMessageLeafScreen } from '../ChatManager/SendMessageNew';
import {
  ChatRoomManagerRoute,
  ChatRoomManagerScreen,
} from '../ChatRoomManager';
import { ChatRoomManagerLeafScreen } from '../ChatRoomManager/ChatRoomManagerItem';
import {
  ChatUserInfoManagerRoute,
  ChatUserInfoManagerScreen,
} from '../ChatUserInfoManager';
import { ChatUserInfoManagerLeafScreen } from '../ChatUserInfoManager/ChatUserInfoManagerItem';
import { ClientRoute, ClientScreen } from '../Client';
import { AppKeyScreen } from '../Client/AppKey';
import { ClientOthersScreen } from '../Client/ClientOthers';
import { CreateAccountScreen } from '../Client/CreateAccount';
import { GetStateScreen } from '../Client/GetState';
import { KickScreen } from '../Client/Kick';
import { LoginAndLogoutScreen as LoginLogoutScreen } from '../Client/LoginAndLogout';
import { default as LoginListScreen } from '../Client/LoginList';
import { UnsupportedScreen } from '../Client/Unsupported';
import { ContactManagerRoute, ContactManagerScreen } from '../ContactManager';
import { ContactLeafScreen } from '../ContactManager/ContactManagerItem';
import { GroupManagerRoute, GroupManagerScreen } from '../GroupManager';
import { GroupManagerLeafScreen } from '../GroupManager/GroupManagerItem';
import {
  PresenceManagerRoute,
  PresenceManagerScreen,
} from '../PresenceManager';
import { PresenceLeafScreen } from '../PresenceManager/PresenceManagerItem';
import { PushManagerRoute, PushManagerScreen } from '../PushManager';
import { PushManagerLeafScreen } from '../PushManager/PushManagerItem';
import {
  QuickTestManagerRoute,
  QuickTestManagerScreen,
} from '../QuickTestManager';
import { QuickTestScreenChat } from '../Test/QuickTestChat';
import { QuickTestScreenContact } from '../Test/QuickTestContact';
import { QuickTestScreenGroup } from '../Test/QuickTestGroup';
import { QuickTestScreenPresence } from '../Test/QuickTestPresence';
import { QuickTestScreenPush } from '../Test/QuickTestPush';
import { QuickTestScreenRoom } from '../Test/QuickTestRoom';
import { QuickTestScreenUser } from '../Test/QuickTestUser';
import type { ScreenComponent } from './Utils';

export const screenComponents: ScreenComponent[] = [
  // root navigator
  { route: ClientRoute, screen: ClientScreen, isNavigation: true },
  { route: ChatManagerRoute, screen: ChatManagerScreen, isNavigation: true },
  { route: GroupManagerRoute, screen: GroupManagerScreen, isNavigation: true },
  {
    route: ChatRoomManagerRoute,
    screen: ChatRoomManagerScreen,
    isNavigation: true,
  },
  {
    route: PresenceManagerRoute,
    screen: PresenceManagerScreen,
    isNavigation: true,
  },
  {
    route: ContactManagerRoute,
    screen: ContactManagerScreen,
    isNavigation: true,
  },
  {
    route: ChatUserInfoManagerRoute,
    screen: ChatUserInfoManagerScreen,
    isNavigation: true,
  },
  {
    route: PushManagerRoute,
    screen: PushManagerScreen,
    isNavigation: true,
  },
  {
    route: QuickTestManagerRoute,
    screen: QuickTestManagerScreen,
    isNavigation: true,
  },

  // ClientRoute navigator
  {
    route: AppKeyScreen.route,
    screen: AppKeyScreen,
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
    route: LoginLogoutScreen.route,
    screen: LoginLogoutScreen,
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
    route: ClientOthersScreen.route,
    screen: ClientOthersScreen,
    isNavigation: false,
    parentScreen: ClientRoute,
  },
  {
    route: LoginListScreen.route,
    screen: LoginListScreen,
    isNavigation: false,
    parentScreen: ClientRoute,
  },
  {
    route: UnsupportedScreen.route,
    screen: UnsupportedScreen,
    isNavigation: false,
    parentScreen: ClientRoute,
  },

  // ChatManagerRoute navigator
  // {
  //   route: SendMessageScreen.route,
  //   screen: SendMessageScreen,
  //   isNavigation: false,
  //   parentScreen: ChatManagerRoute,
  // },
  {
    route: SendMessageLeafScreen.route,
    screen: SendMessageLeafScreen,
    isNavigation: false,
    parentScreen: ChatManagerRoute,
  },
  {
    route: ChatManagerLeafScreen.route,
    screen: ChatManagerLeafScreen,
    isNavigation: false,
    parentScreen: ChatManagerRoute,
  },

  // GroupManagerRoute navigator
  {
    route: GroupManagerLeafScreen.route,
    screen: GroupManagerLeafScreen,
    isNavigation: false,
    parentScreen: GroupManagerRoute,
  },

  // PresenceManagerRoute navigator
  {
    route: PresenceLeafScreen.route,
    screen: PresenceLeafScreen,
    isNavigation: false,
    parentScreen: PresenceManagerRoute,
  },

  // ContactManagerRoute navigator
  {
    route: ContactLeafScreen.route,
    screen: ContactLeafScreen,
    isNavigation: false,
    parentScreen: ContactManagerRoute,
  },

  // ChatRoomManagerRoute navigator
  {
    route: ChatRoomManagerLeafScreen.route,
    screen: ChatRoomManagerLeafScreen,
    isNavigation: false,
    parentScreen: ChatRoomManagerRoute,
  },

  // ChatUserInfoManagerRoute navigator
  {
    route: ChatUserInfoManagerLeafScreen.route,
    screen: ChatUserInfoManagerLeafScreen,
    isNavigation: false,
    parentScreen: ChatUserInfoManagerRoute,
  },

  // PushManagerRoute navigator
  {
    route: PushManagerLeafScreen.route,
    screen: PushManagerLeafScreen,
    isNavigation: false,
    parentScreen: PushManagerRoute,
  },

  // QuickTestManagerRoute navigator
  {
    route: QuickTestScreenChat.route,
    screen: QuickTestScreenChat,
    isNavigation: false,
    parentScreen: QuickTestManagerRoute,
  },
  {
    route: QuickTestScreenContact.route,
    screen: QuickTestScreenContact,
    isNavigation: false,
    parentScreen: QuickTestManagerRoute,
  },
  {
    route: QuickTestScreenGroup.route,
    screen: QuickTestScreenGroup,
    isNavigation: false,
    parentScreen: QuickTestManagerRoute,
  },
  {
    route: QuickTestScreenRoom.route,
    screen: QuickTestScreenRoom,
    isNavigation: false,
    parentScreen: QuickTestManagerRoute,
  },
  {
    route: QuickTestScreenUser.route,
    screen: QuickTestScreenUser,
    isNavigation: false,
    parentScreen: QuickTestManagerRoute,
  },
  {
    route: QuickTestScreenPresence.route,
    screen: QuickTestScreenPresence,
    isNavigation: false,
    parentScreen: QuickTestManagerRoute,
  },
  {
    route: QuickTestScreenPush.route,
    screen: QuickTestScreenPush,
    isNavigation: false,
    parentScreen: QuickTestManagerRoute,
  },
];
