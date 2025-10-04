'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle, 
  XCircle, 
  Clock,
  Mail,
  Calendar,
  Eye,
  UserCheck,
  UserX
} from 'lucide-react'
import Button from '@/components/ui/Button'
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
  createdAt: string
  updatedAt: string
}

interface UserFilters {
  status: 'all' | 'pending' | 'confirmed' | 'rejected'
  role: 'all' | 'ADMIN' | 'CLIENT'
  search: string
}

export default function UserManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<UserFilters>({
    status: 'all',
    role: 'all',
    search: ''
  })
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN' || !session.user.isConfirmed) {
      router.push('/unauthorized')
      return
    }

    fetchUsers()
  }, [session, status, router])

  useEffect(() => {
    filterUsers()
  }, [users, filters])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      // Mock data for demo
      setUsers([
        {
          id: '1',
          email: 'john.doe@example.com',
          name: 'John Doe',
          role: 'CLIENT',
          isConfirmed: true,
          confirmedAt: '2024-01-15T10:30:00Z',
          confirmedBy: 'admin-1',
          rejectionReason: null,
          createdAt: '2024-01-15T09:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          email: 'jane.smith@example.com',
          name: 'Jane Smith',
          role: 'CLIENT',
          isConfirmed: false,
          confirmedAt: null,
          confirmedBy: null,
          rejectionReason: null,
          createdAt: '2024-01-20T14:00:00Z',
          updatedAt: '2024-01-20T14:00:00Z'
        },
        {
          id: '3',
          email: 'mike.wilson@example.com',
          name: 'Mike Wilson',
          role: 'CLIENT',
          isConfirmed: false,
          confirmedAt: null,
          confirmedBy: 'admin-1',
          rejectionReason: 'Incomplete profile information',
          createdAt: '2024-01-18T11:30:00Z',
          updatedAt: '2024-01-19T16:45:00Z'
        }
      ])
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

  const handleUserAction = async (userId: string, action: 'approve' | 'reject', reason?: string) => {
    setActionLoading(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      })

      if (response.ok) {
        // Refresh users list
        await fetchUsers()
        setSelectedUsers(selectedUsers.filter(id => id !== userId))
      } else {
        console.error('Error performing user action')
      }
    } catch (error) {
      console.error('Error performing user action:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    setActionLoading('bulk')
    try {
      const promises = selectedUsers.map(userId => 
        fetch(`/api/admin/users/${userId}/${action}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        })
      )

      await Promise.all(promises)
      await fetchUsers()
      setSelectedUsers([])
    } catch (error) {
      console.error('Error performing bulk action:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (user: User) => {
    if (user.isConfirmed === true) {
      return <StatusBadge status="success" text="Confirmed" />
    } else if (user.isConfirmed === false && user.rejectionReason) {
      return <StatusBadge status="error" text="Rejected" />
    } else {
      return <StatusBadge status="warning" text="Pending" />
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
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">
            Manage user accounts, approvals, and access permissions.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/users/pending')}
            className="flex items-center space-x-2"
          >
            <Clock className="h-4 w-4" />
            <span>Pending Users</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <DashboardCard title="Filters" subtitle="Filter and search users">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
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
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Role Filter */}
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value as any })}
          >
            <option value="all">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="CLIENT">Client</option>
          </select>
        </div>
      </DashboardCard>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <DashboardCard title="Bulk Actions" subtitle={`${selectedUsers.length} user(s) selected`}>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => handleBulkAction('approve')}
              disabled={actionLoading === 'bulk'}
              className="flex items-center space-x-2"
            >
              <UserCheck className="h-4 w-4" />
              <span>Approve Selected</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleBulkAction('reject')}
              disabled={actionLoading === 'bulk'}
              className="flex items-center space-x-2"
            >
              <UserX className="h-4 w-4" />
              <span>Reject Selected</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedUsers([])}
            >
              Clear Selection
            </Button>
          </div>
        </DashboardCard>
      )}

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
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {user.isConfirmed === false && !user.rejectionReason && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleUserAction(user.id, 'approve')}
                            disabled={actionLoading === user.id}
                            className="flex items-center space-x-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            <span>Approve</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const reason = prompt('Rejection reason:')
                              if (reason) {
                                handleUserAction(user.id, 'reject', reason)
                              }
                            }}
                            disabled={actionLoading === user.id}
                            className="flex items-center space-x-1"
                          >
                            <XCircle className="h-3 w-3" />
                            <span>Reject</span>
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/admin/users/${user.id}`)}
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

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </DashboardCard>
    </div>
  )
}
