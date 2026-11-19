//
//  ExtSdkOSLogForwarder.h
//  react-native-chat-sdk
//

#import <Foundation/Foundation.h>

// Forwards native SDK logs to the Apple unified log (os_log), mirroring the
// always-on Android JNI bridge (EMNDKLogCallback -> logcat). Installed once at
// module initialization, before SDK init: addLogDelegate registers directly
// into the core EMLog singleton, so logs from the init window are captured
// too. This lets CI and the multi-device orchestrator collect native logs via
// `xcrun simctl spawn <device> log stream --predicate 'process == "<app>"'`.
// The TS/Dart-side `debugMode` option (default off) gates forwarding via
// +setEnabled:. The core log file and the core console (cout) output are
// unaffected either way.
@interface ExtSdkOSLogForwarder : NSObject

+ (void)install;
+ (void)setEnabled:(BOOL)enabled;

@end
