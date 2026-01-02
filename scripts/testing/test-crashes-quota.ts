const API_BASE = 'http://localhost:3000'

async function testCrashesQuota() {
  console.log('\n=== Testing Crashes Quota Enforcement ===\n')
  
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
  const crashesUsage = usageData.usage?.crashes || { used: 0, limit: null, percentage: 0 }
  
  console.log('Current Crashes Usage:')
  console.log(`  Used: ${crashesUsage.used}/${crashesUsage.limit || 'unlimited'} (${crashesUsage.percentage.toFixed(1)}%)\n`)
  
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
  
  // Calculate how many crashes we need to report
  const remainingCrashes = crashesUsage.limit ? Math.max(0, crashesUsage.limit - crashesUsage.used) : 10
  const crashesToReport = Math.min(remainingCrashes + 3, 10) // Report enough to exceed limit
  
  console.log(`Reporting ${crashesToReport} crashes to test quota enforcement...\n`)
  
  let successCount = 0
  let blockedCount = 0
  
  const crashTypes = [
    'NullPointerException',
    'IndexOutOfBoundsException',
    'IllegalStateException',
    'RuntimeException',
    'AssertionError'
  ]
  
  for (let i = 0; i < crashesToReport; i++) {
    const crashType = crashTypes[i % crashTypes.length]
    const crashResponse = await fetch(`${API_BASE}/api/crashes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': project.apiKey
      },
      body: JSON.stringify({
        deviceId,
        message: `Test crash ${i + 1}: ${crashType}`,
        stackTrace: `at com.example.App.method${i}(App.java:${100 + i})\nat com.example.App.main(App.java:50)`,
        timestamp: new Date().toISOString(),
        metadata: {
          errorType: crashType,
          appVersion: '1.0.0',
          osVersion: '17.2'
        }
      })
    })
    
    const contentType = crashResponse.headers.get('content-type') || ''
    let responseData: any
    
    if (contentType.includes('application/json')) {
      responseData = await crashResponse.json()
    } else {
      const text = await crashResponse.text()
      responseData = { raw: text }
    }
    
    if (crashResponse.ok && !responseData.error) {
      successCount++
      if (i < 3) {
        console.log(`  ✅ Crash ${i + 1}: ${crashType} - "Test crash ${i + 1}" (Status: ${crashResponse.status})`)
      }
    } else if (crashResponse.status === 429) {
      blockedCount++
      console.log(`  🚫 Crash ${i + 1} BLOCKED: ${crashType} (Status: ${crashResponse.status})`)
      console.log(`     Error: ${responseData.error || 'Quota exceeded'}`)
      console.log(`     Retry-After: ${crashResponse.headers.get('Retry-After') || 'N/A'}`)
      break
    } else {
      console.log(`  ❌ Crash ${i + 1} failed: ${crashType} (Status: ${crashResponse.status})`)
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
  const finalCrashesUsage = finalUsageData.usage?.crashes || { used: 0, limit: null, percentage: 0 }
  
  console.log('Final Crashes Usage:')
  console.log(`  Used: ${finalCrashesUsage.used}/${finalCrashesUsage.limit || 'unlimited'} (${finalCrashesUsage.percentage.toFixed(1)}%)`)
  
  console.log('\n=== Test Complete ===\n')
}

testCrashesQuota().catch(console.error)
