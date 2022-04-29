import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { styleValues } from '../__internal__/Css';
import { LeafScreenBase, StateBase } from '../__internal__/LeafScreenBase';
import { metaData, GROUPMN, stateData } from './GroupManagerData';
import type { ApiParams } from '../__internal__/DataTypes';
import type { ChatGroupOptions } from '../../../../src/common/ChatGroup';
import { ChatClient } from 'react-native-chat-sdk';
export interface StateGroupMessage extends StateBase {
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
  metaData: Map<string, ApiParams>;
  constructor(props: { navigation: any }) {
    super(props);
    this.metaData = metaData;
    this.state = stateData;
  }
  protected renderBody(): ReactNode {
    console.log(`${GroupManagerLeafScreen.TAG}: renderBody: `);
    return (
      <View style={styleValues.containerColumn}>
        {this.createGroup()}
        {this.downloadGroupSharedFile()}
        {this.removeGroupSharedFile()}
        {this.acceptJoinApplication()}
        {this.declineJoinApplication()}
        {this.updateGroupAnnouncement()}
        {this.updateGroupExtension()}
        {this.uploadGroupSharedFile()}
        {this.addWhiteList()}
        {this.removeWhiteList()}
        {this.fetchWhiteListFromServer()}
        {this.muteAllMembers()}
        {this.unMuteAllMembers()}
        {this.fetchMuteListFromServer()}
        {this.muteMembers()}
        {this.unMuteMembers()}
        {this.destroyGroup()}
        {this.blockGroup()}
        {this.unblockGroup()}
        {this.changeOwner()}
        {this.addAdmin()}
        {this.removeAdmin()}
        {this.requestToJoinPublicGroup()}
        {this.joinPublicGroup()}
        {this.leaveGroup()}
        {this.getGroupWithId()}
        {this.addMembers()}
        {this.removeMembers()}
        {this.inviterUser()}
        {this.acceptInvitation()}
        {this.declineInvitation()}
        {this.getJoinedGroups()}
        {this.fetchJoinedGroupsFromServer()}
        {this.fetchPublicGroupsFromServer()}
        {this.fetchGroupInfoFromServer()}
        {this.fetchMemberListFromServer()}
        {this.fetchGroupFileListFromServer()}
        {this.isMemberInWhiteListFromServer()}
        {this.fetchAnnouncementFromServer()}
        {this.blockMembers()}
        {this.unblockMembers()}
        {this.fetchBlockListFromServer()}
        {this.changeGroupName()}
        {this.changeGroupDescription()}
      </View>
    );
  }
  protected createGroup(): ReactNode[] {
    const data = this.metaData;
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

  protected addMembers(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(this.renderParamWithText(data.get('addMembers')!.methodName));
    data.get('addMembers')?.params.forEach((item) => {
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
              addMembers: Object.assign(this.state.addMembers, inputData),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('addMembers')!.methodName, () => {
        this.callApi(data.get('addMembers')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }

  protected removeMembers(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(
      this.renderParamWithText(data.get('removeMembers')!.methodName)
    );
    data.get('removeMembers')?.params.forEach((item) => {
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
              removeMembers: Object.assign(this.state.removeMembers, inputData),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('removeMembers')!.methodName, () => {
        this.callApi(data.get('removeMembers')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }

  protected inviterUser(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(this.renderParamWithText(data.get('inviterUser')!.methodName));
    data.get('inviterUser')?.params.forEach((item) => {
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
              inviterUser: Object.assign(this.state.inviterUser, inputData),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('inviterUser')!.methodName, () => {
        this.callApi(data.get('inviterUser')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }

  protected acceptInvitation(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(
      this.renderParamWithText(data.get('acceptInvitation')!.methodName)
    );
    data.get('acceptInvitation')?.params.forEach((item) => {
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
              acceptInvitation: Object.assign(
                this.state.acceptInvitation,
                inputData
              ),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('acceptInvitation')!.methodName, () => {
        this.callApi(data.get('acceptInvitation')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected declineInvitation(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(
      this.renderParamWithText(data.get('declineInvitation')!.methodName)
    );
    data.get('declineInvitation')?.params.forEach((item) => {
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
              declineInvitation: Object.assign(
                this.state.declineInvitation,
                inputData
              ),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('declineInvitation')!.methodName, () => {
        this.callApi(data.get('declineInvitation')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected getGroupWithId(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(
      this.renderParamWithText(data.get('getGroupWithId')!.methodName)
    );
    data.get('getGroupWithId')?.params.forEach((item) => {
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
              getGroupWithId: Object.assign(
                this.state.getGroupWithId,
                inputData
              ),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('getGroupWithId')!.methodName, () => {
        this.callApi(data.get('getGroupWithId')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected getJoinedGroups(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(
      this.renderParamWithText(data.get('getJoinedGroups')!.methodName)
    );
    data.get('getJoinedGroups')?.params.forEach((item) => {
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
              getJoinedGroups: Object.assign(
                this.state.getJoinedGroups,
                inputData
              ),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('getJoinedGroups')!.methodName, () => {
        this.callApi(data.get('getJoinedGroups')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected fetchJoinedGroupsFromServer(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(
      this.renderParamWithText(
        data.get('fetchJoinedGroupsFromServer')!.methodName
      )
    );
    data.get('fetchJoinedGroupsFromServer')?.params.forEach((item) => {
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
              fetchJoinedGroupsFromServer: Object.assign(
                this.state.fetchJoinedGroupsFromServer,
                inputData
              ),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(
        data.get('fetchJoinedGroupsFromServer')!.methodName,
        () => {
          this.callApi(data.get('fetchJoinedGroupsFromServer')!.methodName);
        }
      )
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected fetchPublicGroupsFromServer(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(
      this.renderParamWithText(
        data.get('fetchPublicGroupsFromServer')!.methodName
      )
    );
    data.get('fetchPublicGroupsFromServer')?.params.forEach((item) => {
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
              fetchPublicGroupsFromServer: Object.assign(
                this.state.fetchPublicGroupsFromServer,
                inputData
              ),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(
        data.get('fetchPublicGroupsFromServer')!.methodName,
        () => {
          this.callApi(data.get('fetchPublicGroupsFromServer')!.methodName);
        }
      )
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected fetchGroupInfoFromServer(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(
      this.renderParamWithText(data.get('fetchGroupInfoFromServer')!.methodName)
    );
    data.get('fetchGroupInfoFromServer')?.params.forEach((item) => {
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
              fetchGroupInfoFromServer: Object.assign(
                this.state.fetchGroupInfoFromServer,
                inputData
              ),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(
        data.get('fetchGroupInfoFromServer')!.methodName,
        () => {
          this.callApi(data.get('fetchGroupInfoFromServer')!.methodName);
        }
      )
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected fetchMemberListFromServer(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(
      this.renderParamWithText(
        data.get('fetchMemberListFromServer')!.methodName
      )
    );
    data.get('fetchMemberListFromServer')?.params.forEach((item) => {
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
              fetchMemberListFromServer: Object.assign(
                this.state.fetchMemberListFromServer,
                inputData
              ),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(
        data.get('fetchMemberListFromServer')!.methodName,
        () => {
          this.callApi(data.get('fetchMemberListFromServer')!.methodName);
        }
      )
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected fetchBlockListFromServer(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(
      this.renderParamWithText(data.get('fetchBlockListFromServer')!.methodName)
    );
    data.get('fetchBlockListFromServer')?.params.forEach((item) => {
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
              fetchBlockListFromServer: Object.assign(
                this.state.fetchBlockListFromServer,
                inputData
              ),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(
        data.get('fetchBlockListFromServer')!.methodName,
        () => {
          this.callApi(data.get('fetchBlockListFromServer')!.methodName);
        }
      )
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected fetchMuteListFromServer(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(
      this.renderParamWithText(data.get('fetchMuteListFromServer')!.methodName)
    );
    data.get('fetchMuteListFromServer')?.params.forEach((item) => {
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
              fetchMuteListFromServer: Object.assign(
                this.state.fetchMuteListFromServer,
                inputData
              ),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('fetchMuteListFromServer')!.methodName, () => {
        this.callApi(data.get('fetchMuteListFromServer')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected fetchWhiteListFromServer(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(
      this.renderParamWithText(data.get('fetchWhiteListFromServer')!.methodName)
    );
    data.get('fetchWhiteListFromServer')?.params.forEach((item) => {
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
              fetchMuteListFromServer: Object.assign(
                this.state.fetchMuteListFromServer,
                inputData
              ),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(
        data.get('fetchWhiteListFromServer')!.methodName,
        () => {
          this.callApi(data.get('fetchWhiteListFromServer')!.methodName);
        }
      )
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected fetchGroupFileListFromServer(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(
      this.renderParamWithText(
        data.get('fetchGroupFileListFromServer')!.methodName
      )
    );
    data.get('fetchGroupFileListFromServer')?.params.forEach((item) => {
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
              fetchGroupFileListFromServer: Object.assign(
                this.state.fetchGroupFileListFromServer,
                inputData
              ),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(
        data.get('fetchGroupFileListFromServer')!.methodName,
        () => {
          this.callApi(data.get('fetchGroupFileListFromServer')!.methodName);
        }
      )
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected isMemberInWhiteListFromServer(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(
      this.renderParamWithText(
        data.get('isMemberInWhiteListFromServer')!.methodName
      )
    );
    data.get('isMemberInWhiteListFromServer')?.params.forEach((item) => {
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
              isMemberInWhiteListFromServer: Object.assign(
                this.state.isMemberInWhiteListFromServer,
                inputData
              ),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(
        data.get('isMemberInWhiteListFromServer')!.methodName,
        () => {
          this.callApi(data.get('isMemberInWhiteListFromServer')!.methodName);
        }
      )
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected fetchAnnouncementFromServer(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(
      this.renderParamWithText(
        data.get('fetchAnnouncementFromServer')!.methodName
      )
    );
    data.get('fetchAnnouncementFromServer')?.params.forEach((item) => {
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
              fetchAnnouncementFromServer: Object.assign(
                this.state.fetchAnnouncementFromServer,
                inputData
              ),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(
        data.get('fetchAnnouncementFromServer')!.methodName,
        () => {
          this.callApi(data.get('fetchAnnouncementFromServer')!.methodName);
        }
      )
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected blockMembers(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(this.renderParamWithText(data.get('blockMembers')!.methodName));
    data.get('blockMembers')?.params.forEach((item) => {
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
              blockMembers: Object.assign(this.state.blockMembers, inputData),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('blockMembers')!.methodName, () => {
        this.callApi(data.get('blockMembers')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected unblockMembers(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(
      this.renderParamWithText(data.get('unblockMembers')!.methodName)
    );
    data.get('unblockMembers')?.params.forEach((item) => {
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
              unblockMembers: Object.assign(
                this.state.unblockMembers,
                inputData
              ),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('unblockMembers')!.methodName, () => {
        this.callApi(data.get('unblockMembers')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected changeGroupName(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(
      this.renderParamWithText(data.get('changeGroupName')!.methodName)
    );
    data.get('changeGroupName')?.params.forEach((item) => {
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
              changeGroupName: Object.assign(
                this.state.changeGroupName,
                inputData
              ),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('changeGroupName')!.methodName, () => {
        this.callApi(data.get('changeGroupName')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected changeGroupDescription(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(
      this.renderParamWithText(data.get('changeGroupDescription')!.methodName)
    );
    data.get('changeGroupDescription')?.params.forEach((item) => {
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
              changeGroupDescription: Object.assign(
                this.state.changeGroupDescription,
                inputData
              ),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('changeGroupDescription')!.methodName, () => {
        this.callApi(data.get('changeGroupDescription')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected joinPublicGroup(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(
      this.renderParamWithText(data.get('joinPublicGroup')!.methodName)
    );
    data.get('joinPublicGroup')?.params.forEach((item) => {
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
              joinPublicGroup: Object.assign(
                this.state.joinPublicGroup,
                inputData
              ),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('joinPublicGroup')!.methodName, () => {
        this.callApi(data.get('joinPublicGroup')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected leaveGroup(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(this.renderParamWithText(data.get('leaveGroup')!.methodName));
    data.get('leaveGroup')?.params.forEach((item) => {
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
              leaveGroup: Object.assign(this.state.leaveGroup, inputData),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('leaveGroup')!.methodName, () => {
        this.callApi(data.get('leaveGroup')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected requestToJoinPublicGroup(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(
      this.renderParamWithText(data.get('requestToJoinPublicGroup')!.methodName)
    );
    data.get('requestToJoinPublicGroup')?.params.forEach((item) => {
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
              requestToJoinPublicGroup: Object.assign(
                this.state.requestToJoinPublicGroup,
                inputData
              ),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(
        data.get('requestToJoinPublicGroup')!.methodName,
        () => {
          this.callApi(data.get('requestToJoinPublicGroup')!.methodName);
        }
      )
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected destroyGroup(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(this.renderParamWithText(data.get('destroyGroup')!.methodName));
    data.get('destroyGroup')?.params.forEach((item) => {
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
              destroyGroup: Object.assign(this.state.destroyGroup, inputData),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('destroyGroup')!.methodName, () => {
        this.callApi(data.get('destroyGroup')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected blockGroup(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(this.renderParamWithText(data.get('blockGroup')!.methodName));
    data.get('blockGroup')?.params.forEach((item) => {
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
              blockGroup: Object.assign(this.state.blockGroup, inputData),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('blockGroup')!.methodName, () => {
        this.callApi(data.get('blockGroup')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected unblockGroup(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(this.renderParamWithText(data.get('unblockGroup')!.methodName));
    data.get('unblockGroup')?.params.forEach((item) => {
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
              unblockGroup: Object.assign(this.state.unblockGroup, inputData),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('unblockGroup')!.methodName, () => {
        this.callApi(data.get('unblockGroup')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected changeOwner(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(this.renderParamWithText(data.get('changeOwner')!.methodName));
    data.get('changeOwner')?.params.forEach((item) => {
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
              changeOwner: Object.assign(this.state.changeOwner, inputData),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('changeOwner')!.methodName, () => {
        this.callApi(data.get('changeOwner')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected addAdmin(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(this.renderParamWithText(data.get('addAdmin')!.methodName));
    data.get('addAdmin')?.params.forEach((item) => {
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
              addAdmin: Object.assign(this.state.addAdmin, inputData),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('addAdmin')!.methodName, () => {
        this.callApi(data.get('addAdmin')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected removeAdmin(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(this.renderParamWithText(data.get('removeAdmin')!.methodName));
    data.get('removeAdmin')?.params.forEach((item) => {
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
              removeAdmin: Object.assign(this.state.removeAdmin, inputData),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('removeAdmin')!.methodName, () => {
        this.callApi(data.get('removeAdmin')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected muteMembers(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(this.renderParamWithText(data.get('muteMembers')!.methodName));
    data.get('muteMembers')?.params.forEach((item) => {
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
              muteMembers: Object.assign(this.state.muteMembers, inputData),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('muteMembers')!.methodName, () => {
        this.callApi(data.get('muteMembers')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected unMuteMembers(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(
      this.renderParamWithText(data.get('unMuteMembers')!.methodName)
    );
    data.get('unMuteMembers')?.params.forEach((item) => {
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
              unMuteMembers: Object.assign(this.state.unMuteMembers, inputData),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('unMuteMembers')!.methodName, () => {
        this.callApi(data.get('unMuteMembers')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected muteAllMembers(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(
      this.renderParamWithText(data.get('muteAllMembers')!.methodName)
    );
    data.get('muteAllMembers')?.params.forEach((item) => {
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
              muteAllMembers: Object.assign(
                this.state.muteAllMembers,
                inputData
              ),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('muteAllMembers')!.methodName, () => {
        this.callApi(data.get('muteAllMembers')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected unMuteAllMembers(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(
      this.renderParamWithText(data.get('unMuteAllMembers')!.methodName)
    );
    data.get('unMuteAllMembers')?.params.forEach((item) => {
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
              unMuteAllMembers: Object.assign(
                this.state.unMuteAllMembers,
                inputData
              ),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('unMuteAllMembers')!.methodName, () => {
        this.callApi(data.get('unMuteAllMembers')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected addWhiteList(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(this.renderParamWithText(data.get('addWhiteList')!.methodName));
    data.get('addWhiteList')?.params.forEach((item) => {
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
              addWhiteList: Object.assign(this.state.addWhiteList, inputData),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('addWhiteList')!.methodName, () => {
        this.callApi(data.get('addWhiteList')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected removeWhiteList(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(
      this.renderParamWithText(data.get('removeWhiteList')!.methodName)
    );
    data.get('removeWhiteList')?.params.forEach((item) => {
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
              removeWhiteList: Object.assign(
                this.state.removeWhiteList,
                inputData
              ),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('removeWhiteList')!.methodName, () => {
        this.callApi(data.get('removeWhiteList')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected uploadGroupSharedFile(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(
      this.renderParamWithText(data.get('uploadGroupSharedFile')!.methodName)
    );
    data.get('uploadGroupSharedFile')?.params.forEach((item) => {
      if (item.paramName === 'filePath') {
        domAry.push(
          this.renderGroupParamWithSelectFile(
            item.paramName,
            item.paramDefaultValue,
            (inputData: { [index: string]: string }) => {
              console.log('===inputData: ', inputData);
              this.setState({
                uploadGroupSharedFile: Object.assign(
                  this.state.uploadGroupSharedFile,
                  inputData
                ),
              });
            }
          )
        );
      } else {
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
                uploadGroupSharedFile: Object.assign(
                  this.state.uploadGroupSharedFile,
                  inputData
                ),
              });
            }
          )
        );
      }
    });
    domAry.push(
      this.renderButton(data.get('uploadGroupSharedFile')!.methodName, () => {
        this.callApi(data.get('uploadGroupSharedFile')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected updateGroupAnnouncement(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(
      this.renderParamWithText(data.get('updateGroupAnnouncement')!.methodName)
    );
    data.get('updateGroupAnnouncement')?.params.forEach((item) => {
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
              updateGroupAnnouncement: Object.assign(
                this.state.updateGroupAnnouncement,
                inputData
              ),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('updateGroupAnnouncement')!.methodName, () => {
        this.callApi(data.get('updateGroupAnnouncement')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected updateGroupExtension(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(
      this.renderParamWithText(data.get('updateGroupExtension')!.methodName)
    );
    data.get('updateGroupExtension')?.params.forEach((item) => {
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
              updateGroupExtension: Object.assign(
                this.state.updateGroupExtension,
                inputData
              ),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('updateGroupExtension')!.methodName, () => {
        this.callApi(data.get('updateGroupExtension')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected acceptJoinApplication(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(
      this.renderParamWithText(data.get('acceptJoinApplication')!.methodName)
    );
    data.get('acceptJoinApplication')?.params.forEach((item) => {
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
              acceptJoinApplication: Object.assign(
                this.state.acceptJoinApplication,
                inputData
              ),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('acceptJoinApplication')!.methodName, () => {
        this.callApi(data.get('acceptJoinApplication')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected declineJoinApplication(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(
      this.renderParamWithText(data.get('declineJoinApplication')!.methodName)
    );
    data.get('declineJoinApplication')?.params.forEach((item) => {
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
              declineJoinApplication: Object.assign(
                this.state.declineJoinApplication,
                inputData
              ),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('declineJoinApplication')!.methodName, () => {
        this.callApi(data.get('declineJoinApplication')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected downloadGroupSharedFile(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(
      this.renderParamWithText(data.get('downloadGroupSharedFile')!.methodName)
    );
    data.get('downloadGroupSharedFile')?.params.forEach((item) => {
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
              downloadGroupSharedFile: Object.assign(
                this.state.downloadGroupSharedFile,
                inputData
              ),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('downloadGroupSharedFile')!.methodName, () => {
        this.callApi(data.get('downloadGroupSharedFile')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }
  protected removeGroupSharedFile(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(
      this.renderParamWithText(data.get('removeGroupSharedFile')!.methodName)
    );
    data.get('removeGroupSharedFile')?.params.forEach((item) => {
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
              removeGroupSharedFile: Object.assign(
                this.state.removeGroupSharedFile,
                inputData
              ),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('removeGroupSharedFile')!.methodName, () => {
        this.callApi(data.get('removeGroupSharedFile')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }

  private callApi(name: string): void {
    console.log(`${GroupManagerLeafScreen.TAG}: callApi: `);
    switch (name) {
      case GROUPMN.createGroup: {
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
          'GROUPMN.createGroup'
        );
        break;
      }
      case GROUPMN.addMembers: {
        const { groupId, members, welcome } = this.state.addMembers;
        this.tryCatch(
          ChatClient.getInstance().groupManager.addMembers(
            groupId,
            members,
            welcome
          ),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.addMembers'
        );
        break;
      }
      case GROUPMN.removeMembers: {
        const { groupId, members } = this.state.removeMembers;
        this.tryCatch(
          ChatClient.getInstance().groupManager.removeMembers(groupId, members),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.removeMembers'
        );
        break;
      }
      case GROUPMN.inviterUser: {
        const { groupId, members, reason } = this.state.inviterUser;
        this.tryCatch(
          ChatClient.getInstance().groupManager.inviterUser(
            groupId,
            members,
            reason
          ),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.inviterUser'
        );
        break;
      }
      case GROUPMN.acceptInvitation: {
        const { groupId, inviter } = this.state.acceptInvitation;
        this.tryCatch(
          ChatClient.getInstance().groupManager.acceptInvitation(
            groupId,
            inviter
          ),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.acceptInvitation'
        );
        break;
      }
      case GROUPMN.declineInvitation: {
        const { groupId, inviter } = this.state.declineInvitation;
        this.tryCatch(
          ChatClient.getInstance().groupManager.declineInvitation(
            groupId,
            inviter
          ),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.declineInvitation'
        );
        break;
      }
      case GROUPMN.getGroupWithId: {
        const { groupId } = this.state.getGroupWithId;
        this.tryCatch(
          ChatClient.getInstance().groupManager.getGroupWithId(groupId),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.getGroupWithId'
        );
        break;
      }
      case GROUPMN.getJoinedGroups: {
        this.tryCatch(
          ChatClient.getInstance().groupManager.getJoinedGroups(),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.getJoinedGroups'
        );
        break;
      }
      case GROUPMN.fetchJoinedGroupsFromServer: {
        const { pageSize, pageNum } = this.state.fetchJoinedGroupsFromServer;
        this.tryCatch(
          ChatClient.getInstance().groupManager.fetchJoinedGroupsFromServer(
            pageSize,
            pageNum
          ),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.fetchJoinedGroupsFromServer'
        );
        break;
      }
      case GROUPMN.fetchPublicGroupsFromServer: {
        const { pageSize, cursor } = this.state.fetchPublicGroupsFromServer;
        this.tryCatch(
          ChatClient.getInstance().groupManager.fetchPublicGroupsFromServer(
            pageSize,
            cursor
          ),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.fetchPublicGroupsFromServer'
        );
        break;
      }
      case GROUPMN.fetchGroupInfoFromServer: {
        const { groupId } = this.state.fetchGroupInfoFromServer;
        this.tryCatch(
          ChatClient.getInstance().groupManager.fetchGroupInfoFromServer(
            groupId
          ),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.fetchGroupInfoFromServer'
        );
        break;
      }
      case GROUPMN.fetchMemberListFromServer: {
        const { groupId, pageSize, cursor } =
          this.state.fetchMemberListFromServer;
        this.tryCatch(
          ChatClient.getInstance().groupManager.fetchMemberListFromServer(
            groupId,
            pageSize,
            cursor
          ),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.fetchMemberListFromServer'
        );
        break;
      }
      case GROUPMN.fetchBlockListFromServer: {
        const { groupId, pageSize, pageNum } =
          this.state.fetchBlockListFromServer;
        this.tryCatch(
          ChatClient.getInstance().groupManager.fetchBlockListFromServer(
            groupId,
            pageSize,
            pageNum
          ),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.fetchBlockListFromServer'
        );
        break;
      }
      case GROUPMN.fetchMuteListFromServer: {
        const { groupId, pageSize, pageNum } =
          this.state.fetchMuteListFromServer;
        this.tryCatch(
          ChatClient.getInstance().groupManager.fetchMuteListFromServer(
            groupId,
            pageSize,
            pageNum
          ),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.fetchMuteListFromServer'
        );
        break;
      }
      case GROUPMN.fetchWhiteListFromServer: {
        const { groupId } = this.state.fetchWhiteListFromServer;
        this.tryCatch(
          ChatClient.getInstance().groupManager.fetchWhiteListFromServer(
            groupId
          ),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.fetchWhiteListFromServer'
        );
        break;
      }
      case GROUPMN.fetchGroupFileListFromServer: {
        const { groupId, pageSize, pageNum } =
          this.state.fetchGroupFileListFromServer;
        this.tryCatch(
          ChatClient.getInstance().groupManager.fetchGroupFileListFromServer(
            groupId,
            pageSize,
            pageNum
          ),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.fetchGroupFileListFromServer'
        );
        break;
      }
      case GROUPMN.isMemberInWhiteListFromServer: {
        const { groupId } = this.state.isMemberInWhiteListFromServer;
        this.tryCatch(
          ChatClient.getInstance().groupManager.isMemberInWhiteListFromServer(
            groupId
          ),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.fetchGroupFileListFromServer'
        );
        break;
      }
      case GROUPMN.fetchAnnouncementFromServer: {
        const { groupId } = this.state.fetchAnnouncementFromServer;
        this.tryCatch(
          ChatClient.getInstance().groupManager.fetchAnnouncementFromServer(
            groupId
          ),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.fetchGroupFileListFromServer'
        );
        break;
      }
      case GROUPMN.blockMembers: {
        const { groupId, members } = this.state.blockMembers;
        this.tryCatch(
          ChatClient.getInstance().groupManager.blockMembers(groupId, members),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.blockMembers'
        );
        break;
      }
      case GROUPMN.unblockMembers: {
        const { groupId, members } = this.state.unblockMembers;
        this.tryCatch(
          ChatClient.getInstance().groupManager.unblockMembers(
            groupId,
            members
          ),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.unblockMembers'
        );
        break;
      }
      case GROUPMN.changeGroupName: {
        // eslint-disable-next-line no-shadow
        const { groupId, name } = this.state.changeGroupName;
        this.tryCatch(
          ChatClient.getInstance().groupManager.changeGroupName(groupId, name),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.changeGroupName'
        );
        break;
      }
      case GROUPMN.changeGroupDescription: {
        const { groupId, desc } = this.state.changeGroupDescription;
        this.tryCatch(
          ChatClient.getInstance().groupManager.changeGroupDescription(
            groupId,
            desc
          ),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.changeGroupDescription'
        );
        break;
      }
      case GROUPMN.joinPublicGroup: {
        const { groupId } = this.state.joinPublicGroup;
        this.tryCatch(
          ChatClient.getInstance().groupManager.joinPublicGroup(groupId),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.joinPublicGroup'
        );
        break;
      }
      case GROUPMN.leaveGroup: {
        const { groupId } = this.state.leaveGroup;
        this.tryCatch(
          ChatClient.getInstance().groupManager.leaveGroup(groupId),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.leaveGroup'
        );
        break;
      }
      case GROUPMN.requestToJoinPublicGroup: {
        const { groupId, reason } = this.state.requestToJoinPublicGroup;
        this.tryCatch(
          ChatClient.getInstance().groupManager.requestToJoinPublicGroup(
            groupId,
            reason
          ),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.requestToJoinPublicGroup'
        );
        break;
      }
      case GROUPMN.destroyGroup: {
        const { groupId } = this.state.destroyGroup;
        this.tryCatch(
          ChatClient.getInstance().groupManager.destroyGroup(groupId),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.destroyGroup'
        );
        break;
      }
      case GROUPMN.blockGroup: {
        const { groupId } = this.state.destroyGroup;
        this.tryCatch(
          ChatClient.getInstance().groupManager.blockGroup(groupId),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.blockGroup'
        );
        break;
      }
      case GROUPMN.unblockGroup: {
        const { groupId } = this.state.destroyGroup;
        this.tryCatch(
          ChatClient.getInstance().groupManager.unblockGroup(groupId),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.unblockGroup'
        );
        break;
      }
      case GROUPMN.changeOwner: {
        const { groupId, newOwner } = this.state.changeOwner;
        this.tryCatch(
          ChatClient.getInstance().groupManager.changeOwner(groupId, newOwner),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.changeOwner'
        );
        break;
      }
      case GROUPMN.addAdmin: {
        const { groupId, memberId } = this.state.addAdmin;
        this.tryCatch(
          ChatClient.getInstance().groupManager.addAdmin(groupId, memberId),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.addAdmin'
        );
        break;
      }
      case GROUPMN.removeAdmin: {
        const { groupId, memberId } = this.state.removeAdmin;
        this.tryCatch(
          ChatClient.getInstance().groupManager.removeAdmin(groupId, memberId),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.removeAdmin'
        );
        break;
      }
      case GROUPMN.muteMembers: {
        const { groupId, members, duration } = this.state.muteMembers;
        this.tryCatch(
          ChatClient.getInstance().groupManager.muteMembers(
            groupId,
            members,
            duration
          ),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.muteMembers'
        );
        break;
      }
      case GROUPMN.unMuteMembers: {
        const { groupId, members } = this.state.unMuteMembers;
        this.tryCatch(
          ChatClient.getInstance().groupManager.unMuteMembers(groupId, members),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.unMuteMembers'
        );
        break;
      }
      case GROUPMN.muteAllMembers: {
        const { groupId } = this.state.muteAllMembers;
        this.tryCatch(
          ChatClient.getInstance().groupManager.muteAllMembers(groupId),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.muteAllMembers'
        );
        break;
      }
      case GROUPMN.unMuteAllMembers: {
        const { groupId } = this.state.unMuteAllMembers;
        this.tryCatch(
          ChatClient.getInstance().groupManager.unMuteAllMembers(groupId),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.unMuteAllMembers'
        );
        break;
      }
      case GROUPMN.addWhiteList: {
        const { groupId, members } = this.state.addWhiteList;
        this.tryCatch(
          ChatClient.getInstance().groupManager.addWhiteList(groupId, members),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.addWhiteList'
        );
        break;
      }
      case GROUPMN.removeWhiteList: {
        const { groupId, members } = this.state.removeWhiteList;
        this.tryCatch(
          ChatClient.getInstance().groupManager.removeWhiteList(
            groupId,
            members
          ),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.removeWhiteList'
        );
        break;
      }
      case GROUPMN.uploadGroupSharedFile: {
        const { groupId, filePath } = this.state.uploadGroupSharedFile;
        console.log('=====', groupId, filePath);
        this.tryCatch(
          ChatClient.getInstance().groupManager.uploadGroupSharedFile(
            groupId,
            filePath
          ),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.uploadGroupSharedFile'
        );
        break;
      }
      case GROUPMN.updateGroupAnnouncement: {
        const { groupId, announcement } = this.state.updateGroupAnnouncement;
        this.tryCatch(
          ChatClient.getInstance().groupManager.updateGroupAnnouncement(
            groupId,
            announcement
          ),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.updateGroupAnnouncement'
        );
        break;
      }
      case GROUPMN.updateGroupExtension: {
        const { groupId, extension } = this.state.updateGroupExtension;
        this.tryCatch(
          ChatClient.getInstance().groupManager.updateGroupExtension(
            groupId,
            extension
          ),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.updateGroupExtension'
        );
        break;
      }
      case GROUPMN.acceptJoinApplication: {
        const { groupId, username } = this.state.acceptJoinApplication;
        this.tryCatch(
          ChatClient.getInstance().groupManager.acceptJoinApplication(
            groupId,
            username
          ),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.acceptJoinApplication'
        );
        break;
      }
      case GROUPMN.declineJoinApplication: {
        const { groupId, username, reason } = this.state.declineJoinApplication;
        this.tryCatch(
          ChatClient.getInstance().groupManager.declineJoinApplication(
            groupId,
            username,
            reason
          ),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.acceptJoinApplication'
        );
        break;
      }
      case GROUPMN.downloadGroupSharedFile: {
        const { groupId, fileId, savePath } =
          this.state.downloadGroupSharedFile;
        this.tryCatch(
          ChatClient.getInstance().groupManager.downloadGroupSharedFile(
            groupId,
            fileId,
            savePath
          ),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.downloadGroupSharedFile'
        );
        break;
      }
      case GROUPMN.removeGroupSharedFile: {
        const { groupId, fileId } = this.state.removeGroupSharedFile;
        this.tryCatch(
          ChatClient.getInstance().groupManager.removeGroupSharedFile(
            groupId,
            fileId
          ),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.removeGroupSharedFile'
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
