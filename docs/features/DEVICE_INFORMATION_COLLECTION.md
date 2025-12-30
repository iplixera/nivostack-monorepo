# Device Information Collection - Firebase Analytics Comparison

## Overview

This document outlines all device information that can be collected, comparing Firebase Analytics' automatic device properties with DevBridge's current implementation. It serves as a reference for implementing comprehensive device information collection.

## Firebase Analytics Device Properties

Firebase Analytics automatically collects the following device properties:

### 1. Device Identification
- **Device Model** - e.g., "iPhone 14 Pro", "Samsung Galaxy S23"
- **Device Manufacturer** - e.g., "Apple", "Samsung", "Google"
- **Device Brand** - e.g., "Apple", "Samsung"
- **Device Type** - Phone, Tablet, TV, etc.
- **Device ID** - Platform-specific unique identifier (Android ID, iOS IDFV)
- **App Instance ID** - Unique identifier for each app installation (Firebase Installation ID)

### 2. Operating System
- **Platform** - iOS, Android, Web
- **OS Name** - iOS, Android
- **OS Version** - e.g., "17.0", "14.0"
- **OS Build** - Build number (e.g., "21A329")

### 3. Application Information
- **App Version** - Version string (e.g., "1.2.3")
- **App Build** - Build number
- **App Bundle ID** - Package name / Bundle identifier
- **Installation Date** - When app was first installed
- **First Open Date** - When app was first opened

### 4. Screen & Display
- **Screen Width** - Width in pixels
- **Screen Height** - Height in pixels
- **Screen Density** - DPI/PPI (dots per inch)
- **Screen Size** - Physical screen size category (small, normal, large, xlarge)
- **Screen Orientation** - Portrait, Landscape
- **Pixel Ratio** - Device pixel ratio

### 5. Hardware Specifications
- **CPU Architecture** - e.g., "arm64", "x86_64", "armeabi-v7a"
- **CPU Cores** - Number of CPU cores
- **RAM/Memory Total** - Total device memory in bytes
- **RAM/Memory Available** - Available memory in bytes
- **Storage Total** - Total storage capacity in bytes
- **Storage Free** - Free storage space in bytes
- **Storage Used** - Used storage space in bytes

### 6. Network Information
- **Network Type** - wifi, cellular, offline, unknown
- **Carrier Name** - Mobile carrier name (e.g., "Verizon", "AT&T")
- **Carrier Country Code** - ISO country code (e.g., "US", "GB")
- **Connection Type** - 2G, 3G, 4G, 5G, WiFi, etc.
- **IP Address** - Client IP address (server-side)

### 7. Location & Locale
- **Country Code** - ISO country code (e.g., "US", "GB")
- **Language Code** - Language code (e.g., "en", "es", "fr")
- **Locale** - Full locale string (e.g., "en_US", "es_ES")
- **Time Zone** - Timezone offset (e.g., "America/New_York", "UTC+5:30")
- **Currency Code** - Currency code (e.g., "USD", "EUR")

### 8. Device State
- **Battery Level** - Battery percentage (0-100)
- **Battery State** - Charging, Discharging, Full, Unknown
- **Is Charging** - Boolean indicating if device is charging
- **Is Low Power Mode** - Boolean (iOS Low Power Mode, Android Battery Saver)

### 9. Device Characteristics
- **Is Tablet** - Boolean indicating if device is a tablet
- **Is Emulator** - Boolean indicating if running on emulator/simulator
- **Is Rooted/Jailbroken** - Boolean indicating if device is rooted/jailbroken
- **Is Debug Build** - Boolean indicating if app is debug build
- **Is Release Build** - Boolean indicating if app is release build

### 10. Additional Properties (Firebase Crashlytics)
- **Device Orientation** - Current orientation
- **Available Storage** - Available storage space
- **Total Storage** - Total storage capacity
- **System Uptime** - System uptime in milliseconds
- **App Uptime** - App uptime in milliseconds

## DevBridge Current Collection

### Currently Collected (Basic)
- ✅ `deviceId` - Platform-specific unique identifier
- ✅ `platform` - iOS, Android
- ✅ `osVersion` - OS version string
- ✅ `appVersion` - App version string
- ✅ `model` - Device model name
- ✅ `manufacturer` - Device manufacturer
- ✅ `deviceCode` - Human-readable device code (unique to DevBridge)
- ✅ `metadata` - Flexible JSON field for additional data

### Currently Collected (Phase 1 - Enhanced)
- ✅ `fingerprint` - Device fingerprint hash
- ✅ `batteryLevel` - Battery level (0-100)
- ✅ `storageFree` - Free storage in bytes
- ✅ `memoryTotal` - Total memory in bytes
- ✅ `networkType` - wifi, cellular, offline
- ✅ `screenWidth` - Screen width in pixels
- ✅ `screenHeight` - Screen height in pixels
- ✅ `screenDensity` - Screen density (DPI)
- ✅ `cpuArchitecture` - CPU architecture

### Missing Fields (Recommended to Add)

#### High Priority (P0) - Core Device Information
1. **`deviceBrand`** - String - Device brand (e.g., "Apple", "Samsung")
2. **`deviceType`** - String - Device type (phone, tablet, tv, etc.)
3. **`osBuild`** - String - OS build number
4. **`appBuild`** - String - App build number
5. **`appBundleId`** - String - Package name / Bundle identifier
6. **`screenOrientation`** - String - Portrait, Landscape
7. **`pixelRatio`** - Float - Device pixel ratio
8. **`memoryAvailable`** - BigInt - Available memory in bytes
9. **`storageTotal`** - BigInt - Total storage capacity in bytes
10. **`storageUsed`** - BigInt - Used storage space in bytes

#### Medium Priority (P1) - Network & Location
11. **`carrierName`** - String - Mobile carrier name
12. **`carrierCountryCode`** - String - Carrier country code
13. **`connectionType`** - String - 2G, 3G, 4G, 5G, WiFi
14. **`countryCode`** - String - ISO country code
15. **`languageCode`** - String - Language code (e.g., "en", "es")
16. **`locale`** - String - Full locale string (e.g., "en_US")
17. **`timeZone`** - String - Timezone (e.g., "America/New_York")
18. **`currencyCode`** - String - Currency code

#### Medium Priority (P1) - Device State
19. **`batteryState`** - String - Charging, Discharging, Full, Unknown
20. **`isCharging`** - Boolean - Is device charging
21. **`isLowPowerMode`** - Boolean - Low power mode enabled
22. **`isTablet`** - Boolean - Is device a tablet
23. **`isEmulator`** - Boolean - Is running on emulator/simulator
24. **`isRooted`** - Boolean - Is device rooted/jailbroken
25. **`isDebugBuild`** - Boolean - Is debug build

#### Low Priority (P2) - Advanced Metrics
26. **`cpuCores`** - Int - Number of CPU cores
27. **`systemUptime`** - BigInt - System uptime in milliseconds
28. **`appUptime`** - BigInt - App uptime in milliseconds
29. **`installationDate`** - DateTime - When app was first installed
30. **`firstOpenDate`** - DateTime - When app was first opened
31. **`screenSizeCategory`** - String - small, normal, large, xlarge

## Recommended Database Schema Updates

```prisma
model Device {
  // ... existing fields ...
  
  // High Priority (P0) - Core Device Information
  deviceBrand        String?   // Device brand (e.g., "Apple", "Samsung")
  deviceType         String?   // phone, tablet, tv, etc.
  osBuild            String?   // OS build number
  appBuild           String?   // App build number
  appBundleId        String?   // Package name / Bundle identifier
  screenOrientation  String?   // portrait, landscape
  pixelRatio         Float?    // Device pixel ratio
  memoryAvailable    BigInt?   // Available memory in bytes
  storageTotal       BigInt?   // Total storage capacity in bytes
  storageUsed        BigInt?   // Used storage space in bytes
  
  // Medium Priority (P1) - Network & Location
  carrierName        String?   // Mobile carrier name
  carrierCountryCode String?   // Carrier country code
  connectionType     String?   // 2G, 3G, 4G, 5G, WiFi
  countryCode        String?   // ISO country code
  languageCode       String?   // Language code (e.g., "en", "es")
  locale             String?   // Full locale string (e.g., "en_US")
  timeZone           String?   // Timezone (e.g., "America/New_York")
  currencyCode       String?   // Currency code
  
  // Medium Priority (P1) - Device State
  batteryState       String?   // charging, discharging, full, unknown
  isCharging         Boolean?  // Is device charging
  isLowPowerMode     Boolean?  // Low power mode enabled
  isTablet           Boolean?  // Is device a tablet
  isEmulator         Boolean?  // Is running on emulator/simulator
  isRooted           Boolean?  // Is device rooted/jailbroken
  isDebugBuild       Boolean?  // Is debug build
  
  // Low Priority (P2) - Advanced Metrics
  cpuCores           Int?      // Number of CPU cores
  systemUptime       BigInt?   // System uptime in milliseconds
  appUptime          BigInt?   // App uptime in milliseconds
  installationDate   DateTime? // When app was first installed
  firstOpenDate      DateTime? // When app was first opened
  screenSizeCategory  String?   // small, normal, large, xlarge
}
```

## Flutter SDK Implementation Guide

### Required Packages

```yaml
dependencies:
  device_info_plus: ^9.1.0
  battery_plus: ^4.0.2
  connectivity_plus: ^5.0.2
  package_info_plus: ^5.0.0
  flutter_native_timezone: ^2.0.0
  intl: ^0.19.0
```

### Device Information Collection Code

```dart
import 'dart:io';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:battery_plus/battery_plus.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:flutter_native_timezone/flutter_native_timezone.dart';
import 'package:flutter/services.dart';
import 'dart:ui' as ui;

class DeviceInfoCollector {
  final DeviceInfoPlugin _deviceInfo = DeviceInfoPlugin();
  final Battery _battery = Battery();
  final Connectivity _connectivity = Connectivity();
  
  Future<Map<String, dynamic>> collectDeviceInfo() async {
    final packageInfo = await PackageInfo.fromPlatform();
    final deviceInfo = Platform.isAndroid 
        ? await _deviceInfo.androidInfo 
        : await _deviceInfo.iosInfo;
    
    final mediaQuery = MediaQueryData.fromWindow(ui.window);
    final batteryInfo = await _battery.batteryState;
    final batteryLevel = await _battery.batteryLevel;
    final connectivityResult = await _connectivity.checkConnectivity();
    final timeZone = await FlutterNativeTimezone.getLocalTimezone();
    final locale = Platform.localeName;
    
    Map<String, dynamic> deviceData = {
      // Basic device info
      'deviceId': Platform.isAndroid 
          ? (deviceInfo as AndroidDeviceInfo).id
          : (deviceInfo as IosDeviceInfo).identifierForVendor,
      'platform': Platform.isAndroid ? 'android' : 'ios',
      'model': Platform.isAndroid 
          ? (deviceInfo as AndroidDeviceInfo).model
          : (deviceInfo as IosDeviceInfo).model,
      'manufacturer': Platform.isAndroid 
          ? (deviceInfo as AndroidDeviceInfo).manufacturer
          : 'Apple',
      'deviceBrand': Platform.isAndroid 
          ? (deviceInfo as AndroidDeviceInfo).brand
          : 'Apple',
      'deviceType': _getDeviceType(deviceInfo),
      
      // OS info
      'osVersion': Platform.isAndroid 
          ? (deviceInfo as AndroidDeviceInfo).version.release
          : (deviceInfo as IosDeviceInfo).systemVersion,
      'osBuild': Platform.isAndroid 
          ? (deviceInfo as AndroidDeviceInfo).version.incremental
          : (deviceInfo as IosDeviceInfo).systemVersion,
      
      // App info
      'appVersion': packageInfo.version,
      'appBuild': packageInfo.buildNumber,
      'appBundleId': packageInfo.packageName,
      
      // Screen info
      'screenWidth': mediaQuery.size.width.toInt(),
      'screenHeight': mediaQuery.size.height.toInt(),
      'screenDensity': mediaQuery.devicePixelRatio,
      'pixelRatio': mediaQuery.devicePixelRatio,
      'screenOrientation': mediaQuery.orientation.toString().split('.').last,
      'screenSizeCategory': _getScreenSizeCategory(mediaQuery.size),
      
      // Hardware
      'cpuArchitecture': Platform.isAndroid 
          ? (deviceInfo as AndroidDeviceInfo).supportedAbis.first
          : (deviceInfo as IosDeviceInfo).utsname.machine,
      'cpuCores': Platform.numberOfProcessors,
      'memoryTotal': Platform.isAndroid 
          ? (deviceInfo as AndroidDeviceInfo).systemFeatures.contains('android.hardware.ram.normal')
              ? _getTotalMemory()
              : null
          : null,
      
      // Battery
      'batteryLevel': batteryLevel,
      'batteryState': batteryInfo.toString().split('.').last,
      'isCharging': batteryInfo == BatteryState.charging,
      'isLowPowerMode': Platform.isIOS 
          ? await _isLowPowerMode()
          : false,
      
      // Network
      'networkType': _getNetworkType(connectivityResult),
      'carrierName': Platform.isAndroid 
          ? await _getCarrierName()
          : null,
      
      // Locale
      'locale': locale,
      'languageCode': locale.split('_').first,
      'countryCode': locale.split('_').length > 1 ? locale.split('_').last : null,
      'timeZone': timeZone,
      'currencyCode': _getCurrencyCode(locale),
      
      // Device characteristics
      'isTablet': Platform.isAndroid 
          ? (deviceInfo as AndroidDeviceInfo).systemFeatures.contains('android.hardware.type.tablet')
          : (deviceInfo as IosDeviceInfo).model.contains('iPad'),
      'isEmulator': Platform.isAndroid 
          ? (deviceInfo as AndroidDeviceInfo).isPhysicalDevice == false
          : (deviceInfo as IosDeviceInfo).isPhysicalDevice == false,
      'isRooted': Platform.isAndroid 
          ? await _isRooted()
          : await _isJailbroken(),
      'isDebugBuild': !const bool.fromEnvironment('dart.vm.product'),
    };
    
    return deviceData;
  }
  
  String _getDeviceType(dynamic deviceInfo) {
    if (Platform.isAndroid) {
      final androidInfo = deviceInfo as AndroidDeviceInfo;
      if (androidInfo.systemFeatures.contains('android.hardware.type.tablet')) {
        return 'tablet';
      } else if (androidInfo.systemFeatures.contains('android.hardware.type.television')) {
        return 'tv';
      } else {
        return 'phone';
      }
    } else {
      final iosInfo = deviceInfo as IosDeviceInfo;
      if (iosInfo.model.contains('iPad')) {
        return 'tablet';
      } else if (iosInfo.model.contains('Apple TV')) {
        return 'tv';
      } else {
        return 'phone';
      }
    }
  }
  
  String _getScreenSizeCategory(Size size) {
    final diagonal = sqrt(pow(size.width, 2) + pow(size.height, 2));
    if (diagonal < 600) return 'small';
    if (diagonal < 960) return 'normal';
    if (diagonal < 1280) return 'large';
    return 'xlarge';
  }
  
  String _getNetworkType(List<ConnectivityResult> connectivityResult) {
    if (connectivityResult.contains(ConnectivityResult.wifi)) {
      return 'wifi';
    } else if (connectivityResult.contains(ConnectivityResult.mobile)) {
      return 'cellular';
    } else if (connectivityResult.contains(ConnectivityResult.none)) {
      return 'offline';
    }
    return 'unknown';
  }
  
  Future<String?> _getCarrierName() async {
    // Requires platform-specific implementation
    // Android: TelephonyManager
    // iOS: CTTelephonyNetworkInfo
    return null;
  }
  
  String? _getCurrencyCode(String locale) {
    // Map locale to currency code
    final currencyMap = {
      'en_US': 'USD',
      'en_GB': 'GBP',
      'es_ES': 'EUR',
      'fr_FR': 'EUR',
      'de_DE': 'EUR',
      'ja_JP': 'JPY',
      'zh_CN': 'CNY',
    };
    return currencyMap[locale] ?? 'USD';
  }
  
  Future<bool> _isLowPowerMode() async {
    // iOS-specific implementation
    return false;
  }
  
  Future<bool> _isRooted() async {
    // Android-specific implementation
    return false;
  }
  
  Future<bool> _isJailbroken() async {
    // iOS-specific implementation
    return false;
  }
  
  BigInt? _getTotalMemory() {
    // Platform-specific implementation
    return null;
  }
}
```

## API Endpoint Updates

Update the device registration endpoint to accept all new fields:

```typescript
// src/app/api/devices/route.ts

const {
  // Existing fields
  deviceId, platform, osVersion, appVersion, model, manufacturer,
  deviceCode, metadata,
  
  // Phase 1 fields
  fingerprint, batteryLevel, storageFree, memoryTotal, networkType,
  screenWidth, screenHeight, screenDensity, cpuArchitecture,
  
  // New P0 fields
  deviceBrand, deviceType, osBuild, appBuild, appBundleId,
  screenOrientation, pixelRatio, memoryAvailable, storageTotal, storageUsed,
  
  // New P1 fields
  carrierName, carrierCountryCode, connectionType, countryCode,
  languageCode, locale, timeZone, currencyCode,
  batteryState, isCharging, isLowPowerMode, isTablet, isEmulator,
  isRooted, isDebugBuild,
  
  // New P2 fields
  cpuCores, systemUptime, appUptime, installationDate, firstOpenDate,
  screenSizeCategory
} = await request.json()
```

## Implementation Priority

### Phase 1A: High Priority Fields (P0)
Implement these first as they provide core device identification and basic hardware information:
- deviceBrand, deviceType, osBuild, appBuild, appBundleId
- screenOrientation, pixelRatio
- memoryAvailable, storageTotal, storageUsed

**Estimated Effort**: 1-2 weeks

### Phase 1B: Medium Priority Fields (P1)
Implement network, location, and device state information:
- Network: carrierName, carrierCountryCode, connectionType
- Location: countryCode, languageCode, locale, timeZone, currencyCode
- Device State: batteryState, isCharging, isLowPowerMode, isTablet, isEmulator, isRooted, isDebugBuild

**Estimated Effort**: 2-3 weeks

### Phase 1C: Low Priority Fields (P2)
Implement advanced metrics and timing information:
- cpuCores, systemUptime, appUptime, installationDate, firstOpenDate, screenSizeCategory

**Estimated Effort**: 1-2 weeks

## Privacy Considerations

When collecting device information, ensure:

1. **User Consent**: Inform users about data collection in privacy policy
2. **Minimal Data**: Only collect necessary information
3. **Data Security**: Encrypt sensitive data at rest and in transit
4. **Data Retention**: Define retention policies for device data
5. **GDPR Compliance**: Allow users to request data deletion
6. **Platform Requirements**: Comply with App Store and Play Store guidelines

## Testing Checklist

- [ ] Test device registration with all new fields
- [ ] Verify data is stored correctly in database
- [ ] Test on both iOS and Android devices
- [ ] Test on emulators/simulators
- [ ] Test on tablets vs phones
- [ ] Test with different network types
- [ ] Test with different battery states
- [ ] Test with different locales/timezones
- [ ] Verify data appears correctly in dashboard
- [ ] Test device filtering by new fields
- [ ] Test device export includes new fields

## References

- [Firebase Analytics Device Properties](https://firebase.google.com/docs/analytics/device-collection)
- [Firebase Crashlytics Device Properties](https://firebase.google.com/docs/crashlytics/get-started)
- [Flutter device_info_plus Package](https://pub.dev/packages/device_info_plus)
- [Flutter battery_plus Package](https://pub.dev/packages/battery_plus)
- [Flutter connectivity_plus Package](https://pub.dev/packages/connectivity_plus)

