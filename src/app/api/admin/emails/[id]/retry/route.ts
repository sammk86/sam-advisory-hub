import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { getEmailTemplate } from '@/lib/email-templates'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const emailId = params.id

    // Get email details
    const email = await prisma.emailNotification.findUnique({
      where: { id: emailId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    })

    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 })
    }

    if (email.status === 'DELIVERED' || email.status === 'OPENED' || email.status === 'CLICKED') {
      return NextResponse.json({ error: 'Email already delivered successfully' }, { status: 400 })
    }

    // Retry sending the email
    try {
      const template = getEmailTemplate(email.type, {
        userName: email.user.name || 'there',
        userEmail: email.user.email,
        platformUrl: process.env.NEXTAUTH_URL || 'https://mentorshiphub.com',
        supportEmail: process.env.SUPPORT_EMAIL || 'support@mentorshiphub.com',
      })

      const result = await sendEmail({
        to: email.user.email,
        subject: email.subject,
        html: template.html,
        text: template.text,
        type: email.type as any,
        userId: email.userId,
      })

      if (result.success) {
        // Update email status
        await prisma.emailNotification.update({
          where: { id: emailId },
          data: {
            status: 'SENT',
            sentAt: new Date(),
            errorMessage: null,
          },
        })

        return NextResponse.json({
          message: 'Email retry successful',
          emailId,
        })
      } else {
        // Update with new error
        await prisma.emailNotification.update({
          where: { id: emailId },
          data: {
            status: 'FAILED',
            errorMessage: result.error || 'Unknown error',
          },
        })

        return NextResponse.json({
          message: 'Email retry failed',
          error: result.error,
        }, { status: 400 })
      }
    } catch (error) {
      // Update with error
      await prisma.emailNotification.update({
        where: { id: emailId },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      })

      return NextResponse.json({
        message: 'Email retry failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Error retrying email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}



