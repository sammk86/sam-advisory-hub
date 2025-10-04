// User types
export type UserRole = 'ADMIN' | 'CLIENT'

export interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  role: UserRole
  emailVerified: Date | null
  createdAt: Date
  updatedAt: Date
}

// Service types
export type ServiceType = 'MENTORSHIP' | 'ADVISORY'
export type ServiceStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
export type ProgramFormat = 'INDIVIDUAL' | 'GROUP'

export interface Service {
  id: string
  name: string
  description: string
  type: ServiceType
  status: ServiceStatus
  singleSessionPrice: number | null
  monthlyPlanPrice: number | null
  hourlyRate: number | null
  createdAt: Date
  updatedAt: Date
}

// Enrollment types
export type PlanType = 'SINGLE_SESSION' | 'MONTHLY_PLAN' | 'CONSULTATION' | 'PACKAGE' | 'RETAINER'
export type EnrollmentStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'COMPLETED'

export interface Enrollment {
  id: string
  userId: string
  serviceId: string
  planType: PlanType
  status: EnrollmentStatus
  enrolledAt: Date
  advisoryPackageId: string | null
  hoursRemaining: number | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
}

// Progress tracking types
export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
export type DeliverableStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'COMPLETED'
export type DeliverableType = 'REPORT' | 'STRATEGIC_PLAN' | 'ARCHITECTURE_REVIEW' | 'CODE_REVIEW' | 'RECOMMENDATION_DOCUMENT' | 'CUSTOM'

// Meeting types
export type MeetingStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface Meeting {
  id: string
  enrollmentId: string
  title: string
  description: string | null
  scheduledAt: Date
  duration: number
  status: MeetingStatus
  videoLink: string | null
  agenda: string | null
  notes: string | null
  recordingUrl: string | null
  hoursConsumed: number | null
  createdAt: Date
  updatedAt: Date
}

// Payment types
export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED'

export interface Payment {
  id: string
  enrollmentId: string
  stripePaymentId: string
  amount: number
  currency: string
  status: PaymentStatus
  paymentType: PlanType
  description: string | null
  paidAt: Date | null
  createdAt: Date
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
}

// Form types
export interface RegisterFormData {
  email: string
  name: string
  password: string
  role?: UserRole
}

export interface LoginFormData {
  email: string
  password: string
}

export interface ServiceFormData {
  name: string
  description: string
  type: ServiceType
  singleSessionPrice?: number
  monthlyPlanPrice?: number
  hourlyRate?: number
}
