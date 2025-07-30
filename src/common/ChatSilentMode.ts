import type { ChatConversationType } from './ChatConversation';

/**
 * 离线推送参数类型枚举类。
 */
export enum ChatSilentModeParamType {
  /**
   * 离线消息推送方式。
   */
  REMIND_TYPE,
  /**
   * 免打扰时长，单位为分钟。
   */
  SILENT_MODE_DURATION,
  /**
   * 免打扰时间段。仅 app 全局设置有效，对单个会话无效。
   */
  SILENT_MODE_INTERVAL,
}
/**
 * 离线消息推送方式。
 */
export enum ChatPushRemindType {
  /**
   * 接收全部离线消息的推送通知。
   */
  ALL,
  /**
   * 只接收提及当前用户的离线消息的推送通知。
   */
  MENTION_ONLY,
  /**
   * 不接收离线消息的推送通知。
   */
  NONE,
}

/**
 * 离线推送免打扰时间段参数类。
 */
export class ChatSilentModeTime {
  /**
   * 免打扰时间段的起始时间或结束的时间，单位为小时。
   *
   * 24 小时制，取值范围为 [0,23]。
   */
  hour: number;
  /**
   * 免打扰时间段的开始或结束时间，单位为分钟。
   *
   * 取值范围为 [0,59]。
   */
  minute: number;

  constructor(params?: { hour?: number; minute?: number }) {
    this.hour = params?.hour ?? 0;
    this.minute = params?.minute ?? 0;
  }
}

/**
 * 离线推送参数实体类。
 */
export class ChatSilentModeParam {
  /**
   * 免打扰模式参数类型。
   */
  paramType: ChatSilentModeParamType;
  /**
   * 离线推送通知方式。
   */
  remindType?: ChatPushRemindType;
  /**
   * 离线推送免打扰时间段的开始时间。
   * - 请注意以下两点：
   * - - 开始时间和结束时间必须同时设置。
   * - - 若开始时间和结束时间中的 hours 和 minutes 都为 0，表示免打扰模式关闭。
   */
  startTime?: ChatSilentModeTime;
  /**
   * 离线推送免打扰时间段的结束时间。
   * - 请注意以下两点：
   * - - 开始时间和结束时间必须同时设置。
   * - - 若开始时间和结束时间中的 hours 和 minutes 都为 0，表示免打扰模式关闭。
   */
  endTime?: ChatSilentModeTime;
  /**
   * 免打扰时长，单位为分钟。
   */
  duration?: number;

  /**
   * 构建离线推送设置的实例。
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
   * 设置离线推送通知方式。
   *
   * @param remindType 离线推送通知方式。
   * @returns 离线推送实例。
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
   * 设置免打扰时长。
   *
   * @param silentDuration 免打扰时长，单位为分钟。
   * @returns 离线推送设置的实例。
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
   * 设置免打扰时间段。
   *
   * 仅 app 全局设置有效，对单个会话无效。
   *
   * @param params
   * - startTime: 免打扰时间段的开始时间。
   * - endTime: 免打扰时间段的结束时间。
   * @returns 离线推送设置的实例。
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
 * 离线推送免打扰配置结果类。
 */
export class ChatSilentModeResult {
  /**
   * 离线推送免打扰过期 Unix 时间戳，单位为毫秒。
   */
  expireTimestamp?: number;
  /**
   * 会话类型。
   */
  conversationType: ChatConversationType;
  /**
   * 会话 ID。
   */
  conversationId: string;
  /**
   * 离线推送通知方式。
   */
  remindType?: ChatPushRemindType;
  /**
   * 离线推送免打扰时间段的开始时间。
   */
  startTime?: ChatSilentModeTime;
  /**
   * 离线推送免打扰时间段的结束时间。
   */
  endTime?: ChatSilentModeTime;

  /**
   * 离线推送免打扰模式的构造方法。
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
 * 将免打扰参数类型由整型转换为枚举类型。
 *
 * @param params 整型的免打扰参数类型。
 * @returns 枚举类型的免打扰参数类型。
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
 * 将免打扰参数类型由枚举类型转换为整型。
 *
 * @param params 枚举类型的免打扰参数类型。
 * @returns 整型的免打扰参数类型。
 */
export function ChatSilentModeParamTypeToNumber(
  params: ChatSilentModeParamType
): number {
  return params;
}

/**
 * 将离线推送通知方式由整型转换为枚举类型。
 *
 * @param params 枚举类型的离线推送通知方式。
 * @returns 枚举类型代表的推送提醒模式。
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
 * 将离线推送通知方式由枚举类型转换为整型。
 *
 * @param params 枚举类型的离线推送通知方式。
 * @returns 整型的离线推送通知方式。
 */
export function ChatPushRemindTypeToNumber(params: ChatPushRemindType): number {
  return params;
}
