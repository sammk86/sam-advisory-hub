import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get newsletter by ID
    const newsletter = await prisma.newsletterCampaign.findUnique({
      where: { 
        id,
        status: 'SENT' // Only allow access to published newsletters
      },
      select: {
        id: true,
        title: true,
        subject: true,
        content: true,
        textContent: true,
        sentAt: true,
        totalSent: true,
        createdAt: true,
      },
    })

    if (!newsletter) {
      return NextResponse.json({
        success: false,
        message: 'Newsletter not found',
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: newsletter,
    })

  } catch (error) {
    console.error('Newsletter fetch error:', error)

    return NextResponse.json({
      success: false,
      message: 'Failed to fetch newsletter',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
