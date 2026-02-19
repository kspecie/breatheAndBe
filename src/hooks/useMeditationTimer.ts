import { useEffect, useRef, useState } from 'react'
import type { Meditation } from '../types'

export interface MeditationTimerState {
  currentParagraphIndex: number
  paragraphSecondsLeft: number
  totalSecondsLeft: number
  sessionProgress: number // 0–100
  isRunning: boolean
  isFinished: boolean
  pause: () => void
  resume: () => void
  end: () => void
}

export function useMeditationTimer(meditation: Meditation): MeditationTimerState {
  const totalSeconds = meditation.durationMinutes * 60

  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0)
  const [paragraphSecondsLeft, setParagraphSecondsLeft] = useState(
    meditation.paragraphs[0]?.durationSeconds ?? 0
  )
  const [isRunning, setIsRunning] = useState(true)
  const [isFinished, setIsFinished] = useState(false)

  // Accumulated seconds elapsed (for progress calculation)
  const elapsedSecondsRef = useRef(0)
  const paragraphIndexRef = useRef(0)
  const paragraphSecondsLeftRef = useRef(meditation.paragraphs[0]?.durationSeconds ?? 0)

  // Keep a state copy for re-render purposes
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    if (!isRunning || isFinished) return

    const interval = setInterval(() => {
      elapsedSecondsRef.current += 1

      const newSecondsLeft = paragraphSecondsLeftRef.current - 1

      if (newSecondsLeft <= 0) {
        // Advance to next paragraph
        const nextIndex = paragraphIndexRef.current + 1
        if (nextIndex >= meditation.paragraphs.length) {
          // Session complete
          setIsFinished(true)
          setIsRunning(false)
          clearInterval(interval)
          return
        }
        const nextDuration = meditation.paragraphs[nextIndex].durationSeconds
        paragraphIndexRef.current = nextIndex
        paragraphSecondsLeftRef.current = nextDuration
        setCurrentParagraphIndex(nextIndex)
        setParagraphSecondsLeft(nextDuration)
      } else {
        paragraphSecondsLeftRef.current = newSecondsLeft
        setParagraphSecondsLeft(newSecondsLeft)
      }

      forceUpdate((n) => n + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, isFinished, meditation.paragraphs])

  function pause() {
    setIsRunning(false)
  }

  function resume() {
    if (!isFinished) setIsRunning(true)
  }

  function end() {
    setIsRunning(false)
    setIsFinished(true)
  }

  return {
    currentParagraphIndex,
    paragraphSecondsLeft,
    totalSecondsLeft: Math.max(0, totalSeconds - elapsedSecondsRef.current),
    sessionProgress: Math.min(100, (elapsedSecondsRef.current / totalSeconds) * 100),
    isRunning,
    isFinished,
    pause,
    resume,
    end,
  }
}
