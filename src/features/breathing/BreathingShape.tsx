import { motion, useReducedMotion } from 'framer-motion'
import type { BreathingPhase } from '../../hooks/useBreathingTimer'

interface BreathingShapeProps {
  phase: BreathingPhase
  phaseDuration: number // seconds — used to sync animation
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

export function BreathingShape({ phase, phaseDuration }: BreathingShapeProps) {
  const shouldReduceMotion = useReducedMotion()

  const targetScale = shouldReduceMotion ? 1 : scaleByPhase[phase]
  const targetOpacity = shouldReduceMotion ? opacityByPhase[phase] : 1
  const transitionDuration = isHoldPhase(phase) ? 0.15 : phaseDuration

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
        animate={{
          scale: shouldReduceMotion ? 1 : scaleByPhase[phase] * 0.85 + 0.15,
          opacity: shouldReduceMotion ? opacityByPhase[phase] : 0.8,
        }}
        transition={{
          duration: isHoldPhase(phase) ? 0.15 : phaseDuration,
          ease: 'easeInOut',
        }}
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
        animate={{
          scale: targetScale,
          opacity: targetOpacity,
        }}
        transition={{
          duration: transitionDuration,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}
