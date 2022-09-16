/**
 * The circle user role type.
 */
export enum ChatCircleUserRole {
  /**
   * Circle owner.
   */
  Owner = 0,
  /**
   * Circle moderator.
   */
  Moderator,
  /**
   * Circle user.
   */
  User,
}

/**
 * The circle user data.
 */
export class ChatCircleUser {
  /**
   * The user ID.
   */
  userId: string;
  /**
   * The user role type. See {@link ChatCircleUserRole}
   */
  userRole: ChatCircleUserRole;
  /**
   * Construct a circle user object.
   */
  constructor(params: { userId: string; userRole: ChatCircleUserRole }) {
    this.userId = params.userId;
    this.userRole = params.userRole;
  }
}

/**
 * The converter from number to user role.
 *
 * @param value Number type.
 *
 * @returns Role type.
 */
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
