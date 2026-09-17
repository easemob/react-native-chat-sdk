import { ChatClient } from 'react-native-chat-sdk';
import type { ApiEntry } from '../api_entry';

export const groupApis: ApiEntry[] = [
  {
    name: 'ChatGroupManager.createGroupEx',
    group: 'ChatGroupManager',
    description:
      '创建群组（5.0.0 起 options 参数改为 configs）。' +
      'configs：{maxCount, inviteNeedConfirm, ext, isPublic, joinApprovalRequired, allowInvites}；' +
      'groupAvatar/desc/inviteMembers/inviteReason 可选。返回群 JSON（含 groupId）。',
    paramsTemplate: JSON.stringify(
      {
        groupName: 'my group',
        groupAvatar: '',
        desc: 'group description',
        inviteMembers: ['ID'],
        inviteReason: 'welcome',
        configs: {
          maxCount: 200,
          inviteNeedConfirm: false,
          ext: '',
          isPublic: false,
          joinApprovalRequired: false,
          allowInvites: true,
        },
      },
      null,
      2
    ),
    invoke: async (params) => {
      return ChatClient.getInstance().groupManager.createGroupEx({
        groupName: String(params.groupName),
        groupAvatar:
          params.groupAvatar === undefined || params.groupAvatar === ''
            ? undefined
            : String(params.groupAvatar),
        desc: params.desc === undefined ? undefined : String(params.desc),
        inviteMembers: (params.inviteMembers ?? []).map(String),
        inviteReason:
          params.inviteReason === undefined
            ? undefined
            : String(params.inviteReason),
        configs: params.configs,
      });
    },
  },
  {
    name: 'ChatGroupManager.updateGroupConfigs',
    group: 'ChatGroupManager',
    description:
      '【5.0.0 新增】按位掩码更新群配置（仅群主/管理员）。' +
      'types：ChatGroupConfigsType 掩码（AllowInvites=1, MaxUsers=2, InviteNeedConfirm=4, ' +
      'JoinApprovalRequired=8, IsPublic=16, Ext=32，可按位或组合）；configs：新配置。返回群 JSON。',
    paramsTemplate: JSON.stringify(
      {
        groupId: 'ID',
        types: 2,
        configs: {
          maxCount: 300,
          inviteNeedConfirm: false,
          ext: '',
          isPublic: false,
          joinApprovalRequired: false,
          allowInvites: true,
        },
      },
      null,
      2
    ),
    invoke: async (params) => {
      return ChatClient.getInstance().groupManager.updateGroupConfigs(
        String(params.groupId),
        Number(params.types),
        params.configs
      );
    },
  },
  {
    name: 'ChatGroupManager.destroyGroup',
    group: 'ChatGroupManager',
    description:
      '解散群组（仅群主）。groupId：群 ID。用于 createGroupEx 验证后的清理。',
    paramsTemplate: JSON.stringify({ groupId: 'ID' }, null, 2),
    invoke: async (params) => {
      return ChatClient.getInstance().groupManager.destroyGroup(
        String(params.groupId)
      );
    },
  },
  {
    name: 'ChatGroupManager.getJoinedGroups',
    group: 'ChatGroupManager',
    description: '获取当前用户加入的群组列表（本地数据）。无参数。',
    paramsTemplate: '{}',
    invoke: async () => {
      return ChatClient.getInstance().groupManager.getJoinedGroups();
    },
  },
  {
    name: 'ChatGroupManager.updateGroupNamecard',
    group: 'ChatGroupManager',
    description:
      '更新当前用户在群内的名片。groupId：群 ID；namecard 可选，省略表示清除名片。',
    paramsTemplate: JSON.stringify(
      { groupId: 'ID', namecard: 'my namecard' },
      null,
      2
    ),
    invoke: async (params) => {
      return ChatClient.getInstance().groupManager.updateGroupNamecard(
        String(params.groupId),
        params.namecard === undefined ? undefined : String(params.namecard)
      );
    },
  },
  {
    name: 'ChatGroupManager.updateGroupExtension',
    group: 'ChatGroupManager',
    description:
      '更新群扩展字段（仅群主/管理员）。groupId：群 ID；ext：扩展内容。',
    paramsTemplate: JSON.stringify(
      { groupId: 'ID', ext: 'ext-content' },
      null,
      2
    ),
    invoke: async (params) => {
      return ChatClient.getInstance().groupManager.updateGroupExtension(
        String(params.groupId),
        String(params.ext)
      );
    },
  },
  {
    name: 'ChatGroupManager.getGroupNamecard',
    group: 'ChatGroupManager',
    description: '获取群成员名片。groupId：群 ID；userId：成员用户 ID。',
    paramsTemplate: JSON.stringify({ groupId: 'ID', userId: 'ID' }, null, 2),
    invoke: async (params) => {
      return ChatClient.getInstance().groupManager.getGroupNamecard(
        String(params.groupId),
        String(params.userId)
      );
    },
  },
];
