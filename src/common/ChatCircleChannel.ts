export enum ChatCircleChannelType {
  Public = 0,
  Private,
}
export enum ChatCircleChannelRank {
  R2000 = 0,
  R20000,
  R100000,
}
export class ChatCircleChannel {
  serverId: string;
  channelId: string;
  channelName: string;
  channelDescription?: string;
  channelExtension?: string;
  isDefaultChannel: boolean;
  channelType: ChatCircleChannelType;
  channelRank: ChatCircleChannelRank;
  constructor(params: {
    serverId: string;
    channelId: string;
    channelName: string;
    channelDescription?: string;
    channelExtension?: string;
    isDefaultChannel: boolean;
    channelType: ChatCircleChannelType;
    channelRank: ChatCircleChannelRank;
  }) {
    this.serverId = params.serverId;
    this.channelId = params.channelId;
    this.channelName = params.channelName;
    this.channelDescription = params.channelDescription;
    this.channelExtension = params.channelExtension;
    this.isDefaultChannel = params.isDefaultChannel;
    this.channelType = params.channelType;
    this.channelRank = params.channelRank;
  }
}

export function ChatCircleChannelTypeFromNumber(
  type?: number
): ChatCircleChannelType | undefined {
  if (type !== null || type !== undefined) {
    let ret: ChatCircleChannelType = ChatCircleChannelType.Public;
    switch (type) {
      case 0:
        ret = ChatCircleChannelType.Public;
        break;
      case 1:
        ret = ChatCircleChannelType.Private;
        break;
      default:
        break;
    }
    return ret;
  }
  return undefined;
}

export function ChatCircleChannelRankFromNumber(
  rank?: number
): ChatCircleChannelRank | undefined {
  if (rank !== null || rank !== undefined) {
    let ret: ChatCircleChannelRank = ChatCircleChannelRank.R2000;
    switch (rank) {
      case 0:
        ret = ChatCircleChannelRank.R2000;
        break;
      case 1:
        ret = ChatCircleChannelRank.R20000;
        break;
      case 2:
        ret = ChatCircleChannelRank.R100000;
        break;
      default:
        break;
    }
    return ret;
  }
  return undefined;
}
