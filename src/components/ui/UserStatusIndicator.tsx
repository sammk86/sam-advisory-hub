'use client'

import { CheckCircle, Clock, XCircle, AlertCircle, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export type UserStatus = 'confirmed' | 'pending' | 'rejected' | 'unknown'

interface UserStatusIndicatorProps {
  status: UserStatus
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const statusConfig = {
  confirmed: {
    icon: CheckCircle,
    label: 'Confirmed',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
  },
  pending: {
    icon: Clock,
    label: 'Pending Review',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200',
  },
  rejected: {
    icon: XCircle,
    label: 'Rejected',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
  },
  unknown: {
    icon: AlertCircle,
    label: 'Unknown',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
  },
}

const sizeConfig = {
  sm: {
    iconSize: 'w-4 h-4',
    textSize: 'text-sm',
    padding: 'p-2',
  },
  md: {
    iconSize: 'w-5 h-5',
    textSize: 'text-base',
    padding: 'p-3',
  },
  lg: {
    iconSize: 'w-6 h-6',
    textSize: 'text-lg',
    padding: 'p-4',
  },
}

export default function UserStatusIndicator({
  status,
  size = 'md',
  showLabel = true,
  className,
}: UserStatusIndicatorProps) {
  const config = statusConfig[status]
  const sizeStyles = sizeConfig[size]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border',
        config.bgColor,
        config.borderColor,
        sizeStyles.padding,
        className
      )}
    >
      <Icon className={cn(config.color, sizeStyles.iconSize)} />
      {showLabel && (
        <span className={cn(config.color, sizeStyles.textSize, 'font-medium')}>
          {config.label}
        </span>
      )}
    </div>
  )
}

interface UserStatusBadgeProps {
  status: UserStatus
  className?: string
}

export function UserStatusBadge({ status, className }: UserStatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        config.bgColor,
        config.color,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}

interface UserStatusCardProps {
  status: UserStatus
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
  className?: string
}

export function UserStatusCard({
  status,
  title,
  description,
  action,
  className,
}: UserStatusCardProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'rounded-lg border p-6',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <Icon className={cn('w-6 h-6', config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={cn('text-lg font-semibold', config.color)}>
            {title}
          </h3>
          <p className="mt-1 text-sm text-gray-600">{description}</p>
          {action && (
            <div className="mt-4">
              <a
                href={action.href}
                className={cn(
                  'inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md transition-colors',
                  status === 'confirmed'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : status === 'pending'
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : status === 'rejected'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                )}
              >
                {action.label}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface UserStatusTimelineProps {
  status: UserStatus
  steps: Array<{
    id: string
    title: string
    description: string
    completed: boolean
    current: boolean
  }>
  className?: string
}

export function UserStatusTimeline({
  status,
  steps,
  className,
}: UserStatusTimelineProps) {
  const config = statusConfig[status]

  return (
    <div className={cn('space-y-4', className)}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {step.completed ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : step.current ? (
              <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-yellow-600 animate-pulse" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-gray-300" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900">{step.title}</h4>
            <p className="mt-1 text-sm text-gray-600">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

interface UserStatusProgressProps {
  status: UserStatus
  progress: number
  className?: string
}

export function UserStatusProgress({
  status,
  progress,
  className,
}: UserStatusProgressProps) {
  const config = statusConfig[status]

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700">Progress</span>
        <span className={config.color}>{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={cn(
            'h-2 rounded-full transition-all duration-300',
            status === 'confirmed'
              ? 'bg-green-600'
              : status === 'pending'
              ? 'bg-yellow-600'
              : status === 'rejected'
              ? 'bg-red-600'
              : 'bg-gray-600'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}


