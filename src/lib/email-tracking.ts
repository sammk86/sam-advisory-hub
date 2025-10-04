import { prisma } from '@/lib/prisma'
import { EmailStatus, EmailType } from '@prisma/client'

export interface EmailTrackingData {
  messageId: string
  userId: string
  type: EmailType
  status: EmailStatus
  timestamp: Date
  metadata?: Record<string, any>
}

export interface EmailAnalytics {
  totalEmails: number
  sentEmails: number
  deliveredEmails: number
  failedEmails: number
  openedEmails: number
  clickedEmails: number
  deliveryRate: number
  openRate: number
  clickRate: number
  failureRate: number
}

export interface EmailStats {
  byType: Record<EmailType, number>
  byStatus: Record<EmailStatus, number>
  byDate: Array<{ date: string; count: number }>
  byUser: Array<{ userId: string; count: number }>
}

export async function trackEmailEvent(data: EmailTrackingData): Promise<void> {
  try {
    await prisma.emailNotification.create({
      data: {
        userId: data.userId,
        type: data.type,
        subject: `Email ${data.status.toLowerCase()}`,
        body: `Email ${data.type} ${data.status.toLowerCase()} at ${data.timestamp.toISOString()}`,
        status: data.status,
        sentAt: data.timestamp,
        errorMessage: data.status === EmailStatus.FAILED ? 'Email delivery failed' : null,
      },
    })
  } catch (error) {
    console.error('Error tracking email event:', error)
  }
}

export async function updateEmailStatus(
  messageId: string,
  status: EmailStatus,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await prisma.emailNotification.updateMany({
      where: {
        // Assuming we store messageId in the database
        // This would need to be added to the schema if not already present
        id: messageId,
      },
      data: {
        status,
        sentAt: status === EmailStatus.DELIVERED ? new Date() : undefined,
        errorMessage: status === EmailStatus.FAILED ? metadata?.error : null,
      },
    })
  } catch (error) {
    console.error('Error updating email status:', error)
  }
}

export async function getEmailAnalytics(
  startDate?: Date,
  endDate?: Date
): Promise<EmailAnalytics> {
  try {
    const whereClause = {
      ...(startDate && endDate && {
        sentAt: {
          gte: startDate,
          lte: endDate,
        },
      }),
    }

    const [
      totalEmails,
      sentEmails,
      deliveredEmails,
      failedEmails,
      openedEmails,
      clickedEmails,
    ] = await Promise.all([
      prisma.emailNotification.count({ where: whereClause }),
      prisma.emailNotification.count({
        where: { ...whereClause, status: EmailStatus.SENT },
      }),
      prisma.emailNotification.count({
        where: { ...whereClause, status: EmailStatus.DELIVERED },
      }),
      prisma.emailNotification.count({
        where: { ...whereClause, status: EmailStatus.FAILED },
      }),
      prisma.emailNotification.count({
        where: { ...whereClause, status: EmailStatus.OPENED },
      }),
      prisma.emailNotification.count({
        where: { ...whereClause, status: EmailStatus.CLICKED },
      }),
    ])

    const deliveryRate = totalEmails > 0 ? (deliveredEmails / totalEmails) * 100 : 0
    const openRate = deliveredEmails > 0 ? (openedEmails / deliveredEmails) * 100 : 0
    const clickRate = openedEmails > 0 ? (clickedEmails / openedEmails) * 100 : 0
    const failureRate = totalEmails > 0 ? (failedEmails / totalEmails) * 100 : 0

    return {
      totalEmails,
      sentEmails,
      deliveredEmails,
      failedEmails,
      openedEmails,
      clickedEmails,
      deliveryRate: Math.round(deliveryRate * 100) / 100,
      openRate: Math.round(openRate * 100) / 100,
      clickRate: Math.round(clickRate * 100) / 100,
      failureRate: Math.round(failureRate * 100) / 100,
    }
  } catch (error) {
    console.error('Error getting email analytics:', error)
    return {
      totalEmails: 0,
      sentEmails: 0,
      deliveredEmails: 0,
      failedEmails: 0,
      openedEmails: 0,
      clickedEmails: 0,
      deliveryRate: 0,
      openRate: 0,
      clickRate: 0,
      failureRate: 0,
    }
  }
}

export async function getEmailStats(
  startDate?: Date,
  endDate?: Date
): Promise<EmailStats> {
  try {
    const whereClause = {
      ...(startDate && endDate && {
        sentAt: {
          gte: startDate,
          lte: endDate,
        },
      }),
    }

    // Get stats by type
    const byType = await prisma.emailNotification.groupBy({
      by: ['type'],
      where: whereClause,
      _count: {
        type: true,
      },
    })

    // Get stats by status
    const byStatus = await prisma.emailNotification.groupBy({
      by: ['status'],
      where: whereClause,
      _count: {
        status: true,
      },
    })

    // Get stats by date (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const byDate = await prisma.emailNotification.groupBy({
      by: ['sentAt'],
      where: {
        ...whereClause,
        sentAt: {
          gte: thirtyDaysAgo,
        },
      },
      _count: {
        sentAt: true,
      },
      orderBy: {
        sentAt: 'asc',
      },
    })

    // Get stats by user (top 10)
    const byUser = await prisma.emailNotification.groupBy({
      by: ['userId'],
      where: whereClause,
      _count: {
        userId: true,
      },
      orderBy: {
        _count: {
          userId: 'desc',
        },
      },
      take: 10,
    })

    return {
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count.type
        return acc
      }, {} as Record<EmailType, number>),
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status
        return acc
      }, {} as Record<EmailStatus, number>),
      byDate: byDate.map(item => ({
        date: item.sentAt.toISOString().split('T')[0],
        count: item._count.sentAt,
      })),
      byUser: byUser.map(item => ({
        userId: item.userId,
        count: item._count.userId,
      })),
    }
  } catch (error) {
    console.error('Error getting email stats:', error)
    return {
      byType: {} as Record<EmailType, number>,
      byStatus: {} as Record<EmailStatus, number>,
      byDate: [],
      byUser: [],
    }
  }
}

export async function getFailedEmails(): Promise<Array<{
  id: string
  userId: string
  type: EmailType
  subject: string
  sentAt: Date
  errorMessage: string | null
  user: {
    email: string
    name: string | null
  }
}>> {
  try {
    const failedEmails = await prisma.emailNotification.findMany({
      where: {
        status: EmailStatus.FAILED,
        sentAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        sentAt: 'desc',
      },
    })

    return failedEmails
  } catch (error) {
    console.error('Error getting failed emails:', error)
    return []
  }
}

export async function retryFailedEmail(emailId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const email = await prisma.emailNotification.findUnique({
      where: { id: emailId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    })

    if (!email) {
      return { success: false, error: 'Email not found' }
    }

    if (email.status !== EmailStatus.FAILED) {
      return { success: false, error: 'Email is not in failed status' }
    }

    // Reset status to SENT for retry
    await prisma.emailNotification.update({
      where: { id: emailId },
      data: {
        status: EmailStatus.SENT,
        sentAt: new Date(),
        errorMessage: null,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error retrying failed email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function getEmailDeliveryReport(
  startDate: Date,
  endDate: Date
): Promise<{
  summary: EmailAnalytics
  dailyBreakdown: Array<{
    date: string
    sent: number
    delivered: number
    failed: number
    opened: number
    clicked: number
  }>
  typeBreakdown: Array<{
    type: EmailType
    sent: number
    delivered: number
    failed: number
    openRate: number
    clickRate: number
  }>
}> {
  try {
    const summary = await getEmailAnalytics(startDate, endDate)

    // Daily breakdown
    const dailyStats = await prisma.emailNotification.groupBy({
      by: ['sentAt', 'status'],
      where: {
        sentAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        status: true,
      },
      orderBy: {
        sentAt: 'asc',
      },
    })

    const dailyBreakdown = dailyStats.reduce((acc, stat) => {
      const date = stat.sentAt.toISOString().split('T')[0]
      const existing = acc.find(item => item.date === date)
      
      if (existing) {
        existing[stat.status.toLowerCase() as keyof typeof existing] = stat._count.status
      } else {
        acc.push({
          date,
          sent: 0,
          delivered: 0,
          failed: 0,
          opened: 0,
          clicked: 0,
          [stat.status.toLowerCase() as keyof typeof existing]: stat._count.status,
        })
      }
      
      return acc
    }, [] as Array<{
      date: string
      sent: number
      delivered: number
      failed: number
      opened: number
      clicked: number
    }>)

    // Type breakdown
    const typeStats = await prisma.emailNotification.groupBy({
      by: ['type', 'status'],
      where: {
        sentAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        status: true,
      },
    })

    const typeBreakdown = typeStats.reduce((acc, stat) => {
      const existing = acc.find(item => item.type === stat.type)
      
      if (existing) {
        existing[stat.status.toLowerCase() as keyof typeof existing] = stat._count.status
      } else {
        acc.push({
          type: stat.type,
          sent: 0,
          delivered: 0,
          failed: 0,
          openRate: 0,
          clickRate: 0,
          [stat.status.toLowerCase() as keyof typeof existing]: stat._count.status,
        })
      }
      
      return acc
    }, [] as Array<{
      type: EmailType
      sent: number
      delivered: number
      failed: number
      openRate: number
      clickRate: number
    }>)

    // Calculate rates for type breakdown
    typeBreakdown.forEach(type => {
      type.openRate = type.delivered > 0 ? (type.opened / type.delivered) * 100 : 0
      type.clickRate = type.opened > 0 ? (type.clicked / type.opened) * 100 : 0
    })

    return {
      summary,
      dailyBreakdown,
      typeBreakdown,
    }
  } catch (error) {
    console.error('Error getting email delivery report:', error)
    return {
      summary: {
        totalEmails: 0,
        sentEmails: 0,
        deliveredEmails: 0,
        failedEmails: 0,
        openedEmails: 0,
        clickedEmails: 0,
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0,
        failureRate: 0,
      },
      dailyBreakdown: [],
      typeBreakdown: [],
    }
  }
}

export async function cleanupOldEmailData(olderThanDays: number = 90): Promise<{ deleted: number }> {
  try {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000)

    const result = await prisma.emailNotification.deleteMany({
      where: {
        sentAt: {
          lt: cutoffDate,
        },
        status: {
          in: [EmailStatus.DELIVERED, EmailStatus.FAILED],
        },
      },
    })

    return { deleted: result.count }
  } catch (error) {
    console.error('Error cleaning up old email data:', error)
    return { deleted: 0 }
  }
}