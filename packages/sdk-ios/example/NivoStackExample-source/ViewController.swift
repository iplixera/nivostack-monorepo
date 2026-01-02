import UIKit
import NivoStack

class ViewController: UIViewController {
    
    // MARK: - UI Elements
    
    private let scrollView: UIScrollView = {
        let scrollView = UIScrollView()
        scrollView.translatesAutoresizingMaskIntoConstraints = false
        return scrollView
    }()
    
    private let contentView: UIStackView = {
        let stackView = UIStackView()
        stackView.axis = .vertical
        stackView.spacing = 20
        stackView.translatesAutoresizingMaskIntoConstraints = false
        return stackView
    }()
    
    private let statusLabel: UILabel = {
        let label = UILabel()
        label.text = "SDK Status: Initializing..."
        label.font = .systemFont(ofSize: 16, weight: .medium)
        label.textAlignment = .center
        label.numberOfLines = 0
        return label
    }()
    
    private let deviceCodeLabel: UILabel = {
        let label = UILabel()
        label.text = "Device Code: -"
        label.font = .systemFont(ofSize: 14)
        label.textAlignment = .center
        return label
    }()
    
    // MARK: - Lifecycle
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        title = "NivoStack SDK Example"
        view.backgroundColor = .systemBackground
        
        setupUI()
        setupButtons()
        updateStatus()
        
        // Track screen view
        NivoStack.shared?.trackScreen("HomeScreen")
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        
        // Track screen view
        NivoStack.shared?.trackScreen("HomeScreen")
    }
    
    // MARK: - UI Setup
    
    private func setupUI() {
        view.addSubview(scrollView)
        scrollView.addSubview(contentView)
        
        NSLayoutConstraint.activate([
            scrollView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            scrollView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            scrollView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            scrollView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            
            contentView.topAnchor.constraint(equalTo: scrollView.topAnchor, constant: 20),
            contentView.leadingAnchor.constraint(equalTo: scrollView.leadingAnchor, constant: 20),
            contentView.trailingAnchor.constraint(equalTo: scrollView.trailingAnchor, constant: -20),
            contentView.bottomAnchor.constraint(equalTo: scrollView.bottomAnchor, constant: -20),
            contentView.widthAnchor.constraint(equalTo: scrollView.widthAnchor, constant: -40)
        ])
        
        contentView.addArrangedSubview(statusLabel)
        contentView.addArrangedSubview(deviceCodeLabel)
    }
    
    private func setupButtons() {
        // Track API Trace Button
        let trackApiButton = createButton(title: "Track API Trace", color: .systemBlue) { [weak self] in
            self?.trackApiTrace()
        }
        contentView.addArrangedSubview(trackApiButton)
        
        // Log Message Button
        let logButton = createButton(title: "Log Message", color: .systemGreen) { [weak self] in
            self?.logMessage()
        }
        contentView.addArrangedSubview(logButton)
        
        // Track Screen Button
        let trackScreenButton = createButton(title: "Track Screen View", color: .systemPurple) { [weak self] in
            self?.trackScreen()
        }
        contentView.addArrangedSubview(trackScreenButton)
        
        // Report Crash Button
        let crashButton = createButton(title: "Report Crash", color: .systemRed) { [weak self] in
            self?.reportCrash()
        }
        contentView.addArrangedSubview(crashButton)
        
        // Refresh Config Button
        let refreshButton = createButton(title: "Refresh Config", color: .systemOrange) { [weak self] in
            self?.refreshConfig()
        }
        contentView.addArrangedSubview(refreshButton)
        
        // Flush Events Button
        let flushButton = createButton(title: "Flush Events", color: .systemTeal) { [weak self] in
            self?.flushEvents()
        }
        contentView.addArrangedSubview(flushButton)
        
        // Set User Button
        let setUserButton = createButton(title: "Set User", color: .systemIndigo) { [weak self] in
            self?.setUser()
        }
        contentView.addArrangedSubview(setUserButton)
        
        // Clear User Button
        let clearUserButton = createButton(title: "Clear User", color: .systemGray) { [weak self] in
            self?.clearUser()
        }
        contentView.addArrangedSubview(clearUserButton)
        
        // Business Config Button
        let businessConfigButton = createButton(title: "Fetch Business Config", color: .systemPink) { [weak self] in
            self?.fetchBusinessConfig()
        }
        contentView.addArrangedSubview(businessConfigButton)
        
        // Localization Button
        let localizationButton = createButton(title: "Fetch Localization", color: .systemBrown) { [weak self] in
            self?.fetchLocalization()
        }
        contentView.addArrangedSubview(localizationButton)
    }
    
    private func createButton(title: String, color: UIColor, action: @escaping () -> Void) -> UIButton {
        let button = UIButton(type: .system)
        button.setTitle(title, for: .normal)
        button.backgroundColor = color
        button.setTitleColor(.white, for: .normal)
        button.layer.cornerRadius = 8
        button.heightAnchor.constraint(equalToConstant: 50).isActive = true
        button.addAction(UIAction { _ in action() }, for: .touchUpInside)
        return button
    }
    
    // MARK: - Actions
    
    private func trackApiTrace() {
        guard let sdk = NivoStack.shared else {
            showAlert(title: "Error", message: "SDK not initialized")
            return
        }
        
        // Simulate API call
        let startTime = Date()
        
        // Track API trace
        sdk.trackApiTrace(
            url: "https://api.example.com/users",
            method: "GET",
            statusCode: 200,
            requestHeaders: ["Authorization": "Bearer token123"],
            responseHeaders: ["Content-Type": "application/json"],
            duration: Date().timeIntervalSince(startTime)
        )
        
        showAlert(title: "Success", message: "API trace tracked")
        
        // Log the action
        sdk.log(level: "info", message: "Tracked API trace", tag: "demo")
    }
    
    private func logMessage() {
        guard let sdk = NivoStack.shared else {
            showAlert(title: "Error", message: "SDK not initialized")
            return
        }
        
        // Log different levels
        sdk.log(level: "info", message: "User tapped log button", tag: "ui")
        sdk.log(level: "debug", message: "Debug message", tag: "demo", metadata: ["action": "log_button"])
        sdk.log(level: "warn", message: "Warning message", tag: "demo")
        sdk.log(level: "error", message: "Error message", tag: "demo", metadata: ["errorCode": "123"])
        
        showAlert(title: "Success", message: "Log messages sent")
    }
    
    private func trackScreen() {
        guard let sdk = NivoStack.shared else {
            showAlert(title: "Error", message: "SDK not initialized")
            return
        }
        
        sdk.trackScreen("ExampleScreen")
        showAlert(title: "Success", message: "Screen tracked: ExampleScreen")
    }
    
    private func reportCrash() {
        guard let sdk = NivoStack.shared else {
            showAlert(title: "Error", message: "SDK not initialized")
            return
        }
        
        let stackTrace = """
        Thread 0 Crashed:
        0   NivoStackExample             0x0000000100012345 main + 0
        1   NivoStackExample             0x0000000100016789 ViewController.trackScreen() + 123
        """
        
        sdk.reportCrash(
            message: "Test crash report",
            stackTrace: stackTrace,
            metadata: ["userId": "user123", "action": "test_crash"]
        )
        
        showAlert(title: "Success", message: "Crash reported")
    }
    
    private func refreshConfig() {
        guard let sdk = NivoStack.shared else {
            showAlert(title: "Error", message: "SDK not initialized")
            return
        }
        
        sdk.refreshConfig(forceRefresh: true) { [weak self] result in
            DispatchQueue.main.async {
                switch result {
                case .success:
                    self?.showAlert(title: "Success", message: "Config refreshed")
                    self?.updateStatus()
                case .failure(let error):
                    self?.showAlert(title: "Error", message: error.localizedDescription)
                }
            }
        }
    }
    
    private func flushEvents() {
        guard let sdk = NivoStack.shared else {
            showAlert(title: "Error", message: "SDK not initialized")
            return
        }
        
        sdk.flush { [weak self] result in
            DispatchQueue.main.async {
                switch result {
                case .success:
                    self?.showAlert(title: "Success", message: "Events flushed")
                case .failure(let error):
                    self?.showAlert(title: "Error", message: error.localizedDescription)
                }
            }
        }
    }
    
    private func setUser() {
        guard let sdk = NivoStack.shared else {
            showAlert(title: "Error", message: "SDK not initialized")
            return
        }
        
        sdk.setUser(
            userId: "user123",
            email: "user@example.com",
            name: "John Doe"
        ) { [weak self] result in
            DispatchQueue.main.async {
                switch result {
                case .success:
                    self?.showAlert(title: "Success", message: "User associated")
                case .failure(let error):
                    self?.showAlert(title: "Error", message: error.localizedDescription)
                }
            }
        }
    }
    
    private func clearUser() {
        guard let sdk = NivoStack.shared else {
            showAlert(title: "Error", message: "SDK not initialized")
            return
        }
        
        sdk.clearUser { [weak self] result in
            DispatchQueue.main.async {
                switch result {
                case .success:
                    self?.showAlert(title: "Success", message: "User cleared")
                case .failure(let error):
                    self?.showAlert(title: "Error", message: error.localizedDescription)
                }
            }
        }
    }
    
    private func fetchBusinessConfig() {
        guard let sdk = NivoStack.shared else {
            showAlert(title: "Error", message: "SDK not initialized")
            return
        }
        
        let businessConfig = sdk.getBusinessConfig()
        
        businessConfig.fetchAll { [weak self] result in
            DispatchQueue.main.async {
                switch result {
                case .success(let configs):
                    let message = "Fetched \(configs.count) configs"
                    self?.showAlert(title: "Success", message: message)
                    
                    // Example: Get a config value
                    let apiUrl = businessConfig.getString("api_url", defaultValue: "Not configured")
                    print("API URL from config: \(apiUrl)")
                    
                case .failure(let error):
                    self?.showAlert(title: "Error", message: error.localizedDescription)
                }
            }
        }
    }
    
    private func fetchLocalization() {
        guard let sdk = NivoStack.shared else {
            showAlert(title: "Error", message: "SDK not initialized")
            return
        }
        
        let localization = sdk.getLocalization()
        
        localization.setLanguage("en") { [weak self] result in
            DispatchQueue.main.async {
                switch result {
                case .success:
                    let translations = localization.getTranslations()
                    let message = "Fetched \(translations.count) translations"
                    self?.showAlert(title: "Success", message: message)
                    
                    // Example: Get a translation
                    let welcomeText = localization.translate("welcome_message", defaultValue: "Welcome")
                    print("Welcome text: \(welcomeText)")
                    
                case .failure(let error):
                    self?.showAlert(title: "Error", message: error.localizedDescription)
                }
            }
        }
    }
    
    // MARK: - Helpers
    
    private func updateStatus() {
        guard let sdk = NivoStack.shared else {
            statusLabel.text = "SDK Status: Not initialized"
            deviceCodeLabel.text = "Device Code: -"
            return
        }
        
        var statusText = "SDK Status:\n"
        statusText += "• Initialized: ✅\n"
        statusText += "• Fully Initialized: \(sdk.isFullyInitialized ? "✅" : "⏳")\n"
        
        if let error = sdk.getInitError() {
            statusText += "• Error: \(error)"
        }
        
        statusLabel.text = statusText
        
        if let deviceCode = sdk.getDeviceCode() {
            deviceCodeLabel.text = "Device Code: \(deviceCode)"
        } else {
            deviceCodeLabel.text = "Device Code: Generating..."
        }
    }
    
    private func showAlert(title: String, message: String) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
}

