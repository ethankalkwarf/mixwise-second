import Foundation
import Capacitor
import UIKit

/**
 * Share background + sticker images into Instagram / Facebook Stories.
 * Requires a Facebook App ID (Meta Sharing to Stories).
 */
@objc(StoriesSharePlugin)
public class StoriesSharePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "StoriesSharePlugin"
    public let jsName = "MixwiseStories"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "canShareToInstagramStories", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "canShareToFacebookStories", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "shareToInstagramStories", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "shareToFacebookStories", returnType: CAPPluginReturnPromise)
    ]

    @objc func canShareToInstagramStories(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let canOpen = UIApplication.shared.canOpenURL(URL(string: "instagram-stories://share")!)
            call.resolve(["available": canOpen])
        }
    }

    @objc func canShareToFacebookStories(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let canOpen = UIApplication.shared.canOpenURL(URL(string: "facebook-stories://share")!)
            call.resolve(["available": canOpen])
        }
    }

    @objc func shareToInstagramStories(_ call: CAPPluginCall) {
        shareToStories(call, scheme: "instagram-stories://share", pasteboardAppKey: "com.instagram.sharedSticker")
    }

    @objc func shareToFacebookStories(_ call: CAPPluginCall) {
        shareToStories(call, scheme: "facebook-stories://share", pasteboardAppKey: "com.facebook.sharedSticker")
    }

    private func shareToStories(_ call: CAPPluginCall, scheme: String, pasteboardAppKey: String) {
        guard let appId = call.getString("facebookAppId"), !appId.isEmpty else {
            call.reject("facebookAppId is required")
            return
        }

        let backgroundBase64 = call.getString("backgroundImageBase64")
        let stickerBase64 = call.getString("stickerImageBase64")

        if backgroundBase64 == nil && stickerBase64 == nil {
            call.reject("Provide backgroundImageBase64 and/or stickerImageBase64")
            return
        }

        var pasteboardItems: [String: Any] = [
            "\(pasteboardAppKey).appID": appId
        ]

        if let bg = backgroundBase64, let data = Data(base64Encoded: stripDataUrl(bg)) {
            pasteboardItems["\(pasteboardAppKey).backgroundImage"] = data
        }
        if let sticker = stickerBase64, let data = Data(base64Encoded: stripDataUrl(sticker)) {
            pasteboardItems["\(pasteboardAppKey).stickerImage"] = data
        }

        if let bgColor = call.getString("backgroundTopColor") {
            pasteboardItems["\(pasteboardAppKey).backgroundTopColor"] = bgColor
        }
        if let bgColor = call.getString("backgroundBottomColor") {
            pasteboardItems["\(pasteboardAppKey).backgroundBottomColor"] = bgColor
        }

        DispatchQueue.main.async {
            let expiration = Date().addingTimeInterval(60 * 5)
            UIPasteboard.general.setItems([pasteboardItems], options: [
                .expirationDate: expiration
            ])

            guard let url = URL(string: "\(scheme)?source_application=\(appId)") else {
                call.reject("Invalid Stories URL")
                return
            }

            guard UIApplication.shared.canOpenURL(url) else {
                call.reject("Stories app is not installed")
                return
            }

            UIApplication.shared.open(url, options: [:]) { success in
                if success {
                    call.resolve(["shared": true])
                } else {
                    call.reject("Could not open Stories")
                }
            }
        }
    }

    private func stripDataUrl(_ value: String) -> String {
        if let range = value.range(of: "base64,") {
            return String(value[range.upperBound...])
        }
        return value
    }
}
