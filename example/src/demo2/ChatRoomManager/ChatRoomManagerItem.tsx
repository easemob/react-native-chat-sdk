import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { styleValues } from '../__internal__/Css';
import { LeafScreenBase, StateBase } from '../__internal__/LeafScreenBase';
import { metaData, CHATROOMMN, stateData } from './ChatRoomManagerData';
import type { ApiParams } from '../__internal__/DataTypes';
import { ChatClient } from 'react-native-chat-sdk';
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
  };
  destroyChatRoom: {
    roomId: string;
  };
}
export class ChatRoomManagerLeafScreen extends LeafScreenBase<StateChatRoomMessage> {
  protected static TAG = 'ChatRoomManagerLeafScreen';
  public static route = 'ChatRoomManagerLeafScreen';
  metaData: Map<string, ApiParams>;
  state: StateChatRoomMessage;
  constructor(props: { navigation: any }) {
    super(props);
    this.metaData = metaData;
    this.state = stateData;
  }
  protected renderBody(): ReactNode {
    console.log(`${ChatRoomManagerLeafScreen.TAG}: renderBody: `);
    return (
      <View style={styleValues.containerColumn}>{this.renderApiDom()}</View>
    );
  }
  protected renderApiDom(): ReactNode[] {
    const apiList = [
      'createChatRoom',
      'fetchPublicChatRoomsFromServer',
      'fetchChatRoomInfoFromServer',
      'getChatRoom',
      'changeChatRoomSubject',
      'changeChatRoomDescription',
      'changeChatRoomOwner',
      'joinChatRoom',
      'leaveChatRoom',
      'fetchChatRoomMembers',
      'isMemberInChatRoomWhiteListFromServer',
      'addMembersToChatRoomWhiteList',
      'removeMembersFromChatRoomWhiteList',
      'fetchChatRoomWhiteListFromServer',
      'blockChatRoomMembers',
      'unBlockChatRoomMembers',
      'fetchChatRoomBlockList',
      'muteChatRoomMembers',
      'unMuteChatRoomMembers',
      'muteAllChatRoomMembers',
      'unMuteAllChatRoomMembers',
      'fetchChatRoomMuteList',
      'updateChatRoomAnnouncement',
      'fetchChatRoomAnnouncement',
      'addChatRoomAdmin',
      'removeChatRoomAdmin',
      'removeChatRoomMembers',
      'destroyChatRoom',
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
          // eslint-disable-next-line no-undef
          this.state[apiItem as keyof typeof this.state][
            item.paramName as keyof typeof currentData
          ];
        if (item.domType === 'input') {
          let value =
            item.paramType === 'object' ? JSON.stringify(itemValue) : itemValue;
          renderDomAry.push(
            this.renderGroupParamWithInput(
              item.paramName,
              item.paramType,
              value,
              (inputData: { [index: string]: string }) => {
                let paramValue: any = {};
                paramValue[apiItem] = Object.assign(
                  {},
                  // eslint-disable-next-line no-undef
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
      case CHATROOMMN.createChatRoom: {
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
          'CHATROOMMN.createChatRoom'
        );
        break;
      }
      case CHATROOMMN.fetchPublicChatRoomsFromServer: {
        const { pageNum, pageSize } = this.state.fetchPublicChatRoomsFromServer;
        this.tryCatch(
          ChatClient.getInstance().roomManager.fetchPublicChatRoomsFromServer(
            pageNum,
            pageSize
          ),
          ChatRoomManagerLeafScreen.TAG,
          'CHATROOMMN.fetchPublicChatRoomsFromServer'
        );
        break;
      }
      case CHATROOMMN.fetchChatRoomInfoFromServer: {
        const { roomId } = this.state.fetchChatRoomInfoFromServer;
        this.tryCatch(
          ChatClient.getInstance().roomManager.fetchChatRoomInfoFromServer(
            roomId
          ),
          ChatRoomManagerLeafScreen.TAG,
          'CHATROOMMN.fetchChatRoomInfoFromServer'
        );
        break;
      }
      case CHATROOMMN.joinChatRoom: {
        const { roomId } = this.state.joinChatRoom;
        this.tryCatch(
          ChatClient.getInstance().roomManager.joinChatRoom(roomId),
          ChatRoomManagerLeafScreen.TAG,
          'CHATROOMMN.joinChatRoom'
        );
        break;
      }
      case CHATROOMMN.leaveChatRoom: {
        const { roomId } = this.state.leaveChatRoom;
        this.tryCatch(
          ChatClient.getInstance().roomManager.leaveChatRoom(roomId),
          ChatRoomManagerLeafScreen.TAG,
          'CHATROOMMN.leaveChatRoom'
        );
        break;
      }
      case CHATROOMMN.fetchChatRoomMembers: {
        const { roomId, cursor, pageSize } = this.state.fetchChatRoomMembers;
        this.tryCatch(
          ChatClient.getInstance().roomManager.fetchChatRoomMembers(
            roomId,
            cursor,
            pageSize
          ),
          ChatRoomManagerLeafScreen.TAG,
          'CHATROOMMN.fetchChatRoomMembers'
        );
        break;
      }
      case CHATROOMMN.getChatRoom: {
        const { roomId } = this.state.getChatRoom;
        this.tryCatch(
          ChatClient.getInstance().roomManager.getChatRoomWithId(roomId),
          ChatRoomManagerLeafScreen.TAG,
          'CHATROOMMN.getChatRoom'
        );
        break;
      }
      case CHATROOMMN.changeChatRoomSubject: {
        const { roomId, subject } = this.state.changeChatRoomSubject;
        this.tryCatch(
          ChatClient.getInstance().roomManager.changeChatRoomSubject(
            roomId,
            subject
          ),
          ChatRoomManagerLeafScreen.TAG,
          'CHATROOMMN.changeChatRoomSubject'
        );
        break;
      }
      case CHATROOMMN.changeChatRoomDescription: {
        const { roomId, description } = this.state.changeChatRoomDescription;
        this.tryCatch(
          ChatClient.getInstance().roomManager.changeChatRoomDescription(
            roomId,
            description
          ),
          ChatRoomManagerLeafScreen.TAG,
          'CHATROOMMN.changeChatRoomDescription'
        );
        break;
      }
      case CHATROOMMN.changeChatRoomOwner: {
        const { roomId, newOwner } = this.state.changeChatRoomOwner;
        this.tryCatch(
          ChatClient.getInstance().roomManager.changeOwner(roomId, newOwner),
          ChatRoomManagerLeafScreen.TAG,
          'CHATROOMMN.changeChatRoomOwner'
        );
        break;
      }
      case CHATROOMMN.isMemberInChatRoomWhiteListFromServer: {
        const { roomId } = this.state.isMemberInChatRoomWhiteListFromServer;
        this.tryCatch(
          ChatClient.getInstance().roomManager.isMemberInChatRoomWhiteList(
            roomId
          ),
          ChatRoomManagerLeafScreen.TAG,
          'CHATROOMMN.isMemberInChatRoomWhiteListFromServer'
        );
        break;
      }
      case CHATROOMMN.updateChatRoomAnnouncement: {
        const { roomId, announcement } = this.state.updateChatRoomAnnouncement;
        this.tryCatch(
          ChatClient.getInstance().roomManager.updateChatRoomAnnouncement(
            roomId,
            announcement
          ),
          ChatRoomManagerLeafScreen.TAG,
          'CHATROOMMN.updateChatRoomAnnouncement'
        );
        break;
      }
      case CHATROOMMN.fetchChatRoomAnnouncement: {
        const { roomId } = this.state.fetchChatRoomAnnouncement;
        this.tryCatch(
          ChatClient.getInstance().roomManager.fetchChatRoomAnnouncement(
            roomId
          ),
          ChatRoomManagerLeafScreen.TAG,
          'CHATROOMMN.fetchChatRoomAnnouncement'
        );
        break;
      }
      case CHATROOMMN.addChatRoomAdmin: {
        const { roomId, admin } = this.state.addChatRoomAdmin;
        this.tryCatch(
          ChatClient.getInstance().roomManager.addChatRoomAdmin(roomId, admin),
          ChatRoomManagerLeafScreen.TAG,
          'CHATROOMMN.addChatRoomAdmin'
        );
        break;
      }
      case CHATROOMMN.removeChatRoomAdmin: {
        const { roomId, admin } = this.state.removeChatRoomAdmin;
        this.tryCatch(
          ChatClient.getInstance().roomManager.removeChatRoomAdmin(
            roomId,
            admin
          ),
          ChatRoomManagerLeafScreen.TAG,
          'CHATROOMMN.removeChatRoomAdmin'
        );
        break;
      }
      case CHATROOMMN.removeChatRoomMembers: {
        const { roomId, members } = this.state.removeChatRoomMembers;
        this.tryCatch(
          ChatClient.getInstance().roomManager.removeChatRoomMembers(
            roomId,
            members
          ),
          ChatRoomManagerLeafScreen.TAG,
          'CHATROOMMN.removeChatRoomMembers'
        );
        break;
      }
      case CHATROOMMN.addMembersToChatRoomWhiteList: {
        const { roomId, members } = this.state.addMembersToChatRoomWhiteList;
        this.tryCatch(
          ChatClient.getInstance().roomManager.addMembersToChatRoomWhiteList(
            roomId,
            members
          ),
          ChatRoomManagerLeafScreen.TAG,
          'CHATROOMMN.addMembersToChatRoomWhiteList'
        );
        break;
      }
      case CHATROOMMN.removeMembersFromChatRoomWhiteList: {
        const { roomId, members } =
          this.state.removeMembersFromChatRoomWhiteList;
        this.tryCatch(
          ChatClient.getInstance().roomManager.removeMembersFromChatRoomWhiteList(
            roomId,
            members
          ),
          ChatRoomManagerLeafScreen.TAG,
          'CHATROOMMN.removeMembersFromChatRoomWhiteList'
        );
        break;
      }
      case CHATROOMMN.fetchChatRoomWhiteListFromServer: {
        const { roomId } = this.state.fetchChatRoomWhiteListFromServer;
        this.tryCatch(
          ChatClient.getInstance().roomManager.fetchChatRoomWhiteListFromServer(
            roomId
          ),
          ChatRoomManagerLeafScreen.TAG,
          'CHATROOMMN.fetchChatRoomWhiteListFromServer'
        );
        break;
      }
      case CHATROOMMN.blockChatRoomMembers: {
        const { roomId, members } = this.state.blockChatRoomMembers;
        this.tryCatch(
          ChatClient.getInstance().roomManager.blockChatRoomMembers(
            roomId,
            members
          ),
          ChatRoomManagerLeafScreen.TAG,
          'CHATROOMMN.blockChatRoomMembers'
        );
        break;
      }
      case CHATROOMMN.unBlockChatRoomMembers: {
        const { roomId, members } = this.state.unBlockChatRoomMembers;
        this.tryCatch(
          ChatClient.getInstance().roomManager.unBlockChatRoomMembers(
            roomId,
            members
          ),
          ChatRoomManagerLeafScreen.TAG,
          'CHATROOMMN.unBlockChatRoomMembers'
        );
        break;
      }
      case CHATROOMMN.fetchChatRoomBlockList: {
        const { roomId } = this.state.fetchChatRoomBlockList;
        this.tryCatch(
          ChatClient.getInstance().roomManager.fetchChatRoomBlockList(roomId),
          ChatRoomManagerLeafScreen.TAG,
          'CHATROOMMN.fetchChatRoomBlockList'
        );
        break;
      }
      case CHATROOMMN.muteChatRoomMembers: {
        const { roomId, muteMembers, duration } =
          this.state.muteChatRoomMembers;
        this.tryCatch(
          ChatClient.getInstance().roomManager.muteChatRoomMembers(
            roomId,
            muteMembers,
            duration
          ),
          ChatRoomManagerLeafScreen.TAG,
          'CHATROOMMN.muteChatRoomMembers'
        );
        break;
      }
      case CHATROOMMN.unMuteChatRoomMembers: {
        const { roomId, unMuteMembers } = this.state.unMuteChatRoomMembers;
        this.tryCatch(
          ChatClient.getInstance().roomManager.unMuteChatRoomMembers(
            roomId,
            unMuteMembers
          ),
          ChatRoomManagerLeafScreen.TAG,
          'CHATROOMMN.unMuteChatRoomMembers'
        );
        break;
      }
      case CHATROOMMN.muteAllChatRoomMembers: {
        const { roomId } = this.state.muteAllChatRoomMembers;
        this.tryCatch(
          ChatClient.getInstance().roomManager.muteAllChatRoomMembers(roomId),
          ChatRoomManagerLeafScreen.TAG,
          'CHATROOMMN.muteAllChatRoomMembers'
        );
        break;
      }
      case CHATROOMMN.unMuteAllChatRoomMembers: {
        const { roomId } = this.state.unMuteAllChatRoomMembers;
        this.tryCatch(
          ChatClient.getInstance().roomManager.unMuteAllChatRoomMembers(roomId),
          ChatRoomManagerLeafScreen.TAG,
          'CHATROOMMN.unMuteAllChatRoomMembers'
        );
        break;
      }
      case CHATROOMMN.fetchChatRoomMuteList: {
        const { roomId } = this.state.fetchChatRoomMuteList;
        this.tryCatch(
          ChatClient.getInstance().roomManager.fetchChatRoomMuteList(roomId),
          ChatRoomManagerLeafScreen.TAG,
          'CHATROOMMN.fetchChatRoomMuteList'
        );
        break;
      }
      case CHATROOMMN.destroyChatRoom: {
        const { roomId } = this.state.destroyChatRoom;
        this.tryCatch(
          ChatClient.getInstance().roomManager.destroyChatRoom(roomId),
          ChatRoomManagerLeafScreen.TAG,
          'CHATROOMMN.destroyChatRoom'
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
  }

  protected removeListener?(): void {
    console.log('addListener');
  }
}
