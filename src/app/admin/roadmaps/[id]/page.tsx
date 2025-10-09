'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar,
  User,
  BookOpen,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import DashboardCard from '@/components/dashboard/DashboardCard'
import { StatusBadge } from '@/components/ui/StatusBadge'

interface Task {
  id: string
  title: string
  description: string | null
  resources: string[]
  dueDate: string | null
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  order: number
  createdAt: string
  updatedAt: string
}

interface Milestone {
  id: string
  title: string
  description: string | null
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  order: number
  tasks: Task[]
}

interface Roadmap {
  id: string
  title: string
  description: string | null
  createdAt: string
  updatedAt: string
  enrollment: {
    id: string
    user: {
      id: string
      name: string | null
      email: string
    }
    service: {
      id: string
      name: string
      type: string
      description: string
    }
  }
  milestones: Milestone[]
}

interface RoadmapViewPageProps {
  params: Promise<{ id: string }>
}

export default function RoadmapViewPage({ params }: RoadmapViewPageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/auth/signin')
      return
    }

    fetchRoadmap()
  }, [session, status, router])

  const fetchRoadmap = async () => {
    try {
      const { id } = await params
      const response = await fetch(`/api/roadmaps/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch roadmap')
      }
      const data = await response.json()
      setRoadmap(data.data)
    } catch (error) {
      console.error('Error fetching roadmap:', error)
      // Mock data for development
      setRoadmap({
        id: '1',
        title: 'Mentorship Program Roadmap',
        description: 'Complete learning path for mentorship program',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-15T14:30:00Z',
        enrollment: {
          id: 'enrollment-1',
          user: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john.doe@example.com'
          },
          service: {
            id: 'service-1',
            name: 'Mentorship Program',
            type: 'MENTORSHIP',
            description: 'One-on-one mentorship program'
          }
        },
        milestones: [
          {
            id: 'milestone-1',
            title: 'Foundation Phase',
            description: 'Build the foundation for your learning journey',
            status: 'COMPLETED',
            order: 0,
            tasks: [
              {
                id: 'task-1',
                title: 'Complete onboarding process',
                description: 'Review program materials and set up your learning environment',
                resources: ['https://example.com/onboarding', 'https://example.com/materials'],
                dueDate: '2024-01-10T00:00:00Z',
                status: 'COMPLETED',
                order: 0,
                createdAt: '2024-01-01T10:00:00Z',
                updatedAt: '2024-01-08T14:30:00Z'
              },
              {
                id: 'task-2',
                title: 'Set learning goals',
                description: 'Define your specific learning objectives and career goals',
                resources: ['https://example.com/goal-setting'],
                dueDate: '2024-01-15T00:00:00Z',
                status: 'COMPLETED',
                order: 1,
                createdAt: '2024-01-01T10:00:00Z',
                updatedAt: '2024-01-12T09:15:00Z'
              }
            ]
          },
          {
            id: 'milestone-2',
            title: 'Development Phase',
            description: 'Focus on skill development and practical application',
            status: 'IN_PROGRESS',
            order: 1,
            tasks: [
              {
                id: 'task-3',
                title: 'Complete technical skills assessment',
                description: 'Take the technical skills assessment to identify areas for improvement',
                resources: ['https://example.com/assessment'],
                dueDate: '2024-01-25T00:00:00Z',
                status: 'IN_PROGRESS',
                order: 0,
                createdAt: '2024-01-01T10:00:00Z',
                updatedAt: '2024-01-20T16:45:00Z'
              },
              {
                id: 'task-4',
                title: 'Attend weekly mentoring sessions',
                description: 'Participate in scheduled mentoring sessions with your assigned mentor',
                resources: ['https://example.com/mentoring-guide'],
                dueDate: '2024-01-30T00:00:00Z',
                status: 'NOT_STARTED',
                order: 1,
                createdAt: '2024-01-01T10:00:00Z',
                updatedAt: '2024-01-01T10:00:00Z'
              }
            ]
          }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!roadmap) return
    
    if (!confirm(`Are you sure you want to delete the roadmap "${roadmap.title}"? This action cannot be undone.`)) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`/api/roadmaps/${roadmap.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/admin/roadmaps')
      } else {
        const error = await response.json()
        alert(`Error deleting roadmap: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting roadmap:', error)
      alert('Failed to delete roadmap')
    } finally {
      setDeleting(false)
    }
  }

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'IN_PROGRESS':
        return <Clock className="w-5 h-5 text-blue-600" />
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
    }
  }

  const getTaskStatusBadge = (status: string) => {
    const colors = {
      COMPLETED: 'bg-green-100 text-green-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      NOT_STARTED: 'bg-gray-100 text-gray-800'
    }
    const labels = {
      COMPLETED: 'Completed',
      IN_PROGRESS: 'In Progress',
      NOT_STARTED: 'Not Started'
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const isTaskOverdue = (task: Task): boolean => {
    if (!task.dueDate || task.status === 'COMPLETED') return false
    return new Date(task.dueDate) < new Date()
  }

  const getOverallProgress = (): number => {
    if (!roadmap) return 0
    const allTasks = roadmap.milestones.flatMap(m => m.tasks)
    if (allTasks.length === 0) return 0
    const completedTasks = allTasks.filter(t => t.status === 'COMPLETED')
    return Math.round((completedTasks.length / allTasks.length) * 100)
  }

  const getOverdueTasksCount = (): number => {
    if (!roadmap) return 0
    const now = new Date()
    return roadmap.milestones.flatMap(m => m.tasks).filter(task => {
      if (!task.dueDate || task.status === 'COMPLETED') return false
      return new Date(task.dueDate) < now
    }).length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Roadmap Not Found</h2>
            <p className="text-gray-600 mb-4">The roadmap you're looking for doesn't exist or has been deleted.</p>
            <Button onClick={() => router.push('/admin/roadmaps')}>
              Back to Roadmaps
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const overallProgress = getOverallProgress()
  const overdueTasks = getOverdueTasksCount()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push('/admin/roadmaps')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Roadmaps
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{roadmap.title}</h1>
                <p className="text-gray-600">{roadmap.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/roadmaps/${roadmap.id}/edit`)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-800 border-red-300 hover:bg-red-50"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Delete
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* User and Service Info */}
          <DashboardCard title="User and Service Information">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">User Information</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Name:</span> {roadmap.enrollment.user.name || 'Not provided'}</p>
                  <p><span className="font-medium">Email:</span> {roadmap.enrollment.user.email}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Service Information</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Service:</span> {roadmap.enrollment.service.name}</p>
                  <p><span className="font-medium">Type:</span> {roadmap.enrollment.service.type}</p>
                  <p><span className="font-medium">Description:</span> {roadmap.enrollment.service.description}</p>
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* Progress Overview */}
          <DashboardCard title="Progress Overview">
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Overall Progress</span>
                <span>{overallProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {roadmap.milestones.flatMap(m => m.tasks).length}
                </div>
                <div className="text-sm text-gray-600">Total Tasks</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {roadmap.milestones.flatMap(m => m.tasks).filter(t => t.status === 'COMPLETED').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {roadmap.milestones.flatMap(m => m.tasks).filter(t => t.status === 'IN_PROGRESS').length}
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">
                  {roadmap.milestones.flatMap(m => m.tasks).filter(t => t.status === 'NOT_STARTED').length}
                </div>
                <div className="text-sm text-gray-600">Not Started</div>
              </div>
            </div>

            {overdueTasks > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-red-800 font-medium">
                    {overdueTasks} task(s) are overdue
                  </span>
                </div>
              </div>
            )}
          </DashboardCard>

          {/* Milestones */}
          <div className="space-y-6">
            {roadmap.milestones.map((milestone) => (
              <DashboardCard key={milestone.id}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{milestone.title}</h3>
                      <StatusBadge status={milestone.status.toLowerCase() as any} />
                    </div>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>

                {/* Tasks */}
                <div className="space-y-4">
                  {milestone.tasks.map((task) => (
                    <div key={task.id} className={`border rounded-lg p-4 ${
                      isTaskOverdue(task) ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
                    }`}>
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 mt-1">
                          {getTaskStatusIcon(task.status)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="text-base font-medium text-gray-900 mb-1">{task.title}</h4>
                              {task.description && (
                                <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              {getTaskStatusBadge(task.status)}
                              {isTaskOverdue(task) && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Overdue
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Task Details */}
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                            {task.dueDate && (
                              <div className={`flex items-center ${
                                isTaskOverdue(task) ? 'text-red-600' : 'text-gray-500'
                              }`}>
                                <Calendar className="w-4 h-4 mr-1" />
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                            )}
                            {task.resources.length > 0 && (
                              <div className="flex items-center">
                                <BookOpen className="w-4 h-4 mr-1" />
                                {task.resources.length} resource(s)
                              </div>
                            )}
                          </div>

                          {/* Resources */}
                          {task.resources.length > 0 && (
                            <div className="mb-3">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Resources:</h5>
                              <div className="space-y-1">
                                {task.resources.map((resource, index) => (
                                  <a
                                    key={index}
                                    href={resource}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                                  >
                                    <BookOpen className="w-3 h-3 mr-1" />
                                    {resource}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </DashboardCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

