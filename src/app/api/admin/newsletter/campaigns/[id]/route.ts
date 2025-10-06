import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access',
      }, { status: 401 })
    }

    const { id: campaignId } = await params

    // Check if campaign exists
    const campaign = await prisma.newsletterCampaign.findUnique({
      where: { id: campaignId },
    })

    if (!campaign) {
      return NextResponse.json({
        success: false,
        message: 'Campaign not found',
      }, { status: 404 })
    }

    // Allow deletion of campaigns at any stage
    // No restrictions on campaign deletion

    // Delete the campaign (this will cascade delete related email tracking records)
    await prisma.newsletterCampaign.delete({
      where: { id: campaignId },
    })

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully',
    })

  } catch (error) {
    console.error('Campaign deletion error:', error)

    return NextResponse.json({
      success: false,
      message: 'Failed to delete campaign',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access',
      }, { status: 401 })
    }

    const { id: campaignId } = await params

    // Get campaign details
    const campaign = await prisma.newsletterCampaign.findUnique({
      where: { id: campaignId },
    })

    if (!campaign) {
      return NextResponse.json({
        success: false,
        message: 'Campaign not found',
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: { campaign },
    })

  } catch (error) {
    console.error('Campaign fetch error:', error)

    return NextResponse.json({
      success: false,
      message: 'Failed to fetch campaign',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access',
      }, { status: 401 })
    }

    const { id: campaignId } = await params
    const body = await request.json()
    const { title, subject, content, textContent, status, scheduledAt } = body

    // Check if campaign exists
    const existingCampaign = await prisma.newsletterCampaign.findUnique({
      where: { id: campaignId },
    })

    if (!existingCampaign) {
      return NextResponse.json({
        success: false,
        message: 'Campaign not found',
      }, { status: 404 })
    }

    // Prevent editing of sent campaigns
    if (existingCampaign.status === 'SENT') {
      return NextResponse.json({
        success: false,
        message: 'Cannot edit sent campaigns',
      }, { status: 400 })
    }

    // Update campaign
    const campaign = await prisma.newsletterCampaign.update({
      where: { id: campaignId },
      data: {
        title,
        subject,
        content,
        textContent: textContent || content.replace(/<[^>]*>/g, ''),
        status: status || existingCampaign.status,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Campaign updated successfully',
      data: { campaign },
    })

  } catch (error) {
    console.error('Campaign update error:', error)

    return NextResponse.json({
      success: false,
      message: 'Failed to update campaign',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
