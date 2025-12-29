/**
 * Test Setup
 * Configures test environment and utilities
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../dashboard/src/lib/auth'

const prisma = new PrismaClient()

// Test database connection
export async function setupTestDB() {
  // Ensure database is connected
  await prisma.$connect()
  return prisma
}

// Cleanup test data
export async function cleanupTestDB() {
  // Delete test data (be careful in production!)
  // Only run in test environment
  if (process.env.NODE_ENV !== 'test' && !process.env.TEST_DB) {
    throw new Error('Cleanup only allowed in test environment')
  }
  
  // Delete in reverse order of dependencies
  await prisma.invoice.deleteMany({ where: { subscription: { user: { email: { contains: '@test.' } } } } })
  await prisma.subscription.deleteMany({ where: { user: { email: { contains: '@test.' } } } })
  await prisma.project.deleteMany({ where: { user: { email: { contains: '@test.' } } } })
  await prisma.user.deleteMany({ where: { email: { contains: '@test.' } } })
  await prisma.plan.deleteMany({ where: { name: { startsWith: 'test_' } } })
}

// Create test admin user
export async function createTestAdmin() {
  const hashedPassword = await hashPassword('TestAdmin123!@#')
  return await prisma.user.upsert({
    where: { email: 'admin@test.devbridge.com' },
    update: {},
    create: {
      email: 'admin@test.devbridge.com',
      password: hashedPassword,
      name: 'Test Admin',
      isAdmin: true,
    },
  })
}

// Create test regular user
export async function createTestUser(email: string = 'user@test.devbridge.com') {
  const hashedPassword = await hashPassword('TestUser123!@#')
  return await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      name: 'Test User',
      isAdmin: false,
    },
  })
}

// Create test plan
export async function createTestPlan(data: {
  name: string
  displayName: string
  price?: number
  maxSessions?: number | null
  maxDevices?: number | null
  [key: string]: any
}) {
  return await prisma.plan.upsert({
    where: { name: data.name },
    update: data,
    create: {
      name: data.name,
      displayName: data.displayName,
      description: data.description || `Test ${data.displayName}`,
      price: data.price ?? 0,
      currency: 'USD',
      interval: 'month',
      isActive: data.isActive ?? true,
      isPublic: data.isPublic ?? true,
      maxProjects: data.maxProjects ?? null,
      maxDevices: data.maxDevices ?? null,
      maxSessions: data.maxSessions ?? null,
      maxApiTraces: data.maxApiTraces ?? null,
      maxLogs: data.maxLogs ?? null,
      maxCrashes: data.maxCrashes ?? null,
      retentionDays: data.retentionDays ?? 30,
      allowApiTracking: data.allowApiTracking ?? true,
      allowScreenTracking: data.allowScreenTracking ?? true,
      allowCrashReporting: data.allowCrashReporting ?? true,
      allowLogging: data.allowLogging ?? true,
      allowBusinessConfig: data.allowBusinessConfig ?? true,
      allowLocalization: data.allowLocalization ?? true,
      allowCustomDomains: data.allowCustomDomains ?? false,
      allowWebhooks: data.allowWebhooks ?? false,
      allowTeamMembers: data.allowTeamMembers ?? false,
      allowPrioritySupport: data.allowPrioritySupport ?? false,
    },
  })
}

// Create test subscription
export async function createTestSubscription(userId: string, planId: string) {
  const plan = await prisma.plan.findUnique({ where: { id: planId } })
  if (!plan) throw new Error('Plan not found')

  const trialStartDate = new Date()
  const trialDays = plan.retentionDays || 30
  const trialEndDate = new Date(trialStartDate)
  trialEndDate.setDate(trialEndDate.getDate() + trialDays)

  return await prisma.subscription.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      planId,
      status: 'active',
      enabled: true,
      trialStartDate,
      trialEndDate,
      currentPeriodStart: trialStartDate,
      currentPeriodEnd: trialEndDate,
    },
  })
}

// Generate JWT token for testing
export async function generateTestToken(userId: string): Promise<string> {
  const jwt = require('jsonwebtoken')
  const JWT_SECRET = process.env.JWT_SECRET || 'test-secret'
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

// API request helper
export async function makeApiRequest(
  endpoint: string,
  options: {
    method?: string
    body?: any
    token?: string
    headers?: Record<string, string>
  } = {}
) {
  const { method = 'GET', body, token, headers = {} } = options

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  const url = `${baseUrl}${endpoint}`

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json()
  return { status: response.status, data, response }
}

export { prisma }

