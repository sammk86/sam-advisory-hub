import React from 'react'
import { clsx } from 'clsx'

interface StatusBadgeProps {
  status: 'confirmed' | 'pending' | 'rejected' | 'active' | 'inactive' | 'completed' | 'cancelled'
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed':
        return {
          label: 'Confirmed',
          className: 'bg-green-100 text-green-800 border-green-200'
        }
      case 'pending':
        return {
          label: 'Pending',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        }
      case 'rejected':
        return {
          label: 'Rejected',
          className: 'bg-red-100 text-red-800 border-red-200'
        }
      case 'active':
        return {
          label: 'Active',
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        }
      case 'inactive':
        return {
          label: 'Inactive',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        }
      case 'completed':
        return {
          label: 'Completed',
          className: 'bg-green-100 text-green-800 border-green-200'
        }
      case 'cancelled':
        return {
          label: 'Cancelled',
          className: 'bg-red-100 text-red-800 border-red-200'
        }
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}


