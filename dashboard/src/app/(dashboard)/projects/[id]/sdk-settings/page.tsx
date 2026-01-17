'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import PageHeader from '@/components/layout/PageHeader'
import ThemeToggle from '@/components/ThemeToggle'

export default function SdkSettingsPage() {
  const params = useParams()
  const { token } = useAuth()
  const projectId = params?.id as string

  const [projectName, setProjectName] = useState('')
  const [settings, setSettings] = useState({
    batchEvents: true,
    flushInterval: 5000,
    captureBodies: true,
    maskSensitiveData: true,
    apiTracking: true,
    screenTracking: true,
    crashReporting: true,
    logging: true,
  })

  const fetchProject = useCallback(async () => {
    if (!token || !projectId) return
    try {
      const data = await api.projects.list(token)
      const project = data.projects?.find(p => p.id === projectId)
      setProjectName(project?.name || 'Project')
    } catch (error) {
      console.error('Failed to fetch project:', error)
    }
  }, [token, projectId])

  const fetchSettings = useCallback(async () => {
    if (!token || !projectId) return
    try {
      const response = await api.featureFlags.get(projectId, token)
      if (response.flags) {
        setSettings({
          batchEvents: response.flags.batchEvents ?? true,
          flushInterval: 5000,
          captureBodies: true,
          maskSensitiveData: true,
          apiTracking: response.flags.apiTracking ?? true,
          screenTracking: response.flags.screenTracking ?? true,
          crashReporting: response.flags.crashReporting ?? true,
          logging: response.flags.logging ?? true,
        })
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  }, [token, projectId])

  useEffect(() => {
    if (token && projectId) {
      fetchProject()
      fetchSettings()
    }
  }, [token, projectId, fetchProject, fetchSettings])

  const handleToggle = useCallback(async (key: keyof typeof settings) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: !prev[key] }
      // TODO: Save settings via API
      return newSettings
    })
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="SDK Settings"
        subtitle="Control what the SDK captures: batching, flush interval, sensitive data masking, bodies capture policy."
        dataMode="Dev"
        actions={
          <>
            <ThemeToggle />
            <button className="btn" onClick={() => {}}>
              Save Changes
            </button>
          </>
        }
      />

      {/* Note Section */}
      <div className="note" style={{ marginTop: '18px' }}>
        <b>Rule</b>
        <div className="muted" style={{ marginTop: '6px' }}>
          SDK settings are the safety valve for performance and privacy. Changes should be auditable and optionally require approval (enterprise).
        </div>
      </div>

      {/* Settings Cards */}
      <div className="card" style={{ marginTop: '14px' }}>
        <b>Event Batching</b>
        <div className="hr" />
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
          <div>
            <b>Batch Events</b>
            <div className="muted" style={{ fontSize: '12px', marginTop: '4px' }}>
              Group multiple events before sending to reduce network calls
            </div>
          </div>
          <button
            className={`btn ${settings.batchEvents ? '' : 'secondary'}`}
            onClick={() => handleToggle('batchEvents')}
          >
            {settings.batchEvents ? 'Enabled' : 'Disabled'}
          </button>
        </div>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
          <div>
            <b>Flush Interval</b>
            <div className="muted" style={{ fontSize: '12px', marginTop: '4px' }}>
              Time in milliseconds before flushing batched events
            </div>
          </div>
          <input
            type="number"
            className="input"
            value={settings.flushInterval}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 5000
              setSettings((prev) => ({ ...prev, flushInterval: value }))
            }}
            style={{ width: '120px' }}
          />
        </div>
      </div>

      <div className="card" style={{ marginTop: '14px' }}>
        <b>Data Capture</b>
        <div className="hr" />
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
          <div>
            <b>Capture Request/Response Bodies</b>
            <div className="muted" style={{ fontSize: '12px', marginTop: '4px' }}>
              Include full request and response bodies in API traces
            </div>
          </div>
          <button
            className={`btn ${settings.captureBodies ? '' : 'secondary'}`}
            onClick={() => handleToggle('captureBodies')}
          >
            {settings.captureBodies ? 'Enabled' : 'Disabled'}
          </button>
        </div>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
          <div>
            <b>Mask Sensitive Data</b>
            <div className="muted" style={{ fontSize: '12px', marginTop: '4px' }}>
              Automatically mask sensitive fields (passwords, tokens, etc.)
            </div>
          </div>
          <button
            className={`btn ${settings.maskSensitiveData ? '' : 'secondary'}`}
            onClick={() => handleToggle('maskSensitiveData')}
          >
            {settings.maskSensitiveData ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: '14px' }}>
        <b>Feature Flags</b>
        <div className="hr" />
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
          <div>
            <b>API Tracking</b>
            <div className="muted" style={{ fontSize: '12px', marginTop: '4px' }}>
              Track API requests and responses
            </div>
          </div>
          <button
            className={`btn ${settings.apiTracking ? '' : 'secondary'}`}
            onClick={() => handleToggle('apiTracking')}
          >
            {settings.apiTracking ? 'Enabled' : 'Disabled'}
          </button>
        </div>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
          <div>
            <b>Screen Tracking</b>
            <div className="muted" style={{ fontSize: '12px', marginTop: '4px' }}>
              Track screen views and navigation
            </div>
          </div>
          <button
            className={`btn ${settings.screenTracking ? '' : 'secondary'}`}
            onClick={() => handleToggle('screenTracking')}
          >
            {settings.screenTracking ? 'Enabled' : 'Disabled'}
          </button>
        </div>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
          <div>
            <b>Crash Reporting</b>
            <div className="muted" style={{ fontSize: '12px', marginTop: '4px' }}>
              Capture and report application crashes
            </div>
          </div>
          <button
            className={`btn ${settings.crashReporting ? '' : 'secondary'}`}
            onClick={() => handleToggle('crashReporting')}
          >
            {settings.crashReporting ? 'Enabled' : 'Disabled'}
          </button>
        </div>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
          <div>
            <b>Logging</b>
            <div className="muted" style={{ fontSize: '12px', marginTop: '4px' }}>
              Capture application logs
            </div>
          </div>
          <button
            className={`btn ${settings.logging ? '' : 'secondary'}`}
            onClick={() => handleToggle('logging')}
          >
            {settings.logging ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      <div className="footerNote" style={{ marginTop: '14px' }}>
        Implementation: SDK settings control what data is captured and how it's sent. Changes are auditable and may require approval.
      </div>
    </div>
  )
}

