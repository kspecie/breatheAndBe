import { useEffect, useRef } from 'react'
import { motion, useAnimation, useReducedMotion } from 'framer-motion'
import type { BreathingPhase } from '../../hooks/useBreathingTimer'

interface BreathingShapeProps {
  phase: BreathingPhase
  phaseDuration: number    // seconds — full phase duration
  phaseSecondsLeft: number // seconds remaining in phase (for resume accuracy)
  isRunning: boolean
}

const scaleByPhase: Record<BreathingPhase, number> = {
  inhale: 1.5,
  holdIn: 1.5,
  exhale: 1.0,
  holdOut: 1.0,
}

const opacityByPhase: Record<BreathingPhase, number> = {
  inhale: 1.0,
  holdIn: 1.0,
  exhale: 0.6,
  holdOut: 0.6,
}

const isHoldPhase = (phase: BreathingPhase) =>
  phase === 'holdIn' || phase === 'holdOut'

export function BreathingShape({ phase, phaseDuration, phaseSecondsLeft, isRunning }: BreathingShapeProps) {
  const shouldReduceMotion = useReducedMotion()
  const circleControls = useAnimation()
  const glowControls = useAnimation()

  const targetScale = shouldReduceMotion ? 1 : scaleByPhase[phase]
  const targetOpacity = shouldReduceMotion ? opacityByPhase[phase] : 1
  const targetGlowScale = shouldReduceMotion ? 1 : scaleByPhase[phase] * 0.85 + 0.15
  const targetGlowOpacity = shouldReduceMotion ? opacityByPhase[phase] : 0.8

  // phaseSecondsLeft changes every second — keep a ref so effects don't re-run
  const phaseSecondsLeftRef = useRef(phaseSecondsLeft)
  phaseSecondsLeftRef.current = phaseSecondsLeft

  // Start (or resume) animation when phase changes or session resumes
  useEffect(() => {
    if (!isRunning) return
    // Hold phases snap quickly; active phases use remaining time for accurate resume
    const duration = isHoldPhase(phase) ? 0.15 : (phaseSecondsLeftRef.current || phaseDuration)
    circleControls.start({ scale: targetScale, opacity: targetOpacity, transition: { duration, ease: 'easeInOut' } })
    glowControls.start({ scale: targetGlowScale, opacity: targetGlowOpacity, transition: { duration, ease: 'easeInOut' } })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, isRunning])

  // Pause: freeze animation at current position
  useEffect(() => {
    if (!isRunning) {
      circleControls.stop()
      glowControls.stop()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning])

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(232,168,124,0.15) 0%, rgba(196,123,58,0.05) 70%, transparent 100%)',
          width: '320px',
          height: '320px',
        }}
        animate={glowControls}
        initial={{ scale: shouldReduceMotion ? 1 : scaleByPhase['inhale'] * 0.85 + 0.15, opacity: 0.8 }}
      />

      {/* Main breathing circle */}
      <motion.div
        className="rounded-full"
        style={{
          width: '192px',
          height: '192px',
          background:
            'radial-gradient(circle at 40% 35%, #F5C49A 0%, #E8A87C 45%, #C47B3A 100%)',
          boxShadow: '0 0 40px rgba(196, 123, 58, 0.35)',
        }}
        animate={circleControls}
        initial={{ scale: 1, opacity: 1 }}
      />
    </div>
  )
}
