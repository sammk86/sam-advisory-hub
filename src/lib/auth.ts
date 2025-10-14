import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  // Remove adapter for credentials provider
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            isConfirmed: true,
            confirmedAt: true,
            confirmedBy: true,
            rejectionReason: true,
            sessionStatus: true,
            sessionActivatedAt: true,
            sessionActivatedBy: true,
          }
        })

        if (!user) {
          return null
        }

        if (!user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        // Return user data even if not confirmed - we'll handle redirects in the frontend
        // This allows us to access user information for proper routing

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isConfirmed: user.isConfirmed,
          confirmedAt: user.confirmedAt,
          confirmedBy: user.confirmedBy,
          rejectionReason: user.rejectionReason,
          sessionStatus: user.sessionStatus,
          sessionActivatedAt: user.sessionActivatedAt,
          sessionActivatedBy: user.sessionActivatedBy,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.isConfirmed = user.isConfirmed
        token.confirmedAt = user.confirmedAt
        token.confirmedBy = user.confirmedBy
        token.rejectionReason = user.rejectionReason
        token.sessionStatus = user.sessionStatus
        token.sessionActivatedAt = user.sessionActivatedAt
        token.sessionActivatedBy = user.sessionActivatedBy
      }
      return token
    },
    async session({ session, token }) {
      if (token && token.id) {
        // Fetch fresh user data from database to ensure we have the latest confirmation status
        try {
          const user = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              isConfirmed: true,
              confirmedAt: true,
              confirmedBy: true,
              rejectionReason: true,
              sessionStatus: true,
              sessionActivatedAt: true,
              sessionActivatedBy: true,
            }
          })

          if (user) {
            session.user.id = user.id
            session.user.role = user.role as any
            session.user.isConfirmed = user.isConfirmed ?? false
            session.user.confirmedAt = user.confirmedAt?.toISOString() || null
            session.user.confirmedBy = user.confirmedBy
            session.user.rejectionReason = user.rejectionReason
            session.user.sessionStatus = user.sessionStatus as any
            session.user.sessionActivatedAt = user.sessionActivatedAt?.toISOString() || null
            session.user.sessionActivatedBy = user.sessionActivatedBy
          } else {
            // Fallback to token data if user not found
            session.user.id = token.id as string
            session.user.role = token.role as any
            session.user.isConfirmed = token.isConfirmed as boolean
            session.user.confirmedAt = token.confirmedAt as string
            session.user.confirmedBy = token.confirmedBy as string
            session.user.rejectionReason = token.rejectionReason as string
            session.user.sessionStatus = token.sessionStatus as any
            session.user.sessionActivatedAt = token.sessionActivatedAt as string
            session.user.sessionActivatedBy = token.sessionActivatedBy as string
          }
        } catch (error) {
          console.error('Error fetching user data in session callback:', error)
          // Fallback to token data on error
          session.user.id = token.id as string
          session.user.role = token.role as any
          session.user.isConfirmed = token.isConfirmed as boolean
          session.user.confirmedAt = token.confirmedAt as string
          session.user.confirmedBy = token.confirmedBy as string
          session.user.rejectionReason = token.rejectionReason as string
          session.user.sessionStatus = token.sessionStatus as any
          session.user.sessionActivatedAt = token.sessionActivatedAt as string
          session.user.sessionActivatedBy = token.sessionActivatedBy as string
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  debug: process.env.NODE_ENV === 'development',
}