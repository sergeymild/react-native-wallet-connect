#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(WalletConnect, NSObject)

RCT_EXTERN_METHOD(connect:(NSDictionary*)params
                  callback:(RCTResponseSenderBlock)callback)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
