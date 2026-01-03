import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Use this project ID or update to your test project ID
const PROJECT_ID = 'cmjxkkd52000511t4yohtdcfh' // Will be created if doesn't exist
const DEVICE_COUNT = 1000
const LOGS_PER_DEVICE = 1
const TRACES_PER_DEVICE = 1
const SESSIONS_PER_DEVICE = 1

// Generate device code
function generateDeviceCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const random = () => chars[Math.floor(Math.random() * chars.length)]
  const code = Array.from({ length: 8 }, random).join('')
  return `${code.substring(0, 4)}-${code.substring(4)}`
}

// Generate random date within last 90 days
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Generate random date in the past
function randomPastDate(daysAgo: number): Date {
  const now = new Date()
  const past = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
  return randomDate(past, now)
}

async function main() {
  console.log('🌱 Seeding performance test data...')
  console.log(`📊 Project ID: ${PROJECT_ID}`)
  console.log(`📱 Devices: ${DEVICE_COUNT}`)
  console.log(`📝 Logs: ${DEVICE_COUNT * LOGS_PER_DEVICE}`)
  console.log(`🔍 Traces: ${DEVICE_COUNT * TRACES_PER_DEVICE}`)
  console.log(`📊 Sessions: ${DEVICE_COUNT * SESSIONS_PER_DEVICE}`)
  console.log('')

  // Verify project exists or create it
  let project = await prisma.project.findUnique({
    where: { id: PROJECT_ID }
  })

  if (!project) {
    console.log(`⚠️  Project ${PROJECT_ID} not found. Creating test project...`)
    // Get first user to assign project to
    const user = await prisma.user.findFirst()
    if (!user) {
      throw new Error('No users found. Please create a user first.')
    }

    project = await prisma.project.create({
      data: {
        id: PROJECT_ID,
        name: 'Performance Test Project',
        userId: user.id,
        apiKey: `test-${PROJECT_ID}`
      }
    })
    console.log('✅ Created test project:', project.name)
  } else {
    console.log('✅ Project found:', project.name)
  }

  // Ensure all users have access to this project
  console.log('👥 Adding all users as project members...')
  const allUsers = await prisma.user.findMany()
  for (const user of allUsers) {
    await prisma.projectMember.upsert({
      where: {
        projectId_userId: {
          projectId: PROJECT_ID,
          userId: user.id
        }
      },
      update: {},
      create: {
        userId: user.id,
        projectId: PROJECT_ID,
        role: 'viewer'
      }
    })
  }
  console.log(`✅ Added ${allUsers.length} users as project members`)
  console.log('')

  // Step 1: Create Devices (spread over last 90 days)
  console.log('📱 Creating devices...')
  const devices = []
  const platforms = ['ios', 'android']
  const models = ['iPhone 14', 'iPhone 15', 'Samsung Galaxy S23', 'Google Pixel 7', 'OnePlus 11']
  const manufacturers = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi']
  const osVersions = ['17.0', '17.1', '17.2', '14.0', '14.1', '13.0']

  for (let i = 0; i < DEVICE_COUNT; i++) {
    const platform = platforms[Math.floor(Math.random() * platforms.length)]
    const createdAt = randomPastDate(90)
    const lastSeenAt = randomDate(createdAt, new Date())

    const device = await prisma.device.create({
      data: {
        projectId: PROJECT_ID,
        deviceId: `device-${i}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        deviceCode: generateDeviceCode(),
        platform,
        osVersion: platform === 'ios'
          ? osVersions[Math.floor(Math.random() * 3)]
          : osVersions[3 + Math.floor(Math.random() * 3)],
        appVersion: `1.${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}`,
        model: platform === 'ios'
          ? models[Math.floor(Math.random() * 2)]
          : models[2 + Math.floor(Math.random() * 3)],
        manufacturer: platform === 'ios' ? 'Apple' : manufacturers[1 + Math.floor(Math.random() * 4)],
        userId: i % 100 === 0 ? `user-${Math.floor(i / 100)}` : null,
        userEmail: i % 100 === 0 ? `user${Math.floor(i / 100)}@example.com` : null,
        userName: i % 100 === 0 ? `User ${Math.floor(i / 100)}` : null,
        debugModeEnabled: i % 10 === 0,
        debugModeEnabledAt: i % 10 === 0 ? randomPastDate(30) : null,
        debugModeExpiresAt: i % 10 === 0 ? randomDate(new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) : null,
        status: 'active',
        createdAt,
        lastSeenAt,
        updatedAt: lastSeenAt,
        metadata: {
          batteryLevel: Math.floor(Math.random() * 100),
          storageFree: Math.floor(Math.random() * 1000000),
          networkType: ['wifi', 'cellular', 'offline'][Math.floor(Math.random() * 3)]
        }
      }
    })
    devices.push(device)

    if ((i + 1) % 100 === 0) {
      console.log(`  ✅ Created ${i + 1}/${DEVICE_COUNT} devices`)
    }
  }
  console.log(`✅ Created ${devices.length} devices`)
  console.log('')

  // Step 2: Create Sessions (spread over last 90 days, linked to devices)
  console.log('📊 Creating sessions...')
  const sessions = []
  const screenNames = ['Home', 'Profile', 'Settings', 'Dashboard', 'Login', 'Signup', 'Details', 'List', 'Search', 'Cart']

  for (let i = 0; i < devices.length; i++) {
    const device = devices[i]
    const startedAt = randomPastDate(90)
    const duration = Math.floor(Math.random() * 3600) // 0-60 minutes
    const endedAt = new Date(startedAt.getTime() + duration * 1000)
    const screenCount = Math.floor(Math.random() * 10) + 1
    const screenFlow = Array.from({ length: screenCount }, () =>
      screenNames[Math.floor(Math.random() * screenNames.length)]
    )

    const session = await prisma.session.create({
      data: {
        projectId: PROJECT_ID,
        deviceId: device.id,
        sessionToken: `session-${i}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        startedAt,
        endedAt: Math.random() > 0.3 ? endedAt : null, // 70% ended sessions
        isActive: Math.random() > 0.7, // 30% active sessions
        appVersion: device.appVersion,
        osVersion: device.osVersion,
        locale: ['en_US', 'en_GB', 'fr_FR', 'de_DE', 'es_ES'][Math.floor(Math.random() * 5)],
        timezone: ['America/New_York', 'Europe/London', 'Asia/Tokyo', 'America/Los_Angeles'][Math.floor(Math.random() * 4)],
        networkType: ['wifi', 'cellular'][Math.floor(Math.random() * 2)],
        screenFlow,
        entryScreen: screenFlow[0],
        exitScreen: screenFlow[screenFlow.length - 1],
        duration: endedAt ? duration : null,
        screenCount,
        eventCount: Math.floor(Math.random() * 50),
        errorCount: Math.floor(Math.random() * 5),
        metadata: {
          appState: ['foreground', 'background'][Math.floor(Math.random() * 2)]
        }
      }
    })
    sessions.push(session)

    if ((i + 1) % 100 === 0) {
      console.log(`  ✅ Created ${i + 1}/${devices.length} sessions`)
    }
  }
  console.log(`✅ Created ${sessions.length} sessions`)
  console.log('')

  // Step 3: Create Logs (spread over last 90 days, linked to devices and sessions)
  console.log('📝 Creating logs...')
  const logLevels = ['verbose', 'debug', 'info', 'warn', 'error', 'assert']
  const tags = ['NetworkManager', 'AuthService', 'Database', 'UI', 'API', 'Storage', 'Cache']
  const logMessages = [
    'Network request completed',
    'User logged in',
    'Data fetched successfully',
    'Cache updated',
    'Error occurred',
    'Validation failed',
    'Request timeout',
    'Connection established'
  ]

  for (let i = 0; i < devices.length; i++) {
    const device = devices[i]
    const session = sessions[i]
    const timestamp = randomPastDate(90)

    await prisma.log.create({
      data: {
        projectId: PROJECT_ID,
        deviceId: device.id,
        sessionId: session.id,
        level: logLevels[Math.floor(Math.random() * logLevels.length)],
        message: logMessages[Math.floor(Math.random() * logMessages.length)],
        tag: tags[Math.floor(Math.random() * tags.length)],
        fileName: `File${Math.floor(Math.random() * 10)}.ts`,
        lineNumber: Math.floor(Math.random() * 500),
        functionName: `function${Math.floor(Math.random() * 10)}`,
        className: `Class${Math.floor(Math.random() * 5)}`,
        screenName: screenNames[Math.floor(Math.random() * screenNames.length)],
        threadName: ['main', 'background', 'network'][Math.floor(Math.random() * 3)],
        timestamp,
        createdAt: timestamp,
        data: {
          extra: 'data',
          value: Math.floor(Math.random() * 100)
        }
      }
    })

    if ((i + 1) % 100 === 0) {
      console.log(`  ✅ Created ${i + 1}/${devices.length} logs`)
    }
  }
  console.log(`✅ Created ${devices.length} logs`)
  console.log('')

  // Step 4: Create API Traces (spread over last 90 days, linked to devices and sessions)
  console.log('🔍 Creating API traces...')
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  const statusCodes = [200, 201, 400, 401, 404, 500]
  const urls = [
    '/api/users',
    '/api/products',
    '/api/orders',
    '/api/auth/login',
    '/api/auth/logout',
    '/api/cart',
    '/api/checkout',
    '/api/profile',
    '/api/settings'
  ]
  const networkTypes = ['wifi', 'cellular', 'offline']
  const countries = ['US', 'GB', 'FR', 'DE', 'ES', 'CA', 'AU']

  for (let i = 0; i < devices.length; i++) {
    const device = devices[i]
    const session = sessions[i]
    const timestamp = randomPastDate(90)
    const method = methods[Math.floor(Math.random() * methods.length)]
    const statusCode = statusCodes[Math.floor(Math.random() * statusCodes.length)]
    const url = urls[Math.floor(Math.random() * urls.length)]
    const duration = Math.floor(Math.random() * 2000) + 100 // 100-2100ms

    await prisma.apiTrace.create({
      data: {
        projectId: PROJECT_ID,
        deviceId: device.id,
        sessionId: session.id,
        url,
        method,
        statusCode,
        requestHeaders: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token123'
        },
        requestBody: method !== 'GET' ? JSON.stringify({ data: 'test' }) : null,
        responseHeaders: {
          'Content-Type': 'application/json'
        },
        responseBody: statusCode < 400 ? JSON.stringify({ success: true }) : JSON.stringify({ error: 'Failed' }),
        duration,
        error: statusCode >= 400 ? 'Request failed' : null,
        screenName: screenNames[Math.floor(Math.random() * screenNames.length)],
        networkType: networkTypes[Math.floor(Math.random() * networkTypes.length)],
        country: countries[Math.floor(Math.random() * countries.length)],
        carrier: ['Verizon', 'AT&T', 'T-Mobile', 'Sprint'][Math.floor(Math.random() * 4)],
        ipAddress: `${192 + Math.floor(Math.random() * 3)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: `Mozilla/5.0 (${device.platform === 'ios' ? 'iPhone' : 'Android'})`,
        timestamp,
        createdAt: timestamp
      }
    })

    if ((i + 1) % 100 === 0) {
      console.log(`  ✅ Created ${i + 1}/${devices.length} traces`)
    }
  }
  console.log(`✅ Created ${devices.length} API traces`)
  console.log('')

  // Step 4.5: Create Crashes (spread over last 90 days, linked to devices)
  console.log('💥 Creating crashes...')
  const crashMessages = [
    'NullPointerException',
    'IndexOutOfBoundsException',
    'NetworkTimeoutException',
    'OutOfMemoryError',
    'IllegalStateException',
    'RuntimeException',
    'AssertionError',
    'ClassCastException'
  ]
  const stackTraces = [
    'at com.example.App.onCreate(App.java:42)',
    'at android.app.Activity.performCreate(Activity.java:1234)',
    'at java.lang.Thread.run(Thread.java:123)'
  ]

  // Create crashes for 10% of devices
  const crashCount = Math.floor(devices.length * 0.1) // 100 crashes
  for (let i = 0; i < crashCount; i++) {
    const device = devices[Math.floor(Math.random() * devices.length)]
    const timestamp = randomPastDate(90)

    await prisma.crash.create({
      data: {
        projectId: PROJECT_ID,
        deviceId: device.id,
        message: crashMessages[Math.floor(Math.random() * crashMessages.length)],
        stackTrace: stackTraces.join('\n'),
        metadata: {
          errorType: 'runtime',
          severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          appVersion: device.appVersion
        },
        timestamp,
        createdAt: timestamp
      }
    })

    if ((i + 1) % 10 === 0) {
      console.log(`  ✅ Created ${i + 1}/${crashCount} crashes`)
    }
  }
  console.log(`✅ Created ${crashCount} crashes`)
  console.log('')

  // Step 5: Create Business Configs
  console.log('⚙️  Creating business configs...')
  const categories = ['feature', 'ui', 'api', 'payment', 'analytics']
  const configKeys = [
    'enableNewFeature',
    'maxRetries',
    'timeout',
    'enableDarkMode',
    'showBanner',
    'apiVersion',
    'paymentProvider',
    'analyticsEnabled'
  ]

  for (let i = 0; i < 50; i++) {
    const valueType = ['string', 'integer', 'boolean', 'decimal', 'json'][Math.floor(Math.random() * 5)]
    const baseData: any = {
      projectId: PROJECT_ID,
      key: `${configKeys[Math.floor(Math.random() * configKeys.length)]}_${i}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      valueType,
      category: categories[Math.floor(Math.random() * categories.length)],
      version: 1,
      isEnabled: true
    }

    // Set value based on type
    if (valueType === 'string') {
      baseData.stringValue = `value_${i}`
    } else if (valueType === 'integer') {
      baseData.integerValue = Math.floor(Math.random() * 100)
    } else if (valueType === 'boolean') {
      baseData.booleanValue = Math.random() > 0.5
    } else if (valueType === 'decimal') {
      baseData.decimalValue = Math.random() * 100
    } else if (valueType === 'json') {
      baseData.jsonValue = { data: 'test', index: i }
    }

    await prisma.businessConfig.create({
      data: baseData
    })
  }
  console.log('✅ Created 50 business configs')
  console.log('')

  // Step 6: Create Localizations
  console.log('🌍 Creating localizations...')
  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', isRTL: false },
    { code: 'fr', name: 'French', nativeName: 'Français', isRTL: false },
    { code: 'de', name: 'German', nativeName: 'Deutsch', isRTL: false },
    { code: 'es', name: 'Spanish', nativeName: 'Español', isRTL: false },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', isRTL: true }
  ]

  const languageIds: string[] = []
  for (const lang of languages) {
    const language = await prisma.language.upsert({
      where: {
        projectId_code: {
          projectId: PROJECT_ID,
          code: lang.code
        }
      },
      update: {},
      create: {
        projectId: PROJECT_ID,
        code: lang.code,
        name: lang.name,
        nativeName: lang.nativeName,
        isDefault: lang.code === 'en',
        isEnabled: true,
        isRTL: lang.isRTL
      }
    })
    languageIds.push(language.id)
  }
  console.log(`✅ Created ${languageIds.length} languages`)

  // Create localization keys and translations
  const translationKeys = [
    'welcome',
    'login',
    'logout',
    'settings',
    'profile',
    'save',
    'cancel',
    'delete',
    'edit',
    'search'
  ]

  const keyIds: string[] = []
  for (const key of translationKeys) {
    const keyRecord = await prisma.localizationKey.create({
      data: {
        projectId: PROJECT_ID,
        key,
        description: `Translation for ${key}`,
        category: ['buttons', 'screens', 'errors'][Math.floor(Math.random() * 3)]
      }
    })
    keyIds.push(keyRecord.id)

    // Create translations for each language
    for (let i = 0; i < languageIds.length; i++) {
      await prisma.translation.create({
        data: {
          projectId: PROJECT_ID,
          keyId: keyRecord.id,
          languageId: languageIds[i],
          value: `${key}_${languages[i].code}`,
          isReviewed: Math.random() > 0.3
        }
      })
    }
  }
  console.log(`✅ Created ${keyIds.length} localization keys with ${keyIds.length * languageIds.length} translations`)
  console.log('')

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Performance test data seeding complete!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📊 Summary:`)
  console.log(`   Devices: ${devices.length}`)
  console.log(`   Sessions: ${sessions.length}`)
  console.log(`   Logs: ${devices.length}`)
  console.log(`   API Traces: ${devices.length}`)
  console.log(`   Business Configs: 50`)
  console.log(`   Languages: ${languageIds.length}`)
  console.log(`   Localization Keys: ${translationKeys.length * languageIds.length}`)
  console.log('')
  console.log('🚀 Ready for performance testing!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

