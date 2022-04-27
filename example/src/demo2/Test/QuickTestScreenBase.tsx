import React, { ReactNode } from 'react';
import { View } from 'react-native';
import {
  ChatClient,
  ChatGroupMessageAck,
  ChatMessageEventListener,
  ChatMessage,
  ChatConnectEventListener,
  ChatMultiDeviceEventListener,
  ChatCustomEventListener,
  ChatContactEventListener,
  ChatConversationEventListener,
  ChatGroupEventListener,
  ChatRoomEventListener,
  ChatMessageType,
} from 'react-native-chat-sdk';
import { styleValues } from '../__internal__/Css';
import {
  LeafScreenBase,
  StateBase,
  StatelessBase,
} from '../__internal__/LeafScreenBase';
import type { ApiParams } from '../__internal__/DataTypes';
import type { ChatContactGroupEvent } from 'src/ChatEvents';
import type { ChatCmdMessageBody } from 'src/common/ChatMessage';

export const metaData = new Map<string, ApiParams>();
export function registerStateData(params: ApiParams): void {
  metaData.set(params.methodName, params);
}
export function registerStateDataList(map: Map<string, ApiParams>): void {
  map.forEach((value: ApiParams, key: string) => {
    metaData.set(key, value);
  });
}

export interface QuickTestState extends StateBase {
  connect_result: string;
  multiDevice_result: string;
  custom_result: string;
  contact_result: string;
  conversation_result: string;
  groupEvent_result: string;
  roomEvent_result: string;
}

export interface QuickTestStateless extends StatelessBase {}

export abstract class QuickTestScreenBase<
  S extends QuickTestState,
  SL extends QuickTestStateless
> extends LeafScreenBase<S> {
  protected static TAG = 'QuickTestScreenBase';
  public static route = 'QuickTestScreenBase';
  /**
   * 父类管理，子类使用
   */
  protected metaData: Map<string, ApiParams>;

  constructor(props: { navigation: any }) {
    super(props);
    this.metaData = metaData;
  }

  /**
   * 如果有特殊需求，可以将监听器移动到各个子类里面进行处理。
   */
  protected addListener?(): void {
    console.log(`${QuickTestScreenBase.TAG}: addListener: `);
    let connectListener = new (class implements ChatConnectEventListener {
      that: QuickTestScreenBase<S, SL>;
      constructor(parent: any) {
        this.that = parent as QuickTestScreenBase<S, SL>;
      }
      onTokenWillExpire(): void {
        console.log('QuickTestScreenBase.onTokenWillExpire');
        this.that.setState({ connect_result: 'onTokenWillExpire' });
      }
      onTokenDidExpire(): void {
        console.log('QuickTestScreenBase.onTokenDidExpire');
        this.that.setState({ connect_result: 'onTokenDidExpire' });
      }
      onConnected(): void {
        console.log('QuickTestScreenBase.onConnected');
        this.that.setState({ connect_result: 'onConnected' });
      }
      onDisconnected(errorCode?: number): void {
        console.log('QuickTestScreenBase.onDisconnected: ', errorCode);
        this.that.setState({ connect_result: 'onDisconnected' });
      }
    })(this);
    ChatClient.getInstance().removeAllConnectionListener();
    ChatClient.getInstance().addConnectionListener(connectListener);

    const multiDeviceListener = new (class
      implements ChatMultiDeviceEventListener
    {
      that: QuickTestScreenBase<S, SL>;
      constructor(parent: QuickTestScreenBase<S, SL>) {
        this.that = parent;
      }
      onContactEvent(
        event?: ChatContactGroupEvent,
        target?: string,
        ext?: string
      ): void {
        console.log('QuickTestScreenBase.onContactEvent: ', event, target, ext);
        this.that.setState({
          multiDevice_result:
            'QuickTestScreenBase.onContactEvent: ' + event + target + ext,
        });
      }
      onGroupEvent(
        event?: ChatContactGroupEvent,
        target?: string,
        usernames?: string[]
      ): void {
        console.log(
          'QuickTestScreenBase.onGroupEvent: ',
          event,
          target,
          usernames
        );
        this.that.setState({
          multiDevice_result:
            'QuickTestScreenBase.onGroupEvent: ' + event + target + usernames,
        });
      }
    })(this);
    ChatClient.getInstance().removeAllMultiDeviceListener();
    ChatClient.getInstance().addMultiDeviceListener(multiDeviceListener);

    let customListener: ChatCustomEventListener = new (class
      implements ChatCustomEventListener
    {
      that: QuickTestScreenBase<S, SL>;
      constructor(parent: QuickTestScreenBase<S, SL>) {
        this.that = parent;
      }
      onDataReceived(map: Map<string, any>): void {
        console.log('QuickTestScreenBase.onDataReceived: ', map);
        this.that.setState({
          custom_result: 'QuickTestScreenBase.onDataReceived: ' + map,
        });
      }
    })(this);
    ChatClient.getInstance().removeAllCustomListener();
    ChatClient.getInstance().addCustomListener(customListener);

    let msgListener = new (class implements ChatMessageEventListener {
      that: QuickTestScreenBase<S, SL>;
      constructor(parent: any) {
        this.that = parent as QuickTestScreenBase<S, SL>;
      }
      onMessagesReceived(messages: ChatMessage[]): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onMessagesReceived: `,
          messages
        );
        this.that.setState({
          recvResult: `onMessagesReceived: ${messages.length}: ` + messages,
        });
      }
      onCmdMessagesReceived(messages: ChatMessage[]): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onCmdMessagesReceived: `,
          messages
        );
        this.that.setState({
          recvResult: `onCmdMessagesReceived: ${messages.length}: ` + messages,
        });
        if (
          messages.length <= 0 ||
          messages[0].body.type !== ChatMessageType.CMD
        ) {
          return;
        }
        let r = messages[0].body;
        let rr = (r as ChatCmdMessageBody).action;
        console.log(`${QuickTestScreenBase.TAG}: onMessagesReceived: cmd:`, rr);
        this.that.parseCmd(rr);
      }
      onMessagesRead(messages: ChatMessage[]): void {
        console.log(`${QuickTestScreenBase.TAG}: onMessagesRead: `, messages);
        this.that.setState({
          recvResult: `onMessagesRead: ${messages.length}: ` + messages,
        });
      }
      onGroupMessageRead(groupMessageAcks: ChatGroupMessageAck[]): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onGroupMessageRead: `,
          groupMessageAcks
        );
        this.that.setState({
          recvResult:
            `onGroupMessageRead: ${groupMessageAcks.length}: ` +
            groupMessageAcks,
        });
      }
      onMessagesDelivered(messages: ChatMessage[]): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onMessagesDelivered: ${messages.length}: `,
          messages,
          messages
        );
        this.that.setState({
          recvResult: `onMessagesDelivered: ${messages.length}: ` + messages,
        });
      }
      onMessagesRecalled(messages: ChatMessage[]): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onMessagesRecalled: `,
          messages
        );
        this.that.setState({
          recvResult: `onMessagesRecalled: ${messages.length}: ` + messages,
        });
      }
      onConversationsUpdate(): void {
        console.log(`${QuickTestScreenBase.TAG}: onConversationsUpdate: `);
        this.that.setState({ recvResult: 'onConversationsUpdate' });
      }
      onConversationRead(from: string, to?: string): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onConversationRead: `,
          from,
          to
        );
        this.that.setState({
          recvResult: `onConversationRead: ${from}, ${to}`,
        });
      }
    })(this);

    ChatClient.getInstance().chatManager.removeAllMessageListener();
    ChatClient.getInstance().chatManager.addMessageListener(msgListener);

    const contactEventListener = new (class implements ChatContactEventListener {
      that: QuickTestScreenBase<S, SL>;
      constructor(parent: QuickTestScreenBase<S, SL>) {
        this.that = parent;
      }
      onContactAdded(userName: string): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onContactAdded: ${userName}: `
        );
        this.that.setState({
          connect_result: `onContactAdded: ${userName}: `,
        });
      }
      onContactDeleted(userName: string): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onContactDeleted: ${userName}: `
        );
        this.that.setState({
          connect_result: `onContactDeleted: ${userName}: `,
        });
      }
      onContactInvited(userName: string, reason?: string): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onContactInvited: ${userName}, ${reason}: `
        );
        this.that.setState({
          connect_result: `onContactInvited: ${userName}, ${reason}: `,
        });
      }
      onFriendRequestAccepted(userName: string): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onFriendRequestAccepted: ${userName}: `
        );
        this.that.setState({
          connect_result: `onFriendRequestAccepted: ${userName}: `,
        });
      }
      onFriendRequestDeclined(userName: string): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onFriendRequestDeclined: ${userName}: `
        );
        this.that.setState({
          connect_result: `onFriendRequestDeclined: ${userName}: `,
        });
      }
    })(this);
    ChatClient.getInstance().contactManager.removeAllContactListener();
    ChatClient.getInstance().contactManager.addContactListener(
      contactEventListener
    );

    const converstaionListener: ChatConversationEventListener = new (class
      implements ChatConversationEventListener
    {
      that: QuickTestScreenBase<S, SL>;
      constructor(parent: QuickTestScreenBase<S, SL>) {
        this.that = parent;
      }
      onConversationUpdate(): void {
        console.log(`${QuickTestScreenBase.TAG}: onConversationUpdate: `);
        this.that.setState({
          connect_result: `onConversationUpdate: `,
        });
      }
    })(this);
    ChatClient.getInstance().chatManager.removeAllConversationListener();
    ChatClient.getInstance().chatManager.addConversationListener(
      converstaionListener
    );

    const groupListener: ChatGroupEventListener = new (class
      implements ChatGroupEventListener
    {
      that: QuickTestScreenBase<S, SL>;
      constructor(parent: QuickTestScreenBase<S, SL>) {
        this.that = parent;
      }
      onInvitationReceived(params: {
        groupId: string;
        inviter: string;
        groupName?: string | undefined;
        reason?: string | undefined;
      }): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onInvitationReceived:`,
          params.groupId,
          params.inviter,
          params.groupName,
          params.reason
        );
        this.that.setState({
          groupEvent_result:
            `onInvitationReceived: ` +
            params.groupId +
            params.inviter +
            params.groupName +
            params.reason,
        });
      }
      onRequestToJoinReceived(params: {
        groupId: string;
        applicant: string;
        groupName?: string | undefined;
        reason?: string | undefined;
      }): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onRequestToJoinReceived:`,
          params.groupId,
          params.applicant,
          params.groupName,
          params.reason
        );
        this.that.setState({
          groupEvent_result:
            `onRequestToJoinReceived: ` +
            params.groupId +
            params.applicant +
            params.groupName +
            params.reason,
        });
      }
      onRequestToJoinAccepted(params: {
        groupId: string;
        accepter: string;
        groupName?: string | undefined;
      }): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onRequestToJoinAccepted:`,
          params.groupId,
          params.accepter,
          params.groupName
        );
        this.that.setState({
          groupEvent_result:
            `onRequestToJoinAccepted: ` +
            params.groupId +
            params.accepter +
            params.groupName,
        });
      }
      onRequestToJoinDeclined(params: {
        groupId: string;
        decliner: string;
        groupName?: string | undefined;
        reason?: string | undefined;
      }): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onRequestToJoinDeclined:`,
          params.groupId,
          params.decliner,
          params.groupName,
          params.reason
        );
        this.that.setState({
          groupEvent_result:
            `onRequestToJoinDeclined: ` +
            params.groupId +
            params.decliner +
            params.groupName +
            params.reason,
        });
      }
      onInvitationAccepted(params: {
        groupId: string;
        invitee: string;
        reason?: string | undefined;
      }): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onInvitationAccepted:`,
          params.groupId,
          params.invitee,
          params.reason
        );
        this.that.setState({
          groupEvent_result:
            `onInvitationAccepted: ` +
            params.groupId +
            params.invitee +
            params.reason,
        });
      }
      onInvitationDeclined(params: {
        groupId: string;
        invitee: string;
        reason?: string | undefined;
      }): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onInvitationDeclined:`,
          params.groupId,
          params.invitee,
          params.reason
        );
        this.that.setState({
          groupEvent_result:
            `onInvitationDeclined: ` +
            params.groupId +
            params.invitee +
            params.reason,
        });
      }
      onUserRemoved(params: {
        groupId: string;
        groupName?: string | undefined;
      }): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onUserRemoved:`,
          params.groupId,
          params.groupName
        );
        this.that.setState({
          groupEvent_result:
            `onUserRemoved: ` + params.groupId + params.groupName,
        });
      }
      onGroupDestroyed(params: {
        groupId: string;
        groupName?: string | undefined;
      }): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onGroupDestroyed:`,
          params.groupId,
          params.groupName
        );
        this.that.setState({
          groupEvent_result:
            `onGroupDestroyed: ` + params.groupId + params.groupName,
        });
      }
      onAutoAcceptInvitation(params: {
        groupId: string;
        inviter: string;
        inviteMessage?: string | undefined;
      }): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onGroupDestroyed:`,
          params.groupId,
          params.inviter,
          params.inviteMessage
        );
        this.that.setState({
          groupEvent_result:
            `onGroupDestroyed: ` +
            params.groupId +
            params.inviter +
            params.inviteMessage,
        });
      }
      onMuteListAdded(params: {
        groupId: string;
        mutes: string[];
        muteExpire?: number | undefined;
      }): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onMuteListAdded:`,
          params.groupId,
          params.mutes,
          params.muteExpire?.toString
        );
        this.that.setState({
          groupEvent_result:
            `onMuteListAdded: ` +
            params.groupId +
            params.mutes +
            params.muteExpire?.toString,
        });
      }
      onMuteListRemoved(params: { groupId: string; mutes: string[] }): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onMuteListRemoved:`,
          params.groupId,
          params.mutes
        );
        this.that.setState({
          groupEvent_result:
            `onMuteListRemoved: ` + params.groupId + params.mutes,
        });
      }
      onAdminAdded(params: { groupId: string; admin: string }): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onAdminAdded:`,
          params.groupId,
          params.admin
        );
        this.that.setState({
          groupEvent_result: `onAdminAdded: ` + params.groupId + params.admin,
        });
      }
      onAdminRemoved(params: { groupId: string; admin: string }): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onAdminRemoved:`,
          params.groupId,
          params.admin
        );
        this.that.setState({
          groupEvent_result: `onAdminRemoved: ` + params.groupId + params.admin,
        });
      }
      onOwnerChanged(params: {
        groupId: string;
        newOwner: string;
        oldOwner: string;
      }): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onOwnerChanged:`,
          params.groupId,
          params.newOwner,
          params.oldOwner
        );
        this.that.setState({
          groupEvent_result:
            `onOwnerChanged: ` +
            params.groupId +
            params.newOwner +
            params.oldOwner,
        });
      }
      onMemberJoined(params: { groupId: string; member: string }): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onMemberJoined:`,
          params.groupId,
          params.member
        );
        this.that.setState({
          groupEvent_result:
            `onMemberJoined: ` + params.groupId + params.member,
        });
      }
      onMemberExited(params: { groupId: string; member: string }): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onMemberExited:`,
          params.groupId,
          params.member
        );
        this.that.setState({
          groupEvent_result:
            `onMemberExited: ` + params.groupId + params.member,
        });
      }
      onAnnouncementChanged(params: {
        groupId: string;
        announcement: string;
      }): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onAnnouncementChanged:`,
          params.groupId,
          params.announcement
        );
        this.that.setState({
          groupEvent_result:
            `onAnnouncementChanged: ` + params.groupId + params.announcement,
        });
      }
      onSharedFileAdded(params: { groupId: string; sharedFile: string }): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onSharedFileAdded:`,
          params.groupId,
          params.sharedFile
        );
        this.that.setState({
          groupEvent_result:
            `onSharedFileAdded: ` + params.groupId + params.sharedFile,
        });
      }
      onSharedFileDeleted(params: { groupId: string; fileId: string }): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onSharedFileDeleted:`,
          params.groupId,
          params.fileId
        );
        this.that.setState({
          groupEvent_result:
            `onSharedFileDeleted: ` + params.groupId + params.fileId,
        });
      }
      onWhiteListAdded(params: { groupId: string; members: string[] }): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onWhiteListAdded:`,
          params.groupId,
          params.members
        );
        this.that.setState({
          groupEvent_result:
            `onWhiteListAdded: ` + params.groupId + params.members,
        });
      }
      onWhiteListRemoved(params: { groupId: string; members: string[] }): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onWhiteListRemoved:`,
          params.groupId,
          params.members
        );
        this.that.setState({
          groupEvent_result:
            `onWhiteListRemoved: ` + params.groupId + params.members,
        });
      }
      onAllGroupMemberMuteStateChanged(params: {
        groupId: string;
        isAllMuted: boolean;
      }): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onAllGroupMemberMuteStateChanged:`,
          params.groupId,
          params.isAllMuted
        );
        this.that.setState({
          groupEvent_result:
            `onAllGroupMemberMuteStateChanged: ` +
            params.groupId +
            params.isAllMuted,
        });
      }
    })(this);
    ChatClient.getInstance().groupManager.removeAllGroupListener();
    ChatClient.getInstance().groupManager.addGroupListener(groupListener);

    const roomListener: ChatRoomEventListener = new (class
      implements ChatRoomEventListener
    {
      that: QuickTestScreenBase<S, SL>;
      constructor(parent: QuickTestScreenBase<S, SL>) {
        this.that = parent;
      }
      onChatRoomDestroyed(params: {
        roomId: string;
        roomName?: string | undefined;
      }): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onChatRoomDestroyed:`,
          params.roomId,
          params.roomName
        );
        this.that.setState({
          groupEvent_result:
            `onChatRoomDestroyed: ` + params.roomId + params.roomName,
        });
      }
      onMemberJoined(params: { roomId: string; participant: string }): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onMemberJoined:`,
          params.roomId,
          params.participant
        );
        this.that.setState({
          groupEvent_result:
            `onMemberJoined: ` + params.roomId + params.participant,
        });
      }
      onMemberExited(params: {
        roomId: string;
        participant: string;
        roomName?: string | undefined;
      }): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onMemberJoined:`,
          params.roomId,
          params.participant,
          params.roomName
        );
        this.that.setState({
          groupEvent_result:
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
          `${QuickTestScreenBase.TAG}: onRemoved:`,
          params.roomId,
          params.participant,
          params.roomName
        );
        this.that.setState({
          groupEvent_result:
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
          `${QuickTestScreenBase.TAG}: onMuteListAdded:`,
          params.roomId,
          params.mutes,
          params.expireTime
        );
        this.that.setState({
          groupEvent_result:
            `onMuteListAdded: ` +
            params.roomId +
            params.mutes +
            params.expireTime,
        });
      }
      onMuteListRemoved(params: { roomId: string; mutes: string[] }): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onMuteListRemoved:`,
          params.roomId,
          params.mutes
        );
        this.that.setState({
          groupEvent_result:
            `onMuteListRemoved: ` + params.roomId + params.mutes,
        });
      }
      onAdminAdded(params: { roomId: string; admin: string }): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onAdminAdded:`,
          params.roomId,
          params.admin
        );
        this.that.setState({
          groupEvent_result: `onAdminAdded: ` + params.roomId + params.admin,
        });
      }
      onAdminRemoved(params: { roomId: string; admin: string }): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onAdminRemoved:`,
          params.roomId,
          params.admin
        );
        this.that.setState({
          groupEvent_result: `onAdminRemoved: ` + params.roomId + params.admin,
        });
      }
      onOwnerChanged(params: {
        roomId: string;
        newOwner: string;
        oldOwner: string;
      }): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onOwnerChanged:`,
          params.roomId,
          params.newOwner,
          params.oldOwner
        );
        this.that.setState({
          groupEvent_result:
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
          `${QuickTestScreenBase.TAG}: onAnnouncementChanged:`,
          params.roomId,
          params.announcement
        );
        this.that.setState({
          groupEvent_result:
            `onAnnouncementChanged: ` + params.roomId + params.announcement,
        });
      }
      onWhiteListAdded(params: { roomId: string; members: string[] }): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onWhiteListAdded:`,
          params.roomId,
          params.members
        );
        this.that.setState({
          groupEvent_result:
            `onWhiteListAdded: ` + params.roomId + params.members,
        });
      }
      onWhiteListRemoved(params: { roomId: string; members: string[] }): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onWhiteListRemoved:`,
          params.roomId,
          params.members
        );
        this.that.setState({
          groupEvent_result:
            `onWhiteListRemoved: ` + params.roomId + params.members,
        });
      }
      onAllChatRoomMemberMuteStateChanged(params: {
        roomId: string;
        isAllMuted: boolean;
      }): void {
        console.log(
          `${QuickTestScreenBase.TAG}: onAllChatRoomMemberMuteStateChanged:`,
          params.roomId,
          params.isAllMuted ? 'true' : 'false'
        );
        this.that.setState({
          groupEvent_result:
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
    console.log(`${QuickTestScreenBase.TAG}: removeListener: `);
    ChatClient.getInstance().removeAllConnectionListener();
    ChatClient.getInstance().removeAllCustomListener();
    ChatClient.getInstance().removeAllMultiDeviceListener();
    ChatClient.getInstance().chatManager.removeAllMessageListener();
    ChatClient.getInstance().chatManager.removeAllConversationListener();
    ChatClient.getInstance().contactManager.removeAllContactListener();
    ChatClient.getInstance().groupManager.removeAllGroupListener();
    ChatClient.getInstance().roomManager.removeAllRoomListener();
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

  /**
   * 可以子类实现，只渲染自己关心的监听器
   */
  protected renderBody(): ReactNode {
    return (
      <View style={styleValues.containerColumn}>
        {this.renderParamWithTextKV(
          'connect_result: ',
          this.state.connect_result
        )}
        {this.renderParamWithTextKV(
          'multiDevice_result: ',
          this.state.multiDevice_result
        )}
        {this.renderParamWithTextKV(
          'custom_result: ',
          this.state.custom_result
        )}
        {this.renderParamWithTextKV(
          'contact_result: ',
          this.state.contact_result
        )}
        {this.renderParamWithTextKV(
          'conversation_result: ',
          this.state.conversation_result
        )}
        {this.renderParamWithTextKV(
          'groupEvent_result: ',
          this.state.groupEvent_result
        )}
        {this.renderParamWithTextKV(
          'roomEvent_result: ',
          this.state.roomEvent_result
        )}
      </View>
    );
  }

  private parseCmd(json: string): void {
    this.callApi(JSON.parse(json).methodName);
  }

  /**
   * 调用对应的SDK方法
   * @param name 方法名称
   */
  protected callApi(name: string): void {
    throw new Error('Please sub class implement. ' + name);
  }
}
