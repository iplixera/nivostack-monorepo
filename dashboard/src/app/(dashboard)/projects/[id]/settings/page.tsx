'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import PageHeader from '@/components/layout/PageHeader'
import ThemeToggle from '@/components/ThemeToggle'

export default function ProjectSettingsPage() {
  const params = useParams()
  const { token } = useAuth()
  const projectId = params?.id as string

  const [projectName, setProjectName] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [settings, setSettings] = useState({
    name: '',
    retentionDays: 7,
    captureBodies: true,
    maskSensitiveData: true,
  })

  const fetchProject = useCallback(async () => {
    if (!token || !projectId) return
    try {
      const data = await api.projects.list(token)
      const project = data.projects?.find(p => p.id === projectId)
      if (project) {
        setProjectName(project.name)
        setSettings((prev) => ({ ...prev, name: project.name }))
        setApiKey(project.apiKey)
      }
    } catch (error) {
      console.error('Failed to fetch project:', error)
    }
  }, [token, projectId])

  useEffect(() => {
    if (token && projectId) {
      fetchProject()
    }
  }, [token, projectId, fetchProject])

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((prev) => ({ ...prev, name: e.target.value }))
  }, [])

  const handleCaptureBodiesToggle = useCallback(() => {
    setSettings((prev) => ({ ...prev, captureBodies: !prev.captureBodies }))
  }, [])

  const handleMaskSensitiveDataToggle = useCallback(() => {
    setSettings((prev) => ({ ...prev, maskSensitiveData: !prev.maskSensitiveData }))
  }, [])

  const handleRetentionChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings((prev) => ({ ...prev, retentionDays: parseInt(e.target.value) }))
  }, [])

  const handleDeleteProject = useCallback(() => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      // TODO: Delete project
    }
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Settings"
        subtitle="API keys, environments, security, data capture policies, retention, and feature toggles."
        dataMode="Org"
        actions={
          <>
            <ThemeToggle />
            <button className="btn" onClick={() => {}}>
              Save Changes
            </button>
          </>
        }
      />

      {/* Project Identity */}
      <div className="card" style={{ marginTop: '18px' }}>
        <b>Project Identity</b>
        <div className="hr" />
        <div className="row" style={{ marginTop: '12px', flexWrap: 'wrap', gap: '12px' }}>
          <input
            className="input"
            value={settings.name}
            onChange={handleNameChange}
            placeholder="Project name"
            style={{ flex: 1, minWidth: '200px' }}
          />
          <input
            className="input mono"
            value={apiKey}
            readOnly
            style={{ flex: 1, minWidth: '200px', fontFamily: 'ui-monospace' }}
          />
          <button
            className="btn secondary"
            onClick={() => {
              // TODO: Regenerate API key
            }}
          >
            Regenerate
          </button>
        </div>
      </div>

      {/* Data Capture Policies */}
      <div className="card" style={{ marginTop: '14px' }}>
        <b>Data Capture Policies</b>
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
            onClick={handleCaptureBodiesToggle}
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
            onClick={handleMaskSensitiveDataToggle}
          >
            {settings.maskSensitiveData ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      {/* Retention */}
      <div className="card" style={{ marginTop: '14px' }}>
        <b>Data Retention</b>
        <div className="hr" />
        <div className="row" style={{ marginTop: '12px', alignItems: 'center', gap: '12px' }}>
          <span>Retention Period:</span>
          <select
            className="select"
            value={settings.retentionDays}
            onChange={handleRetentionChange}
          >
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
            <option value={365}>1 year</option>
          </select>
          <span className="muted" style={{ fontSize: '12px' }}>
            Data older than this will be automatically deleted
          </span>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card" style={{ marginTop: '14px', borderColor: 'var(--d)' }}>
        <b style={{ color: 'var(--d)' }}>Danger Zone</b>
        <div className="hr" />
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
          <div>
            <b>Delete Project</b>
            <div className="muted" style={{ fontSize: '12px', marginTop: '4px' }}>
              Permanently delete this project and all its data. This action cannot be undone.
            </div>
          </div>
          <button
            className="btn"
            style={{ background: 'var(--d)', color: 'white' }}
            onClick={handleDeleteProject}
          >
            Delete Project
          </button>
        </div>
      </div>
    </div>
  )
}

