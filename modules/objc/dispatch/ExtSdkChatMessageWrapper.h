//
//  ExtSdkChatMessageWrapper.h
//  im_flutter_sdk
//
//  Created by asterisk on 2022/5/25.
//

#import "ExtSdkWrapper.h"

NS_ASSUME_NONNULL_BEGIN

@interface ExtSdkChatMessageWrapper : ExtSdkWrapper

+ (nonnull instancetype)getInstance;

- (void)getReactionList:(NSDictionary *)param
         withMethodType:(NSString *)aChannelName
                 result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)getGroupAckCount:(NSDictionary *)param
          withMethodType:(NSString *)aChannelName
                  result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)getMessagePinInfo:(NSDictionary *)param
           withMethodType:(NSString *)aChannelName
                   result:(nonnull id<ExtSdkCallbackObjc>)result;

@end

NS_ASSUME_NONNULL_END
