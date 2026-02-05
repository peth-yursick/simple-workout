'use client'

import { useState } from 'react'
import { IndividualMuscleVolume, MuscleGroupVolume } from '@/lib/utils/statsCalculations'

type MuscleView = 'simple' | 'full'

interface MuscleBalanceProps {
  muscleGroups: MuscleGroupVolume[]
  individualMuscles: IndividualMuscleVolume[]
}

// Categorize muscles by push/pull movement pattern
const PUSH_MUSCLES = new Set([
  'Pectorals',
  'Anterior Deltoids',
  'Lateral Deltoids',
  'Triceps',
  'Quadriceps',
  'Calves',
  'Serratus Anterior',
])

const PULL_MUSCLES = new Set([
  'Latissimus Dorsi',
  'Teres Major',
  'Rhomboids',
  'Middle Trapezius',
  'Lower Trapezius',
  'Posterior Deltoids',
  'Biceps',
  'Brachialis',
  'Brachioradialis',
  'Forearms',
  'Hamstrings',
  'Glutes',
  'Adductors',
  'Abductors',
])

const CORE_MUSCLES = new Set([
  'Rectus Abdominis',
  'Obliques',
  'Transverse Abdominis',
  'Erector Spinae',
])

function getMovementPattern(muscle: string): 'push' | 'pull' | 'core' | null {
  if (PUSH_MUSCLES.has(muscle)) return 'push'
  if (PULL_MUSCLES.has(muscle)) return 'pull'
  if (CORE_MUSCLES.has(muscle)) return 'core'
  return null
}

export function MuscleBalance({ muscleGroups, individualMuscles }: MuscleBalanceProps) {
  const [view, setView] = useState<MuscleView>('simple')
  const currentData = view === 'simple' ? muscleGroups : individualMuscles

  // Calculate average percentage
  const avgPercentage = currentData.reduce((sum, d) => sum + d.percentage, 0) / currentData.length

  const getBarColor = (percentage: number) => {
    if (percentage >= avgPercentage * 1.2) return 'bg-green-500' // Above average
    if (percentage >= avgPercentage * 0.8) return 'bg-yellow-500' // Average
    return 'bg-red-500' // Below average
  }

  const getTextColor = (percentage: number) => {
    if (percentage >= avgPercentage * 1.2) return 'text-green-400'
    if (percentage >= avgPercentage * 0.8) return 'text-yellow-400'
    return 'text-red-400'
  }

  // Format volume for display
  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`
    if (vol >= 1000) return `${(vol / 1000).toFixed(0)}K`
    return vol.toString()
  }

  // Show top items (6 for groups, 12 for individual)
  const topItems = view === 'simple' ? currentData.slice(0, 6) : currentData.slice(0, 12)

  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-300">Muscle Balance</h3>
        <div className="flex gap-1 bg-gray-800 rounded-lg p-0.5">
          <button
            onClick={() => setView('simple')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              view === 'simple'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Simple
          </button>
          <button
            onClick={() => setView('full')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              view === 'full'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Full
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {topItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No muscle data available yet. Complete some workouts to see your muscle balance.
          </div>
        ) : (
          topItems.map((item) => {
            const isPrimary = view === 'full' && 'isPrimary' in item && (item as IndividualMuscleVolume).isPrimary
            const movementPattern = view === 'full' ? getMovementPattern(item.muscle) : null

            return (
              <div key={item.muscle}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white">{item.muscle}</span>
                    {isPrimary && (
                      <span className="text-xs px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded">Primary</span>
                    )}
                    {movementPattern === 'push' && (
                      <span className="text-xs px-2 py-0.5 bg-orange-900/30 text-orange-400 rounded" title="Push movement">▶</span>
                    )}
                    {movementPattern === 'pull' && (
                      <span className="text-xs px-2 py-0.5 bg-purple-900/30 text-purple-400 rounded" title="Pull movement">◀</span>
                    )}
                    {movementPattern === 'core' && (
                      <span className="text-xs px-2 py-0.5 bg-cyan-900/30 text-cyan-400 rounded" title="Core">◆</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{formatVolume(item.volume)} kg</span>
                    <span className={`text-xs ${getTextColor(item.percentage)}`}>
                      {item.percentage}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getBarColor(item.percentage)}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-center gap-4 text-xs flex-wrap">
        {view === 'full' && (
          <>
            <div className="flex items-center gap-1">
              <span className="text-xs px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded">Primary</span>
              <span className="text-gray-500">Primary target</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs px-2 py-0.5 bg-orange-900/30 text-orange-400 rounded">▶</span>
              <span className="text-gray-500">Push</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs px-2 py-0.5 bg-purple-900/30 text-purple-400 rounded">◀</span>
              <span className="text-gray-500">Pull</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs px-2 py-0.5 bg-cyan-900/30 text-cyan-400 rounded">◆</span>
              <span className="text-gray-500">Core</span>
            </div>
          </>
        )}
        {view === 'simple' && (
          <>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-gray-500">Strong</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span className="text-gray-500">Balanced</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-gray-500">Needs work</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
