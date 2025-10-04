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
  const platformUrl = data?.platformUrl || process.env.NEXTAUTH_URL || 'https://mentorshiphub.com'

  return {
    subject: 'Welcome to MentorshipHub! Your Account is Pending Review',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to MentorshipHub</title>
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
            <h1>Welcome to MentorshipHub!</h1>
            <p>Your journey to professional growth starts here</p>
          </div>
          <div class="content">
            <h2>Hi ${userName},</h2>
            <p>Thank you for joining MentorshipHub! We're excited to have you as part of our community of ambitious professionals.</p>
            
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
            
            <p>Best regards,<br>The MentorshipHub Team</p>
          </div>
          <div class="footer">
            <p>This email was sent to you because you registered for MentorshipHub.</p>
            <p>If you didn't create an account, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to MentorshipHub!

Hi ${userName},

Thank you for joining MentorshipHub! We're excited to have you as part of our community of ambitious professionals.

ACCOUNT STATUS: Under Review

What happens next?
- Review Process: Our team is carefully reviewing your application to ensure the best experience for all members
- Timeline: You'll receive a decision within 2-3 business days  
- Notification: We'll send you an email as soon as your account is approved

Explore Platform: ${platformUrl}

If you have any questions, don't hesitate to reach out to our support team.

Best regards,
The MentorshipHub Team

---
This email was sent to you because you registered for MentorshipHub.
If you didn't create an account, please ignore this email.
    `,
  }
}

function getAccountConfirmedTemplate(data: TemplateData): EmailTemplate {
  const userName = data?.userName || 'there'
  const platformUrl = data?.platformUrl || process.env.NEXTAUTH_URL || 'https://mentorshiphub.com'
  const confirmationDate = data?.confirmationDate || new Date().toLocaleDateString()

  return {
    subject: '🎉 Your MentorshipHub Account is Confirmed!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Confirmed - MentorshipHub</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .success-badge { background: #d1fae5; color: #065f46; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations!</h1>
            <p>Your MentorshipHub account has been approved</p>
          </div>
          <div class="content">
            <h2>Hi ${userName},</h2>
            <p>Great news! Your MentorshipHub account has been confirmed and you now have full access to our platform.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <span class="success-badge">✅ Account Confirmed</span>
            </div>
            
            <p><strong>Confirmed on:</strong> ${confirmationDate}</p>
            
            <div style="text-align: center;">
              <a href="${platformUrl}/dashboard" class="button">Access Your Dashboard</a>
            </div>
            
            <p>Welcome to the MentorshipHub community! We're excited to support your professional growth.</p>
            
            <p>Best regards,<br>The MentorshipHub Team</p>
          </div>
          <div class="footer">
            <p>This email was sent to you because your MentorshipHub account was confirmed.</p>
            <p>If you have any questions, contact us at ${data?.supportEmail || 'support@mentorshiphub.com'}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
🎉 Congratulations! Your MentorshipHub Account is Confirmed!

Hi ${userName},

Great news! Your MentorshipHub account has been confirmed and you now have full access to our platform.

ACCOUNT STATUS: ✅ Confirmed
Confirmed on: ${confirmationDate}

Access Your Dashboard: ${platformUrl}/dashboard

Welcome to the MentorshipHub community! We're excited to support your professional growth.

Best regards,
The MentorshipHub Team

---
This email was sent to you because your MentorshipHub account was confirmed.
If you have any questions, contact us at ${data?.supportEmail || 'support@mentorshiphub.com'}
    `,
  }
}

function getAccountRejectedTemplate(data: TemplateData): EmailTemplate {
  const userName = data?.userName || 'there'
  const rejectionReason = data?.rejectionReason || 'did not meet our current criteria'
  const supportEmail = data?.supportEmail || 'support@mentorshiphub.com'
  const platformUrl = data?.platformUrl || process.env.NEXTAUTH_URL || 'https://mentorshiphub.com'

  return {
    subject: 'Important: Your MentorshipHub Account Status',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Status - MentorshipHub</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .rejection-badge { background: #fee2e2; color: #991b1b; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500; }
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
            <p>We appreciate your interest in MentorshipHub. After careful review, we're unable to approve your application at this time.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <span class="rejection-badge">❌ Application Not Approved</span>
            </div>
            
            <h3>Reason for Rejection:</h3>
            <p><strong>${rejectionReason}</strong></p>
            
            <p>This decision is not permanent. We encourage you to reapply in the future.</p>
            
            <div style="text-align: center;">
              <a href="${platformUrl}" class="button">Learn More About MentorshipHub</a>
            </div>
            
            <p>If you have any questions about this decision, please contact our support team.</p>
            
            <p>Best regards,<br>The MentorshipHub Team</p>
          </div>
          <div class="footer">
            <p>This email was sent to you because your MentorshipHub application was reviewed.</p>
            <p>Questions? Contact us at ${supportEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Important: Your MentorshipHub Account Status

Hi ${userName},

We appreciate your interest in MentorshipHub. After careful review, we're unable to approve your application at this time.

ACCOUNT STATUS: ❌ Application Not Approved

Reason for Rejection:
${rejectionReason}

This decision is not permanent. We encourage you to reapply in the future.

Learn More: ${platformUrl}

If you have any questions about this decision, please contact our support team.

Best regards,
The MentorshipHub Team

---
This email was sent to you because your MentorshipHub application was reviewed.
Questions? Contact us at ${supportEmail}
    `,
  }
}

function getPasswordResetTemplate(data: TemplateData): EmailTemplate {
  const userName = data?.userName || 'there'
  const resetUrl = data?.resetUrl || '#'

  return {
    subject: 'Reset Your MentorshipHub Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - MentorshipHub</title>
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
            <p>We received a request to reset your MentorshipHub password. If you made this request, click the button below to create a new password.</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #3b82f6;">${resetUrl}</p>
            
            <p>If you have any questions or need assistance, please contact our support team.</p>
            
            <p>Best regards,<br>The MentorshipHub Team</p>
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
Password Reset Request - MentorshipHub

Hi ${userName},

We received a request to reset your MentorshipHub password. If you made this request, click the link below to create a new password.

Reset Password: ${resetUrl}

If the link doesn't work, copy and paste this URL into your browser:
${resetUrl}

If you have any questions or need assistance, please contact our support team.

Best regards,
The MentorshipHub Team

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
        <title>Meeting Reminder - MentorshipHub</title>
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
            
            <p>Best regards,<br>The MentorshipHub Team</p>
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
📅 Meeting Reminder - MentorshipHub

Hi ${userName},

This is a friendly reminder about your upcoming mentorship session.

Meeting Details:
- Title: ${meetingTitle}
- Date: ${meetingDate}

Join Meeting: ${meetingLink}

If you need to reschedule or have any questions, please contact your mentor or our support team.

Best regards,
The MentorshipHub Team

---
This email was sent as a reminder for your upcoming mentorship session.
If you need to reschedule, please contact your mentor or support team.
    `,
  }
}

function getCustomTemplate(data: TemplateData): EmailTemplate {
  const subject = data?.subject || 'Message from MentorshipHub'
  const content = data?.content || 'This is a custom message from MentorshipHub.'

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
            <h1>MentorshipHub</h1>
          </div>
          <div class="content">
            ${content}
            <p>Best regards,<br>The MentorshipHub Team</p>
          </div>
          <div class="footer">
            <p>This email was sent from MentorshipHub.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
${subject}

${content}

Best regards,
The MentorshipHub Team

---
This email was sent from MentorshipHub.
    `,
  }
}

function getDefaultTemplate(data: TemplateData): EmailTemplate {
  return {
    subject: 'Message from MentorshipHub',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MentorshipHub</title>
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
            <h1>MentorshipHub</h1>
          </div>
          <div class="content">
            <p>This is a message from MentorshipHub.</p>
            <p>Best regards,<br>The MentorshipHub Team</p>
          </div>
          <div class="footer">
            <p>This email was sent from MentorshipHub.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
MentorshipHub

This is a message from MentorshipHub.

Best regards,
The MentorshipHub Team

---
This email was sent from MentorshipHub.
    `,
  }
}