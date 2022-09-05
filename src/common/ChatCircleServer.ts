import type { ChatCircleTag } from './ChatCircleTag';

export class ChatCircleServer {
  serverId: string;
  serverName: string;
  serverIcon?: string;
  serverDescription?: string;
  serverExtension?: string;
  serverOwner?: string;
  defaultChannelId?: string;
  tags?: Array<ChatCircleTag>;
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
