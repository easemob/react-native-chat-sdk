import {
  QuickTestScreenBase,
  QuickTestState,
  QuickTestStateless,
  registerStateDataList,
} from './QuickTestScreenBase';
//import { MN, metaDataList } from './QuickTestChatData';
import { MN, metaDataList } from './QuickTestRoomData';
import { ChatClient, ChatRoom } from 'react-native-chat-sdk';

export interface QuickTestRoomState extends QuickTestState {}

export interface QuickTestRoomStateless extends QuickTestStateless {}

export class QuickTestScreenRoom extends QuickTestScreenBase<
  QuickTestRoomState,
  QuickTestRoomStateless
> {
  protected static TAG = 'QuickTestScreenRoom';
  public static route = 'QuickTestScreenRoom';
  statelessData: QuickTestRoomStateless;

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
      sendResult: '',
      recvResult: '',
      exceptResult: '',
    }; 
    this.statelessData = {};
    registerStateDataList(metaDataList);
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
    switch (name) {
      case MN.joinChatRoom:
        {
          const methodName = this.metaData.get(
            MN.joinChatRoom
          )!.methodName;
          console.log(`${MN.joinChatRoom} === ${methodName}`);
          const chatroomId = this.metaData.get(MN.joinChatRoom)!.params[0]
            .paramDefaultValue;
          console.log(`chatroomid : ` + chatroomId);
          this.tryCatch(
            ChatClient.getInstance().roomManager.joinChatRoom(
              chatroomId
            ),
            QuickTestScreenRoom.TAG,
            MN.joinChatRoom
          );
        }
        break;
      case MN.leaveChatRoom:
        {
          const methodName = this.metaData.get(
            MN.leaveChatRoom
          )!.methodName;
          console.log(`${MN.leaveChatRoom} === ${methodName}`);
          const chatroomId = this.metaData.get(MN.leaveChatRoom)!.params[0]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().roomManager.leaveChatRoom(
              chatroomId
            ),
            QuickTestScreenRoom.TAG,
            MN.leaveChatRoom
          );
        }
        break;
      case MN.fetchPublicChatRoomsFromServer:
        {
          const methodName = this.metaData.get(MN.fetchPublicChatRoomsFromServer)!.methodName;
          console.log(`${MN.fetchPublicChatRoomsFromServer} === ${methodName}`);
          const pageNum = this.metaData.get(MN.fetchPublicChatRoomsFromServer)!.params[0]
            .paramDefaultValue;
          const pageSize = this.metaData.get(MN.fetchPublicChatRoomsFromServer)!.params[1]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().roomManager.fetchPublicChatRoomsFromServer(
              pageNum, 
              pageSize
            ),
            QuickTestScreenRoom.TAG,
            MN.fetchPublicChatRoomsFromServer
          );
        }
        break;
      case MN.fetchChatRoomInfoFromServer:
        {
          const methodName = this.metaData.get(MN.fetchChatRoomInfoFromServer)!.methodName;
          console.log(`${MN.fetchChatRoomInfoFromServer} === ${methodName}`);
          const chatroomId = this.metaData.get(MN.fetchChatRoomInfoFromServer)!.params[0]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().roomManager.fetchChatRoomInfoFromServer(chatroomId),
            QuickTestScreenRoom.TAG,
            MN.fetchChatRoomInfoFromServer
          );
        }
        break;
      case MN.getChatRoomWithId:
        {
          const methodName = this.metaData.get(
            MN.getChatRoomWithId
          )!.methodName;
          const chatroomId = this.metaData.get(MN.getChatRoomWithId)!.params[0]
            .paramDefaultValue;
          console.log(`${MN.getChatRoomWithId} === ${methodName}`);
          this.tryCatch(
            ChatClient.getInstance().roomManager.getChatRoomWithId(chatroomId),
            QuickTestScreenRoom.TAG,
            MN.getChatRoomWithId
          );
        }
        break;
      case MN.getAllChatRooms:
        {
          const methodName = this.metaData.get(
            MN.getAllChatRooms
          )!.methodName;
          console.log(`${MN.getAllChatRooms} === ${methodName}`);
          this.tryCatch(
            ChatClient.getInstance().roomManager.getAllChatRooms(),
            QuickTestScreenRoom.TAG,
            MN.getAllChatRooms
          );
        }
        break;
      case MN.createChatRoom:
        {
          console.log('createChatRoom');
          const methodName = this.metaData.get(MN.createChatRoom)!.methodName;
          console.log(`${MN.createChatRoom} === ${methodName}`);
          const subject = this.metaData.get(MN.createChatRoom)!.params[0]
            .paramDefaultValue;
          const desc = this.metaData.get(MN.createChatRoom)!.params[1]
          .paramDefaultValue;
          const welcomeMsg = this.metaData.get(MN.createChatRoom)!.params[2]
          .paramDefaultValue;
          const members = this.metaData.get(MN.createChatRoom)!.params[3]
          .paramDefaultValue;
          const maxCount = this.metaData.get(MN.createChatRoom)!.params[4]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().roomManager.createChatRoom(subject, desc, welcomeMsg, members, maxCount),
            QuickTestScreenRoom.TAG,
            MN.createChatRoom
          );
        }
        break;
      case MN.destroyChatRoom:
        {
          const methodName = this.metaData.get(MN.destroyChatRoom)!.methodName;
          console.log(`${MN.destroyChatRoom} === ${methodName}`);
          const chatroomId = this.metaData.get(MN.destroyChatRoom)!.params[0]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().roomManager.destroyChatRoom(chatroomId),
            QuickTestScreenRoom.TAG,
            MN.destroyChatRoom
          );
        }
        break;
      case MN.changeChatRoomSubject:
        {
          const methodName = this.metaData.get(
            MN.changeChatRoomSubject
          )!.methodName;
          console.log(`${MN.changeChatRoomSubject} === ${methodName}`);
          const chatroomId = this.metaData.get(MN.changeChatRoomSubject)!.params[0]
            .paramDefaultValue;
          const subject = this.metaData.get(MN.changeChatRoomSubject)!.params[1]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().roomManager.changeChatRoomSubject(chatroomId, subject),
            QuickTestScreenRoom.TAG,
            MN.changeChatRoomSubject
          );
        }
        break;
      case MN.changeChatRoomDescription:
        {
          const methodName = this.metaData.get(
            MN.changeChatRoomDescription
          )!.methodName;
          console.log(`${MN.changeChatRoomDescription} === ${methodName}`);
          const chatroomId = this.metaData.get(MN.changeChatRoomDescription)!.params[0]
            .paramDefaultValue;
          const desc = this.metaData.get(MN.changeChatRoomDescription)!.params[1]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().roomManager.changeChatRoomDescription(chatroomId, desc),
            QuickTestScreenRoom.TAG,
            MN.changeChatRoomDescription
          );
        }
        break;
      case MN.fetchChatRoomMembers:
        {
          const methodName = this.metaData.get(
            MN.fetchChatRoomMembers
          )!.methodName;
          console.log(`${MN.fetchChatRoomMembers} === ${methodName}`);
          const chatroomId = this.metaData.get(MN.fetchChatRoomMembers)!.params[0]
            .paramDefaultValue;
          const cursor = this.metaData.get(MN.fetchChatRoomMembers)!.params[1]
            .paramDefaultValue;
          const pageSize = this.metaData.get(MN.fetchChatRoomMembers)!.params[2]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().roomManager.fetchChatRoomMembers(
              chatroomId,
              cursor,
              pageSize
            ),
            QuickTestScreenRoom.TAG,
            MN.fetchChatRoomMembers
          );
        }
        break;
      case MN.muteChatRoomMembers:
        {
          const methodName = this.metaData.get(MN.muteChatRoomMembers)!.methodName;
          console.log(`${MN.muteChatRoomMembers} === ${methodName}`);
          const chatroomId = this.metaData.get(MN.muteChatRoomMembers)!.params[0]
            .paramDefaultValue;
          const muteMembers = this.metaData.get(MN.muteChatRoomMembers)!.params[1]
            .paramDefaultValue;
          const duration = this.metaData.get(MN.muteChatRoomMembers)!.params[2]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().roomManager.muteChatRoomMembers(
              chatroomId,
              muteMembers,
              duration
            ),
            QuickTestScreenRoom.TAG,
            MN.muteChatRoomMembers
          );
        }
        break;
      case MN.unMuteChatRoomMembers:
        {
          const methodName = this.metaData.get(MN.unMuteChatRoomMembers)!.methodName;
          console.log(`${MN.unMuteChatRoomMembers} === ${methodName}`);
          const chatroomId = this.metaData.get(MN.unMuteChatRoomMembers)!.params[0]
            .paramDefaultValue;
          const unmuteMembers = this.metaData.get(MN.unMuteChatRoomMembers)!.params[1]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().roomManager.unMuteChatRoomMembers(
              chatroomId,
              unmuteMembers
            ),
            QuickTestScreenRoom.TAG,
            MN.unMuteChatRoomMembers
          );
        }
        break;
      case MN.changeOwner:
        {
          const methodName = this.metaData.get(
            MN.changeOwner
          )!.methodName;
          console.log(`${MN.changeOwner} === ${methodName}`);
          const chatroomId = this.metaData.get(MN.changeOwner)!.params[0]
            .paramDefaultValue;
          const newOwner = this.metaData.get(MN.changeOwner)!.params[1].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().roomManager.changeOwner(
              chatroomId,
              newOwner
            ),
            QuickTestScreenRoom.TAG,
            MN.changeOwner
          );
        }
        break;
      case MN.addChatRoomAdmin:
        {
          const methodName = this.metaData.get(MN.addChatRoomAdmin)!.methodName;
          console.log(`${MN.addChatRoomAdmin} === ${methodName}`);
          const chatroomId = this.metaData.get(MN.addChatRoomAdmin)!.params[0]
            .paramDefaultValue;
          const admin = this.metaData.get(MN.addChatRoomAdmin)!.params[1].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().roomManager.addChatRoomAdmin(
              chatroomId,
              admin
            ),
            QuickTestScreenRoom.TAG,
            MN.addChatRoomAdmin
          );
        }
        break;
      case MN.removeChatRoomAdmin:
        {
          const methodName = this.metaData.get(
            MN.removeChatRoomAdmin
          )!.methodName;
          console.log(`${MN.removeChatRoomAdmin} === ${methodName}`);
          const chatroomId = this.metaData.get(MN.removeChatRoomAdmin)!.params[0]
            .paramDefaultValue;
          const admin = this.metaData.get(MN.removeChatRoomAdmin)!.params[1].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().roomManager.removeChatRoomAdmin(chatroomId, admin),
            QuickTestScreenRoom.TAG,
            MN.removeChatRoomAdmin
          );
        }
        break;
      case MN.fetchChatRoomMuteList:
        {
          const methodName = this.metaData.get(
            MN.fetchChatRoomMuteList
          )!.methodName;
          console.log(`${MN.fetchChatRoomMuteList} === ${methodName}`);
          const chatroomId = this.metaData.get(MN.fetchChatRoomMuteList)!.params[0]
            .paramDefaultValue;
          const pageNum = this.metaData.get(MN.fetchChatRoomMuteList)!.params[1].paramDefaultValue;
          const pageSize = this.metaData.get(MN.fetchChatRoomMuteList)!.params[2].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().roomManager.fetchChatRoomMuteList(chatroomId, pageNum, pageSize),
            QuickTestScreenRoom.TAG,
            MN.fetchChatRoomMuteList
          );
        }
        break;
      case MN.removeChatRoomMembers:
        {
          const methodName = this.metaData.get(
            MN.removeChatRoomMembers
          )!.methodName;
          console.log(`${MN.removeChatRoomMembers} === ${methodName}`);
          const chatroomId = this.metaData.get(MN.removeChatRoomMembers)!.params[0]
            .paramDefaultValue;
          const members = this.metaData.get(MN.removeChatRoomMembers)!.params[1].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().roomManager.removeChatRoomMembers(
              chatroomId,
              members
            ),
            QuickTestScreenRoom.TAG,
            MN.removeChatRoomMembers
          );
        }
        break;
      case MN.blockChatRoomMembers:
        {
          const methodName = this.metaData.get(MN.blockChatRoomMembers)!.methodName;
          console.log(`${MN.blockChatRoomMembers} === ${methodName}`);
          const chatroomId = this.metaData.get(MN.blockChatRoomMembers)!.params[0]
            .paramDefaultValue;
          const members = this.metaData.get(MN.blockChatRoomMembers)!.params[1].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().roomManager.blockChatRoomMembers(
              chatroomId,
              members
            ),
            QuickTestScreenRoom.TAG,
            MN.blockChatRoomMembers
          );
        }
        break;
      case MN.unBlockChatRoomMembers:
        {
          const methodName = this.metaData.get(
            MN.unBlockChatRoomMembers
          )!.methodName;
          console.log(`${MN.unBlockChatRoomMembers} === ${methodName}`);
          const chatroomId = this.metaData.get(MN.unBlockChatRoomMembers)!.params[0]
            .paramDefaultValue;
          const members = this.metaData.get(MN.unBlockChatRoomMembers)!.params[1].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().roomManager.unBlockChatRoomMembers(
              chatroomId,
              members
            ),
            QuickTestScreenRoom.TAG,
            MN.unBlockChatRoomMembers
          );
        }
        break;
      case MN.fetchChatRoomBlockList:
        {
          const methodName = this.metaData.get(MN.fetchChatRoomBlockList)!.methodName;
          console.log(`${MN.fetchChatRoomBlockList} === ${methodName}`);
          const chatroomId = this.metaData.get(MN.fetchChatRoomBlockList)!.params[0]
            .paramDefaultValue;
          const pageNum = this.metaData.get(MN.fetchChatRoomBlockList)!.params[1].paramDefaultValue;
          const pageSize = this.metaData.get(MN.fetchChatRoomBlockList)!.params[2].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().roomManager.fetchChatRoomBlockList(
              chatroomId, pageNum, pageSize),
            QuickTestScreenRoom.TAG,
            MN.fetchChatRoomBlockList
          );
        }
        break;
      case MN.updateChatRoomAnnouncement:
        {
          const methodName = this.metaData.get(
            MN.updateChatRoomAnnouncement
          )!.methodName;
          console.log(`${MN.updateChatRoomAnnouncement} === ${methodName}`);
          const chatroomId = this.metaData.get(MN.updateChatRoomAnnouncement)!.params[0]
            .paramDefaultValue;
          const announcement = this.metaData.get(MN.updateChatRoomAnnouncement)!.params[1].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().roomManager.updateChatRoomAnnouncement(
              chatroomId,
              announcement
            ),
            QuickTestScreenRoom.TAG,
            MN.updateChatRoomAnnouncement
          );
        }
        break;
      case MN.fetchChatRoomAnnouncement:
        {
          const methodName = this.metaData.get(
            MN.fetchChatRoomAnnouncement
          )!.methodName;
          console.log(`${MN.fetchChatRoomAnnouncement} === ${methodName}`);
          const chatroomId = this.metaData.get(MN.fetchChatRoomAnnouncement)!.params[0]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().roomManager.fetchChatRoomAnnouncement(
              chatroomId
            ),
            QuickTestScreenRoom.TAG,
            MN.fetchChatRoomAnnouncement
          );
        }
        break;
      case MN.fetchChatRoomWhiteListFromServer:
        {
          const methodName = this.metaData.get(MN.fetchChatRoomWhiteListFromServer)!.methodName;
          console.log(`${MN.fetchChatRoomWhiteListFromServer} === ${methodName}`);
          const chatroomId = this.metaData.get(MN.fetchChatRoomWhiteListFromServer)!.params[0]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().roomManager.fetchChatRoomWhiteListFromServer(
              chatroomId
            ),
            QuickTestScreenRoom.TAG,
            MN.fetchChatRoomWhiteListFromServer
          );
        }
        break;
      case MN.isMemberInChatRoomWhiteList:
        {
          const methodName = this.metaData.get(MN.isMemberInChatRoomWhiteList)!.methodName;
          console.log(`${MN.isMemberInChatRoomWhiteList} === ${methodName}`);
          const chatroomId = this.metaData.get(MN.isMemberInChatRoomWhiteList)!.params[0]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().roomManager.isMemberInChatRoomWhiteList(
              chatroomId
            ),
            QuickTestScreenRoom.TAG,
            MN.isMemberInChatRoomWhiteList
          );
        }
        break;
      case MN.addMembersToChatRoomWhiteList:
        {
          const methodName = this.metaData.get(
            MN.addMembersToChatRoomWhiteList
          )!.methodName;
          console.log(`${MN.addMembersToChatRoomWhiteList} === ${methodName}`);
          const chatroomId = this.metaData.get(MN.addMembersToChatRoomWhiteList)!.params[0]
            .paramDefaultValue;
          const members = this.metaData.get(MN.addMembersToChatRoomWhiteList)!.params[1]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().roomManager.addMembersToChatRoomWhiteList(
              chatroomId,
              members
            ),
            QuickTestScreenRoom.TAG,
            MN.addMembersToChatRoomWhiteList
          );
        }
        break;
      case MN.removeMembersFromChatRoomWhiteList:
        {
          const methodName = this.metaData.get(MN.removeMembersFromChatRoomWhiteList)!.methodName;
          console.log(`${MN.removeMembersFromChatRoomWhiteList} === ${methodName}`);
          const chatroomId = this.metaData.get(MN.removeMembersFromChatRoomWhiteList)!.params[0]
            .paramDefaultValue;
          const members = this.metaData.get(MN.removeMembersFromChatRoomWhiteList)!.params[1]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().roomManager.removeMembersFromChatRoomWhiteList(
              chatroomId,
              members
            ),
            QuickTestScreenRoom.TAG,
            MN.removeMembersFromChatRoomWhiteList
          );
        }
        break;
      case MN.muteAllChatRoomMembers:
        {
          const methodName = this.metaData.get(
            MN.muteAllChatRoomMembers
          )!.methodName;
          console.log(`${MN.muteAllChatRoomMembers} === ${methodName}`);
          const chatroomId = this.metaData.get(MN.muteAllChatRoomMembers)!.params[0]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().roomManager.muteAllChatRoomMembers(
              chatroomId
            ),
            QuickTestScreenRoom.TAG,
            MN.muteAllChatRoomMembers
          );
        }
        break;
      case MN.unMuteAllChatRoomMembers:
        {
          const methodName = this.metaData.get(MN.unMuteAllChatRoomMembers)!.methodName;
          console.log(`${MN.unMuteAllChatRoomMembers} === ${methodName}`);
          const chatroomId = this.metaData.get(MN.unMuteAllChatRoomMembers)!.params[0]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().roomManager.unMuteAllChatRoomMembers(
              chatroomId
            ),
            QuickTestScreenRoom.TAG,
            MN.unMuteAllChatRoomMembers
          );
        }
        break;
      default:
        break;
    }
  }
}
