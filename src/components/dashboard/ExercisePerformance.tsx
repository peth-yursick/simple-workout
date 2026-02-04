import { ExerciseProgress } from '@/lib/utils/statsCalculations'

interface ExercisePerformanceProps {
  advancing: ExerciseProgress[]
  stagnating: ExerciseProgress[]
}

export function ExercisePerformance({ advancing, stagnating }: ExercisePerformanceProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Advancing */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <h3 className="text-sm font-medium text-gray-300">Advancing</h3>
        </div>

        {advancing.length === 0 ? (
          <p className="text-xs text-gray-500">No advancing exercises yet</p>
        ) : (
          <div className="space-y-3">
            {advancing.map((exercise) => (
              <ExerciseItem
                key={exercise.name}
                exercise={exercise}
                type="advancing"
              />
            ))}
          </div>
        )}
      </div>

      {/* Stagnating */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-amber-500 rounded-full" />
          <h3 className="text-sm font-medium text-gray-300">Stagnating</h3>
        </div>

        {stagnating.length === 0 ? (
          <p className="text-xs text-gray-500">All exercises progressing!</p>
        ) : (
          <div className="space-y-3">
            {stagnating.map((exercise) => (
              <ExerciseItem
                key={exercise.name}
                exercise={exercise}
                type="stagnating"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface ExerciseItemProps {
  exercise: ExerciseProgress
  type: 'advancing' | 'stagnating'
}

function ExerciseItem({ exercise, type }: ExerciseItemProps) {
  const startWeight = exercise.weightHistory[0]
  const currentWeight = exercise.weightHistory[exercise.weightHistory.length - 1]
  const hasProgressed = startWeight !== currentWeight

  return (
    <div className="border-b border-gray-800 pb-2 last:border-0 last:pb-0">
      <div className="text-sm text-white font-medium truncate">{exercise.name}</div>
      <div className="flex items-center justify-between mt-0.5">
        <div className="text-xs text-gray-500">
          {type === 'advancing' ? (
            <>+{exercise.totalIncreases} increase{exercise.totalIncreases !== 1 ? 's' : ''}</>
          ) : (
            <>No change ({exercise.weeksSinceIncrease}w)</>
          )}
        </div>
        {/* Simplified weight: start → current */}
        <div className="flex items-center text-xs">
          {hasProgressed ? (
            <>
              <span className="text-gray-500">{startWeight}</span>
              <svg className="w-3 h-3 text-gray-600 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className={type === 'advancing' ? 'text-green-400' : 'text-amber-400'}>
                {currentWeight}kg
              </span>
            </>
          ) : (
            <span className={type === 'advancing' ? 'text-green-400' : 'text-amber-400'}>
              {currentWeight}kg
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
