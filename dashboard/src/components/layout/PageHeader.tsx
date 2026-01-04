'use client'

import React from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  dataMode?: 'Aggregated' | 'Raw' | 'Live'
  environment?: string
}

export default function PageHeader({
  title,
  subtitle,
  actions,
  dataMode,
  environment = 'Production',
}: PageHeaderProps) {
  return (
    <div
      className="title"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '16px',
        flexWrap: 'wrap'
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <b style={{ fontSize: '16px', display: 'block', color: 'var(--t)', marginBottom: '4px' }}>
          {title}
        </b>
        {subtitle && (
          <span style={{ fontSize: '12px', color: 'var(--m)', display: 'block' }}>
            {subtitle}
          </span>
        )}
      </div>
      <div
        className="actions"
        style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}
      >
        {dataMode && (
          <span
            className="pill"
            style={{
              padding: '8px 10px',
              border: '1px solid var(--b)',
              borderRadius: '999px',
              background: 'var(--s)',
              fontSize: '12px',
              color: 'var(--m)'
            }}
          >
            Mode: <b style={{ color: 'var(--t)' }}>{dataMode}</b>
          </span>
        )}
        {environment && (
          <span
            className="pill"
            style={{
              padding: '8px 10px',
              border: '1px solid var(--b)',
              borderRadius: '999px',
              background: 'var(--s)',
              fontSize: '12px',
              color: 'var(--m)'
            }}
          >
            Env: {environment}
          </span>
        )}
        {actions}
      </div>
    </div>
  )
}

