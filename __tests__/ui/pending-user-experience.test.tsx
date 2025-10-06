import { render, screen, waitFor } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import PendingPage from '@/app/pending/page'
import RejectedPage from '@/app/rejected/page'

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  }
})

describe('Pending User Experience Tests', () => {
  const mockPush = jest.fn()
  const mockRouter = {
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  describe('Pending Page', () => {
    it('should render loading state when session is loading', () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'loading',
      })

      render(<PendingPage />)

      // Should show loading spinner
      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('should redirect to signin when user is not authenticated', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
      })

      render(<PendingPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/signin')
      })
    })

    it('should redirect to dashboard when user is confirmed', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            name: 'John Doe',
            isConfirmed: true,
            role: 'CLIENT',
          },
        },
        status: 'authenticated',
      })

      render(<PendingPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('should redirect to rejected page when user is rejected', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            name: 'John Doe',
            isConfirmed: false,
            rejectionReason: 'Incomplete profile',
            role: 'CLIENT',
          },
        },
        status: 'authenticated',
      })

      render(<PendingPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/rejected')
      })
    })

    it('should display pending page content for unconfirmed users', () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            name: 'John Doe',
            isConfirmed: false,
            rejectionReason: null,
            role: 'CLIENT',
          },
        },
        status: 'authenticated',
      })

      render(<PendingPage />)

      expect(screen.getByText('Account Under Review')).toBeInTheDocument()
      expect(screen.getByText(/Thank you for joining SamAdvisoryHub!/)).toBeInTheDocument()
      expect(screen.getByText("What's Happening?")).toBeInTheDocument()
      expect(screen.getByText('Timeline')).toBeInTheDocument()
      expect(screen.getByText('What to Expect')).toBeInTheDocument()
    })

    it('should display review process steps', () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            name: 'John Doe',
            isConfirmed: false,
            rejectionReason: null,
            role: 'CLIENT',
          },
        },
        status: 'authenticated',
      })

      render(<PendingPage />)

      expect(screen.getByText('Application Received')).toBeInTheDocument()
      expect(screen.getByText('Under Review')).toBeInTheDocument()
      expect(screen.getByText('Decision & Notification')).toBeInTheDocument()
    })

    it('should display timeline information', () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            name: 'John Doe',
            isConfirmed: false,
            rejectionReason: null,
            role: 'CLIENT',
          },
        },
        status: 'authenticated',
      })

      render(<PendingPage />)

      expect(screen.getByText('Registration Complete')).toBeInTheDocument()
      expect(screen.getByText('Review in Progress')).toBeInTheDocument()
      expect(screen.getByText('Decision Notification')).toBeInTheDocument()
    })

    it('should display contact support link', () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            name: 'John Doe',
            isConfirmed: false,
            rejectionReason: null,
            role: 'CLIENT',
          },
        },
        status: 'authenticated',
      })

      render(<PendingPage />)

      const supportLink = screen.getByRole('link', { name: /contact support/i })
      expect(supportLink).toBeInTheDocument()
      expect(supportLink).toHaveAttribute('href', 'mailto:support@mentorshiphub.com')
    })

    it('should display back to home link', () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            name: 'John Doe',
            isConfirmed: false,
            rejectionReason: null,
            role: 'CLIENT',
          },
        },
        status: 'authenticated',
      })

      render(<PendingPage />)

      const homeLink = screen.getByRole('link', { name: /back to home/i })
      expect(homeLink).toBeInTheDocument()
      expect(homeLink).toHaveAttribute('href', '/')
    })
  })

  describe('Rejected Page', () => {
    it('should render loading state when session is loading', () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'loading',
      })

      render(<RejectedPage />)

      // Should show loading spinner
      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('should redirect to signin when user is not authenticated', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
      })

      render(<RejectedPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/signin')
      })
    })

    it('should redirect to dashboard when user is confirmed', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            name: 'John Doe',
            isConfirmed: true,
            role: 'CLIENT',
          },
        },
        status: 'authenticated',
      })

      render(<RejectedPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('should redirect to pending page when user is pending', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            name: 'John Doe',
            isConfirmed: false,
            rejectionReason: null,
            role: 'CLIENT',
          },
        },
        status: 'authenticated',
      })

      render(<RejectedPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/pending')
      })
    })

    it('should display rejected page content for rejected users', () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            name: 'John Doe',
            isConfirmed: false,
            rejectionReason: 'Incomplete profile information',
            role: 'CLIENT',
          },
        },
        status: 'authenticated',
      })

      render(<RejectedPage />)

      expect(screen.getByText('Application Not Approved')).toBeInTheDocument()
      expect(screen.getByText(/We appreciate your interest in SamAdvisoryHub/)).toBeInTheDocument()
      expect(screen.getByText('Review Decision')).toBeInTheDocument()
      expect(screen.getByText('Understanding Our Decision')).toBeInTheDocument()
      expect(screen.getByText('What You Can Do')).toBeInTheDocument()
    })

    it('should display rejection reason', () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            name: 'John Doe',
            isConfirmed: false,
            rejectionReason: 'Incomplete profile information',
            role: 'CLIENT',
          },
        },
        status: 'authenticated',
      })

      render(<RejectedPage />)

      expect(screen.getByText('Incomplete profile information')).toBeInTheDocument()
    })

    it('should display alternative resources', () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            name: 'John Doe',
            isConfirmed: false,
            rejectionReason: 'Incomplete profile information',
            role: 'CLIENT',
          },
        },
        status: 'authenticated',
      })

      render(<RejectedPage />)

      expect(screen.getByText('Alternative Resources')).toBeInTheDocument()
      expect(screen.getByText('Professional Networks')).toBeInTheDocument()
      expect(screen.getByText('Online Learning')).toBeInTheDocument()
      expect(screen.getByText('Industry Events')).toBeInTheDocument()
    })

    it('should display contact support and action links', () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            name: 'John Doe',
            isConfirmed: false,
            rejectionReason: 'Incomplete profile information',
            role: 'CLIENT',
          },
        },
        status: 'authenticated',
      })

      render(<RejectedPage />)

      const supportLink = screen.getByRole('link', { name: /contact support/i })
      const newAccountLink = screen.getByRole('link', { name: /create new account/i })
      const homeLink = screen.getByRole('link', { name: /back to home/i })

      expect(supportLink).toBeInTheDocument()
      expect(supportLink).toHaveAttribute('href', 'mailto:support@mentorshiphub.com')
      expect(newAccountLink).toBeInTheDocument()
      expect(newAccountLink).toHaveAttribute('href', '/auth/signup')
      expect(homeLink).toBeInTheDocument()
      expect(homeLink).toHaveAttribute('href', '/')
    })
  })

  describe('User Status Components', () => {
    it('should display user name in pending page', () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            name: 'John Doe',
            isConfirmed: false,
            rejectionReason: null,
            role: 'CLIENT',
          },
        },
        status: 'authenticated',
      })

      render(<PendingPage />)

      // The user name should be displayed in the welcome message
      expect(screen.getByText(/Thank you for joining SamAdvisoryHub!/)).toBeInTheDocument()
    })

    it('should display user name in rejected page', () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            name: 'John Doe',
            isConfirmed: false,
            rejectionReason: 'Incomplete profile information',
            role: 'CLIENT',
          },
        },
        status: 'authenticated',
      })

      render(<RejectedPage />)

      // The user name should be displayed in the rejection message
      expect(screen.getByText(/We appreciate your interest in SamAdvisoryHub/)).toBeInTheDocument()
    })

    it('should handle missing user name gracefully', () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            name: null,
            isConfirmed: false,
            rejectionReason: null,
            role: 'CLIENT',
          },
        },
        status: 'authenticated',
      })

      render(<PendingPage />)

      // Should still render without crashing
      expect(screen.getByText('Account Under Review')).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should render mobile-friendly layout', () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            name: 'John Doe',
            isConfirmed: false,
            rejectionReason: null,
            role: 'CLIENT',
          },
        },
        status: 'authenticated',
      })

      render(<PendingPage />)

      // Check for responsive classes
      const container = screen.getByText('Account Under Review').closest('div')
      expect(container).toHaveClass('text-center')
    })

    it('should display proper spacing and typography', () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            name: 'John Doe',
            isConfirmed: false,
            rejectionReason: null,
            role: 'CLIENT',
          },
        },
        status: 'authenticated',
      })

      render(<PendingPage />)

      // Check for proper heading hierarchy
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Account Under Review')
      expect(screen.getAllByRole('heading', { level: 2 })[0]).toHaveTextContent("What's Happening?")
    })
  })

  describe('Loading States', () => {
    it('should show loading spinner during session loading', () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'loading',
      })

      render(<PendingPage />)

      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('should show loading spinner during session loading for rejected page', () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'loading',
      })

      render(<RejectedPage />)

      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle session errors gracefully', () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'error',
      })

      render(<PendingPage />)

      // Should redirect to signin on error
      expect(mockPush).toHaveBeenCalledWith('/auth/signin')
    })

    it('should handle missing user data gracefully', () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: null,
        },
        status: 'authenticated',
      })

      render(<PendingPage />)

      // Should redirect to signin when user data is missing
      expect(mockPush).toHaveBeenCalledWith('/auth/signin')
    })
  })
})
