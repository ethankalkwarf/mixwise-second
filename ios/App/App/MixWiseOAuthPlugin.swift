import Foundation
import AuthenticationServices
import Capacitor
import UIKit

/**
 * ASWebAuthenticationSession wrapper.
 *
 * Always uses the custom URL scheme callback. Supabase redirects to the HTTPS
 * bridge first; that route 302s to com.getmixwise.app://… which this session
 * intercepts and dismisses. Do not use iOS 17.4 HTTPS callbacks until
 * associated domains are confirmed live — a mismatched HTTPS callback leaves
 * users on the bridge page and the custom-scheme hop escapes into Safari.
 */
@objc(MixWiseOAuthPlugin)
public class MixWiseOAuthPlugin: CAPPlugin, CAPBridgedPlugin, ASWebAuthenticationPresentationContextProviding {
    public let identifier = "MixWiseOAuthPlugin"
    public let jsName = "MixwiseOAuth"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "cancel", returnType: CAPPluginReturnPromise)
    ]

    private var authSession: ASWebAuthenticationSession?
    private var activeCall: CAPPluginCall?

    @objc func start(_ call: CAPPluginCall) {
        guard let urlString = call.getString("url"), let url = URL(string: urlString) else {
            call.reject("url is required")
            return
        }

        let callbackScheme = call.getString("callbackScheme") ?? "com.getmixwise.app"
        let prefersEphemeral = call.getBool("prefersEphemeralWebBrowserSession") ?? false

        DispatchQueue.main.async {
            self.authSession?.cancel()
            self.authSession = nil
            if let prior = self.activeCall {
                self.activeCall = nil
                prior.reject("Sign-in replaced by a new session")
            }

            self.activeCall = call

            let session = ASWebAuthenticationSession(url: url, callbackURLScheme: callbackScheme) {
                [weak self] callbackURL, error in
                guard let self else { return }

                self.authSession = nil
                let pending = self.activeCall
                self.activeCall = nil

                if let error = error as NSError? {
                    if error.domain == ASWebAuthenticationSessionError.errorDomain,
                       error.code == ASWebAuthenticationSessionError.canceledLogin.rawValue {
                        pending?.reject("Sign-in cancelled", "OAUTH_CANCELLED")
                    } else {
                        pending?.reject(error.localizedDescription)
                    }
                    return
                }

                guard let callbackURL else {
                    pending?.reject("No callback URL received")
                    return
                }

                pending?.resolve(["url": callbackURL.absoluteString])
            }

            session.prefersEphemeralWebBrowserSession = prefersEphemeral
            session.presentationContextProvider = self
            self.authSession = session

            if !session.start() {
                self.authSession = nil
                self.activeCall = nil
                call.reject("Could not start sign-in session")
            }
        }
    }

    @objc func cancel(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if let session = self.authSession {
                self.authSession = nil
                session.cancel()
            }
            if let pending = self.activeCall {
                self.activeCall = nil
                pending.reject("Sign-in cancelled", "OAUTH_CANCELLED")
            }
            call.resolve()
        }
    }

    public func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        if let window = self.bridge?.viewController?.view.window, window.windowScene != nil {
            return window
        }
        if let window = (UIApplication.shared.delegate as? AppDelegate)?.window, window.windowScene != nil {
            return window
        }
        let scenes = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }
        for scene in scenes {
            if let key = scene.windows.first(where: { $0.isKeyWindow }) {
                return key
            }
            if let any = scene.windows.first {
                return any
            }
        }
        return ASPresentationAnchor()
    }
}
