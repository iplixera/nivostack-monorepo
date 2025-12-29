package com.plixera.nivostack

import android.app.Activity
import android.app.Application
import android.os.Bundle

/**
 * Activity lifecycle observer for automatic screen tracking
 * 
 * Register this in your Application class:
 * ```kotlin
 * registerActivityLifecycleCallbacks(NivoStackLifecycleObserver())
 * ```
 */
class NivoStackLifecycleObserver : Application.ActivityLifecycleCallbacks {
    
    override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) {
        // Track screen when activity is created
        val instance = NivoStack.instanceOrNull() ?: return
        val screenName = activity.javaClass.simpleName
        instance.trackScreen(screenName)
    }
    
    override fun onActivityStarted(activity: Activity) {
        // No-op
    }
    
    override fun onActivityResumed(activity: Activity) {
        // No-op
    }
    
    override fun onActivityPaused(activity: Activity) {
        // No-op
    }
    
    override fun onActivityStopped(activity: Activity) {
        // No-op
    }
    
    override fun onActivitySaveInstanceState(activity: Activity, outState: Bundle) {
        // No-op
    }
    
    override fun onActivityDestroyed(activity: Activity) {
        // No-op
    }
}

