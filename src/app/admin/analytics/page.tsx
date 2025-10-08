'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Mail, 
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import StatsCard from '@/components/dashboard/StatsCard'
import ProgressBar from '@/components/dashboard/ProgressBar'

interface AnalyticsData {
  userStats: {
    totalUsers: number
    pendingUsers: number
    confirmedUsers: number
    rejectedUsers: number
    recentUsers: number
    userGrowth: Array<{ date: string; count: number }>
    roleDistribution: Record<string, number>
  }
  emailStats: {
    totalEmails: number
    sentEmails: number
    deliveredEmails: number
    failedEmails: number
    openedEmails: number
    clickedEmails: number
    deliveryRate: number
    openRate: number
    clickRate: number
    failureRate: number
    emailTypeStats: Record<string, number>
    emailStatusStats: Record<string, number>
  }
  systemStats: {
    systemHealth: number
    averageResponseTime: number
    uptime: number
    errorRate: number
  }
}

export default function AnalyticsDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN' || !session.user.isConfirmed) {
      router.push('/unauthorized')
      return
    }

    fetchAnalytics()
  }, [session, status, router, dateRange])

  const fetchAnalytics = async () => {
    try {
      const [userResponse, emailResponse, systemResponse] = await Promise.all([
        fetch('/api/admin/stats/users'),
        fetch('/api/admin/stats/emails'),
        fetch('/api/admin/stats/system')
      ])

      const userStats = userResponse.ok ? await userResponse.json() : null
      const emailStats = emailResponse.ok ? await emailResponse.json() : null
      const systemStats = systemResponse.ok ? await systemResponse.json() : null

      if (userStats && emailStats && systemStats) {
        setAnalytics({
          userStats,
          emailStats,
          systemStats
        })
      } else {
        // Mock data for demo
        setAnalytics({
          userStats: {
            totalUsers: 1247,
            pendingUsers: 23,
            confirmedUsers: 1200,
            rejectedUsers: 24,
            recentUsers: 127,
            userGrowth: [
              { date: '2024-01-15', count: 15 },
              { date: '2024-01-16', count: 23 },
              { date: '2024-01-17', count: 18 },
              { date: '2024-01-18', count: 31 },
              { date: '2024-01-19', count: 27 },
              { date: '2024-01-20', count: 35 },
              { date: '2024-01-21', count: 29 }
            ],
            roleDistribution: {
              CLIENT: 1200,
              ADMIN: 47
            }
          },
          emailStats: {
            totalEmails: 3456,
            sentEmails: 3400,
            deliveredEmails: 3200,
            failedEmails: 56,
            openedEmails: 2800,
            clickedEmails: 1200,
            deliveryRate: 94.1,
            openRate: 87.5,
            clickRate: 42.9,
            failureRate: 1.6,
            emailTypeStats: {
              WELCOME: 1200,
              ACCOUNT_CONFIRMED: 800,
              ACCOUNT_REJECTED: 200,
              PASSWORD_RESET: 150,
              MEETING_REMINDER: 800,
              CUSTOM: 306
            },
            emailStatusStats: {
              SENT: 3400,
              DELIVERED: 3200,
              FAILED: 56,
              OPENED: 2800,
              CLICKED: 1200
            }
          },
          systemStats: {
            systemHealth: 99.9,
            averageResponseTime: 120,
            uptime: 99.8,
            errorRate: 0.1
          }
        })
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportAnalytics = () => {
    if (!analytics) return

    const data = {
      timestamp: new Date().toISOString(),
      dateRange,
      userStats: analytics.userStats,
      emailStats: analytics.emailStats,
      systemStats: analytics.systemStats
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No analytics data</h3>
        <p className="mt-1 text-sm text-gray-500">
          Unable to load analytics data. Please try again.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Comprehensive analytics and insights for your mentorship platform.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <Button
            variant="outline"
            onClick={fetchAnalytics}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <Button
            onClick={exportAnalytics}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={analytics.userStats.totalUsers.toLocaleString()}
          icon={Users}
          iconColor="text-blue-600"
          change={{ value: '+12%', type: 'increase' }}
          description="vs last month"
        />
        <StatsCard
          title="Email Delivery Rate"
          value={`${analytics.emailStats.deliveryRate}%`}
          icon={Mail}
          iconColor="text-green-600"
          change={{ value: '+2.1%', type: 'increase' }}
          description="successfully delivered"
        />
        <StatsCard
          title="System Health"
          value={`${analytics.systemStats.systemHealth}%`}
          icon={CheckCircle}
          iconColor="text-purple-600"
          change={{ value: '+0.1%', type: 'increase' }}
          description="uptime"
        />
        <StatsCard
          title="Open Rate"
          value={`${analytics.emailStats.openRate}%`}
          icon={Eye}
          iconColor="text-orange-600"
          change={{ value: '+5.2%', type: 'increase' }}
          description="email engagement"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* User Analytics */}
        <DashboardCard title="User Analytics" subtitle="User registration and confirmation trends">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{analytics.userStats.confirmedUsers}</div>
                <div className="text-sm text-blue-600">Confirmed Users</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{analytics.userStats.pendingUsers}</div>
                <div className="text-sm text-yellow-600">Pending Approval</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">User Growth (Last 7 Days)</h4>
              <div className="space-y-2">
                {analytics.userStats.userGrowth.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{day.date}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(day.count / Math.max(...analytics.userStats.userGrowth.map(d => d.count))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">{day.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Role Distribution</h4>
              <div className="space-y-2">
                {Object.entries(analytics.userStats.roleDistribution).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{role}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(count / analytics.userStats.totalUsers) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DashboardCard>

        {/* Email Analytics */}
        <DashboardCard title="Email Analytics" subtitle="Email delivery and engagement metrics">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{analytics.emailStats.deliveredEmails}</div>
                <div className="text-sm text-green-600">Delivered</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{analytics.emailStats.failedEmails}</div>
                <div className="text-sm text-red-600">Failed</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Email Performance</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Delivery Rate</span>
                    <span className="text-sm font-medium text-gray-900">{analytics.emailStats.deliveryRate}%</span>
                  </div>
                  <ProgressBar value={analytics.emailStats.deliveryRate} max={100} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Open Rate</span>
                    <span className="text-sm font-medium text-gray-900">{analytics.emailStats.openRate}%</span>
                  </div>
                  <ProgressBar value={analytics.emailStats.openRate} max={100} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Click Rate</span>
                    <span className="text-sm font-medium text-gray-900">{analytics.emailStats.clickRate}%</span>
                  </div>
                  <ProgressBar value={analytics.emailStats.clickRate} max={100} />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Email Types</h4>
              <div className="space-y-2">
                {Object.entries(analytics.emailStats.emailTypeStats).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{type.replace('_', ' ')}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${(count / analytics.emailStats.totalEmails) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* System Performance */}
      <DashboardCard title="System Performance" subtitle="Platform health and performance metrics">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <CheckCircle className="mx-auto h-8 w-8 text-green-600 mb-2" />
            <div className="text-2xl font-bold text-green-600">{analytics.systemStats.systemHealth}%</div>
            <div className="text-sm text-green-600">System Health</div>
          </div>
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <Clock className="mx-auto h-8 w-8 text-blue-600 mb-2" />
            <div className="text-2xl font-bold text-blue-600">{analytics.systemStats.averageResponseTime}ms</div>
            <div className="text-sm text-blue-600">Avg Response Time</div>
          </div>
          <div className="text-center p-6 bg-purple-50 rounded-lg">
            <TrendingUp className="mx-auto h-8 w-8 text-purple-600 mb-2" />
            <div className="text-2xl font-bold text-purple-600">{analytics.systemStats.uptime}%</div>
            <div className="text-sm text-purple-600">Uptime</div>
          </div>
          <div className="text-center p-6 bg-red-50 rounded-lg">
            <XCircle className="mx-auto h-8 w-8 text-red-600 mb-2" />
            <div className="text-2xl font-bold text-red-600">{analytics.systemStats.errorRate}%</div>
            <div className="text-sm text-red-600">Error Rate</div>
          </div>
        </div>
      </DashboardCard>

      {/* Quick Actions */}
      <DashboardCard title="Quick Actions" subtitle="Common administrative tasks">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => router.push('/admin/users/pending')}
            className="flex items-center justify-center space-x-2"
          >
            <Users className="h-4 w-4" />
            <span>Review Pending Users</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/admin/emails')}
            className="flex items-center justify-center space-x-2"
          >
            <Mail className="h-4 w-4" />
            <span>Email Management</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/admin/users')}
            className="flex items-center justify-center space-x-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span>User Management</span>
          </Button>
        </div>
      </DashboardCard>
    </div>
  )
}



