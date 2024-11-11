
#import "ExtSdkChannelManager.h"

NSString *_Nonnull const SEND_CHANNEL = @"com.chat.im.ext.dart_to_native";
NSString *_Nonnull const RECV_CHANNEL = @"com.chat.im.ext.native_to_dart";

@interface ExtSdkChannelManager () {
    NSMutableDictionary *_map;
    NSObject<FlutterPluginRegistrar> *_registrar;
}

@end

@implementation ExtSdkChannelManager

+ (nonnull instancetype)getInstance {
    static ExtSdkChannelManager *instance = nil;
    static dispatch_once_t predicate;
    dispatch_once(&predicate, ^{
      instance = [[ExtSdkChannelManager alloc] init];
    });
    return instance;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        _map = [[NSMutableDictionary alloc] init];
    }
    return self;
}

- (void)setRegistrar:(nonnull NSObject<FlutterPluginRegistrar> *)registrar {
    _registrar = registrar;
}

- (BOOL)add:(nonnull NSString *)name {
    FlutterJSONMethodCodec *codec = [FlutterJSONMethodCodec sharedInstance];
    FlutterMethodChannel *channel =
        [FlutterMethodChannel methodChannelWithName:name
                                    binaryMessenger:[_registrar messenger]
                                              codec:codec];
    [_map setObject:channel forKey:name];
    return YES;
}

- (void)del:(nonnull NSString *)name {
    [_map removeObjectForKey:name];
}

- (nullable FlutterMethodChannel *)get:(nonnull NSString *)name {
    return [_map objectForKey:name];
}

@end
