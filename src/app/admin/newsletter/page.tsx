'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users, 
  Mail, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Eye,
  MousePointer,
  UserX,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { getNewsletterAnalytics } from '@/lib/email'

interface NewsletterAnalytics {
  totalSubscribers: number
  activeSubscribers: number
  unsubscribedCount: number
  totalCampaigns: number
  averageOpenRate: number
  averageClickRate: number
  recentCampaigns: Array<{
    id: string
    title: string
    sentAt: string
    openRate: number
    clickRate: number
  }>
}

export default function NewsletterDashboard() {
  const [analytics, setAnalytics] = useState<NewsletterAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/newsletter/analytics')
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      
      const data = await response.json()
      const analyticsData = data.data || data
      
      // Ensure all required properties exist with fallback values
      const safeAnalytics = {
        totalSubscribers: analyticsData.totalSubscribers || 0,
        activeSubscribers: analyticsData.activeSubscribers || 0,
        unsubscribedCount: analyticsData.unsubscribedCount || 0,
        totalCampaigns: analyticsData.totalCampaigns || 0,
        averageOpenRate: analyticsData.averageOpenRate || 0,
        averageClickRate: analyticsData.averageClickRate || 0,
        recentCampaigns: analyticsData.recentCampaigns || []
      }
      
      setAnalytics(safeAnalytics)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Newsletter Dashboard</h1>
        </div>
        
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Newsletter Dashboard</h1>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading analytics</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={fetchAnalytics}
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

  if (!analytics) {
    return null
  }

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null || isNaN(num)) {
      return '0'
    }
    return new Intl.NumberFormat().format(num)
  }

  const formatPercentage = (num: number | undefined | null) => {
    if (num === undefined || num === null || isNaN(num)) {
      return '0.0%'
    }
    return `${num.toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter Dashboard</h1>
          <p className="text-gray-600">Manage your newsletter subscribers and campaigns</p>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/admin/newsletter/campaigns"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Campaigns
          </Link>
          <Link
            href="/admin/newsletter/campaigns/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Subscribers */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Subscribers
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatNumber(analytics.totalSubscribers)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Active Subscribers */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Mail className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Subscribers
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatNumber(analytics.activeSubscribers)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Average Open Rate */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Eye className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Average Open Rate
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatPercentage(analytics.averageOpenRate)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Average Click Rate */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MousePointer className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Average Click Rate
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatPercentage(analytics.averageClickRate)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscriber Status Breakdown */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Subscriber Status
            </h3>
            <div className="mt-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Active</span>
                  <span className="text-sm font-medium text-green-600">
                    {formatNumber(analytics.activeSubscribers)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Unsubscribed</span>
                  <span className="text-sm font-medium text-red-600">
                    {formatNumber(analytics.unsubscribedCount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total Campaigns</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatNumber(analytics.totalCampaigns)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Campaigns */}
        <div className="lg:col-span-2 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Campaigns
              </h3>
              <Link
                href="/admin/newsletter/campaigns"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                View all
              </Link>
            </div>
            <div className="mt-5">
              {analytics.recentCampaigns && analytics.recentCampaigns.length > 0 ? (
                <div className="space-y-4">
                  {analytics.recentCampaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {campaign.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {new Date(campaign.sentAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 text-blue-400 mr-1" />
                          <span className="text-blue-600">
                            {formatPercentage(campaign.openRate)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <MousePointer className="h-4 w-4 text-purple-400 mr-1" />
                          <span className="text-purple-600">
                            {formatPercentage(campaign.clickRate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Mail className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating your first newsletter campaign.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/admin/newsletter/campaigns/create"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Campaign
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/newsletter/subscribers"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Users className="h-4 w-4 mr-2" />
              View Subscribers
            </Link>
            <Link
              href="/admin/newsletter/campaigns"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Mail className="h-4 w-4 mr-2" />
              Manage Campaigns
            </Link>
            <Link
              href="/admin/newsletter/campaigns/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Link>
            <button
              onClick={fetchAnalytics}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
