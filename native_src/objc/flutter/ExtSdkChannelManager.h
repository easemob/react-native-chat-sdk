#import <Flutter/Flutter.h>
#import <Foundation/Foundation.h>

extern NSString* _Nonnull const SEND_CHANNEL;
extern NSString* _Nonnull const RECV_CHANNEL;

@interface ExtSdkChannelManager : NSObject

+ (nonnull instancetype)getInstance;

- (void)setRegistrar:(nonnull NSObject<FlutterPluginRegistrar> *)registrar;

- (BOOL)add:(nonnull NSString *)name;

- (void)del:(nonnull NSString *)name;

- (nullable FlutterMethodChannel *)get:(nonnull NSString *)name;

@end
