'use client'

import React, { useEffect, useState, useMemo, memo, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { api, PaginationResponse } from '@/lib/api'
import { useDebounce, usePagination } from '@/hooks/useDebounce'
import { Pagination, CompactPagination } from '@/components/Pagination'
import { SkeletonDeviceList, SkeletonSessionList, SkeletonLogList, SkeletonTraceList, SkeletonCrashList } from '@/components/SkeletonLoader'
import { DeviceCard, LogItem, TraceItem } from '@/components/ListItems'
import BusinessConfigTab from '@/components/BusinessConfigTab'
import LocalizationTab from '@/components/LocalizationTab'
import MocksPage from './mocks/page'
import Sidebar from '@/components/Sidebar'
import DeviceComparison from '@/components/DeviceComparison'
import DeviceNotes from '@/components/DeviceNotes'

type Device = {
  id: string
  deviceId: string
  platform: string
  osVersion: string
  appVersion: string
  model: string
  manufacturer?: string
  lastSeenAt: string
  createdAt: string
  // Device debug mode fields
  deviceCode?: string
  userId?: string
  userEmail?: string
  userName?: string
  debugModeEnabled?: boolean
  debugModeEnabledAt?: string
  debugModeExpiresAt?: string
  debugModeEnabledBy?: string
  // Firebase-like device properties
  deviceCategory?: string
  deviceBrand?: string
  locale?: string
  language?: string
  timeZone?: string
  timeZoneOffset?: number
  advertisingId?: string
  vendorId?: string
  limitedAdTracking?: boolean
  appId?: string
  appInstanceId?: string
  firstOpenAt?: string
  firstPurchaseAt?: string
  metadata?: {
    sdk?: number
    device?: string
    product?: string
    country?: string
    carrier?: string
  }
}

type DeviceStats = {
  total: number
  android: number
  ios: number
  today: number
  thisWeek: number
  thisMonth: number
  debugModeCount: number
}

type Log = {
  id: string
  level: string
  message: string
  tag: string | null
  data: Record<string, unknown> | null
  fileName: string | null
  lineNumber: number | null
  functionName: string | null
  className: string | null
  screenName: string | null
  threadName: string | null
  timestamp: string
  device?: { deviceId: string; platform: string; model: string }
  session?: { id: string; sessionToken: string }
}

type LogLevels = {
  verbose: number
  debug: number
  info: number
  warn: number
  error: number
  assert: number
}

type Crash = {
  id: string
  message: string
  stackTrace: string | null
  metadata: Record<string, unknown> | null
  timestamp: string
  device?: { deviceId: string; platform: string; model: string | null }
}

type Trace = {
  id: string
  url: string
  method: string
  statusCode: number
  duration: number
  error: string
  timestamp: string
  requestHeaders?: Record<string, string>
  requestBody?: string
  responseHeaders?: Record<string, string>
  responseBody?: string
  screenName?: string
  networkType?: string
  country?: string
  carrier?: string
  ipAddress?: string
  userAgent?: string
  device?: { deviceId: string; platform: string; model: string }
}

type TraceDevice = {
  id: string
  deviceId: string
  platform: string
  model: string
}

type Tab = 'devices' | 'logs' | 'crashes' | 'traces' | 'flow' | 'config' | 'analytics' | 'monitor' | 'settings' | 'setup' | 'business-config' | 'localization' | 'mocks'

type ApiConfig = {
  id: string
  endpoint: string
  method: string | null
  name: string | null
  description: string | null
  costPerRequest: number
  isEnabled: boolean
  createdAt: string
}

type SuggestedEndpoint = {
  endpoint: string
  method: string
  fullUrl: string
}

type Analytics = {
  summary: {
    totalCost: number
    totalRequests: number
    uniqueEndpointsCost: number
    avgCostPerRequest: number
  }
  endpointCosts: Array<{
    endpoint: string
    method: string
    fullUrl: string
    totalCost: number
    requestCount: number
    avgCostPerRequest: number
  }>
  deviceCosts: Array<{
    deviceId: string
    device: { id: string; deviceId: string; platform: string; model: string } | null
    totalCost: number
    requestCount: number
  }>
  sessionCosts: Array<{
    id: string
    sessionToken: string
    startedAt: string
    endedAt: string | null
    isActive: boolean
    device: { deviceId: string; platform: string; model: string } | null
    requestCount: number
    totalCost: number
  }>
}

type FlowNode = {
  id: string
  name: string
  requestCount: number
  totalCost: number
  successCount: number
  errorCount: number
}

type FlowEdge = {
  id: string
  source: string
  target: string
  requestCount: number
  totalCost: number
  successCount: number
  errorCount: number
  sequenceNumber: number
  topEndpoints: Array<{
    method: string
    endpoint: string
    url: string
    count: number
    cost: number
    successRate: number
    statusCode: number
    duration: number
    requestBody?: string
    responseBody?: string
  }>
}

type FlowSession = {
  id: string
  sessionToken: string
  startedAt: string
  endedAt: string | null
  isActive: boolean
  device: { deviceId: string; platform: string; model: string | null } | null
  requestCount: number
  totalCost: number
  screenSequence: string[]
}

type FlowData = {
  nodes: FlowNode[]
  edges: FlowEdge[]
  sessions: FlowSession[]
}

// Timeline types for chronological session view
type TimelineScreenEvent = {
  type: 'screen'
  name: string
  timestamp: string
}

type TimelineRequestEvent = {
  type: 'request'
  id: string
  method: string
  url: string
  endpoint: string
  statusCode: number | null
  duration: number | null
  cost: number | null
  error: string | null
  requestBody: string | null
  responseBody: string | null
  requestHeaders: unknown
  responseHeaders: unknown
  timestamp: string
}

type TimelineLogEvent = {
  type: 'log'
  id: string
  level: string
  message: string
  tag: string | null
  data: unknown
  fileName: string | null
  lineNumber: number | null
  functionName: string | null
  className: string | null
  timestamp: string
}

type TimelineEvent = TimelineScreenEvent | TimelineRequestEvent | TimelineLogEvent

type TimelineData = {
  session: {
    id: string
    sessionToken: string
    startedAt: string
    endedAt: string | null
    isActive: boolean
    duration: number | null
    screenCount: number
    eventCount: number
    errorCount: number
    appVersion: string | null
    osVersion: string | null
    locale: string | null
    timezone: string | null
    device: {
      deviceId: string
      platform: string
      model: string | null
    } | null
  }
  timeline: TimelineEvent[]
  stats: {
    totalRequests: number
    totalLogs: number
    successfulRequests: number
    failedRequests: number
    totalCost: number
  }
}

type FlowViewMode = 'flow' | 'timeline'

type ApiAlert = {
  id: string
  title: string
  description: string | null
  endpoint: string | null
  method: string | null
  isEnabled: boolean
  monitorStandardErrors: boolean
  standardErrorCodes: number[]
  customStatusCodes: number[]
  bodyErrorField: string | null
  bodyErrorValues: string[]
  headerErrorField: string | null
  headerErrorValues: string[]
  notifyEmail: boolean
  notifyPush: boolean
  notifySms: boolean
  notifyWebhook: boolean
  cooldownMinutes: number
  createdAt: string
  _count: { monitoredErrors: number }
}

type MonitoredError = {
  id: string
  alertId: string
  projectId: string
  errorType: string
  errorCode: string
  endpoint: string
  method: string
  statusCode: number | null
  requestBody: string | null
  responseBody: string | null
  firstOccurrence: string
  lastOccurrence: string
  occurrenceCount: number
  affectedDevices: string[]
  affectedSessions: string[]
  isResolved: boolean
  resolvedAt: string | null
  notes: string | null
  alert: {
    id: string
    title: string
    endpoint: string | null
    method: string | null
  }
}

type NotificationSettings = {
  id: string
  projectId: string
  emailEnabled: boolean
  emailAddresses: string[]
  pushEnabled: boolean
  pushToken: string | null
  smsEnabled: boolean
  smsNumbers: string[]
  webhookEnabled: boolean
  webhookUrl: string | null
  webhookSecret: string | null
  webhookHeaders: Record<string, string> | null
}

type SettingsTab = 'notifications' | 'features' | 'sdk' | 'cleanup' | 'project'

type SdkSettings = {
  trackingMode: string  // 'all' | 'debug_only' | 'none'
  captureRequestBodies: boolean
  captureResponseBodies: boolean
  capturePrintStatements: boolean
  sanitizeSensitiveData: boolean
  sensitiveFieldPatterns: string[]
  maxLogQueueSize: number
  maxTraceQueueSize: number
  flushIntervalSeconds: number
  enableBatching: boolean
  minLogLevel: string
  verboseErrors: boolean
  logSamplingEnabled?: boolean
  logSamplingRate?: number
}

type FeatureFlags = {
  sdkEnabled: boolean       // Master kill switch
  apiTracking: boolean
  screenTracking: boolean
  crashReporting: boolean
  logging: boolean
  deviceTracking: boolean
  sessionTracking: boolean
  businessConfig: boolean
  localization: boolean
  offlineSupport: boolean
  batchEvents: boolean
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const { token } = useAuth()

  const [activeTab, setActiveTab] = useState<Tab>('devices')
  const [devices, setDevices] = useState<Device[]>([])
  const [deviceStats, setDeviceStats] = useState<DeviceStats>({ total: 0, android: 0, ios: 0, today: 0, thisWeek: 0, thisMonth: 0, debugModeCount: 0 })
  const [devicePlatformFilter, setDevicePlatformFilter] = useState<string>('')
  const [deviceCategoryFilter, setDeviceCategoryFilter] = useState<string>('')
  const [deviceBrandFilter, setDeviceBrandFilter] = useState<string>('')
  const [deviceLanguageFilter, setDeviceLanguageFilter] = useState<string>('')
  const [deviceStartDate, setDeviceStartDate] = useState<string>('')
  const [deviceEndDate, setDeviceEndDate] = useState<string>('')
  const [deviceSearch, setDeviceSearch] = useState<string>('')
  const [deviceDebugModeFilter, setDeviceDebugModeFilter] = useState<string>('')
  const [togglingDebugMode, setTogglingDebugMode] = useState<string | null>(null)
  const [deletingDevice, setDeletingDevice] = useState<string | null>(null)
  const [devicesLoading, setDevicesLoading] = useState(false)
  const [deviceSubTab, setDeviceSubTab] = useState<'list' | 'settings'>('list')
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set())
  const [showComparison, setShowComparison] = useState(false)
  const [selectedDeviceForDetails, setSelectedDeviceForDetails] = useState<string | null>(null)
  const [tracesSubTab, setTracesSubTab] = useState<'list' | 'security'>('list')
  const [logsSubTab, setLogsSubTab] = useState<'list' | 'settings'>('list')
  // Pagination state for devices
  const [devicesPagination, setDevicesPagination] = useState<PaginationResponse>({
    page: 1, limit: 50, total: 0, totalPages: 0, hasNext: false, hasPrev: false
  })
  // Debounced search values
  const debouncedDeviceSearch = useDebounce(deviceSearch, 300)
  const [logs, setLogs] = useState<Log[]>([])
  const [crashes, setCrashes] = useState<Crash[]>([])
  const [traces, setTraces] = useState<Trace[]>([])
  const [loading, setLoading] = useState(true)
  const [apiKey, setApiKey] = useState('')
  const [projectName, setProjectName] = useState('')
  // Shared enforcement and usage state (fetched once, shared across all tabs)
  const [sharedEnforcement, setSharedEnforcement] = useState<{
    state: string
    triggeredMetrics: Array<{ metric: string; usage: number; limit: number | null; percentage: number }>
    graceEndsAt: string | null
  } | null>(null)
  const [sharedUsage, setSharedUsage] = useState<{
    devices?: { used: number; limit: number | null; percentage: number }
    logs?: { used: number; limit: number | null; percentage: number }
    crashes?: { used: number; limit: number | null; percentage: number }
    sessions?: { used: number; limit: number | null; percentage: number }
    apiRequests?: { used: number; limit: number | null; percentage: number }
    apiEndpoints?: { used: number; limit: number | null; percentage: number }
    businessConfigKeys?: { used: number; limit: number | null; percentage: number }
    localizationLanguages?: { used: number; limit: number | null; percentage: number }
    localizationKeys?: { used: number; limit: number | null; percentage: number }
  } | null>(null)

  // Legacy enforcement and usage state (kept for backward compatibility, will use shared state)
  const [enforcement, setEnforcement] = useState<{
    state: string
    triggeredMetrics: Array<{ metric: string; usage: number; limit: number | null; percentage: number }>
    graceEndsAt: string | null
  } | null>(null)
  const [usageStats, setUsageStats] = useState<{
    devices: { used: number; limit: number | null; percentage: number }
  } | null>(null)
  const [editingProjectName, setEditingProjectName] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)
  const [updatingName, setUpdatingName] = useState(false)
  const [deletingProject, setDeletingProject] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [copied, setCopied] = useState(false)
  // Enforcement and usage state for device quota warnings
  const [deviceEnforcement, setDeviceEnforcement] = useState<{
    state: string
    triggeredMetrics: Array<{ metric: string; usage: number; limit: number | null; percentage: number }>
    graceEndsAt: string | null
  } | null>(null)
  const [deviceUsage, setDeviceUsage] = useState<{
    used: number
    limit: number | null
    percentage: number
  } | null>(null)
  const [apiTracesEnforcement, setApiTracesEnforcement] = useState<{
    state: string
    triggeredMetrics: Array<{ metric: string; usage: number; limit: number | null; percentage: number }>
    graceEndsAt: string | null
  } | null>(null)
  const [apiTracesUsage, setApiTracesUsage] = useState<{
    apiRequests: { used: number; limit: number | null; percentage: number }
    apiEndpoints: { used: number; limit: number | null; percentage: number }
  } | null>(null)
  const [sessionsEnforcement, setSessionsEnforcement] = useState<{
    state: string
    triggeredMetrics: Array<{ metric: string; usage: number; limit: number | null; percentage: number }>
    graceEndsAt: string | null
  } | null>(null)
  const [sessionsUsage, setSessionsUsage] = useState<{
    used: number
    limit: number | null
    percentage: number
  } | null>(null)
  const [logsEnforcement, setLogsEnforcement] = useState<{
    state: string
    triggeredMetrics: Array<{ metric: string; usage: number; limit: number | null; percentage: number }>
    graceEndsAt: string | null
  } | null>(null)
  const [logsUsage, setLogsUsage] = useState<{
    used: number
    limit: number | null
    percentage: number
  } | null>(null)
  const [crashesEnforcement, setCrashesEnforcement] = useState<{
    state: string
    triggeredMetrics: Array<{ metric: string; usage: number; limit: number | null; percentage: number }>
    graceEndsAt: string | null
  } | null>(null)
  const [crashesUsage, setCrashesUsage] = useState<{
    used: number
    limit: number | null
    percentage: number
  } | null>(null)

  // Enhanced logs state
  const [logLevels, setLogLevels] = useState<LogLevels>({ verbose: 0, debug: 0, info: 0, warn: 0, error: 0, assert: 0 })
  const [logTags, setLogTags] = useState<string[]>([])
  const [logScreenNames, setLogScreenNames] = useState<string[]>([])
  const [logSearch, setLogSearch] = useState('')
  const [logLevelFilter, setLogLevelFilter] = useState<string>('')
  const [logTagFilter, setLogTagFilter] = useState<string>('')
  const [logScreenFilter, setLogScreenFilter] = useState<string>('')
  const [logsTotal, setLogsTotal] = useState(0)
  const [logsLoading, setLogsLoading] = useState(false)
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  const [clearingLogs, setClearingLogs] = useState(false)
  // Pagination state for logs
  const [logsPagination, setLogsPagination] = useState<PaginationResponse>({
    page: 1, limit: 50, total: 0, totalPages: 0, hasNext: false, hasPrev: false
  })
  // Debounced log search
  const debouncedLogSearch = useDebounce(logSearch, 300)

  // Enhanced crashes filters and state
  const [crashPlatformFilter, setCrashPlatformFilter] = useState<string>('')
  const [crashDeviceFilter, setCrashDeviceFilter] = useState<string>('')
  const [crashStartDate, setCrashStartDate] = useState<string>('')
  const [crashEndDate, setCrashEndDate] = useState<string>('')
  const [crashSearch, setCrashSearch] = useState<string>('')
  const [crashPlatforms, setCrashPlatforms] = useState<string[]>([])
  const [crashDevices, setCrashDevices] = useState<Array<{ id: string; deviceId: string; platform: string; model: string | null }>>([])
  const [crashesTotal, setCrashesTotal] = useState(0)
  const [crashesLoading, setCrashesLoading] = useState(false)
  const [expandedCrash, setExpandedCrash] = useState<string | null>(null)
  // Pagination state for crashes
  const [crashesPagination, setCrashesPagination] = useState<PaginationResponse>({
    page: 1, limit: 50, total: 0, totalPages: 0, hasNext: false, hasPrev: false
  })
  // Debounced crash search
  const debouncedCrashSearch = useDebounce(crashSearch, 300)

  // Enhanced trace filters and state
  const [screenNames, setScreenNames] = useState<string[]>([])
  const [traceDevices, setTraceDevices] = useState<TraceDevice[]>([])
  const [selectedScreen, setSelectedScreen] = useState<string>('')
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [groupBy, setGroupBy] = useState<'none' | 'device' | 'screen' | 'endpoint'>('none')
  const [expandedTrace, setExpandedTrace] = useState<string | null>(null)
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
  const [clearing, setClearing] = useState(false)
  const [tracesLoading, setTracesLoading] = useState(false)
  // Pagination state for traces
  const [tracesPagination, setTracesPagination] = useState<PaginationResponse>({
    page: 1, limit: 50, total: 0, totalPages: 0, hasNext: false, hasPrev: false
  })

  // API Config state
  const [configs, setConfigs] = useState<ApiConfig[]>([])
  const [suggestedEndpoints, setSuggestedEndpoints] = useState<SuggestedEndpoint[]>([])
  const [editingConfig, setEditingConfig] = useState<ApiConfig | null>(null)
  const [newConfig, setNewConfig] = useState({ endpoint: '', method: '', name: '', costPerRequest: 0 })
  const [showAddConfig, setShowAddConfig] = useState(false)

  // Analytics state
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [deviceSortField, setDeviceSortField] = useState<'requestCount' | 'totalCost'>('totalCost')
  const [deviceSortDir, setDeviceSortDir] = useState<'asc' | 'desc'>('desc')
  const [sessionSortField, setSessionSortField] = useState<'requestCount' | 'totalCost' | 'startedAt'>('startedAt')
  const [sessionSortDir, setSessionSortDir] = useState<'asc' | 'desc'>('desc')
  const [endpointSortField, setEndpointSortField] = useState<'requestCount' | 'totalCost' | 'avgCostPerRequest'>('totalCost')
  const [endpointSortDir, setEndpointSortDir] = useState<'asc' | 'desc'>('desc')

  // Flow chart state
  const [flowData, setFlowData] = useState<FlowData | null>(null)
  const [flowLoading, setFlowLoading] = useState(false)
  const [selectedFlowSession, setSelectedFlowSession] = useState<string>('')
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null)
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({})
  const [draggingNode, setDraggingNode] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Timeline state
  const [flowViewMode, setFlowViewMode] = useState<FlowViewMode>('timeline')
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null)
  const [timelineLoading, setTimelineLoading] = useState(false)
  const [expandedTimelineEvent, setExpandedTimelineEvent] = useState<string | null>(null)

  // Settings and Alerts state
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('notifications')
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null)
  const [alerts, setAlerts] = useState<ApiAlert[]>([])
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags | null>(null)

  // Subscription state
  const [subscriptionStatus, setSubscriptionStatus] = useState<{ status: string; trialActive: boolean; daysRemaining: number; enabled: boolean } | null>(null)
  const [featureFlagsLoading, setFeatureFlagsLoading] = useState(false)
  const [sdkSettings, setSdkSettings] = useState<SdkSettings | null>(null)
  const [sdkSettingsLoading, setSdkSettingsLoading] = useState(false)
  const [newSensitivePattern, setNewSensitivePattern] = useState('')
  const [standardErrorCodes, setStandardErrorCodes] = useState<{ client: number[]; server: number[] }>({ client: [], server: [] })
  const [showAddAlert, setShowAddAlert] = useState(false)
  const [editingAlert, setEditingAlert] = useState<ApiAlert | null>(null)
  const [newAlert, setNewAlert] = useState({
    title: '',
    description: '',
    endpoint: '',
    method: '',
    monitorStandardErrors: true,
    standardErrorCodes: [] as number[],
    customStatusCodes: [] as number[],
    bodyErrorField: '',
    bodyErrorValues: [] as string[],
    headerErrorField: '',
    headerErrorValues: [] as string[],
    notifyEmail: true,
    notifyPush: false,
    notifySms: false,
    notifyWebhook: false,
    cooldownMinutes: 5
  })
  const [newEmailAddress, setNewEmailAddress] = useState('')
  const [newSmsNumber, setNewSmsNumber] = useState('')
  const [customCodeInput, setCustomCodeInput] = useState('')
  const [bodyErrorValueInput, setBodyErrorValueInput] = useState('')
  const [headerErrorValueInput, setHeaderErrorValueInput] = useState('')

  // Monitor state
  const [monitoredErrors, setMonitoredErrors] = useState<MonitoredError[]>([])
  const [monitorSummary, setMonitorSummary] = useState<{ totalErrors: number; unresolvedCount: number; resolvedCount: number; totalOccurrences: number } | null>(null)
  const [selectedError, setSelectedError] = useState<MonitoredError | null>(null)
  const [monitorFilter, setMonitorFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved')
  const [monitorSubTab, setMonitorSubTab] = useState<'errors' | 'settings'>('errors')

  const fetchTraces = useCallback(async (page: number = 1) => {
    if (!token || !projectId) return
    setTracesLoading(true)
    try {
      const tracesRes = await api.traces.list(projectId, token, {
        screenName: selectedScreen || undefined,
        deviceId: selectedDevice || undefined,
        page,
        limit: tracesPagination.limit
      })
      setTraces(tracesRes.traces)
      setScreenNames(tracesRes.screenNames || [])
      setTraceDevices(tracesRes.devices || [])
      if (tracesRes.pagination) {
        setTracesPagination(tracesRes.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch traces:', error)
    } finally {
      setTracesLoading(false)
    }
  }, [token, projectId, selectedScreen, selectedDevice, tracesPagination.limit])

  const fetchLogs = useCallback(async (page: number = 1) => {
    if (!token || !projectId) return
    setLogsLoading(true)
    try {
      const logsRes = await api.logs.list(projectId, token, {
        level: logLevelFilter || undefined,
        tag: logTagFilter || undefined,
        search: debouncedLogSearch || undefined,
        screenName: logScreenFilter || undefined,
        page,
        limit: logsPagination.limit
      })
      setLogs(logsRes.logs)
      setLogsTotal(logsRes.total)
      setLogLevels(logsRes.levels)
      setLogTags(logsRes.tags)
      setLogScreenNames(logsRes.screenNames)
      if (logsRes.pagination) {
        setLogsPagination(logsRes.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLogsLoading(false)
    }
  }, [token, projectId, logLevelFilter, logTagFilter, debouncedLogSearch, logScreenFilter, logsPagination.limit])

  const fetchCrashes = useCallback(async (page: number = 1) => {
    if (!token || !projectId) return
    setCrashesLoading(true)
    try {
      const crashesRes = await api.crashes.list(projectId, token, {
        platform: crashPlatformFilter || undefined,
        deviceId: crashDeviceFilter || undefined,
        search: debouncedCrashSearch || undefined,
        startDate: crashStartDate || undefined,
        endDate: crashEndDate || undefined,
        page,
        limit: crashesPagination.limit
      })
      setCrashes(crashesRes.crashes)
      setCrashesTotal(crashesRes.total)
      setCrashPlatforms(crashesRes.platforms || [])
      setCrashDevices(crashesRes.devices || [])
      if (crashesRes.pagination) {
        setCrashesPagination(crashesRes.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch crashes:', error)
    } finally {
      setCrashesLoading(false)
    }
  }, [token, projectId, crashPlatformFilter, crashDeviceFilter, debouncedCrashSearch, crashStartDate, crashEndDate, crashesPagination.limit])

  const clearLogs = async (level?: string) => {
    if (!token || !projectId) return
    setClearingLogs(true)
    try {
      await api.logs.clear(projectId, token, { level })
      fetchLogs()
    } catch (error) {
      console.error('Failed to clear logs:', error)
    } finally {
      setClearingLogs(false)
    }
  }

  const fetchConfigs = async () => {
    if (!token || !projectId) return
    try {
      const configRes = await api.config.list(projectId, token)
      setConfigs(configRes.configs)
      setSuggestedEndpoints(configRes.suggestedEndpoints || [])
    } catch (error) {
      console.error('Failed to fetch configs:', error)
    }
  }

  const fetchAnalytics = async () => {
    if (!token || !projectId) return
    setAnalyticsLoading(true)
    try {
      const analyticsRes = await api.analytics.get(projectId, token)
      setAnalytics(analyticsRes)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const fetchFlow = async () => {
    if (!token || !projectId) return
    setFlowLoading(true)
    try {
      const flowRes = await api.flow.get(projectId, token, selectedFlowSession || undefined)
      setFlowData(flowRes)
    } catch (error) {
      console.error('Failed to fetch flow:', error)
    } finally {
      setFlowLoading(false)
    }
  }

  const fetchTimeline = async (sessionId: string) => {
    if (!token || !sessionId) return
    setTimelineLoading(true)
    try {
      const timelineRes = await api.sessions.timeline(sessionId, token)
      setTimelineData(timelineRes)
    } catch (error) {
      console.error('Failed to fetch timeline:', error)
    } finally {
      setTimelineLoading(false)
    }
  }

  const fetchSettings = async () => {
    if (!token || !projectId) return
    try {
      const settingsRes = await api.settings.get(projectId, token)
      setNotificationSettings(settingsRes.settings)
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  }

  const fetchSubscriptionStatus = async () => {
    if (!token) return
    try {
      const [usageRes, subRes] = await Promise.all([
        api.subscription.getUsage(token).catch(() => null),
        api.subscription.get(token).catch(() => null)
      ])
      if (usageRes?.usage || subRes?.subscription) {
        const subscription = subRes?.subscription
        setSubscriptionStatus({
          status: subscription?.status || (usageRes?.usage?.trialActive ? 'active' : 'expired'),
          trialActive: usageRes?.usage?.trialActive ?? true,
          daysRemaining: usageRes?.usage?.daysRemaining || 0,
          enabled: subscription?.enabled ?? true,
        })
      }
    } catch (error) {
      // Silently fail - subscription check is not critical
    }
  }

  const fetchFeatureFlags = async () => {
    if (!token || !projectId) return
    setFeatureFlagsLoading(true)
    try {
      const flagsRes = await api.featureFlags.get(projectId, token)
      // Ensure sdkEnabled defaults to true if not present (backward compatibility)
      setFeatureFlags({
        sdkEnabled: true,
        ...flagsRes.flags
      } as FeatureFlags)
    } catch (error) {
      console.error('Failed to fetch feature flags:', error)
    } finally {
      setFeatureFlagsLoading(false)
    }
  }

  const updateFeatureFlag = async (key: keyof FeatureFlags, value: boolean) => {
    if (!token || !projectId) return
    try {
      const flagsRes = await api.featureFlags.update(projectId, token, { [key]: value })
      setFeatureFlags(flagsRes.flags as FeatureFlags)
    } catch (error) {
      console.error('Failed to update feature flag:', error)
    }
  }

  const fetchSdkSettings = async () => {
    if (!token || !projectId) return
    setSdkSettingsLoading(true)
    try {
      const res = await fetch(`/api/sdk-settings?projectId=${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.settings) {
        setSdkSettings(data.settings)
      }
    } catch (error) {
      console.error('Failed to fetch SDK settings:', error)
    } finally {
      setSdkSettingsLoading(false)
    }
  }

  const updateSdkSetting = async (updates: Partial<SdkSettings>) => {
    if (!token || !projectId || !sdkSettings) return
    try {
      const res = await fetch('/api/sdk-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ projectId, ...updates })
      })
      const data = await res.json()
      if (data.settings) {
        setSdkSettings(prev => prev ? { ...prev, ...updates } : prev)
      }
    } catch (error) {
      console.error('Failed to update SDK settings:', error)
    }
  }

  const handleCleanupData = async (type: 'devices' | 'traces' | 'logs' | 'sessions' | 'crashes' | 'screens' | 'all') => {
    if (!token || !projectId) return

    try {
      const res = await fetch('/api/cleanup', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ projectId, type })
      })

      const data = await res.json()

      if (res.ok) {
        alert(`✅ Success!\n\n${data.message}\n\nDeleted items: ${data.deletedCount || 0}`)

        // Reload the page to refresh all data
        window.location.reload()
      } else {
        alert(`❌ Error: ${data.error || 'Failed to delete data'}`)
      }
    } catch (error) {
      console.error('Failed to cleanup data:', error)
      alert('❌ Failed to delete data. Please try again.')
    }
  }

  const fetchAlerts = async () => {
    if (!token || !projectId) return
    try {
      const alertsRes = await api.alerts.list(projectId, token)
      setAlerts(alertsRes.alerts)
      setStandardErrorCodes(alertsRes.standardErrorCodes)
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
    }
  }

  const fetchMonitoredErrors = async () => {
    if (!token || !projectId) return
    try {
      const isResolved = monitorFilter === 'all' ? undefined : monitorFilter === 'resolved'
      const monitorRes = await api.monitor.list(projectId, token, { isResolved })
      setMonitoredErrors(monitorRes.errors)
      setMonitorSummary(monitorRes.summary)
    } catch (error) {
      console.error('Failed to fetch monitored errors:', error)
    }
  }

  const handleSaveNotificationSettings = async (updates: {
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
  }) => {
    if (!token || !projectId) return
    try {
      await api.settings.update(projectId, token, updates)
      fetchSettings()
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  const handleCreateAlert = async () => {
    if (!token || !projectId || !newAlert.title) return
    try {
      await api.alerts.create(projectId, token, {
        title: newAlert.title,
        description: newAlert.description || undefined,
        endpoint: newAlert.endpoint || undefined,
        method: newAlert.method || undefined,
        monitorStandardErrors: newAlert.monitorStandardErrors,
        standardErrorCodes: newAlert.standardErrorCodes,
        customStatusCodes: newAlert.customStatusCodes,
        bodyErrorField: newAlert.bodyErrorField || undefined,
        bodyErrorValues: newAlert.bodyErrorValues,
        headerErrorField: newAlert.headerErrorField || undefined,
        headerErrorValues: newAlert.headerErrorValues,
        notifyEmail: newAlert.notifyEmail,
        notifyPush: newAlert.notifyPush,
        notifySms: newAlert.notifySms,
        notifyWebhook: newAlert.notifyWebhook,
        cooldownMinutes: newAlert.cooldownMinutes
      })
      setShowAddAlert(false)
      setNewAlert({
        title: '',
        description: '',
        endpoint: '',
        method: '',
        monitorStandardErrors: true,
        standardErrorCodes: [],
        customStatusCodes: [],
        bodyErrorField: '',
        bodyErrorValues: [],
        headerErrorField: '',
        headerErrorValues: [],
        notifyEmail: true,
        notifyPush: false,
        notifySms: false,
        notifyWebhook: false,
        cooldownMinutes: 5
      })
      fetchAlerts()
    } catch (error) {
      console.error('Failed to create alert:', error)
    }
  }

  const handleUpdateAlert = async (alert: ApiAlert, fullUpdate = false) => {
    if (!token) return
    try {
      if (fullUpdate) {
        // Full update - include all editable fields
        await api.alerts.update(token, {
          id: alert.id,
          title: alert.title,
          description: alert.description,
          endpoint: alert.endpoint,
          method: alert.method,
          isEnabled: alert.isEnabled,
          monitorStandardErrors: alert.monitorStandardErrors,
          standardErrorCodes: alert.standardErrorCodes,
          customStatusCodes: alert.customStatusCodes,
          bodyErrorField: alert.bodyErrorField,
          bodyErrorValues: alert.bodyErrorValues,
          notifyEmail: alert.notifyEmail,
          notifyPush: alert.notifyPush,
          notifySms: alert.notifySms,
          notifyWebhook: alert.notifyWebhook
        })
      } else {
        // Quick update - just toggle isEnabled
        await api.alerts.update(token, {
          id: alert.id,
          isEnabled: alert.isEnabled
        })
      }

      setEditingAlert(null)
      fetchAlerts()
    } catch (error) {
      console.error('Failed to update alert:', error)
    }
  }

  const handleDeleteAlert = async (alertId: string) => {
    if (!token || !confirm('Are you sure you want to delete this alert?')) return
    try {
      await api.alerts.delete(alertId, token)
      fetchAlerts()
    } catch (error) {
      console.error('Failed to delete alert:', error)
    }
  }

  const handleResolveError = async (errorId: string, resolved: boolean) => {
    if (!token) return
    try {
      await api.monitor.update(token, { id: errorId, isResolved: resolved })
      fetchMonitoredErrors()
      setSelectedError(null)
    } catch (error) {
      console.error('Failed to resolve error:', error)
    }
  }

  // Quick enable monitoring for an endpoint (from traces or config)
  const handleQuickEnableMonitoring = async (endpoint: string, method: string, statusCode?: number) => {
    if (!token || !projectId) return
    try {
      // Extract endpoint path from full URL
      let endpointPath: string
      try {
        const url = new URL(endpoint)
        endpointPath = url.pathname
      } catch {
        endpointPath = endpoint
      }

      // Use the exact status code if it's an error, otherwise use defaults
      const standardErrorCodes: number[] = []
      const customStatusCodes: number[] = []

      if (statusCode && statusCode >= 400) {
        // Use the exact status code from the trace
        const standardCodes = [400, 401, 403, 404, 405, 408, 409, 410, 413, 414, 415, 422, 429, 500, 501, 502, 503, 504]
        if (standardCodes.includes(statusCode)) {
          standardErrorCodes.push(statusCode)
        } else {
          customStatusCodes.push(statusCode)
        }
      } else {
        // Default: monitor common errors
        standardErrorCodes.push(400, 401, 403, 404, 500, 502, 503)
      }

      await api.alerts.create(projectId, token, {
        title: `Monitor ${method || '*'} ${endpointPath}`,
        description: statusCode ? `Monitoring for ${statusCode} errors` : `Auto-created alert for ${endpointPath}`,
        endpoint: endpointPath,
        method: method || undefined,
        monitorStandardErrors: standardErrorCodes.length > 0,
        standardErrorCodes,
        customStatusCodes,
        notifyEmail: true
      })

      // Refresh alerts list
      fetchAlerts()
    } catch (error) {
      console.error('Failed to enable monitoring:', error)
    }
  }

  // Check if an endpoint is being monitored
  const isEndpointMonitored = (endpoint: string, method?: string): boolean => {
    let endpointPath: string
    try {
      const url = new URL(endpoint)
      endpointPath = url.pathname
    } catch {
      endpointPath = endpoint
    }

    return alerts.some(alert => {
      if (!alert.isEnabled) return false
      if (alert.endpoint === endpointPath) {
        if (!alert.method || alert.method === method) return true
      }
      // Check wildcard patterns
      if (alert.endpoint?.endsWith('/*')) {
        const pattern = alert.endpoint.slice(0, -2)
        if (endpointPath.startsWith(pattern)) {
          if (!alert.method || alert.method === method) return true
        }
      }
      return false
    })
  }

  // Disable monitoring for an endpoint
  const handleDisableMonitoring = async (endpoint: string, method?: string) => {
    if (!token) return

    let endpointPath: string
    try {
      const url = new URL(endpoint)
      endpointPath = url.pathname
    } catch {
      endpointPath = endpoint
    }

    const matchingAlert = alerts.find(alert => {
      if (alert.endpoint === endpointPath) {
        if (!alert.method || alert.method === method) return true
      }
      if (alert.endpoint?.endsWith('/*')) {
        const pattern = alert.endpoint.slice(0, -2)
        if (endpointPath.startsWith(pattern)) {
          if (!alert.method || alert.method === method) return true
        }
      }
      return false
    })

    if (matchingAlert) {
      try {
        await api.alerts.delete(matchingAlert.id, token)
        fetchAlerts()
      } catch (error) {
        console.error('Failed to disable monitoring:', error)
      }
    }
  }

  const handleCreateConfig = async () => {
    if (!token || !projectId || !newConfig.endpoint) return
    try {
      await api.config.create(projectId, token, {
        endpoint: newConfig.endpoint,
        method: newConfig.method || undefined,
        name: newConfig.name || undefined,
        costPerRequest: newConfig.costPerRequest
      })
      setShowAddConfig(false)
      setNewConfig({ endpoint: '', method: '', name: '', costPerRequest: 0 })
      fetchConfigs()
    } catch (error) {
      console.error('Failed to create config:', error)
    }
  }

  const handleUpdateConfig = async (config: ApiConfig) => {
    if (!token) return
    try {
      await api.config.update(token, {
        id: config.id,
        endpoint: config.endpoint,
        method: config.method || undefined,
        name: config.name || undefined,
        costPerRequest: config.costPerRequest,
        isEnabled: config.isEnabled
      })
      setEditingConfig(null)
      fetchConfigs()
    } catch (error) {
      console.error('Failed to update config:', error)
    }
  }

  const handleDeleteConfig = async (configId: string) => {
    if (!token || !confirm('Are you sure you want to delete this config?')) return
    try {
      await api.config.delete(configId, token)
      fetchConfigs()
    } catch (error) {
      console.error('Failed to delete config:', error)
    }
  }

  const addSuggestedEndpoint = (endpoint: SuggestedEndpoint) => {
    setNewConfig({
      endpoint: endpoint.endpoint,
      method: endpoint.method,
      name: '',
      costPerRequest: 0
    })
    setShowAddConfig(true)
  }

  // OPTION 2: Fetch shared usage/enforcement once at top level
  useEffect(() => {
    if (!token) return

    const fetchSharedData = async () => {
      try {
        const [enforcementRes, usageRes] = await Promise.all([
          api.subscription.getEnforcement(token).catch(() => null),
          api.subscription.getUsage(token).catch(() => null)
        ])

        if (enforcementRes) {
          setSharedEnforcement(enforcementRes)
        }

        if (usageRes?.usage) {
          setSharedUsage(usageRes.usage)
        }
      } catch (error) {
        console.error('Failed to fetch shared usage/enforcement:', error)
      }
    }

    fetchSharedData()
  }, [token])

  // OPTION 1: Initial fetch - only load essential data (project info + default tab: devices)
  useEffect(() => {
    if (!token || !projectId) return

    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch subscription status
        fetchSubscriptionStatus()

        // Only fetch project info and default tab (devices) on initial load
        const [devicesRes, projectsRes] = await Promise.all([
          api.devices.list(projectId, token),
          api.projects.list(token)
        ])

        setDevices(devicesRes.devices as Device[])
        setDeviceStats(devicesRes.stats)
        setDevicesPagination(devicesRes.pagination)

        const project = projectsRes.projects.find(p => p.id === projectId)
        if (project) {
          setApiKey(project.apiKey)
          setProjectName(project.name)
          setEditingProjectName(project.name)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, projectId])

  // Refetch traces when filters change or tab is selected
  useEffect(() => {
    if (!loading && activeTab === 'traces') {
      fetchTraces(1) // Reset to page 1 when filters change
    }
  }, [selectedScreen, selectedDevice, activeTab, loading])

  // Refetch traces when limit changes
  useEffect(() => {
    if (!loading && activeTab === 'traces') {
      fetchTraces(1)
    }
  }, [tracesPagination.limit])

  // OPTION 2: Use shared enforcement/usage data instead of fetching per tab
  // Set enforcement/usage for all tabs when shared data loads (not just active tab)
  useEffect(() => {
    if (!sharedEnforcement || !sharedUsage) return

    // Always set devices enforcement/usage (default tab, needs to be available immediately)
    setDeviceEnforcement(sharedEnforcement)
    if (sharedUsage.devices) {
      setDeviceUsage(sharedUsage.devices)
    }

    // Always set traces enforcement/usage (commonly used tab)
    setApiTracesEnforcement(sharedEnforcement)
    if (sharedUsage.apiRequests && sharedUsage.apiEndpoints) {
      setApiTracesUsage({
        apiRequests: sharedUsage.apiRequests,
        apiEndpoints: sharedUsage.apiEndpoints
      })
    }

    // Set enforcement/usage for other tabs when they become active
    if (activeTab === 'flow') {
      setSessionsEnforcement(sharedEnforcement)
      if (sharedUsage.sessions) {
        setSessionsUsage(sharedUsage.sessions)
      }
    } else if (activeTab === 'logs') {
      setLogsEnforcement(sharedEnforcement)
      if (sharedUsage.logs) {
        setLogsUsage(sharedUsage.logs)
      }
    } else if (activeTab === 'crashes') {
      setCrashesEnforcement(sharedEnforcement)
      if (sharedUsage.crashes) {
        setCrashesUsage(sharedUsage.crashes)
      }
    } else if (activeTab === 'traces') {
      // Already set above, but ensure it's set when traces tab is active
      setApiTracesEnforcement(sharedEnforcement)
      if (sharedUsage.apiRequests && sharedUsage.apiEndpoints) {
        setApiTracesUsage({
          apiRequests: sharedUsage.apiRequests,
          apiEndpoints: sharedUsage.apiEndpoints
        })
      }
    } else if (activeTab === 'devices') {
      // Already set above, but ensure it's set when devices tab is active
      setDeviceEnforcement(sharedEnforcement)
      if (sharedUsage.devices) {
        setDeviceUsage(sharedUsage.devices)
      }
    }
  }, [sharedEnforcement, sharedUsage, activeTab])

  // Separate effects to ensure usage state is set when sharedUsage changes (fallback)
  useEffect(() => {
    if (sharedUsage?.devices && !deviceUsage) {
      setDeviceUsage(sharedUsage.devices)
    }
  }, [sharedUsage, deviceUsage])

  useEffect(() => {
    if (sharedUsage?.logs && !logsUsage) {
      setLogsUsage(sharedUsage.logs)
    }
  }, [sharedUsage, logsUsage])

  useEffect(() => {
    if (sharedUsage?.crashes && !crashesUsage) {
      setCrashesUsage(sharedUsage.crashes)
    }
  }, [sharedUsage, crashesUsage])

  useEffect(() => {
    if (sharedUsage?.apiRequests && sharedUsage?.apiEndpoints && !apiTracesUsage) {
      setApiTracesUsage({
        apiRequests: sharedUsage.apiRequests,
        apiEndpoints: sharedUsage.apiEndpoints
      })
    }
  }, [sharedUsage, apiTracesUsage])

  // Fetch devices with filters and pagination
  const fetchDevices = useCallback(async (page: number = 1) => {
    if (!token) return
    setDevicesLoading(true)
    try {
      const devicesRes = await api.devices.list(projectId, token, {
        platform: devicePlatformFilter || undefined,
        startDate: deviceStartDate || undefined,
        endDate: deviceEndDate || undefined,
        search: debouncedDeviceSearch || undefined,
        debugMode: deviceDebugModeFilter || undefined,
        deviceCategory: deviceCategoryFilter || undefined,
        deviceBrand: deviceBrandFilter || undefined,
        language: deviceLanguageFilter || undefined,
        page,
        limit: devicesPagination.limit
      })
      setDevices(devicesRes.devices as Device[])
      setDeviceStats(devicesRes.stats)
      setDevicesPagination(devicesRes.pagination)

      // Use shared enforcement/usage data (already fetched at top level)
      if (activeTab === 'devices' && sharedEnforcement && sharedUsage) {
        setDeviceEnforcement(sharedEnforcement)
        if (sharedUsage.devices) {
          setDeviceUsage(sharedUsage.devices)
        }
      }
    } catch (error) {
      console.error('Failed to fetch devices:', error)
    } finally {
      setDevicesLoading(false)
    }
  }, [token, projectId, devicePlatformFilter, deviceCategoryFilter, deviceBrandFilter, deviceLanguageFilter, deviceStartDate, deviceEndDate, debouncedDeviceSearch, deviceDebugModeFilter, devicesPagination.limit, activeTab])

  // Handle device page change
  const handleDevicePageChange = useCallback((page: number) => {
    fetchDevices(page)
  }, [fetchDevices])

  // Handle device limit change
  const handleDeviceLimitChange = useCallback((limit: number) => {
    setDevicesPagination(prev => ({ ...prev, limit, page: 1 }))
  }, [])

  // Toggle debug mode for a device
  const toggleDeviceDebugMode = async (deviceId: string, enabled: boolean, expiresIn?: string) => {
    if (!token) return
    setTogglingDebugMode(deviceId)
    try {
      const response = await fetch(`/api/devices/${deviceId}/debug`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enabled, expiresIn })
      })
      if (!response.ok) throw new Error('Failed to toggle debug mode')
      // Refresh devices list to show updated status
      await fetchDevices()
    } catch (error) {
      console.error('Failed to toggle debug mode:', error)
    } finally {
      setTogglingDebugMode(null)
    }
  }

  // Delete a device and all its associated data
  const deleteDevice = async (deviceId: string) => {
    if (!token) return
    setDeletingDevice(deviceId)
    try {
      const response = await fetch(`/api/devices/${deviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Failed to delete device')
      // Refresh devices list to reflect deletion
      await fetchDevices()
    } catch (error) {
      console.error('Failed to delete device:', error)
    } finally {
      setDeletingDevice(null)
    }
  }

  // Refetch devices when filters or debounced search change
  useEffect(() => {
    if (!loading && activeTab === 'devices') {
      fetchDevices(1) // Reset to page 1 when filters change
    }
  }, [devicePlatformFilter, deviceStartDate, deviceEndDate, deviceDebugModeFilter, debouncedDeviceSearch, activeTab, loading])

  // Refetch devices when limit changes
  useEffect(() => {
    if (!loading && activeTab === 'devices') {
      fetchDevices(1)
    }
  }, [devicesPagination.limit])

  // Handle logs page change
  const handleLogsPageChange = useCallback((page: number) => {
    fetchLogs(page)
  }, [fetchLogs])

  // Handle logs limit change
  const handleLogsLimitChange = useCallback((limit: number) => {
    setLogsPagination(prev => ({ ...prev, limit, page: 1 }))
  }, [])

  // Handle traces page change
  const handleTracesPageChange = useCallback((page: number) => {
    fetchTraces(page)
  }, [fetchTraces])

  // Handle traces limit change
  const handleTracesLimitChange = useCallback((limit: number) => {
    setTracesPagination(prev => ({ ...prev, limit, page: 1 }))
  }, [])

  // OPTION 1: Lazy loading - fetch logs only when logs tab is active and data is empty
  useEffect(() => {
    if (!token || !projectId || loading) return
    if (activeTab === 'logs' && logs.length === 0 && !logsLoading) {
      fetchLogs(1)
    }
  }, [activeTab, logs.length, logsLoading, token, projectId, loading, fetchLogs])

  // Fetch logs when logs tab is selected or filters change (if data already exists)
  useEffect(() => {
    if (activeTab === 'logs' && !loading && logs.length > 0) {
      fetchLogs(1) // Reset to page 1 when filters change
    }
  }, [activeTab, loading, logLevelFilter, logTagFilter, logScreenFilter, debouncedLogSearch, logs.length, fetchLogs])

  // Refetch logs when limit changes
  useEffect(() => {
    if (!loading && activeTab === 'logs') {
      fetchLogs(1)
    }
  }, [logsPagination.limit])

  // OPTION 1: Lazy loading - fetch crashes only when crashes tab is active and data is empty
  useEffect(() => {
    if (!token || !projectId || loading) return
    if (activeTab === 'crashes' && crashes.length === 0 && !crashesLoading) {
      fetchCrashes(1)
    }
  }, [activeTab, crashes.length, crashesLoading, token, projectId, loading, fetchCrashes])

  // Fetch crashes when crashes tab is selected or filters change (if data already exists)
  useEffect(() => {
    if (activeTab === 'crashes' && !loading && crashes.length > 0) {
      fetchCrashes(1) // Reset to page 1 when filters change
    }
  }, [activeTab, loading, crashPlatformFilter, crashDeviceFilter, crashStartDate, crashEndDate, debouncedCrashSearch, crashes.length, fetchCrashes])

  // Refetch crashes when limit changes
  useEffect(() => {
    if (!loading && activeTab === 'crashes') {
      fetchCrashes(1)
    }
  }, [crashesPagination.limit])

  // Handle crashes page change
  const handleCrashesPageChange = useCallback((page: number) => {
    fetchCrashes(page)
  }, [fetchCrashes])

  // Handle crashes limit change
  const handleCrashesLimitChange = useCallback((limit: number) => {
    setCrashesPagination(prev => ({ ...prev, limit, page: 1 }))
  }, [])

  // Fetch configs when config tab is selected
  useEffect(() => {
    if (activeTab === 'config' && !loading) {
      fetchConfigs()
    }
  }, [activeTab, loading])

  // Fetch analytics when analytics tab is selected
  useEffect(() => {
    if (activeTab === 'analytics' && !loading) {
      fetchAnalytics()
    }
  }, [activeTab, loading])

  // Fetch flow data when flow tab is selected or session changes
  useEffect(() => {
    if (activeTab === 'flow' && !loading) {
      fetchFlow()
    }
  }, [activeTab, loading, selectedFlowSession])

  // Fetch settings when settings tab is selected
  useEffect(() => {
    if (activeTab === 'settings' && !loading) {
      fetchSettings()
      fetchFeatureFlags()
      fetchSdkSettings()
      fetchSubscriptionStatus()
    }
  }, [activeTab, loading])

  // Fetch monitored errors when monitor tab is selected or filter changes
  useEffect(() => {
    if (activeTab === 'monitor' && !loading) {
      fetchMonitoredErrors()
    }
  }, [activeTab, loading, monitorFilter])

  // Initialize node positions when flowData changes
  useEffect(() => {
    if (flowData && flowData.nodes.length > 0) {
      const nodeWidth = 200
      const nodeHeight = 70
      const horizontalGap = 280
      const verticalGap = 160
      const cols = Math.max(2, Math.ceil(Math.sqrt(flowData.nodes.length)))

      const initialPositions: Record<string, { x: number; y: number }> = {}
      flowData.nodes.forEach((node, idx) => {
        initialPositions[node.id] = {
          x: (idx % cols) * horizontalGap + 40,
          y: Math.floor(idx / cols) * verticalGap + 40
        }
      })
      setNodePositions(initialPositions)
    }
  }, [flowData])

  // Get node position (either custom or default)
  const getNodePosition = (nodeId: string, nodeIdx: number) => {
    if (nodePositions[nodeId]) {
      return nodePositions[nodeId]
    }
    const horizontalGap = 280
    const verticalGap = 160
    const cols = Math.max(2, Math.ceil(Math.sqrt(flowData?.nodes.length || 1)))
    return {
      x: (nodeIdx % cols) * horizontalGap + 40,
      y: Math.floor(nodeIdx / cols) * verticalGap + 40
    }
  }

  // Handle mouse down on node
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault()
    const pos = nodePositions[nodeId] || { x: 0, y: 0 }
    setDraggingNode(nodeId)
    setDragOffset({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    })
  }

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNode) return
    const newX = e.clientX - dragOffset.x
    const newY = e.clientY - dragOffset.y
    setNodePositions(prev => ({
      ...prev,
      [draggingNode]: { x: Math.max(0, newX), y: Math.max(0, newY) }
    }))
  }

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setDraggingNode(null)
  }

  // Helper to extract endpoint name from URL
  const getEndpointName = (url: string) => {
    try {
      const urlObj = new URL(url)
      const path = urlObj.pathname
      // Get last meaningful segment of the path
      const segments = path.split('/').filter(Boolean)
      return segments.slice(-2).join('/') || path
    } catch {
      return url
    }
  }

  // Group traces by selected grouping
  const groupedTraces = React.useMemo(() => {
    if (groupBy === 'none') return null

    const groups: Record<string, { key: string; label: string; traces: Trace[]; count: number }> = {}

    traces.forEach(trace => {
      let key: string
      let label: string

      switch (groupBy) {
        case 'screen':
          key = trace.screenName || 'Unknown Screen'
          label = key
          break
        case 'endpoint':
          key = getEndpointName(trace.url)
          label = key
          break
        case 'device':
          key = trace.device?.deviceId || 'Unknown Device'
          label = trace.device ? `${trace.device.model || trace.device.deviceId.slice(0, 8)} (${trace.device.platform})` : 'Unknown Device'
          break
        default:
          return
      }

      if (!groups[key]) {
        groups[key] = { key, label, traces: [], count: 0 }
      }
      groups[key].traces.push(trace)
      groups[key].count++
    })

    return Object.values(groups).sort((a, b) => b.count - a.count)
  }, [traces, groupBy])

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const clearTraces = async () => {
    if (!token || !confirm('Are you sure you want to clear all traces?')) return
    setClearing(true)
    try {
      await api.traces.clear(projectId, token, selectedDevice || undefined)
      await fetchTraces()
    } catch (error) {
      console.error('Failed to clear traces:', error)
    } finally {
      setClearing(false)
    }
  }

  const getNetworkIcon = (type?: string) => {
    switch (type) {
      case 'wifi': return '📶'
      case 'cellular': return '📱'
      case 'ethernet': return '🔌'
      case 'offline': return '❌'
      default: return '🌐'
    }
  }

  const formatBody = (body?: string) => {
    if (!body) return null
    try {
      return JSON.stringify(JSON.parse(body), null, 2)
    } catch {
      return body
    }
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'devices', label: 'Devices', count: devices.length },
    { id: 'traces', label: 'API Traces', count: traces.length },
    { id: 'flow', label: 'Screen Flow', count: flowData?.nodes.length },
    { id: 'config', label: 'API Config', count: configs.length },
    { id: 'analytics', label: 'Cost Analytics' },
    { id: 'monitor', label: 'Monitor', count: monitorSummary?.unresolvedCount },
    { id: 'business-config', label: 'Business Config' },
    { id: 'localization', label: 'Localization' },
    { id: 'mocks', label: 'API Mocks' },
    { id: 'logs', label: 'Logs', count: logs.length },
    { id: 'crashes', label: 'Crashes', count: crashes.length },
    { id: 'settings', label: 'Settings' },
    { id: 'setup', label: 'Setup' }
  ]

  const formatTime = (date: string) => {
    return new Date(date).toLocaleString()
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-400'
    if (status >= 400 && status < 500) return 'text-yellow-400'
    if (status >= 500) return 'text-red-400'
    return 'text-gray-400'
  }

  const tryFormatJson = (body: string | null | undefined): string => {
    if (!body) return ''
    try {
      return JSON.stringify(JSON.parse(body), null, 2)
    } catch {
      return body
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400 bg-red-900/30'
      case 'warn': return 'text-yellow-400 bg-yellow-900/30'
      case 'debug': return 'text-gray-400 bg-gray-700/30'
      default: return 'text-blue-400 bg-blue-900/30'
    }
  }

  if (loading) {
    return <div className="text-gray-400">Loading...</div>
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-white">Project Dashboard</h1>
          <div className="flex items-center space-x-2">
            <code className="px-3 py-1 bg-gray-800 rounded text-sm text-gray-300 font-mono">
              {apiKey.slice(0, 12)}...
            </code>
            <button
              onClick={copyApiKey}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
            >
              {copied ? 'Copied!' : 'Copy API Key'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <Sidebar
          onTabChange={(tab) => setActiveTab(tab as Tab)}
          activeTab={activeTab}
          counts={{
            devices: devices.length,
            traces: traces.length,
            logs: logs.length,
            crashes: crashes.length,
            flow: flowData?.nodes.length ?? 0,
            monitor: monitorSummary?.unresolvedCount ?? 0,
          }}
        />

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {activeTab === 'devices' && (
            <div className="space-y-4">
              {/* Sub-tabs */}
              <div className="border-b border-gray-800">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setDeviceSubTab('list')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${deviceSubTab === 'list'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-white'
                      }`}
                  >
                    Device List
                  </button>
                  <button
                    onClick={() => setDeviceSubTab('settings')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${deviceSubTab === 'settings'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-white'
                      }`}
                  >
                    Settings
                  </button>
                </nav>
              </div>

              {deviceSubTab === 'list' && (
                <>
                  {/* Enforcement Warning Banner for Device Registration */}
                  {(() => {
                    // Use deviceUsage if available, otherwise fallback to sharedUsage.devices
                    const usage = deviceUsage || sharedUsage?.devices
                    if (!usage) {
                      return null
                    }
                    if (usage.limit === null || usage.limit === undefined || usage.limit <= 0) {
                      return null
                    }

                    // Calculate percentage if not provided
                    const percentage = usage.percentage !== undefined
                      ? usage.percentage
                      : usage.limit > 0
                        ? (usage.used / usage.limit) * 100
                        : 0
                    const warnThreshold = 80 // Default warn threshold
                    const hardThreshold = 100 // Default hard threshold

                    // Show banner if quota exceeded (used >= limit) or percentage >= 100
                    const isExceeded = usage.used >= usage.limit || percentage >= hardThreshold
                    const isApproaching = !isExceeded && percentage >= warnThreshold

                    if (isExceeded) {
                      // HARD threshold exceeded
                      return (
                        <div className="bg-red-900/20 border-l-4 border-red-600 p-4 rounded mb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                                <span>🚫</span>
                                Device Registration Quota Exceeded
                              </h3>
                              <p className="text-gray-300 text-sm mb-2">
                                You have reached your device registration limit: <strong>{usage.used}/{usage.limit} devices</strong> ({percentage.toFixed(1)}%).
                              </p>
                              <p className="text-gray-300 text-sm">
                                New device registrations will be blocked. Please upgrade your plan to register more devices.
                              </p>
                            </div>
                            <button
                              onClick={() => router.push('/subscription')}
                              className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm whitespace-nowrap"
                            >
                              Upgrade Plan
                            </button>
                          </div>
                        </div>
                      )
                    } else if (isApproaching) {
                      // WARN threshold exceeded
                      return (
                        <div className="bg-yellow-900/20 border-l-4 border-yellow-600 p-4 rounded mb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
                                <span>⚠️</span>
                                Approaching Device Registration Limit
                              </h3>
                              <p className="text-gray-300 text-sm mb-2">
                                You are approaching your device registration limit: <strong>{usage.used}/{usage.limit} devices</strong> ({percentage.toFixed(1)}%).
                              </p>
                              <p className="text-gray-300 text-sm">
                                You can register {Math.max(0, usage.limit - usage.used)} more device{usage.limit - usage.used !== 1 ? 's' : ''} before reaching your limit.
                              </p>
                            </div>
                            <button
                              onClick={() => router.push('/subscription')}
                              className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm whitespace-nowrap"
                            >
                              Upgrade Plan
                            </button>
                          </div>
                        </div>
                      )
                    }
                    return null
                  })()}

                  {/* Action Bar */}
                  <div className="flex items-center justify-between bg-gray-900 rounded-lg p-4 border border-gray-800">
                    <div className="flex items-center gap-4">
                      {selectedDevices.size > 0 && (
                        <>
                          <span className="text-gray-300 text-sm">
                            {selectedDevices.size} device{selectedDevices.size > 1 ? 's' : ''} selected
                          </span>
                          <button
                            onClick={() => {
                              if (selectedDevices.size >= 2 && selectedDevices.size <= 5) {
                                setShowComparison(true)
                              } else {
                                alert('Please select 2-5 devices to compare')
                              }
                            }}
                            disabled={selectedDevices.size < 2 || selectedDevices.size > 5}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-750 text-white rounded-lg text-sm font-medium transition-colors border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Compare Selected
                          </button>
                          <button
                            onClick={() => setSelectedDevices(new Set())}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-750 text-gray-300 rounded-lg text-sm font-medium transition-colors border border-gray-700"
                          >
                            Clear Selection
                          </button>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        if (token) {
                          const format = confirm('Export as CSV? (Click Cancel for JSON)') ? 'csv' : 'json'
                          api.devices.export(projectId, format, token)
                            .then((data) => {
                              if (format === 'csv') {
                                const blob = new Blob([data as string], { type: 'text/csv' })
                                const url = window.URL.createObjectURL(blob)
                                const a = document.createElement('a')
                                a.href = url
                                a.download = `devices-${projectId}-${new Date().toISOString().split('T')[0]}.csv`
                                a.click()
                              } else {
                                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                                const url = window.URL.createObjectURL(blob)
                                const a = document.createElement('a')
                                a.href = url
                                a.download = `devices-${projectId}-${new Date().toISOString().split('T')[0]}.json`
                                a.click()
                              }
                            })
                            .catch((err) => {
                              console.error('Export failed:', err)
                              alert('Failed to export devices')
                            })
                        }
                      }}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-750 text-white rounded-lg text-sm font-medium transition-colors border border-gray-700"
                    >
                      Export Devices
                    </button>
                  </div>

                  {/* Stats Cards - Clean Professional Design */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                      <div className="text-gray-400 text-xs mb-1">Total Devices</div>
                      <div className="text-2xl font-bold text-white">{deviceStats.total}</div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                      <div className="text-gray-400 text-xs mb-1">Android</div>
                      <div className="text-2xl font-bold text-white">{deviceStats.android}</div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                      <div className="text-gray-400 text-xs mb-1">iOS</div>
                      <div className="text-2xl font-bold text-white">{deviceStats.ios}</div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                      <div className="text-gray-400 text-xs mb-1">Debug Mode</div>
                      <div className="text-2xl font-bold text-white">{deviceStats.debugModeCount}</div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                      <div className="text-gray-400 text-xs mb-1">Today</div>
                      <div className="text-2xl font-bold text-white">{deviceStats.today}</div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                      <div className="text-gray-400 text-xs mb-1">This Week</div>
                      <div className="text-2xl font-bold text-white">{deviceStats.thisWeek}</div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                      <div className="text-gray-400 text-xs mb-1">This Month</div>
                      <div className="text-2xl font-bold text-white">{deviceStats.thisMonth}</div>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Search */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={deviceSearch}
                          onChange={(e) => setDeviceSearch(e.target.value)}
                          placeholder="Search device code, user..."
                          className="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-sm border border-gray-700 focus:border-blue-500 focus:outline-none w-56"
                        />
                        {deviceSearch && (
                          <button
                            onClick={() => setDeviceSearch('')}
                            className="px-2 py-1.5 bg-gray-800 text-gray-400 hover:text-white rounded-lg text-sm border border-gray-700"
                            title="Clear search"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Platform Filter */}
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">Platform:</span>
                        <select
                          value={devicePlatformFilter}
                          onChange={(e) => setDevicePlatformFilter(e.target.value)}
                          className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">All</option>
                          <option value="android">Android</option>
                          <option value="ios">iOS</option>
                        </select>
                      </div>

                      {/* Debug Mode Filter */}
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">Debug:</span>
                        <select
                          value={deviceDebugModeFilter}
                          onChange={(e) => setDeviceDebugModeFilter(e.target.value)}
                          className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">All</option>
                          <option value="enabled">Debug Only</option>
                        </select>
                      </div>

                      {/* Device Category Filter */}
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">Category:</span>
                        <select
                          value={deviceCategoryFilter}
                          onChange={(e) => setDeviceCategoryFilter(e.target.value)}
                          className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">All</option>
                          <option value="mobile">Mobile</option>
                          <option value="tablet">Tablet</option>
                          <option value="desktop">Desktop</option>
                          <option value="tv">TV</option>
                        </select>
                      </div>

                      {/* Device Brand Filter */}
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">Brand:</span>
                        <input
                          type="text"
                          value={deviceBrandFilter}
                          onChange={(e) => setDeviceBrandFilter(e.target.value)}
                          placeholder="Filter by brand..."
                          className="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-sm border border-gray-700 focus:border-blue-500 focus:outline-none w-32"
                        />
                        {deviceBrandFilter && (
                          <button
                            onClick={() => setDeviceBrandFilter('')}
                            className="px-2 py-1.5 bg-gray-800 text-gray-400 hover:text-white rounded-lg text-sm border border-gray-700"
                            title="Clear brand filter"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Language Filter */}
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">Language:</span>
                        <input
                          type="text"
                          value={deviceLanguageFilter}
                          onChange={(e) => setDeviceLanguageFilter(e.target.value)}
                          placeholder="e.g., en, fr..."
                          className="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-sm border border-gray-700 focus:border-blue-500 focus:outline-none w-24"
                        />
                        {deviceLanguageFilter && (
                          <button
                            onClick={() => setDeviceLanguageFilter('')}
                            className="px-2 py-1.5 bg-gray-800 text-gray-400 hover:text-white rounded-lg text-sm border border-gray-700"
                            title="Clear language filter"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Date Range Filter */}
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">Registered:</span>
                        <input
                          type="date"
                          value={deviceStartDate}
                          onChange={(e) => setDeviceStartDate(e.target.value)}
                          className="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-sm border border-gray-700 focus:border-blue-500 focus:outline-none"
                          placeholder="From"
                        />
                        <span className="text-gray-400">to</span>
                        <input
                          type="date"
                          value={deviceEndDate}
                          onChange={(e) => setDeviceEndDate(e.target.value)}
                          className="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-sm border border-gray-700 focus:border-blue-500 focus:outline-none"
                          placeholder="To"
                        />
                        {(deviceStartDate || deviceEndDate) && (
                          <button
                            onClick={() => {
                              setDeviceStartDate('')
                              setDeviceEndDate('')
                            }}
                            className="px-2 py-1.5 bg-gray-800 text-gray-400 hover:text-white rounded-lg text-sm border border-gray-700"
                            title="Clear date filter"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Loading indicator */}
                      {devicesLoading && (
                        <div className="text-gray-500 text-sm flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Loading...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Device List */}
                  {devicesLoading && devices.length === 0 ? (
                    <SkeletonDeviceList count={6} />
                  ) : devices.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                      {devicePlatformFilter || deviceStartDate || deviceEndDate || debouncedDeviceSearch
                        ? 'No devices match the current filters'
                        : 'No devices registered yet'}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {/* Pagination at top */}
                      {devicesPagination.totalPages > 1 && (
                        <Pagination
                          pagination={devicesPagination}
                          onPageChange={handleDevicePageChange}
                          onLimitChange={handleDeviceLimitChange}
                          className="bg-gray-900 rounded-lg p-4"
                        />
                      )}
                      {devices.map((device) => (
                        <DeviceCard
                          key={device.id}
                          device={device}
                          togglingDebugMode={togglingDebugMode}
                          onToggleDebugMode={toggleDeviceDebugMode}
                          deletingDevice={deletingDevice}
                          onDeleteDevice={deleteDevice}
                          trackingMode={sdkSettings?.trackingMode || 'all'}
                          selected={selectedDevices.has(device.id)}
                          onSelect={(selected) => {
                            const newSet = new Set(selectedDevices)
                            if (selected) {
                              newSet.add(device.id)
                            } else {
                              newSet.delete(device.id)
                            }
                            setSelectedDevices(newSet)
                          }}
                          onViewDetails={() => setSelectedDeviceForDetails(device.id)}
                        />
                      ))}
                      {/* Pagination at bottom */}
                      {devicesPagination.totalPages > 1 && (
                        <Pagination
                          pagination={devicesPagination}
                          onPageChange={handleDevicePageChange}
                          onLimitChange={handleDeviceLimitChange}
                          showLimitSelector={false}
                          className="bg-gray-900 rounded-lg p-4"
                        />
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Device Comparison Modal */}
              {showComparison && token && selectedDevices.size >= 2 && (
                <DeviceComparison
                  deviceIds={Array.from(selectedDevices)}
                  token={token}
                  onClose={() => {
                    setShowComparison(false)
                    setSelectedDevices(new Set())
                  }}
                />
              )}

              {/* Device Details Modal */}
              {selectedDeviceForDetails && token && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-gray-900 rounded-lg border border-gray-800 max-w-4xl w-full max-h-[90vh] overflow-auto">
                    <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between">
                      <h2 className="text-xl font-bold text-white">Device Details</h2>
                      <button
                        onClick={() => setSelectedDeviceForDetails(null)}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-750 text-white rounded-lg text-sm font-medium transition-colors border border-gray-700"
                      >
                        Close
                      </button>
                    </div>
                    <div className="p-6">
                      <DeviceNotes deviceId={selectedDeviceForDetails} token={token} />
                    </div>
                  </div>
                </div>
              )}

              {deviceSubTab === 'settings' && token && sdkSettings && (
                <div className="space-y-6">
                  {/* Tracking Mode */}
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">📡</span>
                      <div>
                        <h3 className="text-white font-medium">Tracking Mode</h3>
                        <p className="text-gray-400 text-sm">Control which devices send API traces and session data</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${sdkSettings.trackingMode === 'all'
                            ? 'bg-blue-600/20 border-2 border-blue-500'
                            : 'bg-gray-800 hover:bg-gray-750 border-2 border-transparent'
                          }`}
                        onClick={() => updateSdkSetting({ trackingMode: 'all' })}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🌍</span>
                          <div>
                            <p className="text-white text-sm font-medium">All Devices</p>
                            <p className="text-gray-500 text-xs">Track all devices (recommended for development/testing)</p>
                          </div>
                        </div>
                        {sdkSettings.trackingMode === 'all' && (
                          <span className="text-blue-400 text-lg">✓</span>
                        )}
                      </div>

                      <div
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${sdkSettings.trackingMode === 'debug_only'
                            ? 'bg-orange-600/20 border-2 border-orange-500'
                            : 'bg-gray-800 hover:bg-gray-750 border-2 border-transparent'
                          }`}
                        onClick={() => updateSdkSetting({ trackingMode: 'debug_only' })}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🐛</span>
                          <div>
                            <p className="text-white text-sm font-medium">Debug Devices Only</p>
                            <p className="text-gray-500 text-xs">Only track devices with debug mode enabled (recommended for production)</p>
                          </div>
                        </div>
                        {sdkSettings.trackingMode === 'debug_only' && (
                          <span className="text-orange-400 text-lg">✓</span>
                        )}
                      </div>

                      <div
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${sdkSettings.trackingMode === 'none'
                            ? 'bg-red-600/20 border-2 border-red-500'
                            : 'bg-gray-800 hover:bg-gray-750 border-2 border-transparent'
                          }`}
                        onClick={() => updateSdkSetting({ trackingMode: 'none' })}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🚫</span>
                          <div>
                            <p className="text-white text-sm font-medium">Disabled</p>
                            <p className="text-gray-500 text-xs">No devices will send API traces or session data</p>
                          </div>
                        </div>
                        {sdkSettings.trackingMode === 'none' && (
                          <span className="text-red-400 text-lg">✓</span>
                        )}
                      </div>
                    </div>
                    {sdkSettings.trackingMode === 'debug_only' && (
                      <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                        <p className="text-orange-400 text-sm">
                          💡 <strong>Tip:</strong> Enable debug mode on specific devices from the Device List tab to start tracking them.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-4">
              {/* Sub-tabs */}
              <div className="border-b border-gray-800">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setLogsSubTab('list')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${logsSubTab === 'list'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-white'
                      }`}
                  >
                    Logs
                  </button>
                  <button
                    onClick={() => setLogsSubTab('settings')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${logsSubTab === 'settings'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-white'
                      }`}
                  >
                    Settings
                  </button>
                </nav>
              </div>

              {logsSubTab === 'list' && (
                <>
                  {/* Enforcement Banner for Logs */}
                  {(() => {
                    // Use logsUsage if available, otherwise fallback to sharedUsage.logs
                    const usage = logsUsage || sharedUsage?.logs
                    if (!usage || usage.limit === null || usage.limit === undefined || usage.limit <= 0) {
                      return null
                    }

                    const percentage = usage.percentage !== undefined
                      ? usage.percentage
                      : usage.limit > 0
                        ? (usage.used / usage.limit) * 100
                        : 0
                    const warnThreshold = 80
                    const hardThreshold = 100

                    // Show banner if quota exceeded (used >= limit) or percentage >= 100
                    const isExceeded = usage.used >= usage.limit || percentage >= hardThreshold
                    const isApproaching = !isExceeded && percentage >= warnThreshold

                    if (isExceeded) {
                      return (
                        <div className="bg-red-900/20 border-l-4 border-red-600 p-4 rounded mb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                                <span>🚫</span>
                                <span>Logs Quota Exceeded</span>
                              </h3>
                              <p className="text-gray-300 text-sm mb-2">
                                You have reached your logs limit: <strong>{usage.used}/{usage.limit} logs</strong> ({percentage.toFixed(1)}%).
                              </p>
                              <p className="text-gray-300 text-sm">
                                New logs will be blocked. Please upgrade your plan to continue logging.
                              </p>
                            </div>
                            <button
                              onClick={() => router.push('/subscription')}
                              className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm whitespace-nowrap"
                            >
                              Upgrade Plan
                            </button>
                          </div>
                        </div>
                      )
                    } else if (isApproaching) {
                      return (
                        <div className="bg-yellow-900/20 border-l-4 border-yellow-600 p-4 rounded mb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
                                <span>⚠️</span>
                                <span>Approaching Logs Limit</span>
                              </h3>
                              <p className="text-gray-300 text-sm mb-2">
                                You are approaching your logs limit: <strong>{usage.used}/{usage.limit} logs</strong> ({percentage.toFixed(1)}%).
                              </p>
                              <p className="text-gray-300 text-sm">
                                You can log {Math.max(0, usage.limit - usage.used)} more log{usage.limit - usage.used !== 1 ? 's' : ''} before reaching your limit.
                              </p>
                            </div>
                            <button
                              onClick={() => router.push('/subscription')}
                              className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm whitespace-nowrap"
                            >
                              Upgrade Plan
                            </button>
                          </div>
                        </div>
                      )
                    }
                    return null
                  })()}
                  {/* Log Level Summary */}
                  <div className="flex flex-wrap gap-2 p-4 bg-gray-900 rounded-lg">
                    <button
                      onClick={() => setLogLevelFilter('')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${logLevelFilter === '' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                    >
                      All ({logsTotal})
                    </button>
                    {logLevels.verbose > 0 && (
                      <button
                        onClick={() => setLogLevelFilter('verbose')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${logLevelFilter === 'verbose' ? 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          }`}
                      >
                        Verbose ({logLevels.verbose})
                      </button>
                    )}
                    {logLevels.debug > 0 && (
                      <button
                        onClick={() => setLogLevelFilter('debug')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${logLevelFilter === 'debug' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-purple-400 hover:bg-gray-700'
                          }`}
                      >
                        Debug ({logLevels.debug})
                      </button>
                    )}
                    {logLevels.info > 0 && (
                      <button
                        onClick={() => setLogLevelFilter('info')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${logLevelFilter === 'info' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-blue-400 hover:bg-gray-700'
                          }`}
                      >
                        Info ({logLevels.info})
                      </button>
                    )}
                    {logLevels.warn > 0 && (
                      <button
                        onClick={() => setLogLevelFilter('warn')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${logLevelFilter === 'warn' ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                          }`}
                      >
                        Warn ({logLevels.warn})
                      </button>
                    )}
                    {logLevels.error > 0 && (
                      <button
                        onClick={() => setLogLevelFilter('error')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${logLevelFilter === 'error' ? 'bg-red-600 text-white' : 'bg-gray-800 text-red-400 hover:bg-gray-700'
                          }`}
                      >
                        Error ({logLevels.error})
                      </button>
                    )}
                    {logLevels.assert > 0 && (
                      <button
                        onClick={() => setLogLevelFilter('assert')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${logLevelFilter === 'assert' ? 'bg-red-800 text-white' : 'bg-gray-800 text-red-500 hover:bg-gray-700'
                          }`}
                      >
                        Assert ({logLevels.assert})
                      </button>
                    )}
                  </div>

                  {/* Search and Filters */}
                  <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-900 rounded-lg">
                    {/* Search Input */}
                    <div className="flex-1 min-w-[200px]">
                      <input
                        type="text"
                        placeholder="Search logs (message, tag, class, function)..."
                        value={logSearch}
                        onChange={(e) => setLogSearch(e.target.value)}
                        className="w-full bg-gray-800 text-gray-300 text-sm rounded-lg px-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    {/* Tag Filter */}
                    {logTags.length > 0 && (
                      <div className="flex items-center gap-2">
                        <label className="text-gray-400 text-sm">Tag:</label>
                        <select
                          value={logTagFilter}
                          onChange={(e) => setLogTagFilter(e.target.value)}
                          className="bg-gray-800 text-gray-300 text-sm rounded px-3 py-1.5 border border-gray-700 focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">All Tags</option>
                          {logTags.map((tag) => (
                            <option key={tag} value={tag}>{tag}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Screen Filter */}
                    {logScreenNames.length > 0 && (
                      <div className="flex items-center gap-2">
                        <label className="text-gray-400 text-sm">Screen:</label>
                        <select
                          value={logScreenFilter}
                          onChange={(e) => setLogScreenFilter(e.target.value)}
                          className="bg-gray-800 text-gray-300 text-sm rounded px-3 py-1.5 border border-gray-700 focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">All Screens</option>
                          {logScreenNames.map((screen) => (
                            <option key={screen} value={screen}>{screen}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Clear Logs Button */}
                    <button
                      onClick={() => clearLogs(logLevelFilter || undefined)}
                      disabled={clearingLogs || logs.length === 0}
                      className="px-4 py-1.5 bg-red-900/50 hover:bg-red-800/50 text-red-400 text-sm rounded border border-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {clearingLogs ? 'Clearing...' : logLevelFilter ? `Clear ${logLevelFilter} logs` : 'Clear All Logs'}
                    </button>
                  </div>

                  {/* Logs List */}
                  {logsLoading && logs.length === 0 ? (
                    <SkeletonLogList count={10} />
                  ) : logs.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                      {debouncedLogSearch || logLevelFilter || logTagFilter || logScreenFilter
                        ? 'No logs match your filters'
                        : 'No logs yet. Integrate the SDK to start capturing console logs.'}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {/* Pagination at top */}
                      {logsPagination.totalPages > 1 && (
                        <Pagination
                          pagination={logsPagination}
                          onPageChange={handleLogsPageChange}
                          onLimitChange={handleLogsLimitChange}
                          className="bg-gray-900 rounded-lg p-4"
                        />
                      )}
                      {logs.map((log) => (
                        <LogItem
                          key={log.id}
                          log={log}
                          isExpanded={expandedLog === log.id}
                          onToggleExpand={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                        />
                      ))}
                      {/* Pagination at bottom */}
                      {logsPagination.totalPages > 1 && (
                        <Pagination
                          pagination={logsPagination}
                          onPageChange={handleLogsPageChange}
                          onLimitChange={handleLogsLimitChange}
                          showLimitSelector={false}
                          className="bg-gray-900 rounded-lg p-4"
                        />
                      )}
                    </div>
                  )}
                </>
              )}

              {logsSubTab === 'settings' && token && sdkSettings && (
                <div className="space-y-6">
                  {/* Capture Print Statements */}
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">🖨️</span>
                      <div>
                        <h3 className="text-white font-medium">Capture Print Statements</h3>
                        <p className="text-gray-400 text-sm">Auto-capture print() statements as logs</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">📝</span>
                        <div>
                          <p className="text-white text-sm font-medium">Enable Print Statement Capture</p>
                          <p className="text-gray-500 text-xs">Automatically capture print() statements and send them as log entries</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sdkSettings.capturePrintStatements}
                          onChange={(e) => updateSdkSetting({ capturePrintStatements: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Log Control */}
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">🎛️</span>
                      <div>
                        <h3 className="text-white font-medium">Log Control</h3>
                        <p className="text-gray-400 text-sm">Control log levels and filtering</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-800 rounded-lg">
                        <p className="text-white text-sm font-medium mb-2">Minimum Log Level</p>
                        <p className="text-gray-500 text-xs mb-3">Only logs at or above this level will be captured</p>
                        <div className="flex gap-2">
                          {['verbose', 'debug', 'info', 'warn', 'error'].map((level) => (
                            <button
                              key={level}
                              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${sdkSettings.minLogLevel === level
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                              onClick={() => updateSdkSetting({ minLogLevel: level })}
                            >
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">📊</span>
                          <div>
                            <p className="text-white text-sm font-medium">Enable Log Sampling</p>
                            <p className="text-gray-500 text-xs">Sample logs to reduce volume (e.g., capture 1 in 10 logs)</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sdkSettings.logSamplingEnabled || false}
                            onChange={(e) => updateSdkSetting({ logSamplingEnabled: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      {sdkSettings.logSamplingEnabled && (
                        <div className="p-3 bg-gray-800 rounded-lg">
                          <label className="text-white text-sm font-medium mb-2 block">Sampling Rate</label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={sdkSettings.logSamplingRate || 10}
                            onChange={(e) => updateSdkSetting({ logSamplingRate: parseInt(e.target.value) || 10 })}
                            className="w-full px-3 py-1.5 bg-gray-700 text-gray-300 rounded text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
                            placeholder="10"
                          />
                          <p className="text-gray-500 text-xs mt-1">Capture 1 in {sdkSettings.logSamplingRate || 10} logs</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'crashes' && (
            <div className="space-y-4">
              {/* Enforcement Banner for Crashes */}
              {(() => {
                // Use crashesUsage if available, otherwise fallback to sharedUsage.crashes
                const usage = crashesUsage || sharedUsage?.crashes
                if (!usage || usage.limit === null || usage.limit === undefined || usage.limit <= 0) {
                  return null
                }

                const percentage = usage.percentage !== undefined
                  ? usage.percentage
                  : usage.limit > 0
                    ? (usage.used / usage.limit) * 100
                    : 0
                const warnThreshold = 80
                const hardThreshold = 100

                // Show banner if quota exceeded (used >= limit) or percentage >= 100
                const isExceeded = usage.used >= usage.limit || percentage >= hardThreshold
                const isApproaching = !isExceeded && percentage >= warnThreshold

                if (isExceeded) {
                  return (
                    <div className="bg-red-900/20 border-l-4 border-red-600 p-4 rounded mb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                            <span>🚫</span>
                            <span>Crashes Quota Exceeded</span>
                          </h3>
                          <p className="text-gray-300 text-sm mb-2">
                            You have reached your crashes limit: <strong>{usage.used}/{usage.limit} crashes</strong> ({percentage.toFixed(1)}%).
                          </p>
                          <p className="text-gray-300 text-sm">
                            New crash reports will be blocked. Please upgrade your plan to continue crash reporting.
                          </p>
                        </div>
                        <button
                          onClick={() => router.push('/subscription')}
                          className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm whitespace-nowrap"
                        >
                          Upgrade Plan
                        </button>
                      </div>
                    </div>
                  )
                } else if (isApproaching) {
                  return (
                    <div className="bg-yellow-900/20 border-l-4 border-yellow-600 p-4 rounded mb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
                            <span>⚠️</span>
                            <span>Approaching Crashes Limit</span>
                          </h3>
                          <p className="text-gray-300 text-sm mb-2">
                            You are approaching your crashes limit: <strong>{usage.used}/{usage.limit} crashes</strong> ({percentage.toFixed(1)}%).
                          </p>
                          <p className="text-gray-300 text-sm">
                            You can report {Math.max(0, usage.limit - usage.used)} more crash{usage.limit - usage.used !== 1 ? 'es' : ''} before reaching your limit.
                          </p>
                        </div>
                        <button
                          onClick={() => router.push('/subscription')}
                          className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm whitespace-nowrap"
                        >
                          Upgrade Plan
                        </button>
                      </div>
                    </div>
                  )
                }
                return null
              })()}
              {/* Filters and Search Bar */}
              <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-900 rounded-lg">
                {/* Search */}
                <div className="flex-1 min-w-[200px]">
                  <input
                    type="text"
                    value={crashSearch}
                    onChange={(e) => setCrashSearch(e.target.value)}
                    placeholder="Search crashes by message or stack trace..."
                    className="w-full px-3 py-1.5 bg-gray-800 text-gray-300 rounded text-sm border border-gray-700 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Platform Filter */}
                <div className="flex items-center gap-2">
                  <label className="text-gray-400 text-sm">Platform:</label>
                  <select
                    value={crashPlatformFilter}
                    onChange={(e) => setCrashPlatformFilter(e.target.value)}
                    className="bg-gray-800 text-gray-300 text-sm rounded px-3 py-1.5 border border-gray-700 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">All Platforms</option>
                    {crashPlatforms.map((platform) => (
                      <option key={platform} value={platform}>{platform}</option>
                    ))}
                  </select>
                </div>

                {/* Device Filter */}
                <div className="flex items-center gap-2">
                  <label className="text-gray-400 text-sm">Device:</label>
                  <select
                    value={crashDeviceFilter}
                    onChange={(e) => setCrashDeviceFilter(e.target.value)}
                    className="bg-gray-800 text-gray-300 text-sm rounded px-3 py-1.5 border border-gray-700 focus:border-blue-500 focus:outline-none min-w-[200px]"
                  >
                    <option value="">All Devices</option>
                    {crashDevices.map((device) => (
                      <option key={device.id} value={device.deviceId}>
                        {device.deviceId} ({device.platform} {device.model ? `- ${device.model}` : ''})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Range */}
                <div className="flex items-center gap-2">
                  <label className="text-gray-400 text-sm">From:</label>
                  <input
                    type="date"
                    value={crashStartDate}
                    onChange={(e) => setCrashStartDate(e.target.value)}
                    className="bg-gray-800 text-gray-300 text-sm rounded px-3 py-1.5 border border-gray-700 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-gray-400 text-sm">To:</label>
                  <input
                    type="date"
                    value={crashEndDate}
                    onChange={(e) => setCrashEndDate(e.target.value)}
                    className="bg-gray-800 text-gray-300 text-sm rounded px-3 py-1.5 border border-gray-700 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Clear Filters */}
                {(crashPlatformFilter || crashDeviceFilter || crashStartDate || crashEndDate || crashSearch) && (
                  <button
                    onClick={() => {
                      setCrashPlatformFilter('')
                      setCrashDeviceFilter('')
                      setCrashStartDate('')
                      setCrashEndDate('')
                      setCrashSearch('')
                    }}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {/* Crashes List */}
              {crashesLoading ? (
                <SkeletonCrashList />
              ) : crashes.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No crashes found</p>
              ) : (
                <>
                  <div className="space-y-3">
                    {crashes.map((crash) => (
                      <div key={crash.id} className="p-4 bg-gray-900 rounded-lg border border-red-900/50 hover:border-red-800/70 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <span className="text-red-400 font-medium">{crash.message}</span>
                            {crash.device && (
                              <div className="text-gray-500 text-sm mt-1">
                                <span className="inline-block px-2 py-0.5 bg-gray-800 rounded text-xs mr-2">
                                  {crash.device.platform}
                                </span>
                                {crash.device.model || crash.device.deviceId}
                              </div>
                            )}
                          </div>
                          <span className="text-gray-500 text-sm whitespace-nowrap ml-4">{formatTime(crash.timestamp)}</span>
                        </div>
                        {crash.stackTrace && (
                          <div className="mt-3">
                            <button
                              onClick={() => setExpandedCrash(expandedCrash === crash.id ? null : crash.id)}
                              className="text-blue-400 hover:text-blue-300 text-sm mb-2"
                            >
                              {expandedCrash === crash.id ? '▼ Hide' : '▶ Show'} Stack Trace
                            </button>
                            {expandedCrash === crash.id && (
                              <pre className="mt-2 p-3 bg-gray-950 rounded text-sm text-gray-300 overflow-x-auto max-h-96">
                                {crash.stackTrace}
                              </pre>
                            )}
                          </div>
                        )}
                        {crash.metadata && Object.keys(crash.metadata).length > 0 && (
                          <div className="mt-3">
                            <button
                              onClick={() => setExpandedCrash(expandedCrash === crash.id ? null : crash.id)}
                              className="text-blue-400 hover:text-blue-300 text-sm mb-2"
                            >
                              {expandedCrash === crash.id ? '▼ Hide' : '▶ Show'} Metadata
                            </button>
                            {expandedCrash === crash.id && (
                              <pre className="mt-2 p-3 bg-gray-950 rounded text-sm text-gray-300 overflow-x-auto">
                                {JSON.stringify(crash.metadata, null, 2)}
                              </pre>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {crashesPagination.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4">
                      <div className="text-gray-400 text-sm">
                        Showing {((crashesPagination.page - 1) * crashesPagination.limit) + 1} to {Math.min(crashesPagination.page * crashesPagination.limit, crashesPagination.total)} of {crashesPagination.total} crashes
                      </div>
                      <Pagination
                        pagination={crashesPagination}
                        onPageChange={handleCrashesPageChange}
                        onLimitChange={handleCrashesLimitChange}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'traces' && (
            <div className="space-y-4">
              {/* Sub-tabs */}
              <div className="border-b border-gray-800">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setTracesSubTab('list')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${tracesSubTab === 'list'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-white'
                      }`}
                  >
                    API Traces
                  </button>
                  <button
                    onClick={() => setTracesSubTab('security')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${tracesSubTab === 'security'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-white'
                      }`}
                  >
                    Security Settings
                  </button>
                </nav>
              </div>

              {tracesSubTab === 'list' && (
                <>
                  {/* Enforcement Banner for API Traces */}
                  {(() => {
                    // Use apiTracesUsage if available, otherwise fallback to sharedUsage
                    const tracesUsage = apiTracesUsage || (sharedUsage?.apiRequests && sharedUsage?.apiEndpoints ? {
                      apiRequests: sharedUsage.apiRequests,
                      apiEndpoints: sharedUsage.apiEndpoints
                    } : null)

                    if (!tracesUsage || (tracesUsage.apiRequests.limit === null && tracesUsage.apiEndpoints.limit === null)) {
                      return null
                    }

                    const apiRequestsUsage = tracesUsage.apiRequests
                    const apiEndpointsUsage = tracesUsage.apiEndpoints
                    const requestsPercentage = apiRequestsUsage.percentage !== undefined
                      ? apiRequestsUsage.percentage
                      : apiRequestsUsage.limit && apiRequestsUsage.limit > 0
                        ? (apiRequestsUsage.used / apiRequestsUsage.limit) * 100
                        : 0
                    const endpointsPercentage = apiEndpointsUsage.percentage !== undefined
                      ? apiEndpointsUsage.percentage
                      : apiEndpointsUsage.limit && apiEndpointsUsage.limit > 0
                        ? (apiEndpointsUsage.used / apiEndpointsUsage.limit) * 100
                        : 0
                    const warnThreshold = 80
                    const hardThreshold = 100

                    // Check if either meter is at hard threshold
                    const requestsExceeded = apiRequestsUsage.limit !== null && (apiRequestsUsage.used >= apiRequestsUsage.limit || requestsPercentage >= hardThreshold)
                    const endpointsExceeded = apiEndpointsUsage.limit !== null && (apiEndpointsUsage.used >= apiEndpointsUsage.limit || endpointsPercentage >= hardThreshold)

                    if (requestsExceeded || endpointsExceeded) {
                      const exceededMeter = requestsExceeded ? 'API Requests' : 'API Endpoints'
                      const exceededUsage = requestsExceeded ? apiRequestsUsage : apiEndpointsUsage
                      return (
                        <div className="bg-red-900/20 border-l-4 border-red-600 p-4 rounded mb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                                <span>🚫</span>
                                <span>API Traces Quota Exceeded</span>
                              </h3>
                              <p className="text-gray-300 text-sm mb-2">
                                You have reached your {exceededMeter.toLowerCase()} limit: <strong>{exceededUsage.used}/{exceededUsage.limit}</strong> ({exceededUsage.percentage.toFixed(1)}%).
                              </p>
                              <p className="text-gray-300 text-sm">
                                New API traces will be blocked. Please upgrade your plan to continue tracking API requests.
                              </p>
                            </div>
                            <button
                              onClick={() => router.push('/subscription')}
                              className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm whitespace-nowrap"
                            >
                              Upgrade Plan
                            </button>
                          </div>
                        </div>
                      )
                    }

                    // Check if either meter is at warn threshold (but not exceeded)
                    const requestsApproaching = apiRequestsUsage.limit !== null && !requestsExceeded && requestsPercentage >= warnThreshold
                    const endpointsApproaching = apiEndpointsUsage.limit !== null && !endpointsExceeded && endpointsPercentage >= warnThreshold

                    if (requestsApproaching || endpointsApproaching) {
                      const warningMeter = requestsApproaching ? 'API Requests' : 'API Endpoints'
                      const warningUsage = requestsApproaching ? apiRequestsUsage : apiEndpointsUsage
                      return (
                        <div className="bg-yellow-900/20 border-l-4 border-yellow-600 p-4 rounded mb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
                                <span>⚠️</span>
                                <span>Approaching API Traces Limit</span>
                              </h3>
                              <p className="text-gray-300 text-sm mb-2">
                                You are approaching your {warningMeter.toLowerCase()} limit: <strong>{warningUsage.used}/{warningUsage.limit}</strong> ({warningUsage.limit ? ((warningUsage.used / warningUsage.limit) * 100).toFixed(1) : '0'}%).
                              </p>
                              <p className="text-gray-300 text-sm">
                                You can track {Math.max(0, (warningUsage.limit || 0) - warningUsage.used)} more {warningMeter.toLowerCase()} before reaching your limit.
                              </p>
                            </div>
                            <button
                              onClick={() => router.push('/subscription')}
                              className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm whitespace-nowrap"
                            >
                              Upgrade Plan
                            </button>
                          </div>
                        </div>
                      )
                    }

                    return null
                  })()}
                  {/* Filters and Actions Bar */}
                  <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-900 rounded-lg">
                    {/* Screen Name Filter */}
                    <div className="flex items-center gap-2">
                      <label className="text-gray-400 text-sm">Screen:</label>
                      <select
                        value={selectedScreen}
                        onChange={(e) => setSelectedScreen(e.target.value)}
                        className="bg-gray-800 text-gray-300 text-sm rounded px-3 py-1.5 border border-gray-700 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">All Screens</option>
                        {screenNames.map((name) => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Device Filter */}
                    <div className="flex items-center gap-2">
                      <label className="text-gray-400 text-sm">Device:</label>
                      <select
                        value={selectedDevice}
                        onChange={(e) => setSelectedDevice(e.target.value)}
                        className="bg-gray-800 text-gray-300 text-sm rounded px-3 py-1.5 border border-gray-700 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">All Devices</option>
                        {traceDevices.map((device) => (
                          <option key={device.id} value={device.id}>
                            {device.model || device.deviceId.slice(0, 8)} ({device.platform})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Group By Dropdown */}
                    <div className="flex items-center gap-2">
                      <label className="text-gray-400 text-sm">Group by:</label>
                      <select
                        value={groupBy}
                        onChange={(e) => setGroupBy(e.target.value as 'none' | 'device' | 'screen' | 'endpoint')}
                        className="bg-gray-800 text-gray-300 text-sm rounded px-3 py-1.5 border border-gray-700 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="none">None</option>
                        <option value="screen">Screen Name</option>
                        <option value="endpoint">API Endpoint</option>
                        <option value="device">Device</option>
                      </select>
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Loading indicator */}
                    {tracesLoading && (
                      <div className="text-gray-500 text-sm flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Loading...
                      </div>
                    )}

                    {/* Clear Traces Button */}
                    <button
                      onClick={clearTraces}
                      disabled={clearing || traces.length === 0}
                      className="px-4 py-1.5 bg-red-900/50 hover:bg-red-800/50 text-red-400 text-sm rounded border border-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {clearing ? 'Clearing...' : 'Clear Traces'}
                    </button>
                  </div>

                  {/* Traces List */}
                  {tracesLoading && traces.length === 0 ? (
                    <SkeletonTraceList count={10} />
                  ) : traces.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                      {selectedScreen || selectedDevice ? 'No API traces match your filters' : 'No API traces yet'}
                    </p>
                  ) : groupBy !== 'none' && groupedTraces ? (
                    /* Grouped View */
                    <div className="space-y-3">
                      {groupedTraces.map((group) => (
                        <div key={group.key} className="bg-gray-900 rounded-lg overflow-hidden">
                          {/* Group Header */}
                          <button
                            onClick={() => setExpandedGroup(expandedGroup === group.key ? null : group.key)}
                            className="w-full p-4 text-left hover:bg-gray-800/50 transition-colors flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-gray-500">{expandedGroup === group.key ? '▼' : '▶'}</span>
                              <span className="text-white font-medium">{group.label}</span>
                              <span className="px-2 py-0.5 bg-blue-900/50 text-blue-400 text-xs rounded-full">
                                {group.count} {group.count === 1 ? 'request' : 'requests'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-green-400">
                                {group.traces.filter(t => t.statusCode >= 200 && t.statusCode < 300).length} ok
                              </span>
                              <span className="text-red-400">
                                {group.traces.filter(t => t.statusCode >= 400 || t.statusCode === 0).length} errors
                              </span>
                            </div>
                          </button>

                          {/* Expanded Group Traces */}
                          {expandedGroup === group.key && (
                            <div className="border-t border-gray-800">
                              {group.traces.map((trace) => (
                                <div key={trace.id} className="border-b border-gray-800/50 last:border-b-0">
                                  <button
                                    onClick={() => setExpandedTrace(expandedTrace === trace.id ? null : trace.id)}
                                    className="w-full p-3 pl-10 text-left hover:bg-gray-800/30 transition-colors"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3 min-w-0">
                                        <span className="px-2 py-0.5 bg-gray-700 rounded text-xs font-medium text-gray-300 flex-shrink-0">
                                          {trace.method}
                                        </span>
                                        <span className={`font-medium flex-shrink-0 ${getStatusColor(trace.statusCode)}`}>
                                          {trace.statusCode || 'ERR'}
                                        </span>
                                        <span className="text-gray-400 font-mono text-xs truncate">
                                          {trace.url}
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-3 text-xs flex-shrink-0 ml-4">
                                        {trace.duration && (
                                          <span className="text-gray-400">{trace.duration}ms</span>
                                        )}
                                        <span className="text-gray-500">{formatTime(trace.timestamp)}</span>
                                        <span className="text-gray-500">{expandedTrace === trace.id ? '▼' : '▶'}</span>
                                      </div>
                                    </div>
                                    {/* Metadata Row for Grouped View */}
                                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-500">
                                      {trace.screenName && (
                                        <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded">
                                          {trace.screenName}
                                        </span>
                                      )}
                                      {trace.device && (
                                        <span className="px-2 py-0.5 bg-gray-700/50 text-gray-400 rounded">
                                          {trace.device.platform} - {trace.device.model || trace.device.deviceId.slice(0, 8)}
                                        </span>
                                      )}
                                      {trace.networkType && (
                                        <span>{getNetworkIcon(trace.networkType)} {trace.networkType}</span>
                                      )}
                                      {trace.country && <span>{trace.country}</span>}
                                      {trace.carrier && <span>{trace.carrier}</span>}
                                      {trace.ipAddress && <span>IP: {trace.ipAddress}</span>}
                                      {trace.userAgent && (
                                        <span className="truncate max-w-[200px]" title={trace.userAgent}>
                                          {trace.userAgent.slice(0, 40)}...
                                        </span>
                                      )}
                                    </div>
                                  </button>

                                  {/* Expanded Trace Details */}
                                  {expandedTrace === trace.id && (
                                    <div className="border-t border-gray-800 p-4 pl-10 space-y-4 bg-gray-950/50">
                                      {/* Request */}
                                      <div>
                                        <h4 className="text-sm font-medium text-gray-300 mb-2">Request</h4>
                                        {trace.requestHeaders && Object.keys(trace.requestHeaders).length > 0 && (
                                          <div className="mb-2">
                                            <span className="text-xs text-gray-500">Headers:</span>
                                            <pre className="mt-1 p-2 bg-gray-950 rounded text-xs text-gray-400 overflow-x-auto max-h-32">
                                              {JSON.stringify(trace.requestHeaders, null, 2)}
                                            </pre>
                                          </div>
                                        )}
                                        {trace.requestBody && (
                                          <div>
                                            <span className="text-xs text-gray-500">Body:</span>
                                            <pre className="mt-1 p-2 bg-gray-950 rounded text-xs text-gray-400 overflow-x-auto max-h-48">
                                              {formatBody(trace.requestBody)}
                                            </pre>
                                          </div>
                                        )}
                                      </div>
                                      {/* Response */}
                                      <div>
                                        <h4 className="text-sm font-medium text-gray-300 mb-2">Response</h4>
                                        {trace.responseBody && (
                                          <div>
                                            <span className="text-xs text-gray-500">Body:</span>
                                            <pre className="mt-1 p-2 bg-gray-950 rounded text-xs text-gray-400 overflow-x-auto max-h-64">
                                              {formatBody(trace.responseBody)}
                                            </pre>
                                          </div>
                                        )}
                                      </div>
                                      {/* Monitoring Toggle */}
                                      <div className="border-t border-gray-800 pt-4 flex items-center justify-between">
                                        <div>
                                          <h4 className="text-sm font-medium text-gray-300">Monitor Endpoint</h4>
                                          <p className="text-xs text-gray-500 mt-1">
                                            {isEndpointMonitored(trace.url, trace.method)
                                              ? 'This endpoint is being monitored for errors'
                                              : 'Enable to track errors automatically'}
                                          </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={isEndpointMonitored(trace.url, trace.method)}
                                            onChange={(e) => {
                                              if (e.target.checked) {
                                                handleQuickEnableMonitoring(trace.url, trace.method, trace.statusCode)
                                              } else {
                                                handleDisableMonitoring(trace.url, trace.method)
                                              }
                                            }}
                                            className="sr-only peer"
                                          />
                                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Flat View */
                    <div className="space-y-2">
                      {/* Pagination at top */}
                      {tracesPagination.totalPages > 1 && (
                        <Pagination
                          pagination={tracesPagination}
                          onPageChange={handleTracesPageChange}
                          onLimitChange={handleTracesLimitChange}
                          className="bg-gray-900 rounded-lg p-4"
                        />
                      )}
                      {traces.map((trace) => (
                        <TraceItem
                          key={trace.id}
                          trace={trace}
                          isExpanded={expandedTrace === trace.id}
                          onToggleExpand={() => setExpandedTrace(expandedTrace === trace.id ? null : trace.id)}
                          isMonitored={isEndpointMonitored(trace.url, trace.method)}
                          onToggleMonitor={(enabled) => {
                            if (enabled) {
                              handleQuickEnableMonitoring(trace.url, trace.method, trace.statusCode)
                            } else {
                              handleDisableMonitoring(trace.url, trace.method)
                            }
                          }}
                        />
                      ))}
                      {/* Pagination at bottom */}
                      {tracesPagination.totalPages > 1 && (
                        <Pagination
                          pagination={tracesPagination}
                          onPageChange={handleTracesPageChange}
                          onLimitChange={handleTracesLimitChange}
                          showLimitSelector={false}
                          className="bg-gray-900 rounded-lg p-4"
                        />
                      )}
                    </div>
                  )}
                </>
              )}

              {tracesSubTab === 'security' && token && sdkSettings && (
                <div className="space-y-6">
                  {/* Security Settings */}
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">🔒</span>
                      <div>
                        <h3 className="text-white font-medium">Security Settings</h3>
                        <p className="text-gray-400 text-sm">Control data capture and privacy settings</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">📤</span>
                          <div>
                            <p className="text-white text-sm font-medium">Capture Request Bodies</p>
                            <p className="text-gray-500 text-xs">Include request body content in API traces</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sdkSettings.captureRequestBodies}
                            onChange={(e) => updateSdkSetting({ captureRequestBodies: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">📥</span>
                          <div>
                            <p className="text-white text-sm font-medium">Capture Response Bodies</p>
                            <p className="text-gray-500 text-xs">Include response body content in API traces</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sdkSettings.captureResponseBodies}
                            onChange={(e) => updateSdkSetting({ captureResponseBodies: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🔐</span>
                          <div>
                            <p className="text-white text-sm font-medium">Sanitize Sensitive Data</p>
                            <p className="text-gray-500 text-xs">Automatically redact sensitive fields from traces</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sdkSettings.sanitizeSensitiveData}
                            onChange={(e) => updateSdkSetting({ sanitizeSensitiveData: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      {/* Sensitive Field Patterns */}
                      {sdkSettings.sanitizeSensitiveData && (
                        <div className="p-3 bg-gray-800 rounded-lg">
                          <p className="text-white text-sm font-medium mb-2">Sensitive Field Patterns</p>
                          <p className="text-gray-500 text-xs mb-3">Fields matching these patterns will be redacted</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {sdkSettings.sensitiveFieldPatterns?.map((pattern, idx) => (
                              <span key={idx} className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm flex items-center gap-2">
                                {pattern}
                                <button
                                  onClick={() => updateSdkSetting({
                                    sensitiveFieldPatterns: sdkSettings.sensitiveFieldPatterns?.filter((_, i) => i !== idx) || []
                                  })}
                                  className="text-gray-500 hover:text-red-400"
                                >×</button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Add pattern (e.g., password, token)"
                              className="flex-1 px-3 py-1.5 bg-gray-700 text-gray-300 rounded text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  const input = e.currentTarget
                                  const pattern = input.value.trim()
                                  if (pattern && !sdkSettings.sensitiveFieldPatterns?.includes(pattern)) {
                                    updateSdkSetting({
                                      sensitiveFieldPatterns: [...(sdkSettings.sensitiveFieldPatterns || []), pattern]
                                    })
                                    input.value = ''
                                  }
                                }
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-6">
              {/* Add New Config */}
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white">API Cost Configuration</h2>
                <button
                  onClick={() => setShowAddConfig(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                >
                  + Add Endpoint
                </button>
              </div>

              {/* Add Config Form */}
              {showAddConfig && (
                <div className="bg-gray-900 rounded-lg p-4 space-y-4">
                  <h3 className="text-white font-medium">Add New Endpoint Config</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Endpoint Path</label>
                      <input
                        type="text"
                        placeholder="/api/users/*"
                        value={newConfig.endpoint}
                        onChange={(e) => setNewConfig({ ...newConfig, endpoint: e.target.value })}
                        className="w-full bg-gray-800 text-white text-sm rounded px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Method (optional)</label>
                      <select
                        value={newConfig.method}
                        onChange={(e) => setNewConfig({ ...newConfig, method: e.target.value })}
                        className="w-full bg-gray-800 text-white text-sm rounded px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">All Methods</option>
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                        <option value="PATCH">PATCH</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Name (optional)</label>
                      <input
                        type="text"
                        placeholder="User API"
                        value={newConfig.name}
                        onChange={(e) => setNewConfig({ ...newConfig, name: e.target.value })}
                        className="w-full bg-gray-800 text-white text-sm rounded px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Cost Per Request</label>
                      <input
                        type="number"
                        step="0.001"
                        placeholder="0.00"
                        value={newConfig.costPerRequest}
                        onChange={(e) => setNewConfig({ ...newConfig, costPerRequest: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-gray-800 text-white text-sm rounded px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateConfig}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setShowAddConfig(false)
                        setNewConfig({ endpoint: '', method: '', name: '', costPerRequest: 0 })
                      }}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Suggested Endpoints from Traces */}
              {suggestedEndpoints.length > 0 && (
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h3 className="text-gray-300 font-medium mb-3">Suggested Endpoints (from traces)</h3>
                  <div className="flex flex-wrap gap-2">
                    {suggestedEndpoints.slice(0, 10).map((ep, idx) => (
                      <button
                        key={idx}
                        onClick={() => addSuggestedEndpoint(ep)}
                        className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded border border-gray-700 transition-colors"
                      >
                        <span className="text-blue-400">{ep.method}</span> {ep.endpoint}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing Configs */}
              {configs.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No API configurations yet. Add endpoints to track costs.</p>
              ) : (
                <div className="space-y-2">
                  {configs.map((config) => (
                    <div key={config.id} className="bg-gray-900 rounded-lg p-4">
                      {editingConfig?.id === config.id ? (
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                          <div>
                            <label className="block text-gray-400 text-xs mb-1">Endpoint</label>
                            <input
                              type="text"
                              value={editingConfig.endpoint}
                              onChange={(e) => setEditingConfig({ ...editingConfig, endpoint: e.target.value })}
                              className="w-full bg-gray-800 text-white text-sm rounded px-3 py-2 border border-gray-700"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-400 text-xs mb-1">Method</label>
                            <select
                              value={editingConfig.method || ''}
                              onChange={(e) => setEditingConfig({ ...editingConfig, method: e.target.value || null })}
                              className="w-full bg-gray-800 text-white text-sm rounded px-3 py-2 border border-gray-700"
                            >
                              <option value="">All</option>
                              <option value="GET">GET</option>
                              <option value="POST">POST</option>
                              <option value="PUT">PUT</option>
                              <option value="DELETE">DELETE</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-gray-400 text-xs mb-1">Name</label>
                            <input
                              type="text"
                              value={editingConfig.name || ''}
                              onChange={(e) => setEditingConfig({ ...editingConfig, name: e.target.value || null })}
                              className="w-full bg-gray-800 text-white text-sm rounded px-3 py-2 border border-gray-700"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-400 text-xs mb-1">Cost</label>
                            <input
                              type="number"
                              step="0.001"
                              value={editingConfig.costPerRequest}
                              onChange={(e) => setEditingConfig({ ...editingConfig, costPerRequest: parseFloat(e.target.value) || 0 })}
                              className="w-full bg-gray-800 text-white text-sm rounded px-3 py-2 border border-gray-700"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateConfig(editingConfig)}
                              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingConfig(null)}
                              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              {config.method && (
                                <span className="px-2 py-0.5 bg-blue-900/50 text-blue-400 text-xs rounded">
                                  {config.method}
                                </span>
                              )}
                              <span className="text-white font-mono text-sm">{config.endpoint}</span>
                            </div>
                            {config.name && (
                              <span className="text-gray-400 text-sm">({config.name})</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-green-400 font-medium">${config.costPerRequest.toFixed(2)} USD</span>
                            <span className={`px-2 py-0.5 rounded text-xs ${config.isEnabled ? 'bg-green-900/50 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                              {config.isEnabled ? 'Active' : 'Disabled'}
                            </span>
                            {/* Monitoring Toggle */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Monitor</span>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isEndpointMonitored(config.endpoint, config.method || undefined)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      handleQuickEnableMonitoring(config.endpoint, config.method || '', undefined)
                                    } else {
                                      handleDisableMonitoring(config.endpoint, config.method || undefined)
                                    }
                                  }}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                            <button
                              onClick={() => setEditingConfig(config)}
                              className="text-gray-400 hover:text-white text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteConfig(config.id)}
                              className="text-red-400 hover:text-red-300 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {analyticsLoading ? (
                <p className="text-gray-400 text-center py-8">Loading analytics...</p>
              ) : !analytics ? (
                <p className="text-gray-400 text-center py-8">No analytics data available</p>
              ) : (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gray-900 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">Total Cost</p>
                      <p className="text-2xl font-bold text-green-400">${analytics.summary.totalCost.toFixed(2)} <span className="text-sm font-normal">USD</span></p>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">Total Requests</p>
                      <p className="text-2xl font-bold text-white">{analytics.summary.totalRequests.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">Avg Cost/Request</p>
                      <p className="text-2xl font-bold text-blue-400">${analytics.summary.avgCostPerRequest.toFixed(2)} <span className="text-sm font-normal">USD</span></p>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">Unique Endpoints Cost</p>
                      <p className="text-2xl font-bold text-purple-400">${analytics.summary.uniqueEndpointsCost.toFixed(2)} <span className="text-sm font-normal">USD</span></p>
                    </div>
                  </div>

                  {/* Cost by Device */}
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-medium">Cost by Device</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs">Sort by:</span>
                        <button
                          onClick={() => {
                            if (deviceSortField === 'requestCount') setDeviceSortDir(d => d === 'asc' ? 'desc' : 'asc')
                            else { setDeviceSortField('requestCount'); setDeviceSortDir('desc') }
                          }}
                          className={`px-2 py-1 text-xs rounded ${deviceSortField === 'requestCount' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                        >
                          Requests {deviceSortField === 'requestCount' && (deviceSortDir === 'desc' ? '↓' : '↑')}
                        </button>
                        <button
                          onClick={() => {
                            if (deviceSortField === 'totalCost') setDeviceSortDir(d => d === 'asc' ? 'desc' : 'asc')
                            else { setDeviceSortField('totalCost'); setDeviceSortDir('desc') }
                          }}
                          className={`px-2 py-1 text-xs rounded ${deviceSortField === 'totalCost' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                        >
                          Cost {deviceSortField === 'totalCost' && (deviceSortDir === 'desc' ? '↓' : '↑')}
                        </button>
                      </div>
                    </div>
                    {analytics.deviceCosts.length === 0 ? (
                      <p className="text-gray-400 text-sm">No device costs recorded.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-800">
                              <th className="text-left text-gray-400 py-2 px-3">Device</th>
                              <th className="text-right text-gray-400 py-2 px-3">Requests</th>
                              <th className="text-right text-gray-400 py-2 px-3">Cost/Request</th>
                              <th className="text-right text-gray-400 py-2 px-3">Total Cost</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...analytics.deviceCosts]
                              .sort((a, b) => {
                                const aVal = deviceSortField === 'requestCount' ? a.requestCount : a.totalCost
                                const bVal = deviceSortField === 'requestCount' ? b.requestCount : b.totalCost
                                return deviceSortDir === 'desc' ? bVal - aVal : aVal - bVal
                              })
                              .map((dc, idx) => (
                                <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                                  <td className="py-2 px-3">
                                    <div className="flex items-center gap-2">
                                      <span>{dc.device?.platform === 'android' ? '🤖' : '🍎'}</span>
                                      <div>
                                        <p className="text-white">{dc.device?.model || 'Unknown'}</p>
                                        <p className="text-gray-500 text-xs font-mono">{dc.device?.deviceId.slice(0, 12)}...</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-2 px-3 text-right text-gray-300">{dc.requestCount.toLocaleString()}</td>
                                  <td className="py-2 px-3 text-right text-blue-400">${dc.requestCount > 0 ? (dc.totalCost / dc.requestCount).toFixed(2) : '0.00'} USD</td>
                                  <td className="py-2 px-3 text-right text-green-400 font-medium">${dc.totalCost.toFixed(2)} USD</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Cost by Session */}
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-medium">Cost by Session</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs">Sort by:</span>
                        <button
                          onClick={() => {
                            if (sessionSortField === 'startedAt') setSessionSortDir(d => d === 'asc' ? 'desc' : 'asc')
                            else { setSessionSortField('startedAt'); setSessionSortDir('desc') }
                          }}
                          className={`px-2 py-1 text-xs rounded ${sessionSortField === 'startedAt' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                        >
                          Date {sessionSortField === 'startedAt' && (sessionSortDir === 'desc' ? '↓' : '↑')}
                        </button>
                        <button
                          onClick={() => {
                            if (sessionSortField === 'requestCount') setSessionSortDir(d => d === 'asc' ? 'desc' : 'asc')
                            else { setSessionSortField('requestCount'); setSessionSortDir('desc') }
                          }}
                          className={`px-2 py-1 text-xs rounded ${sessionSortField === 'requestCount' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                        >
                          Requests {sessionSortField === 'requestCount' && (sessionSortDir === 'desc' ? '↓' : '↑')}
                        </button>
                        <button
                          onClick={() => {
                            if (sessionSortField === 'totalCost') setSessionSortDir(d => d === 'asc' ? 'desc' : 'asc')
                            else { setSessionSortField('totalCost'); setSessionSortDir('desc') }
                          }}
                          className={`px-2 py-1 text-xs rounded ${sessionSortField === 'totalCost' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                        >
                          Cost {sessionSortField === 'totalCost' && (sessionSortDir === 'desc' ? '↓' : '↑')}
                        </button>
                      </div>
                    </div>
                    {analytics.sessionCosts.length === 0 ? (
                      <p className="text-gray-400 text-sm">No session costs recorded.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-800">
                              <th className="text-left text-gray-400 py-2 px-3">Session</th>
                              <th className="text-left text-gray-400 py-2 px-3">Device</th>
                              <th className="text-left text-gray-400 py-2 px-3">Time</th>
                              <th className="text-right text-gray-400 py-2 px-3">Requests</th>
                              <th className="text-right text-gray-400 py-2 px-3">Cost/Request</th>
                              <th className="text-right text-gray-400 py-2 px-3">Total Cost</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...analytics.sessionCosts]
                              .sort((a, b) => {
                                if (sessionSortField === 'startedAt') {
                                  const aVal = new Date(a.startedAt).getTime()
                                  const bVal = new Date(b.startedAt).getTime()
                                  return sessionSortDir === 'desc' ? bVal - aVal : aVal - bVal
                                }
                                const aVal = sessionSortField === 'requestCount' ? a.requestCount : a.totalCost
                                const bVal = sessionSortField === 'requestCount' ? b.requestCount : b.totalCost
                                return sessionSortDir === 'desc' ? bVal - aVal : aVal - bVal
                              })
                              .map((session) => (
                                <tr key={session.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                                  <td className="py-2 px-3">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${session.isActive ? 'bg-green-400' : 'bg-gray-500'}`} />
                                      <span className="text-white font-mono text-xs">{session.sessionToken}</span>
                                    </div>
                                  </td>
                                  <td className="py-2 px-3 text-gray-300">
                                    {session.device ? `${session.device.model || session.device.deviceId.slice(0, 8)}` : '-'}
                                  </td>
                                  <td className="py-2 px-3 text-gray-400 text-xs">
                                    {formatTime(session.startedAt)}
                                  </td>
                                  <td className="py-2 px-3 text-right text-gray-300">{session.requestCount.toLocaleString()}</td>
                                  <td className="py-2 px-3 text-right text-blue-400">${session.requestCount > 0 ? (session.totalCost / session.requestCount).toFixed(2) : '0.00'} USD</td>
                                  <td className="py-2 px-3 text-right text-green-400 font-medium">${session.totalCost.toFixed(2)} USD</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Cost by Endpoint */}
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-medium">Cost by Endpoint</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs">Sort by:</span>
                        <button
                          onClick={() => {
                            if (endpointSortField === 'requestCount') setEndpointSortDir(d => d === 'asc' ? 'desc' : 'asc')
                            else { setEndpointSortField('requestCount'); setEndpointSortDir('desc') }
                          }}
                          className={`px-2 py-1 text-xs rounded ${endpointSortField === 'requestCount' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                        >
                          Requests {endpointSortField === 'requestCount' && (endpointSortDir === 'desc' ? '↓' : '↑')}
                        </button>
                        <button
                          onClick={() => {
                            if (endpointSortField === 'avgCostPerRequest') setEndpointSortDir(d => d === 'asc' ? 'desc' : 'asc')
                            else { setEndpointSortField('avgCostPerRequest'); setEndpointSortDir('desc') }
                          }}
                          className={`px-2 py-1 text-xs rounded ${endpointSortField === 'avgCostPerRequest' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                        >
                          Avg Cost {endpointSortField === 'avgCostPerRequest' && (endpointSortDir === 'desc' ? '↓' : '↑')}
                        </button>
                        <button
                          onClick={() => {
                            if (endpointSortField === 'totalCost') setEndpointSortDir(d => d === 'asc' ? 'desc' : 'asc')
                            else { setEndpointSortField('totalCost'); setEndpointSortDir('desc') }
                          }}
                          className={`px-2 py-1 text-xs rounded ${endpointSortField === 'totalCost' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                        >
                          Total Cost {endpointSortField === 'totalCost' && (endpointSortDir === 'desc' ? '↓' : '↑')}
                        </button>
                      </div>
                    </div>
                    {analytics.endpointCosts.length === 0 ? (
                      <p className="text-gray-400 text-sm">No endpoint costs. Configure API costs first.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-800">
                              <th className="text-left text-gray-400 py-2 px-3">Method</th>
                              <th className="text-left text-gray-400 py-2 px-3">Endpoint</th>
                              <th className="text-right text-gray-400 py-2 px-3">Requests</th>
                              <th className="text-right text-gray-400 py-2 px-3">Cost/Request</th>
                              <th className="text-right text-gray-400 py-2 px-3">Total Cost</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...analytics.endpointCosts]
                              .sort((a, b) => {
                                let aVal: number, bVal: number
                                if (endpointSortField === 'requestCount') {
                                  aVal = a.requestCount; bVal = b.requestCount
                                } else if (endpointSortField === 'avgCostPerRequest') {
                                  aVal = a.avgCostPerRequest; bVal = b.avgCostPerRequest
                                } else {
                                  aVal = a.totalCost; bVal = b.totalCost
                                }
                                return endpointSortDir === 'desc' ? bVal - aVal : aVal - bVal
                              })
                              .map((ep, idx) => (
                                <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                                  <td className="py-2 px-3">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${ep.method === 'GET' ? 'bg-blue-900/50 text-blue-400' :
                                        ep.method === 'POST' ? 'bg-green-900/50 text-green-400' :
                                          ep.method === 'PUT' ? 'bg-yellow-900/50 text-yellow-400' :
                                            ep.method === 'DELETE' ? 'bg-red-900/50 text-red-400' :
                                              'bg-gray-700 text-gray-300'
                                      }`}>{ep.method}</span>
                                  </td>
                                  <td className="py-2 px-3 text-gray-300 font-mono text-xs">{ep.endpoint}</td>
                                  <td className="py-2 px-3 text-right text-gray-300">{ep.requestCount.toLocaleString()}</td>
                                  <td className="py-2 px-3 text-right text-blue-400">${ep.avgCostPerRequest.toFixed(2)} USD</td>
                                  <td className="py-2 px-3 text-right text-green-400 font-medium">${ep.totalCost.toFixed(2)} USD</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'flow' && (
            <div className="space-y-4">
              {/* Enforcement Banner for Sessions */}
              {sessionsUsage && sessionsUsage.limit !== null && (
                <>
                  {(() => {
                    const percentage = sessionsUsage.percentage
                    const warnThreshold = 80
                    const hardThreshold = 100

                    if (percentage >= hardThreshold) {
                      return (
                        <div className="bg-red-900/20 border-l-4 border-red-600 p-4 rounded">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                                <span>🚫</span>
                                <span>Sessions Quota Exceeded</span>
                              </h3>
                              <p className="text-gray-300 text-sm mb-2">
                                You have reached your sessions limit: <strong>{sessionsUsage.used}/{sessionsUsage.limit} sessions</strong> ({percentage.toFixed(1)}%).
                              </p>
                              <p className="text-gray-300 text-sm">
                                New sessions will be blocked. Please upgrade your plan to continue tracking user sessions.
                              </p>
                            </div>
                            <button
                              onClick={() => router.push('/subscription')}
                              className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm whitespace-nowrap"
                            >
                              Upgrade Plan
                            </button>
                          </div>
                        </div>
                      )
                    } else if (percentage >= warnThreshold) {
                      return (
                        <div className="bg-yellow-900/20 border-l-4 border-yellow-600 p-4 rounded">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
                                <span>⚠️</span>
                                <span>Approaching Sessions Limit</span>
                              </h3>
                              <p className="text-gray-300 text-sm mb-2">
                                You are approaching your sessions limit: <strong>{sessionsUsage.used}/{sessionsUsage.limit} sessions</strong> ({percentage.toFixed(1)}%).
                              </p>
                              <p className="text-gray-300 text-sm">
                                You can track {Math.max(0, sessionsUsage.limit - sessionsUsage.used)} more session{sessionsUsage.limit - sessionsUsage.used !== 1 ? 's' : ''} before reaching your limit.
                              </p>
                            </div>
                            <button
                              onClick={() => router.push('/subscription')}
                              className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm whitespace-nowrap"
                            >
                              Upgrade Plan
                            </button>
                          </div>
                        </div>
                      )
                    }
                    return null
                  })()}
                </>
              )}
              {/* Session Selector Header */}
              <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-900 rounded-lg">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setFlowViewMode('timeline')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${flowViewMode === 'timeline'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    Timeline
                  </button>
                  <button
                    onClick={() => setFlowViewMode('flow')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${flowViewMode === 'flow'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    Flow
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-gray-400 text-sm">Select Session:</label>
                  <select
                    value={selectedFlowSession}
                    onChange={(e) => {
                      const sessionId = e.target.value
                      setSelectedFlowSession(sessionId)
                      setSelectedEdge(null) // Clear selection when changing session
                      setExpandedTimelineEvent(null)
                      if (sessionId && flowViewMode === 'timeline') {
                        fetchTimeline(sessionId)
                      }
                    }}
                    className="bg-gray-800 text-gray-300 text-sm rounded px-3 py-1.5 border border-gray-700 focus:border-blue-500 focus:outline-none min-w-[300px]"
                  >
                    <option value="">-- Select a session to view --</option>
                    {flowData?.sessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.sessionToken} - {session.device?.model || 'Unknown'} ({session.requestCount} req, ${session.totalCost.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => {
                    fetchFlow()
                    if (selectedFlowSession && flowViewMode === 'timeline') {
                      fetchTimeline(selectedFlowSession)
                    }
                  }}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                >
                  Refresh
                </button>
              </div>

              {flowLoading ? (
                <p className="text-gray-400 text-center py-8">Loading flow data...</p>
              ) : !flowData || flowData.sessions.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No session data available. Make sure your app is sending screenName with traces.</p>
              ) : !selectedFlowSession ? (
                /* Show session list when no session selected */
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-4">Available Sessions</h3>
                  <div className="space-y-3">
                    {flowData.sessions.slice(0, 20).map((session) => (
                      <div
                        key={session.id}
                        className="border border-gray-800 rounded-lg p-3 hover:border-blue-500 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedFlowSession(session.id)
                          if (flowViewMode === 'timeline') {
                            fetchTimeline(session.id)
                          }
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${session.isActive ? 'bg-green-400' : 'bg-gray-500'}`} />
                            <span className="text-white text-sm font-medium">
                              {session.sessionToken}
                            </span>
                            {session.device && (
                              <span className="text-gray-400 text-xs">
                                {session.device.model || session.device.deviceId.slice(0, 8)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span>{session.requestCount} requests</span>
                            <span className="text-green-400">${session.totalCost.toFixed(2)}</span>
                          </div>
                        </div>
                        {/* Screen sequence preview */}
                        <div className="flex flex-wrap items-center gap-1 mt-2">
                          {session.screenSequence.slice(0, 6).map((screen, idx) => (
                            <React.Fragment key={idx}>
                              <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded">
                                {screen.length > 12 ? screen.slice(0, 10) + '...' : screen}
                              </span>
                              {idx < Math.min(session.screenSequence.length, 6) - 1 && (
                                <span className="text-gray-500">→</span>
                              )}
                            </React.Fragment>
                          ))}
                          {session.screenSequence.length > 6 && (
                            <span className="text-gray-500 text-xs">+{session.screenSequence.length - 6} more</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Show split view when session is selected */
                <>
                  {/* Selected Session Info */}
                  {(() => {
                    const currentSession = flowData.sessions.find(s => s.id === selectedFlowSession)
                    if (!currentSession) return null
                    return (
                      <div className="bg-gray-900 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${currentSession.isActive ? 'bg-green-400' : 'bg-gray-500'}`} />
                            <span className="text-white font-medium">{currentSession.sessionToken}</span>
                            {currentSession.device && (
                              <span className="text-gray-400 text-sm">
                                {currentSession.device.platform} - {currentSession.device.model || currentSession.device.deviceId.slice(0, 8)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <span className="text-gray-400">{currentSession.requestCount} requests</span>
                            <span className="text-gray-400">{currentSession.screenSequence.length} screens</span>
                            <span className="text-green-400 font-medium">${currentSession.totalCost.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Timeline View */}
                  {flowViewMode === 'timeline' && (
                    <div className="bg-gray-900 rounded-lg p-4">
                      {timelineLoading ? (
                        <p className="text-gray-400 text-center py-8">Loading timeline...</p>
                      ) : !timelineData ? (
                        <div className="text-gray-400 text-center py-8">
                          <p>No timeline data available.</p>
                          <button
                            onClick={() => fetchTimeline(selectedFlowSession)}
                            className="mt-2 text-blue-400 hover:text-blue-300"
                          >
                            Click to load timeline
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* Timeline Stats */}
                          <div className="flex items-center gap-6 mb-6 pb-4 border-b border-gray-800">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400 text-sm">Requests:</span>
                              <span className="text-white font-medium">{timelineData.stats.totalRequests}</span>
                              <span className="text-green-400 text-xs">({timelineData.stats.successfulRequests} ok)</span>
                              {timelineData.stats.failedRequests > 0 && (
                                <span className="text-red-400 text-xs">({timelineData.stats.failedRequests} failed)</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400 text-sm">Logs:</span>
                              <span className="text-white font-medium">{timelineData.stats.totalLogs}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400 text-sm">Cost:</span>
                              <span className="text-green-400 font-medium">${timelineData.stats.totalCost.toFixed(2)}</span>
                            </div>
                            {timelineData.session.appVersion && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400 text-sm">App:</span>
                                <span className="text-white text-sm">{timelineData.session.appVersion}</span>
                              </div>
                            )}
                            {timelineData.session.locale && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400 text-sm">Locale:</span>
                                <span className="text-white text-sm">{timelineData.session.locale}</span>
                              </div>
                            )}
                          </div>

                          {/* Timeline Events */}
                          <div className="space-y-1">
                            {timelineData.timeline.map((event, idx) => {
                              const eventId = event.type === 'screen' ? `screen-${idx}` : event.type === 'request' ? event.id : event.id
                              const isExpanded = expandedTimelineEvent === eventId
                              const time = new Date(event.timestamp).toLocaleTimeString()

                              if (event.type === 'screen') {
                                return (
                                  <div key={eventId} className="flex items-center gap-3 py-3">
                                    <span className="text-gray-500 text-xs font-mono w-20 flex-shrink-0">{time}</span>
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 rounded-full bg-indigo-500" />
                                      <div className="w-0.5 h-4 bg-gray-700" />
                                    </div>
                                    <div className="flex-1 bg-indigo-900/30 rounded-lg px-4 py-2 border border-indigo-700/50">
                                      <div className="flex items-center gap-2">
                                        <span className="text-indigo-400 text-sm font-medium">Screen</span>
                                        <span className="text-white font-medium">{event.name}</span>
                                      </div>
                                    </div>
                                  </div>
                                )
                              }

                              if (event.type === 'request') {
                                const methodColors: Record<string, string> = {
                                  GET: 'bg-blue-900/50 text-blue-400',
                                  POST: 'bg-green-900/50 text-green-400',
                                  PUT: 'bg-yellow-900/50 text-yellow-400',
                                  PATCH: 'bg-orange-900/50 text-orange-400',
                                  DELETE: 'bg-red-900/50 text-red-400'
                                }
                                const statusColor = event.statusCode
                                  ? event.statusCode >= 200 && event.statusCode < 300
                                    ? 'text-green-400'
                                    : event.statusCode >= 400
                                      ? 'text-red-400'
                                      : 'text-yellow-400'
                                  : 'text-gray-400'

                                return (
                                  <div key={eventId} className="flex items-start gap-3 py-1">
                                    <span className="text-gray-500 text-xs font-mono w-20 flex-shrink-0 pt-2">{time}</span>
                                    <div className="flex flex-col items-center pt-2">
                                      <div className="w-2 h-2 rounded-full bg-gray-600" />
                                      <div className="w-0.5 h-full bg-gray-800 min-h-[20px]" />
                                    </div>
                                    <div
                                      className={`flex-1 border rounded-lg transition-colors cursor-pointer ${isExpanded ? 'border-blue-500 bg-gray-800/50' : 'border-gray-800 hover:border-gray-700'
                                        }`}
                                      onClick={() => setExpandedTimelineEvent(isExpanded ? null : eventId)}
                                    >
                                      <div className="px-3 py-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${methodColors[event.method] || 'bg-gray-700 text-gray-300'}`}>
                                            {event.method}
                                          </span>
                                          <span className={`text-xs font-medium ${statusColor}`}>
                                            {event.statusCode || 'pending'}
                                          </span>
                                          {event.duration && (
                                            <span className="text-gray-500 text-xs">{event.duration}ms</span>
                                          )}
                                          {event.cost !== null && event.cost > 0 && (
                                            <span className="text-green-400 text-xs">${event.cost.toFixed(2)}</span>
                                          )}
                                          <span className="text-gray-400 text-xs truncate max-w-md" title={event.url}>
                                            {event.endpoint}
                                          </span>
                                          {event.error && (
                                            <span className="text-red-400 text-xs">Error</span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Expanded Details */}
                                      {isExpanded && (
                                        <div className="px-3 pb-3 space-y-3 border-t border-gray-700 pt-3">
                                          <div>
                                            <p className="text-gray-400 text-xs mb-1">URL</p>
                                            <p className="text-gray-300 text-xs font-mono break-all bg-gray-900 p-2 rounded">{event.url}</p>
                                          </div>
                                          {event.error && (
                                            <div>
                                              <p className="text-red-400 text-xs mb-1">Error</p>
                                              <p className="text-red-300 text-xs font-mono bg-red-900/20 p-2 rounded">{event.error}</p>
                                            </div>
                                          )}
                                          {event.requestBody && (
                                            <div>
                                              <p className="text-gray-400 text-xs mb-1">Request Body</p>
                                              <pre className="text-gray-300 text-xs font-mono bg-gray-900 p-2 rounded overflow-x-auto max-h-40">
                                                {(() => {
                                                  try {
                                                    return JSON.stringify(JSON.parse(event.requestBody), null, 2)
                                                  } catch {
                                                    return event.requestBody
                                                  }
                                                })()}
                                              </pre>
                                            </div>
                                          )}
                                          {event.responseBody && (
                                            <div>
                                              <p className="text-gray-400 text-xs mb-1">Response Body</p>
                                              <pre className="text-gray-300 text-xs font-mono bg-gray-900 p-2 rounded overflow-x-auto max-h-40">
                                                {(() => {
                                                  try {
                                                    return JSON.stringify(JSON.parse(event.responseBody), null, 2)
                                                  } catch {
                                                    return event.responseBody
                                                  }
                                                })()}
                                              </pre>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )
                              }

                              if (event.type === 'log') {
                                const levelColors: Record<string, string> = {
                                  verbose: 'bg-gray-700 text-gray-300',
                                  debug: 'bg-gray-700 text-gray-300',
                                  info: 'bg-blue-900/50 text-blue-400',
                                  warn: 'bg-yellow-900/50 text-yellow-400',
                                  error: 'bg-red-900/50 text-red-400',
                                  assert: 'bg-red-900/50 text-red-400'
                                }

                                return (
                                  <div key={eventId} className="flex items-start gap-3 py-1">
                                    <span className="text-gray-500 text-xs font-mono w-20 flex-shrink-0 pt-2">{time}</span>
                                    <div className="flex flex-col items-center pt-2">
                                      <div className="w-2 h-2 rounded-full bg-gray-600" />
                                      <div className="w-0.5 h-full bg-gray-800 min-h-[20px]" />
                                    </div>
                                    <div
                                      className={`flex-1 border rounded-lg transition-colors cursor-pointer ${isExpanded ? 'border-blue-500 bg-gray-800/50' : 'border-gray-800 hover:border-gray-700'
                                        }`}
                                      onClick={() => setExpandedTimelineEvent(isExpanded ? null : eventId)}
                                    >
                                      <div className="px-3 py-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${levelColors[event.level] || 'bg-gray-700 text-gray-300'}`}>
                                            {event.level}
                                          </span>
                                          {event.tag && (
                                            <span className="px-2 py-0.5 bg-gray-700 text-gray-400 rounded text-xs">
                                              {event.tag}
                                            </span>
                                          )}
                                          <span className="text-gray-300 text-sm truncate max-w-lg">
                                            {event.message.length > 80 ? event.message.slice(0, 80) + '...' : event.message}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Expanded Details */}
                                      {isExpanded && (
                                        <div className="px-3 pb-3 space-y-3 border-t border-gray-700 pt-3">
                                          <div>
                                            <p className="text-gray-400 text-xs mb-1">Message</p>
                                            <p className="text-gray-300 text-sm bg-gray-900 p-2 rounded whitespace-pre-wrap">{event.message}</p>
                                          </div>
                                          {event.fileName && (
                                            <div>
                                              <p className="text-gray-400 text-xs mb-1">Location</p>
                                              <p className="text-gray-300 text-xs font-mono">
                                                {event.fileName}
                                                {event.lineNumber && `:${event.lineNumber}`}
                                                {event.functionName && ` in ${event.functionName}()`}
                                                {event.className && ` [${event.className}]`}
                                              </p>
                                            </div>
                                          )}
                                          {event.data && typeof event.data === 'object' && Object.keys(event.data).length > 0 ? (
                                            <div>
                                              <p className="text-gray-400 text-xs mb-1">Data</p>
                                              <pre className="text-gray-300 text-xs font-mono bg-gray-900 p-2 rounded overflow-x-auto max-h-40">
                                                {JSON.stringify(event.data, null, 2)}
                                              </pre>
                                            </div>
                                          ) : null}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )
                              }

                              return null
                            })}
                          </div>

                          {timelineData.timeline.length === 0 && (
                            <p className="text-gray-500 text-center py-8">No events recorded for this session.</p>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Flow View: Split View: Flow Visual (Left) + Details (Right) */}
                  {flowViewMode === 'flow' && (
                    <>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ minHeight: '600px' }}>
                        {/* Left: Flow Visualization */}
                        <div className="bg-gray-900 rounded-lg p-4 overflow-auto">
                          <h3 className="text-white font-medium mb-4">Screen Flow</h3>

                          {/* Session Sequence - Clickable */}
                          {(() => {
                            const currentSession = flowData.sessions.find(s => s.id === selectedFlowSession)
                            if (!currentSession) return null

                            return (
                              <div className="space-y-2">
                                {currentSession.screenSequence.map((screen, idx) => {
                                  const nextScreen = currentSession.screenSequence[idx + 1]
                                  const edgeId = nextScreen ? `${screen}->${nextScreen}` : null
                                  const edge = edgeId ? flowData.edges.find(e => e.id === edgeId) : null
                                  const isEdgeSelected = selectedEdge === edgeId

                                  return (
                                    <React.Fragment key={idx}>
                                      {/* Screen Node */}
                                      <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 flex items-center justify-center bg-indigo-600 text-white text-sm rounded-full font-bold flex-shrink-0">
                                          {idx + 1}
                                        </span>
                                        <div className="flex-1 bg-gray-800 rounded-lg p-3 border-2 border-gray-700">
                                          <span className="text-white font-medium">{screen}</span>
                                          {(() => {
                                            const node = flowData.nodes.find(n => n.id === screen)
                                            if (!node) return null
                                            const successRate = node.requestCount > 0 ? ((node.successCount / node.requestCount) * 100).toFixed(0) : '0'
                                            return (
                                              <div className="flex items-center gap-4 mt-1 text-xs">
                                                <span className="text-gray-400">{node.requestCount} req</span>
                                                <span className={Number(successRate) >= 90 ? 'text-green-400' : Number(successRate) >= 50 ? 'text-yellow-400' : 'text-red-400'}>
                                                  {successRate}% ok
                                                </span>
                                                <span className="text-green-400">${node.totalCost.toFixed(2)}</span>
                                              </div>
                                            )
                                          })()}
                                        </div>
                                      </div>

                                      {/* Arrow to next screen - Clickable */}
                                      {nextScreen && edge && (
                                        <div
                                          className={`ml-4 flex items-center gap-2 py-2 px-3 rounded cursor-pointer transition-colors ${isEdgeSelected ? 'bg-blue-900/50 border border-blue-500' : 'hover:bg-gray-800'
                                            }`}
                                          onClick={() => setSelectedEdge(isEdgeSelected ? null : edgeId)}
                                        >
                                          <div className="flex flex-col items-center">
                                            <div className={`w-0.5 h-4 ${isEdgeSelected ? 'bg-blue-500' : 'bg-gray-600'}`} />
                                            <svg className={`w-4 h-4 ${isEdgeSelected ? 'text-blue-500' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                            <div className={`w-0.5 h-4 ${isEdgeSelected ? 'bg-blue-500' : 'bg-gray-600'}`} />
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 text-xs">
                                              <span className={`px-2 py-0.5 rounded-full font-medium ${isEdgeSelected ? 'bg-blue-600 text-white' : 'bg-indigo-900/50 text-indigo-400'}`}>
                                                #{edge.sequenceNumber}
                                              </span>
                                              <span className="text-gray-400">{edge.requestCount} requests</span>
                                              <span className={edge.errorCount > 0 ? 'text-red-400' : 'text-green-400'}>
                                                {edge.successCount}/{edge.requestCount} ok
                                              </span>
                                              <span className="text-green-400">${edge.totalCost.toFixed(2)}</span>
                                            </div>
                                            {edge.topEndpoints.length > 0 && (
                                              <div className="mt-1 text-xs text-gray-500">
                                                {edge.topEndpoints.slice(0, 2).map((ep, i) => (
                                                  <span key={i} className="mr-2">
                                                    <span className={`font-medium ${ep.method === 'GET' ? 'text-blue-400' :
                                                        ep.method === 'POST' ? 'text-green-400' :
                                                          ep.method === 'PUT' ? 'text-yellow-400' :
                                                            'text-red-400'
                                                      }`}>{ep.method}</span> {ep.endpoint.slice(0, 20)}...
                                                  </span>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                          <span className={`text-xs ${isEdgeSelected ? 'text-blue-400' : 'text-gray-500'}`}>
                                            Click for details →
                                          </span>
                                        </div>
                                      )}
                                    </React.Fragment>
                                  )
                                })}
                              </div>
                            )
                          })()}
                        </div>

                        {/* Right: Transition Details */}
                        <div className="bg-gray-900 rounded-lg p-4 overflow-auto">
                          <h3 className="text-white font-medium mb-4">Transition Details</h3>

                          {!selectedEdge ? (
                            <div className="flex items-center justify-center h-full min-h-[400px] text-gray-500">
                              <div className="text-center">
                                <svg className="w-16 h-16 mx-auto mb-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                                <p>Click on an arrow to view</p>
                                <p>request/response details</p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {(() => {
                                const edge = flowData.edges.find(e => e.id === selectedEdge)
                                if (!edge) return null

                                return (
                                  <>
                                    {/* Transition Header */}
                                    <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                                      <span className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-full font-bold">
                                        #{edge.sequenceNumber}
                                      </span>
                                      <div>
                                        <p className="text-white font-medium">{edge.source} → {edge.target}</p>
                                        <p className="text-gray-400 text-xs">
                                          {edge.requestCount} requests | {edge.successCount} success | {edge.errorCount} errors | ${edge.totalCost.toFixed(2)}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Endpoints */}
                                    {edge.topEndpoints.map((ep, idx) => (
                                      <div key={idx} className="border border-gray-800 rounded-lg p-4">
                                        {/* Endpoint Header */}
                                        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                                          <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${ep.method === 'GET' ? 'bg-blue-900/50 text-blue-400' :
                                                ep.method === 'POST' ? 'bg-green-900/50 text-green-400' :
                                                  ep.method === 'PUT' ? 'bg-yellow-900/50 text-yellow-400' :
                                                    ep.method === 'DELETE' ? 'bg-red-900/50 text-red-400' :
                                                      'bg-gray-700 text-gray-300'
                                              }`}>
                                              {ep.method}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${ep.statusCode >= 200 && ep.statusCode < 300 ? 'bg-green-900/50 text-green-400' :
                                                ep.statusCode >= 400 ? 'bg-red-900/50 text-red-400' :
                                                  'bg-gray-700 text-gray-300'
                                              }`}>
                                              {ep.statusCode}
                                            </span>
                                            <span className="text-gray-400 text-xs">{ep.duration}ms</span>
                                          </div>
                                          <div className="flex items-center gap-3 text-xs">
                                            <span className="text-gray-400">{ep.count}x</span>
                                            <span className={ep.successRate >= 90 ? 'text-green-400' : ep.successRate >= 50 ? 'text-yellow-400' : 'text-red-400'}>
                                              {ep.successRate.toFixed(0)}%
                                            </span>
                                            <span className="text-green-400">${ep.cost.toFixed(2)}</span>
                                          </div>
                                        </div>

                                        {/* URL */}
                                        <div className="mb-3 p-2 bg-gray-950 rounded text-xs font-mono text-gray-400 break-all">
                                          {ep.url}
                                        </div>

                                        {/* Request Body */}
                                        <div className="mb-3">
                                          <h4 className="text-sm font-medium text-gray-300 mb-2">Request Body</h4>
                                          {ep.requestBody ? (
                                            <pre className="p-3 bg-gray-950 rounded text-xs text-gray-400 overflow-x-auto max-h-40">
                                              {(() => {
                                                try {
                                                  return JSON.stringify(JSON.parse(ep.requestBody), null, 2)
                                                } catch {
                                                  return ep.requestBody
                                                }
                                              })()}
                                            </pre>
                                          ) : (
                                            <p className="text-xs text-gray-500 italic p-3 bg-gray-950 rounded">No request body</p>
                                          )}
                                        </div>

                                        {/* Response Body */}
                                        <div>
                                          <h4 className="text-sm font-medium text-gray-300 mb-2">Response Body</h4>
                                          {ep.responseBody ? (
                                            <pre className="p-3 bg-gray-950 rounded text-xs text-gray-400 overflow-x-auto max-h-40">
                                              {(() => {
                                                try {
                                                  return JSON.stringify(JSON.parse(ep.responseBody), null, 2)
                                                } catch {
                                                  return ep.responseBody
                                                }
                                              })()}
                                            </pre>
                                          ) : (
                                            <p className="text-xs text-gray-500 italic p-3 bg-gray-950 rounded">No response body</p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </>
                                )
                              })()}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Screen Summary Table */}
                      <div className="bg-gray-900 rounded-lg p-4">
                        <h3 className="text-white font-medium mb-4">Screen Summary</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-800">
                                <th className="text-left text-gray-400 py-2 px-4">Screen</th>
                                <th className="text-right text-gray-400 py-2 px-4">Requests</th>
                                <th className="text-right text-gray-400 py-2 px-4">Success</th>
                                <th className="text-right text-gray-400 py-2 px-4">Errors</th>
                                <th className="text-right text-gray-400 py-2 px-4">Success Rate</th>
                                <th className="text-right text-gray-400 py-2 px-4">Total Cost</th>
                              </tr>
                            </thead>
                            <tbody>
                              {flowData.nodes.map((node) => {
                                const successRate = node.requestCount > 0 ? ((node.successCount / node.requestCount) * 100) : 0
                                return (
                                  <tr key={node.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                                    <td className="py-2 px-4 text-white">{node.name}</td>
                                    <td className="py-2 px-4 text-right text-gray-300">{node.requestCount}</td>
                                    <td className="py-2 px-4 text-right text-green-400">{node.successCount}</td>
                                    <td className="py-2 px-4 text-right text-red-400">{node.errorCount}</td>
                                    <td className="py-2 px-4 text-right">
                                      <span className={successRate >= 90 ? 'text-green-400' : successRate >= 50 ? 'text-yellow-400' : 'text-red-400'}>
                                        {successRate.toFixed(1)}%
                                      </span>
                                    </td>
                                    <td className="py-2 px-4 text-right text-green-400">${node.totalCost.toFixed(2)}</td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'monitor' && (
            <div className="space-y-6">
              {/* Sub-tabs */}
              <div className="border-b border-gray-800">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setMonitorSubTab('errors')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${monitorSubTab === 'errors'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-white'
                      }`}
                  >
                    Monitored Errors
                  </button>
                  <button
                    onClick={() => setMonitorSubTab('settings')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${monitorSubTab === 'settings'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-white'
                      }`}
                  >
                    Settings
                  </button>
                </nav>
              </div>

              {monitorSubTab === 'errors' && (
                <>
                  {/* Monitor Summary Cards */}
                  {monitorSummary && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-900 rounded-lg p-4">
                        <p className="text-gray-400 text-sm">Total Errors</p>
                        <p className="text-2xl font-bold text-white">{monitorSummary.totalErrors}</p>
                      </div>
                      <div className="bg-gray-900 rounded-lg p-4">
                        <p className="text-gray-400 text-sm">Unresolved</p>
                        <p className="text-2xl font-bold text-red-400">{monitorSummary.unresolvedCount}</p>
                      </div>
                      <div className="bg-gray-900 rounded-lg p-4">
                        <p className="text-gray-400 text-sm">Resolved</p>
                        <p className="text-2xl font-bold text-green-400">{monitorSummary.resolvedCount}</p>
                      </div>
                      <div className="bg-gray-900 rounded-lg p-4">
                        <p className="text-gray-400 text-sm">Total Occurrences</p>
                        <p className="text-2xl font-bold text-white">{monitorSummary.totalOccurrences}</p>
                      </div>
                    </div>
                  )}

                  {/* Filter Buttons */}
                  <div className="flex gap-2">
                    {(['all', 'unresolved', 'resolved'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setMonitorFilter(filter)}
                        className={`px-4 py-2 rounded text-sm ${monitorFilter === filter
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          }`}
                      >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Master-Detail View */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Error List (Master) */}
                    <div className="bg-gray-900 rounded-lg p-4">
                      <h3 className="text-white font-medium mb-4">Monitored Errors</h3>
                      {monitoredErrors.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">No errors found</p>
                      ) : (
                        <div className="space-y-3 max-h-[600px] overflow-y-auto">
                          {monitoredErrors.map((error) => (
                            <div
                              key={error.id}
                              onClick={() => setSelectedError(error)}
                              className={`p-4 rounded-lg cursor-pointer transition-colors ${selectedError?.id === error.id
                                  ? 'bg-blue-900/50 border border-blue-500'
                                  : 'bg-gray-800 hover:bg-gray-700'
                                }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${error.isResolved ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                                  }`}>
                                  {error.isResolved ? 'Resolved' : 'Active'}
                                </span>
                                <span className="text-gray-400 text-xs">{error.occurrenceCount} occurrences</span>
                              </div>
                              <h4 className="text-white font-medium">{error.alert.title}</h4>
                              <p className="text-gray-400 text-sm mt-1">
                                <span className={getStatusColor(error.statusCode || 0)}>{error.statusCode}</span>
                                {' '}{error.method} {error.endpoint}
                              </p>
                              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                                <span>Error: {error.errorCode}</span>
                                <span>{formatTime(error.lastOccurrence)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Error Details (Detail) */}
                    <div className="bg-gray-900 rounded-lg p-4">
                      <h3 className="text-white font-medium mb-4">Error Details</h3>
                      {selectedError ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg text-white font-medium">{selectedError.alert.title}</h4>
                            <button
                              onClick={() => handleResolveError(selectedError.id, !selectedError.isResolved)}
                              className={`px-3 py-1 rounded text-sm ${selectedError.isResolved
                                  ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                                  : 'bg-green-600 hover:bg-green-500 text-white'
                                }`}
                            >
                              {selectedError.isResolved ? 'Reopen' : 'Mark Resolved'}
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Error Type</span>
                              <p className="text-white">{selectedError.errorType}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Error Code</span>
                              <p className="text-white">{selectedError.errorCode}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Status Code</span>
                              <p className={getStatusColor(selectedError.statusCode || 0)}>{selectedError.statusCode}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Method</span>
                              <p className="text-white">{selectedError.method}</p>
                            </div>
                            <div className="col-span-2">
                              <span className="text-gray-500">Endpoint</span>
                              <p className="text-white font-mono text-sm break-all">{selectedError.endpoint}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">First Occurrence</span>
                              <p className="text-white">{formatTime(selectedError.firstOccurrence)}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Last Occurrence</span>
                              <p className="text-white">{formatTime(selectedError.lastOccurrence)}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Total Occurrences</span>
                              <p className="text-white">{selectedError.occurrenceCount}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Affected Devices</span>
                              <p className="text-white">{selectedError.affectedDevices.length}</p>
                            </div>
                          </div>

                          {selectedError.requestBody && (
                            <div>
                              <span className="text-gray-500 text-sm">Request Body</span>
                              <pre className="mt-1 p-3 bg-gray-800 rounded text-xs text-gray-300 overflow-auto max-h-40">
                                {tryFormatJson(selectedError.requestBody)}
                              </pre>
                            </div>
                          )}

                          {selectedError.responseBody && (
                            <div>
                              <span className="text-gray-500 text-sm">Response Body</span>
                              <pre className="mt-1 p-3 bg-gray-800 rounded text-xs text-gray-300 overflow-auto max-h-40">
                                {tryFormatJson(selectedError.responseBody)}
                              </pre>
                            </div>
                          )}

                          {selectedError.notes && (
                            <div>
                              <span className="text-gray-500 text-sm">Notes</span>
                              <p className="mt-1 text-gray-300">{selectedError.notes}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-center py-8">Select an error to view details</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {monitorSubTab === 'settings' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-white font-medium">Alert Rules</h3>
                    <button
                      onClick={() => setShowAddAlert(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 text-sm"
                    >
                      + Add Alert Rule
                    </button>
                  </div>

                  {/* Add Alert Form */}
                  {showAddAlert && (
                    <div className="bg-gray-900 rounded-lg p-4 border border-blue-500">
                      <h4 className="text-white font-medium mb-4">New Alert Rule</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-gray-400 text-sm">Alert Title *</label>
                            <input
                              type="text"
                              value={newAlert.title}
                              onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                              placeholder="e.g., Server Error Alert"
                              className="w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Description</label>
                            <input
                              type="text"
                              value={newAlert.description}
                              onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                              placeholder="Optional description"
                              className="w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 text-sm"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-gray-400 text-sm">Endpoint (optional, leave empty for all)</label>
                            <input
                              type="text"
                              value={newAlert.endpoint}
                              onChange={(e) => setNewAlert({ ...newAlert, endpoint: e.target.value })}
                              placeholder="/api/users/*"
                              className="w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Method (optional)</label>
                            <select
                              value={newAlert.method}
                              onChange={(e) => setNewAlert({ ...newAlert, method: e.target.value })}
                              className="w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 text-sm"
                            >
                              <option value="">All Methods</option>
                              <option value="GET">GET</option>
                              <option value="POST">POST</option>
                              <option value="PUT">PUT</option>
                              <option value="DELETE">DELETE</option>
                              <option value="PATCH">PATCH</option>
                            </select>
                          </div>
                        </div>

                        {/* Error Code Selection */}
                        <div className="space-y-2">
                          <label className="text-gray-400 text-sm">Monitor Standard Error Codes</label>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-white text-sm">
                              <input
                                type="checkbox"
                                checked={newAlert.monitorStandardErrors}
                                onChange={(e) => setNewAlert({ ...newAlert, monitorStandardErrors: e.target.checked })}
                                className="rounded bg-gray-800 border-gray-700"
                              />
                              Enable Standard Error Monitoring
                            </label>
                          </div>
                          {newAlert.monitorStandardErrors && (
                            <div className="mt-2 space-y-2">
                              <p className="text-gray-500 text-xs">Select error codes to monitor:</p>
                              <div className="flex flex-wrap gap-2">
                                <span className="text-gray-400 text-xs">Client (4xx):</span>
                                {standardErrorCodes.client.map((code) => (
                                  <label key={code} className="flex items-center gap-1 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={newAlert.standardErrorCodes.includes(code)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setNewAlert({ ...newAlert, standardErrorCodes: [...newAlert.standardErrorCodes, code] })
                                        } else {
                                          setNewAlert({ ...newAlert, standardErrorCodes: newAlert.standardErrorCodes.filter(c => c !== code) })
                                        }
                                      }}
                                      className="rounded bg-gray-800 border-gray-700"
                                    />
                                    <span className="text-yellow-400">{code}</span>
                                  </label>
                                ))}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <span className="text-gray-400 text-xs">Server (5xx):</span>
                                {standardErrorCodes.server.map((code) => (
                                  <label key={code} className="flex items-center gap-1 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={newAlert.standardErrorCodes.includes(code)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setNewAlert({ ...newAlert, standardErrorCodes: [...newAlert.standardErrorCodes, code] })
                                        } else {
                                          setNewAlert({ ...newAlert, standardErrorCodes: newAlert.standardErrorCodes.filter(c => c !== code) })
                                        }
                                      }}
                                      className="rounded bg-gray-800 border-gray-700"
                                    />
                                    <span className="text-red-400">{code}</span>
                                  </label>
                                ))}
                              </div>
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => setNewAlert({
                                    ...newAlert,
                                    standardErrorCodes: [...standardErrorCodes.client, ...standardErrorCodes.server]
                                  })}
                                  className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600"
                                >Select All</button>
                                <button
                                  onClick={() => setNewAlert({ ...newAlert, standardErrorCodes: [] })}
                                  className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600"
                                >Clear All</button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Custom Error Codes */}
                        <div className="space-y-2">
                          <label className="text-gray-400 text-sm">Custom Status Codes</label>
                          <div className="flex flex-wrap gap-2">
                            {newAlert.customStatusCodes.map((code, idx) => (
                              <span key={idx} className="px-2 py-1 bg-purple-900 text-purple-300 rounded text-sm flex items-center gap-1">
                                {code}
                                <button
                                  onClick={() => setNewAlert({
                                    ...newAlert,
                                    customStatusCodes: newAlert.customStatusCodes.filter((_, i) => i !== idx)
                                  })}
                                  className="text-purple-400 hover:text-red-400"
                                >×</button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={customCodeInput}
                              onChange={(e) => setCustomCodeInput(e.target.value)}
                              placeholder="e.g., 418"
                              className="w-24 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 text-sm"
                            />
                            <button
                              onClick={() => {
                                const code = parseInt(customCodeInput)
                                if (code && !newAlert.customStatusCodes.includes(code)) {
                                  setNewAlert({ ...newAlert, customStatusCodes: [...newAlert.customStatusCodes, code] })
                                  setCustomCodeInput('')
                                }
                              }}
                              className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm"
                            >Add</button>
                          </div>
                        </div>

                        {/* Body Error Detection */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-gray-400 text-sm">Body Error Field (JSON path)</label>
                            <input
                              type="text"
                              value={newAlert.bodyErrorField}
                              onChange={(e) => setNewAlert({ ...newAlert, bodyErrorField: e.target.value })}
                              placeholder="error.code or status"
                              className="w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Body Error Values</label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {newAlert.bodyErrorValues.map((val, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-orange-900 text-orange-300 rounded text-xs flex items-center gap-1">
                                  {val}
                                  <button
                                    onClick={() => setNewAlert({
                                      ...newAlert,
                                      bodyErrorValues: newAlert.bodyErrorValues.filter((_, i) => i !== idx)
                                    })}
                                    className="text-orange-400 hover:text-red-400"
                                  >×</button>
                                </span>
                              ))}
                            </div>
                            <div className="flex gap-2 mt-1">
                              <input
                                type="text"
                                value={bodyErrorValueInput}
                                onChange={(e) => setBodyErrorValueInput(e.target.value)}
                                placeholder="ERROR_CODE"
                                className="flex-1 px-2 py-1 bg-gray-800 text-white rounded border border-gray-700 text-xs"
                              />
                              <button
                                onClick={() => {
                                  if (bodyErrorValueInput && !newAlert.bodyErrorValues.includes(bodyErrorValueInput)) {
                                    setNewAlert({ ...newAlert, bodyErrorValues: [...newAlert.bodyErrorValues, bodyErrorValueInput] })
                                    setBodyErrorValueInput('')
                                  }
                                }}
                                className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 text-xs"
                              >+</button>
                            </div>
                          </div>
                        </div>

                        {/* Header Error Detection */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-gray-400 text-sm">Header Error Field</label>
                            <input
                              type="text"
                              value={newAlert.headerErrorField}
                              onChange={(e) => setNewAlert({ ...newAlert, headerErrorField: e.target.value })}
                              placeholder="X-Error-Code"
                              className="w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Header Error Values</label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {newAlert.headerErrorValues.map((val, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-pink-900 text-pink-300 rounded text-xs flex items-center gap-1">
                                  {val}
                                  <button
                                    onClick={() => setNewAlert({
                                      ...newAlert,
                                      headerErrorValues: newAlert.headerErrorValues.filter((_, i) => i !== idx)
                                    })}
                                    className="text-pink-400 hover:text-red-400"
                                  >×</button>
                                </span>
                              ))}
                            </div>
                            <div className="flex gap-2 mt-1">
                              <input
                                type="text"
                                value={headerErrorValueInput}
                                onChange={(e) => setHeaderErrorValueInput(e.target.value)}
                                placeholder="ERROR"
                                className="flex-1 px-2 py-1 bg-gray-800 text-white rounded border border-gray-700 text-xs"
                              />
                              <button
                                onClick={() => {
                                  if (headerErrorValueInput && !newAlert.headerErrorValues.includes(headerErrorValueInput)) {
                                    setNewAlert({ ...newAlert, headerErrorValues: [...newAlert.headerErrorValues, headerErrorValueInput] })
                                    setHeaderErrorValueInput('')
                                  }
                                }}
                                className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 text-xs"
                              >+</button>
                            </div>
                          </div>
                        </div>

                        {/* Notification Channels */}
                        <div className="space-y-2">
                          <label className="text-gray-400 text-sm">Notification Channels</label>
                          <div className="flex flex-wrap gap-4">
                            <label className="flex items-center gap-2 text-white text-sm">
                              <input
                                type="checkbox"
                                checked={newAlert.notifyEmail}
                                onChange={(e) => setNewAlert({ ...newAlert, notifyEmail: e.target.checked })}
                                className="rounded bg-gray-800 border-gray-700"
                              />
                              📧 Email
                            </label>
                            <label className="flex items-center gap-2 text-white text-sm">
                              <input
                                type="checkbox"
                                checked={newAlert.notifyPush}
                                onChange={(e) => setNewAlert({ ...newAlert, notifyPush: e.target.checked })}
                                className="rounded bg-gray-800 border-gray-700"
                              />
                              🔔 Push
                            </label>
                            <label className="flex items-center gap-2 text-white text-sm">
                              <input
                                type="checkbox"
                                checked={newAlert.notifySms}
                                onChange={(e) => setNewAlert({ ...newAlert, notifySms: e.target.checked })}
                                className="rounded bg-gray-800 border-gray-700"
                              />
                              📱 SMS
                            </label>
                            <label className="flex items-center gap-2 text-white text-sm">
                              <input
                                type="checkbox"
                                checked={newAlert.notifyWebhook}
                                onChange={(e) => setNewAlert({ ...newAlert, notifyWebhook: e.target.checked })}
                                className="rounded bg-gray-800 border-gray-700"
                              />
                              🔗 Webhook
                            </label>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                          <button
                            onClick={handleCreateAlert}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 text-sm"
                          >
                            Create Alert
                          </button>
                          <button
                            onClick={() => setShowAddAlert(false)}
                            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Alert List */}
                  {alerts.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No alert rules configured yet</p>
                  ) : (
                    <div className="space-y-3">
                      {alerts.map((alert) => (
                        <div key={alert.id} className="bg-gray-900 rounded-lg p-4">
                          {editingAlert?.id === alert.id ? (
                            /* Edit Mode */
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-gray-400 text-sm">Alert Title *</label>
                                  <input
                                    type="text"
                                    value={editingAlert.title}
                                    onChange={(e) => setEditingAlert({ ...editingAlert, title: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-gray-400 text-sm">Description</label>
                                  <input
                                    type="text"
                                    value={editingAlert.description || ''}
                                    onChange={(e) => setEditingAlert({ ...editingAlert, description: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 text-sm"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-gray-400 text-sm">Endpoint</label>
                                  <input
                                    type="text"
                                    value={editingAlert.endpoint || ''}
                                    onChange={(e) => setEditingAlert({ ...editingAlert, endpoint: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-gray-400 text-sm">Method</label>
                                  <select
                                    value={editingAlert.method || ''}
                                    onChange={(e) => setEditingAlert({ ...editingAlert, method: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 text-sm"
                                  >
                                    <option value="">All Methods</option>
                                    <option value="GET">GET</option>
                                    <option value="POST">POST</option>
                                    <option value="PUT">PUT</option>
                                    <option value="DELETE">DELETE</option>
                                    <option value="PATCH">PATCH</option>
                                  </select>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => editingAlert && handleUpdateAlert(editingAlert)}
                                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 text-sm"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingAlert(null)}
                                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* View Mode */
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="text-white font-medium">{alert.title}</h4>
                                  {alert.description && (
                                    <p className="text-gray-400 text-sm mt-1">{alert.description}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={alert.isEnabled}
                                      onChange={() => handleUpdateAlert(alert, false)}
                                      className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                  </label>
                                  <button
                                    onClick={() => setEditingAlert(alert)}
                                    className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAlert(alert.id)}
                                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500 text-sm"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">Endpoint:</span>
                                  <p className="text-white">{alert.endpoint || 'All endpoints'}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Method:</span>
                                  <p className="text-white">{alert.method || 'All methods'}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Monitored Errors:</span>
                                  <p className="text-white">{alert._count.monitoredErrors}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Status:</span>
                                  <span className={`ml-2 px-2 py-0.5 rounded text-xs ${alert.isEnabled ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'
                                    }`}>
                                    {alert.isEnabled ? 'Enabled' : 'Disabled'}
                                  </span>
                                </div>
                              </div>
                              {alert.monitorStandardErrors && alert.standardErrorCodes.length > 0 && (
                                <div>
                                  <span className="text-gray-500 text-sm">Standard Error Codes:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {alert.standardErrorCodes.map((code) => (
                                      <span key={code} className={`px-2 py-0.5 rounded text-xs ${code >= 500 ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'
                                        }`}>
                                        {code}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {alert.customStatusCodes.length > 0 && (
                                <div>
                                  <span className="text-gray-500 text-sm">Custom Status Codes:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {alert.customStatusCodes.map((code) => (
                                      <span key={code} className="px-2 py-0.5 bg-purple-900 text-purple-300 rounded text-xs">
                                        {code}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <div>
                                <span className="text-gray-500 text-sm">Notifications:</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {alert.notifyEmail && <span className="px-2 py-0.5 bg-blue-900 text-blue-300 rounded text-xs">📧 Email</span>}
                                  {alert.notifyPush && <span className="px-2 py-0.5 bg-green-900 text-green-300 rounded text-xs">🔔 Push</span>}
                                  {alert.notifySms && <span className="px-2 py-0.5 bg-yellow-900 text-yellow-300 rounded text-xs">📱 SMS</span>}
                                  {alert.notifyWebhook && <span className="px-2 py-0.5 bg-purple-900 text-purple-300 rounded text-xs">🔗 Webhook</span>}
                                  {!alert.notifyEmail && !alert.notifyPush && !alert.notifySms && !alert.notifyWebhook && (
                                    <span className="text-gray-500 text-xs">No notifications configured</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Settings Horizontal Menu */}
              <div className="border-b border-gray-800">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setSettingsTab('notifications')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${settingsTab === 'notifications'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-white'
                      }`}
                  >
                    Notifications
                  </button>
                  <button
                    onClick={() => setSettingsTab('features')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${settingsTab === 'features'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-white'
                      }`}
                  >
                    Product Features
                  </button>
                  <button
                    onClick={() => setSettingsTab('sdk')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${settingsTab === 'sdk'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-white'
                      }`}
                  >
                    SDK Settings
                  </button>
                  <button
                    onClick={() => setSettingsTab('cleanup')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${settingsTab === 'cleanup'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-white'
                      }`}
                  >
                    Data Cleanup
                  </button>
                  <button
                    onClick={() => setSettingsTab('project')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${settingsTab === 'project'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-white'
                      }`}
                  >
                    Project Settings
                  </button>
                </nav>
              </div>

              {/* Notifications Settings */}
              {settingsTab === 'notifications' && notificationSettings && (
                <div className="space-y-6">
                  {/* Email Settings */}
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📧</span>
                        <div>
                          <h3 className="text-white font-medium">Email Notifications</h3>
                          <p className="text-gray-400 text-sm">Receive alerts via email</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.emailEnabled}
                          onChange={(e) => handleSaveNotificationSettings({ emailEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    {notificationSettings.emailEnabled && (
                      <div className="mt-4">
                        <label className="text-gray-400 text-sm">Email Addresses</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {notificationSettings.emailAddresses.map((email, idx) => (
                            <span key={idx} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm flex items-center gap-2">
                              {email}
                              <button
                                onClick={() => handleSaveNotificationSettings({
                                  emailAddresses: notificationSettings.emailAddresses.filter((_, i) => i !== idx)
                                })}
                                className="text-gray-500 hover:text-red-400"
                              >×</button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <input
                            type="email"
                            value={newEmailAddress}
                            onChange={(e) => setNewEmailAddress(e.target.value)}
                            placeholder="Add email address"
                            className="flex-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 text-sm"
                          />
                          <button
                            onClick={() => {
                              if (newEmailAddress && !notificationSettings.emailAddresses.includes(newEmailAddress)) {
                                handleSaveNotificationSettings({
                                  emailAddresses: [...notificationSettings.emailAddresses, newEmailAddress]
                                })
                                setNewEmailAddress('')
                              }
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 text-sm"
                          >Add</button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Push Settings */}
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🔔</span>
                        <div>
                          <h3 className="text-white font-medium">Push Notifications</h3>
                          <p className="text-gray-400 text-sm">Receive real-time push alerts</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.pushEnabled}
                          onChange={(e) => handleSaveNotificationSettings({ pushEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* SMS Settings */}
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📱</span>
                        <div>
                          <h3 className="text-white font-medium">SMS Notifications</h3>
                          <p className="text-gray-400 text-sm">Receive alerts via SMS</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.smsEnabled}
                          onChange={(e) => handleSaveNotificationSettings({ smsEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    {notificationSettings.smsEnabled && (
                      <div className="mt-4">
                        <label className="text-gray-400 text-sm">Phone Numbers</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {notificationSettings.smsNumbers.map((num, idx) => (
                            <span key={idx} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm flex items-center gap-2">
                              {num}
                              <button
                                onClick={() => handleSaveNotificationSettings({
                                  smsNumbers: notificationSettings.smsNumbers.filter((_, i) => i !== idx)
                                })}
                                className="text-gray-500 hover:text-red-400"
                              >×</button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <input
                            type="tel"
                            value={newSmsNumber}
                            onChange={(e) => setNewSmsNumber(e.target.value)}
                            placeholder="+1234567890"
                            className="flex-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 text-sm"
                          />
                          <button
                            onClick={() => {
                              if (newSmsNumber && !notificationSettings.smsNumbers.includes(newSmsNumber)) {
                                handleSaveNotificationSettings({
                                  smsNumbers: [...notificationSettings.smsNumbers, newSmsNumber]
                                })
                                setNewSmsNumber('')
                              }
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 text-sm"
                          >Add</button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Webhook Settings */}
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🔗</span>
                        <div>
                          <h3 className="text-white font-medium">Webhook</h3>
                          <p className="text-gray-400 text-sm">Send alerts to your webhook endpoint</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.webhookEnabled}
                          onChange={(e) => handleSaveNotificationSettings({ webhookEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    {notificationSettings.webhookEnabled && (
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="text-gray-400 text-sm">Webhook URL</label>
                          <input
                            type="url"
                            value={notificationSettings.webhookUrl || ''}
                            onChange={(e) => handleSaveNotificationSettings({ webhookUrl: e.target.value })}
                            placeholder="https://your-webhook.com/endpoint"
                            className="w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">Secret (for signature verification)</label>
                          <input
                            type="password"
                            value={notificationSettings.webhookSecret || ''}
                            onChange={(e) => handleSaveNotificationSettings({ webhookSecret: e.target.value })}
                            placeholder="Optional webhook secret"
                            className="w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Product Features */}
              {settingsTab === 'features' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-white font-medium">Alert Rules</h3>
                    <button
                      onClick={() => setShowAddAlert(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 text-sm"
                    >
                      + Add Alert Rule
                    </button>
                  </div>

                  {/* Add Alert Form */}
                  {showAddAlert && (
                    <div className="bg-gray-900 rounded-lg p-4 border border-blue-500">
                      <h4 className="text-white font-medium mb-4">New Alert Rule</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-gray-400 text-sm">Alert Title *</label>
                            <input
                              type="text"
                              value={newAlert.title}
                              onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                              placeholder="e.g., Server Error Alert"
                              className="w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Description</label>
                            <input
                              type="text"
                              value={newAlert.description}
                              onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                              placeholder="Optional description"
                              className="w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 text-sm"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-gray-400 text-sm">Endpoint (optional, leave empty for all)</label>
                            <input
                              type="text"
                              value={newAlert.endpoint}
                              onChange={(e) => setNewAlert({ ...newAlert, endpoint: e.target.value })}
                              placeholder="/api/users/*"
                              className="w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Method (optional)</label>
                            <select
                              value={newAlert.method}
                              onChange={(e) => setNewAlert({ ...newAlert, method: e.target.value })}
                              className="w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 text-sm"
                            >
                              <option value="">All Methods</option>
                              <option value="GET">GET</option>
                              <option value="POST">POST</option>
                              <option value="PUT">PUT</option>
                              <option value="DELETE">DELETE</option>
                              <option value="PATCH">PATCH</option>
                            </select>
                          </div>
                        </div>

                        {/* Error Code Selection */}
                        <div className="space-y-2">
                          <label className="text-gray-400 text-sm">Monitor Standard Error Codes</label>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-white text-sm">
                              <input
                                type="checkbox"
                                checked={newAlert.monitorStandardErrors}
                                onChange={(e) => setNewAlert({ ...newAlert, monitorStandardErrors: e.target.checked })}
                                className="rounded bg-gray-800 border-gray-700"
                              />
                              Enable Standard Error Monitoring
                            </label>
                          </div>
                          {newAlert.monitorStandardErrors && (
                            <div className="mt-2 space-y-2">
                              <p className="text-gray-500 text-xs">Select error codes to monitor:</p>
                              <div className="flex flex-wrap gap-2">
                                <span className="text-gray-400 text-xs">Client (4xx):</span>
                                {standardErrorCodes.client.map((code) => (
                                  <label key={code} className="flex items-center gap-1 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={newAlert.standardErrorCodes.includes(code)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setNewAlert({ ...newAlert, standardErrorCodes: [...newAlert.standardErrorCodes, code] })
                                        } else {
                                          setNewAlert({ ...newAlert, standardErrorCodes: newAlert.standardErrorCodes.filter(c => c !== code) })
                                        }
                                      }}
                                      className="rounded bg-gray-800 border-gray-700"
                                    />
                                    <span className="text-yellow-400">{code}</span>
                                  </label>
                                ))}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <span className="text-gray-400 text-xs">Server (5xx):</span>
                                {standardErrorCodes.server.map((code) => (
                                  <label key={code} className="flex items-center gap-1 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={newAlert.standardErrorCodes.includes(code)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setNewAlert({ ...newAlert, standardErrorCodes: [...newAlert.standardErrorCodes, code] })
                                        } else {
                                          setNewAlert({ ...newAlert, standardErrorCodes: newAlert.standardErrorCodes.filter(c => c !== code) })
                                        }
                                      }}
                                      className="rounded bg-gray-800 border-gray-700"
                                    />
                                    <span className="text-red-400">{code}</span>
                                  </label>
                                ))}
                              </div>
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => setNewAlert({
                                    ...newAlert,
                                    standardErrorCodes: [...standardErrorCodes.client, ...standardErrorCodes.server]
                                  })}
                                  className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600"
                                >Select All</button>
                                <button
                                  onClick={() => setNewAlert({ ...newAlert, standardErrorCodes: [] })}
                                  className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600"
                                >Clear All</button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Custom Error Codes */}
                        <div className="space-y-2">
                          <label className="text-gray-400 text-sm">Custom Status Codes</label>
                          <div className="flex flex-wrap gap-2">
                            {newAlert.customStatusCodes.map((code, idx) => (
                              <span key={idx} className="px-2 py-1 bg-purple-900 text-purple-300 rounded text-sm flex items-center gap-1">
                                {code}
                                <button
                                  onClick={() => setNewAlert({
                                    ...newAlert,
                                    customStatusCodes: newAlert.customStatusCodes.filter((_, i) => i !== idx)
                                  })}
                                  className="text-purple-400 hover:text-red-400"
                                >×</button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={customCodeInput}
                              onChange={(e) => setCustomCodeInput(e.target.value)}
                              placeholder="e.g., 418"
                              className="w-24 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 text-sm"
                            />
                            <button
                              onClick={() => {
                                const code = parseInt(customCodeInput)
                                if (code && !newAlert.customStatusCodes.includes(code)) {
                                  setNewAlert({ ...newAlert, customStatusCodes: [...newAlert.customStatusCodes, code] })
                                  setCustomCodeInput('')
                                }
                              }}
                              className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm"
                            >Add</button>
                          </div>
                        </div>

                        {/* Body Error Detection */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-gray-400 text-sm">Body Error Field (JSON path)</label>
                            <input
                              type="text"
                              value={newAlert.bodyErrorField}
                              onChange={(e) => setNewAlert({ ...newAlert, bodyErrorField: e.target.value })}
                              placeholder="error.code or status"
                              className="w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Body Error Values</label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {newAlert.bodyErrorValues.map((val, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-orange-900 text-orange-300 rounded text-xs flex items-center gap-1">
                                  {val}
                                  <button
                                    onClick={() => setNewAlert({
                                      ...newAlert,
                                      bodyErrorValues: newAlert.bodyErrorValues.filter((_, i) => i !== idx)
                                    })}
                                    className="text-orange-400 hover:text-red-400"
                                  >×</button>
                                </span>
                              ))}
                            </div>
                            <div className="flex gap-2 mt-1">
                              <input
                                type="text"
                                value={bodyErrorValueInput}
                                onChange={(e) => setBodyErrorValueInput(e.target.value)}
                                placeholder="ERROR_CODE"
                                className="flex-1 px-2 py-1 bg-gray-800 text-white rounded border border-gray-700 text-xs"
                              />
                              <button
                                onClick={() => {
                                  if (bodyErrorValueInput && !newAlert.bodyErrorValues.includes(bodyErrorValueInput)) {
                                    setNewAlert({ ...newAlert, bodyErrorValues: [...newAlert.bodyErrorValues, bodyErrorValueInput] })
                                    setBodyErrorValueInput('')
                                  }
                                }}
                                className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 text-xs"
                              >+</button>
                            </div>
                          </div>
                        </div>

                        {/* Header Error Detection */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-gray-400 text-sm">Header Error Field</label>
                            <input
                              type="text"
                              value={newAlert.headerErrorField}
                              onChange={(e) => setNewAlert({ ...newAlert, headerErrorField: e.target.value })}
                              placeholder="X-Error-Code"
                              className="w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Header Error Values</label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {newAlert.headerErrorValues.map((val, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-pink-900 text-pink-300 rounded text-xs flex items-center gap-1">
                                  {val}
                                  <button
                                    onClick={() => setNewAlert({
                                      ...newAlert,
                                      headerErrorValues: newAlert.headerErrorValues.filter((_, i) => i !== idx)
                                    })}
                                    className="text-pink-400 hover:text-red-400"
                                  >×</button>
                                </span>
                              ))}
                            </div>
                            <div className="flex gap-2 mt-1">
                              <input
                                type="text"
                                value={headerErrorValueInput}
                                onChange={(e) => setHeaderErrorValueInput(e.target.value)}
                                placeholder="ERROR"
                                className="flex-1 px-2 py-1 bg-gray-800 text-white rounded border border-gray-700 text-xs"
                              />
                              <button
                                onClick={() => {
                                  if (headerErrorValueInput && !newAlert.headerErrorValues.includes(headerErrorValueInput)) {
                                    setNewAlert({ ...newAlert, headerErrorValues: [...newAlert.headerErrorValues, headerErrorValueInput] })
                                    setHeaderErrorValueInput('')
                                  }
                                }}
                                className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 text-xs"
                              >+</button>
                            </div>
                          </div>
                        </div>

                        {/* Notification Channels */}
                        <div className="space-y-2">
                          <label className="text-gray-400 text-sm">Notification Channels</label>
                          <div className="flex flex-wrap gap-4">
                            <label className="flex items-center gap-2 text-white text-sm">
                              <input
                                type="checkbox"
                                checked={newAlert.notifyEmail}
                                onChange={(e) => setNewAlert({ ...newAlert, notifyEmail: e.target.checked })}
                                className="rounded bg-gray-800 border-gray-700"
                              />
                              📧 Email
                            </label>
                            <label className="flex items-center gap-2 text-white text-sm">
                              <input
                                type="checkbox"
                                checked={newAlert.notifyPush}
                                onChange={(e) => setNewAlert({ ...newAlert, notifyPush: e.target.checked })}
                                className="rounded bg-gray-800 border-gray-700"
                              />
                              🔔 Push
                            </label>
                            <label className="flex items-center gap-2 text-white text-sm">
                              <input
                                type="checkbox"
                                checked={newAlert.notifySms}
                                onChange={(e) => setNewAlert({ ...newAlert, notifySms: e.target.checked })}
                                className="rounded bg-gray-800 border-gray-700"
                              />
                              📱 SMS
                            </label>
                            <label className="flex items-center gap-2 text-white text-sm">
                              <input
                                type="checkbox"
                                checked={newAlert.notifyWebhook}
                                onChange={(e) => setNewAlert({ ...newAlert, notifyWebhook: e.target.checked })}
                                className="rounded bg-gray-800 border-gray-700"
                              />
                              🔗 Webhook
                            </label>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                          <button
                            onClick={handleCreateAlert}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 text-sm"
                          >
                            Create Alert
                          </button>
                          <button
                            onClick={() => setShowAddAlert(false)}
                            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Alert List */}
                  {alerts.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No alert rules configured yet</p>
                  ) : (
                    <div className="space-y-3">
                      {alerts.map((alert) => (
                        <div key={alert.id} className="bg-gray-900 rounded-lg p-4">
                          {editingAlert?.id === alert.id ? (
                            /* Edit Mode */
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-gray-400 text-xs mb-1">Title</label>
                                  <input
                                    type="text"
                                    value={editingAlert.title}
                                    onChange={(e) => setEditingAlert({ ...editingAlert, title: e.target.value })}
                                    className="w-full bg-gray-800 text-white text-sm rounded px-3 py-2 border border-gray-700"
                                  />
                                </div>
                                <div>
                                  <label className="block text-gray-400 text-xs mb-1">Description</label>
                                  <input
                                    type="text"
                                    value={editingAlert.description || ''}
                                    onChange={(e) => setEditingAlert({ ...editingAlert, description: e.target.value || null })}
                                    className="w-full bg-gray-800 text-white text-sm rounded px-3 py-2 border border-gray-700"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-gray-400 text-xs mb-1">Endpoint (optional)</label>
                                  <input
                                    type="text"
                                    placeholder="/api/users/*"
                                    value={editingAlert.endpoint || ''}
                                    onChange={(e) => setEditingAlert({ ...editingAlert, endpoint: e.target.value || null })}
                                    className="w-full bg-gray-800 text-white text-sm rounded px-3 py-2 border border-gray-700"
                                  />
                                </div>
                                <div>
                                  <label className="block text-gray-400 text-xs mb-1">Method</label>
                                  <select
                                    value={editingAlert.method || ''}
                                    onChange={(e) => setEditingAlert({ ...editingAlert, method: e.target.value || null })}
                                    className="w-full bg-gray-800 text-white text-sm rounded px-3 py-2 border border-gray-700"
                                  >
                                    <option value="">All Methods</option>
                                    <option value="GET">GET</option>
                                    <option value="POST">POST</option>
                                    <option value="PUT">PUT</option>
                                    <option value="DELETE">DELETE</option>
                                    <option value="PATCH">PATCH</option>
                                  </select>
                                </div>
                              </div>

                              {/* Standard Error Codes */}
                              <div>
                                <label className="block text-gray-400 text-xs mb-2">Standard Error Codes</label>
                                <div className="flex flex-wrap gap-2">
                                  {[400, 401, 403, 404, 405, 408, 409, 422, 429, 500, 501, 502, 503, 504].map((code) => (
                                    <button
                                      key={code}
                                      type="button"
                                      onClick={() => {
                                        const codes = editingAlert.standardErrorCodes.includes(code)
                                          ? editingAlert.standardErrorCodes.filter(c => c !== code)
                                          : [...editingAlert.standardErrorCodes, code]
                                        setEditingAlert({ ...editingAlert, standardErrorCodes: codes })
                                      }}
                                      className={`px-2 py-1 text-xs rounded ${editingAlert.standardErrorCodes.includes(code)
                                          ? code >= 500 ? 'bg-red-600 text-white' : 'bg-orange-600 text-white'
                                          : 'bg-gray-700 text-gray-400'
                                        }`}
                                    >
                                      {code}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Custom Status Codes */}
                              <div>
                                <label className="block text-gray-400 text-xs mb-1">Custom Status Codes (comma-separated)</label>
                                <input
                                  type="text"
                                  placeholder="418, 451, 599"
                                  value={editingAlert.customStatusCodes.join(', ')}
                                  onChange={(e) => {
                                    const codes = e.target.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
                                    setEditingAlert({ ...editingAlert, customStatusCodes: codes })
                                  }}
                                  className="w-full bg-gray-800 text-white text-sm rounded px-3 py-2 border border-gray-700"
                                />
                              </div>

                              {/* Body Error Detection */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-gray-400 text-xs mb-1">Body Error Field (JSON path)</label>
                                  <input
                                    type="text"
                                    placeholder="error.code"
                                    value={editingAlert.bodyErrorField || ''}
                                    onChange={(e) => setEditingAlert({ ...editingAlert, bodyErrorField: e.target.value || null })}
                                    className="w-full bg-gray-800 text-white text-sm rounded px-3 py-2 border border-gray-700"
                                  />
                                </div>
                                <div>
                                  <label className="block text-gray-400 text-xs mb-1">Body Error Values (comma-separated)</label>
                                  <input
                                    type="text"
                                    placeholder="INVALID_TOKEN, EXPIRED"
                                    value={editingAlert.bodyErrorValues.join(', ')}
                                    onChange={(e) => {
                                      const values = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                      setEditingAlert({ ...editingAlert, bodyErrorValues: values })
                                    }}
                                    className="w-full bg-gray-800 text-white text-sm rounded px-3 py-2 border border-gray-700"
                                  />
                                </div>
                              </div>

                              {/* Notification Channels */}
                              <div>
                                <label className="block text-gray-400 text-xs mb-2">Notify Via</label>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={editingAlert.notifyEmail}
                                      onChange={(e) => setEditingAlert({ ...editingAlert, notifyEmail: e.target.checked })}
                                      className="rounded bg-gray-700 border-gray-600"
                                    />
                                    <span className="text-gray-300">Email</span>
                                  </label>
                                  <label className="flex items-center gap-2 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={editingAlert.notifyPush}
                                      onChange={(e) => setEditingAlert({ ...editingAlert, notifyPush: e.target.checked })}
                                      className="rounded bg-gray-700 border-gray-600"
                                    />
                                    <span className="text-gray-300">Push</span>
                                  </label>
                                  <label className="flex items-center gap-2 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={editingAlert.notifySms}
                                      onChange={(e) => setEditingAlert({ ...editingAlert, notifySms: e.target.checked })}
                                      className="rounded bg-gray-700 border-gray-600"
                                    />
                                    <span className="text-gray-300">SMS</span>
                                  </label>
                                  <label className="flex items-center gap-2 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={editingAlert.notifyWebhook}
                                      onChange={(e) => setEditingAlert({ ...editingAlert, notifyWebhook: e.target.checked })}
                                      className="rounded bg-gray-700 border-gray-600"
                                    />
                                    <span className="text-gray-300">Webhook</span>
                                  </label>
                                </div>
                              </div>

                              <div className="flex gap-2 pt-2">
                                <button
                                  onClick={() => handleUpdateAlert(editingAlert, true)}
                                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 text-sm"
                                >
                                  Save Changes
                                </button>
                                <button
                                  onClick={() => setEditingAlert(null)}
                                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* View Mode */
                            <>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={alert.isEnabled}
                                      onChange={(e) => handleUpdateAlert({ ...alert, isEnabled: e.target.checked })}
                                      className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                  </label>
                                  <div>
                                    <h4 className="text-white font-medium">{alert.title}</h4>
                                    {alert.description && <p className="text-gray-400 text-sm">{alert.description}</p>}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400 text-xs">{alert._count.monitoredErrors} errors</span>
                                  <button
                                    onClick={() => setEditingAlert(alert)}
                                    className="text-gray-500 hover:text-blue-400 text-sm"
                                  >Edit</button>
                                  <button
                                    onClick={() => handleDeleteAlert(alert.id)}
                                    className="text-gray-500 hover:text-red-400 text-sm"
                                  >Delete</button>
                                </div>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                {alert.endpoint && (
                                  <span className="px-2 py-1 bg-gray-800 text-gray-400 rounded">
                                    {alert.method || '*'} {alert.endpoint}
                                  </span>
                                )}
                                {alert.standardErrorCodes.length > 0 && (
                                  <span className="px-2 py-1 bg-gray-800 text-gray-400 rounded">
                                    Status: {alert.standardErrorCodes.join(', ')}
                                  </span>
                                )}
                                {alert.customStatusCodes.length > 0 && (
                                  <span className="px-2 py-1 bg-purple-900 text-purple-300 rounded">
                                    Custom: {alert.customStatusCodes.join(', ')}
                                  </span>
                                )}
                                {alert.bodyErrorField && (
                                  <span className="px-2 py-1 bg-orange-900 text-orange-300 rounded">
                                    Body: {alert.bodyErrorField}
                                  </span>
                                )}
                                {alert.headerErrorField && (
                                  <span className="px-2 py-1 bg-pink-900 text-pink-300 rounded">
                                    Header: {alert.headerErrorField}
                                  </span>
                                )}
                                <span className="px-2 py-1 bg-gray-800 text-gray-400 rounded">
                                  {[
                                    alert.notifyEmail && 'Email',
                                    alert.notifyPush && 'Push',
                                    alert.notifySms && 'SMS',
                                    alert.notifyWebhook && 'Webhook'
                                  ].filter(Boolean).join(', ') || 'No notifications'}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Product Features */}
              {settingsTab === 'features' && (
                <div className="space-y-6">
                  {/* Subscription Status Warning */}
                  {subscriptionStatus && (!subscriptionStatus.enabled || !subscriptionStatus.trialActive || subscriptionStatus.status !== 'active') && (
                    <div className="bg-red-900/20 border-l-4 border-red-600 p-4 rounded">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div className="flex-1">
                          <h3 className="text-red-400 font-semibold mb-1">
                            {!subscriptionStatus.enabled
                              ? 'Subscription Disabled'
                              : subscriptionStatus.status !== 'active'
                                ? `Subscription ${subscriptionStatus.status.charAt(0).toUpperCase() + subscriptionStatus.status.slice(1)}`
                                : 'Trial Expired'}
                          </h3>
                          <p className="text-gray-300 text-sm mb-3">
                            {!subscriptionStatus.enabled
                              ? 'Your subscription has been disabled by an administrator. SDK features are disabled and no new data will be collected. Please contact support.'
                              : subscriptionStatus.status !== 'active'
                                ? `Your subscription is ${subscriptionStatus.status}. SDK features are disabled and no new data will be collected.`
                                : 'Your free trial has ended. Features are disabled and no new data will be collected. Upgrade your subscription to re-enable all features.'}
                          </p>
                          <Link
                            href="/subscription"
                            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                          >
                            View Subscription
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">⚙️</span>
                      <div>
                        <h3 className="text-white font-medium">SDK Feature Flags</h3>
                        <p className="text-gray-400 text-sm">Control which features are enabled in the SDK. Changes take effect on next app launch.</p>
                        {subscriptionStatus && (!subscriptionStatus.enabled || !subscriptionStatus.trialActive || subscriptionStatus.status !== 'active') && (
                          <p className="text-red-400 text-sm mt-1">
                            ⚠️ Features are disabled {!subscriptionStatus.enabled ? 'due to subscription being disabled by admin' : subscriptionStatus.status !== 'active' ? `due to subscription being ${subscriptionStatus.status}` : 'due to expired trial subscription'}.
                          </p>
                        )}
                      </div>
                    </div>

                    {featureFlagsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <svg className="animate-spin h-6 w-6 text-gray-400" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="ml-2 text-gray-400">Loading feature flags...</span>
                      </div>
                    ) : featureFlags ? (
                      <div className="space-y-6">
                        {/* Master Kill Switch */}
                        <div className={`p-4 rounded-lg border-2 ${featureFlags.sdkEnabled ? 'bg-green-900/20 border-green-600' : 'bg-red-900/20 border-red-600'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{featureFlags.sdkEnabled ? '🟢' : '🔴'}</span>
                              <div>
                                <p className="text-white font-medium">SDK Enabled (Master Switch)</p>
                                <p className={`text-sm ${featureFlags.sdkEnabled ? 'text-green-400' : 'text-red-400'}`}>
                                  {featureFlags.sdkEnabled
                                    ? 'SDK is active - all enabled features will work'
                                    : 'SDK is disabled - ALL functionality is turned off'}
                                </p>
                              </div>
                            </div>
                            <label className={`relative inline-flex items-center ${subscriptionStatus && (!subscriptionStatus.enabled || !subscriptionStatus.trialActive || subscriptionStatus.status !== 'active') ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                              <input
                                type="checkbox"
                                checked={featureFlags.sdkEnabled}
                                onChange={(e) => updateFeatureFlag('sdkEnabled', e.target.checked)}
                                disabled={!!(subscriptionStatus && (!subscriptionStatus.enabled || !subscriptionStatus.trialActive || subscriptionStatus.status !== 'active'))}
                                className="sr-only peer"
                              />
                              <div className={`w-14 h-7 ${featureFlags.sdkEnabled ? 'bg-green-600' : 'bg-red-600'} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all`}></div>
                            </label>
                          </div>
                          {!featureFlags.sdkEnabled && (
                            <p className="mt-3 text-sm text-red-300 bg-red-900/30 p-2 rounded">
                              Warning: When SDK is disabled, no data will be collected from mobile apps. API tracing, logging, screen tracking, and all other features will be completely inactive.
                            </p>
                          )}
                        </div>

                        {/* Core Features */}
                        <div className={featureFlags.sdkEnabled && (!subscriptionStatus || (subscriptionStatus.enabled && subscriptionStatus.trialActive && subscriptionStatus.status === 'active')) ? '' : 'opacity-50 pointer-events-none'}>
                          <h4 className="text-gray-400 text-sm font-medium mb-3">
                            Core Features
                            {!featureFlags.sdkEnabled && <span className="text-red-400"> (SDK Disabled)</span>}
                            {subscriptionStatus && (!subscriptionStatus.enabled || !subscriptionStatus.trialActive || subscriptionStatus.status !== 'active') && (
                              <span className="text-red-400">
                                {' '}({!subscriptionStatus.enabled ? 'Subscription Disabled' : subscriptionStatus.status !== 'active' ? `Subscription ${subscriptionStatus.status}` : 'Trial Expired'})
                              </span>
                            )}
                          </h4>
                          <div className={`space-y-3 ${subscriptionStatus && (!subscriptionStatus.enabled || !subscriptionStatus.trialActive || subscriptionStatus.status !== 'active') ? 'pointer-events-none opacity-50' : ''}`}>
                            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="text-lg">📡</span>
                                <div>
                                  <p className="text-white text-sm font-medium">API Tracking</p>
                                  <p className="text-gray-500 text-xs">Track HTTP requests and responses</p>
                                </div>
                              </div>
                              <label className={`relative inline-flex items-center ${subscriptionStatus && (!subscriptionStatus.enabled || !subscriptionStatus.trialActive || subscriptionStatus.status !== 'active') ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                                <input
                                  type="checkbox"
                                  checked={featureFlags.apiTracking}
                                  onChange={(e) => updateFeatureFlag('apiTracking', e.target.checked)}
                                  disabled={!!(subscriptionStatus && (!subscriptionStatus.enabled || !subscriptionStatus.trialActive || subscriptionStatus.status !== 'active'))}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="text-lg">📱</span>
                                <div>
                                  <p className="text-white text-sm font-medium">Screen Tracking</p>
                                  <p className="text-gray-500 text-xs">Track screen views and navigation flow</p>
                                </div>
                              </div>
                              <label className={`relative inline-flex items-center ${subscriptionStatus && (!subscriptionStatus.enabled || !subscriptionStatus.trialActive || subscriptionStatus.status !== 'active') ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                                <input
                                  type="checkbox"
                                  checked={featureFlags.screenTracking}
                                  onChange={(e) => updateFeatureFlag('screenTracking', e.target.checked)}
                                  disabled={!!(subscriptionStatus && (!subscriptionStatus.enabled || !subscriptionStatus.trialActive || subscriptionStatus.status !== 'active'))}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="text-lg">💥</span>
                                <div>
                                  <p className="text-white text-sm font-medium">Crash Reporting</p>
                                  <p className="text-gray-500 text-xs">Capture and report app crashes</p>
                                </div>
                              </div>
                              <label className={`relative inline-flex items-center ${subscriptionStatus && (!subscriptionStatus.enabled || !subscriptionStatus.trialActive || subscriptionStatus.status !== 'active') ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                                <input
                                  type="checkbox"
                                  checked={featureFlags.crashReporting}
                                  onChange={(e) => updateFeatureFlag('crashReporting', e.target.checked)}
                                  disabled={!!(subscriptionStatus && (!subscriptionStatus.enabled || !subscriptionStatus.trialActive || subscriptionStatus.status !== 'active'))}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="text-lg">📝</span>
                                <div>
                                  <p className="text-white text-sm font-medium">Logging</p>
                                  <p className="text-gray-500 text-xs">Send app logs to dashboard</p>
                                </div>
                              </div>
                              <label className={`relative inline-flex items-center ${subscriptionStatus && (!subscriptionStatus.enabled || !subscriptionStatus.trialActive || subscriptionStatus.status !== 'active') ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                                <input
                                  type="checkbox"
                                  checked={featureFlags.logging}
                                  onChange={(e) => updateFeatureFlag('logging', e.target.checked)}
                                  disabled={!!(subscriptionStatus && (!subscriptionStatus.enabled || !subscriptionStatus.trialActive || subscriptionStatus.status !== 'active'))}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Additional Features */}
                        <div className={featureFlags.sdkEnabled && (!subscriptionStatus || (subscriptionStatus.enabled && subscriptionStatus.trialActive && subscriptionStatus.status === 'active')) ? '' : 'opacity-50 pointer-events-none'}>
                          <h4 className="text-gray-400 text-sm font-medium mb-3">
                            Additional Features
                            {!featureFlags.sdkEnabled && <span className="text-red-400">(SDK Disabled)</span>}
                            {subscriptionStatus && (!subscriptionStatus.enabled || !subscriptionStatus.trialActive || subscriptionStatus.status !== 'active') && (
                              <span className="text-red-400">
                                {' '}({!subscriptionStatus.enabled ? 'Subscription Disabled' : subscriptionStatus.status !== 'active' ? `Subscription ${subscriptionStatus.status}` : 'Trial Expired'})
                              </span>
                            )}
                          </h4>
                          <div className={`space-y-3 ${subscriptionStatus && (!subscriptionStatus.enabled || !subscriptionStatus.trialActive || subscriptionStatus.status !== 'active') ? 'pointer-events-none opacity-50' : ''}`}>
                            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="text-lg">📲</span>
                                <div>
                                  <p className="text-white text-sm font-medium">Device Tracking</p>
                                  <p className="text-gray-500 text-xs">Register and track devices</p>
                                </div>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={featureFlags.deviceTracking}
                                  onChange={(e) => updateFeatureFlag('deviceTracking', e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="text-lg">🔗</span>
                                <div>
                                  <p className="text-white text-sm font-medium">Session Tracking</p>
                                  <p className="text-gray-500 text-xs">Track user sessions</p>
                                </div>
                              </div>
                              <label className={`relative inline-flex items-center ${subscriptionStatus && (!subscriptionStatus.enabled || !subscriptionStatus.trialActive || subscriptionStatus.status !== 'active') ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                                <input
                                  type="checkbox"
                                  checked={featureFlags.sessionTracking}
                                  onChange={(e) => updateFeatureFlag('sessionTracking', e.target.checked)}
                                  disabled={!!(subscriptionStatus && (!subscriptionStatus.enabled || !subscriptionStatus.trialActive || subscriptionStatus.status !== 'active'))}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="text-lg">⚡</span>
                                <div>
                                  <p className="text-white text-sm font-medium">Business Config</p>
                                  <p className="text-gray-500 text-xs">Enable remote business configuration</p>
                                </div>
                              </div>
                              <label className={`relative inline-flex items-center ${subscriptionStatus && (!subscriptionStatus.enabled || !subscriptionStatus.trialActive || subscriptionStatus.status !== 'active') ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                                <input
                                  type="checkbox"
                                  checked={featureFlags.businessConfig}
                                  onChange={(e) => updateFeatureFlag('businessConfig', e.target.checked)}
                                  disabled={!!(subscriptionStatus && (!subscriptionStatus.enabled || !subscriptionStatus.trialActive || subscriptionStatus.status !== 'active'))}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="text-lg">🌍</span>
                                <div>
                                  <p className="text-white text-sm font-medium">Localization</p>
                                  <p className="text-gray-500 text-xs">Enable remote localization strings</p>
                                </div>
                              </div>
                              <label className={`relative inline-flex items-center ${subscriptionStatus && (!subscriptionStatus.enabled || !subscriptionStatus.trialActive || subscriptionStatus.status !== 'active') ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                                <input
                                  type="checkbox"
                                  checked={featureFlags.localization}
                                  onChange={(e) => updateFeatureFlag('localization', e.target.checked)}
                                  disabled={!!(subscriptionStatus && (!subscriptionStatus.enabled || !subscriptionStatus.trialActive || subscriptionStatus.status !== 'active'))}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Performance Options */}
                        <div className={featureFlags.sdkEnabled && (!subscriptionStatus || (subscriptionStatus.enabled && subscriptionStatus.trialActive && subscriptionStatus.status === 'active')) ? '' : 'opacity-50 pointer-events-none'}>
                          <h4 className="text-gray-400 text-sm font-medium mb-3">
                            Performance Options
                            {!featureFlags.sdkEnabled && <span className="text-red-400">(SDK Disabled)</span>}
                            {subscriptionStatus && (!subscriptionStatus.enabled || !subscriptionStatus.trialActive || subscriptionStatus.status !== 'active') && (
                              <span className="text-red-400">
                                {' '}({!subscriptionStatus.enabled ? 'Subscription Disabled' : subscriptionStatus.status !== 'active' ? `Subscription ${subscriptionStatus.status}` : 'Trial Expired'})
                              </span>
                            )}
                          </h4>
                          <div className={`space-y-3 ${subscriptionStatus && (!subscriptionStatus.enabled || !subscriptionStatus.trialActive || subscriptionStatus.status !== 'active') ? 'pointer-events-none opacity-50' : ''}`}>
                            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="text-lg">📴</span>
                                <div>
                                  <p className="text-white text-sm font-medium">Offline Support</p>
                                  <p className="text-gray-500 text-xs">Queue events when offline and sync later</p>
                                </div>
                              </div>
                              <label className={`relative inline-flex items-center ${subscriptionStatus && (!subscriptionStatus.enabled || !subscriptionStatus.trialActive || subscriptionStatus.status !== 'active') ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                                <input
                                  type="checkbox"
                                  checked={featureFlags.offlineSupport}
                                  onChange={(e) => updateFeatureFlag('offlineSupport', e.target.checked)}
                                  disabled={!!(subscriptionStatus && (!subscriptionStatus.enabled || !subscriptionStatus.trialActive || subscriptionStatus.status !== 'active'))}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="text-lg">📦</span>
                                <div>
                                  <p className="text-white text-sm font-medium">Batch Events</p>
                                  <p className="text-gray-500 text-xs">Batch events before sending to reduce network calls</p>
                                </div>
                              </div>
                              <label className={`relative inline-flex items-center ${subscriptionStatus && (!subscriptionStatus.enabled || !subscriptionStatus.trialActive || subscriptionStatus.status !== 'active') ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                                <input
                                  type="checkbox"
                                  checked={featureFlags.batchEvents}
                                  onChange={(e) => updateFeatureFlag('batchEvents', e.target.checked)}
                                  disabled={!!(subscriptionStatus && (!subscriptionStatus.enabled || !subscriptionStatus.trialActive || subscriptionStatus.status !== 'active'))}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-8">Failed to load feature flags</p>
                    )}
                  </div>
                </div>
              )}

              {/* SDK Settings */}
              {settingsTab === 'sdk' && (
                <div className="space-y-6">
                  {sdkSettingsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <svg className="animate-spin h-6 w-6 text-gray-400" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="ml-2 text-gray-400">Loading SDK settings...</span>
                    </div>
                  ) : sdkSettings ? (
                    <div className="space-y-6">
                      {/* Note: Tracking Mode moved to Device Settings tab */}
                      {/* Note: Security Settings moved to API Traces Security Settings tab */}
                      
                      {/* Performance Settings */}
                      <div className="bg-gray-900 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-2xl">⚡</span>
                          <div>
                            <h3 className="text-white font-medium">Performance Settings</h3>
                            <p className="text-gray-400 text-sm">Configure batching and queue behavior</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">📦</span>
                              <div>
                                <p className="text-white text-sm font-medium">Enable Batching</p>
                                <p className="text-gray-500 text-xs">Batch events before sending to reduce network calls</p>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={sdkSettings.enableBatching}
                                onChange={(e) => updateSdkSetting({ enableBatching: e.target.checked })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>

                          <div className="p-3 bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-lg">📝</span>
                              <div>
                                <p className="text-white text-sm font-medium">Max Log Queue Size</p>
                                <p className="text-gray-500 text-xs">Maximum logs to queue before flushing</p>
                              </div>
                            </div>
                            <input
                              type="number"
                              value={sdkSettings.maxLogQueueSize}
                              onChange={(e) => updateSdkSetting({ maxLogQueueSize: parseInt(e.target.value) || 100 })}
                              min="10"
                              max="1000"
                              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 text-sm"
                            />
                          </div>

                          <div className="p-3 bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-lg">📡</span>
                              <div>
                                <p className="text-white text-sm font-medium">Max Trace Queue Size</p>
                                <p className="text-gray-500 text-xs">Maximum API traces to queue before flushing</p>
                              </div>
                            </div>
                            <input
                              type="number"
                              value={sdkSettings.maxTraceQueueSize}
                              onChange={(e) => updateSdkSetting({ maxTraceQueueSize: parseInt(e.target.value) || 50 })}
                              min="5"
                              max="500"
                              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 text-sm"
                            />
                          </div>

                          <div className="p-3 bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-lg">⏱️</span>
                              <div>
                                <p className="text-white text-sm font-medium">Flush Interval (seconds)</p>
                                <p className="text-gray-500 text-xs">How often to send queued events</p>
                              </div>
                            </div>
                            <input
                              type="number"
                              value={sdkSettings.flushIntervalSeconds}
                              onChange={(e) => updateSdkSetting({ flushIntervalSeconds: parseInt(e.target.value) || 30 })}
                              min="5"
                              max="300"
                              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Log Control Settings */}
                      <div className="bg-gray-900 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-2xl">📋</span>
                          <div>
                            <h3 className="text-white font-medium">Log Control</h3>
                            <p className="text-gray-400 text-sm">Configure logging behavior and levels</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="p-3 bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-lg">📊</span>
                              <div>
                                <p className="text-white text-sm font-medium">Minimum Log Level</p>
                                <p className="text-gray-500 text-xs">Only capture logs at or above this level</p>
                              </div>
                            </div>
                            <select
                              value={sdkSettings.minLogLevel}
                              onChange={(e) => updateSdkSetting({ minLogLevel: e.target.value })}
                              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 text-sm"
                            >
                              <option value="verbose">Verbose (all logs)</option>
                              <option value="debug">Debug</option>
                              <option value="info">Info</option>
                              <option value="warn">Warning</option>
                              <option value="error">Error only</option>
                            </select>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">🔍</span>
                              <div>
                                <p className="text-white text-sm font-medium">Verbose Errors</p>
                                <p className="text-gray-500 text-xs">Include stack traces and extra context in error logs</p>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={sdkSettings.verboseErrors}
                                onChange={(e) => updateSdkSetting({ verboseErrors: e.target.checked })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8">Failed to load SDK settings</p>
                  )}
                </div>
              )}

              {/* Project Settings Tab */}
              {settingsTab === 'project' && (
                <div className="space-y-6">
                  {/* Project Name */}
                  <div className="bg-gray-900 rounded-lg p-6">
                    <h3 className="text-white font-medium mb-4">Project Name</h3>
                    {isEditingName ? (
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={editingProjectName}
                          onChange={(e) => setEditingProjectName(e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Project name"
                          disabled={updatingName}
                        />
                        <button
                          onClick={async () => {
                            if (!editingProjectName.trim() || editingProjectName.trim() === projectName) {
                              setIsEditingName(false)
                              setEditingProjectName(projectName)
                              return
                            }
                            setUpdatingName(true)
                            try {
                              await api.projects.update(projectId, editingProjectName.trim(), token!)
                              setProjectName(editingProjectName.trim())
                              setIsEditingName(false)
                            } catch (error: any) {
                              alert(error?.message || 'Failed to update project name')
                              setEditingProjectName(projectName)
                            } finally {
                              setUpdatingName(false)
                            }
                          }}
                          disabled={updatingName || !editingProjectName.trim()}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded transition-colors"
                        >
                          {updatingName ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingName(false)
                            setEditingProjectName(projectName)
                          }}
                          disabled={updatingName}
                          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-gray-300">{projectName}</span>
                        <button
                          onClick={() => setIsEditingName(true)}
                          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors text-sm"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>

                  {/* API Key */}
                  <div className="bg-gray-900 rounded-lg p-6">
                    <h3 className="text-white font-medium mb-4">API Key</h3>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={apiKey}
                        readOnly
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-300 font-mono text-sm"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(apiKey)
                          setCopied(true)
                          setTimeout(() => setCopied(false), 2000)
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm"
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">
                      Use this API key to initialize the DevBridge SDK in your mobile app.
                    </p>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">⚠️</span>
                      <div>
                        <h3 className="text-red-400 font-bold text-lg">Danger Zone</h3>
                        <p className="text-gray-300 text-sm">Deleting a project will permanently remove all associated data including devices, logs, traces, crashes, and configurations.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    >
                      Delete Project
                    </button>
                  </div>

                  {/* Delete Confirmation Modal */}
                  {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md border border-red-500/50">
                        <h3 className="text-red-400 font-bold text-lg mb-2">Delete Project</h3>
                        <p className="text-gray-300 mb-4">
                          Are you sure you want to delete <strong className="text-white">{projectName}</strong>? This action cannot be undone and will permanently delete:
                        </p>
                        <ul className="list-disc list-inside text-gray-400 text-sm mb-6 space-y-1">
                          <li>All devices and device data</li>
                          <li>All logs, traces, and crashes</li>
                          <li>All business configurations</li>
                          <li>All localization data</li>
                          <li>All API mocks and environments</li>
                          <li>All alerts and monitoring configurations</li>
                        </ul>
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={deletingProject}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={async () => {
                              setDeletingProject(true)
                              try {
                                await api.projects.delete(projectId, token!)
                                // Redirect to projects list
                                router.push('/projects')
                              } catch (error: any) {
                                alert(error?.message || 'Failed to delete project')
                                setDeletingProject(false)
                                setShowDeleteConfirm(false)
                              }
                            }}
                            disabled={deletingProject}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded transition-colors"
                          >
                            {deletingProject ? 'Deleting...' : 'Delete Project'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Data Cleanup Tab */}
              {settingsTab === 'cleanup' && (
                <div className="space-y-6">
                  {/* Warning Banner */}
                  <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">⚠️</span>
                      <div>
                        <h3 className="text-red-400 font-bold text-lg">Danger Zone</h3>
                        <p className="text-gray-300 text-sm">These actions will permanently delete data and cannot be undone.</p>
                      </div>
                    </div>
                  </div>

                  {/* Cleanup Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Delete Devices */}
                    <div className="bg-gray-900 rounded-lg p-6 hover:bg-gray-850 transition-colors">
                      <div className="flex items-start gap-4">
                        <span className="text-4xl">📱</span>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-lg mb-2">Delete All Devices</h3>
                          <p className="text-gray-400 text-sm mb-4">
                            Permanently removes all registered devices and their associated data.
                          </p>
                          <ul className="text-gray-500 text-xs space-y-1 mb-4">
                            <li>• Device registrations</li>
                            <li>• Debug mode settings</li>
                            <li>• Device metadata</li>
                          </ul>
                          <button
                            onClick={() => {
                              if (window.confirm('⚠️ Are you absolutely sure?\n\nThis will permanently delete ALL devices and their data.\n\nType "DELETE" in the next prompt to confirm.')) {
                                const confirmation = window.prompt('Type DELETE to confirm:')
                                if (confirmation === 'DELETE') {
                                  handleCleanupData('devices')
                                }
                              }
                            }}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 font-medium text-sm transition-colors"
                          >
                            🗑️ Delete All Devices
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Delete API Traces */}
                    <div className="bg-gray-900 rounded-lg p-6 hover:bg-gray-850 transition-colors">
                      <div className="flex items-start gap-4">
                        <span className="text-4xl">📡</span>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-lg mb-2">Delete All API Traces</h3>
                          <p className="text-gray-400 text-sm mb-4">
                            Permanently removes all captured API request/response traces.
                          </p>
                          <ul className="text-gray-500 text-xs space-y-1 mb-4">
                            <li>• HTTP requests/responses</li>
                            <li>• Request/response bodies</li>
                            <li>• Headers and metadata</li>
                          </ul>
                          <button
                            onClick={() => {
                              if (window.confirm('⚠️ Are you absolutely sure?\n\nThis will permanently delete ALL API traces.\n\nType "DELETE" in the next prompt to confirm.')) {
                                const confirmation = window.prompt('Type DELETE to confirm:')
                                if (confirmation === 'DELETE') {
                                  handleCleanupData('traces')
                                }
                              }
                            }}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 font-medium text-sm transition-colors"
                          >
                            🗑️ Delete All API Traces
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Delete Logs */}
                    <div className="bg-gray-900 rounded-lg p-6 hover:bg-gray-850 transition-colors">
                      <div className="flex items-start gap-4">
                        <span className="text-4xl">📝</span>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-lg mb-2">Delete All Logs</h3>
                          <p className="text-gray-400 text-sm mb-4">
                            Permanently removes all application logs.
                          </p>
                          <ul className="text-gray-500 text-xs space-y-1 mb-4">
                            <li>• Debug logs</li>
                            <li>• Info logs</li>
                            <li>• Error logs</li>
                          </ul>
                          <button
                            onClick={() => {
                              if (window.confirm('⚠️ Are you absolutely sure?\n\nThis will permanently delete ALL logs.\n\nType "DELETE" in the next prompt to confirm.')) {
                                const confirmation = window.prompt('Type DELETE to confirm:')
                                if (confirmation === 'DELETE') {
                                  handleCleanupData('logs')
                                }
                              }
                            }}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 font-medium text-sm transition-colors"
                          >
                            🗑️ Delete All Logs
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Delete Sessions */}
                    <div className="bg-gray-900 rounded-lg p-6 hover:bg-gray-850 transition-colors">
                      <div className="flex items-start gap-4">
                        <span className="text-4xl">🔄</span>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-lg mb-2">Delete All Sessions</h3>
                          <p className="text-gray-400 text-sm mb-4">
                            Permanently removes all session data and their events.
                          </p>
                          <ul className="text-gray-500 text-xs space-y-1 mb-4">
                            <li>• Session records</li>
                            <li>• Session events</li>
                            <li>• Session metadata</li>
                          </ul>
                          <button
                            onClick={() => {
                              if (window.confirm('⚠️ Are you absolutely sure?\n\nThis will permanently delete ALL sessions.\n\nType "DELETE" in the next prompt to confirm.')) {
                                const confirmation = window.prompt('Type DELETE to confirm:')
                                if (confirmation === 'DELETE') {
                                  handleCleanupData('sessions')
                                }
                              }
                            }}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 font-medium text-sm transition-colors"
                          >
                            🗑️ Delete All Sessions
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Delete Crashes */}
                    <div className="bg-gray-900 rounded-lg p-6 hover:bg-gray-850 transition-colors">
                      <div className="flex items-start gap-4">
                        <span className="text-4xl">💥</span>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-lg mb-2">Delete All Crashes</h3>
                          <p className="text-gray-400 text-sm mb-4">
                            Permanently removes all crash reports and stack traces.
                          </p>
                          <ul className="text-gray-500 text-xs space-y-1 mb-4">
                            <li>• Crash reports</li>
                            <li>• Stack traces</li>
                            <li>• Crash metadata</li>
                          </ul>
                          <button
                            onClick={() => {
                              if (window.confirm('⚠️ Are you absolutely sure?\n\nThis will permanently delete ALL crash reports.\n\nType "DELETE" in the next prompt to confirm.')) {
                                const confirmation = window.prompt('Type DELETE to confirm:')
                                if (confirmation === 'DELETE') {
                                  handleCleanupData('crashes')
                                }
                              }
                            }}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 font-medium text-sm transition-colors"
                          >
                            🗑️ Delete All Crashes
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Delete Screens */}
                    <div className="bg-gray-900 rounded-lg p-6 hover:bg-gray-850 transition-colors">
                      <div className="flex items-start gap-4">
                        <span className="text-4xl">🖥️</span>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-lg mb-2">Delete All Screens</h3>
                          <p className="text-gray-400 text-sm mb-4">
                            Permanently removes all screen tracking data.
                          </p>
                          <ul className="text-gray-500 text-xs space-y-1 mb-4">
                            <li>• Screen views</li>
                            <li>• Screen transitions</li>
                            <li>• Screen metadata</li>
                          </ul>
                          <button
                            onClick={() => {
                              if (window.confirm('⚠️ Are you absolutely sure?\n\nThis will permanently delete ALL screen data.\n\nType "DELETE" in the next prompt to confirm.')) {
                                const confirmation = window.prompt('Type DELETE to confirm:')
                                if (confirmation === 'DELETE') {
                                  handleCleanupData('screens')
                                }
                              }
                            }}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 font-medium text-sm transition-colors"
                          >
                            🗑️ Delete All Screens
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delete Everything */}
                  <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border-2 border-red-500 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <span className="text-5xl">☢️</span>
                      <div className="flex-1">
                        <h3 className="text-red-400 font-bold text-xl mb-2">Nuclear Option: Delete Everything</h3>
                        <p className="text-gray-300 text-sm mb-4">
                          This will delete <strong>ALL DATA</strong> from this project including devices, traces, logs, sessions, crashes, and screens.
                          This action is <strong className="text-red-400">IRREVERSIBLE</strong>.
                        </p>
                        <button
                          onClick={() => {
                            if (window.confirm('☢️ NUCLEAR OPTION - DELETE EVERYTHING\n\nThis will PERMANENTLY DELETE ALL DATA:\n• All devices\n• All API traces\n• All logs\n• All sessions\n• All crashes\n• All screens\n\nTHIS CANNOT BE UNDONE!\n\nType "DELETE EVERYTHING" in the next prompt to confirm.')) {
                              const confirmation = window.prompt('Type "DELETE EVERYTHING" (without quotes) to confirm:')
                              if (confirmation === 'DELETE EVERYTHING') {
                                handleCleanupData('all')
                              }
                            }
                          }}
                          className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-500 hover:to-orange-500 font-bold text-base transition-all shadow-lg"
                        >
                          ☢️ DELETE EVERYTHING
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'business-config' && token && (
            <BusinessConfigTab
              projectId={projectId}
              token={token}
              sharedUsage={sharedUsage}
            />
          )}

          {activeTab === 'localization' && token && (
            <LocalizationTab
              projectId={projectId}
              token={token}
              sharedUsage={sharedUsage}
            />
          )}

          {activeTab === 'mocks' && token && (
            <MocksPage />
          )}

          {activeTab === 'setup' && (
            <SetupInstructions apiKey={apiKey} />
          )}
        </div>
      </div>
    </div>
  )
}

function SetupInstructions({ apiKey }: { apiKey: string }) {
  const endpoint = typeof window !== 'undefined' ? window.location.origin : 'https://your-app.vercel.app'

  const swiftCode = `// DevBridge.swift - Add this file to your Xcode project

import Foundation

class DevBridge {
    static let shared = DevBridge()
    private var apiKey = "${apiKey}"
    private var endpoint = "${endpoint}"
    private var deviceId: String = ""

    private init() {
        self.deviceId = UIDevice.current.identifierForVendor?.uuidString ?? UUID().uuidString
        registerDevice()
    }

    private func registerDevice() {
        let payload: [String: Any] = [
            "deviceId": deviceId,
            "platform": "ios",
            "osVersion": UIDevice.current.systemVersion,
            "model": UIDevice.current.model
        ]
        send(to: "/api/devices", payload: payload)
    }

    func trace(_ request: URLRequest, response: HTTPURLResponse?, data: Data?, duration: Int, error: Error?) {
        let payload: [String: Any] = [
            "deviceId": deviceId,
            "url": request.url?.absoluteString ?? "",
            "method": request.httpMethod ?? "GET",
            "statusCode": response?.statusCode ?? 0,
            "duration": duration,
            "error": error?.localizedDescription ?? "",
            "timestamp": ISO8601DateFormatter().string(from: Date())
        ]
        send(to: "/api/traces", payload: payload)
    }

    func log(_ message: String, level: String = "info", data: [String: Any]? = nil) {
        let payload: [String: Any] = [
            "deviceId": deviceId,
            "level": level,
            "message": message,
            "data": data ?? [:],
            "timestamp": ISO8601DateFormatter().string(from: Date())
        ]
        send(to: "/api/logs", payload: payload)
    }

    func crash(_ message: String, stackTrace: String? = nil) {
        let payload: [String: Any] = [
            "deviceId": deviceId,
            "message": message,
            "stackTrace": stackTrace ?? "",
            "timestamp": ISO8601DateFormatter().string(from: Date())
        ]
        send(to: "/api/crashes", payload: payload)
    }

    private func send(to path: String, payload: [String: Any]) {
        guard let url = URL(string: endpoint + path) else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(apiKey, forHTTPHeaderField: "x-api-key")
        request.httpBody = try? JSONSerialization.data(withJSONObject: payload)
        URLSession.shared.dataTask(with: request).resume()
    }
}`

  const kotlinCode = `// DevBridge.kt - Add this file to your Android project

package com.yourapp.devbridge

import android.os.Build
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.util.UUID

object DevBridge {
    private const val apiKey = "${apiKey}"
    private const val endpoint = "${endpoint}"
    private var deviceId: String = ""

    fun init(context: android.content.Context) {
        deviceId = android.provider.Settings.Secure.getString(
            context.contentResolver,
            android.provider.Settings.Secure.ANDROID_ID
        ) ?: UUID.randomUUID().toString()
        registerDevice()
    }

    private fun registerDevice() {
        val payload = mapOf(
            "deviceId" to deviceId,
            "platform" to "android",
            "osVersion" to Build.VERSION.RELEASE,
            "model" to Build.MODEL,
            "manufacturer" to Build.MANUFACTURER
        )
        send("/api/devices", payload)
    }

    fun trace(url: String, method: String, statusCode: Int, duration: Long, error: String? = null) {
        val payload = mapOf(
            "deviceId" to deviceId,
            "url" to url,
            "method" to method,
            "statusCode" to statusCode,
            "duration" to duration,
            "error" to (error ?: ""),
            "timestamp" to System.currentTimeMillis()
        )
        send("/api/traces", payload)
    }

    fun log(message: String, level: String = "info", data: Map<String, Any>? = null) {
        val payload = mapOf(
            "deviceId" to deviceId,
            "level" to level,
            "message" to message,
            "data" to (data ?: emptyMap<String, Any>()),
            "timestamp" to System.currentTimeMillis()
        )
        send("/api/logs", payload)
    }

    fun crash(message: String, stackTrace: String? = null) {
        val payload = mapOf(
            "deviceId" to deviceId,
            "message" to message,
            "stackTrace" to (stackTrace ?: ""),
            "timestamp" to System.currentTimeMillis()
        )
        send("/api/crashes", payload)
    }

    private fun send(path: String, payload: Map<String, Any>) {
        Thread {
            try {
                val url = URL(endpoint + path)
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json")
                conn.setRequestProperty("x-api-key", apiKey)
                conn.doOutput = true
                conn.outputStream.write(JSONObject(payload).toString().toByteArray())
                conn.responseCode
            } catch (e: Exception) { }
        }.start()
    }
}`

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Quick Setup</h2>
        <p className="text-gray-400 mb-4">
          Copy one of the files below into your project to start tracking API calls, logs, and crashes.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-3">iOS (Swift)</h3>
        <div className="relative">
          <pre className="p-4 bg-gray-900 rounded-lg overflow-x-auto text-sm text-gray-300">
            {swiftCode}
          </pre>
        </div>
        <div className="mt-3 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
          <h4 className="text-blue-400 font-medium mb-2">Usage:</h4>
          <pre className="text-sm text-gray-300">{`// Track API calls
let start = Date()
URLSession.shared.dataTask(with: request) { data, response, error in
    let duration = Int(Date().timeIntervalSince(start) * 1000)
    DevBridge.shared.trace(request, response: response as? HTTPURLResponse, data: data, duration: duration, error: error)
}.resume()

// Log events
DevBridge.shared.log("User signed in", data: ["userId": "123"])

// Report crashes
DevBridge.shared.crash("Unexpected error", stackTrace: Thread.callStackSymbols.joined(separator: "\\n"))`}</pre>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Android (Kotlin)</h3>
        <div className="relative">
          <pre className="p-4 bg-gray-900 rounded-lg overflow-x-auto text-sm text-gray-300">
            {kotlinCode}
          </pre>
        </div>
        <div className="mt-3 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
          <h4 className="text-blue-400 font-medium mb-2">Usage:</h4>
          <pre className="text-sm text-gray-300">{`// Initialize in Application class
DevBridge.init(applicationContext)

// Track API calls (with OkHttp interceptor or manual)
DevBridge.trace(
    url = "https://api.example.com/users",
    method = "GET",
    statusCode = 200,
    duration = 150
)

// Log events
DevBridge.log("User signed in", data = mapOf("userId" to "123"))

// Report crashes
DevBridge.crash("Unexpected error", stackTrace = e.stackTraceToString())`}</pre>
        </div>
      </div>
    </div>
  )
}
