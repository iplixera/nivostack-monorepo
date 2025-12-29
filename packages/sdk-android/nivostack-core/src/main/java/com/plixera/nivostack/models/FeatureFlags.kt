package com.plixera.nivostack.models

/**
 * Feature flags configuration fetched from NivoStack server
 */
data class FeatureFlags(
    val sdkEnabled: Boolean = true,
    val apiTracking: Boolean = true,
    val screenTracking: Boolean = true,
    val crashReporting: Boolean = true,
    val logging: Boolean = true,
    val deviceTracking: Boolean = true,
    val sessionTracking: Boolean = true,
    val businessConfig: Boolean = true,
    val localization: Boolean = true,
    val offlineSupport: Boolean = false,
    val batchEvents: Boolean = true
) {
    companion object {
        /**
         * Default feature flags (all enabled except offline support)
         */
        fun defaults(): FeatureFlags = FeatureFlags()

        /**
         * Create from JSON map
         */
        fun fromJson(json: Map<String, Any>): FeatureFlags {
            return FeatureFlags(
                sdkEnabled = (json["sdkEnabled"] as? Boolean) ?: true,
                apiTracking = (json["apiTracking"] as? Boolean) ?: true,
                screenTracking = (json["screenTracking"] as? Boolean) ?: true,
                crashReporting = (json["crashReporting"] as? Boolean) ?: true,
                logging = (json["logging"] as? Boolean) ?: true,
                deviceTracking = (json["deviceTracking"] as? Boolean) ?: true,
                sessionTracking = (json["sessionTracking"] as? Boolean) ?: true,
                businessConfig = (json["businessConfig"] as? Boolean) ?: true,
                localization = (json["localization"] as? Boolean) ?: true,
                offlineSupport = (json["offlineSupport"] as? Boolean) ?: false,
                batchEvents = (json["batchEvents"] as? Boolean) ?: true
            )
        }
    }

    fun toJson(): Map<String, Any> {
        return mapOf(
            "sdkEnabled" to sdkEnabled,
            "apiTracking" to apiTracking,
            "screenTracking" to screenTracking,
            "crashReporting" to crashReporting,
            "logging" to logging,
            "deviceTracking" to deviceTracking,
            "sessionTracking" to sessionTracking,
            "businessConfig" to businessConfig,
            "localization" to localization,
            "offlineSupport" to offlineSupport,
            "batchEvents" to batchEvents
        )
    }
}

