import { Resend } from 'resend'

// Initialize Resend only if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export interface MessageEmailData {
  recipientName: string
  recipientEmail: string
  senderName: string
  messageContent: string
  conversationUrl: string
}

export async function sendMessageNotificationEmail({
  recipientName,
  recipientEmail,
  senderName,
  messageContent,
  conversationUrl
}: MessageEmailData) {
  try {
    if (!resend || !process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email notification')
      return { success: false, error: 'Email service not configured' }
    }

    const { data, error } = await resend.emails.send({
      from: 'Sam Advisory Hub <noreply@samadvisoryhub.com>',
      to: [recipientEmail],
      subject: `New message from ${senderName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Message</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">You have received a new message</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
              Hello <strong>${recipientName}</strong>,
            </p>
            
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
              You have received a new message from <strong>${senderName}</strong>:
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
              <p style="color: #333; font-style: italic; margin: 0;">
                "${messageContent}"
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${conversationUrl}" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Reply to Message
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              This message was sent from Sam Advisory Hub. If you have any questions, please contact our support team.
            </p>
          </div>
        </div>
      `,
      text: `
        New Message from ${senderName}
        
        Hello ${recipientName},
        
        You have received a new message from ${senderName}:
        
        "${messageContent}"
        
        Reply to this message: ${conversationUrl}
        
        ---
        This message was sent from Sam Advisory Hub.
      `
    })

    if (error) {
      console.error('Error sending message notification email:', error)
      return { success: false, error: error.message }
    }

    console.log('Message notification email sent successfully:', data?.id)
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Error sending message notification email:', error)
    return { success: false, error: 'Failed to send email notification' }
  }
}
