@objc(WalletConnect)
class WalletConnect: NSObject {
    
    @objc
    func connect(
        _ params: NSDictionary,
        callback: @escaping RCTResponseSenderBlock
    ) -> Void {
        AppWalletConnect.instance.connect(
            callback: callback,
            bridge: params.value(forKey: "bridge") as! String,
            wallet: params.value(forKey: "wallet") as! String,
            name: params.value(forKey: "name") as! String,
            description: params.value(forKey: "description") as! String,
            icon: params.value(forKey: "icon") as? String,
            url: params.value(forKey: "url") as! String
        )
    }
    
    @objc
    func disconnect() {
        AppWalletConnect.instance.disconnect()
    }
    
    @objc
    func personalSign(
        _ params: NSDictionary,
        callback: @escaping RCTResponseSenderBlock
    ) {
        AppWalletConnect.instance.personalSign(
            message: params["message"] as! String,
            account: params["address"] as! String,
            bridge: params["bridge"] as! String,
            wallet: params["wallet"] as! String,
            callback: callback
        )
    }
}
