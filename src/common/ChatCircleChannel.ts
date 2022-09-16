/**
 * The channel type.
 */
export enum ChatCircleChannelType {
  /**
   * Public type.
   */
  Public = 0,
  /**
   * Private type.
   */
  Private,
}

/**
 * The channel rank type.
 */
export enum ChatCircleChannelRank {
  /**
   * The maximum number is 2000
   */
  R2000 = 0,
  /**
   * The maximum number is 20000
   */
  R20000,
  /**
   * The maximum number is 100000
   */
  R100000,
}

/**
 * The channel data.
 */
export class ChatCircleChannel {
  /**
   * The server ID generated when created. see {@link ChatCircleManager#createServer}
   */
  serverId: string;
  /**
   * The channel ID generated when created. see {@link ChatCircleManager#createChannel}
   */
  channelId: string;
  /**
   * The channel name.
   */
  channelName: string;
  /**
   * The channel description.
   */
  channelDescription?: string;
  /**
   * The custom string type parameter.
   */
  channelExtension?: string;
  /**
   * Whether it is the default channel.
   */
  isDefaultChannel: boolean;
  /**
   * The channel type.
   */
  channelType: ChatCircleChannelType;
  /**
   * The channel rank type.
   */
  channelRank: ChatCircleChannelRank;
  /**
   * The construct a channel data object.
   */
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

/**
 * The converter from number to channel type.
 *
 * @param type Number type.
 *
 * @returns Channel type.
 */
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

/**
 * The converter from number to channel rank type.
 *
 * @param rank Number type.
 *
 * @returns Rank type.
 */
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
