import type { ChatConversationType } from './ChatConversation';

/**
 * Offline push DND parameter type Enumeration class.
 */
export enum ChatSilentModeParamType {
  /**
   * Offline push notification type.
   */
  REMIND_TYPE,
  /**
   * Offline push DND duration.
   */
  SILENT_MODE_DURATION,
  /**
   * Offline push DND period.
   */
  SILENT_MODE_INTERVAL,
}

export enum ChatPushRemindType {
  /**
   * Collect all offline push.
   */
  ALL,
  /**
   * Only receive @me offline push.
   */
  MENTION_ONLY,
  /**
   * Offline push is not collected.
   */
  NONE,
}

/**
 * For offline push DND time class.
 */
export class ChatSilentModeTime {
  /**
   * Number of hours.
   */
  hour: number;
  /**
   * Number of minutes.
   */
  minute: number;

  constructor(params?: { hour?: number; minute?: number }) {
    this.hour = params?.hour ?? 0;
    this.minute = params?.minute ?? 0;
  }
}

/**
 * Offline push Settings parameter entity class
 */
export class ChatSilentModeParam {
  /**
   * The silent mode type.
   */
  paramType: ChatSilentModeParamType;
  /**
   * The offline push notification type.
   */
  remindType?: ChatPushRemindType;
  /**
   * The start time of offline push DND.
   */
  startTime?: ChatSilentModeTime;
  /**
   * The end time of offline push DND.
   */
  endTime?: ChatSilentModeTime;
  /**
   * The offline push DND duration.
   */
  silentDuration?: number;

  /**
   * constructor an object.
   */
  protected constructor(params: {
    paramType: ChatSilentModeParamType;
    remindType?: ChatPushRemindType;
    startTime?: ChatSilentModeTime;
    endTime?: ChatSilentModeTime;
    silentDuration?: number;
  }) {
    this.paramType = params.paramType;
    this.remindType = params.remindType;
    this.startTime = params.startTime;
    this.endTime = params.endTime;
    this.silentDuration = params.silentDuration;
  }

  /**
   * Set the offline push notification type, and return an object.
   *
   * @param remindType Offline push notification type.
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
   * Set the offline push DND duration, and return an object.
   *
   * @param silentDuration Offline push DND duration, units of minutes.
   * @returns The ChatSilentModeParam Object.
   */
  public static constructorWithDuration(
    silentDuration: number
  ): ChatSilentModeParam {
    return new ChatSilentModeParam({
      paramType: ChatSilentModeParamType.SILENT_MODE_DURATION,
      silentDuration: silentDuration,
    });
  }

  /**
   * Set the start time of offline push DND, you need to create the start time and end time together.
   *
   * @param params
   * - startTime: Do not disturb start time.
   * - endTime: Do not disturb end time.
   * @returns The ChatSilentModeParam Object.
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
 * Offline push DND result class.
 */
export class ChatSilentModeResult {
  /**
   * The offline push DND expiration timestamp.
   */
  expireTimestamp?: number;
  /**
   * The Conversation Type.
   */
  conversationType: ChatConversationType;
  /**
   * The Conversation ID.
   */
  conversationId: string;
  /**
   * The offline push notification type.
   */
  remindType?: ChatPushRemindType;
  /**
   * The start time of offline push DND.
   */
  startTime?: ChatSilentModeTime;
  /**
   * The end time of offline push DND.
   */
  endTime?: ChatSilentModeTime;

  /**
   * Constructor an object.
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
 * Converts the silent mode type from int to enum.
 *
 * @param params The silent mode type of number type.
 * @returns The silent mode type of enum type.
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
 * Converts the silent mode type from enum to int.
 *
 * @param params The silent mode type of enum type.
 * @returns The silent mode type of int type.
 */
export function ChatSilentModeParamTypeToNumber(
  params: ChatSilentModeParamType
): number {
  return params;
}

/**
 * Converts the push remind type from int to enum.
 *
 * @param params The push remind type of int type.
 * @returns The push remind type of enum type.
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
 * Converts the push remind type from enum to int.
 *
 * @param params The push remind type of enum type.
 * @returns The push remind type of int type.
 */
export function ChatPushRemindTypeToNumber(params: ChatPushRemindType): number {
  return params;
}
