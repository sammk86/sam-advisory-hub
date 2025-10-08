import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isPublic = searchParams.get('public') === 'true'
    const approved = searchParams.get('approved') === 'true'

    // Build where clause
    const where: any = {}
    
    if (isPublic) {
      where.isPublic = true
    }
    
    if (approved) {
      where.isApproved = true
    }

    const feedbacks = await prisma.feedback.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: isPublic ? 10 : 50 // Limit public feedbacks for landing page
    })

    return NextResponse.json({
      success: true,
      data: { feedbacks }
    })
  } catch (error) {
    console.error('Get feedbacks error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedbacks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { rating, title, content, serviceType, isPublic = true } = body

    // Validate required fields
    if (!rating || !title || !content) {
      return NextResponse.json(
        { error: 'Rating, title, and content are required' },
        { status: 400 }
      )
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Validate service type
    if (serviceType && !['MENTORSHIP', 'ADVISORY'].includes(serviceType)) {
      return NextResponse.json(
        { error: 'Service type must be MENTORSHIP or ADVISORY' },
        { status: 400 }
      )
    }

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        userId: session.user.id,
        rating: parseInt(rating.toString()),
        title: title.trim(),
        content: content.trim(),
        serviceType: serviceType || null,
        isPublic: Boolean(isPublic)
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: feedback
    })
  } catch (error) {
    console.error('Create feedback error:', error)
    return NextResponse.json(
      { error: 'Failed to create feedback' },
      { status: 500 }
    )
  }
}
