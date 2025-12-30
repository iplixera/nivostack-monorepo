# API Mocking - Path Construction in Multi-Tenant SaaS

## Overview

In a SaaS platform where each tenant can have multiple projects, the mock proxy needs to correctly match API paths regardless of the actual backend base URL. This document explains how path construction and matching works.

---

## Problem Statement

**Scenario**: 
- App makes API call: `GET https://api.example.com/api/users/123`
- SDK needs to call mock proxy: `POST https://devbridge-eta.vercel.app/api/mocks/proxy`
- Mock proxy needs to match: `/api/users/:id` pattern

**Question**: How does the SDK extract the path and how does the mock proxy match it?

---

## Solution: Path Extraction & Matching

### 1. SDK Path Extraction

The SDK should extract **only the path portion** from the full URL, ignoring the base URL.

**Example**:
```dart
// App makes API call
final response = await dio.get('https://api.example.com/api/users/123');

// SDK intercepts and extracts path
String extractPath(String fullUrl) {
  try {
    final uri = Uri.parse(fullUrl);
    return uri.path; // Returns: "/api/users/123"
  } catch (e) {
    // Fallback: extract path manually
    final pathMatch = RegExp(r'https?://[^/]+(.+)').firstMatch(fullUrl);
    return pathMatch?.group(1) ?? fullUrl;
  }
}
```

**Key Points**:
- Extract only the path (e.g., `/api/users/123`)
- Ignore base URL (e.g., `https://api.example.com`)
- Ignore query parameters for matching (but send them separately)
- Preserve path parameters (e.g., `:id`)

### 2. Mock Proxy Request

The SDK sends the extracted path to the mock proxy:

```dart
// SDK calls mock proxy
final mockResponse = await dio.post(
  'https://devbridge-eta.vercel.app/api/mocks/proxy',
  data: {
    'environmentId': mockEnvironmentId,
    'path': '/api/users/123',        // Extracted path only
    'method': 'GET',
    'query': {                        // Query params separate
      'include': 'profile'
    },
    'headers': {
      'Authorization': 'Bearer token'
    },
    'body': null
  },
  options: Options(
    headers: {
      'X-API-Key': apiKey,            // Identifies project/tenant
    },
  ),
);
```

### 3. Mock Proxy Matching

The mock proxy matches the path against mock endpoint patterns:

```typescript
// Mock proxy receives:
{
  path: "/api/users/123",
  method: "GET",
  query: { include: "profile" },
  headers: { Authorization: "Bearer token" },
  body: null
}

// Mock endpoint pattern:
{
  path: "/api/users/:id",  // Pattern with path parameter
  method: "GET"
}

// Matching logic:
matchEndpointPath("/api/users/:id", "/api/users/123")
// Returns: { matched: true, pathParams: { id: "123" } }
```

---

## Multi-Tenant Architecture

### Project Identification

Each project is identified by its **API Key**:

```
┌─────────────────────────────────────────┐
│ DevBridge Platform (SaaS)              │
├─────────────────────────────────────────┤
│                                         │
│  Tenant 1 (Company A)                  │
│    ├── Project 1 (API Key: key_abc)    │
│    │     └── Mock Environment: Dev     │
│    │           └── Endpoint: /api/users│
│    └── Project 2 (API Key: key_xyz)     │
│          └── Mock Environment: Staging │
│                                         │
│  Tenant 2 (Company B)                   │
│    └── Project 1 (API Key: key_def)     │
│          └── Mock Environment: Test    │
│                                         │
└─────────────────────────────────────────┘
```

### Request Flow

```
1. App (Tenant A, Project 1)
   └──> GET https://api.example.com/api/users/123
        └──> SDK intercepts
             └──> Extracts path: "/api/users/123"
                  └──> Calls mock proxy with:
                       • X-API-Key: key_abc (identifies project)
                       • path: "/api/users/123"
                       • method: "GET"

2. Mock Proxy (DevBridge)
   └──> Validates API key → Finds Project 1
        └──> Gets default mock environment for Project 1
             └──> Matches path "/api/users/123" against patterns
                  └──> Finds match: "/api/users/:id"
                       └──> Returns mock response

3. SDK
   └──> Receives mock response
        └──> Returns to app (or forwards to real API if no mock)
```

---

## Path Matching Examples

### Example 1: Exact Match

**Mock Endpoint**: `/api/users`  
**Request Path**: `/api/users`  
**Result**: ✅ Matched

### Example 2: Path Parameter

**Mock Endpoint**: `/api/users/:id`  
**Request Path**: `/api/users/123`  
**Result**: ✅ Matched, `pathParams: { id: "123" }`

### Example 3: Wildcard

**Mock Endpoint**: `/api/users/*`  
**Request Path**: `/api/users/123/profile`  
**Result**: ✅ Matched

### Example 4: Query Parameters

**Mock Endpoint**: `/api/users`  
**Request Path**: `/api/users?status=active`  
**Result**: ✅ Matched (query params sent separately, not used for path matching)

### Example 5: Different Base URLs

**App calls**: `GET https://api.example.com/api/users/123`  
**App calls**: `GET https://staging-api.example.com/api/users/123`  
**Mock Endpoint**: `/api/users/:id`  
**Result**: ✅ Both matched (base URL ignored, only path matters)

---

## SDK Implementation Details

### Path Extraction Function

```dart
/// Extract path from full URL
String extractPath(String url) {
  try {
    final uri = Uri.parse(url);
    return uri.path; // Returns path without query params
  } catch (e) {
    // Fallback for malformed URLs
    final regex = RegExp(r'https?://[^/]+(.+?)(?:\?|$)');
    final match = regex.firstMatch(url);
    return match?.group(1) ?? url;
  }
}

/// Extract query parameters separately
Map<String, String> extractQuery(String url) {
  try {
    final uri = Uri.parse(url);
    return uri.queryParameters;
  } catch (e) {
    return {};
  }
}
```

### Dio Interceptor Implementation

```dart
class MockInterceptor extends Interceptor {
  String? _mockEnvironmentId;
  String _baseUrl = 'https://devbridge-eta.vercel.app';
  String _apiKey;

  MockInterceptor(this._apiKey, {String? mockEnvironmentId}) {
    _mockEnvironmentId = mockEnvironmentId;
  }

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // Check if mocking is enabled
    if (_mockEnvironmentId == null) {
      handler.next(options);
      return;
    }

    // Extract path and query from request
    final path = extractPath(options.uri.toString());
    final query = extractQuery(options.uri.toString());

    // Check if should mock
    if (!_shouldMock(path, options.method)) {
      handler.next(options);
      return;
    }

    // Try to get mock response
    try {
      final mockResponse = await _getMockResponse(
        path: path,
        method: options.method,
        query: query,
        headers: options.headers,
        body: options.data,
      );

      if (mockResponse != null && mockResponse['mockFound'] == true) {
        // Apply delay if specified
        if (mockResponse['delay'] > 0) {
          await Future.delayed(Duration(milliseconds: mockResponse['delay']));
        }

        // Return mock response
        handler.resolve(
          Response(
            requestOptions: options,
            statusCode: mockResponse['statusCode'],
            data: mockResponse['body'],
            headers: Headers.fromMap(mockResponse['headers'] ?? {}),
          ),
        );
        return;
      }
    } catch (e) {
      // If mock proxy fails, fall back to real API
      print('Mock proxy error: $e');
    }

    // No mock found or error, forward to real API
    handler.next(options);
  }

  Future<Map<String, dynamic>?> _getMockResponse({
    required String path,
    required String method,
    required Map<String, String> query,
    required Map<String, dynamic> headers,
    required dynamic body,
  }) async {
    try {
      final response = await Dio().post(
        '$_baseUrl/api/mocks/proxy',
        data: {
          'environmentId': _mockEnvironmentId,
          'path': path,              // Only path, no base URL
          'method': method,
          'query': query,             // Query params separate
          'headers': headers,
          'body': body,
        },
        options: Options(
          headers: {
            'X-API-Key': _apiKey,     // Identifies project
            'Content-Type': 'application/json',
          },
        ),
      );

      if (response.data['mockFound'] == true) {
        return response.data;
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}
```

---

## Important Considerations

### 1. Base URL Independence

**Key Point**: The mock proxy **does not care** about the app's backend base URL.

- App calls: `https://api.example.com/api/users/123`
- App calls: `https://staging-api.example.com/api/users/123`
- App calls: `http://localhost:3000/api/users/123`

**All three match the same mock endpoint**: `/api/users/:id`

### 2. Path Normalization

The SDK should normalize paths:
- Remove trailing slashes: `/api/users/` → `/api/users`
- Handle double slashes: `/api//users` → `/api/users`
- Preserve path parameters: `/api/users/:id` stays as-is

### 3. Query Parameters

Query parameters are sent separately and used for:
- Condition matching (e.g., `query_param.status = "active"`)
- Not used for path pattern matching

### 4. Project Isolation

Each project's mocks are isolated:
- Project A's mock: `/api/users/:id` → Returns user data
- Project B's mock: `/api/users/:id` → Returns different user data
- Both use the same pattern, but different responses

---

## Current Implementation Status

### ✅ Server-Side (Complete)

The mock proxy endpoint (`/api/mocks/proxy`) already:
- ✅ Identifies project via `X-API-Key` header
- ✅ Matches paths against mock endpoint patterns
- ✅ Extracts path parameters
- ✅ Evaluates conditions (query, headers, body)
- ✅ Returns mock response or `{ mockFound: false }`

### 📋 SDK-Side (Pending)

The SDK needs to:
- ✅ Extract path from full URL
- ✅ Extract query parameters separately
- ✅ Call mock proxy with correct format
- ✅ Handle mock response or fallback to real API

**See**: `docs/features/API_MOCKING_SDK_PENDING.md`

---

## Testing Scenarios

### Test Case 1: Different Base URLs

```dart
// Test that same path matches regardless of base URL
final urls = [
  'https://api.example.com/api/users/123',
  'https://staging-api.example.com/api/users/123',
  'http://localhost:3000/api/users/123',
];

for (final url in urls) {
  final path = extractPath(url);
  assert(path == '/api/users/123');
  // All should match mock endpoint: /api/users/:id
}
```

### Test Case 2: Path Parameters

```dart
// Test path parameter extraction
final mockPattern = '/api/users/:id';
final requestPath = '/api/users/123';

final match = matchEndpointPath(mockPattern, requestPath);
assert(match.matched == true);
assert(match.pathParams['id'] == '123');
```

### Test Case 3: Query Parameters

```dart
// Test query parameter handling
final url = 'https://api.example.com/api/users?status=active&limit=10';
final path = extractPath(url);        // '/api/users'
final query = extractQuery(url);      // { status: 'active', limit: '10' }

// Path matches: /api/users
// Query used for condition matching: query_param.status = "active"
```

---

## Summary

1. **Path Extraction**: SDK extracts only the path portion (e.g., `/api/users/123`)
2. **Base URL Ignored**: Mock proxy doesn't care about backend base URL
3. **Project Identification**: API key identifies project/tenant
4. **Path Matching**: Mock proxy matches extracted path against patterns
5. **Multi-Tenant Safe**: Each project's mocks are isolated

**The key insight**: The mock proxy operates on **paths only**, not full URLs, making it work seamlessly across different backend base URLs in a multi-tenant SaaS environment.

---

**Last Updated**: December 23, 2025

