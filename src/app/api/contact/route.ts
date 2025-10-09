import { NextRequest, NextResponse } from 'next/server'
import * as brevo from '@getbrevo/brevo'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json({
        success: false,
        message: 'All fields are required'
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        message: 'Please provide a valid email address'
      }, { status: 400 })
    }

    // Create email content
    const emailSubject = `Contact Form: ${subject}`
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #495057; margin-top: 0;">Contact Details</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px;">
          <h3 style="color: #495057; margin-top: 0;">Message</h3>
          <p style="line-height: 1.6; color: #333;">${message.replace(/\n/g, '<br>')}</p>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background-color: #e9ecef; border-radius: 8px; font-size: 14px; color: #6c757d;">
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Source:</strong> Contact Form - Sam Advisory Hub</p>
        </div>
      </div>
    `

    const plainTextBody = `
New Contact Form Submission

Contact Details:
- Name: ${name}
- Email: ${email}
- Subject: ${subject}

Message:
${message}

Submitted: ${new Date().toLocaleString()}
Source: Contact Form - Sam Advisory Hub
    `

    // Check if Brevo API key is configured
    if (!process.env.BREVO_API_KEY) {
      console.error('BREVO_API_KEY is not configured')
      return NextResponse.json({
        success: false,
        message: 'Email service is not configured. Please contact me directly at sam.mokhtari87@gmail.com'
      }, { status: 500 })
    }

    // Send email directly using Brevo API (no database operations)
    const brevoApi = new brevo.TransactionalEmailsApi()
    brevoApi.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY)

    // Prepare sender
    const sender = new brevo.SendSmtpEmailSender()
    sender.email = process.env.FROM_EMAIL || 'sam.mokhtari87@gmail.com'
    sender.name = 'Sam Advisory Hub'

    // Prepare recipients
    const toRecipients = [{}]
    toRecipients[0].email = 'sam.mokhtari87@gmail.com' // Hardcoded for testing

    // Prepare email data
    const emailData = new brevo.SendSmtpEmail()
    emailData.sender = sender
    emailData.to = toRecipients
    emailData.subject = emailSubject
    emailData.htmlContent = emailBody
    emailData.textContent = plainTextBody

    // Send email via Brevo
    await brevoApi.sendTransacEmail(emailData)

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! I will get back to you soon.'
    })

  } catch (error) {
    console.error('Contact form error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Failed to send message. Please try again or contact me directly at sam.mokhtari87@gmail.com'
    }, { status: 500 })
  }
}
