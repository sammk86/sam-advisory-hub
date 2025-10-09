'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { User, Mail, Phone, MapPin, Calendar, Save, Edit } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DashboardCard from '@/components/dashboard/DashboardCard'

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  bio?: string
  location?: string
  timezone?: string
  role: string
  createdAt: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    timezone: ''
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchProfile()
  }, [session, status, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/users/profile')
      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }
      const data = await response.json()
      if (data.success && data.data.profile) {
        setProfile(data.data.profile)
        setFormData({
          name: data.data.profile.name || '',
          email: data.data.profile.email || '',
          phone: data.data.profile.phone || '',
          bio: data.data.profile.bio || '',
          location: data.data.profile.location || '',
          timezone: data.data.profile.timezone || ''
        })
      } else {
        throw new Error(data.error?.message || 'Failed to fetch profile')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      // Mock data for development
      const mockProfile: UserProfile = {
        id: session?.user?.id || '1',
        name: session?.user?.name || 'John Doe',
        email: session?.user?.email || 'john@example.com',
        phone: '+1 (555) 123-4567',
        bio: 'Passionate software engineer with 5+ years of experience in full-stack development.',
        location: 'San Francisco, CA',
        timezone: 'America/Los_Angeles',
        role: session?.user?.role || 'CLIENT',
        createdAt: '2024-01-01T00:00:00Z'
      }
      setProfile(mockProfile)
      setFormData({
        name: mockProfile.name,
        email: mockProfile.email,
        phone: mockProfile.phone || '',
        bio: mockProfile.bio || '',
        location: mockProfile.location || '',
        timezone: mockProfile.timezone || ''
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const requestData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        location: formData.location,
        timezone: formData.timezone
      }
      
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      const data = await response.json()
      
      if (data.success) {
        setIsEditing(false)
        fetchProfile() // Refresh profile data
        alert('Profile updated successfully!')
      } else {
        console.error('Error updating profile:', data.error)
        alert(data.error?.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <DashboardLayout
        title="Profile"
        description="Your account information"
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!profile) {
    return (
      <DashboardLayout
        title="Profile"
        description="Your account information"
      >
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Not Found</h3>
          <p className="text-gray-600">Unable to load your profile information</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Profile"
      description="Your account information"
      actions={
        isEditing ? (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        ) : (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )
      }
    >
      <div className="space-y-6">
        {/* Profile Header */}
        <DashboardCard>
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
              <p className="text-gray-600">{profile.email}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Member since {new Date(profile.createdAt).toLocaleDateString()}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {profile.role}
                </span>
              </div>
            </div>
          </div>
        </DashboardCard>

        {/* Personal Information */}
        <DashboardCard title="Personal Information">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                ) : (
                  <p className="text-gray-900">{profile.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                ) : (
                  <p className="text-gray-900">{profile.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p className="text-gray-900">{profile.phone || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Enter your location"
                  />
                ) : (
                  <p className="text-gray-900">{profile.location || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                {isEditing ? (
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="">Select timezone</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Europe/Paris">Paris (CET)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                    <option value="Asia/Shanghai">Shanghai (CST)</option>
                    <option value="Australia/Sydney">Sydney (AEST)</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{profile.timezone || 'Not set'}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-gray-900">{profile.bio || 'No bio provided'}</p>
            )}
          </div>
        </DashboardCard>

        {/* Account Information */}
        <DashboardCard title="Account Information">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                <p className="text-gray-900 capitalize">{profile.role.toLowerCase()}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                <p className="text-gray-900">{new Date(profile.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <p className="text-gray-500 text-sm font-mono">{profile.id}</p>
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>
    </DashboardLayout>
  )
}