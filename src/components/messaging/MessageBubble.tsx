'use client'

import { formatDistanceToNow } from 'date-fns'
import { Check, CheckCheck } from 'lucide-react'

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

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showAvatar?: boolean
  showTimestamp?: boolean
}

export default function MessageBubble({ 
  message, 
  isOwn, 
  showAvatar = false, 
  showTimestamp = false 
}: MessageBubbleProps) {
  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true })
  }

  const getMessageStatus = () => {
    if (!isOwn) return null
    
    if (message.isRead) {
      return <CheckCheck className="w-3 h-3 text-blue-500" />
    } else {
      return <Check className="w-3 h-3 text-muted-foreground" />
    }
  }

  // All messages are TEXT type now, so we can remove the SYSTEM message handling

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
        {/* Avatar */}
        {!isOwn && showAvatar && (
          <div className="flex-shrink-0">
            {message.sender.image ? (
              <img
                src={message.sender.image}
                alt={message.sender.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-medium text-xs">
                  {message.sender.name?.charAt(0) || 'U'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Message Content */}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {/* Message Bubble */}
          <div
            className={`px-4 py-2 rounded-2xl ${
              isOwn
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'bg-muted text-foreground rounded-bl-md'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>

          {/* Message Metadata */}
          <div className={`flex items-center space-x-1 mt-1 text-xs text-muted-foreground ${
            isOwn ? 'flex-row-reverse' : 'flex-row'
          }`}>
            <span>{formatTime(message.createdAt)}</span>
            {isOwn && (
              <div className="flex items-center">
                {getMessageStatus()}
              </div>
            )}
            {showTimestamp && (
              <span className="text-xs text-muted-foreground">
                {new Date(message.createdAt).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
