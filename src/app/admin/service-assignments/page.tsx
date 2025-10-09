'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  Search, 
  Filter, 
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Calendar,
  Eye,
  UserCheck,
  UserX,
  Package,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { StatusBadge } from '@/components/ui/StatusBadge'

interface User {
  id: string
  email: string
  name: string | null
  role: string
  isConfirmed: boolean | null
  confirmedAt: string | null
  confirmedBy: string | null
  rejectionReason: string | null
  sessionStatus: string
  sessionActivatedAt: string | null
  sessionActivatedBy: string | null
  createdAt: string
  updatedAt: string
}

interface Service {
  id: string
  name: string
  description: string
  type: string
  status: string
  oneOffPrice: number | null
  hourlyRate: number | null
  createdAt: string
}

interface ServiceAssignment {
  id: string
  userId: string
  serviceId: string
  assignedAt: string
  expiresAt: string | null
  assignedBy: string
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED'
  user: User
  service: Service
}

interface UserFilters {
  status: 'all' | 'pending' | 'confirmed' | 'rejected'
  role: 'all' | 'ADMIN' | 'CLIENT'
  search: string
  expiryStatus: 'all' | 'active' | 'expired' | 'expiring_soon'
}

export default function ServiceAssignmentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [assignments, setAssignments] = useState<ServiceAssignment[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [filters, setFilters] = useState<UserFilters>({
    status: 'all',
    role: 'all',
    search: '',
    expiryStatus: 'all'
  })
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [selectedService, setSelectedService] = useState<string>('')
  const [expiryDate, setExpiryDate] = useState<string>('')

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

    fetchData()
  }, [session, status, router])

  useEffect(() => {
    filterUsers()
  }, [users, filters])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [usersRes, servicesRes, assignmentsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/services?status=PUBLISHED'),
        fetch('/api/admin/service-assignments')
      ])

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users || [])
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json()
        const servicesList = servicesData.data?.services || servicesData.services || []
        setServices(servicesList)
      }

      if (assignmentsRes.ok) {
        const assignmentsData = await assignmentsRes.json()
        setAssignments(assignmentsData.assignments || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = [...users]

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(user => {
        if (filters.status === 'pending') {
          return user.isConfirmed === false && !user.rejectionReason
        } else if (filters.status === 'confirmed') {
          return user.isConfirmed === true
        } else if (filters.status === 'rejected') {
          return user.isConfirmed === false && user.rejectionReason
        }
        return true
      })
    }

    // Filter by role
    if (filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role)
    }

    // Filter by expiry status
    if (filters.expiryStatus !== 'all') {
      filtered = filtered.filter(user => {
        const userAssignments = getUserAssignments(user.id)
        if (userAssignments.length === 0) return false
        
        return userAssignments.some(assignment => {
          if (filters.expiryStatus === 'active') {
            return !isServiceExpired(assignment.expiresAt)
          } else if (filters.expiryStatus === 'expired') {
            return isServiceExpired(assignment.expiresAt)
          } else if (filters.expiryStatus === 'expiring_soon') {
            if (!assignment.expiresAt || isServiceExpired(assignment.expiresAt)) return false
            const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            return new Date(assignment.expiresAt) <= sevenDaysFromNow
          }
          return true
        })
      })
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchLower) ||
        (user.name && user.name.toLowerCase().includes(searchLower))
      )
    }

    setFilteredUsers(filtered)
  }


  const handleRemoveService = async (enrollmentId: string) => {
    if (!confirm('Are you sure you want to remove this service assignment?')) {
      return
    }

    setActionLoading(enrollmentId)
    try {
      const response = await fetch(`/api/admin/service-assignments?enrollmentId=${enrollmentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchData()
        alert('Service assignment removed successfully!')
      } else {
        console.error('Error removing service assignment')
        alert('Failed to remove service assignment. Please try again.')
      }
    } catch (error) {
      console.error('Error removing service assignment:', error)
      alert('An error occurred while removing the service assignment. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleBulkAssignService = async () => {
    if (!selectedService || selectedUsers.length === 0 || !expiryDate) return

    setActionLoading('bulk')
    try {
      const promises = selectedUsers.map(userId =>
        fetch('/api/admin/service-assignments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, serviceId: selectedService, expiresAt: expiryDate }),
        })
      )

      const responses = await Promise.all(promises)
      
      // Check if all requests were successful
      const allSuccessful = responses.every(response => response.ok)
      
      if (allSuccessful) {
        // Refresh data and show success
        await fetchData()
        setSelectedUsers([])
        setShowAssignmentModal(false)
        setSelectedService('')
        setExpiryDate('')
        
        // Show success message (you could add a toast notification here)
        alert(`Successfully assigned service to ${selectedUsers.length} user(s)!`)
      } else {
        // Show detailed error message
        const failedResponses = responses.filter(response => !response.ok)
        const failedCount = failedResponses.length
        
        // Log detailed error information and collect error messages
        const errorMessages = []
        for (const response of failedResponses) {
          try {
            const errorData = await response.json()
            console.error('Assignment error:', errorData)
            errorMessages.push(errorData.error || 'Unknown error')
          } catch (e) {
            console.error('Assignment error (no JSON):', response.status, response.statusText)
            errorMessages.push(`HTTP ${response.status}: ${response.statusText}`)
          }
        }
        
        const uniqueErrors = [...new Set(errorMessages)]
        const errorText = uniqueErrors.length > 0 ? `\n\nErrors: ${uniqueErrors.join(', ')}` : ''
        alert(`Failed to assign service to ${failedCount} user(s).${errorText}`)
      }
    } catch (error) {
      console.error('Error performing bulk assignment:', error)
      alert('An error occurred while assigning services. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (user: User) => {
    if (user.isConfirmed === true) {
      return <StatusBadge status="confirmed" />
    } else if (user.isConfirmed === false && user.rejectionReason) {
      return <StatusBadge status="rejected" />
    } else {
      return <StatusBadge status="pending" />
    }
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      ADMIN: 'bg-purple-100 text-purple-800',
      CLIENT: 'bg-blue-100 text-blue-800'
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {role}
      </span>
    )
  }

  const getSessionStatusBadge = (sessionStatus: string) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      SUSPENDED: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[sessionStatus as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {sessionStatus}
      </span>
    )
  }

  const getUserAssignments = (userId: string) => {
    return assignments.filter(assignment => assignment.userId === userId)
  }

  const isServiceExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  const formatExpiryDate = (expiresAt: string | null) => {
    if (!expiresAt) return <span className="text-gray-500">No expiry</span>
    const date = new Date(expiresAt)
    const isExpired = isServiceExpired(expiresAt)
    const isExpiringSoon = new Date(expiresAt) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    
    return (
      <div className="flex flex-col">
        <span className={`font-medium ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : 'text-gray-600'}`}>
          {date.toLocaleDateString()}
        </span>
        {isExpired && (
          <span className="text-xs text-red-500 font-medium">EXPIRED</span>
        )}
        {!isExpired && isExpiringSoon && (
          <span className="text-xs text-orange-500 font-medium">Expires Soon</span>
        )}
      </div>
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
          <h1 className="text-2xl font-bold text-gray-900">Service Assignments</h1>
          <p className="text-gray-600">Assign services to users so they can schedule meetings</p>
          {services.length === 0 && (
            <p className="text-sm text-amber-600 mt-2">
              No services available. <a href="/admin/services/create" className="text-blue-600 hover:underline">Create a service</a> first.
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => window.open('/admin/services/create', '_blank')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Service
          </Button>
          <Button
            onClick={() => setShowAssignmentModal(true)}
            disabled={selectedUsers.length === 0 || services.length === 0}
          >
            <Package className="w-4 h-4 mr-2" />
            Assign Service ({selectedUsers.length})
          </Button>
        </div>
      </div>

      {/* Filters */}
      <DashboardCard>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="CLIENT">Client</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Status</label>
            <select
              value={filters.expiryStatus}
              onChange={(e) => setFilters({ ...filters, expiryStatus: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Expiry Status</option>
              <option value="active">Active Services</option>
              <option value="expired">Expired Services</option>
              <option value="expiring_soon">Expiring Soon</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => setFilters({ status: 'all', role: 'all', search: '', expiryStatus: 'all' })}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </DashboardCard>

      {/* Users Table */}
      <DashboardCard title="Users" subtitle={`${filteredUsers.length} user(s) found`}>
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
                        setSelectedUsers(filteredUsers.map(user => user.id))
                      } else {
                        setSelectedUsers([])
                      }
                    }}
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Services
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const userAssignments = getUserAssignments(user.id)
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id])
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                          }
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || 'No name'}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSessionStatusBadge(user.sessionStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {userAssignments.map((assignment) => (
                          <div key={assignment.id} className="flex items-center gap-1">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                isServiceExpired(assignment.expiresAt)
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {assignment.service.name}
                            </span>
                            <button
                              onClick={() => handleRemoveService(assignment.id)}
                              disabled={actionLoading === assignment.id}
                              className="text-red-600 hover:text-red-800 text-xs"
                              title="Remove service"
                            >
                              <XCircle className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        {userAssignments.length === 0 && (
                          <span className="text-sm text-gray-500">No services assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {userAssignments.length > 0 ? (
                          <div className="space-y-1">
                            {userAssignments.map((assignment) => (
                              <div key={assignment.id}>
                                {formatExpiryDate(assignment.expiresAt)}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </DashboardCard>

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Assign Service to Selected Users</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-800 mb-3">Select Service</label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                >
                  <option value="">Choose a service...</option>
                  {services.length > 0 ? (
                    services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - {service.type}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No services available</option>
                  )}
                </select>
                {services.length === 0 && (
                  <p className="text-sm text-red-600 mt-2 font-medium">
                    No published services found. Please create and publish services first.
                  </p>
                )}
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-800 mb-3">Expiry Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
                <p className="text-xs text-gray-600 mt-2">Expiry date is required for all service assignments</p>
              </div>
              
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800">
                  This will assign the selected service to <span className="font-bold">{selectedUsers.length}</span> user(s).
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAssignmentModal(false)
                    setSelectedService('')
                    setExpiryDate('')
                  }}
                  className="px-6 py-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkAssignService}
                  disabled={!selectedService || !expiryDate || actionLoading === 'bulk'}
                  className="px-6 py-2"
                >
                  {actionLoading === 'bulk' ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Assigning...
                    </div>
                  ) : (
                    'Assign Service'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
