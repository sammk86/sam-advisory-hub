'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Mail,
  Calendar,
  User,
  AlertTriangle,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { StatusBadge } from '@/components/ui/StatusBadge'

interface PendingUser {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: string
  updatedAt: string
  emailVerified: string | null
}

export default function PendingUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN' || !session.user.isConfirmed) {
      router.push('/unauthorized')
      return
    }

    fetchPendingUsers()
  }, [session, status, router])

  const fetchPendingUsers = async () => {
    try {
      const response = await fetch('/api/admin/users/pending')
      if (response.ok) {
        const data = await response.json()
        setPendingUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching pending users:', error)
      // Mock data for demo
      setPendingUsers([
        {
          id: '1',
          email: 'jane.smith@example.com',
          name: 'Jane Smith',
          role: 'CLIENT',
          createdAt: '2024-01-20T14:00:00Z',
          updatedAt: '2024-01-20T14:00:00Z',
          emailVerified: '2024-01-20T14:05:00Z'
        },
        {
          id: '2',
          email: 'alex.johnson@example.com',
          name: 'Alex Johnson',
          role: 'CLIENT',
          createdAt: '2024-01-21T09:30:00Z',
          updatedAt: '2024-01-21T09:30:00Z',
          emailVerified: '2024-01-21T09:35:00Z'
        },
        {
          id: '3',
          email: 'sarah.wilson@example.com',
          name: 'Sarah Wilson',
          role: 'CLIENT',
          createdAt: '2024-01-22T16:45:00Z',
          updatedAt: '2024-01-22T16:45:00Z',
          emailVerified: '2024-01-22T16:50:00Z'
        }
      ])
    } finally {
      setLoading(false)
    }
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
        // Remove user from pending list
        setPendingUsers(pendingUsers.filter(user => user.id !== userId))
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

  const handleBulkApprove = async () => {
    setBulkActionLoading(true)
    try {
      const promises = selectedUsers.map(userId => 
        fetch(`/api/admin/users/${userId}/approve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        })
      )

      await Promise.all(promises)
      await fetchPendingUsers()
      setSelectedUsers([])
    } catch (error) {
      console.error('Error performing bulk approve:', error)
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleBulkReject = async () => {
    const reason = prompt('Rejection reason for all selected users:')
    if (!reason) return

    setBulkActionLoading(true)
    try {
      const promises = selectedUsers.map(userId => 
        fetch(`/api/admin/users/${userId}/reject`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason }),
        })
      )

      await Promise.all(promises)
      await fetchPendingUsers()
      setSelectedUsers([])
    } catch (error) {
      console.error('Error performing bulk reject:', error)
    } finally {
      setBulkActionLoading(false)
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Pending User Approvals</h1>
          <p className="mt-2 text-gray-600">
            Review and approve or reject user registration requests.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/users')}
            className="flex items-center space-x-2"
          >
            <Users className="h-4 w-4" />
            <span>All Users</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard title="Pending Users" subtitle="Awaiting approval">
          <div className="flex items-center">
            <div className="text-3xl font-bold text-yellow-600">{pendingUsers.length}</div>
            <Clock className="ml-3 h-8 w-8 text-yellow-600" />
          </div>
        </DashboardCard>

        <DashboardCard title="Email Verified" subtitle="Users with verified emails">
          <div className="flex items-center">
            <div className="text-3xl font-bold text-green-600">
              {pendingUsers.filter(user => user.emailVerified).length}
            </div>
            <Mail className="ml-3 h-8 w-8 text-green-600" />
          </div>
        </DashboardCard>

        <DashboardCard title="Average Wait Time" subtitle="Time since registration">
          <div className="flex items-center">
            <div className="text-3xl font-bold text-blue-600">
              {pendingUsers.length > 0 ? 
                Math.round(pendingUsers.reduce((acc, user) => {
                  const hours = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60)
                  return acc + hours
                }, 0) / pendingUsers.length) : 0}h
            </div>
            <Calendar className="ml-3 h-8 w-8 text-blue-600" />
          </div>
        </DashboardCard>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <DashboardCard title="Bulk Actions" subtitle={`${selectedUsers.length} user(s) selected`}>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleBulkApprove}
              disabled={bulkActionLoading}
              className="flex items-center space-x-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Approve Selected</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleBulkReject}
              disabled={bulkActionLoading}
              className="flex items-center space-x-2"
            >
              <XCircle className="h-4 w-4" />
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

      {/* Pending Users List */}
      <DashboardCard title="Pending Users" subtitle={`${pendingUsers.length} user(s) awaiting approval`}>
        {pendingUsers.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending users</h3>
            <p className="mt-1 text-sm text-gray-500">
              All user registrations have been processed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((user) => (
              <div key={user.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
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
                    <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-white text-lg font-medium">
                        {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {user.name || 'No name provided'}
                      </h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {user.role}
                        </span>
                        {user.emailVerified ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Email Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Email Not Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Registered {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {Math.round((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60))} hours ago
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleUserAction(user.id, 'approve')}
                        disabled={actionLoading === user.id}
                        className="flex items-center space-x-1"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Approve</span>
                      </Button>
                      <Button
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
                        <XCircle className="h-4 w-4" />
                        <span>Reject</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>

      {/* Quick Actions */}
      <DashboardCard title="Quick Actions" subtitle="Common administrative tasks">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => router.push('/admin/users')}
            className="flex items-center justify-center space-x-2"
          >
            <Users className="h-4 w-4" />
            <span>View All Users</span>
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
            onClick={() => router.push('/admin/analytics')}
            className="flex items-center justify-center space-x-2"
          >
            <User className="h-4 w-4" />
            <span>User Analytics</span>
          </Button>
        </div>
      </DashboardCard>
    </div>
  )
}