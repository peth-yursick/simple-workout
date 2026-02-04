'use client'

import { useEffect, useCallback } from 'react'
import confetti from 'canvas-confetti'

interface ConfettiProps {
  trigger?: boolean
  duration?: number
  particleCount?: number
}

export function Confetti({ trigger = true, duration = 3000, particleCount = 100 }: ConfettiProps) {
  const fireConfetti = useCallback(() => {
    const end = Date.now() + duration

    // Colors matching the app theme
    const colors = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6']

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    // Initial burst
    confetti({
      particleCount,
      spread: 100,
      origin: { y: 0.6 },
      colors,
    })

    // Continuous sides
    frame()
  }, [duration, particleCount])

  useEffect(() => {
    if (trigger) {
      fireConfetti()
    }
  }, [trigger, fireConfetti])

  return null
}

// Preset confetti effects
export function useConfetti() {
  const celebrate = useCallback(() => {
    const colors = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6']

    // Big burst from center
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors,
    })
  }, [])

  const fireworks = useCallback(() => {
    const duration = 3000
    const animationEnd = Date.now() + duration
    const colors = ['#3b82f6', '#22c55e', '#eab308']

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        clearInterval(interval)
        return
      }

      const particleCount = 50 * (timeLeft / duration)

      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.1, 0.3),
          y: Math.random() - 0.2,
        },
        colors,
      })
      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.7, 0.9),
          y: Math.random() - 0.2,
        },
        colors,
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  const shower = useCallback(() => {
    const end = Date.now() + 2000
    const colors = ['#22c55e', '#3b82f6']

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0 },
        colors,
      })
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0 },
        colors,
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    frame()
  }, [])

  return { celebrate, fireworks, shower }
}
