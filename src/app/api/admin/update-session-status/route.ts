import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { updateUserSessionStatus, deactivateExpiredSessions } from '@/lib/session-management'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, action } = body

    if (action === 'update_all_expired') {
      // Update all users with expired enrollments
      const result = await deactivateExpiredSessions()
      return NextResponse.json(result)
    } else if (userId && action === 'update_user') {
      // Update specific user's session status
      const result = await updateUserSessionStatus(userId)
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        { error: 'Invalid action or missing userId' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Update session status error:', error)
    return NextResponse.json(
      { error: 'Failed to update session status' },
      { status: 500 }
    )
  }
}
