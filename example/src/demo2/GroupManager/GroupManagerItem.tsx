import React, { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { styleValues } from '../__internal__/Css';
import { LeafScreenBase, StateBase } from '../__internal__/LeafScreenBase';
import { metaDataList, MN } from './GroupManagerData';
import type { ApiParams } from '../__internal__/DataTypes';
import type { ChatGroupOptions } from 'react-native-chat-sdk';
import {
  ChatClient,
  ChatError,
  ChatGroupEventListener,
  ChatGroupFileStatusCallback,
} from 'react-native-chat-sdk';
import { generateData } from '../__internal__/Utils';
export interface StateGroupMessage extends StateBase {
  cbResult: string;
  createGroup: {
    groupName: string;
    desc: string;
    inviteMembers: string[];
    inviteReason: string;
    options: ChatGroupOptions;
  };
  addMembers: {
    groupId: string;
    members: Array<string>;
    welcome?: string;
  };
  removeMembers: {
    groupId: string;
    members: Array<string>;
  };
  inviterUser: {
    groupId: string;
    members: Array<string>;
    reason: string;
  };
  acceptInvitation: {
    groupId: string;
    inviter: string;
  };
  declineInvitation: {
    groupId: string;
    inviter: string;
    reason: string;
  };
  getGroupWithId: {
    groupId: string;
  };
  getJoinedGroups: {};
  fetchJoinedGroupsFromServer: {
    pageSize: number;
    pageNum: number;
  };
  fetchPublicGroupsFromServer: {
    pageSize: number;
    cursor?: string;
  };
  fetchGroupInfoFromServer: {
    groupId: string;
    isFetchMembers: boolean;
  };
  fetchMemberListFromServer: {
    groupId: string;
    pageSize: number;
    cursor?: string;
  };
  fetchMuteListFromServer: {
    groupId: string;
    pageSize: number;
    pageNum: number;
  };
  fetchWhiteListFromServer: {
    groupId: string;
  };
  fetchGroupFileListFromServer: {
    groupId: string;
    pageSize: number;
    pageNum: number;
  };
  isMemberInWhiteListFromServer: {
    groupId: string;
  };
  fetchAnnouncementFromServer: {
    groupId: string;
  };
  blockMembers: {
    groupId: string;
    members: Array<string>;
  };
  unblockMembers: {
    groupId: string;
    members: Array<string>;
  };
  fetchBlockListFromServer: {
    groupId: string;
    pageSize: number;
    pageNum: number;
  };
  changeGroupName: {
    groupId: string;
    name: string;
  };
  changeGroupDescription: {
    groupId: string;
    desc: string;
  };
  joinPublicGroup: {
    groupId: string;
  };
  leaveGroup: {
    groupId: string;
  };
  requestToJoinPublicGroup: {
    groupId: string;
    reason?: string;
  };
  destroyGroup: {
    groupId: string;
  };
  blockGroup: {
    groupId: string;
  };
  unblockGroup: {
    groupId: string;
  };
  changeOwner: {
    groupId: string;
    newOwner: string;
  };
  addAdmin: {
    groupId: string;
    memberId: string;
  };
  removeAdmin: {
    groupId: string;
    memberId: string;
  };
  muteMembers: {
    groupId: string;
    members: Array<string>;
    duration: number;
  };
  unMuteMembers: {
    groupId: string;
    members: Array<string>;
  };
  muteAllMembers: {
    groupId: string;
  };
  unMuteAllMembers: {
    groupId: string;
  };
  addWhiteList: {
    groupId: string;
    members: Array<string>;
  };
  removeWhiteList: {
    groupId: string;
    members: Array<string>;
  };
  uploadGroupSharedFile: {
    groupId: string;
    filePath: string;
  };
  updateGroupAnnouncement: {
    groupId: string;
    announcement: string;
  };
  updateGroupExtension: {
    groupId: string;
    extension: string;
  };
  acceptJoinApplication: {
    groupId: string;
    username: string;
  };
  declineJoinApplication: {
    groupId: string;
    username: string;
    reason?: string;
  };
  downloadGroupSharedFile: {
    groupId: string;
    fileId: string;
    savePath: string;
  };
  removeGroupSharedFile: {
    groupId: string;
    fileId: string;
  };
}
export class GroupManagerLeafScreen extends LeafScreenBase<StateGroupMessage> {
  protected static TAG = 'GroupManagerLeafScreen';
  public static route = 'GroupManagerLeafScreen';
  metaDataList: Map<string, ApiParams>;
  state: StateGroupMessage;
  constructor(props: { navigation: any }) {
    super(props);
    this.metaDataList = metaDataList;
    this.state = Object.assign({}, generateData(metaDataList), {
      sendResult: '',
      cbResult: '',
      recvResult: '',
      exceptResult: '',
    });
  }
  protected renderBody(): ReactNode {
    // console.log(`${GroupManagerLeafScreen.TAG}: renderBody: `);
    return (
      <View style={styleValues.containerColumn}>{this.renderApiDom()}</View>
    );
  }
  protected renderApiDom(): ReactNode[] {
    const apiList = [
      'createGroup',
      'uploadGroupSharedFile',
      'fetchGroupFileListFromServer',
      'downloadGroupSharedFile',
      'removeGroupSharedFile',
      'requestToJoinPublicGroup',
      'joinPublicGroup',
      'leaveGroup',
      'inviterUser',
      'fetchJoinedGroupsFromServer',
      'fetchPublicGroupsFromServer',
      'getJoinedGroups',
      'acceptJoinApplication',
      'declineJoinApplication',
      'updateGroupExtension',
      'acceptInvitation',
      'declineInvitation',
      'blockGroup',
      'unblockGroup',
      'getGroupWithId',
      'fetchGroupInfoFromServer',
      'changeGroupName',
      'changeGroupDescription',
      'fetchBlockListFromServer',
      'blockMembers',
      'unblockMembers',
      'fetchMemberListFromServer',
      'addMembers',
      'removeMembers',
      'isMemberInWhiteListFromServer',
      'updateGroupAnnouncement',
      'fetchAnnouncementFromServer',
      'changeOwner',
      'addAdmin',
      'removeAdmin',
      'muteAllMembers',
      'unMuteAllMembers',
      'fetchMuteListFromServer',
      'muteMembers',
      'unMuteMembers',
      'addWhiteList',
      'removeWhiteList',
      'fetchWhiteListFromServer',
      'destroyGroup',
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
          // eslint-disable-next-line no-undef
          this.state[apiItem as keyof typeof this.state][
            item.paramName as keyof typeof currentData
          ];
        if (item.domType && item.domType === 'upload') {
          renderDomAry.push(
            this.renderParamWithSelectFile(
              'filePath',
              itemValue,
              (json: string) => {
                const j = JSON.parse(json);
                this.setState({
                  uploadGroupSharedFile: Object.assign(
                    this.state.uploadGroupSharedFile,
                    { filePath: j.localPath }
                  ),
                });
              }
            )
          );
        } else {
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
  protected createGroup(): ReactNode[] {
    const data = this.metaDataList;
    let domAry = [];
    domAry.push(this.renderParamWithText(data.get('createGroup')!.methodName));
    data.get('createGroup')?.params.forEach((item) => {
      // "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"
      let value =
        item.paramType === 'object'
          ? JSON.stringify(item.paramDefaultValue)
          : item.paramDefaultValue;
      domAry.push(
        this.renderGroupParamWithInput(
          item.paramName,
          item.paramType,
          value,
          (inputData: { [index: string]: string }) => {
            this.setState({
              createGroup: Object.assign(this.state.createGroup, inputData),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('createGroup')!.methodName, () => {
        this.callApi(data.get('createGroup')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }

  private callApi(name: string): void {
    console.log(`${GroupManagerLeafScreen.TAG}: callApi: `);
    switch (name) {
      case MN.createGroup: {
        const { groupName, desc, inviteMembers, inviteReason, options } =
          this.state.createGroup;
        this.tryCatch(
          ChatClient.getInstance().groupManager.createGroup(
            options,
            groupName,
            desc,
            inviteMembers,
            inviteReason
          ),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.addMembers: {
        const { groupId, members, welcome } = this.state.addMembers;
        this.tryCatch(
          ChatClient.getInstance().groupManager.addMembers(
            groupId,
            members,
            welcome
          ),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.removeMembers: {
        const { groupId, members } = this.state.removeMembers;
        this.tryCatch(
          ChatClient.getInstance().groupManager.removeMembers(groupId, members),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.inviterUser: {
        const { groupId, members, reason } = this.state.inviterUser;
        this.tryCatch(
          ChatClient.getInstance().groupManager.inviterUser(
            groupId,
            members,
            reason
          ),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.acceptInvitation: {
        const { groupId, inviter } = this.state.acceptInvitation;
        this.tryCatch(
          ChatClient.getInstance().groupManager.acceptInvitation(
            groupId,
            inviter
          ),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.declineInvitation: {
        const { groupId, inviter } = this.state.declineInvitation;
        this.tryCatch(
          ChatClient.getInstance().groupManager.declineInvitation(
            groupId,
            inviter
          ),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.getGroupWithId: {
        const { groupId } = this.state.getGroupWithId;
        this.tryCatch(
          ChatClient.getInstance().groupManager.getGroupWithId(groupId),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.getJoinedGroups: {
        this.tryCatch(
          ChatClient.getInstance().groupManager.getJoinedGroups(),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.fetchJoinedGroupsFromServer: {
        const { pageSize, pageNum } = this.state.fetchJoinedGroupsFromServer;
        this.tryCatch(
          ChatClient.getInstance().groupManager.fetchJoinedGroupsFromServer(
            pageSize,
            pageNum
          ),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.fetchPublicGroupsFromServer: {
        const { pageSize, cursor } = this.state.fetchPublicGroupsFromServer;
        this.tryCatch(
          ChatClient.getInstance().groupManager.fetchPublicGroupsFromServer(
            pageSize,
            cursor
          ),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.fetchGroupInfoFromServer: {
        const { groupId, isFetchMembers } = this.state.fetchGroupInfoFromServer;
        this.tryCatch(
          ChatClient.getInstance().groupManager.fetchGroupInfoFromServer(
            groupId,
            isFetchMembers
          ),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.fetchMemberListFromServer: {
        const { groupId, pageSize, cursor } =
          this.state.fetchMemberListFromServer;
        this.tryCatch(
          ChatClient.getInstance().groupManager.fetchMemberListFromServer(
            groupId,
            pageSize,
            cursor
          ),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.fetchBlockListFromServer: {
        const { groupId, pageSize, pageNum } =
          this.state.fetchBlockListFromServer;
        this.tryCatch(
          ChatClient.getInstance().groupManager.fetchBlockListFromServer(
            groupId,
            pageSize,
            pageNum
          ),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.fetchMuteListFromServer: {
        const { groupId, pageSize, pageNum } =
          this.state.fetchMuteListFromServer;
        this.tryCatch(
          ChatClient.getInstance().groupManager.fetchMuteListFromServer(
            groupId,
            pageSize,
            pageNum
          ),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.fetchWhiteListFromServer: {
        const { groupId } = this.state.fetchWhiteListFromServer;
        this.tryCatch(
          ChatClient.getInstance().groupManager.fetchWhiteListFromServer(
            groupId
          ),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.fetchGroupFileListFromServer: {
        const { groupId, pageSize, pageNum } =
          this.state.fetchGroupFileListFromServer;
        this.tryCatch(
          ChatClient.getInstance().groupManager.fetchGroupFileListFromServer(
            groupId,
            pageSize,
            pageNum
          ),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.isMemberInWhiteListFromServer: {
        const { groupId } = this.state.isMemberInWhiteListFromServer;
        this.tryCatch(
          ChatClient.getInstance().groupManager.isMemberInWhiteListFromServer(
            groupId
          ),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.fetchAnnouncementFromServer: {
        const { groupId } = this.state.fetchAnnouncementFromServer;
        this.tryCatch(
          ChatClient.getInstance().groupManager.fetchAnnouncementFromServer(
            groupId
          ),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.blockMembers: {
        const { groupId, members } = this.state.blockMembers;
        this.tryCatch(
          ChatClient.getInstance().groupManager.blockMembers(groupId, members),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.unblockMembers: {
        const { groupId, members } = this.state.unblockMembers;
        this.tryCatch(
          ChatClient.getInstance().groupManager.unblockMembers(
            groupId,
            members
          ),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.changeGroupName: {
        // eslint-disable-next-line no-shadow
        const { groupId, name } = this.state.changeGroupName;
        this.tryCatch(
          ChatClient.getInstance().groupManager.changeGroupName(groupId, name),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.changeGroupDescription: {
        const { groupId, desc } = this.state.changeGroupDescription;
        this.tryCatch(
          ChatClient.getInstance().groupManager.changeGroupDescription(
            groupId,
            desc
          ),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.joinPublicGroup: {
        const { groupId } = this.state.joinPublicGroup;
        this.tryCatch(
          ChatClient.getInstance().groupManager.joinPublicGroup(groupId),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.leaveGroup: {
        const { groupId } = this.state.leaveGroup;
        this.tryCatch(
          ChatClient.getInstance().groupManager.leaveGroup(groupId),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.requestToJoinPublicGroup: {
        const { groupId, reason } = this.state.requestToJoinPublicGroup;
        this.tryCatch(
          ChatClient.getInstance().groupManager.requestToJoinPublicGroup(
            groupId,
            reason
          ),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.destroyGroup: {
        const { groupId } = this.state.destroyGroup;
        this.tryCatch(
          ChatClient.getInstance().groupManager.destroyGroup(groupId),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.blockGroup: {
        const { groupId } = this.state.blockGroup;
        this.tryCatch(
          ChatClient.getInstance().groupManager.blockGroup(groupId),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.unblockGroup: {
        const { groupId } = this.state.unblockGroup;
        this.tryCatch(
          ChatClient.getInstance().groupManager.unblockGroup(groupId),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.changeOwner: {
        const { groupId, newOwner } = this.state.changeOwner;
        this.tryCatch(
          ChatClient.getInstance().groupManager.changeOwner(groupId, newOwner),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.addAdmin: {
        const { groupId, memberId } = this.state.addAdmin;
        this.tryCatch(
          ChatClient.getInstance().groupManager.addAdmin(groupId, memberId),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.removeAdmin: {
        const { groupId, memberId } = this.state.removeAdmin;
        this.tryCatch(
          ChatClient.getInstance().groupManager.removeAdmin(groupId, memberId),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.muteMembers: {
        const { groupId, members, duration } = this.state.muteMembers;
        this.tryCatch(
          ChatClient.getInstance().groupManager.muteMembers(
            groupId,
            members,
            duration
          ),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.unMuteMembers: {
        const { groupId, members } = this.state.unMuteMembers;
        this.tryCatch(
          ChatClient.getInstance().groupManager.unMuteMembers(groupId, members),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.muteAllMembers: {
        const { groupId } = this.state.muteAllMembers;
        this.tryCatch(
          ChatClient.getInstance().groupManager.muteAllMembers(groupId),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.unMuteAllMembers: {
        const { groupId } = this.state.unMuteAllMembers;
        this.tryCatch(
          ChatClient.getInstance().groupManager.unMuteAllMembers(groupId),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.addWhiteList: {
        const { groupId, members } = this.state.addWhiteList;
        this.tryCatch(
          ChatClient.getInstance().groupManager.addWhiteList(groupId, members),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.removeWhiteList: {
        const { groupId, members } = this.state.removeWhiteList;
        this.tryCatch(
          ChatClient.getInstance().groupManager.removeWhiteList(
            groupId,
            members
          ),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.uploadGroupSharedFile: {
        const { groupId, filePath } = this.state.uploadGroupSharedFile;
        this.tryCatch(
          ChatClient.getInstance().groupManager.uploadGroupSharedFile(
            groupId,
            filePath,
            this.createCallback()
          ),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.updateGroupAnnouncement: {
        const { groupId, announcement } = this.state.updateGroupAnnouncement;
        this.tryCatch(
          ChatClient.getInstance().groupManager.updateGroupAnnouncement(
            groupId,
            announcement
          ),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.updateGroupExtension: {
        const { groupId, extension } = this.state.updateGroupExtension;
        this.tryCatch(
          ChatClient.getInstance().groupManager.updateGroupExtension(
            groupId,
            extension
          ),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.acceptJoinApplication: {
        const { groupId, username } = this.state.acceptJoinApplication;
        this.tryCatch(
          ChatClient.getInstance().groupManager.acceptJoinApplication(
            groupId,
            username
          ),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.declineJoinApplication: {
        const { groupId, username, reason } = this.state.declineJoinApplication;
        this.tryCatch(
          ChatClient.getInstance().groupManager.declineJoinApplication(
            groupId,
            username,
            reason
          ),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.downloadGroupSharedFile: {
        const { groupId, fileId, savePath } =
          this.state.downloadGroupSharedFile;
        this.tryCatch(
          ChatClient.getInstance().groupManager.downloadGroupSharedFile(
            groupId,
            fileId,
            savePath,
            this.createCallback()
          ),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.removeGroupSharedFile: {
        const { groupId, fileId } = this.state.removeGroupSharedFile;
        this.tryCatch(
          ChatClient.getInstance().groupManager.removeGroupSharedFile(
            groupId,
            fileId
          ),
          GroupManagerLeafScreen.TAG,
          name
        );
        break;
      }
      default:
        console.log('error name');
        break;
    }
  }

  protected renderCallbackResult(): ReactNode[] {
    const { cbResult } = this.state;
    return [
      <View
        key={this.generateKey('cbResult', 'callback')}
        style={styleValues.containerRow}
      >
        <Text selectable={true} style={styleValues.textTipStyle}>
          cbResult: {cbResult}
        </Text>
      </View>,
    ];
  }

  protected renderResult(): ReactNode {
    return (
      <View style={styleValues.containerColumn}>
        {this.renderSendResult()}
        {this.renderCallbackResult()}
        {this.renderRecvResult()}
      </View>
    );
  }

  protected addListener?(): void {
    console.log('addListener');
    const groupListener: ChatGroupEventListener = new (class
      implements ChatGroupEventListener
    {
      that: GroupManagerLeafScreen;
      constructor(parent: GroupManagerLeafScreen) {
        this.that = parent;
      }
      onInvitationReceived(params: {
        groupId: string;
        inviter: string;
        groupName?: string | undefined;
        reason?: string | undefined;
      }): void {
        console.log(
          `${GroupManagerLeafScreen.TAG}: onInvitationReceived:`,
          params.groupId,
          params.inviter,
          params.groupName,
          params.reason
        );
        this.that.setState({
          recvResult:
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
          `${GroupManagerLeafScreen.TAG}: onRequestToJoinReceived:`,
          params.groupId,
          params.applicant,
          params.groupName,
          params.reason
        );
        this.that.setState({
          recvResult:
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
          `${GroupManagerLeafScreen.TAG}: onRequestToJoinAccepted:`,
          params.groupId,
          params.accepter,
          params.groupName
        );
        this.that.setState({
          recvResult:
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
          `${GroupManagerLeafScreen.TAG}: onRequestToJoinDeclined:`,
          params.groupId,
          params.decliner,
          params.groupName,
          params.reason
        );
        this.that.setState({
          recvResult:
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
          `${GroupManagerLeafScreen.TAG}: onInvitationAccepted:`,
          params.groupId,
          params.invitee,
          params.reason
        );
        this.that.setState({
          recvResult:
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
          `${GroupManagerLeafScreen.TAG}: onInvitationDeclined:`,
          params.groupId,
          params.invitee,
          params.reason
        );
        this.that.setState({
          recvResult:
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
          `${GroupManagerLeafScreen.TAG}: onUserRemoved:`,
          params.groupId,
          params.groupName
        );
        this.that.setState({
          recvResult: `onUserRemoved: ` + params.groupId + params.groupName,
        });
      }
      onGroupDestroyed(params: {
        groupId: string;
        groupName?: string | undefined;
      }): void {
        console.log(
          `${GroupManagerLeafScreen.TAG}: onGroupDestroyed:`,
          params.groupId,
          params.groupName
        );
        this.that.setState({
          recvResult: `onGroupDestroyed: ` + params.groupId + params.groupName,
        });
      }
      onAutoAcceptInvitation(params: {
        groupId: string;
        inviter: string;
        inviteMessage?: string | undefined;
      }): void {
        console.log(
          `${GroupManagerLeafScreen.TAG}: onGroupDestroyed:`,
          params.groupId,
          params.inviter,
          params.inviteMessage
        );
        this.that.setState({
          recvResult:
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
          `${GroupManagerLeafScreen.TAG}: onMuteListAdded:`,
          params.groupId,
          params.mutes,
          params.muteExpire?.toString
        );
        this.that.setState({
          recvResult:
            `onMuteListAdded: ` +
            params.groupId +
            params.mutes +
            params.muteExpire?.toString,
        });
      }
      onMuteListRemoved(params: { groupId: string; mutes: string[] }): void {
        console.log(
          `${GroupManagerLeafScreen.TAG}: onMuteListRemoved:`,
          params.groupId,
          params.mutes
        );
        this.that.setState({
          recvResult: `onMuteListRemoved: ` + params.groupId + params.mutes,
        });
      }
      onAdminAdded(params: { groupId: string; admin: string }): void {
        console.log(
          `${GroupManagerLeafScreen.TAG}: onAdminAdded:`,
          params.groupId,
          params.admin
        );
        this.that.setState({
          recvResult: `onAdminAdded: ` + params.groupId + params.admin,
        });
      }
      onAdminRemoved(params: { groupId: string; admin: string }): void {
        console.log(
          `${GroupManagerLeafScreen.TAG}: onAdminRemoved:`,
          params.groupId,
          params.admin
        );
        this.that.setState({
          recvResult: `onAdminRemoved: ` + params.groupId + params.admin,
        });
      }
      onOwnerChanged(params: {
        groupId: string;
        newOwner: string;
        oldOwner: string;
      }): void {
        console.log(
          `${GroupManagerLeafScreen.TAG}: onOwnerChanged:`,
          params.groupId,
          params.newOwner,
          params.oldOwner
        );
        this.that.setState({
          recvResult:
            `onOwnerChanged: ` +
            params.groupId +
            params.newOwner +
            params.oldOwner,
        });
      }
      onMemberJoined(params: { groupId: string; member: string }): void {
        console.log(
          `${GroupManagerLeafScreen.TAG}: onMemberJoined:`,
          params.groupId,
          params.member
        );
        this.that.setState({
          recvResult: `onMemberJoined: ` + params.groupId + params.member,
        });
      }
      onMemberExited(params: { groupId: string; member: string }): void {
        console.log(
          `${GroupManagerLeafScreen.TAG}: onMemberExited:`,
          params.groupId,
          params.member
        );
        this.that.setState({
          recvResult: `onMemberExited: ` + params.groupId + params.member,
        });
      }
      onAnnouncementChanged(params: {
        groupId: string;
        announcement: string;
      }): void {
        console.log(
          `${GroupManagerLeafScreen.TAG}: onAnnouncementChanged:`,
          params.groupId,
          params.announcement
        );
        this.that.setState({
          recvResult:
            `onAnnouncementChanged: ` + params.groupId + params.announcement,
        });
      }
      onSharedFileAdded(params: { groupId: string; sharedFile: string }): void {
        console.log(
          `${GroupManagerLeafScreen.TAG}: onSharedFileAdded:`,
          params.groupId,
          params.sharedFile
        );
        this.that.setState({
          recvResult:
            `onSharedFileAdded: ` + params.groupId + params.sharedFile,
        });
      }
      onSharedFileDeleted(params: { groupId: string; fileId: string }): void {
        console.log(
          `${GroupManagerLeafScreen.TAG}: onSharedFileDeleted:`,
          params.groupId,
          params.fileId
        );
        this.that.setState({
          recvResult: `onSharedFileDeleted: ` + params.groupId + params.fileId,
        });
      }
      onWhiteListAdded(params: { groupId: string; members: string[] }): void {
        console.log(
          `${GroupManagerLeafScreen.TAG}: onWhiteListAdded:`,
          params.groupId,
          params.members
        );
        this.that.setState({
          recvResult: `onWhiteListAdded: ` + params.groupId + params.members,
        });
      }
      onWhiteListRemoved(params: { groupId: string; members: string[] }): void {
        console.log(
          `${GroupManagerLeafScreen.TAG}: onWhiteListRemoved:`,
          params.groupId,
          params.members
        );
        this.that.setState({
          recvResult: `onWhiteListRemoved: ` + params.groupId + params.members,
        });
      }
      onAllGroupMemberMuteStateChanged(params: {
        groupId: string;
        isAllMuted: boolean;
      }): void {
        console.log(
          `${GroupManagerLeafScreen.TAG}: onAllGroupMemberMuteStateChanged:`,
          params.groupId,
          params.isAllMuted
        );
        this.that.setState({
          recvResult:
            `onAllGroupMemberMuteStateChanged: ` +
            params.groupId +
            params.isAllMuted,
        });
      }
    })(this);
    ChatClient.getInstance().groupManager.removeAllGroupListener();
    ChatClient.getInstance().groupManager.addGroupListener(groupListener);
  }

  protected removeListener?(): void {
    console.log('addListener');
  }

  private createCallback(): ChatGroupFileStatusCallback {
    const ret = new (class implements ChatGroupFileStatusCallback {
      that: GroupManagerLeafScreen;
      constructor(t: GroupManagerLeafScreen) {
        this.that = t;
      }
      onProgress(groupId: string, filePath: string, progress: number): void {
        console.log(
          `${GroupManagerLeafScreen.TAG}: onProgress: `,
          groupId,
          filePath,
          progress
        );
        this.that.setState({
          cbResult: `onProgress: ${groupId}, ${filePath}, ${progress}`,
        });
      }
      onError(groupId: string, filePath: string, error: ChatError): void {
        console.log(
          `${GroupManagerLeafScreen.TAG}: onError: `,
          groupId,
          filePath,
          error
        );
        this.that.setState({
          cbResult: `onError: ${groupId}, ${filePath}` + JSON.stringify(error),
        });
      }
      onSuccess(groupId: string, filePath: string): void {
        console.log(
          `${GroupManagerLeafScreen.TAG}: onSuccess: `,
          groupId,
          filePath
        );
        this.that.setState({
          cbResult: `onSuccess: ${groupId}, ${filePath}`,
        });
      }
    })(this);
    return ret;
  }
}
