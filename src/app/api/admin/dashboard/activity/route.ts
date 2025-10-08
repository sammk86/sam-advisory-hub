import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get recent activities including unread messages
    const activities = []

    // Get recent user registrations
    const recentUsers = await prisma.user.findMany({
      where: {
        role: 'CLIENT',
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        isConfirmed: true,
        confirmedAt: true,
        rejectionReason: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    // Add user activities
    recentUsers.forEach(user => {
      if (user.isConfirmed === false && !user.rejectionReason) {
        activities.push({
          id: `user_pending_${user.id}`,
          type: 'user_registration',
          description: 'New user registration pending approval',
          timestamp: user.createdAt.toISOString(),
          user: user.name || user.email,
          userId: user.id,
          priority: 'high'
        })
      } else if (user.isConfirmed === true && user.confirmedAt) {
        activities.push({
          id: `user_confirmed_${user.id}`,
          type: 'user_confirmation',
          description: 'User account confirmed and activated',
          timestamp: user.confirmedAt.toISOString(),
          user: user.name || user.email,
          userId: user.id,
          priority: 'medium'
        })
      } else if (user.isConfirmed === false && user.rejectionReason) {
        activities.push({
          id: `user_rejected_${user.id}`,
          type: 'user_rejection',
          description: 'User account rejected',
          timestamp: user.createdAt.toISOString(),
          user: user.name || user.email,
          userId: user.id,
          priority: 'medium'
        })
      }
    })

    // Get unread messages from users to admin
    const unreadMessages = await prisma.message.findMany({
      where: {
        sender: {
          role: 'CLIENT'
        },
        conversation: {
          participants: {
            some: {
              userId: session.user.id,
              unreadCount: {
                gt: 0
              }
            }
          }
        }
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        conversation: {
          select: {
            id: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Add unread message activities
    unreadMessages.forEach(message => {
      activities.push({
        id: `unread_message_${message.id}`,
        type: 'unread_message',
        description: `Unread message from ${message.sender.name || message.sender.email}`,
        timestamp: message.createdAt.toISOString(),
        user: message.sender.name || message.sender.email,
        userId: message.sender.id,
        conversationId: message.conversation.id,
        messagePreview: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : ''),
        priority: 'high'
      })
    })

    // Get recent service assignments
    const recentAssignments = await prisma.enrollment.findMany({
      where: {
        enrolledAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      },
      orderBy: { enrolledAt: 'desc' },
      take: 5
    })

    // Add service assignment activities
    recentAssignments.forEach(assignment => {
      activities.push({
        id: `service_assignment_${assignment.id}`,
        type: 'service_assignment',
        description: `Service "${assignment.service.name}" assigned to ${assignment.user.name || assignment.user.email}`,
        timestamp: assignment.enrolledAt.toISOString(),
        user: assignment.user.name || assignment.user.email,
        userId: assignment.user.id,
        serviceId: assignment.service.id,
        priority: 'medium'
      })
    })

    // Sort activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Return top 10 most recent activities
    return NextResponse.json({
      success: true,
      activities: activities.slice(0, 10)
    })
  } catch (error) {
    console.error('Get admin dashboard activity error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard activity' },
      { status: 500 }
    )
  }
}

