'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode, useState } from 'react'
import { Plus, X } from 'lucide-react'

interface FloatingAction {
  icon: ReactNode
  label: string
  onClick: () => void
  color?: string
}

interface FloatingActionButtonProps {
  actions: FloatingAction[]
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  mainIcon?: ReactNode
  className?: string
}

export default function FloatingActionButton({
  actions,
  position = 'bottom-right',
  mainIcon = <Plus className="w-6 h-6" />,
  className = '',
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  }

  const actionPositions = {
    'bottom-right': 'flex-col-reverse',
    'bottom-left': 'flex-col-reverse',
    'top-right': 'flex-col',
    'top-left': 'flex-col',
  }

  const containerVariants = {
    closed: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
    open: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  }

  const actionVariants = {
    closed: {
      scale: 0,
      opacity: 0,
      y: position.includes('bottom') ? 20 : -20,
    },
    open: {
      scale: 1,
      opacity: 1,
      y: 0,
    },
  }

  const mainButtonVariants = {
    closed: { rotate: 0 },
    open: { rotate: 45 },
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50 ${className}`}>
      <motion.div
        className={`flex items-center gap-3 ${actionPositions[position]}`}
        variants={containerVariants}
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
      >
        {/* Action Buttons */}
        <AnimatePresence>
          {isOpen &&
            actions.map((action, index) => (
              <motion.div
                key={index}
                variants={actionVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="flex items-center gap-3"
              >
                {/* Label */}
                <motion.div
                  className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg whitespace-nowrap"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: 0.1 }}
                >
                  {action.label}
                </motion.div>
                
                {/* Action Button */}
                <motion.button
                  className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-colors ${
                    action.color || 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  onClick={action.onClick}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {action.icon}
                </motion.button>
              </motion.div>
            ))}
        </AnimatePresence>

        {/* Main Button */}
        <motion.button
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          variants={mainButtonVariants}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {mainIcon}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>
    </div>
  )
}


