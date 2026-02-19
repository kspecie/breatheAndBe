export type SoundId = 'silence' | 'white-noise' | 'guided' | 'rain' | 'forest' | 'ocean' | 'bowls'

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
  { id: 'guided',      label: 'Guided Tones',  emoji: '🎶', src: null },
  { id: 'rain',        label: 'Rain',          emoji: '🌧️', src: null },
  { id: 'forest',      label: 'Forest',        emoji: '🌲', src: null },
  { id: 'ocean',       label: 'Ocean Waves',   emoji: '🌊', src: null },
  { id: 'bowls',       label: 'Tibetan Bowls', emoji: '🎵', src: null },
]

export function getSoundById(id: SoundId): AmbientSound {
  return ambientSounds.find((s) => s.id === id) ?? ambientSounds[0]
}
