import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import PendingPage from '@/app/pending/page'
import RejectedPage from '@/app/rejected/page'
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
    return React.createElement('a', { href }, children)
  }
})

// Mock fetch for API calls
global.fetch = jest.fn()

describe('User Confirmation System Integration Tests', () => {
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

  describe('Complete User Registration to Confirmation Flow', () => {
    it('should handle new user registration to pending state', async () => {
      // Simulate new user registration
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'new-user-1',
            email: 'newuser@example.com',
            name: 'New User',
            role: 'CLIENT',
            isConfirmed: false,
            rejectionReason: null,
          },
        },
        status: 'authenticated',
      })

      render(<PendingPage />)

      expect(screen.getByText('Account Under Review')).toBeInTheDocument()
      expect(screen.getByText('Thank you for joining MentorshipHub!')).toBeInTheDocument()
      expect(screen.getByText("What's Happening?")).toBeInTheDocument()
    })

    it('should handle user approval flow', async () => {
      // Simulate admin session
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'admin-1',
            email: 'admin@mentorshiphub.com',
            role: 'ADMIN',
            isConfirmed: true,
          },
        },
        status: 'authenticated',
      })

      render(<PendingUsersPage />)

      expect(screen.getByText('Pending User Approvals')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    it('should handle user rejection flow', async () => {
      // Simulate rejected user session
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'rejected-user-1',
            email: 'rejected@example.com',
            name: 'Rejected User',
            role: 'CLIENT',
            isConfirmed: false,
            rejectionReason: 'Incomplete profile information',
          },
        },
        status: 'authenticated',
      })

      render(<RejectedPage />)

      expect(screen.getByText('Application Not Approved')).toBeInTheDocument()
      expect(screen.getByText('Incomplete profile information')).toBeInTheDocument()
      expect(screen.getByText('Alternative Resources')).toBeInTheDocument()
    })
  })

  describe('Admin User Management Integration', () => {
    it('should allow admin to approve users', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'admin-1',
            email: 'admin@mentorshiphub.com',
            role: 'ADMIN',
            isConfirmed: true,
          },
        },
        status: 'authenticated',
      })

      // Mock successful approval API call
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          users: mockPendingUsers,
          stats: { totalPending: 2, approvedToday: 0, rejectedToday: 0, totalUsers: 10 },
        }),
      }).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          message: 'User confirmed successfully',
          user: { ...mockPendingUsers[0], isConfirmed: true },
        }),
      })

      render(<PendingUsersPage />)

      // Wait for users to load
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      // Find and click approve button
      const approveButtons = screen.getAllByRole('button', { name: /approve/i })
      fireEvent.click(approveButtons[0])

      // Should show approval modal
      await waitFor(() => {
        expect(screen.getByText('Approve User')).toBeInTheDocument()
      })

      // Click confirm approval
      const confirmButton = screen.getByRole('button', { name: /approve user/i })
      fireEvent.click(confirmButton)

      // Should call approval API
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/admin/users/user-1/confirm',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining('admin-1'),
          })
        )
      })
    })

    it('should allow admin to reject users with reason', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'admin-1',
            email: 'admin@mentorshiphub.com',
            role: 'ADMIN',
            isConfirmed: true,
          },
        },
        status: 'authenticated',
      })

      // Mock successful rejection API call
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          users: mockPendingUsers,
          stats: { totalPending: 2, approvedToday: 0, rejectedToday: 0, totalUsers: 10 },
        }),
      }).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          message: 'User rejected successfully',
          user: { ...mockPendingUsers[0], rejectionReason: 'Incomplete profile' },
        }),
      })

      render(<PendingUsersPage />)

      // Wait for users to load
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      // Find and click reject button
      const rejectButtons = screen.getAllByRole('button', { name: /reject/i })
      fireEvent.click(rejectButtons[0])

      // Should show rejection modal
      await waitFor(() => {
        expect(screen.getByText('Reject User')).toBeInTheDocument()
      })

      // Enter rejection reason
      const reasonInput = screen.getByLabelText(/rejection reason/i)
      fireEvent.change(reasonInput, { target: { value: 'Incomplete profile information' } })

      // Click confirm rejection
      const confirmButton = screen.getByRole('button', { name: /reject user/i })
      fireEvent.click(confirmButton)

      // Should call rejection API
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/admin/users/user-1/reject',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining('Incomplete profile information'),
          })
        )
      })
    })
  })

  describe('User Status Transitions', () => {
    it('should redirect pending users to dashboard after approval', async () => {
      // Simulate user who was just approved
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'approved-user-1',
            email: 'approved@example.com',
            name: 'Approved User',
            role: 'CLIENT',
            isConfirmed: true,
            rejectionReason: null,
          },
        },
        status: 'authenticated',
      })

      render(<PendingPage />)

      // Should redirect to dashboard
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('should redirect confirmed users away from pending page', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'confirmed-user-1',
            email: 'confirmed@example.com',
            name: 'Confirmed User',
            role: 'CLIENT',
            isConfirmed: true,
            rejectionReason: null,
          },
        },
        status: 'authenticated',
      })

      render(<PendingPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('should redirect rejected users away from pending page', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'rejected-user-1',
            email: 'rejected@example.com',
            name: 'Rejected User',
            role: 'CLIENT',
            isConfirmed: false,
            rejectionReason: 'Incomplete profile',
          },
        },
        status: 'authenticated',
      })

      render(<PendingPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/rejected')
      })
    })
  })

  describe('Error Handling Integration', () => {
    it('should handle API errors during user approval', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'admin-1',
            email: 'admin@mentorshiphub.com',
            role: 'ADMIN',
            isConfirmed: true,
          },
        },
        status: 'authenticated',
      })

      // Mock API error
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          users: mockPendingUsers,
          stats: { totalPending: 2, approvedToday: 0, rejectedToday: 0, totalUsers: 10 },
        }),
      }).mockRejectedValueOnce(new Error('API Error'))

      render(<PendingUsersPage />)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      const approveButtons = screen.getAllByRole('button', { name: /approve/i })
      fireEvent.click(approveButtons[0])

      await waitFor(() => {
        expect(screen.getByText('Approve User')).toBeInTheDocument()
      })

      const confirmButton = screen.getByRole('button', { name: /approve user/i })
      fireEvent.click(confirmButton)

      // Should handle error gracefully
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument()
      })
    })

    it('should handle network errors during user rejection', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'admin-1',
            email: 'admin@mentorshiphub.com',
            role: 'ADMIN',
            isConfirmed: true,
          },
        },
        status: 'authenticated',
      })

      // Mock network error
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          users: mockPendingUsers,
          stats: { totalPending: 2, approvedToday: 0, rejectedToday: 0, totalUsers: 10 },
        }),
      }).mockRejectedValueOnce(new Error('Network Error'))

      render(<PendingUsersPage />)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      const rejectButtons = screen.getAllByRole('button', { name: /reject/i })
      fireEvent.click(rejectButtons[0])

      await waitFor(() => {
        expect(screen.getByText('Reject User')).toBeInTheDocument()
      })

      const reasonInput = screen.getByLabelText(/rejection reason/i)
      fireEvent.change(reasonInput, { target: { value: 'Test rejection reason' } })

      const confirmButton = screen.getByRole('button', { name: /reject user/i })
      fireEvent.click(confirmButton)

      // Should handle error gracefully
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument()
      })
    })
  })

  describe('Authentication State Integration', () => {
    it('should redirect unauthenticated users to signin', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
      })

      render(<PendingPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/signin')
      })
    })

    it('should handle loading states', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'loading',
      })

      render(<PendingPage />)

      expect(screen.getByText('Loading your account status...')).toBeInTheDocument()
    })
  })

  describe('Email Notification Integration', () => {
    it('should trigger email notifications on user approval', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'admin-1',
            email: 'admin@mentorshiphub.com',
            role: 'ADMIN',
            isConfirmed: true,
          },
        },
        status: 'authenticated',
      })

      // Mock successful approval with email
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          users: mockPendingUsers,
          stats: { totalPending: 2, approvedToday: 0, rejectedToday: 0, totalUsers: 10 },
        }),
      }).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          message: 'User confirmed successfully',
          user: { ...mockPendingUsers[0], isConfirmed: true },
        }),
      })

      render(<PendingUsersPage />)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      const approveButtons = screen.getAllByRole('button', { name: /approve/i })
      fireEvent.click(approveButtons[0])

      await waitFor(() => {
        expect(screen.getByText('Approve User')).toBeInTheDocument()
      })

      const confirmButton = screen.getByRole('button', { name: /approve user/i })
      fireEvent.click(confirmButton)

      // Should call API which triggers email
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/admin/users/user-1/confirm',
          expect.any(Object)
        )
      })
    })
  })
})
