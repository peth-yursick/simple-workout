'use client'

interface RPEInputProps {
  value: number // 6-10, 0.5 increments
  onChange: (value: number) => void
  min?: number
  max?: number
  targetMin?: number
  targetMax?: number
}

export function RPEInput({
  value,
  onChange,
  min = 6,
  max = 10,
  targetMin,
  targetMax,
}: RPEInputProps) {
  const step = 0.5

  const handleIncrement = () => {
    onChange(Math.min(max, Math.round((value + step) * 10) / 10))
  }

  const handleDecrement = () => {
    onChange(Math.max(min, Math.round((value - step) * 10) / 10))
  }

  // Color based on RPE level: green <=8, yellow 8.5, red >=9
  const getRPEColor = () => {
    if (value >= 9) return 'text-red-400'
    if (value > 8) return 'text-yellow-400'
    return 'text-green-400'
  }

  return (
    <div className="flex flex-col items-center">
      {/* Large number display with +/- buttons */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={handleDecrement}
          disabled={value <= min}
          className="w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-2xl font-bold transition-colors"
        >
          -
        </button>
        <div className="flex items-baseline">
          <span className={`text-5xl font-bold tabular-nums ${getRPEColor()}`}>
            {value.toFixed(1)}
          </span>
          <span className="text-2xl text-gray-500 ml-1">RPE</span>
        </div>
        <button
          onClick={handleIncrement}
          disabled={value >= max}
          className="w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-2xl font-bold transition-colors"
        >
          +
        </button>
      </div>

      {/* Target range indicator */}
      {targetMin !== undefined && targetMax !== undefined && (
        <p className="text-sm text-gray-400">
          Target: {targetMin.toFixed(1)} - {targetMax.toFixed(1)} RPE
        </p>
      )}

      {/* RPE description */}
      <p className="text-xs text-gray-500 mt-2 max-w-xs text-center">
        {getRPEDescription(value)}
      </p>
    </div>
  )
}

function getRPEDescription(rpe: number): string {
  if (rpe <= 6.5) return 'Moderate - Could do 4+ more reps'
  if (rpe <= 7) return 'Vigorous - Could do 3 more reps'
  if (rpe <= 7.5) return 'Hard - Could do 2-3 more reps'
  if (rpe <= 8) return 'Hard - Could do 2 more reps'
  if (rpe <= 8.5) return 'Very hard - Could do 1 more rep'
  if (rpe <= 9.5) return 'Near max - Could do 0-1 more reps'
  return 'Maximum - No reps left in the tank'
}
