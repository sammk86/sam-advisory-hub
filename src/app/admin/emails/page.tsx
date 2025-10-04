'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Mail, 
  Search, 
  Filter, 
  RefreshCw,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  AlertTriangle,
  TrendingUp,
  BarChart3
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { StatusBadge } from '@/components/ui/StatusBadge'

interface EmailNotification {
  id: string
  userId: string
  type: string
  subject: string
  body: string
  sentAt: string
  status: string
  errorMessage: string | null
  user: {
    email: string
    name: string | null
  }
}

interface EmailFilters {
  status: 'all' | 'sent' | 'delivered' | 'failed' | 'opened' | 'clicked'
  type: 'all' | 'WELCOME' | 'ACCOUNT_CONFIRMED' | 'ACCOUNT_REJECTED' | 'PASSWORD_RESET' | 'MEETING_REMINDER' | 'CUSTOM'
  search: string
  dateRange: 'all' | 'today' | 'week' | 'month'
}

interface EmailStats {
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
}

export default function EmailManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [emails, setEmails] = useState<EmailNotification[]>([])
  const [filteredEmails, setFilteredEmails] = useState<EmailNotification[]>([])
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<EmailFilters>({
    status: 'all',
    type: 'all',
    search: '',
    dateRange: 'all'
  })
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN' || !session.user.isConfirmed) {
      router.push('/unauthorized')
      return
    }

    fetchEmails()
    fetchEmailStats()
  }, [session, status, router])

  useEffect(() => {
    filterEmails()
  }, [emails, filters])

  const fetchEmails = async () => {
    try {
      const response = await fetch('/api/admin/emails')
      if (response.ok) {
        const data = await response.json()
        setEmails(data.emails || [])
      }
    } catch (error) {
      console.error('Error fetching emails:', error)
      // Mock data for demo
      setEmails([
        {
          id: '1',
          userId: 'user-1',
          type: 'WELCOME',
          subject: 'Welcome to MentorshipHub!',
          body: 'Thank you for joining our platform...',
          sentAt: '2024-01-20T10:30:00Z',
          status: 'DELIVERED',
          errorMessage: null,
          user: {
            email: 'john.doe@example.com',
            name: 'John Doe'
          }
        },
        {
          id: '2',
          userId: 'user-2',
          type: 'ACCOUNT_CONFIRMED',
          subject: 'Your Account is Confirmed!',
          body: 'Great news! Your account has been approved...',
          sentAt: '2024-01-20T09:15:00Z',
          status: 'SENT',
          errorMessage: null,
          user: {
            email: 'jane.smith@example.com',
            name: 'Jane Smith'
          }
        },
        {
          id: '3',
          userId: 'user-3',
          type: 'ACCOUNT_REJECTED',
          subject: 'Account Status Update',
          body: 'We regret to inform you...',
          sentAt: '2024-01-19T16:45:00Z',
          status: 'FAILED',
          errorMessage: 'SMTP connection timeout',
          user: {
            email: 'mike.wilson@example.com',
            name: 'Mike Wilson'
          }
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchEmailStats = async () => {
    try {
      const response = await fetch('/api/admin/stats/emails')
      if (response.ok) {
        const data = await response.json()
        setEmailStats(data)
      }
    } catch (error) {
      console.error('Error fetching email stats:', error)
      // Mock data for demo
      setEmailStats({
        totalEmails: 3456,
        sentEmails: 3400,
        deliveredEmails: 3200,
        failedEmails: 56,
        openedEmails: 2800,
        clickedEmails: 1200,
        deliveryRate: 94.1,
        openRate: 87.5,
        clickRate: 42.9,
        failureRate: 1.6
      })
    }
  }

  const filterEmails = () => {
    let filtered = [...emails]

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(email => email.status.toLowerCase() === filters.status.toLowerCase())
    }

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(email => email.type === filters.type)
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(email => 
        email.subject.toLowerCase().includes(searchLower) ||
        email.user.email.toLowerCase().includes(searchLower) ||
        (email.user.name && email.user.name.toLowerCase().includes(searchLower))
      )
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date()
      let startDate: Date

      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(0)
      }

      filtered = filtered.filter(email => new Date(email.sentAt) >= startDate)
    }

    setFilteredEmails(filtered)
  }

  const handleRetryEmail = async (emailId: string) => {
    setActionLoading(emailId)
    try {
      const response = await fetch(`/api/admin/emails/${emailId}/retry`, {
        method: 'POST',
      })

      if (response.ok) {
        await fetchEmails()
        await fetchEmailStats()
      } else {
        console.error('Error retrying email')
      }
    } catch (error) {
      console.error('Error retrying email:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleBulkRetry = async () => {
    setActionLoading('bulk')
    try {
      const promises = selectedEmails.map(emailId => 
        fetch(`/api/admin/emails/${emailId}/retry`, {
          method: 'POST',
        })
      )

      await Promise.all(promises)
      await fetchEmails()
      await fetchEmailStats()
      setSelectedEmails([])
    } catch (error) {
      console.error('Error performing bulk retry:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      SENT: { color: 'blue', text: 'Sent' },
      DELIVERED: { color: 'green', text: 'Delivered' },
      FAILED: { color: 'red', text: 'Failed' },
      OPENED: { color: 'purple', text: 'Opened' },
      CLICKED: { color: 'indigo', text: 'Clicked' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'gray', text: status }
    return <StatusBadge status={config.color as any} text={config.text} />
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      WELCOME: 'bg-blue-100 text-blue-800',
      ACCOUNT_CONFIRMED: 'bg-green-100 text-green-800',
      ACCOUNT_REJECTED: 'bg-red-100 text-red-800',
      PASSWORD_RESET: 'bg-yellow-100 text-yellow-800',
      MEETING_REMINDER: 'bg-purple-100 text-purple-800',
      CUSTOM: 'bg-gray-100 text-gray-800'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {type.replace('_', ' ')}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Management</h1>
          <p className="mt-2 text-gray-600">
            Monitor email delivery, track performance, and manage email notifications.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              fetchEmails()
              fetchEmailStats()
            }}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <Button
            onClick={() => router.push('/admin/analytics')}
            className="flex items-center space-x-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </Button>
        </div>
      </div>

      {/* Email Statistics */}
      {emailStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard title="Total Emails" subtitle="All time">
            <div className="flex items-center">
              <div className="text-3xl font-bold text-blue-600">{emailStats.totalEmails.toLocaleString()}</div>
              <Mail className="ml-3 h-8 w-8 text-blue-600" />
            </div>
          </DashboardCard>

          <DashboardCard title="Delivery Rate" subtitle="Successfully delivered">
            <div className="flex items-center">
              <div className="text-3xl font-bold text-green-600">{emailStats.deliveryRate}%</div>
              <CheckCircle className="ml-3 h-8 w-8 text-green-600" />
            </div>
          </DashboardCard>

          <DashboardCard title="Open Rate" subtitle="Emails opened">
            <div className="flex items-center">
              <div className="text-3xl font-bold text-purple-600">{emailStats.openRate}%</div>
              <Eye className="ml-3 h-8 w-8 text-purple-600" />
            </div>
          </DashboardCard>

          <DashboardCard title="Failed Emails" subtitle="Delivery failures">
            <div className="flex items-center">
              <div className="text-3xl font-bold text-red-600">{emailStats.failedEmails}</div>
              <XCircle className="ml-3 h-8 w-8 text-red-600" />
            </div>
          </DashboardCard>
        </div>
      )}

      {/* Filters */}
      <DashboardCard title="Filters" subtitle="Filter and search emails">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search emails..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          {/* Status Filter */}
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
          >
            <option value="all">All Status</option>
            <option value="sent">Sent</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed</option>
            <option value="opened">Opened</option>
            <option value="clicked">Clicked</option>
          </select>

          {/* Type Filter */}
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
          >
            <option value="all">All Types</option>
            <option value="WELCOME">Welcome</option>
            <option value="ACCOUNT_CONFIRMED">Account Confirmed</option>
            <option value="ACCOUNT_REJECTED">Account Rejected</option>
            <option value="PASSWORD_RESET">Password Reset</option>
            <option value="MEETING_REMINDER">Meeting Reminder</option>
            <option value="CUSTOM">Custom</option>
          </select>

          {/* Date Range Filter */}
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as any })}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </DashboardCard>

      {/* Bulk Actions */}
      {selectedEmails.length > 0 && (
        <DashboardCard title="Bulk Actions" subtitle={`${selectedEmails.length} email(s) selected`}>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleBulkRetry}
              disabled={actionLoading === 'bulk'}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry Selected</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedEmails([])}
            >
              Clear Selection
            </Button>
          </div>
        </DashboardCard>
      )}

      {/* Emails Table */}
      <DashboardCard title="Email Notifications" subtitle={`${filteredEmails.length} email(s) found`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEmails(filteredEmails.map(email => email.id))
                      } else {
                        setSelectedEmails([])
                      }
                    }}
                    checked={selectedEmails.length === filteredEmails.length && filteredEmails.length > 0}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sent At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmails.map((email) => (
                <tr key={email.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedEmails.includes(email.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEmails([...selectedEmails, email.id])
                        } else {
                          setSelectedEmails(selectedEmails.filter(id => id !== email.id))
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {email.user.name?.charAt(0) || email.user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {email.subject}
                        </div>
                        <div className="text-sm text-gray-500">{email.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTypeBadge(email.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(email.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(email.sentAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {email.status === 'FAILED' && (
                        <Button
                          size="sm"
                          onClick={() => handleRetryEmail(email.id)}
                          disabled={actionLoading === email.id}
                          className="flex items-center space-x-1"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>Retry</span>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Show email details modal
                          alert(`Email Details:\n\nSubject: ${email.subject}\nStatus: ${email.status}\nError: ${email.errorMessage || 'None'}`)
                        }}
                        className="flex items-center space-x-1"
                      >
                        <Eye className="h-3 w-3" />
                        <span>View</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEmails.length === 0 && (
          <div className="text-center py-12">
            <Mail className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No emails found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </DashboardCard>
    </div>
  )
}

