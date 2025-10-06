import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { z } from 'zod'

// Validation schema for newsletter subscription
const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  interests: z.array(z.string()).optional(),
  source: z.string().optional().default('landing-page'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validatedData = subscribeSchema.parse(body)
    
    const { email, firstName, lastName, interests, source } = validatedData

    // Check if subscriber already exists
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    })

    if (existingSubscriber) {
      // If already subscribed and active, return success
      if (existingSubscriber.status === 'ACTIVE') {
        return NextResponse.json({
          success: true,
          message: 'You are already subscribed to our newsletter!',
          subscriberId: existingSubscriber.id,
        })
      }

      // If unsubscribed, reactivate the subscription
      if (existingSubscriber.status === 'UNSUBSCRIBED') {
        const updatedSubscriber = await prisma.newsletterSubscriber.update({
          where: { id: existingSubscriber.id },
          data: {
            status: 'ACTIVE',
            firstName: firstName || existingSubscriber.firstName,
            lastName: lastName || existingSubscriber.lastName,
            interests: interests || existingSubscriber.interests,
            source: source || existingSubscriber.source,
            unsubscribedAt: null,
          },
        })

        // Send welcome back email
        await sendWelcomeEmail(updatedSubscriber.email, updatedSubscriber.firstName)

        return NextResponse.json({
          success: true,
          message: 'Welcome back! You have been resubscribed to our newsletter.',
          subscriberId: updatedSubscriber.id,
        })
      }

      // If bounced or complained, don't allow resubscription
      if (existingSubscriber.status === 'BOUNCED' || existingSubscriber.status === 'COMPLAINED') {
        return NextResponse.json({
          success: false,
          message: 'This email address cannot be subscribed due to previous delivery issues.',
        }, { status: 400 })
      }
    }

    // Create new subscriber
    const newSubscriber = await prisma.newsletterSubscriber.create({
      data: {
        email,
        firstName,
        lastName,
        interests: interests || [],
        source,
        status: 'ACTIVE',
      },
    })

    // Send welcome email
    await sendWelcomeEmail(newSubscriber.email, newSubscriber.firstName)

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to our newsletter! Check your email for a welcome message.',
      subscriberId: newSubscriber.id,
    })

  } catch (error) {
    console.error('Newsletter subscription error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors,
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to subscribe to newsletter. Please try again later.',
    }, { status: 500 })
  }
}

async function sendWelcomeEmail(email: string, firstName?: string) {
  try {
    const welcomeSubject = 'Welcome to SamAdvisoryHub Newsletter! 🎉'
    const welcomeHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb; margin-bottom: 20px;">Welcome to SamAdvisoryHub!</h1>
        
        <p>Hi ${firstName || 'there'},</p>
        
        <p>Thank you for subscribing to our newsletter! We're excited to have you join our community of professionals who are committed to career growth and development.</p>
        
        <h2 style="color: #1f2937; margin-top: 30px;">What to expect:</h2>
        <ul style="color: #4b5563; line-height: 1.6;">
          <li>Weekly insights on career development and mentorship</li>
          <li>Exclusive tips from industry leaders</li>
          <li>Updates on new mentorship programs and advisory services</li>
          <li>Early access to special events and workshops</li>
        </ul>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">Ready to accelerate your career?</h3>
          <p style="margin-bottom: 15px;">Explore our mentorship programs and advisory services designed to help you achieve your professional goals.</p>
          <a href="${process.env.NEXTAUTH_URL}/services" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Browse Our Services
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          If you have any questions, feel free to reach out to us at 
          <a href="mailto:hello@mentorshiphub.com" style="color: #2563eb;">hello@mentorshiphub.com</a>
        </p>
        
        <p style="color: #6b7280; font-size: 14px;">
          Best regards,<br>
          The SamAdvisoryHub Team
        </p>
      </div>
    `

    const welcomeText = `
Welcome to SamAdvisoryHub!

Hi ${firstName || 'there'},

Thank you for subscribing to our newsletter! We're excited to have you join our community of professionals who are committed to career growth and development.

What to expect:
- Weekly insights on career development and mentorship
- Exclusive tips from industry leaders
- Updates on new mentorship programs and advisory services
- Early access to special events and workshops

Ready to accelerate your career?
Explore our mentorship programs and advisory services designed to help you achieve your professional goals.

Visit: ${process.env.NEXTAUTH_URL}/services

If you have any questions, feel free to reach out to us at hello@mentorshiphub.com

Best regards,
The SamAdvisoryHub Team
    `

    await sendEmail({
      to: email,
      subject: welcomeSubject,
      html: welcomeHtml,
      text: welcomeText,
      type: 'newsletter_welcome',
      userId: 'system', // System-generated email
    })

  } catch (error) {
    console.error('Failed to send welcome email:', error)
    // Don't throw error here - subscription should still succeed
  }
}
