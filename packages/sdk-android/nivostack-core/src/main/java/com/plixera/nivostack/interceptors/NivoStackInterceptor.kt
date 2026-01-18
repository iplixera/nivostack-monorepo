package com.plixera.nivostack.interceptors

import com.plixera.nivostack.NivoStack
import okhttp3.*
import java.io.IOException
import java.util.concurrent.TimeUnit

/**
 * OkHttp interceptor for automatic API tracing
 * 
 * Add this interceptor to your OkHttpClient to automatically track all HTTP requests:
 * 
 * ```kotlin
 * val client = OkHttpClient.Builder()
 *     .addInterceptor(NivoStackInterceptor())
 *     .build()
 * ```
 */
class NivoStackInterceptor : Interceptor {
    
    @Throws(IOException::class)
    override fun intercept(chain: Interceptor.Chain): Response {
        val instance = NivoStack.instanceOrNull() ?: return chain.proceed(chain.request())
        
        // Check if API tracking is enabled
        if (!instance.featureFlags.apiTracking || !instance.featureFlags.sdkEnabled) {
            return chain.proceed(chain.request())
        }

        val request = chain.request()
        val requestStartTime = System.nanoTime()

        // Capture request details
        val requestMethod = request.method
        val requestUrl = request.url.toString()
        val requestHeaders = request.headers.toMultimap()
        
        // Capture request body if enabled
        val requestBody = if (instance.sdkSettings.captureRequestBodies) {
            request.body?.let { body ->
                val buffer = okio.Buffer()
                body.writeTo(buffer)
                buffer.readUtf8()
            }
        } else null

        // Execute request
        val response: Response
        var responseBody: String? = null
        var error: String? = null
        
        try {
            response = chain.proceed(request)
            
            // Capture response details
            val responseCode = response.code
            val responseMessage = response.message
            val responseHeaders = response.headers.toMultimap()
            
            // Capture response body if enabled
            if (instance.sdkSettings.captureResponseBodies && response.body != null) {
                val source = response.body!!.source()
                source.request(Long.MAX_VALUE)
                val buffer = source.buffer
                responseBody = buffer.clone().readUtf8()
            }

            // Calculate timing
            val requestDuration = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - requestStartTime)

            // Create trace
            val trace = buildMap<String, Any> {
                put("url", requestUrl)
                put("method", requestMethod)
                put("statusCode", responseCode)
                put("statusMessage", responseMessage)
                put("duration", requestDuration)
                put("timestamp", System.currentTimeMillis()) // Add client-side timestamp for sequence tracking
                // Smart screen name: use current screen or default to "AppLaunch" if called before any Activity
                put("screenName", instance.getCurrentScreenName() ?: "AppLaunch")
                requestHeaders.let { put("requestHeaders", it) }
                responseHeaders.let { put("responseHeaders", it) }
                requestBody?.let { put("requestBody", it) }
                responseBody?.let { put("responseBody", it) }
            }

            // Queue trace for sending
            instance.queueTrace(trace)

            return response
        } catch (e: Exception) {
            error = e.message ?: "Unknown error"
            val requestDuration = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - requestStartTime)

            // Create error trace
            val trace = buildMap<String, Any> {
                put("url", requestUrl)
                put("method", requestMethod)
                put("statusCode", 0)
                put("statusMessage", "Error")
                put("duration", requestDuration)
                put("error", error)
                put("timestamp", System.currentTimeMillis()) // Add client-side timestamp for sequence tracking
                // Smart screen name: use current screen or default to "AppLaunch" if called before any Activity
                put("screenName", instance.getCurrentScreenName() ?: "AppLaunch")
                requestHeaders.let { put("requestHeaders", it) }
                requestBody?.let { put("requestBody", it) }
            }

            // Queue trace for sending
            instance.queueTrace(trace)

            throw e
        }
    }
}

