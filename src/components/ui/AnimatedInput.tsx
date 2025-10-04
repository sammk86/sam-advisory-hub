'use client'

import { motion } from 'framer-motion'
import { InputHTMLAttributes, forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ className, label, error, icon, type = 'text', ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const [hasValue, setHasValue] = useState(false)

    const handleFocus = () => setIsFocused(true)
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      setHasValue(e.target.value.length > 0)
      props.onBlur?.(e)
    }

    const labelVariants = {
      default: {
        top: '50%',
        fontSize: '16px',
        color: '#6B7280',
      },
      focused: {
        top: '8px',
        fontSize: '12px',
        color: '#3B82F6',
      },
      error: {
        color: '#EF4444',
      },
    }

    const inputVariants = {
      default: {
        borderColor: '#D1D5DB',
        boxShadow: '0 0 0 0px rgba(59, 130, 246, 0)',
      },
      focused: {
        borderColor: '#3B82F6',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
      },
      error: {
        borderColor: '#EF4444',
        boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
      },
    }

    const getInputState = () => {
      if (error) return 'error'
      if (isFocused) return 'focused'
      return 'default'
    }

    const getLabelState = () => {
      if (error) return 'error'
      if (isFocused || hasValue) return 'focused'
      return 'default'
    }

    return (
      <div className="relative">
        <motion.div
          className="relative"
          initial="default"
          animate={getInputState()}
          variants={inputVariants}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            type={type}
            className={cn(
              'w-full px-3 py-3 border rounded-md bg-white text-gray-900 placeholder-transparent focus:outline-none transition-colors',
              icon ? 'pl-10' : '',
              label ? 'pt-6 pb-2' : '',
              error ? 'border-red-300' : 'border-gray-300',
              className
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={(e) => {
              setHasValue(e.target.value.length > 0)
              props.onChange?.(e)
            }}
            {...props}
          />
          
          {label && (
            <motion.label
              className="absolute left-3 pointer-events-none transform -translate-y-1/2 transition-all duration-200 ease-out origin-left"
              initial="default"
              animate={getLabelState()}
              variants={labelVariants}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{ left: icon ? '2.5rem' : '0.75rem' }}
            >
              {label}
            </motion.label>
          )}
        </motion.div>
        
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-1 text-sm text-red-600"
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  }
)

AnimatedInput.displayName = 'AnimatedInput'

export default AnimatedInput
