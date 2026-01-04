'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import ThemeToggle from '@/components/ThemeToggle'
import BarChart from '@/components/charts/BarChart'
import PieChart from '@/components/charts/PieChart'

// Migration Manager Component
function MigrationManager({ token }: { token: string | null }) {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [running, setRunning] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const loadStatus = useCallback(async () => {
    if (!token) return
    try {
      setLoading(true)
      const data = await api.admin.getMigrationStatus(token)
      setStatus(data)
      setMessage(null)
    } catch (error: any) {
      console.error('Error loading migration status:', error)
      setMessage(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (!token) return
    loadStatus()
  }, [token, loadStatus])

  const runMigrations = useCallback(async () => {
    if (!token) return
    if (!confirm('Are you sure you want to run database migrations? This will create missing tables and columns.')) {
      return
    }

    try {
      setRunning(true)
      setMessage('Running migrations...')
      const result = await api.admin.runMigrations(token)

      if (result.success) {
        setMessage(`✅ ${result.message}`)
        // Reload status after a short delay
        setTimeout(() => {
          loadStatus()
        }, 2000)
      } else {
        setMessage(`❌ ${result.message}: ${result.error || 'Unknown error'}`)
      }
    } catch (error: any) {
      console.error('Error running migrations:', error)
      setMessage(`❌ Error: ${error.message}`)
    } finally {
      setRunning(false)
    }
  }, [token, loadStatus])

  if (!status) {
    return (
      <button
        onClick={loadStatus}
        disabled={loading}
        className="btn secondary"
        style={{ fontSize: '12px' }}
      >
        {loading ? 'Loading...' : 'Check Migrations'}
      </button>
    )
  }

  const needsMigration = status.status === 'pending'

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={needsMigration ? runMigrations : loadStatus}
        disabled={running || loading}
        className="btn secondary"
        style={{
          fontSize: '12px',
          background: needsMigration ? 'var(--w)' : undefined,
          borderColor: needsMigration ? 'var(--w)' : undefined,
        }}
      >
        {running ? 'Running...' : needsMigration ? 'Run Migrations' : '✓ Migrations OK'}
      </button>

      {message && (
        <div className="card" style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', width: '384px', zIndex: 50 }}>
          <div style={{ fontSize: '12px', whiteSpace: 'pre-wrap', color: 'var(--t)' }}>{message}</div>
          {status.missingItems && status.missingItems.length > 0 && (
            <div className="muted" style={{ marginTop: '8px', fontSize: '11px' }}>
              Missing: {status.missingItems.join(', ')}
            </div>
          )}
          <button
            onClick={() => setMessage(null)}
            className="btn secondary"
            style={{ marginTop: '8px', fontSize: '11px', padding: '4px 8px' }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}

export default function AdminDashboardPage() {
  const { token } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [revenue, setRevenue] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [forecast, setForecast] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'forecast'>('overview')
  const [planFilter, setPlanFilter] = useState<string>('all')
  const [usageFilter, setUsageFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    if (!token) return

    Promise.all([
      api.admin.getStats(token).catch(() => null),
      api.admin.getRevenue(token).catch(() => null),
      api.admin.getAnalytics(token).catch(() => null),
      api.admin.getForecast(token).catch(() => null),
    ])
      .then(([statsData, revenueData, analyticsData, forecastData]) => {
        if (statsData) setStats(statsData.stats)
        if (revenueData) setRevenue(revenueData.revenue)
        if (analyticsData) setAnalytics(analyticsData.analytics)
        if (forecastData) setForecast(forecastData.forecast)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error loading admin dashboard data:', error)
        setLoading(false)
      })
  }, [token])

  if (loading) {
    return (
      <AppShell>
        <PageHeader
          title="Admin Dashboard"
          subtitle="Platform analytics, forecasting, and user management"
          dataMode="Admin"
          actions={<ThemeToggle />}
        />
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--m)' }}>
          Loading admin dashboard...
        </div>
      </AppShell>
    )
  }

  // Filter analytics data
  const filteredAtRiskUsers = analytics?.atRiskUsers?.filter((user: any) => {
    if (planFilter !== 'all' && user.planName !== planFilter) return false
    if (usageFilter === 'high' && user.highestUsage.percentage < 90) return false
    if (usageFilter === 'critical' && user.highestUsage.percentage < 100) return false
    return true
  }) || []

  const filteredAtLimitUsers = analytics?.atLimitUsers?.filter((user: any) => {
    if (planFilter !== 'all' && user.planName !== planFilter) return false
    return true
  }) || []

  const filteredConversionOpps = analytics?.conversionOpportunities?.filter((opp: any) => {
    if (planFilter !== 'all' && opp.currentPlan !== planFilter) return false
    if (usageFilter === 'high' && opp.usagePercentage < 90) return false
    return true
  }) || []

  // Pagination
  const totalPages = Math.ceil(Math.max(
    filteredAtRiskUsers.length,
    filteredAtLimitUsers.length,
    filteredConversionOpps.length
  ) / itemsPerPage)

  const paginatedAtRisk = filteredAtRiskUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const paginatedAtLimit = filteredAtLimitUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const paginatedOpps = filteredConversionOpps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <AppShell>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Platform analytics, forecasting, and user management"
        dataMode="Admin"
        actions={
          <>
            <ThemeToggle />
            <MigrationManager token={token} />
            <Link
              href="/admin/offers"
              className="btn secondary"
            >
              Manage Offers
            </Link>
          </>
        }
      />

      {/* Tabs */}
      <div className="card" style={{ marginTop: '18px' }}>
        <div className="tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={`tab ${activeTab === 'forecast' ? 'active' : ''}`}
          >
            Forecasting
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div style={{ marginTop: '14px' }}>
          {/* Key Metrics - Clean Grid */}
          <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            <MetricCard
              title="Total Users"
              value={stats?.users?.total || 0}
              subtitle={`${stats?.users?.active || 0} active`}
              link="/admin/users"
            />
            <MetricCard
              title="Active Subscriptions"
              value={stats?.users?.active || 0}
              subtitle={`${stats?.users?.expired || 0} expired`}
              link="/admin/subscriptions"
            />
            <MetricCard
              title="Total Revenue"
              value={`$${revenue?.totalRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
              subtitle="All time"
            />
            <MetricCard
              title="Registered Devices"
              value={stats?.platform?.devices?.toLocaleString() || 0}
              subtitle="Platform-wide"
            />
          </div>

          {/* Charts Row */}
          <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginTop: '14px' }}>
            {/* Plan Distribution Chart */}
            <div className="card">
              <b style={{ fontSize: '16px', marginBottom: '14px', display: 'block' }}>Plan Distribution</b>
              {analytics?.planDistribution && analytics.planDistribution.length > 0 ? (
                <BarChart
                  data={analytics.planDistribution.map((plan: any) => ({
                    label: plan.planDisplayName,
                    value: plan.count,
                    color: plan.planName === 'free' ? '#6b7280' : plan.planName === 'pro' ? '#3b82f6' : plan.planName === 'team' ? '#8b5cf6' : plan.planName === 'enterprise' ? '#ec4899' : '#3b82f6',
                  }))}
                  height={200}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--m)' }}>
                  No plan distribution data available
                </div>
              )}
            </div>

            {/* Usage Segmentation */}
            <div className="card">
              <b style={{ fontSize: '14px', marginBottom: '12px', display: 'block' }}>Devices Usage Segmentation</b>
              {analytics?.usageSegmentation?.devices && analytics.usageSegmentation.devices.length > 0 ? (
                <PieChart
                  data={analytics.usageSegmentation.devices.map((seg: any) => ({
                    label: seg.label,
                    value: seg.count,
                    color: seg.segment === 'exceeded' ? '#ef4444' : seg.segment === 'high' ? '#f59e0b' : seg.segment === 'medium' ? '#3b82f6' : '#10b981',
                  }))}
                  size={200}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--m)' }}>
                  No usage segmentation data available
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px', marginTop: '14px' }}>
            <Link href="/admin/users" className="card" style={{ textDecoration: 'none' }}>
              <div style={{ fontWeight: 700, color: 'var(--t)' }}>Users</div>
              <div className="muted" style={{ fontSize: '11px', marginTop: '4px' }}>Manage</div>
            </Link>
            <Link href="/admin/subscriptions" className="card" style={{ textDecoration: 'none' }}>
              <div style={{ fontWeight: 700, color: 'var(--t)' }}>Subscriptions</div>
              <div className="muted" style={{ fontSize: '11px', marginTop: '4px' }}>Manage</div>
            </Link>
            <Link href="/admin/plans" className="card" style={{ textDecoration: 'none' }}>
              <div style={{ fontWeight: 700, color: 'var(--t)' }}>Plans</div>
              <div className="muted" style={{ fontSize: '11px', marginTop: '4px' }}>Configure</div>
            </Link>
            <Link href="/admin/promo-codes" className="card" style={{ textDecoration: 'none' }}>
              <div style={{ fontWeight: 700, color: 'var(--t)' }}>Promo Codes</div>
              <div className="muted" style={{ fontSize: '11px', marginTop: '4px' }}>Manage</div>
            </Link>
            <Link href="/admin/offers" className="card" style={{ textDecoration: 'none' }}>
              <div style={{ fontWeight: 700, color: 'var(--t)' }}>Offers</div>
              <div className="muted" style={{ fontSize: '11px', marginTop: '4px' }}>Manage</div>
            </Link>
            <Link href="/admin/configurations" className="card" style={{ textDecoration: 'none' }}>
              <div style={{ fontWeight: 700, color: 'var(--t)' }}>Configurations</div>
              <div className="muted" style={{ fontSize: '11px', marginTop: '4px' }}>System Settings</div>
            </Link>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px', marginTop: '14px' }}>
            <Link href="/admin/revenue" className="card" style={{ textDecoration: 'none' }}>
              <div style={{ fontWeight: 700, color: 'var(--t)' }}>Revenue</div>
              <div className="muted" style={{ fontSize: '11px', marginTop: '4px' }}>View</div>
            </Link>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <AnalyticsView
          analytics={analytics}
          planFilter={planFilter}
          setPlanFilter={setPlanFilter}
          usageFilter={usageFilter}
          setUsageFilter={setUsageFilter}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          paginatedAtRisk={paginatedAtRisk}
          paginatedAtLimit={paginatedAtLimit}
          paginatedOpps={paginatedOpps}
          filteredAtRiskUsers={filteredAtRiskUsers}
          filteredAtLimitUsers={filteredAtLimitUsers}
          filteredConversionOpps={filteredConversionOpps}
        />
      )}

      {/* Forecast Tab */}
      {activeTab === 'forecast' && (
        <ForecastView forecast={forecast} />
      )}
    </AppShell>
  )
}

function MetricCard({ title, value, subtitle, link }: { title: string; value: string | number; subtitle?: string; link?: string }) {
  const content = (
    <div className="card" style={{ cursor: link ? 'pointer' : 'default' }}>
      <div className="muted" style={{ fontSize: '12px', marginBottom: '4px' }}>{title}</div>
      <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--t)', marginBottom: '4px' }}>{value}</div>
      {subtitle && <div className="muted" style={{ fontSize: '11px' }}>{subtitle}</div>}
    </div>
  )

  if (link) {
    return <Link href={link} style={{ textDecoration: 'none' }}>{content}</Link>
  }

  return content
}

function AnalyticsView({
  analytics,
  planFilter,
  setPlanFilter,
  usageFilter,
  setUsageFilter,
  currentPage,
  setCurrentPage,
  totalPages,
  paginatedAtRisk,
  paginatedAtLimit,
  paginatedOpps,
  filteredAtRiskUsers,
  filteredAtLimitUsers,
  filteredConversionOpps,
}: any) {
  const [activeSection, setActiveSection] = useState<'atRisk' | 'atLimit' | 'conversions'>('atRisk')

  if (!analytics) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ color: 'var(--m)' }}>No analytics data available</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Summary Metrics */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        <MetricCard
          title="Total Active"
          value={analytics.summary?.totalActiveSubscriptions || 0}
        />
        <MetricCard
          title="At Risk (80%+)"
          value={analytics.summary?.usersAtRisk || 0}
          subtitle={`${analytics.summary?.totalActiveSubscriptions > 0 ? ((analytics.summary.usersAtRisk / analytics.summary.totalActiveSubscriptions) * 100).toFixed(1) : 0}% of users`}
        />
        <MetricCard
          title="At Limit (100%+)"
          value={analytics.summary?.usersAtLimit || 0}
          subtitle={`${analytics.summary?.totalActiveSubscriptions > 0 ? ((analytics.summary.usersAtLimit / analytics.summary.totalActiveSubscriptions) * 100).toFixed(1) : 0}% of users`}
        />
        <MetricCard
          title="Conversion Opportunities"
          value={analytics.summary?.conversionOpportunities || 0}
        />
      </div>

      {/* Charts */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginTop: '14px' }}>
        {/* Plan Distribution */}
        <div className="card">
          <b style={{ fontSize: '14px', marginBottom: '12px', display: 'block' }}>Plan Distribution</b>
          {analytics.planDistribution && analytics.planDistribution.length > 0 ? (
            <BarChart
              data={analytics.planDistribution.map((plan: any) => ({
                label: plan.planDisplayName,
                value: plan.count,
                color: plan.planName === 'free' ? '#6b7280' : plan.planName === 'pro' ? '#3b82f6' : plan.planName === 'team' ? '#8b5cf6' : plan.planName === 'enterprise' ? '#ec4899' : '#3b82f6',
              }))}
              height={200}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--m)' }}>
              No plan distribution data available
            </div>
          )}
        </div>

        {/* Usage Segmentation - API Traces */}
        <div className="card">
          <b style={{ fontSize: '14px', marginBottom: '12px', display: 'block' }}>API Traces Usage</b>
          {analytics.usageSegmentation?.apiTraces && analytics.usageSegmentation.apiTraces.length > 0 ? (
            <PieChart
              data={analytics.usageSegmentation.apiTraces.map((seg: any) => ({
                label: seg.label.split('(')[0].trim(),
                value: seg.count,
                color: seg.segment === 'exceeded' ? '#ef4444' : seg.segment === 'high' ? '#f59e0b' : seg.segment === 'medium' ? '#3b82f6' : '#10b981',
              }))}
              size={200}
            />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--m)' }}>
                  No usage segmentation data available
                </div>
              )}
        </div>
      </div>

      {/* Filters and Section Tabs */}
      <div className="card" style={{ marginTop: '14px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '14px' }}>
          <div className="tabs">
            <button
              onClick={() => {
                setActiveSection('atRisk')
                setCurrentPage(1)
              }}
              className={`tab ${activeSection === 'atRisk' ? 'active' : ''}`}
            >
              At Risk ({filteredAtRiskUsers.length})
            </button>
            <button
              onClick={() => {
                setActiveSection('atLimit')
                setCurrentPage(1)
              }}
              className={`tab ${activeSection === 'atLimit' ? 'active' : ''}`}
            >
              At Limit ({filteredAtLimitUsers.length})
            </button>
            <button
              onClick={() => {
                setActiveSection('conversions')
                setCurrentPage(1)
              }}
              className={`tab ${activeSection === 'conversions' ? 'active' : ''}`}
            >
              Conversions ({filteredConversionOpps.length})
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="select"
            >
              <option value="all">All Plans</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="team">Team</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <select
              value={usageFilter}
              onChange={(e) => {
                setUsageFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="select"
            >
              <option value="all">All Usage</option>
              <option value="high">High (90%+)</option>
              <option value="critical">Critical (100%+)</option>
            </select>
          </div>
        </div>

        {/* At Risk Users Table */}
        {activeSection === 'atRisk' && (
          <div>
            <DataTable
              data={paginatedAtRisk.map((user: any) => ({ ...user, id: user.userId }))}
              columns={[
                {
                  key: 'user',
                  label: 'User',
                  render: (user: any) => <b>{user.email}</b>,
                },
                {
                  key: 'plan',
                  label: 'Plan',
                  render: (user: any) => <span className="muted" style={{ textTransform: 'capitalize' }}>{user.planName}</span>,
                },
                {
                  key: 'usage',
                  label: 'Highest Usage',
                  render: (user: any) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <b style={{ fontSize: '12px' }}>{user.highestUsage.percentage.toFixed(1)}%</b>
                      <div style={{ width: '96px', background: 'var(--s2)', borderRadius: '999px', height: '8px' }}>
                        <div
                          style={{
                            height: '8px',
                            borderRadius: '999px',
                            background: user.highestUsage.percentage >= 100
                              ? 'var(--d)'
                              : user.highestUsage.percentage >= 90
                              ? 'var(--w)'
                              : 'var(--p)',
                            width: `${Math.min(100, user.highestUsage.percentage)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'meters',
                  label: 'Meters',
                  render: (user: any) => (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {Object.entries(user.allMeters).slice(0, 2).map(([key, meter]: [string, any]) => (
                        <span
                          key={key}
                          className="chip"
                          style={{
                            borderColor: meter.percentage >= 100
                              ? 'var(--d)'
                              : meter.percentage >= 80
                              ? 'var(--w)'
                              : undefined,
                            color: meter.percentage >= 100
                              ? 'var(--d)'
                              : meter.percentage >= 80
                              ? 'var(--w)'
                              : undefined,
                            fontSize: '11px',
                            padding: '4px 8px',
                          }}
                        >
                          {key}: {meter.percentage.toFixed(0)}%
                        </span>
                      ))}
                      {Object.keys(user.allMeters).length > 2 && (
                        <span className="muted" style={{ fontSize: '11px' }}>+{Object.keys(user.allMeters).length - 2}</span>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'action',
                  label: 'Action',
                  render: (user: any) => (
                    <Link
                      href={`/admin/subscriptions?user=${user.userId}`}
                      style={{ color: 'var(--p)', textDecoration: 'none', fontSize: '11px' }}
                    >
                      View →
                    </Link>
                  ),
                },
              ]}
              loading={false}
              emptyMessage="No users found matching filters"
              footerNote={`Showing ${(currentPage - 1) * 10 + 1} to ${Math.min(currentPage * 10, filteredAtRiskUsers.length)} of ${filteredAtRiskUsers.length}`}
              pagination={{
                currentPage,
                totalPages,
                onPageChange: setCurrentPage,
              }}
            />
          </div>
        )}

        {/* At Limit Users Table */}
        {activeSection === 'atLimit' && (
          <div>
            <DataTable
              data={paginatedAtLimit.map((user: any) => ({ ...user, id: user.userId }))}
              columns={[
                {
                  key: 'user',
                  label: 'User',
                  render: (user: any) => <b>{user.email}</b>,
                },
                {
                  key: 'plan',
                  label: 'Plan',
                  render: (user: any) => <span className="muted" style={{ textTransform: 'capitalize' }}>{user.planName}</span>,
                },
                {
                  key: 'meters',
                  label: 'Exceeded Meters',
                  render: (user: any) => (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {user.exceededMeters.map((meter: string) => (
                        <span
                          key={meter}
                          className="chip"
                          style={{ borderColor: 'var(--d)', color: 'var(--d)', fontSize: '11px', padding: '4px 8px' }}
                        >
                          {meter}
                        </span>
                      ))}
                    </div>
                  ),
                },
                {
                  key: 'action',
                  label: 'Action',
                  render: (user: any) => (
                    <Link
                      href={`/admin/subscriptions?user=${user.userId}`}
                      style={{ color: 'var(--p)', textDecoration: 'none', fontSize: '11px' }}
                    >
                      View →
                    </Link>
                  ),
                },
              ]}
              loading={false}
              emptyMessage="No users found matching filters"
              footerNote={`Showing ${(currentPage - 1) * 10 + 1} to ${Math.min(currentPage * 10, filteredAtLimitUsers.length)} of ${filteredAtLimitUsers.length}`}
              pagination={{
                currentPage,
                totalPages,
                onPageChange: setCurrentPage,
              }}
            />
          </div>
        )}

        {/* Conversion Opportunities Table */}
        {activeSection === 'conversions' && (
          <div>
            <DataTable
              data={paginatedOpps.map((opp: any) => ({ ...opp, id: opp.userId }))}
              columns={[
                {
                  key: 'user',
                  label: 'User',
                  render: (opp: any) => <b>{opp.email}</b>,
                },
                {
                  key: 'currentPlan',
                  label: 'Current Plan',
                  render: (opp: any) => <span className="muted" style={{ textTransform: 'capitalize' }}>{opp.currentPlan}</span>,
                },
                {
                  key: 'recommended',
                  label: 'Recommended',
                  render: (opp: any) => (
                    <b style={{ color: 'var(--a)', textTransform: 'capitalize' }}>{opp.recommendedPlan}</b>
                  ),
                },
                {
                  key: 'usage',
                  label: 'Usage',
                  render: (opp: any) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <b style={{ fontSize: '12px' }}>{opp.usagePercentage.toFixed(1)}%</b>
                      <div style={{ width: '96px', background: 'var(--s2)', borderRadius: '999px', height: '8px' }}>
                        <div
                          style={{
                            height: '8px',
                            borderRadius: '999px',
                            background: 'var(--w)',
                            width: `${Math.min(100, opp.usagePercentage)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'action',
                  label: 'Action',
                  render: (opp: any) => (
                    <Link
                      href={`/admin/subscriptions?user=${opp.userId}`}
                      style={{ color: 'var(--p)', textDecoration: 'none', fontSize: '11px' }}
                    >
                      View →
                    </Link>
                  ),
                },
              ]}
              loading={false}
              emptyMessage="No opportunities found matching filters"
              footerNote={`Showing ${(currentPage - 1) * 10 + 1} to ${Math.min(currentPage * 10, filteredConversionOpps.length)} of ${filteredConversionOpps.length}`}
              pagination={{
                currentPage,
                totalPages,
                onPageChange: setCurrentPage,
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function ForecastView({ forecast }: { forecast: any }) {
  if (!forecast) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ color: 'var(--m)' }}>No forecast data available</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Key Forecast Metrics */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        <MetricCard
          title="Current MRR"
          value={`$${forecast.revenueForecast?.currentMRR?.toFixed(2) || '0.00'}`}
        />
        <MetricCard
          title="Potential MRR"
          value={`$${forecast.revenueForecast?.potentialMRR?.toFixed(2) || '0.00'}`}
        />
        <MetricCard
          title="Growth Potential"
          value={`$${forecast.revenueForecast?.growthPotential?.toFixed(2) || '0.00'}`}
        />
        <MetricCard
          title="Churn Risk MRR"
          value={`$${forecast.revenueForecast?.churnRiskMRR?.toFixed(2) || '0.00'}`}
        />
      </div>

      {/* Churn Risk Chart */}
      <div className="card">
        <b style={{ fontSize: '16px', marginBottom: '14px', display: 'block' }}>Churn Risk Distribution</b>
        {forecast?.churnRisk ? (
          <BarChart
            data={[
              { label: 'High Risk', value: forecast.churnRisk.high || 0, color: '#ef4444' },
              { label: 'Medium Risk', value: forecast.churnRisk.medium || 0, color: '#f59e0b' },
              { label: 'Low Risk', value: forecast.churnRisk.low || 0, color: '#10b981' },
            ]}
            height={200}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--m)' }}>
            No churn risk data available
          </div>
        )}
      </div>

      {/* Revenue Forecast */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
        <div className="card">
          <b style={{ fontSize: '16px', marginBottom: '14px', display: 'block' }}>Conversion Forecast</b>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="muted">Opportunities</span>
              <b>{forecast.conversionForecast?.opportunities || 0}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="muted">Estimated Conversions</span>
              <b style={{ color: 'var(--a)' }}>{forecast.conversionForecast?.estimatedConversions || 0}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="muted">Conversion Rate</span>
              <b>{forecast.conversionForecast?.conversionRate?.toFixed(1) || 0}%</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid var(--b)' }}>
              <span className="muted">Estimated Revenue</span>
              <b style={{ color: 'var(--p)', fontSize: '16px' }}>
                ${forecast.conversionForecast?.estimatedRevenue?.toFixed(2) || '0.00'}/mo
              </b>
            </div>
          </div>
        </div>

        <div className="card">
          <b style={{ fontSize: '16px', marginBottom: '14px', display: 'block' }}>Usage Trends</b>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="muted">Average Usage</span>
              <b>{forecast.usageTrends?.averageUsageGrowth?.toFixed(1) || 0}%</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="muted">Approaching Limits</span>
              <b style={{ color: 'var(--w)' }}>{forecast.usageTrends?.usersApproachingLimits || 0}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid var(--b)' }}>
              <span className="muted">Projected Churn</span>
              <b style={{ color: 'var(--d)', fontSize: '16px' }}>{forecast.usageTrends?.projectedChurn || 0}</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
