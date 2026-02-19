import { useEffect, useRef } from 'react'
import type { BreathingPhase } from './useBreathingTimer'

// ---------------------------------------------------------------------------
// Pitches — G3 (196 Hz) and D4 (294 Hz): a warm perfect fifth, lower register
// ---------------------------------------------------------------------------

const LOW_PITCH  = 196.00 // G3 — grounded, warm
const HIGH_PITCH = 293.66 // D4 — soft, airy

const isHoldPhase = (phase: BreathingPhase) =>
  phase === 'holdIn' || phase === 'holdOut'

// ---------------------------------------------------------------------------
// Module-level AudioContext (created once on first use)
// ---------------------------------------------------------------------------

let guideCtx: AudioContext | null = null

function getGuideCtx(): AudioContext {
  if (!guideCtx) guideCtx = new AudioContext()
  if (guideCtx.state === 'suspended') guideCtx.resume()
  return guideCtx
}

// Active nodes
let activeOsc: OscillatorNode | null = null

function stopGuide() {
  try { activeOsc?.stop() } catch { /* already stopped */ }
  activeOsc = null
}

function playPing(ctx: AudioContext, pitch: number, volume: number) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = pitch
  gain.gain.setValueAtTime(volume * 0.45, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 1.25)
}

function startPhaseSound(phase: BreathingPhase, duration: number, volume: number) {
  stopGuide()

  // Hold phases are silent
  if (isHoldPhase(phase)) return

  const ctx = getGuideCtx()
  const startPitch  = phase === 'inhale' ? LOW_PITCH  : HIGH_PITCH
  const targetPitch = phase === 'inhale' ? HIGH_PITCH : LOW_PITCH

  // Soft ping at phase boundary
  playPing(ctx, startPitch, volume)

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(startPitch, ctx.currentTime)
  osc.frequency.linearRampToValueAtTime(targetPitch, ctx.currentTime + duration)

  // Gain envelope: fade in, hold, fade out
  const fadeTime = Math.min(0.4, duration * 0.15)
  gain.gain.setValueAtTime(0, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(volume * 0.28, ctx.currentTime + fadeTime)
  if (duration > fadeTime * 2) {
    gain.gain.setValueAtTime(volume * 0.28, ctx.currentTime + duration - fadeTime)
  }
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + duration + 0.05)

  activeOsc = osc
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface BreathingGuideOptions {
  phase: BreathingPhase
  phaseDuration: number
  phaseSecondsLeft: number
  isRunning: boolean
  isActive: boolean  // true when soundId === 'guided' && isPlaying
  volume: number
}

export function useBreathingGuide({
  phase,
  phaseDuration,
  phaseSecondsLeft,
  isRunning,
  isActive,
  volume,
}: BreathingGuideOptions) {
  // Keep a ref so effects can read the latest value without re-running
  const phaseSecondsLeftRef = useRef(phaseSecondsLeft)
  phaseSecondsLeftRef.current = phaseSecondsLeft

  const volumeRef = useRef(volume)
  volumeRef.current = volume

  // Start (or restart) sound when phase changes or session resumes
  useEffect(() => {
    if (!isActive || !isRunning) {
      stopGuide()
      return
    }
    const remaining = phaseSecondsLeftRef.current || phaseDuration
    startPhaseSound(phase, remaining, volumeRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, isRunning, isActive])

  // Pause: stop sounds immediately
  useEffect(() => {
    if (!isRunning) stopGuide()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning])

  // Cleanup on unmount
  useEffect(() => {
    return () => stopGuide()
  }, [])
}
