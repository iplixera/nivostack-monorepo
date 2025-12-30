# API Mocking - SDK Integration (Pending)

**Status**: Pending  
**Priority**: P1  
**Target**: Flutter SDK (`packages/devbridge_sdk`)

---

## Overview

SDK integration for API Mocking feature. This will enable Flutter apps to use mock responses instead of real backend APIs, with hybrid routing support.

---

## Requirements

### 1. SDK Configuration

Add mock configuration options to `DevBridge.init()`:

```dart
DevBridge.init(
  apiKey: 'xxx',
  baseUrl: 'https://devbridge-eta.vercel.app',
  // Mock configuration
  mockEnvironmentId: 'env_xxx', // Optional: ID of mock environment to use
  mockMode: 'selective', // Optional: 'selective' | 'global' | 'whitelist' | 'blacklist'
  mockWhitelist: ['/api/users/*'], // Optional: Whitelist patterns (if whitelist mode)
  mockBlacklist: ['/api/payments/*'], // Optional: Blacklist patterns (if blacklist mode)
)
```

### 2. Hybrid Routing Logic

**Location**: `lib/src/api_client.dart` or new `lib/src/mock_client.dart`

**Flow**:
1. Before making API call, check if mocking is enabled (`mockEnvironmentId != null`)
2. Determine if endpoint should be mocked (based on `mockMode`)
3. If should mock:
   - Call `POST /api/mocks/proxy` with request details
   - If `mockFound: true` → Return mock response
   - If `mockFound: false` → Forward to real backend API
4. If shouldn't mock → Skip mock check, use real API

**Implementation**:
```dart
Future<Response> _makeRequest(RequestOptions options) async {
  // Check if should mock
  if (_mockEnvironmentId != null && _shouldMock(options.path, options.method)) {
    final mockResponse = await _getMockResponse(options);
    if (mockResponse != null && mockResponse['mockFound'] == true) {
      // Apply delay if specified
      if (mockResponse['delay'] > 0) {
        await Future.delayed(Duration(milliseconds: mockResponse['delay']));
      }
      return Response(
        statusCode: mockResponse['statusCode'],
        data: mockResponse['body'],
        headers: Map<String, dynamic>.from(mockResponse['headers'] ?? {}),
      );
    }
    // Fall through to real API if no mock found
  }
  
  // Forward to real backend API
  return await dio.request(...);
}

bool _shouldMock(String path, String method) {
  if (_mockMode == 'selective') {
    return true; // Will check in _getMockResponse
  } else if (_mockMode == 'global') {
    return true;
  } else if (_mockMode == 'whitelist') {
    return _mockWhitelist.any((pattern) => _matchesPattern(path, pattern));
  } else if (_mockMode == 'blacklist') {
    return !_mockBlacklist.any((pattern) => _matchesPattern(path, pattern));
  }
  return false;
}

Future<Map<String, dynamic>?> _getMockResponse(RequestOptions options) async {
  try {
    final response = await dio.post(
      '$_baseUrl/api/mocks/proxy',
      data: {
        'environmentId': _mockEnvironmentId,
        'path': options.path,
        'method': options.method,
        'headers': options.headers,
        'query': options.queryParameters,
        'body': options.data,
      },
      options: Options(
        headers: {
          'X-API-Key': _apiKey,
        },
      ),
    );
    
    if (response.data['mockFound'] == true) {
      return response.data;
    }
    return null;
  } catch (e) {
    // If mock proxy fails, fall back to real API
    return null;
  }
}

bool _matchesPattern(String path, String pattern) {
  // Convert pattern to regex
  // e.g., '/api/users/*' → '/api/users/.*'
  final regexPattern = pattern.replaceAll('*', '.*');
  final regex = RegExp('^$regexPattern\$');
  return regex.hasMatch(path);
}
```

### 3. Mock Proxy Integration

**Endpoint**: `POST /api/mocks/proxy`

**Request**:
```dart
{
  "environmentId": "env_xxx", // Optional, uses default if not provided
  "path": "/api/users/123",
  "method": "GET",
  "headers": { "Authorization": "Bearer token" },
  "query": { "include": "profile" },
  "body": null
}
```

**Response (Mock Found)**:
```dart
{
  "mockFound": true,
  "statusCode": 200,
  "headers": { "Content-Type": "application/json" },
  "body": { "id": 123, "name": "John Doe" },
  "delay": 0
}
```

**Response (No Mock)**:
```dart
{
  "mockFound": false,
  "message": "No mock endpoint found for GET /api/users/123"
}
```

### 4. Configuration Storage

Store mock configuration in `SharedPreferences`:
- `devbridge_mock_environment_id`
- `devbridge_mock_mode`
- `devbridge_mock_whitelist` (JSON array)
- `devbridge_mock_blacklist` (JSON array)

### 5. Runtime Configuration

Allow updating mock configuration at runtime:
```dart
// Enable mocking
await DevBridge.setMockEnvironment('env_xxx');

// Disable mocking
await DevBridge.clearMockEnvironment();

// Update mock mode
await DevBridge.setMockMode('whitelist', whitelist: ['/api/users/*']);
```

---

## Files to Modify

1. **`lib/src/devbridge.dart`**
   - Add mock configuration parameters to `init()`
   - Add `setMockEnvironment()`, `clearMockEnvironment()`, `setMockMode()` methods
   - Store mock config in SharedPreferences

2. **`lib/src/api_client.dart`** (or create `lib/src/mock_client.dart`)
   - Add `_mockEnvironmentId`, `_mockMode`, `_mockWhitelist`, `_mockBlacklist` fields
   - Implement `_shouldMock()` method
   - Implement `_getMockResponse()` method
   - Implement `_matchesPattern()` method
   - Modify `_makeRequest()` to check mocks first

3. **`lib/src/storage.dart`** (if exists, or create)
   - Add methods to store/retrieve mock configuration

---

## Testing Checklist

- [ ] Mock configuration persists across app restarts
- [ ] Selective mode: Only mocked endpoints use mocks
- [ ] Global mode: All endpoints checked, fallback to real API
- [ ] Whitelist mode: Only whitelisted patterns mocked
- [ ] Blacklist mode: All endpoints mocked except blacklist
- [ ] Mock delay is applied correctly
- [ ] Mock headers are returned correctly
- [ ] Mock body is returned correctly
- [ ] Fallback to real API when no mock found
- [ ] Fallback to real API when mock proxy fails
- [ ] Path parameter matching works (`/api/users/:id`)
- [ ] Wildcard matching works (`/api/users/*`)
- [ ] Query parameter matching works
- [ ] Header matching works
- [ ] Body JSON path matching works

---

## Example Usage

```dart
// Initialize with mock environment
await DevBridge.init(
  apiKey: 'your-api-key',
  baseUrl: 'https://devbridge-eta.vercel.app',
  mockEnvironmentId: 'env_dev',
  mockMode: 'selective',
);

// Make API call - SDK will check mock first
final response = await dio.get('/api/users/123');
// If mock exists → Returns mock response
// If no mock → Forwards to real backend

// Update mock configuration at runtime
await DevBridge.setMockEnvironment('env_staging');
await DevBridge.setMockMode('whitelist', whitelist: ['/api/users/*', '/api/auth/*']);

// Disable mocking
await DevBridge.clearMockEnvironment();
```

---

## Dependencies

- `dio` - Already used for HTTP requests
- `shared_preferences` - Already used for storage

No new dependencies required.

---

## Estimated Effort

- **Configuration & Storage**: 2 hours
- **Mock Proxy Integration**: 3 hours
- **Routing Logic**: 2 hours
- **Testing**: 2 hours
- **Total**: ~9 hours

---

## Notes

- Mock proxy endpoint is already implemented on server
- Server supports all 4 routing modes
- Server handles path matching, condition evaluation, response selection
- SDK only needs to call proxy and handle response

---

**Last Updated**: December 23, 2025

