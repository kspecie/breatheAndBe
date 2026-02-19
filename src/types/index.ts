// Breathing pattern definition
export interface BreathingPattern {
  id: string
  name: string
  description: string
  phases: {
    inhale: number
    holdIn: number
    exhale: number
    holdOut: number
  }
  benefit: string
  durationOptions: number[] // minutes
}

// Meditation content
export interface Meditation {
  id: string
  title: string
  category: 'sleep' | 'anxiety' | 'morning' | 'body-scan' | 'self-compassion'
  durationMinutes: number
  description: string
  paragraphs: { text: string; durationSeconds: number }[]
}

// Session history entry
export interface SessionEntry {
  id: string
  type: 'breathing' | 'meditation'
  contentId: string
  durationSeconds: number
  completedAt: string // ISO 8601
}
