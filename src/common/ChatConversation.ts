export enum ChatConversationType {
  PeerChat = 0,
  GroupChat = 1,
  RoomChat = 2,
}

export function ChatConversationTypeFromNumber(
  params: number
): ChatConversationType {
  switch (params) {
    case 0:
      return ChatConversationType.PeerChat;
    case 1:
      return ChatConversationType.GroupChat;
    case 2:
      return ChatConversationType.RoomChat;
    default:
      throw new Error(`not exist this type: ${params}`);
  }
}
export function ChatConversationTypeToString(
  params: ChatConversationType
): string {
  return ChatConversationType[params];
}

export class ChatConversation {
  con_id: string;
  type: ChatConversationType;
  unreadCount: number;
  con_name?: string; // todo: con_name
  lastMessage?: any; // todo:
  lastReceivedMessage?: any; //todo:

  constructor(params: {
    con_id: string;
    type: ChatConversationType;
    unreadCount: number;
    lastMessage: any;
    lastReceivedMessage: any;
    ext?: {
      con_name: string;
    };
  }) {
    this.con_id = params.con_id;
    this.type = params.type;
    this.unreadCount = params.unreadCount;
    // this.lastMessage ;
    // this.lastReceivedMessage;
    if (params.ext) {
      this.con_name = params.ext.con_name;
    }
  }
}
