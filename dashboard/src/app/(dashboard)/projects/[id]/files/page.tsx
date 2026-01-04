'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import ThemeToggle from '@/components/ThemeToggle'
import DataTable, { Column } from '@/components/DataTable'
import FilterBar, { FilterItem } from '@/components/FilterBar'

type File = {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploadedAt: string
  uploadedBy: string
  usedBy: 'config' | 'localization' | 'other'
}

export default function FilesPage() {
  const params = useParams()
  const { token } = useAuth()
  const projectId = params?.id as string

  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
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

  const fetchFiles = useCallback(async () => {
    if (!token || !projectId) return
    try {
      setLoading(true)
      // TODO: Implement files API
      setFiles([])
    } catch (error) {
      console.error('Failed to fetch files:', error)
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
      fetchFiles()
    }
  }, [token, projectId, fetchProject, fetchFiles, projectName])

  // Style constants
  const ACTION_BUTTON_STYLE: React.CSSProperties = { padding: '7px 10px', fontSize: '11px' }
  const ACTION_CONTAINER_STYLE: React.CSSProperties = { display: 'flex', gap: '8px', flexWrap: 'wrap' }

  // Memoize helper function
  const formatFileSize = useCallback((bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }, [])

  // Memoize computed stats
  const totalSize = useMemo(() => formatFileSize(files.reduce((sum, f) => sum + f.size, 0)), [files, formatFileSize])

  // Memoize filter array
  const filterItems = useMemo<FilterItem[]>(() => [
    {
      type: 'search',
      placeholder: 'Search file name / type',
    },
    {
      type: 'select',
      options: [
        { value: 'all', label: 'Type: All' },
        { value: 'image', label: 'Images' },
        { value: 'document', label: 'Documents' },
      ],
    },
    {
      type: 'select',
      options: [
        { value: 'all', label: 'Used By: All' },
        { value: 'config', label: 'Config' },
        { value: 'localization', label: 'Localization' },
      ],
    },
    { type: 'button', label: 'More Filters', className: 'secondary' },
  ], [])

  // Memoize stats array
  const statsItems = useMemo(() => [
    { label: 'Total files', value: files.length },
    { label: 'Total size', value: totalSize },
    { label: 'Storage used', value: '45%' },
  ], [files.length, totalSize])

  // Memoize column definitions
  const fileColumns = useMemo<Column<File>[]>(() => [
    {
      key: 'name',
      label: 'File',
      render: (file) => (
        <>
          <b>{file.name}</b>
          <div className="muted" style={{ fontSize: '11px' }}>
            {file.type}
          </div>
        </>
      ),
    },
    { key: 'size', label: 'Size', render: (file) => formatFileSize(file.size) },
    {
      key: 'usedBy',
      label: 'Used By',
      render: (file) => (
        <span className="chip">
          {file.usedBy === 'config' ? 'Config' : file.usedBy === 'localization' ? 'Localization' : 'Other'}
        </span>
      ),
    },
    {
      key: 'uploadedAt',
      label: 'Uploaded',
      render: (file) => (
        <span className="muted">{new Date(file.uploadedAt).toLocaleDateString()}</span>
      ),
    },
    { key: 'uploadedBy', label: 'Uploaded By', render: (file) => file.uploadedBy },
    {
      key: 'actions',
      label: 'Actions',
      render: (file) => (
        <div style={ACTION_CONTAINER_STYLE}>
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn secondary"
            style={ACTION_BUTTON_STYLE}
            onClick={(e) => e.stopPropagation()}
          >
            View
          </a>
          <button
            className="btn secondary"
            style={ACTION_BUTTON_STYLE}
            onClick={(e) => {
              e.stopPropagation()
              // TODO: Delete file
            }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ], [formatFileSize])

  // Memoize handlers
  const handleRowClick = useCallback((file: File) => {
    // TODO: Open file preview drawer
    console.log('Open file:', file.id)
  }, [])

  return (
    <AppShell projectId={projectId} projectName={projectName}>
      <PageHeader
        title="Files"
        subtitle="Uploaded files used by Config/Localization (images, screenshots). Includes retention and access control."
        dataMode="Dev"
        actions={
          <>
            <ThemeToggle />
            <button className="btn" onClick={() => {}}>
              Upload File
            </button>
          </>
        }
      />

      {/* Note Section */}
      <div className="note" style={{ marginTop: '18px' }}>
        <b>File storage</b>
        <div className="muted" style={{ marginTop: '6px' }}>
          Used for localization screenshots, config images, and diagnostics attachments.
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar filters={filterItems} stats={statsItems} />

      {/* Files Table */}
      <DataTable
        data={files}
        columns={fileColumns}
        loading={loading}
        emptyMessage="No files found"
        onRowClick={handleRowClick}
        footerNote="Implementation: Files are used by Config and Localization. Retention policies apply based on plan."
      />
    </AppShell>
  )
}

