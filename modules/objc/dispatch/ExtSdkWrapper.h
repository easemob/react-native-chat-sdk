//
//  ExtSdkWrapper.h
//
//
//  Created by 杜洁鹏 on 2019/10/8.
//

#import "ExtSdkCallbackObjc.h"
#import <HyphenateChat/HyphenateChat.h>

NS_ASSUME_NONNULL_BEGIN

@interface ExtSdkWrapper : NSObject

- (void)onResult:(nonnull id<ExtSdkCallbackObjc>)result
    withMethodType:(nonnull NSString *)methodType
         withError:(nullable EMError *)error
        withParams:(nullable NSObject *)params;

- (void)onReceive:(NSString *)methodType withParams:(nullable NSObject *)params;

- (BOOL)checkMessageParams:(nonnull id<ExtSdkCallbackObjc>)result
            withMethodType:(nonnull NSString *)methodType
               withMessage:(nullable EMChatMessage *)message;
- (BOOL)getMessageParams:(nonnull id<ExtSdkCallbackObjc>)result
          withMethodType:(nonnull NSString *)methodType
             withMessage:(nullable EMChatMessage *)message;

- (void)mergeMessageBody:(EMMessageBody *)msgBody
       withDBMessageBody:(EMMessageBody *)dbMsgBody;
- (void)mergeMessage:(EMChatMessage *)msg withDBMessage:(EMChatMessage *)dbMsg;

- (EMConversation *)getConversation:(NSDictionary *)param;

- (EMConversation *)getConversationFromMessage:(EMChatMessage *)msg;

@end

NS_ASSUME_NONNULL_END
