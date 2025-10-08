'use client'

import { CheckCircle, Clock, AlertCircle, Calendar, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

interface TaskCardProps {
  task: Task
  onStatusUpdate: (taskId: string, status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED') => void
  actionLoading?: string | null
  showActions?: boolean
}

export default function TaskCard({ 
  task, 
  onStatusUpdate, 
  actionLoading,
  showActions = true 
}: TaskCardProps) {
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

  const isTaskOverdue = (): boolean => {
    if (!task.dueDate || task.status === 'COMPLETED') return false
    return new Date(task.dueDate) < new Date()
  }

  const isOverdue = isTaskOverdue()

  return (
    <div className={`border rounded-lg p-4 transition-all duration-200 ${
      isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
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
              {isOverdue && (
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
                isOverdue ? 'text-red-600' : 'text-gray-500'
              }`}>
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
          {showActions && (
            <div className="flex items-center space-x-2">
              {task.status !== 'COMPLETED' && (
                <Button
                  size="sm"
                  onClick={() => onStatusUpdate(task.id, 'COMPLETED')}
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
                  onClick={() => onStatusUpdate(task.id, 'IN_PROGRESS')}
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
                  onClick={() => onStatusUpdate(task.id, 'IN_PROGRESS')}
                  disabled={actionLoading === task.id}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Reopen
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

