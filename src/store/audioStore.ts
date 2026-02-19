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
  source.connect(gain)
  source.start()
  activeSourceNodes.push(source)
}

function startRain(ctx: AudioContext, gain: GainNode) {
  const source = loopingNoiseSource(ctx, 3)

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 500
  filter.Q.value = 0.5

  source.connect(filter)
  filter.connect(gain)
  source.start()
  activeSourceNodes.push(source)
}

function startOcean(ctx: AudioContext, gain: GainNode) {
  const source = loopingNoiseSource(ctx, 4)

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 350
  filter.Q.value = 1.0

  // LFO to create wave rhythm (~8s cycle)
  const lfo = ctx.createOscillator()
  lfo.type = 'sine'
  lfo.frequency.value = 0.12

  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 0.35

  source.connect(filter)
  filter.connect(gain)
  lfo.connect(lfoGain)
  lfoGain.connect(gain.gain)

  source.start()
  lfo.start()
  activeSourceNodes.push(source, lfo)
}

function startBowls(ctx: AudioContext, gain: GainNode) {
  const fundamentals = [432, 528, 396]
  let timeoutId: ReturnType<typeof setTimeout>

  function playStrike() {
    const freq = fundamentals[Math.floor(Math.random() * fundamentals.length)]
    const harmonics = [1, 2, 3, 4]

    harmonics.forEach((harmonic, i) => {
      const osc = ctx.createOscillator()
      const oscGain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq * harmonic

      const harmonicVol = gain.gain.value * (0.5 / Math.pow(1.5, i))
      oscGain.gain.setValueAtTime(harmonicVol, ctx.currentTime)
      oscGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 4)

      osc.connect(oscGain)
      oscGain.connect(ctx.destination)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 4.1)
      activeSourceNodes.push(osc)
    })
  }

  function scheduleBowl() {
    playStrike()
    const delay = 4000 + Math.random() * 3000
    timeoutId = setTimeout(scheduleBowl, delay)
  }

  scheduleBowl()
  activeCleanup = () => clearTimeout(timeoutId)
}

function startForest(ctx: AudioContext, gain: GainNode) {
  // Background: bandpass-filtered noise for rustling leaves / wind
  const source = loopingNoiseSource(ctx, 3)

  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 800
  filter.Q.value = 0.3

  const noiseGain = ctx.createGain()
  noiseGain.gain.value = 0.3

  source.connect(filter)
  filter.connect(noiseGain)
  noiseGain.connect(gain)
  source.start()
  activeSourceNodes.push(source)

  // Bird chirps: random high-frequency oscillator bursts
  let timeoutId: ReturnType<typeof setTimeout>

  function scheduleChirp() {
    const delay = 2000 + Math.random() * 5000
    timeoutId = setTimeout(() => {
      if (!audioCtx || audioCtx.state === 'closed') return

      const osc = ctx.createOscillator()
      const chirpGain = ctx.createGain()
      osc.type = 'sine'

      const freq = 1200 + Math.random() * 1600
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(freq * 1.3, ctx.currentTime + 0.08)
      osc.frequency.exponentialRampToValueAtTime(freq, ctx.currentTime + 0.15)

      chirpGain.gain.setValueAtTime(0, ctx.currentTime)
      chirpGain.gain.linearRampToValueAtTime(gain.gain.value * 0.15, ctx.currentTime + 0.02)
      chirpGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2)

      osc.connect(chirpGain)
      chirpGain.connect(ctx.destination)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.3)
      activeSourceNodes.push(osc)

      scheduleChirp()
    }, delay)
  }

  scheduleChirp()
  activeCleanup = () => clearTimeout(timeoutId)
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

function startSound(id: SoundId, volume: number) {
  stopAll()
  if (id === 'silence') return

  const ctx = getCtx()
  masterGain = ctx.createGain()
  masterGain.gain.value = volume
  masterGain.connect(ctx.destination)

  switch (id) {
    case 'white-noise': startWhiteNoise(ctx, masterGain); break
    case 'rain':        startRain(ctx, masterGain);       break
    case 'ocean':       startOcean(ctx, masterGain);      break
    case 'bowls':       startBowls(ctx, masterGain);      break
    case 'forest':      startForest(ctx, masterGain);     break
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
  volume: prefs.volume ?? 0.6,
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
