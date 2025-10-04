'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Copy, CheckCircle, Eye, EyeOff } from 'lucide-react'

interface TestUser {
  email: string
  password: string
  role: string
  status: string
  description: string
}

const testUsers: TestUser[] = [
  {
    email: 'admin@mentorshiphub.com',
    password: 'admin123',
    role: 'ADMIN',
    status: 'Confirmed',
    description: 'Full admin access to all features'
  },
  {
    email: 'sarah.mentee@example.com',
    password: 'client123',
    role: 'CLIENT',
    status: 'Confirmed',
    description: 'Confirmed user with mentorship enrollment'
  },
  {
    email: 'marcus.cto@example.com',
    password: 'client123',
    role: 'CLIENT',
    status: 'Confirmed',
    description: 'Confirmed user with advisory enrollment'
  },
  {
    email: 'alex.pending@example.com',
    password: 'pending123',
    role: 'CLIENT',
    status: 'Pending',
    description: 'User awaiting admin approval'
  },
  {
    email: 'jessica.pending@example.com',
    password: 'pending123',
    role: 'CLIENT',
    status: 'Pending',
    description: 'User awaiting admin approval'
  },
  {
    email: 'rejected.user@example.com',
    password: 'rejected123',
    role: 'CLIENT',
    status: 'Rejected',
    description: 'User whose application was rejected'
  }
]

export default function TestUsersPage() {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  const [showPasswords, setShowPasswords] = useState(false)
  const router = useRouter()

  const copyToClipboard = async (text: string, email: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedEmail(email)
      setTimeout(() => setCopiedEmail(null), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const handleSignIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with:', email)
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      console.log('Sign in result:', result)

      if (result?.error) {
        console.error('Sign in failed:', result.error)
        alert(`Sign in failed: ${result.error}`)
        return
      }

      if (result?.ok) {
        // Get the session to check user status
        const session = await getSession()
        console.log('Session after sign in:', session)
        
        if (session?.user) {
          // Redirect based on user role and confirmation status
          if (session.user.role === 'ADMIN') {
            console.log('Redirecting to admin dashboard')
            router.push('/admin/dashboard')
          } else if (!session.user.isConfirmed) {
            if (session.user.rejectionReason) {
              console.log('Redirecting to rejected page')
              router.push('/rejected')
            } else {
              console.log('Redirecting to pending page')
              router.push('/pending')
            }
          } else {
            console.log('Redirecting to dashboard')
            router.push('/dashboard')
          }
        }
      }
    } catch (error) {
      console.error('Sign in error:', error)
      alert('Sign in failed. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Test Users for Development
          </h1>
          <p className="text-lg text-gray-600">
            Use these test accounts to explore different user states and features
          </p>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Available Test Accounts</h2>
          <button
            onClick={() => setShowPasswords(!showPasswords)}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showPasswords ? 'Hide' : 'Show'} Passwords</span>
          </button>
        </div>

        <div className="grid gap-6">
          {testUsers.map((user, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{user.email}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{user.description}</p>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">Email:</span>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">{user.email}</code>
                      <button
                        onClick={() => copyToClipboard(user.email, user.email)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        {copiedEmail === user.email ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">Password:</span>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {showPasswords ? user.password : '••••••••'}
                      </code>
                      <button
                        onClick={() => copyToClipboard(user.password, user.email)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        {copiedEmail === user.email ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleSignIn(user.email, user.password)}
                  className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Sign In
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">How to Test the Flow</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>1. Admin User:</strong> Sign in as admin@mentorshiphub.com to access admin dashboard</p>
            <p><strong>2. Confirmed Users:</strong> Sign in as sarah.mentee@example.com or marcus.cto@example.com to access user dashboard</p>
            <p><strong>3. Pending Users:</strong> Sign in as alex.pending@example.com or jessica.pending@example.com to see pending page</p>
            <p><strong>4. Rejected User:</strong> Sign in as rejected.user@example.com to see rejection page</p>
            <p><strong>5. New Registration:</strong> Use the sign-up form to create a new account (will redirect to pending page)</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
