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
 * The class for message push configuration options.
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
   * Sets the offline push for the conversation.
   *
   * @params params
   * - convId: The conversation ID.
   * - convType: The conversation type.
   * - option: The configuration options for the offline push.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Clears the offline push settings of the conversation.
   *
   * After clearing, the conversation uses the offline push settings of the app. See {@link EMPushManager.setSilentModeForAll}.
   *
   * @params params
   * - convId: The conversation ID.
   * - convType: The conversation type.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets the offline push settings of the conversation.
   *
   * @params params
   * - convId: The conversation ID.
   * - convType: The conversation type.
   *
   * @returns The offline push settings of the conversation.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Sets the offline push of the app.
   *
   * @param option The offline push parameters.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets the do-not-disturb settings of the app.
   *
   * @returns The do-not-disturb settings of the app.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchSilentModeForAll(): Promise<ChatSilentModeResult> {
    chatlog.log(`${ChatPushManager.TAG}: fetchSilentModeForAll: `);
    let r: any = await Native._callMethod(MTfetchSilentModeForAll);
    ChatPushManager.checkErrorFromResult(r);
    const rr = r?.[MTfetchSilentModeForAll];
    return new ChatSilentModeResult(rr);
  }

  /**
   * Gets the do-not-disturb settings of the specified conversations.
   *
   * @param conversations The conversation list.
   * @returns  The do-not-disturb settings of the specified conversations, which are key-value pairs where the key is the conversation ID and the value is the do-not-disturb settings.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Sets the target translation language of offline push notifications.
   *
   * @param languageCode The language code. See {@link ChatTextMessageBody}.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets the configured push translation language.
   *
   * @returns The language code.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Updates nickname of the sender displayed in push notifications.
   *
   * This nickname can be different from the nickname in the user profile; however, we recommend that you use the same nickname for both. Therefore, if either nickname is updated, the other should be changed at the same time.
   *
   * To update the nickname in the user profile, you can call {@link ChatUserInfoManager.updateOwnUserInfo}.
   *
   * @param nickname  The nickname of the sender displayed in push notifications.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Updates the display style of push notifications.
   *
   * The default value is {@link ChatPushDisplayStyle.Simple}.
   *
   * @param displayStyle The display style of push notifications.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets the push configurations from the server.
   *
   * @returns The push options.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Select the push template with template name for offline push, and send to Server.
   *
   * The push template can be set through restful or console.
   *
   * @param templateName The push template name. If the name does not exist in the console, although this method will not return an error, it will not take effect.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async selectPushTemplate(templateName: string): Promise<void> {
    chatlog.log(`${ChatPushManager.TAG}: ${this.selectPushTemplate.name}`);
    let r: any = await Native._callMethod(MTsetPushTemplate, {
      [MTsetPushTemplate]: { templateName },
    });
    ChatPushManager.checkErrorFromResult(r);
  }

  /**
   * Get selected push template for offline push.
   *
   * @returns The selected template name.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
