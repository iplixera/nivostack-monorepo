/**
 * Unified Device Query State
 * Single source of truth for all device filtering across summary, facets, and list APIs
 */

export type TimeRangePreset = '24h' | '7d' | '30d' | 'all'

export type DeviceQuery = {
    // Search
    q?: string

    // Filters
    platform?: 'android' | 'ios' | 'web' | 'other' | 'all'
    environment?: string | 'all'
    debug?: 'all' | 'on' | 'off'
    appVersion?: string | 'all'
    osVersion?: string | 'all'

    // Time range
    timeRange?: {
        preset: TimeRangePreset
        from?: string
        to?: string
    }

    // Sorting
    sort?: {
        field: 'lastSeenAt' | 'createdAt' | 'appVersion' | 'osVersion'
        dir: 'asc' | 'desc'
    }

    // Pagination
    page?: number
    pageSize?: number
}

/**
 * Parse query from URL search params
 */
export function parseDeviceQuery(searchParams: URLSearchParams): DeviceQuery {
    const query: DeviceQuery = {
        q: searchParams.get('q') || undefined,
        platform: (searchParams.get('platform') as any) || 'all',
        environment: searchParams.get('environment') || 'all',
        debug: (searchParams.get('debug') as any) || 'all',
        appVersion: searchParams.get('appVersion') || 'all',
        osVersion: searchParams.get('osVersion') || 'all',
        timeRange: {
            preset: (searchParams.get('timeRange') as TimeRangePreset) || '24h',
            from: searchParams.get('from') || undefined,
            to: searchParams.get('to') || undefined,
        },
        sort: {
            field: (searchParams.get('sortField') as any) || 'lastSeenAt',
            dir: (searchParams.get('sortDir') as any) || 'desc',
        },
        page: parseInt(searchParams.get('page') || '1'),
        pageSize: parseInt(searchParams.get('pageSize') || '50'),
    }

    return query
}

/**
 * Serialize query to URL search params
 */
export function serializeDeviceQuery(query: DeviceQuery): string {
    const params = new URLSearchParams()

    if (query.q) params.set('q', query.q)
    if (query.platform && query.platform !== 'all') params.set('platform', query.platform)
    if (query.environment && query.environment !== 'all') params.set('environment', query.environment)
    if (query.debug && query.debug !== 'all') params.set('debug', query.debug)
    if (query.appVersion && query.appVersion !== 'all') params.set('appVersion', query.appVersion)
    if (query.osVersion && query.osVersion !== 'all') params.set('osVersion', query.osVersion)

    if (query.timeRange?.preset && query.timeRange.preset !== '24h') {
        params.set('timeRange', query.timeRange.preset)
    }
    if (query.timeRange?.from) params.set('from', query.timeRange.from)
    if (query.timeRange?.to) params.set('to', query.timeRange.to)

    if (query.sort?.field && query.sort.field !== 'lastSeenAt') {
        params.set('sortField', query.sort.field)
    }
    if (query.sort?.dir && query.sort.dir !== 'desc') {
        params.set('sortDir', query.sort.dir)
    }

    if (query.page && query.page !== 1) params.set('page', query.page.toString())
    if (query.pageSize && query.pageSize !== 50) params.set('pageSize', query.pageSize.toString())

    return params.toString()
}

/**
 * Build Prisma where clause from DeviceQuery
 * @param query The device query
 * @param excludeFacet Optional facet dimension to exclude (for facet distribution calculation)
 */
export function buildDeviceWhere(query: DeviceQuery, projectId: string, excludeFacet?: 'platform' | 'environment' | 'appVersion' | 'osVersion') {
    const where: any = { projectId, status: 'active' }

    // Search
    if (query.q) {
        where.OR = [
            { deviceId: { contains: query.q, mode: 'insensitive' } },
            { deviceCode: { contains: query.q, mode: 'insensitive' } },
            { model: { contains: query.q, mode: 'insensitive' } },
            { manufacturer: { contains: query.q, mode: 'insensitive' } },
            { userEmail: { contains: query.q, mode: 'insensitive' } },
            { userId: { contains: query.q, mode: 'insensitive' } },
        ]
    }

    // Platform filter (skip if this is the facet dimension)
    if (query.platform && query.platform !== 'all' && excludeFacet !== 'platform') {
        where.platform = query.platform
    }

    // Environment filter (skip if this is the facet dimension)
    if (query.environment && query.environment !== 'all' && excludeFacet !== 'environment') {
        where.environment = query.environment
    }

    // Debug filter
    if (query.debug && query.debug !== 'all') {
        where.debugModeEnabled = query.debug === 'on'
    }

    // App version filter (skip if this is the facet dimension)
    if (query.appVersion && query.appVersion !== 'all' && excludeFacet !== 'appVersion') {
        where.appVersion = query.appVersion
    }

    // OS version filter (skip if this is the facet dimension)
    if (query.osVersion && query.osVersion !== 'all' && excludeFacet !== 'osVersion') {
        where.osVersion = query.osVersion
    }

    // Time range for "last seen" (affects active/recent counts)
    if (query.timeRange?.preset && query.timeRange.preset !== 'all') {
        const now = Date.now()
        let cutoff: Date

        if (query.timeRange.preset === '24h') {
            cutoff = new Date(now - 24 * 60 * 60 * 1000)
        } else if (query.timeRange.preset === '7d') {
            cutoff = new Date(now - 7 * 24 * 60 * 60 * 1000)
        } else if (query.timeRange.preset === '30d') {
            cutoff = new Date(now - 30 * 24 * 60 * 60 * 1000)
        }

        // For time range, we filter lastSeenAt
        if (cutoff!) {
            where.lastSeenAt = { gte: cutoff }
        }
    }

    // Custom time range
    if (query.timeRange?.from || query.timeRange?.to) {
        where.lastSeenAt = {}
        if (query.timeRange.from) where.lastSeenAt.gte = new Date(query.timeRange.from)
        if (query.timeRange.to) where.lastSeenAt.lte = new Date(query.timeRange.to)
    }

    return where
}

/**
 * Get time cutoff for "new devices" calculation
 */
export function getNewDevicesCutoff(query: DeviceQuery): Date | null {
    if (!query.timeRange?.preset || query.timeRange.preset === 'all') {
        return new Date(Date.now() - 24 * 60 * 60 * 1000) // Default to 24h
    }

    const now = Date.now()
    if (query.timeRange.preset === '24h') {
        return new Date(now - 24 * 60 * 60 * 1000)
    } else if (query.timeRange.preset === '7d') {
        return new Date(now - 7 * 24 * 60 * 60 * 1000)
    } else if (query.timeRange.preset === '30d') {
        return new Date(now - 30 * 24 * 60 * 60 * 1000)
    }

    if (query.timeRange.from) {
        return new Date(query.timeRange.from)
    }

    return null
}

