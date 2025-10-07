'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Target,
  BookOpen,
  ExternalLink,
  Filter
} from 'lucide-react'
import Button from '@/components/ui/Button'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
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
    service: {
      id: string
      name: string
      type: string
    }
  }
  milestones: Milestone[]
}

export default function UserRoadmapPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'not_started' | 'in_progress' | 'completed'>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchRoadmaps()
  }, [session, status, router])

  const fetchRoadmaps = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/roadmaps')
      if (!response.ok) {
        throw new Error('Failed to fetch roadmaps')
      }
      const data = await response.json()
      const fetchedRoadmaps = data.data || []
      setRoadmaps(fetchedRoadmaps)
      
      // Auto-select first roadmap if available
      if (fetchedRoadmaps.length > 0 && !selectedRoadmapId) {
        setSelectedRoadmapId(fetchedRoadmaps[0].id)
      }
    } catch (error) {
      console.error('Error fetching roadmaps:', error)
      // Mock data for development
      setRoadmaps([
        {
          id: '1',
          title: 'Mentorship Program Roadmap',
          description: 'Complete learning path for your mentorship program',
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-15T14:30:00Z',
          enrollment: {
            id: 'enrollment-1',
            service: {
              id: 'service-1',
              name: 'Mentorship Program',
              type: 'MENTORSHIP'
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
            },
            {
              id: 'milestone-3',
              title: 'Advanced Phase',
              description: 'Master advanced concepts and prepare for career advancement',
              status: 'NOT_STARTED',
              order: 2,
              tasks: [
                {
                  id: 'task-5',
                  title: 'Complete capstone project',
                  description: 'Work on a comprehensive project that demonstrates your learning',
                  resources: ['https://example.com/capstone-guidelines'],
                  dueDate: '2024-02-15T00:00:00Z',
                  status: 'NOT_STARTED',
                  order: 0,
                  createdAt: '2024-01-01T10:00:00Z',
                  updatedAt: '2024-01-01T10:00:00Z'
                }
              ]
            }
          ]
        }
      ])
      
      // Auto-select first roadmap in mock data
      if (fetchedRoadmaps.length > 0 && !selectedRoadmapId) {
        setSelectedRoadmapId(fetchedRoadmaps[0].id)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleTaskStatusUpdate = async (taskId: string, newStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED') => {
    setActionLoading(taskId)
    try {
      const response = await fetch(`/api/roadmaps/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Refresh roadmaps
        await fetchRoadmaps()
      } else {
        console.error('Failed to update task status')
      }
    } catch (error) {
      console.error('Error updating task status:', error)
    } finally {
      setActionLoading(null)
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

  const getOverallProgress = (roadmap: Roadmap): number => {
    const allTasks = roadmap.milestones.flatMap(m => m.tasks)
    if (allTasks.length === 0) return 0
    const completedTasks = allTasks.filter(t => t.status === 'COMPLETED')
    return Math.round((completedTasks.length / allTasks.length) * 100)
  }

  const getFilteredTasks = (roadmap: Roadmap) => {
    const allTasks = roadmap.milestones.flatMap(m => m.tasks)
    if (filter === 'all') return allTasks
    return allTasks.filter(task => {
      if (filter === 'completed') return task.status === 'COMPLETED'
      if (filter === 'in_progress') return task.status === 'IN_PROGRESS'
      if (filter === 'not_started') return task.status === 'NOT_STARTED'
      return true
    })
  }

  if (loading) {
    return (
      <DashboardLayout
        title="My Roadmap"
        description="Track your learning progress and complete tasks"
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (roadmaps.length === 0) {
    return (
      <DashboardLayout
        title="My Roadmaps"
        description="Track your learning progress and complete tasks"
      >
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Roadmaps Assigned</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You don't have any roadmaps assigned yet. Contact the admin to get personalized learning paths created for you.
          </p>
          <Button onClick={() => router.push('/dashboard/messages')}>
            Contact Admin
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const selectedRoadmap = roadmaps.find(r => r.id === selectedRoadmapId)

  return (
    <DashboardLayout
      title="My Roadmaps"
      description="Track your learning progress and complete tasks"
    >
      <div className="space-y-6">
        {/* Roadmap Selector */}
        {roadmaps.length > 1 && (
          <DashboardCard>
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                Select Roadmap:
              </label>
              <select
                className="flex-1 max-w-md p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedRoadmapId}
                onChange={(e) => setSelectedRoadmapId(e.target.value)}
              >
                {roadmaps.map((roadmap) => (
                  <option key={roadmap.id} value={roadmap.id}>
                    {roadmap.title} - {roadmap.enrollment.service.name}
                  </option>
                ))}
              </select>
            </div>
          </DashboardCard>
        )}

        {/* Selected Roadmap */}
        {selectedRoadmap && (
          <div>
            {(() => {
              const roadmap = selectedRoadmap
              const overallProgress = getOverallProgress(roadmap)
              const filteredTasks = getFilteredTasks(roadmap)
              
              return (
                <div key={roadmap.id}>
              {/* Roadmap Header */}
              <DashboardCard>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{roadmap.title}</h2>
                    <p className="text-gray-600 mb-4">{roadmap.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {roadmap.enrollment.service.name}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Created {new Date(roadmap.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overall Progress */}
                <div className="mb-6">
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

                {/* Filter */}
                <div className="flex items-center space-x-4 mb-6">
                  <span className="text-sm font-medium text-gray-700">Filter tasks:</span>
                  <div className="flex space-x-2">
                    {(['all', 'not_started', 'in_progress', 'completed'] as const).map((filterOption) => (
                      <button
                        key={filterOption}
                        onClick={() => setFilter(filterOption)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          filter === filterOption
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {filterOption.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </button>
                    ))}
                  </div>
                </div>
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
                      {milestone.tasks
                        .filter(task => {
                          if (filter === 'all') return true
                          return task.status.toLowerCase() === filter.replace('_', '')
                        })
                        .map((task) => (
                        <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 mt-1">
                              {getTaskStatusIcon(task.status)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="text-lg font-medium text-gray-900 mb-1">{task.title}</h4>
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
                                  <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    Due: {new Date(task.dueDate).toLocaleDateString()}
                                  </div>
                                )}
                                {task.resources.length > 0 && (
                                  <div className="flex items-center">
                                    <ExternalLink className="w-4 h-4 mr-1" />
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
                                        <ExternalLink className="w-3 h-3 mr-1" />
                                        {resource}
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Task Actions */}
                              <div className="flex items-center space-x-2">
                                {task.status !== 'COMPLETED' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleTaskStatusUpdate(task.id, 'COMPLETED')}
                                    disabled={actionLoading === task.id}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    {actionLoading === task.id ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    ) : (
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                    )}
                                    Mark Complete
                                  </Button>
                                )}
                                
                                {task.status === 'NOT_STARTED' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleTaskStatusUpdate(task.id, 'IN_PROGRESS')}
                                    disabled={actionLoading === task.id}
                                  >
                                    <Clock className="w-4 h-4 mr-2" />
                                    Start Task
                                  </Button>
                                )}

                                {task.status === 'COMPLETED' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleTaskStatusUpdate(task.id, 'IN_PROGRESS')}
                                    disabled={actionLoading === task.id}
                                  >
                                    <Clock className="w-4 h-4 mr-2" />
                                    Reopen
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </DashboardCard>
                ))}
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
