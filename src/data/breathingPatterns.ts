import type { BreathingPattern } from '../types'

export const breathingPatterns: BreathingPattern[] = [
  {
    id: 'box',
    name: 'Box Breathing',
    description:
      'A simple, balanced pattern used by Navy SEALs and athletes to calm the nervous system and sharpen focus under pressure.',
    phases: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 },
    benefit: 'Stress relief & focus',
    durationOptions: [3, 5, 10, 15],
  },
  {
    id: '478',
    name: '4-7-8 Breathing',
    description:
      'Developed by Dr. Andrew Weil, this pattern acts as a natural tranquilliser for the nervous system — ideal before sleep or during acute anxiety.',
    phases: { inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 },
    benefit: 'Anxiety & sleep onset',
    durationOptions: [3, 5, 10, 15],
  },
  {
    id: 'calm',
    name: 'Calm Breath',
    description:
      'A gentle, extended exhale pattern that activates the parasympathetic nervous system. Great for everyday stress relief.',
    phases: { inhale: 4, holdIn: 0, exhale: 6, holdOut: 0 },
    benefit: 'General relaxation',
    durationOptions: [3, 5, 10, 15],
  },
  // {
  //   id: 'tactical',
  //   name: 'Tactical Breathing',
  //   description:
  //     'A military-grade grounding technique for high-stress moments. Identical rhythm to box breathing, emphasising controlled breath and mental clarity.',
  //   phases: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 },
  //   benefit: 'High-stress grounding',
  //   durationOptions: [3, 5, 10, 15],
  // },
  {
    id: 'slow',
    name: 'Slow Breath',
    description:
      'Gentle, equal-length breathing that slows the breath to around 6 breaths per minute — the sweet spot for heart rate variability and nervous system reset.',
    phases: { inhale: 5, holdIn: 0, exhale: 5, holdOut: 0 },
    benefit: 'Nervous system reset',
    durationOptions: [3, 5, 10, 15],
  },
  {
    id: 'tranquility',
    name: 'Tranquility',
    description:
      'An extended exhale pattern designed to bring deep, sustained calm. Perfect for winding down after a demanding day.',
    phases: { inhale: 6, holdIn: 0, exhale: 8, holdOut: 0 },
    benefit: 'Deep calm',
    durationOptions: [3, 5, 10, 15],
  },
]

export function getPatternById(id: string): BreathingPattern | undefined {
  return breathingPatterns.find((p) => p.id === id)
}
