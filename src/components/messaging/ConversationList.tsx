'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, Users, Clock, MoreVertical } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Conversation {
  id: string
  title?: string
  lastMessageAt: string
  participants: Array<{
    id: string
    role: 'ADMIN' | 'MEMBER'
    unreadCount: number
    user: {
      id: string
      name: string
      email: string
      image?: string
      role: 'ADMIN' | 'CLIENT'
    }
  }>
  messages: Array<{
    id: string
    content: string
    createdAt: string
    sender: {
      id: string
      name: string
      email: string
      image?: string
      role: 'ADMIN' | 'CLIENT'
    }
  }>
  _count: {
    messages: number
  }
}

interface ConversationListProps {
  userId: string
  userRole: 'ADMIN' | 'CLIENT'
}

export default function ConversationList({ userId, userRole }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchConversations()
    
    // Poll for new conversations every 30 seconds
    const interval = setInterval(fetchConversations, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setConversations(data.data.conversations)
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId)
    router.push(`/dashboard/messages/${conversationId}`)
  }

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.user.id !== userId)
  }

  const getUnreadCount = (conversation: Conversation) => {
    const participant = conversation.participants.find(p => p.user.id === userId)
    return participant?.unreadCount || 0
  }

  const formatLastMessage = (conversation: Conversation) => {
    if (conversation.messages.length === 0) {
      return 'No messages yet'
    }
    
    const lastMessage = conversation.messages[0]
    const isFromCurrentUser = lastMessage.sender.id === userId
    const prefix = isFromCurrentUser ? 'You: ' : ''
    
    return prefix + (lastMessage.content.length > 50 
      ? lastMessage.content.substring(0, 50) + '...' 
      : lastMessage.content)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Messages</h2>
          {userRole === 'ADMIN' && (
            <button
              onClick={() => router.push('/dashboard/messages/new')}
              className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <MessageCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No conversations yet</h3>
            <p className="text-muted-foreground text-sm">
              Start a conversation with a user or wait for them to message you.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {conversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation)
              const unreadCount = getUnreadCount(conversation)
              const isSelected = selectedConversationId === conversation.id
              
              return (
                <div
                  key={conversation.id}
                  onClick={() => handleConversationSelect(conversation.id)}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                    isSelected ? 'bg-primary/10 border-r-2 border-primary' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="relative">
                      {otherParticipant?.user.image ? (
                        <img
                          src={otherParticipant.user.image}
                          alt={otherParticipant.user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-primary font-medium text-sm">
                            {otherParticipant?.user.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                      )}
                      {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground truncate">
                            {otherParticipant?.user.name || 'Unknown User'}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {otherParticipant?.user.email}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate">
                          {formatLastMessage(conversation)}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{conversation._count.messages}</span>
                          <MessageCircle className="w-3 h-3" />
                        </div>
                      </div>

                      {/* Role indicator */}
                      <div className="flex items-center space-x-2 mt-1">
                        {otherParticipant?.user.role === 'ADMIN' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            Admin
                          </span>
                        )}
                        {otherParticipant?.user.role === 'CLIENT' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
                            Client
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
