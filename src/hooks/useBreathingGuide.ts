import { useEffect, useRef } from 'react'
import type { BreathingPhase } from './useBreathingTimer'

// ---------------------------------------------------------------------------
// Note frequencies
// ---------------------------------------------------------------------------

// Inhale: ascending G3 → A3 → D4, with a gentle G4 chime at the peak
const INHALE_NOTES = [196.00, 220.00, 293.66]
const INHALE_TOP_NOTE = 392.00 // G4 — soft chime marking the breath peak / start of hold

// Exhale: descending D4 → A3 → G3 → D3 (4th note is a deep bong)
const EXHALE_NOTES = [293.66, 220.00, 196.00, 146.83]

const isHoldPhase = (phase: BreathingPhase) =>
  phase === 'holdIn' || phase === 'holdOut'

// ---------------------------------------------------------------------------
// Module-level AudioContext + master gain (created once on first use)
// ---------------------------------------------------------------------------

let guideCtx: AudioContext | null = null
let guideMasterGain: GainNode | null = null

function getGuideCtx(): AudioContext {
  if (!guideCtx) guideCtx = new AudioContext()
  if (guideCtx.state === 'suspended') guideCtx.resume()
  return guideCtx
}

/**
 * Call this synchronously inside a user gesture (e.g. a button click handler)
 * to unlock the guide AudioContext on iOS before the session mounts.
 * iOS (Safari and Chrome) only allows AudioContext creation/resumption within
 * a gesture; React useEffect runs after paint and can miss that window.
 */
export function primeGuideAudio(): void {
  const ctx = getGuideCtx()
  if (ctx.state === 'suspended') ctx.resume()
}

function getGuideMasterGain(ctx: AudioContext): GainNode {
  if (!guideMasterGain) {
    guideMasterGain = ctx.createGain()
    guideMasterGain.connect(ctx.destination)
  }
  return guideMasterGain
}

// Called live when volume slider moves — updates immediately mid-phase
function setGuideVolume(volume: number) {
  if (guideMasterGain) guideMasterGain.gain.value = volume
}

// ---------------------------------------------------------------------------
// Oscillator tracking
// Two arrays so phase-transition stops don't cut lingering hold notes:
//   activeOscillators — stopped on each phase change
//   freeOscillators   — stopped only on a full stop (sound switch / pause / unmount)
// ---------------------------------------------------------------------------

let activeOscillators: OscillatorNode[] = []
let freeOscillators: OscillatorNode[] = []

function stopActivePhase() {
  activeOscillators.forEach((osc) => {
    try { osc.stop() } catch { /* already stopped */ }
  })
  activeOscillators = []
}

function stopGuide() {
  stopActivePhase()
  freeOscillators.forEach((osc) => {
    try { osc.stop() } catch { /* already stopped */ }
  })
  freeOscillators = []
}

// ---------------------------------------------------------------------------
// Synthesis functions — all route through guideMasterGain for live volume
// ---------------------------------------------------------------------------

// Harmonic partials: [frequency multiplier, relative amplitude]
const HARMONICS: [number, number][] = [
  [1, 1.00],
  [2, 0.50],
  [3, 0.25],
  [4, 0.12],
  [5, 0.06],
]

const DECAY_TIME = 2.2

// Standard piano note — registered in activeOscillators (stopped on phase change)
function playPianoNote(
  ctx: AudioContext,
  freq: number,
  masterGain: GainNode,
  when: number
) {
  HARMONICS.forEach(([mult, relAmp]) => {
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq * mult
    const peak = relAmp * 0.28 // volume handled by masterGain
    gainNode.gain.setValueAtTime(0, when)
    gainNode.gain.linearRampToValueAtTime(peak, when + 0.005)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, when + DECAY_TIME)
    osc.connect(gainNode)
    gainNode.connect(masterGain)
    osc.start(when)
    osc.stop(when + DECAY_TIME + 0.05)
    activeOscillators.push(osc)
  })
}

// Deep bong note — registered in freeOscillators (rings through holdOut, stopped on full stop)
const BONG_DECAY_TIME = 3.5

function playBongNote(
  ctx: AudioContext,
  freq: number,
  masterGain: GainNode,
  when: number,
  decayTime: number = BONG_DECAY_TIME
) {
  HARMONICS.forEach(([mult, relAmp]) => {
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq * mult
    const peak = relAmp * 0.22
    gainNode.gain.setValueAtTime(0, when)
    gainNode.gain.linearRampToValueAtTime(peak, when + 0.012)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, when + decayTime)
    osc.connect(gainNode)
    gainNode.connect(masterGain)
    osc.start(when)
    osc.stop(when + decayTime + 0.05)
    freeOscillators.push(osc) // rings into holdOut; stopped on full stop
  })
}

// Gentle chime — registered in freeOscillators (rings through holdIn, stopped on full stop)
const CHIME_DECAY_TIME = 2.0

function playChimeNote(
  ctx: AudioContext,
  freq: number,
  masterGain: GainNode,
  when: number,
  decayTime: number = CHIME_DECAY_TIME
) {
  const osc = ctx.createOscillator()
  const gainNode = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  const peak = 0.11
  gainNode.gain.setValueAtTime(0, when)
  gainNode.gain.linearRampToValueAtTime(peak, when + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, when + decayTime)
  osc.connect(gainNode)
  gainNode.connect(masterGain)
  osc.start(when)
  osc.stop(when + decayTime + 0.05)
  freeOscillators.push(osc) // rings into holdIn; stopped on full stop
}

// ---------------------------------------------------------------------------
// Schedule arpeggios
// ---------------------------------------------------------------------------

function scheduleInhaleArpeggio(
  ctx: AudioContext,
  masterGain: GainNode,
  phaseDuration: number,
  holdInDuration: number
) {
  const spacing = phaseDuration / INHALE_NOTES.length
  INHALE_NOTES.forEach((freq, i) => {
    playPianoNote(ctx, freq, masterGain, ctx.currentTime + i * spacing)
  })
  // Soft chime only for patterns with a holdIn — lingers and fades across the hold
  if (holdInDuration > 0) {
    playChimeNote(ctx, INHALE_TOP_NOTE, masterGain, ctx.currentTime + phaseDuration, holdInDuration)
  }
}

function scheduleExhaleArpeggio(
  ctx: AudioContext,
  masterGain: GainNode,
  phaseDuration: number,
  holdOutDuration: number
) {
  const spacing = phaseDuration / EXHALE_NOTES.length
  const bongDecay = holdOutDuration > 0
    ? Math.max(BONG_DECAY_TIME, spacing + holdOutDuration)
    : BONG_DECAY_TIME
  EXHALE_NOTES.forEach((freq, i) => {
    const when = ctx.currentTime + i * spacing
    if (i === EXHALE_NOTES.length - 1) {
      playBongNote(ctx, freq, masterGain, when, bongDecay)
    } else {
      playPianoNote(ctx, freq, masterGain, when)
    }
  })
}

// ---------------------------------------------------------------------------
// Phase dispatcher
// ---------------------------------------------------------------------------

function startPhaseSound(
  phase: BreathingPhase,
  duration: number,
  volume: number,
  holdInDuration: number,
  holdOutDuration: number
) {
  stopActivePhase() // only stop regular notes — let lingering hold notes ring
  if (isHoldPhase(phase)) return

  const ctx = getGuideCtx()
  const masterGain = getGuideMasterGain(ctx)
  masterGain.gain.value = volume

  if (phase === 'inhale') {
    scheduleInhaleArpeggio(ctx, masterGain, duration, holdInDuration)
  } else {
    scheduleExhaleArpeggio(ctx, masterGain, duration, holdOutDuration)
  }
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
  holdInDuration: number   // 0 for patterns without a hold
  holdOutDuration: number  // 0 for patterns without a hold
}

export function useBreathingGuide({
  phase,
  phaseDuration,
  phaseSecondsLeft,
  isRunning,
  isActive,
  volume,
  holdInDuration,
  holdOutDuration,
}: BreathingGuideOptions) {
  const phaseSecondsLeftRef = useRef(phaseSecondsLeft)
  phaseSecondsLeftRef.current = phaseSecondsLeft

  const volumeRef = useRef(volume)
  volumeRef.current = volume

  const holdInDurationRef = useRef(holdInDuration)
  holdInDurationRef.current = holdInDuration

  const holdOutDurationRef = useRef(holdOutDuration)
  holdOutDurationRef.current = holdOutDuration

  // Start arpeggio when phase changes or session resumes
  useEffect(() => {
    if (!isActive || !isRunning) {
      stopGuide() // full stop — clears free oscillators too
      return
    }
    const remaining = phaseSecondsLeftRef.current || phaseDuration
    startPhaseSound(phase, remaining, volumeRef.current, holdInDurationRef.current, holdOutDurationRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, isRunning, isActive])

  // Live volume update — takes effect immediately on the master gain
  useEffect(() => {
    setGuideVolume(volume)
  }, [volume])

  // Pause: full stop
  useEffect(() => {
    if (!isRunning) stopGuide()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning])

  // Cleanup on unmount
  useEffect(() => {
    return () => stopGuide()
  }, [])
}
