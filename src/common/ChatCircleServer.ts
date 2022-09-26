import type { ChatCircleTag } from './ChatCircleTag';

/**
 * The server details class.
 */
export class ChatCircleServer {
  /**
   * The server ID. See {@link ChatCircleManager#createServer}.
   */
  serverId: string;
  /**
   * The server name.
   */
  serverName: string;
  /**
   * The server icon URL.
   */
  serverIcon?: string;
  /**
   * The server description.
   */
  serverDescription?: string;
  /**
   * The custom server extension parameter in string format.
   */
  serverExtension?: string;
  /**
   * The server owner.
   */
  serverOwner?: string;
  /**
   * The ID of the default channel. See {@link ChatCircleManager#createServer}.
   *
   * The default channel is created during server creation.
   */
  defaultChannelId?: string;
  /**
   * The server tags. See {@link ChatCircleManager#addTagsToServer}
   */
  tags?: Array<ChatCircleTag>;
  /**
   * Constructs a server object.
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
