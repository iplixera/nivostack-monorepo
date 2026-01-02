import Foundation

/// Device information model for NivoStack
public struct NivoStackDeviceInfo: Codable {
    public let deviceId: String
    public let platform: String
    public let osVersion: String?
    public let appVersion: String?
    public let model: String?
    public let manufacturer: String?
    public let metadata: [String: Any]?
    
    public init(
        deviceId: String,
        platform: String,
        osVersion: String? = nil,
        appVersion: String? = nil,
        model: String? = nil,
        manufacturer: String? = nil,
        metadata: [String: Any]? = nil
    ) {
        self.deviceId = deviceId
        self.platform = platform
        self.osVersion = osVersion
        self.appVersion = appVersion
        self.model = model
        self.manufacturer = manufacturer
        self.metadata = metadata
    }
    
    // Custom Codable implementation for metadata dictionary
    enum CodingKeys: String, CodingKey {
        case deviceId
        case platform
        case osVersion
        case appVersion
        case model
        case manufacturer
        case metadata
    }
    
    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(deviceId, forKey: .deviceId)
        try container.encode(platform, forKey: .platform)
        try container.encodeIfPresent(osVersion, forKey: .osVersion)
        try container.encodeIfPresent(appVersion, forKey: .appVersion)
        try container.encodeIfPresent(model, forKey: .model)
        try container.encodeIfPresent(manufacturer, forKey: .manufacturer)
        if let metadata = metadata {
            // Encode metadata as JSON
            let jsonData = try JSONSerialization.data(withJSONObject: metadata)
            try container.encode(jsonData, forKey: .metadata)
        }
    }
    
    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        deviceId = try container.decode(String.self, forKey: .deviceId)
        platform = try container.decode(String.self, forKey: .platform)
        osVersion = try container.decodeIfPresent(String.self, forKey: .osVersion)
        appVersion = try container.decodeIfPresent(String.self, forKey: .appVersion)
        model = try container.decodeIfPresent(String.self, forKey: .model)
        manufacturer = try container.decodeIfPresent(String.self, forKey: .manufacturer)
        if let jsonData = try? container.decode(Data.self, forKey: .metadata),
           let metadataDict = try? JSONSerialization.jsonObject(with: jsonData) as? [String: Any] {
            metadata = metadataDict
        } else {
            metadata = nil
        }
    }
}

