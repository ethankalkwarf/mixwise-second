import Foundation
import AuthenticationServices
import UIKit

#if DEBUG
/**
 * Simulator/TestFlight-debug harness for proving the OAuth sheet can be dismissed.
 * Trigger with:
 *   xcrun simctl openurl booted 'com.getmixwise.app://oauth-debug/start'
 *   xcrun simctl openurl booted 'com.getmixwise.app://oauth-debug/cancel'
 *   xcrun simctl openurl booted 'com.getmixwise.app://oauth-debug/race'
 */
enum OAuthDebugHarness {
    private static var session: ASWebAuthenticationSession?
    private static var anchorProvider = AnchorProvider()
    private static var lastResult: String = "idle"

    static var status: String { lastResult }

    static func handle(url: URL) -> Bool {
        guard url.scheme == "com.getmixwise.app", url.host == "oauth-debug" else {
            return false
        }
        let action = url.path.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
        switch action {
        case "start":
            startSheet()
            return true
        case "cancel":
            cancelSheet(reason: "cancel-url")
            return true
        case "race":
            // Reproduces the production bug shape: sheet up, then deep-link style cancel.
            startSheet()
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
                cancelSheet(reason: "race-callback")
            }
            return true
        case "status":
            NSLog("[OAuthDebugHarness] status=%@", lastResult)
            return true
        default:
            return false
        }
    }

    private static func startSheet() {
        cancelSheet(reason: "restart")
        guard let url = URL(string: "https://example.com") else { return }

        // Wait a beat so the key window is valid after a cold deep link.
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) {
            let next = ASWebAuthenticationSession(url: url, callbackURLScheme: "com.getmixwise.app") {
                _, error in
                if let error {
                    lastResult = "completed-error:\(error.localizedDescription)"
                } else {
                    lastResult = "completed-ok"
                }
                session = nil
                NSLog("[OAuthDebugHarness] session finished: %@", lastResult)
            }
            next.presentationContextProvider = anchorProvider
            next.prefersEphemeralWebBrowserSession = true
            session = next
            let started = next.start()
            lastResult = started ? "sheet-open" : "start-failed"
            NSLog("[OAuthDebugHarness] start => %@", lastResult)
        }
    }

    private static func cancelSheet(reason: String) {
        if let session {
            session.cancel()
            self.session = nil
            lastResult = "cancelled:\(reason)"
            NSLog("[OAuthDebugHarness] cancelled (%@)", reason)
        } else if lastResult.hasPrefix("sheet-open") {
            lastResult = "cancel-noop"
        }
    }
}

private final class AnchorProvider: NSObject, ASWebAuthenticationPresentationContextProviding {
    func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        if let window = (UIApplication.shared.delegate as? AppDelegate)?.window, window.windowScene != nil {
            return window
        }
        let scenes = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }
        for scene in scenes {
            if let key = scene.windows.first(where: \.isKeyWindow) { return key }
            if let any = scene.windows.first { return any }
        }
        return ASPresentationAnchor()
    }
}
#endif
