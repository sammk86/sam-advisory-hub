'use client'

import React, { useState, useEffect } from 'react'
import { X, Mail, Star } from 'lucide-react'
import NewsletterSignupForm from './NewsletterSignupForm'

interface NewsletterModalProps {
  isOpen: boolean
  onClose: () => void
  trigger?: 'exit-intent' | 'timed' | 'scroll'
  delay?: number // in milliseconds
}

export default function NewsletterModal({
  isOpen,
  onClose,
  trigger = 'exit-intent',
  delay = 5000, // 5 seconds default
}: NewsletterModalProps) {
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (trigger === 'timed' && delay > 0) {
      const timer = setTimeout(() => {
        setShowModal(true)
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [trigger, delay])

  useEffect(() => {
    if (trigger === 'exit-intent') {
      const handleMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 0) {
          setShowModal(true)
        }
      }

      document.addEventListener('mouseleave', handleMouseLeave)
      return () => document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [trigger])

  useEffect(() => {
    if (trigger === 'scroll') {
      const handleScroll = () => {
        const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        if (scrollPercentage > 50) { // Show after 50% scroll
          setShowModal(true)
        }
      }

      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [trigger])

  const handleClose = () => {
    setShowModal(false)
    onClose()
  }

  const handleSuccess = () => {
    // Close modal after successful subscription
    setTimeout(() => {
      handleClose()
    }, 2000)
  }

  if (!isOpen && !showModal) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Stay Ahead in Your Career
            </h2>
            <p className="text-gray-600">
              Get weekly insights, exclusive tips, and early access to new mentorship programs.
            </p>
          </div>

          {/* Benefits */}
          <div className="mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">Weekly career insights from industry leaders</span>
              </div>
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">Exclusive mentorship program updates</span>
              </div>
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">Early access to workshops and events</span>
              </div>
            </div>
          </div>

          {/* Newsletter Form */}
          <NewsletterSignupForm
            variant="modal"
            showInterests={true}
            placeholder="Enter your email address"
            buttonText="Subscribe Now"
            onSuccess={handleSuccess}
            onError={(error) => {
              console.error('Newsletter subscription error:', error)
            }}
            className="bg-gray-50 p-4 rounded-lg"
          />

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Join 2,000+ professionals already subscribed. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook for managing newsletter modal
export function useNewsletterModal(trigger: 'exit-intent' | 'timed' | 'scroll' = 'exit-intent') {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  return {
    isOpen,
    openModal,
    closeModal,
    trigger,
  }
}
