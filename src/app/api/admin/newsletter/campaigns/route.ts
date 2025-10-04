import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendBulkNewsletterEmails } from '@/lib/email'

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

    const body = await request.json()
    const { title, subject, content, textContent, status, scheduledAt } = body

    // Validate required fields
    if (!title || !subject || !content) {
      return NextResponse.json({
        success: false,
        message: 'Title, subject, and content are required',
      }, { status: 400 })
    }

    // Create campaign
    const campaign = await prisma.newsletterCampaign.create({
      data: {
        title,
        subject,
        content,
        textContent: textContent || content.replace(/<[^>]*>/g, ''), // Generate text version if not provided
        status: status || 'DRAFT',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
    })

    // If status is SENDING, send emails immediately
    if (status === 'SENDING') {
      try {
        // Get active subscribers
        const subscribers = await prisma.newsletterSubscriber.findMany({
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            email: true,
            firstName: true,
          },
        })

        if (subscribers.length > 0) {
          // Send bulk emails
          const result = await sendBulkNewsletterEmails(
            campaign.id,
            subscribers,
            subject,
            content,
            textContent || content.replace(/<[^>]*>/g, '')
          )

          // Update campaign with results
          await prisma.newsletterCampaign.update({
            where: { id: campaign.id },
            data: {
              status: 'SENT',
              sentAt: new Date(),
              totalSent: result.sent,
            },
          })

          return NextResponse.json({
            success: true,
            message: `Campaign created and sent to ${result.sent} subscribers`,
            data: { campaign, sent: result.sent, failed: result.failed },
          })
        } else {
          return NextResponse.json({
            success: false,
            message: 'No active subscribers found to send the campaign to',
          }, { status: 400 })
        }
      } catch (emailError) {
        console.error('Error sending campaign emails:', emailError)
        
        // Update campaign status to failed
        await prisma.newsletterCampaign.update({
          where: { id: campaign.id },
          data: { status: 'FAILED' },
        })

        return NextResponse.json({
          success: false,
          message: 'Campaign created but failed to send emails',
          error: emailError instanceof Error ? emailError.message : 'Unknown error',
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign created successfully',
      data: { campaign },
    })

  } catch (error) {
    console.error('Campaign creation error:', error)

    return NextResponse.json({
      success: false,
      message: 'Failed to create campaign',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || ''

    // Build where clause
    const where: any = {}
    
    if (status) {
      where.status = status
    }

    // Get campaigns with pagination
    const [campaigns, total] = await Promise.all([
      prisma.newsletterCampaign.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.newsletterCampaign.count({ where }),
    ])

    const pages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: {
        campaigns,
        pagination: {
          page,
          limit,
          total,
          pages,
        },
      },
    })

  } catch (error) {
    console.error('Campaigns fetch error:', error)

    return NextResponse.json({
      success: false,
      message: 'Failed to fetch campaigns',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
