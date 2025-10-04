'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { XCircle, Mail, ArrowRight, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'
import { LoadingPage } from '@/components/ui/LoadingStates'

export default function RejectedPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    // Redirect unauthenticated users to signin
    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Redirect confirmed users to dashboard
    if (session.user.isConfirmed === true) {
      router.push('/dashboard')
      return
    }

    // Redirect pending users to pending page
    if (session.user.isConfirmed === false && !session.user.rejectionReason) {
      router.push('/pending')
      return
    }
  }, [session, status, router])

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

  if (!session || session.user.isConfirmed !== false || !session.user.rejectionReason) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Application Not Approved
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We appreciate your interest in MentorshipHub, but we're unable to approve your application at this time.
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-800 mb-4">
              <XCircle className="w-4 h-4 mr-2" />
              Application Rejected
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              What This Means
            </h2>
            <p className="text-gray-600">
              Your application didn't meet our current criteria, but this decision is not permanent.
            </p>
          </div>

          {/* Rejection Reason */}
          <div className="bg-red-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
              Reason for Rejection
            </h3>
            <div className="bg-white rounded-md p-4 border border-red-200">
              <p className="text-gray-800 font-medium">
                {session.user.rejectionReason}
              </p>
            </div>
          </div>

          {/* Alternative Resources */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
              Alternative Resources
            </h3>
            <p className="text-gray-600 mb-4">
              While we're unable to approve your application at this time, here are some alternative resources that might be helpful:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Professional Networks</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Join LinkedIn groups and professional associations in your field
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Attend industry conferences and networking events
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Connect with professionals in your local area
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Learning Platforms</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Explore courses on Coursera, Udemy, or edX
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Join online communities and forums
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Find local meetups and workshops
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Reapplying in the Future */}
          <div className="bg-yellow-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <RefreshCw className="w-5 h-5 mr-2 text-yellow-600" />
              Reapplying in the Future
            </h3>
            <p className="text-gray-600 mb-4">
              If you decide to reapply in the future, we recommend:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Complete your professional profile with detailed information
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Clearly define your career goals and objectives
                </li>
              </ul>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Build relevant experience in your field
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Prepare specific questions for potential mentors
                </li>
              </ul>
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
              If you have any questions about this decision or would like to discuss your application further, our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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