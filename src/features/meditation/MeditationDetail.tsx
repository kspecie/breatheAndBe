import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { getMeditationById } from '../../data/meditations'
import { Card } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'

const CATEGORY_LABELS: Record<string, string> = {
  sleep: 'Sleep',
  stress: 'Stress Relief',
  focus: 'Focus',
  morning: 'Morning',
  'body-scan': 'Body Scan',
}

export function MeditationDetail() {
  const { meditationId } = useParams<{ meditationId: string }>()
  const navigate = useNavigate()
  const meditation = getMeditationById(meditationId ?? '')

  if (!meditation) {
    return (
      <div className="p-6 text-center">
        <p className="text-[#8C6E5B] mb-4">Meditation not found.</p>
        <Button variant="ghost" onClick={() => navigate('/meditate')}>
          Back to library
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 pb-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/meditate')}
        className="flex items-center gap-1 text-[#8C6E5B] hover:text-[#C47B3A] transition-colors w-fit -ml-1"
        aria-label="Back to meditation library"
      >
        <ChevronLeft size={20} strokeWidth={2} />
        <span className="text-sm font-semibold">Meditate</span>
      </button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#3D2B1F]">{meditation.title}</h1>
        <p className="text-sm text-[#C47B3A] font-mono mt-1">
          {meditation.durationMinutes} minutes
        </p>
        <div className="mt-2">
          <Badge variant="category">{CATEGORY_LABELS[meditation.category] ?? meditation.category}</Badge>
        </div>
      </div>

      {/* Description */}
      <Card className="p-5">
        <p className="text-[#3D2B1F] leading-relaxed">{meditation.description}</p>
      </Card>

      {/* Session info */}
      <Card className="p-5">
        <p className="text-xs font-semibold text-[#8C6E5B] uppercase tracking-wider mb-4">
          What to expect
        </p>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-[#C47B3A]">{meditation.durationMinutes}</span>
            <span className="text-xs text-[#8C6E5B]">minutes</span>
          </div>
          <div className="h-8 w-px bg-[#E8A87C]/30" />
          <div className="flex flex-col gap-1">
            <span className="text-sm text-[#3D2B1F]">
              Guided narration available via text toggle
            </span>
            <span className="text-xs text-[#8C6E5B]">
              Default view shows a timer — show text anytime
            </span>
          </div>
        </div>
      </Card>

      {/* Begin button */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={() => navigate(`/meditate/session/${meditation.id}`)}
      >
        Begin
      </Button>
    </div>
  )
}
