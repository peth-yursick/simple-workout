'use client'

interface EffortInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  targetMin?: number
  targetMax?: number
}

export function EffortInput({
  value,
  onChange,
  min = 40,
  max = 100,
  targetMin,
  targetMax,
}: EffortInputProps) {
  const step = 10

  const handleIncrement = () => {
    onChange(Math.min(max, value + step))
  }

  const handleDecrement = () => {
    onChange(Math.max(min, value - step))
  }

  // Color based on effort level: green <=80%, orange 81-90%, red >90%
  const getEffortColor = () => {
    if (value > 90) return 'text-red-400'
    if (value > 80) return 'text-orange-400'
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
          <span className={`text-5xl font-bold tabular-nums ${getEffortColor()}`}>
            {value}
          </span>
          <span className="text-2xl text-gray-500 ml-1">%</span>
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
          Target: {targetMin}% - {targetMax}%
        </p>
      )}
    </div>
  )
}
