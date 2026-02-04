'use client'

import { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'

interface ImportWarningModalProps {
  onCancel: () => void
  onConfirm: () => void
  isLoading?: boolean
  summary?: ReactNode
}

export function ImportWarningModal({ onCancel, onConfirm, isLoading, summary }: ImportWarningModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={onCancel}>
      <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 border border-gray-800 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-yellow-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Import Program</h2>
          <p className="text-gray-400">
            This will replace your entire training program.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            All existing workouts and progress will be deleted.
          </p>
          {summary}
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            className="flex-1 bg-yellow-600 hover:bg-yellow-700"
            onClick={onConfirm}
            loading={isLoading}
          >
            Upload Anyway
          </Button>
        </div>
      </div>
    </div>
  )
}
