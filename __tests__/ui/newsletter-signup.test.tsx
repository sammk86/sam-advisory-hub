import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewsletterSignupForm from '@/components/newsletter/NewsletterSignupForm'

// Mock fetch
global.fetch = jest.fn()

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}))

describe('NewsletterSignupForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockClear()
  })

  describe('Basic Functionality', () => {
    it('should render newsletter signup form', () => {
      render(<NewsletterSignupForm />)
      
      expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /subscribe/i })).toBeInTheDocument()
    })

    it('should render with custom placeholder text', () => {
      render(<NewsletterSignupForm placeholder="Enter email address" />)
      
      expect(screen.getByPlaceholderText('Enter email address')).toBeInTheDocument()
    })

    it('should show interest selection when enabled', () => {
      render(<NewsletterSignupForm showInterests={true} />)
      
      expect(screen.getByText(/interests/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/software engineering/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/leadership/i)).toBeInTheDocument()
    })

    it('should not show interest selection when disabled', () => {
      render(<NewsletterSignupForm showInterests={false} />)
      
      expect(screen.queryByText(/interests/i)).not.toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should validate email format', async () => {
      const user = userEvent.setup()
      render(<NewsletterSignupForm />)
      
      const emailInput = screen.getByPlaceholderText(/enter your email/i)
      const submitButton = screen.getByRole('button', { name: /subscribe/i })
      
      await user.type(emailInput, 'invalid-email')
      await user.click(submitButton)
      
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
    })

    it('should require email field', async () => {
      const user = userEvent.setup()
      render(<NewsletterSignupForm />)
      
      const submitButton = screen.getByRole('button', { name: /subscribe/i })
      await user.click(submitButton)
      
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    })

    it('should accept valid email', async () => {
      const user = userEvent.setup()
      render(<NewsletterSignupForm />)
      
      const emailInput = screen.getByPlaceholderText(/enter your email/i)
      const submitButton = screen.getByRole('button', { name: /subscribe/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.click(submitButton)
      
      // Should not show validation error
      expect(screen.queryByText(/invalid email/i)).not.toBeInTheDocument()
    })
  })

  describe('Interest Selection', () => {
    it('should allow multiple interest selection', async () => {
      const user = userEvent.setup()
      render(<NewsletterSignupForm showInterests={true} />)
      
      const softwareCheckbox = screen.getByLabelText(/software engineering/i)
      const leadershipCheckbox = screen.getByLabelText(/leadership/i)
      
      await user.click(softwareCheckbox)
      await user.click(leadershipCheckbox)
      
      expect(softwareCheckbox).toBeChecked()
      expect(leadershipCheckbox).toBeChecked()
    })

    it('should submit with selected interests', async () => {
      const user = userEvent.setup()
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Subscribed successfully' }),
      })
      
      render(<NewsletterSignupForm showInterests={true} />)
      
      const emailInput = screen.getByPlaceholderText(/enter your email/i)
      const softwareCheckbox = screen.getByLabelText(/software engineering/i)
      const submitButton = screen.getByRole('button', { name: /subscribe/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.click(softwareCheckbox)
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/newsletter/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            interests: ['software-engineering'],
            source: 'footer',
          }),
        })
      })
    })
  })

  describe('API Integration', () => {
    it('should handle successful subscription', async () => {
      const user = userEvent.setup()
      const onSuccess = jest.fn()
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          success: true, 
          message: 'Successfully subscribed!',
          subscriberId: 'sub-123'
        }),
      })
      
      render(<NewsletterSignupForm onSuccess={onSuccess} />)
      
      const emailInput = screen.getByPlaceholderText(/enter your email/i)
      const submitButton = screen.getByRole('button', { name: /subscribe/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/successfully subscribed/i)).toBeInTheDocument()
        expect(onSuccess).toHaveBeenCalled()
      })
    })

    it('should handle subscription error', async () => {
      const user = userEvent.setup()
      const onError = jest.fn()
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ 
          success: false, 
          message: 'Subscription failed' 
        }),
      })
      
      render(<NewsletterSignupForm onError={onError} />)
      
      const emailInput = screen.getByPlaceholderText(/enter your email/i)
      const submitButton = screen.getByRole('button', { name: /subscribe/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/subscription failed/i)).toBeInTheDocument()
        expect(onError).toHaveBeenCalled()
      })
    })

    it('should handle network error', async () => {
      const user = userEvent.setup()
      const onError = jest.fn()
      ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))
      
      render(<NewsletterSignupForm onError={onError} />)
      
      const emailInput = screen.getByPlaceholderText(/enter your email/i)
      const submitButton = screen.getByRole('button', { name: /subscribe/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
        expect(onError).toHaveBeenCalled()
      })
    })
  })

  describe('Loading States', () => {
    it('should show loading state during submission', async () => {
      const user = userEvent.setup()
      ;(fetch as jest.Mock).mockImplementationOnce(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )
      
      render(<NewsletterSignupForm />)
      
      const emailInput = screen.getByPlaceholderText(/enter your email/i)
      const submitButton = screen.getByRole('button', { name: /subscribe/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.click(submitButton)
      
      expect(screen.getByText(/subscribing/i)).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })

    it('should disable form during submission', async () => {
      const user = userEvent.setup()
      ;(fetch as jest.Mock).mockImplementationOnce(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )
      
      render(<NewsletterSignupForm />)
      
      const emailInput = screen.getByPlaceholderText(/enter your email/i)
      const submitButton = screen.getByRole('button', { name: /subscribe/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.click(submitButton)
      
      expect(emailInput).toBeDisabled()
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Success/Error Animations', () => {
    it('should show success animation', async () => {
      const user = userEvent.setup()
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Success!' }),
      })
      
      render(<NewsletterSignupForm />)
      
      const emailInput = screen.getByPlaceholderText(/enter your email/i)
      const submitButton = screen.getByRole('button', { name: /subscribe/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/success!/i)).toBeInTheDocument()
        // Check for success animation class on the message container
        const messageContainer = screen.getByRole('alert')
        expect(messageContainer).toHaveClass('animate-pulse')
      })
    })

    it('should show error animation', async () => {
      const user = userEvent.setup()
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ success: false, message: 'Error!' }),
      })
      
      render(<NewsletterSignupForm />)
      
      const emailInput = screen.getByPlaceholderText(/enter your email/i)
      const submitButton = screen.getByRole('button', { name: /subscribe/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/error!/i)).toBeInTheDocument()
        // Check for error animation class on the message container
        const messageContainer = screen.getByRole('alert')
        expect(messageContainer).toHaveClass('animate-bounce')
      })
    })
  })

  describe('Mobile Responsiveness', () => {
    it('should be responsive on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      
      render(<NewsletterSignupForm />)
      
      const form = screen.getByRole('form')
      expect(form).toHaveClass('flex', 'flex-col', 'sm:flex-row')
    })

    it('should stack elements vertically on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      
      render(<NewsletterSignupForm />)
      
      const emailInput = screen.getByPlaceholderText(/enter your email/i)
      const submitButton = screen.getByRole('button', { name: /subscribe/i })
      
      // Check that elements are in a flex column layout
      const form = screen.getByRole('form')
      expect(form).toHaveClass('flex-col')
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      render(<NewsletterSignupForm />)
      
      const emailInput = screen.getByPlaceholderText(/enter your email/i)
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('aria-label', 'Email address')
    })

    it('should have proper button labels', () => {
      render(<NewsletterSignupForm />)
      
      const submitButton = screen.getByRole('button', { name: /subscribe/i })
      expect(submitButton).toHaveAttribute('type', 'submit')
    })

    it('should announce success to screen readers', async () => {
      const user = userEvent.setup()
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Success!' }),
      })
      
      render(<NewsletterSignupForm />)
      
      const emailInput = screen.getByPlaceholderText(/enter your email/i)
      const submitButton = screen.getByRole('button', { name: /subscribe/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.click(submitButton)
      
      await waitFor(() => {
        const messageContainer = screen.getByRole('alert')
        expect(messageContainer).toHaveAttribute('role', 'alert')
        expect(messageContainer).toHaveAttribute('aria-live', 'polite')
      })
    })
  })

  describe('Form Reset', () => {
    it('should reset form after successful submission', async () => {
      const user = userEvent.setup()
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Success!' }),
      })
      
      render(<NewsletterSignupForm />)
      
      const emailInput = screen.getByPlaceholderText(/enter your email/i)
      const submitButton = screen.getByRole('button', { name: /subscribe/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/success!/i)).toBeInTheDocument()
      })
      
      // Form should be reset after success
      expect(emailInput).toHaveValue('')
    })

    it('should clear error messages on new input', async () => {
      const user = userEvent.setup()
      render(<NewsletterSignupForm />)
      
      const emailInput = screen.getByPlaceholderText(/enter your email/i)
      const submitButton = screen.getByRole('button', { name: /subscribe/i })
      
      // Submit with invalid email
      await user.type(emailInput, 'invalid')
      await user.click(submitButton)
      
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
      
      // Start typing valid email
      await user.clear(emailInput)
      await user.type(emailInput, 'test@')
      
      // Error should be cleared
      expect(screen.queryByText(/invalid email address/i)).not.toBeInTheDocument()
    })
  })
})
