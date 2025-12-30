package com.plixera.nivostack.models

/**
 * SDK Settings model for controlling API tracing and logging behavior
 */
data class SdkSettings(
    val captureRequestBodies: Boolean = true,
    val captureResponseBodies: Boolean = true,
    val capturePrintStatements: Boolean = false,
    val sanitizeSensitiveData: Boolean = true,
    val sensitiveFieldPatterns: List<String> = listOf(
        "password", "token", "secret", "apiKey", "api_key",
        "authorization", "cookie"
    ),
    val maxLogQueueSize: Int = 100,
    val maxTraceQueueSize: Int = 50,
    val flushIntervalSeconds: Int = 30,
    val enableBatching: Boolean = true,
    val minLogLevel: String = "debug",
    val verboseErrors: Boolean = false
) {
    companion object {
        /**
         * Create default settings
         */
        fun defaults(): SdkSettings = SdkSettings()

        /**
         * Create from JSON response
         */
        fun fromJson(json: Map<String, Any>): SdkSettings {
            return SdkSettings(
                captureRequestBodies = (json["captureRequestBodies"] as? Boolean) ?: true,
                captureResponseBodies = (json["captureResponseBodies"] as? Boolean) ?: true,
                capturePrintStatements = (json["capturePrintStatements"] as? Boolean) ?: false,
                sanitizeSensitiveData = (json["sanitizeSensitiveData"] as? Boolean) ?: true,
                sensitiveFieldPatterns = (json["sensitiveFieldPatterns"] as? List<*>)?.mapNotNull { it as? String }
                    ?: listOf("password", "token", "secret", "apiKey", "api_key", "authorization", "cookie"),
                maxLogQueueSize = (json["maxLogQueueSize"] as? Number)?.toInt() ?: 100,
                maxTraceQueueSize = (json["maxTraceQueueSize"] as? Number)?.toInt() ?: 50,
                flushIntervalSeconds = (json["flushIntervalSeconds"] as? Number)?.toInt() ?: 30,
                enableBatching = (json["enableBatching"] as? Boolean) ?: true,
                minLogLevel = (json["minLogLevel"] as? String) ?: "debug",
                verboseErrors = (json["verboseErrors"] as? Boolean) ?: false
            )
        }
    }

    /**
     * Check if a log level should be captured based on minLogLevel
     */
    fun shouldCaptureLogLevel(level: String): Boolean {
        val levelOrder = listOf("verbose", "debug", "info", "warn", "error", "assert")
        val minIndex = levelOrder.indexOf(minLogLevel.lowercase())
        val levelIndex = levelOrder.indexOf(level.lowercase())

        // If either level is unknown, default to capturing
        if (minIndex == -1 || levelIndex == -1) return true

        return levelIndex >= minIndex
    }

    /**
     * Sanitize a string value by redacting sensitive patterns
     */
    fun sanitizeValue(key: String, value: String): String {
        if (!sanitizeSensitiveData) return value

        val keyLower = key.lowercase()
        for (pattern in sensitiveFieldPatterns) {
            if (keyLower.contains(pattern.lowercase())) {
                return "[REDACTED]"
            }
        }
        return value
    }

    /**
     * Sanitize a map by redacting sensitive fields
     */
    fun sanitizeMap(data: Map<String, Any>): Map<String, Any> {
        if (!sanitizeSensitiveData) return data

        return data.mapValues { (key, value) ->
            when (value) {
                is String -> sanitizeValue(key, value)
                is Map<*, *> -> sanitizeMap(value as Map<String, Any>)
                else -> value
            }
        }
    }
}

/**
 * API endpoint configuration for per-endpoint settings
 */
data class ApiConfig(
    val endpoint: String,
    val method: String? = null,
    val enableLogs: Boolean = true,
    val captureRequestBody: Boolean = true,
    val captureResponseBody: Boolean = true,
    val costPerRequest: Double? = null
) {
    companion object {
        fun fromJson(json: Map<String, Any>): ApiConfig {
            return ApiConfig(
                endpoint = (json["endpoint"] as? String) ?: "",
                method = json["method"] as? String,
                enableLogs = (json["enableLogs"] as? Boolean) ?: true,
                captureRequestBody = (json["captureRequestBody"] as? Boolean) ?: true,
                captureResponseBody = (json["captureResponseBody"] as? Boolean) ?: true,
                costPerRequest = (json["costPerRequest"] as? Number)?.toDouble()
            )
        }
    }

    /**
     * Check if this config matches a given URL and method
     */
    fun matches(url: String, requestMethod: String): Boolean {
        // Extract path from URL
        val path = try {
            java.net.URL(url).path
        } catch (e: Exception) {
            url
        }

        // Check if path matches endpoint pattern
        if (!pathMatches(path, endpoint)) return false

        // Check method if specified
        if (!method.isNullOrEmpty() && method.uppercase() != requestMethod.uppercase()) {
            return false
        }

        return true
    }

    private fun pathMatches(path: String, pattern: String): Boolean {
        val normalizedPath = if (path.endsWith("/")) path.dropLast(1) else path
        val normalizedPattern = if (pattern.endsWith("/")) pattern.dropLast(1) else pattern

        return normalizedPath == normalizedPattern || normalizedPath.startsWith("$normalizedPattern/")
    }
}

