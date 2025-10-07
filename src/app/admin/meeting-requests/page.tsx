'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  MessageCircle,
  Filter,
  Search,
  Eye,
  Video
} from 'lucide-react'
import Button from '@/components/ui/Button'
import DashboardCard from '@/components/dashboard/DashboardCard'
import { StatusBadge } from '@/components/ui/StatusBadge'

interface MeetingRequest {
  id: string
  title: string
  description?: string
  requestedDate: string
  requestedTime: string
  timezone: string
  duration: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROPOSED_ALTERNATIVE'
  adminNotes?: string
  proposedDate?: string
  proposedTime?: string
  approvedAt?: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
  enrollment: {
    id: string
    service: {
      id: string
      name: string
      type: string
    }
  }
  approver?: {
    id: string
    name: string
    email: string
  }
  meeting?: {
    id: string
    title: string
    scheduledAt: string
    status: string
    videoLink?: string
  }
}

export default function AdminMeetingRequestsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [meetingRequests, setMeetingRequests] = useState<MeetingRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<MeetingRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROPOSED_ALTERNATIVE'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<MeetingRequest | null>(null)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [approvalForm, setApprovalForm] = useState({
    status: 'APPROVED' as 'APPROVED' | 'REJECTED' | 'PROPOSED_ALTERNATIVE',
    adminNotes: '',
    proposedDate: '',
    proposedTime: '',
    meetingLink: ''
  })
  const [submittingApproval, setSubmittingApproval] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/auth/signin')
      return
    }

    fetchMeetingRequests()
  }, [session, status, router])

  useEffect(() => {
    filterRequests()
  }, [meetingRequests, filter, searchQuery])

  const fetchMeetingRequests = async () => {
    try {
      const response = await fetch('/api/meeting-requests')
      if (response.ok) {
        const data = await response.json()
        setMeetingRequests(data.data?.meetingRequests || [])
      } else {
        // Mock data for development
        setMeetingRequests([
          {
            id: '1',
            title: 'Weekly Check-in',
            description: 'Regular weekly check-in to discuss progress and goals',
            requestedDate: '2024-01-25T00:00:00Z',
            requestedTime: '15:00',
            timezone: 'America/Los_Angeles',
            duration: 60,
            status: 'PENDING',
            createdAt: '2024-01-20T10:00:00Z',
            user: {
              id: 'user-1',
              name: 'John Doe',
              email: 'john@example.com'
            },
            enrollment: {
              id: 'enrollment-1',
              service: {
                id: 'service-1',
                name: 'Mentorship Program',
                type: 'MENTORSHIP'
              }
            }
          },
          {
            id: '2',
            title: 'Strategy Discussion',
            description: 'Discuss business strategy and next steps',
            requestedDate: '2024-01-26T00:00:00Z',
            requestedTime: '10:00',
            timezone: 'America/New_York',
            duration: 90,
            status: 'APPROVED',
            adminNotes: 'Approved for the requested time',
            approvedAt: '2024-01-21T14:30:00Z',
            createdAt: '2024-01-21T09:00:00Z',
            user: {
              id: 'user-2',
              name: 'Jane Smith',
              email: 'jane@example.com'
            },
            enrollment: {
              id: 'enrollment-2',
              service: {
                id: 'service-2',
                name: 'Advisory Services',
                type: 'ADVISORY'
              }
            },
            approver: {
              id: 'admin-1',
              name: 'Admin User',
              email: 'admin@example.com'
            },
            meeting: {
              id: 'meeting-1',
              title: 'Strategy Discussion',
              scheduledAt: '2024-01-26T15:00:00Z',
              status: 'SCHEDULED'
            }
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching meeting requests:', error)
      // Mock data for development
      setMeetingRequests([
        {
          id: '1',
          title: 'Weekly Check-in',
          description: 'Regular weekly check-in to discuss progress and goals',
          requestedDate: '2024-01-25T00:00:00Z',
          requestedTime: '15:00',
          timezone: 'America/Los_Angeles',
          duration: 60,
          status: 'PENDING',
          createdAt: '2024-01-20T10:00:00Z',
          user: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john@example.com'
          },
          enrollment: {
            id: 'enrollment-1',
            service: {
              id: 'service-1',
              name: 'Mentorship Program',
              type: 'MENTORSHIP'
            }
          }
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const filterRequests = () => {
    let filtered = [...meetingRequests]

    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter(request => request.status === filter)
    }

    // Search
    if (searchQuery) {
      filtered = filtered.filter(request =>
        request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.enrollment.service.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredRequests(filtered)
  }

  const handleApproval = async () => {
    if (!selectedRequest) return

    setSubmittingApproval(true)
    try {
      const response = await fetch(`/api/meeting-requests/${selectedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(approvalForm),
      })

      const data = await response.json()

      if (data.success) {
        alert('Meeting request updated successfully!')
        setShowApprovalModal(false)
        setSelectedRequest(null)
        setApprovalForm({
          status: 'APPROVED',
          adminNotes: '',
          proposedDate: '',
          proposedTime: ''
        })
        fetchMeetingRequests() // Refresh data
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error updating meeting request:', error)
      alert('Failed to update meeting request')
    } finally {
      setSubmittingApproval(false)
    }
  }

  const openApprovalModal = (request: MeetingRequest) => {
    setSelectedRequest(request)
    setApprovalForm({
      status: 'APPROVED',
      adminNotes: '',
      proposedDate: request.requestedDate.split('T')[0],
      proposedTime: request.requestedTime,
      meetingLink: ''
    })
    setShowApprovalModal(true)
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      PROPOSED_ALTERNATIVE: 'bg-blue-100 text-blue-800'
    }
    const labels = {
      PENDING: 'Pending',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      PROPOSED_ALTERNATIVE: 'Alternative Proposed'
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const getStatusCounts = () => {
    const counts = {
      all: meetingRequests.length,
      PENDING: meetingRequests.filter(r => r.status === 'PENDING').length,
      APPROVED: meetingRequests.filter(r => r.status === 'APPROVED').length,
      REJECTED: meetingRequests.filter(r => r.status === 'REJECTED').length,
      PROPOSED_ALTERNATIVE: meetingRequests.filter(r => r.status === 'PROPOSED_ALTERNATIVE').length
    }
    return counts
  }

  const statusCounts = getStatusCounts()

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meeting Requests</h1>
          <p className="text-gray-600">Manage user meeting requests</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meeting Requests</h1>
        <p className="text-gray-600">Manage user meeting requests</p>
      </div>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <DashboardCard className="text-center">
            <div className="text-2xl font-bold text-gray-900">{statusCounts.all}</div>
            <div className="text-sm text-gray-600">Total Requests</div>
          </DashboardCard>
          <DashboardCard className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.PENDING}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </DashboardCard>
          <DashboardCard className="text-center">
            <div className="text-2xl font-bold text-green-600">{statusCounts.APPROVED}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </DashboardCard>
          <DashboardCard className="text-center">
            <div className="text-2xl font-bold text-red-600">{statusCounts.REJECTED}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </DashboardCard>
          <DashboardCard className="text-center">
            <div className="text-2xl font-bold text-blue-600">{statusCounts.PROPOSED_ALTERNATIVE}</div>
            <div className="text-sm text-gray-600">Alternative</div>
          </DashboardCard>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              size="sm"
            >
              All ({statusCounts.all})
            </Button>
            <Button
              variant={filter === 'PENDING' ? 'default' : 'outline'}
              onClick={() => setFilter('PENDING')}
              size="sm"
            >
              Pending ({statusCounts.PENDING})
            </Button>
            <Button
              variant={filter === 'APPROVED' ? 'default' : 'outline'}
              onClick={() => setFilter('APPROVED')}
              size="sm"
            >
              Approved ({statusCounts.APPROVED})
            </Button>
            <Button
              variant={filter === 'REJECTED' ? 'default' : 'outline'}
              onClick={() => setFilter('REJECTED')}
              size="sm"
            >
              Rejected ({statusCounts.REJECTED})
            </Button>
            <Button
              variant={filter === 'PROPOSED_ALTERNATIVE' ? 'default' : 'outline'}
              onClick={() => setFilter('PROPOSED_ALTERNATIVE')}
              size="sm"
            >
              Alternative ({statusCounts.PROPOSED_ALTERNATIVE})
            </Button>
          </div>
        </div>

        {/* Meeting Requests List */}
        {filteredRequests.length > 0 ? (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <DashboardCard key={request.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                      {getStatusBadge(request.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        request.enrollment.service.type === 'MENTORSHIP' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {request.enrollment.service.type}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{request.user.name}</span>
                        <span className="text-gray-400">({request.user.email})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(request.requestedDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{request.requestedTime} ({request.timezone})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>{request.duration} min</span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Service:</span> {request.enrollment.service.name}
                    </div>

                    {request.description && (
                      <p className="text-gray-700 mb-3">{request.description}</p>
                    )}

                    {request.status === 'PROPOSED_ALTERNATIVE' && request.proposedDate && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                        <h5 className="font-medium text-blue-900 mb-1">Proposed Alternative:</h5>
                        <p className="text-blue-800">
                          {new Date(request.proposedDate).toLocaleDateString()} at {request.proposedTime} ({request.timezone})
                        </p>
                        {request.adminNotes && (
                          <p className="text-blue-700 mt-1">{request.adminNotes}</p>
                        )}
                      </div>
                    )}

                    {request.status === 'REJECTED' && request.adminNotes && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-3">
                        <h5 className="font-medium text-red-900 mb-1">Rejection Reason:</h5>
                        <p className="text-red-800">{request.adminNotes}</p>
                      </div>
                    )}

                    {request.status === 'APPROVED' && request.meeting && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
                        <h5 className="font-medium text-green-900 mb-1">Meeting Approved:</h5>
                        <p className="text-green-800 mb-2">
                          Scheduled for {new Date(request.meeting.scheduledAt).toLocaleDateString()} at {new Date(request.meeting.scheduledAt).toLocaleTimeString()}
                        </p>
                        {request.meeting.videoLink && (
                          <a 
                            href={request.meeting.videoLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                          >
                            <Video className="w-4 h-4 mr-1" />
                            Meeting Link
                          </a>
                        )}
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Requested on {new Date(request.createdAt).toLocaleDateString()} at {new Date(request.createdAt).toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {request.status === 'PENDING' && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => openApprovalModal(request)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => router.push(`/dashboard/messages`)}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </DashboardCard>
            ))}
          </div>
        ) : (
          <DashboardCard>
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Meeting Requests Found</h3>
              <p className="text-gray-600">
                {searchQuery ? 'No requests match your search criteria.' : 'No meeting requests have been submitted yet.'}
              </p>
            </div>
          </DashboardCard>
        )}

        {/* Approval Modal */}
        {showApprovalModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Review Meeting Request
              </h3>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">{selectedRequest.title}</h4>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>User:</strong> {selectedRequest.user.name} ({selectedRequest.user.email})
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Service:</strong> {selectedRequest.enrollment.service.name}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Requested:</strong> {new Date(selectedRequest.requestedDate).toLocaleDateString()} at {selectedRequest.requestedTime} ({selectedRequest.timezone})
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Duration:</strong> {selectedRequest.duration} minutes
                </p>
                {selectedRequest.description && (
                  <p className="text-sm text-gray-700 mb-4">{selectedRequest.description}</p>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Decision
                  </label>
                  <select
                    value={approvalForm.status}
                    onChange={(e) => setApprovalForm({ ...approvalForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="APPROVED">Approve</option>
                    <option value="REJECTED">Reject</option>
                    <option value="PROPOSED_ALTERNATIVE">Propose Alternative</option>
                  </select>
                </div>

                {(approvalForm.status === 'REJECTED' || approvalForm.status === 'PROPOSED_ALTERNATIVE') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={approvalForm.adminNotes}
                      onChange={(e) => setApprovalForm({ ...approvalForm, adminNotes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add notes for the user..."
                    />
                  </div>
                )}

                {approvalForm.status === 'PROPOSED_ALTERNATIVE' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Proposed Date
                      </label>
                      <input
                        type="date"
                        value={approvalForm.proposedDate}
                        onChange={(e) => setApprovalForm({ ...approvalForm, proposedDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Proposed Time
                      </label>
                      <input
                        type="time"
                        value={approvalForm.proposedTime}
                        onChange={(e) => setApprovalForm({ ...approvalForm, proposedTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {approvalForm.status === 'APPROVED' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meeting Link (Optional)
                    </label>
                    <input
                      type="url"
                      value={approvalForm.meetingLink}
                      onChange={(e) => setApprovalForm({ ...approvalForm, meetingLink: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://meet.google.com/abc-def-ghi or Zoom link..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Add a meeting link (Google Meet, Zoom, etc.) for the scheduled session
                    </p>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <Button 
                    onClick={handleApproval} 
                    disabled={submittingApproval}
                    className="flex-1"
                  >
                    {submittingApproval ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Submit Decision
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowApprovalModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
