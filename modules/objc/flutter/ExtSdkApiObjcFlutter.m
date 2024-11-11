//
//  ExtSdkApiObjcFlutter.m
//  im_flutter_sdk
//
//  Created by asterisk on 2022/3/28.
//

#import "ExtSdkApiObjcFlutter.h"
#import "ExtSdkCallbackObjcFlutter.h"
#import "ExtSdkChannelManager.h"
#import "ExtSdkDelegateObjcFlutter.h"
#import "ExtSdkTest.h"
#import "ExtSdkThreadUtilObjc.h"
#import <HyphenateChat/EMClient.h>
#import <UIKit/UIApplication.h>

static NSString *const TAG = @"ExtSdkApiFlutter";

@interface ExtSdkApiFlutter () <UIApplicationDelegate>

@end

@implementation ExtSdkApiFlutter (Objc)

#pragma mark - FlutterPlugin

+ (void)registerWithRegistrar:(nonnull NSObject<FlutterPluginRegistrar> *)registrar {
    NSLog(@"%@: registerWithRegistrar:", TAG);
    if ([ExtSdkTest testType] == 1) {

    } else if ([ExtSdkTest testType] == 2) {
        [[ExtSdkChannelManager getInstance] setRegistrar:registrar];
        [[ExtSdkChannelManager getInstance] add:SEND_CHANNEL];
        [[ExtSdkChannelManager getInstance] add:RECV_CHANNEL];
        [[ExtSdkApiFlutter getInstance] addListener:[[ExtSdkDelegateObjcFlutter alloc] init]];
        FlutterMethodChannel *send_channel = [[ExtSdkChannelManager getInstance] get:SEND_CHANNEL];
        id<FlutterPlugin, UIApplicationDelegate> flutter = [ExtSdkApiFlutter getInstance];
        [registrar addMethodCallDelegate:flutter channel:send_channel];
        [registrar addApplicationDelegate:flutter];
    } else {
        @throw [NSException
            exceptionWithName:NSInvalidArgumentException
                       reason:[NSString stringWithFormat:@"test type is not exist: %d", [ExtSdkTest testType]]
                     userInfo:nil];
    }
}

- (void)handleMethodCall:(FlutterMethodCall *)call result:(FlutterResult)result {
    NSLog(@"%@: handleMethodCall:", TAG);
    id<NSObject> params = call.arguments;
    id<ExtSdkCallbackObjc> callback = [[ExtSdkCallbackObjcFlutter alloc] init:result];
    __weak typeof(self) weakself = self; // TODO: 后续解决 mm文件无法使用typeof关键字: 使用分类方式解决
    [ExtSdkThreadUtilObjc asyncExecute:^{      
      [weakself callSdkApi:call.method withParams:params withCallback:callback];
    }];
}

#pragma mark - UIApplicationDelegate

- (void)applicationDidEnterBackground:(UIApplication *)application API_AVAILABLE(ios(4.0)) {
    NSLog(@"%@: applicationDidEnterBackground:", TAG);
    if ([ExtSdkTest testType] == 1) {

    } else if ([ExtSdkTest testType] == 2) {
        [[EMClient sharedClient] applicationDidEnterBackground:application];
    } else {
        @throw [NSException
            exceptionWithName:NSInvalidArgumentException
                       reason:[NSString stringWithFormat:@"test type is not exist: %d", [ExtSdkTest testType]]
                     userInfo:nil];
    }
}
- (void)applicationWillEnterForeground:(UIApplication *)application API_AVAILABLE(ios(4.0)) {
    NSLog(@"%@: applicationWillEnterForeground:", TAG);
    if ([ExtSdkTest testType] == 1) {

    } else if ([ExtSdkTest testType] == 2) {
        [[EMClient sharedClient] applicationWillEnterForeground:application];
    } else {
        @throw [NSException
            exceptionWithName:NSInvalidArgumentException
                       reason:[NSString stringWithFormat:@"test type is not exist: %d", [ExtSdkTest testType]]
                     userInfo:nil];
    }
}

- (void)application:(UIApplication *)application
    didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
    NSLog(@"%@: didRegisterForRemoteNotificationsWithDeviceToken:", TAG);
    if ([ExtSdkTest testType] == 1) {

    } else if ([ExtSdkTest testType] == 2) {
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
          [[EMClient sharedClient] bindDeviceToken:deviceToken];
        });
    } else {
        @throw [NSException
            exceptionWithName:NSInvalidArgumentException
                       reason:[NSString stringWithFormat:@"test type is not exist: %d", [ExtSdkTest testType]]
                     userInfo:nil];
    }
}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
    NSLog(@"%@: didFailToRegisterForRemoteNotificationsWithError: %@", error);
}

@end
