import Foundation

/// Generator for short, human-readable device codes
///
/// Device codes are used for easy identification in support scenarios.
/// Format: XXXX-XXXX (8 alphanumeric characters with hyphen separator)
/// Example: "A7B3-X9K2"
///
/// Excludes confusing characters: 0/O, 1/l/I
public class DeviceCodeGenerator {
    private static let storageKey = "nivostack_device_code"
    
    // Characters that are easy to distinguish (no 0/O, 1/l/I confusion)
    private static let chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    
    /// Generate a new random device code
    public static func generate() -> String {
        var code = ""
        for i in 0..<8 {
            if i == 4 {
                code += "-"
            }
            let randomIndex = Int.random(in: 0..<chars.count)
            let char = chars[chars.index(chars.startIndex, offsetBy: randomIndex)]
            code.append(char)
        }
        return code
    }
    
    /// Get or generate the device code
    ///
    /// Returns the stored device code if it exists, otherwise generates a new one
    /// and stores it for future use.
    public static func getOrGenerate() -> String {
        // Check if we already have a device code
        if let existingCode = UserDefaults.standard.string(forKey: storageKey),
           !existingCode.isEmpty {
            return existingCode
        }
        
        // Generate a new code and store it
        let newCode = generate()
        UserDefaults.standard.set(newCode, forKey: storageKey)
        return newCode
    }
    
    /// Get the stored device code (if any)
    ///
    /// Returns nil if no device code has been generated yet.
    public static func get() -> String? {
        return UserDefaults.standard.string(forKey: storageKey)
    }
    
    /// Save a device code (typically one assigned by the server)
    ///
    /// This stores the code so it persists across app restarts.
    public static func save(_ code: String) {
        UserDefaults.standard.set(code, forKey: storageKey)
    }
    
    /// Clear the stored device code
    ///
    /// This will cause a new code to be generated on next call to getOrGenerate().
    /// Use with caution - changing device code will break support workflows.
    public static func clear() {
        UserDefaults.standard.removeObject(forKey: storageKey)
    }
}

