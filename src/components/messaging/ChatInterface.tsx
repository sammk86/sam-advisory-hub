'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Paperclip, Smile, ArrowLeft, MoreVertical, User } from 'lucide-react'
import MessageBubble from './MessageBubble'

interface Message {
  id: string
  content: string
  messageType: 'TEXT'
  isRead: boolean
  readAt?: string
  createdAt: string
  sender: {
    id: string
    name: string
    email: string
    image?: string
    role: 'ADMIN' | 'CLIENT'
  }
}

interface Conversation {
  id: string
  title?: string
  participants: Array<{
    id: string
    role: 'ADMIN' | 'MEMBER'
    user: {
      id: string
      name: string
      email: string
      image?: string
      role: 'ADMIN' | 'CLIENT'
    }
  }>
}

interface ChatInterfaceProps {
  conversationId: string
  userId: string
  userRole: 'ADMIN' | 'CLIENT'
  onBack?: () => void
}

export default function ChatInterface({ 
  conversationId, 
  userId, 
  userRole, 
  onBack 
}: ChatInterfaceProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (conversationId) {
      fetchConversation()
      fetchMessages()
      
      // Poll for new messages every 5 seconds
      const interval = setInterval(fetchMessages, 5000)
      return () => clearInterval(interval)
    }
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversation = async () => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setConversation(data.data.conversation)
        }
      }
    } catch (error) {
      console.error('Error fetching conversation:', error)
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMessages(data.data.messages)
          setLoading(false)
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      setLoading(false)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || sending) return

    const messageContent = newMessage.trim()
    setNewMessage('')
    setSending(true)

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: messageContent
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMessages(prev => [...prev, data.data])
          scrollToBottom()
        }
      } else {
        // Revert the message if sending failed
        setNewMessage(messageContent)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setNewMessage(messageContent)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(e)
    }
  }

  const getOtherParticipant = () => {
    if (!conversation) return null
    return conversation.participants.find(p => p.user.id !== userId)
  }

  const otherParticipant = getOtherParticipant()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-background">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          
          {/* Avatar */}
          {otherParticipant?.user.image ? (
            <img
              src={otherParticipant.user.image}
              alt={otherParticipant.user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
          )}

          {/* User Info */}
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">
              {otherParticipant?.user.name || 'Unknown User'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {otherParticipant?.user.email}
            </p>
            <p className="text-xs text-muted-foreground">
              {otherParticipant?.user.role === 'ADMIN' ? 'Administrator' : 'Client'}
            </p>
          </div>

          {/* Actions */}
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Start the conversation</h3>
            <p className="text-muted-foreground text-sm">
              Send a message to begin your conversation.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwn = message.sender.id === userId
              const showAvatar = index === 0 || messages[index - 1].sender.id !== message.sender.id
              
              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  showAvatar={!isOwn && showAvatar}
                />
              )
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-background">
        <form onSubmit={sendMessage} className="flex items-end space-x-3">
          {/* Attachment Button */}
          <button
            type="button"
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Paperclip className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-4 py-2 pr-12 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={1}
              style={{
                minHeight: '44px',
                maxHeight: '120px',
                height: 'auto'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = target.scrollHeight + 'px'
              }}
            />
            
            {/* Emoji Button */}
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-muted rounded transition-colors"
            >
              <Smile className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
