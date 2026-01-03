# API Mocking - Step-by-Step User Guide

**Last Updated**: January 3, 2025

## 📖 Overview

API Mocking allows you to create mock responses for your API endpoints. This is useful for:
- Testing your app without a backend
- Simulating different response scenarios (success, errors, etc.)
- Developing frontend features independently
- Testing edge cases and error handling

---

## 🎯 Quick Start: 3-Step Process

1. **Create a Mock Environment** (e.g., "Development", "Staging")
2. **Add Mock Endpoints** (e.g., `GET /api/users/:id`)
3. **Define Mock Responses** (e.g., 200 OK with user data, 404 Not Found)

---

## 📍 Step 1: Navigate to API Mocking

1. Open your project in the dashboard
2. Click on the **"API Mocks"** tab in the sidebar (or navigate to `/projects/[id]/mocks`)
3. You'll see the API Mocking page with two sub-tabs:
   - **API Mocks** - Create and manage mocks
   - **Builds** - Version control for mocks

---

## 🏗️ Step 2: Create a Mock Environment

A **Mock Environment** is like a container that holds all your mock endpoints. You can have multiple environments (e.g., Development, Staging, Testing).

### Steps:

1. **Click the "+ Create Environment" button** (top right)

2. **Fill in the form:**
   - **Name**: Enter a name (e.g., "Development", "Staging", "Testing")
   - **Description**: Optional description (e.g., "Mock environment for local development")
   - **Mode**: Choose how mocking works:
     - **Selective** (recommended): Only mocked endpoints return mock responses
     - **Global**: Check all endpoints, fallback to real API if no mock found
     - **Whitelist**: Only whitelisted endpoint patterns are mocked
     - **Blacklist**: All endpoints except blacklisted ones are mocked

3. **Click "Create"**

### What You'll See:

After creating, you'll see your environment in the **Environments Table**:
- **Name**: Your environment name
- **Mode**: The mode you selected
- **Endpoints**: Number of endpoints in this environment (starts at 0)
- **Status**: Enabled/Disabled toggle
- **Actions**: "Set Default" button (if not already default)

### Tips:

- **Enable/Disable**: Click on an environment row to select it. You can toggle it on/off.
- **Set Default**: Click "Set Default" to make this the default environment for your project.
- **Select Environment**: Click on any environment row to view its endpoints.

---

## 🔌 Step 3: Create a Mock Endpoint

A **Mock Endpoint** defines which API endpoint you want to mock (e.g., `GET /api/users/:id`).

### Steps:

1. **Select an environment** (click on it in the Environments table)

2. **Click "+ Add Endpoint"** button (in the Endpoints section)

3. **Fill in the form:**
   - **Method**: Select HTTP method (GET, POST, PUT, DELETE, PATCH)
   - **Path**: Enter the endpoint path
     - Use `:param` for path parameters (e.g., `/api/users/:id`)
     - Use `*` for wildcards (e.g., `/api/users/*`)
     - Examples:
       - `/api/users` - Exact match
       - `/api/users/:id` - Matches `/api/users/123`, `/api/users/456`, etc.
       - `/api/users/*` - Matches any sub-path
   - **Description**: Optional description

4. **Click "Create"**

### What You'll See:

After creating, you'll see your endpoint in the **Endpoints Table**:
- **Method**: HTTP method (GET, POST, etc.)
- **Path**: The endpoint path
- **Description**: Your description
- **Responses**: Number of responses (starts at 0)
- **Status**: Enabled/Disabled indicator
- **Actions**: Delete button

### Tips:

- **Path Parameters**: Use `:id`, `:userId`, etc. to match dynamic values
- **Wildcards**: Use `*` to match any sub-path
- **Select Endpoint**: Click on an endpoint row to view/edit its responses

---

## 📤 Step 4: Create Mock Responses

A **Mock Response** defines what data to return when the endpoint is called. You can create multiple responses for the same endpoint (e.g., success, error, not found).

### Steps:

1. **Select an endpoint** (click on it in the Endpoints table)

2. **Click "+ Add Response"** button (in the Responses section)

3. **Fill in the form:**

   **Basic Settings:**
   - **Status Code**: HTTP status code (200, 201, 400, 404, 500, etc.)
   - **Delay**: Response delay in milliseconds (0 = instant, 1000 = 1 second)
   - **Name**: Optional name (e.g., "Success", "Not Found", "Error")

   **Response Body:**
   - **Response Body (JSON)**: Enter the JSON response body
     ```json
     {
       "id": "123",
       "name": "John Doe",
       "email": "john@example.com"
     }
     ```
   - **Note**: Must be valid JSON

   **Response Headers:**
   - **Add Headers**: Click "+ Add Header" to add custom headers
   - Common headers:
     - `Content-Type: application/json`
     - `Authorization: Bearer token`
     - `X-Custom-Header: value`

   **Flags:**
   - **Set as default response**: Check this to make this the default response (used when no conditions match)

4. **Click "Create"** (or "Update" if editing)

### What You'll See:

After creating, you'll see your response in the **Responses Table**:
- **Status**: Status code badge (green for 2xx, yellow for 4xx, red for 5xx)
- **Name**: Your response name
- **Delay**: Delay in milliseconds
- **Flags**: "Default" badge if it's the default response
- **Preview**: Truncated JSON preview
- **Actions**: Edit and Delete buttons

### Tips:

- **Multiple Responses**: Create multiple responses for different scenarios:
  - `200 OK` - Success response
  - `404 Not Found` - Resource not found
  - `500 Internal Server Error` - Server error
- **Default Response**: Set one response as default (used when no conditions match)
- **Delay**: Use delay to simulate slow APIs (e.g., 2000ms = 2 seconds)
- **Edit Response**: Click "Edit" to modify a response
- **Delete Response**: Click "Delete" to remove a response

---

## 🎨 Example: Complete Workflow

Let's create a complete example: Mock a user API endpoint.

### Example 1: GET User by ID

**Step 1: Create Environment**
- Name: "Development"
- Mode: Selective
- Click "Create"

**Step 2: Create Endpoint**
- Method: GET
- Path: `/api/users/:id`
- Description: "Get user by ID"
- Click "Create"

**Step 3: Create Success Response (200 OK)**
- Status Code: `200`
- Name: "Success"
- Response Body:
  ```json
  {
    "id": "123",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00Z"
  }
  ```
- Delay: `0`
- Set as default: ✅
- Click "Create"

**Step 4: Create Error Response (404 Not Found)**
- Status Code: `404`
- Name: "User Not Found"
- Response Body:
  ```json
  {
    "error": "User not found",
    "code": "USER_NOT_FOUND"
  }
  ```
- Delay: `0`
- Set as default: ❌
- Click "Create"

### Example 2: POST Create User

**Step 1: Create Endpoint**
- Method: POST
- Path: `/api/users`
- Description: "Create a new user"
- Click "Create"

**Step 2: Create Success Response (201 Created)**
- Status Code: `201`
- Name: "User Created"
- Response Body:
  ```json
  {
    "id": "456",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "createdAt": "2024-01-02T00:00:00Z"
  }
  ```
- Response Headers:
  - `Content-Type: application/json`
  - `Location: /api/users/456`
- Delay: `500` (simulate processing time)
- Set as default: ✅
- Click "Create"

**Step 3: Create Error Response (400 Bad Request)**
- Status Code: `400`
- Name: "Validation Error"
- Response Body:
  ```json
  {
    "error": "Validation failed",
    "errors": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
  ```
- Delay: `0`
- Set as default: ❌
- Click "Create"

---

## 🔧 Advanced Features

### Environment Modes Explained

1. **Selective** (Recommended)
   - Only endpoints you've created mocks for will return mock responses
   - Other endpoints go directly to the real API
   - Best for: Testing specific endpoints

2. **Global**
   - Checks all endpoints for mocks first
   - If mock found → return mock
   - If no mock → forward to real API
   - Best for: Comprehensive testing

3. **Whitelist**
   - Only endpoints matching whitelist patterns are mocked
   - Other endpoints go directly to real API
   - Best for: Mocking specific endpoint patterns

4. **Blacklist**
   - All endpoints are mocked except blacklisted ones
   - Blacklisted endpoints go directly to real API
   - Best for: Mocking everything except specific endpoints

### Path Matching Examples

| Path Pattern | Matches | Doesn't Match |
|-------------|---------|---------------|
| `/api/users` | `/api/users` | `/api/users/123` |
| `/api/users/:id` | `/api/users/123`, `/api/users/456` | `/api/users` |
| `/api/users/*` | `/api/users/123`, `/api/users/123/posts` | `/api/posts` |
| `/api/*/users` | `/api/v1/users`, `/api/v2/users` | `/api/users` |

### Response Priority

1. **Conditional Responses**: Responses with matching conditions are evaluated first
2. **Default Response**: If no conditions match, the default response is used
3. **No Response**: If no default and no conditions match, returns error

---

## 🚀 Using Mocks in Your App

### SDK Integration (Coming Soon)

Once SDK integration is complete, you'll configure mocks like this:

```dart
// Flutter SDK
DevBridge.init(
  apiKey: 'your-api-key',
  baseUrl: 'https://your-api.com',
  mockEnvironmentId: 'env_xxx', // ID of your mock environment
  mockMode: 'selective', // How mocking works
)
```

### Current Usage

Currently, mocks are managed through the dashboard. SDK integration is pending.

---

## 📋 Common Use Cases

### 1. Testing Success Scenarios
- Create 200 OK responses with sample data
- Test your UI with different data structures

### 2. Testing Error Handling
- Create 400, 404, 500 responses
- Test how your app handles errors

### 3. Testing Loading States
- Add delay (e.g., 2000ms) to simulate slow APIs
- Test loading spinners and skeletons

### 4. Testing Edge Cases
- Create responses with missing fields
- Test null/empty value handling

### 5. Development Without Backend
- Mock all your API endpoints
- Develop frontend features independently

---

## ❓ FAQ

### Q: Can I have multiple responses for the same endpoint?
**A:** Yes! You can create multiple responses with different status codes or conditions.

### Q: How do I test my mocks?
**A:** Currently, mocks are managed in the dashboard. SDK integration will allow testing from your app.

### Q: Can I use path parameters?
**A:** Yes! Use `:param` syntax (e.g., `/api/users/:id`).

### Q: What happens if I don't set a default response?
**A:** If no conditions match and no default is set, the endpoint will return an error.

### Q: Can I edit responses after creating them?
**A:** Yes! Click "Edit" on any response to modify it.

### Q: Can I delete endpoints?
**A:** Yes! Click "Delete" on an endpoint. **Warning**: This will delete all responses for that endpoint.

### Q: How do I enable/disable an environment?
**A:** Click on the environment row to select it, then toggle the enabled status.

---

## 🎯 Quick Reference

### Keyboard Shortcuts
- None currently (coming soon)

### UI Elements
- **Environments Table**: List of all mock environments
- **Endpoints Table**: List of endpoints in selected environment
- **Responses Table**: List of responses for selected endpoint
- **Modals**: Create/Edit forms for environments, endpoints, and responses

### Status Indicators
- **Green Badge**: 2xx status codes (success)
- **Yellow Badge**: 4xx status codes (client errors)
- **Red Badge**: 5xx status codes (server errors)
- **"Default" Badge**: Default response
- **"Disabled" Badge**: Disabled endpoint/response

---

## 🐛 Troubleshooting

### Problem: Mock not working
**Solution**: 
1. Check if environment is enabled
2. Check if endpoint is enabled
3. Check if response is enabled
4. Verify path matches exactly

### Problem: JSON validation error
**Solution**: 
1. Ensure response body is valid JSON
2. Use a JSON validator tool
3. Check for trailing commas

### Problem: Can't create endpoint
**Solution**: 
1. Make sure an environment is selected
2. Check that path is not empty
3. Verify method is selected

### Problem: Response not showing
**Solution**: 
1. Refresh the page
2. Check if endpoint is selected
3. Verify response was created successfully

---

## 📚 Related Documentation

- [API Mocking PRD](../PRDs/API_MOCKING_PRD.md) - Complete feature specification
- [Hybrid Routing Guide](../features/API_MOCKING_HYBRID_ROUTING.md) - How mocking works with real APIs
- [SDK Integration (Pending)](../features/API_MOCKING_SDK_PENDING.md) - SDK integration guide

---

**Need Help?** Check the troubleshooting section or refer to the PRD for detailed technical information.

