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
  DEVICES_PER_INTERVAL: 3, // New devices registering
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
  PLATFORMS: ['ios', 'android', 'web'],
  ENVIRONMENTS: ['production', 'staging', 'development'],
  SCREEN_NAMES: ['Home', 'Profile', 'Settings', 'Dashboard', 'Products', 'Cart', 'Checkout'],
  LOG_LEVELS: ['debug', 'info', 'warn', 'error'],
  
  // Device data
  IOS_MODELS: ['iPhone 15 Pro', 'iPhone 15', 'iPhone 14 Pro', 'iPhone 14', 'iPhone 13', 'iPhone SE', 'iPad Pro', 'iPad Air'],
  ANDROID_MODELS: ['Pixel 8 Pro', 'Pixel 7', 'Galaxy S24', 'Galaxy S23', 'OnePlus 12', 'Xiaomi 14'],
  WEB_MODELS: ['Chrome', 'Safari', 'Firefox', 'Edge'],
  MANUFACTURERS: {
    ios: ['Apple'],
    android: ['Google', 'Samsung', 'OnePlus', 'Xiaomi', 'Motorola'],
    web: ['Google', 'Apple', 'Mozilla', 'Microsoft']
  },
  USER_NAMES: ['John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Wilson', 'Carol Davis', 'David Brown', 'Emma Martinez', 'Frank Lee'],
  DOMAINS: ['gmail.com', 'yahoo.com', 'outlook.com', 'icloud.com', 'proton.me'],
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

function generateDeviceCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${part1}-${part2}`;
}

function generateUserEmail(name: string): string {
  const firstName = name.split(' ')[0].toLowerCase();
  const domain = randomChoice(CONFIG.DOMAINS);
  return `${firstName}.${randomInt(100, 999)}@${domain}`;
}

function getModelForPlatform(platform: string): string {
  if (platform === 'ios') return randomChoice(CONFIG.IOS_MODELS);
  if (platform === 'android') return randomChoice(CONFIG.ANDROID_MODELS);
  if (platform === 'web') return randomChoice(CONFIG.WEB_MODELS);
  return 'Unknown';
}

function getManufacturerForPlatform(platform: string): string {
  const manufacturers = CONFIG.MANUFACTURERS[platform as keyof typeof CONFIG.MANUFACTURERS];
  return manufacturers ? randomChoice(manufacturers) : 'Unknown';
}

function getOsVersion(platform: string): string {
  if (platform === 'ios') return `${randomInt(15, 17)}.${randomInt(0, 5)}.${randomInt(0, 3)}`;
  if (platform === 'android') return `${randomInt(11, 14)}.0`;
  if (platform === 'web') return `${randomInt(110, 125)}.0.${randomInt(5000, 6000)}.0`;
  return '1.0.0';
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
async function generateDevices() {
  console.log(`[Data Seeder] Generating ${CONFIG.DEVICES_PER_INTERVAL} devices...`);

  try {
    const projects = await prisma.project.findMany({ select: { id: true } });
    if (projects.length === 0) {
      console.log('[Data Seeder] No projects found, skipping device generation');
      return;
    }

    const devices = [];
    for (let i = 0; i < CONFIG.DEVICES_PER_INTERVAL; i++) {
      const project = randomChoice(projects);
      const platform = randomChoice(CONFIG.PLATFORMS);
      const model = getModelForPlatform(platform);
      const manufacturer = getManufacturerForPlatform(platform);
      const osVersion = getOsVersion(platform);
      const appVersion = `${randomInt(1, 3)}.${randomInt(0, 9)}.${randomInt(0, 9)}`;
      const deviceCode = generateDeviceCode();
      
      // 30% chance device has a user associated
      const hasUser = Math.random() < 0.3;
      const userName = hasUser ? randomChoice(CONFIG.USER_NAMES) : null;
      const userEmail = hasUser && userName ? generateUserEmail(userName) : null;
      const userId = hasUser ? `user_${randomInt(10000, 99999)}` : null;
      
      // Generate metadata
      const metadata = {
        sdkVersion: `${randomInt(1, 3)}.${randomInt(0, 5)}.0`,
        installDate: new Date(Date.now() - randomInt(0, 90) * 24 * 60 * 60 * 1000).toISOString(),
        language: randomChoice(['en', 'es', 'fr', 'de', 'ja', 'pt', 'zh']),
        region: randomChoice(['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'JP', 'BR']),
        timeZone: randomChoice(['America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney']),
      };

      const device = {
        projectId: project.id,
        deviceId: `device_${Date.now()}_${randomInt(10000, 99999)}`,
        platform,
        environment: randomChoice(CONFIG.ENVIRONMENTS),
        osVersion,
        appVersion,
        model,
        manufacturer,
        deviceCode,
        userId,
        userEmail,
        userName,
        metadata,
        debugModeEnabled: false,
        status: 'active',
        lastSeenAt: new Date(),
        createdAt: new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000), // Last 30 days
      };

      devices.push(device);
    }

    await prisma.device.createMany({ data: devices });
    console.log(`[Data Seeder] ✅ Created ${devices.length} devices`);
  } catch (error) {
    console.error('[Data Seeder] ❌ Error generating devices:', error);
  }
}

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
            environment: randomChoice(CONFIG.ENVIRONMENTS),
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
            environment: randomChoice(CONFIG.ENVIRONMENTS),
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
            environment: randomChoice(CONFIG.ENVIRONMENTS),
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
            environment: randomChoice(CONFIG.ENVIRONMENTS),
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
        errorCount: randomInt(0, 5), // Add errorCount which exists in schema
        entryScreen: randomChoice(CONFIG.SCREEN_NAMES),
        exitScreen: randomChoice(CONFIG.SCREEN_NAMES),
        screenFlow: Array.from({ length: randomInt(3, 10) }, () => randomChoice(CONFIG.SCREEN_NAMES)), // Array of screens
        appVersion: device.appVersion,
        osVersion: device.platform === 'ios' ? `iOS ${randomInt(14, 17)}.${randomInt(0, 9)}` : `Android ${randomInt(10, 14)}`,
        networkType: randomChoice(['wifi', 'cellular', 'ethernet']),
        locale: randomChoice(['en_US', 'en_GB', 'fr_FR', 'de_DE', 'ja_JP', 'es_ES']),
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
  console.log(`[Data Seeder] Devices: ${CONFIG.DEVICES_PER_INTERVAL} per interval`);
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
        generateDevices(),
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
