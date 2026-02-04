'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { createDay } from '@/app/actions/workout-actions'

interface AddDayModalProps {
  weekNumber: number
  nextDayNumber: number
  onClose: () => void
}

export function AddDayModal({ weekNumber, nextDayNumber, onClose }: AddDayModalProps) {
  const router = useRouter()
  const [dayNumber, setDayNumber] = useState(String(nextDayNumber))
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const num = Number(dayNumber)
    if (!num || num < 1) return

    setIsLoading(true)
    try {
      await createDay(weekNumber, num)
      router.refresh()
      onClose()
    } catch (error) {
      console.error('Failed to create day:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl max-w-sm w-full p-6 border border-gray-800" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-4">Add Day</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Day Number</label>
            <input
              type="number"
              value={dayNumber}
              onChange={(e) => setDayNumber(e.target.value)}
              min={1}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1" loading={isLoading} disabled={!dayNumber || Number(dayNumber) < 1}>
              Add
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
