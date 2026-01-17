'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import PageHeader from '@/components/layout/PageHeader'
import ThemeToggle from '@/components/ThemeToggle'
import DataTable, { Column } from '@/components/DataTable'
import FilterBar, { FilterItem } from '@/components/FilterBar'

type LocalizationKey = {
  id: string
  key: string
  description: string | null
  category: string | null
  platform: string | null
  translations: Array<{
    id: string
    value: string
    isReviewed: boolean
    language: {
      id: string
      code: string
      name: string
    }
  }>
}

export default function LocalizationPage() {
  const params = useParams()
  const { token } = useAuth()
  const projectId = params?.id as string

  const [keys, setKeys] = useState<LocalizationKey[]>([])
  const [languages, setLanguages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [projectName, setProjectName] = useState('')

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

  const fetchLanguages = useCallback(async () => {
    if (!token || !projectId) return
    try {
      const response = await api.localization.getLanguages(projectId, token)
      setLanguages(response.languages || [])
    } catch (error) {
      console.error('Failed to fetch languages:', error)
    }
  }, [token, projectId])

  const fetchKeys = useCallback(async () => {
    if (!token || !projectId) return
    try {
      setLoading(true)
      const response = await api.localization.getKeys(projectId, token)
      setKeys(response.keys || [])
      setTotalPages(Math.ceil((response.keys?.length || 0) / 20))
    } catch (error) {
      console.error('Failed to fetch keys:', error)
    } finally {
      setLoading(false)
    }
  }, [token, projectId])

  useEffect(() => {
    if (token && projectId) {
      // Only fetch project name once on mount
      if (!projectName) {
        fetchProject()
      }
      // Languages don't change often, fetch once
      if (languages.length === 0) {
        fetchLanguages()
      }
      fetchKeys()
    }
  }, [token, projectId, fetchProject, fetchLanguages, fetchKeys, projectName, languages.length])

  // Style constants
  const ACTION_BUTTON_STYLE: React.CSSProperties = { padding: '7px 10px', fontSize: '11px' }

  // Memoize filter array (depends on languages)
  const filterItems = useMemo<FilterItem[]>(() => [
    {
      type: 'search',
      placeholder: 'Search key / value / category',
      value: searchQuery,
      onChange: setSearchQuery,
    },
    {
      type: 'select',
      options: [
        { value: 'all', label: 'Language: All' },
        ...languages.map((lang) => ({ value: lang.code, label: lang.code })),
      ],
    },
    {
      type: 'select',
      options: [
        { value: 'all', label: 'Status: All' },
        { value: 'missing', label: 'Missing' },
        { value: 'reviewed', label: 'Reviewed' },
        { value: 'unreviewed', label: 'Unreviewed' },
      ],
    },
    {
      type: 'select',
      options: [
        { value: 'all', label: 'Platform: All' },
        { value: 'ios', label: 'iOS' },
        { value: 'android', label: 'Android' },
        { value: 'web', label: 'Web' },
      ],
    },
    { type: 'button', label: 'Import', className: 'secondary' },
    { type: 'button', label: 'Export', className: 'secondary' },
  ], [searchQuery, languages])

  // Memoize column definitions
  const keyColumns = useMemo<Column<LocalizationKey>[]>(() => [
    {
      key: 'key',
      label: 'Key',
      render: (key) => (
        <>
          <b>{key.key}</b>
          {key.description && (
            <div className="muted" style={{ fontSize: '11px' }}>
              {key.description}
            </div>
          )}
        </>
      ),
    },
    { key: 'category', label: 'Category', render: (key) => key.category || '—' },
    {
      key: 'translations',
      label: 'Translations',
      render: (key) => (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {key.translations?.map((t) => (
            <span key={t.id} className="chip" style={{ fontSize: '10px' }}>
              {t.language.code}: {t.value.slice(0, 20)}
              {t.value.length > 20 ? '...' : ''}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (key) => (
        <button
          className="btn secondary"
          style={ACTION_BUTTON_STYLE}
          onClick={(e) => {
            e.stopPropagation()
            // TODO: Edit key
          }}
        >
          Edit
        </button>
      ),
    },
  ], [])

  // Memoize handlers
  const handleRowClick = useCallback((key: LocalizationKey) => {
    // TODO: Open key detail drawer
    console.log('Open key:', key.id)
  }, [])

  const paginationConfig = useMemo(() => totalPages > 1 ? {
    currentPage: page,
    totalPages,
    onPageChange: setPage,
  } : undefined, [totalPages, page])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Localization"
        subtitle="Control Plane. Manage languages, keys, translations, review workflow, and export formats."
        dataMode="CP"
        actions={
          <>
            <ThemeToggle />
            <button className="btn" onClick={() => {}}>
              New Key
            </button>
          </>
        }
      />

      {/* Quota Warning */}
      <div
        className="dangerBox"
        style={{
          marginTop: '18px',
          borderLeft: '4px solid var(--d)',
          padding: '10px 12px',
          borderRadius: '12px',
          background: 'linear-gradient(180deg, var(--s), var(--s2))',
          border: '1px solid var(--b)',
        }}
      >
        <b>Quota critical: Localization Keys 93%</b>
        <div className="muted" style={{ marginTop: '6px' }}>
          Keys: <b>9,300 / 10,000</b>. Consider archiving unused keys or upgrading retention/quota.
        </div>
        <div className="row" style={{ marginTop: '10px' }}>
          <a href={`/projects/${projectId}/billing`} className="btn secondary">
            Billing & usage
          </a>
          <button className="btn" onClick={() => {}}>
            Upgrade
          </button>
        </div>
        <div style={{ marginTop: '10px' }} className="progress">
          <div className="bar bad" style={{ width: '93%', height: '100%', background: 'var(--d)', borderRadius: '999px' }} />
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar filters={filterItems} />

      {/* Keys Table */}
      <div className="grid" style={{ marginTop: '14px' }}>
        <div className="card" style={{ gridColumn: 'span 8' }}>
          <b>Localization Keys</b>
          <DataTable
            data={keys}
            columns={keyColumns}
            loading={loading}
            emptyMessage="No keys found"
            onRowClick={handleRowClick}
            pagination={paginationConfig}
          />
        </div>
        <div className="card" style={{ gridColumn: 'span 4' }}>
          <b>Languages</b>
          <div className="hr" />
          {languages.map((lang) => (
            <div key={lang.id} className="row" style={{ marginTop: '8px' }}>
              <span className="chip">
                {lang.code} - {lang.name}
                {lang.isDefault && <span style={{ marginLeft: '4px', color: 'var(--a)' }}>•</span>}
              </span>
            </div>
          ))}
          <button className="btn secondary" style={{ marginTop: '12px', width: '100%' }}>
            Add Language
          </button>
        </div>
      </div>
    </div>
  )
}

