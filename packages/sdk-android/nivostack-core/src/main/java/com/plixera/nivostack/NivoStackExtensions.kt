package com.plixera.nivostack

import com.plixera.nivostack.clients.BusinessConfigClient
import com.plixera.nivostack.clients.LocalizationClient

/**
 * Extension property to get BusinessConfigClient from NivoStack instance
 */
val NivoStack.businessConfig: BusinessConfigClient?
    get() {
        if (!featureFlags.businessConfig || !featureFlags.sdkEnabled) return null
        return BusinessConfigClient(apiClient, projectId)
    }

/**
 * Extension property to get LocalizationClient from NivoStack instance
 */
val NivoStack.localization: LocalizationClient?
    get() {
        if (!featureFlags.localization || !featureFlags.sdkEnabled) return null
        return LocalizationClient(apiClient, projectId)
    }

