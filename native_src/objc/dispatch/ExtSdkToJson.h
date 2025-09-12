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
#import <HyphenateChat/EMGroup.h>
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
#import <HyphenateChat/EMSilentModeParam.h>
#import <HyphenateChat/EMSilentModeResult.h>
#import <HyphenateChat/EMSilentModeTime.h>
#import <HyphenateChat/EMTranslateLanguage.h>
#import <HyphenateChat/EMUserInfo.h>

NS_ASSUME_NONNULL_BEGIN

@protocol ExtSdkToJson <NSObject>
- (NSDictionary *)toJsonObject;
@end

@interface EMChatroom (Json) <ExtSdkToJson>
- (NSDictionary *)toJsonObject;
@end

@interface EMConversation (Json) <ExtSdkToJson>
- (NSDictionary *)toJsonObject;
+ (int)typeToInt:(EMConversationType)aType;
+ (EMConversationType)typeFromInt:(int)aType;
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
+ (EMGroupPermissionType)premissionTypeFromInt:(int)type;
+ (int)premissionTypeToInt:(EMGroupPermissionType)type;
@end

@interface EMGroupOptions (Json) <ExtSdkToJson>
+ (EMGroupOptions *)fromJsonObject:(NSDictionary *)dict;
- (NSDictionary *)toJsonObject;
+ (EMGroupStyle)styleFromInt:(int)style;
+ (int)styleToInt:(EMGroupStyle)style;
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
+ (EMChatType)chatTypeFromInt:(int)aType;
+ (int)chatTypeToInt:(EMChatType)aType;
+ (EMChatRoomMessagePriority)priorityFromInt:(int)priority;
+ (int)priorityToInt:(EMChatRoomMessagePriority)priority;
@end

@interface EMMessageBody (Json) <ExtSdkToJson>
+ (EMMessageBody *)fromJsonObject:(NSDictionary *)aJson;
- (NSDictionary *)toJsonObject;
+ (EMMessageBodyType)typeFromString:(NSString *)aStrType;
@end

@interface EMOptions (Json) <ExtSdkToJson>
- (NSDictionary *)toJsonObject;
+ (EMOptions *)fromJsonObject:(NSDictionary *)aJson;
+ (AreaCode)AreaCodeFromInt:(int)code;
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
+ (int)remindTypeToInt:(EMPushRemindType)type;
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

NS_ASSUME_NONNULL_END
