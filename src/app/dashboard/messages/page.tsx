'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MessageCircle, Send, Paperclip, Search, Filter, Plus, User, Clock } from 'lucide-react'
import Button from '@/components/ui/Button'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DashboardCard from '@/components/dashboard/DashboardCard'
import StatusBadge from '@/components/ui/StatusBadge'

interface Message {
  id: string
  sender: {
    id: string
    name: string
    role: 'MENTOR' | 'ADVISOR' | 'CLIENT'
    avatar?: string
  }
  content: string
  timestamp: string
  isRead: boolean
  attachments?: Array<{
    id: string
    name: string
    type: string
    url: string
  }>
}

interface Conversation {
  id: string
  participant: {
    id: string
    name: string
    role: 'MENTOR' | 'ADVISOR'
    title: string
    avatar?: string
  }
  lastMessage: Message
  unreadCount: number
  type: 'MENTORSHIP' | 'ADVISORY'
}

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchConversations()
  }, [session, status, router])

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages')
      if (!response.ok) {
        throw new Error('Failed to fetch conversations')
      }
      const data = await response.json()
      setConversations(data.conversations || [])
    } catch (error) {
      console.error('Error fetching conversations:', error)
      // Mock data for development
      setConversations([
        {
          id: 'conv-1',
          participant: {
            id: 'mentor-1',
            name: 'Sarah Johnson',
            role: 'MENTOR',
            title: 'Senior Engineering Manager'
          },
          lastMessage: {
            id: 'msg-1',
            sender: {
              id: 'mentor-1',
              name: 'Sarah Johnson',
              role: 'MENTOR'
            },
            content: 'Great progress on the system design project! Let\'s discuss the next steps in our next session.',
            timestamp: '2024-01-19T14:30:00Z',
            isRead: false
          },
          unreadCount: 2,
          type: 'MENTORSHIP'
        },
        {
          id: 'conv-2',
          participant: {
            id: 'advisor-1',
            name: 'Michael Chen',
            role: 'ADVISOR',
            title: 'Former VP of Product'
          },
          lastMessage: {
            id: 'msg-2',
            sender: {
              id: 'advisor-1',
              name: 'Michael Chen',
              role: 'ADVISOR'
            },
            content: 'I\'ve reviewed your go-to-market strategy document. The pricing model looks solid, but we should discuss the competitive positioning.',
            timestamp: '2024-01-18T16:45:00Z',
            isRead: true
          },
          unreadCount: 0,
          type: 'ADVISORY'
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages/${conversationId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
      // Mock data for development
      setMessages([
        {
          id: 'msg-1',
          sender: {
            id: 'mentor-1',
            name: 'Sarah Johnson',
            role: 'MENTOR'
          },
          content: 'Great progress on the system design project! Let\'s discuss the next steps in our next session.',
          timestamp: '2024-01-19T14:30:00Z',
          isRead: true
        },
        {
          id: 'msg-2',
          sender: {
            id: 'client-1',
            name: 'You',
            role: 'CLIENT'
          },
          content: 'Thank you! I\'ve been working on the scalability section. Should I focus on horizontal or vertical scaling first?',
          timestamp: '2024-01-19T15:15:00Z',
          isRead: true
        },
        {
          id: 'msg-3',
          sender: {
            id: 'mentor-1',
            name: 'Sarah Johnson',
            role: 'MENTOR'
          },
          content: 'Great question! For your use case, I\'d recommend starting with horizontal scaling. Let\'s discuss the trade-offs in our next session.',
          timestamp: '2024-01-19T16:00:00Z',
          isRead: false
        }
      ])
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selectedConversation,
          content: newMessage,
        }),
      })

      if (response.ok) {
        setNewMessage('')
        // Refresh messages
        fetchMessages(selectedConversation)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (status === 'loading' || isLoading) {
    return (
      <DashboardLayout
        title="Messages"
        description="Communicate with your mentors and advisors"
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Messages"
      description="Communicate with your mentors and advisors"
      actions={
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Message
        </Button>
      }
    >
      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <DashboardCard title="Conversations" className="h-full">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Conversations */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => {
                      setSelectedConversation(conversation.id)
                      fetchMessages(conversation.id)
                    }}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation === conversation.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 truncate">
                            {conversation.participant.name}
                          </h4>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage.content}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">
                            {new Date(conversation.lastMessage.timestamp).toLocaleDateString()}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            conversation.type === 'MENTORSHIP' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {conversation.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* Messages */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <DashboardCard className="h-full flex flex-col">
              <div className="flex-1 flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender.role === 'CLIENT' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender.role === 'CLIENT'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender.role === 'CLIENT' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </DashboardCard>
          ) : (
            <DashboardCard className="h-full flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Conversation</h3>
                <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
              </div>
            </DashboardCard>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
