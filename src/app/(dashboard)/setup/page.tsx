'use client'

import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SetupPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Array<{ id: string; name: string; apiKey: string }>>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const fetchProjects = async () => {
      try {
        const response = await api.projects.list()
        setProjects(response.projects || [])
        if (response.projects && response.projects.length > 0) {
          setSelectedProjectId(response.projects[0].id)
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [user, router])

  const selectedProject = projects.find(p => p.id === selectedProjectId)
  const apiKey = selectedProject?.apiKey || ''
  const endpoint = typeof window !== 'undefined' ? window.location.origin : ''

  const swiftCode = `// DevBridge.swift - Add this file to your Xcode project

import Foundation

class DevBridge {
    static let shared = DevBridge()
    private var apiKey = "${apiKey}"
    private let endpoint = "${endpoint}"
    private var deviceId: String = ""

    init() {
        deviceId = UIDevice.current.identifierForVendor?.uuidString ?? UUID().uuidString
        registerDevice()
    }

    private func registerDevice() {
        let payload: [String: Any] = [
            "deviceId": deviceId,
            "platform": "ios",
            "osVersion": UIDevice.current.systemVersion,
            "model": UIDevice.current.model,
            "manufacturer": "Apple"
        ]
        send(path: "/api/devices", payload: payload)
    }

    func trace(url: String, method: String, statusCode: Int, duration: Int, error: String? = nil) {
        var payload: [String: Any] = [
            "deviceId": deviceId,
            "url": url,
            "method": method,
            "statusCode": statusCode,
            "duration": duration,
            "timestamp": Int(Date().timeIntervalSince1970 * 1000)
        ]
        if let error = error {
            payload["error"] = error
        }
        send(path: "/api/traces", payload: payload)
    }

    func log(message: String, level: String = "info", data: [String: Any]? = nil) {
        var payload: [String: Any] = [
            "deviceId": deviceId,
            "level": level,
            "message": message,
            "timestamp": Int(Date().timeIntervalSince1970 * 1000)
        ]
        if let data = data {
            payload["data"] = data
        }
        send(path: "/api/logs", payload: payload)
    }

    func crash(message: String, stackTrace: String? = nil) {
        var payload: [String: Any] = [
            "deviceId": deviceId,
            "message": message,
            "timestamp": Int(Date().timeIntervalSince1970 * 1000)
        ]
        if let stackTrace = stackTrace {
            payload["stackTrace"] = stackTrace
        }
        send(path: "/api/crashes", payload: payload)
    }

    private func send(path: String, payload: [String: Any]) {
        guard let url = URL(string: endpoint + path) else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(apiKey, forHTTPHeaderField: "x-api-key")
        
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: payload)
            URLSession.shared.dataTask(with: request).resume()
        } catch {
            print("DevBridge: Failed to serialize payload")
        }
    }
}`

  const kotlinCode = `// DevBridge.kt - Add this file to your Android project

import android.os.Build
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.util.UUID

class DevBridge private constructor() {
    companion object {
        @JvmStatic
        val instance: DevBridge by lazy { DevBridge() }
    }

    private val apiKey = "${apiKey}"
    private val endpoint = "${endpoint}"
    private var deviceId: String = ""

    fun init(context: android.content.Context) {
        deviceId = android.provider.Settings.Secure.getString(
            context.contentResolver,
            android.provider.Settings.Secure.ANDROID_ID
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Setup Instructions</h1>
          <p className="text-gray-400">
            Follow these instructions to integrate DevBridge SDK into your mobile application.
          </p>
        </div>

        {projects.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Project
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedProject && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Quick Setup</h2>
              <p className="text-gray-400 mb-4">
                Copy one of the files below into your project to start tracking API calls, logs, and crashes.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">iOS (Swift)</h3>
              <div className="relative">
                <pre className="p-4 bg-gray-900 rounded-lg overflow-x-auto text-sm text-gray-300">
                  {swiftCode}
                </pre>
              </div>
              <div className="mt-3 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
                <h4 className="text-blue-400 font-medium mb-2">Usage:</h4>
                <pre className="text-sm text-gray-300">{`// Track API calls
let start = Date()
URLSession.shared.dataTask(with: request) { data, response, error in
    let duration = Int(Date().timeIntervalSince(start) * 1000)
    DevBridge.shared.trace(url: request.url?.absoluteString ?? "", 
                          method: request.httpMethod ?? "GET", 
                          statusCode: (response as? HTTPURLResponse)?.statusCode ?? 0, 
                          duration: duration, 
                          error: error?.localizedDescription)
}.resume()

// Log events
DevBridge.shared.log(message: "User signed in", data: ["userId": "123"])

// Report crashes
DevBridge.shared.crash(message: "Unexpected error", stackTrace: Thread.callStackSymbols.joined(separator: "\\n"))`}</pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Android (Kotlin)</h3>
              <div className="relative">
                <pre className="p-4 bg-gray-900 rounded-lg overflow-x-auto text-sm text-gray-300">
                  {kotlinCode}
                </pre>
              </div>
              <div className="mt-3 p-4 bg-green-900/20 border border-green-800 rounded-lg">
                <h4 className="text-green-400 font-medium mb-2">Usage:</h4>
                <pre className="text-sm text-gray-300">{`// Initialize in Application class
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        DevBridge.instance.init(this)
    }
}

// Track API calls
val startTime = System.currentTimeMillis()
// ... make your API call ...
val duration = System.currentTimeMillis() - startTime
DevBridge.instance.trace(url, "GET", responseCode, duration)

// Log events
DevBridge.instance.log("User signed in", "info", mapOf("userId" to "123"))

// Report crashes
DevBridge.instance.crash("Unexpected error", stackTrace)`}</pre>
              </div>
            </div>

            <div className="p-4 bg-yellow-900/20 border border-yellow-800 rounded-lg">
              <h4 className="text-yellow-400 font-medium mb-2">Note:</h4>
              <p className="text-sm text-gray-300">
                For production apps, we recommend using the official DevBridge Flutter SDK package 
                which provides better performance, offline support, and additional features. 
                Visit the Developer Guide for more information.
              </p>
            </div>
          </div>
        )}

        {projects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No projects found. Create a project to get started.</p>
            <a
              href="/projects"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Create Project
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

