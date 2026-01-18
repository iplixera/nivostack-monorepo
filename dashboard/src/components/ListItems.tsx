'use client'

import React, { memo, useState } from 'react'

// ============================================
// TYPES
// ============================================

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
  deviceCode?: string
  userId?: string
  userEmail?: string
  userName?: string
  debugModeEnabled?: boolean
  debugModeEnabledAt?: string
  debugModeExpiresAt?: string
  debugModeEnabledBy?: string
  metadata?: {
    sdk?: number
    device?: string
    product?: string
    country?: string
    carrier?: string
  }
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

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatTime = (date: string) => {
  return new Date(date).toLocaleString()
}

const getStatusColor = (status: number) => {
  if (status >= 200 && status < 300) return 'text-green-400'
  if (status >= 400 && status < 500) return 'text-yellow-400'
  if (status >= 500) return 'text-red-400'
  return 'text-gray-400'
}

const formatBody = (body?: string) => {
  if (!body) return null
  try {
    return JSON.stringify(JSON.parse(body), null, 2)
  } catch {
    return body
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

// ============================================
// DEVICE CARD COMPONENT
// ============================================

interface DeviceCardProps {
  device: Device
  togglingDebugMode: string | null
  onToggleDebugMode: (deviceId: string, enabled: boolean, expiresIn?: string) => void
  deletingDevice: string | null
  onDeleteDevice: (deviceId: string) => void
  trackingMode?: string  // 'all' | 'debug_only' | 'none'
  selected?: boolean
  onSelect?: (selected: boolean) => void
  onViewDetails?: () => void
}

export const DeviceCard = memo(function DeviceCard({
  device,
  togglingDebugMode,
  onToggleDebugMode,
  deletingDevice,
  onDeleteDevice,
  trackingMode = 'all',
  selected = false,
  onSelect,
  onViewDetails
}: DeviceCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Determine if debug button should be shown
  // Show only when tracking mode is 'debug_only' or when SDK settings tab is being used
  const showDebugButton = trackingMode === 'debug_only' || device.debugModeEnabled

  return (
    <>
    {/* Delete Confirmation Modal */}
    {showDeleteConfirm && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-6 max-w-md mx-4 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-2">Delete Device?</h3>
          <p className="text-gray-400 mb-4">
            This will permanently delete the device <span className="text-white font-mono">{device.deviceCode || device.deviceId.slice(0, 12)}</span> and all its associated data:
          </p>
          <ul className="text-gray-400 text-sm mb-4 space-y-1">
            <li>All logs from this device</li>
            <li>All API traces from this device</li>
            <li>All sessions from this device</li>
            <li>All crash reports from this device</li>
          </ul>
          <p className="text-red-400 text-sm mb-4">
            This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              disabled={deletingDevice === device.id}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onDeleteDevice(device.id)
                setShowDeleteConfirm(false)
              }}
              disabled={deletingDevice === device.id}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {deletingDevice === device.id ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Deleting...
                </>
              ) : (
                'Delete Device'
              )}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Device Card */}
    <div className={`bg-gray-900 rounded-lg p-6 border ${selected ? 'border-blue-500' : 'border-gray-800'} ${device.debugModeEnabled ? 'border-blue-500/50' : ''}`}>
      {/* Device Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {onSelect && (
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelect(e.target.checked)}
              className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-blue-500"
            />
          )}
          <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-lg">
            {device.platform === 'android' ? '🤖' : '🍎'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-medium">
                {device.manufacturer ? `${device.manufacturer} ` : ''}{device.model || 'Unknown Device'}
              </h3>
              {device.debugModeEnabled && (
                <span className="px-2 py-0.5 bg-gray-800 text-gray-300 text-xs rounded font-medium border border-gray-700">
                  Debug
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {device.deviceCode && (
                <span className="text-gray-300 text-sm font-mono bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
                  {device.deviceCode}
                </span>
              )}
              <span className="text-gray-500 text-sm font-mono">{device.deviceId.slice(0, 12)}...</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* View Details Button */}
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-gray-800 text-gray-300 hover:text-white border border-gray-700 hover:border-gray-600"
              title="View device details and notes"
            >
              View Details
            </button>
          )}
          {/* Debug Mode Toggle - Only show when tracking mode is 'debug_only' */}
          {showDebugButton && (
            <button
              onClick={() => onToggleDebugMode(device.id, !device.debugModeEnabled, '24h')}
              disabled={togglingDebugMode === device.id}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border ${
                device.debugModeEnabled
                  ? 'bg-gray-800 text-white border-gray-700 hover:bg-gray-750'
                  : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-750'
              } ${togglingDebugMode === device.id ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={
                trackingMode === 'debug_only' 
                  ? (device.debugModeEnabled ? 'Disable debug mode' : 'Enable debug mode (24h) to track this device')
                  : 'Debug mode is active'
              }
            >
              {togglingDebugMode === device.id ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <>{device.debugModeEnabled ? 'Debug ON' : 'Debug OFF'}</>
              )}
            </button>
          )}
          {/* Delete Device Button */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deletingDevice === device.id}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-gray-800 text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 flex items-center gap-1"
            title="Delete device and all data"
          >
            {deletingDevice === device.id ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
          <div className="text-right">
            <div className="text-gray-400 text-sm">Last seen: {formatTime(device.lastSeenAt)}</div>
            <div className="text-gray-500 text-xs">Registered: {formatTime(device.createdAt)}</div>
          </div>
        </div>
      </div>

      {/* User Info (if associated) */}
      {(device.userEmail || device.userName) && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-gray-800/50 rounded-lg">
          <span className="text-gray-400">👤</span>
          <div className="text-sm">
            {device.userName && <span className="text-white">{device.userName}</span>}
            {device.userName && device.userEmail && <span className="text-gray-500 mx-1">·</span>}
            {device.userEmail && <span className="text-gray-400">{device.userEmail}</span>}
            {device.userId && <span className="text-gray-600 text-xs ml-2">(ID: {device.userId})</span>}
          </div>
        </div>
      )}

      {/* Debug Mode Expiry Info */}
      {device.debugModeEnabled && device.debugModeExpiresAt && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-gray-800/50 rounded-lg border border-gray-700">
          <span className="text-gray-300 text-sm">
            Debug expires: {formatTime(device.debugModeExpiresAt)}
          </span>
        </div>
      )}

      {/* Device Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
        <div>
          <span className="text-gray-400 text-xs">Platform</span>
          <p className="text-white">{device.platform}</p>
        </div>
        <div>
          <span className="text-gray-400 text-xs">OS Version</span>
          <p className="text-white">{device.osVersion || '-'}</p>
        </div>
        <div>
          <span className="text-gray-400 text-xs">App Version</span>
          <p className="text-white">{device.appVersion || '-'}</p>
        </div>
        {(device as any).deviceCategory && (
          <div>
            <span className="text-gray-400 text-xs">Category</span>
            <p className="text-white capitalize">{(device as any).deviceCategory}</p>
          </div>
        )}
        {(device as any).deviceBrand && (
          <div>
            <span className="text-gray-400 text-xs">Brand</span>
            <p className="text-white">{(device as any).deviceBrand}</p>
          </div>
        )}
        {(device as any).locale && (
          <div>
            <span className="text-gray-400 text-xs">Locale</span>
            <p className="text-white">{(device as any).locale}</p>
          </div>
        )}
        {(device as any).language && (
          <div>
            <span className="text-gray-400 text-xs">Language</span>
            <p className="text-white">{(device as any).language}</p>
          </div>
        )}
        {(device as any).timeZone && (
          <div>
            <span className="text-gray-400 text-xs">Timezone</span>
            <p className="text-white text-xs">{(device as any).timeZone}</p>
          </div>
        )}
        {(device as any).appId && (
          <div>
            <span className="text-gray-400 text-xs">App ID</span>
            <p className="text-white text-xs font-mono truncate" title={(device as any).appId}>
              {(device as any).appId}
            </p>
          </div>
        )}
        {device.metadata?.sdk && (
          <div>
            <span className="text-gray-400 text-xs">SDK Level</span>
            <p className="text-white">{device.metadata.sdk}</p>
          </div>
        )}
        {device.metadata?.country && (
          <div>
            <span className="text-gray-400 text-xs">Country</span>
            <p className="text-white">{device.metadata.country}</p>
          </div>
        )}
        {device.metadata?.carrier && (
          <div>
            <span className="text-gray-400 text-xs">Carrier</span>
            <p className="text-white">{device.metadata.carrier}</p>
          </div>
        )}
      </div>

      {/* Additional Metadata Tags */}
      {device.metadata && (device.metadata.device || device.metadata.product) && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-800">
          {device.metadata.device && (
            <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded">
              device: {device.metadata.device}
            </span>
          )}
          {device.metadata.product && (
            <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded">
              product: {device.metadata.product}
            </span>
          )}
        </div>
      )}
    </div>
    </>
  )
})

// ============================================
// LOG ITEM COMPONENT
// ============================================

interface LogItemProps {
  log: Log
  isExpanded: boolean
  onToggleExpand: () => void
}

export const LogItem = memo(function LogItem({
  log,
  isExpanded,
  onToggleExpand
}: LogItemProps) {
  return (
    <div
      className={`bg-gray-900 rounded-lg overflow-hidden border-l-4 ${
        log.level === 'error' || log.level === 'assert'
          ? 'border-red-500'
          : log.level === 'warn'
          ? 'border-yellow-500'
          : log.level === 'debug'
          ? 'border-purple-500'
          : log.level === 'verbose'
          ? 'border-gray-500'
          : 'border-blue-500'
      }`}
    >
      {/* Log Header - Always Visible */}
      <button
        onClick={onToggleExpand}
        className="w-full p-3 text-left hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <span className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${
              log.level === 'error' || log.level === 'assert'
                ? 'bg-red-900/50 text-red-400'
                : log.level === 'warn'
                ? 'bg-yellow-900/50 text-yellow-400'
                : log.level === 'debug'
                ? 'bg-purple-900/50 text-purple-400'
                : log.level === 'verbose'
                ? 'bg-gray-700 text-gray-400'
                : 'bg-blue-900/50 text-blue-400'
            }`}>
              {log.level.toUpperCase()}
            </span>
            {log.tag && (
              <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded shrink-0">
                {log.tag}
              </span>
            )}
            <span className="text-white text-sm truncate">{log.message}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {log.device && (
              <span className="text-gray-500 text-xs">
                {log.device.platform}
              </span>
            )}
            <span className="text-gray-500 text-xs">{formatTime(log.timestamp)}</span>
            <span className="text-gray-500">{isExpanded ? '▼' : '▶'}</span>
          </div>
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-800">
          {/* Full Message */}
          <div className="mt-3">
            <span className="text-gray-500 text-xs font-medium">Message</span>
            <pre className="mt-1 p-3 bg-gray-800 rounded text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap">
              {log.message}
            </pre>
          </div>

          {/* Source Info */}
          {(log.className || log.functionName || log.fileName) && (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
              {log.className && (
                <div>
                  <span className="text-gray-500 text-xs">Class</span>
                  <p className="text-gray-300 text-sm font-mono">{log.className}</p>
                </div>
              )}
              {log.functionName && (
                <div>
                  <span className="text-gray-500 text-xs">Function</span>
                  <p className="text-gray-300 text-sm font-mono">{log.functionName}</p>
                </div>
              )}
              {log.fileName && (
                <div>
                  <span className="text-gray-500 text-xs">File</span>
                  <p className="text-gray-300 text-sm font-mono">
                    {log.fileName}{log.lineNumber ? `:${log.lineNumber}` : ''}
                  </p>
                </div>
              )}
              {log.threadName && (
                <div>
                  <span className="text-gray-500 text-xs">Thread</span>
                  <p className="text-gray-300 text-sm font-mono">{log.threadName}</p>
                </div>
              )}
            </div>
          )}

          {/* Context Info */}
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
            {log.screenName && (
              <div>
                <span className="text-gray-500 text-xs">Screen</span>
                <p className="text-gray-300 text-sm">{log.screenName}</p>
              </div>
            )}
            {log.device && (
              <div>
                <span className="text-gray-500 text-xs">Device</span>
                <p className="text-gray-300 text-sm">
                  {log.device.model || log.device.deviceId} ({log.device.platform})
                </p>
              </div>
            )}
            {log.session && (
              <div>
                <span className="text-gray-500 text-xs">Session</span>
                <p className="text-gray-300 text-sm font-mono text-xs">
                  {log.session.sessionToken.slice(0, 16)}...
                </p>
              </div>
            )}
            <div>
              <span className="text-gray-500 text-xs">Timestamp</span>
              <p className="text-gray-300 text-sm">{new Date(log.timestamp).toLocaleString()}</p>
            </div>
          </div>

          {/* Additional Data */}
          {log.data && (
            <div className="mt-3">
              <span className="text-gray-500 text-xs font-medium">Additional Data</span>
              <pre className="mt-1 p-3 bg-gray-800 rounded text-sm text-gray-300 overflow-x-auto">
                {JSON.stringify(log.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
})

// ============================================
// TRACE ITEM COMPONENT
// ============================================

interface TraceItemProps {
  trace: Trace
  isExpanded: boolean
  onToggleExpand: () => void
  isMonitored: boolean
  onToggleMonitor: (enabled: boolean) => void
}

export const TraceItem = memo(function TraceItem({
  trace,
  isExpanded,
  onToggleExpand,
  isMonitored,
  onToggleMonitor
}: TraceItemProps) {
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      {/* Trace Header - Clickable */}
      <button
        onClick={onToggleExpand}
        className="w-full p-4 text-left hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <span className="px-2 py-0.5 bg-gray-700 rounded text-xs font-medium text-gray-300 flex-shrink-0">
              {trace.method}
            </span>
            <span className={`font-medium flex-shrink-0 ${getStatusColor(trace.statusCode)}`}>
              {trace.statusCode || 'ERR'}
            </span>
            <span className="text-gray-300 font-mono text-sm break-all">
              {trace.url}
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm flex-shrink-0 ml-4">
            {trace.duration && (
              <span className="text-gray-400">{trace.duration}ms</span>
            )}
            <span className="text-gray-500">{formatTime(trace.timestamp)}</span>
            <span className="text-gray-500">{isExpanded ? '▼' : '▶'}</span>
          </div>
        </div>

        {/* Metadata Row */}
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
            <span className="truncate max-w-[250px]" title={trace.userAgent}>
              {trace.userAgent.slice(0, 50)}...
            </span>
          )}
        </div>

        {trace.error && (
          <div className="mt-2 text-red-400 text-sm">{trace.error}</div>
        )}
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-800 p-4 space-y-4">
          {/* Request Section */}
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
            {!trace.requestHeaders && !trace.requestBody && (
              <p className="text-xs text-gray-500 italic">No request data captured</p>
            )}
          </div>

          {/* Response Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Response</h4>
            {trace.responseHeaders && Object.keys(trace.responseHeaders).length > 0 && (
              <div className="mb-2">
                <span className="text-xs text-gray-500">Headers:</span>
                <pre className="mt-1 p-2 bg-gray-950 rounded text-xs text-gray-400 overflow-x-auto max-h-32">
                  {JSON.stringify(trace.responseHeaders, null, 2)}
                </pre>
              </div>
            )}
            {trace.responseBody && (
              <div>
                <span className="text-xs text-gray-500">Body:</span>
                <pre className="mt-1 p-2 bg-gray-950 rounded text-xs text-gray-400 overflow-x-auto max-h-64">
                  {formatBody(trace.responseBody)}
                </pre>
              </div>
            )}
            {!trace.responseHeaders && !trace.responseBody && (
              <p className="text-xs text-gray-500 italic">No response data captured</p>
            )}
          </div>

          {/* Additional Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-gray-800">
            {trace.ipAddress && (
              <div>
                <span className="text-xs text-gray-500">IP Address</span>
                <p className="text-sm text-gray-300">{trace.ipAddress}</p>
              </div>
            )}
            {trace.userAgent && (
              <div className="col-span-2">
                <span className="text-xs text-gray-500">User Agent</span>
                <p className="text-sm text-gray-300 truncate">{trace.userAgent}</p>
              </div>
            )}
          </div>

          {/* Monitoring Toggle */}
          <div className="border-t border-gray-800 pt-4 mt-4 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-300">Monitor Endpoint</h4>
              <p className="text-xs text-gray-500 mt-1">
                {isMonitored
                  ? 'This endpoint is being monitored for errors'
                  : 'Enable to track errors automatically'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isMonitored}
                onChange={(e) => onToggleMonitor(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      )}
    </div>
  )
})

export default { DeviceCard, LogItem, TraceItem }
