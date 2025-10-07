'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Bell } from 'lucide-react'
import { getUnreadMessageCount } from '@/lib/messaging'

interface MessageNotificationsProps {
  userId: string
  className?: string
}

export default function MessageNotifications({ userId, className = '' }: MessageNotificationsProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/messages/unread-count')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setUnreadCount(data.data.unreadCount)
          }
        }
      } catch (error) {
        console.error('Error fetching unread count:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUnreadCount()

    // Poll for unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [userId])

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <Bell className="w-5 h-5 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <MessageCircle className="w-5 h-5 text-muted-foreground" />
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      )}
    </div>
  )
}
