import React, { ReactNode } from 'react';
import { View } from 'react-native';
import {
  ChatCircleChannelListener,
  ChatCircleServerListener,
  ChatCircleUserRole,
  ChatClient,
} from 'react-native-chat-sdk';
import { styleValues } from '../__internal__/Css';
import {
  LeafScreenBase,
  StateBase,
  StatelessBase,
} from '../__internal__/LeafScreenBase';
import { metaDataList, MN } from './CircleManagerData';
import type { ApiParams } from '../__internal__/DataTypes';
import { generateData } from '../__internal__/Utils';

export interface StateCircle extends StateBase {
  createServer: {
    serverName: string;
    serverIcon: string;
    serverDescription: string;
    serverExtension: string;
  };
  destroyServer: {
    serverId: string;
  };
  updateServer: {
    serverId: string;
    serverName: string;
    serverIcon: string;
    serverDescription: string;
    serverExtension: string;
  };
  joinServer: {
    serverId: string;
  };
  leaveServer: {
    serverId: string;
  };
  removeUserFromServer: {
    serverId: string;
    userId: string;
  };
  inviteUserToServer: {
    serverId: string;
    userId: string;
    welcome: string;
  };
  acceptServerInvitation: {
    serverId: string;
    inviter: string;
  };
  declineServerInvitation: {
    serverId: string;
    inviter: string;
  };
  addTagsToServer: {
    serverId: string;
    serverTags: string[];
  };
  removeTagsFromServer: {
    serverId: string;
    serverTags: string[];
  };
  fetchServerTags: {
    serverId: string;
  };
  addModeratorToServer: {
    serverId: string;
    userId: string;
  };
  removeModeratorFromServer: {
    serverId: string;
    userId: string;
  };
  fetchSelfServerRole: {
    serverId: string;
  };
  fetchJoinedServers: {
    cursor: string;
    pageSize: number;
  };
  fetchServerDetail: {
    serverId: string;
  };
  fetchServersWithKeyword: {
    keyword: string;
  };
  fetchServerMembers: {
    serverId: string;
    pageSize: number;
    cursor: string;
  };
  checkSelfInServer: {
    serverId: string;
  };
  createChannel: {
    serverId: string;
    channelName: string;
    channelDescription: string;
    channelExtension: string;
    channelRank: number;
    channelType: number;
  };
  destroyChannel: {
    serverId: string;
    channelId: string;
  };
  updateChannel: {
    serverId: string;
    channelId: string;
    channelName: string;
    channelDescription: string;
    channelExtension: string;
    channelRank: number;
  };
  joinChannel: {
    serverId: string;
    channelId: string;
  };
  leaveChannel: {
    serverId: string;
    channelId: string;
  };
  removeUserFromChannel: {
    serverId: string;
    channelId: string;
    userId: string;
  };
  inviteUserToChannel: {
    serverId: string;
    channelId: string;
    userId: string;
    welcome: string;
  };
  acceptChannelInvitation: {
    serverId: string;
    channelId: string;
    inviter: string;
  };
  declineChannelInvitation: {
    serverId: string;
    channelId: string;
    inviter: string;
  };
  muteUserInChannel: {
    serverId: string;
    channelId: string;
    userId: string;
    duration: number;
  };
  unmuteUserInChannel: {
    serverId: string;
    channelId: string;
    userId: string;
  };
  fetchChannelDetail: {
    serverId: string;
    channelId: string;
  };
  fetchPublicChannelInServer: {
    serverId: string;
    pageSize: number;
    cursor: string;
  };
  fetchChannelMembers: {
    serverId: string;
    channelId: string;
    pageSize: number;
    cursor: string;
  };
  fetchVisiblePrivateChannelInServer: {
    serverId: string;
    pageSize: number;
    cursor: string;
  };
  checkSelfIsInChannel: {
    serverId: string;
    channelId: string;
  };
  fetchChannelMuteUsers: {
    serverId: string;
    channelId: string;
  };
}

export interface StatelessCircle extends StatelessBase {}

const statelessDataValue: StatelessCircle = {};

export class CircleManagerLeafScreen extends LeafScreenBase<StateCircle> {
  protected static TAG = 'CircleManagerLeafScreen';
  public static route = 'CircleManagerLeafScreen';
  metaData: Map<string, ApiParams>;
  statelessData: StatelessCircle;
  constructor(props: { navigation: any }) {
    super(props);
    this.metaData = metaDataList;
    this.state = Object.assign({}, generateData(metaDataList), {
      sendResult: '',
      recvResult: '',
      exceptResult: '',
    });
    this.statelessData = statelessDataValue;
  }

  protected addListener?(): void {
    console.log(`${CircleManagerLeafScreen.TAG}: addListener`);
    ChatClient.getInstance().circleManager.clearChannelListener();
    ChatClient.getInstance().circleManager.addChannelListener(
      new (class implements ChatCircleChannelListener {
        private that: CircleManagerLeafScreen;
        constructor(parent: CircleManagerLeafScreen) {
          this.that = parent;
        }
        onChannelCreated?(params: {
          serverId: string;
          channelId: string;
          creator: string;
        }): void {
          console.log(
            `${CircleManagerLeafScreen.TAG}: ${this.onChannelCreated?.name}:`,
            params
          );
        }
        onChannelDestroyed?(params: {
          serverId: string;
          channelId: string;
          initiator: string;
        }): void {
          console.log(
            `${CircleManagerLeafScreen.TAG}: ${this.onChannelDestroyed?.name}:`,
            params
          );
        }
        onChannelUpdated?(params: {
          serverId: string;
          channelId: string;
          channelName: string;
          channelDescription: string;
          initiator: string;
        }): void {
          console.log(
            `${CircleManagerLeafScreen.TAG}: ${this.onChannelUpdated?.name}:`,
            params
          );
        }
        onMemberJoinedChannel?(params: {
          serverId: string;
          channelId: string;
          memberId: string;
        }): void {
          console.log(
            `${CircleManagerLeafScreen.TAG}: ${this.onMemberJoinedChannel?.name}:`,
            params
          );
        }
        onMemberLeftChannel?(params: {
          serverId: string;
          channelId: string;
          memberId: string;
        }): void {
          console.log(
            `${CircleManagerLeafScreen.TAG}: ${this.onMemberLeftChannel?.name}:`,
            params
          );
        }
        onMemberRemovedFromChannel?(params: {
          serverId: string;
          channelId: string;
          memberId: string;
          initiator: string;
        }): void {
          console.log(
            `${CircleManagerLeafScreen.TAG}: ${this.onMemberRemovedFromChannel?.name}:`,
            params
          );
        }
        onReceiveChannelInvitation?(params: {
          serverId: string;
          serverName: string;
          serverIcon: string;
          channelId: string;
          channelName: string;
          channelDescription: string;
          inviter: string;
        }): void {
          console.log(
            `${CircleManagerLeafScreen.TAG}: ${this.onReceiveChannelInvitation?.name}:`,
            params
          );
        }
        onChannelInvitationBeAccepted?(params: {
          serverId: string;
          channelId: string;
          invitee: string;
        }): void {
          console.log(
            `${CircleManagerLeafScreen.TAG}: ${this.onChannelInvitationBeAccepted?.name}:`,
            params
          );
        }
        onChannelInvitationBeDeclined?(params: {
          serverId: string;
          channelId: string;
          invitee: string;
        }): void {
          console.log(
            `${CircleManagerLeafScreen.TAG}: ${this.onChannelInvitationBeDeclined?.name}:`,
            params
          );
        }
        onMemberMuteChangeInChannel?(params: {
          serverId: string;
          channelId: string;
          isMuted: boolean;
          memberIds: string;
        }): void {
          console.log(
            `${CircleManagerLeafScreen.TAG}: ${this.onMemberMuteChangeInChannel?.name}:`,
            params
          );
        }
      })(this)
    );
    ChatClient.getInstance().circleManager.clearServerListener();
    ChatClient.getInstance().circleManager.addServerListener(
      new (class implements ChatCircleServerListener {
        private that: CircleManagerLeafScreen;
        constructor(parent: CircleManagerLeafScreen) {
          this.that = parent;
        }
        onServerDestroyed?(params: {
          serverId: string;
          initiator: string;
        }): void {
          console.log(
            `${CircleManagerLeafScreen.TAG}: ${this.onServerDestroyed?.name}:`,
            params
          );
        }
        onServerUpdated?(params: {
          serverId: string;
          serverName: string;
          serverDescription: string;
          serverCustom: string;
          serverIconUrl: string;
          eventSenderId: string;
          eventReceiveIds: Array<string>;
          timestamp: number;
        }): void {
          console.log(
            `${CircleManagerLeafScreen.TAG}: ${this.onServerUpdated?.name}:`,
            params
          );
        }
        onMemberJoinedServer?(params: {
          serverId: string;
          memberId: string;
        }): void {
          console.log(
            `${CircleManagerLeafScreen.TAG}: ${this.onMemberJoinedServer?.name}:`,
            params
          );
        }
        onMemberLeftServer?(params: {
          serverId: string;
          memberId: string;
        }): void {
          console.log(
            `${CircleManagerLeafScreen.TAG}: ${this.onMemberLeftServer?.name}:`,
            params
          );
        }
        onMemberRemovedFromServer?(params: {
          serverId: string;
          memberIds: string[];
        }): void {
          console.log(
            `${CircleManagerLeafScreen.TAG}: ${this.onMemberRemovedFromServer?.name}:`,
            params
          );
        }
        onReceiveServerInvitation?(params: {
          serverId: string;
          serverName: string;
          serverDescription: string;
          serverCustom: string;
          serverIconUrl: string;
          eventSenderId: string;
          eventReceiveIds: Array<string>;
          timestamp: number;
        }): void {
          console.log(
            `${CircleManagerLeafScreen.TAG}: ${this.onReceiveServerInvitation?.name}:`,
            params
          );
        }
        onServerInvitationBeAccepted?(params: {
          serverId: string;
          invitee: string;
        }): void {
          console.log(
            `${CircleManagerLeafScreen.TAG}: ${this.onServerInvitationBeAccepted?.name}:`,
            params
          );
        }
        onServerInvitationBeDeclined?(params: {
          serverId: string;
          invitee: string;
        }): void {
          console.log(
            `${CircleManagerLeafScreen.TAG}: ${this.onServerInvitationBeDeclined?.name}:`,
            params
          );
        }
        onServerRoleAssigned?(params: {
          serverId: string;
          memberId: string;
          role: ChatCircleUserRole;
        }): void {
          console.log(
            `${CircleManagerLeafScreen.TAG}: ${this.onServerRoleAssigned?.name}:`,
            params
          );
        }
      })(this)
    );
  }

  protected removeListener?(): void {
    console.log(`${CircleManagerLeafScreen.TAG}: removeListener`);
  }

  protected renderResult(): ReactNode {
    return (
      <View style={styleValues.containerColumn}>
        {this.renderSendResult()}
        {this.renderRecvResult()}
        {this.renderExceptionResult()}
      </View>
    );
  }

  protected renderBody(): ReactNode {
    // console.log(`${CircleManagerLeafScreen.TAG}: renderBody: `);
    return (
      <View style={styleValues.containerColumn}>{this.renderApiDom()}</View>
    );
  }
  protected renderApiDom(): ReactNode[] {
    const apiList = [
      'createServer',
      'destroyServer',
      'updateServer',
      'joinServer',
      'leaveServer',
      'removeUserFromServer',
      'inviteUserToServer',
      'acceptServerInvitation',
      'declineServerInvitation',
      'addTagsToServer',
      'removeTagsFromServer',
      'fetchServerTags',
      'addModeratorToServer',
      'removeModeratorFromServer',
      'fetchSelfServerRole',
      'fetchJoinedServers',
      'fetchServerDetail',
      'fetchServersWithKeyword',
      'fetchServerMembers',
      'checkSelfInServer',
      'createChannel',
      'destroyChannel',
      'updateChannel',
      'joinChannel',
      'leaveChannel',
      'removeUserFromChannel',
      'inviteUserToChannel',
      'acceptChannelInvitation',
      'declineChannelInvitation',
      'muteUserInChannel',
      'unmuteUserInChannel',
      'fetchChannelDetail',
      'fetchPublicChannelInServer',
      'fetchChannelMembers',
      'fetchVisiblePrivateChannelInServer',
      'checkSelfIsInChannel',
      'fetchChannelMuteUsers',
    ];
    let renderDomAry: ({} | null | undefined)[] = [];
    const data = this.metaData;
    apiList.forEach((apiItem) => {
      this.setKeyPrefix(apiItem);
      renderDomAry.push(
        this.renderParamWithText(data.get(apiItem)!.methodName)
      );
      data.get(apiItem)?.params.forEach((item) => {
        let currentData = data.get(apiItem);
        let itemValue =
          this.state[apiItem as keyof typeof this.state][
            item.paramName as keyof typeof currentData
          ];
        if (item.domType && item.domType === 'select') {
          if (item.paramType === 'boolean') {
            renderDomAry.push(
              this.renderParamWithEnum(
                item.paramName,
                ['true', 'false'],
                itemValue ? 'true' : 'false',
                (index: string, option: any) => {
                  let inputData = option === 'true' ? true : false;
                  let pv: any = {};
                  pv[apiItem] = Object.assign(
                    {},
                    this.state[apiItem as keyof typeof this.state],
                    inputData
                  );
                  return this.setState(pv);
                }
              )
            );
          }
        } else {
          let value = this.parseValue(item.paramType, itemValue);
          renderDomAry.push(
            this.renderGroupParamWithInput(
              item.paramName,
              item.paramType,
              value,
              (inputData: { [index: string]: string }) => {
                let pv: any = {};
                pv[apiItem] = Object.assign(
                  {},
                  this.state[apiItem as keyof typeof this.state],
                  inputData
                );
                return this.setState(pv);
              }
            )
          );
        }
      });
      renderDomAry.push(
        this.renderButton(data.get(apiItem)!.methodName, () => {
          this.callApi(data.get(apiItem)!.methodName);
        })
      );
      renderDomAry.push(this.renderDivider());
    });
    renderDomAry.push(this.addSpaces());
    return renderDomAry;
  }

  private callApi(name: string): void {
    console.log(`${CircleManagerLeafScreen.TAG}: callApi: `);
    switch (name) {
      case MN.createServer:
        {
          const { serverName, serverIcon, serverDescription, serverExtension } =
            this.state.createServer;
          this.tryCatch(
            ChatClient.getInstance().circleManager.createServer({
              serverName,
              serverIcon,
              serverDescription,
              serverExtension,
            }),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.destroyServer:
        {
          const { serverId } = this.state.destroyServer;
          this.tryCatch(
            ChatClient.getInstance().circleManager.destroyServer(serverId),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.updateServer:
        {
          const {
            serverId,
            serverName,
            serverIcon,
            serverDescription,
            serverExtension,
          } = this.state.updateServer;
          this.tryCatch(
            ChatClient.getInstance().circleManager.updateServer({
              serverId,
              serverName,
              serverIcon,
              serverDescription,
              serverExtension,
            }),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.joinServer:
        {
          const { serverId } = this.state.joinServer;
          this.tryCatch(
            ChatClient.getInstance().circleManager.joinServer(serverId),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.leaveServer:
        {
          const { serverId } = this.state.leaveServer;
          this.tryCatch(
            ChatClient.getInstance().circleManager.leaveServer(serverId),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.removeUserFromServer:
        {
          const { serverId, userId } = this.state.removeUserFromServer;
          this.tryCatch(
            ChatClient.getInstance().circleManager.removeUserFromServer({
              serverId,
              userId,
            }),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.inviteUserToServer:
        {
          const { serverId, userId, welcome } = this.state.inviteUserToServer;
          this.tryCatch(
            ChatClient.getInstance().circleManager.inviteUserToServer({
              serverId,
              userId,
              welcome,
            }),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.acceptServerInvitation:
        {
          const { serverId, inviter } = this.state.acceptServerInvitation;
          this.tryCatch(
            ChatClient.getInstance().circleManager.acceptServerInvitation({
              serverId,
              inviter,
            }),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.declineServerInvitation:
        {
          const { serverId, inviter } = this.state.declineServerInvitation;
          this.tryCatch(
            ChatClient.getInstance().circleManager.declineServerInvitation({
              serverId,
              inviter,
            }),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.addTagsToServer:
        {
          const { serverId, serverTags } = this.state.addTagsToServer;
          this.tryCatch(
            ChatClient.getInstance().circleManager.addTagsToServer({
              serverId,
              serverTags,
            }),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.removeTagsFromServer:
        {
          const { serverId, serverTags } = this.state.removeTagsFromServer;
          this.tryCatch(
            ChatClient.getInstance().circleManager.removeTagsFromServer({
              serverId,
              serverTags,
            }),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.fetchServerTags:
        {
          const { serverId } = this.state.fetchServerTags;
          this.tryCatch(
            ChatClient.getInstance().circleManager.fetchServerTags(serverId),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.addModeratorToServer:
        {
          const { serverId, userId } = this.state.addModeratorToServer;
          this.tryCatch(
            ChatClient.getInstance().circleManager.addModeratorToServer({
              serverId,
              userId,
            }),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.removeModeratorFromServer:
        {
          const { serverId, userId } = this.state.removeModeratorFromServer;
          this.tryCatch(
            ChatClient.getInstance().circleManager.removeModeratorFromServer({
              serverId,
              userId,
            }),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.fetchSelfServerRole:
        {
          const { serverId } = this.state.fetchSelfServerRole;
          this.tryCatch(
            ChatClient.getInstance().circleManager.fetchSelfServerRole(
              serverId
            ),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.fetchJoinedServers:
        {
          const { cursor, pageSize } = this.state.fetchJoinedServers;
          this.tryCatch(
            ChatClient.getInstance().circleManager.fetchJoinedServers({
              cursor,
              pageSize,
            }),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.fetchServerDetail:
        {
          const { serverId } = this.state.fetchServerDetail;
          this.tryCatch(
            ChatClient.getInstance().circleManager.fetchServerDetail(serverId),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.fetchServersWithKeyword:
        {
          const { keyword } = this.state.fetchServersWithKeyword;
          this.tryCatch(
            ChatClient.getInstance().circleManager.fetchServersWithKeyword(
              keyword
            ),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.fetchServerMembers:
        {
          const { serverId, pageSize, cursor } = this.state.fetchServerMembers;
          this.tryCatch(
            ChatClient.getInstance().circleManager.fetchServerMembers({
              serverId,
              pageSize,
              cursor,
            }),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.checkSelfInServer:
        {
          const { serverId } = this.state.checkSelfInServer;
          this.tryCatch(
            ChatClient.getInstance().circleManager.checkSelfInServer(serverId),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.createChannel:
        {
          const {
            serverId,
            channelName,
            channelDescription,
            channelExtension,
            channelRank,
            channelType,
          } = this.state.createChannel;
          this.tryCatch(
            ChatClient.getInstance().circleManager.createChannel({
              serverId,
              channelName,
              channelDescription,
              channelExtension,
              channelRank,
              channelType,
            }),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.destroyChannel:
        {
          const { serverId, channelId } = this.state.destroyChannel;
          this.tryCatch(
            ChatClient.getInstance().circleManager.destroyChannel({
              serverId,
              channelId,
            }),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.updateChannel:
        {
          const {
            serverId,
            channelId,
            channelName,
            channelDescription,
            channelExtension,
            channelRank,
          } = this.state.updateChannel;
          this.tryCatch(
            ChatClient.getInstance().circleManager.updateChannel({
              serverId,
              channelId,
              channelName,
              channelDescription,
              channelExtension,
              channelRank,
            }),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.joinChannel:
        {
          const { serverId, channelId } = this.state.joinChannel;
          this.tryCatch(
            ChatClient.getInstance().circleManager.joinChannel({
              serverId,
              channelId,
            }),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.leaveChannel:
        {
          const { serverId, channelId } = this.state.leaveChannel;
          this.tryCatch(
            ChatClient.getInstance().circleManager.leaveChannel({
              serverId,
              channelId,
            }),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.removeUserFromChannel:
        {
          const { serverId, channelId, userId } =
            this.state.removeUserFromChannel;
          this.tryCatch(
            ChatClient.getInstance().circleManager.removeUserFromChannel({
              serverId,
              channelId,
              userId,
            }),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.inviteUserToChannel:
        {
          const { serverId, channelId, userId, welcome } =
            this.state.inviteUserToChannel;
          this.tryCatch(
            ChatClient.getInstance().circleManager.inviteUserToChannel({
              serverId,
              channelId,
              userId,
              welcome,
            }),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.acceptChannelInvitation:
        {
          const { serverId, channelId, inviter } =
            this.state.acceptChannelInvitation;
          this.tryCatch(
            ChatClient.getInstance().circleManager.acceptChannelInvitation({
              serverId,
              channelId,
              inviter,
            }),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.declineChannelInvitation:
        {
          const { serverId, channelId, inviter } =
            this.state.declineChannelInvitation;
          this.tryCatch(
            ChatClient.getInstance().circleManager.declineChannelInvitation({
              serverId,
              channelId,
              inviter,
            }),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.muteUserInChannel:
        {
          const { serverId, channelId, userId, duration } =
            this.state.muteUserInChannel;
          this.tryCatch(
            ChatClient.getInstance().circleManager.muteUserInChannel({
              serverId,
              channelId,
              userId,
              duration,
            }),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.unmuteUserInChannel:
        {
          const { serverId, channelId, userId } =
            this.state.unmuteUserInChannel;
          this.tryCatch(
            ChatClient.getInstance().circleManager.unmuteUserInChannel({
              serverId,
              channelId,
              userId,
            }),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.fetchChannelDetail:
        {
          const { serverId, channelId } = this.state.fetchChannelDetail;
          this.tryCatch(
            ChatClient.getInstance().circleManager.fetchChannelDetail({
              serverId,
              channelId,
            }),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.fetchPublicChannelInServer:
        {
          const { serverId, pageSize, cursor } =
            this.state.fetchPublicChannelInServer;
          this.tryCatch(
            ChatClient.getInstance().circleManager.fetchPublicChannelInServer({
              serverId,
              pageSize,
              cursor,
            }),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.fetchChannelMembers:
        {
          const { serverId, channelId, pageSize, cursor } =
            this.state.fetchChannelMembers;
          this.tryCatch(
            ChatClient.getInstance().circleManager.fetchChannelMembers({
              serverId,
              channelId,
              pageSize,
              cursor,
            }),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.fetchVisiblePrivateChannelInServer:
        {
          const { serverId, pageSize, cursor } =
            this.state.fetchVisiblePrivateChannelInServer;
          this.tryCatch(
            ChatClient.getInstance().circleManager.fetchVisiblePrivateChannelInServer(
              {
                serverId,
                pageSize,
                cursor,
              }
            ),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.checkSelfIsInChannel:
        {
          const { serverId, channelId } = this.state.checkSelfIsInChannel;
          this.tryCatch(
            ChatClient.getInstance().circleManager.checkSelfIsInChannel({
              serverId,
              channelId,
            }),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.fetchChannelMuteUsers:
        {
          const { serverId, channelId } = this.state.fetchChannelMuteUsers;
          this.tryCatch(
            ChatClient.getInstance().circleManager.fetchChannelMuteUsers({
              serverId,
              channelId,
            }),
            CircleManagerLeafScreen.TAG,
            name
          );
        }
        break;

      default:
        break;
    }
  }
}
