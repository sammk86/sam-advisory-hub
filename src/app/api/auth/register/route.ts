import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { UserRole } from '@/types'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['ADMIN', 'CLIENT']).optional().default('CLIENT'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input data
    const validatedData = registerSchema.parse(body)
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })
    
    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'USER_EXISTS', 
            message: 'User with this email already exists' 
          } 
        },
        { status: 409 }
      )
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)
    
    // Create user (Note: We're not storing password in current schema)
    // In a real implementation, you'd add a password field to the User model
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        role: validatedData.role as UserRole,
        emailVerified: new Date(), // Auto-verify for demo purposes
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })
    
    return NextResponse.json({
      success: true,
      data: {
        user,
        message: 'User registered successfully',
      },
    })
    
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error.errors,
          },
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      },
      { status: 500 }
    )
  }
}

