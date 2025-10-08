'use client'

import { useState, useEffect } from 'react'
import { Star, Quote, User } from 'lucide-react'

interface Feedback {
  id: string
  rating: number
  title: string
  content: string
  serviceType: string | null
  createdAt: string
  user: {
    name: string
    image?: string
  }
}

interface FeedbackGridProps {
  maxItems?: number
  showHeader?: boolean
  className?: string
  backgroundClass?: string
}

export default function FeedbackGrid({ 
  maxItems = 6, 
  showHeader = true,
  className = "",
  backgroundClass = "bg-gray-900"
}: FeedbackGridProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeedbacks()
  }, [])

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch('/api/feedback?public=true&approved=true&timestamp=' + Date.now())
      if (!response.ok) throw new Error('Failed to fetch feedbacks')
      
      const data = await response.json()
      if (data.success) {
        const limitedFeedbacks = data.data.feedbacks.slice(0, maxItems)
        setFeedbacks(limitedFeedbacks)
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <section className={`py-16 ${backgroundClass} ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {showHeader && (
            <div className="text-center mb-12">
              <h2 className={`text-3xl font-bold mb-4 ${backgroundClass === 'bg-gray-900' ? 'text-white' : 'text-gray-900'}`}>
                What Our Clients Say
              </h2>
              <p className={`text-xl ${backgroundClass === 'bg-gray-900' ? 'text-gray-300' : 'text-gray-600'}`}>
                Real feedback from real people who have worked with Sam
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`${backgroundClass === 'bg-gray-900' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md animate-pulse`}>
                <div className={`h-4 ${backgroundClass === 'bg-gray-900' ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-4`}></div>
                <div className={`h-4 ${backgroundClass === 'bg-gray-900' ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-2`}></div>
                <div className={`h-4 ${backgroundClass === 'bg-gray-900' ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-4`}></div>
                <div className="flex items-center space-x-2">
                  <div className={`h-8 w-8 ${backgroundClass === 'bg-gray-900' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full`}></div>
                  <div className={`h-4 ${backgroundClass === 'bg-gray-900' ? 'bg-gray-700' : 'bg-gray-200'} rounded w-24`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (feedbacks.length === 0) {
    return null // Don't show section if no approved feedbacks
  }

  return (
    <section className={`py-16 ${backgroundClass} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showHeader && (
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${backgroundClass === 'bg-gray-900' ? 'text-white' : 'text-gray-900'}`}>
              What Our Clients Say
            </h2>
            <p className={`text-xl ${backgroundClass === 'bg-gray-900' ? 'text-gray-300' : 'text-gray-600'}`}>
              Real feedback from real people who have worked with Sam
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {feedbacks.map((feedback) => (
            <div
              key={feedback.id}
              className={`${backgroundClass === 'bg-gray-900' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow`}
            >
              <div className="flex items-center mb-4">
                {renderStars(feedback.rating)}
                {feedback.serviceType && (
                  <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {feedback.serviceType}
                  </span>
                )}
              </div>
              
              <div className="mb-4">
                <h3 className={`font-semibold mb-2 ${backgroundClass === 'bg-gray-900' ? 'text-white' : 'text-gray-900'}`}>
                  {feedback.title}
                </h3>
                <p className={`text-sm leading-relaxed ${backgroundClass === 'bg-gray-900' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {feedback.content}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {feedback.user.image ? (
                    <img
                      src={feedback.user.image}
                      alt={feedback.user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`h-8 w-8 rounded-full ${backgroundClass === 'bg-gray-900' ? 'bg-gray-700' : 'bg-gray-300'} flex items-center justify-center`}>
                      <User className={`h-4 w-4 ${backgroundClass === 'bg-gray-900' ? 'text-gray-400' : 'text-gray-600'}`} />
                    </div>
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${backgroundClass === 'bg-gray-900' ? 'text-white' : 'text-gray-900'}`}>
                    {feedback.user.name}
                  </p>
                  <p className={`text-xs ${backgroundClass === 'bg-gray-900' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showHeader && (
          <div className="text-center mt-12">
            <p className={`${backgroundClass === 'bg-gray-900' ? 'text-gray-300' : 'text-gray-600'}`}>
              Want to share your experience?{' '}
              <a
                href="/auth/signin"
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Sign in to leave feedback
              </a>
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
