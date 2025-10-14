import { EmailTemplate } from './email'

export interface TemplateData {
  userName?: string
  userEmail?: string
  rejectionReason?: string
  supportEmail?: string
  platformUrl?: string
  adminName?: string
  confirmationDate?: string
  [key: string]: any
}

export function getEmailTemplate(type: string, data: TemplateData = {}): EmailTemplate {
  const templates = {
    WELCOME: getWelcomeTemplate(data),
    ACCOUNT_CONFIRMED: getAccountConfirmedTemplate(data),
    ACCOUNT_REJECTED: getAccountRejectedTemplate(data),
    PASSWORD_RESET: getPasswordResetTemplate(data),
    MEETING_REMINDER: getMeetingReminderTemplate(data),
    CUSTOM: getCustomTemplate(data),
  }

  return templates[type as keyof typeof templates] || getDefaultTemplate(data)
}

function getWelcomeTemplate(data: TemplateData): EmailTemplate {
  const userName = data?.userName || 'there'
  const platformUrl = data?.platformUrl || process.env.NEXTAUTH_URL || 'http://localhost:3000'

  return {
    subject: 'Welcome to SamAdvisoryHub! Your Account is Pending Review',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to SamAdvisoryHub</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .status-badge { background: #fef3c7; color: #92400e; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to SamAdvisoryHub!</h1>
            <p>Your journey to professional growth starts here</p>
          </div>
          <div class="content">
            <h2>Hi ${userName},</h2>
            <p>Thank you for joining SamAdvisoryHub! We're excited to have you as part of our community of ambitious professionals.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <span class="status-badge">⏳ Account Under Review</span>
            </div>
            
            <h3>What happens next?</h3>
            <ul>
              <li><strong>Review Process:</strong> Our team is carefully reviewing your application to ensure the best experience for all members</li>
              <li><strong>Timeline:</strong> You'll receive a decision within 2-3 business days</li>
              <li><strong>Notification:</strong> We'll send you an email as soon as your account is approved</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${platformUrl}" class="button">Explore Platform</a>
            </div>
            
            <p>If you have any questions, don't hesitate to reach out to our support team.</p>
            
            <p>Best regards,<br>The SamAdvisoryHub Team</p>
          </div>
          <div class="footer">
            <p>This email was sent to you because you registered for SamAdvisoryHub.</p>
            <p>If you didn't create an account, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to SamAdvisoryHub!

Hi ${userName},

Thank you for joining SamAdvisoryHub! We're excited to have you as part of our community of ambitious professionals.

ACCOUNT STATUS: Under Review

What happens next?
- Review Process: Our team is carefully reviewing your application to ensure the best experience for all members
- Timeline: You'll receive a decision within 2-3 business days  
- Notification: We'll send you an email as soon as your account is approved

Explore Platform: ${platformUrl}

If you have any questions, don't hesitate to reach out to our support team.

Best regards,
The SamAdvisoryHub Team

---
This email was sent to you because you registered for SamAdvisoryHub.
If you didn't create an account, please ignore this email.
    `,
  }
}

function getAccountConfirmedTemplate(data: TemplateData): EmailTemplate {
  const userName = data?.userName || 'there'
  const platformUrl = data?.platformUrl || process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const confirmationDate = data?.confirmationDate || new Date().toLocaleDateString()
  const customMessage = data?.customMessage

  // Use custom message if provided, otherwise use default
  const messageContent = customMessage || `Great news! Your SamAdvisoryHub account has been confirmed and you now have full access to our platform.

Welcome to the SamAdvisoryHub community! We're excited to support your professional growth.`

  return {
    subject: '🎉 Your SamAdvisoryHub Account is Confirmed!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Confirmed - SamAdvisoryHub</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .success-badge { background: #d1fae5; color: #065f46; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500; }
          .message-content { white-space: pre-line; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations!</h1>
            <p>Your SamAdvisoryHub account has been approved</p>
          </div>
          <div class="content">
            <h2>Hi ${userName},</h2>
            
            <div style="text-align: center; margin: 30px 0;">
              <span class="success-badge">✅ Account Confirmed</span>
            </div>
            
            <p><strong>Confirmed on:</strong> ${confirmationDate}</p>
            
            <div class="message-content">${messageContent}</div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${platformUrl}/dashboard" class="button">Access Your Dashboard</a>
            </div>
            
            <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin: 30px 0;">
              <h3 style="margin: 0 0 20px 0; color: #1e40af; font-size: 18px;">🚀 Explore SamAdvisoryHub</h3>
              <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                <div style="text-align: center;">
                  <a href="${platformUrl}/services" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 5px;">
                    📋 View Our Services
                  </a>
                </div>
                <div style="text-align: center;">
                  <a href="${platformUrl}/videos" style="display: inline-block; background: #10b981; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 5px;">
                    🎥 Watch Educational Videos
                  </a>
                </div>
                <div style="text-align: center;">
                  <a href="${platformUrl}/newsletters" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 5px;">
                    📧 Subscribe to Newsletter
                  </a>
                </div>
              </div>
              <p style="margin: 20px 0 0 0; text-align: center; color: #64748b; font-size: 14px;">
                Get the most out of your SamAdvisoryHub experience
              </p>
            </div>
            
            <p>Best regards,<br>The SamAdvisoryHub Team</p>
          </div>
          <div class="footer">
            <p>This email was sent to you because your SamAdvisoryHub account was confirmed.</p>
            <p>If you have any questions, contact us at ${data?.supportEmail || process.env.SUPPORT_EMAIL || 'support@samadvisoryhub.com'}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
🎉 Congratulations! Your SamAdvisoryHub Account is Confirmed!

Hi ${userName},

ACCOUNT STATUS: ✅ Confirmed
Confirmed on: ${confirmationDate}

${messageContent}

Access Your Dashboard: ${platformUrl}/dashboard

🚀 EXPLORE SAMADVISORYHUB:
📋 Services: ${platformUrl}/services
🎥 Videos: ${platformUrl}/videos  
📧 Newsletter: ${platformUrl}/newsletters

Get the most out of your SamAdvisoryHub experience!

Best regards,
The SamAdvisoryHub Team

---
This email was sent to you because your SamAdvisoryHub account was confirmed.
If you have any questions, contact us at ${data?.supportEmail || process.env.SUPPORT_EMAIL || 'support@samadvisoryhub.com'}
    `,
  }
}

function getAccountRejectedTemplate(data: TemplateData): EmailTemplate {
  const userName = data?.userName || 'there'
  const rejectionReason = data?.rejectionReason || 'did not meet our current criteria'
  const supportEmail = data?.supportEmail || process.env.SUPPORT_EMAIL || 'support@samadvisoryhub.com'
  const platformUrl = data?.platformUrl || process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const customMessage = data?.customMessage

  // Use custom message if provided, otherwise use default
  const messageContent = customMessage || `We appreciate your interest in SamAdvisoryHub. After careful review, we're unable to approve your application at this time.

This decision is not permanent. We encourage you to reapply in the future.

If you have any questions about this decision, please contact our support team.`

  return {
    subject: 'Important: Your SamAdvisoryHub Account Status',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Status - SamAdvisoryHub</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .rejection-badge { background: #fee2e2; color: #991b1b; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500; }
          .message-content { white-space: pre-line; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Account Status Update</h1>
            <p>Important information about your application</p>
          </div>
          <div class="content">
            <h2>Hi ${userName},</h2>
            
            <div style="text-align: center; margin: 30px 0;">
              <span class="rejection-badge">❌ Application Not Approved</span>
            </div>
            
            ${!customMessage ? `
            <h3>Reason for Rejection:</h3>
            <p><strong>${rejectionReason}</strong></p>
            ` : ''}
            
            <div class="message-content">${messageContent}</div>
            
            <div style="text-align: center;">
              <a href="${platformUrl}" class="button">Learn More About SamAdvisoryHub</a>
            </div>
            
            <p>Best regards,<br>The SamAdvisoryHub Team</p>
          </div>
          <div class="footer">
            <p>This email was sent to you because your SamAdvisoryHub application was reviewed.</p>
            <p>Questions? Contact us at ${supportEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Important: Your SamAdvisoryHub Account Status

Hi ${userName},

ACCOUNT STATUS: ❌ Application Not Approved

${!customMessage ? `Reason for Rejection:
${rejectionReason}

` : ''}${messageContent}

Learn More: ${platformUrl}

Best regards,
The SamAdvisoryHub Team

---
This email was sent to you because your SamAdvisoryHub application was reviewed.
Questions? Contact us at ${supportEmail}
    `,
  }
}

function getPasswordResetTemplate(data: TemplateData): EmailTemplate {
  const userName = data?.userName || 'there'
  const resetUrl = data?.resetUrl || '#'

  return {
    subject: 'Reset Your SamAdvisoryHub Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - SamAdvisoryHub</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
            <p>Secure your account with a new password</p>
          </div>
          <div class="content">
            <h2>Hi ${userName},</h2>
            <p>We received a request to reset your SamAdvisoryHub password. If you made this request, click the button below to create a new password.</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #3b82f6;">${resetUrl}</p>
            
            <p>If you have any questions or need assistance, please contact our support team.</p>
            
            <p>Best regards,<br>The SamAdvisoryHub Team</p>
          </div>
          <div class="footer">
            <p>This email was sent because a password reset was requested for your account.</p>
            <p>If you didn't request this, please ignore this email or contact support if you're concerned.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Password Reset Request - SamAdvisoryHub

Hi ${userName},

We received a request to reset your SamAdvisoryHub password. If you made this request, click the link below to create a new password.

Reset Password: ${resetUrl}

If the link doesn't work, copy and paste this URL into your browser:
${resetUrl}

If you have any questions or need assistance, please contact our support team.

Best regards,
The SamAdvisoryHub Team

---
This email was sent because a password reset was requested for your account.
If you didn't request this, please ignore this email or contact support if you're concerned.
    `,
  }
}

function getMeetingReminderTemplate(data: TemplateData): EmailTemplate {
  const userName = data?.userName || 'there'
  const meetingTitle = data?.meetingTitle || 'Your upcoming session'
  const meetingDate = data?.meetingDate || 'soon'
  const meetingLink = data?.meetingLink || '#'

  return {
    subject: `Reminder: ${meetingTitle} - ${meetingDate}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Meeting Reminder - SamAdvisoryHub</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Meeting Reminder</h1>
            <p>Your session is coming up soon</p>
          </div>
          <div class="content">
            <h2>Hi ${userName},</h2>
            <p>This is a friendly reminder about your upcoming mentorship session.</p>
            
            <h3>Meeting Details:</h3>
            <p><strong>Title:</strong> ${meetingTitle}</p>
            <p><strong>Date:</strong> ${meetingDate}</p>
            
            <div style="text-align: center;">
              <a href="${meetingLink}" class="button">Join Meeting</a>
            </div>
            
            <p>If you need to reschedule or have any questions, please contact your mentor or our support team.</p>
            
            <p>Best regards,<br>The SamAdvisoryHub Team</p>
          </div>
          <div class="footer">
            <p>This email was sent as a reminder for your upcoming mentorship session.</p>
            <p>If you need to reschedule, please contact your mentor or support team.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
📅 Meeting Reminder - SamAdvisoryHub

Hi ${userName},

This is a friendly reminder about your upcoming mentorship session.

Meeting Details:
- Title: ${meetingTitle}
- Date: ${meetingDate}

Join Meeting: ${meetingLink}

If you need to reschedule or have any questions, please contact your mentor or our support team.

Best regards,
The SamAdvisoryHub Team

---
This email was sent as a reminder for your upcoming mentorship session.
If you need to reschedule, please contact your mentor or support team.
    `,
  }
}

function getCustomTemplate(data: TemplateData): EmailTemplate {
  const subject = data?.subject || 'Message from SamAdvisoryHub'
  const content = data?.content || 'This is a custom message from SamAdvisoryHub.'

  return {
    subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6b7280 0%, #374151 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SamAdvisoryHub</h1>
          </div>
          <div class="content">
            ${content}
            <p>Best regards,<br>The SamAdvisoryHub Team</p>
          </div>
          <div class="footer">
            <p>This email was sent from SamAdvisoryHub.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
${subject}

${content}

Best regards,
The SamAdvisoryHub Team

---
This email was sent from SamAdvisoryHub.
    `,
  }
}

function getDefaultTemplate(data: TemplateData): EmailTemplate {
  return {
    subject: 'Message from SamAdvisoryHub',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SamAdvisoryHub</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SamAdvisoryHub</h1>
          </div>
          <div class="content">
            <p>This is a message from SamAdvisoryHub.</p>
            <p>Best regards,<br>The SamAdvisoryHub Team</p>
          </div>
          <div class="footer">
            <p>This email was sent from SamAdvisoryHub.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
SamAdvisoryHub

This is a message from SamAdvisoryHub.

Best regards,
The SamAdvisoryHub Team

---
This email was sent from SamAdvisoryHub.
    `,
  }
}