package com.plixera.nivostack.clients

import com.plixera.nivostack.NivoStack
import kotlinx.coroutines.*
import java.util.concurrent.ConcurrentHashMap

/**
 * Business configuration value types
 */
enum class ConfigValueType {
    STRING,
    INTEGER,
    BOOLEAN,
    DECIMAL,
    JSON,
    IMAGE
}

/**
 * Represents a single business configuration
 */
data class BusinessConfig(
    val key: String,
    val valueType: ConfigValueType,
    val value: Any?,
    val category: String? = null,
    val version: Int = 1
) {
    fun getString(defaultValue: String? = null): String? {
        return when (value) {
            is String -> value
            else -> value?.toString() ?: defaultValue
        }
    }
    
    fun getInt(defaultValue: Int? = null): Int? {
        return when (value) {
            is Int -> value
            is Number -> value.toInt()
            else -> defaultValue
        }
    }
    
    fun getBoolean(defaultValue: Boolean? = null): Boolean? {
        return when (value) {
            is Boolean -> value
            else -> defaultValue
        }
    }
    
    fun getDouble(defaultValue: Double? = null): Double? {
        return when (value) {
            is Double -> value
            is Number -> value.toDouble()
            else -> defaultValue
        }
    }
    
    @Suppress("UNCHECKED_CAST")
    fun getJson(): Map<String, Any>? {
        return when (value) {
            is Map<*, *> -> value as? Map<String, Any>
            else -> null
        }
    }
}

/**
 * Client for fetching and caching business configurations from NivoStack
 */
class BusinessConfigClient(
    private val apiClient: ApiClient,
    private val projectId: String
) {
    private val cache = ConcurrentHashMap<String, BusinessConfig>()
    private var lastFetch: Long = 0
    private val cacheDurationMs = 5 * 60 * 1000L // 5 minutes
    
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    
    /**
     * Fetch all configurations
     */
    suspend fun fetchAll(forceRefresh: Boolean = false): Map<String, BusinessConfig> {
        if (!forceRefresh && isCacheValid()) {
            return cache.toMap()
        }
        
        val response = apiClient.getBusinessConfigs(projectId)
        
        // Extract configs and meta from flat response format
        val configs = response["configs"] as? Map<*, *>
        val meta = response["meta"] as? Map<*, *> ?: emptyMap<Any, Any>()
        
        cache.clear()
        
        if (configs != null) {
            for ((key, value) in configs) {
                val keyStr = key.toString()
                val metaInfo = (meta[keyStr] as? Map<*, *>) as? Map<String, Any>
                val config = fromFlat(keyStr, value, metaInfo)
                cache[keyStr] = config
            }
        }
        
        lastFetch = System.currentTimeMillis()
        return cache.toMap()
    }
    
    /**
     * Get a single config value by key
     */
    fun get(key: String): BusinessConfig? = cache[key]
    
    /**
     * Get string value
     */
    fun getString(key: String, defaultValue: String? = null): String? {
        return cache[key]?.getString(defaultValue) ?: defaultValue
    }
    
    /**
     * Get integer value
     */
    fun getInt(key: String, defaultValue: Int? = null): Int? {
        return cache[key]?.getInt(defaultValue) ?: defaultValue
    }
    
    /**
     * Get boolean value
     */
    fun getBoolean(key: String, defaultValue: Boolean? = null): Boolean? {
        return cache[key]?.getBoolean(defaultValue) ?: defaultValue
    }
    
    /**
     * Get double value
     */
    fun getDouble(key: String, defaultValue: Double? = null): Double? {
        return cache[key]?.getDouble(defaultValue) ?: defaultValue
    }
    
    /**
     * Refresh configuration from server (non-blocking)
     */
    fun refresh() {
        scope.launch {
            fetchAll(forceRefresh = true)
        }
    }
    
    private fun isCacheValid(): Boolean {
        return System.currentTimeMillis() - lastFetch < cacheDurationMs
    }
    
    companion object {
        /**
         * Create BusinessConfig from flat API format
         */
        fun fromFlat(
            key: String,
            value: Any?,
            meta: Map<String, Any>?
        ): BusinessConfig {
            val typeStr = meta?.get("type") as? String
            val category = meta?.get("category") as? String
            val version = (meta?.get("version") as? Number)?.toInt() ?: 1
            
            val valueType = when (typeStr) {
                "string" -> ConfigValueType.STRING
                "integer" -> ConfigValueType.INTEGER
                "boolean" -> ConfigValueType.BOOLEAN
                "decimal" -> ConfigValueType.DECIMAL
                "json" -> ConfigValueType.JSON
                "image" -> ConfigValueType.IMAGE
                else -> ConfigValueType.STRING
            }
            
            return BusinessConfig(
                key = key,
                valueType = valueType,
                value = value,
                category = category,
                version = version
            )
        }
    }
}

