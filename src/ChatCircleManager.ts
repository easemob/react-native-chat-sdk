import type { EmitterSubscription, NativeEventEmitter } from 'react-native';
import type {
  ChatCircleChannelListener,
  ChatCircleServerListener,
} from './ChatEvents';
import {
  ChatCircleChannel,
  ChatCircleChannelRank,
  ChatCircleChannelRankFromNumber,
  ChatCircleChannelType,
  ChatCircleChannelTypeFromNumber,
} from './common/ChatCircleChannel';
import { ChatCircleServer } from './common/ChatCircleServer';
import { ChatCircleTag } from './common/ChatCircleTag';
import {
  ChatCircleUser,
  ChatCircleUserRole,
  ChatCircleUserRoleFromNumber,
} from './common/ChatCircleUser';
import { ChatCursorResult } from './common/ChatCursorResult';
import { chatlog } from './common/ChatLog';
import { BaseManager } from './__internal__/Base';
import {
  MTacceptCircleChannelInvitation,
  MTacceptCircleServerInvitation,
  MTaddModeratorToCircleServer,
  MTaddTagsToCircleServer,
  MTcheckSelfInCircleServer,
  MTcheckSelfIsInCircleChannel,
  MTcreateCircleChannel,
  MTcreateCircleServer,
  MTdeclineCircleChannelInvitation,
  MTdeclineCircleServerInvitation,
  MTdestroyCircleChannel,
  MTdestroyCircleServer,
  MTfetchCircleChannelDetail,
  MTfetchCircleChannelMembers,
  MTfetchCircleChannelMuteUsers,
  MTfetchCircleServerDetail,
  MTfetchCircleServerMembers,
  MTfetchCircleServersWithKeyword,
  MTfetchCircleServerTags,
  MTfetchJoinedCircleServers,
  MTfetchPublicCircleChannelInServer,
  MTfetchSelfCircleServerRole,
  MTfetchVisiblePrivateCircleChannelInServer,
  MTinviteUserToCircleChannel,
  MTinviteUserToCircleServer,
  MTjoinCircleChannel,
  MTjoinCircleServer,
  MTleaveCircleChannel,
  MTleaveCircleServer,
  MTmuteUserInCircleChannel,
  MTonCircleChannelCreated,
  MTonCircleChannelDestroyed,
  MTonCircleChannelUpdated,
  MTonCircleServerDestroyed,
  MTonCircleServerUpdated,
  MTonInvitationBeAcceptedFromCircleChannel,
  MTonInvitationBeAcceptedFromCircleServer,
  MTonInvitationBeDeclinedFromCircleChannel,
  MTonInvitationBeDeclinedFromCircleServer,
  MTonMemberJoinedCircleChannel,
  MTonMemberJoinedCircleServer,
  MTonMemberLeftCircleChannel,
  MTonMemberLeftCircleServer,
  MTonMemberMuteChangedInCircleChannel,
  MTonMemberRemovedFromCircleChannel,
  MTonMemberRemovedFromCircleServer,
  MTonReceiveInvitationFromCircleChannel,
  MTonReceiveInvitationFromCircleServer,
  MTonRoleAssignedFromCircleServer,
  MTremoveModeratorFromCircleServer,
  MTremoveTagsFromCircleServer,
  MTremoveUserFromCircleChannel,
  MTremoveUserFromCircleServer,
  MTunmuteUserInCircleChannel,
  MTupdateCircleChannel,
  MTupdateCircleServer,
} from './__internal__/Consts';
import { Native } from './__internal__/Native';

export class ChatCircleManager extends BaseManager {
  protected static TAG = 'ChatCircleManager';

  private _serverListeners: Set<ChatCircleServerListener>;
  private _channelListeners: Set<ChatCircleChannelListener>;
  private _circleSubscriptions: Map<string, EmitterSubscription>;

  /**
   * Constructs a Circle manager object.
   */
  constructor() {
    super();
    this._serverListeners = new Set();
    this._channelListeners = new Set();
    this._circleSubscriptions = new Map();
  }

  /**
   * Sets the event listener.
   *
   * @param event The native event emitter.
   */
  public setNativeListener(event: NativeEventEmitter) {
    this._eventEmitter = event;
    chatlog.log(`${ChatCircleManager.TAG}: setNativeListener`);
    this._circleSubscriptions.forEach((value: EmitterSubscription) => {
      value.remove();
    });
    this._circleSubscriptions.clear();
    this._circleSubscriptions.set(
      MTonCircleServerDestroyed,
      event.addListener(MTonCircleServerDestroyed, (params: any) => {
        this._serverListeners.forEach((listener) => {
          listener.onServerDestroyed?.(params);
        });
      })
    );
    this._circleSubscriptions.set(
      MTonCircleServerUpdated,
      event.addListener(MTonCircleServerUpdated, (params: any) => {
        this._serverListeners.forEach((listener) => {
          listener.onServerUpdated?.(params);
        });
      })
    );
    this._circleSubscriptions.set(
      MTonMemberJoinedCircleServer,
      event.addListener(MTonMemberJoinedCircleServer, (params: any) => {
        this._serverListeners.forEach((listener) => {
          listener.onMemberJoinedServer?.(params);
        });
      })
    );
    this._circleSubscriptions.set(
      MTonMemberLeftCircleServer,
      event.addListener(MTonMemberLeftCircleServer, (params: any) => {
        this._serverListeners.forEach((listener) => {
          listener.onMemberLeftServer?.(params);
        });
      })
    );
    this._circleSubscriptions.set(
      MTonMemberRemovedFromCircleServer,
      event.addListener(MTonMemberRemovedFromCircleServer, (params: any) => {
        this._serverListeners.forEach((listener) => {
          listener.onMemberRemovedFromServer?.(params);
        });
      })
    );
    this._circleSubscriptions.set(
      MTonReceiveInvitationFromCircleServer,
      event.addListener(
        MTonReceiveInvitationFromCircleServer,
        (params: any) => {
          this._serverListeners.forEach((listener) => {
            listener.onReceiveServerInvitation?.(
              Object.assign(params.event, { inviter: params.inviter })
            );
          });
        }
      )
    );
    this._circleSubscriptions.set(
      MTonInvitationBeAcceptedFromCircleServer,
      event.addListener(
        MTonInvitationBeAcceptedFromCircleServer,
        (params: any) => {
          this._serverListeners.forEach((listener) => {
            listener.onServerInvitationBeAccepted?.(params);
          });
        }
      )
    );
    this._circleSubscriptions.set(
      MTonInvitationBeDeclinedFromCircleServer,
      event.addListener(
        MTonInvitationBeDeclinedFromCircleServer,
        (params: any) => {
          this._serverListeners.forEach((listener) => {
            listener.onServerInvitationBeDeclined?.(params);
          });
        }
      )
    );
    this._circleSubscriptions.set(
      MTonRoleAssignedFromCircleServer,
      event.addListener(MTonRoleAssignedFromCircleServer, (params: any) => {
        this._serverListeners.forEach((listener) => {
          listener.onServerRoleAssigned?.({
            serverId: params.serverId,
            memberId: params.memberId,
            role: ChatCircleUserRoleFromNumber(params.role)!,
          });
        });
      })
    );
    this._circleSubscriptions.set(
      MTonCircleChannelCreated,
      event.addListener(MTonCircleChannelCreated, (params: any) => {
        this._channelListeners.forEach((listener) => {
          listener.onChannelCreated?.(params);
        });
      })
    );
    this._circleSubscriptions.set(
      MTonCircleChannelDestroyed,
      event.addListener(MTonCircleChannelDestroyed, (params: any) => {
        this._channelListeners.forEach((listener) => {
          listener.onChannelDestroyed?.(params);
        });
      })
    );
    this._circleSubscriptions.set(
      MTonCircleChannelUpdated,
      event.addListener(MTonCircleChannelUpdated, (params: any) => {
        this._channelListeners.forEach((listener) => {
          listener.onChannelUpdated?.(params);
        });
      })
    );
    this._circleSubscriptions.set(
      MTonMemberJoinedCircleChannel,
      event.addListener(MTonMemberJoinedCircleChannel, (params: any) => {
        this._channelListeners.forEach((listener) => {
          listener.onMemberJoinedChannel?.(params);
        });
      })
    );
    this._circleSubscriptions.set(
      MTonReceiveInvitationFromCircleChannel,
      event.addListener(
        MTonReceiveInvitationFromCircleChannel,
        (params: any) => {
          this._channelListeners.forEach((listener) => {
            listener.onReceiveChannelInvitation?.(
              Object.assign(params.channelExtension, {
                inviter: params.inviter,
              })
            );
          });
        }
      )
    );
    this._circleSubscriptions.set(
      MTonInvitationBeAcceptedFromCircleChannel,
      event.addListener(
        MTonInvitationBeAcceptedFromCircleChannel,
        (params: any) => {
          this._channelListeners.forEach((listener) => {
            listener.onChannelInvitationBeAccepted?.(params);
          });
        }
      )
    );
    this._circleSubscriptions.set(
      MTonInvitationBeDeclinedFromCircleChannel,
      event.addListener(
        MTonInvitationBeDeclinedFromCircleChannel,
        (params: any) => {
          this._channelListeners.forEach((listener) => {
            listener.onChannelInvitationBeDeclined?.(params);
          });
        }
      )
    );
    this._circleSubscriptions.set(
      MTonMemberRemovedFromCircleChannel,
      event.addListener(MTonMemberRemovedFromCircleChannel, (params: any) => {
        this._channelListeners.forEach((listener) => {
          listener.onMemberRemovedFromChannel?.(params);
        });
      })
    );
    this._circleSubscriptions.set(
      MTonMemberLeftCircleChannel,
      event.addListener(MTonMemberLeftCircleChannel, (params: any) => {
        this._channelListeners.forEach((listener) => {
          listener.onMemberLeftChannel?.(params);
        });
      })
    );
    this._circleSubscriptions.set(
      MTonMemberMuteChangedInCircleChannel,
      event.addListener(MTonMemberMuteChangedInCircleChannel, (params: any) => {
        this._channelListeners.forEach((listener) => {
          listener.onMemberMuteChangeInChannel?.(params);
        });
      })
    );
  }

  /**
   * Adds a server listener.
   *
   * @param listener The server listener to add.
   */
  public addServerListener(listener: ChatCircleServerListener): void {
    this._serverListeners.add(listener);
  }
  /**
   * Removes a server listener.
   *
   * @param listener The server listener to remove.
   */
  public removeServerListener(listener: ChatCircleServerListener): void {
    this._serverListeners.delete(listener);
  }
  /**
   * Clears all server listeners.
   */
  public clearServerListener(): void {
    this._serverListeners.clear();
  }

  /**
   * Adds a channel listener.
   *
   * @param listener The channel listener to add.
   */
  public addChannelListener(listener: ChatCircleChannelListener): void {
    this._channelListeners.add(listener);
  }
  /**
   * Removes a channel listener.
   *
   * @param listener The channel listener to remove.
   */
  public removeChannelListener(listener: ChatCircleChannelListener): void {
    this._channelListeners.delete(listener);
  }
  /**
   * Clears all channel listeners.
   */
  public clearChannelListener(): void {
    this._channelListeners.clear();
  }

  private parseChatServer(json: any): ChatCircleServer {
    const tags: ChatCircleTag[] = [];
    Object.entries(json.serverTags).forEach((value: [string, any]) => {
      tags.push(new ChatCircleTag(value[1]));
    });
    return new ChatCircleServer({
      serverId: json.serverId,
      serverName: json.serverName,
      serverIcon: json.serverIcon,
      serverDescription: json.serverDescription,
      serverExtension: json.serverExtension,
      serverOwner: json.serverOwner,
      defaultChannelId: json.defaultChannelId,
      tags: tags.length > 0 ? tags : undefined,
    });
  }

  private parseChatChannel(json: any): ChatCircleChannel {
    return new ChatCircleChannel({
      serverId: json.serverId,
      channelId: json.channelId,
      channelName: json.channelName,
      channelDescription: json.channelDescription,
      channelExtension: json.channelExtension,
      isDefaultChannel: json.isDefaultChannel,
      channelType: ChatCircleChannelTypeFromNumber(json.channelType)!,
      channelRank: ChatCircleChannelRankFromNumber(json.channelRank)!,
    });
  }

  /**
   * Creates a server.
   *
   * @param params -
   * - serverName: The server name. The server name can contain at most 50 characters.
   * - serverIcon: The server icon URL.
   * - serverDescription: The server description. The server description can contain at most 500 characters.
   * - serverExtension: The custom server extension parameter in string format. The server extension information can contain at most 500 characters
   *
   * @returns The SDK returns the created server or throws an exception if the method call fails.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async createServer(params: {
    serverName: string;
    serverIcon?: string;
    serverDescription?: string;
    serverExtension?: string;
  }): Promise<ChatCircleServer> {
    chatlog.log(`${ChatCircleManager.TAG}: ${this.createServer.name}`);
    let r: any = await Native._callMethod(MTcreateCircleServer, {
      [MTcreateCircleServer]: {
        serverName: params.serverName,
        serverIcon: params.serverIcon,
        serverDescription: params.serverDescription,
        serverExtension: params.serverExtension,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
    return this.parseChatServer(r?.[MTcreateCircleServer]);
  }

  /**
   * Destroys a server.
   *
   * Only the server owner can call this method.
   *
   * @param serverId The ID of the server to destroy.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async destroyServer(serverId: string): Promise<void> {
    chatlog.log(`${ChatCircleManager.TAG}: ${this.destroyServer.name}`);
    let r: any = await Native._callMethod(MTdestroyCircleServer, {
      [MTdestroyCircleServer]: {
        serverId,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
  }

  /**
   * Modifies attributes of a server.
   *
   * Only the server owner and moderators can call this method.
   *
   * @param params -
   * - serverId: The server ID.
   * - serverName: The server name.
   * - serverIcon: The server icon URL.
   * - serverDescription: The server description.
   * - serverExtension: The custom server extension parameter in string format.
   *
   * @returns The SDK returns the updated server or throws an exception if the method call fails.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async updateServer(params: {
    serverId: string;
    serverName?: string;
    serverIcon?: string;
    serverDescription?: string;
    serverExtension?: string;
  }): Promise<ChatCircleServer> {
    chatlog.log(`${ChatCircleManager.TAG}: ${this.updateServer.name}`);
    let r: any = await Native._callMethod(MTupdateCircleServer, {
      [MTupdateCircleServer]: {
        serverId: params.serverId,
        serverName: params.serverName,
        serverIcon: params.serverIcon,
        serverDescription: params.serverDescription,
        serverExtension: params.serverExtension,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
    return this.parseChatServer(r?.[MTupdateCircleServer]);
  }

  /**
   * Joins a server.
   *
   * @param serverId The server ID.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async joinServer(serverId: string): Promise<void> {
    chatlog.log(`${ChatCircleManager.TAG}: ${this.joinServer.name}`);
    let r: any = await Native._callMethod(MTjoinCircleServer, {
      [MTjoinCircleServer]: {
        serverId,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
  }

  /**
   * Leaves a server.
   *
   * The server owner cannot leave the server, but can destroy the server.
   *
   * @param serverId The server ID.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async leaveServer(serverId: string): Promise<void> {
    chatlog.log(`${ChatCircleManager.TAG}: ${this.leaveServer.name}`);
    let r: any = await Native._callMethod(MTleaveCircleServer, {
      [MTleaveCircleServer]: {
        serverId,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
  }

  /**
   * Removes a member from the server.
   *
   * The server owner can remove all members from the server; a server moderator can only remove common members from the server.
   *
   * @param params -
   * - serverId: The server ID.
   * - userId: The user ID of the member to be removed from the server.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async removeUserFromServer(params: {
    serverId: string;
    userId: string;
  }): Promise<void> {
    chatlog.log(`${ChatCircleManager.TAG}: ${this.removeUserFromServer.name}`);
    let r: any = await Native._callMethod(MTremoveUserFromCircleServer, {
      [MTremoveUserFromCircleServer]: {
        serverId: params.serverId,
        userId: params.userId,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
  }

  /**
   * Invites a user to join the server.
   *
   * @param params -
   * - serverId: The server ID.
   * - userId: The user that is invited to join the server.
   * - welcome: The welcome message for inviting the user to join the server.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async inviteUserToServer(params: {
    serverId: string;
    userId: string;
    welcome?: string;
  }): Promise<void> {
    chatlog.log(`${ChatCircleManager.TAG}: ${this.inviteUserToServer.name}`);
    let r: any = await Native._callMethod(MTinviteUserToCircleServer, {
      [MTinviteUserToCircleServer]: {
        serverId: params.serverId,
        userId: params.userId,
        welcome: params.welcome,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
  }

  /**
   * Accepts the invitation to join the server.
   *
   * @param params -
   * - serverId: The server ID.
   * - inviter: The user ID of the inviter.
   *
   * @returns The SDK returns the server that the user joins or throws an exception if the method call fails.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async acceptServerInvitation(params: {
    serverId: string;
    inviter: string;
  }): Promise<ChatCircleServer> {
    chatlog.log(
      `${ChatCircleManager.TAG}: ${this.acceptServerInvitation.name}`
    );
    let r: any = await Native._callMethod(MTacceptCircleServerInvitation, {
      [MTacceptCircleServerInvitation]: {
        serverId: params.serverId,
        inviter: params.inviter,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
    return this.parseChatServer(r?.[MTacceptCircleServerInvitation]);
  }

  /**
   * Declines the invitation to join the server.
   *
   * @param params -
   * - serverId: The server ID.
   * - inviter: The user ID of the inviter.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async declineServerInvitation(params: {
    serverId: string;
    inviter: string;
  }): Promise<void> {
    chatlog.log(
      `${ChatCircleManager.TAG}: ${this.declineServerInvitation.name}`
    );
    let r: any = await Native._callMethod(MTdeclineCircleServerInvitation, {
      [MTdeclineCircleServerInvitation]: {
        serverId: params.serverId,
        inviter: params.inviter,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
  }

  /**
   * Adds a list of tags for the server.
   *
   * A server can have 10 tags at most.
   *
   * @param params -
   * - serverId: The server ID.
   * - serverTags: A list of server tags to add.
   *
   * @returns The SDK returns the added server tags or throws an exception if the method call fails.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async addTagsToServer(params: {
    serverId: string;
    serverTags: string[];
  }): Promise<ChatCircleTag[]> {
    chatlog.log(`${ChatCircleManager.TAG}: ${this.addTagsToServer.name}`);
    let r: any = await Native._callMethod(MTaddTagsToCircleServer, {
      [MTaddTagsToCircleServer]: {
        serverId: params.serverId,
        serverTags: params.serverTags,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
    const ret: ChatCircleTag[] = [];
    Object.entries(r?.[MTaddTagsToCircleServer]).forEach(
      (value: [string, any]) => {
        ret.push(new ChatCircleTag(value[1]));
      }
    );
    return ret;
  }

  /**
   * Removes a list of server tags.
   *
   * @param params -
   * - serverId: The server ID.
   * - serverTagIds: A list of server tag IDs to remove.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async removeTagsFromServer(params: {
    serverId: string;
    serverTagIds: string[];
  }): Promise<void> {
    chatlog.log(`${ChatCircleManager.TAG}: ${this.removeTagsFromServer.name}`);
    let r: any = await Native._callMethod(MTremoveTagsFromCircleServer, {
      [MTremoveTagsFromCircleServer]: {
        serverId: params.serverId,
        serverTags: params.serverTagIds,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
  }

  /**
   * Gets the list of server tags.
   *
   * @param serverId The server ID.
   *
   * @returns The SDK returns the list of server tags or throws an exception if the method call fails.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchServerTags(serverId: string): Promise<ChatCircleTag[]> {
    chatlog.log(`${ChatCircleManager.TAG}: ${this.fetchServerTags.name}`);
    let r: any = await Native._callMethod(MTfetchCircleServerTags, {
      [MTfetchCircleServerTags]: {
        serverId: serverId,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
    const ret: ChatCircleTag[] = [];
    Object.entries(r?.[MTfetchCircleServerTags]).forEach(
      (value: [string, any]) => {
        ret.push(new ChatCircleTag(value[1]));
      }
    );
    return ret;
  }

  /**
   * Sets a server member as a moderator.
   *
   * Only the server owner can call this method.
   *
   * @param params -
   * - serverId: The server ID.
   * - userId: The user ID of the member set as a server moderator.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async addModeratorToServer(params: {
    serverId: string;
    userId: string;
  }): Promise<void> {
    chatlog.log(`${ChatCircleManager.TAG}: ${this.addModeratorToServer.name}`);
    let r: any = await Native._callMethod(MTaddModeratorToCircleServer, {
      [MTaddModeratorToCircleServer]: {
        serverId: params.serverId,
        userId: params.userId,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
  }

  /**
   * Removes the administrative privileges of a server moderator.
   *
   * Only the server owner can call this method.
   *
   * @param params -
   * - serverId: The server ID.
   * - userId: The user ID of the server moderator whose administrative privileges are to be removed.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async removeModeratorFromServer(params: {
    serverId: string;
    userId: string;
  }): Promise<void> {
    chatlog.log(
      `${ChatCircleManager.TAG}: ${this.removeModeratorFromServer.name}`
    );
    let r: any = await Native._callMethod(MTremoveModeratorFromCircleServer, {
      [MTremoveModeratorFromCircleServer]: {
        serverId: params.serverId,
        userId: params.userId,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
  }

  /**
   * Gets the server role of the current user.
   *
   * @param serverId The server ID.
   *
   * @returns The SDK returns the server role of the current user or throws an exception if the method call fails.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchSelfServerRole(
    serverId: string
  ): Promise<ChatCircleUserRole | undefined> {
    chatlog.log(`${ChatCircleManager.TAG}: ${this.fetchSelfServerRole.name}`);
    let r: any = await Native._callMethod(MTfetchSelfCircleServerRole, {
      [MTfetchSelfCircleServerRole]: {
        serverId: serverId,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
    return ChatCircleUserRoleFromNumber(r?.[MTfetchSelfCircleServerRole]);
  }

  /**
   * Uses the pagination to get a list of servers that the current user joined.
   *
   * @param params -
   * - cursor: The position from which to start getting data.
   * After this parameter is set, the SDK gets data from the specified position in the chronological order of when the user joined servers.
   * At the first method call, if you set `cursor` as `null`, the SDK gets data starting from the first server that the user joined.
   * - pageSize: The number of servers that you expect to get on each page. The value range is [1,20].
   *
   * @returns The SDK returns a list of servers or throws an exception if the method call fails.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchJoinedServers(params: {
    cursor?: string;
    pageSize?: number;
  }): Promise<ChatCursorResult<ChatCircleServer>> {
    chatlog.log(`${ChatCircleManager.TAG}: ${this.fetchJoinedServers.name}`);
    let r: any = await Native._callMethod(MTfetchJoinedCircleServers, {
      [MTfetchJoinedCircleServers]: {
        cursor: params.cursor ?? '',
        pageSize: params.pageSize ?? 20,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
    let ret = new ChatCursorResult<ChatCircleServer>({
      cursor: r?.[MTfetchJoinedCircleServers].cursor,
      list: r?.[MTfetchJoinedCircleServers].list,
      opt: {
        map: (param: any) => {
          return this.parseChatServer(param);
        },
      },
    });
    return ret;
  }

  /**
   * Gets details of a server.
   *
   * @param serverId The server ID.
   *
   * @returns The SDK returns the server details or throws an exception if the method call fails.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchServerDetail(
    serverId: string
  ): Promise<ChatCircleServer | undefined> {
    chatlog.log(`${ChatCircleManager.TAG}: ${this.fetchServerDetail.name}`);
    let r: any = await Native._callMethod(MTfetchCircleServerDetail, {
      [MTfetchCircleServerDetail]: {
        serverId: serverId,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
    if (r?.[MTfetchCircleServerDetail]) {
      return this.parseChatServer(r?.[MTfetchCircleServerDetail]);
    }
    return undefined;
  }

  /**
   * Gets a list of servers by keyword.
   *
   * @param keyword The keyword for search.
   *
   * @returns The SDK returns a server list or throws an exception if the method call fails.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchServersWithKeyword(
    keyword: string
  ): Promise<ChatCircleServer[]> {
    chatlog.log(
      `${ChatCircleManager.TAG}: ${this.fetchServersWithKeyword.name}`
    );
    let r: any = await Native._callMethod(MTfetchCircleServersWithKeyword, {
      [MTfetchCircleServersWithKeyword]: {
        keyword: keyword,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
    const ret: ChatCircleServer[] = [];
    Object.entries(r?.[MTfetchCircleServersWithKeyword]).forEach(
      (value: [string, any]) => {
        ret.push(this.parseChatServer(value[1]));
      }
    );
    return ret;
  }

  /**
   * Gets the list of server members with pagination.
   *
   * @param params -
   * - serverId: The server ID.
   * - cursor: The position from which to start getting data.
   * After this parameter is set, the SDK gets data from the specified position in the chronological order of when members joined the server.
   * At the first method call, if you set `cursor` as `null`, the SDK gets data starting from the first member to join the server.
   * - pageSize: The number of members that you expect to get on each page. The value range is [1,20].
   *
   * @returns The SDK returns a list of server members or throws an exception if the method call fails.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchServerMembers(params: {
    serverId: string;
    pageSize: number;
    cursor: string;
  }): Promise<ChatCursorResult<ChatCircleUser>> {
    chatlog.log(`${ChatCircleManager.TAG}: ${this.fetchServerMembers.name}`);
    let r: any = await Native._callMethod(MTfetchCircleServerMembers, {
      [MTfetchCircleServerMembers]: {
        serverId: params.serverId,
        pageSize: params.pageSize,
        cursor: params.cursor,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
    let ret = new ChatCursorResult<ChatCircleUser>({
      cursor: r?.[MTfetchCircleServerMembers].cursor,
      list: r?.[MTfetchCircleServerMembers].list,
      opt: {
        map: (param: any) => {
          return new ChatCircleUser({
            userId: param.userId,
            userRole: ChatCircleUserRoleFromNumber(param.userRole)!,
          });
        },
      },
    });
    return ret;
  }

  /**
   * Checks whether the current user is in the server.
   *
   * @param serverId The server ID.
   *
   * @returns The SDK returns `true` if the current user is in the server; otherwise, `false` is returned.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async checkSelfInServer(serverId: string): Promise<boolean> {
    chatlog.log(`${ChatCircleManager.TAG}: ${this.checkSelfInServer.name}`);
    let r: any = await Native._callMethod(MTcheckSelfInCircleServer, {
      [MTcheckSelfInCircleServer]: {
        serverId: serverId,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
    return r?.[MTcheckSelfInCircleServer];
  }

  /**
   * Creates a channel.
   *
   * Only the server owner can call this method.
   *
   * @param params -
   * - serverId: The server ID to which the channel belongs.
   * - channelName: The channel name. The channel name can contain at most 50 characters.
   * - channelDescription: The channel description. The channel description can contain at most 500 characters.
   * - channelExtension: The custom channel extension parameter in string format. The channel extension information can contain at most 500 characters.
   * - channelRank: The member capacity rank. By default, the channel can have a maximum of 2000 members. See {@link ChatCircleChannelRank}.
   * - channelType: The channel type. By default, a public channel is created. See {@link ChatCircleChannelType}.
   *
   * @returns The SDK returns the created channel or throws an exception if the method call fails.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async createChannel(params: {
    serverId: string;
    channelName: string;
    channelDescription?: string;
    channelExtension?: string;
    channelRank?: ChatCircleChannelRank;
    channelType?: ChatCircleChannelType;
  }): Promise<ChatCircleChannel> {
    chatlog.log(`${ChatCircleManager.TAG}: ${this.createChannel.name}`);
    let r: any = await Native._callMethod(MTcreateCircleChannel, {
      [MTcreateCircleChannel]: {
        serverId: params.serverId,
        channelName: params.channelName,
        channelDescription: params.channelDescription,
        channelExtension: params.channelExtension,
        channelRank: (params.channelRank ??
          ChatCircleChannelRank.R2000) as number,
        channelType: (params.channelType ??
          ChatCircleChannelType.Public) as number,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
    return this.parseChatChannel(r?.[MTcreateCircleChannel]);
  }

  /**
   * Destroys a channel.
   *
   * Only the server owner can call this method.
   *
   * @param params -
   * - serverId: The server ID to which the channel belongs.
   * - channelId: The ID of the channel to destroy.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async destroyChannel(params: {
    serverId: string;
    channelId: string;
  }): Promise<void> {
    chatlog.log(`${ChatCircleManager.TAG}: ${this.destroyChannel.name}`);
    let r: any = await Native._callMethod(MTdestroyCircleChannel, {
      [MTdestroyCircleChannel]: {
        serverId: params.serverId,
        channelId: params.channelId,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
  }

  /**
   * Modifies attributes of a channel.
   *
   * Only the server owner and moderators can call this method.
   *
   * @param params -
   * - serverId: The server ID to which the channel belongs.
   * - channelId: The channel ID.
   * - channelName: The channel name.
   * - channelDescription: The channel description.
   * - channelExtension: The custom channel extension parameter in string format.
   * - channelRank: The maximum number of members allowed in a channel. see {@link ChatCircleChannelRank}.
   *
   * @returns The SDK returns the updated channel or throws an exception if the method call fails.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async updateChannel(params: {
    serverId: string;
    channelId: string;
    channelName?: string;
    channelDescription?: string;
    channelExtension?: string;
    channelRank?: ChatCircleChannelRank;
  }): Promise<ChatCircleChannel> {
    chatlog.log(`${ChatCircleManager.TAG}: ${this.updateChannel.name}`);
    let r: any = await Native._callMethod(MTupdateCircleChannel, {
      [MTupdateCircleChannel]: {
        serverId: params.serverId,
        channelId: params.channelId,
        channelName: params.channelName,
        channelDescription: params.channelDescription,
        channelExtension: params.channelExtension,
        channelRank: params.channelRank,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
    return this.parseChatChannel(r?.[MTupdateCircleChannel]);
  }

  /**
   * Joins a channel.
   *
   * @param params -
   * - serverId: The server ID to which the channel belongs.
   * - channelId: The channel ID.
   *
   * @returns The SDK returns the channel the user joins or throws an exception if the method call fails.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async joinChannel(params: {
    serverId: string;
    channelId: string;
  }): Promise<ChatCircleChannel> {
    chatlog.log(`${ChatCircleManager.TAG}: ${this.joinChannel.name}`);
    let r: any = await Native._callMethod(MTjoinCircleChannel, {
      [MTjoinCircleChannel]: {
        serverId: params.serverId,
        channelId: params.channelId,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
    return this.parseChatChannel(r?.[MTjoinCircleChannel]);
  }

  /**
   * Leaves a channel.
   *
   * @param params -
   * - serverId: The server ID to which the channel belongs.
   * - channelId: The ID of the channel that the user leaves.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async leaveChannel(params: {
    serverId: string;
    channelId: string;
  }): Promise<void> {
    chatlog.log(`${ChatCircleManager.TAG}: ${this.leaveChannel.name}`);
    let r: any = await Native._callMethod(MTleaveCircleChannel, {
      [MTleaveCircleChannel]: {
        serverId: params.serverId,
        channelId: params.channelId,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
  }

  /**
   * Removes a member from the channel.
   *
   * The server owner can remove all members from a channel. A server moderator can only remove common members from a channel.
   *
   * @param params -
   * - serverId: The server ID to which the channel belongs.
   * - channelId: The channel ID.
   * - userId: The user ID of the member to be removed from the channel.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async removeUserFromChannel(params: {
    serverId: string;
    channelId: string;
    userId: string;
  }): Promise<void> {
    chatlog.log(`${ChatCircleManager.TAG}: ${this.removeUserFromChannel.name}`);
    let r: any = await Native._callMethod(MTremoveUserFromCircleChannel, {
      [MTremoveUserFromCircleChannel]: {
        serverId: params.serverId,
        channelId: params.channelId,
        userId: params.userId,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
  }

  /**
   * Invites a user to join the channel.
   *
   * @param params -
   * - serverId: The server ID to which the channel belongs.
   * - channelId: The channel ID.
   * - userId: The user ID of the invitee.
   * - welcome: The welcome message for inviting a user to join the channel.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async inviteUserToChannel(params: {
    serverId: string;
    channelId: string;
    userId: string;
    welcome?: string;
  }): Promise<void> {
    chatlog.log(`${ChatCircleManager.TAG}: ${this.inviteUserToChannel.name}`);
    let r: any = await Native._callMethod(MTinviteUserToCircleChannel, {
      [MTinviteUserToCircleChannel]: {
        serverId: params.serverId,
        channelId: params.channelId,
        userId: params.userId,
        welcome: params.welcome ?? '',
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
  }

  /**
   * Accepts an invitation to join a channel.
   *
   * @param params -
   * - serverId: The server ID to which the channel belongs.
   * - channelId: The channel ID.
   * - inviter: The user ID of the inviter.
   *
   * @returns The SDK returns the channel that the user joins or throws an exception if the method call fails.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async acceptChannelInvitation(params: {
    serverId: string;
    channelId: string;
    inviter: string;
  }): Promise<ChatCircleChannel> {
    chatlog.log(
      `${ChatCircleManager.TAG}: ${this.acceptChannelInvitation.name}`
    );
    let r: any = await Native._callMethod(MTacceptCircleChannelInvitation, {
      [MTacceptCircleChannelInvitation]: {
        serverId: params.serverId,
        channelId: params.channelId,
        inviter: params.inviter,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
    return this.parseChatChannel(r?.[MTacceptCircleChannelInvitation]);
  }

  /**
   * Declines an invitation to join a channel.
   *
   * @param params -
   * - serverId: The server ID to which the channel belongs.
   * - channelId: The channel ID.
   * - inviter: The user ID of the inviter.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async declineChannelInvitation(params: {
    serverId: string;
    channelId: string;
    inviter: string;
  }): Promise<void> {
    chatlog.log(
      `${ChatCircleManager.TAG}: ${this.declineChannelInvitation.name}`
    );
    let r: any = await Native._callMethod(MTdeclineCircleChannelInvitation, {
      [MTdeclineCircleChannelInvitation]: {
        serverId: params.serverId,
        channelId: params.channelId,
        inviter: params.inviter,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
  }

  /**
   * Mutes a member in the channel.
   *
   * Only the server owner and moderators can call this method.
   *
   * @param params -
   * - serverId: The server ID to which the channel belongs.
   * - channelId: The channel ID.
   * - userId: The user ID of the member to mute.
   * - duration: The mute duration in milliseconds.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async muteUserInChannel(params: {
    serverId: string;
    channelId: string;
    userId: string;
    duration: number;
  }): Promise<void> {
    chatlog.log(`${ChatCircleManager.TAG}: ${this.muteUserInChannel.name}`);
    let r: any = await Native._callMethod(MTmuteUserInCircleChannel, {
      [MTmuteUserInCircleChannel]: {
        serverId: params.serverId,
        channelId: params.channelId,
        duration: params.duration,
        userId: params.userId,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
  }

  /**
   * Unmutes a member in the channel.
   *
   * Only the server owner and moderators can call this method.
   *
   * @param params -
   * - serverId: The server ID to which the channel belongs.
   * - channelId: The channel ID.
   * - userId: The user ID of the member to unmute.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async unmuteUserInChannel(params: {
    serverId: string;
    channelId: string;
    userId: string;
  }): Promise<void> {
    chatlog.log(`${ChatCircleManager.TAG}: ${this.unmuteUserInChannel.name}`);
    let r: any = await Native._callMethod(MTunmuteUserInCircleChannel, {
      [MTunmuteUserInCircleChannel]: {
        serverId: params.serverId,
        channelId: params.channelId,
        userId: params.userId,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
  }

  /**
   * Gets the details of a channel.
   *
   * @param params -
   * - serverId: The server ID to which the channel belongs.
   * - channelId: The channel ID.
   *
   * @returns The SDK returns channel details or throws an exception if the method call fails.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchChannelDetail(params: {
    serverId: string;
    channelId: string;
  }): Promise<ChatCircleChannel | undefined> {
    chatlog.log(`${ChatCircleManager.TAG}: ${this.fetchChannelDetail.name}`);
    let r: any = await Native._callMethod(MTfetchCircleChannelDetail, {
      [MTfetchCircleChannelDetail]: {
        serverId: params.serverId,
        channelId: params.channelId,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
    if (r?.[MTfetchCircleChannelDetail]) {
      return this.parseChatChannel(r?.[MTfetchCircleChannelDetail]);
    }
    return undefined;
  }

  /**
   * Uses the pagination to get a list of public channels in a server.
   *
   * @param params -
   * - serverId: The server ID to which the channels belong.
   * - cursor: The position from which to start getting data.
   * After this parameter is set, the SDK gets data from the specified position in the chronological order of when channels were created.
   * At the first method call, if you set `cursor` as `null`, the SDK gets data starting from the first created channel.
   * - pageSize: The number of public servers that you expect to get on each page. The value range is [1,20].
   *
   * @returns The SDK returns a list of public channels or throws an exception if the method call fails.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchPublicChannelInServer(params: {
    serverId: string;
    pageSize: number;
    cursor: string;
  }): Promise<ChatCursorResult<ChatCircleChannel>> {
    chatlog.log(
      `${ChatCircleManager.TAG}: ${this.fetchPublicChannelInServer.name}`
    );
    let r: any = await Native._callMethod(MTfetchPublicCircleChannelInServer, {
      [MTfetchPublicCircleChannelInServer]: {
        serverId: params.serverId,
        pageSize: params.pageSize,
        cursor: params.cursor,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
    let ret = new ChatCursorResult<ChatCircleChannel>({
      cursor: r?.[MTfetchPublicCircleChannelInServer].cursor,
      list: r?.[MTfetchPublicCircleChannelInServer].list,
      opt: {
        map: (param: any) => {
          return this.parseChatChannel(param);
        },
      },
    });
    return ret;
  }

  /**
   * Gets members in a channel.
   *
   * @param params -
   * - serverId: The server ID to which the channel belongs.
   * - channelId: The channel ID.
   * - cursor: The position from which to start getting data.
   * After this parameter is set, the SDK gets data from the specified position in the chronological order of when members joined the channel.
   * At the first method call, if you set `cursor` as `null`, the SDK gets data starting from the first member to join the channel.
   * - pageSize: The number of channel members that you expect to get on each page. The value range is [1,20].
   *
   * @returns The SDK returns a list of channel members or throws an exception if the method call fails.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchChannelMembers(params: {
    serverId: string;
    channelId: string;
    pageSize: number;
    cursor: string;
  }): Promise<ChatCursorResult<ChatCircleUser>> {
    chatlog.log(`${ChatCircleManager.TAG}: ${this.fetchChannelMembers.name}`);
    let r: any = await Native._callMethod(MTfetchCircleChannelMembers, {
      [MTfetchCircleChannelMembers]: {
        serverId: params.serverId,
        channelId: params.channelId,
        pageSize: params.pageSize,
        cursor: params.cursor,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
    let ret = new ChatCursorResult<ChatCircleUser>({
      cursor: r?.[MTfetchCircleChannelMembers].cursor,
      list: r?.[MTfetchCircleChannelMembers].list,
      opt: {
        map: (param: any) => {
          return new ChatCircleUser({
            userId: param.userId,
            userRole: ChatCircleUserRoleFromNumber(param.userRole)!,
          });
        },
      },
    });
    return ret;
  }

  /**
   * Gets accessible private channels in a server.
   *
   * @param params -
   * - serverId: The server ID to which the channels belong.
   * - cursor: The position from which to start getting data.
   * After this parameter is set, the SDK gets data from the specified position in the chronological order of when the channels were created.
   * At the first method call, if you set `cursor` as `null`, the SDK gets data starting from the first created channel.
   * - pageSize: The number of channels that you expect to get on each page. The value range is [1,20].
   *
   * @returns The SDK returns a list of private channels or throws an exception if the method call fails.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchVisiblePrivateChannelInServer(params: {
    serverId: string;
    pageSize: number;
    cursor: string;
  }): Promise<ChatCursorResult<ChatCircleChannel>> {
    chatlog.log(
      `${ChatCircleManager.TAG}: ${this.fetchVisiblePrivateChannelInServer.name}`
    );
    let r: any = await Native._callMethod(
      MTfetchVisiblePrivateCircleChannelInServer,
      {
        [MTfetchVisiblePrivateCircleChannelInServer]: {
          serverId: params.serverId,
          pageSize: params.pageSize,
          cursor: params.cursor,
        },
      }
    );
    ChatCircleManager.checkErrorFromResult(r);
    let ret = new ChatCursorResult<ChatCircleChannel>({
      cursor: r?.[MTfetchVisiblePrivateCircleChannelInServer].cursor,
      list: r?.[MTfetchVisiblePrivateCircleChannelInServer].list,
      opt: {
        map: (param: any) => {
          return this.parseChatChannel(param);
        },
      },
    });
    return ret;
  }

  /**
   * Checks whether the current user is in the channel.
   *
   * @param params -
   * - serverId: The server ID to which the channel belongs.
   * - channelId: The channel ID.
   *
   * @returns The SDK returns `true` if the current user is in the channel; otherwise, `false` is returned.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async checkSelfIsInChannel(params: {
    serverId: string;
    channelId: string;
  }): Promise<boolean> {
    chatlog.log(`${ChatCircleManager.TAG}: ${this.checkSelfIsInChannel.name}`);
    let r: any = await Native._callMethod(MTcheckSelfIsInCircleChannel, {
      [MTcheckSelfIsInCircleChannel]: {
        serverId: params.serverId,
        channelId: params.channelId,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
    return r?.[MTcheckSelfIsInCircleChannel];
  }

  /**
   * Gets the muted members in a channel.
   *
   * Only the server owner and moderator can call this method.
   *
   * @param params -
   * - serverId: The server ID to which the channel belongs.
   * - channelId: The channel ID.
   *
   * @returns The SDK returns muted members in map format or throws an exception if the method call fails.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchChannelMuteUsers(params: {
    serverId: string;
    channelId: string;
  }): Promise<Map<string, number>> {
    chatlog.log(`${ChatCircleManager.TAG}: ${this.fetchChannelMuteUsers.name}`);
    let r: any = await Native._callMethod(MTfetchCircleChannelMuteUsers, {
      [MTfetchCircleChannelMuteUsers]: {
        serverId: params.serverId,
        channelId: params.channelId,
      },
    });
    ChatCircleManager.checkErrorFromResult(r);
    console.log('test:', r);
    const ret = new Map<string, number>();
    Object.entries(r?.[MTfetchCircleChannelMuteUsers]).forEach(
      (value: [string, any]) => {
        ret.set(value[0], value[1]);
      }
    );
    return ret;
  }
}
