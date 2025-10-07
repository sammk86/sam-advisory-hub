import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/messaging'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Get conversations for the current user
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id
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
      orderBy: { lastMessageAt: 'desc' },
      skip,
      take: limit
    })

    // Get total count for pagination
    const totalCount = await prisma.conversation.count({
      where: {
        participants: {
          some: {
            userId: session.user.id
          }
        },
        isArchived: false
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        conversations,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      }
    })
  } catch (error) {
    console.error('Get conversations error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, participantIds, initialMessage } = body

    // Validate required fields
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json(
        { error: 'Participant IDs are required' },
        { status: 400 }
      )
    }

    // Add current user to participants if not already included
    const allParticipantIds = [...new Set([session.user.id, ...participantIds])]

    // Create conversation
    const conversation = await prisma.conversation.create({
      data: {
        title: title || null,
        participants: {
          create: allParticipantIds.map((userId, index) => ({
            userId,
            role: index === 0 ? 'ADMIN' : 'MEMBER' // First participant is admin
          }))
        },
        messages: initialMessage ? {
          create: {
            senderId: session.user.id,
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
        },
        messages: {
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
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: conversation
    })
  } catch (error) {
    console.error('Create conversation error:', error)
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}
