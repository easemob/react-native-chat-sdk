//
//  ExtSdkToJson.h
//  im_flutter_sdk
//
//  Created by 杜洁鹏 on 2020/9/27.
//

#import <Foundation/Foundation.h>

#import <HyphenateChat/EMChatMessage.h>
#import <HyphenateChat/EMChatThread.h>
#import <HyphenateChat/EMChatThreadEvent.h>
#import <HyphenateChat/EMChatroom.h>
#import <HyphenateChat/EMContact.h>
#import <HyphenateChat/EMConversation.h>
#import <HyphenateChat/EMConversationFilter.h>
#import <HyphenateChat/EMCursorResult.h>
#import <HyphenateChat/EMDeviceConfig.h>
#import <HyphenateChat/EMError.h>
#import <HyphenateChat/EMFetchServerMessagesOption.h>
#import <HyphenateChat/EMFileMessageBody.h>
#import <HyphenateChat/EMGroup.h>
#import <HyphenateChat/EMGroupMemberInfo.h>
#import <HyphenateChat/EMGroupMessageAck.h>
#import <HyphenateChat/EMGroupOptions.h>
#import <HyphenateChat/EMGroupSharedFile.h>
#import <HyphenateChat/EMMessageBody.h>
#import <HyphenateChat/EMMessageReaction.h>
#import <HyphenateChat/EMMessageReactionChange.h>
#import <HyphenateChat/EMMessageReactionOperation.h>
#import <HyphenateChat/EMOptions.h>
#import <HyphenateChat/EMPageResult.h>
#import <HyphenateChat/EMPresence.h>
#import <HyphenateChat/EMPushOptions.h>
#import <HyphenateChat/EMRecallMessageInfo.h>
#import <HyphenateChat/EMSilentModeParam.h>
#import <HyphenateChat/EMSilentModeResult.h>
#import <HyphenateChat/EMSilentModeTime.h>
#import <HyphenateChat/EMTranslateLanguage.h>
#import <HyphenateChat/EMUserInfo.h>

NS_ASSUME_NONNULL_BEGIN

@interface ExtSdkConvertHelper : NSObject
+ (int)conversationTypeToInt:(EMConversationType)aType;
+ (EMConversationType)conversationTypeFromInt:(int)aType;
+ (int)roomPremissionTypeToInt:(EMChatroomPermissionType)type;
+ (EMGroupPermissionType)groupPremissionTypeFromInt:(int)type;
+ (int)groupPremissionTypeToInt:(EMGroupPermissionType)type;
+ (EMGroupStyle)groupStyleFromInt:(int)style;
+ (int)groupStyleToInt:(EMGroupStyle)style;
+ (EMChatType)chatTypeFromInt:(int)aType;
+ (int)chatTypeToInt:(EMChatType)aType;
+ (EMChatRoomMessagePriority)priorityFromInt:(int)priority;
+ (int)priorityToInt:(EMChatRoomMessagePriority)priority;
+ (EMMessageBodyType)messageBodyFromString:(NSString *)aStrType;
+ (NSString *)messageBodyToString:(EMMessageBodyType)type;
+ (AreaCode)AreaCodeFromInt:(int)code;
+ (EMSilentModeParamType)slientModeParamTypeFromInt:(int)iParamType;
+ (EMPushRemindType)remindTypeFromInt:(int)iRemindTime;
+ (int)remindTypeToInt:(EMPushRemindType)type;
+ (EMMessageStatus)messageStatusFromInt:(int)aStatus;
+ (int)messageStatusToInt:(EMMessageStatus)aStatus;
+ (EMDownloadStatus)downloadStatusFromInt:(int)aStatus;
+ (int)downloadStatusToInt:(EMDownloadStatus)aStatus;
+ (int)threadOperationToInt:(EMThreadOperation)aType;
+ (EMMessageSearchDirection)searchDirectionFromString:(NSString *)aType;
+ (NSString *)searchDirectionToString:(EMMessageSearchDirection)direction;
+ (EMMessageSearchScope)searchScopeFromInt:(int)aType;
+ (int)searchScopeToInt:(EMMessageSearchScope)scope;
@end

@protocol ExtSdkToJson <NSObject>
- (NSDictionary *)toJsonObject;
@end

@interface EMChatroom (Json) <ExtSdkToJson>
- (NSDictionary *)toJsonObject;
@end

@interface EMConversation (Json) <ExtSdkToJson>
- (NSDictionary *)toJsonObject;
@end

@interface EMCursorResult (Json) <ExtSdkToJson>
- (NSDictionary *)toJsonObject;
@end

@interface EMDeviceConfig (Json) <ExtSdkToJson>
- (NSDictionary *)toJsonObject;
@end

@interface EMError (Json) <ExtSdkToJson>
- (NSDictionary *)toJsonObject;
@end

@interface EMGroup (Json) <ExtSdkToJson>
- (NSDictionary *)toJsonObject;
@end

@interface EMGroupOptions (Json) <ExtSdkToJson>
+ (EMGroupOptions *)fromJsonObject:(NSDictionary *)dict;
- (NSDictionary *)toJsonObject;
@end

@interface EMGroupSharedFile (Json) <ExtSdkToJson>
- (NSDictionary *)toJsonObject;
@end

@interface EMGroupMessageAck (Json) <ExtSdkToJson>
- (NSDictionary *)toJsonObject;
@end

@interface EMChatMessage (Json) <ExtSdkToJson>
+ (EMChatMessage *)fromJsonObject:(NSDictionary *)aJson;
- (NSDictionary *)toJsonObject;
@end

@interface EMMessageBody (Json) <ExtSdkToJson>
+ (EMMessageBody *)fromJsonObject:(NSDictionary *)aJson;
- (NSDictionary *)toJsonObject;
@end

@interface EMOptions (Json) <ExtSdkToJson>
- (NSDictionary *)toJsonObject;
+ (EMOptions *)fromJsonObject:(NSDictionary *)aJson;
@end

@interface EMPageResult (Json) <ExtSdkToJson>
- (NSDictionary *)toJsonObject;
@end

@interface EMPresence (Helper) <ExtSdkToJson>
- (NSDictionary *)toJsonObject;
@end

@interface EMPushOptions (Json) <ExtSdkToJson>
- (NSDictionary *)toJsonObject;
@end

@interface EMUserInfo (Json) <ExtSdkToJson>
- (NSDictionary *)toJsonObject;
+ (EMUserInfo *)fromJsonObject:(NSDictionary *)aJson;
@end

@interface EMTranslateLanguage (Json) <ExtSdkToJson>
- (NSDictionary *)toJsonObject;
@end

@interface NSArray (Json)
- (NSArray *)toJsonArray;
@end

@interface EMMessageReactionOperation (Json) <ExtSdkToJson>
- (NSDictionary *)toJsonObject;
@end

@interface EMMessageReaction (Json) <ExtSdkToJson>
- (NSDictionary *)toJsonObject;
@end

@interface EMMessageReactionChange (Json) <ExtSdkToJson>
- (NSDictionary *)toJsonObject;
@end

@interface EMChatThread (Json) <ExtSdkToJson>
- (NSDictionary *)toJsonObject;
@end

@interface EMChatThreadEvent (Json) <ExtSdkToJson>
- (NSDictionary *)toJsonObject;
@end

@interface EMSilentModeParam (Json)
+ (EMSilentModeParam *)fromJsonObject:(NSDictionary *)dict;
@end

@interface EMSilentModeResult (Json) <ExtSdkToJson>
- (NSDictionary *)toJsonObject;
@end

@interface EMSilentModeTime (Json) <ExtSdkToJson>
+ (EMSilentModeTime *)fromJsonObject:(NSDictionary *)dict;
- (NSDictionary *)toJsonObject;
@end

@interface EMFetchServerMessagesOption (Json) <ExtSdkToJson>
+ (EMFetchServerMessagesOption *)fromJsonObject:(NSDictionary *)dict;
- (NSDictionary *)toJsonObject;
@end

@interface EMContact (Json) <ExtSdkToJson>
+ (EMContact *)fromJsonObject:(NSDictionary *)dict;
- (NSDictionary *)toJsonObject;
@end

@interface EMConversationFilter (Json)
+ (EMConversationFilter *)fromJsonObject:(NSDictionary *)dict;
+ (NSString *)getCursor:(NSDictionary *)dict;
+ (BOOL)getPinned:(NSDictionary *)dict;
+ (BOOL)hasMark:(NSDictionary *)dict;
+ (NSInteger)pageSize:(NSDictionary *)dict;
@end

@interface EMMessagePinInfo (Json) <ExtSdkToJson>
+ (EMMessagePinInfo *)fromJsonObject:(NSDictionary *)dict;
- (NSDictionary *)toJsonObject;
@end

@interface EMRecallMessageInfo (Json) <ExtSdkToJson>
+ (EMRecallMessageInfo *)fromJsonObject:(NSDictionary *)dict;
- (NSDictionary *)toJsonObject;
@end

@interface EMGroupMemberInfo (Json) <ExtSdkToJson>
- (NSDictionary *)toJsonObject;
@end

NS_ASSUME_NONNULL_END
