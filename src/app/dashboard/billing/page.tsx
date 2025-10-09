'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MessageCircle, CreditCard, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DashboardCard from '@/components/dashboard/DashboardCard'

export default function BillingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  const handleMessageAdmin = () => {
    router.push('/dashboard/messages')
  }

  if (status === 'loading') {
    return (
      <DashboardLayout
        title="Billing & Payments"
        description="Get pricing information for our services"
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Billing & Payments"
      description="Get pricing information for our services"
    >
      <div className="space-y-6">
        {/* Main Message Card */}
        <DashboardCard>
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-10 h-10 text-primary" />
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Get Custom Pricing for Your Services
            </h2>
            
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Please message the admin to get the price for your services. We offer personalized pricing based on your specific needs and requirements.
            </p>
            
            <Button 
              onClick={handleMessageAdmin}
              className="inline-flex items-center px-6 py-3 text-lg"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Message Admin for Pricing
            </Button>
          </div>
        </DashboardCard>

        {/* Coming Soon Card */}
        <DashboardCard>
          <div className="flex items-center space-x-4 p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Stripe Integration Coming Soon
              </h3>
              <p className="text-muted-foreground">
                We're working on integrating Stripe for seamless online payments. 
                In the meantime, please contact the admin directly for payment arrangements.
              </p>
            </div>
            <div className="flex items-center text-blue-600">
              <Clock className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Coming Soon</span>
            </div>
          </div>
        </DashboardCard>

        {/* Services Overview */}
        <DashboardCard title="Available Services">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Mentorship Programs</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Personalized guidance and support for your professional development
              </p>
              <p className="text-sm font-medium text-primary">Contact admin for pricing</p>
            </div>
            
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Advisory Services</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Expert consultation on business strategy and decision-making
              </p>
              <p className="text-sm font-medium text-primary">Contact admin for pricing</p>
            </div>
            
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Team Upskilling</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Comprehensive training programs for your team's growth
              </p>
              <p className="text-sm font-medium text-primary">Contact admin for pricing</p>
            </div>
          </div>
        </DashboardCard>
      </div>
    </DashboardLayout>
  )
}


