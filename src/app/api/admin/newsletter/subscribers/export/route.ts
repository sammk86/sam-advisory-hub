import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access',
      }, { status: 401 })
    }

    // Get all subscribers
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { subscribedAt: 'desc' },
    })

    // Create CSV content
    const csvHeaders = [
      'Email',
      'First Name',
      'Last Name',
      'Status',
      'Source',
      'Interests',
      'Subscribed At',
      'Unsubscribed At',
      'Total Emails Received',
      'Total Emails Opened',
      'Total Emails Clicked',
      'Last Engagement',
    ]

    const csvRows = subscribers.map(subscriber => [
      subscriber.email,
      subscriber.firstName || '',
      subscriber.lastName || '',
      subscriber.status,
      subscriber.source,
      subscriber.interests.join('; '),
      subscriber.subscribedAt.toISOString(),
      subscriber.unsubscribedAt?.toISOString() || '',
      subscriber.totalEmailsReceived.toString(),
      subscriber.totalEmailsOpened.toString(),
      subscriber.totalEmailsClicked.toString(),
      subscriber.lastEngagement?.toISOString() || '',
    ])

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n')

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })

  } catch (error) {
    console.error('Subscribers export error:', error)

    return NextResponse.json({
      success: false,
      message: 'Failed to export subscribers',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
