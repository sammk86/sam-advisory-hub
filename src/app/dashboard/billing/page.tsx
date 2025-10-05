'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { CreditCard, Download, Eye, Plus, Calendar, DollarSign, FileText, AlertCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DashboardCard from '@/components/dashboard/DashboardCard'
import StatusBadge from '@/components/ui/StatusBadge'

interface Payment {
  id: string
  amount: number
  currency: string
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED'
  description: string
  paidAt: string
  paymentMethod: string
  transactionId: string
}

interface Invoice {
  id: string
  number: string
  amount: number
  currency: string
  status: 'PAID' | 'PENDING' | 'OVERDUE'
  dueDate: string
  paidAt?: string
  downloadUrl: string
}

interface Subscription {
  id: string
  planName: string
  status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE'
  currentPeriodStart: string
  currentPeriodEnd: string
  amount: number
  currency: string
  nextBillingDate: string
}

export default function BillingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchBillingData()
  }, [session, status, router])

  const fetchBillingData = async () => {
    try {
      const [paymentsRes, invoicesRes, subscriptionRes] = await Promise.all([
        fetch('/api/payments'),
        fetch('/api/payments/invoices'),
        fetch('/api/subscription')
      ])

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json()
        setPayments(paymentsData.payments || [])
      }

      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json()
        setInvoices(invoicesData.invoices || [])
      }

      if (subscriptionRes.ok) {
        const subscriptionData = await subscriptionRes.json()
        setSubscription(subscriptionData.subscription)
      }
    } catch (error) {
      console.error('Error fetching billing data:', error)
      // Mock data for development
      setPayments([
        {
          id: 'pay-1',
          amount: 999.99,
          currency: 'USD',
          status: 'COMPLETED',
          description: 'Mentorship Program - Pro Plan',
          paidAt: '2024-01-15T10:00:00Z',
          paymentMethod: 'Visa ending in 4242',
          transactionId: 'pi_1234567890abcdef'
        },
        {
          id: 'pay-2',
          amount: 499.99,
          currency: 'USD',
          status: 'COMPLETED',
          description: 'Advisory Services - 4 hours',
          paidAt: '2024-01-10T14:30:00Z',
          paymentMethod: 'Visa ending in 4242',
          transactionId: 'pi_abcdef1234567890'
        }
      ])

      setInvoices([
        {
          id: 'inv-1',
          number: 'INV-2024-001',
          amount: 999.99,
          currency: 'USD',
          status: 'PAID',
          dueDate: '2024-01-15T00:00:00Z',
          paidAt: '2024-01-15T10:00:00Z',
          downloadUrl: '/api/invoices/inv-1/download'
        },
        {
          id: 'inv-2',
          number: 'INV-2024-002',
          amount: 499.99,
          currency: 'USD',
          status: 'PAID',
          dueDate: '2024-01-10T00:00:00Z',
          paidAt: '2024-01-10T14:30:00Z',
          downloadUrl: '/api/invoices/inv-2/download'
        }
      ])

      setSubscription({
        id: 'sub-1',
        planName: 'Mentorship Pro Plan',
        status: 'ACTIVE',
        currentPeriodStart: '2024-01-15T00:00:00Z',
        currentPeriodEnd: '2024-02-15T00:00:00Z',
        amount: 999.99,
        currency: 'USD',
        nextBillingDate: '2024-02-15T00:00:00Z'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice-${invoiceId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error downloading invoice:', error)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <DashboardLayout
        title="Billing & Payments"
        description="Manage your payments and subscriptions"
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Billing & Payments"
      description="Manage your payments and subscriptions"
      actions={
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Payment Method
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Current Subscription */}
        {subscription && (
          <DashboardCard title="Current Subscription">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{subscription.planName}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <StatusBadge status={subscription.status} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-medium">${subscription.amount} {subscription.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Next Billing</span>
                    <span className="font-medium">
                      {new Date(subscription.nextBillingDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-2">
                <Button variant="outline" className="w-full">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Update Payment Method
                </Button>
                <Button variant="outline" className="w-full">
                  Cancel Subscription
                </Button>
              </div>
            </div>
          </DashboardCard>
        )}

        {/* Recent Payments */}
        <DashboardCard title="Recent Payments">
          {payments.length > 0 ? (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{payment.description}</h4>
                      <p className="text-sm text-gray-600">
                        {payment.paymentMethod} • {new Date(payment.paidAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        ${payment.amount} {payment.currency}
                      </div>
                      <StatusBadge status={payment.status} size="sm" />
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Payments Yet</h3>
              <p className="text-gray-600">Your payment history will appear here</p>
            </div>
          )}
        </DashboardCard>

        {/* Invoices */}
        <DashboardCard title="Invoices">
          {invoices.length > 0 ? (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Invoice {invoice.number}</h4>
                      <p className="text-sm text-gray-600">
                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                        {invoice.paidAt && ` • Paid: ${new Date(invoice.paidAt).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        ${invoice.amount} {invoice.currency}
                      </div>
                      <StatusBadge status={invoice.status} size="sm" />
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadInvoice(invoice.id)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Invoices Yet</h3>
              <p className="text-gray-600">Your invoices will appear here</p>
            </div>
          )}
        </DashboardCard>

        {/* Payment Methods */}
        <DashboardCard title="Payment Methods">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Visa ending in 4242</h4>
                  <p className="text-sm text-gray-600">Expires 12/25</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-green-600 font-medium">Default</span>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
            </div>
            
            <Button variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add New Payment Method
            </Button>
          </div>
        </DashboardCard>

        {/* Billing Information */}
        <DashboardCard title="Billing Information">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Billing Address</h4>
              <p className="text-gray-600">
                123 Main Street<br />
                San Francisco, CA 94105<br />
                United States
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Tax Information</h4>
              <p className="text-gray-600">
                Tax ID: 12-3456789<br />
                Business Type: Individual
              </p>
            </div>
          </div>
          <Button variant="outline" className="mt-4">
            Update Billing Information
          </Button>
        </DashboardCard>
      </div>
    </DashboardLayout>
  )
}


