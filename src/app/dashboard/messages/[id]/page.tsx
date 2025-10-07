'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ChatInterface from '@/components/messaging/ChatInterface'

interface ConversationPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ConversationPage({ params }: ConversationPageProps) {
  const [conversationId, setConversationId] = useState<string | null>(null)

  useEffect(() => {
    const getParams = async () => {
      const { id } = await params
      setConversationId(id)
    }
    getParams()
  }, [params])

  if (!conversationId) {
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

  return <ConversationPageClient conversationId={conversationId} />
}

function ConversationPageClient({ conversationId }: { conversationId: string }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <DashboardLayout
        title="Messages"
        description={session?.user?.role === 'ADMIN' ? "Communicate with users" : "Communicate with admin"}
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Messages"
      description={session?.user?.role === 'ADMIN' ? "Communicate with users" : "Communicate with admin"}
    >
      <div className="h-[calc(100vh-200px)]">
        <ChatInterface
          conversationId={conversationId}
          userId={session?.user?.id || ''}
          userRole={session?.user?.role || 'CLIENT'}
          onBack={session?.user?.role === 'ADMIN' ? () => router.push('/dashboard/messages') : undefined}
        />
      </div>
    </DashboardLayout>
  )
}
