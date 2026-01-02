import Foundation

/// Represents a language supported by the project
public struct NivoStackLanguage: Codable {
    public let id: String
    public let code: String
    public let name: String
    public let nativeName: String?
    public let isDefault: Bool
    public let isEnabled: Bool
    public let isRTL: Bool
    
    public init(
        id: String,
        code: String,
        name: String,
        nativeName: String? = nil,
        isDefault: Bool = false,
        isEnabled: Bool = true,
        isRTL: Bool = false
    ) {
        self.id = id
        self.code = code
        self.name = name
        self.nativeName = nativeName
        self.isDefault = isDefault
        self.isEnabled = isEnabled
        self.isRTL = isRTL
    }
}

/// Client for fetching and managing translations from NivoStack
public class NivoStackLocalization {
    private let apiClient: NivoStackApiClient
    
    /// Current language code
    private var currentLanguageCode: String?
    
    /// Current language info
    private var currentLanguage: NivoStackLanguage?
    
    /// Available languages
    private var languages: [NivoStackLanguage] = []
    
    /// Translation cache
    private var translationsCache: [String: [String: String]] = [:]
    
    /// Cache duration (default: 30 minutes)
    public let cacheDuration: TimeInterval
    
    /// Last fetch timestamps per language
    private var lastFetchTimes: [String: Date] = [:]
    
    /// Preference key for persisting language selection
    private static let prefKeyLanguage = "nivostack_language"
    
    public init(apiClient: NivoStackApiClient, cacheDuration: TimeInterval = 1800) {
        self.apiClient = apiClient
        self.cacheDuration = cacheDuration
    }
    
    /// Get available languages
    public func getLanguages() -> [NivoStackLanguage] {
        return languages
    }
    
    /// Get current language code
    public func getCurrentLanguageCode() -> String? {
        return currentLanguageCode
    }
    
    /// Get current language info
    public func getCurrentLanguage() -> NivoStackLanguage? {
        return currentLanguage
    }
    
    /// Get current translations
    public func getTranslations() -> [String: String] {
        guard let code = currentLanguageCode else { return [:] }
        return translationsCache[code] ?? [:]
    }
    
    /// Check if current language is RTL
    public func isRTL() -> Bool {
        return currentLanguage?.isRTL ?? false
    }
    
    /// Set current language and fetch translations
    public func setLanguage(_ languageCode: String, completion: @escaping (Result<Void, Error>) -> Void) {
        guard isLanguageSupported(languageCode) else {
            completion(.failure(NSError(domain: "NivoStackLocalization", code: -1, userInfo: [NSLocalizedDescriptionKey: "Language not supported"])))
            return
        }
        
        currentLanguageCode = languageCode
        currentLanguage = languages.first { $0.code == languageCode }
        
        // Persist selection
        UserDefaults.standard.set(languageCode, forKey: Self.prefKeyLanguage)
        
        // Fetch translations
        fetchTranslations(languageCode: languageCode, forceRefresh: false, completion: completion)
    }
    
    /// Fetch translations for a specific language
    public func fetchTranslations(
        languageCode: String,
        forceRefresh: Bool = false,
        completion: @escaping (Result<Void, Error>) -> Void
    ) {
        if !forceRefresh && isCacheValid(languageCode: languageCode) {
            completion(.success(()))
            return
        }
        
        apiClient.getLocalization(language: languageCode) { [weak self] result in
            guard let self = self else { return }
            
            switch result {
            case .success(let response):
                let translationsData = response["translations"] as? [String: Any] ?? [:]
                var translations: [String: String] = [:]
                
                for (key, value) in translationsData {
                    translations[key] = "\(value)"
                }
                
                self.translationsCache[languageCode] = translations
                self.lastFetchTimes[languageCode] = Date()
                completion(.success(()))
                
            case .failure(let error):
                completion(.failure(error))
            }
        }
    }
    
    /// Get translation for a key
    public func translate(_ key: String, defaultValue: String? = nil, args: [String: String]? = nil) -> String {
        var value = getTranslations()[key] ?? defaultValue ?? key
        
        // Replace placeholders if args provided
        if let args = args {
            for (argKey, argValue) in args {
                value = value.replacingOccurrences(of: "{\(argKey)}", with: argValue)
                value = value.replacingOccurrences(of: "{{\(argKey)}}", with: argValue)
            }
        }
        
        return value
    }
    
    /// Shorthand for translate
    public func t(_ key: String, defaultValue: String? = nil, args: [String: String]? = nil) -> String {
        return translate(key, defaultValue: defaultValue, args: args)
    }
    
    /// Check if a translation key exists
    public func hasKey(_ key: String) -> Bool {
        return getTranslations().keys.contains(key)
    }
    
    private func isLanguageSupported(_ code: String) -> Bool {
        return languages.contains { $0.code == code && $0.isEnabled }
    }
    
    private func isCacheValid(languageCode: String) -> Bool {
        guard let lastFetch = lastFetchTimes[languageCode] else { return false }
        return Date().timeIntervalSince(lastFetch) < cacheDuration
    }
    
    /// Clear all caches
    public func clearCache() {
        translationsCache.removeAll()
        lastFetchTimes.removeAll()
    }
    
    /// Set localization data from SDK init response
    public func setFromInitData(
        languages: [[String: Any]],
        translations: [String: String],
        defaultLanguageCode: String?
    ) {
        // Parse and set languages
        self.languages = languages.compactMap { json in
            guard let id = json["id"] as? String,
                  let code = json["code"] as? String,
                  let name = json["name"] as? String else {
                return nil
            }
            
            return NivoStackLanguage(
                id: id,
                code: code,
                name: name,
                nativeName: json["nativeName"] as? String,
                isDefault: json["isDefault"] as? Bool ?? false,
                isEnabled: json["isEnabled"] as? Bool ?? true,
                isRTL: json["isRTL"] as? Bool ?? false
            )
        }.filter { $0.isEnabled }
        
        // Set default language if provided
        let languageCode = defaultLanguageCode ?? languages.first { ($0["isDefault"] as? Bool) == true }?["code"] as? String ?? languages.first?["code"] as? String ?? ""
        
        currentLanguageCode = languageCode
        currentLanguage = self.languages.first { $0.code == languageCode }
        
        // Cache translations
        translationsCache[languageCode] = translations
        lastFetchTimes[languageCode] = Date()
        
        // Persist language selection
        UserDefaults.standard.set(languageCode, forKey: Self.prefKeyLanguage)
    }
}

