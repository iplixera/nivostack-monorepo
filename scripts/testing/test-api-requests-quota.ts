const API_BASE = 'http://localhost:3000'

async function testApiRequestsQuota() {
  console.log('\n=== Testing API Requests Quota Enforcement ===\n')
  
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
  
  console.log('Current API Requests Usage:')
  console.log(`  Used: ${apiRequests.used}/${apiRequests.limit || 'unlimited'} (${apiRequests.percentage.toFixed(1)}%)\n`)
  
  // Get existing device
  const devicesResponse = await fetch(`${API_BASE}/api/devices?projectId=${project.id}`, {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWpvaTJrOGEwMDAwOXowOTU1NWo2cmg5IiwiaWF0IjoxNzY2ODUyMDE1LCJleHAiOjE3Njc0NTY4MTV9.0r1-Z1hB0ywxAiePWIxm7kAf8CdqGJazBG-DKBtimAQ'
    }
  })
  
  const devicesData = await devicesResponse.json()
  const existingDevices = devicesData.devices || []
  
  if (existingDevices.length === 0) {
    console.error('❌ No devices found')
    return
  }
  
  const deviceId = existingDevices[0].deviceId
  const sessionToken = `session-${Date.now()}`
  const testEndpoint = 'https://api.example.com/users' // Use existing endpoint
  
  console.log(`Using device: ${deviceId}`)
  console.log(`Session token: ${sessionToken}`)
  console.log(`Test endpoint: ${testEndpoint}\n`)
  
  // Calculate how many requests we need to send
  const remainingRequests = apiRequests.limit ? Math.max(0, apiRequests.limit - apiRequests.used) : 1000
  const requestsToSend = Math.min(remainingRequests + 10, 100) // Send enough to exceed limit
  
  console.log(`Sending ${requestsToSend} requests to test quota enforcement...\n`)
  
  let successCount = 0
  let blockedCount = 0
  
  for (let i = 0; i < requestsToSend; i++) {
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
        duration: 100,
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
      if (i < 3 || i === requestsToSend - 1) {
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
  
  console.log(`\nSummary: ${successCount} successful, ${blockedCount} blocked\n`)
  
  // Check final usage
  const finalUsageResponse = await fetch(`${API_BASE}/api/subscription/usage`, {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWpvaTJrOGEwMDAwOXowOTU1NWo2cmg5IiwiaWF0IjoxNzY2ODUyMDE1LCJleHAiOjE3Njc0NTY4MTV9.0r1-Z1hB0ywxAiePWIxm7kAf8CdqGJazBG-DKBtimAQ'
    }
  })
  
  const finalUsageData = await finalUsageResponse.json()
  const finalApiRequests = finalUsageData.usage?.apiRequests || { used: 0, limit: null, percentage: 0 }
  
  console.log('Final API Requests Usage:')
  console.log(`  Used: ${finalApiRequests.used}/${finalApiRequests.limit || 'unlimited'} (${finalApiRequests.percentage.toFixed(1)}%)`)
  
  console.log('\n=== Test Complete ===\n')
}

testApiRequestsQuota().catch(console.error)
