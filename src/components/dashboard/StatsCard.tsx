import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: string
    type: 'increase' | 'decrease' | 'neutral'
  }
  icon: LucideIcon
  iconColor?: string
  description?: string
}

export default function StatsCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  iconColor = 'text-blue-600',
  description 
}: StatsCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString()
    }
    return val
  }

  const getChangeColor = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return 'text-green-600'
      case 'decrease':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className={`h-8 w-8 ${iconColor}`} />
        </div>
        <div className="ml-4 flex-1">
          <div className="text-sm font-medium text-gray-500 mb-1">{title}</div>
          <div className="text-2xl font-bold text-gray-900">{formatValue(value)}</div>
          {change && (
            <div className={`text-sm ${getChangeColor(change.type)} flex items-center mt-1`}>
              <span>{change.value}</span>
              {change.type === 'increase' && <span className="ml-1">↗</span>}
              {change.type === 'decrease' && <span className="ml-1">↘</span>}
            </div>
          )}
          {description && (
            <div className="text-xs text-gray-500 mt-1">{description}</div>
          )}
        </div>
      </div>
    </div>
  )
}


