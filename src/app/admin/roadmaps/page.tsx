'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Users, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { StatusBadge } from '@/components/ui/StatusBadge'

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
    }
  }
  milestones: {
    id: string
    title: string
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
    tasks: {
      id: string
      title: string
      status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
      dueDate: string | null
    }[]
  }[]
}

interface RoadmapFilters {
  search: string
  status: 'all' | 'not_started' | 'in_progress' | 'completed'
  serviceType: 'all' | 'MENTORSHIP' | 'ADVISORY'
}

export default function AdminRoadmapsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  const [filteredRoadmaps, setFilteredRoadmaps] = useState<Roadmap[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<RoadmapFilters>({
    search: '',
    status: 'all',
    serviceType: 'all'
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/auth/signin')
      return
    }

    fetchRoadmaps()
  }, [session, status, router])

  useEffect(() => {
    filterRoadmaps()
  }, [roadmaps, filters])

  const fetchRoadmaps = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/roadmaps')
      if (!response.ok) {
        throw new Error('Failed to fetch roadmaps')
      }
      const data = await response.json()
      setRoadmaps(data.data || [])
    } catch (error) {
      console.error('Error fetching roadmaps:', error)
      // Mock data for development
      setRoadmaps([
        {
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
              type: 'MENTORSHIP'
            }
          },
          milestones: [
            {
              id: 'milestone-1',
              title: 'Foundation Phase',
              status: 'COMPLETED',
              tasks: [
                {
                  id: 'task-1',
                  title: 'Complete onboarding',
                  status: 'COMPLETED',
                  dueDate: '2024-01-10T00:00:00Z'
                },
                {
                  id: 'task-2',
                  title: 'Set learning goals',
                  status: 'COMPLETED',
                  dueDate: '2024-01-15T00:00:00Z'
                }
              ]
            },
            {
              id: 'milestone-2',
              title: 'Development Phase',
              status: 'IN_PROGRESS',
              tasks: [
                {
                  id: 'task-3',
                  title: 'Complete technical skills assessment',
                  status: 'IN_PROGRESS',
                  dueDate: '2024-01-25T00:00:00Z'
                },
                {
                  id: 'task-4',
                  title: 'Attend weekly mentoring sessions',
                  status: 'NOT_STARTED',
                  dueDate: '2024-01-30T00:00:00Z'
                }
              ]
            }
          ]
        },
        {
          id: '2',
          title: 'Business Advisory Roadmap',
          description: 'Strategic business development roadmap',
          createdAt: '2024-01-05T09:00:00Z',
          updatedAt: '2024-01-20T16:45:00Z',
          enrollment: {
            id: 'enrollment-2',
            user: {
              id: 'user-2',
              name: 'Jane Smith',
              email: 'jane.smith@example.com'
            },
            service: {
              id: 'service-2',
              name: 'Business Advisory',
              type: 'ADVISORY'
            }
          },
          milestones: [
            {
              id: 'milestone-3',
              title: 'Business Analysis',
              status: 'IN_PROGRESS',
              tasks: [
                {
                  id: 'task-5',
                  title: 'Complete business assessment',
                  status: 'IN_PROGRESS',
                  dueDate: '2024-01-28T00:00:00Z'
                },
                {
                  id: 'task-6',
                  title: 'Identify growth opportunities',
                  status: 'NOT_STARTED',
                  dueDate: '2024-02-05T00:00:00Z'
                }
              ]
            }
          ]
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const filterRoadmaps = () => {
    let filtered = [...roadmaps]

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(roadmap =>
        roadmap.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        roadmap.enrollment.user.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        roadmap.enrollment.user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        roadmap.enrollment.service.name.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(roadmap => {
        const overallStatus = getRoadmapOverallStatus(roadmap)
        return overallStatus === filters.status
      })
    }

    // Service type filter
    if (filters.serviceType !== 'all') {
      filtered = filtered.filter(roadmap => 
        roadmap.enrollment.service.type === filters.serviceType
      )
    }

    setFilteredRoadmaps(filtered)
  }

  const getRoadmapOverallStatus = (roadmap: Roadmap): string => {
    const allTasks = roadmap.milestones.flatMap(m => m.tasks)
    const completedTasks = allTasks.filter(t => t.status === 'COMPLETED')
    const inProgressTasks = allTasks.filter(t => t.status === 'IN_PROGRESS')

    if (completedTasks.length === allTasks.length && allTasks.length > 0) {
      return 'completed'
    } else if (inProgressTasks.length > 0 || completedTasks.length > 0) {
      return 'in_progress'
    } else {
      return 'not_started'
    }
  }

  const getStatusBadge = (roadmap: Roadmap) => {
    const status = getRoadmapOverallStatus(roadmap)
    const colors = {
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      not_started: 'bg-gray-100 text-gray-800'
    }
    const labels = {
      completed: 'Completed',
      in_progress: 'In Progress',
      not_started: 'Not Started'
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const getProgressPercentage = (roadmap: Roadmap): number => {
    const allTasks = roadmap.milestones.flatMap(m => m.tasks)
    if (allTasks.length === 0) return 0
    const completedTasks = allTasks.filter(t => t.status === 'COMPLETED')
    return Math.round((completedTasks.length / allTasks.length) * 100)
  }

  const getOverdueTasksCount = (roadmap: Roadmap): number => {
    const now = new Date()
    return roadmap.milestones.flatMap(m => m.tasks).filter(task => {
      if (!task.dueDate || task.status === 'COMPLETED') return false
      return new Date(task.dueDate) < now
    }).length
  }

  const handleDeleteRoadmap = async (roadmapId: string, roadmapTitle: string) => {
    if (!confirm(`Are you sure you want to delete the roadmap "${roadmapTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/roadmaps/${roadmapId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Remove the roadmap from the local state
        setRoadmaps(roadmaps.filter(r => r.id !== roadmapId))
        setFilteredRoadmaps(filteredRoadmaps.filter(r => r.id !== roadmapId))
      } else {
        const error = await response.json()
        alert(`Error deleting roadmap: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting roadmap:', error)
      alert('Failed to delete roadmap')
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
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Calendar className="w-8 h-8 mr-3" />
          Roadmap Management
        </h1>
        <Button onClick={() => router.push('/admin/roadmaps/create')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Roadmap
        </Button>
      </div>

      {/* Filters */}
      <DashboardCard className="mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="relative flex-1 w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search roadmaps, users, or services..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-blue-500 focus:border-blue-500"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-auto">
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
            >
              <option value="all">All Statuses</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Service Type Filter */}
          <div className="w-full md:w-auto">
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
              value={filters.serviceType}
              onChange={(e) => setFilters({ ...filters, serviceType: e.target.value as any })}
            >
              <option value="all">All Services</option>
              <option value="MENTORSHIP">Mentorship</option>
              <option value="ADVISORY">Advisory</option>
            </select>
          </div>
        </div>
      </DashboardCard>

      {/* Roadmaps List */}
      <DashboardCard title="Roadmaps" subtitle={`${filteredRoadmaps.length} roadmap(s) found`}>
        <div className="space-y-4">
          {filteredRoadmaps.map((roadmap) => {
            const progressPercentage = getProgressPercentage(roadmap)
            const overdueTasks = getOverdueTasksCount(roadmap)
            
            return (
              <div key={roadmap.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{roadmap.title}</h3>
                      {getStatusBadge(roadmap)}
                      {overdueTasks > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {overdueTasks} overdue
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{roadmap.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {roadmap.enrollment.user.name || roadmap.enrollment.user.email}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {roadmap.enrollment.service.name} ({roadmap.enrollment.service.type})
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/roadmaps/${roadmap.id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/roadmaps/${roadmap.id}/edit`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-800 border-red-300 hover:bg-red-50"
                      onClick={() => handleDeleteRoadmap(roadmap.id, roadmap.title)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Milestones Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{roadmap.milestones.length}</div>
                    <div className="text-sm text-gray-600">Milestones</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {roadmap.milestones.flatMap(m => m.tasks).length}
                    </div>
                    <div className="text-sm text-gray-600">Total Tasks</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {roadmap.milestones.flatMap(m => m.tasks).filter(t => t.status === 'COMPLETED').length}
                    </div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredRoadmaps.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No roadmaps found matching your criteria.
          </div>
        )}
      </DashboardCard>
    </div>
  )
}
