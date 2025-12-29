/// Device information model for NivoStack
class NivoStackDeviceInfo {
  final String deviceId;
  final String platform;
  final String? osVersion;
  final String? appVersion;
  final String? model;
  final String? manufacturer;
  final Map<String, dynamic>? metadata;

  NivoStackDeviceInfo({
    required this.deviceId,
    required this.platform,
    this.osVersion,
    this.appVersion,
    this.model,
    this.manufacturer,
    this.metadata,
  });

  Map<String, dynamic> toJson() {
    return {
      'deviceId': deviceId,
      'platform': platform,
      if (osVersion != null) 'osVersion': osVersion,
      if (appVersion != null) 'appVersion': appVersion,
      if (model != null) 'model': model,
      if (manufacturer != null) 'manufacturer': manufacturer,
      if (metadata != null) 'metadata': metadata,
    };
  }
}
