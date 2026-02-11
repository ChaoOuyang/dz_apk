#import "WechatLogin.h"
#import <React/RCTLog.h>

#define NOT_REGISTERED (@"registerApp required.")
#define INVOKE_FAILED (@"WeChat API invoke returns false.")

@implementation WechatLogin

static WechatLogin *sharedInstance = nil;

RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        sharedInstance = self;
        [[NSNotificationCenter defaultCenter] addObserver:self 
                                                 selector:@selector(handleOpenURL:) 
                                                     name:@"RCTOpenURLNotification" 
                                                   object:nil];
    }
    return self;
}

- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (NSArray<NSString *> *)supportedEvents {
    return @[@"WeChat_Resp", @"WeChat_Req"];
}

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

+ (BOOL)handleOpenURL:(NSURL *)url {
    return [WXApi handleOpenURL:url delegate:sharedInstance];
}

- (BOOL)handleOpenURL:(NSNotification *)notification {
    NSString *urlString = notification.userInfo[@"url"];
    NSURL *url = [NSURL URLWithString:urlString];
    return [WXApi handleOpenURL:url delegate:self];
}

#pragma mark - React Native Methods

RCT_EXPORT_METHOD(registerApp:(NSString *)appId
                  universalLink:(NSString *)universalLink
                  callback:(RCTResponseSenderBlock)callback) {
    self.appId = appId;
    BOOL result = [WXApi registerApp:appId universalLink:universalLink];
    callback(@[result ? [NSNull null] : INVOKE_FAILED, @(result)]);
}

RCT_EXPORT_METHOD(isWXAppInstalled:(RCTResponseSenderBlock)callback) {
    BOOL installed = [WXApi isWXAppInstalled];
    callback(@[[NSNull null], @(installed)]);
}

RCT_EXPORT_METHOD(isWXAppSupportApi:(RCTResponseSenderBlock)callback) {
    BOOL support = [WXApi isWXAppSupportApi];
    callback(@[[NSNull null], @(support)]);
}

RCT_EXPORT_METHOD(getApiVersion:(RCTResponseSenderBlock)callback) {
    NSString *version = [WXApi getApiVersion];
    callback(@[[NSNull null], version]);
}

RCT_EXPORT_METHOD(openWXApp:(RCTResponseSenderBlock)callback) {
    BOOL success = [WXApi openWXApp];
    callback(@[[NSNull null], @(success)]);
}

RCT_EXPORT_METHOD(sendAuthRequest:(NSString *)scope
                  state:(NSString *)state
                  callback:(RCTResponseSenderBlock)callback) {
    SendAuthReq *req = [[SendAuthReq alloc] init];
    req.scope = scope;
    req.state = state;
    
    [WXApi sendReq:req completion:^(BOOL success) {
        callback(@[success ? [NSNull null] : INVOKE_FAILED, @(success)]);
    }];
}

#pragma mark - WXApiDelegate

- (void)onReq:(BaseReq *)req {
    NSDictionary *body = @{
        @"errCode": @0,
        @"type": @"LaunchFromWX.Req"
    };
    [self sendEventWithName:@"WeChat_Req" body:body];
}

- (void)onResp:(BaseResp *)resp {
    if ([resp isKindOfClass:[SendAuthResp class]]) {
        SendAuthResp *authResp = (SendAuthResp *)resp;
        NSDictionary *body = @{
            @"errCode": @(authResp.errCode),
            @"errStr": authResp.errStr ?: @"",
            @"type": @"SendAuth.Resp",
            @"code": authResp.code ?: @"",
            @"state": authResp.state ?: @"",
            @"lang": authResp.lang ?: @"",
            @"country": authResp.country ?: @""
        };
        [self sendEventWithName:@"WeChat_Resp" body:body];
    }
}

@end
