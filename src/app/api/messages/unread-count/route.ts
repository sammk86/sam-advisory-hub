import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUnreadMessageCount } from '@/lib/messaging'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const unreadCount = await getUnreadMessageCount(session.user.id)

    return NextResponse.json({
      success: true,
      data: {
        unreadCount
      }
    })
  } catch (error) {
    console.error('Get unread count error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch unread count' },
      { status: 500 }
    )
  }
}
