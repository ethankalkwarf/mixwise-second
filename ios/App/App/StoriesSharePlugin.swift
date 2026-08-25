import Foundation
import Capacitor
import UIKit

/**
 * Share background + sticker images into Instagram / Facebook Stories.
 * Requires a Facebook App ID (Meta Sharing to Stories).
 *
 * Prefer `backgroundImagePath` (Camera file on disk) over giant base64 strings —
 * Capacitor's bridge can drop/truncate large payloads.
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

        let backgroundPath = call.getString("backgroundImagePath")
        let backgroundBase64 = call.getString("backgroundImageBase64")
        let stickerBase64 = call.getString("stickerImageBase64")

        if backgroundPath == nil && backgroundBase64 == nil && stickerBase64 == nil {
            call.reject("Provide backgroundImagePath, backgroundImageBase64, and/or stickerImageBase64")
            return
        }

        DispatchQueue.global(qos: .userInitiated).async {
            var pasteboardItems: [String: Any] = [
                "\(pasteboardAppKey).appID": appId
            ]

            if let path = backgroundPath, let jpeg = self.storyJPEG(fromFilePath: path) {
                pasteboardItems["\(pasteboardAppKey).backgroundImage"] = jpeg
            } else if let bg = backgroundBase64, let data = self.decodeImageData(bg) {
                // If we got raw bytes that are already an image, try to re-encode as story JPEG
                if let image = UIImage(data: data), let jpeg = self.storyJPEG(from: image) {
                    pasteboardItems["\(pasteboardAppKey).backgroundImage"] = jpeg
                } else {
                    pasteboardItems["\(pasteboardAppKey).backgroundImage"] = data
                }
            } else if backgroundPath != nil || backgroundBase64 != nil {
                call.reject("Invalid background image")
                return
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
                let expiration = Date().addingTimeInterval(60 * 5)
                UIPasteboard.general.setItems([pasteboardItems], options: [
                    .expirationDate: expiration,
                    .localOnly: false
                ])

                guard let openURL = URL(string: "\(scheme)?source_application=\(appId)") else {
                    call.reject("Invalid Stories URL")
                    return
                }

                // Don't hard-fail on canOpenURL(with query) — it's unreliable on some iOS versions.
                // Still warn if even the bare scheme is unknown.
                let bareOK = UIApplication.shared.canOpenURL(URL(string: scheme)!)
                if !bareOK {
                    // Try opening anyway; some devices report false incorrectly.
                    CAPLog.print("[MixwiseStories] canOpenURL(\(scheme)) == false; attempting open anyway")
                }

                DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
                    UIApplication.shared.open(openURL, options: [:]) { success in
                        if success {
                            call.resolve(["shared": true])
                            return
                        }
                        // Fallback: bare scheme without query
                        if let bare = URL(string: scheme) {
                            UIApplication.shared.open(bare, options: [:]) { bareSuccess in
                                if bareSuccess {
                                    call.resolve(["shared": true])
                                } else {
                                    call.reject("Could not open Stories (scheme=\(scheme), bareCanOpen=\(bareOK))")
                                }
                            }
                        } else {
                            call.reject("Could not open Stories")
                        }
                    }
                }
            }
        }
    }

    private func storyJPEG(fromFilePath path: String) -> Data? {
        let url: URL
        if path.hasPrefix("file:") {
            guard let parsed = URL(string: path) else { return nil }
            url = parsed
        } else {
            url = URL(fileURLWithPath: path)
        }
        guard let data = try? Data(contentsOf: url), let image = UIImage(data: data) else {
            return nil
        }
        return storyJPEG(from: image)
    }

    private func storyJPEG(from image: UIImage, width: CGFloat = 1080, height: CGFloat = 1920) -> Data? {
        let target = CGSize(width: width, height: height)
        let format = UIGraphicsImageRendererFormat.default()
        format.scale = 1
        let renderer = UIGraphicsImageRenderer(size: target, format: format)
        let rendered = renderer.image { _ in
            UIColor.black.setFill()
            UIBezierPath(rect: CGRect(origin: .zero, size: target)).fill()
            let scale = max(target.width / image.size.width, target.height / image.size.height)
            let w = image.size.width * scale
            let h = image.size.height * scale
            let x = (target.width - w) / 2
            let y = (target.height - h) / 2
            image.draw(in: CGRect(x: x, y: y, width: w, height: h))
        }
        return rendered.jpegData(compressionQuality: 0.82)
    }

    private func decodeImageData(_ value: String) -> Data? {
        let raw = stripDataUrl(value)
        if let data = Data(base64Encoded: raw, options: .ignoreUnknownCharacters) {
            return data
        }
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
