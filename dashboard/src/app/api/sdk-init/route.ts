import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHash } from 'crypto'
import { getActiveBuild } from '@/lib/build'

/**
 * Combined SDK Initialization Endpoint
 *
 * Returns all configuration data needed for SDK initialization in a single request:
 * - Feature Flags
 * - SDK Settings
 * - Business Config
 *
 * This reduces 3 sequential HTTP requests to 1, significantly improving app startup time.
 *
 * Performance optimizations:
 * - Parallel database queries using Promise.all()
 * - Edge caching headers (60s cache, 5min stale-while-revalidate)
 * - ETag support for conditional requests (304 Not Modified)
 * - Minimal response payload
 */

/**
 * Generate ETag from response data
 * Uses MD5 hash of JSON stringified data (fast and sufficient for cache validation)
 */
function generateETag(data: object): string {
  const hash = createHash('md5')
    .update(JSON.stringify(data))
    .digest('hex')
  return `"${hash}"`
}

// Default feature flags
const DEFAULT_FEATURE_FLAGS = {
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

// Default SDK settings
const DEFAULT_SDK_SETTINGS = {
  trackingMode: 'all',
  captureRequestBodies: true,
  captureResponseBodies: true,
  capturePrintStatements: false,
  sanitizeSensitiveData: true,
  sensitiveFieldPatterns: ['password', 'token', 'secret', 'apiKey', 'api_key', 'authorization', 'cookie'],
  maxLogQueueSize: 100,
  maxTraceQueueSize: 50,
  flushIntervalSeconds: 30,
  enableBatching: true,
  minLogLevel: 'debug',
  verboseErrors: false,
}

// Helper to extract business config value based on type
function extractValue(config: {
  valueType: string
  stringValue: string | null
  integerValue: number | null
  booleanValue: boolean | null
  decimalValue: number | null
  jsonValue: unknown
  imageUrl: string | null
}) {
  switch (config.valueType) {
    case 'string': return config.stringValue
    case 'integer': return config.integerValue
    case 'boolean': return config.booleanValue
    case 'decimal': return config.decimalValue
    case 'json': return config.jsonValue
    case 'image': return config.imageUrl
    default: return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key')
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get('deviceId') // Platform device ID to look up device config
    const buildMode = searchParams.get('buildMode') as 'preview' | 'production' | null // 'preview' for debug builds, 'production' for release builds

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key required. Use X-API-Key header.' },
        { status: 401 }
      )
    }

    // First, validate API key and get project ID
    const project = await prisma.project.findUnique({
      where: { apiKey },
      select: { id: true, userId: true }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }

    // Validate subscription
    const { validateSubscription } = await import('@/lib/subscription-validation')
    const validation = await validateSubscription(project.userId)
    if (!validation.valid) {
      return NextResponse.json({
        error: validation.error || 'Subscription invalid',
        message: validation.error || 'Please upgrade your subscription to continue using DevBridge.',
        sdkEnabled: false,
      }, { status: 403 })
    }

    const projectId = project.id

    // Check if build mode is requested and get active build
    let activeBuild: Awaited<ReturnType<typeof getActiveBuild>> = null
    let buildBusinessConfig: { configs: Record<string, unknown>; meta: Record<string, any> } | null = null
    let buildLocalization: any = null

    if (buildMode === 'preview' || buildMode === 'production') {
      activeBuild = await getActiveBuild(projectId, buildMode)
      if (activeBuild) {
        // Use build snapshot data instead of live data
        if (activeBuild.businessConfigSnapshot) {
          buildBusinessConfig = activeBuild.businessConfigSnapshot as any
        }
        if (activeBuild.localizationSnapshot) {
          buildLocalization = activeBuild.localizationSnapshot as any
        }
      }
    }

    // Fetch all data in PARALLEL for maximum performance
    const [featureFlags, sdkSettings, businessConfigs, apiConfigs, device, languages, defaultLanguageTranslations] = await Promise.all([
      // Feature Flags
      prisma.featureFlags.findUnique({
        where: { projectId },
        select: {
          sdkEnabled: true,
          apiTracking: true,
          screenTracking: true,
          crashReporting: true,
          logging: true,
          deviceTracking: true,
          sessionTracking: true,
          businessConfig: true,
          localization: true,
          offlineSupport: true,
          batchEvents: true,
        }
      }),

      // SDK Settings (including trackingMode)
      prisma.sdkSettings.findUnique({
        where: { projectId },
        select: {
          trackingMode: true,
          captureRequestBodies: true,
          captureResponseBodies: true,
          capturePrintStatements: true,
          sanitizeSensitiveData: true,
          sensitiveFieldPatterns: true,
          maxLogQueueSize: true,
          maxTraceQueueSize: true,
          flushIntervalSeconds: true,
          enableBatching: true,
          minLogLevel: true,
          verboseErrors: true,
        }
      }),

      // Business Configs (enabled only)
      prisma.businessConfig.findMany({
        where: { projectId, isEnabled: true },
        select: {
          key: true,
          valueType: true,
          stringValue: true,
          integerValue: true,
          booleanValue: true,
          decimalValue: true,
          jsonValue: true,
          imageUrl: true,
          category: true,
          version: true,
        }
      }),

      // API Configs (for per-endpoint settings)
      prisma.apiConfig.findMany({
        where: { projectId, isEnabled: true },
        select: {
          endpoint: true,
          method: true,
          enableLogs: true,
          captureRequestBody: true,
          captureResponseBody: true,
          costPerRequest: true,
        }
      }),

      // Device (if deviceId provided) - for device-specific config
      // Note: Using findFirst because there's no unique constraint on projectId+deviceId
      // (projectId is nullable, so uniqueness is enforced at application level)
      deviceId
        ? prisma.device.findFirst({
            where: {
              projectId,
              deviceId,
              status: 'active' // Only get active devices
            },
            select: {
              id: true,
              deviceCode: true,
              debugModeEnabled: true,
              debugModeExpiresAt: true
            }
          })
        : Promise.resolve(null),

      // Languages (for localization)
      prisma.language.findMany({
        where: { projectId, isEnabled: true },
        select: {
          id: true,
          code: true,
          name: true,
          nativeName: true,
          isDefault: true,
          isEnabled: true,
          isRTL: true,
        },
        orderBy: { isDefault: 'desc' }
      }),

      // Default language translations (if localization feature is enabled)
      // We'll check feature flags later, but fetch translations in parallel
      (async () => {
        const defaultLang = await prisma.language.findFirst({
          where: { projectId, isDefault: true, isEnabled: true },
          select: { id: true, code: true }
        })
        if (!defaultLang) return null

        const translations = await prisma.translation.findMany({
          where: {
            projectId,
            languageId: defaultLang.id
          },
          include: {
            key: {
              select: {
                key: true,
                category: true
              }
            }
          }
        })

        // Format as key-value object
        const translationsObject: Record<string, string> = {}
        for (const t of translations) {
          translationsObject[t.key.key] = t.value
        }

        return {
          languageCode: defaultLang.code,
          translations: translationsObject
        }
      })()
    ])

    // Use build snapshot if available, otherwise use live data
    let configMap: Record<string, unknown> = {}
    let configMeta: Record<string, { type: string; category: string | null; version: number }> = {}

    if (buildBusinessConfig) {
      // Use build snapshot
      configMap = buildBusinessConfig.configs || {}
      configMeta = buildBusinessConfig.meta || {}
    } else {
      // Transform live business configs to key-value format
      for (const config of businessConfigs) {
        configMap[config.key] = extractValue(config)
        configMeta[config.key] = {
          type: config.valueType,
          category: config.category,
          version: config.version,
        }
      }
    }

    // Compute device config
    const effectiveSettings = sdkSettings || DEFAULT_SDK_SETTINGS
    const effectiveFlags = featureFlags || DEFAULT_FEATURE_FLAGS
    
    // Get tracking mode (defaults to 'all' if not set)
    const trackingMode = effectiveSettings.trackingMode || 'all'

    // Build device config (only if device was found)
    // Check if debug mode is expired
    const now = new Date()
    const isDebugExpired = device?.debugModeExpiresAt && device.debugModeExpiresAt < now
    const effectiveDebugMode = device?.debugModeEnabled && !isDebugExpired

    // Compute trackingEnabled based on:
    // 1. SDK enabled flag (master kill switch)
    // 2. Tracking mode setting
    // 3. Device debug mode status
    let trackingEnabled = effectiveFlags.sdkEnabled

    if (trackingEnabled) {
      // Check tracking mode
      if (trackingMode === 'none') {
        trackingEnabled = false
      } else if (trackingMode === 'debug_only') {
        // Only track if device has debug mode enabled
        trackingEnabled = !!effectiveDebugMode
      }
      // trackingMode === 'all' -> keep trackingEnabled = true
    }

    const deviceConfig = device ? {
      deviceId: device.id,
      deviceCode: device.deviceCode,
      debugModeEnabled: effectiveDebugMode,
      debugModeExpiresAt: device.debugModeExpiresAt?.toISOString() || null,
      trackingEnabled,
    } : {
      // Default config when device not found (new device)
      deviceCode: null,
      debugModeEnabled: false,
      debugModeExpiresAt: null,
      trackingEnabled, // Use computed value (respects tracking mode)
    }

    // Build config data (without timestamp - used for ETag)
    const configData: any = {
      featureFlags: featureFlags || DEFAULT_FEATURE_FLAGS,
      sdkSettings: {
        settings: effectiveSettings,
        apiConfigs: apiConfigs || [],
      },
      businessConfig: {
        configs: configMap,
        meta: configMeta,
      },
      deviceConfig,
    }

    // Include localization if available from build snapshot OR fetch live data
    if (buildLocalization) {
      // Use build snapshot localization
      configData.localization = buildLocalization
    } else if ((featureFlags || DEFAULT_FEATURE_FLAGS).localization && languages && languages.length > 0) {
      // Include live localization data
      const languagesList = languages.map(lang => ({
        id: lang.id,
        code: lang.code,
        name: lang.name,
        nativeName: lang.nativeName,
        isDefault: lang.isDefault,
        isEnabled: lang.isEnabled,
        isRTL: lang.isRTL,
      }))

      configData.localization = {
        languages: languagesList,
        translations: defaultLanguageTranslations?.translations || {},
        defaultLanguage: defaultLanguageTranslations?.languageCode || languagesList.find(l => l.isDefault)?.code || languagesList[0]?.code,
      }
    }

    // Include build info if using build snapshot
    if (activeBuild) {
      configData.build = {
        version: activeBuild.version,
        name: activeBuild.name,
        mode: activeBuild.mode,
        createdAt: activeBuild.createdAt.toISOString(),
      }
    }

    // Generate ETag from config data (excludes timestamp)
    const etag = generateETag(configData)

    // Check for conditional request (If-None-Match)
    const ifNoneMatch = request.headers.get('if-none-match')
    if (ifNoneMatch === etag) {
      // Config hasn't changed - return 304 Not Modified
      return new NextResponse(null, {
        status: 304,
        headers: {
          'ETag': etag,
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          'Vary': 'X-API-Key, If-None-Match',
        }
      })
    }

    // Build full response with timestamp
    const responseData = {
      ...configData,
      timestamp: new Date().toISOString(),
    }

    // Return response with edge caching headers and ETag
    return new NextResponse(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'ETag': etag,
        // Edge caching: cache for 60s, serve stale for up to 5 min while revalidating
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        // Allow CDN to vary cache by API key and conditional request
        'Vary': 'X-API-Key, If-None-Match',
      }
    })
  } catch (error) {
    console.error('SDK init error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && {
          details: errorMessage,
          stack: errorStack
        })
      },
      { status: 500 }
    )
  }
}
