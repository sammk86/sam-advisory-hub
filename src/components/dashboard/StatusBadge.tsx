interface StatusBadgeProps {
  status: string
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
}

export default function StatusBadge({ status, variant = 'default', size = 'md' }: StatusBadgeProps) {
  const getVariantClasses = (variant: string, status: string) => {
    // Auto-detect variant based on status if not specified
    if (variant === 'default') {
      const statusLower = status.toLowerCase()
      if (statusLower.includes('active') || statusLower.includes('completed') || statusLower.includes('success')) {
        variant = 'success'
      } else if (statusLower.includes('pending') || statusLower.includes('progress')) {
        variant = 'warning'
      } else if (statusLower.includes('cancelled') || statusLower.includes('failed') || statusLower.includes('error')) {
        variant = 'error'
      } else {
        variant = 'info'
      }
    }

    const variants = {
      success: 'bg-green-100 text-green-800 border-green-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      error: 'bg-red-100 text-red-800 border-red-200',
      info: 'bg-blue-100 text-blue-800 border-blue-200',
      default: 'bg-gray-100 text-gray-800 border-gray-200',
    }

    return variants[variant] || variants.default
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  }

  const formatStatus = (status: string) => {
    return status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <span className={`
      inline-flex items-center font-medium rounded-full border
      ${getVariantClasses(variant, status)}
      ${sizeClasses[size]}
    `}>
      {formatStatus(status)}
    </span>
  )
}



