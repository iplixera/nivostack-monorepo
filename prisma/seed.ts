import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Check environment
  const env = process.env.VERCEL_ENV || 'development'
  console.log(`📍 Environment: ${env}`)

  if (env === 'production') {
    console.log('⚠️  WARNING: Seeding production database!')
    console.log('⚠️  Only creating minimal required data...')
  }

  // Create Plans
  console.log('📦 Creating subscription plans...')
  
  const freePlan = await prisma.plan.upsert({
    where: { name: 'free' },
    update: {},
    create: {
      name: 'free',
      displayName: 'Free Plan',
      description: '30-day free trial with full features',
      price: 0,
      currency: 'USD',
      interval: 'month',
      isActive: true,
      isPublic: true,
      // Free plan limits
      maxProjects: null,
      maxDevices: 100, // 100 device registrations
      maxMockEndpoints: 10, // 10 mock endpoints
      maxApiEndpoints: 20, // 20 unique API endpoints
      maxApiRequests: 1000, // 1000 API requests per month
      maxApiEndpoints: 20, // 20 unique API endpoints
      maxApiRequests: 1000, // 1000 total API requests per month
      maxLogs: 10000, // 10,000 logs per month
      maxSessions: 1000, // 1,000 sessions per month
      maxCrashes: 100, // 100 crashes per month
      maxBusinessConfigKeys: 50, // 50 business config keys
      maxLocalizationLanguages: 5, // 5 languages
      maxLocalizationKeys: 200, // 200 localization keys
      retentionDays: 30, // 30-day trial
      // All features enabled during trial
      allowApiTracking: true,
      allowScreenTracking: true,
      allowCrashReporting: true,
      allowLogging: true,
      allowBusinessConfig: true,
      allowLocalization: true,
      allowCustomDomains: false,
      allowWebhooks: false,
      allowTeamMembers: false,
      allowPrioritySupport: false,
    },
  })
  console.log(`✅ Created/Updated plan: ${freePlan.displayName}`)

  // Pro Plan (placeholder - not active yet)
  const proPlan = await prisma.plan.upsert({
    where: { name: 'pro' },
    update: {},
    create: {
      name: 'pro',
      displayName: 'Pro Plan',
      description: 'Professional plan for individual developers',
      price: 29.99,
      currency: 'USD',
      interval: 'month',
      isActive: false, // Not active yet
      isPublic: true,
      maxProjects: null,
      maxDevices: 1000, // 10x free plan
      maxMockEndpoints: 100,
      maxApiEndpoints: 200, // 10x free plan (20 * 10)
      maxApiRequests: 100000, // 100x free plan (1000 * 100)
      maxLogs: 500000,
      maxSessions: 50000,
      maxCrashes: 10000,
      maxBusinessConfigKeys: 500, // 10x free plan (50 * 10)
      maxLocalizationLanguages: 50, // 10x free plan (5 * 10)
      maxLocalizationKeys: 2000, // 10x free plan (200 * 10)
      retentionDays: 90,
      allowApiTracking: true,
      allowScreenTracking: true,
      allowCrashReporting: true,
      allowLogging: true,
      allowBusinessConfig: true,
      allowLocalization: true,
      allowCustomDomains: true,
      allowWebhooks: true,
      allowTeamMembers: false,
      allowPrioritySupport: false,
    },
  })
  console.log(`✅ Created/Updated plan: ${proPlan.displayName} (inactive)`)

  // Team Plan (placeholder - not active yet)
  const teamPlan = await prisma.plan.upsert({
    where: { name: 'team' },
    update: {},
    create: {
      name: 'team',
      displayName: 'Team Plan',
      description: 'Team collaboration with advanced features',
      price: 99.99,
      currency: 'USD',
      interval: 'month',
      isActive: false, // Not active yet
      isPublic: true,
      maxProjects: null,
      maxDevices: null, // Unlimited
      maxMockEndpoints: null, // Unlimited
      maxApiEndpoints: null, // Unlimited
      maxApiRequests: null, // Unlimited
      maxApiEndpoints: null, // Unlimited
      maxApiRequests: null, // Unlimited
      maxLogs: null, // Unlimited
      maxSessions: null, // Unlimited
      maxCrashes: null, // Unlimited
      maxBusinessConfigKeys: null, // Unlimited
      maxLocalizationLanguages: null, // Unlimited
      maxLocalizationKeys: null, // Unlimited
      retentionDays: null, // Unlimited
      allowApiTracking: true,
      allowScreenTracking: true,
      allowCrashReporting: true,
      allowLogging: true,
      allowBusinessConfig: true,
      allowLocalization: true,
      allowCustomDomains: true,
      allowWebhooks: true,
      allowTeamMembers: true,
      allowPrioritySupport: true,
    },
  })
  console.log(`✅ Created/Updated plan: ${teamPlan.displayName} (inactive)`)

  // Enterprise Plan
  const enterprisePlan = await prisma.plan.upsert({
    where: { name: 'enterprise' },
    update: {},
    create: {
      name: 'enterprise',
      displayName: 'Enterprise Plan',
      description: 'Enterprise-grade solution with dedicated support',
      price: 299.99,
      currency: 'USD',
      interval: 'month',
      isActive: false, // Not active yet
      isPublic: true,
      maxProjects: null,
      maxDevices: null, // Unlimited
      maxMockEndpoints: null, // Unlimited
      maxApiEndpoints: null, // Unlimited
      maxApiRequests: null, // Unlimited
      maxApiEndpoints: null, // Unlimited
      maxApiRequests: null, // Unlimited
      maxLogs: null, // Unlimited
      maxSessions: null, // Unlimited
      maxCrashes: null, // Unlimited
      maxBusinessConfigKeys: null, // Unlimited
      maxLocalizationLanguages: null, // Unlimited
      maxLocalizationKeys: null, // Unlimited
      retentionDays: null, // Unlimited
      allowApiTracking: true,
      allowScreenTracking: true,
      allowCrashReporting: true,
      allowLogging: true,
      allowBusinessConfig: true,
      allowLocalization: true,
      allowCustomDomains: true,
      allowWebhooks: true,
      allowTeamMembers: true,
      allowPrioritySupport: true,
    },
  })
  console.log(`✅ Created/Updated plan: ${enterprisePlan.displayName} (inactive)`)

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!@#', 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@devbridge.com' },
    update: {},
    create: {
      email: 'admin@devbridge.com',
      password: adminPassword,
      name: 'DevBridge Admin',
      isAdmin: true,
    }
  })
  console.log(`✅ Created admin user: ${adminUser.email}`)

  // Create admin subscription
  const adminTrialStartDate = new Date()
  const adminTrialEndDate = new Date(adminTrialStartDate)
  adminTrialEndDate.setDate(adminTrialEndDate.getDate() + 30)

  await prisma.subscription.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      planId: freePlan.id,
      status: 'active',
      enabled: true,
      trialStartDate: adminTrialStartDate,
      trialEndDate: adminTrialEndDate,
      currentPeriodStart: adminTrialStartDate,
      currentPeriodEnd: adminTrialEndDate,
    },
  })
  console.log(`✅ Created admin subscription`)

  // Create test user
  const hashedPassword = await bcrypt.hash('Test123!@#', 10)
  const user = await prisma.user.upsert({
    where: { email: 'test@staging.devbridge.com' },
    update: {},
    create: {
      email: 'test@staging.devbridge.com',
      password: hashedPassword,
      name: 'Test User (Staging)'
    }
  })
  console.log(`✅ Created user: ${user.email}`)

  // Create subscription for test user (Free Plan)
  const trialStartDate = new Date()
  const trialEndDate = new Date(trialStartDate)
  trialEndDate.setDate(trialEndDate.getDate() + 30) // 30-day trial

  const subscription = await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      planId: freePlan.id,
      status: 'active',
      enabled: true,
      trialStartDate,
      trialEndDate,
      currentPeriodStart: trialStartDate,
      currentPeriodEnd: trialEndDate,
    },
  })
  console.log(`✅ Created subscription: ${subscription.id} (Free Plan, expires ${trialEndDate.toISOString().split('T')[0]})`)

  // Create test project
  const testApiKey = `test-staging-${Date.now()}-${Math.random().toString(36).substring(7)}`
  
  // Check if project exists first
  let project = await prisma.project.findFirst({
    where: { 
      name: 'Test Project - Staging',
      userId: user.id
    }
  })

  if (!project) {
    project = await prisma.project.create({
      data: {
        name: 'Test Project - Staging',
        apiKey: testApiKey,
        userId: user.id
      }
    })
  }
  console.log(`✅ Created project: ${project.name}`)
  console.log(`🔑 API Key: ${project.apiKey}`)

  // Create feature flags
  const featureFlags = await prisma.featureFlags.upsert({
    where: { projectId: project.id },
    update: {},
    create: {
      projectId: project.id,
      sdkEnabled: true,
      apiTracking: true,
      screenTracking: true,
      crashReporting: true,
      logging: true,
      deviceTracking: true,
      sessionTracking: true,
      businessConfig: true,
      localization: true,
      offlineSupport: false,
      batchEvents: true
    }
  })
  console.log(`✅ Created feature flags`)

  // Create SDK settings
  const sdkSettings = await prisma.sdkSettings.upsert({
    where: { projectId: project.id },
    update: {},
    create: {
      projectId: project.id,
      trackingMode: 'all'
    }
  })
  console.log(`✅ Created SDK settings: trackingMode=${sdkSettings.trackingMode}`)

  // Create sample business config
  await prisma.businessConfig.upsert({
    where: { 
      projectId_key: {
        projectId: project.id,
        key: 'app_name'
      }
    },
    update: {},
    create: {
      projectId: project.id,
      key: 'app_name',
      label: 'App Name',
      valueType: 'string',
      stringValue: 'DevBridge Test App',
      description: 'Application name'
    }
  })

  await prisma.businessConfig.upsert({
    where: { 
      projectId_key: {
        projectId: project.id,
        key: 'api_timeout'
      }
    },
    update: {},
    create: {
      projectId: project.id,
      key: 'api_timeout',
      label: 'API Timeout',
      valueType: 'integer',
      integerValue: 30000,
      description: 'API timeout in milliseconds'
    }
  })

  await prisma.businessConfig.upsert({
    where: { 
      projectId_key: {
        projectId: project.id,
        key: 'debug_mode'
      }
    },
    update: {},
    create: {
      projectId: project.id,
      key: 'debug_mode',
      label: 'Debug Mode',
      valueType: 'boolean',
      booleanValue: true,
      description: 'Enable debug mode'
    }
  })
  console.log(`✅ Created 3 business configs`)

  // Create sample device (only in non-production)
  if (env !== 'production') {
    const uniqueDeviceCode = `TEST-STAGE-${Date.now()}`
    const device = await prisma.device.upsert({
      where: {
        projectId_deviceId: {
          projectId: project.id,
          deviceId: 'test-device-staging-001'
        }
      },
      update: {},
      create: {
        projectId: project.id,
        deviceId: 'test-device-staging-001',
        deviceCode: uniqueDeviceCode,
        platform: 'ios',
        osVersion: '17.0',
        appVersion: '1.0.0',
        manufacturer: 'Apple',
        model: 'iPhone 15 Pro',
        userEmail: 'test.user@staging.com',
        debugModeEnabled: false
      }
    })
    console.log(`✅ Created test device: ${device.deviceCode}`)

    // Create sample session
    const session = await prisma.session.create({
      data: {
        projectId: project.id,
        deviceId: device.id,
        sessionToken: `session-${Date.now()}`,
        startedAt: new Date(),
        appVersion: '1.0.0',
        osVersion: '17.0',
        locale: 'en_US',
        timezone: 'UTC',
        entryScreen: 'Home',
        screenCount: 2,
        userProperties: {
          userId: 'test-user-123',
          userName: 'Test User',
          language: 'en',
          timezone: 'UTC'
        },
        metadata: {
          screenFlow: [
            {
              screen: 'Home',
              timestamp: new Date().toISOString(),
              duration: 5000
            },
            {
              screen: 'Settings',
              timestamp: new Date(Date.now() + 5000).toISOString(),
              duration: 3000
            }
          ]
        }
      }
    })
    console.log(`✅ Created sample session`)

    // Create sample log
    await prisma.log.create({
      data: {
        projectId: project.id,
        deviceId: device.id,
        sessionId: session.id,
        level: 'INFO',
        message: 'Test log entry for staging environment',
        timestamp: new Date(),
        tag: 'test'
      }
    })
    console.log(`✅ Created sample log`)
  }

  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Seeding complete!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
  console.log('📧 Test User Email: test@staging.devbridge.com')
  console.log('🔑 Test Password: Test123!@#')
  console.log(`🔑 API Key: ${project.apiKey}`)
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

