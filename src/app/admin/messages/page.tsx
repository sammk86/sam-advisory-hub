'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import ConversationList from '@/components/messaging/ConversationList'
import ChatInterface from '@/components/messaging/ChatInterface'

export default function AdminMessagesPage() {
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

    // Redirect non-admin users
    if (session.user.role !== 'ADMIN') {
      router.push('/unauthorized')
      return
    }
  }, [session, status, router])

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="mt-1 text-gray-600">Communicate with users and manage conversations</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
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
    </div>
  )
}
