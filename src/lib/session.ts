import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { UserRole } from '@/types'
import { redirect } from 'next/navigation'

/**
 * Get the current session on the server side
 */
export async function getCurrentSession() {
  return await getServerSession(authOptions)
}

/**
 * Get the current user from session
 */
export async function getCurrentUser() {
  const session = await getCurrentSession()
  return session?.user || null
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export async function requireAuth() {
  const session = await getCurrentSession()
  
  if (!session) {
    redirect('/auth/signin')
  }
  
  return session
}

/**
 * Require specific role - redirect to unauthorized if insufficient permissions
 */
export async function requireRole(requiredRole: UserRole | UserRole[]) {
  const session = await requireAuth()
  const userRole = session.user.role
  
  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  
  if (!allowedRoles.includes(userRole)) {
    redirect('/unauthorized')
  }
  
  return session
}

/**
 * Require admin role
 */
export async function requireAdmin() {
  return requireRole('ADMIN')
}

/**
 * Check if user has specific role
 */
export async function hasRole(requiredRole: UserRole | UserRole[]): Promise<boolean> {
  const session = await getCurrentSession()
  
  if (!session) {
    return false
  }
  
  const userRole = session.user.role
  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  
  return allowedRoles.includes(userRole)
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole('ADMIN')
}

/**
 * Check if user is client
 */
export async function isClient(): Promise<boolean> {
  return hasRole('CLIENT')
}

/**
 * Check if user can access resource (owns it or is admin)
 */
export async function canAccessResource(resourceUserId: string): Promise<boolean> {
  const session = await getCurrentSession()
  
  if (!session) {
    return false
  }
  
  return session.user.role === 'ADMIN' || session.user.id === resourceUserId
}

/**
 * Get user permissions based on role
 */
export function getUserPermissions(role: UserRole) {
  const permissions = {
    // User management
    canViewAllUsers: false,
    canEditAllUsers: false,
    canDeleteUsers: false,
    
    // Service management
    canCreateServices: false,
    canEditAllServices: false,
    canDeleteServices: false,
    canViewServiceAnalytics: false,
    
    // Enrollment management
    canViewAllEnrollments: false,
    canEditAllEnrollments: false,
    canCancelEnrollments: false,
    
    // Meeting management
    canScheduleMeetings: true, // Both roles can schedule
    canViewAllMeetings: false,
    canEditMeetingNotes: false,
    
    // Payment management
    canViewAllPayments: false,
    canProcessRefunds: false,
    canViewPaymentAnalytics: false,
    
    // Content management
    canUploadDeliverables: false,
    canEditRoadmaps: false,
    canViewAllProgress: false,
    
    // System administration
    canAccessAdminPanel: false,
    canManageSettings: false,
    canViewSystemLogs: false,
  }
  
  switch (role) {
    case 'ADMIN':
      // Admin has all permissions
      Object.keys(permissions).forEach(key => {
        ;(permissions as any)[key] = true
      })
      break
      
    case 'CLIENT':
      // Clients have limited permissions
      permissions.canScheduleMeetings = true
      break
  }
  
  return permissions
}

/**
 * Session validation utilities
 */
export class SessionValidator {
  static isValidSession(session: any): boolean {
    return !!(
      session &&
      session.user &&
      session.user.id &&
      session.user.email &&
      session.user.role
    )
  }
  
  static isSessionExpired(session: any): boolean {
    if (!session || !session.expires) {
      return true
    }
    
    return new Date(session.expires) < new Date()
  }
  
  static sanitizeSession(session: any) {
    if (!session || !session.user) {
      return null
    }
    
    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        image: session.user.image,
      },
      expires: session.expires,
    }
  }
}

/**
 * Client-side session hook types (for reference)
 */
export interface ClientSession {
  user: {
    id: string
    email: string
    name?: string | null
    image?: string | null
    role: UserRole
  }
  expires: string
}

/**
 * Session storage utilities for client-side
 */
export class ClientSessionStorage {
  private static readonly SESSION_KEY = 'mentorship-session'
  
  static setSession(session: ClientSession): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session))
    }
  }
  
  static getSession(): ClientSession | null {
    if (typeof window === 'undefined') {
      return null
    }
    
    try {
      const stored = localStorage.getItem(this.SESSION_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }
  
  static clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.SESSION_KEY)
    }
  }
  
  static isSessionValid(): boolean {
    const session = this.getSession()
    return session ? !SessionValidator.isSessionExpired(session) : false
  }
}

