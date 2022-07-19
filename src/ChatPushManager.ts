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
   * Set offline push notification type for the special conversation.
   *
   * @param params -
   * - convId: The conversation id.
   * - convType: The conversation type.
   * - option: Push DND parameters offline.
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
   * Remove the setting of offline push notification type for the special conversation.
   * After clearing, the session follows the Settings of the current logged-in user  {@link EMPushManager#setSilentModeForAll(ChatSilentModeParam)}.
   *
   * @param params -
   * - convId: The conversation id.
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
   * Gets the DND setting of the special conversation.
   *
   * @param params -
   * - convId: The conversation id.
   * - convType: The conversation type.
   *
   * @returns The conversation silent mode.
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
   * Set the DND normal settings for the current login user.
   *
   * @param option Push DND parameters offline.
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
   * Gets the DND normal settings of the current login user.
   *
   * @returns The normal silent mode.
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
   * Obtain the DND Settings of specified conversations in batches.
   *
   * @param conversations The conversation list.
   * @returns key is conversation id and the value is silent mode.
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
   * Set user push translation language.
   *
   * @param languageCode language code. You can also look here {@link ChatTextMessageBody}
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
   * Gets the push translation language set by the user.
   *
   * @returns Language code that is already supported.
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
