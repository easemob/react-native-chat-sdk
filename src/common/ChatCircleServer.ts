import type { ChatCircleTag } from './ChatCircleTag';

/**
 * The server data.
 */
export class ChatCircleServer {
  /**
   * The server ID generated when created. see {@link ChatCircleManager#createServer}
   */
  serverId: string;
  /**
   * The server name.
   */
  serverName: string;
  /**
   * The server icon url.
   */
  serverIcon?: string;
  /**
   * The server description.
   */
  serverDescription?: string;
  /**
   * The custom string type parameter.
   */
  serverExtension?: string;
  /**
   * The server owner.
   */
  serverOwner?: string;
  /**
   * When creating a server, create a default channel at the same time.
   *
   * The channel ID generated when created. See {@link ChatCircleManager#createServer}
   */
  defaultChannelId?: string;
  /**
   * The server tags generated when created. See {@link ChatCircleManager#addTagsToServer}
   */
  tags?: Array<ChatCircleTag>;
  /**
   * The construct a server data object.
   */
  constructor(params: {
    serverId: string;
    serverName: string;
    serverIcon?: string;
    serverDescription?: string;
    serverExtension?: string;
    serverOwner?: string;
    defaultChannelId?: string;
    tags?: Array<ChatCircleTag>;
  }) {
    this.serverId = params.serverId;
    this.serverName = params.serverName;
    this.serverIcon = params.serverIcon;
    this.serverDescription = params.serverDescription;
    this.serverExtension = params.serverExtension;
    this.serverOwner = params.serverOwner;
    this.defaultChannelId = params.defaultChannelId;
    this.tags = params.tags;
  }
}
