'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Calendar, User, Target, BookOpen, MessageCircle, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DashboardCard from '@/components/dashboard/DashboardCard'
import ProgressBar from '@/components/dashboard/ProgressBar'
import StatusBadge from '@/components/dashboard/StatusBadge'

interface MentorshipEnrollment {
  id: string
  planType: string
  status: string
  goals: string
  experience: string
  industry: string
  createdAt: string
  mentor?: {
    id: string
    name: string
    title: string
    avatar?: string
  }
  roadmap?: {
    id: string
    title: string
    progress: number
    milestones: Array<{
      id: string
      title: string
      status: string
      dueDate: string
    }>
  }
  upcomingMeetings: Array<{
    id: string
    scheduledAt: string
    duration: number
    type: string
  }>
}

export default function MentorshipDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [enrollment, setEnrollment] = useState<MentorshipEnrollment | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchMentorshipData()
  }, [session, status, router])

  const fetchMentorshipData = async () => {
    try {
      const response = await fetch('/api/enrollments/mentorship')
      if (!response.ok) {
        throw new Error('Failed to fetch mentorship data')
      }
      const data = await response.json()
      setEnrollment(data.enrollment)
    } catch (error) {
      console.error('Error fetching mentorship data:', error)
      // For now, show mock data
      setEnrollment({
        id: 'mock-enrollment',
        planType: 'PRO',
        status: 'ACTIVE',
        goals: 'Advance to senior engineering role and develop leadership skills',
        experience: 'mid',
        industry: 'technology',
        createdAt: new Date().toISOString(),
        mentor: {
          id: 'mock-mentor',
          name: 'Sarah Johnson',
          title: 'Senior Engineering Manager at Google',
        },
        roadmap: {
          id: 'mock-roadmap',
          title: 'Senior Engineer Leadership Track',
          progress: 35,
          milestones: [
            {
              id: '1',
              title: 'Complete System Design Course',
              status: 'COMPLETED',
              dueDate: '2024-01-15',
            },
            {
              id: '2',
              title: 'Lead Cross-team Project',
              status: 'IN_PROGRESS',
              dueDate: '2024-02-28',
            },
            {
              id: '3',
              title: 'Mentor Junior Developer',
              status: 'PENDING',
              dueDate: '2024-03-15',
            },
          ],
        },
        upcomingMeetings: [
          {
            id: '1',
            scheduledAt: '2024-01-20T15:00:00Z',
            duration: 60,
            type: 'Regular Check-in',
          },
        ],
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!enrollment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Mentorship Enrollment Found</h2>
          <p className="text-gray-600 mb-4">You don't have an active mentorship enrollment.</p>
          <Button onClick={() => router.push('/')}>
            Explore Mentorship Programs
          </Button>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout
      title="Mentorship Dashboard"
      description="Track your progress and connect with your mentor"
      actions={
        <>
          <Button variant="outline">
            <MessageCircle className="w-4 h-4 mr-2" />
            Message Mentor
          </Button>
          <Button>
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Session
          </Button>
        </>
      }
    >
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Overview */}
            <DashboardCard 
              title="Your Progress"
              subtitle={`${enrollment.roadmap?.progress}% Complete`}
            >
              <ProgressBar
                progress={enrollment.roadmap?.progress || 0}
                label={enrollment.roadmap?.title}
                color="blue"
                className="mb-6"
              />

              <div className="space-y-3">
                {enrollment.roadmap?.milestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${
                      milestone.status === 'COMPLETED' ? 'bg-green-500' :
                      milestone.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-gray-300'
                    }`}></div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{milestone.title}</div>
                      <div className="text-sm text-gray-500">Due: {new Date(milestone.dueDate).toLocaleDateString()}</div>
                    </div>
                    <StatusBadge status={milestone.status} size="sm" />
                  </div>
                ))}
              </div>
            </DashboardCard>

            {/* Upcoming Sessions */}
            <DashboardCard title="Upcoming Sessions">
              
              {enrollment.upcomingMeetings.length > 0 ? (
                <div className="space-y-3">
                  {enrollment.upcomingMeetings.map((meeting) => (
                    <div key={meeting.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-medium text-gray-900">{meeting.type}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(meeting.scheduledAt).toLocaleDateString()} at{' '}
                            {new Date(meeting.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{meeting.duration} min</span>
                        <Button size="sm">Join</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Sessions</h3>
                  <p className="text-gray-600 mb-4">Schedule your next session with your mentor</p>
                  <Button>Schedule Session</Button>
                </div>
              )}
            </DashboardCard>

            {/* Resources */}
            <DashboardCard title="Learning Resources">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <BookOpen className="w-6 h-6 text-blue-600 mb-2" />
                  <h3 className="font-medium text-gray-900 mb-1">System Design Fundamentals</h3>
                  <p className="text-sm text-gray-600">Essential concepts for senior engineers</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <BarChart3 className="w-6 h-6 text-green-600 mb-2" />
                  <h3 className="font-medium text-gray-900 mb-1">Leadership Skills</h3>
                  <p className="text-sm text-gray-600">Building and leading effective teams</p>
                </div>
              </div>
            </DashboardCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Mentor Info */}
            <DashboardCard title="Your Mentor">
              {enrollment.mentor ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">{enrollment.mentor.name}</h4>
                  <p className="text-sm text-gray-600 mb-4">{enrollment.mentor.title}</p>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Meeting
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900 mb-2">Mentor Assignment Pending</h4>
                  <p className="text-sm text-gray-600">We're finding the perfect mentor for you</p>
                </div>
              )}
            </DashboardCard>

            {/* Plan Info */}
            <DashboardCard title="Your Plan">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan Type</span>
                  <span className="font-medium">{enrollment.planType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <StatusBadge status={enrollment.status} size="sm" />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Started</span>
                  <span className="font-medium">{new Date(enrollment.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                Manage Subscription
              </Button>
            </DashboardCard>

            {/* Goals */}
            <DashboardCard title="Your Goals">
              <div className="flex items-start space-x-3">
                <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                <p className="text-gray-700 text-sm leading-relaxed">{enrollment.goals}</p>
              </div>
            </DashboardCard>
          </div>
        </div>
    </DashboardLayout>
  )
}
