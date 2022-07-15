import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { styleValues } from '../__internal__/Css';
import { LeafScreenBase, StateBase } from '../__internal__/LeafScreenBase';
import { metaDataList, MN } from './ChatRoomManagerData';
import type { ApiParams } from '../__internal__/DataTypes';
import { ChatClient, ChatRoomEventListener } from 'react-native-chat-sdk';
import { generateData } from '../__internal__/Utils';
export interface StateChatRoomMessage extends StateBase {
  createChatRoom: {
    subject: string;
    desc?: string;
    welcomeMsg?: string;
    members?: Array<string>;
    maxCount: number;
  };
  fetchPublicChatRoomsFromServer: {
    pageNum: number;
    pageSize: number;
  };
  fetchChatRoomInfoFromServer: {
    roomId: string;
  };
  joinChatRoom: {
    roomId: string;
  };
  leaveChatRoom: {
    roomId: string;
  };
  fetchChatRoomMembers: {
    roomId: string;
    cursor: string;
    pageSize: number;
  };
  getChatRoom: {
    roomId: string;
  };
  changeChatRoomSubject: {
    roomId: string;
    subject: string;
  };
  changeChatRoomDescription: {
    roomId: string;
    description: string;
  };
  changeChatRoomOwner: {
    roomId: string;
    newOwner: string;
  };
  isMemberInChatRoomWhiteListFromServer: {
    roomId: string;
  };
  updateChatRoomAnnouncement: {
    roomId: string;
    announcement: string;
  };
  fetchChatRoomAnnouncement: {
    roomId: string;
  };
  addChatRoomAdmin: {
    roomId: string;
    admin: string;
  };
  removeChatRoomAdmin: {
    roomId: string;
    admin: string;
  };
  removeChatRoomMembers: {
    roomId: string;
    members: Array<string>;
  };
  addMembersToChatRoomWhiteList: {
    roomId: string;
    members: Array<string>;
  };
  removeMembersFromChatRoomWhiteList: {
    roomId: string;
    members: Array<string>;
  };
  fetchChatRoomWhiteListFromServer: {
    roomId: string;
  };
  blockChatRoomMembers: {
    roomId: string;
    members: Array<string>;
  };
  unBlockChatRoomMembers: {
    roomId: string;
    members: Array<string>;
  };
  fetchChatRoomBlockList: {
    roomId: string;
  };
  muteChatRoomMembers: {
    roomId: string;
    muteMembers: Array<string>;
    duration: number;
  };
  unMuteChatRoomMembers: {
    roomId: string;
    unMuteMembers: Array<string>;
  };
  muteAllChatRoomMembers: {
    roomId: string;
  };
  unMuteAllChatRoomMembers: {
    roomId: string;
  };
  fetchChatRoomMuteList: {
    roomId: string;
    pageNum: number;
    pageSize: number;
  };
  destroyChatRoom: {
    roomId: string;
  };
}
export class ChatRoomManagerLeafScreen extends LeafScreenBase<StateChatRoomMessage> {
  protected static TAG = 'ChatRoomManagerLeafScreen';
  public static route = 'ChatRoomManagerLeafScreen';
  metaDataList: Map<string, ApiParams>;
  state: StateChatRoomMessage;
  constructor(props: { navigation: any }) {
    super(props);
    this.metaDataList = metaDataList;
    this.state = Object.assign({}, generateData(metaDataList), {
      sendResult: '',
      recvResult: '',
      exceptResult: '',
    });
  }
  protected renderBody(): ReactNode {
    // console.log(`${ChatRoomManagerLeafScreen.TAG}: renderBody: `);
    return (
      <View style={styleValues.containerColumn}>{this.renderApiDom()}</View>
    );
  }
  protected renderApiDom(): ReactNode[] {
    const apiList = [
      'joinChatRoom',
      'leaveChatRoom',
      'fetchPublicChatRoomsFromServer',
      'fetchChatRoomInfoFromServer',
      'getChatRoomWithId',
      'getAllChatRooms',
      'createChatRoom',
      'destroyChatRoom',
      'changeChatRoomSubject',
      'changeChatRoomDescription',
      'fetchChatRoomMembers',
      'muteChatRoomMembers',
      'unMuteChatRoomMembers',
      'changeOwner',
      'addChatRoomAdmin',
      'removeChatRoomAdmin',
      'fetchChatRoomMuteList',
      'removeChatRoomMembers',
      'blockChatRoomMembers',
      'unBlockChatRoomMembers',
      'fetchChatRoomBlockList',
      'updateChatRoomAnnouncement',
      'fetchChatRoomAnnouncement',
      'fetchChatRoomWhiteListFromServer',
      'isMemberInChatRoomWhiteList',
      'addMembersToChatRoomWhiteList',
      'removeMembersFromChatRoomWhiteList',
      'muteAllChatRoomMembers',
      'unMuteAllChatRoomMembers',
    ];
    let renderDomAry: ({} | null | undefined)[] = [];
    const data = this.metaDataList;
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
        if (item.domType === 'input') {
          let value = this.parseValue(item.paramType, itemValue);
          renderDomAry.push(
            this.renderGroupParamWithInput(
              item.paramName,
              item.paramType,
              value,
              (inputData: { [index: string]: string }) => {
                let paramValue: any = {};
                paramValue[apiItem] = Object.assign(
                  {},
                  this.state[apiItem as keyof typeof this.state],
                  inputData
                );
                return this.setState(paramValue);
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
    console.log(`${ChatRoomManagerLeafScreen.TAG}: callApi: `);
    switch (name) {
      case MN.createChatRoom: {
        const { subject, desc, welcomeMsg, members, maxCount } =
          this.state.createChatRoom;
        this.tryCatch(
          ChatClient.getInstance().roomManager.createChatRoom(
            subject,
            desc,
            welcomeMsg,
            members,
            maxCount
          ),
          ChatRoomManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.fetchPublicChatRoomsFromServer: {
        const { pageNum, pageSize } = this.state.fetchPublicChatRoomsFromServer;
        this.tryCatch(
          ChatClient.getInstance().roomManager.fetchPublicChatRoomsFromServer(
            pageNum,
            pageSize
          ),
          ChatRoomManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.fetchChatRoomInfoFromServer: {
        const { roomId } = this.state.fetchChatRoomInfoFromServer;
        this.tryCatch(
          ChatClient.getInstance().roomManager.fetchChatRoomInfoFromServer(
            roomId
          ),
          ChatRoomManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.joinChatRoom: {
        const { roomId } = this.state.joinChatRoom;
        this.tryCatch(
          ChatClient.getInstance().roomManager.joinChatRoom(roomId),
          ChatRoomManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.leaveChatRoom: {
        const { roomId } = this.state.leaveChatRoom;
        this.tryCatch(
          ChatClient.getInstance().roomManager.leaveChatRoom(roomId),
          ChatRoomManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.fetchChatRoomMembers: {
        const { roomId, cursor, pageSize } = this.state.fetchChatRoomMembers;
        this.tryCatch(
          ChatClient.getInstance().roomManager.fetchChatRoomMembers(
            roomId,
            cursor,
            pageSize
          ),
          ChatRoomManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.getChatRoomWithId: {
        const { roomId } = this.state.getChatRoom;
        this.tryCatch(
          ChatClient.getInstance().roomManager.getChatRoomWithId(roomId),
          ChatRoomManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.changeChatRoomSubject: {
        const { roomId, subject } = this.state.changeChatRoomSubject;
        this.tryCatch(
          ChatClient.getInstance().roomManager.changeChatRoomSubject(
            roomId,
            subject
          ),
          ChatRoomManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.changeChatRoomDescription: {
        const { roomId, description } = this.state.changeChatRoomDescription;
        this.tryCatch(
          ChatClient.getInstance().roomManager.changeChatRoomDescription(
            roomId,
            description
          ),
          ChatRoomManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.changeOwner: {
        const { roomId, newOwner } = this.state.changeChatRoomOwner;
        this.tryCatch(
          ChatClient.getInstance().roomManager.changeOwner(roomId, newOwner),
          ChatRoomManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.isMemberInChatRoomWhiteList: {
        const { roomId } = this.state.isMemberInChatRoomWhiteListFromServer;
        this.tryCatch(
          ChatClient.getInstance().roomManager.isMemberInChatRoomWhiteList(
            roomId
          ),
          ChatRoomManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.updateChatRoomAnnouncement: {
        const { roomId, announcement } = this.state.updateChatRoomAnnouncement;
        this.tryCatch(
          ChatClient.getInstance().roomManager.updateChatRoomAnnouncement(
            roomId,
            announcement
          ),
          ChatRoomManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.fetchChatRoomAnnouncement: {
        const { roomId } = this.state.fetchChatRoomAnnouncement;
        this.tryCatch(
          ChatClient.getInstance().roomManager.fetchChatRoomAnnouncement(
            roomId
          ),
          ChatRoomManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.addChatRoomAdmin: {
        const { roomId, admin } = this.state.addChatRoomAdmin;
        this.tryCatch(
          ChatClient.getInstance().roomManager.addChatRoomAdmin(roomId, admin),
          ChatRoomManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.removeChatRoomAdmin: {
        const { roomId, admin } = this.state.removeChatRoomAdmin;
        this.tryCatch(
          ChatClient.getInstance().roomManager.removeChatRoomAdmin(
            roomId,
            admin
          ),
          ChatRoomManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.removeChatRoomMembers: {
        const { roomId, members } = this.state.removeChatRoomMembers;
        this.tryCatch(
          ChatClient.getInstance().roomManager.removeChatRoomMembers(
            roomId,
            members
          ),
          ChatRoomManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.addMembersToChatRoomWhiteList: {
        const { roomId, members } = this.state.addMembersToChatRoomWhiteList;
        this.tryCatch(
          ChatClient.getInstance().roomManager.addMembersToChatRoomWhiteList(
            roomId,
            members
          ),
          ChatRoomManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.removeMembersFromChatRoomWhiteList: {
        const { roomId, members } =
          this.state.removeMembersFromChatRoomWhiteList;
        this.tryCatch(
          ChatClient.getInstance().roomManager.removeMembersFromChatRoomWhiteList(
            roomId,
            members
          ),
          ChatRoomManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.fetchChatRoomWhiteListFromServer: {
        const { roomId } = this.state.fetchChatRoomWhiteListFromServer;
        this.tryCatch(
          ChatClient.getInstance().roomManager.fetchChatRoomWhiteListFromServer(
            roomId
          ),
          ChatRoomManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.blockChatRoomMembers: {
        const { roomId, members } = this.state.blockChatRoomMembers;
        this.tryCatch(
          ChatClient.getInstance().roomManager.blockChatRoomMembers(
            roomId,
            members
          ),
          ChatRoomManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.unBlockChatRoomMembers: {
        const { roomId, members } = this.state.unBlockChatRoomMembers;
        this.tryCatch(
          ChatClient.getInstance().roomManager.unBlockChatRoomMembers(
            roomId,
            members
          ),
          ChatRoomManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.fetchChatRoomBlockList: {
        const { roomId } = this.state.fetchChatRoomBlockList;
        this.tryCatch(
          ChatClient.getInstance().roomManager.fetchChatRoomBlockList(roomId),
          ChatRoomManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.muteChatRoomMembers: {
        const { roomId, muteMembers, duration } =
          this.state.muteChatRoomMembers;
        this.tryCatch(
          ChatClient.getInstance().roomManager.muteChatRoomMembers(
            roomId,
            muteMembers,
            duration
          ),
          ChatRoomManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.unMuteChatRoomMembers: {
        const { roomId, unMuteMembers } = this.state.unMuteChatRoomMembers;
        this.tryCatch(
          ChatClient.getInstance().roomManager.unMuteChatRoomMembers(
            roomId,
            unMuteMembers
          ),
          ChatRoomManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.muteAllChatRoomMembers: {
        const { roomId } = this.state.muteAllChatRoomMembers;
        this.tryCatch(
          ChatClient.getInstance().roomManager.muteAllChatRoomMembers(roomId),
          ChatRoomManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.unMuteAllChatRoomMembers: {
        const { roomId } = this.state.unMuteAllChatRoomMembers;
        this.tryCatch(
          ChatClient.getInstance().roomManager.unMuteAllChatRoomMembers(roomId),
          ChatRoomManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.fetchChatRoomMuteList: {
        const { roomId, pageNum, pageSize } = this.state.fetchChatRoomMuteList;
        this.tryCatch(
          ChatClient.getInstance().roomManager.fetchChatRoomMuteList(
            roomId,
            pageNum,
            pageSize
          ),
          ChatRoomManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.destroyChatRoom: {
        const { roomId } = this.state.destroyChatRoom;
        this.tryCatch(
          ChatClient.getInstance().roomManager.destroyChatRoom(roomId),
          ChatRoomManagerLeafScreen.TAG,
          name
        );
        break;
      }
      default:
        console.log('error name');
        break;
    }
  }
  protected renderResult(): ReactNode {
    return (
      <View style={styleValues.containerColumn}>
        {this.renderSendResult()}
        {this.renderRecvResult()}
      </View>
    );
  }
  protected addListener?(): void {
    console.log('addListener');
    const roomListener: ChatRoomEventListener = new (class
      implements ChatRoomEventListener
    {
      that: ChatRoomManagerLeafScreen;
      constructor(parent: ChatRoomManagerLeafScreen) {
        this.that = parent;
      }
      onChatRoomDestroyed(params: {
        roomId: string;
        roomName?: string | undefined;
      }): void {
        console.log(
          `${ChatRoomManagerLeafScreen.TAG}: onChatRoomDestroyed:`,
          params.roomId,
          params.roomName
        );
        this.that.setState({
          recvResult: `onChatRoomDestroyed: ` + params.roomId + params.roomName,
        });
      }
      onMemberJoined(params: { roomId: string; participant: string }): void {
        console.log(
          `${ChatRoomManagerLeafScreen.TAG}: onMemberJoined:`,
          params.roomId,
          params.participant
        );
        this.that.setState({
          recvResult: `onMemberJoined: ` + params.roomId + params.participant,
        });
      }
      onMemberExited(params: {
        roomId: string;
        participant: string;
        roomName?: string | undefined;
      }): void {
        console.log(
          `${ChatRoomManagerLeafScreen.TAG}: onMemberJoined:`,
          params.roomId,
          params.participant,
          params.roomName
        );
        this.that.setState({
          recvResult:
            `onMemberJoined: ` +
            params.roomId +
            params.participant +
            params.roomName,
        });
      }
      onRemoved(params: {
        roomId: string;
        participant?: string | undefined;
        roomName?: string | undefined;
      }): void {
        console.log(
          `${ChatRoomManagerLeafScreen.TAG}: onRemoved:`,
          params.roomId,
          params.participant,
          params.roomName
        );
        this.that.setState({
          recvResult:
            `onRemoved: ` +
            params.roomId +
            params.participant +
            params.roomName,
        });
      }
      onMuteListAdded(params: {
        roomId: string;
        mutes: string[];
        expireTime?: string | undefined;
      }): void {
        console.log(
          `${ChatRoomManagerLeafScreen.TAG}: onMuteListAdded:`,
          params.roomId,
          params.mutes,
          params.expireTime
        );
        this.that.setState({
          recvResult:
            `onMuteListAdded: ` +
            params.roomId +
            params.mutes +
            params.expireTime,
        });
      }
      onMuteListRemoved(params: { roomId: string; mutes: string[] }): void {
        console.log(
          `${ChatRoomManagerLeafScreen.TAG}: onMuteListRemoved:`,
          params.roomId,
          params.mutes
        );
        this.that.setState({
          recvResult: `onMuteListRemoved: ` + params.roomId + params.mutes,
        });
      }
      onAdminAdded(params: { roomId: string; admin: string }): void {
        console.log(
          `${ChatRoomManagerLeafScreen.TAG}: onAdminAdded:`,
          params.roomId,
          params.admin
        );
        this.that.setState({
          recvResult: `onAdminAdded: ` + params.roomId + params.admin,
        });
      }
      onAdminRemoved(params: { roomId: string; admin: string }): void {
        console.log(
          `${ChatRoomManagerLeafScreen.TAG}: onAdminRemoved:`,
          params.roomId,
          params.admin
        );
        this.that.setState({
          recvResult: `onAdminRemoved: ` + params.roomId + params.admin,
        });
      }
      onOwnerChanged(params: {
        roomId: string;
        newOwner: string;
        oldOwner: string;
      }): void {
        console.log(
          `${ChatRoomManagerLeafScreen.TAG}: onOwnerChanged:`,
          params.roomId,
          params.newOwner,
          params.oldOwner
        );
        this.that.setState({
          recvResult:
            `onOwnerChanged: ` +
            params.roomId +
            params.newOwner +
            params.oldOwner,
        });
      }
      onAnnouncementChanged(params: {
        roomId: string;
        announcement: string;
      }): void {
        console.log(
          `${ChatRoomManagerLeafScreen.TAG}: onAnnouncementChanged:`,
          params.roomId,
          params.announcement
        );
        this.that.setState({
          recvResult:
            `onAnnouncementChanged: ` + params.roomId + params.announcement,
        });
      }
      onWhiteListAdded(params: { roomId: string; members: string[] }): void {
        console.log(
          `${ChatRoomManagerLeafScreen.TAG}: onWhiteListAdded:`,
          params.roomId,
          params.members
        );
        this.that.setState({
          recvResult: `onWhiteListAdded: ` + params.roomId + params.members,
        });
      }
      onWhiteListRemoved(params: { roomId: string; members: string[] }): void {
        console.log(
          `${ChatRoomManagerLeafScreen.TAG}: onWhiteListRemoved:`,
          params.roomId,
          params.members
        );
        this.that.setState({
          recvResult: `onWhiteListRemoved: ` + params.roomId + params.members,
        });
      }
      onAllChatRoomMemberMuteStateChanged(params: {
        roomId: string;
        isAllMuted: boolean;
      }): void {
        console.log(
          `${ChatRoomManagerLeafScreen.TAG}: onAllChatRoomMemberMuteStateChanged:`,
          params.roomId,
          params.isAllMuted ? 'true' : 'false'
        );
        this.that.setState({
          recvResult:
            `onAllChatRoomMemberMuteStateChanged: ` +
            params.roomId +
            params.isAllMuted
              ? 'true'
              : 'false',
        });
      }
    })(this);
    ChatClient.getInstance().roomManager.removeAllRoomListener();
    ChatClient.getInstance().roomManager.addRoomListener(roomListener);
  }

  protected removeListener?(): void {
    console.log('addListener');
  }
}
