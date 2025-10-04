'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  DollarSign,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  Archive,
  X,
  Loader2
} from 'lucide-react'

interface Service {
  id: string
  name: string
  description: string
  type: 'MENTORSHIP' | 'ADVISORY'
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  singleSessionPrice?: number
  monthlyPlanPrice?: number
  hourlyRate?: number
  createdAt: string
  updatedAt: string
}

interface ServicesResponse {
  success: boolean
  data: {
    services: Service[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchServices()
  }, [pagination?.page, statusFilter, typeFilter])

  const fetchServices = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        page: (pagination?.page || 1).toString(),
        limit: (pagination?.limit || 20).toString(),
      })
      
      if (statusFilter) params.append('status', statusFilter)
      if (typeFilter) params.append('type', typeFilter)
      
      const response = await fetch(`/api/admin/services?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch services')
      }
      
      const responseData: ServicesResponse = await response.json()
      if (responseData.success && responseData.data) {
        setServices(responseData.data.services || [])
        setPagination(responseData.data.pagination || { page: 1, limit: 20, total: 0, pages: 0 })
      } else {
        throw new Error('Failed to fetch services')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Edit className="w-4 h-4 text-gray-400" />
      case 'PUBLISHED':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'ARCHIVED':
        return <Archive className="w-4 h-4 text-gray-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800'
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'MENTORSHIP':
        return <Users className="w-4 h-4 text-blue-500" />
      case 'ADVISORY':
        return <DollarSign className="w-4 h-4 text-purple-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const formatPrice = (price: number | undefined | null) => {
    if (price === undefined || price === null) {
      return 'Not set'
    }
    return `$${(price / 100).toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleViewService = (service: Service) => {
    setSelectedService(service)
    setShowViewModal(true)
  }

  const handleEditService = (service: Service) => {
    // Navigate to edit page
    window.location.href = `/admin/services/edit/${service.id}`
  }

  const handleDeleteService = (service: Service) => {
    setSelectedService(service)
    setShowDeleteModal(true)
  }

  const confirmDeleteService = async () => {
    if (!selectedService) return

    try {
      setActionLoading(true)
      const response = await fetch(`/api/admin/services/${selectedService.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete service')
      }

      // Refresh services list
      await fetchServices()
      setShowDeleteModal(false)
      setSelectedService(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete service')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading && (services?.length || 0) === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Services Management</h1>
        </div>
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
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
          <h1 className="text-2xl font-bold text-gray-900">Services Management</h1>
          <p className="text-gray-600">Manage your mentorship and advisory services</p>
        </div>
        <Link
          href="/admin/services/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Service
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center space-x-4">
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">
                Filter by Status
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-1 block w-48 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <div>
              <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700">
                Filter by Type
              </label>
              <select
                id="type-filter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="mt-1 block w-48 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">All Types</option>
                <option value="MENTORSHIP">Mentorship</option>
                <option value="ADVISORY">Advisory</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchServices}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Services Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Services ({pagination?.total || 0})
            </h3>
          </div>

          {(services?.length || 0) === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No services found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter || typeFilter
                  ? 'Try adjusting your filters to see more results.'
                  : 'Get started by creating your first service.'}
              </p>
              <div className="mt-6">
                <Link
                  href="/admin/services/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Service
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pricing
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(services || []).map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{service.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {service.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getTypeIcon(service.type)}
                          <span className="ml-2 text-sm text-gray-900">
                            {service.type === 'MENTORSHIP' ? 'Mentorship' : 'Advisory'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                          {getStatusIcon(service.status)}
                          <span className="ml-1">{service.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="space-y-1">
                          {service.singleSessionPrice && (
                            <div>Session: {formatPrice(service.singleSessionPrice)}</div>
                          )}
                          {service.monthlyPlanPrice && (
                            <div>Monthly: {formatPrice(service.monthlyPlanPrice)}</div>
                          )}
                          {service.hourlyRate && (
                            <div>Hourly: {formatPrice(service.hourlyRate)}</div>
                          )}
                          {!service.singleSessionPrice && !service.monthlyPlanPrice && !service.hourlyRate && (
                            <div className="text-gray-400">No pricing set</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(service.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewService(service)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="View Service"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditService(service)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                            title="Edit Service"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteService(service)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete Service"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
                  onClick={() => setPagination(prev => ({ ...prev, page: (prev?.page || 1) - 1 }))}
                  disabled={(pagination?.page || 1) === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: (prev?.page || 1) + 1 }))}
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
                      onClick={() => setPagination(prev => ({ ...prev, page: (prev?.page || 1) - 1 }))}
                      disabled={(pagination?.page || 1) === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: (prev?.page || 1) + 1 }))}
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

      {/* View Service Modal */}
      {showViewModal && selectedService && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Service Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedService.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedService.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <div className="mt-1 flex items-center">
                      {getTypeIcon(selectedService.type)}
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedService.type === 'MENTORSHIP' ? 'Mentorship' : 'Advisory'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedService.status)}`}>
                      {getStatusIcon(selectedService.status)}
                      <span className="ml-1">{selectedService.status}</span>
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pricing</label>
                  <div className="mt-1 space-y-2">
                    {selectedService.singleSessionPrice && (
                      <div className="text-sm text-gray-900">
                        Single Session: {formatPrice(selectedService.singleSessionPrice)}
                      </div>
                    )}
                    {selectedService.monthlyPlanPrice && (
                      <div className="text-sm text-gray-900">
                        Monthly Plan: {formatPrice(selectedService.monthlyPlanPrice)}
                      </div>
                    )}
                    {selectedService.hourlyRate && (
                      <div className="text-sm text-gray-900">
                        Hourly Rate: {formatPrice(selectedService.hourlyRate)}
                      </div>
                    )}
                    {!selectedService.singleSessionPrice && !selectedService.monthlyPlanPrice && !selectedService.hourlyRate && (
                      <div className="text-sm text-gray-400">No pricing set</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Service Modal */}
      {showDeleteModal && selectedService && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              
              <div className="mt-4 text-center">
                <h3 className="text-lg font-medium text-gray-900">Delete Service</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete "{selectedService.name}"? This action cannot be undone.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-center space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteService}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {actionLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
