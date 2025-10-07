import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getOrCreateUserAdminConversation } from '@/lib/messaging'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { message } = body

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }

    // Create or get conversation with admin
    const conversation = await getOrCreateUserAdminConversation({
      userId: session.user.id,
      title: 'Support Request',
      initialMessage: message.trim()
    })

    return NextResponse.json({
      success: true,
      data: {
        conversationId: conversation.id,
        message: 'Support request submitted successfully'
      }
    })
  } catch (error) {
    console.error('Create support conversation error:', error)
    return NextResponse.json(
      { error: 'Failed to create support conversation' },
      { status: 500 }
    )
  }
}
