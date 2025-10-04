import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import PendingUsersPage from '@/app/admin/users/pending/page'
import UserManagementTable from '@/components/admin/UserManagementTable'
import UserApprovalModal from '@/components/admin/UserApprovalModal'
import UserRejectionModal from '@/components/admin/UserRejectionModal'

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

// Mock fetch for API calls
global.fetch = jest.fn()

describe('Admin User Management Tests', () => {
  const mockPush = jest.fn()
  const mockRouter = {
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }

  const mockPendingUsers = [
    {
      id: 'user-1',
      email: 'john@example.com',
      name: 'John Doe',
      createdAt: '2025-10-01T10:00:00Z',
      role: 'CLIENT',
      isConfirmed: false,
      confirmedAt: null,
      confirmedBy: null,
      rejectionReason: null,
    },
    {
      id: 'user-2',
      email: 'jane@example.com',
      name: 'Jane Smith',
      createdAt: '2025-10-02T14:30:00Z',
      role: 'CLIENT',
      isConfirmed: false,
      confirmedAt: null,
      confirmedBy: null,
      rejectionReason: null,
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        users: mockPendingUsers,
        stats: {
          totalPending: 2,
          approvedToday: 0,
          rejectedToday: 0,
          totalUsers: 10,
        },
      }),
    })
  })

  describe('Pending Users Page', () => {
    it('should render loading state when session is loading', () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'loading',
      })

      render(<PendingUsersPage />)

      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('should redirect to signin when user is not authenticated', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
      })

      render(<PendingUsersPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/signin')
      })
    })

    it('should redirect to dashboard when user is not admin', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            role: 'CLIENT',
            isConfirmed: true,
          },
        },
        status: 'authenticated',
      })

      render(<PendingUsersPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('should display pending users page for admin users', () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'admin-123',
            email: 'admin@mentorshiphub.com',
            role: 'ADMIN',
            isConfirmed: true,
          },
        },
        status: 'authenticated',
      })

      render(<PendingUsersPage />)

      expect(screen.getByText('Pending User Approvals')).toBeInTheDocument()
      expect(screen.getByText('Review and approve user registrations')).toBeInTheDocument()
    })

    it('should display pending users table', () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'admin-123',
            email: 'admin@mentorshiphub.com',
            role: 'ADMIN',
            isConfirmed: true,
          },
        },
        status: 'authenticated',
      })

      render(<PendingUsersPage />)

      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getByText('User')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Registered')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })

    it('should display refresh button', () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'admin-123',
            email: 'admin@mentorshiphub.com',
            role: 'ADMIN',
            isConfirmed: true,
          },
        },
        status: 'authenticated',
      })

      render(<PendingUsersPage />)

      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      expect(refreshButton).toBeInTheDocument()
    })
  })

  describe('User Management Table', () => {
    it('should display user data correctly', () => {
      render(<UserManagementTable users={mockPendingUsers} onApprove={jest.fn()} onReject={jest.fn()} />)

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    })

    it('should display action buttons for each user', () => {
      render(<UserManagementTable users={mockPendingUsers} onApprove={jest.fn()} onReject={jest.fn()} />)

      const approveButtons = screen.getAllByRole('button', { name: /approve/i })
      const rejectButtons = screen.getAllByRole('button', { name: /reject/i })

      expect(approveButtons).toHaveLength(2)
      expect(rejectButtons).toHaveLength(2)
    })

    it('should call onApprove when approve button is clicked', () => {
      const mockOnApprove = jest.fn()
      render(<UserManagementTable users={mockPendingUsers} onApprove={mockOnApprove} onReject={jest.fn()} />)

      const approveButton = screen.getAllByRole('button', { name: /approve/i })[0]
      fireEvent.click(approveButton)

      expect(mockOnApprove).toHaveBeenCalledWith('user-1')
    })

    it('should call onReject when reject button is clicked', () => {
      const mockOnReject = jest.fn()
      render(<UserManagementTable users={mockPendingUsers} onApprove={jest.fn()} onReject={mockOnReject} />)

      const rejectButton = screen.getAllByRole('button', { name: /reject/i })[0]
      fireEvent.click(rejectButton)

      expect(mockOnReject).toHaveBeenCalledWith('user-1')
    })

    it('should display empty state when no users', () => {
      render(<UserManagementTable users={[]} onApprove={jest.fn()} onReject={jest.fn()} />)

      expect(screen.getByText('No pending users')).toBeInTheDocument()
      expect(screen.getByText('All user registrations have been reviewed')).toBeInTheDocument()
    })

    it('should format dates correctly', () => {
      render(<UserManagementTable users={mockPendingUsers} onApprove={jest.fn()} onReject={jest.fn()} />)

      // Check that dates are displayed (format may vary based on implementation)
      expect(screen.getByText(/Oct 1, 2025/)).toBeInTheDocument()
      expect(screen.getByText(/Oct 2, 2025/)).toBeInTheDocument()
    })
  })

  describe('User Approval Modal', () => {
    it('should render approval modal when open', () => {
      const mockUser = mockPendingUsers[0]
      render(
        <UserApprovalModal
          isOpen={true}
          user={mockUser}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
        />
      )

      expect(screen.getByText('Approve User')).toBeInTheDocument()
      expect(screen.getByText(`Approve ${mockUser.name}?`)).toBeInTheDocument()
      expect(screen.getByText(mockUser.email)).toBeInTheDocument()
    })

    it('should call onClose when cancel button is clicked', () => {
      const mockOnClose = jest.fn()
      const mockUser = mockPendingUsers[0]
      render(
        <UserApprovalModal
          isOpen={true}
          user={mockUser}
          onClose={mockOnClose}
          onConfirm={jest.fn()}
        />
      )

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should call onConfirm when approve button is clicked', () => {
      const mockOnConfirm = jest.fn()
      const mockUser = mockPendingUsers[0]
      render(
        <UserApprovalModal
          isOpen={true}
          user={mockUser}
          onClose={jest.fn()}
          onConfirm={mockOnConfirm}
        />
      )

      const approveButton = screen.getByRole('button', { name: /approve/i })
      fireEvent.click(approveButton)

      expect(mockOnConfirm).toHaveBeenCalledWith(mockUser.id)
    })

    it('should not render when closed', () => {
      const mockUser = mockPendingUsers[0]
      render(
        <UserApprovalModal
          isOpen={false}
          user={mockUser}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
        />
      )

      expect(screen.queryByText('Approve User')).not.toBeInTheDocument()
    })
  })

  describe('User Rejection Modal', () => {
    it('should render rejection modal when open', () => {
      const mockUser = mockPendingUsers[0]
      render(
        <UserRejectionModal
          isOpen={true}
          user={mockUser}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
        />
      )

      expect(screen.getByText('Reject User')).toBeInTheDocument()
      expect(screen.getByText(`Reject ${mockUser.name}?`)).toBeInTheDocument()
      expect(screen.getByText(mockUser.email)).toBeInTheDocument()
    })

    it('should display rejection reason input', () => {
      const mockUser = mockPendingUsers[0]
      render(
        <UserRejectionModal
          isOpen={true}
          user={mockUser}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
        />
      )

      expect(screen.getByLabelText(/rejection reason/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/enter reason for rejection/i)).toBeInTheDocument()
    })

    it('should call onClose when cancel button is clicked', () => {
      const mockOnClose = jest.fn()
      const mockUser = mockPendingUsers[0]
      render(
        <UserRejectionModal
          isOpen={true}
          user={mockUser}
          onClose={mockOnClose}
          onConfirm={jest.fn()}
        />
      )

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should call onConfirm with reason when reject button is clicked', () => {
      const mockOnConfirm = jest.fn()
      const mockUser = mockPendingUsers[0]
      render(
        <UserRejectionModal
          isOpen={true}
          user={mockUser}
          onClose={jest.fn()}
          onConfirm={mockOnConfirm}
        />
      )

      const reasonInput = screen.getByLabelText(/rejection reason/i)
      fireEvent.change(reasonInput, { target: { value: 'Incomplete profile' } })

      const rejectButton = screen.getByRole('button', { name: /reject/i })
      fireEvent.click(rejectButton)

      expect(mockOnConfirm).toHaveBeenCalledWith(mockUser.id, 'Incomplete profile')
    })

    it('should disable reject button when reason is empty', () => {
      const mockUser = mockPendingUsers[0]
      render(
        <UserRejectionModal
          isOpen={true}
          user={mockUser}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
        />
      )

      const rejectButton = screen.getByRole('button', { name: /reject/i })
      expect(rejectButton).toBeDisabled()
    })

    it('should enable reject button when reason is provided', () => {
      const mockUser = mockPendingUsers[0]
      render(
        <UserRejectionModal
          isOpen={true}
          user={mockUser}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
        />
      )

      const reasonInput = screen.getByLabelText(/rejection reason/i)
      fireEvent.change(reasonInput, { target: { value: 'Incomplete profile' } })

      const rejectButton = screen.getByRole('button', { name: /reject/i })
      expect(rejectButton).not.toBeDisabled()
    })

    it('should not render when closed', () => {
      const mockUser = mockPendingUsers[0]
      render(
        <UserRejectionModal
          isOpen={false}
          user={mockUser}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
        />
      )

      expect(screen.queryByText('Reject User')).not.toBeInTheDocument()
    })
  })

  describe('Admin Dashboard Integration', () => {
    it('should display admin navigation', () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'admin-123',
            email: 'admin@mentorshiphub.com',
            role: 'ADMIN',
            isConfirmed: true,
          },
        },
        status: 'authenticated',
      })

      render(<PendingUsersPage />)

      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Pending Users')).toBeInTheDocument()
    })

    it('should display user statistics', () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'admin-123',
            email: 'admin@mentorshiphub.com',
            role: 'ADMIN',
            isConfirmed: true,
          },
        },
        status: 'authenticated',
      })

      render(<PendingUsersPage />)

      expect(screen.getByText(/Total Pending/)).toBeInTheDocument()
      expect(screen.getByText(/Approved Today/)).toBeInTheDocument()
      expect(screen.getByText(/Rejected Today/)).toBeInTheDocument()
    })

    it('should handle loading states', () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'admin-123',
            email: 'admin@mentorshiphub.com',
            role: 'ADMIN',
            isConfirmed: true,
          },
        },
        status: 'authenticated',
      })

      render(<PendingUsersPage />)

      // Should show loading state initially
      const loadingSpinner = document.querySelector('.animate-spin')
      expect(loadingSpinner).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'admin-123',
            email: 'admin@mentorshiphub.com',
            role: 'ADMIN',
            isConfirmed: true,
          },
        },
        status: 'authenticated',
      })

      // Mock API error
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'))

      render(<PendingUsersPage />)

      await waitFor(() => {
        expect(screen.getByText(/error loading users/i)).toBeInTheDocument()
      })
    })

    it('should handle approval errors', async () => {
      const mockOnApprove = jest.fn().mockRejectedValue(new Error('Approval failed'))
      render(<UserManagementTable users={mockPendingUsers} onApprove={mockOnApprove} onReject={jest.fn()} />)

      const approveButton = screen.getAllByRole('button', { name: /approve/i })[0]
      fireEvent.click(approveButton)

      await waitFor(() => {
        expect(screen.getByText(/error approving user/i)).toBeInTheDocument()
      })
    })

    it('should handle rejection errors', async () => {
      const mockOnReject = jest.fn().mockRejectedValue(new Error('Rejection failed'))
      render(<UserManagementTable users={mockPendingUsers} onApprove={jest.fn()} onReject={mockOnReject} />)

      const rejectButton = screen.getAllByRole('button', { name: /reject/i })[0]
      fireEvent.click(rejectButton)

      await waitFor(() => {
        expect(screen.getByText(/error rejecting user/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<UserManagementTable users={mockPendingUsers} onApprove={jest.fn()} onReject={jest.fn()} />)

      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getByLabelText(/user management table/i)).toBeInTheDocument()
    })

    it('should support keyboard navigation', () => {
      render(<UserManagementTable users={mockPendingUsers} onApprove={jest.fn()} onReject={jest.fn()} />)

      const approveButton = screen.getAllByRole('button', { name: /approve/i })[0]
      expect(approveButton).toHaveAttribute('tabIndex', '0')
    })

    it('should have proper focus management in modals', () => {
      const mockUser = mockPendingUsers[0]
      render(
        <UserApprovalModal
          isOpen={true}
          user={mockUser}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
        />
      )

      const modal = screen.getByRole('dialog')
      expect(modal).toHaveAttribute('aria-modal', 'true')
    })
  })
})
