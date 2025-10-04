'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, AlertCircle, Users, Target, Calendar, CreditCard } from 'lucide-react'
import Button from '@/components/ui/Button'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import PageTransition from '@/components/animations/PageTransition'
import FadeIn from '@/components/animations/FadeIn'
import StaggerContainer from '@/components/animations/StaggerContainer'
import StaggerItem from '@/components/animations/StaggerItem'

interface Enrollment {
  id: string
  serviceId: string | null
  planType: string
  status: string
  goals: string
  experience: string
  industry: string
  createdAt: string
  service?: {
    id: string
    type: 'MENTORSHIP' | 'ADVISORY'
    title: string
    description: string
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Check for success message from registration
  const isNewRegistration = searchParams.get('success') === 'true'
  const enrollmentId = searchParams.get('enrollment')
  const subscriptionId = searchParams.get('subscription')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Redirect admin users to admin dashboard
    if (session.user.role === 'ADMIN') {
      router.push('/admin/dashboard')
      return
    }

    fetchEnrollments()
  }, [session, status, router])

  const fetchEnrollments = async () => {
    try {
      const response = await fetch('/api/enrollments')
      if (!response.ok) {
        throw new Error('Failed to fetch enrollments')
      }
      const data = await response.json()
      setEnrollments(data.enrollments || [])
      
      // Route to appropriate dashboard based on enrollments
      routeToDashboard(data.enrollments || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const routeToDashboard = (userEnrollments: Enrollment[]) => {
    // If this is a new registration, show success message first
    if (isNewRegistration) {
      return
    }

    // If user has no enrollments, show empty state on dashboard
    if (userEnrollments.length === 0) {
      // Stay on dashboard and show empty state
      return
    }

    // If user has only one enrollment, route to specific dashboard
    if (userEnrollments.length === 1) {
      const enrollment = userEnrollments[0]
      if (enrollment.service?.type === 'MENTORSHIP') {
        router.push('/dashboard/mentorship')
      } else if (enrollment.service?.type === 'ADVISORY') {
        router.push('/dashboard/advisory')
      }
      return
    }

    // If user has multiple enrollments, show selection interface
    // (handled in the render below)
  }

  const handleContinueToService = (serviceType: 'MENTORSHIP' | 'ADVISORY') => {
    if (serviceType === 'MENTORSHIP') {
      router.push('/dashboard/mentorship')
    } else {
      router.push('/dashboard/advisory')
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <DashboardLayout
        title="Dashboard"
        description="Your mentorship and advisory programs"
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout
        title="Dashboard"
        description="Your mentorship and advisory programs"
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Show success message for new registrations
  if (isNewRegistration) {
    return (
      <DashboardLayout
        title="Welcome to MentorshipHub!"
        description="Your enrollment has been successfully created"
      >
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to MentorshipHub!
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Your enrollment has been successfully created and payment processed.
          </p>
          
          {enrollmentId && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6 max-w-md mx-auto">
              <div className="text-sm text-green-800">
                <strong>Enrollment ID:</strong> {enrollmentId}
                {subscriptionId && (
                  <>
                    <br />
                    <strong>Subscription ID:</strong> {subscriptionId}
                  </>
                )}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Confirmation Email</h3>
              <p className="text-sm text-gray-600">Check your inbox for enrollment details</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Mentor Matching</h3>
              <p className="text-sm text-gray-600">We'll match you within 24-48 hours</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">First Session</h3>
              <p className="text-sm text-gray-600">Schedule and begin your journey</p>
            </div>
          </div>

          <Button 
            onClick={() => {
              // Clear URL parameters and continue to dashboard
              router.push('/dashboard')
            }}
            size="lg"
            className="px-8"
          >
            Continue to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  // Show enrollment selection for users with multiple enrollments
  if (enrollments.length > 1) {
    const mentorshipEnrollments = enrollments.filter(e => e.service?.type === 'MENTORSHIP')
    const advisoryEnrollments = enrollments.filter(e => e.service?.type === 'ADVISORY')

    return (
      <DashboardLayout
        title="Welcome back!"
        description="You have multiple active enrollments. Choose which dashboard to view"
      >
        <div className="grid md:grid-cols-2 gap-6">
          {mentorshipEnrollments.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <Users className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Mentorship Programs</h3>
                  <p className="text-gray-600">{mentorshipEnrollments.length} active enrollment(s)</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                {mentorshipEnrollments.map((enrollment) => (
                  <div key={enrollment.id} className="text-sm text-gray-600">
                    • {enrollment.planType} Plan - {enrollment.status}
                  </div>
                ))}
              </div>
              <Button 
                onClick={() => handleContinueToService('MENTORSHIP')}
                className="w-full"
              >
                View Mentorship Dashboard
              </Button>
            </div>
          )}

          {advisoryEnrollments.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <Target className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Advisory Services</h3>
                  <p className="text-gray-600">{advisoryEnrollments.length} active enrollment(s)</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                {advisoryEnrollments.map((enrollment) => (
                  <div key={enrollment.id} className="text-sm text-gray-600">
                    • {enrollment.planType} Plan - {enrollment.status}
                  </div>
                ))}
              </div>
              <Button 
                onClick={() => handleContinueToService('ADVISORY')}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                View Advisory Dashboard
              </Button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center justify-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Schedule Session</span>
            </Button>
            <Button variant="outline" className="flex items-center justify-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>Billing & Payments</span>
            </Button>
            <Button variant="outline" className="flex items-center justify-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Contact Support</span>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Show empty state for users with no enrollments
  if (enrollments.length === 0) {
    return (
      <DashboardLayout
        title="Dashboard"
        description="Your mentorship and advisory programs"
      >
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Active Programs</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You don't have any active mentorship or advisory programs yet. 
            Browse our available services to get started on your professional development journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => router.push('/services')}
              className="px-6 py-3"
            >
              Browse Services
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/contact')}
              className="px-6 py-3"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Fallback - should not reach here due to routing logic
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Loading...</h2>
        <p className="text-gray-600">Redirecting you to the appropriate dashboard...</p>
      </div>
    </div>
  )
}
