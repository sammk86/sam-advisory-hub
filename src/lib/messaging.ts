import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export interface CreateConversationData {
  userId: string
  adminId?: string
  title?: string
  initialMessage?: string
}

export interface MessageData {
  conversationId: string
  senderId: string
  content: string
}

/**
 * Get or create a conversation between a user and admin
 * If adminId is not provided, it will find the first admin user
 */
export async function getOrCreateUserAdminConversation({
  userId,
  adminId,
  title,
  initialMessage
}: CreateConversationData) {
  try {
    // Find admin user if not provided
    let targetAdminId = adminId
    if (!targetAdminId) {
      const admin = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
        select: { id: true }
      })
      
      if (!admin) {
        throw new Error('No admin user found')
      }
      targetAdminId = admin.id
    }

    // Check if conversation already exists between user and admin
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        participants: {
          every: {
            userId: {
              in: [userId, targetAdminId]
            }
          }
        },
        isArchived: false
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true
              }
            }
          }
        }
      }
    })

    if (existingConversation) {
      return existingConversation
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        title: title || 'Support Conversation',
        participants: {
          create: [
            {
              userId: userId,
              role: 'MEMBER'
            },
            {
              userId: targetAdminId,
              role: 'ADMIN'
            }
          ]
        },
        messages: initialMessage ? {
          create: {
            senderId: userId,
            content: initialMessage,
            messageType: 'TEXT'
          }
        } : undefined
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true
              }
            }
          }
        }
      }
    })

    return conversation
  } catch (error) {
    console.error('Error creating user-admin conversation:', error)
    throw error
  }
}

/**
 * Send a message to a conversation
 */
export async function sendMessage(messageData: MessageData) {
  try {
    const message = await prisma.message.create({
      data: {
        conversationId: messageData.conversationId,
        senderId: messageData.senderId,
        content: messageData.content,
        messageType: 'TEXT'
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true
          }
        }
      }
    })

    // Update conversation's last message timestamp
    await prisma.conversation.update({
      where: { id: messageData.conversationId },
      data: { lastMessageAt: new Date() }
    })

    // Update unread counts for all other participants
    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId: messageData.conversationId,
        userId: { not: messageData.senderId }
      },
      data: {
        unreadCount: {
          increment: 1
        }
      }
    })

    return message
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}

/**
 * Get unread message count for a user
 */
export async function getUnreadMessageCount(userId: string) {
  try {
    const unreadCount = await prisma.conversationParticipant.aggregate({
      where: {
        userId,
        conversation: {
          isArchived: false
        }
      },
      _sum: {
        unreadCount: true
      }
    })

    return unreadCount._sum.unreadCount || 0
  } catch (error) {
    console.error('Error getting unread message count:', error)
    throw error
  }
}

/**
 * Mark all messages in a conversation as read for a user
 */
export async function markConversationAsRead(conversationId: string, userId: string) {
  try {
    // Mark all messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    // Update participant's unread count
    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId
        }
      },
      data: {
        unreadCount: 0,
        lastReadAt: new Date()
      }
    })

    return true
  } catch (error) {
    console.error('Error marking conversation as read:', error)
    throw error
  }
}

/**
 * Get all conversations for a user with unread counts
 */
export async function getUserConversations(userId: string, includeArchived = false) {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId
          }
        },
        ...(includeArchived ? {} : { isArchived: false })
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true
              }
            }
          }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true
              }
            }
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    })

    return conversations
  } catch (error) {
    console.error('Error getting user conversations:', error)
    throw error
  }
}
