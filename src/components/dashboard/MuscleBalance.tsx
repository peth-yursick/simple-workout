'use client'

import { useState, useMemo } from 'react'
import { IndividualMuscleVolume, MuscleGroupVolume } from '@/lib/utils/statsCalculations'

type MuscleView = 'simple' | 'full' | 'push-pull'

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

  // Calculate push/pull split data
  const pushPullData = useMemo(() => {
    const patternVolumes: Record<string, number> = { push: 0, pull: 0, core: 0 }

    for (const muscle of individualMuscles) {
      const pattern = getMovementPattern(muscle.muscle)
      if (pattern) {
        patternVolumes[pattern] += muscle.volume
      }
    }

    const maxVolume = Math.max(...Object.values(patternVolumes), 1)

    return [
      { muscle: 'Push', volume: patternVolumes.push, percentage: Math.round((patternVolumes.push / maxVolume) * 100) },
      { muscle: 'Pull', volume: patternVolumes.pull, percentage: Math.round((patternVolumes.pull / maxVolume) * 100) },
      { muscle: 'Core', volume: patternVolumes.core, percentage: Math.round((patternVolumes.core / maxVolume) * 100) },
    ].filter(d => d.volume > 0).sort((a, b) => b.volume - a.volume)
  }, [individualMuscles])

  const currentData = view === 'simple' ? muscleGroups : view === 'full' ? individualMuscles : pushPullData

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

  // Show top items (6 for groups, 12 for individual, all for push-pull)
  const topItems = view === 'push-pull' ? currentData : view === 'simple' ? currentData.slice(0, 6) : currentData.slice(0, 12)

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
          <button
            onClick={() => setView('push-pull')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              view === 'push-pull'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Push/Pull
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {topItems.map((item) => {
          const isPrimaryItem = view === 'full' && 'isPrimary' in item && (item as IndividualMuscleVolume).isPrimary
          return (
            <div key={item.muscle}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white">{item.muscle}</span>
                  {isPrimaryItem && (
                    <span className="text-xs px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded">Primary</span>
                  )}
                  {view === 'push-pull' && (
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      item.muscle === 'Push' ? 'bg-orange-900/30 text-orange-400' :
                      item.muscle === 'Pull' ? 'bg-purple-900/30 text-purple-400' :
                      'bg-cyan-900/30 text-cyan-400'
                    }`}>
                      {item.muscle === 'Push' ? '▶' : item.muscle === 'Pull' ? '◀' : '◆'}
                    </span>
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
                  className={`h-full rounded-full transition-all duration-500 ${
                    view === 'push-pull'
                      ? (item.muscle === 'Push' ? 'bg-orange-500' : item.muscle === 'Pull' ? 'bg-purple-500' : 'bg-cyan-500')
                      : getBarColor(item.percentage)
                  }`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-center gap-4 text-xs">
        {view === 'full' && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="text-gray-500">Primary target</span>
          </div>
        )}
        {view === 'push-pull' && (
          <>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <span className="text-gray-500">Push (▶)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span className="text-gray-500">Pull (◀)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-cyan-500 rounded-full" />
              <span className="text-gray-500">Core (◆)</span>
            </div>
          </>
        )}
        {view !== 'push-pull' && (
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
