export enum ChatCircleUserRole {
  Owner = 0,
  Moderator,
  User,
}

export class ChatCircleUser {
  userId: string;
  userRole: ChatCircleUserRole;
  constructor(params: { userId: string; userRole: ChatCircleUserRole }) {
    this.userId = params.userId;
    this.userRole = params.userRole;
  }
}

export function ChatCircleUserRoleFromNumber(
  value: number
): ChatCircleUserRole | undefined {
  if (value !== null || value !== undefined) {
    let ret = ChatCircleUserRole.Owner;
    switch (value) {
      case 0:
        ret = ChatCircleUserRole.Owner;
        break;
      case 1:
        ret = ChatCircleUserRole.Moderator;
        break;
      case 2:
        ret = ChatCircleUserRole.User;
        break;
      default:
        ret = ChatCircleUserRole.Owner;
        break;
    }
    return ret;
  }
  return undefined;
}
