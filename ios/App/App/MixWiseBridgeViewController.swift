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
        bridge?.registerPluginInstance(MixWiseOAuthPlugin())
        webView?.backgroundColor = UIColor(red: 249 / 255, green: 247 / 255, blue: 242 / 255, alpha: 1)
        webView?.scrollView.backgroundColor = webView?.backgroundColor
        configureScrollBounce()
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        configureScrollBounce()
    }

    /// Native rubber-band overscroll (top + bottom), like UITableView / UIScrollView apps.
    private func configureScrollBounce() {
        guard let scrollView = webView?.scrollView else { return }
        scrollView.bounces = true
        scrollView.alwaysBounceVertical = true
        scrollView.alwaysBounceHorizontal = false
        scrollView.contentInsetAdjustmentBehavior = .never
        scrollView.contentInset = .zero
        // Match UIKit lists more than Safari’s snappier web deceleration.
        scrollView.decelerationRate = .normal
    }
}

