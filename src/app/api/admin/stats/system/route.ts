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

    // Get system statistics
    const [
      totalUsers,
      totalEmails,
      failedEmails,
      recentErrors,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.emailNotification.count(),
      prisma.emailNotification.count({
        where: { status: 'FAILED' },
      }),
      prisma.emailNotification.count({
        where: {
          status: 'FAILED',
          sentAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
    ])

    // Calculate system health metrics
    const systemHealth = totalEmails > 0 ? Math.max(0, 100 - (failedEmails / totalEmails) * 100) : 100
    const averageResponseTime = 120 // This would come from actual monitoring
    const uptime = 99.8 // This would come from actual monitoring
    const errorRate = totalEmails > 0 ? (failedEmails / totalEmails) * 100 : 0

    // Get database performance metrics
    const dbStartTime = Date.now()
    await prisma.user.findFirst()
    const dbResponseTime = Date.now() - dbStartTime

    // Get email queue status
    const pendingEmails = await prisma.emailNotification.count({
      where: { status: 'SENT' },
    })

    // Get recent activity
    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    })

    const recentEmails = await prisma.emailNotification.count({
      where: {
        sentAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    })

    return NextResponse.json({
      systemHealth: Math.round(systemHealth * 10) / 10,
      averageResponseTime,
      uptime,
      errorRate: Math.round(errorRate * 10) / 10,
      dbResponseTime,
      pendingEmails,
      recentUsers,
      recentEmails,
      totalUsers,
      totalEmails,
      failedEmails,
      recentErrors,
    })
  } catch (error) {
    console.error('Error fetching system stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

