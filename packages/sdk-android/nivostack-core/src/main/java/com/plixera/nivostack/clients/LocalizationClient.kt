package com.plixera.nivostack.clients

import com.plixera.nivostack.NivoStack
import kotlinx.coroutines.*
import java.util.concurrent.ConcurrentHashMap

/**
 * Represents a language supported by the project
 */
data class Language(
    val id: String,
    val code: String,
    val name: String,
    val nativeName: String? = null,
    val isDefault: Boolean = false,
    val isEnabled: Boolean = true,
    val isRTL: Boolean = false
)

/**
 * Client for fetching and managing translations from NivoStack
 */
class LocalizationClient(
    private val apiClient: ApiClient,
    private val projectId: String
) {
    private var currentLanguageCode: String? = null
    private var currentLanguage: Language? = null
    private val languages = mutableListOf<Language>()
    private val translationsCache = ConcurrentHashMap<String, Map<String, String>>()
    private val lastFetchTimes = ConcurrentHashMap<String, Long>()
    private val cacheDurationMs = 30 * 60 * 1000L // 30 minutes
    
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    
    /**
     * Set current language
     */
    suspend fun setLanguage(languageCode: String) {
        currentLanguageCode = languageCode
        // Fetch translations if not cached
        if (!translationsCache.containsKey(languageCode)) {
            fetchTranslations(languageCode)
        }
    }
    
    /**
     * Get translation for a key
     */
    fun translate(key: String, defaultValue: String? = null): String? {
        val lang = currentLanguageCode ?: return defaultValue
        val translations = translationsCache[lang] ?: return defaultValue
        return translations[key] ?: defaultValue
    }
    
    /**
     * Fetch translations for a language
     */
    suspend fun fetchTranslations(languageCode: String? = null): Map<String, String> {
        val lang = languageCode ?: currentLanguageCode ?: return emptyMap()
        
        // Check cache
        val lastFetch = lastFetchTimes[lang] ?: 0
        if (System.currentTimeMillis() - lastFetch < cacheDurationMs) {
            return translationsCache[lang] ?: emptyMap()
        }
        
        val response = apiClient.getTranslations(projectId, lang)
        
        val translations = (response["translations"] as? Map<*, *>)?.mapNotNull { (key, value) ->
            key?.toString()?.let { k ->
                k to (value?.toString() ?: "")
            }
        }?.toMap() ?: emptyMap<String, String>()
        
        translationsCache[lang] = translations
        lastFetchTimes[lang] = System.currentTimeMillis()
        
        return translations
    }
    
    /**
     * Fetch available languages
     */
    suspend fun fetchLanguages(): List<Language> {
        // TODO: Implement when API endpoint is available
        return emptyList()
    }
    
    /**
     * Refresh translations from server (non-blocking)
     */
    fun refresh() {
        scope.launch {
            fetchTranslations()
        }
    }
}


