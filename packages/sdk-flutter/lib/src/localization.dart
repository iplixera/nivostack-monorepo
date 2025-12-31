import 'dart:async';
import 'dart:ui';

import 'package:shared_preferences/shared_preferences.dart';

import 'api_client.dart';

/// Represents a language supported by the project
class NivoStackLanguage {
  final String id;
  final String code;
  final String name;
  final String? nativeName;
  final bool isDefault;
  final bool isEnabled;
  final bool isRTL;

  NivoStackLanguage({
    required this.id,
    required this.code,
    required this.name,
    this.nativeName,
    required this.isDefault,
    required this.isEnabled,
    required this.isRTL,
  });

  factory NivoStackLanguage.fromJson(Map<String, dynamic> json) {
    return NivoStackLanguage(
      id: json['id'] as String,
      code: json['code'] as String,
      name: json['name'] as String,
      nativeName: json['nativeName'] as String?,
      isDefault: json['isDefault'] as bool? ?? false,
      isEnabled: json['isEnabled'] as bool? ?? true,
      isRTL: json['isRTL'] as bool? ?? false,
    );
  }

  /// Get Flutter locale from language code
  Locale get locale => Locale(code);

  /// Get text direction based on RTL flag
  TextDirection get textDirection =>
      isRTL ? TextDirection.rtl : TextDirection.ltr;
}

/// Client for fetching and managing translations from NivoStack
class NivoStackLocalization {
  final NivoStackApiClient _apiClient;

  /// Current language code
  String? _currentLanguageCode;

  /// Current language info
  NivoStackLanguage? _currentLanguage;

  /// Available languages
  List<NivoStackLanguage> _languages = [];

  /// Translation cache
  final Map<String, Map<String, String>> _translationsCache = {};

  /// Cache duration (default: 30 minutes)
  final Duration cacheDuration;

  /// Last fetch timestamps per language
  final Map<String, DateTime> _lastFetchTimes = {};

  /// Listeners for language changes
  final List<void Function(String languageCode, Map<String, String> translations)> _listeners = [];

  /// Preference key for persisting language selection
  static const _prefKeyLanguage = 'devbridge_language';

  NivoStackLocalization({
    required NivoStackApiClient apiClient,
    this.cacheDuration = const Duration(minutes: 30),
  })  : _apiClient = apiClient;

  /// Initialize localization with optional preferred language
  Future<void> init({String? preferredLanguageCode}) async {
    // Fetch available languages
    await fetchLanguages();

    // Try to load persisted language preference
    final prefs = await SharedPreferences.getInstance();
    final savedLanguage = prefs.getString(_prefKeyLanguage);

    // Determine which language to use
    String? languageCode = preferredLanguageCode ?? savedLanguage;

    // If no preference, use device locale or default
    if (languageCode == null || !_isLanguageSupported(languageCode)) {
      final deviceLocale = PlatformDispatcher.instance.locale;
      if (_isLanguageSupported(deviceLocale.languageCode)) {
        languageCode = deviceLocale.languageCode;
      } else {
        // Use default language
        languageCode = _languages.firstWhere((l) => l.isDefault, orElse: () => _languages.first).code;
      }
    }

    // Set the language
    await setLanguage(languageCode);
  }

  /// Get available languages
  List<NivoStackLanguage> get languages => List.unmodifiable(_languages);

  /// Get current language code
  String? get currentLanguageCode => _currentLanguageCode;

  /// Get current language info
  NivoStackLanguage? get currentLanguage => _currentLanguage;

  /// Get current translations
  Map<String, String> get translations {
    if (_currentLanguageCode == null) return {};
    return _translationsCache[_currentLanguageCode!] ?? {};
  }

  /// Check if current language is RTL
  bool get isRTL => _currentLanguage?.isRTL ?? false;

  /// Get text direction for current language
  TextDirection get textDirection =>
      isRTL ? TextDirection.rtl : TextDirection.ltr;

  /// Fetch available languages from server
  Future<List<NivoStackLanguage>> fetchLanguages({bool forceRefresh = false}) async {
    if (!forceRefresh && _languages.isNotEmpty) {
      return _languages;
    }

    final languagesJson = await _apiClient.getLanguages();
    _languages = languagesJson
        .map((json) => NivoStackLanguage.fromJson(json))
        .where((lang) => lang.isEnabled)
        .toList();

    return _languages;
  }

  /// Set current language and fetch translations
  Future<void> setLanguage(String languageCode) async {
    if (!_isLanguageSupported(languageCode)) {
      throw ArgumentError('Language "$languageCode" is not supported');
    }

    _currentLanguageCode = languageCode;
    _currentLanguage = _languages.firstWhere((l) => l.code == languageCode);

    // Persist selection
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_prefKeyLanguage, languageCode);

    // Fetch translations if not cached or cache expired
    await fetchTranslations(languageCode);

    // Notify listeners
    _notifyListeners();
  }

  /// Fetch translations for a specific language
  Future<Map<String, String>> fetchTranslations(String languageCode, {bool forceRefresh = false}) async {
    if (!forceRefresh && _isCacheValid(languageCode)) {
      return _translationsCache[languageCode] ?? {};
    }

    final response = await _apiClient.getTranslations(
      languageCode: languageCode,
    );

    final translationsData = response['translations'];
    Map<String, String> translations = {};

    if (translationsData is Map) {
      translations = Map<String, String>.from(
        translationsData.map((key, value) => MapEntry(key.toString(), value.toString())),
      );
    }

    _translationsCache[languageCode] = translations;
    _lastFetchTimes[languageCode] = DateTime.now();

    return translations;
  }

  /// Get translation for a key
  String translate(String key, {String? defaultValue, Map<String, String>? args}) {
    String? value = translations[key];

    if (value == null) {
      return defaultValue ?? key;
    }

    // Replace placeholders if args provided
    if (args != null) {
      args.forEach((argKey, argValue) {
        value = value!.replaceAll('{$argKey}', argValue);
        value = value!.replaceAll('{{$argKey}}', argValue);
      });
    }

    return value!;
  }

  /// Shorthand for translate
  String t(String key, {String? defaultValue, Map<String, String>? args}) {
    return translate(key, defaultValue: defaultValue, args: args);
  }

  /// Check if a translation key exists
  bool hasKey(String key) {
    return translations.containsKey(key);
  }

  /// Add listener for language changes
  void addListener(void Function(String languageCode, Map<String, String> translations) listener) {
    _listeners.add(listener);
  }

  /// Remove listener
  void removeListener(void Function(String languageCode, Map<String, String> translations) listener) {
    _listeners.remove(listener);
  }

  bool _isLanguageSupported(String code) {
    return _languages.any((l) => l.code == code && l.isEnabled);
  }

  bool _isCacheValid(String languageCode) {
    final lastFetch = _lastFetchTimes[languageCode];
    if (lastFetch == null) return false;
    return DateTime.now().difference(lastFetch) < cacheDuration;
  }

  void _notifyListeners() {
    if (_currentLanguageCode == null) return;
    final currentTranslations = translations;
    for (final listener in _listeners) {
      listener(_currentLanguageCode!, currentTranslations);
    }
  }

  /// Clear all caches
  void clearCache() {
    _translationsCache.clear();
    _lastFetchTimes.clear();
  }

  /// Refresh current language translations
  Future<void> refresh() async {
    if (_currentLanguageCode != null) {
      await fetchTranslations(_currentLanguageCode!, forceRefresh: true);
      _notifyListeners();
    }
  }

  /// Set localization data from SDK init response (pre-populates cache without network request)
  ///
  /// This is called during SDK initialization when using the combined /api/sdk-init
  /// endpoint to avoid an additional network request for localization.
  void setFromInitData({
    required List<Map<String, dynamic>> languages,
    required Map<String, String> translations,
    String? defaultLanguageCode,
  }) {
    // Parse and set languages
    _languages = languages
        .map((json) => NivoStackLanguage.fromJson(json))
        .where((lang) => lang.isEnabled)
        .toList();

    // Set default language if provided, otherwise use first default language
    String? languageCode = defaultLanguageCode;
    if (languageCode == null) {
      final defaultLang = _languages.firstWhere(
        (l) => l.isDefault,
        orElse: () => _languages.isNotEmpty ? _languages.first : throw StateError('No languages available'),
      );
      languageCode = defaultLang.code;
    }

    // Set current language and translations
    _currentLanguageCode = languageCode;
    _currentLanguage = _languages.firstWhere(
      (l) => l.code == languageCode,
      orElse: () => _languages.first,
    );

    // Cache translations
    _translationsCache[languageCode] = translations;
    _lastFetchTimes[languageCode] = DateTime.now();

    // Persist language selection
    SharedPreferences.getInstance().then((prefs) {
      prefs.setString(_prefKeyLanguage, languageCode!);
    });

    // Notify listeners
    _notifyListeners();
  }
}
