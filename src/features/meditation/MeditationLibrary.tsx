import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { meditations } from '../../data/meditations'
import { Card } from '../../components/Card'
import { Badge } from '../../components/Badge'

const CATEGORY_LABELS: Record<string, string> = {
  sleep: 'Sleep',
  stress: 'Stress Relief',
  focus: 'Focus',
  morning: 'Morning',
  'body-scan': 'Body Scan',
}

export function MeditationLibrary() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-5 p-6">
      <h1 className="text-2xl font-bold text-[#3D2B1F]">Meditate</h1>

      <div className="flex flex-col gap-3">
        {meditations.map((meditation) => (
          <Card
            key={meditation.id}
            onClick={() => navigate(`/meditate/${meditation.id}`)}
            className="p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-[#3D2B1F]">{meditation.title}</span>
                  <span className="text-xs text-[#8C6E5B]/60 font-mono">
                    {meditation.durationMinutes} min
                  </span>
                </div>
                <div className="mb-2">
                  <Badge variant="category">
                    {CATEGORY_LABELS[meditation.category] ?? meditation.category}
                  </Badge>
                </div>
                <p className="text-sm text-[#8C6E5B] leading-snug line-clamp-2">
                  {meditation.description}
                </p>
              </div>
              <ChevronRight size={18} strokeWidth={2} className="text-[#8C6E5B]/40 shrink-0" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
