package com.nivostack.android

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.snackbar.Snackbar
import com.google.gson.Gson
import com.plixera.nivostack.NivoStack
import com.plixera.nivostack.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import okhttp3.*
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import java.util.*

class MainActivity : AppCompatActivity() {
    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(com.plixera.nivostack.interceptors.NivoStackInterceptor())
        .build()
    
    private val directOkHttpClient = OkHttpClient.Builder()
        .connectTimeout(10, java.util.concurrent.TimeUnit.SECONDS)
        .readTimeout(10, java.util.concurrent.TimeUnit.SECONDS)
        .writeTimeout(10, java.util.concurrent.TimeUnit.SECONDS)
        .build()
    
    private val gson = Gson()
    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()
    
    private lateinit var statusText: android.widget.TextView
    private lateinit var btnShowStatus: com.google.android.material.button.MaterialButton
    private lateinit var btnTestExternalApi: com.google.android.material.button.MaterialButton
    private lateinit var btnTestNivoStackApi: com.google.android.material.button.MaterialButton
    private lateinit var btnTestLogging: com.google.android.material.button.MaterialButton
    private lateinit var btnTestCrash: com.google.android.material.button.MaterialButton
    private lateinit var btnRefreshBusinessConfig: com.google.android.material.button.MaterialButton
    private lateinit var btnRefreshLocalization: com.google.android.material.button.MaterialButton
    private lateinit var btnSetUser: com.google.android.material.button.MaterialButton
    private lateinit var btnClearUser: com.google.android.material.button.MaterialButton
    private lateinit var btnTrackScreen: com.google.android.material.button.MaterialButton
    private lateinit var btnRefreshConfig: com.google.android.material.button.MaterialButton
    private lateinit var btnFlush: com.google.android.material.button.MaterialButton
    private lateinit var btnTrackApiTrace: com.google.android.material.button.MaterialButton
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // Initialize views
        statusText = findViewById(R.id.statusText)
        btnShowStatus = findViewById(R.id.btnShowStatus)
        btnTestExternalApi = findViewById(R.id.btnTestExternalApi)
        btnTestNivoStackApi = findViewById(R.id.btnTestNivoStackApi)
        btnTestLogging = findViewById(R.id.btnTestLogging)
        btnTestCrash = findViewById(R.id.btnTestCrash)
        btnRefreshBusinessConfig = findViewById(R.id.btnRefreshBusinessConfig)
        btnRefreshLocalization = findViewById(R.id.btnRefreshLocalization)
        btnSetUser = findViewById(R.id.btnSetUser)
        btnClearUser = findViewById(R.id.btnClearUser)
        btnTrackScreen = findViewById(R.id.btnTrackScreen)
        btnRefreshConfig = findViewById(R.id.btnRefreshConfig)
        btnFlush = findViewById(R.id.btnFlush)
        btnTrackApiTrace = findViewById(R.id.btnTrackApiTrace)
        
        setupButtons()
        updateStatus()
    }
    
    private fun setupButtons() {
        btnShowStatus.setOnClickListener { showSdkStatus() }
        btnTestExternalApi.setOnClickListener { testExternalApi() }
        btnTestNivoStackApi.setOnClickListener { testNivoStackApi() }
        btnTestLogging.setOnClickListener { testLogging() }
        btnTestCrash.setOnClickListener { testCrash() }
        btnRefreshBusinessConfig.setOnClickListener { refreshBusinessConfig() }
        btnRefreshLocalization.setOnClickListener { refreshLocalization() }
        btnSetUser.setOnClickListener { setUser() }
        btnClearUser.setOnClickListener { clearUser() }
        btnTrackScreen.setOnClickListener { trackScreen() }
        btnRefreshConfig.setOnClickListener { refreshConfig() }
        btnFlush.setOnClickListener { flush() }
        btnTrackApiTrace.setOnClickListener { trackApiTrace() }
    }
    
    private fun updateStatus() {
        val instance = NivoStack.instanceOrNull()
        if (instance == null) {
            statusText.text = "SDK not initialized"
            return
        }
        
        val status = buildString {
            appendLine("Initialized: ${NivoStack.isInitialized()}")
            appendLine("Fully Initialized: ${instance.isFullyInitialized()}")
            appendLine("Config Fetched: ${instance.isConfigFetched()}")
            appendLine("Device Registered: ${instance.isDeviceRegistered()}")
            appendLine("Session Started: ${instance.isSessionStarted()}")
            appendLine("Device Code: ${instance.getDeviceCode() ?: "N/A"}")
            appendLine("Tracking Enabled: ${instance.isTrackingEnabled}")
            appendLine("Pending Traces: ${instance.getPendingTraceCount()}")
            appendLine("Pending Logs: ${instance.getPendingLogCount()}")
            appendLine("Event Count: ${instance.getEventCount()}")
            appendLine("Error Count: ${instance.getErrorCount()}")
            instance.getInitError()?.let {
                appendLine("Init Error: $it")
            }
        }
        
        statusText.text = status
    }
    
    private fun showSdkStatus() {
        val instance = NivoStack.instanceOrNull() ?: return
        
        val status = buildString {
            appendLine("SDK Status")
            appendLine("==========")
            appendLine("Initialized: ${NivoStack.isInitialized()}")
            appendLine("Fully Initialized: ${instance.isFullyInitialized()}")
            appendLine("Config Fetched: ${instance.isConfigFetched()}")
            appendLine("Device Registered: ${instance.isDeviceRegistered()}")
            appendLine("Session Started: ${instance.isSessionStarted()}")
            appendLine("Device Code: ${instance.getDeviceCode() ?: "N/A"}")
            appendLine("Tracking Enabled: ${instance.isTrackingEnabled}")
            appendLine("Pending Traces: ${instance.getPendingTraceCount()}")
            appendLine("Pending Logs: ${instance.getPendingLogCount()}")
            appendLine("Event Count: ${instance.getEventCount()}")
            appendLine("Error Count: ${instance.getErrorCount()}")
            appendLine()
            appendLine("Feature Flags:")
            appendLine("  SDK Enabled: ${instance.featureFlags.sdkEnabled}")
            appendLine("  API Tracking: ${instance.featureFlags.apiTracking}")
            appendLine("  Screen Tracking: ${instance.featureFlags.screenTracking}")
            appendLine("  Logging: ${instance.featureFlags.logging}")
            appendLine("  Crash Reporting: ${instance.featureFlags.crashReporting}")
            appendLine("  Business Config: ${instance.featureFlags.businessConfig}")
            appendLine("  Localization: ${instance.featureFlags.localization}")
            instance.getInitError()?.let {
                appendLine()
                appendLine("Init Error: $it")
            }
        }
        
        AlertDialog.Builder(this)
            .setTitle("SDK Status")
            .setMessage(status)
            .setPositiveButton("OK", null)
            .show()
    }
    
    private fun testExternalApi() {
        showLoading(true)
        val request = Request.Builder()
            .url("https://jsonplaceholder.typicode.com/posts/1")
            .get()
            .build()
        
        okHttpClient.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    showLoading(false)
                    showError("External API call failed: ${e.message}")
                }
            }
            
            override fun onResponse(call: Call, response: Response) {
                val body = response.body?.string() ?: ""
                runOnUiThread {
                    showLoading(false)
                    showMessage("External API call successful: HTTP ${response.code}\n$body")
                }
            }
        })
    }
    
    private fun testNivoStackApi() {
        val instance = NivoStack.instanceOrNull() ?: run {
            showError("SDK not initialized")
            return
        }
        showLoading(true)
        
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val deviceInfoField = NivoStack::class.java.getDeclaredField("deviceInfo")
                deviceInfoField.isAccessible = true
                val deviceInfo = deviceInfoField.get(instance) as com.plixera.nivostack.models.DeviceInfo
                
                val projectIdField = NivoStack::class.java.getDeclaredField("projectId")
                projectIdField.isAccessible = true
                val projectId = projectIdField.get(instance) as String
                
                val baseUrlField = NivoStack::class.java.getDeclaredField("baseUrl")
                baseUrlField.isAccessible = true
                val baseUrl = baseUrlField.get(instance) as String
                
                val apiKeyField = NivoStack::class.java.getDeclaredField("apiKey")
                apiKeyField.isAccessible = true
                val apiKey = apiKeyField.get(instance) as String
                
                val body = mapOf(
                    "projectId" to projectId,
                    "deviceId" to deviceInfo.deviceId,
                    "platform" to deviceInfo.platform,
                    "osVersion" to deviceInfo.osVersion,
                    "appVersion" to deviceInfo.appVersion,
                    "model" to deviceInfo.model,
                    "manufacturer" to deviceInfo.manufacturer
                )
                
                val requestBody = gson.toJson(body).toRequestBody(jsonMediaType)
                val request = Request.Builder()
                    .url("$baseUrl/api/devices")
                    .post(requestBody)
                    .addHeader("Content-Type", "application/json")
                    .addHeader("X-API-Key", apiKey)
                    .build()
                
                val response = directOkHttpClient.newCall(request).execute()
                val responseBody = response.body?.string() ?: "{}"
                
                runOnUiThread {
                    showLoading(false)
                    if (response.isSuccessful) {
                        val responseData = gson.fromJson(responseBody, Map::class.java) as? Map<*, *>
                        val deviceData = responseData?.get("device") as? Map<*, *>
                        val deviceCode = deviceData?.get("deviceCode") as? String
                        showMessage("NivoStack API call successful: HTTP ${response.code} ${response.message}\nDevice Code: ${deviceCode ?: "N/A"}\nResponse: $responseBody")
                    } else {
                        showErrorWithDetails("NivoStack API call failed", response.code, response.message, responseBody)
                    }
                }
            } catch (e: Exception) {
                runOnUiThread {
                    showLoading(false)
                    showError("NivoStack API call failed: ${e.message}")
                }
            }
        }
    }
    
    private fun testLogging() {
        val instance = NivoStack.instanceOrNull() ?: run {
            showError("SDK not initialized")
            return
        }
        
        // Use public API method
        instance.log(
            message = "Test log message from example app",
            level = "info",
            tag = "ExampleApp",
            data = mapOf("timestamp" to Date().toString())
        )
        
        showMessage("Log queued successfully. Pending logs: ${instance.getPendingLogCount()}")
        updateStatus()
    }
    
    private fun testCrash() {
        val instance = NivoStack.instanceOrNull() ?: run {
            showError("SDK not initialized")
            return
        }
        
        // Use public API method
        try {
            throw RuntimeException("Test crash from example app")
        } catch (e: Exception) {
            instance.reportCrash(
                message = "Test crash from example app",
                exception = e
            )
            showMessage("Crash report sent successfully")
        }
        updateStatus()
    }
    
    private fun refreshBusinessConfig() {
        val instance = NivoStack.instanceOrNull() ?: run {
            showError("SDK not initialized")
            return
        }
        showLoading(true)
        
        CoroutineScope(Dispatchers.IO).launch {
            try {
                instance.businessConfig.refresh()
                val configs = instance.businessConfig.fetchAll(forceRefresh = true)
                
                runOnUiThread {
                    showLoading(false)
                    showMessage("Business config refreshed: ${configs.size} configs loaded")
                }
            } catch (e: Exception) {
                runOnUiThread {
                    showLoading(false)
                    showError("Business config failed: ${e.message}")
                }
            }
        }
    }
    
    private fun refreshLocalization() {
        val instance = NivoStack.instanceOrNull() ?: run {
            showError("SDK not initialized")
            return
        }
        showLoading(true)
        
        CoroutineScope(Dispatchers.IO).launch {
            try {
                instance.localization.setLanguage("en")
                val translations = instance.localization.fetchTranslations("en")
                
                runOnUiThread {
                    showLoading(false)
                    showMessage("Localization refreshed: ${translations.size} translations loaded")
                }
            } catch (e: Exception) {
                runOnUiThread {
                    showLoading(false)
                    showError("Localization failed: ${e.message}")
                }
            }
        }
    }
    
    private fun setUser() {
        val instance = NivoStack.instanceOrNull() ?: run {
            showError("SDK not initialized")
            return
        }
        
        // Use public API method
        instance.setUser(
            userId = "user_${System.currentTimeMillis()}",
            email = "test@example.com",
            name = "Test User"
        )
        
        showMessage("User set successfully")
        updateStatus()
    }
    
    private fun clearUser() {
        val instance = NivoStack.instanceOrNull() ?: run {
            showError("SDK not initialized")
            return
        }
        
        // Use public API method
        instance.clearUser()
        
        showMessage("User cleared successfully")
        updateStatus()
    }
    
    private fun trackScreen() {
        val instance = NivoStack.instanceOrNull() ?: run {
            showError("SDK not initialized")
            return
        }
        
        // Use public API method
        val screenName = "TestScreen_${System.currentTimeMillis()}"
        instance.trackScreen(screenName)
        
        showMessage("Screen tracked: $screenName")
        updateStatus()
    }
    
    private fun showLoading(show: Boolean) {
        // You can add a progress bar here if needed
    }
    
    private fun showMessage(message: String) {
        val root = findViewById<android.view.ViewGroup>(R.id.root)
        Snackbar.make(root, message, Snackbar.LENGTH_LONG).show()
        updateStatus()
    }
    
    private fun showError(message: String) {
        val root = findViewById<android.view.ViewGroup>(R.id.root)
        Snackbar.make(root, message, Snackbar.LENGTH_LONG)
            .setBackgroundTint(0xFFD32F2F.toInt())
            .show()
        updateStatus()
    }
    
    private fun refreshConfig() {
        val instance = NivoStack.instanceOrNull() ?: run {
            showError("SDK not initialized")
            return
        }
        showLoading(true)
        
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val updated = instance.refreshConfig(forceRefresh = false)
                runOnUiThread {
                    showLoading(false)
                    showMessage(if (updated) "Config refreshed successfully" else "Config unchanged (304 Not Modified)")
                    updateStatus()
                }
            } catch (e: Exception) {
                runOnUiThread {
                    showLoading(false)
                    showError("Refresh config failed: ${e.message}")
                }
            }
        }
    }
    
    private fun flush() {
        val instance = NivoStack.instanceOrNull() ?: run {
            showError("SDK not initialized")
            return
        }
        showLoading(true)
        
        CoroutineScope(Dispatchers.IO).launch {
            try {
                instance.flush()
                runOnUiThread {
                    showLoading(false)
                    showMessage("Flushed pending traces and logs. Pending: ${instance.getPendingTraceCount()} traces, ${instance.getPendingLogCount()} logs")
                    updateStatus()
                }
            } catch (e: Exception) {
                runOnUiThread {
                    showLoading(false)
                    showError("Flush failed: ${e.message}")
                }
            }
        }
    }
    
    private fun trackApiTrace() {
        val instance = NivoStack.instanceOrNull() ?: run {
            showError("SDK not initialized")
            return
        }
        
        // Use public API method
        instance.trackApiTrace(
            url = "https://api.example.com/test",
            method = "GET",
            statusCode = 200,
            duration = 150L,
            screenName = "MainActivity"
        )
        
        showMessage("API trace tracked. Pending traces: ${instance.getPendingTraceCount()}")
        updateStatus()
    }
    
    private fun showErrorWithDetails(title: String, statusCode: Int, statusMessage: String, responseBody: String) {
        val root = findViewById<android.view.ViewGroup>(R.id.root)
        
        // Parse error details from response
        val errorMessage = try {
            val responseData = gson.fromJson(responseBody, Map::class.java) as? Map<*, *>
            val error = responseData?.get("error") as? String ?: responseBody
            val usage = responseData?.get("usage") as? Map<*, *>
            val retryAfter = responseData?.get("retryAfter") as? Number
            
            buildString {
                append("HTTP $statusCode: $statusMessage\n")
                append("Error: $error\n")
                usage?.let {
                    val used = it["used"] as? Number ?: 0
                    val limit = it["limit"] as? Number ?: 0
                    val percentage = if (limit.toInt() > 0) {
                        (used.toDouble() / limit.toDouble() * 100).toInt()
                    } else 0
                    append("Usage: $used/$limit ($percentage%)\n")
                }
                retryAfter?.let {
                    append("Retry After: ${it}s\n")
                }
            }
        } catch (e: Exception) {
            "HTTP $statusCode: $statusMessage\nError: $responseBody"
        }
        
        Snackbar.make(root, "$title\n$errorMessage", Snackbar.LENGTH_LONG)
            .setBackgroundTint(0xFFD32F2F.toInt())
            .show()
        updateStatus()
    }
}

