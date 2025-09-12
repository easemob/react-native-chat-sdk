
#import <Foundation/Foundation.h>

@interface ExtSdkThreadUtilObjc : NSObject

+ (void)asyncExecute:(void (^)(void))callback;

+ (void)mainThreadExecute:(void (^)(void))callback;

@end

