'use client'

import { useState } from 'react'
import { X, Send, Mail, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getFullUrl } from '@/lib/url-utils'

interface PendingUser {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: string
  updatedAt: string
  emailVerified: string | null
}

interface UserActionEmailModalProps {
  isOpen: boolean
  onClose: () => void
  user: PendingUser | null
  action: 'approve' | 'reject' | null
  onSubmit: (customMessage?: string) => Promise<void>
  isLoading?: boolean
}

export default function UserActionEmailModal({
  isOpen,
  onClose,
  user,
  action,
  onSubmit,
  isLoading = false
}: UserActionEmailModalProps) {
  const [customMessage, setCustomMessage] = useState('')
  const [useCustomMessage, setUseCustomMessage] = useState(false)

  if (!isOpen || !user || !action) return null

  const isApproval = action === 'approve'
  const defaultSubject = isApproval 
    ? '🎉 Your SamAdvisoryHub Account is Confirmed!' 
    : 'Important: Your SamAdvisoryHub Account Status'
  
  const defaultMessage = isApproval
    ? `Hi ${user.name || 'there'},

Great news! Your SamAdvisoryHub account has been confirmed and you now have full access to our platform.

Welcome to the SamAdvisoryHub community! We're excited to support your professional growth.

You can now explore our services, watch educational videos, and subscribe to our newsletter to get the most out of your experience.

Best regards,
The SamAdvisoryHub Team`
    : `Hi ${user.name || 'there'},

We appreciate your interest in SamAdvisoryHub. After careful review, we're unable to approve your application at this time.

This decision is not permanent. We encourage you to reapply in the future.

If you have any questions about this decision, please contact our support team.

Best regards,
The SamAdvisoryHub Team`

  const handleSubmit = async () => {
    const messageToSend = useCustomMessage ? customMessage : defaultMessage
    await onSubmit(messageToSend)
    // Reset form
    setCustomMessage('')
    setUseCustomMessage(false)
  }

  const handleClose = () => {
    setCustomMessage('')
    setUseCustomMessage(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-4 border-b ${isApproval ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isApproval ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <AlertCircle className="h-6 w-6 text-red-600" />
              )}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {isApproval ? 'Approve User' : 'Reject User'}
                </h2>
                <p className="text-sm text-gray-600">
                  {isApproval ? 'Send approval notification to' : 'Send rejection notification to'}: {user.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">User Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Name:</span>
                <span className="ml-2 font-medium">{user.name || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>
                <span className="ml-2 font-medium">{user.email}</span>
              </div>
              <div>
                <span className="text-gray-500">Role:</span>
                <span className="ml-2 font-medium">{user.role}</span>
              </div>
              <div>
                <span className="text-gray-500">Registered:</span>
                <span className="ml-2 font-medium">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Email Content */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-gray-400" />
              <h3 className="font-medium text-gray-900">Email Content</h3>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={defaultSubject}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
              />
            </div>

            {/* Message */}
            <div>
              <div className="flex items-center space-x-4 mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={useCustomMessage}
                    onChange={(e) => setUseCustomMessage(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Use custom message</span>
                </label>
              </div>

              <textarea
                value={useCustomMessage ? customMessage : defaultMessage}
                onChange={(e) => useCustomMessage && setCustomMessage(e.target.value)}
                readOnly={!useCustomMessage}
                rows={12}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md resize-none ${
                  useCustomMessage ? 'bg-white' : 'bg-gray-50 text-gray-600'
                }`}
                placeholder={useCustomMessage ? "Enter your custom message..." : undefined}
              />
            </div>

            {/* Action Info */}
            <div className={`p-4 rounded-lg ${isApproval ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-start space-x-3">
                {isApproval ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div>
                  <h4 className={`font-medium ${isApproval ? 'text-green-800' : 'text-red-800'}`}>
                    {isApproval ? 'Approval Action' : 'Rejection Action'}
                  </h4>
                  <p className={`text-sm mt-1 ${isApproval ? 'text-green-700' : 'text-red-700'}`}>
                    {isApproval 
                      ? 'This will approve the user and send them a confirmation email. They will gain full access to the platform.'
                      : 'This will reject the user and send them a notification email. They will not have access to the platform.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {isApproval ? 'The user will be approved and notified via email.' : 'The user will be rejected and notified via email.'}
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`flex items-center space-x-2 ${
                isApproval 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              <Send className="h-4 w-4" />
              <span>{isLoading ? 'Sending...' : `${isApproval ? 'Approve' : 'Reject'} & Send Email`}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
