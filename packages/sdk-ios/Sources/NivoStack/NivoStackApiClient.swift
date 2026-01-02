import Foundation

/// Internal API client for communicating with NivoStack server
public class NivoStackApiClient {
    public let ingestUrl: String
    public let controlUrl: String
    public let apiKey: String
    
    private let ingestSession: URLSession
    private let controlSession: URLSession
    
    public init(ingestUrl: String, controlUrl: String, apiKey: String) {
        self.ingestUrl = ingestUrl
        self.controlUrl = controlUrl
        self.apiKey = apiKey
        
        // Configure URLSession for ingest endpoints (traces, logs, crashes, sessions, devices)
        // Increased receiveTimeout to 10 seconds for device registration which can take longer
        let ingestConfig = URLSessionConfiguration.default
        ingestConfig.timeoutIntervalForRequest = 10.0
        ingestConfig.timeoutIntervalForResource = 10.0
        self.ingestSession = URLSession(configuration: ingestConfig)
        
        // Configure URLSession for control endpoints (config, localization, feature flags)
        // Increased receiveTimeout to 15 seconds for config fetches which can take longer
        let controlConfig = URLSessionConfiguration.default
        controlConfig.timeoutIntervalForRequest = 15.0
        controlConfig.timeoutIntervalForResource = 15.0
        self.controlSession = URLSession(configuration: controlConfig)
    }
    
    // MARK: - Helper Methods
    
    private func createRequest(url: URL, method: String, headers: [String: String]? = nil, body: Data? = nil) -> URLRequest {
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue(apiKey, forHTTPHeaderField: "X-API-Key")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if let headers = headers {
            for (key, value) in headers {
                request.setValue(value, forHTTPHeaderField: key)
            }
        }
        
        if let body = body {
            request.httpBody = body
        }
        
        return request
    }
    
    private func performRequest<T: Decodable>(
        session: URLSession,
        request: URLRequest,
        responseType: T.Type,
        completion: @escaping (Result<T, Error>) -> Void
    ) {
        let task = session.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let httpResponse = response as? HTTPURLResponse else {
                completion(.failure(NSError(domain: "NivoStackApiClient", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid response"])))
                return
            }
            
            guard (200...299).contains(httpResponse.statusCode) else {
                let errorMessage = String(data: data ?? Data(), encoding: .utf8) ?? "Unknown error"
                completion(.failure(NSError(domain: "NivoStackApiClient", code: httpResponse.statusCode, userInfo: [NSLocalizedDescriptionKey: errorMessage])))
                return
            }
            
            guard let data = data else {
                completion(.failure(NSError(domain: "NivoStackApiClient", code: -1, userInfo: [NSLocalizedDescriptionKey: "No data received"])))
                return
            }
            
            do {
                let decoder = JSONDecoder()
                let result = try decoder.decode(T.self, from: data)
                completion(.success(result))
            } catch {
                completion(.failure(error))
            }
        }
        
        task.resume()
    }
    
    private func performRequest(
        session: URLSession,
        request: URLRequest,
        completion: @escaping (Result<[String: Any], Error>) -> Void
    ) {
        let task = session.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let httpResponse = response as? HTTPURLResponse else {
                completion(.failure(NSError(domain: "NivoStackApiClient", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid response"])))
                return
            }
            
            guard (200...299).contains(httpResponse.statusCode) else {
                let errorMessage = String(data: data ?? Data(), encoding: .utf8) ?? "Unknown error"
                completion(.failure(NSError(domain: "NivoStackApiClient", code: httpResponse.statusCode, userInfo: [NSLocalizedDescriptionKey: errorMessage])))
                return
            }
            
            guard let data = data else {
                completion(.failure(NSError(domain: "NivoStackApiClient", code: -1, userInfo: [NSLocalizedDescriptionKey: "No data received"])))
                return
            }
            
            do {
                if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] {
                    completion(.success(json))
                } else {
                    completion(.success([:]))
                }
            } catch {
                completion(.failure(error))
            }
        }
        
        task.resume()
    }
    
    // MARK: - Device Registration (INGEST)
    
    /// Register device with NivoStack server
    ///
    /// - Parameters:
    ///   - deviceInfo: Device information
    ///   - deviceCode: Optional device code (if not provided, server will generate one)
    ///   - completion: Completion handler with device registration response
    public func registerDevice(
        deviceInfo: NivoStackDeviceInfo,
        deviceCode: String? = nil,
        completion: @escaping (Result<[String: Any], Error>) -> Void
    ) {
        guard let url = URL(string: "\(ingestUrl)/api/devices") else {
            completion(.failure(NSError(domain: "NivoStackApiClient", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"])))
            return
        }
        
        var body: [String: Any] = [
            "deviceId": deviceInfo.deviceId,
            "platform": deviceInfo.platform
        ]
        
        if let osVersion = deviceInfo.osVersion {
            body["osVersion"] = osVersion
        }
        if let appVersion = deviceInfo.appVersion {
            body["appVersion"] = appVersion
        }
        if let model = deviceInfo.model {
            body["model"] = model
        }
        if let manufacturer = deviceInfo.manufacturer {
            body["manufacturer"] = manufacturer
        }
        if let metadata = deviceInfo.metadata {
            body["metadata"] = metadata
        }
        if let deviceCode = deviceCode {
            body["deviceCode"] = deviceCode
        }
        
        guard let jsonData = try? JSONSerialization.data(withJSONObject: body) else {
            completion(.failure(NSError(domain: "NivoStackApiClient", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to encode request body"])))
            return
        }
        
        let request = createRequest(url: url, method: "POST", body: jsonData)
        performRequest(session: ingestSession, request: request, completion: completion)
    }
    
    // MARK: - User Association (INGEST)
    
    /// Associate user with device
    ///
    /// Call this after user logs in to link their identity with the device.
    public func setUser(
        deviceId: String,
        userId: String,
        email: String? = nil,
        name: String? = nil,
        completion: @escaping (Result<Void, Error>) -> Void
    ) {
        guard let url = URL(string: "\(ingestUrl)/api/devices/\(deviceId)/user") else {
            completion(.failure(NSError(domain: "NivoStackApiClient", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"])))
            return
        }
        
        var body: [String: Any] = ["userId": userId]
        if let email = email {
            body["email"] = email
        }
        if let name = name {
            body["name"] = name
        }
        
        guard let jsonData = try? JSONSerialization.data(withJSONObject: body) else {
            completion(.failure(NSError(domain: "NivoStackApiClient", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to encode request body"])))
            return
        }
        
        let request = createRequest(url: url, method: "PATCH", body: jsonData)
        let task = ingestSession.dataTask(with: request) { _, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let httpResponse = response as? HTTPURLResponse,
                  (200...299).contains(httpResponse.statusCode) else {
                completion(.failure(NSError(domain: "NivoStackApiClient", code: -1, userInfo: [NSLocalizedDescriptionKey: "Request failed"])))
                return
            }
            
            completion(.success(()))
        }
        task.resume()
    }
    
    /// Clear user from device
    ///
    /// Call this on user logout to unlink their identity from the device.
    public func clearUser(
        deviceId: String,
        completion: @escaping (Result<Void, Error>) -> Void
    ) {
        guard let url = URL(string: "\(ingestUrl)/api/devices/\(deviceId)/user") else {
            completion(.failure(NSError(domain: "NivoStackApiClient", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"])))
            return
        }
        
        let request = createRequest(url: url, method: "DELETE")
        let task = ingestSession.dataTask(with: request) { _, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let httpResponse = response as? HTTPURLResponse,
                  (200...299).contains(httpResponse.statusCode) else {
                completion(.failure(NSError(domain: "NivoStackApiClient", code: -1, userInfo: [NSLocalizedDescriptionKey: "Request failed"])))
                return
            }
            
            completion(.success(()))
        }
        task.resume()
    }
    
    // MARK: - SDK Init (CONTROL)
    
    /// Fetch SDK initialization data (feature flags, settings, configs)
    ///
    /// - Parameters:
    ///   - deviceId: Device identifier
    ///   - buildMode: Optional build mode ("preview" or "production")
    ///   - etag: Optional ETag for conditional requests
    ///   - completion: Completion handler with SDK init response
    public func getSdkInit(
        deviceId: String,
        buildMode: String? = nil,
        etag: String? = nil,
        completion: @escaping (Result<([String: Any], String?), Error>) -> Void
    ) {
        var urlString = "\(controlUrl)/api/sdk-init"
        var queryItems: [URLQueryItem] = [URLQueryItem(name: "deviceId", value: deviceId)]
        
        if let buildMode = buildMode {
            queryItems.append(URLQueryItem(name: "buildMode", value: buildMode))
        }
        
        var components = URLComponents(string: urlString)
        components?.queryItems = queryItems
        
        guard let url = components?.url else {
            completion(.failure(NSError(domain: "NivoStackApiClient", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"])))
            return
        }
        
        var headers: [String: String] = [:]
        if let etag = etag {
            headers["If-None-Match"] = etag
        }
        
        let request = createRequest(url: url, method: "GET", headers: headers)
        let task = controlSession.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let httpResponse = response as? HTTPURLResponse else {
                completion(.failure(NSError(domain: "NivoStackApiClient", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid response"])))
                return
            }
            
            // Handle 304 Not Modified (cached response)
            if httpResponse.statusCode == 304 {
                completion(.success(([:], etag)))
                return
            }
            
            guard (200...299).contains(httpResponse.statusCode) else {
                let errorMessage = String(data: data ?? Data(), encoding: .utf8) ?? "Unknown error"
                completion(.failure(NSError(domain: "NivoStackApiClient", code: httpResponse.statusCode, userInfo: [NSLocalizedDescriptionKey: errorMessage])))
                return
            }
            
            guard let data = data else {
                completion(.failure(NSError(domain: "NivoStackApiClient", code: -1, userInfo: [NSLocalizedDescriptionKey: "No data received"])))
                return
            }
            
            do {
                if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] {
                    // Extract ETag from response headers
                    let responseEtag = httpResponse.value(forHTTPHeaderField: "ETag")
                    completion(.success((json, responseEtag)))
                } else {
                    completion(.success(([:], nil)))
                }
            } catch {
                completion(.failure(error))
            }
        }
        
        task.resume()
    }
    
    // MARK: - API Traces (INGEST)
    
    /// Send API traces to NivoStack server
    public func sendTraces(
        deviceId: String,
        sessionToken: String? = nil,
        traces: [[String: Any]],
        completion: @escaping (Result<Void, Error>) -> Void
    ) {
        // Send traces in batch
        let group = DispatchGroup()
        var lastError: Error?
        
        for trace in traces {
            group.enter()
            
            guard let url = URL(string: "\(ingestUrl)/api/traces") else {
                lastError = NSError(domain: "NivoStackApiClient", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"])
                group.leave()
                continue
            }
            
            var body: [String: Any] = ["deviceId": deviceId]
            if let sessionToken = sessionToken {
                body["sessionToken"] = sessionToken
            }
            body.merge(trace) { (_, new) in new }
            
            guard let jsonData = try? JSONSerialization.data(withJSONObject: body) else {
                lastError = NSError(domain: "NivoStackApiClient", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to encode request body"])
                group.leave()
                continue
            }
            
            let request = createRequest(url: url, method: "POST", body: jsonData)
            let task = ingestSession.dataTask(with: request) { _, _, error in
                if let error = error {
                    lastError = error
                }
                group.leave()
            }
            task.resume()
        }
        
        group.notify(queue: .main) {
            if let error = lastError {
                completion(.failure(error))
            } else {
                completion(.success(()))
            }
        }
    }
    
    // MARK: - Logs (INGEST)
    
    /// Send logs to NivoStack server
    public func sendLogs(
        deviceId: String,
        sessionToken: String? = nil,
        logs: [[String: Any]],
        completion: @escaping (Result<Void, Error>) -> Void
    ) {
        // Send logs in batch
        let group = DispatchGroup()
        var lastError: Error?
        
        for log in logs {
            group.enter()
            
            guard let url = URL(string: "\(ingestUrl)/api/logs") else {
                lastError = NSError(domain: "NivoStackApiClient", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"])
                group.leave()
                continue
            }
            
            var body: [String: Any] = ["deviceId": deviceId]
            if let sessionToken = sessionToken {
                body["sessionToken"] = sessionToken
            }
            body.merge(log) { (_, new) in new }
            
            guard let jsonData = try? JSONSerialization.data(withJSONObject: body) else {
                lastError = NSError(domain: "NivoStackApiClient", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to encode request body"])
                group.leave()
                continue
            }
            
            let request = createRequest(url: url, method: "POST", body: jsonData)
            let task = ingestSession.dataTask(with: request) { _, _, error in
                if let error = error {
                    lastError = error
                }
                group.leave()
            }
            task.resume()
        }
        
        group.notify(queue: .main) {
            if let error = lastError {
                completion(.failure(error))
            } else {
                completion(.success(()))
            }
        }
    }
    
    // MARK: - Crashes (INGEST)
    
    /// Report crash to NivoStack server
    public func reportCrash(
        deviceId: String,
        sessionToken: String? = nil,
        crash: [String: Any],
        completion: @escaping (Result<Void, Error>) -> Void
    ) {
        guard let url = URL(string: "\(ingestUrl)/api/crashes") else {
            completion(.failure(NSError(domain: "NivoStackApiClient", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"])))
            return
        }
        
        var body: [String: Any] = ["deviceId": deviceId]
        if let sessionToken = sessionToken {
            body["sessionToken"] = sessionToken
        }
        body.merge(crash) { (_, new) in new }
        
        guard let jsonData = try? JSONSerialization.data(withJSONObject: body) else {
            completion(.failure(NSError(domain: "NivoStackApiClient", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to encode request body"])))
            return
        }
        
        let request = createRequest(url: url, method: "POST", body: jsonData)
        let task = ingestSession.dataTask(with: request) { _, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let httpResponse = response as? HTTPURLResponse,
                  (200...299).contains(httpResponse.statusCode) else {
                completion(.failure(NSError(domain: "NivoStackApiClient", code: -1, userInfo: [NSLocalizedDescriptionKey: "Request failed"])))
                return
            }
            
            completion(.success(()))
        }
        task.resume()
    }
    
    // MARK: - Sessions (INGEST)
    
    /// Start a new session with context
    public func startSession(
        deviceId: String,
        sessionToken: String,
        appVersion: String? = nil,
        osVersion: String? = nil,
        locale: String? = nil,
        timezone: String? = nil,
        networkType: String? = nil,
        entryScreen: String? = nil,
        userProperties: [String: Any]? = nil,
        metadata: [String: Any]? = nil,
        completion: @escaping (Result<[String: Any], Error>) -> Void
    ) {
        guard let url = URL(string: "\(ingestUrl)/api/sessions") else {
            completion(.failure(NSError(domain: "NivoStackApiClient", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"])))
            return
        }
        
        var body: [String: Any] = [
            "deviceId": deviceId,
            "sessionToken": sessionToken
        ]
        
        if let appVersion = appVersion { body["appVersion"] = appVersion }
        if let osVersion = osVersion { body["osVersion"] = osVersion }
        if let locale = locale { body["locale"] = locale }
        if let timezone = timezone { body["timezone"] = timezone }
        if let networkType = networkType { body["networkType"] = networkType }
        if let entryScreen = entryScreen { body["entryScreen"] = entryScreen }
        if let userProperties = userProperties { body["userProperties"] = userProperties }
        if let metadata = metadata { body["metadata"] = metadata }
        
        guard let jsonData = try? JSONSerialization.data(withJSONObject: body) else {
            completion(.failure(NSError(domain: "NivoStackApiClient", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to encode request body"])))
            return
        }
        
        let request = createRequest(url: url, method: "POST", body: jsonData)
        performRequest(session: ingestSession, request: request, completion: completion)
    }
    
    /// End current session with final metrics
    public func endSession(
        sessionToken: String,
        exitScreen: String? = nil,
        screenFlow: [String]? = nil,
        eventCount: Int? = nil,
        errorCount: Int? = nil,
        userProperties: [String: Any]? = nil,
        completion: @escaping (Result<[String: Any], Error>) -> Void
    ) {
        guard let url = URL(string: "\(ingestUrl)/api/sessions") else {
            completion(.failure(NSError(domain: "NivoStackApiClient", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"])))
            return
        }
        
        var body: [String: Any] = ["sessionToken": sessionToken]
        if let exitScreen = exitScreen { body["exitScreen"] = exitScreen }
        if let screenFlow = screenFlow { body["screenFlow"] = screenFlow }
        if let eventCount = eventCount { body["eventCount"] = eventCount }
        if let errorCount = errorCount { body["errorCount"] = errorCount }
        if let userProperties = userProperties { body["userProperties"] = userProperties }
        
        guard let jsonData = try? JSONSerialization.data(withJSONObject: body) else {
            completion(.failure(NSError(domain: "NivoStackApiClient", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to encode request body"])))
            return
        }
        
        let request = createRequest(url: url, method: "PUT", body: jsonData)
        performRequest(session: ingestSession, request: request, completion: completion)
    }
    
    /// Update session (add screen to flow, increment counters)
    public func updateSession(
        sessionToken: String,
        screenName: String? = nil,
        incrementEventCount: Bool? = nil,
        incrementErrorCount: Bool? = nil,
        userProperties: [String: Any]? = nil,
        metadata: [String: Any]? = nil,
        completion: @escaping (Result<[String: Any], Error>) -> Void
    ) {
        guard let url = URL(string: "\(ingestUrl)/api/sessions") else {
            completion(.failure(NSError(domain: "NivoStackApiClient", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"])))
            return
        }
        
        var body: [String: Any] = ["sessionToken": sessionToken]
        if let screenName = screenName { body["screenName"] = screenName }
        if incrementEventCount == true { body["incrementEventCount"] = true }
        if incrementErrorCount == true { body["incrementErrorCount"] = true }
        if let userProperties = userProperties { body["userProperties"] = userProperties }
        if let metadata = metadata { body["metadata"] = metadata }
        
        guard let jsonData = try? JSONSerialization.data(withJSONObject: body) else {
            completion(.failure(NSError(domain: "NivoStackApiClient", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to encode request body"])))
            return
        }
        
        let request = createRequest(url: url, method: "PATCH", body: jsonData)
        performRequest(session: ingestSession, request: request, completion: completion)
    }
    
    // MARK: - Business Config (CONTROL)
    
    /// Fetch business configurations
    public func getBusinessConfigs(
        category: String? = nil,
        buildMode: String? = nil,
        completion: @escaping (Result<[String: Any], Error>) -> Void
    ) {
        var urlString = "\(controlUrl)/api/business-config"
        var queryItems: [URLQueryItem] = []
        
        if let category = category {
            queryItems.append(URLQueryItem(name: "category", value: category))
        }
        if let buildMode = buildMode {
            queryItems.append(URLQueryItem(name: "buildMode", value: buildMode))
        }
        
        if !queryItems.isEmpty {
            var components = URLComponents(string: urlString)
            components?.queryItems = queryItems
            urlString = components?.url?.absoluteString ?? urlString
        }
        
        guard let url = URL(string: urlString) else {
            completion(.failure(NSError(domain: "NivoStackApiClient", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"])))
            return
        }
        
        let request = createRequest(url: url, method: "GET")
        performRequest(session: controlSession, request: request, completion: completion)
    }
    
    // MARK: - Localization (CONTROL)
    
    /// Fetch localization translations
    public func getLocalization(
        language: String,
        buildMode: String? = nil,
        completion: @escaping (Result<[String: Any], Error>) -> Void
    ) {
        var urlString = "\(controlUrl)/api/localization/translations"
        var queryItems: [URLQueryItem] = [URLQueryItem(name: "language", value: language)]
        
        if let buildMode = buildMode {
            queryItems.append(URLQueryItem(name: "buildMode", value: buildMode))
        }
        
        var components = URLComponents(string: urlString)
        components?.queryItems = queryItems
        
        guard let url = components?.url else {
            completion(.failure(NSError(domain: "NivoStackApiClient", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"])))
            return
        }
        
        let request = createRequest(url: url, method: "GET")
        performRequest(session: controlSession, request: request, completion: completion)
    }
}

