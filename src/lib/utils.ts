import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { NextRequest } from 'next/server'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the base URL dynamically from the request headers
 * This handles various deployment scenarios (Vercel, Netlify, etc.)
 */
export function getBaseUrl(request: NextRequest): string {
  const protocol = request.headers.get('x-forwarded-proto') || 
                  request.headers.get('x-forwarded-protocol') || 
                  (request.url.startsWith('https') ? 'https' : 'http')
  const host = request.headers.get('host') || 
              request.headers.get('x-forwarded-host') || 
              'localhost:3000'
  return `${protocol}://${host}`
}

/**
 * Get the base URL from environment variables or request
 * Falls back to localhost for development
 */
export function getBaseUrlFromEnv(): string {
  return process.env.NEXTAUTH_URL || 
         process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
         'http://localhost:3000'
}
