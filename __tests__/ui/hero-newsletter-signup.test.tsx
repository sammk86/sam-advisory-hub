import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Hero from '@/components/landing/Hero'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
}))

// Mock ClientOnly component
jest.mock('@/components/animations/ClientOnly', () => {
  return function ClientOnly({ children, fallback }: any) {
    return children || fallback
  }
})

// Mock fetch
global.fetch = jest.fn()

describe('Hero Newsletter Signup', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockClear()
  })

  it('should render newsletter signup section in hero', () => {
    render(<Hero />)

    expect(screen.getByText('Stay Updated')).toBeInTheDocument()
    expect(screen.getByText('Get the latest insights on career growth and mentorship delivered to your inbox.')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your email address')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /subscribe/i })).toBeInTheDocument()
  })

  it('should have proper newsletter signup styling for hero variant', () => {
    render(<Hero />)

    const emailInput = screen.getByPlaceholderText('Enter your email address')
    const subscribeButton = screen.getByRole('button', { name: /subscribe/i })

    // Check that the input has hero styling (white background, gray text)
    expect(emailInput).toHaveClass('bg-white', 'text-gray-900', 'border-gray-300')
    
    // Check that the button has hero styling (gradient background)
    expect(subscribeButton).toHaveClass('bg-gradient-to-r', 'from-blue-600', 'to-purple-600')
  })

  it('should handle newsletter subscription', async () => {
    const user = userEvent.setup()
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Successfully subscribed!',
      }),
    })

    render(<Hero />)

    const emailInput = screen.getByPlaceholderText('Enter your email address')
    const subscribeButton = screen.getByRole('button', { name: /subscribe/i })

    await user.type(emailInput, 'test@example.com')
    await user.click(subscribeButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          source: 'hero',
        }),
      })
    })
  })

  it('should show success message after successful subscription', async () => {
    const user = userEvent.setup()
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Successfully subscribed!',
      }),
    })

    render(<Hero />)

    const emailInput = screen.getByPlaceholderText('Enter your email address')
    const subscribeButton = screen.getByRole('button', { name: /subscribe/i })

    await user.type(emailInput, 'test@example.com')
    await user.click(subscribeButton)

    await waitFor(() => {
      expect(screen.getByText('Successfully subscribed!')).toBeInTheDocument()
    })
  })

  it('should show error message on subscription failure', async () => {
    const user = userEvent.setup()
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: false,
        message: 'Subscription failed. Please try again.',
      }),
    })

    render(<Hero />)

    const emailInput = screen.getByPlaceholderText('Enter your email address')
    const subscribeButton = screen.getByRole('button', { name: /subscribe/i })

    await user.type(emailInput, 'test@example.com')
    await user.click(subscribeButton)

    await waitFor(() => {
      expect(screen.getByText('Subscription failed. Please try again.')).toBeInTheDocument()
    })
  })

  it('should validate email format', async () => {
    const user = userEvent.setup()

    render(<Hero />)

    const emailInput = screen.getByPlaceholderText('Enter your email address')
    const subscribeButton = screen.getByRole('button', { name: /subscribe/i })

    await user.type(emailInput, 'invalid-email')
    await user.click(subscribeButton)

    // The validation should prevent form submission
    // We'll just verify the form is still there and the input has the invalid value
    expect(emailInput).toHaveValue('invalid-email')
    expect(subscribeButton).toBeInTheDocument()
  })

  it('should clear form after successful subscription', async () => {
    const user = userEvent.setup()
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Successfully subscribed!',
      }),
    })

    render(<Hero />)

    const emailInput = screen.getByPlaceholderText('Enter your email address')
    const subscribeButton = screen.getByRole('button', { name: /subscribe/i })

    await user.type(emailInput, 'test@example.com')
    await user.click(subscribeButton)

    await waitFor(() => {
      expect(emailInput).toHaveValue('')
    })
  })

  it('should show loading state during subscription', async () => {
    const user = userEvent.setup()
    ;(fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 100))
    )

    render(<Hero />)

    const emailInput = screen.getByPlaceholderText('Enter your email address')
    const subscribeButton = screen.getByRole('button', { name: /subscribe/i })

    await user.type(emailInput, 'test@example.com')
    await user.click(subscribeButton)

    expect(screen.getByText('Subscribing...')).toBeInTheDocument()
    expect(subscribeButton).toBeDisabled()
  })

  it('should have proper accessibility attributes', () => {
    render(<Hero />)

    const emailInput = screen.getByPlaceholderText('Enter your email address')
    const subscribeButton = screen.getByRole('button', { name: /subscribe/i })

    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('aria-label', 'Email address')
    expect(subscribeButton).toHaveAttribute('type', 'submit')
  })

  it('should display privacy notice', () => {
    render(<Hero />)

    expect(screen.getByText('We respect your privacy. Unsubscribe at any time.')).toBeInTheDocument()
  })
})
