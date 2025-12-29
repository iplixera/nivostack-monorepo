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
    
    // Coroutine scope for background operations
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    
    companion object {
        @Volatile
        private var instance: NivoStack? = null
        
        /**
         * Initialize NivoStack SDK
         */
        fun init(
            context: Context,
            baseUrl: String,
            apiKey: String,
            projectId: String,
            enabled: Boolean = true
        ): NivoStack {
            if (instance != null) {
                return instance!!
            }
            
            synchronized(this) {
                if (instance == null) {
                    instance = NivoStack(context.applicationContext, baseUrl, apiKey, projectId, enabled)
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
        // Get or create device ID
        deviceId = prefs.getString("device_id", null) ?: run {
            val newId = UUID.randomUUID().toString()
            prefs.edit().putString("device_id", newId).apply()
            newId
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
            try {
                // Fetch fresh config
                _fetchSdkInitData()
                configFetched = true
                
                // Register device
                if (featureFlags.deviceTracking) {
                    _registerDevice()
                    deviceRegistered = true
                }
                
                // Start session
                if (featureFlags.sessionTracking) {
                    _startSession()
                    sessionStarted = true
                }
                
                isFullyInitialized = true
                initError = null
            } catch (e: Exception) {
                initError = e.message
                // Don't throw - background failures shouldn't crash the app
            }
        }
    }
    
    /**
     * Fetch SDK init data from server
     */
    private suspend fun _fetchSdkInitData() {
        try {
            val response = apiClient.getSdkInit(projectId)
            
            // Parse feature flags
            val flags = response["featureFlags"] as? Map<*, *>
            if (flags != null) {
                featureFlags = FeatureFlags.fromJson(flags as Map<String, Any>)
                // Cache feature flags
                val gson = com.google.gson.Gson()
                prefs.edit().putString("feature_flags", gson.toJson(flags)).apply()
            }
            
            // Parse SDK settings
            val settings = response["sdkSettings"] as? Map<*, *>
            if (settings != null) {
                sdkSettings = SdkSettings.fromJson(settings as Map<String, Any>)
                // Cache SDK settings
                val gson = com.google.gson.Gson()
                prefs.edit().putString("sdk_settings", gson.toJson(settings)).apply()
            }
            
            // Parse API configs
            val apiConfigsList = response["apiConfigs"] as? List<*>
            if (apiConfigsList != null) {
                apiConfigs = apiConfigsList.mapNotNull { 
                    (it as? Map<*, *>)?.let { ApiConfig.fromJson(it as Map<String, Any>) }
                }
            }
            
            // Parse device config
            val deviceConfigMap = response["deviceConfig"] as? Map<*, *>
            if (deviceConfigMap != null) {
                deviceConfig = DeviceConfig.fromJson(deviceConfigMap as Map<String, Any>)
            }
        } catch (e: Exception) {
            // Network failed - use cached config
        }
    }
    
    /**
     * Register device with server
     */
    private suspend fun _registerDevice() {
        try {
            val response = apiClient.registerDevice(projectId, deviceInfo, deviceCode)
            
            val deviceData = response["device"] as? Map<*, *>
            if (deviceData != null) {
                registeredDeviceId = deviceData["id"] as? String
                deviceCode = deviceData["deviceCode"] as? String
                
                // Store device code
                deviceCode?.let {
                    prefs.edit().putString("device_code", it).apply()
                }
            }
        } catch (e: Exception) {
            // Registration failed
        }
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
        if (traceQueue.isEmpty() || registeredDeviceId == null) return
        
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
     * Get initialization status
     */
    fun isFullyInitialized(): Boolean = isFullyInitialized
    fun isConfigFetched(): Boolean = configFetched
    fun isDeviceRegistered(): Boolean = deviceRegistered
    fun isSessionStarted(): Boolean = sessionStarted
    fun getInitError(): String? = initError
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

