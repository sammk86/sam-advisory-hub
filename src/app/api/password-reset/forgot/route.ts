import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import { getBaseUrl } from '@/lib/utils'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    console.log('Forgot password API called')
    const { email } = await request.json()
    console.log('Email received:', email)

    // Get the base URL dynamically from the request
    // This handles various deployment scenarios (Vercel, Netlify, etc.)
    const baseUrl = getBaseUrl(request)
    console.log('Constructed base URL:', baseUrl)

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    console.log('Looking for user with email:', email.toLowerCase())
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })
    console.log('User found:', user ? 'YES' : 'NO')

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.',
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Store reset token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiry: resetTokenExpiry,
      },
    })

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(
      user.email,
      user.name || 'User',
      resetToken,
      user.id,
      baseUrl
    )

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error)
      // For development/testing, we'll still return success but log the error
      console.log('Password reset token generated:', resetToken)
      console.log('Reset URL would be:', `${baseUrl}/auth/reset-password?token=${resetToken}`)
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
