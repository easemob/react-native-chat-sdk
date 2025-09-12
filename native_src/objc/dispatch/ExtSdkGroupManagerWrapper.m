//
//  ExtSdkGroupManagerWrapper.m
//  FlutterTest
//
//  Created by 杜洁鹏 on 2019/10/17.
//  Copyright © 2019 Easemob. All rights reserved.
//

#import "ExtSdkGroupManagerWrapper.h"

#import "ExtSdkToJson.h"

#import "ExtSdkMethodTypeObjc.h"

@interface ExtSdkGroupManagerWrapper () <EMGroupManagerDelegate>

@end

@implementation ExtSdkGroupManagerWrapper

+ (nonnull instancetype)getInstance {
    static ExtSdkGroupManagerWrapper *instance = nil;
    static dispatch_once_t predicate;
    dispatch_once(&predicate, ^{
      instance = [[ExtSdkGroupManagerWrapper alloc] init];
    });
    return instance;
}

- (void)initSdk {
    [EMClient.sharedClient.groupManager removeDelegate:self];
    [EMClient.sharedClient.groupManager addDelegate:self delegateQueue:nil];
}

#pragma mark - Actions

- (void)getGroupWithId:(NSDictionary *)param
        withMethodType:(NSString *)aChannelName
                result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    EMGroup *group = [EMGroup groupWithId:param[@"groupId"]];
    [weakSelf onResult:result
        withMethodType:aChannelName
             withError:nil
            withParams:[group toJsonObject]];
}

- (void)getJoinedGroups:(NSDictionary *)param
         withMethodType:(NSString *)aChannelName
                 result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSArray *joinedGroups =
        [EMClient.sharedClient.groupManager getJoinedGroups];
    NSMutableArray *list = [NSMutableArray array];
    for (EMGroup *group in joinedGroups) {
        [list addObject:[group toJsonObject]];
    }
    [weakSelf onResult:result
        withMethodType:aChannelName
             withError:nil
            withParams:list];
}

- (void)getGroupsWithoutPushNotification:(NSDictionary *)param
                          withMethodType:(NSString *)aChannelName
                                  result:
                                      (nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    EMError *error = nil;
    NSArray *groups = [EMClient.sharedClient.groupManager
        getGroupsWithoutPushNotification:&error];
    NSMutableArray *list = [NSMutableArray array];
    for (EMGroup *group in groups) {
        [list addObject:[group toJsonObject]];
    }
    [weakSelf onResult:result
        withMethodType:aChannelName
             withError:error
            withParams:list];
}

- (void)getJoinedGroupsFromServer:(NSDictionary *)param
                   withMethodType:(NSString *)aChannelName
                           result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    int pageNum = [param[@"pageNum"] intValue];
    int pageSize = [param[@"pageSize"] intValue];
    BOOL needRole = [param[@"needRole"] boolValue];
    BOOL needMemberCount = [param[@"needMemberCount"] boolValue];
    [EMClient.sharedClient.groupManager
        getJoinedGroupsFromServerWithPage:pageNum
                                 pageSize:pageSize
                          needMemberCount:needMemberCount
                                 needRole:needRole
                               completion:^(NSArray<EMGroup *> *aList,
                                            EMError *_Nullable aError) {
                                 NSMutableArray *list = [NSMutableArray array];
                                 for (EMGroup *group in aList) {
                                     [list addObject:[group toJsonObject]];
                                 }
                                 [weakSelf onResult:result
                                     withMethodType:aChannelName
                                          withError:aError
                                         withParams:list];
                               }];
}

- (void)getPublicGroupsFromServer:(NSDictionary *)param
                   withMethodType:(NSString *)aChannelName
                           result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        getPublicGroupsFromServerWithCursor:param[@"cursor"]
                                   pageSize:[param[@"pageSize"] integerValue]
                                 completion:^(EMCursorResult *aResult,
                                              EMError *aError) {
                                   [weakSelf onResult:result
                                       withMethodType:aChannelName
                                            withError:aError
                                           withParams:[aResult toJsonObject]];
                                 }];
}

- (void)createGroup:(NSDictionary *)param
     withMethodType:(NSString *)aChannelName
             result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        createGroupWithSubject:param[@"groupName"]
                   description:param[@"desc"]
                      invitees:param[@"inviteMembers"]
                       message:param[@"inviteReason"]
                       setting:[EMGroupOptions fromJsonObject:param[@"options"]]
                    completion:^(EMGroup *aGroup, EMError *aError) {
                      [weakSelf onResult:result
                          withMethodType:aChannelName
                               withError:aError
                              withParams:[aGroup toJsonObject]];
                    }];
}

- (void)getGroupSpecificationFromServer:(NSDictionary *)param
                         withMethodType:(NSString *)aChannelName
                                 result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *groupId = param[@"groupId"];
    BOOL isFetchMembers = param[@"fetchMembers"] ?: NO;
    [EMClient.sharedClient.groupManager
        getGroupSpecificationFromServerWithId:groupId
                                 fetchMembers:isFetchMembers
                                   completion:^(EMGroup *aGroup,
                                                EMError *aError) {
                                     [weakSelf onResult:result
                                         withMethodType:aChannelName
                                              withError:aError
                                             withParams:[aGroup toJsonObject]];
                                   }];
}

- (void)getGroupMemberListFromServer:(NSDictionary *)param
                      withMethodType:(NSString *)aChannelName
                              result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        getGroupMemberListFromServerWithId:param[@"groupId"]
                                    cursor:param[@"cursor"]
                                  pageSize:[param[@"pageSize"] intValue]
                                completion:^(EMCursorResult *aResult,
                                             EMError *aError) {
                                  [weakSelf onResult:result
                                      withMethodType:aChannelName
                                           withError:aError
                                          withParams:[aResult toJsonObject]];
                                }];
}

- (void)getGroupBlockListFromServer:(NSDictionary *)param
                     withMethodType:(NSString *)aChannelName
                             result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        getGroupBlacklistFromServerWithId:param[@"groupId"]
                               pageNumber:[param[@"pageNum"] intValue]
                                 pageSize:[param[@"pageSize"] intValue]
                               completion:^(NSArray *aList, EMError *aError) {
                                 [weakSelf onResult:result
                                     withMethodType:aChannelName
                                          withError:aError
                                         withParams:aList];
                               }];
}

- (void)getGroupMuteListFromServer:(NSDictionary *)param
                    withMethodType:(NSString *)aChannelName
                            result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        getGroupMuteListFromServerWithId:param[@"groupId"]
                              pageNumber:[param[@"pageNum"] intValue]
                                pageSize:[param[@"pageSize"] intValue]
                              completion:^(NSArray *aList, EMError *aError) {
                                [weakSelf onResult:result
                                    withMethodType:aChannelName
                                         withError:aError
                                        withParams:aList];
                              }];
}

- (void)getGroupWhiteListFromServer:(NSDictionary *)param
                     withMethodType:(NSString *)aChannelName
                             result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        getGroupWhiteListFromServerWithId:param[@"groupId"]
                               completion:^(NSArray *aList, EMError *aError) {
                                 [weakSelf onResult:result
                                     withMethodType:aChannelName
                                          withError:aError
                                         withParams:aList];
                               }];
}

- (void)isMemberInWhiteListFromServer:(NSDictionary *)param
                       withMethodType:(NSString *)aChannelName
                               result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        isMemberInWhiteListFromServerWithGroupId:param[@"groupId"]
                                      completion:^(BOOL inWhiteList,
                                                   EMError *aError) {
                                        [weakSelf onResult:result
                                            withMethodType:aChannelName
                                                 withError:aError
                                                withParams:@(inWhiteList)];
                                      }];
}

- (void)getGroupFileListFromServer:(NSDictionary *)param
                    withMethodType:(NSString *)aChannelName
                            result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        getGroupFileListWithId:param[@"groupId"]
                    pageNumber:[param[@"pageNum"] intValue]
                      pageSize:[param[@"pageSize"] intValue]
                    completion:^(NSArray *aList, EMError *aError) {
                      NSMutableArray *array = [NSMutableArray array];
                      for (EMGroupSharedFile *file in aList) {
                          [array addObject:[file toJsonObject]];
                      }
                      [weakSelf onResult:result
                          withMethodType:aChannelName
                               withError:aError
                              withParams:array];
                    }];
}

- (void)getGroupAnnouncementFromServer:(NSDictionary *)param
                        withMethodType:(NSString *)aChannelName
                                result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        getGroupAnnouncementWithId:param[@"groupId"]
                        completion:^(NSString *aAnnouncement, EMError *aError) {
                          [weakSelf onResult:result
                              withMethodType:aChannelName
                                   withError:aError
                                  withParams:aAnnouncement];
                        }];
}

- (void)addMembers:(NSDictionary *)param
    withMethodType:(NSString *)aChannelName
            result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        addMembers:param[@"members"]
           toGroup:param[@"groupId"]
           message:param[@"welcome"]
        completion:^(EMGroup *aGroup, EMError *aError) {
          [weakSelf onResult:result
              withMethodType:aChannelName
                   withError:aError
                  withParams:[aGroup toJsonObject]];
        }];
}

- (void)inviterUser:(NSDictionary *)param
     withMethodType:(NSString *)aChannelName
             result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        addMembers:param[@"members"]
           toGroup:param[@"groupId"]
           message:param[@"reason"]
        completion:^(EMGroup *aGroup, EMError *aError) {
          [weakSelf onResult:result
              withMethodType:aChannelName
                   withError:aError
                  withParams:[aGroup toJsonObject]];
        }];
}

- (void)removeMembers:(NSDictionary *)param
       withMethodType:(NSString *)aChannelName
               result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        removeMembers:param[@"members"]
            fromGroup:param[@"groupId"]
           completion:^(EMGroup *aGroup, EMError *aError) {
             [weakSelf onResult:result
                 withMethodType:aChannelName
                      withError:aError
                     withParams:[aGroup toJsonObject]];
           }];
}

- (void)blockMembers:(NSDictionary *)param
      withMethodType:(NSString *)aChannelName
              result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        blockMembers:param[@"members"]
           fromGroup:param[@"groupId"]
          completion:^(EMGroup *aGroup, EMError *aError) {
            [weakSelf onResult:result
                withMethodType:aChannelName
                     withError:aError
                    withParams:[aGroup toJsonObject]];
          }];
}

- (void)unblockMembers:(NSDictionary *)param
        withMethodType:(NSString *)aChannelName
                result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        unblockMembers:param[@"members"]
             fromGroup:param[@"groupId"]
            completion:^(EMGroup *aGroup, EMError *aError) {
              [weakSelf onResult:result
                  withMethodType:aChannelName
                       withError:aError
                      withParams:[aGroup toJsonObject]];
            }];
}

- (void)updateGroupSubject:(NSDictionary *)param
            withMethodType:(NSString *)aChannelName
                    result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        updateGroupSubject:param[@"name"]
                  forGroup:param[@"groupId"]
                completion:^(EMGroup *aGroup, EMError *aError) {
                  [weakSelf onResult:result
                      withMethodType:aChannelName
                           withError:aError
                          withParams:[aGroup toJsonObject]];
                }];
}

- (void)updateDescription:(NSDictionary *)param
           withMethodType:(NSString *)aChannelName
                   result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        updateDescription:param[@"desc"]
                 forGroup:param[@"groupId"]
               completion:^(EMGroup *aGroup, EMError *aError) {
                 [weakSelf onResult:result
                     withMethodType:aChannelName
                          withError:aError
                         withParams:[aGroup toJsonObject]];
               }];
}

- (void)leaveGroup:(NSDictionary *)param
    withMethodType:(NSString *)aChannelName
            result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager leaveGroup:param[@"groupId"]
                                        completion:^(EMError *aError) {
                                          [weakSelf onResult:result
                                              withMethodType:aChannelName
                                                   withError:aError
                                                  withParams:nil];
                                        }];
}

- (void)destroyGroup:(NSDictionary *)param
      withMethodType:(NSString *)aChannelName
              result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager destroyGroup:param[@"groupId"]
                                    finishCompletion:^(EMError *aError) {
                                      [weakSelf onResult:result
                                          withMethodType:aChannelName
                                               withError:aError
                                              withParams:nil];
                                    }];
}

- (void)blockGroup:(NSDictionary *)param
    withMethodType:(NSString *)aChannelName
            result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        blockGroup:param[@"groupId"]
        completion:^(EMGroup *aGroup, EMError *aError) {
          [weakSelf onResult:result
              withMethodType:aChannelName
                   withError:aError
                  withParams:[aGroup toJsonObject]];
        }];
}

- (void)unblockGroup:(NSDictionary *)param
      withMethodType:(NSString *)aChannelName
              result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        unblockGroup:param[@"groupId"]
          completion:^(EMGroup *aGroup, EMError *aError) {
            [weakSelf onResult:result
                withMethodType:aChannelName
                     withError:aError
                    withParams:[aGroup toJsonObject]];
          }];
}

- (void)updateGroupOwner:(NSDictionary *)param
          withMethodType:(NSString *)aChannelName
                  result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        updateGroupOwner:param[@"groupId"]
                newOwner:param[@"owner"]
              completion:^(EMGroup *aGroup, EMError *aError) {
                [weakSelf onResult:result
                    withMethodType:aChannelName
                         withError:aError
                        withParams:[aGroup toJsonObject]];
              }];
}

- (void)addAdmin:(NSDictionary *)param
    withMethodType:(NSString *)aChannelName
            result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
          addAdmin:param[@"admin"]
           toGroup:param[@"groupId"]
        completion:^(EMGroup *aGroup, EMError *aError) {
          [weakSelf onResult:result
              withMethodType:aChannelName
                   withError:aError
                  withParams:[aGroup toJsonObject]];
        }];
}

- (void)removeAdmin:(NSDictionary *)param
     withMethodType:(NSString *)aChannelName
             result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        removeAdmin:param[@"admin"]
          fromGroup:param[@"groupId"]
         completion:^(EMGroup *aGroup, EMError *aError) {
           [weakSelf onResult:result
               withMethodType:aChannelName
                    withError:aError
                   withParams:[aGroup toJsonObject]];
         }];
}

- (void)muteMembers:(NSDictionary *)param
     withMethodType:(NSString *)aChannelName
             result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
             muteMembers:param[@"members"]
        muteMilliseconds:[param[@"duration"] integerValue]
               fromGroup:param[@"groupId"]
              completion:^(EMGroup *aGroup, EMError *aError) {
                [weakSelf onResult:result
                    withMethodType:aChannelName
                         withError:aError
                        withParams:[aGroup toJsonObject]];
              }];
}

- (void)unMuteMembers:(NSDictionary *)param
       withMethodType:(NSString *)aChannelName
               result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        unmuteMembers:param[@"members"]
            fromGroup:param[@"groupId"]
           completion:^(EMGroup *aGroup, EMError *aError) {
             [weakSelf onResult:result
                 withMethodType:aChannelName
                      withError:aError
                     withParams:[aGroup toJsonObject]];
           }];
}

- (void)muteAllMembers:(NSDictionary *)param
        withMethodType:(NSString *)aChannelName
                result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        muteAllMembersFromGroup:param[@"groupId"]
                     completion:^(EMGroup *aGroup, EMError *aError) {
                       [weakSelf onResult:result
                           withMethodType:aChannelName
                                withError:aError
                               withParams:[aGroup toJsonObject]];
                     }];
}

- (void)unMuteAllMembers:(NSDictionary *)param
          withMethodType:(NSString *)aChannelName
                  result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        unmuteAllMembersFromGroup:param[@"groupId"]
                       completion:^(EMGroup *aGroup, EMError *aError) {
                         [weakSelf onResult:result
                             withMethodType:aChannelName
                                  withError:aError
                                 withParams:[aGroup toJsonObject]];
                       }];
}

- (void)addWhiteList:(NSDictionary *)param
      withMethodType:(NSString *)aChannelName
              result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        addWhiteListMembers:param[@"members"]
                  fromGroup:param[@"groupId"]
                 completion:^(EMGroup *aGroup, EMError *aError) {
                   [weakSelf onResult:result
                       withMethodType:aChannelName
                            withError:aError
                           withParams:[aGroup toJsonObject]];
                 }];
}

- (void)removeWhiteList:(NSDictionary *)param
         withMethodType:(NSString *)aChannelName
                 result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        removeWhiteListMembers:param[@"members"]
                     fromGroup:param[@"groupId"]
                    completion:^(EMGroup *aGroup, EMError *aError) {
                      [weakSelf onResult:result
                          withMethodType:aChannelName
                               withError:aError
                              withParams:[aGroup toJsonObject]];
                    }];
}

- (void)uploadGroupSharedFile:(NSDictionary *)param
               withMethodType:(NSString *)aChannelName
                       result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *groupId = param[@"groupId"];
    NSString *filePath = param[@"filePath"];
    [EMClient.sharedClient.groupManager uploadGroupSharedFileWithId:groupId
        filePath:filePath
        progress:^(int progress) {
          [weakSelf onReceive:ExtSdkMethodKeyUploadGroupSharedFile
                   withParams:@{
                       @"progress" : @(progress),
                       @"groupId" : groupId,
                       @"filePath" : filePath,
                       @"callbackType" : ExtSdkMethodKeyOnMessageProgressUpdate
                   }];
        }
        completion:^(EMGroupSharedFile *aSharedFile, EMError *aError) {
          if (aError) {
              [weakSelf onReceive:ExtSdkMethodKeyUploadGroupSharedFile
                       withParams:@{
                           @"error" : [aError toJsonObject],
                           @"groupId" : groupId,
                           @"filePath" : filePath,
                           @"callbackType" : ExtSdkMethodKeyOnMessageError
                       }];
          } else {
              [weakSelf onReceive:ExtSdkMethodKeyUploadGroupSharedFile
                       withParams:@{
                           @"groupId" : groupId,
                           @"filePath" : filePath,
                           @"callbackType" : ExtSdkMethodKeyOnMessageSuccess
                       }];
          }
        }];
    [self onResult:result
        withMethodType:aChannelName
             withError:nil
            withParams:nil];
}

- (void)downloadGroupSharedFile:(NSDictionary *)param
                 withMethodType:(NSString *)aChannelName
                         result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *groupId = param[@"groupId"];
    NSString *savePath = param[@"savePath"];
    NSString *fileId = param[@"fileId"];
    [EMClient.sharedClient.groupManager downloadGroupSharedFileWithId:groupId
        filePath:savePath
        sharedFileId:fileId
        progress:^(int progress) {
          [weakSelf onReceive:ExtSdkMethodKeyDownloadGroupSharedFile
                   withParams:@{
                       @"progress" : @(progress),
                       @"groupId" : groupId,
                       @"filePath" : savePath,
                       @"callbackType" : ExtSdkMethodKeyOnMessageProgressUpdate
                   }];
        }
        completion:^(EMGroup *aGroup, EMError *aError) {
          if (aError) {
              [weakSelf onReceive:ExtSdkMethodKeyDownloadGroupSharedFile
                       withParams:@{
                           @"error" : [aError toJsonObject],
                           @"groupId" : groupId,
                           @"filePath" : savePath,
                           @"callbackType" : ExtSdkMethodKeyOnMessageError
                       }];
          } else {
              [weakSelf onReceive:ExtSdkMethodKeyDownloadGroupSharedFile
                       withParams:@{
                           @"groupId" : groupId,
                           @"filePath" : savePath,
                           @"callbackType" : ExtSdkMethodKeyOnMessageSuccess
                       }];
          }
        }];
    [self onResult:result
        withMethodType:aChannelName
             withError:nil
            withParams:nil];
}

- (void)removeGroupSharedFile:(NSDictionary *)param
               withMethodType:(NSString *)aChannelName
                       result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        removeGroupSharedFileWithId:param[@"groupId"]
                       sharedFileId:param[@"fileId"]
                         completion:^(EMGroup *aGroup, EMError *aError) {
                           [weakSelf onResult:result
                               withMethodType:aChannelName
                                    withError:aError
                                   withParams:@(!aError)];
                         }];
}

- (void)updateGroupAnnouncement:(NSDictionary *)param
                 withMethodType:(NSString *)aChannelName
                         result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        updateGroupAnnouncementWithId:param[@"groupId"]
                         announcement:param[@"announcement"]
                           completion:^(EMGroup *aGroup, EMError *aError) {
                             [weakSelf onResult:result
                                 withMethodType:aChannelName
                                      withError:aError
                                     withParams:[aGroup toJsonObject]];
                           }];
}

- (void)updateGroupExt:(NSDictionary *)param
        withMethodType:(NSString *)aChannelName
                result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        updateGroupExtWithId:param[@"groupId"]
                         ext:param[@"ext"]
                  completion:^(EMGroup *aGroup, EMError *aError) {
                    [weakSelf onResult:result
                        withMethodType:aChannelName
                             withError:aError
                            withParams:[aGroup toJsonObject]];
                  }];
}

- (void)joinPublicGroup:(NSDictionary *)param
         withMethodType:(NSString *)aChannelName
                 result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        joinPublicGroup:param[@"groupId"]
             completion:^(EMGroup *aGroup, EMError *aError) {
               [weakSelf onResult:result
                   withMethodType:aChannelName
                        withError:aError
                       withParams:[aGroup toJsonObject]];
             }];
}

- (void)requestToJoinPublicGroup:(NSDictionary *)param
                  withMethodType:(NSString *)aChannelName
                          result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        requestToJoinPublicGroup:param[@"groupId"]
                         message:param[@"reason"]
                      completion:^(EMGroup *aGroup, EMError *aError) {
                        [weakSelf onResult:result
                            withMethodType:aChannelName
                                 withError:aError
                                withParams:[aGroup toJsonObject]];
                      }];
}

- (void)acceptJoinApplication:(NSDictionary *)param
               withMethodType:(NSString *)aChannelName
                       result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        approveJoinGroupRequest:param[@"groupId"]
                         sender:param[@"username"]
                     completion:^(EMGroup *aGroup, EMError *aError) {
                       [weakSelf onResult:result
                           withMethodType:aChannelName
                                withError:aError
                               withParams:[aGroup toJsonObject]];
                     }];
}

- (void)declineJoinApplication:(NSDictionary *)param
                withMethodType:(NSString *)aChannelName
                        result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        declineJoinGroupRequest:param[@"groupId"]
                         sender:param[@"username"]
                         reason:param[@"reason"]
                     completion:^(EMGroup *aGroup, EMError *aError) {
                       [weakSelf onResult:result
                           withMethodType:aChannelName
                                withError:aError
                               withParams:[aGroup toJsonObject]];
                     }];
}

- (void)acceptInvitationFromGroup:(NSDictionary *)param
                   withMethodType:(NSString *)aChannelName
                           result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        acceptInvitationFromGroup:param[@"groupId"]
                          inviter:param[@"inviter"]
                       completion:^(EMGroup *aGroup, EMError *aError) {
                         [weakSelf onResult:result
                             withMethodType:aChannelName
                                  withError:aError
                                 withParams:[aGroup toJsonObject]];
                       }];
}

- (void)declineInvitationFromGroup:(NSDictionary *)param
                    withMethodType:(NSString *)aChannelName
                            result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        declineGroupInvitation:param[@"groupId"]
                       inviter:param[@"inviter"]
                        reason:param[@"reason"]
                    completion:^(EMError *aError) {
                      [weakSelf onResult:result
                          withMethodType:aChannelName
                               withError:aError
                              withParams:nil];
                    }];
}

- (void)setMemberAttribute:(NSDictionary *)param
            withMethodType:(NSString *)aChannelName
                    result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *groupId = param[@"groupId"];
    NSString *userId = param[@"member"];
    NSDictionary *attributes = param[@"attributes"];
    [EMClient.sharedClient.groupManager
        setMemberAttribute:groupId
                    userId:userId
                attributes:attributes
                completion:^(EMError *_Nullable error) {
                  [weakSelf onResult:result
                      withMethodType:aChannelName
                           withError:error
                          withParams:nil];
                }];
}

- (void)fetchMemberAttributes:(NSDictionary *)param
               withMethodType:(NSString *)aChannelName
                       result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;

    NSString *groupId = param[@"groupId"];
    NSString *userId = param[@"member"];

    [EMClient.sharedClient.groupManager
        fetchMemberAttribute:groupId
                      userId:userId
                  completion:^(
                      NSDictionary<NSString *, NSString *> *_Nullable data,
                      EMError *_Nullable error) {
                    [weakSelf onResult:result
                        withMethodType:aChannelName
                             withError:error
                            withParams:data];
                  }];
}

- (void)fetchMembersAttributes:(NSDictionary *)param
                withMethodType:(NSString *)aChannelName
                        result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;

    NSString *groupId = param[@"groupId"];
    NSArray<NSString *> *userIds = param[@"members"];
    NSArray<NSString *> *keys = param[@"keys"];
    [EMClient.sharedClient.groupManager
        fetchMembersAttributes:groupId
                       userIds:userIds
                          keys:keys
                    completion:^(
                        NSDictionary<NSString *,
                                     NSDictionary<NSString *, NSString *> *>
                            *_Nullable attributes,
                        EMError *_Nullable error) {
                      [weakSelf onResult:result
                          withMethodType:aChannelName
                               withError:error
                              withParams:attributes];
                    }];
}

- (void)fetchJoinedGroupCount:(NSDictionary *)param
               withMethodType:(NSString *)aChannelName
                       result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.groupManager
        getJoinedGroupsCountFromServerWithCompletion:^(
            NSInteger groupCount, EMError *_Nullable aError) {
          [weakSelf onResult:result
              withMethodType:aChannelName
                   withError:aError
                  withParams:@(groupCount)];
        }];
}

#pragma mark - EMGroupManagerDelegate

- (void)groupInvitationDidReceive:(NSString *_Nonnull)aGroupId
                        groupName:(NSString *_Nonnull)aGroupName
                          inviter:(NSString *_Nonnull)aInviter
                          message:(NSString *_Nullable)aMessage {
    NSDictionary *map = @{
        @"type" : @"onInvitationReceived",
        @"groupId" : aGroupId,
        @"groupName" : aGroupName,
        @"inviter" : aInviter,
        @"message" : aMessage
    };
    [self onReceive:ExtSdkMethodKeyOnGroupChanged withParams:map];
}

- (void)groupInvitationDidAccept:(EMGroup *)aGroup
                         invitee:(NSString *)aInvitee {
    NSDictionary *map = @{
        @"type" : @"onInvitationAccepted",
        @"groupId" : aGroup.groupId,
        @"invitee" : aInvitee
    };
    [self onReceive:ExtSdkMethodKeyOnGroupChanged withParams:map];
}

- (void)groupInvitationDidDecline:(EMGroup *)aGroup
                          invitee:(NSString *)aInvitee
                           reason:(NSString *)aReason {
    NSDictionary *map = @{
        @"type" : @"onInvitationDeclined",
        @"groupId" : aGroup.groupId,
        @"invitee" : aInvitee,
        @"reason" : aReason
    };
    [self onReceive:ExtSdkMethodKeyOnGroupChanged withParams:map];
}

- (void)didJoinGroup:(EMGroup *)aGroup
             inviter:(NSString *)aInviter
             message:(NSString *)aMessage {
    NSDictionary *map = @{
        @"type" : @"onAutoAcceptInvitationFromGroup",
        @"groupId" : aGroup.groupId,
        @"message" : aMessage,
        @"inviter" : aInviter
    };
    [self onReceive:ExtSdkMethodKeyOnGroupChanged withParams:map];
}

- (void)didLeaveGroup:(EMGroup *)aGroup reason:(EMGroupLeaveReason)aReason {
    NSString *type;
    if (aReason == EMGroupLeaveReasonBeRemoved) {
        type = @"onUserRemoved";
    } else if (aReason == EMGroupLeaveReasonDestroyed) {
        type = @"onGroupDestroyed";
    }
    NSDictionary *map = @{
        @"type" : type,
        @"groupId" : aGroup.groupId,
        @"groupName" : aGroup.groupName
    };
    [self onReceive:ExtSdkMethodKeyOnGroupChanged withParams:map];
}

- (void)joinGroupRequestDidReceive:(EMGroup *)aGroup
                              user:(NSString *)aUsername
                            reason:(NSString *)aReason {
    NSDictionary *map = @{
        @"type" : @"onRequestToJoinReceived",
        @"groupId" : aGroup.groupId,
        @"applicant" : aUsername,
        @"reason" : aReason
    };
    [self onReceive:ExtSdkMethodKeyOnGroupChanged withParams:map];
}

- (void)joinGroupRequestDidDecline:(NSString *)aGroupId
                            reason:(NSString *)aReason {
    //    NSDictionary *map = @{
    //        @"type" : @"onRequestToJoinDeclined",
    //        @"groupId" : aGroupId,
    //        @"reason" : aReason
    //    };
    //    [self onReceive:ExtSdkMethodKeyOnGroupChanged withParams:map];
}

- (void)joinGroupRequestDidDecline:(NSString *_Nonnull)aGroupId
                            reason:(NSString *_Nullable)aReason
                          decliner:(NSString *_Nullable)aDecliner
                         applicant:(NSString *_Nonnull)aApplicant {
    NSDictionary *map = @{
        @"type" : @"onRequestToJoinDeclined",
        @"groupId" : aGroupId,
        @"applicant" : aApplicant,
        @"reason" : aReason
    };
    [self onReceive:ExtSdkMethodKeyOnGroupChanged withParams:map];
}

- (void)joinGroupRequestDidApprove:(EMGroup *)aGroup {
    NSDictionary *map = @{
        @"type" : @"onRequestToJoinAccepted",
        @"groupId" : aGroup.groupId,
        @"groupName" : aGroup.groupName,
        @"accepter" : aGroup.owner,
    };
    [self onReceive:ExtSdkMethodKeyOnGroupChanged withParams:map];
}

- (void)groupMuteListDidUpdate:(EMGroup *)aGroup
             addedMutedMembers:(NSArray *)aMutedMembers
                    muteExpire:(NSInteger)aMuteExpire {
    NSDictionary *map = @{
        @"type" : @"onMuteListAdded",
        @"groupId" : aGroup.groupId,
        @"mutes" : aMutedMembers,
        @"muteExpire" : [NSNumber numberWithInteger:aMuteExpire]
    };
    [self onReceive:ExtSdkMethodKeyOnGroupChanged withParams:map];
}

- (void)groupMuteListDidUpdate:(EMGroup *)aGroup
           removedMutedMembers:(NSArray *)aMutedMembers {
    NSDictionary *map = @{
        @"type" : @"onMuteListRemoved",
        @"groupId" : aGroup.groupId,
        @"mutes" : aMutedMembers
    };
    [self onReceive:ExtSdkMethodKeyOnGroupChanged withParams:map];
}

- (void)groupWhiteListDidUpdate:(EMGroup *)aGroup
          addedWhiteListMembers:(NSArray *)aMembers {
    NSDictionary *map = @{
        @"type" : @"onAllowListAdded",
        @"groupId" : aGroup.groupId,
        @"members" : aMembers
    };
    [self onReceive:ExtSdkMethodKeyOnGroupChanged withParams:map];
}

- (void)groupWhiteListDidUpdate:(EMGroup *)aGroup
        removedWhiteListMembers:(NSArray *)aMembers {
    NSDictionary *map = @{
        @"type" : @"onAllowListRemoved",
        @"groupId" : aGroup.groupId,
        @"members" : aMembers
    };
    [self onReceive:ExtSdkMethodKeyOnGroupChanged withParams:map];
}

- (void)groupAllMemberMuteChanged:(EMGroup *)aGroup
                 isAllMemberMuted:(BOOL)aMuted {
    NSDictionary *map = @{
        @"type" : @"onAllMemberMuteStateChanged",
        @"groupId" : aGroup.groupId,
        @"isMuted" : @(aMuted)
    };
    [self onReceive:ExtSdkMethodKeyOnGroupChanged withParams:map];
}

- (void)groupAdminListDidUpdate:(EMGroup *)aGroup
                     addedAdmin:(NSString *)aAdmin {
    NSDictionary *map = @{
        @"type" : @"onAdminAdded",
        @"groupId" : aGroup.groupId,
        @"administrator" : aAdmin
    };
    [self onReceive:ExtSdkMethodKeyOnGroupChanged withParams:map];
}

- (void)groupAdminListDidUpdate:(EMGroup *)aGroup
                   removedAdmin:(NSString *)aAdmin {
    NSDictionary *map = @{
        @"type" : @"onAdminRemoved",
        @"groupId" : aGroup.groupId,
        @"administrator" : aAdmin
    };
    [self onReceive:ExtSdkMethodKeyOnGroupChanged withParams:map];
}

- (void)groupOwnerDidUpdate:(EMGroup *)aGroup
                   newOwner:(NSString *)aNewOwner
                   oldOwner:(NSString *)aOldOwner {
    NSDictionary *map = @{
        @"type" : @"onOwnerChanged",
        @"groupId" : aGroup.groupId,
        @"newOwner" : aNewOwner,
        @"oldOwner" : aOldOwner
    };
    [self onReceive:ExtSdkMethodKeyOnGroupChanged withParams:map];
}

- (void)userDidJoinGroup:(EMGroup *)aGroup user:(NSString *)aUsername {
    NSDictionary *map = @{
        @"type" : @"onMemberJoined",
        @"groupId" : aGroup.groupId,
        @"member" : aUsername
    };
    [self onReceive:ExtSdkMethodKeyOnGroupChanged withParams:map];
}

- (void)userDidLeaveGroup:(EMGroup *)aGroup user:(NSString *)aUsername {
    NSDictionary *map = @{
        @"type" : @"onMemberExited",
        @"groupId" : aGroup.groupId,
        @"member" : aUsername
    };
    [self onReceive:ExtSdkMethodKeyOnGroupChanged withParams:map];
}

- (void)groupAnnouncementDidUpdate:(EMGroup *)aGroup
                      announcement:(NSString *)aAnnouncement {
    NSDictionary *map = @{
        @"type" : @"onAnnouncementChanged",
        @"groupId" : aGroup.groupId,
        @"announcement" : aAnnouncement
    };
    [self onReceive:ExtSdkMethodKeyOnGroupChanged withParams:map];
}

- (void)groupFileListDidUpdate:(EMGroup *)aGroup
               addedSharedFile:(EMGroupSharedFile *)aSharedFile {
    NSDictionary *map = @{
        @"type" : @"onSharedFileAdded",
        @"groupId" : aGroup.groupId,
        @"sharedFile" : [aSharedFile toJsonObject]
    };
    [self onReceive:ExtSdkMethodKeyOnGroupChanged withParams:map];
}

- (void)groupFileListDidUpdate:(EMGroup *)aGroup
             removedSharedFile:(NSString *)aFileId {
    NSDictionary *map = @{
        @"type" : @"onSharedFileDeleted",
        @"groupId" : aGroup.groupId,
        @"fileId" : aFileId
    };
    [self onReceive:ExtSdkMethodKeyOnGroupChanged withParams:map];
}

- (void)groupSpecificationDidUpdate:(EMGroup *)aGroup {
    NSDictionary *map = @{
        @"type" : @"onSpecificationChanged",
        @"group" : [aGroup toJsonObject],
    };
    [self onReceive:ExtSdkMethodKeyOnGroupChanged withParams:map];
}

- (void)groupStateChanged:(EMGroup *)aGroup isDisabled:(BOOL)aDisabled {
    NSDictionary *map = @{
        @"type" : @"onStateChanged",
        @"group" : [aGroup toJsonObject],
    };
    [self onReceive:ExtSdkMethodKeyOnGroupChanged withParams:map];
}

- (void)onAttributesChangedOfGroupMember:(NSString *_Nonnull)groupId
                                  userId:(NSString *_Nonnull)userId
                              attributes:(NSDictionary<NSString *, NSString *>
                                              *_Nullable)attributes
                              operatorId:(NSString *_Nonnull)operatorId {
    NSDictionary *map = @{
        @"type" : @"onMemberAttributesChanged",
        @"groupId" : groupId,
        @"member" : userId,
        @"attributes" : attributes,
        @"operator" : operatorId,
    };
    [self onReceive:ExtSdkMethodKeyOnGroupChanged withParams:map];
}

@end
