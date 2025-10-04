'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Save, 
  ArrowLeft, 
  DollarSign,
  Users,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'

interface ServiceFormData {
  name: string
  description: string
  type: 'MENTORSHIP' | 'ADVISORY'
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  singleSessionPrice: string
  monthlyPlanPrice: string
  hourlyRate: string
}

export default function CreateServicePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    type: 'MENTORSHIP',
    status: 'DRAFT',
    singleSessionPrice: '',
    monthlyPlanPrice: '',
    hourlyRate: ''
  })

  const handleInputChange = (field: keyof ServiceFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          singleSessionPrice: formData.singleSessionPrice ? parseFloat(formData.singleSessionPrice) : null,
          monthlyPlanPrice: formData.monthlyPlanPrice ? parseFloat(formData.monthlyPlanPrice) : null,
          hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create service')
      }

      const data = await response.json()
      setSuccess('Service created successfully!')
      
      // Redirect to services list after a short delay
      setTimeout(() => {
        router.push('/admin/services')
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create service')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Service</h1>
            <p className="text-gray-600">Add a new mentorship or advisory service</p>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-6">
                {/* Service Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter service name"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Describe what this service offers"
                    required
                  />
                </div>

                {/* Service Type */}
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Service Type *
                  </label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value as 'MENTORSHIP' | 'ADVISORY')}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  >
                    <option value="MENTORSHIP">Mentorship</option>
                    <option value="ADVISORY">Advisory</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED')}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>

                {/* Pricing Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing (Optional)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="singleSessionPrice" className="block text-sm font-medium text-gray-700">
                        Single Session Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        id="singleSessionPrice"
                        value={formData.singleSessionPrice}
                        onChange={(e) => handleInputChange('singleSessionPrice', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label htmlFor="monthlyPlanPrice" className="block text-sm font-medium text-gray-700">
                        Monthly Plan Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        id="monthlyPlanPrice"
                        value={formData.monthlyPlanPrice}
                        onChange={(e) => handleInputChange('monthlyPlanPrice', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700">
                        Hourly Rate ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        id="hourlyRate"
                        value={formData.hourlyRate}
                        onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.name || !formData.description}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Service
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Service Info */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Service Information</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Users className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Type:</span>
                  <span className="ml-2 font-medium">
                    {formData.type === 'MENTORSHIP' ? 'Mentorship' : 'Advisory'}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Status:</span>
                  <span className="ml-2 font-medium">{formData.status}</span>
                </div>
                {formData.singleSessionPrice && (
                  <div className="flex items-center text-sm">
                    <span className="text-gray-600">Session Price:</span>
                    <span className="ml-2 font-medium">${formData.singleSessionPrice}</span>
                  </div>
                )}
                {formData.monthlyPlanPrice && (
                  <div className="flex items-center text-sm">
                    <span className="text-gray-600">Monthly Plan:</span>
                    <span className="ml-2 font-medium">${formData.monthlyPlanPrice}</span>
                  </div>
                )}
                {formData.hourlyRate && (
                  <div className="flex items-center text-sm">
                    <span className="text-gray-600">Hourly Rate:</span>
                    <span className="ml-2 font-medium">${formData.hourlyRate}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Help */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-2">Tips</h3>
              <ul className="text-sm text-blue-700 space-y-2">
                <li>• Choose a clear, descriptive name for your service</li>
                <li>• Provide detailed description of what clients can expect</li>
                <li>• Set pricing that reflects the value you provide</li>
                <li>• Start with "Draft" status and publish when ready</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
