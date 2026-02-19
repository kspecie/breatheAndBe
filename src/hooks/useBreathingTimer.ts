import { useState, useEffect, useRef, useCallback } from 'react'
import type { BreathingPattern } from '../types'

export type BreathingPhase = 'inhale' | 'holdIn' | 'exhale' | 'holdOut'

const PHASE_ORDER: BreathingPhase[] = ['inhale', 'holdIn', 'exhale', 'holdOut']

const PHASE_LABELS: Record<BreathingPhase, string> = {
  inhale: 'Inhale',
  holdIn: 'Hold',
  exhale: 'Exhale',
  holdOut: 'Hold',
}

export interface BreathingTimerState {
  phase: BreathingPhase
  phaseLabel: string
  phaseSecondsLeft: number
  phaseDuration: number
  cyclesCompleted: number
  totalCycles: number
  sessionProgress: number // 0–100
  isRunning: boolean
  isFinished: boolean
  pause: () => void
  resume: () => void
  end: () => void
}

export function useBreathingTimer(
  pattern: BreathingPattern,
  durationMinutes: number
): BreathingTimerState {
  // Build the list of active phases (duration > 0)
  const activePhases = PHASE_ORDER.filter(
    (p) => pattern.phases[p] > 0
  )

  const cycleSeconds = activePhases.reduce(
    (sum, p) => sum + pattern.phases[p],
    0
  )
  const totalCycles = Math.max(1, Math.ceil((durationMinutes * 60) / cycleSeconds))

  const [phaseIndex, setPhaseIndex] = useState(0)
  const [cyclesCompleted, setCyclesCompleted] = useState(0)
  const [elapsed100ms, setElapsed100ms] = useState(0) // ticks within current phase
  const [isRunning, setIsRunning] = useState(true)
  const [isFinished, setIsFinished] = useState(false)

  const isRunningRef = useRef(isRunning)
  isRunningRef.current = isRunning

  const isFinishedRef = useRef(isFinished)
  isFinishedRef.current = isFinished

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isRunningRef.current || isFinishedRef.current) return

      setElapsed100ms((prev) => prev + 1)
    }, 100)

    return () => clearInterval(interval)
  }, []) // intentionally empty — refs keep it current

  // Advance phase when elapsed ticks fill the current phase duration
  useEffect(() => {
    const currentPhase = activePhases[phaseIndex]
    const phaseTicks = pattern.phases[currentPhase] * 10

    if (elapsed100ms >= phaseTicks) {
      const nextIndex = phaseIndex + 1

      if (nextIndex >= activePhases.length) {
        // Completed one full cycle
        const newCycles = cyclesCompleted + 1
        setCyclesCompleted(newCycles)

        if (newCycles >= totalCycles) {
          setIsFinished(true)
          setIsRunning(false)
        } else {
          setPhaseIndex(0)
          setElapsed100ms(0)
        }
      } else {
        setPhaseIndex(nextIndex)
        setElapsed100ms(0)
      }
    }
  }, [elapsed100ms, phaseIndex, activePhases, pattern.phases, cyclesCompleted, totalCycles])

  const currentPhase = activePhases[phaseIndex]
  const phaseDuration = pattern.phases[currentPhase]
  const phaseSecondsLeft = Math.max(
    0,
    phaseDuration - Math.floor(elapsed100ms / 10)
  )

  // Overall session progress 0–100
  const totalSessionTicks = totalCycles * cycleSeconds * 10
  const elapsedSessionTicks =
    cyclesCompleted * cycleSeconds * 10 +
    activePhases.slice(0, phaseIndex).reduce((s, p) => s + pattern.phases[p] * 10, 0) +
    elapsed100ms
  const sessionProgress = Math.min(100, (elapsedSessionTicks / totalSessionTicks) * 100)

  const pause = useCallback(() => setIsRunning(false), [])
  const resume = useCallback(() => setIsRunning(true), [])
  const end = useCallback(() => {
    setIsRunning(false)
    setIsFinished(true)
  }, [])

  return {
    phase: currentPhase,
    phaseLabel: PHASE_LABELS[currentPhase],
    phaseSecondsLeft,
    phaseDuration,
    cyclesCompleted,
    totalCycles,
    sessionProgress,
    isRunning,
    isFinished,
    pause,
    resume,
    end,
  }
}
