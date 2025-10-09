'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/input'

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignupFormData = z.infer<typeof signupSchema>

interface SignupFormProps {
  onSuccess?: () => void
  onSwitchToSignin?: () => void
  service?: string
  plan?: string
}

export default function SignupForm({ onSuccess, onSwitchToSignin, service, plan }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const password = watch('password')

  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '' }
    
    let score = 0
    if (password.length >= 8) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^a-zA-Z\d]/.test(password)) score++

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' }
    if (score <= 3) return { score, label: 'Fair', color: 'bg-yellow-500' }
    if (score <= 4) return { score, label: 'Good', color: 'bg-blue-500' }
    return { score, label: 'Strong', color: 'bg-green-500' }
  }

  const passwordStrength = getPasswordStrength(password || '')

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed')
      }

      onSuccess?.()
      
      // Redirect to service-specific flow or signin
      if (service) {
        router.push(`/auth/signin?service=${service}${plan ? `&plan=${plan}` : ''}`)
      } else {
        router.push('/auth/signin')
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
        {service && (
          <p className="mt-1 text-sm text-blue-600 font-medium">
            {service === 'mentorship' ? 'Starting your mentorship journey' : 'Getting advisory support'}
            {plan && ` with ${plan} plan`}
          </p>
        )}
        <p className="mt-2 text-sm text-gray-600">
          Get started with your professional development
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {/* Name Field */}
        <Input
          {...register('name')}
          type="text"
          label="Full name"
          placeholder="Enter your full name"
          error={errors.name?.message}
          leftIcon={<User className="h-5 w-5 text-gray-400" />}
          autoComplete="name"
        />

        {/* Email Field */}
        <Input
          {...register('email')}
          type="email"
          label="Email address"
          placeholder="Enter your email"
          error={errors.email?.message}
          leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
          autoComplete="email"
        />

        {/* Password Field */}
        <div>
          <Input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="Create a strong password"
            error={errors.password?.message}
            leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-500"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            }
            autoComplete="new-password"
          />
          
          {/* Password Strength Indicator */}
          {password && (
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600">{passwordStrength.label}</span>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <Input
          {...register('confirmPassword')}
          type={showConfirmPassword ? 'text' : 'password'}
          label="Confirm password"
          placeholder="Confirm your password"
          error={errors.confirmPassword?.message}
          leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-400 hover:text-gray-500"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          }
          autoComplete="new-password"
        />

        {/* Terms Agreement */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              {...register('agreeToTerms')}
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="agreeToTerms" className="text-gray-700">
              I agree to the{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </Link>
            </label>
          </div>
        </div>
        {errors.agreeToTerms && (
          <p className="text-sm text-red-600">{errors.agreeToTerms.message}</p>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? 'Creating account...' : (
            <>
              Create account
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Switch to Signin */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          {onSwitchToSignin ? (
            <button
              onClick={onSwitchToSignin}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in here
            </button>
          ) : (
            <Link 
              href={`/auth/signin${service ? `?service=${service}` : ''}${plan ? `&plan=${plan}` : ''}`}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in here
            </Link>
          )}
        </p>
      </div>
    </div>
  )
}



