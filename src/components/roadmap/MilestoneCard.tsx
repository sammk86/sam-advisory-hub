'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import TaskCard from './TaskCard'

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

interface MilestoneCardProps {
  milestone: Milestone
  onTaskStatusUpdate: (taskId: string, status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED') => void
  actionLoading?: string | null
  showActions?: boolean
}

export default function MilestoneCard({ 
  milestone, 
  onTaskStatusUpdate, 
  actionLoading,
  showActions = true 
}: MilestoneCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const getMilestoneProgress = (): number => {
    if (milestone.tasks.length === 0) return 0
    const completedTasks = milestone.tasks.filter(task => task.status === 'COMPLETED')
    return Math.round((completedTasks.length / milestone.tasks.length) * 100)
  }

  const getOverdueTasksCount = (): number => {
    const now = new Date()
    return milestone.tasks.filter(task => {
      if (!task.dueDate || task.status === 'COMPLETED') return false
      return new Date(task.dueDate) < now
    }).length
  }

  const progress = getMilestoneProgress()
  const overdueTasks = getOverdueTasksCount()

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      {/* Milestone Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-1">
                <h3 className="text-lg font-semibold text-gray-900">{milestone.title}</h3>
                <StatusBadge status={milestone.status.toLowerCase() as any} />
                {overdueTasks > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {overdueTasks} overdue
                  </span>
                )}
              </div>
              {milestone.description && (
                <p className="text-gray-600 text-sm">{milestone.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-600">
                {milestone.tasks.filter(t => t.status === 'COMPLETED').length} / {milestone.tasks.length} tasks
              </div>
              <div className="text-xs text-gray-500">{progress}% complete</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tasks */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          <div className="p-4 space-y-3">
            {milestone.tasks.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p>No tasks assigned to this milestone yet.</p>
              </div>
            ) : (
              milestone.tasks
                .sort((a, b) => a.order - b.order)
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusUpdate={onTaskStatusUpdate}
                    actionLoading={actionLoading}
                    showActions={showActions}
                  />
                ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

