const API_BASE = 'http://localhost:3000'

async function testQuotaEnforcement() {
  console.log('\n=== Testing Device Quota Enforcement ===\n')
  
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
  
  // Check current device count
  const devicesResponse = await fetch(`${API_BASE}/api/devices?projectId=${project.id}`, {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWpvaTJrOGEwMDAwOXowOTU1NWo2cmg5IiwiaWF0IjoxNzY2ODUyMDE1LCJleHAiOjE3Njc0NTY4MTV9.0r1-Z1hB0ywxAiePWIxm7kAf8CdqGJazBG-DKBtimAQ'
    }
  })
  
  const devicesData = await devicesResponse.json()
  console.log(`Current device count: ${devicesData.stats?.total || 0}`)
  console.log(`Plan limit: Checking...\n`)
  
  // Try to register devices beyond quota
  console.log('Attempting to register devices beyond quota...\n')
  
  for (let i = 0; i < 5; i++) {
    const deviceId = `quota-test-${Date.now()}-${i}`
    const deviceResponse = await fetch(`${API_BASE}/api/devices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': project.apiKey
      },
      body: JSON.stringify({
        deviceId,
        platform: 'ios',
        osVersion: '17.2'
      })
    })
    
    const contentType = deviceResponse.headers.get('content-type') || ''
    let responseData: any
    
    if (contentType.includes('application/json')) {
      responseData = await deviceResponse.json()
    } else {
      const text = await deviceResponse.text()
      responseData = { raw: text }
    }
    
    if (deviceResponse.ok) {
      console.log(`✅ Device ${i + 1} registered: ${deviceId} (Status: ${deviceResponse.status})`)
    } else if (deviceResponse.status === 429) {
      console.log(`🚫 Device ${i + 1} BLOCKED by quota: ${deviceId} (Status: ${deviceResponse.status})`)
      console.log(`   Error: ${responseData.error || 'Quota exceeded'}`)
      console.log(`   Retry-After: ${deviceResponse.headers.get('Retry-After') || 'N/A'}`)
      break
    } else {
      console.log(`❌ Device ${i + 1} failed: ${deviceId} (Status: ${deviceResponse.status})`)
      console.log(`   Error: ${JSON.stringify(responseData, null, 2)}`)
    }
  }
  
  // Check final count
  const finalDevicesResponse = await fetch(`${API_BASE}/api/devices?projectId=${project.id}`, {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWpvaTJrOGEwMDAwOXowOTU1NWo2cmg5IiwiaWF0IjoxNzY2ODUyMDE1LCJleHAiOjE3Njc0NTY4MTV9.0r1-Z1hB0ywxAiePWIxm7kAf8CdqGJazBG-DKBtimAQ'
    }
  })
  
  const finalDevicesData = await finalDevicesResponse.json()
  console.log(`\nFinal device count: ${finalDevicesData.stats?.total || 0}`)
}

testQuotaEnforcement().catch(console.error)
