/**
 * The channel types.
 */
export enum ChatCircleChannelType {
  /**
   * Public channel.
   */
  Public = 0,
  /**
   * Private channel.
   */
  Private,
}

/**
 * The channel member capacity ranks.
 */
export enum ChatCircleChannelRank {
  /**
   * The maximum number of members allowed in a channel is 2000.
   */
  R2000 = 0,
  /**
   * The maximum number of members allowed in a channel is 20000.
   */
  R20000,
  /**
   * The maximum number of members allowed in a channel is 100000.
   */
  R100000,
}

/**
 * The channel details class.
 */
export class ChatCircleChannel {
  /**
   * The server ID. See {@link ChatCircleManager#createServer}.
   */
  serverId: string;
  /**
   * The channel ID. See {@link ChatCircleManager#createChannel}.
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
   * The custom channel extension parameter.
   */
  channelExtension?: string;
  /**
   * Whether it is the default channel:
   * - `true`: Yes;
   * - `false`: No.
   */
  isDefaultChannel: boolean;
  /**
   * The channel type.
   */
  channelType: ChatCircleChannelType;
  /**
   * The channel member capacity rank.
   */
  channelRank: ChatCircleChannelRank;
  /**
   * Constructs a channel object.
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
 * Converts the channel type from Int to the enum type.
 *
 * @param type The channel type of the Int type.
 *
 * @returns The channel type of the enum type.
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
 * Converts the channel member capacity rank from Int to the enum type.
 *
 * @param rank The channel member capacity rank of the Int type.
 *
 * @returns The channel member capacity rank of the enum type.
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
