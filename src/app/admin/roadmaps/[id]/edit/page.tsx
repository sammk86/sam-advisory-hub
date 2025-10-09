'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2,
  Calendar,
  User,
  BookOpen
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import DashboardCard from '@/components/dashboard/DashboardCard'

interface Task {
  id?: string
  title: string
  description: string
  resources: string[]
  dueDate: string
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  order: number
}

interface Milestone {
  id?: string
  title: string
  description: string
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  order: number
  tasks: Task[]
}

interface Roadmap {
  id: string
  title: string
  description: string | null
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

interface RoadmapEditPageProps {
  params: Promise<{ id: string }>
}

export default function RoadmapEditPage({ params }: RoadmapEditPageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [milestones, setMilestones] = useState<Milestone[]>([])

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
      setMilestones(data.data.milestones || [])
    } catch (error) {
      console.error('Error fetching roadmap:', error)
      // Mock data for development
      setRoadmap({
        id: '1',
        title: 'Mentorship Program Roadmap',
        description: 'Complete learning path for mentorship program',
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
                order: 0
              }
            ]
          }
        ]
      })
      setMilestones([
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
              order: 0
            }
          ]
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const updateRoadmapField = (field: string, value: string) => {
    if (!roadmap) return
    setRoadmap({ ...roadmap, [field]: value })
  }

  const addMilestone = () => {
    const newMilestone: Milestone = {
      title: '',
      description: '',
      status: 'NOT_STARTED',
      order: milestones.length,
      tasks: []
    }
    setMilestones([...milestones, newMilestone])
  }

  const updateMilestone = (index: number, field: string, value: any) => {
    const updated = [...milestones]
    updated[index] = { ...updated[index], [field]: value }
    setMilestones(updated)
  }

  const deleteMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index))
  }

  const addTask = (milestoneIndex: number) => {
    const updated = [...milestones]
    updated[milestoneIndex].tasks.push({
      title: '',
      description: '',
      resources: [],
      dueDate: '',
      status: 'NOT_STARTED',
      order: updated[milestoneIndex].tasks.length
    })
    setMilestones(updated)
  }

  const updateTask = (milestoneIndex: number, taskIndex: number, field: string, value: any) => {
    const updated = [...milestones]
    updated[milestoneIndex].tasks[taskIndex] = { 
      ...updated[milestoneIndex].tasks[taskIndex], 
      [field]: value 
    }
    setMilestones(updated)
  }

  const deleteTask = (milestoneIndex: number, taskIndex: number) => {
    const updated = [...milestones]
    updated[milestoneIndex].tasks = updated[milestoneIndex].tasks.filter((_, i) => i !== taskIndex)
    setMilestones(updated)
  }

  const addResource = (milestoneIndex: number, taskIndex: number) => {
    const updated = [...milestones]
    updated[milestoneIndex].tasks[taskIndex].resources.push('')
    setMilestones(updated)
  }

  const updateResource = (milestoneIndex: number, taskIndex: number, resourceIndex: number, value: string) => {
    const updated = [...milestones]
    updated[milestoneIndex].tasks[taskIndex].resources[resourceIndex] = value
    setMilestones(updated)
  }

  const removeResource = (milestoneIndex: number, taskIndex: number, resourceIndex: number) => {
    const updated = [...milestones]
    updated[milestoneIndex].tasks[taskIndex].resources = updated[milestoneIndex].tasks[taskIndex].resources.filter((_, i) => i !== resourceIndex)
    setMilestones(updated)
  }

  const handleSave = async () => {
    if (!roadmap) return

    setSaving(true)
    try {
      const response = await fetch(`/api/roadmaps/${roadmap.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: roadmap.title,
          description: roadmap.description,
          milestones: milestones.map((milestone, milestoneIndex) => ({
            id: milestone.id,
            title: milestone.title,
            description: milestone.description,
            status: milestone.status,
            order: milestoneIndex,
            tasks: milestone.tasks.map((task, taskIndex) => ({
              id: task.id,
              title: task.title,
              description: task.description,
              resources: task.resources.filter(r => r.trim() !== ''),
              dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
              order: taskIndex,
              status: task.status
            }))
          }))
        })
      })

      if (response.ok) {
        router.push(`/admin/roadmaps/${roadmap.id}`)
      } else {
        const error = await response.json()
        alert(`Error updating roadmap: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating roadmap:', error)
      alert('Failed to update roadmap')
    } finally {
      setSaving(false)
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/roadmaps/${roadmap.id}`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to View
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Roadmap</h1>
                <p className="text-gray-600">Modify the roadmap details and milestones</p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* User and Service Info (Read-only) */}
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

          {/* Roadmap Details */}
          <DashboardCard title="Roadmap Details">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roadmap Title
                </label>
                <input
                  type="text"
                  value={roadmap.title}
                  onChange={(e) => updateRoadmapField('title', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Enter roadmap title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={roadmap.description || ''}
                  onChange={(e) => updateRoadmapField('description', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  rows={3}
                  placeholder="Enter roadmap description"
                />
              </div>
            </div>
          </DashboardCard>

          {/* Milestones */}
          <DashboardCard 
            title="Milestones" 
            subtitle={`${milestones.length} milestone(s) defined`}
          >
            <div className="space-y-6">
              {milestones.map((milestone, milestoneIndex) => (
                <div key={milestoneIndex} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Milestone {milestoneIndex + 1}
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-800 border-red-300 hover:bg-red-50"
                      onClick={() => deleteMilestone(milestoneIndex)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          value={milestone.title}
                          onChange={(e) => updateMilestone(milestoneIndex, 'title', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                          placeholder="Enter milestone title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          value={milestone.status}
                          onChange={(e) => updateMilestone(milestoneIndex, 'status', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        >
                          <option value="NOT_STARTED">Not Started</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={milestone.description}
                        onChange={(e) => updateMilestone(milestoneIndex, 'description', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        rows={2}
                        placeholder="Enter milestone description"
                      />
                    </div>

                    {/* Tasks */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">
                          Tasks ({milestone.tasks.length})
                        </h4>
                        <Button
                          size="sm"
                          onClick={() => addTask(milestoneIndex)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Task
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {milestone.tasks.map((task, taskIndex) => (
                          <div key={taskIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-medium text-gray-900">
                                Task {taskIndex + 1}
                              </h5>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-800 border-red-300 hover:bg-red-50"
                                onClick={() => deleteTask(milestoneIndex, taskIndex)}
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
                            </div>

                            <div className="space-y-3">
                              <div className="grid md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title
                                  </label>
                                  <input
                                    type="text"
                                    value={task.title}
                                    onChange={(e) => updateTask(milestoneIndex, taskIndex, 'title', e.target.value)}
                                    className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                    placeholder="Enter task title"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                  </label>
                                  <select
                                    value={task.status}
                                    onChange={(e) => updateTask(milestoneIndex, taskIndex, 'status', e.target.value)}
                                    className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                  >
                                    <option value="NOT_STARTED">Not Started</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="COMPLETED">Completed</option>
                                  </select>
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Description
                                </label>
                                <input
                                  type="text"
                                  value={task.description}
                                  onChange={(e) => updateTask(milestoneIndex, taskIndex, 'description', e.target.value)}
                                  className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                  placeholder="Enter task description"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Due Date
                                </label>
                                <input
                                  type="date"
                                  value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                                  onChange={(e) => updateTask(milestoneIndex, taskIndex, 'dueDate', e.target.value)}
                                  className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                />
                              </div>

                              {/* Resources */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <label className="block text-sm font-medium text-gray-700">
                                    Resources ({task.resources.length})
                                  </label>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => addResource(milestoneIndex, taskIndex)}
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add Resource
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  {task.resources.map((resource, resourceIndex) => (
                                    <div key={resourceIndex} className="flex items-center space-x-2">
                                      <input
                                        type="url"
                                        value={resource}
                                        onChange={(e) => updateResource(milestoneIndex, taskIndex, resourceIndex, e.target.value)}
                                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                        placeholder="Enter resource URL"
                                      />
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 hover:text-red-800 border-red-300 hover:bg-red-50"
                                        onClick={() => removeResource(milestoneIndex, taskIndex, resourceIndex)}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={addMilestone}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Milestone
              </Button>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  )
}

