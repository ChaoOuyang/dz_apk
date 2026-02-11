#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import "SDK/WXApi.h"

@interface WechatLogin : RCTEventEmitter <RCTBridgeModule, WXApiDelegate>

@property (nonatomic, strong) NSString *appId;

+ (BOOL)handleOpenURL:(NSURL *)url;

@end
