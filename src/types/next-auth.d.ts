import NextAuth from 'next-auth'
import { UserRole } from './index'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: UserRole
      isConfirmed: boolean
      confirmedAt?: string | null
      confirmedBy?: string | null
      rejectionReason?: string | null
      sessionStatus: string
      sessionActivatedAt?: string | null
      sessionActivatedBy?: string | null
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    image?: string | null
    role: UserRole
    isConfirmed: boolean
    confirmedAt?: string | null
    confirmedBy?: string | null
    rejectionReason?: string | null
    sessionStatus: string
    sessionActivatedAt?: string | null
    sessionActivatedBy?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
    isConfirmed: boolean
    confirmedAt?: string | null
    confirmedBy?: string | null
    rejectionReason?: string | null
    sessionStatus: string
    sessionActivatedAt?: string | null
    sessionActivatedBy?: string | null
  }
}


