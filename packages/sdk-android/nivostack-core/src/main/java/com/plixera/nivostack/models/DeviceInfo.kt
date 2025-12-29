package com.plixera.nivostack.models

import android.os.Build
import android.content.Context
import android.content.pm.PackageManager

/**
 * Device information model for NivoStack SDK
 */
data class DeviceInfo(
    val deviceId: String,
    val platform: String,
    val osVersion: String? = null,
    val appVersion: String? = null,
    val model: String? = null,
    val manufacturer: String? = null,
    val metadata: Map<String, Any>? = null
) {
    fun toJson(): Map<String, Any> {
        return buildMap {
            put("deviceId", deviceId)
            put("platform", platform)
            osVersion?.let { put("osVersion", it) }
            appVersion?.let { put("appVersion", it) }
            model?.let { put("model", it) }
            manufacturer?.let { put("manufacturer", it) }
            metadata?.let { put("metadata", it) }
        }
    }

    companion object {
        /**
         * Create DeviceInfo from Android context
         */
        fun fromContext(context: Context, deviceId: String): DeviceInfo {
            val packageManager = context.packageManager
            val packageName = context.packageName
            
            val appVersion = try {
                val packageInfo = packageManager.getPackageInfo(packageName, 0)
                packageInfo.versionName ?: "unknown"
            } catch (e: PackageManager.NameNotFoundException) {
                "unknown"
            }

            return DeviceInfo(
                deviceId = deviceId,
                platform = "android",
                osVersion = Build.VERSION.RELEASE,
                appVersion = appVersion,
                model = Build.MODEL,
                manufacturer = Build.MANUFACTURER,
                metadata = mapOf(
                    "sdkInt" to Build.VERSION.SDK_INT,
                    "brand" to Build.BRAND,
                    "device" to Build.DEVICE,
                    "product" to Build.PRODUCT
                )
            )
        }
    }
}

