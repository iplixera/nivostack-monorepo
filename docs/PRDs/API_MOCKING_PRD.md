# PRD: API Mocking Module

**Version**: 1.0  
**Date**: December 23, 2025  
**Status**: Planning  
**Priority**: P0

---

## 📋 Executive Summary

Create an API Mocking module that allows consumers to create mock environments for API endpoints. Users can define mock responses for different HTTP methods, status codes, and request conditions. This enables developers to test their applications without relying on real backend services.

**Competitor Reference**: Mockable.io

---

## 🎯 Goals & Objectives

### Primary Goals
1. **Mock Environment Management**: Create and manage multiple mock environments per project
2. **Request Matching**: Match incoming requests based on path, method, headers, query params, and body
3. **Response Configuration**: Define responses for different HTTP status codes
4. **Conditional Responses**: Support multiple responses based on request conditions
5. **Environment Isolation**: Separate mock environments (e.g., dev, staging, test)

### Success Metrics
- ✅ Users can create mock environments
- ✅ Mock responses match requests accurately
- ✅ Support for multiple status codes per endpoint
- ✅ Support for conditional responses based on request data
- ✅ Easy to enable/disable mocks

---

## 👥 User Stories

### US-1: Create Mock Environment
**As a** developer  
**I want to** create a mock environment  
**So that** I can test my app without backend dependencies

**Acceptance Criteria**:
- Create named mock environment (e.g., "Development", "Staging")
- Environment has unique base URL or path prefix
- Can enable/disable environment
- Can set as default environment

### US-2: Define Mock Endpoint
**As a** developer  
**I want to** define a mock API endpoint  
**So that** I can simulate backend responses

**Acceptance Criteria**:
- Define endpoint path (e.g., `/api/users`, `/api/users/:id`)
- Define HTTP method (GET, POST, PUT, DELETE, PATCH)
- Support path parameters and wildcards
- Support query parameters matching

### US-3: Configure Multiple Responses
**As a** developer  
**I want to** define multiple responses for the same endpoint  
**So that** I can test different scenarios (success, error, etc.)

**Acceptance Criteria**:
- Define response for each HTTP status code (200, 400, 404, 500, etc.)
- Each response has body, headers, and status code
- Can enable/disable specific responses
- Can set default response (fallback)

### US-4: Conditional Response Matching
**As a** developer  
**I want to** define conditions for when to return specific responses  
**So that** I can simulate different scenarios based on request data

**Acceptance Criteria**:
- Match based on request body (JSON path matching)
- Match based on query parameters
- Match based on headers
- Match based on path parameters
- Priority/order for multiple matching rules

### US-5: Hybrid Mock/Real API Routing
**As a** developer  
**I want to** mock some APIs while others go to real backend  
**So that** I can test specific endpoints without affecting others

**Acceptance Criteria**:
- SDK can be configured with mock environment
- Requests are checked against mock endpoints first
- If mock exists → return mock response
- If mock doesn't exist → forward to real backend API
- Can configure which APIs to mock (whitelist) or exclude (blacklist)
- Can set global mock mode (all APIs mocked) or selective mode

### US-6: Mock Proxy/Interceptor
**As a** developer  
**I want to** intercept API calls and return mock responses  
**So that** my app uses mocks instead of real APIs

**Acceptance Criteria**:
- SDK can be configured to use mock endpoint
- Requests are intercepted and matched against mock rules
- Returns mock response if match found
- Falls back to real API if no match (hybrid mode)

---

## 🏗️ Architecture Overview

### Core Concepts

```
Project
  └── Mock Environments
       ├── Environment 1 (Dev)
       │    └── Mock Endpoints
       │         ├── GET /api/users
       │         │    └── Mock Responses
       │         │         ├── 200 OK (default)
       │         │         ├── 404 Not Found (if userId not found)
       │         │         └── 500 Error (if condition matches)
       │         └── POST /api/users
       │              └── Mock Responses
       │                   ├── 201 Created
       │                   └── 400 Bad Request
       └── Environment 2 (Staging)
            └── Mock Endpoints...
```

### Data Flow

```
1. SDK makes API call → /api/users/123
2. SDK checks if mocking enabled
3. If enabled, request sent to mock endpoint
4. Mock service matches request:
   - Path: /api/users/:id
   - Method: GET
   - Conditions: Check path param, query, headers, body
5. Return matched mock response
6. SDK receives mock response instead of real API
```

---

## 📊 Database Schema

### New Models

```prisma
// Mock Environment - Container for mock endpoints
model MockEnvironment {
  id              String   @id @default(cuid())
  projectId       String
  project         Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  name            String   // e.g., "Development", "Staging", "Test"
  description     String?
  basePath        String?  // Optional base path prefix (e.g., "/mock/v1")
  isEnabled       Boolean  @default(true)
  isDefault       Boolean  @default(false) // Default environment for project
  createdBy       String?  // User ID
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  endpoints       MockEndpoint[]
  
  @@unique([projectId, name])
  @@index([projectId])
  @@index([projectId, isEnabled])
}

// Mock Endpoint - API endpoint to mock
model MockEndpoint {
  id              String   @id @default(cuid())
  environmentId   String
  environment     MockEnvironment @relation(fields: [environmentId], references: [id], onDelete: Cascade)
  path            String   // e.g., "/api/users", "/api/users/:id"
  method          String   // GET, POST, PUT, DELETE, PATCH
  description     String?
  isEnabled       Boolean  @default(true)
  order           Int      @default(0) // Priority order for matching
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  responses       MockResponse[]
  conditions      MockCondition[]
  
  @@unique([environmentId, path, method])
  @@index([environmentId])
  @@index([environmentId, isEnabled])
}

// Mock Response - Response configuration for an endpoint
model MockResponse {
  id              String   @id @default(cuid())
  endpointId      String
  endpoint        MockEndpoint @relation(fields: [endpointId], references: [id], onDelete: Cascade)
  statusCode      Int      // HTTP status code (200, 400, 404, 500, etc.)
  name            String?  // e.g., "Success", "Not Found", "Validation Error"
  description     String?
  responseBody    Json?    // Response body (JSON object)
  responseHeaders Json?    // Response headers
  delay           Int      @default(0) // Delay in milliseconds (for testing slow APIs)
  isDefault       Boolean  @default(false) // Default response if no conditions match
  isEnabled       Boolean  @default(true)
  order           Int      @default(0) // Priority order for matching
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  conditions      MockCondition[]
  
  @@index([endpointId])
  @@index([endpointId, statusCode])
  @@index([endpointId, isDefault])
}

// Mock Condition - Conditions for when to return a specific response
model MockCondition {
  id              String   @id @default(cuid())
  responseId      String?
  response        MockResponse? @relation(fields: [responseId], references: [id], onDelete: Cascade)
  endpointId      String?
  endpoint        MockEndpoint? @relation(fields: [endpointId], references: [id], onDelete: Cascade)
  type            String   // "path_param", "query_param", "header", "body", "body_json_path"
  key             String   // Parameter name, header name, or JSON path
  operator        String   // "equals", "contains", "matches", "exists", "not_exists", "greater_than", "less_than"
  value           String?  // Value to match against
  isCaseSensitive Boolean  @default(false)
  order           Int      @default(0) // Evaluation order
  createdAt       DateTime @default(now())
  
  @@index([responseId])
  @@index([endpointId])
  @@index([type])
}
```

### Updated Models

```prisma
model Project {
  // ... existing fields
  mockEnvironments MockEnvironment[]
}
```

---

## 🎨 UI/UX Design

### Mock Environment Management Page

**Route**: `/projects/[id]/mocks`

**Layout**:
- Left sidebar: List of mock environments
- Main area: Selected environment's endpoints
- Right panel: Endpoint/Response editor

### Mock Environment List

```
┌─────────────────────────────────────┐
│ Mock Environments        [+ Create] │
├─────────────────────────────────────┤
│ ✓ Development (Default)             │
│   • 5 endpoints                     │
│   • Enabled                         │
├─────────────────────────────────────┤
│   Staging                           │
│   • 3 endpoints                     │
│   • Disabled                        │
└─────────────────────────────────────┘
```

### Mock Endpoint Editor

```
┌─────────────────────────────────────────────┐
│ Endpoint: /api/users/:id                    │
│ Method: [GET ▼]                             │
│ Description: Get user by ID                 │
│                                             │
│ Responses:                                 │
│ ┌─────────────────────────────────────────┐ │
│ │ 200 OK (Default)          [Edit] [Del] │ │
│ │ Body: { "id": 1, "name": "..." }      │ │
│ │ Headers: Content-Type: application/json│ │
│ │ Delay: 0ms                              │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ 404 Not Found            [Edit] [Del] │ │
│ │ Condition: path_param.id = "999"       │ │
│ │ Body: { "error": "User not found" }    │ │
│ └─────────────────────────────────────────┘ │
│ [+ Add Response]                            │
└─────────────────────────────────────────────┘
```

### Response Editor Modal

```
┌─────────────────────────────────────────────┐
│ Edit Response                                │
├─────────────────────────────────────────────┤
│ Status Code: [200 ▼]                        │
│ Name: Success Response                       │
│ Description: Returns user data               │
│                                             │
│ Response Body (JSON):                       │
│ ┌─────────────────────────────────────────┐ │
│ │ {                                        │ │
│ │   "id": 1,                               │ │
│ │   "name": "John Doe",                    │ │
│ │   "email": "john@example.com"           │ │
│ │ }                                        │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Response Headers:                            │
│ Content-Type: application/json              │
│ [+ Add Header]                               │
│                                             │
│ Delay (ms): [0] (simulate slow API)          │
│                                             │
│ Conditions:                                 │
│ ┌─────────────────────────────────────────┐ │
│ │ If query_param.include = "profile"       │ │
│ │   Return: { ...profile data... }          │ │
│ └─────────────────────────────────────────┘ │
│ [+ Add Condition]                            │
│                                             │
│ [✓] Set as default response                 │
│ [✓] Enabled                                  │
│                                             │
│ [Cancel] [Save Response]                    │
└─────────────────────────────────────────────┘
```

---

## 🔧 Implementation Plan

### Phase 1: Database Schema & Service Layer
- Create MockEnvironment, MockEndpoint, MockResponse, MockCondition models
- Create mock service utilities:
  - `createMockEnvironment()`
  - `createMockEndpoint()`
  - `createMockResponse()`
  - `matchMockRequest()` - Core matching logic
  - `getMockResponse()` - Get response for request

### Phase 2: Mock Matching Engine
- Request matching algorithm:
  1. Find active mock environment
  2. Match endpoint by path pattern and method
  3. Evaluate conditions (path params, query, headers, body)
  4. Return best matching response
  5. Fallback to default response if no match

### Phase 3: API Endpoints
- `POST /api/mocks/environments` - Create environment
- `GET /api/mocks/environments` - List environments
- `PATCH /api/mocks/environments/[id]` - Update environment (mode, whitelist, blacklist)
- `POST /api/mocks/endpoints` - Create endpoint
- `GET /api/mocks/endpoints` - List endpoints
- `POST /api/mocks/responses` - Create response
- `PATCH /api/mocks/responses/[id]` - Update response
- `DELETE /api/mocks/responses/[id]` - Delete response
- `POST /api/mocks/proxy` - Mock proxy endpoint (SDK calls this)
- `POST /api/mocks/test` - Test mock matching

### Phase 4: Mock Proxy Endpoint & Routing Logic
- `POST /api/mocks/proxy` - Proxy endpoint that returns mock responses
- Accepts: path, method, headers, query, body, environmentId
- Returns: Mock response if match found
- Routing Logic:
  1. Check if environment is enabled
  2. Check mode (selective/global/whitelist/blacklist)
  3. Check if endpoint should be mocked
  4. If should mock → match against mock endpoints
  5. If match found → return mock response
  6. If no match → return `{ mockFound: false }` (SDK forwards to real API)

### Phase 5: UI Components
- Mock Environment Management page
- Mock Endpoint Editor
- Mock Response Editor with JSON editor
- Condition Builder UI
- Test/Preview functionality

### Phase 6: SDK Integration
- Update SDK to support hybrid routing
- Configuration options:
  - `mockEnvironmentId` - ID of mock environment to use
  - `mockMode` - "selective" | "global" | "whitelist" | "blacklist"
  - `mockWhitelist` - Array of endpoint patterns (if whitelist mode)
  - `mockBlacklist` - Array of endpoint patterns (if blacklist mode)
- SDK routing logic:
  1. Before making API call, check mock configuration
  2. Determine if this endpoint should be mocked
  3. If yes → Call `/api/mocks/proxy` first
  4. If mock found → Use mock response
  5. If mock not found → Forward to real backend API
  6. If shouldn't mock → Skip mock check, go directly to real API

---

## 💡 Key Features

### Request Matching

**Path Matching**:
- Exact: `/api/users`
- Path params: `/api/users/:id` → matches `/api/users/123`
- Wildcards: `/api/users/*` → matches any sub-path

**Condition Matching**:
- Path parameters: `id = "123"`
- Query parameters: `?status=active`
- Headers: `Authorization = "Bearer token"`
- Body JSON path: `$.user.email = "test@example.com"`
- Operators: equals, contains, matches (regex), exists, greater_than, less_than

**Priority**:
- Responses evaluated in order (order field)
- First matching response is returned
- Default response used if no conditions match

### Response Features

- **Status Codes**: Any HTTP status code (200, 201, 400, 401, 404, 500, etc.)
- **Response Body**: JSON, text, or binary
- **Response Headers**: Custom headers
- **Delay**: Simulate slow APIs
- **Enable/Disable**: Toggle responses without deleting

### Environment Features

- **Multiple Environments**: Dev, Staging, Test, etc.
- **Default Environment**: Set one as default
- **Enable/Disable**: Toggle entire environment
- **Base Path**: Optional path prefix for all endpoints

---

## 🔍 Mockable.io Feature Comparison

Based on Mockable.io features:

### Similar Features
- ✅ Multiple mock environments
- ✅ Request matching (path, method, headers, query)
- ✅ Multiple responses per endpoint
- ✅ Conditional responses
- ✅ Response delay
- ✅ Enable/disable mocks

### Additional Features We Should Consider
- **Request Recording**: Record real API calls and create mocks from them
- **Import/Export**: Import mocks from Postman, OpenAPI/Swagger
- **Mock Templates**: Pre-built mock templates for common scenarios
- **Mock Analytics**: Track which mocks are used most
- **Mock Sharing**: Share mock environments with team members
- **Version Control**: Version mocks (similar to builds)

---

## 🚀 Implementation Suggestions

### Suggestion 1: Request Recording (High Value)
Allow users to record real API calls and automatically create mocks:
- Intercept API traces
- "Create Mock from Trace" button
- Auto-generate endpoint, method, response from trace

### Suggestion 2: Import from API Traces
Since we already track API traces, we can:
- Show list of unique endpoints from traces
- "Create Mock" button next to each endpoint
- Pre-fill response from actual API response

### Suggestion 3: Mock Templates
Provide templates for common scenarios:
- REST API CRUD operations
- Authentication endpoints
- Error scenarios (400, 401, 404, 500)

### Suggestion 4: Integration with Build System
- Include mocks in builds (like Business Config)
- Version mocks along with other features
- Preview/Production mock environments

### Suggestion 5: SDK Mock Mode
- Add `mockEnvironmentId` to SDK settings
- SDK automatically routes to mock proxy
- Easy toggle between real and mock APIs

---

## 📝 API Response Format

### Mock Proxy Request
```json
POST /api/mocks/proxy
{
  "environmentId": "env_xxx",
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

### Mock Proxy Response
```json
{
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

---

## ✅ Definition of Done

- [ ] Database schema created
- [ ] Mock matching engine implemented
- [ ] Mock proxy endpoint working
- [ ] UI for managing mocks created
- [ ] Request recording feature (optional)
- [ ] SDK integration (optional)
- [ ] Documentation updated
- [ ] Testing completed

---

## 📊 Estimated Implementation

**Phases**: 6 phases  
**Estimated Time**: 10-12 hours  
**Complexity**: Medium-High

---

**Last Updated**: December 23, 2025

