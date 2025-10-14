'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, Mail, CheckCircle, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react'
import { LoadingPage } from '@/components/ui/LoadingStates'

export default function PendingPage() {
  const { data: session, status, update: updateSession } = useSession()
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const handleRefreshStatus = async () => {
    setIsRefreshing(true)
    try {
      // Fetch fresh user data from API
      const response = await fetch('/api/users/me')
      setLastChecked(new Date())
      if (response.ok) {
        const data = await response.json()
        const user = data.user
        
        // Check if user is now confirmed
        if (user.isConfirmed === true) {
          // Update session with fresh data and redirect
          await updateSession()
          router.push('/dashboard')
          return
        }
        
        // If still not confirmed, force session update
        await updateSession()
      }
    } catch (error) {
      console.error('Error refreshing user status:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (status === 'loading') return

    // Redirect unauthenticated users to signin
    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Check user status from API to ensure we have fresh data
    const checkUserStatus = async () => {
      try {
        const response = await fetch('/api/users/me')
        setLastChecked(new Date())
        if (response.ok) {
          const data = await response.json()
          const user = data.user
          
          if (user.isConfirmed === true) {
            router.push('/dashboard')
            return
          }
          
          if (user.isConfirmed === false && user.rejectionReason) {
            router.push('/rejected')
            return
          }
        }
      } catch (error) {
        console.error('Error checking user status:', error)
      }
    }

    // Always check fresh status on page load
    checkUserStatus()
  }, [session, status, router])

  // Auto-check user status every 30 seconds
  useEffect(() => {
    if (!session || session.user.isConfirmed === true) return

    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/users/me')
        setLastChecked(new Date())
        if (response.ok) {
          const data = await response.json()
          const user = data.user
          
          if (user.isConfirmed === true) {
            // User is now confirmed, redirect to dashboard
            await updateSession()
            router.push('/dashboard')
          }
        }
      } catch (error) {
        console.error('Error checking user status:', error)
      }
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [session, router, updateSession])

  if (status === 'loading') {
    return (
      <LoadingPage
        title="Loading your account status..."
        description="Please wait while we check your account information"
        showProgress={true}
        progress={50}
      />
    )
  }

  if (!session || session.user.isConfirmed !== false || session.user.rejectionReason) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Account Under Review
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Thank you for joining SamAdvisoryHub! Your account is currently being reviewed by our team.
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 mb-4">
              <Clock className="w-4 h-4 mr-2" />
              Pending Approval
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              What's Happening?
            </h2>
            <p className="text-gray-600">
              Our team is reviewing your application to ensure the best experience for all members.
            </p>
          </div>

          {/* Process Steps */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Received</h3>
              <p className="text-gray-600 text-sm">
                Your registration has been successfully submitted and is in our system.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                <RefreshCw className="h-6 w-6 text-yellow-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Under Review</h3>
              <p className="text-gray-600 text-sm">
                Our team is carefully reviewing your profile and application details.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Decision & Notification</h3>
              <p className="text-gray-600 text-sm">
                You'll receive an email notification once the review is complete.
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              Timeline
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-3 w-3 rounded-full bg-green-500 mt-1"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Registration Complete</p>
                  <p className="text-sm text-gray-600">Your account has been created successfully</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-3 w-3 rounded-full bg-yellow-500 mt-1"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Review in Progress</p>
                  <p className="text-sm text-gray-600">Our team is reviewing your application</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-3 w-3 rounded-full bg-gray-300 mt-1"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Expected within 2-3 business days</p>
                  <p className="text-sm text-gray-600">You'll receive an email notification</p>
                </div>
              </div>
            </div>
          </div>

          {/* What to Expect */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
              What to Expect
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">If Approved:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Full access to the platform</li>
                  <li>• Personalized dashboard</li>
                  <li>• Browse mentorship programs</li>
                  <li>• Connect with industry experts</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">If Additional Info Needed:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• We'll contact you directly</li>
                  <li>• Simple follow-up questions</li>
                  <li>• Quick verification process</li>
                  <li>• No need to reapply</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Questions or Need Help?
            </h3>
            <p className="text-gray-600 mb-4">
              Our support team is here to help with any questions about your application.
            </p>
            {lastChecked && (
              <p className="text-sm text-gray-500 mb-4">
                Last checked: {lastChecked.toLocaleTimeString()}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRefreshStatus}
                disabled={isRefreshing}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-5 h-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Checking...' : 'Check Status'}
              </button>
              <Link
                href="mailto:support@mentorshiphub.com"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Mail className="w-5 h-5 mr-2" />
                Contact Support
              </Link>
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}