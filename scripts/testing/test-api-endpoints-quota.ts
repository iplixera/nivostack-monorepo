const API_BASE = 'http://localhost:3000'

async function testApiEndpointsQuota() {
  console.log('\n=== Testing API Endpoints Quota Enforcement ===\n')
  
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
  const apiEndpoints = usageData.usage?.apiEndpoints || { used: 0, limit: null, percentage: 0 }
  
  console.log('Current API Endpoints Usage:')
  console.log(`  Used: ${apiEndpoints.used}/${apiEndpoints.limit || 'unlimited'} (${apiEndpoints.percentage.toFixed(1)}%)\n`)
  
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
  
  console.log(`Using device: ${deviceId}`)
  console.log(`Session token: ${sessionToken}\n`)
  
  // Test new unique endpoints when already at/over limit
  console.log('Testing: Attempting to add NEW unique endpoints when quota is exceeded...\n')
  
  const newEndpoints = [
    'https://api.newendpoint1.com/test',
    'https://api.newendpoint2.com/test',
    'https://api.newendpoint3.com/test',
    'https://api.newendpoint4.com/test',
    'https://api.newendpoint5.com/test'
  ]
  
  let successCount = 0
  let blockedCount = 0
  
  for (let i = 0; i < newEndpoints.length; i++) {
    const endpoint = newEndpoints[i]
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
      console.log(`  ✅ Endpoint ${i + 1}: ${endpoint} (Status: ${traceResponse.status})`)
    } else if (traceResponse.status === 429) {
      blockedCount++
      console.log(`  🚫 Endpoint ${i + 1} BLOCKED: ${endpoint} (Status: ${traceResponse.status})`)
      console.log(`     Error: ${responseData.error || 'Quota exceeded'}`)
      console.log(`     Retry-After: ${traceResponse.headers.get('Retry-After') || 'N/A'}`)
      break
    } else {
      console.log(`  ❌ Endpoint ${i + 1} failed: ${endpoint} (Status: ${traceResponse.status})`)
      console.log(`     Error: ${JSON.stringify(responseData, null, 2)}`)
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
  const finalApiEndpoints = finalUsageData.usage?.apiEndpoints || { used: 0, limit: null, percentage: 0 }
  
  console.log('Final API Endpoints Usage:')
  console.log(`  Used: ${finalApiEndpoints.used}/${finalApiEndpoints.limit || 'unlimited'} (${finalApiEndpoints.percentage.toFixed(1)}%)`)
  
  console.log('\n=== Test Complete ===\n')
}

testApiEndpointsQuota().catch(console.error)
