import Foundation

/// SDK Settings model for controlling API tracing and logging behavior
public struct NivoStackSdkSettings: Codable {
    // Security settings
    public let captureRequestBodies: Bool
    public let captureResponseBodies: Bool
    public let capturePrintStatements: Bool
    public let sanitizeSensitiveData: Bool
    public let sensitiveFieldPatterns: [String]
    
    // Performance settings
    public let maxLogQueueSize: Int
    public let maxTraceQueueSize: Int
    public let flushIntervalSeconds: Int
    public let enableBatching: Bool
    
    // Log control
    public let minLogLevel: String
    public let verboseErrors: Bool
    
    public init(
        captureRequestBodies: Bool = true,
        captureResponseBodies: Bool = true,
        capturePrintStatements: Bool = false,
        sanitizeSensitiveData: Bool = true,
        sensitiveFieldPatterns: [String] = ["password", "token", "secret", "apiKey", "api_key", "authorization", "cookie"],
        maxLogQueueSize: Int = 100,
        maxTraceQueueSize: Int = 50,
        flushIntervalSeconds: Int = 30,
        enableBatching: Bool = true,
        minLogLevel: String = "debug",
        verboseErrors: Bool = false
    ) {
        self.captureRequestBodies = captureRequestBodies
        self.captureResponseBodies = captureResponseBodies
        self.capturePrintStatements = capturePrintStatements
        self.sanitizeSensitiveData = sanitizeSensitiveData
        self.sensitiveFieldPatterns = sensitiveFieldPatterns
        self.maxLogQueueSize = maxLogQueueSize
        self.maxTraceQueueSize = maxTraceQueueSize
        self.flushIntervalSeconds = flushIntervalSeconds
        self.enableBatching = enableBatching
        self.minLogLevel = minLogLevel
        self.verboseErrors = verboseErrors
    }
    
    /// Create default settings
    public static func defaults() -> NivoStackSdkSettings {
        return NivoStackSdkSettings()
    }
    
    /// Create from JSON dictionary
    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        captureRequestBodies = try container.decodeIfPresent(Bool.self, forKey: .captureRequestBodies) ?? true
        captureResponseBodies = try container.decodeIfPresent(Bool.self, forKey: .captureResponseBodies) ?? true
        capturePrintStatements = try container.decodeIfPresent(Bool.self, forKey: .capturePrintStatements) ?? false
        sanitizeSensitiveData = try container.decodeIfPresent(Bool.self, forKey: .sanitizeSensitiveData) ?? true
        sensitiveFieldPatterns = try container.decodeIfPresent([String].self, forKey: .sensitiveFieldPatterns) ?? ["password", "token", "secret", "apiKey", "api_key", "authorization", "cookie"]
        maxLogQueueSize = try container.decodeIfPresent(Int.self, forKey: .maxLogQueueSize) ?? 100
        maxTraceQueueSize = try container.decodeIfPresent(Int.self, forKey: .maxTraceQueueSize) ?? 50
        flushIntervalSeconds = try container.decodeIfPresent(Int.self, forKey: .flushIntervalSeconds) ?? 30
        enableBatching = try container.decodeIfPresent(Bool.self, forKey: .enableBatching) ?? true
        minLogLevel = try container.decodeIfPresent(String.self, forKey: .minLogLevel) ?? "debug"
        verboseErrors = try container.decodeIfPresent(Bool.self, forKey: .verboseErrors) ?? false
    }
    
    enum CodingKeys: String, CodingKey {
        case captureRequestBodies
        case captureResponseBodies
        case capturePrintStatements
        case sanitizeSensitiveData
        case sensitiveFieldPatterns
        case maxLogQueueSize
        case maxTraceQueueSize
        case flushIntervalSeconds
        case enableBatching
        case minLogLevel
        case verboseErrors
    }
    
    /// Check if a log level should be captured based on minLogLevel
    public func shouldCaptureLogLevel(_ level: String) -> Bool {
        // If logging is disabled, don't capture any logs
        if minLogLevel.lowercased() == "disabled" {
            return false
        }
        
        let levelOrder = ["verbose", "debug", "info", "warn", "error", "assert"]
        guard let minIndex = levelOrder.firstIndex(where: { $0 == minLogLevel.lowercased() }),
              let levelIndex = levelOrder.firstIndex(where: { $0 == level.lowercased() }) else {
            // If either level is unknown, default to capturing (unless disabled)
            return minLogLevel.lowercased() != "disabled"
        }
        
        return levelIndex >= minIndex
    }
    
    /// Sanitize a string value by redacting sensitive patterns
    public func sanitizeValue(key: String, value: String) -> String {
        if !sanitizeSensitiveData { return value }
        
        let keyLower = key.lowercased()
        for pattern in sensitiveFieldPatterns {
            if keyLower.contains(pattern.lowercased()) {
                return "[REDACTED]"
            }
        }
        return value
    }
    
    /// Sanitize a dictionary by redacting sensitive fields
    public func sanitizeMap(_ data: [String: Any]) -> [String: Any] {
        if !sanitizeSensitiveData { return data }
        
        var sanitized: [String: Any] = [:]
        for (key, value) in data {
            if let stringValue = value as? String {
                sanitized[key] = sanitizeValue(key: key, value: stringValue)
            } else if let dictValue = value as? [String: Any] {
                sanitized[key] = sanitizeMap(dictValue)
            } else {
                sanitized[key] = value
            }
        }
        return sanitized
    }
}

/// API endpoint configuration for per-endpoint settings
public struct NivoStackApiConfig: Codable {
    public let endpoint: String
    public let method: String?
    public let enableLogs: Bool
    public let captureRequestBody: Bool
    public let captureResponseBody: Bool
    public let costPerRequest: Double?
    
    public init(
        endpoint: String,
        method: String? = nil,
        enableLogs: Bool = true,
        captureRequestBody: Bool = true,
        captureResponseBody: Bool = true,
        costPerRequest: Double? = nil
    ) {
        self.endpoint = endpoint
        self.method = method
        self.enableLogs = enableLogs
        self.captureRequestBody = captureRequestBody
        self.captureResponseBody = captureResponseBody
        self.costPerRequest = costPerRequest
    }
    
    /// Check if this config matches a given URL and method
    public func matches(url: String, requestMethod: String) -> Bool {
        // Extract path from URL
        let path: String
        if let uri = URL(string: url) {
            path = uri.path
        } else {
            path = url
        }
        
        // Check if path matches endpoint pattern
        if !pathMatches(path: path, pattern: endpoint) { return false }
        
        // Check method if specified
        if let method = method, !method.isEmpty {
            if method.uppercased() != requestMethod.uppercased() {
                return false
            }
        }
        
        return true
    }
    
    private func pathMatches(path: String, pattern: String) -> Bool {
        // Simple path matching - check if path starts with or equals pattern
        // Remove trailing slashes for comparison
        let normalizedPath = path.hasSuffix("/") ? String(path.dropLast()) : path
        let normalizedPattern = pattern.hasSuffix("/") ? String(pattern.dropLast()) : pattern
        
        return normalizedPath == normalizedPattern || normalizedPath.hasPrefix("\(normalizedPattern)/")
    }
}

