import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for newsletter unsubscription
const unsubscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  token: z.string().optional(), // Optional unsubscribe token for enhanced security
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validatedData = unsubscribeSchema.parse(body)
    
    const { email } = validatedData

    // Find the subscriber
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    })

    if (!subscriber) {
      return NextResponse.json({
        success: false,
        message: 'Email address not found in our newsletter list.',
      }, { status: 404 })
    }

    // Check if already unsubscribed
    if (subscriber.status === 'UNSUBSCRIBED') {
      return NextResponse.json({
        success: true,
        message: 'You have already been unsubscribed from our newsletter.',
      })
    }

    // Update subscriber status to unsubscribed
    const updatedSubscriber = await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: 'UNSUBSCRIBED',
        unsubscribedAt: new Date(),
      },
    })

    // Send confirmation email
    await sendUnsubscribeConfirmationEmail(updatedSubscriber.email, updatedSubscriber.firstName)

    return NextResponse.json({
      success: true,
      message: 'You have been successfully unsubscribed from our newsletter.',
    })

  } catch (error) {
    console.error('Newsletter unsubscription error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors,
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to unsubscribe from newsletter. Please try again later.',
    }, { status: 500 })
  }
}

// Handle GET requests for unsubscribe links in emails
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({
        success: false,
        message: 'Email address is required.',
      }, { status: 400 })
    }

    // Find the subscriber
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    })

    if (!subscriber) {
      return NextResponse.json({
        success: false,
        message: 'Email address not found in our newsletter list.',
      }, { status: 404 })
    }

    // Check if already unsubscribed
    if (subscriber.status === 'UNSUBSCRIBED') {
      return NextResponse.json({
        success: true,
        message: 'You have already been unsubscribed from our newsletter.',
      })
    }

    // Update subscriber status to unsubscribed
    const updatedSubscriber = await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: 'UNSUBSCRIBED',
        unsubscribedAt: new Date(),
      },
    })

    // Send confirmation email
    await sendUnsubscribeConfirmationEmail(updatedSubscriber.email, updatedSubscriber.firstName)

    return NextResponse.json({
      success: true,
      message: 'You have been successfully unsubscribed from our newsletter.',
    })

  } catch (error) {
    console.error('Newsletter unsubscription error:', error)

    return NextResponse.json({
      success: false,
      message: 'Failed to unsubscribe from newsletter. Please try again later.',
    }, { status: 500 })
  }
}

async function sendUnsubscribeConfirmationEmail(email: string, firstName?: string) {
  try {
    const confirmationSubject = 'You have been unsubscribed from SamAdvisoryHub Newsletter'
    const confirmationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb; margin-bottom: 20px;">Unsubscribed Successfully</h1>
        
        <p>Hi ${firstName || 'there'},</p>
        
        <p>You have been successfully unsubscribed from our newsletter. We're sorry to see you go!</p>
        
        <p>If you unsubscribed by mistake, you can always resubscribe by visiting our website and signing up again.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">Still interested in career growth?</h3>
          <p style="margin-bottom: 15px;">Even without our newsletter, you can still explore our mentorship programs and advisory services.</p>
          <a href="${process.env.NEXTAUTH_URL}/services" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Browse Our Services
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          If you have any questions or feedback, please contact us at 
          <a href="mailto:hello@mentorshiphub.com" style="color: #2563eb;">hello@mentorshiphub.com</a>
        </p>
        
        <p style="color: #6b7280; font-size: 14px;">
          Best regards,<br>
          The SamAdvisoryHub Team
        </p>
      </div>
    `

    const confirmationText = `
Unsubscribed Successfully

Hi ${firstName || 'there'},

You have been successfully unsubscribed from our newsletter. We're sorry to see you go!

If you unsubscribed by mistake, you can always resubscribe by visiting our website and signing up again.

Still interested in career growth?
Even without our newsletter, you can still explore our mentorship programs and advisory services.

Visit: ${process.env.NEXTAUTH_URL}/services

If you have any questions or feedback, please contact us at hello@mentorshiphub.com

Best regards,
The SamAdvisoryHub Team
    `

    // Note: We don't use the existing sendEmail function here since the user is unsubscribed
    // This is a one-time confirmation email
    const brevo = await import('@getbrevo/brevo')
    const brevoApi = new brevo.TransactionalEmailsApi()
    brevoApi.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '')

    const sender = new brevo.SendSmtpEmailSender()
    sender.email = process.env.FROM_EMAIL || 'newsletter@samadvisoryhub.com'
    sender.name = process.env.FROM_NAME || 'SamAdvisoryHub'

      const toRecipients = [{}]
      toRecipients[0].email = email

    const emailData = new brevo.SendSmtpEmail()
    emailData.sender = sender
    emailData.to = toRecipients
    emailData.subject = confirmationSubject
    emailData.htmlContent = confirmationHtml
    emailData.textContent = confirmationText

    await brevoApi.sendTransacEmail(emailData)

  } catch (error) {
    console.error('Failed to send unsubscribe confirmation email:', error)
    // Don't throw error here - unsubscription should still succeed
  }
}
