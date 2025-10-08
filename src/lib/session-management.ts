import { prisma } from './prisma'

/**
 * Automatically deactivate user sessions when their enrollments expire
 * This function should be called periodically (e.g., via cron job or scheduled task)
 */
export async function deactivateExpiredSessions() {
  try {
    console.log('🔄 Checking for expired enrollments...')
    
    // Find all users with expired enrollments
    const expiredEnrollments = await prisma.enrollment.findMany({
      where: {
        status: 'ACTIVE',
        expiresAt: {
          lt: new Date() // Expired enrollments
        }
      },
      select: {
        userId: true,
        expiresAt: true
      },
      distinct: ['userId'] // Only get unique user IDs
    })

    console.log(`Found ${expiredEnrollments.length} users with expired enrollments`)

    for (const enrollment of expiredEnrollments) {
      // Check if user has any remaining active, non-expired enrollments
      const activeEnrollments = await prisma.enrollment.count({
        where: {
          userId: enrollment.userId,
          status: 'ACTIVE',
          OR: [
            { expiresAt: null }, // No expiry date
            { expiresAt: { gt: new Date() } } // Not expired
          ]
        }
      })

      // If no active enrollments remain, deactivate the user's session
      if (activeEnrollments === 0) {
        await prisma.user.update({
          where: { id: enrollment.userId },
          data: {
            sessionStatus: 'INACTIVE',
            sessionActivatedAt: null,
            sessionActivatedBy: null
          }
        })
        
        console.log(`✅ Deactivated session for user ${enrollment.userId} - no active enrollments`)
      } else {
        console.log(`⏭️ User ${enrollment.userId} still has ${activeEnrollments} active enrollments`)
      }
    }

    return {
      success: true,
      processedUsers: expiredEnrollments.length
    }
  } catch (error) {
    console.error('❌ Error in deactivateExpiredSessions:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Check and update a specific user's session status based on their enrollments
 */
export async function updateUserSessionStatus(userId: string) {
  try {
    // Count active, non-expired enrollments
    const activeEnrollments = await prisma.enrollment.count({
      where: {
        userId,
        status: 'ACTIVE',
        OR: [
          { expiresAt: null }, // No expiry date
          { expiresAt: { gt: new Date() } } // Not expired
        ]
      }
    })

    // Get current user session status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { sessionStatus: true }
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    // Update session status based on active enrollments
    if (activeEnrollments > 0 && user.sessionStatus !== 'ACTIVE') {
      // Activate session if user has active enrollments but session is not active
      await prisma.user.update({
        where: { id: userId },
        data: {
          sessionStatus: 'ACTIVE',
          sessionActivatedAt: new Date(),
          sessionActivatedBy: 'system' // Mark as system-activated
        }
      })
      
      return { 
        success: true, 
        action: 'activated',
        activeEnrollments 
      }
    } else if (activeEnrollments === 0 && user.sessionStatus === 'ACTIVE') {
      // Deactivate session if user has no active enrollments but session is active
      await prisma.user.update({
        where: { id: userId },
        data: {
          sessionStatus: 'INACTIVE',
          sessionActivatedAt: null,
          sessionActivatedBy: null
        }
      })
      
      return { 
        success: true, 
        action: 'deactivated',
        activeEnrollments: 0 
      }
    }

    return { 
      success: true, 
      action: 'no_change',
      activeEnrollments,
      currentStatus: user.sessionStatus 
    }
  } catch (error) {
    console.error('❌ Error in updateUserSessionStatus:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
