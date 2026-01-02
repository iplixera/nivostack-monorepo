const API_BASE = 'http://localhost:3000'

async function testDeviceRegistration() {
  console.log('\n=== Testing Device Registration API ===\n')
  
  // Find a test project
  console.log('Step 1: Finding a test project...')
  const projectResponse = await fetch(`${API_BASE}/api/projects`, {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWpvaTJrOGEwMDAwOXowOTU1NWo2cmg5IiwiaWF0IjoxNzY2ODUyMDE1LCJleHAiOjE3Njc0NTY4MTV9.0r1-Z1hB0ywxAiePWIxm7kAf8CdqGJazBG-DKBtimAQ'
    }
  })
  
  if (!projectResponse.ok) {
    console.error(`❌ Failed to fetch projects: ${projectResponse.status}`)
    const text = await projectResponse.text()
    console.error('Response:', text.substring(0, 200))
    return
  }
  
  const projectsData = await projectResponse.json()
  const project = projectsData.projects?.[0]
  
  if (!project) {
    console.error('❌ No projects found')
    return
  }
  
  console.log(`✅ Found project: ${project.name} (ID: ${project.id})`)
  console.log(`   API Key: ${project.apiKey}`)
  
  // Test device registration
  console.log('\nStep 2: Testing Device Registration...')
  const deviceId = `test-device-${Date.now()}`
  const deviceData = {
    deviceId,
    platform: 'ios',
    osVersion: '17.2',
    appVersion: '1.0.0',
    model: 'iPhone 15 Pro',
    manufacturer: 'Apple',
    batteryLevel: 85,
    screenWidth: 393,
    screenHeight: 852,
    deviceCategory: 'phone',
    deviceBrand: 'Apple',
    locale: 'en_US',
    language: 'en',
    timeZone: 'America/New_York',
    timeZoneOffset: -300
  }
  
  const deviceResponse = await fetch(`${API_BASE}/api/devices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': project.apiKey
    },
    body: JSON.stringify(deviceData)
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
    console.log(`✅ Device registration successful: ${deviceResponse.status}`)
    console.log('   Response:', JSON.stringify(responseData, null, 2))
  } else {
    console.error(`❌ Device registration failed: ${deviceResponse.status}`)
    console.error('   Response:', JSON.stringify(responseData, null, 2))
  }
  
  // Test device update (register same device again)
  console.log('\nStep 3: Testing Device Update (re-registration)...')
  const updateResponse = await fetch(`${API_BASE}/api/devices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': project.apiKey
    },
    body: JSON.stringify({
      ...deviceData,
      batteryLevel: 90, // Updated value
      appVersion: '1.0.1' // Updated version
    })
  })
  
  const updateContentType = updateResponse.headers.get('content-type') || ''
  let updateData: any
  
  if (updateContentType.includes('application/json')) {
    updateData = await updateResponse.json()
  } else {
    const text = await updateResponse.text()
    updateData = { raw: text }
  }
  
  if (updateResponse.ok) {
    console.log(`✅ Device update successful: ${updateResponse.status}`)
    console.log('   Response:', JSON.stringify(updateData, null, 2))
  } else {
    console.error(`❌ Device update failed: ${updateResponse.status}`)
    console.error('   Response:', JSON.stringify(updateData, null, 2))
  }
  
  // Test GET devices endpoint
  console.log('\nStep 4: Testing GET Devices Endpoint...')
  const getDevicesResponse = await fetch(`${API_BASE}/api/devices?projectId=${project.id}`, {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWpvaTJrOGEwMDAwOXowOTU1NWo2cmg5IiwiaWF0IjoxNzY2ODUyMDE1LCJleHAiOjE3Njc0NTY4MTV9.0r1-Z1hB0ywxAiePWIxm7kAf8CdqGJazBG-DKBtimAQ'
    }
  })
  
  const getDevicesContentType = getDevicesResponse.headers.get('content-type') || ''
  let getDevicesData: any
  
  if (getDevicesContentType.includes('application/json')) {
    getDevicesData = await getDevicesResponse.json()
  } else {
    const text = await getDevicesResponse.text()
    getDevicesData = { raw: text }
  }
  
  if (getDevicesResponse.ok) {
    console.log(`✅ GET devices successful: ${getDevicesResponse.status}`)
    console.log(`   Found ${getDevicesData.devices?.length || 0} devices`)
    console.log(`   Stats:`, JSON.stringify(getDevicesData.stats, null, 2))
    
    // Check if our test device is in the list
    const testDevice = getDevicesData.devices?.find((d: any) => d.deviceId === deviceId)
    if (testDevice) {
      console.log(`   ✅ Test device found in list: ${testDevice.id}`)
      console.log(`      Battery level in metadata:`, testDevice.metadata?.batteryLevel)
      console.log(`      Screen width in metadata:`, testDevice.metadata?.screenWidth)
    } else {
      console.log(`   ⚠️  Test device not found in list (might be pagination)`)
    }
  } else {
    console.error(`❌ GET devices failed: ${getDevicesResponse.status}`)
    console.error('   Response:', JSON.stringify(getDevicesData, null, 2))
  }
  
  console.log('\n=== Device API Test Complete ===\n')
}

testDeviceRegistration().catch(console.error)
