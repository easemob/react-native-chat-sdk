import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { styleValues } from '../__internal__/Css';
import { LeafScreenBase, StateBase } from '../__internal__/LeafScreenBase';
import { metaDataList, MN } from './ChatRoomManagerData';
import type { ApiParams } from '../__internal__/DataTypes';
import {
  ChatClient,
  ChatRoom,
  ChatRoomEventListener,
} from 'react-native-chat-sdk';
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
  getChatRoomWithId: {
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
  changeOwner: {
    roomId: string;
    newOwner: string;
  };
  isMemberInChatRoomAllowList: {
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
  addMembersToChatRoomAllowList: {
    roomId: string;
    members: Array<string>;
  };
  removeMembersFromChatRoomAllowList: {
    roomId: string;
    members: Array<string>;
  };
  fetchChatRoomAllowListFromServer: {
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
  fetchChatRoomAttributes: {
    roomId: string;
    keys: string[];
  };
  addAttributes: {
    roomId: string;
    attributes: [];
    deleteWhenLeft: boolean;
    overwrite: boolean;
  };
  removeAttributes: {
    roomId: string;
    keys: string[];
    forced: boolean;
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
      'fetchChatRoomAllowListFromServer',
      'isMemberInChatRoomAllowList',
      'addMembersToChatRoomAllowList',
      'removeMembersFromChatRoomAllowList',
      'muteAllChatRoomMembers',
      'unMuteAllChatRoomMembers',
      'fetchChatRoomAttributes',
      'addAttributes',
      'removeAttributes',
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
        const { roomId } = this.state.getChatRoomWithId;
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
        const { roomId, newOwner } = this.state.changeOwner;
        this.tryCatch(
          ChatClient.getInstance().roomManager.changeOwner(roomId, newOwner),
          ChatRoomManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.isMemberInChatRoomAllowList: {
        const { roomId } = this.state.isMemberInChatRoomAllowList;
        this.tryCatch(
          ChatClient.getInstance().roomManager.isMemberInChatRoomAllowList(
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
      case MN.addMembersToChatRoomAllowList: {
        const { roomId, members } = this.state.addMembersToChatRoomAllowList;
        this.tryCatch(
          ChatClient.getInstance().roomManager.addMembersToChatRoomAllowList(
            roomId,
            members
          ),
          ChatRoomManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.removeMembersFromChatRoomAllowList: {
        const { roomId, members } =
          this.state.removeMembersFromChatRoomAllowList;
        this.tryCatch(
          ChatClient.getInstance().roomManager.removeMembersFromChatRoomAllowList(
            roomId,
            members
          ),
          ChatRoomManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.fetchChatRoomAllowListFromServer: {
        const { roomId } = this.state.fetchChatRoomAllowListFromServer;
        this.tryCatch(
          ChatClient.getInstance().roomManager.fetchChatRoomAllowListFromServer(
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
      case MN.fetchChatRoomAttributes: {
        const { roomId, keys } = this.state.fetchChatRoomAttributes;
        this.tryCatch(
          ChatClient.getInstance().roomManager.fetchChatRoomAttributes(
            roomId,
            keys
          ),
          ChatRoomManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.addAttributes: {
        const { roomId, attributes, deleteWhenLeft, overwrite } =
          this.state.addAttributes;
        this.tryCatch(
          ChatClient.getInstance().roomManager.addAttributes({
            roomId,
            attributes,
            deleteWhenLeft,
            overwrite,
          }),
          ChatRoomManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.removeAttributes: {
        const { roomId, keys, forced } = this.state.removeAttributes;
        this.tryCatch(
          ChatClient.getInstance().roomManager.removeAttributes({
            roomId,
            keys,
            forced,
          }),
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
      onAllowListAdded(params: { roomId: string; members: string[] }): void {
        console.log(
          `${ChatRoomManagerLeafScreen.TAG}: onAllowListAdded:`,
          params.roomId,
          params.members
        );
        this.that.setState({
          recvResult: `onAllowListAdded: ` + params.roomId + params.members,
        });
      }
      onAllowListRemoved(params: { roomId: string; members: string[] }): void {
        console.log(
          `${ChatRoomManagerLeafScreen.TAG}: onAllowListRemoved:`,
          params.roomId,
          params.members
        );
        this.that.setState({
          recvResult: `onAllowListRemoved: ` + params.roomId + params.members,
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

      onSpecificationChanged?(room: ChatRoom): void {
        console.log(
          `${ChatRoomManagerLeafScreen.TAG}: onSpecificationChanged:`,
          room
        );
        this.that.setState({
          recvResult: `onSpecificationChanged: ` + room,
        });
      }

      onAttributesUpdated?(params: {
        roomId: string;
        attributes: Map<string, string>;
        from: string;
      }): void {
        console.log(
          `${ChatRoomManagerLeafScreen.TAG}: onAttributesUpdated:`,
          params.roomId,
          params.attributes,
          params.from
        );
        this.that.setState({
          recvResult: `onAttributesUpdated: ${params.roomId}, ${params.attributes}, ${params.from}`,
        });
      }

      onAttributesRemoved?(params: {
        roomId: string;
        removedKeys: Array<string>;
        from: string;
      }): void {
        console.log(
          `${ChatRoomManagerLeafScreen.TAG}: onAttributesRemoved:`,
          params.roomId,
          params.removedKeys,
          params.from
        );
        this.that.setState({
          recvResult: `onAttributesRemoved: ${params.roomId}, ${params.removedKeys}, ${params.from}`,
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
