'use client'

import { motion } from 'framer-motion'

interface ProgressBarProps {
  progress: number
  label?: string
  showPercentage?: boolean
  color?: 'blue' | 'green' | 'purple' | 'red' | 'yellow'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function ProgressBar({ 
  progress, 
  label, 
  showPercentage = true, 
  color = 'blue',
  size = 'md',
  className = ''
}: ProgressBarProps) {
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600',
  }

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }

  const clampedProgress = Math.min(100, Math.max(0, progress))

  return (
    <div className={className}>
      {(label || showPercentage) && (
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          {label && <span>{label}</span>}
          {showPercentage && <span>{clampedProgress}%</span>}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]} overflow-hidden`}>
        <motion.div 
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ 
            duration: 1.2, 
            ease: 'easeOut',
            delay: 0.2
          }}
        />
      </div>
    </div>
  )
}
