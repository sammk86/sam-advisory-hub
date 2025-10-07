import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/messaging'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow clients to create user-admin conversations
    if (session.user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Only clients can create user-admin conversations' }, { status: 403 })
    }

    const body = await request.json()
    const { title, initialMessage } = body

    // Find admin user
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true }
    })

    if (!admin) {
      return NextResponse.json({ error: 'No admin user found' }, { status: 404 })
    }

    // Check if conversation already exists between user and admin
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        participants: {
          every: {
            userId: {
              in: [session.user.id, admin.id]
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
      return NextResponse.json({
        success: true,
        data: existingConversation
      })
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        title: title || 'Support Conversation',
        isArchived: false,
        participants: {
          create: [
            {
              userId: session.user.id,
              unreadCount: 0
            },
            {
              userId: admin.id,
              unreadCount: 0
            }
          ]
        }
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

    // Add initial message if provided
    if (initialMessage && initialMessage.trim()) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: session.user.id,
          content: initialMessage.trim(),
          messageType: 'TEXT'
        }
      })

      // Update conversation last message timestamp
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: new Date() }
      })
    }

    return NextResponse.json({
      success: true,
      data: conversation
    })
  } catch (error) {
    console.error('Create user-admin conversation error:', error)
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}
