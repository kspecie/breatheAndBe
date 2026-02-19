import { create } from 'zustand'
import { Howl } from 'howler'
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

let howlInstance: Howl | null = null
let audioCtx: AudioContext | null = null
let whiteNoiseSource: AudioBufferSourceNode | null = null
let gainNode: GainNode | null = null

function stopAll() {
  howlInstance?.stop()
  howlInstance?.unload()
  howlInstance = null

  whiteNoiseSource?.stop()
  whiteNoiseSource = null
  gainNode = null
  // Leave audioCtx alive — re-using it avoids iOS autoplay restrictions
}

function startWhiteNoise(volume: number) {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }

  gainNode = audioCtx.createGain()
  gainNode.gain.value = volume
  gainNode.connect(audioCtx.destination)

  const bufferSize = audioCtx.sampleRate * 2
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }

  whiteNoiseSource = audioCtx.createBufferSource()
  whiteNoiseSource.buffer = buffer
  whiteNoiseSource.loop = true
  whiteNoiseSource.connect(gainNode)
  whiteNoiseSource.start()
}

function startHowl(src: string, volume: number) {
  howlInstance = new Howl({
    src: [src],
    loop: true,
    volume,
    html5: false,
    onloaderror: () => {
      // File missing — fail silently, store resets to silence
      useAudioStore.getState()._handleLoadError()
    },
  })
  howlInstance.play()
}

function setEngineVolume(volume: number) {
  howlInstance?.volume(volume)
  if (gainNode) gainNode.gain.value = volume
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
  /** Internal — called when a file fails to load */
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
    stopAll()
    set({ soundId: 'silence', isPlaying: false })
    savePrefs({ ambientSound: 'silence' })
  },
}))

function startSound(id: SoundId, volume: number) {
  stopAll()
  if (id === 'silence') return
  if (id === 'white-noise') {
    startWhiteNoise(volume)
    return
  }
  // File-based sounds
  const srcMap: Record<string, string> = {
    rain:   '/audio/rain.mp3',
    forest: '/audio/forest.mp3',
    ocean:  '/audio/ocean.mp3',
    bowls:  '/audio/bowls.mp3',
  }
  const src = srcMap[id]
  if (src) startHowl(src, volume)
}
