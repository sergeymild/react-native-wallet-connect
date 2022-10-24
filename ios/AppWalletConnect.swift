//
//  AppWalletConnect.swift
//  WalletConnect
//
//  Created by Sergei Golishnikov on 19/10/2022.
//  Copyright © 2022 Facebook. All rights reserved.
//

import Foundation
import WalletConnectSwift
import React

protocol WalletConnectDelegate {
    func failedToConnect()
    func didConnect()
    func didDisconnect()
}

class AppWalletConnect {
    var client: Client!
    var session: Session!
    let sessionKey = "sessionKey"
    var callback: RCTResponseSenderBlock?
    
    static let instance = AppWalletConnect()
    
    private func getConnectionUrl(scheme: String, wcUrl: WCURL) -> String {
        let _encodeURL = wcUrl.absoluteString.addingPercentEncoding(withAllowedCharacters: .urlHostAllowed) ?? ""
        let _end2 = _encodeURL.replacingOccurrences(of: "=", with: "%3D").replacingOccurrences(of: "&", with: "%26")
        var s = scheme.hasSuffix("/") ? scheme : "\(scheme)/"
        s += "wc?uri="
        return "\(s)\(_end2)"
    }

    func connect(
        callback: @escaping RCTResponseSenderBlock,
        bridge: String,
        wallet: String,
        name: String,
        description: String,
        icon: String?,
        url: String
    ) {
        self.callback = callback
        let wcUrl =  WCURL(
            topic: UUID().uuidString,
            bridgeURL: URL(string: bridge)!,
            key: try! randomKey()
        )
        let clientMeta = Session.ClientMeta(
            name: name,
            description: description,
            icons: icon != nil ? [URL(string: icon!)!] : [],
            url: URL(string: url)!
        )
        let dAppInfo = Session.DAppInfo(peerId: UUID().uuidString, peerMeta: clientMeta)
        if (client != nil) {
            let sessions = client.openSessions()
            debugPrint("🥸 disconnect", sessions)
            for s in sessions {
                try? client.disconnect(from: s)
            }
        }
        client = Client(delegate: self, dAppInfo: dAppInfo)
        
        try! client.connect(to: wcUrl)
        let urlStr = getConnectionUrl(scheme: wallet, wcUrl: wcUrl)
        let url = URL(string: urlStr)!
        debugPrint("🥸 url: \(url.absoluteString)")
        debugPrint("🥸 wcUrl: \(wcUrl.absoluteString)")
        // we need a delay so that WalletConnectClient can send handshake request
        if !UIApplication.shared.canOpenURL(url) {
            callback([["type": "error", "error": "NO_WALLETS"]])
            return
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(1000)) {
            debugPrint("🥸 Launching", url)
            UIApplication.shared.open(url, options: [:], completionHandler: nil)
        }
        
    }
    
    func reconnectIfNeeded() {
        if let oldSessionObject = UserDefaults.standard.object(forKey: sessionKey) as? Data,
           let session = try? JSONDecoder().decode(Session.self, from: oldSessionObject) {
            client = Client(delegate: self, dAppInfo: session.dAppInfo)
            try? client.reconnect(to: session)
        }
    }
    
    // https://developer.apple.com/documentation/security/1399291-secrandomcopybytes
    private func randomKey() throws -> String {
        var bytes = [Int8](repeating: 0, count: 32)
        let status = SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes)
        if status == errSecSuccess {
            return Data(bytes: bytes, count: 32).toHexString()
        } else {
            // we don't care in the example app
            enum TestError: Error {
                case unknown
            }
            throw TestError.unknown
        }
    }
}

extension AppWalletConnect: ClientDelegate {
    func client(_ client: Client, didFailToConnect url: WCURL) {
        debugPrint("🥸 --- failedToConnect")
        
        let sessions = client.openSessions()
        debugPrint("🥸 disconnect", sessions)
        for s in sessions {
            try? client.disconnect(from: s)
        }
    }
    
    func client(_ client: Client, didConnect url: WCURL) {
        // do nothing
        debugPrint("🥸 -- didConnect.client")
    }
    
    func client(_ client: Client, didConnect session: Session) {
        self.session = session
        let sessionData = try! JSONEncoder().encode(session)
        UserDefaults.standard.set(sessionData, forKey: sessionKey)
        callback?([["type": "success", "addresses": session.walletInfo?.accounts ?? []]])
        callback = nil
    }
    
    func client(_ client: Client, didDisconnect session: Session) {
        UserDefaults.standard.removeObject(forKey: sessionKey)
        debugPrint("🥸 --- didDisconnect")
    }
    
    func client(_ client: Client, didUpdate session: Session) {
        debugPrint("🥸 --- didUpdate", session.walletInfo?.accounts)
    }
}

extension WCURL {
    var fullyPercentEncodedStr: String {
        absoluteString.addingPercentEncoding(withAllowedCharacters: .alphanumerics) ?? ""
    }
}
