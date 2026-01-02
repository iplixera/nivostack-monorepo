import Foundation
import UIKit

/// Main NivoStack SDK class
public class NivoStack {
    // MARK: - Constants
    
    private static let defaultIngestUrl = "https://ingest.nivostack.com"
    private static let defaultControlUrl = "https://api.nivostack.com"
    
    // MARK: - Singleton
    
    public static var shared: NivoStack?
    
    // MARK: - Properties
    
    public let ingestUrl: String
    public let controlUrl: String
    public let apiKey: String
    public let enabled: Bool
    
    private let apiClient: NivoStackApiClient
    private let businessConfig: NivoStackBusinessConfig
    private let localization: NivoStackLocalization
    private let configCache: SdkConfigCache
    
    // Device info
    private var deviceInfo: NivoStackDeviceInfo?
    private var deviceId: String?
    private var deviceCode: String?
    
    // SDK state
    private var featureFlags: NivoStackFeatureFlags = .defaults()
    private var sdkSettings: NivoStackSdkSettings = .defaults()
    private var deviceConfig: NivoStackDeviceConfig = .defaults()
    
    // Session management
    private var sessionToken: String?
    private var isSessionActive: Bool = false
    
    // Tracking queues
    private var traceQueue: [[String: Any]] = []
    private var logQueue: [[String: Any]] = []
    
    // Sync management
    private var syncInterval: TimeInterval?
    private var syncTimer: Timer?
    private var lastSyncEtag: String?
    
    // Initialization status
    private var _isFullyInitialized: Bool = false
    private var configFetched: Bool = false
    private var deviceRegistered: Bool = false
    private var sessionStarted: Bool = false
    private var initError: String?
    
    // MARK: - Initialization
    
    private init(ingestUrl: String, controlUrl: String, apiKey: String, enabled: Bool) {
        self.ingestUrl = ingestUrl
        self.controlUrl = controlUrl
        self.apiKey = apiKey
        self.enabled = enabled
        
        self.apiClient = NivoStackApiClient(ingestUrl: ingestUrl, controlUrl: controlUrl, apiKey: apiKey)
        self.businessConfig = NivoStackBusinessConfig(apiClient: apiClient)
        self.localization = NivoStackLocalization(apiClient: apiClient)
        self.configCache = SdkConfigCache()
        
        // Generate initial session token
        self.sessionToken = UUID().uuidString
    }
    
    /// Initialize NivoStack SDK
    ///
    /// - Parameters:
    ///   - apiKey: Project API key from NivoStack Studio dashboard
    ///   - enabled: Enable/disable SDK (useful for debug vs release builds)
    ///   - syncIntervalMinutes: Interval for periodic config sync in minutes. Default: nil (periodic sync disabled, only lifecycle sync).
    ///   - ingestUrl: Optional custom ingest URL (default: https://ingest.nivostack.com)
    ///   - controlUrl: Optional custom control URL (default: https://api.nivostack.com)
    ///   - completion: Completion handler called when initialization completes
    ///
    /// This method returns immediately after loading cached config (if available).
    /// Network operations run in the background and do NOT block app startup.
    public static func initialize(
        apiKey: String,
        enabled: Bool = true,
        syncIntervalMinutes: TimeInterval? = nil,
        ingestUrl: String? = nil,
        controlUrl: String? = nil,
        completion: @escaping (Result<NivoStack, Error>) -> Void
    ) {
        if let existing = shared {
            completion(.success(existing))
            return
        }
        
        let instance = NivoStack(
            ingestUrl: ingestUrl ?? defaultIngestUrl,
            controlUrl: controlUrl ?? defaultControlUrl,
            apiKey: apiKey,
            enabled: enabled
        )
        
        shared = instance
        
        // Set sync interval
        instance.syncInterval = syncIntervalMinutes.map { $0 * 60 } // Convert minutes to seconds
        
        // Initialize device info
        instance.initializeDeviceInfo()
        
        if enabled {
            // Load cached config synchronously for instant startup
            if let cached = instance.configCache.load(), cached.hasData {
                instance.applyCachedConfig(cached)
                instance.configFetched = true
                print("NivoStack: Cached config loaded")
            }
            
            // Setup lifecycle observer for automatic sync on app foreground
            instance.setupLifecycleObserver()
            
            // Run network operations in background
            instance.initializeInBackground { result in
                switch result {
                case .success:
                    completion(.success(instance))
                case .failure(let error):
                    completion(.failure(error))
                }
            }
        } else {
            completion(.success(instance))
        }
    }
    
    // MARK: - Public API
    
    /// Get device code (short identifier for support)
    public func getDeviceCode() -> String? {
        return deviceCode
    }
    
    /// Check if SDK has completed full initialization
    public var isFullyInitialized: Bool {
        return _isFullyInitialized
    }
    
    /// Get initialization error (if any)
    public func getInitError() -> String? {
        return initError
    }
    
    /// Refresh SDK configuration from server
    public func refreshConfig(forceRefresh: Bool = false, completion: @escaping (Result<Void, Error>) -> Void) {
        guard let deviceId = deviceId else {
            completion(.failure(NSError(domain: "NivoStack", code: -1, userInfo: [NSLocalizedDescriptionKey: "Device not registered"])))
            return
        }
        
        fetchSdkInitData(deviceId: deviceId, forceRefresh: forceRefresh) { [weak self] result in
            guard let self = self else { return }
            
            switch result {
            case .success:
                completion(.success(()))
            case .failure(let error):
                completion(.failure(error))
            }
        }
    }
    
    /// Track API trace
    public func trackApiTrace(
        url: String,
        method: String,
        statusCode: Int? = nil,
        requestHeaders: [String: String]? = nil,
        responseHeaders: [String: String]? = nil,
        requestBody: Data? = nil,
        responseBody: Data? = nil,
        duration: TimeInterval? = nil,
        error: Error? = nil
    ) {
        guard enabled && featureFlags.sdkEnabled && featureFlags.apiTracking else { return }
        guard let deviceId = deviceId else { return }
        
        // Check if tracking is enabled for this device
        if !deviceConfig.trackingEnabled {
            return
        }
        
        var trace: [String: Any] = [
            "url": url,
            "method": method
        ]
        
        if let statusCode = statusCode {
            trace["statusCode"] = statusCode
        }
        if let requestHeaders = requestHeaders {
            trace["requestHeaders"] = requestHeaders
        }
        if let responseHeaders = responseHeaders {
            trace["responseHeaders"] = responseHeaders
        }
        if let requestBody = requestBody, sdkSettings.captureRequestBodies {
            if let bodyString = String(data: requestBody, encoding: .utf8) {
                trace["requestBody"] = bodyString
            }
        }
        if let responseBody = responseBody, sdkSettings.captureResponseBodies {
            if let bodyString = String(data: responseBody, encoding: .utf8) {
                trace["responseBody"] = bodyString
            }
        }
        if let duration = duration {
            trace["duration"] = duration * 1000 // Convert to milliseconds
        }
        if let error = error {
            trace["error"] = error.localizedDescription
        }
        
        // Add screen name if screen tracking is enabled
        if featureFlags.screenTracking {
            // TODO: Get current screen name from navigation
            // trace["screenName"] = currentScreenName
        }
        
        traceQueue.append(trace)
        
        // Flush if queue is full
        if traceQueue.count >= sdkSettings.maxTraceQueueSize {
            flushTraces()
        }
    }
    
    /// Log a message
    public func log(
        level: String,
        message: String,
        tag: String? = nil,
        metadata: [String: Any]? = nil
    ) {
        guard enabled && featureFlags.sdkEnabled && featureFlags.logging else { return }
        guard let deviceId = deviceId else { return }
        
        // Check if tracking is enabled for this device
        if !deviceConfig.trackingEnabled {
            return
        }
        
        // Check log level
        if !sdkSettings.shouldCaptureLogLevel(level) {
            return
        }
        
        var logEntry: [String: Any] = [
            "level": level,
            "message": message
        ]
        
        if let tag = tag {
            logEntry["tag"] = tag
        }
        if let metadata = metadata {
            logEntry["metadata"] = metadata
        }
        
        // Add screen name if screen tracking is enabled
        if featureFlags.screenTracking {
            // TODO: Get current screen name
            // logEntry["screenName"] = currentScreenName
        }
        
        logQueue.append(logEntry)
        
        // Flush if queue is full
        if logQueue.count >= sdkSettings.maxLogQueueSize {
            flushLogs()
        }
    }
    
    /// Report a crash
    public func reportCrash(
        message: String,
        stackTrace: String? = nil,
        metadata: [String: Any]? = nil
    ) {
        guard enabled && featureFlags.sdkEnabled && featureFlags.crashReporting else { return }
        guard let deviceId = deviceId else { return }
        
        var crash: [String: Any] = [
            "message": message
        ]
        
        if let stackTrace = stackTrace {
            crash["stackTrace"] = stackTrace
        }
        if let metadata = metadata {
            crash["metadata"] = metadata
        }
        
        apiClient.reportCrash(deviceId: deviceId, sessionToken: sessionToken, crash: crash) { _ in }
    }
    
    /// Flush pending traces and logs
    public func flush(completion: ((Result<Void, Error>) -> Void)? = nil) {
        let group = DispatchGroup()
        var errors: [Error] = []
        
        group.enter()
        flushTraces { result in
            if case .failure(let error) = result {
                errors.append(error)
            }
            group.leave()
        }
        
        group.enter()
        flushLogs { result in
            if case .failure(let error) = result {
                errors.append(error)
            }
            group.leave()
        }
        
        group.notify(queue: .main) {
            if let error = errors.first {
                completion?(.failure(error))
            } else {
                completion?(.success(()))
            }
        }
    }
    
    /// Associate user with device
    public func setUser(userId: String, email: String? = nil, name: String? = nil, completion: ((Result<Void, Error>) -> Void)? = nil) {
        guard let deviceId = deviceId else {
            completion?(.failure(NSError(domain: "NivoStack", code: -1, userInfo: [NSLocalizedDescriptionKey: "Device not registered"])))
            return
        }
        
        apiClient.setUser(deviceId: deviceId, userId: userId, email: email, name: name) { result in
            completion?(result)
        }
    }
    
    /// Clear user from device
    public func clearUser(completion: ((Result<Void, Error>) -> Void)? = nil) {
        guard let deviceId = deviceId else {
            completion?(.failure(NSError(domain: "NivoStack", code: -1, userInfo: [NSLocalizedDescriptionKey: "Device not registered"])))
            return
        }
        
        apiClient.clearUser(deviceId: deviceId) { result in
            completion?(result)
        }
    }
    
    /// Track screen view
    public func trackScreen(_ screenName: String) {
        guard enabled && featureFlags.sdkEnabled && featureFlags.screenTracking else { return }
        guard let sessionToken = sessionToken else { return }
        
        apiClient.updateSession(sessionToken: sessionToken, screenName: screenName) { _ in }
    }
    
    // MARK: - Business Config & Localization
    
    public func getBusinessConfig() -> NivoStackBusinessConfig {
        return businessConfig
    }
    
    public func getLocalization() -> NivoStackLocalization {
        return localization
    }
    
    // MARK: - Private Methods
    
    private func initializeDeviceInfo() {
        let device = UIDevice.current
        let bundle = Bundle.main
        
        let deviceId = UIDevice.current.identifierForVendor?.uuidString ?? UUID().uuidString
        
        deviceInfo = NivoStackDeviceInfo(
            deviceId: deviceId,
            platform: "iOS",
            osVersion: device.systemVersion,
            appVersion: bundle.infoDictionary?["CFBundleShortVersionString"] as? String,
            model: device.model,
            manufacturer: "Apple"
        )
        
        self.deviceId = deviceId
    }
    
    private func setupLifecycleObserver() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(applicationDidBecomeActive),
            name: UIApplication.didBecomeActiveNotification,
            object: nil
        )
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(applicationWillResignActive),
            name: UIApplication.willResignActiveNotification,
            object: nil
        )
    }
    
    @objc private func applicationDidBecomeActive() {
        // Sync config when app comes to foreground
        if let deviceId = deviceId {
            fetchSdkInitData(deviceId: deviceId, forceRefresh: false) { _ in }
        }
        
        // Start periodic sync if enabled
        if let interval = syncInterval {
            startPeriodicSync(interval: interval)
        }
    }
    
    @objc private func applicationWillResignActive() {
        // Stop periodic sync when app is backgrounded
        stopPeriodicSync()
        
        // End session if active
        if isSessionActive {
            endSession()
        }
    }
    
    private func initializeInBackground(completion: @escaping (Result<Void, Error>) -> Void) {
        guard let deviceInfo = deviceInfo else {
            completion(.failure(NSError(domain: "NivoStack", code: -1, userInfo: [NSLocalizedDescriptionKey: "Device info not initialized"])))
            return
        }
        
        // Generate or get device code
        deviceCode = DeviceCodeGenerator.getOrGenerate()
        
        // Register device
        apiClient.registerDevice(deviceInfo: deviceInfo, deviceCode: deviceCode) { [weak self] result in
            guard let self = self else { return }
            
            switch result {
            case .success(let response):
                if let serverDeviceId = response["id"] as? String {
                    self.deviceId = serverDeviceId
                }
                if let serverDeviceCode = response["deviceCode"] as? String {
                    self.deviceCode = serverDeviceCode
                    DeviceCodeGenerator.save(serverDeviceCode)
                }
                self.deviceRegistered = true
                
                // Fetch SDK init data
                self.fetchSdkInitData(deviceId: self.deviceId ?? deviceInfo.deviceId) { result in
                    switch result {
                    case .success:
                        // Start session
                        self.startSession()
                        self._isFullyInitialized = true
                        completion(.success(()))
                    case .failure(let error):
                        self.initError = error.localizedDescription
                        completion(.failure(error))
                    }
                }
                
            case .failure(let error):
                self.initError = error.localizedDescription
                completion(.failure(error))
            }
        }
    }
    
    private func fetchSdkInitData(deviceId: String, forceRefresh: Bool = false, completion: @escaping (Result<Void, Error>) -> Void) {
        let etag = forceRefresh ? nil : lastSyncEtag
        
        // Determine build mode
        #if DEBUG
        let buildMode = "preview"
        #else
        let buildMode = "production"
        #endif
        
        apiClient.getSdkInit(deviceId: deviceId, buildMode: buildMode, etag: etag) { [weak self] result in
            guard let self = self else { return }
            
            switch result {
            case .success(let (data, responseEtag)):
                if data.isEmpty {
                    // 304 Not Modified
                    completion(.success(()))
                    return
                }
                
                // Parse response
                if let featureFlagsData = data["featureFlags"] as? [String: Any],
                   let jsonData = try? JSONSerialization.data(withJSONObject: featureFlagsData),
                   let flags = try? JSONDecoder().decode(NivoStackFeatureFlags.self, from: jsonData) {
                    self.featureFlags = flags
                }
                
                if let settingsData = data["sdkSettings"] as? [String: Any],
                   let jsonData = try? JSONSerialization.data(withJSONObject: settingsData),
                   let settings = try? JSONDecoder().decode(NivoStackSdkSettings.self, from: jsonData) {
                    self.sdkSettings = settings
                }
                
                if let deviceConfigData = data["deviceConfig"] as? [String: Any],
                   let jsonData = try? JSONSerialization.data(withJSONObject: deviceConfigData),
                   let config = try? JSONDecoder().decode(NivoStackDeviceConfig.self, from: jsonData) {
                    self.deviceConfig = config
                }
                
                // Update business config and localization from init data
                if let businessConfigData = data["businessConfig"] as? [String: Any] {
                    let configs = businessConfigData["configs"] as? [String: Any] ?? [:]
                    let meta = businessConfigData["meta"] as? [String: Any] ?? [:]
                    self.businessConfig.setFromInitData(configs: configs, meta: meta)
                }
                
                if let localizationData = data["localization"] as? [String: Any] {
                    let languages = localizationData["languages"] as? [[String: Any]] ?? []
                    let translations = localizationData["translations"] as? [String: String] ?? [:]
                    let defaultLanguage = localizationData["defaultLanguage"] as? String
                    self.localization.setFromInitData(languages: languages, translations: translations, defaultLanguageCode: defaultLanguage)
                }
                
                // Cache the response
                self.configCache.save(data, etag: responseEtag)
                self.lastSyncEtag = responseEtag
                self.configFetched = true
                
                completion(.success(()))
                
            case .failure(let error):
                completion(.failure(error))
            }
        }
    }
    
    private func applyCachedConfig(_ cached: CachedSdkConfig) {
        if let featureFlagsData = cached.featureFlags,
           let jsonData = try? JSONSerialization.data(withJSONObject: featureFlagsData),
           let flags = try? JSONDecoder().decode(NivoStackFeatureFlags.self, from: jsonData) {
            featureFlags = flags
        }
        
        if let settingsData = cached.sdkSettings,
           let jsonData = try? JSONSerialization.data(withJSONObject: settingsData),
           let settings = try? JSONDecoder().decode(NivoStackSdkSettings.self, from: jsonData) {
            sdkSettings = settings
        }
        
        if let deviceConfigData = cached.deviceConfig,
           let jsonData = try? JSONSerialization.data(withJSONObject: deviceConfigData),
           let config = try? JSONDecoder().decode(NivoStackDeviceConfig.self, from: jsonData) {
            deviceConfig = config
        }
        
        if let businessConfigData = cached.businessConfig {
            let configs = businessConfigData["configs"] as? [String: Any] ?? [:]
            let meta = businessConfigData["meta"] as? [String: Any] ?? [:]
            businessConfig.setFromInitData(configs: configs, meta: meta)
        }
        
        if let localizationData = cached.localization {
            let languages = localizationData["languages"] as? [[String: Any]] ?? []
            let translations = localizationData["translations"] as? [String: String] ?? [:]
            let defaultLanguage = localizationData["defaultLanguage"] as? String
            localization.setFromInitData(languages: languages, translations: translations, defaultLanguageCode: defaultLanguage)
        }
        
        lastSyncEtag = cached.etag
    }
    
    private func startSession() {
        guard featureFlags.sessionTracking else { return }
        guard let deviceId = deviceId, let sessionToken = sessionToken else { return }
        
        let device = UIDevice.current
        let bundle = Bundle.main
        let locale = Locale.current
        
        apiClient.startSession(
            deviceId: deviceId,
            sessionToken: sessionToken,
            appVersion: bundle.infoDictionary?["CFBundleShortVersionString"] as? String,
            osVersion: device.systemVersion,
            locale: locale.identifier,
            timezone: TimeZone.current.identifier
        ) { [weak self] result in
            if case .success = result {
                self?.isSessionActive = true
                self?.sessionStarted = true
            }
        }
    }
    
    private func endSession() {
        guard isSessionActive, let sessionToken = sessionToken else { return }
        
        apiClient.endSession(sessionToken: sessionToken) { [weak self] _ in
            self?.isSessionActive = false
        }
    }
    
    private func flushTraces(completion: ((Result<Void, Error>) -> Void)? = nil) {
        guard !traceQueue.isEmpty, let deviceId = deviceId else {
            completion?(.success(()))
            return
        }
        
        let traces = traceQueue
        traceQueue.removeAll()
        
        apiClient.sendTraces(deviceId: deviceId, sessionToken: sessionToken, traces: traces) { result in
            completion?(result)
        }
    }
    
    private func flushLogs(completion: ((Result<Void, Error>) -> Void)? = nil) {
        guard !logQueue.isEmpty, let deviceId = deviceId else {
            completion?(.success(()))
            return
        }
        
        let logs = logQueue
        logQueue.removeAll()
        
        apiClient.sendLogs(deviceId: deviceId, sessionToken: sessionToken, logs: logs) { result in
            completion?(result)
        }
    }
    
    private func startPeriodicSync(interval: TimeInterval) {
        stopPeriodicSync()
        
        syncTimer = Timer.scheduledTimer(withTimeInterval: interval, repeats: true) { [weak self] _ in
            guard let self = self, let deviceId = self.deviceId else { return }
            self.fetchSdkInitData(deviceId: deviceId, forceRefresh: false) { _ in }
        }
    }
    
    private func stopPeriodicSync() {
        syncTimer?.invalidate()
        syncTimer = nil
    }
}

