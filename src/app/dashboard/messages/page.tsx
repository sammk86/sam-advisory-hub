'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ConversationList from '@/components/messaging/ConversationList'
import ChatInterface from '@/components/messaging/ChatInterface'

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // For regular users, automatically create/redirect to their conversation with admin
    if (session.user.role === 'CLIENT') {
      handleUserMessaging()
    }
  }, [session, status, router])

  const handleUserMessaging = async () => {
    if (!session?.user?.id) return

    setLoading(true)
    try {
      // Call API to get or create conversation with admin
      const response = await fetch('/api/conversations/user-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Support Conversation',
          initialMessage: ''
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create conversation')
      }

      const data = await response.json()
      
      if (data.success && data.data?.id) {
        // Redirect to the conversation
        router.push(`/dashboard/messages/${data.data.id}`)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
      // Fallback: redirect to new message page
      router.push('/dashboard/messages/new')
    } finally {
      setLoading(false)
    }
  }


  if (status === 'loading' || loading) {
    return (
      <DashboardLayout
        title="Messages"
        description="Communicate with admin"
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  // For regular users, show loading while redirecting
  if (session?.user?.role === 'CLIENT') {
    return (
      <DashboardLayout
        title="Messages"
        description="Communicate with admin"
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  // For admin users, show the conversation list and chat interface
  return (
    <DashboardLayout
      title="Messages"
      description="Communicate with users"
    >
      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List - Only for Admin */}
        <div className="lg:col-span-1">
          <ConversationList 
            userId={session?.user?.id || ''} 
            userRole={session?.user?.role || 'ADMIN'}
          />
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          {selectedConversationId ? (
            <ChatInterface
              conversationId={selectedConversationId}
              userId={session?.user?.id || ''}
              userRole={session?.user?.role || 'ADMIN'}
              onBack={() => setSelectedConversationId(null)}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-background rounded-lg border border-border">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Select a Conversation</h3>
                <p className="text-muted-foreground">Choose a conversation from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}


