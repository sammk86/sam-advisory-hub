/**
 * Get the base URL for the application
 * Works in both client and server environments
 */
export function getBaseUrl(): string {
  // In server environment
  if (typeof window === 'undefined') {
    return process.env.NEXTAUTH_URL || 'http://localhost:3000'
  }
  
  // In client environment
  return window.location.origin
}

/**
 * Get full URL for a given path
 */
export function getFullUrl(path: string): string {
  const baseUrl = getBaseUrl()
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
}
