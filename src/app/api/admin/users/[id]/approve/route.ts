import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { getEmailTemplate } from '@/lib/email-templates'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: userId } = await params
    const body = await request.json()
    const { customMessage } = body

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        isConfirmed: true,
        rejectionReason: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.isConfirmed === true) {
      return NextResponse.json({ error: 'User already confirmed' }, { status: 400 })
    }

    if (user.rejectionReason) {
      return NextResponse.json({ error: 'User has been rejected' }, { status: 400 })
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isConfirmed: true,
        confirmedAt: new Date(),
        confirmedBy: session.user.id,
        rejectionReason: null,
      },
    })

    // Send confirmation email
    try {
      const template = getEmailTemplate('ACCOUNT_CONFIRMED', {
        userName: user.name || 'there',
        userEmail: user.email,
        confirmationDate: new Date().toLocaleDateString(),
        adminName: session.user.name || 'Administrator',
        platformUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        supportEmail: process.env.SUPPORT_EMAIL || 'support@samadvisoryhub.com',
        customMessage: customMessage,
      })

      await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
        type: 'CONFIRMATION',
        userId: user.id,
      })
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError)
      // Don't fail the approval if email fails
    }

    return NextResponse.json({
      message: 'User approved successfully',
      user: updatedUser,
    })
  } catch (error) {
    console.error('Error approving user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}



