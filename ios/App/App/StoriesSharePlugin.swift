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

        // Decode off the main thread — large pasteboard payloads can stall UI.
        DispatchQueue.global(qos: .userInitiated).async {
            var pasteboardItems: [String: Any] = [
                "\(pasteboardAppKey).appID": appId
            ]

            if let bg = backgroundBase64 {
                guard let data = self.decodeImageData(bg) else {
                    call.reject("Invalid backgroundImageBase64")
                    return
                }
                pasteboardItems["\(pasteboardAppKey).backgroundImage"] = data
            }
            if let sticker = stickerBase64 {
                guard let data = self.decodeImageData(sticker) else {
                    call.reject("Invalid stickerImageBase64")
                    return
                }
                pasteboardItems["\(pasteboardAppKey).stickerImage"] = data
            }

            if let bgColor = call.getString("backgroundTopColor") {
                pasteboardItems["\(pasteboardAppKey).backgroundTopColor"] = bgColor
            }
            if let bgColor = call.getString("backgroundBottomColor") {
                pasteboardItems["\(pasteboardAppKey).backgroundBottomColor"] = bgColor
            }

            DispatchQueue.main.async {
                // canOpenURL must use the bare scheme — querying with ?source_application=
                // often returns false even when Instagram/Facebook is installed.
                guard let schemeURL = URL(string: scheme),
                      UIApplication.shared.canOpenURL(schemeURL) else {
                    call.reject("Stories app is not installed")
                    return
                }

                let expiration = Date().addingTimeInterval(60 * 5)
                UIPasteboard.general.setItems([pasteboardItems], options: [
                    .expirationDate: expiration
                ])

                guard let openURL = URL(string: "\(scheme)?source_application=\(appId)") else {
                    call.reject("Invalid Stories URL")
                    return
                }

                // Brief beat so pasteboard is readable by the destination app.
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                    UIApplication.shared.open(openURL, options: [:]) { success in
                        if success {
                            call.resolve(["shared": true])
                        } else {
                            call.reject("Could not open Stories")
                        }
                    }
                }
            }
        }
    }

    private func decodeImageData(_ value: String) -> Data? {
        let raw = stripDataUrl(value)
        if let data = Data(base64Encoded: raw, options: .ignoreUnknownCharacters) {
            return data
        }
        // Some bridges mangle '+' in base64 as spaces
        let repaired = raw.replacingOccurrences(of: " ", with: "+")
        return Data(base64Encoded: repaired, options: .ignoreUnknownCharacters)
    }

    private func stripDataUrl(_ value: String) -> String {
        if let range = value.range(of: "base64,") {
            return String(value[range.upperBound...])
        }
        return value
    }
}
