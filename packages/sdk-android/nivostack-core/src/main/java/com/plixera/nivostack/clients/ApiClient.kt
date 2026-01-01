package com.plixera.nivostack.clients

import com.google.gson.Gson
import com.plixera.nivostack.models.DeviceInfo
import okhttp3.*
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import java.util.concurrent.TimeUnit

/**
 * Internal API client for communicating with NivoStack server
 */
class ApiClient(
    private val baseUrl: String,
    private val apiKey: String
) {
    private val gson = Gson()
    private val client: OkHttpClient

    init {
        client = OkHttpClient.Builder()
            .connectTimeout(3, TimeUnit.SECONDS)
            .readTimeout(3, TimeUnit.SECONDS)
            .writeTimeout(3, TimeUnit.SECONDS)
            .build()
    }

    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    /**
     * Register device with NivoStack server
     */
    suspend fun registerDevice(
        projectId: String,
        deviceInfo: DeviceInfo,
        deviceCode: String? = null
    ): Map<String, Any> {
        val body = buildMap<String, Any> {
            put("projectId", projectId)
            putAll(deviceInfo.toJson())
            deviceCode?.let { put("deviceCode", it) }
        }

        val requestBody = gson.toJson(body).toRequestBody(jsonMediaType)
        val request = Request.Builder()
            .url("$baseUrl/api/devices")
            .post(requestBody)
            .addHeader("Content-Type", "application/json")
            .addHeader("X-API-Key", apiKey)
            .build()

        val response = client.newCall(request).execute()
        val responseBody = response.body?.string() ?: "{}"
        return gson.fromJson(responseBody, Map::class.java) as Map<String, Any>
    }

    /**
     * Associate user with device
     */
    suspend fun setUser(
        deviceId: String,
        userId: String,
        email: String? = null,
        name: String? = null
    ) {
        val body = buildMap<String, Any> {
            put("userId", userId)
            email?.let { put("email", it) }
            name?.let { put("name", it) }
        }

        val requestBody = gson.toJson(body).toRequestBody(jsonMediaType)
        val request = Request.Builder()
            .url("$baseUrl/api/devices/$deviceId/user")
            .patch(requestBody)
            .addHeader("Content-Type", "application/json")
            .addHeader("X-API-Key", apiKey)
            .build()

        client.newCall(request).execute()
    }

    /**
     * Clear user from device
     */
    suspend fun clearUser(deviceId: String) {
        val request = Request.Builder()
            .url("$baseUrl/api/devices/$deviceId/user")
            .delete()
            .addHeader("X-API-Key", apiKey)
            .build()

        client.newCall(request).execute()
    }

    /**
     * Send API traces to NivoStack server
     */
    suspend fun sendTraces(
        projectId: String,
        deviceId: String,
        sessionToken: String?,
        traces: List<Map<String, Any>>
    ) {
        for (trace in traces) {
            val body = buildMap<String, Any> {
                put("projectId", projectId)
                put("deviceId", deviceId)
                sessionToken?.let { put("sessionToken", it) }
                putAll(trace)
            }

            val requestBody = gson.toJson(body).toRequestBody(jsonMediaType)
            val request = Request.Builder()
                .url("$baseUrl/api/traces")
                .post(requestBody)
                .addHeader("Content-Type", "application/json")
                .addHeader("X-API-Key", apiKey)
                .build()

            client.newCall(request).execute()
        }
    }

    /**
     * Send logs to NivoStack server
     */
    suspend fun sendLogs(
        deviceId: String,
        logs: List<Map<String, Any>>
    ) {
        for (log in logs) {
            val body = buildMap<String, Any> {
                put("deviceId", deviceId)
                putAll(log)
            }

            val requestBody = gson.toJson(body).toRequestBody(jsonMediaType)
            val request = Request.Builder()
                .url("$baseUrl/api/logs")
                .post(requestBody)
                .addHeader("Content-Type", "application/json")
                .addHeader("X-API-Key", apiKey)
                .build()

            client.newCall(request).execute()
        }
    }

    /**
     * Report crash to NivoStack server
     */
    suspend fun reportCrash(
        projectId: String,
        deviceId: String,
        message: String,
        stackTrace: String? = null
    ) {
        val body = buildMap<String, Any> {
            put("projectId", projectId)
            put("deviceId", deviceId)
            put("message", message)
            stackTrace?.let { put("stackTrace", it) }
        }

        val requestBody = gson.toJson(body).toRequestBody(jsonMediaType)
        val request = Request.Builder()
            .url("$baseUrl/api/crashes")
            .post(requestBody)
            .addHeader("Content-Type", "application/json")
            .addHeader("X-API-Key", apiKey)
            .build()

        client.newCall(request).execute()
    }

    /**
     * Start a new session with context
     */
    suspend fun startSession(
        deviceId: String,
        sessionToken: String,
        appVersion: String? = null,
        osVersion: String? = null,
        locale: String? = null,
        timezone: String? = null,
        networkType: String? = null,
        entryScreen: String? = null,
        userProperties: Map<String, Any>? = null,
        metadata: Map<String, Any>? = null
    ): Map<String, Any> {
        val body = buildMap<String, Any> {
            put("deviceId", deviceId)
            put("sessionToken", sessionToken)
            appVersion?.let { put("appVersion", it) }
            osVersion?.let { put("osVersion", it) }
            locale?.let { put("locale", it) }
            timezone?.let { put("timezone", it) }
            networkType?.let { put("networkType", it) }
            entryScreen?.let { put("entryScreen", it) }
            userProperties?.let { put("userProperties", it) }
            metadata?.let { put("metadata", it) }
        }

        val requestBody = gson.toJson(body).toRequestBody(jsonMediaType)
        val request = Request.Builder()
            .url("$baseUrl/api/sessions")
            .post(requestBody)
            .addHeader("Content-Type", "application/json")
            .addHeader("X-API-Key", apiKey)
            .build()

        val response = client.newCall(request).execute()
        val responseBody = response.body?.string() ?: "{}"
        return gson.fromJson(responseBody, Map::class.java) as Map<String, Any>
    }

    /**
     * End current session with final metrics
     */
    suspend fun endSession(
        sessionToken: String,
        exitScreen: String? = null,
        screenFlow: List<String>? = null,
        eventCount: Int? = null,
        errorCount: Int? = null,
        userProperties: Map<String, Any>? = null
    ): Map<String, Any> {
        val body = buildMap<String, Any> {
            put("sessionToken", sessionToken)
            exitScreen?.let { put("exitScreen", it) }
            screenFlow?.let { put("screenFlow", it) }
            eventCount?.let { put("eventCount", it) }
            errorCount?.let { put("errorCount", it) }
            userProperties?.let { put("userProperties", it) }
        }

        val requestBody = gson.toJson(body).toRequestBody(jsonMediaType)
        val request = Request.Builder()
            .url("$baseUrl/api/sessions")
            .put(requestBody)
            .addHeader("Content-Type", "application/json")
            .addHeader("X-API-Key", apiKey)
            .build()

        val response = client.newCall(request).execute()
        val responseBody = response.body?.string() ?: "{}"
        return gson.fromJson(responseBody, Map::class.java) as Map<String, Any>
    }

    /**
     * Update session (add screen to flow, increment counters)
     */
    suspend fun updateSession(
        sessionToken: String,
        screenName: String? = null,
        incrementEventCount: Boolean? = null,
        incrementErrorCount: Boolean? = null,
        userProperties: Map<String, Any>? = null,
        metadata: Map<String, Any>? = null
    ): Map<String, Any> {
        val body = buildMap<String, Any> {
            put("sessionToken", sessionToken)
            screenName?.let { put("screenName", it) }
            if (incrementEventCount == true) put("incrementEventCount", true)
            if (incrementErrorCount == true) put("incrementErrorCount", true)
            userProperties?.let { put("userProperties", it) }
            metadata?.let { put("metadata", it) }
        }

        val requestBody = gson.toJson(body).toRequestBody(jsonMediaType)
        val request = Request.Builder()
            .url("$baseUrl/api/sessions")
            .patch(requestBody)
            .addHeader("Content-Type", "application/json")
            .addHeader("X-API-Key", apiKey)
            .build()

        val response = client.newCall(request).execute()
        val responseBody = response.body?.string() ?: "{}"
        return gson.fromJson(responseBody, Map::class.java) as Map<String, Any>
    }

    /**
     * Fetch business configurations
     */
    suspend fun getBusinessConfigs(
        projectId: String,
        category: String? = null
    ): Map<String, Any> {
        val urlBuilder = "$baseUrl/api/business-config".toHttpUrl().newBuilder()
            .addQueryParameter("projectId", projectId)
        category?.let { urlBuilder.addQueryParameter("category", it) }
        val url = urlBuilder.build()

        val request = Request.Builder()
            .url(url)
            .get()
            .addHeader("X-API-Key", apiKey)
            .build()

        val response = client.newCall(request).execute()
        val responseBody = response.body?.string() ?: "{}"
        return gson.fromJson(responseBody, Map::class.java) as Map<String, Any>
    }

    /**
     * Fetch translations for a language
     */
    suspend fun getTranslations(
        projectId: String,
        languageCode: String? = null
    ): Map<String, Any> {
        val urlBuilder = "$baseUrl/api/localization/translations".toHttpUrl().newBuilder()
            .addQueryParameter("projectId", projectId)
        languageCode?.let { urlBuilder.addQueryParameter("lang", it) }
        val url = urlBuilder.build()

        val request = Request.Builder()
            .url(url)
            .get()
            .addHeader("X-API-Key", apiKey)
            .build()

        val response = client.newCall(request).execute()
        val responseBody = response.body?.string() ?: "{}"
        return gson.fromJson(responseBody, Map::class.java) as Map<String, Any>
    }

    /**
     * Fetch feature flags for the project
     */
    suspend fun getFeatureFlags(): Map<String, Any> {
        val request = Request.Builder()
            .url("$baseUrl/api/feature-flags")
            .get()
            .addHeader("X-API-Key", apiKey)
            .build()

        val response = client.newCall(request).execute()
        val responseBody = response.body?.string() ?: "{}"
        return gson.fromJson(responseBody, Map::class.java) as Map<String, Any>
    }

    /**
     * Fetch SDK settings for the project
     */
    suspend fun getSdkSettings(): Map<String, Any> {
        val request = Request.Builder()
            .url("$baseUrl/api/sdk-settings")
            .get()
            .addHeader("X-API-Key", apiKey)
            .build()

        val response = client.newCall(request).execute()
        val responseBody = response.body?.string() ?: "{}"
        return gson.fromJson(responseBody, Map::class.java) as Map<String, Any>
    }

    /**
     * Fetch all SDK initialization data in a single request
     * 
     * @param projectId Project ID
     * @param deviceId Optional device ID (for returning devices)
     * @param buildMode Optional build mode ("preview" or "production")
     * @param etag Optional ETag for conditional request (304 Not Modified)
     * @return Map containing response data and metadata (etag, notModified)
     */
    suspend fun getSdkInit(
        projectId: String,
        deviceId: String? = null,
        buildMode: String? = null,
        etag: String? = null
    ): SdkInitResponse {
        val urlBuilder = "$baseUrl/api/sdk-init".toHttpUrl().newBuilder()
            .addQueryParameter("projectId", projectId)
        deviceId?.let { urlBuilder.addQueryParameter("deviceId", it) }
        buildMode?.let { urlBuilder.addQueryParameter("buildMode", it) }
        val url = urlBuilder.build()

        val requestBuilder = Request.Builder()
            .url(url)
            .get()
            .addHeader("X-API-Key", apiKey)
        etag?.let { requestBuilder.addHeader("If-None-Match", it) }
        val request = requestBuilder.build()

        val response = client.newCall(request).execute()
        val responseEtag = response.header("ETag")
        val notModified = response.code == 304
        
        val responseBody = if (notModified) {
            "{}"
        } else {
            response.body?.string() ?: "{}"
        }
        
        val data = if (notModified) {
            emptyMap<String, Any>()
        } else {
            gson.fromJson(responseBody, Map::class.java) as Map<String, Any>
        }
        
        return SdkInitResponse(
            data = data,
            etag = responseEtag,
            notModified = notModified
        )
    }
    
    /**
     * Response wrapper for SDK init API
     */
    data class SdkInitResponse(
        val data: Map<String, Any>,
        val etag: String?,
        val notModified: Boolean
    )
}

