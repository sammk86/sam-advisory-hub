'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { ServiceType } from '../RegistrationFlow'

const profileSchema = z.object({
  goals: z.string().min(10, 'Please provide more detail about your goals (at least 10 characters)'),
  experience: z.string().min(1, 'Please select your experience level'),
  industry: z.string().min(1, 'Please select your industry'),
  timeCommitment: z.string().min(1, 'Please select your time commitment'),
  preferredSchedule: z.string().min(1, 'Please select your preferred schedule'),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileSetupProps {
  service: ServiceType
  profile: ProfileFormData
  onProfileUpdate: (profile: ProfileFormData) => void
  onNext: () => void
  onBack: () => void
}

export default function ProfileSetup({ service, profile, onProfileUpdate, onNext, onBack }: ProfileSetupProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile,
  })

  const watchedValues = watch()

  const onSubmit = (data: ProfileFormData) => {
    onProfileUpdate(data)
    onNext()
  }

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'mid', label: 'Mid Level (3-5 years)' },
    { value: 'senior', label: 'Senior Level (6-10 years)' },
    { value: 'executive', label: 'Executive Level (10+ years)' },
    { value: 'entrepreneur', label: 'Entrepreneur/Founder' },
    { value: 'career-change', label: 'Career Changer' },
  ]

  const industries = [
    { value: 'technology', label: 'Technology' },
    { value: 'finance', label: 'Finance & Banking' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'marketing', label: 'Marketing & Advertising' },
    { value: 'sales', label: 'Sales' },
    { value: 'education', label: 'Education' },
    { value: 'nonprofit', label: 'Non-profit' },
    { value: 'retail', label: 'Retail & E-commerce' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'media', label: 'Media & Entertainment' },
    { value: 'other', label: 'Other' },
  ]

  const timeCommitments = service === 'mentorship' ? [
    { value: '2-4', label: '2-4 hours per month' },
    { value: '4-8', label: '4-8 hours per month' },
    { value: '8-12', label: '8-12 hours per month' },
    { value: '12+', label: '12+ hours per month' },
  ] : [
    { value: '1-5', label: '1-5 hours per project' },
    { value: '5-10', label: '5-10 hours per project' },
    { value: '10-20', label: '10-20 hours per project' },
    { value: '20+', label: '20+ hours per project' },
  ]

  const scheduleOptions = [
    { value: 'morning', label: 'Morning (9 AM - 12 PM)' },
    { value: 'afternoon', label: 'Afternoon (12 PM - 5 PM)' },
    { value: 'evening', label: 'Evening (5 PM - 8 PM)' },
    { value: 'flexible', label: 'Flexible' },
  ]

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Tell Us About Yourself
        </h2>
        <p className="text-gray-600">
          Help us match you with the right {service === 'mentorship' ? 'mentor' : 'advisor'} and create a personalized experience
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Goals */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What are your main goals for this {service} experience? *
          </label>
          <textarea
            {...register('goals')}
            rows={4}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.goals ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder={`Describe what you hope to achieve through ${service}...`}
          />
          {errors.goals && (
            <p className="mt-2 text-sm text-red-600">{errors.goals.message}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {watchedValues.goals?.length || 0} characters (minimum 10)
          </p>
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What's your current experience level? *
          </label>
          <select
            {...register('experience')}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.experience ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select your experience level</option>
            {experienceLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
          {errors.experience && (
            <p className="mt-2 text-sm text-red-600">{errors.experience.message}</p>
          )}
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What industry are you in? *
          </label>
          <select
            {...register('industry')}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.industry ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select your industry</option>
            {industries.map((industry) => (
              <option key={industry.value} value={industry.value}>
                {industry.label}
              </option>
            ))}
          </select>
          {errors.industry && (
            <p className="mt-2 text-sm text-red-600">{errors.industry.message}</p>
          )}
        </div>

        {/* Time Commitment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How much time can you commit {service === 'mentorship' ? 'per month' : 'per project'}? *
          </label>
          <select
            {...register('timeCommitment')}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.timeCommitment ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select time commitment</option>
            {timeCommitments.map((commitment) => (
              <option key={commitment.value} value={commitment.value}>
                {commitment.label}
              </option>
            ))}
          </select>
          {errors.timeCommitment && (
            <p className="mt-2 text-sm text-red-600">{errors.timeCommitment.message}</p>
          )}
        </div>

        {/* Preferred Schedule */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What's your preferred meeting schedule? *
          </label>
          <select
            {...register('preferredSchedule')}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.preferredSchedule ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select preferred schedule</option>
            {scheduleOptions.map((schedule) => (
              <option key={schedule.value} value={schedule.value}>
                {schedule.label}
              </option>
            ))}
          </select>
          {errors.preferredSchedule && (
            <p className="mt-2 text-sm text-red-600">{errors.preferredSchedule.message}</p>
          )}
        </div>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onBack}>
            Back to Plan Selection
          </Button>
          <Button type="submit">
            Continue to Payment
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </form>
    </div>
  )
}



