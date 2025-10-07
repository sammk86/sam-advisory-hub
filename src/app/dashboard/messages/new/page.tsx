'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Users, MessageCircle } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { getOrCreateUserAdminConversation } from '@/lib/messaging'

export default function NewConversationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  const [customMessage, setCustomMessage] = useState('')

  const startSupportConversation = async () => {
    if (!session?.user?.id) return

    setLoading(true)
    try {
      // Create a conversation with admin
      const conversation = await getOrCreateUserAdminConversation({
        userId: session.user.id,
        title: 'Support Request',
        initialMessage: customMessage.trim() || 'Hello! I need help with my account or services.'
      })

      // Redirect to the conversation
      router.push(`/dashboard/messages/${conversation.id}`)
    } catch (error) {
      console.error('Error creating conversation:', error)
      // Fallback: redirect to messages page
      router.push('/dashboard/messages')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <DashboardLayout
        title="New Message"
        description="Start a new conversation"
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="New Message"
      description="Start a new conversation"
    >
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard/messages')}
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Messages
        </button>

        {/* Options */}
        <div className="space-y-4">
          {/* Support Conversation */}
          <div className="bg-card border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Send Message
                </h3>
                
                {/* Message Input */}
                <div className="mb-4">
                  <label htmlFor="customMessage" className="block text-sm font-medium text-foreground mb-2">
                    Your Message (Optional)
                  </label>
                  <textarea
                    id="customMessage"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Type your message here... (leave blank for a generic greeting)"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                <button
                  onClick={startSupportConversation}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  ) : (
                    <MessageCircle className="w-4 h-4 mr-2" />
                  )}
                  Start Conversation
                </button>
              </div>
            </div>
          </div>

          {/* Future: Direct User Messaging */}
          {session?.user?.role === 'ADMIN' && (
            <div className="bg-card border border-border rounded-lg p-6 opacity-50">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Message a User
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Start a conversation with a specific user. This feature is coming soon.
                  </p>
                  <button
                    disabled
                    className="inline-flex items-center px-4 py-2 bg-secondary text-secondary-foreground rounded-lg cursor-not-allowed transition-colors"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-muted/50 rounded-lg p-6">
          <h4 className="font-medium text-foreground mb-2">How it works</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Type your message in the text area above (optional)</li>
            <li>• Click "Start Conversation" to create a new conversation</li>
            <li>• You'll receive responses in real-time</li>
            <li>• All conversations are saved for your reference</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  )
}
