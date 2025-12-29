import 'dart:convert';

import 'package:dio/dio.dart';

import 'nivostack.dart';

/// Dio interceptor for tracking API requests/responses with NivoStack
///
/// Usage:
/// ```dart
/// final dio = Dio();
/// dio.interceptors.add(NivoStackDioInterceptor());
/// ```
class NivoStackDioInterceptor extends Interceptor {
  /// URLs to exclude from tracking (e.g., NivoStack's own URLs)
  final List<String> excludeUrls;

  /// Maximum body size to capture (in bytes)
  final int maxBodySize;

  /// Whether to capture request body
  final bool captureRequestBody;

  /// Whether to capture response body
  final bool captureResponseBody;

  NivoStackDioInterceptor({
    this.excludeUrls = const [],
    this.maxBodySize = 10000, // 10KB
    this.captureRequestBody = true,
    this.captureResponseBody = true,
  });

  final Map<RequestOptions, DateTime> _requestStartTimes = {};

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    // Record start time
    _requestStartTimes[options] = DateTime.now();
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    _trackTrace(response.requestOptions, response: response);
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    _trackTrace(err.requestOptions, error: err);
    handler.next(err);
  }

  void _trackTrace(
    RequestOptions options, {
    Response? response,
    DioException? error,
  }) {
    if (!NivoStack.isInitialized) return;

    final url = options.uri.toString();

    // Check if URL should be excluded
    if (_shouldExclude(url)) {
      _requestStartTimes.remove(options);
      return;
    }

    final startTime = _requestStartTimes.remove(options);
    final duration = startTime != null
        ? DateTime.now().difference(startTime).inMilliseconds
        : null;

    // Prepare request headers (filter sensitive ones)
    final requestHeaders = _sanitizeHeaders(options.headers);

    // Prepare request body
    String? requestBody;
    if (captureRequestBody && options.data != null) {
      requestBody = _truncateBody(_serializeData(options.data));
    }

    // Prepare response data
    Map<String, dynamic>? responseHeaders;
    String? responseBody;
    int? statusCode;
    String? errorMessage;

    if (response != null) {
      statusCode = response.statusCode;
      responseHeaders = _sanitizeHeaders(
        response.headers.map.map((k, v) => MapEntry(k, v.join(', '))),
      );
      if (captureResponseBody && response.data != null) {
        responseBody = _truncateBody(_serializeData(response.data));
      }
    }

    if (error != null) {
      statusCode = error.response?.statusCode;
      errorMessage = error.message;
      if (error.response != null) {
        responseHeaders = _sanitizeHeaders(
          error.response!.headers.map.map((k, v) => MapEntry(k, v.join(', '))),
        );
        if (captureResponseBody && error.response?.data != null) {
          responseBody = _truncateBody(_serializeData(error.response!.data));
        }
      }
    }

    // Track the trace
    NivoStack.instance.trackApiTrace(
      url: url,
      method: options.method,
      statusCode: statusCode,
      requestHeaders: requestHeaders,
      requestBody: requestBody,
      responseHeaders: responseHeaders,
      responseBody: responseBody,
      duration: duration,
      error: errorMessage,
    );
  }

  bool _shouldExclude(String url) {
    // Always exclude NivoStack URLs
    if (url.contains('nivostack')) return true;

    // Check custom exclusions
    for (final exclude in excludeUrls) {
      if (url.contains(exclude)) return true;
    }
    return false;
  }

  Map<String, dynamic> _sanitizeHeaders(Map<String, dynamic> headers) {
    final sensitiveKeys = [
      'authorization',
      'cookie',
      'set-cookie',
      'x-api-key',
      'api-key',
      'password',
      'secret',
      'token',
    ];

    return headers.map((key, value) {
      final lowerKey = key.toLowerCase();
      if (sensitiveKeys.any((s) => lowerKey.contains(s))) {
        return MapEntry(key, '[REDACTED]');
      }
      return MapEntry(key, value);
    });
  }

  String _serializeData(dynamic data) {
    if (data == null) return '';
    if (data is String) return data;
    if (data is Map || data is List) {
      try {
        return jsonEncode(data);
      } catch (_) {
        return data.toString();
      }
    }
    return data.toString();
  }

  String _truncateBody(String body) {
    if (body.length <= maxBodySize) return body;
    return '${body.substring(0, maxBodySize)}... [TRUNCATED]';
  }
}
