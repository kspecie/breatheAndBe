import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { getPatternById } from '../../data/breathingPatterns'
import { primeGuideAudio } from '../../hooks/useBreathingGuide'
import { Card } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { AmbientSoundPicker } from '../../components/AmbientSoundPicker'
import type { BreathingPattern } from '../../types'

const PHASE_LABELS: Array<{ key: keyof BreathingPattern['phases']; label: string }> = [
  { key: 'inhale', label: 'Inhale' },
  { key: 'holdIn', label: 'Hold' },
  { key: 'exhale', label: 'Exhale' },
  { key: 'holdOut', label: 'Hold' },
]

function rhythmString(phases: BreathingPattern['phases']): string {
  return [phases.inhale, phases.holdIn, phases.exhale, phases.holdOut]
    .map(String)
    .join(' · ')
}

export function PatternDetail() {
  const { patternId } = useParams<{ patternId: string }>()
  const navigate = useNavigate()
  const pattern = getPatternById(patternId ?? '')
  const [selectedDuration, setSelectedDuration] = useState(5)

  if (!pattern) {
    return (
      <div className="p-6 text-center">
        <p className="text-[#8C6E5B] mb-4">Pattern not found.</p>
        <Button variant="ghost" onClick={() => navigate('/breathe')}>
          Back to library
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 pb-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/breathe')}
        className="flex items-center gap-1 text-[#8C6E5B] hover:text-[#C47B3A] transition-colors w-fit -ml-1"
        aria-label="Back to breathing library"
      >
        <ChevronLeft size={20} strokeWidth={2} />
        <span className="text-sm font-semibold">Breathing</span>
      </button>

      {/* Pattern header */}
      <div>
        <h1 className="text-2xl font-bold text-[#3D2B1F]">{pattern.name}</h1>
        <p className="text-sm text-[#C47B3A] font-mono mt-1">
          {rhythmString(pattern.phases)}
        </p>
        <div className="mt-2">
          <Badge variant="category">{pattern.benefit}</Badge>
        </div>
      </div>

      {/* Description */}
      <Card className="p-5">
        <p className="text-[#3D2B1F] leading-relaxed">{pattern.description}</p>
      </Card>

      {/* Rhythm breakdown */}
      <Card className="p-5">
        <p className="text-xs font-semibold text-[#8C6E5B] uppercase tracking-wider mb-4">
          Rhythm breakdown
        </p>
        <div className="grid grid-cols-4 gap-2">
          {PHASE_LABELS.map(({ key, label }) => {
            const value = pattern.phases[key]
            const isActive = value > 0
            return (
              <div key={key} className="flex flex-col items-center gap-1">
                <span className="text-xs text-[#8C6E5B]">{label}</span>
                <span
                  className={`text-2xl font-bold ${
                    isActive ? 'text-[#C47B3A]' : 'text-[#8C6E5B]/40'
                  }`}
                >
                  {isActive ? value : '—'}
                </span>
                <span className="text-xs text-[#8C6E5B]/60">
                  {isActive ? 'sec' : ''}
                </span>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Duration selector */}
      <div>
        <p className="text-sm font-semibold text-[#8C6E5B] uppercase tracking-wider mb-3">
          Session length
        </p>
        <div className="flex gap-2">
          {pattern.durationOptions.map((mins) => (
            <button
              key={mins}
              onClick={() => setSelectedDuration(mins)}
              className={[
                'flex-1 py-2.5 rounded-full text-sm font-semibold transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C47B3A] focus-visible:ring-offset-2',
                selectedDuration === mins
                  ? 'bg-[#E8A87C] text-white'
                  : 'bg-transparent border border-[#E8A87C] text-[#C47B3A] hover:bg-[#E8A87C]/10',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-pressed={selectedDuration === mins}
            >
              {mins} min
            </button>
          ))}
        </div>
      </div>

      {/* Sound selector */}
      <div>
        <p className="text-sm font-semibold text-[#8C6E5B] uppercase tracking-wider mb-3">
          Sound
        </p>
        <AmbientSoundPicker showVolume={false} />
      </div>

      {/* Start button */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={() => {
          primeGuideAudio()
          navigate(
            `/breathe/session/${pattern.id}?duration=${selectedDuration}`
          )
        }}
      >
        Start session
      </Button>
    </div>
  )
}
