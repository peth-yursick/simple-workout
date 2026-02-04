'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  showValue?: boolean
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ label, showValue = true, value, min = 0, max = 100, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {(label || showValue) && (
          <div className="flex justify-between items-center mb-2">
            {label && (
              <label className="text-sm font-medium text-gray-300">{label}</label>
            )}
            {showValue && (
              <span className="text-sm font-medium text-white">{value}</span>
            )}
          </div>
        )}
        <input
          ref={ref}
          type="range"
          value={value}
          min={min}
          max={max}
          className={`
            w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer
            accent-blue-600
            ${className}
          `}
          {...props}
        />
      </div>
    )
  }
)

Slider.displayName = 'Slider'
