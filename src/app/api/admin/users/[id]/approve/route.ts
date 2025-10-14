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

    // Add user to newsletter subscribers
    try {
      // Check if user is already a subscriber
      const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
        where: { email: user.email },
      })

      if (!existingSubscriber) {
        // Extract first and last name from user name
        const nameParts = (user.name || '').split(' ')
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''

        // Create new newsletter subscriber
        await prisma.newsletterSubscriber.create({
          data: {
            email: user.email,
            firstName: firstName || null,
            lastName: lastName || null,
            interests: [], // Default empty interests
            source: 'user-confirmation',
            status: 'ACTIVE',
          },
        })

        console.log(`User ${user.email} added to newsletter subscribers`)
      } else if (existingSubscriber.status === 'UNSUBSCRIBED') {
        // Reactivate subscription if previously unsubscribed
        await prisma.newsletterSubscriber.update({
          where: { id: existingSubscriber.id },
          data: {
            status: 'ACTIVE',
            unsubscribedAt: null,
          },
        })

        console.log(`User ${user.email} newsletter subscription reactivated`)
      } else {
        console.log(`User ${user.email} is already an active newsletter subscriber`)
      }
    } catch (subscriberError) {
      console.error('Error adding user to newsletter subscribers:', subscriberError)
      // Don't fail the approval if newsletter subscription fails
    }

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
      sessionRefreshNeeded: true, // Indicate that the user should refresh their session
    })
  } catch (error) {
    console.error('Error approving user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}



