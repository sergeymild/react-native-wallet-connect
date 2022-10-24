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
}
