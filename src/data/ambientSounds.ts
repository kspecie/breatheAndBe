export type SoundId = 'silence' | 'white-noise' | 'rain' | 'forest' | 'ocean' | 'bowls'

export interface AmbientSound {
  id: SoundId
  label: string
  emoji: string
  /** null = generated in-browser (silence or white noise) */
  src: string | null
}

export const ambientSounds: AmbientSound[] = [
  { id: 'silence',     label: 'Silence',       emoji: '🔇', src: null },
  { id: 'white-noise', label: 'White Noise',   emoji: '🌬️', src: null },
  { id: 'rain',        label: 'Rain',          emoji: '🌧️', src: '/audio/rain.mp3' },
  { id: 'forest',      label: 'Forest',        emoji: '🌲', src: '/audio/forest.mp3' },
  { id: 'ocean',       label: 'Ocean Waves',   emoji: '🌊', src: '/audio/ocean.mp3' },
  { id: 'bowls',       label: 'Tibetan Bowls', emoji: '🎵', src: '/audio/bowls.mp3' },
]

export function getSoundById(id: SoundId): AmbientSound {
  return ambientSounds.find((s) => s.id === id) ?? ambientSounds[0]
}
