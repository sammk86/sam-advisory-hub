'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, Video, MessageCircle, Plus, Filter, Search } from 'lucide-react'
import Button from '@/components/ui/Button'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DashboardCard from '@/components/dashboard/DashboardCard'
import StatusBadge from '@/components/ui/StatusBadge'

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

export default function SessionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchSessions()
  }, [session, status, router])

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/meetings')
      if (!response.ok) {
        throw new Error('Failed to fetch sessions')
      }
      const data = await response.json()
      setSessions(data.sessions || [])
    } catch (error) {
      console.error('Error fetching sessions:', error)
      // Mock data for development
      setSessions([
        {
          id: '1',
          title: 'Weekly Check-in',
          type: 'MENTORSHIP',
          scheduledAt: '2024-01-20T15:00:00Z',
          duration: 60,
          status: 'SCHEDULED',
          mentor: {
            name: 'Sarah Johnson',
            title: 'Senior Engineering Manager'
          },
          description: 'Regular weekly check-in to discuss progress and goals',
          meetingUrl: 'https://meet.google.com/abc-def-ghi'
        },
        {
          id: '2',
          title: 'Strategy Review Session',
          type: 'ADVISORY',
          scheduledAt: '2024-01-22T14:00:00Z',
          duration: 90,
          status: 'SCHEDULED',
          advisor: {
            name: 'Michael Chen',
            title: 'Former VP of Product'
          },
          description: 'Review go-to-market strategy and next steps',
          meetingUrl: 'https://meet.google.com/xyz-123-456'
        },
        {
          id: '3',
          title: 'Technical Architecture Review',
          type: 'ADVISORY',
          scheduledAt: '2024-01-15T10:00:00Z',
          duration: 120,
          status: 'COMPLETED',
          advisor: {
            name: 'Michael Chen',
            title: 'Former VP of Product'
          },
          description: 'Deep dive into system architecture and scalability'
        }
      ])
    } finally {
      setIsLoading(false)
    }
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
        title="Sessions"
        description="Manage your mentorship and advisory sessions"
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Sessions"
      description="Manage your mentorship and advisory sessions"
      actions={
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Schedule Session
        </Button>
      }
    >
      <div className="space-y-6">
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

                  <div className="flex items-center space-x-2 ml-4">
                    {session.status === 'SCHEDULED' && session.meetingUrl && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <Video className="w-4 h-4 mr-1" />
                        Join
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Message
                    </Button>
                    {session.status === 'SCHEDULED' && (
                      <Button variant="outline" size="sm">
                        Reschedule
                      </Button>
                    )}
                  </div>
                </div>
              </DashboardCard>
            ))}
          </div>
        ) : (
          <DashboardCard>
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Sessions Found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery ? 'No sessions match your search criteria.' : 'You don\'t have any sessions scheduled.'}
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Schedule Your First Session
              </Button>
            </div>
          </DashboardCard>
        )}
      </div>
    </DashboardLayout>
  )
}


