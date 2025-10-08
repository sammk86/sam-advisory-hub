'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import Input from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Star, Send, MessageSquare } from 'lucide-react'

interface Feedback {
  id: string
  rating: number
  title: string
  content: string
  serviceType: string | null
  isPublic: boolean
  isApproved: boolean
  createdAt: string
}

export default function FeedbackPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Form state
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [isPublic, setIsPublic] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'CLIENT') {
      router.push('/auth/signin')
      return
    }
    fetchFeedbacks()
  }, [session, status, router])

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch(`/api/feedback?timestamp=${Date.now()}`)
      if (!response.ok) throw new Error('Failed to fetch feedbacks')
      
      const data = await response.json()
      if (data.success) {
        // Filter to show only user's own feedbacks
        const userFeedbacks = data.data.feedbacks.filter(
          (feedback: any) => feedback.userId === session?.user?.id
        )
        setFeedbacks(userFeedbacks)
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!rating || !title.trim() || !content.trim()) {
      alert('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          title: title.trim(),
          content: content.trim(),
          serviceType: serviceType || null,
          isPublic
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        alert('Feedback submitted successfully!')
        // Reset form
        setRating(5)
        setTitle('')
        setContent('')
        setServiceType('')
        setIsPublic(true)
        // Refresh feedbacks
        fetchFeedbacks()
      } else {
        alert(data.error || 'Failed to submit feedback')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert('Failed to submit feedback')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive ? () => setRating(star) : undefined}
            className={`${
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            } transition-transform`}
            disabled={!interactive}
          >
            <Star
              className={`h-5 w-5 ${
                star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feedback</h1>
            <p className="text-gray-600 dark:text-gray-300">Share your experience and help us improve</p>
          </div>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feedback</h1>
          <p className="text-gray-600 dark:text-gray-300">Share your experience and help us improve</p>
        </div>

        {/* Submit Feedback Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <MessageSquare className="h-5 w-5" />
              Submit New Feedback
            </CardTitle>
            <CardDescription>
              Help us improve by sharing your experience with our services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rating">Rating *</Label>
                {renderStars(rating, true)}
                <p className="text-sm text-gray-500">Click stars to rate (1-5)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief title for your feedback"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type (Optional)</Label>
                <Select 
                  value={serviceType} 
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full"
                >
                  <option value="">Select service type</option>
                  <option value="MENTORSHIP">Mentorship</option>
                  <option value="ADVISORY">Advisory</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Your Feedback *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your detailed feedback about your experience..."
                  rows={6}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isPublic" className="text-sm">
                  Make this feedback public (it will be visible on the landing page after approval)
                </Label>
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? (
                  'Submitting...'
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* User's Previous Feedbacks */}
        {feedbacks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Your Previous Feedback</CardTitle>
              <CardDescription>
                Review your submitted feedback and their approval status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedbacks.map((feedback) => (
                  <div key={feedback.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{feedback.title}</h4>
                        <div className="flex items-center gap-2">
                          {renderStars(feedback.rating)}
                          {feedback.serviceType && (
                            <Badge variant="secondary">
                              {feedback.serviceType}
                            </Badge>
                          )}
                          <Badge
                            variant={feedback.isPublic ? 'default' : 'outline'}
                          >
                            {feedback.isPublic ? 'Public' : 'Private'}
                          </Badge>
                          <Badge
                            variant={feedback.isApproved ? 'default' : 'secondary'}
                          >
                            {feedback.isApproved ? 'Approved' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{feedback.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
