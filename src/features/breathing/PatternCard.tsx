import { ChevronRight } from 'lucide-react'
import { Card } from '../../components/Card'
import { Badge } from '../../components/Badge'
import type { BreathingPattern } from '../../types'

interface PatternCardProps {
  pattern: BreathingPattern
  onClick: () => void
}

function rhythmString(phases: BreathingPattern['phases']): string {
  return [phases.inhale, phases.holdIn, phases.exhale, phases.holdOut]
    .map((n) => (n === 0 ? '0' : String(n)))
    .join(' · ')
}

export function PatternCard({ pattern, onClick }: PatternCardProps) {
  return (
    <Card onClick={onClick} className="p-4">
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#3D2B1F]">{pattern.name}</p>
          <p className="text-sm text-[#C47B3A] font-mono mt-0.5">
            {rhythmString(pattern.phases)}
          </p>
          <div className="mt-2">
            <Badge variant="category">{pattern.benefit}</Badge>
          </div>
        </div>
        <ChevronRight size={18} className="text-[#8C6E5B] flex-shrink-0" />
      </div>
    </Card>
  )
}
