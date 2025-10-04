import { shouldSkipConfirmationCheck, getUserStatusRedirect } from '@/middleware/user-confirmation'

describe('User Confirmation Middleware Tests', () => {
  describe('shouldSkipConfirmationCheck', () => {
    it('should skip confirmation check for public routes', () => {
      const publicRoutes = [
        '/',
        '/about',
        '/services',
        '/pricing',
        '/contact',
        '/auth/signin',
        '/auth/signup',
        '/auth/forgot-password',
        '/pending',
        '/rejected',
        '/api/auth/signin',
        '/_next/static/chunks/main.js',
        '/favicon.ico',
      ]

      publicRoutes.forEach(route => {
        expect(shouldSkipConfirmationCheck(route)).toBe(true)
      })
    })

    it('should not skip confirmation check for protected routes', () => {
      const protectedRoutes = [
        '/dashboard',
        '/admin/users',
        '/profile',
        '/settings',
        '/api/users/profile',
      ]

      protectedRoutes.forEach(route => {
        expect(shouldSkipConfirmationCheck(route)).toBe(false)
      })
    })
  })

  describe('getUserStatusRedirect', () => {
    it('should return null for confirmed users', () => {
      const redirect = getUserStatusRedirect(true, null, '/dashboard')
      expect(redirect).toBeNull()
    })

    it('should redirect to rejected page for users with rejection reason', () => {
      const redirect = getUserStatusRedirect(false, 'Incomplete profile', '/dashboard')
      expect(redirect).toBe('/rejected')
    })

    it('should redirect to pending page for unconfirmed users without rejection reason', () => {
      const redirect = getUserStatusRedirect(false, null, '/dashboard')
      expect(redirect).toBe('/pending')
    })

    it('should redirect to signin for users with null confirmation status', () => {
      const redirect = getUserStatusRedirect(null, null, '/dashboard')
      expect(redirect).toBe('/auth/signin')
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined confirmation status', () => {
      const redirect = getUserStatusRedirect(undefined, null, '/dashboard')
      expect(redirect).toBe('/auth/signin')
    })

    it('should handle empty rejection reason', () => {
      const redirect = getUserStatusRedirect(false, '', '/dashboard')
      expect(redirect).toBe('/pending')
    })

    it('should handle various rejection reasons', () => {
      const rejectionReasons = [
        'Incomplete profile information',
        'Unclear career goals',
        'Does not meet criteria',
        'Missing required information',
      ]

      rejectionReasons.forEach(reason => {
        const redirect = getUserStatusRedirect(false, reason, '/dashboard')
        expect(redirect).toBe('/rejected')
      })
    })
  })

  describe('Route Protection Logic', () => {
    it('should identify admin routes as protected', () => {
      const adminRoutes = [
        '/admin/users',
        '/admin/dashboard',
        '/admin/settings',
      ]

      adminRoutes.forEach(route => {
        expect(shouldSkipConfirmationCheck(route)).toBe(false)
      })
    })

    it('should identify user dashboard routes as protected', () => {
      const userRoutes = [
        '/dashboard',
        '/profile',
        '/settings',
        '/enrollments',
      ]

      userRoutes.forEach(route => {
        expect(shouldSkipConfirmationCheck(route)).toBe(false)
      })
    })

    it('should identify API routes as protected', () => {
      const apiRoutes = [
        '/api/users/profile',
        '/api/admin/users',
        '/api/enrollments',
      ]

      apiRoutes.forEach(route => {
        expect(shouldSkipConfirmationCheck(route)).toBe(false)
      })
    })
  })

  describe('User Status Scenarios', () => {
    it('should handle confirmed users correctly', () => {
      const redirect = getUserStatusRedirect(true, null, '/dashboard')
      expect(redirect).toBeNull()
    })

    it('should handle confirmed users with rejection reason', () => {
      const redirect = getUserStatusRedirect(true, 'Previous rejection', '/dashboard')
      expect(redirect).toBeNull()
    })

    it('should handle unconfirmed users without rejection reason', () => {
      const redirect = getUserStatusRedirect(false, null, '/dashboard')
      expect(redirect).toBe('/pending')
    })

    it('should handle unconfirmed users with rejection reason', () => {
      const redirect = getUserStatusRedirect(false, 'Incomplete profile', '/dashboard')
      expect(redirect).toBe('/rejected')
    })
  })
})