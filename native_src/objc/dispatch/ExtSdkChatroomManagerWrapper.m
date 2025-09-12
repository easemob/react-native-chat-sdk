//
//  ExtSdkChatroomManagerWrapper.m
//  im_flutter_sdk
//
//  Created by easemob-DN0164 on 2019/10/18.
//

#import "ExtSdkChatroomManagerWrapper.h"
#import "ExtSdkMethodTypeObjc.h"

#import "ExtSdkToJson.h"

@interface ExtSdkChatroomManagerWrapper () <EMChatroomManagerDelegate>

@end

@implementation ExtSdkChatroomManagerWrapper

+ (nonnull instancetype)getInstance {
    static ExtSdkChatroomManagerWrapper *instance = nil;
    static dispatch_once_t predicate;
    dispatch_once(&predicate, ^{
      instance = [[ExtSdkChatroomManagerWrapper alloc] init];
    });
    return instance;
}

- (void)initSDK {
    [EMClient.sharedClient.roomManager removeDelegate:self];
    [EMClient.sharedClient.roomManager addDelegate:self delegateQueue:nil];
}

#pragma mark - Actions

- (void)getChatroomsFromServer:(NSDictionary *)param
                withMethodType:(NSString *)aChannelName
                        result:(nonnull id<ExtSdkCallbackObjc>)result {
    NSInteger page = [param[@"pageNum"] integerValue];
    NSInteger pageSize = [param[@"pageSize"] integerValue];

    __weak typeof(self) weakSelf = self;

    [EMClient.sharedClient.roomManager
        getChatroomsFromServerWithPage:page
                              pageSize:pageSize
                            completion:^(EMPageResult *aResult,
                                         EMError *aError) {
                              [weakSelf onResult:result
                                  withMethodType:aChannelName
                                       withError:aError
                                      withParams:[aResult toJsonObject]];
                            }];
}

- (void)createChatRoom:(NSDictionary *)param
        withMethodType:(NSString *)aChannelName
                result:(nonnull id<ExtSdkCallbackObjc>)result {

    __weak typeof(self) weakSelf = self;

    NSString *subject = param[@"subject"];
    NSString *description = param[@"desc"];
    NSArray *invitees = param[@"members"];
    NSString *message = param[@"welcomeMsg"];
    NSInteger maxMembersCount = [param[@"maxUserCount"] integerValue];
    [EMClient.sharedClient.roomManager
        createChatroomWithSubject:subject
                      description:description
                         invitees:invitees
                          message:message
                  maxMembersCount:maxMembersCount
                       completion:^(EMChatroom *aChatroom, EMError *aError) {
                         [weakSelf onResult:result
                             withMethodType:aChannelName
                                  withError:aError
                                 withParams:[aChatroom toJsonObject]];
                       }];
}

- (void)joinChatRoom:(NSDictionary *)param
      withMethodType:(NSString *)aChannelName
              result:(nonnull id<ExtSdkCallbackObjc>)result {

    __weak typeof(self) weakSelf = self;
    NSString *chatroomId = param[@"roomId"];
    [EMClient.sharedClient.roomManager
        joinChatroom:chatroomId
          completion:^(EMChatroom *aChatroom, EMError *aError) {
            [weakSelf onResult:result
                withMethodType:aChannelName
                     withError:aError
                    withParams:@(!!aChatroom)];
          }];
}

- (void)leaveChatRoom:(NSDictionary *)param
       withMethodType:(NSString *)aChannelName
               result:(nonnull id<ExtSdkCallbackObjc>)result {

    __weak typeof(self) weakSelf = self;

    NSString *chatroomId = param[@"roomId"];
    [EMClient.sharedClient.roomManager leaveChatroom:chatroomId
                                          completion:^(EMError *aError) {
                                            [weakSelf onResult:result
                                                withMethodType:aChannelName
                                                     withError:aError
                                                    withParams:nil];
                                          }];
}

- (void)destroyChatRoom:(NSDictionary *)param
         withMethodType:(NSString *)aChannelName
                 result:(nonnull id<ExtSdkCallbackObjc>)result {

    __weak typeof(self) weakSelf = self;

    NSString *chatroomId = param[@"roomId"];
    [EMClient.sharedClient.roomManager destroyChatroom:chatroomId
                                            completion:^(EMError *aError) {
                                              [weakSelf onResult:result
                                                  withMethodType:aChannelName
                                                       withError:aError
                                                      withParams:nil];
                                            }];
}

- (void)fetchChatroomFromServer:(NSDictionary *)param
                 withMethodType:(NSString *)aChannelName
                         result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *chatroomId = param[@"roomId"];
    BOOL isFetchMembers = param[@"fetchMembers"] ?: NO;
    [EMClient.sharedClient.roomManager
        getChatroomSpecificationFromServerWithId:chatroomId
                                    fetchMembers:isFetchMembers
                                      completion:^(EMChatroom *aChatroom,
                                                   EMError *aError) {
                                        [weakSelf onResult:result
                                            withMethodType:aChannelName
                                                 withError:aError
                                                withParams:[aChatroom
                                                               toJsonObject]];
                                      }];
}

- (void)getChatRoom:(NSDictionary *)param
     withMethodType:(NSString *)aChannelName
             result:(nonnull id<ExtSdkCallbackObjc>)result {

    __weak typeof(self) weakSelf = self;
    EMChatroom *chatroom = [EMChatroom chatroomWithId:param[@"roomId"]];
    [weakSelf onResult:result
        withMethodType:aChannelName
             withError:nil
            withParams:[chatroom toJsonObject]];
}

- (void)getAllChatRooms:(NSDictionary *)param
         withMethodType:(NSString *)aChannelName
                 result:(nonnull id<ExtSdkCallbackObjc>)result {

    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.roomManager
        getChatroomsFromServerWithPage:0
                              pageSize:-1
                            completion:^(EMPageResult *aResult,
                                         EMError *aError) {
                              NSMutableArray *list = [NSMutableArray array];
                              for (EMChatroom *room in aResult.list) {
                                  [list addObject:[room toJsonObject]];
                              }

                              [weakSelf onResult:result
                                  withMethodType:aChannelName
                                       withError:aError
                                      withParams:list];
                            }];
}

- (void)getChatroomMemberListFromServer:(NSDictionary *)param
                         withMethodType:(NSString *)aChannelName
                                 result:(nonnull id<ExtSdkCallbackObjc>)result {

    __weak typeof(self) weakSelf = self;

    NSString *chatroomId = param[@"roomId"];
    NSString *cursor = param[@"cursor"];
    NSInteger pageSize = [param[@"pageSize"] integerValue];
    [EMClient.sharedClient.roomManager
        getChatroomMemberListFromServerWithId:chatroomId
                                       cursor:cursor
                                     pageSize:pageSize
                                   completion:^(EMCursorResult *aResult,
                                                EMError *aError) {
                                     [weakSelf onResult:result
                                         withMethodType:aChannelName
                                              withError:aError
                                             withParams:[aResult toJsonObject]];
                                   }];
}

- (void)fetchChatroomBlockListFromServer:(NSDictionary *)param
                          withMethodType:(NSString *)aChannelName
                                  result:
                                      (nonnull id<ExtSdkCallbackObjc>)result {

    __weak typeof(self) weakSelf = self;

    NSString *chatroomId = param[@"roomId"];
    NSInteger pageNumber = [param[@"pageNum"] integerValue];
    ;
    NSInteger pageSize = [param[@"pageSize"] integerValue];
    [EMClient.sharedClient.roomManager
        getChatroomBlacklistFromServerWithId:chatroomId
                                  pageNumber:pageNumber
                                    pageSize:pageSize
                                  completion:^(NSArray *aList,
                                               EMError *aError) {
                                    [weakSelf onResult:result
                                        withMethodType:aChannelName
                                             withError:aError
                                            withParams:aList];
                                  }];
}

- (void)getChatroomMuteListFromServer:(NSDictionary *)param
                       withMethodType:(NSString *)aChannelName
                               result:(nonnull id<ExtSdkCallbackObjc>)result {

    __weak typeof(self) weakSelf = self;

    NSString *chatroomId = param[@"roomId"];
    NSInteger pageNumber = [param[@"pageNum"] integerValue];
    NSInteger pageSize = [param[@"pageSize"] integerValue];
    [EMClient.sharedClient.roomManager
        getChatroomMuteListFromServerWithId:chatroomId
                                 pageNumber:pageNumber
                                   pageSize:pageSize
                                 completion:^(NSArray *aList, EMError *aError) {
                                   [weakSelf onResult:result
                                       withMethodType:aChannelName
                                            withError:aError
                                           withParams:aList];
                                 }];
}

- (void)fetchChatroomAnnouncement:(NSDictionary *)param
                   withMethodType:(NSString *)aChannelName
                           result:(nonnull id<ExtSdkCallbackObjc>)result {

    __weak typeof(self) weakSelf = self;

    NSString *chatroomId = param[@"roomId"];
    [EMClient.sharedClient.roomManager
        getChatroomAnnouncementWithId:chatroomId
                           completion:^(NSString *aAnnouncement,
                                        EMError *aError) {
                             [weakSelf onResult:result
                                 withMethodType:aChannelName
                                      withError:aError
                                     withParams:aAnnouncement];
                           }];
}

- (void)chatRoomUpdateSubject:(NSDictionary *)param
               withMethodType:(NSString *)aChannelName
                       result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *subject = param[@"subject"];
    NSString *chatroomId = param[@"roomId"];
    [EMClient.sharedClient.roomManager
        updateSubject:subject
          forChatroom:chatroomId
           completion:^(EMChatroom *aChatroom, EMError *aError) {
             [weakSelf onResult:result
                 withMethodType:aChannelName
                      withError:aError
                     withParams:nil];
           }];
}

- (void)chatRoomUpdateDescription:(NSDictionary *)param
                   withMethodType:(NSString *)aChannelName
                           result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *description = param[@"description"];
    NSString *chatroomId = param[@"roomId"];
    [EMClient.sharedClient.roomManager
        updateDescription:description
              forChatroom:chatroomId
               completion:^(EMChatroom *aChatroom, EMError *aError) {
                 [weakSelf onResult:result
                     withMethodType:aChannelName
                          withError:aError
                         withParams:nil];
               }];
}

- (void)chatRoomRemoveMembers:(NSDictionary *)param
               withMethodType:(NSString *)aChannelName
                       result:(nonnull id<ExtSdkCallbackObjc>)result {

    __weak typeof(self) weakSelf = self;

    NSArray *members = param[@"members"];
    NSString *chatroomId = param[@"roomId"];
    [EMClient.sharedClient.roomManager
        removeMembers:members
         fromChatroom:chatroomId
           completion:^(EMChatroom *aChatroom, EMError *aError) {
             [weakSelf onResult:result
                 withMethodType:aChannelName
                      withError:aError
                     withParams:nil];
           }];
}

- (void)chatRoomBlockMembers:(NSDictionary *)param
              withMethodType:(NSString *)aChannelName
                      result:(nonnull id<ExtSdkCallbackObjc>)result {

    __weak typeof(self) weakSelf = self;

    NSArray *members = param[@"members"];
    NSString *chatroomId = param[@"roomId"];
    [EMClient.sharedClient.roomManager
        blockMembers:members
        fromChatroom:chatroomId
          completion:^(EMChatroom *aChatroom, EMError *aError) {
            [weakSelf onResult:result
                withMethodType:aChannelName
                     withError:aError
                    withParams:nil];
          }];
}

- (void)chatRoomUnblockMembers:(NSDictionary *)param
                withMethodType:(NSString *)aChannelName
                        result:(nonnull id<ExtSdkCallbackObjc>)result {

    __weak typeof(self) weakSelf = self;

    NSArray *members = param[@"members"];
    NSString *chatroomId = param[@"roomId"];
    [EMClient.sharedClient.roomManager
        unblockMembers:members
          fromChatroom:chatroomId
            completion:^(EMChatroom *aChatroom, EMError *aError) {
              [weakSelf onResult:result
                  withMethodType:aChannelName
                       withError:aError
                      withParams:nil];
            }];
}

- (void)changeChatRoomOwner:(NSDictionary *)param
             withMethodType:(NSString *)aChannelName
                     result:(nonnull id<ExtSdkCallbackObjc>)result {

    __weak typeof(self) weakSelf = self;

    NSString *chatroomId = param[@"roomId"];
    NSString *newOwner = param[@"newOwner"];
    [EMClient.sharedClient.roomManager
        updateChatroomOwner:chatroomId
                   newOwner:newOwner
                 completion:^(EMChatroom *aChatroom, EMError *aError) {
                   [weakSelf onResult:result
                       withMethodType:aChannelName
                            withError:aError
                           withParams:nil];
                 }];
}

- (void)chatRoomAddAdmin:(NSDictionary *)param
          withMethodType:(NSString *)aChannelName
                  result:(nonnull id<ExtSdkCallbackObjc>)result {

    __weak typeof(self) weakSelf = self;

    NSString *admin = param[@"admin"];
    NSString *chatroomId = param[@"roomId"];
    [EMClient.sharedClient.roomManager
          addAdmin:admin
        toChatroom:chatroomId
        completion:^(EMChatroom *aChatroomp, EMError *aError) {
          [weakSelf onResult:result
              withMethodType:aChannelName
                   withError:aError
                  withParams:nil];
        }];
}

- (void)chatRoomRemoveAdmin:(NSDictionary *)param
             withMethodType:(NSString *)aChannelName
                     result:(nonnull id<ExtSdkCallbackObjc>)result {

    __weak typeof(self) weakSelf = self;

    NSString *admin = param[@"admin"];
    NSString *chatroomId = param[@"roomId"];
    [EMClient.sharedClient.roomManager
         removeAdmin:admin
        fromChatroom:chatroomId
          completion:^(EMChatroom *aChatroom, EMError *aError) {
            [weakSelf onResult:result
                withMethodType:aChannelName
                     withError:aError
                    withParams:nil];
          }];
}

- (void)chatRoomMuteMembers:(NSDictionary *)param
             withMethodType:(NSString *)aChannelName
                     result:(nonnull id<ExtSdkCallbackObjc>)result {

    __weak typeof(self) weakSelf = self;

    NSArray *muteMembers = param[@"muteMembers"];
    NSInteger muteMilliseconds = [param[@"duration"] integerValue];
    NSString *chatroomId = param[@"roomId"];
    [EMClient.sharedClient.roomManager
             muteMembers:muteMembers
        muteMilliseconds:muteMilliseconds
            fromChatroom:chatroomId
              completion:^(EMChatroom *aChatroom, EMError *aError) {
                [weakSelf onResult:result
                    withMethodType:aChannelName
                         withError:aError
                        withParams:nil];
              }];
}

- (void)chatRoomUnmuteMembers:(NSDictionary *)param
               withMethodType:(NSString *)aChannelName
                       result:(nonnull id<ExtSdkCallbackObjc>)result {

    __weak typeof(self) weakSelf = self;

    NSArray *unMuteMembers = param[@"unMuteMembers"];
    NSString *chatroomId = param[@"roomId"];
    [EMClient.sharedClient.roomManager
        unmuteMembers:unMuteMembers
         fromChatroom:chatroomId
           completion:^(EMChatroom *aChatroom, EMError *aError) {
             [weakSelf onResult:result
                 withMethodType:aChannelName
                      withError:aError
                     withParams:nil];
           }];
}

- (void)updateChatRoomAnnouncement:(NSDictionary *)param
                    withMethodType:(NSString *)aChannelName
                            result:(nonnull id<ExtSdkCallbackObjc>)result {

    __weak typeof(self) weakSelf = self;

    NSString *chatroomId = param[@"roomId"];
    NSString *announcement = param[@"announcement"];
    [EMClient.sharedClient.roomManager
        updateChatroomAnnouncementWithId:chatroomId
                            announcement:announcement
                              completion:^(EMChatroom *aChatroom,
                                           EMError *aError) {
                                [weakSelf onResult:result
                                    withMethodType:aChannelName
                                         withError:aError
                                        withParams:@(!aError)];
                              }];
}

- (void)addMembersToChatRoomWhiteList:(NSDictionary *)param
                       withMethodType:(NSString *)aChannelName
                               result:(nonnull id<ExtSdkCallbackObjc>)result {
    NSString *roomId = param[@"roomId"];
    NSArray *ary = param[@"members"];
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.roomManager
        addWhiteListMembers:ary
               fromChatroom:roomId
                 completion:^(EMChatroom *aChatroom, EMError *aError) {
                   [weakSelf onResult:result
                       withMethodType:aChannelName
                            withError:aError
                           withParams:nil];
                 }];
}

- (void)removeMembersFromChatRoomWhiteList:(NSDictionary *)param
                            withMethodType:(NSString *)aChannelName
                                    result:
                                        (nonnull id<ExtSdkCallbackObjc>)result {
    NSString *roomId = param[@"roomId"];
    NSArray *ary = param[@"members"];
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.roomManager
        removeWhiteListMembers:ary
                  fromChatroom:roomId
                    completion:^(EMChatroom *aChatroom, EMError *aError) {
                      [weakSelf onResult:result
                          withMethodType:aChannelName
                               withError:aError
                              withParams:nil];
                    }];
}

- (void)isMemberInChatRoomWhiteListFromServer:(NSDictionary *)param
                               withMethodType:(NSString *)aChannelName
                                       result:(nonnull id<ExtSdkCallbackObjc>)
                                                  result {
    NSString *roomId = param[@"roomId"];
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.roomManager
        isMemberInWhiteListFromServerWithChatroomId:roomId
                                         completion:^(BOOL inWhiteList,
                                                      EMError *aError) {
                                           [weakSelf onResult:result
                                               withMethodType:aChannelName
                                                    withError:aError
                                                   withParams:@(inWhiteList)];
                                         }];
}

- (void)fetchChatRoomWhiteListFromServer:(NSDictionary *)param
                          withMethodType:(NSString *)aChannelName
                                  result:
                                      (nonnull id<ExtSdkCallbackObjc>)result {
    NSString *roomId = param[@"roomId"];
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.roomManager
        getChatroomWhiteListFromServerWithId:roomId
                                  completion:^(NSArray *aList,
                                               EMError *aError) {
                                    [weakSelf onResult:result
                                        withMethodType:aChannelName
                                             withError:aError
                                            withParams:aList];
                                  }];
}

- (void)muteAllChatRoomMembers:(NSDictionary *)param
                withMethodType:(NSString *)aChannelName
                        result:(nonnull id<ExtSdkCallbackObjc>)result {
    NSString *roomId = param[@"roomId"];
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.roomManager
        muteAllMembersFromChatroom:roomId
                        completion:^(EMChatroom *aChatroom, EMError *aError) {
                          [weakSelf onResult:result
                              withMethodType:aChannelName
                                   withError:aError
                                  withParams:@(!aError)];
                        }];
}

- (void)unMuteAllChatRoomMembers:(NSDictionary *)param
                  withMethodType:(NSString *)aChannelName
                          result:(nonnull id<ExtSdkCallbackObjc>)result {
    NSString *roomId = param[@"roomId"];
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.roomManager
        unmuteAllMembersFromChatroom:roomId
                          completion:^(EMChatroom *aChatroom, EMError *aError) {
                            [weakSelf onResult:result
                                withMethodType:aChannelName
                                     withError:aError
                                    withParams:@(!aError)];
                          }];
}

- (void)fetchChatRoomAttributes:(NSDictionary *)param
                 withMethodType:(NSString *)aChannelName
                         result:(nonnull id<ExtSdkCallbackObjc>)result {
    NSString *roomId = param[@"roomId"];
    NSArray *keys = param[@"keys"];
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.roomManager
        fetchChatroomAttributes:roomId
                           keys:keys
                     completion:^(EMError *_Nullable aError,
                                  NSDictionary<NSString *, NSString *>
                                      *_Nullable properties) {
                       [weakSelf onResult:result
                           withMethodType:aChannelName
                                withError:aError
                               withParams:properties];
                     }];
}

- (void)fetchChatRoomAllAttributes:(NSDictionary *)param
                    withMethodType:(NSString *)aChannelName
                            result:(nonnull id<ExtSdkCallbackObjc>)result {
    NSString *roomId = param[@"roomId"];
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.roomManager
        fetchChatroomAllAttributes:roomId
                        completion:^(EMError *_Nullable error,
                                     NSDictionary<NSString *, NSString *>
                                         *_Nullable properties) {
                          [weakSelf onResult:result
                              withMethodType:aChannelName
                                   withError:error
                                  withParams:properties];
                        }];
}

- (void)setChatRoomAttributes:(NSDictionary *)param
               withMethodType:(NSString *)aChannelName
                       result:(nonnull id<ExtSdkCallbackObjc>)result {
    NSString *roomId = param[@"roomId"];
    NSArray *attributesArray = param[@"attributes"];
    NSNumber *autoDelete = param[@"autoDelete"];
    BOOL forced = [param[@"forced"] boolValue];
    __weak typeof(self) weakSelf = self;

    NSMutableDictionary *attributes = [NSMutableDictionary dictionary];
    for (int i = 0; i < attributesArray.count; ++i) {
        NSDictionary *kv = attributesArray[i];
        [attributes addEntriesFromDictionary:kv];
    }

    void (^block)(EMError *, NSDictionary<NSString *, EMError *> *) =
        ^(EMError *error, NSDictionary<NSString *, EMError *> *failureKeys) {
          NSMutableDictionary *tmp = [NSMutableDictionary dictionary];
          for (NSString *key in failureKeys) {
              tmp[key] = @(failureKeys[key].code);
          }
          [weakSelf onResult:result
              withMethodType:aChannelName
                   withError:failureKeys.count == 0 ? error : nil
                  withParams:tmp];
        };

    if (forced) {
        [EMClient.sharedClient.roomManager
            setChatroomAttributesForced:roomId
                             attributes:attributes
                             autoDelete:[autoDelete boolValue]
                        completionBlock:^(EMError *_Nullable aError,
                                          NSDictionary<NSString *, EMError *>
                                              *_Nullable failureKeys) {
                          block(aError, failureKeys);
                        }];
    } else {
        [EMClient.sharedClient.roomManager
            setChatroomAttributes:roomId
                       attributes:attributes
                       autoDelete:[autoDelete boolValue]
                  completionBlock:^(EMError *_Nullable aError,
                                    NSDictionary<NSString *, EMError *>
                                        *_Nullable failureKeys) {
                    block(aError, failureKeys);
                  }];
    }
}

- (void)removeChatRoomAttributes:(NSDictionary *)param
                  withMethodType:(NSString *)aChannelName
                          result:(nonnull id<ExtSdkCallbackObjc>)result {
    NSString *roomId = param[@"roomId"];
    NSArray *keys = param[@"keys"];
    BOOL forced = [param[@"forced"] boolValue];
    __weak typeof(self) weakSelf = self;

    void (^block)(EMError *, NSDictionary<NSString *, EMError *> *) =
        ^(EMError *error, NSDictionary<NSString *, EMError *> *failureKeys) {
          NSMutableDictionary *tmp = [NSMutableDictionary dictionary];
          for (NSString *key in failureKeys.allKeys) {
              tmp[key] = @(failureKeys[key].code);
          }
          [weakSelf onResult:result
              withMethodType:aChannelName
                   withError:failureKeys.count == 0 ? error : nil
                  withParams:tmp];
        };

    if (forced) {
        [EMClient.sharedClient.roomManager
            removeChatroomAttributesForced:roomId
                                attributes:keys
                           completionBlock:^(EMError *_Nullable aError,
                                             NSDictionary<NSString *, EMError *>
                                                 *_Nullable failureKeys) {
                             block(aError, failureKeys);
                           }];
    } else {
        [EMClient.sharedClient.roomManager
            removeChatroomAttributes:roomId
                          attributes:keys
                     completionBlock:^(EMError *_Nullable aError,
                                       NSDictionary<NSString *, EMError *>
                                           *_Nullable failureKeys) {
                       block(aError, failureKeys);
                     }];
    }
}

#pragma mark - EMChatroomManagerDelegate

- (void)userDidJoinChatroom:(EMChatroom *)aChatroom user:(NSString *)aUsername {
    NSDictionary *map = @{
        @"type" : @"onMemberJoined",
        @"roomId" : aChatroom.chatroomId,
        @"participant" : aUsername
    };
    [self onReceive:ExtSdkMethodKeyChatroomChanged withParams:map];
}

- (void)userDidLeaveChatroom:(EMChatroom *)aChatroom
                        user:(NSString *)aUsername {
    NSDictionary *map = @{
        @"type" : @"onMemberExited",
        @"roomId" : aChatroom.chatroomId,
        @"roomName" : aChatroom.subject,
        @"participant" : aUsername
    };
    [self onReceive:ExtSdkMethodKeyChatroomChanged withParams:map];
}

- (void)didDismissFromChatroom:(EMChatroom *)aChatroom
                        reason:(EMChatroomBeKickedReason)aReason {
    NSDictionary *map;
    if (aReason == EMChatroomBeKickedReasonDestroyed) {
        map = @{
            @"type" : @"onChatRoomDestroyed",
            @"roomId" : aChatroom.chatroomId,
            @"roomName" : aChatroom.subject
        };
    } else if (aReason == EMChatroomBeKickedReasonBeRemoved) {
        map = @{
            @"type" : @"onRemovedFromChatRoom",
            @"roomId" : aChatroom.chatroomId,
            @"roomName" : aChatroom.subject,
            @"participant" : [[EMClient sharedClient] currentUsername],
            @"reason" : @(aReason)
        };
    }

    [self onReceive:ExtSdkMethodKeyChatroomChanged withParams:map];
}

- (void)chatroomMuteListDidUpdate:(EMChatroom *)aChatroom
                addedMutedMembers:(NSArray *)aMutes
                       muteExpire:(NSInteger)aMuteExpire {
    NSDictionary *map = @{
        @"type" : @"onMuteListAdded",
        @"roomId" : aChatroom.chatroomId,
        @"mutes" : aMutes,
        @"expireTime" : [NSString stringWithFormat:@"%ld", aMuteExpire]
    };
    [self onReceive:ExtSdkMethodKeyChatroomChanged withParams:map];
}

- (void)chatroomMuteListDidUpdate:(EMChatroom *)aChatroom
              removedMutedMembers:(NSArray *)aMutes {
    NSDictionary *map = @{
        @"type" : @"onMuteListRemoved",
        @"roomId" : aChatroom.chatroomId,
        @"mutes" : aMutes
    };
    [self onReceive:ExtSdkMethodKeyChatroomChanged withParams:map];
}

- (void)chatroomAdminListDidUpdate:(EMChatroom *)aChatroom
                        addedAdmin:(NSString *)aAdmin {
    NSDictionary *map = @{
        @"type" : @"onAdminAdded",
        @"roomId" : aChatroom.chatroomId,
        @"admin" : aAdmin
    };
    [self onReceive:ExtSdkMethodKeyChatroomChanged withParams:map];
}

- (void)chatroomAdminListDidUpdate:(EMChatroom *)aChatroom
                      removedAdmin:(NSString *)aAdmin {
    NSDictionary *map = @{
        @"type" : @"onAdminRemoved",
        @"roomId" : aChatroom.chatroomId,
        @"admin" : aAdmin
    };
    [self onReceive:ExtSdkMethodKeyChatroomChanged withParams:map];
}

- (void)chatroomOwnerDidUpdate:(EMChatroom *)aChatroom
                      newOwner:(NSString *)aNewOwner
                      oldOwner:(NSString *)aOldOwner {
    NSDictionary *map = @{
        @"type" : @"onOwnerChanged",
        @"roomId" : aChatroom.chatroomId,
        @"newOwner" : aNewOwner,
        @"oldOwner" : aOldOwner
    };
    [self onReceive:ExtSdkMethodKeyChatroomChanged withParams:map];
}

- (void)chatroomAnnouncementDidUpdate:(EMChatroom *)aChatroom
                         announcement:(NSString *)aAnnouncement {
    NSDictionary *map = @{
        @"type" : @"onAnnouncementChanged",
        @"roomId" : aChatroom.chatroomId,
        @"announcement" : aAnnouncement
    };
    [self onReceive:ExtSdkMethodKeyChatroomChanged withParams:map];
}

- (void)chatroomWhiteListDidUpdate:(EMChatroom *)aChatroom
             addedWhiteListMembers:(NSArray *)aMembers {
    NSDictionary *map = @{
        @"type" : @"onAllowListAdded",
        @"roomId" : aChatroom.chatroomId,
        @"members" : aMembers
    };
    [self onReceive:ExtSdkMethodKeyChatroomChanged withParams:map];
}

- (void)chatroomWhiteListDidUpdate:(EMChatroom *)aChatroom
           removedWhiteListMembers:(NSArray *)aMembers {
    NSDictionary *map = @{
        @"type" : @"onAllowListRemoved",
        @"roomId" : aChatroom.chatroomId,
        @"members" : aMembers
    };
    [self onReceive:ExtSdkMethodKeyChatroomChanged withParams:map];
}

- (void)chatroomAllMemberMuteChanged:(EMChatroom *)aChatroom
                    isAllMemberMuted:(BOOL)aMuted {
    NSDictionary *map = @{
        @"type" : @"onAllMemberMuteStateChanged",
        @"roomId" : aChatroom.chatroomId,
        @"isMuted" : @(aMuted)
    };
    [self onReceive:ExtSdkMethodKeyChatroomChanged withParams:map];
}

- (void)chatroomSpecificationDidUpdate:(EMChatroom *)aChatroom {
    NSDictionary *map = @{
        @"type" : @"onSpecificationChanged",
        @"room" : [aChatroom toJsonObject]
    };
    [self onReceive:ExtSdkMethodKeyChatroomChanged withParams:map];
}

- (void)chatroomAttributesDidUpdated:(NSString *_Nonnull)roomId
                        attributeMap:
                            (NSDictionary<NSString *, NSString *> *_Nonnull)
                                attributeMap
                                from:(NSString *_Nonnull)fromId {
    NSDictionary *map = @{
        @"type" : @"onAttributesUpdated",
        @"roomId" : roomId,
        @"attributes" : attributeMap,
        @"from" : fromId,
    };
    [self onReceive:ExtSdkMethodKeyChatroomChanged withParams:map];
}

- (void)chatroomAttributesDidRemoved:(NSString *_Nonnull)roomId
                          attributes:
                              (NSArray<__kindof NSString *> *_Nonnull)attributes
                                from:(NSString *_Nonnull)fromId {
    NSDictionary *map = @{
        @"type" : @"onAttributesRemoved",
        @"roomId" : roomId,
        @"removedKeys" : attributes,
        @"from" : fromId,
    };
    [self onReceive:ExtSdkMethodKeyChatroomChanged withParams:map];
}

#pragma mark - EMChatroom Pack Method

// 聊天室成员获取结果转字典
- (NSDictionary *)dictionaryWithCursorResult:(EMCursorResult *)cursorResult {
    NSDictionary *resultDict =
        @{@"data" : cursorResult.list, @"cursor" : cursorResult.cursor};
    return resultDict;
}

@end
