import 'dart:math';

import 'package:shared_preferences/shared_preferences.dart';

/// Generator for short, human-readable device codes
///
/// Device codes are used for easy identification in support scenarios.
/// Format: XXXX-XXXX (8 alphanumeric characters with hyphen separator)
/// Example: "A7B3-X9K2"
///
/// Excludes confusing characters: 0/O, 1/l/I
class DeviceCodeGenerator {
  static const String _storageKey = 'devbridge_device_code';

  // Characters that are easy to distinguish (no 0/O, 1/l/I confusion)
  static const String _chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  /// Generate a new random device code
  static String generate() {
    final random = Random.secure();
    final code = List.generate(8, (_) => _chars[random.nextInt(_chars.length)]).join();
    return '${code.substring(0, 4)}-${code.substring(4)}';
  }

  /// Get or generate the device code
  ///
  /// Returns the stored device code if it exists, otherwise generates a new one
  /// and stores it for future use.
  static Future<String> getOrGenerate() async {
    final prefs = await SharedPreferences.getInstance();

    // Check if we already have a device code
    final existingCode = prefs.getString(_storageKey);
    if (existingCode != null && existingCode.isNotEmpty) {
      return existingCode;
    }

    // Generate a new code and store it
    final newCode = generate();
    await prefs.setString(_storageKey, newCode);
    return newCode;
  }

  /// Get the stored device code (if any)
  ///
  /// Returns null if no device code has been generated yet.
  static Future<String?> get() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_storageKey);
  }

  /// Save a device code (typically one assigned by the server)
  ///
  /// This stores the code so it persists across app restarts.
  static Future<void> save(String code) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_storageKey, code);
  }

  /// Clear the stored device code
  ///
  /// This will cause a new code to be generated on next call to getOrGenerate().
  /// Use with caution - changing device code will break support workflows.
  static Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_storageKey);
  }
}
