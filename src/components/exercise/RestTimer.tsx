'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/Button'

interface RestTimerProps {
  duration?: number // in seconds, defaults to 120 (2 minutes)
  onFinish: () => void
}

export function RestTimer({ duration = 120, onFinish }: RestTimerProps) {
  // Store the end time instead of counting down
  const [endTime] = useState(() => Date.now() + duration * 1000)
  const [timeLeft, setTimeLeft] = useState(duration)
  const hasFinished = useRef(false)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Create audio context on mount (do this lazily on user interaction ideally)
  useEffect(() => {
    // We'll initialize the AudioContext when needed (on play)
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
    }
  }, [])

  const playDing = useCallback(() => {
    try {
      // Create audio context on first play (better for browser compatibility)
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        audioContextRef.current = new AudioContextClass()
      }

      const ctx = audioContextRef.current
      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      // Create oscillator for beep sound
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.value = 830 // Hz
      oscillator.type = 'sine'

      // Envelope: quick attack, fade out
      const now = ctx.currentTime
      gainNode.gain.setValueAtTime(0.3, now)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3)

      oscillator.start(now)
      oscillator.stop(now + 0.3)
    } catch (e) {
      console.log('Could not play sound:', e)
    }
  }, [])

  const handleFinish = useCallback(() => {
    if (hasFinished.current) return
    hasFinished.current = true
    playDing()
    onFinish()
  }, [onFinish, playDing])

  useEffect(() => {
    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000))
      setTimeLeft(remaining)

      if (remaining <= 0) {
        handleFinish()
      }
    }

    // Update immediately
    updateTimer()

    // Update every second
    const timer = setInterval(updateTimer, 1000)

    // Also update when tab becomes visible again (handles background)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        // Resume audio context if it was suspended
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().catch(e => console.log('Could not resume audio context:', e))
        }
        updateTimer()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [endTime, handleFinish])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  const progress = ((duration - timeLeft) / duration) * 100

  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col items-center justify-center z-50">
      {/* Timer display */}
      <div className="text-center mb-12">
        <p className="text-gray-400 text-lg mb-4">Rest</p>
        <div className="text-8xl font-bold text-white tabular-nums">
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress ring */}
      <div className="relative w-48 h-48 mb-12">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-800"
          />
          {/* Progress circle */}
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            className="text-blue-500 transition-all duration-1000"
            style={{
              strokeDasharray: `${2 * Math.PI * 88}`,
              strokeDashoffset: `${2 * Math.PI * 88 * (1 - progress / 100)}`,
            }}
          />
        </svg>
      </div>

      {/* Skip button */}
      <Button
        variant="secondary"
        size="lg"
        onClick={onFinish}
        className="px-12"
      >
        Skip Rest
      </Button>
    </div>
  )
}
