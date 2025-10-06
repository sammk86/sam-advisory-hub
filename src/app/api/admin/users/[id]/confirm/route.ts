import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendEmail } from '@/lib/email'
import { renderConfirmationEmail } from '@/lib/email-templates'

const confirmUserSchema = z.object({
  adminId: z.string(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { adminId } = confirmUserSchema.parse(body)

    // Validate admin ID matches session
    if (adminId !== session.user.id) {
      return NextResponse.json({ error: 'Invalid admin ID' }, { status: 400 })
    }

    // Find the user to confirm
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        name: true,
        isConfirmed: true,
        confirmedAt: true,
        rejectionReason: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user is already confirmed
    if (user.isConfirmed) {
      return NextResponse.json(
        { error: 'User is already confirmed' },
        { status: 400 }
      )
    }

    // Check if user was rejected
    if (user.rejectionReason) {
      return NextResponse.json(
        { error: 'User was previously rejected' },
        { status: 400 }
      )
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        isConfirmed: true,
        confirmedAt: new Date(),
        confirmedBy: adminId,
        role: 'CLIENT', // Change from PENDING to CLIENT
      },
      select: {
        id: true,
        email: true,
        name: true,
        isConfirmed: true,
        confirmedAt: true,
        confirmedBy: true,
        role: true,
      },
    })

    // Send confirmation email
    try {
      const emailTemplate = await renderConfirmationEmail({
        userName: user.name || 'User',
        userEmail: user.email,
        platformName: 'SamAdvisoryHub',
        dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard`,
        supportEmail: process.env.SUPPORT_EMAIL || 'support@mentorshiphub.com',
      })

      await sendEmail({
        to: user.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
        type: 'ACCOUNT_CONFIRMED',
        userId: user.id,
      })
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      message: 'User confirmed successfully',
      user: updatedUser,
    })
  } catch (error) {
    console.error('Error confirming user:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


