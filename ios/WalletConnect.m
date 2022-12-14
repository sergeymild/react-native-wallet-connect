#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(WalletConnect, NSObject)

RCT_EXTERN_METHOD(connect:(NSDictionary*)params
                  callback:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(personalSign:(NSDictionary*)params
                  callback:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(disconnect)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
