'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import Link from 'next/link'
import BarChart from '@/components/charts/BarChart'
import PieChart from '@/components/charts/PieChart'
import LineChart from '@/components/charts/LineChart'

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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading admin dashboard...</div>
      </div>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Platform analytics, forecasting, and user management</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/offers"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
          >
            Manage Offers
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'forecast'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Forecasting
          </button>
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics - Clean Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Plan Distribution Chart */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Plan Distribution</h3>
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
                <div className="flex items-center justify-center h-[200px] text-gray-400">
                  No plan distribution data available
                </div>
              )}
            </div>

            {/* Usage Segmentation */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Devices Usage Segmentation</h3>
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
                <div className="flex items-center justify-center h-[200px] text-gray-400">
                  No usage segmentation data available
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Link
              href="/admin/users"
              className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors border border-gray-800"
            >
              <div className="text-sm font-medium text-white">Users</div>
              <div className="text-xs text-gray-400 mt-1">Manage</div>
            </Link>
            <Link
              href="/admin/subscriptions"
              className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors border border-gray-800"
            >
              <div className="text-sm font-medium text-white">Subscriptions</div>
              <div className="text-xs text-gray-400 mt-1">Manage</div>
            </Link>
            <Link
              href="/admin/plans"
              className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors border border-gray-800"
            >
              <div className="text-sm font-medium text-white">Plans</div>
              <div className="text-xs text-gray-400 mt-1">Configure</div>
            </Link>
            <Link
              href="/admin/promo-codes"
              className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors border border-gray-800"
            >
              <div className="text-sm font-medium text-white">Promo Codes</div>
              <div className="text-xs text-gray-400 mt-1">Manage</div>
            </Link>
            <Link
              href="/admin/offers"
              className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors border border-gray-800"
            >
              <div className="text-sm font-medium text-white">Offers</div>
              <div className="text-xs text-gray-400 mt-1">Manage</div>
            </Link>
            <Link
              href="/admin/configurations"
              className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors border border-gray-800"
            >
              <div className="text-sm font-medium text-white">Configurations</div>
              <div className="text-xs text-gray-400 mt-1">System Settings</div>
            </Link>
            <Link
              href="/admin/revenue"
              className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors border border-gray-800"
            >
              <div className="text-sm font-medium text-white">Revenue</div>
              <div className="text-xs text-gray-400 mt-1">View</div>
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
    </div>
  )
}

function MetricCard({ title, value, subtitle, link }: { title: string; value: string | number; subtitle?: string; link?: string }) {
  const content = (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors">
      <div className="text-sm text-gray-400 mb-1">{title}</div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
    </div>
  )

  if (link) {
    return <Link href={link}>{content}</Link>
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">No analytics data available</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Distribution */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Plan Distribution</h3>
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
            <div className="flex items-center justify-center h-[200px] text-gray-400">
              No plan distribution data available
            </div>
          )}
        </div>

        {/* Usage Segmentation - API Traces */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">API Traces Usage</h3>
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
            <div className="flex items-center justify-center h-[200px] text-gray-400">
              No usage segmentation data available
            </div>
          )}
        </div>
      </div>

      {/* Filters and Section Tabs */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex gap-2 border-b border-gray-800">
            <button
              onClick={() => {
                setActiveSection('atRisk')
                setCurrentPage(1)
              }}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeSection === 'atRisk'
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              At Risk ({filteredAtRiskUsers.length})
            </button>
            <button
              onClick={() => {
                setActiveSection('atLimit')
                setCurrentPage(1)
              }}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeSection === 'atLimit'
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              At Limit ({filteredAtLimitUsers.length})
            </button>
            <button
              onClick={() => {
                setActiveSection('conversions')
                setCurrentPage(1)
              }}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeSection === 'conversions'
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Conversions ({filteredConversionOpps.length})
            </button>
          </div>

          <div className="flex gap-2">
            <select
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
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
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Plan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Highest Usage</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Meters</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {paginatedAtRisk.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                        No users found matching filters
                      </td>
                    </tr>
                  ) : (
                    paginatedAtRisk.map((user: any) => (
                      <tr key={user.userId} className="hover:bg-gray-800/50">
                        <td className="px-4 py-3 text-sm text-white">{user.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-300 capitalize">{user.planName}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-white font-medium">
                              {user.highestUsage.percentage.toFixed(1)}%
                            </span>
                            <div className="w-24 bg-gray-800 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  user.highestUsage.percentage >= 100
                                    ? 'bg-red-600'
                                    : user.highestUsage.percentage >= 90
                                    ? 'bg-yellow-600'
                                    : 'bg-blue-600'
                                }`}
                                style={{ width: `${Math.min(100, user.highestUsage.percentage)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(user.allMeters).slice(0, 2).map(([key, meter]: [string, any]) => (
                              <span
                                key={key}
                                className={`text-xs px-2 py-1 rounded ${
                                  meter.percentage >= 100
                                    ? 'bg-red-900/30 text-red-400'
                                    : meter.percentage >= 80
                                    ? 'bg-yellow-900/30 text-yellow-400'
                                    : 'bg-gray-800 text-gray-400'
                                }`}
                              >
                                {key}: {meter.percentage.toFixed(0)}%
                              </span>
                            ))}
                            {Object.keys(user.allMeters).length > 2 && (
                              <span className="text-xs text-gray-500">+{Object.keys(user.allMeters).length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/subscriptions?user=${user.userId}`}
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, filteredAtRiskUsers.length)} of {filteredAtRiskUsers.length}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 disabled:cursor-not-allowed text-white rounded text-sm"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 disabled:cursor-not-allowed text-white rounded text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* At Limit Users Table */}
        {activeSection === 'atLimit' && (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Plan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Exceeded Meters</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {paginatedAtLimit.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                        No users found matching filters
                      </td>
                    </tr>
                  ) : (
                    paginatedAtLimit.map((user: any) => (
                      <tr key={user.userId} className="hover:bg-gray-800/50">
                        <td className="px-4 py-3 text-sm text-white">{user.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-300 capitalize">{user.planName}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            {user.exceededMeters.map((meter: string) => (
                              <span
                                key={meter}
                                className="text-xs px-2 py-1 rounded bg-red-900/30 text-red-400"
                              >
                                {meter}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/subscriptions?user=${user.userId}`}
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, filteredAtLimitUsers.length)} of {filteredAtLimitUsers.length}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 disabled:cursor-not-allowed text-white rounded text-sm"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 disabled:cursor-not-allowed text-white rounded text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Conversion Opportunities Table */}
        {activeSection === 'conversions' && (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Current Plan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Recommended</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Usage</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {paginatedOpps.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                        No opportunities found matching filters
                      </td>
                    </tr>
                  ) : (
                    paginatedOpps.map((opp: any) => (
                      <tr key={opp.userId} className="hover:bg-gray-800/50">
                        <td className="px-4 py-3 text-sm text-white">{opp.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-300 capitalize">{opp.currentPlan}</td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-green-400 font-medium capitalize">
                            {opp.recommendedPlan}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-white font-medium">
                              {opp.usagePercentage.toFixed(1)}%
                            </span>
                            <div className="w-24 bg-gray-800 rounded-full h-2">
                              <div
                                className="bg-yellow-600 h-2 rounded-full"
                                style={{ width: `${Math.min(100, opp.usagePercentage)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/subscriptions?user=${opp.userId}`}
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, filteredConversionOpps.length)} of {filteredConversionOpps.length}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 disabled:cursor-not-allowed text-white rounded text-sm"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 disabled:cursor-not-allowed text-white rounded text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ForecastView({ forecast }: { forecast: any }) {
  if (!forecast) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">No forecast data available</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Forecast Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Churn Risk Distribution</h3>
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
          <div className="flex items-center justify-center h-[200px] text-gray-400">
            No churn risk data available
          </div>
        )}
      </div>

      {/* Revenue Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Conversion Forecast</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Opportunities</span>
              <span className="text-white font-semibold">{forecast.conversionForecast?.opportunities || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Estimated Conversions</span>
              <span className="text-green-400 font-semibold">{forecast.conversionForecast?.estimatedConversions || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Conversion Rate</span>
              <span className="text-white font-semibold">{forecast.conversionForecast?.conversionRate?.toFixed(1) || 0}%</span>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-800">
              <span className="text-gray-300">Estimated Revenue</span>
              <span className="text-blue-400 font-semibold text-lg">
                ${forecast.conversionForecast?.estimatedRevenue?.toFixed(2) || '0.00'}/mo
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Usage Trends</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Average Usage</span>
              <span className="text-white font-semibold">{forecast.usageTrends?.averageUsageGrowth?.toFixed(1) || 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Approaching Limits</span>
              <span className="text-yellow-400 font-semibold">{forecast.usageTrends?.usersApproachingLimits || 0}</span>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-800">
              <span className="text-gray-300">Projected Churn</span>
              <span className="text-red-400 font-semibold text-lg">{forecast.usageTrends?.projectedChurn || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
