const API_BASE = 'http://localhost:3000'

async function createSessionWithTraces() {
  console.log('\n=== Creating Session with Screen Flow Data ===\n')
  
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
  
  // Create a session
  console.log('Step 1: Creating a session...')
  const sessionToken = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
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
  
  if (!sessionResponse.ok) {
    const errorData = await sessionResponse.json().catch(() => ({ error: 'Unknown error' }))
    console.error(`❌ Session creation failed: ${sessionResponse.status}`)
    console.error(`   Error: ${JSON.stringify(errorData, null, 2)}`)
    return
  }
  
  const sessionData = await sessionResponse.json()
  console.log(`✅ Session created: ${sessionToken}\n`)
  
  // Create traces with screen names for screen flow
  console.log('Step 2: Creating traces with screen names...')
  const screens = ['HomeScreen', 'ProfileScreen', 'SettingsScreen', 'HomeScreen', 'DetailsScreen']
  const endpoints = [
    'https://api.example.com/user/profile',
    'https://api.example.com/user/settings',
    'https://api.example.com/user/details'
  ]
  
  for (let i = 0; i < screens.length; i++) {
    const screen = screens[i]
    const endpoint = endpoints[i % endpoints.length]
    
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
        timestamp: new Date(Date.now() + i * 1000).toISOString(),
        screenName: screen // This is important for screen flow!
      })
    })
    
    if (traceResponse.ok) {
      console.log(`  ✅ Trace ${i + 1}: ${screen} -> ${endpoint}`)
    } else {
      const errorData = await traceResponse.json().catch(() => ({ error: 'Unknown error' }))
      console.log(`  ❌ Trace ${i + 1} failed: ${screen} (Status: ${traceResponse.status})`)
      if (i < 3) {
        console.log(`     Error: ${JSON.stringify(errorData, null, 2)}`)
      }
    }
  }
  
  console.log('\n✅ Session with screen flow data created!')
  console.log(`   Session Token: ${sessionToken}`)
  console.log(`   Screens: ${screens.join(' -> ')}`)
  console.log('\nYou should now see this session in the Screen Flow page.\n')
}

createSessionWithTraces().catch(console.error)
