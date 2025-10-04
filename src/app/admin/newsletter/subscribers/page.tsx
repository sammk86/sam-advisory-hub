'use client'

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Download, 
  UserX, 
  Mail, 
  Eye, 
  MousePointer,
  Calendar,
  Users,
  AlertCircle,
  RefreshCw,
  CheckSquare,
  Square
} from 'lucide-react'

interface Subscriber {
  id: string
  email: string
  firstName?: string
  lastName?: string
  status: 'ACTIVE' | 'UNSUBSCRIBED' | 'BOUNCED' | 'COMPLAINED'
  subscribedAt: string
  unsubscribedAt?: string
  interests: string[]
  source: string
  totalEmailsReceived: number
  totalEmailsOpened: number
  totalEmailsClicked: number
  lastEngagement?: string
}

interface SubscribersResponse {
  success: boolean
  data: {
    subscribers: Subscriber[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}

export default function SubscriberManagement() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [sourceFilter, setSourceFilter] = useState<string>('')
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

  useEffect(() => {
    fetchSubscribers()
  }, [searchQuery, statusFilter, sourceFilter, pagination?.page])

  const fetchSubscribers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        page: (pagination?.page || 1).toString(),
        limit: (pagination?.limit || 20).toString(),
      })
      
      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter) params.append('status', statusFilter)
      if (sourceFilter) params.append('source', sourceFilter)
      
      const response = await fetch(`/api/admin/newsletter/subscribers?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch subscribers')
      }
      
      const responseData: SubscribersResponse = await response.json()
      if (responseData.success && responseData.data) {
        setSubscribers(responseData.data.subscribers || [])
        setPagination(responseData.data.pagination || { page: 1, limit: 20, total: 0, pages: 0 })
      } else {
        throw new Error('Failed to fetch subscribers')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscribers')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleSourceFilter = (source: string) => {
    setSourceFilter(source)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleSelectAll = () => {
    if (selectedSubscribers.length === (subscribers?.length || 0)) {
      setSelectedSubscribers([])
    } else {
      setSelectedSubscribers((subscribers || []).map(s => s.id))
    }
  }

  const handleSelectSubscriber = (subscriberId: string) => {
    setSelectedSubscribers(prev => 
      prev.includes(subscriberId)
        ? prev.filter(id => id !== subscriberId)
        : [...prev, subscriberId]
    )
  }

  const handleBulkUnsubscribe = async () => {
    if (selectedSubscribers.length === 0) return
    
    try {
      setBulkActionLoading(true)
      
      const response = await fetch('/api/admin/newsletter/subscribers/bulk-unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriberIds: selectedSubscribers,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to unsubscribe subscribers')
      }
      
      // Refresh the list
      await fetchSubscribers()
      setSelectedSubscribers([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unsubscribe subscribers')
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/admin/newsletter/subscribers/export')
      if (!response.ok) {
        throw new Error('Failed to export subscribers')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export subscribers')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { color: 'bg-green-100 text-green-800', label: 'Active' },
      UNSUBSCRIBED: { color: 'bg-red-100 text-red-800', label: 'Unsubscribed' },
      BOUNCED: { color: 'bg-yellow-100 text-yellow-800', label: 'Bounced' },
      COMPLAINED: { color: 'bg-orange-100 text-orange-800', label: 'Complained' },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatEngagementRate = (opened: number, received: number) => {
    if (received === 0) return '0%'
    return `${((opened / received) * 100).toFixed(1)}%`
  }

  if (loading && (subscribers?.length || 0) === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Subscriber Management</h1>
        </div>
        
        {/* Loading skeleton */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/8"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Subscriber Management</h1>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading subscribers</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={fetchSubscribers}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscriber Management</h1>
          <p className="text-gray-600">Manage your newsletter subscribers</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  placeholder="Search by email or name..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="UNSUBSCRIBED">Unsubscribed</option>
                <option value="BOUNCED">Bounced</option>
                <option value="COMPLAINED">Complained</option>
              </select>
            </div>

            {/* Source Filter */}
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700">
                Source
              </label>
              <select
                id="source"
                value={sourceFilter}
                onChange={(e) => handleSourceFilter(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">All Sources</option>
                <option value="landing-page">Landing Page</option>
                <option value="footer">Footer</option>
                <option value="popup">Popup</option>
                <option value="referral">Referral</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedSubscribers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-blue-400 mr-2" />
              <span className="text-sm font-medium text-blue-800">
                {selectedSubscribers.length} subscriber{selectedSubscribers.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleBulkUnsubscribe}
                disabled={bulkActionLoading}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                <UserX className="h-4 w-4 mr-2" />
                {bulkActionLoading ? 'Processing...' : 'Bulk Unsubscribe'}
              </button>
              <button
                onClick={() => setSelectedSubscribers([])}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscribers Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Subscribers ({pagination?.total || 0})
            </h3>
            <button
              onClick={fetchSubscribers}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {(subscribers?.length || 0) === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No subscribers found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || statusFilter || sourceFilter
                  ? 'Try adjusting your filters to see more results.'
                  : 'Subscribers will appear here once they sign up for your newsletter.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={handleSelectAll}
                        className="flex items-center"
                      >
                        {selectedSubscribers.length === (subscribers?.length || 0) ? (
                          <CheckSquare className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Square className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subscriber
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Engagement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subscribed
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(subscribers || []).map((subscriber) => (
                    <tr key={subscriber.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedSubscribers.includes(subscriber.id)}
                          onChange={() => handleSelectSubscriber(subscriber.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {subscriber.firstName?.charAt(0) || subscriber.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {subscriber.firstName && subscriber.lastName
                                ? `${subscriber.firstName} ${subscriber.lastName}`
                                : subscriber.email}
                            </div>
                            <div className="text-sm text-gray-500">{subscriber.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(subscriber.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {subscriber.source}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-1" />
                            <span>{subscriber.totalEmailsReceived}</span>
                          </div>
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 text-blue-400 mr-1" />
                            <span>{subscriber.totalEmailsOpened}</span>
                          </div>
                          <div className="flex items-center">
                            <MousePointer className="h-4 w-4 text-purple-400 mr-1" />
                            <span>{subscriber.totalEmailsClicked}</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatEngagementRate(subscriber.totalEmailsOpened, subscriber.totalEmailsReceived)} engagement
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          {formatDate(subscriber.subscribedAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {(pagination?.pages || 0) > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination?.page || 1 === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={(pagination?.page || 1) === (pagination?.pages || 0)}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">
                      {((pagination?.page || 1) - 1) * (pagination?.limit || 20) + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min((pagination?.page || 1) * (pagination?.limit || 20), pagination?.total || 0)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{pagination?.total || 0}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination?.page || 1 === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={(pagination?.page || 1) === (pagination?.pages || 0)}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
