import {
  QuickTestScreenBase,
  QuickTestState,
  QuickTestStateless,
  registerStateDataList,
} from './QuickTestScreenBase';
import { MN, metaDataList } from './QuickTestCircleData';
import {
  ChatClient,
  ChatCircleChannelRankFromNumber,
  ChatCircleChannelTypeFromNumber,
} from 'react-native-chat-sdk';

export interface QuickTestCircleState extends QuickTestState {}

export interface QuickTestCircleStateless extends QuickTestStateless {}

export class QuickTestScreenCircle extends QuickTestScreenBase<
  QuickTestCircleState,
  QuickTestCircleStateless
> {
  protected static TAG = 'QuickTestScreenCircle';
  public static route = 'QuickTestScreenCircle';
  statelessData: QuickTestCircleStateless;

  constructor(props: { navigation: any }) {
    super(props);
    this.state = {
      cmd: '',
      connect_listener: '',
      multi_listener: '',
      custom_listener: '',
      chat_listener: '',
      contact_listener: '',
      conv_listener: '',
      group_listener: '',
      room_listener: '',
      presence_listener: '',
      server_listener: '',
      channel_listener: '',
      sendResult: '',
      recvResult: '',
      exceptResult: '',
      cb_result: '',
    };
    this.statelessData = {};
    registerStateDataList(metaDataList);
    console.log('metaData: ', JSON.stringify(this.metaData));
  }

  /**
   * 如果有特殊需求，可以将监听器移动到各个子类里面进行处理。
   */
  protected addListener?(): void {
    if (super.addListener) {
      super.addListener();
    }
  }

  protected removeListener?(): void {
    if (super.removeListener) {
      super.removeListener();
    }
  }

  /**
   * 调用对应的SDK方法
   * @param name 方法名称
   */
  protected callApi(name: string): void {
    super.callApi(name);
    const methodName = this.metaData.get(name)?.methodName;
    console.log(`${name} === ${methodName}`);
    switch (name) {
      case MN.createServer:
        {
          const serverName =
            this.metaData.get(name)!.params[0].paramDefaultValue;
          const serverIcon =
            this.metaData.get(name)!.params[1].paramDefaultValue;
          const serverDescription =
            this.metaData.get(name)!.params[2].paramDefaultValue;
          const serverExtension =
            this.metaData.get(name)!.params[3].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.createServer({
              serverName,
              serverIcon,
              serverDescription,
              serverExtension,
            }),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.destroyServer:
        {
          const serverId = this.metaData.get(name)!.params[0].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.destroyServer(serverId),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.updateServer:
        {
          const serverId = this.metaData.get(name)!.params[0].paramDefaultValue;
          const serverName =
            this.metaData.get(name)!.params[1].paramDefaultValue;
          const serverIcon =
            this.metaData.get(name)!.params[2].paramDefaultValue;
          const serverDescription =
            this.metaData.get(name)!.params[3].paramDefaultValue;
          const serverExtension =
            this.metaData.get(name)!.params[4].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.updateServer({
              serverId,
              serverName,
              serverIcon,
              serverDescription,
              serverExtension,
            }),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.joinServer:
        {
          const serverId = this.metaData.get(name)!.params[0].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.joinServer(serverId),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.leaveServer:
        {
          const serverId = this.metaData.get(name)!.params[0].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.leaveServer(serverId),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.removeUserFromServer:
        {
          const serverId = this.metaData.get(name)!.params[0].paramDefaultValue;
          const userId = this.metaData.get(name)!.params[1].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.removeUserFromServer({
              serverId,
              userId,
            }),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.inviteUserToServer:
        {
          const serverId = this.metaData.get(name)!.params[0].paramDefaultValue;
          const userId = this.metaData.get(name)!.params[1].paramDefaultValue;
          const welcome = this.metaData.get(name)!.params[2].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.inviteUserToServer({
              serverId,
              userId,
              welcome,
            }),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.acceptServerInvitation:
        {
          const serverId = this.metaData.get(name)!.params[0].paramDefaultValue;
          const inviter = this.metaData.get(name)!.params[1].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.acceptServerInvitation({
              serverId,
              inviter,
            }),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.declineServerInvitation:
        {
          const serverId = this.metaData.get(name)!.params[0].paramDefaultValue;
          const inviter = this.metaData.get(name)!.params[1].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.declineServerInvitation({
              serverId,
              inviter,
            }),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.addTagsToServer:
        {
          const serverId = this.metaData.get(name)!.params[0].paramDefaultValue;
          const serverTags =
            this.metaData.get(name)!.params[1].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.addTagsToServer({
              serverId,
              serverTags,
            }),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.removeTagsFromServer:
        {
          const serverId = this.metaData.get(name)!.params[0].paramDefaultValue;
          const serverTags =
            this.metaData.get(name)!.params[1].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.removeTagsFromServer({
              serverId,
              serverTags,
            }),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.fetchServerTags:
        {
          const serverId = this.metaData.get(name)!.params[0].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.fetchServerTags(serverId),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.addModeratorToServer:
        {
          const serverId = this.metaData.get(name)!.params[0].paramDefaultValue;
          const userId = this.metaData.get(name)!.params[1].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.addModeratorToServer({
              serverId,
              userId,
            }),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.removeModeratorFromServer:
        {
          const serverId = this.metaData.get(name)!.params[0].paramDefaultValue;
          const userId = this.metaData.get(name)!.params[1].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.removeModeratorFromServer({
              serverId,
              userId,
            }),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.fetchSelfServerRole:
        {
          const serverId = this.metaData.get(name)!.params[0].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.fetchSelfServerRole(
              serverId
            ),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.fetchJoinedServers:
        {
          const cursor = this.metaData.get(name)!.params[0].paramDefaultValue;
          const pageSize = this.metaData.get(name)!.params[1].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.fetchJoinedServers({
              cursor,
              pageSize,
            }),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.fetchServerDetail:
        {
          const serverId = this.metaData.get(name)!.params[0].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.fetchServerDetail(serverId),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.fetchServersWithKeyword:
        {
          const keyword = this.metaData.get(name)!.params[0].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.fetchServersWithKeyword(
              keyword
            ),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.fetchServerMembers:
        {
          const serverId = this.metaData.get(name)!.params[0].paramDefaultValue;
          const pageSize = this.metaData.get(name)!.params[1].paramDefaultValue;
          const cursor = this.metaData.get(name)!.params[2].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.fetchServerMembers({
              serverId,
              pageSize,
              cursor,
            }),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.checkSelfInServer:
        {
          const serverId = this.metaData.get(name)!.params[0].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.checkSelfInServer(serverId),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.createChannel:
        {
          const serverId = this.metaData.get(name)!.params[0].paramDefaultValue;
          const channelName =
            this.metaData.get(name)!.params[1].paramDefaultValue;
          const channelDescription =
            this.metaData.get(name)!.params[2].paramDefaultValue;
          const channelExtension =
            this.metaData.get(name)!.params[3].paramDefaultValue;
          const channelRank: number =
            this.metaData.get(name)!.params[4].paramDefaultValue;
          const channelType: number =
            this.metaData.get(name)!.params[5].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.createChannel({
              serverId,
              channelName,
              channelDescription,
              channelExtension,
              channelRank: ChatCircleChannelRankFromNumber(channelRank),
              channelType: ChatCircleChannelTypeFromNumber(channelType),
            }),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.destroyChannel:
        {
          const serverId = this.metaData.get(name)!.params[0].paramDefaultValue;
          const channelId =
            this.metaData.get(name)!.params[1].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.destroyChannel({
              serverId,
              channelId,
            }),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.updateChannel:
        {
          const serverId = this.metaData.get(name)!.params[0].paramDefaultValue;
          const channelId =
            this.metaData.get(name)!.params[1].paramDefaultValue;
          const channelName =
            this.metaData.get(name)!.params[2].paramDefaultValue;
          const channelDescription =
            this.metaData.get(name)!.params[3].paramDefaultValue;
          const channelExtension =
            this.metaData.get(name)!.params[3].paramDefaultValue;
          const channelRank: number =
            this.metaData.get(name)!.params[5].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.updateChannel({
              serverId,
              channelId,
              channelName,
              channelDescription,
              channelExtension,
              channelRank: ChatCircleChannelRankFromNumber(channelRank),
            }),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.joinChannel:
        {
          const serverId = this.metaData.get(name)!.params[0].paramDefaultValue;
          const channelId =
            this.metaData.get(name)!.params[1].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.joinChannel({
              serverId,
              channelId,
            }),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.leaveChannel:
        {
          const serverId = this.metaData.get(name)!.params[0].paramDefaultValue;
          const channelId =
            this.metaData.get(name)!.params[1].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.leaveChannel({
              serverId,
              channelId,
            }),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.removeUserFromChannel:
        {
          const serverId = this.metaData.get(name)!.params[0].paramDefaultValue;
          const channelId =
            this.metaData.get(name)!.params[1].paramDefaultValue;
          const userId = this.metaData.get(name)!.params[2].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.removeUserFromChannel({
              serverId,
              channelId,
              userId,
            }),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.inviteUserToChannel:
        {
          const serverId = this.metaData.get(name)!.params[0].paramDefaultValue;
          const channelId =
            this.metaData.get(name)!.params[1].paramDefaultValue;
          const userId = this.metaData.get(name)!.params[2].paramDefaultValue;
          const welcome = this.metaData.get(name)!.params[3].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.inviteUserToChannel({
              serverId,
              channelId,
              userId,
              welcome,
            }),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.acceptChannelInvitation:
        {
          const serverId = this.metaData.get(name)!.params[0].paramDefaultValue;
          const channelId =
            this.metaData.get(name)!.params[1].paramDefaultValue;
          const inviter = this.metaData.get(name)!.params[2].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.acceptChannelInvitation({
              serverId,
              channelId,
              inviter,
            }),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.declineChannelInvitation:
        {
          const serverId = this.metaData.get(name)!.params[0].paramDefaultValue;
          const channelId =
            this.metaData.get(name)!.params[1].paramDefaultValue;
          const inviter = this.metaData.get(name)!.params[2].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.declineChannelInvitation({
              serverId,
              channelId,
              inviter,
            }),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.muteUserInChannel:
        {
          const serverId = this.metaData.get(name)!.params[0].paramDefaultValue;
          const channelId =
            this.metaData.get(name)!.params[1].paramDefaultValue;
          const userId = this.metaData.get(name)!.params[2].paramDefaultValue;
          const duration = this.metaData.get(name)!.params[3].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.muteUserInChannel({
              serverId,
              channelId,
              userId,
              duration,
            }),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.unmuteUserInChannel:
        {
          const serverId = this.metaData.get(name)!.params[0].paramDefaultValue;
          const channelId =
            this.metaData.get(name)!.params[1].paramDefaultValue;
          const userId = this.metaData.get(name)!.params[2].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.unmuteUserInChannel({
              serverId,
              channelId,
              userId,
            }),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.fetchChannelDetail:
        {
          const serverId = this.metaData.get(name)!.params[0].paramDefaultValue;
          const channelId =
            this.metaData.get(name)!.params[1].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.fetchChannelDetail({
              serverId,
              channelId,
            }),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.fetchPublicChannelInServer:
        {
          const serverId = this.metaData.get(name)!.params[0].paramDefaultValue;
          const pageSize = this.metaData.get(name)!.params[1].paramDefaultValue;
          const cursor = this.metaData.get(name)!.params[2].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.fetchPublicChannelInServer({
              serverId,
              pageSize,
              cursor,
            }),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.fetchChannelMembers:
        {
          const serverId = this.metaData.get(name)!.params[0].paramDefaultValue;
          const channelId =
            this.metaData.get(name)!.params[1].paramDefaultValue;
          const pageSize = this.metaData.get(name)!.params[2].paramDefaultValue;
          const cursor = this.metaData.get(name)!.params[3].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.fetchChannelMembers({
              serverId,
              channelId,
              pageSize,
              cursor,
            }),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.fetchVisiblePrivateChannelInServer:
        {
          const serverId = this.metaData.get(name)!.params[0].paramDefaultValue;
          const pageSize = this.metaData.get(name)!.params[1].paramDefaultValue;
          const cursor = this.metaData.get(name)!.params[2].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.fetchVisiblePrivateChannelInServer(
              {
                serverId,
                pageSize,
                cursor,
              }
            ),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.checkSelfIsInChannel:
        {
          const serverId = this.metaData.get(name)!.params[0].paramDefaultValue;
          const channelId =
            this.metaData.get(name)!.params[1].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.checkSelfIsInChannel({
              serverId,
              channelId,
            }),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;
      case MN.fetchChannelMuteUsers:
        {
          const serverId = this.metaData.get(name)!.params[0].paramDefaultValue;
          const channelId =
            this.metaData.get(name)!.params[1].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().circleManager.fetchChannelMuteUsers({
              serverId,
              channelId,
            }),
            QuickTestScreenCircle.TAG,
            name
          );
        }
        break;

      default:
        console.log(`${name}`);
        break;
    }
  }
}
