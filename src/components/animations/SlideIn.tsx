'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface SlideInProps {
  children: ReactNode
  delay?: number
  duration?: number
  direction?: 'left' | 'right' | 'up' | 'down'
  className?: string
}

export default function SlideIn({ 
  children, 
  delay = 0, 
  duration = 0.5, 
  direction = 'left',
  className = '' 
}: SlideInProps) {
  const slideVariants = {
    hidden: {
      x: direction === 'left' ? -100 : direction === 'right' ? 100 : 0,
      y: direction === 'up' ? -100 : direction === 'down' ? 100 : 0,
      opacity: 0,
    },
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
    },
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={slideVariants}
      transition={{
        duration,
        delay,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  )
}

