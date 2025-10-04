import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access',
      }, { status: 401 })
    }

    const { subscriberIds } = await request.json()

    if (!subscriberIds || !Array.isArray(subscriberIds) || subscriberIds.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Invalid subscriber IDs',
      }, { status: 400 })
    }

    // Update subscribers to unsubscribed status
    const result = await prisma.newsletterSubscriber.updateMany({
      where: {
        id: { in: subscriberIds },
      },
      data: {
        status: 'UNSUBSCRIBED',
        unsubscribedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: `Successfully unsubscribed ${result.count} subscriber${result.count !== 1 ? 's' : ''}`,
      data: {
        updatedCount: result.count,
      },
    })

  } catch (error) {
    console.error('Bulk unsubscribe error:', error)

    return NextResponse.json({
      success: false,
      message: 'Failed to unsubscribe subscribers',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
