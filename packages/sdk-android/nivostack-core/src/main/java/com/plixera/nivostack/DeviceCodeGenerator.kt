package com.plixera.nivostack

import android.content.Context
import android.content.SharedPreferences
import java.security.SecureRandom

/**
 * Generator for short, human-readable device codes
 *
 * Device codes are used for easy identification in support scenarios.
 * Format: XXXX-XXXX (8 alphanumeric characters with hyphen separator)
 * Example: "A7B3-X9K2"
 *
 * Excludes confusing characters: 0/O, 1/l/I
 */
object DeviceCodeGenerator {
    private const val STORAGE_KEY = "devbridge_device_code"
    
    // Characters that are easy to distinguish (no 0/O, 1/l/I confusion)
    private const val CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    
    /**
     * Generate a new random device code
     */
    fun generate(): String {
        val random = SecureRandom()
        val code = (1..8).map { 
            CHARS[random.nextInt(CHARS.length)]
        }.joinToString("")
        return "${code.substring(0, 4)}-${code.substring(4)}"
    }
    
    /**
     * Get or generate the device code
     *
     * Returns the stored device code if it exists, otherwise generates a new one
     * and stores it for future use.
     */
    fun getOrGenerate(context: Context): String {
        val prefs = context.getSharedPreferences("nivostack_prefs", Context.MODE_PRIVATE)
        
        // Check if we already have a device code
        val existingCode = prefs.getString(STORAGE_KEY, null)
        if (!existingCode.isNullOrEmpty()) {
            return existingCode
        }
        
        // Generate a new code and store it
        val newCode = generate()
        prefs.edit().putString(STORAGE_KEY, newCode).apply()
        return newCode
    }
    
    /**
     * Get the stored device code (if any)
     *
     * Returns null if no device code has been generated yet.
     */
    fun get(context: Context): String? {
        val prefs = context.getSharedPreferences("nivostack_prefs", Context.MODE_PRIVATE)
        return prefs.getString(STORAGE_KEY, null)
    }
    
    /**
     * Save a device code (typically one assigned by the server)
     *
     * This stores the code so it persists across app restarts.
     */
    fun save(context: Context, code: String) {
        val prefs = context.getSharedPreferences("nivostack_prefs", Context.MODE_PRIVATE)
        prefs.edit().putString(STORAGE_KEY, code).apply()
    }
    
    /**
     * Clear the stored device code
     *
     * This will cause a new code to be generated on next call to getOrGenerate().
     * Use with caution - changing device code will break support workflows.
     */
    fun clear(context: Context) {
        val prefs = context.getSharedPreferences("nivostack_prefs", Context.MODE_PRIVATE)
        prefs.edit().remove(STORAGE_KEY).apply()
    }
}

