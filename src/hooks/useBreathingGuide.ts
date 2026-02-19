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
// Synthesis functions
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

// Standard piano note — fast attack, exponential decay
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

// Deep bong note — longer decay, softer attack; used for exhale's final note.
// Intentionally NOT added to activeOscillators so it rings freely into holdOut.
const BONG_DECAY_TIME = 3.5

function playBongNote(
  ctx: AudioContext,
  freq: number,
  volume: number,
  when: number,
  decayTime: number = BONG_DECAY_TIME
) {
  HARMONICS.forEach(([mult, relAmp]) => {
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq * mult
    const peak = volume * relAmp * 0.22
    gainNode.gain.setValueAtTime(0, when)
    gainNode.gain.linearRampToValueAtTime(peak, when + 0.012)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, when + decayTime)
    osc.connect(gainNode)
    gainNode.connect(ctx.destination)
    osc.start(when)
    osc.stop(when + decayTime + 0.05)
    // not pushed to activeOscillators — rings into holdOut naturally
  })
}

// Gentle chime — single sine, very soft; intentionally NOT added to activeOscillators
// so it rings freely through the hold phase rather than being cut off at the transition
const CHIME_DECAY_TIME = 2.0

function playChimeNote(
  ctx: AudioContext,
  freq: number,
  volume: number,
  when: number,
  decayTime: number = CHIME_DECAY_TIME
) {
  const osc = ctx.createOscillator()
  const gainNode = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  const peak = volume * 0.11
  gainNode.gain.setValueAtTime(0, when)
  gainNode.gain.linearRampToValueAtTime(peak, when + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, when + decayTime)
  osc.connect(gainNode)
  gainNode.connect(ctx.destination)
  osc.start(when)
  osc.stop(when + decayTime + 0.05)
  // not pushed to activeOscillators — rings into hold naturally
}

// ---------------------------------------------------------------------------
// Schedule arpeggios
// ---------------------------------------------------------------------------

function scheduleInhaleArpeggio(
  ctx: AudioContext,
  phaseDuration: number,
  volume: number,
  holdInDuration: number
) {
  const spacing = phaseDuration / INHALE_NOTES.length
  INHALE_NOTES.forEach((freq, i) => {
    playPianoNote(ctx, freq, volume, ctx.currentTime + i * spacing)
  })
  // Soft chime only for patterns with a holdIn — lingers and fades across the hold
  if (holdInDuration > 0) {
    playChimeNote(ctx, INHALE_TOP_NOTE, volume, ctx.currentTime + phaseDuration, holdInDuration)
  }
}

function scheduleExhaleArpeggio(
  ctx: AudioContext,
  phaseDuration: number,
  volume: number,
  holdOutDuration: number
) {
  const spacing = phaseDuration / EXHALE_NOTES.length
  // When there's a holdOut, extend the bong decay to cover the remaining exhale
  // time plus the full hold — so it fades to silence right as the hold ends
  const bongDecay = holdOutDuration > 0
    ? Math.max(BONG_DECAY_TIME, spacing + holdOutDuration)
    : BONG_DECAY_TIME
  EXHALE_NOTES.forEach((freq, i) => {
    const when = ctx.currentTime + i * spacing
    if (i === EXHALE_NOTES.length - 1) {
      playBongNote(ctx, freq, volume, when, bongDecay)
    } else {
      playPianoNote(ctx, freq, volume, when)
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
  stopGuide()
  if (isHoldPhase(phase)) return

  const ctx = getGuideCtx()
  if (phase === 'inhale') {
    scheduleInhaleArpeggio(ctx, duration, volume, holdInDuration)
  } else {
    scheduleExhaleArpeggio(ctx, duration, volume, holdOutDuration)
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
      stopGuide()
      return
    }
    const remaining = phaseSecondsLeftRef.current || phaseDuration
    startPhaseSound(phase, remaining, volumeRef.current, holdInDurationRef.current, holdOutDurationRef.current)
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
