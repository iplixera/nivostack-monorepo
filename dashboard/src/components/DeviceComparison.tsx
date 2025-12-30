'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

type ComparisonDevice = {
  id: string
  deviceId: string
  deviceCode: string | null
  platform: string
  osVersion: string | null
  appVersion: string | null
  model: string | null
  manufacturer: string | null
  deviceCategory: string | null
  deviceBrand: string | null
  locale: string | null
  language: string | null
  timeZone: string | null
  timeZoneOffset: number | null
  appId: string | null
  appInstanceId: string | null
  advertisingId: string | null
  vendorId: string | null
  limitedAdTracking: boolean | null
  firstOpenAt: string | null
  firstPurchaseAt: string | null
  user: string | null
  debugModeEnabled: boolean
  debugModeExpiresAt: string | null
  fingerprint: string | null
  batteryLevel: number | null
  storageFree: number | null
  memoryTotal: number | null
  networkType: string | null
  screenWidth: number | null
  screenHeight: number | null
  screenDensity: number | null
  cpuArchitecture: string | null
  tags: string[]
  state: string
  lastSeenAt: string
  createdAt: string
  stats: {
    logs: number
    crashes: number
    apiTraces: number
    sessions: number
  }
  metadata: Record<string, unknown> | null
}

interface DeviceComparisonProps {
  deviceIds: string[]
  token: string
  onClose: () => void
}

export default function DeviceComparison({ deviceIds, token, onClose }: DeviceComparisonProps) {
  const [comparison, setComparison] = useState<{ devices: ComparisonDevice[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadComparison()
  }, [deviceIds, token])

  const loadComparison = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.devices.compare(deviceIds, token)
      setComparison(data.comparison as any)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comparison')
    } finally {
      setLoading(false)
    }
  }

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return '-'
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="text-gray-400">Loading comparison...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 max-w-md">
          <h3 className="text-lg font-semibold text-white mb-2">Error</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-750 text-white rounded-lg text-sm font-medium transition-colors border border-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  if (!comparison || comparison.devices.length === 0) {
    return null
  }

  const devices = comparison.devices

  // Define comparison fields
  const comparisonFields = [
    { label: 'Device Code', key: 'deviceCode' },
    { label: 'Platform', key: 'platform' },
    { label: 'Device Category', key: 'deviceCategory', format: (v: string | null) => v ? v.charAt(0).toUpperCase() + v.slice(1) : '-' },
    { label: 'Device Brand', key: 'deviceBrand' },
    { label: 'Model', key: 'model' },
    { label: 'Manufacturer', key: 'manufacturer' },
    { label: 'OS Version', key: 'osVersion' },
    { label: 'App Version', key: 'appVersion' },
    { label: 'App ID', key: 'appId' },
    { label: 'App Instance ID', key: 'appInstanceId' },
    { label: 'Locale', key: 'locale' },
    { label: 'Language', key: 'language' },
    { label: 'Timezone', key: 'timeZone' },
    { label: 'Timezone Offset', key: 'timeZoneOffset', format: (v: number | null) => v !== null ? `${v / 3600}h` : '-' },
    { label: 'Vendor ID', key: 'vendorId' },
    { label: 'Advertising ID', key: 'advertisingId' },
    { label: 'Limited Ad Tracking', key: 'limitedAdTracking', format: (v: boolean | null) => v === true ? 'Yes' : v === false ? 'No' : '-' },
    { label: 'First Open', key: 'firstOpenAt', format: (v: string | null) => v ? formatDate(v) : '-' },
    { label: 'First Purchase', key: 'firstPurchaseAt', format: (v: string | null) => v ? formatDate(v) : '-' },
    { label: 'User', key: 'user' },
    { label: 'Debug Mode', key: 'debugModeEnabled', format: (v: boolean) => v ? 'Yes' : 'No' },
    { label: 'Battery Level', key: 'batteryLevel', format: (v: number | null) => v !== null ? `${v}%` : '-' },
    { label: 'Storage Free', key: 'storageFree', format: formatBytes },
    { label: 'Memory Total', key: 'memoryTotal', format: formatBytes },
    { label: 'Network Type', key: 'networkType' },
    { label: 'Screen Size', key: 'screenSize', format: (device: ComparisonDevice) => 
      device.screenWidth && device.screenHeight ? `${device.screenWidth}x${device.screenHeight}` : '-'
    },
    { label: 'Screen Density', key: 'screenDensity', format: (v: number | null) => v !== null ? `${v} DPI` : '-' },
    { label: 'CPU Architecture', key: 'cpuArchitecture' },
    { label: 'Fingerprint', key: 'fingerprint' },
    { label: 'State', key: 'state' },
    { label: 'Last Seen', key: 'lastSeenAt', format: formatDate },
    { label: 'Created', key: 'createdAt', format: formatDate },
    { label: 'Logs', key: 'stats.logs' },
    { label: 'Crashes', key: 'stats.crashes' },
    { label: 'API Traces', key: 'stats.apiTraces' },
    { label: 'Sessions', key: 'stats.sessions' },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-800 max-w-7xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Device Comparison</h2>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-750 text-white rounded-lg text-sm font-medium transition-colors border border-gray-700"
          >
            Close
          </button>
        </div>

        {/* Comparison Table */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase border-b border-gray-700">Property</th>
                  {devices.map((device, idx) => (
                    <th key={device.id} className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase border-b border-gray-700 min-w-[200px]">
                      <div className="font-semibold text-white">
                        {device.manufacturer ? `${device.manufacturer} ` : ''}{device.model || 'Device ' + (idx + 1)}
                      </div>
                      <div className="text-gray-400 text-xs mt-1 font-mono">
                        {device.deviceCode || device.deviceId.slice(0, 12)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {comparisonFields.map((field) => (
                  <tr key={field.key} className="hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-300 border-r border-gray-800">
                      {field.label}
                    </td>
                    {devices.map((device) => {
                      let value: any
                      if (field.key.includes('.')) {
                        const [obj, prop] = field.key.split('.')
                        value = (device as any)[obj]?.[prop]
                      } else if (field.key === 'screenSize') {
                        value = device
                      } else {
                        value = (device as any)[field.key]
                      }

                      const displayValue = field.format
                        ? (field.format as any)(value)
                        : value !== null && value !== undefined
                        ? String(value)
                        : '-'

                      return (
                        <td key={device.id} className="px-4 py-3 text-sm text-white">
                          {field.key === 'tags' && Array.isArray(value) ? (
                            <div className="flex flex-wrap gap-1">
                              {value.length > 0 ? (
                                value.map((tag: string, i: number) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 bg-gray-800 text-gray-300 text-xs rounded border border-gray-700"
                                  >
                                    {tag}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </div>
                          ) : (
                            <span className={displayValue === '-' ? 'text-gray-500' : ''}>
                              {displayValue}
                            </span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

