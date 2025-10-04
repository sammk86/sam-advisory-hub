import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getNewsletterAnalytics } from '@/lib/email'

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

    // Get newsletter analytics
    const analytics = await getNewsletterAnalytics()

    return NextResponse.json({
      success: true,
      data: analytics,
    })

  } catch (error) {
    console.error('Newsletter analytics error:', error)

    return NextResponse.json({
      success: false,
      message: 'Failed to fetch newsletter analytics',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
