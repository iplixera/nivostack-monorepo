import Foundation

/// Local cache for SDK configuration data
///
/// Caches the SDK init response (feature flags, SDK settings, business config)
/// to enable instant app startup for returning users.
public class SdkConfigCache {
    private static let cacheKey = "nivostack_sdk_config_cache"
    private static let timestampKey = "nivostack_sdk_config_timestamp"
    private static let versionKey = "nivostack_sdk_config_version"
    private static let etagKey = "nivostack_sdk_config_etag"
    
    /// Current cache version - increment when cache format changes
    /// v2: Added deviceConfig field
    private static let currentVersion = 2
    
    /// Default cache duration (1 hour)
    /// After this, cached data is considered stale but still usable
    public let cacheDuration: TimeInterval
    
    /// Maximum cache age before it's considered invalid (24 hours)
    /// Cache older than this will be ignored completely
    public let maxCacheAge: TimeInterval
    
    public init(
        cacheDuration: TimeInterval = 3600, // 1 hour
        maxCacheAge: TimeInterval = 86400 // 24 hours
    ) {
        self.cacheDuration = cacheDuration
        self.maxCacheAge = maxCacheAge
    }
    
    /// Load cached SDK config data
    ///
    /// Returns nil if:
    /// - No cached data exists
    /// - Cache version mismatch
    /// - Cache is older than maxCacheAge
    /// - Cache data is corrupted
    public func load() -> CachedSdkConfig? {
        let defaults = UserDefaults.standard
        
        // Check cache version
        let version = defaults.integer(forKey: Self.versionKey)
        if version != Self.currentVersion {
            // Cache format changed, invalidate
            clear()
            return nil
        }
        
        // Check if cache exists
        guard let cachedData = defaults.data(forKey: Self.cacheKey) else {
            return nil
        }
        
        // Check cache age
        let timestamp = defaults.double(forKey: Self.timestampKey)
        if timestamp == 0 {
            return nil
        }
        
        let cachedAt = Date(timeIntervalSince1970: timestamp)
        let age = Date().timeIntervalSince(cachedAt)
        
        // If cache is too old, ignore it completely
        if age > maxCacheAge {
            clear()
            return nil
        }
        
        // Parse cached data
        guard let data = try? JSONSerialization.jsonObject(with: cachedData) as? [String: Any] else {
            clear()
            return nil
        }
        
        // Get stored ETag
        let etag = defaults.string(forKey: Self.etagKey)
        
        return CachedSdkConfig(
            featureFlags: data["featureFlags"] as? [String: Any],
            sdkSettings: data["sdkSettings"] as? [String: Any],
            businessConfig: data["businessConfig"] as? [String: Any],
            localization: data["localization"] as? [String: Any],
            deviceConfig: data["deviceConfig"] as? [String: Any],
            cachedAt: cachedAt,
            isStale: age > cacheDuration,
            etag: etag
        )
    }
    
    /// Save SDK config data to cache
    ///
    /// - Parameters:
    ///   - data: The SDK init response data to cache
    ///   - etag: Optional ETag from server response for conditional requests
    public func save(_ data: [String: Any], etag: String? = nil) {
        guard let jsonData = try? JSONSerialization.data(withJSONObject: data) else {
            return
        }
        
        let defaults = UserDefaults.standard
        defaults.set(jsonData, forKey: Self.cacheKey)
        defaults.set(Date().timeIntervalSince1970, forKey: Self.timestampKey)
        defaults.set(Self.currentVersion, forKey: Self.versionKey)
        if let etag = etag {
            defaults.set(etag, forKey: Self.etagKey)
        }
    }
    
    /// Clear cached data
    public func clear() {
        let defaults = UserDefaults.standard
        defaults.removeObject(forKey: Self.cacheKey)
        defaults.removeObject(forKey: Self.timestampKey)
        defaults.removeObject(forKey: Self.versionKey)
        defaults.removeObject(forKey: Self.etagKey)
    }
    
    /// Check if cache is stale (older than cacheDuration but still valid)
    public func isStale() -> Bool {
        let defaults = UserDefaults.standard
        let timestamp = defaults.double(forKey: Self.timestampKey)
        if timestamp == 0 { return true }
        
        let cachedAt = Date(timeIntervalSince1970: timestamp)
        return Date().timeIntervalSince(cachedAt) > cacheDuration
    }
    
    /// Check if cache exists and is valid
    public func hasValidCache() -> Bool {
        return load() != nil
    }
}

/// Represents cached SDK configuration data
public struct CachedSdkConfig {
    /// Feature flags from cache
    public let featureFlags: [String: Any]?
    
    /// SDK settings from cache
    public let sdkSettings: [String: Any]?
    
    /// Business config from cache
    public let businessConfig: [String: Any]?
    
    /// Localization from cache (languages and translations)
    public let localization: [String: Any]?
    
    /// Device config from cache (tracking status, debug mode)
    public let deviceConfig: [String: Any]?
    
    /// When the cache was created
    public let cachedAt: Date
    
    /// Whether the cache is stale (older than cacheDuration but still usable)
    public let isStale: Bool
    
    /// ETag from server for conditional requests
    public let etag: String?
    
    /// Check if cache has usable data
    public var hasData: Bool {
        return featureFlags != nil || sdkSettings != nil || businessConfig != nil || localization != nil || deviceConfig != nil
    }
    
    /// Age of the cache
    public var age: TimeInterval {
        return Date().timeIntervalSince(cachedAt)
    }
}

