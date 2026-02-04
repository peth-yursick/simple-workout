'use client'

import { useState, useEffect } from 'react'
import { useConfetti } from '@/components/ui/Confetti'
import { Button } from '@/components/ui/Button'
import { submitWeeklyReport } from '@/app/actions/weekly-report-actions'

interface WeeklyReportModalProps {
  weekNumber: number
  programId: string | null
}

export function WeeklyReportModal({ weekNumber, programId }: WeeklyReportModalProps) {
  const { fireworks } = useConfetti()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [difficultyRating, setDifficultyRating] = useState(3)
  const [energyLevel, setEnergyLevel] = useState(3)
  const [sleepQuality, setSleepQuality] = useState(3)
  const [stressLevel, setStressLevel] = useState(3)
  const [sorenessLevel, setSorenessLevel] = useState(3)
  const [notes, setNotes] = useState('')

  // Fire confetti on mount
  useEffect(() => {
    const timer = setTimeout(() => fireworks(), 200)
    return () => clearTimeout(timer)
  }, [fireworks])

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await submitWeeklyReport({
        weekNumber,
        programId,
        difficultyRating,
        energyLevel,
        sleepQuality,
        stressLevel,
        sorenessLevel,
        notes,
      })

      // Navigate home after submission
      window.location.href = '/'
    } catch (error) {
      console.error('Failed to submit weekly report:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      setError(errorMessage || 'Failed to submit report. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 overflow-y-auto p-4 z-50">
      <div className="min-h-full flex items-center justify-center py-8">
        <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-800">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Week {weekNumber} Complete!</h2>
            <p className="text-gray-400 mt-2">How did your week go?</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
              <p className="text-red-200 text-sm font-medium">Error: {error}</p>
            </div>
          )}

          {/* Ratings form */}
          <div className="space-y-4 mb-6">
            <RatingSlider
              label="Difficulty"
              description="How hard was this week?"
              value={difficultyRating}
              onChange={setDifficultyRating}
              min={1}
              max={5}
              leftLabel="Easy"
              rightLabel="Very Hard"
            />

            <RatingSlider
              label="Energy Level"
              description="How was your energy throughout the week?"
              value={energyLevel}
              onChange={setEnergyLevel}
              min={1}
              max={5}
              leftLabel="Low"
              rightLabel="High"
            />

            <RatingSlider
              label="Sleep Quality"
              description="How well did you sleep this week?"
              value={sleepQuality}
              onChange={setSleepQuality}
              min={1}
              max={5}
              leftLabel="Poor"
              rightLabel="Great"
            />

            <RatingSlider
              label="Stress Level"
              description="How stressed were you this week?"
              value={stressLevel}
              onChange={setStressLevel}
              min={1}
              max={5}
              leftLabel="Low"
              rightLabel="High"
            />

            <RatingSlider
              label="Soreness"
              description="How sore did you feel?"
              value={sorenessLevel}
              onChange={setSorenessLevel}
              min={1}
              max={5}
              leftLabel="Minimal"
              rightLabel="Very Sore"
            />

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Additional Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional feedback for your coach..."
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Submit button */}
          <Button
            variant="primary"
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            loading={isLoading}
          >
            Submit & Start Week {weekNumber + 1}
          </Button>
        </div>
      </div>
    </div>
  )
}

interface RatingSliderProps {
  label: string
  description: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  leftLabel: string
  rightLabel: string
}

function RatingSlider({
  label,
  description,
  value,
  onChange,
  min,
  max,
  leftLabel,
  rightLabel,
}: RatingSliderProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <span className="text-sm text-blue-400 font-semibold">{value}</span>
      </div>
      <p className="text-xs text-gray-500 mb-3">{description}</p>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 w-16 text-right">{leftLabel}</span>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <span className="text-xs text-gray-500 w-16">{rightLabel}</span>
      </div>
    </div>
  )
}
