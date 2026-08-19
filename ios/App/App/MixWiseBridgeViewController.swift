import UIKit
import Capacitor
import WebKit

/// Injects the native-app flag before any page JS runs (dev live-reload safe).
class MixWiseBridgeViewController: CAPBridgeViewController {
    override func webViewConfiguration(for instanceConfiguration: InstanceConfiguration) -> WKWebViewConfiguration {
        let configuration = super.webViewConfiguration(for: instanceConfiguration)
        let source = """
        try {
          document.documentElement.classList.add('native-app');
          sessionStorage.setItem('mixwise_native', '1');
        } catch (e) {}
        """
        let script = WKUserScript(source: source, injectionTime: .atDocumentStart, forMainFrameOnly: true)
        configuration.userContentController.addUserScript(script)
        return configuration
    }

    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        bridge?.registerPluginInstance(ShakePlugin())
        webView?.scrollView.contentInsetAdjustmentBehavior = .never
        webView?.scrollView.contentInset = .zero
        webView?.backgroundColor = UIColor(red: 249 / 255, green: 247 / 255, blue: 242 / 255, alpha: 1)
        webView?.scrollView.backgroundColor = webView?.backgroundColor
    }
}

