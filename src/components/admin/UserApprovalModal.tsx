'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { CheckCircle, X, User, Mail, Calendar, AlertTriangle } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/LoadingStates'

interface PendingUser {
  id: string
  email: string
  name: string | null
  createdAt: string
  role: string
  isConfirmed: boolean | null
  confirmedAt: string | null
  confirmedBy: string | null
  rejectionReason: string | null
}

interface UserApprovalModalProps {
  isOpen: boolean
  user: PendingUser | null
  onClose: () => void
  onConfirm: (userId: string) => void
  loading?: boolean
}

export default function UserApprovalModal({
  isOpen,
  user,
  onClose,
  onConfirm,
  loading = false,
}: UserApprovalModalProps) {
  if (!user) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleConfirm = () => {
    onConfirm(user.id)
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        Approve User
                      </Dialog.Title>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1"
                    onClick={onClose}
                    disabled={loading}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-4">
                    Are you sure you want to approve this user? They will gain full access to the platform.
                  </p>

                  {/* User Details */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.name || 'No name provided'}
                        </p>
                        <p className="text-xs text-gray-500">Full Name</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.email}</p>
                        <p className="text-xs text-gray-500">Email Address</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(user.createdAt)}
                        </p>
                        <p className="text-xs text-gray-500">Registration Date</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warning */}
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Important</h3>
                      <p className="mt-1 text-sm text-yellow-700">
                        Once approved, this user will receive an email notification and gain immediate access to the platform.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleConfirm}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" color="white" className="mr-2" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve User
                      </>
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

