import UIKit
import Capacitor
import GoogleSignIn

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Ensure GIDSignIn has a configuration even before JS initialize runs.
        if let clientID = Bundle.main.object(forInfoDictionaryKey: "GIDClientID") as? String, !clientID.isEmpty {
            let serverClientID =
                "200787084084-p94m1d02kjnjgdc7o56ggimo4rg1c6ns.apps.googleusercontent.com"
            GIDSignIn.sharedInstance.configuration = GIDConfiguration(
                clientID: clientID,
                serverClientID: serverClientID
            )
        }
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
    }

    func applicationWillTerminate(_ application: UIApplication) {
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        #if DEBUG
        if OAuthDebugHarness.handle(url: url) {
            return true
        }
        #endif
        if GIDSignIn.sharedInstance.handle(url) {
            return true
        }
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
