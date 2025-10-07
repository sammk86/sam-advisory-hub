'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Target, 
  Calendar, 
  CreditCard,
  MessageCircle,
  Clock,
  TrendingUp,
  BookOpen,
  ArrowRight,
  Bell
} from 'lucide-react'
import Button from '@/components/ui/Button'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DashboardCard from '@/components/dashboard/DashboardCard'
import { StatusBadge } from '@/components/ui/StatusBadge'

interface DashboardData {
  user: {
    id: string
    name: string
    email: string
    role: string
  }
  roadmapProgress: Array<{
    enrollmentId: string
    serviceName: string
    serviceType: string
    progress: number
    totalTasks: number
    completedTasks: number
    milestones: Array<{
      id: string
      title: string
      status: string
      totalTasks: number
      completedTasks: number
    }>
    hasRoadmap: boolean
    roadmapId?: string
  }>
  overallProgress: number
  stats: {
    totalEnrollments: number
    totalTasks: number
    completedTasks: number
    overdueTasks: number
    tasksDueSoon: number
  }
  latestMessages: Array<{
    id: string
    content: string
    createdAt: string
    sender: {
      id: string
      name: string
      email: string
      image?: string
    }
    conversationId: string
  }>
  upcomingSessions: any[]
  overdueTasks: Array<{
    id: string
    title: string
    dueDate: string
    milestone: {
      title: string
    }
  }>
  tasksDueSoon: Array<{
    id: string
    title: string
    dueDate: string
    milestone: {
      title: string
    }
  }>
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Check for success message from registration
  const isNewRegistration = searchParams.get('success') === 'true'
  const enrollmentId = searchParams.get('enrollment')
  const subscriptionId = searchParams.get('subscription')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Redirect admin users to admin dashboard
    if (session.user.role === 'ADMIN') {
      router.push('/admin/dashboard')
      return
    }

    fetchDashboardData()
  }, [session, status, router])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/user')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      const data = await response.json()
      setDashboardData(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return formatDate(dateString)
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 50) return 'bg-blue-500'
    if (progress >= 25) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (status === 'loading' || isLoading) {
    return (
      <DashboardLayout
        title="Dashboard"
        description="Your learning progress and activities"
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout
        title="Dashboard"
        description="Your learning progress and activities"
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Show success message for new registrations
  if (isNewRegistration) {
    return (
      <DashboardLayout
        title="Welcome to SamAdvisoryHub!"
        description="Your enrollment has been successfully created"
      >
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to SamAdvisoryHub!
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Your enrollment has been successfully created and payment processed.
          </p>
          
          {enrollmentId && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6 max-w-md mx-auto">
              <div className="text-sm text-green-800">
                <strong>Enrollment ID:</strong> {enrollmentId}
                {subscriptionId && (
                  <>
                    <br />
                    <strong>Subscription ID:</strong> {subscriptionId}
                  </>
                )}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Confirmation Email</h3>
              <p className="text-sm text-gray-600">Check your inbox for enrollment details</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Mentor Matching</h3>
              <p className="text-sm text-gray-600">We'll match you within 24-48 hours</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">First Session</h3>
              <p className="text-sm text-gray-600">Schedule and begin your journey</p>
            </div>
          </div>

          <Button 
            onClick={() => {
              // Clear URL parameters and continue to dashboard
              router.push('/dashboard')
            }}
            size="lg"
            className="px-8"
          >
            Continue to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  if (!dashboardData) {
    return (
      <DashboardLayout
        title="Dashboard"
        description="Your learning progress and activities"
      >
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Active Programs</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You don't have any active programs. Contact the admin to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => router.push('/dashboard/messages')}
              className="px-6 py-3"
            >
              Contact Admin
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/services')}
              className="px-6 py-3"
            >
              Browse Services
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Dashboard"
      description="Your learning progress and activities"
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {dashboardData.user.name || 'there'}!
          </h1>
          <p className="text-blue-100">
            Here's your learning progress and latest updates
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.overallProgress}%</p>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.stats.completedTasks}/{dashboardData.stats.totalTasks}
                </p>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.overdueTasks}</p>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Due Soon</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.tasksDueSoon}</p>
              </div>
            </div>
          </DashboardCard>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Roadmap Progress */}
          <div className="lg:col-span-2">
            <DashboardCard title="Your Roadmaps" subtitle={`${dashboardData.roadmapProgress.length} active program(s)`}>
              <div className="space-y-6">
                {dashboardData.roadmapProgress.map((roadmap) => (
                  <div key={roadmap.enrollmentId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{roadmap.serviceName}</h3>
                        <p className="text-sm text-gray-600">{roadmap.serviceType}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{roadmap.progress}%</p>
                        <p className="text-sm text-gray-600">
                          {roadmap.completedTasks}/{roadmap.totalTasks} tasks
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(roadmap.progress)}`}
                          style={{ width: `${roadmap.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Milestones */}
                    {roadmap.milestones.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Milestones:</h4>
                        {roadmap.milestones.map((milestone) => (
                          <div key={milestone.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{milestone.title}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-500">
                                {milestone.completedTasks}/{milestone.totalTasks}
                              </span>
                              <StatusBadge status={milestone.status.toLowerCase() as any} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {roadmap.hasRoadmap && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/roadmap`)}
                          className="w-full"
                        >
                          View Full Roadmap
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </DashboardCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Latest Messages */}
            <DashboardCard title="Latest Messages" subtitle={`${dashboardData.latestMessages.length} message(s)`}>
              <div className="space-y-3">
                {dashboardData.latestMessages.length > 0 ? (
                  dashboardData.latestMessages.map((message) => (
                    <div key={message.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <MessageCircle className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {message.sender.name || 'Admin'}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {message.content}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimeAgo(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No messages yet</p>
                  </div>
                )}
                
                {dashboardData.latestMessages.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/dashboard/messages')}
                    className="w-full"
                  >
                    View All Messages
                  </Button>
                )}
              </div>
            </DashboardCard>

            {/* Overdue Tasks */}
            {dashboardData.overdueTasks.length > 0 && (
              <DashboardCard title="Overdue Tasks" subtitle={`${dashboardData.overdueTasks.length} task(s)`}>
                <div className="space-y-3">
                  {dashboardData.overdueTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="border border-red-200 bg-red-50 rounded-lg p-3">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-red-900">{task.title}</p>
                          <p className="text-xs text-red-700">{task.milestone.title}</p>
                          <p className="text-xs text-red-600 mt-1">
                            Due: {formatDate(task.dueDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {dashboardData.overdueTasks.length > 3 && (
                    <p className="text-sm text-gray-600 text-center">
                      +{dashboardData.overdueTasks.length - 3} more overdue tasks
                    </p>
                  )}
                </div>
              </DashboardCard>
            )}

            {/* Tasks Due Soon */}
            {dashboardData.tasksDueSoon.length > 0 && (
              <DashboardCard title="Due Soon" subtitle={`${dashboardData.tasksDueSoon.length} task(s)`}>
                <div className="space-y-3">
                  {dashboardData.tasksDueSoon.slice(0, 3).map((task) => (
                    <div key={task.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-3">
                      <div className="flex items-start space-x-3">
                        <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-yellow-900">{task.title}</p>
                          <p className="text-xs text-yellow-700">{task.milestone.title}</p>
                          <p className="text-xs text-yellow-600 mt-1">
                            Due: {formatDate(task.dueDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {dashboardData.tasksDueSoon.length > 3 && (
                    <p className="text-sm text-gray-600 text-center">
                      +{dashboardData.tasksDueSoon.length - 3} more tasks due soon
                    </p>
                  )}
                </div>
              </DashboardCard>
            )}

            {/* Quick Actions */}
            <DashboardCard title="Quick Actions">
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/roadmap')}
                  className="w-full justify-start"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Roadmap
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/messages')}
                  className="w-full justify-start"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Messages
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // If user has active services, open calendar directly
                    if (dashboardData.roadmapProgress.length > 0) {
                      const calendlyUrl = 'https://calendly.com/sam-mokhtari'
                      window.open(calendlyUrl, '_blank')
                    } else {
                      // Otherwise, go to sessions page
                      router.push('/dashboard/sessions')
                    }
                  }}
                  className="w-full justify-start"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Session
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/billing')}
                  className="w-full justify-start"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Billing
                </Button>
              </div>
            </DashboardCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}