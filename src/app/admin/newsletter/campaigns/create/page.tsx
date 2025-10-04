'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Save, 
  Send, 
  ArrowLeft, 
  Eye, 
  Calendar,
  Users,
  Mail,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface CampaignFormData {
  title: string
  subject: string
  content: string
  textContent: string
  scheduledAt: string
}

export default function CreateCampaignPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  
  const [formData, setFormData] = useState<CampaignFormData>({
    title: '',
    subject: '',
    content: '',
    textContent: '',
    scheduledAt: ''
  })

  const handleInputChange = (field: keyof CampaignFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
    setSuccess(null)
  }

  const handleSaveDraft = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/newsletter/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status: 'DRAFT'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save campaign')
      }

      const data = await response.json()
      setSuccess('Campaign saved as draft successfully!')
      
      // Redirect to campaigns list after a short delay
      setTimeout(() => {
        router.push('/admin/newsletter/campaigns')
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save campaign')
    } finally {
      setLoading(false)
    }
  }

  const handleSendNow = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/newsletter/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status: 'SENDING'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to send campaign')
      }

      const data = await response.json()
      setSuccess('Campaign is being sent to subscribers!')
      
      // Redirect to campaigns list after a short delay
      setTimeout(() => {
        router.push('/admin/newsletter/campaigns')
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send campaign')
    } finally {
      setLoading(false)
    }
  }

  const handleSchedule = async () => {
    if (!formData.scheduledAt) {
      setError('Please select a scheduled date and time')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/newsletter/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status: 'SCHEDULED'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to schedule campaign')
      }

      const data = await response.json()
      setSuccess('Campaign scheduled successfully!')
      
      // Redirect to campaigns list after a short delay
      setTimeout(() => {
        router.push('/admin/newsletter/campaigns')
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule campaign')
    } finally {
      setLoading(false)
    }
  }

  const generateTextContent = (htmlContent: string) => {
    // Simple HTML to text conversion
    return htmlContent
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim()
  }

  const handleContentChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      content,
      textContent: generateTextContent(content)
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Newsletter Campaign</h1>
            <p className="text-gray-600">Create and send newsletters to your subscribers</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-6">
                {/* Campaign Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Campaign Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter campaign title"
                  />
                </div>

                {/* Email Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter email subject line"
                  />
                </div>

                {/* Content */}
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                    Newsletter Content
                  </label>
                  {previewMode ? (
                    <div 
                      className="mt-1 block w-full min-h-96 p-4 border border-gray-300 rounded-md bg-gray-50"
                      dangerouslySetInnerHTML={{ __html: formData.content }}
                    />
                  ) : (
                    <textarea
                      id="content"
                      rows={12}
                      value={formData.content}
                      onChange={(e) => handleContentChange(e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter your newsletter content (HTML supported)"
                    />
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    You can use HTML tags for formatting. The text version will be generated automatically.
                  </p>
                </div>

                {/* Scheduled Date */}
                <div>
                  <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700">
                    Schedule Campaign (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    id="scheduledAt"
                    value={formData.scheduledAt}
                    onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Leave empty to send immediately or save as draft
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Campaign Stats */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Campaign Info</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Mail className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Subject:</span>
                  <span className="ml-2 font-medium">{formData.subject || 'Not set'}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Users className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Active Subscribers:</span>
                  <span className="ml-2 font-medium">Loading...</span>
                </div>
                {formData.scheduledAt && (
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Scheduled:</span>
                    <span className="ml-2 font-medium">
                      {new Date(formData.scheduledAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleSaveDraft}
                  disabled={loading || !formData.title || !formData.subject || !formData.content}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save as Draft
                </button>

                <button
                  onClick={handleSendNow}
                  disabled={loading || !formData.title || !formData.subject || !formData.content}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Now
                </button>

                {formData.scheduledAt && (
                  <button
                    onClick={handleSchedule}
                    disabled={loading || !formData.title || !formData.subject || !formData.content}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
