'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Upload, 
  Download, 
  Users, 
  Calendar,
  Plus,
  Trash2,
  Save
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import DashboardCard from '@/components/dashboard/DashboardCard'

interface User {
  id: string
  name: string | null
  email: string
  isConfirmed: boolean | null
  enrollments: Array<{
    id: string
    status: string
    enrolledAt: string
    expiresAt: string | null
    service: {
      id: string
      name: string
      type: string
      description: string
    }
  }>
}

interface Milestone {
  title: string
  description: string
  tasks: Array<{
    title: string
    description: string
    resources: string[]
    dueDate: string
  }>
}

export default function CreateRoadmapPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState('')
  const [roadmapTitle, setRoadmapTitle] = useState('')
  const [roadmapDescription, setRoadmapDescription] = useState('')
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(false)
  const [csvData, setCsvData] = useState<string>('')
  const [showCsvUpload, setShowCsvUpload] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/auth/signin')
      return
    }

    fetchUsers()
  }, [session, status, router])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users-with-enrollments?hasEnrollments=true')
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      const data = await response.json()
      setUsers(data.data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      // Mock data for development
      setUsers([
        {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@example.com',
          isConfirmed: true,
          enrollments: [
            {
              id: 'enrollment-1',
              status: 'ACTIVE',
              enrolledAt: '2024-01-01T10:00:00Z',
              expiresAt: '2024-12-31T23:59:59Z',
              service: {
                id: 'service-1',
                name: 'Mentorship Program',
                type: 'MENTORSHIP',
                description: 'One-on-one mentorship program'
              }
            },
            {
              id: 'enrollment-2',
              status: 'ACTIVE',
              enrolledAt: '2024-01-15T14:00:00Z',
              expiresAt: '2024-06-30T23:59:59Z',
              service: {
                id: 'service-2',
                name: 'Business Advisory',
                type: 'ADVISORY',
                description: 'Strategic business consultation'
              }
            }
          ]
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          isConfirmed: true,
          enrollments: [
            {
              id: 'enrollment-3',
              status: 'ACTIVE',
              enrolledAt: '2024-01-10T09:00:00Z',
              expiresAt: '2024-12-31T23:59:59Z',
              service: {
                id: 'service-3',
                name: 'Technology Advisory',
                type: 'ADVISORY',
                description: 'Technology strategy and digital transformation'
              }
            }
          ]
        }
      ])
    }
  }

  const selectedUser = users.find(u => u.id === selectedUserId)
  const availableEnrollments = selectedUser?.enrollments || []

  const downloadCsvTemplate = () => {
    const csvContent = `Milestone Title,Milestone Description,Task Title,Task Description,Resources (comma-separated),Due Date (YYYY-MM-DD)
Foundation Phase,Build the foundation for your learning journey,Complete onboarding process,Review program materials and set up your learning environment,"https://example.com/onboarding,https://example.com/materials",2024-02-15
Foundation Phase,Build the foundation for your learning journey,Set learning goals,Define your specific learning objectives and career goals,"https://example.com/goal-setting",2024-02-22
Development Phase,Focus on skill development and practical application,Complete skills assessment,Take the technical skills assessment to identify areas for improvement,"https://example.com/assessment",2024-03-01
Development Phase,Focus on skill development and practical application,Attend weekly mentoring sessions,Participate in scheduled mentoring sessions with your assigned mentor,"https://example.com/mentoring-guide",2024-03-15
Advanced Phase,Master advanced concepts and prepare for career advancement,Complete capstone project,Work on a comprehensive project that demonstrates your learning,"https://example.com/capstone-guidelines",2024-04-01`

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'roadmap-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const parseCsvData = (csvText: string): Milestone[] => {
    const lines = csvText.trim().split('\n')
    if (lines.length < 2) return []
    
    const milestoneMap = new Map<string, Milestone>()
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      // Simple CSV parsing that handles quoted fields
      const values = parseCsvLine(line)
      if (values.length < 6) continue
      
      const milestoneTitle = values[0]?.trim() || ''
      const milestoneDescription = values[1]?.trim() || ''
      const taskTitle = values[2]?.trim() || ''
      const taskDescription = values[3]?.trim() || ''
      const resourcesText = values[4]?.trim() || ''
      const dueDate = values[5]?.trim() || ''
      
      if (!milestoneTitle || !taskTitle) continue
      
      // Parse resources (comma-separated, but handle quoted strings)
      const resources = resourcesText ? 
        resourcesText.split(',').map(r => r.trim().replace(/^["']|["']$/g, '')) : []
      
      if (!milestoneMap.has(milestoneTitle)) {
        milestoneMap.set(milestoneTitle, {
          title: milestoneTitle,
          description: milestoneDescription,
          tasks: []
        })
      }
      
      const milestone = milestoneMap.get(milestoneTitle)!
      milestone.tasks.push({
        title: taskTitle,
        description: taskDescription,
        resources,
        dueDate
      })
    }
    
    return Array.from(milestoneMap.values())
  }

  const parseCsvLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    let i = 0
    
    while (i < line.length) {
      const char = line[i]
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"'
          i += 2
        } else {
          // Toggle quote state
          inQuotes = !inQuotes
          i++
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        result.push(current)
        current = ''
        i++
      } else {
        current += char
        i++
      }
    }
    
    // Add the last field
    result.push(current)
    
    return result
  }

  const handleCsvFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      alert('Please select a CSV file.')
      return
    }

    setCsvFile(file)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setCsvData(content)
    }
    reader.readAsText(file)
  }

  const handleCsvUpload = () => {
    if (!csvData.trim()) return
    
    try {
      const parsedMilestones = parseCsvData(csvData)
      setMilestones(parsedMilestones)
      setShowCsvUpload(false)
      setCsvFile(null)
    } catch (error) {
      alert('Error parsing CSV data. Please check the format.')
      console.error('CSV parsing error:', error)
    }
  }

  const addMilestone = () => {
    setMilestones([...milestones, {
      title: '',
      description: '',
      tasks: []
    }])
  }

  const updateMilestone = (index: number, field: keyof Milestone, value: any) => {
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
      dueDate: ''
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

  const handleSubmit = async () => {
    if (!selectedEnrollmentId || !roadmapTitle || milestones.length === 0) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/roadmaps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enrollmentId: selectedEnrollmentId,
          title: roadmapTitle,
          description: roadmapDescription,
          milestones: milestones.map((milestone, index) => ({
            title: milestone.title,
            description: milestone.description,
            order: index,
            status: 'NOT_STARTED',
            tasks: milestone.tasks.map((task, taskIndex) => ({
              title: task.title,
              description: task.description,
              resources: task.resources,
              dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
              order: taskIndex,
              status: 'NOT_STARTED'
            }))
          }))
        })
      })

      if (response.ok) {
        router.push('/admin/roadmaps')
      } else {
        const error = await response.json()
        alert(`Error creating roadmap: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating roadmap:', error)
      alert('Failed to create roadmap')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Roadmap</h1>
          <p className="text-gray-600">Create a new roadmap for a user</p>
        </div>
      
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/roadmaps')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Roadmaps
          </Button>
        </div>

        {/* User Selection */}
        <DashboardCard title="Select User and Service">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select User *
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                value={selectedUserId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value)
                  setSelectedEnrollmentId('')
                }}
              >
                <option value="">Choose a user with assigned services...</option>
                {users
                  .filter(user => user.enrollments.length > 0)
                  .map((user) => (
                    <option key={user.id} value={user.id} title={`${user.name || user.email} (${user.email}) - ${user.enrollments.length} service(s)`}>
                      {user.name || user.email} - {user.enrollments.length} service(s)
                    </option>
                  ))}
              </select>
              {users.filter(user => user.enrollments.length > 0).length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  No users with assigned services found. Please assign services to users first.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Service *
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                value={selectedEnrollmentId}
                onChange={(e) => setSelectedEnrollmentId(e.target.value)}
                disabled={!selectedUserId}
              >
                <option value="">Choose a service...</option>
                {availableEnrollments.map((enrollment) => (
                  <option 
                    key={enrollment.id} 
                    value={enrollment.id}
                    title={`${enrollment.service.name} (${enrollment.service.type}) - ${enrollment.expiresAt ? `Expires: ${new Date(enrollment.expiresAt).toLocaleDateString()}` : 'No expiry'}`}
                  >
                    {enrollment.service.name} ({enrollment.service.type})
                    {enrollment.expiresAt ? ` - Exp: ${new Date(enrollment.expiresAt).toLocaleDateString()}` : ' - No expiry'}
                  </option>
                ))}
              </select>
              {selectedUserId && availableEnrollments.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  This user has no active service enrollments.
                </p>
              )}
            </div>
          </div>
        </DashboardCard>

        {/* Selected User and Service Info */}
        {selectedUserId && selectedEnrollmentId && (
          <DashboardCard title="Selected User and Service">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">User Information</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Name:</span> {selectedUser?.name || 'Not provided'}</p>
                  <p><span className="font-medium">Email:</span> {selectedUser?.email}</p>
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                      selectedUser?.isConfirmed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedUser?.isConfirmed ? 'Confirmed' : 'Pending'}
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Service Information</h4>
                {(() => {
                  const enrollment = availableEnrollments.find(e => e.id === selectedEnrollmentId)
                  return enrollment ? (
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Service:</span> {enrollment.service.name}</p>
                      <p><span className="font-medium">Type:</span> {enrollment.service.type}</p>
                      <p><span className="font-medium">Description:</span> {enrollment.service.description}</p>
                      <p><span className="font-medium">Enrolled:</span> {new Date(enrollment.enrolledAt).toLocaleDateString()}</p>
                      <p><span className="font-medium">Expires:</span> 
                        {enrollment.expiresAt ? new Date(enrollment.expiresAt).toLocaleDateString() : 'No expiry'}
                      </p>
                    </div>
                  ) : null
                })()}
              </div>
            </div>
          </DashboardCard>
        )}

        {/* Roadmap Details */}
        <DashboardCard title="Roadmap Details">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Roadmap Title *
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                value={roadmapTitle}
                onChange={(e) => setRoadmapTitle(e.target.value)}
                placeholder="Enter roadmap title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                rows={3}
                value={roadmapDescription}
                onChange={(e) => setRoadmapDescription(e.target.value)}
                placeholder="Enter roadmap description..."
              />
            </div>
          </div>
        </DashboardCard>

        {/* CSV Upload Section */}
        <DashboardCard title="Import from CSV Template">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={downloadCsvTemplate}
              >
                <Download className="w-4 h-4 mr-2" />
                Download CSV Template
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCsvUpload(!showCsvUpload)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload CSV
              </Button>
            </div>

            {showCsvUpload && (
              <div className="space-y-4">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload CSV File
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCsvFileUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {csvFile && (
                      <span className="text-sm text-green-600">
                        ✓ {csvFile.name} selected
                      </span>
                    )}
                  </div>
                </div>

                {/* Or Paste CSV Data */}
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or Paste CSV Data
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    rows={8}
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                    placeholder="Paste your CSV data here..."
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <Button 
                    onClick={handleCsvUpload}
                    disabled={!csvData.trim()}
                  >
                    Parse CSV Data
                  </Button>
                  {csvData && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCsvData('')
                        setCsvFile(null)
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </DashboardCard>

        {/* Milestones */}
        <DashboardCard 
          title="Milestones and Tasks"
          actions={
            <Button onClick={addMilestone}>
              <Plus className="w-4 h-4 mr-2" />
              Add Milestone
            </Button>
          }
        >
          <div className="space-y-6">
            {milestones.map((milestone, milestoneIndex) => (
              <div key={milestoneIndex} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold">Milestone {milestoneIndex + 1}</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-800"
                    onClick={() => deleteMilestone(milestoneIndex)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Milestone Title
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        value={milestone.title}
                        onChange={(e) => updateMilestone(milestoneIndex, 'title', e.target.value)}
                        placeholder="Enter milestone title..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        value={milestone.description}
                        onChange={(e) => updateMilestone(milestoneIndex, 'description', e.target.value)}
                        placeholder="Enter milestone description..."
                      />
                    </div>
                  </div>

                  {/* Tasks */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium">Tasks</h5>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addTask(milestoneIndex)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Task
                      </Button>
                    </div>

                    {milestone.tasks.map((task, taskIndex) => (
                      <div key={taskIndex} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Task {taskIndex + 1}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-800"
                            onClick={() => deleteTask(milestoneIndex, taskIndex)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            value={task.title}
                            onChange={(e) => updateTask(milestoneIndex, taskIndex, 'title', e.target.value)}
                            placeholder="Task title..."
                          />
                          <input
                            type="text"
                            className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            value={task.description}
                            onChange={(e) => updateTask(milestoneIndex, taskIndex, 'description', e.target.value)}
                            placeholder="Task description..."
                          />
                          <input
                            type="text"
                            className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            value={task.resources.join(', ')}
                            onChange={(e) => updateTask(milestoneIndex, taskIndex, 'resources', e.target.value.split(',').map(r => r.trim()))}
                            placeholder="Resources (comma-separated)..."
                          />
                          <input
                            type="date"
                            className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            value={task.dueDate}
                            onChange={(e) => updateTask(milestoneIndex, taskIndex, 'dueDate', e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {milestones.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No milestones added yet. Add milestones manually or upload a CSV template.</p>
              </div>
            )}
          </div>
        </DashboardCard>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={loading || !selectedEnrollmentId || !roadmapTitle || milestones.length === 0}
            className="px-8"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Create Roadmap
          </Button>
        </div>
      </div>
    </div>
    </div>
  )
}
