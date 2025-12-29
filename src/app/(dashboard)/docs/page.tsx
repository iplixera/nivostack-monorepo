'use client'

export default function DocsPage() {
  const genericSwiftCode = `// DevBridge.swift - Add this file to your Xcode project

import Foundation

class DevBridge {
    static let shared = DevBridge()
    private var apiKey = ""
    private var endpoint = ""
    private var deviceId: String = ""

    func configure(apiKey: String, endpoint: String) {
        self.apiKey = apiKey
        self.endpoint = endpoint
        self.deviceId = UIDevice.current.identifierForVendor?.uuidString ?? UUID().uuidString
        registerDevice()
    }

    private func registerDevice() {
        let payload: [String: Any] = [
            "deviceId": deviceId,
            "platform": "ios",
            "osVersion": UIDevice.current.systemVersion,
            "model": UIDevice.current.model
        ]
        send(to: "/api/devices", payload: payload)
    }

    func trace(_ request: URLRequest, response: HTTPURLResponse?, duration: Int, error: Error?) {
        let payload: [String: Any] = [
            "deviceId": deviceId,
            "url": request.url?.absoluteString ?? "",
            "method": request.httpMethod ?? "GET",
            "statusCode": response?.statusCode ?? 0,
            "duration": duration,
            "error": error?.localizedDescription ?? "",
            "timestamp": ISO8601DateFormatter().string(from: Date())
        ]
        send(to: "/api/traces", payload: payload)
    }

    func log(_ message: String, level: String = "info", data: [String: Any]? = nil) {
        let payload: [String: Any] = [
            "deviceId": deviceId,
            "level": level,
            "message": message,
            "data": data ?? [:],
            "timestamp": ISO8601DateFormatter().string(from: Date())
        ]
        send(to: "/api/logs", payload: payload)
    }

    func crash(_ message: String, stackTrace: String? = nil) {
        let payload: [String: Any] = [
            "deviceId": deviceId,
            "message": message,
            "stackTrace": stackTrace ?? "",
            "timestamp": ISO8601DateFormatter().string(from: Date())
        ]
        send(to: "/api/crashes", payload: payload)
    }

    private func send(to path: String, payload: [String: Any]) {
        guard let url = URL(string: endpoint + path) else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(apiKey, forHTTPHeaderField: "x-api-key")
        request.httpBody = try? JSONSerialization.data(withJSONObject: payload)
        URLSession.shared.dataTask(with: request).resume()
    }
}`

  const genericKotlinCode = `// DevBridge.kt - Add this file to your Android project

package com.yourapp.devbridge

import android.content.Context
import android.os.Build
import android.provider.Settings
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.util.UUID

object DevBridge {
    private var apiKey = ""
    private var endpoint = ""
    private var deviceId = ""

    fun configure(context: Context, apiKey: String, endpoint: String) {
        this.apiKey = apiKey
        this.endpoint = endpoint
        this.deviceId = Settings.Secure.getString(
            context.contentResolver,
            Settings.Secure.ANDROID_ID
        ) ?: UUID.randomUUID().toString()
        registerDevice()
    }

    private fun registerDevice() {
        val payload = mapOf(
            "deviceId" to deviceId,
            "platform" to "android",
            "osVersion" to Build.VERSION.RELEASE,
            "model" to Build.MODEL,
            "manufacturer" to Build.MANUFACTURER
        )
        send("/api/devices", payload)
    }

    fun trace(url: String, method: String, statusCode: Int, duration: Long, error: String? = null) {
        val payload = mapOf(
            "deviceId" to deviceId,
            "url" to url,
            "method" to method,
            "statusCode" to statusCode,
            "duration" to duration,
            "error" to (error ?: ""),
            "timestamp" to System.currentTimeMillis()
        )
        send("/api/traces", payload)
    }

    fun log(message: String, level: String = "info", data: Map<String, Any>? = null) {
        val payload = mapOf(
            "deviceId" to deviceId,
            "level" to level,
            "message" to message,
            "data" to (data ?: emptyMap<String, Any>()),
            "timestamp" to System.currentTimeMillis()
        )
        send("/api/logs", payload)
    }

    fun crash(message: String, stackTrace: String? = null) {
        val payload = mapOf(
            "deviceId" to deviceId,
            "message" to message,
            "stackTrace" to (stackTrace ?: ""),
            "timestamp" to System.currentTimeMillis()
        )
        send("/api/crashes", payload)
    }

    private fun send(path: String, payload: Map<String, Any>) {
        Thread {
            try {
                val url = URL(endpoint + path)
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json")
                conn.setRequestProperty("x-api-key", apiKey)
                conn.doOutput = true
                conn.outputStream.write(JSONObject(payload).toString().toByteArray())
                conn.responseCode
            } catch (e: Exception) { }
        }.start()
    }
}`

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-2">SDK Documentation</h1>
      <p className="text-gray-400 mb-8">
        Integrate DevBridge into your iOS or Android app in minutes. No package managers needed - just copy a single file.
      </p>

      <div className="space-y-12">
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-900 rounded-lg">
              <div className="text-2xl mb-2">1</div>
              <h3 className="text-white font-medium mb-1">Copy the file</h3>
              <p className="text-gray-400 text-sm">Add DevBridge.swift or DevBridge.kt to your project</p>
            </div>
            <div className="p-4 bg-gray-900 rounded-lg">
              <div className="text-2xl mb-2">2</div>
              <h3 className="text-white font-medium mb-1">Configure</h3>
              <p className="text-gray-400 text-sm">Set your API key and endpoint from the project dashboard</p>
            </div>
            <div className="p-4 bg-gray-900 rounded-lg">
              <div className="text-2xl mb-2">3</div>
              <h3 className="text-white font-medium mb-1">Start tracking</h3>
              <p className="text-gray-400 text-sm">API traces, logs, and crashes appear in your dashboard</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-4">iOS Integration</h2>
          <pre className="p-4 bg-gray-900 rounded-lg overflow-x-auto text-sm text-gray-300 mb-4">
            {genericSwiftCode}
          </pre>

          <h3 className="text-lg font-medium text-white mb-3">Initialize in AppDelegate</h3>
          <pre className="p-4 bg-gray-900 rounded-lg overflow-x-auto text-sm text-gray-300 mb-4">{`func application(_ application: UIApplication, didFinishLaunchingWithOptions...) -> Bool {
    DevBridge.shared.configure(
        apiKey: "YOUR_API_KEY",
        endpoint: "https://your-devbridge.vercel.app"
    )
    return true
}`}</pre>

          <h3 className="text-lg font-medium text-white mb-3">Track API Calls</h3>
          <pre className="p-4 bg-gray-900 rounded-lg overflow-x-auto text-sm text-gray-300">{`// Wrap your network calls
let start = Date()
URLSession.shared.dataTask(with: request) { data, response, error in
    let duration = Int(Date().timeIntervalSince(start) * 1000)
    DevBridge.shared.trace(
        request,
        response: response as? HTTPURLResponse,
        duration: duration,
        error: error
    )
    // Handle response...
}.resume()

// Or use with Alamofire/other libraries
DevBridge.shared.log("API call completed", data: ["endpoint": "/users"])`}</pre>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Android Integration</h2>
          <pre className="p-4 bg-gray-900 rounded-lg overflow-x-auto text-sm text-gray-300 mb-4">
            {genericKotlinCode}
          </pre>

          <h3 className="text-lg font-medium text-white mb-3">Initialize in Application Class</h3>
          <pre className="p-4 bg-gray-900 rounded-lg overflow-x-auto text-sm text-gray-300 mb-4">{`class MyApp : Application() {
    override fun onCreate() {
        super.onCreate()
        DevBridge.configure(
            context = this,
            apiKey = "YOUR_API_KEY",
            endpoint = "https://your-devbridge.vercel.app"
        )
    }
}`}</pre>

          <h3 className="text-lg font-medium text-white mb-3">Track with OkHttp Interceptor</h3>
          <pre className="p-4 bg-gray-900 rounded-lg overflow-x-auto text-sm text-gray-300">{`class DevBridgeInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        val start = System.currentTimeMillis()

        return try {
            val response = chain.proceed(request)
            val duration = System.currentTimeMillis() - start

            DevBridge.trace(
                url = request.url.toString(),
                method = request.method,
                statusCode = response.code,
                duration = duration
            )
            response
        } catch (e: Exception) {
            DevBridge.trace(
                url = request.url.toString(),
                method = request.method,
                statusCode = 0,
                duration = System.currentTimeMillis() - start,
                error = e.message
            )
            throw e
        }
    }
}

// Add to OkHttpClient
val client = OkHttpClient.Builder()
    .addInterceptor(DevBridgeInterceptor())
    .build()`}</pre>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-4">API Reference</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-900 rounded-lg">
              <h3 className="text-white font-medium mb-2">trace()</h3>
              <p className="text-gray-400 text-sm mb-2">Track API calls with URL, method, status code, and duration</p>
              <code className="text-blue-400 text-sm">DevBridge.trace(url, method, statusCode, duration, error?)</code>
            </div>
            <div className="p-4 bg-gray-900 rounded-lg">
              <h3 className="text-white font-medium mb-2">log()</h3>
              <p className="text-gray-400 text-sm mb-2">Send custom log messages with optional data</p>
              <code className="text-blue-400 text-sm">DevBridge.log(message, level?, data?)</code>
            </div>
            <div className="p-4 bg-gray-900 rounded-lg">
              <h3 className="text-white font-medium mb-2">crash()</h3>
              <p className="text-gray-400 text-sm mb-2">Report crashes with message and stack trace</p>
              <code className="text-blue-400 text-sm">DevBridge.crash(message, stackTrace?)</code>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
