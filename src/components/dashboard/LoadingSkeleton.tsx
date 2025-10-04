interface LoadingSkeletonProps {
  variant?: 'card' | 'stats' | 'list' | 'text'
  count?: number
  className?: string
}

export default function LoadingSkeleton({ variant = 'card', count = 1, className = '' }: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'stats':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
              </div>
            </div>
          </div>
        )
      
      case 'list':
        return (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-3 h-3 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                </div>
                <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        )
      
      case 'text':
        return (
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        )
      
      default: // card
        return (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="mb-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={count > 1 ? 'mb-6' : ''}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  )
}

