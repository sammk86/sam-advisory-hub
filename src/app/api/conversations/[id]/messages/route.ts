import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/messaging'
import { sendMessageNotificationEmail } from '@/lib/email-messaging'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Check if user is participant in this conversation
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: id,
          userId: session.user.id
        }
      }
    })

    if (!participant) {
      return NextResponse.json(
        { error: 'Conversation not found or access denied' },
        { status: 404 }
      )
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: { conversationId: id },
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
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    // Get total count for pagination
    const totalCount = await prisma.message.count({
      where: { conversationId: id }
    })

    return NextResponse.json({
      success: true,
      data: {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      }
    })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { content } = body

    // Validate required fields
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }

    // Check if user is participant in this conversation
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: id,
          userId: session.user.id
        }
      }
    })

    if (!participant) {
      return NextResponse.json(
        { error: 'Conversation not found or access denied' },
        { status: 404 }
      )
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: session.user.id,
        content: content.trim(),
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
      where: { id },
      data: { lastMessageAt: new Date() }
    })

    // Update unread counts for all other participants
    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId: id,
        userId: { not: session.user.id }
      },
      data: {
        unreadCount: {
          increment: 1
        }
      }
    })

    // Send email notification if admin is messaging a client
    if (session.user.role === 'ADMIN') {
      try {
        // Get conversation participants to find the recipient
        const conversation = await prisma.conversation.findUnique({
          where: { id },
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true
                  }
                }
              }
            }
          }
        })

        if (conversation) {
          // Find the client participant (recipient)
          const clientParticipant = conversation.participants.find(
            p => p.user.role === 'CLIENT' && p.user.id !== session.user.id
          )

          if (clientParticipant) {
            // Send email notification
            await sendMessageNotificationEmail({
              recipientName: clientParticipant.user.name || 'User',
              recipientEmail: clientParticipant.user.email,
              senderName: session.user.name || 'Admin',
              messageContent: content.trim(),
              conversationUrl: `${process.env.NEXTAUTH_URL}/dashboard/messages/${id}`
            })
          }
        }
      } catch (emailError) {
        // Log email error but don't fail the message creation
        console.error('Failed to send email notification:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      data: message
    })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
