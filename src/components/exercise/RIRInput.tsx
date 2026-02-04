'use client'

interface RIRInputProps {
  value: number // 0-3
  onChange: (value: number) => void
  min?: number
  max?: number
  targetMin?: number
  targetMax?: number
}

export function RIRInput({
  value,
  onChange,
  min = 0,
  max = 3,
  targetMin,
  targetMax,
}: RIRInputProps) {
  const step = 1

  const handleIncrement = () => {
    onChange(Math.min(max, value + step))
  }

  const handleDecrement = () => {
    onChange(Math.max(min, value - step))
  }

  // Color based on RIR level: green 0-1, orange 2, red 3
  const getRIRColor = () => {
    if (value >= 3) return 'text-red-400'
    if (value === 2) return 'text-orange-400'
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
          <span className={`text-5xl font-bold tabular-nums ${getRIRColor()}`}>
            {value}
          </span>
          <span className="text-2xl text-gray-500 ml-1">RIR</span>
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
          Target: {targetMin} - {targetMax} RIR
        </p>
      )}

      {/* RIR description */}
      <p className="text-xs text-gray-500 mt-2 max-w-xs text-center">
        {getRIRDescription(value)}
      </p>
    </div>
  )
}

function getRIRDescription(rir: number): string {
  if (rir === 0) return 'Max effort - No reps left'
  if (rir === 1) return 'Near max - 1 rep left'
  if (rir === 2) return 'Hard - 2 reps left'
  return 'Moderate - 3+ reps left'
}
