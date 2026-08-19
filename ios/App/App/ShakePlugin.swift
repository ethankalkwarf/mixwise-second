import Foundation
import Capacitor
import CoreMotion

/**
 * Native accelerometer for shake-to-pour.
 * WKWebView does not expose DeviceMotionEvent.requestPermission, so the web API
 * reports motion as unavailable. Core Motion works without a Safari prompt.
 */
@objc(ShakePlugin)
public class ShakePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "ShakePlugin"
    public let jsName = "MixwiseShake"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise)
    ]

    private let manager = CMMotionManager()
    private let queue = OperationQueue()

    @objc func start(_ call: CAPPluginCall) {
        manager.stopDeviceMotionUpdates()
        manager.stopAccelerometerUpdates()

        if manager.isDeviceMotionAvailable {
            manager.deviceMotionUpdateInterval = 1.0 / 30.0
            manager.startDeviceMotionUpdates(to: queue) { [weak self] motion, _ in
                guard let acceleration = motion?.userAcceleration else { return }
                DispatchQueue.main.async {
                    self?.notifyListeners("accel", data: [
                        "x": acceleration.x,
                        "y": acceleration.y,
                        "z": acceleration.z
                    ])
                }
            }
            call.resolve(["available": true])
            return
        }

        if manager.isAccelerometerAvailable {
            manager.accelerometerUpdateInterval = 1.0 / 30.0
            manager.startAccelerometerUpdates(to: queue) { [weak self] data, _ in
                guard let acceleration = data?.acceleration else { return }
                DispatchQueue.main.async {
                    self?.notifyListeners("accel", data: [
                        "x": acceleration.x,
                        "y": acceleration.y,
                        "z": acceleration.z
                    ])
                }
            }
            call.resolve(["available": true])
            return
        }

        call.resolve(["available": false])
    }

    @objc func stop(_ call: CAPPluginCall) {
        manager.stopDeviceMotionUpdates()
        manager.stopAccelerometerUpdates()
        call.resolve()
    }

    deinit {
        manager.stopDeviceMotionUpdates()
        manager.stopAccelerometerUpdates()
    }
}
