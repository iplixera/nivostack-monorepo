# API Mocking - Testing Guide

**Last Updated**: January 3, 2025

## 🧪 How to Test Your Mock API

Since SDK integration is pending, you can test your mock API directly using the proxy endpoint.

---

## Method 1: Using cURL (Command Line)

### Step 1: Get Your Project API Key

1. Go to your project settings
2. Copy your **API Key**

### Step 2: Get Your Environment ID

1. Go to the API Mocks page
2. Click on your environment
3. Copy the **Environment ID** from the URL or check the browser's Network tab

### Step 3: Test Your Mock

```bash
curl -X POST https://your-dashboard-url.com/api/mocks/proxy \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "environmentId": "YOUR_ENVIRONMENT_ID",
    "path": "/api/users/123",
    "method": "GET",
    "query": {},
    "headers": {},
    "body": null
  }'
```

### Example: Test GET User Endpoint

```bash
curl -X POST http://localhost:3000/api/mocks/proxy \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key-here" \
  -d '{
    "environmentId": "env_xxx",
    "path": "/api/users/123",
    "method": "GET"
  }'
```

**Expected Response:**
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
    "id": "123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "delay": 0
}
```

---

## Method 2: Using Postman or Insomnia

### Step 1: Create a New Request

1. Open Postman/Insomnia
2. Create a new **POST** request
3. URL: `https://your-dashboard-url.com/api/mocks/proxy`

### Step 2: Set Headers

- **Content-Type**: `application/json`
- **x-api-key**: `YOUR_API_KEY`

### Step 3: Set Request Body (JSON)

```json
{
  "environmentId": "YOUR_ENVIRONMENT_ID",
  "path": "/api/users/123",
  "method": "GET",
  "query": {},
  "headers": {},
  "body": null
}
```

### Step 4: Send Request

Click "Send" and check the response!

---

## Method 3: Using Browser Console (JavaScript)

### Step 1: Open Browser Console

1. Go to your project's API Mocks page
2. Open browser DevTools (F12)
3. Go to Console tab

### Step 2: Run Test Script

```javascript
// Replace these values
const API_KEY = 'your-api-key';
const ENVIRONMENT_ID = 'your-environment-id';
const BASE_URL = 'http://localhost:3000'; // or your production URL

// Test function
async function testMock(path, method = 'GET', body = null) {
  try {
    const response = await fetch(`${BASE_URL}/api/mocks/proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify({
        environmentId: ENVIRONMENT_ID,
        path: path,
        method: method,
        query: {},
        headers: {},
        body: body
      })
    });
    
    const data = await response.json();
    console.log('Mock Response:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Test your mock
testMock('/api/users/123', 'GET');
```

### Example: Test Multiple Scenarios

```javascript
// Test GET request
testMock('/api/users/123', 'GET');

// Test POST request
testMock('/api/users', 'POST', {
  name: 'Jane Doe',
  email: 'jane@example.com'
});

// Test with query parameters (if your mock supports it)
testMock('/api/users?status=active', 'GET');
```

---

## Method 4: Using Node.js Script

Create a test file `test-mock.js`:

```javascript
const fetch = require('node-fetch'); // or use built-in fetch in Node 18+

const API_KEY = 'your-api-key';
const ENVIRONMENT_ID = 'your-environment-id';
const BASE_URL = 'http://localhost:3000';

async function testMock(path, method = 'GET', body = null) {
  try {
    const response = await fetch(`${BASE_URL}/api/mocks/proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify({
        environmentId: ENVIRONMENT_ID,
        path: path,
        method: method,
        query: {},
        headers: {},
        body: body
      })
    });
    
    const data = await response.json();
    console.log('✅ Mock Response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run tests
async function runTests() {
  console.log('Testing GET /api/users/123...');
  await testMock('/api/users/123', 'GET');
  
  console.log('\nTesting POST /api/users...');
  await testMock('/api/users', 'POST', {
    name: 'Jane Doe',
    email: 'jane@example.com'
  });
}

runTests();
```

Run it:
```bash
node test-mock.js
```

---

## 📋 Testing Checklist

### ✅ Basic Tests

- [ ] Mock returns correct status code
- [ ] Mock returns correct response body
- [ ] Mock returns correct headers
- [ ] Delay works (if set)
- [ ] Default response is used when no conditions match

### ✅ Path Matching Tests

- [ ] Exact path matches (`/api/users`)
- [ ] Path parameters work (`/api/users/:id` → `/api/users/123`)
- [ ] Wildcards work (`/api/users/*` → `/api/users/123/posts`)

### ✅ Method Tests

- [ ] GET requests work
- [ ] POST requests work
- [ ] PUT requests work
- [ ] DELETE requests work
- [ ] PATCH requests work

### ✅ Multiple Responses Tests

- [ ] Different status codes return different responses
- [ ] Default response is used when no conditions match
- [ ] Conditional responses work (if you have conditions set up)

---

## 🔍 Troubleshooting

### Problem: `mockFound: false`

**Possible Causes:**
1. Environment ID is incorrect
2. Environment is disabled
3. Endpoint path doesn't match
4. HTTP method doesn't match
5. Endpoint is disabled

**Solutions:**
- Verify environment ID is correct
- Check if environment is enabled
- Verify path matches exactly (including `/` at start)
- Verify HTTP method matches
- Check if endpoint is enabled

### Problem: Wrong Response Body

**Possible Causes:**
1. Wrong response selected
2. Default response not set
3. Conditions not matching

**Solutions:**
- Check which response is marked as default
- Verify response body JSON is correct
- Check if conditions are set up correctly

### Problem: Delay Not Working

**Possible Causes:**
1. Delay value is 0
2. Delay not set in response

**Solutions:**
- Set delay value > 0 in response settings
- Verify delay value is saved

### Problem: Headers Not Returned

**Possible Causes:**
1. Headers not set in response
2. Headers not saved

**Solutions:**
- Add headers in response editor
- Verify headers are saved correctly

---

## 📝 Example Test Scenarios

### Scenario 1: Test Success Response

```bash
# Test GET /api/users/123 - Should return 200 OK
curl -X POST http://localhost:3000/api/mocks/proxy \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-key" \
  -d '{
    "environmentId": "env_xxx",
    "path": "/api/users/123",
    "method": "GET"
  }'
```

### Scenario 2: Test Error Response

```bash
# Test GET /api/users/999 - Should return 404 Not Found
curl -X POST http://localhost:3000/api/mocks/proxy \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-key" \
  -d '{
    "environmentId": "env_xxx",
    "path": "/api/users/999",
    "method": "GET"
  }'
```

### Scenario 3: Test POST Request

```bash
# Test POST /api/users - Should return 201 Created
curl -X POST http://localhost:3000/api/mocks/proxy \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-key" \
  -d '{
    "environmentId": "env_xxx",
    "path": "/api/users",
    "method": "POST",
    "body": {
      "name": "Jane Doe",
      "email": "jane@example.com"
    }
  }'
```

---

## 🎯 Quick Test Commands

### Get Environment ID (from browser console)

```javascript
// On the API Mocks page, run this in console:
const envId = document.querySelector('[data-environment-id]')?.dataset.environmentId;
console.log('Environment ID:', envId);
```

### Quick Test Function

```javascript
// Paste this in browser console on API Mocks page
window.testMock = async function(path, method = 'GET') {
  const token = localStorage.getItem('token'); // or get from your auth
  const projectId = window.location.pathname.match(/\/projects\/([^\/]+)/)?.[1];
  
  // Get environment ID (you'll need to get this manually)
  const envId = prompt('Enter Environment ID:');
  
  const response = await fetch('/api/mocks/proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'YOUR_API_KEY' // Replace with your API key
    },
    body: JSON.stringify({
      environmentId: envId,
      path: path,
      method: method
    })
  });
  
  const data = await response.json();
  console.log('Mock Response:', data);
  return data;
};

// Then use it:
testMock('/api/users/123', 'GET');
```

---

## 🚀 Next Steps

Once SDK integration is complete, you'll be able to:
- Configure mocks directly in your app
- Test mocks automatically during development
- Switch between mock and real APIs easily

For now, use the methods above to test your mocks!

---

**Need Help?** Check the troubleshooting section or refer to the main [API Mocking User Guide](./API_MOCKING_USER_GUIDE.md).

