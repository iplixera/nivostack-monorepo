package com.plixera.nivostack

import android.app.Activity
import android.app.Application
import android.os.Bundle
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

/**
 * Activity lifecycle observer for automatic screen tracking and config sync
 * 
 * Register this in your Application class:
 * ```kotlin
 * registerActivityLifecycleCallbacks(NivoStackLifecycleObserver())
 * ```
 */
class NivoStackLifecycleObserver : Application.ActivityLifecycleCallbacks {
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var resumedActivities = 0
    
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
        resumedActivities++
        // Only sync when first activity resumes (app comes to foreground)
        if (resumedActivities == 1) {
            val instance = NivoStack.instanceOrNull() ?: return
            instance.onAppResumed()
        }
    }
    
    override fun onActivityPaused(activity: Activity) {
        resumedActivities--
        // Only pause sync when last activity pauses (app goes to background)
        if (resumedActivities == 0) {
            val instance = NivoStack.instanceOrNull() ?: return
            instance.onAppPaused()
        }
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

