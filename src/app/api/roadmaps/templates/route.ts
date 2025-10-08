import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { roadmapTemplates, getTemplatesByServiceType } from '@/lib/roadmap-templates'

// GET /api/roadmaps/templates - Get available roadmap templates
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const serviceType = searchParams.get('serviceType')

    let templates = roadmapTemplates

    if (serviceType && (serviceType === 'MENTORSHIP' || serviceType === 'ADVISORY')) {
      templates = getTemplatesByServiceType(serviceType)
    }

    return NextResponse.json({
      success: true,
      data: templates
    })
  } catch (error) {
    console.error('Get roadmap templates error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch roadmap templates' },
      { status: 500 }
    )
  }
}

