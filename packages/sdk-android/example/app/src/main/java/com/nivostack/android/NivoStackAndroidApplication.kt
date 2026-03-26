package com.nivostack.android

import android.app.Application
import com.plixera.nivostack.NivoStack
import com.plixera.nivostack.NivoStackLifecycleObserver

class NivoStackAndroidApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        // Initialize NivoStack SDK
        // Using production endpoints (even in debug mode):
        // - Ingest API: https://ingest.nivostack.com (for sending data)
        // - Control API: https://api.nivostack.com (for fetching config)
        NivoStack.init(
            context = this,
            apiKey = "cmjvwzx140003og8t37yd6kor", // Project API key
            projectId = "cmjvwzx140003og8t37yd6kor", // Project ID
            // Using default production URLs (ingestUrl and controlUrl parameters omitted)
            enabled = true,
            syncIntervalMinutes = 15L // Sync config every 15 minutes when app is active
        )
        
        // Register lifecycle observer for screen tracking
        registerActivityLifecycleCallbacks(NivoStackLifecycleObserver())
    }
}

