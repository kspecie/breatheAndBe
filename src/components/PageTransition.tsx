import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: shouldReduceMotion ? 0 : 0.15, ease: 'easeOut' } }}
      exit={{ opacity: 0, transition: { duration: 0 } }}
    >
      {children}
    </motion.div>
  )
}
