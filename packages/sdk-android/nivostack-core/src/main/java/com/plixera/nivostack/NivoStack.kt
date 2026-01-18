package com.plixera.nivostack

import android.content.Context
import android.content.SharedPreferences
import android.os.Build
import com.plixera.nivostack.clients.ApiClient
import com.plixera.nivostack.models.*
import kotlinx.coroutines.*
import java.util.*
import java.util.concurrent.ConcurrentLinkedQueue
import kotlin.collections.HashMap

/**
 * Main NivoStack SDK class for Android applications
 * 
 * Usage:
 * ```kotlin
 * NivoStack.init(
 *     context = this,
 *     baseUrl = "https://ingest.nivostack.com",
 *     apiKey = "your-project-api-key",
 *     projectId = "your-project-id"
 * )
 * ```
 */
class NivoStack private constructor(
    private val context: Context,
    val baseUrl: String,
    val apiKey: String,
    val projectId: String,
    val enabled: Boolean
) {
    internal val apiClient: ApiClient = ApiClient(baseUrl, apiKey)
    private val prefs: SharedPreferences = context.getSharedPreferences("nivostack_prefs", Context.MODE_PRIVATE)
    
    // Device info
    internal lateinit var deviceInfo: DeviceInfo
    private var deviceId: String? = null
    private var deviceCode: String? = null
    private var registeredDeviceId: String? = null
    
    // Feature flags and settings
    var featureFlags: FeatureFlags = FeatureFlags.defaults()
        private set
    var sdkSettings: SdkSettings = SdkSettings.defaults()
        private set
    var apiConfigs: List<ApiConfig> = emptyList()
        private set
    var deviceConfig: DeviceConfig = DeviceConfig.defaults()
        private set
    
    // Clients
    val businessConfig: com.plixera.nivostack.clients.BusinessConfigClient = 
        com.plixera.nivostack.clients.BusinessConfigClient(apiClient, projectId)
    val localization: com.plixera.nivostack.clients.LocalizationClient = 
        com.plixera.nivostack.clients.LocalizationClient(apiClient, projectId)
    
    // Session tracking
    private var sessionToken: String? = null
    private var currentScreen: String? = null
    private val screenFlow = mutableListOf<String>()
    private var eventCount = 0
    private var errorCount = 0
    private val userProperties = HashMap<String, Any>()
    private var entryScreen: String? = null
    
    // Queues for batching
    private val traceQueue = ConcurrentLinkedQueue<Map<String, Any>>()
    private val logQueue = ConcurrentLinkedQueue<Map<String, Any>>()
    
    // Initialization status
    private var isFullyInitialized = false
    private var configFetched = false
    private var deviceRegistered = false
    private var sessionStarted = false
    private var initError: String? = null
    
    // Config sync
    private var syncInterval: Long? = null // null = periodic sync disabled, only lifecycle sync
    private var syncJob: Job? = null
    private var isAppActive = true

    // Periodic flush for debug devices
    private var flushJob: Job? = null
    private val debugFlushInterval = 5000L // 5 seconds for debug devices
    
    // Coroutine scope for background operations
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    
    companion object {
        @Volatile
        private var instance: NivoStack? = null
        
        /**
         * Initialize NivoStack SDK
         * 
         * @param context Application context
         * @param baseUrl Base URL for NivoStack API (default: https://ingest.nivostack.com)
         * @param apiKey Project API key from NivoStack Studio dashboard
         * @param projectId Project ID (can be derived from API key)
         * @param enabled Enable/disable SDK (useful for debug vs release builds)
         * @param syncIntervalMinutes Interval for periodic config sync in minutes. Default: null (periodic sync disabled, only lifecycle sync).
         *                           Set to a value (e.g., 15) to enable periodic sync every N minutes.
         */
        fun init(
            context: Context,
            baseUrl: String = "https://ingest.nivostack.com",
            apiKey: String,
            projectId: String,
            enabled: Boolean = true,
            syncIntervalMinutes: Long? = null
        ): NivoStack {
            if (instance != null) {
                return instance!!
            }
            
            synchronized(this) {
                if (instance == null) {
                    instance = NivoStack(context.applicationContext, baseUrl, apiKey, projectId, enabled)
                    instance!!.syncInterval = syncIntervalMinutes?.let { it * 60 * 1000 } // Convert minutes to milliseconds
                    instance!!._initDeviceInfo()
                    
                    if (enabled) {
                        // Load cached config
                        instance!!._loadCachedConfig()
                        
                        // Run network operations in background
                        instance!!._initializeInBackground()
                    }
                }
            }
            
            return instance!!
        }
        
        /**
         * Get SDK instance (throws if not initialized)
         */
        fun getInstance(): NivoStack {
            return instance ?: throw IllegalStateException(
                "NivoStack not initialized. Call NivoStack.init() first."
            )
        }
        
        /**
         * Get SDK instance or null if not initialized
         */
        fun instanceOrNull(): NivoStack? = instance
        
        /**
         * Check if SDK is initialized
         */
        fun isInitialized(): Boolean = instance != null
    }
    
    /**
     * Initialize device info
     */
    private fun _initDeviceInfo() {
        // Get or create device ID using Android Secure ID (persistent across app reinstalls)
        deviceId = prefs.getString("device_id", null) ?: run {
            // Use Android Secure ID as stable device identifier
            // This ID persists across app reinstalls but changes on factory reset
            val androidId = android.provider.Settings.Secure.getString(
                context.contentResolver,
                android.provider.Settings.Secure.ANDROID_ID
            )

            // Create a consistent device ID based on Android ID
            // This ensures same device gets same ID even after app reinstall
            val stableDeviceId = if (!androidId.isNullOrEmpty() && androidId != "9774d56d682e549c") {
                // Use Android ID (not the broken emulator ID)
                "android_$androidId"
            } else {
                // Fallback to UUID only if Android ID unavailable (rare)
                UUID.randomUUID().toString()
            }

            prefs.edit().putString("device_id", stableDeviceId).apply()
            log("Generated stable device ID: $stableDeviceId")
            stableDeviceId
        }

        // Get or generate device code
        deviceCode = DeviceCodeGenerator.get(context) ?: run {
            val newCode = DeviceCodeGenerator.getOrGenerate(context)
            newCode
        }

        deviceInfo = DeviceInfo.fromContext(context, deviceId!!)
    }
    
    /**
     * Load cached config from SharedPreferences
     */
    private fun _loadCachedConfig() {
        // Load cached feature flags
        val flagsJson = prefs.getString("feature_flags", null)
        if (flagsJson != null) {
            try {
                val gson = com.google.gson.Gson()
                val flagsMap = gson.fromJson(flagsJson, Map::class.java) as Map<*, *>
                featureFlags = FeatureFlags.fromJson(flagsMap as Map<String, Any>)
            } catch (e: Exception) {
                // Ignore parse errors
            }
        }
        
        // Load cached SDK settings
        val settingsJson = prefs.getString("sdk_settings", null)
        if (settingsJson != null) {
            try {
                val gson = com.google.gson.Gson()
                val settingsMap = gson.fromJson(settingsJson, Map::class.java) as Map<*, *>
                sdkSettings = SdkSettings.fromJson(settingsMap as Map<String, Any>)
            } catch (e: Exception) {
                // Ignore parse errors
            }
        }
        
        configFetched = true
    }
    
    /**
     * Initialize in background (non-blocking)
     */
    private fun _initializeInBackground() {
        scope.launch {
            var registrationError: Exception? = null

            try {
                // Fetch fresh config
                _fetchSdkInitData()
                configFetched = true

                // Register device
                if (featureFlags.deviceTracking) {
                    try {
                        _registerDevice()
                        deviceRegistered = true
                    } catch (e: Exception) {
                        registrationError = e
                        log("Device registration failed: ${e.message}")
                        // Don't throw - continue with other initialization
                    }
                }

                // Start session with retry logic (only if device is registered)
                if (featureFlags.sessionTracking && registeredDeviceId != null) {
                    var retries = 0
                    var sessionError: Exception? = null

                    while (retries < 3 && !sessionStarted) {
                        try {
                            _startSession()
                            sessionStarted = true
                            log("Session started successfully")
                            break
                        } catch (e: Exception) {
                            sessionError = e
                            retries++
                            log("Session start attempt $retries failed: ${e.message}")
                            if (retries < 3) {
                                delay(2000L * retries) // Exponential backoff: 2s, 4s, 6s
                            }
                        }
                    }

                    if (!sessionStarted && sessionError != null) {
                        log("CRITICAL: Session failed after 3 retries - ${sessionError.message}")
                        initError = "Session start failed: ${sessionError.message}"
                        // SDK continues but will retry on next app foreground
                    }
                }

                isFullyInitialized = true
                initError = registrationError?.message

                // Start periodic sync timer after initialization (only if app is active)
                if (isAppActive) {
                    _startSyncTimer()
                    _startFlushTimer() // Start periodic flush for debug devices
                }
            } catch (e: Exception) {
                initError = e.message
                log("SDK initialization failed: ${e.message}")
                // Don't throw - background failures shouldn't crash the app
            }
        }
    }
    
    /**
     * Called when app comes to foreground
     */
    internal fun onAppResumed() {
        isAppActive = true

        // Retry session start if it failed during init
        if (!sessionStarted && featureFlags.sessionTracking && registeredDeviceId != null) {
            scope.launch {
                try {
                    _startSession()
                    sessionStarted = true
                    log("Session recovered on app foreground")
                } catch (e: Exception) {
                    log("Session recovery failed: ${e.message}")
                }
            }
        }

        // Immediate sync on foreground
        scope.launch {
            try {
                refreshConfig()
            } catch (e: Exception) {
                // Ignore errors
            }
        }

        // Start periodic sync timer
        _startSyncTimer()
        _startFlushTimer() // Start periodic flush for debug devices
    }
    
    /**
     * Called when app goes to background
     */
    internal fun onAppPaused() {
        isAppActive = false
        _stopSyncTimer()
        _stopFlushTimer()

        // Flush traces and logs when app goes to background
        scope.launch {
            try {
                _flushTraces()
                _flushLogs()
            } catch (e: Exception) {
                log("Failed to flush on app background: ${e.message}")
            }
        }
    }
    
    /**
     * Start periodic config sync timer
     */
    private fun _startSyncTimer() {
        _stopSyncTimer()
        
        if (!enabled || !isAppActive) {
            return
        }
        
        // Don't start if syncInterval is null (periodic sync disabled)
        val interval = syncInterval ?: return
        
        syncJob = scope.launch {
            while (isAppActive && enabled) {
                delay(interval)
                if (isAppActive && enabled) {
                    try {
                        refreshConfig()
                    } catch (e: Exception) {
                        // Ignore errors
                    }
                }
            }
        }
    }
    
    /**
     * Stop periodic config sync timer
     */
    private fun _stopSyncTimer() {
        syncJob?.cancel()
        syncJob = null
    }

    /**
     * Start periodic flush timer for debug devices
     * Automatically flushes traces and logs every 5 seconds when debug mode is enabled
     */
    private fun _startFlushTimer() {
        _stopFlushTimer()

        if (!enabled || !isAppActive || !deviceConfig.debugModeEnabled) {
            return
        }

        flushJob = scope.launch {
            while (isAppActive && enabled && deviceConfig.debugModeEnabled) {
                delay(debugFlushInterval)
                if (isAppActive && enabled && deviceConfig.debugModeEnabled) {
                    try {
                        _flushTraces()
                        _flushLogs()
                        log("Debug mode: Auto-flushed traces and logs")
                    } catch (e: Exception) {
                        log("Debug mode: Auto-flush failed: ${e.message}")
                    }
                }
            }
        }
    }

    /**
     * Stop periodic flush timer
     */
    private fun _stopFlushTimer() {
        flushJob?.cancel()
        flushJob = null
    }
    
    /**
     * Fetch SDK init data from server
     */
    private suspend fun _fetchSdkInitData(forceRefresh: Boolean = false) {
        try {
            // Get cached ETag for conditional request
            val cachedEtag = if (!forceRefresh) prefs.getString("config_etag", null) else null
            
            // Detect build mode (debug = preview, release = production)
            val buildMode = if ((context.applicationInfo.flags and android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0) {
                "preview"
            } else {
                "production"
            }
            
            val response = apiClient.getSdkInit(
                projectId = projectId,
                deviceId = registeredDeviceId,
                buildMode = buildMode,
                etag = cachedEtag
            )
            
            // Handle 304 Not Modified - config unchanged
            if (response.notModified) {
                return
            }
            
            val data = response.data
            if (data.isEmpty()) return
            
            // Parse feature flags
            val flags = data["featureFlags"] as? Map<*, *>
            if (flags != null) {
                featureFlags = FeatureFlags.fromJson(flags as Map<String, Any>)
                // Cache feature flags
                val gson = com.google.gson.Gson()
                prefs.edit().putString("feature_flags", gson.toJson(flags)).apply()
            }
            
            // Parse SDK settings
            val settings = data["sdkSettings"] as? Map<*, *>
            if (settings != null) {
                sdkSettings = SdkSettings.fromJson(settings as Map<String, Any>)
                // Cache SDK settings
                val gson = com.google.gson.Gson()
                prefs.edit().putString("sdk_settings", gson.toJson(settings)).apply()
            }
            
            // Parse API configs
            val apiConfigsList = data["apiConfigs"] as? List<*>
            if (apiConfigsList != null) {
                apiConfigs = apiConfigsList.mapNotNull { 
                    (it as? Map<*, *>)?.let { ApiConfig.fromJson(it as Map<String, Any>) }
                }
            }
            
            // Parse device config
            val deviceConfigMap = data["deviceConfig"] as? Map<*, *>
            if (deviceConfigMap != null) {
                val oldDebugMode = deviceConfig.debugModeEnabled
                deviceConfig = DeviceConfig.fromJson(deviceConfigMap as Map<String, Any>)

                // Update device code if server assigned one
                val serverDeviceCode = deviceConfigMap["deviceCode"] as? String
                if (!serverDeviceCode.isNullOrEmpty() && serverDeviceCode != deviceCode) {
                    deviceCode = serverDeviceCode
                    DeviceCodeGenerator.save(context, serverDeviceCode)
                }

                // Restart flush timer if debug mode changed
                if (oldDebugMode != deviceConfig.debugModeEnabled && isAppActive) {
                    _startFlushTimer()
                }
            }
            
            // Parse localization data
            val localizationData = data["localization"] as? Map<*, *>
            if (localizationData != null) {
                // Apply localization data from SDK init response
                val languages = localizationData["languages"] as? List<*>
                val defaultLanguage = localizationData["defaultLanguage"] as? String
                val translations = localizationData["translations"] as? Map<*, *>
                
                // Set default language if available
                defaultLanguage?.let {
                    scope.launch {
                        localization.setLanguage(it)
                    }
                }
                
                // Apply translations if available
                translations?.let {
                    val translationsMap = it.mapNotNull { (key, value) ->
                        key?.toString()?.let { k ->
                            k to (value?.toString() ?: "")
                        }
                    }.toMap()
                    // Store in cache (this is a simplified approach - LocalizationClient will handle caching)
                    scope.launch {
                        defaultLanguage?.let { lang ->
                            // Apply translations to localization client
                            // Note: LocalizationClient will fetch fresh data, but we can pre-populate cache
                        }
                    }
                }
            }
            
            // Cache ETag for next request
            response.etag?.let {
                prefs.edit().putString("config_etag", it).apply()
            }
        } catch (e: Exception) {
            // Network failed - use cached config
        }
    }
    
    /**
     * Register device with server (with retry logic)
     */
    private suspend fun _registerDevice() {
        // Ensure device code exists before registration
        if (deviceCode == null) {
            deviceCode = DeviceCodeGenerator.getOrGenerate(context)
        }

        var lastException: Exception? = null
        val maxRetries = 3
        var delayMs = 1000L

        // Retry with exponential backoff
        for (attempt in 1..maxRetries) {
            try {
                val response = apiClient.registerDevice(projectId, deviceInfo, deviceCode)

                val deviceData = response["device"] as? Map<*, *>
                if (deviceData != null) {
                    registeredDeviceId = deviceData["id"] as? String
                    val serverDeviceCode = deviceData["deviceCode"] as? String

                    if (registeredDeviceId == null) {
                        throw Exception("Device registration response missing 'id' field")
                    }

                    // Update device code if server assigned one
                    if (!serverDeviceCode.isNullOrEmpty() && serverDeviceCode != deviceCode) {
                        deviceCode = serverDeviceCode
                        DeviceCodeGenerator.save(context, serverDeviceCode)
                    }

                    log("Device registered successfully with ID: $registeredDeviceId (attempt $attempt/$maxRetries)")
                    return // Success!
                } else {
                    throw Exception("Device registration response missing 'device' object")
                }
            } catch (e: Exception) {
                lastException = e
                log("Device registration attempt $attempt/$maxRetries failed: ${e.message}")

                if (attempt < maxRetries) {
                    kotlinx.coroutines.delay(delayMs)
                    delayMs *= 2 // Exponential backoff
                }
            }
        }

        // All retries failed
        throw lastException ?: Exception("Device registration failed after $maxRetries attempts")
    }
    
    /**
     * Start session
     */
    private suspend fun _startSession() {
        if (registeredDeviceId == null) return
        
        try {
            sessionToken = UUID.randomUUID().toString()
            
            apiClient.startSession(
                deviceId = registeredDeviceId!!,
                sessionToken = sessionToken!!,
                appVersion = deviceInfo.appVersion,
                osVersion = deviceInfo.osVersion,
                locale = Locale.getDefault().toString(),
                timezone = TimeZone.getDefault().id,
                networkType = null, // TODO: Get from ConnectivityManager
                entryScreen = entryScreen,
                userProperties = if (userProperties.isNotEmpty()) userProperties else null
            )
        } catch (e: Exception) {
            // Session start failed
        }
    }
    
    /**
     * Queue trace for sending
     */
    fun queueTrace(trace: Map<String, Any>) {
        if (!featureFlags.apiTracking || !featureFlags.sdkEnabled) return
        if (!deviceConfig.trackingEnabled) return
        
        traceQueue.offer(trace)
        
        // Flush if queue is full
        if (traceQueue.size >= sdkSettings.maxTraceQueueSize) {
            scope.launch { _flushTraces() }
        }
    }
    
    /**
     * Flush traces to server
     */
    private suspend fun _flushTraces() {
        // Don't flush traces until session has started to ensure sessionToken is available
        // This prevents orphaned traces that can't be linked to sessions
        if (traceQueue.isEmpty() || registeredDeviceId == null || sessionToken == null) return
        
        val traces = mutableListOf<Map<String, Any>>()
        while (traces.size < sdkSettings.maxTraceQueueSize && traceQueue.isNotEmpty()) {
            traceQueue.poll()?.let { traces.add(it) }
        }
        
        if (traces.isNotEmpty()) {
            try {
                apiClient.sendTraces(projectId, registeredDeviceId!!, sessionToken, traces)
            } catch (e: Exception) {
                // Re-queue traces on failure
                traces.forEach { traceQueue.offer(it) }
            }
        }
    }
    
    /**
     * Track screen view
     */
    fun trackScreen(screenName: String) {
        if (!featureFlags.screenTracking || !featureFlags.sdkEnabled) return
        if (!deviceConfig.trackingEnabled) return
        
        currentScreen = screenName
        screenFlow.add(screenName)
        
        if (sessionToken != null && registeredDeviceId != null) {
            scope.launch {
                try {
                    apiClient.updateSession(
                        sessionToken = sessionToken!!,
                        screenName = screenName
                    )
                } catch (e: Exception) {
                    // Ignore errors
                }
            }
        }
    }
    
    /**
     * Set user information
     */
    fun setUser(userId: String, email: String? = null, name: String? = null) {
        if (registeredDeviceId == null) return
        
        scope.launch {
            try {
                apiClient.setUser(registeredDeviceId!!, userId, email, name)
            } catch (e: Exception) {
                // Ignore errors
            }
        }
    }
    
    /**
     * Clear user information
     */
    fun clearUser() {
        if (registeredDeviceId == null) return
        
        scope.launch {
            try {
                apiClient.clearUser(registeredDeviceId!!)
            } catch (e: Exception) {
                // Ignore errors
            }
        }
    }
    
    /**
     * Check if tracking is enabled
     */
    val isTrackingEnabled: Boolean
        get() = deviceConfig.trackingEnabled
    
    /**
     * Get device code
     */
    fun getDeviceCode(): String? = deviceCode
    
    /**
     * Refresh configuration from server
     *
     * @param forceRefresh If true, bypasses ETag and forces fresh fetch
     * @return true if config was updated, false if unchanged
     */
    suspend fun refreshConfig(forceRefresh: Boolean = false): Boolean {
        return try {
            val oldEtag = prefs.getString("config_etag", null)
            _fetchSdkInitData(forceRefresh = forceRefresh)
            val newEtag = prefs.getString("config_etag", null)
            oldEtag != newEtag
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Retry device registration
     * Useful if initial registration failed
     *
     * @return true if registration succeeded, false otherwise
     */
    suspend fun retryDeviceRegistration(): Boolean {
        return try {
            _registerDevice()
            deviceRegistered = true
            true
        } catch (e: Exception) {
            log("Device registration retry failed: ${e.message}")
            false
        }
    }

    /**
     * Track API trace manually
     */
    fun trackApiTrace(
        url: String,
        method: String,
        statusCode: Int? = null,
        duration: Long? = null,
        requestBody: String? = null,
        responseBody: String? = null,
        error: String? = null,
        screenName: String? = null
    ) {
        if (!featureFlags.apiTracking || !featureFlags.sdkEnabled) return
        if (!deviceConfig.trackingEnabled) return
        
        val trace = buildMap<String, Any> {
            put("url", url)
            put("method", method)
            statusCode?.let { put("statusCode", it) }
            duration?.let { put("duration", it) }
            requestBody?.let { put("requestBody", it) }
            responseBody?.let { put("responseBody", it) }
            error?.let { put("error", it) }
            // Only include screenName if screen tracking is enabled
            if (featureFlags.screenTracking) {
                screenName?.let { put("screenName", it) } ?: currentScreen?.let { put("screenName", it) }
            }
            put("timestamp", System.currentTimeMillis())
        }
        
        queueTrace(trace)
    }
    
    /**
     * Send log entry
     */
    fun log(
        message: String,
        level: String = "info",
        tag: String? = null,
        data: Map<String, Any>? = null
    ) {
        if (!featureFlags.logging || !featureFlags.sdkEnabled) return
        if (!deviceConfig.trackingEnabled) return
        
        // Check log level filter
        if (!sdkSettings.shouldCaptureLogLevel(level)) return
        
        val logEntry = buildMap<String, Any> {
            put("message", message)
            put("level", level)
            tag?.let { put("tag", it) }
            data?.let { put("data", it) }
            if (featureFlags.screenTracking) {
                currentScreen?.let { put("screenName", it) }
            }
            put("timestamp", System.currentTimeMillis())
        }
        
        logQueue.offer(logEntry)
        
        // Flush if queue is full
        if (logQueue.size >= sdkSettings.maxLogQueueSize) {
            scope.launch { _flushLogs() }
        }
    }
    
    /**
     * Flush logs to server
     */
    private suspend fun _flushLogs() {
        if (logQueue.isEmpty() || registeredDeviceId == null) return
        
        val logs = mutableListOf<Map<String, Any>>()
        while (logs.size < sdkSettings.maxLogQueueSize && logQueue.isNotEmpty()) {
            logQueue.poll()?.let { logs.add(it) }
        }
        
        if (logs.isNotEmpty()) {
            try {
                apiClient.sendLogs(registeredDeviceId!!, logs)
            } catch (e: Exception) {
                // Re-queue logs on failure
                logs.forEach { logQueue.offer(it) }
            }
        }
    }
    
    /**
     * Report crash
     */
    fun reportCrash(
        message: String,
        stackTrace: String? = null,
        exception: Throwable? = null
    ) {
        if (!featureFlags.crashReporting || !featureFlags.sdkEnabled) return
        if (!deviceConfig.trackingEnabled) return
        
        val crashStackTrace = stackTrace ?: exception?.stackTraceToString()
        
        scope.launch {
            try {
                apiClient.reportCrash(
                    projectId = projectId,
                    deviceId = registeredDeviceId ?: deviceId ?: return@launch,
                    message = message,
                    stackTrace = crashStackTrace
                )
            } catch (e: Exception) {
                // Ignore errors
            }
        }
    }
    
    /**
     * Get initialization status
     */
    fun isFullyInitialized(): Boolean = isFullyInitialized
    fun isConfigFetched(): Boolean = configFetched

    /**
     * Get current screen name
     */
    fun getCurrentScreen(): String? = currentScreen

    /**
     * Get current screen flow (list of screens visited in this session)
     */
    fun getScreenFlow(): List<String> = screenFlow.toList()

    /**
     * Get current event count for this session
     */
    fun getEventCount(): Int = eventCount

    /**
     * Get current error count for this session
     */
    fun getErrorCount(): Int = errorCount

    /**
     * Get user properties set for this session
     */
    fun getUserProperties(): Map<String, Any> = userProperties.toMap()

    /**
     * Clear user properties
     */
    fun clearUserProperties() {
        userProperties.clear()
    }
    
    /**
     * Check if a specific feature is enabled
     * 
     * Note: If sdkEnabled is false, ALL features return false (master kill switch)
     */
    fun isFeatureEnabled(feature: String): Boolean {
        // Master kill switch - if SDK is disabled, no features are enabled
        if (!featureFlags.sdkEnabled) return false
        
        return when (feature) {
            "sdkEnabled" -> featureFlags.sdkEnabled
            "apiTracking" -> featureFlags.apiTracking
            "screenTracking" -> featureFlags.screenTracking
            "crashReporting" -> featureFlags.crashReporting
            "logging" -> featureFlags.logging
            "deviceTracking" -> featureFlags.deviceTracking
            "sessionTracking" -> featureFlags.sessionTracking
            "businessConfig" -> featureFlags.businessConfig
            "localization" -> featureFlags.localization
            "offlineSupport" -> featureFlags.offlineSupport
            "batchEvents" -> featureFlags.batchEvents
            else -> false
        }
    }
    
    /**
     * Flush pending traces and logs to server
     */
    suspend fun flush() {
        _flushTraces()
        _flushLogs()
    }

    /**
     * Get pending trace count for debugging
     *
     * @return Number of traces waiting to be flushed
     */
    fun getPendingTraceCount(): Int {
        return traceQueue.size
    }

    /**
     * Get pending log count for debugging
     *
     * @return Number of logs waiting to be flushed
     */
    fun getPendingLogCount(): Int {
        return logQueue.size
    }

    /**
     * Check if session has been started
     * Useful for debugging trace sync issues
     *
     * @return true if session token exists, false otherwise
     */
    fun isSessionStarted(): Boolean {
        return sessionToken != null
    }

    /**
     * Check if device is registered
     *
     * @return true if device is registered with server, false otherwise
     */
    fun isDeviceRegistered(): Boolean {
        return registeredDeviceId != null
    }

    /**
     * Get initialization error if any
     *
     * @return Error message or null if no error
     */
    fun getInitError(): String? {
        return initError
    }

    /**
     * Check if SDK is fully initialized
     *
     * @return true if initialization completed, false otherwise
     */
    fun isInitialized(): Boolean {
        return isFullyInitialized
    }

    /**
     * Get current session token for debugging
     *
     * @return Session token or null if session not started
     */
    fun getSessionToken(): String? {
        return sessionToken
    }

    /**
     * Get current screen name
     *
     * @return Current screen name or null if no screen tracked yet
     */
    fun getCurrentScreenName(): String? {
        return currentScreen
    }
}

/**
 * Device configuration model
 */
data class DeviceConfig(
    val trackingEnabled: Boolean = true,
    val debugModeEnabled: Boolean = false
) {
    companion object {
        fun defaults(): DeviceConfig = DeviceConfig()
        
        fun fromJson(json: Map<String, Any>): DeviceConfig {
            return DeviceConfig(
                trackingEnabled = (json["trackingEnabled"] as? Boolean) ?: true,
                debugModeEnabled = (json["debugModeEnabled"] as? Boolean) ?: false
            )
        }
    }
}

