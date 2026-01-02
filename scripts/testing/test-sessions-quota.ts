const API_BASE = 'http://localhost:3000'

async function testSessionsQuota() {
  console.log('\n=== Testing Sessions Quota Enforcement ===\n')
  
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
  const sessionsUsage = usageData.usage?.sessions || { used: 0, limit: null, percentage: 0 }
  
  console.log('Current Sessions Usage:')
  console.log(`  Used: ${sessionsUsage.used}/${sessionsUsage.limit || 'unlimited'} (${sessionsUsage.percentage.toFixed(1)}%)\n`)
  
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
  console.log(`Using device: ${deviceId}\n`)
  
  // Calculate how many sessions we need to create
  const remainingSessions = sessionsUsage.limit ? Math.max(0, sessionsUsage.limit - sessionsUsage.used) : 10
  const sessionsToCreate = Math.min(remainingSessions + 3, 10) // Create enough to exceed limit
  
  console.log(`Creating ${sessionsToCreate} sessions to test quota enforcement...\n`)
  
  let successCount = 0
  let blockedCount = 0
  
  for (let i = 0; i < sessionsToCreate; i++) {
    const sessionToken = `session-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`
    const sessionResponse = await fetch(`${API_BASE}/api/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': project.apiKey
      },
      body: JSON.stringify({
        deviceId,
        sessionToken,
        entryScreen: `Screen${i}`,
        appVersion: '1.0.0',
        osVersion: '17.2'
      })
    })
    
    const contentType = sessionResponse.headers.get('content-type') || ''
    let responseData: any
    
    if (contentType.includes('application/json')) {
      responseData = await sessionResponse.json()
    } else {
      const text = await sessionResponse.text()
      responseData = { raw: text }
    }
    
    if (sessionResponse.ok) {
      successCount++
      if (i < 3) {
        console.log(`  ✅ Session ${i + 1}: ${sessionToken} (Status: ${sessionResponse.status})`)
      }
    } else if (sessionResponse.status === 429) {
      blockedCount++
      console.log(`  🚫 Session ${i + 1} BLOCKED: ${sessionToken} (Status: ${sessionResponse.status})`)
      console.log(`     Error: ${responseData.error || 'Quota exceeded'}`)
      console.log(`     Retry-After: ${sessionResponse.headers.get('Retry-After') || 'N/A'}`)
      break
    } else {
      console.log(`  ❌ Session ${i + 1} failed: ${sessionToken} (Status: ${sessionResponse.status})`)
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
  const finalSessionsUsage = finalUsageData.usage?.sessions || { used: 0, limit: null, percentage: 0 }
  
  console.log('Final Sessions Usage:')
  console.log(`  Used: ${finalSessionsUsage.used}/${finalSessionsUsage.limit || 'unlimited'} (${finalSessionsUsage.percentage.toFixed(1)}%)`)
  
  console.log('\n=== Test Complete ===\n')
}

testSessionsQuota().catch(console.error)
