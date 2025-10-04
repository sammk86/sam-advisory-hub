'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Calendar, User, FileText, MessageCircle, Clock, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DashboardCard from '@/components/dashboard/DashboardCard'
import ProgressBar from '@/components/dashboard/ProgressBar'
import StatusBadge from '@/components/dashboard/StatusBadge'

interface AdvisoryEnrollment {
  id: string
  planType: string
  status: string
  goals: string
  experience: string
  industry: string
  createdAt: string
  advisor?: {
    id: string
    name: string
    title: string
    avatar?: string
  }
  projects: Array<{
    id: string
    title: string
    description: string
    status: string
    hoursAllocated: number
    hoursUsed: number
    deliverables: Array<{
      id: string
      title: string
      type: string
      status: string
      dueDate: string
    }>
  }>
  upcomingMeetings: Array<{
    id: string
    scheduledAt: string
    duration: number
    type: string
  }>
}

export default function AdvisoryDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [enrollment, setEnrollment] = useState<AdvisoryEnrollment | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchAdvisoryData()
  }, [session, status, router])

  const fetchAdvisoryData = async () => {
    try {
      const response = await fetch('/api/enrollments/advisory')
      if (!response.ok) {
        throw new Error('Failed to fetch advisory data')
      }
      const data = await response.json()
      setEnrollment(data.enrollment)
    } catch (error) {
      console.error('Error fetching advisory data:', error)
      // For now, show mock data
      setEnrollment({
        id: 'mock-enrollment',
        planType: 'HOURLY',
        status: 'ACTIVE',
        goals: 'Develop go-to-market strategy for new SaaS product launch',
        experience: 'senior',
        industry: 'technology',
        createdAt: new Date().toISOString(),
        advisor: {
          id: 'mock-advisor',
          name: 'Michael Chen',
          title: 'Former VP of Product at Stripe',
        },
        projects: [
          {
            id: 'project-1',
            title: 'Go-to-Market Strategy',
            description: 'Comprehensive strategy for SaaS product launch',
            status: 'IN_PROGRESS',
            hoursAllocated: 20,
            hoursUsed: 8,
            deliverables: [
              {
                id: 'del-1',
                title: 'Market Analysis Report',
                type: 'DOCUMENT',
                status: 'COMPLETED',
                dueDate: '2024-01-15',
              },
              {
                id: 'del-2',
                title: 'Pricing Strategy Framework',
                type: 'DOCUMENT',
                status: 'IN_PROGRESS',
                dueDate: '2024-01-30',
              },
              {
                id: 'del-3',
                title: 'Launch Timeline & Milestones',
                type: 'DOCUMENT',
                status: 'PENDING',
                dueDate: '2024-02-15',
              },
            ],
          },
        ],
        upcomingMeetings: [
          {
            id: '1',
            scheduledAt: '2024-01-22T14:00:00Z',
            duration: 90,
            type: 'Strategy Review Session',
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!enrollment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Advisory Enrollment Found</h2>
          <p className="text-gray-600 mb-4">You don't have an active advisory enrollment.</p>
          <Button onClick={() => router.push('/')}>
            Explore Advisory Services
          </Button>
        </div>
      </div>
    )
  }

  const currentProject = enrollment.projects[0] // For demo, show first project

  return (
    <DashboardLayout
      title="Advisory Dashboard"
      description="Track your projects and connect with your advisor"
      actions={
        <>
          <Button variant="outline">
            <MessageCircle className="w-4 h-4 mr-2" />
            Message Advisor
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Session
          </Button>
        </>
      }
    >
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Project */}
          {currentProject && (
            <DashboardCard 
              title="Current Project"
              actions={<StatusBadge status={currentProject.status} />}
            >
              <h3 className="text-xl font-medium text-gray-900 mb-2">{currentProject.title}</h3>
              <p className="text-gray-600 mb-4">{currentProject.description}</p>

              {/* Hours Usage */}
              <ProgressBar
                progress={(currentProject.hoursUsed / currentProject.hoursAllocated) * 100}
                label="Hours Used"
                showPercentage={false}
                color="purple"
                className="mb-2"
              />
              <div className="text-sm text-gray-600 mb-6">
                {currentProject.hoursUsed} / {currentProject.hoursAllocated} hours used
              </div>

              {/* Deliverables */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Deliverables</h4>
                <div className="space-y-3">
                  {currentProject.deliverables.map((deliverable) => (
                    <div key={deliverable.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${
                        deliverable.status === 'COMPLETED' ? 'bg-green-500' :
                        deliverable.status === 'IN_PROGRESS' ? 'bg-purple-500' : 'bg-gray-300'
                      }`}></div>
                      <FileText className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{deliverable.title}</div>
                        <div className="text-sm text-gray-500">Due: {new Date(deliverable.dueDate).toLocaleDateString()}</div>
                      </div>
                      <StatusBadge status={deliverable.status} size="sm" />
                    </div>
                  ))}
                </div>
              </div>
            </DashboardCard>
          )}

          {/* Upcoming Sessions */}
          <DashboardCard title="Upcoming Sessions">
            {enrollment.upcomingMeetings.length > 0 ? (
              <div className="space-y-3">
                {enrollment.upcomingMeetings.map((meeting) => (
                  <div key={meeting.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-purple-600" />
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
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">Join</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Sessions</h3>
                <p className="text-gray-600 mb-4">Schedule your next advisory session</p>
                <Button className="bg-purple-600 hover:bg-purple-700">Schedule Session</Button>
              </div>
            )}
          </DashboardCard>

          {/* Recent Activity */}
          <DashboardCard title="Recent Activity">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">Market Analysis Report completed</div>
                  <div className="text-sm text-gray-500">2 days ago</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">Strategy session scheduled</div>
                  <div className="text-sm text-gray-500">3 days ago</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">Project kickoff meeting completed</div>
                  <div className="text-sm text-gray-500">1 week ago</div>
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Advisor Info */}
          <DashboardCard title="Your Advisor">
            {enrollment.advisor ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-600" />
                </div>
                <h4 className="font-medium text-gray-900">{enrollment.advisor.name}</h4>
                <p className="text-sm text-gray-600 mb-4">{enrollment.advisor.title}</p>
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
                <h4 className="font-medium text-gray-900 mb-2">Advisor Assignment Pending</h4>
                <p className="text-sm text-gray-600">We're finding the perfect advisor for you</p>
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
              Purchase More Hours
            </Button>
          </DashboardCard>

          {/* Project Goals */}
          <DashboardCard title="Project Goals">
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-purple-600 mt-0.5" />
              <p className="text-gray-700 text-sm leading-relaxed">{enrollment.goals}</p>
            </div>
          </DashboardCard>
        </div>
      </div>
    </DashboardLayout>
  )
}