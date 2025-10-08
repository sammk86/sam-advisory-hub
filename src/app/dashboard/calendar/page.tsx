'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Calendar, MessageCircle } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DashboardCard from '@/components/dashboard/DashboardCard'
import { Button } from '@/components/ui/button'

export default function CalendarPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sessionInactive, setSessionInactive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    checkSessionStatus()
  }, [session, status, router])

  const checkSessionStatus = async () => {
    try {
      const userResponse = await fetch('/api/users/me')
      if (userResponse.ok) {
        const userData = await userResponse.json()
        
        // If user session is not active, show message
        if (userData.user.sessionStatus !== 'ACTIVE') {
          setSessionInactive(true)
        }
      }
    } catch (error) {
      console.error('Error checking session status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (sessionInactive) return

    // Load Calendly widget
    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]')
      if (existingScript) {
        document.body.removeChild(existingScript)
      }
    }
  }, [sessionInactive])

  if (status === 'loading' || isLoading) {
    return (
      <DashboardLayout
        title="Calendar"
        description="Schedule your sessions with Sam"
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (sessionInactive) {
    return (
      <DashboardLayout
        title="Calendar"
        description="Schedule your sessions with Sam"
      >
        <DashboardCard>
          <div className="text-center py-12">
            <Calendar className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
            
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Calendar Access Not Available
            </h2>
            
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Your session access is currently inactive. Please contact the admin to activate your sessions after payment to access the calendar.
            </p>
            
            <Button 
              onClick={() => router.push('/dashboard/messages')}
              className="inline-flex items-center px-6 py-3 text-lg"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Contact Admin to Activate Sessions
            </Button>
          </div>
        </DashboardCard>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Calendar"
      description="Schedule your sessions with Sam"
    >
      <DashboardCard>
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Book a Session with Sam
            </h3>
            <p className="text-muted-foreground">
              Select a time that works for you to schedule your mentorship or advisory session.
            </p>
          </div>
          
          {/* Calendly inline widget */}
          <div
            className="calendly-inline-widget"
            data-url="https://calendly.com/sam-mokhtari87/meet-with-sam"
            style={{ minWidth: '320px', height: '700px' }}
          />
        </div>
      </DashboardCard>
    </DashboardLayout>
  )
}

