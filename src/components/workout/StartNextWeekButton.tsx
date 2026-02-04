'use client'

import { useState } from 'react'
import { startNextWeek } from '@/app/actions/workout-actions'

interface StartNextWeekButtonProps {
  currentWeek: number
}

export function StartNextWeekButton({ currentWeek }: StartNextWeekButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleStartNextWeek = async () => {
    setIsLoading(true)
    try {
      await startNextWeek(currentWeek, currentWeek + 1, {})
      // Use window.location for full page reload to ensure server components refresh
      window.location.href = '/'
    } catch (error) {
      console.error('Failed to start next week:', error)
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleStartNextWeek}
      disabled={isLoading}
      className="w-full mt-6 py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
    >
      {isLoading ? 'Starting...' : `Start Week ${currentWeek + 1}`}
    </button>
  )
}
