'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'
import { api } from '@/lib/api'

interface UsageData {
    current: number
    limit: number
    percentage: number
}

export default function UsagePill({ projectId }: { projectId?: string }) {
    const router = useRouter()
    const { token } = useAuth()
    const [usage, setUsage] = useState<UsageData | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchUsage = useCallback(async () => {
        if (!token || !projectId) {
            setLoading(false)
            return
        }

        try {
            const response = await fetch(`/api/projects/${projectId}/devices/summary?${new URLSearchParams({ projectId })}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            })

            if (response.ok) {
                const data = await response.json()
                setUsage({
                    current: data.summary?.total || 0,
                    limit: data.usageLimit || 10000,
                    percentage: data.usagePercentage || 0,
                })
            }
        } catch (error) {
            console.error('Failed to fetch usage:', error)
        } finally {
            setLoading(false)
        }
    }, [token, projectId])

    useEffect(() => {
        fetchUsage()
        // Refresh every 60 seconds
        const interval = setInterval(fetchUsage, 60000)
        return () => clearInterval(interval)
    }, [fetchUsage])

    if (loading || !usage) return null

    const { current, limit, percentage } = usage

    // Determine color based on threshold
    const getColor = () => {
        if (percentage >= 100) return { bg: '#ef4444', text: '#fff' } // Red
        if (percentage >= 90) return { bg: '#f97316', text: '#fff' } // Orange
        if (percentage >= 80) return { bg: '#eab308', text: '#000' } // Yellow
        return { bg: '#22c55e', text: '#fff' } // Green
    }

    const colors = getColor()

    const formatNumber = (num: number) => {
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
        return num.toString()
    }

    return (
        <button
            onClick={() => router.push('/subscription?tab=usage')}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                background: colors.bg,
                color: colors.text,
                borderRadius: '12px',
                border: 'none',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
            }}
            title="Click to view detailed usage"
        >
            <svg
                style={{ width: '16px', height: '16px' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
            </svg>
            <span>
                {formatNumber(current)} / {formatNumber(limit)}
            </span>
            {percentage >= 80 && (
                <svg
                    style={{ width: '14px', height: '14px' }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                    />
                </svg>
            )}
        </button>
    )
}

