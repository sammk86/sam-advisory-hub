'use client'

import React, { useState } from 'react'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface NewsletterSignupFormProps {
  variant?: 'footer' | 'modal' | 'popup' | 'hero'
  showInterests?: boolean
  placeholder?: string
  buttonText?: string
  onSuccess?: (subscriber: any) => void
  onError?: (error: string) => void
  className?: string
}

// Removed unused interface

const INTEREST_OPTIONS = [
  { id: 'software-engineering', label: 'Software Engineering' },
  { id: 'leadership', label: 'Leadership' },
  { id: 'career-transition', label: 'Career Transition' },
  { id: 'technical-advisory', label: 'Technical Advisory' },
]

export default function NewsletterSignupForm({
  variant = 'footer',
  showInterests = false,
  placeholder = 'Enter your email',
  buttonText = 'Subscribe',
  onSuccess,
  onError,
  className = '',
}: NewsletterSignupFormProps) {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(email)) {
      newErrors.email = 'Invalid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInterestChange = (interestId: string, checked: boolean) => {
    if (checked) {
      setInterests(prev => [...prev, interestId])
    } else {
      setInterests(prev => prev.filter(id => id !== interestId))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous messages
    setMessage('')
    setMessageType('')
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          interests: showInterests ? interests : undefined,
          source: variant,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(data.message || 'Successfully subscribed!')
        setMessageType('success')
        
        // Reset form
        setEmail('')
        setFirstName('')
        setLastName('')
        setInterests([])
        setErrors({})
        
        // Call success callback
        if (onSuccess) {
          onSuccess(data)
        }
      } else {
        setMessage(data.message || 'Subscription failed. Please try again.')
        setMessageType('error')
        
        if (onError) {
          onError(data.message || 'Subscription failed')
        }
      }
    } catch {
      const errorMessage = 'Something went wrong. Please try again later.'
      setMessage(errorMessage)
      setMessageType('error')
      
      if (onError) {
        onError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    // Clear messages when user starts typing
    if (message) {
      setMessage('')
      setMessageType('')
    }

    switch (field) {
      case 'email':
        setEmail(value)
        // Clear email error when user starts typing
        if (errors.email) {
          setErrors(prev => ({ ...prev, email: '' }))
        }
        break
      case 'firstName':
        setFirstName(value)
        break
      case 'lastName':
        setLastName(value)
        break
    }
  }

  const getContainerClasses = () => {
    const baseClasses = 'w-full'
    
    switch (variant) {
      case 'modal':
        return `${baseClasses} max-w-md mx-auto`
      case 'popup':
        return `${baseClasses} max-w-sm`
      case 'hero':
        return `${baseClasses} max-w-2xl`
      default:
        return baseClasses
    }
  }

  const getFormClasses = () => {
    const baseClasses = 'flex flex-col sm:flex-row gap-3'
    
    switch (variant) {
      case 'modal':
        return `${baseClasses} flex-col`
      case 'popup':
        return `${baseClasses} flex-col`
      case 'hero':
        return `${baseClasses} flex-col sm:flex-row gap-4`
      default:
        return baseClasses
    }
  }

  return (
    <div className={`${getContainerClasses()} ${className}`}>
      <form onSubmit={handleSubmit} className={getFormClasses()} role="form">
        {/* Email Input */}
        <div className="flex-1">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            aria-label="Email address"
            className={`
              w-full px-4 py-2 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}
              ${variant === 'footer' 
                ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400 rounded-l-lg rounded-r-none sm:rounded-r-none' 
                : variant === 'hero'
                ? 'px-6 py-4 bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 text-lg'
                : 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400'
              }
            `}
          />
          {errors.email && (
            <p className={`mt-1 text-sm animate-pulse ${
              variant === 'hero' ? 'text-red-600' : 'text-red-400'
            }`}>
              {errors.email}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`
            px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
            text-white font-medium rounded-lg transition-colors duration-200
            disabled:cursor-not-allowed flex items-center justify-center gap-2
            ${variant === 'footer' ? 'rounded-r-lg rounded-l-none sm:rounded-l-none' : ''}
            ${variant === 'hero' ? 'px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl text-lg' : ''}
            ${isLoading ? 'animate-pulse' : ''}
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Subscribing...
            </>
          ) : (
            buttonText
          )}
        </button>
      </form>

      {/* Interest Selection */}
      {showInterests && (
        <div className="mt-4">
          <p className="text-sm text-gray-300 mb-3">Interests (optional):</p>
          <div className="grid grid-cols-2 gap-2">
            {INTEREST_OPTIONS.map((option) => (
              <label
                key={option.id}
                className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={interests.includes(option.id)}
                  onChange={(e) => handleInterestChange(option.id, e.target.checked)}
                  disabled={isLoading}
                  className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {message && (
        <div
          className={`
            mt-4 p-3 rounded-lg flex items-center gap-2 text-sm
            ${messageType === 'success' 
              ? variant === 'hero'
                ? 'bg-green-50 border border-green-200 text-green-700 animate-pulse'
                : 'bg-green-900/20 border border-green-500/30 text-green-400 animate-pulse'
              : variant === 'hero'
                ? 'bg-red-50 border border-red-200 text-red-700 animate-bounce'
                : 'bg-red-900/20 border border-red-500/30 text-red-400 animate-bounce'
            }
          `}
          role="alert"
          aria-live="polite"
        >
          {messageType === 'success' ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{message}</span>
        </div>
      )}

      {/* Privacy Notice */}
      <p className={`mt-3 text-xs ${
        variant === 'hero' ? 'text-gray-500' : 'text-gray-400'
      }`}>
        We respect your privacy. Unsubscribe at any time.
      </p>
    </div>
  )
}
