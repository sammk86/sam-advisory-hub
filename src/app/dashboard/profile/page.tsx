'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { User, Mail, Phone, MapPin, Calendar, Shield, Bell, Key, Save, Edit } from 'lucide-react'
import Button from '@/components/ui/Button'
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
  avatar?: string
  preferences: {
    emailNotifications: boolean
    smsNotifications: boolean
    marketingEmails: boolean
    sessionReminders: boolean
  }
  security: {
    twoFactorEnabled: boolean
    lastPasswordChange: string
    loginHistory: Array<{
      id: string
      timestamp: string
      ipAddress: string
      location: string
      device: string
    }>
  }
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
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          marketingEmails: true,
          sessionReminders: true
        },
        security: {
          twoFactorEnabled: false,
          lastPasswordChange: '2024-01-01T00:00:00Z',
          loginHistory: [
            {
              id: '1',
              timestamp: '2024-01-19T14:30:00Z',
              ipAddress: '192.168.1.1',
              location: 'San Francisco, CA',
              device: 'Chrome on MacOS'
            },
            {
              id: '2',
              timestamp: '2024-01-18T09:15:00Z',
              ipAddress: '192.168.1.1',
              location: 'San Francisco, CA',
              device: 'Safari on iPhone'
            }
          ]
        }
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
      }
      console.log('Sending profile update:', requestData)
      
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      const data = await response.json()
      console.log('Profile update response:', data)
      
      if (data.success) {
        setIsEditing(false)
        fetchProfile() // Refresh profile data
      } else {
        console.error('Error updating profile:', data.error)
        if (data.error?.details) {
          console.error('Validation details:', data.error.details)
        }
        alert(data.error?.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    }
  }

  const handlePreferenceChange = async (key: string, value: boolean) => {
    try {
      const response = await fetch('/api/users/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [key]: value }),
      })

      const data = await response.json()
      if (data.success) {
        // Update local state immediately for better UX
        setProfile(prev => prev ? {
          ...prev,
          preferences: {
            ...prev.preferences,
            [key]: value
          }
        } : null)
      } else {
        console.error('Error updating preferences:', data.error?.message)
      }
    } catch (error) {
      console.error('Error updating preferences:', error)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <DashboardLayout
        title="Profile"
        description="Manage your account settings and preferences"
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
        description="Manage your account settings and preferences"
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
      description="Manage your account settings and preferences"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-gray-900">{profile.bio || 'No bio provided'}</p>
            )}
          </div>
        </DashboardCard>

        {/* Notification Preferences */}
        <DashboardCard title="Notification Preferences">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Email Notifications</h4>
                <p className="text-sm text-gray-600">Receive updates via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile?.preferences?.emailNotifications ?? false}
                  onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                <p className="text-sm text-gray-600">Receive updates via SMS</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile?.preferences?.smsNotifications ?? false}
                  onChange={(e) => handlePreferenceChange('smsNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Marketing Emails</h4>
                <p className="text-sm text-gray-600">Receive promotional content</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile?.preferences?.marketingEmails ?? false}
                  onChange={(e) => handlePreferenceChange('marketingEmails', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Session Reminders</h4>
                <p className="text-sm text-gray-600">Get reminded about upcoming sessions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile?.preferences?.sessionReminders ?? false}
                  onChange={(e) => handlePreferenceChange('sessionReminders', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </DashboardCard>

        {/* Security Settings */}
        <DashboardCard title="Security">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-600">
                  {profile?.security?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <Button variant="outline" size="sm">
                {profile?.security?.twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Password</h4>
                <p className="text-sm text-gray-600">
                  Last changed: {profile?.security?.lastPasswordChange ? new Date(profile.security.lastPasswordChange).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Key className="w-4 h-4 mr-1" />
                Change Password
              </Button>
            </div>
          </div>
        </DashboardCard>

        {/* Login History */}
        <DashboardCard title="Recent Login Activity">
          <div className="space-y-3">
            {profile?.security?.loginHistory?.length ? (
              profile.security.loginHistory.map((login) => (
                <div key={login.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{login.device}</p>
                      <p className="text-sm text-gray-600">{login.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">
                      {new Date(login.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">{login.ipAddress}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No login history available</p>
              </div>
            )}
          </div>
        </DashboardCard>
      </div>
    </DashboardLayout>
  )
}
