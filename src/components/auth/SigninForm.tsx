'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const signinSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type SigninFormData = z.infer<typeof signinSchema>

interface SigninFormProps {
  onSuccess?: () => void
  onSwitchToSignup?: () => void
  service?: string
  plan?: string
}

export default function SigninForm({ onSuccess, onSwitchToSignup, service, plan }: SigninFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
  })

  const onSubmit = async (data: SigninFormData) => {
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password. Please try again.')
      } else {
        // Get the updated session to check user role
        const session = await getSession()
        
        if (session?.user) {
          onSuccess?.()
          
          // Redirect based on user role and service parameter
          if (session.user.role === 'ADMIN') {
            router.push('/admin/dashboard')
          } else if (service) {
            router.push(`/dashboard?service=${service}${plan ? `&plan=${plan}` : ''}`)
          } else {
            router.push('/dashboard')
          }
        }
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to your account to continue
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
        <Input
          {...register('password')}
          type={showPassword ? 'text' : 'password'}
          label="Password"
          placeholder="Enter your password"
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
          autoComplete="current-password"
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <Link href="/auth/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? 'Signing in...' : (
            <>
              Sign in
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Switch to Signup */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          {onSwitchToSignup ? (
            <button
              onClick={onSwitchToSignup}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up for free
            </button>
          ) : (
            <Link 
              href={`/auth/signup${service ? `?service=${service}` : ''}${plan ? `&plan=${plan}` : ''}`}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up for free
            </Link>
          )}
        </p>
      </div>
    </div>
  )
}



