'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Users, 
  Mail, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  Send,
  MessageCircle,
  Package,
  Target,
  Calendar,
  MessageSquare
} from 'lucide-react'
import { useState } from 'react'
import { LoadingPage } from '@/components/ui/LoadingStates'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    // Redirect non-admin users
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/unauthorized')
      return
    }

    // Redirect unconfirmed users
    if (!session.user.isConfirmed) {
      router.push('/pending')
      return
    }
  }, [session, status, router])

  // Show loading state while session is being fetched
  if (status === 'loading') {
    return (
      <LoadingPage
        title="Loading admin dashboard..."
        description="Please wait while we verify your access"
        showProgress={true}
        progress={75}
      />
    )
  }

  // Redirect if user is not admin or not confirmed
  if (!session || session.user.role !== 'ADMIN' || !session.user.isConfirmed) {
    return null
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: BarChart3,
      current: false,
    },
    {
      name: 'Messages',
      href: '/admin/messages',
      icon: MessageCircle,
      current: false,
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: Users,
      current: false,
    },
    {
      name: 'Pending Approvals',
      href: '/admin/users/pending',
      icon: Bell,
      current: false,
    },
    {
      name: 'Newsletter',
      href: '/admin/newsletter',
      icon: Mail,
      current: false,
    },
    {
      name: 'Campaigns',
      href: '/admin/newsletter/campaigns',
      icon: Send,
      current: false,
    },
    {
      name: 'Services',
      href: '/admin/services',
      icon: Users,
      current: false,
    },
    {
      name: 'Service Assignments',
      href: '/admin/service-assignments',
      icon: Package,
      current: false,
    },
    {
      name: 'Meeting Requests',
      href: '/admin/meeting-requests',
      icon: Calendar,
      current: false,
    },
    {
      name: 'Feedback',
      href: '/admin/feedback',
      icon: MessageSquare,
      current: false,
    },
    {
      name: 'Roadmaps',
      href: '/admin/roadmaps',
      icon: Target,
      current: false,
    },
    {
      name: 'Email Management',
      href: '/admin/emails',
      icon: Mail,
      current: false,
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      current: false,
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      current: false,
    },
  ]

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="ml-2 text-lg font-semibold text-gray-900">Admin</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${
                    isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="ml-2 text-lg font-semibold text-gray-900">Admin Dashboard</span>
            </div>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${
                    isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Separator */}
          <div className="h-6 w-px bg-gray-200 lg:hidden" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <form className="relative flex flex-1" action="#" method="GET">
              <label htmlFor="search-field" className="sr-only">
                Search
              </label>
              <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400" />
              <input
                id="search-field"
                className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                placeholder="Search users, emails..."
                type="search"
                name="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
              >
                <Bell className="h-6 w-6" />
              </button>

              {/* Separator */}
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />

              {/* Profile dropdown */}
              <div className="flex items-center gap-x-4">
                <div className="flex items-center gap-x-3">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {session.user?.name?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-semibold text-gray-900">{session.user?.name}</p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
