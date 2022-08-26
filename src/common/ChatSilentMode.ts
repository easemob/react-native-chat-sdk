import type { ChatConversationType } from './ChatConversation';

/**
 * The parameter types of the offline push.
 */
export enum ChatSilentModeParamType {
  /**
   * The push notification mode.
   */
  REMIND_TYPE,
  /**
   * The duration of the do-not-disturb mode, in minutes.
   */
  SILENT_MODE_DURATION,
  /**
   * The time frame of the do-not-disturb mode.
   * This parameter type is valid only at the app level, but not for conversations.
   */
  SILENT_MODE_INTERVAL,
}
/**
 * The push notification modes.
 */
export enum ChatPushRemindType {
  /**
   * Receives push notifications for all offline messages.
   */
  ALL,
  /**
   * Only receives push notifications for mentioned messages.
   */
  MENTION_ONLY,
  /**
   * Receives no push notification for offline messages.
   */
  NONE,
}

/**
 * The time class that is used to set the start point and end point in the do-not-disturb time frame for the offline message push.
 */
export class ChatSilentModeTime {
  /**
   * The start or end hour of the do-not-disturb time frame.
   *
   * The time is based on a 24-hour clock. The value range is [0,23].
   */
  hour: number;
  /**
   * The start or end minute of the do-not-disturb time frame.
   *
   * The value range is [0,59].
   */
  minute: number;

  constructor(params?: { hour?: number; minute?: number }) {
    this.hour = params?.hour ?? 0;
    this.minute = params?.minute ?? 0;
  }
}

/**
 * The parameter entity class for the offline message push.
 */
export class ChatSilentModeParam {
  /**
   * The parameter type of the do-not-disturb mode.
   */
  paramType: ChatSilentModeParamType;
  /**
   * The push notification mode.
   */
  remindType?: ChatPushRemindType;
  /**
   * The start time of do-not-disturb mode.
   */
  startTime?: ChatSilentModeTime;
  /**
   * The end time of do-not-disturb mode.
   */
  endTime?: ChatSilentModeTime;
  /**
   * The duration of the do-not-disturb mode, in minutes.
   */
  duration?: number;

  /**
   * Constructs an object.
   */
  public constructor(params: {
    paramType: ChatSilentModeParamType;
    remindType?: ChatPushRemindType;
    startTime?: ChatSilentModeTime;
    endTime?: ChatSilentModeTime;
    duration?: number;
  }) {
    this.paramType = params.paramType;
    this.remindType = params.remindType;
    this.startTime = params.startTime;
    this.endTime = params.endTime;
    this.duration = params.duration;
  }

  /**
   * Sets the push notification mode.
   *
   * @param remindType The push notification mode.
   * @returns The ChatSilentModeParam Object.
   */
  public static constructorWithNotification(
    remindType: ChatPushRemindType
  ): ChatSilentModeParam {
    return new ChatSilentModeParam({
      paramType: ChatSilentModeParamType.REMIND_TYPE,
      remindType: remindType,
    });
  }

  /**
   * Set the duration of the do-not-disturb mode for the offline message push.
   *
   * @param silentDuration The duration of the do-not-disturb mode, in minutes.
   * @returns The ChatSilentModeParam object.
   */
  public static constructorWithDuration(
    silentDuration: number
  ): ChatSilentModeParam {
    return new ChatSilentModeParam({
      paramType: ChatSilentModeParamType.SILENT_MODE_DURATION,
      duration: silentDuration,
    });
  }

  /**
   * Sets the time frame of the do-not-disturb mode.
   *
   * The time frame of the do-not-disturb mode is valid only at the app level, but not for conversations.
   *
   * @param params
   * - startTime: The start point in the do-not-disturb time frame.
   * - endTime: The end point in the do-not-disturb time frame.
   * @returns The ChatSilentModeParam object.
   */
  public static constructorWithPeriod(params: {
    startTime: ChatSilentModeTime;
    endTime: ChatSilentModeTime;
  }): ChatSilentModeParam {
    return new ChatSilentModeParam({
      paramType: ChatSilentModeParamType.SILENT_MODE_INTERVAL,
      startTime: params.startTime,
      endTime: params.endTime,
    });
  }
}

/**
 * The configuration result class for the do-not-disturb mode of the offline message push.
 */
export class ChatSilentModeResult {
  /**
   * The Unix timestamp when the do-not-disturb mode of the offline message push expires, in milliseconds.
   */
  expireTimestamp?: number;
  /**
   * The conversation Type.
   */
  conversationType: ChatConversationType;
  /**
   * The conversation ID.
   */
  conversationId: string;
  /**
   * The push notification mode.
   */
  remindType?: ChatPushRemindType;
  /**
   * The start point in the do-not-disturb time frame for the offline message push.
   */
  startTime?: ChatSilentModeTime;
  /**
   * The end point in the do-not-disturb time frame for the offline message push.
   */
  endTime?: ChatSilentModeTime;

  /**
   * Constructs an object.
   */
  constructor(params: {
    expireTimestamp?: number;
    conversationType: ChatConversationType;
    conversationId: string;
    remindType?: ChatPushRemindType;
    startTime?: ChatSilentModeTime;
    endTime?: ChatSilentModeTime;
  }) {
    this.expireTimestamp = params.expireTimestamp;
    this.conversationId = params.conversationId;
    this.conversationType = params.conversationType;
    this.remindType = params.remindType;
    this.startTime = params.startTime;
    this.endTime = params.endTime;
  }
}

/**
 * Converts the parameter type of the do-not-disturb mode from int to enum.
 *
 * @param params The do-not-disturb parameter type of the int type.
 * @returns The do-not-disturb parameter of the enum type.
 */
export function ChatSilentModeParamTypeFromNumber(
  params: number
): ChatSilentModeParamType {
  switch (params) {
    case 0:
      return ChatSilentModeParamType.REMIND_TYPE;
    case 1:
      return ChatSilentModeParamType.SILENT_MODE_DURATION;
    case 2:
      return ChatSilentModeParamType.SILENT_MODE_INTERVAL;
    default:
      return ChatSilentModeParamType.REMIND_TYPE;
  }
}

/**
 * Converts the parameter type of the do-not-disturb mode from enum to int.
 *
 * @param params The do-not-disturb parameter type of the enum type.
 * @returns The do-not-disturb parameter type of the int type.
 */
export function ChatSilentModeParamTypeToNumber(
  params: ChatSilentModeParamType
): number {
  return params;
}

/**
 * Converts the push notification mode from int to enum.
 *
 * @param params The push notification mode of the int type.
 * @returns The push notification mode of the enum type.
 */
export function ChatPushRemindTypeFromNumber(
  params: number
): ChatPushRemindType {
  switch (params) {
    case 0:
      return ChatPushRemindType.ALL;
    case 1:
      return ChatPushRemindType.MENTION_ONLY;
    case 2:
      return ChatPushRemindType.NONE;
    default:
      return ChatPushRemindType.NONE;
  }
}

/**
 * Converts the push notification mode from enum to int.
 *
 * @param params The push notification mode of the enum type.
 * @returns The push notification mode of the int type.
 */
export function ChatPushRemindTypeToNumber(params: ChatPushRemindType): number {
  return params;
}
