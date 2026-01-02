import Foundation

/// Device-specific configuration from the server
///
/// Contains debug mode status and computed tracking enabled flag
public struct NivoStackDeviceConfig: Codable {
    /// Device ID from server (internal use)
    public let deviceId: String?
    
    /// Short device code for support identification (e.g., "A7B3-X9K2")
    public let deviceCode: String?
    
    /// Whether debug mode is enabled for this device
    public let debugModeEnabled: Bool
    
    /// When debug mode expires (nil = no expiry)
    public let debugModeExpiresAt: Date?
    
    /// Whether tracking is enabled for this device
    /// Computed based on tracking mode and debug status
    public let trackingEnabled: Bool
    
    public init(
        deviceId: String? = nil,
        deviceCode: String? = nil,
        debugModeEnabled: Bool = false,
        debugModeExpiresAt: Date? = nil,
        trackingEnabled: Bool = true
    ) {
        self.deviceId = deviceId
        self.deviceCode = deviceCode
        self.debugModeEnabled = debugModeEnabled
        self.debugModeExpiresAt = debugModeExpiresAt
        self.trackingEnabled = trackingEnabled
    }
    
    /// Create from JSON response
    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        deviceId = try container.decodeIfPresent(String.self, forKey: .deviceId)
        deviceCode = try container.decodeIfPresent(String.self, forKey: .deviceCode)
        debugModeEnabled = try container.decodeIfPresent(Bool.self, forKey: .debugModeEnabled) ?? false
        
        if let expiresAtString = try container.decodeIfPresent(String.self, forKey: .debugModeExpiresAt) {
            let formatter = ISO8601DateFormatter()
            debugModeExpiresAt = formatter.date(from: expiresAtString)
        } else {
            debugModeExpiresAt = nil
        }
        
        trackingEnabled = try container.decodeIfPresent(Bool.self, forKey: .trackingEnabled) ?? true
    }
    
    /// Create default config (tracking enabled)
    public static func defaults() -> NivoStackDeviceConfig {
        return NivoStackDeviceConfig(
            debugModeEnabled: false,
            trackingEnabled: true
        )
    }
    
    enum CodingKeys: String, CodingKey {
        case deviceId
        case deviceCode
        case debugModeEnabled
        case debugModeExpiresAt
        case trackingEnabled
    }
}

