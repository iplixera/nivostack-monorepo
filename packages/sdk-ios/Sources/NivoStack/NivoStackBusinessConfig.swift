import Foundation

/// Business configuration value types
public enum ConfigValueType: String, Codable {
    case string
    case integer
    case boolean
    case decimal
    case json
    case image
}

/// Represents a single business configuration
public struct BusinessConfig {
    public let key: String
    public let valueType: ConfigValueType
    public let value: Any?
    public let category: String?
    public let version: Int
    
    public init(
        key: String,
        valueType: ConfigValueType,
        value: Any? = nil,
        category: String? = nil,
        version: Int = 1
    ) {
        self.key = key
        self.valueType = valueType
        self.value = value
        self.category = category
        self.version = version
    }
    
    /// Create from flat API format (key-value with meta)
    public static func fromFlat(key: String, value: Any?, meta: [String: Any]?) -> BusinessConfig {
        let metaInfo = meta ?? [:]
        let typeString = metaInfo["type"] as? String ?? "string"
        let category = metaInfo["category"] as? String
        let version = metaInfo["version"] as? Int ?? 1
        
        let valueType: ConfigValueType
        switch typeString {
        case "string": valueType = .string
        case "integer": valueType = .integer
        case "boolean": valueType = .boolean
        case "decimal": valueType = .decimal
        case "json": valueType = .json
        case "image": valueType = .image
        default: valueType = .string
        }
        
        return BusinessConfig(key: key, valueType: valueType, value: value, category: category, version: version)
    }
    
    /// Get value as String
    public var stringValue: String? {
        if let str = value as? String { return str }
        return value.map { "\($0)" }
    }
    
    /// Get value as Int
    public var intValue: Int? {
        if let int = value as? Int { return int }
        if let num = value as? NSNumber { return num.intValue }
        return nil
    }
    
    /// Get value as Bool
    public var boolValue: Bool? {
        if let bool = value as? Bool { return bool }
        if let num = value as? NSNumber { return num.boolValue }
        return nil
    }
    
    /// Get value as Double
    public var doubleValue: Double? {
        if let double = value as? Double { return double }
        if let num = value as? NSNumber { return num.doubleValue }
        return nil
    }
    
    /// Get value as Dictionary (for JSON type)
    public var jsonValue: [String: Any]? {
        if let dict = value as? [String: Any] { return dict }
        return nil
    }
    
    /// Get value as image URL
    public var imageUrl: String? {
        return stringValue
    }
}

/// Client for fetching and caching business configurations from NivoStack
public class NivoStackBusinessConfig {
    private let apiClient: NivoStackApiClient
    
    /// Cache of configurations
    private var cache: [String: BusinessConfig] = [:]
    
    /// Raw configs cache (flat key-value)
    private var rawConfigs: [String: Any] = [:]
    
    /// Meta information cache
    private var metaCache: [String: Any] = [:]
    
    /// Last fetch timestamp
    private var lastFetch: Date?
    
    /// Cache duration (default: 5 minutes)
    public let cacheDuration: TimeInterval
    
    public init(apiClient: NivoStackApiClient, cacheDuration: TimeInterval = 300) {
        self.apiClient = apiClient
        self.cacheDuration = cacheDuration
    }
    
    /// Fetch all configurations
    public func fetchAll(forceRefresh: Bool = false, completion: @escaping (Result<[String: BusinessConfig], Error>) -> Void) {
        if !forceRefresh && isCacheValid() {
            completion(.success(cache))
            return
        }
        
        apiClient.getBusinessConfigs { [weak self] result in
            guard let self = self else { return }
            
            switch result {
            case .success(let response):
                // Extract configs and meta from flat response format
                let configs = response["configs"] as? [String: Any] ?? [:]
                let meta = response["meta"] as? [String: Any] ?? [:]
                
                self.cache.removeAll()
                self.metaCache = meta
                self.rawConfigs = configs
                
                // Parse flat key-value configs with meta
                for (key, value) in configs {
                    let metaInfo = meta[key] as? [String: Any]
                    let config = BusinessConfig.fromFlat(key: key, value: value, meta: metaInfo)
                    self.cache[key] = config
                }
                
                self.lastFetch = Date()
                completion(.success(self.cache))
                
            case .failure(let error):
                completion(.failure(error))
            }
        }
    }
    
    /// Get a single config value by key
    public func get(_ key: String) -> BusinessConfig? {
        return cache[key]
    }
    
    /// Get string value with default
    public func getString(_ key: String, defaultValue: String = "") -> String {
        return cache[key]?.stringValue ?? defaultValue
    }
    
    /// Get int value with default
    public func getInt(_ key: String, defaultValue: Int = 0) -> Int {
        return cache[key]?.intValue ?? defaultValue
    }
    
    /// Get bool value with default
    public func getBool(_ key: String, defaultValue: Bool = false) -> Bool {
        return cache[key]?.boolValue ?? defaultValue
    }
    
    /// Get double value with default
    public func getDouble(_ key: String, defaultValue: Double = 0.0) -> Double {
        return cache[key]?.doubleValue ?? defaultValue
    }
    
    /// Get JSON value
    public func getJson(_ key: String) -> [String: Any]? {
        return cache[key]?.jsonValue
    }
    
    /// Get image URL
    public func getImageUrl(_ key: String) -> String? {
        return cache[key]?.imageUrl
    }
    
    /// Check if a feature is enabled (convenience for boolean configs)
    public func isFeatureEnabled(_ key: String, defaultValue: Bool = false) -> Bool {
        return getBool(key, defaultValue: defaultValue)
    }
    
    private func isCacheValid() -> Bool {
        guard let lastFetch = lastFetch else { return false }
        return Date().timeIntervalSince(lastFetch) < cacheDuration
    }
    
    /// Clear cache
    public func clearCache() {
        cache.removeAll()
        rawConfigs = [:]
        metaCache = [:]
        lastFetch = nil
    }
    
    /// Set configs from SDK init data (pre-populates cache without network request)
    public func setFromInitData(configs: [String: Any], meta: [String: Any]) {
        cache.removeAll()
        rawConfigs = configs
        metaCache = meta
        
        // Parse flat key-value configs with meta
        for (key, value) in configs {
            let metaInfo = meta[key] as? [String: Any]
            let config = BusinessConfig.fromFlat(key: key, value: value, meta: metaInfo)
            cache[key] = config
        }
        
        lastFetch = Date()
    }
}

