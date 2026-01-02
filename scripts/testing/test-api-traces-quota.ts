const API_BASE = 'http://localhost:3000'

async function testApiTracesQuota() {
  console.log('\n=== Testing API Traces Quota Enforcement ===\n')
  
  // Get project info
  const projectResponse = await fetch(`${API_BASE}/api/projects`, {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWpvaTJrOGEwMDAwOXowOTU1NWo2cmg5IiwiaWF0IjoxNzY2ODUyMDE1LCJleHAiOjE3Njc0NTY4MTV9.0r1-Z1hB0ywxAiePWIxm7kAf8CdqGJazBG-DKBtimAQ'
    }
  })
  
  const projectsData = await projectResponse.json()
  const project = projectsData.projects?.[0]
  
  if (!project) {
    console.error('❌ No projects found')
    return
  }
  
  console.log(`Project: ${project.name}`)
  console.log(`API Key: ${project.apiKey}\n`)
  
  // Check current usage
  const usageResponse = await fetch(`${API_BASE}/api/subscription/usage`, {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWpvaTJrOGEwMDAwOXowOTU1NWo2cmg5IiwiaWF0IjoxNzY2ODUyMDE1LCJleHAiOjE3Njc0NTY4MTV9.0r1-Z1hB0ywxAiePWIxm7kAf8CdqGJazBG-DKBtimAQ'
    }
  })
  
  const usageData = await usageResponse.json()
  const apiRequests = usageData.usage?.apiRequests || { used: 0, limit: null, percentage: 0 }
  const apiEndpoints = usageData.usage?.apiEndpoints || { used: 0, limit: null, percentage: 0 }
  
  console.log('Current API Usage:')
  console.log(`  API Requests: ${apiRequests.used}/${apiRequests.limit || 'unlimited'} (${apiRequests.percentage.toFixed(1)}%)`)
  console.log(`  API Endpoints: ${apiEndpoints.used}/${apiEndpoints.limit || 'unlimited'} (${apiEndpoints.percentage.toFixed(1)}%)\n`)
  
  // Get existing devices
  const devicesResponse = await fetch(`${API_BASE}/api/devices?projectId=${project.id}`, {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWpvaTJrOGEwMDAwOXowOTU1NWo2cmg5IiwiaWF0IjoxNzY2ODUyMDE1LCJleHAiOjE3Njc0NTY4MTV9.0r1-Z1hB0ywxAiePWIxm7kAf8CdqGJazBG-DKBtimAQ'
    }
  })
  
  const devicesData = await devicesResponse.json()
  const existingDevices = devicesData.devices || []
  
  if (existingDevices.length === 0) {
    console.error('❌ No devices found. Please register a device first.')
    return
  }
  
  const deviceId = existingDevices[0].deviceId
  console.log(`Using existing device: ${deviceId}\n`)
  
  // Try to get existing sessions or create one
  console.log('Step 1: Getting or creating a session...')
  let sessionToken = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  // Try to create session, but continue even if it fails (session might not be required)
  const sessionResponse = await fetch(`${API_BASE}/api/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': project.apiKey
    },
    body: JSON.stringify({
      deviceId,
      sessionToken,
      entryScreen: 'HomeScreen',
      appVersion: '1.0.0',
      osVersion: '17.2'
    })
  })
  
  if (sessionResponse.ok) {
    console.log(`✅ Session created: ${sessionToken}\n`)
  } else {
    const errorData = await sessionResponse.json().catch(() => ({ error: 'Unknown error' }))
    if (sessionResponse.status === 429) {
      console.log(`⚠️  Session creation blocked (quota exceeded), but continuing with trace tests...`)
      console.log(`   Error: ${errorData.error || 'Quota exceeded'}\n`)
      // Use a dummy session token - API might still accept traces
    } else {
      console.log(`⚠️  Session creation failed: ${sessionResponse.status}, but continuing...`)
      console.log(`   Error: ${JSON.stringify(errorData, null, 2)}\n`)
    }
  }
  
  // Define unique endpoints to test API Endpoints quota
  const endpoints = [
    'https://api.example.com/users',
    'https://api.example.com/posts',
    'https://api.example.com/comments',
    'https://api.example.com/likes',
    'https://api.example.com/followers',
    'https://api.example.com/messages',
    'https://api.example.com/notifications',
    'https://api.example.com/settings',
    'https://api.example.com/profile',
    'https://api.example.com/search',
    'https://api.example.com/feed',
    'https://api.example.com/trending',
    'https://api.example.com/recommendations',
    'https://api.example.com/analytics',
    'https://api.example.com/reports',
    'https://api.example.com/export',
    'https://api.example.com/import',
    'https://api.example.com/backup',
    'https://api.example.com/restore',
    'https://api.example.com/status',
    'https://api.example.com/health',
    'https://api.example.com/metrics',
    'https://api.example.com/logs',
    'https://api.example.com/events',
    'https://api.example.com/webhooks'
  ]
  
  console.log('Step 2: Testing API Endpoints quota (unique endpoints)...\n')
  
  let successCount = 0
  let blockedCount = 0
  let uniqueEndpointsUsed = new Set<string>()
  
  // Test 1: Send traces to different endpoints (to test API Endpoints quota)
  for (let i = 0; i < Math.min(endpoints.length, 30); i++) {
    const endpoint = endpoints[i]
    const traceResponse = await fetch(`${API_BASE}/api/traces`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': project.apiKey
      },
      body: JSON.stringify({
        deviceId,
        sessionToken,
        url: endpoint,
        method: 'GET',
        statusCode: 200,
        duration: 100 + Math.random() * 200,
        timestamp: new Date().toISOString()
      })
    })
    
    const contentType = traceResponse.headers.get('content-type') || ''
    let responseData: any
    
    if (contentType.includes('application/json')) {
      responseData = await traceResponse.json()
    } else {
      const text = await traceResponse.text()
      responseData = { raw: text }
    }
    
    if (traceResponse.ok) {
      successCount++
      uniqueEndpointsUsed.add(endpoint)
      if (i < 5) {
        console.log(`  ✅ Trace ${i + 1}: ${endpoint} (Status: ${traceResponse.status})`)
      }
    } else if (traceResponse.status === 429) {
      blockedCount++
      console.log(`  🚫 Trace ${i + 1} BLOCKED: ${endpoint} (Status: ${traceResponse.status})`)
      console.log(`     Error: ${responseData.error || 'Quota exceeded'}`)
      console.log(`     Retry-After: ${traceResponse.headers.get('Retry-After') || 'N/A'}`)
      break
    } else {
      console.log(`  ❌ Trace ${i + 1} failed: ${endpoint} (Status: ${traceResponse.status})`)
      if (i < 3) {
        console.log(`     Error: ${JSON.stringify(responseData, null, 2)}`)
      }
    }
  }
  
  console.log(`\n  Summary: ${successCount} successful, ${blockedCount} blocked`)
  console.log(`  Unique endpoints used: ${uniqueEndpointsUsed.size}\n`)
  
  // Test 2: Send multiple requests to same endpoint (to test API Requests quota)
  console.log('Step 3: Testing API Requests quota (multiple requests to same endpoint)...')
  successCount = 0
  blockedCount = 0
  const testEndpoint = 'https://api.example.com/users'
  
  for (let i = 0; i < 50; i++) {
    const traceResponse = await fetch(`${API_BASE}/api/traces`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': project.apiKey
      },
      body: JSON.stringify({
        deviceId,
        sessionToken,
        url: testEndpoint,
        method: 'GET',
        statusCode: 200,
        duration: 100 + Math.random() * 200,
        timestamp: new Date().toISOString()
      })
    })
    
    const contentType = traceResponse.headers.get('content-type') || ''
    let responseData: any
    
    if (contentType.includes('application/json')) {
      responseData = await traceResponse.json()
    } else {
      const text = await traceResponse.text()
      responseData = { raw: text }
    }
    
    if (traceResponse.ok) {
      successCount++
      if (i < 3) {
        console.log(`  ✅ Request ${i + 1}: ${testEndpoint} (Status: ${traceResponse.status})`)
      }
    } else if (traceResponse.status === 429) {
      blockedCount++
      console.log(`  🚫 Request ${i + 1} BLOCKED: ${testEndpoint} (Status: ${traceResponse.status})`)
      console.log(`     Error: ${responseData.error || 'Quota exceeded'}`)
      console.log(`     Retry-After: ${traceResponse.headers.get('Retry-After') || 'N/A'}`)
      break
    } else {
      console.log(`  ❌ Request ${i + 1} failed: ${testEndpoint} (Status: ${traceResponse.status})`)
      if (i < 3) {
        console.log(`     Error: ${JSON.stringify(responseData, null, 2)}`)
      }
    }
  }
  
  console.log(`\n  Summary: ${successCount} successful, ${blockedCount} blocked\n`)
  
  // Check final usage
  console.log('Step 4: Checking final usage...')
  const finalUsageResponse = await fetch(`${API_BASE}/api/subscription/usage`, {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWpvaTJrOGEwMDAwOXowOTU1NWo2cmg5IiwiaWF0IjoxNzY2ODUyMDE1LCJleHAiOjE3Njc0NTY4MTV9.0r1-Z1hB0ywxAiePWIxm7kAf8CdqGJazBG-DKBtimAQ'
    }
  })
  
  const finalUsageData = await finalUsageResponse.json()
  const finalApiRequests = finalUsageData.usage?.apiRequests || { used: 0, limit: null, percentage: 0 }
  const finalApiEndpoints = finalUsageData.usage?.apiEndpoints || { used: 0, limit: null, percentage: 0 }
  
  console.log('Final API Usage:')
  console.log(`  API Requests: ${finalApiRequests.used}/${finalApiRequests.limit || 'unlimited'} (${finalApiRequests.percentage.toFixed(1)}%)`)
  console.log(`  API Endpoints: ${finalApiEndpoints.used}/${finalApiEndpoints.limit || 'unlimited'} (${finalApiEndpoints.percentage.toFixed(1)}%)`)
  
  console.log('\n=== API Traces Quota Test Complete ===\n')
}

testApiTracesQuota().catch(console.error)
