# API Mocking - Hybrid Routing Guide

## Overview

The API Mocking feature supports **hybrid routing**, allowing apps to mock some APIs while others go to the real backend. This is the most common use case in mobile/web development.

---

## How It Works

### SDK Flow

```
┌─────────────────────────────────────────────────────────┐
│ SDK Makes API Call: GET /api/users/123                 │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ 1. Check Mock Configuration                              │
│    • Is mocking enabled?                                │
│    • What mode? (selective/global/whitelist/blacklist) │
│    • Should this endpoint be mocked?                    │
└─────────────────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌───────────────┐      ┌───────────────┐
│ Should Mock?   │      │ Don't Mock    │
│ YES            │      │               │
└───────────────┘      └───────────────┘
        │                       │
        ▼                       ▼
┌─────────────────────────────────────────┐
│ 2. Call Mock Proxy                       │
│    POST /api/mocks/proxy                 │
│    { path, method, headers, query, body }│
└─────────────────────────────────────────┘
        │                       │
        ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│ Mock Found?      │    │ Forward to Real  │
│ YES              │    │ Backend API      │
└──────────────────┘    └──────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│ 3. Return Mock Response                  │
│    { statusCode, headers, body }         │
└─────────────────────────────────────────┘
```

---

## Mock Modes

### Mode 1: Selective (Default) - Recommended

**Behavior**: Only endpoints that have mocks defined are mocked. All others go to real backend.

**Use Case**: Mock specific APIs (e.g., `/api/users`) while others use real backend.

**Example**:
```
Mock Endpoints:
  ✓ GET /api/users/:id
  ✓ POST /api/users
  ✗ GET /api/products (no mock)

SDK Calls:
  GET /api/users/123 → Mock (exists)
  GET /api/products → Real Backend (no mock)
  POST /api/orders → Real Backend (no mock)
```

**Configuration**:
```dart
DevBridge.init(
  apiKey: 'xxx',
  mockEnvironmentId: 'env_dev',
  mockMode: 'selective', // Default
)
```

---

### Mode 2: Global

**Behavior**: Check all endpoints for mocks. If mock exists → use mock, else → real backend.

**Use Case**: Mock environment where most APIs are mocked, but some fallback to real backend.

**Example**:
```
Mock Endpoints:
  ✓ GET /api/users/:id
  ✓ POST /api/users
  ✗ GET /api/products (no mock)

SDK Calls:
  GET /api/users/123 → Mock (exists)
  GET /api/products → Real Backend (no mock found)
  POST /api/orders → Real Backend (no mock found)
```

**Configuration**:
```dart
DevBridge.init(
  apiKey: 'xxx',
  mockEnvironmentId: 'env_dev',
  mockMode: 'global',
)
```

---

### Mode 3: Whitelist

**Behavior**: Only endpoints matching whitelist patterns are mocked. All others go to real backend.

**Use Case**: Explicitly control which APIs are mocked.

**Example**:
```
Whitelist: ['/api/users/*', '/api/auth/*']

SDK Calls:
  GET /api/users/123 → Mock (matches whitelist)
  GET /api/products → Real Backend (not in whitelist)
  POST /api/auth/login → Mock (matches whitelist)
```

**Configuration**:
```dart
DevBridge.init(
  apiKey: 'xxx',
  mockEnvironmentId: 'env_dev',
  mockMode: 'whitelist',
  mockWhitelist: ['/api/users/*', '/api/auth/*'],
)
```

---

### Mode 4: Blacklist

**Behavior**: All endpoints are mocked except those matching blacklist patterns.

**Use Case**: Mock most APIs except specific ones that must use real backend.

**Example**:
```
Blacklist: ['/api/payments/*', '/api/webhooks/*']

SDK Calls:
  GET /api/users/123 → Mock (not blacklisted)
  POST /api/payments/charge → Real Backend (blacklisted)
  POST /api/webhooks/stripe → Real Backend (blacklisted)
```

**Configuration**:
```dart
DevBridge.init(
  apiKey: 'xxx',
  mockEnvironmentId: 'env_dev',
  mockMode: 'blacklist',
  mockBlacklist: ['/api/payments/*', '/api/webhooks/*'],
)
```

---

## SDK Implementation Example

### Flutter/Dart SDK

```dart
class DevBridge {
  String? _mockEnvironmentId;
  String _mockMode = 'selective';
  List<String> _mockWhitelist = [];
  List<String> _mockBlacklist = [];
  bool _mockEnabled = false;

  void init({
    required String apiKey,
    String? mockEnvironmentId,
    String mockMode = 'selective',
    List<String>? mockWhitelist,
    List<String>? mockBlacklist,
  }) {
    _apiKey = apiKey;
    _mockEnvironmentId = mockEnvironmentId;
    _mockMode = mockMode;
    _mockWhitelist = mockWhitelist ?? [];
    _mockBlacklist = mockBlacklist ?? [];
    _mockEnabled = mockEnvironmentId != null;
  }

  Future<Response> _makeRequest(RequestOptions options) async {
    // 1. Check if should mock this endpoint
    if (_mockEnabled && _shouldMock(options.path, options.method)) {
      // 2. Try to get mock response
      final mockResponse = await _getMockResponse(options);
      
      if (mockResponse != null && mockResponse['mockFound'] == true) {
        // 3. Return mock response
        await Future.delayed(Duration(milliseconds: mockResponse['delay'] ?? 0));
        return Response(
          statusCode: mockResponse['statusCode'],
          data: mockResponse['body'],
          headers: Map<String, dynamic>.from(mockResponse['headers'] ?? {}),
        );
      }
      // 4. If no mock found, fall through to real API
    }
    
    // 5. Forward to real backend API
    return await dio.request(
      options.path,
      method: options.method,
      data: options.data,
      queryParameters: options.queryParameters,
      headers: options.headers,
    );
  }

  bool _shouldMock(String path, String method) {
    if (_mockMode == 'selective') {
      // Will check if mock exists in _getMockResponse
      return true;
    } else if (_mockMode == 'global') {
      // Check all endpoints
      return true;
    } else if (_mockMode == 'whitelist') {
      // Only mock if in whitelist
      return _mockWhitelist.any((pattern) => _matchesPattern(path, pattern));
    } else if (_mockMode == 'blacklist') {
      // Mock all except blacklist
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
        headers: {
          'X-API-Key': _apiKey,
        },
      );

      if (response.data['mockFound'] == true) {
        return response.data;
      }
      return null; // No mock found
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
}
```

---

## Mock Proxy Endpoint Behavior

### Request
```http
POST /api/mocks/proxy
Headers:
  X-API-Key: project_api_key
Body:
{
  "environmentId": "env_dev", // Optional, uses default if not provided
  "path": "/api/users/123",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer token"
  },
  "query": {
    "include": "profile"
  },
  "body": null
}
```

### Response - Mock Found
```json
{
  "mockFound": true,
  "matched": true,
  "endpointId": "endpoint_xxx",
  "responseId": "response_xxx",
  "statusCode": 200,
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "id": 123,
    "name": "John Doe"
  },
  "delay": 0
}
```

### Response - No Mock Found
```json
{
  "mockFound": false,
  "message": "No mock endpoint found for /api/users/123"
}
```

**SDK Behavior**: When `mockFound: false`, SDK forwards request to real backend API.

---

## Real-World Example

### Scenario: E-commerce App

**Real Backend APIs**:
- `/api/products` - Product catalog (real backend)
- `/api/orders` - Order processing (real backend)
- `/api/payments` - Payment processing (real backend - must be real!)

**Mocked APIs**:
- `/api/users/:id` - User profile (mock for testing)
- `/api/auth/login` - Authentication (mock for testing)
- `/api/cart` - Shopping cart (mock for testing)

**Configuration**:
```dart
DevBridge.init(
  apiKey: 'xxx',
  mockEnvironmentId: 'env_dev',
  mockMode: 'selective', // Only mocked endpoints use mocks
)
```

**Result**:
- `GET /api/users/123` → Mock response ✅
- `POST /api/auth/login` → Mock response ✅
- `GET /api/cart` → Mock response ✅
- `GET /api/products` → Real backend ✅
- `POST /api/orders` → Real backend ✅
- `POST /api/payments/charge` → Real backend ✅

---

## Benefits

1. **Flexible Testing**: Test specific APIs without affecting others
2. **Gradual Migration**: Start mocking one API at a time
3. **Safe Testing**: Critical APIs (payments) always use real backend
4. **Easy Toggle**: Enable/disable mocking per environment
5. **No Code Changes**: SDK handles routing automatically

---

## Configuration Options

### Environment Level (Dashboard)
- Mode: selective | global | whitelist | blacklist
- Whitelist: Array of endpoint patterns
- Blacklist: Array of endpoint patterns
- Enable/Disable: Toggle entire environment

### SDK Level (Code)
- `mockEnvironmentId`: Which environment to use
- `mockMode`: Override environment mode (optional)
- `mockWhitelist`: Override whitelist (optional)
- `mockBlacklist`: Override blacklist (optional)

---

**Last Updated**: December 23, 2025

