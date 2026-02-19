import { useEffect, useRef } from 'react'
import type { BreathingPhase } from './useBreathingTimer'

// ---------------------------------------------------------------------------
// Note frequencies for arpeggios
// ---------------------------------------------------------------------------

// Inhale: ascending G3 → A3 → D4
const INHALE_NOTES = [196.00, 220.00, 293.66]

// Exhale: descending D4 → G3 → D3 (progressively deeper)
const EXHALE_NOTES = [293.66, 196.00, 146.83]

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

// Active oscillator nodes — stopped to silence in-flight tones immediately
let activeOscillators: OscillatorNode[] = []

function stopGuide() {
  activeOscillators.forEach((osc) => {
    try { osc.stop() } catch { /* node already stopped */ }
  })
  activeOscillators = []
}

// ---------------------------------------------------------------------------
// Piano-like additive synthesis
// ---------------------------------------------------------------------------

// Harmonic partials: [frequency multiplier, relative amplitude]
const HARMONICS: [number, number][] = [
  [1, 1.00],
  [2, 0.50],
  [3, 0.25],
  [4, 0.12],
  [5, 0.06],
]

const DECAY_TIME = 2.2 // seconds — natural piano-like decay length

function playPianoNote(
  ctx: AudioContext,
  freq: number,
  volume: number,
  when: number
) {
  HARMONICS.forEach(([mult, relAmp]) => {
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.value = freq * mult

    // Instantaneous strike then exponential decay (percussive piano envelope)
    const peak = volume * relAmp * 0.28
    gainNode.gain.setValueAtTime(0, when)
    gainNode.gain.linearRampToValueAtTime(peak, when + 0.005)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, when + DECAY_TIME)

    osc.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc.start(when)
    osc.stop(when + DECAY_TIME + 0.05)

    activeOscillators.push(osc)
  })
}

// ---------------------------------------------------------------------------
// Schedule arpeggio across a phase
// ---------------------------------------------------------------------------

function scheduleArpeggio(
  ctx: AudioContext,
  notes: number[],
  phaseDuration: number,
  volume: number
) {
  const spacing = phaseDuration / notes.length
  notes.forEach((freq, i) => {
    const when = ctx.currentTime + i * spacing
    playPianoNote(ctx, freq, volume, when)
  })
}

// ---------------------------------------------------------------------------
// Phase dispatcher
// ---------------------------------------------------------------------------

function startPhaseSound(phase: BreathingPhase, duration: number, volume: number) {
  stopGuide()
  if (isHoldPhase(phase)) return

  const ctx = getGuideCtx()
  const notes = phase === 'inhale' ? INHALE_NOTES : EXHALE_NOTES
  scheduleArpeggio(ctx, notes, duration, volume)
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
  const phaseSecondsLeftRef = useRef(phaseSecondsLeft)
  phaseSecondsLeftRef.current = phaseSecondsLeft

  const volumeRef = useRef(volume)
  volumeRef.current = volume

  // Start arpeggio when phase changes or session resumes
  useEffect(() => {
    if (!isActive || !isRunning) {
      stopGuide()
      return
    }
    const remaining = phaseSecondsLeftRef.current || phaseDuration
    startPhaseSound(phase, remaining, volumeRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, isRunning, isActive])

  // Pause: silence all in-flight tones immediately
  useEffect(() => {
    if (!isRunning) stopGuide()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning])

  // Cleanup on unmount
  useEffect(() => {
    return () => stopGuide()
  }, [])
}
