import bcrypt from 'bcryptjs'

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (password.length > 128) {
    errors.push('Password must be less than 128 characters long')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  // Check for common weak passwords
  const commonPasswords = [
    'password',
    '123456',
    '123456789',
    'qwerty',
    'abc123',
    'password123',
    'admin',
    'letmein',
    'welcome',
    'monkey',
  ]

  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common and easily guessable')
  }

  // Check for repeated characters
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password should not contain repeated characters')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length: number = 16): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  
  const allChars = lowercase + uppercase + numbers + symbols
  
  let password = ''
  
  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }
  
  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('')
}

/**
 * Check if password has been compromised (placeholder for future implementation)
 * In production, you might integrate with HaveIBeenPwned API
 */
export async function checkPasswordCompromised(password: string): Promise<boolean> {
  // Placeholder implementation
  // In production, you would hash the password and check against known breaches
  const commonCompromisedPasswords = [
    'password',
    '123456',
    'password123',
    'admin',
    'qwerty123',
  ]
  
  return commonCompromisedPasswords.includes(password.toLowerCase())
}

/**
 * Password strength score (0-4)
 */
export function getPasswordStrengthScore(password: string): {
  score: number
  feedback: string
} {
  let score = 0
  let feedback = 'Very Weak'

  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++

  // Bonus for length
  if (password.length >= 16) score++

  // Penalty for common patterns
  if (/(.)\1{2,}/.test(password)) score--
  if (/123|abc|qwe/i.test(password)) score--

  // Ensure score is within bounds
  score = Math.max(0, Math.min(4, score))

  switch (score) {
    case 0:
    case 1:
      feedback = 'Very Weak'
      break
    case 2:
      feedback = 'Weak'
      break
    case 3:
      feedback = 'Good'
      break
    case 4:
      feedback = 'Strong'
      break
  }

  return { score, feedback }
}



