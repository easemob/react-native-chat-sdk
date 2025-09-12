//
//  ExtSdkChatroomManagerWrapper.h
//  im_flutter_sdk
//
//  Created by easemob-DN0164 on 2019/10/18.
//

#import "ExtSdkWrapper.h"

NS_ASSUME_NONNULL_BEGIN
@interface ExtSdkChatroomManagerWrapper : ExtSdkWrapper

+ (nonnull instancetype)getInstance;

- (void)initSDK;

- (void)getChatroomsFromServer:(NSDictionary *)param
                withMethodType:(NSString *)aChannelName
                        result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)createChatRoom:(NSDictionary *)param
        withMethodType:(NSString *)aChannelName
                result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)joinChatRoom:(NSDictionary *)param
      withMethodType:(NSString *)aChannelName
              result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)leaveChatRoom:(NSDictionary *)param
       withMethodType:(NSString *)aChannelName
               result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)destroyChatRoom:(NSDictionary *)param
         withMethodType:(NSString *)aChannelName
                 result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)fetchChatroomFromServer:(NSDictionary *)param
                 withMethodType:(NSString *)aChannelName
                         result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)getChatRoom:(NSDictionary *)param
     withMethodType:(NSString *)aChannelName
             result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)getAllChatRooms:(NSDictionary *)param
         withMethodType:(NSString *)aChannelName
                 result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)getChatroomMemberListFromServer:(NSDictionary *)param
                         withMethodType:(NSString *)aChannelName
                                 result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)fetchChatroomBlockListFromServer:(NSDictionary *)param
                          withMethodType:(NSString *)aChannelName
                                  result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)getChatroomMuteListFromServer:(NSDictionary *)param
                       withMethodType:(NSString *)aChannelName
                               result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)fetchChatroomAnnouncement:(NSDictionary *)param
                   withMethodType:(NSString *)aChannelName
                           result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)chatRoomUpdateSubject:(NSDictionary *)param
               withMethodType:(NSString *)aChannelName
                       result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)chatRoomUpdateDescription:(NSDictionary *)param
                   withMethodType:(NSString *)aChannelName
                           result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)chatRoomRemoveMembers:(NSDictionary *)param
               withMethodType:(NSString *)aChannelName
                       result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)chatRoomBlockMembers:(NSDictionary *)param
              withMethodType:(NSString *)aChannelName
                      result:(nonnull id<ExtSdkCallbackObjc>)result;
- (void)chatRoomUnblockMembers:(NSDictionary *)param
                withMethodType:(NSString *)aChannelName
                        result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)changeChatRoomOwner:(NSDictionary *)param
             withMethodType:(NSString *)aChannelName
                     result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)chatRoomAddAdmin:(NSDictionary *)param
          withMethodType:(NSString *)aChannelName
                  result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)chatRoomRemoveAdmin:(NSDictionary *)param
             withMethodType:(NSString *)aChannelName
                     result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)chatRoomMuteMembers:(NSDictionary *)param
             withMethodType:(NSString *)aChannelName
                     result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)chatRoomUnmuteMembers:(NSDictionary *)param
               withMethodType:(NSString *)aChannelName
                       result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)updateChatRoomAnnouncement:(NSDictionary *)param
                    withMethodType:(NSString *)aChannelName
                            result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)addMembersToChatRoomWhiteList:(NSDictionary *)param
                       withMethodType:(NSString *)aChannelName
                               result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)removeMembersFromChatRoomWhiteList:(NSDictionary *)param
                            withMethodType:(NSString *)aChannelName
                                    result:
                                        (nonnull id<ExtSdkCallbackObjc>)result;

- (void)isMemberInChatRoomWhiteListFromServer:(NSDictionary *)param
                               withMethodType:(NSString *)aChannelName
                                       result:(nonnull id<ExtSdkCallbackObjc>)
                                                  result;

- (void)fetchChatRoomWhiteListFromServer:(NSDictionary *)param
                          withMethodType:(NSString *)aChannelName
                                  result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)muteAllChatRoomMembers:(NSDictionary *)param
                withMethodType:(NSString *)aChannelName
                        result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)unMuteAllChatRoomMembers:(NSDictionary *)param
                  withMethodType:(NSString *)aChannelName
                          result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)fetchChatRoomAttributes:(NSDictionary *)param
                 withMethodType:(NSString *)aChannelName
                         result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)fetchChatRoomAllAttributes:(NSDictionary *)param
                    withMethodType:(NSString *)aChannelName
                            result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)setChatRoomAttributes:(NSDictionary *)param
               withMethodType:(NSString *)aChannelName
                       result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)removeChatRoomAttributes:(NSDictionary *)param
                  withMethodType:(NSString *)aChannelName
                          result:(nonnull id<ExtSdkCallbackObjc>)result;

@end

NS_ASSUME_NONNULL_END
