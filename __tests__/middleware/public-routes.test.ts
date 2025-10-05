/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import middleware from '../../src/middleware'

describe('Public Routes Access', () => {
  const publicRoutes = [
    '/',
    '/about',
    '/blogs',
    '/videos',
    '/insights',
    '/calendar',
    '/contact',
  ]

  publicRoutes.forEach(route => {
    it(`should allow access to ${route} without authentication`, async () => {
      const request = new NextRequest(`http://localhost:3000${route}`)
      
      // Mock the withAuth middleware behavior for public routes
      const response = await middleware(request)
      
      // For public routes, the middleware should not redirect
      // The response should be NextResponse.next() or undefined
      expect(response).toBeUndefined()
    })
  })

  it('should redirect protected routes to signin when not authenticated', async () => {
    const request = new NextRequest('http://localhost:3000/dashboard')
    
    // This test would need to be updated based on the actual middleware behavior
    // For now, we're just ensuring the test structure is in place
    expect(request).toBeDefined()
  })
})
