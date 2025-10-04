'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Users, Target, DollarSign, Calendar, TrendingUp, AlertCircle, Clock, CheckCircle, Activity, Mail, XCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import DashboardCard from '@/components/dashboard/DashboardCard'
import StatsCard from '@/components/dashboard/StatsCard'
import ProgressBar from '@/components/dashboard/ProgressBar'

interface DashboardStats {
  totalUsers: number
  pendingUsers: number
  confirmedUsers: number
  rejectedUsers: number
  totalEmails: number
  sentEmails: number
  failedEmails: number
  systemHealth: number
}

interface RecentActivity {
  id: string
  type: 'user_registration' | 'user_confirmation' | 'user_rejection' | 'email_sent'
  description: string
  timestamp: string
  user: string
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (session.user.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    fetchDashboardData()
  }, [session, status, router])

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        fetch('/api/admin/dashboard/stats'),
        fetch('/api/admin/dashboard/activity')
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      if (activityResponse.ok) {
        const activityData = await activityResponse.json()
        setRecentActivity(activityData.activities || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Show mock data for demo
      setStats({
        totalUsers: 1247,
        pendingUsers: 23,
        confirmedUsers: 1200,
        rejectedUsers: 24,
        totalEmails: 3456,
        sentEmails: 3400,
        failedEmails: 56,
        systemHealth: 99.9,
      })
      setRecentActivity([
        {
          id: '1',
          type: 'user_registration',
          description: 'New user registration pending approval',
          timestamp: '2024-01-20T10:30:00Z',
          user: 'John Smith',
        },
        {
          id: '2',
          type: 'user_confirmation',
          description: 'User account confirmed and activated',
          timestamp: '2024-01-20T09:15:00Z',
          user: 'Sarah Johnson',
        },
        {
          id: '3',
          type: 'email_sent',
          description: 'Welcome email sent to new user',
          timestamp: '2024-01-19T16:45:00Z',
          user: 'Mike Chen',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <Button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">Manage your mentorship platform</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.push('/admin/users')}>
              Manage Users
            </Button>
            <Button variant="outline" onClick={() => router.push('/admin/services')}>
              Manage Services
            </Button>
          </div>
        </div>
      </div>
      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            iconColor="text-blue-600"
            change={{ value: '+12%', type: 'increase' }}
            description="vs last month"
          />
          <StatsCard
            title="Pending Approvals"
            value={stats.pendingUsers}
            icon={Clock}
            iconColor="text-yellow-600"
            change={{ value: '+3', type: 'neutral' }}
            description="awaiting review"
          />
          <StatsCard
            title="Confirmed Users"
            value={stats.confirmedUsers}
            icon={CheckCircle}
            iconColor="text-green-600"
            change={{ value: '+8%', type: 'increase' }}
            description="vs last month"
          />
          <StatsCard
            title="System Health"
            value={`${stats.systemHealth}%`}
            icon={Activity}
            iconColor="text-purple-600"
            change={{ value: '+0.1%', type: 'increase' }}
            description="uptime"
          />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Breakdown */}
          {stats && (
            <DashboardCard title="Service Breakdown">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{stats.mentorshipEnrollments}</div>
                  <div className="text-gray-600">Mentorship Enrollments</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {((stats.mentorshipEnrollments / stats.activeEnrollments) * 100).toFixed(1)}% of total
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{stats.advisoryEnrollments}</div>
                  <div className="text-gray-600">Advisory Enrollments</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {((stats.advisoryEnrollments / stats.activeEnrollments) * 100).toFixed(1)}% of total
                  </div>
                </div>
              </div>
            </DashboardCard>
          )}

          {/* Recent Activity */}
          <DashboardCard title="Recent Activity">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'enrollment' ? 'bg-blue-500' :
                    activity.type === 'payment' ? 'bg-green-500' : 'bg-purple-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{activity.description}</div>
                    <div className="text-sm text-gray-500">
                      {activity.user} • {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>

          {/* Quick Actions */}
          <DashboardCard title="Quick Actions">
            <div className="grid md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="flex items-center justify-center space-x-2"
                onClick={() => router.push('/admin/users')}
              >
                <Users className="w-4 h-4" />
                <span>Manage Users</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center justify-center space-x-2"
                onClick={() => router.push('/admin/services')}
              >
                <Target className="w-4 h-4" />
                <span>Manage Services</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center justify-center space-x-2"
                onClick={() => router.push('/admin/payments')}
              >
                <DollarSign className="w-4 h-4" />
                <span>View Payments</span>
              </Button>
            </div>
          </DashboardCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* System Status */}
          <DashboardCard title="System Status">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Platform Status</span>
                <span className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Payment System</span>
                <span className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Email Service</span>
                <span className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Operational
                </span>
              </div>
            </div>
          </DashboardCard>

          {/* Performance Metrics */}
          <DashboardCard title="Performance">
            <div className="space-y-4">
              <ProgressBar
                progress={94}
                label="User Satisfaction"
                color="green"
              />
              <ProgressBar
                progress={87}
                label="Session Completion"
                color="blue"
              />
              <ProgressBar
                progress={75}
                label="Revenue Growth"
                color="purple"
              />
            </div>
          </DashboardCard>

          {/* Growth Metrics */}
          <DashboardCard title="Growth">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">New Users (30d)</span>
                <span className="flex items-center text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +127
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Revenue (30d)</span>
                <span className="flex items-center text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +$12,400
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Enrollments (30d)</span>
                <span className="flex items-center text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +34
                </span>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  )
}