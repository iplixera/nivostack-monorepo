import UIKit
import NivoStack

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    
    var window: UIWindow?
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // Initialize NivoStack SDK
        // Replace with your actual API key from NivoStack Studio
        let apiKey = "cmjvwzx140003og8t37yd6kor" // Example API key
        
        NivoStack.initialize(
            apiKey: apiKey,
            enabled: true,
            syncIntervalMinutes: 15 // Sync every 15 minutes (nil = only lifecycle sync)
        ) { result in
            switch result {
            case .success(let sdk):
                print("✅ NivoStack initialized successfully")
                if let deviceCode = sdk.getDeviceCode() {
                    print("📱 Device Code: \(deviceCode)")
                }
                print("🔧 SDK Status:")
                print("   - Fully Initialized: \(sdk.isFullyInitialized)")
                if let error = sdk.getInitError() {
                    print("   - Init Error: \(error)")
                }
            case .failure(let error):
                print("❌ NivoStack initialization failed: \(error.localizedDescription)")
            }
        }
        
        // Create window and root view controller
        window = UIWindow(frame: UIScreen.main.bounds)
        let viewController = ViewController()
        let navigationController = UINavigationController(rootViewController: viewController)
        window?.rootViewController = navigationController
        window?.makeKeyAndVisible()
        
        return true
    }
    
    func applicationWillResignActive(_ application: UIApplication) {
        // SDK handles lifecycle automatically
    }
    
    func applicationDidEnterBackground(_ application: UIApplication) {
        // SDK handles lifecycle automatically
    }
    
    func applicationWillEnterForeground(_ application: UIApplication) {
        // SDK handles lifecycle automatically
    }
    
    func applicationDidBecomeActive(_ application: UIApplication) {
        // SDK handles lifecycle automatically
    }
}

