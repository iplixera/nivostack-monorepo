import { prisma } from '../dashboard/src/lib/prisma'

async function testRuntimeFeatures() {
  try {
    console.log('=== DevBridge Runtime Features Testing ===\n')

    // Step 1: Get a test project
    console.log('Step 1: Finding a test project...')
    const project = await prisma.project.findFirst({
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })

    if (!project) {
      console.error('❌ No project found. Please create a project first.')
      process.exit(1)
    }

    console.log(`✅ Found project: ${project.name} (ID: ${project.id})`)
    console.log(`   API Key: ${project.apiKey}`)
    console.log(`   User: ${project.user.email}\n`)

    const apiKey = project.apiKey
    const projectId = project.id
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const deviceId = `test-device-${Date.now()}`
    const sessionId = `session-${Date.now()}`

    // Step 2: Register Device
    console.log('Step 2: Testing Device Registration...')
    const deviceResponse = await fetch(`${baseUrl}/api/devices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        deviceId,
        platform: 'ios',
        osVersion: '17.2',
        appVersion: '1.0.0',
        model: 'iPhone 15 Pro',
        manufacturer: 'Apple',
        deviceCode: `DEV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        deviceCategory: 'phone',
        deviceBrand: 'Apple',
        locale: 'en_US',
        language: 'en',
        timeZone: 'America/New_York',
        timeZoneOffset: -300,
        batteryLevel: 85,
        storageFree: 50000000000,
        memoryTotal: 6000000000,
        networkType: 'wifi',
        screenWidth: 393,
        screenHeight: 852,
        screenDensity: 3.0,
        cpuArchitecture: 'arm64',
        metadata: {
          test: true,
          timestamp: new Date().toISOString()
        }
      })
    })

    const deviceText = await deviceResponse.text()
    let deviceData
    try {
      deviceData = JSON.parse(deviceText)
    } catch (e) {
      console.log(`❌ Device registration failed: ${deviceResponse.status}`)
      console.log(`   Response (not JSON): ${deviceText.substring(0, 500)}\n`)
      // Continue anyway - might be a server error
    }
    
    if (deviceResponse.ok && deviceData) {
      console.log(`✅ Device registered successfully`)
      console.log(`   Device ID: ${deviceId}`)
      console.log(`   Response: ${JSON.stringify(deviceData, null, 2)}\n`)
    } else if (deviceData) {
      console.log(`❌ Device registration failed: ${deviceResponse.status}`)
      console.log(`   Error: ${JSON.stringify(deviceData, null, 2)}\n`)
      // Continue anyway - device might exist or quota issue
    }

    // Step 3: Start Session (for Screen Flow)
    console.log('Step 3: Testing Session Creation (Screen Flow)...')
    const sessionToken = `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const sessionResponse = await fetch(`${baseUrl}/api/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        deviceId,
        sessionToken,
        entryScreen: 'HomeScreen',
        appVersion: '1.0.0',
        osVersion: '17.2',
        locale: 'en_US',
        timezone: 'America/New_York',
        networkType: 'wifi',
        userProperties: {
          userId: 'test-user-123',
          environment: 'production'
        },
        metadata: {
          test: true
        }
      })
    })

    const sessionText = await sessionResponse.text()
    let sessionData
    try {
      sessionData = JSON.parse(sessionText)
    } catch (e) {
      console.log(`❌ Session creation failed: ${sessionResponse.status}`)
      console.log(`   Response (not JSON): ${sessionText.substring(0, 500)}\n`)
      return
    }
    
    const actualSessionId = sessionData.sessionId || sessionId
    if (sessionResponse.ok) {
      console.log(`✅ Session created successfully`)
      console.log(`   Session Token: ${sessionToken}`)
      console.log(`   Session ID: ${actualSessionId}`)
      console.log(`   Response: ${JSON.stringify(sessionData, null, 2)}\n`)
    } else {
      console.log(`❌ Session creation failed: ${sessionResponse.status}`)
      console.log(`   Error: ${JSON.stringify(sessionData, null, 2)}\n`)
      return
    }

    // Step 4: Send API Traces
    console.log('Step 4: Testing API Traces...')
    const traces = [
      {
        deviceId,
        sessionToken,
        url: 'https://api.example.com/users',
        method: 'GET',
        statusCode: 200,
        duration: 150,
        requestHeaders: { 'Authorization': 'Bearer xxx' },
        responseHeaders: { 'Content-Type': 'application/json' },
        requestBody: JSON.stringify({ page: 1 }),
        responseBody: JSON.stringify({ users: [] }),
        timestamp: new Date().toISOString()
      },
      {
        deviceId,
        sessionToken,
        url: 'https://api.example.com/users/123',
        method: 'POST',
        statusCode: 201,
        duration: 250,
        requestBody: JSON.stringify({ name: 'Test User' }),
        responseBody: JSON.stringify({ id: 123, name: 'Test User' }),
        timestamp: new Date().toISOString()
      },
      {
        deviceId,
        sessionToken,
        url: 'https://api.example.com/users/123',
        method: 'PUT',
        statusCode: 200,
        duration: 180,
        requestBody: JSON.stringify({ name: 'Updated User' }),
        responseBody: JSON.stringify({ id: 123, name: 'Updated User' }),
        timestamp: new Date().toISOString()
      }
    ]

    for (const trace of traces) {
      const traceResponse = await fetch(`${baseUrl}/api/traces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify(trace)
      })

      const traceText = await traceResponse.text()
      let traceResult
      try {
        traceResult = JSON.parse(traceText)
      } catch (e) {
        console.log(`❌ API Trace failed: ${trace.method} ${trace.url}`)
        console.log(`   Status: ${traceResponse.status}`)
        console.log(`   Response (not JSON): ${traceText.substring(0, 200)}`)
        continue
      }
      
      if (traceResponse.ok) {
        console.log(`✅ API Trace recorded: ${trace.method} ${trace.url} (${trace.statusCode})`)
      } else {
        console.log(`❌ API Trace failed: ${trace.method} ${trace.url}`)
        console.log(`   Status: ${traceResponse.status}`)
        console.log(`   Error: ${JSON.stringify(traceResult, null, 2)}`)
      }
    }
    console.log('')

    // Step 5: Send Device Logs
    console.log('Step 5: Testing Device Logs...')
    const logs = [
      {
        deviceId,
        sessionToken,
        level: 'info',
        message: 'User logged in successfully',
        tag: 'auth',
        data: { userId: '123', timestamp: new Date().toISOString() },
        timestamp: new Date().toISOString()
      },
      {
        deviceId,
        sessionToken,
        level: 'warning',
        message: 'Network request took longer than expected',
        tag: 'network',
        data: { url: 'https://api.example.com/data', duration: 5000 },
        timestamp: new Date().toISOString()
      },
      {
        deviceId,
        sessionToken,
        level: 'error',
        message: 'Failed to load user profile',
        tag: 'api',
        data: { error: 'Network timeout', url: 'https://api.example.com/profile' },
        timestamp: new Date().toISOString()
      },
      {
        deviceId,
        sessionToken,
        level: 'debug',
        message: 'Cache hit for user data',
        tag: 'cache',
        data: { cacheKey: 'user:123' },
        timestamp: new Date().toISOString()
      }
    ]

    const logsResponse = await fetch(`${baseUrl}/api/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(logs)
    })

    const logsText = await logsResponse.text()
    let logsData
    try {
      logsData = JSON.parse(logsText)
    } catch (e) {
      console.log(`❌ Logs failed: ${logsResponse.status}`)
      console.log(`   Response (not JSON): ${logsText.substring(0, 500)}\n`)
      logsData = null
    }
    
    if (logsResponse.ok && logsData) {
      console.log(`✅ Logs sent successfully (${logs.length} logs)`)
      console.log(`   Response: ${JSON.stringify(logsData, null, 2)}\n`)
    } else if (logsData) {
      console.log(`❌ Logs failed: ${logsResponse.status}`)
      console.log(`   Error: ${JSON.stringify(logsData, null, 2)}\n`)
    }

    // Step 6: Report Crashes
    console.log('Step 6: Testing Crash Reporting...')
    const crashes = [
      {
        deviceId,
        message: 'NullPointerException in UserProfileFragment',
        stackTrace: `java.lang.NullPointerException
  at com.example.app.UserProfileFragment.onCreate(UserProfileFragment.java:45)
  at android.app.Fragment.performCreate(Fragment.java:2508)
  at android.app.FragmentManagerImpl.moveToState(FragmentManager.java:1279)`,
        metadata: {
          screen: 'UserProfile',
          userId: '123',
          appVersion: '1.0.0'
        },
        timestamp: new Date().toISOString()
      },
      {
        deviceId,
        message: 'OutOfMemoryError when loading large image',
        stackTrace: `java.lang.OutOfMemoryError: Failed to allocate a 52428800 byte allocation
  at android.graphics.BitmapFactory.nativeDecodeStream(Native Method)
  at android.graphics.BitmapFactory.decodeStream(BitmapFactory.java:856)`,
        metadata: {
          screen: 'ImageGallery',
          imageSize: '50MB',
          deviceMemory: '2GB'
        },
        timestamp: new Date().toISOString()
      }
    ]

    for (const crash of crashes) {
      const crashResponse = await fetch(`${baseUrl}/api/crashes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify(crash)
      })

      const crashText = await crashResponse.text()
      let crashResult
      try {
        crashResult = JSON.parse(crashText)
      } catch (e) {
        console.log(`❌ Crash report failed: ${crash.message.substring(0, 50)}...`)
        console.log(`   Status: ${crashResponse.status}`)
        console.log(`   Response (not JSON): ${crashText.substring(0, 200)}`)
        continue
      }
      
      if (crashResponse.ok) {
        console.log(`✅ Crash reported: ${crash.message.substring(0, 50)}...`)
      } else {
        console.log(`❌ Crash report failed: ${crash.message.substring(0, 50)}...`)
        console.log(`   Error: ${JSON.stringify(crashResult, null, 2)}`)
      }
    }
    console.log('')

    // Step 7: Update Session with Screen Flow data
    console.log('Step 7: Testing Screen Flow Updates...')
    const screenFlowUpdates = [
      { screen: 'HomeScreen', timestamp: new Date().toISOString() },
      { screen: 'ProfileScreen', timestamp: new Date().toISOString() },
      { screen: 'SettingsScreen', timestamp: new Date().toISOString() },
      { screen: 'HomeScreen', timestamp: new Date().toISOString() }
    ]

    for (const update of screenFlowUpdates) {
      const updateResponse = await fetch(`${baseUrl}/api/sessions`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          deviceId,
          sessionToken,
          screenName: update.screen,
          metadata: {
            timestamp: update.timestamp
          }
        })
      })

      const updateText = await updateResponse.text()
      if (updateResponse.ok) {
        console.log(`✅ Screen flow updated: ${update.screen}`)
      } else {
        let error
        try {
          error = JSON.parse(updateText)
        } catch (e) {
          error = { message: updateText.substring(0, 200) }
        }
        console.log(`❌ Screen flow update failed: ${update.screen}`)
        console.log(`   Error: ${JSON.stringify(error, null, 2)}`)
      }
    }
    console.log('')

    // Step 8: End Session
    console.log('Step 8: Ending Session...')
    const endSessionResponse = await fetch(`${baseUrl}/api/sessions`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        deviceId,
        sessionToken,
        exitScreen: 'HomeScreen',
        eventCount: 10,
        errorCount: 1,
        userProperties: {
          sessionDuration: 3600000
        }
      })
    })

    const endSessionText = await endSessionResponse.text()
    let endSessionData
    try {
      endSessionData = JSON.parse(endSessionText)
    } catch (e) {
      console.log(`❌ Session end failed: ${endSessionResponse.status}`)
      console.log(`   Response (not JSON): ${endSessionText.substring(0, 500)}\n`)
      endSessionData = null
    }
    
    if (endSessionResponse.ok && endSessionData) {
      console.log(`✅ Session ended successfully`)
      console.log(`   Response: ${JSON.stringify(endSessionData, null, 2)}\n`)
    } else if (endSessionData) {
      console.log(`❌ Session end failed: ${endSessionResponse.status}`)
      console.log(`   Error: ${JSON.stringify(endSessionData, null, 2)}\n`)
    }

    console.log('=== Testing Complete ===')
    console.log(`\nSummary:`)
    console.log(`- Device ID: ${deviceId}`)
    console.log(`- Session Token: ${sessionToken}`)
    console.log(`- Session ID: ${actualSessionId}`)
    console.log(`- Project: ${project.name} (${project.id})`)
    console.log(`\nYou can now check the UI to see the data:`)
    console.log(`- Devices: /projects/${projectId}?tab=devices`)
    console.log(`- API Traces: /projects/${projectId}?tab=traces`)
    console.log(`- Screen Flow: /projects/${projectId}?tab=flow`)
    console.log(`- Logs: /projects/${projectId}?tab=logs`)
    console.log(`- Crashes: /projects/${projectId}?tab=crashes`)

  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testRuntimeFeatures()
