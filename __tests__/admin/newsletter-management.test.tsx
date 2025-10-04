import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewsletterDashboard from '@/components/admin/NewsletterDashboard'
import SubscriberManagement from '@/components/admin/SubscriberManagement'
import CampaignManagement from '@/components/admin/CampaignManagement'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}))

// Mock fetch
global.fetch = jest.fn()

describe('Admin Newsletter Management Components', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockClear()
  })

  describe('NewsletterDashboard', () => {
    const mockAnalytics = {
      totalSubscribers: 1250,
      activeSubscribers: 1100,
      unsubscribedCount: 100,
      totalCampaigns: 15,
      averageOpenRate: 25.5,
      averageClickRate: 8.2,
      recentCampaigns: [
        {
          id: '1',
          title: 'Weekly Career Tips',
          sentAt: '2025-01-15T10:00:00Z',
          openRate: 28.5,
          clickRate: 9.1,
        },
        {
          id: '2',
          title: 'Mentorship Program Updates',
          sentAt: '2025-01-08T10:00:00Z',
          openRate: 22.3,
          clickRate: 7.2,
        },
      ],
    }

    it('should render newsletter dashboard with metrics', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalytics,
      })

      render(<NewsletterDashboard />)

      await waitFor(() => {
        expect(screen.getByText('1,250')).toBeInTheDocument() // Total subscribers
        expect(screen.getByText('1,100')).toBeInTheDocument() // Active subscribers
        expect(screen.getByText('15')).toBeInTheDocument() // Total campaigns
        expect(screen.getByText('25.5%')).toBeInTheDocument() // Average open rate
        expect(screen.getByText('8.2%')).toBeInTheDocument() // Average click rate
      })
    })

    it('should display recent campaigns', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalytics,
      })

      render(<NewsletterDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Weekly Career Tips')).toBeInTheDocument()
        expect(screen.getByText('Mentorship Program Updates')).toBeInTheDocument()
        expect(screen.getByText('28.5%')).toBeInTheDocument() // Open rate
        expect(screen.getByText('9.1%')).toBeInTheDocument() // Click rate
      })
    })

    it('should show loading state initially', () => {
      ;(fetch as jest.Mock).mockImplementationOnce(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      render(<NewsletterDashboard />)

      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    it('should handle analytics fetch error', async () => {
      ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'))

      render(<NewsletterDashboard />)

      await waitFor(() => {
        expect(screen.getByText(/error loading analytics/i)).toBeInTheDocument()
      })
    })

    it('should have quick action buttons', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalytics,
      })

      render(<NewsletterDashboard />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create campaign/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /view subscribers/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /view campaigns/i })).toBeInTheDocument()
      })
    })
  })

  describe('SubscriberManagement', () => {
    const mockSubscribers = [
      {
        id: '1',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        status: 'ACTIVE',
        subscribedAt: '2025-01-01T00:00:00Z',
        interests: ['software-engineering', 'leadership'],
        totalEmailsReceived: 5,
        totalEmailsOpened: 4,
        totalEmailsClicked: 2,
      },
      {
        id: '2',
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        status: 'UNSUBSCRIBED',
        subscribedAt: '2025-01-02T00:00:00Z',
        unsubscribedAt: '2025-01-10T00:00:00Z',
        interests: ['career-transition'],
        totalEmailsReceived: 3,
        totalEmailsOpened: 2,
        totalEmailsClicked: 1,
      },
    ]

    it('should render subscriber list', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          subscribers: mockSubscribers,
          pagination: { page: 1, limit: 20, total: 2, pages: 1 },
        }),
      })

      render(<SubscriberManagement />)

      await waitFor(() => {
        expect(screen.getByText('john@example.com')).toBeInTheDocument()
        expect(screen.getByText('jane@example.com')).toBeInTheDocument()
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      })
    })

    it('should display subscriber status badges', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          subscribers: mockSubscribers,
          pagination: { page: 1, limit: 20, total: 2, pages: 1 },
        }),
      })

      render(<SubscriberManagement />)

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument()
        expect(screen.getByText('Unsubscribed')).toBeInTheDocument()
      })
    })

    it('should show subscriber engagement metrics', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          subscribers: mockSubscribers,
          pagination: { page: 1, limit: 20, total: 2, pages: 1 },
        }),
      })

      render(<SubscriberManagement />)

      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument() // Emails received
        expect(screen.getByText('4')).toBeInTheDocument() // Emails opened
        expect(screen.getByText('2')).toBeInTheDocument() // Emails clicked
      })
    })

    it('should filter subscribers by status', async () => {
      const user = userEvent.setup()
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          subscribers: mockSubscribers,
          pagination: { page: 1, limit: 20, total: 2, pages: 1 },
        }),
      })

      render(<SubscriberManagement />)

      await waitFor(() => {
        expect(screen.getByText('john@example.com')).toBeInTheDocument()
      })

      const statusFilter = screen.getByLabelText(/filter by status/i)
      await user.selectOptions(statusFilter, 'ACTIVE')

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('status=ACTIVE'),
          expect.any(Object)
        )
      })
    })

    it('should search subscribers by email', async () => {
      const user = userEvent.setup()
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          subscribers: mockSubscribers,
          pagination: { page: 1, limit: 20, total: 2, pages: 1 },
        }),
      })

      render(<SubscriberManagement />)

      const searchInput = screen.getByPlaceholderText(/search subscribers/i)
      await user.type(searchInput, 'john@example.com')

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('search=john@example.com'),
          expect.any(Object)
        )
      })
    })

    it('should handle bulk unsubscribe', async () => {
      const user = userEvent.setup()
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          subscribers: mockSubscribers,
          pagination: { page: 1, limit: 20, total: 2, pages: 1 },
        }),
      })

      render(<SubscriberManagement />)

      await waitFor(() => {
        expect(screen.getByText('john@example.com')).toBeInTheDocument()
      })

      // Select subscribers
      const checkboxes = screen.getAllByRole('checkbox')
      await user.click(checkboxes[1]) // Select first subscriber

      // Click bulk unsubscribe
      const bulkUnsubscribeBtn = screen.getByRole('button', { name: /bulk unsubscribe/i })
      await user.click(bulkUnsubscribeBtn)

      // Confirm action
      const confirmBtn = screen.getByRole('button', { name: /confirm/i })
      await user.click(confirmBtn)

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          '/api/admin/newsletter/subscribers/bulk-unsubscribe',
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('["1"]'),
          })
        )
      })
    })

    it('should export subscribers to CSV', async () => {
      const user = userEvent.setup()
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          subscribers: mockSubscribers,
          pagination: { page: 1, limit: 20, total: 2, pages: 1 },
        }),
      })

      render(<SubscriberManagement />)

      await waitFor(() => {
        expect(screen.getByText('john@example.com')).toBeInTheDocument()
      })

      const exportBtn = screen.getByRole('button', { name: /export csv/i })
      await user.click(exportBtn)

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/admin/newsletter/subscribers/export')
      })
    })
  })

  describe('CampaignManagement', () => {
    const mockCampaigns = [
      {
        id: '1',
        title: 'Weekly Career Tips',
        subject: 'Your weekly dose of career growth',
        status: 'SENT',
        sentAt: '2025-01-15T10:00:00Z',
        totalSent: 1000,
        totalOpened: 250,
        totalClicked: 80,
        totalUnsubscribed: 5,
        totalBounced: 2,
      },
      {
        id: '2',
        title: 'Mentorship Program Updates',
        subject: 'New mentorship opportunities available',
        status: 'DRAFT',
        createdAt: '2025-01-20T10:00:00Z',
        totalSent: 0,
        totalOpened: 0,
        totalClicked: 0,
        totalUnsubscribed: 0,
        totalBounced: 0,
      },
    ]

    it('should render campaign list', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          campaigns: mockCampaigns,
          pagination: { page: 1, limit: 20, total: 2, pages: 1 },
        }),
      })

      render(<CampaignManagement />)

      await waitFor(() => {
        expect(screen.getByText('Weekly Career Tips')).toBeInTheDocument()
        expect(screen.getByText('Mentorship Program Updates')).toBeInTheDocument()
        expect(screen.getByText('Your weekly dose of career growth')).toBeInTheDocument()
      })
    })

    it('should display campaign status badges', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          campaigns: mockCampaigns,
          pagination: { page: 1, limit: 20, total: 2, pages: 1 },
        }),
      })

      render(<CampaignManagement />)

      await waitFor(() => {
        expect(screen.getByText('Sent')).toBeInTheDocument()
        expect(screen.getByText('Draft')).toBeInTheDocument()
      })
    })

    it('should show campaign analytics', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          campaigns: mockCampaigns,
          pagination: { page: 1, limit: 20, total: 2, pages: 1 },
        }),
      })

      render(<CampaignManagement />)

      await waitFor(() => {
        expect(screen.getByText('1,000')).toBeInTheDocument() // Total sent
        expect(screen.getByText('250')).toBeInTheDocument() // Total opened
        expect(screen.getByText('80')).toBeInTheDocument() // Total clicked
        expect(screen.getByText('25.0%')).toBeInTheDocument() // Open rate
        expect(screen.getByText('8.0%')).toBeInTheDocument() // Click rate
      })
    })

    it('should filter campaigns by status', async () => {
      const user = userEvent.setup()
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          campaigns: mockCampaigns,
          pagination: { page: 1, limit: 20, total: 2, pages: 1 },
        }),
      })

      render(<CampaignManagement />)

      await waitFor(() => {
        expect(screen.getByText('Weekly Career Tips')).toBeInTheDocument()
      })

      const statusFilter = screen.getByLabelText(/filter by status/i)
      await user.selectOptions(statusFilter, 'SENT')

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('status=SENT'),
          expect.any(Object)
        )
      })
    })

    it('should create new campaign', async () => {
      const user = userEvent.setup()
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          campaigns: mockCampaigns,
          pagination: { page: 1, limit: 20, total: 2, pages: 1 },
        }),
      })

      render(<CampaignManagement />)

      const createBtn = screen.getByRole('button', { name: /create campaign/i })
      await user.click(createBtn)

      expect(screen.getByText(/create new campaign/i)).toBeInTheDocument()
    })

    it('should edit existing campaign', async () => {
      const user = userEvent.setup()
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          campaigns: mockCampaigns,
          pagination: { page: 1, limit: 20, total: 2, pages: 1 },
        }),
      })

      render(<CampaignManagement />)

      await waitFor(() => {
        expect(screen.getByText('Weekly Career Tips')).toBeInTheDocument()
      })

      // The edit button is a link, not a button with accessible name
      const editLink = screen.getByRole('link', { name: '' })
      expect(editLink).toHaveAttribute('href', '/admin/newsletter/campaigns/1/edit')
    })

    it('should send campaign', async () => {
      const user = userEvent.setup()
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          campaigns: mockCampaigns,
          pagination: { page: 1, limit: 20, total: 2, pages: 1 },
        }),
      })

      render(<CampaignManagement />)

      await waitFor(() => {
        expect(screen.getByText('Mentorship Program Updates')).toBeInTheDocument()
      })

      // The send button is an icon button without accessible name
      const sendBtn = screen.getByTitle('Send Campaign')
      await user.click(sendBtn)

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          '/api/admin/newsletter/campaigns/2/send',
          expect.objectContaining({
            method: 'POST',
          })
        )
      })
    })

    it('should delete campaign', async () => {
      const user = userEvent.setup()
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          campaigns: mockCampaigns,
          pagination: { page: 1, limit: 20, total: 2, pages: 1 },
        }),
      })

      render(<CampaignManagement />)

      await waitFor(() => {
        expect(screen.getByText('Mentorship Program Updates')).toBeInTheDocument()
      })

      // Get the second delete button (for the second campaign)
      const deleteBtns = screen.getAllByTitle('Delete Campaign')
      const deleteBtn = deleteBtns[1] // Second campaign
      await user.click(deleteBtn)

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          '/api/admin/newsletter/campaigns/2',
          expect.objectContaining({
            method: 'DELETE',
          })
        )
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'))

      render(<NewsletterDashboard />)

      await waitFor(() => {
        expect(screen.getByText(/error loading analytics/i)).toBeInTheDocument()
      })
    })

    it('should show retry button on error', async () => {
      ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'))

      render(<NewsletterDashboard />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
      })
    })

    it('should retry on button click', async () => {
      const user = userEvent.setup()
      ;(fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            data: { 
              totalSubscribers: 1000,
              activeSubscribers: 900,
              unsubscribedCount: 100,
              totalCampaigns: 5,
              averageOpenRate: 25.0,
              averageClickRate: 8.0,
              recentCampaigns: []
            }
          }),
        })

      render(<NewsletterDashboard />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
      })

      const retryBtn = screen.getByRole('button', { name: /retry/i })
      await user.click(retryBtn)

      await waitFor(() => {
        expect(screen.getByText('1,000')).toBeInTheDocument()
      })
    })
  })

  describe('Loading States', () => {
    it('should show loading skeleton while fetching data', () => {
      ;(fetch as jest.Mock).mockImplementationOnce(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      render(<NewsletterDashboard />)

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
    })

    it('should show loading state during bulk operations', async () => {
      const user = userEvent.setup()
      const mockSubscribers = [
        {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          status: 'ACTIVE',
          subscribedAt: '2025-01-01T00:00:00Z',
          interests: ['software-engineering'],
          source: 'footer',
          totalEmailsReceived: 5,
          totalEmailsOpened: 4,
          totalEmailsClicked: 2,
        }
      ]

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          subscribers: mockSubscribers,
          pagination: { page: 1, limit: 20, total: 1, pages: 1 },
        }),
      })

      render(<SubscriberManagement />)

      await waitFor(() => {
        expect(screen.getByText('test@example.com')).toBeInTheDocument()
      })

      // Select a subscriber first
      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      const bulkBtn = screen.getByRole('button', { name: /bulk unsubscribe/i })
      await user.click(bulkBtn)

      expect(screen.getByText(/processing/i)).toBeInTheDocument()
    })
  })
})
