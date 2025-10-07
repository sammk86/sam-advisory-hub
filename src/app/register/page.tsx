'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import { ArrowLeft, User, Mail, Lock, Target, Loader2, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const serviceType = searchParams.get('service') || 'mentorship'

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    goals: '',
    experience: '',
    industry: '',
    timeCommitment: '',
    preferredSchedule: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (session && status !== 'loading') {
      router.push('/dashboard')
    }
  }, [session, status, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return
      }

      // Create account
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          serviceType: serviceType,
          profile: {
            goals: formData.goals,
            experience: formData.experience,
            industry: formData.industry,
            timeCommitment: formData.timeCommitment,
            preferredSchedule: formData.preferredSchedule
          }
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        setError(data.message || 'Registration failed')
      }
    } catch (err) {
      setError('An error occurred during registration')
      console.error('Registration error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <main className="flex min-h-screen flex-col bg-background text-foreground">
        <Header />
        <div className="flex-1 flex items-center justify-center mt-24">
          <div className="text-center max-w-md mx-auto px-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-foreground mb-4">Registration Successful!</h1>
            <p className="text-muted-foreground mb-6">
              Your account has been created successfully. You'll be redirected to your dashboard shortly.
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      
      <div className="container mt-24 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link 
            href="/services"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Services
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Create Your Account
            </h1>
            <p className="text-muted-foreground">
              Join our {serviceType === 'mentorship' ? 'mentorship' : 'advisory'} program and start your journey today.
            </p>
          </div>

          {/* Registration Form */}
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-border">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-card-foreground flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-card-foreground mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your first name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-card-foreground mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-card-foreground mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-card-foreground mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Create a password"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-card-foreground mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Confirm your password"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Goals and Experience */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-card-foreground flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Goals & Experience
                </h3>
                
                <div>
                  <label htmlFor="goals" className="block text-sm font-medium text-card-foreground mb-2">
                    What are your main goals? *
                  </label>
                  <textarea
                    id="goals"
                    name="goals"
                    value={formData.goals}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    placeholder="Describe your professional goals and what you hope to achieve..."
                  />
                </div>

                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-card-foreground mb-2">
                    Current Experience Level *
                  </label>
                  <select
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select your experience level</option>
                    <option value="entry">Entry Level (0-2 years)</option>
                    <option value="mid">Mid Level (3-5 years)</option>
                    <option value="senior">Senior Level (6-10 years)</option>
                    <option value="executive">Executive Level (10+ years)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-card-foreground mb-2">
                    Industry *
                  </label>
                  <input
                    type="text"
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., Technology, Healthcare, Finance, etc."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="timeCommitment" className="block text-sm font-medium text-card-foreground mb-2">
                      Time Commitment *
                    </label>
                    <select
                      id="timeCommitment"
                      name="timeCommitment"
                      value={formData.timeCommitment}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select time commitment</option>
                      <option value="1-2 hours/week">1-2 hours/week</option>
                      <option value="3-5 hours/week">3-5 hours/week</option>
                      <option value="6-10 hours/week">6-10 hours/week</option>
                      <option value="10+ hours/week">10+ hours/week</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="preferredSchedule" className="block text-sm font-medium text-card-foreground mb-2">
                      Preferred Schedule
                    </label>
                    <select
                      id="preferredSchedule"
                      name="preferredSchedule"
                      value={formData.preferredSchedule}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select preferred schedule</option>
                      <option value="weekday-morning">Weekday Mornings</option>
                      <option value="weekday-evening">Weekday Evenings</option>
                      <option value="weekend">Weekends</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Account & Register</span>
                )}
              </button>

              {/* Sign In Link */}
              <div className="text-center">
                <p className="text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/auth/signin" className="text-primary hover:text-primary/80 font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}