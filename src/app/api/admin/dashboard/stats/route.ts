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

    // Get user statistics
    const [
      totalUsers,
      pendingUsers,
      confirmedUsers,
      rejectedUsers,
      totalEnrollments,
      mentorshipEnrollments,
      advisoryEnrollments,
      activeEnrollments,
      unreadMessagesCount
    ] = await Promise.all([
      prisma.user.count({
        where: { role: 'CLIENT' }
      }),
      prisma.user.count({
        where: { 
          role: 'CLIENT',
          isConfirmed: false,
          rejectionReason: null
        }
      }),
      prisma.user.count({
        where: { 
          role: 'CLIENT',
          isConfirmed: true
        }
      }),
      prisma.user.count({
        where: { 
          role: 'CLIENT',
          isConfirmed: false,
          rejectionReason: { not: null }
        }
      }),
      prisma.enrollment.count(),
      prisma.enrollment.count({
        where: {
          service: {
            type: 'MENTORSHIP'
          }
        }
      }),
      prisma.enrollment.count({
        where: {
          service: {
            type: 'ADVISORY'
          }
        }
      }),
      prisma.enrollment.count({
        where: {
          status: 'ACTIVE'
        }
      }),
      // Count unread messages for admin
      prisma.conversationParticipant.aggregate({
        where: {
          userId: session.user.id,
          unreadCount: {
            gt: 0
          }
        },
        _sum: {
          unreadCount: true
        }
      })
    ])

    const stats = {
      totalUsers,
      pendingUsers,
      confirmedUsers,
      rejectedUsers,
      totalEnrollments,
      mentorshipEnrollments,
      advisoryEnrollments,
      activeEnrollments,
      unreadMessagesCount: unreadMessagesCount._sum.unreadCount || 0,
      systemHealth: 99.9 // Mock system health
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Get admin dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}

