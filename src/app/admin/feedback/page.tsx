'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Star, Check, X, Trash2, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Feedback {
  id: string
  rating: number
  title: string
  content: string
  serviceType: string | null
  isPublic: boolean
  isApproved: boolean
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    image?: string
  }
}

export default function AdminFeedbackPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/auth/signin')
      return
    }
    fetchFeedbacks()
  }, [session, status, router])

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch(`/api/admin/feedback?timestamp=${Date.now()}`)
      if (!response.ok) throw new Error('Failed to fetch feedbacks')
      
      const data = await response.json()
      if (data.success) {
        setFeedbacks(data.data.feedbacks)
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveToggle = async (feedbackId: string, currentStatus: boolean) => {
    setActionLoading(feedbackId)
    
    try {
      const response = await fetch(`/api/admin/feedback/${feedbackId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isApproved: !currentStatus
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        // Update local state
        setFeedbacks(prev => prev.map(feedback => 
          feedback.id === feedbackId 
            ? { ...feedback, isApproved: !currentStatus }
            : feedback
        ))
      } else {
        alert(data.error || 'Failed to update feedback')
      }
    } catch (error) {
      console.error('Error updating feedback:', error)
      alert('Failed to update feedback')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (feedbackId: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return
    
    setActionLoading(feedbackId)
    
    try {
      const response = await fetch(`/api/admin/feedback/${feedbackId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      
      if (data.success) {
        // Remove from local state
        setFeedbacks(prev => prev.filter(feedback => feedback.id !== feedbackId))
      } else {
        alert(data.error || 'Failed to delete feedback')
      }
    } catch (error) {
      console.error('Error deleting feedback:', error)
      alert('Failed to delete feedback')
    } finally {
      setActionLoading(null)
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

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feedback Management</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage user feedback and approvals</p>
          </div>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const pendingFeedbacks = feedbacks.filter(f => !f.isApproved)
  const approvedFeedbacks = feedbacks.filter(f => f.isApproved)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Feedback Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Manage user feedback and approvals</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{feedbacks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingFeedbacks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedFeedbacks.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Feedbacks */}
        {pendingFeedbacks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Pending Approval ({pendingFeedbacks.length})</CardTitle>
              <CardDescription>Feedbacks waiting for approval to be displayed publicly</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingFeedbacks.map((feedback) => (
                  <div key={feedback.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <h4 className="font-medium">{feedback.title}</h4>
                        <div className="flex items-center gap-2">
                          {renderStars(feedback.rating)}
                          {feedback.serviceType && (
                            <Badge variant="secondary">
                              {feedback.serviceType}
                            </Badge>
                          )}
                          <Badge variant="outline">
                            {feedback.isPublic ? 'Public' : 'Private'}
                          </Badge>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm">{feedback.content}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          By: {feedback.user.name} ({feedback.user.email})
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveToggle(feedback.id, feedback.isApproved)}
                          disabled={actionLoading === feedback.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          {actionLoading === feedback.id ? 'Processing...' : 'Approve'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(feedback.id)}
                          disabled={actionLoading === feedback.id}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Approved Feedbacks */}
        {approvedFeedbacks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Approved Feedbacks ({approvedFeedbacks.length})</CardTitle>
              <CardDescription>Feedbacks that are displayed publicly on the landing page</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approvedFeedbacks.map((feedback) => (
                  <div key={feedback.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <h4 className="font-medium">{feedback.title}</h4>
                        <div className="flex items-center gap-2">
                          {renderStars(feedback.rating)}
                          {feedback.serviceType && (
                            <Badge variant="secondary">
                              {feedback.serviceType}
                            </Badge>
                          )}
                          <Badge variant="default">
                            {feedback.isPublic ? 'Public' : 'Private'}
                          </Badge>
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Approved
                          </Badge>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm">{feedback.content}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          By: {feedback.user.name} ({feedback.user.email})
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApproveToggle(feedback.id, feedback.isApproved)}
                          disabled={actionLoading === feedback.id}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <X className="h-4 w-4 mr-1" />
                          {actionLoading === feedback.id ? 'Processing...' : 'Revoke'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(feedback.id)}
                          disabled={actionLoading === feedback.id}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {feedbacks.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Feedback Yet</h3>
              <p className="text-gray-600">No feedback has been submitted yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
