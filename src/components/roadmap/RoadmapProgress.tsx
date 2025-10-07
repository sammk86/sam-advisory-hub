'use client'

import { CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface RoadmapProgressProps {
  milestones: Array<{
    id: string
    title: string
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
    tasks: Array<{
      id: string
      status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
      dueDate: string | null
    }>
  }>
  className?: string
}

export default function RoadmapProgress({ milestones, className = '' }: RoadmapProgressProps) {
  const getOverallProgress = (): number => {
    const allTasks = milestones.flatMap(m => m.tasks)
    if (allTasks.length === 0) return 0
    const completedTasks = allTasks.filter(t => t.status === 'COMPLETED')
    return Math.round((completedTasks.length / allTasks.length) * 100)
  }

  const getOverdueTasksCount = (): number => {
    const now = new Date()
    return milestones.flatMap(m => m.tasks).filter(task => {
      if (!task.dueDate || task.status === 'COMPLETED') return false
      return new Date(task.dueDate) < now
    }).length
  }

  const getStatusCounts = () => {
    const allTasks = milestones.flatMap(m => m.tasks)
    return {
      completed: allTasks.filter(t => t.status === 'COMPLETED').length,
      inProgress: allTasks.filter(t => t.status === 'IN_PROGRESS').length,
      notStarted: allTasks.filter(t => t.status === 'NOT_STARTED').length,
      total: allTasks.length
    }
  }

  const progress = getOverallProgress()
  const overdueTasks = getOverdueTasksCount()
  const statusCounts = getStatusCounts()

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Progress Overview</h3>
        {overdueTasks > 0 && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            {overdueTasks} overdue
          </span>
        )}
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Overall Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{statusCounts.total}</div>
          <div className="text-sm text-gray-600">Total Tasks</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{statusCounts.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{statusCounts.inProgress}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-600">{statusCounts.notStarted}</div>
          <div className="text-sm text-gray-600">Not Started</div>
        </div>
      </div>

      {/* Milestone Progress */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Milestone Progress</h4>
        <div className="space-y-2">
          {milestones.map((milestone) => {
            const milestoneTasks = milestone.tasks
            const completedTasks = milestoneTasks.filter(t => t.status === 'COMPLETED')
            const milestoneProgress = milestoneTasks.length > 0 
              ? Math.round((completedTasks.length / milestoneTasks.length) * 100)
              : 0

            return (
              <div key={milestone.id} className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                  {milestone.status === 'COMPLETED' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : milestone.status === 'IN_PROGRESS' ? (
                    <Clock className="w-5 h-5 text-blue-600" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {milestone.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {completedTasks.length} / {milestoneTasks.length} tasks
                  </div>
                </div>
                <div className="flex-shrink-0 text-sm text-gray-500">
                  {milestoneProgress}%
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
