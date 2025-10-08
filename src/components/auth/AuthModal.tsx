'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import SigninForm from './SigninForm'
import SignupForm from './SignupForm'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'signin' | 'signup'
  service?: string
  plan?: string
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  initialMode = 'signin',
  service,
  plan 
}: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode)

  const handleSuccess = () => {
    onClose()
    // The forms will handle their own redirects
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="w-full">
        {mode === 'signin' ? (
          <SigninForm 
            onSuccess={handleSuccess}
            onSwitchToSignup={() => setMode('signup')}
            service={service}
            plan={plan}
          />
        ) : (
          <SignupForm 
            onSuccess={handleSuccess}
            onSwitchToSignin={() => setMode('signin')}
            service={service}
            plan={plan}
          />
        )}
      </div>
    </Modal>
  )
}



