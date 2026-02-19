import { create } from 'zustand'
import type { SoundId } from '../data/ambientSounds'

const PREFS_KEY = 'breathe-be:preferences'

// ---------------------------------------------------------------------------
// Persisted preferences helpers
// ---------------------------------------------------------------------------

interface Prefs {
  ambientSound?: SoundId
  volume?: number
}

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    return raw ? (JSON.parse(raw) as Prefs) : {}
  } catch {
    return {}
  }
}

function savePrefs(prefs: Prefs) {
  try {
    const existing = loadPrefs()
    localStorage.setItem(PREFS_KEY, JSON.stringify({ ...existing, ...prefs }))
  } catch {
    // localStorage unavailable — silently ignore
  }
}

// ---------------------------------------------------------------------------
// Audio engine (lives outside Zustand — not serialisable)
// ---------------------------------------------------------------------------

let audioCtx: AudioContext | null = null
let masterGain: GainNode | null = null
let activeSourceNodes: AudioScheduledSourceNode[] = []
let activeCleanup: (() => void) | null = null

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

function stopAll() {
  activeCleanup?.()
  activeCleanup = null

  activeSourceNodes.forEach((node) => {
    try { node.stop() } catch { /* already stopped */ }
  })
  activeSourceNodes = []
  masterGain = null
}

function setEngineVolume(volume: number) {
  if (masterGain) masterGain.gain.value = volume
}

// ---------------------------------------------------------------------------
// Noise buffer helper (shared by multiple sounds)
// ---------------------------------------------------------------------------

function makeNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const bufferSize = ctx.sampleRate * seconds
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }
  return buffer
}

function loopingNoiseSource(ctx: AudioContext, seconds: number): AudioBufferSourceNode {
  const source = ctx.createBufferSource()
  source.buffer = makeNoiseBuffer(ctx, seconds)
  source.loop = true
  return source
}

// ---------------------------------------------------------------------------
// Synthesizers
// ---------------------------------------------------------------------------

function startWhiteNoise(ctx: AudioContext, gain: GainNode) {
  const source = loopingNoiseSource(ctx, 2)

  // Aggressive lowpass + pre-gain to keep perceived loudness low and gentle
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 800
  filter.Q.value = 0.5

  const preGain = ctx.createGain()
  preGain.gain.value = 0.35

  source.connect(filter)
  filter.connect(preGain)
  preGain.connect(gain)
  source.start()
  activeSourceNodes.push(source)
}


// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

function startSound(id: SoundId, volume: number) {
  stopAll()
  if (id === 'silence' || id === 'guided') return

  const ctx = getCtx()
  masterGain = ctx.createGain()
  masterGain.gain.value = volume
  masterGain.connect(ctx.destination)

  switch (id) {
    case 'white-noise': startWhiteNoise(ctx, masterGain); break
  }
}

// ---------------------------------------------------------------------------
// Zustand store
// ---------------------------------------------------------------------------

interface AudioState {
  soundId: SoundId
  volume: number
  isPlaying: boolean
  setSound: (id: SoundId) => void
  setVolume: (vol: number) => void
  play: () => void
  stop: () => void
  /** Internal — kept for interface stability */
  _handleLoadError: () => void
}

const prefs = loadPrefs()

export const useAudioStore = create<AudioState>((set, get) => ({
  soundId: prefs.ambientSound ?? 'silence',
  volume: Math.min(prefs.volume ?? 0.25, 0.5),
  isPlaying: false,

  setSound(id) {
    stopAll()
    set({ soundId: id })
    savePrefs({ ambientSound: id })

    if (get().isPlaying) {
      startSound(id, get().volume)
    }
  },

  setVolume(vol) {
    set({ volume: vol })
    savePrefs({ volume: vol })
    setEngineVolume(vol)
  },

  play() {
    const { soundId, volume, isPlaying } = get()
    if (isPlaying) return
    set({ isPlaying: true })
    startSound(soundId, volume)
  },

  stop() {
    stopAll()
    set({ isPlaying: false })
  },

  _handleLoadError() {
    // No-op: all sounds are synthesized, load errors can't occur
  },
}))
