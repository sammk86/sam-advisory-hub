import { getEmailTemplate, TemplateData } from '@/lib/email-templates'
import { EmailType } from '@prisma/client'

describe('Email Templates Tests', () => {
  const mockData: TemplateData = {
    userName: 'John Doe',
    userEmail: 'john@example.com',
    rejectionReason: 'Incomplete profile information',
    supportEmail: 'support@mentorshiphub.com',
    platformUrl: 'https://mentorshiphub.com',
    adminName: 'Admin User',
    confirmationDate: '2025-10-03',
  }

  describe('getEmailTemplate', () => {
    it('should return welcome template', () => {
      const template = getEmailTemplate('WELCOME', mockData)

      expect(template.subject).toBe('Welcome to MentorshipHub! Your Account is Pending Review')
      expect(template.html).toContain('Welcome to MentorshipHub!')
      expect(template.html).toContain('John Doe')
      expect(template.html).toContain('Account Under Review')
      expect(template.text).toContain('Welcome to MentorshipHub!')
      expect(template.text).toContain('John Doe')
      expect(template.text).toContain('Under Review')
    })

    it('should return account confirmed template', () => {
      const template = getEmailTemplate('ACCOUNT_CONFIRMED', mockData)

      expect(template.subject).toBe('🎉 Your MentorshipHub Account is Confirmed!')
      expect(template.html).toContain('Congratulations!')
      expect(template.html).toContain('John Doe')
      expect(template.html).toContain('Account Confirmed')
      expect(template.html).toContain('2025-10-03')
      expect(template.text).toContain('Congratulations!')
      expect(template.text).toContain('John Doe')
      expect(template.text).toContain('Confirmed')
    })

    it('should return account rejected template', () => {
      const template = getEmailTemplate('ACCOUNT_REJECTED', mockData)

      expect(template.subject).toBe('Important: Your MentorshipHub Account Status')
      expect(template.html).toContain('Account Status Update')
      expect(template.html).toContain('John Doe')
      expect(template.html).toContain('Application Not Approved')
      expect(template.html).toContain('Incomplete profile information')
      expect(template.text).toContain('Account Status')
      expect(template.text).toContain('John Doe')
      expect(template.text).toContain('Not Approved')
    })

    it('should return password reset template', () => {
      const template = getEmailTemplate('PASSWORD_RESET', {
        ...mockData,
        resetUrl: 'https://mentorshiphub.com/reset?token=abc123',
      })

      expect(template.subject).toBe('Reset Your MentorshipHub Password')
      expect(template.html).toContain('Password Reset Request')
      expect(template.html).toContain('John Doe')
      expect(template.html).toContain('https://mentorshiphub.com/reset?token=abc123')
      expect(template.text).toContain('Password Reset Request')
      expect(template.text).toContain('John Doe')
      expect(template.text).toContain('https://mentorshiphub.com/reset?token=abc123')
    })

    it('should return meeting reminder template', () => {
      const template = getEmailTemplate('MEETING_REMINDER', {
        ...mockData,
        meetingTitle: 'Weekly Mentorship Session',
        meetingDate: 'October 10, 2025',
        meetingTime: '2:00 PM EST',
        meetingLink: 'https://zoom.us/j/123456789',
      })

      expect(template.subject).toBe('Reminder: Weekly Mentorship Session - October 10, 2025')
      expect(template.html).toContain('Meeting Reminder')
      expect(template.html).toContain('John Doe')
      expect(template.html).toContain('Weekly Mentorship Session')
      expect(template.html).toContain('October 10, 2025')
      expect(template.text).toContain('Meeting Reminder')
      expect(template.text).toContain('John Doe')
      expect(template.text).toContain('Weekly Mentorship Session')
    })

    it('should return custom template', () => {
      const template = getEmailTemplate('CUSTOM', {
        ...mockData,
        subject: 'Custom Message',
        content: 'This is a custom message for testing.',
      })

      expect(template.subject).toBe('Custom Message')
      expect(template.html).toContain('This is a custom message for testing.')
      expect(template.text).toContain('This is a custom message for testing.')
    })

    it('should return default template for unknown type', () => {
      const template = getEmailTemplate('UNKNOWN_TYPE', mockData)

      expect(template.subject).toBe('Message from MentorshipHub')
      expect(template.html).toContain('This is a message from MentorshipHub.')
      expect(template.text).toContain('This is a message from MentorshipHub.')
    })
  })

  describe('Template Data Handling', () => {
    it('should handle missing user name', () => {
      const template = getEmailTemplate('WELCOME', {
        ...mockData,
        userName: undefined,
      })

      expect(template.html).toContain('Hi there,')
      expect(template.text).toContain('Hi there,')
    })

    it('should handle missing platform URL', () => {
      const template = getEmailTemplate('WELCOME', {
        ...mockData,
        platformUrl: undefined,
      })

      expect(template.html).toContain('https://mentorshiphub.com')
      expect(template.text).toContain('https://mentorshiphub.com')
    })

    it('should handle missing rejection reason', () => {
      const template = getEmailTemplate('ACCOUNT_REJECTED', {
        ...mockData,
        rejectionReason: undefined,
      })

      expect(template.html).toContain('did not meet our current criteria')
      expect(template.text).toContain('did not meet our current criteria')
    })

    it('should handle missing support email', () => {
      const template = getEmailTemplate('ACCOUNT_REJECTED', {
        ...mockData,
        supportEmail: undefined,
      })

      expect(template.html).toContain('support@mentorshiphub.com')
      expect(template.text).toContain('support@mentorshiphub.com')
    })
  })

  describe('Template Content Validation', () => {
    it('should include proper HTML structure', () => {
      const template = getEmailTemplate('WELCOME', mockData)

      expect(template.html).toContain('<!DOCTYPE html>')
      expect(template.html).toContain('<html>')
      expect(template.html).toContain('<head>')
      expect(template.html).toContain('<body>')
      expect(template.html).toContain('</html>')
    })

    it('should include proper CSS styling', () => {
      const template = getEmailTemplate('WELCOME', mockData)

      expect(template.html).toContain('<style>')
      expect(template.html).toContain('font-family')
      expect(template.html).toContain('background')
      expect(template.html).toContain('color')
      expect(template.html).toContain('</style>')
    })

    it('should include proper email headers', () => {
      const template = getEmailTemplate('WELCOME', mockData)

      expect(template.html).toContain('<meta charset="utf-8">')
      expect(template.html).toContain('<meta name="viewport"')
      expect(template.html).toContain('<title>')
    })

    it('should include proper email footer', () => {
      const template = getEmailTemplate('WELCOME', mockData)

      expect(template.html).toContain('This email was sent to you because you registered for MentorshipHub.')
      expect(template.html).toContain('If you didn\'t create an account, please ignore this email.')
    })
  })

  describe('Template Responsiveness', () => {
    it('should include responsive design elements', () => {
      const template = getEmailTemplate('WELCOME', mockData)

      expect(template.html).toContain('max-width: 600px')
      expect(template.html).toContain('margin: 0 auto')
      expect(template.html).toContain('padding: 20px')
    })

    it('should include mobile-friendly elements', () => {
      const template = getEmailTemplate('WELCOME', mockData)

      expect(template.html).toContain('width=device-width')
      expect(template.html).toContain('initial-scale=1.0')
    })
  })

  describe('Template Accessibility', () => {
    it('should include proper heading structure', () => {
      const template = getEmailTemplate('WELCOME', mockData)

      expect(template.html).toContain('<h1>')
      expect(template.html).toContain('<h2>')
      expect(template.html).toContain('<h3>')
    })

    it('should include proper list structure', () => {
      const template = getEmailTemplate('WELCOME', mockData)

      expect(template.html).toContain('<ul>')
      expect(template.html).toContain('<li>')
    })

    it('should include proper link structure', () => {
      const template = getEmailTemplate('WELCOME', mockData)

      expect(template.html).toContain('<a href=')
      expect(template.html).toContain('class="button"')
    })
  })

  describe('Template Branding', () => {
    it('should include MentorshipHub branding', () => {
      const template = getEmailTemplate('WELCOME', mockData)

      expect(template.html).toContain('MentorshipHub')
      expect(template.text).toContain('MentorshipHub')
    })

    it('should include consistent color scheme', () => {
      const template = getEmailTemplate('WELCOME', mockData)

      expect(template.html).toContain('#3b82f6') // Primary blue
      expect(template.html).toContain('#667eea') // Gradient blue
    })

    it('should include consistent typography', () => {
      const template = getEmailTemplate('WELCOME', mockData)

      expect(template.html).toContain('font-family: -apple-system')
      expect(template.html).toContain('line-height: 1.6')
    })
  })

  describe('Template Error Handling', () => {
    it('should handle empty data object', () => {
      const template = getEmailTemplate('WELCOME', {})

      expect(template.subject).toBe('Welcome to MentorshipHub! Your Account is Pending Review')
      expect(template.html).toContain('Hi there,')
      expect(template.text).toContain('Hi there,')
    })

    it('should handle null data', () => {
      const template = getEmailTemplate('WELCOME', null as any)

      expect(template.subject).toBe('Welcome to MentorshipHub! Your Account is Pending Review')
      expect(template.html).toContain('Hi there,')
      expect(template.text).toContain('Hi there,')
    })

    it('should handle undefined data', () => {
      const template = getEmailTemplate('WELCOME', undefined as any)

      expect(template.subject).toBe('Welcome to MentorshipHub! Your Account is Pending Review')
      expect(template.html).toContain('Hi there,')
      expect(template.text).toContain('Hi there,')
    })
  })

  describe('Template Type Coverage', () => {
    it('should handle all email types', () => {
      const emailTypes = ['WELCOME', 'ACCOUNT_CONFIRMED', 'ACCOUNT_REJECTED', 'PASSWORD_RESET', 'MEETING_REMINDER', 'CUSTOM']
      
      emailTypes.forEach(type => {
        const template = getEmailTemplate(type, mockData)
        
        expect(template.subject).toBeDefined()
        expect(template.html).toBeDefined()
        expect(template.text).toBeDefined()
        expect(template.subject.length).toBeGreaterThan(0)
        expect(template.html.length).toBeGreaterThan(0)
        expect(template.text.length).toBeGreaterThan(0)
      })
    })
  })
})
