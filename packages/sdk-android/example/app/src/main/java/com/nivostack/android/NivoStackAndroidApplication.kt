package com.nivostack.android

import android.app.Application
import com.plixera.nivostack.NivoStack
import com.plixera.nivostack.NivoStackLifecycleObserver

class NivoStackAndroidApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        // Initialize NivoStack SDK
        // For Android emulator, use 10.0.2.2:3000 to access host's localhost:3000
        // For physical device, use your computer's IP address
        // For production, use https://ingest.nivostack.com
        val baseUrl = if (true) { // Debug mode - use localhost for emulator
            "http://10.0.2.2:3000" // Android emulator
        } else {
            "https://ingest.nivostack.com"
        }
        
        NivoStack.init(
            context = this,
            baseUrl = baseUrl,
            apiKey = "cmjoin79y00069z09upepkf11", // Your API key
            projectId = "cmjoin79y00059z09y0x3eym7", // Your project ID
            enabled = true,
            syncIntervalMinutes = 15L // Sync config every 15 minutes when app is active
        )
        
        // Register lifecycle observer for screen tracking
        registerActivityLifecycleCallbacks(NivoStackLifecycleObserver())
    }
}

