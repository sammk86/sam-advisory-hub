import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { EmailStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get email statistics
    const [
      totalEmails,
      sentEmails,
      deliveredEmails,
      failedEmails,
      openedEmails,
      clickedEmails,
    ] = await Promise.all([
      prisma.emailNotification.count(),
      prisma.emailNotification.count({
        where: { status: EmailStatus.SENT },
      }),
      prisma.emailNotification.count({
        where: { status: EmailStatus.DELIVERED },
      }),
      prisma.emailNotification.count({
        where: { status: EmailStatus.FAILED },
      }),
      prisma.emailNotification.count({
        where: { status: EmailStatus.OPENED },
      }),
      prisma.emailNotification.count({
        where: { status: EmailStatus.CLICKED },
      }),
    ])

    // Get email statistics by type
    const emailTypeStats = await prisma.emailNotification.groupBy({
      by: ['type'],
      _count: {
        type: true,
      },
    })

    // Get email statistics by status
    const emailStatusStats = await prisma.emailNotification.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    })

    // Get recent email activity (last 7 days)
    const recentEmails = await prisma.emailNotification.count({
      where: {
        sentAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    })

    // Calculate rates
    const deliveryRate = totalEmails > 0 ? (deliveredEmails / totalEmails) * 100 : 0
    const openRate = deliveredEmails > 0 ? (openedEmails / deliveredEmails) * 100 : 0
    const clickRate = openedEmails > 0 ? (clickedEmails / openedEmails) * 100 : 0
    const failureRate = totalEmails > 0 ? (failedEmails / totalEmails) * 100 : 0

    return NextResponse.json({
      totalEmails,
      sentEmails,
      deliveredEmails,
      failedEmails,
      openedEmails,
      clickedEmails,
      recentEmails,
      deliveryRate: Math.round(deliveryRate * 100) / 100,
      openRate: Math.round(openRate * 100) / 100,
      clickRate: Math.round(clickRate * 100) / 100,
      failureRate: Math.round(failureRate * 100) / 100,
      emailTypeStats: emailTypeStats.reduce((acc, item) => {
        acc[item.type] = item._count.type
        return acc
      }, {} as Record<string, number>),
      emailStatusStats: emailStatusStats.reduce((acc, item) => {
        acc[item.status] = item._count.status
        return acc
      }, {} as Record<string, number>),
    })
  } catch (error) {
    console.error('Error fetching email stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
