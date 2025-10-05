'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import UserStatusIndicator, { UserStatusBadge, UserStatusCard, UserStatusTimeline, UserStatusProgress } from './UserStatusIndicator'
import { LoadingPage, LoadingCard } from './LoadingStates'
import { Clock, Mail, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface UserStatusDashboardProps {
  className?: string
}

export default function UserStatusDashboard({ className }: UserStatusDashboardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Simulate loading delay for better UX
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [session, status, router])

  if (status === 'loading' || isLoading) {
    return (
      <LoadingPage
        title="Checking your account status..."
        description="Please wait while we verify your account information"
        showProgress={true}
        progress={75}
      />
    )
  }

  if (!session?.user) {
    return null
  }

  const user = session.user
  const userStatus: 'confirmed' | 'pending' | 'rejected' | 'unknown' = 
    user.isConfirmed === true ? 'confirmed' :
    user.isConfirmed === false && user.rejectionReason ? 'rejected' :
    user.isConfirmed === false ? 'pending' : 'unknown'

  const timelineSteps = [
    {
      id: 'registration',
      title: 'Account Created',
      description: 'Your account has been successfully created',
      completed: true,
      current: false,
    },
    {
      id: 'review',
      title: 'Under Review',
      description: 'Our team is reviewing your application',
      completed: userStatus === 'confirmed',
      current: userStatus === 'pending',
    },
    {
      id: 'decision',
      title: 'Decision Made',
      description: userStatus === 'confirmed' 
        ? 'Your account has been approved'
        : userStatus === 'rejected'
        ? 'Your application was not approved'
        : 'Awaiting decision',
      completed: userStatus === 'confirmed' || userStatus === 'rejected',
      current: false,
    },
  ]

  const progress = userStatus === 'confirmed' ? 100 : userStatus === 'rejected' ? 100 : 50

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 ${className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg">
            {userStatus === 'confirmed' && <CheckCircle className="w-12 h-12 text-green-600" />}
            {userStatus === 'pending' && <Clock className="w-12 h-12 text-yellow-600" />}
            {userStatus === 'rejected' && <XCircle className="w-12 h-12 text-red-600" />}
            {userStatus === 'unknown' && <AlertCircle className="w-12 h-12 text-gray-600" />}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {userStatus === 'confirmed' && 'Account Confirmed!'}
            {userStatus === 'pending' && 'Account Under Review'}
            {userStatus === 'rejected' && 'Application Not Approved'}
            {userStatus === 'unknown' && 'Account Status Unknown'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {userStatus === 'confirmed' && 'Welcome to MentorshipHub! Your account has been approved and you now have full access to our platform.'}
            {userStatus === 'pending' && 'Thank you for joining MentorshipHub! Your account is currently being reviewed by our team.'}
            {userStatus === 'rejected' && 'We appreciate your interest in MentorshipHub, but we\'re unable to approve your account at this time.'}
            {userStatus === 'unknown' && 'We\'re having trouble determining your account status. Please contact support for assistance.'}
          </p>
        </div>

        {/* Status Overview */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <UserStatusCard
            status={userStatus}
            title={`Account Status: ${userStatus === 'confirmed' ? 'Active' : userStatus === 'pending' ? 'Under Review' : userStatus === 'rejected' ? 'Not Approved' : 'Unknown'}`}
            description={
              userStatus === 'confirmed' 
                ? 'You have full access to all platform features and can start your mentorship journey.'
                : userStatus === 'pending'
                ? 'Your application is being reviewed. This process typically takes 24-48 hours.'
                : userStatus === 'rejected'
                ? 'Your application was not approved. You can reapply in the future or contact support for more information.'
                : 'Please contact our support team to resolve this issue.'
            }
            action={
              userStatus === 'confirmed' 
                ? { label: 'Go to Dashboard', href: '/dashboard' }
                : userStatus === 'rejected'
                ? { label: 'Contact Support', href: 'mailto:support@mentorshiphub.com' }
                : undefined
            }
          />

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{user.name || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Role:</span>
                  <span className="font-medium capitalize">{user.role.toLowerCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <UserStatusBadge status={userStatus} />
                </div>
              </div>
            </div>

            <UserStatusProgress status={userStatus} progress={progress} />
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Application Timeline</h2>
          <UserStatusTimeline status={userStatus} steps={timelineSteps} />
        </div>

        {/* Status-specific content */}
        {userStatus === 'pending' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">What to Expect</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">If Approved</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Full access to your dashboard
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Browse mentorship programs and advisory services
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Connect with industry experts
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Start your professional development journey
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">If Additional Info Needed</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <Mail className="w-4 h-4 text-blue-500 mr-2" />
                    We'll email you with specific requirements
                  </li>
                  <li className="flex items-center">
                    <Mail className="w-4 h-4 text-blue-500 mr-2" />
                    You can update your profile and reapply
                  </li>
                  <li className="flex items-center">
                    <Mail className="w-4 h-4 text-blue-500 mr-2" />
                    Our support team is here to help
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {userStatus === 'rejected' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Understanding Our Decision</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Reason for Rejection</h3>
              <p className="text-red-700">
                {user.rejectionReason || 'Your application did not meet our current criteria for platform access.'}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">What You Can Do</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <RefreshCw className="w-4 h-4 text-blue-500 mr-2" />
                    Reapply in the future when you're better positioned
                  </li>
                  <li className="flex items-center">
                    <Mail className="w-4 h-4 text-blue-500 mr-2" />
                    Contact our support team for clarification
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                    Explore alternative professional development opportunities
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Alternative Resources</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>Professional networks and LinkedIn groups</li>
                  <li>Online courses and certifications</li>
                  <li>Industry conferences and meetups</li>
                  <li>Local professional associations</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Need Help?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Our support team is here to help with any questions about your account status or the review process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="mailto:support@mentorshiphub.com"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center"
              >
                <Mail className="w-5 h-5 mr-2" />
                Contact Support
              </Link>
              <Link
                href="/"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


