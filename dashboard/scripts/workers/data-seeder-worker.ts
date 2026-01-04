/**
 * Data Seeder Worker
 *
 * Continuously generates mock data to simulate production traffic.
 * Creates API traces, logs, crashes, and sessions with realistic patterns.
 * Useful for testing aggregation system with real data patterns.
 *
 * Usage:
 *   pnpm run worker:data-seeder
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(__dirname, '../../../.env.local') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configuration
const CONFIG = {
  // How often to generate data (in milliseconds)
  INTERVAL_MS: 5000, // 5 seconds

  // Data generation rates (per interval)
  API_TRACES_PER_INTERVAL: 10,
  LOGS_PER_INTERVAL: 20,
  CRASHES_PER_INTERVAL: 1,
  SESSIONS_PER_INTERVAL: 2,

  // Error rates (as percentage)
  API_ERROR_RATE: 0.05, // 5% of API calls fail
  LOG_ERROR_RATE: 0.1, // 10% of logs are errors
  CRASH_RATE: 0.02, // 2% of sessions crash

  // Data patterns
  ENDPOINTS: [
    '/api/users',
    '/api/users/:id',
    '/api/products',
    '/api/products/:id',
    '/api/orders',
    '/api/orders/:id',
    '/api/auth/login',
    '/api/auth/logout',
    '/api/payments',
    '/api/notifications',
    '/api/search',
    '/api/analytics'
  ],

  METHODS: ['GET', 'POST', 'PUT', 'DELETE'],
  STATUS_CODES: [200, 201, 204, 400, 401, 403, 404, 422, 500, 502, 503],
  PLATFORMS: ['ios', 'android'],
  SCREEN_NAMES: ['Home', 'Profile', 'Settings', 'Dashboard', 'Products', 'Cart', 'Checkout'],
  LOG_LEVELS: ['debug', 'info', 'warn', 'error'],
};

// Helper functions
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomDeviceId(): string {
  return `device_${randomInt(1000, 9999)}`;
}

function randomSessionToken(): string {
  return `session_${Date.now()}_${randomInt(1000, 9999)}`;
}

function getRandomEndpoint(): string {
  const endpoint = randomChoice(CONFIG.ENDPOINTS);
  if (endpoint.includes(':id')) {
    return endpoint.replace(':id', randomInt(1, 1000).toString());
  }
  return endpoint;
}

function getRandomStatusCode(method: string, isError: boolean): number {
  if (!isError) {
    return randomChoice([200, 201, 204]);
  }

  // Error codes based on method
  if (method === 'GET') return randomChoice([404, 500, 503]);
  if (method === 'POST') return randomChoice([400, 422, 500]);
  if (method === 'PUT') return randomChoice([400, 404, 422, 500]);
  if (method === 'DELETE') return randomChoice([404, 500]);

  return randomChoice(CONFIG.STATUS_CODES);
}

function getRandomDuration(): number {
  // Normal distribution around 200ms with some outliers
  const base = randomFloat(50, 500);
  if (Math.random() < 0.1) { // 10% chance of slow request
    return base * randomFloat(5, 20);
  }
  return base;
}

function getRandomCost(endpoint: string): number {
  // Cost based on endpoint complexity
  const costs: Record<string, number> = {
    '/api/search': 0.5,
    '/api/analytics': 0.8,
    '/api/payments': 0.3,
    '/api/orders': 0.2,
  };

  return costs[endpoint] || randomFloat(0.01, 0.1);
}

// Data generators
async function generateApiTraces() {
  console.log(`[Data Seeder] Generating ${CONFIG.API_TRACES_PER_INTERVAL} API traces...`);

  try {
    const projects = await prisma.project.findMany({ select: { id: true } });
    if (projects.length === 0) {
      console.log('[Data Seeder] No projects found, skipping API trace generation');
      return;
    }

    const traces = [];
    for (let i = 0; i < CONFIG.API_TRACES_PER_INTERVAL; i++) {
      const project = randomChoice(projects);
      const method = randomChoice(CONFIG.METHODS);
      const endpoint = getRandomEndpoint();
      const url = `https://api.example.com${endpoint}`;
      const isError = Math.random() < CONFIG.API_ERROR_RATE;
      const statusCode = getRandomStatusCode(method, isError);
      const duration = getRandomDuration();
      const cost = getRandomCost(endpoint);
      const timestamp = new Date(Date.now() - randomInt(0, 3600000)); // Last hour

      // Find or create device
      let device = await prisma.device.findFirst({
        where: {
          projectId: project.id,
          deviceId: randomDeviceId(),
        },
      });

      if (!device) {
        device = await prisma.device.create({
          data: {
            projectId: project.id,
            deviceId: randomDeviceId(),
            platform: randomChoice(CONFIG.PLATFORMS),
            model: `Model ${randomInt(1, 20)}`,
            appVersion: `1.${randomInt(0, 9)}.${randomInt(0, 9)}`,
          },
        });
      }

      // Find or create session
      let session = await prisma.session.findFirst({
        where: {
          sessionToken: randomSessionToken(),
          projectId: project.id,
        },
      });

      if (!session) {
        const sessionStart = new Date(timestamp.getTime() - randomInt(0, 3600000));
        session = await prisma.session.create({
          data: {
            projectId: project.id,
            deviceId: device.id,
            sessionToken: randomSessionToken(),
            startedAt: sessionStart,
            duration: randomInt(60000, 3600000), // 1min to 1hour
            screenCount: randomInt(5, 50),
            eventCount: randomInt(10, 200),
            country: randomChoice(['US', 'CA', 'GB', 'DE', 'FR', 'JP', 'AU']),
            entryScreen: randomChoice(CONFIG.SCREEN_NAMES),
            exitScreen: randomChoice(CONFIG.SCREEN_NAMES),
          },
        });
      }

      const trace = {
        projectId: project.id,
        deviceId: device.id,
        sessionId: session.id,
        url,
        method,
        statusCode,
        duration: Math.round(duration),
        cost,
        timestamp,
        screenName: randomChoice(CONFIG.SCREEN_NAMES),
        networkType: randomChoice(['wifi', 'cellular', 'ethernet']),
        country: session.country,
        ipAddress: `192.168.1.${randomInt(1, 255)}`,
        userAgent: `App/${device.appVersion} (${device.platform}; ${device.model})`,
      };

      traces.push(trace);
    }

    await prisma.apiTrace.createMany({ data: traces });
    console.log(`[Data Seeder] ✅ Created ${traces.length} API traces`);
  } catch (error) {
    console.error('[Data Seeder] ❌ Error generating API traces:', error);
  }
}

async function generateLogs() {
  console.log(`[Data Seeder] Generating ${CONFIG.LOGS_PER_INTERVAL} logs...`);

  try {
    const projects = await prisma.project.findMany({ select: { id: true } });
    if (projects.length === 0) {
      console.log('[Data Seeder] No projects found, skipping log generation');
      return;
    }

    const logs = [];
    for (let i = 0; i < CONFIG.LOGS_PER_INTERVAL; i++) {
      const project = randomChoice(projects);
      const level = randomChoice(CONFIG.LOG_LEVELS);
      const timestamp = new Date(Date.now() - randomInt(0, 3600000)); // Last hour

      // Find or create device
      let device = await prisma.device.findFirst({
        where: {
          projectId: project.id,
          deviceId: randomDeviceId(),
        },
      });

      if (!device) {
        device = await prisma.device.create({
          data: {
            projectId: project.id,
            deviceId: randomDeviceId(),
            platform: randomChoice(CONFIG.PLATFORMS),
            model: `Model ${randomInt(1, 20)}`,
            appVersion: `1.${randomInt(0, 9)}.${randomInt(0, 9)}`,
          },
        });
      }

      const log = {
        projectId: project.id,
        deviceId: device.id,
        level,
        message: `${level.toUpperCase()}: ${randomChoice([
          'User action performed',
          'Network request completed',
          'Cache miss occurred',
          'Authentication successful',
          'Database query executed',
          'File upload completed',
          'Notification sent',
          'Background task finished',
          'Configuration updated',
          'Error occurred during processing'
        ])}`,
        timestamp,
        tag: randomChoice(['ui', 'network', 'db', 'auth', 'cache', 'file', 'notification']),
        screenName: randomChoice(CONFIG.SCREEN_NAMES),
        buildVersion: device.appVersion,
        platform: device.platform,
      };

      logs.push(log);
    }

    await prisma.log.createMany({ data: logs });
    console.log(`[Data Seeder] ✅ Created ${logs.length} logs`);
  } catch (error) {
    console.error('[Data Seeder] ❌ Error generating logs:', error);
  }
}

async function generateCrashes() {
  if (Math.random() > CONFIG.CRASH_RATE) return; // Only generate crashes sometimes

  console.log(`[Data Seeder] Generating ${CONFIG.CRASHES_PER_INTERVAL} crashes...`);

  try {
    const projects = await prisma.project.findMany({ select: { id: true } });
    if (projects.length === 0) {
      console.log('[Data Seeder] No projects found, skipping crash generation');
      return;
    }

    const crashes = [];
    for (let i = 0; i < CONFIG.CRASHES_PER_INTERVAL; i++) {
      const project = randomChoice(projects);
      const timestamp = new Date(Date.now() - randomInt(0, 3600000)); // Last hour

      // Find or create device
      let device = await prisma.device.findFirst({
        where: {
          projectId: project.id,
          deviceId: randomDeviceId(),
        },
      });

      if (!device) {
        device = await prisma.device.create({
          data: {
            projectId: project.id,
            deviceId: randomDeviceId(),
            platform: randomChoice(CONFIG.PLATFORMS),
            model: `Model ${randomInt(1, 20)}`,
            appVersion: `1.${randomInt(0, 9)}.${randomInt(0, 9)}`,
          },
        });
      }

      const crash = {
        projectId: project.id,
        deviceId: device.id,
        message: randomChoice([
          'NullPointerException: Attempt to invoke virtual method',
          'IndexOutOfBoundsException: Index 5 out of bounds for length 3',
          'NetworkTimeoutException: Connection timed out',
          'OutOfMemoryError: Java heap space',
          'IllegalStateException: Cannot execute task: the task has already been executed',
          'SQLiteException: no such table: users',
          'RuntimeException: Unable to start activity',
          'JSONException: Value null of type java.lang.String cannot be converted to JSONObject',
          'SecurityException: Permission denied',
          'TimeoutException: Operation timed out'
        ]),
        stackTrace: `at com.example.MyClass.method(MyClass.java:123)
at com.example.AnotherClass.callMethod(AnotherClass.java:456)
at android.os.Handler.handleCallback(Handler.java:938)
at android.os.Handler.dispatchMessage(Handler.java:99)`,
        timestamp,
        buildVersion: device.appVersion,
        platform: device.platform,
        osVersion: `Android ${randomInt(10, 14)}`,
        architecture: randomChoice(['arm64-v8a', 'armeabi-v7a', 'x86', 'x86_64']),
        memoryUsage: randomInt(50, 500), // MB
        diskSpace: randomInt(100, 10000), // MB
        batteryLevel: randomInt(10, 100),
        networkType: randomChoice(['wifi', 'cellular', 'none']),
        country: randomChoice(['US', 'CA', 'GB', 'DE', 'FR', 'JP', 'AU']),
        userId: randomInt(1, 10000).toString(),
      };

      crashes.push(crash);
    }

    await prisma.crash.createMany({ data: crashes });
    console.log(`[Data Seeder] ✅ Created ${crashes.length} crashes`);
  } catch (error) {
    console.error('[Data Seeder] ❌ Error generating crashes:', error);
  }
}

async function generateSessions() {
  console.log(`[Data Seeder] Generating ${CONFIG.SESSIONS_PER_INTERVAL} sessions...`);

  try {
    const projects = await prisma.project.findMany({ select: { id: true } });
    if (projects.length === 0) {
      console.log('[Data Seeder] No sessions found, skipping session generation');
      return;
    }

    const sessions = [];
    for (let i = 0; i < CONFIG.SESSIONS_PER_INTERVAL; i++) {
      const project = randomChoice(projects);
      const startedAt = new Date(Date.now() - randomInt(3600000, 86400000)); // 1 hour to 1 day ago
      const duration = randomInt(60000, 3600000); // 1min to 1hour
      const endedAt = new Date(startedAt.getTime() + duration);

      // Find or create device
      let device = await prisma.device.findFirst({
        where: {
          projectId: project.id,
          deviceId: randomDeviceId(),
        },
      });

      if (!device) {
        device = await prisma.device.create({
          data: {
            projectId: project.id,
            deviceId: randomDeviceId(),
            platform: randomChoice(CONFIG.PLATFORMS),
            model: `Model ${randomInt(1, 20)}`,
            appVersion: `1.${randomInt(0, 9)}.${randomInt(0, 9)}`,
          },
        });
      }

      const session = {
        projectId: project.id,
        deviceId: device.id,
        sessionToken: randomSessionToken(),
        startedAt,
        endedAt,
        duration,
        screenCount: randomInt(5, 50),
        eventCount: randomInt(10, 200),
        crashCount: Math.random() < CONFIG.CRASH_RATE ? 1 : 0,
        country: randomChoice(['US', 'CA', 'GB', 'DE', 'FR', 'JP', 'AU']),
        entryScreen: randomChoice(CONFIG.SCREEN_NAMES),
        exitScreen: randomChoice(CONFIG.SCREEN_NAMES),
        firstScreen: randomChoice(CONFIG.SCREEN_NAMES),
        lastScreen: randomChoice(CONFIG.SCREEN_NAMES),
        appVersion: device.appVersion,
        platform: device.platform,
        networkType: randomChoice(['wifi', 'cellular', 'ethernet']),
        carrier: randomChoice(['Verizon', 'AT&T', 'T-Mobile', 'Sprint', 'Vodafone', 'Orange']),
        deviceModel: device.model,
        osVersion: device.platform === 'ios' ? `iOS ${randomInt(14, 17)}.${randomInt(0, 9)}` : `Android ${randomInt(10, 14)}`,
        screenResolution: randomChoice(['375x812', '414x896', '390x844', '428x926', '1080x1920', '1440x2560']),
        timezone: randomChoice(['America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney', 'Pacific/Auckland']),
      };

      sessions.push(session);
    }

    await prisma.session.createMany({ data: sessions });
    console.log(`[Data Seeder] ✅ Created ${sessions.length} sessions`);
  } catch (error) {
    console.error('[Data Seeder] ❌ Error generating sessions:', error);
  }
}

// Main seeder loop
async function startDataSeeder() {
  console.log('[Data Seeder] 🚀 Starting data seeder worker...');
  console.log(`[Data Seeder] Interval: ${CONFIG.INTERVAL_MS}ms`);
  console.log(`[Data Seeder] API Traces: ${CONFIG.API_TRACES_PER_INTERVAL} per interval`);
  console.log(`[Data Seeder] Logs: ${CONFIG.LOGS_PER_INTERVAL} per interval`);
  console.log(`[Data Seeder] Crashes: ${CONFIG.CRASHES_PER_INTERVAL} per interval (when triggered)`);
  console.log(`[Data Seeder] Sessions: ${CONFIG.SESSIONS_PER_INTERVAL} per interval`);

  let iteration = 0;

  const interval = setInterval(async () => {
    iteration++;
    console.log(`\n[Data Seeder] 🔄 Iteration ${iteration} - ${new Date().toISOString()}`);

    try {
      await Promise.all([
        generateApiTraces(),
        generateLogs(),
        generateCrashes(),
        generateSessions(),
      ]);

      console.log(`[Data Seeder] ✅ Iteration ${iteration} completed`);
    } catch (error) {
      console.error(`[Data Seeder] ❌ Error in iteration ${iteration}:`, error);
    }
  }, CONFIG.INTERVAL_MS);

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('[Data Seeder] 🛑 Received SIGINT, stopping data seeder...');
    clearInterval(interval);
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('[Data Seeder] 🛑 Received SIGTERM, stopping data seeder...');
    clearInterval(interval);
    process.exit(0);
  });
}

// Start the seeder
startDataSeeder().catch(console.error);
