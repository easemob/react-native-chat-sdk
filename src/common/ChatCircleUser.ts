/**
 * The Circle user roles.
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
 * The Circle user data.
 */
export class ChatCircleUser {
  /**
   * The user ID.
   */
  userId: string;
  /**
   * The user role. See {@link ChatCircleUserRole}.
   */
  userRole: ChatCircleUserRole;
  /**
   * Constructs a Circle user object.
   */
  constructor(params: { userId: string; userRole: ChatCircleUserRole }) {
    this.userId = params.userId;
    this.userRole = params.userRole;
  }
}

/**
 * Converts a user role from Int to the enum type.
 *
 *
 * @param value The user role of the Int type.
 *
 * @returns The user role of the enum type.
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
