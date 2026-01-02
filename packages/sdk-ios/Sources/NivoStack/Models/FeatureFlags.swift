import Foundation

/// Feature flags configuration fetched from NivoStack server
public struct NivoStackFeatureFlags: Codable {
    /// Master kill switch - disables entire SDK when false
    /// When this is false, ALL SDK functionality is disabled regardless of other flags
    public let sdkEnabled: Bool
    
    /// Track HTTP requests and responses
    public let apiTracking: Bool
    
    /// Track screen views and navigation flow
    public let screenTracking: Bool
    
    /// Capture and report app crashes
    public let crashReporting: Bool
    
    /// Send logs to dashboard
    public let logging: Bool
    
    /// Register and track devices
    public let deviceTracking: Bool
    
    /// Track user sessions
    public let sessionTracking: Bool
    
    /// Enable remote business configuration
    public let businessConfig: Bool
    
    /// Enable remote localization strings
    public let localization: Bool
    
    /// Queue events when offline and sync later
    public let offlineSupport: Bool
    
    /// Batch events before sending to reduce network calls
    public let batchEvents: Bool
    
    public init(
        sdkEnabled: Bool = true,
        apiTracking: Bool = true,
        screenTracking: Bool = true,
        crashReporting: Bool = true,
        logging: Bool = true,
        deviceTracking: Bool = true,
        sessionTracking: Bool = true,
        businessConfig: Bool = true,
        localization: Bool = true,
        offlineSupport: Bool = false,
        batchEvents: Bool = true
    ) {
        self.sdkEnabled = sdkEnabled
        self.apiTracking = apiTracking
        self.screenTracking = screenTracking
        self.crashReporting = crashReporting
        self.logging = logging
        self.deviceTracking = deviceTracking
        self.sessionTracking = sessionTracking
        self.businessConfig = businessConfig
        self.localization = localization
        self.offlineSupport = offlineSupport
        self.batchEvents = batchEvents
    }
    
    /// Default feature flags (all enabled except offline support)
    public static func defaults() -> NivoStackFeatureFlags {
        return NivoStackFeatureFlags()
    }
    
    /// Create from JSON dictionary
    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        sdkEnabled = try container.decodeIfPresent(Bool.self, forKey: .sdkEnabled) ?? true
        apiTracking = try container.decodeIfPresent(Bool.self, forKey: .apiTracking) ?? true
        screenTracking = try container.decodeIfPresent(Bool.self, forKey: .screenTracking) ?? true
        crashReporting = try container.decodeIfPresent(Bool.self, forKey: .crashReporting) ?? true
        logging = try container.decodeIfPresent(Bool.self, forKey: .logging) ?? true
        deviceTracking = try container.decodeIfPresent(Bool.self, forKey: .deviceTracking) ?? true
        sessionTracking = try container.decodeIfPresent(Bool.self, forKey: .sessionTracking) ?? true
        businessConfig = try container.decodeIfPresent(Bool.self, forKey: .businessConfig) ?? true
        localization = try container.decodeIfPresent(Bool.self, forKey: .localization) ?? true
        offlineSupport = try container.decodeIfPresent(Bool.self, forKey: .offlineSupport) ?? false
        batchEvents = try container.decodeIfPresent(Bool.self, forKey: .batchEvents) ?? true
    }
    
    enum CodingKeys: String, CodingKey {
        case sdkEnabled
        case apiTracking
        case screenTracking
        case crashReporting
        case logging
        case deviceTracking
        case sessionTracking
        case businessConfig
        case localization
        case offlineSupport
        case batchEvents
    }
}

