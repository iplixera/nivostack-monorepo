const API_BASE = process.env.NEXT_PUBLIC_APP_URL || ''

// Common pagination types
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginationResponse {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

type FetchOptions = {
  method?: string
  body?: unknown
  token?: string
  headers?: Record<string, string>
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body, token, headers: customHeaders } = options

  const headers: Record<string, string> = {}

  // Don't set Content-Type for FormData (browser will set it with boundary)
  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Merge custom headers
  if (customHeaders) {
    Object.assign(headers, customHeaders)
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined)
  })

  const data = await res.json()

  if (!res.ok) {
    const errorMessage = data.error || `HTTP ${res.status}: ${res.statusText}`
    const errorDetails = data.details ? `\nDetails: ${data.details}` : ''
    throw new Error(`${errorMessage}${errorDetails}`)
  }

  return data
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      fetchApi<{ user: { id: string; email: string; name: string }; token: string }>(
        '/api/auth/login',
        { method: 'POST', body: { email, password } }
      ),
    register: (email: string, password: string, name?: string) =>
      fetchApi<{ user: { id: string; email: string; name: string }; token: string }>(
        '/api/auth/register',
        { method: 'POST', body: { email, password, name } }
      )
  },
  plans: {
    list: () =>
      fetchApi<{ plans: Array<{
        id: string;
        name: string;
        displayName: string;
        description: string | null;
        price: number;
        currency: string;
        interval: string;
        maxProjects: number | null;
        maxDevices: number | null;
        maxApiTraces: number | null;
        maxApiEndpoints: number | null;
        maxApiRequests: number | null;
        maxLogs: number | null;
        maxSessions: number | null;
        maxCrashes: number | null;
        maxBusinessConfigKeys: number | null;
        maxLocalizationLanguages: number | null;
        maxLocalizationKeys: number | null;
        retentionDays: number | null;
        allowCustomDomains: boolean;
        allowWebhooks: boolean;
        allowTeamMembers: boolean;
        allowPrioritySupport: boolean;
        isActive: boolean;
      }> }>(
        '/api/plans'
      )
  },
  projects: {
    list: (token: string) =>
      fetchApi<{ projects: Array<{ id: string; name: string; apiKey: string; createdAt: string; _count: { devices: number; logs: number; crashes: number; apiTraces: number } }> }>(
        '/api/projects',
        { token }
      ),
    create: (name: string, token: string) =>
      fetchApi<{ project: { id: string; name: string; apiKey: string } }>(
        '/api/projects',
        { method: 'POST', body: { name }, token }
      ),
    update: (projectId: string, name: string, token: string) =>
      fetchApi<{ project: { id: string; name: string; apiKey: string } }>(
        `/api/projects/${projectId}`,
        { method: 'PATCH', body: { name }, token }
      ),
    delete: (projectId: string, token: string) =>
      fetchApi<{ success: boolean }>(
        `/api/projects/${projectId}`,
        { method: 'DELETE', token }
      )
  },
  devices: {
    list: (projectId: string, token: string, params?: {
      platform?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
      debugMode?: string;
      deviceCategory?: string;
      deviceBrand?: string;
      language?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: string;
    }) =>
      fetchApi<{
        devices: Array<{
          id: string;
          deviceId: string;
          platform: string;
          osVersion: string;
          appVersion: string;
          model: string;
          manufacturer: string;
          metadata: Record<string, unknown> | null;
          lastSeenAt: string;
          createdAt: string;
          // Device debug mode fields
          deviceCode?: string;
          userId?: string;
          userEmail?: string;
          userName?: string;
          debugModeEnabled?: boolean;
          debugModeEnabledAt?: string;
          debugModeExpiresAt?: string;
          debugModeEnabledBy?: string;
        }>;
        stats: {
          total: number;
          android: number;
          ios: number;
          today: number;
          thisWeek: number;
          thisMonth: number;
          debugModeCount: number;
        };
        pagination: PaginationResponse;
      }>(
        `/api/devices?projectId=${projectId}${params?.platform ? `&platform=${params.platform}` : ''}${params?.startDate ? `&startDate=${params.startDate}` : ''}${params?.endDate ? `&endDate=${params.endDate}` : ''}${params?.search ? `&search=${encodeURIComponent(params.search)}` : ''}${params?.debugMode ? `&debugMode=${params.debugMode}` : ''}${params?.deviceCategory ? `&deviceCategory=${encodeURIComponent(params.deviceCategory)}` : ''}${params?.deviceBrand ? `&deviceBrand=${encodeURIComponent(params.deviceBrand)}` : ''}${params?.language ? `&language=${encodeURIComponent(params.language)}` : ''}${params?.page ? `&page=${params.page}` : ''}${params?.limit ? `&limit=${params.limit}` : ''}${params?.sortBy ? `&sortBy=${params.sortBy}` : ''}${params?.sortOrder ? `&sortOrder=${params.sortOrder}` : ''}`,
        { token }
      ),
    getNotes: (deviceId: string, token: string) =>
      fetchApi<{ notes: Array<{ id: string; content: string; author: string; authorId: string; createdAt: string }> }>(
        `/api/devices/${deviceId}/notes`,
        { token }
      ),
    addNote: (deviceId: string, content: string, token: string) =>
      fetchApi<{ notes: Array<{ id: string; content: string; author: string; authorId: string; createdAt: string }> }>(
        `/api/devices/${deviceId}/notes`,
        { method: 'POST', body: { content }, token }
      ),
    deleteNote: (deviceId: string, noteId: string, token: string) =>
      fetchApi<{ notes: Array<{ id: string; content: string; author: string; authorId: string; createdAt: string }> }>(
        `/api/devices/${deviceId}/notes?noteId=${noteId}`,
        { method: 'DELETE', token }
      ),
    updateTags: (deviceId: string, tags: string[], token: string) =>
      fetchApi<{ device: { id: string; tags: string[] } }>(
        `/api/devices/${deviceId}/tags`,
        { method: 'PATCH', body: { tags }, token }
      ),
    compare: (deviceIds: string[], token: string) =>
      fetchApi<{
        comparison: {
          devices: Array<{
            id: string;
            deviceId: string;
            deviceCode: string | null;
            platform: string;
            osVersion: string | null;
            appVersion: string | null;
            model: string | null;
            manufacturer: string | null;
            user: string | null;
            debugModeEnabled: boolean;
            debugModeExpiresAt: Date | null;
            fingerprint: string | null;
            batteryLevel: number | null;
            storageFree: bigint | null;
            memoryTotal: bigint | null;
            networkType: string | null;
            screenWidth: number | null;
            screenHeight: number | null;
            screenDensity: number | null;
            cpuArchitecture: string | null;
            tags: string[];
            state: string;
            lastSeenAt: Date;
            createdAt: Date;
            stats: {
              logs: number;
              crashes: number;
              apiTraces: number;
              sessions: number;
            };
            metadata: Record<string, unknown> | null;
          }>;
          comparedAt: string;
        };
      }>(
        `/api/devices/compare?ids=${deviceIds.join(',')}`,
        { token }
      ),
    export: (projectId: string, format: 'csv' | 'json', token: string) =>
      fetch(`${API_BASE}/api/devices/export?projectId=${projectId}&format=${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then(res => {
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`)
          })
        }
        return format === 'csv' ? res.text() : res.json()
      })
  },
  logs: {
    list: (projectId: string, token: string, params?: {
      deviceId?: string;
      level?: string;
      tag?: string;
      search?: string;
      screenName?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
      offset?: number
    }) =>
      fetchApi<{
        logs: Array<{
          id: string;
          level: string;
          message: string;
          tag: string | null;
          data: Record<string, unknown> | null;
          fileName: string | null;
          lineNumber: number | null;
          functionName: string | null;
          className: string | null;
          screenName: string | null;
          threadName: string | null;
          timestamp: string;
          device?: { deviceId: string; platform: string; model: string };
          session?: { id: string; sessionToken: string };
        }>;
        total: number;
        pagination: PaginationResponse;
        levels: { verbose: number; debug: number; info: number; warn: number; error: number; assert: number };
        tags: string[];
        screenNames: string[];
      }>(
        `/api/logs?projectId=${projectId}${params?.deviceId ? `&deviceId=${params.deviceId}` : ''}${params?.level ? `&level=${params.level}` : ''}${params?.tag ? `&tag=${encodeURIComponent(params.tag)}` : ''}${params?.search ? `&search=${encodeURIComponent(params.search)}` : ''}${params?.screenName ? `&screenName=${encodeURIComponent(params.screenName)}` : ''}${params?.startDate ? `&startDate=${params.startDate}` : ''}${params?.endDate ? `&endDate=${params.endDate}` : ''}${params?.page ? `&page=${params.page}` : ''}${params?.limit ? `&limit=${params.limit}` : ''}${params?.offset ? `&offset=${params.offset}` : ''}`,
        { token }
      ),
    clear: (projectId: string, token: string, params?: { level?: string; olderThan?: string }) =>
      fetchApi<{ message: string; count: number }>(
        `/api/logs?projectId=${projectId}${params?.level ? `&level=${params.level}` : ''}${params?.olderThan ? `&olderThan=${params.olderThan}` : ''}`,
        { method: 'DELETE', token }
      )
  },
  crashes: {
    list: (projectId: string, token: string, params?: {
      platform?: string;
      deviceId?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: string;
    }) => {
      const queryParams = new URLSearchParams({ projectId })
      if (params?.platform) queryParams.append('platform', params.platform)
      if (params?.deviceId) queryParams.append('deviceId', params.deviceId)
      if (params?.search) queryParams.append('search', params.search)
      if (params?.startDate) queryParams.append('startDate', params.startDate)
      if (params?.endDate) queryParams.append('endDate', params.endDate)
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
      
      return fetchApi<{
        crashes: Array<{
          id: string;
          message: string;
          stackTrace: string | null;
          metadata: Record<string, unknown> | null;
          timestamp: string;
          device?: { deviceId: string; platform: string; model: string | null };
        }>;
        total: number;
        limit: number;
        offset: number;
        pagination: PaginationResponse;
        platforms: string[];
        devices: Array<{ id: string; deviceId: string; platform: string; model: string | null }>;
      }>(`/api/crashes?${queryParams.toString()}`, { token })
    }
  },
  traces: {
    list: (projectId: string, token: string, params?: { deviceId?: string; method?: string; screenName?: string; groupByDevice?: boolean; page?: number; limit?: number; offset?: number }) =>
      fetchApi<{
        traces: Array<{
          id: string;
          url: string;
          method: string;
          statusCode: number;
          duration: number;
          error: string;
          timestamp: string;
          requestHeaders?: Record<string, string>;
          requestBody?: string;
          responseHeaders?: Record<string, string>;
          responseBody?: string;
          screenName?: string;
          networkType?: string;
          country?: string;
          carrier?: string;
          ipAddress?: string;
          userAgent?: string;
          cost?: number;
          device?: { deviceId: string; platform: string; model: string }
        }>;
        total: number;
        pagination: PaginationResponse;
        screenNames: string[];
        devices: Array<{ id: string; deviceId: string; platform: string; model: string }>;
        groupedTraces?: Array<{
          device: { id: string; deviceId: string; platform: string; model: string };
          traces: Array<{ id: string; url: string; method: string; statusCode: number; duration: number; timestamp: string }>;
          count: number;
        }>;
      }>(
        `/api/traces?projectId=${projectId}${params?.deviceId ? `&deviceId=${params.deviceId}` : ''}${params?.method ? `&method=${params.method}` : ''}${params?.screenName ? `&screenName=${params.screenName}` : ''}${params?.groupByDevice ? `&groupByDevice=true` : ''}${params?.page ? `&page=${params.page}` : ''}${params?.limit ? `&limit=${params.limit}` : ''}${params?.offset ? `&offset=${params.offset}` : ''}`,
        { token }
      ),
    clear: (projectId: string, token: string, deviceId?: string) =>
      fetchApi<{ message: string; count: number }>(
        `/api/traces?projectId=${projectId}${deviceId ? `&deviceId=${deviceId}` : ''}`,
        { method: 'DELETE', token }
      )
  },
  config: {
    list: (projectId: string, token: string) =>
      fetchApi<{
        configs: Array<{
          id: string;
          endpoint: string;
          method: string | null;
          name: string | null;
          description: string | null;
          costPerRequest: number;
          isEnabled: boolean;
          createdAt: string;
        }>;
        suggestedEndpoints: Array<{
          endpoint: string;
          method: string;
          fullUrl: string;
        }>;
      }>(
        `/api/config?projectId=${projectId}`,
        { token }
      ),
    create: (projectId: string, token: string, data: { endpoint: string; method?: string; name?: string; description?: string; costPerRequest?: number; isEnabled?: boolean }) =>
      fetchApi<{ config: { id: string; endpoint: string; method: string | null; costPerRequest: number } }>(
        '/api/config',
        { method: 'POST', body: { projectId, ...data }, token }
      ),
    update: (token: string, data: { id: string; endpoint?: string; method?: string; name?: string; description?: string; costPerRequest?: number; isEnabled?: boolean }) =>
      fetchApi<{ config: { id: string; endpoint: string; method: string | null; costPerRequest: number } }>(
        '/api/config',
        { method: 'PUT', body: data, token }
      ),
    delete: (configId: string, token: string) =>
      fetchApi<{ success: boolean }>(
        `/api/config?id=${configId}`,
        { method: 'DELETE', token }
      )
  },
  sessions: {
    list: (projectId: string, token: string, params?: {
      deviceId?: string;
      isActive?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: string;
    }) =>
      fetchApi<{
        sessions: Array<{
          id: string;
          sessionToken: string;
          startedAt: string;
          endedAt: string | null;
          isActive: boolean;
          duration: number | null;
          screenCount: number;
          screenFlow: string[];
          device: { deviceId: string; platform: string; model: string } | null;
          requestCount: number;
          totalCost: number;
        }>;
        pagination: PaginationResponse;
      }>(
        `/api/sessions?projectId=${projectId}${params?.deviceId ? `&deviceId=${params.deviceId}` : ''}${params?.isActive ? `&isActive=${params.isActive}` : ''}${params?.page ? `&page=${params.page}` : ''}${params?.limit ? `&limit=${params.limit}` : ''}${params?.sortBy ? `&sortBy=${params.sortBy}` : ''}${params?.sortOrder ? `&sortOrder=${params.sortOrder}` : ''}`,
        { token }
      ),
    timeline: (sessionId: string, token: string) =>
      fetchApi<{
        session: {
          id: string;
          sessionToken: string;
          startedAt: string;
          endedAt: string | null;
          isActive: boolean;
          duration: number | null;
          screenCount: number;
          eventCount: number;
          errorCount: number;
          appVersion: string | null;
          osVersion: string | null;
          locale: string | null;
          timezone: string | null;
          device: { deviceId: string; platform: string; model: string | null } | null;
        };
        timeline: Array<
          | { type: 'screen'; name: string; timestamp: string }
          | {
              type: 'request';
              id: string;
              method: string;
              url: string;
              endpoint: string;
              statusCode: number | null;
              duration: number | null;
              cost: number | null;
              error: string | null;
              requestBody: string | null;
              responseBody: string | null;
              requestHeaders: unknown;
              responseHeaders: unknown;
              timestamp: string;
            }
          | {
              type: 'log';
              id: string;
              level: string;
              message: string;
              tag: string | null;
              data: unknown;
              fileName: string | null;
              lineNumber: number | null;
              functionName: string | null;
              className: string | null;
              timestamp: string;
            }
        >;
        stats: {
          totalRequests: number;
          totalLogs: number;
          successfulRequests: number;
          failedRequests: number;
          totalCost: number;
        };
      }>(
        `/api/sessions/${sessionId}/timeline`,
        { token }
      )
  },
  analytics: {
    get: (projectId: string, token: string, deviceId?: string) =>
      fetchApi<{
        summary: {
          totalCost: number;
          totalRequests: number;
          uniqueEndpointsCost: number;
          avgCostPerRequest: number;
        };
        endpointCosts: Array<{
          endpoint: string;
          method: string;
          fullUrl: string;
          totalCost: number;
          requestCount: number;
          avgCostPerRequest: number;
        }>;
        deviceCosts: Array<{
          deviceId: string;
          device: { id: string; deviceId: string; platform: string; model: string } | null;
          totalCost: number;
          requestCount: number;
        }>;
        sessionCosts: Array<{
          id: string;
          sessionToken: string;
          startedAt: string;
          endedAt: string | null;
          isActive: boolean;
          device: { deviceId: string; platform: string; model: string } | null;
          requestCount: number;
          totalCost: number;
        }>;
      }>(
        `/api/analytics?projectId=${projectId}${deviceId ? `&deviceId=${deviceId}` : ''}`,
        { token }
      )
  },
  flow: {
    get: (projectId: string, token: string, sessionId?: string) =>
      fetchApi<{
        nodes: Array<{
          id: string;
          name: string;
          requestCount: number;
          totalCost: number;
          successCount: number;
          errorCount: number;
        }>;
        edges: Array<{
          id: string;
          source: string;
          target: string;
          requestCount: number;
          totalCost: number;
          successCount: number;
          errorCount: number;
          sequenceNumber: number;
          topEndpoints: Array<{
            method: string;
            endpoint: string;
            url: string;
            count: number;
            cost: number;
            successRate: number;
            statusCode: number;
            duration: number;
            requestBody?: string;
            responseBody?: string;
          }>;
        }>;
        sessions: Array<{
          id: string;
          sessionToken: string;
          startedAt: string;
          endedAt: string | null;
          isActive: boolean;
          device: { deviceId: string; platform: string; model: string | null } | null;
          requestCount: number;
          totalCost: number;
          screenSequence: string[];
        }>;
      }>(
        `/api/flow?projectId=${projectId}${sessionId ? `&sessionId=${sessionId}` : ''}`,
        { token }
      )
  },
  settings: {
    get: (projectId: string, token: string) =>
      fetchApi<{
        settings: {
          id: string;
          projectId: string;
          emailEnabled: boolean;
          emailAddresses: string[];
          pushEnabled: boolean;
          pushToken: string | null;
          smsEnabled: boolean;
          smsNumbers: string[];
          webhookEnabled: boolean;
          webhookUrl: string | null;
          webhookSecret: string | null;
          webhookHeaders: Record<string, string> | null;
        };
      }>(
        `/api/settings?projectId=${projectId}`,
        { token }
      ),
    update: (projectId: string, token: string, data: {
      emailEnabled?: boolean;
      emailAddresses?: string[];
      pushEnabled?: boolean;
      pushToken?: string;
      smsEnabled?: boolean;
      smsNumbers?: string[];
      webhookEnabled?: boolean;
      webhookUrl?: string;
      webhookSecret?: string;
      webhookHeaders?: Record<string, string>;
    }) =>
      fetchApi<{ settings: Record<string, unknown> }>(
        '/api/settings',
        { method: 'PUT', body: { projectId, ...data }, token }
      )
  },
  featureFlags: {
    get: (projectId: string, token: string) =>
      fetchApi<{
        flags: {
          apiTracking: boolean;
          screenTracking: boolean;
          crashReporting: boolean;
          logging: boolean;
          deviceTracking: boolean;
          sessionTracking: boolean;
          businessConfig: boolean;
          localization: boolean;
          offlineSupport: boolean;
          batchEvents: boolean;
        };
        projectId: string;
      }>(
        `/api/feature-flags?projectId=${projectId}`,
        { token }
      ),
    update: (projectId: string, token: string, flags: Partial<{
      apiTracking: boolean;
      screenTracking: boolean;
      crashReporting: boolean;
      logging: boolean;
      deviceTracking: boolean;
      sessionTracking: boolean;
      businessConfig: boolean;
      localization: boolean;
      offlineSupport: boolean;
      batchEvents: boolean;
    }>) =>
      fetchApi<{
        flags: Record<string, boolean>;
        projectId: string;
      }>(
        '/api/feature-flags',
        { method: 'PUT', body: { projectId, flags }, token }
      )
  },
  alerts: {
    list: (projectId: string, token: string) =>
      fetchApi<{
        alerts: Array<{
          id: string;
          title: string;
          description: string | null;
          endpoint: string | null;
          method: string | null;
          isEnabled: boolean;
          monitorStandardErrors: boolean;
          standardErrorCodes: number[];
          customStatusCodes: number[];
          bodyErrorField: string | null;
          bodyErrorValues: string[];
          headerErrorField: string | null;
          headerErrorValues: string[];
          notifyEmail: boolean;
          notifyPush: boolean;
          notifySms: boolean;
          notifyWebhook: boolean;
          cooldownMinutes: number;
          createdAt: string;
          _count: { monitoredErrors: number };
        }>;
        standardErrorCodes: {
          client: number[];
          server: number[];
        };
      }>(
        `/api/alerts?projectId=${projectId}`,
        { token }
      ),
    create: (projectId: string, token: string, data: {
      title: string;
      description?: string;
      endpoint?: string;
      method?: string;
      isEnabled?: boolean;
      monitorStandardErrors?: boolean;
      standardErrorCodes?: number[];
      customStatusCodes?: number[];
      bodyErrorField?: string;
      bodyErrorValues?: string[];
      headerErrorField?: string;
      headerErrorValues?: string[];
      notifyEmail?: boolean;
      notifyPush?: boolean;
      notifySms?: boolean;
      notifyWebhook?: boolean;
      cooldownMinutes?: number;
    }) =>
      fetchApi<{ alert: Record<string, unknown> }>(
        '/api/alerts',
        { method: 'POST', body: { projectId, ...data }, token }
      ),
    update: (token: string, data: { id: string } & Record<string, unknown>) =>
      fetchApi<{ alert: Record<string, unknown> }>(
        '/api/alerts',
        { method: 'PUT', body: data, token }
      ),
    delete: (alertId: string, token: string) =>
      fetchApi<{ success: boolean }>(
        `/api/alerts?id=${alertId}`,
        { method: 'DELETE', token }
      )
  },
  monitor: {
    list: (projectId: string, token: string, params?: { alertId?: string; isResolved?: boolean; limit?: number; offset?: number }) =>
      fetchApi<{
        errors: Array<{
          id: string;
          alertId: string;
          projectId: string;
          errorType: string;
          errorCode: string;
          endpoint: string;
          method: string;
          statusCode: number | null;
          requestBody: string | null;
          responseBody: string | null;
          firstOccurrence: string;
          lastOccurrence: string;
          occurrenceCount: number;
          affectedDevices: string[];
          affectedSessions: string[];
          lastTraceId: string | null;
          lastNotifiedAt: string | null;
          notificationCount: number;
          isResolved: boolean;
          resolvedAt: string | null;
          resolvedBy: string | null;
          notes: string | null;
          alert: {
            id: string;
            title: string;
            endpoint: string | null;
            method: string | null;
          };
        }>;
        total: number;
        summary: {
          totalErrors: number;
          unresolvedCount: number;
          resolvedCount: number;
          totalOccurrences: number;
        };
      }>(
        `/api/monitor?projectId=${projectId}${params?.alertId ? `&alertId=${params.alertId}` : ''}${params?.isResolved !== undefined ? `&isResolved=${params.isResolved}` : ''}${params?.limit ? `&limit=${params.limit}` : ''}${params?.offset ? `&offset=${params.offset}` : ''}`,
        { token }
      ),
    get: (projectId: string, errorId: string, token: string) =>
      fetchApi<{
        error: Record<string, unknown>;
        traces: Array<Record<string, unknown>>;
      }>(
        `/api/monitor?projectId=${projectId}&errorId=${errorId}`,
        { token }
      ),
    update: (token: string, data: { id: string; isResolved?: boolean; notes?: string }) =>
      fetchApi<{ error: Record<string, unknown> }>(
        '/api/monitor',
        { method: 'PUT', body: data, token }
      ),
    delete: (errorId: string, token: string) =>
      fetchApi<{ success: boolean }>(
        `/api/monitor?id=${errorId}`,
        { method: 'DELETE', token }
      )
  },
  businessConfig: {
    list: (projectId: string, token: string, category?: string) =>
      fetchApi<{
        configs: Array<{
          id: string;
          key: string;
          label: string | null;
          description: string | null;
          valueType: string;
          stringValue: string | null;
          integerValue: number | null;
          booleanValue: boolean | null;
          decimalValue: number | null;
          jsonValue: unknown;
          imageUrl: string | null;
          category: string | null;
          isEnabled: boolean;
          version: number;
          metadata: unknown;
          createdAt: string;
          updatedAt: string;
        }>;
        categories: string[];
      }>(
        `/api/business-config?projectId=${projectId}${category ? `&category=${encodeURIComponent(category)}` : ''}`,
        { token }
      ),
    create: (projectId: string, token: string, data: {
      key: string;
      label?: string;
      description?: string;
      valueType: 'string' | 'integer' | 'boolean' | 'decimal' | 'json' | 'image';
      value: unknown;
      category?: string;
      isEnabled?: boolean;
      metadata?: unknown;
    }) =>
      fetchApi<{ config: Record<string, unknown> }>(
        '/api/business-config',
        { method: 'POST', body: { projectId, ...data }, token }
      ),
    update: (token: string, data: {
      id: string;
      key?: string;
      label?: string;
      description?: string;
      valueType?: 'string' | 'integer' | 'boolean' | 'decimal' | 'json' | 'image';
      value?: unknown;
      category?: string;
      isEnabled?: boolean;
      metadata?: unknown;
    }) =>
      fetchApi<{ config: Record<string, unknown> }>(
        '/api/business-config',
        { method: 'PUT', body: data, token }
      ),
    delete: (configId: string, token: string) =>
      fetchApi<{ success: boolean }>(
        `/api/business-config?id=${configId}`,
        { method: 'DELETE', token }
      ),
    // Change History
    getChanges: (projectId: string, configId: string | undefined, limit: number, token: string) =>
      fetchApi<{ changes: Array<{
        id: string;
        action: string;
        beforeValue: any;
        afterValue: any;
        changes: any;
        userId: string | null;
        userName: string | null;
        createdAt: string;
        config: { key: string; label: string | null };
      }> }>(
        `/api/business-config/changes?projectId=${projectId}${configId ? `&configId=${configId}` : ''}&limit=${limit}`,
        { token }
      ),
    // Evaluate config with targeting
    evaluate: (configKey: string, context: {
      user?: { id?: string; email?: string; [key: string]: any };
      device?: { platform?: string; osVersion?: string; appVersion?: string; deviceModel?: string; [key: string]: any };
      app?: { version?: string; buildNumber?: string; [key: string]: any };
    }, apiKey: string) =>
      fetchApi<{ receivesRollout: boolean; value: any; matchedTargeting?: boolean; reason?: string }>(
        '/api/business-config/evaluate',
        { method: 'POST', body: { configKey, context }, headers: { 'X-API-Key': apiKey } }
      ),
    // Analytics
    getAnalytics: (projectId: string, configKey: string | undefined, startDate: string | undefined, endDate: string | undefined, token: string) =>
      fetchApi<{
        stats: {
          totalFetches: number;
          uniqueDevices: number;
          uniqueUsers: number;
          cacheHitRate: number;
          targetingMatchRate: number;
          rolloutReceiveRate: number;
        };
        byConfigKey: Array<{
          configKey: string;
          totalFetches: number;
          uniqueDevices: number;
          uniqueUsers: number;
          cacheHits: number;
          targetingMatches: number;
          rolloutReceives: number;
        }>;
        metrics: Array<{
          id: string;
          configKey: string;
          deviceId: string | null;
          userId: string | null;
          fetchCount: number;
          cacheHit: boolean;
          targetingMatched: boolean;
          rolloutReceived: boolean;
          lastFetchedAt: string;
        }>;
      }>(
        `/api/business-config/analytics?projectId=${projectId}${configKey ? `&configKey=${configKey}` : ''}${startDate ? `&startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate}` : ''}`,
        { token }
      ),
  },
  experiments: {
    list: (projectId: string, status: string | undefined, token: string) =>
      fetchApi<{ experiments: Array<{
        id: string;
        name: string;
        description: string | null;
        status: string;
        variants: any;
        targetingRules: any;
        startDate: string | null;
        endDate: string | null;
        createdAt: string;
        config: { key: string; label: string | null };
        _count: { assignments: number; events: number };
      }> }>(
        `/api/experiments?projectId=${projectId}${status ? `&status=${status}` : ''}`,
        { token }
      ),
    get: (experimentId: string, token: string) =>
      fetchApi<{ experiment: any }>(
        `/api/experiments/${experimentId}`,
        { token }
      ),
    create: (data: {
      projectId: string;
      configId: string;
      name: string;
      description?: string;
      variants: Array<{ value: any; weight: number; name: string }>;
      targetingRules?: any;
      assignmentType?: 'random' | 'consistent' | 'targeting';
    }, token: string) =>
      fetchApi<{ experiment: any }>(
        '/api/experiments',
        { method: 'POST', body: data, token }
      ),
    update: (experimentId: string, data: {
      name?: string;
      description?: string;
      status?: string;
      variants?: Array<{ value: any; weight: number; name: string }>;
      targetingRules?: any;
      startDate?: string | null;
      endDate?: string | null;
    }, token: string) =>
      fetchApi<{ experiment: any }>(
        `/api/experiments/${experimentId}`,
        { method: 'PATCH', body: data, token }
      ),
    delete: (experimentId: string, token: string) =>
      fetchApi<{ success: boolean }>(
        `/api/experiments/${experimentId}`,
        { method: 'DELETE', token }
      ),
    getResults: (experimentId: string, token: string) =>
      fetchApi<{
        experiment: any;
        stats: {
          variants: Array<{
            variantIndex: number;
            assignments: number;
            conversions: number;
            conversionRate: number;
            totalValue: number;
            avgValue: number;
          }>;
          totalAssignments: number;
          totalConversions: number;
          overallConversionRate: number;
        };
        significance: Array<{
          variantA: number;
          variantB: number;
          significant: boolean;
          pValue: number;
          confidence: number;
        }>;
        totalEvents: number;
      }>(
        `/api/experiments/${experimentId}/results`,
        { token }
      ),
    assign: (experimentId: string, deviceId: string | undefined, userId: string | undefined, context: any, apiKey: string) =>
      fetchApi<{ variantIndex: number; variantName: string; value: any }>(
        `/api/experiments/${experimentId}/assign`,
        { method: 'POST', body: { deviceId, userId, context }, headers: { 'X-API-Key': apiKey } }
      ),
    trackEvent: (experimentId: string, deviceId: string | undefined, userId: string | undefined, eventType: string, eventName: string, eventValue: number | undefined, metadata: any, apiKey: string) =>
      fetchApi<{ success: boolean }>(
        `/api/experiments/${experimentId}/events`,
        { method: 'POST', body: { deviceId, userId, eventType, eventName, eventValue, metadata }, headers: { 'X-API-Key': apiKey } }
      ),
  },
  deployments: {
    deploy: (configId: string, strategy: string, config: any, token: string) =>
      fetchApi<{ deployment: any }>(
        `/api/business-config/${configId}/deploy`,
        { method: 'POST', body: { strategy, config }, token }
      ),
    rollback: (configId: string, reason: string | undefined, token: string) =>
      fetchApi<{ success: boolean }>(
        `/api/business-config/${configId}/deploy/rollback`,
        { method: 'POST', body: { reason }, token }
      ),
    getDeployments: (configId: string, token: string) =>
      fetchApi<{ deployments: Array<{
        id: string;
        strategy: string;
        status: string;
        currentPercentage: number;
        targetPercentage: number;
        startDate: string;
        endDate: string | null;
        completedAt: string | null;
        rolledBackAt: string | null;
        createdAt: string;
      }> }>(
        `/api/business-config/${configId}/deployments`,
        { token }
      ),
  },
  configAlerts: {
    list: (configId: string, token: string) =>
      fetchApi<{ alerts: Array<{
        id: string;
        name: string;
        description: string | null;
        condition: string;
        threshold: number;
        operator: string;
        enabled: boolean;
        lastTriggered: string | null;
        triggerCount: number;
        _count: { events: number };
      }> }>(
        `/api/business-config/${configId}/alerts`,
        { token }
      ),
    create: (configId: string, data: {
      name: string;
      description?: string;
      condition: string;
      threshold: number;
      operator?: string;
      timeWindow?: number;
      minOccurrences?: number;
      webhookUrl?: string;
      emailRecipients?: string[];
    }, token: string) =>
      fetchApi<{ alert: any }>(
        `/api/business-config/${configId}/alerts`,
        { method: 'POST', body: data, token }
      ),
    update: (configId: string, alertId: string, data: {
      name?: string;
      description?: string;
      enabled?: boolean;
      condition?: string;
      threshold?: number;
      operator?: string;
      timeWindow?: number;
      minOccurrences?: number;
      webhookUrl?: string;
      emailRecipients?: string[];
    }, token: string) =>
      fetchApi<{ alert: any }>(
        `/api/business-config/${configId}/alerts/${alertId}`,
        { method: 'PATCH', body: data, token }
      ),
    delete: (configId: string, alertId: string, token: string) =>
      fetchApi<{ success: boolean }>(
        `/api/business-config/${configId}/alerts/${alertId}`,
        { method: 'DELETE', token }
      ),
    getEvents: (configId: string, alertId: string, acknowledged: boolean | undefined, token: string) =>
      fetchApi<{ events: Array<{
        id: string;
        severity: string;
        message: string;
        metadata: any;
        acknowledged: boolean;
        createdAt: string;
      }> }>(
        `/api/business-config/${configId}/alerts/${alertId}/events${acknowledged !== undefined ? `?acknowledged=${acknowledged}` : ''}`,
        { token }
      ),
    acknowledgeEvent: (configId: string, alertId: string, eventId: string, token: string) =>
      fetchApi<{ event: any }>(
        `/api/business-config/${configId}/alerts/${alertId}/events/${eventId}`,
        { method: 'PATCH', token }
      ),
  },
  configApprovals: {
    list: (configId: string, token: string) =>
      fetchApi<{ approvals: Array<{
        id: string;
        changeType: string;
        status: string;
        requiredApprovals: number;
        currentApprovals: number;
        requestedBy: string;
        requestedAt: string;
        decidedAt: string | null;
      }> }>(
        `/api/business-config/${configId}/approvals`,
        { token }
      ),
    create: (configId: string, data: {
      changeType: string;
      changeData: any;
      requiredApprovals?: number;
      approvers: string[];
    }, token: string) =>
      fetchApi<{ approval: any }>(
        `/api/business-config/${configId}/approvals`,
        { method: 'POST', body: data, token }
      ),
    approve: (configId: string, approvalId: string, comment: string | undefined, token: string) =>
      fetchApi<{ approval: any }>(
        `/api/business-config/${configId}/approvals/${approvalId}`,
        { method: 'PATCH', body: { action: 'approve', comment }, token }
      ),
    reject: (configId: string, approvalId: string, comment: string | undefined, token: string) =>
      fetchApi<{ approval: any }>(
        `/api/business-config/${configId}/approvals/${approvalId}`,
        { method: 'PATCH', body: { action: 'reject', comment }, token }
      ),
  },
  upload: {
    uploadFile: async (projectId: string, token: string, file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', projectId)

      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      }
      return data as { success: boolean; file: { id: string; filename: string; url: string; size: number; mimeType: string } }
    },
    deleteFile: (fileId: string, token: string) =>
      fetchApi<{ success: boolean }>(
        `/api/upload?id=${fileId}`,
        { method: 'DELETE', token }
      ),
    listFiles: (projectId: string, token: string) =>
      fetchApi<{
        files: Array<{
          id: string;
          filename: string;
          storedName: string;
          mimeType: string;
          size: number;
          url: string;
          createdAt: string;
        }>;
      }>(
        `/api/upload?projectId=${projectId}`,
        { token }
      )
  },
  localization: {
    // Languages
    getLanguages: (projectId: string, token: string) =>
      fetchApi<{
        languages: Array<{
          id: string;
          code: string;
          name: string;
          nativeName: string | null;
          isDefault: boolean;
          isEnabled: boolean;
          isRTL: boolean;
          createdAt: string;
        }>;
      }>(
        `/api/localization/languages?projectId=${projectId}`,
        { token }
      ),
    createLanguage: (projectId: string, token: string, data: {
      code: string;
      name: string;
      nativeName?: string;
      isDefault?: boolean;
      isRTL?: boolean;
    }) =>
      fetchApi<{ language: Record<string, unknown> }>(
        '/api/localization/languages',
        { method: 'POST', body: { projectId, ...data }, token }
      ),
    updateLanguage: (token: string, data: {
      id: string;
      name?: string;
      nativeName?: string;
      isDefault?: boolean;
      isEnabled?: boolean;
      isRTL?: boolean;
    }) =>
      fetchApi<{ language: Record<string, unknown> }>(
        '/api/localization/languages',
        { method: 'PUT', body: data, token }
      ),
    deleteLanguage: (languageId: string, token: string) =>
      fetchApi<{ success: boolean }>(
        `/api/localization/languages?id=${languageId}`,
        { method: 'DELETE', token }
      ),
    // Keys
    getKeys: (projectId: string, token: string, category?: string) =>
      fetchApi<{
        keys: Array<{
          id: string;
          key: string;
          description: string | null;
          category: string | null;
          platform: string | null;
          maxLength: number | null;
          screenshot: string | null;
          createdAt: string;
          translations: Array<{
            id: string;
            value: string;
            isReviewed: boolean;
            language: {
              id: string;
              code: string;
              name: string;
            };
          }>;
        }>;
      }>(
        `/api/localization/keys?projectId=${projectId}${category ? `&category=${encodeURIComponent(category)}` : ''}`,
        { token }
      ),
    createKey: (projectId: string, token: string, data: {
      key: string;
      description?: string;
      category?: string;
      platform?: string;
      maxLength?: number;
      screenshot?: string;
    }) =>
      fetchApi<{ key: Record<string, unknown> }>(
        '/api/localization/keys',
        { method: 'POST', body: { projectId, ...data }, token }
      ),
    updateKey: (token: string, data: {
      id: string;
      key?: string;
      description?: string;
      category?: string;
      platform?: string;
      maxLength?: number;
      screenshot?: string;
    }) =>
      fetchApi<{ key: Record<string, unknown> }>(
        '/api/localization/keys',
        { method: 'PUT', body: data, token }
      ),
    deleteKey: (keyId: string, token: string) =>
      fetchApi<{ success: boolean }>(
        `/api/localization/keys?id=${keyId}`,
        { method: 'DELETE', token }
      ),
    // Translations
    getTranslations: (projectId: string, token: string, languageCode?: string) =>
      fetchApi<{
        translations: Record<string, string>;
        language: { code: string; name: string; isRTL: boolean } | null;
      }>(
        `/api/localization/translations?projectId=${projectId}${languageCode ? `&lang=${languageCode}` : ''}`,
        { token }
      ),
    saveTranslation: (token: string, data: {
      keyId: string;
      languageId: string;
      value: string;
    }) =>
      fetchApi<{ translation: Record<string, unknown> }>(
        '/api/localization/translations',
        { method: 'POST', body: data, token }
      ),
    updateTranslation: (token: string, data: {
      keyId: string;
      languageId: string;
      value: string;
    }) =>
      fetchApi<{ translation: Record<string, unknown> }>(
        '/api/localization/translations',
        { method: 'POST', body: data, token }
      ),
    bulkUpdateTranslations: (projectId: string, token: string, translations: Array<{
      keyId: string;
      languageId: string;
      value: string;
    }>) =>
      fetchApi<{ updated: number }>(
        '/api/localization/translations',
        { method: 'PUT', body: { projectId, translations }, token }
      ),
    // Import/Export
    import: (projectId: string, token: string, file: File, options: {
      format: 'csv' | 'json' | 'android_xml' | 'ios_strings' | 'xliff';
      languageCode?: string;
      createMissingKeys?: boolean;
      updateExisting?: boolean;
      dryRun?: boolean;
      category?: string;
    }) => {
      const formData = new FormData();
      formData.append('projectId', projectId);
      formData.append('format', options.format);
      formData.append('file', file);
      if (options.languageCode) {
        formData.append('languageCode', options.languageCode);
      }
      formData.append('options', JSON.stringify({
        createMissingKeys: options.createMissingKeys ?? true,
        updateExisting: options.updateExisting ?? true,
        dryRun: options.dryRun ?? false,
        category: options.category,
      }));

      return fetchApi<{
        success: boolean;
        stats?: {
          keysCreated: number;
          keysUpdated: number;
          keysSkipped: number;
          translationsCreated: number;
          translationsUpdated: number;
          errors: Array<{ key?: string; message: string }>;
        };
        preview?: Array<{
          key: string;
          value: string;
          action: 'create' | 'update' | 'skip';
        }>;
        error?: string;
        errors?: Array<{ row?: number; message: string }>;
      }>(
        '/api/localization/import',
        {
          method: 'POST',
          body: formData,
          token,
          headers: {}, // Let browser set Content-Type for FormData
        }
      );
    },
    export: (projectId: string, token: string, options: {
      format: 'csv' | 'json' | 'android_xml' | 'ios_strings' | 'xliff';
      languageCode?: string;
      category?: string;
      includeEmpty?: boolean;
    }) => {
      const params = new URLSearchParams({
        projectId,
        format: options.format,
      });
      if (options.languageCode) {
        params.append('languageCode', options.languageCode);
      }
      if (options.category) {
        params.append('category', options.category);
      }
      if (options.includeEmpty) {
        params.append('includeEmpty', 'true');
      }

      return fetch(`/api/localization/export?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }).then(async (res) => {
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Export failed');
        }
        return res.blob();
      });
    },
    // Statistics
    getStatistics: (projectId: string, token: string) =>
      fetchApi<{
        overview: {
          totalKeys: number;
          totalLanguages: number;
          totalTranslations: number;
          completionRate: number;
        };
        languages: Array<{
          id: string;
          code: string;
          name: string;
          totalKeys: number;
          translatedKeys: number;
          completionRate: number;
          missingKeys: number;
          reviewedCount: number;
          reviewedRate: number;
        }>;
        categories: Array<{
          category: string;
          totalKeys: number;
          translatedKeys: number;
          completionRate: number;
        }>;
        recentActivity: Array<{
          type: string;
          timestamp: string;
          details: Record<string, any>;
        }>;
      }>(
        `/api/localization/statistics?projectId=${projectId}`,
        { token }
      ),
    // Bulk Operations
    bulkEdit: (token: string, data: {
      projectId: string;
      operation: 'update_translations' | 'delete_keys' | 'assign_category' | 'enable_languages' | 'disable_languages';
      filters: {
        keyIds?: string[];
        languageIds?: string[];
        category?: string;
        hasTranslation?: boolean;
        isReviewed?: boolean;
      };
      updates: {
        category?: string;
        translations?: Array<{
          keyId: string;
          languageId: string;
          value: string;
        }>;
        isEnabled?: boolean;
      };
    }) =>
      fetchApi<{
        success: boolean;
        affected: {
          keys: number;
          translations: number;
        };
        errors?: Array<{ key?: string; message: string }>;
      }>(
        '/api/localization/bulk',
        { method: 'PATCH', body: data, token }
      ),
    // Machine Translation
    translate: (keyId: string, targetLanguageId: string, sourceLanguageId: string | undefined, provider: string, token: string) =>
      fetchApi<{ translation: { value: string; provider: string; confidence: number; cost: number } }>(
        '/api/localization/translate',
        { method: 'POST', body: { keyId, targetLanguageId, sourceLanguageId, provider }, token }
      ),
    // Translation Memory
    getTMSuggestions: (projectId: string, sourceLanguageId: string, targetLanguageId: string, sourceText: string, minSimilarity: number, token: string) =>
      fetchApi<{ suggestions: Array<{ targetText: string; similarity: number; usageCount: number; lastUsedAt: string }> }>(
        `/api/localization/tm/suggestions?projectId=${projectId}&sourceLanguageId=${sourceLanguageId}&targetLanguageId=${targetLanguageId}&sourceText=${encodeURIComponent(sourceText)}&minSimilarity=${minSimilarity}`,
        { token }
      ),
    // Comments
    getComments: (translationId: string, projectId: string, token: string) =>
      fetchApi<{ comments: Array<{ id: string; content: string; userId: string; userName: string; isResolved: boolean; createdAt: string }> }>(
        `/api/localization/comments?translationId=${translationId}&projectId=${projectId}`,
        { token }
      ),
    createComment: (translationId: string, projectId: string, content: string, token: string) =>
      fetchApi<{ comment: { id: string; content: string; userId: string; userName: string; createdAt: string } }>(
        '/api/localization/comments',
        { method: 'POST', body: { translationId, projectId, content }, token }
      ),
    updateComment: (commentId: string, isResolved: boolean, token: string) =>
      fetchApi<{ comment: { id: string; isResolved: boolean } }>(
        `/api/localization/comments/${commentId}`,
        { method: 'PATCH', body: { isResolved }, token }
      ),
    deleteComment: (commentId: string, token: string) =>
      fetchApi<{ success: boolean }>(
        `/api/localization/comments/${commentId}`,
        { method: 'DELETE', token }
      ),
    // History
    getHistory: (projectId: string, translationId: string | undefined, keyId: string | undefined, limit: number, token: string) =>
      fetchApi<{ history: Array<{ id: string; oldValue: string; newValue: string; changeType: string; userId: string; userName: string; createdAt: string }> }>(
        `/api/localization/history?projectId=${projectId}${translationId ? `&translationId=${translationId}` : ''}${keyId ? `&keyId=${keyId}` : ''}&limit=${limit}`,
        { token }
      ),
    // Glossary
    getGlossary: (projectId: string, category: string | undefined, search: string | undefined, token: string) =>
      fetchApi<{ glossary: Array<{ id: string; term: string; definition: string; context: string; translations: Record<string, string>; category: string }> }>(
        `/api/localization/glossary?projectId=${projectId}${category ? `&category=${category}` : ''}${search ? `&search=${encodeURIComponent(search)}` : ''}`,
        { token }
      ),
    createGlossaryTerm: (projectId: string, term: string, definition: string | undefined, context: string | undefined, translations: Record<string, string> | undefined, category: string | undefined, token: string) =>
      fetchApi<{ term: { id: string; term: string; definition: string; translations: Record<string, string> } }>(
        '/api/localization/glossary',
        { method: 'POST', body: { projectId, term, definition, context, translations, category }, token }
      ),
    updateGlossaryTerm: (termId: string, data: Partial<{ term: string; definition: string; context: string; translations: Record<string, string>; category: string; isActive: boolean }>, token: string) =>
      fetchApi<{ term: { id: string; term: string } }>(
        `/api/localization/glossary/${termId}`,
        { method: 'PUT', body: data, token }
      ),
    deleteGlossaryTerm: (termId: string, token: string) =>
      fetchApi<{ success: boolean }>(
        `/api/localization/glossary/${termId}`,
        { method: 'DELETE', token }
      ),
    // Translation Providers
    getProviders: (projectId: string, token: string) =>
      fetchApi<{ providers: Array<{ id: string; provider: string; isEnabled: boolean; autoTranslate: boolean }> }>(
        `/api/localization/providers?projectId=${projectId}`,
        { token }
      ),
    createProvider: (projectId: string, provider: string, apiKey: string | undefined, apiSecret: string | undefined, isEnabled: boolean, autoTranslate: boolean, defaultSourceLanguageId: string | undefined, token: string) =>
      fetchApi<{ provider: { id: string; provider: string; isEnabled: boolean } }>(
        '/api/localization/providers',
        { method: 'POST', body: { projectId, provider, apiKey, apiSecret, isEnabled, autoTranslate, defaultSourceLanguageId }, token }
      ),
    // OTA Updates
    checkOTA: (projectId: string, currentVersion: string | undefined, languageCode: string, apiKey: string) =>
      fetchApi<{ updateAvailable: boolean; latestVersion: number; delta?: { added: Record<string, string>; updated: Record<string, string>; deleted: string[] }; fullPayload?: Record<string, string> }>(
        `/api/localization/ota/check?projectId=${projectId}${currentVersion ? `&currentVersion=${currentVersion}` : ''}&languageCode=${languageCode}`,
        { headers: { 'X-API-Key': apiKey } }
      ),
    logOTAUpdate: (projectId: string, deviceId: string, fromVersion: number, toVersion: number, languageCode: string, apiKey: string) =>
      fetchApi<{ success: boolean }>(
        '/api/localization/ota/update',
        { method: 'POST', body: { projectId, deviceId, fromVersion, toVersion, languageCode }, headers: { 'X-API-Key': apiKey } }
      ),
  },
  subscription: {
    get: (token: string) =>
      fetchApi<{ subscription: any }>(
        '/api/subscription',
        { token }
      ),
    getUsage: (token: string) =>
      fetchApi<{ usage: any }>(
        '/api/subscription/usage',
        { token }
      ),
    getHistory: (token: string) =>
      fetchApi<{ history: any[] }>(
        '/api/subscription/history',
        { token }
      ),
    upgrade: (planId: string, paymentMethodId: string | null, token: string) =>
      fetchApi<{ success: boolean; subscription?: any; paymentIntent?: any; requiresPayment?: boolean; error?: string }>(
        '/api/subscription/upgrade',
        { method: 'POST', body: { planId, paymentMethodId }, token }
      ),
    confirmUpgrade: (paymentIntentId: string, planId: string, token: string) =>
      fetchApi<{ success: boolean; subscription: any }>(
        '/api/subscription/confirm-upgrade',
        { method: 'POST', body: { paymentIntentId, planId }, token }
      ),
    update: (planName: string, token: string) =>
      fetchApi<{ subscription: any }>(
        '/api/subscription',
        { method: 'PATCH', body: { planName }, token }
      ),
    getEnforcement: (token: string) =>
      fetchApi<{ state: string; effectivePolicy: any; graceEndsAt: string | null; triggeredMetrics: any[] }>(
        '/api/subscription/enforcement',
        { token }
      ),
  },
  paymentMethods: {
    list: (token: string) =>
      fetchApi<{ paymentMethods: any[] }>(
        '/api/payment-methods',
        { token }
      ),
    get: (id: string, token: string) =>
      fetchApi<{ paymentMethod: any }>(
        `/api/payment-methods/${id}`,
        { token }
      ),
    create: (paymentMethodId: string, isDefault: boolean, token: string) =>
      fetchApi<{ paymentMethod: any }>(
        '/api/payment-methods',
        { method: 'POST', body: { paymentMethodId, isDefault }, token }
      ),
    update: (id: string, updates: { isDefault?: boolean }, token: string) =>
      fetchApi<{ paymentMethod: any }>(
        `/api/payment-methods/${id}`,
        { method: 'PATCH', body: updates, token }
      ),
    delete: (id: string, token: string) =>
      fetchApi<{ success: boolean }>(
        `/api/payment-methods/${id}`,
        { method: 'DELETE', token }
      ),
  },
  admin: {
    getUsers: (token: string) =>
      fetchApi<{ users: any[] }>(
        '/api/admin/users',
        { token }
      ),
    getSubscriptions: (token: string) =>
      fetchApi<{ subscriptions: any[] }>(
        '/api/admin/subscriptions',
        { token }
      ),
    getStats: (token: string) =>
      fetchApi<{ stats: any }>(
        '/api/admin/stats',
        { token }
      ),
    getRevenue: (token: string) =>
      fetchApi<{ revenue: any }>(
        '/api/admin/revenue',
        { token }
      ),
    getAnalytics: (token: string) =>
      fetchApi<{ analytics: any }>(
        '/api/admin/analytics',
        { token }
      ),
    // Offers Management
    getOffers: (token: string, params?: { status?: string; type?: string }) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : ''
      return fetchApi<{ offers: any[] }>(
        `/api/admin/offers${query}`,
        { token }
      )
    },
    createOffers: (type: string, options: any, token: string) =>
      fetchApi<{ success: boolean; created: number; errors: string[] }>(
        '/api/admin/offers/create',
        { method: 'POST', body: { type, ...options }, token }
      ),
    acceptOffer: (offerId: string, token: string) =>
      fetchApi<{ success: boolean }>(
        `/api/admin/offers/${offerId}/accept`,
        { method: 'POST', token }
      ),
    getForecast: (token: string) =>
      fetchApi<{ forecast: any }>(
        '/api/admin/forecast',
        { token }
      ),
    // Plan Management
    getPlans: (token: string) =>
      fetchApi<{ plans: any[] }>(
        '/api/admin/plans',
        { token }
      ),
    getPlan: (planId: string, token: string) =>
      fetchApi<{ plan: any }>(
        `/api/admin/plans/${planId}`,
        { token }
      ),
    createPlan: (plan: any, token: string) =>
      fetchApi<{ plan: any }>(
        '/api/admin/plans',
        { method: 'POST', body: plan, token }
      ),
    updatePlan: (planId: string, plan: Partial<any>, token: string) =>
      fetchApi<{ plan: any }>(
        `/api/admin/plans/${planId}`,
        { method: 'PATCH', body: plan, token }
      ),
    deletePlan: (planId: string, token: string) =>
      fetchApi<{ success: boolean; message: string }>(
        `/api/admin/plans/${planId}`,
        { method: 'DELETE', token }
      ),
    // Subscription Management
    getSubscription: (subscriptionId: string, token: string) =>
      fetchApi<{ subscription: any }>(
        `/api/admin/subscriptions/${subscriptionId}`,
        { token }
      ),
    enableSubscription: (subscriptionId: string, token: string) =>
      fetchApi<{ success: boolean; message: string }>(
        `/api/admin/subscriptions/${subscriptionId}/enable`,
        { method: 'PATCH', token }
      ),
    disableSubscription: (subscriptionId: string, token: string) =>
      fetchApi<{ success: boolean; message: string }>(
        `/api/admin/subscriptions/${subscriptionId}/disable`,
        { method: 'PATCH', token }
      ),
    changeSubscriptionPlan: (subscriptionId: string, planId: string, token: string) =>
      fetchApi<{ success: boolean; subscription: any }>(
        `/api/admin/subscriptions/${subscriptionId}/plan`,
        { method: 'PATCH', body: { planId }, token }
      ),
    updateSubscriptionStatus: (subscriptionId: string, status: string, token: string) =>
      fetchApi<{ success: boolean; subscription: any }>(
        `/api/admin/subscriptions/${subscriptionId}/status`,
        { method: 'PATCH', body: { status }, token }
      ),
    updateSubscriptionQuotas: (subscriptionId: string, quotas: Record<string, number | null>, token: string) =>
      fetchApi<{ success: boolean; subscription: any }>(
        `/api/admin/subscriptions/${subscriptionId}/quotas`,
        { method: 'PATCH', body: quotas, token }
      ),
    createSubscription: (data: { userId: string; planId: string; promoCodeId?: string; discountPercent?: number; discountAmount?: number }, token: string) =>
      fetchApi<{ subscription: any }>(
        '/api/admin/subscriptions',
        { method: 'POST', body: data, token }
      ),
    // Promo Code Management
    getPromoCodes: (token: string) =>
      fetchApi<{ promoCodes: any[] }>(
        '/api/admin/promo-codes',
        { token }
      ),
    createPromoCode: (data: any, token: string) =>
      fetchApi<{ promoCode: any }>(
        '/api/admin/promo-codes',
        { method: 'POST', body: data, token }
      ),
    getPromoCode: (promoCodeId: string, token: string) =>
      fetchApi<{ promoCode: any }>(
        `/api/admin/promo-codes/${promoCodeId}`,
        { token }
      ),
    updatePromoCode: (promoCodeId: string, data: any, token: string) =>
      fetchApi<{ promoCode: any }>(
        `/api/admin/promo-codes/${promoCodeId}`,
        { method: 'PATCH', body: data, token }
      ),
    deletePromoCode: (promoCodeId: string, token: string) =>
      fetchApi<{ success: boolean }>(
        `/api/admin/promo-codes/${promoCodeId}`,
        { method: 'DELETE', token }
      ),
    // Configuration Management
    getConfigurations: (token: string, category?: string) =>
      fetchApi<{ configurations: Array<{
        id: string;
        category: string;
        key: string;
        value: string;
        encrypted: boolean;
        description: string | null;
        isActive: boolean;
        metadata: Record<string, any> | null;
        updatedBy: string | null;
        createdAt: string;
        updatedAt: string;
      }> }>(
        `/api/admin/configurations${category ? `?category=${category}` : ''}`,
        { token }
      ),
    getConfiguration: (category: string, key: string, token: string) =>
      fetchApi<{ configuration: {
        id: string;
        category: string;
        key: string;
        value: string;
        encrypted: boolean;
        description: string | null;
        isActive: boolean;
        metadata: Record<string, any> | null;
        updatedBy: string | null;
        createdAt: string;
        updatedAt: string;
      } }>(
        `/api/admin/configurations/${category}/${key}`,
        { token }
      ),
    saveConfiguration: (data: {
      category: string;
      key: string;
      value?: string;
      encrypted?: boolean;
      description?: string;
      isActive?: boolean;
      metadata?: Record<string, any>;
    }, token: string) =>
      fetchApi<{ configuration: any }>(
        '/api/admin/configurations',
        { method: 'POST', body: data, token }
      ),
    deleteConfiguration: (category: string, key: string, token: string) =>
      fetchApi<{ success: boolean }>(
        `/api/admin/configurations/${category}/${key}`,
        { method: 'DELETE', token }
      ),
    testConfiguration: (category: string, key: string, testType: string, testData: any, token: string) =>
      fetchApi<{ testResult: { success: boolean; message: string; [key: string]: any } }>(
        '/api/admin/configurations/test',
        { method: 'POST', body: { category, key, testType, testData }, token }
      ),
    getMigrationStatus: (token: string) =>
      fetchApi<{ 
        status: 'complete' | 'pending' | 'error';
        checks: Record<string, boolean>;
        missingItems: string[];
        message: string;
      }>(
        '/api/admin/migrations/run',
        { token }
      ),
    runMigrations: (token: string) =>
      fetchApi<{ 
        success: boolean;
        message: string;
        output?: string;
        warnings?: string;
        error?: string;
      }>(
        '/api/admin/migrations/run',
        { method: 'POST', token }
      ),
  },
  builds: {
    create: (projectId: string, token: string, data: { featureType: string; name?: string; description?: string }) =>
      fetchApi<{ build: any }>(
        '/api/builds',
        { method: 'POST', body: { projectId, ...data }, token }
      ),
    list: (projectId: string, token: string, featureType?: string) =>
      fetchApi<{ builds: any[] }>(
        `/api/builds?projectId=${projectId}${featureType ? `&featureType=${featureType}` : ''}`,
        { token }
      ),
    get: (buildId: string, token: string) =>
      fetchApi<{ build: any }>(
        `/api/builds/${buildId}`,
        { token }
      ),
    update: (buildId: string, token: string, data: { name?: string; description?: string }) =>
      fetchApi<{ build: any }>(
        `/api/builds/${buildId}`,
        { method: 'PATCH', body: data, token }
      ),
    delete: (buildId: string, token: string) =>
      fetchApi<{ success: boolean }>(
        `/api/builds/${buildId}`,
        { method: 'DELETE', token }
      ),
    setMode: (buildId: string, mode: 'preview' | 'production', token: string) =>
      fetchApi<{ build: any }>(
        `/api/builds/${buildId}/mode`,
        { method: 'PATCH', body: { mode }, token }
      ),
    getDiff: (buildId1: string, buildId2: string, token: string) =>
      fetchApi<{ diff: any }>(
        `/api/builds/diff/${buildId1}/${buildId2}`,
        { token }
      ),
  },
  mocks: {
    listEnvironments: (projectId: string, token: string) =>
      fetchApi<{ environments: any[] }>(
        `/api/mocks/environments?projectId=${projectId}`,
        { token }
      ),
    createEnvironment: (projectId: string, token: string, data: { name: string; description?: string; mode?: string }) =>
      fetchApi<{ environment: any }>(
        '/api/mocks/environments',
        { method: 'POST', body: { projectId, ...data }, token }
      ),
    updateEnvironment: (envId: string, token: string, data: { isEnabled?: boolean; isDefault?: boolean }) =>
      fetchApi<{ environment: any }>(
        `/api/mocks/environments/${envId}`,
        { method: 'PATCH', body: data, token }
      ),
    listEndpoints: (environmentId: string, token: string) =>
      fetchApi<{ endpoints: any[] }>(
        `/api/mocks/endpoints?environmentId=${environmentId}`,
        { token }
      ),
    getEndpoint: (endpointId: string, token: string) =>
      fetchApi<{ endpoint: any }>(
        `/api/mocks/endpoints/${endpointId}`,
        { token }
      ),
    createEndpoint: (token: string, data: { environmentId: string; path: string; method: string; description?: string }) =>
      fetchApi<{ endpoint: any }>(
        '/api/mocks/endpoints',
        { method: 'POST', body: data, token }
      ),
    deleteEndpoint: (endpointId: string, token: string) =>
      fetchApi<{ success: boolean }>(
        `/api/mocks/endpoints/${endpointId}`,
        { method: 'DELETE', token }
      ),
    createResponse: (token: string, data: { endpointId: string; statusCode: number; name?: string; description?: string; responseBody?: any; responseHeaders?: Record<string, string>; delay?: number; isDefault?: boolean }) =>
      fetchApi<{ response: any }>(
        '/api/mocks/responses',
        { method: 'POST', body: data, token }
      ),
    updateResponse: (responseId: string, token: string, data: any) =>
      fetchApi<{ response: any }>(
        `/api/mocks/responses/${responseId}`,
        { method: 'PATCH', body: data, token }
      ),
    deleteResponse: (responseId: string, token: string) =>
      fetchApi<{ success: boolean }>(
        `/api/mocks/responses/${responseId}`,
        { method: 'DELETE', token }
      ),
  }
}
