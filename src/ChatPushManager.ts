import type { NativeEventEmitter } from 'react-native';

import {
  MTfetchConversationSilentMode,
  MTfetchPreferredNotificationLanguage,
  MTfetchSilentModeForAll,
  MTfetchSilentModeForConversations,
  MTgetImPushConfigFromServer,
  MTgetPushTemplate,
  MTremoveConversationSilentMode,
  MTsetConversationSilentMode,
  MTsetPreferredNotificationLanguage,
  MTsetPushTemplate,
  MTsetSilentModeForAll,
  MTupdateImPushStyle,
  MTupdatePushNickname,
} from './__internal__/Consts';
import { Native } from './__internal__/Native';
import { chatlog } from './common/ChatConst';
import type {
  ChatConversation,
  ChatConversationType,
} from './common/ChatConversation';
import { ChatPushDisplayStyle, ChatPushOption } from './common/ChatPushConfig';
import {
  ChatSilentModeParam,
  ChatSilentModeResult,
} from './common/ChatSilentMode';

/**
 * 消息推送设置管理类。
 */
export class ChatPushManager extends Native {
  private static TAG = 'ChatPushManager';
  constructor() {
    super();
  }

  public setNativeListener(_event: NativeEventEmitter): void {
    chatlog.log(`${ChatPushManager.TAG}: setNativeListener: `);
  }

  /**
   * 设置指定会话的消息推送模式。
   *
   * @param params -
   * - convId: 会话 ID。
   * - convType: 会话类型。
   * - option: 离线推送配置选项。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async setSilentModeForConversation(params: {
    convId: string;
    convType: ChatConversationType;
    option: ChatSilentModeParam;
  }): Promise<void> {
    chatlog.log(
      `${ChatPushManager.TAG}: setSilentModeForConversation: `,
      params.convId,
      params.convType,
      params.option
    );
    let r: any = await Native._callMethod(MTsetConversationSilentMode, {
      [MTsetConversationSilentMode]: {
        conversationId: params.convId as string,
        conversationType: params.convType as number,
        param: params.option,
      },
    });
    ChatPushManager.checkErrorFromResult(r);
  }

  /**
   * 清除指定会话的消息推送设置。
   *
   * 清除消息推送设置后，该会话采用 app 的消息推送模式，详见 {@link EMPushManager.setSilentModeForAll(ChatSilentModeParam)}。
   *
   * @params 参数组。
   * - convId: 会话 ID。
   * - convType: 会话类型。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async removeSilentModeForConversation(params: {
    convId: string;
    convType: ChatConversationType;
  }): Promise<void> {
    chatlog.log(
      `${ChatPushManager.TAG}: removeSilentModeForConversation: `,
      params.convId,
      params.convType
    );
    let r: any = await Native._callMethod(MTremoveConversationSilentMode, {
      [MTremoveConversationSilentMode]: {
        conversationId: params.convId,
        conversationType: params.convType as number,
      },
    });
    ChatPushManager.checkErrorFromResult(r);
  }

  /**
   * 获取指定会话的离线推送设置。
   *
   * @params 参数组。
   * - convId: 会话 ID。
   * - convType: 会话类型。
   *
   * @returns 会话的离线推送设置。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async fetchSilentModeForConversation(params: {
    convId: string;
    convType: ChatConversationType;
  }): Promise<ChatSilentModeResult> {
    chatlog.log(
      `${ChatPushManager.TAG}: fetchSilentModeForConversation: `,
      params.convId,
      params.convType
    );
    let r: any = await Native._callMethod(MTfetchConversationSilentMode, {
      [MTfetchConversationSilentMode]: {
        conversationId: params.convId,
        conversationType: params.convType as number,
      },
    });
    ChatPushManager.checkErrorFromResult(r);
    const rr = r?.[MTfetchConversationSilentMode];
    return new ChatSilentModeResult(rr);
  }

  /**
   * 设置 app 的离线推送模式。
   *
   * @param option 离线推送配置选项。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async setSilentModeForAll(option: ChatSilentModeParam): Promise<void> {
    chatlog.log(
      `${ChatPushManager.TAG}: setSilentModeForAll: `,
      JSON.stringify(option)
    );
    let r: any = await Native._callMethod(MTsetSilentModeForAll, {
      [MTsetSilentModeForAll]: {
        param: option,
      },
    });
    ChatPushManager.checkErrorFromResult(r);
  }

  /**
   * 获取 app 的离线推送设置。
   *
   * @returns app 的离线推送设置。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async fetchSilentModeForAll(): Promise<ChatSilentModeResult> {
    chatlog.log(`${ChatPushManager.TAG}: fetchSilentModeForAll: `);
    let r: any = await Native._callMethod(MTfetchSilentModeForAll);
    ChatPushManager.checkErrorFromResult(r);
    const rr = r?.[MTfetchSilentModeForAll];
    return new ChatSilentModeResult(rr);
  }

  /**
   * 获取指定的多个会话的离线推送设置。
   *
   * @param conversations 会话 ID 列表。
   * @returns 会话的离线推送设置，以键值对格式返回，其中 key 为会话 ID，value 为会话的离线推送设置。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async fetchSilentModeForConversations(
    conversations: ChatConversation[]
  ): Promise<Map<string, ChatSilentModeResult>> {
    chatlog.log(
      `${ChatPushManager.TAG}: fetchSilentModeForConversations: `,
      JSON.stringify(conversations)
    );
    let r: any = await Native._callMethod(MTfetchSilentModeForConversations, {
      [MTfetchSilentModeForConversations]: { convs: conversations },
    });
    ChatPushManager.checkErrorFromResult(r);
    const rr = r?.[MTfetchSilentModeForConversations];
    const ret = new Map<string, ChatSilentModeResult>();
    if (rr) {
      Object.entries(rr).forEach((value: [string, any]) => {
        ret.set(value[0], value[1]);
      });
    }
    return ret;
  }

  /**
   * 设置推送通知的首选语言。
   *
   * @param languageCode 语言代码，详见 {@link ChatTextMessageBody}。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async setPreferredNotificationLanguage(
    languageCode: string
  ): Promise<void> {
    chatlog.log(
      `${ChatPushManager.TAG}: setPreferredNotificationLanguage: `,
      languageCode
    );
    let r: any = await Native._callMethod(MTsetPreferredNotificationLanguage, {
      [MTsetPreferredNotificationLanguage]: {
        code: languageCode,
      },
    });
    ChatPushManager.checkErrorFromResult(r);
  }

  /**
   * 获取推送通知的首选语言。
   *
   * @returns 推送通知的首选语言。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async fetchPreferredNotificationLanguage(): Promise<
    string | undefined
  > {
    chatlog.log(`${ChatPushManager.TAG}: fetchPreferredNotificationLanguage: `);
    let r: any = await Native._callMethod(MTfetchPreferredNotificationLanguage);
    ChatPushManager.checkErrorFromResult(r);
    const rr = r?.[MTfetchPreferredNotificationLanguage];
    return rr as string;
  }

  /**
   * 修改推送通知中显示的消息发送方的昵称。
   *
   * 该昵称可与用户属性中的用户昵称设置不同，但我们建议这两个昵称的设置相同。若其中一个昵称发生变化，应及时修改另一个昵称。
   *
   * 你可以调用 {@link ChatUserInfoManager.updateOwnUserInfo} 修改用户属性中的用户昵称。
   *
   * @param nickname  推送通知中显示的消息发送方的昵称。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async updatePushNickname(nickname: string): Promise<void> {
    chatlog.log(`${ChatPushManager.TAG}: ${this.updatePushNickname.name}`);
    let r: any = await Native._callMethod(MTupdatePushNickname, {
      [MTupdatePushNickname]: {
        nickname: nickname,
      },
    });
    ChatPushManager.checkErrorFromResult(r);
  }

  /**
   * 修改推送通知的展示方式。
   *
   * 默认值为 {@link ChatPushDisplayStyle.Simple}。
   *
   * @param displayStyle 推送通知的展示方式。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async updatePushDisplayStyle(
    displayStyle: ChatPushDisplayStyle = ChatPushDisplayStyle.Simple
  ): Promise<void> {
    chatlog.log(`${ChatPushManager.TAG}: ${this.updatePushDisplayStyle.name}`);
    let r: any = await Native._callMethod(MTupdateImPushStyle, {
      [MTupdateImPushStyle]: {
        pushStyle: displayStyle as number,
      },
    });
    ChatPushManager.checkErrorFromResult(r);
  }

  /**
   * 从服务器获取推送配置。
   *
   * @returns 推送选项。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async fetchPushOptionFromServer(): Promise<ChatPushOption> {
    chatlog.log(
      `${ChatPushManager.TAG}: ${this.fetchPushOptionFromServer.name}`
    );
    let r: any = await Native._callMethod(MTgetImPushConfigFromServer);
    ChatPushManager.checkErrorFromResult(r);
    return new ChatPushOption(r?.[MTgetImPushConfigFromServer]);
  }

  /**
   * 选择离线推送模板，通知服务器。
   *
   * 推送模板可以使用 RESTful API 或控制台添加。
   *
   * @param templateName 推送模板名称。 如果选择的推送模板不存在，虽然该方法不会返回错误，但是不会生效。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async selectPushTemplate(templateName: string): Promise<void> {
    chatlog.log(`${ChatPushManager.TAG}: ${this.selectPushTemplate.name}`);
    let r: any = await Native._callMethod(MTsetPushTemplate, {
      [MTsetPushTemplate]: { templateName },
    });
    ChatPushManager.checkErrorFromResult(r);
  }

  /**
   * 获取当前推送模板的名称。
   *
   * @returns 推送模板的名称。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async fetchSelectedPushTemplate(): Promise<string | undefined> {
    chatlog.log(
      `${ChatPushManager.TAG}: ${this.fetchSelectedPushTemplate.name}`
    );
    let r: any = await Native._callMethod(MTgetPushTemplate);
    ChatPushManager.checkErrorFromResult(r);
    return r?.[MTgetPushTemplate].templateName as string | undefined;
  }
}
