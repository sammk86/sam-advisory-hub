import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface DashboardCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  actions?: ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
}

export default function DashboardCard({ 
  title, 
  subtitle, 
  children, 
  actions, 
  className = '',
  padding = 'md'
}: DashboardCardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    },
    hover: {
      y: -2,
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      transition: { duration: 0.2, ease: 'easeInOut' }
    }
  }

  return (
    <motion.div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      {(title || subtitle || actions) && (
        <div className={`border-b border-gray-200 ${paddingClasses[padding]} pb-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      <div className={paddingClasses[padding]}>
        {children}
      </div>
    </motion.div>
  )
}

export { DashboardCard }
