'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Calendar, 
  Clock, 
  Video, 
  MessageCircle, 
  Plus, 
  Filter, 
  Search, 
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
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
  enrollment: {
    id: string
    service: {
      id: string
      name: string
      type: string
    }
  }
  meeting?: {
    id: string
    title: string
    scheduledAt: string
    status: string
    videoLink?: string
  }
}

interface Session {
  id: string
  title: string
  type: 'MENTORSHIP' | 'ADVISORY'
  scheduledAt: string
  duration: number
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
  mentor?: {
    name: string
    title: string
  }
  advisor?: {
    name: string
    title: string
  }
  description?: string
  meetingUrl?: string
}

interface AssignedService {
  id: string
  name: string
  description: string
  type: string
  status: string
  hoursRemaining: number
  enrolledAt: string
  expiresAt: string | null
}

export default function SessionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [meetingRequests, setMeetingRequests] = useState<MeetingRequest[]>([])
  const [assignedServices, setAssignedServices] = useState<AssignedService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sessionInactive, setSessionInactive] = useState(false)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestForm, setRequestForm] = useState({
    enrollmentId: '',
    title: '',
    description: '',
    requestedDate: '',
    requestedTime: '',
    timezone: 'America/Los_Angeles',
    duration: 60
  })
  const [submittingRequest, setSubmittingRequest] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchData()
  }, [session, status, router])

  const fetchData = async () => {
    try {
      // Fetch all data first - use fixed enrollments API
      const timestamp = Date.now()
      const [userResponse, sessionsRes, requestsRes, enrollmentsRes] = await Promise.all([
        fetch(`/api/users/me?t=${timestamp}`),
        fetch(`/api/sessions?t=${timestamp}`),
        fetch(`/api/meeting-requests?t=${timestamp}`),
        fetch(`/api/enrollments?t=${timestamp}`) // Use fixed enrollments API
      ])

      // Check user session status and enrollments
      let userData = null
      let hasActiveEnrollments = false
      let assignedServices = []

      if (userResponse.ok) {
        userData = await userResponse.json()
      }

      if (enrollmentsRes.ok) {
        const enrollmentsData = await enrollmentsRes.json()
        assignedServices = enrollmentsData.data?.assignedServices || []
        hasActiveEnrollments = assignedServices.length > 0
        
        console.log('🔍 hasActiveEnrollments check:')
        console.log('Enrollments response ok:', enrollmentsRes.ok)
        console.log('Enrollments response status:', enrollmentsRes.status)
        console.log('Enrollments success:', enrollmentsData.success)
        console.log('Enrollments data structure:', Object.keys(enrollmentsData))
        console.log('Assigned services count:', assignedServices.length)
        console.log('hasActiveEnrollments:', hasActiveEnrollments)
        console.log('assignedServices:', assignedServices)
        
        if (assignedServices.length > 0) {
          console.log('✅ Services found in enrollments API')
        } else {
          console.log('❌ No services found in enrollments API')
        }
      } else {
        console.log('❌ Enrollments API failed:', enrollmentsRes.status)
        console.log('Enrollments response:', enrollmentsRes)
      }

      // Block access only if user has no active enrollments
      // Session status is now automatically managed based on enrollments
      console.log('🔍 Final access control check:')
      console.log('hasActiveEnrollments:', hasActiveEnrollments)
      console.log('assignedServices.length:', assignedServices.length)
      
      if (assignedServices.length === 0) {
        console.log('🚫 Blocking access - no assigned services found')
        console.log('This is why you see "No Active Services" message')
        setSessions([])
        setMeetingRequests([])
        setAssignedServices([])
        setSessionInactive(true)
        setIsLoading(false)
        return
      } else {
        console.log('✅ Allowing access - assigned services found')
        console.log('Setting assigned services:', assignedServices)
        setAssignedServices(assignedServices)
      }

      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json()
        setSessions(sessionsData.sessions || [])
      }

      if (requestsRes.ok) {
        const requestsData = await requestsRes.json()
        setMeetingRequests(requestsData.data?.meetingRequests || [])
      }

      // Assigned services are now set above in the access control logic
    } catch (error) {
      console.error('Error fetching data:', error)
      console.log('Debug info:', {
        userResponse: userResponse?.ok,
        sessionsRes: sessionsRes?.ok,
        requestsRes: requestsRes?.ok,
        enrollmentsRes: enrollmentsRes?.ok
      })
      
      // If API fails, show no services (don't use mock data)
      setSessions([])
      setMeetingRequests([])
      setAssignedServices([])
      setSessionInactive(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingRequest(true)

    try {
      // Validate form data
      if (!requestForm.enrollmentId) {
        alert('Please select a service')
        return
      }

      const response = await fetch('/api/meeting-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestForm),
      })

      const data = await response.json()

      if (data.success) {
        alert('Meeting request submitted successfully!')
        setShowRequestForm(false)
        setRequestForm({
          enrollmentId: '',
          title: '',
          description: '',
          requestedDate: '',
          requestedTime: '',
          timezone: 'America/Los_Angeles',
          duration: 60
        })
        fetchData() // Refresh data
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error submitting request:', error)
      alert('Failed to submit meeting request. Please try again.')
    } finally {
      setSubmittingRequest(false)
    }
  }

  const getRequestStatusBadge = (status: string) => {
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

  const filteredSessions = sessions.filter(session => {
    const matchesFilter = filter === 'all' || 
      (filter === 'upcoming' && session.status === 'SCHEDULED') ||
      (filter === 'past' && session.status === 'COMPLETED')
    
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const upcomingSessions = sessions.filter(s => s.status === 'SCHEDULED')
  const pastSessions = sessions.filter(s => s.status === 'COMPLETED')

  if (status === 'loading' || isLoading) {
    return (
      <DashboardLayout
        title="Services"
        description="Manage your assigned services and request meetings"
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (sessionInactive) {
    return (
      <DashboardLayout
        title="Services"
        description="Manage your assigned services and request meetings"
      >
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Services</h3>
          <p className="text-gray-600 mb-4">
            You don't have any active services assigned. Please contact the admin to assign services to you.
          </p>
          <Button onClick={() => router.push('/dashboard/messages')}>
            <MessageCircle className="w-4 h-4 mr-2" />
            Contact Admin
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Services"
      description="Manage your assigned services and request meetings"
    >
      <div className="space-y-6">
        {/* Assigned Services */}
        {assignedServices.length > 0 ? (
          <DashboardCard title="Your Assigned Services" subtitle={`${assignedServices.length} active service(s)`}>
            <div className="space-y-6">
              {/* Services List */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {assignedServices.map((service) => (
                  <div key={service.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                      <StatusBadge status={service.status.toLowerCase() as any} />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-500">Hours Remaining:</span>
                      <span className="font-medium text-blue-600">{service.hoursRemaining}</span>
                    </div>
                    {service.expiresAt && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Expires:</span>
                        <span className={`font-medium ${
                          new Date(service.expiresAt) < new Date() 
                            ? 'text-red-600' 
                            : new Date(service.expiresAt) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                            ? 'text-orange-600'
                            : 'text-gray-600'
                        }`}>
                          {new Date(service.expiresAt).toLocaleDateString()}
                          {new Date(service.expiresAt) < new Date() && ' (Expired)'}
                          {new Date(service.expiresAt) > new Date() && new Date(service.expiresAt) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && ' (Expires Soon)'}
                        </span>
                      </div>
                    )}
                    <div className="mt-3">
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          setRequestForm(prev => ({ ...prev, enrollmentId: service.id }))
                          setShowRequestForm(true)
                        }}
                        disabled={
                          service.status !== 'ACTIVE' || 
                          (service.expiresAt && new Date(service.expiresAt) < new Date()) ||
                          (service.hoursRemaining !== null && service.hoursRemaining <= 0)
                        }
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        {service.status !== 'ACTIVE' ? 'Service Inactive' :
                         service.expiresAt && new Date(service.expiresAt) < new Date() ? 'Service Expired' :
                         service.hoursRemaining !== null && service.hoursRemaining <= 0 ? 'No Hours Remaining' :
                         'Request Meeting'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Meeting Request Form */}
              {showRequestForm && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Request a Meeting</h3>
                  <form onSubmit={handleSubmitRequest} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Meeting Title *
                        </label>
                        <input
                          type="text"
                          value={requestForm.title}
                          onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                          placeholder="Enter meeting title"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration (minutes)
                        </label>
                        <select
                          value={requestForm.duration}
                          onChange={(e) => setRequestForm({ ...requestForm, duration: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        >
                          <option value={30}>30 minutes</option>
                          <option value={60}>1 hour</option>
                          <option value={90}>1.5 hours</option>
                          <option value={120}>2 hours</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={requestForm.description}
                        onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        placeholder="Describe what you'd like to discuss..."
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preferred Date *
                        </label>
                        <input
                          type="date"
                          value={requestForm.requestedDate}
                          onChange={(e) => setRequestForm({ ...requestForm, requestedDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preferred Time *
                        </label>
                        <input
                          type="time"
                          value={requestForm.requestedTime}
                          onChange={(e) => setRequestForm({ ...requestForm, requestedTime: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Timezone
                        </label>
                        <select
                          value={requestForm.timezone}
                          onChange={(e) => setRequestForm({ ...requestForm, timezone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        >
                          <option value="America/Los_Angeles">Pacific Time (PT)</option>
                          <option value="America/Denver">Mountain Time (MT)</option>
                          <option value="America/Chicago">Central Time (CT)</option>
                          <option value="America/New_York">Eastern Time (ET)</option>
                          <option value="Europe/London">London (GMT)</option>
                          <option value="Europe/Paris">Paris (CET)</option>
                          <option value="Asia/Tokyo">Tokyo (JST)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button type="submit" disabled={submittingRequest}>
                        {submittingRequest ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Plus className="w-4 h-4 mr-2" />
                        )}
                        Submit Request
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowRequestForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </DashboardCard>
        ) : (
          <DashboardCard title="No Active Services" subtitle="You don't have any active services assigned">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Services</h3>
              <p className="text-gray-600 mb-4">
                You don't have any active services assigned. Contact the admin to get services assigned to you.
              </p>
              <Button onClick={() => router.push('/dashboard/messages')}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Admin
              </Button>
            </div>
          </DashboardCard>
        )}

        {/* Meeting Requests */}
        {meetingRequests.length > 0 && (
          <DashboardCard title="Meeting Requests" subtitle={`${meetingRequests.length} request(s)`}>
            <div className="space-y-4">
              {meetingRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{request.title}</h4>
                      <p className="text-sm text-gray-600">{request.enrollment.service.name}</p>
                    </div>
                    {getRequestStatusBadge(request.status)}
                  </div>
                  
                  {request.description && (
                    <p className="text-gray-700 mb-3">{request.description}</p>
                  )}

                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Requested:</span>
                      <span className="ml-2 text-gray-900">
                        {new Date(request.requestedDate).toLocaleDateString()} at {request.requestedTime} ({request.timezone})
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <span className="ml-2 text-gray-900">{request.duration} minutes</span>
                    </div>
                  </div>

                  {request.status === 'PROPOSED_ALTERNATIVE' && request.proposedDate && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-1">Admin Proposed Alternative:</h5>
                      <p className="text-blue-800">
                        {new Date(request.proposedDate).toLocaleDateString()} at {request.proposedTime} ({request.timezone})
                      </p>
                      {request.adminNotes && (
                        <p className="text-blue-700 mt-1">{request.adminNotes}</p>
                      )}
                    </div>
                  )}

                  {request.status === 'REJECTED' && request.adminNotes && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <h5 className="font-medium text-red-900 mb-1">Admin Notes:</h5>
                      <p className="text-red-800">{request.adminNotes}</p>
                    </div>
                  )}

                  {request.status === 'APPROVED' && request.meeting && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
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
                          Join Meeting
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </DashboardCard>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search sessions..."
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
              All ({sessions.length})
            </Button>
            <Button
              variant={filter === 'upcoming' ? 'default' : 'outline'}
              onClick={() => setFilter('upcoming')}
              size="sm"
            >
              Upcoming ({upcomingSessions.length})
            </Button>
            <Button
              variant={filter === 'past' ? 'default' : 'outline'}
              onClick={() => setFilter('past')}
              size="sm"
            >
              Past ({pastSessions.length})
            </Button>
          </div>
        </div>

        {/* Sessions List */}
        {filteredSessions.length > 0 ? (
          <div className="space-y-4">
            {filteredSessions.map((session) => (
              <DashboardCard key={session.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
                      <StatusBadge status={session.status} />
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        session.type === 'MENTORSHIP' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {session.type}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(session.scheduledAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>{session.duration} min</span>
                      </div>
                    </div>

                    {session.description && (
                      <p className="text-gray-600 mb-3">{session.description}</p>
                    )}

                    <div className="flex items-center space-x-4">
                      {session.mentor && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Mentor:</span>
                          <span className="text-sm font-medium">{session.mentor.name}</span>
                          <span className="text-sm text-gray-500">({session.mentor.title})</span>
                        </div>
                      )}
                      {session.advisor && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Advisor:</span>
                          <span className="text-sm font-medium">{session.advisor.name}</span>
                          <span className="text-sm text-gray-500">({session.advisor.title})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {session.meetingUrl && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(session.meetingUrl, '_blank')}
                      >
                        <Video className="w-4 h-4 mr-1" />
                        Join Meeting
                      </Button>
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Sessions Found</h3>
              <p className="text-gray-600">
                {searchQuery ? 'No sessions match your search criteria.' : 'You don\'t have any sessions yet.'}
              </p>
            </div>
          </DashboardCard>
        )}
      </div>
    </DashboardLayout>
  )
}