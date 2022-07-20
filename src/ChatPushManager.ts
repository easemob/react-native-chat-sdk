import type { NativeEventEmitter } from 'react-native';
import type {
  ChatConversation,
  ChatConversationType,
} from './common/ChatConversation';
import { chatlog } from './common/ChatLog';
import {
  ChatSilentModeResult,
  ChatSilentModeParam,
} from './common/ChatSilentMode';
import {
  MTfetchConversationSilentMode,
  MTfetchPreferredNotificationLanguage,
  MTfetchSilentModeForAll,
  MTfetchSilentModeForConversations,
  MTremoveConversationSilentMode,
  MTsetConversationSilentMode,
  MTsetPreferredNotificationLanguage,
  MTsetSilentModeForAll,
} from './__internal__/Consts';
import { Native } from './__internal__/Native';

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
   * Sets the do-not-disturb mode for the conversation.
   *
   * @param params -
   * - convId: The conversation ID.
   * - convType: The conversation type.
   * - option: The parameters of the do-not-disturb mode for the offline message push.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async setConversationSilentMode(params: {
    convId: string;
    convType: ChatConversationType;
    option: ChatSilentModeParam;
  }): Promise<void> {
    chatlog.log(
      `${ChatPushManager.TAG}: setConversationSilentMode: `,
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
   * Removes the do-not-disturb settings of the conversation.
   *
   * After clearing, the conversation uses the global do-not-disturb settings of the app. See {@link EMPushManager#setSilentModeForAll(ChatSilentModeParam)}.
   *
   * @param params -
   * - convId: The conversation ID.
   * - convType: The conversation type.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async removeConversationSilentMode(params: {
    convId: string;
    convType: ChatConversationType;
  }): Promise<void> {
    chatlog.log(
      `${ChatPushManager.TAG}: removeConversationSilentMode: `,
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
   * Gets the do-not-disturb mode of the conversation.
   *
   * @param params -
   * - convId: The conversation ID.
   * - convType: The conversation type.
   *
   * @returns The do-not-disturb settings of the conversation.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchConversationSilentMode(params: {
    convId: string;
    convType: ChatConversationType;
  }): Promise<ChatSilentModeResult> {
    chatlog.log(
      `${ChatPushManager.TAG}: fetchConversationSilentMode: `,
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
   * Sets the do-not-disturb mode of the app.
   *
   * @param option The parameters of the do-not-disturb mode.
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
}
