const API_BASE = 'http://localhost:3000'

async function testLogsQuota() {
  console.log('\n=== Testing Device Logs Quota Enforcement ===\n')
  
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
  const logsUsage = usageData.usage?.logs || { used: 0, limit: null, percentage: 0 }
  
  console.log('Current Logs Usage:')
  console.log(`  Used: ${logsUsage.used}/${logsUsage.limit || 'unlimited'} (${logsUsage.percentage.toFixed(1)}%)\n`)
  
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
  
  // Calculate how many logs we need to create
  const remainingLogs = logsUsage.limit ? Math.max(0, logsUsage.limit - logsUsage.used) : 10
  const logsToCreate = Math.min(remainingLogs + 3, 10) // Create enough to exceed limit
  
  console.log(`Creating ${logsToCreate} logs to test quota enforcement...\n`)
  
  const logLevels = ['verbose', 'debug', 'info', 'warn', 'error']
  let successCount = 0
  let blockedCount = 0
  
  for (let i = 0; i < logsToCreate; i++) {
    const level = logLevels[i % logLevels.length]
    const logResponse = await fetch(`${API_BASE}/api/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': project.apiKey
      },
      body: JSON.stringify({
        deviceId,
        sessionToken,
        level,
        message: `Test log message ${i + 1} - ${level}`,
        timestamp: new Date().toISOString(),
        tag: 'test',
        screenName: 'TestScreen'
      })
    })
    
    const contentType = logResponse.headers.get('content-type') || ''
    let responseData: any
    
    if (contentType.includes('application/json')) {
      responseData = await logResponse.json()
    } else {
      const text = await logResponse.text()
      responseData = { raw: text }
    }
    
    if (logResponse.ok && !responseData.error) {
      successCount++
      if (i < 3) {
        console.log(`  ✅ Log ${i + 1}: ${level.toUpperCase()} - "Test log message ${i + 1}" (Status: ${logResponse.status})`)
      }
    } else if (logResponse.status === 429) {
      blockedCount++
      console.log(`  🚫 Log ${i + 1} BLOCKED: ${level.toUpperCase()} (Status: ${logResponse.status})`)
      console.log(`     Error: ${responseData.error || 'Quota exceeded'}`)
      console.log(`     Retry-After: ${logResponse.headers.get('Retry-After') || 'N/A'}`)
      break
    } else {
      console.log(`  ❌ Log ${i + 1} failed: ${level.toUpperCase()} (Status: ${logResponse.status})`)
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
  const finalLogsUsage = finalUsageData.usage?.logs || { used: 0, limit: null, percentage: 0 }
  
  console.log('Final Logs Usage:')
  console.log(`  Used: ${finalLogsUsage.used}/${finalLogsUsage.limit || 'unlimited'} (${finalLogsUsage.percentage.toFixed(1)}%)`)
  
  console.log('\n=== Test Complete ===\n')
}

testLogsQuota().catch(console.error)
