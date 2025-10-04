'use client'

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'white'
  className?: string
}

export function LoadingSpinner({
  size = 'md',
  color = 'primary',
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }

  const colorClasses = {
    primary: 'border-blue-600',
    secondary: 'border-gray-600',
    white: 'border-white',
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-transparent',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  )
}

interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'white'
  className?: string
}

export function LoadingDots({
  size = 'md',
  color = 'primary',
  className,
}: LoadingDotsProps) {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  }

  const colorClasses = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
    white: 'bg-white',
  }

  return (
    <div className={cn('flex space-x-1', className)}>
      <div
        className={cn(
          'rounded-full animate-bounce',
          sizeClasses[size],
          colorClasses[color]
        )}
        style={{ animationDelay: '0ms' }}
      />
      <div
        className={cn(
          'rounded-full animate-bounce',
          sizeClasses[size],
          colorClasses[color]
        )}
        style={{ animationDelay: '150ms' }}
      />
      <div
        className={cn(
          'rounded-full animate-bounce',
          sizeClasses[size],
          colorClasses[color]
        )}
        style={{ animationDelay: '300ms' }}
      />
    </div>
  )
}

interface LoadingSkeletonProps {
  lines?: number
  className?: string
}

export function LoadingSkeleton({ lines = 3, className }: LoadingSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'h-4 bg-gray-200 rounded animate-pulse',
            index === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  )
}

interface LoadingCardProps {
  title?: string
  description?: string
  showAvatar?: boolean
  className?: string
}

export function LoadingCard({
  title = 'Loading...',
  description = 'Please wait while we process your request',
  showAvatar = false,
  className,
}: LoadingCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-6 shadow-sm',
        className
      )}
    >
      <div className="flex items-center space-x-4">
        {showAvatar && (
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
        )}
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
        </div>
      </div>
      <div className="mt-4">
        <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
        <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4 mt-2" />
      </div>
    </div>
  )
}

interface LoadingPageProps {
  title?: string
  description?: string
  showProgress?: boolean
  progress?: number
  className?: string
}

export function LoadingPage({
  title = 'Loading...',
  description = 'Please wait while we load your content',
  showProgress = false,
  progress = 0,
  className,
}: LoadingPageProps) {
  return (
    <div className={cn('min-h-screen flex items-center justify-center', className)}>
      <div className="text-center">
        <LoadingSpinner size="xl" className="mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{description}</p>
        {showProgress && (
          <div className="w-64 mx-auto">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface LoadingButtonProps {
  loading?: boolean
  children: React.ReactNode
  className?: string
  disabled?: boolean
  onClick?: () => void
}

export function LoadingButton({
  loading = false,
  children,
  className,
  disabled = false,
  onClick,
}: LoadingButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md transition-colors',
        loading || disabled
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        className
      )}
    >
      {loading && <LoadingSpinner size="sm" color="white" className="mr-2" />}
      {children}
    </button>
  )
}

interface LoadingTableProps {
  rows?: number
  columns?: number
  className?: string
}

export function LoadingTable({
  rows = 5,
  columns = 4,
  className,
}: LoadingTableProps) {
  return (
    <div className={cn('overflow-hidden', className)}>
      <div className="bg-white border border-gray-200 rounded-lg">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, index) => (
              <div key={index} className="h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
        {/* Rows */}
        <div className="divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="px-6 py-4">
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <div key={colIndex} className="h-4 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface LoadingListProps {
  items?: number
  showAvatar?: boolean
  className?: string
}

export function LoadingList({
  items = 5,
  showAvatar = false,
  className,
}: LoadingListProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200">
          {showAvatar && (
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
          )}
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
          </div>
          <div className="w-16 h-6 bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}

interface LoadingGridProps {
  items?: number
  columns?: number
  className?: string
}

export function LoadingGrid({
  items = 6,
  columns = 3,
  className,
}: LoadingGridProps) {
  return (
    <div
      className={cn('grid gap-6', className)}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
            </div>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
